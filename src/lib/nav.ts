import type { SiteConfig } from "../content/types";

/**
 * Ids de ancla. Los de navegación principal (menu, catering, gallery, contact)
 * son secciones, igual que el personalizador (customizer); horarios, FAQ y formulario de cotización son
 * subsecciones que viven dentro de Contacto y no aparecen en el menú.
 */
export const SECTION_IDS = {
  hero: "inicio",
  featured: "destacados",
  menu: "menu",
  customizer: "personalizar",
  howToOrder: "como-pedir",
  catering: "catering",
  gallery: "galeria",
  testimonials: "resenas",
  hours: "horarios",
  faq: "faq",
  quote: "cotizar",
  contact: "contacto",
} as const;

export interface NavLink {
  id: string;
  label: string;
}

/**
 * Navegación principal (hasta 5 enlaces), según la configuración:
 * - el menú o catálogo, con la etiqueta del negocio;
 * - el personalizador, si está activo (módulo propio que abre el diseñador);
 * - Catering y Galería, si están activos;
 * - Contacto, que agrupa horarios, ubicación, preguntas frecuentes y el formulario.
 */
export function buildNavLinks(
  config: Pick<SiteConfig, "sections" | "nav">,
): NavLink[] {
  const { sections, nav } = config;
  const candidates: Array<NavLink & { enabled: boolean }> = [
    { id: SECTION_IDS.menu, label: nav.menuLabel, enabled: true },
    {
      id: SECTION_IDS.customizer,
      label: nav.customizerLabel,
      enabled: sections.customizer,
    },
    { id: SECTION_IDS.catering, label: "Catering", enabled: sections.catering },
    { id: SECTION_IDS.gallery, label: "Galería", enabled: sections.gallery },
    { id: SECTION_IDS.contact, label: "Contacto", enabled: true },
  ];
  return candidates
    .filter((link) => link.enabled)
    .map(({ id, label }) => ({ id, label }));
}
