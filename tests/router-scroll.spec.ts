import { describe, expect, it } from "vitest";
import { hashScrollTarget, waitUntilStable } from "../src/utils/routerScroll";

describe("hashScrollTarget", () => {
  it("scrolls to the section a cross-page hash link points at", () => {
    expect(hashScrollTarget({ hash: "#contact" })).toEqual({ el: "#contact", behavior: "smooth" });
  });

  it("leaves a plain route change alone", () => {
    // Returning a position here would start scrolling every navigation to the
    // top, which is not what the site did before.
    expect(hashScrollTarget({ hash: "" })).toBeUndefined();
  });
});

describe("waitUntilStable", () => {
  /** A scripted sequence of positions, one per frame, with a frame counter. */
  const scripted = (positions: (number | null)[]) => {
    let frame = 0;
    const seen: number[] = [];

    return {
      read: () => positions[Math.min(frame, positions.length - 1)] ?? null,
      next: async () => {
        seen.push(frame);
        frame += 1;
      },
      get frames() {
        return frame;
      },
    };
  };

  it("waits for the page to stop growing before scrolling", async () => {
    // The projects arrive on frame 3 and push the target down; only then does
    // the position hold still.
    const clock = scripted([1000, 1000, 4000, 5400, 5400, 5400, 5400]);
    await waitUntilStable(clock.read, clock.next, { stableFrames: 3 });

    expect(clock.read()).toBe(5400);
    expect(clock.frames).toBeGreaterThanOrEqual(5);
  });

  it("does not count a missing element as a stable position", async () => {
    // Two nulls in a row must not read as "unchanged, therefore settled".
    const clock = scripted([null, null, 800, 800, 800, 800]);
    await waitUntilStable(clock.read, clock.next, { stableFrames: 3 });

    expect(clock.read()).toBe(800);
  });

  it("gives up rather than waiting forever on a page that never settles", async () => {
    let frame = 0;
    const read = () => frame;
    const next = async () => {
      frame += 1;
    };

    await waitUntilStable(read, next, { stableFrames: 3, maxFrames: 10 });

    expect(frame).toBe(10);
  });
});
