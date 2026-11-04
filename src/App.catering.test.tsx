import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import App from "./App";
import { cateringSite as site } from "./content/samples/catering";
import { SECTION_IDS, buildNavLinks } from "./lib/nav";

// AC-04: la misma aplicación, con la configuración de catering en lugar de la de pastelería.
vi.mock("./content/active", async () => {
  const { cateringSite } = await import("./content/samples/catering");
  return { site: cateringSite };
});

describe("App con la configuración de Nerita Catering", () => {
  it("muestra el título del hero y el nombre de la marca", () => {
    render(<App />);
    expect(
      screen.getByRole("heading", { level: 1, name: site.hero.title }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(site.brand.name, { exact: false }).length,
    ).toBeGreaterThan(0);
  });

  it("muestra la carta, los paquetes, la galería y las reseñas del negocio", () => {
    render(<App />);
    for (const category of site.menu) {
      expect(
        screen.getByRole("heading", { level: 3, name: category.name }),
      ).toBeInTheDocument();
    }
    for (const pkg of site.packages) {
      expect(
        screen.getByRole("heading", { level: 3, name: pkg.name }),
      ).toBeInTheDocument();
    }
    for (const title of [site.gallery.title, site.testimonials.title]) {
      expect(
        screen.getByRole("heading", { level: 2, name: title }),
      ).toBeInTheDocument();
    }
  });

  it("ningún texto visible de la página habla de la pastelería de ejemplo", () => {
    const { container } = render(<App />);
    expect(container.textContent).not.toMatch(
      /pastel|postre|mallow|crumb|tienda|hornead/i,
    );
  });

  it("no muestra el personalizador de pasteles ni su enlace", () => {
    const { container } = render(<App />);
    expect(container.querySelector(`#${SECTION_IDS.customizer}`)).toBeNull();
    expect(screen.queryByText(/arma tu pastel/i)).toBeNull();
    const nav = screen.getByRole("navigation", { name: /principal/i });
    expect(within(nav).getAllByRole("link")).toHaveLength(
      buildNavLinks(site).length,
    );
  });

  it("los botones de la carta usan el texto del negocio y su mensaje", () => {
    render(<App />);
    const link = screen.getByRole("link", {
      name: /cotizar paella de mariscos/i,
    });
    const text = new URL(link.getAttribute("href")!).searchParams.get("text");
    expect(text).toContain("Paella de mariscos");
    expect(text).toContain("para un evento");
  });

  it("el formulario ofrece los tipos de solicitud de catering", () => {
    render(<App />);
    expect(
      screen.getByRole("radio", { name: "Evento con barra de mariscos" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("radio", { name: /pastel por encargo/i }),
    ).toBeNull();
  });

  it("cada enlace de la navegación lleva a una sección que existe", () => {
    const { container } = render(<App />);
    const nav = screen.getByRole("navigation", { name: /principal/i });
    for (const anchor of within(nav).getAllByRole("link")) {
      const target = anchor.getAttribute("href")?.slice(1) ?? "";
      expect(container.querySelector(`[id="${target}"]`), target).toBeTruthy();
    }
  });

  it("aplica los colores de marca de Nerita como variables CSS", () => {
    render(<App />);
    const root = document.documentElement.style;
    expect(root.getPropertyValue("--color-primary")).toBe(
      site.brand.colors.primary,
    );
    expect(root.getPropertyValue("--color-accent")).toBe(
      site.brand.colors.accent,
    );
  });

  it("RNF-03: todas las imágenes declaran tamaño y texto alternativo; solo el hero se carga de inmediato", () => {
    const { container } = render(<App />);
    const images = Array.from(container.querySelectorAll("img"));
    // Hero + fotos de la carta + las de "Lo más pedido" + la galería.
    const menuItems = site.menu.flatMap((category) => category.items);
    const withPhoto = (items: typeof menuItems) =>
      items.filter((item) => item.image).length;
    const featured = menuItems.filter((item) =>
      site.featured.itemIds.includes(item.id),
    );
    expect(images.length).toBe(
      1 +
        withPhoto(menuItems) +
        withPhoto(featured) +
        site.gallery.images.length,
    );
    for (const image of images) {
      expect(image, image.getAttribute("src") ?? "").toHaveAttribute("width");
      expect(image).toHaveAttribute("height");
      expect(image.getAttribute("alt")?.trim().length).toBeGreaterThan(0);
    }
    const hero = images.filter((image) => image.hasAttribute("fetchpriority"));
    expect(hero).toHaveLength(1);
    for (const image of images.filter((item) => item !== hero[0])) {
      expect(image).toHaveAttribute("loading", "lazy");
    }
  });
});
