<template>
  <section class="section">
    <div class="trust-strip">
      <span v-for="item in items" :key="item" class="pill">{{ item }}</span>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Props {
  items: string[];
}

defineProps<Props>();
</script>

<style scoped>
.trust-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: flex-start;
}

.pill {
  padding: 8px 16px;
  background: rgba(250, 204, 21, 0.15);
  border: 1px solid var(--yellow);
  border-radius: 20px;
  color: var(--text);
  font-size: 14px;
  font-weight: 500;
}
</style>
