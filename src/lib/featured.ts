import type { MenuCategory, MenuItem } from "../content/types";

/** Resuelve los ids de destacados a platillos del menú, en el orden indicado. Ignora ids que no existan. */
export function resolveFeatured(
  menu: MenuCategory[],
  itemIds: string[],
): MenuItem[] {
  const byId = new Map(
    menu.flatMap((category) => category.items).map((item) => [item.id, item]),
  );
  return itemIds.flatMap((id) => {
    const item = byId.get(id);
    return item ? [item] : [];
  });
}
