<template>
  <div class="quote-step-body">
    <fieldset class="quote-fieldset">
      <legend class="quote-legend">Où en êtes-vous aujourd’hui ?</legend>
      <div class="quote-choices">
        <label
          v-for="option in stageOptions"
          :key="option.value"
          class="quote-choice"
          :class="{ selected: answers.projectStage === option.value }"
        >
          <input
            type="radio"
            name="projectStage"
            :checked="answers.projectStage === option.value"
            @change="emit('update', { projectStage: option.value })"
          />
          <span>{{ option.label }}</span>
        </label>
      </div>
    </fieldset>

    <fieldset v-if="asksAboutContent" class="quote-fieldset">
      <legend class="quote-legend">Avez-vous déjà vos textes et vos images ?</legend>
      <div class="quote-choices">
        <label
          v-for="option in contentOptions"
          :key="option.value"
          class="quote-choice"
          :class="{ selected: answers.contentReadiness === option.value }"
        >
          <input
            type="radio"
            name="contentReadiness"
            :checked="answers.contentReadiness === option.value"
            @change="emit('update', { contentReadiness: option.value })"
          />
          <span>{{ option.label }}</span>
        </label>
      </div>
    </fieldset>

    <fieldset class="quote-fieldset">
      <legend class="quote-legend">Pour quand ?</legend>
      <div class="quote-choices">
        <label
          v-for="option in deadlineOptions"
          :key="option.value"
          class="quote-choice"
          :class="{ selected: answers.deadline === option.value }"
        >
          <input
            type="radio"
            name="deadline"
            :checked="answers.deadline === option.value"
            @change="emit('update', { deadline: option.value })"
          />
          <span>{{ option.label }}</span>
        </label>
      </div>
    </fieldset>

    <div class="quote-field">
      <label for="quote-description">Souhaitez-vous préciser quelque chose ? (optionnel)</label>
      <p id="quote-description-hint" class="quote-hint">
        Quelques mots sur votre activité ou ce qui vous pose problème aujourd’hui suffisent.
      </p>
      <textarea
        id="quote-description"
        aria-describedby="quote-description-hint"
        rows="4"
        maxlength="600"
        :value="answers.projectDescription"
        @input="emit('update', { projectDescription: ($event.target as HTMLTextAreaElement).value })"
      />
      <span v-if="errors.projectDescription" class="quote-error" role="alert">{{ errors.projectDescription }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { QuoteAnswers, QuoteOffer } from "../../types";
import {
  CONTENT_OPTIONS,
  DEADLINE_OPTIONS,
  PROJECT_STAGE_OPTIONS,
  offerAsksAboutContent,
} from "../../composables/useQuoteSimulator";

const props = defineProps<{
  answers: QuoteAnswers;
  errors: Record<string, string>;
  offer: QuoteOffer | null;
}>();
const emit = defineEmits<{ update: [Partial<QuoteAnswers>] }>();

const asksAboutContent = computed(() => offerAsksAboutContent(props.offer));

const stageOptions = PROJECT_STAGE_OPTIONS;
const contentOptions = CONTENT_OPTIONS;
const deadlineOptions = DEADLINE_OPTIONS;
</script>

<style scoped>
.quote-step-body { display: grid; gap: 28px; }
.quote-fieldset { border: 0; margin: 0; padding: 0; }
.quote-legend { font-family: var(--font-mono); font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px; }
.quote-choices { display: grid; gap: 12px; }
.quote-choice { display: flex; align-items: center; gap: 12px; border: 2px solid var(--line); padding: 14px; cursor: pointer; }
.quote-choice.selected { border-color: var(--text); background: var(--bg-elev); }
.quote-field { display: grid; gap: 7px; }
.quote-field label { font-family: var(--font-mono); font-size: 12px; font-weight: 700; text-transform: uppercase; }
.quote-field textarea { border: 2px solid var(--line); padding: 12px; color: var(--text); background: var(--bg); font: inherit; }
.quote-hint { margin: 0; font-size: 13px; opacity: 0.8; }
.quote-error { color: var(--accent); font-size: 14px; }
</style>
