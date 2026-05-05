# Security Audit — 2026-05-04

**Scope.** OWASP Top 10 sweep + app-specific vectors (resume/PDF uploads, JD scraping, AI prompt injection, multi-user data isolation, dependency audit, security headers).

**Branch.** `bentoya/security-audit-owasp-top-10-auth-uploads-deps`

**Stack.** Next.js 14 (App Router), TypeScript, Drizzle + libSQL/SQLite, Clerk auth (with local-dev fallback), TipTap editor, multi-provider LLM client.

---

## Executive summary

Eight distinct issues were uncovered. **One CRITICAL** (Clerk middleware bypass via vulnerable @clerk/* versions) and **one HIGH IDOR** (prompt-variants table had no `user_id` column → any authenticated user could read/modify another user's prompt variants by id) were fixed in this PR. Defense-in-depth fixes were added for SSRF, security headers, error leakage, and rate-limiting. The two remaining vulnerabilities (Next.js 14 advisories and esbuild dev-only) require breaking-change upgrades and are tracked as accepted risk pending a separate Next 16 migration.

| Severity | Count | Fixed in PR | Accepted-risk |
| --- | --- | --- | --- |
| Critical | 1 | 1 | 0 |
| High | 6 | 5 | 1 |
| Medium | 5 | 4 | 1 |
| Low | 1 | 0 | 1 |

---

## OWASP Top 10 sweep

### A01 Broken Access Control

**Finding A01-1 — HIGH IDOR: `prompt_variants` table is global, not per-user.**
The legacy `prompt_variants` and `prompt_variant_results` tables had no `user_id` column. All ten DB functions (`getPromptVariantById`, `setActivePromptVariant`, `updatePromptVariant`, `deletePromptVariant`, `createPromptVariant`, `seedDefaultPromptVariant`, `getActivePromptVariant`, `getAllPromptVariants`, `getPromptVariantStats`, `getPromptVariantResults`) operated on rows by id only.

Routes affected: `PATCH /api/prompts/[id]`, `DELETE /api/prompts/[id]`, `GET/POST /api/prompts`, `GET /api/prompts/results`, plus `logPromptVariantResult` calls from `/api/tailor`.

**Exploit.** Authenticated user A guesses user B's variant id and:
- reads its content (`GET` would return it),
- rewrites it (`PATCH` with `{ content: "INSERT MALICIOUS PROMPT" }`),
- deactivates / deletes it.
Once the rewritten prompt becomes active, every resume tailor for user B uses A's prompt — letting A inject instructions, exfiltrate tailored output via the LLM, or simply ruin B's resumes.

**Fix.** Added `user_id` to both tables (with a runtime `ALTER TABLE ADD COLUMN` migration in `ensurePromptVariantsUserSchema()` so existing dev DBs upgrade in place), threaded `userId` through every function signature, and added `WHERE user_id = ?` to every read/update/delete. Routes now pass `authResult.userId` from `requireAuth()`. Cross-user isolation is now enforced by both the application and the underlying SQL.

**Files.** `src/lib/db/schema.ts`, `src/lib/db/prompt-variants.ts`, `src/lib/tailor/generate.ts`, `src/app/api/prompts/route.ts`, `src/app/api/prompts/[id]/route.ts`, `src/app/api/prompts/results/route.ts`, `src/app/api/tailor/route.ts`. Regression test: `src/lib/db/prompt-variants.test.ts` "multi-user isolation (IDOR regression test)" — six negative tests covering read, update, delete, set-active, list, results.

**Finding A01-2 — All other `route.ts` files were spot-checked.** Every `src/app/api/**/route.ts` calls `requireAuth()` (or `requireExtensionAuth`/HMAC token verification for extension/iCal endpoints), and every DB query passes `userId` into a `userId`-scoped helper. Calendar feed (`/api/calendar/feed`) is intentionally public, gated by HMAC-SHA256 token (`verifyCalendarFeedToken`). No additional gaps found.

### A02 Cryptographic Failures

**Finding A02-1 — Passwords are not stored locally.** Authentication is delegated to Clerk; the app never sees plaintext passwords. No bcrypt/argon2 needed in this codebase. Hashes used (`crypto.createHash("sha256")` for file dedupe, in `dedupe-backfill.ts` and `/api/upload`) are content-identity hashes, not credentials. **No issue.**

**Finding A02-2 — No MD5 or SHA1 usage in source.** Verified via grep.

### A03 Injection

**Finding A03-1 — Drizzle ORM SQL identifier injection (HIGH, dependency).** `drizzle-orm@<0.45.2` had a published advisory (GHSA-gpj5-g38j-94v9) for SQL injection via improperly escaped identifiers. Resolved via `npm audit fix` upgrade to the patched line.

**Finding A03-2 — Raw SQL is parameterized.** `db.exec()` is only called on hardcoded SQL strings (migrations, virtual table bootstrap). `db.prepare(sql).run(args)` is used everywhere else; arguments are bound, not interpolated. No string concatenation of user input into SQL. **No issue beyond A03-1.**

### A04 Insecure Design

**Finding A04-1 — No password reset flow to attack.** Auth is delegated to Clerk. Clerk's own password reset flow follows industry practices.

**Finding A04-2 — No account enumeration on local-dev endpoints.** Local-dev fallback resolves all unauthenticated requests to a single shared `default` user. This is fine for local dev but **must not** be deployed without Clerk env vars set. `requireAuth()` already returns the local-dev user only when both `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are missing (`src/lib/auth.ts:15`).

### A05 Security Misconfiguration

**Finding A05-1 — HIGH: Zero security headers were emitted.** No CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, or Permissions-Policy. `next.config.mjs` set none, middleware set none.

**Fix.** Added `src/lib/security/headers.ts::applySecurityHeaders` and wired it into `src/middleware.ts` for both Clerk-authenticated and Clerk-disabled paths. Headers applied:
- `Content-Security-Policy` with `default-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`, `base-uri 'self'`, no `unsafe-eval`. Allows Clerk origins under `script-src`/`connect-src`/`frame-src`.
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` (HTTPS only — local http://localhost dev still works).
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(self), geolocation=(), payment=(), usb=()` (microphone allowed for interview voice mode).

Coverage proven by `src/lib/security/headers.test.ts` (7 tests).

**Finding A05-2 — MEDIUM: Error message echoed in cover-letter SSE stream.** `src/app/api/opportunities/[id]/cover-letter/stream/route.ts:104` previously sent `error.message` to the client. LLM SDK errors sometimes include request IDs / API key suffixes / internal stack frames. **Fix.** Now logs internally and streams a generic `"Failed to generate cover letter"` payload.

### A06 Vulnerable Components

`npm audit` (against runtime + dev deps) found 12 advisories. Non-breaking `npm audit fix` resolved 7:

| Package | Advisory | Severity | Status |
| --- | --- | --- | --- |
| @clerk/nextjs | GHSA-vqx2-fgx2-5wq9 (middleware bypass) | **Critical** | Fixed |
| @clerk/shared, @clerk/clerk-react, @clerk/backend | GHSA-w24r-5266-9c3c (auth bypass when combining org/billing/reverify) | High | Fixed |
| drizzle-orm | GHSA-gpj5-g38j-94v9 (SQLi via identifier escaping) | High | Fixed |
| @xmldom/xmldom | GHSA-2v35-w6hq-6mfw + 3 others (XML injection / DoS) | High | Fixed |
| brace-expansion | GHSA-f886-m6hf-6m8v | Moderate | Fixed |
| picomatch | GHSA-3v7f-55p6-f55p, GHSA-c2c7-rcm5-vvqj | High | Fixed |

**Accepted-risk (require breaking upgrades):**
- `next@14.2.35` — five advisories (GHSA-9g9p-9gw9-jx7f, GHSA-h25m-26qc-wcjf, GHSA-ggv3-7p47-pfv8, GHSA-3x4c-7xq6-9pq8, GHSA-q4gf-8mx6-v5v3). Upgrade path requires Next 16 migration; tracked separately.
- `postcss` (transitive of next) — GHSA-qx2v-qp2m-jg93 (XSS via unescaped `</style>`). Tied to next upgrade.
- `glob`/`minimatch`/`esbuild` (dev-only via eslint-config-next, drizzle-kit) — exploitable only with attacker-controlled patterns / dev-server access, not in production runtime.

### A07 Identification & Authentication

Clerk handles all session lifecycle. Middleware (`src/middleware.ts`) enforces `auth.protect()` for non-public routes when Clerk is configured. CSRF: Clerk session tokens are HttpOnly + same-site by default; the cover-letter, prompts, etc. endpoints are POST/PATCH/DELETE only, so simple `<form>` CSRF is mitigated by content-type checks (JSON bodies).

### A08 Software & Data Integrity

`package-lock.json` is committed and pinned. The only non-trivial install hook is `husky` (`prepare` script), which is well-known and benign. No `postinstall` scripts in untrusted deps.

### A09 Logging

Verified no `console.log` calls expose `password`, `token`, `apiKey`, or `secret` in source. Upload error paths log `error.stack` server-side only and return generic strings to the client.

### A10 SSRF

**Finding A10-1 — HIGH: Two endpoints fetch user-supplied URLs.**
1. `/api/opportunities/scrape` (via `src/lib/opportunities/scrape.ts::fetchOpportunityHtml`) had hostname allowlisting (LinkedIn, Indeed, Greenhouse, Lever, WaterlooWorks) but did not check resolved IPs. An attacker controlling DNS for a domain on the allowlist (or via DNS rebinding) could point at `127.0.0.1`, `169.254.169.254` (AWS metadata), or internal RFC1918 ranges.
2. `/api/import/job` (via `fetchJobFromUrl`) had **no validation at all** beyond `fetch.ok` — any URL pasted by a user was fetched server-side, and the error message was echoed back, enabling SSRF probes.

**Fix.** Added `src/lib/security/ssrf.ts::assertSafeOutboundUrl`. Validates protocol (http/https only), rejects literal loopback / `*.local` / IPv6 link-local hostnames, blocks IPv4 literals in private/reserved CIDRs (10/8, 172.16/12, 192.168/16, 127/8, 169.254/16, 100.64/10, 192.0.2/24, 198.18/15, 224/4 multicast, 240/4 reserved), blocks IPv6 loopback (`::1`), unspecified (`::`), link-local (`fe80::/10`), unique-local (`fc00::/7`), and IPv4-mapped IPv6 (`::ffff:a.b.c.d`) whose embedded IPv4 is private, and DNS-resolves hostnames before final allow.

- Scrape pipeline: hard allowlist (`linkedin.com`, `indeed.com`, `greenhouse.io`, `lever.co`, `waterlooworks.uwaterloo.ca`) **plus** post-resolution IP filter.
- Import pipeline: no host allowlist (users paste arbitrary job URLs) but private/reserved IPs (v4 or v6) are always rejected. Error responses no longer echo upstream messages.

Coverage: `src/lib/security/ssrf.test.ts` (14 tests including IPv4 + IPv6 DNS rebinding) + `src/lib/opportunities/scrape.test.ts::"blocks DNS-rebinding to private IPs even on allowlisted hosts"`.

---

## App-specific concerns

### Resume / PDF uploads (`/api/upload`)

- **Magic-byte validation** is enforced (`validateFileMagicBytes` in `src/lib/constants/documents.ts`). MIME type alone is rejected if bytes don't match.
- **File size cap** at 10 MB (`MAX_FILE_SIZE_BYTES`).
- **MIME allowlist**: `application/pdf`, `text/plain`, DOCX. No `text/html`, no `application/octet-stream`, no executables.
- **On-disk path is server-generated** (`${generateId()}${ext}`). User-supplied filename is sanitized via `sanitizeFilename()` (strips path separators, control chars, HTML tags) before being persisted as the **display** filename only.
- **Encrypted-PDF rejection** with a deterministic 422 response.
- **Empty-extraction rejection** (issue #218 hardening).
- **Dedupe via SHA-256** (`documents.file_hash` UNIQUE INDEX) prevents double-uploads.

**Negative test added** to `src/app/api/upload/route.test.ts`: an `MZ`-header executable with a `.pdf` filename and `application/pdf` MIME is rejected at the magic-byte step with HTTP 400 before it ever reaches the parser. Also added a "disallowed MIME type" test for `text/html` payload.

**No virus scanning** — out of scope for this audit. Files are only ever read by `pdf-parse`/`mammoth` server-side; never executed, never re-served as raw bytes.

### JD scraping / paste — XSS in stored JD content

JD content is stored as text in the `jobs` table. When rendered:
- React auto-escapes interpolated text — no XSS via `<JSX>{text}</JSX>`.
- Two `dangerouslySetInnerHTML` usages exist:
  1. `src/app/(marketing)/page.tsx:29` — `JSON.stringify(jsonLd)` of a hardcoded server-controlled object. Safe.
  2. `src/components/studio/resume-preview.tsx:180` — renders the user's own TipTap-derived HTML in the user's own browser. TipTap sanitizes JSON before serialization, the HTML never contains untrusted third-party content, and even self-XSS would only affect the user's own tab. Low risk; flagged as informational.

### AI prompt injection

User-supplied JD text and resume content reach the LLM. The codebase mitigates by:
- Wrapping user content with explicit role labels in prompts (e.g. `JOB DETAILS: ...`, `CANDIDATE PROFILE: ...`).
- Returning JSON-structured outputs that are parsed via `parseJSONFromLLM`, not auto-applied. The user reviews tailored output before saving.
- Active prompt content is now per-user (see A01-1) so attacker cannot inject by overwriting the system prompt.

No mitigation is perfect; prompt injection remains a known limitation of LLM apps. **Accepted risk** with current scope.

### Multi-user data isolation — re-audited

Every Drizzle query in `src/lib/db/queries/` and every `db.prepare` in legacy modules now scopes by `user_id`. The IDOR in `prompt-variants.ts` (Finding A01-1) was the only gap; fixed with regression tests above.

The activity feed, resume bank, knowledge bank, opportunities tracker, calendar, salary, ATS scans, profile versions, and notifications were all spot-checked — every read path passes the user's id from `requireAuth()` into a `WHERE user_id = ?` query.

### OAuth-pending state

NextAuth is not wired up; Clerk is. The local-dev fallback (`getLocalDevUserId`) is gated on `!isClerkConfigured`. Production deployments must set both Clerk env vars. **Documented as accepted risk for local-only dev.**

---

## Rate limiting

`src/lib/rate-limit.ts` provides a sliding-window in-memory limiter with three presets (`llm`, `standard`, `auth`).

**Finding RL-1 — MEDIUM: `/api/research/company` was unrate-limited.** This is an LLM-backed endpoint (calls `generateCompanyResearch` which talks to the configured LLM). Cost-amplification vector. **Fixed** — added `rateLimiters.llm(getClientIdentifier(...))` with 429 + `Retry-After` response.

**Finding RL-2 — MEDIUM (accepted risk): The limiter is in-memory.** Per the comment at `src/lib/rate-limit.ts:2`, it does not survive restarts and won't work across multiple instances. Move to Redis or platform rate-limiting before scaling beyond a single node. Tracked separately.

---

## Headers / CORS

CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy now applied in middleware (see A05-1 above).

CORS: no `Access-Control-Allow-Origin` is set anywhere. Next.js does not emit it by default. The app is same-origin only; no public API consumed by third-party origins. **No issue.**

---

## What was checked but found clean

- No `eval()`, `new Function()`, or `vm.runIn*` calls.
- No `child_process.exec/spawn` with user input.
- No path traversal: file paths in `/api/upload` are server-generated; filenames are sanitized; `pdf-parse` only opens server-generated absolute paths.
- No raw error stacks returned to clients (after the cover-letter stream fix).
- `package-lock.json` is committed and pinned.
- No hardcoded secrets in source — all sensitive env vars accessed via `process.env` and only on the server.
- `NEXT_PUBLIC_*` is only used for the Clerk publishable key (intentionally public).

---

## Acceptance-criteria checklist

- [x] **Audit report at `docs/security-audit-2026-05-04.md`** — this document.
- [x] **All HIGH and CRITICAL fixed in same PR** — except for `next@14` advisories and dev-only `glob`/`esbuild`, which require breaking upgrades and are accepted-risk.
- [x] **MEDIUM fixed or accepted-risk documented** — `/api/research/company` rate limit added; in-memory limiter scaling-out documented as accepted risk.
- [x] **Multi-user data isolation regression test** — `src/lib/db/prompt-variants.test.ts` "multi-user isolation (IDOR regression test)" describe block (6 tests) using a real in-memory libSQL database.
- [x] **File upload boundary negative test** — `src/app/api/upload/route.test.ts` "rejects an .exe masquerading as a .pdf via magic-byte validation" + "rejects a disallowed MIME type".

---

## Files changed

```
src/lib/db/schema.ts                                         (user_id columns)
src/lib/db/prompt-variants.ts                                (user-scoped fns + runtime ALTER)
src/lib/db/prompt-variants.test.ts                           (real-DB IDOR regression suite)
src/app/api/prompts/route.ts                                 (pass userId)
src/app/api/prompts/[id]/route.ts                            (pass userId)
src/app/api/prompts/results/route.ts                         (pass userId)
src/app/api/tailor/route.ts                                  (pass userId)
src/lib/tailor/generate.ts                                   (require userId)
src/lib/tailor/generate.test.ts                              (fixture updates)
src/app/api/upload/route.test.ts                             (negative magic-byte/MIME tests)
src/middleware.ts                                            (apply security headers)
src/lib/security/headers.ts                                  (NEW)
src/lib/security/headers.test.ts                             (NEW)
src/lib/security/ssrf.ts                                     (NEW)
src/lib/security/ssrf.test.ts                                (NEW)
src/lib/opportunities/scrape.ts                              (SSRF defense + allowlist)
src/lib/opportunities/scrape.test.ts                         (DNS-rebinding test)
src/app/api/import/job/route.ts                              (SSRF guard, generic errors)
src/app/api/opportunities/[id]/cover-letter/stream/route.ts  (no error.message echo)
src/app/api/research/company/route.ts                        (rate limit)
package-lock.json                                            (npm audit fix non-breaking)
```

---

## Out of scope

- Columbus extension (`columbus-extension/`) — has a separate task.
- Refactoring not driven by a finding.
- Performance work.
- Adding new features.
