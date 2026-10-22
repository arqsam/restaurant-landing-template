import { bestTextColor, ensureContrast, parseHex, toHex } from "./color";

/** Fondo claro por defecto de la plantilla (debe coincidir con --color-bg en tokens.css). */
export const LIGHT_BG = "#fbf7f2";

export interface BrandColors {
  primary: string;
  accent: string;
}

/**
 * Deriva las variables CSS de marca a partir de los dos colores de la
 * configuración. Además de los colores base calcula:
 * - texto legible sobre cada color (para botones y fondos de marca);
 * - una versión del acento apta para TEXTO sobre fondo claro (contraste ≥ 4.5).
 */
export function buildThemeVars(colors: BrandColors): Record<string, string> {
  const primary = toHex(parseHex(colors.primary));
  const accent = toHex(parseHex(colors.accent));
  return {
    "--color-primary": primary,
    "--color-on-primary": bestTextColor(primary),
    "--color-accent": accent,
    "--color-on-accent": bestTextColor(accent),
    "--color-accent-text": ensureContrast(accent, LIGHT_BG, 4.5),
  };
}

export function applyTheme(
  vars: Record<string, string>,
  target: HTMLElement = document.documentElement,
): void {
  for (const [name, value] of Object.entries(vars)) {
    target.style.setProperty(name, value);
  }
}
