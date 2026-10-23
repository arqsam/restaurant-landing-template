import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { MenuItem } from "../../content/types";
import { Featured } from "./Featured";

const intro = { eyebrow: "Lo más pedido", title: "Favoritos" };
const items: MenuItem[] = [
  {
    id: "a",
    name: "Pastel A",
    description: "Rico",
    price: 480,
    priceFrom: true,
    image: { src: "/a.webp", width: 480, height: 480, alt: "Pastel de A" },
  },
  { id: "b", name: "Galleta B", description: "Crujiente", price: 40 },
];

describe("Featured", () => {
  it("muestra el encabezado como h2 y un h3 por platillo, en orden", () => {
    render(<Featured id="destacados" intro={intro} items={items} />);
    expect(
      screen.getByRole("heading", { level: 2, name: "Favoritos" }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent),
    ).toEqual(["Pastel A", "Galleta B"]);
  });

  it("formatea los precios y antepone Desde cuando corresponde", () => {
    render(<Featured id="destacados" intro={intro} items={items} />);
    expect(screen.getByText(/desde\s+\$480/i)).toBeInTheDocument();
    expect(screen.getByText("$40")).toBeInTheDocument();
  });

  it("muestra la foto solo si existe, con su texto alternativo", () => {
    render(<Featured id="destacados" intro={intro} items={items} />);
    const cards = screen.getAllByRole("listitem");
    expect(within(cards[0]!).getByRole("img", { name: "Pastel de A" })).toBeInTheDocument();
    expect(within(cards[1]!).queryByRole("img")).toBeNull();
  });

  it("no renderiza nada si no hay platillos", () => {
    const { container } = render(
      <Featured id="destacados" intro={intro} items={[]} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
