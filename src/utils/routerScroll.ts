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

/** A route change without a hash keeps the behaviour it had: no scroll at all. */
export const scrollBehavior: RouterScrollBehavior = (to) => hashScrollTarget(to);
