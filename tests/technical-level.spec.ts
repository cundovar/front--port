import { describe, expect, it } from "vitest";
import { createTechnicalLevel } from "../src/composables/useTechnicalLevel";

describe("createTechnicalLevel", () => {
  it("starts at the client level so a visitor never lands on jargon", () => {
    const level = createTechnicalLevel();

    expect(level.enabled.value).toBe(false);
    expect(level.label.value).toBe("Voir la partie technique");
  });

  it("reveals the technical level and offers the way back", () => {
    const level = createTechnicalLevel();

    level.toggle();

    expect(level.enabled.value).toBe(true);
    expect(level.label.value).toBe("Masquer la partie technique");
  });

  it("returns to the client level on a second toggle", () => {
    const level = createTechnicalLevel();

    level.toggle();
    level.toggle();

    expect(level.enabled.value).toBe(false);
    expect(level.label.value).toBe("Voir la partie technique");
  });

  it("can open straight on the technical level", () => {
    const level = createTechnicalLevel(true);

    expect(level.enabled.value).toBe(true);
    expect(level.label.value).toBe("Masquer la partie technique");
  });
});
