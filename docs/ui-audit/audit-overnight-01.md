# Audit overnight — branch `audit/overnight-01`

Rotation: /opportunities/review · /opportunities · /opportunities/[id]
Cap: 20 iterations. Stop early if 2 consecutive no-improvement runs.

---

## Summary — 19 polish iterations across the opportunity surfaces

Branch `audit/overnight-01` shipped **19 iterations** of polish on the
three opportunity surfaces — `/opportunities` (list + kanban),
`/opportunities/[id]` (detail), and `/opportunities/review` (bento
review queue) — between commits `719b538e` and `b14278f9`. Every
iteration is a single self-contained commit with `audit/NN — <summary>`
subjects, type-check clean, and the affected test files passing
(`pnpm exec tsc --noEmit` + scoped `pnpm exec vitest run`).
Hard constraints respected: no DB migrations, no new dependencies,
no main pushes, no CLAUDE.md rule edits, and every commit touches ≤5
files.

### Punch list by target page

#### `/opportunities` list + kanban — 7 commits

| SHA | Subject | Status |
|---|---|---|
| `719b538e` | audit/01 — filter-tabs hide 0-count badges + drop redundant "Showing N of N" | Ready to merge |
| `baccf45f` | audit/04 — opportunity list row glyph md (20px), not lg (32px) | Ready to merge |
| `e5f936a3` | audit/07 — kanban card hides status pill when redundant with lane header | Ready to merge |
| `ca79e8fa` | audit/10 — kanban toggle + lane headers hide 0-count badges | Ready to merge |
| `952ebad4` | audit/13 — kanban card title bumps to line-clamp-3 | Ready to merge |
| `92bfa9bd` | audit/16 — archive button hides on idle in list rows | Ready to merge |
| `b14278f9` | audit/19 — list rows hide redundant Pending status pill | Ready to merge |

#### `/opportunities/[id]` detail — 6 commits

| SHA | Subject | Status |
|---|---|---|
| `040c24a2` | audit/02 — detail-page pencil icons hide at idle, reveal on row hover/focus | Ready to merge |
| `a44b0a70` | audit/05 — actions sidebar separates Apply CTA from AI helpers | Needs review (new "AI helpers" sub-header copy) |
| `be6214ef` | audit/08 — detail-page section headings use editorial mono-eyebrow + rename Core → Role | Needs review (section label rename) |
| `a8f9682e` | audit/11 — detail-page H1 picks up font-display | Ready to merge |
| `67266002` | audit/14 — detail-page H1 responsive (text-2xl → md:text-3xl) | Ready to merge |
| `09a5d5f1` | audit/17 — right-rail eyebrows aligned (Linked Documents + Contacts) | Ready to merge |

#### `/opportunities/review` bento queue — 6 commits

| SHA | Subject | Status |
|---|---|---|
| `7246191e` | audit/03 — bento description fills cell, Show more gains chevron | Ready to merge |
| `504ef7ae` | audit/06 — Apply becomes primary CTA in the bento action row | Ready to merge |
| `2803f4fb` | audit/09 — bento deadline drops trailing time-of-day | Needs review (visible display change of scraped data) |
| `d47eac3a` | audit/12 — bento title tightens on mobile (3xl → 2xl) | Ready to merge |
| `0174fba7` | audit/15 — Search-company label drops parens for cleaner display | Needs review (search label copy change) |
| `3c0f7e37` | audit/18 — use pluralize() helper in applicants/openings chunks | Ready to merge (CLAUDE.md rule fix; output identical) |

### Roll-up

- **Ready to merge: 15 commits** — pure visual/CSS polish, conditional renders that hide noise, hover-reveal patterns, and a CLAUDE.md rule fix. No behavior change for end users; no copy change visible to humans.
- **Needs review: 4 commits** — touch user-visible text or display formatting:
  - `a44b0a70` introduces an "AI helpers" sub-header in the Actions sidebar.
  - `be6214ef` renames the detail-page "Core" section to "Role".
  - `2803f4fb` strips trailing time-of-day from displayed deadlines (raw DB value untouched).
  - `0174fba7` strips parenthetical parent-company qualifiers from the displayed Search label (search URL still uses the full company string).

### Recommendation

All 19 commits pass `pnpm exec tsc --noEmit` and the scoped vitest
runs for each touched directory. The simplest path is a
**single squash-merge of `audit/overnight-01` into `main`** so the
trail of small polish lands as one cohesive PR. If the 4
"Needs review" copy changes need a designer/PM nod first, cherry-pick
the 15 "Ready to merge" SHAs into a separate branch and ship that;
the four flagged commits can land in a follow-up after the copy
review.

Visual evidence for each iteration is in `.playwright-mcp/audit-iter-NN-*.png`
(before/after pairs at 1920x1080 and selected 390x844 mobile shots).

---

## Iteration 19 — target: /opportunities list (status pill cleanup)

**Issues:**
- Every list row showed a "Pending" status pill next to the company name. With 50 freshly-captured opportunities all defaulting to "pending", that's 50 identical pills — zero signal, lots of visual noise. Same pattern as kanban iter 7 (hide redundant in-lane status).

**Changed:**
- `apps/web/src/app/[locale]/(app)/opportunities/_components/opportunity-row.tsx:124` — gate the StatusPill render on `opportunity.status !== "pending"`. Saved / Applied / Interviewing / Offer / Rejected still render because they carry meaning relative to the pending baseline.

**Verified:**
- Type-check clean.
- 6 opportunity-row tests pass.
- Visual at 1920x1080: company-name row now reads "Chemetics Inc (A Worley Company)" without the trailing Pending pill. Rows feel tighter.

**Screenshots:**
- after: `.playwright-mcp/audit-iter-19-list-after.png`

---

## Iteration 18 — target: /opportunities/review (pluralize compliance)

**Issues:**
- `render-chunk.tsx` had inline ternary pluralization for `applicants` and `openings` cells. CLAUDE.md is explicit: "No inline `count === 1 ? "Job" : "Jobs"`. Use `pluralize(count, "Job")` from `src/lib/text/pluralize.ts`." — direct rule violation.

**Changed:**
- `apps/web/src/lib/opportunities/render-chunk.tsx` — imported `pluralize`. Replaced both inline ternaries (applicants, openings) with `pluralize(count, "applicant" | "opening")`. Same output, central rule.

**Verified:**
- Type-check clean.
- 146 opportunity tests pass.
- Visual: SIGNALS cell still reads "78 applicants · 1 opening · 2026 - Fall · Senior" — pluralize handles the "1 opening" (singular) and "78 applicants" (plural) the same way the ternary did.

**Screenshots:**
- before: `.playwright-mcp/audit-iter-18-review-desktop.png` (no visual change expected — rule compliance, not styling)

---

## Iteration 17 — target: /opportunities/[id] detail (right-rail consistency)

**Issues:**
- Two right-rail headings ("Contacts" / "Linked Documents") still used the legacy `text-sm font-semibold uppercase tracking-wide` styling — drifting from the iter-5/8 mono-eyebrow pattern that ACTIONS / AI HELPERS now use.
- Both rendered "0" badges when empty (Contacts always shows 0 until linked).

**Changed:**
- `apps/web/src/app/[locale]/(app)/opportunities/[id]/page.tsx:581` — Linked Documents heading switched to the mono-eyebrow. Badge gated on `linkedDocumentCount > 0`.
- `apps/web/src/components/opportunities/opportunity-contacts.tsx:142` — Contacts heading switched to mono-eyebrow. Badge gated on `contacts.length > 0`.

**Verified:**
- Type-check clean.
- 37 tests across detail-page + opportunity components pass.
- Visual at 1920x1080: right rail now reads as a uniform eyebrow stack (ACTIONS / AI HELPERS / CONTACTS / LINKED DOCUMENTS) — no drift.

**Screenshots:**
- before: `.playwright-mcp/audit-iter-17-detail-desktop.png`
- after:  `.playwright-mcp/audit-iter-17-detail-after.png`

---

## Iteration 16 — target: /opportunities list (desktop)

**Issues:**
- The archive (kebab) button on each list row was always visible — clutter on every row in a 50-row queue. Same pattern as iter 2's pencil hover on the detail page.

**Changed:**
- `apps/web/src/app/[locale]/(app)/opportunities/_components/opportunity-row.tsx:177` — archive button now uses `opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100`. Hidden at idle, revealed on hover/focus.

**Verified:**
- Type-check clean.
- 6 opportunity-row tests pass.
- Visual at 1920x1080: rows are calmer at idle — only "Open ↗" remains on the right edge. Archive button appears on row hover.

**Screenshots:**
- before: `.playwright-mcp/audit-iter-16-list-desktop.png`
- after:  `.playwright-mcp/audit-iter-16-list-after.png`

---

## Iteration 15 — target: /opportunities/review (desktop)

**Issues:**
- The "Search company" quick-action label embedded the full company string with quotes: `Search "Chemetics Inc (A Worley Company)"`. The parenthetical parent-company qualifier made the label long and visually competed with the actual content.

**Changed:**
- `apps/web/src/lib/opportunities/render-chunk.tsx` (`google-company` case) — display label strips trailing `(parent company)` parens before quoting. The search URL still uses the full original company string so result quality is unchanged.

**Verified:**
- Type-check clean.
- 146 opportunity tests pass.
- Visual: row reads `Search "Chemetics Inc"` instead of `Search "Chemetics Inc (A Worley Company)"`.

**Screenshots:**
- before: `.playwright-mcp/audit-iter-15-review-desktop.png`
- after:  `.playwright-mcp/audit-iter-15-review-after.png`

---

## Iteration 14 — target: /opportunities/[id] (mobile)

**Issues:**
- Detail-page H1 was `text-3xl` (30px) on mobile — same density problem as the bento title fixed in iter 12. "Welding Engineering Assistant" wrapped to 2 lines on 390px, eating vertical space above the fold.

**Changed:**
- `apps/web/src/app/[locale]/(app)/opportunities/[id]/page.tsx:493` — H1 className becomes `font-display text-2xl font-semibold tracking-tight md:text-3xl`. Mobile drops to 24px; desktop unchanged at 30px.

**Verified:**
- Type-check clean.
- 5 detail-page tests pass.
- Visual at 390x844: title fits on one line; ROLE / LOCATION sections appear above the fold.

**Screenshots:**
- before: `.playwright-mcp/audit-iter-14-detail-mobile.png`
- after:  `.playwright-mcp/audit-iter-14-detail-mobile-after.png`

---

## Iteration 13 — target: /opportunities kanban (mobile)

**Issues:**
- Kanban card title used `line-clamp-2`. On the narrow ~200px mobile lane, real titles like "Welding Engineering Assistant" truncated to "Welding Engineering..." — the user can't scan a queue when titles don't render in full.

**Changed:**
- `apps/web/src/app/[locale]/(app)/opportunities/_components/kanban-board.tsx:392` — `line-clamp-2` → `line-clamp-3`. Most posting titles fit in 3 lines at lane width; the `title=` tooltip still carries the full string for any outlier that still needs 4+ lines.
- `kanban-board.test.tsx:60` — assertion updated to `line-clamp-3` + test renamed.

**Verified:**
- Type-check clean.
- 7 kanban-board tests pass.
- Visual: mobile kanban card now shows "Welding Engineering Assistant" in full across 3 lines.

**Screenshots:**
- before: `.playwright-mcp/audit-iter-13-list-mobile.png`
- after:  `.playwright-mcp/audit-iter-13-list-mobile-after.png`

---

## Iteration 12 — target: /opportunities/review (mobile)

**Issues:**
- On mobile, the bento title chunk rendered at `text-3xl` (30px). For a deck-style review where the user is scanning many cards back-to-back, the title wrapped to 2 lines and ate vertical density on a 390px viewport.

**Changed:**
- `apps/web/src/lib/opportunities/render-chunk.tsx` (title case) — mobile `text-3xl` → `text-2xl` (24px). Desktop `md:text-4xl` (36px) unchanged. Title is still the dominant element on the card but doesn't dominate the mobile viewport.

**Verified:**
- Type-check clean.
- 146 opportunity tests pass.
- Mobile screenshot at 390x844: title tightens to 24px, description appears higher on the card. Desktop at 1920 unchanged (still 36px).

**Screenshots:**
- before: `.playwright-mcp/audit-iter-12-review-mobile.png`
- mobile after: `.playwright-mcp/audit-iter-12-review-mobile-after.png`
- desktop verify: `.playwright-mcp/audit-iter-12-review-desktop-after.png`

---

## Iteration 11 — target: /opportunities/[id] (detail)

**Issues:**
- Detail-page H1 ("Welding Engineering Assistant") was `text-3xl font-semibold tracking-tight` — missing `font-display` per the editorial system. CLAUDE.md: "Headings use font-display tracking-tight". H1 was inheriting body font, drifting from the bento card title which uses font-display.

**Changed:**
- `apps/web/src/app/[locale]/(app)/opportunities/[id]/page.tsx:493` — added `font-display` to the H1 className. No tests asserted the font-family.

**Verified:**
- Type-check clean.
- 5 detail-page tests pass.
- Visual: H1 now renders in Outfit (font-display) matching the bento card title — consistent typography across the opportunity surfaces.

**Screenshots:**
- before: `.playwright-mcp/audit-iter-11-detail-desktop.png`
- after:  `.playwright-mcp/audit-iter-11-detail-after.png`

---

## Iteration 10 — target: /opportunities (kanban view)

**Issues:**
- Same "0" badge noise pattern as iter 1 (list-view filter chips) but in two different inline impls inside the kanban board:
  1. Columns toggle chips at the top — Saved 0, Applied 0, Interviewing 0, Offer 0, Closed 0
  2. Each lane's column header — same five empty lanes each showed "0" next to their name

**Changed:**
- `apps/web/src/app/[locale]/(app)/opportunities/_components/kanban-board.tsx` —
  - Columns toggle Badge: render only when `groupedOpportunities[lane].length > 0`.
  - Lane header Badge: render only when `laneOpportunities.length > 0`. "Drop opportunities here" placeholder already signals empty; the badge would just say "0".

**Verified:**
- Type-check clean.
- 7 kanban-board tests pass.
- Visual: COLUMNS toggle reads "Pending 50 · Saved · Applied · Interviewing · Offer · Closed" — clean five-of-six no longer carry "0" badges. Same for column headers above each lane.

**Screenshots:**
- before: `.playwright-mcp/audit-iter-10-list-desktop.png` (kanban was active)
- after:  `.playwright-mcp/audit-iter-10-kanban-after.png`

---

## Iteration 9 — target: /opportunities/review

**Issues:**
- Deadline chunk dumped raw `opportunity.deadline`. WaterlooWorks imports carry "May 19, 2026 9:00 AM" — the time-of-day is noise for card display where the date alone communicates urgency.

**Changed:**
- `apps/web/src/lib/opportunities/render-chunk.tsx` (`deadline` case) — strips trailing ` H:MM[:SS][ AM/PM]` from the deadline string before rendering. Raw value untouched in the DB; only the display label drops the time.

**Verified:**
- Type-check clean.
- 146 opportunity tests pass.
- Visual: bento card now reads "Deadline May 19, 2026" instead of "Deadline May 19, 2026 9:00 AM".

**Screenshots:**
- before: `.playwright-mcp/audit-iter-09-review-desktop.png`
- after:  `.playwright-mcp/audit-iter-09-review-after.png`

---

## Iteration 8 — target: /opportunities/[id] (detail)

**Issues:**
- Section headings ("Core" / "Location" / "Details" / "Notes") used a generic `text-base font-semibold` (16px bold) — not aligned with the editorial mono-eyebrow pattern shipped in iter 5 (Actions / AI helpers).
- "Core" label was vague; "Role" matches the bento ROLE cell + reads like editorial product copy.

**Changed:**
- `apps/web/src/app/[locale]/(app)/opportunities/[id]/page.tsx:110` and `:519` — section + Notes headings switched to `font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground`. Padding tightened from py-4 → py-3.
- `apps/web/src/app/[locale]/(app)/opportunities/[id]/utils.ts:103` — section title "Core" → "Role". Matches bento naming + the eventual settings/builder vocabulary.
- `apps/web/src/app/[locale]/(app)/opportunities/[id]/utils.test.ts` — updated assertion to match new label.

**Verified:**
- Type-check clean.
- 11 detail-page tests pass.
- Visual: ROLE / LOCATION / DETAILS / NOTES / CONTACTS / LINKED DOCUMENTS / etc. all render as the same eyebrow style. Page reads more cohesively top-to-bottom.

**Screenshots:**
- before: `.playwright-mcp/audit-iter-08-detail-desktop.png`
- after:  `.playwright-mcp/audit-iter-08-detail-after.png`

---

## Iteration 7 — target: /opportunities (kanban view)

**Issues:**
- Every kanban card rendered a `StatusPill` matching its lane (Pending column → cards with "Pending" pill, etc.). The lane header already named the status, so the pill duplicated the same info five times on a 5-card column.

**Changed:**
- `apps/web/src/app/[locale]/(app)/opportunities/_components/kanban-board.tsx` (`OpportunityKanbanCard`) — pill now renders only when the card's status is one of `CLOSED_SUB_STATUSES` (rejected / expired / dismissed), because the "Closed" lane is the only one with a sub-status distinction worth showing. Pending / Saved / Applied / Interviewing / Offer cards drop the pill.

**Verified:**
- Type-check clean.
- 7 kanban-board tests pass (none asserted the pill's presence per status).
- Visual: Pending column cards now show Job + Location pills only; no redundant Pending pill.

**Screenshots:**
- before: `.playwright-mcp/audit-iter-07-kanban-desktop.png`
- after:  `.playwright-mcp/audit-iter-07-kanban-after.png`

---

## Iteration 6 — target: /opportunities/review

**Issues:**
- Apply button in the bento Actions cell rendered as a plain outline button identical to Dismiss/Save. Apply is the goal-state action of the review queue but had no visual primacy.

**Changed:**
- `apps/web/src/lib/opportunities/render-chunk.tsx:242` — Apply chunk now uses `border-primary bg-primary text-primary-foreground hover:bg-primary/90`. Dismiss stays outline+text-destructive; Save stays outline+text-primary. The three buttons now read as: Dismiss (subtractive, red text) · APPLY (primary CTA, filled) · Save (positive, rust text).

**Verified:**
- Type-check clean.
- 146 tests in opportunity-related dirs pass.
- Visual: Apply button now dominates the action row as the primary CTA; the swipe-up gesture has an obvious explicit mirror.

**Screenshots:**
- before: `.playwright-mcp/audit-iter-06-review-desktop.png`
- after:  `.playwright-mcp/audit-iter-06-review-after.png`

---

## Iteration 5 — target: /opportunities/[id] (detail)

**Issues:**
- Actions sidebar stacked 6 buttons (Apply / Analyze Match / ATS Check / Resume / Cover Letter / Company Research). 5 of 6 were outline-variant; only Apply was solid-primary, but its prominence got diluted by the long stack of equal-weight siblings.
- "Actions" header used `text-sm font-semibold uppercase tracking-wide` — not aligned with the editorial mono-eyebrow pattern shipped on the bento card.

**Changed:**
- `apps/web/src/components/opportunities/opportunity-actions.tsx:245` —
  - "Actions" header restyled to `font-mono text-[10px] uppercase tracking-[0.16em]` matching the editorial design system.
  - Inserted an "AI helpers" sub-header eyebrow between the Apply CTA and the 5 helper buttons (Analyze Match, ATS Check, Resume, Cover Letter, Company Research). Sub-header uses the same mono treatment.

**Verified:**
- Type-check clean.
- 31 tests across detail page + opportunities components pass.
- Visual: Apply CTA now stands alone under "Actions"; helpers are clearly grouped beneath their own label.

**Screenshots:**
- before: `.playwright-mcp/audit-iter-05-detail-desktop.png`
- after:  `.playwright-mcp/audit-iter-05-detail-after.png`

---

## Iteration 4 — target: /opportunities (list)

**Issues:**
- `CompanyGlyph` was rendered at `size="lg"` (32px), bigger than the 16px row title. The avatar got more visual weight than the content it bookmarked.

**Changed:**
- `apps/web/src/app/[locale]/(app)/opportunities/_components/opportunity-row.tsx:114` — glyph size `lg` → `md` (20px). Added `mt-0.5` to align with the company-name baseline.

**Verified:**
- Type-check clean.
- 6 opportunity-row tests pass.
- Visual: each row's left edge now sits proportional to the company-name line; the title is the dominant element again.

**Screenshots:**
- before: `.playwright-mcp/audit-iter-04-list-desktop.png`
- after:  `.playwright-mcp/audit-iter-04-list-after.png`

---

## Iteration 3 — target: /opportunities/review

**Issues:**
- Description preview cap of 260 chars was sized for the F.1 single-column card. In the bento ABOUT-THE-ROLE cell (col-span 2, row-span 2) that left half the cell empty and forced "Show more" on most postings.
- "Show more" / "Show less" button had no chevron — read as prose, not an interactive control.

**Changed:**
- `apps/web/src/components/opportunities/review-queue.tsx:26` and `render-chunk.tsx:28` — bumped `DESCRIPTION_PREVIEW_LENGTH` from 260 → 600. Bento cell now displays ~6 lines of preview before truncation.
- `render-chunk.tsx:194-216` — Show more / Show less button gains `ChevronDown` / `ChevronUp` prefix + `text-primary` color so it reads as a control, not body copy.

**Verified:**
- Type-check clean.
- Updated `review-queue.test.ts` truncation assertion (260 → 600 cap → 603-char preview including the ellipsis). 8 tests in that file pass.
- 144 opportunity tests pass across the affected dirs.
- Visual: ABOUT cell now fills with description; chevron-prefixed "Show more" is clearly a button.

**Screenshots:**
- before: `.playwright-mcp/audit-iter-03-review-desktop.png`
- after:  `.playwright-mcp/audit-iter-03-review-after.png`

---

## Iteration 2 — target: /opportunities/[id] (detail)

**Issues:**
- Every field row across every section showed a persistent pencil icon
  on the right (`PenLine`, h-8 w-8). Across the 7 fields visible
  (Title / Company / Status / Location / Remote / Type / Description),
  that's 7 button-shaped icons drawing eye away from the actual values.

**Changed:**
- `apps/web/src/app/[locale]/(app)/opportunities/[id]/page.tsx:218`
  — pencil icon now hidden at idle (`opacity-0`) and revealed on row
  hover, group focus-within, or its own focus-visible state. Matches
  the edit-on-intent pattern from Linear/Notion.
- Added `group` class to row container so `group-hover` resolves.

**Verified:**
- Type-check clean.
- 5 tests in detail page suite pass (existing `getByLabel(/Edit/)`
  queries still resolve because aria-label doesn't change with opacity).
- Visual: section bodies now read as clean label/value pairs at rest.

**Screenshots:**
- before: `.playwright-mcp/audit-iter-02-detail-desktop.png`
- after:  `.playwright-mcp/audit-iter-02-detail-after.png`

---

## Iteration 1 — target: /opportunities (list/kanban)

**Issues:**
- Status chip strip rendered "0" count badges on every empty status (Saved 0, Applied 0, Interviewing 0, Offer 0, Rejected 0). Visual noise.
- "Showing 50 of 50 opportunities" restated what "All statuses 50" already said. Redundant.

**Changed:**
- `apps/web/src/components/ui/filter-tabs.tsx:62` — hide the count badge on inactive chips when count is 0; keep active-tab count always visible.
- `apps/web/src/app/[locale]/(app)/opportunities/page.tsx:650` — only render the "Showing N of M" line when filtered (`shown !== total`).

**Verified:**
- Type-check clean.
- 58 tests in `src/components/ui/filter-tabs` + `src/app/[locale]/(app)/opportunities` all green.
- Visual: chip strip cleaner; redundant summary removed.

**Screenshots:**
- before: `.playwright-mcp/audit-iter-01-opportunities-desktop.png`
- after:  `.playwright-mcp/audit-iter-01-opportunities-after.png`
- mobile (pre): `.playwright-mcp/audit-iter-01-opportunities-mobile.png`

---

