import { Catering } from "./components/Catering/Catering";
import { Featured } from "./components/Featured/Featured";
import { Gallery } from "./components/Gallery/Gallery";
import { Header } from "./components/Header/Header";
import { Hero } from "./components/Hero/Hero";
import { HowToOrder } from "./components/HowToOrder/HowToOrder";
import { Menu } from "./components/Menu/Menu";
import { SectionHeading } from "./components/SectionHeading/SectionHeading";
import { Testimonials } from "./components/Testimonials/Testimonials";
import { WhatsAppButton } from "./components/WhatsAppButton/WhatsAppButton";
import { site } from "./content/site";
import { useBrandTheme } from "./hooks/useBrandTheme";
import { buildPackageMessage } from "./lib/catering";
import { resolveFeatured } from "./lib/featured";
import { buildHeroFacts } from "./lib/hero";
import { buildItemOrderHref } from "./lib/itemOrder";
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
          <Menu
            categories={site.menu}
            itemOrder={site.orders.itemOrder}
            buildHref={(availability, item) =>
              buildItemOrderHref(site.orders, availability, item)
            }
          />
        </section>

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

        <HowToOrder
          id={SECTION_IDS.howToOrder}
          intro={site.howToOrder}
          steps={site.howToOrder.steps}
          facts={buildHeroFacts(site.orders)}
        />

        {site.sections.gallery ? (
          <Gallery
            id={SECTION_IDS.gallery}
            intro={site.gallery}
            images={site.gallery.images}
          />
        ) : null}

        {site.sections.testimonials ? (
          <Testimonials
            id={SECTION_IDS.testimonials}
            intro={site.testimonials}
            items={site.testimonials.items}
          />
        ) : null}

        {/* Marcador temporal: se reemplaza por la sección real de Contacto
            en los Issues siguientes. */}
        <section
          id={SECTION_IDS.contact}
          className="container"
          style={{ minHeight: "70vh" }}
        >
          <h2>Contacto</h2>
        </section>
      </main>

      <WhatsAppButton href={whatsappUrl} label="Escríbenos por WhatsApp" />
    </>
  );
}

export default App;
