# Document Ingestion and Source Preview V2

## Problem

The current upload, parsing, and document preview flows are too coupled and too
fragile for real resumes.

A concrete failure case is:

```text
/home/anonabento/Downloads/syzfjbzwjncs.pdf
```

This PDF has extractable text and a reasonable pdf.js geometry stream. The
extraction layer reconstructs readable lines such as:

```text
Education
Southwestern University | Georgetown, TX
Bachelor of Arts in Computer Science, Minor in Business | Aug. 2018 - May 2021
Blinn College | Bryan, TX
Associate's in Liberal Arts | Aug. 2014 - May 2018
Experience
Undergraduate Research Assistant | June 2020 - Present
Texas A&M University | College Station, TX
...
Projects
Gitlytics | Python, Flask, React, PostgreSQL, Docker | June 2020 - Present
...
```

The structured parse is still poor:

- The first education entry can combine Southwestern's degree/date with Blinn
  College as the institution.
- Experience company and location are merged into one `company` value, for
  example `Texas A&M University | College Station, TX`.
- Project dates are parsed as technologies, for example
  `["Python Flask React PostgreSQL Docker", "June 2020 Present"]`.
- Contact fields can retain extraction artifacts, such as a leading newline in
  the phone number.
- Source preview then tries to highlight parsed bank entries with fuzzy matching,
  so even technically correct bbox matching can highlight semantically wrong
  data.

This is not only a parser bug. It is a pipeline boundary bug.

## Current Architecture

### `/api/upload`

Current route:

```text
POST /api/upload
```

Current responsibilities:

1. Validate file.
2. Persist file to disk.
3. Extract text.
4. Classify document.
5. Parse deterministic structured data.
6. Save document row.
7. Populate profile bank rows.
8. Auto-promote parsed profile fields.
9. Cache PDF bytes.
10. Extract PDF positions.
11. Fuzzy-match bank entries back to source bboxes.

Important files:

- `apps/web/src/app/api/upload/route.ts`
- `apps/web/src/lib/parser/pdf.ts`
- `apps/web/src/lib/parser/smart-parser.ts`
- `apps/web/src/lib/parser/section-detector.ts`
- `apps/web/src/lib/parser/field-extractor.ts`
- `apps/web/src/lib/resume/info-bank.ts`
- `apps/web/src/lib/parse/pdf-positions.ts`
- `apps/web/src/lib/parse/pdf-cache.ts`

### `/api/parse`

Current route:

```text
POST /api/parse
```

Current responsibilities:

1. Find existing document.
2. Parse extracted text in basic or AI mode.
3. Auto-promote profile fields.
4. Repopulate bank entries.

This route does not recompute source bboxes or source metadata after reparsing,
so parse quality and preview provenance can drift apart.

### Preview

Current preview uses:

- Cached PDF bytes from upload.
- Bank entries from `profile_bank`.
- Stored `sourceBbox` / `sourceHeaderBbox`.
- Fuzzy matching from parsed entry text back to pdf.js text items.
- Highlight overlays rendered over a canvas PDF page.

Important files:

- `apps/web/src/components/bank/preview/pdf-preview.tsx`
- `apps/web/src/components/bank/preview/highlight-layer.tsx`
- `apps/web/src/app/[locale]/(app)/components/components-tab.tsx`
- `apps/web/src/app/[locale]/(app)/components/upload-review-source-metadata.ts`

## North Star

Parsing and preview should share a single source-grounded representation.

Every parsed field or component should know where it came from before it becomes
a bank entry:

```ts
interface ParsedField<T> {
  value: T;
  confidence: number;
  sourceSpanIds: string[];
  parser: "deterministic" | "ai" | "ocr" | "manual";
  warnings?: string[];
}
```

Source preview should resolve `sourceSpanIds` to PDF geometry. It should not
normally reverse-engineer bboxes by fuzzy matching already-created bank entries.
Fuzzy matching remains a fallback for legacy rows and incomplete source refs.

## Design Principles

1. Upload stores the document. It should not own all ingestion side effects.
2. Extraction produces reusable document artifacts: pages, lines, tokens, links,
   text, OCR status, and geometry.
3. Parsing produces versioned parse runs.
4. Review reads a parse run, not final bank rows.
5. Bank rows are committed after review and preserve parse-run source refs.
6. Reparse creates a new parse run, instead of silently overwriting provenance.
7. Preview is a verification tool, not decorative highlighting.
8. Source quality must be visible: exact, partial, fuzzy, missing.

## Proposed Data Model

### `documents`

Keep existing document storage, but stop treating `documents.parsedData` as the
canonical parse output long term.

Add or migrate toward:

```ts
interface DocumentRecord {
  id: string;
  userId: string;
  filename: string;
  mimeType: string;
  size: number;
  path: string;
  fileHash: string;
  documentType: DocumentType;
  createdAt: string;
}
```

### `document_artifacts`

One row per extraction run. This is the canonical source map.

```ts
interface DocumentArtifact {
  id: string;
  documentId: string;
  userId: string;
  extractorVersion: string;
  status: "ready" | "failed";
  failureReason?: string;
  rawText: string;
  normalizedText: string;
  pagesJson: DocumentPage[];
  linksJson: SourceLink[];
  ocrUsed: boolean;
  createdAt: string;
}

interface DocumentPage {
  page: number;
  width: number;
  height: number;
  lines: SourceLine[];
}

interface SourceLine {
  id: string; // stable inside artifact, e.g. "p1-l12"
  page: number;
  text: string;
  bbox: SourceBbox;
  tokens: SourceToken[];
  role?: "heading" | "entry-header" | "body" | "bullet" | "contact" | "unknown";
  fontSize?: number;
  fontWeightHint?: "normal" | "bold" | "unknown";
}

interface SourceToken {
  id: string; // e.g. "p1-l12-t4"
  text: string;
  bbox: SourceBbox;
}
```

### `document_parse_runs`

One row per parser execution.

```ts
interface DocumentParseRun {
  id: string;
  documentId: string;
  artifactId: string;
  userId: string;
  mode: "basic" | "ai" | "hybrid";
  parserVersion: string;
  status: "ready" | "failed";
  confidence: number;
  warningsJson: ParseWarning[];
  structuredJson: ParsedDocumentV2;
  createdAt: string;
}

interface ParseWarning {
  code: string;
  message: string;
  sourceSpanIds?: string[];
  severity: "info" | "warning" | "error";
}
```

### `profile_bank`

Keep existing rows, but make source metadata reference parse artifacts/runs:

```ts
interface BankSourceRef {
  documentId: string;
  artifactId: string;
  parseRunId: string;
  sourceSpanIds: string[];
  sourceQuality: "exact" | "partial" | "fuzzy" | "missing";
  sourceConfidence: number;
}
```

Existing `sourceBbox`, `sourceHeaderBbox`, `sourceOrder`, and `sourceLinks`
can stay as denormalized compatibility columns during migration.

## Proposed Routes

### Upload Document

```text
POST /api/documents/upload
```

Responsibilities:

1. Validate file type, size, and magic bytes.
2. Deduplicate by user and file hash.
3. Persist the file.
4. Create a `documents` row.
5. Optionally enqueue extraction.

Non-responsibilities:

- No bank ingestion.
- No profile auto-promotion.
- No bbox fuzzy matching.
- No final parse side effects.

Response:

```ts
interface UploadDocumentResponse {
  document: DocumentRecord;
  duplicate?: boolean;
  next: {
    extractUrl: string;
  };
}
```

### Extract Source Artifact

```text
POST /api/documents/:id/extract
GET  /api/documents/:id/artifact
```

Responsibilities:

1. Extract text and geometry from PDF/DOCX/TXT.
2. Reconstruct pages, lines, tokens, and links.
3. Detect OCR need and run OCR when enabled.
4. Persist `document_artifacts`.
5. Return extraction diagnostics.

Acceptance criteria:

- The `syzfjbzwjncs.pdf` artifact contains distinct lines for:
  - `Southwestern University | Georgetown, TX`
  - `Bachelor of Arts in Computer Science...`
  - `Blinn College | Bryan, TX`
  - `Associate's in Liberal Arts`
  - `Gitlytics | Python, Flask, React, PostgreSQL, Docker | June 2020 - Present`
- Each line has a stable `id` and `bbox`.
- Heading lines receive role hints where possible.

### Create Parse Run

```text
POST /api/documents/:id/parse-runs
GET  /api/documents/:id/parse-runs
GET  /api/documents/:id/parse-runs/:runId
```

Request:

```ts
interface CreateParseRunRequest {
  mode: "basic" | "ai" | "hybrid";
  artifactId?: string;
}
```

Responsibilities:

1. Parse from `document_artifacts`, not raw flat text only.
2. Produce structured output with source span refs.
3. Score confidence per field and per component.
4. Persist a versioned parse run.
5. Never mutate bank rows directly.

For AI mode, the prompt must use annotated line IDs:

```text
[p1-l03] Education
[p1-l04] Southwestern University | Georgetown, TX
[p1-l05] Bachelor of Arts in Computer Science, Minor in Business | Aug. 2018 - May 2021
...
```

The model must return source IDs:

```json
{
  "education": [
    {
      "institution": {
        "value": "Southwestern University",
        "sourceSpanIds": ["p1-l04"]
      },
      "degree": {
        "value": "Bachelor of Arts",
        "sourceSpanIds": ["p1-l05"]
      }
    }
  ]
}
```

Validation must reject or downgrade hallucinated source IDs.

### Commit Parse Run To Bank

```text
POST /api/bank/imports/:parseRunId/commit
```

Responsibilities:

1. Accept reviewed components.
2. Create or update bank entries.
3. Preserve `documentId`, `artifactId`, `parseRunId`, `sourceSpanIds`,
   `sourceQuality`, and denormalized bbox metadata.
4. Optionally auto-promote profile fields after user confirmation.

Request:

```ts
interface CommitParseRunRequest {
  acceptedComponentIds: string[];
  edits?: Record<string, unknown>;
  autoPromoteProfile?: boolean;
}
```

### Preview Source

```text
GET /api/documents/:id/preview/pdf
GET /api/documents/:id/source-map
```

Responsibilities:

1. Stream the original file or PDF preview.
2. Return artifact line/token bboxes.
3. Return parse-run source refs and source quality.

The preview UI should consume source refs directly. The fuzzy matcher should
only run for legacy bank entries or entries with missing refs.

## Parser V2

### Extractor Layer

Build a shared extractor module, for example:

```text
apps/web/src/lib/ingest/extract-document.ts
apps/web/src/lib/ingest/pdf-source-map.ts
apps/web/src/lib/ingest/docx-source-map.ts
apps/web/src/lib/ingest/text-source-map.ts
```

Required capabilities:

- Preserve pages for PDFs.
- Preserve line order from geometry, not pdf.js emission order.
- Preserve token bboxes.
- Preserve link annotations.
- Preserve bullet markers.
- Detect large columns/gaps without converting every gap into semantic `|`.
- Emit line roles as hints, not hard truth.

### Deterministic Parser Layer

Build parser V2 against source lines:

```text
apps/web/src/lib/ingest/parse-resume-v2.ts
```

The parser should operate on blocks:

```ts
interface SourceBlock {
  id: string;
  type: "contact" | "section" | "entry" | "bullet-list" | "skill-list";
  sourceSpanIds: string[];
  text: string;
}
```

Required fixes for `syzfjbzwjncs.pdf`:

- Group education as repeating triples:
  `institution/location`, `degree/date`.
- Parse education institution from the line above the degree, not from the next
  institution.
- Split institution/location on the last location-looking segment.
- Group experience as:
  `title/date`, `company/location`, bullet list.
- Split company/location into distinct fields.
- Group project as:
  `name | technologies... | date`, bullet list.
- Treat date ranges in project headers as dates, not technologies.
- Strip extraction artifacts from contact fields.

### AI Parser Layer

AI mode should be a source-cited parser, not a free-form JSON parser.

Requirements:

- Input is annotated source lines.
- Output includes `sourceSpanIds` for every field and component.
- Output is validated against the artifact's known line IDs.
- Missing source IDs are downgraded to `sourceQuality: "missing"`.
- If AI returns a value that is not supported by cited lines, mark warning:
  `unsupported_value`.
- The deterministic parser can provide candidate blocks to reduce token cost.

## Preview V2 UX

### Current UX Issue

Showing all bboxes at once creates a noisy page. It also gives false authority:
users cannot tell whether a highlight is exact, partial, fuzzy, or missing.

### Target UX

The preview is a source verification workspace.

Desktop layout:

```text
Components list | Document preview | Review/edit panel
```

Behavior:

- Selecting a component focuses its source spans.
- Only the selected component is strongly highlighted.
- Related parent/child spans are shown quietly.
- Unrelated spans are hidden by default.
- A toggle can show all located spans for debugging.
- Clicking a PDF span selects the component.
- Clicking "View in document" scrolls and centers the span, not only changes page.
- Missing source refs show a "not located" state.
- Fuzzy source refs show a "best guess" state.

Highlight states:

| State   | Meaning                                   | Visual                                |
| ------- | ----------------------------------------- | ------------------------------------- |
| Exact   | Parser cited source lines/tokens directly | Strong fill + outline                 |
| Partial | Some fields cited, some missing           | Dashed outline                        |
| Fuzzy   | Legacy/fallback fuzzy match               | Amber outline + "best guess"          |
| Missing | No reliable source location               | No PDF highlight; show source warning |

### Raw Text Fallback

Every preview should have a source text tab:

```text
[PDF] [Source text] [Diagnostics]
```

This avoids total failure when:

- PDF preview cache expired.
- Source is DOCX/TXT.
- OCR was used.
- PDF rendering fails.

## Evaluation Plan

Add a fixture suite for ingestion, parsing, and preview provenance.

Suggested location:

```text
apps/web/tests/fixtures/parser-v2/syzfjbzwjncs.pdf
apps/web/tests/fixtures/parser-v2/syzfjbzwjncs.expected.json
```

Expected assertions for `syzfjbzwjncs.pdf`:

- Document type is `resume`.
- Contact:
  - name: `Jake Ryan`
  - email: `jake@su.edu`
  - phone: `123-456-7890`
- Education count is 2.
- Education 1:
  - institution: `Southwestern University`
  - location: `Georgetown, TX`
  - degree: `Bachelor of Arts`
  - field: `Computer Science, Minor in Business`
  - start: `Aug. 2018`
  - end: `May 2021`
- Education 2:
  - institution: `Blinn College`
  - location: `Bryan, TX`
  - degree: `Associate's`
  - field: `Liberal Arts`
  - start: `Aug. 2014`
  - end: `May 2018`
- Experience count is 3.
- Every experience has title, company, location, date range, and bullets.
- Project count is 2.
- Project technologies exclude date ranges.
- Every parsed root component has at least one exact or partial source span.
- Every bullet has a source span.
- No source ID references a non-existent artifact line.

Aggregate metrics:

- Section detection accuracy.
- Root component count accuracy.
- Field exact-match accuracy.
- Bullet recall.
- Source span coverage.
- Source span correctness.
- Unsupported/hallucinated value rate.

## Migration Plan

### Phase 0: Freeze Current Behavior With Fixtures

1. Add the failing PDF fixture.
2. Add tests that document current failures.
3. Add a diagnostic command or test helper that prints:
   - extracted lines
   - detected sections
   - parsed structured output
   - source refs / bboxes

### Phase 1: Extract Artifact Layer

1. Introduce `document_artifacts`.
2. Move pdf.js geometry extraction into an ingestion module.
3. Persist pages, lines, tokens, links, OCR status.
4. Add source-map API.
5. Keep `/api/upload` compatibility by calling the new extractor internally.

### Phase 2: Parser V2 Basic Mode

1. Parse from artifact lines.
2. Fix education grouping.
3. Fix experience grouping and company/location splitting.
4. Fix project date/technology separation.
5. Return source refs per field/component.
6. Add parse-run persistence.

### Phase 3: Review Before Commit

1. Make upload create a document and parse run.
2. Review UI reads parse run.
3. User accepts/edits/discards components.
4. Commit route writes bank entries.
5. Preserve source refs in bank metadata.

### Phase 4: Preview V2

1. Render focused selected source spans.
2. Add source quality states.
3. Add PDF/source text/diagnostics tabs.
4. Add centered jump-to-source.
5. Keep fuzzy highlight layer for legacy rows only.

### Phase 5: AI Source-Cited Parser

1. Prompt with annotated source lines.
2. Require `sourceSpanIds`.
3. Validate cited IDs.
4. Compare deterministic vs AI output in diagnostics.
5. Use AI only as explicit mode or hybrid fallback depending on product policy.

## Recommended First Implementation Slice

The first agent should not attempt the full route migration. Start with a
vertical slice that proves source-grounded parsing works on the failing PDF
while keeping existing routes stable.

Scope:

1. Add the `syzfjbzwjncs.pdf` fixture and expected JSON.
2. Introduce an in-memory/source-only artifact builder that does not require a
   schema migration yet:
   - `apps/web/src/lib/ingest/pdf-source-map.ts`
   - `apps/web/src/lib/ingest/types.ts`
3. Reuse the existing pdf.js extraction machinery from
   `apps/web/src/lib/parse/pdf-positions.ts`, but return page/line/token
   source-map objects with stable IDs.
4. Add `parseResumeV2FromSourceMap()` in:
   - `apps/web/src/lib/ingest/parse-resume-v2.ts`
5. Cover the failing fixture with unit tests:
   - source lines are reconstructed correctly.
   - education entries are grouped correctly.
   - experience company/location fields are split.
   - project dates are not technologies.
   - parsed roots and bullets carry source span IDs.
6. Add a dev-only diagnostic helper or route after the parser tests pass.

Out of scope for the first slice:

- Database migrations for `document_artifacts` and `document_parse_runs`.
- Replacing `/api/upload`.
- Replacing `/api/parse`.
- Preview UI redesign.
- AI cited parser.

The target is a tested parser/source-map core that can later be wired into the
routes without mixing correctness work with migration work.

## Backward Compatibility

During migration:

- Keep `POST /api/upload` as a compatibility route.
- Keep `POST /api/parse` as a compatibility route.
- Internally route both to the new service layer where possible.
- Existing bank entries without source refs use existing fuzzy bbox matching.
- Existing `sourceBbox` and `sourceHeaderBbox` remain readable.

Eventually:

- `/api/upload` should become a thin wrapper around `/api/documents/upload`.
- `/api/parse` should become a thin wrapper around `parse-runs`.
- Fuzzy matching should be removed from the main ingestion path.

### Route Migration Decision

For the current parser-v2 rebuild, keep `/api/upload` and `/api/parse` as
compatibility routes.

Rationale:

- `/api/upload` still owns legacy review behavior: deterministic extraction,
  classification, bank ingestion, profile auto-promotion, PDF byte caching, and
  fuzzy bbox matching. Parser-v2 artifact creation now runs best-effort after
  the legacy document row is saved, so new provenance is available without
  changing the historical response contract.
- `/api/parse` still owns legacy reparse/profile promotion semantics and AI
  fallback/refund behavior. Basic mode now creates parser-v2 parse-run context
  when a ready source artifact exists, but parser-v2 failures remain non-fatal
  to legacy parsing.
- `/api/documents/upload`, `/api/documents/:id/extract`,
  `/api/documents/:id/parse-runs`, `/api/documents/:id/source-map`, and
  `/api/bank/imports/:parseRunId/*` are the parser-v2 route boundaries for new
  source-grounded flows.

Do not continue route migration in this phase unless one of these changes:

- The upload review UI no longer needs legacy persisted bank rows as a fallback.
- Existing clients have moved to the parser-v2 document/upload/extract/parse
  route sequence.
- Product policy changes from review-before-commit to automatic commit for
  high-confidence parse runs.
- A storage decision replaces the legacy in-memory PDF cache and fuzzy preview
  fallback for old rows.

## Open Questions

1. Should upload auto-create a parse run, or should the client explicitly call
   extraction then parse?
2. Should bank commit be automatic for high-confidence parse runs, or always
   review-first?
3. How long should original PDF bytes be retained for preview?
4. Should OCR be local-only, provider-backed, or configurable?
5. What confidence threshold should trigger AI/hybrid fallback?
6. Should parse runs be user-visible history?

## Implementation Notes

- Do not try to fix this by adding more fuzzy-match tiers first. The main
  failure is source structure and parser output quality.
- Do not make PDF preview responsible for proving parse correctness. Preview
  should display parser provenance.
- Keep deterministic parsing self-hostable.
- Add AI as an optional parser mode that is source-cited and validated.
- Keep old routes working while replacing their internals.

## Implementation Status

### 2026-05-18 Branch Status

Branch:

```text
codex/document-ingestion-v2
```

The branch contains the first source-grounded parser spike. It is intentionally
not merged to `main` yet.

Completed:

- Added `apps/web/tests/fixtures/parser-v2/syzfjbzwjncs.pdf`.
- Added `apps/web/tests/fixtures/parser-v2/syzfjbzwjncs.expected.json`.
- Added in-memory source-map types in `apps/web/src/lib/ingest/types.ts`.
- Added PDF source-map builder in
  `apps/web/src/lib/ingest/pdf-source-map.ts`.
- Added deterministic parser entry point in
  `apps/web/src/lib/ingest/parse-resume-v2.ts`.
- Added dev-only diagnostic helper in
  `apps/web/src/lib/ingest/diagnostics.ts`.
- Added focused Vitest coverage for source-map reconstruction and parser output.

Known gaps before this branch should merge:

- Rebase or re-create the branch on current `main`; the current branch also
  carries unrelated BentoRouter/LLM changes from an older base.
- Keep the first-slice patch limited to docs, `apps/web/src/lib/ingest/`, and
  `apps/web/tests/fixtures/parser-v2/`.
- Align fixture expectations with the Evaluation Plan:
  - education entries include `location`.
  - Southwestern field includes `Computer Science, Minor in Business`.
  - source-map reconstructed lines show visual column separation, for example
    `Southwestern University | Georgetown, TX`.
- Add a source-span resolver for parser-v2 diagnostics and preview-v2 wiring.
- Add `sourceQuality` (`exact`, `partial`, `missing`) to parser-v2 roots and
  bullets.
- Run focused parser/source-map tests and `pnpm --dir apps/web type-check`.

Next implementation slices:

1. Finish first-slice correctness hardening listed above. Done on `main` in
   `0fa16b7c`.
2. Add a small source-span resolver that maps `sourceSpanIds` to bboxes for
   parser-v2 diagnostics and future preview-v2 wiring. Done on `main` in
   `0fa16b7c`.
3. Add source quality classification (`exact`, `partial`, `missing`) for
   parser-v2 roots and bullets. Done on `main` in `0fa16b7c`.
4. Add parser-v2 fixtures beyond `syzfjbzwjncs.pdf` before generalizing
   heuristics. Done in the SWE fixture slice for
   `bznbzdprjfyy.pdf`.
5. Add persistence for `document_artifacts`, plus a read-only source artifact
   API. Done on `main` in `7819ba18`.
6. Add persistence for `document_parse_runs`, plus basic parser-v2 create/read
   routes. Done on `main` in `5a9e3087`.
7. Add explicit document extraction route that reads stored document files and
   persists parser-v2 source artifacts without changing legacy upload/parse
   side effects. Done in the extraction-route slice.
8. Add parser-v2 bank import commit route that writes reviewed parse-run
   components to `profile_bank` with `artifactId`, `parseRunId`,
   `sourceSpanIds`, source quality, and denormalized bboxes. Done in the
   bank-import commit slice.
9. Add parser-v2 source-map and stored PDF preview APIs for review UI wiring.
   Done in the source-map/preview API slice.
10. Add a parser-v2 fixture manifest that records public internet source,
    license, verification date, and file hashes for downloaded real-world
    resume fixtures. Done in the fixture-provenance slice for Jake's Resume.
11. Harden parser-v2 against the second public fixture's layout variants:
    single expected graduation dates, company/date followed by title/location,
    undated project headers, and wrapped bullet continuations. Done in the SWE
    fixture slice.
12. Add first-class source text and parser-v2 diagnostics to the source-map API
    so preview-v2 can render raw source and diagnostics tabs without recomputing
    provenance client-side. Done in the source-map diagnostics slice.
13. Start review UI wiring by running parser-v2 extraction/parse in the
    background for resume upload reviews, carrying source-map context in review
    state, and surfacing parser-v2 diagnostics/source text in the preview pane
    while leaving legacy bank review behavior intact. Done in the review-context
    bridge slice.
14. Add a read-only parser-v2 import preview route that materializes parse-run
    output into BankEntry-shaped review components without committing them.
    This gives the UI a server-owned conversion path before replacing legacy
    persisted bank rows in the review modal. Done in the import-preview route
    slice.
15. Switch resume upload reviews to parser-v2 draft entries when parser-v2
    preview data is available, keep edits/deletes local during review, and
    commit the accepted draft through `/api/bank/imports/:parseRunId/commit` on
    Done. Legacy persisted bank review remains the fallback when parser-v2
    context is unavailable. Done in the parser-v2 draft review slice.
16. Add `POST /api/documents/upload` as the parser-v2 upload boundary: validate
    and persist the source document, dedupe by user/file hash, and return
    extraction/parse/source-map next URLs without parsing or bank side effects.
    Done in the parser-v2 upload route slice.
17. Extract the parser-v2 document upload validation/dedupe/persistence into a
    shared service so compatibility routes can wrap the same boundary without
    duplicating file handling. Done in the upload service-boundary slice.
18. Move legacy `/api/upload` file validation, magic-byte checking, and hash
    calculation onto the shared upload service while preserving its existing
    extraction, classification, bank ingestion, profile auto-promotion, and
    legacy response behavior. Done in the legacy upload validation slice.
19. Extract basic parser-v2 parse-run creation into a shared service so
    compatibility routes can wrap artifact lookup, deterministic parsing, and
    parse-run persistence without duplicating route internals. Done in the
    parse-run service-boundary slice.
20. Bridge legacy `POST /api/parse` basic mode to parser-v2 parse-run creation
    when a source artifact already exists, returning optional parser-v2 context
    while preserving legacy profile auto-promotion, bank population, AI mode,
    and response compatibility. Done in the legacy parse bridge slice.
21. Persist a parser-v2 source artifact best-effort during legacy `/api/upload`
    after the document row is saved, so follow-up `/api/parse` calls can create
    parser-v2 parse runs without waiting for the review UI to call extraction.
    Artifact extraction failures remain non-fatal to legacy upload behavior.
    Done in the legacy upload artifact bridge slice.
22. Reject parser-v2 parse-run creation from failed extraction artifacts so a
    persisted failure marker cannot become a ready parse run. Done in the
    failed-artifact parse-run hardening slice.
23. Add AI source-cited parser prompt/validation helpers that build annotated
    source-line prompts, validate returned `sourceSpanIds` against artifact
    line IDs, classify citation quality, and warn on unsupported cited values.
    Done in the AI citation validation foundation slice.
24. Add an AI source-cited parser service entry point that calls the configured
    LLM with annotated source lines and returns raw cited JSON plus validation
    diagnostics before any route trusts the result. Done in the AI cited parser
    service slice.
25. Enable explicit parser-v2 `mode: "ai"` parse-run creation behind the AI
    gate, checking artifact readiness before billing and persisting raw cited
    AI JSON plus citation validation warnings as an AI parse run. Done in the
    AI parse-run route slice.
26. Harden document-file retention on deletion by evicting in-memory PDF
    preview cache entries and unlinking stored upload files from document,
    source-document, bulk source-document, and account deletion paths. Done in
    the document retention cleanup slice.
27. Normalize AI source-cited parse results into parser-v2 structured output so
    import preview/commit can materialize reviewed AI parse runs into bank
    entries while retaining raw AI JSON and citation diagnostics. Done in the AI
    parse-run normalization slice.
28. Add OCR fallback to parser-v2 PDF artifact extraction when pdf.js source
    text is too short, emitting an OCR-backed text source map and setting
    `ocrUsed: true`. Done in the parser-v2 OCR fallback slice.
29. Add PDF preview tabs for the parser-v2 review workspace so PDF uploads can
    switch between rendered PDF, raw source text, and parser diagnostics.
    Done in the PDF preview source tabs slice.
30. Make PDF highlights source-quality aware and focus the overlay on the
    selected component; exact, partial, and fuzzy citations render differently,
    and "Jump to highlight" scrolls toward the selected source span. Done in
    the source-quality highlight slice.
31. Add explicit parser-v2 `sourceRefs` to the source-map API so preview clients
    can consume component source IDs, source quality, parent links, and cited
    source text without walking raw parser internals. Done in the source-map
    source refs slice.
32. Add focused `/api/parse` compatibility coverage for auth, validation,
    missing documents, empty extracted text, non-fatal bank population, AI
    fallback/refund, and parser-v2 context creation. Done in the parse
    compatibility coverage slice.
33. Carry source-map `sourceRefs` through the parser-v2 review context loader so
    client review UI state has direct access to component source IDs, source
    quality, and cited text. Done in the client source refs slice.
34. Freeze `/api/upload` and `/api/parse` as compatibility routes for this
    phase, documenting the parser-v2 route boundaries and criteria for any
    future migration. Done in the route migration decision slice.
