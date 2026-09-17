<template>
  <div class="explorer">
    <p class="intro">Trois situations mènent à faire développer une application : les informations sont éparpillées, les outils ne se parlent pas, ou le projet doit pouvoir grandir.</p>
    <div class="options">
      <button
        v-for="option in options"
        :key="option.key"
        :class="{ active: selected === option.key }"
        type="button"
        :aria-expanded="selected === option.key"
        @click="selected = selected === option.key ? null : option.key"
      >
        <strong>{{ option.label }}</strong>
        <span class="purpose">{{ option.description }}</span>
        <small v-if="technical.enabled.value" class="stack">{{ option.stack }}</small>
      </button>
    </div>

    <article v-if="activeOption" class="detail" aria-live="polite">
      <h3>{{ activeOption.title }}</h3>
      <p>{{ activeOption.detail }}</p>
      <ul>
        <li v-for="point in activeOption.points" :key="point">{{ point }}</li>
      </ul>
      <p v-if="technical.enabled.value" class="technical-note">
        Côté technique : {{ activeOption.technical }}
      </p>
    </article>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useTechnicalLevel } from "../../composables/useTechnicalLevel";

interface ApplicationOption {
  key: string;
  label: string;
  stack: string;
  description: string;
  title: string;
  detail: string;
  points: string[];
  technical: string;
}

const options: ApplicationOption[] = [
  {
    key: "internal",
    label: "Outil interne",
    stack: "Vue + Symfony",
    description: "Vos informations sont éparpillées",
    title: "Un outil construit autour de votre façon de travailler",
    detail: "Suivi clients, préparation de devis, gestion de documents, backoffice : l’outil enregistre ce qui aujourd’hui vit dans plusieurs fichiers.",
    points: ["Un seul endroit fiable", "Rôles et permissions", "Historique des actions"],
    technical: "Vue 3 + TypeScript côté interface, Symfony et Doctrine côté logique, MySQL pour les données.",
  },
  {
    key: "connected",
    label: "Application connectée",
    stack: "API + intégrations",
    description: "Vos outils ne se parlent pas",
    title: "Des données qui circulent sans copier-coller",
    detail: "L’application devient le point de passage entre votre site, votre CRM, vos emails et vos documents.",
    points: ["Connexions maîtrisées", "Reprise en cas d’erreur", "Traçabilité des échanges"],
    technical: "API REST, webhooks, journalisation et, lorsque nécessaire, files d’attente pour fiabiliser les échanges.",
  },
  {
    key: "product",
    label: "Produit évolutif",
    stack: "React + API + SQL",
    description: "Votre projet doit pouvoir grandir",
    title: "Une base technique qui grandit avec le projet",
    detail: "Interface riche, API documentée et base de données structurée pour ajouter des fonctionnalités sans tout réécrire.",
    points: ["Évolutions progressives", "Tests automatisables", "Backoffice dédié"],
    technical: "React + TypeScript, API REST versionnée, PostgreSQL, tests automatisés et déploiement continu.",
  },
];

const technical = useTechnicalLevel();
const selected = ref<ApplicationOption["key"] | null>("internal");
const activeOption = computed(() => options.find((option) => option.key === selected.value) ?? options[0]);
</script>

<style scoped>
.explorer {
  display: flex;
  flex-direction: column;
  gap: clamp(20px, 3vw, 32px);
}

.intro {
  margin: 0;
  max-width: 65ch;
  color: var(--muted);
  font-size: clamp(18px, 3vw, 21px);
}

.options {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(16px, 3vw, 28px);
}

.options button {
  /* Sized against the card, like the other explorers. */
  container-type: inline-size;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 170px;
  padding: clamp(18px, 3vw, 26px);
  border: 3px solid var(--line);
  background: var(--bg-elev);
  box-shadow: 8px 8px 0 var(--line);
  color: var(--text);
  text-align: left;
  cursor: pointer;
  transition: transform 160ms var(--ease), box-shadow 160ms var(--ease), background 160ms var(--ease);
}

.options button:hover,
.options button.active {
  transform: translate(-2px, -2px);
  box-shadow: 10px 10px 0 var(--line);
  background: color-mix(in oklch, var(--bg-elev) 88%, var(--blue));
}

.options .purpose {
  color: var(--muted);
  font-size: 15px;
}

.options .stack {
  margin-top: auto;
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

.options strong {
  font-family: var(--font-display);
  font-size: clamp(20px, 16cqi, 34px);
  line-height: 0.9;
  text-transform: uppercase;
  overflow-wrap: break-word;
}

.detail {
  padding: clamp(20px, 4vw, 30px);
  border: 3px solid var(--line);
  background: var(--bg-elev);
  box-shadow: var(--shadow);
}

.detail h3 {
  margin: 0 0 8px;
  font-family: var(--font-display);
  font-size: clamp(27px, 5vw, 42px);
  line-height: 0.88;
  text-transform: uppercase;
}

.detail > p {
  margin: 0 0 16px;
  color: var(--muted);
  max-width: 70ch;
}

.detail ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.detail li {
  padding-left: 20px;
  position: relative;
}

.detail > .technical-note {
  margin: 16px 0 0;
  padding-top: 12px;
  border-top: 2px solid var(--line);
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 12px;
}

.detail li::before {
  content: "→";
  position: absolute;
  left: 0;
  color: var(--blue);
  font-family: var(--font-mono);
  font-weight: 900;
}

@media (max-width: 760px) {
  .options {
    grid-template-columns: 1fr;
  }

  .detail ul {
    grid-template-columns: 1fr;
  }
}
</style>
