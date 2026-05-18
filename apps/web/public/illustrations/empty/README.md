# Empty-state illustrations

Source assets for `EmptyIllustration` (see `src/components/ui/empty-states.tsx`).

**Generation rules**: `docs/empty-states-and-headers-plan/illustration-prompt.md`.
**Why these names**: each maps 1:1 to a feature's onboarding empty state. The component requests `/illustrations/empty/<name>.svg`, then tries `.webp` and `.png`, and finally falls back to a lucide icon disc if the asset is missing — safe to ship copy before art lands.

## Manifest

Format: `<filename>` — scene line to append to the locked prompt.

### Batch 1 — app empty-state system

- `dashboard-fresh` — sloth calmly arranging a blank job-search board, a resume sheet, and role cards into an orderly starter system. Conveys "setting up the search system from scratch".
- `components-zero` — sloth gently splitting one resume sheet into reusable blank component cards. Conveys "extract reusable proof points".
- `studio-zero` — sloth guiding selected component cards toward a tailored resume sheet beside one blank job card. Conveys "compose tailored docs from selected proof".
- `opportunities-zero` — sloth organizing blank role cards on a tracking board with a follow-up note and small calendar artifact. Conveys "tracking the application board".
- `answers-zero` — sloth arranging reusable blank answer flashcards beside a pencil. Conveys "save reusable answers".
- `calendar-empty` — sloth opening a mostly blank planner with a few small interview/follow-up markers ready to be scheduled. Conveys "calendar ready for search events".
- `ats-zero` — sloth feeding one resume sheet through a simple scanner with a blank checklist panel. Conveys "scan the resume against requirements".
- `opportunities-review-empty` — sloth watching pending role cards land in an inbox tray. Conveys "review queue ready for new roles".

### Batch 2 — secondary pages

- `upload-zero` — sloth holding a single paper résumé over an open paper tray. Conveys "drop a file here".
- `opportunities-research-empty` — sloth holding an oversized magnifying glass over a single role card, taking notes on a pocket pad.
- `interview-empty` — sloth at a desk surrounded by neatly fanned-out interview index cards, holding one up and reading it.
- `toolkit-email-templates-empty` — sloth licking the flap of an envelope, with two more envelopes neatly stacked on the desk.
- `toolkit-salary-empty` — sloth sliding stacks of small coins into labeled jars marked with role levels.
- `toolkit-recruiter-empty` — sloth reading a polite recruiter note and drafting a reply on a sheet of stationery.
- `analytics-empty` — sloth standing next to a chalkboard that has three small bar charts drawn on it, holding chalk.
- `extension-connect-empty` — sloth holding a single chrome puzzle piece up to the light, fitting it into a frame.
- `extension-connect-waiting` — sloth at a window, watching street traffic of paper résumés walk past.
- `documents-empty` — sloth pulling a labeled folder out of a small filing cabinet drawer.

### Per-asset variants

For each `<name>.svg` we can also produce `<name>-dark.svg` in the dark palette. The component does not yet request the dark variant — wiring that up is a follow-up. Until then, the light variant renders against both themes; this is acceptable for now because the illustrations sit on `bg-paper` and use the app's paper/ink/rust palette.

## Adding a new asset

1. Append the scene line to this README under the appropriate batch.
2. Generate using the locked prompt.
3. Trace / clean to SVG, target < 40 KB.
4. Run the QA checklist from `docs/empty-states-and-headers-plan/illustration-prompt.md`.
5. Commit `<name>.svg`, `<name>.webp`, or `<name>.png` here. Reference it in the relevant empty state via `illustrationName="<name>"`.

## App empty-state rule

Use the illustration as a small static visual anchor only. The actual explanation belongs in app text and `HowItWorksDiagram`, not inside the artwork. Larger narrative diagrams belong on marketing pages.
