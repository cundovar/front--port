import { computed, reactive, ref } from "vue";
import type {
  QuoteAnswers,
  QuoteCatalog,
  QuoteContact,
  QuoteEstimateResult,
  QuoteOffer,
  QuoteStep,
  QuoteSubmissionResult,
} from "../types";
import { api } from "../utils/api";

export const QUOTE_STEPS: QuoteStep[] = ["offer", "scope", "situation", "result"];

export const STEP_LABELS: Record<QuoteStep, string> = {
  offer: "Résultat recherché",
  scope: "Votre besoin",
  situation: "Votre situation",
  result: "Estimation",
};

export const PROJECT_STAGE_OPTIONS = [
  { value: "nouveau", label: "C’est un nouveau projet" },
  { value: "existant", label: "Quelque chose existe déjà" },
] as const;

export const CONTENT_OPTIONS = [
  { value: "pret", label: "Mes textes et images sont prêts" },
  { value: "a-rediger", label: "J’ai besoin qu’on rédige les contenus" },
  { value: "je-ne-sais-pas", label: "Je ne sais pas encore" },
] as const;

export const DEADLINE_OPTIONS = [
  { value: "flexible", label: "Pas de date imposée" },
  { value: "normal", label: "Dans les prochaines semaines" },
  { value: "prioritaire", label: "C’est urgent" },
] as const;

const MAX_DESCRIPTION_LENGTH = 600;

/**
 * Offer keys only — never amounts, which live solely in the backend catalog.
 * Used to build and validate the "/devis?service=" links from the homepage.
 */
export const KNOWN_OFFER_KEYS = [
  "site-vitrine",
  "automatisation",
  "assistant-ia",
  "refonte",
  "outil-metier",
] as const;

export const buildQuoteCtaHref = (offerKey: unknown): string =>
  typeof offerKey === "string" && (KNOWN_OFFER_KEYS as readonly string[]).includes(offerKey)
    ? `/devis?service=${offerKey}`
    : "/devis";

export const QUOTE_STATUS_LABELS: Record<string, string> = {
  new: "Nouvelle",
  reviewed: "Vue",
  qualified: "Qualifiée",
  archived: "Archivée",
};

export const quoteStatusLabel = (value: string): string => QUOTE_STATUS_LABELS[value] ?? value;

export const emptyAnswers = (): QuoteAnswers => ({
  offerKey: "",
  variantKey: "",
  optionKeys: [],
  projectStage: "nouveau",
  contentReadiness: "pret",
  deadline: "normal",
  projectDescription: "",
});

export const emptyContact = (): QuoteContact => ({
  fullName: "",
  email: "",
  company: "",
  phone: "",
  consent: false,
  honeypot: "",
});

export const findOffer = (catalog: QuoteCatalog | null, offerKey: string): QuoteOffer | null =>
  catalog?.offers.find((offer) => offer.key === offerKey) ?? null;

/** Only accept a ?service= value that the active catalog actually declares. */
export const resolvePreselectedOffer = (catalog: QuoteCatalog | null, queryValue: unknown): string =>
  typeof queryValue === "string" && findOffer(catalog, queryValue) ? queryValue : "";

/**
 * "Avez-vous vos textes et vos images ?" only makes sense for offers that ship
 * editorial content. The backend prices it the same way, from the same flag.
 */
export const offerAsksAboutContent = (offer: QuoteOffer | null): boolean =>
  offer !== null && offer.contentQuestion !== false;

/** After an offer change, drop the variant and options that belong to another offer. */
export const pruneIncompatibleAnswers = (catalog: QuoteCatalog | null, answers: QuoteAnswers): void => {
  const offer = findOffer(catalog, answers.offerKey);
  if (!offer) {
    answers.variantKey = "";
    answers.optionKeys = [];
    return;
  }

  if (!offer.variants.some((variant) => variant.key === answers.variantKey)) {
    answers.variantKey = "";
  }

  const allowed = offer.options.map((option) => option.key);
  answers.optionKeys = answers.optionKeys.filter((key) => allowed.includes(key));

  // The question is not asked for this offer: never carry a stale answer into the price.
  if (!offerAsksAboutContent(offer)) {
    answers.contentReadiness = "pret";
  }
};

export const validateStep = (
  step: QuoteStep,
  answers: QuoteAnswers,
  contact: QuoteContact,
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (step === "offer" && !answers.offerKey) {
    errors.offerKey = "Choisissez le résultat que vous recherchez.";
  }

  if (step === "scope" && !answers.variantKey) {
    errors.variantKey = "Choisissez la formule qui correspond le mieux.";
  }

  if (step === "situation" && answers.projectDescription.length > MAX_DESCRIPTION_LENGTH) {
    errors.projectDescription = `Limitez la description à ${MAX_DESCRIPTION_LENGTH} caractères.`;
  }

  return errors;
};

export const validateContact = (contact: QuoteContact): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!contact.fullName.trim()) {
    errors.fullName = "Indiquez votre nom.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())) {
    errors.email = "Indiquez un email valide.";
  }
  if (!contact.consent) {
    errors.consent = "Votre accord est nécessaire pour vous recontacter.";
  }

  return errors;
};

export const buildPreviewPayload = (answers: QuoteAnswers) => ({
  offerKey: answers.offerKey,
  variantKey: answers.variantKey,
  optionKeys: [...answers.optionKeys],
  projectStage: answers.projectStage,
  contentReadiness: answers.contentReadiness,
  deadline: answers.deadline,
  projectDescription: answers.projectDescription,
});

export const buildSubmitPayload = (answers: QuoteAnswers, contact: QuoteContact) => ({
  ...buildPreviewPayload(answers),
  fullName: contact.fullName.trim(),
  email: contact.email.trim(),
  company: contact.company.trim(),
  phone: contact.phone.trim(),
  consent: contact.consent,
  honeypot: contact.honeypot,
});

export type QuoteRequestState = "idle" | "loading" | "ready" | "error";

export const useQuoteSimulator = () => {
  const catalog = ref<QuoteCatalog | null>(null);
  const catalogState = ref<QuoteRequestState>("idle");

  const step = ref<QuoteStep>("offer");
  const answers = reactive<QuoteAnswers>(emptyAnswers());
  const contact = reactive<QuoteContact>(emptyContact());
  const errors = reactive<Record<string, string>>({});

  const previewState = ref<QuoteRequestState>("idle");
  const submitState = ref<QuoteRequestState>("idle");
  const feedback = ref("");

  const result = ref<QuoteEstimateResult | null>(null);
  const submission = ref<QuoteSubmissionResult | null>(null);

  const currentOffer = computed(() => findOffer(catalog.value, answers.offerKey));

  const replaceErrors = (next: Record<string, string>): void => {
    Object.keys(errors).forEach((key) => delete errors[key]);
    Object.assign(errors, next);
  };

  const loadCatalog = async (): Promise<void> => {
    catalogState.value = "loading";
    try {
      const response = await api.fetch("/api/quote-pricing");
      if (!response.ok) throw new Error();
      const data = await response.json();
      catalog.value = data.catalog as QuoteCatalog;
      catalogState.value = "ready";
    } catch {
      catalogState.value = "error";
    }
  };

  const selectOffer = (offerKey: string): void => {
    answers.offerKey = offerKey;
    pruneIncompatibleAnswers(catalog.value, answers);
  };

  const toggleOption = (optionKey: string): void => {
    const index = answers.optionKeys.indexOf(optionKey);
    if (index === -1) {
      answers.optionKeys.push(optionKey);
    } else {
      answers.optionKeys.splice(index, 1);
    }
  };

  const requestPreview = async (): Promise<boolean> => {
    previewState.value = "loading";
    feedback.value = "";
    try {
      const response = await api.fetch("/api/quote-estimates/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPreviewPayload(answers)),
      });

      if (!response.ok) {
        previewState.value = "error";
        feedback.value =
          response.status === 429
            ? "Trop de simulations depuis cette connexion. Réessayez dans quelques minutes."
            : "Le calcul a échoué. Vos réponses sont conservées, vous pouvez réessayer.";
        return false;
      }

      result.value = (await response.json()) as QuoteEstimateResult;
      previewState.value = "ready";
      return true;
    } catch {
      previewState.value = "error";
      feedback.value = "Le calcul a échoué. Vos réponses sont conservées, vous pouvez réessayer.";
      return false;
    }
  };

  const next = async (): Promise<boolean> => {
    const stepErrors = validateStep(step.value, answers, contact);
    replaceErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) return false;

    const index = QUOTE_STEPS.indexOf(step.value);
    const upcoming = QUOTE_STEPS[index + 1];
    if (!upcoming) return true;

    if (upcoming === "result" && !(await requestPreview())) {
      return false;
    }

    step.value = upcoming;
    return true;
  };

  const back = (): void => {
    const index = QUOTE_STEPS.indexOf(step.value);
    if (index > 0) {
      replaceErrors({});
      step.value = QUOTE_STEPS[index - 1];
    }
  };

  const submit = async (): Promise<boolean> => {
    const contactErrors = validateContact(contact);
    replaceErrors(contactErrors);
    if (Object.keys(contactErrors).length > 0) return false;

    submitState.value = "loading";
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
            ? "Trop d’envois depuis cette connexion. Réessayez dans quelques minutes."
            : "L’envoi a échoué. Vos réponses sont conservées, vous pouvez réessayer.";
        return false;
      }

      submission.value = (await response.json()) as QuoteSubmissionResult;
      submitState.value = "ready";
      return true;
    } catch {
      submitState.value = "error";
      feedback.value = "L’envoi a échoué. Vos réponses sont conservées, vous pouvez réessayer.";
      return false;
    }
  };

  return {
    catalog,
    catalogState,
    loadCatalog,
    step,
    answers,
    contact,
    errors,
    currentOffer,
    previewState,
    submitState,
    feedback,
    result,
    submission,
    selectOffer,
    toggleOption,
    requestPreview,
    next,
    back,
    submit,
  };
};
