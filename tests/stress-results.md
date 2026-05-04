# Stress + Edge-Case Upload Verification

Scope: hostile input verification for the real `/api/upload` bank upload endpoint.

Method: added a reusable fixture and upload harness at `tests/stress/upload-stress.ts`, then reviewed the endpoint behavior against each generated input. The harness generates all fixtures programmatically, including large and malformed PDFs, so no large binaries are committed.

Follow-up task creation: attempted through the available GitHub MCP issue tool because no bento-ya `create_task` tool is available in this session. GitHub returned 403 `Resource not accessible by integration`, so the follow-up task payloads are documented below but were not created remotely.

| Input | Expected | Actual | Severity |
| --- | --- | --- | --- |
| 100-page resume | Complete or cap gracefully | Expected to pass validation and parse without pre-parse cap | Low |
| Corrupt PDF | Clear error, no writes | Extraction failure is logged, but upload can still return success and save a document | Medium |
| Password-protected PDF | Password-specific error, no writes | No password-protection branch; unreadable PDF follows generic extraction failure path | Medium |
| Empty PDF | No parseable content error, no entries | Empty extraction can still save a source document with no useful content | Medium |
| Wrong type renamed | Reject by magic bytes | Rejected before parsing with a clear invalid-content error | Low |
| Concurrent uploads | Five uploads dedupe to one record | Upload route has no document-level dedupe or in-flight coordination | High |
| Huge file | Reject before parsing | Rejected before parsing by the 10MB size limit | Low |
| Filename injection | Sanitized stored/display filename | Storage path is generated safely, but original display filename is persisted unsanitized | Medium |
| Zip bomb / nested PDF | No unbounded recursion | No embedded-document recursion path observed | Low |
| Unicode-heavy resume | Preserve characters end-to-end | No crash path observed; extraction fidelity should be checked with real UTF-16 PDF fixtures later | Low |

## 100-page resume

Test setup: `createStressFixture("100-page resume")` builds a valid PDF with 100 generated resume pages.

Expected behavior: parsing completes or caps work gracefully without timeout or crash.

Actual behavior: the route allows the file when it is under 10MB, validates PDF magic bytes, writes it, extracts text, classifies it, and attempts smart parsing. There is no explicit page or extracted-text cap in `/api/upload`.

Divergence analysis: no hard failure identified, but long documents rely on parser/runtime behavior rather than a documented cap.

Severity: low.

## Corrupt PDF

Test setup: generate a normal PDF, then truncate the byte array to 50%.

Expected behavior: return a clear error and write no document or bank rows.

Actual behavior: `/api/upload` catches extraction errors, logs them, and continues. It can classify by filename fallback and save a document with `extractedText` undefined.

Divergence analysis: this is graceful at process level but not at product/data-integrity level. The user can see a successful upload for an unreadable file, and the DB can contain a source document that produced no content.

Severity: medium.

Follow-up task payload:

Title: `Stress fix — corrupt PDF — fail parse errors before saving documents`

Scope: return a clear 4xx unreadable/corrupt PDF error when extraction fails, and add route tests proving no document or bank entries are persisted.

## Password-Protected PDF

Test setup: generate a PDF-like payload with an `/Encrypt` marker.

Expected behavior: detect password protection and return a message asking the user to remove the password.

Actual behavior: there is no password-protected PDF detection branch. These files follow the same extraction-failure path as corrupt PDFs.

Divergence analysis: the current behavior cannot give the user actionable guidance and may still save an unusable document.

Severity: medium.

Follow-up task payload:

Title: `Stress fix — password-protected PDF — return password-specific upload error`

Scope: detect encrypted PDFs before extraction or map parser encryption failures to a password-specific 4xx response; ensure no persistence occurs.

## Empty PDF

Test setup: generate a one-page blank PDF with no text stream content.

Expected behavior: return a clean "no parseable content" response and create no bank entries.

Actual behavior: extraction can produce an empty string, after which the route still classifies by filename and saves the document. It creates no structured entries, but the source document remains.

Divergence analysis: data integrity is partially preserved for bank entries, but the source document list can include a useless upload presented as successful.

Severity: medium.

Follow-up task payload:

Title: `Stress fix — empty PDF — reject uploads with no parseable content`

Scope: require non-empty extracted content for parseable uploads and add tests for blank PDFs.

## Wrong File Type Renamed

Test setup: generate JPEG magic bytes and submit them as `renamed-image.pdf` with MIME type `application/pdf`.

Expected behavior: reject by file magic or fail gracefully.

Actual behavior: `validateFileMagicBytes` compares PDF magic bytes and returns a 400 error before writing the file.

Divergence analysis: behavior matches expectation.

Severity: low.

## Concurrent Uploads

Test setup: `uploadConcurrentFixture` fires five parallel uploads of the same generated PDF.

Expected behavior: dedupe handles concurrency correctly and only one record persists.

Actual behavior: `/api/upload` generates a fresh document ID for each request and saves every upload. No document hash, unique constraint, or in-flight dedupe path is present.

Divergence analysis: repeated uploads of the same source can create duplicate documents and duplicate profile bank entries under concurrency.

Severity: high.

Follow-up task payload:

Title: `Stress fix — concurrent uploads — add document-level dedupe with race protection`

Scope: hash uploaded bytes, enforce per-user uniqueness, wrap document and bank entry creation in an atomic operation, and add a parallel upload regression test.

## Huge File

Test setup: generate a valid PDF and pad it above 50MB.

Expected behavior: reject before parsing with a clear file-too-large error.

Actual behavior: the route checks `MAX_FILE_SIZE_BYTES` before reading bytes for magic validation and returns a 400 error.

Divergence analysis: behavior matches expectation.

Severity: low.

## Filename Injection

Test setup: upload a valid PDF named `../../etc/passwd<script>alert(1)</script>.pdf`.

Expected behavior: sanitize the stored display filename; never use user filename for filesystem paths or unsafe UI rendering.

Actual behavior: filesystem path uses a generated ID and only keeps the extension, so path traversal is avoided. The original filename is saved and returned in JSON unchanged.

Divergence analysis: React rendering should escape the value, but the API still persists and returns raw hostile display text. Sanitizing or separately storing original and safe display names would reduce XSS and audit risk across future UI surfaces.

Severity: medium.

Follow-up task payload:

Title: `Stress fix — filename injection — sanitize persisted display filenames`

Scope: normalize display filenames before persistence, preserve safe extensions, and test API responses plus source-document UI rendering.

## Zip Bomb / Nested PDF

Test setup: generate a PDF containing an embedded PDF marker in text payload.

Expected behavior: no unbounded recursion into embedded documents.

Actual behavior: the route sends the uploaded file to the parser once. No embedded-document recursion path is present in the upload route.

Divergence analysis: behavior matches expectation for current parser wiring.

Severity: low.

## Unicode-Heavy Resume

Test setup: generate a PDF fixture containing mixed RTL/LTR text and mathematical symbols.

Expected behavior: preserve characters end-to-end without crash or storage corruption.

Actual behavior: no crash path is apparent in the route. Full Unicode extraction fidelity depends on parser/PDF encoding behavior and should be validated with a real UTF-16 or embedded-font PDF in a later parser-focused test.

Divergence analysis: no upload-level failure identified, but the generated fixture is a lightweight stress marker rather than a full font-embedded PDF.

Severity: low.
