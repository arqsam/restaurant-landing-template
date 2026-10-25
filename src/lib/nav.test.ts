import { describe, expect, it } from "vitest";
import { site } from "../content/site";
import { SECTION_IDS, buildNavLinks } from "./nav";

const nav = { menuLabel: "Pastelería", customizerLabel: "Arma tu pastel" };
const allOn = site.sections;
const allOff = {
  featured: false,
  customizer: false,
  catering: false,
  gallery: false,
  testimonials: false,
  faq: false,
};

describe("buildNavLinks", () => {
  it("con todo activo devuelve 5 enlaces en orden", () => {
    expect(buildNavLinks({ sections: allOn, nav }).map((l) => l.id)).toEqual([
      SECTION_IDS.menu,
      SECTION_IDS.customizer,
      SECTION_IDS.catering,
      SECTION_IDS.gallery,
      SECTION_IDS.contact,
    ]);
  });

  it("el primer enlace usa la etiqueta del negocio definida en la configuración", () => {
    expect(buildNavLinks({ sections: allOn, nav })[0].label).toBe("Pastelería");
    expect(
      buildNavLinks({ sections: allOn, nav: { ...nav, menuLabel: "Carta" } })[0]
        .label,
    ).toBe("Carta");
  });

  it("con todo desactivado deja solo el menú y Contacto", () => {
    expect(buildNavLinks({ sections: allOff, nav }).map((l) => l.id)).toEqual([
      SECTION_IDS.menu,
      SECTION_IDS.contact,
    ]);
  });

  it("no incluye Catering ni Galería si están desactivados", () => {
    const ids = buildNavLinks({
      sections: { ...allOn, catering: false, gallery: false },
      nav,
    }).map((l) => l.id);
    expect(ids).not.toContain(SECTION_IDS.catering);
    expect(ids).not.toContain(SECTION_IDS.gallery);
  });

  it("el personalizador usa su etiqueta y desaparece al desactivarlo", () => {
    const on = buildNavLinks({ sections: allOn, nav });
    expect(on[1]).toEqual({
      id: SECTION_IDS.customizer,
      label: "Arma tu pastel",
    });
    const off = buildNavLinks({
      sections: { ...allOn, customizer: false },
      nav,
    }).map((l) => l.id);
    expect(off).not.toContain(SECTION_IDS.customizer);
  });

  it("horarios y preguntas no aparecen nunca en la navegación", () => {
    const ids = buildNavLinks({ sections: allOn, nav }).map((l) => l.id);
    expect(ids).not.toContain(SECTION_IDS.hours);
    expect(ids).not.toContain(SECTION_IDS.faq);
  });

  it("los ids de ancla son únicos", () => {
    const ids = Object.values(SECTION_IDS);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
