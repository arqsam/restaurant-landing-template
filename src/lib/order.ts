import type { Customizer } from "../content/types";
import { formatMXN } from "./money";

/** Lo que la persona ha elegido hasta ahora; todo es opcional mientras arma el pastel. */
export interface OrderSelection {
  sizeId?: string;
  flavorId?: string;
  fillingId?: string;
  decorationId?: string;
  paletteId?: string;
  fruitIds?: string[];
  dedication?: string;
}

export type OrderField =
  | "size"
  | "flavor"
  | "filling"
  | "decoration"
  | "palette"
  | "fruit"
  | "dedication";

export const ORDER_FIELD_LABELS: Record<OrderField, string> = {
  size: "Tamaño",
  flavor: "Sabor",
  filling: "Relleno",
  decoration: "Decoración",
  palette: "Paleta de color",
  fruit: "Fruta",
  dedication: "Dedicatoria",
};

export interface QuoteLine {
  label: string;
  amount: number;
}

export interface Quote {
  /** Desglose: precio base del tamaño y cada extra elegido. */
  lines: QuoteLine[];
  total: number;
  /** Anticipo redondeado al peso más cercano. */
  deposit: number;
  /** Total menos anticipo (así deposit + balance siempre suman el total). */
  balance: number;
}

export interface SelectionCheck {
  valid: boolean;
  /** Campos obligatorios sin elegir (o con una opción que ya no corresponde). */
  missing: OrderField[];
  /** Mensajes de error por campo, para mostrarlos junto al control. */
  errors: Partial<Record<OrderField, string>>;
}

/** Quita espacios al inicio y al final de la dedicatoria. */
export function normalizeDedication(text: string | undefined): string {
  return (text ?? "").trim();
}

function findDecoration(selection: OrderSelection, customizer: Customizer) {
  return customizer.decorations.find((d) => d.id === selection.decorationId);
}

/**
 * Revisa que estén elegidos tamaño, sabor, relleno, decoración y paleta (si la
 * decoración tiene paletas), y que la dedicatoria respete el límite. Una opción
 * que no existe en la configuración cuenta como no elegida.
 */
export function validateSelection(
  selection: OrderSelection,
  customizer: Customizer,
): SelectionCheck {
  const missing: OrderField[] = [];
  const errors: Partial<Record<OrderField, string>> = {};
  const require = (field: OrderField, ok: boolean) => {
    if (ok) return;
    missing.push(field);
    errors[field] = `Elige ${ORDER_FIELD_LABELS[field].toLowerCase()}`;
  };

  require("size", customizer.sizes.some((s) => s.id === selection.sizeId));
  require("flavor", customizer.flavors.some(
    (f) => f.id === selection.flavorId,
  ));
  require("filling", customizer.fillings.some(
    (f) => f.id === selection.fillingId,
  ));

  const decoration = findDecoration(selection, customizer);
  require("decoration", decoration !== undefined);
  if (decoration && decoration.palettes.length > 0) {
    require("palette", decoration.palettes.some(
      (p) => p.id === selection.paletteId,
    ));
  }

  const fruitIds = selection.fruitIds ?? [];
  if (fruitIds.length > 0) {
    if (!customizer.fruits) {
      errors.fruit = "Este negocio no ofrece fruta";
    } else if (
      fruitIds.some((id) => !customizer.fruits?.some((f) => f.id === id))
    ) {
      errors.fruit = "Una de las frutas ya no está disponible";
    } else if (
      customizer.maxFruits !== undefined &&
      fruitIds.length > customizer.maxFruits
    ) {
      errors.fruit = `Elige máximo ${customizer.maxFruits} frutas`;
    }
  }

  const dedication = normalizeDedication(selection.dedication);
  if (dedication.length > 0) {
    if (!customizer.dedication) {
      errors.dedication = "Este negocio no incluye dedicatoria";
    } else if (dedication.length > customizer.dedication.maxChars) {
      errors.dedication = `Máximo ${customizer.dedication.maxChars} caracteres`;
    }
  }

  return {
    valid:
      missing.length === 0 &&
      errors.dedication === undefined &&
      errors.fruit === undefined,
    missing,
    errors,
  };
}

function lookup<T extends { id: string }>(
  list: T[],
  id: string | undefined,
  kind: string,
): T | undefined {
  if (id === undefined || id === "") return undefined;
  const found = list.find((item) => item.id === id);
  if (!found) throw new Error(`Opción desconocida (${kind}): "${id}"`);
  return found;
}

/**
 * Calcula el estimado con lo elegido hasta el momento (sirve para el resumen en
 * vivo). Lanza un error si un id no existe en la configuración. El anticipo es
 * `depositPercent` % del total, redondeado al peso más cercano.
 */
export function calcQuote(
  selection: OrderSelection,
  customizer: Customizer,
  depositPercent: number,
): Quote {
  const lines: QuoteLine[] = [];

  const size = lookup(customizer.sizes, selection.sizeId, "tamaño");
  if (size) lines.push({ label: size.label, amount: size.price });

  const flavor = lookup(customizer.flavors, selection.flavorId, "sabor");
  if (flavor?.extraPrice) {
    lines.push({ label: `Sabor ${flavor.label}`, amount: flavor.extraPrice });
  }

  const filling = lookup(customizer.fillings, selection.fillingId, "relleno");
  if (filling?.extraPrice) {
    lines.push({
      label: `Relleno ${filling.label}`,
      amount: filling.extraPrice,
    });
  }

  const decoration = lookup(
    customizer.decorations,
    selection.decorationId,
    "decoración",
  );
  if (decoration?.extraPrice) {
    lines.push({
      label: `Decoración ${decoration.label}`,
      amount: decoration.extraPrice,
    });
  }

  for (const fruitId of selection.fruitIds ?? []) {
    const fruit = lookup(customizer.fruits ?? [], fruitId, "fruta");
    if (fruit?.extraPrice) {
      lines.push({ label: `Fruta ${fruit.label}`, amount: fruit.extraPrice });
    }
  }

  if (
    normalizeDedication(selection.dedication).length > 0 &&
    customizer.dedication?.extraPrice
  ) {
    lines.push({
      label: "Dedicatoria",
      amount: customizer.dedication.extraPrice,
    });
  }

  const total = lines.reduce((sum, line) => sum + line.amount, 0);
  const deposit = Math.round((total * depositPercent) / 100);
  return { lines, total, deposit, balance: total - deposit };
}

export interface SummaryLine {
  label: string;
  value: string;
}

/** Lo elegido, en pares etiqueta/valor, para el resumen en pantalla y para los mensajes. */
export function describeSelection(
  selection: OrderSelection,
  customizer: Customizer,
): SummaryLine[] {
  const lines: SummaryLine[] = [];
  const size = customizer.sizes.find((s) => s.id === selection.sizeId);
  const flavor = customizer.flavors.find((f) => f.id === selection.flavorId);
  const filling = customizer.fillings.find((f) => f.id === selection.fillingId);
  const decoration = findDecoration(selection, customizer);
  const palette = decoration?.palettes.find(
    (p) => p.id === selection.paletteId,
  );
  const dedication = normalizeDedication(selection.dedication);
  const fruits = (selection.fruitIds ?? []).flatMap((id) => {
    const fruit = customizer.fruits?.find((f) => f.id === id);
    return fruit ? [fruit.label] : [];
  });

  if (size) lines.push({ label: ORDER_FIELD_LABELS.size, value: size.label });
  if (flavor) {
    lines.push({ label: ORDER_FIELD_LABELS.flavor, value: flavor.label });
  }
  if (filling) {
    lines.push({ label: ORDER_FIELD_LABELS.filling, value: filling.label });
  }
  if (decoration) {
    lines.push({
      label: ORDER_FIELD_LABELS.decoration,
      value: palette
        ? `${decoration.label} (${palette.label})`
        : decoration.label,
    });
  }
  if (fruits.length > 0) {
    lines.push({ label: ORDER_FIELD_LABELS.fruit, value: fruits.join(", ") });
  }
  if (dedication.length > 0) {
    lines.push({
      label: ORDER_FIELD_LABELS.dedication,
      value: `"${dedication}"`,
    });
  }
  return lines;
}

/**
 * Texto plano del pedido para WhatsApp y correo. Si se recibe el estimado,
 * agrega total, anticipo y saldo, siempre rotulados como estimados.
 */
export function buildOrderSummary(
  selection: OrderSelection,
  customizer: Customizer,
  options: { quote?: Quote; depositPercent?: number; title?: string } = {},
): string {
  const rows = describeSelection(selection, customizer).map(
    (line) => `${line.label}: ${line.value}`,
  );
  const out = [options.title ?? "Pastel personalizado", ...rows];

  const { quote, depositPercent } = options;
  if (quote) {
    const percent =
      depositPercent === undefined ? "" : ` (${depositPercent} %)`;
    out.push(
      "",
      `Total estimado: ${formatMXN(quote.total)}`,
      `Anticipo${percent}: ${formatMXN(quote.deposit)}`,
      `Saldo: ${formatMXN(quote.balance)}`,
      "El precio es un estimado; se confirma por WhatsApp.",
    );
  }
  return out.join("\n");
}
