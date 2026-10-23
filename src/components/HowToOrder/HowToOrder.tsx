import type { HowToOrderStep, SectionIntro } from "../../content/types";
import { SectionHeading } from "../SectionHeading/SectionHeading";
import styles from "./HowToOrder.module.css";

interface HowToOrderProps {
  id: string;
  intro: SectionIntro;
  steps: HowToOrderStep[];
  /** Datos breves del proceso (anticipación, anticipo). */
  facts?: string[];
}

/** Proceso de pedido en pasos numerados. */
export function HowToOrder({ id, intro, steps, facts }: HowToOrderProps) {
  const titleId = `${id}-titulo`;

  return (
    <section
      id={id}
      className="container section"
      aria-labelledby={titleId}
    >
      <SectionHeading
        id={titleId}
        eyebrow={intro.eyebrow}
        title={intro.title}
        titleEmphasis={intro.titleEmphasis}
        subtitle={intro.subtitle}
      />
      <ol className={styles.steps}>
        {steps.map((step, index) => (
          <li key={step.title} className={styles.step}>
            <span className={styles.number} aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className={styles.title}>{step.title}</h3>
            <p className={styles.description}>{step.description}</p>
          </li>
        ))}
      </ol>
      {facts && facts.length > 0 ? (
        <ul className={styles.facts}>
          {facts.map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
