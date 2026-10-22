import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Header } from "./Header";

const links = [
  { id: "menu", label: "Menú" },
  { id: "galeria", label: "Galería" },
  { id: "contacto", label: "Contacto" },
];

function setup() {
  render(<Header brandName="Mallow & Crumb" links={links} />);
  return userEvent.setup();
}

describe("Header", () => {
  it("muestra la marca como enlace al inicio", () => {
    setup();
    expect(screen.getByRole("link", { name: "Mallow & Crumb" })).toHaveAttribute(
      "href",
      "#inicio",
    );
  });

  it("renderiza un enlace de ancla por cada sección recibida", () => {
    setup();
    const nav = screen.getByRole("navigation", { name: /principal/i });
    for (const link of links) {
      expect(
        screen.getByRole("link", { name: link.label }),
      ).toHaveAttribute("href", `#${link.id}`);
    }
    expect(nav).toBeInTheDocument();
  });

  it("el botón del menú alterna aria-expanded y su nombre", async () => {
    const user = setup();
    const button = screen.getByRole("button", { name: /abrir menú/i });
    expect(button).toHaveAttribute("aria-expanded", "false");

    await user.click(button);
    expect(
      screen.getByRole("button", { name: /cerrar menú/i }),
    ).toHaveAttribute("aria-expanded", "true");

    await user.click(screen.getByRole("button", { name: /cerrar menú/i }));
    expect(
      screen.getByRole("button", { name: /abrir menú/i }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("Escape cierra el menú y devuelve el foco al botón", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: /abrir menú/i }));
    await user.keyboard("{Escape}");

    const button = screen.getByRole("button", { name: /abrir menú/i });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveFocus();
  });

  it("al elegir un enlace el menú se cierra", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: /abrir menú/i }));
    await user.click(screen.getByRole("link", { name: "Galería" }));
    expect(
      screen.getByRole("button", { name: /abrir menú/i }),
    ).toHaveAttribute("aria-expanded", "false");
  });
});
