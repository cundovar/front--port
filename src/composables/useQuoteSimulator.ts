import { reactive, ref } from "vue";
import type {
  QuoteAnswers,
  QuoteComplexity,
  QuoteContact,
  QuoteEstimateResult,
  QuoteServiceKey,
  QuoteStep,
  QuoteTrainingNeed,
} from "../types";
import { api } from "../utils/api";

export const KNOWN_SERVICE_KEYS: QuoteServiceKey[] = [
  "automation",
  "ai-assistant",
  "refonte",
  "custom-tool",
  "wordpress",
];

export const QUOTE_STEPS: QuoteStep[] = ["need", "details", "contact", "result"];

export const SERVICE_LABELS: Record<QuoteServiceKey, string> = {
  automation: "Automatiser une tâche répétitive",
  "ai-assistant": "Assistant IA pour votre activité",
  refonte: "Reprendre un site ou une application",
  "custom-tool": "Créer un outil web sur mesure",
  wordpress: "Améliorer un site WordPress",
};

export const COMPLEXITY_LABELS: Record<QuoteComplexity, string> = {
  simple: "Simple — un besoin bien cadré",
  standard: "Standard — quelques cas particuliers",
  complexe: "Complexe — plusieurs systèmes à relier",
};

export const TRAINING_LABELS: Record<QuoteTrainingNeed, string> = {
  none: "Aucun accompagnement",
  light: "Prise en main légère",
  full: "Formation et suivi complets",
};

export const QUOTE_STATUS_LABELS: Record<string, string> = {
  new: "Nouvelle",
  reviewed: "Vue",
  qualified: "Qualifiée",
  archived: "Archivée",
};

export const quoteStatusLabel = (value: string): string => QUOTE_STATUS_LABELS[value] ?? value;

export const quoteServiceLabel = (value: string): string =>
  SERVICE_LABELS[value as QuoteServiceKey] ?? value;

/** Builds the CTA target for a service offer, refusing anything outside the catalog. */
export const buildQuoteCtaHref = (serviceKey: unknown): string => {
  const resolved = resolvePreselectedService(serviceKey);
  return resolved ? `/devis?service=${resolved}` : "/devis";
};

const MAX_DESCRIPTION_LENGTH = 600;

export const emptyAnswers = (): QuoteAnswers => ({
  serviceKey: "",
  complexity: "",
  integrationsCount: 0,
  legacyTakeover: false,
  urgency: false,
  trainingNeed: "none",
  projectDescription: "",
});

export const emptyContact = (): QuoteContact => ({
  fullName: "",
  email: "",
  company: "",
  phone: "",
  honeypot: "",
});

/** Only ever trust a ?service= value that matches the known catalog. */
export const resolvePreselectedService = (queryValue: unknown): QuoteServiceKey | "" => {
  if (typeof queryValue !== "string") return "";
  return KNOWN_SERVICE_KEYS.includes(queryValue as QuoteServiceKey)
    ? (queryValue as QuoteServiceKey)
    : "";
};

/** Validates only the active step, so other steps' answers are never touched. */
export const validateStep = (
  step: QuoteStep,
  answers: QuoteAnswers,
  contact: QuoteContact,
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (step === "need" && !resolvePreselectedService(answers.serviceKey)) {
    errors.serviceKey = "Choisissez le type de besoin.";
  }

  if (step === "details") {
    if (!answers.complexity) {
      errors.complexity = "Indiquez la complexité estimée.";
    }
    if (answers.integrationsCount < 0 || answers.integrationsCount > 20) {
      errors.integrationsCount = "Indiquez un nombre entre 0 et 20.";
    }
    if (answers.projectDescription.length > MAX_DESCRIPTION_LENGTH) {
      errors.projectDescription = `Limitez la description à ${MAX_DESCRIPTION_LENGTH} caractères.`;
    }
  }

  if (step === "contact") {
    if (!contact.fullName.trim()) {
      errors.fullName = "Indiquez votre nom.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())) {
      errors.email = "Indiquez un email valide.";
    }
  }

  return errors;
};

export const buildSubmitPayload = (answers: QuoteAnswers, contact: QuoteContact) => ({
  serviceKey: answers.serviceKey,
  complexity: answers.complexity,
  integrationsCount: answers.integrationsCount,
  legacyTakeover: answers.legacyTakeover,
  urgency: answers.urgency,
  trainingNeed: answers.trainingNeed,
  projectDescription: answers.projectDescription,
  fullName: contact.fullName.trim(),
  email: contact.email.trim(),
  company: contact.company.trim(),
  phone: contact.phone.trim(),
  honeypot: contact.honeypot,
});

export const mapApiResultToResult = (data: unknown): QuoteEstimateResult => {
  const raw = (data ?? {}) as Record<string, unknown>;
  const asStringList = (value: unknown): string[] =>
    Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

  return {
    id: typeof raw.id === "number" ? raw.id : 0,
    serviceKey: (raw.serviceKey as QuoteServiceKey) ?? "automation",
    minimumAmount: typeof raw.minimumAmount === "number" ? raw.minimumAmount : 0,
    maximumAmount: typeof raw.maximumAmount === "number" ? raw.maximumAmount : 0,
    calculationDetail: Array.isArray(raw.calculationDetail)
      ? (raw.calculationDetail as QuoteEstimateResult["calculationDetail"])
      : [],
    summary: typeof raw.summary === "string" ? raw.summary : "",
    recommendedScope: asStringList(raw.recommendedScope),
    missingQuestions: asStringList(raw.missingQuestions),
    riskFlags: asStringList(raw.riskFlags),
    disclaimer:
      typeof raw.disclaimer === "string"
        ? raw.disclaimer
        : "Estimation indicative, non contractuelle.",
  };
};

export type QuoteSubmitState = "idle" | "submitting" | "success" | "error";

export const useQuoteSimulator = () => {
  const step = ref<QuoteStep>("need");
  const answers = reactive<QuoteAnswers>(emptyAnswers());
  const contact = reactive<QuoteContact>(emptyContact());
  const errors = reactive<Record<string, string>>({});
  const submitState = ref<QuoteSubmitState>("idle");
  const feedback = ref("");
  const result = ref<QuoteEstimateResult | null>(null);

  const replaceErrors = (next: Record<string, string>): void => {
    Object.keys(errors).forEach((key) => delete errors[key]);
    Object.assign(errors, next);
  };

  const preselectService = (queryValue: unknown): void => {
    const preselected = resolvePreselectedService(queryValue);
    if (preselected) {
      answers.serviceKey = preselected;
    }
  };

  const goTo = (next: QuoteStep): void => {
    step.value = next;
  };

  const back = (): void => {
    const index = QUOTE_STEPS.indexOf(step.value);
    if (index > 0) {
      replaceErrors({});
      goTo(QUOTE_STEPS[index - 1]);
    }
  };

  const next = (): boolean => {
    const stepErrors = validateStep(step.value, answers, contact);
    replaceErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) {
      return false;
    }

    const index = QUOTE_STEPS.indexOf(step.value);
    if (index < QUOTE_STEPS.length - 1) {
      goTo(QUOTE_STEPS[index + 1]);
    }
    return true;
  };

  const submit = async (): Promise<boolean> => {
    const stepErrors = validateStep("contact", answers, contact);
    replaceErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) {
      return false;
    }

    submitState.value = "submitting";
    feedback.value = "";

    try {
      const response = await api.fetch("/api/quote-estimates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildSubmitPayload(answers, contact)),
      });

      if (!response.ok) {
        submitState.value = "error";
        feedback.value =
          response.status === 429
            ? "Trop de simulations depuis cette connexion. Réessayez dans quelques minutes."
            : "L’envoi a échoué. Vos réponses sont conservées, vous pouvez réessayer.";
        return false;
      }

      result.value = mapApiResultToResult(await response.json());
      submitState.value = "success";
      goTo("result");
      return true;
    } catch {
      submitState.value = "error";
      feedback.value = "L’envoi a échoué. Vos réponses sont conservées, vous pouvez réessayer.";
      return false;
    }
  };

  return {
    step,
    answers,
    contact,
    errors,
    submitState,
    feedback,
    result,
    preselectService,
    back,
    next,
    submit,
  };
};
