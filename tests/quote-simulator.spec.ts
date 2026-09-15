import { describe, expect, it } from "vitest";
import {
  KNOWN_SERVICE_KEYS,
  buildSubmitPayload,
  emptyAnswers,
  emptyContact,
  mapApiResultToResult,
  resolvePreselectedService,
  validateStep,
} from "../src/composables/useQuoteSimulator";

describe("resolvePreselectedService", () => {
  it("accepts a known service key", () => {
    expect(resolvePreselectedService("automation")).toBe("automation");
  });

  it("rejects an unknown value", () => {
    expect(resolvePreselectedService("hacked")).toBe("");
  });

  it("rejects null and non-string values", () => {
    expect(resolvePreselectedService(null)).toBe("");
    expect(resolvePreselectedService(["automation"])).toBe("");
  });
});

describe("validateStep", () => {
  it("requires a service on the need step", () => {
    const errors = validateStep("need", emptyAnswers(), emptyContact());
    expect(errors.serviceKey).toBeDefined();
  });

  it("passes the need step once a valid service is chosen", () => {
    const answers = { ...emptyAnswers(), serviceKey: "refonte" as const };
    expect(validateStep("need", answers, emptyContact())).toEqual({});
  });

  it("requires complexity but accepts omitted optional fields", () => {
    const missing = validateStep("details", emptyAnswers(), emptyContact());
    expect(missing.complexity).toBeDefined();

    const answers = { ...emptyAnswers(), complexity: "standard" as const };
    expect(validateStep("details", answers, emptyContact())).toEqual({});
  });

  it("reports an invalid email without touching other fields", () => {
    const contact = { ...emptyContact(), fullName: "Jane", email: "not-an-email", consentAccepted: true };
    const errors = validateStep("contact", emptyAnswers(), contact);

    expect(errors.email).toBeDefined();
    expect(errors.fullName).toBeUndefined();
    expect(errors.complexity).toBeUndefined();
  });

  it("requires contact consent before submission", () => {
    const contact = { ...emptyContact(), fullName: "Jane", email: "jane@example.com" };

    expect(validateStep("contact", emptyAnswers(), contact).consentAccepted).toBeDefined();
    contact.consentAccepted = true;
    expect(validateStep("contact", emptyAnswers(), contact)).toEqual({});
  });

  it("rejects an out-of-range integrations count", () => {
    const answers = { ...emptyAnswers(), complexity: "simple" as const, integrationsCount: 99 };
    expect(validateStep("details", answers, emptyContact()).integrationsCount).toBeDefined();
  });
});

describe("buildSubmitPayload", () => {
  it("maps state to the API contract and trims contact fields", () => {
    const answers = {
      ...emptyAnswers(),
      serviceKey: "automation" as const,
      complexity: "standard" as const,
      integrationsCount: 2,
      trainingNeed: "light" as const,
      projectDescription: "Relances clients",
    };
    const contact = {
      ...emptyContact(),
      fullName: "  Jane Doe  ",
      email: " jane@example.com ",
      consentAccepted: true,
    };

    expect(buildSubmitPayload(answers, contact)).toEqual({
      serviceKey: "automation",
      complexity: "standard",
      integrationsCount: 2,
      legacyTakeover: false,
      urgency: false,
      trainingNeed: "light",
      projectDescription: "Relances clients",
      fullName: "Jane Doe",
      email: "jane@example.com",
      company: "",
      phone: "",
      consentAccepted: true,
      honeypot: "",
    });
  });
});

describe("mapApiResultToResult", () => {
  it("maps a full success payload", () => {
    const result = mapApiResultToResult({
      id: 7,
      serviceKey: "automation",
      minimumAmount: 1500,
      maximumAmount: 3500,
      calculationDetail: [{ label: "Base", impactMin: 800, impactMax: 2500 }],
      summary: "Synthèse",
      recommendedScope: ["Cadrer"],
      missingQuestions: ["Volume ?"],
      riskFlags: [],
      disclaimer: "Estimation indicative, non contractuelle.",
    });

    expect(result.id).toBe(7);
    expect(result.minimumAmount).toBe(1500);
    expect(result.calculationDetail).toHaveLength(1);
    expect(result.riskFlags).toEqual([]);
  });

  it("falls back to safe defaults on a partial payload", () => {
    const result = mapApiResultToResult({ id: 1, minimumAmount: 900 });

    expect(result.maximumAmount).toBe(0);
    expect(result.recommendedScope).toEqual([]);
    expect(result.disclaimer).toContain("indicative");
  });
});

describe("step navigation state", () => {
  it("keeps previously entered answers when moving back and forth", () => {
    const answers = {
      ...emptyAnswers(),
      serviceKey: "wordpress" as const,
      complexity: "complexe" as const,
      projectDescription: "Refonte de la boutique",
    };

    validateStep("need", answers, emptyContact());
    validateStep("details", answers, emptyContact());
    validateStep("need", answers, emptyContact());

    expect(answers.serviceKey).toBe("wordpress");
    expect(answers.complexity).toBe("complexe");
    expect(answers.projectDescription).toBe("Refonte de la boutique");
  });

  it("exposes exactly five known service keys", () => {
    expect(KNOWN_SERVICE_KEYS).toHaveLength(5);
  });
});
