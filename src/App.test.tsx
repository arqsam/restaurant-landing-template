import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";
import { site } from "./content/site";
import { buildNavLinks } from "./lib/nav";

describe("App", () => {
  it("muestra el nombre de la marca como título principal", () => {
    render(<App />);
    expect(
      screen.getByRole("heading", { level: 1, name: /mallow & crumb/i }),
    ).toBeInTheDocument();
  });

  it("aplica los colores de marca de la configuración como variables CSS", () => {
    render(<App />);
    const root = document.documentElement.style;
    expect(root.getPropertyValue("--color-primary")).toBe(
      site.brand.colors.primary,
    );
    expect(root.getPropertyValue("--color-accent")).toBe(
      site.brand.colors.accent,
    );
  });

  it("incluye un enlace para saltar al contenido principal", () => {
    const { container } = render(<App />);
    expect(
      screen.getByRole("link", { name: /saltar al contenido/i }),
    ).toHaveAttribute("href", "#contenido");
    expect(container.querySelector("main#contenido")).toBeTruthy();
  });

  it("la navegación solo tiene enlaces de secciones activas y cada uno tiene destino", () => {
    const { container } = render(<App />);
    const nav = screen.getByRole("navigation", { name: /principal/i });
    const anchors = within(nav).getAllByRole("link");
    expect(anchors).toHaveLength(buildNavLinks(site).length);

    for (const anchor of anchors) {
      const target = anchor.getAttribute("href")?.slice(1) ?? "";
      expect(container.querySelector(`[id="${target}"]`)).toBeTruthy();
    }
  });
});
