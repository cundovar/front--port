<template>
  <section class="section">
    <h2 class="section-title">{{ title }}</h2>
    <p class="section-subtitle">{{ subtitle }}</p>
    <div class="project-filters" role="group" aria-label="Filtrer les projets par technologie">
      <button
        class="filter-btn"
        :class="{ active: selectedTechnology === 'all' }"
        type="button"
        :aria-pressed="selectedTechnology === 'all'"
        @click="$emit('selectTechnology', 'all')"
      >
        Tous
      </button>
      <button
        v-for="technology in technologies"
        :key="technology.value"
        class="filter-btn"
        :class="{ active: selectedTechnology === technology.value }"
        type="button"
        :aria-pressed="selectedTechnology === technology.value"
        @click="$emit('selectTechnology', technology.value)"
      >
        {{ technology.label }}
      </button>
    </div>
    <div class="projects-grid">
      <article v-for="project in projects" :key="project.id" class="project-card">
        <img v-if="project.imageUrl" class="project-image" :src="api.assetUrl(project.imageUrl)" :alt="project.name" />
        <div v-else class="project-image project-placeholder">{{ project.name }}</div>
        <div class="project-body">
          <p class="muted">{{ project.stack }}</p>
          <h3>{{ project.name }}</h3>
          <div
            v-if="project.summary || project.bulletin"
            class="project-summary"
            v-html="project.summary || project.bulletin"
          ></div>
          <p v-if="project.duration" class="project-duration">Duree: {{ project.duration }}</p>
          <div class="project-links">
            <a class="btn btn-secondary" :href="project.siteUrl" target="_blank" rel="noreferrer">Site</a>
            <a
              v-if="project.repoUrl"
              class="btn btn-secondary"
              :href="project.repoUrl"
              target="_blank"
              rel="noreferrer"
            >
              Git
            </a>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ProjectCard } from "../types";
import { api } from "../utils/api";

interface TechnologyFilter {
  value: string;
  label: string;
}

interface Props {
  title: string;
  subtitle: string;
  projects: ProjectCard[];
  technologies: TechnologyFilter[];
  selectedTechnology: string;
}

defineProps<Props>();
defineEmits<{ (e: "selectTechnology", technology: string): void }>();
</script>

<style scoped>
.project-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: -12px 0 34px;
}

.filter-btn {
  min-height: 46px;
  padding: 10px 18px;
  border: 2px solid var(--line);
  background: var(--bg-elev);
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 160ms var(--ease), box-shadow 160ms var(--ease), background 160ms var(--ease), color 160ms var(--ease);
}

.filter-btn:hover,
.filter-btn.active {
  background: var(--text);
  color: var(--bg-elev);
}

.filter-btn:hover {
  transform: translate(-1px, -1px);
  box-shadow: 4px 4px 0 var(--line);
}

.project-body h3 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(36px, 4.5vw, 48px);
  line-height: 0.82;
  text-transform: uppercase;
}

.muted {
  color: var(--muted);
  margin: 4px 0 0;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 28px;
}

.project-card {
  display: flex;
  flex-direction: column;
  background: var(--bg-elev);
  border: 3px solid var(--line);
  box-shadow: var(--shadow);
  padding: 20px;
}

.project-body {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.project-summary {
  margin: 16px 0 0;
  padding: 0;
  color: var(--text);
}

.project-summary :deep(p) {
  margin: 0 0 8px;
}

.project-summary :deep(p:last-child) {
  margin-bottom: 0;
}

.project-summary :deep(strong) {
  font-weight: 600;
}

.project-summary :deep(ul) {
  padding-left: 20px;
  margin: 8px 0;
}

.project-summary :deep(a) {
  color: var(--accent);
  text-decoration: underline;
}

.project-duration {
  margin: 12px 0 0;
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.project-image {
  margin: 0;
  border-radius: 0;
  border: 2px solid var(--line);
  aspect-ratio: 16 / 4.5;
  max-height: none;
  object-fit: cover;
  width: 100%;
  margin-bottom: 16px;
}

.project-placeholder {
  display: grid;
  place-items: center;
  background:
    linear-gradient(135deg, transparent 0 48%, var(--line) 49% 51%, transparent 52%),
    linear-gradient(45deg, transparent 0 48%, var(--line) 49% 51%, transparent 52%),
    var(--soft);
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.project-links {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding: 0;
  margin-top: 24px;
}
</style>
