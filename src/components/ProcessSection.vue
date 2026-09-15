<template>
  <section id="process" class="section process-section" aria-labelledby="process-title">
    <div class="process-header">
      <h2 id="process-title" class="section-title">Comment se déroule votre projet ?</h2>
      <p class="section-subtitle">Un accompagnement clair, du premier échange à la mise en ligne</p>
    </div>
    <div v-if="process.length" class="process-timeline">
      <div v-for="(step, index) in process" :key="step.title" class="process-step">
        <div class="step-marker">
          <div class="step-number">{{ index + 1 }}</div>
          <div v-if="index < process.length - 1" class="step-connector"></div>
        </div>
        <div class="step-content">
          <h3 class="step-title">{{ step.title }}</h3>
          <p class="step-description">{{ step.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface ProcessStep {
  title: string;
  description: string;
}

interface Props {
  process: ProcessStep[];
}

defineProps<Props>();
</script>

<style scoped>
.process-section {
  padding-top: clamp(48px, 7vw, 84px);
  padding-bottom: clamp(48px, 7vw, 84px);
}

.process-section .section-title {
  max-width: 1050px;
  font-size: clamp(46px, 7vw, 82px);
  line-height: 0.88;
}

.process-header {
  margin-bottom: clamp(28px, 5vw, 48px);
}

.process-header .section-subtitle {
  margin-bottom: 0;
}

.process-timeline {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.process-step {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: clamp(24px, 4vw, 40px);
  padding: clamp(16px, 2.5vw, 24px) 0;
  border-bottom: 3px solid var(--line);
}

.process-step:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.step-marker {
  position: relative;
  min-width: 52px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.step-number {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid var(--line);
  background: var(--bg-elev);
  border-radius: 0;
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 900;
  color: var(--accent);
}

.step-connector {
  position: absolute;
  top: 52px;
  width: 3px;
  height: clamp(16px, 2.5vw, 24px);
  background: var(--line);
}

.step-content {
  padding-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.step-title {
  font-family: var(--font-display);
  font-size: clamp(22px, 3vw, 28px);
  line-height: 0.95;
  text-transform: uppercase;
  margin: 0;
  color: var(--text);
}

.step-description {
  font-size: clamp(15px, 2vw, 18px);
  line-height: 1.4;
  color: var(--muted);
  margin: 0;
}

@media (max-width: 720px) {
  .process-timeline {
    gap: 0;
  }

  .process-step {
    gap: 16px;
    padding: 20px 0;
  }

  .step-number {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }

  .step-connector {
    top: 50px;
  }
}
</style>
