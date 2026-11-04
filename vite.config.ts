import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { cateringSite } from "./src/content/samples/catering.ts";
import { site as bakerySite } from "./src/content/site.ts";
import type { SiteConfig } from "./src/content/types.ts";
import { injectSeo } from "./src/lib/seo.ts";

/**
 * Inyecta título, metadatos y JSON-LD (generados desde la configuración) en
 * index.html. Con `--mode catering` usa la configuración de catering; en
 * cualquier otro modo, la de la pastelería (ver src/content/active.ts).
 */
function seoHead(): Plugin {
  let site: SiteConfig = bakerySite;
  return {
    name: "seo-head",
    configResolved(config) {
      site = config.mode === "catering" ? cateringSite : bakerySite;
    },
    transformIndexHtml: (html) => injectSeo(html, site),
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), seoHead()],
});
