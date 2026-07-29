// DC-3 · Tool use de DC — catálogo de herramientas + ejecución server-side.
// Server-only. Patrón "propose → confirm": el modelo PROPONE (prepareProposal),
// el usuario confirma en el panel, y recién ahí el servidor EJECUTA (executeTool).
// Toda ejecución pasa por el cliente RLS del usuario o por server actions con sus
// propios guards → la confirmación del cliente no puede escalar permisos.

import { createClient } from "@/lib/supabase/server";
import { generateDiscLink, sendTeamInvite } from "@/app/(dashboard)/equipo/actions";
import type { ToolSpec } from "@/lib/ai";

// ── Catálogo expuesto al modelo (solo para arquitectos) ───────────────────
export const DC_TOOL_SPECS: ToolSpec[] = [
  {
    name: "generar_link_disc",
    description:
      "Genera el link del test DISC para un colaborador del equipo y lo devuelve para compartir. " +
      "Consume 1 crédito de la empresa (reusar un test pendiente no cobra). Usala cuando el líder " +
      "quiere que alguien de su equipo haga (o rehaga) el test DISC.",
    parameters: {
      type: "object",
      properties: {
        colaborador: {
          type: "string",
          description: "Nombre (o parte del nombre) del colaborador del equipo, tal como figura en la app.",
        },
      },
      required: ["colaborador"],
    },
  },
  {
    name: "crear_tarea",
    description:
      "Crea una tarea de delegación (Pase de Estafeta) con los 5 puntos del método y, opcionalmente, " +
      "la asigna a un colaborador. Pedí los 5 puntos si faltan; no inventes contenido.",
    parameters: {
      type: "object",
      properties: {
        colaborador: {
          type: "string",
          description: "Nombre del colaborador a quien asignar la tarea. Omitilo si la tarea queda sin asignar.",
        },
        que: { type: "string", description: "QUÉ está hecho: la definición de terminado (Definition of Done)." },
        porque: { type: "string", description: "POR QUÉ importa: el contexto y el resultado esperado." },
        como: { type: "string", description: "CÓMO y con qué: restricciones, recursos, límites." },
        cuando: {
          type: "string",
          description: "CUÁNDO: fecha/hora límite. Formato ISO (ej. 2026-07-15T17:00) o fecha clara.",
        },
        chequeo: { type: "string", description: "CHEQUEO: cuándo y cómo se revisa el avance (loop de control)." },
      },
      required: ["que", "porque", "como", "cuando", "chequeo"],
    },
  },
  {
    name: "invitar_colaborador",
    description:
      "Envía una invitación por email para sumar a una persona al equipo como colaborador. " +
      "Usala cuando el líder quiere incorporar a alguien nuevo.",
    parameters: {
      type: "object",
      properties: {
        email: { type: "string", description: "Email de la persona a invitar." },
      },
      required: ["email"],
    },
  },
];

const TOOL_NAMES = new Set(DC_TOOL_SPECS.map((t) => t.name));
export const isToolName = (name: string): boolean => TOOL_NAMES.has(name);

// ── Tipos de la propuesta (viaja al cliente y vuelve en el confirm) ───────
export type ToolProposal = {
  tool: string;
  /** Args ya enriquecidos/resueltos (ej. profileId). Re-validados al ejecutar. */
  args: Record<string, unknown>;
  /** Título corto para la tarjeta de confirmación. */
  title: string;
  /** Renglones "campo: valor" para que el líder revise antes de confirmar. */
  details: { label: string; value: string }[];
};

export type PrepareResult =
  | { kind: "proposal"; proposal: ToolProposal }
  | { kind: "error"; message: string };

export type ToolExecResult = { ok: boolean; message: string };

// ── Helpers ───────────────────────────────────────────────────────────────
const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

type Member = { id: string; full_name: string | null };

/** Resuelve un nombre → un colaborador único de la empresa del usuario actual (RLS). */
async function resolveMember(
  name: string
): Promise<{ ok: true; member: Member } | { ok: false; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Tu sesión expiró." };

  const { data: me } = await supabase.from("profiles").select("company_id").eq("id", user.id).single();
  if (!me?.company_id) return { ok: false, message: "No tenés una empresa asociada." };

  const { data: rows } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("company_id", me.company_id)
    .ilike("full_name", `%${name}%`);

  const matches = (rows ?? []) as Member[];
  if (matches.length === 0) {
    return { ok: false, message: `No encontré a "${name}" en tu equipo. ¿Querés revisar el nombre?` };
  }
  if (matches.length > 1) {
    // Desempate por coincidencia exacta (case-insensitive).
    const exact = matches.filter((m) => (m.full_name ?? "").toLowerCase() === name.toLowerCase());
    if (exact.length === 1) return { ok: true, member: exact[0] };
    const names = matches.map((m) => m.full_name ?? "—").join(", ");
    return { ok: false, message: `Hay varias personas que coinciden con "${name}": ${names}. ¿A cuál te referís?` };
  }
  return { ok: true, member: matches[0] };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseDeadline(raw: string): string | null {
  const t = Date.parse(raw);
  if (Number.isNaN(t)) return null;
  return new Date(t).toISOString();
}

// ── Fase 1: PREPARAR la propuesta (resuelve nombres, arma la tarjeta) ──────
export async function prepareProposal(
  name: string,
  rawArgs: Record<string, unknown>
): Promise<PrepareResult> {
  switch (name) {
    case "generar_link_disc": {
      const who = str(rawArgs.colaborador);
      if (!who) return { kind: "error", message: "¿Para quién genero el link DISC?" };
      const r = await resolveMember(who);
      if (!r.ok) return { kind: "error", message: r.message };
      return {
        kind: "proposal",
        proposal: {
          tool: name,
          args: { profileId: r.member.id, memberName: r.member.full_name ?? who },
          title: "Generar link del test DISC",
          details: [
            { label: "Colaborador", value: r.member.full_name ?? who },
            { label: "Costo", value: "1 crédito (reusar un test pendiente no cobra)" },
          ],
        },
      };
    }

    case "crear_tarea": {
      const que = str(rawArgs.que);
      const porque = str(rawArgs.porque);
      const como = str(rawArgs.como);
      const cuando = str(rawArgs.cuando);
      const chequeo = str(rawArgs.chequeo);
      const falta = [
        !que && "qué está hecho",
        !porque && "por qué importa",
        !como && "cómo/restricciones",
        !cuando && "cuándo (fecha límite)",
        !chequeo && "cómo se chequea",
      ].filter(Boolean);
      if (falta.length) {
        return { kind: "error", message: `Para armar el Pase de Estafeta me falta: ${falta.join(", ")}.` };
      }
      const deadline = parseDeadline(cuando);
      if (!deadline) {
        return { kind: "error", message: `No entendí la fecha límite "${cuando}". Pasámela como fecha (ej. 2026-07-15 17:00).` };
      }

      const args: Record<string, unknown> = {
        what_dod: que,
        why_context: porque,
        how_constraints: como,
        when_deadline: deadline,
        check_loop: chequeo,
      };
      const details = [
        { label: "Qué", value: que },
        { label: "Por qué", value: porque },
        { label: "Cómo", value: como },
        { label: "Cuándo", value: new Date(deadline).toLocaleString("es-AR") },
        { label: "Chequeo", value: chequeo },
      ];

      const who = str(rawArgs.colaborador);
      if (who) {
        const r = await resolveMember(who);
        if (!r.ok) return { kind: "error", message: r.message };
        args.assigned_to = r.member.id;
        details.unshift({ label: "Asignar a", value: r.member.full_name ?? who });
      } else {
        details.unshift({ label: "Asignar a", value: "Sin asignar" });
      }

      return { kind: "proposal", proposal: { tool: name, args, title: "Crear tarea (Pase de Estafeta)", details } };
    }

    case "invitar_colaborador": {
      const email = str(rawArgs.email).toLowerCase();
      if (!EMAIL_RE.test(email)) return { kind: "error", message: "Necesito un email válido para enviar la invitación." };
      return {
        kind: "proposal",
        proposal: {
          tool: name,
          args: { email },
          title: "Invitar colaborador al equipo",
          details: [{ label: "Email", value: email }],
        },
      };
    }

    default:
      return { kind: "error", message: "Esa acción no está disponible." };
  }
}

// ── Fase 2: EJECUTAR (tras confirmación del usuario) ──────────────────────
export async function executeTool(
  tool: string,
  args: Record<string, unknown>,
  origin: string
): Promise<ToolExecResult> {
  switch (tool) {
    case "generar_link_disc": {
      const profileId = str(args.profileId);
      const memberName = str(args.memberName) || "el colaborador";
      if (!profileId) return { ok: false, message: "Faltó identificar al colaborador." };
      const r = await generateDiscLink(profileId);
      if (!r.ok) {
        if (r.error === "sin_creditos") {
          return { ok: false, message: "La empresa no tiene créditos disponibles. Pedí una recarga para generar links DISC." };
        }
        if (r.error === "no_autorizado") {
          return { ok: false, message: "Solo el Arquitecto puede generar links DISC." };
        }
        return { ok: false, message: "No pude generar el link DISC. Probá de nuevo." };
      }
      const link = `${origin}/disc/${r.token}`;
      return { ok: true, message: `✅ Listo. Link DISC para **${memberName}**:\n\n${link}\n\nCompartíselo para que complete el test.` };
    }

    case "crear_tarea": {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { ok: false, message: "Tu sesión expiró." };
      const { data: me } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .single();
      if (!me?.company_id) return { ok: false, message: "No tenés una empresa asociada." };

      const assignedTo = str(args.assigned_to) || null;
      const { error } = await supabase.from("tasks").insert({
        company_id: me.company_id,
        created_by: user.id,
        assigned_to: assignedTo,
        what_dod: str(args.what_dod),
        why_context: str(args.why_context),
        how_constraints: str(args.how_constraints),
        when_deadline: str(args.when_deadline),
        check_loop: str(args.check_loop),
        status: "pending",
      });
      if (error) {
        console.error("DC crear_tarea:", error.message);
        return { ok: false, message: "No pude crear la tarea (puede que solo el Arquitecto pueda). Probá de nuevo." };
      }
      return { ok: true, message: "✅ Tarea creada y lista en Delegación. ¿Querés avisarle al colaborador o crear otra?" };
    }

    case "invitar_colaborador": {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { ok: false, message: "Tu sesión expiró." };
      const { data: me } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .single();
      if (!me?.company_id) return { ok: false, message: "No tenés una empresa asociada." };

      const email = str(args.email).toLowerCase();
      const r = await sendTeamInvite({ email, companyId: me.company_id, origin });
      if (!r.ok) return { ok: false, message: r.error };
      if (r.via === "manual") {
        return { ok: true, message: `Generé la invitación pero el envío automático no está disponible. Pasale este link:\n\n${r.link}` };
      }
      // El link va también cuando el email salió bien: si no llega (spam, filtro
      // corporativo), el Arquitecto ya lo tiene a mano y no queda sin salida (§K1).
      return {
        ok: true,
        message: `✅ Invitación enviada a **${email}**. Cuando acepte y complete su perfil, aparece en Mi Equipo.\n\nSi no le llega, pasale este link directo:\n\n${r.link}`,
      };
    }

    default:
      return { ok: false, message: "Esa acción no está disponible." };
  }
}
