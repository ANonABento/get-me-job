import { describe, expect, it } from "vitest";
import {
  bankEntriesToTipTapDocument,
  tailoredResumeToTipTapDocument,
} from "./bank-to-tiptap";
import type { BankEntry } from "@/types";
import type { TailoredResume } from "@/lib/resume/generator";

function makeEntry(
  category: BankEntry["category"],
  content: Record<string, unknown>,
  id = "e1"
): BankEntry {
  return {
    id,
    userId: "default",
    category,
    content,
    confidenceScore: 0.9,
    createdAt: "2024-01-01",
  };
}

describe("bankEntriesToTipTapDocument", () => {
  it("converts bank entries into TipTap resume document JSON", () => {
    const document = bankEntriesToTipTapDocument(
      [
        makeEntry(
          "experience",
          {
            company: "Acme",
            title: "Engineer",
            startDate: "2020",
            current: true,
            highlights: ["Built APIs", "Led migration"],
          },
          "exp"
        ),
        makeEntry("skill", { name: "TypeScript" }, "skill"),
        makeEntry("achievement", { description: "Improved revenue by 20%" }, "ach"),
      ],
      { name: "Jane Doe", email: "jane@example.com" }
    );

    expect(document.type).toBe("doc");
    expect(document.content?.[0]).toMatchObject({
      type: "contactInfo",
      attrs: {
        name: "Jane Doe",
        email: "jane@example.com",
      },
    });
    expect(document.content?.[1]).toMatchObject({
      type: "resumeSection",
      attrs: { title: "Summary" },
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Improved revenue by 20%" }],
        },
      ],
    });
    expect(document.content?.[2]).toMatchObject({
      type: "resumeSection",
      attrs: { title: "Experience" },
      content: [
        {
          type: "resumeEntry",
          attrs: {
            company: "Acme",
            title: "Engineer",
            dates: "2020 — Present",
          },
        },
      ],
    });
    expect(document.content?.[3]).toMatchObject({
      type: "resumeSection",
      attrs: { title: "Skills" },
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "TypeScript" }],
        },
      ],
    });
  });
});

describe("tailoredResumeToTipTapDocument", () => {
  it("preserves resume sections and omits empty education", () => {
    const resume: TailoredResume = {
      contact: { name: "Jane Doe" },
      summary: "",
      experiences: [],
      skills: [],
      education: [],
    };

    const document = tailoredResumeToTipTapDocument(resume);

    expect(document.content?.map((node) => node.attrs?.title).filter(Boolean)).toEqual([
      "Summary",
      "Experience",
      "Skills",
    ]);
  });

  it("converts education into resume entry nodes", () => {
    const resume: TailoredResume = {
      contact: { name: "Jane Doe" },
      summary: "Builder",
      experiences: [],
      skills: [],
      education: [
        {
          institution: "MIT",
          degree: "BS",
          field: "Computer Science",
          date: "2020",
        },
      ],
    };

    const document = tailoredResumeToTipTapDocument(resume);
    const education = document.content?.find(
      (node) => node.attrs?.title === "Education"
    );

    expect(education?.content?.[0]).toMatchObject({
      type: "resumeEntry",
      attrs: {
        company: "MIT",
        title: "BS in Computer Science",
        dates: "2020",
      },
    });
  });
});
