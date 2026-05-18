# Slothing — Landing Narrative & Product Loop

> Source: founder brain-dump, 2026-05-18. Captured verbatim-in-spirit so future agents
> redesigning marketing pages have the *actual story* in one place instead of guessing
> from feature lists.

## Audience

**Burnt-out generalist job seekers.** Not narrowly tech. The tone is empathy-first,
calm, "less mental load" — the sloth identity is load-bearing, not decorative.

## The product loop (this is the story the landing must tell)

Slothing is a **closed loop**, not five disconnected features. Every section of the
landing should make a reader feel one stage handing off to the next.

### 1. Atomize your career into a Knowledge Bank

- Upload resumes, docs, past applications.
- Slothing atomizes them into **components**: experiences, projects, skills, bullets,
  answers.
- This becomes your single source of truth. Nothing lives in fifteen Google Docs anymore.

### 2. Capture jobs from anywhere with the extension (or overnight agent)

- Browser extension scrapes jobs from LinkedIn, Indeed, Greenhouse, Lever, Workday,
  Waterloo Works, and generic JSON-LD postings.
- "Bookmark" interesting roles while you browse, or leave the agent running
  **overnight** to scrape in bulk.
- Everything lands in one consolidated place — **normalized** across sources so a
  Workday role and an Indeed role look the same.

### 3. Review queue — Tinder for jobs, on your phone

- Wake up, breakfast / commute / lunch / bathroom break — flick through scraped roles
  on your phone in a **Tinder-style queue**.
- Every job is normalized + configurable, so you can A/B compare across sources for
  better decisions.
- Yes / save-for-later / no. The ones you say yes to move into the tracker.

### 4. Studio — tailor without hallucination

- For each saved job, generate a **resume, cover letter, or portfolio** assembled from
  your component bank.
- Because output is assembled from real components, there is **no hallucination**.
- AI helps: write fresh bullet points, reword existing ones — and anything you like,
  you can **save back to the bank** to reuse next time. The bank grows with use.
- **ATS scanner** checks keyword match and surfaces gaps before you send.

### 5. Autofill + Answer Bank — the extension closes the loop

- Extension auto-imports your generated docs into application forms.
- **Answer Bank** stores your free-text application answers with **persistent,
  self-evolving memory**: answer "why this company" once, it autofills next time and
  learns variations.
- Form filling collapses from 20 minutes per application to a click-through.

### 6. After the interview lands — Research + Interview Prep

- Research agents pull deep context on the **company, role, team, salary band**.
- Interview prep asks position- and company-specific questions for advanced practice,
  including voice recording for STAR delivery.

## Why this matters for the landing redesign

The current landing lists features as 5 sibling sections. **That misses the entire
point.** The features only matter because they **chain**. A redesign should:

1. **Lead with the loop**, not with feature parity. One visual diagram or scroll
   sequence that walks: Bank → Capture → Review → Tailor → Autofill → Interview.
2. **Pick 3 anchor moments** to give the heaviest visual real estate to:
   - Knowledge Bank (the source of truth)
   - Extension capture + autofill (the proof-of-real-product)
   - Studio + ATS tailoring (the apply-better moment)
3. **Frame the others as supporting beats** inside the loop story, not as their own
   marquee sections: review queue, answer bank, research agents, interview prep all
   appear as steps in the chain, not as competing siblings.
4. **Mobile review-queue** is a uniquely strong visual — Tinder-for-jobs on a phone
   while you eat breakfast. Treat it as a hero-grade illustration moment.
5. **Overnight agent** scraping while you sleep is the dream-state visual — the sloth
   does the work, you wake up to a queue. Use it.

## Tagline & tone

- Working tagline today: *"You're not lazy. Your job search system is."*
- Tone: empathetic, slow-on-purpose, dryly funny. The sloth is a real character, not
  a logo prop. It can hold a coffee, a folder, a phone. It can nap.
- Avoid SaaS-speak: "leverage", "10x", "supercharge", "unlock". Avoid AI-bro tropes.

## Visual direction

Editorial sloth-forward. Extend the existing **slothing** theme preset:

- Surfaces: cream paper light, Midnight Indigo dark, rust accent.
- `font-display` Outfit for headings, `font-body` Geist, `font-mono` JetBrains Mono
  for captions / eyebrows.
- Editorial primitives: `bg-paper`, `bg-page`, `border-rule`, `shadow-paper-elevated`,
  mono uppercase eyebrows tracking 0.16em.
- Mascot illustrations carry weight. Product screenshots are second-fiddle to art.
- Magazine-style layout: asymmetric, deliberate white space, big editorial type.

## What this doc is for

Future agents (Claude / Codex / a designer) redesigning **any** marketing surface —
landing, /pricing, /extension, /vs — should read this first so the *story* stays
consistent. If you're tempted to ship a feature grid without showing the loop, stop
and re-read.
