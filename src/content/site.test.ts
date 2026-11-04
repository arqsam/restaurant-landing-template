import { describe, expect, it } from "vitest";
import { describeSiteContract } from "./contract";
import { site } from "./site";

const HEX = /^#[0-9a-f]{6}$/i;

function unique(values: string[]) {
  return new Set(values).size === values.length;
}

describeSiteContract("Mallow & Crumb", site);

describe("site config (Mallow & Crumb): personalizador", () => {
  const items = site.menu.flatMap((category) => category.items);

  it('los precios "desde" no bajan del tamaño más económico del personalizador', () => {
    const cheapest = Math.min(
      ...site.customizer.sizes.map((size) => size.price),
    );
    for (const item of items.filter((i) => i.priceFrom)) {
      expect(item.price).toBeGreaterThanOrEqual(cheapest);
    }
  });

  it("el personalizador tiene el texto de introducción para WhatsApp", () => {
    expect(site.customizer.orderIntro.trim().length).toBeGreaterThan(0);
  });

  it("el personalizador tiene módulo de entrada, fruta con ids únicos y límite válido", () => {
    const { teaser, fruits, maxFruits } = site.customizer;
    expect(teaser.eyebrow.trim().length).toBeGreaterThan(0);
    expect(teaser.ctaLabel.trim().length).toBeGreaterThan(0);
    expect(teaser.resumeLabel.trim().length).toBeGreaterThan(0);
    if (teaser.titleEmphasis)
      expect(teaser.title).toContain(teaser.titleEmphasis);
    expect(site.nav.customizerLabel?.trim().length).toBeGreaterThan(0);
    expect((fruits ?? []).length).toBeGreaterThan(0);
    expect(unique((fruits ?? []).map((f) => f.id))).toBe(true);
    if (maxFruits !== undefined) expect(maxFruits).toBeGreaterThan(0);
  });

  it("las fotos de referencia de las decoraciones tienen texto alternativo y dimensiones", () => {
    for (const decoration of site.customizer.decorations) {
      if (!decoration.image) continue;
      expect(decoration.image.alt.trim().length).toBeGreaterThan(0);
      expect(decoration.image.width).toBeGreaterThan(0);
      expect(decoration.image.height).toBeGreaterThan(0);
    }
  });

  it("el personalizador tiene opciones con ids únicos y datos válidos", () => {
    const { sizes, flavors, fillings, decorations } = site.customizer;
    expect(unique(sizes.map((s) => s.id))).toBe(true);
    expect(unique(flavors.map((f) => f.id))).toBe(true);
    expect(unique(fillings.map((f) => f.id))).toBe(true);
    expect(unique(decorations.map((d) => d.id))).toBe(true);
    for (const size of sizes) {
      expect(size.servings).toBeGreaterThan(0);
      expect(size.price).toBeGreaterThan(0);
    }
    for (const decoration of decorations) {
      expect(decoration.palettes.length).toBeGreaterThan(0);
      expect(unique(decoration.palettes.map((p) => p.id))).toBe(true);
      for (const palette of decoration.palettes) {
        for (const color of palette.colors) expect(color).toMatch(HEX);
      }
    }
  });

  it("el personalizador tiene el texto del botón que lleva el pastel al formulario", () => {
    expect(site.customizer.requestLabel.trim().length).toBeGreaterThan(0);
  });
});
