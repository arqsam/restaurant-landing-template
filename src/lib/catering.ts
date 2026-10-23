import type { CateringPackage } from "../content/types";
import { formatMXN } from "./money";

export interface PackagePriceInfo {
  /** "$95 por persona", o null si el paquete se cotiza sin precio fijo. */
  price: string | null;
  /** "Mínimo 20 personas", o null si no hay mínimo. */
  minimum: string | null;
}

export function describePackagePrice(pkg: CateringPackage): PackagePriceInfo {
  return {
    price:
      pkg.pricePerPerson !== undefined
        ? `${formatMXN(pkg.pricePerPerson)} por persona`
        : null,
    minimum:
      pkg.minPeople !== undefined ? `Mínimo ${pkg.minPeople} personas` : null,
  };
}

/** Mensaje de WhatsApp para cotizar un paquete. */
export function buildPackageMessage(pkg: CateringPackage): string {
  return `Hola, me gustaría cotizar el paquete "${pkg.name}" para un evento.`;
}
