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
  background:
    repeating-linear-gradient(90deg, var(--soft) 0 12px, transparent 12px 24px),
    var(--bg-elev);
}

.final-cta h2 {
  margin: 0 0 8px;
  font-family: var(--font-display);
  font-size: clamp(42px, 8vw, 76px);
  line-height: 0.86;
  text-transform: uppercase;
}

.cta-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.muted {
  color: var(--muted);
  max-width: 58ch;
  font-size: clamp(17px, 3vw, 21px);
}

@media (min-width: 840px) {
  .final-cta {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
