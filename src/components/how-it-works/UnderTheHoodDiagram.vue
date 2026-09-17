<template>
  <div class="hood">
    <p class="direction" :class="{ active: step >= 1 && step <= 4 }" aria-hidden="true">
      Votre facture descend ↓
    </p>

    <div class="stack">
      <!-- Every row is a stop on the trip. The sheet is placed against each one
           in turn, measured, so it lands right whatever the rows' heights. -->
      <div ref="bridgeEl" class="bridge">
        <LayerRow
          v-for="layer in hoodLayers"
          :key="layer.key"
          :layer="layer"
          :open="openLayer === layer.key"
          :lit="litLayer === layer.key"
          :busy-label="busyLabels[layer.key]"
          :technical="technical.enabled.value"
          :last="layer.key === lastKey"
          @select="select"
        />

        <!-- Drawn rather than written: the narration under the button already
             names what is travelling, so the object only has to be followed. -->
        <span
          ref="travelEl"
          class="travel"
          :class="{ idle: step === 0, back: step === 5 }"
          :style="{ top: `${labelTop}px` }"
          aria-hidden="true"
        >
          <svg class="sheet" viewBox="0 0 48 62" focusable="false">
            <path class="paper" d="M3 3 H31 L45 17 V59 H3 Z" />
            <path class="fold" d="M31 3 V17 H45" />
            <g class="lines">
              <path d="M11 30 H37" />
              <path d="M11 38 H37" />
              <path d="M11 46 H28" />
            </g>
            <path class="check" d="M12 41 L20 49 L38 31" />
          </svg>
          <span class="word">{{ step === 5 ? "Validée" : "Facture" }}</span>
        </span>
      </div>
    </div>

    <div class="controls">
      <button class="replay" type="button" :disabled="step > 0" @click="playRequest">
        {{ step > 0 ? "Envoi en cours…" : "Envoyer une facture" }}
      </button>
      <!-- Before the first click the button reads like a real action. It is a
           demonstration, and saying so is what tells the visitor to press it. -->
      <p v-if="step === 0" class="narration hint">
        Démonstration : rien n’est envoyé. Cliquez pour suivre le trajet d’une facture.
      </p>
      <p v-else class="narration" aria-live="polite">
        <strong>{{ step }}/5</strong> {{ beats[step - 1] }}
      </p>
    </div>

    <!-- Same five beats, readable without any motion. -->
    <ol class="beats">
      <li v-for="beat in beats" :key="beat">{{ beat }}</li>
    </ol>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import LayerRow from "./LayerRow.vue";
import { useTechnicalLevel } from "../../composables/useTechnicalLevel";
import { hoodLayers } from "../../data/howItWorks";
import { travellingLabelTop } from "../../utils/hoodLabel";

const technical = useTechnicalLevel();

const lastKey = hoodLayers[hoodLayers.length - 1].key;

const beats = [
  "Vous envoyez votre facture depuis un formulaire.",
  "L’API transporte votre facture.",
  "Le moteur vérifie le montant et vos droits.",
  "La facture est enregistrée.",
  "La confirmation remonte à l’écran.",
];

// Which bridge row holds the request at each beat, and what it is busy doing.
const holders = ["interface", "api", "engine", "data", "interface"];

const openLayer = ref<string | null>("interface");
const step = ref(0);
const bridgeEl = ref<HTMLElement | null>(null);
const travelEl = ref<HTMLElement | null>(null);
const labelTop = ref(0);

const litLayer = computed(() => (step.value ? holders[step.value - 1] : null));

const busyLabels = computed<Record<string, string | undefined>>(() => ({
  engine: step.value === 3 ? "vérification…" : undefined,
  data: step.value === 4 ? "enregistrement…" : undefined,
}));

/** Only used before the label has been laid out once. */
const FALLBACK_LABEL_HEIGHT = 78;

// Measured rather than computed from percentages: an opened row changes the
// heights, and the label still has to line up with the row it is visiting.
const placeAgainst = (key: string): void => {
  const bridge = bridgeEl.value;
  const index = hoodLayers.findIndex((layer) => layer.key === key);
  const row = bridge?.children[index] as HTMLElement | undefined;
  const head = row?.querySelector<HTMLElement>("[data-head]");
  if (!bridge || !head) return;

  const top = travellingLabelTop(
    bridge.getBoundingClientRect().top,
    head.getBoundingClientRect(),
    travelEl.value?.offsetHeight || FALLBACK_LABEL_HEIGHT,
  );

  // Keeping the previous position is the safe failure: the label stays on a row
  // it already visited instead of leaving the diagram.
  if (top !== null) labelTop.value = top;
};

watch(step, async (value) => {
  if (value === 0) return;
  await nextTick();
  placeAgainst(holders[value - 1]);
});

onMounted(() => placeAgainst("interface"));

const timers: number[] = [];
const clearTimers = (): void => {
  timers.splice(0).forEach((id) => window.clearTimeout(id));
};

const playRequest = (): void => {
  clearTimers();

  const schedule: Array<[number, number]> = [
    [1, 0],
    [2, 900],
    [3, 1900],
    [4, 2900],
    [5, 3900],
    [0, 5400],
  ];

  schedule.forEach(([value, delay]) => {
    timers.push(window.setTimeout(() => (step.value = value), delay));
  });
};

const select = (key: string): void => {
  openLayer.value = openLayer.value === key ? null : key;
  if (openLayer.value === "api") playRequest();
};

onBeforeUnmount(clearTimers);
</script>

<style scoped>
.hood {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 880px;
}

.direction {
  margin: 0;
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  transition: color 200ms var(--ease);
}

.direction.active {
  color: var(--accent);
}

.stack {
  display: flex;
  flex-direction: column;
  /* Gutter the travelling sheet rides in, clear of the rows. */
  padding-right: 110px;
}

.bridge {
  position: relative;
  display: flex;
  flex-direction: column;
}

.travel {
  position: absolute;
  left: calc(100% + 14px);
  width: 96px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  transition: top 450ms var(--ease), opacity 220ms var(--ease);
}

.travel.idle {
  opacity: 0;
}

.sheet {
  width: 52px;
  height: auto;
  /* The hard shadow is part of the page's language; it must not be clipped. */
  overflow: visible;
  filter: drop-shadow(4px 4px 0 var(--line));
}

.sheet path {
  fill: none;
  stroke: var(--line);
  stroke-width: 3;
}

.paper {
  fill: var(--accent);
  transition: fill 220ms var(--ease);
}

.lines {
  transition: opacity 180ms var(--ease);
}

/* Stamped on arrival, in the colour of the paper it is stamped on. */
.check {
  stroke: #fffef8;
  stroke-width: 5;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0;
  transition: opacity 180ms var(--ease);
}

.travel .word {
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
}

.travel.back .paper {
  fill: var(--blue);
}

.travel.back .lines {
  opacity: 0;
}

.travel.back .check {
  opacity: 1;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
  padding-top: 6px;
}

.replay {
  width: fit-content;
  min-height: 44px;
  padding: 11px 14px;
  border: 3px solid var(--line);
  background: var(--bg-elev);
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 160ms var(--ease), box-shadow 160ms var(--ease);
}

.replay:hover:not(:disabled) {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 var(--line);
}

.replay:disabled {
  cursor: default;
  opacity: 0.6;
}

.narration {
  margin: 0;
  color: var(--text);
  font-size: clamp(15px, 2.2vw, 17px);
}

.hint {
  color: var(--muted);
}

.narration strong {
  margin-right: 8px;
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 12px;
}

/* The motion tells the story; this list is the version that needs none. */
.beats {
  display: none;
  margin: 6px 0 0;
  padding-left: 20px;
  color: var(--muted);
  font-size: 15px;
}

.beats li {
  padding: 3px 0;
}

@media (max-width: 760px) {
  .stack {
    padding-right: 84px;
  }

  .travel {
    left: calc(100% + 8px);
    width: 72px;
  }

  .sheet {
    width: 40px;
  }

  .travel .word {
    font-size: 10px;
  }
}

/* On a phone, the side ticket steals too much width from the layers. The
   diagram becomes a full-width vertical trail: the rail carries the direction,
   and the narration card under the button says where the request is. */
@media (max-width: 640px) {
  .hood {
    gap: 8px;
  }

  .stack {
    position: relative;
    padding-right: 0;
    padding-left: 31px;
  }

  .stack::before {
    content: "";
    position: absolute;
    top: 12px;
    bottom: 12px;
    left: 9px;
    width: 3px;
    background: repeating-linear-gradient(
      to bottom,
      var(--line) 0 7px,
      transparent 7px 13px
    );
  }

  .travel {
    display: none;
  }

  .controls {
    display: grid;
    gap: 10px;
    padding-top: 2px;
  }

  .replay {
    width: 100%;
  }

  .narration {
    order: -1;
    padding: 10px 12px;
    border: 3px solid var(--line);
    background: color-mix(in oklch, var(--bg-elev) 86%, var(--yellow));
    box-shadow: 4px 4px 0 var(--line);
    font-size: 14px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .travel,
  .direction,
  .paper,
  .lines,
  .check {
    transition: none;
  }

  .beats {
    display: block;
  }
}
</style>
