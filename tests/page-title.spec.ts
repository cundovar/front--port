import { describe, expect, it } from "vitest";
import { DEFAULT_TITLE, pageTitle } from "../src/utils/pageTitle";

describe("pageTitle", () => {
  it("keeps the full local wording on the home page", () => {
    expect(pageTitle()).toBe(DEFAULT_TITLE);
    expect(pageTitle(undefined)).toBe(DEFAULT_TITLE);
    expect(pageTitle("   ")).toBe(DEFAULT_TITLE);
    expect(DEFAULT_TITLE).toContain("Paris 20e");
  });

  it("names the page before the site, the way a tab is scanned", () => {
    expect(pageTitle("Réalisations")).toBe("Réalisations | Facundo Varas");
    expect(pageTitle("Estimer votre projet web")).toBe("Estimer votre projet web | Facundo Varas");
  });

  it("stays inside what Google renders before truncating", () => {
    ["Réalisations", "Estimer votre projet web", "Comment ça marche ?", "Réalisation", "Demandes de devis"].forEach((name) =>
      expect(pageTitle(name).length, name).toBeLessThanOrEqual(60),
    );
    expect(DEFAULT_TITLE.length).toBeLessThanOrEqual(60);
  });
});
