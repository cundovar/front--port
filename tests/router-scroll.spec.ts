import { describe, expect, it } from "vitest";
import { hashScrollTarget } from "../src/utils/routerScroll";

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
