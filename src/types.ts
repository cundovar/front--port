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
}

// === ABOUT ===
export interface AboutContent {
  title: string;
  subtitle: string;
  bio: string;
}

// === TRUST ===
export interface TrustContent {
  items: string[];
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
export interface ProjectCard {
  id: string;
  name: string;
  stack: string;
  summary: string;
  progress: number;
  bulletin: string;
  siteUrl: string;
  repoUrl: string;
  imageUrl?: string;
  duration?: string;
}

export interface ProjectsContent {
  title: string;
  subtitle: string;
  items?: ProjectCard[];
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
  stack: StackContent;
  teaching: TeachingContent;
  projects: ProjectsContent;
  skills: SkillsContent;
  cta: CtaContent;
  footer: FooterContent;
}
