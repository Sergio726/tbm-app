import type { DriveStep } from "driver.js";

/**
 * Pasos del tour guiado (S11). Los selectores apuntan a atributos
 * data-tour repartidos por el layout y el dashboard.
 * El tour se adapta al rol: arquitecto y colaborador ven flujos distintos.
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

const ARQUITECTO_STEPS: DriveStep[] = [
  ...COMMON_INTRO,
  {
    element: '[data-tour="nav-equipo"]',
    popover: {
      title: "El mapa de tu gente",
      description:
        "Acá vive el DISC y el nivel LOS de cada colaborador. Conocer a tu equipo es la base para delegar mejor.",
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
    element: '[data-tour="user-avatar"]',
    popover: {
      title: "Tu perfil y configuración",
      description:
        "Desde Mi cuenta podés actualizar tus datos y reiniciar este tour cuando quieras.",
      side: "top",
      align: "start",
    },
  },
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
    element: '[data-tour="nav-rituales"]',
    popover: {
      title: "El Escudo Anti-Boomerang",
      description:
        "Cuando te trabes con una tarea, el sistema te pide 3 opciones antes de escalar. Así el líder recibe soluciones, no problemas.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="user-avatar"]',
    popover: {
      title: "Tu perfil y configuración",
      description:
        "Desde Mi cuenta podés actualizar tus datos y reiniciar este tour cuando quieras.",
      side: "top",
      align: "start",
    },
  },
  {
    popover: {
      title: "¡Ya conocés el sistema! 🎉",
      description:
        "Tu primer paso: completá tu Pre-game de hoy y entrá al War Up cuando el Arquitecto abra la sala.",
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

function mobileStepsForRole(role: string | null | undefined): DriveStep[] {
  const outro = role === "arquitecto" ? ARQUITECTO_OUTRO : COLABORADOR_OUTRO;
  return [...MOBILE_INTRO, outro];
}

export function tourStepsForRole(
  role: string | null | undefined,
  isMobile = false
): DriveStep[] {
  if (isMobile) return mobileStepsForRole(role);
  return role === "arquitecto" ? ARQUITECTO_STEPS : COLABORADOR_STEPS;
}
