# Source Preview and Citation Spec

## Summary

Improve the import review source-preview system so parsed components preserve
better document order, header locations, bullet locations, and embedded links.
Detailed diagnostics stay dev-only. User-facing UI should show better
highlight behavior and subtle source availability/confidence only.

This builds on the existing PDF preview, fuzzy bbox matching, and
`/api/bank/documents/[id]/match-report` diagnostic endpoint.

## Product Behavior

- Review list appears in source document order.
- Root components jump to their header line instead of a broad full-entry match.
- Bullet rows keep their own source bboxes.
- Embedded PDF links are preserved as metadata and shown in edit/review fields
  when relevant.
- Non-selected highlights stay quiet; selected highlights remain visually clear.
- Match diagnostics remain dev-only.

## Implementation Changes

### Stored source metadata

Add optional source metadata to profile bank entries:

- `sourceOrder`: numeric order from parsed source/document position.
- `sourceHeaderBbox`: bbox tuples for root component headers.
- `sourceLinks`: normalized links found near or inside the source span.

Keep existing `sourcePage`, `sourceBbox`, and `matchMethod` behavior intact.

Implementation notes:
- Additive DB migration only; existing rows remain valid.
- Surface new fields through DB row mapping and API responses.
- Store `sourceHeaderBbox` as JSON with the same tuple shape as `sourceBbox`.
- Store `sourceLinks` as JSON array of `{ url, text?, page?, bbox? }` or an
  equivalent minimal object shape used consistently in code and tests.

### Matching and ordering

- During upload PDF matching, compute `sourceOrder` from parser order first and
  bbox page/y/x second.
- For root entries, resolve a header-specific needle and save it to
  `sourceHeaderBbox` when possible.
- Keep `sourceBbox` for the broader matched content.
- For bullets, continue matching the bullet description under the parent anchor.
- Review list sorting should use:
  1. `sourceOrder`.
  2. `sourceHeaderBbox` page/y/x.
  3. `sourceBbox` page/y/x.
  4. created time/id fallback.

### Link preservation

- Preserve PDF link annotations as structured metadata rather than relying only
  on appending URLs into reconstructed text.
- Attach links to the nearest compatible line/span using page, y overlap, and
  horizontal proximity.
- Project and portfolio URLs parsed from embedded links should land in the URL
  field when the source line identifies a project.
- Keep appended URL text only as a parser compatibility fallback if needed.

### Review UI

- Use `sourceHeaderBbox` for root component jump/selection when present.
- Use `sourceBbox` for bullet highlights.
- Keep non-selected highlights subdued and selected highlights strong.
- Show a compact source state in review UI:
  - located.
  - partially located.
  - not located.
- Do not expose raw candidates, token scores, or match tiers to regular users.
- Keep `/api/bank/documents/[id]/match-report` dev-only and update it to include
  source header/link metadata when available.

## Edge Cases

- Non-PDF imports should still get `sourceOrder` from parse order but no bbox.
- If `sourceHeaderBbox` misses but `sourceBbox` exists, root jump falls back to
  `sourceBbox`.
- If links are ambiguous, store them on the source document metadata or nearest
  entry with lower confidence, but do not overwrite explicit parsed URLs.
- If all bbox matching fails, import still succeeds and entries remain editable.
- Existing cached PDF expiry behavior remains unchanged.

## Test Plan

- DB mapping tests:
  - Reads/writes `sourceOrder`, `sourceHeaderBbox`, and `sourceLinks`.
  - Legacy rows without new fields still map correctly.
- PDF position/link tests:
  - Link annotations associate with the correct line.
  - Project embedded links are preserved as structured metadata.
- Upload matching tests:
  - Root entries receive header bboxes when headers are present.
  - Bullets retain anchored bboxes.
  - Source order matches PDF visual order.
- Review UI tests:
  - List sorts by source order.
  - Root jump uses header bbox.
  - Source state displays located/not located.
- Regression:
  - Kevin Jiang resume still parses expected experiences, projects, education,
    bullets, and project links.
- Run typecheck and targeted lint for touched files.

## Acceptance Criteria

- Imported review list follows PDF order without relying on created-at order.
- Selecting a root component jumps to the header line when available.
- Project links from PDF annotations are preserved as structured metadata.
- Diagnostics remain dev-only; normal users see only useful source state.

## Agent Handoff Prompt

```text
/goal Improve source preview, bbox ordering, and citation metadata for imported components.

Use docs/specs/source-preview-citations.md as the source of truth.

Requirements:
- Add sourceOrder, sourceHeaderBbox, and sourceLinks metadata for profile bank entries.
- Preserve existing sourceBbox behavior.
- Root components should jump/select using sourceHeaderBbox; bullets use their own bbox.
- Review list should sort by sourceOrder, then bbox page/y/x.
- Preserve PDF link annotations as metadata.
- Keep detailed match diagnostics dev-only; user-facing UI should only show source availability/confidence.
- Maintain existing import review behavior and Kevin Jiang resume regression.

Verify with db mapping tests, pdf-position tests, upload matching tests, review UI tests, lint, and typecheck.
```
