<template>
  <main class="page">
    <div class="section admin-header">
      <RouterLink to="/admin">← Retour</RouterLink>
    </div>
    <BackofficeProjects />
  </main>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
import BackofficeProjects from "../components/BackofficeProjects.vue";
</script>

<style scoped>
.admin-header {
  display: flex;
  justify-content: flex-start;
}
</style>
