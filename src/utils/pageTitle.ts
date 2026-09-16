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

/** Matches the robots meta written in index.html, restored when leaving a noindex route. */
const ROBOTS_INDEXABLE = "index, follow";

/**
 * Rewrites the single <meta name="robots"> in place. Appending a second tag left
 * "index, follow" and "noindex" side by side, and index.html also carried a
 * googlebot meta — which overrides the generic one for Googlebot, so the noindex
 * would have been ignored exactly where it mattered. That tag is gone; this one
 * is now the only robots directive on the page.
 */
export const setRobotsNoindex = (noindex: boolean): void => {
  let meta = document.querySelector<HTMLMetaElement>('meta[name="robots"]');

  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "robots";
    document.head.appendChild(meta);
  }

  meta.content = noindex ? "noindex, follow" : ROBOTS_INDEXABLE;
};
