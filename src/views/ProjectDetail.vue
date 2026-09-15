<template>
  <main class="project-detail-page">
    <div class="top-bar">
      <a class="brand" href="/">{{ header.logoText }}</a>
      <nav class="nav-links" aria-label="Navigation">
        <a href="/#services">Services</a>
        <a href="/#cases">Réalisations</a>
        <a href="/#process">Méthode</a>
        <a href="/#profile">À propos</a>
        <a href="/#contact">Contact</a>
      </nav>
      <ThemeToggle :is-dark="isDark" @toggle="toggleTheme" />
    </div>

    <div v-if="project" class="project-container">
      <article class="project-article">
        <header class="project-header">
          <div v-if="project.imageUrl" class="project-image">
            <img :src="api.assetUrl(project.imageUrl)" :alt="project.name" />
          </div>
          <div class="project-title-block">
            <h1 class="project-title">{{ project.name }}</h1>
            <div class="project-summary" v-html="project.summary"></div>
          </div>
        </header>

        <div class="project-content">
          <section v-if="project.clientProblem" class="project-section">
            <h2 class="section-heading">Contexte & problème</h2>
            <div class="section-text" v-html="project.clientProblem"></div>
          </section>

          <section v-if="project.mission" class="project-section">
            <h2 class="section-heading">Mission</h2>
            <div class="section-text" v-html="project.mission"></div>
          </section>

          <section v-if="project.solution" class="project-section">
            <h2 class="section-heading">Solution</h2>
            <div class="section-text" v-html="project.solution"></div>
          </section>

          <section v-if="project.outcomes && project.outcomes.length" class="project-section">
            <h2 class="section-heading">Résultats</h2>
            <ul class="outcomes-list">
              <li v-for="outcome in project.outcomes" :key="outcome">{{ outcome }}</li>
            </ul>
          </section>

          <section class="project-meta">
            <div class="meta-block">
              <h3 class="meta-label">Stack</h3>
              <p class="meta-value">{{ project.stack }}</p>
            </div>
            <div v-if="project.serviceTags && project.serviceTags.length" class="meta-block">
              <h3 class="meta-label">Services</h3>
              <div class="service-tags">
                <span v-for="tag in project.serviceTags" :key="tag" class="service-tag">
                  {{ tag }}
                </span>
              </div>
            </div>
            <div v-if="project.duration" class="meta-block">
              <h3 class="meta-label">Durée</h3>
              <p class="meta-value">{{ project.duration }}</p>
            </div>
            <div v-if="project.siteUrl" class="meta-block">
              <h3 class="meta-label">Lien</h3>
              <a :href="project.siteUrl" class="meta-link" target="_blank" rel="noopener">
                Voir le projet →
              </a>
            </div>
          </section>
        </div>

        <footer class="project-footer">
          <a href="/#cases" class="btn btn-secondary">← Retour aux réalisations</a>
          <a href="/#contact" class="btn btn-primary">Décrire votre projet</a>
        </footer>
      </article>
    </div>

    <div v-else class="project-not-found">
      <div class="not-found-content">
        <h1>Projet non trouvé</h1>
        <p>Désolé, cette étude de cas n'existe pas ou n'est pas encore publiée.</p>
        <a href="/#cases" class="btn btn-primary">Retour aux réalisations</a>
      </div>
    </div>

    <SiteFooter
      :logo-text="header.logoText"
      :contact-email="header.contactEmail"
      :tagline="footer.tagline"
      :links="footer.links"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import ThemeToggle from "../components/ThemeToggle.vue";
import SiteFooter from "../components/SiteFooter.vue";
import { useContent } from "../composables/useContent";
import { useRoute } from "vue-router";
import { api } from "../utils/api";

interface ProjectCard {
  id: number;
  slug: string;
  name: string;
  stack: string;
  summary: string;
  bulletin?: string;
  siteUrl?: string;
  repoUrl?: string;
  imageUrl?: string;
  duration?: string;
  status: string;
  clientProblem?: string;
  mission?: string;
  solution?: string;
  outcomes?: string[];
  serviceTags?: string[];
  featured: boolean;
  sortOrder: number;
}

const { content } = useContent();
const route = useRoute();
const isDark = ref(true);
const project = ref<ProjectCard | null>(null);

const header = computed(() => content.value.header);
const footer = computed(() => content.value.footer);

const slug = computed(() => route.params.slug as string);

const loadProject = async (): Promise<void> => {
  if (!slug.value || !api.isEnabled) return;

  try {
    const response = await api.fetch(`/api/projects/${slug.value}`);
    if (!response.ok) return;
    const data = await response.json();
    project.value = data;
  } catch (error) {
    console.error("Failed to load project", error);
  }
};

onMounted(() => {
  void loadProject();
});

const toggleTheme = (): void => {
  isDark.value = !isDark.value;
  document.body.classList.toggle("theme-light", !isDark.value);
};
</script>

<style scoped>
.project-detail-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

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

.project-container {
  flex: 1;
  width: 100%;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 var(--gutter);
}

.project-article {
  display: flex;
  flex-direction: column;
  gap: clamp(40px, 8vw, 80px);
  padding: clamp(40px, 8vw, 80px) 0;
}

.project-header {
  display: grid;
  gap: clamp(24px, 4vw, 48px);
}

.project-image {
  width: 100%;
  max-height: 400px;
  overflow: hidden;
  border: 3px solid var(--line);
  background: var(--soft);
  box-shadow: var(--shadow-lg);
}

.project-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.project-title-block {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.project-title {
  font-family: var(--font-display);
  font-size: clamp(48px, 9vw, 92px);
  line-height: 0.82;
  text-transform: uppercase;
  margin: 0;
  color: var(--text);
}

.project-summary {
  font-size: clamp(20px, 3vw, 27px);
  line-height: 1.2;
  color: var(--text);
  margin: 0;
  max-width: 62ch;
}

.project-content {
  display: flex;
  flex-direction: column;
  gap: clamp(40px, 8vw, 60px);
}

.project-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-bottom: 3px solid var(--line);
  padding-bottom: clamp(24px, 4vw, 40px);
}

.project-section:last-of-type {
  border-bottom: none;
  padding-bottom: 0;
}

.section-heading {
  font-family: var(--font-display);
  font-size: clamp(28px, 5vw, 48px);
  line-height: 0.9;
  text-transform: uppercase;
  margin: 0;
  color: var(--text);
}

.section-text {
  font-size: 18px;
  line-height: 1.6;
  color: var(--text);
  max-width: 900px;
}

.section-text :deep(p) {
  margin: 0 0 16px;
}

.section-text :deep(p:last-child) {
  margin-bottom: 0;
}

.section-text :deep(strong) {
  color: var(--text);
  font-weight: 600;
}

.outcomes-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 18px;
  line-height: 1.5;
  color: var(--text);
  max-width: 900px;
}

.outcomes-list li {
  padding-left: 28px;
  position: relative;
}

.outcomes-list li::before {
  content: "✓";
  position: absolute;
  left: 0;
  color: var(--accent);
  font-weight: 700;
}

.project-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: clamp(24px, 4vw, 40px);
  padding: clamp(24px, 4vw, 40px);
  border: 3px solid var(--line);
  background: var(--bg-elev);
  box-shadow: var(--shadow);
}

.meta-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meta-label {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--muted);
  margin: 0;
}

.meta-value {
  font-size: 16px;
  color: var(--text);
  margin: 0;
  line-height: 1.4;
  word-break: break-word;
}

.service-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.service-tag {
  padding: 4px 10px;
  background: var(--soft);
  border: 1px solid var(--line);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--muted);
}

.meta-link {
  color: var(--accent);
  text-decoration: none;
  font-weight: 600;
  border-bottom: 2px solid var(--accent);
  transition: all 0.2s var(--ease);
}

.meta-link:hover {
  color: var(--text);
  border-bottom-color: var(--text);
}

.project-footer {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  padding-top: clamp(24px, 4vw, 40px);
  border-top: 3px solid var(--line);
}

.project-not-found {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(40px, 8vw, 80px) var(--gutter);
}

.not-found-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.not-found-content h1 {
  font-family: var(--font-display);
  font-size: clamp(32px, 6vw, 64px);
  line-height: 0.9;
  text-transform: uppercase;
  margin: 0;
  color: var(--text);
}

.not-found-content p {
  font-size: 18px;
  color: var(--muted);
  margin: 0;
}

@media (max-width: 720px) {
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

  .project-meta {
    grid-template-columns: 1fr;
  }

  .project-footer {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
