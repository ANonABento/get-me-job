# Slothing — AI Agent Instructions

> AI-powered job application assistant built with Next.js 14, TypeScript, and Tailwind CSS.
> Tagline: **You're not lazy. Your job search system is.**

The product is branded **Slothing** (domain: slothing.work). The repo path is still `get-me-job` and the data file `data/get-me-job.db` for backwards compatibility — both names refer to the same app. Prefer "Slothing" in user-facing copy, "get-me-job" for repo-relative paths and the SQLite filename. Browser localStorage keys still use the `taida:` prefix to preserve existing user data.

---

## Project Overview

**Slothing** helps job seekers manage their entire application process:
- Resume parsing and AI-powered tailoring
- Unified Document Studio for resumes and cover letters
- Opportunity tracking (jobs + hackathons) with status pipeline
- Add Opportunity wizard with URL auto-scrape
- Interview prep (voice + text) with AI feedback
- Cover letter drafting and editing
- Analytics, calendar, salary tools, email templates
- Columbus browser extension for in-page job capture
- **Google Integration**: Calendar sync, Drive import/backup, Gmail import/send, Docs/Sheets export, Contacts, Tasks

**Target users:** Early-career professionals seeking jobs.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS + CSS Variables (semantic tokens only — see lint rule) |
| Components | Shadcn/ui patterns (CVA) |
| Database | Drizzle ORM with libSQL/SQLite |
| Auth | Clerk (with local-dev fallback to a `default` user) |
| LLM | Multi-provider (OpenAI, Anthropic, Ollama, OpenRouter) |
| Editor | TipTap (resume + cover letter) |
| Icons | Lucide React |
| Testing | Vitest (unit) + Playwright (e2e) |

---

## Project Structure

```
src/
├── app/
│   ├── (app)/              # Authenticated app routes
│   │   ├── dashboard/
│   │   ├── upload/
│   │   ├── profile/
│   │   ├── bank/           # Documents + knowledge bank manager
│   │   ├── studio/         # Unified resume + cover letter editor
│   │   ├── opportunities/  # Opportunity tracker (jobs + hackathons)
│   │   │   └── review/     # Review queue for scraped/incoming opportunities
│   │   ├── builder/        # Legacy → redirects to /studio
│   │   ├── tailor/         # Legacy → redirects to /studio
│   │   ├── cover-letter/   # Legacy → redirects to /studio
│   │   ├── interview/
│   │   ├── calendar/
│   │   ├── emails/
│   │   ├── analytics/
│   │   ├── salary/
│   │   ├── extension/      # Columbus extension companion pages
│   │   └── settings/
│   ├── (marketing)/        # Public marketing pages
│   ├── api/                # API routes
│   └── globals.css         # Theme & semantic CSS variables
├── components/
│   ├── ui/                 # Base UI (Button, Card, ConfirmDialog, Toast, etc.)
│   ├── layout/             # Sidebar, navigation
│   ├── studio/             # Document Studio shell, panels, save-status
│   ├── builder/            # Reusable section controls used inside Studio
│   ├── opportunities/      # Add-opportunity wizard, review queue, actions
│   ├── format/             # TimeAgo and other display helpers
│   └── [feature]/          # Feature-specific components
├── lib/
│   ├── db/                 # Schema, migrations, queries (better-sqlite3)
│   ├── llm/                # LLM provider abstraction
│   ├── builder/            # Studio state, export, version history
│   ├── editor/             # TipTap JSON, rendering, HTML conversion
│   ├── format/             # Time, locale, pluralize helpers
│   ├── text/               # pluralize() and text utilities
│   ├── opportunities/      # Opportunity domain logic + scrape pipeline
│   ├── resume/             # Resume parsing/generation
│   ├── ats/                # ATS score analysis
│   ├── interview/          # Interview prep logic
│   ├── seo.ts              # Per-route SEO metadata helpers
│   ├── auth.ts             # Clerk auth + local-dev fallback
│   ├── upload-conflict.ts  # Dedupe conflict messaging
│   ├── rate-limit.ts       # Sliding-window rate limiter
│   ├── api-utils.ts        # Shared API error helpers
│   ├── constants/          # JOB_STATUSES, schemas, paths, tokens, etc.
│   └── utils.ts
├── hooks/                  # React hooks (use-undoable-action, use-error-toast, …)
└── types/
```

---

## Navigation Routes

| Route | Purpose |
|-------|---------|
| `/` | Marketing landing page |
| `/dashboard` | Main app dashboard with stats |
| `/upload` | Resume upload and parsing |
| `/profile` | Profile editor (contact, experience, education, skills) |
| `/bank` | Documents + knowledge bank manager |
| `/studio` | Document Studio for resumes and cover letters |
| `/opportunities` | Opportunity tracker (jobs + hackathons) — single source of truth |
| `/opportunities/[id]` | Opportunity detail (status, dismiss, linked docs) |
| `/opportunities/review` | Review queue for scraped/extension/inbound opportunities |
| `/interview` | Interview prep (text/voice modes) |
| `/calendar` | Calendar with interviews and deadlines |
| `/emails` | Email template generator |
| `/analytics` | Progress tracking and metrics |
| `/salary` | Salary research and offer tracking |
| `/settings` | LLM provider + preferences |
| `/builder`, `/tailor`, `/cover-letter` | Legacy → 308 redirect to `/studio` |
| `/jobs` | **Removed** — consolidated into `/opportunities` |

---

## Document Studio Architecture

`/studio` is the only in-app workspace for building application documents. Resume and cover letter creation share one header, file panel, document canvas, and AI assistant area. After T4, the layout uses collapsible drawers, a scalable template picker, and a persistent save-status indicator.

```
src/app/(app)/studio/page.tsx
├── Header
│   ├── Resume / Cover Letter mode tabs
│   ├── Template picker
│   ├── Save status indicator (saving · saved · error)
│   └── Copy HTML / Download PDF actions
├── Left drawer (collapsible)
│   ├── Files for the active document type
│   ├── Version history
│   └── Knowledge bank sections + entry picker
├── Center
│   └── Document preview / TipTap editor
└── Right drawer (collapsible)
    └── AI Assistant
```

### Studio Files

`StudioDocument` state in `src/app/(app)/studio/page.tsx`:
- `id` — document identity
- `name` — user-visible file name
- `mode` — `resume` or `cover_letter`
- `templateId` — selected visual template
- `selectedEntryIds` — knowledge bank entries used in the draft
- `sections` — resume section order and visibility

The file panel filters by the active Resume/Cover Letter tab so each document type has its own file list while staying inside `/studio`.

### Version History

Snapshots use helpers in `src/lib/builder/version-history.ts`. Version state is normalized before comparison or persistence, supports manual and automatic snapshot metadata, is capped at `MAX_BUILDER_VERSIONS`, and is stored in browser storage with keys formatted as `taida:builder:versions:<document-id>`.

### TipTap Editor

TipTap document JSON is the editor data contract:
- Bank entries → TipTap: `src/lib/editor/bank-to-tiptap.ts`
- Cover letter entries → TipTap: `src/lib/editor/cover-letter-tiptap.ts`
- Editor: `src/lib/editor/resume-editor.tsx`
- HTML export: `src/lib/editor/document-html.ts`
- Studio preview shell: `src/components/studio/resume-preview.tsx`

### AI Panel

The right-hand Studio panel is reserved for contextual AI assistance. Keep AI document actions scoped to the active Studio file and document mode so resume and cover letter workflows remain part of the same route.

---

## Database Schema

**Location:** `src/lib/db/schema.ts`. SQLite via better-sqlite3, Drizzle config in `drizzle.config.ts`.

Tables (selected):
- `profile`, `experiences`, `education`, `skills`, `projects`, `certifications` — profile data
- `documents` — uploaded files with `file_hash` (sha256) for dedupe
- `profile_bank`, `profile_versions`, `chunks`, `chunks_vec` — knowledge bank + embeddings
- `jobs` — opportunities (table is still named `jobs`; UX layer calls them "opportunities")
- `generated_resumes`, `cover_letters`, `email_drafts`
- `interview_sessions`, `interview_answers`
- `analytics_snapshots`, `job_status_history`
- `salary_offers`, `ats_scan_history`
- `custom_templates`, `prompt_variants`, `prompt_variant_results`
- `extension_sessions`, `learned_answers`, `field_mappings` — Columbus extension
- `reminders`, `notifications`, `company_research`, `resume_ab_tracking`, `settings`

### Dedupe constraints (T1)
- `documents` has a `file_hash` column with `idx_documents_user_file_hash` to short-circuit re-uploads of identical files.
- `chunks` has a unique index `idx_chunks_user_hash` on `(user_id, hash)` so identical bank chunks cannot be inserted twice.
- `profile_bank` has `idx_profile_bank_user_source` so source-document dedupe is fast.
- Backfill + schema bootstrap lives in `src/lib/db/dedupe-backfill.ts` (`ensureDedupeSchema`, `runDedupeBackfillMigration`).
- Activity feed dedupes by stable hash IDs in `src/components/dashboard/recent-activity.tsx`.

### Ownership / multi-user readiness
Every user-owned table has `user_id TEXT NOT NULL DEFAULT 'default'` plus a `idx_<table>_user_id` index. Migrations in `schema.ts` backfill `user_id` from `profile_id` or joined `jobs.user_id`. `lib/auth.ts` resolves the current user via Clerk; without Clerk env vars it falls back to the `default` local user (also overridable via the `x-get-me-job-e2e-user` header for E2E).

---

## API Routes

### Profile / Bank
- `GET/PUT /api/profile`
- `POST /api/parse`, `POST /api/upload`, `POST /api/builder`
- `GET/POST /api/bank`, `DELETE /api/bank/[id]`, `DELETE /api/bank/documents`

### Opportunities
- `GET/POST /api/opportunities` — list/create
- `GET/PATCH/DELETE /api/opportunities/[id]`
- `POST /api/opportunities/scrape` — URL auto-scrape used by the Add Opportunity wizard
- `POST /api/opportunities/from-extension` — Columbus extension ingest
- `GET /api/opportunities/templates`
- `GET/POST/PATCH /api/jobs/*` — legacy aliases that share the `jobs` table

### Document Studio
- `POST /api/tailor` — analyze JD and generate a tailored resume from the bank
- `POST /api/tailor/autofix` — rewrite highlighted resume gaps
- `POST /api/cover-letter/generate` — generate or revise cover letter content

### Interview
- `POST /api/interview/start`, `/answer`, `/sessions`

### Analytics
- `GET /api/analytics`, `/trends`, `/export`

Other route trees: `/api/ats`, `/api/backup`, `/api/calendar`, `/api/email`, `/api/extension`, `/api/google`, `/api/import`, `/api/insights`, `/api/learning`, `/api/notifications`, `/api/prompts`, `/api/recommendations`, `/api/reminders`, `/api/research`, `/api/resume`, `/api/resumes`, `/api/salary`, `/api/settings`, `/api/templates`.

All LLM-touching routes are wrapped with the sliding-window limiter from `src/lib/rate-limit.ts`. Errors flow through `src/lib/api-utils.ts`.

---

## Design System

### Semantic tokens (T3)

After the T3 token migration, raw color names are forbidden in source. Use semantic CSS variable classes only:
- Surfaces: `bg-background`, `bg-card`, `bg-paper`, `bg-muted`, `bg-popover`
- Text: `text-foreground`, `text-muted-foreground`, `text-primary`, `text-destructive`
- Borders: `border-border`, `border-input`, `border-primary`
- Brand: `--primary` teal, `--accent` blue, `--success` green, `--destructive` red, `--warning` orange
- Both `:root` (light) and `.dark` token sets live in `src/app/globals.css`

### Forbidden hardcoded colors (hard-fail lint)

`scripts/forbidden-color-lint.cjs` runs as part of `npm run lint` and fails on:
- Tailwind color utilities like `bg-white`, `bg-black`, `text-gray-500`, `bg-slate-900`, etc.
- Inline style props (`backgroundColor`, `color`, `fill`, `borderColor`, …) with hex/rgb/hsl/named colors
- Arbitrary values like `bg-[#fff]` or `text-[rgb(0,0,0)]`

`var(--token)`, `transparent`, and `inherit` are allowed. **Never** add a hardcoded `bg-white`, `bg-black`, or grayscale class — the lint will fail CI. If you need a neutral surface, pick `bg-card`, `bg-paper`, `bg-background`, or `bg-muted`.

### Component patterns

```tsx
// Buttons
<Button variant="default">Primary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button size="pill">Pill CTA</Button>

// Cards
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

---

## Coding Conventions

### Destructive actions (T8) — REQUIRED

All user-facing destructive actions MUST follow `docs/destructive-actions-pattern.md`. No exceptions. Bare-click destruction is never acceptable. Two patterns:

- **Pattern A — Confirm dialog:** hard deletes, bulk deletes, settings/account resets, anything irreversible. Use the `useConfirmDialog` hook from `src/components/ui/confirm-dialog.tsx`.
- **Pattern B — Optimistic undo snackbar:** reversible status changes / soft deletes where productivity matters. Use `useUndoableAction` from `src/hooks/use-undoable-action.ts`. Default undo window is 5 seconds.

When you add a new destructive action, also append a row to the **Current Actions** table in `docs/destructive-actions-pattern.md` and add a test for the confirm/undo flow.

### Pluralization, time, IDs (T6)

- Use `pluralize(count, "Job")` from `src/lib/text/pluralize.ts` instead of inline `count === 1 ? "Job" : "Jobs"`.
- Display times via `<TimeAgo />` from `src/components/format/time-ago.tsx` or the helpers in `src/lib/format/time.ts` (`formatDateAbsolute`, `formatDateRelative`, `normalizeLocale`). Never `Date.toLocaleString()` inline — locale is user-configurable.
- Hash-based IDs (activity feed, dedupe) must come from a stable hash; never re-derive a fresh ID from `Math.random()`.

### TypeScript / React
- Strict mode. Explicit types on function parameters; prefer `interface` for objects, `type` for unions/primitives.
- Functional components only. Named exports. Colocate component-specific types.
- Use `cn()` from `src/lib/utils.ts` for conditional classes.

### File naming
- Components: `PascalCase.tsx`
- Utilities: `kebab-case.ts`
- Tests: `*.test.ts` / `*.test.tsx`, colocated with source

### Imports
```tsx
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { LocalComponent } from "./local";
```

### CSS
- Tailwind utilities first, semantic tokens only (see lint rule above).
- CSS variables for theme values; both light + `.dark` defined in `globals.css`.
- No inline color styles.

### SEO

Per-route metadata lives in `src/lib/seo.ts`. Page components are client-side, so titles/descriptions are wired through route `layout.tsx` files. When adding a new route, register an entry in `src/lib/seo.ts` and export `metadata` from the layout.

---

## LLM Integration

**Client:** `src/lib/llm/client.ts`

Supports OpenAI (default), Anthropic, Ollama (local), OpenRouter.

```tsx
import { generateText, generateJSON } from "@/lib/llm/client";

const result = await generateText(prompt, systemPrompt);
const data = await generateJSON<MyType>(prompt, schema);
```

Configuration: `/settings` page persists provider config in `settings` table. Endpoints are rate-limited.

---

## Testing

### Unit Tests (Vitest)

```bash
npm run test       # watch
npm run test:run   # one-shot (used in CI + by quality scripts)
```

Tests are colocated with source as `*.test.ts(x)`. Studio, version history, document export, dedupe schema, opportunities review queue, undoable actions, confirm dialogs, pluralize, time formatting, SEO helpers, and route redirects all have unit coverage.

### E2E Tests (Playwright)

```bash
npm run test:e2e
npx playwright test --ui
```

Tests live in `e2e/`. Columbus extension has its own E2E pipeline under `columbus-extension/tests/`.

### Test pattern

```tsx
import { describe, it, expect } from "vitest";

describe("MyFunction", () => {
  it("does the thing", () => {
    expect(myFunction()).toBe(expected);
  });
});
```

---

## CI Gates

`.github/workflows/ci.yml` runs on every PR and push to main:
1. `npm run type-check` — strict TS via `tsconfig.typecheck.json`
2. `npm run test:run` — full Vitest run
3. `npm run lint` — `next lint` **and** the forbidden-color hard-fail lint

A pre-commit Husky hook runs `npm run lint-staged` + `npm run type-check`. Don't bypass with `--no-verify`.

The Columbus extension has a separate workflow (`.github/workflows/extension-e2e.yml`).

---

## Common Tasks

### Adding a new page
1. Route in `src/app/(app)/[route]/page.tsx`.
2. Sidebar entry in `src/components/layout/sidebar.tsx`.
3. SEO entry in `src/lib/seo.ts` and `metadata` export in route `layout.tsx`.
4. API routes in `src/app/api/`.

### Updating Document Studio
1. Studio UX stays under `src/app/(app)/studio/page.tsx`.
2. Reusable Studio UI in `src/components/studio/` or `src/components/builder/`.
3. State, export, version history, TipTap helpers in `src/lib/builder/` or `src/lib/editor/`.
4. Update colocated unit tests for any changed helper or behavior.

### Adding a new UI component
1. Create in `src/components/ui/[component].tsx`.
2. Use CVA for variants if needed.
3. Export from the file.

### Adding a database table
1. Add to `src/lib/db/schema.ts` (CREATE TABLE IF NOT EXISTS).
2. Add a column-level migration block when changing existing tables (use `PRAGMA table_info` + `ALTER TABLE` patterns).
3. Queries in `src/lib/db/[table].ts`. Always scope by `user_id`.
4. Add `idx_<table>_user_id` and any user-scoped uniqueness indexes.

### Adding a destructive action
1. Decide hard delete vs. soft delete vs. status change.
2. Pattern B only when the reverse mutation is known and tested; otherwise Pattern A.
3. Add a row to the Current Actions table in `docs/destructive-actions-pattern.md`.
4. Write a confirm/undo test.

### Updating theme tokens
1. Edit CSS variables in `src/app/globals.css` — both `:root` and `.dark`.
2. Tailwind picks up changes automatically.
3. Never reach for raw hex/rgb in source — the lint will fail.

---

## Performance

- Heavy page components are lazy-loaded with `next/dynamic` (`src/app/(app)/opportunities/page.tsx`, Studio, etc.).
- Studio drawers are virtualization-friendly and don't re-render on unrelated state.
- DB queries are synchronous via better-sqlite3; WAL mode is enabled with a 5s `busy_timeout` for parallel test workers.
- LLM endpoints use a sliding-window rate limiter to avoid bursting providers.
- Activity feed and dedupe paths use stable hash IDs to avoid spurious React reconciliations.

---

## Common pitfalls / things future agents miss

1. **Never add `bg-white`, `bg-black`, or `text-gray-*` (or any forbidden grayscale family) anywhere in `src/`.** `npm run lint` calls `scripts/forbidden-color-lint.cjs`, which is a hard fail in CI. Pick `bg-card`, `bg-paper`, `bg-background`, `bg-muted`, or another semantic token. Same applies to inline `style={{ color: "#fff" }}` — use a CSS variable.
2. **Destructive actions need a confirm dialog or undo snackbar.** Don't ship a bare `<Button onClick={() => deleteX()}>`. Read `docs/destructive-actions-pattern.md` first and update its Current Actions table when you add or change a destructive flow.
3. **`/jobs` no longer exists.** It was consolidated into `/opportunities` in T2. The DB table is still named `jobs`, and `/api/jobs/*` routes still work as legacy aliases — but UI navigation must point at `/opportunities`. Don't add a sidebar item for `/jobs`.
4. **`/builder`, `/tailor`, `/cover-letter` are redirect-only.** All resume + cover letter editing happens in `/studio`. If you find yourself building UI in those routes, you're in the wrong place.
5. **Don't reach into `Math.random()` for IDs.** Use `crypto.randomBytes()` (server) or stable hashes (client/dedupe). The activity feed and dedupe pipeline rely on stable IDs.
6. **Don't write inline pluralization or `Date.toLocaleString()` calls.** Use `pluralize()` and the `format/time` helpers / `<TimeAgo />`. Locale is user-configurable.
7. **Always scope DB queries by `user_id`.** Even in single-user dev mode the schema requires it. `lib/auth.ts` resolves it via Clerk or the local-dev fallback.
8. **Schema changes are additive migrations, not rewrites.** Use the `PRAGMA table_info` + `ALTER TABLE ... ADD COLUMN` pattern already in `schema.ts`. Don't drop and recreate; existing dev DBs depend on it.
9. **The `documents.file_hash` and `chunks` unique-hash indexes exist for dedupe (T1).** When ingesting new documents or bank chunks, hash first and short-circuit on collision instead of inserting blindly.
10. **`/opportunities/review` is the inbound queue for scraped/extension opportunities.** New ingestion paths (URL scrape, Columbus extension, future integrations) should land in the review queue first — not directly in the tracked list.
11. **Pre-commit hook runs lint-staged + type-check.** If a hook fails, fix the underlying problem; don't pass `--no-verify`.
12. **`docs/architecture.md` (lowercase)** is the canonical architecture doc. There used to be an uppercase `ARCHITECTURE.md` referencing the old "Columbus" name — it has been replaced.

---

## Development Commands

```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Production build
npm run lint         # ESLint + forbidden-color hard-fail
npm run type-check   # TypeScript strict check
npm run test         # Vitest watch
npm run test:run     # Vitest one-shot (CI)
npm run test:e2e     # Playwright e2e
```

---

## Known Limitations

1. **Single-user mode by default** — Clerk is wired up; multi-user persistence is still being completed.
2. **SQLite database** — Drizzle schema is ready for PostgreSQL migration.
3. **Local storage** — Data persists in `data/get-me-job.db`.
4. **No email sending** — templates are generated but not delivered.
5. **Partial external integrations** — Google integration exists; LinkedIn and other providers are not implemented.

See `ROADMAP.md` for planned improvements.

---

## Recent Improvements (Session shipped May 2026)

- **T1 — Dedupe pipeline:** file uploads (sha256 `documents.file_hash`), bank entries (chunk hash uniqueness), and dashboard activity feed now dedupe correctly. Closed #218–#222.
- **T2 — Routes consolidation:** `/jobs` removed; everything moved to `/opportunities`. `/api/jobs/*` kept as legacy alias.
- **T3 — Token migration + hard-fail lint:** all hardcoded grayscale/hex colors removed from `src/`; `scripts/forbidden-color-lint.cjs` enforces semantic tokens in CI.
- **T4 — Studio overhaul:** collapsible drawers, scalable template picker, persistent save status, save-status tests.
- **T5 — Add Opportunity wizard:** 4-step flow with URL auto-scrape via `/api/opportunities/scrape`.
- **T6 — Pluralize / TimeAgo / hash IDs:** introduced `pluralize()`, `<TimeAgo />`, locale-aware time formatting; gated activity-feed IDs on stable hashes.
- **T7 — Marketing cleanup:** landing page polish + SEO metadata.
- **T8 — Destructive actions convention:** full audit, hybrid Confirm Dialog / Undo Snackbar pattern; documented in `docs/destructive-actions-pattern.md`.
- **T9b / T9c — Polish bundles:** analytics, calendar, salary, emails refinements.
- **Perf:** lazy imports for heavy pages, dynamic component splitting in Studio + Opportunities.
- **SEO:** per-route metadata via `src/lib/seo.ts`.
- **CI gates:** type-check + test:run + lint (incl. forbidden-color) on every PR.

---

## Environment Variables

Create `.env.local`:

```env
# LLM Providers (at least one required)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
OPENROUTER_API_KEY=sk-or-...

# Optional: Ollama (local)
OLLAMA_BASE_URL=http://localhost:11434

# Optional: Clerk auth (omit for local-dev single-user mode)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

---

## Troubleshooting

### "Database locked" error
SQLite WAL contention. Restart dev server. Tests increase `busy_timeout` to 5s for parallel workers.

### LLM not responding
Check API key in Settings or `.env.local`. Watch for rate-limit responses from `src/lib/rate-limit.ts`.

### Styles not updating
Clear `.next` cache: `rm -rf .next && npm run dev`.

### Forbidden-color lint failing
Find the offending file/line in the lint output and replace with a semantic token (`bg-card`, `bg-muted`, etc.). See **Common pitfalls** #1.

### Type errors after schema change
Restart the TypeScript server.

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/app/globals.css` | Theme colors and CSS variables |
| `src/lib/db/schema.ts` | Database table definitions and migrations |
| `src/lib/db/dedupe-backfill.ts` | T1 dedupe schema bootstrap + backfill |
| `src/lib/llm/client.ts` | LLM provider abstraction |
| `src/lib/auth.ts` | Clerk auth + local-dev fallback |
| `src/lib/seo.ts` | Per-route SEO metadata |
| `src/lib/format/time.ts` | Locale-aware time formatting |
| `src/lib/text/pluralize.ts` | `pluralize(count, singular, plural?)` |
| `src/lib/api-utils.ts` | API error response utilities |
| `src/lib/rate-limit.ts` | Rate limiting for API routes |
| `src/app/(app)/studio/page.tsx` | Unified Document Studio |
| `src/app/(app)/opportunities/page.tsx` | Opportunity tracker (jobs + hackathons) |
| `src/components/opportunities/add-opportunity-wizard.tsx` | T5 Add Opportunity wizard |
| `src/components/studio/save-status.ts` | Studio save-status state machine |
| `src/components/studio/resume-preview.tsx` | TipTap preview shell |
| `src/components/format/time-ago.tsx` | `<TimeAgo />` component |
| `src/components/ui/confirm-dialog.tsx` | Pattern A confirm dialog |
| `src/hooks/use-undoable-action.ts` | Pattern B optimistic undo |
| `src/lib/builder/version-history.ts` | Studio version snapshot helpers |
| `src/lib/builder/document-export.ts` | Studio print/PDF export |
| `src/lib/editor/bank-to-tiptap.ts` | Knowledge bank → TipTap |
| `src/lib/editor/resume-editor.tsx` | TipTap resume editor |
| `src/components/layout/sidebar.tsx` | Main navigation |
| `src/components/ui/button.tsx` | Button + variants |
| `scripts/forbidden-color-lint.cjs` | Hard-fail color lint |
| `tailwind.config.ts` | Tailwind config |
| `docs/architecture.md` | Architecture overview + Mermaid diagrams |
| `docs/destructive-actions-pattern.md` | T8 destructive-action convention |
| `ROADMAP.md` | Development roadmap |
