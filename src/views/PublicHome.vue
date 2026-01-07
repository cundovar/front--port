<template>
  <main class="page">
    <div class="section top-bar">
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
    />

    <TrustStrip :items="content.trust.items" />

    <StackLiteSection
      :title="content.stack.title"
      :subtitle="content.stack.subtitle"
      :items="content.stack.items"
    />

    <TeachingSection
      :title="content.teaching.title"
      :subtitle="content.teaching.subtitle"
      :items="content.teaching.items"
    />

    <ProjectsSection
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
import { onMounted, ref } from "vue";
import HeroSection from "../components/HeroSection.vue";
import AboutSection from "../components/AboutSection.vue";
import TrustStrip from "../components/TrustStrip.vue";
import StackLiteSection from "../components/StackLiteSection.vue";
import TeachingSection from "../components/TeachingSection.vue";
import ProjectsSection from "../components/ProjectsSection.vue";
import SkillsSection from "../components/SkillsSection.vue";
import FinalCtaSection from "../components/FinalCtaSection.vue";
import SiteFooter from "../components/SiteFooter.vue";
import ThemeToggle from "../components/ThemeToggle.vue";
import { useContent } from "../composables/useContent";

const { content } = useContent();

const projects = ref(content.value.projects.items ?? []);
const isDark = ref(true);

const loadProjects = async (): Promise<void> => {
  try {
    const response = await fetch("/api/projects");
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
  padding-top: 40px;
}
</style>
