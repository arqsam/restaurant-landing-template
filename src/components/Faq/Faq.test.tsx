import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { FaqItem } from "../../content/types";
import { Faq } from "./Faq";

const items: FaqItem[] = [
  { question: "¿Aceptan pedidos urgentes?", answer: "Depende de la vitrina." },
  { question: "¿Cómo pago?", answer: "Por transferencia." },
];

function setup(list: FaqItem[] = items) {
  return render(<Faq id="faq" title="Preguntas frecuentes" items={list} />);
}

describe("Faq", () => {
  it("muestra el título como h3 y cada pregunta como un botón dentro de un h4", () => {
    setup();
    expect(
      screen.getByRole("heading", { level: 3, name: "Preguntas frecuentes" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 4 })).toHaveLength(2);
    expect(
      screen.getByRole("button", { name: "¿Cómo pago?" }),
    ).toBeInTheDocument();
  });

  it("empieza con todas las respuestas cerradas y ocultas", () => {
    setup();
    for (const button of screen.getAllByRole("button")) {
      expect(button).toHaveAttribute("aria-expanded", "false");
    }
    expect(screen.queryByText("Por transferencia.")).not.toBeVisible();
  });

  it("al hacer clic abre la respuesta y actualiza aria-expanded", async () => {
    const user = userEvent.setup();
    setup();
    const button = screen.getByRole("button", { name: "¿Cómo pago?" });
    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Por transferencia.")).toBeVisible();
  });

  it("un segundo clic la vuelve a cerrar", async () => {
    const user = userEvent.setup();
    setup();
    const button = screen.getByRole("button", { name: "¿Cómo pago?" });
    await user.click(button);
    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("Por transferencia.")).not.toBeVisible();
  });

  it("se maneja solo con el teclado: Tab llega al botón y Enter o Espacio lo alternan", async () => {
    const user = userEvent.setup();
    setup();
    await user.tab();
    const first = screen.getByRole("button", {
      name: "¿Aceptan pedidos urgentes?",
    });
    expect(first).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(first).toHaveAttribute("aria-expanded", "true");
    await user.keyboard(" ");
    expect(first).toHaveAttribute("aria-expanded", "false");
  });

  it("permite tener varias respuestas abiertas a la vez", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole("button", { name: /urgentes/ }));
    await user.click(screen.getByRole("button", { name: "¿Cómo pago?" }));
    expect(screen.getByText("Depende de la vitrina.")).toBeVisible();
    expect(screen.getByText("Por transferencia.")).toBeVisible();
  });

  it("cada botón controla su panel y el panel se nombra con la pregunta", async () => {
    const user = userEvent.setup();
    setup();
    const button = screen.getByRole("button", { name: "¿Cómo pago?" });
    await user.click(button);
    const panel = screen.getByRole("region", { name: "¿Cómo pago?" });
    expect(button).toHaveAttribute("aria-controls", panel.id);
  });

  it("no renderiza nada si no hay preguntas", () => {
    const { container } = setup([]);
    expect(container).toBeEmptyDOMElement();
  });
});
