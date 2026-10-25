# ADR 0006 — Personalizador como módulo propio con diálogo

**Estado:** Aceptado · **Fecha:** 2026-10-24 · **Sustituye en parte a** ADR 0005

## Contexto
ADR 0005 puso el personalizador ("Arma tu pastel") dentro de la sección de Pastelería, visible de lleno. Al revisar la página resultó demasiado largo el recorrido hasta las secciones siguientes (Catering, Galería, Contacto): el formulario completo hacía de Pastelería la sección más extensa y obligaba a recorrerlo a quien no quería diseñar un pastel.

## Decisión
1. El personalizador es una **sección propia**, con enlace en el menú, entre Pastelería y Catering. La navegación pasa a un máximo de 5 enlaces.
2. En la página solo se ve un **módulo de entrada** (foto, título, subtítulo y botón). El diseñador completo se abre en un **diálogo modal** (hoja a pantalla completa en móvil, ventana grande en escritorio).
3. El estado del diseño vive fuera del diálogo: se conserva al cerrarlo y reabrirlo, y el botón pasa a "Seguir diseñando".
4. El diálogo es accesible: nombre accesible, `aria-modal`, foco atrapado, Escape para cerrar, resto de la página inerte y foco devuelto al botón que lo abrió.
5. Se suma **fruta** (opcional, con precio y máximo configurable) y una **foto de referencia** por decoración; si una decoración no tiene foto se muestra la muestra de color de la paleta elegida.

## Razones
- Quien no quiere diseñar sigue de largo en una sola pantalla.
- Quien sí quiere no pierde su lugar: el diálogo se abre encima y al cerrar vuelve al mismo punto.
- Una foto aclara "minimalista" o una gama de color mejor que el texto.

## Alternativas descartadas
- Acordeón en la página: sigue empujando el contenido y pierde el foco.
- Página aparte: saca a la persona de la landing y rompe las anclas.
- Mantenerlo visible de lleno: es lo que se corrigió.

## Consecuencias
- Un componente de diálogo propio que mantener, sin dependencias nuevas.
- El enlace del menú lleva al módulo; abrir el diseñador es siempre una acción explícita.
- Las decoraciones sin foto usan la muestra de color hasta que se añada una imagen en `site.ts`.
