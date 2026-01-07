import { onMounted, ref } from "vue";
import type { ContentData } from "../types";
import defaultContent from "../data/content.json";

const mergeContent = (base: ContentData, incoming: Partial<ContentData>): ContentData => {
  const hasKey = <T extends object>(obj: T, key: keyof T): boolean =>
    Object.prototype.hasOwnProperty.call(obj, key);

  return {
    header: hasKey(incoming, "header") ? { ...base.header, ...incoming.header } : base.header,
    hero: hasKey(incoming, "hero") ? { ...base.hero, ...incoming.hero } : base.hero,
    about: hasKey(incoming, "about") ? { ...base.about, ...incoming.about } : base.about,
    trust: hasKey(incoming, "trust") ? { ...base.trust, ...incoming.trust } : base.trust,
    stack: hasKey(incoming, "stack") ? { ...base.stack, ...incoming.stack } : base.stack,
    teaching: hasKey(incoming, "teaching") ? { ...base.teaching, ...incoming.teaching } : base.teaching,
    projects: hasKey(incoming, "projects") ? { ...base.projects, ...incoming.projects } : base.projects,
    skills: hasKey(incoming, "skills") ? { ...base.skills, ...incoming.skills } : base.skills,
    cta: hasKey(incoming, "cta") ? { ...base.cta, ...incoming.cta } : base.cta,
    footer: hasKey(incoming, "footer") ? { ...base.footer, ...incoming.footer } : base.footer,
  };
};

export const useContent = () => {
  const content = ref<ContentData>(defaultContent as ContentData);

  const load = async (): Promise<void> => {
    try {
      const response = await fetch("/api/content");
      if (!response.ok) return;

      const data = (await response.json()) as Partial<ContentData>;
      content.value = mergeContent(defaultContent as ContentData, data);

      // Charger les skills depuis l'API dédiée si disponible
      const skillsResponse = await fetch("/api/skills");
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
    } catch {
      // Fallback sur les données par défaut
    }
  };

  onMounted(() => {
    void load();
  });

  return { content };
};
