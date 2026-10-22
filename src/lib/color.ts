// Utilidades de color y contraste (WCAG 2.x). Sin dependencias.

export type Rgb = readonly [number, number, number];

const HEX_6 = /^#[0-9a-f]{6}$/i;

/** Convierte "#RRGGBB" a [r, g, b]. Lanza un error si el formato no es válido. */
export function parseHex(hex: string): Rgb {
  if (!HEX_6.test(hex)) {
    throw new Error(`Color inválido "${hex}": se espera el formato #RRGGBB`);
  }
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

export function toHex([r, g, b]: Rgb): string {
  const part = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${part(r)}${part(g)}${part(b)}`;
}

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** Luminancia relativa (0 negro, 1 blanco). */
export function luminance(hex: string): number {
  const [r, g, b] = parseHex(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** Relación de contraste entre dos colores (1 a 21). AA texto normal: ≥ 4.5. */
export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Elige entre texto claro u oscuro el que mejor contraste tenga sobre `background`. */
export function bestTextColor(
  background: string,
  light = "#ffffff",
  dark = "#1a1412",
): string {
  return contrastRatio(light, background) >= contrastRatio(dark, background)
    ? light
    : dark;
}

/**
 * Oscurece `foreground` hacia el negro, en pasos del 2 %, hasta alcanzar el
 * contraste mínimo contra `background`. Si ya lo cumple, lo devuelve igual.
 */
export function ensureContrast(
  foreground: string,
  background: string,
  minRatio = 4.5,
): string {
  const [r, g, b] = parseHex(foreground);
  for (let step = 0; step <= 50; step++) {
    const k = step / 50;
    const candidate = toHex([r * (1 - k), g * (1 - k), b * (1 - k)]);
    if (contrastRatio(candidate, background) >= minRatio) return candidate;
  }
  return "#000000";
}
