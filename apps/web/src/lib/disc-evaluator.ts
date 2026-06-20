// =============================================================
// DISC — Motor de evaluación (M3 / Mi Equipo)
// Portado fielmente del evaluador HTML de Dilio (DISC Dilio Donado.html).
// 24 grupos de 4 palabras (ipsativo MÁS/MENOS) -> puntajes D/I/S/C
// -> segmentos 1..7 -> uno de 16 perfiles.
// NO editar a mano sin re-derivar desde la fuente original.
// =============================================================

export type DiscDim = "D" | "I" | "S" | "C";

// Cada grupo: 4 pares [palabra, dimensión]. El evaluado elige la que MÁS
// y la que MENOS lo describe dentro de cada grupo.
export const WORD_GROUPS: ReadonlyArray<ReadonlyArray<readonly [string, DiscDim]>> = [
  [["Entusiasta", "I"], ["Osado", "D"], ["Diplomático", "S"], ["Satisfecho", "S"]],
  [["Cauteloso", "C"], ["Decidido", "D"], ["Bondadoso", "S"], ["Persuasivo", "I"]],
  [["Jovial", "I"], ["Audaz", "D"], ["Meticuloso", "C"], ["Apacible", "S"]],
  [["Receptivo", "S"], ["Enérgico", "D"], ["Animado", "I"], ["Analítico", "C"]],
  [["Lógico", "C"], ["Amigable", "I"], ["Vigoroso", "D"], ["Tranquilo", "S"]],
  [["Pionero", "D"], ["Precavido", "C"], ["Alentador", "I"], ["Moderado", "S"]],
  [["Impulsivo", "D"], ["Sistemático", "C"], ["Encantador", "I"], ["Gentil", "S"]],
  [["Franco", "D"], ["Atento", "S"], ["Generoso", "I"], ["Preciso", "C"]],
  [["Dominante", "D"], ["Expresivo", "I"], ["Ecuánime", "S"], ["Cauteloso", "C"]],
  [["Popular", "I"], ["Persistente", "D"], ["Reflexivo", "C"], ["Considerado", "S"]],
  [["Valiente", "D"], ["Inspirador", "I"], ["Paciente", "S"], ["Prudente", "C"]],
  [["Extrovertido", "I"], ["Controlado", "C"], ["Competitivo", "D"], ["Tolerante", "S"]],
  [["Decidido", "D"], ["Comunicativo", "I"], ["Metódico", "C"], ["Estable", "S"]],
  [["Investigador", "C"], ["Directivo", "D"], ["Promotor", "I"], ["Servicial", "S"]],
  [["Firme", "D"], ["Perceptivo", "C"], ["Amistoso", "I"], ["Calmado", "S"]],
  [["Inquieto", "I"], ["Discreto", "S"], ["Exigente", "D"], ["Ordenado", "C"]],
  [["Directo", "D"], ["Ameno", "I"], ["Leal", "S"], ["Evaluador", "C"]],
  [["Cautivador", "I"], ["Ingenioso", "D"], ["Compasivo", "S"], ["Cuidadoso", "C"]],
  [["Autosuficiente", "D"], ["Sociable", "I"], ["Constante", "S"], ["Perfeccionista", "C"]],
  [["Independiente", "D"], ["Estimulante", "I"], ["Adaptable", "S"], ["Discerniente", "C"]],
  [["Resuelto", "D"], ["Espontáneo", "I"], ["Pacífico", "S"], ["Certero", "C"]],
  [["Apegado a normas", "C"], ["Enérgico", "D"], ["Complaciente", "S"], ["Colaborador", "I"]],
  [["Decisivo", "D"], ["Entusiasta", "I"], ["Prudente", "C"], ["Tranquilo", "S"]],
  [["Comedido", "S"], ["Atrevido", "D"], ["Animado", "I"], ["Concienzudo", "C"]],
];

// Conversión puntaje crudo -> segmento (1..7), tabla por dimensión.
type SegRow = { min: number; max: number; seg: number };
export const SEG_TABLE: Record<DiscDim, SegRow[]> = {
  D: [
    { min: 28, max: 28, seg: 7 },
    { min: 12, max: 27, seg: 7 },
    { min: 9, max: 11, seg: 6 },
    { min: 8, max: 8, seg: 6 },
    { min: 7, max: 7, seg: 6 },
    { min: 6, max: 6, seg: 6 },
    { min: 5, max: 5, seg: 6 },
    { min: 4, max: 4, seg: 5 },
    { min: 3, max: 3, seg: 5 },
    { min: 2, max: 2, seg: 5 },
    { min: 1, max: 1, seg: 4 },
    { min: 0, max: 0, seg: 4 },
    { min: -1, max: -1, seg: 4 },
    { min: -2, max: -2, seg: 3 },
    { min: -3, max: -3, seg: 3 },
    { min: -4, max: -4, seg: 2 },
    { min: -5, max: -5, seg: 2 },
    { min: -6, max: -6, seg: 2 },
    { min: -7, max: -7, seg: 2 },
    { min: -8, max: -8, seg: 1 },
    { min: -11, max: -9, seg: 1 },
    { min: -28, max: -12, seg: 1 },
  ],
  I: [
    { min: 28, max: 28, seg: 7 },
    { min: 10, max: 27, seg: 7 },
    { min: 7, max: 9, seg: 6 },
    { min: 6, max: 6, seg: 6 },
    { min: 5, max: 5, seg: 6 },
    { min: 4, max: 4, seg: 5 },
    { min: 3, max: 3, seg: 5 },
    { min: 2, max: 2, seg: 5 },
    { min: 1, max: 1, seg: 4 },
    { min: 0, max: 0, seg: 4 },
    { min: -1, max: -1, seg: 4 },
    { min: -2, max: -2, seg: 3 },
    { min: -3, max: -3, seg: 3 },
    { min: -4, max: -4, seg: 2 },
    { min: -5, max: -5, seg: 2 },
    { min: -6, max: -6, seg: 2 },
    { min: -7, max: -7, seg: 2 },
    { min: -8, max: -8, seg: 1 },
    { min: -11, max: -9, seg: 1 },
    { min: -28, max: -12, seg: 1 },
  ],
  S: [
    { min: 28, max: 28, seg: 7 },
    { min: 10, max: 27, seg: 7 },
    { min: 8, max: 9, seg: 6 },
    { min: 7, max: 7, seg: 6 },
    { min: 6, max: 6, seg: 6 },
    { min: 5, max: 5, seg: 6 },
    { min: 4, max: 4, seg: 6 },
    { min: 3, max: 3, seg: 6 },
    { min: 2, max: 2, seg: 5 },
    { min: 1, max: 1, seg: 5 },
    { min: 0, max: 0, seg: 4 },
    { min: -1, max: -1, seg: 4 },
    { min: -2, max: -2, seg: 4 },
    { min: -3, max: -3, seg: 4 },
    { min: -4, max: -4, seg: 3 },
    { min: -5, max: -5, seg: 3 },
    { min: -6, max: -6, seg: 3 },
    { min: -7, max: -7, seg: 2 },
    { min: -8, max: -8, seg: 2 },
    { min: -9, max: -9, seg: 2 },
    { min: -10, max: -10, seg: 2 },
    { min: -11, max: -11, seg: 1 },
    { min: -13, max: -12, seg: 1 },
    { min: -28, max: -14, seg: 1 },
  ],
  C: [
    { min: 28, max: 28, seg: 7 },
    { min: 11, max: 27, seg: 7 },
    { min: 9, max: 10, seg: 6 },
    { min: 8, max: 8, seg: 6 },
    { min: 7, max: 7, seg: 6 },
    { min: 6, max: 6, seg: 6 },
    { min: 5, max: 5, seg: 6 },
    { min: 4, max: 4, seg: 5 },
    { min: 3, max: 3, seg: 5 },
    { min: 2, max: 2, seg: 4 },
    { min: 1, max: 1, seg: 4 },
    { min: 0, max: 0, seg: 4 },
    { min: -1, max: -1, seg: 3 },
    { min: -2, max: -2, seg: 3 },
    { min: -3, max: -3, seg: 2 },
    { min: -4, max: -4, seg: 2 },
    { min: -5, max: -5, seg: 2 },
    { min: -6, max: -6, seg: 1 },
    { min: -11, max: -7, seg: 1 },
    { min: -28, max: -12, seg: 1 },
  ],
};

// Una respuesta por grupo: índice (0..3) de la palabra MÁS y de la MENOS.
export type DiscAnswer = { m: number; l: number };
export type DiscScores = Record<DiscDim, number>;
export type DiscSegments = Record<DiscDim, number>;

export type DiscProfile = {
  name: string;
  icon: string;
  desc: string;
  tags: string[];
  emociones: string;
  meta: string;
  juzga: string;
  influye: string;
  valor: string;
  abusa: string;
  bajo_presion: string;
  teme: string;
  mas_eficaz: string;
};

// Los 16 perfiles canónicos del sistema de Dilio.
export const DISC_PROFILES_FULL: Record<string, DiscProfile> = {
  Realizador: {
    name: "Realizador",
    icon: "⚡",
    desc: "Motivado desde su interior con metas personales profundas. Desarrolla un fuerte sentido de la responsabilidad y busca combinar sus metas con las de la organización. Ejerce control sobre los aspectos más importantes de su vida.",
    tags: ["Autosuficiente", "Decidido", "Persistente", "Responsable", "Orientado a resultados"],
    emociones: "Activo, diligente, muestra frustración.",
    meta: "Logros personales, en ocasiones a expensas de la meta de grupo.",
    juzga: "A quienes tienen niveles inferiores o competitivos de trabajo que afectan los resultados.",
    influye: "Haciéndoles competir por su reconocimiento.",
    valor: "Se propone y consigue resultados en áreas clave.",
    abusa: "Confianza en sí mismo, absorción en el trabajo.",
    bajo_presion: "Se vuelve criticón y se dedica a encontrar errores, se niega a trabajar en equipo, se excede en sus prerrogativas.",
    teme: "La brusquedad, la actitud crítica o condescendiente.",
    mas_eficaz: "Si verbalizara su proceso de razonamiento, buscara otros puntos de vista, su preocupación por los demás fuera más genuina, fuera más paciente y humilde.",
  },
  Perfeccionista: {
    name: "Perfeccionista",
    icon: "🔬",
    desc: "Metódico y preciso en su forma de pensar y trabajar. Sigue procedimientos ordenados tanto en su vida personal como laboral. Desea condiciones estables y claridad respecto a lo que se espera de él.",
    tags: ["Meticuloso", "Preciso", "Sistemático", "Concienzudo", "Cauteloso"],
    emociones: "Es discreto, diplomático.",
    meta: "La atención al detalle y precisión.",
    juzga: "Por normas precisas.",
    influye: "Concienzudo, conserva las normas, control de calidad.",
    valor: "Normas precisas, logros estables y predecibles.",
    abusa: "Los procedimientos y controles excesivos para evitar las fallas.",
    bajo_presion: "Depende demasiado de la gente, productos y procesos que le funcionaron en el pasado.",
    teme: "El antagonismo.",
    mas_eficaz: "Si fuera más flexible, fuera más independiente e interdependiente, tuviera más fe en sí mismo y se viera a sí mismo como una persona valiosa.",
  },
  Creativo: {
    name: "Creativo",
    icon: "💡",
    desc: "Muestra dos fuerzas opuestas: el deseo de resultados tangibles frente a un impulso por la perfección. Prevé el enfoque correcto para un proyecto y efectúa cambios oportunos con habilidad.",
    tags: ["Innovador", "Perfeccionista", "Analítico", "Estratégico", "Visionario"],
    emociones: "Acepta la agresión, puede contenerse al expresarse.",
    meta: "Dominar, logros únicos.",
    juzga: "Por sus propias normas, las ideas progresivas al llevar a cabo el trabajo.",
    influye: "El establecimiento de un ritmo a seguir para desarrollar sistemas y enfoques innovadores.",
    valor: "El iniciar o diseñar cambios.",
    abusa: "De su individualismo en lo que se refiere a sus necesidades personales.",
    bajo_presion: "Se aburre fácilmente con el trabajo rutinario, cuando se le restringe se torna malhumorado.",
    teme: "No poder influir, no alcanzar el nivel establecido.",
    mas_eficaz: "Si fuera más amable, usara más tacto al comunicarse, cooperara más con el equipo, reconociera que existen sanciones.",
  },
  Objetivo: {
    name: "Objetivo",
    icon: "🎯",
    desc: "Capacidad de pensamiento crítico muy desarrollada. Busca la precisión y exactitud en todo lo que hace. Prefiere un ambiente laboral tranquilo y ejerce control en forma indirecta a través del apego a normas.",
    tags: ["Analítico", "Preciso", "Reflexivo", "Lógico", "Cuidadoso"],
    emociones: "Puede rechazar la agresión interpersonal.",
    meta: "La exactitud.",
    juzga: "Por su capacidad de pensamiento analítico.",
    influye: "La información objetiva, los argumentos lógicos.",
    valor: "Define, esclarece, obtiene información, evalúa, comprueba.",
    abusa: "Del análisis.",
    bajo_presion: "Se vuelve aprensivo.",
    teme: "Actos irracionales, el ridículo.",
    mas_eficaz: "Si fuera más abierto, compartiera en público su perspicacia y opiniones.",
  },
  Persuasivo: {
    name: "Persuasivo",
    icon: "🤝",
    desc: "Trabaja con y a través de otros. Se esfuerza por hacer negocios amistosamente mientras persigue sus objetivos. Convence a los demás de su punto de vista y los retiene como clientes o amigos.",
    tags: ["Comunicativo", "Carismático", "Orientado a personas", "Entusiasta", "Influyente"],
    emociones: "Confía en los demás, es entusiasta.",
    meta: "Autoridad y prestigio, diversos símbolos de prestigio.",
    juzga: "Por su capacidad de expresión verbal y flexibilidad.",
    influye: "Un comportamiento amistoso, franqueza, habilidad en su expresión verbal.",
    valor: "Sabe vender y cerrar tratos, delega responsabilidades, sereno, seguridad en sí mismo.",
    abusa: "De su entusiasmo, su habilidad para vender, su optimismo.",
    bajo_presion: "Es discreto, diplomático.",
    teme: "Un ambiente inalterable, relaciones complejas.",
    mas_eficaz: "Si se le asignaran tareas que le impliquen un reto, prestara más atención al servicio y detalles, hiciera un análisis objetivo de la información.",
  },
  Promotor: {
    name: "Promotor",
    icon: "📣",
    desc: "Extensa red de contactos. Gregario y sociable. Con excelente capacidad de palabra, promueve sus ideas y genera entusiasmo hacia proyectos. Busca ambientes socialmente favorables.",
    tags: ["Sociable", "Entusiasta", "Comunicativo", "Popular", "Dinámico"],
    emociones: "Alivia tensiones, promueve proyectos y personas, incluso a sí mismo.",
    meta: "Aprobación, popularidad.",
    juzga: "Por su forma de expresarse.",
    influye: "Alabanzas, oportunidades, haciendo favores.",
    valor: "Los elogios, optimismo.",
    abusa: "De la confianza en los demás.",
    bajo_presion: "Perder aceptación social y su autoestima.",
    teme: "El desacuerdo, el conflicto.",
    mas_eficaz: "Si presentara más atención a las fechas límite, tuviera más iniciativa para realizar el trabajo.",
  },
  Consejero: {
    name: "Consejero",
    icon: "💬",
    desc: "Don particular para resolver los problemas de los demás. Impresiona con su afecto, empatía y comprensión. Prefiere tratar con personas sobre la base de una relación íntima y de confianza.",
    tags: ["Empático", "Comprensivo", "Servicial", "Leal", "Colaborador"],
    emociones: "Acepta el afecto, rechaza la agresión.",
    meta: "Ser aceptado por los demás.",
    juzga: "Por la tolerancia y participación.",
    influye: "La comprensión, amistad, armoniza, proyecta empatía, está orientado al servicio.",
    valor: "La amabilidad.",
    abusa: "De la tolerancia.",
    bajo_presion: "Se vuelve persuasivo haciendo, si fuese necesario, uso de información que posee o de amistades clave.",
    teme: "El desacuerdo, el conflicto.",
    mas_eficaz: "Si llevara a cabo el seguimiento hasta el final, mostrara empatía al estar en desacuerdo, se marcara un ritmo más realista.",
  },
  Agente: {
    name: "Agente",
    icon: "🌿",
    desc: "Le interesan las relaciones humanas y los variados aspectos del trabajo. Gracias a su empatía y tolerancia sabe escuchar. Excelente potencial de organización. Busca la armonía y cooperación.",
    tags: ["Servicial", "Tolerante", "Cooperador", "Armonizador", "Paciente"],
    emociones: "Estable, predecible, amplia esfera de amistades, sabe escuchar.",
    meta: "La amistad, la felicidad.",
    juzga: "Por las normas de amistad, después por su capacidad.",
    influye: "Por su constancia en el desempeño, por su afán de servir y adaptarse a las necesidades de los demás.",
    valor: "Planifica a corto plazo, es predecible, es congruente, mantiene un ritmo uniforme y seguro.",
    abusa: "La modestia, su miedo a correr riesgos, su resistencia pasiva hacia las innovaciones.",
    bajo_presion: "Se adapta a quienes tienen autoridad y a lo que opina el grupo.",
    teme: "Los cambios, la desorganización.",
    mas_eficaz: "Si compartiera más sus ideas, aumentara su confianza en sí mismo basándose en la retroalimentación que recibe, utilizara métodos más sencillos y directos.",
  },
  Evaluador: {
    name: "Evaluador",
    icon: "📊",
    desc: "Toma ideas creativas y las aplica para fines prácticos. Competitivo, usa métodos directos pero muestra consideración hacia los demás. Explica la lógica de las actividades para obtener cooperación.",
    tags: ["Analítico", "Competitivo", "Lógico", "Práctico", "Directo"],
    emociones: "Desapasionado, autodisciplinado.",
    meta: "El logro de resultados concretos.",
    juzga: "Por el uso de la información objetiva.",
    influye: "Por su determinación y tenacidad.",
    valor: "Seguimiento concienzudo para realizar su trabajo en forma constante y persistente.",
    abusa: "La franqueza, su desconfianza hacia los demás.",
    bajo_presion: "Tiende a interiorizar los conflictos, recuerda el mal que se le ha hecho.",
    teme: "Involucrarse con las masas, vender ideas abstractas.",
    mas_eficaz: "Si fuera más flexible, aceptara a los demás, si participara más con los demás.",
  },
  Resolutivo: {
    name: "Resolutivo",
    icon: "🔥",
    desc: "Fuertemente individualista, busca continuamente nuevos horizontes. Extremadamente autosuficiente e independiente de pensamiento y acción. Aporta soluciones innovadoras al margen de los convencionalismos.",
    tags: ["Independiente", "Innovador", "Directo", "Persistente", "Autosuficiente"],
    emociones: "Una gran expresión verbal de la fuerza del ego, muestra un fuerte individualismo.",
    meta: "Dominio e independencia.",
    juzga: "Por su capacidad para realizar las tareas con rapidez.",
    influye: "Por su fuerza de carácter y persistencia.",
    valor: "Se vuelve criticón y se dedica a encontrar errores, se niega a trabajar en equipo.",
    abusa: "De su individualismo.",
    bajo_presion: "Se aparta cuando se tienen que hacer las cosas, se torna beligerante cuando ve su individualidad amenazada.",
    teme: "Al aburrimiento, a la pérdida del control.",
    mas_eficaz: "Si mostrara más paciencia, empatía, participara y colaborara con los demás, diera más seguimiento al control de calidad.",
  },
  Orientado: {
    name: "Orientado a Resultados",
    icon: "🏆",
    desc: "Enérgico y directo, rápido de pensamiento y acción. Tiende a evitar lo que lo restrinja. Persuade a otros para que apoyen sus esfuerzos. Determinado y persistente incluso frente al antagonismo.",
    tags: ["Enérgico", "Directo", "Decidido", "Orientado a metas", "Persistente"],
    emociones: "Se torna intranquilo, crítico, impaciente.",
    meta: "Su capacidad para alcanzar las normas establecidas por él mismo.",
    juzga: "Por las soluciones a los problemas, al proyectar una imagen de poder.",
    influye: "Por el poder que generan la autoridad, la posición y los roles formales.",
    valor: "Mueve a la gente, inicia, ordena, felicita, disciplina.",
    abusa: "Se vuelve manipulador, pendenciero, beligerante.",
    bajo_presion: "Ser demasiado blando, perder su posición social.",
    teme: "La pérdida de control y de autoridad.",
    mas_eficaz: "Si llevara a cabo el seguimiento hasta el final, mostrara empatía al estar en desacuerdo, se marcara un ritmo más realista.",
  },
  Especialista: {
    name: "Especialista",
    icon: "🛠",
    desc: "Se esfuerza por conservar pautas de comportamiento conocidas. Eficiente en áreas especializadas. Planea su trabajo de manera clara y directa, logrando notoria constancia en su desempeño.",
    tags: ["Especializado", "Consistente", "Metódico", "Confiable", "Técnico"],
    emociones: "Acepta la agresión, tiende a aparentar dar poca importancia a la necesidad que tiene de afecto.",
    meta: "Controlar su ambiente o a su público.",
    juzga: "Por la forma en que proyecta su fuerza personal, carácter y posición social.",
    influye: "Por su encanto, dirección, intimidación, uso de recompensas.",
    valor: "Mueve a la gente, inicia, ordena, felicita, disciplina.",
    abusa: "Se vuelve manipulador, pendenciero, beligerante.",
    bajo_presion: "Ser demasiado blando, perder su posición social.",
    teme: "La pérdida de su especialidad o reconocimiento.",
    mas_eficaz: "Si fuera más genuina su sensibilidad, estuviera más dispuesto a ayudar a otros a tener éxito en su propio desarrollo personal.",
  },
  Investigador: {
    name: "Investigador",
    icon: "🔭",
    desc: "Se desempeña de maravilla en tareas técnicas retadoras. Responde a la lógica más que a la emoción. Prefiere trabajar solo y puede parecer sumamente directo. Busca conclusiones basadas en hechos.",
    tags: ["Analítico", "Técnico", "Lógico", "Independiente", "Meticuloso"],
    emociones: "Puede rechazar la agresión interpersonal.",
    meta: "La exactitud.",
    juzga: "Por su capacidad de pensamiento analítico.",
    influye: "La información objetiva, los argumentos lógicos.",
    valor: "Define, esclarece, obtiene información, evalúa, comprueba.",
    abusa: "Del análisis.",
    bajo_presion: "Se vuelve aprensivo.",
    teme: "Actos irracionales, el ridículo.",
    mas_eficaz: "Si fuera más abierto, compartiera en público su perspicacia y opiniones.",
  },
  Profesional: {
    name: "Profesional",
    icon: "🎖",
    desc: "Proyecta un estilo relajado, diplomático y afable. Valora la autodisciplina y evalúa a los demás sobre esa base. Expectativas elevadas consigo mismo y con los demás. Suele exteriorizar su desilusión.",
    tags: ["Profesional", "Disciplinado", "Técnico", "Confiable", "Perfeccionista"],
    emociones: "Quiere mantenerse a la altura de los demás en cuanto a esfuerzo y desempeño técnico.",
    meta: "Profundo afán por el desarrollo personal.",
    juzga: "Por su autodisciplina, sus posiciones y ascensos.",
    influye: "Hábil para resolver problemas técnicos y humanos, profesionalismo en su especialidad.",
    valor: "Quiere mantenerse a la altura de los demás en cuanto a esfuerzo y desempeño técnico.",
    abusa: "Una atención excesiva a objetivos personales, expectativas poco realistas sobre los demás.",
    bajo_presion: "Se cohibe, sensible a la crítica.",
    teme: "La pérdida de su estatus profesional.",
    mas_eficaz: "Si colaborara en forma genuina para beneficio general, delegara tareas importantes a las personas apropiadas.",
  },
  Alentador: {
    name: "Alentador",
    icon: "✨",
    desc: "Sabe exactamente los resultados que quiere pero no los verbaliza de inmediato. Ofrece a cada persona lo que busca: amistad, autoridad o seguridad según corresponda. Muy estratégico.",
    tags: ["Empático", "Observador", "Estratégico", "Servicial", "Diplomático"],
    emociones: "Confía en los demás, es entusiasta.",
    meta: "Su aceptación positiva, generalmente busca el lado bueno de las personas.",
    juzga: "Por las normas de amistad, después por capacidad.",
    influye: "Obtiene sus metas a través de los demás, por su autoridad e ingenio.",
    valor: "Es fácil de abordar, afectuoso y comprensivo.",
    abusa: "Un fuerte impulso por causar buena impresión.",
    bajo_presion: "Se torna intranquilo, crítico, impaciente.",
    teme: "La pérdida de influencia social.",
    mas_eficaz: "Si llevara a cabo el seguimiento hasta el final, mostrara empatía al estar en desacuerdo, se marcara un ritmo más realista.",
  },
  Desconcertante: {
    name: "Desconcertante",
    icon: "🌀",
    desc: "Perfil poco común con una combinación inusual de fuerzas. Puede ser difícil de predecir en su comportamiento, lo que lo hace especialmente adaptable ante situaciones cambiantes e imprevistas.",
    tags: ["Complejo", "Adaptable", "Variable", "Único", "Flexible"],
    emociones: "Variable, difícil de predecir.",
    meta: "Equilibrio entre múltiples fuerzas internas.",
    juzga: "Por criterios cambiantes según el contexto.",
    influye: "De manera impredecible, adaptándose a cada situación.",
    valor: "Su capacidad de adaptación en situaciones diversas.",
    abusa: "De la ambigüedad y la variabilidad.",
    bajo_presion: "Puede mostrar respuestas contradictorias.",
    teme: "La rigidez y los entornos muy estructurados.",
    mas_eficaz: "Si definiera prioridades claras y mantuviera una dirección más consistente.",
  },
};

// Patrones clásicos sobre segmentos. Se evalúan EN ORDEN; el primero que
// cumple define el perfil. (Portado de CLASSIC_PATTERNS del HTML.)
const CLASSIC_PATTERNS: { name: string; cond: (d: number, i: number, s: number, c: number) => boolean }[] = [
  { name: "Realizador",     cond: (d, i, s, c) => d >= 5 && d <= 6 && i >= 4 && i <= 5 && s <= 3 && c <= 4 },
  { name: "Perfeccionista", cond: (d, i, s, c) => d <= 3 && i <= 3 && s >= 4 && c >= 5 },
  { name: "Creativo",       cond: (d, i, s, c) => d >= 5 && c >= 5 && i <= 4 && s <= 4 },
  { name: "Objetivo",       cond: (d, i, s, c) => d <= 3 && i <= 3 && s <= 4 && c >= 5 },
  { name: "Persuasivo",     cond: (d, i, s, c) => d >= 4 && i >= 5 && s <= 4 && c <= 4 },
  { name: "Promotor",       cond: (d, i, s, c) => i >= 6 && d <= 4 && s <= 4 && c <= 4 },
  { name: "Consejero",      cond: (d, i, s, c) => i >= 5 && s >= 5 && d <= 4 && c <= 4 },
  { name: "Agente",         cond: (d, i, s, c) => i >= 4 && s >= 5 && d <= 4 && c <= 4 },
  { name: "Evaluador",      cond: (d, i, s, c) => d >= 4 && c >= 4 && i >= 4 && s <= 4 },
  { name: "Resolutivo",     cond: (d, i, s, c) => d >= 5 && i <= 4 && s <= 3 && c <= 3 },
  { name: "Orientado",      cond: (d, i, s, c) => d >= 6 && i <= 4 && s <= 4 && c <= 4 },
  { name: "Especialista",   cond: (d, i, s, c) => s >= 5 && c >= 4 && d <= 4 && i <= 4 },
  { name: "Investigador",   cond: (d, i, s, c) => d >= 4 && c >= 5 && i <= 3 && s <= 4 },
  { name: "Profesional",    cond: (d, i, s, c) => d >= 4 && i >= 4 && s >= 4 && c >= 4 },
  { name: "Alentador",      cond: (d, i, s, c) => i >= 5 && s >= 4 && d >= 4 && c <= 4 },
];

const DIMS: DiscDim[] = ["D", "I", "S", "C"];

export function getSegment(dim: DiscDim, val: number): number {
  const tbl = SEG_TABLE[dim];
  for (const row of tbl) {
    if (val >= row.min && val <= row.max) return row.seg;
  }
  return 4; // medio por defecto
}

export function getProfileFromSegments(seg: DiscSegments): string {
  const { D, I, S, C } = seg;
  for (const p of CLASSIC_PATTERNS) {
    if (p.cond(D, I, S, C)) return p.name;
  }
  // Fallback: mayor segmento, o Desconcertante si todo está muy parejo.
  const arr = DIMS.map((d) => [d, seg[d]] as const).sort((a, b) => b[1] - a[1]);
  const top = arr[0][0];
  const max = Math.max(D, I, S, C);
  const min = Math.min(D, I, S, C);
  if (max - min <= 1) return "Desconcertante";
  const byTop: Record<DiscDim, string> = { D: "Resolutivo", I: "Alentador", S: "Especialista", C: "Objetivo" };
  return byTop[top] || "Evaluador";
}

// Letras primaria+secundaria a partir de los 2 segmentos más altos.
// Empata por puntaje crudo y, en última instancia, por orden D-I-S-C.
export function lettersFromSegments(seg: DiscSegments, raw: DiscScores): string {
  const order = DIMS.slice().sort((a, b) => {
    if (seg[b] !== seg[a]) return seg[b] - seg[a];
    if (raw[b] !== raw[a]) return raw[b] - raw[a];
    return DIMS.indexOf(a) - DIMS.indexOf(b);
  });
  return order.slice(0, 2).join("");
}

export type DiscResult = {
  raw: DiscScores;
  segments: DiscSegments;
  profileKey: string;
  letters: string;
};

// Núcleo: dado el set de respuestas (una por grupo), calcula el resultado.
export function computeDisc(answers: DiscAnswer[]): DiscResult {
  const raw: DiscScores = { D: 0, I: 0, S: 0, C: 0 };
  for (let g = 0; g < WORD_GROUPS.length; g++) {
    const a = answers[g];
    if (!a || a.m == null || a.l == null) continue;
    const mDim = WORD_GROUPS[g][a.m]?.[1];
    const lDim = WORD_GROUPS[g][a.l]?.[1];
    if (mDim) raw[mDim] += 1;
    if (lDim) raw[lDim] -= 1;
  }
  const segments: DiscSegments = {
    D: getSegment("D", raw.D),
    I: getSegment("I", raw.I),
    S: getSegment("S", raw.S),
    C: getSegment("C", raw.C),
  };
  const profileKey = getProfileFromSegments(segments);
  const letters = lettersFromSegments(segments, raw);
  return { raw, segments, profileKey, letters };
}

export const TOTAL_GROUPS = WORD_GROUPS.length;
