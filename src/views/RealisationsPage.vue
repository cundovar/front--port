<template>
  <main class="page">
    <div class="section realisations-header">
      <RouterLink class="back-link" to="/">← Accueil</RouterLink>
      <h1>Réalisations</h1>
      <p class="subtitle">Projets & études de cas</p>
    </div>

    <section class="section">
      <div v-if="projects.length" class="projects-grid">
        <article v-for="project in projects" :key="project.id" class="project-card">
          <div v-if="project.imageUrl" class="project-image">
            <img :src="api.assetUrl(project.imageUrl)" :alt="project.name" />
          </div>
          <div class="project-content">
            <h3 class="project-title">{{ project.name }}</h3>
            <p v-if="project.stack" class="project-stack">{{ project.stack }}</p>
            <div v-if="project.summary" class="project-summary" v-html="project.summary"></div>
            <div v-if="project.duration" class="project-meta">
              <span class="duration">⏱️ {{ project.duration }}</span>
            </div>
            <div v-if="project.serviceTags && project.serviceTags.length" class="project-tags">
              <span v-for="tag in project.serviceTags" :key="tag" class="tag">{{ tag }}</span>
            </div>
            <RouterLink :to="`/realisations/${project.slug}`" class="btn btn-primary">
              Découvrir le projet
            </RouterLink>
          </div>
        </article>
      </div>
      <div v-else class="empty-state">
        <p>Aucun projet à afficher.</p>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { api } from "../utils/api";

interface Project {
  id: number;
  slug: string;
  name: string;
  stack: string;
  summary: string;
  imageUrl?: string;
  duration?: string;
  status: string;
  featured: boolean;
  serviceTags?: string[];
}

const projects = ref<Project[]>([]);

const stripHtml = (html: string): string => {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
};

const loadProjects = async (): Promise<void> => {
  try {
    const response = await api.fetch("/api/projects");
    if (!response.ok) return;
    const data = await response.json() as Project[];
    projects.value = data.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  } catch {
    // Fallback
  }
};

onMounted(() => {
  void loadProjects();
});
</script>

<style scoped>
.realisations-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 40px;
}

.back-link {
  display: inline-flex;
  width: fit-content;
  color: var(--text);
  text-decoration: none;
  font-size: 14px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.back-link:hover {
  opacity: 1;
}

.realisations-header h1 {
  margin: 0;
  font-size: clamp(28px, 6vw, 48px);
}

.subtitle {
  color: var(--muted);
  margin: 0;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: clamp(20px, 4vw, 32px);
}

.project-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--line);
  transition: transform 0.2s, box-shadow 0.2s;
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.project-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: 8px;
  background: var(--bg);
}

.project-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.project-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.project-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.project-stack {
  margin: 0;
  font-size: 13px;
  color: var(--muted);
}

.project-summary {
  margin: 0;
  font-size: 14px;
  color: var(--text);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-meta {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: var(--muted);
}

.duration {
  display: flex;
  align-items: center;
  gap: 4px;
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  display: inline-block;
  padding: 4px 8px;
  background: var(--bg);
  border-radius: 4px;
  font-size: 12px;
  color: var(--text);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--muted);
}

.btn {
  align-self: flex-start;
  margin-top: auto;
}

@media (max-width: 768px) {
  .projects-grid {
    grid-template-columns: 1fr;
  }

  .realisations-header h1 {
    font-size: 28px;
  }
}
</style>
