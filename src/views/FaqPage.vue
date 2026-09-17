<template>
  <main class="page">
    <div class="section faq-page-header">
      <RouterLink class="back-link" to="/">← Accueil</RouterLink>
      <h1>Questions fréquentes</h1>
      <p class="subtitle">Des réponses concrètes sur les missions proposées, service par service.</p>
    </div>

    <FaqSection :services="content.services" />

    <section class="section faq-contact">
      <h2 class="faq-contact-title">Votre question n’y est pas ?</h2>
      <p class="section-subtitle">Décrivez votre besoin : vous recevez une première estimation sans engagement.</p>
      <div class="faq-actions">
        <RouterLink class="btn btn-primary" to="/devis">Estimer mon projet</RouterLink>
        <a class="btn btn-secondary" :href="`mailto:${content.header.contactEmail}`">Écrire un email</a>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
import FaqSection from "../components/FaqSection.vue";
import { useContent } from "../composables/useContent";

// The questions are edited in the backoffice and served by /api/content, with
// content.json as the fallback, exactly as they were on the home page.
const { content } = useContent();
</script>

<style scoped>
.faq-page-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: clamp(24px, 4vw, 40px);
}

/* The header and the list are two full .section blocks, which stacked 272px of
   empty space between the intro line and the first question. The scope id lands
   on the child's root element, so this reaches the FAQ section itself. */
.faq-section {
  padding-top: clamp(24px, 4vw, 40px);
  padding-bottom: clamp(32px, 5vw, 56px);
}

.back-link {
  display: inline-flex;
  width: fit-content;
  color: var(--text);
  text-decoration: none;
  font-size: 14px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.back-link:hover {
  opacity: 1;
}

.faq-page-header h1 {
  margin: 0;
  font-size: clamp(28px, 6vw, 48px);
}

.subtitle {
  color: var(--muted);
  margin: 0;
}

.faq-contact {
  padding-top: clamp(32px, 5vw, 56px);
  border-bottom: 0;
}

/* Sized against the page h1, not the home page's section titles: at 112px it
   read as the main heading of the page. */
.faq-contact-title {
  margin: 0 0 12px;
  font-family: var(--font-display);
  font-size: clamp(26px, 5vw, 40px);
  line-height: 1;
  text-transform: uppercase;
  color: var(--text);
}

.faq-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
</style>
