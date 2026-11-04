import { cateringSite } from "./samples/catering.ts";
import { site as bakerySite } from "./site.ts";
import type { SiteConfig } from "./types.ts";

/**
 * Configuración que usa la aplicación. Por defecto es la de la pastelería de
 * ejemplo (`site.ts`); con `--mode catering` (npm run dev:catering o
 * build:catering) es la del negocio de catering. Vite sustituye el modo al
 * compilar, así que el bundle solo incluye la configuración elegida.
 *
 * Un negocio real no necesita esto: edita `site.ts` y listo (ver ADR 0007).
 */
export const site: SiteConfig =
  import.meta.env.MODE === "catering" ? cateringSite : bakerySite;
