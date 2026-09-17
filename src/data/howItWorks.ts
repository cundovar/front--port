export type ProjectKind = "site" | "application" | "automation" | "ai";
/** Whether anyone will edit the content. Which person it is never changed the answer. */
export type ContentOwner = "someone" | "nobody";
export type Specificity = "low" | "medium" | "high";

export interface HoodDetail {
  name: string;
  explanation: string;
}

export interface HoodLayer {
  key: string;
  name: string;
  role: string;
  explanation: string;
  technical: string;
  /** Sub-parts revealed only when the layer is opened, so the jargon arrives on demand. */
  details?: HoodDetail[];
}

export const hoodLayers: HoodLayer[] = [
  {
    key: "interface",
    name: "L’interface",
    role: "HTML · CSS · JS · React / Vue",
    explanation:
      "Ce qui construit l’écran et réagit à vos clics. Plusieurs briques y travaillent ensemble.",
    technical: "Sémantique HTML, styles CSS, composants réutilisables, état d’interface.",
    details: [
      { name: "HTML", explanation: "la structure de la page" },
      { name: "CSS", explanation: "l’apparence et la mise en page" },
      { name: "JavaScript", explanation: "les interactions" },
      { name: "React / Vue", explanation: "des interfaces plus riches" },
    ],
  },
  {
    key: "api",
    name: "API",
    role: "Le passage",
    explanation:
      "Dans cette architecture, l’interface passe par une API plutôt que d’accéder directement à la base.",
    technical: "REST, JSON, authentification, validation des données.",
  },
  {
    key: "engine",
    name: "Le moteur",
    role: "Symfony / CMS",
    explanation: "C’est ici que les règles métier, les droits et les traitements sont appliqués.",
    technical: "Symfony, contrôleurs, services, droits d’accès, CMS.",
  },
  {
    key: "data",
    name: "Données",
    role: "Mémoire",
    explanation: "L’endroit où les informations sont conservées, protégées et retrouvées.",
    technical: "PostgreSQL, MySQL, requêtes, sauvegardes.",
  },
];

export interface ArchitectureRecommendation {
  /** The chain a client reads: no product names. */
  plain: string[];
  /** The same chain named, revealed only at the technical level. */
  stack: string[];
  qualities: string[];
  reason: string;
}

// Nobody to edit: a back-office would only add upkeep for no benefit, so the
// effort goes into the interface and the rules instead.
const unmanagedSiteRecommendation = (specificity: Specificity): ArchitectureRecommendation => {
  if (specificity === "high") {
    return {
      plain: ["Interface sur mesure", "Logique métier", "Contenu intégré"],
      stack: ["React", "Symfony", "Contenu structuré"],
      qualities: ["Logique métier sur mesure", "Rien à administrer", "Hébergement peu coûteux"],
      reason:
        "Les règles de travail demandent un développement personnalisé, mais sans contenu à gérer aucun back-office n’est ajouté : le texte vit dans le site.",
    };
  }

  if (specificity === "medium") {
    return {
      plain: ["Interface sur mesure", "Contenu intégré", "Hébergement simple"],
      stack: ["Vue", "Contenu structuré", "Hébergement statique"],
      qualities: ["Interface personnalisée", "Rien à administrer", "Pages très rapides"],
      reason:
        "Sans contenu à gérer, l’effort va dans l’interface plutôt que dans l’administration : elle est dessinée sur mesure, et le contenu change avec le site.",
    };
  }

  return {
    plain: ["Site rapide", "Contenu intégré", "Hébergement simple"],
    stack: ["Vue", "Contenu structuré", "Hébergement statique"],
    qualities: ["Pages très rapides", "Rien à administrer", "Hébergement peu coûteux"],
    reason:
      "Si le contenu bouge rarement, un back-office ajoute de l’entretien sans bénéfice : le contenu vit dans le site et change lors des mises à jour.",
  };
};

const siteRecommendation = (owner: ContentOwner, specificity: Specificity): ArchitectureRecommendation => {
  if (owner === "nobody") return unmanagedSiteRecommendation(specificity);

  // Business rules first: past a certain point no CMS is worth bending.
  if (specificity === "high") {
    return {
      plain: ["Interface sur mesure", "Logique métier", "Back-office", "Base de données"],
      stack: ["React", "Symfony", "Backoffice dédié", "PostgreSQL"],
      qualities: [
        "Logique métier sur mesure",
        "Fonctionnalités ajoutées selon vos besoins",
        "Backoffice adapté au travail réel",
      ],
      reason:
        "Quand les règles de travail deviennent le cœur du projet, un développement personnalisé évite de contourner les limites d’un CMS.",
    };
  }

  // Someone edits, and wants an interface a ready-made theme cannot give.
  if (specificity === "medium") {
    return {
      plain: ["Interface sur mesure", "Back-office séparé", "Base de données"],
      stack: ["React", "Payload", "PostgreSQL"],
      qualities: ["Interface personnalisée", "Administration simple", "Projet facilement évolutif"],
      reason:
        "Un CMS headless sépare ce que voit le visiteur de la gestion des contenus : utile quand on veut une interface libre et un back-office.",
    };
  }

  return {
    plain: ["Site administrable", "Back-office prêt à l’emploi", "Base de données"],
    stack: ["WordPress", "PHP", "MySQL"],
    qualities: ["Mise en ligne rapide", "Contenus modifiables", "Coût maîtrisé au démarrage"],
    reason:
      "Pour un site vitrine, un blog ou une petite boutique, WordPress reste souvent le chemin le plus direct vers un site administrable.",
  };
};

const applicationRecommendation = (specificity: Specificity): ArchitectureRecommendation => {
  if (specificity === "low") {
    return {
      plain: ["Interface claire", "API métier", "Base de données"],
      stack: ["Vue", "Symfony", "MySQL"],
      qualities: ["Outil interne clair", "Données centralisées", "Déploiement simple"],
      reason:
        "Une application maison peut rester raisonnable : une interface claire, une API sécurisée et une base adaptée au travail quotidien.",
    };
  }

  if (specificity === "medium") {
    return {
      plain: ["Interface claire", "API métier", "Droits et validations", "Base de données"],
      stack: ["Vue", "Symfony", "Droits par rôle", "MySQL"],
      qualities: ["Rôles et validations", "Historique des actions", "Déploiement simple"],
      reason:
        "Dès que plusieurs personnes saisissent, les droits et les validations comptent autant que l’écran : ils vivent dans l’API, jamais dans l’interface seule.",
    };
  }

  return {
    plain: ["Interface claire", "API métier", "Intégrations", "Base de données"],
    stack: ["Vue", "Symfony", "API REST", "PostgreSQL"],
    qualities: ["Règles métier sur mesure", "Intégrations possibles", "Base documentée"],
    reason:
      "Quand des outils extérieurs entrent dans la boucle et que les cas particuliers se multiplient, l’API devient le point de passage qui protège les données.",
  };
};

const automationRecommendation = (specificity: Specificity): ArchitectureRecommendation => {
  if (specificity === "low") {
    return {
      plain: ["Déclencheur", "Automatisation", "Vos outils"],
      stack: ["Formulaire ou webhook", "n8n", "CRM · Email · Document"],
      qualities: ["Mise en place rapide", "Actions traçables", "Validation humaine possible"],
      reason:
        "Un workflow peut suffire quand le besoin est d’enchaîner des actions entre des outils existants.",
    };
  }

  if (specificity === "medium") {
    return {
      plain: ["Déclencheur", "Automatisation", "Reprise d’erreur", "Vos outils"],
      stack: ["Webhook", "n8n", "Journal et relances", "Outils métier"],
      qualities: ["Échecs rattrapés", "Journal des exécutions", "Alerte en cas de blocage"],
      reason:
        "Une automatisation qui tourne tous les jours finira par trouver un outil indisponible : ce qui compte alors, c’est ce qui se passe à ce moment-là.",
    };
  }

  return {
    plain: ["Déclencheur", "Automatisation", "Règles métier", "Vos outils"],
    stack: ["Webhook", "n8n", "API Symfony", "Outils métier"],
    qualities: ["Règles métier encodées", "Reprises d’erreur", "Historique complet"],
    reason:
      "Quand les cas particuliers se multiplient, une petite API dédiée rend le workflow plus fiable qu’un enchaînement de conditions cachées.",
  };
};

const aiRecommendation = (specificity: Specificity): ArchitectureRecommendation => {
  if (specificity === "low") {
    return {
      plain: ["Documents", "Assistant", "Validation", "Résultat"],
      stack: ["Assistant IA", "Interface Vue", "Validation humaine"],
      qualities: ["Premier gain rapide", "Réponses vérifiables", "Périmètre limité"],
      reason:
        "On commence par une tâche précise : trier, résumer ou préparer une réponse, avec un humain qui valide.",
    };
  }

  if (specificity === "medium") {
    return {
      plain: ["Vos données", "Assistant", "Validation", "Vos outils"],
      stack: ["IA", "API", "Symfony", "Vue"],
      qualities: ["Contexte plus riche", "Actions préparées", "Suivi des réponses"],
      reason:
        "L’assistant s’appuie sur vos données et vos règles, mais garde une frontière nette entre proposer et décider.",
    };
  }

  return {
    plain: ["Sources choisies", "Recherche ciblée", "Assistant", "Validation"],
    stack: ["IA", "Recherche ciblée", "API", "Supervision"],
    qualities: ["Sources maîtrisées", "Traçabilité", "Validation humaine"],
    reason:
      "Pour un métier sensible, l’assistant travaille sur un périmètre documenté et explique ce qu’il utilise avant d’agir.",
  };
};

/**
 * Words the chain cannot avoid but a client should not have to guess.
 *
 * Only the genuinely opaque ones are here: a definition beside every step
 * would bury the recommendation it is meant to clarify.
 */
export const plainGlossary: Record<string, string> = {
  "Règles métier":
    "Ce que votre activité impose : qui a le droit de faire quoi, ce qui est obligatoire, ce qui est interdit. Les mêmes règles qu’aujourd’hui, écrites une fois pour toutes dans l’outil.",
  "Logique métier":
    "La part du logiciel qui applique vos règles de travail, plutôt que de se contenter d’afficher et d’enregistrer.",
  "API métier":
    "Le passage obligé entre l’écran et vos données : il vérifie chaque demande avant de la laisser aboutir.",
  "Intégrations":
    "Les liens avec vos autres outils — facturation, fichier clients, messagerie. L’application leur transmet l’information et reçoit la leur, sans que personne recopie.",
  "Back-office": "La partie privée du site, où vous modifiez les contenus. Vos visiteurs ne la voient jamais.",
  "Back-office séparé":
    "La partie privée vit à part de la partie publique : l’écran du visiteur peut être refait sans toucher à la gestion des contenus.",
  "Back-office prêt à l’emploi":
    "L’interface d’administration existe déjà et n’est pas développée pour vous : vous la configurez plutôt que de la construire.",
  "Déclencheur":
    "L’événement qui lance l’automatisation : un formulaire rempli, un email reçu, ou simplement une heure de la journée.",
  "Contenu intégré":
    "Les textes et les images vivent dans le site : ils changent lors d’une mise à jour, pas depuis une interface de gestion.",
  "Reprise d’erreur":
    "Ce qui se passe quand un outil ne répond pas : l’action est réessayée, et vous êtes prévenu si elle échoue quand même.",
};

/** The definitions worth showing for one recommendation: those it actually uses. */
export const definitionsFor = (plain: string[]): Array<{ term: string; definition: string }> =>
  plain
    .filter((step, index) => plainGlossary[step] !== undefined && plain.indexOf(step) === index)
    .map((step) => ({ term: step, definition: plainGlossary[step] }));

/**
 * Whether the content question is worth asking.
 *
 * Only a site branches on it: for an automation or an assistant the answer was
 * the same whatever the visitor clicked, and three inert buttons read as a
 * questionnaire that ignores you. Pinned by a test, so the day another branch
 * starts reading the owner the question comes back on its own.
 */
export const asksWhoEdits = (kind: ProjectKind): boolean => kind === "site";

export const recommendArchitecture = (
  kind: ProjectKind,
  owner: ContentOwner,
  specificity: Specificity,
): ArchitectureRecommendation => {
  if (kind === "site") return siteRecommendation(owner, specificity);
  if (kind === "application") return applicationRecommendation(specificity);
  if (kind === "automation") return automationRecommendation(specificity);

  return aiRecommendation(specificity);
};
