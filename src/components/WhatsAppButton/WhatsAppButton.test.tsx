import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WhatsAppButton } from "./WhatsAppButton";

const href = "https://wa.me/525500000000?text=Hola";

describe("WhatsAppButton", () => {
  it("es un enlace con nombre accesible aunque no tenga texto visible", () => {
    render(<WhatsAppButton href={href} label="Escríbenos por WhatsApp" />);
    expect(
      screen.getByRole("link", { name: /escríbenos por whatsapp/i }),
    ).toBeInTheDocument();
  });

  it("apunta al enlace recibido y abre en pestaña nueva de forma segura", () => {
    render(<WhatsAppButton href={href} label="Escríbenos por WhatsApp" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", href);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link.getAttribute("rel")).toContain("noopener");
  });

  it("avisa que se abre en una pestaña nueva", () => {
    render(<WhatsAppButton href={href} label="Escríbenos por WhatsApp" />);
    expect(
      screen.getByRole("link", { name: /pestaña nueva/i }),
    ).toBeInTheDocument();
  });

  it("el icono queda oculto para lectores de pantalla", () => {
    const { container } = render(
      <WhatsAppButton href={href} label="Escríbenos por WhatsApp" />,
    );
    expect(container.querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});
