import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { createParserV2Diagnostic } from "./diagnostics";
import { buildPdfSourceMap } from "./pdf-source-map";
import { parseResumeV2FromSourceMap } from "./parse-resume-v2";
import type {
  DocumentSourceMap,
  SourceLine,
  SourceLink,
  SourceToken,
} from "./types";

const fixturePath = path.join(
  process.cwd(),
  "tests/fixtures/parser-v2/syzfjbzwjncs.pdf",
);
const expectedPath = path.join(
  process.cwd(),
  "tests/fixtures/parser-v2/syzfjbzwjncs.expected.json",
);
const sweFixturePath = path.join(
  process.cwd(),
  "tests/fixtures/parser-v2/bznbzdprjfyy.pdf",
);
const sweExpectedPath = path.join(
  process.cwd(),
  "tests/fixtures/parser-v2/bznbzdprjfyy.expected.json",
);

interface ExpectedFixture {
  contact: Record<string, unknown>;
  education: Array<Record<string, unknown>>;
  experiences: Array<Record<string, unknown>>;
  projects: Array<Record<string, unknown>>;
}

function expectedFixture(): ExpectedFixture {
  return JSON.parse(readFileSync(expectedPath, "utf8")) as ExpectedFixture;
}

function expectedSweFixture(): ExpectedFixture {
  return JSON.parse(readFileSync(sweExpectedPath, "utf8")) as ExpectedFixture;
}

function lineWithColumns(index: number, left: string, right = ""): SourceLine {
  const id = `p1-l${String(index).padStart(3, "0")}`;
  const leftTokens = left.split(/\s+/).filter(Boolean);
  const rightTokens = right.split(/\s+/).filter(Boolean);
  const tokens: SourceToken[] = [
    ...leftTokens.map((text, tokenIndex) => ({
      id: `${id}-t${String(tokenIndex + 1).padStart(3, "0")}`,
      page: 1,
      lineId: id,
      text,
      bbox: {
        page: 1,
        x0: 20 + tokenIndex * 20,
        y0: index * 14,
        x1: 35 + tokenIndex * 20,
        y1: index * 14 + 10,
      },
    })),
    ...rightTokens.map((text, tokenIndex) => ({
      id: `${id}-r${String(tokenIndex + 1).padStart(3, "0")}`,
      page: 1,
      lineId: id,
      text,
      bbox: {
        page: 1,
        x0: 430 + tokenIndex * 20,
        y0: index * 14,
        x1: 445 + tokenIndex * 20,
        y1: index * 14 + 10,
      },
    })),
  ];
  return {
    id,
    page: 1,
    text: right ? `${left} | ${right}` : left,
    tokenIds: tokens.map((token) => token.id),
    tokens,
    bbox: { page: 1, x0: 20, y0: index * 14, x1: 560, y1: index * 14 + 10 },
  };
}

function sourceMapFromColumnLines(
  lines: Array<{ left: string; right?: string }>,
  links: SourceLink[] = [],
): DocumentSourceMap {
  const sourceLines = lines.map((line, index) =>
    lineWithColumns(index + 1, line.left, line.right),
  );
  return {
    pages: [
      {
        page: 1,
        width: 612,
        height: 792,
        lineIds: sourceLines.map((line) => line.id),
      },
    ],
    lines: sourceLines,
    rawText: sourceLines.map((line) => line.text).join("\n"),
    links,
  };
}

describe("parseResumeV2FromSourceMap", () => {
  it("parses the syzfjbzwjncs PDF from source lines with grounded spans", async () => {
    const sourceMap = await buildPdfSourceMap(readFileSync(fixturePath));
    const parsed = parseResumeV2FromSourceMap(sourceMap);
    const expected = expectedFixture();

    expect(parsed.profile.contact).toMatchObject(expected.contact);
    expect(parsed.profile.education).toMatchObject(expected.education);
    expect(parsed.profile.experiences).toMatchObject(expected.experiences);
    expect(parsed.profile.projects).toMatchObject(expected.projects);
    expect(
      [
        parsed.profile.contact,
        ...parsed.profile.education,
        ...parsed.profile.experiences,
        ...parsed.profile.projects,
        ...parsed.profile.experiences.flatMap((entry) => entry.highlights),
        ...parsed.profile.projects.flatMap((entry) => entry.highlights),
      ].every((item) => item.sourceQuality === "exact"),
    ).toBe(true);
    expect(parsed.warnings).toEqual([]);
  });

  it("splits company/location and keeps project dates out of technologies", async () => {
    const sourceMap = await buildPdfSourceMap(readFileSync(fixturePath));
    const parsed = parseResumeV2FromSourceMap(sourceMap);

    expect(parsed.profile.experiences[0]).toMatchObject({
      company: "Texas A&M University",
      location: "College Station, TX",
    });
    expect(parsed.profile.experiences[1]).toMatchObject({
      company: "Southwestern University",
      location: "Georgetown, TX",
    });
    expect(parsed.profile.projects[0]).toMatchObject({
      technologies: ["Python", "Flask", "React", "PostgreSQL", "Docker"],
      startDate: "June 2020",
      endDate: "Present",
    });
    expect(parsed.profile.projects[0].technologies.join(" ")).not.toMatch(
      /2020|Present/,
    );
  });

  it("parses the SWE template's alternate header shape and wrapped bullets", async () => {
    const sourceMap = await buildPdfSourceMap(readFileSync(sweFixturePath));
    const parsed = parseResumeV2FromSourceMap(sourceMap);
    const expected = expectedSweFixture();

    expect(parsed.profile.contact).toMatchObject(expected.contact);
    expect(parsed.profile.education).toMatchObject(expected.education);
    expect(parsed.profile.experiences).toMatchObject(expected.experiences);
    expect(parsed.profile.projects).toMatchObject(expected.projects);
    expect(parsed.profile.experiences[0]).toMatchObject({
      company: "Company Name 1",
      title: "Software Engineer",
    });
    expect(parsed.profile.experiences[0].highlights[0].sourceSpanIds).toEqual([
      "p1-l011",
      "p1-l012",
    ]);
    expect(parsed.profile.projects).toHaveLength(3);
    expect(parsed.profile.projects[0].startDate).toBeUndefined();
    expect(
      [
        parsed.profile.contact,
        ...parsed.profile.education,
        ...parsed.profile.experiences,
        ...parsed.profile.projects,
        ...parsed.profile.experiences.flatMap((entry) => entry.highlights),
        ...parsed.profile.projects.flatMap((entry) => entry.highlights),
      ].every((item) => item.sourceQuality === "exact"),
    ).toBe(true);
    expect(parsed.warnings).toEqual([]);
  });

  it("parses inline role-company-location experience headers and stops at decorated project headings", () => {
    const sourceMap = sourceMapFromColumnLines(
      [
        { left: "Kevin Jiang | k69jiang@uwaterloo.ca" },
        { left: "EXPERIENCE" },
        {
          left: "Software Engineer — Hamming AI (YC S24) — Austin, Texas, United States",
          right: "Dec 2025 — Apr 2026",
        },
        {
          left: "● Shipped Red Teaming, an adversarial voice-agent evaluation suite",
        },
        { left: "with a closed-loop wave selector on Temporal workflows" },
        {
          left: "Robotics Engineer — Reazon Human Interaction Lab — Akihabara, Tokyo, Japan",
          right: "Jun 2025 — Aug 2025",
        },
        { left: "● Designed a lightweight exoskeleton wrist controller" },
        { left: "PROJECTS 🔗" },
        { left: "VR Haptic Gloves | C++ | ESP32 | Arduino" },
        {
          left: "● Built an affordable full-finger tracking glove with servo-assisted haptics",
        },
        { left: "EDUCATION" },
        {
          left: "University of Waterloo — BASc in Computer Engineering",
          right: "Sept 2024 - Present",
        },
      ],
      [
        {
          url: "https://portfolio.example.com",
          page: 1,
          bbox: [1, 20, 14, 180, 24],
        },
        {
          url: "https://hamming.ai/",
          page: 1,
          bbox: [1, 20, 42, 380, 52],
        },
        {
          url: "https://github.com/example/vr-gloves",
          page: 1,
          bbox: [1, 20, 126, 300, 136],
        },
      ],
    );

    const parsed = parseResumeV2FromSourceMap(sourceMap);

    expect(parsed.profile.contact.website).toBe(
      "https://portfolio.example.com",
    );
    expect(parsed.profile.experiences).toHaveLength(2);
    expect(parsed.profile.experiences[0]).toMatchObject({
      title: "Software Engineer",
      company: "Hamming AI (YC S24)",
      url: "https://hamming.ai/",
      location: "Austin, Texas, United States",
      startDate: "Dec 2025",
      endDate: "Apr 2026",
    });
    expect(parsed.profile.experiences[0].highlights).toHaveLength(1);
    expect(parsed.profile.experiences[0].highlights[0]).toMatchObject({
      text: "Shipped Red Teaming, an adversarial voice-agent evaluation suite with a closed-loop wave selector on Temporal workflows",
      sourceSpanIds: ["p1-l004", "p1-l005"],
    });
    expect(parsed.profile.experiences[1]).toMatchObject({
      title: "Robotics Engineer",
      company: "Reazon Human Interaction Lab",
      location: "Akihabara, Tokyo, Japan",
    });
    expect(parsed.profile.experiences[1].highlights).toHaveLength(1);
    expect(parsed.profile.projects).toHaveLength(1);
    expect(parsed.profile.projects[0]).toMatchObject({
      name: "VR Haptic Gloves",
      url: "https://github.com/example/vr-gloves",
      technologies: ["C++", "ESP32", "Arduino"],
    });
    expect(parsed.profile.education).toHaveLength(1);
    expect(parsed.profile.education[0]).toMatchObject({
      institution: "University of Waterloo",
      degree: "BASc",
      field: "Computer Engineering",
      startDate: "Sept 2024",
      endDate: "Present",
    });
  });

  it("aggregates repeated sections and parses summary plus decorated skills headings", () => {
    const sourceMap = sourceMapFromColumnLines([
      { left: "Ada Lovelace | ada@example.com" },
      { left: "SUMMARY" },
      { left: "Systems engineer focused on reliable developer tooling." },
      { left: "EXPERIENCE" },
      {
        left: "Software Engineer — Difference Engine Labs",
        right: "Jan 2024 — Present",
      },
      { left: "● Shipped reliable parser infrastructure" },
      { left: "PROJECTS" },
      { left: "Parser Bench | TypeScript | SQLite" },
      { left: "● Built regression fixtures" },
      { left: "EXPERIENCE" },
      {
        left: "Research Engineer — Analytical Society",
        right: "Jan 2023 — Dec 2023",
      },
      { left: "● Evaluated symbolic execution traces" },
      { left: "TECHNICAL SKILLS 🔗" },
      { left: "Languages: TypeScript, Python" },
      { left: "Tools: SQLite, Playwright" },
    ]);

    const parsed = parseResumeV2FromSourceMap(sourceMap);

    expect(parsed.profile.summary).toMatchObject({
      text: "Systems engineer focused on reliable developer tooling.",
      sourceSpanIds: ["p1-l003"],
    });
    expect(parsed.profile.experiences).toHaveLength(2);
    expect(parsed.profile.projects).toHaveLength(1);
    expect(parsed.profile.skills.map((skill) => skill.name)).toEqual([
      "TypeScript",
      "Python",
      "SQLite",
      "Playwright",
    ]);
  });

  it("strips contact artifacts and reports missing source spans in diagnostics", async () => {
    const sourceMap = await buildPdfSourceMap(readFileSync(fixturePath));
    const parsed = parseResumeV2FromSourceMap(sourceMap);
    const diagnostic = createParserV2Diagnostic(sourceMap, parsed);

    expect(parsed.profile.contact.phone).toBe("123-456-7890");
    expect(parsed.profile.contact.phone).not.toContain("|");
    expect(parsed.profile.contact.email).toBe("jake@su.edu");
    expect(parsed.profile.contact.name).toBe("Jake Ryan");
    expect(diagnostic.missingRootSourceSpans).toEqual([]);
    expect(diagnostic.missingBulletSourceSpans).toEqual([]);
    expect(diagnostic.partialRootSourceSpans).toEqual([]);
    expect(diagnostic.partialBulletSourceSpans).toEqual([]);
  });
});
