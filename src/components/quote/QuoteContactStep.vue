<template>
  <div class="quote-step-body">
    <section class="quote-recap" aria-labelledby="quote-recap-title">
      <h3 id="quote-recap-title" class="quote-recap-title">Récapitulatif</h3>
      <dl class="quote-recap-list">
        <div v-for="row in recap" :key="row.label" class="quote-recap-row">
          <dt>{{ row.label }}</dt>
          <dd>{{ row.value }}</dd>
        </div>
      </dl>
    </section>

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
        <span v-if="errors.company" class="quote-error" role="alert">{{ errors.company }}</span>
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
        <span v-if="errors.phone" class="quote-error" role="alert">{{ errors.phone }}</span>
      </label>
    </div>

    <input
      class="quote-honeypot"
      tabindex="-1"
      autocomplete="off"
      aria-hidden="true"
      :value="contact.honeypot"
      @input="emit('update', { honeypot: ($event.target as HTMLInputElement).value })"
    />

    <label class="quote-consent">
      <input
        type="checkbox"
        :checked="contact.consentAccepted"
        @change="emit('update', { consentAccepted: ($event.target as HTMLInputElement).checked })"
      />
      <span>
        J’accepte que mes coordonnées soient utilisées uniquement pour être recontacté au sujet de cette estimation.
        Les champs de contact ne sont jamais transmis au modèle d’IA.
      </span>
    </label>
    <p v-if="errors.consentAccepted" class="quote-error" role="alert">{{ errors.consentAccepted }}</p>
  </div>
</template>

<script setup lang="ts">
import type { QuoteContact } from "../../types";

defineProps<{
  contact: QuoteContact;
  errors: Record<string, string>;
  recap: { label: string; value: string }[];
}>();

const emit = defineEmits<{ update: [Partial<QuoteContact>] }>();
</script>

<style scoped>
.quote-step-body { display: grid; gap: 24px; }
.quote-recap { border: 2px solid var(--line); padding: 18px; background: var(--bg-elev); }
.quote-recap-title { margin: 0 0 12px; font-family: var(--font-mono); font-size: 12px; text-transform: uppercase; }
.quote-recap-list { display: grid; gap: 8px; margin: 0; }
.quote-recap-row { display: flex; justify-content: space-between; gap: 16px; font-size: 14px; }
.quote-recap-row dt { font-weight: 700; }
.quote-recap-row dd { margin: 0; text-align: right; }
.quote-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
.quote-field { display: grid; gap: 7px; font-family: var(--font-mono); font-size: 11px; font-weight: 700; text-transform: uppercase; }
.quote-field input { border: 2px solid var(--line); padding: 12px; color: var(--text); background: var(--bg); font: inherit; text-transform: none; }
.quote-error { color: var(--accent); font-size: 14px; text-transform: none; font-weight: 400; }
.quote-consent { display: flex; align-items: flex-start; gap: 10px; margin: 0; font-size: 13px; opacity: 0.85; cursor: pointer; }
.quote-consent input { margin-top: 3px; flex: 0 0 auto; }
.quote-honeypot { position: absolute; left: -10000px; opacity: 0; }
@media (max-width: 640px) { .quote-grid { grid-template-columns: 1fr; } }
</style>
