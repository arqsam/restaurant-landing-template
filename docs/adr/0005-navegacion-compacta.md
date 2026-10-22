# ADR 0005 — Navegación principal compacta

**Estado:** Aceptado · **Fecha:** 2026-10-21

## Contexto
La primera versión del Header (Issue #9) tenía 7 enlaces: Menú, Personaliza, Catering, Galería, Horarios, Preguntas y Contacto. En la revisión visual se vio como ruido, sobre todo en móvil, y mezclaba secciones de contenido con información de apoyo.

## Decisión
1. La navegación principal tiene **hasta 4 enlaces**: el menú o catálogo, Catering, Galería y Contacto (los dos del medio solo si están activos).
2. La etiqueta del primer enlace depende del negocio y vive en `site.nav.menuLabel` ("Pastelería" en el ejemplo; "Menú" o "Carta" en un restaurante).
3. El **personalizador** ("Arma tu pastel") va **dentro de la sección del menú / Pastelería**, no como sección aparte.
4. **Horarios y ubicación** y **Preguntas frecuentes** van **dentro de Contacto**, junto al formulario.
5. Los ids `personalizar`, `horarios` y `faq` se conservan como anclas internas (útiles para enlaces directos desde botones o WhatsApp), pero no se muestran en el menú.

## Razones
- Menos enlaces: menos ruido y un menú móvil más corto.
- Agrupa por intención del visitante: ver qué ofrece (Pastelería), contratar eventos (Catering), inspirarse (Galería) y contactar o resolver dudas (Contacto).
- La etiqueta configurable mantiene la plantilla útil para restaurantes y catering.

## Consecuencias
- Los Issues de Horarios (T11) y FAQ (T12) se construyen como bloques dentro de la sección Contacto, y el del personalizador (T14) dentro de la sección de menú.
- El flag `sections.customizer` sigue activando o desactivando el bloque dentro de esa sección, pero ya no afecta a la navegación.
- Las secciones marcador de `App.tsx` solo se generan para los enlaces visibles; se reemplazan por las secciones reales.
