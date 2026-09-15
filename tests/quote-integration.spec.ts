import { describe, expect, it } from "vitest";
import content from "../src/data/content.json";
import {
  KNOWN_SERVICE_KEYS,
  buildQuoteCtaHref,
  quoteServiceLabel,
  quoteStatusLabel,
} from "../src/composables/useQuoteSimulator";

describe("content and catalog stay in sync", () => {
  it("gives every service offer a key from the known catalog", () => {
    const keys = content.services.map((service) => service.serviceKey);

    expect(keys).toHaveLength(5);
    keys.forEach((key) => {
      expect(KNOWN_SERVICE_KEYS).toContain(key);
    });
  });

  it("uses distinct keys per offer", () => {
    const keys = content.services.map((service) => service.serviceKey);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("points the hero CTA at the simulator", () => {
    expect(content.hero.primaryHref).toBe("/devis");
  });
});

describe("buildQuoteCtaHref", () => {
  it("builds a preselected link for each offer", () => {
    content.services.forEach((service) => {
      expect(buildQuoteCtaHref(service.serviceKey)).toBe(`/devis?service=${service.serviceKey}`);
    });
  });

  it("falls back to the bare simulator for an unknown key", () => {
    expect(buildQuoteCtaHref("injected")).toBe("/devis");
    expect(buildQuoteCtaHref(undefined)).toBe("/devis");
  });

  it("never adds any query parameter other than service", () => {
    const href = buildQuoteCtaHref("automation");
    const query = href.split("?")[1] ?? "";

    expect(query.split("&")).toEqual(["service=automation"]);
  });
});

describe("admin display helpers", () => {
  it("labels every backend status", () => {
    expect(quoteStatusLabel("new")).toBe("Nouvelle");
    expect(quoteStatusLabel("reviewed")).toBe("Vue");
    expect(quoteStatusLabel("qualified")).toBe("Qualifiée");
    expect(quoteStatusLabel("archived")).toBe("Archivée");
  });

  it("falls back to the raw value for an unknown status", () => {
    expect(quoteStatusLabel("unknown")).toBe("unknown");
  });

  it("labels every service key", () => {
    KNOWN_SERVICE_KEYS.forEach((key) => {
      expect(quoteServiceLabel(key)).not.toBe(key);
    });
  });
});
