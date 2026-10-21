# ADR 0002 — Contenido como configuración tipada y CSS sin librerías de UI

> Nota v1.1: el contenido incluye ahora el menú, los horarios y los datos de pedido (nicho restaurantes).

**Estado:** Aceptado · **Fecha:** 2026-10-20

**Decisión.**
1. Todo el contenido vive en `src/content/site.ts`, tipado con `SiteConfig`.
2. Estilos con CSS Modules y variables CSS (tokens), sin Tailwind ni librería de componentes.

**Razones.** Un archivo tipado evita errores al personalizar y hace medible el criterio AC-04. CSS Modules + variables permiten cambiar la marca sin recompilar estilos y mantienen el bundle pequeño (RNF-03).

**Alternativas descartadas.** CMS headless (fuera de alcance, añade dependencia); Tailwind (rápido, pero los tokens por cliente son más directos con variables CSS); MUI/Chakra (peso y apariencia genérica).

**Consecuencias.** La personalización exige editar código, aceptable para el modelo de servicio del autor. Si se quisiera vender a no técnicos, habría que añadir un editor (v2).
