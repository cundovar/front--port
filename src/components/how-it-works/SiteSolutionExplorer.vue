<template>
  <div class="explorer">
    <p class="explorer-intro">Vous avez besoin d’un site. Trois chemins sont possibles selon ce que vous voulez modifier et faire évoluer.</p>

    <div class="path-grid">
      <button
        v-for="option in options"
        :key="option.key"
        :class="['path-card', { active: selected === option.key }]"
        type="button"
        :aria-expanded="selected === option.key"
        @click="selected = selected === option.key ? null : option.key"
      >
        <span class="path-label">{{ option.label }}</span>
        <strong>{{ option.stack }}</strong>
        <span class="path-hint">Voir le détail</span>
      </button>
    </div>

    <article v-if="activeOption" class="detail-card" aria-live="polite">
      <header>
        <h3>{{ activeOption.stack }}</h3>
        <p>{{ activeOption.bestFor }}</p>
      </header>
      <ul>
        <li v-for="point in activeOption.points" :key="point">{{ point }}</li>
      </ul>
      <p class="caution">⚠ {{ activeOption.caution }}</p>
      <div class="technical">
        <button
          class="why-button"
          type="button"
          :aria-pressed="technical.enabled.value"
          @click="technical.toggle"
        >
          {{ technical.enabled.value ? "Masquer la partie technique" : "Pourquoi ?" }}
        </button>
        <p v-if="technical.enabled.value">{{ activeOption.technical }}</p>
      </div>
    </article>

  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useTechnicalLevel } from "../../composables/useTechnicalLevel";

interface SiteOption {
  key: string;
  label: string;
  stack: string;
  bestFor: string;
  points: string[];
  caution: string;
  technical: string;
}

const options: SiteOption[] = [
  {
    key: "wordpress",
    label: "Site simple",
    stack: "WordPress",
    bestFor: "Site vitrine, blog, association, indépendant ou petite boutique.",
    points: [
      "Rapide à mettre en place",
      "Le client peut modifier ses contenus",
      "Beaucoup de fonctionnalités disponibles",
    ],
    caution: "Moins adapté à une logique métier très spécifique.",
    technical: "WordPress, PHP, MySQL, thème personnalisé et extensions choisies selon le besoin.",
  },
  {
    key: "headless",
    label: "Site évolutif",
    stack: "CMS Headless",
    bestFor: "Projet qui veut une interface libre sans renoncer à un back-office.",
    points: [
      "Interface personnalisée",
      "Contenus administrables",
      "Le même contenu peut alimenter plusieurs interfaces",
    ],
    caution: "Un peu plus technique qu’un WordPress classique.",
    technical: "React ou Vue pour l’affichage, Payload ou Strapi pour les contenus, API et base SQL.",
  },
  {
    key: "custom",
    label: "Projet sur mesure",
    stack: "Symfony / React",
    bestFor: "Application avec des règles métier, des rôles et des processus spécifiques.",
    points: [
      "Conçu autour du travail réel",
      "Backoffice adapté",
      "Fonctionnalités ajoutées selon vos besoins",
    ],
    caution: "Budget et délai plus importants qu’un site vitrine.",
    technical: "Symfony pour l’API et la logique, React pour l’interface, PostgreSQL ou MySQL pour les données.",
  },
];


const technical = useTechnicalLevel();
const selected = ref<string | null>("wordpress");

const activeOption = computed(() => options.find((option) => option.key === selected.value) ?? null);
</script>

<style scoped>
.explorer {
  display: flex;
  flex-direction: column;
  gap: clamp(24px, 4vw, 40px);
}

.explorer-intro {
  margin: 0;
  color: var(--muted);
  font-size: clamp(18px, 3vw, 21px);
  max-width: 65ch;
}

.path-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(16px, 3vw, 28px);
}

.path-card {
  /* Sized against the card: "WORDPRESS" is unbreakable and the column gets
     narrow long before the viewport does. */
  container-type: inline-size;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  min-height: 180px;
  padding: clamp(18px, 3vw, 26px);
  border: 3px solid var(--line);
  background: var(--bg-elev);
  box-shadow: 8px 8px 0 var(--line);
  color: var(--text);
  text-align: left;
  cursor: pointer;
  transition: transform 160ms var(--ease), box-shadow 160ms var(--ease), background 160ms var(--ease);
}

.path-card:hover,
.path-card.active {
  transform: translate(-2px, -2px);
  box-shadow: 10px 10px 0 var(--line);
  background: color-mix(in oklch, var(--bg-elev) 88%, var(--accent));
}

.path-label,
.path-hint {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

.path-label {
  color: var(--muted);
}

.path-card strong {
  font-family: var(--font-display);
  font-size: clamp(21px, 17cqi, 35px);
  line-height: 0.9;
  text-transform: uppercase;
  overflow-wrap: break-word;
}

.path-hint {
  margin-top: auto;
  color: var(--accent);
}

.detail-card {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: clamp(22px, 4vw, 34px);
  border: 3px solid var(--line);
  background: var(--bg-elev);
  box-shadow: var(--shadow);
}

.detail-card header {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-card h3 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(30px, 6vw, 50px);
  line-height: 0.85;
  text-transform: uppercase;
}

.detail-card header p {
  margin: 0;
  color: var(--muted);
}

.detail-card ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
}

.detail-card li {
  padding-left: 22px;
  position: relative;
}

.detail-card li::before {
  content: "✓";
  position: absolute;
  left: 0;
  color: var(--accent);
  font-family: var(--font-mono);
  font-weight: 900;
}

.caution {
  margin: 0;
  color: var(--muted);
}

.technical {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 14px;
  border-top: 2px solid var(--line);
}

.why-button {
  width: fit-content;
  padding: 8px 11px;
  border: 2px solid var(--line);
  background: transparent;
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  cursor: pointer;
}

.why-button:hover {
  background: var(--text);
  color: var(--bg-elev);
}

.technical p {
  margin: 0;
  color: var(--muted);
}

@media (max-width: 760px) {
  .path-grid {
    grid-template-columns: 1fr;
  }

  .path-card {
    min-height: 150px;
    box-shadow: 6px 6px 0 var(--line);
  }
}
</style>
