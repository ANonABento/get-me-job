import { nowIso } from "@/lib/format/time";

type EnvSource = Record<string, string | undefined>;

export function getSentryDsn(env: EnvSource = process.env): string | null {
  return env.SENTRY_DSN?.trim() || env.NEXT_PUBLIC_SENTRY_DSN?.trim() || null;
}

export function isErrorMonitoringConfigured(
  env: EnvSource = process.env,
): boolean {
  return Boolean(getSentryDsn(env));
}

export function captureException(
  error: unknown,
  context: Record<string, unknown> = {},
): void {
  const dsn = getSentryDsn();
  if (!dsn) return;

  const event = buildMonitoringEvent(error, context);
  void sendSentryEvent(dsn, event).catch((sendError) => {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[monitoring] Failed to send error event:", sendError);
    }
  });
}

export function initializeErrorMonitoring(): void {
  if (!isErrorMonitoringConfigured()) return;
  console.info("[monitoring] Error monitoring configured");
}

function buildMonitoringEvent(
  error: unknown,
  context: Record<string, unknown>,
): Record<string, unknown> {
  const err = error instanceof Error ? error : new Error(String(error));
  return {
    event_id: crypto.randomUUID().replaceAll("-", ""),
    timestamp: nowIso(),
    platform: "javascript",
    level: "error",
    exception: {
      values: [
        {
          type: err.name,
          value: err.message,
          stacktrace: err.stack
            ? { frames: err.stack.split("\n").slice(0, 40) }
            : undefined,
        },
      ],
    },
    extra: context,
  };
}

async function sendSentryEvent(
  dsn: string,
  event: Record<string, unknown>,
): Promise<void> {
  const parsed = parseSentryDsn(dsn);
  if (!parsed) return;

  const envelopeHeader = JSON.stringify({
    sent_at: nowIso(),
    dsn,
  });
  const itemHeader = JSON.stringify({ type: "event" });
  const body = `${envelopeHeader}\n${itemHeader}\n${JSON.stringify(event)}`;

  await fetch(parsed.envelopeUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-sentry-envelope" },
    body,
  });
}

function parseSentryDsn(dsn: string): { envelopeUrl: string } | null {
  try {
    const url = new URL(dsn);
    const projectId = url.pathname.replace(/^\//, "");
    if (!projectId) return null;
    return {
      envelopeUrl: `${url.protocol}//${url.host}/api/${projectId}/envelope/`,
    };
  } catch {
    return null;
  }
}
