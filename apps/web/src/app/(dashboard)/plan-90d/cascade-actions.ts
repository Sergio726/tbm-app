"use server";

import { createServerClient } from "@/lib/supabase/server";

/**
 * Cascada de KPIs (S25 · §E1/§E2/§E5) — server actions.
 *
 * Dilio: *"el sistema tiene que **obligar** a que la persona describa claramente
 * a cada implicado cuáles son los indicadores con los que él aportaría al tema
 * general"*.
 *
 * Ese "obligar" acá **no es un juicio de IA** (eso es S24): son campos requeridos
 * y aritmética. Si la meta son 15 y los aportes suman 14, se dice. Es la única
 * validación no discutible del bloque.
 *
 * **Autogestión (§E5):** *"él también puede armar su propia estructura para
 * lograrlo… nosotros predicamos una cultura de autogestión"*. Por eso el
 * colaborador puede editar **su** aporte y **sus** actividades; el Arquitecto,
 * las de toda la empresa. El guard de abajo permite las dos cosas, y la RLS lo
 * respalda (no alcanza con validar acá: un cliente puede llamar a Supabase directo).
 */

type Ok = { ok: true };
type Err = { ok: false; error: string };

type GuardOk = {
  supabase: Awaited<ReturnType<typeof createServerClient>>;
  userId: string;
  companyId: string;
  isArquitecto: boolean;
};

/**
 * Resuelve quién llama y si puede tocar los datos de `ownerId`.
 * Unión discriminada por `error` para que TypeScript estreche bien en los callers.
 */
async function guard(ownerId?: string): Promise<GuardOk | { error: string }> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No hay sesión activa." };

  const { data: me } = await supabase
    .from("profiles")
    .select("role, company_id")
    .eq("id", user.id)
    .single();
  if (!me?.company_id) return { error: "Tu perfil no tiene empresa asociada." };

  const isArquitecto = me.role === "arquitecto";
  // Autogestión: el dueño puede lo suyo; el Arquitecto, lo de cualquiera.
  if (ownerId && ownerId !== user.id && !isArquitecto) {
    return { error: "Solo podés editar tus propios indicadores." };
  }

  return { supabase, userId: user.id, companyId: me.company_id, isArquitecto };
}

/** Define la meta medible de la Roca (el "5 clientes = $25.000" de Dilio). */
export async function setRockTarget(input: {
  rockId: string;
  targetValue: number | null;
  targetUnit: string;
  targetMoney: number | null;
}): Promise<Ok | Err> {
  const g = await guard();
  if ("error" in g) return { ok: false, error: g.error };
  // La meta de la Roca la define el líder: es el compromiso del trimestre.
  if (!g.isArquitecto) {
    return { ok: false, error: "Solo el Arquitecto define la meta de la Roca." };
  }

  for (const n of [input.targetValue, input.targetMoney]) {
    if (n != null && (!Number.isFinite(n) || n < 0)) {
      return { ok: false, error: "Los montos tienen que ser números positivos." };
    }
  }

  const { error } = await g.supabase
    .from("rocks")
    .update({
      target_value: input.targetValue,
      target_unit: input.targetUnit.trim() || null,
      target_money: input.targetMoney,
    })
    .eq("id", input.rockId)
    .eq("company_id", g.companyId);
  if (error) {
    console.error("setRockTarget:", error);
    return { ok: false, error: "No se pudo guardar la meta." };
  }
  return { ok: true };
}

/**
 * Asigna (o actualiza) el aporte de un responsable.
 *
 * `targetValue` es el compromiso de **todo el trimestre**, no una cuota mensual:
 * *"se puede dar que el primer mes no llegue a los 5… pero debe saber qué está
 * haciendo o no está haciendo para lograr el objetivo"*. El ritmo mensual se
 * deriva para mostrarlo (`derivePace`), no se guarda.
 */
export async function upsertContribution(input: {
  rockId: string;
  ownerId: string;
  targetValue: number;
  targetMoney: number | null;
  notes: string;
}): Promise<Ok | Err> {
  const g = await guard(input.ownerId);
  if ("error" in g) return { ok: false, error: g.error };

  if (!Number.isFinite(input.targetValue) || input.targetValue < 0) {
    return { ok: false, error: "El aporte tiene que ser un número positivo." };
  }

  // El responsable tiene que ser de la misma empresa (no se confía en el input).
  const { data: target } = await g.supabase
    .from("profiles")
    .select("company_id")
    .eq("id", input.ownerId)
    .single();
  if (target?.company_id !== g.companyId) {
    return { ok: false, error: "Ese responsable no pertenece a tu equipo." };
  }

  const { error } = await g.supabase.from("rock_contributions").upsert(
    {
      rock_id: input.rockId,
      company_id: g.companyId,
      owner_id: input.ownerId,
      target_value: input.targetValue,
      target_money: input.targetMoney,
      notes: input.notes.trim() || null,
    },
    { onConflict: "rock_id,owner_id" }
  );
  if (error) {
    console.error("upsertContribution:", error);
    return { ok: false, error: "No se pudo guardar el aporte." };
  }
  return { ok: true };
}

export async function removeContribution(input: { id: string }): Promise<Ok | Err> {
  const g = await guard();
  if ("error" in g) return { ok: false, error: g.error };
  // Borrar el compromiso es del líder: si el colaborador pudiera, la cascada
  // se vaciaría sola. Editarlo sí puede (autogestión).
  if (!g.isArquitecto) {
    return { ok: false, error: "Solo el Arquitecto puede quitar un responsable." };
  }

  const { error } = await g.supabase
    .from("rock_contributions")
    .delete()
    .eq("id", input.id)
    .eq("company_id", g.companyId);
  if (error) {
    console.error("removeContribution:", error);
    return { ok: false, error: "No se pudo quitar el aporte." };
  }
  return { ok: true };
}

/**
 * Agrega o edita una actividad del aporte ("tantas llamadas, tantas propuestas").
 * Es el nivel que S26 va a preguntar a diario: lo único que la persona controla.
 */
export async function upsertActivity(input: {
  id?: string;
  contributionId: string;
  ownerId: string;
  name: string;
  unit: string;
  weeklyTarget: number;
}): Promise<Ok | Err> {
  const g = await guard(input.ownerId);
  if ("error" in g) return { ok: false, error: g.error };

  if (!input.name.trim()) {
    return { ok: false, error: "La actividad necesita un nombre." };
  }
  if (!Number.isFinite(input.weeklyTarget) || input.weeklyTarget < 0) {
    return { ok: false, error: "La meta semanal tiene que ser un número positivo." };
  }

  const row = {
    contribution_id: input.contributionId,
    company_id: g.companyId,
    owner_id: input.ownerId,
    name: input.name.trim(),
    unit: input.unit.trim() || null,
    weekly_target: input.weeklyTarget,
  };

  const { error } = input.id
    ? await g.supabase.from("contribution_activities").update(row).eq("id", input.id)
    : await g.supabase.from("contribution_activities").insert(row);
  if (error) {
    console.error("upsertActivity:", error);
    return { ok: false, error: "No se pudo guardar la actividad." };
  }
  return { ok: true };
}

export async function removeActivity(input: { id: string }): Promise<Ok | Err> {
  const g = await guard();
  if ("error" in g) return { ok: false, error: g.error };

  // La actividad SÍ la puede borrar su dueño: es el "cómo" que eligió para
  // llegar, no el compromiso. La RLS ya lo limita a lo propio o, si es
  // Arquitecto, a su empresa.
  const { error } = await g.supabase
    .from("contribution_activities")
    .delete()
    .eq("id", input.id)
    .eq("company_id", g.companyId);
  if (error) {
    console.error("removeActivity:", error);
    return { ok: false, error: "No se pudo quitar la actividad." };
  }
  return { ok: true };
}
