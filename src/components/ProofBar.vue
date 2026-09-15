<template>
  <section class="proof-bar">
    <div class="proof-content">
      <div v-for="item in items" :key="item" class="proof-item">
        <div class="proof-label">{{ item }}</div>
      </div>
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
.proof-bar {
  background: var(--bg-elev);
  border: 3px solid var(--line);
  border-top: none;
  border-bottom: 3px solid var(--line);
  padding: clamp(16px, 3vw, 32px) var(--gutter);
  box-shadow: 8px 8px 0 var(--accent);
}

.proof-content {
  max-width: var(--max-width);
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: space-between;
  align-items: center;
}

.proof-item {
  flex: 1;
  min-width: 140px;
  text-align: center;
}

.proof-label {
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--accent);
  line-height: 1.4;
  word-break: break-word;
}

@media (max-width: 720px) {
  .proof-bar {
    padding: 16px var(--gutter);
    box-shadow: 6px 6px 0 var(--accent);
  }

  .proof-content {
    gap: 12px;
  }

  .proof-label {
    font-size: 11px;
  }
}
</style>
