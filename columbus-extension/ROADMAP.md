# Columbus Extension Roadmap

## What Was Built

### Phase 1: Extension Scaffolding
- Chrome Manifest V3 extension with webpack build pipeline
- TypeScript config, CSS extraction, HTML templates
- Auto-generated placeholder icons (16/32/48/128px)

### Phase 2: Database & API
- `extension_sessions` table for token auth (30-day expiry, device tracking)
- `learned_answers` table for Q&A storage (normalized questions, usage counting)
- `field_mappings` table for custom site overrides
- 6 API routes under `/api/extension/` with token auth (`X-Extension-Token`)
- Extension connect page at `/extension/connect` (Clerk auth -> token generation)
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
- Job import routed to `/api/extension/jobs` (was hitting Clerk-only `/api/jobs`)
- Batch import endpoint created (was calling nonexistent `/api/extension/scrape/batch`)
- Options page learned answers wired to background API (was stubbed)
- Content CSS bundled via import (was missing from webpack output)
- `GET_LEARNED_ANSWERS` and `DELETE_ANSWER` message types added

---

## Implementation Status

### Fully Working (code-complete, needs browser testing)

| Component | Status | Files |
|-----------|--------|-------|
| Extension build (Chrome) | Code-complete | `dist/` |
| Extension build (Firefox) | Code-complete | `dist-firefox/` |
| Background service worker | Code-complete | `src/background/` |
| Popup UI | Code-complete | `src/popup/` |
| Options UI | Code-complete | `src/options/` |
| Field detection (35+ types) | Code-complete | `src/content/auto-fill/field-detector.ts` |
| Field mapping | Code-complete | `src/content/auto-fill/field-mapper.ts` |
| Auto-fill engine | Code-complete | `src/content/auto-fill/engine.ts` |
| LinkedIn scraper | Code-complete | `src/content/scrapers/linkedin-scraper.ts` |
| Indeed scraper | Code-complete | `src/content/scrapers/indeed-scraper.ts` |
| Greenhouse scraper | Code-complete | `src/content/scrapers/greenhouse-scraper.ts` |
| Lever scraper | Code-complete | `src/content/scrapers/lever-scraper.ts` |
| Waterloo Works scraper | Code-complete | `src/content/scrapers/waterloo-works-scraper.ts` |
| Generic (JSON-LD) scraper | Code-complete | `src/content/scrapers/generic-scraper.ts` |
| Question detector | Code-complete | `src/content/learning/question-detector.ts` |
| Answer capturer | Code-complete | `src/content/learning/answer-capturer.ts` |
| Auth API routes | Code-complete | `src/app/api/extension/auth/` |
| Profile API route | Code-complete | `src/app/api/extension/profile/` |
| Jobs API route | Code-complete | `src/app/api/extension/jobs/` |
| Learned answers API | Code-complete | `src/app/api/extension/learned-answers/` |
| Extension auth library | Code-complete | `src/lib/extension-auth.ts` |
| DB schema (3 tables) | Code-complete | `src/lib/db/schema.ts` |
| Connect page | Code-complete | `src/app/(app)/extension/connect/page.tsx` |

### Not Implemented / Placeholder

| Feature | Status | Details |
|---------|--------|---------|
| `externally_connectable` | Missing | Manifest doesn't declare it; connect page uses localStorage fallback |
| Designed icons | Placeholder | Using generated solid-color PNGs |
| Unit tests | Not started | No test files exist |
| Error retry logic | Not implemented | API failures fail immediately |
| Existing value conflict detection | Not implemented | Auto-fill overwrites all fields |
| Badge notification | Not wired | `notifyOnJobDetected` setting exists but badge never set |
| Workday scraper | Not implemented | URL patterns defined in `field-patterns.ts` but no scraper class |
| Resume file upload | Not implemented | File input detection not supported |
| Profile edit from extension | Not implemented | Extension is read-only for profile |
| Batch scrape UI | Not implemented | No visual job selection for multi-import |

---

## What's Next (Priority Order)

### High Priority (functional gaps)

1. **Browser testing** - Load in Chrome, verify popup/content script/API calls work end-to-end
2. **Design real icons** - Replace placeholder PNGs with branded SVG-based icons
3. **Add `externally_connectable`** - So connect page can send token directly to extension without localStorage
4. **Wire badge notifications** - Set extension badge when job listing detected on current page
5. **Existing value detection** - Skip fields that already have user-entered content

### Medium Priority (robustness)

6. **API error retry** - Exponential backoff for transient failures
7. **Unit tests** - `field-detector.ts` patterns, `calculateSimilarity()`, scraper URL matching
8. **E2E test** - Playwright test loading extension and verifying popup
9. **Bundle size** - Split React out of popup/options bundles, or replace with Preact

### Low Priority (nice to have)

10. **Workday scraper** - Complex iframe-based forms, needs special handling
11. **Taleo scraper** - Legacy ATS system
12. **Resume file upload** - Detect file inputs and auto-attach resume
13. **Application tracking** - Auto-update job status after form submission
14. **Profile sync** - Push edits from extension back to Columbus
