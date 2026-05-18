import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { createParserV2Diagnostic } from "./diagnostics";
import { buildPdfSourceMap } from "./pdf-source-map";
import { parseResumeV2FromSourceMap } from "./parse-resume-v2";

const fixturePath = path.join(
  process.cwd(),
  "tests/fixtures/parser-v2/syzfjbzwjncs.pdf",
);
const expectedPath = path.join(
  process.cwd(),
  "tests/fixtures/parser-v2/syzfjbzwjncs.expected.json",
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
