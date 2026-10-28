import { readdirSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { site } from "../src/content/site.ts";
import {
  collectImages,
  jpegSize,
  parseSrcSet,
  pickCandidate,
  webpSize,
} from "./images.ts";

// `npm test` siempre corre desde la raíz del proyecto.
const PUBLIC = resolve(process.cwd(), "public");
const KB = 1024;

const fileOf = (url: string) => `${PUBLIC}${url}`;
const sizeOf = (url: string) => statSync(fileOf(url)).size;
const readWebp = (url: string) => webpSize(readFileSync(fileOf(url)));

/** Todas las URL de imagen de la configuración (src y variantes de srcSet). */
const images = collectImages(site);
const urls = [
  ...new Set(
    images.flatMap((image) => [
      image.src,
      ...(image.srcSet ? parseSrcSet(image.srcSet).map((c) => c.url) : []),
    ]),
  ),
];

/** Peso máximo por archivo según su ancho en píxeles. */
function budgetKb(width: number): number {
  if (width <= 480) return 60;
  if (width <= 960) return 160;
  if (width <= 1080) return 200;
  if (width <= 1440) return 300;
  return 500;
}

describe("helpers de imágenes", () => {
  it("parseSrcSet lee url y ancho de cada variante", () => {
    expect(parseSrcSet("/a-480.webp 480w, /a-960.webp 960w")).toEqual([
      { url: "/a-480.webp", width: 480 },
      { url: "/a-960.webp", width: 960 },
    ]);
  });

  it("parseSrcSet rechaza descriptores que no son de ancho", () => {
    expect(() => parseSrcSet("/a.webp 2x")).toThrow(/no válido/);
  });

  it("pickCandidate elige la más chica que cubre el ancho, o la mayor si ninguna alcanza", () => {
    const list = [
      { url: "a", width: 720 },
      { url: "b", width: 1080 },
      { url: "c", width: 1920 },
    ];
    expect(pickCandidate(list, 750).url).toBe("b");
    expect(pickCandidate(list, 720).url).toBe("a");
    expect(pickCandidate(list, 4000).url).toBe("c");
  });

  it("webpSize rechaza archivos que no son WebP", () => {
    expect(() => webpSize(new Uint8Array(40))).toThrow(/WebP/);
  });
});

describe("imágenes del sitio", () => {
  it("la configuración tiene imágenes y todas se encontraron", () => {
    expect(images.length).toBeGreaterThan(20);
  });

  it("todas son WebP", () => {
    for (const url of urls) expect(url, url).toMatch(/\.webp$/);
  });

  it("todos los archivos existen", () => {
    for (const url of urls) expect(() => sizeOf(url), url).not.toThrow();
  });

  it("todas tienen texto alternativo", () => {
    for (const image of images) {
      expect(image.alt.trim().length, image.path).toBeGreaterThan(0);
    }
  });

  it("el ancho y alto declarados coinciden con el archivo real de src", () => {
    for (const image of images) {
      const real = readWebp(image.src);
      expect({ width: image.width, height: image.height }, image.path).toEqual(
        real,
      );
    }
  });

  it("cada variante de srcSet mide lo que dice su descriptor y conserva la proporción", () => {
    for (const image of images) {
      if (!image.srcSet) continue;
      const ratio = image.height / image.width;
      for (const candidate of parseSrcSet(image.srcSet)) {
        const real = readWebp(candidate.url);
        expect(real.width, candidate.url).toBe(candidate.width);
        expect(
          Math.abs(real.height - candidate.width * ratio),
          candidate.url,
        ).toBeLessThanOrEqual(2);
      }
    }
  });

  it("no sobra ninguna imagen en public/images (todas se usan)", () => {
    const used = new Set([...urls, site.seo.ogImage]);
    const found: string[] = [];
    const walk = (dir: string, prefix: string) => {
      for (const name of readdirSync(dir)) {
        const full = `${dir}/${name}`;
        if (statSync(full).isDirectory()) walk(full, `${prefix}/${name}`);
        else found.push(`${prefix}/${name}`);
      }
    };
    walk(`${PUBLIC}/images`, "/images");
    expect(found.filter((url) => !used.has(url))).toEqual([]);
  });

  it("ningún archivo pasa su presupuesto de peso según su ancho", () => {
    for (const url of urls) {
      const { width } = readWebp(url);
      expect(sizeOf(url) / KB, url).toBeLessThanOrEqual(budgetKb(width));
    }
  });

  it("el hero que baja un móvil común pesa menos de 120 KB (375 px a 2x, 414 px a 2x y el móvil que emula Lighthouse)", () => {
    const candidates = parseSrcSet(site.hero.image.srcSet!);
    for (const needed of [375 * 2, 414 * 2, Math.ceil(412 * 1.75)]) {
      const chosen = pickCandidate(candidates, needed);
      expect(sizeOf(chosen.url) / KB, `${needed}px`).toBeLessThan(120);
    }
  });
});

describe("imagen para compartir", () => {
  const og = site.seo.ogImage!;

  it("mide 1200×630 y pesa menos de 250 KB", () => {
    expect(jpegSize(readFileSync(fileOf(og)))).toEqual({
      width: 1200,
      height: 630,
    });
    expect(sizeOf(og) / KB).toBeLessThan(250);
  });
});
