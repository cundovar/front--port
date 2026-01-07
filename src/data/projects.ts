import type { ProjectCard } from "../types";

export const projectsSeed: ProjectCard[] = [
  {
    id: "portfolio-ia",
    name: "Portfolio IA Symfony + Vue",
    stack: "Symfony, Vue, MySQL, Docker",
    summary: "Incubateur de projets et preuves techniques.",
    progress: 60,
    bulletin: "Semaine 6: refonte API, tests en cours.",
    siteUrl: "https://demo.example.com/portfolio-ia",
    repoUrl: "https://github.com/cundovar/vue-symfony",
    imageUrl: "",
  },
  {
    id: "pedagogy-kit",
    name: "Projet pedagogy kit",
    stack: "Vue, PHP",
    summary: "Ressources et exercices adaptes aux niveaux.",
    progress: 40,
    bulletin: "Semaine 2: structure des modules et premiers exercices.",
    siteUrl: "https://demo.example.com/pedagogy-kit",
    repoUrl: "https://github.com/cundovar/pedagogy-kit",
    imageUrl: "",
  },
];
