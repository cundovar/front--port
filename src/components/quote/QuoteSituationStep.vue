<template>
  <div class="quote-step-body">
    <div class="quote-field">
      <label for="quote-description">Décrivez votre besoin en quelques phrases</label>
      <p id="quote-description-hint" class="quote-hint">
        Ce qui vous fait perdre du temps, ce que vous aimeriez obtenir. Plus c’est concret,
        mieux la proposition sera adaptée. N’indiquez pas de données personnelles ici.
      </p>
      <textarea
        id="quote-description"
        aria-describedby="quote-description-hint"
        rows="5"
        maxlength="600"
        :value="answers.projectDescription"
        @input="emit('update', { projectDescription: ($event.target as HTMLTextAreaElement).value })"
      />
      <p class="quote-counter" :class="{ ready: analysable }">
        {{ analysable
          ? "Assez détaillé pour une proposition sur mesure."
          : `Encore ${remaining} caractère${remaining > 1 ? "s" : ""} pour une proposition sur mesure (facultatif).` }}
      </p>
      <span v-if="errors.projectDescription" class="quote-error" role="alert">{{ errors.projectDescription }}</span>
    </div>

    <fieldset v-if="tools.length" class="quote-fieldset">
      <legend class="quote-legend">Quels outils utilisez-vous déjà ?</legend>
      <p class="quote-hint">Facultatif, et sans effet sur le prix. Cela aide à proposer le bon périmètre.</p>
      <div class="quote-choices quote-choices-grid">
        <label
          v-for="tool in tools"
          :key="tool.key"
          class="quote-choice"
          :class="{ selected: answers.toolKeys.includes(tool.key) }"
        >
          <input
            type="checkbox"
            :checked="answers.toolKeys.includes(tool.key)"
            @change="emit('toggle-tool', tool.key)"
          />
          <span>{{ tool.label }}</span>
        </label>
      </div>
    </fieldset>

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

    <fieldset v-if="answers.projectStage === 'existant' && stacks.length" class="quote-fieldset">
      <legend class="quote-legend">Sur quoi est-ce construit ?</legend>
      <p class="quote-hint">
        Facultatif, et sans effet sur le prix. Reprendre un site WordPress et reprendre une
        application sur mesure ne demandent pas le même travail.
      </p>
      <div class="quote-choices">
        <label
          v-for="stack in stacks"
          :key="stack.key"
          class="quote-choice"
          :class="{ selected: answers.existingStackKey === stack.key }"
        >
          <input
            type="radio"
            name="existingStack"
            :checked="answers.existingStackKey === stack.key"
            @change="emit('update', { existingStackKey: stack.key })"
          />
          <span>{{ stack.label }}</span>
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

  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { QuoteAnswers, QuoteOffer, QuoteTool } from "../../types";
import {
  CONTENT_OPTIONS,
  DEADLINE_OPTIONS,
  MIN_RECOMMENDATION_LENGTH,
  PROJECT_STAGE_OPTIONS,
  canBeAnalysed,
  offerAsksAboutContent,
} from "../../composables/useQuoteSimulator";

const props = defineProps<{
  answers: QuoteAnswers;
  errors: Record<string, string>;
  offer: QuoteOffer | null;
  tools: QuoteTool[];
  stacks: QuoteTool[];
}>();
const emit = defineEmits<{ update: [Partial<QuoteAnswers>]; "toggle-tool": [string] }>();

const asksAboutContent = computed(() => offerAsksAboutContent(props.offer));
const analysable = computed(() => canBeAnalysed(props.answers.projectDescription));
const remaining = computed(() =>
  Math.max(0, MIN_RECOMMENDATION_LENGTH - props.answers.projectDescription.trim().length),
);

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
.quote-choices-grid { grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); }
.quote-counter { margin: 0; font-size: 13px; opacity: 0.7; }
.quote-counter.ready { opacity: 1; font-weight: 600; }
</style>
