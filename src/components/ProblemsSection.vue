<template>
  <section class="section problems-section" aria-labelledby="problems-title">
    <div class="problems-header">
      <h2 id="problems-title" class="section-title">Vous vous reconnaissez ?</h2>
      <p class="section-subtitle">Des situations concrètes pour lesquelles je peux vous aider</p>
    </div>
    <div v-if="problems.length" class="problems-grid">
      <article v-for="(problem, index) in problems" :key="problem.title" class="problem-card">
        <div class="problem-number">{{ String(index + 1).padStart(2, '0') }}</div>
        <h3 class="problem-title">{{ problem.title }}</h3>
        <p class="problem-description">{{ problem.description }}</p>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Problem {
  title: string;
  description: string;
}

interface Props {
  problems: Problem[];
}

defineProps<Props>();
</script>

<style scoped>
.problems-header {
  margin-bottom: clamp(40px, 8vw, 80px);
}

.problems-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: clamp(24px, 4vw, 40px);
}

.problem-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: clamp(24px, 4vw, 36px);
  border: 3px solid var(--line);
  background: var(--bg-elev);
  position: relative;
}

.problem-number {
  font-family: var(--font-display);
  font-size: 64px;
  font-weight: 900;
  color: var(--accent);
  line-height: 1;
  margin-bottom: 8px;
  opacity: 1;
  text-shadow: 3px 3px 0 color-mix(in oklch, var(--line) 16%, transparent);
}

.problem-title {
  font-family: var(--font-display);
  font-size: clamp(20px, 3vw, 24px);
  line-height: 1;
  text-transform: uppercase;
  margin: 0;
  color: var(--text);
}

.problem-description {
  font-size: 16px;
  line-height: 1.5;
  color: var(--muted);
  margin: 0;
}

@media (max-width: 720px) {
  .problems-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .problem-card {
    padding: 20px;
  }

  .problem-number {
    font-size: 48px;
  }
}
</style>
