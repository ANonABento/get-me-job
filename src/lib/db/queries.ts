import db from "./schema";
import { generateId } from "@/lib/utils";
import { createProfileSnapshot } from "./profile-versions";
import type {
  Profile,
  Experience,
  Education,
  Skill,
  Project,
  Document,
  Settings,
  LLMConfig,
  DocumentType,
} from "@/types";

interface DocumentRow {
  id: string;
  filename: string;
  type: string;
  mime_type: string;
  size: number;
  path: string;
  extracted_text: string | null;
  parsed_data?: string | null;
  file_hash?: string | null;
  uploaded_at: string;
}

function rowToDocument(row: DocumentRow): Document {
  return {
    id: row.id,
    filename: row.filename,
    type: row.type as Document["type"],
    mimeType: row.mime_type,
    size: row.size,
    path: row.path,
    extractedText: row.extracted_text || undefined,
    parsedData: row.parsed_data ? JSON.parse(row.parsed_data) : undefined,
    fileHash: row.file_hash || undefined,
    uploadedAt: row.uploaded_at,
  };
}

// Settings
export function getSetting(
  key: string,
  userId: string = "default",
): string | null {
  const row = db
    .prepare("SELECT value FROM settings WHERE key = ? AND user_id = ?")
    .get(key, userId) as { value: string } | undefined;
  return row?.value || null;
}

export function setSetting(
  key: string,
  value: string,
  userId: string = "default",
): void {
  db.prepare(
    `INSERT INTO settings (key, user_id, value, updated_at)
     VALUES (?, ?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(key, user_id) DO UPDATE SET
       value = excluded.value,
       updated_at = CURRENT_TIMESTAMP`,
  ).run(key, userId, value);
}

export function getLLMConfig(userId: string = "default"): LLMConfig | null {
  const config = getSetting("llm_config", userId);
  return config ? JSON.parse(config) : null;
}

export function setLLMConfig(
  config: LLMConfig,
  userId: string = "default",
): void {
  setSetting("llm_config", JSON.stringify(config), userId);
}

// Documents

/**
 * Thrown when `saveDocument` violates the (user_id, file_hash) UNIQUE
 * constraint. Lets the upload route surface a 409 instead of a generic 500.
 */
export class DuplicateDocumentError extends Error {
  readonly code = "duplicate_document" as const;
  constructor(
    message = "Document with this file hash already exists for this user",
  ) {
    super(message);
    this.name = "DuplicateDocumentError";
  }
}

function isUniqueConstraintError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const sqliteCode = (error as { code?: string }).code;
  if (sqliteCode === "SQLITE_CONSTRAINT_UNIQUE") return true;
  // better-sqlite3 sometimes only sets the generic SQLITE_CONSTRAINT code; the
  // message text reliably mentions the index/column when it's the unique one.
  const message = (error as { message?: string }).message ?? "";
  return message.includes("UNIQUE constraint failed");
}

export function saveDocument(
  doc: Omit<Document, "uploadedAt">,
  userId: string = "default",
): void {
  try {
    db.prepare(
      `
      INSERT INTO documents (id, filename, type, mime_type, size, path, extracted_text, parsed_data, file_hash, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    ).run(
      doc.id,
      doc.filename,
      doc.type,
      doc.mimeType,
      doc.size,
      doc.path,
      doc.extractedText,
      doc.parsedData ? JSON.stringify(doc.parsedData) : null,
      doc.fileHash ?? null,
      userId,
    );
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new DuplicateDocumentError();
    }
    throw error;
  }
}

export function getDocumentByFileHash(
  fileHash: string,
  userId: string = "default",
): Document | null {
  const row = db
    .prepare(
      `SELECT * FROM documents
       WHERE user_id = ? AND file_hash = ?
       ORDER BY datetime(uploaded_at) ASC, id ASC
       LIMIT 1`,
    )
    .get(userId, fileHash) as DocumentRow | undefined;
  return row ? rowToDocument(row) : null;
}

export function getDocuments(userId: string = "default"): Document[] {
  const rows = db
    .prepare(
      "SELECT * FROM documents WHERE user_id = ? ORDER BY uploaded_at DESC",
    )
    .all(userId) as DocumentRow[];
  return rows.map(rowToDocument);
}

export function getDocumentsByType(
  type: DocumentType,
  userId: string = "default",
): Document[] {
  const rows = db
    .prepare(
      "SELECT * FROM documents WHERE type = ? AND user_id = ? ORDER BY uploaded_at DESC",
    )
    .all(type, userId) as DocumentRow[];
  return rows.map(rowToDocument);
}

export function getDocument(
  id: string,
  userId: string = "default",
): Document | null {
  const row = db
    .prepare("SELECT * FROM documents WHERE id = ? AND user_id = ?")
    .get(id, userId) as DocumentRow | undefined;
  return row ? rowToDocument(row) : null;
}

export function deleteDocument(
  id: string,
  userId: string = "default",
): string | null {
  const row = db
    .prepare("SELECT path FROM documents WHERE id = ? AND user_id = ?")
    .get(id, userId) as { path: string } | undefined;
  if (!row) return null;

  db.prepare("DELETE FROM documents WHERE id = ? AND user_id = ?").run(
    id,
    userId,
  );
  return row.path;
}

// Profile
export function getProfile(userId: string = "default"): Profile | null {
  const profileRow = db
    .prepare("SELECT * FROM profile WHERE id = ?")
    .get(userId) as any;
  if (!profileRow) return null;

  const experiences = db
    .prepare("SELECT * FROM experiences WHERE profile_id = ?")
    .all(userId) as any[];
  const education = db
    .prepare("SELECT * FROM education WHERE profile_id = ?")
    .all(userId) as any[];
  const skills = db
    .prepare("SELECT * FROM skills WHERE profile_id = ?")
    .all(userId) as any[];
  const projects = db
    .prepare("SELECT * FROM projects WHERE profile_id = ?")
    .all(userId) as any[];
  const certifications = db
    .prepare("SELECT * FROM certifications WHERE profile_id = ?")
    .all(userId) as any[];

  return {
    id: profileRow.id,
    contact: profileRow.contact_json
      ? JSON.parse(profileRow.contact_json)
      : { name: "" },
    summary: profileRow.summary,
    rawText: profileRow.raw_text,
    experiences: experiences.map((e) => ({
      id: e.id,
      company: e.company,
      title: e.title,
      location: e.location,
      startDate: e.start_date,
      endDate: e.end_date,
      current: Boolean(e.current),
      description: e.description,
      highlights: e.highlights_json ? JSON.parse(e.highlights_json) : [],
      skills: e.skills_json ? JSON.parse(e.skills_json) : [],
    })),
    education: education.map((e) => ({
      id: e.id,
      institution: e.institution,
      degree: e.degree,
      field: e.field,
      startDate: e.start_date,
      endDate: e.end_date,
      gpa: e.gpa,
      highlights: e.highlights_json ? JSON.parse(e.highlights_json) : [],
    })),
    skills: skills.map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      proficiency: s.proficiency,
    })),
    projects: projects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      url: p.url,
      technologies: p.technologies_json ? JSON.parse(p.technologies_json) : [],
      highlights: p.highlights_json ? JSON.parse(p.highlights_json) : [],
    })),
    certifications: certifications.map((c) => ({
      id: c.id,
      name: c.name,
      issuer: c.issuer,
      date: c.issue_date,
      url: c.url,
    })),
    createdAt: profileRow.created_at,
    updatedAt: profileRow.updated_at,
  };
}

export function updateProfile(
  profile: Partial<Profile>,
  userId: string = "default",
): void {
  const currentProfile = getProfile(userId);
  if (currentProfile) {
    createProfileSnapshot(userId, JSON.stringify(currentProfile));
  }

  const doUpdate = db.transaction(() => {
    // Ensure profile exists for this user
    const existingProfile = db
      .prepare("SELECT id FROM profile WHERE id = ?")
      .get(userId);
    if (!existingProfile) {
      db.prepare("INSERT INTO profile (id) VALUES (?)").run(userId);
    }

    // Update main profile
    const hasProfileFields =
      profile.contact !== undefined ||
      profile.summary !== undefined ||
      profile.rawText !== undefined;

    if (hasProfileFields) {
      db.prepare(
        `
        UPDATE profile
        SET contact_json = CASE WHEN ? THEN ? ELSE contact_json END,
            summary = CASE WHEN ? THEN ? ELSE summary END,
            raw_text = CASE WHEN ? THEN ? ELSE raw_text END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      ).run(
        profile.contact !== undefined ? 1 : 0,
        profile.contact !== undefined ? JSON.stringify(profile.contact) : null,
        profile.summary !== undefined ? 1 : 0,
        profile.summary ?? null,
        profile.rawText !== undefined ? 1 : 0,
        profile.rawText ?? null,
        userId,
      );
    }

    // Update experiences
    if (profile.experiences) {
      db.prepare("DELETE FROM experiences WHERE profile_id = ?").run(userId);
      const insertExp = db.prepare(`
        INSERT INTO experiences (id, profile_id, company, title, location, start_date, end_date, current, description, highlights_json, skills_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const exp of profile.experiences) {
        insertExp.run(
          exp.id || generateId(),
          userId,
          exp.company,
          exp.title,
          exp.location,
          exp.startDate,
          exp.endDate,
          exp.current ? 1 : 0,
          exp.description,
          JSON.stringify(exp.highlights),
          JSON.stringify(exp.skills),
        );
      }
    }

    // Update education
    if (profile.education) {
      db.prepare("DELETE FROM education WHERE profile_id = ?").run(userId);
      const insertEdu = db.prepare(`
        INSERT INTO education (id, profile_id, institution, degree, field, start_date, end_date, gpa, highlights_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const edu of profile.education) {
        insertEdu.run(
          edu.id || generateId(),
          userId,
          edu.institution,
          edu.degree,
          edu.field,
          edu.startDate,
          edu.endDate,
          edu.gpa,
          JSON.stringify(edu.highlights),
        );
      }
    }

    // Update skills
    if (profile.skills) {
      db.prepare("DELETE FROM skills WHERE profile_id = ?").run(userId);
      const insertSkill = db.prepare(`
        INSERT INTO skills (id, profile_id, name, category, proficiency)
        VALUES (?, ?, ?, ?, ?)
      `);
      for (const skill of profile.skills) {
        insertSkill.run(
          skill.id || generateId(),
          userId,
          skill.name,
          skill.category,
          skill.proficiency,
        );
      }
    }

    // Update projects
    if (profile.projects) {
      db.prepare("DELETE FROM projects WHERE profile_id = ?").run(userId);
      const insertProj = db.prepare(`
        INSERT INTO projects (id, profile_id, name, description, url, technologies_json, highlights_json)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      for (const proj of profile.projects) {
        insertProj.run(
          proj.id || generateId(),
          userId,
          proj.name,
          proj.description,
          proj.url,
          JSON.stringify(proj.technologies),
          JSON.stringify(proj.highlights),
        );
      }
    }

    // Update certifications
    if (profile.certifications) {
      db.prepare("DELETE FROM certifications WHERE profile_id = ?").run(userId);
      const insertCert = db.prepare(`
        INSERT INTO certifications (id, profile_id, name, issuer, issue_date, url)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      for (const cert of profile.certifications) {
        insertCert.run(
          cert.id || generateId(),
          userId,
          cert.name,
          cert.issuer,
          cert.date,
          cert.url,
        );
      }
    }
  });

  doUpdate();
}

// Clear all profile data
export function clearProfile(userId: string = "default"): void {
  const clear = db.transaction(() => {
    db.prepare("DELETE FROM experiences WHERE profile_id = ?").run(userId);
    db.prepare("DELETE FROM education WHERE profile_id = ?").run(userId);
    db.prepare("DELETE FROM skills WHERE profile_id = ?").run(userId);
    db.prepare("DELETE FROM projects WHERE profile_id = ?").run(userId);
    db.prepare("DELETE FROM certifications WHERE profile_id = ?").run(userId);
    db.prepare(
      `
      UPDATE profile
      SET contact_json = NULL, summary = NULL, raw_text = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    ).run(userId);
  });
  clear();
}
