import { describe, expect, it } from "vitest";
import type { DietTag } from "../content/types";
import { site } from "../content/site";
import { DIET_TAG_LABELS, categoryAnchorId } from "./menu";

describe("menu helpers", () => {
  it("toda etiqueta usada en el menú tiene texto visible", () => {
    const used = site.menu
      .flatMap((category) => category.items)
      .flatMap((item) => item.tags ?? []);
    for (const tag of used as DietTag[]) {
      expect(DIET_TAG_LABELS[tag]).toBeTruthy();
    }
  });

  it("el ancla de categoría lleva prefijo para no chocar con otras secciones", () => {
    expect(categoryAnchorId("pasteles")).toBe("menu-pasteles");
  });
});
