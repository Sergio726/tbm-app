import type { DriveStep } from "driver.js";

/**
 * Pasos del tour guiado (S11). Los selectores apuntan a atributos
 * data-tour repartidos por el layout y el dashboard.
 * El tour se adapta al rol: arquitecto, colaborador y coach ven flujos distintos.
 *
 * ⚠️ **Regla al tocar esto:** cada `element` tiene que existir en el DOM **para ese
 * rol**. El sidebar no es igual para todos (`MODULES` vs `COACH_MODULES` en
 * `components/layout/sidebar.tsx`), y `[data-tour="semaforos"]` vive solo en
 * `/dashboard`. Un paso que apunta a un selector inexistente deja el popover
 * flotando sin ancla, hablando de un módulo que la persona no tiene.
 */

const COMMON_INTRO: DriveStep[] = [
  {
    element: '[data-tour="sidebar-nav"]',
    popover: {
      title: "Tu panel de control",
      description:
        "Todo el sistema TBM vive en esta barra. Cada sección es un módulo que se va desbloqueando a medida que avanzás en el programa.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="semaforos"]',
    popover: {
      title: "El diagnóstico de tu negocio",
      description:
        "Estos 8 semáforos muestran la salud de cada área clave. Verde = bien, rojo = atención urgente. Se actualizan cada vez que re-evaluás.",
      side: "top",
      align: "center",
    },
  },
  {
    element: '[data-tour="nav-rituales"]',
    popover: {
      title: "El motor de tu día",
      description:
        "Pre-game, War Up y Cool Down son los rituales que sincronizan al equipo. Hacerlos a diario es la diferencia entre método y caos.",
      side: "right",
      align: "start",
    },
  },
];

// Paso final compartido: presenta a DC como copiloto omnipresente (N4).
const DC_STEP: DriveStep = {
  element: '[data-tour="dc-launcher"]',
  popover: {
    title: "DC, tu copiloto",
    description:
      "Este es DC, tu asistente del método. Está en todas las pantallas: preguntale cómo hacer cualquier cosa —delegar, dar feedback, armar tu Plan 90D— y te explica al instante. Incluso te lleva al módulo correcto con un toque.",
    side: "left",
    align: "end",
  },
};

const ARQUITECTO_STEPS: DriveStep[] = [
  ...COMMON_INTRO,
  {
    element: '[data-tour="nav-equipo"]',
    popover: {
      title: "El mapa de tu gente",
      description:
        "Acá vive el DISC y el nivel de delegación de cada colaborador. Conocer a tu equipo es la base para delegar mejor.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="nav-delegacion"]',
    popover: {
      title: "El Pase de Estafeta",
      description:
        "Cada tarea delegada tiene 5 puntos obligatorios. Sin los 5 puntos, el error es del líder — el sistema no te deja saltearlos.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="nav-feedback"]',
    popover: {
      title: "Feedback S.E.C.",
      description:
        "Dar feedback que ordena, no que lastima: Situación, Efecto y Cambio. El sistema te sugiere el tono según el perfil DISC de cada persona.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="nav-plan-90d"]',
    popover: {
      title: "Tu Plan de 90 días",
      description:
        "Las Rocas: los 1–5 resultados más importantes del trimestre. Cada una se baja en cascada — le ponés una meta medible, la repartís entre responsables y cada uno define las actividades que lo llevan ahí (llamadas, propuestas). Así la estrategia llega hasta el día a día.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="nav-multiplicador"]',
    popover: {
      title: "El Multiplicador",
      description:
        "Tu ROI de Talento: medís si tu gente multiplica o resta. Es la brújula para decidir dónde poner foco como líder.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="nav-creditos"]',
    popover: {
      title: "Tus créditos",
      description:
        "Cada test DISC que generás usa un crédito. Acá ves tu saldo, el historial y podés pedir más sin salir de la app.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="user-avatar"]',
    popover: {
      title: "Tu perfil y configuración",
      description:
        "Desde Mi cuenta actualizás tus datos y, en Avisos, elegís qué te avisa el sistema por correo: el despertador de la mañana, las alertas de tareas y el reporte semanal. También podés reiniciar este tour.",
      side: "top",
      align: "start",
    },
  },
  DC_STEP,
  {
    popover: {
      title: "¡Ya conocés el sistema! 🎉",
      description:
        "Ahora es tiempo de actuar. El primer paso es completar el Diagnóstico Organizacional de las 8 áreas — los semáforos del Dashboard se encienden con tus respuestas.",
    },
  },
];

const COLABORADOR_STEPS: DriveStep[] = [
  ...COMMON_INTRO,
  {
    element: '[data-tour="nav-delegacion"]',
    popover: {
      title: "Tus tareas asignadas",
      description:
        "Acá ves todo lo que te delegaron, con los 5 puntos explicados: qué, por qué, cómo, cuándo y chequeo. Sin excusas para no saber qué hacer.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="nav-feedback"]',
    popover: {
      title: "Feedback S.E.C.",
      description:
        "El espacio para dar y recibir feedback que suma: Situación, Efecto y Cambio. Una conversación clara vale más que diez quejas.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="nav-rituales"]',
    popover: {
      title: "El Escudo Anti-Boomerang",
      description:
        "Cuando te trabes con una tarea, el sistema te pide 3 opciones antes de escalar. Así el líder recibe soluciones, no problemas.",
      side: "right",
      align: "start",
    },
  },
  // S22 · §I1/§J1 — lo que más le cambia el día a día al colaborador: saber en qué
  // nivel está y hasta dónde decide solo. Se ancla a `nav-equipo` porque ahí vive
  // la ficha (para el colaborador el módulo se titula "Mi Perfil", ver sidebar.tsx).
  {
    element: '[data-tour="nav-equipo"]',
    popover: {
      title: "Tu nivel y tu ficha de rol",
      description:
        "Al lado de tu nombre vas a ver tu insignia de nivel de delegación (de Cadete a Socio). Y acá, en Mi Perfil, está tu ficha de rol: qué se espera de vos, qué resultados buscamos y hasta qué monto podés decidir sin consultar.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="user-avatar"]',
    popover: {
      title: "Tu perfil y configuración",
      description:
        "Desde Mi cuenta actualizás tus datos y, en Avisos, elegís qué te avisa el sistema por correo: el despertador de la mañana, las alertas de tareas y el reporte semanal. También podés reiniciar este tour.",
      side: "top",
      align: "start",
    },
  },
  DC_STEP,
  {
    popover: {
      title: "¡Ya conocés el sistema! 🎉",
      description:
        "Tu primer paso: completá tu Pre-game de hoy y entrá al War Up cuando el Arquitecto abra la sala.",
    },
  },
];

// ── Coach (S21b) ─────────────────────────────────────────────
// El coach dedicado NO tiene empresa propia: su sidebar es `COACH_MODULES` y su
// home es /super-coach, así que nunca ve `[data-tour="semaforos"]` (vive en el
// dashboard) ni los nav-* de los módulos de empresa. Antes caía en
// COLABORADOR_STEPS y casi todos sus pasos apuntaban a elementos inexistentes.
const COACH_STEPS: DriveStep[] = [
  {
    element: '[data-tour="sidebar-nav"]',
    popover: {
      title: "Tu panel de coach",
      description:
        "Desde acá acompañás a las empresas que te asignaron. No tenés los módulos de una empresa propia: tu lugar es la vista de seguimiento.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="nav-super-coach"]',
    popover: {
      title: "Mis empresas",
      description:
        "El semáforo de cada empresa alumna: cómo vienen sus áreas, sus Rocas del trimestre y sus rituales. De un vistazo ves dónde hace falta que intervengas.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="user-avatar"]',
    popover: {
      title: "Tu perfil y configuración",
      description:
        "Desde Mi cuenta actualizás tus datos y, en Avisos, elegís qué te llega por correo. También podés reiniciar este tour.",
      side: "top",
      align: "start",
    },
  },
  DC_STEP,
  {
    popover: {
      title: "¡Listo! 🎉",
      description:
        "Si todavía no ves empresas asignadas, pedile al administrador que te las asigne. En cuanto las tengas, van a aparecer en Mis empresas.",
    },
  },
];

// ── Flujo móvil ──────────────────────────────────────────────
// En móvil el sidebar es un drawer cerrado (fuera de pantalla), así que los
// pasos no pueden apuntar a [data-tour="nav-*"] / "sidebar-nav" / "user-avatar".
// En su lugar señalamos la hamburguesa (siempre visible) y los semáforos del
// contenido, y cerramos con el mensaje final según el rol.
const MOBILE_INTRO: DriveStep[] = [
  {
    element: '[data-tour="mobile-menu"]',
    popover: {
      title: "Tu panel de control",
      description:
        "Todo el sistema TBM —rituales, equipo, delegación y más— vive en este menú. Tocá la hamburguesa para abrirlo cuando quieras.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: '[data-tour="semaforos"]',
    popover: {
      title: "El diagnóstico de tu negocio",
      description:
        "Estos 8 semáforos muestran la salud de cada área clave. Verde = bien, rojo = atención urgente. Se actualizan cada vez que re-evaluás.",
      side: "bottom",
      align: "center",
    },
  },
];

// Último paso (mensaje de cierre) de cada rol — reutilizado en desktop y móvil.
const ARQUITECTO_OUTRO = ARQUITECTO_STEPS[ARQUITECTO_STEPS.length - 1];
const COLABORADOR_OUTRO = COLABORADOR_STEPS[COLABORADOR_STEPS.length - 1];

const COACH_OUTRO = COACH_STEPS[COACH_STEPS.length - 1];

function mobileStepsForRole(role: string | null | undefined): DriveStep[] {
  // El coach no ve `[data-tour="semaforos"]` (vive en /dashboard, y su home es
  // /super-coach), así que MOBILE_INTRO tampoco le sirve entero: se queda con la
  // hamburguesa, que sí existe para todos.
  if (role === "coach") {
    return [MOBILE_INTRO[0], DC_STEP, COACH_OUTRO];
  }
  const outro = role === "arquitecto" ? ARQUITECTO_OUTRO : COLABORADOR_OUTRO;
  // El launcher de DC es fijo y visible también en móvil → lo presentamos antes del cierre.
  return [...MOBILE_INTRO, DC_STEP, outro];
}

export function tourStepsForRole(
  role: string | null | undefined,
  isMobile = false
): DriveStep[] {
  if (isMobile) return mobileStepsForRole(role);
  // El caso `coach` va ANTES del fallback: si no, cae en COLABORADOR_STEPS y sus
  // pasos apuntan a módulos de empresa que el coach dedicado no tiene (S21b).
  if (role === "coach") return COACH_STEPS;
  return role === "arquitecto" ? ARQUITECTO_STEPS : COLABORADOR_STEPS;
}
