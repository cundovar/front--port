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
  </main>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
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
</style>
