# Document Studio — Unified Editor Redesign

## Problem

Three separate pages (Resume Builder, Tailor Resume, Cover Letter) do similar things with inconsistent UX:
- No inline text editing — content is read-only after AI generates it
- Resume preview is an iframe with `srcDoc` — can't interact with it
- Cover letter "editing" is chat-based — type a revision prompt, AI rewrites
- Two download PDF buttons, double scrollbars in preview
- No way to add sections from the editor — have to go back to Documents
- No highlighting or AI-assisted rewriting of specific sections

## Solution

Replace all three pages with a single **Document Studio** page at `/studio`.

## Architecture

### Layout: Three-Panel Split

```
┌──────────────┬────────────────────────┬──────────────┐
│  Left Panel  │    Center: Editor      │  Right Panel │
│  (320px)     │    (flex-1)            │  (360px,     │
│              │                        │   collapsible)│
│  Doc Type    │  ┌──────────────────┐  │              │
│  ○ Resume    │  │  Toolbar         │  │  AI Assistant│
│  ○ Cover Ltr │  │  ────────────    │  │              │
│  ○ Tailored  │  │                  │  │  "Rewrite    │
│              │  │  [Editable       │  │   this       │
│  ── JD Input │  │   Document       │  │   section"   │
│  paste JD... │  │   Preview]       │  │              │
│              │  │                  │  │  [Suggestions]│
│  ── Sections │  │  Click to edit   │  │              │
│  □ Experience│  │  Drag to reorder │  │  ── History  │
│  □ Education │  │                  │  │  v1, v2, v3  │
│  □ Skills    │  │                  │  │              │
│  + Add from  │  └──────────────────┘  │              │
│    bank      │                        │              │
│              │                        │              │
│  ── Template │                        │              │
│  [picker]    │                        │              │
└──────────────┴────────────────────────┴──────────────┘
```

### Left Panel — Document Config
- **Document type toggle**: Resume / Cover Letter / Tailored Resume
  - Switching type changes the template set and available sections
  - Cover Letter shows a single text block instead of resume sections
  - Tailored Resume adds JD input + gap analysis
- **JD Input**: Paste job description (shown for Tailored + Cover Letter modes)
- **Section list**: Drag-to-reorder, toggle visibility, sourced from bank
  - "Add Section" ghost button → opens bank entry picker modal
  - For Cover Letter: simplified — just "Opening / Body / Closing"
- **Template picker**: Grid of template thumbnails (existing 9 templates)
- **Style controls**: Font, accent color, spacing (from existing TemplateStyles)

### Center Panel — Editable Preview
- **Editor**: TipTap (ProseMirror-based) with custom resume schema
  - Why TipTap: mature, extensible, good React support, handles structured content well
  - Custom node types: `resumeSection`, `resumeEntry`, `bulletList`, `contactInfo`
  - Renders using the same CSS as `generateResumeHTML()` templates
  - Click any text to edit inline
  - Drag section handles to reorder
  - Selection → triggers AI panel on right
- **Toolbar** (top of center panel):
  - Undo / Redo
  - Template switcher (dropdown)
  - Zoom slider (50%-150%)
  - Download PDF (single button, uses Playwright server-side)
  - Print
- **Page simulation**: White page with shadow on grey background, A4 proportions
  - Scroll within the page area only (no double scrollbar)
  - Page break indicators for multi-page resumes

### Right Panel — AI Assistant (Collapsible)
- **Context-aware**: Shows different UI based on what's selected in the editor
- **No selection**: General suggestions ("Your summary could be stronger", "Add metrics to experience bullets")
- **Text selected**: 
  - "Rewrite" — AI rewrites the selected text
  - "Make more concise" / "Add metrics" / "Match JD keywords" — quick action buttons
  - Shows before/after diff, accept/reject
- **Section selected**: 
  - "Generate from bank" — pull matching entries from knowledge bank
  - "Optimize for ATS" — keyword analysis against JD
- **Gap Analysis** (Tailored mode): 
  - Matched keywords (green)
  - Missing keywords (yellow) with suggestions
  - Match score ring
- **Version history**: Auto-save versions, click to restore

## Implementation Plan

### Phase 1: Foundation (3-4 tasks)
1. **Install TipTap + create resume document schema**
   - `npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder`
   - Custom extensions for resume structure (sections, entries, contact)
   - Import existing `generateResumeHTML` CSS as TipTap editor styles
   
2. **Create Document Studio page layout**
   - New route at `/studio` (keep old routes as redirects temporarily)
   - Three-panel responsive layout
   - Left panel with document type toggle, section list, template picker
   - Center panel with TipTap editor in page-simulation frame
   - Right panel placeholder

3. **Wire existing data to TipTap**
   - Convert bank entries → TipTap document JSON
   - Apply template styles to editor content
   - Section drag-and-drop via TipTap node views
   - Single PDF export via existing Playwright pipeline

### Phase 2: AI Integration (2-3 tasks)
4. **AI assistant panel**
   - Selection detection → show rewrite options
   - Quick actions (concise, metrics, keywords)
   - Before/after diff preview
   - Accept/reject flow

5. **Tailored resume mode**
   - JD input → gap analysis in right panel
   - "Generate Tailored" fills editor with AI-generated content
   - Keyword highlighting in editor

6. **Cover letter mode**
   - Simplified editor (no sections, single document)
   - Different template set
   - AI generation from JD + bank

### Phase 3: Polish (2 tasks)
7. **Version history + auto-save**
   - localStorage for drafts
   - Named versions with restore
   
8. **Cleanup**
   - Remove old `/builder`, `/tailor`, `/cover-letter` routes
   - Update sidebar navigation
   - Update onboarding flow

## Technical Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Editor | TipTap (ProseMirror) | Best React integration, extensible schema, active maintenance |
| Preview | Live in-editor (not iframe) | Enables inline editing, no double scrollbar |
| PDF Export | Keep Playwright server-side | Already works, reliable, template-accurate |
| State | Zustand store | Consistent with rest of app |
| Templates | Keep existing system | 9 templates work, just need CSS applied to TipTap |

## What Gets Removed
- `/builder` page → redirect to `/studio`
- `/tailor` page → redirect to `/studio?mode=tailored`
- `/cover-letter` page → redirect to `/studio?mode=cover-letter`
- Duplicate `resume-preview.tsx` components (2 exist)
- Chat-based cover letter editor
- Double download buttons

## Reusable Components
- `TemplatePicker` — as-is
- `EntryPicker` — as modal for "Add from bank"
- `ExportMenu` — adapt for toolbar
- `GapAnalysis` — move to right panel
- `generateResumeHTML()` CSS — extract and apply to TipTap
- Playwright PDF pipeline — keep as-is
