import { describe, expect, it } from "vitest";
import type { Hours } from "../content/types";
import { site } from "../content/site";
import {
  formatOpenStatus,
  getOpenStatus,
  getZonedNow,
  groupSchedule,
  toMinutes,
} from "./hours";

// Ciudad de México es UTC-6 todo el año (sin horario de verano desde 2022).
// 2026-10-19 es lunes (cerrado); 2026-10-20 es martes (09:00 – 19:00).
const hours = site.hours;
const at = (isoUtc: string) => new Date(isoUtc);

describe("toMinutes", () => {
  it("convierte HH:mm a minutos", () => {
    expect(toMinutes("00:00")).toBe(0);
    expect(toMinutes("09:30")).toBe(570);
    expect(toMinutes("19:00")).toBe(1140);
  });
});

describe("getZonedNow", () => {
  it("usa la zona horaria del negocio, no la del equipo", () => {
    // 03:00 UTC del martes sigue siendo lunes 21:00 en la Ciudad de México
    expect(
      getZonedNow(at("2026-10-20T03:00:00Z"), "America/Mexico_City"),
    ).toEqual({
      weekday: "mon",
      minutes: 21 * 60,
    });
  });

  it("interpreta medianoche como 00:00 y no como 24:00", () => {
    expect(
      getZonedNow(at("2026-10-20T06:00:00Z"), "America/Mexico_City"),
    ).toEqual({
      weekday: "tue",
      minutes: 0,
    });
  });
});

describe("getOpenStatus", () => {
  it("está abierto dentro del horario y muestra la hora de cierre", () => {
    expect(getOpenStatus(hours, at("2026-10-20T16:00:00Z"))).toEqual({
      open: true,
      closesAt: "19:00",
    });
  });

  it("abre justo a la hora de apertura", () => {
    expect(getOpenStatus(hours, at("2026-10-20T15:00:00Z")).open).toBe(true);
  });

  it("a la hora exacta de cierre ya está cerrado", () => {
    expect(getOpenStatus(hours, at("2026-10-21T01:00:00Z")).open).toBe(false);
  });

  it("antes de abrir indica que abre hoy", () => {
    expect(getOpenStatus(hours, at("2026-10-20T14:00:00Z"))).toEqual({
      open: false,
      next: { weekday: "tue", time: "09:00", daysAhead: 0 },
    });
  });

  it("en un día cerrado indica la próxima apertura", () => {
    expect(getOpenStatus(hours, at("2026-10-19T18:00:00Z"))).toEqual({
      open: false,
      next: { weekday: "tue", time: "09:00", daysAhead: 1 },
    });
  });

  it("después de cerrar el domingo salta el lunes cerrado", () => {
    expect(getOpenStatus(hours, at("2026-10-25T22:00:00Z"))).toEqual({
      open: false,
      next: { weekday: "tue", time: "09:00", daysAhead: 2 },
    });
  });

  it("si todos los días están cerrados no hay próxima apertura", () => {
    const closed: Hours = {
      timeZone: "America/Mexico_City",
      schedule: {
        mon: null,
        tue: null,
        wed: null,
        thu: null,
        fri: null,
        sat: null,
        sun: null,
      },
    };
    expect(getOpenStatus(closed, at("2026-10-20T16:00:00Z"))).toEqual({
      open: false,
    });
  });
});

describe("formatOpenStatus", () => {
  it("describe cada situación en español", () => {
    expect(formatOpenStatus({ open: true, closesAt: "19:00" })).toBe(
      "Abierto ahora · cierra a las 19:00",
    );
    expect(
      formatOpenStatus({
        open: false,
        next: { weekday: "tue", time: "09:00", daysAhead: 0 },
      }),
    ).toBe("Cerrado · abre hoy a las 09:00");
    expect(
      formatOpenStatus({
        open: false,
        next: { weekday: "tue", time: "09:00", daysAhead: 1 },
      }),
    ).toBe("Cerrado · abre mañana a las 09:00");
    expect(
      formatOpenStatus({
        open: false,
        next: { weekday: "tue", time: "09:00", daysAhead: 2 },
      }),
    ).toBe("Cerrado · abre el martes a las 09:00");
    expect(formatOpenStatus({ open: false })).toBe("Cerrado");
  });
});

describe("groupSchedule", () => {
  it("agrupa días consecutivos con el mismo horario", () => {
    expect(groupSchedule(hours).map((row) => [row.label, row.hours])).toEqual([
      ["Lunes", "Cerrado"],
      ["Martes a jueves", "09:00 – 19:00"],
      ["Viernes", "09:00 – 20:00"],
      ["Sábado", "10:00 – 20:00"],
      ["Domingo", "10:00 – 15:00"],
    ]);
  });

  it("cubre los siete días exactamente una vez", () => {
    const days = groupSchedule(hours).flatMap((row) => row.days);
    expect(days).toEqual(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]);
  });

  it("una semana con el mismo horario cada día queda en una sola fila", () => {
    const day = { open: "08:00", close: "18:00" };
    const rows = groupSchedule({
      timeZone: "America/Mexico_City",
      schedule: {
        mon: day,
        tue: day,
        wed: day,
        thu: day,
        fri: day,
        sat: day,
        sun: day,
      },
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]!.label).toBe("Lunes a domingo");
  });
});
