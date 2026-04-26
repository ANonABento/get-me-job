# Vercel Deployment

This project deploys to Vercel from GitHub Actions.

## GitHub Actions secrets

Add these repository secrets in GitHub before enabling deploys:

- `VERCEL_TOKEN`: Vercel account or team token with access to the project.
- `VERCEL_ORG_ID`: Vercel team or user ID.
- `VERCEL_PROJECT_ID`: Vercel project ID.

You can create the `.vercel/project.json` file locally with `npx vercel link`,
then read `orgId` and `projectId` from that generated file. The `.vercel/`
directory is intentionally ignored.

## Vercel environment variables

Configure the app runtime variables in the Vercel project for both Preview and
Production environments:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`
- `DATABASE_URL`
- At least one LLM provider variable: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`,
  `OPENROUTER_API_KEY`, or `OLLAMA_BASE_URL`

## Deployment flow

- Same-repository pull requests to `main` run type-checks, unit tests, lint, and
  then create a Vercel Preview deployment. The workflow posts or updates a PR
  comment with the preview URL. Forked pull requests still run CI, but do not
  deploy because GitHub does not expose repository secrets to those runs.
- Pushes to `main` run the same verification and then create a Vercel
  Production deployment.
- `workflow_dispatch` is available for manual verification runs. It does not
  deploy unless it is a `pull_request` or `push` to `main` event.
