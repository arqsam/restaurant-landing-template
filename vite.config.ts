import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { site } from "./src/content/site.ts";
import { injectSeo } from "./src/lib/seo.ts";

/** Inyecta título, metadatos y JSON-LD (generados desde site.ts) en index.html. */
function seoHead(): Plugin {
  return {
    name: "seo-head",
    transformIndexHtml: (html) => injectSeo(html, site),
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), seoHead()],
});
