import type { Profile, Experience, Education, Skill, Project, Certification } from "@/types";

export interface ChunkEntry {
  content: string;
  sectionType: string;
  metadata: Record<string, unknown>;
}

function formatDateRange(start?: string, end?: string, current?: boolean): string {
  const parts: string[] = [];
  if (start) parts.push(start);
  if (current) {
    parts.push("Present");
  } else if (end) {
    parts.push(end);
  }
  return parts.join(" – ");
}

function chunkExperience(exp: Experience): ChunkEntry {
  const dateRange = formatDateRange(exp.startDate, exp.endDate, exp.current);
  const header = `[Experience | ${exp.company} | ${exp.title} | ${dateRange}]`;

  const lines: string[] = [header];
  if (exp.description) lines.push(exp.description);
  if (exp.highlights.length > 0) {
    lines.push(...exp.highlights.map((h) => `• ${h}`));
  }
  if (exp.skills.length > 0) {
    lines.push(`Skills: ${exp.skills.join(", ")}`);
  }

  return {
    content: lines.join("\n"),
    sectionType: "experience",
    metadata: {
      company: exp.company,
      title: exp.title,
      startDate: exp.startDate,
      endDate: exp.endDate,
      current: exp.current,
    },
  };
}

function chunkEducation(edu: Education): ChunkEntry {
  const dateRange = formatDateRange(edu.startDate, edu.endDate);
  const header = `[Education | ${edu.institution} | ${edu.degree} in ${edu.field} | ${dateRange}]`;

  const lines: string[] = [header];
  if (edu.gpa) lines.push(`GPA: ${edu.gpa}`);
  if (edu.highlights.length > 0) {
    lines.push(...edu.highlights.map((h) => `• ${h}`));
  }

  return {
    content: lines.join("\n"),
    sectionType: "education",
    metadata: {
      institution: edu.institution,
      degree: edu.degree,
      field: edu.field,
    },
  };
}

function chunkSkillGroup(category: string, skills: Skill[]): ChunkEntry {
  const skillNames = skills.map((s) => {
    if (s.proficiency) return `${s.name} (${s.proficiency})`;
    return s.name;
  });

  return {
    content: `[Skills | ${category}] ${skillNames.join(", ")}`,
    sectionType: "skills",
    metadata: { category, count: skills.length },
  };
}

function chunkProject(project: Project): ChunkEntry {
  const header = `[Project | ${project.name}]`;
  const lines: string[] = [header];
  if (project.description) lines.push(project.description);
  if (project.technologies.length > 0) {
    lines.push(`Technologies: ${project.technologies.join(", ")}`);
  }
  if (project.highlights.length > 0) {
    lines.push(...project.highlights.map((h) => `• ${h}`));
  }
  if (project.url) lines.push(`URL: ${project.url}`);

  return {
    content: lines.join("\n"),
    sectionType: "project",
    metadata: {
      name: project.name,
      technologies: project.technologies,
    },
  };
}

function chunkCertification(cert: Certification): ChunkEntry {
  const lines: string[] = [`[Certification | ${cert.name} | ${cert.issuer}]`];
  if (cert.date) lines.push(`Date: ${cert.date}`);
  if (cert.url) lines.push(`URL: ${cert.url}`);

  return {
    content: lines.join("\n"),
    sectionType: "certification",
    metadata: {
      name: cert.name,
      issuer: cert.issuer,
    },
  };
}

function chunkSummary(summary: string): ChunkEntry {
  return {
    content: `[Summary] ${summary}`,
    sectionType: "summary",
    metadata: {},
  };
}

export function chunkProfile(profile: Partial<Profile>): ChunkEntry[] {
  const chunks: ChunkEntry[] = [];

  if (profile.summary) {
    chunks.push(chunkSummary(profile.summary));
  }

  if (profile.experiences) {
    for (const exp of profile.experiences) {
      chunks.push(chunkExperience(exp));
    }
  }

  if (profile.education) {
    for (const edu of profile.education) {
      chunks.push(chunkEducation(edu));
    }
  }

  if (profile.skills && profile.skills.length > 0) {
    const grouped = new Map<string, Skill[]>();
    for (const skill of profile.skills) {
      const cat = skill.category || "other";
      if (!grouped.has(cat)) grouped.set(cat, []);
      grouped.get(cat)!.push(skill);
    }
    for (const [category, skills] of Array.from(grouped.entries())) {
      chunks.push(chunkSkillGroup(category, skills));
    }
  }

  if (profile.projects) {
    for (const project of profile.projects) {
      chunks.push(chunkProject(project));
    }
  }

  if (profile.certifications) {
    for (const cert of profile.certifications) {
      chunks.push(chunkCertification(cert));
    }
  }

  return chunks;
}
