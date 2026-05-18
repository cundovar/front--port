<template>
  <footer class="section footer">
    <div class="footer-left">
      <strong>{{ logoText }}</strong>
      <span class="muted">{{ tagline }}</span>
    </div>
    <div class="footer-links">
      <a
        v-for="link in links"
        :key="link.label"
        :href="link.url"
        target="_blank"
        rel="noreferrer"
      >
        {{ link.label }}
      </a>
      <a :href="`mailto:${contactEmail}`">Email</a>
    </div>
  </footer>
</template>

<script setup lang="ts">
import type { FooterLink } from "../types";

interface Props {
  logoText: string;
  contactEmail: string;
  tagline: string;
  links: FooterLink[];
}

defineProps<Props>();
</script>

<style scoped>
.footer {
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-top: 0;
  border-bottom: 0;
  padding-top: 32px;
  padding-bottom: 0;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.footer-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.footer-links {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.footer-links a {
  color: var(--text);
  text-decoration: none;
  border-bottom: 2px solid transparent;
}

.footer-links a:hover {
  color: var(--text);
  border-bottom-color: var(--line);
}

.muted {
  color: var(--muted);
}

@media (min-width: 720px) {
  .footer {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
