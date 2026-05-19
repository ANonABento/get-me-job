# Opportunity customization — spec

**Status:** Spec — implementation-ready in phases
**Last updated:** 2026-05-19
**Surface:** `/opportunities`, `/opportunities/review`, `/opportunities/kanban`, extension popup + options
**Companion:** [`destructive-actions-pattern.md`](./destructive-actions-pattern.md), [`ui-redesign-plan.md`](./ui-redesign-plan.md)
**Owner:** TBD

---

## 1. Goal

The bulk-scrape pipeline now imports 50+ postings at a time with rich posting-level metadata (`openings`, `applicants`, `level`, `workTerm`, `source`, etc.). The review queue currently shows that data with a fixed presentation. **This spec covers letting users shape that presentation and the underlying pipeline behavior to their own workflow.**

Concretely, after this spec lands users can:

- **Save filter + sort presets** in the review queue ("Co-op, Junior, <100 applicants, sorted by applicants asc") and switch between them in one click.
- **Customize which fields render** as badges, which appear in the card header, and what the default sort is.
- **Configure scrape behavior** (throttle, chunk size, max jobs/pages, dedupe on/off) from the extension options page — no more recompile to change defaults.
- **Choose how imports flow in**: auto-import vs. review-queue-only, default status, auto-tag rules per source.
- **Pick desktop vs. mobile layouts** with different field priorities for each form factor.
- **Normalize pay** to a chosen unit (hourly / monthly / annual) and currency for cross-posting comparison.
- **One-click company lookup** ("Google {{company}}") and one-click "Open original posting" deep-link back to the source.

This spec organizes the work into seven buckets with explicit phasing. Each bucket has a **data model**, **UI surface**, **defaults**, and **acceptance**.

---

## 2. Buckets at a glance

| Bucket | What | Phase | Effort |
|---|---|---|---|
| **A** | Filter presets | Save/load/pin filter sets in review queue | P0 | M |
| **B** | Sort presets | Built-in + custom sort orders ("highest paying", "AI recommended", "lowest applicants") | P0 | M |
| **C** | Display preferences | Which fields render where, density, badge selection | P1 | M |
| **D** | Scrape settings | Throttle/chunk/dedupe/caps in extension options | P1 | S |
| **E** | Import behavior | Auto-import vs review-gate, default status, auto-tag rules | P2 | M |
| **F** | Layout per form factor | Desktop vs mobile review/queue layouts | P2 | L |
| **G** | Pay normalization | Hourly ↔ monthly ↔ annual, currency conversion | P2 | M |
| **H** | Quick actions | Google-company link, open original posting | P0 | XS |

P0 ships first because it unlocks daily-use value with the smallest surface area. P1 and P2 follow.

---

## 3. Data model

### 3.1 New table: `opportunity_view_preferences`

Stores all user-scoped customization knobs. One row per user.

```ts
opportunityViewPreferences = sqliteTable("opportunity_view_preferences", {
  userId: text("user_id").primaryKey().default(DEFAULT_USER_ID),

  // Bucket C — display
  displayDensity: text("display_density").default("comfortable"), // "compact" | "comfortable"
  defaultSortId: text("default_sort_id").default("most-recent"),
  visibleBadgesJson: text("visible_badges_json"), // string[] of badge keys
  layoutPreferenceJson: text("layout_preference_json"), // { desktop: LayoutSpec; mobile: LayoutSpec }

  // Bucket D — scrape (extension reads via /api/extension/preferences)
  scrapeThrottleMs: integer("scrape_throttle_ms").default(500),
  scrapeChunkSize: integer("scrape_chunk_size").default(5),
  scrapeMaxJobs: integer("scrape_max_jobs").default(200),
  scrapeMaxPages: integer("scrape_max_pages").default(50),
  scrapeDedupeEnabled: integer("scrape_dedupe_enabled", { mode: "boolean" }).default(true),

  // Bucket E — import behavior
  autoImportEnabled: integer("auto_import_enabled", { mode: "boolean" }).default(false),
  defaultImportStatus: text("default_import_status").default("pending"),
  autoTagRulesJson: text("auto_tag_rules_json"), // AutoTagRule[]

  // Bucket G — pay normalization
  payNormalizationUnit: text("pay_normalization_unit").default("annual"), // "hourly" | "monthly" | "annual"
  payNormalizationCurrency: text("pay_normalization_currency").default("USD"),

  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});
```

Idempotent ALTER-style migration in `src/lib/db/preferences.ts`, mirroring the pattern used in `ensureJobsExtensionFields()`.

### 3.2 New table: `opportunity_presets`

Stores named filter+sort presets. Multiple per user.

```ts
opportunityPresets = sqliteTable("opportunity_presets", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().default(DEFAULT_USER_ID),
  name: text("name").notNull(), // "Co-op + Junior + <100 applicants"
  // "review" — applies in /opportunities/review; "list" — applies in /opportunities
  scope: text("scope").default("review"),
  filtersJson: text("filters_json").notNull(), // OpportunityFilters serialized
  sortId: text("sort_id"), // "applicants-asc", "salary-desc", "ai-recommended", "custom-<id>"
  pinned: integer("pinned", { mode: "boolean" }).default(false),
  position: integer("position"), // ordering of pinned presets
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_opportunity_presets_user_pinned").on(table.userId, table.pinned),
]);
```

### 3.3 Shared schema additions

In `packages/shared/src/schemas.ts`:

```ts
export const OPPORTUNITY_SORT_IDS = [
  "most-recent",
  "soonest-deadline",
  "highest-pay",
  "lowest-pay",
  "lowest-applicants",       // bucket B: low-competition first
  "highest-applicants",
  "best-applicant-ratio",    // applicants / openings — lower is better
  "ai-recommended",          // bucket B: requires AI scoring (deferred to follow-up)
  "closest-to-location",     // bucket B: requires user.location set
] as const;
export type OpportunitySortId = (typeof OPPORTUNITY_SORT_IDS)[number];

export const AUTO_TAG_TRIGGER_TYPES = ["source-equals", "title-includes", "work-term-includes"] as const;
export const opportunityAutoTagRuleSchema = z.object({
  id: z.string(),
  enabled: z.boolean().default(true),
  trigger: z.enum(AUTO_TAG_TRIGGER_TYPES),
  triggerValue: z.string(),
  tags: z.array(z.string()).min(1),
});
export type OpportunityAutoTagRule = z.infer<typeof opportunityAutoTagRuleSchema>;

export const layoutSpecSchema = z.object({
  // Card chunks shown in order; missing keys are hidden.
  header: z.array(z.string()),       // e.g. ["company", "title", "source-badge", "status-pill"]
  metaRow: z.array(z.string()),      // e.g. ["applicants", "openings", "workTerm", "level"]
  body: z.array(z.string()),         // e.g. ["location", "salary", "deadline", "summary"]
  actions: z.array(z.string()),      // e.g. ["save", "dismiss", "apply", "google-company"]
});
export type LayoutSpec = z.infer<typeof layoutSpecSchema>;
```

---

## 4. Buckets

### Bucket A — Filter presets (P0)

**Decision**: Add a `PresetSelector` at the top of `/opportunities/review` showing pinned presets as chips. Clicking a chip applies its filters + sort. "+" chip opens a save dialog: name + scope ("review" / "list") + pin checkbox. Three-dot menu on each chip → Edit / Rename / Unpin / Delete.

**Files**:
- `apps/web/src/app/[locale]/(app)/opportunities/review/page.tsx` — add `PresetBar`
- `apps/web/src/components/opportunities/preset-bar.tsx` — new
- `apps/web/src/components/opportunities/save-preset-dialog.tsx` — new
- `apps/web/src/lib/db/opportunity-presets.ts` — new (CRUD)
- `apps/web/src/app/api/opportunity-presets/route.ts` — new (GET/POST)
- `apps/web/src/app/api/opportunity-presets/[id]/route.ts` — new (PATCH/DELETE)

**Defaults**: New users get three seeded presets — "All open", "Closing this week", "<25 applicants". Seeded on first read if `count(*) = 0`.

**Acceptance**:
- [ ] Save dialog accepts name (max 80) + filters snapshot + optional pin
- [ ] Pinned presets render as chips ordered by `position`
- [ ] Switching presets URL-encodes the filter set (shareable links)
- [ ] Delete confirms via the destructive-actions pattern (`useConfirmDialog`)
- [ ] Unit + integration test for CRUD + ordering

---

### Bucket B — Sort presets (P0)

**Decision**: Add a sort dropdown next to the preset chips. Options come from `OPPORTUNITY_SORT_IDS`. Sort logic lives in `apps/web/src/lib/opportunities/sort.ts` (new) so the same comparator runs on the review queue and the list/kanban views.

**Built-in sort comparators**:

| ID | Comparator (lower-better unless noted) |
|---|---|
| `most-recent` | `-createdAt` |
| `soonest-deadline` | `parseDeadline(deadline)` — undefined deadline → tail |
| `highest-pay` | `-normalizedAnnualPay(opp)` (using user's currency from bucket G; falls back to USD) |
| `lowest-pay` | `+normalizedAnnualPay(opp)` |
| `lowest-applicants` | `applicants ?? +Infinity` |
| `highest-applicants` | `-(applicants ?? -Infinity)` |
| `best-applicant-ratio` | `(applicants ?? 0) / (openings ?? 1)` — lower = less competitive per slot |
| `ai-recommended` | requires `recommendation_score`; out of scope for P0 (returns "most-recent" with a "(coming soon)" tag in the dropdown) |
| `closest-to-location` | `haversine(opp.geo, user.geo)`; if either missing → +Infinity |

**Files**:
- `apps/web/src/lib/opportunities/sort.ts` — new, exports `sortOpportunities(list, sortId, ctx)`
- `apps/web/src/components/opportunities/sort-dropdown.tsx` — new
- `apps/web/src/lib/db/opportunity-presets.ts` — add `sortId` to preset shape
- `apps/web/src/lib/__tests__/sort.test.ts` — pin each comparator

**Defaults**: `most-recent`.

**Acceptance**:
- [ ] Each built-in comparator has a unit test pinning the exact ordering for a 6-item fixture
- [ ] Sort dropdown shows "(coming soon)" for sort IDs that require unmet preconditions (location not set → `closest-to-location` disabled with tooltip)
- [ ] Sort selection persists to `opportunity_view_preferences.defaultSortId` when the user clicks "Make default"

---

### Bucket C — Display preferences (P1)

**Decision**: Add a `/settings/opportunities` page section "Display". Three controls:

1. **Density**: radio "Comfortable" / "Compact" — wraps card padding + font sizes
2. **Default sort**: dropdown bound to `defaultSortId`
3. **Visible badges**: multi-select chip group — user picks which of [`applicants`, `openings`, `level`, `workTerm`, `remote`, `source`, `deadline`, `salary`] render as badges

`OpportunityMetaRow` in `review-queue.tsx` (already shipped in c0ef3d08) reads `visibleBadges` from preferences and filters its `chunks` array accordingly. Order of badges is fixed (already defined in the file).

**Files**:
- `apps/web/src/app/[locale]/(app)/settings/opportunities/page.tsx` — add Display section
- `apps/web/src/components/opportunities/review-queue.tsx` — pipe preferences in
- `apps/web/src/lib/db/preferences.ts` — new, `getViewPreferences(userId)` / `setViewPreferences(userId, partial)`
- `apps/web/src/app/api/preferences/opportunities/route.ts` — new (GET/PATCH)
- `apps/web/src/hooks/use-opportunity-preferences.ts` — new, SWR-style read+write

**Defaults**:
- Density: `comfortable`
- Default sort: `most-recent`
- Visible badges: `["applicants", "openings", "workTerm", "level", "remote"]`

**Acceptance**:
- [ ] Toggling density updates the card live (no reload)
- [ ] Hiding a badge removes it from the meta row everywhere it renders
- [ ] Preference changes persist across reload + new tabs (via SWR revalidate)

---

### Bucket D — Scrape settings (P1)

**Decision**: Add a "Scrape" section to the extension options page (`apps/extension/src/options/`). Numeric inputs for throttle / chunk size / max jobs / max pages. Toggle for dedupe filter. Values persist in `chrome.storage.local` + mirrored to `/api/preferences/opportunities` so the desktop app's settings page shows the same values.

The orchestrator's `OrchestratorOptions` already accepts these knobs — `runWwBulkScrape` in `apps/extension/src/content/index.ts` needs to read them from storage before invoking the orchestrator.

**Files**:
- `apps/extension/src/options/App.tsx` — new section "Scrape settings"
- `apps/extension/src/options/styles.css` — section styling (slot into existing bento grid as `scrape-settings-card`)
- `apps/extension/src/shared/types.ts` — add `ScrapeSettings` interface
- `apps/extension/src/background/storage.ts` — add `getScrapeSettings()` / `setScrapeSettings(partial)`
- `apps/extension/src/content/index.ts` — `runWwBulkScrape` reads via `sendMessage` before invoking orchestrator
- `apps/web/src/app/[locale]/(app)/settings/opportunities/page.tsx` — show + edit same values
- `apps/web/src/app/api/preferences/opportunities/route.ts` — already-exists from bucket C, extend payload

**Defaults**:
- Throttle: 500ms
- Chunk size: 5
- Max jobs: 200
- Max pages: 50
- Dedupe enabled: true

**Acceptance**:
- [ ] Changing throttle in extension options affects the next bulk scrape (verified in dev harness)
- [ ] Disabling dedupe causes re-scraping to re-import (verified with two runs)
- [ ] Settings sync from web app → extension via `chrome.storage.onChanged` listener
- [ ] Validation: chunk size ∈ [1, 50], throttle ∈ [100, 5000], max jobs ∈ [1, 1000], max pages ∈ [1, 200]

---

### Bucket E — Import behavior (P2)

**Decision**: Add an "Import behavior" section to `/settings/opportunities`. Three controls:

1. **Auto-import on scrape complete**: toggle. When off, scrapes land as `status="pending"` (review queue). When on, jobs land as `defaultImportStatus`.
2. **Default status for imports**: dropdown — `"pending"` (review-gated) / `"saved"` (skip review) / `"interested"`.
3. **Auto-tag rules**: a list-builder UI:
   - Row: when [`Source` / `Title contains` / `Work term contains`] = `<value>`, tag as [`tag1`, `tag2`, ...]
   - Add / edit / delete / reorder rows
   - "Test against last scrape" button shows how many of the last-scraped jobs would match each rule

Rules execute server-side in the import endpoint after `createJob` succeeds.

**Files**:
- `apps/web/src/lib/opportunities/auto-tag.ts` — new, `applyAutoTagRules(opp, rules) → tags`
- `apps/web/src/app/api/opportunities/from-extension/route.ts` — call `applyAutoTagRules` for newly-created jobs
- `apps/web/src/components/settings/auto-tag-rules-builder.tsx` — new
- `apps/web/src/components/settings/import-behavior-section.tsx` — new

**Defaults**:
- Auto-import: off
- Default status: `pending`
- Auto-tag rules: empty

**Acceptance**:
- [ ] Rule "Source = waterlooworks → tag `wluworks`" applies to next scrape
- [ ] "Test against last scrape" reports `N matches / 50 jobs`
- [ ] Rules persist; users can disable individual rules without deleting

---

### Bucket F — Layout per form factor (P2)

**Decision**: Let users define what shows in the card header / meta row / body / actions independently for desktop and mobile. Layout is a `LayoutSpec` (see §3.3) — an ordered list of "chunk keys".

Available chunks:

| Key | Renders | Position |
|---|---|---|
| `company` | Company name | header |
| `title` | Job title | header |
| `source-badge` | "WaterlooWorks" badge | header |
| `status-pill` | Status pill | header |
| `remote-badge` | "Remote" badge | header |
| `applicants` | "N applicants" | meta |
| `openings` | "N openings" | meta |
| `workTerm` | Work term | meta |
| `level` | Level | meta |
| `applicant-ratio` | applicants/openings ratio | meta |
| `location` | City, province, country | body |
| `salary` | Normalized salary string (bucket G) | body |
| `deadline` | Deadline | body |
| `summary` | Description preview | body |
| `tags` | Custom tags | body |
| `save` / `dismiss` / `apply` | Action buttons | actions |
| `google-company` / `open-original` | Quick actions (bucket H) | actions |

UI: drag-and-drop chunk reorderer with two columns (Desktop / Mobile). Disabled chunks live at the bottom of each column.

**Files**:
- `apps/web/src/components/opportunities/layout-builder.tsx` — new, drag-and-drop with `@dnd-kit`
- `apps/web/src/components/opportunities/review-queue.tsx` — read `LayoutSpec` from preferences, render chunks in order via a `LayoutSpec → ReactNode[]` renderer
- `apps/web/src/lib/opportunities/render-chunk.ts` — new, central chunk renderer

**Defaults**: Defined in `apps/web/src/lib/opportunities/default-layout.ts`. Desktop emphasizes density (more meta chunks per row); mobile emphasizes vertical clarity (fewer chunks, larger touch targets).

**Acceptance**:
- [ ] Reordering chunks updates the card in the preview panel in real time
- [ ] Reset-to-default button restores `default-layout.ts` values
- [ ] Mobile breakpoint at `<640px` uses `layoutPreference.mobile`; otherwise `.desktop`

---

### Bucket G — Pay normalization (P2)

**Decision**: When a salary is parsed (existing `parseSalaryRange` in `apps/web/src/lib/opportunities.ts`), store both the raw values and an `inferredUnit` (`hourly`/`monthly`/`annual`) inferred from context ("per hour", "/yr", "monthly", etc.). Add a converter that re-renders salary in the user's preferred unit + currency.

**Conversion knowledge**:
- 1 hour × 40 hr/wk × 52 wk/yr = 2080 hr/yr (annual conversion)
- 1 month × 12 = annual
- Currency rates: pull daily from `exchangerate.host` (free), cache in `currency_rates` table 24h

**Files**:
- `apps/web/src/lib/opportunities/pay.ts` — new, `inferPayUnit(text)`, `normalizeToUnit(amount, fromUnit, toUnit)`, `convertCurrency(amount, from, to)`
- `apps/web/src/lib/db/currency-rates.ts` — new, cache table
- `apps/web/src/app/api/cron/currency-rates/route.ts` — new daily cron
- `apps/web/src/lib/db/schema.ts` — add `currency_rates` table + `inferred_pay_unit`, `inferred_pay_amount`, `inferred_pay_currency` columns to `jobs`
- `apps/web/src/lib/opportunities.ts` — populate inferred fields during `jobToOpportunity`
- `apps/web/src/components/opportunities/review-queue.tsx` — render normalized salary

**Defaults**:
- Unit: `annual`
- Currency: `USD`

**Acceptance**:
- [ ] "$23.05 per hour" with default annual+USD renders as "~$47,944/yr"
- [ ] "CAD $8,000 to $10,000 per month" with annual+CAD renders as "CAD $96k-$120k/yr"
- [ ] Postings without parseable salary show "Salary not listed"
- [ ] Currency conversion uses ≤24h-cached rates; cron updates daily

---

### Bucket H — Quick actions (P0)

**Decision**: Two new action buttons available in the layout's `actions` slot:

1. **"Search company"** — opens `https://www.google.com/search?q={{company}}` in a new tab. Trivial.
2. **"Open original posting"** — opens `opportunity.sourceUrl` in a new tab. For WW postings, this is already the `#postingId=` deep link the content script knows how to round-trip into the modal (shipped in c78448d7).

**Files**:
- `apps/web/src/lib/opportunities/render-chunk.ts` — register `google-company` and `open-original` chunks
- `apps/web/src/components/opportunities/review-queue.tsx` — use `<ActionButton>` for both

**Defaults**: Both available; `open-original` is in the default desktop actions slot when `opportunity.sourceUrl` is present.

**Acceptance**:
- [ ] "Search company" opens Google with the URL-encoded company name in a new tab (no popup blocker issues)
- [ ] "Open original" opens `sourceUrl` in a new tab; for WW postings, the modal auto-opens via the hash hook

---

## 5. Phasing

### P0 — "Daily use unlocks" (1-2 days)

| Bucket | Reason |
|---|---|
| **A — filter presets** | Highest-value pickup; cuts the most repetitive friction in the queue |
| **B — sort presets** | Pairs with A; presets without sort feel half-finished |
| **H — quick actions** | Tiny effort, massive UX win |

P0 doesn't touch the extension. All web-side.

### P1 — "Configurability" (2-3 days)

| Bucket | Reason |
|---|---|
| **C — display preferences** | Builds on A/B by letting users pick what badges show; introduces the preferences table |
| **D — scrape settings** | Extension surface; orchestrator already accepts the knobs, just need a UI |

P1 introduces `opportunity_view_preferences` + the sync between web app + extension storage.

### P2 — "Power user" (3-5 days)

| Bucket | Reason |
|---|---|
| **E — import behavior** | Auto-tag rules require a small rules engine + UI |
| **F — layout per form factor** | Drag-and-drop layout builder is the biggest UI piece |
| **G — pay normalization** | Currency cron + DB migration |

P2 is the longest tail. Each bucket is independent — they can ship in any order once P1 is in.

---

## 6. Defaults summary

| Setting | Default |
|---|---|
| `displayDensity` | `comfortable` |
| `defaultSortId` | `most-recent` |
| `visibleBadgesJson` | `["applicants", "openings", "workTerm", "level", "remote"]` |
| `layoutPreferenceJson.desktop` | see `default-layout.ts` |
| `layoutPreferenceJson.mobile` | see `default-layout.ts` |
| `scrapeThrottleMs` | `500` |
| `scrapeChunkSize` | `5` |
| `scrapeMaxJobs` | `200` |
| `scrapeMaxPages` | `50` |
| `scrapeDedupeEnabled` | `true` |
| `autoImportEnabled` | `false` |
| `defaultImportStatus` | `pending` |
| `autoTagRulesJson` | `[]` |
| `payNormalizationUnit` | `annual` |
| `payNormalizationCurrency` | `USD` |
| Seeded presets | `"All open"`, `"Closing this week"`, `"<25 applicants"` |

---

## 7. Migration

All changes are additive — no existing DB rows or API responses break.

- `opportunity_view_preferences` and `opportunity_presets` are new tables; existing users get them lazily on first read.
- `jobs` table gets three new columns (bucket G); migration helper is idempotent.
- Existing rows have NULL for the new pay columns; renderer falls back to the raw `salary` string when normalization fails (today's behavior).
- Existing 50 imported WW jobs (pre-c78448d7) have NULL `source` / `source_job_id` / `applicants` / `openings` / `level` / `workTerm`. They render normally — the meta row is empty for them, which is correct. Recommend re-scraping for clean data.

---

## 8. Out of scope (deferred)

- **AI-scored "recommended" sort** — requires either a profile-fit model run on every opportunity, or a precomputed score. Pin as a follow-up spec; reserve the sort ID (`ai-recommended`) but render disabled with "Coming soon".
- **Multi-source filter presets** — presets are scoped to "review" or "list"; a single preset that applies across both is deferred until users ask.
- **Preset sharing / import** — exporting and importing presets between users / accounts is a v2 idea.
- **Per-preset notification rules** ("alert me when a posting matches this preset") — separate notification spec.
- **Salary-band filter UI** — depends on G; surfacing as a filter chip is trivial once G lands.

---

## 9. Risks

| Risk | Mitigation |
|---|---|
| Preferences fragmentation across web/extension | Single source of truth: `opportunity_view_preferences`; extension reads via `/api/preferences/opportunities`; `chrome.storage.local` is a cache only |
| Sort comparators drift between review queue and list view | Single `sortOpportunities()` helper in `lib/opportunities/sort.ts`; both views import it |
| Layout builder breaks on add of new chunk type | Renderer treats unknown chunk keys as no-ops; layout validation in the API endpoint strips unknown keys |
| Currency rate cron failure | Salary renders fall back to raw string; pin alert via existing notification infra |
| Auto-tag rules can spam tags | Rule limit per user (50); tag dedupe at insert time; "preview matches" before save |

---

## 10. Open questions

1. Should presets be **per-locale** (English/French queue can have different presets) or global per user? Probably global; `/en/opportunities/review` and `/fr/opportunities/review` show the same presets.
2. Where does the **layout builder** live — `/settings/opportunities` (alongside other prefs) or a dedicated `/settings/opportunities/layout`? Probably the former for P2; spin out later if it gets crowded.
3. Do we want **system-provided "recommended" presets** that adapt over time (e.g. "Jobs you skipped a similar one of") — distinct from seeded defaults? Defer to a "smart presets" follow-up.
4. AI-recommended sort: do we precompute scores during scrape (cheap, eventual consistency) or compute on-the-fly per page-load (slow but always fresh)? Precompute, store in `jobs.recommendation_score`, refresh on profile change.

---

## 11. Hand-off checklist

When picking this up:

- [ ] Re-read `CLAUDE.md` for the `pluralize` / `<TimeAgo>` / destructive-action / page-width conventions — they apply to every UI surface this spec touches.
- [ ] Start at P0 buckets A + B + H — they don't need any new tables (presets table only); ship as one PR.
- [ ] P1 buckets C + D introduce `opportunity_view_preferences`; bundle the migration with bucket C's first endpoint.
- [ ] P2 buckets are independent — bucket E (auto-tag) and bucket F (layout) can ship in either order.
- [ ] Every bucket ships with **unit tests** for its data logic and **at least one** integration test for its API endpoint.
- [ ] Every preference change preserves the existing default values for users who haven't customized.
