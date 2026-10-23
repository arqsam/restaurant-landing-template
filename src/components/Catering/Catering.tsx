import type {
  CateringPackage,
  MenuCategory,
  SectionIntro,
} from "../../content/types";
import { DIET_TAG_LABELS } from "../../lib/menu";
import { describePackagePrice } from "../../lib/catering";
import { formatMXN } from "../../lib/money";
import { SectionHeading } from "../SectionHeading/SectionHeading";
import styles from "./Catering.module.css";

interface CateringProps {
  id: string;
  intro: SectionIntro;
  packages: CateringPackage[];
  beverages?: MenuCategory;
  /** Enlace de WhatsApp para cotizar un paquete. */
  buildHref: (pkg: CateringPackage) => string;
  quoteLabel: string;
}

/** Paquetes de catering y bebidas, sobre fondo oscuro de marca. */
export function Catering({
  id,
  intro,
  packages,
  beverages,
  buildHref,
  quoteLabel,
}: CateringProps) {
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

        <ul className={styles.packages}>
          {packages.map((pkg) => {
            const { price, minimum } = describePackagePrice(pkg);
            return (
              <li key={pkg.id} className={styles.card}>
                <h3 className={styles.name}>{pkg.name}</h3>
                {price || minimum ? (
                  <p className={styles.meta}>
                    {price ? <strong>{price}</strong> : null}
                    {price && minimum ? " · " : null}
                    {minimum}
                  </p>
                ) : null}
                <p className={styles.description}>{pkg.description}</p>
                <ul className={styles.includes} aria-label="Incluye">
                  {pkg.includes.map((entry) => (
                    <li key={entry}>{entry}</li>
                  ))}
                </ul>
                <a
                  className={styles.cta}
                  href={buildHref(pkg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${quoteLabel} ${pkg.name} (se abre en una pestaña nueva)`}
                >
                  {quoteLabel}
                </a>
              </li>
            );
          })}
        </ul>

        {beverages && beverages.items.length > 0 ? (
          <div className={styles.beverages}>
            <h3 className={styles.beveragesTitle}>{beverages.name}</h3>
            <ul className={styles.drinks}>
              {beverages.items.map((drink) => (
                <li key={drink.id} className={styles.drink}>
                  <div className={styles.drinkRow}>
                    <h4 className={styles.drinkName}>{drink.name}</h4>
                    <span className={styles.leader} aria-hidden="true" />
                    <span className={styles.drinkPrice}>
                      {formatMXN(drink.price)}
                    </span>
                  </div>
                  <p className={styles.drinkDescription}>{drink.description}</p>
                  {drink.tags && drink.tags.length > 0 ? (
                    <ul className={styles.tags} aria-label="Etiquetas">
                      {drink.tags.map((tag) => (
                        <li key={tag}>{DIET_TAG_LABELS[tag]}</li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
