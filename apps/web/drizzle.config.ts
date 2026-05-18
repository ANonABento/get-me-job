import { defineConfig } from "drizzle-kit";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const url = process.env.TURSO_DATABASE_URL?.trim() || "file:./.local.db";
const authToken = process.env.TURSO_AUTH_TOKEN?.trim();
const isRemoteTurso = /^(libsql|https|wss):\/\//.test(url);
const baseConfig = {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
} as const;

export default isRemoteTurso
  ? defineConfig({
      ...baseConfig,
      dialect: "turso",
      dbCredentials: authToken ? { url, authToken } : { url },
    })
  : defineConfig({
      ...baseConfig,
      dialect: "sqlite",
      dbCredentials: { url },
    });
