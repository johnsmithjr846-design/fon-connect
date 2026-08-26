// Minimal Sentry reporter using the raw Envelope API via fetch, instead of
// @sentry/node (which relies on Node APIs unavailable in the Cloudflare
// Workers runtime this app deploys to). Fire-and-forget: never block or
// throw on the caller's behalf.

function parseDsn(dsn: string): { postUrl: string; publicKey: string } | undefined {
  try {
    const url = new URL(dsn);
    const projectId = url.pathname.replace(/^\//, "");
    const host = url.host;
    return {
      postUrl: `https://${host}/api/${projectId}/envelope/`,
      publicKey: url.username,
    };
  } catch {
    return undefined;
  }
}

export function captureServerException(error: unknown, extra: Record<string, unknown> = {}) {
  const dsn = process.env["SENTRY_DSN"];
  if (!dsn) return;
  const parsed = parseDsn(dsn);
  if (!parsed) return;

  const err = error instanceof Error ? error : new Error(String(error));
  const eventId = crypto.randomUUID().replace(/-/g, "");
  const now = new Date().toISOString();

  const event = {
    event_id: eventId,
    timestamp: now,
    platform: "javascript",
    environment: process.env["NODE_ENV"] ?? "production",
    exception: {
      values: [
        {
          type: err.name || "Error",
          value: err.message,
          stacktrace: err.stack ? { frames: parseStack(err.stack) } : undefined,
        },
      ],
    },
    extra,
  };

  const envelopeHeader = JSON.stringify({ event_id: eventId, sent_at: now, dsn });
  const itemHeader = JSON.stringify({ type: "event" });
  const body = `${envelopeHeader}\n${itemHeader}\n${JSON.stringify(event)}\n`;

  fetch(parsed.postUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-sentry-envelope",
      "X-Sentry-Auth": `Sentry sentry_version=7, sentry_key=${parsed.publicKey}, sentry_client=fonconnect-edge/1.0`,
    },
    body,
  }).catch(() => {
    // Never let monitoring itself take down the request.
  });
}

function parseStack(stack: string): Array<{ function?: string; filename?: string }> {
  return stack
    .split("\n")
    .slice(1, 30)
    .map((line) => ({ function: line.trim() }));
}
