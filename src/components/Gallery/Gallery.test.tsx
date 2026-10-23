import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { site } from "../../content/site";
import { Gallery } from "./Gallery";

const intro = { eyebrow: "Galería", title: "Un vistazo" };

describe("Gallery", () => {
  it("muestra el encabezado y una imagen por cada foto con su texto alternativo", () => {
    render(<Gallery id="galeria" intro={intro} images={site.gallery.images} />);
    expect(
      screen.getByRole("heading", { level: 2, name: "Un vistazo" }),
    ).toBeInTheDocument();
    const photos = screen.getAllByRole("img");
    expect(photos).toHaveLength(site.gallery.images.length);
    for (const [index, photo] of photos.entries()) {
      expect(photo).toHaveAttribute("alt", site.gallery.images[index]!.alt);
    }
  });

  it("reserva espacio y carga las fotos en diferido", () => {
    render(<Gallery id="galeria" intro={intro} images={site.gallery.images} />);
    for (const photo of screen.getAllByRole("img")) {
      expect(photo).toHaveAttribute("width");
      expect(photo).toHaveAttribute("height");
      expect(photo).toHaveAttribute("loading", "lazy");
    }
  });

  it("no renderiza nada si no hay fotos", () => {
    const { container } = render(
      <Gallery id="galeria" intro={intro} images={[]} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
