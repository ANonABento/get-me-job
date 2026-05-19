# Career Document Content Import Spec

## Summary

Import career documents beyond resumes and turn them into reusable bank
components. V1 covers resumes, cover letters, portfolios, and career notes.
References, certificates, transcripts, and generic PDFs stay on their existing
paths unless they are needed for classification compatibility.

This is a content-import feature, not a template-import feature. A user uploads
or imports a document because they want reusable source material extracted into
Components.

## Product Behavior

- Upload accepts the existing PDF, DOCX, and text formats.
- `resume` behavior remains unchanged.
- `cover_letter` imports create reusable paragraphs, key selling points, target
  role/company fields when present, and optional tone metadata.
- `portfolio` imports create project entries, project bullets, links, stack
  items, and proof points.
- `career_notes` imports create lower-confidence bullets, achievements,
  projects, skills, and paragraphs from loose notes.
- The import review modal opens for supported career-document imports when bank
  entries are created.
- Parsed entries retain source document metadata so the existing source grouping
  and preview surfaces continue to work.

## Implementation Changes

### Current state after parser-v2 and portfolio-parser work

Recent parser-v2 work changed the ingestion architecture. The deterministic
portfolio parser has also been upgraded for visual/text portfolio PDFs.

Shipped parser-v2 capabilities:

- Document upload services can persist source artifacts and source maps.
- Upload review can receive parser-v2 draft entries and source-reference
  context.
- Parser-v2 parse runs exist for basic resume parsing from source maps.
- Legacy upload and parse routes have compatibility bridges into parser-v2
  artifacts/parse runs.
- AI source-cited resume parsing has a validation foundation and parser service.

Shipped portfolio parsing capabilities:

- Legacy `/api/upload` still classifies portfolios, then calls
  `parsePortfolioBasic`.
- `parsePortfolioBasic` supports explicit headings like `Project: ...`,
  `Case Study: ...`, `Selected Work: ...`, and markdown headings.
- `parsePortfolioBasic` also treats visual portfolio headings such as
  `Robotic Arm Puppeteer — Python | ROS2 | OpenCV | Linux | Fusion360` as
  project boundaries.
- Heading stacks are preserved as project technologies.
- Repeated portfolio headers/contact lines are ignored.
- Image captions are skipped when selecting project descriptions.
- PDF-extracted bullets using `●` plus zero-width spacing are normalized.

Still remaining for portfolio imports:

- `/api/parse` remains resume-oriented; the existing `parseDocumentByType` and
  `parsePortfolioWithLLM` helpers are not wired into the review flow for
  portfolio re-parsing.
- OCR support exists only as a text-extraction fallback when extracted PDF text
  is nearly empty, so image-heavy but text-backed portfolios will not trigger
  OCR or vision analysis.

Implication: the immediate Kevin-style structure recovery bug is covered by the
deterministic parser. The next portfolio slice should be type-aware AI reparse
and, later, true image/vision fallback for pages without embedded text.

### Types and schemas

- Add `career_notes` to `DOCUMENT_TYPES` and any document type schema/export.
- Extend `ParsedDocumentData` with:
  - `cover_letter`: target company, target position, reusable paragraphs, key
    selling points, tone.
  - `portfolio`: projects, links, case studies, technologies, proof points.
  - `career_notes`: loose paragraphs, bullets, achievements, projects, skills.
- Add `paragraph` to shared `BankCategory`, UI labels, field configs, card
  rendering, review-edit support, backup schema, and import/export schema paths.

### Classification and parsing

- Update document classification to identify:
  - Cover letters from greeting, closing, application intent, and role/company
    cues.
  - Portfolios from project/gallery/case-study language, repeated project links,
    GitHub/demo URLs, and portfolio filename hints.
  - Career notes from loose bullet-heavy text without resume section structure.
- Implement deterministic parsers for `cover_letter`, `portfolio`, and
  `career_notes` under the existing parser surface.
- Keep AI parsing optional and gated where existing parse flows already gate AI.
- Do not route these document types through resume-only `smartParseResume`.

### Portfolio Parsing V2

Upgrade portfolio parsing specifically for visual/text portfolios that use
page-style project sections rather than markdown-style project labels.

Input pattern to support:

```text
Project Name — Tech One | Tech Two | Tech Three
Image caption
Another image caption

Project description prose...
● Built ...
● Shipped ...
```

Rules:

- Treat lines matching `name — stack` as project boundaries when:
  - the left side is 2-80 characters,
  - the right side contains at least two `|`-separated stack/tool tokens or at
    least one known technical/tool token,
  - the line is not a repeated page header/footer.
- Normalize dash variants: `—`, `–`, `-`.
- Split stack/tool tokens on `|`, comma, or semicolon and store them as explicit
  project technologies.
- Ignore repeated boilerplate lines such as `Portfolio`, contact/header links,
  `Kevin Jiang Resume`, page numbers, and duplicated nav/header text.
- Treat short lines before the first prose paragraph as image captions. Captions
  may be stored as low-priority context, but must not become project names.
- Use the first non-caption prose block after the heading as the project
  description.
- Attach following bullet lines to the active project until the next project
  heading.
- Extract proof points from project bullets/prose containing metrics,
  externally verifiable outcomes, awards, grades, launch/shipping language, or
  performance terms.
- If no V2 headings are found, fall back to the current explicit
  `Project: ...` parser behavior.

Kevin Jiang portfolio regression expectations:

- The compressed PDF has extractable text, so this fixture should pass without
  OCR.
- Expected project count: 9.
- Expected project names include:
  - `Robotic Arm Puppeteer`
  - `Expressive AI Robot Head`
  - `AR Gesture Controlled Robot`
  - `One Handed Keyboard`
  - `VR Haptic Gloves`
  - `Robotics`
  - `PCB Design & Assembly`
  - `C# Apps & Games`
  - `Java Applications`
- No generated project may be named from a repeated header, e.g. `Portfolio`,
  `Kevin Jiang Resume`, or contact-link text.
- Project technologies must come from the heading stack and remain attached to
  the correct project.
- Project bullets must stay under the correct project parent.

### Type-aware AI reparse

Use the existing type-specific LLM parser helpers for explicit review actions:

- Extend `/api/parse` or parser-v2 parse-run creation to branch on
  `doc.type`.
- For `portfolio`, call `parsePortfolioWithLLM` or a parser-v2 source-cited
  portfolio equivalent.
- For `cover_letter` and `career_notes`, call the matching type-specific parser
  instead of resume parsing.
- Populate the bank with `populateBankFromParsedDocument` for non-resume
  documents.
- Keep initial upload deterministic; AI should be user-triggered from the
  review modal or explicit parse-run mode.
- Surface `Check with AI` / `Improve parse` for supported non-resume document
  types, not only resumes.

### Bank population

- Extend `populateBankFromProfile` or introduce an adjacent career-document bank
  population function that accepts parsed non-resume document data.
- Insert `paragraph` entries for reusable cover-letter and notes paragraphs.
- Insert `project` parents and `bullet` children for portfolio projects.
- Insert `skill` entries only when the parser has explicit stack/skills signals.
- Use lower confidence for notes-derived entries than resume-derived entries.

### Review UI

- Support `paragraph` entries in the Components list, cards, review modal,
  duplicate checks, and source-document grouping.
- For cover-letter imports, show paragraph text, target company/role, tone, and
  related selling points.
- For portfolio imports, show project overview, URL, stack, proof points, and
  parsed bullets.
- For career notes, make confidence/review state visible because extraction is
  inherently looser.

## Edge Cases

- If a document classifies as `other`, store it as a source document but do not
  create bank entries.
- If parsing produces no structured entries, keep upload success but show the
  existing "no components detected" review state.
- If a cover letter has no target company/position, preserve reusable
  paragraphs and selling points.
- If a portfolio has projects without bullets, still create project parents.
- Duplicate detection should compare normalized paragraph/bullet/project text,
  not raw object JSON.

## Test Plan

- Document classifier tests:
  - Cover letter with greeting/application/closing.
  - Portfolio with project links and case-study sections.
  - Career notes with loose bullets and no resume headers.
  - Resume mentioning portfolio still classifies as resume when resume signals
    are strong.
- Parser tests:
  - Cover-letter paragraphs and selling points.
  - Portfolio project URL, stack, proof points, and bullets.
  - Career notes to bullets/achievements/paragraphs.
- Bank population tests:
  - Creates `paragraph` entries.
  - Creates project parent/child hierarchy from portfolio imports.
  - Preserves source document id and source section metadata.
- API/UI tests:
  - Upload creates reviewable entries for each supported document type.
  - Review modal renders and edits `paragraph`.
  - Existing resume upload regression stays green.
- Run typecheck and targeted lint for touched files.

## Acceptance Criteria

- A cover letter upload creates at least one reviewable `paragraph` or selling
  point entry from realistic letter text.
- A portfolio upload creates reviewable project entries with URLs and stack when
  present.
- A career notes upload creates reviewable low-confidence components without
  pretending it is a resume.
- Existing Kevin Jiang resume parsing and review behavior remain unchanged.

## Agent Handoff Prompt

```text
/goal Implement career-document content import for cover letters, portfolios, and career notes.

Use docs/specs/career-document-content-import.md as the source of truth.

Requirements:
- Add career_notes as a supported DocumentType.
- Extend ParsedDocumentData for cover_letter, portfolio, and career_notes.
- Add a paragraph bank category and UI field config.
- Parse uploaded cover letters, portfolios, and notes into reusable bank entries.
- Keep existing resume import behavior unchanged.
- Update classification, upload parsing, bank population, review UI, and tests.

Verify with targeted parser, upload/API, bank population, review UI, lint, and typecheck tests.
```
