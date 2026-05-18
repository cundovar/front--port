<template>
  <div>
    <section class="section">
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

.card h3,
.modal-header h3 {
  font-family: var(--font-display);
  font-size: clamp(34px, 5vw, 54px);
  line-height: 0.86;
  text-transform: uppercase;
  margin: 0 0 16px;
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
  gap: 16px;
  border-bottom: 2px solid var(--line);
  padding-bottom: 10px;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.anchor {
  display: block;
  height: 0;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: color-mix(in oklch, var(--bg) 76%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 50;
}

.modal {
  width: min(860px, 100%);
  background: var(--bg-elev);
  border: 3px solid var(--line);
  border-radius: 0;
  padding: 24px;
  box-shadow: var(--shadow-lg);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
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
  font-family: var(--font-mono);
  font-size: 13px;
  text-transform: uppercase;
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

@media (max-width: 768px) {
  .modal-backdrop {
    padding: 12px;
    align-items: flex-start;
    overflow-y: auto;
  }

  .modal {
    max-height: none;
    padding: 16px;
    margin: 0;
  }

  .modal-header {
    position: sticky;
    top: -16px;
    background: var(--bg-elev);
    padding: 12px 0;
    margin: -16px -16px 16px;
    padding: 16px;
    border-bottom: 2px solid var(--line);
    z-index: 10;
  }
}
</style>
