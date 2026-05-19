# Slothing Extension Roadmap

## What Was Built

### Phase 1: Extension Scaffolding

- Chrome Manifest V3 extension with webpack build pipeline
- TypeScript config, CSS extraction, HTML templates
- Auto-generated transparent spiral-mark icons (16/32/48/128px)

### Phase 2: Database & API

- `extension_sessions` table for token auth (30-day expiry, device tracking)
- `answer_bank` table for Q&A storage (normalized questions, usage counting)
- `field_mappings` table for custom site overrides
- 6 API routes under `/api/extension/` with token auth (`X-Extension-Token`)
- Extension connect page at `/extension/connect` (NextAuth auth -> token generation)
- `src/lib/extension-auth.ts` for token validation and Jaccard similarity

### Phase 3: Auto-Fill Engine

- `field-detector.ts`: Multi-signal detection (name, id, label, placeholder, autocomplete, aria-label) across 35+ field types with confidence scoring
- `field-mapper.ts`: Profile-to-field mapping with computed values (name splitting, location parsing, experience formatting)
- `engine.ts`: Form filling with support for text, textarea, select, checkbox, radio, date inputs; React controlled component compatibility
- `field-patterns.ts`: 32 field patterns with positive/negative regex matches

### Phase 4: Job Scrapers

- Base scraper with shared utilities (requirement extraction, keyword detection, salary parsing, job type/remote detection)
- LinkedIn scraper (multiple DOM selector strategies for frequent changes)
- Indeed scraper (search results + detail pages, salary extraction)
- Greenhouse scraper (boards.greenhouse.io, structured data parsing)
- Lever scraper (commitment detection, UUID-based job IDs)
- Waterloo Works scraper (university co-op portal, table parsing)
- Generic scraper (JSON-LD `JobPosting` schema fallback)
- Scraper registry with URL pattern matching

### Phase 5: Learning System

- `question-detector.ts`: Custom question detection via 80+ patterns (why/what/how/describe)
- `answer-capturer.ts`: Blur/submit monitoring, styled save prompt, auto-dismiss, toast feedback
- API routes for CRUD + similarity search on learned answers

### Phase 6: UI

- Popup: Auth status, profile preview, form/job detection, fill/import actions
- Options: Settings persistence, API URL config, saved answers management
- Content styles: Field highlights, tooltips, suggestion dropdowns, toasts

### Phase 7: Cross-Browser & Polish

- Firefox manifest (MV2 with `browser_specific_settings`)
- Dual build (`dist/` for Chrome, `dist-firefox/` for Firefox)
- `browser-api.ts` wrapper using webextension-polyfill
- README with setup, usage, testing guides

### Bug Fixes

- Job import routed to `/api/extension/jobs` (was hitting NextAuth-only `/api/jobs`)
- Batch import endpoint created (was calling nonexistent `/api/extension/scrape/batch`)
- Options page learned answers wired to background API (was stubbed)
- Content CSS bundled via import (was missing from webpack output)
- `GET_LEARNED_ANSWERS` and `DELETE_ANSWER` message types added

---

## Implementation Status

### Fully Working (code-complete, needs browser testing)

| Component                   | Status        | Files                                            |
| --------------------------- | ------------- | ------------------------------------------------ |
| Extension build (Chrome)    | Code-complete | `dist/`                                          |
| Extension build (Firefox)   | Code-complete | `dist-firefox/`                                  |
| Background service worker   | Code-complete | `src/background/`                                |
| Popup UI                    | Code-complete | `src/popup/`                                     |
| Options UI                  | Code-complete | `src/options/`                                   |
| Field detection (35+ types) | Code-complete | `src/content/auto-fill/field-detector.ts`        |
| Field mapping               | Code-complete | `src/content/auto-fill/field-mapper.ts`          |
| Auto-fill engine            | Code-complete | `src/content/auto-fill/engine.ts`                |
| LinkedIn scraper            | Code-complete | `src/content/scrapers/linkedin-scraper.ts`       |
| Indeed scraper              | Code-complete | `src/content/scrapers/indeed-scraper.ts`         |
| Greenhouse scraper          | Code-complete | `src/content/scrapers/greenhouse-scraper.ts`     |
| Lever scraper               | Code-complete | `src/content/scrapers/lever-scraper.ts`          |
| Waterloo Works scraper      | Code-complete | `src/content/scrapers/waterloo-works-scraper.ts` |
| Generic (JSON-LD) scraper   | Code-complete | `src/content/scrapers/generic-scraper.ts`        |
| Question detector           | Code-complete | `src/content/learning/question-detector.ts`      |
| Answer capturer             | Code-complete | `src/content/learning/answer-capturer.ts`        |
| Auth API routes             | Code-complete | `src/app/api/extension/auth/`                    |
| Profile API route           | Code-complete | `src/app/api/extension/profile/`                 |
| Jobs API route              | Code-complete | `src/app/api/extension/jobs/`                    |
| Learned answers API         | Code-complete | `src/app/api/extension/learned-answers/`         |
| Extension auth library      | Code-complete | `src/lib/extension-auth.ts`                      |
| DB schema (3 tables)        | Code-complete | `src/lib/db/schema.ts`                           |
| Connect page                | Code-complete | `src/app/(app)/extension/connect/page.tsx`       |

### Completed Since This Draft

These items were previously listed as placeholders here, but are now implemented in the codebase.

| Feature                  | Status      | Details                                                                                                                        |
| ------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `externally_connectable` | Implemented | Chrome manifest declares allowed Slothing origins; Firefox still uses the localStorage fallback where needed.                  |
| Unit and E2E tests       | Implemented | Extension unit tests and Playwright scraper/extension specs exist under `apps/extension/src/**` and `apps/extension/tests/**`. |
| Badge notification       | Implemented | Background service worker sets and clears the extension badge on job detection/navigation.                                     |
| Workday scraper          | Implemented | Workday list-page orchestrator and multistep application support are both present.                                             |
| Batch scrape UI          | Implemented | Popup exposes Greenhouse, Lever, and Workday list imports with detected row counts.                                            |
| Inline AI sidebar        | Implemented | Job-page sidebar includes a one-shot AI assistant with seeded prompts and Studio cover-letter deep-link.                       |

### Not Implemented / Placeholder

| Feature                           | Status          | Details                                                                                     |
| --------------------------------- | --------------- | ------------------------------------------------------------------------------------------- |
| Error retry logic                 | Not implemented | API failures fail immediately                                                               |
| Existing value conflict detection | Not implemented | Auto-fill overwrites all fields                                                             |
| Resume file upload                | Not implemented | File input detection not supported                                                          |
| Profile edit from extension       | Not implemented | Extension is read-only for profile                                                          |
| Taleo scraper                     | Not implemented | Legacy ATS system is still a possible future target                                         |
| Store publication                 | Not shipped     | Web app store CTAs are hidden until at least one live marketplace listing URL is configured |
| Marketplace QA                    | Not complete    | Manual browser/store QA is still needed before public listing submission                    |

---

## What's Next (Priority Order)

### High Priority (functional gaps)

1. **Browser testing** - Load in Chrome, verify popup/content script/API calls work end-to-end
2. **Store publication package** - Prepare listing copy, screenshots, privacy disclosures, and zipped builds
3. **Existing value detection** - Skip fields that already have user-entered content unless the user explicitly confirms overwrite
4. **API error retry** - Add exponential backoff for transient failures
5. **Marketplace QA** - Verify install/connect/fill/import flows in Chrome, Edge, and Firefox

### Medium Priority (robustness)

6. **Resume file upload** - Detect file inputs and offer resume attachment
7. **Profile edit from extension** - Decide whether extension remains read-only or supports profile updates
8. **Taleo scraper** - Evaluate whether enough users need Taleo-specific support
9. **Bundle size** - Split React out of popup/options bundles, or replace with Preact

### Low Priority (nice to have)

10. **Application tracking** - Auto-update job status after form submission
11. **Profile sync** - Push edits from extension back to Slothing if profile editing is approved
