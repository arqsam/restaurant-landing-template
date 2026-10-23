import { Header } from "./components/Header/Header";
import { Hero } from "./components/Hero/Hero";
import { WhatsAppButton } from "./components/WhatsAppButton/WhatsAppButton";
import { site } from "./content/site";
import { useBrandTheme } from "./hooks/useBrandTheme";
import { buildHeroFacts } from "./lib/hero";
import { SECTION_IDS, buildNavLinks } from "./lib/nav";
import { buildWhatsAppUrl } from "./lib/whatsapp";

function App() {
  useBrandTheme(site.brand.colors);
  const links = buildNavLinks(site);
  const menuLink = links.find((link) => link.id === SECTION_IDS.menu);
  const whatsappUrl = buildWhatsAppUrl(
    site.orders.whatsapp,
    site.orders.defaultMessage,
  );

  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <Header brandName={site.brand.name} links={links} />

      <main id="contenido">
        <Hero
          tagline={site.brand.tagline}
          title={site.hero.title}
          subtitle={site.hero.subtitle}
          titleEmphasis={site.hero.titleEmphasis}
          image={site.hero.image}
          facts={buildHeroFacts(site.orders)}
          ctaLabel={site.hero.ctaLabel}
          ctaHref={whatsappUrl}
          secondaryLabel={`Ver ${(menuLink?.label ?? "menú").toLowerCase()}`}
          secondaryHref={`#${SECTION_IDS.menu}`}
        />

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

      <WhatsAppButton href={whatsappUrl} label="Escríbenos por WhatsApp" />
    </>
  );
}

export default App;
