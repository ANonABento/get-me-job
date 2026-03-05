# Get Me Job - AI Agent Instructions

> AI-powered job application assistant built with Next.js 14, TypeScript, and Tailwind CSS.

---

## Project Overview

**Get Me Job** helps job seekers manage their entire application process:
- Resume parsing and AI-powered tailoring
- Job tracking with status pipeline
- Interview prep (voice + text) with AI feedback
- Cover letter generation
- Analytics and progress tracking
- Calendar and reminders
- **Google Integration**: Calendar sync, Drive import/backup, Gmail import/send, Docs/Sheets export, Contacts, Tasks

**Target users:** Early-career professionals seeking jobs

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS + CSS Variables |
| Components | Shadcn/ui patterns (CVA) |
| Database | SQLite (better-sqlite3) |
| LLM | Multi-provider (OpenAI, Anthropic, Ollama, OpenRouter) |
| Icons | Lucide React |
| Testing | Vitest (unit) + Playwright (e2e) |

---

## Project Structure

```
src/
├── app/
│   ├── (app)/              # Authenticated app routes
│   │   ├── dashboard/      # Main dashboard
│   │   ├── upload/         # Resume upload
│   │   ├── profile/        # Profile editor
│   │   ├── documents/      # Document manager
│   │   ├── jobs/           # Job tracker
│   │   ├── interview/      # Interview prep
│   │   ├── calendar/       # Calendar view
│   │   ├── emails/         # Email templates
│   │   ├── analytics/      # Analytics dashboard
│   │   └── settings/       # LLM settings
│   ├── (marketing)/        # Public marketing pages
│   ├── api/                # API routes
│   └── globals.css         # Theme & CSS variables
├── components/
│   ├── ui/                 # Base UI components (Button, Card, etc.)
│   ├── layout/             # Sidebar, navigation
│   └── [feature]/          # Feature-specific components
├── lib/
│   ├── db/                 # Database queries and schema
│   ├── llm/                # LLM client abstraction
│   ├── resume/             # Resume parsing/generation
│   ├── ats/                # ATS score analysis
│   ├── interview/          # Interview prep logic
│   └── utils.ts            # Shared utilities
├── hooks/                  # Custom React hooks
└── types/                  # TypeScript types
```

---

## Navigation Routes

| Route | Purpose |
|-------|---------|
| `/` | Marketing landing page |
| `/dashboard` | Main app dashboard with stats |
| `/upload` | Resume upload and parsing |
| `/profile` | Profile editor (contact, experience, education, skills) |
| `/documents` | Uploaded documents manager |
| `/jobs` | Job tracker with status pipeline |
| `/jobs/research/[id]` | Company research for specific job |
| `/interview` | Interview prep (text/voice modes) |
| `/calendar` | Calendar with interviews and deadlines |
| `/emails` | Email template generator |
| `/analytics` | Progress tracking and metrics |
| `/settings` | LLM provider configuration |

---

## Database Schema

**Location:** `src/lib/db/schema.ts`

Key tables:
- `profile` - User profile data
- `experiences` - Work experience entries
- `education` - Education entries
- `skills` - Skills with categories
- `projects` - Projects with tech stack
- `jobs` - Job descriptions with status
- `generated_resumes` - Tailored resumes per job
- `cover_letters` - Generated cover letters
- `interview_sessions` - Interview practice sessions
- `reminders` - Job application reminders
- `notifications` - User notifications

**Note:** Currently single-user (hardcoded 'default' user ID). Multi-user requires auth implementation.

---

## API Routes

### Profile
- `GET/PUT /api/profile` - Fetch/update profile

### Resume
- `POST /api/parse` - Parse uploaded resume
- `POST /api/upload` - Upload file

### Jobs
- `GET/POST /api/jobs` - List/create jobs
- `GET/PATCH/DELETE /api/jobs/[id]` - Job CRUD
- `POST /api/jobs/[id]/analyze` - Match analysis
- `POST /api/jobs/[id]/generate` - Generate tailored resume
- `POST /api/jobs/[id]/cover-letter` - Generate cover letter

### Interview
- `POST /api/interview/start` - Generate questions
- `POST /api/interview/answer` - Get feedback on answer
- `POST /api/interview/sessions` - Create/list sessions

### Analytics
- `GET /api/analytics` - Overview stats
- `GET /api/analytics/trends` - Time series data
- `GET /api/analytics/export` - Export (CSV/JSON)

---

## Design System

### Theme Colors (CSS Variables)

**Primary:** Teal `hsl(172 66% 45%)` - Main brand color
**Accent:** Blue `hsl(210 90% 50%)` - Secondary emphasis
**Success:** Green `hsl(160 84% 39%)` - Positive states
**Destructive:** Red `hsl(0 72% 51%)` - Errors, delete actions
**Warning:** Orange `hsl(38 92% 50%)` - Warnings

### Dark Mode
- Uses `.dark` class on `<html>`
- All colors defined as CSS variables
- Managed by `ThemeProvider` component

### Gradients
```css
--gradient-primary: linear-gradient(135deg, teal, blue);
```

### Component Patterns

**Buttons** (`src/components/ui/button.tsx`):
```tsx
<Button variant="default">Primary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button size="pill">Pill CTA</Button>
```

**Cards** (`src/components/ui/card.tsx`):
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

---

## Coding Conventions

### TypeScript
- Strict mode enabled
- Use explicit types for function parameters
- Prefer interfaces over types for objects
- Use `type` for unions and primitives

### React
- Functional components only
- Use named exports for components
- Colocate component-specific types
- Use `cn()` utility for conditional classes

### File Naming
- Components: `PascalCase.tsx`
- Utilities: `kebab-case.ts`
- Tests: `*.test.ts` or `*.spec.ts`

### Imports
```tsx
// External
import { useState } from "react";

// Internal absolute
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Relative
import { LocalComponent } from "./local";
```

### CSS
- Use Tailwind utilities first
- CSS variables for theme values
- No inline styles unless dynamic

---

## LLM Integration

**Client:** `src/lib/llm/client.ts`

Supports multiple providers:
- OpenAI (default)
- Anthropic
- Ollama (local)
- OpenRouter

```tsx
import { generateText, generateJSON } from "@/lib/llm/client";

// Text generation
const result = await generateText(prompt, systemPrompt);

// Structured JSON
const data = await generateJSON<MyType>(prompt, schema);
```

**Configuration:** Settings page at `/settings` stores provider config in database.

---

## Testing

### Unit Tests (Vitest)
```bash
npm run test        # Run all
npm run test:watch  # Watch mode
```

**Location:** Colocated with source files as `*.test.ts`

### E2E Tests (Playwright)
```bash
npm run test:e2e    # Run all
npx playwright test --ui  # Interactive mode
```

**Location:** `e2e/` directory

### Test Patterns
```tsx
// Unit test
import { describe, it, expect } from "vitest";

describe("MyFunction", () => {
  it("should do something", () => {
    expect(myFunction()).toBe(expected);
  });
});
```

---

## Common Tasks

### Adding a New Page
1. Create route in `src/app/(app)/[route]/page.tsx`
2. Add to sidebar navigation in `src/components/layout/sidebar.tsx`
3. Create API routes if needed in `src/app/api/`

### Adding a New UI Component
1. Create in `src/components/ui/[component].tsx`
2. Use CVA for variants if needed
3. Export from component file

### Adding Database Table
1. Add schema to `src/lib/db/schema.ts`
2. Create queries file in `src/lib/db/[table].ts`
3. Run app to auto-create table (SQLite)

### Updating Theme Colors
1. Edit CSS variables in `src/app/globals.css`
2. Both `:root` (light) and `.dark` (dark) sections
3. Tailwind picks up changes automatically

---

## Development Commands

```bash
npm run dev         # Start dev server (port 3000)
npm run build       # Production build
npm run lint        # ESLint
npm run type-check  # TypeScript check
npm run test        # Unit tests
npm run test:e2e    # E2E tests
```

---

## Known Limitations

1. **Single-user mode** - Clerk auth installed, multi-user pending Neon DB setup
2. **SQLite database** - Drizzle schema ready for PostgreSQL migration
3. **Local storage** - Data persists in `data/get-me-job.db` file
4. **No email sending** - Templates generated but not sent
5. **No external integrations** - LinkedIn, calendar sync not implemented

See `ROADMAP.md` for planned improvements.

---

## Recent Improvements

- **Security:** ID generation now uses `crypto.randomBytes()` instead of `Math.random()`
- **Type Safety:** Backup schema uses proper Zod types instead of `z.any()`
- **Rate Limiting:** LLM endpoints protected with sliding window rate limiter
- **Path Constants:** All file paths centralized in `PATHS` constant
- **API Utilities:** Shared error response helpers in `src/lib/api-utils.ts`
- **Testing:** All 344 unit tests passing

---

## Environment Variables

Create `.env.local`:
```env
# LLM Providers (at least one required)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
OPENROUTER_API_KEY=sk-or-...

# Optional: Ollama (local)
OLLAMA_BASE_URL=http://localhost:11434
```

---

## Troubleshooting

### "Database locked" error
SQLite WAL mode issue. Restart dev server.

### LLM not responding
Check API key in Settings page or `.env.local`.

### Styles not updating
Clear `.next` cache: `rm -rf .next && npm run dev`

### Type errors after schema change
Restart TypeScript server in VS Code.

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/app/globals.css` | Theme colors and CSS variables |
| `src/lib/db/schema.ts` | Database table definitions |
| `src/lib/llm/client.ts` | LLM provider abstraction |
| `src/lib/constants.ts` | Validation schemas and constants |
| `src/lib/api-utils.ts` | API error response utilities |
| `src/lib/rate-limit.ts` | Rate limiting for API routes |
| `src/components/layout/sidebar.tsx` | Main navigation |
| `src/components/ui/button.tsx` | Button component with variants |
| `tailwind.config.ts` | Tailwind configuration |
| `ROADMAP.md` | Development roadmap |
