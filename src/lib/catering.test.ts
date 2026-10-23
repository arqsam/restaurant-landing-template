import { describe, expect, it } from "vitest";
import type { CateringPackage } from "../content/types";
import { buildPackageMessage, describePackagePrice } from "./catering";

const base: CateringPackage = {
  id: "x",
  name: "Mesa de postres",
  description: "d",
  includes: ["a"],
};

describe("describePackagePrice", () => {
  it("formatea precio por persona y mínimo de personas", () => {
    expect(
      describePackagePrice({ ...base, pricePerPerson: 95, minPeople: 20 }),
    ).toEqual({ price: "$95 por persona", minimum: "Mínimo 20 personas" });
  });

  it("devuelve null cuando no hay precio o mínimo (se cotiza)", () => {
    expect(describePackagePrice(base)).toEqual({ price: null, minimum: null });
  });
});

describe("buildPackageMessage", () => {
  it("incluye el nombre del paquete", () => {
    expect(buildPackageMessage(base)).toContain('"Mesa de postres"');
  });
});
