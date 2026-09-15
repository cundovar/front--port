<template>
  <section class="section">
    <h2 class="section-title">Backoffice Projets</h2>
    <p class="section-subtitle">Gestion des études de cas avec tous les champs.</p>

    <div class="grid grid-2">
      <div class="card form-card">
        <h3>{{ editingId ? "Modifier l'étude de cas" : "Ajouter une étude de cas" }}</h3>
        <form class="form" @submit.prevent="save">
          <div class="form-section">
            <h4>Infos de base</h4>
            <label>
              Nom du projet *
              <input v-model="form.name" type="text" required />
            </label>
            <label>
              Slug (auto-généré)
              <input v-model="form.slug" type="text" disabled />
            </label>
            <label>
              Stack *
              <input v-model="form.stack" type="text" required placeholder="Ex: Vue.js, Symfony, MySQL" />
            </label>
            <label>
              Statut
              <select v-model="form.status">
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
                <option value="in_progress">En cours</option>
                <option value="archived">Archivé</option>
              </select>
            </label>
          </div>

          <div class="form-section">
            <h4>Contenu principal</h4>
            <label>
              Résumé court *
              <textarea v-model="form.summary" required rows="3"></textarea>
            </label>
            <label>
              Problème client
              <RichTextEditor v-model="form.clientProblem" />
            </label>
            <label>
              Mission
              <RichTextEditor v-model="form.mission" />
            </label>
            <label>
              Solution
              <RichTextEditor v-model="form.solution" />
            </label>
            <label>
              Bulletin / Étapes
              <RichTextEditor v-model="form.bulletin" />
            </label>
          </div>

          <div class="form-section">
            <h4>Résultats</h4>
            <div class="array-field">
              <label>Résultats (un par ligne)</label>
              <textarea v-model="outcomesText" rows="4" placeholder="Résultat 1&#10;Résultat 2&#10;Résultat 3"></textarea>
            </div>
          </div>

          <div class="form-section">
            <h4>Catégories & tags</h4>
            <div class="array-field">
              <label>Services (un par ligne)</label>
              <textarea v-model="serviceTagsText" rows="4" placeholder="Automatisation&#10;Refonte&#10;IA"></textarea>
            </div>
          </div>

          <div class="form-section">
            <h4>Liens & médias</h4>
            <label>
              URL du site *
              <input v-model="form.siteUrl" type="url" required />
            </label>
            <label>
              URL du dépôt Git
              <input v-model="form.repoUrl" type="url" />
            </label>
            <label>
              Durée
              <input v-model="form.duration" type="text" placeholder="Ex: 3 semaines" />
            </label>
            <label>
              Image
              <input type="file" accept="image/*" @change="onFileChange" />
            </label>
            <img
              v-if="previewUrl || form.imageUrl"
              class="preview"
              :src="previewUrl || form.imageUrl"
              alt="Aperçu projet"
            />
          </div>

          <div class="form-section">
            <h4>Publication</h4>
            <label class="checkbox">
              <input v-model="form.featured" type="checkbox" />
              Mettre en avant sur la page d'accueil
            </label>
            <label v-if="form.featured">
              Ordre d'affichage
              <input v-model.number="form.sortOrder" type="number" min="0" />
            </label>
          </div>

          <div class="form-actions">
            <button class="btn btn-primary" type="submit">
              {{ editingId ? "Mettre à jour" : "Ajouter" }}
            </button>
            <button v-if="editingId" class="btn btn-secondary" type="button" @click="reset">
              Annuler
            </button>
          </div>
        </form>
      </div>

      <div class="card projects-card">
        <h3>Études de cas</h3>
        <p v-if="error" class="error">{{ error }}</p>
        <div class="project-list">
          <article v-for="project in projects" :key="project.id" class="project-item">
            <div class="project-info">
              <strong>{{ project.name }}</strong>
              <p class="muted">{{ project.stack }}</p>
              <span class="status-badge" :class="`status-${project.status}`">
                {{ project.status }}
              </span>
              <span v-if="project.featured" class="featured-badge">Featured</span>
            </div>
            <div class="actions">
              <button class="btn btn-secondary" type="button" @click="edit(project)">
                Editer
              </button>
              <button class="btn btn-secondary" type="button" @click="remove(project.id)">
                Supprimer
              </button>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import type { ProjectCard } from "../types";
import RichTextEditor from "./RichTextEditor.vue";
import { api } from "../utils/api";

const projects = ref<ProjectCard[]>([]);
const editingId = ref<number | null>(null);
const error = ref("");
const selectedFile = ref<File | null>(null);
const previewUrl = ref<string>("");

const form = reactive({
  name: "",
  slug: "",
  stack: "",
  summary: "",
  bulletin: "",
  clientProblem: "",
  mission: "",
  solution: "",
  siteUrl: "",
  repoUrl: "",
  imageUrl: "",
  duration: "",
  status: "draft",
  featured: false,
  sortOrder: 0,
});

const outcomesText = ref<string>("");
const serviceTagsText = ref<string>("");

const outcomesArray = computed({
  get: () => outcomesText.value.split("\n").filter((l) => l.trim()),
  set: (val: string[]) => {
    outcomesText.value = val.join("\n");
  },
});

const serviceTagsArray = computed({
  get: () => serviceTagsText.value.split("\n").filter((l) => l.trim()),
  set: (val: string[]) => {
    serviceTagsText.value = val.join("\n");
  },
});

const onFileChange = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  selectedFile.value = file;
  previewUrl.value = URL.createObjectURL(file);
};

const reset = (): void => {
  form.name = "";
  form.slug = "";
  form.stack = "";
  form.summary = "";
  form.bulletin = "";
  form.clientProblem = "";
  form.mission = "";
  form.solution = "";
  form.siteUrl = "";
  form.repoUrl = "";
  form.imageUrl = "";
  form.duration = "";
  form.status = "draft";
  form.featured = false;
  form.sortOrder = 0;
  outcomesText.value = "";
  serviceTagsText.value = "";
  editingId.value = null;
  selectedFile.value = null;
  previewUrl.value = "";
  error.value = "";
};

const adminHeaders = (): HeadersInit => {
  return {
    "Content-Type": "application/json",
  };
};

const load = async (): Promise<void> => {
  try {
    const response = await api.fetch("/api/admin/projects", {
      method: "GET",
      headers: adminHeaders(),
      credentials: "include",
    });
    if (!response.ok) {
      error.value = `Impossible de charger les projets (API ${response.status}).`;
      return;
    }
    const data = (await response.json()) as ProjectCard[];
    if (Array.isArray(data)) {
      projects.value = data;
    }
  } catch {
    error.value = "Impossible de charger les projets (API indisponible).";
  }
};

const uploadImage = async (projectId: string | number): Promise<string | null> => {
  if (!selectedFile.value) return null;
  const formData = new FormData();
  formData.append("file", selectedFile.value);

  const response = await api.fetch(`/api/admin/projects/${projectId}/image`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    const detail = await response.text();
    error.value = `Échec upload image (API ${response.status}). ${detail}`;
    return null;
  }

  const data = (await response.json()) as { imageUrl?: string };
  return data.imageUrl ?? null;
};

const edit = (project: ProjectCard): void => {
  form.name = project.name;
  form.slug = project.slug;
  form.stack = project.stack;
  form.summary = project.summary;
  form.bulletin = project.bulletin || "";
  form.clientProblem = project.clientProblem || "";
  form.mission = project.mission || "";
  form.solution = project.solution || "";
  form.siteUrl = project.siteUrl;
  form.repoUrl = project.repoUrl ?? "";
  form.imageUrl = project.imageUrl ?? "";
  form.duration = project.duration ?? "";
  form.status = project.status;
  form.featured = project.featured;
  form.sortOrder = project.sortOrder;
  outcomesText.value = (project.outcomes || []).join("\n");
  serviceTagsText.value = (project.serviceTags || []).join("\n");
  previewUrl.value = project.imageUrl ?? "";
  selectedFile.value = null;
  editingId.value = project.id;
  error.value = "";
};

const save = async (): Promise<void> => {
  error.value = "";

  const payload = {
    name: form.name,
    slug: form.slug,
    stack: form.stack,
    summary: form.summary,
    bulletin: form.bulletin,
    clientProblem: form.clientProblem || null,
    mission: form.mission || null,
    solution: form.solution || null,
    siteUrl: form.siteUrl,
    repoUrl: form.repoUrl || null,
    imageUrl: form.imageUrl || null,
    duration: form.duration || null,
    status: form.status,
    outcomes: outcomesArray.value,
    serviceTags: serviceTagsArray.value,
    featured: form.featured,
    sortOrder: form.sortOrder,
  };

  try {
    if (editingId.value) {
      const response = await api.fetch(`/api/admin/projects/${editingId.value}`, {
        method: "PUT",
        headers: adminHeaders(),
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        error.value = `Échec mise à jour (API ${response.status})`;
        return;
      }

      if (selectedFile.value) {
        await uploadImage(editingId.value);
      }

      await load();
    } else {
      const response = await api.fetch("/api/admin/projects", {
        method: "POST",
        headers: adminHeaders(),
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        error.value = `Échec création (API ${response.status})`;
        return;
      }

      const data = (await response.json()) as { id: number };
      const projectId = data.id;

      if (selectedFile.value) {
        await uploadImage(projectId);
      }

      await load();
    }

    reset();
  } catch (err) {
    error.value = `Erreur: ${err instanceof Error ? err.message : "Erreur inconnue"}`;
  }
};

const remove = async (id: number): Promise<void> => {
  if (!confirm("Êtes-vous sûr ?")) return;
  error.value = "";

  try {
    const response = await api.fetch(`/api/admin/projects/${id}`, {
      method: "DELETE",
      headers: adminHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      error.value = `Échec suppression (API ${response.status})`;
      return;
    }

    await load();
  } catch (err) {
    error.value = `Erreur: ${err instanceof Error ? err.message : "Erreur inconnue"}`;
  }
};

onMounted(() => {
  void load();
});
</script>

<style scoped>
.form-card {
  max-height: 80vh;
  overflow-y: auto;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--soft);
}

.form-section:last-of-type {
  border-bottom: none;
}

.form-section h4 {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--muted);
  margin: 0;
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
}

label.checkbox {
  flex-direction: row;
  align-items: center;
}

label.checkbox input {
  width: auto;
}

input,
select,
textarea {
  padding: 8px 12px;
  border: 1px solid var(--line);
  background: var(--bg-elev);
  color: var(--text);
  font-family: inherit;
  font-size: 14px;
}

input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

textarea {
  resize: vertical;
  font-family: var(--font-mono);
}

.array-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.preview {
  max-width: 200px;
  border: 1px solid var(--line);
  border-radius: 0;
  margin-top: 8px;
}

.form-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  padding-top: 16px;
  margin-top: 16px;
  border-top: 1px solid var(--soft);
}

.error {
  padding: 12px;
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid #dc2626;
  color: #b91c1c;
  border-radius: 0;
  margin: 0;
  font-size: 14px;
}

.projects-card {
  overflow-y: auto;
  max-height: 80vh;
}

.project-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.project-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--soft);
  background: var(--bg);
  font-size: 14px;
}

.project-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.project-info strong {
  font-weight: 600;
  word-break: break-word;
}

.muted {
  color: var(--muted);
  margin: 0;
  font-size: 12px;
}

.status-badge {
  display: inline-block;
  padding: 2px 6px;
  background: var(--soft);
  border: 1px solid var(--line);
  border-radius: 0;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--muted);
  width: fit-content;
}

.status-published {
  background: rgba(34, 197, 94, 0.1);
  border-color: #22c55e;
  color: #16a34a;
}

.status-draft {
  background: rgba(156, 163, 175, 0.1);
  border-color: #9ca3af;
  color: #6b7280;
}

.status-in_progress {
  background: rgba(59, 130, 246, 0.1);
  border-color: #3b82f6;
  color: #1d4ed8;
}

.featured-badge {
  display: inline-block;
  padding: 2px 6px;
  background: rgba(251, 146, 60, 0.1);
  border: 1px solid #fb923c;
  border-radius: 0;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  color: #d97706;
  width: fit-content;
}

.actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

@media (max-width: 960px) {
  .grid.grid-2 {
    grid-template-columns: 1fr;
  }
}
</style>
