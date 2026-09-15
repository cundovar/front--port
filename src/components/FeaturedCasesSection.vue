<template>
  <section class="section featured-cases-section" id="cases" aria-labelledby="cases-title">
    <div class="cases-header">
      <div>
        <h2 id="cases-title" class="section-title">Réalisations</h2>
      </div>
      <RouterLink to="/realisations" class="btn btn-secondary">Voir tous les projets</RouterLink>
    </div>
    <div v-if="cases.length" class="cases-grid">
      <article v-for="project in cases" :key="project.id" class="case-card">
        <div v-if="project.imageUrl" class="case-image">
          <img :src="api.assetUrl(project.imageUrl)" :alt="project.name" />
        </div>
        <div class="case-content">
          <h3 class="case-title">{{ project.name }}</h3>
          <div v-if="project.summary" class="case-description" v-html="project.summary"></div>
          <div v-if="project.serviceTags && project.serviceTags.length" class="case-tech">
            <span v-for="tag in project.serviceTags" :key="tag" class="tech-badge">
              {{ tag }}
            </span>
          </div>
          <a :href="`/realisations/${project.slug}`" class="btn btn-primary">
            Découvrir le projet
          </a>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
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

interface Props {
  cases: ProjectCard[];
}

defineProps<Props>();
</script>

<style scoped>
.cases-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: clamp(40px, 8vw, 80px);
  flex-wrap: wrap;
}

.cases-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  align-items: start;
  gap: clamp(24px, 4vw, 40px);
  margin-bottom: clamp(40px, 8vw, 80px);
}

.case-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 3px solid var(--line);
  background: var(--bg-elev);
  overflow: hidden;
  box-shadow: var(--shadow);
  transition: transform 0.2s var(--ease), box-shadow 0.2s var(--ease);
}

.case-card:hover {
  transform: translate(-2px, -2px);
  box-shadow: var(--shadow-lg);
}

.case-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: var(--soft);
}

.case-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.case-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: clamp(20px, 3vw, 32px);
}

.case-title {
  font-family: var(--font-display);
  font-size: clamp(22px, 3vw, 28px);
  line-height: 0.95;
  text-transform: uppercase;
  margin: 0;
  color: var(--text);
}

.case-description {
  font-size: 15px;
  line-height: 1.5;
  color: var(--muted);
  margin: 0;
}

.case-tech {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}

.tech-badge {
  padding: 4px 10px;
  background: var(--soft);
  border: 1px solid var(--line);
  border-radius: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--muted);
}

.cases-footer {
  text-align: center;
}

@media (max-width: 720px) {
  .cases-grid {
    grid-template-columns: 1fr;
  }

  .case-card {
    box-shadow: 6px 6px 0 var(--line);
  }

  .case-card:hover {
    transform: none;
    box-shadow: 6px 6px 0 var(--line);
  }
}
</style>
