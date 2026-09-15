<template>
  <fieldset class="quote-fieldset">
    <legend class="quote-legend">Qu’est-ce que vous voulez obtenir ?</legend>
    <div class="quote-choices">
      <label
        v-for="offer in offers"
        :key="offer.key"
        class="quote-choice"
        :class="{ selected: modelValue === offer.key }"
      >
        <input
          type="radio"
          name="offerKey"
          :value="offer.key"
          :checked="modelValue === offer.key"
          @change="emit('update:modelValue', offer.key)"
        />
        <span class="quote-choice-text">
          <strong>{{ offer.label }}</strong>
          <small v-if="offer.summary">{{ offer.summary }}</small>
        </span>
      </label>
    </div>
    <p v-if="error" class="quote-error" role="alert">{{ error }}</p>
  </fieldset>
</template>

<script setup lang="ts">
import type { QuoteOffer } from "../../types";

defineProps<{ modelValue: string; offers: QuoteOffer[]; error?: string }>();
const emit = defineEmits<{ "update:modelValue": [string] }>();
</script>

<style scoped>
.quote-fieldset { border: 0; margin: 0; padding: 0; }
.quote-legend { font-family: var(--font-mono); font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 16px; }
.quote-choices { display: grid; gap: 12px; }
.quote-choice { display: flex; align-items: flex-start; gap: 12px; border: 2px solid var(--line); padding: 14px; cursor: pointer; }
.quote-choice.selected { border-color: var(--text); background: var(--bg-elev); }
.quote-choice-text { display: grid; gap: 4px; }
.quote-choice-text small { opacity: 0.75; font-size: 13px; }
.quote-error { color: var(--accent); font-size: 14px; margin: 12px 0 0; }
</style>
