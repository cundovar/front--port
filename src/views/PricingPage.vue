<template>
  <main class="page">
    <div class="section pricing-header">
      <RouterLink class="back-link" to="/">← Accueil</RouterLink>
      <h1>Combien coûte votre projet ?</h1>
      <p class="subtitle">
        Les fourchettes réelles, par situation. Rien n’est caché derrière un formulaire : vous
        voyez d’abord ce que ça coûte, vous décidez ensuite.
      </p>
    </div>

    <p v-if="state === 'loading'" class="section pricing-state">Chargement des tarifs…</p>

    <div v-else-if="state === 'error'" class="section pricing-state">
      <p>Les tarifs n’ont pas pu être chargés.</p>
      <RouterLink class="btn btn-primary" to="/devis">Estimer mon projet</RouterLink>
    </div>

    <template v-else>
      <section v-for="offer in offers" :key="offer.key" class="section pricing-offer">
        <header class="offer-head">
          <h2>{{ offer.label }}</h2>
          <p v-if="offer.summary" class="offer-summary">{{ offer.summary }}</p>
          <p class="offer-entry">
            <span>à partir de</span>
            <strong>{{ formatAmount(entryAmount(offer)) }}</strong>
          </p>
        </header>

        <ul class="variant-list">
          <li v-for="variant in sortedVariants(offer)" :key="variant.key" class="variant">
            <div class="variant-head">
              <h3>{{ variant.label }}</h3>
              <span class="variant-price">
                {{ formatQuotePrice(variant.minimumAmount, variant.maximumAmount, variant.pricingMode) }}
              </span>
            </div>
            <ul v-if="variant.includes.length" class="variant-includes">
              <li v-for="item in variant.includes" :key="item">{{ item }}</li>
            </ul>
          </li>
        </ul>

        <details v-if="offer.options.length" class="offer-options">
          <summary>En option ({{ offer.options.length }})</summary>
          <ul>
            <li v-for="option in offer.options" :key="option.key">
              <span>{{ option.label }}</span>
              <span class="option-price">
                {{ formatQuotePrice(option.minimumAmount, option.maximumAmount, "range") }}
              </span>
            </li>
          </ul>
        </details>

        <RouterLink class="btn btn-primary" :to="buildQuoteCtaHref(offer.key)">
          Estimer précisément
        </RouterLink>
      </section>

      <section class="section pricing-note">
        <h2 class="note-title">Ce que ces montants veulent dire</h2>
        <p>
          Ce sont des ordres de grandeur, pas un devis. Le prix final dépend de ce que vous avez
          déjà, du délai et de ce qu’il faut reprendre. L’estimation en ligne prend deux minutes et
          ne vous engage à rien.
        </p>
        <div class="note-actions">
          <RouterLink class="btn btn-primary" to="/devis">Estimer mon projet</RouterLink>
          <RouterLink class="btn btn-secondary" to="/#contact">Écrire un message</RouterLink>
        </div>
      </section>
    </template>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import type { QuoteCatalog, QuoteOffer } from "../types";
import type { QuoteRequestState } from "../composables/useQuoteSimulator";
import {
  buildQuoteCtaHref,
  formatQuoteAmount,
  formatQuotePrice,
} from "../composables/useQuoteSimulator";
import { offerEntryAmount, priceableOffers, variantsByPrice } from "../utils/pricingPage";
import { api } from "../utils/api";

// Read straight from the public pricing endpoint, the same grid the simulator
// prices with: a number changed in the backoffice moves this page too, and no
// amount is ever written twice.
const catalog = ref<QuoteCatalog | null>(null);
const state = ref<QuoteRequestState>("loading");

const offers = computed(() => priceableOffers(catalog.value?.offers ?? []));

const entryAmount = (offer: QuoteOffer): number => offerEntryAmount(offer);
const sortedVariants = (offer: QuoteOffer) => variantsByPrice(offer);
const formatAmount = (amount: number): string => formatQuoteAmount(amount);

onMounted(async () => {
  try {
    const response = await api.fetch("/api/quote-pricing");
    if (!response.ok) throw new Error();
    const data = await response.json();
    catalog.value = data.catalog as QuoteCatalog;
    state.value = "ready";
  } catch {
    state.value = "error";
  }
});
</script>

<style scoped>
.pricing-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: clamp(16px, 3vw, 28px);
}

.back-link {
  display: inline-flex;
  width: fit-content;
  color: var(--text);
  text-decoration: none;
  font-size: 14px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.back-link:hover {
  opacity: 1;
}

.subtitle {
  margin: 0;
  max-width: 60ch;
  color: var(--muted);
  font-size: clamp(16px, 2.4vw, 19px);
  line-height: 1.6;
}

.pricing-state {
  color: var(--muted);
}

.pricing-offer {
  padding-top: clamp(20px, 3vw, 32px);
  padding-bottom: clamp(20px, 3vw, 32px);
}

.offer-head {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.offer-head h2 {
  margin: 0;
  font-size: clamp(22px, 3.6vw, 32px);
}

.offer-summary {
  margin: 0;
  max-width: 60ch;
  color: var(--muted);
}

/* The entry price is the number people carry away, so it gets its own line
   rather than sitting inside the prose. */
.offer-entry {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin: 4px 0 0;
  font-family: var(--font-mono);
  font-size: 12px;
  text-transform: uppercase;
  color: var(--muted);
}

.offer-entry strong {
  font-size: clamp(20px, 3vw, 26px);
  color: var(--text);
}

.variant-list {
  display: grid;
  gap: 14px;
  margin: 0 0 18px;
  padding: 0;
  list-style: none;
}

.variant {
  padding: 16px 18px;
  border: 3px solid var(--line);
  background: var(--bg-elev);
}

.variant-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.variant-head h3 {
  margin: 0;
  font-size: clamp(16px, 2.4vw, 19px);
}

.variant-price {
  white-space: nowrap;
  font-family: var(--font-mono);
  font-weight: 800;
}

.variant-includes {
  margin: 10px 0 0;
  padding-left: 18px;
  color: var(--muted);
  font-size: 15px;
  line-height: 1.6;
}

.offer-options {
  margin-bottom: 18px;
  color: var(--muted);
}

.offer-options summary {
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 12px;
  text-transform: uppercase;
}

.offer-options ul {
  margin: 10px 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 6px;
}

.offer-options li {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px;
  font-size: 15px;
}

.option-price {
  white-space: nowrap;
  font-family: var(--font-mono);
}

.note-title {
  font-size: clamp(20px, 3.4vw, 28px);
}

.pricing-note p {
  max-width: 62ch;
  color: var(--muted);
  line-height: 1.7;
}

.note-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 18px;
}
</style>
