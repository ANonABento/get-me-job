# Slothing Browser Extension

Browser extension for Slothing that auto-fills job applications and imports job listings from major job sites.

The extension ships under the Slothing brand. `Slothing` survives as an internal codename in source comments, console-log prefixes (`[Slothing]`), CSS/DOM class names, storage keys, and legacy repo paths; do not reintroduce it into user-facing UI strings.

## Prerequisites

- Slothing main app running locally (`pnpm dev` from the repo root)
- Node.js 18+, pnpm 9+
- Chrome or Firefox browser

## Setup

From the repo root:

```bash
pnpm install
pnpm --filter @slothing/extension build:chrome   # → apps/extension/dist/
pnpm --filter @slothing/extension build:firefox  # → apps/extension/dist-firefox/
```

The build pipeline pulls the spiral mark from `apps/web/public/brand/slothing-mark.png`, removes the connected matte background, renders transparent 16/32/48/128 PNGs via `sharp`, and copies them into `src/assets/icons/`, `dist/icons/`, and `dist-firefox/icons/` automatically. UI surfaces use the same web app brand assets from `apps/web/public/brand/`; webpack copies a transparent `slothing-mark.png` plus a resized `slothing-logo.png` into `dist/brand/` and `dist-firefox/brand/`.

### Load in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select `apps/extension/dist/`
5. Pin the Slothing icon in the toolbar

### Load in Firefox

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on...**
3. Select `apps/extension/dist-firefox/manifest.json`

### Quick demo (no real job site needed)

A self-contained demo launcher boots a fresh Chromium, loads the unpacked extension, and opens a sample job application form with embedded `JobPosting` JSON-LD:

```bash
node apps/extension/demo/launch-with-extension.mjs
```

This launches a clean Chromium profile (`apps/extension/demo/.user-data-dir/`) so you can try auto-fill, the badge notification, and the scraper against a known-good fixture. Press `Ctrl+C` in the terminal to close.

The demo form has 18 form fields (name / contact / address / URLs / current role / years of experience), 4 free-text custom questions, a visa-status select, and a date picker — covers all the major field-detector patterns.

## Usage Guide

### 1. Connect to Slothing

The extension needs to authenticate with your Slothing account:

1. Start the Slothing app (`pnpm dev` from the repo root)
2. Click the Slothing extension icon in your toolbar
3. Click **Connect Account**
4. A new tab opens at `/extension/connect` — sign in with NextAuth (or use the local-dev bypass, see root README)
5. Token is generated and stored automatically
6. The popup now shows your profile info

### 2. Auto-Fill Job Applications

Navigate to any job application form (e.g., on Greenhouse, Lever, LinkedIn):

- **Keyboard shortcut**: `Cmd+Shift+F` (Mac) / `Ctrl+Shift+F` (Windows)
- **Via popup**: Click Slothing icon, then **Fill Form**

The extension detects form fields using multiple signals (name, id, label, placeholder, autocomplete attributes) and maps them to your Slothing profile data.

**Supported field types** (35+): name, email, phone, address, city, state, zip, country, LinkedIn URL, GitHub URL, website, current company, current title, education details, years of experience, work authorization, and more.

### 3. Import Job Listings

When you're on a supported job site:

- **Keyboard shortcut**: `Cmd+Shift+I` (Mac) / `Ctrl+Shift+I` (Windows)
- **Via popup**: Click Slothing icon, then **Import Job**

The job title, company, location, description, requirements, salary, and keywords are scraped and saved to your Slothing tracker.

### 4. Learning System

When you answer custom questions on job applications:

1. The extension detects the question and your typed answer
2. After you move focus away, a prompt asks if you want to save it
3. On future applications with similar questions, your saved answer is suggested
4. Manage saved answers in **Settings** (right-click extension icon > Options)

### 5. WaterlooWorks bulk import

When the active tab is on `waterlooworks.uwaterloo.ca`, the popup shows a **Detected: WaterlooWorks** section with three actions:

- **Import this job** — captures the posting whose side-panel detail view is currently open. Disabled (with a tooltip) until you click into a row.
- **Scrape all visible** — walks every row on the current page, opens each detail panel in turn, scrapes it, and bulk-imports the results to your review queue.
- **Scrape entire filtered set** — same as above, then clicks the Next-page link and repeats until the pagination is exhausted. Hard-capped at 200 jobs.

Bulk scrapes respect whatever filters you've already applied in the WaterlooWorks UI (search, posting type, etc.) — the orchestrator just iterates whatever the table currently shows. Progress is reported back in the popup; rows that fail to render are logged and skipped, never blocking the rest.

### 6. Toolbar badge (job-detected indicator)

When the content script's scraper successfully detects a job listing on the current page, the extension's toolbar icon shows a `!` badge (rust `#b8704a`) with the hover title `Job detected — press Cmd+Shift+I to import`. The badge clears automatically when the tab navigates to a new URL.

The behavior is controlled by the `notifyOnJobDetected` setting (default: enabled). Toggle it from the options page if you find it noisy.

Implementation: content script sends a `JOB_DETECTED` message to the background once per page after the first successful scrape; the background calls the toolbar action API (`chrome.action` on MV3, `browserAction` fallback on Firefox MV2) and tracks per-tab state. Reset on `chrome.tabs.onUpdated` when the URL changes. SPA navigation (URL changes without a full reload) is handled by re-arming the notify-once flag.

### 7. Settings

Right-click the Slothing icon > **Options** to configure:

- **Connection**: API URL (default `http://localhost:3000`)
- **Auto-Fill**: Toggle on/off, confidence threshold (0-100%)
- **Learning**: Toggle learning from answers
- **Notifications**: Badge when job detected (`notifyOnJobDetected`)
- **Saved Answers**: View and delete learned answers

## Supported Job Sites

| Site                  | Job Scraping  | Auto-Fill | Notes                           |
| --------------------- | ------------- | --------- | ------------------------------- |
| LinkedIn              | Single + List | Yes       | Handles frequent DOM changes    |
| Indeed                | Single + List | Yes       | Search results and detail pages |
| Greenhouse            | Single + List | Yes       | `boards.greenhouse.io/*`        |
| Lever                 | Single + List | Yes       | `jobs.lever.co/*`               |
| Waterloo Works        | Single + List | Yes       | Requires university SSO login   |
| Any site with JSON-LD | Single        | Yes       | Generic fallback scraper        |

## Architecture

### Extension Components

```
popup (React)  ──message──>  background (service worker)  ──HTTP──>  Slothing API
                                    ^
content script  ──message──────────┘
(auto-fill, scrapers, learning)
```

- **Background** (`src/background/`): Service worker handling auth, API calls, message routing
- **Content Script** (`src/content/`): Injected into pages for form detection, scraping, learning
- **Popup** (`src/popup/`): React UI for the toolbar popup
- **Options** (`src/options/`): React settings page

### API Endpoints (Main App)

All extension endpoints use token auth via `X-Extension-Token` header:

| Endpoint                                | Method | Purpose                                                      |
| --------------------------------------- | ------ | ------------------------------------------------------------ |
| `/api/extension/auth`                   | POST   | Generate token (uses NextAuth session)                       |
| `/api/extension/auth`                   | DELETE | Revoke token(s)                                              |
| `/api/extension/auth/verify`            | GET    | Validate token                                               |
| `/api/extension/profile`                | GET    | Fetch profile with computed fields                           |
| `/api/opportunities/from-extension`     | POST   | Import single or batch scraped jobs as pending opportunities |
| `/api/extension/learned-answers`        | GET    | List saved answers                                           |
| `/api/extension/learned-answers`        | POST   | Save new answer                                              |
| `/api/extension/learned-answers/search` | POST   | Similarity search                                            |
| `/api/extension/learned-answers/[id]`   | PATCH  | Update answer                                                |
| `/api/extension/learned-answers/[id]`   | DELETE | Delete answer                                                |

#### Opportunity Import Contract

`POST /api/opportunities/from-extension` accepts a single scraped job object or a batch shape:

```json
{
  "jobs": [
    {
      "title": "Frontend Engineer",
      "company": "Acme",
      "location": "Remote",
      "description": "Full job description...",
      "requirements": ["React", "TypeScript"],
      "responsibilities": ["Build product UI"],
      "keywords": ["React"],
      "type": "full-time",
      "remote": true,
      "salary": "$120k-$150k",
      "url": "https://example.com/jobs/frontend",
      "source": "linkedin",
      "sourceJobId": "abc-123",
      "postedAt": "2026-04-29",
      "deadline": "2026-05-15"
    }
  ]
}
```

The app creates each imported job with `status: "pending"`, adds an unread notification for the user, and returns:

```json
{
  "imported": 1,
  "opportunityIds": ["job-123"],
  "pendingCount": 3
}
```

### Authentication Flow

1. User clicks "Connect" in popup
2. Background opens `/extension/connect` in new tab
3. Connect page authenticates via NextAuth, calls `POST /api/extension/auth`
4. Token stored in `localStorage` for extension pickup
5. Extension stores token in `chrome.storage.local`
6. All subsequent API calls include `X-Extension-Token` header
7. Token valid for 30 days

## Development

### Commands

All commands run from the repo root via pnpm filter:

```bash
pnpm --filter @slothing/extension dev            # Watch mode (Chrome)
pnpm --filter @slothing/extension build:chrome   # Production build (Chrome -> dist/)
pnpm --filter @slothing/extension build:firefox  # Production build (Firefox -> dist-firefox/)
pnpm --filter @slothing/extension type-check     # TypeScript validation (strict: false)
pnpm --filter @slothing/extension lint           # tsc --noEmit
pnpm --filter @slothing/extension test:run       # Vitest one-shot
pnpm --filter @slothing/extension generate-icons # Regenerate extension icons
```

### Adding a New Scraper

1. Create `src/content/scrapers/my-scraper.ts` extending `BaseScraper`
2. Implement `canHandle()`, `scrapeJobListing()`, `scrapeJobList()`
3. Register in `src/content/scrapers/scraper-registry.ts`

### Key Files

| File                                        | Purpose                                |
| ------------------------------------------- | -------------------------------------- |
| `src/shared/types.ts`                       | All TypeScript types (35+ field types) |
| `src/shared/field-patterns.ts`              | 32 field detection patterns            |
| `src/shared/messages.ts`                    | Type-safe message passing              |
| `src/background/api-client.ts`              | Slothing API client                    |
| `src/background/storage.ts`                 | Chrome storage helpers                 |
| `src/content/auto-fill/field-detector.ts`   | Multi-signal field detection           |
| `src/content/auto-fill/field-mapper.ts`     | Profile-to-field mapping               |
| `src/content/auto-fill/engine.ts`           | Form filling engine                    |
| `src/content/learning/question-detector.ts` | Custom question detection              |
| `src/content/learning/answer-capturer.ts`   | Answer capture with UI                 |

## Testing

### Automated tests

Unit tests (vitest):

```bash
pnpm --filter @slothing/extension test          # watch mode
pnpm --filter @slothing/extension test:run      # single run
```

Coverage includes the WaterlooWorks scraper (fixture-based) and orchestrator (multi-row + paginated), plus existing badge/sidebar/api-client/tracking modules.

End-to-end tests (Playwright + persistent Chromium with extension loaded):

```bash
pnpm --filter @slothing/extension test:e2e
```

Coverage includes:

- Extension service worker registers (valid 32-char extension ID)
- Popup renders the Slothing heading + Connect Account button (unauthenticated state)
- Options page renders Settings heading + URL input + Save button
- Content script injects on a fixture page without uncaught errors
- LinkedInScraper extracts title / company / location / description from a static fixture (`tests/fixtures/linkedin-mock.html`)
- LinkedIn job-list selectors match two cards in the fixture
- Greenhouse, Lever, Indeed, and Workday fixture scrape coverage with from-extension payload validation
- Workday and Greenhouse multi-step fixture coverage for first-step fill, step-transition re-fill, session persistence, and prompted fallback
- Autofill coverage against `demo/job-form.html`, including sensitive/custom field non-fill assertions and idempotency
- Env-gated Slothing integration coverage for extension scrape/import into `/api/opportunities/from-extension`

Additional fixture snapshots live under `tests/fixtures/`:

- `greenhouse-mock.html`
- `lever-mock.html`
- `indeed-mock.html`
- `workday-mock.html`

The Slothing integration spec is skipped by default. Run it explicitly with:

```bash
SLOTHING_INTEGRATION=1 pnpm --filter @slothing/extension test:e2e -- tests/e2e/slothing-integration.spec.ts
```

CI workflow at `.github/workflows/extension-e2e.yml` runs the e2e suite on every push that touches `apps/extension/`.

### Firefox Release QA

Build and lint the Firefox package before AMO submission:

```bash
pnpm --filter @slothing/extension build:firefox
pnpm dlx web-ext@latest lint -s apps/extension/dist-firefox
pnpm --filter @slothing/extension smoke:firefox
```

`web-ext lint` currently reports 0 errors and 4 warnings. The remaining
`innerHTML` warnings are emitted by React 18's bundled DOM renderer in
`sharedUi.js` and the copy bundled into `content.js`; extension source does not
set untrusted HTML in those paths. The previous source-level WaterlooWorks
bullet-list parser warning was removed by switching to `DOMParser`.

Firefox manifest notes:

- `browser_specific_settings.gecko.data_collection_permissions` declares the
  required data categories for auth, user profile details, and job/application
  page content sent to the Slothing API.
- `strict_min_version` is set to Firefox 142.0 so the data-collection manifest
  key is supported by both desktop Firefox and Firefox for Android validators.
- Toolbar badge calls use `chrome.action` when available and fall back to
  `browserAction` for the Firefox MV2 build.

Automated Firefox smoke (`smoke:firefox`) launches the built Firefox extension
through `web-ext`, drives Firefox headlessly over WebDriver BiDi, verifies the
localStorage connect callback, and covers popup, options, sidebar, autofill,
save-job import, and disconnect against the local demo form. For headed manual
debugging, run:

```bash
pnpm --filter @slothing/extension manual:firefox
```

Pass a URL to open a specific site:

```bash
pnpm --filter @slothing/extension manual:firefox https://waterlooworks.uwaterloo.ca/
```

Use the manual checklist below when a human browser pass is required before AMO
submission:

- [ ] Build Firefox extension (`pnpm --filter @slothing/extension build:firefox`)
- [ ] Open `about:debugging#/runtime/this-firefox`
- [ ] Load `apps/extension/dist-firefox/manifest.json`
- [ ] Start the Slothing web app locally
- [ ] Connect account through the popup
- [ ] Open `apps/extension/demo/job-form.html` through a localhost server
- [ ] Verify popup state, autofill, import, sidebar, options, and disconnect

### Manual Testing Checklist

#### Extension Loading

- [ ] Build completes without errors (`pnpm --filter @slothing/extension build:chrome`)
- [ ] Extension loads in Chrome without errors
- [ ] Extension icon appears in toolbar
- [ ] Popup opens and shows "Connect Account"
- [ ] Options page opens from popup "Settings"

#### Authentication

- [ ] Slothing app running at localhost:3000
- [ ] Click "Connect Account" opens `/extension/connect`
- [ ] Token generated and stored (check `chrome.storage.local`)
- [ ] Popup shows profile info after connecting
- [ ] "Disconnect" clears auth state
- [ ] Reconnecting works after disconnect

#### Auto-Fill (test on each supported site)

- [ ] Navigate to a job application form
- [ ] Popup shows "Application Form Detected" with field count
- [ ] `Cmd+Shift+F` fills detected fields
- [ ] Name, email, phone, LinkedIn, GitHub fields populate correctly
- [ ] Select dropdowns handle partial matching
- [ ] Fields already filled are not overwritten (current behavior: overwrites)
- [ ] Console shows `[Slothing] Detected fields: N`

#### Job Scraping (test on each supported site)

- [ ] Navigate to a job listing page
- [ ] Popup shows job title and company
- [ ] Click "Import Job" saves to Slothing
- [ ] Imported job appears in Slothing `/jobs` page
- [ ] Keywords extracted from description
- [ ] `Cmd+Shift+I` shortcut works

#### Learning System

- [ ] Navigate to a form with custom questions (text areas)
- [ ] Type an answer and tab away
- [ ] Save prompt appears asking to save answer
- [ ] Clicking "Save" stores the answer
- [ ] On next similar question, suggestion appears
- [ ] Options page shows saved answers
- [ ] Delete button removes saved answers

#### Sites to Test

| Site           | Test URL Pattern                        | What to Verify                                  |
| -------------- | --------------------------------------- | ----------------------------------------------- |
| LinkedIn       | `/jobs/view/12345`                      | Title, company, location, description extracted |
| Indeed         | `/viewjob?jk=abc`                       | Salary info, job type detected                  |
| Greenhouse     | `boards.greenhouse.io/company/jobs/123` | Structured data parsed                          |
| Lever          | `jobs.lever.co/company/uuid`            | Commitment (full-time, etc.) detected           |
| Waterloo Works | `waterlooworks.uwaterloo.ca`            | Requires SSO auth first                         |
| Generic        | Any site with `JobPosting` JSON-LD      | Fallback scraper works                          |

Before broad release, run the Workday and Greenhouse live checklist in [`docs/extension-release-followthrough-2026-05.md`](../../docs/extension-release-followthrough-2026-05.md). The automated tests use representative fixtures; live tenants can still vary their selectors and iframe behavior.

### Debugging

Open DevTools on any page:

- **Console**: Filter by `[Slothing]` to see extension logs
- **Network**: Filter by `/api/extension/` to see API calls
- **Application > Storage > Extension Storage**: View stored auth/settings
- **Background page**: `chrome://extensions` > Slothing > "service worker" link

## Known Limitations

- **No conflict detection**: Auto-fill overwrites existing field values
- **No retry logic**: API failures are not automatically retried
- **Token delivery**: Connect page uses localStorage fallback (no `externally_connectable` in manifest yet)
- **Waterloo Works**: Only works when logged into university SSO
- **Bundle size**: popup.js and options.js are ~400KB (React not tree-shaken; could swap to Preact)
- **Workday**: Dedicated Workday scraper is still missing; current coverage pins the GenericScraper JSON-LD fallback.
- **Workday / Greenhouse multi-step**: Application-step support is best-effort until verified on live tenants. The fallback prompt covers missing `webNavigation` events, but tenant-specific selectors may still need patching.
