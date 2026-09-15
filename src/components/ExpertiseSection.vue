<template>
  <section class="section expertise-section" aria-labelledby="expertise-title">
    <div class="expertise-header">
      <h2 id="expertise-title" class="section-title">Expertise</h2>
      <p class="section-subtitle">Trois domaines clés</p>
    </div>
    <div v-if="expertise.length" class="expertise-grid">
      <article v-for="item in expertise" :key="item.title" class="expertise-card">
        <h3 class="expertise-title">{{ item.title }}</h3>
        <div class="expertise-description" v-html="item.description"></div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
interface ExpertiseItem {
  title: string;
  description: string;
}

interface Props {
  expertise: ExpertiseItem[];
}

defineProps<Props>();
</script>

<style scoped>
.expertise-header {
  margin-bottom: clamp(40px, 8vw, 80px);
}

.expertise-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: clamp(24px, 4vw, 40px);
}

.expertise-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: clamp(24px, 4vw, 36px);
  border: 3px solid var(--line);
  background: var(--bg-elev);
  box-shadow: var(--shadow);
}

.expertise-title {
  font-family: var(--font-display);
  font-size: clamp(20px, 3vw, 24px);
  line-height: 0.95;
  text-transform: uppercase;
  margin: 0;
  color: var(--text);
}

.expertise-description {
  font-size: 16px;
  line-height: 1.5;
  color: var(--muted);
  margin: 0;
}

@media (max-width: 720px) {
  .expertise-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .expertise-card {
    padding: 20px;
    box-shadow: 6px 6px 0 var(--line);
  }
}
</style>
