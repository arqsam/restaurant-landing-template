import { site } from "./content/site";
import { useBrandTheme } from "./hooks/useBrandTheme";

function App() {
  useBrandTheme(site.brand.colors);

  return (
    <main className="container">
      <h1>{site.brand.name}</h1>
      <p>{site.hero.subtitle}</p>
      {/* Marcador: el CTA real de WhatsApp llega en el Issue T06/T07 */}
      <button type="button" className="button">
        {site.hero.ctaLabel}
      </button>
    </main>
  );
}

export default App;
