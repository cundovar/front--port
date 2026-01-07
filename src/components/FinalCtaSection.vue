<template>
  <section class="section">
    <div class="card final-cta">
      <div>
        <h2>{{ title }}</h2>
        <p class="muted">{{ subtitle }}</p>
      </div>
      <div class="cta-actions">
        <a class="btn btn-primary" :href="primaryHref">{{ primaryLabel }}</a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Props {
  primaryHref: string;
  title: string;
  subtitle: string;
  primaryLabel: string;
}

defineProps<Props>();
</script>

<style scoped>
.final-cta {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: flex-start;
}

.final-cta h2 {
  margin: 0 0 8px;
  font-family: "Sora", system-ui, sans-serif;
}

.cta-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.muted {
  color: var(--muted);
}

@media (min-width: 840px) {
  .final-cta {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
