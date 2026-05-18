# Highest-win implementation spec

> Status: implementation-ready spec from the May 18, 2026 unfinished-work audit.
> Scope: highest-impact product, launch-readiness, and verification gaps found in `apps/web` and `apps/extension`.

## Goal

Close the gaps that most directly affect user trust, data safety, extension release readiness, and launch credibility.

This spec intentionally does not cover every roadmap item. It focuses on the smallest set of changes with the highest expected return:

1. Prevent extension autofill from overwriting user-entered values without consent.
2. Add retry/backoff for transient extension API failures.
3. Make resume/file-upload fields explicit and safe instead of silently unsupported.
4. Replace Studio's LaTeX source stub with a useful source/export view.
5. Resolve public legal placeholders before paid/public launch.
6. Tighten CI/test gates enough that unfinished critical paths stay visible.

## Non-goals

- Taleo scraper implementation. It remains a useful platform expansion, but is not higher leverage than overwrite safety and release hardening.
- Extension profile editing. Keep the extension read-only until the autofill and import paths are safer.
- Full two-surface redesign context parity. Add only the context needed by the items below.
- Production account setup work such as creating the actual Turso database. Track that in `ROADMAP.md` and the deployment runbook.

## Phase 1 - Autofill overwrite safety

### Current state

- `apps/extension/src/content/auto-fill/engine.ts` clears existing field values before writing.
- `apps/extension/ROADMAP.md` lists existing-value conflict detection as not implemented.
- Sensitive fields are mostly skipped, but normal text/select/radio fields can still be overwritten if a user already typed a value.

### Design

Add conflict-aware filling to the autofill engine.

Field policy:

| Field state | Behavior |
| --- | --- |
| Empty field | Fill as today, subject to confidence rules. |
| Existing value exactly matches suggestion | Count as already-filled; do not rewrite. |
| Existing non-empty value differs from suggestion | Do not overwrite by default. Mark as conflict. |
| Existing non-empty value differs and user chose "overwrite all" | Overwrite and record the overwrite in details. |
| Checkbox/radio/select with existing selection | Treat as conflict unless the current selected value matches the suggestion. |

Add a `conflicts` count and conflict details to `FillResult`:

```ts
interface FillConflict {
  fieldType: string;
  currentValue: string;
  suggestedValue: string;
  label?: string;
}
```

Add `overwriteExisting?: boolean` to `FillFormOptions`. Default is `false`.

For v1 UI, do not build a complex per-field merge modal. The popup/sidebar can show a simple result message:

- "Filled 12 fields. Skipped 3 fields that already had values."
- Secondary action: "Overwrite skipped fields" reruns fill with `overwriteExisting: true`.

### Implementation notes

- Add helpers in `engine.ts`:
  - `getCurrentValue(element)`
  - `hasMeaningfulExistingValue(element)`
  - `valuesEquivalent(current, suggested)`
- For text inputs, remove the unconditional clear/write path unless policy allows writing.
- For selects, compare current selected option value/text against the suggestion before changing selection.
- For checkboxes/radios, compare current checked state against the suggested boolean.
- Include conflict info in `details` so telemetry and tests can assert exact behavior.

### Files

- `apps/extension/src/content/auto-fill/engine.ts`
- `apps/extension/src/content/index.ts`
- `apps/extension/src/popup/App.tsx`
- `apps/extension/src/content/sidebar/job-page-sidebar.tsx`
- `apps/extension/src/content/auto-fill/engine.test.ts`
- `apps/extension/tests/e2e/autofill.spec.ts`

### Acceptance criteria

- Autofill never clears a non-empty text field unless `overwriteExisting` is true.
- Existing select/radio/checkbox state is preserved unless `overwriteExisting` is true.
- The user sees how many fields were skipped because they already had values.
- A deliberate overwrite action exists and is clearly labeled.
- Corrections tracking still records only fields actually written by Slothing.

### Verification

```bash
pnpm --filter @slothing/extension exec vitest run src/content/auto-fill/engine.test.ts
pnpm --filter @slothing/extension exec playwright test tests/e2e/autofill.spec.ts --project=chromium
pnpm --filter @slothing/extension type-check
```

## Phase 2 - Extension API retry/backoff

### Current state

- `apps/extension/src/background/api-client.ts` makes one fetch and throws on any non-2xx response.
- Roadmap lists error retry logic as not implemented.

### Design

Wrap extension API requests in bounded retry logic for transient failures only.

Retry:

- Network errors.
- HTTP `408`, `429`, `500`, `502`, `503`, `504`.

Do not retry:

- `400`, `401`, `403`, `404`, validation errors, malformed payloads.
- Mutations that are not idempotent unless the route is known to de-dupe.

For v1, classify methods conservatively:

| Route group | Retry policy |
| --- | --- |
| `GET` requests | Retry transient failures. |
| Auth verify/profile/resumes | Retry transient failures. |
| Import/save/update mutations | Retry only if route already de-dupes by source ID or request ID. Otherwise do not retry. |
| Chat | Retry once on network/5xx only; never retry after partial response support exists. |

Add options to `authenticatedFetch`:

```ts
type RetryPolicy = "none" | "safe" | "once";
```

Default policy should be `"safe"` for GET-like calls and `"none"` for mutations unless explicitly opted in.

Backoff:

- Max attempts: 3 for safe calls, 2 for once.
- Delay: 250ms, then 750ms, with jitter.
- Honor `Retry-After` for `429` if it is less than 5 seconds.

### Files

- `apps/extension/src/background/api-client.ts`
- `apps/extension/src/background/api-client*.test.ts`
- `apps/extension/src/shared/error-messages.ts`

### Acceptance criteria

- `401` still clears auth immediately and is never retried.
- Transient profile/auth checks retry and eventually succeed in tests.
- Mutation routes are not accidentally duplicated.
- User-facing errors distinguish "still failing after retry" from immediate auth/config errors.

### Verification

```bash
pnpm --filter @slothing/extension exec vitest run src/background/api-client*.test.ts src/shared/error-messages.test.ts
pnpm --filter @slothing/extension test:run
```

## Phase 3 - Resume/file-upload handling

### Current state

- File inputs are skipped in `field-detector.ts`.
- `FieldMapper` returns `null` for `resume` and `coverLetter`.
- Users get no explicit explanation when an application asks for a resume upload.

### Design

Do not try to programmatically attach local files in v1. Browser security and user consent make silent file uploads the wrong default.

Instead, detect likely document upload inputs and create an explicit handoff:

1. Detect file inputs that look like resume, CV, cover letter, portfolio, or transcript fields.
2. Add them to a new `documentUpload` result category rather than regular autofill.
3. Show a sidebar/popup checklist item:
   - "Resume upload detected"
   - "Download latest tailored resume"
   - "Open Studio"
   - Optional "Copy file name" if a generated artifact exists.
4. Never set a file input value.

### Data model

Extend detected field types or add metadata:

```ts
type DocumentUploadKind = "resume" | "coverLetter" | "portfolio" | "transcript" | "unknown";

interface DetectedUploadField {
  element: HTMLInputElement;
  kind: DocumentUploadKind;
  label?: string;
  accept?: string;
}
```

Keep upload detections separate from normal `DetectedField[]` so existing autofill behavior stays predictable.

### Files

- `apps/extension/src/content/auto-fill/field-detector.ts`
- `apps/extension/src/shared/types.ts`
- `apps/extension/src/content/index.ts`
- `apps/extension/src/popup/App.tsx`
- `apps/extension/src/content/sidebar/job-page-sidebar.tsx`
- `apps/extension/tests/e2e/autofill.spec.ts`

### Acceptance criteria

- File inputs are detected and reported, not filled.
- The UI explains that the user must attach the file manually.
- If a latest resume exists from `/api/extension/resumes`, the UI links to/downloads it.
- Existing autofill count does not pretend file fields were filled or errored.

### Verification

```bash
pnpm --filter @slothing/extension exec vitest run src/content/auto-fill/field-detector.test.ts
pnpm --filter @slothing/extension exec playwright test tests/e2e/autofill.spec.ts --project=chromium
```

## Phase 4 - Studio LaTeX source view

### Current state

- `apps/web/src/components/studio/studio-canvas.tsx` renders `LatexStub` for `mode === "latex"`.
- The app already has LaTeX export endpoint coverage elsewhere, so a completely blank source pane is now lower quality than the underlying capability.

### Design

Replace `LatexStub` with a real source preview panel:

- Convert the current Studio document HTML/content into LaTeX using the existing HTML-to-LaTeX/export pipeline.
- Render read-only source in a scrollable `<pre>` with line wrapping off by default.
- Provide actions:
  - Copy `.tex`
  - Download `.tex`
  - Switch back to Visual
- Show a small status row:
  - template name
  - generated timestamp
  - warning if conversion had unsupported nodes

If client-side conversion cannot reuse the server pipeline cleanly, add a lightweight `/api/export/latex/preview` endpoint that returns `{ tex, warnings }` without forcing a download.

### Files

- `apps/web/src/components/studio/studio-canvas.tsx`
- `apps/web/src/lib/export/html-to-latex.ts`
- `apps/web/src/app/api/export/latex/route.ts`
- Optional: `apps/web/src/app/api/export/latex/preview/route.ts`
- `apps/web/src/app/[locale]/(app)/studio/page.test.tsx`

### Acceptance criteria

- Clicking LaTeX shows real source, not roadmap copy.
- Copy and download actions produce the same source.
- Unsupported editor nodes produce a visible warning but do not crash Studio.
- Existing PDF/DOCX/HTML export behavior is unchanged.

### Verification

```bash
pnpm --filter @slothing/web exec vitest run src/app/[locale]/\(app\)/studio/page.test.tsx src/lib/export/html-to-latex*.test.ts
pnpm --filter @slothing/web type-check
pnpm --filter @slothing/web lint
```

## Phase 5 - Legal launch placeholders

### Current state

- `/terms` says governing law and dispute resolution are still being finalized.
- The copy is tested as expected, which means CI currently preserves the placeholder.

### Design

Before public paid launch, replace draft language with final reviewed language.

Implementation should keep legal copy centralized enough that future updates are deliberate:

- Add `apps/web/src/lib/legal/legal-copy.ts` or similar.
- Export `TERMS_LAST_UPDATED`, `PRIVACY_LAST_UPDATED`, and terms section copy.
- Update `/terms` and `/privacy` to consume constants.
- Update tests to assert no draft markers remain.

### Files

- `apps/web/src/app/[locale]/(marketing)/terms/page.tsx`
- `apps/web/src/app/[locale]/(marketing)/privacy/page.tsx`
- `apps/web/src/app/[locale]/(marketing)/terms/page.test.tsx`
- Optional: `apps/web/src/lib/legal/legal-copy.ts`

### Acceptance criteria

- No "being finalized", "TBD", or draft-warning legal copy remains on public terms.
- Last-updated dates are constants, not duplicated literals.
- Tests fail if draft markers are reintroduced.

### Verification

```bash
pnpm --filter @slothing/web exec vitest run src/app/[locale]/\(marketing\)/terms/page.test.tsx
rg -n "TBD|being finalized|draft|legal counsel" apps/web/src/app/[locale]/\(marketing\)/terms apps/web/src/app/[locale]/\(marketing\)/privacy
```

## Phase 6 - CI and skipped-test visibility

### Current state

- CI runs unit tests, lint, type-check, translations, and smoke E2E only.
- Multiple high-value E2E suites are fully skipped.
- Some feature-level tests are explicitly skipped.

### Design

Do not make CI run the entire E2E matrix on every PR immediately. First make skipped coverage visible and enforce a smaller no-regression bar.

Add a script that fails on new unconditional skips outside an allowlist:

- `test.skip(true, ...)`
- `test.describe.skip(...)`
- `it.skip(...)`
- `test.skip(...)` at file top level

Allow conditional environment skips with a clear reason for auth/live-integration paths.

Add an allowlist file:

- `apps/web/e2e/skips.allowlist.json` or `scripts/skipped-tests.allowlist.json`

Each entry should include:

- file
- line or stable test title
- reason
- owner
- target removal condition

CI additions:

1. Run skipped-test audit in quality gates.
2. Run at least one non-smoke E2E shard nightly or on main.
3. Keep PR smoke E2E, but add a required browser-extension integration smoke when extension files change.

### Files

- `.github/workflows/ci.yml`
- Optional: `.github/workflows/e2e-nightly.yml`
- `apps/web/scripts/check-skipped-tests.ts` or `scripts/check-skipped-tests.ts`
- `scripts/skipped-tests.allowlist.json`
- Existing skipped E2E specs.

### Acceptance criteria

- CI fails if a new unconditional skipped test is added without allowlist metadata.
- Existing skipped suites are documented in an allowlist with removal conditions.
- At least one non-smoke web E2E path runs outside local-only workflows.
- Extension integration test can run in CI when explicitly configured, without requiring a developer machine.

### Verification

```bash
pnpm --filter @slothing/web test:e2e -- --project=chromium --grep "@smoke"
rg -n "test\\.skip\\(|describe\\.skip\\(|it\\.skip\\(" apps/web/e2e apps/extension/tests apps/web/src
pnpm run type-check
pnpm run lint
pnpm run test:run
```

## Recommended ticket order

1. Extension overwrite safety.
2. Extension API retry/backoff.
3. Resume/file-upload detection and handoff.
4. CI skipped-test audit.
5. Studio LaTeX source view.
6. Terms/legal placeholder replacement.

The first three should be grouped as the extension release-hardening milestone. They protect users from data loss and make the extension feel reliable. The CI skipped-test audit should follow immediately so those guarantees do not regress.

## Done definition

This spec is complete when:

- The extension no longer overwrites existing values by default.
- Transient extension API failures retry safely.
- File upload fields produce a clear user handoff.
- Studio LaTeX mode renders usable `.tex` source.
- Terms and privacy copy no longer contain launch-blocking draft placeholders.
- CI blocks new unexplained skipped tests and has at least one non-smoke E2E path outside local-only runs.
