# Editorial rebuild — TODO + parallel work plan

Living plan for the Phase 3 in-product rebuild against Kev's **v2 handoff**
(`.design-ref-v2/design_handoff_v2/`). Supersedes the Phase 3 portion of
`editorial-rebuild-roadmap.md` (Phases 0–2 remain valid there).

Updated **2026-05-15** after reviewing `slothing-kev(2).zip`.

---

## What v2 changes vs. v1

| Topic | v1 plan (in roadmap.md) | v2 reality | Action |
|---|---|---|---|
| Page count | 7 surfaces | 11 surfaces (adds Toolkit, Calendar, Analytics, Profile as first-class pages) | Expand the plan |
| Bank vs. Answer Bank | Open Q: which route owns it | One umbrella: **Knowledge Bank** | Merge `/bank` + `/answer-bank` → `/bank` UI label "Knowledge Bank" |
| Resume Studio | Open Q: combined or split | v3 design is **one editor for any document** | Keep `/studio` combined (resume + cover letter) |
| Applications page | Phase 3.4 had a kanban | No dedicated Applications surface — pipeline lives inside Opportunities | Drop `/applications` rebuild; fold stage transitions into Opportunities |
| Email Templates | Phase 3 prep group | Folded into Toolkit (`tk-tab` "email") | Move `/emails` content into `/toolkit` tabs |
| Salary Tools | Phase 3 prep group | Folded into Toolkit (`tk-tab` "salary") | Move `/salary` content into `/toolkit` tabs |
| Default radius | We default to `soft` (6/10/14) | v2 designs use `sharp` (2/4/6) by default | **Decision:** keep current `soft` default; `sharp` is a user-selectable Tweak |
| Sidebar grouping | Home / Documents / Pipeline / Prep / Reporting | Workspace / Connections (dashboard HTML) **or** Home / Library / Pipeline / Prepare / Insights (README) — inconsistent | **Decision:** keep current 5-group structure but rename labels editorial: Home / Library / Pipeline / Prepare / Insights |
| Dashboard quick actions | `EditorialFocusedMoves` two-row task list | 4-up grid of named verb cards with ⌘-shortcuts (Add to Knowledge Bank · Analyze a JD · Open Studio · Run mock interview) | Replace `EditorialFocusedMoves` with `QuickActionStrip` |
| Source Serif 4 | not loaded | v2 calls it out for "accent serif, used sparingly" | Add to `next/font` loader, expose as `data-display="serif"` (optional) |
| Opportunities entry | tab/filter toolbar | **`.paste` box** at the top: prominent paste-a-JD CTA → match-score flow | Build paste-box primitive, place above filter bar |

**All Open Qs now resolved (2026-05-15):**

| # | Question | Decision |
|---|---|---|
| 1 | Job Queue title | **Opportunities** (v2 H1) |
| 2 | Component Bank umbrella | Single **Knowledge Bank** at `/bank`; `/answer-bank` 308 → `/bank?tab=answers` |
| 3 | Studio split | Keep **combined** (resume + cover letter in one editor) |
| 4 | Applications kanban | Dropped — pipeline = Opportunities |
| 5 | Coach rail | Opt-in per page; primary placement Interview Prep |
| 6 | `/applications` route | **Deleted** (was stale bento-ya auto-rescue, ~60 LOC, no inbound refs) |
| 7 | `/emails`, `/salary` routes | 308 → `/toolkit?tab=email` and `?tab=salary` (Wave 2) |
| 8 | `/opportunities/review` | **Keep as separate route**; add visible entry from Opportunities head + Dashboard rail card |
| 9 | Profile | **Top-right AppBar chip only**; NOT in sidebar nav (simplifies vs. v2) |
| 10 | Toolkit utilities scope | **Full**: email + salary + cover-letter gen + recruiter rewriter. (ATS is its own surface — see Q#11.) |
| 11 | ATS — placement & handoff | **Dedicated `/ats` route in primary nav**, not a Toolkit tab. Marketing scanner + in-app scanner share `<ScannerForm>` core. Handoff: **Option C** — no state migration. Post-signup land on dashboard; ATS scan appears as an onboarding step. See "ATS placement" below. |
| 12 | Marketing landing | **Polish + audit only** against current `(marketing)/page.tsx` — no v2 rebuild. |

### ATS placement (Open Q #11 detail)

ATS is a **first-class capability**, not a tab. Two surfaces, one scoring core:

- `/(marketing)/ats-scanner` — unauthenticated lead capture; "no signup required" promise; marketing chrome. CTA at the bottom: "Create an account to save your scans → /signup".
- `/ats` (new app route, in primary nav under Prepare) — authenticated; editorial chrome; opportunity-picker; scan history.

**Handoff pattern: Option C — clean separation.**

After unauth scan, the signup CTA goes to `/signup` with the standard
NextAuth flow → user lands on `/dashboard` like any other signup. No
state is migrated; their scan stays on the marketing page in their
session. They're not promised "your scan will follow you" — the value
prop is "create an account to *save future* scans."

**Dashboard onboarding gets a new step:** *"Score a resume against a JD"*
that links to `/ats`. This is where they re-experience the tool, this
time with persistence. Combined with the existing onboarding steps
(upload resume, add first opportunity), it surfaces ATS as one of the
"first three things" without depending on freemium handoff plumbing.

Shared component: extract the scoring form's core to
`src/components/ats/scanner-core.tsx`. Marketing wraps it in landing
chrome + "Sign up to save" CTA; the `/ats` page wraps it in an editorial
panel + opportunity-picker + history list.

**Onboarding refresh:** end-of-design pass to update
`src/lib/onboarding/steps.ts` to reflect the new surface inventory
(Knowledge Bank, ATS step added; legacy steps removed if obsolete).
Tracked as a Wave 3 task in this doc.

---

## Cross-cutting primitives (build first, foreground)

Build these on `phase3-primitives` branch before any page agent fires.
Co-locate under `src/components/editorial/` so they're discoverable.

| # | Primitive | Anatomy | Notes |
|---|---|---|---|
| 1 | `<MonoCap>` | mono / 0.14em / uppercase, 10–12.5px, color tokenized | Eyebrow / section label. Replaces inline `<span className="font-mono text-[10px] uppercase">…`. |
| 2 | `<EditorialPanel>` + `<EditorialPanelHeader>` + `<EditorialPanelFooter>` | bg-paper + 1px rule + `--r-lg`; panel-head row with title + link slot | Replaces current `PagePanel` for editorial surfaces. Existing `PagePanel` keeps its app-shell-panel density hook. |
| 3 | `<StatusPill stage="…">` | pill with dot indicator; variants saved · apply · applied · interview · offer · rejected | One source of truth for status colors (currently hardcoded across `src/components/jobs/*` and `editorial-sections.tsx`). |
| 4 | `<CompanyGlyph company="…" size="sm\|lg">` | 14 named gradients (linear, vercel, notion, figma, stripe, posthog, supabase, webflow, arc, airbnb, anthropic, replit, loom, mercury) + fallback to brand-gradient + initial | Used in op-list rows, dashboard recent table, detail drawer. |
| 5 | `<EditorialTable>` | full-width table, mono-caps thead, rule-hairline rows, hover state | Used in dashboard recent + opportunities list. Wire to `app-shell-cell` density token. |
| 6 | `<TaskRow>` | numbered focused-task row | Dashboard `EditorialFocusedMoves` becomes a list of these. |
| 7 | `<QuickActionStrip>` + `<QuickActionCard>` | 4-up grid of action cards: icon-tile + h + sub + kbd chip | Dashboard hero strip. Wires to existing `useCommandPalette` for `⌘K`-style verbs. |
| 8 | `<MatchScoreBar value={92}>` | accent fill with thresholding (≥85 olive, ≥65 accent, <65 amber) | Studio + Opportunities detail. |
| 9 | `<KbdChip>` | mono-caps key chip; e.g. `⌘ K` | AppBar search hint, command palette, quick-action cards. |
| 10 | `<PasteBox>` | textarea-styled paste surface with action row + source chips | Opportunities header + ATS scanner; reused for any "paste a JD" entry point. |
| 11 | `<EditorialDetailDrawer>` | 480px right-side panel, Esc-to-close, scrim, lockable | Opportunities detail; Knowledge Bank inspector; future detail surfaces. |
| 12 | `<EditorialEyebrow>` | mono-caps + dot + number (e.g. "01 · Knowledge Bank") | Landing deep-dive sections; settings group headers. |

**Build gates per primitive:** type-check + lint + a Vitest covering the
public props. No story file (we don't have a Storybook set up); add a
visual mount in `src/components/editorial/__demo__/` only if you need it.

---

## Page surfaces — final list

11 surfaces total. Some routes consolidate.

| # | Surface | Route | Status | Owner | Notes |
|---|---|---|---|---|---|
| 1 | Dashboard | `/dashboard` | Phase 2 ✅ | — | Pass 3: swap `EditorialFocusedMoves` → `QuickActionStrip` (4-up). |
| 2 | Opportunities | `/opportunities` | Not started | A | `.paste` box → filter bar → `.op-list` (not table) → detail drawer. Include stage transitions. |
| 3 | Knowledge Bank | `/bank` | Not started | B | 280px category rail + main content. Merge `/answer-bank` UX into this surface (keep `/answer-bank` route as 308 → `/bank?tab=answers`). |
| 4 | Studio | `/studio` | Reskin only | — | v3 chrome reskin against existing TipTap editor; combined doc editor. Heavy — own work-stream. |
| 5 | Profile | `/profile` | Not started | C | Editable resume/profile; source-of-truth that Knowledge Bank rolls up from. |
| 6 | Interview Prep | `/interview` | Not started | — | Practice modes + transcript + score strip + **coach rail** (primary placement). |
| 7 | Toolkit | `/toolkit` (new) | Not started | — | Tabbed utility: email + salary + cover-letter gen + recruiter rewriter. (ATS now a separate page.) |
| 8 | ATS | `/ats` (new) | Not started | — | In-app version of marketing scanner: opportunity-picker, history, share `<ScannerCore>`. |
| 9 | Calendar | `/calendar` | Reskin only | — | Upcoming interviews + deadlines. Light pass after primitives. |
| 10 | Analytics | `/analytics` | Reskin only | — | Funnel + heatmap; charts already exist via Recharts. Light pass. |
| 11 | Settings | `/settings` | Not started | D | Tabbed settings nav; appearance section already done in Phase 1.5. |
| 12 | Marketing landing | `/(marketing)/page.tsx` | Polish | — | Audit + polish current landing; **no v2 rebuild** (resolved Q#12). Includes "Create account to save scans" CTA on `/ats-scanner`. |

**Routes to retire / redirect:**

- `/applications` — **deleted** (was stale; see resolved Q#6).
- `/emails` → 308 → `/toolkit?tab=email` after Toolkit lands.
- `/salary` → 308 → `/toolkit?tab=salary` after Toolkit lands.
- `/answer-bank` → 308 → `/bank?tab=answers` after Knowledge Bank lands.
- `/builder`, `/tailor`, `/cover-letter` already 308 → `/studio` (unchanged).

---

## Parallelization plan

Worktree-isolated agents to avoid live-file collisions on shared
(`tailwind.config.ts`, `globals.css`, `page-layout.tsx`,
`editorial/*`). Max 3 in parallel; I integrate diffs between waves.

### Wave 0 — primitives (me, foreground)

On `main` directly (per Kev's preference; everything pushes to `main`
anyway). Build all 12 primitives in `src/components/editorial/`. Each
primitive ships with a Vitest + no visual regressions on existing
routes (smoke after each). Type-check + lint + targeted tests must be
clean before moving to the next primitive.

Build order (lightest first, then dependencies):

1. `<MonoCap>` — depended on by EditorialEyebrow, panel headers, table thead
2. `<KbdChip>` — standalone
3. `<EditorialEyebrow>` — uses MonoCap
4. `<StatusPill>` — standalone (variants per stage)
5. `<CompanyGlyph>` — standalone (14 gradient map + initial fallback)
6. `<MatchScoreBar>` — standalone (threshold-aware fill)
7. `<EditorialPanel>` + `Header` + `Footer` — replaces inline paper-card patterns
8. `<EditorialTable>` — uses MonoCap for thead
9. `<TaskRow>` — used in dashboard + applications-style lists
10. `<QuickActionCard>` + `<QuickActionStrip>` — uses KbdChip
11. `<PasteBox>` — paste-a-JD primitive
12. `<EditorialDetailDrawer>` — 480px right-side drawer, last because most complex

### Wave 1 — three parallel page agents

Most template-driven, least overlap with each other:

- **Agent A — Opportunities** (`/opportunities`): Phase 3.1 work plus
  `<PasteBox>` integration at top, `<CompanyGlyph>` in rows, drawer.
  Worktree branch `phase3-opportunities`.
- **Agent B — Knowledge Bank** (`/bank`): 280px rail + content + 360px
  inspector. Wire `/answer-bank` route to redirect into `tab=answers`.
  Worktree branch `phase3-knowledge-bank`.
- **Agent C — Profile** (`/profile`): editable section grid; reads
  from existing profile API. Worktree branch `phase3-profile`.

Each agent gets:
1. Path to the v2 reference HTML.
2. Path to existing route file(s).
3. Scope notes (this doc).
4. **Constraint:** no edits to `tailwind.config.ts`, `globals.css`, or
   `components/editorial/*` — if they need a new primitive or token,
   flag in their summary; I add it in a fixup pass.

### Integration pause

I read each agent's diff. Resolve overlaps. Run gates. Smoke each
page in the browser. Merge `phase3-primitives` plus the three wave-1
branches into `main` (or a feature branch if we want one PR).

### Wave 2 — three more parallel agents

- **Agent D — Settings** (`/settings`): vertical settings nav + sections;
  appearance done; new: plan & usage + danger zone. Worktree
  `phase3-settings`.
- **Agent E — Toolkit** (`/toolkit`): new route + tabbed surface; port
  email-templates and salary content; add redirects from `/emails` and
  `/salary`. Worktree `phase3-toolkit`.
- **Agent F — Interview Prep** (`/interview`): practice modes,
  transcript, score strip, coach rail (primary use). Worktree
  `phase3-interview`.

### Wave 3 — sequential, no parallel

- **Studio reskin** — me, foreground. Too entangled with TipTap editor
  internals to delegate cleanly. One pass against v3 CSS for the chrome
  only; leave the editor body alone.
- **Calendar + Analytics light passes** — me, foreground, batched. ~half a day.

### Wave 4 — Marketing

Separate work-stream after Open Q #6 is answered. Scope-dependent:

- *If just polish*: one agent against `index.html` deep-dive sections.
- *If new pages*: bigger plan; needs your input.

---

## Process / gates

Per the existing roadmap, every phase must pass:

```bash
pnpm --filter @slothing/web run type-check
pnpm --filter @slothing/web run lint     # next lint + forbidden-color + page-width + forbidden-time
pnpm --filter @slothing/web exec vitest run <touched files>
# Smoke at http://localhost:3000/en/<route>
```

Plus for editorial work specifically:

- All paper cards: `bg-paper` + `border` (1px solid). **No `border-dashed`** on real surfaces (only inert/dropzone hints).
- All shadows: reserved for drawers / modals / popovers. Cards stay flat
  per `slothing` preset `shadowCard: "none"`.
- Eyebrows use `<MonoCap>`, not inline `font-mono uppercase tracking-[…]`.
- Time strings use `<TimeAgo />` or `formatDate*` helpers — never inline
  `Date.toLocaleString()`.
- Destructive actions follow `docs/destructive-actions-pattern.md` —
  confirm dialog (Pattern A) or undo snackbar (Pattern B).

---

## Next concrete step

Resolve open Qs 1–6 above, then I start Wave 0 (primitives). Once
primitives merge, I spawn Wave 1 worktree agents.
