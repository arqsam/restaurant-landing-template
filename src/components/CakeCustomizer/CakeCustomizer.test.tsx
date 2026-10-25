import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { site } from "../../content/site";
import type { Customizer } from "../../content/types";
import { useOrderBuilder } from "../../hooks/useOrderBuilder";
import { CakeCustomizer } from "./CakeCustomizer";

function Harness({
  buildHref,
  customizer = site.customizer,
}: {
  buildHref: (text: string) => string;
  customizer?: Customizer;
}) {
  const builder = useOrderBuilder(customizer, site.orders.depositPercent);
  return (
    <CakeCustomizer
      titleId="titulo"
      builder={builder}
      customizer={customizer}
      depositPercent={site.orders.depositPercent}
      notes={[site.orders.paymentNote]}
      buildHref={buildHref}
      ctaLabel="Pedir por WhatsApp"
    />
  );
}

function setup(
  buildHref = vi.fn((text: string) => `https://wa.me/1?text=${text.length}`),
) {
  const user = userEvent.setup();
  render(<Harness buildHref={buildHref} />);
  return { user, buildHref };
}

async function fillAll(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("radio", { name: /mediano/i }));
  await user.click(screen.getByRole("radio", { name: /red velvet/i }));
  await user.click(screen.getByRole("radio", { name: /dulce de leche/i }));
  await user.click(screen.getByRole("radio", { name: /floral/i }));
}

describe("CakeCustomizer", () => {
  it("muestra el título como h2 y un grupo de opciones por cada elección", () => {
    setup();
    expect(
      screen.getByRole("heading", { level: 2, name: site.customizer.title }),
    ).toBeInTheDocument();
    for (const name of ["Tamaño", "Sabor", "Relleno", "Decoración"]) {
      expect(screen.getByRole("group", { name })).toBeInTheDocument();
    }
  });

  it("ofrece fruta como elección opcional, con el límite indicado", () => {
    setup();
    const group = screen.getByRole("group", { name: /fruta/i });
    expect(group).toHaveTextContent(`hasta ${site.customizer.maxFruits}`);
    expect(within(group).getAllByRole("checkbox")).toHaveLength(
      site.customizer.fruits!.length,
    );
  });

  it("al elegir fruta suma su precio y la muestra en el resumen", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("radio", { name: /^mini \(/i }));
    await user.click(screen.getByRole("checkbox", { name: /fresas/i }));
    expect(screen.getByText("Total estimado").nextSibling).toHaveTextContent(
      "$530",
    );
    const summary = screen.getByRole("complementary", { name: /resumen/i });
    expect(within(summary).getByText("Fresas")).toBeInTheDocument();
  });

  it("al llegar al máximo desactiva las demás frutas y las reactiva al quitar una", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("checkbox", { name: /fresas/i }));
    await user.click(screen.getByRole("checkbox", { name: /frutos rojos/i }));
    expect(screen.getByRole("checkbox", { name: /arándanos/i })).toBeDisabled();
    await user.click(screen.getByRole("checkbox", { name: /fresas/i }));
    expect(screen.getByRole("checkbox", { name: /arándanos/i })).toBeEnabled();
  });

  it("muestra la foto de referencia de la decoración elegida", async () => {
    const { user } = setup();
    expect(
      screen.getByText(/elige una decoración para ver una referencia/i),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: /minimalista/i }));
    expect(screen.getByRole("img", { name: /acabado liso/i })).toHaveAttribute(
      "src",
      expect.stringContaining("/images/"),
    );
  });

  it("cada decoración de la muestra tiene su foto de referencia", async () => {
    const { user } = setup();
    for (const option of site.customizer.decorations) {
      await user.click(
        screen.getByRole("radio", { name: new RegExp(option.label, "i") }),
      );
      expect(
        screen.getByRole("img", { name: option.image!.alt }),
      ).toBeInTheDocument();
    }
  });

  it("si la decoración no tiene foto muestra la muestra de color de la paleta", async () => {
    const user = userEvent.setup();
    const withoutPhotos: Customizer = {
      ...site.customizer,
      decorations: site.customizer.decorations.map((d) => ({
        ...d,
        image: undefined,
      })),
    };
    render(
      <Harness
        buildHref={() => "https://wa.me/1"}
        customizer={withoutPhotos}
      />,
    );
    await user.click(screen.getByRole("radio", { name: /floral/i }));
    expect(
      screen.getByRole("img", { name: /muestra de color primavera/i }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: /lavanda/i }));
    expect(
      screen.getByRole("img", { name: /muestra de color lavanda/i }),
    ).toBeInTheDocument();
  });

  it("empieza sin elecciones y con el estimado en cero", () => {
    setup();
    expect(screen.getByText("Aún no has elegido nada.")).toBeInTheDocument();
    expect(screen.getByText("Total estimado").nextSibling).toHaveTextContent(
      "$0",
    );
  });

  it("al elegir actualiza el resumen y el estimado al instante", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("radio", { name: /^mini \(/i }));
    expect(screen.getByText("Total estimado").nextSibling).toHaveTextContent(
      "$480",
    );
    const summary = screen.getByRole("complementary", { name: /resumen/i });
    expect(within(summary).getByText("Mini (6 porciones)")).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: /red velvet/i }));
    expect(screen.getByText("Total estimado").nextSibling).toHaveTextContent(
      "$540",
    );
  });

  it("calcula anticipo y saldo con el porcentaje configurado", async () => {
    const { user } = setup();
    await fillAll(user);
    expect(screen.getByText("Total estimado").nextSibling).toHaveTextContent(
      "$1,010",
    );
    expect(
      screen.getByText(/anticipo \(50 %\)/i).nextSibling,
    ).toHaveTextContent("$505");
    expect(screen.getByText("Saldo").nextSibling).toHaveTextContent("$505");
  });

  it("al elegir una decoración aparece su paleta, con la primera ya elegida", async () => {
    const { user } = setup();
    expect(screen.queryByRole("group", { name: /paleta/i })).toBeNull();
    await user.click(screen.getByRole("radio", { name: /floral/i }));
    expect(screen.getByRole("group", { name: /paleta/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /primavera/i })).toBeChecked();
    await user.click(screen.getByRole("radio", { name: /lavanda/i }));
    expect(screen.getByRole("radio", { name: /lavanda/i })).toBeChecked();
  });

  it("sin completar no hay enlace: al intentar continuar avisa qué falta", async () => {
    const { user } = setup();
    expect(
      screen.queryByRole("link", { name: /pedir por whatsapp/i }),
    ).toBeNull();
    await user.click(
      screen.getByRole("button", { name: /pedir por whatsapp/i }),
    );
    const alerts = screen.getAllByRole("alert");
    expect(alerts.length).toBeGreaterThan(0);
    expect(screen.getByText(/completa:/i)).toHaveTextContent(
      /tamaño.*sabor.*relleno.*decoración/i,
    );
  });

  it("con todo elegido el botón es un enlace a WhatsApp con el resumen", async () => {
    const { user, buildHref } = setup();
    await fillAll(user);
    const link = screen.getByRole("link", { name: /pedir por whatsapp/i });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link.getAttribute("rel")).toContain("noopener");
    expect(buildHref).toHaveBeenCalled();
    const text = buildHref.mock.calls.at(-1)![0];
    expect(text).toContain("Tamaño: Mediano (12 porciones)");
    expect(text).toContain("Decoración: Floral (Primavera)");
    expect(text).toContain("Total estimado: $1,010");
  });

  it("la dedicatoria es opcional, se limita en longitud y muestra el contador", async () => {
    const { user } = setup();
    const input = screen.getByLabelText(/dedicatoria/i);
    expect(input).toHaveAttribute(
      "maxlength",
      String(site.customizer.dedication!.maxChars),
    );
    await user.type(input, "Feliz cumple");
    expect(screen.getByText(/12\/40 caracteres/)).toBeInTheDocument();
  });

  it("la dedicatoria aparece en el resumen", async () => {
    const { user } = setup();
    await user.type(screen.getByLabelText(/dedicatoria/i), "Para Ana");
    const summary = screen.getByRole("complementary", { name: /resumen/i });
    expect(within(summary).getByText('"Para Ana"')).toBeInTheDocument();
  });

  it("se puede elegir solo con el teclado", async () => {
    const { user } = setup();
    await user.tab();
    expect(screen.getByRole("radio", { name: /^mini \(/i })).toHaveFocus();
    await user.keyboard(" ");
    expect(screen.getByRole("radio", { name: /^mini \(/i })).toBeChecked();
  });

  it("muestra los avisos de precio estimado y forma de pago", () => {
    setup();
    expect(screen.getByText(/es un estimado/i)).toBeInTheDocument();
    expect(screen.getByText(site.orders.paymentNote)).toBeInTheDocument();
  });
});
