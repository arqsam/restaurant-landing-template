import type {
  BrandType,
  Hours,
  SiteConfig,
  Weekday,
} from "../content/types.ts";

/**
 * Metadatos SEO y datos estructurados `schema.org` generados desde `site.ts`.
 * Se inyectan en `index.html` al compilar (ver `vite.config.ts`), porque los
 * rastreadores y las vistas previas de redes sociales no ejecutan JavaScript.
 * Este archivo no usa nada del navegador: también lo carga Node.
 */

/** Tipo de `schema.org` según el giro del negocio. */
const SCHEMA_TYPES: Record<BrandType, string> = {
  bakery: "Bakery",
  restaurant: "Restaurant",
  catering: "FoodEstablishment",
};

export function schemaTypeFor(type: BrandType): string {
  return SCHEMA_TYPES[type];
}

const DAY_NAMES: Record<Weekday, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

const WEEK: Weekday[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

/** "https://sitio.mx/" y "/ruta" → "https://sitio.mx/ruta". Las URL absolutas no se tocan. */
export function absoluteUrl(siteUrl: string, path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const base = siteUrl.replace(/\/+$/, "");
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** Teléfono en formato internacional: 10 dígitos se asumen de México. */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 ? `+52${digits}` : `+${digits}`;
}

/** Agrupa los días con el mismo horario; los días cerrados no aparecen. */
export function buildOpeningHours(hours: Hours) {
  const groups = new Map<
    string,
    { days: string[]; opens: string; closes: string }
  >();
  for (const day of WEEK) {
    const slot = hours.schedule[day];
    if (!slot) continue;
    const key = `${slot.open}-${slot.close}`;
    const group = groups.get(key) ?? {
      days: [],
      opens: slot.open,
      closes: slot.close,
    };
    group.days.push(DAY_NAMES[day]);
    groups.set(key, group);
  }
  return [...groups.values()].map((group) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: group.days,
    opens: group.opens,
    closes: group.closes,
  }));
}

/** Imagen para compartir: la de SEO o, si falta, la del hero. */
function socialImage(site: SiteConfig): string {
  return absoluteUrl(site.seo.siteUrl, site.seo.ogImage ?? site.hero.image.src);
}

/** Datos estructurados del negocio local (Google lo usa para su ficha). */
export function buildJsonLd(site: SiteConfig) {
  const { seo, brand, contact, orders } = site;
  const home = absoluteUrl(seo.siteUrl, "/");
  const openingHours = buildOpeningHours(site.hours);

  return {
    "@context": "https://schema.org",
    "@type": schemaTypeFor(brand.type),
    "@id": `${home}#negocio`,
    name: brand.name,
    description: seo.description,
    url: home,
    image: socialImage(site),
    telephone: formatPhone(orders.whatsapp),
    email: contact.email,
    ...(seo.priceRange ? { priceRange: seo.priceRange } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: seo.address.street,
      addressLocality: seo.address.locality,
      addressRegion: seo.address.region,
      postalCode: seo.address.postalCode,
      addressCountry: seo.address.country,
    },
    ...(seo.geo
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: seo.geo.latitude,
            longitude: seo.geo.longitude,
          },
        }
      : {}),
    hasMap: contact.mapsUrl,
    hasMenu: absoluteUrl(seo.siteUrl, "/#menu"),
    ...(openingHours.length > 0
      ? { openingHoursSpecification: openingHours }
      : {}),
    ...(seo.sameAs && seo.sameAs.length > 0 ? { sameAs: seo.sameAs } : {}),
  };
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** JSON seguro para ir dentro de `<script>`: evita que `</script>` cierre la etiqueta. */
export function jsonForScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/** "es_MX" → "es-MX" (atributo `lang` de HTML). */
export function htmlLang(locale: string): string {
  return locale.replace("_", "-");
}

/** Etiquetas `<head>` completas: título, descripción, canónica, Open Graph, Twitter y JSON-LD. */
export function buildHeadTags(site: SiteConfig): string {
  const { seo, brand } = site;
  const home = absoluteUrl(seo.siteUrl, "/");
  const image = socialImage(site);
  const meta = (attr: "name" | "property", key: string, value: string) =>
    `<meta ${attr}="${key}" content="${escapeHtml(value)}" />`;

  return [
    `<title>${escapeHtml(seo.title)}</title>`,
    meta("name", "description", seo.description),
    `<link rel="canonical" href="${escapeHtml(home)}" />`,
    meta("name", "theme-color", brand.colors.primary),
    meta("property", "og:type", "website"),
    meta("property", "og:locale", seo.locale),
    meta("property", "og:site_name", brand.name),
    meta("property", "og:title", seo.title),
    meta("property", "og:description", seo.description),
    meta("property", "og:url", home),
    meta("property", "og:image", image),
    meta("name", "twitter:card", "summary_large_image"),
    meta("name", "twitter:title", seo.title),
    meta("name", "twitter:description", seo.description),
    meta("name", "twitter:image", image),
    `<script type="application/ld+json">${jsonForScript(buildJsonLd(site))}</script>`,
  ].join("\n    ");
}

/**
 * Aplica el SEO a un `index.html`: idioma, título único y etiquetas al final del
 * `<head>`. Lo usa el plugin de Vite y se puede probar sin navegador.
 */
export function injectSeo(html: string, site: SiteConfig): string {
  if (!/<\/head>/i.test(html)) {
    throw new Error(
      "index.html no tiene </head>: no se puede inyectar el SEO.",
    );
  }
  const lang = htmlLang(site.seo.locale);
  const withLang = /<html[^>]*\slang="[^"]*"/i.test(html)
    ? html.replace(/(<html[^>]*\s)lang="[^"]*"/i, `$1lang="${lang}"`)
    : html.replace(/<html/i, `<html lang="${lang}"`);
  const withoutTitle = withLang.replace(/<title>[\s\S]*?<\/title>\s*/i, "");
  // Con una función, `$$` y `$&` del contenido (p. ej. "$$" en priceRange) no se interpretan.
  const tags = buildHeadTags(site);
  return withoutTitle.replace(/<\/head>/i, () => `${tags}\n  </head>`);
}
