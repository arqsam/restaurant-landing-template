import { useEffect, useId, useRef, useState } from "react";
import type { NavLink } from "../../lib/nav";
import styles from "./Header.module.css";

interface HeaderProps {
  brandName: string;
  links: NavLink[];
}

export function Header({ brandName, links }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Escape cierra el menú móvil y devuelve el foco al botón
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.bar}`}>
        <a className={styles.brand} href="#inicio">
          {brandName}
        </a>

        <button
          ref={toggleRef}
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="visually-hidden">
            {open ? "Cerrar menú" : "Abrir menú"}
          </span>
          <svg
            aria-hidden="true"
            focusable="false"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>

        <nav
          id={menuId}
          className={styles.nav}
          aria-label="Principal"
          data-open={open}
        >
          <ul className={styles.list}>
            {links.map((link) => (
              <li key={link.id}>
                <a
                  className={styles.link}
                  href={`#${link.id}`}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
