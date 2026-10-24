import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { CateringPackage, MenuCategory } from "../../content/types";
import { Catering } from "./Catering";

const intro = { eyebrow: "Eventos", title: "Tu celebración" };
const packages: CateringPackage[] = [
  {
    id: "mesa",
    name: "Mesa de postres",
    description: "Postres para todos",
    minPeople: 20,
    pricePerPerson: 95,
    includes: ["3 postres", "Montaje"],
  },
  { id: "libre", name: "A medida", description: "Se cotiza", includes: ["Lo que pidas"] },
];
const beverages: MenuCategory = {
  id: "bebidas",
  name: "Bebidas para tu evento",
  availability: "encargo",
  items: [
    { id: "cafe", name: "Café", description: "Tostado medio", price: 45, tags: ["vegano"] },
  ],
};
const buildHref = (pkg: CateringPackage) => `https://wa.me/1?text=${pkg.id}`;

function setup(withBeverages = true) {
  return render(
    <Catering
      id="catering"
      intro={intro}
      packages={packages}
      beverages={withBeverages ? beverages : undefined}
      buildHref={buildHref}
      quoteLabel="Cotizar"
    />,
  );
}

describe("Catering", () => {
  it("muestra el encabezado como h2 y un h3 por paquete", () => {
    setup();
    expect(
      screen.getByRole("heading", { level: 2, name: "Tu celebración" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "Mesa de postres" }),
    ).toBeInTheDocument();
  });

  it("muestra precio por persona, mínimo y lo que incluye", () => {
    setup();
    expect(screen.getByText("$95 por persona")).toBeInTheDocument();
    expect(screen.getByText(/mínimo 20 personas/i)).toBeInTheDocument();
    const includes = screen.getAllByRole("list", { name: "Incluye" })[0]!;
    expect(within(includes).getAllByRole("listitem")).toHaveLength(2);
  });

  it("un paquete sin precio ni mínimo no muestra línea de datos", () => {
    setup();
    expect(screen.queryByText(/por persona.*por persona/)).toBeNull();
    expect(screen.getAllByText(/por persona/i)).toHaveLength(1);
  });

  it("cada paquete tiene su propio enlace de cotización, en pestaña nueva", () => {
    setup();
    const links = screen.getAllByRole("link", { name: /cotizar/i });
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute("href", "https://wa.me/1?text=mesa");
    expect(links[1]).toHaveAttribute("href", "https://wa.me/1?text=libre");
    for (const link of links) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link.getAttribute("rel")).toContain("noopener");
    }
  });

  it("el enlace de cada paquete indica a cuál pertenece (accesibilidad)", () => {
    setup();
    expect(
      screen.getByRole("link", { name: /cotizar mesa de postres/i }),
    ).toBeInTheDocument();
  });

  it("muestra las bebidas con su precio y etiquetas", () => {
    setup();
    expect(
      screen.getByRole("heading", { level: 3, name: "Bebidas para tu evento" }),
    ).toBeInTheDocument();
    expect(screen.getByText("$45")).toBeInTheDocument();
    expect(screen.getByText("Vegano")).toBeInTheDocument();
  });

  it("sin bebidas no muestra ese bloque", () => {
    setup(false);
    expect(screen.queryByText("Bebidas para tu evento")).toBeNull();
  });
});
