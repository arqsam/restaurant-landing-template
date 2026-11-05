import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.ts";

// Reutiliza la configuración de Vite (plugin de React, alias) y añade la de pruebas.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
      css: false,
      // Las pruebas de interfaz con userEvent tardan más cuando varios archivos
      // corren en paralelo (jsdom se crea una vez por archivo). 5 s es el valor
      // por defecto y se quedaba corto en equipos con carga.
      testTimeout: 15_000,
    },
  }),
);
