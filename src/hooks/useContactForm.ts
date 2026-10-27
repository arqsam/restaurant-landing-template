import { useCallback, useMemo, useRef, useState } from "react";
import {
  CONTACT_FIELDS,
  EMPTY_CONTACT,
  buildContactSummary,
  minEventDate,
  todayISO,
  toContactPayload,
  validateContact,
  type ContactErrors,
  type ContactField,
  type ContactPayload,
  type ContactValues,
  type SubmitResult,
} from "../lib/contactForm";
import { buildWhatsAppUrl } from "../lib/whatsapp";

/** Estado del formulario de cotización (lo comparte la página con el personalizador). */
export type ContactFormState = ReturnType<typeof useContactForm>;

export type ContactStatus = "idle" | "submitting" | "success" | "error";

export interface UseContactFormOptions {
  /** Días mínimos de anticipación (`orders.minLeadDays`). */
  minLeadDays: number;
  /** Zona horaria del negocio, para calcular "hoy". */
  timeZone?: string;
  /** Envía los datos al proveedor (adaptador). */
  submit: (data: ContactPayload) => Promise<SubmitResult>;
  /** WhatsApp del negocio, para el botón "Continuar por WhatsApp". */
  whatsappPhone: string;
  /** Primera línea del mensaje de WhatsApp. */
  intro?: string;
  /** Reloj inyectable (pruebas). */
  now?: () => Date;
}

const NETWORK_ERROR =
  "No pudimos registrar tu solicitud por correo. Puedes continuar por WhatsApp.";

/** Estado del formulario de cotización: validación, honeypot, envío y enlace de WhatsApp. */
export function useContactForm({
  minLeadDays,
  timeZone,
  submit,
  whatsappPhone,
  intro,
  now = () => new Date(),
}: UseContactFormOptions) {
  const [values, setValues] = useState<ContactValues>(EMPTY_CONTACT);
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<ContactStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [payload, setPayload] = useState<ContactPayload | null>(null);
  const sending = useRef(false);

  const today = todayISO(now(), timeZone);
  const minDate = minEventDate(today, minLeadDays);
  const rules = useMemo(() => ({ minLeadDays, today }), [minLeadDays, today]);

  /** Tras el primer intento de envío los errores se muestran y se actualizan al escribir. */
  const errors: ContactErrors = useMemo(
    () => (attempted ? validateContact(values, rules).errors : {}),
    [attempted, values, rules],
  );

  /** Cambia un campo. */
  const setField = useCallback(
    <K extends keyof ContactValues>(field: K, value: ContactValues[K]) => {
      setValues((current) => ({ ...current, [field]: value }));
    },
    [],
  );

  /**
   * Valida y envía. Devuelve el primer campo con error (para mover el foco)
   * o `null` si todo está bien.
   */
  const handleSubmit = useCallback(async (): Promise<ContactField | null> => {
    if (sending.current) return null;

    const check = validateContact(values, rules);
    setAttempted(true);
    if (!check.valid) {
      return CONTACT_FIELDS.find((field) => check.errors[field]) ?? null;
    }

    const data = toContactPayload(values);
    setPayload(data);
    setErrorMessage(null);

    // Honeypot: si lo llenó un robot, se simula éxito sin enviar nada.
    if (values.website.trim() !== "") {
      setStatus("success");
      return null;
    }

    sending.current = true;
    setStatus("submitting");
    try {
      const result = await submit(data);
      if (result.ok) {
        setStatus("success");
      } else {
        setErrorMessage(result.error || NETWORK_ERROR);
        setStatus("error");
      }
    } catch {
      setErrorMessage(NETWORK_ERROR);
      setStatus("error");
    } finally {
      sending.current = false;
    }
    return null;
  }, [values, rules, submit]);

  /**
   * Carga valores desde fuera (p. ej. el pastel del personalizador). Conserva lo
   * que la persona ya escribió; si el formulario ya se había enviado, empieza de cero.
   */
  const prefill = useCallback(
    (change: Partial<ContactValues>) => {
      if (status === "submitting") return;
      if (status === "success" || status === "error") {
        setValues({ ...EMPTY_CONTACT, ...change });
        setAttempted(false);
        setStatus("idle");
        setErrorMessage(null);
        setPayload(null);
        return;
      }
      setValues((current) => ({ ...current, ...change }));
    },
    [status],
  );

  const reset = useCallback(() => {
    setValues(EMPTY_CONTACT);
    setAttempted(false);
    setStatus("idle");
    setErrorMessage(null);
    setPayload(null);
  }, []);

  /** Enlace "Continuar por WhatsApp": disponible al terminar, con éxito o con error. */
  const whatsappHref = useMemo(() => {
    if (!payload || (status !== "success" && status !== "error")) return null;
    return buildWhatsAppUrl(whatsappPhone, buildContactSummary(payload, intro));
  }, [payload, status, whatsappPhone, intro]);

  return {
    values,
    errors,
    status,
    errorMessage,
    minDate,
    whatsappHref,
    setField,
    handleSubmit,
    prefill,
    reset,
  };
}
