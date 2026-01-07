<template>
  <section class="section about-section">
    <div class="about-card">
      <div class="about-content">
        <h2 class="about-title">{{ title }}</h2>
        <p class="about-subtitle">{{ subtitle }}</p>
        <div class="about-bio" v-html="bio"></div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  subtitle: string;
  bio: string;
}

defineProps<Props>();
</script>

<style scoped>
.about-section {
  position: relative;
}

.about-section::before {
  content: "";
  position: absolute;
  width: 350px;
  height: 350px;
  background: var(--orange);
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.1;
  top: -50px;
  right: 50px;
  pointer-events: none;
  z-index: -1;
}

.about-card {

}

.about-content {
  max-width: 600px;
}

.about-title {
  font-family: "Sora", system-ui, sans-serif;
  font-size: clamp(28px, 4vw, 40px);
  margin: 0 0 8px;
  color: var(--text);
}

.about-subtitle {
  color: var(--yellow);
  font-size: 16px;
  margin: 0 0 20px;
  font-weight: 500;
}

.about-bio {
  color: var(--muted);
  font-size: 16px;
  line-height: 1.7;
  margin: 0 0 24px;
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

@media (max-width: 768px) {
  .about-overlay {
    padding: 32px 24px;
  }

  .about-card {
    min-height: 350px;
  }
}
</style>
