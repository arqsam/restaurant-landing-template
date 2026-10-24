import type { Hours } from "../../content/types";
import { useNow } from "../../hooks/useNow";
import {
  formatOpenStatus,
  getOpenStatus,
  getZonedNow,
  groupSchedule,
} from "../../lib/hours";
import styles from "./HoursAndLocation.module.css";

interface HoursAndLocationProps {
  id: string;
  hours: Hours;
  address: string;
  mapsUrl: string;
}

/** Horarios con estado "abierto ahora", dirección y enlace al mapa. */
export function HoursAndLocation({
  id,
  hours,
  address,
  mapsUrl,
}: HoursAndLocationProps) {
  const now = useNow();
  const status = getOpenStatus(hours, now);
  const today = getZonedNow(now, hours.timeZone).weekday;
  const rows = groupSchedule(hours);
  const titleId = `${id}-titulo`;

  return (
    <section id={id} className={styles.wrapper} aria-labelledby={titleId}>
      <div className={styles.card}>
        <h3 id={titleId} className={styles.title}>
          Horarios
        </h3>
        <p className={styles.status} data-open={status.open}>
          <span className={styles.dot} aria-hidden="true" />
          {formatOpenStatus(status)}
        </p>
        <dl className={styles.schedule}>
          {rows.map((row) => {
            const isToday = row.days.includes(today);
            return (
              <div
                key={row.label}
                className={styles.row}
                data-today={isToday || undefined}
              >
                <dt>
                  {row.label}
                  {isToday ? (
                    <span className="visually-hidden"> (hoy)</span>
                  ) : null}
                </dt>
                <dd>{row.hours}</dd>
              </div>
            );
          })}
        </dl>
      </div>

      <div className={styles.card}>
        <h3 className={styles.title}>Ubicación</h3>
        <address className={styles.address}>{address}</address>
        <a
          className={styles.link}
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Cómo llegar
          <span className="visually-hidden">
            {" "}
            (se abre en una pestaña nueva)
          </span>
        </a>
      </div>
    </section>
  );
}
