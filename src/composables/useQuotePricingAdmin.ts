import { computed, ref } from "vue";
import type { QuoteCatalog, QuoteCatalogError, QuoteOffer, QuotePricingMode, QuoteVariant } from "../types";
import { api } from "../utils/api";

export type QuotePricingAdminState = "idle" | "loading" | "ready" | "error";

export const PRICING_MODES: { value: QuotePricingMode; label: string; help: string }[] = [
  { value: "fixed", label: "Prix ferme", help: "Un montant unique, engagé pour le contenu listé." },
  { value: "from", label: "À partir de", help: "Un montant de départ ; la suite est chiffrée à part." },
  { value: "range", label: "Fourchette", help: "Deux bornes, quand le périmètre ne peut pas être engagé." },
];

/** Modes that commit to one amount, and therefore forbid any range downstream. */
const SINGLE_AMOUNT_MODES: QuotePricingMode[] = ["fixed", "from"];

export const commitsToASingleAmount = (offer: QuoteOffer | null | undefined): boolean =>
  (offer?.variants ?? []).some((variant) => SINGLE_AMOUNT_MODES.includes(variant.pricingMode));

/** Deep copy so an abandoned draft never mutates the catalog last confirmed by the server. */
export const cloneCatalog = (catalog: QuoteCatalog): QuoteCatalog =>
  JSON.parse(JSON.stringify(catalog)) as QuoteCatalog;

/**
 * Amounts arrive from <input type="number"> as strings or, when emptied, as "".
 * Anything unreadable becomes NaN so validation reports it instead of silently saving 0.
 */
export const parseAmount = (value: unknown): number => {
  if (typeof value === "number") return value;
  if (typeof value !== "string" || value.trim() === "") return Number.NaN;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : Number.NaN;
};

const isBlank = (value: unknown): boolean => typeof value !== "string" || value.trim() === "";

const rangeErrors = (item: { minimumAmount: unknown; maximumAmount: unknown }, path: string): QuoteCatalogError[] => {
  const errors: QuoteCatalogError[] = [];
  const min = parseAmount(item.minimumAmount);
  const max = parseAmount(item.maximumAmount);

  if (!Number.isInteger(min) || min < 0) {
    errors.push({ path: `${path}.minimumAmount`, message: "Montant entier positif attendu." });
  }
  if (!Number.isInteger(max) || max < 0) {
    errors.push({ path: `${path}.maximumAmount`, message: "Montant entier positif attendu." });
  }
  if (errors.length === 0 && min > max) {
    errors.push({ path: `${path}.maximumAmount`, message: "Le maximum doit être supérieur ou égal au minimum." });
  }

  return errors;
};

const singleAmountErrors = (
  item: { minimumAmount: unknown; maximumAmount: unknown },
  path: string,
): QuoteCatalogError[] => {
  const min = parseAmount(item.minimumAmount);
  const max = parseAmount(item.maximumAmount);

  if (!Number.isInteger(min) || !Number.isInteger(max) || min === max) return [];

  return [{
    path: `${path}.maximumAmount`,
    message: "Un prix ferme ou « à partir de » attend un montant unique : minimum et maximum doivent être égaux.",
  }];
};

const variantContractErrors = (variant: QuoteVariant, path: string): QuoteCatalogError[] => {
  const errors: QuoteCatalogError[] = [];

  if (!SINGLE_AMOUNT_MODES.includes(variant.pricingMode) && variant.pricingMode !== "range") {
    errors.push({ path: `${path}.pricingMode`, message: "Mode attendu : fixe, à partir de, ou fourchette." });
  } else if (SINGLE_AMOUNT_MODES.includes(variant.pricingMode)) {
    errors.push(...singleAmountErrors(variant, path));
  }

  const priority = parseAmount(variant.priorityAmount);
  if (!Number.isInteger(priority) || priority < 0) {
    errors.push({ path: `${path}.priorityAmount`, message: "Supplément entier positif attendu (0 si aucun)." });
  }

  return errors;
};

const pricedItemErrors = (
  item: { key: unknown; label: unknown; minimumAmount: unknown; maximumAmount: unknown },
  path: string,
  seenKeys: string[],
): QuoteCatalogError[] => {
  const errors: QuoteCatalogError[] = [];

  if (isBlank(item.label)) {
    errors.push({ path: `${path}.label`, message: "Champ texte requis." });
  }
  if (isBlank(item.key)) {
    errors.push({ path: `${path}.key`, message: "Champ texte requis." });
  } else if (seenKeys.includes(item.key as string)) {
    errors.push({ path: `${path}.key`, message: "Clé en double." });
  } else {
    seenKeys.push(item.key as string);
  }

  return [...errors, ...rangeErrors(item, path)];
};

/**
 * Mirrors the server rules so a mistake is caught before the request. The server
 * stays the authority: its own errors are merged into the same map on save.
 */
export const validateCatalogDraft = (catalog: QuoteCatalog): QuoteCatalogError[] => {
  const errors: QuoteCatalogError[] = [];

  if (!Array.isArray(catalog.offers) || catalog.offers.length === 0) {
    return [{ path: "offers", message: "Au moins une offre est requise." }];
  }

  const offerKeys: string[] = [];
  catalog.offers.forEach((offer, index) => {
    const path = `offers.${index}`;

    if (isBlank(offer.label)) {
      errors.push({ path: `${path}.label`, message: "Champ texte requis." });
    }
    if (isBlank(offer.key)) {
      errors.push({ path: `${path}.key`, message: "Champ texte requis." });
    } else if (offerKeys.includes(offer.key)) {
      errors.push({ path: `${path}.key`, message: "Clé d’offre en double." });
    } else {
      offerKeys.push(offer.key);
    }

    if (!Array.isArray(offer.variants) || offer.variants.length === 0) {
      errors.push({ path: `${path}.variants`, message: "Au moins une variante est requise." });
    } else {
      const variantKeys: string[] = [];
      offer.variants.forEach((variant, variantIndex) => {
        const variantPath = `${path}.variants.${variantIndex}`;
        errors.push(...pricedItemErrors(variant, variantPath, variantKeys));
        errors.push(...variantContractErrors(variant, variantPath));
      });
    }

    const optionKeys: string[] = [];
    const commits = commitsToASingleAmount(offer);

    (offer.options ?? []).forEach((option, optionIndex) => {
      const optionPath = `${path}.options.${optionIndex}`;
      errors.push(...pricedItemErrors(option, optionPath, optionKeys));

      // A committed pack plus a ranged option would silently become a range again.
      if (commits) errors.push(...singleAmountErrors(option, optionPath));
    });
  });

  errors.push(...namedListErrors(catalog.tools ?? [], "tools"));
  errors.push(...namedListErrors(catalog.stacks ?? [], "stacks"));

  if (catalog.adjustments?.contentWriting) {
    errors.push(...rangeErrors(catalog.adjustments.contentWriting, "adjustments.contentWriting"));

    if ((catalog.offers ?? []).some(commitsToASingleAmount)) {
      errors.push(...singleAmountErrors(catalog.adjustments.contentWriting, "adjustments.contentWriting"));
    }
  } else {
    errors.push({ path: "adjustments.contentWriting", message: "Ajustement requis." });
  }

  return errors;
};

/** Tools and stacks share one contract: a key, a label, no duplicate, no amount. */
const namedListErrors = (
  items: { key: unknown; label: unknown }[],
  root: "tools" | "stacks",
): QuoteCatalogError[] => {
  const errors: QuoteCatalogError[] = [];
  const seen: string[] = [];

  items.forEach((item, index) => {
    const path = `${root}.${index}`;

    if (isBlank(item.label)) errors.push({ path: `${path}.label`, message: "Champ texte requis." });

    if (isBlank(item.key)) {
      errors.push({ path: `${path}.key`, message: "Champ texte requis." });
    } else if (seen.includes(item.key as string)) {
      errors.push({ path: `${path}.key`, message: "Clé en double." });
    } else {
      seen.push(item.key as string);
    }
  });

  return errors;
};

/** Last message wins so a server error replaces the local one on the same field. */
export const indexErrors = (errors: QuoteCatalogError[]): Record<string, string> =>
  errors.reduce<Record<string, string>>((map, error) => {
    map[error.path] = error.message;
    return map;
  }, {});

/**
 * Turns "offers.2.variants.1.maximumAmount" into a sentence an administrator can
 * act on, for server errors whose field may not be on screen.
 */
export const describeErrorPath = (catalog: QuoteCatalog, path: string): string => {
  const segments = path.split(".");
  if (segments[0] === "adjustments") {
    return segments[1] === "priorityDelay" ? "Ajustement · délai prioritaire" : "Ajustement · rédaction des contenus";
  }

  const offer = catalog.offers?.[Number(segments[1])];
  if (!offer) return path;
  if (segments.length <= 3) return offer.label || offer.key;

  const collection = segments[2] === "variants" ? offer.variants : offer.options;
  const item = collection?.[Number(segments[3])];
  const itemLabel = item?.label || item?.key || `#${Number(segments[3]) + 1}`;

  return `${offer.label || offer.key} · ${itemLabel}`;
};

/** Amounts are normalised to integers so the JSON sent matches what the server validates. */
export const buildCatalogPayload = (catalog: QuoteCatalog): { catalog: QuoteCatalog } => {
  const copy = cloneCatalog(catalog);

  copy.offers.forEach((offer) => {
    [...offer.variants, ...(offer.options ?? [])].forEach((item) => {
      item.minimumAmount = parseAmount(item.minimumAmount);
      item.maximumAmount = parseAmount(item.maximumAmount);
    });

    offer.variants.forEach((variant) => {
      variant.priorityAmount = parseAmount(variant.priorityAmount);
      // A committed mode must leave with one amount, whichever field was edited last.
      if (SINGLE_AMOUNT_MODES.includes(variant.pricingMode)) {
        variant.maximumAmount = variant.minimumAmount;
      }
    });
  });

  copy.adjustments.contentWriting.minimumAmount = parseAmount(copy.adjustments.contentWriting.minimumAmount);
  copy.adjustments.contentWriting.maximumAmount = parseAmount(copy.adjustments.contentWriting.maximumAmount);

  return { catalog: copy };
};

export const useQuotePricingAdmin = () => {
  const state = ref<QuotePricingAdminState>("idle");
  const draft = ref<QuoteCatalog | null>(null);
  const version = ref(0);
  const updatedAt = ref("");
  const selectedOfferKey = ref("");
  const errors = ref<Record<string, string>>({});
  const feedback = ref("");
  const globalError = ref("");
  const saving = ref(false);

  const currentOffer = computed<QuoteOffer | null>(
    () => draft.value?.offers.find((offer) => offer.key === selectedOfferKey.value) ?? null,
  );

  const load = async (): Promise<void> => {
    state.value = "loading";
    globalError.value = "";
    try {
      const response = await api.fetch("/api/admin/quote-pricing", { credentials: "include" });
      if (!response.ok) throw new Error();
      const data = await response.json();
      draft.value = cloneCatalog(data.catalog);
      version.value = data.version ?? 0;
      updatedAt.value = data.updatedAt ?? "";
      selectedOfferKey.value = draft.value.offers[0]?.key ?? "";
      errors.value = {};
      state.value = "ready";
    } catch {
      state.value = "error";
      globalError.value = "Impossible de charger la grille tarifaire.";
    }
  };

  const save = async (): Promise<void> => {
    if (!draft.value) return;

    feedback.value = "";
    globalError.value = "";

    const localErrors = validateCatalogDraft(draft.value);
    if (localErrors.length > 0) {
      errors.value = indexErrors(localErrors);
      globalError.value = "Corrigez les champs signalés avant d’enregistrer.";
      return;
    }

    errors.value = {};
    saving.value = true;
    try {
      const response = await api.fetch("/api/admin/quote-pricing", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildCatalogPayload(draft.value)),
      });

      if (response.status === 422) {
        const data = await response.json();
        // The draft stays on screen: only the server's field messages are added.
        errors.value = indexErrors(data.errors ?? []);
        globalError.value = "La grille a été refusée. Corrigez les champs signalés.";
        return;
      }

      if (!response.ok) throw new Error();

      const data = await response.json();
      version.value = data.version ?? version.value;
      updatedAt.value = data.updatedAt ?? updatedAt.value;
      feedback.value = `Grille enregistrée (version ${version.value}). Les prochaines estimations l’utilisent immédiatement.`;
    } catch {
      globalError.value = "L’enregistrement a échoué. Vos modifications sont conservées.";
    } finally {
      saving.value = false;
    }
  };

  return {
    state,
    draft,
    version,
    updatedAt,
    selectedOfferKey,
    currentOffer,
    errors,
    feedback,
    globalError,
    saving,
    load,
    save,
  };
};
