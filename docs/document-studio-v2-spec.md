# Document Studio v2 — Two-Tab Editor with AI Actions

## Overview

Replace the current 3-tab Document Studio with a proper two-workspace editor. Each workspace (Resume, Cover Letter) is a full document editor with file management, version history, and AI tools as side panel actions.

## Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  [ Resume ]  [ Cover Letter ]                    [Download PDF] │
├──────────────┬──────────────────────────┬───────────────────────┤
│  File Panel  │  Document Preview        │  AI / Tools Panel     │
│  (280px)     │  (flex-1)               │  (380px, collapsible) │
│              │                          │                       │
│  MY RESUMES  │  ┌────────────────────┐  │  ── AI Generate ──   │
│  📄 SWE v3 ✓│  │                    │  │  [Tailor to JD]      │
│  📄 SWE v2  │  │  Your Name         │  │  [Generate from Bank]│
│  📄 PM role  │  │  ──────────────    │  │  [Rewrite Section]   │
│  📄 Default  │  │  EXPERIENCE        │  │                      │
│  + New       │  │  Software Eng...   │  │  ── JD Input ──      │
│              │  │  ...               │  │  [paste JD here]     │
│  ── History ─│  │                    │  │                      │
│  v3 (now)    │  │  EDUCATION         │  │  ── Gap Analysis ──  │
│  v2 (2h ago) │  │  ...               │  │  Score: 78%          │
│  v1 (yday)   │  └────────────────────┘  │  ✅ React, TS       │
│              │                          │  ⚠️ Missing: K8s     │
│  ── Sections │  ── Editor Toolbar ──    │                      │
│  □ Summary   │  B I U | Undo Redo |    │  ── Selection ──     │
│  □ Experience│  Zoom | Template ▾      │  (select text above  │
│  □ Education │                          │   for AI options)    │
│  □ Skills    │                          │                      │
│  + Add from  │                          │                      │
│    bank      │                          │                      │
└──────────────┴──────────────────────────┴───────────────────────┘
```

## Core Concepts

### 1. Two Workspaces, Not Three Modes

- **Resume tab**: Full resume editor
- **Cover Letter tab**: Cover letter editor (simplified sections — just opening/body/closing)
- "Tailored" is NOT a tab — it's an AI action you perform on any resume

### 2. File System (per workspace)

- Each tab shows a list of saved documents (like files in a folder)
- Click to switch between documents
- "+ New" creates a blank document
- Documents persist in localStorage (later: DB when Neon is active)
- Each document has: name, templateId, sections/content, createdAt, updatedAt

### 3. Version History (per document)

- Auto-save creates a version every edit session (debounced)
- Manual "Save Version" with custom name
- Version list in left panel below file list
- Click version to preview, "Restore" to revert
- Keep last 20 versions per document

### 4. AI Actions (Right Panel)

AI is a tool panel, not a mode. Actions available:

**Always visible:**

- **Tailor to JD**: Paste a job description → AI rewrites current resume to match
- **Generate from Bank**: Select bank entries → AI generates formatted content
- **Rewrite Section**: AI rewrites a specific section for clarity/impact

**When text is selected in editor:**

- **Rewrite**: Rephrase selected text
- **Make Concise**: Shorten without losing meaning
- **Add Metrics**: Add quantifiable results
- **Match Keywords**: Align with JD keywords

**After JD is pasted:**

- **Gap Analysis**: Shows match score, matched keywords (green), missing keywords (yellow)
- **Auto-Tailor**: One-click rewrite entire resume for the JD

### 5. Editor Toolbar

Floating above the preview:

- **B** / **I** / **U** — Bold, Italic, Underline
- **Undo** / **Redo**
- **Zoom** slider (50-150%)
- **Template** dropdown (switch template, live preview)
- **Download PDF** (top-right, prominent)
- **Print**

### 6. Inline Editing

- Click any text in the preview to edit
- Cursor, selection, typing all work naturally
- Drag section handles to reorder
- Click bullet to edit
- "Add Section" ghost at bottom → opens bank entry picker
- Placeholder text in empty sections

## Data Model

```typescript
interface StudioDocument {
  id: string;
  name: string;
  type: "resume" | "cover-letter";
  templateId: string;
  content: TipTapJSON; // TipTap document JSON
  sections: Section[]; // ordered section metadata
  selectedEntryIds: string[]; // bank entries used
  createdAt: string;
  updatedAt: string;
}

interface DocumentVersion {
  id: string;
  documentId: string;
  name?: string; // "v1", "Before tailoring", etc.
  content: TipTapJSON;
  createdAt: string;
}

// Stored in localStorage as:
// studio:documents -> StudioDocument[]
// studio:versions:{docId} -> DocumentVersion[]
// studio:active:{type} -> string (active document ID per tab)
```

## Implementation Tasks

### Phase 1: File System + Two Tabs

1. **Restructure to two-tab layout with file panel** — Replace 3-tab with 2-tab (Resume/Cover Letter). Add file list panel showing saved documents. "+ New" button. Click to switch. Persist in localStorage.

2. **Add version history to file panel** — Below the file list, show versions for the active document. Auto-version on save (debounced 30s). Manual "Save Version" button. Click to preview, restore.

### Phase 2: Editor Improvements

3. **Add editor toolbar with formatting** — Bold/Italic/Underline, Undo/Redo, Zoom, Template switcher. Float above the preview. Wire to TipTap commands.

4. **Improve inline editing UX** — Click-to-edit with visible cursor, section drag handles, "Add Section" ghost button, placeholder text in empty sections. Polish the editing feel.

### Phase 3: AI Panel Redesign

5. **Redesign right panel as AI action center** — Remove the "Tailored" tab. Add JD input to the right panel. AI actions: Tailor to JD, Generate from Bank, Rewrite Section. Selection-based actions when text is highlighted.

6. **Add gap analysis to AI panel** — After JD is pasted, show match score ring, matched keywords (green), missing keywords (yellow) with suggestions. "Auto-Tailor" one-click button.

### Phase 4: Polish

7. **Cover letter workspace** — Simplified editor for cover letters. Different section structure (opening/body/closing). AI generation from JD + bank. Separate file list from resumes.

8. **Cleanup and integration** — Remove old Tailored tab code. Update sidebar, onboarding, quick actions. Ensure PDF export works for both resume and cover letter from the same pipeline.

### Future Enhancements

- [Template upload](./template-upload-spec.md): user-owned templates in the Studio picker grid.
