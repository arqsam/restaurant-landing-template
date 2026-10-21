# ADR 0003 — Formulario de cotización: WhatsApp primero, proveedor de formularios como respaldo

**Estado:** Aceptado · **Fecha:** 2026-10-20

## Contexto
El stack es una SPA estática (React + Vite) desplegada en Vercel, sin backend. Un formulario necesita algo que reciba los datos y los entregue al dueño. Los negocios de comida en México atienden pedidos y cotizaciones por WhatsApp; el correo suele revisarse tarde.

## Opciones evaluadas
| Opción | Ventajas | Desventajas |
|---|---|---|
| Solo WhatsApp (`wa.me`) | Cero backend, cero costo, es donde responde el dueño | No queda registro en un correo; depende de que el cliente envíe el mensaje |
| Formspree | Muy conocido, buena documentación | Plan gratuito: 50 envíos al mes, historial de 30 días |
| Web3Forms | Plan gratuito: 250 envíos al mes, dominios ilimitados, protección anti-spam y hCaptcha incluidos | Sin adjuntos ni webhooks en el plan gratuito; la llave de acceso es pública |
| Función serverless propia en Vercel (`api/contact.ts`) + servicio de correo | Control total, puede enviar a Sheets, Telegram o WhatsApp API; las llaves quedan en el servidor | Más código y mantenimiento; límites del servicio de correo |

(Límites consultados el 2026-10-20 en las páginas oficiales de cada proveedor; verificar antes de entregar a un cliente, pueden cambiar.)

## Decisión
1. **WhatsApp es el canal principal.** Todos los CTA y el botón flotante abren `wa.me` con un mensaje prellenado.
2. **El formulario de cotización registra la solicitud por correo** con **Web3Forms** en v1, por su cuota gratuita mayor, y al terminar (o si falla) ofrece **"Continuar por WhatsApp"** con el resumen de la solicitud.
3. El envío pasa por un **adaptador** (`submitContact(data): Promise<Result>`) con una implementación por proveedor. Cambiar de proveedor, o pasar a una función propia en Vercel, es modificar un archivo.

## Razones
- Cubre ambos comportamientos reales: quien prefiere WhatsApp, y el dueño que quiere un registro con fecha, personas y tipo de evento.
- Mantiene el despliegue 100 % estático en v1 (RNF-03, simplicidad).
- El adaptador deja abierto el camino a P4 (automatización): una función propia puede escribir en Google Sheets, avisar por Telegram o conectarse a n8n.

## Seguridad y límites asumidos
- La llave de Web3Forms y el identificador de formulario de Formspree **son públicos por diseño** (viajan en el navegador). No son secretos; se protegen con anti-spam, el límite mensual y, en planes de pago, restricción por dominio. Lo verdaderamente secreto (llaves de correo, API de WhatsApp) solo va en una función de servidor.
- Se añade campo honeypot y validación en cliente; la validación del cliente no sustituye la del proveedor.
- Dato personal: se recolectan nombre y teléfono; el README incluye aviso de privacidad de ejemplo que el cliente debe adaptar.
- No se abre WhatsApp automáticamente tras enviar (los navegadores bloquean ventanas no iniciadas por el usuario): se muestra un botón.

## Consecuencias
- Si el cliente supera el límite mensual, se cambia el adaptador o se pasa a la función propia.
- El correo del cliente y el número de WhatsApp van en `site.ts` y en la configuración del proveedor; se documenta en el README.
