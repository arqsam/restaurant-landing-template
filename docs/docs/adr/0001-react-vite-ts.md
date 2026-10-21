# ADR 0001 — React + TypeScript + Vite

**Estado:** Aceptado · **Fecha:** 2026-10-20

**Contexto.** El autor ya tiene un proyecto en Vue (Lumera). Las ofertas freelance de frontend piden React con mayor frecuencia, y el portafolio debe mostrar dominio de ambos.

**Decisión.** React + TypeScript (strict) con Vite como bundler y Vitest como runner de pruebas.

**Razones.** Mercado laboral, ecosistema, arranque rápido de Vite y reutilización de las pruebas con Testing Library (ya conocida).

**Alternativas descartadas.** Next.js (SSR innecesario para una página estática, más complejidad de despliegue); Vue (ya cubierto por Lumera).

**Consecuencias.** SPA estática: el SEO depende de los metadatos en `index.html`; si un cliente necesitara SEO avanzado se migraría a Next/Astro.
