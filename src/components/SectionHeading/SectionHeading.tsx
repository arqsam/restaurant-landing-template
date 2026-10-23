import { splitEmphasis } from "../../lib/hero";
import styles from "./SectionHeading.module.css";

interface SectionHeadingProps {
  /** Id del <h2>, para enlazarlo con aria-labelledby. */
  id: string;
  eyebrow: string;
  title: string;
  titleEmphasis?: string;
  subtitle?: string;
  /** "dark" para secciones sobre fondo oscuro. */
  tone?: "light" | "dark";
}

/** Encabezado editorial de sección: sobretítulo, título serif con énfasis y subtítulo. */
export function SectionHeading({
  id,
  eyebrow,
  title,
  titleEmphasis,
  subtitle,
  tone = "light",
}: SectionHeadingProps) {
  const parts = splitEmphasis(title, titleEmphasis);

  return (
    <header className={`${styles.heading} ${tone === "dark" ? styles.dark : ""}`}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2 id={id} className={styles.title}>
        {parts ? (
          <>
            {parts.before}
            <em>{parts.emphasis}</em>
            {parts.after}
          </>
        ) : (
          title
        )}
      </h2>
      {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
    </header>
  );
}
