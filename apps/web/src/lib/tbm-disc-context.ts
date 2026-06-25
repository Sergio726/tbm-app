// =============================================================
// Contexto DISC canónico de Dilio (TBM 4) para la síntesis con IA (B2).
// Fuente de verdad: docs/METODO_TBM_CANONICO.md §4 — NO `DISC_FACTORS`
// (que diverge del método; ej. el temor del perfil D). Se inyecta en el
// prompt de generateDiscNarrative para que la síntesis "hable" TBM.
// =============================================================

export type DiscCanonLetter = "D" | "I" | "S" | "C";

export type TbmDiscEntry = {
  letter: DiscCanonLetter;
  arquetipo: string; // "Dominante — El Motor de la Ejecución"
  poblacion: string; // "3%"
  temor: string; // temor canónico que dispara la sombra
  rolIdeal: string;
  luz: string[];
  sombra: string[];
};

export const TBM_DISC_CANON: Record<DiscCanonLetter, TbmDiscEntry> = {
  D: {
    letter: "D",
    arquetipo: "Dominante — El Motor de la Ejecución",
    poblacion: "3%",
    temor: "Abuso de confianza (sentirse usado sin reconocimiento)",
    rolIdeal: "Dirección General / Expansión / Gestión de Crisis",
    luz: [
      "Hace que las cosas pasen",
      "Toma decisiones difíciles con claridad",
      "Visión macro, orientación a resultados",
    ],
    sombra: [
      "Atropella al equipo con velocidad",
      "Impaciencia tóxica",
      "El fin justifica los medios",
    ],
  },
  I: {
    letter: "I",
    arquetipo: "Influyente — El Combustible del Equipo",
    poblacion: "11%",
    temor: "El rechazo (sentirse ignorado o minimizado)",
    rolIdeal: "Ventas / Relaciones Públicas / Cultura / Marketing",
    luz: [
      "Conector magnético, persuasión auténtica",
      "Energía contagiosa",
      "Hace sentir bien a los demás",
    ],
    sombra: [
      "Desordenado, promete y no cumple",
      "Protagonismo sin resultados",
    ],
  },
  S: {
    letter: "S",
    arquetipo: "Seguro — El Chasis de la Empresa",
    poblacion: "69%",
    temor: "La no aprobación (la inestabilidad lo paraliza)",
    rolIdeal: "Operaciones / Customer Success / RR.HH.",
    luz: [
      "Lealtad inquebrantable",
      "Procesos estables, cohesión de equipo",
      "Es el antídoto contra la indiferencia que pierde clientes",
    ],
    sombra: [
      "Alta resistencia al cambio",
      "Rencor silencioso que erosiona la cultura",
    ],
  },
  C: {
    letter: "C",
    arquetipo: "Pensador — El Sensor de Calidad",
    poblacion: "17%",
    temor: "La crítica sin fundamento (lo cierra y deja de aportar)",
    rolIdeal: "Finanzas / Legal / Sistemas / Calidad",
    luz: [
      "Precisión quirúrgica",
      "Anticipa problemas antes de que ocurran",
      "Protege la rentabilidad del negocio",
    ],
    sombra: [
      "Parálisis por análisis",
      "Crítica destructiva sin propuesta",
    ],
  },
};

// Conexiones y fricciones entre perfiles (Sesión 2).
export const TBM_DISC_CRUCES = {
  buenaConexion: ["D↔C", "I↔S", "S↔C", "I↔D"],
  cruzados: ["D↔S", "I↔C"], // requieren trabajo
};

// Encuadre del método para el system prompt (la "voz" de Dilio).
export const TBM_METHOD_FRAMING = [
  "MARCO DEL MÉTODO (The Business Multiplier de Dilio Donado) — usalo como encuadre, no lo cites literal:",
  "- NOMBRES CANÓNICOS (usalos SIEMPRE, aunque el material de referencia traiga rótulos viejos): el sistema completo se llama **LOST** (Liderazgo, Operaciones, Sistemas, Tiempo) — NUNCA lo llames 'LOS'. Los niveles de autonomía N1–N5 son los 'Niveles de Delegación' (Cadete→Investigador→Recomendador→Ejecutor→Socio), NO 'Niveles LOS'. El método de 4 pilares es 'ARQI' (no 'ARQUI').",
  "- El objetivo del método es pasar de un líder caro a un líder rentable: el talento correcto en el sistema correcto multiplica el negocio.",
  "- DISC describe temperamentos naturales, NO inteligencia, capacidad ni valor. No hay perfiles buenos ni malos: cada uno tiene una función (el D es el motor, el I el combustible, el S el chasis, el C el sensor de calidad).",
  "- Luz = madurez emocional activa (la persona opera desde sus fortalezas con consciencia). Sombra = inmadurez reaccionando (patrones automáticos cuando se activa su temor).",
  "- A cada perfil lo activa un temor distinto; cuando ese temor se dispara, la persona cae en su sombra. Conocer el temor es la clave para sostener la luz.",
].join("\n");
