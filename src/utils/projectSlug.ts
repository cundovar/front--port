/**
 * Creates the public path segment shown for a project before it is saved.
 * Symfony repeats this normalization server-side: the server remains the
 * source of truth when a client sends an empty or stale slug.
 */
export const slugifyProjectName = (value: string): string => {
  const normalized = value
    .trim()
    .toLocaleLowerCase("fr-FR")
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return normalized.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
};
