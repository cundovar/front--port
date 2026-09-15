<template>
  <fieldset class="quote-fieldset">
    <legend class="quote-legend">Quel est votre besoin principal ?</legend>
    <div class="quote-choices">
      <label
        v-for="option in options"
        :key="option.value"
        class="quote-choice"
        :class="{ selected: modelValue === option.value }"
      >
        <input
          type="radio"
          name="serviceKey"
          :value="option.value"
          :checked="modelValue === option.value"
          @change="emit('update:modelValue', option.value)"
        />
        <span>{{ option.label }}</span>
      </label>
    </div>
    <p v-if="error" class="quote-error" role="alert">{{ error }}</p>
  </fieldset>
</template>

<script setup lang="ts">
import type { QuoteServiceKey } from "../../types";

defineProps<{
  modelValue: QuoteServiceKey | "";
  options: { value: QuoteServiceKey; label: string }[];
  error?: string;
}>();

const emit = defineEmits<{ "update:modelValue": [QuoteServiceKey] }>();
</script>

<style scoped>
.quote-fieldset { border: 0; margin: 0; padding: 0; }
.quote-legend { font-family: var(--font-mono); font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 16px; }
.quote-choices { display: grid; gap: 12px; }
.quote-choice { display: flex; align-items: center; gap: 12px; border: 2px solid var(--line); padding: 14px; cursor: pointer; }
.quote-choice.selected { border-color: var(--text); background: var(--bg-elev); }
.quote-choice input { accent-color: var(--text); }
.quote-error { color: var(--accent); font-size: 14px; margin: 12px 0 0; }
</style>
