<template>
  <section class="section">
    <h2 class="section-title">Backoffice Projets</h2>
    <p class="section-subtitle">Gestion des projets avec API + fallback local.</p>

    <div class="grid grid-2">
      <div class="card">
        <h3>{{ editingId ? "Modifier un projet" : "Ajouter un projet" }}</h3>
        <form class="form" @submit.prevent="save">
          <label>
            Nom du projet
            <input v-model="form.name" type="text" required />
          </label>
          <label>
            Stack
            <input v-model="form.stack" type="text" required />
          </label>
          <div class="field">
            <label>Resume</label>
            <RichTextEditor v-model="form.summary" />
          </div>
          <div class="field">
            <label>Bulletin</label>
            <RichTextEditor v-model="form.bulletin" />
          </div>
          <label>
            Lien site
            <input v-model="form.siteUrl" type="url" required />
          </label>
          <label>
            Lien Git
            <input v-model="form.repoUrl" type="url" />
          </label>
          <label>
            Duree de construction
            <input v-model="form.duration" type="text" placeholder="Ex: 3 semaines" />
          </label>
          <label>
            Image (upload local)
            <input type="file" accept="image/*" @change="onFileChange" />
          </label>
          <img
            v-if="previewUrl || form.imageUrl"
            class="preview"
            :src="previewUrl || form.imageUrl"
            alt="Apercu projet"
          />
          <div class="form-actions">
            <button class="btn btn-primary" type="submit">
              {{ editingId ? "Mettre a jour" : "Ajouter" }}
            </button>
            <button v-if="editingId" class="btn btn-secondary" type="button" @click="reset">
              Annuler
            </button>
          </div>
        </form>
      </div>

      <div class="card">
        <h3>Projets</h3>
        <p v-if="error" class="error">{{ error }}</p>
        <div class="project-list">
          <article v-for="project in projects" :key="project.id" class="project-item">
            <div>
              <strong>{{ project.name }}</strong>
              <p class="muted">{{ project.stack }}</p>
            </div>
            <div class="actions">
              <button class="btn btn-secondary" type="button" @click="edit(project)">
                Editer
              </button>
              <button
                class="btn btn-secondary"
                type="button"
                :disabled="generatingId === project.id"
                @click="generateBulletin(project)"
              >
                {{ generatingId === project.id ? "Generation..." : "Bulletin IA" }}
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
import { onMounted, reactive, ref } from "vue";
import type { ProjectCard } from "../types";
import RichTextEditor from "./RichTextEditor.vue";
import { api } from "../utils/api";

const projects = ref<ProjectCard[]>([]);
const editingId = ref<string | null>(null);
const generatingId = ref<string | null>(null);
const error = ref("");
const selectedFile = ref<File | null>(null);
const previewUrl = ref<string>("");

const form = reactive({
  name: "",
  stack: "",
  summary: "",
  bulletin: "",
  siteUrl: "",
  repoUrl: "",
  imageUrl: "",
  duration: "",
});

const onFileChange = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) {
    return;
  }
  selectedFile.value = file;
  previewUrl.value = URL.createObjectURL(file);
};

const reset = (): void => {
  form.name = "";
  form.stack = "";
  form.summary = "";
  form.bulletin = "";
  form.siteUrl = "";
  form.repoUrl = "";
  form.imageUrl = "";
  form.duration = "";
  editingId.value = null;
  selectedFile.value = null;
  previewUrl.value = "";
};

const adminHeaders = (): HeadersInit => {
  const token = localStorage.getItem("admin_token") ?? "";
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

const isNumericId = (value: string): boolean => {
  return Number.isFinite(Number(value));
};

const load = async (): Promise<void> => {
  try {
    const response = await api.fetch("/api/projects");
    if (!response.ok) {
      error.value = `Impossible de charger les projets (API ${response.status}).`;
      return;
    }
    const data = (await response.json()) as ProjectCard[];
    if (Array.isArray(data) && data.length > 0) {
      projects.value = data;
    }
  } catch {
    error.value = "Impossible de charger les projets (API indisponible).";
  }
};

const uploadImage = async (projectId: string | number): Promise<string | null> => {
  if (!selectedFile.value) {
    return null;
  }
  const token = localStorage.getItem("admin_token") ?? "";
  const formData = new FormData();
  formData.append("file", selectedFile.value);

  const response = await api.fetch(`/api/admin/projects/${projectId}/image`, {
    method: "POST",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: formData,
  });

  if (!response.ok) {
    const detail = await response.text();
    error.value = `Echec upload image (API ${response.status}). ${detail}`;
    return null;
  }

  const data = (await response.json()) as { imageUrl?: string };
  return data.imageUrl ?? null;
};

const edit = (project: ProjectCard): void => {
  form.name = project.name;
  form.stack = project.stack;
  form.summary = project.summary;
  form.bulletin = project.bulletin;
  form.siteUrl = project.siteUrl;
  form.repoUrl = project.repoUrl;
  form.imageUrl = project.imageUrl ?? "";
  form.duration = project.duration ?? "";
  previewUrl.value = project.imageUrl ?? "";
  selectedFile.value = null;
  editingId.value = project.id;
};

const save = async (): Promise<void> => {
  error.value = "";
  if (editingId.value) {
    const index = projects.value.findIndex((item) => item.id === editingId.value);
    if (index >= 0) {
      const payload = {
        ...projects.value[index],
        name: form.name,
        stack: form.stack,
        summary: form.summary,
        bulletin: form.bulletin,
        siteUrl: form.siteUrl,
        repoUrl: form.repoUrl,
        imageUrl: form.imageUrl || undefined,
        duration: form.duration || undefined,
        status: "wip",
      };
      if (payload.imageUrl && payload.imageUrl.startsWith("data:")) {
        payload.imageUrl = undefined;
      }
      if (!isNumericId(editingId.value)) {
        error.value = "Impossible de mettre a jour: ID non numerique.";
      } else {
        const response = await api.fetch(`/api/admin/projects/${editingId.value}`, {
          method: "PUT",
          headers: adminHeaders(),
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          const detail = await response.text();
          error.value = `Echec de mise a jour (API ${response.status}). ${detail}`;
        } else {
          if (selectedFile.value) {
            await uploadImage(editingId.value);
          }
          await load();
        }
      }
    }
  } else {
    const payload = {
      name: form.name,
      stack: form.stack,
      summary: form.summary,
      bulletin: form.bulletin,
      siteUrl: form.siteUrl,
      repoUrl: form.repoUrl,
      imageUrl: form.imageUrl || undefined,
      duration: form.duration || undefined,
      progress: 0,
      status: "wip",
    } as ProjectCard & { status: string };
    if (payload.imageUrl && payload.imageUrl.startsWith("data:")) {
      payload.imageUrl = undefined;
    }

    const response = await api.fetch("/api/admin/projects", {
      method: "POST",
      headers: adminHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const detail = await response.text();
      error.value = `Echec de creation (API ${response.status}). ${detail}`;
    } else {
      const data = (await response.json()) as { id?: number };
      if (data.id) {
        if (selectedFile.value) {
          await uploadImage(data.id);
        }
        await load();
      }
    }
  }

  reset();
};

const remove = async (id: string): Promise<void> => {
  if (!isNumericId(id)) {
    error.value = "Suppression impossible: ID non numerique.";
    return;
  }

  const response = await api.fetch(`/api/admin/projects/${id}`, {
    method: "DELETE",
    headers: adminHeaders(),
  });
  if (!response.ok) {
    const detail = await response.text();
    error.value = `Echec de suppression (API ${response.status}). ${detail}`;
    return;
  }

  projects.value = projects.value.filter((item) => item.id !== id);
  if (editingId.value === id) {
    reset();
  }
};

const generateBulletin = async (project: ProjectCard): Promise<void> => {
  error.value = "";
  if (!isNumericId(project.id)) {
    error.value = "Generation bulletin indisponible (ID non numerique).";
    return;
  }
  generatingId.value = project.id;
  try {
    const response = await api.fetch(`/api/admin/projects/${project.id}/bulletin`, {
      method: "POST",
      headers: adminHeaders(),
    });
    if (!response.ok) {
      const detail = await response.text();
      error.value = `Echec generation bulletin (API ${response.status}). ${detail}`;
      return;
    }
    const data = (await response.json()) as { bulletin?: string };
    if (data.bulletin) {
      project.bulletin = data.bulletin;
      if (editingId.value === project.id) {
        form.bulletin = data.bulletin;
      }
    }
  } finally {
    generatingId.value = null;
  }
};

onMounted(() => {
  void load();
});
</script>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
}

.help {
  font-size: 12px;
  color: var(--muted);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 14px;
}

input,
textarea {
  border-radius: 10px;
  padding: 10px 12px;
  background: var(--bg);
  border: 1px solid var(--line);
  color: var(--text);
}

.form-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
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
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 12px 16px;
}

.preview {
  width: 100%;
  max-height: 180px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid var(--line);
}

.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.muted {
  color: var(--muted);
  margin: 4px 0 0;
}

.error {
  color: #f87171;
  margin-bottom: 12px;
}
</style>
