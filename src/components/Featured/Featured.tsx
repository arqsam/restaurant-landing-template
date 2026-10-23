import type { MenuItem, SectionIntro } from "../../content/types";
import { formatMXN } from "../../lib/money";
import { SectionHeading } from "../SectionHeading/SectionHeading";
import styles from "./Featured.module.css";

interface FeaturedProps {
  id: string;
  intro: SectionIntro;
  items: MenuItem[];
}

/** Favoritos de la casa: tarjetas grandes con foto, nombre y precio. */
export function Featured({ id, intro, items }: FeaturedProps) {
  if (items.length === 0) return null;
  const titleId = `${id}-titulo`;

  return (
    <section
      id={id}
      className={`container section ${styles.section}`}
      aria-labelledby={titleId}
    >
      <SectionHeading
        id={titleId}
        eyebrow={intro.eyebrow}
        title={intro.title}
        titleEmphasis={intro.titleEmphasis}
        subtitle={intro.subtitle}
      />
      <ul className={styles.grid}>
        {items.map((item) => (
          <li key={item.id} className={styles.card}>
            {item.image ? (
              <img
                className={styles.photo}
                src={item.image.src}
                srcSet={item.image.srcSet}
                sizes="(min-width: 48em) 22rem, calc(100vw - 2rem)"
                width={item.image.width}
                height={item.image.height}
                alt={item.image.alt}
                loading="lazy"
                decoding="async"
              />
            ) : null}
            <div className={styles.body}>
              <h3 className={styles.name}>{item.name}</h3>
              <p className={styles.description}>{item.description}</p>
              <p className={styles.price}>
                {item.priceFrom ? "Desde " : ""}
                {formatMXN(item.price)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
