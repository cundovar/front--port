<template>
  <div class="quote-step-body">
    <p class="quote-range-label">Fourchette indicative</p>
    <p class="quote-range">{{ formatAmount(result.minimumAmount) }} – {{ formatAmount(result.maximumAmount) }}</p>
    <p class="quote-disclaimer">
      {{ result.disclaimer }} Ce montant n’est pas un devis contractuel : il sert à situer l’ordre de grandeur
      avant un échange.
    </p>

    <section v-if="result.calculationDetail.length" aria-labelledby="quote-factors-title">
      <h3 id="quote-factors-title" class="quote-subtitle">Ce qui compose cette estimation</h3>
      <ul class="quote-factors">
        <li v-for="factor in result.calculationDetail" :key="factor.label">
          <span>{{ factor.label }}</span>
          <span class="quote-factor-amount">
            {{ formatAmount(factor.impactMin) }}<template v-if="factor.impactMax !== factor.impactMin"> – {{ formatAmount(factor.impactMax) }}</template>
          </span>
        </li>
      </ul>
    </section>

    <section v-if="result.summary" aria-labelledby="quote-summary-title">
      <h3 id="quote-summary-title" class="quote-subtitle">Lecture de votre besoin</h3>
      <p class="quote-summary">{{ result.summary }}</p>
    </section>

    <section v-if="result.recommendedScope.length" aria-labelledby="quote-scope-title">
      <h3 id="quote-scope-title" class="quote-subtitle">Périmètre recommandé</h3>
      <ul class="quote-list">
        <li v-for="item in result.recommendedScope" :key="item">{{ item }}</li>
      </ul>
    </section>

    <section v-if="result.missingQuestions.length" aria-labelledby="quote-questions-title">
      <h3 id="quote-questions-title" class="quote-subtitle">À préciser ensemble</h3>
      <ul class="quote-list">
        <li v-for="item in result.missingQuestions" :key="item">{{ item }}</li>
      </ul>
    </section>

    <section v-if="result.riskFlags.length" aria-labelledby="quote-risks-title">
      <h3 id="quote-risks-title" class="quote-subtitle">Points de vigilance</h3>
      <ul class="quote-list">
        <li v-for="item in result.riskFlags" :key="item">{{ item }}</li>
      </ul>
    </section>

    <div class="quote-result-actions">
      <a class="btn btn-primary" href="/#contact">Demander un échange</a>
      <a class="btn btn-outline" href="/">Retour au portfolio</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { QuoteEstimateResult } from "../../types";

defineProps<{ result: QuoteEstimateResult }>();

const formatAmount = (amount: number): string =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount);
</script>

<style scoped>
.quote-step-body { display: grid; gap: 24px; }
.quote-range-label { margin: 0; font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; opacity: 0.7; }
.quote-range { margin: 0; font-size: clamp(28px, 6vw, 44px); font-weight: 800; }
.quote-disclaimer { margin: 0; font-size: 14px; opacity: 0.8; }
.quote-subtitle { margin: 0 0 12px; font-family: var(--font-mono); font-size: 12px; text-transform: uppercase; }
.quote-factors { display: grid; gap: 8px; margin: 0; padding: 0; list-style: none; }
.quote-factors li { display: flex; justify-content: space-between; gap: 16px; border-bottom: 1px solid var(--line); padding-bottom: 8px; font-size: 14px; }
.quote-factor-amount { font-family: var(--font-mono); white-space: nowrap; }
.quote-summary { margin: 0; font-size: 15px; line-height: 1.6; }
.quote-list { margin: 0; padding-left: 20px; display: grid; gap: 6px; font-size: 14px; }
.quote-result-actions { display: flex; flex-wrap: wrap; gap: 14px; }
</style>
