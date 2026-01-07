import type { StudentComment } from "../types";

export const commentsSeed: StudentComment[] = [
  {
    id: "comment-1",
    authorName: "Camille",
    authorRole: "Apprenante",
    content: "Cours clairs et progressifs, avec des exercices concrets.",
    status: "approved",
    createdAt: "2025-02-10",
  },
  {
    id: "comment-2",
    authorName: "Nassim",
    authorRole: "Apprenant",
    content: "Bonne pedagogie, reponses adaptees a notre niveau.",
    status: "pending",
    createdAt: "2025-02-12",
  },
];
