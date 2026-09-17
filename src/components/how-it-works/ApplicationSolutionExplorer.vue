<template>
  <div class="explorer">
    <p class="intro">Derrière le mot « application » se cachent trois besoins très différents. La question qui les sépare : qui va s’en servir ?</p>
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
        <span class="purpose">{{ option.purpose }}</span>
        <small v-if="technical.enabled.value" class="stack">{{ option.stack }}</small>
      </button>
    </div>

    <article v-if="activeOption" class="detail" aria-live="polite">
      <h3>{{ activeOption.title }}</h3>
      <p>{{ activeOption.detail }}</p>

      <h4 class="examples-title">Par exemple</h4>
      <ul class="examples">
        <li v-for="example in activeOption.examples" :key="example">{{ example }}</li>
      </ul>

      <ul class="points">
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
  /** Who uses the thing: the one question that actually separates the three. */
  purpose: string;
  stack: string;
  title: string;
  detail: string;
  /** Situations a visitor can recognise as their own, not categories. */
  examples: string[];
  points: string[];
  technical: string;
}

const options: ApplicationOption[] = [
  {
    key: "internal",
    label: "Outil interne",
    purpose: "C’est votre équipe qui s’en sert tous les jours",
    stack: "Vue + Symfony + MySQL",
    title: "Un outil construit autour de votre façon de travailler",
    detail: "Ce qui vit aujourd’hui dans plusieurs tableurs, des emails et un classeur papier tient dans un seul endroit, avec la même information pour tout le monde.",
    examples: [
      "Un suivi des clients et des devis, aujourd’hui éclaté dans trois tableurs",
      "Un planning d’interventions que chaque technicien consulte depuis son téléphone",
      "Un backoffice pour saisir les commandes et suivre les stocks",
    ],
    points: ["Un seul endroit fiable", "Chacun voit ce qui le concerne", "Historique des actions"],
    technical: "Vue 3 + TypeScript côté interface, Symfony et Doctrine côté logique, MySQL pour les données.",
  },
  {
    key: "connected",
    label: "Application connectée",
    purpose: "Personne ne l’ouvre : elle fait circuler vos données",
    stack: "API REST + webhooks",
    title: "Vos outils existants arrêtent de s’ignorer",
    detail: "Vous gardez votre site, votre CRM et votre logiciel de facturation. L’application se place entre eux et transporte l’information, à la place de la personne qui recopie.",
    examples: [
      "Une commande passée sur le site crée la facture dans votre logiciel de comptabilité",
      "Un formulaire rempli crée la fiche client dans le CRM et déclenche l’email de suivi",
      "Le stock de la boutique et celui du site restent alignés",
    ],
    points: ["Plus de recopie à la main", "Reprise en cas d’erreur", "Trace de chaque échange"],
    technical: "API REST, webhooks, journalisation et, lorsque nécessaire, files d’attente pour fiabiliser les échanges.",
  },
  {
    key: "product",
    label: "Plateforme client",
    purpose: "Ce sont vos clients qui s’y connectent",
    stack: "React + API + PostgreSQL",
    title: "Un service en ligne que vous ferez évoluer",
    detail: "Vos clients ont un compte et font eux-mêmes une partie du travail. Ce n’est plus un outil interne : la base doit tenir quand ils sont dix fois plus nombreux, et accueillir des fonctions que vous n’avez pas encore imaginées.",
    examples: [
      "Un espace où vos clients suivent l’avancement de leur dossier",
      "Une plateforme de réservation avec comptes, paiement et tableau de bord",
      "Un service par abonnement que vous enrichissez version après version",
    ],
    points: ["Comptes et paiement", "Évolutions progressives", "Tests automatisés"],
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

.examples-title {
  margin: 0 0 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--muted);
}

/* One per line and left as sentences: these are situations to recognise, not
   labels to scan, so they are not squeezed into the three-column grid below. */
.examples {
  list-style: none;
  margin: 0 0 20px;
  padding: 0;
  display: grid;
  gap: 6px;
  max-width: 70ch;
}

.examples li {
  padding-left: 18px;
  position: relative;
}

.examples li::before {
  content: "—";
  position: absolute;
  left: 0;
  color: var(--blue);
  font-family: var(--font-mono);
}

.points {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.points li {
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

.points li::before {
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

  .points {
    grid-template-columns: 1fr;
  }
}
</style>
