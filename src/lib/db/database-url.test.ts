import { describe, expect, it } from "vitest";
import { DATABASE_URL_ENV_VAR, getDatabaseUrl } from "./database-url";

describe("getDatabaseUrl", () => {
  it("returns a trimmed PostgreSQL connection string", () => {
    expect(
      getDatabaseUrl({
        [DATABASE_URL_ENV_VAR]:
          "  postgresql://user:password@example.neon.tech/app?sslmode=require  ",
      })
    ).toBe("postgresql://user:password@example.neon.tech/app?sslmode=require");
  });

  it("accepts the postgres protocol alias", () => {
    expect(
      getDatabaseUrl({
        [DATABASE_URL_ENV_VAR]: "postgres://user:password@example.com/app",
      })
    ).toBe("postgres://user:password@example.com/app");
  });

  it("throws when DATABASE_URL is missing", () => {
    expect(() => getDatabaseUrl({})).toThrow(
      "DATABASE_URL environment variable is not set"
    );
  });

  it("throws when DATABASE_URL is not PostgreSQL", () => {
    expect(() =>
      getDatabaseUrl({ [DATABASE_URL_ENV_VAR]: "sqlite://local.db" })
    ).toThrow("DATABASE_URL must be a valid PostgreSQL connection string");
  });
});

