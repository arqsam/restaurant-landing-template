import type { HeroImage } from "../../content/types";
import { splitEmphasis } from "../../lib/hero";
import { SECTION_IDS } from "../../lib/nav";
import styles from "./Hero.module.css";

interface HeroProps {
  tagline: string;
  title: string;
  titleEmphasis?: string;
  subtitle: string;
  image: HeroImage;
  ctaLabel: string;
  ctaHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  facts?: string[];
}

export function Hero({
  tagline,
  title,
  titleEmphasis,
  subtitle,
  image,
  ctaLabel,
  ctaHref,
  secondaryLabel,
  secondaryHref,
  facts = [],
}: HeroProps) {
  const parts = splitEmphasis(title, titleEmphasis);

  return (
    <section
      id={SECTION_IDS.hero}
      className={styles.hero}
      aria-labelledby="hero-title"
    >
      {/* Fotografía a sangre bajo un velo claro. Es la imagen principal (LCP):
          sin carga diferida y con dimensiones declaradas. */}
      <figure className={styles.figure}>
        <img
          className={styles.image}
          src={image.src}
          srcSet={image.srcSet}
          sizes={image.sizes}
          alt={image.alt}
          width={image.width}
          height={image.height}
          fetchPriority="high"
          decoding="async"
        />
      </figure>

      <div className={styles.copy}>
        <p className={styles.tagline}>{tagline}</p>

        <h1 id="hero-title" className={styles.title}>
          {parts ? (
            <>
              {parts.before}
              <em>{parts.emphasis}</em>
              {parts.after}
            </>
          ) : (
            title
          )}
        </h1>

        <p className={styles.subtitle}>{subtitle}</p>

        <div className={styles.actions}>
          <a
            className={`button ${styles.cta}`}
            href={ctaHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            {ctaLabel}
            <span className="visually-hidden">
              {" "}
              (se abre en una pestaña nueva)
            </span>
          </a>
          <a className={styles.textLink} href={secondaryHref}>
            {secondaryLabel}
            <span aria-hidden="true"> →</span>
          </a>
        </div>

        {facts.length > 0 && (
          <ul className={styles.facts}>
            {facts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
