# Columbus Browser Extension

Browser extension for [Columbus](../README.md) that auto-fills job applications and imports job listings from major job sites.

## Prerequisites

- Columbus main app running locally (`npm run dev` in parent directory)
- Node.js 18+
- Chrome or Firefox browser

## Setup

```bash
cd columbus-extension
npm install
npm run build          # Chrome
npm run build:firefox  # Firefox
```

### Load in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `columbus-extension/dist/` directory
5. Pin the Columbus icon in the toolbar

### Load in Firefox

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on...**
3. Select `columbus-extension/dist-firefox/manifest.json`

## Usage Guide

### 1. Connect to Columbus

The extension needs to authenticate with your Columbus account:

1. Start the Columbus app (`npm run dev` in the parent directory)
2. Click the Columbus extension icon in your toolbar
3. Click **Connect Account**
4. A new tab opens at `/extension/connect` - sign in with Clerk
5. Token is generated and stored automatically
6. The popup now shows your profile info

### 2. Auto-Fill Job Applications

Navigate to any job application form (e.g., on Greenhouse, Lever, LinkedIn):

- **Keyboard shortcut**: `Cmd+Shift+F` (Mac) / `Ctrl+Shift+F` (Windows)
- **Via popup**: Click Columbus icon, then **Fill Form**

The extension detects form fields using multiple signals (name, id, label, placeholder, autocomplete attributes) and maps them to your Columbus profile data.

**Supported field types** (35+): name, email, phone, address, city, state, zip, country, LinkedIn URL, GitHub URL, website, current company, current title, education details, years of experience, work authorization, and more.

### 3. Import Job Listings

When you're on a supported job site:

- **Keyboard shortcut**: `Cmd+Shift+I` (Mac) / `Ctrl+Shift+I` (Windows)
- **Via popup**: Click Columbus icon, then **Import Job**

The job title, company, location, description, requirements, salary, and keywords are scraped and saved to your Columbus tracker.

### 4. Learning System

When you answer custom questions on job applications:

1. The extension detects the question and your typed answer
2. After you move focus away, a prompt asks if you want to save it
3. On future applications with similar questions, your saved answer is suggested
4. Manage saved answers in **Settings** (right-click extension icon > Options)

### 5. Settings

Right-click the Columbus icon > **Options** to configure:

- **Connection**: API URL (default `http://localhost:3000`)
- **Auto-Fill**: Toggle on/off, confidence threshold (0-100%)
- **Learning**: Toggle learning from answers
- **Notifications**: Badge when job detected
- **Saved Answers**: View and delete learned answers

## Supported Job Sites

| Site | Job Scraping | Auto-Fill | Notes |
|------|-------------|-----------|-------|
| LinkedIn | Single + List | Yes | Handles frequent DOM changes |
| Indeed | Single + List | Yes | Search results and detail pages |
| Greenhouse | Single + List | Yes | `boards.greenhouse.io/*` |
| Lever | Single + List | Yes | `jobs.lever.co/*` |
| Waterloo Works | Single + List | Yes | Requires university SSO login |
| Any site with JSON-LD | Single | Yes | Generic fallback scraper |

## Architecture

### Extension Components

```
popup (React)  ──message──>  background (service worker)  ──HTTP──>  Columbus API
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

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/extension/auth` | POST | Generate token (uses Clerk session) |
| `/api/extension/auth` | DELETE | Revoke token(s) |
| `/api/extension/auth/verify` | GET | Validate token |
| `/api/extension/profile` | GET | Fetch profile with computed fields |
| `/api/opportunities/from-extension` | POST | Import single or batch scraped jobs as pending opportunities |
| `/api/extension/learned-answers` | GET | List saved answers |
| `/api/extension/learned-answers` | POST | Save new answer |
| `/api/extension/learned-answers/search` | POST | Similarity search |
| `/api/extension/learned-answers/[id]` | PATCH | Update answer |
| `/api/extension/learned-answers/[id]` | DELETE | Delete answer |

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
3. Connect page authenticates via Clerk, calls `POST /api/extension/auth`
4. Token stored in `localStorage` for extension pickup
5. Extension stores token in `chrome.storage.local`
6. All subsequent API calls include `X-Extension-Token` header
7. Token valid for 30 days

## Development

### Commands

```bash
npm run dev           # Watch mode (Chrome)
npm run build         # Production build (Chrome -> dist/)
npm run build:firefox # Production build (Firefox -> dist-firefox/)
npm run type-check    # TypeScript validation (strict: false)
npm run lint          # ESLint
npm run test          # Vitest
npm run generate-icons # Regenerate placeholder icons
```

### Adding a New Scraper

1. Create `src/content/scrapers/my-scraper.ts` extending `BaseScraper`
2. Implement `canHandle()`, `scrapeJobListing()`, `scrapeJobList()`
3. Register in `src/content/scrapers/scraper-registry.ts`

### Key Files

| File | Purpose |
|------|---------|
| `src/shared/types.ts` | All TypeScript types (35+ field types) |
| `src/shared/field-patterns.ts` | 32 field detection patterns |
| `src/shared/messages.ts` | Type-safe message passing |
| `src/background/api-client.ts` | Columbus API client |
| `src/background/storage.ts` | Chrome storage helpers |
| `src/content/auto-fill/field-detector.ts` | Multi-signal field detection |
| `src/content/auto-fill/field-mapper.ts` | Profile-to-field mapping |
| `src/content/auto-fill/engine.ts` | Form filling engine |
| `src/content/learning/question-detector.ts` | Custom question detection |
| `src/content/learning/answer-capturer.ts` | Answer capture with UI |

## Testing

### Manual Testing Checklist

#### Extension Loading
- [ ] Build completes without errors (`npm run build`)
- [ ] Extension loads in Chrome without errors
- [ ] Extension icon appears in toolbar
- [ ] Popup opens and shows "Connect Account"
- [ ] Options page opens from popup "Settings"

#### Authentication
- [ ] Columbus app running at localhost:3000
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
- [ ] Console shows `[Columbus] Detected fields: N`

#### Job Scraping (test on each supported site)
- [ ] Navigate to a job listing page
- [ ] Popup shows job title and company
- [ ] Click "Import Job" saves to Columbus
- [ ] Imported job appears in Columbus `/jobs` page
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

| Site | Test URL Pattern | What to Verify |
|------|-----------------|----------------|
| LinkedIn | `/jobs/view/12345` | Title, company, location, description extracted |
| Indeed | `/viewjob?jk=abc` | Salary info, job type detected |
| Greenhouse | `boards.greenhouse.io/company/jobs/123` | Structured data parsed |
| Lever | `jobs.lever.co/company/uuid` | Commitment (full-time, etc.) detected |
| Waterloo Works | `waterlooworks.uwaterloo.ca` | Requires SSO auth first |
| Generic | Any site with `JobPosting` JSON-LD | Fallback scraper works |

### Debugging

Open DevTools on any page:
- **Console**: Filter by `[Columbus]` to see extension logs
- **Network**: Filter by `/api/extension/` to see API calls
- **Application > Storage > Extension Storage**: View stored auth/settings
- **Background page**: `chrome://extensions` > Columbus > "service worker" link

## Known Limitations

- **No conflict detection**: Auto-fill overwrites existing field values
- **No retry logic**: API failures are not automatically retried
- **Token delivery**: Connect page uses localStorage fallback (no `externally_connectable` in manifest yet)
- **Waterloo Works**: Only works when logged into university SSO
- **Icons**: Placeholder generated PNGs (replace with designed assets)
- **Bundle size**: popup.js and options.js are ~400KB (React not tree-shaken)
- **No unit tests yet**: Field detector and scrapers untested
