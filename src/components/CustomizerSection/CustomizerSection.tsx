import { useId, useState } from "react";
import type { Customizer } from "../../content/types";
import { useOrderBuilder } from "../../hooks/useOrderBuilder";
import { splitEmphasis } from "../../lib/hero";
import { CakeCustomizer } from "../CakeCustomizer/CakeCustomizer";
import { Dialog } from "../Dialog/Dialog";
import styles from "./CustomizerSection.module.css";

interface CustomizerSectionProps {
  id: string;
  customizer: Customizer;
  depositPercent: number;
  notes?: string[];
  buildHref: (summaryText: string) => string;
  ctaLabel: string;
  /** Se llama con el resumen al pedir cotización; el diálogo se cierra antes. */
  onRequest?: (summaryText: string) => void;
}

/**
 * Módulo de entrada al personalizador: una invitación breve en la página y el
 * diseñador completo en un diálogo, para no alargar el recorrido. La selección
 * se conserva al cerrar y volver a abrir.
 */
export function CustomizerSection({
  id,
  customizer,
  depositPercent,
  notes,
  buildHref,
  ctaLabel,
  onRequest,
}: CustomizerSectionProps) {
  const builder = useOrderBuilder(customizer, depositPercent);
  const [open, setOpen] = useState(false);
  const dialogTitleId = useId();
  const titleId = `${id}-titulo`;
  const { teaser } = customizer;
  const parts = splitEmphasis(teaser.title, teaser.titleEmphasis);
  const started = builder.lines.length > 0;

  return (
    <section id={id} className={styles.band} aria-labelledby={titleId}>
      <div className={`container ${styles.inner}`}>
        {teaser.image ? (
          <img
            className={styles.photo}
            src={teaser.image.src}
            srcSet={teaser.image.srcSet}
            sizes="(min-width: 48em) 24rem, 100vw"
            width={teaser.image.width}
            height={teaser.image.height}
            alt={teaser.image.alt}
            loading="lazy"
            decoding="async"
          />
        ) : null}
        <div className={styles.copy}>
          <p className={styles.eyebrow}>{teaser.eyebrow}</p>
          <h2 id={titleId} className={styles.title}>
            {parts ? (
              <>
                {parts.before}
                <em>{parts.emphasis}</em>
                {parts.after}
              </>
            ) : (
              teaser.title
            )}
          </h2>
          {teaser.subtitle ? (
            <p className={styles.subtitle}>{teaser.subtitle}</p>
          ) : null}
          <button
            type="button"
            className={styles.cta}
            aria-haspopup="dialog"
            onClick={() => setOpen(true)}
          >
            {started ? teaser.resumeLabel : teaser.ctaLabel}
          </button>
        </div>
      </div>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        titleId={dialogTitleId}
        closeLabel="Cerrar el diseñador"
      >
        <CakeCustomizer
          titleId={dialogTitleId}
          builder={builder}
          customizer={customizer}
          depositPercent={depositPercent}
          notes={notes}
          buildHref={buildHref}
          ctaLabel={ctaLabel}
          onRequest={
            onRequest
              ? (summary) => {
                  setOpen(false);
                  onRequest(summary);
                }
              : undefined
          }
        />
      </Dialog>
    </section>
  );
}
