import { onMounted, ref } from "vue";
import type { ContentData } from "../types";
import defaultContent from "../data/content.json";
import { api } from "../utils/api";
import { normalizeContent } from "../utils/content";

export type ContentLoadState = "idle" | "loading" | "ready" | "error";

export const useContent = () => {
  const content = ref<ContentData>(defaultContent as ContentData);
  const state = ref<ContentLoadState>("idle");
  const error = ref<Error | null>(null);

  const load = async (): Promise<void> => {
    if (!api.isEnabled) {
      state.value = "ready";
      return;
    }

    state.value = "loading";
    try {
      const response = await api.fetch("/api/content");
      if (!response.ok) {
        state.value = "ready";
        return;
      }

      const data = await response.json();
      content.value = normalizeContent(defaultContent as ContentData, data);

      // Charger les skills depuis l'API dédiée si disponible
      const skillsResponse = await api.fetch("/api/skills");
      if (skillsResponse.ok) {
        const skills = await skillsResponse.json();
        content.value = {
          ...content.value,
          skills: {
            ...content.value.skills,
            summary: skills.summaryText ?? skills.summary ?? content.value.skills.summary,
            evidence: skills.evidence ?? content.value.skills.evidence,
            topSkills: skills.topSkills ?? content.value.skills.topSkills,
            hiddenSkills: skills.hiddenSkills ?? content.value.skills.hiddenSkills,
            generatedAt: skills.generatedAt ?? content.value.skills.generatedAt,
          },
        };
      }
      state.value = "ready";
    } catch (caught) {
      error.value = caught instanceof Error ? caught : new Error("Content loading failed");
      state.value = "error";
      // Fallback sur les données par défaut
    }
  };

  onMounted(() => {
    void load();
  });

  return { content, state, error };
};
