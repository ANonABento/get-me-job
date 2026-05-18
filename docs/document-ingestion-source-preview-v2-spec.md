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
   heuristics.
5. Add persistence for `document_artifacts`, plus a read-only source artifact
   API. In progress.
6. Add persistence for `document_parse_runs`.
7. Keep `/api/upload` and `/api/parse` route migration out until persistence is
   reviewed separately.
