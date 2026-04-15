# RAG Architecture — Resume Knowledge Bank

> Upload anything → chunk into pieces → embed → search → assemble tailored resumes

## Tech Stack

| Component | Choice | Package | Cost |
|-----------|--------|---------|------|
| Embeddings (primary) | text-embedding-3-small | `openai` | $0.02/1M tokens |
| Embeddings (local) | nomic-embed-text-v1.5 | `@huggingface/transformers` | Free |
| Vector store | sqlite-vec | `sqlite-vec` + `better-sqlite3` | Free |
| Reranking | Cohere Rerank | `cohere-ai` | $0.001/query |
| PDF parsing | pdf.js | `pdfjs-dist` | Free |
| DOCX parsing | mammoth | `mammoth` | Free |
| Structuring | GPT-4o-mini | `openai` | ~$0.001/resume |
| Assembly | Claude/GPT-4o | `openai` or `@anthropic-ai/sdk` | ~$0.02-0.05 |

**Cost per tailored resume: ~$0.03-0.06**

## Data Model

### Chunks Table (metadata)
```sql
CREATE TABLE chunks (
  id INTEGER PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'local-dev-user',
  content TEXT NOT NULL,
  section_type TEXT NOT NULL,  -- 'experience', 'education', 'skills', 'project', 'certification', 'summary'
  source_file TEXT,
  metadata JSON,               -- { company, title, dates, etc. }
  confidence_score REAL DEFAULT 0.8,
  superseded_by INTEGER,       -- soft delete for dedup merges
  hash TEXT,                   -- SHA-256 for exact dedup
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_chunks_user ON chunks(user_id);
CREATE INDEX idx_chunks_type ON chunks(user_id, section_type);
CREATE UNIQUE INDEX idx_chunks_hash ON chunks(user_id, hash);
```

### Vector Table (sqlite-vec)
```sql
CREATE VIRTUAL TABLE chunks_vec USING vec0(
  embedding float[1536]
);
-- Linked by rowid to chunks.id
```

## Chunking Strategy

**By entry, not by document:**

| Section | Chunk = | Typical Size |
|---------|---------|-------------|
| Summary | Entire summary | 50-150 tokens |
| Experience | One job (title + company + dates + bullets) | 100-400 tokens |
| Education | One degree | 50-150 tokens |
| Skills | One category group | 50-200 tokens |
| Projects | One project | 100-300 tokens |
| Certifications | One cert or grouped | 30-100 tokens |

**Metadata prefix (critical for retrieval quality):**
```
[Experience | Software Engineer at Google | 2021-2024]
- Led migration of 3 microservices to Kubernetes, reducing deployment time by 60%
- Mentored 4 junior engineers
```

## De-duplication

### Layer 1: Exact (on insert, fast)
- SHA-256 hash of normalized text (lowercase, strip whitespace/punctuation)
- UNIQUE constraint on (user_id, hash)
- Catches identical re-uploads instantly

### Layer 2: Semantic (on insert, after embedding)
- KNN query top-5 most similar existing chunks
- Cosine similarity thresholds:

| Similarity | Action |
|-----------|--------|
| >= 0.95 | Duplicate — skip, keep existing |
| 0.85-0.95 | Near-duplicate — keep newest, set `superseded_by` on old |
| < 0.85 | Distinct — insert normally |

## Ingest Pipeline

```
Upload (PDF/DOCX/TXT)
  │
  ▼
Parse (pdf.js / mammoth / tesseract for OCR)
  │
  ▼
Classify (LLM: resume/cover_letter/certificate/other)
  │
  ▼
Structure (LLM → JSON with sections + entries)
  │
  ▼
Chunk (per-entry with metadata prefix)
  │
  ▼
Hash Dedup (SHA-256 → skip if exact match)
  │
  ▼
Embed (text-embedding-3-small, batch)
  │
  ▼
Semantic Dedup (KNN → skip if cosine >= 0.95)
  │
  ▼
Store (sqlite-vec + chunks table)
```

## Retrieval Pipeline

```
Job Description
  │
  ▼
Query Expansion (LLM extracts requirements + keywords)
  │
  ▼
Multi-Query KNN (top 20 per requirement, union + dedup)
  │  → Typically yields 30-80 candidate chunks
  ▼
Rerank (Cohere Rerank API → score + sort)
  │  → Top 15-25 chunks
  ▼
Coverage Check (LLM → which requirements are missing?)
  │  → Flag gaps, retrieve more if needed
  ▼
Assemble (LLM → tailored resume from ranked chunks)
  │  → Group by section, order chronologically
  ▼
Export (PDF / LaTeX / DOCX / HTML)
```

## Why sqlite-vec

- Zero infrastructure — single .db file
- Works offline / local-first (core differentiator)
- Already using better-sqlite3 in the project
- 500-5,000 chunks per user = well within limits
- 6KB per chunk vector, 1,000 chunks = 6MB
- Migration path to Turso (cloud SQLite) when ready for multi-device

## Implementation Order

1. Install sqlite-vec + create schema
2. Build ingest pipeline (parse → chunk → embed → store)
3. Build basic retrieval (query → KNN → return chunks)
4. Add deduplication layers
5. Add reranking (Cohere)
6. Build resume assembly (LLM from chunks)
7. Connect to export (existing PDF/LaTeX templates)
8. UI: single-page bank view with search
