import styles from "./WhatsAppButton.module.css";

interface WhatsAppButtonProps {
  href: string;
  /** Nombre accesible del botón (no hay texto visible). */
  label: string;
}

/** Botón flotante redondo que abre el chat de WhatsApp del negocio. */
export function WhatsAppButton({ href, label }: WhatsAppButtonProps) {
  return (
    <a
      className={styles.fab}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="visually-hidden">
        {label} (se abre en una pestaña nueva)
      </span>
      {/* Globo de conversación genérico (no es el logotipo de WhatsApp) */}
      <svg
        aria-hidden="true"
        focusable="false"
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 11.5a8.4 8.4 0 0 1-12.3 7.4L3 20.5l1.7-5.3A8.4 8.4 0 1 1 21 11.5Z" />
        <path d="M8.5 10h7M8.5 13.5h4.5" />
      </svg>
    </a>
  );
}
