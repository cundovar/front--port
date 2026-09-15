import type { ContentData, ProjectCard, ProjectStatus, QuoteServiceKey } from "../types";
import { KNOWN_OFFER_KEYS } from "../composables/useQuoteSimulator";

const contentSections = [
  "header",
  "hero",
  "about",
  "trust",
  "services",
  "problems",
  "process",
  "expertise",
  "availability",
  "stack",
  "ai",
  "teaching",
  "projects",
  "skills",
  "cta",
  "footer",
] as const;

const projectStatuses = ["draft", "published", "in_progress", "archived"] as const satisfies readonly ProjectStatus[];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const normalizeFaqs = (
  fallbackFaqs: ContentData["services"][number]["faqs"],
  incoming: unknown,
): ContentData["services"][number]["faqs"] => {
  if (!Array.isArray(incoming)) {
    return fallbackFaqs;
  }

  if (
    !incoming.every(
      (item) =>
        isRecord(item) && typeof item.question === "string" && typeof item.answer === "string",
    )
  ) {
    return fallbackFaqs;
  }

  return incoming.map((item) => ({
    question: item.question as string,
    answer: item.answer as string,
  }));
};

/**
 * Content already stored in production still carries the service keys used before
 * the catalog refonte. Merging them as-is would overwrite the new fallback keys and
 * break the "/devis?service=" preselection, so they are translated on read.
 */
const LEGACY_SERVICE_KEYS: Record<string, QuoteServiceKey> = {
  automation: "automatisation",
  "ai-assistant": "assistant-ia",
  "custom-tool": "outil-metier",
  wordpress: "site-vitrine",
};

export const normalizeServiceKey = (incoming: unknown, fallbackKey: QuoteServiceKey): QuoteServiceKey => {
  if (typeof incoming !== "string" || incoming.trim() === "") {
    return fallbackKey;
  }

  if (LEGACY_SERVICE_KEYS[incoming]) {
    return LEGACY_SERVICE_KEYS[incoming];
  }

  return KNOWN_OFFER_KEYS.includes(incoming as QuoteServiceKey) ? (incoming as QuoteServiceKey) : fallbackKey;
};

const normalizeServices = (base: ContentData["services"], incoming: unknown): ContentData["services"] => {
  if (!Array.isArray(incoming)) {
    return base;
  }

  return base.map((fallbackService, index) => {
    const incomingService = incoming[index];
    if (!isRecord(incomingService)) {
      return fallbackService;
    }

    const mergedService = mergeSection(
      fallbackService as unknown as Record<string, unknown>,
      incomingService,
    ) as unknown as ContentData["services"][number];

    const actionLabel = typeof incomingService.actionLabel === "string" ? incomingService.actionLabel : "";

    return {
      ...mergedService,
      serviceKey: normalizeServiceKey(incomingService.serviceKey, fallbackService.serviceKey),
      actionLabel: actionLabel.trim() ? actionLabel : fallbackService.actionLabel,
      faqs: normalizeFaqs(fallbackService.faqs, incomingService.faqs),
    };
  });
};

const mergeSection = <T extends Record<string, unknown>>(base: T, incoming: unknown): T => {
  if (!isRecord(incoming)) {
    return base;
  }

  return Object.entries(base).reduce<T>(
    (section, [key, fallbackValue]) => {
      const incomingValue = incoming[key];
      const fallbackType = Array.isArray(fallbackValue) ? "array" : typeof fallbackValue;
      const incomingType = Array.isArray(incomingValue) ? "array" : typeof incomingValue;

      if (incomingValue !== undefined && incomingValue !== null && incomingType === fallbackType) {
        return {
          ...section,
          [key]: incomingValue,
        };
      }

      return section;
    },
    { ...base },
  );
};

const normalizeSection = <T>(base: T, incoming: unknown): T => {
  if (Array.isArray(base)) {
    return Array.isArray(incoming) ? (incoming as T) : base;
  }

  if (isRecord(base)) {
    return mergeSection(base, incoming) as T;
  }

  return base;
};

export const normalizeContent = (base: ContentData, incoming: unknown): ContentData => {
  if (!isRecord(incoming)) {
    return base;
  }

  const normalized = contentSections.reduce<ContentData>(
    (content, sectionName) => ({
      ...content,
      [sectionName]:
        sectionName === "services"
          ? normalizeServices(content.services, incoming.services)
          : normalizeSection(content[sectionName], incoming[sectionName]),
    }),
    { ...base },
  );

  return {
    ...normalized,
    hero: {
      ...normalized.hero,
      primaryHref: base.hero.primaryHref === "/devis" ? "/devis" : normalized.hero.primaryHref,
    },
  };
};

const isProjectStatus = (value: unknown): value is ProjectStatus =>
  typeof value === "string" && projectStatuses.includes(value as ProjectStatus);

const normalizeStatus = (value: unknown): ProjectStatus => {
  if (value === "wip") {
    return "in_progress";
  }

  return isProjectStatus(value) ? value : "draft";
};

const nullableString = (value: unknown): string | null => (typeof value === "string" && value !== "" ? value : null);

const normalizeProject = (input: unknown): ProjectCard | null => {
  if (!isRecord(input) || typeof input.id !== "number") {
    return null;
  }

  const { name, stack, summary, bulletin, siteUrl } = input;
  if (
    typeof name !== "string" ||
    typeof stack !== "string" ||
    typeof summary !== "string" ||
    typeof bulletin !== "string" ||
    typeof siteUrl !== "string"
  ) {
    return null;
  }

  return {
    id: input.id,
    name,
    stack,
    summary,
    bulletin,
    siteUrl,
    repoUrl: nullableString(input.repoUrl),
    imageUrl: nullableString(input.imageUrl),
    duration: nullableString(input.duration),
    slug: typeof input.slug === "string" ? input.slug : String(input.id),
    status: normalizeStatus(input.status),
    clientProblem: nullableString(input.clientProblem),
    mission: nullableString(input.mission),
    solution: nullableString(input.solution),
    outcomes: Array.isArray(input.outcomes) ? input.outcomes.filter((item): item is string => typeof item === "string") : [],
    serviceTags: Array.isArray(input.serviceTags)
      ? input.serviceTags.filter((item): item is string => typeof item === "string")
      : [],
    featured: typeof input.featured === "boolean" ? input.featured : false,
    sortOrder: typeof input.sortOrder === "number" ? input.sortOrder : 0,
  };
};

export const normalizeProjects = (incoming: unknown, fallback: ProjectCard[]): ProjectCard[] => {
  if (!Array.isArray(incoming)) {
    return fallback;
  }

  const projects = incoming.map(normalizeProject).filter((project): project is ProjectCard => project !== null);

  return projects.length > 0 ? projects : fallback;
};
