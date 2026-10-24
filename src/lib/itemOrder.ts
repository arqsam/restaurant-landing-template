import type { Availability, MenuItem, SiteConfig } from "../content/types";
import { buildWhatsAppUrl } from "./whatsapp";

type Orders = Pick<SiteConfig["orders"], "whatsapp" | "itemOrder">;

/** Reemplaza {item} por el nombre del platillo. */
export function buildItemMessage(template: string, itemName: string): string {
  return template.split("{item}").join(itemName);
}

/** Enlace de WhatsApp para pedir un platillo, según si es de vitrina o por encargo. */
export function buildItemOrderHref(
  orders: Orders,
  availability: Availability,
  item: Pick<MenuItem, "name">,
): string {
  const message = buildItemMessage(orders.itemOrder[availability].message, item.name);
  return buildWhatsAppUrl(orders.whatsapp, message);
}
