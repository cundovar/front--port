<template>
  <section class="section">
    <span id="skills" class="anchor" aria-hidden="true"></span>
    <h2 class="section-title">{{ title }}</h2>
    <p class="section-subtitle">{{ subtitle }}</p>
    <div class="grid grid-2">
      <div class="card">
        <h3>Resume</h3>
        <div class="muted summary-content" v-html="summary"></div>
        <button class="btn btn-secondary" type="button" @click="open = true">
          Voir l'analyse complete
        </button>
      </div>
      <div class="card">
        <h3>Preuves</h3>
        <ul class="evidence">
          <li v-for="item in evidence" :key="item.label">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </li>
        </ul>
      </div>
    </div>
  </section>
  <div v-if="open" class="modal-backdrop" @click.self="open = false">
    <div class="modal">
      <div class="modal-header">
        <h3>Analyse complete</h3>
        <button class="btn btn-secondary" type="button" @click="open = false">Fermer</button>
      </div>
      <div class="muted summary-content" v-html="summary"></div>
      <div v-if="generatedAt" class="meta">Genere le {{ generatedAt }}</div>

      <div class="modal-grid">
        <div>
          <h4>Preuves</h4>
          <ul class="evidence">
            <li v-for="item in evidence" :key="item.label">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </li>
          </ul>
        </div>
        <div>
          <h4>Top competences</h4>
          <ul class="evidence">
            <li v-for="item in topSkills" :key="item.label">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </li>
          </ul>
          <div v-if="hiddenSkills?.length" class="hidden-skills">
            <h4>Competences cachees</h4>
            <ul class="evidence">
              <li v-for="item in hiddenSkills" :key="item.label">
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { SkillDetail, SkillEvidence } from "../types";

interface Props {
  title: string;
  subtitle: string;
  summary: string;
  evidence: SkillEvidence[];
  topSkills?: SkillDetail[];
  hiddenSkills?: SkillDetail[];
  generatedAt?: string;
}

defineProps<Props>();

const open = ref(false);
</script>

<style scoped>
.muted {
  color: var(--muted);
}

.summary-content :deep(p) {
  margin: 0 0 8px;
}

.summary-content :deep(p:last-child) {
  margin-bottom: 0;
}

.summary-content :deep(strong) {
  color: var(--text);
  font-weight: 600;
}

.summary-content :deep(ul) {
  padding-left: 20px;
  margin: 0 0 8px;
}

.evidence {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 12px;
}

.evidence li {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid var(--line);
  padding-bottom: 8px;
}

.anchor {
  display: block;
  height: 0;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(8, 12, 18, 0.72);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 50;
}

.modal {
  width: min(860px, 100%);
  background: var(--bg-elev);
  border: 1px solid var(--line);
  border-radius: 20px;
  padding: 24px;
  box-shadow: var(--shadow);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.modal-header h3 {
  margin: 0;
  font-family: "Sora", system-ui, sans-serif;
}

.modal-header .btn {
  cursor: pointer;
}

.modal-grid {
  display: grid;
  gap: 20px;
  margin-top: 20px;
}

.modal-grid h4 {
  margin: 0 0 10px;
  font-size: 15px;
}

.meta {
  color: var(--muted);
  font-size: 12px;
  margin-top: 8px;
}

.hidden-skills {
  margin-top: 16px;
}

@media (min-width: 860px) {
  .modal-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
