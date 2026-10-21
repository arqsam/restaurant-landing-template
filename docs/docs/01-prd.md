# 01 — PRD: Plantilla de landing para restaurantes, pastelerías y catering

**Versión:** 1.2 · **Fecha:** 2026-10-20 · **Estado:** Borrador para aprobación del autor
**Cambio respecto a v1.0:** el nicho pasa de "negocios de servicios" a negocios de comida en México (pastelerías, cafeterías, restaurantes y catering), a partir de solicitudes reales que el autor recibió antes.

**Cambio v1.2:** los dos negocios de referencia trabajan **postres bajo pedido con anticipo del 50 %**, y la pastelería permite **personalizar** (sabor, relleno, decoración con plantillas predeterminadas). La marca de ejemplo es **"Mallow & Crumb"** (ficticia, ver riesgos). Se añade un personalizador de pedidos y el cálculo de anticipo, sin carrito ni pagos en línea.

## 1. Problema

Los negocios de comida pequeños viven de Instagram y WhatsApp, pero no tienen un sitio propio donde mostrar su menú, sus precios, horarios y ubicación, ni una forma ordenada de recibir pedidos y cotizaciones (pasteles por encargo, eventos). Un sitio a medida les resulta caro. Para el autor, una plantilla reutilizable permite entregar un sitio en horas y sirve como pieza de portafolio y producto base.

## 2. Objetivo

Una landing de una página, en React + TypeScript, cuyo contenido y marca se cambian editando un único archivo tipado (`src/content/site.ts`), con **WhatsApp como canal principal de pedido** y un **formulario de cotización** para pasteles por encargo y eventos.

## 3. Usuarios

- **Comensal / cliente:** casi siempre en móvil, llega desde Instagram o Google; quiere ver el menú, precios, horario, ubicación y pedir o cotizar rápido.
- **Dueño del negocio (cliente del autor):** quiere su sitio con su menú, colores y datos, y recibir los pedidos donde ya trabaja (WhatsApp).
- **El autor:** quiere adaptar la plantilla en menos de 2 horas.

## 4. Alcance (v1.0)

Secciones, en este orden (todas activables desde la configuración salvo Hero, Contacto y Footer):
Header con navegación · Hero con CTA de WhatsApp · **Menú o catálogo** (categorías, platillos con foto, descripción, precio en MXN y etiquetas como "sin gluten" o "vegano") · Destacados · **Arma tu pedido** (personalizador, activable) · **Paquetes de catering / pasteles por encargo** · Cómo pedir (3–4 pasos) · Galería · Testimonios · **Horarios y ubicación** · FAQ (anticipos, tiempos de entrega, alergias) · **Contacto / Cotización** (formulario + WhatsApp) · Footer.

**Fuera de alcance:** carrito de compras, pagos en línea (el anticipo se paga fuera del sitio, ver ADR 0004), seguimiento de pedidos, CMS o panel de edición, multi-idioma, backend propio.

## 5. Requisitos funcionales

- **RF-01** Todo texto, imagen, color, enlace, horario, menú y dato de contacto sale de `site.ts`.
- **RF-02** La navegación hace scroll suave a cada sección activa y respeta `prefers-reduced-motion`.
- **RF-03** El menú se agrupa por categorías, con precios en MXN formateados (`Intl.NumberFormat("es-MX")`) y etiquetas de alérgenos o dieta.
- **RF-04** Botón flotante y CTA de WhatsApp (`wa.me`) con mensaje prellenado configurable. En cada platillo o paquete, un botón "Pedir" abre WhatsApp con el nombre del producto en el mensaje.
- **RF-05** El formulario de cotización pide: nombre, WhatsApp (10 dígitos), correo (opcional), tipo (pastel / catering / otro), fecha del evento, número de personas, entrega o recoger, y mensaje. Valida en el cliente con errores por campo.
- **RF-06** La fecha mínima seleccionable respeta el tiempo de anticipación configurado (`orders.minLeadDays`, por ejemplo 2 días para pasteles).
- **RF-07** El envío usa un adaptador intercambiable de proveedor (ver [ADR 0003](./adr/0003-formulario-de-contacto.md)). Tras un envío exitoso, o si el proveedor falla, se ofrece "Continuar por WhatsApp" con un resumen de la solicitud, para no perder el contacto.
- **RF-08** Horarios con indicador "Abierto ahora / Cerrado" calculado en zona horaria configurable.
- **RF-09** Metadatos SEO y datos estructurados `schema.org` (`Restaurant` o `Bakery`) generados desde la configuración, para Google local.
- **RF-10** El acordeón de FAQ abre y cierra con teclado y expone `aria-expanded`.

- **RF-11** **Personalizador "Arma tu pedido"** (activable): el cliente elige tamaño o porciones, sabor, relleno, estilo de decoración y paleta de colores, entre las opciones y plantillas que el negocio define en la configuración, y opcionalmente escribe una dedicatoria (límite de caracteres configurable). Muestra un resumen en vivo.
- **RF-12** **Estimado y anticipo:** con la selección se calcula un total estimado, el anticipo (porcentaje configurable, 50 % por defecto) y el saldo. Se muestra como "estimado; el precio final lo confirma el negocio" y el sitio **no cobra**.
- **RF-13** La selección del personalizador se carga en el formulario de cotización (tipo "pastel") y viaja en el resumen de WhatsApp y en el correo.
- **RF-14** Política de pedido bajo pedido visible: anticipación mínima, anticipo y condiciones, tomadas de la configuración (`orders`).

## 6. Requisitos no funcionales

- **RNF-01** Responsive de 320 px a 1440 px, mobile-first.
- **RNF-02** Accesible: contraste AA, foco visible, orden de encabezados, formulario con etiquetas y mensajes de error asociados.
- **RNF-03** Peso total ≤ 1.5 MB en la primera carga; fotos de comida en WebP con dimensiones declaradas y `loading="lazy"` fuera del primer viewport.
- **RNF-04** Sin librerías de UI pesadas; CSS Modules (ADR 0002). El mapa es un enlace a Google Maps, no un iframe, para no penalizar el rendimiento.

## 7. Criterios de aceptación

| ID    | Criterio                                                                                                                                              | Cómo se verifica                                                                |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| AC-01 | Lighthouse móvil ≥ 90 Performance y ≥ 95 Accessibility, Best Practices y SEO                                                                          | Producción, incógnito, mediana de 3 corridas                                    |
| AC-02 | `tsc -b` y `eslint` sin errores                                                                                                                       | CI                                                                              |
| AC-03 | `vitest --run` sin fallos; cubiertos formulario, adaptador, FAQ, navegación y "abierto ahora"                                                         | CI                                                                              |
| AC-04 | Cambiar nombre, colores, menú, horarios y contacto editando solo `site.ts` produce un sitio distinto y completo                                       | Dos configuraciones de ejemplo: una pastelería y un catering (marcas ficticias) |
| AC-05 | Formulario: datos inválidos no se envían; envío válido muestra éxito y el botón de WhatsApp con el resumen                                            | Tests + prueba manual contra el proveedor real                                  |
| AC-06 | Si el proveedor falla, el usuario ve un error claro y puede continuar por WhatsApp                                                                    | Test con fallo simulado                                                         |
| AC-07 | Navegable solo con teclado, incluidos acordeón y formulario                                                                                           | Revisión manual + axe                                                           |
| AC-08 | Secciones correctas a 375 px y 1280 px                                                                                                                | Capturas en el reporte                                                          |
| AC-09 | Desplegada en Vercel con URL pública                                                                                                                  | Enlace en README                                                                |
| AC-10 | README con guía "Personaliza esta plantilla en 5 pasos"                                                                                               | Revisión                                                                        |
| AC-11 | Issues cerrados y commits que los referencian                                                                                                         | Tablero + `git log`                                                             |
| AC-12 | Personalizador: cada combinación válida produce el resumen, total, anticipo (50 %) y saldo correctos; no se puede continuar sin elegir lo obligatorio | Tests de `lib/order` y del componente                                           |
| AC-13 | La selección del personalizador llega completa al formulario, a WhatsApp y al correo                                                                  | Test de integración + prueba manual                                             |

## 8. Riesgos

| Riesgo                                                                      | Mitigación                                                                                                                                           |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fotos de comida pesadas o de mala calidad arruinan rendimiento y apariencia | Guía de fotografía y optimización en README; WebP con dimensiones; fotos de muestra libres de derechos                                               |
| El negocio no responde el formulario a tiempo                               | WhatsApp como canal principal; el correo es respaldo                                                                                                 |
| Spam en el formulario                                                       | Campo honeypot y protección del proveedor                                                                                                            |
| Límite mensual del plan gratuito del proveedor                              | Adaptador intercambiable; recomendación de plan o función propia si el volumen crece (ADR 0003)                                                      |
| Precio estimado confundido con precio final                                 | Etiqueta visible "estimado", texto de confirmación y mismo texto en el resumen de WhatsApp                                                           |
| Datos bancarios expuestos en un sitio público                               | El sitio no publica CLABE ni cuentas; los datos de pago se envían por WhatsApp al confirmar el pedido (ADR 0004)                                     |
| "Doux Bistro" pueda coincidir con un negocio real                           | Se usa solo como marca de ejemplo ficticia, sin logo, dirección ni reseñas reales; verificar el nombre antes de usarlo en un caso de estudio público |
| Menús desactualizados                                                       | El menú vive en un solo archivo; se documenta cómo cambiar precios en 2 minutos                                                                      |
| Testimonios o datos de ejemplo tomados por reales                           | Marcas y reseñas de muestra claramente ficticias en el README                                                                                        |
