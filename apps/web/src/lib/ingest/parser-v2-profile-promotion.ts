import type { ParsedResumeV2Profile } from "@/lib/ingest/types";
import type { Profile } from "@/types";

export function parserV2ProfileToAutoPromoteInput(
  profile: ParsedResumeV2Profile,
): Partial<Profile> {
  return {
    contact: {
      name: profile.contact.name,
      email: profile.contact.email,
      phone: profile.contact.phone,
      location: profile.contact.location,
      linkedin: profile.contact.linkedin,
      github: profile.contact.github,
      website: profile.contact.website,
    },
    summary: profile.summary?.text,
    rawText: profile.rawText,
    experiences: profile.experiences.map((experience) => ({
      id: experience.id,
      company: experience.company,
      title: experience.title,
      location: experience.location,
      startDate: experience.startDate,
      endDate: experience.endDate,
      current: experience.current,
      description: experience.description,
      highlights: experience.highlights.map((highlight) => highlight.text),
      skills: experience.skills,
    })),
    education: profile.education.map((education) => ({
      id: education.id,
      institution: education.institution,
      degree: education.degree,
      field: education.field,
      startDate: education.startDate,
      endDate: education.endDate,
      gpa: education.gpa,
      highlights: education.highlights.map((highlight) => highlight.text),
    })),
    skills: profile.skills.map((skill) => ({
      id: skill.id,
      name: skill.name,
      category: skill.category,
    })),
    projects: profile.projects.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      url: project.url,
      technologies: project.technologies,
      highlights: project.highlights.map((highlight) => highlight.text),
    })),
  };
}
