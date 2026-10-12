import { describe, expect, it } from "vitest";
import { slugifyProjectName } from "../src/utils/projectSlug";

describe("slugifyProjectName", () => {
  it("creates a public URL segment from a French project name", () => {
    expect(slugifyProjectName("Étude d’été : intégration WordPress")).toBe(
      "etude-d-ete-integration-wordpress",
    );
  });

  it("does not leave separators at either end", () => {
    expect(slugifyProjectName("  --- Projet IA ! ---  ")).toBe("projet-ia");
  });
});
