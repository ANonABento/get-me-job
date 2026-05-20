# Opportunity card — bento builder redesign

Status: **Draft — implementation-ready in phases**
Parent: `docs/opportunity-card-bento-spec.md`
Related: `docs/opportunity-customization-spec.md` (bucket F)
Triggered by: user feedback 2026-05-20 — "the dragging system in the
layout menu is pretty poor and doesnt work too well … paper muted
accent isnt adding much … i dont get how the rows and cols work
either … more like a inventory grid with resizable edges". Plus split
the description into structured sub-sections.

---

## 1. What's wrong today

The bento builder (`apps/web/src/components/opportunities/bento-layout-builder.tsx`)
ships the data model and the cell catalog but the *interaction model*
is broken:

1. **Cell drag doesn't match the grid.** Cells live in CSS Grid driven
   by `gridCol`/`gridRow`/`colSpan`/`rowSpan`. The drag uses dnd-kit's
   `rectSortingStrategy` which treats cells as a flat sortable list.
   The drop preview lies — and on drop, `renumberRows()` collapses
   every cell into a vertical stack, destroying the bento arrangement.
2. **Tone dropdown is noise.** `Paper / Muted / Accent` is a
   set-once-then-forget control taking up the same visual real estate
   as the drag handle. Should be an icon affordance.
3. **Cols / Rows numeric pickers are abstract.** Users have to
   understand the underlying CSS Grid math. The right UX is direct
   manipulation — drag a cell's edge to resize.
4. **Body chunk is monolithic.** A single `summary` chunk dumps the
   whole posting blob. Users want to split it into
   `responsibilities`, `required-skills`, etc. — each as its own
   chunk users can place wherever.

## 2. Goal

Make the bento builder feel like a real spatial editor:

- Cells live on a shared grid. You drag a cell — it moves; you drag
  its edge — it resizes; collisions push neighbors out of the way.
- Tone is a one-tap pick from a small palette icon.
- The body's summary chunk gets siblings (`responsibilities`,
  `required-skills`, `preferred-skills`, `benefits`) that render as
  small ordered lists so users compose their description bento.
- Live preview updates in real time as the user drags/resizes.

## 3. Non-goals

- Custom CSS / typography on cells.
- Per-cell drag animations beyond what `react-grid-layout` gives.
- Inventory-style cell *rotation* (cells stay rectangular, aligned to
  grid).
- Importing layouts from other users.

## 4. Architecture

Hybrid drag system:

- **`react-grid-layout`** owns cell-level drag + resize + collision.
  Speaks `{i, x, y, w, h}` — direct mapping to our existing
  `BentoCell { id, gridCol, gridRow, colSpan, rowSpan }` shape. No
  data-model change.
- **`@dnd-kit`** continues to own *chunks between cells* (dragging a
  chunk chip out of one cell and into another, or into the disabled
  tray). RGL doesn't do chunk-level drag.

Boundary: RGL handles the `<div data-cell-id="…">` container; dnd-kit
handles `<button>` chunk chips inside each cell.

Bundle cost: `react-grid-layout` adds ~80 kB minified + ~30 kB of
`react-resizable`. Acceptable for a feature this central to the
review-queue UX.

## 5. New chunks

Add to `CHUNK_KEYS` (`apps/web/src/lib/opportunities/layout-chunks.ts`):

| Key | Renders | Source field | Default placement |
|---|---|---|---|
| `responsibilities` | Bulleted list (max 6 items, "+ N more" on overflow) | `opportunity.responsibilities` | disabled tray |
| `required-skills` | Chip cluster (`Badge variant="outline"`) | `opportunity.requiredSkills` | disabled tray |
| `preferred-skills` | Chip cluster, muted tone | `opportunity.preferredSkills` | disabled tray |
| `benefits` | Bulleted list (max 4) | `opportunity.benefits` | disabled tray |

Each new chunk returns `null` when its field is empty, so a posting
without responsibilities just won't render that cell — matches the
existing chunk-collapse behavior. Default placement is the disabled
tray (not the default layout) because not every posting has these
fields; users opt-in by dragging them onto the card.

Existing `summary` chunk stays as-is — it's the "everything-else"
catch-all blob.

## 6. UI changes

### 6.1 Tone control (`CellEditor` header)

Before:

```
[≡] Label input              [X]
[Cols dropdown] [Rows dropdown]
[Paper/Muted/Accent dropdown]
[Chunk chips dropzone]
```

After:

```
[≡] Label input    [Palette] [X]
[Chunk chips dropzone]
```

`Palette` is a small icon button (`Palette` from lucide-react).
Clicking opens a popover with 3 swatches (Paper / Muted / Accent) —
one click picks + closes. Title attr identifies the current tone for
screen readers.

The Cols / Rows dropdowns vanish entirely. Cell sizing is now a
matter of dragging the cell's edges in the grid surface.

### 6.2 Grid surface

The grid editor area becomes a `<ResponsiveReactGridLayout>` with:

- `cols: { lg: <user's columns picker value>, sm: <user's columns> }`
- `rowHeight: 80` (matches our visual rhythm — same height each row)
- `compactType: "vertical"` (cells reflow to fill gaps after drag)
- `preventCollision: false` (default — neighbors push out of way)
- `resizeHandles: ["se", "e", "s"]` (right, bottom, bottom-right
  corners only; keep left/top static so the user's mental model is
  "I'm extending this cell")
- `isDraggable: true`
- `isResizable: true`
- `onLayoutChange`: writes back to `desktop.cells` mutating
  `gridCol`/`gridRow`/`colSpan`/`rowSpan` (1-indexed in our schema,
  0-indexed in RGL — small adapter).

### 6.3 Real-time preview

`<BentoLayoutBuilder>` already calls `onChange(next)` on every state
mutation; the modal's `handleChange` debounces persist by 300 ms but
sets `draft` synchronously. The `<BentoGrid>` preview is rendered
against `draft`, so today it already updates in real time on every
mutation. The redesign keeps this — RGL's `onLayoutChange` fires on
every drag/resize tick, so the preview moves with the cell.

## 7. Implementation phases

| Phase | Scope | Files (≤5/phase) | Verify |
|---|---|---|---|
| **P0** — Spec | This doc + checkbox of acceptance criteria | `docs/bento-builder-redesign-spec.md` | n/a |
| **P1** — New body chunks | Add `responsibilities`, `required-skills`, `preferred-skills`, `benefits` to chunk catalog + `RenderChunk` cases | `layout-chunks.ts`, `render-chunk.tsx`, `layout-preview-fixture.ts`, `bento-layout.test.ts` (extends), maybe `default-bento.ts` (disabled list) | `tsc`, opportunity vitest scope, forbidden-color lint, preview fixture renders each new chunk |
| **P2** — Tone control | Replace dropdown with palette icon + popover; drop Cols/Rows pickers | `bento-layout-builder.tsx`, `bento-layout-builder.test.tsx` (assertion update) | `tsc`, builder vitest, manual: confirm popover opens + closes + writes tone |
| **P3** — react-grid-layout integration | Add deps; replace cell sortable with `<ResponsiveReactGridLayout>`; adapter for our 1-indexed schema; remove `renumberRows` | `bento-layout-builder.tsx`, `package.json`, `globals.css` (RGL styles import or scoped), maybe new `bento-grid-adapter.ts` | `tsc`, builder vitest, manual: drag + resize + neighbor-push |
| **P4** — Polish + a11y | Resize handle styling matches editorial system; keyboard a11y test for resize-via-arrow-keys; remove dead `SpanPicker` code | `bento-layout-builder.tsx`, `bento-layout-builder.test.tsx` | `tsc`, full opportunity vitest scope, forbidden-color lint |

Each phase ships as its own commit on `audit/overnight-01`. P0 lands
first (this commit). P1 can ship before P2/P3/P4 because the new
chunks are render-only — they don't depend on the grid system.

## 8. Acceptance criteria

Verifiable at HEAD after all phases land. Each row pinned to a phase.

- [ ] **(P1)** `CHUNK_KEYS` includes `responsibilities`,
      `required-skills`, `preferred-skills`, `benefits`. Schema
      rejects unknown keys; defaults migrate cleanly via
      `getEffectiveBentoLayout()`.
- [ ] **(P1)** Each new chunk renders correctly in the preview
      fixture (visual smoke) and returns `null` when its source field
      is empty.
- [ ] **(P2)** Cell header is `[grip] [label] [palette] [X]` — no
      dropdowns. Clicking the palette icon opens a 3-swatch popover;
      clicking a swatch sets tone + closes.
- [ ] **(P2)** Cols and Rows numeric pickers are removed from the
      DOM. Pinned by a `expect(queryByText("Cols")).toBeNull()`-style
      assertion in the builder test.
- [ ] **(P3)** Dragging a cell on the desktop grid moves it; on
      release, `desktop.cells[i].gridCol/gridRow` reflect the new
      position. Cells don't visually decouple from their cursor
      during drag.
- [ ] **(P3)** Dragging a cell's right or bottom edge resizes it;
      if the new size would overlap a neighbor, the neighbor reflows
      below (RGL's vertical compaction).
- [ ] **(P3)** `onLayoutChange` writes back during drag/resize so the
      live preview moves with the cell, not after release.
- [ ] **(P4)** Resize handles use the editorial design tokens (no
      `bg-white` / `bg-gray-…` from RGL defaults — covered by the
      forbidden-color lint).
- [ ] **(P4)** Keyboard a11y: a focused cell can be moved with
      arrow keys (RGL's default behavior, but pinned by a test).
- [ ] Type-check clean (`pnpm exec tsc --noEmit --pretty false`).
- [ ] Full opportunity test scope passes (`pnpm exec vitest run
      src/components/opportunities 'src/app/[locale]/(app)/opportunities'
      src/lib/opportunities`).
- [ ] Forbidden-color lint clean.

## 9. Risks

| Risk | Mitigation |
|---|---|
| RGL bundle size (~80 kB) bloats the review-queue route | Lazy-load via `next/dynamic` if needed; measure with `pnpm run build --stats` |
| RGL's default CSS injects non-token colors | Scope its CSS or override via globals; covered by forbidden-color lint |
| Hybrid dnd-kit + RGL drag conflicts | Chunk chips have `data-rgl-cancel-drag` attribute so they don't trigger RGL drag; spec proves this works in a unit test |
| Mobile (`< 768 px`) doesn't use the grid editor | Mobile flow is already a separate vertical priority list — unchanged by this redesign |
| Schema migration for new chunks breaks old user prefs | `getEffectiveBentoLayout()` already injects unknown keys into `disabled` — extends naturally |

## 10. Out of scope (future)

- Inventory-grid *rotation* (cells stay rectangular).
- Saved layout presets.
- AI-suggested cell composition based on user dismiss/apply patterns.
- A tablet-specific layout (only desktop + mobile today).
- Per-source layouts.
