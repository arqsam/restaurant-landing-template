import {
  CONTACT_TYPE_LABELS,
  FULFILLMENT_LABELS,
  type ContactPayload,
  type SubmitResult,
} from "./contactForm";

/**
 * Adaptador de proveedor de formularios (ADR 0003). Cada proveedor traduce los
 * datos validados a su API y su respuesta a `SubmitResult`. Cambiar de proveedor
 * es cambiar `contact.formProvider` en `site.ts`.
 */
export type FormProvider = "web3forms" | "formspree";

export interface FormProviderConfig {
  formProvider: FormProvider;
  /** Llave pública del proveedor (Web3Forms) o id del formulario (Formspree). */
  formKey: string;
}

export interface ProviderResponse {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}

/** `fetch` mínimo que necesita el adaptador (permite simularlo en pruebas). */
export type FetchLike = (
  url: string,
  init: {
    method: string;
    headers: Record<string, string>;
    body: string;
    signal: AbortSignal;
  },
) => Promise<ProviderResponse>;

export interface SubmitOptions {
  fetch?: FetchLike;
  /** Milisegundos de espera antes de darse por vencido. */
  timeoutMs?: number;
  /** Añade al mensaje de error el detalle del proveedor (útil mientras se configura). */
  debug?: boolean;
}

const NOT_CONFIGURED =
  "El formulario aún no está conectado a un correo. Puedes continuar por WhatsApp.";
const GENERIC =
  "No pudimos registrar tu solicitud por correo. Puedes continuar por WhatsApp.";
const OFFLINE =
  "No pudimos conectar con el servicio de correo. Revisa tu conexión o continúa por WhatsApp.";
const BUSY =
  "Hay muchas solicitudes en este momento. Inténtalo de nuevo en unos minutos o continúa por WhatsApp.";

/** ¿La llave ya fue reemplazada? El valor de plantilla empieza con "REEMPLAZA". */
export function isFormConfigured(formKey: string): boolean {
  const key = formKey.trim();
  return key !== "" && !key.startsWith("REEMPLAZA");
}

export function buildSubject(data: ContactPayload): string {
  return `Nueva solicitud: ${CONTACT_TYPE_LABELS[data.type]} · ${data.name}`;
}

/** Campos legibles que recibe el dueño en el correo (solo los que tienen valor). */
export function buildFields(data: ContactPayload) {
  const fields: Record<string, string | number> = {
    nombre: data.name,
    whatsapp: data.phone,
    tipo: CONTACT_TYPE_LABELS[data.type],
    entrega: FULFILLMENT_LABELS[data.fulfillment],
  };
  if (data.email) fields.email = data.email;
  if (data.date) fields.fecha = data.date;
  if (data.guests) fields.personas = data.guests;
  if (data.message) fields.mensaje = data.message;
  return fields;
}

export function buildRequest(
  config: FormProviderConfig,
  data: ContactPayload,
): { url: string; body: Record<string, unknown> } {
  const fields = buildFields(data);
  const subject = buildSubject(data);
  switch (config.formProvider) {
    case "web3forms":
      return {
        url: "https://api.web3forms.com/submit",
        body: { access_key: config.formKey, subject, ...fields },
      };
    case "formspree":
      return {
        url: `https://formspree.io/f/${encodeURIComponent(config.formKey)}`,
        body: { _subject: subject, ...fields },
      };
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Busca el texto de error en las formas de respuesta de cada proveedor. */
function extractMessage(json: unknown): string | undefined {
  if (!isRecord(json)) return undefined;
  const { body, message, error, errors } = json;
  if (isRecord(body) && typeof body.message === "string") return body.message;
  if (typeof message === "string") return message;
  if (typeof error === "string") return error;
  if (Array.isArray(errors) && isRecord(errors[0])) {
    const first = errors[0].message;
    if (typeof first === "string") return first;
  }
  return undefined;
}

/**
 * Crea la función de envío. Nunca lanza: devuelve `{ ok: false, error }` con un
 * mensaje en español para la persona, sin importar cómo falle.
 */
export function createSubmitContact(
  config: FormProviderConfig,
  options: SubmitOptions = {},
): (data: ContactPayload) => Promise<SubmitResult> {
  const send: FetchLike = options.fetch ?? ((url, init) => fetch(url, init));
  const timeoutMs = options.timeoutMs ?? 10_000;

  return async (data) => {
    if (!isFormConfigured(config.formKey)) {
      return { ok: false, error: NOT_CONFIGURED };
    }

    const { url, body } = buildRequest(config, data);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await send(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      let json: unknown;
      try {
        json = await response.json();
      } catch {
        json = undefined;
      }

      const rejected =
        isRecord(json) && (json.success === false || json.ok === false);
      if (response.ok && !rejected) return { ok: true };

      const detail = extractMessage(json);
      const base = response.status === 429 ? BUSY : GENERIC;
      return {
        ok: false,
        error: options.debug && detail ? `${base} (${detail})` : base,
      };
    } catch (error) {
      const detail = error instanceof Error ? error.message : "";
      return {
        ok: false,
        error: options.debug && detail ? `${OFFLINE} (${detail})` : OFFLINE,
      };
    } finally {
      clearTimeout(timer);
    }
  };
}
