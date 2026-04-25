import { describe, it, expect, beforeEach } from "vitest";
import {
  ENV_EXAMPLE_FILE,
  FEATURE_CHECKS,
  checkFeature,
  getFeatureStatuses,
  validateEnv,
  logEnvValidation,
  ensureEnvValidated,
  __resetEnvValidationForTests,
} from "./env";

function createLogger() {
  const warnings: string[] = [];
  const infos: string[] = [];
  return {
    warn: (msg: string) => warnings.push(msg),
    info: (msg: string) => infos.push(msg),
    warnings,
    infos,
  };
}

describe("checkFeature", () => {
  it("reports enabled when all requireAll keys are set", () => {
    const result = checkFeature(
      {
        name: "Clerk",
        requireAll: ["CLERK_PK", "CLERK_SK"],
      },
      { CLERK_PK: "pk", CLERK_SK: "sk" }
    );
    expect(result.enabled).toBe(true);
    expect(result.missing).toEqual([]);
  });

  it("reports disabled with missing keys when requireAll keys are absent", () => {
    const result = checkFeature(
      {
        name: "Clerk",
        requireAll: ["CLERK_PK", "CLERK_SK"],
      },
      { CLERK_PK: "pk" }
    );
    expect(result.enabled).toBe(false);
    expect(result.missing).toEqual(["CLERK_SK"]);
  });

  it("treats empty strings as missing", () => {
    const result = checkFeature(
      {
        name: "Clerk",
        requireAll: ["CLERK_PK"],
      },
      { CLERK_PK: "   " }
    );
    expect(result.enabled).toBe(false);
    expect(result.missing).toEqual(["CLERK_PK"]);
  });

  it("reports enabled when any requireAny key is set", () => {
    const result = checkFeature(
      {
        name: "LLM",
        requireAny: ["OPENAI_API_KEY", "ANTHROPIC_API_KEY"],
      },
      { ANTHROPIC_API_KEY: "sk-ant" }
    );
    expect(result.enabled).toBe(true);
    expect(result.missing).toEqual([]);
  });

  it("reports disabled when no requireAny key is set", () => {
    const result = checkFeature(
      {
        name: "LLM",
        requireAny: ["OPENAI_API_KEY", "ANTHROPIC_API_KEY"],
      },
      {}
    );
    expect(result.enabled).toBe(false);
    expect(result.missing).toEqual(["OPENAI_API_KEY", "ANTHROPIC_API_KEY"]);
  });
});

describe("getFeatureStatuses", () => {
  it("returns a status for every feature check by default", () => {
    const statuses = getFeatureStatuses({});
    expect(statuses).toHaveLength(FEATURE_CHECKS.length);
    for (const status of statuses) {
      expect(status.enabled).toBe(false);
    }
  });

  it("returns all enabled when full env is provided", () => {
    const statuses = getFeatureStatuses({
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk",
      CLERK_SECRET_KEY: "sk",
      DATABASE_URL: "postgresql://localhost/db",
      OPENAI_API_KEY: "sk-openai",
    });
    for (const status of statuses) {
      expect(status.enabled).toBe(true);
    }
  });
});

describe("validateEnv", () => {
  it("returns ok=true with no warnings when all features enabled", () => {
    const result = validateEnv({
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk",
      CLERK_SECRET_KEY: "sk",
      DATABASE_URL: "postgresql://localhost/db",
      OLLAMA_BASE_URL: "http://localhost:11434",
    });
    expect(result.ok).toBe(true);
    expect(result.warnings).toEqual([]);
  });

  it("returns ok=false with warnings listing missing keys and referencing .env.example", () => {
    const result = validateEnv({});
    expect(result.ok).toBe(false);
    expect(result.warnings.length).toBeGreaterThan(0);
    for (const warning of result.warnings) {
      expect(warning).toContain(ENV_EXAMPLE_FILE);
    }
  });

  it("produces a Clerk warning that names both Clerk keys", () => {
    const result = validateEnv({
      DATABASE_URL: "postgresql://localhost/db",
      OPENAI_API_KEY: "sk-openai",
    });
    const clerkWarning = result.warnings.find((w) =>
      w.includes("Clerk Authentication")
    );
    expect(clerkWarning).toBeDefined();
    expect(clerkWarning).toContain("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
    expect(clerkWarning).toContain("CLERK_SECRET_KEY");
    // requireAll: both keys are needed, so wording must NOT say "one of"
    expect(clerkWarning).not.toContain("one of");
  });

  it("uses 'missing one of' wording only for requireAny features", () => {
    const result = validateEnv({});
    const llmWarning = result.warnings.find((w) => w.includes("LLM Providers"));
    const clerkWarning = result.warnings.find((w) =>
      w.includes("Clerk Authentication")
    );
    expect(llmWarning).toContain("missing one of:");
    expect(clerkWarning).not.toContain("one of");
  });

  it("produces an LLM warning listing all provider options", () => {
    const result = validateEnv({
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk",
      CLERK_SECRET_KEY: "sk",
      DATABASE_URL: "postgresql://localhost/db",
    });
    const llmWarning = result.warnings.find((w) => w.includes("LLM Providers"));
    expect(llmWarning).toBeDefined();
    expect(llmWarning).toContain("OPENAI_API_KEY");
    expect(llmWarning).toContain("ANTHROPIC_API_KEY");
    expect(llmWarning).toContain("OPENROUTER_API_KEY");
    expect(llmWarning).toContain("OLLAMA_BASE_URL");
  });
});

describe("logEnvValidation", () => {
  it("logs a single info when all features enabled and no warnings", () => {
    const logger = createLogger();
    logEnvValidation(logger, {
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk",
      CLERK_SECRET_KEY: "sk",
      DATABASE_URL: "postgresql://localhost/db",
      OPENAI_API_KEY: "sk-openai",
    });
    expect(logger.warnings).toEqual([]);
    expect(logger.infos).toHaveLength(1);
    expect(logger.infos[0]).toContain("All feature env vars configured");
  });

  it("logs a warning per disabled feature and no info", () => {
    const logger = createLogger();
    logEnvValidation(logger, {});
    expect(logger.infos).toEqual([]);
    expect(logger.warnings.length).toBe(FEATURE_CHECKS.length);
  });
});

describe("ensureEnvValidated", () => {
  beforeEach(() => {
    __resetEnvValidationForTests();
  });

  it("runs validation on first call", () => {
    const logger = createLogger();
    const result = ensureEnvValidated(logger, {});
    expect(result).toBeDefined();
    expect(logger.warnings.length).toBeGreaterThan(0);
  });

  it("is idempotent — subsequent calls are no-ops", () => {
    const logger1 = createLogger();
    ensureEnvValidated(logger1, {});
    const logger2 = createLogger();
    const result = ensureEnvValidated(logger2, {});
    expect(result).toBeUndefined();
    expect(logger2.warnings).toEqual([]);
    expect(logger2.infos).toEqual([]);
  });
});
