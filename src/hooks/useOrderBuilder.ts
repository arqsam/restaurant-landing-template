import { useCallback, useMemo, useState } from "react";
import type { Customizer } from "../content/types";
import {
  buildOrderSummary,
  calcQuote,
  describeSelection,
  validateSelection,
  type OrderField,
  type OrderSelection,
} from "../lib/order";

/** Estado del personalizador: selección, estimado en vivo y validación. */
export type OrderBuilder = ReturnType<typeof useOrderBuilder>;

export function useOrderBuilder(
  customizer: Customizer,
  depositPercent: number,
) {
  const [selection, setSelection] = useState<OrderSelection>({});
  const [attempted, setAttempted] = useState(false);

  const check = useMemo(
    () => validateSelection(selection, customizer),
    [selection, customizer],
  );
  const quote = useMemo(
    () => calcQuote(selection, customizer, depositPercent),
    [selection, customizer, depositPercent],
  );
  const lines = useMemo(
    () => describeSelection(selection, customizer),
    [selection, customizer],
  );
  const summaryText = useMemo(
    () => buildOrderSummary(selection, customizer, { quote, depositPercent }),
    [selection, customizer, quote, depositPercent],
  );

  const patch = useCallback((change: Partial<OrderSelection>) => {
    setSelection((current) => ({ ...current, ...change }));
  }, []);

  /** Al elegir una decoración se preselecciona su primera paleta. */
  const chooseDecoration = useCallback(
    (decorationId: string) => {
      const decoration = customizer.decorations.find(
        (d) => d.id === decorationId,
      );
      patch({ decorationId, paletteId: decoration?.palettes[0]?.id });
    },
    [customizer.decorations, patch],
  );

  /** Marca o desmarca una fruta; no deja pasar del máximo configurado. */
  const toggleFruit = useCallback(
    (fruitId: string) => {
      setSelection((current) => {
        const chosen = current.fruitIds ?? [];
        if (chosen.includes(fruitId)) {
          return {
            ...current,
            fruitIds: chosen.filter((id) => id !== fruitId),
          };
        }
        if (
          customizer.maxFruits !== undefined &&
          chosen.length >= customizer.maxFruits
        ) {
          return current;
        }
        return { ...current, fruitIds: [...chosen, fruitId] };
      });
    },
    [customizer.maxFruits],
  );

  /** Intenta continuar: si falta algo, muestra los errores. Devuelve si la selección es válida. */
  const attempt = useCallback(() => {
    setAttempted(true);
    return check.valid;
  }, [check.valid]);

  const reset = useCallback(() => {
    setSelection({});
    setAttempted(false);
  }, []);

  const errors: Partial<Record<OrderField, string>> = attempted
    ? check.errors
    : {};

  return {
    selection,
    quote,
    lines,
    summaryText,
    isValid: check.valid,
    missing: check.missing,
    errors,
    attempted,
    chooseSize: (sizeId: string) => patch({ sizeId }),
    chooseFlavor: (flavorId: string) => patch({ flavorId }),
    chooseFilling: (fillingId: string) => patch({ fillingId }),
    chooseDecoration,
    toggleFruit,
    choosePalette: (paletteId: string) => patch({ paletteId }),
    setDedication: (dedication: string) => patch({ dedication }),
    attempt,
    reset,
  };
}
