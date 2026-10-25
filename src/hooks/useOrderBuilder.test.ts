import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { site } from "../content/site";
import { useOrderBuilder } from "./useOrderBuilder";

function setup() {
  return renderHook(() =>
    useOrderBuilder(site.customizer, site.orders.depositPercent),
  );
}

function fillAll(result: ReturnType<typeof setup>["result"]) {
  act(() => {
    result.current.chooseSize("mediano");
    result.current.chooseFlavor("red-velvet");
    result.current.chooseFilling("dulce-leche");
    result.current.chooseDecoration("floral");
  });
}

describe("useOrderBuilder", () => {
  it("empieza vacío, sin errores visibles y con total en cero", () => {
    const { result } = setup();
    expect(result.current.selection).toEqual({});
    expect(result.current.isValid).toBe(false);
    expect(result.current.errors).toEqual({});
    expect(result.current.quote.total).toBe(0);
  });

  it("actualiza el estimado en vivo al elegir", () => {
    const { result } = setup();
    act(() => result.current.chooseSize("mini"));
    expect(result.current.quote.total).toBe(480);
    act(() => result.current.chooseFlavor("red-velvet"));
    expect(result.current.quote.total).toBe(540);
  });

  it("al elegir una decoración preselecciona su primera paleta", () => {
    const { result } = setup();
    act(() => result.current.chooseDecoration("floral"));
    expect(result.current.selection.paletteId).toBe("primavera");
    act(() => result.current.choosePalette("lavanda"));
    expect(result.current.selection.paletteId).toBe("lavanda");
  });

  it("cambiar de decoración reemplaza la paleta por una que le corresponda", () => {
    const { result } = setup();
    act(() => result.current.chooseDecoration("floral"));
    act(() => result.current.choosePalette("lavanda"));
    act(() => result.current.chooseDecoration("minimalista"));
    expect(result.current.selection.paletteId).toBe("crema");
  });

  it("es válido solo cuando todo lo obligatorio está elegido", () => {
    const { result } = setup();
    fillAll(result);
    expect(result.current.isValid).toBe(true);
    expect(result.current.missing).toEqual([]);
  });

  it("al intentar continuar sin completar muestra los errores y devuelve false", () => {
    const { result } = setup();
    let ok = true;
    act(() => {
      ok = result.current.attempt();
    });
    expect(ok).toBe(false);
    expect(result.current.errors.size).toBeTruthy();
    expect(result.current.errors.flavor).toBeTruthy();
  });

  it("al intentar continuar con todo completo devuelve true", () => {
    const { result } = setup();
    fillAll(result);
    let ok = false;
    act(() => {
      ok = result.current.attempt();
    });
    expect(ok).toBe(true);
    expect(result.current.errors).toEqual({});
  });

  it("incluye en el texto resumen lo elegido y el total estimado", () => {
    const { result } = setup();
    fillAll(result);
    expect(result.current.summaryText).toContain("Tamaño: Mediano");
    expect(result.current.summaryText).toContain("Total estimado: $1,010");
  });

  it("permite elegir y quitar frutas y suma su precio", () => {
    const { result } = setup();
    act(() => result.current.chooseSize("mini"));
    act(() => result.current.toggleFruit("fresas"));
    expect(result.current.selection.fruitIds).toEqual(["fresas"]);
    expect(result.current.quote.total).toBe(480 + 50);
    act(() => result.current.toggleFruit("fresas"));
    expect(result.current.selection.fruitIds).toEqual([]);
    expect(result.current.quote.total).toBe(480);
  });

  it("no deja elegir más frutas que el máximo", () => {
    const { result } = setup();
    const max = site.customizer.maxFruits!;
    const ids = site.customizer.fruits!.map((f) => f.id);
    for (const id of ids) act(() => result.current.toggleFruit(id));
    expect(result.current.selection.fruitIds).toHaveLength(max);
  });

  it("reset vuelve al estado inicial", () => {
    const { result } = setup();
    fillAll(result);
    act(() => {
      result.current.attempt();
      result.current.reset();
    });
    expect(result.current.selection).toEqual({});
    expect(result.current.attempted).toBe(false);
  });
});
