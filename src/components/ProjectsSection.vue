<template>
  <section class="section">
    <h2 class="section-title">{{ title }}</h2>
    <p class="section-subtitle">{{ subtitle }}</p>
    <div class="grid grid-2">
      <article v-for="project in projects" :key="project.id" class="card">
        <div class="project-header">
          <div>
            <h3>{{ project.name }}</h3>
            <p class="muted">{{ project.stack }}</p>
          </div>
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
        <img v-if="project.imageUrl" class="project-image" :src="project.imageUrl" :alt="project.name" />
        <div v-if="project.summary" class="project-summary" v-html="project.summary"></div>
        <p v-if="project.duration" class="project-duration">Duree: {{ project.duration }}</p>
        <div v-if="project.bulletin" class="bulletin" v-html="project.bulletin"></div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ProjectCard } from "../types";

interface Props {
  title: string;
  subtitle: string;
  projects: ProjectCard[];
}

defineProps<Props>();
</script>

<style scoped>
.project-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.project-header h3 {
  margin: 0;
}

.muted {
  color: var(--muted);
  margin: 4px 0 0;
}

.project-summary {
  margin: 16px 0;
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
  color: var(--yellow);
  text-decoration: underline;
}

.project-duration {
  margin: 6px 0 0;
  color: var(--muted);
  font-size: 13px;
}

.project-image {
  margin-top: 16px;
  border-radius: 14px;
  border: 1px solid var(--line);
  max-height: 220px;
  object-fit: cover;
  width: 100%;
}

.bulletin {
  margin: 12px 0 0;
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
}
</style>
