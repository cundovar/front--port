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
  gap: 16px;
}

.teaching-card {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 20px;
  transition: border-color 0.2s;
}

.teaching-card:hover {
  border-color: var(--yellow);
}

.card-title {
  margin: 0 0 12px;
  font-size: 18px;
  font-weight: 600;
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
  font-size: 14px;
  padding-left: 12px;
  position: relative;
}

.topics-list li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: var(--yellow);
}
</style>
