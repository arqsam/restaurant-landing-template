import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Dialog } from "./Dialog";

function Harness({ onCloseSpy }: { onCloseSpy?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <main>
        <button type="button" onClick={() => setOpen(true)}>
          Abrir
        </button>
      </main>
      <Dialog
        open={open}
        onClose={() => {
          onCloseSpy?.();
          setOpen(false);
        }}
        titleId="t"
        closeLabel="Cerrar"
      >
        <h2 id="t">Diseñador</h2>
        <button type="button">Uno</button>
        <button type="button">Dos</button>
      </Dialog>
    </>
  );
}

describe("Dialog", () => {
  it("cerrado no renderiza nada", () => {
    render(<Harness />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("abierto es un diálogo modal con nombre y el foco dentro", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Abrir" }));
    const dialog = screen.getByRole("dialog", { name: "Diseñador" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveFocus();
  });

  it("bloquea el desplazamiento de la página y la deja inerte mientras está abierto", async () => {
    const user = userEvent.setup();
    const { container } = render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Abrir" }));
    expect(document.body.style.overflow).toBe("hidden");
    expect(container).toHaveAttribute("inert");
    await user.keyboard("{Escape}");
    expect(document.body.style.overflow).not.toBe("hidden");
    expect(container).not.toHaveAttribute("inert");
  });

  it("se cierra con Escape y devuelve el foco al botón que lo abrió", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const opener = screen.getByRole("button", { name: "Abrir" });
    await user.click(opener);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(opener).toHaveFocus();
  });

  it("se cierra con el botón de cerrar", async () => {
    const user = userEvent.setup();
    const spy = vi.fn();
    render(<Harness onCloseSpy={spy} />);
    await user.click(screen.getByRole("button", { name: "Abrir" }));
    await user.click(screen.getByRole("button", { name: "Cerrar" }));
    expect(spy).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("se cierra al hacer clic fuera del panel, pero no dentro", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Abrir" }));
    await user.click(screen.getByRole("heading", { name: "Diseñador" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.click(screen.getByRole("dialog").parentElement!);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("mantiene el foco dentro: Tab desde el último vuelve al primero y Shift+Tab al revés", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Abrir" }));
    const close = screen.getByRole("button", { name: "Cerrar" });
    const dos = screen.getByRole("button", { name: "Dos" });
    dos.focus();
    await user.tab();
    expect(close).toHaveFocus();
    await user.tab({ shift: true });
    expect(dos).toHaveFocus();
  });
});
