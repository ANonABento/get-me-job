# Self-Hosting Slothing

Slothing is AGPL-3.0 open source outside `apps/web/src/cloud/`. Self-host builds
run with `SLOTHING_CLOUD=0` or an unset `SLOTHING_CLOUD`, which excludes hosted
Stripe billing routes and proprietary cloud code from the Next.js route graph.

## Quick Start

```bash
git clone https://github.com/ANonABento/slothing.git
cd slothing
pnpm install
cp .env.example apps/web/.env.local
pnpm dev
```

Open `http://localhost:3000`.

For a local single-user install without Google OAuth, set:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
NEXT_PUBLIC_NEXTAUTH_ENABLED=false
SLOTHING_ALLOW_UNAUTHED_DEV=1
SLOTHING_CLOUD=0
TURSO_DATABASE_URL=file:./.local.db
SLOTHING_ENCRYPTION_KEY=
```

Generate secrets with:

```bash
openssl rand -base64 32
```

## Docker Compose

Use the root [`docker-compose.example.yml`](../docker-compose.example.yml) as a
starting point:

```bash
cp .env.example .env
docker compose -f docker-compose.example.yml up --build
```

The example stores the SQLite/libSQL file in a named Docker volume. For a real
deployment, back that volume up before upgrading.

## Environment Variables

Required for self-hosting:

| Variable | Purpose |
| --- | --- |
| `NEXTAUTH_URL` | Public URL for the web app. |
| `NEXTAUTH_SECRET` | Auth.js session signing secret. |
| `TURSO_DATABASE_URL` | `file:./.local.db` for local SQLite/libSQL. |
| `SLOTHING_ENCRYPTION_KEY` | 32-byte base64 key for encrypted BYOK API keys. |
| `SLOTHING_CLOUD` | Leave unset or set `0` for self-host builds. |

Optional:

| Variable | Purpose |
| --- | --- |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth and integrations. |
| `RESEND_API_KEY` | Magic-link email login. |
| `CALENDAR_FEED_SECRET` | Signed calendar feed URLs. |
| `NEXT_PUBLIC_NEXTAUTH_ENABLED=false` | Local dev mode without OAuth. |
| `SLOTHING_ALLOW_UNAUTHED_DEV=1` | Local fallback `default` user. Never use in production. |

Cloud-only variables such as `STRIPE_SECRET_KEY`,
`STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, and
`SLOTHING_HOSTED_LLM_API_KEY` are for slothing.work-style hosted deployments.
Self-hosters do not need them.

## Auth Policy

Slothing does not store local passwords and does not ship a password reset flow.
Configured production sign-in uses Google OAuth, with optional Resend email
magic links when `RESEND_API_KEY` and `EMAIL_FROM` are set. Recovery is handled
by the identity provider or by requesting a fresh magic link.

See [Slothing Auth Policy](./auth-policy.md) for the production policy and
operator notes.

## Bring Your Own Key

Self-hosted Slothing does not include hosted AI credits. Add your provider in
Settings:

1. Open Settings.
2. Pick OpenAI, Anthropic, OpenRouter, or Ollama.
3. Paste the API key or local Ollama base URL.
4. Test connection and save.

Keys are encrypted at rest with `SLOTHING_ENCRYPTION_KEY` before they are stored
in the local database. Ollama can run fully local if you want no third-party LLM
provider.

## Backups

Back up these regularly:

- The libSQL/SQLite database file from `TURSO_DATABASE_URL`.
- Uploaded documents and generated resume HTML under the app data/output
  directory configured by the deployment.
- `.env` or your secret manager entries.

Before upgrading, stop the app, take a database backup, then deploy the new
image or pull the new code.

For hosted Turso backups, restore checks, and Vercel deployment steps, see
[Production Deployment Runbook](./production-deployment-runbook.md).

## Hosted Development Notes

If you are developing the proprietary hosted billing flow, set `SLOTHING_CLOUD=1`
and configure Stripe test keys. For local webhooks:

```bash
stripe listen --forward-to localhost:3000/api/billing/webhook
```

Copy the printed webhook secret into `STRIPE_WEBHOOK_SECRET`.
