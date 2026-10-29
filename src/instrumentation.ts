/**
 * Server start-up instrumentation.
 *
 * Next.js calls `register()` once per server instance in *every* runtime it
 * builds for (Node.js and Edge). Two consequences drive this file's shape:
 *
 *   1. Any top-level import is statically linked into every runtime's bundle.
 *      The Prisma client uses Node built-ins (`node:url`), so importing DB code
 *      at the top level drags that graph into the Edge build and triggers a
 *      "not supported in Edge Runtime" warning.
 *   2. The documented fix is to import runtime-specific code *inside* `register`
 *      behind a `NEXT_RUNTIME` guard, so Edge never even parses the Node path.
 *
 * This is why the work below uses a dynamic `await import()` rather than a
 * top-level import: Edge exits before the imports resolve, so the Prisma/DB
 * graph never enters the Edge bundle.
 */

export async function register(): Promise<void> {
  // Only run in the Node.js runtime. Edge has no `setInterval`-backed DB access
  // and no Prisma, so there is nothing to initialise there.
  if (process.env.NEXT_RUNTIME !== 'nodejs') {
    return;
  }

  // Dynamic import keeps the Prisma/DB graph out of every non-Node bundle.
  const { assertSecureEnv } = await import('@/lib/env');
  const { logger } = await import('@/lib/logger');

  // Fail fast: refuse to serve production traffic with a development/placeholder
  // secret or a SQLite database. Throws during boot so a misconfigured
  // deployment never comes up insecure.
  assertSecureEnv();

  // Guard the periodic maintenance behind the production-build phase check so
  // the build worker doesn't start timers it will never drain.
  if (process.env.NEXT_PHASE !== 'phase-production-build') {
    const { pruneRateLimits } = await import('@/lib/rate-limit');

    const MAINTENANCE_INTERVAL_MS = 60 * 60 * 1000; // hourly

    // Keep the rate-limit table from growing without bound. unref() so the
    // timer never holds the process open during shutdown.
    const timer = setInterval(() => {
      pruneRateLimits().catch((error: unknown) => {
        logger.warn({ err: error }, 'rate-limit prune failed');
      });
    }, MAINTENANCE_INTERVAL_MS);
    timer.unref?.();
  }

  logger.info('novara-city server booted');
}
