import { Header } from "./components/Header/Header";
import { site } from "./content/site";
import { useBrandTheme } from "./hooks/useBrandTheme";
import { SECTION_IDS, buildNavLinks } from "./lib/nav";

function App() {
  useBrandTheme(site.brand.colors);
  const links = buildNavLinks(site);

  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <Header brandName={site.brand.name} links={links} />

      <main id="contenido">
        <section id={SECTION_IDS.hero} className="container">
          <h1>{site.brand.name}</h1>
          <p>{site.hero.subtitle}</p>
          {/* Marcador: el CTA real de WhatsApp llega en los Issues T06/T07 */}
          <button type="button" className="button">
            {site.hero.ctaLabel}
          </button>
        </section>

        {/* Marcadores temporales para probar la navegación; cada uno se
            reemplaza por su sección real en los Issues siguientes. */}
        {links.map((link) => (
          <section
            key={link.id}
            id={link.id}
            className="container"
            style={{ minHeight: "70vh" }}
          >
            <h2>{link.label}</h2>
          </section>
        ))}
      </main>
    </>
  );
}

export default App;
