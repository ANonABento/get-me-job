# Landing — Image Asset Prompt Sheet

> For Codex's `image-to-code` / `imagegen-frontend-web` skills. Paste each prompt
> directly. Save the result to the exact `Drop at:` path below — the redesign
> already imports those paths and will pick the asset up automatically. No code
> changes needed once an image lands at the right path.

---

## Character & palette anchors (apply to every prompt)

**Mascot:** the Slothing mascot. Anime-style 2D illustrated sloth (not photoreal,
not 3D, not pixel art). Soft cel-shading, clean outlines, painterly background
shadows. Canonical reference: `apps/web/public/brand/sloths/slothing-mascot-hero.png`.
The mascot wears:

- Dark indigo zip-up hoodie, sleeves rolled.
- Cream/oat color long-sleeve sweater underneath.
- Beige cargo pants.
- Cream low-top sneakers with navy heel tab.
- Round wire-frame glasses with subtle swirl in the lenses.
- Light brown fur, slightly darker mask around the eyes.
- Calm, gently smiling expression.

Always the same character. Same fur color. Same outfit. Same glasses. Different
pose / setting per prompt. Background and props change; the mascot does not.

**Palette (slothing theme):**

- Page cream: `#F4ECDB` (light scenes background)
- Paper cream: `#FFF8E6`
- Midnight indigo: `#1A1A2F` (dark scenes / accents)
- Rust accent: `#C9531A` (cushion, badge, highlight, single small accent)
- Ink (text/lines): `#2A2418`
- Muted ink: `#675D49`

Light scenes lean cream + ink + rust. Dark scenes are Midnight Indigo with cream
moonlight and the rust accent restrained to a single point of interest.

**Visual style notes:**

- Editorial / magazine sensibility, NOT slick-SaaS gradients.
- Subtle paper texture is fine. Hard glossy gloss is not.
- Mild grain acceptable. No heavy noise, no chromatic aberration, no glitch.
- No body text or words baked into the image. UI captions can be implied by
  geometric shapes (paper cards, dotted underlines) but never spelled out —
  copy will be rendered as live HTML over or beside the image.
- Aspect ratios are strict. If the renderer won't honor exact AR, target the
  next-closest standard size and crop center.
- Generate big and readable. Avoid lazy under-generation; details on the
  mascot's face, glasses, and the focal prop must be crisp at 1200px wide.

---

## Asset 1 — The Loop hero illustration

**Drop at:** `apps/web/public/marketing/loop/loop-hero.png`
**Aspect ratio:** 21:9 wide editorial (recommended 2400×1030)
**Where it appears:** Centerpiece of the new `TheLoop` section. Replaces the
current dashed placeholder labeled `Illustration placeholder`. This is the most
important visual on the entire site.

**Prompt:**

> Editorial illustration in the Slothing mascot style. A single panoramic
> daytime scene divided gently into six tableaux flowing left-to-right, like a
> children's-book spread reimagined as a magazine illustration. Cream paper
> background, subtle warm gradient.
>
> Six stages, each anchored by the Slothing mascot in a calm pose, connected by
> a hand-drawn meandering pencil line that threads through all six:
>
> 1. **Atomize** — mascot at a wooden desk, opening a folder; tiny labeled
>    paper cards float up out of the folder like file particles.
> 2. **Capture** — same mascot napping in an armchair under a half-moon; a
>    laptop nearby glows softly; small paper job-listing cards drift into a
>    stack on a side table while it sleeps.
> 3. **Review** — mascot in pyjamas-but-coat at a small breakfast table,
>    holding a phone; on the phone screen, a single job card with a heart
>    icon; a cup of coffee steams gently.
> 4. **Tailor** — mascot at a tidy desk assembling a resume from the same
>    floating paper cards seen in stage 1; the assembled page floats above
>    the desk like a magnet board.
> 5. **Autofill** — mascot tapping a single key; a cascade of small form
>    fields fills itself in mid-air, the mascot calm, almost bored.
> 6. **Practice** — mascot in an armchair with a small handheld microphone,
>    speaking; soft sound waves drawn as concentric pencil arcs.
>
> Color discipline: cream paper background throughout, ink line work for
> outlines, indigo for the mascot's hoodie consistent across all six tableaux,
> rust accent used sparingly — one small rust object per stage (a rust cushion,
> rust phone-case, rust mug, rust folder edge, rust key cap, rust microphone).
> No backgrounds-within-backgrounds. Generous negative space between stages.
> The mascot's character is identical in every panel — same fur, glasses,
> outfit, height; only pose changes.
>
> No baked text, no labels in the image. The "01 / 02 / 03 / 04 / 05 / 06"
> numbering will be added in HTML below the illustration. Wide editorial
> composition; image must read clearly on a 14-inch laptop screen.

**Avoid:** stock infographic arrows, generic SaaS "step 1/2/3" rectangles,
3D renders, glossy plastic gradients, multiple mascots per panel,
text/words inside the image.

---

## Asset 2 — Overnight capture (Anchor 02)

**Drop at:** `apps/web/public/marketing/anchors/overnight-capture.png`
**Aspect ratio:** 16:10 (recommended 1920×1200)
**Where it appears:** Top of the `CaptureAndQueueSection` left column —
above the two phone cards. Sets up the "jobs come to you in your sleep"
visual gag.

**Prompt:**

> Editorial illustration in the Slothing mascot style. A nighttime indoor
> scene: the Slothing mascot is napping in a soft armchair, eyes closed,
> a small blanket draped over its lap. The room is lit by a window with a
> half-moon visible outside; warm desk-lamp glow pools on the floor.
>
> On a side table next to the chair, a laptop is open and glowing softly.
> Out of the laptop screen, a thin stream of small white paper job-listing
> cards drifts gently up and over — each card is a simple rectangle with
> a tiny dot for a company logo and a dotted line for a title (no real
> text). The cards float into and stack neatly inside a vintage paper
> tray labeled with an empty paper tag (label intentionally blank — we
> overlay text in HTML).
>
> Mood: peaceful, late-evening, mildly magical. The mascot is calm and
> sleeping; the work happens around it. A single rust accent: the
> blanket OR the lamp shade is the rust color, nothing else.
>
> Palette: Midnight Indigo dominates the room, cream/oat moonlight and
> lamp light, ink line work for outlines, restrained rust accent on one
> object. The mascot's hoodie is the same indigo as the canonical
> reference.
>
> Wide horizontal composition. No baked text or labels.

**Avoid:** crowded desk clutter, computer screen filled with readable UI
(the screen should be a soft glow only), more than one rust object,
generic "moon and stars" cliche, a second mascot.

---

## Asset 3 — Mobile review-queue hero (optional, recommended)

**Drop at:** `apps/web/public/marketing/anchors/review-queue-mobile.png`
**Aspect ratio:** 4:5 vertical portrait (recommended 1200×1500)
**Where it appears:** *Not yet wired in code* — if you generate it,
ping me and I'll add a slot next to the existing two phone cards inside
`CaptureAndQueueSection`. Visualizes the "tinder for jobs on your phone
at breakfast" moment.

**Prompt:**

> Editorial illustration in the Slothing mascot style. The Slothing
> mascot sits at a small wooden breakfast table by a window. Morning
> light. A plate with a half-eaten piece of toast and a cup of coffee
> with steam are on the table. The mascot is holding a smartphone in
> both hands, looking at it with calm concentration.
>
> On the phone screen, a single illustrated job card is visible —
> rectangular, with a company-logo placeholder dot, a job title implied
> by a dotted line, and a small heart icon at the bottom. Beneath the
> phone, two faint "ghost" cards stack to imply more in the queue.
>
> Off to the side, a few small cards have already drifted off the
> phone in a soft trail, implying the mascot has been swiping through
> them comfortably for a few minutes.
>
> Palette: cream paper background, warm morning light through the
> window. Mascot in the canonical indigo hoodie. A single rust accent:
> the phone case OR the mug.
>
> Mood: domestic, unhurried, deeply mundane in the best way. This is
> someone job hunting on a Tuesday morning, not stressed.
>
> Vertical portrait composition, ideal for a tall product card on
> desktop and a hero strip on mobile. No baked text on the phone
> screen.

**Avoid:** an iPhone notch rendered with brand-accurate detail (keep
the phone generic), realistic chrome, a second mascot, a busy room.

---

## Asset 4 — Closer mascot scene (optional, future polish)

**Drop at:** `apps/web/public/brand/sloths/slothing-mascot-closer.png`
**Aspect ratio:** 3:4 portrait (recommended 1200×1600)
**Where it appears:** Inside the `Closer` section, in the dark inverse
panel on the right column. Currently we reuse the canonical
`slothing-mascot-hero.png` there, which works — but a *seated, satisfied*
mascot would close the page on a stronger emotional note.

**Prompt:**

> Editorial illustration in the Slothing mascot style. The Slothing
> mascot is seated calmly in a comfortable armchair, holding a closed
> resume folder loosely in its lap with both hands. The mascot looks
> directly at the viewer with a quiet, contented smile. Eyes warm,
> slightly tired but settled.
>
> Background: dark Midnight Indigo, almost a stage spotlight on the
> mascot. Subtle ink-line halo. Cream warm rim light catching the edges
> of the hoodie and the resume folder.
>
> Single rust accent: a small rust button on the armchair OR a rust
> thread on the resume folder edge.
>
> Mood: "done for the day, in a good way." This is the emotional final
> beat of the page.
>
> Portrait composition, mascot centered, generous headroom and footroom
> so the image can be cropped flexibly inside a dark CTA card.

**Avoid:** any tools or laptops in frame (the work is over),
multiple mascots, busy background, theatrical lighting.

---

## How to use this sheet

1. Generate each asset with Codex's image-gen skill or your tool of choice,
   matching the prompt exactly. Generate at the recommended pixel size —
   don't crop down from a giant board.
2. Save to the **exact** `Drop at:` path. The redesign already imports those
   paths.
3. Once dropped, replace the labeled placeholder in code:
   - For Asset 1 (`/marketing/loop/loop-hero.png`): in
     `apps/web/src/components/landing/TheLoop.tsx`, swap the
     `Illustration placeholder` div block for `<Image src="/marketing/loop/loop-hero.png" … />`.
   - For Asset 2 (`/marketing/anchors/overnight-capture.png`): in
     `apps/web/src/components/landing/FeatureSections.tsx`, replace the
     `<AssetSlot path="/marketing/anchors/overnight-capture.png" … />`
     instance with `<Image src="/marketing/anchors/overnight-capture.png" … />`.
4. Ping me if you generate Asset 3 or Asset 4 and want them wired in too —
   the slots aren't in code yet.
