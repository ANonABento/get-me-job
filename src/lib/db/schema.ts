import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { createRequire } from "module";
import { PATHS } from "@/lib/constants";
import { runLocalDevCleanSlateMigration } from "./local-clean-slate";
import { ensureDedupeSchema, runDedupeBackfillMigration } from "./dedupe-backfill";

const require = createRequire(import.meta.url);

// Ensure data directory exists
const dataDir = path.dirname(PATHS.DATABASE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(PATHS.DATABASE, { timeout: 5000 });

// Give parallel test workers a chance to wait on short-lived locks.
db.pragma("busy_timeout = 5000");

// Enable WAL mode for better performance. When another worker is already
// initializing the same file-backed database, continue instead of failing
// the whole module import on a transient lock.
try {
  db.pragma("journal_mode = WAL");
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "SQLITE_BUSY") {
    throw error;
  }
  console.warn("[db] Database was busy while enabling WAL mode; continuing");
}

// Load sqlite-vec extension for vector search (optional — fails gracefully if not available)
try {
  const sqliteVec = require("sqlite-vec");
  sqliteVec.load(db);
} catch {
  console.warn("[db] sqlite-vec extension not available — vector search disabled");
}

// Create tables
db.exec(`
  -- Settings table
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT NOT NULL,
    user_id TEXT NOT NULL DEFAULT 'default',
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (key, user_id)
  );

  -- Documents table
  CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default',
    filename TEXT NOT NULL,
    type TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    path TEXT NOT NULL,
    extracted_text TEXT,
    parsed_data TEXT,
    file_hash TEXT,
    uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- Profile table (single user for now)
  CREATE TABLE IF NOT EXISTS profile (
    id TEXT PRIMARY KEY DEFAULT 'default',
    contact_json TEXT,
    summary TEXT,
    raw_text TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- Experiences table
  CREATE TABLE IF NOT EXISTS experiences (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL DEFAULT 'default',
    company TEXT NOT NULL,
    title TEXT NOT NULL,
    location TEXT,
    start_date TEXT,
    end_date TEXT,
    current INTEGER DEFAULT 0,
    description TEXT,
    highlights_json TEXT,
    skills_json TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES profile(id)
  );

  -- Education table
  CREATE TABLE IF NOT EXISTS education (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL DEFAULT 'default',
    institution TEXT NOT NULL,
    degree TEXT NOT NULL,
    field TEXT,
    start_date TEXT,
    end_date TEXT,
    gpa TEXT,
    highlights_json TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES profile(id)
  );

  -- Skills table
  CREATE TABLE IF NOT EXISTS skills (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL DEFAULT 'default',
    name TEXT NOT NULL,
    category TEXT DEFAULT 'other',
    proficiency TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES profile(id)
  );

  -- Projects table
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL DEFAULT 'default',
    name TEXT NOT NULL,
    description TEXT,
    url TEXT,
    technologies_json TEXT,
    highlights_json TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES profile(id)
  );

  -- Certifications table
  CREATE TABLE IF NOT EXISTS certifications (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL DEFAULT 'default',
    name TEXT NOT NULL,
    issuer TEXT NOT NULL,
    issue_date TEXT,
    expiry_date TEXT,
    credential_id TEXT,
    url TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES profile(id)
  );

  -- Job descriptions table
  CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    type TEXT,
    remote INTEGER DEFAULT 0,
    salary TEXT,
    description TEXT NOT NULL,
    requirements_json TEXT,
    responsibilities_json TEXT,
    keywords_json TEXT,
    url TEXT,
    status TEXT DEFAULT 'saved',
    applied_at TEXT,
    deadline TEXT,
    notes TEXT,
    linked_resume_id TEXT,
    linked_cover_letter_id TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- Generated resumes table
  CREATE TABLE IF NOT EXISTS generated_resumes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default',
    job_id TEXT NOT NULL,
    profile_id TEXT NOT NULL DEFAULT 'default',
    content_json TEXT NOT NULL,
    pdf_path TEXT,
    match_score REAL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id),
    FOREIGN KEY (profile_id) REFERENCES profile(id)
  );

  -- Interview sessions table
  CREATE TABLE IF NOT EXISTS interview_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default',
    job_id TEXT NOT NULL,
    profile_id TEXT NOT NULL DEFAULT 'default',
    mode TEXT DEFAULT 'text',
    questions_json TEXT NOT NULL,
    status TEXT DEFAULT 'in_progress',
    started_at TEXT DEFAULT CURRENT_TIMESTAMP,
    completed_at TEXT,
    FOREIGN KEY (job_id) REFERENCES jobs(id),
    FOREIGN KEY (profile_id) REFERENCES profile(id)
  );

  -- Interview answers table
  CREATE TABLE IF NOT EXISTS interview_answers (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default',
    session_id TEXT NOT NULL,
    question_index INTEGER NOT NULL,
    answer TEXT NOT NULL,
    feedback TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES interview_sessions(id) ON DELETE CASCADE
  );

  -- Reminders table
  CREATE TABLE IF NOT EXISTS reminders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default',
    job_id TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'follow_up',
    title TEXT NOT NULL,
    description TEXT,
    due_date TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    dismissed INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    completed_at TEXT,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
  );

  -- Notifications table
  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    link TEXT,
    read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- Company research cache table
  CREATE TABLE IF NOT EXISTS company_research (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default',
    company_name TEXT NOT NULL,
    summary TEXT,
    key_facts_json TEXT,
    interview_questions_json TEXT,
    culture_notes TEXT,
    recent_news TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, company_name)
  );

  -- Cover letters table
  CREATE TABLE IF NOT EXISTS cover_letters (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default',
    job_id TEXT NOT NULL,
    profile_id TEXT NOT NULL DEFAULT 'default',
    content TEXT NOT NULL,
    highlights_json TEXT,
    version INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (profile_id) REFERENCES profile(id)
  );

  -- Email drafts table
  CREATE TABLE IF NOT EXISTS email_drafts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default',
    type TEXT NOT NULL,
    job_id TEXT,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    context_json TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL
  );

  -- Analytics snapshots table for historical tracking
  CREATE TABLE IF NOT EXISTS analytics_snapshots (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default',
    snapshot_date TEXT NOT NULL,
    total_jobs INTEGER DEFAULT 0,
    jobs_saved INTEGER DEFAULT 0,
    jobs_applied INTEGER DEFAULT 0,
    jobs_interviewing INTEGER DEFAULT 0,
    jobs_offered INTEGER DEFAULT 0,
    jobs_rejected INTEGER DEFAULT 0,
    total_interviews INTEGER DEFAULT 0,
    interviews_completed INTEGER DEFAULT 0,
    total_documents INTEGER DEFAULT 0,
    total_resumes INTEGER DEFAULT 0,
    profile_completeness INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, snapshot_date)
  );

  -- Job status history table
  CREATE TABLE IF NOT EXISTS job_status_history (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default',
    job_id TEXT NOT NULL,
    from_status TEXT,
    to_status TEXT NOT NULL,
    changed_at TEXT DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
  );

  -- Salary offers table
  CREATE TABLE IF NOT EXISTS salary_offers (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default',
    job_id TEXT,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    base_salary REAL NOT NULL,
    signing_bonus REAL,
    annual_bonus REAL,
    equity_value REAL,
    vesting_years INTEGER,
    location TEXT,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    negotiation_outcome TEXT,
    final_base_salary REAL,
    final_total_comp REAL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL
  );

  -- ATS scan history table
  CREATE TABLE IF NOT EXISTS ats_scan_history (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default',
    job_id TEXT,
    overall_score INTEGER NOT NULL,
    letter_grade TEXT NOT NULL,
    formatting_score INTEGER NOT NULL,
    structure_score INTEGER NOT NULL,
    content_score INTEGER NOT NULL,
    keywords_score INTEGER NOT NULL,
    issue_count INTEGER NOT NULL DEFAULT 0,
    fix_count INTEGER NOT NULL DEFAULT 0,
    report_json TEXT NOT NULL,
    scanned_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_ats_scan_history_user ON ats_scan_history(user_id);
  CREATE INDEX IF NOT EXISTS idx_ats_scan_history_date ON ats_scan_history(scanned_at);
  -- Custom resume templates table
  CREATE TABLE IF NOT EXISTS custom_templates (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default',
    name TEXT NOT NULL,
    source_document_id TEXT,
    analyzed_styles TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_document_id) REFERENCES documents(id) ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_custom_templates_user_created
    ON custom_templates(user_id, created_at DESC);

  -- Profile bank table for aggregated resume data
  CREATE TABLE IF NOT EXISTS profile_bank (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default',
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    source_document_id TEXT,
    confidence_score REAL DEFAULT 0.8,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_document_id) REFERENCES documents(id) ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_profile_bank_user ON profile_bank(user_id);
  CREATE INDEX IF NOT EXISTS idx_profile_bank_category ON profile_bank(user_id, category);
  CREATE INDEX IF NOT EXISTS idx_profile_bank_user_source ON profile_bank(user_id, source_document_id);
  -- Profile versions table for version history with rollback
  CREATE TABLE IF NOT EXISTS profile_versions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default',
    profile_id TEXT NOT NULL DEFAULT 'default',
    version INTEGER NOT NULL,
    snapshot_json TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES profile(id)
  );

  CREATE INDEX IF NOT EXISTS idx_profile_versions_profile ON profile_versions(profile_id, version DESC);

  -- Knowledge bank chunks table
  CREATE TABLE IF NOT EXISTS chunks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default',
    content TEXT NOT NULL,
    section_type TEXT NOT NULL,
    source_file TEXT,
    metadata TEXT,
    confidence_score REAL DEFAULT 0.8,
    superseded_by TEXT,
    hash TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_chunks_user ON chunks(user_id);
  CREATE INDEX IF NOT EXISTS idx_chunks_user_section ON chunks(user_id, section_type);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_chunks_user_hash ON chunks(user_id, hash);

`);

// Create vec0 virtual table for vector search (requires sqlite-vec extension)
try {
  db.exec(`CREATE VIRTUAL TABLE IF NOT EXISTS chunks_vec USING vec0(embedding float[1536]);`);
} catch {
  console.warn("[db] Could not create chunks_vec table — sqlite-vec not loaded");
}

function getColumnNames(table: string): string[] {
  const tableInfo = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  return tableInfo.map((col) => col.name);
}

// Migration: Make settings user-scoped instead of globally keyed.
try {
  const settingsColumns = getColumnNames("settings");

  if (!settingsColumns.includes("user_id")) {
    db.transaction(() => {
      db.exec(`
        ALTER TABLE settings RENAME TO settings_old;
        CREATE TABLE settings (
          key TEXT NOT NULL,
          user_id TEXT NOT NULL DEFAULT 'default',
          value TEXT NOT NULL,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (key, user_id)
        );
        INSERT INTO settings (key, user_id, value, updated_at)
        SELECT key, 'default', value, updated_at
        FROM settings_old;
        DROP TABLE settings_old;
      `);
    })();
  }
} catch (error) {
  console.error("Settings migration error:", error);
}

// Migration: Add explicit user_id ownership columns to tables that previously
// used profile_id or joined through jobs for isolation.
try {
  const ownershipMigrations: Array<{ table: string; backfill: string }> = [
    {
      table: "generated_resumes",
      backfill: "UPDATE generated_resumes SET user_id = profile_id WHERE user_id = 'default'",
    },
    {
      table: "interview_sessions",
      backfill: "UPDATE interview_sessions SET user_id = profile_id WHERE user_id = 'default'",
    },
    {
      table: "reminders",
      backfill: `
        UPDATE reminders
        SET user_id = COALESCE((SELECT user_id FROM jobs WHERE jobs.id = reminders.job_id), 'default')
        WHERE user_id = 'default'
      `,
    },
    {
      table: "cover_letters",
      backfill: "UPDATE cover_letters SET user_id = profile_id WHERE user_id = 'default'",
    },
    {
      table: "profile_versions",
      backfill: "UPDATE profile_versions SET user_id = profile_id WHERE user_id = 'default'",
    },
  ];

  for (const migration of ownershipMigrations) {
    const columnNames = getColumnNames(migration.table);
    if (!columnNames.includes("user_id")) {
      db.exec(`ALTER TABLE ${migration.table} ADD COLUMN user_id TEXT NOT NULL DEFAULT 'default'`);
      db.exec(migration.backfill);
    }
    db.exec(`CREATE INDEX IF NOT EXISTS idx_${migration.table}_user_id ON ${migration.table}(user_id)`);
  }
} catch (error) {
  console.error("Ownership migration error:", error);
}

// Migration: Add new columns to jobs table if they don't exist
try {
  // Check if status column exists
  const columnNames = getColumnNames("jobs");

  if (!columnNames.includes("status")) {
    db.exec("ALTER TABLE jobs ADD COLUMN status TEXT DEFAULT 'saved'");
  }
  if (!columnNames.includes("applied_at")) {
    db.exec("ALTER TABLE jobs ADD COLUMN applied_at TEXT");
  }
  if (!columnNames.includes("deadline")) {
    db.exec("ALTER TABLE jobs ADD COLUMN deadline TEXT");
  }
  if (!columnNames.includes("notes")) {
    db.exec("ALTER TABLE jobs ADD COLUMN notes TEXT");
  }
  if (!columnNames.includes("linked_resume_id")) {
    db.exec("ALTER TABLE jobs ADD COLUMN linked_resume_id TEXT");
  }
  if (!columnNames.includes("linked_cover_letter_id")) {
    db.exec("ALTER TABLE jobs ADD COLUMN linked_cover_letter_id TEXT");
  }
  // Add user_id column for multi-user support
  if (!columnNames.includes("user_id")) {
    db.exec("ALTER TABLE jobs ADD COLUMN user_id TEXT DEFAULT 'default'");
  }
} catch (error) {
  console.error("Migration error:", error);
}

// Migration: Add user_id to documents table
try {
  const docTableInfo = db.prepare("PRAGMA table_info(documents)").all() as Array<{ name: string }>;
  const docColumnNames = docTableInfo.map((col) => col.name);

  if (!docColumnNames.includes("user_id")) {
    db.exec("ALTER TABLE documents ADD COLUMN user_id TEXT DEFAULT 'default'");
  }
} catch (error) {
  console.error("Documents migration error:", error);
}

// Migration: Add document file hashes and bank source indexes for upload dedupe.
try {
  ensureDedupeSchema(db);
} catch (error) {
  console.error("Documents dedupe schema migration error:", error);
}

// Migration: Add user_id to notifications table
try {
  const notifTableInfo = db.prepare("PRAGMA table_info(notifications)").all() as Array<{ name: string }>;
  const notifColumnNames = notifTableInfo.map((col) => col.name);

  if (!notifColumnNames.includes("user_id")) {
    db.exec("ALTER TABLE notifications ADD COLUMN user_id TEXT DEFAULT 'default'");
  }
} catch (error) {
  console.error("Notifications migration error:", error);
}

// Migration: Add per-user ownership to interview answers
try {
  const answerTableInfo = db.prepare("PRAGMA table_info(interview_answers)").all() as Array<{ name: string }>;
  const answerColumnNames = answerTableInfo.map((col) => col.name);

  if (!answerColumnNames.includes("user_id")) {
    db.exec("ALTER TABLE interview_answers ADD COLUMN user_id TEXT DEFAULT 'default'");
  }
} catch (error) {
  console.error("Interview answers migration error:", error);
}

// Migration: Add per-user ownership to job status history
try {
  const statusTableInfo = db.prepare("PRAGMA table_info(job_status_history)").all() as Array<{ name: string }>;
  const statusColumnNames = statusTableInfo.map((col) => col.name);

  if (!statusColumnNames.includes("user_id")) {
    db.exec("ALTER TABLE job_status_history ADD COLUMN user_id TEXT DEFAULT 'default'");
  }

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_job_status_history_user_job
      ON job_status_history(user_id, job_id, changed_at)
  `);
} catch (error) {
  console.error("Job status history migration error:", error);
}

// Migration: company research used to be globally unique by company name.
// Rebuild the table when needed so each Clerk user can cache the same company.
try {
  const companyTableInfo = db.prepare("PRAGMA table_info(company_research)").all() as Array<{ name: string }>;
  const companyColumnNames = companyTableInfo.map((col) => col.name);
  const indexes = db.prepare("PRAGMA index_list(company_research)").all() as Array<{
    name: string;
    unique: number;
  }>;
  const hasGlobalCompanyUnique = indexes.some((index) => {
    if (!index.unique || index.name === "idx_company_research_user_company") return false;
    const columns = db.prepare(`PRAGMA index_info(${JSON.stringify(index.name)})`).all() as Array<{ name: string }>;
    return columns.length === 1 && columns[0]?.name === "company_name";
  });

  if (!companyColumnNames.includes("user_id") || hasGlobalCompanyUnique) {
    db.transaction(() => {
      db.exec(`
        ALTER TABLE company_research RENAME TO company_research_old;
        CREATE TABLE company_research (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL DEFAULT 'default',
          company_name TEXT NOT NULL,
          summary TEXT,
          key_facts_json TEXT,
          interview_questions_json TEXT,
          culture_notes TEXT,
          recent_news TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, company_name)
        );
        INSERT INTO company_research (
          id, user_id, company_name, summary, key_facts_json,
          interview_questions_json, culture_notes, recent_news, created_at, updated_at
        )
        SELECT id, 'default', company_name, summary, key_facts_json,
          interview_questions_json, culture_notes, recent_news, created_at, updated_at
        FROM company_research_old;
        DROP TABLE company_research_old;
      `);
    })();
  }

  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_company_research_user_company
      ON company_research(user_id, company_name)
  `);
} catch (error) {
  console.error("Company research migration error:", error);
}

// Migration: Add parsed_data column to documents table
try {
  const docTableInfo2 = db.prepare("PRAGMA table_info(documents)").all() as Array<{ name: string }>;
  const docColumnNames2 = docTableInfo2.map((col) => col.name);

  if (!docColumnNames2.includes("parsed_data")) {
    db.exec("ALTER TABLE documents ADD COLUMN parsed_data TEXT");
  }
} catch (error) {
  console.error("Documents parsed_data migration error:", error);
}

// Migration: Add extension tables
try {
  db.exec(`
    -- Extension session tokens for API authentication
    CREATE TABLE IF NOT EXISTS extension_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'default',
      token TEXT NOT NULL UNIQUE,
      device_info TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      expires_at TEXT NOT NULL,
      last_used_at TEXT
    );

    -- Learned answers from job applications
    CREATE TABLE IF NOT EXISTS learned_answers (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'default',
      question TEXT NOT NULL,
      question_normalized TEXT NOT NULL,
      answer TEXT NOT NULL,
      source_url TEXT,
      source_company TEXT,
      times_used INTEGER DEFAULT 1,
      last_used_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Custom field mappings for specific sites
    CREATE TABLE IF NOT EXISTS field_mappings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'default',
      site_pattern TEXT NOT NULL,
      field_selector TEXT NOT NULL,
      field_type TEXT NOT NULL,
      custom_value TEXT,
      enabled INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes for extension tables
    CREATE INDEX IF NOT EXISTS idx_extension_sessions_token ON extension_sessions(token);
    CREATE INDEX IF NOT EXISTS idx_extension_sessions_user ON extension_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_learned_answers_normalized ON learned_answers(question_normalized);
    CREATE INDEX IF NOT EXISTS idx_learned_answers_user ON learned_answers(user_id);
  `);
} catch (error) {
  console.error("Extension tables migration error:", error);
}

// Migration: Resume A/B tracking table
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS resume_ab_tracking (
      id TEXT PRIMARY KEY,
      resume_id TEXT NOT NULL,
      job_id TEXT NOT NULL,
      user_id TEXT NOT NULL DEFAULT 'default',
      outcome TEXT NOT NULL DEFAULT 'applied',
      sent_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      notes TEXT,
      FOREIGN KEY (resume_id) REFERENCES generated_resumes(id) ON DELETE CASCADE,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_resume_ab_tracking_resume ON resume_ab_tracking(resume_id);
    CREATE INDEX IF NOT EXISTS idx_resume_ab_tracking_job ON resume_ab_tracking(job_id);
    CREATE INDEX IF NOT EXISTS idx_resume_ab_tracking_user ON resume_ab_tracking(user_id);
  `);
} catch (error) {
  console.error("Resume A/B tracking migration error:", error);
}

try {
  runLocalDevCleanSlateMigration(db);
} catch (error) {
  console.error("Local dev clean slate migration error:", error);
}

if (process.env.GET_ME_JOB_SKIP_DEDUPE_BACKFILL !== "true") {
  try {
    runDedupeBackfillMigration(db);
  } catch (error) {
    console.error("Dedupe backfill migration error:", error);
  }
}

// Migration: Prompt A/B testing tables
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS prompt_variants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      version INTEGER NOT NULL DEFAULT 1,
      content TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS prompt_variant_results (
      id TEXT PRIMARY KEY,
      prompt_variant_id TEXT NOT NULL,
      job_id TEXT,
      resume_id TEXT,
      match_score REAL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (prompt_variant_id) REFERENCES prompt_variants(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_prompt_variant_results_variant ON prompt_variant_results(prompt_variant_id);
  `);
} catch (error) {
  console.error("Prompt A/B testing migration error:", error);
}

export default db;
