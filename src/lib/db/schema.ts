import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "data", "columbus.db");

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);

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
} catch (error) {
  console.error("Migration error:", error);
}

export default db;
