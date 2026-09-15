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

export interface ServicePricing {
  essential: string;
  standard: string;
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
  pricing: ServicePricing;
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

export type QuoteServiceKey =
  | "automation"
  | "ai-assistant"
  | "refonte"
  | "custom-tool"
  | "wordpress";

export type QuoteComplexity = "simple" | "standard" | "complexe";

export type QuoteTrainingNeed = "none" | "light" | "full";

export type QuoteStep = "need" | "details" | "contact" | "result";

export interface QuoteAnswers {
  serviceKey: QuoteServiceKey | "";
  complexity: QuoteComplexity | "";
  integrationsCount: number;
  legacyTakeover: boolean;
  urgency: boolean;
  trainingNeed: QuoteTrainingNeed;
  projectDescription: string;
}

export interface QuoteContact {
  fullName: string;
  email: string;
  company: string;
  phone: string;
  honeypot: string;
}

export interface QuoteCalculationFactor {
  label: string;
  impactMin: number;
  impactMax: number;
}

export interface QuoteEstimateResult {
  id: number;
  serviceKey: QuoteServiceKey;
  minimumAmount: number;
  maximumAmount: number;
  calculationDetail: QuoteCalculationFactor[];
  summary: string;
  recommendedScope: string[];
  missingQuestions: string[];
  riskFlags: string[];
  disclaimer: string;
}

export interface QuoteEstimateAdminRecord extends QuoteEstimateResult {
  fullName: string;
  email: string;
  company: string | null;
  phone: string | null;
  answers: Record<string, unknown>;
  aiSource: string;
  status: string;
  notes: string | null;
  createdAt: string;
  qualifiedAt: string | null;
}
