<template>
  <ol class="quote-progress">
    <li
      v-for="(label, index) in labels"
      :key="label"
      class="quote-progress-item"
      :class="{ active: index === currentIndex, done: index < currentIndex }"
      :aria-current="index === currentIndex ? 'step' : undefined"
    >
      <span class="quote-progress-index">{{ index + 1 }}</span>
      <span class="quote-progress-label">{{ label }}</span>
    </li>
  </ol>
</template>

<script setup lang="ts">
defineProps<{ labels: string[]; currentIndex: number }>();
</script>

<style scoped>
.quote-progress { display: flex; flex-wrap: wrap; gap: 12px; margin: 0 0 28px; padding: 0; list-style: none; }
.quote-progress-item { display: flex; align-items: center; gap: 8px; font-family: var(--font-mono); font-size: 11px; font-weight: 700; text-transform: uppercase; opacity: 0.5; }
.quote-progress-item.active, .quote-progress-item.done { opacity: 1; }
.quote-progress-index { display: grid; place-items: center; width: 24px; height: 24px; border: 2px solid var(--line); }
.quote-progress-item.active .quote-progress-index { background: var(--text); color: var(--bg); }
@media (max-width: 640px) { .quote-progress-label { display: none; } }
</style>
