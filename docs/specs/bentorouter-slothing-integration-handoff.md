# BentoRouter Slothing Integration Handoff

**Status:** handoff-ready
**Last updated:** 2026-05-18
**Related specs:**
- [`../bentorouter-migration-spec.md`](../bentorouter-migration-spec.md)
- [`../bentorouter-additions-spec.md`](../bentorouter-additions-spec.md)
- [`llm-task-wiring-settings-spec.md`](./llm-task-wiring-settings-spec.md)
- [`template-import-style-config.md`](./template-import-style-config.md)

## Local Repo Status

BentoRouter exists locally at:

```text
/home/anonabento/bento-router
```

It points at:

```text
https://github.com/ANonABento/bento-router.git
```

The local package is `@anonabento/bento-router` version `0.2.0`.

Verification run from `/home/anonabento/bento-router`:

```bash
npm run type-check
npm test
```

Both passed. The BentoRouter-side BYOK/runtime-provider additions appear to be present:

- `ProviderConfigStore`, `MemoryProviderConfigStore`, and `JsonFileProviderConfigStore`.
- Runtime provider CRUD on `createBentoRouterApi()`.
- Provider validation helpers.
- Encryption adapter support in the API options/runtime provider config path.
- `migrateLegacyLLMConfig()`.
- Provider-aware `BentoRouterAdminPage`.
- Admin theming docs.

This means the next work is primarily **Slothing integration**, not BentoRouter implementation.

## Slothing Current State

Slothing now has an interim AI task registry at:

```text
apps/web/src/lib/llm/tasks.ts
```

It seeds task IDs, labels, surfaces, routes, execution modes, fallback descriptions, and tentative `bentoTaskId` mappings.

Settings now includes a local task-routing section at:

```text
apps/web/src/components/settings/ai-task-routing-section.tsx
apps/web/src/app/[locale]/(app)/settings/page.tsx
```

The false hard-gate blockers listed in `llm-task-wiring-settings-spec.md` have been converted to optional/deterministic fallback behavior. The full BentoRouter runtime has not yet replaced `LLMClient`.

## Integration Work Remaining

### 1. Add BentoRouter dependency

Add BentoRouter to `apps/web/package.json`, pinned to the local-v0.2.0 source or a post-v0.2.0 Git SHA:

```bash
pnpm --filter @slothing/web add @anonabento/bento-router@github:ANonABento/bento-router#<sha>
```

For local dogfooding, a workspace/file dependency may be acceptable, but the mergeable state should pin a Git SHA.

### 2. Add Slothing task definitions for BentoRouter

Create BentoRouter-native task definitions from `SLOTHING_AI_TASKS` plus the 10 task surface IDs from `docs/bentorouter-migration-spec.md`.

Expected file:

```text
apps/web/src/lib/llm/bentorouter-tasks.ts
```

Requirements:

- Register Slothing task IDs like `slothing.parse_resume`, `slothing.tailor_resume`, `slothing.cover_letter_generate`, and `slothing.answer_generate`.
- Preserve Slothing-local execution mode metadata separately. BentoRouter routes model calls; Slothing decides whether a route may run without a model.
- Keep the mapping from Slothing API task registry IDs to BentoRouter task IDs explicit and test-covered.

### 3. Add BentoRouter client wrapper

Create:

```text
apps/web/src/lib/llm/bentorouter-client.ts
```

Requirements:

- Embedded mode first.
- Remote mode can be a typed stub unless `BENTO_ROUTER_URL` is already ready.
- Use `JsonFileProviderConfigStore`, `JsonFilePolicyStore`, and `JsonFileUsageStore`.
- Default storage root: `~/.slothing/bento-router/`.
- Provide a Slothing encryption adapter derived from `NEXTAUTH_SECRET`.
- Register Slothing tasks on construction.
- Expose a small Slothing wrapper API for route handlers and Settings admin data.

### 4. Migrate legacy settings

Create:

```text
apps/web/src/lib/llm/migrate-legacy.ts
```

Requirements:

- Use BentoRouter `migrateLegacyLLMConfig()`.
- Translate existing `user.settings.llm` `{ provider, apiKey, baseUrl, model }`.
- Register the provider in BentoRouter when an API key exists.
- Apply per-task policies for all registered Slothing BentoRouter tasks.
- Make migration idempotent. If no persisted migration flag exists yet, use BentoRouter provider/policy existence checks to avoid duplicates.

### 5. Settings integration

Keep the current local AI Task Routing section, then add BentoRouter-backed provider/policy management once the wrapper exists.

Requirements:

- Show current local task execution modes regardless of BentoRouter availability.
- Show BentoRouter model/policy data for tasks when available.
- Embed `BentoRouterAdminPage` or compose a Slothing wrapper around it.
- Use Slothing styling through documented `--bento-router-*` CSS variables.
- Do not reintroduce the old single global provider mental model.

### 6. Route migration strategy

Do not sweep every LLM call in one risky patch unless tests are broad enough. Prefer a compatibility wrapper first:

- Keep `LLMClient` available as a temporary adapter.
- Internally route `complete()` and `stream()` through BentoRouter where the callsite can supply a task ID.
- Migrate callsites route-by-route to native `router.run({ task, messages, userId })`.

Needs-LLM routes must remain blocked without a provider or managed credits. Optional-LLM routes must preserve deterministic fallback behavior and metadata.

### 7. Tests and verification

Add or update tests for:

- Task registry to BentoRouter task-policy mapping.
- Legacy settings migration.
- Encryption adapter round trip and decrypt-failure behavior.
- Settings provider/policy UI render path.
- Optional routes still return fallback metadata without a configured provider.
- Needs-LLM routes still do not silently pretend to work.

Required commands:

```bash
pnpm --filter @slothing/web exec vitest run <targeted test files>
pnpm --filter @slothing/web lint
pnpm --filter @slothing/web exec tsc -p tsconfig.typecheck.json --noEmit --pretty false
```

## Handoff Prompt

```text
/goal Implement the Slothing BentoRouter integration.

Use these source-of-truth docs:
- docs/specs/bentorouter-slothing-integration-handoff.md
- docs/bentorouter-migration-spec.md
- docs/bentorouter-additions-spec.md
- docs/specs/llm-task-wiring-settings-spec.md

Context:
- BentoRouter exists locally at /home/anonabento/bento-router.
- BentoRouter local package is @anonabento/bento-router v0.2.0.
- From /home/anonabento/bento-router, `npm run type-check` and `npm test` pass.
- Slothing already has fallback fixes and an interim AI task registry in apps/web/src/lib/llm/tasks.ts.
- Do not fake integration. Use the real BentoRouter APIs if adding the dependency is possible.

Deliverables:
1. Add @anonabento/bento-router to apps/web, pinned to a stable Git SHA or an explicit local dependency for dogfooding.
2. Add Slothing BentoRouter task definitions and mapping from the local SLOTHING_AI_TASKS registry to BentoRouter task IDs.
3. Add apps/web/src/lib/llm/bentorouter-client.ts for embedded mode using JsonFileProviderConfigStore, JsonFilePolicyStore, JsonFileUsageStore, and Slothing encryption derived from NEXTAUTH_SECRET.
4. Add apps/web/src/lib/llm/migrate-legacy.ts using BentoRouter migrateLegacyLLMConfig(), with idempotent legacy settings migration.
5. Add Settings provider/policy management using BentoRouterAdminPage or a thin Slothing wrapper, while preserving the local task-routing section.
6. Start route migration conservatively: keep optional deterministic fallback routes working, keep Needs LLM routes blocked, and use a temporary compatibility layer if needed before sweeping LLMClient callsites.
7. Add tests for task mapping, migration, encryption, Settings admin render, optional fallback metadata, and Needs LLM blocking.

Verification:
- Run targeted Vitest files for the changed areas.
- Run `pnpm --filter @slothing/web lint`.
- Run `pnpm --filter @slothing/web exec tsc -p tsconfig.typecheck.json --noEmit --pretty false`.

Important:
- The worktree may be dirty; do not revert unrelated user changes.
- Keep template import in Studio/template picker, not Components upload.
- Optional LLM routes may fall back only where a real deterministic path exists.
- Needs LLM tasks must not silently pretend to work without a provider or managed credits.
```
