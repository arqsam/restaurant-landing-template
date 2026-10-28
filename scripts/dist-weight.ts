/**
 * Estima el peso de la primera carga del sitio compilado (RNF-03: ≤ 1.5 MB).
 *
 * Uso: npm run build && npm run weight   (o: node scripts/dist-weight.ts [carpeta])
 *
 * Suma el HTML, el CSS y el JS (comprimidos con gzip, como los sirve Vercel) más
 * la foto del hero que descargaría cada tipo de pantalla. No cuenta las imágenes
 * de más abajo en la página: se cargan con `loading="lazy"` al acercarse.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { site } from "../src/content/site.ts";
import { parseSrcSet, pickCandidate } from "./images.ts";

const BUDGET_KB = 1.5 * 1024;
const dist = process.argv[2] ?? "dist";

const SCENARIOS = [
  { name: "Móvil 375 px a 2x", width: 375, density: 2 },
  { name: "Móvil 412 px a 1.75x (Lighthouse)", width: 412, density: 1.75 },
  { name: "Móvil 390 px a 3x", width: 390, density: 3 },
  { name: "Escritorio 1280 px a 1x", width: 1280, density: 1 },
  { name: "Escritorio 1440 px a 2x", width: 1440, density: 2 },
];

const kb = (bytes: number) => bytes / 1024;
const gzipKb = (file: string) => kb(gzipSync(readFileSync(file)).length);

if (!existsSync(`${dist}/index.html`)) {
  console.error(
    `No existe ${dist}/index.html. Ejecuta "npm run build" primero.`,
  );
  process.exit(1);
}

const html = readFileSync(`${dist}/index.html`, "utf8");
const assets = [...html.matchAll(/(?:src|href)="(\/[^"]+\.(?:js|css))"/g)].map(
  (match) => match[1]!,
);
const htmlKb = gzipKb(`${dist}/index.html`);
const codeKb = assets.reduce((sum, url) => sum + gzipKb(`${dist}${url}`), 0);

console.log(
  `HTML: ${htmlKb.toFixed(1)} KB · CSS y JS (${assets.length} archivos): ${codeKb.toFixed(1)} KB (gzip)\n`,
);

const candidates = parseSrcSet(site.hero.image.srcSet ?? site.hero.image.src);
let worst = 0;
for (const scenario of SCENARIOS) {
  const needed = Math.ceil(scenario.width * scenario.density);
  const hero = pickCandidate(candidates, needed);
  const heroKb = kb(statSync(`${dist}${hero.url}`).size);
  const total = htmlKb + codeKb + heroKb;
  worst = Math.max(worst, total);
  console.log(
    `${scenario.name.padEnd(36)} hero ${String(hero.width).padStart(4)} px = ${heroKb.toFixed(0).padStart(4)} KB   total ${total.toFixed(0).padStart(4)} KB`,
  );
}

const ok = worst <= BUDGET_KB;
console.log(
  `\nPeor caso: ${worst.toFixed(0)} KB de ${BUDGET_KB.toFixed(0)} KB (${ok ? "dentro" : "FUERA"} del presupuesto)`,
);
process.exitCode = ok ? 0 : 1;
