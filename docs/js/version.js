/* What the running JavaScript thinks it is.
 *
 * Bumped together with VERSION in sw.js on every deploy, and the two are
 * deliberately *not* derived from each other: sw.js is a classic worker script
 * and can't import an ES module, and a build step to inline one into the other
 * is exactly the kind of thing this app doesn't have.
 *
 * Forgetting to bump one of them isn't silent, though. Settings shows both —
 * this one as "Running", and sw.js's as "Installed", read back from
 * caches.keys(). Drift shows up as two different numbers on the screen, which
 * is also the answer to "is the fix in, or has my phone not caught up?"
 *
 * Xerra carries the same pair. Keep them in step. */
export const VERSION = "v18";
