# Sloth empty-state illustration — locked prompt

**Status:** v2 — 2026-05-17
**Used by:** every asset under `apps/web/public/illustrations/empty/`.

## Why the style is constrained

Empty states are the highest-attention moment in the app — the user has nothing to do _except_ look at them. Inconsistent illustration style would read as cheap. This document locks the style so any generator (codex image gen, internal designer, contractor) produces assets that drop in next to existing ones without re-balancing.

If you're tempted to deviate, write a new prompt for a new family — don't bend this one.

## The locked prompt

Paste this verbatim into the image generator, then append the per-asset scene. Keep one paragraph, no bullet lists — generators are more obedient with prose.

> Editorial illustration of one calm sloth doing the feature's job, hand-drawn line art with light textured fills. Light paper background close to #FFFAEF / #F5EFE2. Midnight indigo ink line work close to #1A1530 / #2D2A66 with restrained rust accent fills close to #B8704A. Slight grain texture; visible pencil sketch lines under the main strokes. Subject centered, ~70% of the frame, square 1:1 composition. The sloth interacts with one relevant artifact only; keep props simple and work-focused. No text, no readable labels, no logos, no UI chrome, no screenshots, no speech bubbles inside the illustration. Calm, warm, competent adult-professional tone with a cute but restrained expression — never surprised, panicked, waving, childish, goofy, or zany. Avoid 3D rendering, gradients, glossy highlights, lens flares, busy backgrounds, watermarks, signatures, coffee mugs, laptops, or startup-aesthetic filler unless the feature literally requires it.

### Per-asset scene — append to the prompt above

Each asset name in the manifest below maps to one scene line. Always end with: _"Single sloth interacting with the artifact described. Same line-weight and palette as above."_

## Theme + dark mode

- **Light theme**: use the prompt as written. File: `<name>.svg`.
- **Dark theme**: re-prompt with `Dark paper / Midnight Indigo background (#161936)`, `cream line work (#F5EFE2)`, `rust accent (#B8704A)`. File: `<name>-dark.svg`.
- The `EmptyIllustration` component picks the variant via CSS `prefers-color-scheme` _or_ a runtime swap once we wire the theme provider in (Phase 2 follow-up — currently we only request the light file).

## Format + delivery

- **Source**: prompt output as PNG at 1024×1024 minimum.
- **Delivery**: hand-traced to SVG (or auto-vectorized via `svgo` + manual cleanup) and saved with the asset name from the manifest. If a raster output is intentionally retained, save as WebP/PNG next to the same slug; `EmptyIllustration` tries SVG, then WebP, then PNG before falling back to the icon.
- **Target file size**: < 40 KB per SVG. Strip metadata, simplify paths.
- **Aspect**: 1:1. The component renders 176×176 mobile, 224×224 desktop, so design at 480×480 effective viewable area.
- **Color tokens**: hardcoded hex inside the SVG is fine (the SVG sits behind editorial paper bg, not theme-mixed in CSS).

## a11y

- The `<img>` rendered by `EmptyIllustration` uses `alt=""` by default — the illustration is decorative; meaning is carried by the adjacent headline + `HowItWorksDiagram`.
- Never embed text inside the SVG — it can't be translated, can't be read by screen readers, can't be themed.

## QA checklist before merge

For every new SVG:

- [ ] Renders correctly against `bg-paper` (cream light, Midnight Indigo dark).
- [ ] No bitmap fallbacks embedded — pure paths only.
- [ ] No fonts referenced.
- [ ] `viewBox="0 0 480 480"`, no fixed `width`/`height` attributes.
- [ ] Hand-checked in Firefox + Chrome + Safari (Safari is a notorious SVG nudger).
- [ ] File < 40 KB after `svgo`.
- [ ] Adds an entry to `apps/web/public/illustrations/empty/README.md`.

## Forbidden notes

- No mascot waving "hi". The sloth is _doing the thing the feature does_, not greeting the user.
- No speech bubbles, no text balloons, no inline labels.
- No emoji-tier cuteness — adult professional users.
- No coffee mugs, no laptops, no startup-aesthetic clichés unless the feature literally requires one (e.g., interview prep can show a laptop).
- Sloth's eyes always open — closed eyes read as "this product is asleep".
