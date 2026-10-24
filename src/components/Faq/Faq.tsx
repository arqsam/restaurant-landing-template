import { useId, useState } from "react";
import type { FaqItem } from "../../content/types";
import styles from "./Faq.module.css";

interface FaqProps {
  id: string;
  title: string;
  items: FaqItem[];
}

/**
 * Preguntas frecuentes como acordeón accesible: cada pregunta es un botón con
 * aria-expanded y aria-controls dentro de un encabezado. Se maneja con Tab,
 * Enter y Espacio, y varias respuestas pueden estar abiertas a la vez.
 */
export function Faq({ id, title, items }: FaqProps) {
  const baseId = useId();
  const [open, setOpen] = useState<ReadonlySet<number>>(new Set());
  const titleId = `${id}-titulo`;

  if (items.length === 0) return null;

  const toggle = (index: number) => {
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <section id={id} className={styles.faq} aria-labelledby={titleId}>
      <h3 id={titleId} className={styles.title}>
        {title}
      </h3>
      <ul className={styles.list}>
        {items.map((item, index) => {
          const isOpen = open.has(index);
          const buttonId = `${baseId}-q${index}`;
          const panelId = `${baseId}-a${index}`;
          return (
            <li key={item.question} className={styles.item}>
              <h4 className={styles.question}>
                <button
                  type="button"
                  id={buttonId}
                  className={styles.trigger}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggle(index)}
                >
                  <span>{item.question}</span>
                  <span className={styles.icon} aria-hidden="true" />
                </button>
              </h4>
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className={styles.panel}
                hidden={!isOpen}
              >
                <p>{item.answer}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
