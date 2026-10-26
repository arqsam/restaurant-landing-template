/** Lógica pura del formulario de cotización: tipos, validación y resumen para WhatsApp. */

export const CONTACT_TYPES = ["pastel", "catering", "otro"] as const;
export type ContactType = (typeof CONTACT_TYPES)[number];

export const FULFILLMENTS = ["entrega", "recoger"] as const;
export type Fulfillment = (typeof FULFILLMENTS)[number];

export const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  pastel: "Pastel por encargo",
  catering: "Catering o mesa de postres",
  otro: "Otro",
};

export const FULFILLMENT_LABELS: Record<Fulfillment, string> = {
  entrega: "Entrega a domicilio",
  recoger: "Recoger en tienda",
};

/** Lo que el usuario escribe: todo es texto, como en los inputs. */
export interface ContactValues {
  name: string;
  phone: string;
  email: string;
  type: ContactType | "";
  /** Fecha del evento, "AAAA-MM-DD". */
  date: string;
  guests: string;
  fulfillment: Fulfillment | "";
  message: string;
  /** Honeypot: campo oculto que una persona nunca llena. */
  website: string;
}

export type ContactField = Exclude<keyof ContactValues, "website">;

/** Orden en que aparecen los campos (para mostrar errores y mover el foco). */
export const CONTACT_FIELDS: ContactField[] = [
  "name",
  "phone",
  "email",
  "type",
  "date",
  "guests",
  "fulfillment",
  "message",
];

export const EMPTY_CONTACT: ContactValues = {
  name: "",
  phone: "",
  email: "",
  type: "",
  date: "",
  guests: "",
  fulfillment: "",
  message: "",
  website: "",
};

export const MAX_MESSAGE_CHARS = 500;

export type ContactErrors = Partial<Record<ContactField, string>>;

/** Datos ya validados y limpios, listos para enviar. */
export interface ContactPayload {
  name: string;
  /** Diez dígitos, sin código de país. */
  phone: string;
  email: string;
  type: ContactType;
  date: string;
  guests?: number;
  fulfillment: Fulfillment;
  message: string;
}

/** Resultado de un proveedor de formularios (lo implementa cada adaptador). */
export type SubmitResult = { ok: true } | { ok: false; error: string };

/** Deja solo los 10 dígitos del teléfono; acepta separadores y prefijo 52 / +52 / 521. */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 13 && digits.startsWith("521")) return digits.slice(3);
  if (digits.length === 12 && digits.startsWith("52")) return digits.slice(2);
  return digits;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

function isRealDate(iso: string): boolean {
  const match = ISO_DATE.exec(iso);
  if (!match) return false;
  const [, y, m, d] = match.map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
}

/** Suma días a una fecha "AAAA-MM-DD" sin depender de la zona horaria. */
export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** Fecha de hoy "AAAA-MM-DD" en la zona horaria del negocio (o la del navegador). */
export function todayISO(now: Date = new Date(), timeZone?: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Primera fecha elegible: hoy más los días de anticipación. */
export function minEventDate(today: string, minLeadDays: number): string {
  return addDays(today, Math.max(0, minLeadDays));
}

const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

/** "2026-11-05" → "5 de noviembre de 2026". */
export function formatDateEs(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} de ${MONTHS[m - 1]} de ${y}`;
}

export interface ContactRules {
  minLeadDays: number;
  /** Hoy, "AAAA-MM-DD". */
  today: string;
}

export function validateContact(
  values: ContactValues,
  rules: ContactRules,
): { valid: boolean; errors: ContactErrors } {
  const errors: ContactErrors = {};

  if (values.name.trim().length < 2) {
    errors.name = "Escribe tu nombre (al menos 2 letras).";
  }

  if (normalizePhone(values.phone).length !== 10) {
    errors.phone = "Escribe tu WhatsApp con 10 dígitos.";
  }

  const email = values.email.trim();
  if (email && !EMAIL.test(email)) {
    errors.email = "Revisa tu correo: parece incompleto.";
  }

  if (!(CONTACT_TYPES as readonly string[]).includes(values.type)) {
    errors.type = "Elige qué necesitas.";
  }

  const needsDate = values.type === "pastel" || values.type === "catering";
  const min = minEventDate(rules.today, rules.minLeadDays);
  if (!values.date) {
    if (needsDate) errors.date = "Elige la fecha del evento.";
  } else if (!isRealDate(values.date)) {
    errors.date = "La fecha no es válida.";
  } else if (values.date < min) {
    errors.date = `Necesitamos al menos ${rules.minLeadDays} ${rules.minLeadDays === 1 ? "día" : "días"} de anticipación.`;
  }

  const guests = values.guests.trim();
  if (guests) {
    const count = Number(guests);
    if (!Number.isInteger(count) || count < 1) {
      errors.guests = "Escribe un número de personas de 1 en adelante.";
    }
  } else if (values.type === "catering") {
    errors.guests = "Indica para cuántas personas.";
  }

  if (!(FULFILLMENTS as readonly string[]).includes(values.fulfillment)) {
    errors.fulfillment = "Elige entrega o recoger.";
  }

  if (values.message.length > MAX_MESSAGE_CHARS) {
    errors.message = `El mensaje admite hasta ${MAX_MESSAGE_CHARS} caracteres.`;
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/** Limpia y convierte valores ya validados. Llamar solo si `validateContact` fue válido. */
export function toContactPayload(values: ContactValues): ContactPayload {
  const guests = values.guests.trim();
  return {
    name: values.name.trim(),
    phone: normalizePhone(values.phone),
    email: values.email.trim(),
    type: values.type as ContactType,
    date: values.date,
    ...(guests ? { guests: Number(guests) } : {}),
    fulfillment: values.fulfillment as Fulfillment,
    message: values.message.trim(),
  };
}

export const DEFAULT_CONTACT_INTRO = "Hola, quiero solicitar una cotización.";

/** Resumen de la solicitud para el mensaje de WhatsApp. */
export function buildContactSummary(
  data: ContactPayload,
  intro: string = DEFAULT_CONTACT_INTRO,
): string {
  const rows = [
    intro,
    "",
    `Tipo: ${CONTACT_TYPE_LABELS[data.type]}`,
    `Nombre: ${data.name}`,
  ];
  if (data.date) rows.push(`Fecha: ${formatDateEs(data.date)}`);
  if (data.guests) rows.push(`Personas: ${data.guests}`);
  rows.push(`Entrega: ${FULFILLMENT_LABELS[data.fulfillment]}`);
  if (data.message) rows.push(`Notas: ${data.message}`);
  return rows.join("\n");
}
