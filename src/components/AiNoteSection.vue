<template>
  <section id="ai-note" class="section ai-note-section" aria-labelledby="ai-note-title">
    <div class="ai-note">
      <h2 id="ai-note-title" class="section-title ai-note-title">{{ title }}</h2>
      <p class="ai-note-body">{{ body }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  body: string;
}

defineProps<Props>();
</script>

<style scoped>
.ai-note-section {
  padding-top: clamp(24px, 4vw, 40px);
  padding-bottom: clamp(24px, 4vw, 40px);
}

/* Narrower than a full section: four lines read as a remark, not as an argument. */
.ai-note {
  max-width: 62ch;
  margin: 0 auto;
  text-align: center;
}

/* A remark, not a section of its own: smaller than the titles around it. */
.ai-note-title {
  font-size: clamp(22px, 3.4vw, 30px);
}

.ai-note-body {
  margin: 12px 0 0;
  font-size: clamp(16px, 2.2vw, 18px);
  line-height: 1.7;
  color: var(--muted);
}
</style>
