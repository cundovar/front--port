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
  border-radius: 0;
  border: 2px solid var(--line);
  background: var(--bg-elev);
  color: var(--text);
  cursor: pointer;
  box-shadow: 4px 4px 0 var(--line);
  transition: transform 160ms var(--ease), box-shadow 160ms var(--ease);
}

.theme-toggle:hover {
  transform: translate(-1px, -1px);
  box-shadow: 5px 5px 0 var(--line);
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
