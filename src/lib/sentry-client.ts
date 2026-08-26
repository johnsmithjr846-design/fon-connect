import * as Sentry from "@sentry/react";

let initialized = false;

export function initSentry() {
  if (typeof window === "undefined" || initialized) return;
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0,
    // Only error monitoring for now — no session replay / performance tracing,
    // keep the footprint minimal until we decide those are worth the cost.
  });
  initialized = true;
}

export function captureClientError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  Sentry.captureException(error, { extra: context });
}
