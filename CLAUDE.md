# Get Me Job - AI Agent Instructions

> AI-powered job application assistant built with Next.js 14, TypeScript, and Tailwind CSS.

---

## Project Overview

**Get Me Job** helps job seekers manage their entire application process:
- Resume parsing and AI-powered tailoring
- Unified Document Studio for resumes and cover letters
- Job tracking with status pipeline
- Interview prep (voice + text) with AI feedback
- Cover letter drafting and editing
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
│   │   ├── studio/         # Unified resume and cover letter builder
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
│   ├── studio/             # Document Studio preview/editor components
│   ├── builder/            # Reusable Studio section controls
│   └── [feature]/          # Feature-specific components
├── lib/
│   ├── db/                 # Database queries and schema
│   ├── llm/                # LLM client abstraction
│   ├── builder/            # Studio state, export, and version history helpers
│   ├── editor/             # TipTap JSON, rendering, and HTML conversion
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
| `/studio` | Document Studio for resume and cover letter files |
| `/jobs` | Job tracker with status pipeline |
| `/jobs/research/[id]` | Company research for specific job |
| `/interview` | Interview prep (text/voice modes) |
| `/calendar` | Calendar with interviews and deadlines |
| `/emails` | Email template generator |
| `/analytics` | Progress tracking and metrics |
| `/settings` | LLM provider configuration |

---

## Document Studio Architecture

`/studio` is the only in-app workspace for building application documents. Legacy `/builder`, `/tailor`, and `/cover-letter` pages redirect there, so resume and cover letter creation share one header, file panel, document canvas, and AI assistant area.

```
src/app/(app)/studio/page.tsx
├── Header
│   ├── Resume / Cover Letter mode tabs
│   ├── Template picker
│   ├── Saved indicator
│   └── Copy HTML / Download PDF actions
├── Left panel
│   ├── Files for the active document type
│   ├── Version History
│   └── Knowledge bank sections and entry picker
├── Center panel
│   └── Document preview/editor
└── Right panel
    └── AI Assistant
```

### Studio Files

Studio files are represented by `StudioDocument` state in `src/app/(app)/studio/page.tsx`:
- `id` - Document identity
- `name` - User-visible file name
- `mode` - `resume` or `cover_letter`
- `templateId` - Selected visual template
- `selectedEntryIds` - Knowledge bank entries used in the draft
- `sections` - Resume section order and visibility

The file panel filters files by the active Resume/Cover Letter tab, so each document type has its own file list while staying inside `/studio`.

### Version History

Resume draft snapshots use helpers in `src/lib/builder/version-history.ts`.
Version state is normalized before comparison or persistence, supports manual and automatic snapshot metadata, is capped at `MAX_BUILDER_VERSIONS`, and is stored in browser storage with keys formatted as `taida:builder:versions:<document-id>`.

### TipTap Editor Integration

TipTap document JSON is the editor data contract. Bank entries are converted through `src/lib/editor/bank-to-tiptap.ts`, rendered by `src/lib/editor/resume-editor.tsx`, and exported through `src/lib/editor/document-html.ts`. The Studio preview shell lives in `src/components/studio/resume-preview.tsx`.

### AI Panel

The right-hand Studio panel is reserved for contextual AI assistance. Keep AI document actions scoped to the active Studio file and document mode so resume and cover letter workflows remain part of the same route.

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
- `POST /api/builder` - Generate Studio resume preview HTML from selected bank entries

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

### Document Studio
- `POST /api/tailor` - Analyze a job description and generate a tailored resume from the knowledge bank
- `POST /api/tailor/autofix` - Rewrite highlighted resume gaps
- `POST /api/cover-letter/generate` - Generate or revise cover letter content

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

### Updating Document Studio
1. Keep resume and cover letter document-building UX under `src/app/(app)/studio/page.tsx`
2. Put reusable Studio UI in `src/components/studio/` or `src/components/builder/`
3. Put document state, export, version history, and TipTap conversion helpers in `src/lib/builder/` or `src/lib/editor/`
4. Update colocated unit tests for any changed helper functions or Studio behavior

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

1. **Single-user mode** - Clerk auth installed, multi-user persistence still pending
2. **SQLite database** - Drizzle schema ready for PostgreSQL migration
3. **Local storage** - Data persists in `data/get-me-job.db` file
4. **No email sending** - Templates generated but not sent
5. **Partial external integrations** - Google integration exists; LinkedIn and other providers are not implemented

See `ROADMAP.md` for planned improvements.

---

## Recent Improvements

- **Security:** ID generation now uses `crypto.randomBytes()` instead of `Math.random()`
- **Type Safety:** Backup schema uses proper Zod types instead of `z.any()`
- **Rate Limiting:** LLM endpoints protected with sliding window rate limiter
- **Path Constants:** All file paths centralized in `PATHS` constant
- **API Utilities:** Shared error response helpers in `src/lib/api-utils.ts`
- **Document Studio:** Resume and cover letter document workflows consolidated under `/studio`
- **Testing:** Unit tests cover Studio redirects/routing, editor conversion, document export, and version history helpers

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
| `src/app/(app)/studio/page.tsx` | Unified Document Studio route |
| `src/components/studio/resume-preview.tsx` | Studio document canvas and TipTap preview shell |
| `src/lib/builder/version-history.ts` | Studio version snapshot helpers |
| `src/lib/builder/document-export.ts` | Studio print/PDF export helpers |
| `src/lib/editor/bank-to-tiptap.ts` | Knowledge bank to TipTap document conversion |
| `src/lib/editor/resume-editor.tsx` | TipTap resume editor integration |
| `src/lib/constants.ts` | Validation schemas and constants |
| `src/lib/api-utils.ts` | API error response utilities |
| `src/lib/rate-limit.ts` | Rate limiting for API routes |
| `src/components/layout/sidebar.tsx` | Main navigation |
| `src/components/ui/button.tsx` | Button component with variants |
| `tailwind.config.ts` | Tailwind configuration |
| `ROADMAP.md` | Development roadmap |
