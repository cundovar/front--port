<template>
  <section class="section">
    <h2 class="section-title">{{ title }}</h2>
    <p class="section-subtitle">{{ subtitle }}</p>
    <div class="teaching-carousel">
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
.teaching-carousel {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding-bottom: 12px;
  -webkit-overflow-scrolling: touch;
}

.teaching-carousel::-webkit-scrollbar {
  height: 4px;
}

.teaching-carousel::-webkit-scrollbar-track {
  background: var(--bg-elev);
  border-radius: 0;
}

.teaching-carousel::-webkit-scrollbar-thumb {
  background: var(--line);
  border-radius: 0;
}

.teaching-card {
  flex: 0 0 85%;
  min-width: 260px;
  background: var(--bg-elev);
  border: 2px solid var(--line);
  border-radius: 0;
  padding: 20px;
  scroll-snap-align: start;
  box-shadow: 7px 7px 0 var(--line);
}

.card-title {
  margin: 0 0 12px;
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
  padding-left: 12px;
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
