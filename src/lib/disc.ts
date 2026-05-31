// =============================================================
// DISC — Base de conocimiento canónica del módulo Mi Equipo (M3)
// Fuente: DISC_HALLAZGOS.md, HALLAZGOS_FASE1.md, HALLAZGOS_BORRADOR_DILIO.md
// =============================================================

import { DISC_PROFILES_FULL, type DiscProfile } from "./disc-evaluator";

export type DiscLetter = "D" | "I" | "S" | "C";

// ── Colores por factor DISC (TBM_ClaudeDesign_Draft) ─────────
export const DISC_COLORS: Record<DiscLetter, string> = {
  D: "#f87171", // rojo
  I: "#fbbf24", // amarillo
  S: "#34d399", // verde
  C: "#5b8aff", // azul
};

// ── Significado de cada dimensión DISC ───────────────────────
// Pensado para explicar el modelo a quien NO lo conoce (intro del test,
// glosario del resultado). Cada letra responde una pregunta del comportamiento.
export const DISC_DIMENSIONS: Record<
  DiscLetter,
  { name: string; question: string; plain: string }
> = {
  D: {
    name: "Dominancia",
    question: "¿Cómo enfrentás problemas y desafíos?",
    plain: "Empuje, decisión y foco en resultados.",
  },
  I: {
    name: "Influencia",
    question: "¿Cómo te relacionás e influís en los demás?",
    plain: "Comunicación, entusiasmo y conexión con la gente.",
  },
  S: {
    name: "Estabilidad",
    question: "¿Cómo respondés al ritmo y a los cambios?",
    plain: "Constancia, paciencia y trabajo sostenido.",
  },
  C: {
    name: "Cumplimiento",
    question: "¿Cómo respondés a las reglas y al detalle?",
    plain: "Precisión, análisis y calidad.",
  },
};

// ── Perfil de cada factor dominante ──────────────────────────
// Nombres cortos = los de Dilio (Motor / Combustible / Chasis / Sensor).
// Luz/Sombra/temor/bajo presión/cómo gestionarlo = de los informes DISC reales.
export type DiscFactor = {
  letter: DiscLetter;
  shortName: string; // nombre TBM del rol funcional
  population: number; // % poblacional (Dilio S2)
  idealRoles: string[];
  luz: string[];
  sombra: string[];
  temor: string;
  underPressure: string; // qué hace bajo presión
  howToManage: string; // cómo gestionarlo el Arquitecto
};

export const DISC_FACTORS: Record<DiscLetter, DiscFactor> = {
  D: {
    letter: "D",
    shortName: "El Motor de la Ejecución",
    population: 3,
    idealRoles: ["Dirección", "Expansión", "Crisis"],
    luz: [
      "Moviliza, pone orden y marca el ritmo",
      "Decide rápido y exige resultados",
      "Presencia y carácter para liderar el cambio",
    ],
    sombra: [
      "Su fuerza se vuelve intimidante",
      "Cruza la línea entre liderar y controlar",
      "Impaciente con quien no sigue su ritmo",
    ],
    temor: "Perder posición, influencia o autoridad. Que lo perciban como débil.",
    underPressure: "Se endurece: más dominante, confrontativo, menos paciente.",
    howToManage: "No confrontes de frente; señalá el impacto de su conducta en el resultado.",
  },
  I: {
    letter: "I",
    shortName: "El Combustible del Equipo",
    population: 11,
    idealRoles: ["Ventas", "Marketing", "Cultura"],
    luz: [
      "Genera entusiasmo y energía en el equipo",
      "Red de contactos amplia, gran comunicador",
      "Inspira y conecta a las personas con el proyecto",
    ],
    sombra: [
      "Habla más de lo que ejecuta",
      "Disperso, le cuesta el detalle y el seguimiento",
      "Busca aprobación por encima del resultado",
    ],
    temor: "El rechazo social. Perder reconocimiento o ser ignorado.",
    underPressure: "Habla más, se dispersa y evita el conflicto con humor.",
    howToManage: "Reconocé en público; aterrizá sus ideas en compromisos concretos y medibles.",
  },
  S: {
    letter: "S",
    shortName: "El Chasis de la Empresa",
    population: 69,
    idealRoles: ["Operaciones", "Customer Success", "RRHH"],
    luz: [
      "Constancia, compromiso y confiabilidad",
      "Sostiene procesos sin presión externa",
      "Columna del equipo: avance sostenido",
    ],
    sombra: [
      "Resistencia al cambio",
      "Prefiere lo conocido aunque el contexto pida evolucionar",
      "Se cierra en su proceso, parece distante",
    ],
    temor: "Cambios abruptos. Perder el control sobre lo aprendido.",
    underPressure: "Mantiene la disciplina pero se cierra; por dentro busca estabilidad.",
    howToManage: "Dale estructura y tiempo para adaptarse; anticipá los cambios con claridad.",
  },
  C: {
    letter: "C",
    shortName: "El Sensor de Calidad",
    population: 17,
    idealRoles: ["Finanzas", "Legal", "Sistemas"],
    luz: [
      "Pensamiento crítico, precisión y exactitud",
      "Detecta errores e inconsistencias antes de que escalen",
      "Eleva la calidad y evita decisiones impulsivas",
    ],
    sombra: [
      "Sobreanálisis y parálisis por exceso de información",
      "Confunde excelencia con perfección",
      "No toma postura clara frente al equipo",
    ],
    temor: "Tomar decisiones incorrectas o con información incompleta.",
    underPressure: "Intensifica el análisis: busca más datos y validación antes de actuar.",
    howToManage: "Pedile una recomendación concreta con plazo; valorá su criterio explícitamente.",
  },
};

// ── 16 perfiles del sistema DISC de Dilio (evaluador HTML) ───
// Para derivar nombre + ícono a partir de las letras cuando no hay
// informe PDF personalizado.
export const DISC_SYSTEM_PROFILES: Record<string, { icon: string; name: string }> = {
  D: { icon: "🔥", name: "El Resolutivo" },
  C: { icon: "🔬", name: "El Perfeccionista" },
  DC: { icon: "💡", name: "El Creativo" },
  CD: { icon: "🔭", name: "El Investigador" },
  DI: { icon: "🏆", name: "Orientado a Resultados" },
  ID: { icon: "🤝", name: "El Persuasivo" },
  I: { icon: "📣", name: "El Promotor" },
  IS: { icon: "💬", name: "El Consejero" },
  SI: { icon: "✨", name: "El Alentador" },
  S: { icon: "🛠", name: "El Especialista" },
  SC: { icon: "🎖", name: "El Profesional" },
  CS: { icon: "🌿", name: "El Agente" },
  IC: { icon: "📊", name: "El Evaluador" },
  CI: { icon: "📊", name: "El Evaluador" },
};

// Normaliza "sc", "S-C", "S/C" → "SC"
export function normalizeLetters(raw: string | null | undefined): string {
  if (!raw) return "";
  return raw
    .toUpperCase()
    .replace(/[^DISC]/g, "")
    .slice(0, 2);
}

export function primaryLetter(raw: string | null | undefined): DiscLetter | null {
  const norm = normalizeLetters(raw);
  const first = norm[0] as DiscLetter | undefined;
  return first && first in DISC_FACTORS ? first : null;
}

// Devuelve { icon, name } del sistema para unas letras dadas.
export function systemProfile(raw: string | null | undefined): { icon: string; name: string } | null {
  const norm = normalizeLetters(raw);
  if (!norm) return null;
  return (
    DISC_SYSTEM_PROFILES[norm] ??
    DISC_SYSTEM_PROFILES[norm[0]] ??
    null
  );
}

// ── Niveles LOS (S6 — confirmado por Dilio I5) ───────────────
export type LosDef = { level: number; name: string; desc: string };
export const LOS_LEVELS: LosDef[] = [
  { level: 1, name: "Cadete", desc: "Ejecuta exactamente lo indicado. No improvisa." },
  { level: 2, name: "Investigador", desc: "Investiga opciones y las presenta. El líder decide." },
  { level: 3, name: "Recomendador", desc: "Analiza, recomienda y espera aprobación." },
  { level: 4, name: "Ejecutor", desc: "Decide y ejecuta. Solo informa qué hizo." },
  { level: 5, name: "Socio", desc: "Autonomía total. Solo reporta el resultado final." },
];

// ── Alineación rol ↔ perfil → acción (borrador Dilio) ────────
export type AlignmentValue = "alta" | "media" | "baja";
export const ALIGNMENT_ACTION: Record<AlignmentValue, { label: string; action: string; color: string }> = {
  alta: { label: "Alta", action: "Mantener", color: "#34d399" },
  media: { label: "Media", action: "Desarrollar", color: "#fbbf24" },
  baja: { label: "Baja", action: "Reubicar", color: "#f87171" },
};

// ── Estados del informe DISC ─────────────────────────────────
export const DISC_STATUS_LABEL: Record<string, string> = {
  pendiente: "DISC pendiente",
  enviado: "Test enviado",
  completado: "Informe completo",
};

// ── Perfiles canónicos del evaluador (fuente de verdad) ──────
// Re-exportados para que la UI consuma el contenido rico (luz/sombra/temor,
// tags, etc.) a partir del `disc_profile_key` calculado por el test.
export { DISC_PROFILES_FULL };
export type { DiscProfile };

// Devuelve el perfil completo del evaluador por su clave (ej. "Especialista").
export function profileByKey(key: string | null | undefined): DiscProfile | null {
  if (!key) return null;
  return DISC_PROFILES_FULL[key] ?? null;
}

// ── Alineación automática rol/área ↔ perfil DISC ─────────────
// Compara el área funcional de la persona (cargo) contra los `idealRoles`
// de su factor primario y secundario. Heurística por coincidencia textual:
//   primario coincide  → alta   (Mantener)
//   secundario coincide → media (Desarrollar)
//   coincide con otro factor (mal encaje) → baja (Reubicar)
//   sin datos suficientes → null (no se sugiere nada)
export function computeAlignment(
  area: string | null | undefined,
  letters: string | null | undefined
): AlignmentValue | null {
  const norm = (area ?? "").trim().toLowerCase();
  if (!norm) return null;

  const primary = primaryLetter(letters);
  if (!primary) return null;

  const roleMatches = (roles: string[]) =>
    roles.some((r) => {
      const rl = r.toLowerCase();
      return norm.includes(rl) || rl.includes(norm);
    });

  if (roleMatches(DISC_FACTORS[primary].idealRoles)) return "alta";

  const secondary = normalizeLetters(letters)[1] as DiscLetter | undefined;
  if (secondary && DISC_FACTORS[secondary] && roleMatches(DISC_FACTORS[secondary].idealRoles)) {
    return "media";
  }

  // ¿Su área encaja mejor con OTRO factor? Entonces hay desalineación.
  const fitsAnother = (Object.keys(DISC_FACTORS) as DiscLetter[]).some(
    (l) => l !== primary && roleMatches(DISC_FACTORS[l].idealRoles)
  );
  return fitsAnother ? "baja" : "media";
}
