import type { GalleryImage, SectionIntro } from "../../content/types";
import { SectionHeading } from "../SectionHeading/SectionHeading";
import styles from "./Gallery.module.css";

interface GalleryProps {
  id: string;
  intro: SectionIntro;
  images: GalleryImage[];
}

/** Galería de fotos en cuadrícula. */
export function Gallery({ id, intro, images }: GalleryProps) {
  if (images.length === 0) return null;
  const titleId = `${id}-titulo`;

  return (
    <section id={id} className="container section" aria-labelledby={titleId}>
      <SectionHeading
        id={titleId}
        eyebrow={intro.eyebrow}
        title={intro.title}
        titleEmphasis={intro.titleEmphasis}
        subtitle={intro.subtitle}
      />
      <ul className={styles.grid}>
        {images.map((image) => (
          <li key={image.src} className={styles.item}>
            <img
              className={styles.photo}
              src={image.src}
              srcSet={image.srcSet}
              sizes="(min-width: 64em) 22rem, (min-width: 40em) 45vw, 100vw"
              width={image.width}
              height={image.height}
              alt={image.alt}
              loading="lazy"
              decoding="async"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
