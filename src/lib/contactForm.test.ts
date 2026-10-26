import { describe, expect, it } from "vitest";
import {
  EMPTY_CONTACT,
  MAX_MESSAGE_CHARS,
  addDays,
  buildContactSummary,
  formatDateEs,
  minEventDate,
  normalizePhone,
  toContactPayload,
  todayISO,
  validateContact,
  type ContactValues,
} from "./contactForm";

const rules = { minLeadDays: 2, today: "2026-10-26" };

const valid: ContactValues = {
  ...EMPTY_CONTACT,
  name: "Ana Pérez",
  phone: "55 1234 5678",
  type: "pastel",
  date: "2026-11-05",
  fulfillment: "recoger",
};

const check = (change: Partial<ContactValues>) =>
  validateContact({ ...valid, ...change }, rules);

describe("normalizePhone", () => {
  it("quita separadores", () => {
    expect(normalizePhone("(55) 1234-5678")).toBe("5512345678");
  });
  it("quita el código de país 52, +52 y 521", () => {
    expect(normalizePhone("+52 55 1234 5678")).toBe("5512345678");
    expect(normalizePhone("525512345678")).toBe("5512345678");
    expect(normalizePhone("5215512345678")).toBe("5512345678");
  });
  it("no recorta números que no traen código de país", () => {
    expect(normalizePhone("5512345")).toBe("5512345");
  });
});

describe("fechas", () => {
  it("suma días cruzando fin de mes y de año", () => {
    expect(addDays("2026-10-30", 3)).toBe("2026-11-02");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
  });
  it("la fecha mínima suma la anticipación a hoy", () => {
    expect(minEventDate("2026-10-26", 2)).toBe("2026-10-28");
    expect(minEventDate("2026-10-26", 0)).toBe("2026-10-26");
  });
  it("todayISO usa la zona horaria del negocio", () => {
    const instant = new Date("2026-10-27T03:30:00Z");
    expect(todayISO(instant, "America/Mexico_City")).toBe("2026-10-26");
    expect(todayISO(instant, "UTC")).toBe("2026-10-27");
  });
  it("formatea la fecha en español", () => {
    expect(formatDateEs("2026-11-05")).toBe("5 de noviembre de 2026");
  });
});

describe("validateContact", () => {
  it("acepta una solicitud completa", () => {
    expect(check({})).toEqual({ valid: true, errors: {} });
  });

  it("pide un nombre de al menos 2 caracteres", () => {
    expect(check({ name: "" }).errors.name).toBeDefined();
    expect(check({ name: " A " }).errors.name).toBeDefined();
    expect(check({ name: "Al" }).errors.name).toBeUndefined();
  });

  it("exige un WhatsApp de 10 dígitos", () => {
    expect(check({ phone: "" }).errors.phone).toBeDefined();
    expect(check({ phone: "551234567" }).errors.phone).toBeDefined();
    expect(check({ phone: "55123456789" }).errors.phone).toBeDefined();
    expect(check({ phone: "+52 55 1234 5678" }).errors.phone).toBeUndefined();
  });

  it("el correo es opcional pero debe ser válido si se escribe", () => {
    expect(check({ email: "" }).errors.email).toBeUndefined();
    expect(check({ email: "ana@correo.com" }).errors.email).toBeUndefined();
    expect(check({ email: "ana@correo" }).errors.email).toBeDefined();
    expect(check({ email: "ana correo.com" }).errors.email).toBeDefined();
  });

  it("exige elegir el tipo", () => {
    expect(check({ type: "" }).errors.type).toBeDefined();
  });

  it("la fecha es obligatoria para pastel y catering, opcional para otro", () => {
    expect(check({ date: "" }).errors.date).toBeDefined();
    expect(
      check({ type: "catering", date: "", guests: "20" }).errors.date,
    ).toBeDefined();
    expect(check({ type: "otro", date: "" }).errors.date).toBeUndefined();
  });

  it("respeta la anticipación mínima", () => {
    expect(check({ date: "2026-10-27" }).errors.date).toMatch(/2 días/);
    expect(check({ date: "2026-10-26" }).errors.date).toBeDefined();
    expect(check({ date: "2026-10-28" }).errors.date).toBeUndefined();
  });

  it("rechaza fechas inexistentes o con formato raro", () => {
    expect(check({ date: "2026-02-30" }).errors.date).toMatch(/no es válida/);
    expect(check({ date: "05/11/2026" }).errors.date).toMatch(/no es válida/);
  });

  it("catering exige personas; en pastel son opcionales", () => {
    expect(check({ type: "catering", guests: "" }).errors.guests).toBeDefined();
    expect(check({ type: "pastel", guests: "" }).errors.guests).toBeUndefined();
  });

  it("las personas deben ser un entero de 1 en adelante", () => {
    for (const guests of ["0", "-3", "2.5", "abc"]) {
      expect(check({ guests }).errors.guests).toBeDefined();
    }
    expect(check({ guests: "12" }).errors.guests).toBeUndefined();
  });

  it("exige elegir entrega o recoger", () => {
    expect(check({ fulfillment: "" }).errors.fulfillment).toBeDefined();
  });

  it("limita la longitud del mensaje", () => {
    expect(
      check({ message: "x".repeat(MAX_MESSAGE_CHARS) }).errors.message,
    ).toBeUndefined();
    expect(
      check({ message: "x".repeat(MAX_MESSAGE_CHARS + 1) }).errors.message,
    ).toBeDefined();
  });

  it("un formulario vacío marca los campos obligatorios (la fecha pide tipo elegido)", () => {
    const { valid: ok, errors } = validateContact(EMPTY_CONTACT, rules);
    expect(ok).toBe(false);
    expect(Object.keys(errors).sort()).toEqual(
      ["fulfillment", "name", "phone", "type"].sort(),
    );
  });
});

describe("toContactPayload", () => {
  it("limpia espacios, normaliza el teléfono y convierte las personas", () => {
    const payload = toContactPayload({
      ...valid,
      name: "  Ana Pérez ",
      phone: "+52 55 1234 5678",
      guests: " 20 ",
      message: " Sin nuez ",
    });
    expect(payload).toEqual({
      name: "Ana Pérez",
      phone: "5512345678",
      email: "",
      type: "pastel",
      date: "2026-11-05",
      guests: 20,
      fulfillment: "recoger",
      message: "Sin nuez",
    });
  });
  it("no incluye personas si el campo está vacío", () => {
    expect("guests" in toContactPayload(valid)).toBe(false);
  });
});

describe("buildContactSummary", () => {
  it("resume tipo, fecha, personas, entrega y notas", () => {
    const text = buildContactSummary(
      toContactPayload({
        ...valid,
        type: "catering",
        guests: "40",
        fulfillment: "entrega",
        message: "Evento en oficina",
      }),
    );
    expect(text).toContain("Hola, quiero solicitar una cotización.");
    expect(text).toContain("Tipo: Catering o mesa de postres");
    expect(text).toContain("Nombre: Ana Pérez");
    expect(text).toContain("Fecha: 5 de noviembre de 2026");
    expect(text).toContain("Personas: 40");
    expect(text).toContain("Entrega: Entrega a domicilio");
    expect(text).toContain("Notas: Evento en oficina");
  });
  it("omite las líneas opcionales vacías y no incluye datos de contacto", () => {
    const text = buildContactSummary(
      toContactPayload({ ...valid, email: "a@b.co" }),
    );
    expect(text).not.toContain("Personas");
    expect(text).not.toContain("Notas");
    expect(text).not.toContain("5512345678");
    expect(text).not.toContain("a@b.co");
  });
  it("permite cambiar la línea inicial", () => {
    expect(
      buildContactSummary(toContactPayload(valid), "Buenas tardes").startsWith(
        "Buenas tardes",
      ),
    ).toBe(true);
  });
});
