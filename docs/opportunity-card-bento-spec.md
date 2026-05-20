# Opportunity card — bento layout spec

Status: **Mostly shipped** — most phases live; this doc was written
retroactively to back-fill the plan that commits `63b0cf35` and
`fd688132` referenced as "forthcoming". Remaining gaps (§7) are the
only open work.

Parent: `docs/opportunity-customization-spec.md` bucket F (Layout per
form factor). Supersedes the F.1 section-based layout described in
`docs/opportunity-card-layout-builder-spec.md`.

---

## 1. Goal

F.1 shipped a section-based reorderer (chunks slot into Header / Meta
/ Body / Actions). On desktop the review-queue card has more screen
real estate than that linear layout uses, so we re-imagined the card
as a **bento grid**: discrete cells with col/row spans, each cell
holding a user-composed set of chunks.

The win:

- Each section gets its own paper-card cell (visual breathing room).
- The description cell can be tall enough that typical postings fit
  without scrolling (was the F.1 pain point).
- Cells are composed (drag chunks between cells, regroup as you like).
- Mobile reuses the same cells through `mobilePriority` ordering +
  `expandedCount` — no second layout to maintain.

## 2. Non-goals

- Custom CSS / theme editing — bento is structural only.
- Per-source layouts.
- AI-suggested layouts.
- Cell padding / inner gap customization — fixed per the editorial
  system.

## 3. Data model

In `apps/web/src/lib/opportunities/bento-layout.ts`:

```ts
interface BentoCell {
  id: string;                    // user-stable; "identity", "signals", or "cell-N"
  chunks: ChunkKey[];            // chunk catalog from F.1 spec §5
  gridCol: number;               // 1-indexed column
  gridRow: number;               // 1-indexed row
  colSpan: number;               // 1..columns
  rowSpan: number;               // 1..6
  label?: string;                // editorial mono-eyebrow caption
  tone?: "default" | "muted" | "accent";
}

interface BentoDeviceLayout {
  columns: 2 | 3 | 4;
  cells: BentoCell[];
  mobilePriority: string[];      // cell IDs in mobile-flow order
  disabled: ChunkKey[];          // chunks not currently placed
}

interface BentoLayoutPreference {
  desktop: BentoDeviceLayout;    // cells + columns + disabled live here
  mobile: { expandedCount: number };  // first N cells expand on phones
}
```

Persisted as JSON in `opportunity_view_preferences.layout_json`. Read
through `getEffectiveBentoLayout()` which accepts:

1. New bento shape → defensive cleanup.
2. Legacy F.1 section shape → `bentoFromSectionLayout()` migration.
3. `null` / unknown → `DEFAULT_BENTO_LAYOUT`.

## 4. Default layout

7 cells over 3 columns (`apps/web/src/lib/opportunities/default-bento.ts`):

```
  col:   1            2          3
  row 1: identity (span 2)       signals
  row 2: location+pay  description (2x2)
  row 3: tags          (desc cont)
  row 4: actions (span 3)
  row 5: quick-actions (span 3)
```

Mobile priority: `identity → signals → description → actions → location-pay → tags → quick-actions`.
First 4 cells expand on phones; the rest collapse.

Default `disabled`: `status-pill`, `source-badge`, `applicant-ratio`.

## 5. Builder UI

`<BentoLayoutBuilder>` is a controlled component (`value` +
`onChange`). The modal wrapper owns persistence.

Top bar:

- **Desktop / Mobile** tab toggle (left).
- **Columns** picker (2 / 3 / 4) — only shown on the Desktop tab.
- **Add cell** button — only shown on the Desktop tab.
- **Reset** button — see §6.

Desktop tab body:

- Sortable grid of `<CellEditor>` cards (one per cell).
- `<DisabledTray>` showing hidden chunks (drag back to re-enable).

Mobile tab body:

- Sortable list of `<MobilePriorityRow>` items — one per cell, in
  priority order. Rows ≤ `expandedCount` show "Above fold"; rest show
  "Collapsed".

Drag mechanics:

- Single `<DndContext>` at the root; namespaced drag IDs (`cell:` /
  `chunk:` / `mp:` / `disabled`) route droppables.
- `PointerSensor` + `KeyboardSensor` registered with
  `sortableKeyboardCoordinates`.
- Empty cells get removed automatically when their last chunk leaves.

Live preview: `<BentoGrid>` rendered with the desktop layout +
`LAYOUT_PREVIEW_OPPORTUNITY` fixture. Sticky on wide viewports; each
column scrolls inside itself so the scrollbar doesn't overlap the
preview (`layout-builder-modal.tsx:145`).

## 6. Reset semantics — **per-tab**

The Reset button is scoped to the active tab:

| Active tab | Restores | Preserves |
|---|---|---|
| Desktop | `desktop.cells`, `desktop.columns`, `desktop.disabled` | `desktop.mobilePriority`, `mobile.expandedCount` |
| Mobile | `desktop.mobilePriority` (filtered against current cells), `mobile.expandedCount` | `desktop.cells`, `desktop.columns`, `desktop.disabled` |

Rationale: "Reset" should only undo the tab the user is looking at;
the previous global reset wiped both modes, which was surprising when
the user only wanted to revert mobile order without losing desktop
work.

## 7. Implementation phases

| Phase | Scope | Status | Commit(s) |
|---|---|---|---|
| **1 — Data model** | `bento-layout.ts` + `default-bento.ts` + schema + migration | ✅ Done | `63b0cf35` |
| **2 — Renderer** | `bento-grid.tsx` + chunk renderer + mobile flow | ✅ Done | `63b0cf35` |
| **3 — Review-queue wiring** | `review-queue.tsx` consumes BentoLayoutPreference | ✅ Done | `63b0cf35` |
| **4 — Builder UI** | `bento-layout-builder.tsx` (cells, tray, mobile priority, dnd-kit) | ✅ Done | `fd688132` |
| **5 — Modal + persistence** | `layout-builder-modal.tsx` + PATCH wiring + settings embed | ✅ Done | `fd688132` |
| **6 — Editorial polish** | Audit-loop run + Apply primary CTA + deadline format + mobile title | ✅ Done | `719b538e..b14278f9` (audit/01..19) |
| **7 — Responsive fixes** | Desktop/Mobile tabs in builder + scrollbar fix + flex-height card | ✅ Done | `dffd347a` |
| **8 — Per-tab Reset** | Reset button respects active tab (§6) | ✅ Done | (this commit) |
| **9 — Keyboard a11y test** | Vitest coverage that the builder is keyboard-reachable + sensor-wired | ✅ Done | (this commit) |

Phases 1–7 are documented above + in the spec-trace doc
(`docs/ui-audit/audit-overnight-01-spec-trace.md`). Phases 8 + 9 are
the only open work and ship together in the same change set as this
spec.

## 8. Acceptance criteria

Verifiable at HEAD after phases 8 + 9 land:

- [x] Bento layout renders the review card at desktop ≥ 768px;
      mobile flow renders below (`review-queue.tsx:35` chooses via
      `matchMedia(max-width: 767px)`).
- [x] Schema (`bentoLayoutPreferenceSchema`) rejects unknown chunks,
      duplicate cell IDs, and cells exceeding column count.
      Coverage: `bento-layout.test.ts`.
- [x] `getEffectiveBentoLayout()` migrates a legacy F.1 section
      layout into bento cells without data loss.
- [x] Builder modal: editing a layout updates the live preview in
      real time without a save click.
- [x] Disabling a chunk parks it in the hidden tray; dragging it back
      into a cell restores it.
- [x] **Desktop / Mobile tab toggle** at the top of the builder; only
      the active tab's controls are visible.
- [x] Modal scrollbar sits inside the editor column, not in front of
      the preview.
- [x] Desktop card caps at `calc(100vh-180px)` and scrolls internally
      if the description is expanded past the cap.
- [x] **(Phase 8)** Reset button on Desktop tab restores desktop
      cells/columns/disabled without touching mobilePriority or
      expandedCount. Reset on Mobile tab restores mobilePriority +
      expandedCount without touching desktop cells. Coverage:
      `bento-layout-builder.test.tsx > "per-tab Reset (phase 8)"`.
- [x] **(Phase 9)** Keyboard a11y: every chunk chip in the builder
      has a meaningful `aria-label`; the `<DndContext>` registers
      `KeyboardSensor` with `sortableKeyboardCoordinates`; the tab
      toggle and Reset button are keyboard-operable. Coverage:
      `bento-layout-builder.test.tsx > "keyboard a11y (phase 9)"`.
- [x] Type-check clean (`pnpm exec tsc --noEmit --pretty false`).
- [x] Full opportunity test scope passes (`pnpm exec vitest run
      src/components/opportunities 'src/app/[locale]/(app)/opportunities'
      src/lib/opportunities`).
- [x] Forbidden-color lint clean
      (`node apps/web/scripts/forbidden-color-lint.cjs`).

The two unchecked rows are what phases 8 + 9 close.

## 9. Risks / known divergences from F.1

| Divergence | Why | Mitigation |
|---|---|---|
| Modal instead of right-side sheet | Builder has its own live preview, so the "queue card visible behind the sheet" argument didn't hold | Documented in `layout-builder-modal.tsx:9–13` |
| Mobile breakpoint at 768px, not 640px | Consistency with the rest of the editorial system (Tailwind `md:`) | Documented in F.1 §10 risk row; revisit only if users complain |
| Re-enabling a chunk places it at the end of the target cell (not at its prior position) | Bento cells are user-composed; "prior position" isn't well-defined when the cell layout changed | Acceptable — F.1's "prior position" semantics don't translate to bento cleanly |

## 10. Out of scope

- AI-suggested cell layouts.
- Saved layout presets / share / export.
- Tablet-specific layout (Desktop + Mobile only).
- Custom cell colors / typography overrides.
