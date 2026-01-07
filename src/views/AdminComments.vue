<template>
  <main class="page">
    <div class="section admin-header">
      <RouterLink to="/admin">← Retour</RouterLink>
    </div>
    <BackofficeComments :initial-comments="comments" />
  </main>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
import BackofficeComments from "../components/BackofficeComments.vue";
import { commentsSeed } from "../data/comments";

const comments = commentsSeed;
</script>

<style scoped>
.admin-header {
  display: flex;
  justify-content: flex-start;
}
</style>
