<template>
  <main class="page">
    <div class="top-bar">
      <a class="brand" href="#top">{{ content.header.logoText }}</a>
      <nav class="nav-links" aria-label="Navigation principale">
        <a href="#services">Services</a>
        <a href="#faq">FAQ</a>
        <a href="#cases">Réalisations</a>
        <a href="#process">Méthode</a>
        <a href="#profile">À propos</a>
        <a class="nav-cta" href="/devis">Parlons de votre projet</a>
      </nav>
      <ThemeToggle :is-dark="isDark" @toggle="toggleTheme" />
    </div>

    <HeroSection
      id="top"
      :title="content.hero.title"
      :tagline="content.hero.tagline"
      :subtitle="content.hero.subtitle"
      :primary-label="content.hero.primaryLabel"
      :secondary-label="content.hero.secondaryLabel"
      :primary-href="content.hero.primaryHref"
      :secondary-href="content.hero.secondaryHref"
      :proof-items="content.hero.proofItems"
    />

    <ProofBar :items="proofItems" />

    <ProblemsSection :problems="content.problems" />

    <ServicesSection :services="content.services" />

    <FeaturedCasesSection :cases="featuredProjects.slice(0, 3)" />

    <ProcessSection :process="content.process" />

    <ExpertiseSection :expertise="content.expertise" />

    <ProfileSection
      id="profile"
      :bio="content.about.bio"
      :location="content.about.location"
      :location-map-url="content.about.locationMapUrl"
      :teaching-items="content.teaching.items"
    />

    <FaqSection :services="content.services" />

    <section id="contact" class="section contact-section" aria-labelledby="contact-form-title">
      <h2 id="contact-form-title" class="section-title">Parlons de votre projet</h2>
      <p class="section-subtitle">Décrivez votre besoin pour recevoir une première estimation sans engagement.</p>
      <ContactForm />
    </section>

    <SiteFooter
      :logo-text="content.header.logoText"
      :contact-email="content.header.contactEmail"
      :tagline="content.footer.tagline"
      :links="content.footer.links"
    />

    <a class="mobile-estimate-cta" href="/devis">Obtenir une estimation</a>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import HeroSection from "../components/HeroSection.vue";
import ProofBar from "../components/ProofBar.vue";
import ServicesSection from "../components/ServicesSection.vue";
import FaqSection from "../components/FaqSection.vue";
import ProblemsSection from "../components/ProblemsSection.vue";
import FeaturedCasesSection from "../components/FeaturedCasesSection.vue";
import ProcessSection from "../components/ProcessSection.vue";
import ExpertiseSection from "../components/ExpertiseSection.vue";
import ProfileSection from "../components/ProfileSection.vue";
import ContactForm from "../components/ContactForm.vue";
import SiteFooter from "../components/SiteFooter.vue";
import ThemeToggle from "../components/ThemeToggle.vue";
import { useContent } from "../composables/useContent";
import { projectsSeed } from "../data/projects";
import { api } from "../utils/api";
import { normalizeProjects } from "../utils/content";

const { content } = useContent();

const projects = ref(content.value.projects.items ?? projectsSeed);
const isDark = ref(true);

const defaultProofItems = [
  "Developpeur fullstack freelance France",
  "Automatisation IA pour PME",
  "Refonte Symfony Vue WordPress",
  "Backoffice sur mesure local"
];

const proofItems = computed(() => {
  return content.value.trust.items.length ? content.value.trust.items : defaultProofItems;
});

const featuredProjects = computed(() => {
  return projects.value.filter((p) => p.featured !== false) || projects.value;
});

const loadProjects = async (): Promise<void> => {
  if (!api.isEnabled) return;

  try {
    const response = await api.fetch("/api/projects");
    if (!response.ok) return;
    const data = await response.json();
    projects.value = normalizeProjects(data, projectsSeed);
  } catch {
    // Fallback sur les données par défaut
  }
};

onMounted(() => {
  void loadProjects();
});

const toggleTheme = (): void => {
  isDark.value = !isDark.value;
  document.body.classList.toggle("theme-light", !isDark.value);
};
</script>

<style scoped>
.top-bar {
  position: sticky;
  top: 0;
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  width: 100%;
  min-height: 62px;
  padding: 0 var(--gutter);
  background: color-mix(in oklch, var(--bg) 92%, transparent);
  border-bottom: 2px solid var(--line);
  backdrop-filter: blur(10px);
}

.brand {
  max-width: 130px;
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 900;
  line-height: 0.9;
  text-transform: uppercase;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: clamp(12px, 2vw, 26px);
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.nav-links a {
  padding: 4px 0;
  border-bottom: 2px solid transparent;
}

.nav-links a:hover {
  border-bottom-color: var(--line);
}

.nav-links .nav-cta {
  padding: 9px 12px;
  border: 2px solid var(--line);
  background: var(--accent);
  color: var(--text);
  box-shadow: 4px 4px 0 var(--line);
}

.nav-links .nav-cta:hover {
  border-bottom-color: var(--line);
  transform: translate(-1px, -1px);
  box-shadow: 5px 5px 0 var(--line);
}

.mobile-estimate-cta {
  display: none;
}

@media (max-width: 768px) {
  .top-bar {
    align-items: center;
    flex-wrap: wrap;
    gap: 10px 12px;
    padding: 10px 12px 12px;
  }

  .brand {
    font-size: 22px;
  }

  .nav-links {
    order: 3;
    display: flex;
    width: 100%;
    gap: 8px;
    overflow-x: auto;
    padding: 4px 0 2px;
    margin-left: 0;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
  }

  .nav-links::-webkit-scrollbar {
    display: none;
  }

  .nav-links a {
    flex: 0 0 auto;
    padding: 6px 8px;
    border: 2px solid var(--line);
    background: var(--bg-elev);
    font-size: 11px;
  }

  .nav-links .nav-cta {
    display: none;
  }

  .page {
    padding-bottom: calc(76px + env(safe-area-inset-bottom));
  }

  .mobile-estimate-cta {
    position: fixed;
    z-index: 100;
    right: 14px;
    bottom: calc(14px + env(safe-area-inset-bottom));
    left: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 50px;
    padding: 12px 18px;
    border: 3px solid var(--line);
    background: var(--accent);
    color: var(--text);
    box-shadow: 6px 6px 0 var(--line);
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 900;
    text-transform: uppercase;
  }
}
</style>
