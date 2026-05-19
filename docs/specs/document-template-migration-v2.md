# Document Template Migration V2 Spec

## Summary

Let users upload an existing resume in PDF, DOCX, or LaTeX and recreate it as a
reusable Slothing document template. This is a migration path from Overleaf,
Google Docs, Word, and hand-maintained PDFs into Studio.

Unlike the V1 style-config importer, V2 must preserve document structure:
formatting, spacing, page margins, table-like layouts, section flow, and source
geometry where the source format exposes it. The result is a reusable template
bound to semantic resume slots, not a one-off imported document.

## Goals

- Import PDF, DOCX, and LaTeX `.tex` resume sources.
- Convert source documents into a reviewable source IR with pages, blocks,
  bounding boxes, table rows/cells, style hints, and warnings.
- Convert the IR into a reusable `DocumentTemplateV2` schema with typography
  tokens, regions, blocks, repeated sections, and semantic slots.
- Map extracted content into a normalized `TailoredResume` draft so users can
  immediately preview the recreated template.
- Provide a Studio review UI where users can correct slot mappings before
  committing the template.
- Save committed V2 templates alongside legacy custom templates and make them
  usable for HTML/PDF export.

## Non-Goals

- Full browser-grade rendering of arbitrary LaTeX packages.
- Preserving every decorative glyph or unsupported Word/PDF drawing primitive
  in the first production pass.
- Public template marketplace, sharing, or template version publishing.

## Product Behavior

- Studio custom templates include an "Import existing resume" action.
- Upload accepts PDF, DOCX, and `.tex` files up to the existing template upload
  size limit.
- After upload, the user sees:
  - imported source filename and type.
  - warnings and confidence.
  - editable template name and summary.
  - source blocks with text and, for PDFs, page-position overlays.
  - semantic slot controls for contact, summary, experience, education, skills,
    projects, certifications, and awards.
  - fidelity summary showing page setup, geometry, slot coverage, source block
    linking, table preservation, style hints, and layout flow.
  - rendered preview generated from the V2 template and mapped resume data.
- Users can assign a selected source block to a semantic slot, save review
  corrections, and commit the recreated template.
- Committed V2 templates appear in `/api/templates` with `schemaVersion: 2` and
  can be selected/exported like other custom templates.

## Data Model

### Source IR

Each migration draft stores:

- `sourceType`: `pdf | docx | tex`.
- `pages`: page number and dimensions when known.
- `blocks`: ordered source text blocks with type, page id, optional bbox,
  optional style hints, optional cells/cell metadata, optional slot hint.
- `rawText`: source text used for fallback parsing and auditability.
- `diagnostics`: extraction caveats and inferred behavior.

### Fidelity Report

Each migration draft stores a fidelity report derived from the current source IR
and V2 template. The report includes an overall score/status plus checks for
page setup, source geometry, semantic slot coverage, source block links, table
structure, style hints, and layout flow. The report is recalculated when users
save review corrections.

### DocumentTemplateV2

The reusable template stores:

- schema version.
- source filename/type.
- page size and margins.
- typography tokens.
- regions for header/main/sidebar/footer.
- blocks for headings, sections, repeated groups, lists, tables, and slots.
- semantic slots using stable resume paths.
- diagnostics from import and layout inference.

## Import Strategy

### PDF

- Use PDF text item positions to infer page dimensions, line grouping, columns,
  margins, spacing, and source block bounding boxes.
- Fall back to readable-string extraction when PDF position extraction fails.
- Preserve warnings when the fallback path is used.

### DOCX

- Read `word/document.xml` from the DOCX zip.
- Extract paragraphs, heading/list styles, page size, and table rows/cells.
- Use table metadata to infer grid/list sections in the V2 template.

### LaTeX

- Parse common resume macros and section/list commands.
- Expand or annotate simple custom macros enough to recover visible content and
  layout intent.
- Infer page size, section hierarchy, bullet/list structure, and table rows
  from tabular environments.

## Review And Correction

- Migration drafts are saved before commit.
- PATCHing a draft can update the resume draft, template draft, or
  `slotCorrections`.
- Slot corrections update both the semantic resume content and the template
  slot's `sourceBlockIds`.
- Commit saves the final V2 template and marks the draft committed.

## API Surface

- `POST /api/templates/migrate`
  - multipart upload.
  - returns a migration draft, fidelity report, warnings, confidence, and AI
    fallback metadata.
- `GET /api/templates/migrations/:id`
  - returns a saved review draft for the authenticated user.
- `PATCH /api/templates/migrations/:id`
  - updates resume/template data or applies slot corrections.
- `POST /api/templates/migrations/:id/commit`
  - saves the reviewed V2 template.
- `POST /api/templates/v2/preview`
  - validates resume/template payload and returns rendered HTML/PDF options.
- `GET /api/templates`
  - includes committed V2 templates.
- `POST /api/resume/export`
  - renders selected V2 templates for HTML/PDF export.

## Acceptance Criteria

- A PDF resume can be uploaded and reviewed with page geometry overlays.
- A PDF migration exposes a fidelity report that proves positioned blocks,
  page setup, slot links, and layout inference were evaluated.
- A DOCX resume with tables can be imported without losing table row/cell
  structure in the source IR.
- A LaTeX resume with common section/item macros can be migrated into semantic
  resume sections.
- Users can correct at least contact, summary, experience, education, skills,
  projects, certifications, and awards mappings.
- Committed V2 templates appear in the template list and export through the
  existing resume export route.
- Existing legacy template import, legacy custom templates, and built-in
  templates continue to work.

## Test Plan

- Unit tests for PDF/DOCX/LaTeX source IR extraction and semantic mapping.
- Real-fixture visual render tests that migrate PDF, DOCX, and LaTeX sources,
  render the V2 HTML in Chromium, and assert visible page-sized output with
  recovered semantic content.
- Renderer tests for `DocumentTemplateV2` HTML and PDF options.
- API tests for migrate, get/patch draft, commit, preview, list, and export.
- Studio tests for upload, source geometry display, preview iframe, slot
  assignment, save review, and commit behavior.
- Typecheck and focused route/component suites before merge.

## Agent Handoff Prompt

```text
/goal Implement full document template migration for PDF, DOCX, and LaTeX resumes:
richer reusable template schema, source-specific importers, semantic slot mapping,
review/correction UI, and Studio/export renderer support.

Use docs/specs/document-template-migration-v2.md as the source of truth.
Keep the V1 style-config importer working, but add a V2 migration path for users
moving from Overleaf, Google Docs, Word, or PDF resumes into reusable Slothing
templates.
```
