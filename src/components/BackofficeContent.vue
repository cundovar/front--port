<template>
  <section class="section">
    <h2 class="section-title">Backoffice Contenu</h2>
    <p class="section-subtitle">Edition du contenu du site.</p>

    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab', { active: activeTab === tab.key }]"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <form class="content-form" @submit.prevent="save">
      <!-- HEADER -->
      <div v-show="activeTab === 'header'" class="form-section">
        <h3>Header</h3>
        <div class="field">
          <label>Logo Text</label>
          <input v-model="content.header.logoText" type="text" />
        </div>
        <div class="field">
          <label>Email de contact</label>
          <input v-model="content.header.contactEmail" type="email" />
        </div>
        <div class="field">
          <label>URL du site</label>
          <input v-model="content.header.siteUrl" type="url" />
        </div>
      </div>

      <!-- HERO -->
      <div v-show="activeTab === 'hero'" class="form-section">
        <h3>Hero</h3>
        <div class="field">
          <label>Titre</label>
          <input v-model="content.hero.title" type="text" />
        </div>
        <div class="field">
          <label>Tagline</label>
          <input v-model="content.hero.tagline" type="text" />
        </div>
        <div class="field">
          <label>Sous-titre</label>
          <input v-model="content.hero.subtitle" type="text" />
        </div>
        <div class="field">
          <label>Bouton principal - Texte</label>
          <input v-model="content.hero.primaryLabel" type="text" />
        </div>
        <div class="field">
          <label>Bouton principal - Lien</label>
          <input v-model="content.hero.primaryHref" type="text" />
        </div>
        <div class="field">
          <label>Bouton secondaire - Texte</label>
          <input v-model="content.hero.secondaryLabel" type="text" />
        </div>
        <div class="field">
          <label>Bouton secondaire - Lien</label>
          <input v-model="content.hero.secondaryHref" type="text" />
        </div>
      </div>

      <!-- ABOUT -->
      <div v-show="activeTab === 'about'" class="form-section">
        <h3>A propos</h3>
        <div class="field">
          <label>Titre</label>
          <input v-model="content.about.title" type="text" />
        </div>
        <div class="field">
          <label>Sous-titre</label>
          <input v-model="content.about.subtitle" type="text" />
        </div>
        <div class="field">
          <label>Bio (texte riche)</label>
          <RichTextEditor v-model="content.about.bio" />
        </div>
      </div>

      <!-- STACK -->
      <div v-show="activeTab === 'stack'" class="form-section">
        <h3>Stack & techniques</h3>
        <div class="field">
          <label>Titre</label>
          <input v-model="content.stack.title" type="text" />
        </div>
        <div class="field">
          <label>Sous-titre</label>
          <input v-model="content.stack.subtitle" type="text" />
        </div>
        <div class="field">
          <label>Elements de stack</label>
          <textarea
            v-model="stackItemsText"
            rows="8"
            spellcheck="false"
            placeholder="Une ligne par element"
          ></textarea>
        </div>
      </div>

      <!-- TEACHING -->
      <div v-show="activeTab === 'teaching'" class="form-section">
        <h3>Enseignement</h3>
        <div class="field">
          <label>Titre</label>
          <input v-model="content.teaching.title" type="text" />
        </div>
        <div class="field">
          <label>Sous-titre</label>
          <input v-model="content.teaching.subtitle" type="text" />
        </div>
        <div class="field">
          <label>Technologies</label>
          <textarea
            v-model="teachingItemsText"
            rows="12"
            spellcheck="false"
            placeholder="HTML | Semantique HTML5, Accessibilite, SEO basics, Formulaires"
          ></textarea>
        </div>
      </div>

      <!-- SKILLS -->
      <div v-show="activeTab === 'skills'" class="form-section">
        <h3>Competences (IA Detective)</h3>

        <div class="ai-generate-box">
          <p class="muted">
            Analyse automatique de ton profil GitHub via OpenAI.
            <span v-if="skillsGeneratedAt">Derniere analyse: {{ skillsGeneratedAt }}</span>
          </p>
          <div class="ai-buttons">
            <button
              type="button"
              class="btn btn-primary"
              :disabled="generatingSkills"
              @click="generateSkills(false)"
            >
              {{ generatingSkills ? "Generation..." : "Regenerer analyse IA" }}
            </button>
            <button
              type="button"
              class="btn btn-secondary"
              :disabled="generatingSkills"
              @click="generateSkills(true)"
            >
              Sans IA (fallback)
            </button>
          </div>
          <p v-if="skillsSuccess" class="success">{{ skillsSuccess }}</p>
          <p v-if="skillsError" class="error">{{ skillsError }}</p>
        </div>

        <div class="field">
          <label>Titre</label>
          <input v-model="content.skills.title" type="text" />
        </div>
        <div class="field">
          <label>Sous-titre</label>
          <input v-model="content.skills.subtitle" type="text" />
        </div>
        <div class="field">
          <label>Resume (texte riche)</label>
          <RichTextEditor v-model="content.skills.summary" />
        </div>
      </div>

      <!-- PROJECTS -->
      <div v-show="activeTab === 'projects'" class="form-section">
        <h3>Projets</h3>
        <div class="field">
          <label>Titre</label>
          <input v-model="content.projects.title" type="text" />
        </div>
        <div class="field">
          <label>Sous-titre</label>
          <input v-model="content.projects.subtitle" type="text" />
        </div>
      </div>

      <!-- CTA -->
      <div v-show="activeTab === 'cta'" class="form-section">
        <h3>Call to Action</h3>
        <div class="field">
          <label>Titre</label>
          <input v-model="content.cta.title" type="text" />
        </div>
        <div class="field">
          <label>Sous-titre</label>
          <input v-model="content.cta.subtitle" type="text" />
        </div>
        <div class="field">
          <label>Bouton principal</label>
          <input v-model="content.cta.primaryLabel" type="text" />
        </div>
      </div>

      <!-- FOOTER -->
      <div v-show="activeTab === 'footer'" class="form-section">
        <h3>Footer</h3>
        <div class="field">
          <label>Tagline</label>
          <input v-model="content.footer.tagline" type="text" />
        </div>

        <h4>Liens</h4>
        <div v-for="(link, index) in content.footer.links" :key="index" class="link-row">
          <input v-model="link.label" type="text" placeholder="Label" />
          <input v-model="link.url" type="url" placeholder="URL" />
          <button type="button" class="btn btn-secondary btn-sm" @click="removeFooterLink(index)">
            Supprimer
          </button>
        </div>
        <button type="button" class="btn btn-secondary" @click="addFooterLink">
          + Ajouter un lien
        </button>
      </div>

      <!-- JSON BRUT -->
      <div v-show="activeTab === 'json'" class="form-section">
        <h3>JSON Brut</h3>
        <p class="muted">Mode avance: edition directe du JSON complet.</p>
        <textarea v-model="rawJson" rows="22" spellcheck="false"></textarea>
        <button type="button" class="btn btn-secondary" @click="applyRawJson">
          Appliquer le JSON
        </button>
      </div>

      <div class="toolbar">
        <button class="btn btn-secondary" type="button" @click="reset">
          Reinitialiser
        </button>
        <button class="btn btn-primary" type="submit" :disabled="saving">
          {{ saving ? "Enregistrement..." : "Enregistrer" }}
        </button>
      </div>

      <p v-if="success" class="success">{{ success }}</p>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import type { ContentData } from "../types";
import defaultContent from "../data/content.json";
import RichTextEditor from "./RichTextEditor.vue";
import { api } from "../utils/api";

const tabs = [
  { key: "header", label: "Header" },
  { key: "hero", label: "Hero" },
  { key: "about", label: "A propos" },
  { key: "stack", label: "Stack" },
  { key: "teaching", label: "Enseignement" },
  { key: "skills", label: "Competences" },
  { key: "projects", label: "Projets" },
  { key: "cta", label: "CTA" },
  { key: "footer", label: "Footer" },
  { key: "json", label: "JSON" },
];

const activeTab = ref("header");
const content = reactive<ContentData>(structuredClone(defaultContent) as ContentData);
const rawJson = ref(JSON.stringify(defaultContent, null, 2));
const error = ref("");
const success = ref("");
const saving = ref(false);
const stackItemsText = computed({
  get: () => content.stack.items.join("\n"),
  set: (value: string) => {
    content.stack.items = value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  },
});
const teachingItemsText = computed({
  get: () =>
    content.teaching.items
      .map((item) => `${item.name} | ${item.topics.join(", ")}`)
      .join("\n"),
  set: (value: string) => {
    content.teaching.items = value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [namePart, topicsPart = ""] = line.split("|");
        const name = namePart.trim();
        const topics = topicsPart
          .split(",")
          .map((topic) => topic.trim())
          .filter(Boolean);

        return { name, topics };
      })
      .filter((item) => item.name.length > 0);
  },
});

const generatingSkills = ref(false);
const skillsError = ref("");
const skillsSuccess = ref("");
const skillsGeneratedAt = ref("");

const updateRawJson = (): void => {
  rawJson.value = JSON.stringify(content, null, 2);
};

watch(content, updateRawJson, { deep: true });

const applyRawJson = (): void => {
  try {
    const parsed = JSON.parse(rawJson.value) as ContentData;
    Object.assign(content, parsed);
    error.value = "";
    success.value = "JSON applique.";
  } catch {
    error.value = "JSON invalide.";
  }
};

const load = async (): Promise<void> => {
  try {
    const response = await api.fetch("/api/content");
    if (!response.ok) return;
    const data = (await response.json()) as ContentData;
    Object.assign(content, data);
  } catch {
    // Keep default
  }
};

const reset = (): void => {
  Object.assign(content, structuredClone(defaultContent) as ContentData);
  error.value = "";
  success.value = "";
};

const addFooterLink = (): void => {
  if (!content.footer.links) {
    content.footer.links = [];
  }
  content.footer.links.push({ label: "", url: "" });
};

const removeFooterLink = (index: number): void => {
  content.footer.links.splice(index, 1);
};

const generateSkills = async (skipAi: boolean): Promise<void> => {
  skillsError.value = "";
  skillsSuccess.value = "";
  generatingSkills.value = true;

  const token = localStorage.getItem("admin_token") ?? "";

  try {
    const response = await api.fetch("/api/admin/skills/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({ skipAi }),
    });

    if (!response.ok) {
      const detail = await response.text();
      skillsError.value = `Echec (${response.status}). ${detail}`;
    } else {
      const data = await response.json();
      skillsGeneratedAt.value = data.snapshot?.generatedAt ?? "";
      skillsSuccess.value = data.aiUsed
        ? "Analyse IA generee avec succes."
        : "Analyse fallback generee (sans IA).";
    }
  } catch {
    skillsError.value = "Erreur reseau.";
  }

  generatingSkills.value = false;
};

const loadSkillsInfo = async (): Promise<void> => {
  try {
    const response = await api.fetch("/api/skills");
    if (response.ok) {
      const data = await response.json();
      skillsGeneratedAt.value = data.generatedAt ?? "";
    }
  } catch {
    // Ignore
  }
};

const save = async (): Promise<void> => {
  error.value = "";
  success.value = "";
  saving.value = true;

  const token = localStorage.getItem("admin_token") ?? "";
  const response = await api.fetch("/api/admin/content", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify(content),
  });

  if (!response.ok) {
    const detail = await response.text();
    error.value = `Echec (${response.status}). ${detail}`;
  } else {
    success.value = "Sauvegarde OK.";
    await load();
  }
  saving.value = false;
};

onMounted(() => {
  void load();
  void loadSkillsInfo();
});
</script>

<style scoped>
.tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.tab {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid var(--line);
  border-radius: 8px;
  color: var(--text);
  cursor: pointer;
  font-size: 14px;
}

.tab:hover {
  background: var(--surface);
}

.tab.active {
  background: var(--yellow);
  color: var(--bg-alt);
  border-color: var(--yellow);
}

.form-section {
  margin-bottom: 24px;
}

.form-section h3 {
  margin-bottom: 16px;
  color: var(--yellow);
}

.form-section h4 {
  margin: 20px 0 12px;
  font-size: 14px;
  color: var(--text);
}

.link-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
}

.link-row input {
  flex: 1;
  padding: 8px 10px;
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: 6px;
  color: var(--text);
  font-size: 14px;
}

.link-row input:focus {
  outline: none;
  border-color: var(--yellow);
}

.btn-sm {
  padding: 6px 10px;
  font-size: 12px;
}

.field {
  margin-bottom: 16px;
}

.field label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  color: var(--muted);
}

.field input {
  width: 100%;
  padding: 10px 12px;
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: 8px;
  color: var(--text);
  font-size: 14px;
}

.field input:focus {
  outline: none;
  border-color: var(--yellow);
}

textarea {
  width: 100%;
  min-height: 360px;
  border-radius: 8px;
  padding: 12px;
  background: var(--bg);
  border: 1px solid var(--line);
  color: var(--text);
  font-family: "IBM Plex Mono", monospace;
  margin-bottom: 12px;
}

.toolbar {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--line);
}

.muted {
  color: var(--muted);
  font-size: 13px;
  margin-bottom: 12px;
}

.error {
  color: #f87171;
  margin-top: 12px;
}

.success {
  color: #22c55e;
  margin-top: 12px;
}

.ai-generate-box {
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.ai-generate-box .muted {
  margin: 0 0 12px;
}

.ai-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.ai-generate-box .success,
.ai-generate-box .error {
  margin-top: 12px;
  margin-bottom: 0;
}
</style>
