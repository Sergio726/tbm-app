import type { FeedbackType } from "@/types/database";
import type { DiscLetter } from "@/lib/disc";

export const FEEDBACK_TEMPLATES: Record<FeedbackType, string> = {
  S: "Noté que [describí el comportamiento específico]. Eso nos da [describí el resultado concreto para el equipo/empresa]. Quiero que sostengas ese estándar.",
  E: "Tu trabajo en [describí la tarea o proyecto] estuvo bien, pero sos un jugador nivel [mencioná el nivel que puede alcanzar]. Para la próxima quiero que [describí lo que esperás a ese nivel superior].",
  C: "El comportamiento de [describí la conducta específica] es una falta de respeto al estándar. Nos cuesta [describí el impacto concreto]. Necesito que corrijas esto inmediatamente.",
};

export type ToneGuide = {
  title: string;
  tips: string[];
  warning?: string;
};

export const DISC_TONE_GUIDES: Record<string, ToneGuide> = {
  S_D: {
    title: "Sostener a un D — Dominante",
    tips: [
      "Sé directo y específico: nombrá el resultado que generó.",
      "Conectá el reconocimiento con el impacto en el negocio.",
      "Breve y al punto — el D pierde interés en los elogios largos.",
    ],
  },
  S_I: {
    title: "Sostener a un I — Influyente",
    tips: [
      "Si es posible, reconocelo en público o ante el equipo.",
      "Mostrá entusiasmo genuino — el I necesita sentir el calor del reconocimiento.",
      "Conectalo con cómo su aporte impactó al equipo, no solo al resultado.",
    ],
  },
  S_S: {
    title: "Sostener a un S — Estable",
    tips: [
      "En privado y con calidez genuina — el S valora la autenticidad.",
      "Mencioná cómo su constancia apoya al equipo entero.",
      "Dale tiempo para procesar; no esperes una reacción efusiva.",
    ],
  },
  S_C: {
    title: "Sostener a un C — Concienzudo",
    tips: [
      "Con datos específicos: nombrá el comportamiento exacto que reforzás.",
      "El C no confía en elogios genéricos — sé preciso y fundamentado.",
      "Formal y estructurado — podés seguirlo con un resumen escrito.",
    ],
  },
  E_D: {
    title: "Elevar a un D — Dominante",
    tips: [
      "Plantealo como un reto de mayor impacto y responsabilidad.",
      "El D quiere alcanzar el siguiente nivel — mostrá el camino.",
      "Sé claro sobre qué resultado concreto esperás a ese nivel.",
    ],
  },
  E_I: {
    title: "Elevar a un I — Influyente",
    tips: [
      "Si el contexto lo permite, en grupo — el I se motiva con el reconocimiento público.",
      "Cargá el mensaje de emoción y visión: mostrá quién puede llegar a ser.",
      "Convertí el 'elevar' en una oportunidad de exposición o liderazgo visible.",
    ],
  },
  E_S: {
    title: "Elevar a un S — Estable",
    tips: [
      "En privado y con respaldo claro — el S necesita sentirse seguro para crecer.",
      "Dale tiempo para procesar la expectativa; no lo apures.",
      "Mostrá que confiás y que el crecimiento es gradual, no un salto brusco.",
    ],
  },
  E_C: {
    title: "Elevar a un C — Concienzudo",
    tips: [
      "Con métricas claras: definí exactamente qué estándar de calidad esperás.",
      "Dá el paso a paso de cómo llegar al nivel superior.",
      "El C necesita entender el 'por qué' antes de comprometerse a mejorar.",
    ],
  },
  C_D: {
    title: "Corregir a un D — Dominante",
    tips: [
      "Firme, directo e inmediato — el D respeta la franqueza.",
      "Enfocá en el impacto en el resultado, no en la persona.",
      "Sin rodeos; el D pierde el respeto si lo tratás con guantes.",
    ],
    warning: "Elegí un espacio privado — confrontarlo frente a otros puede activar su sombra.",
  },
  C_I: {
    title: "Corregir a un I — Influyente",
    tips: [
      "Siempre en privado — el I teme la desaprobación pública sobre todo.",
      "Empezá por reconocer algo positivo antes de la corrección.",
      "Enfocá la corrección en el comportamiento, nunca en la persona.",
    ],
    warning: "Nunca lo expongas frente al equipo — el daño al vínculo puede ser irreparable.",
  },
  C_S: {
    title: "Corregir a un S — Estable",
    tips: [
      "Suave pero claro — el S necesita entender el impacto sin sentirse atacado.",
      "Dale tiempo y contexto; explicá el 'por qué' del cambio esperado.",
      "No lo humilles ni lo presiones; el S se cierra bajo presión intensa.",
    ],
  },
  C_C: {
    title: "Corregir a un C — Concienzudo",
    tips: [
      "Con datos y argumentos — el C no acepta correcciones sin evidencia.",
      "Apelá a los estándares y criterios objetivos, no a percepciones.",
      "Dá información suficiente y un plazo razonable para corregir.",
    ],
  },
};

export function getToneGuide(
  type: FeedbackType | null,
  letter: DiscLetter | null
): ToneGuide | null {
  if (!type || !letter) return null;
  return DISC_TONE_GUIDES[`${type}_${letter}`] ?? null;
}

export const SEC_CONFIG: Record<
  FeedbackType,
  { label: string; color: string; bg: string; border: string; description: string }
> = {
  S: {
    label: "Sostener",
    color: "#34d399",
    bg: "rgba(52,211,153,0.1)",
    border: "rgba(52,211,153,0.3)",
    description: "Refuerza un comportamiento positivo para que se repita",
  },
  E: {
    label: "Elevar",
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.1)",
    border: "rgba(251,191,36,0.3)",
    description: "Reconoce el nivel actual y exige el siguiente",
  },
  C: {
    label: "Corregir",
    color: "#f87171",
    bg: "rgba(248,113,113,0.1)",
    border: "rgba(248,113,113,0.3)",
    description: "Corrige una falla de estándar con claridad y firmeza",
  },
};
