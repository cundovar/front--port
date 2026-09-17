/**
 * The app is a SPA: vue-router sets document.title after the JavaScript runs,
 * so a crawler that does not execute it reads the home page <title> on every
 * route. This writes one real HTML file per public route — same app, same
 * bundle, only the <head> differs — which Apache serves instead of the generic
 * index.html. Nothing is rendered ahead of time; only the metadata is fixed.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const seo = JSON.parse(readFileSync(resolve(root, "src/data/pageSeo.json"), "utf8"));
const template = readFileSync(resolve(root, "dist/index.html"), "utf8");

const failures = [];

/**
 * Replaces one attribute value and records a failure when the tag is missing or
 * appears twice: a silent no-op here would ship a page with the wrong metadata,
 * which is exactly the bug this script exists to prevent.
 */
const replaceOnce = (html, pattern, value, what, page) => {
  const matches = html.match(pattern);

  if (!matches || matches.length !== 1) {
    failures.push(`${page} : ${what} introuvable ou en double dans dist/index.html`);
    return html;
  }

  return html.replace(pattern, (match, before, previous, after) => `${before}${value}${after}`);
};

const escapeAttribute = (value) => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

const escapeText = (value) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Same host api.ts falls back to in production. Overridable so a build against
// another backend does not silently bake live data into the pages.
const API_BASE = process.env.PRERENDER_API_BASE ?? "https://backport.varascundo.com";

/**
 * Every word of this site reaches the browser through JavaScript, so a crawler
 * that does not execute it reads an empty <body>. These fetches let the built
 * files carry the real text, taken from the same API the app reads — generated,
 * never a second copy to keep in sync.
 *
 * Deliberately best-effort: a network hiccup must not block a deploy, because
 * every page still works for every visitor. The warning is loud enough to be
 * noticed in the build output.
 */
const fetchJson = async (path, what) => {
  try {
    const response = await fetch(`${API_BASE}${path}`, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    return await response.json();
  } catch (error) {
    console.warn(`\n⚠  ${what} non récupéré (${error.message}) : le HTML partira sans.`);
    console.warn(`   Les visiteurs le verront quand même, l’application le charge depuis ${API_BASE}.\n`);
    return null;
  }
};

/** Text out of a field that may carry HTML written in the back-office. */
const plain = (value) => String(value ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const paragraph = (value) => (plain(value) ? `<p>${escapeText(plain(value))}</p>` : "");

const heading = (level, value) =>
  plain(value) ? `<h${level}>${escapeText(plain(value))}</h${level}>` : "";

// Guarded: several project fields are free text in the back-office and reach
// the API as a string, or as an empty list.
const bullets = (values) =>
  Array.isArray(values) && values.length > 0
    ? `<ul>${values.map((value) => `<li>${escapeText(plain(value))}</li>`).join("")}</ul>`
    : "";

/** A section is dropped entirely when its source is empty, never left as a bare title. */
const section = (title, body) => (body ? `<section>${heading(2, title)}${body}</section>` : "");

const formatAmount = (amount) => `${new Intl.NumberFormat("fr-FR").format(amount)} €`;

const variantPrice = (variant) =>
  variant.pricingMode === "range" && variant.minimumAmount !== variant.maximumAmount
    ? `${formatAmount(variant.minimumAmount)} – ${formatAmount(variant.maximumAmount)}`
    : variant.pricingMode === "from"
      ? `à partir de ${formatAmount(variant.minimumAmount)}`
      : formatAmount(variant.minimumAmount);

/**
 * The amounts, machine-readable rather than inferred from the page text.
 * Regenerated from the same grid on every build, so it cannot drift.
 */
const pricingStructuredData = (offers) => {
  const structured = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: offers.map((offer, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        name: offer.label,
        description: offer.summary ?? undefined,
        offers: offer.variants.map((variant) => ({
          "@type": "Offer",
          name: variant.label,
          priceCurrency: "EUR",
          priceSpecification: {
            "@type": "PriceSpecification",
            minPrice: variant.minimumAmount,
            maxPrice: variant.maximumAmount,
            priceCurrency: "EUR",
          },
        })),
      },
    })),
  };

  return `<script type="application/ld+json">${JSON.stringify(structured).replace(/</g, "\\u003c")}</script>`;
};

const homeBody = (content) =>
  [
    heading(1, content.hero?.title),
    paragraph(content.hero?.tagline),
    paragraph(content.hero?.subtitle),
    section(
      "Vous vous reconnaissez ?",
      (content.problems ?? []).map((item) => heading(3, item.title) + paragraph(item.description)).join(""),
    ),
    section(
      "Services",
      (content.services ?? [])
        .map((item) => heading(3, item.title) + paragraph(item.promise) + bullets(item.deliverables))
        .join(""),
    ),
    section(
      "Comment se déroule une mission",
      (content.process ?? []).map((item) => heading(3, item.title) + paragraph(item.description)).join(""),
    ),
    section(
      "Ce que je fais",
      (content.expertise ?? []).map((item) => heading(3, item.title) + paragraph(item.description)).join(""),
    ),
    section("À propos", paragraph(content.about?.bio)),
  ].join("");

const faqBody = (content) =>
  (content.services ?? [])
    .map((service) =>
      section(
        service.title,
        (service.faqs ?? []).map((faq) => heading(3, faq.question) + paragraph(faq.answer)).join(""),
      ),
    )
    .join("");

const projectsBody = (projects) =>
  projects.map((project) => heading(2, project.name) + paragraph(project.summary)).join("");

const projectBody = (project) =>
  [
    heading(1, project.name),
    paragraph(project.summary),
    section("Le problème", paragraph(project.clientProblem)),
    section("La mission", paragraph(project.mission)),
    section("La solution", paragraph(project.solution)),
    section("Résultat", bullets(project.outcomes)),
    section("Technologies", bullets(project.stack) || paragraph(project.stack)),
  ].join("");

const offersBody = (offers) =>
  offers
    .map((offer) =>
      section(
        offer.label,
        paragraph(offer.summary) +
          `<ul>${offer.variants
            .map((variant) => `<li>${escapeText(variant.label)} — ${escapeText(variantPrice(variant))}</li>`)
            .join("")}</ul>`,
      ),
    )
    .join("");

/**
 * What each route puts in its <noscript>.
 *
 * <noscript> rather than the page itself: Vue empties #app when it mounts, so
 * markup placed there would be thrown away, and a copy outside it would flash
 * before being hidden. A crawler that runs no JavaScript reads this; one that
 * does reads the real application.
 */
const outlineBody = (page) =>
  (page.outline ?? []).map((item) => heading(2, item.heading) + paragraph(item.text)).join("");

const bodyForRoute = (path, { content, projects, offers }) => {
  if (path === "/" && content) return homeBody(content);
  if (path === "/faq" && content) return faqBody(content);
  if (path === "/realisations" && projects.length > 0) return projectsBody(projects);
  if ((path === "/tarifs" || path === "/devis") && offers) return offersBody(offers);

  return "";
};

// `[^>]*` crosses newlines, which the multi-line <meta> blocks in index.html need.
const attribute = (selector) => new RegExp(`(<[a-z]+\\s+${selector}[^>]*?(?:content|href)=")([^"]*)(")`, "g");

const render = (page) => {
  const title = `${page.title} | ${seo.siteName}`;
  const url = `${seo.origin}${page.path}`;
  let html = template;

  html = replaceOnce(html, /(<title>)([^<]*)(<\/title>)/g, escapeAttribute(title), "<title>", page.path);

  const fields = [
    ['name="description"', page.description],
    ['rel="canonical"', url],
    ['property="og:url"', url],
    ['property="og:title"', title],
    ['property="og:description"', page.description],
    ['name="twitter:url"', url],
    ['name="twitter:title"', title],
    ['name="twitter:description"', page.description],
  ];

  fields.forEach(([selector, value]) => {
    html = replaceOnce(html, attribute(selector), escapeAttribute(value), selector, page.path);
  });

  return html;
};

const [pricingPayload, contentPayload, projectsPayload] = await Promise.all([
  fetchJson("/api/quote-pricing", "Tarifs"),
  fetchJson("/api/content", "Contenu"),
  fetchJson("/api/projects", "Projets"),
]);

const offers = (pricingPayload?.catalog?.offers ?? []).filter((offer) => offer.variants?.length);
const content = contentPayload?.content ?? contentPayload;
const projects = (Array.isArray(projectsPayload) ? projectsPayload : (projectsPayload?.projects ?? []))
  .filter((project) => project.status === "published" && project.slug);

const data = { content, projects, offers: offers.length > 0 ? offers : null };

/** Google keeps about 160 characters; a description cut mid-word reads as broken. */
const shorten = (value, limit) => {
  const text = plain(value);
  if (text.length <= limit) return text;

  return `${text.slice(0, text.lastIndexOf(" ", limit - 1))}…`;
};

/**
 * One flat file per project, named projet-<slug>.html.
 *
 * Not dist/realisations/<slug>.html: creating that folder makes mod_dir
 * redirect /realisations to /realisations/, which shadows the list page that
 * already lives at realisations.html. public/.htaccess maps the URL to the
 * flat name; the rule was checked against a local Apache before shipping.
 */
const projectPages = projects.map((project) => ({
  path: `/realisations/${project.slug}`,
  file: `projet-${project.slug}`,
  title: plain(project.name),
  description: shorten(project.summary || project.clientProblem || project.mission, 155),
  body: projectBody(project),
}));

const pages = [
  ...seo.pages.map((page) => ({ ...page, file: page.path.slice(1) })),
  ...projectPages,
];

// The sitemap is hand-written while project pages come from the database, so
// publishing a project in the back-office can leave its page unlisted. Its
// canonical would then point at a URL nothing declares.
const sitemap = readFileSync(resolve(root, "public/sitemap.xml"), "utf8");
const unlisted = projectPages.filter((page) => !sitemap.includes(`${seo.origin}${page.path}<`));

if (unlisted.length > 0) {
  console.warn(`\n⚠  ${unlisted.length} projet(s) publié(s) absent(s) de public/sitemap.xml :`);
  unlisted.forEach((page) => console.warn(`   ${seo.origin}${page.path}`));
  console.warn("   Leur page est générée, mais rien ne la déclare aux moteurs.\n");
}

/**
 * The text goes in <noscript>, not in the page.
 *
 * Vue empties #app when it mounts, so markup put there would be discarded, and
 * a copy outside it would flash before being hidden — which is cloaking anyway.
 * A crawler that runs no JavaScript reads this; one that does reads the app.
 */
const withBody = (html, body, path) => {
  if (!body) return html;

  if (!html.includes("</body>")) {
    failures.push(`${path} : </body> introuvable dans dist/index.html`);
    return html;
  }

  return html.replace("</body>", `<noscript>${body}</noscript></body>`);
};

// Everything is rendered before anything is written: a half-updated dist would
// leave pages carrying the metadata of the page next to them.
const rendered = pages.map((page) => {
  // A page whose text lives in its components carries an outline instead.
  const body = page.body ?? bodyForRoute(page.path, data) ?? "";
  let html = withBody(render(page), body || outlineBody(page), page.path);

  if (page.path === "/tarifs" && data.offers) {
    html = html.replace("</body>", `${pricingStructuredData(data.offers)}</body>`);
  }

  return [page, html];
});

// The home page is index.html itself: it already carries its own <head>, and
// only its text was missing.
const homeHtml = withBody(template, bodyForRoute("/", data), "/");

if (failures.length > 0) {
  console.error("Le <head> de dist/index.html ne correspond plus au script :");
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

rendered.forEach(([page, html]) => {
  // A flat file next to index.html: the .htaccess serves it when it exists, so
  // the URL keeps no trailing slash and no redirect is added.
  writeFileSync(resolve(root, `dist/${page.file}.html`), html, "utf8");
  console.log(`prerender  ${page.path}  →  dist/${page.file}.html`);
});

writeFileSync(resolve(root, "dist/index.html"), homeHtml, "utf8");
console.log(`prerender  /  →  dist/index.html`);

const withText = [["/", homeHtml], ...rendered.map(([page, html]) => [page.path, html])].filter(
  ([, html]) => html.includes("<noscript><"),
);

const silent = [["/", homeHtml], ...rendered.map(([page, html]) => [page.path, html])].filter(
  ([, html]) => !html.includes("<noscript><"),
);

console.log(`\n${pages.length + 1} routes préparées pour les moteurs de recherche.`);

if (silent.length > 0) {
  console.warn(`⚠  ${silent.length} sans texte dans le HTML : ${silent.map(([path]) => path).join(", ")}`);
  console.warn("   Ajoutez-leur une source de contenu, ou un outline dans pageSeo.json.");
}
console.log(`${withText.length} d’entre elles portent leur texte dans le HTML :`);
withText.forEach(([path, html]) => {
  const words = html.slice(html.indexOf("<noscript><")).replace(/<[^>]*>/g, " ").split(/\s+/).length;
  console.log(`  ${path.padEnd(42)} ~${words} mots`);
});

if (data.offers) {
  const count = data.offers.reduce((total, offer) => total + offer.variants.length, 0);
  console.log(`\n${count} formules chiffrées écrites dans dist/tarifs.html.`);
}
