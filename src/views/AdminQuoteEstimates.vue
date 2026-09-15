<template>
  <main class="page">
    <div class="section admin-header">
      <RouterLink to="/admin">← Retour</RouterLink>
    </div>
    <BackofficeQuoteEstimates />
  </main>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
import BackofficeQuoteEstimates from "../components/BackofficeQuoteEstimates.vue";
</script>

<style scoped>
.admin-header {
  display: flex;
  justify-content: flex-start;
}
</style>
