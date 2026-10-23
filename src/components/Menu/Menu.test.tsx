import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { site } from "../../content/site";
import { formatMXN } from "../../lib/money";
import { Menu } from "./Menu";

describe("Menu", () => {
  it("muestra una lista de enlaces a cada categoría con destino existente", () => {
    const { container } = render(<Menu categories={site.menu} />);
    const nav = screen.getByRole("navigation", { name: /categorías/i });
    const links = within(nav).getAllByRole("link");
    expect(links).toHaveLength(site.menu.length);
    for (const link of links) {
      const id = link.getAttribute("href")?.slice(1) ?? "";
      expect(container.querySelector(`[id="${id}"]`)).toBeTruthy();
    }
  });

  it("muestra cada categoría como h3 y cada platillo como h4", () => {
    render(<Menu categories={site.menu} />);
    for (const category of site.menu) {
      expect(
        screen.getByRole("heading", { level: 3, name: category.name }),
      ).toBeInTheDocument();
    }
    const total = site.menu.flatMap((c) => c.items).length;
    expect(screen.getAllByRole("heading", { level: 4 })).toHaveLength(total);
  });

  it("formatea el precio de cada platillo en pesos", () => {
    render(<Menu categories={site.menu} />);
    const regular = site.menu
      .flatMap((category) => category.items)
      .find((item) => !item.priceFrom)!;
    expect(
      screen.getAllByText(formatMXN(regular.price)).length,
    ).toBeGreaterThan(0);
  });

  it("antepone \"Desde\" cuando el precio es el mínimo de un pastel a medida", () => {
    render(
      <Menu
        categories={[
          {
            id: "x",
            name: "Cat",
            items: [
              { id: "a", name: "Pastel", description: "d", price: 480, priceFrom: true },
              { id: "b", name: "Brownie", description: "d", price: 75 },
            ],
          },
        ]}
      />,
    );
    expect(screen.getByText(/desde\s+\$480/i)).toBeInTheDocument();
    expect(screen.getByText("$75")).toBeInTheDocument();
  });

  it("muestra la foto del platillo con texto alternativo, dimensiones y carga diferida", () => {
    render(
      <Menu
        categories={[
          {
            id: "x",
            name: "Cat",
            items: [
              {
                id: "a",
                name: "Pan",
                description: "d",
                price: 50,
                image: {
                  src: "/images/menu/a-480.webp",
                  width: 480,
                  height: 480,
                  alt: "Pan con semillas",
                },
              },
            ],
          },
        ]}
      />,
    );
    const photo = screen.getByRole("img", { name: "Pan con semillas" });
    expect(photo).toHaveAttribute("src", "/images/menu/a-480.webp");
    expect(photo).toHaveAttribute("width", "480");
    expect(photo).toHaveAttribute("height", "480");
    expect(photo).toHaveAttribute("loading", "lazy");
  });

  it("no muestra imagen en platillos que no la tienen", () => {
    render(
      <Menu
        categories={[
          {
            id: "x",
            name: "Cat",
            items: [{ id: "a", name: "Pan", description: "d", price: 50 }],
          },
        ]}
      />,
    );
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("muestra las etiquetas de dieta con texto legible", () => {
    render(
      <Menu
        categories={[
          {
            id: "x",
            name: "Cat",
            items: [
              {
                id: "a",
                name: "Pan",
                description: "d",
                price: 50,
                tags: ["vegano", "sin-gluten"],
              },
            ],
          },
        ]}
      />,
    );
    expect(screen.getByText("Vegano")).toBeInTheDocument();
    expect(screen.getByText("Sin gluten")).toBeInTheDocument();
  });

  it("no muestra lista de etiquetas en platillos que no tienen", () => {
    render(
      <Menu
        categories={[
          {
            id: "x",
            name: "Cat",
            items: [{ id: "a", name: "Pan", description: "d", price: 50 }],
          },
        ]}
      />,
    );
    expect(screen.queryByRole("list", { name: /etiquetas/i })).toBeNull();
  });
});
