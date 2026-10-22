import type { SiteConfig } from "../content/types";

/**
 * Ids de ancla. Los de navegación principal (menu, catering, gallery, contact)
 * son secciones; personalizador, horarios y FAQ son subsecciones que viven
 * dentro de Pastelería (menu) y Contacto (contact) y no aparecen en el menú.
 */
export const SECTION_IDS = {
  hero: "inicio",
  menu: "menu",
  customizer: "personalizar",
  catering: "catering",
  gallery: "galeria",
  testimonials: "resenas",
  hours: "horarios",
  faq: "faq",
  contact: "contacto",
} as const;

export interface NavLink {
  id: string;
  label: string;
}

/**
 * Navegación principal compacta (hasta 4 enlaces), según la configuración:
 * - el menú o catálogo (con el personalizador dentro), con la etiqueta del negocio;
 * - Catering y Galería, si están activos;
 * - Contacto, que agrupa horarios, ubicación, preguntas frecuentes y el formulario.
 */
export function buildNavLinks(
  config: Pick<SiteConfig, "sections" | "nav">,
): NavLink[] {
  const { sections, nav } = config;
  const candidates: Array<NavLink & { enabled: boolean }> = [
    { id: SECTION_IDS.menu, label: nav.menuLabel, enabled: true },
    { id: SECTION_IDS.catering, label: "Catering", enabled: sections.catering },
    { id: SECTION_IDS.gallery, label: "Galería", enabled: sections.gallery },
    { id: SECTION_IDS.contact, label: "Contacto", enabled: true },
  ];
  return candidates
    .filter((link) => link.enabled)
    .map(({ id, label }) => ({ id, label }));
}
