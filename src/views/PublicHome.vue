<template>
  <main class="page">
    <div class="top-bar">
      <a class="brand" href="#top">{{ content.header.logoText }}</a>
      <nav class="nav-links" aria-label="Navigation principale">
        <a href="#apropos">A propos</a>
        <a href="#stack">Stack</a>
        <a href="#enseignement">Cours</a>
        <a href="#incubateur">Projets</a>
        <a href="#contact">Contact</a>
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
    />
    <ProofStrip :items="content.skills.evidence" />

    <AboutSection
      id="apropos"
      :title="content.about.title"
      :subtitle="content.about.subtitle"
      :bio="content.about.bio"
      :trust-items="content.trust.items"
    />

    <StackLiteSection
      id="stack"
      :title="content.stack.title"
      :subtitle="content.stack.subtitle"
      :items="content.stack.items"
    />

    <!-- Teaching: Desktop vs Mobile -->
    <TeachingSection
      v-if="!isMobile"
      id="enseignement"
      :title="content.teaching.title"
      :subtitle="content.teaching.subtitle"
      :items="content.teaching.items"
    />
    <TeachingSectionMobile
      v-else
      id="enseignement"
      :title="content.teaching.title"
      :subtitle="content.teaching.subtitle"
      :items="content.teaching.items"
    />

    <!-- Projects: Desktop vs Mobile -->
    <ProjectsSection
      v-if="!isMobile"
      id="incubateur"
      :title="content.projects.title"
      :subtitle="content.projects.subtitle"
      :projects="filteredProjects"
      :technologies="availableTechnologies"
      :selected-technology="selectedTechnology"
      @select-technology="selectedTechnology = $event"
    />
    <ProjectsSectionMobile
      v-else
      id="incubateur"
      :title="content.projects.title"
      :subtitle="content.projects.subtitle"
      :projects="filteredProjects"
      :technologies="availableTechnologies"
      :selected-technology="selectedTechnology"
      @select-technology="selectedTechnology = $event"
    />

    <SkillsSection
      id="skills"
      :title="content.skills.title"
      :subtitle="content.skills.subtitle"
      :summary="content.skills.summary"
      :evidence="content.skills.evidence"
      :top-skills="content.skills.topSkills"
      :hidden-skills="content.skills.hiddenSkills"
      :generated-at="content.skills.generatedAt"
    />

    <FinalCtaSection
      id="contact"
      :title="content.cta.title"
      :subtitle="content.cta.subtitle"
      :primary-label="content.cta.primaryLabel"
      :primary-href="`mailto:${content.header.contactEmail}`"
    />

    <SiteFooter
      :logo-text="content.header.logoText"
      :contact-email="content.header.contactEmail"
      :tagline="content.footer.tagline"
      :links="content.footer.links"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import HeroSection from "../components/HeroSection.vue";
import AboutSection from "../components/AboutSection.vue";
import StackLiteSection from "../components/StackLiteSection.vue";
import TeachingSection from "../components/TeachingSection.vue";
import TeachingSectionMobile from "../components/TeachingSectionMobile.vue";
import ProjectsSection from "../components/ProjectsSection.vue";
import ProjectsSectionMobile from "../components/ProjectsSectionMobile.vue";
import SkillsSection from "../components/SkillsSection.vue";
import ProofStrip from "../components/ProofStrip.vue";
import FinalCtaSection from "../components/FinalCtaSection.vue";
import SiteFooter from "../components/SiteFooter.vue";
import ThemeToggle from "../components/ThemeToggle.vue";
import { useContent } from "../composables/useContent";
import { api } from "../utils/api";

const { content } = useContent();

const projects = ref(content.value.projects.items ?? []);
const selectedTechnology = ref("all");
const isDark = ref(true);
const isMobile = ref(window.innerWidth <= 768);

const normalizeTechnology = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const technologyCatalog = computed(() => {
  const labels = new Set([
    "Next.js",
    "Vue.js",
    "React",
    "Symfony",
    "PHP",
    "WordPress",
    "Docker",
    "MySQL",
  ]);

  content.value.teaching.items.forEach((item) => labels.add(item.name));

  return Array.from(labels).map((label) => ({
    value: normalizeTechnology(label),
    label,
  }));
});

const stackIncludesTechnology = (stack: string, technology: string): boolean => {
  const normalizedStack = normalizeTechnology(stack);

  return normalizedStack.includes(technology);
};

const availableTechnologies = computed(() => {
  return technologyCatalog.value.filter((technology) =>
    projects.value.some((project) => stackIncludesTechnology(project.stack, technology.value)),
  );
});

const filteredProjects = computed(() => {
  if (selectedTechnology.value === "all") {
    return projects.value;
  }

  return projects.value.filter((project) => stackIncludesTechnology(project.stack, selectedTechnology.value));
});

const handleResize = (): void => {
  isMobile.value = window.innerWidth <= 768;
};

const loadProjects = async (): Promise<void> => {
  try {
    const response = await api.fetch("/api/projects");
    if (!response.ok) return;
    const data = await response.json();
    if (Array.isArray(data)) {
      projects.value = data;
    }
  } catch {
    // Fallback sur les données par défaut
  }
};

onMounted(() => {
  void loadProjects();
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
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
}
</style>
