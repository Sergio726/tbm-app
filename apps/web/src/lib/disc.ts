// =============================================================
// DISC — Base de conocimiento canónica del módulo Mi Equipo (M3)
// Fuente: DISC_HALLAZGOS.md, HALLAZGOS_FASE1.md, HALLAZGOS_BORRADOR_DILIO.md
// =============================================================

import { DISC_PROFILES_FULL, type DiscProfile } from "./disc-evaluator";
import { TBM_DISC_CRUCES } from "./tbm-disc-context";

export type DiscLetter = "D" | "I" | "S" | "C";

// ── Colores por factor DISC (TBM_ClaudeDesign_Draft) ─────────
export const DISC_COLORS: Record<DiscLetter, string> = {
  D: "#f87171", // rojo
  I: "#fbbf24", // amarillo
  S: "#34d399", // verde
  C: "#5b8aff", // azul
};

// ── Nombre canónico de cada estilo DISC (TBM 4 de Dilio) ─────
// Nombres del método: D=Dominante, I=Influyente, S=Seguro, C=Pensador.
// Pensado para explicar el modelo a quien NO lo conoce (intro del test,
// glosario del resultado). Cada letra responde una pregunta del comportamiento.
export const DISC_DIMENSIONS: Record<
  DiscLetter,
  { name: string; question: string; plain: string }
> = {
  D: {
    name: "Dominante",
    question: "¿Cómo enfrentás problemas y desafíos?",
    plain: "Empuje, decisión y foco en resultados.",
  },
  I: {
    name: "Influyente",
    question: "¿Cómo te relacionás e influís en los demás?",
    plain: "Comunicación, entusiasmo y conexión con la gente.",
  },
  S: {
    name: "Seguro",
    question: "¿Cómo respondés al ritmo y a los cambios?",
    plain: "Constancia, paciencia y trabajo sostenido.",
  },
  C: {
    name: "Pensador",
    question: "¿Cómo respondés a las reglas y al detalle?",
    plain: "Precisión, análisis y calidad.",
  },
};

// ── Atributos cortos + ejes por estilo (modelo de 4 cuadrantes) ──
// Para la gráfica "Modelo DISC" del Perfil DISC. Naming canónico de la app
// (D Dominante · I Influyente · S Seguro · C Pensador). Ejes:
//   vertical: Extrovertido (Activo) ↔ Introvertido (Reflexivo)
//   horizontal: Orientado a tareas ↔ Orientado a personas
export type DiscQuadrant = {
  energy: "Extrovertido" | "Introvertido";
  focus: "Tareas" | "Personas";
  attrs: string[]; // 4 atributos comportamentales
};
export const DISC_ATTRS: Record<DiscLetter, DiscQuadrant> = {
  D: {
    energy: "Extrovertido",
    focus: "Tareas",
    attrs: ["Decisiones rápidas", "Competitivo", "Orientado a resultados", "Le gustan los desafíos"],
  },
  I: {
    energy: "Extrovertido",
    focus: "Personas",
    attrs: ["Sociable y comunicativo", "Entusiasta", "Persuasivo", "Optimista"],
  },
  S: {
    energy: "Introvertido",
    focus: "Personas",
    attrs: ["Paciente", "Leal", "Colaborador", "Busca estabilidad"],
  },
  C: {
    energy: "Introvertido",
    focus: "Tareas",
    attrs: ["Analítico", "Preciso", "Organizado", "Orientado a la calidad"],
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
    temor: "Abuso de confianza — sentirse usado sin reconocimiento.",
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
    temor: "El rechazo — sentirse ignorado o minimizado.",
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
    temor: "La no aprobación — la inestabilidad lo paraliza.",
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
    temor: "La crítica sin fundamento — lo cierra y deja de aportar.",
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

// Segmento DISC (escala 1–7) → porcentaje 0–100. Fórmula ÚNICA en toda la app
// (informe público, informe del Arquitecto y mapa de equipo) para que el mismo
// segmento se dibuje con el mismo largo en todos lados. 1 → 0%, 4 → 50%, 7 → 100%.
export function segToPct(seg: number | null | undefined): number {
  const v = typeof seg === "number" ? seg : 4;
  return Math.max(0, Math.min(100, Math.round(((v - 1) / 6) * 100)));
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

// ── Niveles de Delegación (N1–N5, S6 — confirmado por Dilio I5) ───────────────
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
  alta: { label: "Alta", action: "Mantener", color: "var(--success-text)" },
  media: { label: "Media", action: "Desarrollar", color: "var(--warn-text)" },
  baja: { label: "Baja", action: "Reubicar", color: "var(--danger-text)" },
};

// ── Estados del informe DISC ─────────────────────────────────
export const DISC_STATUS_LABEL: Record<string, string> = {
  pendiente: "DISC pendiente",
  enviado: "Test enviado",
  completado: "Informe completo",
};

// ── Próximos pasos por factor (acciones para la propia persona) ──
// Derivados del "cómo gestionarlo" / "más eficaz si" de cada perfil.
export const DISC_ACTION_STEPS: Record<DiscLetter, string[]> = {
  D: [
    "Antes de acelerar, escuchá una opinión distinta a la tuya.",
    "Comunicá el “por qué” de tus decisiones, no solo el “qué”.",
    "Bajá un cambio el ritmo para que el equipo pueda seguirte.",
  ],
  I: [
    "Aterrizá tus ideas en compromisos concretos y con fecha.",
    "Hacé seguimiento de lo que arrancás hasta cerrarlo.",
    "Cuidá el detalle: revisá antes de dar algo por hecho.",
  ],
  S: [
    "Animate a proponer mejoras, no solo a sostener lo que ya hay.",
    "Practicá adaptarte a un cambio chico por semana.",
    "Compartí más tu conocimiento con el resto del equipo.",
  ],
  C: [
    "Poné un límite de tiempo al análisis y decidí con lo que tenés.",
    "Dá una recomendación clara, no solo datos.",
    "Confiá más en tu criterio y expresá tu postura.",
  ],
};

// ── Recomendaciones de liderazgo (para quien lidera a esta persona) ──
export type LeadershipTips = {
  delegar: string;
  motivar: string;
  feedback: string;
  friccion: string;
};
export const DISC_LEADERSHIP_TIPS: Record<DiscLetter, LeadershipTips> = {
  D: {
    delegar: "Dale objetivos y autonomía sobre el “cómo”; no microgestiones.",
    motivar: "Reconocé resultados y dale retos con impacto visible.",
    feedback: "Directo y al punto; enfocá en el resultado, no en la persona.",
    friccion: "No lo confrontes de frente; mostrale el costo de su conducta en la meta.",
  },
  I: {
    delegar: "Dale visibilidad y gente; cerrá vos los detalles y plazos.",
    motivar: "Reconocé en público; sumalo a iniciativas con exposición.",
    feedback: "Empezá por lo positivo; convertí sus ideas en compromisos medibles.",
    friccion: "Evitá el reproche público; reencauzá con entusiasmo hacia el foco.",
  },
  S: {
    delegar: "Dale procesos estables y tiempo para adaptarse.",
    motivar: "Valorá su constancia; dale seguridad y previsibilidad.",
    feedback: "Tranquilo y en privado; anticipá los cambios con claridad.",
    friccion: "No impongas cambios bruscos; explicá el porqué y acompañá la transición.",
  },
  C: {
    delegar: "Dale criterios y estándares claros; evitá la ambigüedad.",
    motivar: "Valorá su precisión; dale problemas que exijan calidad.",
    feedback: "Con datos y argumentos; pedile una recomendación concreta con plazo.",
    friccion: "No lo apures sin contexto; dale información y un tiempo razonable.",
  },
};

// ── Detector de Cruces Peligrosos (combinaciones DISC del equipo) ──
export type Crossing = {
  titulo: string;
  detalle: string;
  sugerencia: string;
  severity: "alta" | "media";
};

// Recibe los miembros (con sus letras DISC) y devuelve alertas de equipo.
export function detectDangerousCrossings(
  members: { disc_letters: string | null }[]
): Crossing[] {
  const withDisc = members.filter((m) => primaryLetter(m.disc_letters));
  const total = withDisc.length;
  const count: Record<DiscLetter, number> = { D: 0, I: 0, S: 0, C: 0 };
  withDisc.forEach((m) => {
    const p = primaryLetter(m.disc_letters);
    if (p) count[p] += 1;
  });

  const out: Crossing[] = [];
  if (total < 2) return out;

  // Equipo homogéneo (todos el mismo estilo) absorbe las demás reglas: es la
  // lectura más completa del mismo problema, así no duplicamos alertas.
  const homogeneous = (Object.keys(count) as DiscLetter[]).find(
    (l) => count[l] >= 3 && count[l] === total
  );
  if (homogeneous) {
    out.push({
      titulo: `Equipo homogéneo (todos ${homogeneous})`,
      detalle: `Las ${total} personas con DISC comparten el estilo ${homogeneous} · ${DISC_DIMENSIONS[homogeneous].name}. Poca diversidad = puntos ciegos comunes.`,
      sugerencia: "Buscá complementariedad al sumar gente y cuidá los puntos ciegos típicos de ese estilo.",
      severity: "media",
    });
    return out;
  }

  if (count.D >= 2 && count.S === 0) {
    out.push({
      titulo: "Dominantes sin un Seguro",
      detalle: `Hay ${count.D} perfiles Dominantes (D) y ningún Seguro (S). El equipo acelera, pero nadie sostiene los procesos ni cuida el ritmo.`,
      sugerencia: "Sumá o desarrollá un perfil S, o asigná a un D el rol explícito de cuidar el ritmo y el clima.",
      severity: "alta",
    });
  }
  if (count.I >= 2 && count.C === 0) {
    out.push({
      titulo: "Influyentes sin un Pensador",
      detalle: `Hay ${count.I} perfiles Influyentes (I) y ningún Pensador (C). Mucha energía e ideas, poco detalle, control de calidad y seguimiento.`,
      sugerencia: "Asigná la revisión de detalle/calidad a alguien, o sumá un perfil C que aterrice y controle.",
      severity: "alta",
    });
  }
  if (count.D === 0 && count.I === 0 && count.S + count.C >= 2) {
    out.push({
      titulo: "Sin Motor ni Combustible",
      detalle: "El equipo es todo Seguro/Pensador, sin Dominantes (empuje) ni Influyentes (impulso). Riesgo de parálisis o de evitar decisiones.",
      sugerencia: "Definí quién toma decisiones rápidas y quién impulsa, o sumá un perfil D/I.",
      severity: "media",
    });
  }
  return out;
}

// ── Conexiones y fricciones DISC (B6) — relación PAR-A-PAR ───
// Canónico §4 / Sesión 2. Fuente de verdad: `TBM_DISC_CRUCES` (tbm-disc-context).
// Conexión natural: D↔C · I↔S · S↔C · I↔D · | Cruzado (requiere trabajo): D↔S · I↔C.
// Distinto de `detectDangerousCrossings()` (composición agregada del equipo).

const PAIR_ORDER: DiscLetter[] = ["D", "I", "S", "C"];

// Clave NO ordenada de un par de letras (orden canónico D,I,S,C). Ej: ("C","I") → "IC".
export function pairKey(a: DiscLetter, b: DiscLetter): string {
  return PAIR_ORDER.indexOf(a) <= PAIR_ORDER.indexOf(b) ? `${a}${b}` : `${b}${a}`;
}

// Parsea los strings "D↔S" de TBM_DISC_CRUCES a un set de claves no ordenadas.
function parseCrucePairs(list: readonly string[]): Set<string> {
  const out = new Set<string>();
  for (const s of list) {
    const ls = (s.toUpperCase().replace(/[^DISC]/g, "").split("") as DiscLetter[]);
    if (ls.length === 2) out.add(pairKey(ls[0], ls[1]));
  }
  return out;
}
const CRUZADOS = parseCrucePairs(TBM_DISC_CRUCES.cruzados);

export type PairRelation = "natural" | "cruzado";

// Relación entre dos estilos primarios. Mismo estilo = sin fricción de temperamento.
export function discPairRelation(a: DiscLetter, b: DiscLetter): PairRelation {
  if (a === b) return "natural";
  return CRUZADOS.has(pairKey(a, b)) ? "cruzado" : "natural";
}

// Copy del método por tipo de cruce (la fricción y cómo diseñarla, no microgestión).
export const DISC_CRUCE_INFO: Record<string, { friccion: string; sugerencia: string }> = {
  DS: {
    friccion:
      "El D empuja por velocidad y cambio; el S necesita estabilidad y tiempo para adaptarse. El ritmo del D activa la resistencia del S.",
    sugerencia:
      "Acordá un ritmo de cambio explícito: el D anticipa el porqué y da plazos; el S confirma qué necesita para sostener el proceso. Evitá cambios bruscos.",
  },
  IC: {
    friccion:
      "El I comunica con energía y visión general; el C pide datos, detalle y precisión. La espontaneidad del I choca con el rigor del C.",
    sugerencia:
      "Definí un protocolo: el I trae la idea con un mínimo de datos; el C revisa con criterios y plazo claros. Reconocé ambos aportes, no microgestiones.",
  },
};

export type PairCrossing = {
  pair: string; // clave canónica "IC"
  pairLabel: string; // "I↔C"
  names: string; // "Ana ↔ Beto"
  detalle: string;
  sugerencia: string;
  severity: "media";
};

// Detecta cruces de temperamento CRUZADO entre personas reales del equipo.
// (El caso "director C + varios I" produce una alerta por cada par C↔I.)
export function detectPairCrossings(
  members: { full_name: string | null; disc_letters: string | null }[]
): PairCrossing[] {
  const withDisc = members
    .map((m) => ({
      name: m.full_name?.trim() || "Sin nombre",
      letter: primaryLetter(m.disc_letters),
    }))
    .filter((m): m is { name: string; letter: DiscLetter } => m.letter != null);

  const out: PairCrossing[] = [];
  for (let i = 0; i < withDisc.length; i++) {
    for (let j = i + 1; j < withDisc.length; j++) {
      const A = withDisc[i];
      const B = withDisc[j];
      if (discPairRelation(A.letter, B.letter) !== "cruzado") continue;
      const key = pairKey(A.letter, B.letter);
      const info = DISC_CRUCE_INFO[key];
      out.push({
        pair: key,
        pairLabel: `${key[0]}↔${key[1]}`,
        names: `${A.name} ↔ ${B.name}`,
        detalle: info?.friccion ?? "Temperamentos cruzados: requieren trabajo de comunicación.",
        sugerencia: info?.sugerencia ?? "Acordá un protocolo de comunicación entre ambos perfiles.",
        severity: "media",
      });
    }
  }
  return out;
}

// Pares de estilos distintos presentes en el equipo (para resaltar en el diagrama).
export function presentPairKeys(members: { disc_letters: string | null }[]): Set<string> {
  const letters = members
    .map((m) => primaryLetter(m.disc_letters))
    .filter((l): l is DiscLetter => l != null);
  const set = new Set<string>();
  for (let i = 0; i < letters.length; i++) {
    for (let j = i + 1; j < letters.length; j++) {
      if (letters[i] !== letters[j]) set.add(pairKey(letters[i], letters[j]));
    }
  }
  return set;
}

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
