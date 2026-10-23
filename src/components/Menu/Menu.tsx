import type { MenuCategory } from "../../content/types";
import { DIET_TAG_LABELS, categoryAnchorId } from "../../lib/menu";
import { formatMXN } from "../../lib/money";
import styles from "./Menu.module.css";

interface MenuProps {
  categories: MenuCategory[];
}

/** Carta por categorías: nombre, descripción, etiquetas de dieta y precio en MXN. */
export function Menu({ categories }: MenuProps) {
  return (
    <div className={styles.menu}>
      <nav className={styles.chips} aria-label="Categorías del menú">
        <ul>
          {categories.map((category) => (
            <li key={category.id}>
              <a href={`#${categoryAnchorId(category.id)}`}>{category.name}</a>
            </li>
          ))}
        </ul>
      </nav>

      {categories.map((category) => {
        const titleId = `${categoryAnchorId(category.id)}-titulo`;
        return (
          <section
            key={category.id}
            id={categoryAnchorId(category.id)}
            className={styles.category}
            aria-labelledby={titleId}
          >
            <h3 id={titleId} className={styles.categoryTitle}>
              {category.name}
            </h3>
            <ul className={styles.items}>
              {category.items.map((item) => (
                <li
                  key={item.id}
                  className={`${styles.item} ${item.image ? styles.withImage : ""}`}
                >
                  {item.image ? (
                    <img
                      className={styles.photo}
                      src={item.image.src}
                      srcSet={item.image.srcSet}
                      sizes="(min-width: 48em) 7.5rem, 6rem"
                      width={item.image.width}
                      height={item.image.height}
                      alt={item.image.alt}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : null}
                  <div className={styles.body}>
                  <div className={styles.row}>
                    <h4 className={styles.name}>{item.name}</h4>
                    <span className={styles.leader} aria-hidden="true" />
                    <span className={styles.price}>
                      {item.priceFrom ? "Desde " : ""}
                      {formatMXN(item.price)}
                    </span>
                  </div>
                  <p className={styles.description}>{item.description}</p>
                  {item.tags && item.tags.length > 0 ? (
                    <ul className={styles.tags} aria-label="Etiquetas">
                      {item.tags.map((tag) => (
                        <li key={tag}>{DIET_TAG_LABELS[tag]}</li>
                      ))}
                    </ul>
                  ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
