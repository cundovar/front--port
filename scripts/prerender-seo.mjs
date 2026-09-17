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
// another backend does not silently bake the live prices into the page.
const PRICING_URL = `${process.env.PRERENDER_API_BASE ?? "https://backport.varascundo.com"}/api/quote-pricing`;

/**
 * The prices live in the database and reach /tarifs through a runtime fetch, so
 * a crawler that does not execute JavaScript sees an empty page. Fetching the
 * grid at build time lets the file carry the real amounts.
 *
 * Deliberately best-effort: a network hiccup must not block a deploy, because
 * the page still works for every visitor — the browser fetches the live grid
 * anyway. The warning is loud enough to be noticed in the build output.
 */
const fetchPricing = async () => {
  try {
    const response = await fetch(PRICING_URL, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const { catalog } = await response.json();
    const offers = (catalog?.offers ?? []).filter((offer) => offer.variants?.length);

    return offers.length > 0 ? offers : null;
  } catch (error) {
    console.warn(`\n⚠  Tarifs non récupérés (${error.message}) : /tarifs partira sans prix dans le HTML.`);
    console.warn(`   Les visiteurs les verront quand même, la page les charge depuis ${PRICING_URL}.\n`);
    return null;
  }
};

const formatAmount = (amount) => `${new Intl.NumberFormat("fr-FR").format(amount)} €`;

const variantPrice = (variant) =>
  variant.pricingMode === "range" && variant.minimumAmount !== variant.maximumAmount
    ? `${formatAmount(variant.minimumAmount)} – ${formatAmount(variant.maximumAmount)}`
    : variant.pricingMode === "from"
      ? `à partir de ${formatAmount(variant.minimumAmount)}`
      : formatAmount(variant.minimumAmount);

/**
 * Two things a crawler can read, appended before </body>:
 *
 *  - a <noscript> list, so a bot that runs no JavaScript still reads the offers
 *    and their amounts as plain text;
 *  - JSON-LD, so the amounts are machine-readable rather than inferred.
 *
 * Neither duplicates the Vue template: they carry the data, not the design, and
 * they are regenerated from the same grid on every build.
 */
const pricingMarkup = (offers) => {
  const blocks = offers
    .map((offer) => {
      const rows = offer.variants
        .map((variant) => `<li>${escapeText(variant.label)} — ${escapeText(variantPrice(variant))}</li>`)
        .join("");

      return `<section><h2>${escapeText(offer.label)}</h2><ul>${rows}</ul></section>`;
    })
    .join("");

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

  return [
    `<noscript>${blocks}</noscript>`,
    `<script type="application/ld+json">${JSON.stringify(structured).replace(/</g, "\\u003c")}</script>`,
  ].join("");
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

const pricingOffers = seo.pages.some((page) => page.path === "/tarifs") ? await fetchPricing() : null;

// Everything is rendered before anything is written: a half-updated dist would
// leave pages carrying the metadata of the page next to them.
const rendered = seo.pages.map((page) => {
  let html = render(page);

  if (page.path === "/tarifs" && pricingOffers) {
    const markup = pricingMarkup(pricingOffers);
    if (!html.includes("</body>")) {
      failures.push(`${page.path} : </body> introuvable dans dist/index.html`);
    }
    html = html.replace("</body>", `${markup}</body>`);
  }

  return [page, html];
});

if (failures.length > 0) {
  console.error("Le <head> de dist/index.html ne correspond plus au script :");
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

rendered.forEach(([page, html]) => {
  // A flat file next to index.html: the .htaccess serves `<route>.html` when it
  // exists, so the URL keeps no trailing slash and no redirect is added.
  writeFileSync(resolve(root, `dist${page.path}.html`), html, "utf8");
  console.log(`prerender  ${page.path}  →  dist${page.path}.html`);
});

console.log(`\n${seo.pages.length} routes préparées pour les moteurs de recherche.`);

if (pricingOffers) {
  const count = pricingOffers.reduce((total, offer) => total + offer.variants.length, 0);
  console.log(`${count} formules chiffrées écrites dans dist/tarifs.html.`);
}
