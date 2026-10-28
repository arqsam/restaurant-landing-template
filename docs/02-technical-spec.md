# 02 — Especificación técnica (v1.2, nicho restaurantes)

## Stack
React 19 · TypeScript (strict) · Vite · Vitest + Testing Library · ESLint · GitHub Actions · Vercel. Decisiones en [ADR 0001](./adr/0001-react-vite-ts.md), [ADR 0002](./adr/0002-content-as-config.md) y [ADR 0003](./adr/0003-formulario-de-contacto.md) y [ADR 0004](./adr/0004-personalizador-y-anticipo.md).

## Estructura propuesta
```
src/
  content/site.ts            # única fuente de contenido y marca (tipo SiteConfig)
  content/types.ts           # SiteConfig y tipos por sección
  components/                # una carpeta por sección (Hero, Menu, Catering, Hours, ...)
  components/ui/             # Button, Section, Accordion, Field, WhatsAppButton
  lib/whatsapp.ts            # buildWhatsAppUrl(phone, message)
  lib/hours.ts               # isOpenNow(schedule, timeZone, now)
  lib/money.ts               # formatMXN(n)
  lib/order.ts               # calcQuote(selection, config), buildOrderSummary(selection)
  lib/contact/types.ts       # ContactRequest, SubmitResult
  lib/contact/web3forms.ts   # adaptador v1
  lib/contact/index.ts       # exporta el adaptador activo
  hooks/useOrderBuilder.ts   # estado del personalizador y pasos obligatorios
  hooks/useContactForm.ts    # validación + estados + resumen de WhatsApp
  styles/tokens.css          # variables CSS desde la config
  App.tsx                    # compone secciones activas
```

## Contrato de configuración
La fuente de verdad es [`src/content/types.ts`](../src/content/types.ts) (`SiteConfig`); el contenido de ejemplo está en `src/content/site.ts`. Incluye marca, SEO, secciones activables, menú con categorías y `id` por platillo, destacados, personalizador de pedidos, paquetes de catering, cómo pedir, galería, reseñas (con la marca `isSample`), FAQ, horarios, pedidos (WhatsApp, anticipación, porcentaje de anticipo) y contacto.

Los campos obligatorios se validan en compilación con TypeScript, y `src/content/site.test.ts` comprueba las reglas que el tipo no puede expresar (ids únicos, precios enteros positivos, destacados existentes, formato de horas, WhatsApp válido, anticipo entre 1 y 100).

## Flujo del formulario de cotización
1. El usuario llena el formulario; `useContactForm` valida por campo (nombre ≥ 2 caracteres, WhatsApp de 10 dígitos, correo opcional pero válido si se escribe, fecha ≥ hoy + `minLeadDays`, personas ≥ 1 para catering). El WhatsApp acepta separadores y prefijo `52`, `+52` o `521`. La fecha es obligatoria para pastel y catering (opcional para "otro") y las personas son obligatorias solo en catering. Los errores aparecen tras el primer intento de envío y se actualizan al escribir. La lógica pura vive en `src/lib/contactForm.ts` y el estado en `src/hooks/useContactForm.ts`, que recibe el adaptador como parámetro. El adaptador vive en `src/lib/formProvider.ts` (Web3Forms y Formspree), nunca lanza y devuelve siempre `SubmitResult`; mientras la llave sea la de plantilla no hace ninguna petición y el formulario ofrece WhatsApp. La llave puede definirse con `VITE_FORM_KEY` (ver `.env.example`) sin tocar `site.ts`.
2. Si hay errores, se muestran junto al campo con `aria-describedby` y el foco va al primero.
3. Si el honeypot tiene contenido, se simula éxito sin enviar.
4. `submitContact(data)` llama al adaptador. Estados: `idle` → `submitting` → `success` | `error`.
5. En `success` y en `error` se muestra un botón "Continuar por WhatsApp" cuyo mensaje resume tipo, fecha, personas y notas. En `error` el texto aclara que la solicitud no se registró por correo.

## Personalizador y anticipo
- `useOrderBuilder` guarda la selección (`sizeId`, `flavorId`, `fillingId`, `decorationId`, `paletteId`, `dedication`) y expone si está completa. Los identificadores se validan contra la configuración; un id desconocido se ignora.
- `calcQuote` = precio del tamaño + extras de sabor, relleno, decoración y dedicatoria. `deposit = round(total × depositPercent / 100)` y `balance = total − deposit`, en pesos enteros.
- `buildOrderSummary` produce el mismo texto para WhatsApp y para el correo: producto, opciones, dedicatoria, fecha, total estimado, anticipo y saldo, y la leyenda "Estimado: el precio final lo confirma el negocio".
- Al pulsar "Solicitar este pastel" (solo con la selección completa), el diálogo se cierra, la página se desplaza al formulario y `useContactForm.prefill` carga el tipo "pastel" y el resumen en el campo editable "Tu pastel", sin borrar lo que la persona ya hubiera escrito. El foco queda en el primer dato por completar.
- El resumen viaja en tres lugares: el campo "Tu pastel" del formulario, el mensaje de "Continuar por WhatsApp" (tras las notas) y el correo (campo `pastel`). Se puede quitar de la solicitud con "Quitar este pastel de la solicitud".
- El estado del formulario se crea en `App` y se pasa a `ContactForm`; así el personalizador y el formulario comparten una sola solicitud.

## SEO y datos estructurados
- La página es una SPA: los rastreadores y las vistas previas de redes sociales (WhatsApp, Facebook, X) no ejecutan JavaScript, así que las etiquetas se escriben en el HTML **al compilar**, no con React.
- `src/lib/seo.ts` genera desde `site.ts`: `<title>`, descripción, URL canónica, `theme-color`, Open Graph, tarjeta de Twitter y un bloque JSON-LD `schema.org` (`Bakery`, `Restaurant` o `FoodEstablishment` según `brand.type`) con nombre, dirección postal, teléfono, correo, horarios agrupados, mapa y enlace al menú.
- `vite.config.ts` tiene un plugin (`transformIndexHtml`) que llama a `injectSeo` sobre `index.html`; funciona igual en `npm run dev` y en `npm run build`. También fija `lang="es-MX"`.
- Configuración en `site.seo`: `siteUrl` (dominio público sin barra final), `locale`, `address` estructurada, `priceRange`, `geo` y `sameAs` opcionales, e `ogImage` (1200×630, JPG; si falta se usa la foto del hero). `address` repite a propósito la dirección de `contact.address` en campos separados porque Google los pide así; una prueba comprueba que coincidan.
- El texto va escapado y el JSON-LD no puede cerrar la etiqueta `<script>` aunque un nombre contenga `</script>`.
- `public/robots.txt` permite el rastreo. Al desplegar, `seo.siteUrl` debe cambiarse al dominio real; sin eso las URL canónica y de imagen apuntan al dominio de ejemplo.
- Lighthouse (AC-01) se mide en producción, tras el despliegue.

## Plan de pruebas
| Área | Pruebas |
|---|---|
| `useContactForm` | cada regla de validación, honeypot, estados, error de red |
| Adaptador Web3Forms | construye el cuerpo correcto y traduce respuestas OK/error (con `fetch` simulado) |
| `seo` | tipo de schema por giro, URL absolutas, horarios agrupados, opcionales omitidos, escape de HTML y de `</script>`, `injectSeo` sobre un `index.html` |
| `buildWhatsAppUrl` | codificación de acentos y saltos de línea, número normalizado con 52 |
| `isOpenNow` | dentro/fuera de horario, día cerrado, cruce de medianoche, zona horaria |
| `calcQuote` | suma de extras, anticipo 50 % con redondeo, saldo, porcentaje distinto, opción sin extras |
| `useOrderBuilder` / componente | no permite continuar sin lo obligatorio; resumen en vivo; id desconocido ignorado; límite de dedicatoria |
| `formatMXN` | formato `$1,250.00` |
| Menú | agrupa por categoría; etiquetas; botón "Pedir" con el nombre del platillo |
| Accordion y navegación | teclado, `aria-expanded`, enlaces solo de secciones activas |
| App | con las dos configuraciones de ejemplo renderiza lo activo y nada de lo desactivado |
