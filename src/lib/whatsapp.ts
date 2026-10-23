/**
 * Construye un enlace de WhatsApp (wa.me).
 * - Quita símbolos del número (+, espacios, guiones, paréntesis).
 * - Si el número tiene 10 dígitos le antepone el código de México (52).
 * - Codifica el mensaje (acentos, espacios y saltos de línea).
 */
export function buildWhatsAppUrl(phone: string, message = ""): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) {
    throw new Error(`Número de WhatsApp inválido: "${phone}"`);
  }
  const international = digits.length === 10 ? `52${digits}` : digits;
  const text = message.trim();
  return text
    ? `https://wa.me/${international}?text=${encodeURIComponent(text)}`
    : `https://wa.me/${international}`;
}
