<template>
  <section class="section">
    <h2 class="section-title">{{ title }}</h2>
    <p class="section-subtitle">{{ subtitle }}</p>
    <div class="teaching-grid">
      <div v-for="item in items" :key="item.name" class="teaching-card">
        <h3 class="card-title">{{ item.name }}</h3>
        <ul class="topics-list">
          <li v-for="topic in item.topics" :key="topic">{{ topic }}</li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { TeachingItem } from "../types";

interface Props {
  title: string;
  subtitle: string;
  items: TeachingItem[];
}

defineProps<Props>();
</script>

<style scoped>
.teaching-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 0;
  border-top: 2px solid var(--line);
  border-left: 2px solid var(--line);
}

.teaching-card {
  background: var(--bg-elev);
  border-right: 2px solid var(--line);
  border-bottom: 2px solid var(--line);
  border-radius: 0;
  padding: 22px;
  transition: background 160ms var(--ease);
}

.teaching-card:hover {
  background: var(--soft);
}

.card-title {
  margin: 0 0 18px;
  font-family: var(--font-display);
  font-size: 34px;
  line-height: 0.9;
  font-weight: 900;
  text-transform: uppercase;
  color: var(--text);
}

.topics-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.topics-list li {
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  padding-left: 18px;
  position: relative;
  text-transform: uppercase;
}

.topics-list li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: var(--accent);
}
</style>
