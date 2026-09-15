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
    <div class="projects-list">
      <article v-for="project in projects" :key="project.id" class="card">
        <img v-if="project.imageUrl" class="project-image" :src="api.assetUrl(project.imageUrl)" :alt="project.name" />
        <div v-else class="project-image project-placeholder">{{ project.name }}</div>
        <div class="project-header">
          <div>
            <h3>{{ project.name }}</h3>
            <p class="muted">{{ project.stack }}</p>
          </div>
        </div>
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
  gap: 10px;
  margin: -12px 0 28px;
  overflow-x: auto;
  padding: 0 8px 12px 0;
  scroll-snap-type: x proximity;
  -webkit-overflow-scrolling: touch;
}

.filter-btn {
  flex: 0 0 auto;
  min-height: 44px;
  padding: 10px 18px;
  border: 2px solid var(--line);
  background: var(--bg-elev);
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  cursor: pointer;
  scroll-snap-align: start;
}

.filter-btn.active {
  background: var(--text);
  color: var(--bg-elev);
}

.projects-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card {
  background: var(--bg-elev);
  border: 3px solid var(--line);
  border-radius: 0;
  padding: 20px;
  box-shadow: 7px 7px 0 var(--line);
}

.project-header {
  margin-bottom: 12px;
}

.project-header h3 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 38px;
  line-height: 0.85;
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

.project-image {
  margin: 0 0 14px;
  border-radius: 0;
  border: 2px solid var(--line);
  aspect-ratio: 16 / 4.5;
  max-height: none;
  object-fit: cover;
  width: 100%;
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

.project-summary {
  margin: 12px 0;
  color: var(--text);
  font-size: 14px;
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
  margin: 6px 0;
  color: var(--muted);
  font-size: 13px;
}

.bulletin {
  margin: 12px 0;
  color: var(--muted);
  font-size: 14px;
}

.bulletin :deep(p) {
  margin: 0 0 6px;
}

.bulletin :deep(p:last-child) {
  margin-bottom: 0;
}

.bulletin :deep(strong) {
  color: var(--text);
  font-weight: 600;
}

.bulletin :deep(ul) {
  padding-left: 20px;
  margin: 6px 0;
}

.bulletin :deep(h2),
.bulletin :deep(h3) {
  color: var(--text);
  margin: 10px 0 6px;
  font-size: 15px;
}

.project-links {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}
</style>
