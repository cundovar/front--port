<template>
  <section class="section hero">
    <div class="hero-content">
      <h1 class="hero-title">{{ title }}</h1>
      <p class="hero-tagline">{{ tagline }}</p>
      <p class="hero-subtitle">{{ subtitle }}</p>
      <div class="hero-actions">
        <slot name="primary">
          <a class="btn btn-primary" :href="primaryHref">{{ primaryLabel }}</a>
        </slot>
        <slot name="secondary">
          <a class="btn btn-secondary" :href="secondaryHref">{{ secondaryLabel }}</a>
        </slot>
      </div>
    </div>
    <div class="hero-preview">
      <slot name="preview"></slot>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  tagline: string;
  subtitle: string;
  primaryLabel: string;
  secondaryLabel: string;
  primaryHref: string;
  secondaryHref: string;
}

defineProps<Props>();
</script>

<style scoped>
.hero {
  display: grid;
  gap: 32px;
  position: relative;
  overflow: visible;
}

.hero::before,
.hero::after {
  content: "";
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
  pointer-events: none;
  z-index: -1;
}

.hero::before {
  width: 400px;
  height: 400px;
  background: var(--yellow);
  top: -100px;
  right: -50px;
  opacity: 0.15;
}

.hero::after {
  width: 300px;
  height: 300px;
  background: var(--blue);
  top: 150px;
  right: 100px;
  opacity: 0.1;
}

.hero-title {
  font-family: "Sora", system-ui, sans-serif;
  font-size: clamp(32px, 5vw, 56px);
  margin: 16px 0 12px;
}

.hero-tagline {
  font-size: 18px;
  margin: 0 0 16px;
  color: var(--text);
}

.hero-subtitle {
  color: var(--muted);
  margin: 0 0 24px;
}

.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.preview-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preview-title {
  font-weight: 600;
  margin: 0;
}

.preview-text {
  color: var(--muted);
  margin: 0;
}

.preview-cta {
  margin-top: 8px;
  font-weight: 600;
  color: var(--yellow);
}

@media (min-width: 960px) {
  .hero {
    grid-template-columns: 1.1fr 0.9fr;
    align-items: center;
  }
}
</style>
