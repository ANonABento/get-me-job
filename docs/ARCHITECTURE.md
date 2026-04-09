# Architecture Guidelines

## Goals

- Keep routing, business logic, persistence, and UI concerns separate.
- Make feature work incremental by giving each domain an obvious home.
- Reduce reliance on shared kitchen-sink modules.

## Folder Roles

```text
src/
  app/        # Next.js routes, layouts, route handlers
  components/ # Shared UI and cross-feature composition only
  features/   # Domain modules: interview, jobs, profile, settings, ...
  hooks/      # Cross-feature hooks only
  lib/        # Legacy shared code being migrated
  shared/     # Stable cross-feature config, primitives, and adapters
  types/      # Shared TS interfaces while feature types migrate
```

## Rules

1. `app` should compose, not own business rules.
2. Route handlers should do auth, request parsing, and response mapping only.
3. Feature logic belongs in `src/features/<domain>`.
4. Cross-feature config belongs in `src/shared`, not `src/lib/constants.ts`.
5. Shared UI belongs in `src/components/ui`; domain UI belongs in `src/features/<domain>/components`.
6. Prefer typed helpers for HTTP requests instead of raw `fetch` calls inside large page components.
7. New feature code should avoid adding imports to `@/lib/constants` when a narrower module exists.

## Current Pilot

The first pilot domain is `interview`:

- Schemas and interview-specific constants are moving to `src/features/interview`.
- Settings and provider config are moving to `src/features/settings` and `src/shared/llm`.
- File-system and storage constants are moving to `src/shared`.

Follow the pilot pattern before creating new top-level conventions.
