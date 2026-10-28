/**
 * Utilidades para revisar las imágenes del sitio sin dependencias: leen el
 * tamaño real de un WebP o JPG, interpretan `srcSet` y reproducen cómo elige
 * el navegador una variante. Las usan las pruebas y `dist-weight.ts`.
 */

export interface Size {
  width: number;
  height: number;
}

const ascii = (bytes: Uint8Array, start: number, length: number) =>
  String.fromCharCode(...bytes.slice(start, start + length));

/** Ancho y alto de un WebP (formatos VP8, VP8L y VP8X). */
export function webpSize(bytes: Uint8Array): Size {
  if (ascii(bytes, 0, 4) !== "RIFF" || ascii(bytes, 8, 4) !== "WEBP") {
    throw new Error("No es un archivo WebP.");
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const kind = ascii(bytes, 12, 4);
  if (kind === "VP8 ") {
    return {
      width: view.getUint16(26, true) & 0x3fff,
      height: view.getUint16(28, true) & 0x3fff,
    };
  }
  if (kind === "VP8L") {
    const bits = view.getUint32(21, true);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (kind === "VP8X") {
    const read24 = (offset: number) =>
      bytes[offset]! | (bytes[offset + 1]! << 8) | (bytes[offset + 2]! << 16);
    return { width: read24(24) + 1, height: read24(27) + 1 };
  }
  throw new Error(`Formato WebP no reconocido: "${kind}".`);
}

/** Ancho y alto de un JPG (marcadores SOF). */
export function jpegSize(bytes: Uint8Array): Size {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    throw new Error("No es un archivo JPG.");
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = bytes[offset + 1]!;
    // SOF0..SOF15, salvo DHT (C4), JPG (C8) y DAC (CC)
    if (
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc
    ) {
      return {
        height: view.getUint16(offset + 5),
        width: view.getUint16(offset + 7),
      };
    }
    offset += 2 + view.getUint16(offset + 2);
  }
  throw new Error("No se encontró el tamaño del JPG.");
}

export interface SrcSetCandidate {
  url: string;
  /** Ancho en píxeles que declara el descriptor ("480w"). */
  width: number;
}

/** "/a-480.webp 480w, /a-960.webp 960w" → [{url, width}, ...] */
export function parseSrcSet(srcSet: string): SrcSetCandidate[] {
  return srcSet
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [url, descriptor = ""] = part.split(/\s+/);
      const match = /^(\d+)w$/.exec(descriptor);
      if (!url || !match) {
        throw new Error(`Descriptor de srcSet no válido: "${part}".`);
      }
      return { url, width: Number(match[1]) };
    });
}

/**
 * Variante que descargaría el navegador: la más chica que cubra el ancho
 * necesario (ancho de pantalla × densidad) o, si ninguna alcanza, la más grande.
 */
export function pickCandidate(
  candidates: SrcSetCandidate[],
  neededWidth: number,
): SrcSetCandidate {
  const sorted = [...candidates].sort((a, b) => a.width - b.width);
  const last = sorted[sorted.length - 1];
  if (!last) throw new Error("srcSet vacío.");
  return sorted.find((candidate) => candidate.width >= neededWidth) ?? last;
}

export interface SiteImage {
  /** Dónde está en la configuración, p. ej. "menu.0.items.1.image". */
  path: string;
  src: string;
  srcSet?: string;
  width: number;
  height: number;
  alt: string;
}

/** Recorre la configuración y devuelve todo objeto con forma de imagen. */
export function collectImages(value: unknown, path = "site"): SiteImage[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      collectImages(item, `${path}.${index}`),
    );
  }
  if (typeof value !== "object" || value === null) return [];
  const record = value as Record<string, unknown>;
  if (
    typeof record.src === "string" &&
    typeof record.width === "number" &&
    typeof record.height === "number"
  ) {
    return [
      {
        path,
        src: record.src,
        srcSet: typeof record.srcSet === "string" ? record.srcSet : undefined,
        width: record.width,
        height: record.height,
        alt: typeof record.alt === "string" ? record.alt : "",
      },
    ];
  }
  return Object.entries(record).flatMap(([key, child]) =>
    collectImages(child, `${path}.${key}`),
  );
}
