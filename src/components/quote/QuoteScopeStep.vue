<template>
  <div class="quote-step-body">
    <fieldset class="quote-fieldset">
      <legend class="quote-legend">Quelle formule correspond le mieux ?</legend>
      <div class="quote-choices">
        <label
          v-for="variant in offer.variants"
          :key="variant.key"
          class="quote-choice"
          :class="{ selected: answers.variantKey === variant.key }"
        >
          <input
            type="radio"
            name="variantKey"
            :value="variant.key"
            :checked="answers.variantKey === variant.key"
            @change="emit('update', { variantKey: variant.key })"
          />
          <span class="quote-choice-text">
            <strong>{{ variant.label }}</strong>
            <small v-if="variant.includes.length">{{ variant.includes.join(" · ") }}</small>
          </span>
        </label>
      </div>
      <p v-if="errors.variantKey" class="quote-error" role="alert">{{ errors.variantKey }}</p>
    </fieldset>

    <fieldset v-if="offer.options.length" class="quote-fieldset">
      <legend class="quote-legend">Avez-vous besoin de l’une de ces fonctionnalités ?</legend>
      <p class="quote-hint">Cochez uniquement ce qui vous est utile. Vous pourrez en ajouter plus tard.</p>
      <div class="quote-choices">
        <label
          v-for="option in offer.options"
          :key="option.key"
          class="quote-choice"
          :class="{ selected: answers.optionKeys.includes(option.key) }"
        >
          <input
            type="checkbox"
            :value="option.key"
            :checked="answers.optionKeys.includes(option.key)"
            @change="emit('toggle-option', option.key)"
          />
          <span class="quote-choice-text">{{ option.label }}</span>
        </label>
      </div>
    </fieldset>
  </div>
</template>

<script setup lang="ts">
import type { QuoteAnswers, QuoteOffer } from "../../types";

defineProps<{ offer: QuoteOffer; answers: QuoteAnswers; errors: Record<string, string> }>();
const emit = defineEmits<{ update: [Partial<QuoteAnswers>]; "toggle-option": [string] }>();
</script>

<style scoped>
.quote-step-body { display: grid; gap: 28px; }
.quote-fieldset { border: 0; margin: 0; padding: 0; }
.quote-legend { font-family: var(--font-mono); font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px; }
.quote-hint { margin: 0 0 14px; font-size: 13px; opacity: 0.8; }
.quote-choices { display: grid; gap: 12px; }
.quote-choice { display: flex; align-items: flex-start; gap: 12px; border: 2px solid var(--line); padding: 14px; cursor: pointer; }
.quote-choice.selected { border-color: var(--text); background: var(--bg-elev); }
.quote-choice-text { display: grid; gap: 4px; }
.quote-choice-text small { opacity: 0.75; font-size: 13px; }
.quote-error { color: var(--accent); font-size: 14px; margin: 12px 0 0; }
</style>
