type EnvSource = Record<string, string | undefined>;

export type ProductionReadinessLevel = "error" | "warning";

export interface ProductionReadinessFinding {
  level: ProductionReadinessLevel;
  key: string;
  message: string;
}

export interface ProductionReadinessReport {
  ok: boolean;
  findings: ProductionReadinessFinding[];
}

const REQUIRED_KEYS = [
  "NEXTAUTH_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "TURSO_AUTH_TOKEN",
  "SLOTHING_ENCRYPTION_KEY",
  "CRON_SECRET",
  "CALENDAR_FEED_SECRET",
  "WELCOME_EMAIL_SECRET",
] as const;

const REMOTE_TURSO_PROTOCOLS = ["libsql:", "https:", "wss:"];

function isSet(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isHttpsUrl(value: string | undefined): boolean {
  if (!isSet(value)) return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function isRemoteTursoUrl(value: string | undefined): boolean {
  if (!isSet(value)) return false;
  try {
    return REMOTE_TURSO_PROTOCOLS.includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

function isBase64Bytes(value: string | undefined, expectedBytes: number) {
  if (!isSet(value)) return false;
  try {
    return Buffer.from(value, "base64").length === expectedBytes;
  } catch {
    return false;
  }
}

function addMissingRequiredFindings(
  findings: ProductionReadinessFinding[],
  env: EnvSource,
) {
  for (const key of REQUIRED_KEYS) {
    if (!isSet(env[key])) {
      findings.push({
        level: "error",
        key,
        message: `${key} is required for production deployments.`,
      });
    }
  }
}

export function getProductionReadinessReport(
  env: EnvSource = process.env,
): ProductionReadinessReport {
  const findings: ProductionReadinessFinding[] = [];

  addMissingRequiredFindings(findings, env);

  if (!isHttpsUrl(env.NEXTAUTH_URL)) {
    findings.push({
      level: "error",
      key: "NEXTAUTH_URL",
      message: "NEXTAUTH_URL must be an https:// production URL.",
    });
  }

  if (env.NEXT_PUBLIC_NEXTAUTH_ENABLED !== "true") {
    findings.push({
      level: "error",
      key: "NEXT_PUBLIC_NEXTAUTH_ENABLED",
      message: "NEXT_PUBLIC_NEXTAUTH_ENABLED must be true in production.",
    });
  }

  if (!isRemoteTursoUrl(env.TURSO_DATABASE_URL)) {
    findings.push({
      level: "error",
      key: "TURSO_DATABASE_URL",
      message:
        "TURSO_DATABASE_URL must point at a remote Turso/libSQL database in production.",
    });
  }

  if (!isBase64Bytes(env.SLOTHING_ENCRYPTION_KEY, 32)) {
    findings.push({
      level: "error",
      key: "SLOTHING_ENCRYPTION_KEY",
      message: "SLOTHING_ENCRYPTION_KEY must be a base64-encoded 32-byte key.",
    });
  }

  if (env.SLOTHING_ALLOW_UNAUTHED_DEV === "1") {
    findings.push({
      level: "error",
      key: "SLOTHING_ALLOW_UNAUTHED_DEV",
      message:
        "SLOTHING_ALLOW_UNAUTHED_DEV must never be enabled in production.",
    });
  }

  if (!isSet(env.OWNER_EMAIL) && !isSet(env.OWNER_EMAILS)) {
    findings.push({
      level: "warning",
      key: "OWNER_EMAILS",
      message:
        "OWNER_EMAIL or OWNER_EMAILS should be configured for owner-gated admin routes.",
    });
  }

  if (!isSet(env.SENTRY_DSN) && !isSet(env.NEXT_PUBLIC_SENTRY_DSN)) {
    findings.push({
      level: "warning",
      key: "SENTRY_DSN",
      message: "Set SENTRY_DSN or NEXT_PUBLIC_SENTRY_DSN to receive errors.",
    });
  }

  if (env.SLOTHING_CLOUD === "1") {
    const stripeKeys = [
      "STRIPE_SECRET_KEY",
      "STRIPE_WEBHOOK_SECRET",
      "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
      "SLOTHING_HOSTED_LLM_API_KEY",
    ];
    for (const key of stripeKeys) {
      if (!isSet(env[key])) {
        findings.push({
          level: "error",
          key,
          message: `${key} is required when SLOTHING_CLOUD=1.`,
        });
      }
    }
  }

  return {
    ok: findings.every((finding) => finding.level !== "error"),
    findings,
  };
}
