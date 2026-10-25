import { useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "./Dialog.module.css";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  /** Id del encabezado que nombra al diálogo. */
  titleId: string;
  closeLabel: string;
  children: ReactNode;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Diálogo modal accesible: bloquea el desplazamiento de la página, deja el resto
 * del documento inerte, mantiene el foco dentro, se cierra con Escape o al hacer
 * clic fuera, y devuelve el foco al elemento que lo abrió. En móvil ocupa toda
 * la pantalla.
 */
export function Dialog({
  open,
  onClose,
  titleId,
  closeLabel,
  children,
}: DialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const opener = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // El resto de la página queda inerte mientras el diálogo está abierto.
    const made: Element[] = [];
    for (const element of Array.from(document.body.children)) {
      if (element !== overlayRef.current && !element.hasAttribute("inert")) {
        element.setAttribute("inert", "");
        made.push(element);
      }
    }

    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      for (const element of made) element.removeAttribute("inert");
      opener?.focus();
    };
  }, [open]);

  if (!open) return null;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== "Tab") return;

    const focusable = Array.from(
      panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [],
    );
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }
    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;
    const active = document.activeElement;
    if (event.shiftKey && (active === first || active === panelRef.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return createPortal(
    <div
      ref={overlayRef}
      className={styles.overlay}
      onKeyDown={handleKeyDown}
      onMouseDown={(event) => {
        if (event.target === overlayRef.current) onClose();
      }}
    >
      <div
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label={closeLabel}
        >
          <span aria-hidden="true">×</span>
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}
