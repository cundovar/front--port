<template>
  <form class="contact-form" data-scroll-target @submit.prevent="submit">
    <div class="contact-form-grid">
      <label>Nom complet<input v-model.trim="form.fullName" required autocomplete="name" /></label>
      <label>Email<input v-model.trim="form.email" required type="email" autocomplete="email" /></label>
      <label>Entreprise (optionnel)<input v-model.trim="form.company" autocomplete="organization" /></label>
      <label>Fonction (optionnel)<input v-model.trim="form.position" autocomplete="organization-title" /></label>
      <label>Type de mission<input v-model.trim="form.missionType" required placeholder="Site, application, formation…" /></label>
      <label>Budget indicatif<input v-model.trim="form.budget" placeholder="Optionnel" /></label>
      <label class="contact-form-wide">Délai souhaité<input v-model.trim="form.timeline" placeholder="Optionnel" /></label>
      <label class="contact-form-wide">Votre besoin<textarea v-model.trim="form.message" required rows="5" /></label>
    </div>
    <input v-model="form.honeypot" class="contact-honeypot" tabindex="-1" autocomplete="off" aria-hidden="true" />
    <div class="contact-form-actions">
      <button class="btn btn-primary" type="submit" :disabled="submitting">
        {{ submitting ? "Envoi…" : "Envoyer ma demande" }}
      </button>
      <p v-if="feedback" class="contact-feedback" :class="{ error: hasError }" role="status">{{ feedback }}</p>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { api } from "../utils/api";

const emptyForm = () => ({ fullName: "", email: "", company: "", position: "", missionType: "", message: "", budget: "", timeline: "", honeypot: "" });
const form = reactive(emptyForm());
const submitting = ref(false);
const feedback = ref("");
const hasError = ref(false);

const submit = async (): Promise<void> => {
  submitting.value = true;
  feedback.value = "";
  hasError.value = false;
  try {
    const response = await api.fetch("/api/contact-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!response.ok) throw new Error();
    const data = await response.json() as { notificationSent?: boolean; confirmationSent?: boolean };
    feedback.value = data.confirmationSent
      ? "Merci, votre demande est bien reçue. Un récapitulatif vient de vous être envoyé par email."
      : "Merci, votre demande est bien reçue. Je vous répondrai rapidement.";
    Object.assign(form, emptyForm());
  } catch {
    hasError.value = true;
    feedback.value = "L’envoi a échoué. Vous pouvez aussi écrire directement à varas.cundo@gmail.com.";
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.contact-form { display: grid; gap: 22px; margin-top: 28px; padding: clamp(22px, 4vw, 40px); border: 3px solid var(--line); background: var(--bg-elev); box-shadow: var(--shadow); }
.contact-form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
.contact-form label { display: grid; gap: 7px; font-family: var(--font-mono); font-size: 11px; font-weight: 700; text-transform: uppercase; }
.contact-form input, .contact-form textarea { width: 100%; border: 2px solid var(--line); padding: 12px; color: var(--text); background: var(--bg); font: inherit; text-transform: none; }
.contact-form textarea { resize: vertical; }
.contact-form-wide { grid-column: 1 / -1; }
.contact-form-actions { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; }
.contact-feedback { margin: 0; color: var(--text); font-size: 14px; }
.contact-feedback.error { color: var(--accent); }
.contact-honeypot { position: absolute; left: -10000px; opacity: 0; }
@media (max-width: 640px) { .contact-form-grid { grid-template-columns: 1fr; } .contact-form-wide { grid-column: auto; } }
</style>
