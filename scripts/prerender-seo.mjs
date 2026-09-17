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

// Everything is rendered before anything is written: a half-updated dist would
// leave pages carrying the metadata of the page next to them.
const rendered = seo.pages.map((page) => [page, render(page)]);

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
