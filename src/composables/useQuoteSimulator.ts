import { computed, reactive, ref } from "vue";
import type {
  QuoteAnswers,
  QuoteCatalog,
  QuoteContact,
  QuoteEstimateResult,
  QuoteOffer,
  QuotePricingMode,
  QuoteProposal,
  QuoteRecommendation,
  QuoteStep,
  QuoteSubmissionResult,
} from "../types";
import { api } from "../utils/api";

export const QUOTE_STEPS: QuoteStep[] = ["offer", "need", "scope", "result"];

export const STEP_LABELS: Record<QuoteStep, string> = {
  offer: "Résultat recherché",
  need: "Votre besoin",
  scope: "Votre solution",
  result: "Estimation",
};

/**
 * Below this, a description says nothing the structured answers do not already
 * say, so no paid call is made. Mirrors the server rule.
 */
export const MIN_RECOMMENDATION_LENGTH = 30;

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

export const canBeAnalysed = (description: string): boolean =>
  description.trim().length >= MIN_RECOMMENDATION_LENGTH;

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
  toolKeys: [],
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

  if (step === "need" && answers.projectDescription.length > MAX_DESCRIPTION_LENGTH) {
    errors.projectDescription = `Limitez la description à ${MAX_DESCRIPTION_LENGTH} caractères.`;
  }

  if (step === "scope" && !answers.variantKey) {
    errors.variantKey = "Choisissez la formule qui correspond le mieux.";
  }

  return errors;
};

/**
 * A failed submission must stay reportable: the bare "l’envoi a échoué" hid
 * whether the server refused the payload, crashed, or never answered at all.
 * `status` is 0 when the request never got a response.
 */
export const submitErrorMessage = (status: number): string => {
  if (status === 429) {
    return "Trop d’envois depuis cette connexion. Réessayez dans quelques minutes.";
  }

  if (status === 0) {
    return "Le serveur n’a pas répondu. Vérifiez votre connexion, puis réessayez : vos réponses sont conservées.";
  }

  return `L’envoi a échoué (erreur ${status}). Vos réponses sont conservées, vous pouvez réessayer.`;
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

export const buildRecommendationPayload = (answers: QuoteAnswers) => ({
  offerKey: answers.offerKey,
  projectDescription: answers.projectDescription.trim(),
  toolKeys: [...answers.toolKeys],
  projectStage: answers.projectStage,
  contentReadiness: answers.contentReadiness,
  deadline: answers.deadline,
});

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
  // The server freezes the tools in the saved estimate: omitting them here left
  // "Outils déjà utilisés" empty in the email and in the backoffice.
  toolKeys: [...answers.toolKeys],
  fullName: contact.fullName.trim(),
  email: contact.email.trim(),
  company: contact.company.trim(),
  phone: contact.phone.trim(),
  consent: contact.consent,
  honeypot: contact.honeypot,
});

export type QuoteRequestState = "idle" | "loading" | "ready" | "error";

/** Recommendation is optional: "skipped" and "unavailable" are normal outcomes. */
export type QuoteRecommendationState = "idle" | "loading" | "ready" | "skipped" | "unavailable";

/**
 * Keys the AI put forward, all tiers merged. Used to badge the manual list;
 * the client still ticks whatever they want.
 */
export const suggestedKeys = (proposals: QuoteProposal[]): string[] => {
  const keys: string[] = [];

  proposals.forEach((proposal) => {
    [proposal.variantKey, ...proposal.optionKeys].forEach((key) => {
      if (key && !keys.includes(key)) keys.push(key);
    });
  });

  return keys;
};

/** First justification found for a key, or "" when the model gave none. */
export const reasonForKey = (proposals: QuoteProposal[], key: string): string => {
  for (const proposal of proposals) {
    const reason = proposal.reasons?.[key];
    if (typeof reason === "string" && reason.trim() !== "") return reason;
  }

  return "";
};

/** Copies a proposal into the editable answers: the client keeps the last word. */
export const applyProposalToAnswers = (proposal: QuoteProposal, answers: QuoteAnswers): void => {
  answers.variantKey = proposal.variantKey;
  answers.optionKeys = [...proposal.optionKeys];
};

export const formatQuoteAmount = (amount: number): string =>
  `${new Intl.NumberFormat("fr-FR").format(amount)} €`;

/**
 * Price split in two, so a long prefix never pushes the currency onto its own
 * line: the prefix is rendered small, the amount large.
 */
export const quotePriceParts = (
  minimumAmount: number,
  maximumAmount: number,
  mode: QuotePricingMode,
): { prefix: string; amount: string } => {
  if (mode === "range" && minimumAmount !== maximumAmount) {
    return { prefix: "", amount: `${formatQuoteAmount(minimumAmount)} – ${formatQuoteAmount(maximumAmount)}` };
  }

  return {
    prefix: mode === "from" ? "À partir de" : "",
    amount: formatQuoteAmount(minimumAmount),
  };
};

/** Single-string form, for contexts with no room for two lines. */
export const formatQuotePrice = (
  minimumAmount: number,
  maximumAmount: number,
  mode: QuotePricingMode,
): string => {
  if (mode === "range" && minimumAmount !== maximumAmount) {
    return `${formatQuoteAmount(minimumAmount)} – ${formatQuoteAmount(maximumAmount)}`;
  }

  return mode === "from"
    ? `à partir de ${formatQuoteAmount(minimumAmount)}`
    : formatQuoteAmount(minimumAmount);
};

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

  const recommendationState = ref<QuoteRecommendationState>("idle");
  const proposals = ref<QuoteProposal[]>([]);
  const recommendationSummary = ref("");
  /** Guards against a slow answer landing after the client changed offer. */
  let recommendationToken = 0;

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
    if (answers.offerKey !== offerKey) {
      resetRecommendation();
    }
    answers.offerKey = offerKey;
    pruneIncompatibleAnswers(catalog.value, answers);
  };

  const toggleTool = (toolKey: string): void => {
    const index = answers.toolKeys.indexOf(toolKey);
    if (index === -1) {
      answers.toolKeys.push(toolKey);
    } else {
      answers.toolKeys.splice(index, 1);
    }
  };

  const resetRecommendation = (): void => {
    recommendationToken += 1;
    proposals.value = [];
    recommendationSummary.value = "";
    recommendationState.value = "idle";
  };

  /**
   * Fire and forget: the scope screen is already usable, so a slow, failing or
   * rate-limited answer must never hold the journey.
   */
  const requestRecommendation = async (): Promise<void> => {
    if (!canBeAnalysed(answers.projectDescription)) {
      resetRecommendation();
      recommendationState.value = "skipped";
      return;
    }

    recommendationToken += 1;
    const token = recommendationToken;
    recommendationState.value = "loading";

    try {
      const response = await api.fetch("/api/quote-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildRecommendationPayload(answers)),
      });

      if (token !== recommendationToken) return;

      if (!response.ok) {
        recommendationState.value = "unavailable";
        return;
      }

      const data = (await response.json()) as QuoteRecommendation;
      if (token !== recommendationToken) return;

      proposals.value = data.proposals ?? [];
      recommendationSummary.value = data.summary ?? "";
      recommendationState.value = proposals.value.length > 0 ? "ready" : "unavailable";
    } catch {
      if (token === recommendationToken) recommendationState.value = "unavailable";
    }
  };

  const chooseProposal = (proposal: QuoteProposal): void => {
    applyProposalToAnswers(proposal, answers);
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

    // Not awaited on purpose: the scope screen is rendered and usable right away.
    if (upcoming === "scope") {
      void requestRecommendation();
    }

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
        feedback.value = submitErrorMessage(response.status);
        return false;
      }

      submission.value = (await response.json()) as QuoteSubmissionResult;
      submitState.value = "ready";
      return true;
    } catch {
      submitState.value = "error";
      feedback.value = submitErrorMessage(0);
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
    toggleTool,
    recommendationState,
    proposals,
    recommendationSummary,
    requestRecommendation,
    chooseProposal,
    requestPreview,
    next,
    back,
    submit,
  };
};
