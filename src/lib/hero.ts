export interface TitleParts {
  before: string;
  emphasis: string;
  after: string;
}

/**
 * Divide el título en tres partes para poder resaltar un fragmento.
 * Devuelve null si no hay énfasis o si no aparece dentro del título.
 */
export function splitEmphasis(
  title: string,
  emphasis?: string,
): TitleParts | null {
  if (!emphasis) return null;
  const index = title.indexOf(emphasis);
  if (index === -1) return null;
  return {
    before: title.slice(0, index),
    emphasis,
    after: title.slice(index + emphasis.length),
  };
}

/** Datos breves del proceso de pedido, tomados de la configuración. */
export function buildHeroFacts(orders: {
  minLeadDays: number;
  depositPercent: number;
}): string[] {
  const facts: string[] = [];
  if (orders.minLeadDays > 0) {
    const days = orders.minLeadDays === 1 ? "día" : "días";
    facts.push(`Pedidos con ${orders.minLeadDays} ${days} de anticipación`);
  }
  facts.push(`Anticipo del ${orders.depositPercent} %`);
  return facts;
}
