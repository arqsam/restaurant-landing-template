import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";
import { site } from "./content/site";

describe("App", () => {
  it("muestra el nombre de la marca como título principal", () => {
    render(<App />);
    expect(
      screen.getByRole("heading", { level: 1, name: /mallow & crumb/i }),
    ).toBeInTheDocument();
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
});
