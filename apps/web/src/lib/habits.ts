// Catálogo curado de hábitos sugeridos para el Pre-game (A3.1).
// El usuario elige algunos (tope MAX_HABITS) y puede sumar los propios.
// Set inicial — afinar con Dilio sin bloquear; las claves (`key`) son estables
// porque se guardan en user_habits.catalog_key.

export type HabitCategory = "movimiento" | "mente" | "cuerpo" | "nutricion";

export type HabitCatalogItem = {
  key: string;
  label: string;
  emoji: string;
  category: HabitCategory;
};

export const HABIT_CATEGORY_META: Record<
  HabitCategory,
  { label: string; emoji: string }
> = {
  movimiento: { label: "Movimiento", emoji: "🏃" },
  mente: { label: "Mente", emoji: "🧠" },
  cuerpo: { label: "Cuerpo", emoji: "💪" },
  nutricion: { label: "Nutrición", emoji: "🥗" },
};

export const HABIT_CATEGORIES: HabitCategory[] = [
  "movimiento",
  "mente",
  "cuerpo",
  "nutricion",
];

export const HABIT_CATALOG: HabitCatalogItem[] = [
  // Movimiento
  { key: "gym", label: "Entrenar / gym", emoji: "🏋️", category: "movimiento" },
  { key: "caminar", label: "Caminar 30 min", emoji: "🚶", category: "movimiento" },
  { key: "estirar", label: "Estirar al despertar", emoji: "🤸", category: "movimiento" },
  // Mente
  { key: "meditar", label: "Meditar", emoji: "🧘", category: "mente" },
  { key: "leer", label: "Leer 10 min", emoji: "📖", category: "mente" },
  { key: "journal", label: "Escribir / journaling", emoji: "📝", category: "mente" },
  { key: "sin_celu", label: "30 min sin celular al despertar", emoji: "📵", category: "mente" },
  // Cuerpo
  { key: "agua", label: "Tomar agua al despertar", emoji: "💧", category: "cuerpo" },
  { key: "sol", label: "Luz de sol temprano", emoji: "☀️", category: "cuerpo" },
  { key: "dormir", label: "Dormí 7+ horas", emoji: "😴", category: "cuerpo" },
  { key: "ducha_fria", label: "Ducha fría", emoji: "🚿", category: "cuerpo" },
  // Nutrición
  { key: "no_azucar", label: "Sin azúcar en la mañana", emoji: "🚫", category: "nutricion" },
  { key: "desayuno", label: "Desayuno proteico", emoji: "🍳", category: "nutricion" },
  { key: "no_cafe_vacio", label: "Nada de café en ayunas", emoji: "☕", category: "nutricion" },
];

/** Tope de hábitos activos en el checklist (Dilio: "elige algunos, 5–10"). */
export const MAX_HABITS = 10;

/** Emoji por defecto para un hábito propio sin emoji elegido. */
export const CUSTOM_HABIT_EMOJI = "⭐";

export function catalogItem(key: string): HabitCatalogItem | undefined {
  return HABIT_CATALOG.find((h) => h.key === key);
}
