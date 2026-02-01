# Columbus Roadmap

> AI-powered job application assistant - from MVP to production

---

## Current State: MVP Complete ✅

Columbus is a **feature-complete single-user MVP** with:
- Resume parsing, tailoring, and PDF export (4 templates)
- Job tracking with status pipeline
- AI-powered interview prep (voice + text)
- Cover letter generation
- Company research
- Analytics dashboard
- Calendar and reminders
- Email templates
- Multi-provider LLM support (OpenAI, Anthropic, Ollama, OpenRouter)

---

## Phase 1: Foundation (High Priority)

### 1.1 Authentication System
**Status:** Not Started
**Effort:** Large
**Dependencies:** Database migration

- [ ] Add authentication provider (NextAuth.js or Clerk)
- [ ] User registration and login flows
- [ ] Password reset functionality
- [ ] Session management
- [ ] Protected API routes
- [ ] User-specific data isolation

### 1.2 Database Migration
**Status:** Not Started
**Effort:** Medium
**Dependencies:** None

- [ ] Migrate from SQLite to PostgreSQL
- [ ] Set up connection pooling (for serverless)
- [ ] Add proper migrations system (Drizzle or Prisma)
- [ ] Data backup and restore procedures
- [ ] Multi-tenant data isolation

### 1.3 Multi-User Support
**Status:** Not Started
**Effort:** Medium
**Dependencies:** 1.1, 1.2

- [ ] Remove hardcoded 'default' user ID
- [ ] User-scoped database queries
- [ ] Per-user settings and preferences
- [ ] User profile management
- [ ] Data deletion (GDPR compliance)

---

## Phase 2: Integrations (Medium Priority)

### 2.1 Email Service Integration
**Status:** Not Started
**Effort:** Small
**Dependencies:** 1.1

- [ ] Integrate email service (Resend, SendGrid, or Postmark)
- [ ] Send generated email templates directly
- [ ] Email delivery tracking
- [ ] Unsubscribe handling
- [ ] Email verification for new accounts

### 2.2 Calendar Sync
**Status:** Not Started
**Effort:** Medium
**Dependencies:** 1.1

- [ ] Google Calendar OAuth integration
- [ ] Outlook/Microsoft Calendar integration
- [ ] Two-way sync for interviews
- [ ] Automatic event creation from job deadlines
- [ ] Calendar conflict detection

### 2.3 LinkedIn Integration
**Status:** Not Started
**Effort:** Large
**Dependencies:** 1.1

- [ ] LinkedIn OAuth for profile import
- [ ] Import work experience and education
- [ ] Import skills and endorsements
- [ ] Easy Apply integration (if API allows)
- [ ] Profile sync for updates

### 2.4 Job Board Integrations
**Status:** Not Started
**Effort:** Large
**Dependencies:** 1.1

- [ ] Indeed API integration
- [ ] LinkedIn Jobs scraping/API
- [ ] Greenhouse job board integration
- [ ] Lever job board integration
- [ ] Automatic job import from URLs

---

## Phase 3: Enhanced Features (Lower Priority)

### 3.1 Real-Time Notifications
**Status:** Not Started
**Effort:** Medium
**Dependencies:** 1.1

- [ ] WebSocket or Server-Sent Events setup
- [ ] Push notifications for deadlines
- [ ] Browser notification support
- [ ] Mobile push (if mobile app added)
- [ ] Email notification preferences

### 3.2 Interview Recording
**Status:** Not Started
**Effort:** Medium
**Dependencies:** None

- [ ] Video recording during mock interviews
- [ ] Playback and review functionality
- [ ] AI analysis of recorded responses
- [ ] Body language feedback (stretch goal)
- [ ] Storage solution for recordings

### 3.3 Salary Negotiation Tools
**Status:** Not Started
**Effort:** Small
**Dependencies:** None

- [ ] Salary research integration (Glassdoor, Levels.fyi)
- [ ] Negotiation script generator
- [ ] Counter-offer calculator
- [ ] Benefits comparison tool
- [ ] Total compensation analyzer

### 3.4 Networking Features
**Status:** Not Started
**Effort:** Medium
**Dependencies:** 1.1

- [ ] Contact database
- [ ] Networking event tracker
- [ ] Follow-up reminders for contacts
- [ ] Referral tracking
- [ ] LinkedIn connection notes

---

## Phase 4: Scale & Polish

### 4.1 Testing & Quality
**Status:** Partial (~40% coverage)
**Effort:** Medium
**Dependencies:** None

- [ ] Increase unit test coverage to 70%+
- [ ] Add integration tests for API routes
- [ ] E2E tests for critical user flows
- [ ] Performance testing
- [ ] Accessibility audit (WCAG 2.1)

### 4.2 Deployment & Infrastructure
**Status:** Not Started
**Effort:** Medium
**Dependencies:** 1.2

- [ ] Production deployment (Vercel, Railway, or Fly.io)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Environment management (staging, production)
- [ ] Error monitoring (Sentry)
- [ ] Analytics tracking (PostHog, Mixpanel)

### 4.3 Mobile App
**Status:** Not Started
**Effort:** Large
**Dependencies:** 1.1, 1.2

- [ ] React Native or Expo app
- [ ] Core features (job tracking, notifications)
- [ ] Push notifications
- [ ] Offline support
- [ ] App store deployment

### 4.4 Documentation
**Status:** Minimal
**Effort:** Small
**Dependencies:** None

- [ ] API documentation
- [ ] User guide / help center
- [ ] Developer setup guide
- [ ] Architecture documentation
- [ ] Contributing guidelines

---

## Timeline Estimate

| Phase | Duration | Key Milestone |
|-------|----------|---------------|
| Phase 1 | 2-3 weeks | Multi-user production-ready |
| Phase 2 | 3-4 weeks | External integrations live |
| Phase 3 | 2-3 weeks | Enhanced feature set |
| Phase 4 | 2-4 weeks | Polished, scalable product |

**Total: 9-14 weeks** for full production readiness

---

## Quick Wins (Can Do Anytime)

These don't depend on other phases:

1. **Salary tools** - Add negotiation scripts and salary research
2. **More test coverage** - Improve confidence in existing code
3. **Documentation** - Help future contributors
4. **Interview recording** - Enhance existing interview prep
5. **Accessibility audit** - Ensure inclusive design

---

## Tech Stack Recommendations

| Need | Recommendation | Why |
|------|----------------|-----|
| **Auth** | Clerk or NextAuth.js | Easy setup, good DX |
| **Database** | Neon (PostgreSQL) | Serverless, generous free tier |
| **Email** | Resend | Modern API, good deliverability |
| **Hosting** | Vercel | Native Next.js support |
| **Monitoring** | Sentry | Best-in-class error tracking |
| **Analytics** | PostHog | Open source, privacy-focused |

---

## Notes

- Prioritize **Phase 1** before any public launch
- **LinkedIn integration** is complex due to API restrictions
- Consider **Clerk** for auth - handles most of Phase 1.1 out of the box
- **Job board APIs** may require partnerships or scraping (legal gray area)
- Keep **SQLite for local dev**, PostgreSQL for production

---

*Last updated: February 2026*
