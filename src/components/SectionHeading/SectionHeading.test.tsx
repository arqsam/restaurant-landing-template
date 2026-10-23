import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SectionHeading } from "./SectionHeading";

describe("SectionHeading", () => {
  it("muestra sobretítulo, título como h2 y subtítulo", () => {
    render(
      <SectionHeading
        id="t"
        eyebrow="Nuestra carta"
        title="Hecho a mano"
        subtitle="Cada día"
      />,
    );
    expect(screen.getByText("Nuestra carta")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Hecho a mano" }),
    ).toHaveAttribute("id", "t");
    expect(screen.getByText("Cada día")).toBeInTheDocument();
  });

  it("resalta en cursiva el fragmento de énfasis sin cambiar el título accesible", () => {
    render(
      <SectionHeading
        id="t"
        eyebrow="x"
        title="Hecho a mano, cada día"
        titleEmphasis="a mano"
      />,
    );
    expect(
      screen.getByRole("heading", { level: 2, name: "Hecho a mano, cada día" }),
    ).toBeInTheDocument();
    expect(screen.getByText("a mano").tagName).toBe("EM");
  });

  it("no muestra subtítulo si no se proporciona", () => {
    const { container } = render(
      <SectionHeading id="t" eyebrow="x" title="Título" />,
    );
    expect(container.querySelectorAll("p")).toHaveLength(1);
  });
});
