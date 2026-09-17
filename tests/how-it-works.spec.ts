import { describe, expect, it } from "vitest";
import { hoodLayers, recommendArchitecture } from "../src/data/howItWorks";
import { travellingLabelTop } from "../src/utils/hoodLabel";

describe("recommendArchitecture", () => {
  it("keeps a simple editable site on WordPress", () => {
    const recommendation = recommendArchitecture("site", "me", "low");

    expect(recommendation.stack).toContain("WordPress");
    expect(recommendation.qualities).toContain("Contenus modifiables");
  });

  it("moves a highly specific site to a custom stack", () => {
    const recommendation = recommendArchitecture("site", "team", "high");

    expect(recommendation.stack).toContain("Symfony");
    expect(recommendation.reason).toContain(" développement personnalisé");
  });

  it("offers a headless CMS to a team that edits but wants its own interface", () => {
    const recommendation = recommendArchitecture("site", "team", "medium");

    expect(recommendation.stack).toContain("Payload");
    expect(recommendation.qualities).toContain("Interface personnalisée");
  });

  it("drops the CMS entirely when nobody is there to edit", () => {
    const recommendation = recommendArchitecture("site", "nobody", "medium");

    expect(recommendation.stack).not.toContain("Payload");
    expect(recommendation.stack).not.toContain("WordPress");
    expect(recommendation.qualities).toContain("Rien à administrer");
  });

  it("still answers business rules before content ownership", () => {
    const recommendation = recommendArchitecture("site", "nobody", "high");

    expect(recommendation.stack).toContain("Symfony");
  });

  it("keeps automation lighter than a full application when the workflow is simple", () => {
    const recommendation = recommendArchitecture("automation", "nobody", "low");

    expect(recommendation.stack).toContain("n8n");
    expect(recommendation.qualities).toContain("Validation humaine possible");
  });

  it("always frames AI output as a possible architecture, never a final verdict", () => {
    const recommendation = recommendArchitecture("ai", "me", "high");

    expect(recommendation.qualities).toContain("Validation humaine");
    expect(recommendation.plain.at(-1)).toBe("Validation");
  });

  it("describes every recommendation in client words before naming any tool", () => {
    const combinations = (["site", "application", "automation", "ai"] as const).flatMap((kind) =>
      (["me", "team", "nobody"] as const).flatMap((owner) =>
        (["low", "medium", "high"] as const).map((specificity) =>
          recommendArchitecture(kind, owner, specificity),
        ),
      ),
    );

    const products = /wordpress|symfony|react|vue|payload|postgresql|mysql|n8n|php/i;
    combinations.forEach((recommendation) => {
      expect(recommendation.plain.join(" ")).not.toMatch(products);
      expect(recommendation.plain.length).toBeGreaterThan(1);
    });
  });
});

describe("hoodLayers", () => {
  it("groups the interface bricks instead of showing six blocks at once", () => {
    const names = hoodLayers.map((layer) => layer.name);

    expect(hoodLayers).toHaveLength(5);
    expect(names).toContain("L’interface");
    expect(names).not.toContain("HTML + CSS + JavaScript");
  });

  it("hides HTML, CSS, JS and React behind the interface layer", () => {
    const layer = hoodLayers.find((candidate) => candidate.key === "interface");

    expect(layer?.details?.map((detail) => detail.name)).toEqual([
      "HTML",
      "CSS",
      "JavaScript",
      "React / Vue",
    ]);
  });

  it("walks the request all the way down to the data, not just to the engine", () => {
    const bridge = hoodLayers.filter((layer) => layer.position === "bridge");

    expect(bridge.map((layer) => layer.key)).toEqual(["interface", "api", "engine", "data"]);
  });
});

describe("travellingLabelTop", () => {
  it("centres the label on the row it is visiting", () => {
    // Bridge at 900 in the viewport, third row at 1000, 60 tall, label 38 tall.
    expect(travellingLabelTop(900, { top: 1000, height: 60 }, 38)).toBe(111);
  });

  it("refuses a row it cannot measure", () => {
    // A display:none element reports zeros. Trusting them sent the label to
    // minus the bridge's own offset, far above the section.
    expect(travellingLabelTop(900, { top: 0, height: 0 }, 38)).toBeNull();
    expect(travellingLabelTop(900, null, 38)).toBeNull();
  });
});
