# ADR 0004 — Personalizador de pedidos y anticipo sin pagos en línea

**Estado:** Aceptado · **Fecha:** 2026-10-20

## Contexto
Los negocios de referencia trabajan **bajo pedido** y piden **50 % de anticipo**. La pastelería deja elegir sabor, relleno y decoración con plantillas predeterminadas que propone el vendedor. Un sitio estático no puede cobrar ni gestionar inventario sin backend.

## Decisión
1. Se incluye un **personalizador** que construye un pedido a partir de opciones definidas en `site.ts`. No es un carrito: produce una **solicitud** (resumen + estimado), no una compra.
2. El sitio **calcula** total estimado, anticipo (porcentaje configurable) y saldo, y los muestra como estimado.
3. El **cobro del anticipo ocurre fuera del sitio**: el negocio confirma por WhatsApp y envía entonces los datos de pago. El sitio no publica CLABE ni cuentas.
4. La selección se envía al negocio por los dos canales del ADR 0003 (correo y WhatsApp) con el mismo resumen.

## Razones
- Refleja el proceso real del negocio (cotizar, confirmar, anticipo, entrega) sin construir backend ni asumir riesgo de pagos.
- Mantiene la plantilla estática y barata de operar.
- Datos de pago fuera del repositorio y del sitio público reduce riesgo de fraude y de suplantación.

## Alternativas descartadas
- **Pasarela de pago (Stripe, Mercado Pago):** requiere backend o enlaces de pago por pedido, cumplimiento y comisiones; queda como v2.
- **Mostrar CLABE en el sitio:** práctico, pero expone datos y facilita suplantaciones.
- **Carrito completo:** fuera del alcance de una plantilla corta.

## Consecuencias
- El precio del sitio es un estimado; la confirmación humana es obligatoria y debe estar visible.
- Para v2: enlace de pago generado por función serverless tras la confirmación del negocio.
