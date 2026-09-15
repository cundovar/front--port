<template>
  <section class="quote-contact" aria-labelledby="quote-contact-title">
    <h3 id="quote-contact-title" class="quote-contact-title">Vous souhaitez en parler ?</h3>
    <p class="quote-contact-intro">
      Laissez vos coordonnées pour recevoir cette estimation et convenir d’un échange.
      C’est facultatif : votre estimation reste affichée si vous préférez en rester là.
    </p>

    <div class="quote-grid">
      <label class="quote-field">
        Nom complet
        <input
          type="text"
          autocomplete="name"
          maxlength="120"
          :value="contact.fullName"
          @input="emit('update', { fullName: ($event.target as HTMLInputElement).value })"
        />
        <span v-if="errors.fullName" class="quote-error" role="alert">{{ errors.fullName }}</span>
      </label>

      <label class="quote-field">
        Email
        <input
          type="email"
          autocomplete="email"
          maxlength="255"
          :value="contact.email"
          @input="emit('update', { email: ($event.target as HTMLInputElement).value })"
        />
        <span v-if="errors.email" class="quote-error" role="alert">{{ errors.email }}</span>
      </label>

      <label class="quote-field">
        Entreprise (optionnel)
        <input
          type="text"
          autocomplete="organization"
          maxlength="120"
          :value="contact.company"
          @input="emit('update', { company: ($event.target as HTMLInputElement).value })"
        />
      </label>

      <label class="quote-field">
        Téléphone (optionnel)
        <input
          type="tel"
          autocomplete="tel"
          maxlength="40"
          :value="contact.phone"
          @input="emit('update', { phone: ($event.target as HTMLInputElement).value })"
        />
      </label>
    </div>

    <label class="quote-consent">
      <input
        type="checkbox"
        :checked="contact.consent"
        @change="emit('update', { consent: ($event.target as HTMLInputElement).checked })"
      />
      <span>
        J’accepte d’être recontacté au sujet de cette estimation. Mes coordonnées ne servent qu’à cela
        et ne sont jamais transmises au modèle d’IA qui rédige la synthèse.
      </span>
    </label>
    <span v-if="errors.consent" class="quote-error" role="alert">{{ errors.consent }}</span>

    <input
      class="quote-honeypot"
      tabindex="-1"
      autocomplete="off"
      aria-hidden="true"
      :value="contact.honeypot"
      @input="emit('update', { honeypot: ($event.target as HTMLInputElement).value })"
    />
  </section>
</template>

<script setup lang="ts">
import type { QuoteContact } from "../../types";

defineProps<{ contact: QuoteContact; errors: Record<string, string> }>();
const emit = defineEmits<{ update: [Partial<QuoteContact>] }>();
</script>

<style scoped>
.quote-contact { display: grid; gap: 16px; border-top: 2px solid var(--line); padding-top: 24px; }
.quote-contact-title { margin: 0; font-size: 18px; }
.quote-contact-intro { margin: 0; font-size: 14px; opacity: 0.85; }
.quote-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.quote-field { display: grid; gap: 7px; font-family: var(--font-mono); font-size: 11px; font-weight: 700; text-transform: uppercase; }
.quote-field input { border: 2px solid var(--line); padding: 12px; color: var(--text); background: var(--bg); font: inherit; text-transform: none; }
.quote-consent { display: flex; gap: 12px; align-items: flex-start; font-size: 13px; line-height: 1.5; }
.quote-error { color: var(--accent); font-size: 14px; text-transform: none; font-weight: 400; }
.quote-honeypot { position: absolute; left: -10000px; opacity: 0; }
@media (max-width: 640px) { .quote-grid { grid-template-columns: 1fr; } }
</style>
