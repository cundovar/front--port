<template>
  <main class="quote-page">
    <header class="quote-header">
      <a class="quote-back" href="/">← Retour au portfolio</a>
      <h1 class="quote-title">Estimer votre projet en 2 minutes</h1>
      <p class="quote-intro">
        Répondez à quelques questions : vous obtenez une fourchette indicative, calculée à partir de vos réponses,
        et une lecture de votre besoin. Sans engagement.
      </p>
    </header>

    <QuoteProgress :labels="stepLabels" :current-index="currentIndex" />

    <section class="quote-card" aria-live="polite">
      <h2 ref="stepHeading" class="quote-step-title" tabindex="-1">{{ stepTitles[step] }}</h2>

      <QuoteNeedStep
        v-if="step === 'need'"
        :model-value="answers.serviceKey"
        :options="serviceOptions"
        :error="errors.serviceKey"
        @update:model-value="answers.serviceKey = $event"
      />

      <QuoteDetailsStep
        v-else-if="step === 'details'"
        :answers="answers"
        :errors="errors"
        :complexity-options="complexityOptions"
        :training-options="trainingOptions"
        @update="Object.assign(answers, $event)"
      />

      <QuoteContactStep
        v-else-if="step === 'contact'"
        :contact="contact"
        :errors="errors"
        :recap="recap"
        @update="Object.assign(contact, $event)"
      />

      <QuoteResultStep v-else-if="result" :result="result" />

      <p class="quote-reassurance">
        Estimation indicative · Sans engagement · Vos coordonnées restent confidentielles
      </p>

      <p v-if="feedback" class="quote-feedback" role="status">{{ feedback }}</p>

      <div v-if="step !== 'result'" class="quote-actions">
        <button v-if="currentIndex > 0" class="btn btn-outline" type="button" @click="goBack">Retour</button>
        <button
          v-if="step !== 'contact'"
          class="btn btn-primary"
          type="button"
          @click="goNext"
        >
          Continuer
        </button>
        <button
          v-else
          class="btn btn-primary"
          type="button"
          :disabled="submitState === 'submitting'"
          @click="sendQuote"
        >
          {{ submitState === "submitting" ? "Envoi…" : "Voir mon estimation" }}
        </button>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import QuoteProgress from "../components/quote/QuoteProgress.vue";
import QuoteNeedStep from "../components/quote/QuoteNeedStep.vue";
import QuoteDetailsStep from "../components/quote/QuoteDetailsStep.vue";
import QuoteContactStep from "../components/quote/QuoteContactStep.vue";
import QuoteResultStep from "../components/quote/QuoteResultStep.vue";
import {
  COMPLEXITY_LABELS,
  KNOWN_SERVICE_KEYS,
  QUOTE_STEPS,
  SERVICE_LABELS,
  TRAINING_LABELS,
  useQuoteSimulator,
} from "../composables/useQuoteSimulator";
import type { QuoteComplexity, QuoteStep, QuoteTrainingNeed } from "../types";

const route = useRoute();
const {
  step,
  answers,
  contact,
  errors,
  submitState,
  feedback,
  result,
  preselectService,
  back,
  next,
  submit,
} = useQuoteSimulator();

const stepHeading = ref<HTMLElement | null>(null);

const stepLabels = ["Besoin", "Projet", "Contact", "Résultat"];

const stepTitles: Record<QuoteStep, string> = {
  need: "Votre besoin",
  details: "Votre projet",
  contact: "Vos coordonnées",
  result: "Votre estimation",
};

const serviceOptions = KNOWN_SERVICE_KEYS.map((value) => ({ value, label: SERVICE_LABELS[value] }));

const complexityOptions = (Object.keys(COMPLEXITY_LABELS) as QuoteComplexity[]).map((value) => ({
  value,
  label: COMPLEXITY_LABELS[value],
}));

const trainingOptions = (Object.keys(TRAINING_LABELS) as QuoteTrainingNeed[]).map((value) => ({
  value,
  label: TRAINING_LABELS[value],
}));

const currentIndex = computed(() => QUOTE_STEPS.indexOf(step.value));

const recap = computed(() => [
  {
    label: "Besoin",
    value: answers.serviceKey ? SERVICE_LABELS[answers.serviceKey] : "—",
  },
  {
    label: "Complexité",
    value: answers.complexity ? COMPLEXITY_LABELS[answers.complexity] : "—",
  },
  { label: "Outils à relier", value: String(answers.integrationsCount) },
  { label: "Existant à reprendre", value: answers.legacyTakeover ? "Oui" : "Non" },
  { label: "Délai serré", value: answers.urgency ? "Oui" : "Non" },
  { label: "Accompagnement", value: TRAINING_LABELS[answers.trainingNeed] },
]);

const focusStepHeading = async (): Promise<void> => {
  await nextTick();
  stepHeading.value?.focus();
};

const goNext = async (): Promise<void> => {
  if (next()) {
    await focusStepHeading();
  }
};

const goBack = async (): Promise<void> => {
  back();
  await focusStepHeading();
};

const sendQuote = async (): Promise<void> => {
  if (await submit()) {
    await focusStepHeading();
  }
};

onMounted(() => {
  preselectService(route.query.service);
});
</script>

<style scoped>
.quote-page { max-width: 780px; margin: 0 auto; padding: clamp(24px, 5vw, 56px) 16px 80px; }
.quote-header { margin-bottom: 32px; }
.quote-back { font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; }
.quote-title { margin: 16px 0 12px; font-size: clamp(26px, 5vw, 40px); }
.quote-intro { margin: 0; font-size: 16px; line-height: 1.6; opacity: 0.85; }
.quote-card { border: 3px solid var(--line); background: var(--bg-elev); box-shadow: var(--shadow); padding: clamp(20px, 4vw, 36px); display: grid; gap: 24px; }
.quote-step-title { margin: 0; font-size: 20px; }
.quote-step-title:focus-visible { outline: 2px solid var(--text); outline-offset: 4px; }
.quote-reassurance { margin: 0; font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; opacity: 0.7; }
.quote-feedback { margin: 0; color: var(--accent); font-size: 14px; }
.quote-actions { display: flex; flex-wrap: wrap; gap: 14px; justify-content: space-between; }
</style>
