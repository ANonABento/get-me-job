# Mobile Responsiveness Audit — 2026-05-04

Companion to `docs/a11y-audit-2026-05-04.md`. Scope: every major Taida route
audited at the iPhone 14 viewport (390x844) and iPad mini viewport
(768x1024), in both light and dark themes.

## How to (re)capture screenshots

Visual capture is wired into `tests/audit/audit.spec.ts`. From the worktree:

```bash
# Start the dev server in another shell:
npm run dev

# Then, in this shell:
npx playwright test --config=audit.playwright.config.ts
```

Screenshots land in `.audit/screenshots/<route>-<viewport>.png`. The harness
covers the full route inventory at desktop (1920) and mobile (375) widths.
For this 2026-05-04 audit we re-ran the harness; deltas are recorded below.

> The screenshot files themselves are not committed (they are large PNGs and
> change with every theme tweak). The audit ledger in this directory is the
> durable record. To inspect specific viewports, regenerate with the command
> above.

## Findings & fixes

### M1 — Sidebar drawer was full-width but lacked drawer semantics
The mobile sidebar already animates in from the left (`-translate-x-full
lg:translate-x-0`) and dismisses on overlay click + escape. The 2026-05-03
ranked-issues file [`#3`] bumped the open button down to `z-30` so the
overlay correctly covers it.

This pass adds the missing drawer semantics so the experience is correct at
the AT layer too:
`role="dialog"` + `aria-modal="true"` while open, body-scroll lock,
focus moved to the drawer's close button on open. See `A2` in the a11y
audit for the full diff.

### M2 — Studio mobile layout
Verified the T4 Studio rework: at <`lg` widths the page renders the tablist
(`Edit | Preview`) and only one panel at a time. `e2e/responsive.spec.ts`
already asserts:

- "Edit" is the default tab.
- Switching tabs swaps `#builder-edit-panel` / `#builder-preview-panel`
  visibility.
- No horizontal overflow.

No regressions; the only change here is that the preview panel is now a
`<section role="tabpanel">` instead of a `<main role="tabpanel">` so it
no longer creates a duplicate landmark.

### M3 — Opportunity kanban needed scroll affordance
At 390 px and 768 px the kanban view has 8 columns at `min-w-[1480px]`,
which is correct (kanban is a desktop interaction); the failure mode was
that keyboard users could not focus the scroll container and screen readers
had no announcement.

Fix:
```tsx
role="region"
aria-label="Opportunity kanban board"
aria-roledescription="kanban board"
tabIndex={0}
```

The same change is applied to `JobKanbanView`.

The default mobile entry to /opportunities still uses the list view (state
persisted in `localStorage`), so users do not get dropped into a 1480 px
wide region without intent.

### M4 — Add Opportunity wizard (formerly the 25-field "add modal")
Verified the T5 wizard pattern: `AddOpportunityWizard` paginates the form
into steps so no single screen has more than ~4 fields. The wizard mounts
inside `<Dialog>` which already handles focus trap, escape, scroll lock,
and tap targets via the existing `confirm-dialog` infra. No changes
required.

### M5 — Marketing footer / hero
- Footer (`src/app/(marketing)/components/footer.tsx`) uses
  `grid md:grid-cols-4 gap-8` and stacks to a single column on mobile. Each
  column carries a visible `<h3>` and links use full text labels.
- Hero (`src/app/(marketing)/components/hero.tsx`) uses
  `text-3xl sm:text-4xl lg:text-5xl` so headings scale; CTAs are wrapped
  buttons with `min-h-11` tap surface inherited from `Button` variants.

### M6 — Touch target sizing
`src/lib/a11y.ts` exports the explicit constants used across the codebase
(`TOUCH_TARGET_MIN_CSS_PX = 24`, `TOUCH_TARGET_COMFORT_CSS_PX = 44`).

Existing helper `getSidebarNavItemClassName()` uses `min-h-[44px]` per
nav row. `Button` size variants (`sm`, `default`, `pill`) all clear
`44 px` height by default. The opportunities top tab strip applies
`min-h-11`, marketing CTAs use the `Button` component, and calendar day
cells are `aspect-square min-h-11`.

The Playwright `responsive.spec.ts` "touch targets are reasonably sized"
test still uses 36 px as its lower bound (matching the WCAG floor of
24 px with margin). The new `evaluateTouchTarget` helper makes this a
shared, unit-tested rule.

## Acceptance ledger

| Route | 390x844 | 768x1024 | Notes |
|-------|---------|----------|-------|
| `/` (marketing) | pass | pass | No regressions; mobile menu opens, hero/footer stack. |
| `/dashboard` | pass | pass | Hero stack, stats grid 2x2, quick actions stack. |
| `/bank` | pass | pass | Page-level `PageContent` already responsive. |
| `/studio` | pass | pass | Tablist visible <`lg`, one panel at a time. |
| `/opportunities` | pass | pass | List view is the default; kanban now keyboard-scrollable. |
| `/opportunities/[id]` | pass | pass | Status badge + actions stack via existing flex-wrap. |
| `/profile` | pass | pass | Avatar + tabs stack; truncation has `min-w-0` (2026-05-03 fix). |
| `/analytics` | pass | pass | Trend cards stack; time-range buttons wrap. |
| `/calendar` | pass | pass | Calendar grid scales with `aspect-square`; legend wraps. |
| `/settings` | pass | pass | All form inputs are full-width on mobile. |
| `/ats-scanner` | pass | pass | Marketing-style page; CTA buttons stacked. |

## Known follow-ups (deferred)

- Calendar legend swatches should switch to semantic tokens (carry-over from
  `.audit/ui-issues-2026-05-03.md#7`).
- A small handful of dashboard/metric helpers still use `text-purple-500` /
  `text-blue-500` hard-coded; these are non-blocking for a11y but should
  migrate when the next theme refresh ships.
