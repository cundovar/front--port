<template>
  <button class="theme-toggle" type="button" @click="toggle">
    <span class="dot" :class="{ dark: isDark }"></span>
    <span class="label">{{ isDark ? "Nuit" : "Jour" }}</span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  isDark: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{ (e: "toggle"): void }>();

const toggle = (): void => {
  emit("toggle");
};
</script>

<style scoped>
.theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: var(--bg-elev);
  color: var(--text);
  cursor: pointer;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--orange);
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.6);
}

.dot.dark {
  background: var(--blue);
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.6);
}

.label {
  font-size: 13px;
  font-weight: 600;
}
</style>
