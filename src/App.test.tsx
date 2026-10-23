import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";
import { site } from "./content/site";
import { buildNavLinks } from "./lib/nav";
import { buildWhatsAppUrl } from "./lib/whatsapp";

describe("App", () => {
  it("muestra el título del hero como único título principal", () => {
    render(<App />);
    expect(
      screen.getByRole("heading", { level: 1, name: site.hero.title }),
    ).toBeInTheDocument();
  });

  it("el botón principal abre WhatsApp con el número y mensaje de la configuración", () => {
    render(<App />);
    expect(
      screen.getByRole("link", { name: /pedir por whatsapp/i }),
    ).toHaveAttribute(
      "href",
      buildWhatsAppUrl(site.orders.whatsapp, site.orders.defaultMessage),
    );
  });

  it("incluye el botón flotante de WhatsApp con el mismo enlace", () => {
    render(<App />);
    expect(
      screen.getByRole("link", { name: /escríbenos por whatsapp/i }),
    ).toHaveAttribute(
      "href",
      buildWhatsAppUrl(site.orders.whatsapp, site.orders.defaultMessage),
    );
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
