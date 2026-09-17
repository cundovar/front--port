<template>
  <div class="row" :class="{ open, lit }">
    <button
      class="head"
      data-head
      type="button"
      :aria-expanded="open"
      @click="emit('select', layer.key)"
    >
      <span class="name">{{ layer.name }}</span>
      <span class="role">{{ busyLabel ?? layer.role }}</span>
      <span class="sign" aria-hidden="true">{{ open ? "−" : "+" }}</span>
    </button>

    <div v-if="open" class="body">
      <p class="explanation">{{ layer.explanation }}</p>

      <ul v-if="layer.details" class="details">
        <li v-for="detail in layer.details" :key="detail.name">
          <strong>{{ detail.name }}</strong>
          <span>{{ detail.explanation }}</span>
        </li>
      </ul>

      <p v-if="technical" class="technical-note">Côté technique : {{ layer.technical }}</p>
    </div>

    <span v-if="!last" class="arrow" aria-hidden="true">↓</span>
  </div>
</template>

<script setup lang="ts">
import type { HoodLayer } from "../../data/howItWorks";

defineProps<{
  layer: HoodLayer;
  open: boolean;
  lit: boolean;
  technical: boolean;
  /** What this layer is doing right now ("vérification…"), shown instead of its role. */
  busyLabel?: string;
  last?: boolean;
}>();

const emit = defineEmits<{ select: [key: string] }>();
</script>

<style scoped>
.row {
  display: flex;
  flex-direction: column;
}

.head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 14px;
  padding: 15px 16px;
  border: 3px solid var(--line);
  background: var(--bg-elev);
  color: var(--text);
  text-align: left;
  cursor: pointer;
  transition: background 160ms var(--ease), box-shadow 160ms var(--ease);
}

.head:hover,
.row.open .head {
  background: color-mix(in oklch, var(--bg-elev) 88%, var(--yellow));
}

/* The layer the travelling request is passing through. */
.row.lit .head {
  background: color-mix(in oklch, var(--bg-elev) 72%, var(--accent));
  box-shadow: 6px 6px 0 var(--line);
}

.row .head {
  transition: background 160ms var(--ease), box-shadow 160ms var(--ease);
}

.name {
  font-family: var(--font-display);
  font-size: clamp(20px, 3vw, 27px);
  line-height: 0.95;
  text-transform: uppercase;
}

.role {
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

.sign {
  font-family: var(--font-mono);
  font-size: 16px;
  font-weight: 900;
}

.body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border: 3px solid var(--line);
  border-top: 0;
  background: var(--bg-elev);
  box-shadow: var(--shadow);
}

.explanation {
  margin: 0;
  max-width: 62ch;
  font-size: clamp(16px, 2.4vw, 19px);
}

.details {
  list-style: none;
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
}

.details li {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 10px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--soft);
}

.details strong {
  min-width: 108px;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
}

.details span {
  color: var(--muted);
}

.technical-note {
  margin: 0;
  padding-top: 10px;
  border-top: 2px solid var(--line);
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 12px;
}

.arrow {
  padding: 4px 0;
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 15px;
  font-weight: 900;
  text-align: center;
}

@media (max-width: 640px) {
  .row {
    position: relative;
  }

  .node {
    display: block;
    position: absolute;
    top: 22px;
    left: -27px;
    z-index: 1;
    width: 9px;
    height: 9px;
    border: 3px solid var(--line);
    background: var(--bg-elev);
  }

  .row.lit .node {
    background: var(--accent);
    box-shadow: 2px 2px 0 var(--line);
  }

  .head {
    grid-template-columns: minmax(0, 1fr) auto;
    row-gap: 6px;
    min-height: 64px;
    padding: 12px;
    gap: 5px 10px;
  }

  .role {
    grid-column: 1 / -1;
    font-size: 10px;
  }

  .body {
    padding: 14px 12px;
  }

  .details {
    gap: 7px;
  }

  .details li {
    display: grid;
    gap: 3px;
    padding-bottom: 7px;
  }

  .details strong {
    min-width: 0;
  }

  .arrow {
    padding: 2px 0;
    font-size: 14px;
  }
}
</style>
