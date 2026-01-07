<template>
  <main class="page">
    <div class="section admin-header">
      <RouterLink to="/admin">← Retour</RouterLink>
    </div>
    <BackofficeContent />
  </main>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
import BackofficeContent from "../components/BackofficeContent.vue";
</script>

<style scoped>
.admin-header {
  display: flex;
  justify-content: flex-start;
}
</style>
