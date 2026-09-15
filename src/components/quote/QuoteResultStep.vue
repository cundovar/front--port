<template>
  <div class="quote-step-body">
    <p class="quote-range-label">{{ result.offerLabel }} · {{ result.variantLabel }}</p>
    <p class="quote-range">{{ formatAmount(result.minimumAmount) }} – {{ formatAmount(result.maximumAmount) }}</p>
    <p class="quote-disclaimer">
      {{ result.disclaimer }} Ce montant situe l’ordre de grandeur de votre projet ; il ne remplace pas un devis.
    </p>

    <div class="quote-columns">
      <section v-if="result.includes.length" aria-labelledby="quote-includes-title">
        <h3 id="quote-includes-title" class="quote-subtitle">Ce qui est compris</h3>
        <ul class="quote-list">
          <li v-for="item in result.includes" :key="item">{{ item }}</li>
        </ul>
      </section>

      <section aria-labelledby="quote-options-title">
        <h3 id="quote-options-title" class="quote-subtitle">Ce que vous avez ajouté</h3>
        <ul v-if="result.selectedOptions.length" class="quote-list">
          <li v-for="option in result.selectedOptions" :key="option.key">{{ option.label }}</li>
        </ul>
        <p v-else class="quote-empty">Aucune fonctionnalité supplémentaire.</p>
      </section>
    </div>

    <details class="quote-details">
      <summary>Voir le détail du calcul</summary>
      <ul class="quote-factors">
        <li v-for="factor in result.calculationDetail" :key="factor.label">
          <span>{{ factor.label }}</span>
          <span class="quote-factor-amount">
            {{ formatAmount(factor.impactMin) }}<template v-if="factor.impactMax !== factor.impactMin"> – {{ formatAmount(factor.impactMax) }}</template>
          </span>
        </li>
      </ul>
    </details>
  </div>
</template>

<script setup lang="ts">
import type { QuoteEstimateResult } from "../../types";

defineProps<{ result: QuoteEstimateResult }>();

const formatAmount = (amount: number): string =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount);
</script>

<style scoped>
.quote-step-body { display: grid; gap: 20px; }
.quote-range-label { margin: 0; font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; opacity: 0.75; }
.quote-range { margin: 0; font-size: clamp(28px, 6vw, 44px); font-weight: 800; }
.quote-disclaimer { margin: 0; font-size: 14px; opacity: 0.8; }
.quote-columns { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; }
.quote-subtitle { margin: 0 0 10px; font-family: var(--font-mono); font-size: 12px; text-transform: uppercase; }
.quote-list { margin: 0; padding-left: 20px; display: grid; gap: 6px; font-size: 14px; }
.quote-empty { margin: 0; font-size: 14px; opacity: 0.7; }
.quote-details summary { cursor: pointer; font-family: var(--font-mono); font-size: 12px; text-transform: uppercase; }
.quote-factors { list-style: none; margin: 14px 0 0; padding: 0; display: grid; gap: 8px; }
.quote-factors li { display: flex; justify-content: space-between; gap: 16px; border-bottom: 1px solid var(--line); padding-bottom: 8px; font-size: 14px; }
.quote-factor-amount { font-family: var(--font-mono); white-space: nowrap; }
@media (max-width: 640px) { .quote-columns { grid-template-columns: 1fr; } }
</style>
