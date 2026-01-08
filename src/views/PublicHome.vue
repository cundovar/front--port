<template>
  <main class="page">
    <div class="top-bar">
      <ThemeToggle :is-dark="isDark" @toggle="toggleTheme" />
    </div>

    <HeroSection
      :title="content.hero.title"
      :tagline="content.hero.tagline"
      :subtitle="content.hero.subtitle"
      :primary-label="content.hero.primaryLabel"
      :secondary-label="content.hero.secondaryLabel"
      :primary-href="content.hero.primaryHref"
      :secondary-href="content.hero.secondaryHref"
    />

    <AboutSection
      :title="content.about.title"
      :subtitle="content.about.subtitle"
      :bio="content.about.bio"
      :trust-items="content.trust.items"
    />

    <StackLiteSection
      :title="content.stack.title"
      :subtitle="content.stack.subtitle"
      :items="content.stack.items"
    />

    <!-- Teaching: Desktop vs Mobile -->
    <TeachingSection
      v-if="!isMobile"
      :title="content.teaching.title"
      :subtitle="content.teaching.subtitle"
      :items="content.teaching.items"
    />
    <TeachingSectionMobile
      v-else
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
      :projects="projects"
    />
    <ProjectsSectionMobile
      v-else
      id="incubateur"
      :title="content.projects.title"
      :subtitle="content.projects.subtitle"
      :projects="projects"
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
import { onMounted, onUnmounted, ref } from "vue";
import HeroSection from "../components/HeroSection.vue";
import AboutSection from "../components/AboutSection.vue";
import StackLiteSection from "../components/StackLiteSection.vue";
import TeachingSection from "../components/TeachingSection.vue";
import TeachingSectionMobile from "../components/TeachingSectionMobile.vue";
import ProjectsSection from "../components/ProjectsSection.vue";
import ProjectsSectionMobile from "../components/ProjectsSectionMobile.vue";
import SkillsSection from "../components/SkillsSection.vue";
import FinalCtaSection from "../components/FinalCtaSection.vue";
import SiteFooter from "../components/SiteFooter.vue";
import ThemeToggle from "../components/ThemeToggle.vue";
import { useContent } from "../composables/useContent";
import { api } from "../utils/api";

const { content } = useContent();

const projects = ref(content.value.projects.items ?? []);
const isDark = ref(true);
const isMobile = ref(window.innerWidth <= 768);

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
  display: flex;
  justify-content: flex-end;
  /* padding-top: 40px;/ */
}

@media (max-width: 768px) {
  .top-bar {
    position: fixed;
    bottom: 8px;
    right: 5%;
    left: auto;
    padding: 0;
    z-index: 100;
    width: auto;
  }
}
</style>
