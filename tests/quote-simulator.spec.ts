import { describe, expect, it } from "vitest";
import {
  applicableStackKey,
  applyProposalToAnswers,
  buildPreviewPayload,
  buildRecommendationPayload,
  buildSubmitPayload,
  canBeAnalysed,
  contactFieldError,
  emptyAnswers,
  emptyContact,
  findOffer,
  formatQuotePrice,
  isValidEmail,
  nextVariantAfterStackChange,
  offerAsksAboutContent,
  pruneIncompatibleAnswers,
  reasonForKey,
  resolvePreselectedOffer,
  submitErrorMessage,
  suggestedKeys,
  validateContact,
  useQuoteSimulator,
  validateStep,
  variantForStack,
} from "../src/composables/useQuoteSimulator";
import type { QuoteCatalog, QuotePricingMode, QuoteProposal } from "../src/types";

const catalog: QuoteCatalog = {
  tools: [
    { key: "tableur", label: "Excel ou Google Sheets" },
    { key: "email", label: "Gmail ou Outlook" },
  ],
  offers: [
    {
      key: "site-vitrine",
      label: "Présenter mon activité en ligne",
      variants: [
        { key: "landing-page", label: "Une page unique", pricingMode: "fixed", minimumAmount: 550, maximumAmount: 550, priorityAmount: 150, includes: ["Une page"] },
        { key: "wordpress-vitrine", label: "Plusieurs pages", pricingMode: "fixed", minimumAmount: 900, maximumAmount: 900, priorityAmount: 200, includes: [] },
      ],
      options: [
        { key: "prise-rdv", label: "Prise de rendez-vous", minimumAmount: 250, maximumAmount: 250 },
        { key: "blog", label: "Blog", minimumAmount: 200, maximumAmount: 200 },
      ],
    },
    {
      key: "automatisation",
      label: "Arrêter de refaire la même tâche",
      contentQuestion: false,
      variants: [
        { key: "automatisation-ciblee", label: "Une tâche", pricingMode: "fixed", minimumAmount: 500, maximumAmount: 500, priorityAmount: 150, includes: [] },
      ],
      options: [{ key: "relances-auto", label: "Relances", minimumAmount: 200, maximumAmount: 200 }],
    },
  ],
  adjustments: {
    contentWriting: { label: "Rédaction", minimumAmount: 300, maximumAmount: 300 },
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
    const errors = validateStep("need", answers, emptyContact());

    expect(errors).toEqual({});
    expect(Object.keys(errors)).not.toContain("complexity");
  });

  it("rejects an over-long description", () => {
    const answers = { ...emptyAnswers(), projectDescription: "a".repeat(601) };
    expect(validateStep("need", answers, emptyContact()).projectDescription).toBeDefined();
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

  it("carries the ticked tools so the server can freeze them in the estimate", () => {
    const payload = buildSubmitPayload(
      { ...answers, toolKeys: ["tableur", "email"] },
      { ...emptyContact(), fullName: "Claire", email: "c@example.com", consent: true },
    );

    expect(payload.toolKeys).toEqual(["tableur", "email"]);
  });
});

describe("submitErrorMessage", () => {
  it("names the quota when the server refuses a sixth submission", () => {
    expect(submitErrorMessage(429)).toContain("Trop d\u2019envois");
  });

  it("says the server never answered when the request itself failed", () => {
    expect(submitErrorMessage(0)).toContain("n\u2019a pas r\u00e9pondu");
  });

  it("exposes the status so a failure can be reported", () => {
    expect(submitErrorMessage(422)).toContain("422");
    expect(submitErrorMessage(500)).toContain("500");
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

const proposal = (over: Partial<QuoteProposal> = {}): QuoteProposal => ({
  tier: "essential",
  title: "Solution essentielle",
  variantKey: "automatisation-ciblee",
  variantLabel: "Une tâche",
  includes: ["Une automatisation"],
  selectedOptions: [{ key: "relances-auto", label: "Relances" }],
  optionKeys: ["relances-auto"],
  minimumAmount: 700,
  maximumAmount: 700,
  pricingMode: "fixed",
  disclaimer: "Prix ferme pour le périmètre décrit ci-dessus.",
  calculationDetail: [],
  reasons: { "relances-auto": "Vous parlez de relances oubliées." },
  pricingVersion: 3,
  ...over,
});

describe("canBeAnalysed", () => {
  it("refuses a description too short to say anything useful", () => {
    expect(canBeAnalysed("trop court")).toBe(false);
    expect(canBeAnalysed("   ".repeat(20))).toBe(false);
  });

  it("accepts a description of at least 30 characters", () => {
    expect(canBeAnalysed("Je recopie mes demandes a la main chaque lundi.")).toBe(true);
  });
});

describe("buildRecommendationPayload", () => {
  it("sends the project context and never any contact detail", () => {
    const answers = emptyAnswers();
    answers.offerKey = "automatisation";
    answers.projectDescription = "  Je recopie mes demandes a la main chaque lundi.  ";
    answers.toolKeys = ["tableur"];

    const payload = buildRecommendationPayload(answers);

    expect(payload).toEqual({
      offerKey: "automatisation",
      projectDescription: "Je recopie mes demandes a la main chaque lundi.",
      toolKeys: ["tableur"],
      projectStage: "nouveau",
      contentReadiness: "pret",
      deadline: "normal",
    });
    expect(JSON.stringify(payload)).not.toMatch(/fullName|email|phone|consent/);
  });

  it("detaches the tool list from the reactive answers", () => {
    const answers = emptyAnswers();
    answers.toolKeys = ["tableur"];

    buildRecommendationPayload(answers).toolKeys.push("email");

    expect(answers.toolKeys).toEqual(["tableur"]);
  });
});

describe("suggestedKeys and reasonForKey", () => {
  it("merges the keys of every proposal without duplicates", () => {
    const keys = suggestedKeys([
      proposal(),
      proposal({ tier: "complete", variantKey: "automatisation-multi-outils", optionKeys: ["relances-auto", "rapport-hebdo"] }),
    ]);

    expect(keys).toEqual([
      "automatisation-ciblee",
      "relances-auto",
      "automatisation-multi-outils",
      "rapport-hebdo",
    ]);
  });

  it("returns the justification of a key, and an empty string otherwise", () => {
    expect(reasonForKey([proposal()], "relances-auto")).toBe("Vous parlez de relances oubliées.");
    expect(reasonForKey([proposal()], "rapport-hebdo")).toBe("");
    expect(reasonForKey([], "relances-auto")).toBe("");
  });
});

describe("applyProposalToAnswers", () => {
  it("copies the proposal into answers the client can still edit", () => {
    const answers = emptyAnswers();
    answers.variantKey = "autre";
    answers.optionKeys = ["obsolete"];

    applyProposalToAnswers(proposal(), answers);

    expect(answers.variantKey).toBe("automatisation-ciblee");
    expect(answers.optionKeys).toEqual(["relances-auto"]);
  });

  it("detaches the option list so unticking one never edits the proposal", () => {
    const answers = emptyAnswers();
    const source = proposal();

    applyProposalToAnswers(source, answers);
    answers.optionKeys.pop();

    expect(source.optionKeys).toEqual(["relances-auto"]);
  });
});

describe("formatQuotePrice", () => {
  // Intl separates thousands with a narrow no-break space; normalise it away
  // rather than encoding an ICU detail in every expectation.
  const price = (min: number, max: number, mode: QuotePricingMode): string =>
    formatQuotePrice(min, max, mode).replace(/\s/g, " ");

  it("shows one amount for a committed pack", () => {
    expect(price(900, 900, "fixed")).toBe("900 €");
  });

  it("prefixes a starting price", () => {
    expect(price(1400, 1400, "from")).toBe("à partir de 1 400 €");
  });

  it("shows both bounds for a range", () => {
    expect(price(400, 900, "range")).toBe("400 € – 900 €");
  });

  it("never prints a useless range when both bounds are equal", () => {
    expect(price(750, 750, "range")).toBe("750 €");
  });
});

describe("isValidEmail", () => {
  it("accepts the addresses Symfony accepts", () => {
    ["jean@gmail.com", "jean.dupont@gmail.com", "jean+devis@gmail.com", "jean_d@mon-site.fr", "jean@sous.domaine.co.uk", "JEAN@GMAIL.COM"].forEach(
      (email) => expect(isValidEmail(email), email).toBe(true),
    );
  });

  it("refuses what the server refused with a 400, before the request leaves", () => {
    ["andr\u00e9@gmail.com", "jean..dupont@gmail.com", ".jean@gmail.com", "jean.@gmail.com", "jean@gmail", "jean@-gmail.com", "jean@gmail..com"].forEach(
      (email) => expect(isValidEmail(email), email).toBe(false),
    );
  });

  it("ignores surrounding spaces the payload trims anyway", () => {
    expect(isValidEmail("  jean@gmail.com  ")).toBe(true);
  });
});

describe("contactFieldError", () => {
  it("maps a field the API refused to the input holding it", () => {
    expect(contactFieldError("email")?.message).toContain("accent");
    expect(contactFieldError("fullName")?.field).toBe("fullName");
  });

  it("keeps the generic banner for anything not on the contact screen", () => {
    expect(contactFieldError("offerKey")).toBeNull();
    expect(contactFieldError(undefined)).toBeNull();
  });
});

describe("applicableStackKey", () => {
  it("sends the stack when something already exists", () => {
    const answers = { ...emptyAnswers(), projectStage: "existant" as const, existingStackKey: "genere-ia" };

    expect(applicableStackKey(answers)).toBe("genere-ia");
  });

  it("drops a stale answer when the visitor goes back to a new project", () => {
    // The question is hidden again at that point, so leaving the key in the
    // payload would file the estimate against a stack nobody claimed.
    const answers = { ...emptyAnswers(), projectStage: "nouveau" as const, existingStackKey: "wordpress" };

    expect(applicableStackKey(answers)).toBe("");
    expect(buildSubmitPayload(answers, emptyContact()).existingStackKey).toBe("");
  });
});

describe("variantForStack", () => {
  const offer = {
    key: "refonte",
    label: "Remettre au propre",
    variants: [
      { key: "reprise-wordpress", label: "Reprendre un site WordPress", pricingMode: "range" as QuotePricingMode, minimumAmount: 900, maximumAmount: 1800, priorityAmount: 200, includes: [], stackKeys: ["wordpress"] },
      { key: "fiabiliser-ia", label: "Fiabiliser une application générée par IA", pricingMode: "range" as QuotePricingMode, minimumAmount: 1200, maximumAmount: 2600, priorityAmount: 200, includes: [], stackKeys: ["genere-ia", "inconnu"] },
    ],
    options: [],
  };

  it("finds the formula a stack points at", () => {
    expect(variantForStack(offer, "genere-ia")).toBe("fiabiliser-ia");
  });

  it("returns nothing when the grid links no formula to that stack", () => {
    expect(variantForStack(offer, "constructeur")).toBe("");
    expect(variantForStack(offer, "")).toBe("");
    expect(variantForStack(null, "wordpress")).toBe("");
  });

  it("ignores formulas that declare no stack at all", () => {
    const plain = { ...offer, variants: [{ ...offer.variants[0], stackKeys: undefined }] };

    expect(variantForStack(plain, "wordpress")).toBe("");
  });

  it("keeps the first match, so the backoffice order is the order of preference", () => {
    const both = {
      ...offer,
      variants: [
        { ...offer.variants[0], stackKeys: ["inconnu"] },
        { ...offer.variants[1], stackKeys: ["inconnu"] },
      ],
    };

    expect(variantForStack(both, "inconnu")).toBe("reprise-wordpress");
  });

  describe("nextVariantAfterStackChange", () => {
    it("fills an empty choice", () => {
      expect(nextVariantAfterStackChange(offer, "wordpress", "", "")).toBe("reprise-wordpress");
    });

    it("never overwrites a formula the visitor picked themselves", () => {
      expect(nextVariantAfterStackChange(offer, "wordpress", "fiabiliser-ia", "")).toBe("fiabiliser-ia");
    });

    it("follows the visitor when they change their mind about the stack", () => {
      // "reprise-wordpress" is there because the preselection put it there, so
      // replacing it takes nothing away from them.
      expect(nextVariantAfterStackChange(offer, "genere-ia", "reprise-wordpress", "reprise-wordpress")).toBe(
        "fiabiliser-ia",
      );
    });

    it("leaves the choice alone when the new stack points at nothing", () => {
      expect(nextVariantAfterStackChange(offer, "constructeur", "reprise-wordpress", "reprise-wordpress")).toBe(
        "reprise-wordpress",
      );
      expect(nextVariantAfterStackChange(offer, "", "", "")).toBe("");
    });
  });
});

describe("the stack answer preselects a formula", () => {
  const withStacks: QuoteCatalog = {
    ...catalog,
    stacks: [
      { key: "wordpress", label: "WordPress" },
      { key: "genere-ia", label: "Créé avec un outil d’IA" },
    ],
    offers: [
      {
        key: "refonte",
        label: "Remettre au propre",
        variants: [
          { key: "reprise-wordpress", label: "Reprendre un site WordPress", pricingMode: "range" as QuotePricingMode, minimumAmount: 900, maximumAmount: 1800, priorityAmount: 200, includes: [], stackKeys: ["wordpress"] },
          { key: "fiabiliser-ia", label: "Fiabiliser une application générée par IA", pricingMode: "range" as QuotePricingMode, minimumAmount: 1200, maximumAmount: 2600, priorityAmount: 200, includes: [], stackKeys: ["genere-ia"] },
        ],
        options: [],
      },
      ...catalog.offers,
    ],
  };

  const start = () => {
    const simulator = useQuoteSimulator();
    simulator.catalog.value = withStacks;
    simulator.selectOffer("refonte");

    return simulator;
  };

  it("arrives at the scope step with the matching formula already chosen", () => {
    const { answers, selectStack } = start();
    selectStack("genere-ia");

    expect(answers.existingStackKey).toBe("genere-ia");
    expect(answers.variantKey).toBe("fiabiliser-ia");
  });

  it("follows a change of mind, then stops as soon as the visitor decides", () => {
    const { answers, selectStack } = start();
    selectStack("wordpress");
    selectStack("genere-ia");
    expect(answers.variantKey).toBe("fiabiliser-ia");

    answers.variantKey = "reprise-wordpress";
    selectStack("wordpress");
    expect(answers.variantKey).toBe("reprise-wordpress");
  });

  it("forgets what it preselected when the offer changes", () => {
    const { answers, selectStack, selectOffer } = start();
    selectStack("wordpress");

    selectOffer("site-vitrine");
    expect(answers.variantKey).toBe("");

    // Nothing in this offer answers a stack, so the empty choice stays empty.
    selectStack("wordpress");
    expect(answers.variantKey).toBe("");
  });
});
