# Opportunity card layout builder — Spec (F.1)

Status: **Planned** · parent: `docs/opportunity-customization-spec.md` §4 bucket F.1 · target phase: P2 (last remaining customization bucket)

## 1. Goal

Let users define **which chunks render where** on the review-queue card, independently for desktop and mobile. Today's layout is hard-coded in `apps/web/src/components/opportunities/review-queue.tsx`; F.0 (responsive grid) shipped the visual win, F.1 ships the personalisation.

The win: the spec author can put salary at the top, the recruiter can hide tags, the mobile user can drop the meta row. All without code changes.

## 2. Non-goals

- **Custom CSS / colors.** This is a structural reorderer, not a theme editor.
- **New chunks beyond §5 list.** A future spec can extend `RenderChunk`; F.1 ships with the chunk vocabulary already present in the hard-coded JSX.
- **Per-source layouts** (e.g. different layout for LinkedIn vs WaterlooWorks). Single layout per device today; revisit if users ask.
- **AI-suggested layouts.** Out of scope.

## 3. Entry points

1. **Review queue toolbar** — small "Layout" icon button in the existing `[PresetBar] [SortDropdown]` row. Opens the builder in a **right-side sheet** (`<Sheet>`) so the user can still see their queue card behind the panel as ground truth.
2. **Settings** — `/settings → Opportunity preferences → Card layout`. Same `<LayoutBuilder>` component, mounted inline (no sheet wrapper). Long-form configuration surface for users who want to spend more than 30s on it.

The sheet is the primary entry; the settings embed is the discoverable / shareable URL.

## 4. UI

```
╭──────────────────────────────────────────────────────────────╮
│ Card layout                            [Reset]   [Done]      │
├──────────────────────────────────────────────────────────────┤
│ ┌──────────┬──────────┐                                      │
│ │ Desktop  │ Mobile   │   ← independent tabs, independent    │
│ └──────────┴──────────┘     specs                            │
│                                                              │
│ ┌─ Chunks ────────────────┐  ┌─ Preview ────────────────┐    │
│ │ HEADER                  │  │  Acme · Senior Engineer  │    │
│ │ ≡ Company            ⊙  │  │  [pending] [remote]      │    │
│ │ ≡ Title              ⊙  │  │                          │    │
│ │ ≡ Status pill        ⊙  │  │  • 47 applicants         │    │
│ │ ≡ Remote badge       ⊙  │  │  • 2 openings · F25      │    │
│ │ ≡ Source badge       ⊙  │  │                          │    │
│ │                         │  │  Toronto, ON · $48k/yr   │    │
│ │ META ROW                │  │  Deadline May 22         │    │
│ │ ≡ Applicants         ⊙  │  │                          │    │
│ │ ≡ Openings           ⊙  │  │  React · TypeScript      │    │
│ │ ≡ Work term          ⊙  │  │                          │    │
│ │ ≡ Level              ⊙  │  │  Lorem ipsum dolor sit…  │    │
│ │ ≡ Applicant ratio    ⊙  │  │                          │    │
│ │                         │  │  [Dismiss] [Save] [Apply]│    │
│ │ BODY                    │  │  Search company · Open    │    │
│ │ ≡ Location           ⊙  │  └──────────────────────────┘    │
│ │ ≡ Salary             ⊙  │                                  │
│ │ ≡ Deadline           ⊙  │                                  │
│ │ ≡ Tags               ⊙  │                                  │
│ │ ≡ Summary            ⊙  │                                  │
│ │                         │                                  │
│ │ ACTIONS                 │                                  │
│ │ ≡ Dismiss            ⊙  │                                  │
│ │ ≡ Save               ⊙  │                                  │
│ │ ≡ Apply              ⊙  │                                  │
│ │ ≡ Search company     ⊘  │ ← disabled state                 │
│ │ ≡ Open original      ⊘  │                                  │
│ └─────────────────────────┘                                  │
╰──────────────────────────────────────────────────────────────╯
```

**Interaction details:**

- **Drag scope is per-section.** "salary" can't move into the actions block. Sections are structurally meaningful — header sits above title, meta row is a flex strip, body is the main column, actions live in the footer bar. This is the simplest UX that doesn't produce structurally broken cards (vs free-form list where the user can flatten everything).
- **Eye toggle (⊙ active / ⊘ disabled)** disables a chunk in-place without losing its position. Toggle back on → it's where you left it.
- **Reset** button restores `default-layout.ts` for the active tab. No "reset both" — one tab at a time.
- **Done** persists + closes the sheet. Optimistic save (instant feedback); rollback on PATCH failure with a toast.
- **Live preview** uses a static sample opportunity (defined in `apps/web/src/lib/opportunities/layout-preview-fixture.ts`) so changes are instantly visible without picking a real card from the user's queue. Sample data covers every chunk so users can see what each one looks like.
- **Drag handle** is the entire row, with keyboard support via `@dnd-kit` (Space to pick up, arrows to move, Space to drop, Escape to cancel).

## 5. Chunk catalog

Identical to the parent spec table; reproduced here so this doc is self-contained.

| Key | Renders | Section |
|---|---|---|
| `company` | Company name | header |
| `title` | Job title | header |
| `status-pill` | Status pill | header |
| `remote-badge` | "Remote" badge (only when remoteType === "remote") | header |
| `source-badge` | Source platform badge ("WaterlooWorks") | header |
| `applicants` | "N applicants" | meta |
| `openings` | "N openings" | meta |
| `workTerm` | Work term (e.g. "Fall 2026") | meta |
| `level` | Level (e.g. "Senior") | meta |
| `applicant-ratio` | Applicants per opening (e.g. "23.5/opening") | meta |
| `location` | "City, Province, Country" | body |
| `salary` | Normalized salary string (via bucket G renderer) | body |
| `deadline` | "Deadline May 22" | body |
| `tags` | Custom tags as badge cluster | body |
| `summary` | Description preview (truncated to 260 chars) | body |
| `dismiss` | Dismiss action button | actions |
| `save` | Save action button | actions |
| `apply` | Apply action button | actions |
| `google-company` | "Search company" link (bucket H) | actions |
| `open-original` | "Open original" link (bucket H) | actions |

Chunks that conditionally render (e.g. `remote-badge` only when `remoteType === "remote"`) simply return `null` from `RenderChunk` when the data is absent. No "(empty)" placeholder — the layout collapses around it.

## 6. Default layouts

Defined in `apps/web/src/lib/opportunities/default-layout.ts`. These are seeded for every new user and restored on "Reset".

**Desktop** (`max-w-5xl`, density-first):

```
header:  [company, title, status-pill, remote-badge, source-badge]
meta:    [applicants, openings, workTerm, level]
body:    [location, salary, deadline, tags, summary]
actions: [dismiss, save, apply, google-company, open-original]
disabled: [applicant-ratio]
```

**Mobile** (`max-w-md`, vertical-clarity-first):

```
header:  [company, title, status-pill]
meta:    [applicants, workTerm]
body:    [salary, deadline, summary, tags]
actions: [dismiss, save, apply]
disabled: [openings, level, applicant-ratio, location, source-badge, remote-badge,
           google-company, open-original]
```

Mobile drops chunks that fight for vertical real estate: extra meta items, location (often duplicated by company city in the title), and the secondary quick-action links. The user can re-enable any of them through the builder.

## 7. Data model

Extend `opportunity_view_preferences` table (additive migration, same pattern used for bucket E):

```sql
ALTER TABLE opportunity_view_preferences ADD COLUMN layout_json TEXT;
```

`layout_json` stores the full LayoutPreference object (one row per user, two specs inside):

```ts
interface LayoutPreference {
  desktop: {
    header: ChunkKey[];
    meta: ChunkKey[];
    body: ChunkKey[];
    actions: ChunkKey[];
    disabled: ChunkKey[];
  };
  mobile: LayoutPreference["desktop"];
}
```

`null` / missing column → use `default-layout.ts` at read time. **No backfill required** — users without a custom layout get the default for free.

PATCH endpoint (`/api/preferences/opportunities`) gains:

```ts
layoutPreference: layoutPreferenceSchema.optional()
```

…validated by a Zod schema in `@slothing/shared/schemas` that enforces:

- Every key in `desktop.*` and `mobile.*` is a known `ChunkKey`
- No chunk appears twice within the same device's spec (sum of all 5 arrays)
- Every chunk appears exactly once per device (enabled + disabled is the full set)

Validation guarantees the renderer never encounters an unknown chunk or a missing one — no runtime fallback complexity.

## 8. Files

**New**

- `apps/web/src/lib/opportunities/layout-chunks.ts` — `CHUNK_KEYS`, `CHUNK_SECTIONS`, `CHUNK_LABELS`, `ChunkKey`, `Section` types, `layoutPreferenceSchema` (Zod)
- `apps/web/src/lib/opportunities/default-layout.ts` — `DEFAULT_DESKTOP_LAYOUT`, `DEFAULT_MOBILE_LAYOUT`, `getEffectiveLayout(prefs)` helper
- `apps/web/src/lib/opportunities/layout-preview-fixture.ts` — static sample opportunity covering every chunk (CAD/USD salary, 47 applicants/2 openings, deadline, remote, etc.)
- `apps/web/src/lib/opportunities/render-chunk.tsx` — `<RenderChunk opportunity chunk />` central renderer. Returns `null` for absent data (e.g. no salary on the posting). Used by both the live review-queue card and the live preview.
- `apps/web/src/components/opportunities/layout-builder.tsx` — the drag-and-drop builder. Uses `@dnd-kit/core` + `@dnd-kit/sortable`. Props: `value: LayoutPreference, onChange(next: LayoutPreference)`.
- `apps/web/src/components/opportunities/layout-builder-sheet.tsx` — thin `<Sheet>` wrapper used by the review queue (loads prefs, optimistic save, toast on failure)
- `apps/web/src/lib/opportunities/layout-chunks.test.ts` — schema + section grouping tests
- `apps/web/src/lib/opportunities/default-layout.test.ts` — every default chunk passes schema validation; getEffectiveLayout merges correctly

**Modified**

- `apps/web/src/components/opportunities/review-queue.tsx` — accepts `layoutDesktop` + `layoutMobile`. Card JSX becomes section loops: `layout.header.map(chunk => <RenderChunk />)`. The `useMediaQuery` (or CSS-driven) split decides which spec applies.
- `apps/web/src/app/[locale]/(app)/opportunities/review/page.tsx` — fetches layout alongside other prefs; Layout button + sheet state
- `apps/web/src/components/settings/opportunity-preferences-section.tsx` — embeds `<LayoutBuilder>` inline as a new sub-section under existing "Visible badges"
- `apps/web/src/lib/db/opportunity-view-preferences.ts` — `layout_json` column + read/write
- `apps/web/src/app/api/preferences/opportunities/route.ts` — PATCH schema extension
- `packages/shared/src/schemas.ts` — `CHUNK_KEYS`, `layoutPreferenceSchema` exports
- `apps/web/package.json` — add `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`

## 9. Implementation phases

**Phase 1 — Plumbing (no UI change visible)**

Refactor only. Existing card structure renders via `RenderChunk` calls driven by `default-layout.ts`, so subsequent phases can swap layouts without re-touching JSX.

- Build chunk catalog + types + Zod schema
- Build `RenderChunk` covering every existing chunk
- Build default-layout + getEffectiveLayout
- Refactor `review-queue.tsx` to consume LayoutPreference instead of hard-coded JSX
- Snapshot-test before/after — pixel-identical render

**Phase 2 — Builder UI**

- Install `@dnd-kit`
- Build `<LayoutBuilder>` with section-scoped sortables + visibility toggle
- Build live preview using fixture data
- Wire `<Sheet>` wrapper, mount from review queue toolbar
- Persist via PATCH + optimistic update

**Phase 3 — Settings embed + polish**

- Embed `<LayoutBuilder>` in `opportunity-preferences-section.tsx`
- Reset button per tab
- Keyboard a11y pass (focus management on drag start, Space/arrow controls)
- Empty-section state (e.g. user disabled every header chunk → show "+ Add chunk" affordance)

Phase 1 alone is shippable — it just normalises the renderer. Phase 2 is where the daily UX lands. Phase 3 makes it polished for the settings page surface.

## 10. Risks

| Risk | Mitigation |
|---|---|
| User disables every action chunk → card becomes un-actionable | Validate at least one of `dismiss/save/apply` is enabled. Inline warning before persist. |
| Drag handle bleed into the parent sheet (scroll-jacking) | Use `@dnd-kit`'s `restrictToParentElement` modifier + explicit `overflow-y-auto` on the sortable list container |
| Layout schema drift over time (we add a chunk; old layouts don't know it) | `getEffectiveLayout` injects new chunks into the right section's `disabled` list automatically. Existing prefs never break. |
| Visible-badges preference (already shipping) overlaps with layout meta toggles | Deprecate `visibleBadges` once F.1 lands. The chunk-level eye toggle is strictly more expressive. Migration: any badge currently *hidden* via `visibleBadges` gets moved to the layout's `disabled` list on first read after upgrade. |
| Mobile breakpoint heuristic (`<640px`) might not match the user's intent | Document it; revisit only if users complain |

## 11. Acceptance criteria

- [ ] Reordering chunks updates the preview card in real time (no save click required)
- [ ] Reset button restores the default for the active device tab without touching the other tab
- [ ] Mobile (`<640px` viewport) renders the queue card using `layout.mobile`; otherwise `layout.desktop`
- [ ] Keyboard-only flow works: Tab to a chunk, Space to pick up, arrows to move, Space to drop, Escape to cancel
- [ ] Disabling a chunk hides it from the live card; re-enabling restores its prior position
- [ ] Schema validation rejects unknown chunks + duplicate chunks
- [ ] Snapshot test confirms Phase 1 refactor produces pixel-identical output to the hard-coded JSX
- [ ] `visibleBadges` migration: any user with a hidden badge gets it pre-moved to layout `disabled`
- [ ] Sheet from review queue can be opened, edited, saved, and closed without losing the user's spot in the queue
- [ ] Settings-embedded builder behaves identically to the sheet version (same component, no behavioural drift)
- [ ] Type-check + full Vitest suite clean
- [ ] Forbidden-color lint clean (builder uses semantic tokens only)

## 12. Open questions

1. **`@dnd-kit/sortable` vs `react-aria-components` Sortable?** dnd-kit has better DX and is the de facto standard, but `react-aria` is what some other surfaces in the repo use (worth checking). Default: dnd-kit unless we find prior art.
2. **Save on every drag, or on "Done" click?** Spec says optimistic-save-on-change. Tradeoff: more PATCH traffic vs always-fresh state. Recommend save-on-change with debounce (300ms).
3. **Should the sheet show the user's actual queue card as preview** (instead of fixture data)? More truthful but means changes don't show on absent fields. Defer to fixture for v1; reconsider after dogfood.

Resolve before implementation if any of these turn out to be load-bearing.

## 13. Out of scope (future)

- Per-source layouts (LinkedIn vs WaterlooWorks)
- Custom chunk groups beyond Header/Meta/Body/Actions
- Tablet-specific layout (only Desktop + Mobile today)
- Share / export / import a layout via JSON
- AI-suggested layout based on user's apply/dismiss patterns
