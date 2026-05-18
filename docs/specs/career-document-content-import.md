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
