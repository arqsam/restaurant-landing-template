import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { site } from "../../content/site";
import type { SubmitResult } from "../../lib/contactForm";
import { ContactForm } from "./ContactForm";

const NOW = new Date("2026-10-26T18:00:00Z"); // 12:00 en Ciudad de México

function setup(
  submit: () => Promise<SubmitResult> = () => Promise.resolve({ ok: true }),
) {
  const user = userEvent.setup();
  const spy = vi.fn(submit);
  const { container } = render(
    <ContactForm
      id="cotizar"
      copy={site.contactForm}
      minLeadDays={2}
      timeZone="America/Mexico_City"
      submit={spy}
      whatsappPhone={site.orders.whatsapp}
      now={() => NOW}
    />,
  );
  return { user, spy, container };
}

type User = ReturnType<typeof userEvent.setup>;

async function fillValid(user: User, type: RegExp = /pastel por encargo/i) {
  await user.type(screen.getByLabelText(/^nombre/i), "Ana Pérez");
  await user.type(screen.getByLabelText(/tu whatsapp/i), "55 1234 5678");
  await user.click(screen.getByRole("radio", { name: type }));
  fireEvent.change(screen.getByLabelText(/fecha del evento/i), {
    target: { value: "2026-11-05" },
  });
  await user.click(screen.getByRole("radio", { name: /recoger/i }));
}

const submitButton = () =>
  screen.getByRole("button", { name: site.contactForm.submitLabel });

describe("ContactForm", () => {
  it("muestra el título como h3 y todos los campos con su etiqueta", () => {
    setup();
    expect(
      screen.getByRole("heading", { level: 3, name: site.contactForm.title }),
    ).toBeInTheDocument();
    for (const name of [
      /^nombre/i,
      /tu whatsapp/i,
      /correo/i,
      /fecha del evento/i,
      /personas/i,
      /cuéntanos más/i,
    ]) {
      expect(screen.getByLabelText(name)).toBeInTheDocument();
    }
    expect(
      screen.getByRole("group", { name: /qué necesitas/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: /cómo lo recibes/i }),
    ).toBeInTheDocument();
  });

  it("la fecha mínima respeta la anticipación configurada", () => {
    setup();
    expect(screen.getByLabelText(/fecha del evento/i)).toHaveAttribute(
      "min",
      "2026-10-28",
    );
  });

  it("el honeypot está oculto para lectores de pantalla y fuera del orden de tabulación", () => {
    const { container } = setup();
    const trap = container.querySelector('input[name="website"]')!;
    expect(trap.closest("[aria-hidden='true']")).not.toBeNull();
    expect(trap).toHaveAttribute("tabindex", "-1");
  });

  it("al enviar vacío no envía, muestra errores asociados a cada campo y enfoca el primero", async () => {
    const { user, spy } = setup();
    await user.click(submitButton());
    expect(spy).not.toHaveBeenCalled();
    const name = screen.getByLabelText(/^nombre/i);
    expect(name).toHaveAttribute("aria-invalid", "true");
    expect(name).toHaveAccessibleDescription(/nombre/i);
    expect(name).toHaveFocus();
    expect(screen.getByLabelText(/tu whatsapp/i)).toHaveAccessibleDescription(
      /10 dígitos/i,
    );
  });

  it("corrige los errores al escribir", async () => {
    const { user } = setup();
    await user.click(submitButton());
    await user.type(screen.getByLabelText(/^nombre/i), "Ana");
    expect(screen.getByLabelText(/^nombre/i)).not.toHaveAttribute(
      "aria-invalid",
    );
  });

  it("catering vuelve obligatorias las personas", async () => {
    const { user, spy } = setup();
    await fillValid(user, /catering/i);
    expect(screen.getByLabelText(/^personas$/i)).toBeInTheDocument();
    await user.click(submitButton());
    expect(spy).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/^personas$/i)).toHaveFocus();
  });

  it("con datos válidos envía, muestra el éxito y ofrece continuar por WhatsApp con el resumen", async () => {
    const { user, spy } = setup();
    await fillValid(user);
    await user.click(submitButton());
    expect(spy).toHaveBeenCalledTimes(1);

    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent(site.contactForm.successTitle);
    expect(status).toHaveFocus();
    expect(screen.queryByLabelText(/^nombre/i)).toBeNull();

    const link = screen.getByRole("link", {
      name: new RegExp(site.contactForm.whatsappLabel, "i"),
    });
    const url = new URL(link.getAttribute("href")!);
    expect(url.hostname).toBe("wa.me");
    expect(url.searchParams.get("text")).toContain("Tipo: Pastel por encargo");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link.getAttribute("rel")).toContain("noopener");
  });

  it("si el envío falla muestra el error, conserva los datos y ofrece WhatsApp", async () => {
    const { user } = setup(() =>
      Promise.resolve({ ok: false, error: "No se pudo registrar." }),
    );
    await fillValid(user);
    await user.click(submitButton());

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(site.contactForm.errorTitle);
    expect(alert).toHaveTextContent("No se pudo registrar.");
    expect(alert).toHaveFocus();
    expect(screen.getByLabelText(/^nombre/i)).toHaveValue("Ana Pérez");
    expect(
      screen.getByRole("link", {
        name: new RegExp(site.contactForm.whatsappLabel, "i"),
      }),
    ).toBeInTheDocument();
  });

  it("mientras envía, el botón se desactiva y cambia su texto", async () => {
    let finish: (result: SubmitResult) => void = () => {};
    const { user } = setup(
      () => new Promise<SubmitResult>((resolve) => (finish = resolve)),
    );
    await fillValid(user);
    await user.click(submitButton());
    const sending = screen.getByRole("button", {
      name: site.contactForm.sendingLabel,
    });
    expect(sending).toBeDisabled();
    finish({ ok: true });
    expect(await screen.findByRole("status")).toBeInTheDocument();
  });

  it("si el honeypot trae contenido simula éxito sin enviar", async () => {
    const { user, spy, container } = setup();
    await fillValid(user);
    fireEvent.change(container.querySelector('input[name="website"]')!, {
      target: { value: "https://spam.example" },
    });
    await user.click(submitButton());
    expect(await screen.findByRole("status")).toBeInTheDocument();
    expect(spy).not.toHaveBeenCalled();
  });

  it("después del éxito se puede enviar otra solicitud con el formulario vacío", async () => {
    const { user } = setup();
    await fillValid(user);
    await user.click(submitButton());
    await user.click(
      await screen.findByRole("button", { name: site.contactForm.resetLabel }),
    );
    expect(screen.getByLabelText(/^nombre/i)).toHaveValue("");
  });
});
