import {
  useEffect,
  useId,
  useRef,
  type FormEvent,
  type ReactNode,
} from "react";
import type { ContactFormCopy } from "../../content/types";
import type { ContactFormState } from "../../hooks/useContactForm";
import {
  CONTACT_FIELD_LABELS,
  CONTACT_TYPES,
  CONTACT_TYPE_LABELS,
  FULFILLMENTS,
  FULFILLMENT_LABELS,
  MAX_MESSAGE_CHARS,
  MAX_ORDER_CHARS,
  type ContactField,
} from "../../lib/contactForm";
import styles from "./ContactForm.module.css";

interface ContactFormProps {
  id: string;
  copy: ContactFormCopy;
  /** Estado del formulario; vive fuera para que el personalizador pueda precargarlo. */
  form: ContactFormState;
  minLeadDays: number;
  /**
   * Cada vez que cambia (y no es 0) la página lleva a esta sección y enfoca el
   * primer dato por completar; lo usa "Solicitar este pastel".
   */
  focusRequest?: number;
}

interface FieldProps {
  id: string;
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: (describedBy: string | undefined) => ReactNode;
}

/** Etiqueta + control + ayuda + error, con `aria-describedby` ya resuelto. */
function Field({ id, label, optional, hint, error, children }: FieldProps) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy =
    [hint ? hintId : "", error ? errorId : ""].filter(Boolean).join(" ") ||
    undefined;
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {optional ? <span className={styles.optional}> (opcional)</span> : null}
      </label>
      {children(describedBy)}
      {hint ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Formulario de cotización. Los errores aparecen junto a cada campo (enlazados
 * con aria-describedby) y el foco va al primero. Al terminar, con éxito o con
 * error, ofrece "Continuar por WhatsApp" con el resumen para no perder el contacto.
 */
export function ContactForm({
  id,
  copy,
  form,
  minLeadDays,
  focusRequest = 0,
}: ContactFormProps) {
  const uid = useId();
  const titleId = `${id}-titulo`;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const { values, errors, status, minDate, whatsappHref } = form;
  const finished = status === "success" || status === "error";

  // Al terminar el envío, el foco pasa al aviso para que se lea sin buscarlo.
  useEffect(() => {
    if (finished) panelRef.current?.focus();
  }, [finished]);

  // Si llega una solicitud desde el personalizador: ir al formulario y enfocar
  // el primer dato que falte (o el resumen del pastel si ya está todo).
  useEffect(() => {
    if (!focusRequest) return;
    wrapperRef.current?.scrollIntoView?.();
    const root = formRef.current;
    const firstEmpty = (["name", "phone", "date"] as const)
      .map((field) =>
        root?.querySelector<HTMLInputElement>(`[data-field="${field}"]`),
      )
      .find((element) => element && element.value === "");
    const target =
      firstEmpty ?? root?.querySelector<HTMLElement>('[data-field="order"]');
    target?.focus({ preventScroll: true });
  }, [focusRequest]);

  /** Quita el resumen del pastel y deja el foco en un campo que siga existiendo. */
  const removeOrder = () => {
    form.setField("order", "");
    formRef.current
      ?.querySelector<HTMLElement>('[data-field="message"]')
      ?.focus();
  };

  const fieldId = (field: ContactField) => `${uid}-${field}`;
  const label = CONTACT_FIELD_LABELS;
  const needsDate = values.type !== "otro";
  const needsGuests = values.type === "catering";

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const firstInvalid = await form.handleSubmit();
    if (firstInvalid) {
      formRef.current
        ?.querySelector<HTMLElement>(`[data-field="${firstInvalid}"]`)
        ?.focus();
    }
  };

  const whatsappLink = whatsappHref ? (
    <a
      className="button"
      href={whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
    >
      {copy.whatsappLabel}
      <span className="visually-hidden"> (se abre en una pestaña nueva)</span>
    </a>
  ) : null;

  const days = minLeadDays === 1 ? "día" : "días";
  const dateHint =
    minLeadDays > 0
      ? `Necesitamos al menos ${minLeadDays} ${days} de anticipación.`
      : undefined;

  /** Grupo de opciones como radios nativos dentro de un fieldset. */
  const radios = <T extends string>(
    field: "type" | "fulfillment",
    options: readonly T[],
    labels: Record<T, string>,
    current: string,
    onSelect: (value: T) => void,
  ) => (
    <fieldset
      className={styles.fieldset}
      aria-describedby={errors[field] ? `${fieldId(field)}-error` : undefined}
    >
      <legend className={styles.label}>{label[field]}</legend>
      <div className={styles.options}>
        {options.map((option, index) => (
          <label key={option} className={styles.choice}>
            <input
              className={styles.radio}
              type="radio"
              name={`${uid}-${field}`}
              value={option}
              checked={current === option}
              onChange={() => onSelect(option)}
              data-field={index === 0 ? field : undefined}
              data-invalid={errors[field] ? "" : undefined}
            />
            <span className={styles.card}>{labels[option]}</span>
          </label>
        ))}
      </div>
      {errors[field] ? (
        <p id={`${fieldId(field)}-error`} className={styles.error}>
          {errors[field]}
        </p>
      ) : null}
    </fieldset>
  );

  return (
    <div ref={wrapperRef} className={styles.wrapper} id={id}>
      <h3 id={titleId} className={styles.title}>
        {copy.title}
      </h3>
      <p className={styles.intro}>{copy.intro}</p>

      {status === "success" ? (
        <div
          ref={panelRef}
          role="status"
          tabIndex={-1}
          className={`${styles.panel} ${styles.success}`}
        >
          <p className={styles.panelTitle}>{copy.successTitle}</p>
          <p className={styles.panelBody}>{copy.successBody}</p>
          <div className={styles.actions}>
            {whatsappLink}
            <button
              type="button"
              className="button button--secondary"
              onClick={form.reset}
            >
              {copy.resetLabel}
            </button>
          </div>
        </div>
      ) : (
        <form
          ref={formRef}
          className={styles.form}
          onSubmit={onSubmit}
          noValidate
          aria-labelledby={titleId}
        >
          <Field id={fieldId("name")} label={label.name} error={errors.name}>
            {(describedBy) => (
              <input
                id={fieldId("name")}
                className={styles.input}
                type="text"
                autoComplete="name"
                value={values.name}
                onChange={(e) => form.setField("name", e.target.value)}
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={describedBy}
                data-field="name"
              />
            )}
          </Field>

          <Field id={fieldId("phone")} label={label.phone} error={errors.phone}>
            {(describedBy) => (
              <input
                id={fieldId("phone")}
                className={styles.input}
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                value={values.phone}
                onChange={(e) => form.setField("phone", e.target.value)}
                aria-invalid={errors.phone ? true : undefined}
                aria-describedby={describedBy}
                data-field="phone"
              />
            )}
          </Field>

          <Field
            id={fieldId("email")}
            label={label.email}
            optional
            error={errors.email}
          >
            {(describedBy) => (
              <input
                id={fieldId("email")}
                className={styles.input}
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={(e) => form.setField("email", e.target.value)}
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={describedBy}
                data-field="email"
              />
            )}
          </Field>

          <div className={styles.full}>
            {radios(
              "type",
              CONTACT_TYPES,
              CONTACT_TYPE_LABELS,
              values.type,
              (value) => form.setField("type", value),
            )}
          </div>

          <Field
            id={fieldId("date")}
            label={label.date}
            optional={!needsDate}
            hint={dateHint}
            error={errors.date}
          >
            {(describedBy) => (
              <input
                id={fieldId("date")}
                className={styles.input}
                type="date"
                min={minDate}
                value={values.date}
                onChange={(e) => form.setField("date", e.target.value)}
                aria-invalid={errors.date ? true : undefined}
                aria-describedby={describedBy}
                data-field="date"
              />
            )}
          </Field>

          <Field
            id={fieldId("guests")}
            label={label.guests}
            optional={!needsGuests}
            error={errors.guests}
          >
            {(describedBy) => (
              <input
                id={fieldId("guests")}
                className={styles.input}
                type="number"
                inputMode="numeric"
                min={1}
                value={values.guests}
                onChange={(e) => form.setField("guests", e.target.value)}
                aria-invalid={errors.guests ? true : undefined}
                aria-describedby={describedBy}
                data-field="guests"
              />
            )}
          </Field>

          <div className={styles.full}>
            {radios(
              "fulfillment",
              FULFILLMENTS,
              FULFILLMENT_LABELS,
              values.fulfillment,
              (value) => form.setField("fulfillment", value),
            )}
          </div>

          {values.order ? (
            <div className={styles.full}>
              <Field
                id={fieldId("order")}
                label={label.order}
                hint={copy.orderHint}
                error={errors.order}
              >
                {(describedBy) => (
                  <textarea
                    id={fieldId("order")}
                    className={`${styles.input} ${styles.order}`}
                    rows={9}
                    maxLength={MAX_ORDER_CHARS}
                    value={values.order}
                    onChange={(e) => form.setField("order", e.target.value)}
                    aria-invalid={errors.order ? true : undefined}
                    aria-describedby={describedBy}
                    data-field="order"
                  />
                )}
              </Field>
              <button
                type="button"
                className={styles.linkButton}
                onClick={removeOrder}
              >
                {copy.removeOrderLabel}
              </button>
            </div>
          ) : null}

          <div className={styles.full}>
            <Field
              id={fieldId("message")}
              label={label.message}
              optional
              hint={`${values.message.length}/${MAX_MESSAGE_CHARS} caracteres`}
              error={errors.message}
            >
              {(describedBy) => (
                <textarea
                  id={fieldId("message")}
                  className={styles.input}
                  rows={4}
                  maxLength={MAX_MESSAGE_CHARS}
                  value={values.message}
                  onChange={(e) => form.setField("message", e.target.value)}
                  aria-invalid={errors.message ? true : undefined}
                  aria-describedby={describedBy}
                  data-field="message"
                />
              )}
            </Field>
          </div>

          {/* Honeypot: una persona no lo ve ni lo alcanza con el teclado. */}
          <div className={styles.trap} aria-hidden="true">
            <label>
              Sitio web
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={values.website}
                onChange={(e) => form.setField("website", e.target.value)}
              />
            </label>
          </div>

          <div className={`${styles.full} ${styles.footer}`}>
            {status === "error" ? (
              <div
                ref={panelRef}
                role="alert"
                tabIndex={-1}
                className={`${styles.panel} ${styles.failure}`}
              >
                <p className={styles.panelTitle}>{copy.errorTitle}</p>
                <p className={styles.panelBody}>{form.errorMessage}</p>
                <div className={styles.actions}>{whatsappLink}</div>
              </div>
            ) : null}
            <button
              type="submit"
              className={`button ${styles.submit}`}
              disabled={status === "submitting"}
            >
              {status === "submitting" ? copy.sendingLabel : copy.submitLabel}
            </button>
            <p className={styles.privacy}>{copy.privacyNote}</p>
          </div>
        </form>
      )}
    </div>
  );
}
