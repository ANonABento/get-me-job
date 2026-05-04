# Test 1.4 — Stress + Edge-Case Verification (Redo of PR #207)

Scope: hostile input verification for the canonical bank upload route at
`POST /api/upload` (`src/app/api/upload/route.ts`). Per the T2 routes
consolidation, `/api/upload` is the single ingestion endpoint that powers the
profile bank — so all stress fixtures target it.

Method: a reusable harness at [`tests/stress/upload-stress.ts`](./stress/upload-stress.ts)
generates ten hostile fixtures programmatically (no large committed binaries),
fires them through the real `POST` handler with `vi.mock` swapping the LLM /
parser / SQLite / OCR layers, and captures response status, mocked DB call
counts, and on-disk-write counts. The harness exposes `runStressFixture` and
`runConcurrentStress`, plus an `analyzeStressResult` classifier so future
hostile inputs slot in by appending one entry to `HOSTILE_INPUT_TYPES`.

Vitest run output (truncated, see `tests/stress/upload-stress.test.ts`):

```
[stress] 100-page resume              status=200 save=1 bank=1 write=1 severity=low
[stress] corrupt PDF                  status=200 save=1 bank=0 write=1 severity=medium
[stress] password-protected PDF       status=200 save=1 bank=0 write=1 severity=medium
[stress] empty PDF                    status=200 save=1 bank=0 write=1 severity=medium
[stress] wrong file type renamed      status=400 save=0 bank=0 write=0 severity=low
[stress] concurrent uploads           status=200 save=5 bank=0 write=5 severity=high
[stress] 50MB file                    status=400 save=0 bank=0 write=0 severity=low
[stress] filename injection           status=200 save=1 bank=1 write=1 severity=medium
[stress] nested PDF                   status=200 save=1 bank=1 write=1 severity=low
[stress] unicode-heavy                status=200 save=1 bank=1 write=1 severity=low
```

## Severity-tagged findings table

| # | Input | Severity | Expected | Actual | Divergence | RCA tag |
| - | --- | --- | --- | --- | --- | --- |
| 1 | 100-page resume | low | Parse or cap gracefully | 200 + 1 doc + 1 bank entry | none | n/a |
| 2 | Corrupt PDF (50% truncated) | **medium** | 4xx, no persistence | 200 + 1 doc + 0 bank | parser exception swallowed; doc still saved with `extractedText=undefined` | `corrupt-pdf-saves-doc` |
| 3 | Password-protected PDF | **medium** | Password-specific 4xx, no persistence | 200 + 1 doc + 0 bank | no encryption-aware branch; same path as corrupt | `pwd-pdf-no-detection` |
| 4 | Empty PDF (1 blank page) | **medium** | 4xx no-content, no persistence | 200 + 1 doc + 0 bank | extracted text empty but route still calls `saveDocument` | `empty-pdf-saves-doc` |
| 5 | Wrong file type (JPEG renamed `.pdf`) | low | 4xx pre-write | 400, 0 writes, 0 saves | none — magic-byte guard fires | n/a |
| 6 | Concurrent uploads (5x identical) | **high** | One persisted record (T1 dedupe contract) | 5x 200, **5 saveDocument calls, 5 disk writes** | dedupe is `SELECT then INSERT` with no transaction or unique constraint; race lets all five through | `concurrent-dedupe-race` |
| 7 | 50MB file | low | 4xx pre-write | 400, 0 writes, 0 saves | none — `MAX_FILE_SIZE_BYTES = 10MB` guard fires | n/a |
| 8 | Filename injection (`../../etc/passwd<script>alert(1)</script>.pdf`) | **medium** | Sanitised display filename, safe path | 200 + safe path on disk, **but `filename` column persists raw `<script>` content** | the route only sanitises the on-disk path (server-generated UUID), not the display filename | `filename-injection-display` |
| 9 | Nested PDF (inner PDF marker in text stream) | low | No recursion | Outer parsed once; `extractTextFromFile` called exactly once | none | n/a |
| 10 | Unicode-heavy (emoji, RTL Arabic/Hebrew, math) | low | Round-trip without crash | 200 + 1 doc + 1 bank entry; UTF-8 filename preserved | none observed at upload layer | n/a |

Severity breakdown: 1 high, 4 medium, 5 low, 0 critical.

Follow-up issues are filed for the **5 medium-and-above findings** (#2, #3, #4,
#6, #8). Inputs flagged `low` are passing the route's existing guards.

---

## Per-input deep dives

### 1. 100-page resume — `low`

**Setup.** `createMinimalPdf(Array.from({length:100}, ...))` emits a valid PDF
with one `/Type /Page` per fictional resume entry. Total bytes ~30KB; magic
bytes correct.

**Expected.** Either parses successfully or caps gracefully. No crash.

**Actual.** Status 200, `saveDocument` fired once, `insertBankEntries` once.
Mocked `extractTextFromFile` returned 100 page strings — the route ran the
classifier-by-fallback path and called `smartParseResume`.

**Divergence.** None for the route layer. There is no explicit page count cap
in `/api/upload`; long documents rely on `smartParseResume` and the underlying
LLM token limits. That's a parser concern outside this test's scope.

**RCA.** N/A. Documented for future regression — if the route grows a
`maxPages` guard, this fixture flips to a guard-fires assertion.

---

### 2. Corrupt PDF (50% truncated) — `medium`

**Setup.** Generate a valid 2-page PDF, slice to `pdf.length / 2`. Magic bytes
still match (the `%PDF-` header is in the first 5 bytes), so the magic-byte
guard does not fire.

**Expected.** Return a 4xx parse error. Skip `saveDocument` and
`insertBankEntries`.

**Actual.** Status 200. `saveDocument` fired with the corrupt file. `insertBankEntries`
did not fire (because `parsedData?.data` was empty). The user sees a successful
upload for an unreadable file.

**Divergence.** `route.ts` lines 113–118:

```ts
try {
  extractedText = await extractTextFromFile(filePath);
} catch (err) {
  console.error("[upload] Text extraction failed:", err);
}
```

The parser exception is swallowed and the route proceeds to `saveDocument`.

**RCA tag.** `corrupt-pdf-saves-doc`. The fix is to bubble parse failures into
a typed 4xx response and abort persistence. The current behaviour leaves the
documents table with rows whose `extracted_text` is null and whose
`parsed_data` is undefined — useless audit residue.

---

### 3. Password-protected PDF — `medium`

**Setup.** Synthetic PDF with `/Encrypt` dictionary entry. Magic bytes valid.

**Expected.** Detect encryption and return a 4xx that says "remove password
before uploading". No persistence.

**Actual.** Same as the corrupt-PDF case. `extractTextFromFile` throws
"File is encrypted" inside `pdf-parse`; the route swallows and continues to
`saveDocument`.

**Divergence.** No encryption-aware branch in the route or the parser. Today
encrypted PDFs are indistinguishable from "scan with bad OCR" inputs from a
user perspective.

**RCA tag.** `pwd-pdf-no-detection`. Fix: detect encryption either by reading
the trailer's `/Encrypt` indirect reference, or by mapping `pdf-parse`'s
encryption error to a dedicated 4xx with code `ENCRYPTED_PDF`.

---

### 4. Empty PDF (1 page, no text stream) — `medium`

**Setup.** `createMinimalPdf([""])` — valid structure, blank content stream.

**Expected.** "No parseable content" error. No source document persisted.

**Actual.** Status 200. `saveDocument` fired. `insertBankEntries` did not fire
(empty profile). Result: a source document row with no useful content.

**Divergence.** Same root cause as #2 — the route's persistence path is not
gated on extracted text. Even when `extractedText` is `""`, line 158 still
calls `saveDocument`.

**RCA tag.** `empty-pdf-saves-doc`. Fix: gate `saveDocument` on
`extractedText && extractedText.trim().length > 0` (or a min-tokens check) and
return `{ error: "No content found in document" }` with status 422 when not
met.

---

### 5. Wrong file type renamed (JPEG → `.pdf`) — `low`

**Setup.** Bytes `FF D8 FF E0 00 10 J F I F` (JPEG SOI + JFIF) sent with
`mimeType: "application/pdf"` and `name: "renamed-image.pdf"`.

**Expected.** Reject with 400 before any parse or write.

**Actual.** Status 400, response `{ error: "File content does not match its
type. Please upload a valid document." }`. `writeFile` count = 0,
`saveDocument` count = 0.

**Divergence.** None. `validateFileMagicBytes` in
`src/lib/constants/documents.ts` correctly rejects mismatched magic bytes.

---

### 6. Concurrent uploads (5x identical) — `high`

**Setup.** `runConcurrentStress` fires five `POST /api/upload` requests in
parallel with byte-identical payloads. `getDocumentByFileHash` is mocked to
return `null` for all five (simulating the race window before any of them has
written).

**Expected.** T1 dedupe contract says exactly one record persists. The five
concurrent requests should resolve as one 200 + four 409s, or all five succeed
to a single shared record.

**Actual.** All five returned 200 and **`saveDocument` was called 5 times.
`writeFile` was called 5 times.** No dedupe coordination; we get 5 documents
with the same file hash and 5 separate disk writes.

**Divergence.** `route.ts` lines 77–93 implement dedupe as

```ts
const existingDocument = getDocumentByFileHash(fileHash, userId);
if (existingDocument && !forceUpload) return 409;
```

The `SELECT … FROM documents WHERE file_hash = ?` and the subsequent
`INSERT INTO documents (…)` are not atomic — there's a multi-step await
between them (magic byte check, file write, parser, classifier). Five parallel
requests all observe `existingDocument == null` at the SELECT step and all
INSERT independently.

**RCA tag.** `concurrent-dedupe-race`. Fix: add a `UNIQUE(user_id, file_hash)`
constraint to the `documents` table and convert the INSERT to
`INSERT … ON CONFLICT(user_id, file_hash) DO NOTHING RETURNING *`. After the
INSERT, re-check whether the row was created by the current request; if not,
return a 409 with the existing record. This makes dedupe race-safe at the SQL
level, which is the only correct layer.

---

### 7. 50MB padded file — `low`

**Setup.** Valid 1-page PDF padded with 50MB of trailing space bytes. Magic
bytes valid; total size > `MAX_FILE_SIZE_BYTES` (10MB).

**Expected.** Reject with 400 before any disk write.

**Actual.** Status 400, response `{ error: "File too large. Maximum size is
10MB" }`. `writeFile` count = 0, `saveDocument` count = 0.

**Divergence.** None. The size guard at `route.ts:46` fires before
`arrayBuffer()` reads the bytes, before magic-byte validation, before disk
write — exactly the desired ordering.

---

### 8. Filename injection — `medium`

**Setup.** A valid 1-page PDF uploaded with filename
`../../etc/passwd<script>alert(1)</script>.pdf`. Magic bytes valid.

**Expected.**
1. The on-disk path must not contain `..` traversal segments.
2. The persisted display filename must be sanitised so future UI surfaces do
   not need to remember to escape user-supplied content.

**Actual.**
- (1) holds: the route uses `generateId()` + `path.extname(file.name)` to
  build the on-disk path. The hostile filename's traversal segments are
  stripped because only the extension survives. Path observed in mocked
  `saveDocument`: `<UPLOADS>/<uuid>.pdf`. ✓
- (2) fails: `saveDocument` is called with `filename: file.name` — the raw
  hostile string `../../etc/passwd<script>alert(1)</script>.pdf` is stored
  verbatim in the `documents.filename` column and returned in the API
  response payload.

**Divergence.** The filesystem layer is safe (good!), but the persistence and
API-response layers leak the hostile string. Today this is mitigated by React
auto-escaping, but it is one careless `dangerouslySetInnerHTML` away from
becoming an XSS surface, and the audit/log channels (which do not necessarily
escape) are exposed today.

**RCA tag.** `filename-injection-display`. Fix: at the route layer, normalise
`file.name` before persistence — strip `<`, `>`, control characters, leading
`./` or `../` sequences, and clamp length. Optionally store the original in a
separate `original_filename` column for forensics.

---

### 9. Nested PDF — `low`

**Setup.** Outer PDF whose first page text stream contains a substring of an
inner PDF's bytes (the `%PDF-` magic and a few objects). Tests whether any
"recurse on `%PDF-` markers" code path exists.

**Expected.** Outer parsed exactly once. No recursion into the inner marker.

**Actual.** `extractTextFromFile` mock asserted called exactly once. Status
200. No recursion.

**Divergence.** None. The route does not implement embedded-document
extraction, and `pdf-parse` does not either. This will need re-evaluation if
the parser is upgraded to one that follows `/EmbeddedFiles` references.

---

### 10. Unicode-heavy — `low`

**Setup.** PDF whose page text contains rocket emoji, Arabic RTL ("مرحبا"),
Hebrew RTL ("שלום"), CJK ("你好"), math symbols ("∑ λ π ∞"), and a regional
indicator pair flag.

**Expected.** Bytes survive end-to-end without crash, encoding error, or
filename truncation.

**Actual.** Status 200, doc saved, filename `unicode-heavy-resume.pdf`
(ASCII filename — the unicode is in the *content*, not the filename).
`saveDocument` received the file's full text via the mocked extractor.

**Divergence.** None at the route layer. Real-world unicode fidelity through
`pdf-parse` is a parser concern; the route correctly hashes and stores the
bytes. A future fixture should probe a unicode *filename* specifically (e.g.
`résumé-🚀.pdf`).

---

## Follow-up issues

Per task instructions, every medium-or-above finding has a corresponding
GitHub issue (created via `gh issue create` because bento-ya MCP is currently
rejecting writes). Issue numbers are recorded after the title once filed.

| # | Severity | Title |
| - | --- | --- |
| 2 | medium | Stress fix — corrupt PDF — fail parse errors before saving documents |
| 3 | medium | Stress fix — password-protected PDF — return password-specific upload error |
| 4 | medium | Stress fix — empty PDF — reject uploads with no parseable content |
| 6 | high | Stress fix — concurrent uploads — make dedupe race-safe with unique constraint |
| 8 | medium | Stress fix — filename injection — sanitise persisted display filenames |

## How to extend the harness

1. Append a new string to `HOSTILE_INPUT_TYPES` in
   `tests/stress/upload-stress.ts`.
2. Add a `case` to `createStressFixture` that builds the bytes
   programmatically (use `createMinimalPdf` for valid-PDF scaffolding).
3. Add an `it(...)` block in `tests/stress/upload-stress.test.ts` that calls
   `runOne` and asserts on the resulting `StressResult`.
4. Run `npx vitest run tests/stress/upload-stress.test.ts`.

## How to reproduce

```sh
# Type check (pre-existing dashboard errors are unrelated)
npm run type-check

# Lint
npm run lint

# Stress harness only
npx vitest run tests/stress/upload-stress.test.ts

# Full suite (3 pre-existing failures in src/components/jobs/job-card.test.tsx)
npm run test:run
```
