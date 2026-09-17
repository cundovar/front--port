<template>
  <main class="page">
    <div class="section admin-header">
      <h1>Backoffice</h1>
      <nav class="admin-nav">
        <RouterLink to="/admin/projects">Projets</RouterLink>
        <RouterLink to="/admin/comments">Commentaires</RouterLink>
        <RouterLink to="/admin/content">Contenu</RouterLink>
        <RouterLink to="/admin/quote-estimates">Estimations</RouterLink>
        <RouterLink to="/admin/quote-pricing">Tarifs</RouterLink>
      </nav>
    </div>

    <section class="section">
      <div class="grid grid-2">
        <div class="card">
          <h2>Projets</h2>
          <p class="muted">Gerer vos projets et leurs liens.</p>
          <RouterLink class="btn btn-secondary" to="/admin/projects">Ouvrir</RouterLink>
        </div>
        <div class="card">
          <h2>Commentaires</h2>
          <p class="muted">Moderation des retours apprenants.</p>
          <RouterLink class="btn btn-secondary" to="/admin/comments">Ouvrir</RouterLink>
        </div>
        <div class="card">
          <h2>Contenu</h2>
          <p class="muted">Edition du JSON global (textes/sections).</p>
          <RouterLink class="btn btn-secondary" to="/admin/content">Ouvrir</RouterLink>
        </div>
        <div class="card">
          <h2>Estimations</h2>
          <p class="muted">Demandes issues du simulateur de devis.</p>
          <RouterLink class="btn btn-secondary" to="/admin/quote-estimates">Ouvrir</RouterLink>
        </div>
        <div class="card">
          <h2>Tarifs</h2>
          <p class="muted">Grille utilisee par le simulateur, sans redeploiement.</p>
          <RouterLink class="btn btn-secondary" to="/admin/quote-pricing">Ouvrir</RouterLink>
        </div>
      </div>
    </section>

    <section class="section tracking-section">
      <h2>Suivi &amp; référencement</h2>
      <p class="muted">Outils Google hébergés en dehors du site : ils s’ouvrent dans un nouvel onglet.</p>
      <div class="grid grid-2">
        <div class="card">
          <h3>Google Analytics</h3>
          <p class="muted">Audience et pages vues. Propriété GA4 <code>G-KH2LH77JF7</code>, celle déclarée dans index.html.</p>
          <a
            class="btn btn-secondary"
            href="https://analytics.google.com/analytics/web/"
            target="_blank"
            rel="noreferrer"
          >
            Ouvrir Analytics
          </a>
        </div>
        <div class="card">
          <h3>Search Console</h3>
          <p class="muted">Indexation, requêtes et sitemaps du site <code>varascundo.com</code>.</p>
          <div class="card-actions">
            <a class="btn btn-secondary" :href="searchConsoleUrl()" target="_blank" rel="noreferrer">
              Ouvrir Search Console
            </a>
            <a class="btn btn-secondary" :href="searchConsoleUrl('sitemaps')" target="_blank" rel="noreferrer">
              Sitemaps
            </a>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";

// index.html carries a google-site-verification meta tag, which is how a
// URL-prefix property is verified — hence the trailing slash in the resource id
// rather than the sc-domain: form a DNS-verified property would use.
const SEARCH_CONSOLE_PROPERTY = "https://varascundo.com/";

const searchConsoleUrl = (view?: "sitemaps"): string => {
  const base = view
    ? `https://search.google.com/search-console/${view}`
    : "https://search.google.com/search-console";

  return `${base}?resource_id=${encodeURIComponent(SEARCH_CONSOLE_PROPERTY)}`;
};
</script>

<style scoped>
.admin-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.admin-nav {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.admin-nav a {
  color: var(--text);
  border-bottom: 1px solid transparent;
}

.admin-nav a.router-link-active {
  border-bottom-color: var(--yellow);
}

.muted {
  color: var(--muted);
}

.tracking-section h2 {
  margin: 0 0 8px;
}

.tracking-section > .muted {
  margin: 0 0 24px;
}

.card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

code {
  font-family: var(--font-mono);
  font-size: 0.9em;
  /* An id split across two lines ("G-" / "KH2LH77JF7") reads as two things. */
  white-space: nowrap;
}
</style>
