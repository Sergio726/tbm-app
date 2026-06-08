import type { WorkbookProgress } from "@/types/database";

export type ExerciseType =
  | "diagnostic"
  | "checklist"
  | "text"
  | "text_group"
  | "disc_map"
  | "shadows"
  | "slider_group";

export type ExerciseIntegration =
  | "scorecards"
  | "profiles_disc"
  | "profiles_state"
  | "pre_games";

export interface SliderDef {
  key: string;
  label: string;
}

export interface ExerciseDef {
  key: string;
  title: string;
  description: string;
  type: ExerciseType;
  integration?: ExerciseIntegration;
  data?: {
    items?: string[];
    questions?: string[];
    sliders?: SliderDef[];
  };
}

export interface SessionDef {
  number: 1 | 2 | 3 | 4;
  title: string;
  subtitle: string;
  exercises: ExerciseDef[];
}

export const SESSIONS: SessionDef[] = [
  {
    number: 1,
    title: "Diagnóstico del Negocio",
    subtitle:
      "Evaluá el estado actual de tu empresa en 8 dimensiones críticas y definí tu plan de las primeras 2 semanas",
    exercises: [
      {
        key: "s1_diagnostico",
        title: "Diagnóstico de 8 Áreas",
        description:
          "Puntuá cada área de tu negocio del 1 al 5. Sé honesto — este diagnóstico es tu punto de partida y se guardará en el Dashboard.",
        type: "diagnostic",
        integration: "scorecards",
      },
      {
        key: "s1_delegacion",
        title: "Auditoría de Delegación",
        description:
          "Marcá las afirmaciones que son verdaderas en tu empresa hoy.",
        type: "checklist",
        data: {
          items: [
            "Tengo un organigrama claro y actualizado",
            "Cada persona sabe exactamente qué se espera de ella",
            "Tengo procesos documentados para las actividades críticas",
            "Puedo irme de vacaciones 2 semanas sin que todo se detenga",
            "Mis líderes tienen su nivel de autoridad (LOS) definido",
            "Hago check-ins regulares sin micro-management",
            "Mi equipo viene con soluciones, no solo con problemas",
            "Las métricas de cada área están definidas y se miden semanalmente",
          ],
        },
      },
      {
        key: "s1_cinco_grandes",
        title: "Mis 5 Grandes Desafíos",
        description:
          "¿Cuáles son los 5 obstáculos más importantes que te impiden escalar tu empresa hoy? Escribí con honestidad.",
        type: "text",
      },
      {
        key: "s1_plan_14_dias",
        title: "Plan de las Primeras 2 Semanas",
        description:
          "Estas son las acciones concretas que vas a ejecutar en los próximos 14 días para arrancar con impulso.",
        type: "checklist",
        data: {
          items: [
            "Completar el diagnóstico de 8 áreas y compartirlo con el equipo",
            "Hacer 1-on-1 individual con cada miembro del equipo",
            "Mapear el perfil DISC de todo el equipo",
            "Definir los 3 Leading Indicators clave de la empresa",
            "Revisar el organigrama y los roles de cada persona",
            "Identificar los 3 procesos que más dependen de tu presencia",
            "Registrar la primera Roca del trimestre",
            "Implementar el ritual War-Up grupal al menos 3 veces",
          ],
        },
      },
    ],
  },
  {
    number: 2,
    title: "El Equipo Actual",
    subtitle:
      "Analizá a las personas que tenés hoy: sus perfiles DISC, sus roles y si están en el lugar correcto",
    exercises: [
      {
        key: "s2_tres_preguntas",
        title: "3 Preguntas Fundamentales del Equipo",
        description:
          "Respondé honestamente las 3 preguntas que definen la salud de tu equipo.",
        type: "text_group",
        data: {
          questions: [
            "¿Quiénes son las personas correctas en tu equipo y por qué?",
            "¿Quiénes están en el rol incorrecto para sus capacidades o perfil DISC?",
            "¿Qué cambio en el equipo tendría el mayor impacto en los próximos 90 días?",
          ],
        },
      },
      {
        key: "s2_disc_mapeo",
        title: "Mapa DISC del Equipo",
        description:
          "Registrá o actualizá el perfil DISC de cada miembro del equipo. Los cambios se guardan directamente en sus perfiles.",
        type: "disc_map",
        integration: "profiles_disc",
      },
      {
        key: "s2_auditoria_quien",
        title: "Auditoría ¿Quién Hace Qué?",
        description:
          "Definí con claridad quién es responsable de las funciones críticas del negocio.",
        type: "text_group",
        data: {
          questions: [
            "¿Quién es responsable de la ejecución operativa diaria?",
            "¿Quién lidera las ventas o el crecimiento del negocio?",
            "¿Quién garantiza la calidad del producto o servicio?",
            "¿Quién podría reemplazarte a vos en los próximos 6 meses?",
          ],
        },
      },
    ],
  },
  {
    number: 3,
    title: "Diseño del Equipo Ideal",
    subtitle:
      "Pasá del equipo que tenés al equipo que necesitás — gestionando perfiles DISC, luces y sombras",
    exercises: [
      {
        key: "s3_sombras",
        title: "Mapa de Luces y Sombras",
        description:
          "Para cada miembro del equipo, identificá si opera desde su Luz o su Sombra y cuál es su temor activo. Los cambios actualizan los perfiles.",
        type: "shadows",
        integration: "profiles_state",
      },
      {
        key: "s3_arqui",
        title: "Arquitectura del Equipo",
        description:
          "Evaluá el estado actual de las 6 dimensiones de arquitectura organizacional (0 = crítico, 100 = excelente).",
        type: "slider_group",
        data: {
          sliders: [
            { key: "claridad_roles", label: "Claridad de roles y responsabilidades" },
            { key: "comunicacion", label: "Calidad de comunicación interna" },
            { key: "velocidad_decision", label: "Velocidad de toma de decisiones" },
            { key: "capacidad_ejecucion", label: "Capacidad de ejecución del equipo" },
            { key: "confianza", label: "Nivel de confianza mutua" },
            { key: "alineacion_vision", label: "Alineación con la visión" },
          ],
        },
      },
      {
        key: "s3_reunion_tbm",
        title: "Diseño de la Reunión TBM",
        description:
          "Describí cómo sería la reunión de equipo ideal: frecuencia, participantes, agenda, duración y compromisos concretos.",
        type: "text",
      },
    ],
  },
  {
    number: 4,
    title: "Neurobiología del Liderazgo",
    subtitle:
      "Tu energía es el recurso más estratégico que tenés. Aprendé a gestionarla como un activo del negocio",
    exercises: [
      {
        key: "s4_energia",
        title: "Diagnóstico de Energía",
        description:
          "Evaluá tu nivel actual de energía en las 4 dimensiones del liderazgo de alto rendimiento (0 = agotado, 100 = óptimo).",
        type: "slider_group",
        data: {
          sliders: [
            { key: "energia_fisica", label: "Energía física (sueño, alimentación, movimiento)" },
            { key: "energia_mental", label: "Energía mental (foco, claridad, decisiones)" },
            { key: "energia_emocional", label: "Energía emocional (estado, vínculos, regulación)" },
            { key: "energia_proposito", label: "Energía de propósito (significado, visión, misión)" },
          ],
        },
      },
      {
        key: "s4_marcha",
        title: "La Marcha de las 20 Millas",
        description:
          "Definí tu acción diaria constante — el hábito que vas a ejecutar sí o sí cada día sin importar las circunstancias. Se guardará en tu Pre-Game de hoy.",
        type: "text",
        integration: "pre_games",
      },
      {
        key: "s4_blindaje",
        title: "Protocolo de Blindaje Personal",
        description:
          "Estos son los hábitos que protegen tu energía y tu foco. Marcá los que ya tenés incorporados.",
        type: "checklist",
        data: {
          items: [
            "Tengo un protocolo de mañana definido (Pre-Game antes de arrancar)",
            "Hago War-Up grupal ≥3 veces por semana",
            "Escribo mis 5 Grandes cada día antes de abrir el correo",
            "Hago Cool-Down de cierre al final del día",
            "Tengo un corte digital claro (hora sin pantallas)",
            "Gestiono mi energía: sueño ≥7h, movimiento y alimentación",
            "Tengo un bloque semanal de revisión estratégica bloqueado",
            "Di feedback S.E.C. a alguien del equipo esta semana",
          ],
        },
      },
      {
        key: "s4_sec",
        title: "Mi Plan S.E.C. Personal",
        description:
          "Describí cómo vas a aplicar la metodología S.E.C. (Sostener, Elevar, Corregir) para desarrollar a tu equipo esta semana.",
        type: "text",
      },
    ],
  },
];

// ── Helpers de desbloqueo ─────────────────────────────────────

export function isSessionUnlocked(n: number, allProgress: WorkbookProgress[]): boolean {
  if (n === 1) return true;
  // Ya tiene un progress row = fue desbloqueada anteriormente
  if (allProgress.some((p) => p.session_number === n)) return true;
  // O: sesión anterior al 100% + 7 días desde que se desbloqueó
  const prev = allProgress.find((p) => p.session_number === n - 1);
  if (!prev || prev.pct_complete < 100) return false;
  const daysSince = (Date.now() - new Date(prev.unlocked_at).getTime()) / 86_400_000;
  return daysSince >= 7;
}

export function daysUntilUnlock(n: number, allProgress: WorkbookProgress[]): number {
  if (isSessionUnlocked(n, allProgress)) return 0;
  const prev = allProgress.find((p) => p.session_number === n - 1);
  if (!prev || prev.pct_complete < 100) return -1;
  const daysSince = (Date.now() - new Date(prev.unlocked_at).getTime()) / 86_400_000;
  return Math.max(0, Math.ceil(7 - daysSince));
}

export function canRequestEarlyUnlock(currentSessionNum: number, allProgress: WorkbookProgress[]): boolean {
  if (currentSessionNum >= 4) return false;
  const currentProg = allProgress.find((p) => p.session_number === currentSessionNum);
  if (!currentProg || currentProg.pct_complete < 100) return false;
  return !isSessionUnlocked(currentSessionNum + 1, allProgress);
}
