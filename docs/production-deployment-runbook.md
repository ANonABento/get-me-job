# Production Deployment Runbook

This runbook covers the current hosted path for Slothing: Next.js on Vercel,
libSQL/Turso for the database, NextAuth/Auth.js for sign-in, and Vercel Cron for
scheduled work.

## Production Turso Setup

Install and authenticate the Turso CLI:

```bash
turso auth login
```

Create the production database and token:

```bash
turso db create slothing-prod
turso db show slothing-prod
turso db tokens create slothing-prod
```

Store the returned values as production secrets:

```env
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
```

Slothing's `apps/web/drizzle.config.ts` switches to Drizzle Kit's Turso dialect
when `TURSO_DATABASE_URL` uses a remote `libsql://`, `https://`, or `wss://`
URL, and includes `TURSO_AUTH_TOKEN` when present.

Reference:

- https://docs.turso.tech/cli/introduction
- https://orm.drizzle.team/docs/drizzle-config-file

## Production Migrations

Run migrations from the web app package after production database secrets are
available in the shell:

```bash
cd apps/web
TURSO_DATABASE_URL=libsql://... \
TURSO_AUTH_TOKEN=... \
pnpm db:migrate
```

Verify the schema with a read-only shell query:

```bash
turso db shell slothing-prod "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name;"
turso db shell slothing-prod "SELECT COUNT(*) FROM user;"
```

Do not use `db:push` against production unless intentionally bypassing checked-in
migrations during an incident. The normal production path is checked-in Drizzle
migrations plus `pnpm db:migrate`.

## SQLite To Turso Migration

For a local single-user SQLite/libSQL file such as `apps/web/.local.db`:

1. Stop the local app so no writes happen during export.
2. Dump the local database:

```bash
sqlite3 apps/web/.local.db ".dump" > slothing-local.sql
```

3. Create an empty Turso database:

```bash
turso db create slothing-prod
```

4. Load the dump:

```bash
turso db shell slothing-prod < slothing-local.sql
```

5. Run checked-in migrations to bring the database to the current app version:

```bash
cd apps/web
TURSO_DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... pnpm db:migrate
```

6. Smoke-check the app with the production `TURSO_DATABASE_URL` and
   `TURSO_AUTH_TOKEN`.

If migrating from an existing Turso database instead of a local file, Turso's
shell supports `.dump` export and loading the dump into a new database.

Reference:

- https://docs.turso.tech/cli/db/shell
- https://docs.turso.tech/local-development

## Backup And Restore Plan

Before every production migration or deploy with schema changes:

```bash
turso db shell slothing-prod .dump > backups/slothing-prod-$(date +%Y%m%d-%H%M%S).sql
```

Verify each backup by restoring it into a disposable database:

```bash
turso db create slothing-restore-check
turso db shell slothing-restore-check < backups/slothing-prod-YYYYMMDD-HHMMSS.sql
turso db shell slothing-restore-check "SELECT COUNT(*) FROM user;"
```

For point-in-time recovery, create a new database from the production database at
the target timestamp, then rotate `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` to
the restored database:

```bash
turso db create slothing-prod-restore \
  --from-db slothing-prod \
  --timestamp 2026-05-18T12:00:00Z
```

After restore:

1. Generate a token for the restored database.
2. Update the hosted environment secrets.
3. Redeploy or restart the app.
4. Verify sign-in, dashboard load, document export, and cron status.
5. Keep the old database until the incident is closed.

Reference:

- https://docs.turso.tech/features/point-in-time-recovery
- https://docs.turso.tech/cli/db/shell

## Vercel Deployment Checklist

Project setup:

- Root Directory: `apps/web`.
- Install command: `pnpm install --frozen-lockfile` from the repo root, or the
  Vercel/Turborepo equivalent already configured for the monorepo.
- Build command: `pnpm build`.
- Output: Next.js default.

Required production env vars:

```env
NEXTAUTH_URL=https://your-production-domain
NEXTAUTH_SECRET=...
NEXT_PUBLIC_NEXTAUTH_ENABLED=true
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
SLOTHING_ENCRYPTION_KEY=...
CRON_SECRET=...
CALENDAR_FEED_SECRET=...
WELCOME_EMAIL_SECRET=...
SLOTHING_CLOUD=0
```

Optional production env vars:

```env
RESEND_API_KEY=...
EMAIL_FROM="Slothing <noreply@your-domain>"
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...
OPENROUTER_API_KEY=...
SENTRY_DSN=...
NEXT_PUBLIC_SENTRY_DSN=...
```

Pre-deploy checks:

```bash
pnpm --dir apps/web check:production
pnpm --dir apps/web type-check
pnpm --filter @slothing/web test:run
pnpm --filter @slothing/mcp test:run
```

`check:production` fails on unsafe hosted env state such as local database URLs,
disabled public auth, missing Turso tokens, missing production secrets, invalid
BYOK encryption key length, or enabled unauthenticated dev mode. It emits
warnings for missing owner emails or missing Sentry DSNs.

Post-deploy checks:

- `/sign-in` shows Google sign-in, not the disabled-auth card.
- Google OAuth callback succeeds.
- `/api/settings/status` returns expected integration state.
- A dashboard page loads under an authenticated session.
- Resume/document export works.
- `/api/admin/evals` and cron status are owner-gated.
- Vercel crons are present from `apps/web/vercel.json`.
- Cron routes accept only `Authorization: Bearer ${CRON_SECRET}` in production.
- Error monitoring receives a test event or captures a controlled route error.
