import { describe, expect, it } from "vitest";
import type { MenuCategory } from "../content/types";
import { site } from "../content/site";
import { resolveFeatured } from "./featured";

const menu: MenuCategory[] = [
  {
    id: "a",
    name: "A",
    availability: "vitrina",
    items: [
      { id: "uno", name: "Uno", description: "d", price: 10 },
      { id: "dos", name: "Dos", description: "d", price: 20 },
    ],
  },
  { id: "b", name: "B", availability: "vitrina", items: [{ id: "tres", name: "Tres", description: "d", price: 30 }] },
];

describe("resolveFeatured", () => {
  it("respeta el orden de los ids aunque estén en categorías distintas", () => {
    expect(resolveFeatured(menu, ["tres", "uno"]).map((i) => i.id)).toEqual([
      "tres",
      "uno",
    ]);
  });

  it("ignora ids que no existen", () => {
    expect(resolveFeatured(menu, ["uno", "nada"]).map((i) => i.id)).toEqual([
      "uno",
    ]);
  });

  it("con la configuración de ejemplo resuelve todos los destacados", () => {
    expect(resolveFeatured(site.menu, site.featured.itemIds)).toHaveLength(
      site.featured.itemIds.length,
    );
  });
});
