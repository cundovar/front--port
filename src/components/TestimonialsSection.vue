<template>
  <section class="section">
    <h2 class="section-title">{{ title }}</h2>
    <p class="section-subtitle">{{ subtitle }}</p>
    <div class="grid grid-3">
      <article v-for="item in testimonials" :key="item.author" class="card">
        <p class="quote">"{{ item.quote }}"</p>
        <p class="author">{{ item.author }}</p>
        <p class="role">{{ item.role }}</p>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Testimonial } from "../types";

interface Props {
  title: string;
  subtitle: string;
  testimonials: Testimonial[];
}

defineProps<Props>();
</script>

<style scoped>
.quote {
  margin: 0 0 20px;
  color: var(--text);
}

.author {
  font-weight: 600;
  margin: 0;
}

.role {
  margin: 4px 0 0;
  color: var(--muted);
  font-size: 14px;
}
</style>
