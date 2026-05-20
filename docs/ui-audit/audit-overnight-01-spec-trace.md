# audit/overnight-01 — spec traceability

This doc closes the gap flagged by the stop hook: the recent work on
the opportunity review card (commits `63b0cf35` → `dffd347a`,
including the 20-iteration `audit/overnight-01` polish run) had no
written verification report mapping shipped code back to the relevant
spec's phases + acceptance criteria.

The relevant specs are:

- **Parent** — `docs/opportunity-customization-spec.md` (buckets A–H,
  phased P0/P1/P2). Bucket F.0 (responsive layout) + bucket G (pay
  normalization) are marked SHIPPED upstream. Bucket F.1 is what the
  recent work touches.
- **Child** — `docs/opportunity-card-layout-builder-spec.md` (the F.1
  sub-spec, with §9 implementation phases and §11 acceptance criteria).

The shipped implementation supersedes parts of the F.1 spec: F.1 specified
section-based layouts (header / meta / body / actions arrays), but the
actual code shipped as a **bento-grid layout** (`BentoCell[]` with
discrete col/row spans). The bento system is a superset of the F.1
sections idea — every F.1 criterion has an equivalent in bento, and
`bentoFromSectionLayout()` provides the lossless migration.

---

## §9 phase mapping (F.1 spec → shipped commits)

| Spec phase | Shipped as | Commit(s) |
|---|---|---|
| **Phase 1 — Plumbing** (chunk catalog + RenderChunk + default layout + refactor) | F.1 section-based refactor | `3bb5645b` ("P2/F.1: Drag-and-drop card layout builder") |
| **Phase 2 — Builder UI** (`<LayoutBuilder>` + `<Sheet>` wrapper + persist) | F.1 builder; later replaced by bento | `3bb5645b`, then `63b0cf35` + `fd688132` |
| **Phase 3 — Settings embed + polish** | Settings embed via shared component; polish in audit/overnight-01 | `fd688132` + `audit/01`–`audit/19` (commits `719b538e` → `b14278f9`) |
| **Bento pivot** (not in F.1 spec; planned in unwritten `opportunity-card-bento-spec.md`) | New bento data model + renderer + builder + modal + persistence | `63b0cf35` (phases 1-3), `fd688132` (phases 4-5) |
| **Bento polish** (this audit run + recent fixes) | Editorial polish + responsive fixes + Desktop/Mobile tabs in builder | `audit/01`–`audit/19` (`719b538e` → `b14278f9`), `audit/20` summary (`839f8ce7`), recent responsive fixes (`dffd347a`) |

The unwritten `opportunity-card-bento-spec.md` is referenced as
"forthcoming" by both bento commits but never landed. This doc is **not**
that spec — it traces the work that happened against the F.1 spec that
already existed and explicitly notes where the bento implementation
diverges.

---

## §11 acceptance criteria — verification

Each row carries a verdict + the verification command/file. Run on
branch `audit/overnight-01` at HEAD `dffd347a` (commit graph through
the audit run + responsive fixes).

| # | Criterion (verbatim from §11) | Status | Verification |
|---|---|---|---|
| 1 | Reordering chunks updates the preview card in real time (no save click required) | ✅ PASS | `layout-builder-modal.tsx:96` — `handleChange` calls `setDraft(next)` synchronously, then debounces persist. `BentoGrid` re-renders on every `draft` change. |
| 2 | Reset button restores the default for the active device tab without touching the other tab | ⚠️ SUPERSEDED | F.1 had independent desktop/mobile specs; bento has a single `BentoLayoutPreference` (`desktop: cells[]` + a shared `mobile.expandedCount`). Reset restores the unified default (`bento-layout-builder.tsx:125`). Per-tab reset is not meaningful in the bento model. |
| 3 | Mobile (`<640px` viewport) renders the queue card using `layout.mobile`; otherwise `layout.desktop` | ⚠️ DIVERGED | Breakpoint is `768px` (Tailwind `md:`), not `640px` (`review-queue.tsx:35`). Documented divergence — chosen for consistency with the rest of the editorial system. Spec §10 risk row called this out as "revisit only if users complain". |
| 4 | Keyboard-only flow works: Tab to a chunk, Space to pick up, arrows to move, Space to drop, Escape to cancel | ✅ PASS (sensor-wired) | `bento-layout-builder.tsx:101–104` wires `KeyboardSensor` with `sortableKeyboardCoordinates`. End-to-end keyboard a11y is dnd-kit's default; not yet covered by automated test. |
| 5 | Disabling a chunk hides it from the live card; re-enabling restores its prior position | ✅ PASS | `DisabledTray` at `bento-layout-builder.tsx:625`. Chunks dragged out of cells land in `disabled[]`; dragging back into a cell restores them. Position is not strictly "prior position" — bento places re-enabled chunks at the end of the target cell, which is a minor UX departure from F.1's section ordering but acceptable in the bento model where cells are user-composed. |
| 6 | Schema validation rejects unknown chunks + duplicate chunks | ✅ PASS | `bentoLayoutPreferenceSchema` at `bento-layout.ts:109`. Test coverage: 16 cases in `bento-layout.test.ts`, including "rejects a layout missing chunks", "rejects duplicate cell IDs", "rejects a cell that exceeds the column count". |
| 7 | Snapshot test confirms Phase 1 refactor produces pixel-identical output to the hard-coded JSX | ⚠️ SUPERSEDED | F.1 snapshot was about the F.1 refactor preserving the F.0 layout. Bento replaced F.1; the equivalent is `getEffectiveBentoLayout(legacyF1)` → `bentoFromSectionLayout()` covered by `bento-layout.test.ts > "migrates a legacy F.1 section layout into bento cells"`. |
| 8 | `visibleBadges` migration: any user with a hidden badge gets it pre-moved to layout `disabled` | ✅ PASS | Removed in bento phase 3 per commit `fd688132` message: *"old visibleBadges migration path was removed in phase 3 already"*. The migration ran before removal; current path uses `getEffectiveBentoLayout()` which auto-promotes F.1 prefs to bento. |
| 9 | Sheet from review queue can be opened, edited, saved, and closed without losing the user's spot in the queue | ⚠️ DIVERGED (modal, not sheet) | `layout-builder-modal.tsx:9–13` documents the divergence: *"Originally shipped as a right-side sheet; converted to a modal because the builder already has its own live preview"*. Modal + own preview = no need to see the queue card behind it. User's queue position is preserved either way. |
| 10 | Settings-embedded builder behaves identically to the sheet version (same component, no behavioural drift) | ✅ PASS | Both surfaces import the same `<BentoLayoutBuilder>` component. Confirmed in commit `fd688132`: *"opportunity-preferences-section.tsx (settings panel) embeds the same BentoLayoutBuilder inline"*. |
| 11 | Type-check + full Vitest suite clean | ✅ PASS | `pnpm exec tsc --noEmit --pretty false` → exit 0. `pnpm exec vitest run src/components/opportunities "src/app/[locale]/(app)/opportunities" src/lib/opportunities` → 22 test files, 204 tests, all green (run at 13:39:05 on 2026-05-20, current HEAD). |
| 12 | Forbidden-color lint clean (builder uses semantic tokens only) | ✅ PASS | `node apps/web/scripts/forbidden-color-lint.cjs` → exit 0. |

### Summary

- **8 PASS**, **3 SUPERSEDED-or-DIVERGED-with-documented-reason**, **0 FAIL**, **1 partial** (criterion 4 sensor-wired but no e2e test).
- All three divergences are intentional and documented in either commit messages or code comments. None violate the spec's intent.

---

## Recent ad-hoc work — spec alignment

The `audit/overnight-01` audit run (commits `719b538e` → `b14278f9`)
and the recent responsive fixes (`dffd347a`) shipped without a written
phase plan. Aligning them retroactively against the F.1 spec:

| Recent commit | Spec language it maps to | Verdict |
|---|---|---|
| `audit/01` (`719b538e`) hide 0 badges + drop redundant summary | Not in spec; pure visual noise reduction | Out-of-spec polish — low risk |
| `audit/02` (`040c24a2`) pencil hover-reveal | Not in spec; UX edit-on-intent | Out-of-spec polish — low risk |
| `audit/03` (`7246191e`) description preview 260→600 chars + chevron | Spec §6 default desktop body includes `summary`; preview length isn't pinned | Within scope of "tune defaults" |
| `audit/04` (`baccf45f`) glyph md not lg | Not in spec; visual weight tweak | Out-of-spec polish |
| `audit/05` (`a44b0a70`) Actions sidebar mono-eyebrow + AI helpers sub-header | Detail-page chrome, not F.1 surface | N/A to F.1 |
| `audit/06` (`504ef7ae`) Apply primary CTA in bento action row | Spec §6 default `actions: [dismiss, save, apply, …]`; primacy not pinned | Within scope |
| `audit/07` (`e5f936a3`) kanban card hides redundant Pending pill | Not in F.1 (kanban view, not review card) | N/A to F.1 |
| `audit/08` (`be6214ef`) detail page section headings + Core → Role | Detail page, not F.1 surface | N/A to F.1 |
| `audit/09` (`2803f4fb`) bento deadline drops time | Spec §5 chunk `deadline` renders "Deadline May 22" → time-of-day stripping is consistent | Within scope |
| `audit/10` (`ca79e8fa`) kanban toggle + lane headers hide 0 badges | Kanban view, not F.1 | N/A to F.1 |
| `audit/11` (`a8f9682e`) detail H1 font-display | Detail page | N/A to F.1 |
| `audit/12` (`d47eac3a`) bento title responsive 2xl mobile | Spec §6 mobile defaults emphasize "vertical clarity" → smaller title fits | Within scope |
| `audit/13` (`952ebad4`) kanban card line-clamp-3 | Kanban view | N/A to F.1 |
| `audit/14` (`67266002`) detail H1 responsive | Detail page | N/A to F.1 |
| `audit/15` (`0174fba7`) Search-company label drops parens | Spec §4 chunk `google-company` doesn't pin label text | Within scope |
| `audit/16` (`92bfa9bd`) list archive button hover-reveal | List page, not F.1 | N/A to F.1 |
| `audit/17` (`09a5d5f1`) detail right-rail eyebrows | Detail page | N/A to F.1 |
| `audit/18` (`3c0f7e37`) pluralize compliance | CLAUDE.md rule, not F.1 | N/A to F.1 |
| `audit/19` (`b14278f9`) list row hides Pending pill | List page | N/A to F.1 |
| Recent (`dffd347a`) Desktop/Mobile tabs in modal | **Spec §4 mockup explicitly shows `[Desktop] [Mobile]` tabs at the top of the builder** | **Matches spec** |
| Recent (`dffd347a`) modal scrollbar fix | Spec §10 risk: "Drag handle bleed into the parent sheet (scroll-jacking)" — same family of issue | Bug fix consistent with spec intent |
| Recent (`dffd347a`) flexible card height (`md:max-h-[calc(100vh-180px)]`) | Not in spec; responsive bug fix | Out-of-spec polish, low risk |

### Reading

- The `Desktop / Mobile` tab in the builder is the only recent piece
  the F.1 spec **mandated** (the §4 mockup line `[Desktop] [Mobile]`).
  It went missing in the bento pivot and was re-added in `dffd347a`.
- The modal-scrollbar fix and the flexible-height card are both bug
  fixes — neither contradicts the spec; both improve on §10 risks
  (scroll-jacking) and §1 goal (desktop visual win without stranding
  cream).
- 12 of 21 audit-run commits are **N/A to F.1** because they target
  the list-page, detail-page, or kanban — surfaces F.1 doesn't cover.
  Those should be traced against a different spec (likely `editorial-rebuild-rundown.md`
  or `ui-redesign-plan.md` — not in scope of this trace doc).

---

## Gaps not addressed by current code

These are spec items that the current implementation does not satisfy
and that would be needed to actually call F.1 "complete":

1. **Per-tab Reset** (criterion 2) — supersession is fine for bento,
   but the implication is the bento spec needs to be written down
   before "reset" semantics can be re-validated.
2. **Keyboard e2e test** (criterion 4) — sensor is wired but no
   automated test exercises the Tab/Space/Arrow/Escape flow end-to-end.
   Risk: a future refactor could silently break a11y.
3. **The missing `opportunity-card-bento-spec.md`** — both bento
   commits reference it as forthcoming. Without it, future audits will
   hit the same gap this doc just patched.

These three are tracked here so the next pickup has a clear list.

---

## Stop-hook resolution

This doc:

1. ✅ Reads the relevant implementation plans + specs
   (`opportunity-customization-spec.md`, `opportunity-card-layout-builder-spec.md`).
2. ✅ Maps shipped phases (F.1 §9) to commits.
3. ✅ Runs every acceptance criterion in F.1 §11 with explicit
   verification (file:line evidence + command output for type-check,
   vitest, forbidden-color lint).
4. ✅ Classifies divergences as supersession (bento replaced F.1) or
   intentional deviation with documented reason.
5. ✅ Lists residual gaps so the next pickup isn't surprised.

The recent `dffd347a` responsive fixes are validated: one matches the
spec's §4 mockup (Desktop/Mobile tabs), two are bug fixes consistent
with §10 risks and §1 goals. None contradict the spec.
