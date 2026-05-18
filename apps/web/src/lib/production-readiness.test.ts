import { describe, expect, it } from "vitest";
import { getProductionReadinessReport } from "./production-readiness";

const productionEnv = {
  NEXTAUTH_URL: "https://app.example.com",
  NEXTAUTH_SECRET: "nextauth-secret",
  NEXT_PUBLIC_NEXTAUTH_ENABLED: "true",
  GOOGLE_CLIENT_ID: "google-client-id",
  GOOGLE_CLIENT_SECRET: "google-client-secret",
  TURSO_DATABASE_URL: "libsql://slothing-prod.turso.io",
  TURSO_AUTH_TOKEN: "turso-token",
  SLOTHING_ENCRYPTION_KEY: Buffer.alloc(32, 1).toString("base64"),
  CRON_SECRET: "cron-secret",
  CALENDAR_FEED_SECRET: "calendar-secret",
  WELCOME_EMAIL_SECRET: "welcome-secret",
  OWNER_EMAILS: "owner@example.com",
  SENTRY_DSN: "https://public@example.com/1",
};

describe("getProductionReadinessReport", () => {
  it("passes with production-ready hosted env", () => {
    const report = getProductionReadinessReport(productionEnv);
    expect(report.ok).toBe(true);
    expect(report.findings).toEqual([]);
  });

  it("fails closed for local dev shortcuts and local database URLs", () => {
    const report = getProductionReadinessReport({
      ...productionEnv,
      NEXTAUTH_URL: "http://localhost:3000",
      NEXT_PUBLIC_NEXTAUTH_ENABLED: "false",
      TURSO_DATABASE_URL: "file:./.local.db",
      SLOTHING_ALLOW_UNAUTHED_DEV: "1",
    });

    expect(report.ok).toBe(false);
    expect(report.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "NEXTAUTH_URL", level: "error" }),
        expect.objectContaining({
          key: "NEXT_PUBLIC_NEXTAUTH_ENABLED",
          level: "error",
        }),
        expect.objectContaining({ key: "TURSO_DATABASE_URL", level: "error" }),
        expect.objectContaining({
          key: "SLOTHING_ALLOW_UNAUTHED_DEV",
          level: "error",
        }),
      ]),
    );
  });

  it("warns but does not fail when owner email and Sentry are absent", () => {
    const report = getProductionReadinessReport({
      ...productionEnv,
      OWNER_EMAILS: "",
      SENTRY_DSN: "",
    });

    expect(report.ok).toBe(true);
    expect(report.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "OWNER_EMAILS", level: "warning" }),
        expect.objectContaining({ key: "SENTRY_DSN", level: "warning" }),
      ]),
    );
  });

  it("requires Stripe and hosted LLM keys for cloud builds", () => {
    const report = getProductionReadinessReport({
      ...productionEnv,
      SLOTHING_CLOUD: "1",
    });

    expect(report.ok).toBe(false);
    expect(report.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "STRIPE_SECRET_KEY", level: "error" }),
        expect.objectContaining({
          key: "STRIPE_WEBHOOK_SECRET",
          level: "error",
        }),
        expect.objectContaining({
          key: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
          level: "error",
        }),
        expect.objectContaining({
          key: "SLOTHING_HOSTED_LLM_API_KEY",
          level: "error",
        }),
      ]),
    );
  });
});
