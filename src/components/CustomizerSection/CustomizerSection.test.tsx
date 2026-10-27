import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { site } from "../../content/site";
import { CustomizerSection } from "./CustomizerSection";

function setup(onRequest?: (text: string) => void) {
  const user = userEvent.setup();
  render(
    <CustomizerSection
      id="personalizar"
      customizer={site.customizer}
      depositPercent={site.orders.depositPercent}
      notes={[site.orders.paymentNote]}
      buildHref={(text) => `https://wa.me/1?text=${text.length}`}
      ctaLabel="Pedir por WhatsApp"
      onRequest={onRequest}
    />,
  );
  return { user };
}

const openButton = () =>
  screen.getByRole("button", { name: site.customizer.teaser.ctaLabel });

describe("CustomizerSection", () => {
  it("muestra solo el módulo de entrada: título h2 y botón para abrir", () => {
    setup();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: site.customizer.teaser.title,
      }),
    ).toBeInTheDocument();
    expect(openButton()).toHaveAttribute("aria-haspopup", "dialog");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.queryByRole("group", { name: "Tamaño" })).toBeNull();
  });

  it("muestra la foto del módulo con su texto alternativo", () => {
    setup();
    expect(
      screen.getByRole("img", { name: site.customizer.teaser.image!.alt }),
    ).toBeInTheDocument();
  });

  it("al abrir muestra el diseñador completo dentro de un diálogo", async () => {
    const { user } = setup();
    await user.click(openButton());
    const dialog = screen.getByRole("dialog", { name: site.customizer.title });
    expect(
      within(dialog).getByRole("group", { name: "Tamaño" }),
    ).toBeInTheDocument();
  });

  it("se cierra con Escape y devuelve el foco al botón", async () => {
    const { user } = setup();
    await user.click(openButton());
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(openButton()).toHaveFocus();
  });

  it("conserva lo elegido al cerrar y el botón pasa a 'seguir diseñando'", async () => {
    const { user } = setup();
    await user.click(openButton());
    await user.click(screen.getByRole("radio", { name: /mediano/i }));
    await user.keyboard("{Escape}");
    await user.click(
      screen.getByRole("button", { name: site.customizer.teaser.resumeLabel }),
    );
    expect(screen.getByRole("radio", { name: /mediano/i })).toBeChecked();
    expect(screen.getByText("Total estimado").nextSibling).toHaveTextContent(
      "$780",
    );
  });

  it("al solicitar cotización cierra el diálogo y entrega el resumen", async () => {
    const onRequest = vi.fn();
    const { user } = setup(onRequest);
    await user.click(openButton());
    await user.click(screen.getByRole("radio", { name: /mediano/i }));
    await user.click(screen.getByRole("radio", { name: /red velvet/i }));
    await user.click(screen.getByRole("radio", { name: /dulce de leche/i }));
    await user.click(screen.getByRole("radio", { name: /floral/i }));
    await user.click(
      screen.getByRole("button", { name: site.customizer.requestLabel }),
    );
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(onRequest).toHaveBeenCalledTimes(1);
    expect(onRequest.mock.calls[0][0]).toContain("Tamaño: Mediano");
  });
});
