<template>
  <div class="grid-lines" v-if="isDesktop">
    <div class="line-vertical" :style="{ left: verticalPos + 'px' }"></div>
    <div class="line-horizontal" :style="{ top: horizontalPos + 'px' }"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";

const windowWidth = ref(window.innerWidth);
const isDesktop = computed(() => windowWidth.value >= 960);

// Position dynamique basée sur la largeur de l'écran
const verticalPos = computed(() => {
  const min = 40;
  const max = 120;
  const ratio = Math.min((windowWidth.value - 960) / 500, 1);
  return min + ratio * (max - min);
});

const horizontalPos = computed(() => {
  const min = 50;
  const max = 100;
  const ratio = Math.min((windowWidth.value - 960) / 500, 1);
  return min + ratio * (max - min);
});

const onResize = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(() => {
  window.addEventListener("resize", onResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", onResize);
});
</script>

<style scoped>
.grid-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.line-vertical {
  position: fixed;
  top: 0;
  width: 1px;
  height: 100vh;
  background: rgba(255, 255, 255, 0.1);
  transition: left 0.3s ease-out;
}

.line-horizontal {
  position: absolute;
  left: 0;
  width: 100vw;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  transition: top 0.3s ease-out;
}
</style>
