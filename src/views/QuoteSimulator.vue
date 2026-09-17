<template>
  <main class="quote-page">
    <header class="quote-header">
      <a class="quote-back" href="/">← Retour au portfolio</a>
      <h1 class="quote-title">Estimer votre projet en 2 minutes</h1>
      <p class="quote-intro">
        Quelques questions simples, et vous voyez une fourchette de prix avant même de laisser vos coordonnées.
        Sans engagement.
      </p>
    </header>

    <QuoteProgress :labels="progressLabels" :current-index="currentIndex" />

    <p v-if="catalogState === 'loading'" class="quote-state" role="status">Chargement des offres…</p>

    <section v-else-if="catalogState === 'error'" class="quote-card">
      <p class="quote-error" role="alert">Les offres n’ont pas pu être chargées.</p>
      <button class="btn btn-primary" type="button" @click="loadCatalog">Réessayer</button>
    </section>

    <section v-else class="quote-card">
      <h2 ref="stepHeading" class="quote-step-title" tabindex="-1">{{ stepLabels[step] }}</h2>

      <QuoteNeedStep
        v-if="step === 'offer'"
        :model-value="answers.offerKey"
        :offers="catalog?.offers ?? []"
        :error="errors.offerKey"
        @update:model-value="selectOffer"
      />

      <QuoteSituationStep
        v-else-if="step === 'need'"
        :answers="answers"
        :errors="errors"
        :offer="currentOffer"
        :tools="catalog?.tools ?? []"
        :stacks="catalog?.stacks ?? []"
        @update="Object.assign(answers, $event)"
        @toggle-tool="toggleTool"
      />

      <QuoteScopeStep
        v-else-if="step === 'scope' && currentOffer"
        :offer="currentOffer"
        :answers="answers"
        :errors="errors"
        :proposals="proposals"
        :recommendation-state="recommendationState"
        :summary="recommendationSummary"
        @update="Object.assign(answers, $event)"
        @toggle-option="toggleOption"
        @choose-proposal="chooseProposal"
      />

      <template v-else-if="step === 'result' && result">
        <QuoteResultStep :result="result" />

        <template v-if="!submission">
          <QuoteContactStep :contact="contact" :errors="errors" @update="Object.assign(contact, $event)" />
          <div class="quote-actions">
            <button class="btn btn-outline" type="button" @click="goBack">Modifier mes réponses</button>
            <button class="btn btn-primary" type="button" :disabled="submitState === 'loading'" @click="sendQuote">
              {{ submitState === "loading" ? "Envoi…" : "Recevoir l’estimation et en parler" }}
            </button>
          </div>
        </template>

        <section v-else class="quote-confirmation" aria-labelledby="quote-confirmation-title">
          <h3 id="quote-confirmation-title" class="quote-subtitle">Demande transmise</h3>
          <p>Merci, votre demande est enregistrée. Je reviens vers vous rapidement.</p>
          <p v-if="submission.summary" class="quote-summary">{{ submission.summary }}</p>
          <template v-if="submission.missingQuestions.length">
            <h4 class="quote-subtitle">À préciser ensemble</h4>
            <ul class="quote-list">
              <li v-for="question in submission.missingQuestions" :key="question">{{ question }}</li>
            </ul>
          </template>
          <a class="btn btn-outline" href="/">Retour au portfolio</a>
        </section>
      </template>

      <p class="quote-reassurance">
        Estimation indicative · Sans engagement · Vos coordonnées restent confidentielles
      </p>

      <p v-if="feedback" class="quote-feedback" role="status">{{ feedback }}</p>

      <div v-if="step !== 'result'" class="quote-actions">
        <button v-if="currentIndex > 0" class="btn btn-outline" type="button" @click="goBack">Retour</button>
        <button class="btn btn-primary" type="button" :disabled="previewState === 'loading'" @click="goNext">
          {{ previewState === "loading" ? "Calcul…" : nextLabel }}
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
import QuoteScopeStep from "../components/quote/QuoteScopeStep.vue";
import QuoteSituationStep from "../components/quote/QuoteSituationStep.vue";
import QuoteContactStep from "../components/quote/QuoteContactStep.vue";
import QuoteResultStep from "../components/quote/QuoteResultStep.vue";
import {
  QUOTE_STEPS,
  STEP_LABELS,
  resolvePreselectedOffer,
  useQuoteSimulator,
} from "../composables/useQuoteSimulator";

const route = useRoute();
const {
  catalog,
  catalogState,
  loadCatalog,
  step,
  answers,
  contact,
  errors,
  currentOffer,
  previewState,
  submitState,
  feedback,
  result,
  submission,
  selectOffer,
  toggleOption,
  toggleTool,
  recommendationState,
  proposals,
  recommendationSummary,
  chooseProposal,
  next,
  back,
  submit,
} = useQuoteSimulator();

const stepHeading = ref<HTMLElement | null>(null);
const stepLabels = STEP_LABELS;
const progressLabels = QUOTE_STEPS.map((value) => STEP_LABELS[value]);

const currentIndex = computed(() => QUOTE_STEPS.indexOf(step.value));
const nextLabel = computed(() => (step.value === "scope" ? "Voir mon estimation" : "Continuer"));

const focusStepHeading = async (): Promise<void> => {
  await nextTick();
  stepHeading.value?.focus();
};

const goNext = async (): Promise<void> => {
  if (await next()) await focusStepHeading();
};

const goBack = async (): Promise<void> => {
  back();
  await focusStepHeading();
};

const sendQuote = async (): Promise<void> => {
  if (await submit()) await focusStepHeading();
};

onMounted(async () => {
  await loadCatalog();
  const preselected = resolvePreselectedOffer(catalog.value, route.query.service);
  if (preselected) selectOffer(preselected);
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
.quote-state { font-family: var(--font-mono); font-size: 12px; text-transform: uppercase; }
.quote-reassurance { margin: 0; font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; opacity: 0.7; }
.quote-feedback, .quote-error { margin: 0; color: var(--accent); font-size: 14px; }
.quote-actions { display: flex; flex-wrap: wrap; gap: 14px; justify-content: space-between; }
.quote-confirmation { display: grid; gap: 12px; border-top: 2px solid var(--line); padding-top: 24px; }
.quote-subtitle { margin: 0; font-family: var(--font-mono); font-size: 12px; text-transform: uppercase; }
.quote-summary { margin: 0; font-size: 15px; line-height: 1.6; }
.quote-list { margin: 0; padding-left: 20px; display: grid; gap: 6px; font-size: 14px; }
</style>
