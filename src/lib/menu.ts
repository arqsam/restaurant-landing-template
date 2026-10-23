import type { DietTag } from "../content/types";

/** Texto visible de cada etiqueta de dieta o alérgeno. */
export const DIET_TAG_LABELS: Record<DietTag, string> = {
  vegano: "Vegano",
  "sin-gluten": "Sin gluten",
  "sin-lactosa": "Sin lactosa",
  picante: "Picante",
  "contiene-nueces": "Contiene nueces",
};

/** Id del ancla de una categoría del menú (único dentro de la página). */
export function categoryAnchorId(categoryId: string): string {
  return `menu-${categoryId}`;
}
