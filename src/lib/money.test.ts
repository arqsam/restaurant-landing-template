import { describe, expect, it } from "vitest";
import { formatMXN } from "./money";

describe("formatMXN", () => {
  it("no muestra decimales en montos enteros", () => {
    expect(formatMXN(85)).toBe("$85");
    expect(formatMXN(0)).toBe("$0");
  });

  it("separa los miles con coma", () => {
    expect(formatMXN(1250)).toBe("$1,250");
    expect(formatMXN(12500)).toBe("$12,500");
  });

  it("con showCents siempre muestra dos decimales", () => {
    expect(formatMXN(1250, { showCents: true })).toBe("$1,250.00");
    expect(formatMXN(85, { showCents: true })).toBe("$85.00");
  });

  it("conserva los centavos cuando el monto no es entero", () => {
    expect(formatMXN(99.5)).toBe("$99.50");
    expect(formatMXN(1234.56)).toBe("$1,234.56");
  });

  it("lanza un error con valores que no son números finitos", () => {
    expect(() => formatMXN(Number.NaN)).toThrow(/inválido/);
    expect(() => formatMXN(Number.POSITIVE_INFINITY)).toThrow(/inválido/);
  });
});
