import db from "./schema";
import { generateId } from "@/lib/utils";
import { createProfileSnapshot } from "./profile-versions";
import type { Profile, Experience, Education, Skill, Project, Document, Settings, LLMConfig } from "@/types";

// Settings
export function getSetting(key: string): string | null {
  const row = db.prepare("SELECT value FROM settings WHERE key = ?").get(key) as { value: string } | undefined;
  return row?.value || null;
}

export function setSetting(key: string, value: string): void {
  db.prepare(
    "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)"
  ).run(key, value);
}

export function getLLMConfig(): LLMConfig | null {
  const config = getSetting("llm_config");
  return config ? JSON.parse(config) : null;
}

export function setLLMConfig(config: LLMConfig): void {
  setSetting("llm_config", JSON.stringify(config));
}

// Documents
export function saveDocument(doc: Omit<Document, "uploadedAt">, userId: string = "default"): void {
  db.prepare(`
    INSERT INTO documents (id, filename, type, mime_type, size, path, extracted_text, parsed_data, user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    doc.id,
    doc.filename,
    doc.type,
    doc.mimeType,
    doc.size,
    doc.path,
    doc.extractedText,
    doc.parsedData ? JSON.stringify(doc.parsedData) : null,
    userId
  );
}

export function getDocuments(userId: string = "default"): Document[] {
  const rows = db
    .prepare("SELECT * FROM documents WHERE user_id = ? ORDER BY uploaded_at DESC")
    .all(userId) as any[];
  return rows.map((row) => ({
    id: row.id,
    filename: row.filename,
    type: row.type,
    mimeType: row.mime_type,
    size: row.size,
    path: row.path,
    extractedText: row.extracted_text,
    parsedData: row.parsed_data ? JSON.parse(row.parsed_data) : undefined,
    uploadedAt: row.uploaded_at,
  }));
}

// Profile
export function getProfile(userId: string = "default"): Profile | null {
  const profileRow = db.prepare("SELECT * FROM profile WHERE id = ?").get(userId) as any;
  if (!profileRow) return null;

  const experiences = db.prepare("SELECT * FROM experiences WHERE profile_id = ?").all(userId) as any[];
  const education = db.prepare("SELECT * FROM education WHERE profile_id = ?").all(userId) as any[];
  const skills = db.prepare("SELECT * FROM skills WHERE profile_id = ?").all(userId) as any[];
  const projects = db.prepare("SELECT * FROM projects WHERE profile_id = ?").all(userId) as any[];
  const certifications = db.prepare("SELECT * FROM certifications WHERE profile_id = ?").all(userId) as any[];

  return {
    id: profileRow.id,
    contact: profileRow.contact_json ? JSON.parse(profileRow.contact_json) : { name: "" },
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

export function updateProfile(profile: Partial<Profile>, userId: string = "default"): void {
  const currentProfile = getProfile(userId);
  if (currentProfile) {
    createProfileSnapshot(userId, JSON.stringify(currentProfile));
  }

  const doUpdate = db.transaction(() => {
    // Ensure profile exists for this user
    const existingProfile = db.prepare("SELECT id FROM profile WHERE id = ?").get(userId);
    if (!existingProfile) {
      db.prepare("INSERT INTO profile (id) VALUES (?)").run(userId);
    }

    // Update main profile
    if (profile.contact || profile.summary || profile.rawText) {
      db.prepare(`
        UPDATE profile
        SET contact_json = COALESCE(?, contact_json),
            summary = COALESCE(?, summary),
            raw_text = COALESCE(?, raw_text),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        profile.contact ? JSON.stringify(profile.contact) : null,
        profile.summary || null,
        profile.rawText || null,
        userId
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
          JSON.stringify(exp.skills)
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
          JSON.stringify(edu.highlights)
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
          skill.proficiency
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
          JSON.stringify(proj.highlights)
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
          cert.url
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
    db.prepare(`
      UPDATE profile
      SET contact_json = NULL, summary = NULL, raw_text = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(userId);
  });
  clear();
}
