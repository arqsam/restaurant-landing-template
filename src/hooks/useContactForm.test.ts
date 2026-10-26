import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ContactPayload, SubmitResult } from "../lib/contactForm";
import { useContactForm } from "./useContactForm";

const NOW = new Date("2026-10-26T18:00:00Z"); // 12:00 en Ciudad de México

function setup(
  submit: (data: ContactPayload) => Promise<SubmitResult> = () =>
    Promise.resolve({ ok: true }),
) {
  const spy = vi.fn(submit);
  const hook = renderHook(() =>
    useContactForm({
      minLeadDays: 2,
      timeZone: "America/Mexico_City",
      submit: spy,
      whatsappPhone: "525512345678",
      now: () => NOW,
    }),
  );
  return { ...hook, spy };
}

type Hook = ReturnType<typeof setup>["result"];

function fill(result: Hook, change: Record<string, string> = {}) {
  const data: Record<string, string> = {
    name: "Ana Pérez",
    phone: "55 1234 5678",
    type: "pastel",
    date: "2026-11-05",
    fulfillment: "recoger",
    ...change,
  };
  act(() => {
    for (const [field, value] of Object.entries(data)) {
      result.current.setField(field as "name", value);
    }
  });
}

const submit = (result: Hook) =>
  act(async () => {
    return result.current.handleSubmit();
  });

describe("useContactForm", () => {
  it("empieza vacío, sin errores y con la fecha mínima calculada", () => {
    const { result } = setup();
    expect(result.current.status).toBe("idle");
    expect(result.current.errors).toEqual({});
    expect(result.current.whatsappHref).toBeNull();
    expect(result.current.minDate).toBe("2026-10-28");
  });

  it("no muestra errores hasta el primer intento de envío", () => {
    const { result } = setup();
    fill(result, { name: "A" });
    expect(result.current.errors).toEqual({});
  });

  it("con datos inválidos no envía, muestra errores y devuelve el primer campo", async () => {
    const { result, spy } = setup();
    fill(result, { name: "", phone: "123" });
    let first: unknown;
    await act(async () => {
      first = await result.current.handleSubmit();
    });
    expect(first).toBe("name");
    expect(spy).not.toHaveBeenCalled();
    expect(result.current.status).toBe("idle");
    expect(result.current.errors.name).toBeDefined();
    expect(result.current.errors.phone).toBeDefined();
  });

  it("después del primer intento los errores se corrigen al escribir", async () => {
    const { result } = setup();
    fill(result, { name: "" });
    await submit(result);
    expect(result.current.errors.name).toBeDefined();
    fill(result, { name: "Ana" });
    expect(result.current.errors.name).toBeUndefined();
  });

  it("con datos válidos envía los datos limpios y termina en éxito", async () => {
    const { result, spy } = setup();
    fill(result, { name: " Ana Pérez ", phone: "+52 55 1234 5678" });
    await submit(result);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toMatchObject({
      name: "Ana Pérez",
      phone: "5512345678",
      type: "pastel",
    });
    expect(result.current.status).toBe("success");
    expect(result.current.errorMessage).toBeNull();
  });

  it("mientras envía el estado es 'submitting' y no permite un segundo envío", async () => {
    let finish: (r: SubmitResult) => void = () => {};
    const { result, spy } = setup(
      () => new Promise<SubmitResult>((resolve) => (finish = resolve)),
    );
    fill(result);
    let pending: Promise<unknown> = Promise.resolve();
    act(() => {
      pending = result.current.handleSubmit();
    });
    expect(result.current.status).toBe("submitting");
    await submit(result);
    expect(spy).toHaveBeenCalledTimes(1);
    await act(async () => {
      finish({ ok: true });
      await pending;
    });
    expect(result.current.status).toBe("success");
  });

  it("si el proveedor responde con error, pasa a 'error' con su mensaje", async () => {
    const { result } = setup(() =>
      Promise.resolve({ ok: false, error: "Límite mensual alcanzado" }),
    );
    fill(result);
    await submit(result);
    expect(result.current.status).toBe("error");
    expect(result.current.errorMessage).toBe("Límite mensual alcanzado");
  });

  it("si la red falla (la promesa se rechaza), pasa a 'error' con un mensaje claro", async () => {
    const { result } = setup(() => Promise.reject(new Error("offline")));
    fill(result);
    await submit(result);
    expect(result.current.status).toBe("error");
    expect(result.current.errorMessage).toMatch(/whatsapp/i);
  });

  it("si el honeypot tiene contenido simula éxito sin enviar", async () => {
    const { result, spy } = setup();
    fill(result, { website: "https://spam.example" });
    await submit(result);
    expect(spy).not.toHaveBeenCalled();
    expect(result.current.status).toBe("success");
  });

  it("el enlace de WhatsApp aparece al terminar, con éxito o con error, y lleva el resumen", async () => {
    const ok = setup();
    fill(ok.result);
    expect(ok.result.current.whatsappHref).toBeNull();
    await submit(ok.result);
    const url = new URL(ok.result.current.whatsappHref!);
    expect(url.hostname).toBe("wa.me");
    expect(url.pathname).toBe("/525512345678");
    const text = url.searchParams.get("text")!;
    expect(text).toContain("Tipo: Pastel por encargo");
    expect(text).toContain("Fecha: 5 de noviembre de 2026");

    const failed = setup(() => Promise.resolve({ ok: false, error: "x" }));
    fill(failed.result);
    await submit(failed.result);
    expect(failed.result.current.whatsappHref).not.toBeNull();
  });

  it("reset devuelve el formulario al inicio", async () => {
    const { result } = setup();
    fill(result);
    await submit(result);
    act(() => result.current.reset());
    expect(result.current.status).toBe("idle");
    expect(result.current.values.name).toBe("");
    expect(result.current.whatsappHref).toBeNull();
  });
});
