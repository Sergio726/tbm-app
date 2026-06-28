// El Sistema LOST — las 4 dimensiones canónicas (C1).
// Definiciones de docs/METODO_TBM_CANONICO.md §1; mapeo módulo→dimensión de §7.
// El mapa se ancla a los MÓDULOS del app (lo que el usuario navega), no a las 8 sesiones.

export type LostModule = { label: string; href: string };

export type LostDimension = {
  letter: "L" | "O" | "S" | "T";
  name: string;
  essence: string;
  color: string;
  modules: LostModule[];
};

export const LOST_DIMENSIONS: LostDimension[] = [
  {
    letter: "L",
    name: "Liderazgo estratégico",
    essence: "Decidí solo lo que solo vos podés decidir.",
    color: "var(--accent-text)",
    modules: [
      { label: "Mi Equipo", href: "/equipo" },
      { label: "Feedback S.E.C.", href: "/feedback" },
      { label: "Multiplicador", href: "/multiplicador" },
    ],
  },
  {
    letter: "O",
    name: "Operaciones optimizadas",
    essence: "Eliminá lo que no genera valor y delegá con sistema.",
    color: "var(--warn-text)",
    modules: [
      { label: "Delegación", href: "/delegacion" },
      { label: "Parking Lot", href: "/rituales/parking-lot" },
    ],
  },
  {
    letter: "S",
    name: "Sistemas escalables",
    essence: "Procesos que funcionan sin vos.",
    color: "var(--success-text)",
    modules: [
      { label: "Plan 90D", href: "/plan-90d" },
      { label: "Workbooks", href: "/workbooks" },
      { label: "Diagnósticos", href: "/diagnosticos" },
    ],
  },
  {
    letter: "T",
    name: "Tiempo multiplicado",
    essence: "Cada hora genera resultados exponenciales.",
    color: "#a78bfa",
    modules: [{ label: "Rituales", href: "/rituales" }],
  },
];
