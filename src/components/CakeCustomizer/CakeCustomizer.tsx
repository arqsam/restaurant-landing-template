import { useId, type ReactNode } from "react";
import type { Customizer } from "../../content/types";
import type { OrderBuilder } from "../../hooks/useOrderBuilder";
import { formatMXN } from "../../lib/money";
import { ORDER_FIELD_LABELS, type OrderField } from "../../lib/order";
import styles from "./CakeCustomizer.module.css";

interface CakeCustomizerProps {
  /** Id del título (lo usa el diálogo como nombre accesible). */
  titleId: string;
  /** Estado del personalizador; vive fuera para que no se pierda al cerrar el diálogo. */
  builder: OrderBuilder;
  customizer: Customizer;
  depositPercent: number;
  /** Avisos bajo el resumen (forma de pago, anticipación). */
  notes?: string[];
  /** Enlace de WhatsApp para enviar el pedido con el resumen en texto. */
  buildHref: (summaryText: string) => string;
  ctaLabel: string;
}

interface ChoiceProps {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
}

/** Opción de un grupo de radios, mostrada como tarjeta seleccionable. */
function Choice({ name, value, checked, onChange, children }: ChoiceProps) {
  return (
    <label className={styles.choice}>
      <input
        className={styles.input}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
      />
      <span className={styles.card}>{children}</span>
    </label>
  );
}

function extra(price?: number) {
  return price ? (
    <span className={styles.extra}>+{formatMXN(price)}</span>
  ) : null;
}

/** "Arma tu pastel": elecciones, estimado en vivo y envío del pedido por WhatsApp. */
export function CakeCustomizer({
  titleId,
  builder,
  customizer,
  depositPercent,
  notes = [],
  buildHref,
  ctaLabel,
}: CakeCustomizerProps) {
  const uid = useId();
  const { selection, quote, errors } = builder;
  const decoration = customizer.decorations.find(
    (d) => d.id === selection.decorationId,
  );
  const palette = decoration?.palettes.find(
    (p) => p.id === selection.paletteId,
  );
  const fruits = customizer.fruits ?? [];
  const chosenFruits = selection.fruitIds ?? [];
  const fruitLimitReached =
    customizer.maxFruits !== undefined &&
    chosenFruits.length >= customizer.maxFruits;
  const dedication = customizer.dedication;
  const dedicationLength = (selection.dedication ?? "").length;

  const error = (field: OrderField) =>
    errors[field] ? (
      <p className={styles.error} id={`${uid}-${field}-error`} role="alert">
        {errors[field]}
      </p>
    ) : null;

  return (
    <div className={styles.section}>
      <header className={styles.header}>
        <h2 id={titleId} className={styles.title}>
          {customizer.title}
        </h2>
        {customizer.intro ? (
          <p className={styles.intro}>{customizer.intro}</p>
        ) : null}
      </header>

      <div className={styles.layout}>
        <div className={styles.form}>
          <fieldset className={styles.fieldset}>
            <legend>{ORDER_FIELD_LABELS.size}</legend>
            <div className={styles.options}>
              {customizer.sizes.map((size) => (
                <Choice
                  key={size.id}
                  name={`${uid}-size`}
                  value={size.id}
                  checked={selection.sizeId === size.id}
                  onChange={() => builder.chooseSize(size.id)}
                >
                  <span className={styles.label}>{size.label}</span>
                  <span className={styles.price}>{formatMXN(size.price)}</span>
                </Choice>
              ))}
            </div>
            {error("size")}
          </fieldset>

          <fieldset className={styles.fieldset}>
            <legend>{ORDER_FIELD_LABELS.flavor}</legend>
            <div className={styles.options}>
              {customizer.flavors.map((flavor) => (
                <Choice
                  key={flavor.id}
                  name={`${uid}-flavor`}
                  value={flavor.id}
                  checked={selection.flavorId === flavor.id}
                  onChange={() => builder.chooseFlavor(flavor.id)}
                >
                  <span className={styles.label}>{flavor.label}</span>
                  {extra(flavor.extraPrice)}
                </Choice>
              ))}
            </div>
            {error("flavor")}
          </fieldset>

          <fieldset className={styles.fieldset}>
            <legend>{ORDER_FIELD_LABELS.filling}</legend>
            <div className={styles.options}>
              {customizer.fillings.map((filling) => (
                <Choice
                  key={filling.id}
                  name={`${uid}-filling`}
                  value={filling.id}
                  checked={selection.fillingId === filling.id}
                  onChange={() => builder.chooseFilling(filling.id)}
                >
                  <span className={styles.label}>{filling.label}</span>
                  {extra(filling.extraPrice)}
                </Choice>
              ))}
            </div>
            {error("filling")}
          </fieldset>

          {fruits.length > 0 ? (
            <fieldset className={styles.fieldset}>
              <legend>
                {ORDER_FIELD_LABELS.fruit} (opcional
                {customizer.maxFruits ? `, hasta ${customizer.maxFruits}` : ""})
              </legend>
              <div className={styles.options}>
                {fruits.map((fruit) => {
                  const checked = chosenFruits.includes(fruit.id);
                  const disabled = !checked && fruitLimitReached;
                  return (
                    <label
                      key={fruit.id}
                      className={styles.choice}
                      data-disabled={disabled || undefined}
                    >
                      <input
                        className={styles.input}
                        type="checkbox"
                        value={fruit.id}
                        checked={checked}
                        disabled={disabled}
                        onChange={() => builder.toggleFruit(fruit.id)}
                      />
                      <span className={styles.card}>
                        <span className={styles.label}>{fruit.label}</span>
                        {extra(fruit.extraPrice)}
                      </span>
                    </label>
                  );
                })}
              </div>
              {error("fruit")}
            </fieldset>
          ) : null}

          <fieldset className={styles.fieldset}>
            <legend>{ORDER_FIELD_LABELS.decoration}</legend>
            <div className={styles.options}>
              {customizer.decorations.map((option) => (
                <Choice
                  key={option.id}
                  name={`${uid}-decoration`}
                  value={option.id}
                  checked={selection.decorationId === option.id}
                  onChange={() => builder.chooseDecoration(option.id)}
                >
                  <span className={styles.label}>{option.label}</span>
                  <span className={styles.description}>
                    {option.description}
                  </span>
                  {extra(option.extraPrice)}
                </Choice>
              ))}
            </div>
            {error("decoration")}
          </fieldset>

          {decoration && decoration.palettes.length > 0 ? (
            <fieldset className={styles.fieldset}>
              <legend>{ORDER_FIELD_LABELS.palette}</legend>
              <div className={styles.options}>
                {decoration.palettes.map((palette) => (
                  <Choice
                    key={palette.id}
                    name={`${uid}-palette`}
                    value={palette.id}
                    checked={selection.paletteId === palette.id}
                    onChange={() => builder.choosePalette(palette.id)}
                  >
                    <span className={styles.swatches} aria-hidden="true">
                      {palette.colors.map((color) => (
                        <span
                          key={color}
                          className={styles.swatch}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </span>
                    <span className={styles.label}>{palette.label}</span>
                  </Choice>
                ))}
              </div>
              {error("palette")}
            </fieldset>
          ) : null}

          {dedication ? (
            <div className={styles.fieldset}>
              <label htmlFor={`${uid}-dedication`} className={styles.legend}>
                {ORDER_FIELD_LABELS.dedication} (opcional)
              </label>
              <input
                id={`${uid}-dedication`}
                className={styles.text}
                type="text"
                value={selection.dedication ?? ""}
                maxLength={dedication.maxChars}
                onChange={(event) => builder.setDedication(event.target.value)}
                aria-describedby={`${uid}-dedication-help`}
              />
              <p id={`${uid}-dedication-help`} className={styles.help}>
                {dedicationLength}/{dedication.maxChars} caracteres
                {dedication.extraPrice
                  ? ` · +${formatMXN(dedication.extraPrice)}`
                  : ""}
              </p>
              {error("dedication")}
            </div>
          ) : null}
        </div>

        <aside className={styles.summary} aria-label="Resumen de tu pastel">
          <figure className={styles.preview}>
            {decoration?.image ? (
              <img
                className={styles.previewImage}
                src={decoration.image.src}
                srcSet={decoration.image.srcSet}
                sizes="(min-width: 64em) 24rem, 100vw"
                width={decoration.image.width}
                height={decoration.image.height}
                alt={decoration.image.alt}
                decoding="async"
              />
            ) : decoration && palette ? (
              <div
                className={styles.previewColors}
                style={{
                  background: `linear-gradient(135deg, ${palette.colors.join(", ")})`,
                }}
                role="img"
                aria-label={`Muestra de color ${palette.label}`}
              >
                <span>{decoration.label}</span>
              </div>
            ) : (
              <div className={styles.previewEmpty}>
                Elige una decoración para ver una referencia.
              </div>
            )}
            {decoration ? (
              <figcaption className={styles.previewCaption}>
                <span>
                  {decoration.label}
                  {palette ? ` · ${palette.label}` : ""}
                </span>
                {palette ? (
                  <span className={styles.swatches} aria-hidden="true">
                    {palette.colors.map((color) => (
                      <span
                        key={color}
                        className={styles.swatch}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </span>
                ) : null}
              </figcaption>
            ) : null}
            <p className={styles.previewNote}>
              Foto de referencia: el diseño final se acuerda contigo.
            </p>
          </figure>
          <h3 className={styles.summaryTitle}>Tu pastel</h3>
          {builder.lines.length > 0 ? (
            <dl className={styles.lines}>
              {builder.lines.map((line) => (
                <div key={line.label} className={styles.line}>
                  <dt>{line.label}</dt>
                  <dd>{line.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className={styles.empty}>Aún no has elegido nada.</p>
          )}

          <div className={styles.totals} aria-live="polite">
            <div className={styles.line}>
              <span>Total estimado</span>
              <strong>{formatMXN(quote.total)}</strong>
            </div>
            <div className={styles.line}>
              <span>Anticipo ({depositPercent} %)</span>
              <span>{formatMXN(quote.deposit)}</span>
            </div>
            <div className={styles.line}>
              <span>Saldo</span>
              <span>{formatMXN(quote.balance)}</span>
            </div>
          </div>

          {builder.attempted && !builder.isValid ? (
            <p className={styles.error} role="alert">
              Completa:{" "}
              {builder.missing
                .map((field) => ORDER_FIELD_LABELS[field].toLowerCase())
                .join(", ")}
              .
            </p>
          ) : null}

          {builder.isValid ? (
            <a
              className={styles.cta}
              href={buildHref(builder.summaryText)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {ctaLabel}
              <span className="visually-hidden">
                {" "}
                (se abre en una pestaña nueva)
              </span>
            </a>
          ) : (
            <button
              type="button"
              className={styles.cta}
              aria-disabled="true"
              onClick={() => builder.attempt()}
            >
              {ctaLabel}
            </button>
          )}

          <ul className={styles.notes}>
            <li>El precio es un estimado; lo confirmamos por WhatsApp.</li>
            {notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
