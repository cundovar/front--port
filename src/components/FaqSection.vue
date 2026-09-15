<template>
  <section v-if="groups.length" id="faq" class="section faq-section" aria-labelledby="faq-title">
    <div class="faq-header">
      <h2 id="faq-title" class="section-title">Questions fréquentes</h2>
      <p class="section-subtitle">Des réponses concrètes sur les missions proposées.</p>
    </div>

    <div class="faq-groups">
      <article v-for="group in groups" :key="group.title" class="faq-group">
        <h3 class="faq-group-title">{{ group.title }}</h3>
        <div class="faq-list">
          <details v-for="item in group.items" :key="item.question" class="faq-item">
            <summary>{{ item.question }}</summary>
            <p>{{ item.answer }}</p>
          </details>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ServiceOffer, ServiceFaqItem } from "../types";

interface Props {
  services: ServiceOffer[];
}

const props = defineProps<Props>();

const completeFaq = (item: ServiceFaqItem): boolean =>
  item.question.trim().length > 0 && item.answer.trim().length > 0;

const groups = computed(() =>
  props.services
    .map((service) => ({
      title: service.title,
      items: service.faqs.filter(completeFaq),
    }))
    .filter((group) => group.items.length > 0),
);
</script>

<style scoped>
.faq-header {
  margin-bottom: clamp(40px, 8vw, 80px);
}

.faq-groups {
  display: grid;
  gap: clamp(28px, 5vw, 56px);
}

.faq-group {
  border-top: 3px solid var(--line);
  padding-top: 20px;
}

.faq-group-title {
  margin: 0 0 18px;
  font-family: var(--font-display);
  font-size: clamp(22px, 3vw, 30px);
  line-height: 1;
  text-transform: uppercase;
  color: var(--text);
}

.faq-list {
  display: grid;
  gap: 10px;
}

.faq-item {
  border: 2px solid var(--line);
  background: var(--bg-elev);
}

.faq-item summary {
  padding: 16px 18px;
  cursor: pointer;
  color: var(--text);
  font-weight: 700;
  list-style-position: inside;
}

.faq-item summary:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: -3px;
}

.faq-item p {
  margin: 0;
  padding: 0 18px 18px 40px;
  color: var(--muted);
  line-height: 1.6;
}

@media (max-width: 720px) {
  .faq-item summary {
    padding: 14px;
  }

  .faq-item p {
    padding: 0 14px 14px 34px;
  }
}
</style>
