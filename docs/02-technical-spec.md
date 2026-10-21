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

## Contrato de configuración (resumen)
```ts
interface SiteConfig {
  brand: { name: string; type: "restaurant" | "bakery" | "catering";
           colors: { primary: string; accent: string }; logo?: string };
  seo: { title: string; description: string; ogImage?: string; address: string; geo?: { lat: number; lng: number } };
  sections: { featured: boolean; catering: boolean; gallery: boolean; testimonials: boolean; faq: boolean };
  hero: { title: string; subtitle: string; image: string };
  menu: { name: string; items: { name: string; description: string; price: number;
          image?: string; tags?: ("vegano" | "sin-gluten" | "picante" | "contiene-nueces")[] }[] }[];
  packages?: { name: string; minPeople?: number; pricePerPerson?: number; includes: string[] }[];
  hours: { timeZone: string; schedule: Record<"mon"|"tue"|"wed"|"thu"|"fri"|"sat"|"sun", { open: string; close: string } | null> };
  orders: { whatsapp: string; defaultMessage: string; minLeadDays: number;
            depositPercent: number;            // 50
            paymentNote: string };             // "Te enviamos los datos de pago por WhatsApp al confirmar."
  customizer?: {
    sizes: { id: string; label: string; servings: number; price: number }[];
    flavors: { id: string; label: string; extraPrice?: number }[];
    fillings: { id: string; label: string; extraPrice?: number }[];
    decorations: { id: string; label: string; description: string; image?: string; extraPrice?: number;
                   palettes: { id: string; label: string; colors: string[] }[] }[];
    dedication?: { maxChars: number; extraPrice?: number };
  };
  contact: { email: string; address: string; mapsUrl: string; formProvider: "web3forms" | "formspree"; formKey: string };
}
```
Los campos obligatorios se validan en compilación con TypeScript.

## Flujo del formulario de cotización
1. El usuario llena el formulario; `useContactForm` valida por campo (nombre ≥ 2 caracteres, WhatsApp de 10 dígitos, correo opcional pero válido si se escribe, fecha ≥ hoy + `minLeadDays`, personas ≥ 1 para catering).
2. Si hay errores, se muestran junto al campo con `aria-describedby` y el foco va al primero.
3. Si el honeypot tiene contenido, se simula éxito sin enviar.
4. `submitContact(data)` llama al adaptador. Estados: `idle` → `submitting` → `success` | `error`.
5. En `success` y en `error` se muestra un botón "Continuar por WhatsApp" cuyo mensaje resume tipo, fecha, personas y notas. En `error` el texto aclara que la solicitud no se registró por correo.

## Personalizador y anticipo
- `useOrderBuilder` guarda la selección (`sizeId`, `flavorId`, `fillingId`, `decorationId`, `paletteId`, `dedication`) y expone si está completa. Los identificadores se validan contra la configuración; un id desconocido se ignora.
- `calcQuote` = precio del tamaño + extras de sabor, relleno, decoración y dedicatoria. `deposit = round(total × depositPercent / 100)` y `balance = total − deposit`, en pesos enteros.
- `buildOrderSummary` produce el mismo texto para WhatsApp y para el correo: producto, opciones, dedicatoria, fecha, total estimado, anticipo y saldo, y la leyenda "Estimado: el precio final lo confirma el negocio".
- Al pulsar "Solicitar este pastel", se desplaza al formulario con tipo "pastel" y el resumen precargado (editable).

## Plan de pruebas
| Área | Pruebas |
|---|---|
| `useContactForm` | cada regla de validación, honeypot, estados, error de red |
| Adaptador Web3Forms | construye el cuerpo correcto y traduce respuestas OK/error (con `fetch` simulado) |
| `buildWhatsAppUrl` | codificación de acentos y saltos de línea, número normalizado con 52 |
| `isOpenNow` | dentro/fuera de horario, día cerrado, cruce de medianoche, zona horaria |
| `calcQuote` | suma de extras, anticipo 50 % con redondeo, saldo, porcentaje distinto, opción sin extras |
| `useOrderBuilder` / componente | no permite continuar sin lo obligatorio; resumen en vivo; id desconocido ignorado; límite de dedicatoria |
| `formatMXN` | formato `$1,250.00` |
| Menú | agrupa por categoría; etiquetas; botón "Pedir" con el nombre del platillo |
| Accordion y navegación | teclado, `aria-expanded`, enlaces solo de secciones activas |
| App | con las dos configuraciones de ejemplo renderiza lo activo y nada de lo desactivado |
