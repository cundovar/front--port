import type { RouteLocationNormalized, RouterScrollBehavior } from "vue-router";

/**
 * Arriving at /#contact from another page used to change the URL and leave the
 * visitor at the top: the section belongs to a view that is only mounted once
 * the route changes, so the browser has nothing to scroll to at parse time.
 *
 * Kept free of the router so it can be unit-tested without a DOM.
 */
export const hashScrollTarget = (
  to: Pick<RouteLocationNormalized, "hash">,
): { el: string; behavior: ScrollBehavior } | undefined =>
  to.hash ? { el: to.hash, behavior: "smooth" } : undefined;

/**
 * The element a hash link should really land on.
 *
 * #contact is a whole section: its heading and intro run 491px before the
 * first field, so on a laptop the form sat at the very bottom of the screen
 * and the visitor read "you arrived too high". A section can therefore mark
 * the element worth showing with data-scroll-target, and the anchor in the
 * URL stays the public, readable one.
 *
 * `exists` is injected so the rule can be checked without a DOM.
 */
export const preferredTarget = (hash: string, exists: (selector: string) => boolean): string => {
  const inner = `${hash} [data-scroll-target]`;

  return exists(inner) ? inner : hash;
};

/**
 * Waits until the target stops moving.
 *
 * The home page fetches its projects after mounting, so the cards appear a
 * moment later and push everything below them down. Scrolling as soon as the
 * route changes therefore aimed at a position that no longer existed: coming
 * from /tarifs, /#contact landed some 4000px short, in the middle of the case
 * studies.
 *
 * `readPosition` and `nextFrame` are injected so the rule can be tested
 * without a DOM or a real clock. It gives up after `maxFrames` rather than
 * waiting forever: a page that never settles still gets its scroll, roughly
 * where the browser would have put it anyway.
 */
export const waitUntilStable = async (
  readPosition: () => number | null,
  nextFrame: () => Promise<void>,
  { stableFrames = 3, maxFrames = 120 }: { stableFrames?: number; maxFrames?: number } = {},
): Promise<void> => {
  let previous: number | null = null;
  let stable = 0;

  for (let frame = 0; frame < maxFrames; frame += 1) {
    const current = readPosition();

    if (current !== null && current === previous) {
      stable += 1;
      if (stable >= stableFrames) return;
    } else {
      stable = 0;
    }

    previous = current;
    await nextFrame();
  }
};

/**
 * A frame, or a timer if no frame comes.
 *
 * requestAnimationFrame stops firing in a background tab — and never fired at
 * all in the automation browser this was tested in. Waiting on it alone left
 * the scroll pending forever, so the timer guarantees the loop always
 * advances and the visitor always ends up somewhere.
 */
const animationFrame = (): Promise<void> =>
  new Promise((resolve) => {
    let settled = false;
    const finish = (): void => {
      if (settled) return;
      settled = true;
      resolve();
    };

    requestAnimationFrame(finish);
    setTimeout(finish, 32);
  });

const absoluteTop = (selector: string): number | null => {
  const element = document.querySelector(selector);

  return element ? Math.round(element.getBoundingClientRect().top + window.scrollY) : null;
};

/**
 * The home page header sticks to the top of the viewport, so a section scrolled
 * flush with the top hides its own heading behind it. Measured rather than
 * hardcoded: the bar is two lines tall on a phone and one on a desktop.
 */
const stickyHeaderHeight = (): number => {
  const bar = document.querySelector<HTMLElement>(".top-bar");
  if (!bar) return 0;

  return getComputedStyle(bar).position === "sticky" ? bar.offsetHeight : 0;
};

/** A route change without a hash keeps the behaviour it had: no scroll at all. */
export const scrollBehavior: RouterScrollBehavior = async (to) => {
  const target = hashScrollTarget(to);
  if (!target) return undefined;

  // Resolved after the wait: the marked element may be rendered late too.
  await waitUntilStable(() => absoluteTop(target.el), animationFrame);

  const el = preferredTarget(target.el, (selector) => document.querySelector(selector) !== null);

  return { ...target, el, top: stickyHeaderHeight() + 12 };
};
