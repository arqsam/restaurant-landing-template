import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("muestra el título de la plantilla", () => {
    render(<App />);
    expect(
      screen.getByRole("heading", { level: 1, name: /mallow & crumb/i }),
    ).toBeInTheDocument();
  });
});
