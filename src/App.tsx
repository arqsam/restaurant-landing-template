import { Catering } from "./components/Catering/Catering";
import { Featured } from "./components/Featured/Featured";
import { Header } from "./components/Header/Header";
import { Hero } from "./components/Hero/Hero";
import { Menu } from "./components/Menu/Menu";
import { SectionHeading } from "./components/SectionHeading/SectionHeading";
import { WhatsAppButton } from "./components/WhatsAppButton/WhatsAppButton";
import { site } from "./content/site";
import { useBrandTheme } from "./hooks/useBrandTheme";
import { buildPackageMessage } from "./lib/catering";
import { resolveFeatured } from "./lib/featured";
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

        {site.sections.featured ? (
          <Featured
            id={SECTION_IDS.featured}
            intro={site.featured}
            items={resolveFeatured(site.menu, site.featured.itemIds)}
          />
        ) : null}

        <section
          id={SECTION_IDS.menu}
          className="container section"
          aria-labelledby="menu-titulo"
        >
          <SectionHeading
            id="menu-titulo"
            eyebrow={site.menuIntro.eyebrow}
            title={site.menuIntro.title}
            titleEmphasis={site.menuIntro.titleEmphasis}
            subtitle={site.menuIntro.subtitle}
          />
          <Menu categories={site.menu} />
        </section>

        {/* Marcadores temporales para probar la navegación; cada uno se
            reemplaza por su sección real en los Issues siguientes. */}
        {site.sections.catering ? (
          <Catering
            id={SECTION_IDS.catering}
            intro={site.cateringIntro}
            packages={site.packages}
            beverages={site.beverages}
            quoteLabel="Cotizar"
            buildHref={(pkg) =>
              buildWhatsAppUrl(site.orders.whatsapp, buildPackageMessage(pkg))
            }
          />
        ) : null}

        {links
          .filter(
            (link) =>
              link.id !== SECTION_IDS.menu && link.id !== SECTION_IDS.catering,
          )
          .map((link) => (
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
