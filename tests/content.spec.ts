import { describe, expect, it } from "vitest";
import defaultContent from "../src/data/content.json";
import type { ContentData, ProjectCard } from "../src/types";
import { normalizeContent, normalizeProjects } from "../src/utils/content";

const fallback = defaultContent as ContentData;

describe("normalizeContent", () => {
  it("keeps every section when the API payload is partial", () => {
    const content = normalizeContent(fallback, {
      hero: {
        title: "Nouvelle accroche",
      },
    });

    expect(content.hero.title).toBe("Nouvelle accroche");
    expect(content.ai).toEqual(fallback.ai);
    expect(content.footer).toEqual(fallback.footer);
  });

  it("falls back section by section when the API sends invalid shapes", () => {
    const content = normalizeContent(fallback, {
      ai: null,
      trust: {
        items: "not-an-array",
      },
      stack: {
        title: "Stack API",
      },
    });

    expect(content.ai).toEqual(fallback.ai);
    expect(content.trust.items).toEqual(fallback.trust.items);
    expect(content.stack.title).toBe("Stack API");
  });

  it("keeps fallback service button labels when the API sends empty labels", () => {
    const content = normalizeContent(fallback, {
      services: fallback.services.map((service, index) => ({
        ...service,
        title: `Service API ${index + 1}`,
        actionLabel: index % 2 === 0 ? "" : "   ",
      })),
    });

    expect(content.services.map((service) => service.actionLabel)).toEqual(
      fallback.services.map((service) => service.actionLabel),
    );
    expect(content.services[0].title).toBe("Service API 1");
  });

  it("keeps service FAQ entries nested and falls back on malformed lists", () => {
    const content = normalizeContent(fallback, {
      services: fallback.services.map((service, index) => ({
        ...service,
        faqs: index === 0 ? [{ question: "Question API", answer: "Reponse API" }] : "invalid",
      })),
    });

    expect(content.services[0].faqs).toEqual([{ question: "Question API", answer: "Reponse API" }]);
    expect(content.services[1].faqs).toEqual(fallback.services[1].faqs);
  });

  it("normalizes editable service pricing fields", () => {
    const content = normalizeContent(fallback, {
      services: fallback.services.map((service, index) => ({
        ...service,
        pricing: index === 0
          ? { essential: "900 €", standard: "1 500 €" }
          : { standard: 900 },
      })),
    });

    expect(content.services[0].pricing).toEqual({
      essential: "900 €",
      standard: "1 500 €",
    });
    expect(content.services[1].pricing).toEqual(fallback.services[1].pricing);
  });
});

describe("normalizeProjects", () => {
  const fallbackProjects: ProjectCard[] = [
    {
      id: -1,
      name: "Fallback",
      stack: "Vue",
      summary: "Fallback summary",
      bulletin: "Fallback bulletin",
      siteUrl: "https://example.com",
      repoUrl: null,
      imageUrl: null,
      duration: null,
      status: "in_progress",
      slug: "fallback",
      clientProblem: null,
      mission: null,
      solution: null,
      outcomes: [],
      serviceTags: [],
      featured: false,
      sortOrder: 0,
    },
  ];

  it("accepts Symfony projects without artificial progress field", () => {
    const projects = normalizeProjects(
      [
        {
          id: 12,
          name: "Portfolio",
          stack: "Symfony, Vue",
          summary: "Summary",
          bulletin: "Bulletin",
          siteUrl: "https://example.com",
          repoUrl: null,
          imageUrl: null,
          duration: null,
          status: "published",
          slug: "portfolio",
          clientProblem: "Legacy workflow manuel",
          mission: "Automatiser",
          solution: "Application Symfony",
          outcomes: ["Backoffice plus clair"],
          serviceTags: ["automation"],
          featured: true,
          sortOrder: 5,
        },
      ],
      fallbackProjects,
    );

    expect(projects).toEqual([
      {
        id: 12,
        name: "Portfolio",
        stack: "Symfony, Vue",
        summary: "Summary",
        bulletin: "Bulletin",
        siteUrl: "https://example.com",
        repoUrl: null,
        imageUrl: null,
        duration: null,
        status: "published",
        slug: "portfolio",
        clientProblem: "Legacy workflow manuel",
        mission: "Automatiser",
        solution: "Application Symfony",
        outcomes: ["Backoffice plus clair"],
        serviceTags: ["automation"],
        featured: true,
        sortOrder: 5,
      },
    ]);
  });

  it("keeps the local fallback for unusable API responses", () => {
    expect(normalizeProjects([{ id: "legacy-id" }], fallbackProjects)).toBe(fallbackProjects);
    expect(normalizeProjects({ ok: true }, fallbackProjects)).toBe(fallbackProjects);
  });
});
