import { computed, inject, provide, ref, type ComputedRef, type InjectionKey, type Ref } from "vue";

export interface TechnicalLevel {
  /** `true` when the page shows the jargon: React, Symfony, Payload, REST, TypeScript… */
  enabled: Ref<boolean>;
  /** Wording for the control that flips the level, so every caller says the same thing. */
  label: ComputedRef<string>;
  toggle: () => void;
}

// Kept free of provide/inject so it can be unit-tested without mounting a component.
export const createTechnicalLevel = (initial = false): TechnicalLevel => {
  const enabled = ref(initial);

  return {
    enabled,
    label: computed(() => (enabled.value ? "Masquer la partie technique" : "Voir la partie technique")),
    toggle: () => {
      enabled.value = !enabled.value;
    },
  };
};

const technicalLevelKey: InjectionKey<TechnicalLevel> = Symbol("how-it-works:technical-level");

export const provideTechnicalLevel = (initial = false): TechnicalLevel => {
  const level = createTechnicalLevel(initial);
  provide(technicalLevelKey, level);
  return level;
};

// A component used outside the page still renders — it simply stays at the client level.
export const useTechnicalLevel = (): TechnicalLevel =>
  inject(technicalLevelKey, () => createTechnicalLevel(false), true);
