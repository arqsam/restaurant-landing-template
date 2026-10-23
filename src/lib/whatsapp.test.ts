import { describe, expect, it } from "vitest";
import { buildWhatsAppUrl } from "./whatsapp";

describe("buildWhatsAppUrl", () => {
  it("usa wa.me con el número y el mensaje codificado", () => {
    expect(buildWhatsAppUrl("525512345678", "Hola, quiero un pastel")).toBe(
      "https://wa.me/525512345678?text=Hola%2C%20quiero%20un%20pastel",
    );
  });

  it("quita símbolos y espacios del número", () => {
    expect(buildWhatsAppUrl("+52 (55) 1234-5678")).toBe(
      "https://wa.me/525512345678",
    );
  });

  it("antepone 52 a un número de 10 dígitos", () => {
    expect(buildWhatsAppUrl("5512345678")).toBe("https://wa.me/525512345678");
  });

  it("codifica acentos y saltos de línea", () => {
    const url = buildWhatsAppUrl("525512345678", "Pastel de limón\nPara 12");
    expect(url).toContain("lim%C3%B3n");
    expect(url).toContain("%0A");
    expect(url).not.toContain("\n");
  });

  it("omite el parámetro text cuando el mensaje está vacío", () => {
    expect(buildWhatsAppUrl("525512345678", "   ")).toBe(
      "https://wa.me/525512345678",
    );
  });

  it("lanza un error si el número es demasiado corto", () => {
    expect(() => buildWhatsAppUrl("12345")).toThrow(/inválido/);
  });
});
