import { useLayoutEffect } from "react";
import { applyTheme, buildThemeVars } from "../lib/theme";

/** Aplica los colores de marca de la configuración como variables CSS en <html>. */
export function useBrandTheme(colors: { primary: string; accent: string }) {
  const { primary, accent } = colors;
  useLayoutEffect(() => {
    applyTheme(buildThemeVars({ primary, accent }));
  }, [primary, accent]);
}
