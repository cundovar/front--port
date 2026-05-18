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
  border-top: 2px solid var(--line);
}

.stack-list li {
  border-bottom: 2px solid var(--line);
  padding: 22px 0;
  color: var(--text);
  background: transparent;
  font-size: clamp(20px, 3vw, 30px);
  line-height: 1.15;
}

.stack-list li::before {
  content: "->";
  display: inline-block;
  margin-right: 16px;
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 14px;
}
</style>
