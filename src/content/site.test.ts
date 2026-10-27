import { describe, expect, it } from "vitest";
import { site } from "./site";

const HEX = /^#[0-9a-f]{6}$/i;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

function unique(values: string[]) {
  return new Set(values).size === values.length;
}

describe("site config (Mallow & Crumb)", () => {
  const items = site.menu.flatMap((category) => category.items);

  it("define la etiqueta del enlace al menú para la navegación", () => {
    expect(site.nav.menuLabel.trim().length).toBeGreaterThan(0);
  });

  it("el encabezado del menú tiene texto y su énfasis está dentro del título", () => {
    const { eyebrow, title, titleEmphasis } = site.menuIntro;
    expect(eyebrow.trim().length).toBeGreaterThan(0);
    expect(title.trim().length).toBeGreaterThan(0);
    if (titleEmphasis) expect(title).toContain(titleEmphasis);
  });

  it("la imagen del hero tiene texto alternativo y dimensiones", () => {
    const { image } = site.hero;
    expect(image.alt.trim().length).toBeGreaterThan(0);
    expect(image.width).toBeGreaterThan(0);
    expect(image.height).toBeGreaterThan(0);
  });

  it("el énfasis del título del hero es un fragmento del propio título", () => {
    const { title, titleEmphasis } = site.hero;
    if (titleEmphasis) expect(title).toContain(titleEmphasis);
  });

  it("usa colores de marca en formato #RRGGBB", () => {
    expect(site.brand.colors.primary).toMatch(HEX);
    expect(site.brand.colors.accent).toMatch(HEX);
  });

  it("los ids del menú son únicos", () => {
    expect(unique(site.menu.map((category) => category.id))).toBe(true);
    expect(unique(items.map((item) => item.id))).toBe(true);
  });

  it("todos los precios del menú son enteros positivos", () => {
    for (const item of items) {
      expect(Number.isInteger(item.price)).toBe(true);
      expect(item.price).toBeGreaterThan(0);
    }
  });

  it('los precios "desde" no bajan del tamaño más económico del personalizador', () => {
    const cheapest = Math.min(
      ...site.customizer.sizes.map((size) => size.price),
    );
    for (const item of items.filter((i) => i.priceFrom)) {
      expect(item.price).toBeGreaterThanOrEqual(cheapest);
    }
  });

  it("las fotos del menú tienen texto alternativo y dimensiones", () => {
    for (const item of items) {
      if (!item.image) continue;
      expect(item.image.alt.trim().length).toBeGreaterThan(0);
      expect(item.image.width).toBeGreaterThan(0);
      expect(item.image.height).toBeGreaterThan(0);
    }
  });

  it("los encabezados de destacados y catering tienen texto y énfasis válido", () => {
    for (const intro of [site.featured, site.cateringIntro]) {
      expect(intro.eyebrow.trim().length).toBeGreaterThan(0);
      expect(intro.title.trim().length).toBeGreaterThan(0);
      if (intro.titleEmphasis)
        expect(intro.title).toContain(intro.titleEmphasis);
    }
  });

  it("los paquetes tienen ids únicos, descripción y al menos un elemento incluido", () => {
    expect(unique(site.packages.map((p) => p.id))).toBe(true);
    for (const pkg of site.packages) {
      expect(pkg.description.trim().length).toBeGreaterThan(0);
      expect(pkg.includes.length).toBeGreaterThan(0);
      if (pkg.pricePerPerson !== undefined) {
        expect(Number.isInteger(pkg.pricePerPerson)).toBe(true);
        expect(pkg.pricePerPerson).toBeGreaterThan(0);
      }
    }
  });

  it("las bebidas de catering no repiten ids del menú y tienen precios enteros", () => {
    const menuIds = new Set(items.map((item) => item.id));
    for (const drink of site.beverages?.items ?? []) {
      expect(menuIds.has(drink.id)).toBe(false);
      expect(Number.isInteger(drink.price)).toBe(true);
    }
  });

  it("los encabezados de cómo pedir, galería y reseñas tienen texto y énfasis válido", () => {
    for (const intro of [site.howToOrder, site.gallery, site.testimonials]) {
      expect(intro.eyebrow.trim().length).toBeGreaterThan(0);
      expect(intro.title.trim().length).toBeGreaterThan(0);
      if (intro.titleEmphasis)
        expect(intro.title).toContain(intro.titleEmphasis);
    }
  });

  it("las fotos de la galería tienen dimensiones y los pasos de pedido tienen texto", () => {
    for (const image of site.gallery.images) {
      expect(image.width).toBeGreaterThan(0);
      expect(image.height).toBeGreaterThan(0);
    }
    expect(site.howToOrder.steps.length).toBeGreaterThanOrEqual(3);
    for (const step of site.howToOrder.steps) {
      expect(step.title.trim().length).toBeGreaterThan(0);
      expect(step.description.trim().length).toBeGreaterThan(0);
    }
  });

  it("cada categoría indica si es de vitrina o por encargo y hay textos para ambos", () => {
    for (const category of [
      ...site.menu,
      ...(site.beverages ? [site.beverages] : []),
    ]) {
      expect(["vitrina", "encargo"]).toContain(category.availability);
    }
    for (const copy of Object.values(site.orders.itemOrder)) {
      expect(copy.label.trim().length).toBeGreaterThan(0);
      expect(copy.badge.trim().length).toBeGreaterThan(0);
      expect(copy.message).toContain("{item}");
    }
  });

  it("el encabezado de contacto tiene texto y énfasis válido", () => {
    const { eyebrow, title, titleEmphasis } = site.contactIntro;
    expect(eyebrow.trim().length).toBeGreaterThan(0);
    expect(title.trim().length).toBeGreaterThan(0);
    if (titleEmphasis) expect(title).toContain(titleEmphasis);
  });

  it("cada día abierto cierra después de abrir y la zona horaria es válida", () => {
    expect(
      () => new Intl.DateTimeFormat("es-MX", { timeZone: site.hours.timeZone }),
    ).not.toThrow();
    for (const day of Object.values(site.hours.schedule)) {
      if (day) expect(day.close > day.open).toBe(true);
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
    expect(site.nav.customizerLabel.trim().length).toBeGreaterThan(0);
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

  it("los destacados apuntan a platillos que existen", () => {
    const ids = new Set(items.map((item) => item.id));
    for (const id of site.featured.itemIds) {
      expect(ids.has(id)).toBe(true);
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

  it("los paquetes de catering tienen ids únicos y precio por persona positivo", () => {
    expect(unique(site.packages.map((p) => p.id))).toBe(true);
    for (const pack of site.packages) {
      expect(pack.pricePerPerson ?? 1).toBeGreaterThan(0);
    }
  });

  it("los horarios cubren los 7 días con formato HH:mm", () => {
    const days = Object.keys(site.hours.schedule);
    expect(days.sort()).toEqual([
      "fri",
      "mon",
      "sat",
      "sun",
      "thu",
      "tue",
      "wed",
    ]);
    for (const day of Object.values(site.hours.schedule)) {
      if (day) {
        expect(day.open).toMatch(TIME);
        expect(day.close).toMatch(TIME);
      }
    }
  });

  it("los pedidos tienen WhatsApp válido, anticipo entre 1 y 100 y anticipación no negativa", () => {
    expect(site.orders.whatsapp).toMatch(/^52\d{10}$/);
    expect(site.orders.depositPercent).toBeGreaterThanOrEqual(1);
    expect(site.orders.depositPercent).toBeLessThanOrEqual(100);
    expect(site.orders.minLeadDays).toBeGreaterThanOrEqual(0);
  });

  it("el SEO respeta longitudes razonables", () => {
    expect(site.seo.title.length).toBeLessThanOrEqual(60);
    expect(site.seo.description.length).toBeLessThanOrEqual(160);
  });

  it("las reseñas de la configuración de ejemplo están marcadas como de muestra", () => {
    for (const review of site.testimonials.items) {
      expect(review.isSample).toBe(true);
    }
  });

  it("las imágenes de la galería tienen texto alternativo", () => {
    for (const image of site.gallery.images) {
      expect(image.alt.trim().length).toBeGreaterThan(0);
    }
  });

  it("el formulario de cotización tiene todos sus textos y un proveedor admitido", () => {
    for (const [key, value] of Object.entries(site.contactForm)) {
      expect(value.trim().length, key).toBeGreaterThan(0);
    }
    expect(["web3forms", "formspree"]).toContain(site.contact.formProvider);
  });
});
