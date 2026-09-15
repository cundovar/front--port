<template>
  <section class="section">
    <h2 class="section-title">{{ title }}</h2>
    <p class="section-subtitle">{{ subtitle }}</p>
    <div class="ai-grid">
      <div v-for="item in items" :key="item.name" class="ai-card">
        <h3 class="card-name">{{ item.name }}</h3>
        <span class="card-role">{{ item.role }}</span>
        <p class="card-description">{{ item.description }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { AiToolItem } from "../types";

interface Props {
  title: string;
  subtitle: string;
  items: AiToolItem[];
}

defineProps<Props>();
</script>

<style scoped>
.ai-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  border-top: 2px solid var(--line);
  border-left: 2px solid var(--line);
}

.ai-card {
  padding: 26px 22px;
  background: var(--bg-elev);
  border-right: 2px solid var(--line);
  border-bottom: 2px solid var(--line);
  transition: background 160ms var(--ease);
}

.ai-card:hover {
  background: var(--soft);
}

.card-name {
  margin: 0 0 12px;
  font-family: var(--font-display);
  font-size: 34px;
  font-weight: 900;
  line-height: 0.9;
  text-transform: uppercase;
  color: var(--text);
}

.card-role {
  display: inline-block;
  margin-bottom: 14px;
  padding: 3px 8px;
  border: 2px solid var(--accent);
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--accent);
  letter-spacing: 0.06em;
}

.card-description {
  margin: 0;
  font-family: var(--font-body);
  font-size: 14px;
  line-height: 1.6;
  color: var(--muted);
}
</style>
