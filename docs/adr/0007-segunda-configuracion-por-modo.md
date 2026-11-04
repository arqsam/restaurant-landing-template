# ADR 0007 — Segunda configuración de ejemplo y selección por modo de Vite

**Estado:** Aceptado · **Fecha:** 2026-10-28 · **Relacionado con** ADR 0002

## Contexto
AC-04 pide demostrar que la plantilla se personaliza editando solo la configuración, con dos ejemplos: una pastelería y un negocio de catering. Al preparar el segundo (Nerita Catering, marca ficticia) aparecieron dos acoplamientos con la pastelería:

1. `customizer` y `nav.customizerLabel` eran obligatorios en el tipo, aunque el personalizador de pasteles no tiene sentido para un catering.
2. Las opciones de "¿Qué necesitas?" y "¿Cómo lo recibes?" ("Pastel por encargo", "Recoger en tienda") estaban fijas en `contactForm.ts` y llegaban así al correo y a WhatsApp.

Además hacía falta una forma de ver y compilar la segunda configuración sin tocar la primera.

## Decisión
1. La segunda configuración vive en `src/content/samples/catering.ts`, con sus fotos en `public/images/nerita/`.
2. Se elige por **modo de Vite**: `npm run dev:catering` y `npm run build:catering` usan `--mode catering`; sin modo se usa la pastelería. `src/content/active.ts` es el único lugar donde la aplicación elige, y `vite.config.ts` usa el mismo modo para el SEO inyectado.
3. `customizer` y `nav.customizerLabel` pasan a ser opcionales y solo se exigen si `sections.customizer` está activo (`CustomizableSiteConfig` para la pastelería).
4. Las etiquetas del formulario se pueden definir en `contactForm.typeLabels` y `contactForm.fulfillmentLabels`; lo que falte usa los textos de la plantilla. El envío incluye la etiqueta ya resuelta para que el correo y WhatsApp hablen el idioma del negocio.
5. Las pruebas de configuración se reúnen en un contrato (`describeSiteContract`) que corren las dos marcas.
6. El hero acepta un tono (`hero.tone`: `"light"` por defecto o `"dark"`). El velo claro del hero obliga a texto oscuro y apaga la foto; una marca gourmet necesita la foto nítida y el texto en claro. El tono oscuro es opcional y no cambia el de la pastelería.

## Razones
- Un modo de Vite es la herramienta estándar para "otra variante de la misma app": no añade dependencias ni archivos de entorno.
- Vite sustituye el modo al compilar, así que el empaquetador descarta la configuración que no se usa y el JS no crece. Se comprueba comparando el tamaño del build con y sin esta tarea.
- Las dos marcas pasan por el mismo contrato, así que una tercera configuración hereda las pruebas sin escribir más.

## Alternativas descartadas
- Un interruptor dentro de `site.ts`: mezcla dos negocios en el archivo que un cliente debe poder borrar y reescribir.
- Una variable `VITE_SITE`: obliga a crear archivos `.env` para algo que el modo ya resuelve.
- Importar la configuración con `import()` dinámico: crea fragmentos separados y complica el SEO inyectado en el HTML, sin ningún beneficio para quien solo usa una marca.
- Una rama o un repositorio por marca: se separan en cuanto cambia la plantilla.

## Consecuencias
- Un negocio real **no** necesita modos: edita `site.ts` y borra `src/content/samples/`, `active.ts` y los scripts `*:catering` (la guía de personalización del README lo indicará).
- `npm run weight` ya no importa `site.ts`: lee el hero del HTML compilado y mide la configuración que se construyó.
- Quien agregue una tercera configuración añade su archivo, su modo en `active.ts` y `vite.config.ts`, y su bloque en `scripts/images.test.ts`.
