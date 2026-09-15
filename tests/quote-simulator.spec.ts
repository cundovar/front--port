import { describe, expect, it } from "vitest";
import {
  buildPreviewPayload,
  buildSubmitPayload,
  emptyAnswers,
  emptyContact,
  findOffer,
  offerAsksAboutContent,
  pruneIncompatibleAnswers,
  resolvePreselectedOffer,
  validateContact,
  validateStep,
} from "../src/composables/useQuoteSimulator";
import type { QuoteCatalog } from "../src/types";

const catalog: QuoteCatalog = {
  offers: [
    {
      key: "site-vitrine",
      label: "Présenter mon activité en ligne",
      variants: [
        { key: "landing-page", label: "Une page unique", minimumAmount: 350, maximumAmount: 650, includes: ["Une page"] },
        { key: "wordpress-vitrine", label: "Plusieurs pages", minimumAmount: 600, maximumAmount: 1100, includes: [] },
      ],
      options: [
        { key: "prise-rdv", label: "Prise de rendez-vous", minimumAmount: 150, maximumAmount: 350 },
        { key: "blog", label: "Blog", minimumAmount: 120, maximumAmount: 300 },
      ],
    },
    {
      key: "automatisation",
      label: "Arrêter de refaire la même tâche",
      contentQuestion: false,
      variants: [
        { key: "automatisation-ciblee", label: "Une tâche", minimumAmount: 300, maximumAmount: 600, includes: [] },
      ],
      options: [{ key: "relances-auto", label: "Relances", minimumAmount: 120, maximumAmount: 300 }],
    },
  ],
  adjustments: {
    priorityDelay: { label: "Délai prioritaire", multiplier: 1.25 },
    contentWriting: { label: "Rédaction", minimumAmount: 150, maximumAmount: 400 },
  },
};

describe("resolvePreselectedOffer", () => {
  it("accepts an offer declared by the active catalog", () => {
    expect(resolvePreselectedOffer(catalog, "automatisation")).toBe("automatisation");
  });

  it("refuses a value absent from the catalog", () => {
    expect(resolvePreselectedOffer(catalog, "<script>evil")).toBe("");
    expect(resolvePreselectedOffer(catalog, "wordpress")).toBe("");
  });

  it("refuses non-string and missing values", () => {
    expect(resolvePreselectedOffer(catalog, null)).toBe("");
    expect(resolvePreselectedOffer(null, "site-vitrine")).toBe("");
  });
});

describe("pruneIncompatibleAnswers", () => {
  it("keeps choices that still belong to the selected offer", () => {
    const answers = { ...emptyAnswers(), offerKey: "site-vitrine", variantKey: "landing-page", optionKeys: ["blog"] };
    pruneIncompatibleAnswers(catalog, answers);

    expect(answers.variantKey).toBe("landing-page");
    expect(answers.optionKeys).toEqual(["blog"]);
  });

  it("drops a variant and options belonging to another offer", () => {
    const answers = { ...emptyAnswers(), offerKey: "automatisation", variantKey: "landing-page", optionKeys: ["blog"] };
    pruneIncompatibleAnswers(catalog, answers);

    expect(answers.variantKey).toBe("");
    expect(answers.optionKeys).toEqual([]);
  });
});

describe("validateStep", () => {
  it("requires an offer then a variant", () => {
    const answers = emptyAnswers();
    expect(validateStep("offer", answers, emptyContact()).offerKey).toBeDefined();

    answers.offerKey = "site-vitrine";
    expect(validateStep("offer", answers, emptyContact())).toEqual({});
    expect(validateStep("scope", answers, emptyContact()).variantKey).toBeDefined();
  });

  it("never asks for a technical complexity", () => {
    const answers = { ...emptyAnswers(), offerKey: "site-vitrine", variantKey: "landing-page" };
    const errors = validateStep("situation", answers, emptyContact());

    expect(errors).toEqual({});
    expect(Object.keys(errors)).not.toContain("complexity");
  });

  it("rejects an over-long description", () => {
    const answers = { ...emptyAnswers(), projectDescription: "a".repeat(601) };
    expect(validateStep("situation", answers, emptyContact()).projectDescription).toBeDefined();
  });
});

describe("validateContact", () => {
  it("reports each missing field independently", () => {
    const errors = validateContact({ ...emptyContact(), fullName: "Claire" });

    expect(errors.fullName).toBeUndefined();
    expect(errors.email).toBeDefined();
    expect(errors.consent).toBeDefined();
  });

  it("passes with a name, a valid email and consent", () => {
    expect(validateContact({ ...emptyContact(), fullName: "Claire", email: "c@example.com", consent: true })).toEqual({});
  });
});

describe("payload builders", () => {
  const answers = {
    ...emptyAnswers(),
    offerKey: "site-vitrine",
    variantKey: "wordpress-vitrine",
    optionKeys: ["prise-rdv"],
    contentReadiness: "a-rediger" as const,
    deadline: "prioritaire" as const,
    projectDescription: "Mon cabinet",
  };

  it("sends only project answers in the preview payload", () => {
    const payload = buildPreviewPayload(answers);

    expect(payload).toEqual({
      offerKey: "site-vitrine",
      variantKey: "wordpress-vitrine",
      optionKeys: ["prise-rdv"],
      projectStage: "nouveau",
      contentReadiness: "a-rediger",
      deadline: "prioritaire",
      projectDescription: "Mon cabinet",
    });
    expect(Object.keys(payload)).not.toContain("fullName");
    expect(Object.keys(payload)).not.toContain("email");
  });

  it("never sends an amount the browser could tamper with", () => {
    const payload = buildSubmitPayload(answers, {
      ...emptyContact(),
      fullName: " Claire ",
      email: " c@example.com ",
      consent: true,
    });

    expect(Object.keys(payload)).not.toContain("minimumAmount");
    expect(Object.keys(payload)).not.toContain("maximumAmount");
    expect(payload.fullName).toBe("Claire");
    expect(payload.consent).toBe(true);
  });
});

describe("findOffer", () => {
  it("resolves a known offer and rejects an unknown one", () => {
    expect(findOffer(catalog, "site-vitrine")?.label).toBe("Présenter mon activité en ligne");
    expect(findOffer(catalog, "nope")).toBeNull();
  });
});

describe("offerAsksAboutContent", () => {
  it("asks the question for an offer that ships editorial content", () => {
    expect(offerAsksAboutContent(findOffer(catalog, "site-vitrine"))).toBe(true);
  });

  it("hides the question for an automation", () => {
    expect(offerAsksAboutContent(findOffer(catalog, "automatisation"))).toBe(false);
  });

  it("asks nothing when no offer is selected", () => {
    expect(offerAsksAboutContent(null)).toBe(false);
  });

  it("resets a content answer carried over from an offer that asked it", () => {
    const answers = emptyAnswers();
    answers.offerKey = "automatisation";
    answers.contentReadiness = "a-rediger";

    pruneIncompatibleAnswers(catalog, answers);

    expect(answers.contentReadiness).toBe("pret");
  });

  it("keeps the content answer for an offer that asks it", () => {
    const answers = emptyAnswers();
    answers.offerKey = "site-vitrine";
    answers.variantKey = "landing-page";
    answers.contentReadiness = "a-rediger";

    pruneIncompatibleAnswers(catalog, answers);

    expect(answers.contentReadiness).toBe("a-rediger");
  });
});
