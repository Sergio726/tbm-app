import type { WorkbookProgress } from "@/types/database";

export type ExerciseType =
  | "diagnostic"
  | "checklist"
  | "text"
  | "text_group"
  | "disc_map"
  | "shadows"
  | "slider_group"
  | "counter_tracker";

export type ExerciseIntegration =
  | "scorecards"
  | "profiles_disc"
  | "profiles_state"
  | "pre_games"
  | "tasks"
  | "feedbacks"
  | "kpis"
  | "rocks"
  | "idea_parking"
  | "authority_matrix"
  | "decisions";

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
    /** Para counter_tracker: cantidad de días a contar (default 3). */
    days?: number;
    /** Para counter_tracker: etiqueta del contador (ej. "interrupciones hoy"). */
    counterLabel?: string;
  };
}

export type SessionNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface SessionDef {
  number: SessionNumber;
  title: string;
  subtitle: string;
  exercises: ExerciseDef[];
}

/** Total de sesiones del programa TBM (para validaciones y vistas). */
export const TOTAL_SESSIONS = 8;

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
            "Mis líderes tienen su nivel de delegación definido",
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
  // ════════════════════════════════════════════════════════════
  // SESIÓN 5 — Multiplicación
  // ════════════════════════════════════════════════════════════
  {
    number: 5,
    title: "Multiplicación",
    subtitle:
      "Detectá los pecados que te impiden multiplicar tu impacto y diseñá los sistemas para escalar sin estar en todo",
    exercises: [
      {
        key: "s5_pecados",
        title: "Detector de Pecados del Líder",
        description:
          "Marcá los pecados de liderazgo que cometés con frecuencia. Cada uno es un techo de cristal para tu equipo.",
        type: "checklist",
        data: {
          items: [
            "Rescatista — apago incendios que mi equipo debería poder resolver",
            "Marcapasos — todo avanza a mi ritmo, si paro yo el equipo se detiene",
            "Respuesta-Rápida — contesto en el momento aunque podría delegar la decisión",
            "Súper-Operador — sigo haciendo tareas técnicas en vez de liderar",
            "Micro-Gestor — reviso detalles en vez de confiar en el sistema",
            "Bombero — corro a salvar entregables a último momento",
            "Único Vendedor — yo cierro las ventas grandes, el equipo solo prospecta",
            "Caja Única — todas las decisiones de plata pasan por mí",
          ],
        },
      },
      {
        key: "s5_fichas_poker",
        title: "Fichas de Póker · contador de intervenciones",
        description:
          "En tu próximo War Up entregá 3 'fichas' a cada miembro: cada intervención cuesta una ficha. Registrá acá lo que aprendiste sobre quién monopoliza y quién no habla.",
        type: "text_group",
        data: {
          questions: [
            "¿Quién gastó sus 3 fichas primero? (señal de monopolio o ansiedad)",
            "¿Quién terminó con fichas sobrantes? (señal de inhibición o desinterés)",
            "¿Qué decisión podría haber tomado el equipo sin vos? Listala.",
          ],
        },
      },
      {
        key: "s5_definition_of_done",
        title: "Definition of Done · template para Pase de Estafeta",
        description:
          "Definí qué significa 'terminado' en tu negocio. Esto pre-carga el campo QUÉ del Pase de Estafeta — no se vuelve a discutir en cada delegación.",
        type: "text_group",
        integration: "tasks",
        data: {
          questions: [
            "¿Qué entregable concreto define que la tarea está hecha? (sustantivo + adjetivo)",
            "¿Qué criterio de calidad debe cumplir? (medible, no subjetivo)",
            "¿A quién debe ser entregable (cliente/área/sistema) y en qué formato?",
            "¿Qué señal indica que NO se hizo bien aunque parezca terminado?",
          ],
        },
      },
      {
        key: "s5_interrupciones",
        title: "Auditoría de Interrupciones · 3 días",
        description:
          "Durante 3 días contá cuántas veces te interrumpen sin que la consulta requiera tu nivel de decisión. Los números muestran el costo real del cuello de botella.",
        type: "counter_tracker",
        data: {
          days: 3,
          counterLabel: "interrupciones evitables",
        },
      },
    ],
  },
  // ════════════════════════════════════════════════════════════
  // SESIÓN 6 — Delegación
  // ════════════════════════════════════════════════════════════
  {
    number: 6,
    title: "Delegación",
    subtitle:
      "Pasá del 'yo lo hago más rápido' al sistema que multiplica tu capacidad — la Regla del 70% y los Niveles de Delegación",
    exercises: [
      {
        key: "s6_regla_70",
        title: "Regla del 70% · % de tareas delegables",
        description:
          "Para cada tipo de tarea, evaluá si alguien del equipo podría hacerla al menos al 70% de tu nivel. Todo lo que esté >70 es candidato a delegación inmediata.",
        type: "slider_group",
        data: {
          sliders: [
            { key: "responder_clientes", label: "Responder consultas de clientes" },
            { key: "armar_propuestas", label: "Armar propuestas o presupuestos" },
            { key: "control_de_caja", label: "Control de caja diario y conciliación" },
            { key: "reclutar", label: "Filtrar candidatos en procesos de selección" },
            { key: "reportes_semanales", label: "Generar reportes semanales para vos" },
            { key: "decisiones_compra", label: "Decisiones de compra bajo $X" },
          ],
        },
      },
      {
        key: "s6_niveles_los",
        title: "Niveles de Delegación por colaborador · mapa de autonomía",
        description:
          "Para cada persona del equipo, definí su nivel de delegación actual y el meta. Los cambios alimentan el módulo Mi Equipo (M3).",
        type: "checklist",
        integration: "profiles_state",
        data: {
          items: [
            "Tengo identificado el nivel de delegación actual de cada persona",
            "Cada persona conoce su propio nivel de delegación y la meta",
            "El criterio para subir de nivel está escrito y es objetivo",
            "Reviso los niveles de delegación al menos cada trimestre",
            "Cuando alguien sube de nivel, lo comunico al equipo",
            "Tengo planes individuales de desarrollo por persona",
          ],
        },
      },
      {
        key: "s6_pase_estafeta",
        title: "Pase de Estafeta · práctica de los 5 puntos",
        description:
          "Elegí una tarea concreta que vas a delegar esta semana y escribila usando los 5 puntos del Pase de Estafeta. Después abrila en el módulo Delegación con el wizard.",
        type: "text_group",
        integration: "tasks",
        data: {
          questions: [
            "QUÉ — Definition of Done concreta y observable",
            "POR QUÉ — contexto e impacto en el negocio",
            "CÓMO — restricciones (presupuesto, herramientas, qué NO romper)",
            "CUÁNDO — fecha y hora exacta de entrega",
            "CHEQUEO — cuándo se revisa el borrador (no el final)",
          ],
        },
      },
      {
        key: "s6_anti_boomerang",
        title: "Escudo Anti-Boomerang · reflejo de devolver problemas",
        description:
          "Marcá las situaciones donde te 'devuelven' un problema sin las 3 opciones que pide el método.",
        type: "checklist",
        data: {
          items: [
            "Vienen a preguntarme qué hacer sin haber pensado opciones",
            "Reciben 'es complicado' como respuesta válida del equipo",
            "Yo termino tomando la decisión que ellos podrían tomar",
            "Acepto reuniones donde no se viene con 3 opciones armadas",
            "Resuelvo en el momento sin preguntar '¿cuál recomendás?'",
            "Sigo sin tener un mecanismo para forzar el ejercicio antes de escalar",
          ],
        },
      },
    ],
  },
  // ════════════════════════════════════════════════════════════
  // SESIÓN 7 — BOS (Business Operating System)
  // ════════════════════════════════════════════════════════════
  {
    number: 7,
    title: "BOS · Sistema Operativo del Negocio",
    subtitle:
      "Pasá de mirar Lagging Indicators (lo que ya pasó) a 5 Leading Indicators predictivos que cualquiera del equipo entiende y mueve",
    exercises: [
      {
        key: "s7_leading_indicators",
        title: "5 Leading Indicators · pre-carga del BOS Dashboard",
        description:
          "Definí los 5 indicadores predictivos que, si suben, garantizan el resultado del mes. Estos pre-cargan los KPIs del Dashboard.",
        type: "text_group",
        integration: "kpis",
        data: {
          questions: [
            "LI #1 — actividad comercial (ej: propuestas enviadas, llamadas, demos)",
            "LI #2 — eficiencia operativa (ej: tareas cerradas en SLA, defectos / 100)",
            "LI #3 — salud del equipo (ej: % rituales completados, energía promedio)",
            "LI #4 — flujo financiero (ej: cuentas por cobrar < 30 días, % margen)",
            "LI #5 — desarrollo de talento (ej: feedbacks S/E/C dados, niveles de delegación subidos)",
          ],
        },
      },
      {
        key: "s7_numero_unico",
        title: "Número único por rol · Ley de Pearson",
        description:
          "Para cada rol del equipo, definí EL número único que justifica su salario. Si no se puede medir, el rol es ambiguo y hay que rediseñarlo.",
        type: "text",
        integration: "profiles_disc",
      },
      {
        key: "s7_matriz_autoridad",
        title: "Matriz de Autoridad TBM · montos de decisión",
        description:
          "Configurá los 3 umbrales de la Matriz de Autoridad. Cada nivel define cuánta plata puede mover un colaborador sin pedirte permiso (0 = no aplica todavía).",
        type: "slider_group",
        integration: "authority_matrix",
        data: {
          sliders: [
            { key: "n1_autonomia_total", label: "Nivel 1 — autonomía total bajo $ (en miles)" },
            { key: "n2_min", label: "Nivel 2 — táctica desde $ (en miles)" },
            { key: "n2_max", label: "Nivel 2 — táctica hasta $ (en miles)" },
            { key: "n3_aprobacion", label: "Nivel 3 — requiere tu aprobación desde $ (en miles)" },
          ],
        },
      },
      {
        key: "s7_reunion_silencio",
        title: "Reunión de Silencio · disciplina sobre KPI rojo",
        description:
          "Cuando un KPI está en rojo, el Arquitecto NO opina primero. Escribí el protocolo de 5 segundos de silencio para tu reunión semanal.",
        type: "text",
      },
    ],
  },
  // ════════════════════════════════════════════════════════════
  // SESIÓN 8 — Plan 90D
  // ════════════════════════════════════════════════════════════
  {
    number: 8,
    title: "Plan 90D · Rocas, Arena y Disagree & Commit",
    subtitle:
      "Cerrá el programa con el plan trimestral: distinguir lo estratégico de lo táctico, parquear ideas y forzar decisiones cuando hay desacuerdo",
    exercises: [
      {
        key: "s8_rocas_vs_arena",
        title: "Auditoría de Enfoque · Rocas vs. Arena",
        description:
          "Listá las 10 iniciativas más grandes en tu radar. Clasificá cuáles son Rocas (mueven el largo plazo) y cuáles Arena (urgente pero táctico).",
        type: "text_group",
        data: {
          questions: [
            "Rocas del trimestre — alto impacto, no urgentes. Listá hasta 5.",
            "Arena que ocupa tiempo — urgente, bajo impacto. Listá lo que vas a delegar o dejar de hacer.",
            "Iniciativas que te seducen pero son distracciones — escribilas y luego mandalas al Parqueadero.",
          ],
        },
      },
      {
        key: "s8_rocas_trimestre",
        title: "Rocas del Trimestre · pre-carga del Plan 90D",
        description:
          "Para cada Roca, definí dueño único + criterio de éxito el Día 90. Estas Rocas se cargan en el módulo Plan 90D.",
        type: "text_group",
        integration: "rocks",
        data: {
          questions: [
            "Roca #1 — título · dueño único · criterio de éxito Día 90",
            "Roca #2 — título · dueño único · criterio de éxito Día 90",
            "Roca #3 — título · dueño único · criterio de éxito Día 90",
            "Roca #4 (opcional) — título · dueño único · criterio de éxito Día 90",
            "Roca #5 (opcional) — título · dueño único · criterio de éxito Día 90",
          ],
        },
      },
      {
        key: "s8_parqueadero",
        title: "Parqueadero de Ideas · disciplina del Día 91",
        description:
          "Las ideas que aparecen mid-trimestre no se ejecutan ya — se aparcan hasta el Día 91. Identificá las reglas que vas a respetar.",
        type: "checklist",
        integration: "idea_parking",
        data: {
          items: [
            "Cuando aparece una idea brillante, la escribo en el Parqueadero, no la ejecuto",
            "Reviso el Parqueadero solo al planificar el próximo trimestre",
            "Cualquiera del equipo puede aparcar una idea sin pedirme permiso",
            "Si una idea sigue siendo buena en el Día 91, entra a las próximas Rocas",
            "Si dejó de ser buena, se descarta explícitamente (no se 're-aparca')",
          ],
        },
      },
      {
        key: "s8_disagree_commit",
        title: "Disagree & Commit · cuando hay que decidir sin consenso",
        description:
          "Identificá una decisión actual donde hay desacuerdo en tu equipo. Aplicá Disagree & Commit: cada uno expresa su posición, vos decidís, todos ejecutan al 100%.",
        type: "text_group",
        integration: "decisions",
        data: {
          questions: [
            "¿Sobre qué decisión hay desacuerdo? Describila en una oración.",
            "¿Quiénes están en desacuerdo y cuál es su posición? (lista corta)",
            "¿Cuál es tu decisión final con 70% de info? Anotala con fecha.",
            "¿Cuál es el compromiso explícito de cada persona después de decidida?",
          ],
        },
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
  if (currentSessionNum >= TOTAL_SESSIONS) return false;
  const currentProg = allProgress.find((p) => p.session_number === currentSessionNum);
  if (!currentProg || currentProg.pct_complete < 100) return false;
  return !isSessionUnlocked(currentSessionNum + 1, allProgress);
}
