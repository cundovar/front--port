<template>
  <section class="section about-section">
    <div class="about-card">
      <div class="about-content">
        <h2 class="about-title">{{ title }}</h2>
        <p class="about-subtitle">{{ subtitle }}</p>
        <div class="about-bio" v-html="bio"></div>
        <div v-if="trustItems && trustItems.length" class="trust-strip">
          <span v-for="item in trustItems" :key="item" class="trust-pill">{{ item }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  subtitle: string;
  bio: string;
  trustItems?: string[];
}

defineProps<Props>();
</script>

<style scoped>
.about-section {
  position: relative;
}

.about-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
}

.about-content {
  max-width: 820px;
}

.about-title {
  font-family: var(--font-display);
  font-size: clamp(48px, 9vw, 92px);
  line-height: 0.82;
  text-transform: uppercase;
  margin: 0 0 18px;
  color: var(--text);
}

.about-subtitle {
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 13px;
  margin: 0 0 24px;
  font-weight: 600;
  text-transform: uppercase;
}

.about-bio {
  color: var(--text);
  font-size: clamp(21px, 3vw, 30px);
  line-height: 1.12;
  margin: 0 0 28px;
}

.about-bio :deep(p) {
  margin: 0 0 12px;
}

.about-bio :deep(p:last-child) {
  margin-bottom: 0;
}

.about-bio :deep(strong) {
  color: var(--text);
  font-weight: 600;
}

.about-bio :deep(ul) {
  padding-left: 20px;
  margin: 0 0 12px;
}

.about-bio :deep(h2),
.about-bio :deep(h3) {
  color: var(--text);
  margin: 16px 0 8px;
}

.about-highlights {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.about-highlights li {
  padding: 8px 16px;
  background: rgba(250, 204, 21, 0.1);
  border: 1px solid var(--yellow);
  border-radius: 20px;
  color: var(--yellow);
  font-size: 14px;
  font-weight: 500;
}

.trust-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}

.trust-pill {
  padding: 8px 12px;
  background: var(--bg-elev);
  border: 2px solid var(--line);
  border-radius: 0;
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

@media (max-width: 768px) {
  .about-overlay {
    padding: 32px 24px;
  }

  .about-card {
    min-height: 350px;
  }
}
</style>
