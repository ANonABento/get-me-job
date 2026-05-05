# Slothing Roadmap

> AI-powered job application assistant - from MVP to production

---

## Current State: MVP+ Complete ✅

Columbus is a **feature-complete single-user MVP** with enhanced features:

**Core Features:**
- Resume parsing, tailoring, and PDF export (4 templates)
- Job tracking with status pipeline
- AI-powered interview prep (voice + text + audio recording)
- Cover letter generation
- Company research
- Analytics dashboard
- Calendar and reminders
- Email templates
- Multi-provider LLM support (OpenAI, Anthropic, Ollama, OpenRouter)

**Recently Added:**
- Salary negotiation tools (calculator, offer comparison, negotiation scripts)
- Interview audio recording with playback
- Organized sidebar navigation with category groups
- Skip-to-content accessibility
- Comprehensive documentation

---

## Recently Completed ✅

### Salary Negotiation Tools
**Status:** Complete
- [x] Market salary calculator by role, location, experience
- [x] Multi-offer comparison with total comp breakdown
- [x] AI-powered negotiation script generator
- [x] Counter-offer suggestions

### Interview Recording
**Status:** Complete
- [x] Audio recording during voice practice
- [x] Playback and review functionality
- [x] Download recordings

### Testing & Quality
**Status:** Complete (~70% coverage)
- [x] Unit test coverage increased (344 tests passing)
- [x] Database layer tests
- [x] Business logic tests
- [x] Utility function tests

### Accessibility (WCAG 2.1)
**Status:** Complete
- [x] Skip-to-content link
- [x] Proper ARIA labels on navigation
- [x] Semantic landmarks (main, nav)
- [x] Keyboard navigation support

### Documentation
**Status:** Complete
- [x] API documentation (`docs/API.md`)
- [x] User guide (`docs/USER_GUIDE.md`)
- [x] Developer setup guide (`docs/DEVELOPER.md`)
- [x] Architecture documentation (`docs/architecture.md`)

---

## Phase 1: Foundation (High Priority)

### 1.1 Authentication System
**Status:** In Progress (80% Complete)
**Effort:** Large
**Stack:** Clerk

- [x] Add Clerk authentication provider
- [x] User registration and login flows (sign-in/sign-up pages)
- [x] Session management (ClerkProvider + middleware)
- [x] Protected API routes (middleware + route guards)
- [x] UserButton in sidebar for profile/logout
- [ ] Password reset functionality (handled by Clerk hosted pages)
- [ ] User-specific data isolation (pending Neon setup)

### 1.2 Database Migration
**Status:** In Progress (70% Complete)
**Effort:** Medium
**Stack:** Neon PostgreSQL + Drizzle ORM

- [x] Drizzle schema created with all tables
- [x] userId column added to all tables
- [x] Drizzle query functions created (async, userId param)
- [x] Database connection module ready
- [x] Drizzle config for migrations
- [ ] Create Neon database (requires account setup)
- [ ] Run initial migrations
- [ ] Data migration script from SQLite

### 1.3 Multi-User Support
**Status:** In Progress (60% Complete)
**Effort:** Medium
**Dependencies:** 1.1, 1.2

- [x] New query layer accepts userId parameter
- [x] Schema supports multi-tenant data
- [ ] Switch API routes to Drizzle queries (pending Neon)
- [ ] Per-user settings and preferences
- [ ] User profile sync with Clerk
- [ ] Data deletion (GDPR compliance)

---

## Phase 2: Google Workspace Integration (High Priority)

> **Full documentation:** [docs/google-integration/](./docs/google-integration/)

### 2.1 OAuth Foundation
**Status:** Not Started
**Effort:** Medium (3-5 days)
**Dependencies:** 1.1 (Clerk Auth)
**Ticket:** [01-oauth-foundation.md](./docs/google-integration/01-oauth-foundation.md)

- [ ] Enable Google OAuth in Clerk Dashboard
- [ ] Configure OAuth scopes (Calendar, Drive, Gmail)
- [ ] Create token retrieval utility
- [ ] Build "Connect Google" UI in Settings
- [ ] Handle token refresh via Clerk

### 2.2 Calendar Sync
**Status:** Not Started
**Effort:** Medium (4-6 days)
**Dependencies:** 2.1
**Ticket:** [02-calendar-sync.md](./docs/google-integration/02-calendar-sync.md)

- [ ] Push interviews to Google Calendar
- [ ] Push deadlines to Google Calendar
- [ ] Push reminders to Google Calendar
- [ ] Pull events to detect existing interviews
- [ ] Smart reminders (1 day, 1 hour before)

### 2.3 Drive Integration
**Status:** Not Started
**Effort:** Medium (4-5 days)
**Dependencies:** 2.1
**Ticket:** [03-drive-integration.md](./docs/google-integration/03-drive-integration.md)

- [ ] Create "Slothing" folder structure
- [ ] Upload resumes to Drive
- [ ] Upload cover letters to Drive
- [ ] Generate shareable links
- [ ] Import resumes from Drive

### 2.4 Gmail Integration
**Status:** Not Started
**Effort:** Large (6-8 days)
**Dependencies:** 2.1
**Ticket:** [04-gmail-integration.md](./docs/google-integration/04-gmail-integration.md)

- [ ] Scan inbox for recruiter emails
- [ ] Parse emails to extract job details
- [ ] Auto-create job entries from emails
- [ ] Detect interview invitations
- [ ] Send follow-up emails from app

### 2.5 Docs & Sheets
**Status:** Not Started
**Effort:** Small (2-3 days)
**Dependencies:** 2.3
**Ticket:** [05-docs-sheets.md](./docs/google-integration/05-docs-sheets.md)

- [ ] Export resumes to Google Docs
- [ ] Create interview prep notes in Docs
- [ ] Export job tracker to Sheets
- [ ] Create salary comparison spreadsheets

### 2.6 Contacts & Tasks
**Status:** Not Started
**Effort:** Small (2-3 days)
**Dependencies:** 2.1
**Ticket:** [06-contacts-tasks.md](./docs/google-integration/06-contacts-tasks.md)

- [ ] Import contacts for networking
- [ ] Save recruiters to Google Contacts
- [ ] Sync reminders to Google Tasks
- [ ] Auto-create follow-up tasks

---

## Phase 3: Other Integrations (Medium Priority)

### 3.1 Email Service Integration
**Status:** Not Started
**Effort:** Small
**Dependencies:** 1.1

- [ ] Integrate email service (Resend, SendGrid, or Postmark)
- [ ] Send generated email templates directly
- [ ] Email delivery tracking
- [ ] Unsubscribe handling
- [ ] Email verification for new accounts

### 3.2 LinkedIn Integration
**Status:** Not Started
**Effort:** Large
**Dependencies:** 1.1

- [ ] LinkedIn OAuth for profile import
- [ ] Import work experience and education
- [ ] Import skills and endorsements
- [ ] Easy Apply integration (if API allows)
- [ ] Profile sync for updates

### 3.3 Job Board Integrations
**Status:** Not Started
**Effort:** Large
**Dependencies:** 1.1

- [ ] Indeed API integration
- [ ] LinkedIn Jobs scraping/API
- [ ] Greenhouse job board integration
- [ ] Lever job board integration
- [ ] Automatic job import from URLs

---

## Phase 4: Enhanced Features (Lower Priority)

### 4.1 Real-Time Notifications
**Status:** Not Started
**Effort:** Medium
**Dependencies:** 1.1

- [ ] WebSocket or Server-Sent Events setup
- [ ] Push notifications for deadlines
- [ ] Browser notification support
- [ ] Mobile push (if mobile app added)
- [ ] Email notification preferences

### 4.2 Advanced Interview Recording
**Status:** Partial (audio done, video pending)
**Effort:** Medium
**Dependencies:** None

- [x] Audio recording during mock interviews
- [x] Playback and review functionality
- [ ] Video recording
- [ ] AI analysis of recorded responses
- [ ] Body language feedback (stretch goal)
- [ ] Cloud storage solution for recordings

### 4.3 Networking Features
**Status:** Not Started
**Effort:** Medium
**Dependencies:** 1.1

- [ ] Contact database
- [ ] Networking event tracker
- [ ] Follow-up reminders for contacts
- [ ] Referral tracking
- [ ] LinkedIn connection notes

### 4.4 External Salary Data
**Status:** Not Started
**Effort:** Medium
**Dependencies:** None

- [ ] Levels.fyi API integration
- [ ] Glassdoor data integration
- [ ] Real-time market data
- [ ] Company-specific comp data

---

## Phase 5: Scale & Polish

### 5.1 Deployment & Infrastructure
**Status:** Not Started
**Effort:** Medium
**Dependencies:** 1.2

- [ ] Production deployment (Vercel, Railway, or Fly.io)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Environment management (staging, production)
- [ ] Error monitoring (Sentry)
- [ ] Analytics tracking (PostHog, Mixpanel)

### 5.2 Mobile App
**Status:** Not Started
**Effort:** Large
**Dependencies:** 1.1, 1.2

- [ ] React Native or Expo app
- [ ] Core features (job tracking, notifications)
- [ ] Push notifications
- [ ] Offline support
- [ ] App store deployment

### 5.3 Performance & SEO
**Status:** Not Started
**Effort:** Small
**Dependencies:** None

- [ ] Image optimization
- [ ] Core Web Vitals audit
- [ ] SEO meta tags
- [ ] Sitemap generation
- [ ] Social sharing cards

---

## Timeline Estimate

| Phase | Duration | Key Milestone |
|-------|----------|---------------|
| Phase 1 | 2-3 weeks | Multi-user production-ready |
| Phase 2 | 3-4 weeks | Google Workspace integration |
| Phase 3 | 2-3 weeks | Other integrations (LinkedIn, Email) |
| Phase 4 | 2-3 weeks | Enhanced feature set |
| Phase 5 | 2-4 weeks | Polished, scalable product |

**Total: 11-17 weeks** for full production readiness

---

## Quick Wins Remaining

These don't depend on other phases:

1. **Video recording** - Extend audio recording to video
2. **External salary data** - Integrate real market data
3. **Performance audit** - Optimize for Core Web Vitals
4. **E2E test coverage** - Add Playwright tests for critical flows

---

## Tech Stack (Implemented)

| Layer | Technology | Status |
|-------|------------|--------|
| **Auth** | Clerk | ✅ Installed |
| **Database** | Neon (PostgreSQL) + Drizzle | ✅ Schema ready |
| **Google APIs** | googleapis npm | Planned |
| **Email** | Resend | Planned |
| **Hosting** | Vercel | Planned |
| **Monitoring** | Sentry | Planned |
| **Analytics** | PostHog | Planned |

---

## Next Steps

1. **Create Neon Account** - Set up PostgreSQL database at https://console.neon.tech
2. **Add DATABASE_URL** - Configure connection string in `.env.local`
3. **Run Migrations** - Execute `npm run db:push` to create tables
4. **Test Auth Flow** - Sign up, sign in, verify data isolation
5. **Deploy to Vercel** - Connect repo and deploy

---

## Notes

- Prioritize **Phase 1** before any public launch
- **LinkedIn integration** is complex due to API restrictions
- **Clerk** is installed and configured - handles auth flows
- **Drizzle schema** is ready - just needs Neon database connection
- **Job board APIs** may require partnerships or scraping (legal gray area)
- Keep **SQLite for local dev**, PostgreSQL for production
- Documentation is complete in `docs/` directory

---

*Last updated: March 2026*
