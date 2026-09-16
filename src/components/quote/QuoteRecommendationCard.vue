<template>
  <article class="proposal" :class="{ chosen }">
    <header class="proposal-head">
      <h3 class="proposal-title">{{ proposal.title }}</h3>
      <p class="proposal-price">
        <span v-if="price.prefix" class="proposal-prefix">{{ price.prefix }}</span>
        {{ price.amount }}
      </p>
    </header>

    <p class="proposal-note">{{ proposal.disclaimer }}</p>

    <h4 class="proposal-subtitle">Ce qui est compris</h4>
    <ul class="proposal-list">
      <li v-for="item in proposal.includes" :key="item">{{ item }}</li>
    </ul>

    <template v-if="proposal.selectedOptions.length">
      <h4 class="proposal-subtitle">En plus</h4>
      <ul class="proposal-list">
        <li v-for="option in proposal.selectedOptions" :key="option.key">
          {{ option.label }}
          <!-- Written by the model, and only ever attached to a catalog key. -->
          <em v-if="proposal.reasons[option.key]" class="proposal-reason">
            {{ proposal.reasons[option.key] }}
          </em>
        </li>
      </ul>
    </template>

    <button class="btn" :class="chosen ? 'btn-secondary' : 'btn-primary'" type="button" @click="emit('choose')">
      {{ chosen ? "Sélectionnée" : "Choisir cette solution" }}
    </button>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { QuoteProposal } from "../../types";
import { quotePriceParts } from "../../composables/useQuoteSimulator";

const props = defineProps<{ proposal: QuoteProposal; chosen: boolean }>();
const emit = defineEmits<{ choose: [] }>();

const price = computed(() =>
  quotePriceParts(props.proposal.minimumAmount, props.proposal.maximumAmount, props.proposal.pricingMode),
);
</script>

<style scoped>
.proposal {
  border: 2px solid var(--line);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--bg-elev);
}

.proposal.chosen {
  box-shadow: 6px 6px 0 var(--line);
}

.proposal-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.proposal-title {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  margin: 0;
}

.proposal-price {
  font-family: var(--font-display);
  font-size: clamp(30px, 6vw, 44px);
  line-height: 1;
  margin: 0;
  text-wrap: balance;
}

.proposal-prefix {
  display: block;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  opacity: 0.75;
  margin-bottom: 2px;
}

.proposal-note {
  margin: 0;
  font-size: 13px;
  opacity: 0.8;
}

.proposal-subtitle {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  margin: 4px 0 0;
}

.proposal-list {
  margin: 0;
  padding-left: 1.1em;
  display: grid;
  gap: 6px;
}

.proposal-reason {
  display: block;
  font-style: normal;
  font-size: 13px;
  opacity: 0.75;
}

.proposal button {
  margin-top: auto;
}
</style>
