import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HowToOrder } from "./HowToOrder";

const intro = { eyebrow: "Paso a paso", title: "Pedir es sencillo" };
const steps = [
  { title: "Elige", description: "Revisa la carta." },
  { title: "Cotiza", description: "Escríbenos." },
  { title: "Recibe", description: "Recoge tu pedido." },
];

describe("HowToOrder", () => {
  it("muestra el encabezado como h2 y una lista ordenada con un h3 por paso", () => {
    render(<HowToOrder id="como-pedir" intro={intro} steps={steps} />);
    expect(
      screen.getByRole("heading", { level: 2, name: "Pedir es sencillo" }),
    ).toBeInTheDocument();
    const list = screen.getByRole("list");
    expect(list.tagName).toBe("OL");
    expect(
      within(list).getAllByRole("heading", { level: 3 }).map((h) => h.textContent),
    ).toEqual(["Elige", "Cotiza", "Recibe"]);
  });

  it("numera los pasos de forma decorativa (la lista ya los numera para lectores de pantalla)", () => {
    const { container } = render(
      <HowToOrder id="como-pedir" intro={intro} steps={steps} />,
    );
    const numbers = container.querySelectorAll('[aria-hidden="true"]');
    expect(Array.from(numbers).map((n) => n.textContent)).toEqual([
      "01",
      "02",
      "03",
    ]);
  });

  it("muestra los datos del proceso cuando se reciben", () => {
    render(
      <HowToOrder
        id="como-pedir"
        intro={intro}
        steps={steps}
        facts={["Pedidos con 2 días de anticipación", "Anticipo del 50 %"]}
      />,
    );
    expect(screen.getByText("Anticipo del 50 %")).toBeInTheDocument();
  });

  it("sin datos no muestra la lista de datos", () => {
    render(<HowToOrder id="como-pedir" intro={intro} steps={steps} />);
    expect(screen.getAllByRole("list")).toHaveLength(1);
  });
});
