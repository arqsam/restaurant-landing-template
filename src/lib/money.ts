export interface FormatMXNOptions {
  /**
   * true: siempre dos decimales ("$1,250.00"), útil en cotizaciones y anticipos.
   * false (por defecto): sin decimales si el monto es entero ("$1,250"), como en
   * los precios del menú; los montos con centavos conservan sus dos decimales.
   */
  showCents?: boolean;
}

const withCents = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const whole = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Formatea un monto en pesos mexicanos. Lanza un error si no es un número finito. */
export function formatMXN(
  amount: number,
  { showCents = false }: FormatMXNOptions = {},
): string {
  if (!Number.isFinite(amount)) {
    throw new Error(`Monto inválido: ${amount}`);
  }
  if (showCents || !Number.isInteger(amount)) return withCents.format(amount);
  return whole.format(amount);
}
