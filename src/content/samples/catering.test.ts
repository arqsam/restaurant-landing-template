import { describe, expect, it } from "vitest";
import { contrastRatio } from "../../lib/color";
import { resolveContactLabels } from "../../lib/contactForm";
import { buildHeroFacts } from "../../lib/hero";
import { SECTION_IDS, buildNavLinks } from "../../lib/nav";
import { buildHeadTags, buildJsonLd } from "../../lib/seo";
import { LIGHT_BG, buildThemeVars } from "../../lib/theme";
import { describeSiteContract } from "../contract";
import { site as bakery } from "../site";
import { cateringSite } from "./catering";

/** Todos los textos de una configuración (solo valores, no nombres de campos). */
function textsOf(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(textsOf);
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(textsOf);
  }
  return [];
}

const idsOf = (config: typeof bakery | typeof cateringSite) =>
  config.menu.flatMap((category) => category.items.map((item) => item.id));

describeSiteContract("Nerita Catering", cateringSite);

describe("Nerita Catering: una marca distinta con la misma plantilla (AC-04)", () => {
  it("es otra marca, con otros colores, otro menú y otras fotos", () => {
    expect(cateringSite.brand.name).not.toBe(bakery.brand.name);
    expect(cateringSite.brand.type).toBe("catering");
    expect(cateringSite.brand.colors).not.toEqual(bakery.brand.colors);
    const shared = idsOf(cateringSite).filter((id) =>
      idsOf(bakery).includes(id),
    );
    expect(shared).toEqual([]);
    const images = textsOf(cateringSite).filter((text) =>
      text.startsWith("/images/"),
    );
    expect(images.length).toBeGreaterThan(10);
    for (const url of images) {
      expect(url.startsWith("/images/nerita/"), url).toBe(true);
    }
  });

  it("no queda ningún texto de la pastelería de ejemplo", () => {
    const leaks = textsOf(cateringSite).filter((text) =>
      /mallow|crumb|pastel|postre|pasteler|hornead|horno/i.test(text),
    );
    expect(leaks).toEqual([]);
  });

  it("no define el personalizador de pasteles y su sección está apagada", () => {
    expect(cateringSite.sections.customizer).toBe(false);
    expect(cateringSite.customizer).toBeUndefined();
  });

  it("la navegación solo muestra las secciones del negocio", () => {
    expect(buildNavLinks(cateringSite).map((link) => link.label)).toEqual([
      "Carta",
      "Catering",
      "Galería",
      "Contacto",
    ]);
    expect(buildNavLinks(cateringSite).map((link) => link.id)).not.toContain(
      SECTION_IDS.customizer,
    );
  });

  it("usa el hero en tono oscuro, con la foto sin velo claro", () => {
    expect(cateringSite.hero.tone).toBe("dark");
    expect(bakery.hero.tone).toBeUndefined();
  });

  it("los colores de marca producen un tema legible (contraste ≥ 4.5:1)", () => {
    const vars = buildThemeVars(cateringSite.brand.colors);
    expect(
      contrastRatio(vars["--color-primary"], LIGHT_BG),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(vars["--color-on-primary"], vars["--color-primary"]),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(vars["--color-accent-text"], LIGHT_BG),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(vars["--color-on-accent"], vars["--color-accent"]),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it("el hero resume la anticipación y el anticipo propios del negocio", () => {
    expect(buildHeroFacts(cateringSite.orders)).toEqual([
      "Eventos y charolas por encargo con 5 días de anticipación",
      "Anticipo del 50 %",
    ]);
  });

  it("el formulario habla de eventos y de cocina, no de pasteles ni de tienda", () => {
    const labels = resolveContactLabels({
      type: cateringSite.contactForm.typeLabels,
      fulfillment: cateringSite.contactForm.fulfillmentLabels,
    });
    expect(labels.type.catering).toBe("Evento con barra de mariscos");
    const all = [
      ...Object.values(labels.type),
      ...Object.values(labels.fulfillment),
    ].join(" ");
    expect(all).not.toMatch(/pastel|postre|tienda/i);
  });

  it("genera su propio SEO: título, imagen para compartir, preload del hero y tipo de negocio", () => {
    const head = buildHeadTags(cateringSite);
    expect(head).toContain(
      "<title>Nerita Catering | Barras de mariscos para eventos en CDMX</title>",
    );
    expect(head).toContain(
      "https://neritacatering.example/images/nerita/og-image.jpg",
    );
    expect(head).toContain('rel="preload" as="image"');
    expect(head).toContain("/images/nerita/hero-1080.webp");
    expect(head).not.toMatch(/mallow/i);
    expect(buildJsonLd(cateringSite)["@type"]).toBe("FoodEstablishment");
  });

  it("los destacados son platillos de la carta", () => {
    expect(cateringSite.featured.itemIds).toHaveLength(3);
  });
});
