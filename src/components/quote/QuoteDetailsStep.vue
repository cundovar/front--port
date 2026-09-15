<template>
  <div class="quote-step-body">
    <fieldset class="quote-fieldset">
      <legend class="quote-legend">Quelle complexité estimez-vous ?</legend>
      <div class="quote-choices">
        <label
          v-for="option in complexityOptions"
          :key="option.value"
          class="quote-choice"
          :class="{ selected: answers.complexity === option.value }"
        >
          <input
            type="radio"
            name="complexity"
            :value="option.value"
            :checked="answers.complexity === option.value"
            @change="emit('update', { complexity: option.value })"
          />
          <span>{{ option.label }}</span>
        </label>
      </div>
      <p v-if="errors.complexity" class="quote-error" role="alert">{{ errors.complexity }}</p>
    </fieldset>

    <div class="quote-field">
      <label :for="integrationsFieldId">Combien d’outils faut-il relier entre eux ?</label>
      <p :id="integrationsHintId" class="quote-hint">
        Comptez chaque logiciel que votre projet devra connecter : messagerie, agenda, CRM, facturation,
        tableur, boutique en ligne, base clients… Indiquez 0 si tout doit rester dans un seul outil.
      </p>
      <input
        :id="integrationsFieldId"
        :aria-describedby="integrationsHintId"
        type="number"
        min="0"
        max="20"
        inputmode="numeric"
        :value="answers.integrationsCount"
        @input="emit('update', { integrationsCount: Number(($event.target as HTMLInputElement).value) || 0 })"
      />
      <span v-if="errors.integrationsCount" class="quote-error" role="alert">{{ errors.integrationsCount }}</span>
    </div>

    <label class="quote-toggle">
      <input
        type="checkbox"
        :checked="answers.legacyTakeover"
        @change="emit('update', { legacyTakeover: ($event.target as HTMLInputElement).checked })"
      />
      <span>Il existe déjà un site ou un outil à reprendre</span>
    </label>

    <label class="quote-toggle">
      <input
        type="checkbox"
        :checked="answers.urgency"
        @change="emit('update', { urgency: ($event.target as HTMLInputElement).checked })"
      />
      <span>Le délai est serré</span>
    </label>

    <fieldset class="quote-fieldset">
      <legend class="quote-legend">Souhaitez-vous un accompagnement ?</legend>
      <div class="quote-choices">
        <label
          v-for="option in trainingOptions"
          :key="option.value"
          class="quote-choice"
          :class="{ selected: answers.trainingNeed === option.value }"
        >
          <input
            type="radio"
            name="trainingNeed"
            :value="option.value"
            :checked="answers.trainingNeed === option.value"
            @change="emit('update', { trainingNeed: option.value })"
          />
          <span>{{ option.label }}</span>
        </label>
      </div>
    </fieldset>

    <label class="quote-field">
      Décrivez votre besoin en quelques mots (optionnel)
      <textarea
        rows="4"
        maxlength="600"
        :value="answers.projectDescription"
        @input="emit('update', { projectDescription: ($event.target as HTMLTextAreaElement).value })"
      />
      <span v-if="errors.projectDescription" class="quote-error" role="alert">{{ errors.projectDescription }}</span>
    </label>
  </div>
</template>

<script setup lang="ts">
import type { QuoteAnswers, QuoteComplexity, QuoteTrainingNeed } from "../../types";

defineProps<{
  answers: QuoteAnswers;
  errors: Record<string, string>;
  complexityOptions: { value: QuoteComplexity; label: string }[];
  trainingOptions: { value: QuoteTrainingNeed; label: string }[];
}>();

const emit = defineEmits<{ update: [Partial<QuoteAnswers>] }>();

const integrationsFieldId = "quote-integrations";
const integrationsHintId = "quote-integrations-hint";
</script>

<style scoped>
.quote-step-body { display: grid; gap: 24px; }
.quote-fieldset { border: 0; margin: 0; padding: 0; }
.quote-legend { font-family: var(--font-mono); font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 16px; }
.quote-choices { display: grid; gap: 12px; }
.quote-choice { display: flex; align-items: center; gap: 12px; border: 2px solid var(--line); padding: 14px; cursor: pointer; }
.quote-choice.selected { border-color: var(--text); background: var(--bg-elev); }
.quote-hint { margin: 0; font-family: var(--font-sans, inherit); font-size: 13px; font-weight: 400; line-height: 1.5; text-transform: none; opacity: 0.8; }
.quote-field { display: grid; gap: 7px; font-family: var(--font-mono); font-size: 11px; font-weight: 700; text-transform: uppercase; }
.quote-field input, .quote-field textarea { border: 2px solid var(--line); padding: 12px; color: var(--text); background: var(--bg); font: inherit; text-transform: none; }
.quote-toggle { display: flex; align-items: center; gap: 12px; font-size: 15px; }
.quote-error { color: var(--accent); font-size: 14px; text-transform: none; font-weight: 400; }
</style>
