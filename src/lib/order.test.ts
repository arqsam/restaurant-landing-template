import { describe, expect, it } from "vitest";
import { site } from "../content/site";
import type { Customizer } from "../content/types";
import {
  buildOrderSummary,
  calcQuote,
  describeSelection,
  normalizeDedication,
  validateSelection,
  type OrderSelection,
} from "./order";

const customizer = site.customizer;
const percent = site.orders.depositPercent;

const valid: OrderSelection = {
  sizeId: "mediano",
  flavorId: "red-velvet",
  fillingId: "dulce-leche",
  decorationId: "floral",
  paletteId: "lavanda",
  dedication: "Feliz cumple Ana",
  fruitIds: [],
};

describe("validateSelection", () => {
  it("acepta una selección completa", () => {
    expect(validateSelection(valid, customizer)).toEqual({
      valid: true,
      missing: [],
      errors: {},
    });
  });

  it("sin nada elegido faltan los campos obligatorios", () => {
    const check = validateSelection({}, customizer);
    expect(check.valid).toBe(false);
    expect(check.missing).toEqual(["size", "flavor", "filling", "decoration"]);
  });

  it("cada campo obligatorio por separado impide continuar", () => {
    const cases: Array<[keyof OrderSelection, string]> = [
      ["sizeId", "size"],
      ["flavorId", "flavor"],
      ["fillingId", "filling"],
      ["decorationId", "decoration"],
      ["paletteId", "palette"],
    ];
    for (const [key, field] of cases) {
      const check = validateSelection(
        { ...valid, [key]: undefined },
        customizer,
      );
      expect(check.valid).toBe(false);
      expect(check.missing).toContain(field);
      expect(check.errors[field as keyof typeof check.errors]).toBeTruthy();
    }
  });

  it("la dedicatoria es opcional", () => {
    expect(
      validateSelection({ ...valid, dedication: undefined }, customizer).valid,
    ).toBe(true);
    expect(
      validateSelection({ ...valid, dedication: "   " }, customizer).valid,
    ).toBe(true);
  });

  it("una paleta de otra decoración cuenta como no elegida", () => {
    const check = validateSelection(
      { ...valid, decorationId: "minimalista", paletteId: "lavanda" },
      customizer,
    );
    expect(check.valid).toBe(false);
    expect(check.missing).toEqual(["palette"]);
  });

  it("una opción que no existe cuenta como no elegida", () => {
    expect(
      validateSelection({ ...valid, sizeId: "gigante" }, customizer).missing,
    ).toEqual(["size"]);
  });

  it("rechaza una dedicatoria que pasa del máximo", () => {
    const max = customizer.dedication!.maxChars;
    expect(
      validateSelection({ ...valid, dedication: "a".repeat(max) }, customizer)
        .valid,
    ).toBe(true);
    const check = validateSelection(
      { ...valid, dedication: "a".repeat(max + 1) },
      customizer,
    );
    expect(check.valid).toBe(false);
    expect(check.errors.dedication).toContain(String(max));
  });

  it("no acepta dedicatoria si el negocio no la ofrece", () => {
    const sin: Customizer = { ...customizer, dedication: undefined };
    expect(validateSelection(valid, sin).errors.dedication).toBeTruthy();
  });

  it("una decoración sin paletas no pide paleta", () => {
    const sin: Customizer = {
      ...customizer,
      decorations: [
        { id: "lisa", label: "Lisa", description: "d", palettes: [] },
      ],
    };
    expect(
      validateSelection(
        { ...valid, decorationId: "lisa", paletteId: undefined },
        sin,
      ).valid,
    ).toBe(true);
  });
});

describe("calcQuote", () => {
  it("suma el precio base y los extras elegidos", () => {
    // mediano 780 + red velvet 60 + dulce de leche 50 + floral 120 (+ dedicatoria sin costo)
    const quote = calcQuote(valid, customizer, percent);
    expect(quote.total).toBe(780 + 60 + 50 + 120);
    expect(quote.lines.map((l) => l.amount)).toEqual([780, 60, 50, 120]);
  });

  it("calcula anticipo del 50 % y saldo", () => {
    const quote = calcQuote(valid, customizer, 50);
    expect(quote.total).toBe(1010);
    expect(quote.deposit).toBe(505);
    expect(quote.balance).toBe(505);
  });

  it("el anticipo se redondea al peso y anticipo + saldo siempre suman el total", () => {
    const quote = calcQuote({ sizeId: "mini" }, customizer, 33);
    expect(quote.total).toBe(480);
    expect(quote.deposit).toBe(158); // 158.4
    expect(quote.balance).toBe(322);
    expect(quote.deposit + quote.balance).toBe(quote.total);
  });

  it("funciona con selecciones parciales (resumen en vivo)", () => {
    expect(calcQuote({}, customizer, percent)).toEqual({
      lines: [],
      total: 0,
      deposit: 0,
      balance: 0,
    });
    expect(calcQuote({ sizeId: "mini" }, customizer, percent).total).toBe(480);
  });

  it("cobra la dedicatoria solo si tiene texto y el negocio le puso precio", () => {
    const conCosto: Customizer = {
      ...customizer,
      dedication: { maxChars: 40, extraPrice: 30 },
    };
    expect(
      calcQuote({ sizeId: "mini", dedication: "Hola" }, conCosto, 50).total,
    ).toBe(510);
    expect(
      calcQuote({ sizeId: "mini", dedication: "  " }, conCosto, 50).total,
    ).toBe(480);
  });

  it("lanza un error si un id no existe en la configuración", () => {
    expect(() => calcQuote({ sizeId: "gigante" }, customizer, 50)).toThrow(
      /desconocida/i,
    );
  });

  it("cada combinación válida da el total, anticipo y saldo correctos", () => {
    const { sizes, flavors, fillings, decorations, dedication } = customizer;
    let combos = 0;
    for (const size of sizes) {
      for (const flavor of flavors) {
        for (const filling of fillings) {
          for (const decoration of decorations) {
            for (const palette of decoration.palettes) {
              for (const withDedication of [false, true]) {
                const selection: OrderSelection = {
                  sizeId: size.id,
                  flavorId: flavor.id,
                  fillingId: filling.id,
                  decorationId: decoration.id,
                  paletteId: palette.id,
                  dedication: withDedication ? "Para ti" : "",
                };
                const expected =
                  size.price +
                  (flavor.extraPrice ?? 0) +
                  (filling.extraPrice ?? 0) +
                  (decoration.extraPrice ?? 0) +
                  (withDedication ? (dedication?.extraPrice ?? 0) : 0);

                expect(validateSelection(selection, customizer).valid).toBe(
                  true,
                );
                const quote = calcQuote(selection, customizer, percent);
                expect(quote.total).toBe(expected);
                expect(quote.deposit).toBe(
                  Math.round((expected * percent) / 100),
                );
                expect(quote.deposit + quote.balance).toBe(expected);
                combos += 1;
              }
            }
          }
        }
      }
    }
    expect(combos).toBeGreaterThan(100);
  });
});

describe("fruta", () => {
  it("es opcional: sin fruta la selección sigue siendo válida", () => {
    expect(
      validateSelection({ ...valid, fruitIds: undefined }, customizer).valid,
    ).toBe(true);
  });

  it("suma el extra de cada fruta elegida", () => {
    const quote = calcQuote(
      { ...valid, fruitIds: ["fresas", "frutos-rojos"] },
      customizer,
      percent,
    );
    expect(quote.total).toBe(1010 + 50 + 70);
    expect(quote.lines.map((l) => l.label)).toContain("Fruta Fresas");
  });

  it("aparece en el resumen con las frutas separadas por coma", () => {
    const lines = describeSelection(
      { ...valid, fruitIds: ["fresas", "durazno"] },
      customizer,
    );
    expect(lines).toContainEqual({ label: "Fruta", value: "Fresas, Durazno" });
    expect(
      buildOrderSummary({ ...valid, fruitIds: ["fresas"] }, customizer),
    ).toContain("Fruta: Fresas");
  });

  it("rechaza más frutas que el máximo permitido", () => {
    const max = customizer.maxFruits!;
    const ids = customizer.fruits!.slice(0, max + 1).map((f) => f.id);
    const check = validateSelection({ ...valid, fruitIds: ids }, customizer);
    expect(check.valid).toBe(false);
    expect(check.errors.fruit).toContain(String(max));
  });

  it("rechaza una fruta que no existe y no la acepta si el negocio no ofrece fruta", () => {
    expect(
      validateSelection({ ...valid, fruitIds: ["piña"] }, customizer).valid,
    ).toBe(false);
    const sin: Customizer = { ...customizer, fruits: undefined };
    expect(
      validateSelection({ ...valid, fruitIds: ["fresas"] }, sin).errors.fruit,
    ).toBeTruthy();
  });

  it("calcQuote lanza error con una fruta desconocida", () => {
    expect(() =>
      calcQuote({ ...valid, fruitIds: ["piña"] }, customizer, percent),
    ).toThrow(/desconocida/i);
  });
});

describe("normalizeDedication", () => {
  it("quita espacios sobrantes y tolera undefined", () => {
    expect(normalizeDedication("  Hola  ")).toBe("Hola");
    expect(normalizeDedication(undefined)).toBe("");
  });
});

describe("describeSelection", () => {
  it("lista lo elegido con la paleta junto a la decoración", () => {
    expect(describeSelection(valid, customizer)).toEqual([
      { label: "Tamaño", value: "Mediano (12 porciones)" },
      { label: "Sabor", value: "Red velvet" },
      { label: "Relleno", value: "Dulce de leche" },
      { label: "Decoración", value: "Floral (Lavanda)" },
      { label: "Dedicatoria", value: '"Feliz cumple Ana"' },
    ]);
  });

  it("omite lo que todavía no se eligió", () => {
    expect(describeSelection({ sizeId: "mini" }, customizer)).toEqual([
      { label: "Tamaño", value: "Mini (6 porciones)" },
    ]);
  });
});

describe("buildOrderSummary", () => {
  it("arma el texto con lo elegido", () => {
    const text = buildOrderSummary(valid, customizer);
    expect(text.split("\n")).toEqual([
      "Pastel personalizado",
      "Tamaño: Mediano (12 porciones)",
      "Sabor: Red velvet",
      "Relleno: Dulce de leche",
      "Decoración: Floral (Lavanda)",
      'Dedicatoria: "Feliz cumple Ana"',
    ]);
  });

  it("con el estimado agrega total, anticipo, saldo y la aclaración", () => {
    const quote = calcQuote(valid, customizer, 50);
    const text = buildOrderSummary(valid, customizer, {
      quote,
      depositPercent: 50,
    });
    expect(text).toContain("Total estimado: $1,010");
    expect(text).toContain("Anticipo (50 %): $505");
    expect(text).toContain("Saldo: $505");
    expect(text).toContain("estimado");
  });

  it("permite cambiar el título", () => {
    expect(
      buildOrderSummary(valid, customizer, { title: "Pedido" }).startsWith(
        "Pedido\n",
      ),
    ).toBe(true);
  });
});
