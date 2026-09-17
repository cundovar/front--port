<template>
  <main class="page">
    <header class="section page-header">
      <RouterLink class="back-link" to="/">← Accueil</RouterLink>
      <h1>Comment ça marche ?</h1>
      <p>Pas besoin de connaître la technique pour choisir une bonne solution. Choisissez d’abord ce que vous voulez construire.</p>
      <button
        class="technical-switch"
        type="button"
        :aria-pressed="technical.enabled.value"
        @click="technical.toggle"
      >
        {{ technical.label.value }}
      </button>
      <p class="technical-hint">
        {{
          technical.enabled.value
            ? "Les noms des outils et des couches sont affichés partout sur la page."
            : "Envie d’aller plus loin ? Affichez les technologies utilisées derrière chaque solution."
        }}
      </p>
      <TechStackMarquee v-if="technical.enabled.value" :items="stackItems" />
    </header>

    <section class="section entry-section" aria-labelledby="entry-title">
      <h2 id="entry-title">Construire mon projet</h2>
      <div class="entry-grid">
        <button
          v-for="entry in entries"
          :key="entry.key"
          :class="{ active: activeEntry === entry.key }"
          type="button"
          :aria-expanded="activeEntry === entry.key"
          @click="activeEntry = entry.key"
        >
          <span>{{ entry.title }}</span>
          <strong>{{ entry.promise }}</strong>
          <em>{{ activeEntry === entry.key ? "Contenu affiché" : entry.action }}</em>
        </button>
      </div>

      <div class="entry-panel" aria-live="polite">
        <SiteSolutionExplorer v-if="activeEntry === 'site'" />
        <ApplicationSolutionExplorer v-else-if="activeEntry === 'application'" />
        <AutomationExplorer v-else-if="activeEntry === 'automation'" />
        <AiExplorer v-else />
      </div>
    </section>

    <section class="section hood-section" aria-labelledby="hood-title">
      <h2 id="hood-title">Sous le capot</h2>
      <p>Un site web utilise plusieurs couches. Elles n’ont pas toutes le même rôle.</p>
      <UnderTheHoodDiagram />
    </section>

    <section class="section assistant-section" aria-labelledby="assistant-title">
      <h2 id="assistant-title">Construisez votre projet</h2>
      <p>Trois questions suffisent pour voir une architecture possible. Ce n’est pas une décision finale, juste une première piste.</p>
      <ArchitectureAssistant />
    </section>

    <section class="section final-section">
      <div class="final-card">
        <div>
          <h2>On garde le même langage</h2>
          <p>Vous parlez de votre travail, je traduis les besoins en solution technique et j’explique les choix au fil du projet.</p>
        </div>
        <div class="final-actions">
          <RouterLink to="/devis">Estimer mon projet</RouterLink>
          <RouterLink to="/realisations">Voir des réalisations</RouterLink>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { RouterLink } from "vue-router";
import { provideTechnicalLevel } from "../composables/useTechnicalLevel";
import SiteSolutionExplorer from "../components/how-it-works/SiteSolutionExplorer.vue";
import ApplicationSolutionExplorer from "../components/how-it-works/ApplicationSolutionExplorer.vue";
import AutomationExplorer from "../components/how-it-works/AutomationExplorer.vue";
import AiExplorer from "../components/how-it-works/AiExplorer.vue";
import UnderTheHoodDiagram from "../components/how-it-works/UnderTheHoodDiagram.vue";
import ArchitectureAssistant from "../components/how-it-works/ArchitectureAssistant.vue";
import TechStackMarquee from "../components/how-it-works/TechStackMarquee.vue";
import { useContent } from "../composables/useContent";

type EntryKey = "site" | "application" | "automation" | "ai";

const entries = [
  {
    key: "site" as EntryKey,
    title: "Créer un site",
    promise: "Voir les options",
    action: "Site simple, évolutif ou sur mesure",
  },
  {
    key: "application" as EntryKey,
    title: "Créer une application",
    promise: "Centraliser votre activité",
    action: "Outil interne, connecté ou évolutif",
  },
  {
    key: "automation" as EntryKey,
    title: "Automatiser",
    promise: "Gagner du temps",
    action: "Supprimer les tâches répétitives",
  },
  {
    key: "ai" as EntryKey,
    title: "Ajouter de l’IA",
    promise: "Voir les usages",
    action: "Lire, comprendre, produire, agir",
  },
];

const activeEntry = ref<EntryKey>("site");
const technical = provideTechnicalLevel();

const { content } = useContent();

/** The band shows what the backoffice lists under "Stack", nothing hardcoded. */
const stackItems = computed(() =>
  (content.value.stack.items ?? []).map((item) => item.trim()).filter(Boolean),
);
</script>

<style scoped>
.page-header {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.back-link {
  position: relative;
  /* The h1 keeps its tight line-height, so its glyph box reaches up here. */
  z-index: 1;
  padding: 4px 2px;
  width: fit-content;
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}

.technical-switch {
  width: fit-content;
  min-height: 44px;
  padding: 10px 14px;
  border: 3px solid var(--line);
  background: var(--bg-elev);
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 160ms var(--ease), box-shadow 160ms var(--ease), background 160ms var(--ease);
}

.technical-switch:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 var(--line);
}

.technical-switch[aria-pressed="true"] {
  background: var(--text);
  color: var(--bg-elev);
  box-shadow: 5px 5px 0 var(--line);
}

.technical-hint {
  margin: 0;
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 12px;
}

.page-header h1,
.entry-section h2,
.hood-section h2,
.assistant-section h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(42px, 10vw, 112px);
  line-height: 0.78;
  text-transform: uppercase;
  text-wrap: balance;
}

/* A line-height of 0.78 lets the glyphs spill ~0.3em past the box: without this
   the ascenders swallowed the "Accueil" link and the "Ç" fell into the intro. */
.page-header h1 {
  padding-block: 0.3em;
}

.page-header > p:not(.technical-hint),
.hood-section > p,
.assistant-section > p {
  margin: 0;
  max-width: 65ch;
  color: var(--muted);
  font-size: clamp(18px, 3vw, 21px);
}

.hood-section,
.assistant-section {
  display: flex;
  flex-direction: column;
  gap: clamp(28px, 5vw, 48px);
}

.entry-section {
  display: flex;
  flex-direction: column;
  gap: clamp(28px, 5vw, 48px);
}

.entry-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: clamp(16px, 3vw, 24px);
}

.entry-grid button {
  /* The label sizes against the card, not the viewport: at 4 columns the
     viewport is still wide while the column is already too narrow. */
  container-type: inline-size;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  min-height: 190px;
  padding: clamp(18px, 3vw, 26px);
  border: 3px solid var(--line);
  background: var(--bg-elev);
  color: var(--text);
  text-align: left;
  box-shadow: 8px 8px 0 var(--line);
  cursor: pointer;
  transition: transform 160ms var(--ease), box-shadow 160ms var(--ease), background 160ms var(--ease);
}

.entry-grid button:hover,
.entry-grid button.active {
  transform: translate(-2px, -2px);
  box-shadow: 10px 10px 0 var(--line);
  background: color-mix(in oklch, var(--bg-elev) 88%, var(--accent));
}

.entry-grid span {
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

.entry-grid strong {
  font-family: var(--font-display);
  /* "CENTRALISER" is the longest unbreakable word and sets the lower bound. */
  font-size: clamp(21px, 16.5cqi, 36px);
  line-height: 0.85;
  text-transform: uppercase;
  overflow-wrap: break-word;
}

.entry-grid em {
  margin-top: auto;
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 11px;
  font-style: normal;
  font-weight: 800;
  text-transform: uppercase;
}

.entry-panel {
  padding-top: clamp(4px, 1vw, 10px);
}

.final-card {
  display: grid;
  grid-template-columns: minmax(280px, 1.2fr) minmax(220px, 0.8fr);
  gap: clamp(20px, 4vw, 34px);
  align-items: center;
  padding: clamp(22px, 4vw, 36px);
  border: 3px solid var(--line);
  background:
    repeating-linear-gradient(90deg, var(--soft) 0 12px, transparent 12px 24px),
    var(--bg-elev);
  box-shadow: var(--shadow);
}

.final-card h2 {
  margin: 0 0 8px;
  font-family: var(--font-display);
  font-size: clamp(36px, 8vw, 74px);
  line-height: 0.82;
  text-transform: uppercase;
}

.final-card p {
  margin: 0;
  max-width: 58ch;
  color: var(--muted);
}

.final-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.final-actions a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
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

.final-actions a:last-child {
  background: var(--bg-elev);
  color: var(--text);
}

.final-actions a:hover {
  transform: translate(-2px, -2px);
  box-shadow: 7px 7px 0 var(--line);
}

@media (max-width: 980px) {
  .entry-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .entry-grid,
  .final-card {
    grid-template-columns: 1fr;
  }

  .entry-grid button {
    min-height: 155px;
    box-shadow: 6px 6px 0 var(--line);
  }
}

@media (prefers-reduced-motion: reduce) {
  .technical-switch,
  .technical-switch:hover,
  .entry-grid button,
  .entry-grid button:hover,
  .entry-grid button.active,
  .final-actions a:hover {
    transition: none;
    transform: none;
  }
}
</style>
