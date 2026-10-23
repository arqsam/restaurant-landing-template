import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Testimonial } from "../../content/types";
import { Testimonials } from "./Testimonials";

const intro = { eyebrow: "Reseñas", title: "Lo que dicen" };
const items: Testimonial[] = [
  { name: "Ana M.", text: "Delicioso.", isSample: true },
  { name: "Luis R.", text: "Puntual.", isSample: false },
];

describe("Testimonials", () => {
  it("muestra el encabezado como h2 y cada reseña como cita con su autor", () => {
    render(<Testimonials id="resenas" intro={intro} items={items} />);
    expect(
      screen.getByRole("heading", { level: 2, name: "Lo que dicen" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Delicioso.")).toBeInTheDocument();
    expect(screen.getByText("Ana M.")).toBeInTheDocument();
    expect(screen.getAllByRole("figure")).toHaveLength(2);
  });

  it("rotula como ejemplo solo las reseñas de muestra", () => {
    render(<Testimonials id="resenas" intro={intro} items={items} />);
    expect(screen.getAllByText("Reseña de ejemplo")).toHaveLength(1);
  });

  it("no renderiza nada si no hay reseñas", () => {
    const { container } = render(
      <Testimonials id="resenas" intro={intro} items={[]} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
