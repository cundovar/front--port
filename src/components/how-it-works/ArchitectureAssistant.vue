<template>
  <div class="assistant" :style="{ '--questions': asksWhoEdits(kind) ? 3 : 2 }">
    <fieldset>
      <legend><span class="step">1</span>Que voulez-vous créer ?</legend>
      <div class="choices">
        <button
          v-for="choice in kinds"
          :key="choice.value"
          :class="{ selected: kind === choice.value }"
          type="button"
          @click="kind = choice.value"
        >
          {{ choice.label }}
        </button>
      </div>
    </fieldset>

    <!-- Only shown where it changes the answer; see asksWhoEdits. -->
    <fieldset v-if="asksWhoEdits(kind)">
      <legend><span class="step">2</span>Le contenu devra-t-il être modifié ?</legend>
      <div class="choices">
        <button
          v-for="choice in owners"
          :key="choice.value"
          :class="{ selected: owner === choice.value }"
          type="button"
          @click="owner = choice.value"
        >
          {{ choice.label }}
        </button>
      </div>
    </fieldset>

    <fieldset>
      <legend><span class="step">{{ asksWhoEdits(kind) ? 3 : 2 }}</span>Votre projet est-il très spécifique ?</legend>
      <div class="choices">
        <button
          v-for="choice in specificities"
          :key="choice.value"
          :class="{ selected: specificity === choice.value }"
          type="button"
          @click="specificity = choice.value"
        >
          {{ choice.label }}
        </button>
      </div>
    </fieldset>

    <article class="result" aria-live="polite">
      <p class="result-label">Une piste adaptée à ce type de besoin</p>

      <div class="chain plain">
        <span v-for="(step, index) in recommendation.plain" :key="step">
          <em>{{ step }}<sup v-if="plainGlossary[step]" aria-hidden="true">*</sup></em>
          <strong v-if="index < recommendation.plain.length - 1" aria-hidden="true">→</strong>
        </span>
      </div>

      <div v-if="technical.enabled.value" class="chain named">
        <span v-for="(step, index) in recommendation.stack" :key="step">
          <em>{{ step }}</em>
          <strong v-if="index < recommendation.stack.length - 1" aria-hidden="true">→</strong>
        </span>
      </div>

      <ul>
        <li v-for="quality in recommendation.qualities" :key="quality">{{ quality }}</li>
      </ul>
      <p class="reason">{{ recommendation.reason }}</p>

      <dl v-if="definitions.length" class="glossary">
        <template v-for="entry in definitions" :key="entry.term">
          <dt>{{ entry.term }}<sup aria-hidden="true">*</sup></dt>
          <dd>{{ entry.definition }}</dd>
        </template>
      </dl>

      <div class="result-actions">
        <RouterLink class="estimate-link" to="/devis">En parler concrètement</RouterLink>
        <span>Estimation indicative · Sans engagement</span>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { RouterLink } from "vue-router";
import { useTechnicalLevel } from "../../composables/useTechnicalLevel";
import {
  asksWhoEdits,
  definitionsFor,
  plainGlossary,
  recommendArchitecture,
  type ContentOwner,
  type ProjectKind,
  type Specificity,
} from "../../data/howItWorks";

const kinds = [
  { value: "site" as ProjectKind, label: "Site" },
  { value: "application" as ProjectKind, label: "Application" },
  { value: "automation" as ProjectKind, label: "Automatisation" },
  { value: "ai" as ProjectKind, label: "Outil IA" },
];

// Which person edits never changed the recommendation; whether anyone does,
// does. Two honest buttons rather than three, one of them decorative.
const owners = [
  { value: "someone" as ContentOwner, label: "Oui, régulièrement" },
  { value: "nobody" as ContentOwner, label: "Non, il est figé" },
];

const specificities = [
  { value: "low" as Specificity, label: "Peu" },
  { value: "medium" as Specificity, label: "Moyennement" },
  { value: "high" as Specificity, label: "Beaucoup" },
];

const technical = useTechnicalLevel();
const kind = ref<ProjectKind>("site");
const owner = ref<ContentOwner>("someone");
const specificity = ref<Specificity>("low");

const recommendation = computed(() => recommendArchitecture(kind.value, owner.value, specificity.value));
const definitions = computed(() => definitionsFor(recommendation.value.plain));
</script>

<style scoped>
.assistant {
  display: grid;
  grid-template-columns: repeat(var(--questions, 3), minmax(0, 1fr));
  gap: clamp(16px, 3vw, 26px);
  align-items: start;
}

fieldset {
  min-width: 0;
  margin: 0;
  padding: 16px;
  border: 3px solid var(--line);
  background: var(--bg-elev);
}

legend {
  padding: 0 6px;
  color: var(--accent);
  font-family: var(--font-display);
  font-size: clamp(18px, 2.2vw, 23px);
  font-weight: 900;
  line-height: 0.95;
}

/* Inline rather than a flex item: the question wraps around it on a narrow
   column instead of being pushed onto its own line. */
.step {
  margin-right: 8px;
}

.choices {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.choices button {
  padding: 9px 10px;
  border: 2px solid var(--line);
  background: transparent;
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  cursor: pointer;
}

.choices button:hover {
  background: var(--soft);
}

.choices button.selected {
  background: var(--text);
  color: var(--bg-elev);
}

.result {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: clamp(22px, 4vw, 34px);
  border: 3px solid var(--line);
  background: var(--bg-elev);
  box-shadow: var(--shadow);
}

.result-label {
  margin: 0;
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
}

.chain {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.chain span {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.chain.plain em {
  font-family: var(--font-display);
  font-size: clamp(24px, 4.4vw, 40px);
  font-style: normal;
  line-height: 0.9;
  text-transform: uppercase;
}

.chain.named {
  padding-top: 12px;
  border-top: 2px solid var(--line);
}

.chain.named em {
  padding: 7px 9px;
  border: 2px solid var(--line);
  background: var(--soft);
  font-family: var(--font-mono);
  font-size: 11px;
  font-style: normal;
  font-weight: 900;
  text-transform: uppercase;
}

.chain strong {
  color: var(--accent);
}

.chain.plain sup {
  font-size: 0.45em;
  color: var(--accent);
  vertical-align: super;
}

/* The definitions sit inside the card, under the reason: a visitor who reads
   the chain and stops is not sent looking elsewhere for the words in it. */
.glossary {
  margin: 4px 0 0;
  padding-top: 12px;
  border-top: 2px solid var(--line);
}

.glossary dt {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
}

.glossary dt sup {
  color: var(--accent);
}

.glossary dd {
  margin: 2px 0 10px;
  max-width: 70ch;
  color: var(--muted);
  font-size: 15px;
}

.glossary dd:last-child {
  margin-bottom: 0;
}

.result ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.result li {
  padding: 7px 9px;
  border: 2px solid var(--line);
  background: var(--soft);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

.reason {
  margin: 0;
  max-width: 78ch;
  color: var(--muted);
}

.result-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  padding-top: 14px;
  border-top: 2px solid var(--line);
}

.estimate-link {
  display: inline-flex;
  align-items: center;
  min-height: 46px;
  padding: 12px 16px;
  border: 2px solid var(--line);
  background: var(--accent);
  color: #fffef8;
  box-shadow: 5px 5px 0 var(--line);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
}

.result-actions > span {
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
}

@media (max-width: 820px) {
  .assistant {
    grid-template-columns: 1fr;
  }
}
</style>
