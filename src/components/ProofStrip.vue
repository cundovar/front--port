<template>
  <aside class="proof-strip" aria-label="Preuves GitHub">
    <div v-for="item in visibleItems" :key="item.label" class="proof">
      <strong>{{ item.displayValue }}</strong>
      <span>{{ item.displayLabel }}</span>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { SkillEvidence } from "../types";

const props = defineProps<{ items: SkillEvidence[] }>();

const visibleItems = computed(() =>
  props.items.slice(0, 4).map((item) => {
    if (/derniere|dernière|activite|activité/i.test(item.label)) {
      return {
        displayValue: item.value.slice(0, 4),
        displayLabel: item.label,
      };
    }

    if (/langages?/i.test(item.label) && item.value.includes(",")) {
      const [main, ...rest] = item.value.split(",").map((part) => part.trim()).filter(Boolean);

      return {
        displayValue: main,
        displayLabel: rest.length ? rest.join(" . ") : item.label,
      };
    }

    return {
      displayValue: item.value,
      displayLabel: item.label,
    };
  }),
);
</script>

<style scoped>
.proof-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  margin-top: clamp(10px, 2vw, 24px);
  border-top: 3px solid var(--line);
  border-bottom: 3px solid var(--line);
  background: var(--bg-elev);
  transform: rotate(0.25deg);
}

.proof {
  padding: 22px;
  border-right: 2px solid var(--line);
}

.proof:last-child {
  border-right: 0;
}

.proof:nth-child(2) {
  background: var(--secondary);
}

.proof:nth-child(3) {
  background: var(--accent);
  color: #fffef8;
}

.proof strong {
  display: block;
  font-family: var(--font-display);
  font-size: clamp(46px, 7vw, 72px);
  line-height: 0.82;
  font-weight: 900;
  text-transform: uppercase;
}

.proof span {
  display: block;
  margin-top: 8px;
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.proof:nth-child(3) span {
  color: #fffef8;
}

@media (max-width: 1080px) {
  .proof-strip {
    grid-template-columns: repeat(2, 1fr);
  }

  .proof:nth-child(2) {
    border-right: 0;
  }

  .proof:nth-child(-n + 2) {
    border-bottom: 2px solid var(--line);
  }
}

@media (max-width: 720px) {
  .proof-strip {
    grid-template-columns: 1fr;
    transform: none;
  }

  .proof {
    border-right: 0;
    border-bottom: 2px solid var(--line);
  }

  .proof:last-child {
    border-bottom: 0;
  }
}
</style>
