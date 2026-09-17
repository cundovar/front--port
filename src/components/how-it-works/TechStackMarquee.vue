<template>
  <div v-if="items.length" class="stack-marquee" role="group" :aria-label="label">
    <div class="stack-track" :style="{ '--stack-duration': duration }">
      <!--
        The list is rendered twice and the track slides by exactly half its
        width, so the second copy sits where the first was when the animation
        restarts: the loop has no visible seam. The copy is hidden from screen
        readers, which read the first one only.
      -->
      <ul class="stack-list">
        <li v-for="item in items" :key="item" class="stack-item">{{ item }}</li>
      </ul>
      <ul class="stack-list" aria-hidden="true">
        <li v-for="item in items" :key="`echo-${item}`" class="stack-item">{{ item }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  items: string[];
  label?: string;
}

const props = withDefaults(defineProps<Props>(), {
  label: "Technologies utilisées",
});

/**
 * A fixed duration would crawl with four entries and race with twenty, so the
 * speed is set per item and the total follows the length of the list.
 */
const duration = computed(() => `${Math.max(props.items.length, 4) * 4}s`);
</script>

<style scoped>
.stack-marquee {
  --stack-duration: 20s;
  overflow: hidden;
  padding: 10px 0;
  border-top: 2px solid var(--line);
  border-bottom: 2px solid var(--line);
  background: var(--bg-elev);
  /* The band runs edge to edge even though the header is padded. */
  margin-inline: calc(var(--gutter) * -1);
}

.stack-track {
  display: flex;
  width: max-content;
  animation: stack-scroll var(--stack-duration) linear infinite;
}

.stack-list {
  display: flex;
  gap: 28px;
  margin: 0;
  padding: 0 14px;
  list-style: none;
}

.stack-item {
  white-space: nowrap;
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}

.stack-item::after {
  content: "·";
  margin-left: 28px;
  color: var(--accent);
}

/* Left to right: the track starts shifted by one copy and slides back to zero. */
@keyframes stack-scroll {
  from {
    transform: translateX(-50%);
  }
  to {
    transform: translateX(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .stack-track {
    animation: none;
    transform: none;
    width: 100%;
    overflow-x: auto;
  }

  /* Nothing moves, so the duplicate would just repeat the list on screen. */
  .stack-list[aria-hidden="true"] {
    display: none;
  }
}
</style>
