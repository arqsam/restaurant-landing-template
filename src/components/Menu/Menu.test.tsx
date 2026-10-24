import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { site } from "../../content/site";
import type { MenuCategory } from "../../content/types";
import { buildItemOrderHref } from "../../lib/itemOrder";
import { formatMXN } from "../../lib/money";
import { Menu } from "./Menu";

function renderMenu(categories: MenuCategory[]) {
  return render(
    <Menu
      categories={categories}
      itemOrder={site.orders.itemOrder}
      buildHref={(availability, item) =>
        buildItemOrderHref(site.orders, availability, item)
      }
    />,
  );
}

function oneItemCategory(
  overrides: Partial<MenuCategory["items"][number]> = {},
  availability: MenuCategory["availability"] = "vitrina",
): MenuCategory[] {
  return [
    {
      id: "x",
      name: "Cat",
      availability,
      items: [{ id: "a", name: "Pan", description: "d", price: 50, ...overrides }],
    },
  ];
}

describe("Menu", () => {
  it("muestra una lista de enlaces a cada categoría con destino existente", () => {
    const { container } = renderMenu(site.menu);
    const nav = screen.getByRole("navigation", { name: /categorías/i });
    const links = within(nav).getAllByRole("link");
    expect(links).toHaveLength(site.menu.length);
    for (const link of links) {
      const id = link.getAttribute("href")?.slice(1) ?? "";
      expect(container.querySelector(`[id="${id}"]`)).toBeTruthy();
    }
  });

  it("muestra cada categoría como h3 y cada platillo como h4", () => {
    renderMenu(site.menu);
    for (const category of site.menu) {
      expect(
        screen.getByRole("heading", { level: 3, name: category.name }),
      ).toBeInTheDocument();
    }
    const total = site.menu.flatMap((c) => c.items).length;
    expect(screen.getAllByRole("heading", { level: 4 })).toHaveLength(total);
  });

  it("formatea el precio de cada platillo en pesos", () => {
    renderMenu(site.menu);
    const regular = site.menu
      .flatMap((category) => category.items)
      .find((item) => !item.priceFrom)!;
    expect(
      screen.getAllByText(formatMXN(regular.price)).length,
    ).toBeGreaterThan(0);
  });

  it('antepone "Desde" cuando el precio es el mínimo de un pastel a medida', () => {
    renderMenu(oneItemCategory({ name: "Pastel", price: 480, priceFrom: true }));
    expect(screen.getByText(/desde\s+\$480/i)).toBeInTheDocument();
  });

  it("muestra la foto del platillo con texto alternativo, dimensiones y carga diferida", () => {
    renderMenu(
      oneItemCategory({
        image: {
          src: "/images/menu/a-480.webp",
          width: 480,
          height: 480,
          alt: "Pan con semillas",
        },
      }),
    );
    const photo = screen.getByRole("img", { name: "Pan con semillas" });
    expect(photo).toHaveAttribute("src", "/images/menu/a-480.webp");
    expect(photo).toHaveAttribute("width", "480");
    expect(photo).toHaveAttribute("height", "480");
    expect(photo).toHaveAttribute("loading", "lazy");
  });

  it("no muestra imagen en platillos que no la tienen", () => {
    renderMenu(oneItemCategory());
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("muestra las etiquetas de dieta con texto legible", () => {
    renderMenu(oneItemCategory({ tags: ["vegano", "sin-gluten"] }));
    expect(screen.getByText("Vegano")).toBeInTheDocument();
    expect(screen.getByText("Sin gluten")).toBeInTheDocument();
  });

  it("no muestra lista de etiquetas en platillos que no tienen", () => {
    renderMenu(oneItemCategory());
    expect(screen.queryByRole("list", { name: /etiquetas/i })).toBeNull();
  });

  it("rotula cada categoría según su disponibilidad", () => {
    renderMenu([
      ...oneItemCategory({}, "vitrina"),
      { ...oneItemCategory({ id: "b", name: "Torta" }, "encargo")[0]!, id: "y", name: "Otra" },
    ]);
    expect(screen.getByText(site.orders.itemOrder.vitrina.badge)).toBeInTheDocument();
    expect(screen.getByText(site.orders.itemOrder.encargo.badge)).toBeInTheDocument();
  });

  it("cada platillo tiene un botón de pedido que abre WhatsApp con su nombre", () => {
    renderMenu(oneItemCategory({ name: "Mallow tostado" }));
    const link = screen.getByRole("link", { name: /pedir hoy mallow tostado/i });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link.getAttribute("rel")).toContain("noopener");
    const text = new URL(link.getAttribute("href")!).searchParams.get("text");
    expect(text).toContain("Mallow tostado");
  });

  it("lo que es por encargo usa el botón y el mensaje de encargo", () => {
    renderMenu(oneItemCategory({ name: "Red velvet" }, "encargo"));
    const link = screen.getByRole("link", { name: /encargar red velvet/i });
    const text = new URL(link.getAttribute("href")!).searchParams.get("text");
    expect(text).toContain("encargar Red velvet");
  });
});
