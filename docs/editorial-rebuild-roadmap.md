# Editorial in-product rebuild — roadmap

Tracking the rebuild of the seven authenticated surfaces against the
[Kev handoff](../.design-ref/) (see `design_handoff_slothing_app/README.md`),
plus the token/scaffolding work the rebuild depends on.

The handoff covers a **single coherent design system** keyed off
`data-theme / data-accent / data-display / data-radius / data-density`.
The codebase already exposes those tokens (`apps/web/src/app/globals.css`) and
a `slothing` theme preset (`apps/web/src/lib/theme/presets/slothing.ts`).
This rebuild aligns the in-product surfaces with that system.

---

## Decisions baked in already

- **Shell shape:** top bar + 240px sidebar, no right-hand coach rail.
- **Nav:** keep existing labels/groups (`Home · Documents · Pipeline · Prep · Reporting`) — don't rename to design's "Job Queue / Component Bank / Resumes".
- **Coach rail:** skipped for now.
- **Tweaks panel:** wires through the existing theme preset system; doesn't duplicate state.
- **Existing routes/data:** preserved. Visual layer is what changes.

---

## Phase 0 — Tokens & scaffolding ✅

- [x] `--accent` aliasing decided (kept `--brand` to avoid shadcn HSL clash).
- [x] `EditorialPrefsProvider` + preload script — writes `data-accent / data-display / data-radius / data-density` to `<html>` from `slothing-prefs` localStorage. Cross-tab sync.
- [x] Density tokens: `--density-pad-bar / -panel / -cell / -nav` switch between `[data-density="comfy"]` and `[data-density="compact"]`.
- [x] Brand assets copied: `public/brand/slothing-mark.png` + `slothing-mascot.png`.

## Phase 1 — Shell ✅

- [x] **AppBar** (`components/layout/app-bar.tsx`) — sticky 56px: brand · search (⌘K, opens command palette) · "New" · theme toggle · bell · profile chip.
- [x] **Sidebar** refactor — brand stripped (now in AppBar), 240px, mono-caps section headers, editorial active state. Keeps existing nav data + helpers + tests.
- [x] **TweaksPanel** (`components/layout/tweaks-panel.tsx`) — bottom-right gear FAB, popover with chips for Theme / Accent (6 swatches) / Display font (5) / Corners (3) / Density (2).
- [x] **`(app)/layout.tsx`** rewired — flex-col h-screen → AppBar + flex-row (Sidebar + main). Mobile hides AppBar, keeps a hamburger.

## Phase 1.5 — Appearance & token consolidation (next)

Goal: settle the tokens/scaffolding so page rebuilds don't keep
hitting "where does this knob live?".

- [ ] **Appearance settings reskin** — `components/settings/theme-section.tsx`
  becomes a single editorial section: theme preset cards (curated) +
  editorial controls (Accent / Display font / Corners / Density) inline.
  Tweaks panel and Appearance settings read/write the same state.
- [ ] **Curate theme presets.** Keep the visually-distinct ones; hide the
  ones that overlap with `slothing`. Current candidates to keep:
  `slothing`, `bloxy`, `glass`, `neon`, `premium`. Hide `default`,
  `minimal`, `earth` from the picker (leave preset definitions for
  back-compat — no breaking deletes).
- [ ] **Density CSS hookup** — currently the tokens exist but no shared
  primitives consume them yet. Apply to `PagePanel`, `AppBar`, sidebar
  nav rows, table rows via `padding: var(--density-pad-*)`.
- [ ] **Add Slothing display fonts to next/font.** Right now only Outfit
  is loaded via `next/font/google`; Space Grotesk / Plus Jakarta / Inter
  Tight / DM Sans fall back to system. Either load them all or document
  the fallback so the Tweaks display picker is honest.

## Phase 2 — Dashboard (in flight)

Pass 1 done: editorial "Today" header.

### Two-state design

The dashboard has to read well at both endpoints of user state. The
editorial design assumes a fully populated user; we have to plan the
blank slate too.

**Blank slate** (default user with no data):
- Header: "Today" + date sub. No queue/interview counts since they're 0.
- StreakHeroCard: keep (already handles the empty case).
- FocusedMoves: 2 onboarding-style actions ("Upload your resume",
  "Add your first opportunity") — these come naturally from
  `buildTodayActions` already.
- PipelineStrip: 5 cells, all zero. Numbers in muted ink-3 so the eye
  reads the row as "nothing here yet" instead of "broken".
- RecentTable: empty state — "No applications yet" + inline
  "Add opportunity" link, dashed paper-card style.
- Rail: each card carries a one-line empty state with a clear next step.
  - Profile readiness → "0% — finish your profile so we can tailor better"
  - Resume draft → "No resume yet — upload one to get started"
  - Interview prep → "Nothing scheduled — track an opportunity to interviewing stage"

**Loaded state** (user has jobs, docs, etc.):
- Header: date sub picks up queue + interview counts.
- FocusedMoves: top 2 from `buildTodayActions`, biased toward
  pipeline-action-worthy items ("Review N new opportunities",
  "Prepare for upcoming interview", etc.).
- PipelineStrip: real counts from `stats.jobsByStatus`.
- RecentTable: most recent 4-5 jobs.
- Rail:
  - Profile readiness — % + 4-item checklist.
  - Resume draft — newest tailored doc with completion bar.
  - Interview prep — soonest interviewing-stage opportunity with date
    and Start prep button.

### Mock-seed for verification

Existing `apps/web/.local.db` already has ~7 jobs from prior dev work.
That's enough to verify the loaded state with no seeding required.
Add docs + a resume only if the rail cards need real data to look right.

### Components (Pass 2)

- [ ] **`EditorialFocusedMoves`** — paper card, mono-caps eyebrow + display
  17/600 header, two numbered focused-task rows from `buildTodayActions`.
  Falls back to a single onboarding-style row when the actions list is empty.
- [ ] **`EditorialPipelineStrip`** — 5-col grid using codebase labels
  (`Saved · Applied · Interviewing · Offered · Rejected`), each cell:
  mono caps label · display 28/700 number · subtle trend hint. Cells
  link to `/opportunities?status=…`.
- [ ] **`EditorialRecentTable`** — compact table (`Role · Company ·
  Status pill · Posted (mono)`), dropping "Next step" until the codebase
  tracks it.
- [ ] **`EditorialDashboardRail`** — three rail cards: Profile readiness
  (existing ReadinessPanel data), Resume draft, Interview prep.

### Structural rewire

Replace ActiveDashboard's flow with:
```
StreakHeroCard            ← keep slim
EditorialFocusedMoves
grid [main 1fr, rail 320]
├─ Main:
│   ├─ EditorialPipelineStrip
│   └─ EditorialRecentTable
└─ Rail:
    ├─ Profile readiness card
    ├─ Resume draft card
    └─ Interview prep card
```

Removes from page.tsx: `DashboardStatStrip` (4-card), `TodayPanel`,
`PipelineSummary`, `RecentOpportunitiesPanel`. `ReadinessPanel` collapses
into the rail. Functions stay defined in case we want them back; just
unreferenced.

### NewUserDashboard

- [ ] Light reskin only — same header, paper cards now driven by
  editorial tokens (already automatic via theme preset). No structural
  rebuild — onboarding flow isn't in the design.

## Phase 3 — Pages, in nav order

Each gets its own pass once Phase 2 is reviewed. Open questions called
out per page.

### 3.1 Job Queue (`/opportunities`)
- [ ] Editorial page head + "AI suggestion" banner (3px accent left-border).
- [ ] Tab/filter toolbar + filter chip row.
- [ ] Bulk action bar.
- [ ] Job table with company-glyph component (`<CompanyGlyph company="linear">`).
- [ ] Detail drawer (right-side, 480px, Esc-to-close, scrim).
- [ ] Status pill component keyed by stage.
- [ ] Open Q: hide vs. show the codebase's extra columns (source, posted, salary) — handoff covers all.

### 3.2 Component Bank (`/bank` + `/answer-bank`)
- [ ] Category rail (220px) + card grid + inspector (360px).
- [ ] CardKind tags: BULLET / STORY / INTERVIEW / COVER with colour map.
- [ ] Pin button persisted per user.
- [ ] Inspector with strength meter + "where it's used" list.
- [ ] Open Q: which existing route owns this — `/bank`, `/answer-bank`, or a new umbrella? Design treats them as one library.

### 3.3 Resumes (`/studio`)
- [ ] List rail (280px) of saved resumes + completion bars.
- [ ] Paper page preview (`#fffaef` / dark `#161936`) with section headers, accent-bullet markers, locked-in bullet treatment.
- [ ] Inspector rail (320px): match card · suggestion card · quick palette.
- [ ] Open Q: `Studio` currently hosts cover-letter + resume; design treats resumes as a dedicated surface. Keep combined or split?

### 3.4 Applications (`/applications`)
- [ ] 5-column kanban with drag/drop.
- [ ] Per-stage dot colour + interview step indicators.
- [ ] Funnel meta-bar under the board.
- [ ] Open Q: storage of stage transitions — already supported via existing opportunities table?

### 3.5 Interview Prep (`/interview`)
- [ ] Session rail (upcoming / past).
- [ ] Stage with chat transcript + score strip (Structure / Specificity / Pacing).
- [ ] Composer with mic + components-to-pull-from chips.
- [ ] Coach pep card + live interview meta + question queue.

### 3.6 Settings (`/settings`)
- [ ] Vertical settings nav + grouped sections.
- [ ] Wire each settings section to the editorial section primitive.
- [ ] Plan & usage section + danger zone (ties to destructive-actions pattern).
- [ ] Appearance is rebuilt in Phase 1.5.

---

## Cross-cutting components to extract

Some of these recur across multiple pages; build once, reuse.

- [ ] `<CompanyGlyph company="…" size="sm|lg">` — 14 gradient combos.
- [ ] `<EditorialPanel>` / `<EditorialPanelHeader>` / `<EditorialFoot>` — paper bg + rule border + `--r-lg`.
- [ ] `<StatusPill stage="apply|applied|interview|offer|saved">`.
- [ ] `<MonoCap>` — eyebrow/section-label primitive (mono / 0.16em / uppercase).
- [ ] `<EditorialTable>` — compact table with mono caps thead.
- [ ] `<TaskRow>` — numbered focused-task row used in dashboard + applications.
- [ ] `<MatchScoreBar value={92}>` — accent fill with thresholding (≥85 olive, ≥65 accent, <65 amber).
- [ ] `<KbdChip>⌘K</KbdChip>`.

## Cross-cutting open questions

1. **Brand glyph at 28px.** Current sloth mascot looks dense at top-left. Smaller mark or simpler glyph?
2. **"New" button menu.** Right now just opens command palette. Wire a real menu of "Add opportunity / Upload doc / New resume / …"?
3. **Bell with red dot.** Decorative. Hide until there's a notifications API, or wire now to existing channels (digest emails, follow-ups)?
4. **Coach rail revisit.** Design's coach rail is the most personality-laden part. Punt indefinitely, or add as Phase 4 once core surfaces ship?
5. **i18n on AppBar literals.** Search placeholder, "New", aria-labels are English-only. Add to `messages/en.json` (and run translations through whatever pipeline updates the others)?
6. **"Job Queue" vs "Opportunities".** Per the existing decision, keep "Opportunities" everywhere. But design copy says "Job Queue" — should the page head on `/opportunities` say "Opportunities" or "Job Queue"?

---

## Build gates

Every phase must pass:

- `pnpm type-check`
- `pnpm run lint` (includes `forbidden-color-lint.cjs`)
- `pnpm run test:run`
- Smoke render at `http://localhost:3000/en/<route>`
