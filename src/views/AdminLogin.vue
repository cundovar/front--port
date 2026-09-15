<template>
  <main class="page">
    <section class="section login">
      <div class="card">
        <h1>Connexion Admin</h1>
        <form class="form" @submit.prevent="submit">
          <label>
            Email
            <input v-model="email" type="text" required />
          </label>
          <label>
            Mot de passe
            <input v-model="password" type="password" required />
          </label>
          <button class="btn btn-primary" type="submit">Se connecter</button>
        </form>
        <p class="muted">Acces reserve a l'administrateur.</p>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { api } from "../utils/api";

const email = ref("");
const password = ref("");

const submit = async (): Promise<void> => {
  try {
    const response = await api.fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email: email.value, password: password.value }),
    });

    console.log("Response status:", response.status);
    const data = await response.json();
    console.log("Response data:", data);

    if (!response.ok) {
      console.error("Login failed");
      return;
    }

    console.log("Login successful, redirecting...");
    setTimeout(() => {
      window.location.href = "/admin";
    }, 100);
  } catch (error) {
    console.error("Error:", error);
  }
};
</script>

<style scoped>
.login {
  max-width: 520px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
}

input {
  border-radius: 10px;
  padding: 10px 12px;
  background: var(--bg);
  border: 1px solid var(--line);
  color: var(--text);
}

.muted {
  color: var(--muted);
  margin: 16px 0 0;
}
</style>
