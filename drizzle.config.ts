import { defineConfig } from 'drizzle-kit';
import { loadEnvConfig } from '@next/env';
import { getDatabaseUrl } from './src/lib/db/database-url';

loadEnvConfig(process.cwd());

export default defineConfig({
  schema: './src/lib/db/drizzle/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: getDatabaseUrl(),
  },
});
