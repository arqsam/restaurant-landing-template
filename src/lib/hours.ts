import type { DaySchedule, Hours, Weekday } from "../content/types";

/** Semana empezando en lunes. */
export const WEEKDAYS: Weekday[] = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
];

export const WEEKDAY_NAMES: Record<Weekday, string> = {
  mon: "Lunes",
  tue: "Martes",
  wed: "Miércoles",
  thu: "Jueves",
  fri: "Viernes",
  sat: "Sábado",
  sun: "Domingo",
};

const SHORT_TO_WEEKDAY: Record<string, Weekday> = {
  Mon: "mon",
  Tue: "tue",
  Wed: "wed",
  Thu: "thu",
  Fri: "fri",
  Sat: "sat",
  Sun: "sun",
};

/** "09:30" → 570 (minutos desde la medianoche). */
export function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

/** Día de la semana y minutos transcurridos del día en la zona horaria dada. */
export function getZonedNow(
  date: Date,
  timeZone: string,
): { weekday: Weekday; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const weekday = SHORT_TO_WEEKDAY[get("weekday")];
  if (!weekday)
    throw new Error(`Día de la semana no reconocido: ${get("weekday")}`);
  return { weekday, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

export interface NextOpening {
  weekday: Weekday;
  time: string;
  /** 0 = hoy, 1 = mañana, 2..6 = en los días siguientes. */
  daysAhead: number;
}

export interface OpenStatus {
  open: boolean;
  /** Hora de cierre de hoy (solo si está abierto). */
  closesAt?: string;
  /** Próxima apertura (solo si está cerrado y hay algún día abierto). */
  next?: NextOpening;
}

/**
 * Indica si el negocio está abierto en el momento dado. Cada día abre y cierra
 * dentro del mismo día (no se admiten horarios que pasan de medianoche); la
 * hora de cierre ya no cuenta como abierto.
 */
export function getOpenStatus(
  hours: Hours,
  now: Date = new Date(),
): OpenStatus {
  const { weekday, minutes } = getZonedNow(now, hours.timeZone);
  const today = hours.schedule[weekday];

  if (
    today &&
    minutes >= toMinutes(today.open) &&
    minutes < toMinutes(today.close)
  ) {
    return { open: true, closesAt: today.close };
  }

  if (today && minutes < toMinutes(today.open)) {
    return { open: false, next: { weekday, time: today.open, daysAhead: 0 } };
  }

  const start = WEEKDAYS.indexOf(weekday);
  for (let ahead = 1; ahead <= 7; ahead += 1) {
    const day = WEEKDAYS[(start + ahead) % 7]!;
    const schedule = hours.schedule[day];
    if (schedule) {
      return {
        open: false,
        next: { weekday: day, time: schedule.open, daysAhead: ahead },
      };
    }
  }
  return { open: false };
}

/** Texto del estado: "Abierto ahora · cierra a las 19:00", "Cerrado · abre mañana a las 09:00". */
export function formatOpenStatus(status: OpenStatus): string {
  if (status.open) return `Abierto ahora · cierra a las ${status.closesAt}`;
  const { next } = status;
  if (!next) return "Cerrado";
  if (next.daysAhead === 0) return `Cerrado · abre hoy a las ${next.time}`;
  if (next.daysAhead === 1) return `Cerrado · abre mañana a las ${next.time}`;
  return `Cerrado · abre el ${WEEKDAY_NAMES[next.weekday].toLowerCase()} a las ${next.time}`;
}

export interface ScheduleRow {
  /** "Lunes", "Martes a jueves". */
  label: string;
  /** "09:00 – 19:00" o "Cerrado". */
  hours: string;
  days: Weekday[];
}

function sameDay(a: DaySchedule | null, b: DaySchedule | null): boolean {
  if (!a || !b) return a === b;
  return a.open === b.open && a.close === b.close;
}

/** Agrupa días consecutivos con el mismo horario para mostrarlos en pocas filas. */
export function groupSchedule(hours: Hours): ScheduleRow[] {
  const rows: ScheduleRow[] = [];
  let group: Weekday[] = [];

  const flush = () => {
    if (group.length === 0) return;
    const first = group[0]!;
    const last = group[group.length - 1]!;
    const day = hours.schedule[first];
    rows.push({
      days: group,
      label:
        group.length === 1
          ? WEEKDAY_NAMES[first]
          : `${WEEKDAY_NAMES[first]} a ${WEEKDAY_NAMES[last].toLowerCase()}`,
      hours: day ? `${day.open} – ${day.close}` : "Cerrado",
    });
    group = [];
  };

  for (const weekday of WEEKDAYS) {
    const previous = group[group.length - 1];
    if (
      previous &&
      !sameDay(hours.schedule[previous], hours.schedule[weekday])
    ) {
      flush();
    }
    group.push(weekday);
  }
  flush();
  return rows;
}
