# Slothing landing — asset generation spec

Generate the per-section illustration stills for the new Slothing landing
page. Same character + palette + style as the existing `loop-hero.png` you
already produced.

---

## 1. Character + palette anchors (apply to EVERY asset)

**Mascot:** the Slothing sloth — anime-style 2D illustrated, soft cel-shading,
clean outlines, painterly background shadows. Canonical reference:
`apps/web/public/brand/sloths/slothing-mascot-canonical-reference.png`.

**Outfit (identical every image):**
- Dark indigo zip-up hoodie, sleeves rolled
- Cream/oat long-sleeve sweater underneath
- Beige cargo pants
- Cream low-top sneakers with navy heel tab
- Round wire-frame glasses with subtle swirl in lenses
- Light brown fur, slightly darker mask around eyes
- Calm, gently smiling expression

**Palette:**
- Page cream: `#F4ECDB` (light scene backgrounds)
- Paper cream: `#FFF8E6`
- Midnight indigo: `#1A1A2F` (dark scene backgrounds / accents)
- Rust accent: `#C9531A` (ONE small accent per scene — cushion / mug / cable / thread / button — never more than one rust object)
- Ink lines: `#2A2418`
- Muted: `#675D49`

**Forbidden:**
- Baked text or labels in the images (no words, no captions)
- Multiple mascots per panel
- Slick-SaaS gradients (no glossy plastic)
- 3D renders / photoreal
- More than one rust object per scene

Soft paper grain ok. Heavy noise, glitch, chromatic aberration — no.

## 2. Repo + worktree setup

Working directory: `/home/anonabento/slothing` (the user's main checkout).

**Do NOT work in the main checkout.** Create a dedicated worktree off `main`
so the work survives if a parallel agent shifts branches:

```bash
cd /home/anonabento/slothing
git fetch origin main
git worktree add -b slothing/landing-assets \
  ../slothing-landing-assets origin/main
cd ../slothing-landing-assets
```

Commit each asset (or small batch) in its own commit so the user can review
or revert individually. NEVER add `Co-Authored-By: Claude …` trailers.

**First commit:** copy this spec doc into `docs/handoff/landing-assets.md`
so it survives future branch shifts.

## 3. Assets to generate — 8 stills, 4:3 (1600×1200 px each)

These are stills for now. The user will later turn each into a 10–20s
looping animation via Remotion or Hyperframe. Generate them as poster
frames that look "filmable" — composition that suggests motion.

Save each to the **exact** path listed.

### Loop stage stills

#### 1 — `apps/web/public/marketing/sections/atomize.png`

The mascot at a tidy wooden desk, opening a paper folder. Small labeled
paper cards (blank labels, no text) float gently UP from the open folder
like file particles drifting into the air. Cream background. Single rust
accent: a rust thread on the folder OR a rust mug on the desk corner. Soft
window light. Mood: focused, careful.

#### 2 — `apps/web/public/marketing/sections/capture.png`

Same mascot napping in a soft armchair, eyes closed, small blanket draped
over its lap. Half-moon visible through a window. Warm desk-lamp glow. On a
side table, a laptop is open and glowing softly; out of the laptop screen,
a thin stream of blank job-listing cards drifts up and over, stacking
inside a vintage paper tray nearby. Mood: peaceful, late-evening, mildly
magical. Single rust accent: the lamp shade.

#### 3 — `apps/web/public/marketing/sections/review.png`

Same mascot at a small breakfast table by a window. Morning light. Coffee
mug steaming, half-eaten toast on a plate. Mascot holds a smartphone in
both hands, looking at it with calm concentration. On the phone screen, a
single blank job card is visible. Two faint "ghost" cards stack behind it
to suggest a queue. A few small cards drift off the side to imply
swipe-history. Single rust accent: the phone case OR the mug.

#### 4 — `apps/web/public/marketing/sections/tailor.png`

Same mascot at a tidy desk, both hands gesturing toward an assembled resume
page that floats above the desk like a magnet board. Smaller blank
component cards orbit around the resume, some "snapping into" labeled
slots on the page. Cream background. Single rust accent: one rust component
card or a rust pen on the desk.

#### 5 — `apps/web/public/marketing/sections/autofill.png`

Same mascot seated at a desk, calmly tapping a single key on a keyboard
with one finger. A cascade of small form fields fills itself in mid-air
above the keyboard, each blank field filling left-to-right with a soft
brushstroke. Mascot looks slightly bored — the work is doing itself.
Single rust accent: the spacebar key OR one form field's highlight.

#### 6 — `apps/web/public/marketing/sections/practice.png`

Same mascot in a comfortable armchair, holding a small handheld microphone
to its mouth, speaking. Soft sound waves drawn as concentric pencil arcs
radiating from the mic. Subtle warm rim light. Single rust accent: the
microphone foam OR the armchair pillow.

### Non-loop section stills

#### 7 — `apps/web/public/marketing/sections/extension.png`

Same mascot sitting at a desk in front of a laptop. A simplified browser
window mockup is open on the screen (no real text — just suggested UI
shapes: a job-listing layout, an extension popup hovering at the top
right). The Slothing mark (small rust dot or sloth silhouette) is visible
in the browser toolbar. Mascot is making a small "click" gesture toward
the extension popup. Cream background. Single rust accent: the extension
popup glow.

#### 8 — `apps/web/public/marketing/sections/open-source.png`

Same mascot at a desk, looking at a glowing terminal window. The terminal
shows abstract code shapes (no real text). A small badge floats above the
mascot's head suggesting "AGPL · BYOK" — but rendered as small geometric
icons, NO baked words. Cream background. Single rust accent: a rust badge
sparkle near the terminal.

## 4. Optional bonus — hero loop poster

#### 9 — `apps/web/public/marketing/sections/the-loop-poster.png`

A composite hero frame: same mascot centered, three or four soft "ghost"
mascot silhouettes faintly visible behind it suggesting movement through
the loop (atomizing on the left → resting in the middle → speaking on the
right). One unified scene, not a comic strip. Mood: this is the cover of a
short film. Used as the autoplay video poster in the landing hero.

Aspect ratio for this one: **16:10 (1920×1200 px)**.

## 5. Quality bar

- Each image must read clearly at 800px wide
- Mascot face + glasses crisp
- Mascot character identical across all 8 — same fur, glasses, outfit, height; only pose changes
- No baked text anywhere
- No more than one rust object per scene
- Consistent painterly style — match `loop-hero.png` directly

## 6. Deliverable

- Branch `slothing/landing-assets` (in a worktree at `../slothing-landing-assets`)
- 8 (or 9 if you do the bonus) committed PNG files at the exact paths above
- One commit per image with a descriptive message ("Add atomize section illustration", etc.)
- A **draft** PR against `main` summarizing the assets generated
- NEVER add `Co-Authored-By: Claude …` trailers
