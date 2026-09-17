<template>
  <div class="automation">
    <div class="copy">
      <p class="intro">Certaines fonctionnalités ne nécessitent pas une application entière. Une automatisation peut parfois supprimer plusieurs tâches répétitives.</p>
      <button class="automation-button" type="button" @click="toggle">
        {{ automated ? "Revenir au travail manuel" : "Automatiser" }}
      </button>
      <p class="tally" :class="{ saved: automated }">
        {{ automated ? "1 déclencheur, puis plus rien à faire." : "5 actions à la main, à chaque client." }}
      </p>
    </div>

    <div class="diagram" aria-live="polite">
      <template v-if="!automated">
        <div class="flow manual">
          <div v-for="(step, index) in manualSteps" :key="step" class="flow-step">
            <span class="step-index">{{ index + 1 }}</span>
            <span>{{ step }}</span>
          </div>
        </div>
        <p v-if="technical.enabled.value" class="technical-note">
          Côté technique : chacune de ces étapes est une saisie manuelle, donc une source d’erreur et un délai.
        </p>
      </template>

      <template v-else>
        <div class="auto">
          <div class="node source" :class="{ lit: step >= 1 }">Formulaire</div>

          <div class="wire trunk" aria-hidden="true">
            <span v-if="step === 1" class="spark"></span>
          </div>

          <div class="node engine" :class="{ lit: step >= 2 }">
            <span>n8n</span>
            <small v-if="step === 2">traitement…</small>
          </div>

          <!-- The branching the whole section is about: one trigger, three tools. -->
          <div class="branch" aria-hidden="true">
            <span class="bar"></span>
            <span v-for="output in outputs" :key="output.label" class="leg">
              <span v-if="step === 3" class="spark"></span>
            </span>
          </div>

          <div class="outputs">
            <div
              v-for="output in outputs"
              :key="output.label"
              class="node output"
              :class="{ done: step >= 4 }"
            >
              <span class="output-head">
                <span v-if="step >= 4" class="tick" aria-hidden="true">✓</span>
                {{ output.label }}
              </span>
              <small>{{ output.detail }}</small>
            </div>
          </div>
        </div>

        <div class="auto-footer">
          <button class="replay" type="button" :disabled="running" @click="play">
            {{ running ? "En cours…" : "Rejouer" }}
          </button>
          <p class="human-note">Chaque action importante peut rester visible et attendre une validation humaine.</p>
        </div>

        <p v-if="technical.enabled.value" class="technical-note">
          Côté technique : n8n orchestre le workflow, appelle les API et peut permettre de reprendre
          ou rejouer certaines étapes en cas d’échec.
        </p>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue";
import { useTechnicalLevel } from "../../composables/useTechnicalLevel";

const technical = useTechnicalLevel();
const automated = ref(false);

// 0 idle · 1 the form leaves · 2 n8n works · 3 it fans out · 4 the three tools are done.
const step = ref(0);
const running = ref(false);

const manualSteps = [
  "Un client remplit un formulaire",
  "Vous recevez les informations",
  "Vous les copiez dans votre CRM",
  "Vous envoyez un mail",
  "Vous créez un document",
];

const outputs = [
  { label: "CRM", detail: "Fiche créée" },
  { label: "Email", detail: "Message préparé" },
  { label: "Document", detail: "Fichier généré" },
];

const timers: number[] = [];
const clearTimers = (): void => {
  timers.splice(0).forEach((id) => window.clearTimeout(id));
};

// The run stops on 4 rather than resetting: the ticked tools are the result.
const play = (): void => {
  clearTimers();
  running.value = true;
  step.value = 0;

  const schedule: Array<[number, number]> = [
    [1, 60],
    [2, 860],
    [3, 1760],
    [4, 2560],
  ];

  schedule.forEach(([value, delay]) => {
    timers.push(window.setTimeout(() => (step.value = value), delay));
  });

  timers.push(window.setTimeout(() => (running.value = false), 3200));
};

const toggle = (): void => {
  automated.value = !automated.value;
  clearTimers();
  step.value = 0;
  running.value = false;
  if (automated.value) play();
};

onBeforeUnmount(clearTimers);
</script>

<style scoped>
.automation {
  display: grid;
  grid-template-columns: minmax(260px, 0.8fr) minmax(320px, 1.2fr);
  gap: clamp(24px, 5vw, 52px);
  align-items: start;
}

.copy {
  display: flex;
  flex-direction: column;
  gap: 18px;
  position: sticky;
  top: 100px;
}

.intro {
  margin: 0;
  color: var(--muted);
  font-size: clamp(18px, 3vw, 21px);
}

.automation-button {
  width: fit-content;
  min-height: 48px;
  padding: 12px 18px;
  border: 3px solid var(--line);
  background: var(--accent);
  color: #fffef8;
  box-shadow: 6px 6px 0 var(--line);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 160ms var(--ease), box-shadow 160ms var(--ease);
}

.automation-button:hover {
  transform: translate(-2px, -2px);
  box-shadow: 8px 8px 0 var(--line);
}

.tally {
  margin: 0;
  padding: 10px 12px;
  border: 3px solid var(--line);
  background: var(--soft);
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 800;
}

.tally.saved {
  background: var(--accent);
  color: #fffef8;
}

.diagram {
  padding: clamp(20px, 4vw, 32px);
  border: 3px solid var(--line);
  background:
    repeating-linear-gradient(90deg, var(--soft) 0 1px, transparent 1px 24px),
    repeating-linear-gradient(180deg, var(--soft) 0 1px, transparent 1px 24px),
    var(--bg-elev);
  box-shadow: var(--shadow);
}

.flow {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.flow-step,
.node {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 15px;
  border: 3px solid var(--line);
  background: var(--bg-elev);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}

.manual .flow-step {
  animation: step-in 280ms var(--ease) both;
}

.manual .flow-step:nth-child(2) { animation-delay: 40ms; }
.manual .flow-step:nth-child(3) { animation-delay: 80ms; }
.manual .flow-step:nth-child(4) { animation-delay: 120ms; }
.manual .flow-step:nth-child(5) { animation-delay: 160ms; }

.step-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: 2px solid var(--line);
  color: var(--accent);
}

/* ---------- automated diagram ---------- */

.auto {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.node {
  transition: background 200ms var(--ease), color 200ms var(--ease), box-shadow 200ms var(--ease);
}

.node.lit {
  background: var(--accent);
  color: #fffef8;
  box-shadow: 5px 5px 0 var(--line);
}

.source,
.engine {
  justify-content: center;
  width: min(100%, 200px);
}

.engine {
  flex-direction: column;
  gap: 2px;
  border-color: var(--accent);
}

.engine small {
  font-size: 10px;
  font-weight: 700;
  text-transform: none;
}

.wire {
  position: relative;
  width: 3px;
  background: var(--line);
}

.trunk {
  height: 38px;
}

.spark {
  position: absolute;
  left: -4px;
  width: 11px;
  height: 11px;
  background: var(--accent);
  border: 2px solid var(--line);
  animation: slide-down 800ms var(--ease) both;
}

/* One trigger, three tools: the stub, the bar and the three legs. */
.branch {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  width: 100%;
  height: 44px;
  margin-top: 0;
}

.branch::before {
  content: "";
  position: absolute;
  top: 0;
  left: 50%;
  width: 3px;
  height: 18px;
  margin-left: -1.5px;
  background: var(--line);
}

.bar {
  position: absolute;
  top: 18px;
  left: calc(16.6667% - 3.33px);
  right: calc(16.6667% - 3.33px);
  height: 3px;
  background: var(--line);
}

.leg {
  position: relative;
  justify-self: center;
  align-self: end;
  width: 3px;
  height: 26px;
  background: var(--line);
}

.leg .spark {
  animation: slide-down 700ms var(--ease) both;
}

.outputs {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.output {
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.output.done {
  border-color: var(--accent);
}

.output-head {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.tick {
  color: var(--accent);
  font-weight: 900;
}

.output small {
  color: var(--muted);
  font-size: 10px;
  text-transform: none;
}

.auto-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
  margin-top: 22px;
}

.replay {
  min-height: 40px;
  padding: 9px 12px;
  border: 2px solid var(--line);
  background: transparent;
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  cursor: pointer;
}

.replay:hover:not(:disabled) {
  background: var(--text);
  color: var(--bg-elev);
}

.replay:disabled {
  cursor: default;
  opacity: 0.55;
}

.human-note {
  margin: 0;
  flex: 1 1 220px;
  color: var(--muted);
  font-size: 14px;
}

.technical-note {
  margin: 14px 0 0;
  padding-top: 12px;
  border-top: 2px solid var(--line);
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 12px;
}

@keyframes step-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-down {
  from {
    top: -11px;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  to {
    top: 100%;
    opacity: 1;
  }
}

@media (max-width: 860px) {
  .automation {
    grid-template-columns: 1fr;
  }

  .copy {
    position: static;
  }
}

@media (max-width: 560px) {
  .branch,
  .outputs {
    grid-template-columns: 1fr;
  }

  .branch {
    height: 24px;
  }

  .bar {
    display: none;
  }

  .leg:not(:first-child) {
    display: none;
  }

  .leg {
    justify-self: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .manual .flow-step,
  .spark {
    animation: none;
  }

  .spark {
    display: none;
  }
}
</style>
