<template>
  <section class="section services-section" id="services" aria-labelledby="services-title">
    <div class="services-header">
      <h2 id="services-title" class="section-title">Des solutions pour votre activité</h2>
      <p class="section-subtitle">Choisissez le résultat que vous souhaitez obtenir</p>
    </div>
    <div v-if="services.length" class="services-grid">
      <article v-for="service in services" :key="service.title" class="service-card">
        <h3 class="service-title">{{ service.title }}</h3>
        <p class="service-promise">{{ service.promise }}</p>
        <div class="service-deliverables">
          <div class="deliverables-label">Vous obtenez</div>
          <ul class="deliverables-list">
            <li v-for="item in service.deliverables" :key="item">{{ item }}</li>
          </ul>
        </div>
        <a :href="ctaHref(service.serviceKey)" class="btn btn-outline">
          {{ service.actionLabel }}
        </a>
        <span class="estimate-note">Estimation sans engagement</span>
        <a href="#faq" class="faq-anchor">Voir la FAQ</a>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { buildQuoteCtaHref } from "../composables/useQuoteSimulator";
import type { QuoteServiceKey } from "../types";

interface Service {
  serviceKey: QuoteServiceKey;
  title: string;
  promise: string;
  problems?: string[];
  deliverables: string[];
  technologies?: string[];
  actionLabel: string;
  pricing?: {
    essential: string;
    standard: string;
  };
}

const ctaHref = (serviceKey: unknown): string => buildQuoteCtaHref(serviceKey);

interface Props {
  services: Service[];
}

defineProps<Props>();

</script>

<style scoped>
.services-header {
  margin-bottom: clamp(40px, 8vw, 80px);
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: clamp(24px, 4vw, 48px);
}

.service-card {
  grid-column: span 2;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: clamp(24px, 4vw, 40px);
  border: 3px solid var(--line);
  background: var(--bg-elev);
  box-shadow: var(--shadow);
}

.service-card:first-child {
  background: color-mix(in oklch, var(--bg-elev) 90%, var(--accent));
  box-shadow: 10px 10px 0 var(--accent);
}

.service-card:nth-child(4),
.service-card:nth-child(5) {
  grid-column: span 3;
}

.service-title {
  font-family: var(--font-display);
  font-size: clamp(24px, 4vw, 32px);
  line-height: 0.95;
  text-transform: uppercase;
  margin: 0;
  color: var(--text);
}

.service-promise {
  font-size: clamp(18px, 2.5vw, 21px);
  line-height: 1.2;
  color: var(--text);
  margin: 0;
}

.service-deliverables {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.deliverables-label {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--muted);
}

.deliverables-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.deliverables-list li {
  font-size: 14px;
  color: var(--text);
  padding-left: 16px;
  position: relative;
}

.deliverables-list li::before {
  content: "→";
  position: absolute;
  left: 0;
  color: var(--accent);
}

.btn-outline {
  align-self: flex-start;
  margin-top: auto;
  padding: 8px 16px;
  border: 2px solid var(--text);
  background: transparent;
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s var(--ease);
}

.estimate-note {
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
}

.btn-outline:hover {
  background: var(--text);
  color: var(--bg-elev);
  transform: translate(2px, 2px);
}

.faq-anchor {
  align-self: flex-start;
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  text-decoration: underline;
  text-underline-offset: 4px;
}

.faq-anchor:hover {
  color: var(--text);
}

@media (max-width: 720px) {
  .services-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .service-card,
  .service-card:nth-child(4),
  .service-card:nth-child(5) {
    grid-column: 1 / -1;
    padding: 20px;
    box-shadow: 6px 6px 0 var(--line);
  }

  .service-card:first-child {
    box-shadow: 6px 6px 0 var(--accent);
  }

}

@media (min-width: 721px) and (max-width: 980px) {
  .services-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .service-card,
  .service-card:nth-child(4) {
    grid-column: span 1;
  }

  .service-card:nth-child(5) {
    grid-column: span 2;
  }
}
</style>
