import { describe, expect, it } from "vitest";
import type { ContactPayload } from "./contactForm";
import {
  buildFields,
  buildRequest,
  buildSubject,
  createSubmitContact,
  isFormConfigured,
  type FetchLike,
  type ProviderResponse,
} from "./formProvider";

const data: ContactPayload = {
  name: "Ana Pérez",
  phone: "5512345678",
  email: "ana@correo.com",
  type: "catering",
  date: "2026-11-05",
  guests: 40,
  fulfillment: "entrega",
  message: "Evento en oficina",
};

const web3 = { formProvider: "web3forms", formKey: "abc-123" } as const;
const formspree = { formProvider: "formspree", formKey: "xyzabc" } as const;

function reply(status: number, body: unknown): ProviderResponse {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

function fakeFetch(response: ProviderResponse | (() => Promise<never>)) {
  const calls: Parameters<FetchLike>[] = [];
  const fn: FetchLike = async (url, init) => {
    calls.push([url, init]);
    if (typeof response === "function") return response();
    return response;
  };
  return { fn, calls };
}

describe("isFormConfigured", () => {
  it("rechaza vacío y el valor de plantilla", () => {
    expect(isFormConfigured("")).toBe(false);
    expect(isFormConfigured("   ")).toBe(false);
    expect(isFormConfigured("REEMPLAZA-CON-TU-LLAVE-PUBLICA")).toBe(false);
    expect(isFormConfigured("abc-123")).toBe(true);
  });
});

describe("construcción de la solicitud", () => {
  it("el asunto indica tipo y nombre", () => {
    expect(buildSubject(data)).toBe(
      "Nueva solicitud: Catering o mesa de postres · Ana Pérez",
    );
  });

  it("los campos van legibles y solo los que tienen valor", () => {
    expect(buildFields(data)).toEqual({
      nombre: "Ana Pérez",
      whatsapp: "5512345678",
      tipo: "Catering o mesa de postres",
      entrega: "Entrega a domicilio",
      email: "ana@correo.com",
      fecha: "2026-11-05",
      personas: 40,
      mensaje: "Evento en oficina",
    });
    const minimal = buildFields({
      name: "Ana",
      phone: "5512345678",
      email: "",
      type: "pastel",
      date: "",
      fulfillment: "recoger",
      message: "",
    });
    expect(Object.keys(minimal).sort()).toEqual(
      ["entrega", "nombre", "tipo", "whatsapp"].sort(),
    );
  });

  it("Web3Forms envía la llave y el asunto al endpoint de envío", () => {
    const { url, body } = buildRequest(web3, data);
    expect(url).toBe("https://api.web3forms.com/submit");
    expect(body).toMatchObject({
      access_key: "abc-123",
      subject: buildSubject(data),
      nombre: "Ana Pérez",
    });
  });

  it("Formspree usa el id en la URL y no manda la llave en el cuerpo", () => {
    const { url, body } = buildRequest(formspree, data);
    expect(url).toBe("https://formspree.io/f/xyzabc");
    expect("access_key" in body).toBe(false);
    expect(body).toMatchObject({ _subject: buildSubject(data) });
  });
});

describe("createSubmitContact", () => {
  it("envía un POST JSON y devuelve éxito", async () => {
    const { fn, calls } = fakeFetch(reply(200, { success: true }));
    const result = await createSubmitContact(web3, { fetch: fn })(data);
    expect(result).toEqual({ ok: true });
    expect(calls).toHaveLength(1);
    const [url, init] = calls[0];
    expect(url).toBe("https://api.web3forms.com/submit");
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(init.body)).toMatchObject({ access_key: "abc-123" });
  });

  it("Formspree: ok true es éxito", async () => {
    const { fn } = fakeFetch(reply(200, { ok: true }));
    expect(await createSubmitContact(formspree, { fetch: fn })(data)).toEqual({
      ok: true,
    });
  });

  it("trata success:false como error aunque el HTTP sea 200", async () => {
    const { fn } = fakeFetch(reply(200, { success: false, message: "x" }));
    const result = await createSubmitContact(web3, { fetch: fn })(data);
    expect(result.ok).toBe(false);
  });

  it("un error 400 devuelve un mensaje en español, sin el texto del proveedor", async () => {
    const { fn } = fakeFetch(
      reply(400, { success: false, body: { message: "Invalid access key" } }),
    );
    const result = await createSubmitContact(web3, { fetch: fn })(data);
    if (result.ok) throw new Error("debía fallar");
    expect(result.error).toContain("WhatsApp");
    expect(result.error).not.toContain("Invalid");
  });

  it("con debug añade el detalle del proveedor", async () => {
    const { fn } = fakeFetch(
      reply(400, { success: false, body: { message: "Invalid access key" } }),
    );
    const result = await createSubmitContact(web3, { fetch: fn, debug: true })(
      data,
    );
    if (result.ok) throw new Error("debía fallar");
    expect(result.error).toContain("Invalid access key");
  });

  it("Formspree: lee el detalle de errors[0].message", async () => {
    const { fn } = fakeFetch(
      reply(422, { errors: [{ message: "email is invalid" }] }),
    );
    const result = await createSubmitContact(formspree, {
      fetch: fn,
      debug: true,
    })(data);
    if (result.ok) throw new Error("debía fallar");
    expect(result.error).toContain("email is invalid");
  });

  it("429 avisa que hay muchas solicitudes", async () => {
    const { fn } = fakeFetch(
      reply(429, { success: false, message: "Too many" }),
    );
    const result = await createSubmitContact(web3, { fetch: fn })(data);
    if (result.ok) throw new Error("debía fallar");
    expect(result.error).toMatch(/muchas solicitudes/i);
  });

  it("una respuesta que no es JSON (500) también es error", async () => {
    const { fn } = fakeFetch({
      ok: false,
      status: 500,
      json: async () => {
        throw new SyntaxError("Unexpected token <");
      },
    });
    const result = await createSubmitContact(web3, { fetch: fn })(data);
    expect(result.ok).toBe(false);
  });

  it("si la red falla devuelve error sin lanzar", async () => {
    const { fn } = fakeFetch(() =>
      Promise.reject(new TypeError("Failed to fetch")),
    );
    const result = await createSubmitContact(web3, { fetch: fn })(data);
    if (result.ok) throw new Error("debía fallar");
    expect(result.error).toMatch(/conexión/i);
  });

  it("si el proveedor tarda más que el límite, cancela y devuelve error", async () => {
    const slow: FetchLike = (_url, init) =>
      new Promise((_resolve, reject) => {
        init.signal.addEventListener("abort", () =>
          reject(new Error("aborted")),
        );
      });
    const result = await createSubmitContact(web3, {
      fetch: slow,
      timeoutMs: 5,
    })(data);
    expect(result.ok).toBe(false);
  });

  it("con la llave de plantilla no hace ninguna petición", async () => {
    const { fn, calls } = fakeFetch(reply(200, { success: true }));
    const result = await createSubmitContact(
      { formProvider: "web3forms", formKey: "REEMPLAZA-CON-TU-LLAVE-PUBLICA" },
      { fetch: fn },
    )(data);
    expect(calls).toHaveLength(0);
    if (result.ok) throw new Error("debía fallar");
    expect(result.error).toMatch(/aún no está conectado/i);
  });
});
