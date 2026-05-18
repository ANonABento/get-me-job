# Slothing Roadmap

> AI-powered job application assistant - from MVP to production

---

## Current State: Product MVP+ Complete

Slothing is a feature-complete job-search workspace for local/self-hosted use, with production-facing infrastructure partially implemented and a few public-launch gaps still visible.

**Core product:**

- Resume parsing, component bank, Studio editing, manual tailoring, AI tailoring, PDF/DOCX/LaTeX/plain-text export, and 7-day share links.
- Opportunity tracking with review queue, status pipeline, company research, calendar/reminder surfaces, analytics, and dashboard summaries.
- ATS scanner, cover-letter generation, email templates, interview prep with text/voice/audio recording, and salary tools.
- Multi-provider LLM support through OpenAI, Anthropic, Ollama, and OpenRouter.

**Extension and agent surfaces:**

- Browser extension for Chrome/Firefox builds, form autofill, answer-bank capture/search, job-page sidebar, inline AI assistant, badge notifications, multistep Workday/Greenhouse support, and bulk Greenhouse/Lever/Workday scraping.
- Job scrapers for LinkedIn, Indeed, Greenhouse, Lever, Waterloo Works, Workday list pages, and generic JSON-LD job postings.
- `@slothing/mcp` v1 shipped as a local MCP server with profile, opportunity, opportunity-detail, answer-bank search, and save-answer tools.

**Integrations:**

- Google OAuth/token refresh code exists and gates Settings UI when auth is not configured.
- Google Calendar, Drive, Gmail, Docs, Sheets, and Contacts API routes/components exist, but remain environment- and account-setup gated.
- Daily digest, Gmail status detection, Google calendar sync, cleanup, email retry, follow-up, and reminder crons are implemented; weekly digest is intentionally disabled until a distinct weekly email exists.

---

## Open Gaps From Audit

These are the current visible placeholders, planned-but-unshipped specs, or stale roadmap items that still need product decisions.

| Area                         | Status          | Gap                                                                                                                                                                 |
| ---------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Extension store launch       | Setup-gated     | Store CTAs are hidden until at least one live marketplace URL is configured; Safari support is still planned.                                                       |
| Google setup UX              | Setup-gated     | Google integration works only when NextAuth/Google OAuth are configured; disabled states now explain the required OAuth/NextAuth setup.                             |
| Toolkit tabs                 | Cleaned up      | `/toolkit?tab=cover-letter` redirects into Studio cover-letter mode; Recruiter Rewriter is hidden until the workflow ships.                                         |
| Studio tailor settings       | Wired           | ATS strictness now shapes AI prompt guidance and deterministic manual/fallback formatting.                                                                          |
| Dashboard interview rail     | Cleaned up      | The interview rail shows real opportunity status instead of placeholder timing.                                                                                     |
| Advanced onboarding          | Added           | Advanced steps now point to cover letters, interview prep, salary research, Studio templates, and calendar surfaces.                                                |
| Cron jobs                    | Operationalized | Configured cron routes now do real work; weekly digest is disabled and removed from the deployed schedule until a distinct weekly email ships.                      |
| Custom template uploads      | Shipped         | HTML/Markdown/DOCX/PDF template import, Studio picker integration, metadata editing, delete, and fallback behavior are wired.                                       |
| Component preview follow-ups | Partial         | Drive DOCX import and durable TXT/DOCX text previews are wired; preview editing, multi-page drag-select, and image-only PDF OCR remain follow-ups.                  |
| MCP v2 write tools           | Shipped         | Agent-facing push-job, update-status, and scrape-url tools are exposed through `@slothing/mcp` over extension-token routes.                                         |
| Pricing waitlist             | Implemented     | Pricing now includes a real waitlist form backed by `/api/waitlist` and persisted waitlist entries.                                                                 |
| Production platform          | Partial         | Turso production DB setup and hosted migration execution remain account-bound; migration, backup/restore, and deployment runbooks are documented.                  |

---

## Recently Completed

### Studio V3 Actions

**Status:** Complete

- [x] Manual tailor wired to deterministic assembly from selected entries.
- [x] Tailor settings dialog wired and persisted.
- [x] PDF and DOCX export.
- [x] LaTeX export endpoint and client download.
- [x] Plain-text export.
- [x] Copy HTML.
- [x] Share link creation and clipboard copy.

### Extension Roadmap Carryover

**Status:** Complete or code-complete

- [x] `externally_connectable` added to Chrome manifest.
- [x] Badge notifications wired through background service worker.
- [x] Workday scraper/orchestrator implemented.
- [x] Bulk Greenhouse/Lever/Workday scrape UI implemented in popup.
- [x] Inline AI assistant implemented in job-page sidebar.
- [x] Unit and Playwright scraper coverage added.

### MCP V1

**Status:** Shipped

- [x] Local stdio MCP server package.
- [x] `get_profile`.
- [x] `list_opportunities`.
- [x] `get_opportunity_detail`.
- [x] `search_answer_bank`.
- [x] `save_answer`.

### Google Integration Foundation

**Status:** Code-complete, setup-gated

- [x] Google OAuth token lookup and refresh.
- [x] Settings connection UI.
- [x] Calendar event create/list/sync APIs.
- [x] Drive upload/list/import APIs.
- [x] Gmail scan/send APIs.
- [x] Docs create/export support.
- [x] Sheets export support.
- [x] Contacts list/search/create support.

---

## Next Phase Plan: Launch Readiness

### P0 - Remove Public Placeholders

**Goal:** No user-facing "coming soon" affordance should appear on a primary route unless it is behind an intentional launch gate.

- [x] Publish or hide extension store CTAs until at least one listing is live.
- [x] Replace `/toolkit?tab=cover-letter` placeholder with a redirect/deep link into Studio's cover-letter workflow.
- [x] Ship Recruiter Rewriter or remove the tab until the workflow is ready.
- [x] Replace dashboard interview `coming soon` copy with real interview date/status data or hide the line.
- [x] Wire ATS strictness into manual/AI tailor generation, or remove the control from the dialog.
- [x] Add advanced onboarding steps using already-shipped product surfaces.

### P1 - Operationalize Background Work

**Goal:** Every configured cron route should do real work or be removed from deployment config.

- [x] Implement cleanup cron for expired shares, stale sessions, and old transient records.
- [x] Implement weekly digest or remove the route until a weekly product email exists.
- [x] Implement email retry cron for failed Gmail/app email sends, or collapse it into the existing send flow.
- [x] Add cron run logging and a small admin/status view.

### P2 - Public Launch Conversion

**Goal:** Make the public site and hosted app credible before store launch.

- [x] Replace pricing email CTA with a waitlist form and `/api/waitlist`.
- [x] Add extension launch-state feature flag for marketing/onboarding.
- [x] Verify Google disabled states explain setup rather than implying missing implementation.
- [x] Add production-safe user data deletion flow.
- [x] Add Sentry or equivalent error monitoring.
- [x] Add lightweight product analytics for activation funnels.

### P3 - Template And Preview Follow-Through

**Goal:** Finish the planned document-management workflows after launch blockers are closed.

- [x] Implement custom template upload/import for HTML, Markdown, and DOCX.
- [x] Add custom template management: rename, delete, and fallback behavior.
- [x] Add rich custom template metadata editing.
- [x] Add Drive/plain-text imports to component preview.
- [x] Add durable text preview storage for non-PDF parsed previews.
- [x] Explore OCR for image-only PDFs after extractable-PDF paths are stable.

### P4 - Agent Write Surface

**Goal:** Promote proven REST workflows into discoverable MCP tools.

- [x] Add `slothing_push_job`.
- [x] Add `slothing_update_status`.
- [x] Add `slothing_scrape_url`.
- [x] Keep MCP v2 as a thin adapter over extension-token routes.

---

## Production Foundation

### Authentication And Data Isolation

**Status:** Partial

- [x] NextAuth provider and session plumbing.
- [x] Protected pages and guarded API routes.
- [x] User ID columns and query-layer support.
- [x] Password reset or documented magic-link-only auth policy.
- [x] Audit remaining local/raw DB calls for user scoping.
- [x] Data deletion and export for GDPR-style account closure.

### Database And Deployment

**Status:** Partial

- [x] Drizzle schema and migrations.
- [x] Local libSQL development flow.
- [x] Executable production readiness preflight.
- [ ] Create production Turso/libSQL database.
- [ ] Run production migrations.
- [x] Document SQLite-to-Turso migration.
- [ ] Verify backup/restore plan.
- [ ] Deploy hosted app with production environment checklist.

### Monitoring And Analytics

**Status:** Partial

- [x] Error monitoring.
- [x] Cron monitoring.
- [x] Product activation analytics.
- [x] Core Web Vitals tracking.

---

## Later Bets

These are valuable, but should wait until launch placeholders and production foundations are clean.

- Video interview recording and AI analysis of recorded responses.
- External salary data from Levels.fyi, Glassdoor, or other providers.
- LinkedIn OAuth/profile import, subject to API and policy constraints.
- Networking CRM: contact database, referral tracking, event tracking, and LinkedIn notes.
- Mobile app.
- MCP package publication after v1/v2 tool surface is validated.

---

## Tech Stack

| Layer             | Technology                                      | Status                                                   |
| ----------------- | ----------------------------------------------- | -------------------------------------------------------- |
| Auth              | NextAuth                                        | Implemented, env-gated, passwordless policy documented   |
| Database          | libSQL/Turso + Drizzle                          | Local/schema ready, production runbook documented        |
| LLM               | OpenAI, Anthropic, Ollama, OpenRouter           | Implemented                                              |
| Google APIs       | `googleapis`                                    | Implemented, OAuth setup-gated                           |
| Browser extension | Chrome MV3, Firefox build                       | Code-complete, store listings pending                    |
| MCP               | `@modelcontextprotocol/sdk`                     | v1 shipped                                               |
| Billing           | Stripe cloud carve-out                          | Present under `apps/web/src/cloud`, hosted setup pending |
| Email             | Gmail integration plus app email plans          | Partial                                                  |
| Monitoring        | Sentry-compatible hook, cron health, Web Vitals | Implemented                                              |
| Analytics         | Lightweight activation events                   | Implemented                                              |

---

## Notes

- Treat old "Not Started" Google roadmap docs as historical unless they contradict the code; the current blocker is setup, polish, and launch gating.
- Keep local libSQL for local dev and Turso/libSQL for production.
- Job board APIs may require partnerships or scraping policy review; extension-owned scraping is already implemented for the primary targets.
- Prioritize removing visible placeholders before adding new feature surfaces.

---

_Last updated: May 18, 2026_
