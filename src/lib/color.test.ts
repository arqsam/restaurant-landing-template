import { describe, expect, it } from "vitest";
import {
  bestTextColor,
  contrastRatio,
  ensureContrast,
  luminance,
  parseHex,
  toHex,
} from "./color";

describe("parseHex / toHex", () => {
  it("convierte #RRGGBB en componentes y de vuelta", () => {
    expect(parseHex("#3b2a24")).toEqual([59, 42, 36]);
    expect(toHex([59, 42, 36])).toBe("#3b2a24");
  });

  it("acepta mayúsculas y devuelve minúsculas", () => {
    expect(toHex(parseHex("#C26A4A"))).toBe("#c26a4a");
  });

  it("lanza un error con formatos inválidos", () => {
    expect(() => parseHex("red")).toThrow(/#RRGGBB/);
    expect(() => parseHex("#fff")).toThrow();
    expect(() => parseHex("#12345g")).toThrow();
  });
});

describe("luminance y contrastRatio", () => {
  it("negro = 0 y blanco = 1", () => {
    expect(luminance("#000000")).toBeCloseTo(0, 5);
    expect(luminance("#ffffff")).toBeCloseTo(1, 5);
  });

  it("negro sobre blanco da 21:1 y un color consigo mismo 1:1", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 1);
    expect(contrastRatio("#c26a4a", "#c26a4a")).toBeCloseTo(1, 5);
  });

  it("es simétrico", () => {
    expect(contrastRatio("#3b2a24", "#fbf7f2")).toBeCloseTo(
      contrastRatio("#fbf7f2", "#3b2a24"),
      5,
    );
  });
});

describe("bestTextColor", () => {
  it("usa texto claro sobre fondos oscuros y oscuro sobre fondos claros", () => {
    expect(bestTextColor("#000000")).toBe("#ffffff");
    expect(bestTextColor("#ffffff")).toBe("#1a1412");
  });

  it("sobre el acento de ejemplo (#c26a4a) elige texto oscuro, que sí pasa AA", () => {
    const text = bestTextColor("#c26a4a");
    expect(text).toBe("#1a1412");
    expect(contrastRatio(text, "#c26a4a")).toBeGreaterThanOrEqual(4.5);
  });
});

describe("ensureContrast", () => {
  it("no cambia un color que ya cumple", () => {
    expect(ensureContrast("#2a211e", "#fbf7f2")).toBe("#2a211e");
  });

  it("oscurece un color que no cumple hasta alcanzar el contraste pedido", () => {
    const original = "#c26a4a";
    expect(contrastRatio(original, "#fbf7f2")).toBeLessThan(4.5);
    const fixed = ensureContrast(original, "#fbf7f2", 4.5);
    expect(contrastRatio(fixed, "#fbf7f2")).toBeGreaterThanOrEqual(4.5);
  });

  it("devuelve negro si ningún tono alcanza el contraste", () => {
    expect(ensureContrast("#ffffff", "#ffffff", 21)).toBe("#000000");
  });
});
