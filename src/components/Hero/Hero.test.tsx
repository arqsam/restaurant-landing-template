import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Hero } from "./Hero";

const image = {
  src: "/images/hero-1080.webp",
  srcSet: "/images/hero-720.webp 720w, /images/hero-1080.webp 1080w",
  sizes: "(min-width: 48em) 50vw, 100vw",
  width: 1080,
  height: 1493,
  alt: "Tarta de frutos rojos",
};

const props = {
  tagline: "Postres hechos bajo pedido",
  title: "Postres que se quedan en la memoria",
  titleEmphasis: "se quedan",
  subtitle: "Pasteles personalizados y postres artesanales.",
  image,
  ctaLabel: "Pedir por WhatsApp",
  ctaHref: "https://wa.me/525500000000?text=Hola",
  secondaryLabel: "Ver pastelería",
  secondaryHref: "#menu",
  facts: ["Pedidos con 2 días de anticipación", "Anticipo del 50 %"],
};

describe("Hero", () => {
  it("muestra el título completo como único h1 y resalta el fragmento", () => {
    render(<Hero {...props} />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Postres que se quedan en la memoria");
    const emphasis = heading.querySelector("em");
    expect(emphasis).toHaveTextContent("se quedan");
  });

  it("sin énfasis muestra el título sin cursiva", () => {
    render(<Hero {...props} titleEmphasis={undefined} />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.querySelector("em")).toBeNull();
    expect(heading).toHaveTextContent(props.title);
  });

  it("muestra eslogan y subtítulo", () => {
    render(<Hero {...props} />);
    expect(screen.getByText(props.tagline)).toBeInTheDocument();
    expect(screen.getByText(props.subtitle)).toBeInTheDocument();
  });

  it("el CTA principal abre WhatsApp en una pestaña nueva de forma segura", () => {
    render(<Hero {...props} />);
    const cta = screen.getByRole("link", { name: /pedir por whatsapp/i });
    expect(cta).toHaveAttribute("href", props.ctaHref);
    expect(cta).toHaveAttribute("target", "_blank");
    expect(cta.getAttribute("rel")).toContain("noopener");
  });

  it("el enlace secundario lleva a la sección del menú", () => {
    render(<Hero {...props} />);
    expect(
      screen.getByRole("link", { name: /ver pastelería/i }),
    ).toHaveAttribute("href", "#menu");
  });

  it("la imagen tiene alt, dimensiones y variantes responsivas", () => {
    render(<Hero {...props} />);
    const img = screen.getByRole("img", { name: image.alt });
    expect(img).toHaveAttribute("src", image.src);
    expect(img).toHaveAttribute("srcset", image.srcSet);
    expect(img).toHaveAttribute("sizes", image.sizes);
    expect(img).toHaveAttribute("width", "1080");
    expect(img).toHaveAttribute("height", "1493");
  });

  it("lista los datos del proceso de pedido", () => {
    render(<Hero {...props} />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("2 días de anticipación");
  });

  it("es la sección de inicio (ancla #inicio)", () => {
    const { container } = render(<Hero {...props} />);
    expect(container.querySelector("section#inicio")).toBeTruthy();
  });
});
