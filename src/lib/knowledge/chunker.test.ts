import { describe, it, expect } from "vitest";
import { chunkProfile } from "./chunker";
import type { Profile } from "@/types";

function makeProfile(overrides: Partial<Profile> = {}): Partial<Profile> {
  return {
    summary: "Experienced software engineer",
    experiences: [
      {
        id: "exp-1",
        company: "Acme Corp",
        title: "Senior Engineer",
        location: "NYC",
        startDate: "2020-01",
        endDate: "2023-06",
        current: false,
        description: "Built scalable APIs",
        highlights: ["Led team of 5", "Reduced latency by 40%"],
        skills: ["TypeScript", "Node.js"],
      },
    ],
    education: [
      {
        id: "edu-1",
        institution: "MIT",
        degree: "BS",
        field: "Computer Science",
        startDate: "2016",
        endDate: "2020",
        gpa: "3.8",
        highlights: ["Dean's List"],
      },
    ],
    skills: [
      { id: "sk-1", name: "TypeScript", category: "technical", proficiency: "expert" },
      { id: "sk-2", name: "React", category: "technical", proficiency: "advanced" },
      { id: "sk-3", name: "Communication", category: "soft" },
    ],
    projects: [
      {
        id: "proj-1",
        name: "Open Source CLI",
        description: "A CLI tool for devs",
        url: "https://github.com/example",
        technologies: ["Rust", "Clap"],
        highlights: ["500+ stars"],
      },
    ],
    certifications: [
      {
        id: "cert-1",
        name: "AWS Solutions Architect",
        issuer: "Amazon",
        date: "2022-03",
        url: "https://aws.amazon.com/cert",
      },
    ],
    ...overrides,
  };
}

describe("chunkProfile", () => {
  it("should create chunks for all profile sections", () => {
    const profile = makeProfile();
    const chunks = chunkProfile(profile);

    // summary + 1 experience + 1 education + 2 skill groups + 1 project + 1 cert = 7
    expect(chunks).toHaveLength(7);

    const types = chunks.map((c) => c.sectionType);
    expect(types).toContain("summary");
    expect(types).toContain("experience");
    expect(types).toContain("education");
    expect(types).toContain("skills");
    expect(types).toContain("project");
    expect(types).toContain("certification");
  });

  it("should chunk each experience separately", () => {
    const profile = makeProfile({
      experiences: [
        {
          id: "exp-1",
          company: "Acme",
          title: "Engineer",
          startDate: "2020",
          current: false,
          description: "Built things",
          highlights: [],
          skills: [],
        },
        {
          id: "exp-2",
          company: "Beta Inc",
          title: "Lead",
          startDate: "2023",
          current: true,
          description: "Leading team",
          highlights: ["Shipped v2"],
          skills: ["Go"],
        },
      ],
    });

    const chunks = chunkProfile(profile);
    const expChunks = chunks.filter((c) => c.sectionType === "experience");
    expect(expChunks).toHaveLength(2);
    expect(expChunks[0].content).toContain("Acme");
    expect(expChunks[1].content).toContain("Beta Inc");
  });

  it("should include date range in experience chunks", () => {
    const profile = makeProfile();
    const chunks = chunkProfile(profile);
    const expChunk = chunks.find((c) => c.sectionType === "experience")!;
    expect(expChunk.content).toContain("2020-01");
    expect(expChunk.content).toContain("2023-06");
  });

  it("should show 'Present' for current positions", () => {
    const profile = makeProfile({
      experiences: [
        {
          id: "exp-1",
          company: "Current Co",
          title: "Dev",
          startDate: "2023",
          current: true,
          description: "Working here",
          highlights: [],
          skills: [],
        },
      ],
    });

    const chunks = chunkProfile(profile);
    const expChunk = chunks.find((c) => c.sectionType === "experience")!;
    expect(expChunk.content).toContain("Present");
  });

  it("should include highlights as bullet points", () => {
    const profile = makeProfile();
    const chunks = chunkProfile(profile);
    const expChunk = chunks.find((c) => c.sectionType === "experience")!;
    expect(expChunk.content).toContain("• Led team of 5");
    expect(expChunk.content).toContain("• Reduced latency by 40%");
  });

  it("should group skills by category", () => {
    const profile = makeProfile();
    const chunks = chunkProfile(profile);
    const skillChunks = chunks.filter((c) => c.sectionType === "skills");
    expect(skillChunks).toHaveLength(2); // technical and soft

    const techChunk = skillChunks.find((c) => c.content.includes("technical"))!;
    expect(techChunk.content).toContain("TypeScript (expert)");
    expect(techChunk.content).toContain("React (advanced)");

    const softChunk = skillChunks.find((c) => c.content.includes("soft"))!;
    expect(softChunk.content).toContain("Communication");
  });

  it("should include education details", () => {
    const profile = makeProfile();
    const chunks = chunkProfile(profile);
    const eduChunk = chunks.find((c) => c.sectionType === "education")!;
    expect(eduChunk.content).toContain("MIT");
    expect(eduChunk.content).toContain("BS in Computer Science");
    expect(eduChunk.content).toContain("GPA: 3.8");
    expect(eduChunk.content).toContain("• Dean's List");
  });

  it("should include project details", () => {
    const profile = makeProfile();
    const chunks = chunkProfile(profile);
    const projChunk = chunks.find((c) => c.sectionType === "project")!;
    expect(projChunk.content).toContain("Open Source CLI");
    expect(projChunk.content).toContain("Rust, Clap");
    expect(projChunk.content).toContain("• 500+ stars");
    expect(projChunk.content).toContain("https://github.com/example");
  });

  it("should include certification details", () => {
    const profile = makeProfile();
    const chunks = chunkProfile(profile);
    const certChunk = chunks.find((c) => c.sectionType === "certification")!;
    expect(certChunk.content).toContain("AWS Solutions Architect");
    expect(certChunk.content).toContain("Amazon");
  });

  it("should set metadata on experience chunks", () => {
    const profile = makeProfile();
    const chunks = chunkProfile(profile);
    const expChunk = chunks.find((c) => c.sectionType === "experience")!;
    expect(expChunk.metadata).toEqual({
      company: "Acme Corp",
      title: "Senior Engineer",
      startDate: "2020-01",
      endDate: "2023-06",
      current: false,
    });
  });

  it("should return empty array for empty profile", () => {
    const chunks = chunkProfile({});
    expect(chunks).toHaveLength(0);
  });

  it("should skip sections that are missing", () => {
    const chunks = chunkProfile({ summary: "Just a summary" });
    expect(chunks).toHaveLength(1);
    expect(chunks[0].sectionType).toBe("summary");
    expect(chunks[0].content).toContain("Just a summary");
  });
});
