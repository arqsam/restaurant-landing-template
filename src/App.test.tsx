import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  it("muestra la sección de menú con sus categorías y platillos", () => {
    render(<App />);
    expect(
      screen.getByRole("heading", { level: 2, name: site.menuIntro.title }),
    ).toBeInTheDocument();
    for (const category of site.menu) {
      expect(
        screen.getByRole("heading", { level: 3, name: category.name }),
      ).toBeInTheDocument();
    }
  });

  it("muestra los favoritos antes del menú y los paquetes de catering", () => {
    render(<App />);
    expect(
      screen.getByRole("heading", { level: 2, name: site.featured.title }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: site.cateringIntro.title }),
    ).toBeInTheDocument();
    for (const pkg of site.packages) {
      expect(
        screen.getByRole("heading", { level: 3, name: pkg.name }),
      ).toBeInTheDocument();
    }
  });

  it("muestra cómo pedir, galería y reseñas", () => {
    render(<App />);
    for (const title of [
      site.howToOrder.title,
      site.gallery.title,
      site.testimonials.title,
    ]) {
      expect(
        screen.getByRole("heading", { level: 2, name: title }),
      ).toBeInTheDocument();
    }
    for (const step of site.howToOrder.steps) {
      expect(
        screen.getByRole("heading", { level: 3, name: step.title }),
      ).toBeInTheDocument();
    }
  });

  it("los platillos de vitrina se piden hoy y los pasteles se encargan, cada uno con su mensaje", () => {
    render(<App />);
    const vitrina = screen.getByRole("link", {
      name: /pedir hoy mallow tostado/i,
    });
    expect(
      new URL(vitrina.getAttribute("href")!).searchParams.get("text"),
    ).toContain("¿Está disponible hoy?");
    const encargo = screen.getByRole("link", {
      name: /encargar red velvet con queso crema/i,
    });
    expect(
      new URL(encargo.getAttribute("href")!).searchParams.get("text"),
    ).toContain("anticipación");
  });

  it("el contacto incluye horarios y ubicación como subsección", () => {
    render(<App />);
    expect(
      screen.getByRole("heading", { level: 2, name: site.contactIntro.title }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "Horarios" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "Ubicación" }),
    ).toBeInTheDocument();
  });

  it("el contacto incluye las preguntas frecuentes como acordeón", () => {
    render(<App />);
    expect(
      screen.getByRole("heading", { level: 3, name: site.faq.title }),
    ).toBeInTheDocument();
    for (const item of site.faq.items) {
      expect(
        screen.getByRole("button", { name: item.question }),
      ).toHaveAttribute("aria-expanded", "false");
    }
  });

  it("el personalizador es una sección propia con módulo de entrada, no el diseñador completo", () => {
    const { container } = render(<App />);
    const section = container.querySelector("section#personalizar");
    expect(section).toBeTruthy();
    expect(container.querySelector("section#menu")!.contains(section)).toBe(
      false,
    );
    expect(
      screen.getByRole("button", { name: site.customizer.teaser.ctaLabel }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "Tamaño" })).toBeNull();
  });

  it("el formulario de cotización vive dentro de Contacto, con su título y el botón de enviar", () => {
    const { container } = render(<App />);
    const contact = container.querySelector("section#contacto")!;
    expect(contact.querySelector("#cotizar")).toBeTruthy();
    expect(
      screen.getByRole("heading", { level: 3, name: site.contactForm.title }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: site.contactForm.submitLabel }),
    ).toBeInTheDocument();
  });

  it("AC-13: 'Solicitar este pastel' lleva el pastel armado al formulario, como tipo pastel y editable", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      screen.getByRole("button", { name: site.customizer.teaser.ctaLabel }),
    );
    await user.click(screen.getByRole("radio", { name: /mediano/i }));
    await user.click(screen.getByRole("radio", { name: /red velvet/i }));
    await user.click(screen.getByRole("radio", { name: /dulce de leche/i }));
    await user.click(screen.getByRole("radio", { name: /floral/i }));
    await user.click(
      screen.getByRole("button", { name: site.customizer.requestLabel }),
    );

    expect(screen.queryByRole("dialog")).toBeNull();
    const order = screen.getByLabelText(/^tu pastel$/i) as HTMLTextAreaElement;
    expect(order.value).toContain("Tamaño: Mediano (12 porciones)");
    expect(order.value).toContain("Total estimado: $1,010");
    expect(
      screen.getByRole("radio", { name: /pastel por encargo/i }),
    ).toBeChecked();
    expect(order).not.toHaveAttribute("readonly");
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
