import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import pageSeo from "../src/data/pageSeo.json";
import { pageTitle } from "../src/utils/pageTitle";
import { offerEntryAmount, priceableOffers, variantsByPrice } from "../src/utils/pricingPage";
import type { QuoteOffer } from "../src/types";

const sitemap = readFileSync(resolve(__dirname, "../public/sitemap.xml"), "utf8");

describe("pageSeo", () => {
  it("names each route once, on a single path segment", () => {
    // Apache splits /realisations/<slug> into the filename dist/realisations
    // plus PATH_INFO, so a two-segment prerendered route would make the rewrite
    // in public/.htaccess capture every child URL and 404 it.
    const paths = pageSeo.pages.map((page) => page.path);

    expect(new Set(paths).size).toBe(paths.length);
    paths.forEach((path) => expect(path).toMatch(/^\/[a-z0-9-]+$/));
  });

  it("keeps every prerendered title inside what Google renders", () => {
    pageSeo.pages.forEach((page) =>
      expect(pageTitle(page.title).length, page.path).toBeLessThanOrEqual(60),
    );
  });

  it("writes a description long enough to be used and short enough to survive", () => {
    pageSeo.pages.forEach((page) => {
      expect(page.description.length, page.path).toBeGreaterThanOrEqual(70);
      expect(page.description.length, page.path).toBeLessThanOrEqual(160);
    });
  });

  it("only prerenders routes the sitemap actually declares", () => {
    // A prerendered page carries a canonical of its own: if the sitemap ignores
    // the route, that canonical points at a URL nothing links to.
    pageSeo.pages.forEach((page) =>
      expect(sitemap, page.path).toContain(`${pageSeo.origin}${page.path}<`),
    );
  });
});

describe("pricingPage", () => {
  const offer = (key: string, mins: number[]): QuoteOffer => ({
    key,
    label: key,
    variants: mins.map((minimumAmount, index) => ({
      key: `${key}-${index}`,
      label: `${key} ${index}`,
      pricingMode: "range" as const,
      minimumAmount,
      maximumAmount: minimumAmount * 2,
      priorityAmount: 0,
      includes: [],
    })),
    options: [],
  });

  it("announces the cheapest formula as the entry price", () => {
    expect(offerEntryAmount(offer("refonte", [900, 200, 1100]))).toBe(200);
  });

  it("lists the formulas cheapest first, without touching the catalog", () => {
    const source = offer("refonte", [900, 200, 1100]);
    const order = variantsByPrice(source).map((variant) => variant.minimumAmount);

    expect(order).toEqual([200, 900, 1100]);
    expect(source.variants.map((variant) => variant.minimumAmount)).toEqual([900, 200, 1100]);
  });

  it("drops an offer whose grid has no formula yet", () => {
    // Its entry price would read "à partir de ∞", and a block with a heading
    // and nothing under it looks like a bug to the visitor.
    const empty = { ...offer("vide", []), variants: [] };

    expect(priceableOffers([offer("refonte", [200]), empty]).map((o) => o.key)).toEqual(["refonte"]);
  });
});
