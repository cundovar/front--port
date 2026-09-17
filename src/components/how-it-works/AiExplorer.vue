<template>
  <div class="ai-explorer">
    <p class="intro">L’IA devient utile quand elle est placée sur une tâche précise, avec un périmètre clair.</p>
    <div class="usage-grid">
      <article v-for="usage in usages" :key="usage.title" class="usage-card">
        <h3>{{ usage.title }}</h3>
        <p>{{ usage.description }}</p>
        <span>{{ usage.example }}</span>
        <small v-if="technical.enabled.value" class="technical-note">{{ usage.technical }}</small>
      </article>
    </div>

    <article class="supervision">
      <div>
        <h3>Supervision humaine</h3>
        <p>L’IA n’est pas obligée de décider seule. Elle peut proposer, analyser ou préparer une action avant validation.</p>
        <p v-if="technical.enabled.value" class="technical-note">
          Côté technique : selon le niveau de risque, une action peut être placée en attente
          de validation avant d’être envoyée vers les outils métier.
        </p>
      </div>
      <div class="control-flow" aria-hidden="true">
        <span>IA propose</span>
        <strong>→</strong>
        <span>Vous validez</span>
        <strong>→</strong>
        <span>Action part</span>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { useTechnicalLevel } from "../../composables/useTechnicalLevel";

const technical = useTechnicalLevel();

const usages = [
  {
    title: "Lire",
    description: "documents, emails, formulaires",
    example: "Exemple : repérer les informations utiles dans un message client.",
    technical: "OCR, parsing de pièces jointes, découpage en segments exploitables.",
  },
  {
    title: "Comprendre",
    description: "classer, résumer, extraire",
    example: "Exemple : trier des demandes par intention ou urgence.",
    technical: "Classification, extraction structurée en JSON, recherche sur vos documents.",
  },
  {
    title: "Produire",
    description: "contenu, rapport, réponse",
    example: "Exemple : préparer une première version à corriger.",
    technical: "Génération cadrée par un gabarit, des données et des règles définies pour le projet.",
  },
  {
    title: "Agir",
    description: "workflow ou outil",
    example: "Exemple : remplir une fiche et attendre la validation.",
    technical: "Appels d’outils exposés par une API, déclenchement n8n, journal des actions.",
  },
];
</script>

<style scoped>
.ai-explorer {
  display: flex;
  flex-direction: column;
  gap: clamp(24px, 4vw, 38px);
}

.intro {
  margin: 0;
  max-width: 65ch;
  color: var(--muted);
  font-size: clamp(18px, 3vw, 21px);
}

.usage-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-top: 3px solid var(--line);
  border-left: 3px solid var(--line);
}

.usage-card {
  /* Four columns: the card is narrow long before the viewport is. */
  container-type: inline-size;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 210px;
  padding: 20px;
  border-right: 3px solid var(--line);
  border-bottom: 3px solid var(--line);
  background: var(--bg-elev);
  transition: background 160ms var(--ease), transform 160ms var(--ease);
}

.technical-note {
  margin-top: auto;
  padding-top: 10px;
  border-top: 2px solid var(--line);
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 11px;
  line-height: 1.4;
}

.usage-card:hover {
  background: color-mix(in oklch, var(--bg-elev) 88%, var(--secondary));
  transform: translateY(-3px);
}

.usage-card h3 {
  margin: 0;
  font-family: var(--font-display);
  /* "COMPRENDRE" is the longest label and sets the lower bound. */
  font-size: clamp(22px, 17cqi, 42px);
  line-height: 0.85;
  text-transform: uppercase;
  overflow-wrap: break-word;
}

.usage-card p {
  margin: 0;
  color: var(--text);
  font-weight: 650;
}

.usage-card span {
  margin-top: auto;
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 11px;
}

.supervision {
  display: grid;
  grid-template-columns: minmax(260px, 0.8fr) minmax(320px, 1.2fr);
  gap: clamp(20px, 4vw, 34px);
  align-items: center;
  padding: clamp(22px, 4vw, 34px);
  border: 3px solid var(--line);
  background: var(--bg-elev);
  box-shadow: var(--shadow);
}

.supervision h3 {
  margin: 0 0 8px;
  font-family: var(--font-display);
  font-size: clamp(30px, 6vw, 48px);
  line-height: 0.85;
  text-transform: uppercase;
}

.supervision p {
  margin: 0;
  color: var(--muted);
}

.control-flow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 16px;
  border: 3px dashed var(--line);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
}

.control-flow strong {
  color: var(--accent);
}

@media (max-width: 860px) {
  .usage-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .supervision {
    grid-template-columns: 1fr;
  }

  .control-flow {
    flex-wrap: wrap;
    justify-content: flex-start;
  }
}

@media (max-width: 520px) {
  .usage-grid {
    grid-template-columns: 1fr;
  }
}
</style>
