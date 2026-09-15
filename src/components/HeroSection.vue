<template>
  <section class="title-intro" aria-labelledby="portfolio-title">
    <div class="hero-wrap">
      <div class="title-paper">
        <div class="hero-copy">
          <p class="eyebrow">Portfolio dev + formation</p>
          <h1 id="portfolio-title" class="hero-title" :aria-label="title">
            <span
              v-for="line in titleLines"
              :key="line"
              class="hero-title-line"
              aria-hidden="true"
            >
              {{ line }}
            </span>
          </h1>
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
    <div class="hero-proofs" aria-label="Mes engagements">
      <p v-for="proof in proofs" :key="proof" class="hero-proof">{{ proof }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  title: string;
  tagline: string;
  subtitle: string;
  primaryLabel: string;
  secondaryLabel: string;
  primaryHref: string;
  secondaryHref: string;
  proofItems?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  proofItems: () => []
});

const fallbackProofs = [
  "De l'idée à la mise en ligne",
  "Solutions administrables et documentées",
  "Paris 20e · À distance partout en France"
];

const titleLines = computed(() => {
  const normalizedTitle = props.title.replace(/\s+/g, " ").trim();

  if (!normalizedTitle) return [];

  if (normalizedTitle.includes("&")) {
    return normalizedTitle
      .split(/\s*&\s*/)
      .filter(Boolean)
      .map((part, index) => (index === 0 ? part : `& ${part}`));
  }

  return [normalizedTitle];
});

const proofs = computed(() => {
  const items = props.proofItems.map((item) => item.trim()).filter(Boolean);
  return items.length ? items : fallbackProofs;
});
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
  font-size: clamp(50px, 8vw, 96px);
  line-height: 0.9;
  font-weight: 900;
  text-transform: uppercase;
  margin: 0;
  letter-spacing: 0;
  max-width: min(14ch, 100%);
  overflow-wrap: normal;
  word-break: normal;
  text-wrap: balance;
}

.hero-title-line {
  display: block;
  max-width: 100%;
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

.hero-proofs {
  position: relative;
  z-index: 2;
  margin: clamp(24px, 4vw, 44px) auto clamp(30px, 5vw, 58px);
  width: min(calc(var(--max-width) + (var(--gutter) * 2)), 100%);
  padding: 0 var(--gutter);
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.hero-proof {
  display: flex;
  align-items: center;
  min-height: 68px;
  margin: 0;
  padding: 14px 16px;
  border: 3px solid var(--line);
  background: var(--text);
  color: var(--bg-elev);
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 700;
  line-height: 1.35;
  text-transform: uppercase;
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
    font-size: clamp(34px, 10vw, 48px);
    line-height: 0.98;
    max-width: 100%;
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

  .hero-proofs {
    grid-template-columns: 1fr;
  }

  .hero-actions {
    display: grid;
  }
}
</style>
