import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Contact } from "./Contact";

describe("Contact", () => {
  it("muestra el encabezado como h2 y el contenido de sus subsecciones", () => {
    render(
      <Contact
        id="contacto"
        intro={{ eyebrow: "Visítanos", title: "Te esperamos" }}
      >
        <p>Subsección</p>
      </Contact>,
    );
    expect(
      screen.getByRole("heading", { level: 2, name: "Te esperamos" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Subsección")).toBeInTheDocument();
  });

  it("es una región con nombre y con el id recibido (destino de la navegación)", () => {
    const { container } = render(
      <Contact id="contacto" intro={{ eyebrow: "x", title: "Te esperamos" }}>
        <p>a</p>
      </Contact>,
    );
    expect(container.querySelector("section#contacto")).toBeTruthy();
    expect(
      screen.getByRole("region", { name: "Te esperamos" }),
    ).toBeInTheDocument();
  });
});
