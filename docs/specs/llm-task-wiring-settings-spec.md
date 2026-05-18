# LLM Task Wiring and Settings Exposure Spec

**Status:** audit/spec
**Last updated:** 2026-05-18
**Related specs:**
- [`../bentorouter-migration-spec.md`](../bentorouter-migration-spec.md)
- [`../bentorouter-additions-spec.md`](../bentorouter-additions-spec.md)
- [`template-import-style-config.md`](./template-import-style-config.md)

## Summary

Slothing has three different AI execution modes today:

- **Heuristic:** no LLM required.
- **Optional LLM:** use LLM when configured, but deterministic fallback exists.
- **Needs LLM:** the feature is fundamentally generative/rewrite/chat and should be blocked until an LLM provider or managed credits are available.

Several routes are currently wired as hard LLM gates even though their libraries already have heuristic fallbacks. This creates false "no LLM provider configured" failures, especially in Studio template import.

The BentoRouter migration should expose this task matrix in Settings so users can see which tasks are enabled, which will use deterministic fallback, and which require provider configuration or managed credits.

## Current BentoRouter Status

As of this audit, BentoRouter is not yet the Slothing runtime. The repo still uses the hand-rolled `LLMClient`, `gateAiFeature`, `gateOptionalAiFeature`, and legacy single-provider settings.

Existing specs are ready but not implemented:

- `docs/bentorouter-migration-spec.md` defines replacing `LLMClient` with BentoRouter and using per-task routing.
- `docs/bentorouter-additions-spec.md` defines BentoRouter-side runtime provider CRUD, provider config persistence, encryption hooks, admin UI additions, and a legacy config migration helper.

The task wiring table below should become the seed data for BentoRouter task policies and the Settings "AI task routing" surface.

## Settings UX Requirement

Settings should show every AI-adjacent task with:

- Task name and product surface.
- Execution mode: `Heuristic`, `Optional LLM`, or `Needs LLM`.
- Current availability: configured provider, managed credits, or deterministic fallback.
- Active model/policy when BentoRouter is available.
- Fallback behavior and whether provider credits are consumed.
- A warning chip for routes currently blocked by bad hard-gate wiring.

Users should not need to infer from errors whether a task truly needs an LLM.

## Task Wiring Table

| Task / Flow | Surface / Route | Current Wiring | Correct Mode | Action |
|---|---|---:|---:|---|
| Studio template import, PDF/DOCX/TEX | `POST /api/templates/import` | Blocked by LLM | Optional LLM | Replace hard gate with optional/no gate. Pass `null` to extractor when no provider. |
| Template text analyze | `POST /api/templates/analyze` | Blocked by LLM | Optional LLM | `analyzeTemplateWithLLM(text, null)` already has heuristic fallback. |
| Studio tailor analysis | `POST /api/tailor`, `action=analyze` | Heuristic | Heuristic | No change. |
| Studio template render | `POST /api/tailor`, `action=render` | Heuristic | Heuristic | No change. |
| Studio tailor generate from bank | `POST /api/tailor`, `action=generate` | Blocked by LLM | Optional LLM | Use optional gate. `generateFromBank(..., null)` already returns deterministic base resume. |
| Opportunity resume generate | `POST /api/opportunities/[id]/generate` | Optional LLM | Optional LLM | Good. Keep fallback reporting. |
| Opportunity match analysis | `POST /api/opportunities/[id]/analyze` | Optional LLM | Optional LLM | Good. Keep basic keyword fallback. |
| Resume parse, basic mode | `POST /api/parse`, `mode=basic` | Heuristic | Heuristic | No change. |
| Resume parse, AI mode | `POST /api/parse`, `mode=ai` | Optional LLM | Optional LLM | Good. Falls back to smart parser. |
| Upload/document classification | `POST /api/upload` | Optional LLM | Optional LLM | Good. Classifier falls back to content/filename heuristics. |
| Opportunity create legacy schema keyword extraction | `POST /api/opportunities` legacy job body | Blocked by LLM | Optional LLM | Use optional gate or skip gate; route already has `extractKeywordsBasic`. |
| Email generate, template mode | `POST /api/email/generate`, `useLLM=false` | Heuristic/template | Heuristic/template | No change. |
| Email generate, LLM requested | `POST /api/email/generate`, `useLLM=true` | Blocked by LLM | Optional LLM | If no provider, fall back to template and return `usedLLM: false`. |
| Salary negotiation script | `POST /api/salary/negotiate` | Blocked by LLM | Optional LLM | Use optional gate; route already has `generateFallbackScript`. |
| Learning paths base | `GET /api/learning/paths?enhance=false` | Heuristic | Heuristic | No change. |
| Learning paths enhanced | `GET /api/learning/paths?enhance=true` | Blocked by LLM | Optional LLM | If no provider, return base paths with enhancement unavailable metadata. |
| Interview start questions | `POST /api/interview/start` | Blocked by LLM | Optional LLM | Use optional gate; route has default question fallback. |
| Interview answer feedback | `POST /api/interview/answer` | Blocked by LLM | Optional LLM | Use optional gate; route has basic feedback fallback. |
| Interview follow-up question | `POST /api/interview/followup` | Blocked by LLM | Optional LLM | Use optional gate; route has `generateBasicFollowUp`. |
| Interview prep guide | `GET /api/interview/prep-guide` | Blocked by LLM | Optional LLM | Use optional gate; `generatePrepGuide(..., null)` has basic fallback. |
| Opportunity cover letter, non-stream | `POST /api/opportunities/[id]/cover-letter` | Blocked by LLM | Optional LLM | Use optional gate; route has basic cover-letter fallback. Fix `usedLLM` flag on fallback. |
| Opportunity cover letter stream | `POST /api/opportunities/[id]/cover-letter/stream` | Needs LLM | Needs LLM | Streaming token generation should remain blocked without provider/credits. |
| Cover letter generate/revise/rewrite | `POST /api/cover-letter/generate` | Needs LLM | Needs LLM | Helpers require `LLMConfig`; no deterministic rewrite/generation fallback today. |
| Cover letter critique | `POST /api/ai/critique-cover-letter` | Needs LLM | Needs LLM | No heuristic critique equivalent. |
| Document assistant rewrite selection | `POST /api/documents/assistant` | Needs LLM | Needs LLM | Rewrite action is LLM-native. |
| Tailor autofix | `POST /api/tailor/autofix` | Needs LLM | Needs LLM | Rewrites resume sections via LLM. |
| Extension chat | `POST /api/extension/chat` | Needs LLM | Needs LLM | Chat assistant correctly returns setup guidance when no provider is configured. |
| Retrieval resume generation | `POST /api/resume/generate` | Needs LLM | Needs LLM | Retrieval query expansion/ranking pipeline currently requires LLM config. |

## Remediation Plan

### Phase 1: Fix false blockers

Convert the routes below from `gateAiFeature` to `gateOptionalAiFeature`, or avoid gating entirely when the request can run deterministic-only:

1. `POST /api/templates/import`
2. `POST /api/templates/analyze`
3. `POST /api/tailor`, `action=generate`
4. `POST /api/opportunities` legacy keyword extraction
5. `POST /api/email/generate`, `useLLM=true`
6. `POST /api/salary/negotiate`
7. `GET /api/learning/paths?enhance=true`
8. `POST /api/interview/start`
9. `POST /api/interview/answer`
10. `POST /api/interview/followup`
11. `GET /api/interview/prep-guide`
12. `POST /api/opportunities/[id]/cover-letter`

Each fixed route should return explicit metadata such as:

```json
{
  "usedLLM": false,
  "fallbackUsed": true,
  "fallbackReason": "provider_not_configured"
}
```

### Phase 2: Add task registry

Create a Slothing-local task registry before the full BentoRouter migration:

```ts
type TaskExecutionMode = "heuristic" | "optional_llm" | "needs_llm";

interface SlothingAiTask {
  id: string;
  label: string;
  surface: string;
  mode: TaskExecutionMode;
  route?: string;
  fallbackDescription?: string;
}
```

This registry should power Settings and later map directly to BentoRouter task IDs/policies.

### Phase 3: Settings UI

Add an "AI tasks" or "Task routing" section in Settings:

- Group by product surface: Studio, Opportunities, Cover Letters, Interview, Email, Extension, Learning.
- Show task mode and current availability.
- For optional tasks, show the deterministic fallback.
- For needs-LLM tasks, link to provider setup.
- For BentoRouter, show selected model/policy per task.

### Phase 4: BentoRouter migration

When BentoRouter additions are available:

- Replace local task registry with BentoRouter task registry/policies.
- Migrate existing single-provider settings using `migrateLegacyLLMConfig()`.
- Preserve the `mode` field in Slothing task metadata. BentoRouter decides model routing; Slothing still decides whether a task can run without a model.

## Acceptance Criteria

- A user with no LLM provider can import templates, run deterministic tailor generation, use interview defaults, generate salary scripts, and create opportunities without false billing/provider errors.
- Settings clearly shows which tasks are heuristic, optional LLM, and needs LLM.
- Optional LLM routes return structured fallback metadata.
- Needs LLM routes still return clear provider setup guidance.
- BentoRouter task policies can be seeded from this table without re-auditing route behavior.
