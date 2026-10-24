import { act, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { site } from "../../content/site";
import { HoursAndLocation } from "./HoursAndLocation";

function setup() {
  return render(
    <HoursAndLocation
      id="horarios"
      hours={site.hours}
      address={site.contact.address}
      mapsUrl={site.contact.mapsUrl}
    />,
  );
}

describe("HoursAndLocation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("dentro del horario muestra 'Abierto ahora' y la hora de cierre", () => {
    vi.setSystemTime(new Date("2026-10-20T16:00:00Z")); // martes 10:00
    setup();
    expect(
      screen.getByText("Abierto ahora · cierra a las 19:00"),
    ).toBeInTheDocument();
  });

  it("fuera del horario muestra cuándo abre", () => {
    vi.setSystemTime(new Date("2026-10-19T18:00:00Z")); // lunes 12:00 (cerrado)
    setup();
    expect(
      screen.getByText("Cerrado · abre mañana a las 09:00"),
    ).toBeInTheDocument();
  });

  it("lista los horarios agrupados y marca el día de hoy para lectores de pantalla", () => {
    vi.setSystemTime(new Date("2026-10-20T16:00:00Z")); // martes
    setup();
    expect(screen.getByText("Martes a jueves")).toBeInTheDocument();
    expect(screen.getByText("Cerrado")).toBeInTheDocument();
    const todayRow = screen.getByText(/martes a jueves/i).closest("div")!;
    expect(within(todayRow).getByText(/\(hoy\)/)).toBeInTheDocument();
    expect(screen.getAllByText(/\(hoy\)/)).toHaveLength(1);
  });

  it("muestra la dirección y un enlace al mapa en pestaña nueva", () => {
    vi.setSystemTime(new Date("2026-10-20T16:00:00Z"));
    setup();
    expect(screen.getByText(site.contact.address)).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /cómo llegar/i });
    expect(link).toHaveAttribute("href", site.contact.mapsUrl);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link.getAttribute("rel")).toContain("noopener");
  });

  it("el estado se actualiza solo al pasar el tiempo", () => {
    vi.setSystemTime(new Date("2026-10-20T00:59:00Z")); // lunes 18:59 (cerrado)
    setup();
    expect(
      screen.getByText("Cerrado · abre mañana a las 09:00"),
    ).toBeInTheDocument();

    vi.setSystemTime(new Date("2026-10-20T15:00:00Z")); // martes 09:00
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(screen.getByText(/abierto ahora/i)).toBeInTheDocument();
  });
});
