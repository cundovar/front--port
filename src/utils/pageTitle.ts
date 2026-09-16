/**
 * Every screen used to share the <title> written in index.html, because nothing
 * ever touched document.title. Google then showed the same line for the home
 * page, the quote simulator and each project — and the local wording was lost.
 */
export const SITE_NAME = "Facundo Varas";
export const DEFAULT_TITLE = "Développeur web à Paris 20e | Sites, automatisation, IA";

/**
 * Keeps the site name at the end, the way a reader scans a tab, and stays close
 * to the ~60 characters Google renders before truncating.
 */
export const pageTitle = (pageName?: string | null): string => {
  const name = pageName?.trim();

  return name ? `${name} | ${SITE_NAME}` : DEFAULT_TITLE;
};
