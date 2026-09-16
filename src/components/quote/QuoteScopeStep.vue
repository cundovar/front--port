<template>
  <div class="quote-step-body">
    <!-- Analysis runs in the background: this whole screen stays usable meanwhile. -->
    <section v-if="recommendationState !== 'skipped'" class="analysis" aria-live="polite">
      <p v-if="recommendationState === 'loading'" class="analysis-status">
        <span class="analysis-dot" aria-hidden="true" />
        Analyse de votre besoin en cours — vous pouvez déjà choisir vous-même.
      </p>

      <template v-else-if="recommendationState === 'ready'">
        <p v-if="summary" class="analysis-summary">{{ summary }}</p>
        <div class="proposals" :class="{ single: proposals.length === 1 }">
          <QuoteRecommendationCard
            v-for="proposal in proposals"
            :key="proposal.tier"
            :proposal="proposal"
            :chosen="isChosen(proposal)"
            @choose="emit('choose-proposal', proposal)"
          />
        </div>
        <p class="analysis-note">
          Ces propositions sont une suggestion : ajustez la formule et les options ci-dessous comme vous voulez.
        </p>
      </template>

      <p v-else-if="recommendationState === 'unavailable'" class="analysis-status">
        L’analyse n’a rien pu proposer cette fois. Composez votre solution ci-dessous.
      </p>
    </section>

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
            <strong>
              {{ variant.label }}
              <span v-if="isSuggested(variant.key)" class="badge">Suggéré</span>
            </strong>
            <small v-if="variant.includes.length">{{ variant.includes.join(" · ") }}</small>
            <em v-if="reasonFor(variant.key)" class="reason">{{ reasonFor(variant.key) }}</em>
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
          <span class="quote-choice-text">
            <strong>
              {{ option.label }}
              <span v-if="isSuggested(option.key)" class="badge">Suggéré</span>
            </strong>
            <em v-if="reasonFor(option.key)" class="reason">{{ reasonFor(option.key) }}</em>
          </span>
        </label>
      </div>
    </fieldset>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { QuoteAnswers, QuoteOffer, QuoteProposal } from "../../types";
import type { QuoteRecommendationState } from "../../composables/useQuoteSimulator";
import { reasonForKey, suggestedKeys } from "../../composables/useQuoteSimulator";
import QuoteRecommendationCard from "./QuoteRecommendationCard.vue";

const props = defineProps<{
  offer: QuoteOffer;
  answers: QuoteAnswers;
  errors: Record<string, string>;
  proposals: QuoteProposal[];
  recommendationState: QuoteRecommendationState;
  summary: string;
}>();
const emit = defineEmits<{
  update: [Partial<QuoteAnswers>];
  "toggle-option": [string];
  "choose-proposal": [QuoteProposal];
}>();

const suggested = computed(() => suggestedKeys(props.proposals));

const isSuggested = (key: string): boolean => suggested.value.includes(key);
const reasonFor = (key: string): string => reasonForKey(props.proposals, key);

/** A proposal is "chosen" once the answers match it exactly. */
const isChosen = (proposal: QuoteProposal): boolean =>
  props.answers.variantKey === proposal.variantKey
  && props.answers.optionKeys.length === proposal.optionKeys.length
  && proposal.optionKeys.every((key) => props.answers.optionKeys.includes(key));
</script>

<style scoped>
.analysis { display: grid; gap: 16px; }
.analysis-status { margin: 0; font-size: 14px; display: flex; align-items: center; gap: 10px; }
.analysis-summary { margin: 0; font-size: 16px; }
.analysis-note { margin: 0; font-size: 13px; opacity: 0.75; }
.analysis-dot {
  width: 10px; height: 10px; border: 2px solid var(--line); border-radius: 50%;
  animation: quote-pulse 1s ease-in-out infinite;
}
@keyframes quote-pulse { 0%, 100% { opacity: 0.25; } 50% { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .analysis-dot { animation: none; opacity: 1; } }
.proposals { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }
.proposals.single { grid-template-columns: minmax(0, 1fr); }
.badge {
  font-family: var(--font-mono); font-size: 10px; font-weight: 700; text-transform: uppercase;
  border: 1px solid var(--line); padding: 1px 6px; margin-left: 8px; white-space: nowrap;
}
.reason { display: block; font-style: normal; font-size: 13px; opacity: 0.75; margin-top: 2px; }
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
