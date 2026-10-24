import { describe, expect, it } from "vitest";
import { site } from "../content/site";
import { buildItemMessage, buildItemOrderHref } from "./itemOrder";

describe("buildItemMessage", () => {
  it("reemplaza {item} por el nombre", () => {
    expect(buildItemMessage("Quiero {item}, por favor", "un brownie")).toBe(
      "Quiero un brownie, por favor",
    );
  });

  it("reemplaza todas las apariciones", () => {
    expect(buildItemMessage("{item} y {item}", "Flan")).toBe("Flan y Flan");
  });

  it("deja el texto igual si no hay marcador", () => {
    expect(buildItemMessage("Hola", "Flan")).toBe("Hola");
  });
});

describe("buildItemOrderHref", () => {
  it("usa el mensaje de vitrina y codifica el nombre", () => {
    const href = buildItemOrderHref(site.orders, "vitrina", {
      name: "Mallow tostado con crumb",
    });
    expect(href.startsWith("https://wa.me/52")).toBe(true);
    const text = new URL(href).searchParams.get("text");
    expect(text).toBe(
      "Hola, quiero pedir 1 Mallow tostado con crumb. ¿Está disponible hoy?",
    );
  });

  it("usa el mensaje por encargo para lo que requiere anticipación", () => {
    const href = buildItemOrderHref(site.orders, "encargo", {
      name: "Red velvet con queso crema",
    });
    const text = new URL(href).searchParams.get("text") ?? "";
    expect(text).toContain("encargar Red velvet con queso crema");
    expect(text).toContain("anticipación");
  });
});
