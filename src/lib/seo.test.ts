import { describe, expect, it } from "vitest";
import { site } from "../content/site";
import type { SiteConfig } from "../content/types";
import {
  absoluteUrl,
  buildHeadTags,
  buildHeroPreload,
  buildJsonLd,
  buildOpeningHours,
  formatPhone,
  htmlLang,
  injectSeo,
  jsonForScript,
  schemaTypeFor,
} from "./seo";

const withSeo = (change: Partial<SiteConfig["seo"]>): SiteConfig => ({
  ...site,
  seo: { ...site.seo, ...change },
});

/** Extrae y parsea el JSON-LD de un bloque de HTML. */
function readJsonLd(html: string) {
  const match =
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html);
  if (!match) throw new Error("no hay JSON-LD");
  return JSON.parse(match[1]);
}

describe("schemaTypeFor", () => {
  it("elige el tipo de schema.org según el giro", () => {
    expect(schemaTypeFor("bakery")).toBe("Bakery");
    expect(schemaTypeFor("restaurant")).toBe("Restaurant");
    expect(schemaTypeFor("catering")).toBe("FoodEstablishment");
  });
});

describe("absoluteUrl", () => {
  it("une el sitio con rutas relativas, con o sin barras", () => {
    expect(absoluteUrl("https://a.mx", "/img/x.jpg")).toBe(
      "https://a.mx/img/x.jpg",
    );
    expect(absoluteUrl("https://a.mx/", "img/x.jpg")).toBe(
      "https://a.mx/img/x.jpg",
    );
    expect(absoluteUrl("https://a.mx", "/")).toBe("https://a.mx/");
  });
  it("no toca las URL que ya son absolutas", () => {
    expect(absoluteUrl("https://a.mx", "https://cdn.com/x.jpg")).toBe(
      "https://cdn.com/x.jpg",
    );
  });
});

describe("formatPhone", () => {
  it("antepone +52 a números de 10 dígitos y respeta los internacionales", () => {
    expect(formatPhone("55 1234 5678")).toBe("+525512345678");
    expect(formatPhone("525512345678")).toBe("+525512345678");
  });
});

describe("buildOpeningHours", () => {
  it("agrupa los días con el mismo horario y omite los cerrados", () => {
    const rows = buildOpeningHours(site.hours);
    expect(rows).toContainEqual({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Tuesday", "Wednesday", "Thursday"],
      opens: "09:00",
      closes: "19:00",
    });
    const days = rows.flatMap((row) => row.dayOfWeek);
    expect(days).not.toContain("Monday");
    expect(days).toContain("Sunday");
    expect(new Set(days).size).toBe(days.length);
  });
});

describe("buildJsonLd", () => {
  const data = buildJsonLd(site);

  it("describe un negocio local con su tipo, nombre y URL", () => {
    expect(data["@context"]).toBe("https://schema.org");
    expect(data["@type"]).toBe("Bakery");
    expect(data.name).toBe(site.brand.name);
    expect(data.url).toBe("https://mallowandcrumb.example/");
  });

  it("usa URL absolutas para la imagen y el menú", () => {
    expect(data.image).toBe(
      "https://mallowandcrumb.example/images/og-image.jpg",
    );
    expect(data.hasMenu).toBe("https://mallowandcrumb.example/#menu");
  });

  it("incluye teléfono internacional, correo y dirección postal", () => {
    expect(data.telephone).toBe("+525500000000");
    expect(data.email).toBe(site.contact.email);
    expect(data.address).toEqual({
      "@type": "PostalAddress",
      streetAddress: site.seo.address.street,
      addressLocality: site.seo.address.locality,
      addressRegion: site.seo.address.region,
      postalCode: site.seo.address.postalCode,
      addressCountry: "MX",
    });
  });

  it("omite lo opcional que no está configurado", () => {
    const bare = buildJsonLd(
      withSeo({ priceRange: undefined, geo: undefined, sameAs: undefined }),
    );
    expect("priceRange" in bare).toBe(false);
    expect("geo" in bare).toBe(false);
    expect("sameAs" in bare).toBe(false);
  });

  it("incluye geo y perfiles cuando existen", () => {
    const full = buildJsonLd(
      withSeo({
        geo: { latitude: 19.43, longitude: -99.13 },
        sameAs: ["https://instagram.com/mallowcrumb"],
      }),
    );
    expect(full.geo).toEqual({
      "@type": "GeoCoordinates",
      latitude: 19.43,
      longitude: -99.13,
    });
    expect(full.sameAs).toEqual(["https://instagram.com/mallowcrumb"]);
  });

  it("sin la imagen de SEO usa la del hero", () => {
    const fallback = buildJsonLd(withSeo({ ogImage: undefined }));
    expect(fallback.image).toBe(
      `https://mallowandcrumb.example${site.hero.image.src}`,
    );
  });

  it("el tipo cambia con el giro del negocio", () => {
    const restaurant = buildJsonLd({
      ...site,
      brand: { ...site.brand, type: "restaurant" },
    });
    expect(restaurant["@type"]).toBe("Restaurant");
  });
});

describe("buildHeadTags", () => {
  const html = buildHeadTags(site);

  it("incluye título y descripción, con los símbolos escapados", () => {
    expect(html).toContain(
      "<title>Mallow &amp; Crumb | Pastelería y postres bajo pedido</title>",
    );
    expect(html).toContain(
      `<meta name="description" content="${site.seo.description}" />`,
    );
  });

  it("incluye URL canónica, color del navegador y Open Graph", () => {
    expect(html).toContain(
      '<link rel="canonical" href="https://mallowandcrumb.example/" />',
    );
    expect(html).toContain('<meta name="theme-color" content="#3b2a24" />');
    expect(html).toContain('<meta property="og:type" content="website" />');
    expect(html).toContain('<meta property="og:locale" content="es_MX" />');
    expect(html).toContain(
      '<meta property="og:image" content="https://mallowandcrumb.example/images/og-image.jpg" />',
    );
  });

  it("incluye la tarjeta grande de Twitter con imagen absoluta", () => {
    expect(html).toContain(
      '<meta name="twitter:card" content="summary_large_image" />',
    );
    expect(html).toContain(
      '<meta name="twitter:image" content="https://mallowandcrumb.example/images/og-image.jpg" />',
    );
  });

  it("el JSON-LD se puede leer de vuelta y coincide con la configuración", () => {
    expect(readJsonLd(html).name).toBe(site.brand.name);
  });

  it("un nombre con </script> no puede cerrar la etiqueta ni inyectar HTML", () => {
    const hostile = buildHeadTags({
      ...site,
      brand: { ...site.brand, name: 'Dulce</script><script>alert("x")' },
    });
    expect(hostile.match(/<script/g)).toHaveLength(1);
    expect(readJsonLd(hostile).name).toBe('Dulce</script><script>alert("x")');
  });
});

describe("buildHeroPreload", () => {
  it("precarga la foto del hero con el mismo srcset y sizes que la imagen", () => {
    const tag = buildHeroPreload(site);
    const { image } = site.hero;
    expect(tag).toContain('rel="preload" as="image"');
    expect(tag).toContain(`href="${image.src}"`);
    expect(tag).toContain(`imagesrcset="${image.srcSet}"`);
    expect(tag).toContain(`imagesizes="${image.sizes}"`);
    expect(tag).toContain('fetchpriority="high"');
  });

  it("sin srcset solo lleva el href", () => {
    const plain = buildHeroPreload({
      ...site,
      hero: {
        ...site.hero,
        image: { ...site.hero.image, srcSet: undefined },
      },
    });
    expect(plain).toContain(`href="${site.hero.image.src}"`);
    expect(plain).not.toContain("imagesrcset");
  });

  it("va dentro del head, justo después del título", () => {
    const head = buildHeadTags(site);
    expect(head.indexOf("<title>")).toBeLessThan(head.indexOf('rel="preload"'));
    expect(head.indexOf('rel="preload"')).toBeLessThan(
      head.indexOf('name="description"'),
    );
  });
});

describe("jsonForScript / htmlLang", () => {
  it("escapa el signo < del JSON", () => {
    expect(jsonForScript({ a: "</script>" })).not.toContain("<");
  });
  it("convierte es_MX en es-MX", () => {
    expect(htmlLang("es_MX")).toBe("es-MX");
  });
});

describe("injectSeo", () => {
  const base = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>tmp-app</title>
  </head>
  <body><div id="root"></div></body>
</html>`;
  const out = injectSeo(base, site);

  it("cambia el idioma, deja un solo título y no toca el cuerpo", () => {
    expect(out).toContain('<html lang="es-MX">');
    expect(out.match(/<title>/g)).toHaveLength(1);
    expect(out).not.toContain("tmp-app");
    expect(out).toContain('<body><div id="root"></div></body>');
  });

  it("pone las etiquetas dentro del head", () => {
    const head = out.slice(out.indexOf("<head>"), out.indexOf("</head>"));
    expect(head).toContain("og:title");
    expect(head).toContain("application/ld+json");
    expect(head).toContain('<meta charset="UTF-8" />');
  });

  it("conserva los signos de pesos del contenido, como el rango de precios $$", () => {
    expect(readJsonLd(out).priceRange).toBe("$$");
    const tricky = injectSeo(
      base,
      withSeo({ description: "Desde $$ y $& hasta $1" }),
    );
    expect(tricky).toContain('content="Desde $$ y $&amp; hasta $1"');
  });

  it("agrega lang si el html no lo traía", () => {
    expect(injectSeo(base.replace(' lang="en"', ""), site)).toContain(
      '<html lang="es-MX">',
    );
  });

  it("falla con claridad si no hay head", () => {
    expect(() => injectSeo("<html><body></body></html>", site)).toThrow(
      /head/i,
    );
  });
});
