export type ProjectKind = "site" | "application" | "automation" | "ai";
export type ContentOwner = "me" | "team" | "nobody";
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
  /** "bridge" marks every row the request travels through, from interface to data. */
  position: "top" | "bridge";
  /** Sub-parts revealed only when the layer is opened, so the jargon arrives on demand. */
  details?: HoodDetail[];
}

export const hoodLayers: HoodLayer[] = [
  {
    key: "visitor",
    name: "Ce que vous voyez",
    role: "Écran, textes, images",
    explanation:
      "La page telle qu’elle s’affiche. Tout ce qui suit sert à la produire, puis à la tenir à jour.",
    technical: "Responsive design, accessibilité, performance perçue.",
    position: "top",
  },
  {
    key: "interface",
    name: "L’interface",
    role: "HTML · CSS · JS · React / Vue",
    explanation:
      "Ce qui construit l’écran et réagit à vos clics. Plusieurs briques y travaillent ensemble.",
    technical: "Sémantique HTML, styles CSS, composants réutilisables, état d’interface.",
    position: "bridge",
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
    position: "bridge",
  },
  {
    key: "engine",
    name: "Le moteur",
    role: "Symfony / CMS",
    explanation: "C’est ici que les règles métier, les droits et les traitements sont appliqués.",
    technical: "Symfony, contrôleurs, services, droits d’accès, CMS.",
    position: "bridge",
  },
  {
    key: "data",
    name: "Données",
    role: "Mémoire",
    explanation: "L’endroit où les informations sont conservées, protégées et retrouvées.",
    technical: "PostgreSQL, MySQL, requêtes, sauvegardes.",
    position: "bridge",
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

const siteRecommendation = (owner: ContentOwner, specificity: Specificity): ArchitectureRecommendation => {
  // Business rules first: past a certain point no CMS is worth bending.
  if (specificity === "high") {
    return {
      plain: ["Interface sur mesure", "Logique métier", "Base de données"],
      stack: ["React", "Symfony", "PostgreSQL"],
      qualities: [
        "Logique métier sur mesure",
        "Fonctionnalités ajoutées selon vos besoins",
        "Backoffice adapté au travail réel",
      ],
      reason:
        "Quand les règles de travail deviennent le cœur du projet, un développement personnalisé évite de contourner les limites d’un CMS.",
    };
  }

  // Nobody to edit: a back-office would only add upkeep for no benefit.
  if (owner === "nobody") {
    return {
      plain: ["Site rapide", "Contenu intégré", "Hébergement simple"],
      stack: ["Vue", "Contenu structuré", "Hébergement statique"],
      qualities: ["Pages très rapides", "Rien à administrer", "Hébergement peu coûteux"],
      reason:
        "Si le contenu bouge rarement, un back-office ajoute de l’entretien sans bénéfice : le contenu vit dans le site et change lors des mises à jour.",
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

  return {
    plain: ["Interface claire", "API métier", "Intégrations", "Base de données"],
    stack: ["Vue", "Symfony", "API REST", "PostgreSQL"],
    qualities: ["Rôles et validations", "Intégrations possibles", "Base documentée"],
    reason:
      "Dès que plusieurs rôles, règles ou intégrations entrent en jeu, l’API structure les échanges et protège les données.",
  };
};

const automationRecommendation = (specificity: Specificity): ArchitectureRecommendation => {
  if (specificity === "low" || specificity === "medium") {
    return {
      plain: ["Déclencheur", "Automatisation", "Vos outils"],
      stack: ["Formulaire ou webhook", "n8n", "CRM · Email · Document"],
      qualities: ["Mise en place rapide", "Actions traçables", "Validation humaine possible"],
      reason:
        "Un workflow peut suffire quand le besoin est d’enchaîner des actions entre des outils existants.",
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
