<template>
  <section class="section">
    <h1>Tarifs</h1>
    <p class="muted">
      Cette grille est la seule source des montants affichés par le simulateur.
      Un enregistrement s’applique aux prochaines estimations ; les demandes déjà reçues
      conservent leur montant et leur version.
    </p>

    <p v-if="state === 'loading'" class="muted">Chargement de la grille…</p>
    <p v-if="globalError" class="error" role="alert">{{ globalError }}</p>
    <p v-if="feedback" class="success" role="status">{{ feedback }}</p>

    <button v-if="state === 'error'" class="btn btn-secondary" type="button" @click="load">
      Réessayer
    </button>

    <template v-if="draft">
      <p class="muted version">
        Version active : {{ version }}<template v-if="updatedAt"> · modifiée le {{ formatDate(updatedAt) }}</template>
      </p>

      <ul v-if="errorSummary.length" class="error-summary">
        <li v-for="item in errorSummary" :key="item.path">
          <button type="button" @click="focusOffer(item.path)">{{ item.where }} : {{ item.message }}</button>
        </li>
      </ul>

      <div class="layout">
        <ul class="offer-list">
          <li v-for="offer in draft.offers" :key="offer.key">
            <button
              type="button"
              class="offer-row"
              :class="{ active: offer.key === selectedOfferKey, invalid: hasOfferError(offer.key) }"
              @click="selectedOfferKey = offer.key"
            >
              {{ offer.label }}
            </button>
          </li>
        </ul>

        <article v-if="currentOffer" class="card editor">
          <h2>{{ currentOffer.label }}</h2>
          <p class="muted">Clé technique : <code>{{ currentOffer.key }}</code></p>

          <h3>Formules</h3>
          <div
            v-for="(variant, index) in currentOffer.variants"
            :key="variant.key"
            class="priced-item"
          >
            <label class="label-field">
              Intitulé affiché
              <input v-model="variant.label" type="text" :aria-invalid="!!errorFor(offerIndex, 'variants', index, 'label')" />
            </label>
            <span v-if="errorFor(offerIndex, 'variants', index, 'label')" class="field-error">
              {{ errorFor(offerIndex, "variants", index, "label") }}
            </span>

            <fieldset class="modes">
              <legend>Mode de prix</legend>
              <label v-for="mode in pricingModes" :key="mode.value" class="mode-choice">
                <input
                  type="radio"
                  :name="`mode-${offerIndex}-${index}`"
                  :value="mode.value"
                  :checked="variant.pricingMode === mode.value"
                  @change="selectMode(variant, mode.value)"
                />
                <span>
                  <strong>{{ mode.label }}</strong>
                  <em>{{ mode.help }}</em>
                </span>
              </label>
            </fieldset>
            <span class="field-error">{{ errorFor(offerIndex, "variants", index, "pricingMode") }}</span>

            <div class="amounts">
              <label>
                {{ variant.pricingMode === "range" ? "Minimum (€)" : "Prix (€)" }}
                <input
                  v-model.number="variant.minimumAmount"
                  type="number"
                  min="0"
                  step="50"
                  :aria-invalid="!!errorFor(offerIndex, 'variants', index, 'minimumAmount')"
                  @input="mirrorCommittedAmount(variant)"
                />
              </label>
              <label v-if="variant.pricingMode === 'range'">
                Maximum (€)
                <input
                  v-model.number="variant.maximumAmount"
                  type="number"
                  min="0"
                  step="50"
                  :aria-invalid="!!errorFor(offerIndex, 'variants', index, 'maximumAmount')"
                />
              </label>
              <label>
                Supplément délai prioritaire (€)
                <input v-model.number="variant.priorityAmount" type="number" min="0" step="50" />
              </label>
            </div>
            <span
              v-for="field in ['minimumAmount', 'maximumAmount', 'priorityAmount']"
              :key="field"
              class="field-error"
            >
              {{ errorFor(offerIndex, "variants", index, field) }}
            </span>

            <details>
              <summary>Ce qui est compris ({{ variant.includes.length }})</summary>
              <label v-for="(_, includeIndex) in variant.includes" :key="includeIndex" class="include-field">
                <span class="sr-only">Inclusion {{ includeIndex + 1 }}</span>
                <input v-model="variant.includes[includeIndex]" type="text" />
              </label>
            </details>
          </div>

          <h3>Options</h3>
          <p v-if="currentOffer.options.length === 0" class="muted">Aucune option pour cette offre.</p>
          <div
            v-for="(option, index) in currentOffer.options"
            :key="option.key"
            class="priced-item"
          >
            <label class="label-field">
              Intitulé affiché
              <input v-model="option.label" type="text" :aria-invalid="!!errorFor(offerIndex, 'options', index, 'label')" />
            </label>
            <div class="amounts">
              <label>
                {{ offerCommits ? "Prix (€)" : "Minimum (€)" }}
                <input
                  v-model.number="option.minimumAmount"
                  type="number"
                  min="0"
                  step="10"
                  @input="offerCommits && mirrorCommittedAmount(option)"
                />
              </label>
              <label v-if="!offerCommits">
                Maximum (€)
                <input v-model.number="option.maximumAmount" type="number" min="0" step="10" />
              </label>
            </div>
            <span
              v-for="field in ['label', 'minimumAmount', 'maximumAmount']"
              :key="field"
              class="field-error"
            >
              {{ errorFor(offerIndex, "options", index, field) }}
            </span>
          </div>

          <h3>Ajustements communs</h3>
          <div class="priced-item">
            <div class="amounts">
              <label>
                {{ anyOfferCommits ? "Rédaction des contenus (€)" : "Rédaction des contenus · minimum (€)" }}
                <input
                  v-model.number="draft.adjustments.contentWriting.minimumAmount"
                  type="number"
                  min="0"
                  step="10"
                  @input="anyOfferCommits && mirrorCommittedAmount(draft.adjustments.contentWriting)"
                />
              </label>
              <label v-if="!anyOfferCommits">
                Rédaction des contenus · maximum (€)
                <input v-model.number="draft.adjustments.contentWriting.maximumAmount" type="number" min="0" step="10" />
              </label>
            </div>
            <span class="field-error">{{ errors["adjustments.contentWriting.maximumAmount"] }}</span>
            <p class="muted">
              Le délai prioritaire est désormais un supplément fixe, réglé formule par formule.
            </p>
          </div>

          <h3>Outils proposés dans le formulaire</h3>
          <p class="muted">
            Ils servent de contexte à l’analyse. Un outil ne porte aucun montant et ne change jamais un prix.
          </p>
          <div class="tools">
            <label v-for="(tool, index) in draft.tools" :key="index" class="label-field">
              <span class="sr-only">Outil {{ index + 1 }}</span>
              <input v-model="tool.label" type="text" :aria-invalid="!!errors[`tools.${index}.label`]" />
              <span class="field-error">{{ errors[`tools.${index}.label`] || errors[`tools.${index}.key`] }}</span>
            </label>
          </div>

          <div class="actions">
            <button class="btn btn-secondary" type="button" :disabled="saving" @click="load">
              Annuler
            </button>
            <button class="btn btn-primary" type="button" :disabled="saving" @click="save">
              {{ saving ? "Enregistrement…" : "Enregistrer" }}
            </button>
          </div>
        </article>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import type { QuotePricingMode } from "../types";
import {
  PRICING_MODES,
  commitsToASingleAmount,
  describeErrorPath,
  useQuotePricingAdmin,
} from "../composables/useQuotePricingAdmin";

const {
  state,
  draft,
  version,
  updatedAt,
  selectedOfferKey,
  currentOffer,
  errors,
  feedback,
  globalError,
  saving,
  load,
  save,
} = useQuotePricingAdmin();

const offerIndex = computed(() =>
  draft.value?.offers.findIndex((offer) => offer.key === selectedOfferKey.value) ?? -1,
);

const pricingModes = PRICING_MODES;

const offerCommits = computed(() => commitsToASingleAmount(currentOffer.value));
const anyOfferCommits = computed(() => (draft.value?.offers ?? []).some(commitsToASingleAmount));

/** A committed mode has one amount: keep both fields equal while typing. */
const mirrorCommittedAmount = (item: { minimumAmount: number; maximumAmount: number }): void => {
  item.maximumAmount = item.minimumAmount;
};

const selectMode = (
  variant: { pricingMode: QuotePricingMode; minimumAmount: number; maximumAmount: number },
  mode: QuotePricingMode,
): void => {
  variant.pricingMode = mode;
  // Switching to a committed mode collapses the range onto its lower bound.
  if (mode !== "range") mirrorCommittedAmount(variant);
};

const errorFor = (
  offer: number,
  collection: string,
  index: number,
  field: string,
): string => errors.value[`offers.${offer}.${collection}.${index}.${field}`] ?? "";

const errorSummary = computed(() =>
  draft.value
    ? Object.entries(errors.value).map(([path, message]) => ({
        path,
        message,
        where: describeErrorPath(draft.value!, path),
      }))
    : [],
);

const hasOfferError = (offerKey: string): boolean => {
  const index = draft.value?.offers.findIndex((offer) => offer.key === offerKey) ?? -1;
  return index >= 0 && Object.keys(errors.value).some((path) => path.startsWith(`offers.${index}.`));
};

/** Jump to the offer carrying a server error, so the field to fix is on screen. */
const focusOffer = (path: string): void => {
  const index = Number(path.split(".")[1]);
  const offer = draft.value?.offers[index];
  if (offer) selectedOfferKey.value = offer.key;
};

const formatDate = (value: string): string =>
  value ? new Date(value).toLocaleDateString("fr-FR", { dateStyle: "medium" }) : "—";

onMounted(() => {
  void load();
});
</script>

<style scoped>
.muted {
  color: var(--muted);
}

.version {
  margin-top: 4px;
}

.error {
  color: #b00020;
}

.success {
  color: #1b6b3a;
}

.error-summary {
  border: 1px solid #b00020;
  padding: 12px 16px 12px 32px;
  margin: 12px 0;
}

.error-summary button {
  background: none;
  border: none;
  padding: 0;
  color: #b00020;
  text-align: left;
  cursor: pointer;
  text-decoration: underline;
}

.layout {
  display: grid;
  grid-template-columns: minmax(180px, 240px) 1fr;
  gap: 24px;
  margin-top: 16px;
}

.offer-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.offer-row {
  width: 100%;
  text-align: left;
  padding: 10px 12px;
  border: 1px solid var(--border, #d9d4c7);
  background: none;
  cursor: pointer;
}

.offer-row.active {
  border-color: var(--yellow);
  font-weight: 600;
}

.offer-row.invalid {
  border-color: #b00020;
}

.editor {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.priced-item {
  border-top: 1px solid var(--border, #d9d4c7);
  padding-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label-field,
.include-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.amounts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.amounts label {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-error:not(:empty) {
  color: #b00020;
  font-size: 0.9rem;
}

.modes {
  border: 1px solid var(--border, #d9d4c7);
  padding: 10px 12px;
  margin: 0;
  display: grid;
  gap: 6px;
}

.modes legend {
  font-size: 0.85rem;
  padding: 0 4px;
}

.mode-choice {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.mode-choice em {
  display: block;
  font-size: 0.85rem;
  opacity: 0.75;
  font-style: normal;
}

.tools {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 10px;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

@media (max-width: 720px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .amounts {
    grid-template-columns: 1fr;
  }
}
</style>
