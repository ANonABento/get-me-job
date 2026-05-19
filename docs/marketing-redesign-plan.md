# Marketing surfaces — editorial rebuild plan

> Locked roadmap for bringing every marketing surface up to the editorial
> style shipped in PR #277 (landing redesign, merged 2026-05-18).
>
> Source: Plan-agent audit on 2026-05-18.
> Open questions answered in conversation, **all locked** below.

## Decisions

| # | Question | Locked answer |
|---|----------|---------------|
| 1 | Pricing tiers | Keep all 4 (Self-host / Hosted Free / Weekly / Monthly) |
| 2 | `/vs` competitors | Teal / Huntr / Simplify only — skip Resume.io for v1 |
| 3 | Blog `prose` plugin | Replace with token-clean `EditorialProse` wrapper |
| 4 | `/ats-scanner` flow | Keep inline `ScannerForm` + add Studio upsell |
| 5 | i18n on new copy | Hard-code English + TODO comments |
| 6 | Marketing nav | Keep as-is (Features / Extension / How / Pricing / Blog) |

## Phase order + complexity

| Phase | What | PRs | Complexity |
|------|------|-----|------------|
| **0** | Primitives extraction | 1 | M |
| 1a | Footer + announcement-bar slot | 1 | S |
| 2 | `/pricing` | 1 | L |
| 1b | Navbar refresh | 1 | M |
| 3 | `/extension` | 1–2 | L |
| 4 | `/vs` (3 competitors) | 1 | M |
| 5 | `/ats-scanner` | 1 | M |
| 6 | `/blog` (index + post template) | 1 | M |
| 7 | `/privacy` + `/terms` | 1 | S |
| **Total** | | **9–10 PRs** | |

Why Footer ships before Navbar: Footer is the most visibly off-theme thing on
every page today; Navbar refresh is riskier (touches scroll behaviour, mobile
menu). Pricing slots between them so the chrome change is validated by a real
non-landing page rebuild before the Navbar rewrite goes live.

## Cross-phase primitives (Phase 0 deliverables)

These are built once in Phase 0 so every later phase becomes wiring, not
wiring-and-building.

| Primitive | Used in | New file |
|-----------|---------|----------|
| `EditorialHero` | Phases 2/3/4/5/6 | `apps/web/src/components/landing/EditorialHero.tsx` |
| `PriceCard` | Phases 2 + 3 | `apps/web/src/components/landing/PriceCard.tsx` |
| `CompareTable` | Phases 2 + 4 | `apps/web/src/components/landing/CompareTable.tsx` |
| `FaqList` | Phases 2/3/5 | `apps/web/src/components/landing/FaqList.tsx` |
| `InverseCTABand` | Phases 2/3/5 | extracted from `ClosingSections.tsx` |
| `MonoStatStrip` | Phases 2 + 3 | extracted from `ClosingSections.tsx` |
| `AnnouncementBar` | Phase 1a | added to `primitives.tsx` |
| `EditorialProse` | Phase 6 | `apps/web/src/components/landing/EditorialProse.tsx` |

## Hard constraints (every phase)

- `forbidden-color-lint` — editorial tokens only (`bg-page`, `bg-paper`,
  `bg-card`, brand-soft, etc.). No `bg-white`, `bg-black`, `bg-gray-*`, inline
  hex/rgb/hsl, or `bg-[#…]` arbitraries.
- `forbidden-time-lint` — use `@/lib/format/time` helpers only.
- `page-width-lint` — `max-w-prose` for text blocks, never `width="narrow"`.
- `forbidden-font-lint` — Outfit display heavy weight only. **No serif.**
- `forbidden-radius-lint` — `rounded-sm/md/lg/xl/2xl/3xl/full`, no arbitraries.
- `next/image` everywhere. Never raw `<img>`.
- Mobile responsive at 1440 / 1024 / 768. Both light + dark theme intentional.
- Never add `Co-Authored-By: Claude …` trailers.

## Per-phase summaries

### Phase 0 — Primitives extraction (this PR)

- Build the 8 primitives above.
- Save this plan to `docs/marketing-redesign-plan.md`.
- Landing page must look **pixel-identical** after extraction (only refactor).
- ~5 atomic commits.

### Phase 1a — Footer + announcement-bar slot

- Rewrite `(marketing)/components/footer.tsx` to match the landing's
  `LandingFooter` (4 columns, paper bg, version mono-cap).
- Add optional `AnnouncementBar` slot to `(marketing)/layout.tsx` above the
  Navbar; env-gated (e.g. `NEXT_PUBLIC_MARKETING_ANNOUNCEMENT=on`).
- Adjust `<main>` top padding to accommodate.

### Phase 2 — `/pricing`

- Keep 4 tiers + Stripe `CheckoutButton` behavior intact.
- Replace hero → tier grid → compare → FAQ → trust → CTA with editorial primitives.
- `Monthly` keeps highlighted ring. Background rhythm alternates `bg-page`/`bg-paper`.
- Closes with `InverseCTABand` + `MonoStatStrip` ("BYOK · AGPL · $0 · 100%").

### Phase 1b — Navbar refresh

- Keep fixed-position + scroll-shadow behavior.
- Remove `gradient-bg` from "Get started" CTA.
- Mobile menu → paper card with mono-cap section labels.
- Wire announcement-bar offset.

### Phase 3 — `/extension`

- `EditorialHero` + 3 feature `<Section />`s + how-it-works numbered cards +
  privacy paper card + supported-boards marquee + FAQ + `InverseCTABand`.
- Preserve `ExtensionInstallButtons` server-side launch state.
- Drop the `width="narrow"` block (lint-banned).

### Phase 4 — `/vs`

- Already close to target. Index gets `EditorialHero` + `PriceCard`-style
  competitor cards. Per-competitor pages: `EditorialHero` + sidebar + `CompareTable`
  + honest-tradeoffs card + `InverseCTABand`.
- Preserve all JSON-LD schema for SEO.

### Phase 5 — `/ats-scanner`

- Hero + benefit cards + paper-card-wrapped `ScannerForm` (inline tool stays).
- Add post-scan Studio upsell card.
- Audit `apps/web/src/components/ats/*.tsx` for color token violations.

### Phase 6 — `/blog`

- Index magazine grid + post template with `EditorialProse` body wrapper.
- Drop Tailwind's serif `prose` plugin in favor of Outfit + ink tokens.
- Sibling-post "Read next" link replaces global closer.

### Phase 7 — `/privacy` + `/terms`

- `LegalShell` shared wrapper. `max-w-prose`, Outfit H2s, ink-2 body,
  brand link styling. Legal copy from `legal-copy.ts` stays untouched.

## Cross-cutting risks

- **Tests:** every page has a `.test.tsx`. Each phase must update its test
  for the new DOM. Most common Slothing CI failure.
- **Asset gaps:** Phases 3 + 5 may need new mascot/screenshot assets.
  Identify early so Codex can ship them in parallel.
- **Visual QA gates:** every phase ends with 1440/1024/768 screenshots in
  light + dark, plus full lint + type-check + Vitest.

## When to revisit

- After Phase 2 ships: validate the editorial style holds up on a dense
  commercial surface. If pricing feels off, fix primitives before continuing.
- After Phase 3: validate `<Section />` reuse pattern across non-landing
  pages. Adjust prop shape if necessary.
- After Phase 6: deprecate `MarketingSection` from `apps/web/src/components/marketing/section.tsx`.

## Out of scope (intentional)

- Product-app UI (the `(app)` route group). Marketing only.
- Full i18n of new editorial copy (English-only for now, TODO comments).
- Resume.io comparison page. LinkedIn comparison page.
- Anchored TOC for legal pages.
- Blog tagging / category filters.
- Storybook setup for the new primitives.
