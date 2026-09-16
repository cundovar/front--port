import { describe, expect, it } from "vitest";
import {
  buildCatalogPayload,
  cloneCatalog,
  describeErrorPath,
  indexErrors,
  parseAmount,
  validateCatalogDraft,
} from "../src/composables/useQuotePricingAdmin";
import type { QuoteCatalog } from "../src/types";

const baseCatalog = (): QuoteCatalog => ({
  tools: [
    { key: "tableur", label: "Excel ou Google Sheets" },
    { key: "email", label: "Gmail ou Outlook" },
  ],
  offers: [
    {
      key: "site-vitrine",
      label: "Présenter mon activité en ligne",
      variants: [
        {
          key: "landing-page",
          label: "Une page unique",
          pricingMode: "fixed",
          minimumAmount: 550,
          maximumAmount: 550,
          priorityAmount: 150,
          includes: ["Une page"],
        },
      ],
      options: [
        { key: "blog", label: "Espace actualités ou blog", minimumAmount: 200, maximumAmount: 200 },
      ],
    },
    {
      key: "refonte",
      label: "Remettre au propre un site existant",
      variants: [
        {
          key: "refonte-ciblee",
          label: "Reprendre l’existant",
          pricingMode: "range",
          minimumAmount: 400,
          maximumAmount: 900,
          priorityAmount: 200,
          includes: ["Un état des lieux"],
        },
      ],
      options: [
        { key: "performance", label: "Site plus rapide", minimumAmount: 150, maximumAmount: 400 },
      ],
    },
  ],
  adjustments: {
    contentWriting: { label: "Rédaction des contenus", minimumAmount: 300, maximumAmount: 300 },
  },
});

describe("parseAmount", () => {
  it("accepts integers typed in a number input", () => {
    expect(parseAmount(900)).toBe(900);
    expect(parseAmount("900")).toBe(900);
  });

  it("rejects an emptied or decimal field instead of turning it into zero", () => {
    expect(parseAmount("")).toBeNaN();
    expect(parseAmount("abc")).toBeNaN();
    expect(parseAmount("12.5")).toBeNaN();
  });
});

describe("validateCatalogDraft", () => {
  it("accepts the default shape", () => {
    expect(validateCatalogDraft(baseCatalog())).toEqual([]);
  });

  it("reports a maximum below the minimum on the exact field", () => {
    const catalog = baseCatalog();
    catalog.offers[1].variants[0].maximumAmount = 100;

    expect(validateCatalogDraft(catalog)).toEqual([
      {
        path: "offers.1.variants.0.maximumAmount",
        message: "Le maximum doit être supérieur ou égal au minimum.",
      },
    ]);
  });

  it("reports an emptied amount", () => {
    const catalog = baseCatalog();
    // @ts-expect-error the input can be cleared by the administrator
    catalog.offers[0].options[0].minimumAmount = "";

    expect(validateCatalogDraft(catalog).map((error) => error.path)).toEqual([
      "offers.0.options.0.minimumAmount",
    ]);
    expect(validateCatalogDraft(baseCatalog())).toEqual([]);
  });

  it("rejects a blank label", () => {
    const catalog = baseCatalog();
    catalog.offers[0].variants[0].label = "   ";

    expect(validateCatalogDraft(catalog)).toContainEqual({
      path: "offers.0.variants.0.label",
      message: "Champ texte requis.",
    });
  });

  it("rejects duplicate keys inside the same offer", () => {
    const catalog = baseCatalog();
    catalog.offers[0].variants.push({ ...catalog.offers[0].variants[0] });

    expect(validateCatalogDraft(catalog)).toContainEqual({
      path: "offers.0.variants.1.key",
      message: "Clé en double.",
    });
  });

  it("rejects an offer without variants", () => {
    const catalog = baseCatalog();
    catalog.offers[0].variants = [];

    expect(validateCatalogDraft(catalog)).toContainEqual({
      path: "offers.0.variants",
      message: "Au moins une variante est requise.",
    });
  });

  it("rejects a negative or missing priority supplement", () => {
    const catalog = baseCatalog();
    catalog.offers[0].variants[0].priorityAmount = -50;

    expect(validateCatalogDraft(catalog)).toContainEqual({
      path: "offers.0.variants.0.priorityAmount",
      message: "Supplément entier positif attendu (0 si aucun).",
    });
  });

  it("refuses a committed variant carrying two different bounds", () => {
    const catalog = baseCatalog();
    catalog.offers[0].variants[0].maximumAmount = 1800;

    expect(validateCatalogDraft(catalog).map((e) => e.path)).toEqual([
      "offers.0.variants.0.maximumAmount",
    ]);
  });

  it("refuses a ranged option inside an offer that commits to a price", () => {
    const catalog = baseCatalog();
    catalog.offers[0].options[0].maximumAmount = 900;

    expect(validateCatalogDraft(catalog).map((e) => e.path)).toEqual([
      "offers.0.options.0.maximumAmount",
    ]);
  });

  it("still accepts ranged options in an offer priced as a range", () => {
    const catalog = baseCatalog();
    catalog.offers[1].options[0].maximumAmount = 700;

    expect(validateCatalogDraft(catalog)).toEqual([]);
  });

  it("rejects an unknown pricing mode", () => {
    const catalog = baseCatalog();
    // @ts-expect-error the value could come from a hand-edited draft
    catalog.offers[0].variants[0].pricingMode = "negociable";

    expect(validateCatalogDraft(catalog)).toContainEqual({
      path: "offers.0.variants.0.pricingMode",
      message: "Mode attendu : fixe, à partir de, ou fourchette.",
    });
  });

  it("refuses a ranged writing supplement once a pack is committed", () => {
    const catalog = baseCatalog();
    catalog.adjustments.contentWriting.maximumAmount = 700;

    expect(validateCatalogDraft(catalog).map((e) => e.path)).toEqual([
      "adjustments.contentWriting.maximumAmount",
    ]);
  });

  it("rejects a tool without a label and a duplicate tool key", () => {
    const catalog = baseCatalog();
    catalog.tools[0].label = "  ";
    catalog.tools[1].key = "tableur";

    const paths = validateCatalogDraft(catalog).map((e) => e.path);

    expect(paths).toContain("tools.0.label");
    expect(paths).toContain("tools.1.key");
  });

  it("refuses an empty grid", () => {
    expect(validateCatalogDraft({ ...baseCatalog(), offers: [] })).toEqual([
      { path: "offers", message: "Au moins une offre est requise." },
    ]);
  });
});

describe("indexErrors", () => {
  it("maps each path to its message", () => {
    expect(indexErrors([{ path: "offers.0.key", message: "Requis." }])).toEqual({
      "offers.0.key": "Requis.",
    });
  });

  it("lets a server message replace the local one on the same field", () => {
    const map = indexErrors([
      { path: "offers.0.key", message: "Local." },
      { path: "offers.0.key", message: "Serveur." },
    ]);

    expect(map["offers.0.key"]).toBe("Serveur.");
  });
});

describe("describeErrorPath", () => {
  it("names the offer and the item behind a server path", () => {
    expect(describeErrorPath(baseCatalog(), "offers.0.variants.0.maximumAmount")).toBe(
      "Présenter mon activité en ligne · Une page unique",
    );
  });

  it("names an adjustment", () => {
    expect(describeErrorPath(baseCatalog(), "adjustments.priorityDelay.multiplier")).toBe(
      "Ajustement · délai prioritaire",
    );
  });

  it("falls back to the raw path when the field no longer exists", () => {
    expect(describeErrorPath(baseCatalog(), "offers.9.variants.0.key")).toBe("offers.9.variants.0.key");
  });
});

describe("buildCatalogPayload", () => {
  it("sends integers so the server validation sees what the admin typed", () => {
    const catalog = baseCatalog();
    // @ts-expect-error a number input yields a string when typed by hand
    catalog.offers[0].variants[0].minimumAmount = "400";

    const payload = buildCatalogPayload(catalog);

    expect(payload.catalog.offers[0].variants[0].minimumAmount).toBe(400);
  });

  it("collapses a committed variant onto a single amount before sending", () => {
    const catalog = baseCatalog();
    catalog.offers[0].variants[0].maximumAmount = 9999;

    const payload = buildCatalogPayload(catalog);

    expect(payload.catalog.offers[0].variants[0].maximumAmount).toBe(550);
    // A range variant keeps both bounds untouched.
    expect(payload.catalog.offers[1].variants[0].maximumAmount).toBe(900);
  });

  it("never mutates the draft on screen", () => {
    const catalog = baseCatalog();
    buildCatalogPayload(catalog).catalog.offers[0].variants[0].minimumAmount = 1;

    expect(catalog.offers[0].variants[0].minimumAmount).toBe(550);
  });
});

describe("cloneCatalog", () => {
  it("detaches nested arrays so cancelling restores the saved grid", () => {
    const catalog = baseCatalog();
    const copy = cloneCatalog(catalog);
    copy.offers[0].variants[0].includes.push("Ajout");

    expect(catalog.offers[0].variants[0].includes).toEqual(["Une page"]);
  });
});
