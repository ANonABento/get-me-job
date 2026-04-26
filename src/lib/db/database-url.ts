export const DATABASE_URL_ENV_VAR = "DATABASE_URL";

type EnvSource = Record<string, string | undefined>;

export function getDatabaseUrl(env: EnvSource = process.env): string {
  const databaseUrl = env[DATABASE_URL_ENV_VAR]?.trim();

  if (!databaseUrl) {
    throw new Error(
      `${DATABASE_URL_ENV_VAR} environment variable is not set. Add your Neon PostgreSQL connection string to .env.local or your deployment environment.`
    );
  }

  try {
    const parsed = new URL(databaseUrl);
    if (parsed.protocol !== "postgresql:" && parsed.protocol !== "postgres:") {
      throw new Error("invalid protocol");
    }
  } catch {
    throw new Error(
      `${DATABASE_URL_ENV_VAR} must be a valid PostgreSQL connection string.`
    );
  }

  return databaseUrl;
}

