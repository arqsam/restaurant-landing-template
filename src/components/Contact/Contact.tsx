import type { ReactNode } from "react";
import type { SectionIntro } from "../../content/types";
import { SectionHeading } from "../SectionHeading/SectionHeading";

interface ContactProps {
  id: string;
  intro: SectionIntro;
  /** Subsecciones: horarios y ubicación, preguntas frecuentes, formulario. */
  children: ReactNode;
}

/** Sección de contacto: encabezado editorial y sus subsecciones. */
export function Contact({ id, intro, children }: ContactProps) {
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
      {children}
    </section>
  );
}
