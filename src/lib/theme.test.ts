import { describe, expect, it } from "vitest";
import { contrastRatio } from "./color";
import { LIGHT_BG, applyTheme, buildThemeVars } from "./theme";

describe("buildThemeVars", () => {
  const vars = buildThemeVars({ primary: "#3B2A24", accent: "#C26A4A" });

  it("normaliza los colores de marca a minúsculas", () => {
    expect(vars["--color-primary"]).toBe("#3b2a24");
    expect(vars["--color-accent"]).toBe("#c26a4a");
  });

  it("calcula texto legible (AA) sobre el color primario y el acento", () => {
    expect(
      contrastRatio(vars["--color-on-primary"], vars["--color-primary"]),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(vars["--color-on-accent"], vars["--color-accent"]),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it("deriva una versión del acento apta para texto sobre fondo claro", () => {
    expect(
      contrastRatio(vars["--color-accent-text"], LIGHT_BG),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it("falla con un color inválido en lugar de aplicar un tema roto", () => {
    expect(() =>
      buildThemeVars({ primary: "marrón", accent: "#c26a4a" }),
    ).toThrow();
  });
});

describe("applyTheme", () => {
  it("escribe las variables en el elemento indicado", () => {
    const element = document.createElement("div");
    applyTheme({ "--color-primary": "#112233" }, element);
    expect(element.style.getPropertyValue("--color-primary")).toBe("#112233");
  });
});
