import { describe, expect, it } from "vitest";
import { buildHeroFacts, splitEmphasis } from "./hero";

describe("splitEmphasis", () => {
  it("divide el título alrededor del fragmento resaltado", () => {
    expect(
      splitEmphasis("Postres que se quedan en la memoria", "se quedan"),
    ).toEqual({
      before: "Postres que ",
      emphasis: "se quedan",
      after: " en la memoria",
    });
  });

  it("devuelve null sin énfasis o si el fragmento no está en el título", () => {
    expect(splitEmphasis("Postres artesanales")).toBeNull();
    expect(splitEmphasis("Postres artesanales", "")).toBeNull();
    expect(splitEmphasis("Postres artesanales", "otro")).toBeNull();
  });
});

describe("buildHeroFacts", () => {
  it("incluye anticipación y anticipo", () => {
    expect(buildHeroFacts({ minLeadDays: 2, depositPercent: 50 })).toEqual([
      "Pedidos con 2 días de anticipación",
      "Anticipo del 50 %",
    ]);
  });

  it("usa el singular con 1 día", () => {
    expect(buildHeroFacts({ minLeadDays: 1, depositPercent: 30 })[0]).toBe(
      "Pedidos con 1 día de anticipación",
    );
  });

  it("omite la anticipación cuando no se requiere", () => {
    expect(buildHeroFacts({ minLeadDays: 0, depositPercent: 50 })).toEqual([
      "Anticipo del 50 %",
    ]);
  });
});
