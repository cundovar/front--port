<template>
  <button class="theme-toggle" type="button" @click="toggle" :title="isDark ? 'Mode jour' : 'Mode nuit'">
    <span v-if="isDark" class="icon">🌙</span>
    <span v-else class="icon">☀️</span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  isDark: boolean;
}

defineProps<Props>();
const emit = defineEmits<{ (e: "toggle"): void }>();

const toggle = (): void => {
  emit("toggle");
};
</script>

<style scoped>
.theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--line);
  background: var(--bg-elev);
  cursor: pointer;
  transition: transform 0.2s, border-color 0.2s;
}

.theme-toggle:hover {
  border-color: var(--yellow);
  transform: scale(1.05);
}

.icon {
  font-size: 18px;
  line-height: 1;
}

@media (max-width: 768px) {
  .theme-toggle {
    width: 36px;
    height: 36px;
  }

  .icon {
    font-size: 16px;
  }
}
</style>
