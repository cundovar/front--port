<template>
  <section class="section">
    <h2 class="section-title">{{ title }}</h2>
    <p class="section-subtitle">{{ subtitle }}</p>
    <ul class="stack-list">
      <li v-for="item in items" :key="item">{{ item }}</li>
    </ul>
  </section>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  subtitle: string;
  items: string[];
}

defineProps<Props>();
</script>

<style scoped>
.stack-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 12px;
}

.stack-list li {
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 12px 16px;
  color: var(--text);
  background: var(--panel);
}
</style>
