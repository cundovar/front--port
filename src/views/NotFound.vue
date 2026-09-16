<template>
  <main class="notfound-page">
    <p class="notfound-code">404</p>
    <h1 class="notfound-title">Cette page n’existe pas</h1>
    <p class="notfound-text">
      Le lien est peut-être incomplet, ou la page a été déplacée. Voici par où continuer.
    </p>

    <nav class="notfound-links">
      <a class="btn btn-primary" href="/">Retour à l’accueil</a>
      <a class="btn btn-secondary" href="/realisations">Voir les réalisations</a>
      <a class="btn btn-secondary" href="/devis">Estimer un projet</a>
    </nav>
  </main>
</template>

<script setup lang="ts"></script>

<style scoped>
.notfound-page {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: clamp(64px, 12vw, 140px) var(--gutter);
  min-height: 70vh;
}

.notfound-code {
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: var(--accent);
  margin: 0 0 12px;
}

.notfound-title {
  font-family: var(--font-display);
  font-size: clamp(40px, 9vw, 96px);
  line-height: 0.82;
  text-transform: uppercase;
  margin: 0 0 20px;
  text-wrap: balance;
}

.notfound-text {
  color: var(--muted);
  max-width: 48ch;
  margin: 0 0 clamp(28px, 5vw, 44px);
}

.notfound-links {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}
</style>
