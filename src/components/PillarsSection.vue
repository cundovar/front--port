<template>
  <section class="section">
    <h2 class="section-title">{{ displayTitle }}</h2>
    <p class="section-subtitle">{{ subtitle }}</p>
    <div class="grid grid-2">
      <article v-for="pillar in visiblePillars" :key="pillar.title" class="card pillar">
        <h3>{{ pillar.title }}</h3>
        <p>{{ pillar.description }}</p>
        <button class="btn btn-secondary" type="button">{{ pillar.ctaLabel }}</button>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { PillarCard } from "../types";

interface Props {
  title: string;
  subtitle: string;
  pillars: PillarCard[];
}

const props = defineProps<Props>();

const visiblePillars = computed(() =>
  props.pillars.filter((pillar) => !/assistant/i.test(pillar.title)).slice(0, 2),
);

const displayTitle = computed(() =>
  visiblePillars.value.length === 2 ? props.title.replace("3", "2") : props.title,
);
</script>

<style scoped>
.pillar h3 {
  margin: 0 0 12px;
  font-family: "Sora", system-ui, sans-serif;
}

.pillar p {
  color: var(--muted);
  margin: 0 0 20px;
}
</style>
