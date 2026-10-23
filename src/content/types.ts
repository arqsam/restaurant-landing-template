// Contrato de contenido de la plantilla. Todo lo que cambia entre un cliente y
// otro (marca, menú, horarios, pedidos) vive en un objeto de este tipo
// (src/content/site.ts). Los componentes no deben tener texto "a fuego".

export type BrandType = "restaurant" | "bakery" | "catering";

export type DietTag =
  | "vegano"
  | "sin-gluten"
  | "sin-lactosa"
  | "picante"
  | "contiene-nueces";

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

/** Hora en formato 24 h "HH:mm", por ejemplo "09:30". */
export type Time = string;

/** Foto cuadrada de un platillo (se muestra como miniatura). */
export interface MenuImage {
  src: string;
  /** Variantes para pantallas de alta densidad, p. ej. "/a-240.webp 240w, /a-480.webp 480w". */
  srcSet?: string;
  width: number;
  height: number;
  /** Describe lo que se ve en la foto; no repite el nombre del platillo. */
  alt: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  /** Precio en pesos mexicanos (entero). */
  price: number;
  /** true: el precio es "desde" (p. ej. pasteles que se arman a medida). */
  priceFrom?: boolean;
  image?: MenuImage;
  tags?: DietTag[];
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface CateringPackage {
  id: string;
  name: string;
  description: string;
  minPeople?: number;
  pricePerPerson?: number;
  includes: string[];
}

export interface DaySchedule {
  open: Time;
  close: Time;
}

export interface Hours {
  /** Zona horaria IANA, por ejemplo "America/Mexico_City". */
  timeZone: string;
  /** null = cerrado ese día. */
  schedule: Record<Weekday, DaySchedule | null>;
}

// --- Personalizador "Arma tu pedido" -------------------------------------

export interface CakeSize {
  id: string;
  label: string;
  servings: number;
  price: number;
}

export interface CustomizerOption {
  id: string;
  label: string;
  extraPrice?: number;
}

export interface Palette {
  id: string;
  label: string;
  /** Colores en hexadecimal (#RRGGBB) para mostrar la muestra. */
  colors: string[];
}

export interface DecorationStyle {
  id: string;
  label: string;
  description: string;
  image?: string;
  extraPrice?: number;
  palettes: Palette[];
}

export interface Customizer {
  title: string;
  sizes: CakeSize[];
  flavors: CustomizerOption[];
  fillings: CustomizerOption[];
  decorations: DecorationStyle[];
  dedication?: { maxChars: number; extraPrice?: number };
}

// --- Secciones de contenido ----------------------------------------------

export interface HowToOrderStep {
  title: string;
  description: string;
}

export interface GalleryImage {
  src: string;
  alt: string;
}

export interface Testimonial {
  name: string;
  text: string;
  /** true = reseña de muestra; la interfaz debe indicarlo. */
  isSample: boolean;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface HeroImage {
  src: string;
  /** Variantes responsivas, p. ej. "/img-720.webp 720w, /img-1080.webp 1080w". */
  srcSet?: string;
  sizes?: string;
  /** Dimensiones intrínsecas de `src` (evitan saltos de diseño). */
  width: number;
  height: number;
  /** Texto alternativo (obligatorio por accesibilidad). */
  alt: string;
}

// --- Configuración completa ----------------------------------------------

/** Encabezado de una sección: sobretítulo, título (con énfasis opcional) y subtítulo. */
export interface SectionIntro {
  eyebrow: string;
  title: string;
  /** Fragmento del título que se muestra en cursiva (debe estar dentro de `title`). */
  titleEmphasis?: string;
  subtitle?: string;
}

export interface SiteConfig {
  brand: {
    name: string;
    type: BrandType;
    tagline: string;
    colors: { primary: string; accent: string };
    logo?: string;
  };
  seo: {
    title: string;
    description: string;
    ogImage?: string;
  };
  /** Textos cortos de la navegación que dependen del tipo de negocio. */
  nav: {
    /** Etiqueta del enlace al menú o catálogo: "Menú", "Pastelería", "Carta"... */
    menuLabel: string;
  };
  /** Encabezado editorial de la sección de menú o catálogo. */
  menuIntro: SectionIntro;
  /** Activa o desactiva secciones opcionales. Hero, Contacto y Footer siempre se muestran. */
  sections: {
    featured: boolean;
    customizer: boolean;
    catering: boolean;
    gallery: boolean;
    testimonials: boolean;
    faq: boolean;
  };
  hero: {
    title: string;
    /** Fragmento del título que se muestra en cursiva y color de acento (debe estar dentro de `title`). */
    titleEmphasis?: string;
    subtitle: string;
    image: HeroImage;
    ctaLabel: string;
  };
  menu: MenuCategory[];
  featured: { title: string; itemIds: string[] };
  customizer: Customizer;
  packages: CateringPackage[];
  howToOrder: { title: string; steps: HowToOrderStep[] };
  gallery: { title: string; images: GalleryImage[] };
  testimonials: { title: string; items: Testimonial[] };
  faq: { title: string; items: FaqItem[] };
  hours: Hours;
  orders: {
    /** Número de WhatsApp con código de país y sin símbolos, p. ej. "525512345678". */
    whatsapp: string;
    defaultMessage: string;
    /** Días mínimos de anticipación para un pedido. */
    minLeadDays: number;
    /** Porcentaje de anticipo (1-100). */
    depositPercent: number;
    paymentNote: string;
  };
  contact: {
    email: string;
    address: string;
    mapsUrl: string;
    formProvider: "web3forms" | "formspree";
    /** Llave pública del proveedor (no es un secreto, ver ADR 0003). */
    formKey: string;
  };
}
