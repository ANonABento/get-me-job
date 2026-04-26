import type { ContactInfo, BankEntry } from "@/types";
import { bankEntriesToResume } from "@/lib/resume/bank-to-resume";
import type { TailoredResume } from "@/lib/resume/generator";
import type { TipTapJSONContent } from "./types";

function textNode(text: string): TipTapJSONContent {
  return { type: "text", text };
}

function paragraph(text: string): TipTapJSONContent {
  return text ? { type: "paragraph", content: [textNode(text)] } : { type: "paragraph" };
}

function bulletList(items: string[]): TipTapJSONContent | undefined {
  const bullets = items.filter((item) => item.trim().length > 0);
  if (bullets.length === 0) return undefined;

  return {
    type: "bulletList",
    content: bullets.map((item) => ({
      type: "listItem",
      content: [paragraph(item)],
    })),
  };
}

function resumeEntry(
  attrs: { company: string; title: string; dates: string },
  highlights: string[] = []
): TipTapJSONContent {
  const list = bulletList(highlights);

  return {
    type: "resumeEntry",
    attrs,
    ...(list ? { content: [list] } : {}),
  };
}

function resumeSection(
  title: string,
  content: TipTapJSONContent[]
): TipTapJSONContent {
  return {
    type: "resumeSection",
    attrs: { title },
    content: content.length > 0 ? content : [paragraph("")],
  };
}

function contactInfo(contact: ContactInfo): TipTapJSONContent {
  return {
    type: "contactInfo",
    attrs: {
      name: contact.name || "",
      email: contact.email || "",
      phone: contact.phone || "",
      location: contact.location || "",
      linkedin: contact.linkedin || "",
      github: contact.github || "",
    },
  };
}

export function tailoredResumeToTipTapDocument(
  resume: TailoredResume
): TipTapJSONContent {
  const content: TipTapJSONContent[] = [
    contactInfo(resume.contact),
    resumeSection("Summary", [paragraph(resume.summary)]),
    resumeSection(
      "Experience",
      resume.experiences.map((experience) =>
        resumeEntry(
          {
            company: experience.company,
            title: experience.title,
            dates: experience.dates,
          },
          experience.highlights
        )
      )
    ),
    resumeSection("Skills", [paragraph(resume.skills.join(" • "))]),
  ];

  if (resume.education.length > 0) {
    content.push(
      resumeSection(
        "Education",
        resume.education.map((education) =>
          resumeEntry({
            company: education.institution,
            title: [education.degree, education.field].filter(Boolean).join(" in "),
            dates: education.date,
          })
        )
      )
    );
  }

  return {
    type: "doc",
    content,
  };
}

export function bankEntriesToTipTapDocument(
  entries: BankEntry[],
  contact?: ContactInfo
): TipTapJSONContent {
  return tailoredResumeToTipTapDocument(bankEntriesToResume(entries, contact));
}
