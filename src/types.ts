// === HEADER ===
export interface HeaderContent {
  logoText: string;
  logoUrl: string | null;
  contactEmail: string;
  siteUrl: string;
}

// === HERO ===
export interface HeroContent {
  title: string;
  tagline: string;
  subtitle: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  proofItems: string[];
}

// === ABOUT ===
export interface AboutContent {
  title: string;
  subtitle: string;
  bio: string;
  location: string;
  locationMapUrl: string;
}

// === TRUST ===
export interface TrustContent {
  items: string[];
}

// === SERVICES ===
export interface ServiceFaqItem {
  question: string;
  answer: string;
}

export interface ServiceOffer {
  serviceKey: QuoteServiceKey;
  title: string;
  promise: string;
  problems: string[];
  deliverables: string[];
  technologies?: string[];
  actionLabel: string;
  faqs: ServiceFaqItem[];
}

export interface ProblemContent {
  title: string;
  description: string;
}

export interface ProcessStep {
  title: string;
  description: string;
}

export interface ExpertiseItem {
  title: string;
  description: string;
}

export interface AvailabilityContent {
  title: string;
  subtitle: string;
  items: string[];
}

// === AI ===
export interface AiToolItem {
  name: string;
  role: string;
  description: string;
}

export interface AiContent {
  title: string;
  subtitle: string;
  items: AiToolItem[];
}

// === STACK ===
export interface StackContent {
  title: string;
  subtitle: string;
  items: string[];
}

// === TEACHING ===
export interface TeachingItem {
  name: string;
  topics: string[];
}

export interface TeachingContent {
  title: string;
  subtitle: string;
  items: TeachingItem[];
}

// === PROJECTS ===
export type ProjectStatus = "draft" | "published" | "in_progress" | "archived";

export interface ProjectCard {
  id: number;
  slug: string;
  name: string;
  stack: string;
  summary: string;
  bulletin: string;
  siteUrl: string;
  repoUrl?: string | null;
  imageUrl?: string | null;
  duration?: string | null;
  status: ProjectStatus;
  clientProblem?: string | null;
  mission?: string | null;
  solution?: string | null;
  outcomes: string[];
  serviceTags: string[];
  featured: boolean;
  sortOrder: number;
}

export interface ProjectsContent {
  title: string;
  subtitle: string;
  items?: ProjectCard[];
}

// === COMMENTS ===
export type CommentStatus = "pending" | "approved" | "rejected";

export interface StudentComment {
  id: string;
  authorName: string;
  authorRole: string;
  content: string;
  status: CommentStatus;
  createdAt: string;
}

// === SKILLS ===
export interface SkillEvidence {
  label: string;
  value: string;
}

export interface SkillDetail {
  label: string;
  value: string;
}

export interface SkillsContent {
  title: string;
  subtitle: string;
  summary: string;
  evidence: SkillEvidence[];
  topSkills?: SkillDetail[];
  hiddenSkills?: SkillDetail[];
  generatedAt?: string;
}

// === CTA ===
export interface CtaContent {
  title: string;
  subtitle: string;
  primaryLabel: string;
  secondaryLabel: string;
}

// === FOOTER ===
export interface FooterLink {
  label: string;
  url: string;
}

export interface FooterContent {
  tagline: string;
  links: FooterLink[];
}

// === CONTENT DATA (structure principale) ===
export interface ContentData {
  header: HeaderContent;
  hero: HeroContent;
  about: AboutContent;
  trust: TrustContent;
  services: ServiceOffer[];
  problems: ProblemContent[];
  process: ProcessStep[];
  expertise: ExpertiseItem[];
  availability: AvailabilityContent;
  stack: StackContent;
  ai: AiContent;
  teaching: TeachingContent;
  projects: ProjectsContent;
  skills: SkillsContent;
  cta: CtaContent;
  footer: FooterContent;
}

/** Offer families of the pricing catalog. Amounts stay server-side. */
export type QuoteServiceKey =
  | "site-vitrine"
  | "automatisation"
  | "assistant-ia"
  | "refonte"
  | "outil-metier";

export type QuoteProjectStage = "nouveau" | "existant";
export type QuoteContentReadiness = "pret" | "a-rediger" | "je-ne-sais-pas";
export type QuoteDeadline = "flexible" | "normal" | "prioritaire";
export type QuoteStep = "offer" | "need" | "scope" | "result";

export interface QuotePricedItem {
  key: string;
  label: string;
  minimumAmount: number;
  maximumAmount: number;
}

/**
 * fixed : one committed amount · from : a starting amount · range : two bounds.
 * fixed and from always carry minimumAmount === maximumAmount.
 */
export type QuotePricingMode = "fixed" | "from" | "range";

export interface QuoteVariant extends QuotePricedItem {
  includes: string[];
  pricingMode: QuotePricingMode;
  /** Flat supplement for a priority deadline, never a multiplier. */
  priorityAmount: number;
  /** Stack keys this formula answers, so picking one preselects it. */
  stackKeys?: string[];
}

/** Tool the visitor can tick. Context for the AI only: it never carries an amount. */
export interface QuoteTool {
  key: string;
  label: string;
}

export interface QuoteOffer {
  key: string;
  label: string;
  summary?: string;
  /** False for offers with no editorial content (automation, AI assistant, custom tool). */
  contentQuestion?: boolean;
  variants: QuoteVariant[];
  options: QuotePricedItem[];
}

export interface QuoteCatalog {
  offers: QuoteOffer[];
  tools: QuoteTool[];
  /** Asked only when something already exists. Context for the AI, never priced. */
  stacks: QuoteTool[];
  adjustments: {
    contentWriting: { label: string; minimumAmount: number; maximumAmount: number };
  };
}

export interface QuoteCatalogError {
  path: string;
  message: string;
}

export interface QuoteCatalogAdminPayload {
  version: number;
  updatedAt: string;
  catalog: QuoteCatalog;
}

export interface QuoteAnswers {
  offerKey: string;
  variantKey: string;
  optionKeys: string[];
  /** Context for the recommendation only: a tool never changes an amount. */
  toolKeys: string[];
  /** One stack key, empty unless the project stage is "existant". */
  existingStackKey: string;
  projectStage: QuoteProjectStage;
  contentReadiness: QuoteContentReadiness;
  deadline: QuoteDeadline;
  projectDescription: string;
}

export interface QuoteContact {
  fullName: string;
  email: string;
  company: string;
  phone: string;
  consent: boolean;
  honeypot: string;
}

export interface QuoteCalculationFactor {
  label: string;
  impactMin: number;
  impactMax: number;
}

export interface QuoteSelectedOption {
  key: string;
  label: string;
}

/**
 * A scope proposed by the AI, priced by the server from the active catalog.
 * Every label here comes from the catalog; only `reasons` is written by the model,
 * and only against a key the catalog declares.
 */
export interface QuoteProposal {
  tier: string;
  title: string;
  variantKey: string;
  variantLabel: string;
  includes: string[];
  selectedOptions: QuoteSelectedOption[];
  optionKeys: string[];
  minimumAmount: number;
  maximumAmount: number;
  pricingMode: QuotePricingMode;
  disclaimer: string;
  calculationDetail: QuoteCalculationFactor[];
  reasons: Record<string, string>;
  pricingVersion: number;
}

export interface QuoteRecommendation {
  summary: string;
  proposals: QuoteProposal[];
  source: string;
  pricingVersion: number;
}

export interface QuoteEstimateResult {
  offerKey: string;
  offerLabel: string;
  variantKey: string;
  variantLabel: string;
  minimumAmount: number;
  maximumAmount: number;
  includes: string[];
  selectedOptions: QuoteSelectedOption[];
  calculationDetail: QuoteCalculationFactor[];
  pricingVersion: number;
  pricingMode: QuotePricingMode;
  disclaimer: string;
}

export interface QuoteSubmissionResult extends QuoteEstimateResult {
  id: number;
  summary: string;
  recommendedScope: string[];
  missingQuestions: string[];
  riskFlags: string[];
  aiSource: string;
}

/** Lightweight row of GET /api/admin/quote-estimates: mirrors mapListItem() exactly. */
export interface QuoteEstimateAdminListItem {
  id: number;
  offerKey: string;
  variantKey: string | null;
  fullName: string;
  email: string;
  minimumAmount: number;
  maximumAmount: number;
  status: string;
  pricingVersion: number;
  createdAt: string;
  qualifiedAt: string | null;
}

export interface QuoteEstimateAdminRecord extends QuoteSubmissionResult {
  fullName: string;
  email: string;
  company: string | null;
  phone: string | null;
  answers: Record<string, unknown>;
  status: string;
  notes: string | null;
  createdAt: string;
  qualifiedAt: string | null;
}
