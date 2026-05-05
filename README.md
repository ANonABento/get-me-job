# Slothing — Job Application Assistant

> You're not lazy. Your job search system is.

Your personal job application command center. Upload your career documents, build tailored resumes and cover letters in one workspace, match with jobs, and prepare for interviews. Slothing does the work for you.

The app code lives in the `get-me-job` repo and `slothing` npm package. Domain: [slothing.work](https://slothing.work).

## Features

- **Knowledge Bank**: Upload resumes, cover letters, and career documents, then extract structured profile data using AI
- **Document Studio**: Build resumes and cover letters from a single `/studio` workspace
- **Studio Files**: Create, select, rename, and delete resume or cover letter files from the Studio file panel
- **Resume/Cover Letter Tabs**: Switch between document types without leaving the Studio
- **Version History**: Track capped resume draft snapshots through Studio version history helpers
- **TipTap Editor Integration**: Convert bank entries into TipTap document JSON for the Studio preview/editor shell
- **AI Panel**: Reserve contextual AI tools in the Studio alongside the document canvas
- **Profile Management**: Edit and manage your professional information
- **Job Matching**: Paste job descriptions and get match scores
- **Interview Prep**: Practice with AI-powered mock interviews (text and voice)

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database**: SQLite with Drizzle schema management
- **AI**: Supports Ollama (free/local) or BYOK (OpenAI, Anthropic, OpenRouter)
- **Document Parsing**: pdf-parse, mammoth, OCR utilities
- **Rich Text Editing**: TipTap
- **UI**: Tailwind CSS + shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- (Optional) Ollama for free local AI

### Installation

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Setting up AI

#### Option 1: Ollama (Free, Local)

1. Install Ollama from [ollama.ai](https://ollama.ai)
2. Pull a model: `ollama pull llama3.2`
3. Go to Settings in Slothing and select "Ollama"
4. Test connection

#### Option 2: Bring Your Own Key

1. Go to Settings
2. Select your provider (OpenAI, Anthropic, OpenRouter)
3. Enter your API key
4. Test connection

### Google Integration (Optional)

Connect your Google account to enable:
- **Calendar Sync**: Sync interview schedules with Google Calendar
- **Drive Integration**: Import resumes from Drive, back up documents
- **Gmail**: Import job emails, send emails directly
- **Docs/Sheets**: Export interview notes to Docs, analytics to Sheets
- **Contacts/Tasks**: Save recruiter contacts, sync reminders

**Setup:**

1. The app uses Clerk for authentication and OAuth
2. Go to Settings → Google Integrations
3. Click "Connect Google Account"
4. Grant the requested permissions

See [docs/google-integration/README.md](docs/google-integration/README.md) for detailed setup instructions.

### Columbus Browser Extension (optional)

The Columbus extension auto-fills job applications and imports listings from supported sites directly into your opportunity bank. It's a separate workspace under `columbus-extension/`.

**Quick setup:**

```bash
cd columbus-extension
npm install
npm run build          # Chrome    → dist/
npm run build:firefox  # Firefox   → dist-firefox/
```

**Load it:**
- Chrome: `chrome://extensions` → enable Developer mode → Load unpacked → pick `columbus-extension/dist/`
- Firefox: `about:debugging` → Load Temporary Add-on → pick `columbus-extension/dist-firefox/manifest.json`

**Try the demo first** (a sample job application form with embedded `JobPosting` JSON-LD, no auth needed):

```bash
node columbus-extension/demo/launch-with-extension.mjs
```

Boots a fresh Chromium with the extension pre-loaded and opens the demo form so you can see scraping, the badge, and the popup behavior end-to-end.

**Connect:** click the Columbus icon → **Connect Account**. Opens `/extension/connect` on your locally-running Slothing, generates a token tied to your Clerk session, stores in extension storage. After connecting, `Cmd+Shift+F` auto-fills, `Cmd+Shift+I` imports a listing.

Full docs: [`columbus-extension/README.md`](./columbus-extension/README.md).

## Usage

1. **Upload Documents**: Go to Upload and add resumes, cover letters, or supporting career documents
2. **Review Profile**: Check extracted data in My Profile and make corrections
3. **Add Job**: Go to Jobs and paste a job description
4. **Analyze Match**: Click "Analyze Match" to see how well you fit
5. **Open Document Studio**: Go to `/studio` to create resume and cover letter files
6. **Build Documents**: Use the Resume and Cover Letter tabs, choose a template, select bank entries, and edit the generated draft
7. **Export**: Copy HTML or download a PDF from the Studio
8. **Practice Interview**: Go to Interview Prep and start a mock interview

## Document Studio Architecture

Document Studio is the single document-building surface at `/studio`. Legacy document-building pages redirect there, so one route owns resume and cover letter workflows.

```
/studio
├── Header
│   ├── Resume / Cover Letter tabs
│   ├── Template picker
│   ├── Saved state
│   └── Export actions
├── Left panel
│   ├── Files
│   ├── Version History
│   └── Knowledge bank section picker
├── Center panel
│   └── TipTap-backed document preview/editor shell
└── Right panel
    └── AI Assistant
```

The Studio file panel tracks resume and cover letter files separately while keeping users in the same workspace. Resume drafts use knowledge bank entries, section ordering, visibility controls, template styling, and TipTap document JSON. Version history helpers normalize, compare, and store capped builder snapshots in browser storage under `taida:builder:versions:<document-id>`.

## Project Structure

```
src/
├── app/           # Next.js pages and API routes
│   └── (app)/studio/ # Document Studio route
├── components/    # React components
│   ├── studio/    # Studio preview and editor surface
│   └── builder/   # Reusable section and builder controls
├── lib/
│   ├── db/       # Database access and Drizzle schema
│   ├── builder/  # Studio document state, export, version history
│   ├── editor/   # TipTap document conversion and rendering
│   ├── llm/      # AI client
│   ├── parser/   # PDF and resume parsing
│   └── resume/   # Resume generation
└── types/        # TypeScript types
```

## Data Storage

Application data is stored in SQLite using the schema in `src/lib/db/schema.ts`.
Uploaded documents and generated files are stored on disk during local development:

- `data/get-me-job.db` - Local SQLite database
- `uploads/` - Uploaded documents
- `public/resumes/` - Generated resume files
- Browser storage - Studio version history snapshots

## License

MIT
