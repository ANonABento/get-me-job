import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { PATHS } from "@/lib/constants";

// Ensure data directory exists
const dataDir = path.dirname(PATHS.DATABASE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(PATHS.DATABASE);

// Enable WAL mode for better performance
db.pragma("journal_mode = WAL");

// Create tables
db.exec(`
  -- Settings table
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- Documents table
  CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    type TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    path TEXT NOT NULL,
    extracted_text TEXT,
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
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- Generated resumes table
  CREATE TABLE IF NOT EXISTS generated_resumes (
    id TEXT PRIMARY KEY,
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
    company_name TEXT NOT NULL UNIQUE,
    summary TEXT,
    key_facts_json TEXT,
    interview_questions_json TEXT,
    culture_notes TEXT,
    recent_news TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- Cover letters table
  CREATE TABLE IF NOT EXISTS cover_letters (
    id TEXT PRIMARY KEY,
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
  -- Profile versions table for version history with rollback
  CREATE TABLE IF NOT EXISTS profile_versions (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL DEFAULT 'default',
    version INTEGER NOT NULL,
    snapshot_json TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES profile(id)
  );

  CREATE INDEX IF NOT EXISTS idx_profile_versions_profile ON profile_versions(profile_id, version DESC);

  -- Create default profile if not exists
  INSERT OR IGNORE INTO profile (id) VALUES ('default');
`);

// Migration: Add new columns to jobs table if they don't exist
try {
  // Check if status column exists
  const tableInfo = db.prepare("PRAGMA table_info(jobs)").all() as Array<{ name: string }>;
  const columnNames = tableInfo.map((col) => col.name);

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

export default db;
