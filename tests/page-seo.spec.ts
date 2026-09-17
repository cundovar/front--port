import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import pageSeo from "../src/data/pageSeo.json";
import { pageTitle } from "../src/utils/pageTitle";

const sitemap = readFileSync(resolve(__dirname, "../public/sitemap.xml"), "utf8");

describe("pageSeo", () => {
  it("names each route once", () => {
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
