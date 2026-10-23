import type { SectionIntro, Testimonial } from "../../content/types";
import { SectionHeading } from "../SectionHeading/SectionHeading";
import styles from "./Testimonials.module.css";

interface TestimonialsProps {
  id: string;
  intro: SectionIntro;
  items: Testimonial[];
}

/** Reseñas de clientes sobre banda oscura. Las reseñas de muestra se rotulan como tales. */
export function Testimonials({ id, intro, items }: TestimonialsProps) {
  if (items.length === 0) return null;
  const titleId = `${id}-titulo`;

  return (
    <section id={id} className={styles.band} aria-labelledby={titleId}>
      <div className="container section">
        <SectionHeading
          id={titleId}
          eyebrow={intro.eyebrow}
          title={intro.title}
          titleEmphasis={intro.titleEmphasis}
          subtitle={intro.subtitle}
          tone="dark"
        />
        <ul className={styles.grid}>
          {items.map((item) => (
            <li key={item.name} className={styles.card}>
              <figure className={styles.figure}>
                <blockquote className={styles.quote}>
                  <p>{item.text}</p>
                </blockquote>
                <figcaption className={styles.caption}>
                  <span className={styles.name}>{item.name}</span>
                  {item.isSample ? (
                    <span className={styles.sample}>Reseña de ejemplo</span>
                  ) : null}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
