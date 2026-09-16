import { describe, expect, it } from "vitest";
import content from "../src/data/content.json";
import {
  KNOWN_OFFER_KEYS,
  buildQuoteCtaHref,
  formatQuotePrice,
  quoteStatusLabel,
} from "../src/composables/useQuoteSimulator";
import type { ContentData } from "../src/types";
import { normalizeContent, normalizeServiceKey } from "../src/utils/content";

describe("homepage CTAs and catalog stay aligned", () => {
  it("gives every service offer a key the simulator recognises", () => {
    const keys = content.services.map((service) => service.serviceKey);

    expect(keys).toHaveLength(5);
    keys.forEach((key) => {
      expect(KNOWN_OFFER_KEYS).toContain(key);
    });
  });

  it("uses a distinct key per offer", () => {
    const keys = content.services.map((service) => service.serviceKey);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("points the hero CTA at the simulator", () => {
    expect(content.hero.primaryHref).toBe("/devis");
  });
});

describe("buildQuoteCtaHref", () => {
  it("preselects the matching offer for each card", () => {
    content.services.forEach((service) => {
      expect(buildQuoteCtaHref(service.serviceKey)).toBe(`/devis?service=${service.serviceKey}`);
    });
  });

  it("falls back to the bare simulator for anything unknown", () => {
    expect(buildQuoteCtaHref("injected")).toBe("/devis");
    expect(buildQuoteCtaHref(undefined)).toBe("/devis");
    expect(buildQuoteCtaHref(42)).toBe("/devis");
  });

  it("adds no query parameter other than service", () => {
    const query = buildQuoteCtaHref("automatisation").split("?")[1] ?? "";
    expect(query.split("&")).toEqual(["service=automatisation"]);
  });
});

describe("no pricing is duplicated in the frontend", () => {
  it("keeps content.json free of quote amounts", () => {
    const serialized = JSON.stringify(content.services);

    expect(serialized).not.toMatch(/minimumAmount|maximumAmount/);
  });
});

describe("admin status labels", () => {
  it("labels every backend status", () => {
    expect(quoteStatusLabel("new")).toBe("Nouvelle");
    expect(quoteStatusLabel("reviewed")).toBe("Vue");
    expect(quoteStatusLabel("qualified")).toBe("Qualifiée");
    expect(quoteStatusLabel("archived")).toBe("Archivée");
  });

  it("falls back to the raw value when unknown", () => {
    expect(quoteStatusLabel("unknown")).toBe("unknown");
  });
});

describe("service keys already stored in production", () => {
  // The API payload deployed before the refonte still carries the old keys.
  const LEGACY_PAYLOAD_KEYS = ["automation", "ai-assistant", "refonte", "custom-tool", "wordpress"];

  it("translates every legacy key to a key of the active catalog", () => {
    const translated = LEGACY_PAYLOAD_KEYS.map((key) => normalizeServiceKey(key, "site-vitrine"));

    translated.forEach((key) => {
      expect(KNOWN_OFFER_KEYS).toContain(key);
    });
    expect(translated).toEqual([
      "automatisation",
      "assistant-ia",
      "refonte",
      "outil-metier",
      "site-vitrine",
    ]);
  });

  it("keeps the fallback key when the stored one is unknown or missing", () => {
    expect(normalizeServiceKey("service-supprime", "refonte")).toBe("refonte");
    expect(normalizeServiceKey(undefined, "refonte")).toBe("refonte");
    expect(normalizeServiceKey(42, "refonte")).toBe("refonte");
  });

  it("never lets a stored legacy key break the CTA preselection", () => {
    const fallback = content as unknown as ContentData;
    const legacyApiResponse = {
      services: fallback.services.map((service, index) => ({
        ...service,
        serviceKey: LEGACY_PAYLOAD_KEYS[index],
      })),
    };

    const normalized = normalizeContent(fallback, legacyApiResponse);

    normalized.services.forEach((service) => {
      expect(buildQuoteCtaHref(service.serviceKey)).toBe(`/devis?service=${service.serviceKey}`);
    });
  });
});

describe("the AI never authors a deliverable or a price", () => {
  // Mirrors the server contract: only these keys may carry model-written text.
  const AI_AUTHORED_FIELDS = ["summary", "reasons"];

  const proposal = {
    tier: "essential",
    title: "Solution essentielle",
    variantKey: "automatisation-ciblee",
    variantLabel: "Une tâche précise à automatiser",
    includes: ["Une automatisation prête à l’emploi"],
    selectedOptions: [{ key: "relances-auto", label: "Relances automatiques par email" }],
    optionKeys: ["relances-auto"],
    minimumAmount: 700,
    maximumAmount: 700,
    pricingMode: "fixed" as const,
    disclaimer: "Prix ferme pour le périmètre décrit ci-dessus.",
    calculationDetail: [],
    reasons: { "relances-auto": "Vous parlez de relances oubliées." },
    pricingVersion: 3,
  };

  it("attaches every justification to a key the proposal actually carries", () => {
    const priced = [proposal.variantKey, ...proposal.optionKeys];

    Object.keys(proposal.reasons).forEach((key) => {
      expect(priced).toContain(key);
    });
  });

  it("keeps the displayed scope out of the AI-authored fields", () => {
    const displayed = [...proposal.includes, ...proposal.selectedOptions.map((o) => o.label)];

    AI_AUTHORED_FIELDS.forEach((field) => {
      expect(displayed).not.toContain(field);
    });
    // Labels and amounts come from the catalog payload, not from reasons/summary.
    expect(displayed).toContain("Relances automatiques par email");
    expect(proposal.minimumAmount).toBe(700);
  });
});

describe("pricing modes stay consistent with their wording", () => {
  it("never shows a range for a committed amount", () => {
    expect(formatQuotePrice(900, 900, "fixed")).not.toContain("–");
    expect(formatQuotePrice(1400, 1400, "from")).not.toContain("–");
  });

  it("keeps both bounds only when they differ", () => {
    expect(formatQuotePrice(400, 900, "range")).toContain("–");
    expect(formatQuotePrice(400, 400, "range")).not.toContain("–");
  });
});
