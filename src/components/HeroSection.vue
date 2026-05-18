<template>
  <section class="title-intro" aria-labelledby="portfolio-title">
    <div class="hero-wrap">
      <div class="title-paper">
        <div class="hero-copy">
          <p class="eyebrow">Portfolio dev + formation</p>
          <h1 id="portfolio-title" class="hero-title">{{ title }}</h1>
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
      </div>
    </div>
    <div class="tech-ticker" aria-label="Technologies principales">
      <div class="tech-ticker-track" aria-hidden="true">
        <span>Symfony + Vue.js + React + WordPress + Git + API + Formation + Fullstack +&nbsp;</span>
        <span>Symfony + Vue.js + React + WordPress + Git + API + Formation + Fullstack +&nbsp;</span>
      </div>
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
.title-intro {
  position: relative;
  padding: clamp(42px, 7vw, 84px) 0 0;
  overflow: hidden;
}

.hero-wrap {
  width: min(calc(var(--max-width) + (var(--gutter) * 2)), 100%);
  margin: 0 auto;
  padding: 0 var(--gutter);
}

.title-paper {
  position: relative;
  z-index: 1;
  display: grid;
  gap: clamp(24px, 5vw, 64px);
  align-items: end;
  padding: clamp(24px, 5vw, 54px);
  border: 3px solid var(--line);
  background: var(--bg-elev);
  transform: rotate(-1.4deg);
  box-shadow: var(--shadow-lg);
}

.title-paper::after {
  content: "";
  position: absolute;
  inset: 14px;
  border: 2px dashed rgba(18, 24, 39, 0.28);
  pointer-events: none;
}

.title-paper > * {
  position: relative;
  z-index: 1;
  transform: rotate(1.4deg);
}

.hero-copy {
  display: grid;
  gap: 16px;
  max-width: 900px;
  min-width: 0;
}

.eyebrow {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--muted);
}

.hero-title {
  font-family: var(--font-display);
  font-size: clamp(58px, 10vw, 112px);
  line-height: 0.82;
  font-weight: 900;
  text-transform: uppercase;
  margin: 0;
  letter-spacing: 0;
  max-width: 12ch;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.hero-tagline {
  font-size: clamp(20px, 3vw, 27px);
  line-height: 1.2;
  margin: 0;
  color: var(--text);
  max-width: 62ch;
  overflow-wrap: break-word;
}

.hero-subtitle {
  color: var(--muted);
  margin: 0;
  font-family: var(--font-mono);
  font-size: 13px;
  text-transform: uppercase;
  overflow-wrap: break-word;
}

.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.tech-ticker {
  position: relative;
  z-index: 2;
  margin: clamp(24px, 4vw, 44px) auto clamp(30px, 5vw, 58px);
  width: min(100%, 1280px);
  border: 3px solid var(--line);
  background: var(--text);
  color: var(--bg-elev);
  overflow: hidden;
  transform: translateX(12px);
  box-shadow: 10px 10px 0 var(--accent);
}

.tech-ticker-track {
  display: flex;
  width: max-content;
  animation: ticker 22s linear infinite;
}

.tech-ticker span {
  display: inline-flex;
  padding: 12px 0;
  font-family: var(--font-mono);
  font-size: 16px;
  line-height: 1;
  text-transform: uppercase;
  white-space: nowrap;
}

@keyframes ticker {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@media (prefers-reduced-motion: reduce) {
  .tech-ticker-track {
    animation: none;
  }
}

@media (max-width: 720px) {
  .title-paper {
    width: auto;
    max-width: 100%;
    padding: 24px;
    transform: none;
    box-shadow: 6px 6px 0 var(--line);
  }

  .title-paper::after {
    inset: 8px;
  }

  .title-paper > * {
    transform: none;
  }

  .hero-title {
    font-size: 48px;
  }

  .hero-tagline,
  .hero-subtitle {
    width: min(100%, calc(100vw - 128px));
    max-width: 100%;
    overflow-wrap: anywhere;
  }

  .hero-copy {
    width: min(100%, calc(100vw - 128px));
  }

  .tech-ticker {
    transform: none;
    box-shadow: 6px 6px 0 var(--accent);
  }

  .tech-ticker span {
    font-size: 13px;
  }

  .hero-actions {
    display: grid;
  }
}
</style>
