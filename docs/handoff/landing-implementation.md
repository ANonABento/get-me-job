# Slothing landing redesign — implementation spec

Port the locked HTML mockup at `/tmp/slothing-mockups/mix-c.html` into the
real Next.js + React codebase. Ship as a draft PR off `main`.

---

## 1. Repo + worktree setup

Working directory of the user's main checkout: `/home/anonabento/slothing`
(Next.js app at `apps/web`, pnpm + Turborepo monorepo).

**Do NOT work in the main checkout.** The user runs many parallel AI
workstreams and the working tree may switch branches between turns. Create
a dedicated worktree off `main`:

```bash
cd /home/anonabento/slothing
git fetch origin main
git worktree add -b slothing/landing-loop-redesign \
  ../slothing-landing-loop origin/main
cd ../slothing-landing-loop
```

The env + local DB are gitignored, so symlink them so the dev server boots:

```bash
ln -sf /home/anonabento/slothing/apps/web/.env.local apps/web/.env.local
ln -sf /home/anonabento/slothing/apps/web/.local.db  apps/web/.local.db
pnpm install
```

Commit in tight increments (one logical change per commit). NEVER use
`--no-verify`. If the pre-commit hook fails, fix the underlying issue.

**First commit:** copy this spec doc into the repo at
`docs/handoff/landing-implementation.md` so it survives future branch shifts.

## 2. Visual target

Mockup file: `/tmp/slothing-mockups/mix-c.html`.

To view live:
```bash
cd /tmp/slothing-mockups && python3 -m http.server 8765
# then open http://localhost:8765/mix-c.html
```

The mockup is desktop-only (1440px). The React port MUST be mobile-responsive:
stack columns at `md`/`lg` breakpoints, scale type proportionally, keep the
marquee visible above the fold on tablet+ as a hard requirement.

## 3. The story (also write to `docs/landing-narrative.md` in your first commit)

Slothing is for **burnt-out generalist job seekers**.

Hero copy is locked:
- H1: "You're not lazy. Your job search system is."
- Sub: "Slothing replaces the fifteen tabs, the eight Google Docs, and the cover letter you've rewritten for the eleventh time."
- Reinforce line (bold): "One workspace. One source of truth. One calmer way to apply."

The product loop has six stages that chain into each other:
**01 Atomize → 02 Capture → 03 Review → 04 Tailor → 05 Autofill → 06 Practice**

Each loop stage becomes a "feature section" on the page. Two non-loop demo
sections (`07 Extension`, `08 Open source`) prove the section pattern is
extensible — future product surfaces (ATS, Studio, Pricing, etc.) drop in
without breaking rhythm.

Tone: empathy-first, dryly funny, calm. NEVER: SaaS-bro words like
"leverage", "10x", "supercharge", "unlock". The sloth mascot is a character,
not a logo prop.

## 4. Page structure (in render order)

1. **Announcement bar** — slim, paper bg, rust "NEW" pill + "The loop is here. Atomize once. Apply forever. →"
2. **Nav** — logo left, links center, "Sign in" + dark pill "Get started free". 54px tall.
3. **Hero** — left-split.
     - **Left:** announcement pill "Demo · Watch the loop · 42s"; H1 in Outfit 800, `clamp(48px, 6vw, 78px)`, 14ch max-width, two-line treatment (second line in `text-ink-3`); sub paragraph with bold reinforce line; two pill CTAs (filled dark "Try Slothing free →" + outlined "★ Star on GitHub").
     - **Right:** 16:10 autoplay video stage. Browser-frame chrome (3 dots + label "the loop · auto"), pulsing "AUTOPLAY · LOOP" badge top-right, mascot poster, animated scrub bar 0:16/0:42.
       Use `<video autoPlay muted loop playsInline poster="/brand/sloths/slothing-mascot-hero.png">` with `src="/marketing/sections/the-loop.mp4"` — video file won't exist yet, MUST fall back gracefully to the poster image when the source 404s.
4. **§ The Loop · in motion** — full-width section:
     - Animated SVG ribbon background. Two stroke paths with `cream → rust → indigo` gradients, third dashed line in rust. Flowing across full section width, opacity 0.85.
     - Centerpiece: `<Image src="/marketing/loop/loop-hero.png" />` (Codex-generated, 2400×1030 panorama of 6 stages) inside a rounded paper frame with pulse badge.
     - Below: 6 stage pips in `grid-cols-6`, each with a brand dot + vertical line connector, "NN" mono cap, label.
5. **Marquee** — "Works where jobs live" infinite scroll, masked edges. Reel: LinkedIn / WaterlooWorks / Greenhouse / Lever / Workday / Ashby / Y Combinator / Indeed / Wellfound / Otta. 32s loop, paused on hover, respects `prefers-reduced-motion`.
6. **8 reusable `<Section />` blocks** (single React component, props-driven):
   ```tsx
   <Section
     number="01"
     eyebrow="Atomize"
     headline="Your career, in reusable pieces."
     body="Upload resumes, docs, past applications. Slothing parses…"
     details={[
       { label: "parses", value: "PDF · DOCX · TXT" },
       { label: "feeds into", value: "Studio · Forms · Prep" },
     ]}
     videoSrc="/marketing/sections/atomize.mp4"
     posterPanel={1}    // crop panel 1/6 of loop-hero.png as fallback poster
     flipped={false}    // false = visual on right; true = visual on left
   />
   ```
   - Sections 01–06: video src (with fallback to cropped poster panel from `loop-hero.png` — `background-size: 600% 100%` + `background-position: (idx-1)*20% center`).
   - Sections 07 (Extension) + 08 (Open source): different visual type — simple labeled placeholder card (no panel crop). Visual slot accepts video | image | placeholder.
   - Alternate `flipped` every other row (02, 04, 06, 08 flipped) for visual rhythm.
   - Section bg alternates: odd index `bg-page`, even index `bg-paper` (via `:nth-of-type(even)`).
7. **Dark closer** — `bg-inverse` indigo band.
     - **Left:** small "Ready when you are" cap, H2 "Atomize your career once. Apply for the rest of it." (second line in muted color), body, two CTAs, 4-stat strip (`BYOK · AGPL · $0 · 100%`).
     - **Right:** `<Image src="/brand/sloths/slothing-mascot-closer.png" />`.
8. **Footer** — keep / refresh `LandingFooter` from `src/components/landing/ClosingSections.tsx`. 4 columns (Product, Open source, Community, copyright).

## 5. Files you'll touch

(Verify on the fresh worktree before assuming — branches differ.)

- `apps/web/src/app/[locale]/(marketing)/page.tsx` — wire the new sections
- `apps/web/src/components/landing/Hero.tsx` — rewrite
- `apps/web/src/components/landing/TheLoop.tsx` — new (or refresh)
- `apps/web/src/components/landing/Section.tsx` — new reusable feature section
- `apps/web/src/components/landing/FeatureSections.tsx` — rewrite as wrappers calling `<Section />`
- `apps/web/src/components/landing/RichSections.tsx` — keep Marquee, drop `WhySlothing` (closer covers it)
- `apps/web/src/components/landing/ClosingSections.tsx` — refresh Closer
- `apps/web/src/components/landing/primitives.tsx` — add primitives as needed
- `docs/landing-narrative.md` — write the brand+loop story here
- `docs/handoff/landing-implementation.md` — copy this spec doc

## 6. Hard rules (CI gates — do not break)

1. **Forbidden colors lint** (`apps/web/scripts/forbidden-color-lint.cjs`) hard-fails on `bg-white`, `bg-black`, `text-gray-*`, `bg-slate-*`, `bg-zinc-*`, inline hex/rgb/hsl, and arbitrary values like `bg-[#fff]`. Use slothing theme tokens only:
   - Surfaces: `bg-page`, `bg-page-2`, `bg-paper`, `bg-card`, `bg-muted`
   - Ink: `text-ink`, `text-ink-2`, `text-ink-3`, `text-foreground`, `text-inverse-ink`
   - Brand: `text-brand`, `bg-brand`, `bg-brand-soft`, `border-brand`
   - Lines: `border-rule`, `border-rule-strong`
   - For one-off effects use CSS vars: `style={{ background: "var(--brand-soft)" }}`
2. **Type system:** `font-display` (Outfit) for headings, `font-body` (Geist) for body, `font-mono` (JetBrains Mono) for mono caps. NO serif anywhere.
3. **Images:** always `next/image`, never raw `<img>`. Always provide `alt` (or `alt=""` if decorative).
4. **No `width="narrow"` on app pages** — page-width-lint flags it. Text-heavy blocks use `max-w-prose`.
5. **No `Date.toLocaleString()` inline** — forbidden-time-lint flags it. Use helpers from `@/lib/format/time`.
6. **TypeScript strict** — `pnpm run type-check` must pass clean across workspaces.
7. **Tests** — keep `apps/web/src/app/[locale]/(marketing)/page.test.tsx` passing. If you remove an export it imports, update the test.

## 7. Acceptance criteria

Before opening the PR, run all of these from the worktree — they must pass:

```bash
pnpm run type-check      # strict TS — clean
pnpm run lint            # next lint + forbidden-color + page-width + forbidden-time + forbidden-font + forbidden-radius — clean
pnpm --filter @slothing/web test:run   # Vitest — green
```

Visual QA: start dev server (`pnpm --filter @slothing/web dev`), view
`localhost:3000/en` in browser at 1440px, 1024px, and 768px viewports.
Verify:
- Hero copy + video stage render correctly
- Loop section panorama + ribbon + pips align
- Marquee scrolls smoothly with masked edges
- All 8 sections render with correct alternating bg + flip
- Closer renders dark band with mascot
- No console errors
- Light AND dark theme both look intentional (theme toggle in nav)

## 8. Deliverable

- Branch `slothing/landing-loop-redesign` with the implementation
- 4–8 atomic commits with clear messages (e.g. "Rebuild Hero with autoplay video stage", "Add reusable Section primitive", "Wire 8 sections in page.tsx", "Refresh Closer + dark inverse band")
- A **draft** PR opened against `main` with summary + test plan
- Do NOT merge. The user reviews + merges.
- NEVER add `Co-Authored-By: Claude …` (or any AI-attribution trailer) to commit messages or PR descriptions.
