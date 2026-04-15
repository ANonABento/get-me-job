import { describe, it, expect } from "vitest";
import {
  getSynonyms,
  areSynonyms,
  SYNONYM_GROUPS,
  SYNONYM_MATCH_WEIGHT,
} from "./synonyms";
import { analyzeATS } from "./analyzer";
import type { Profile, JobDescription } from "@/types";

describe("synonyms", () => {
  describe("getSynonyms", () => {
    it("returns synonyms for a known canonical term", () => {
      const synonyms = getSynonyms("react");
      expect(synonyms).toContain("react");
      expect(synonyms).toContain("reactjs");
      expect(synonyms).toContain("react.js");
    });

    it("returns synonyms when given a synonym (not canonical)", () => {
      const synonyms = getSynonyms("reactjs");
      expect(synonyms).toContain("react");
      expect(synonyms).toContain("reactjs");
    });

    it("is case-insensitive", () => {
      const synonyms = getSynonyms("React");
      expect(synonyms).toContain("react");
      expect(synonyms).toContain("reactjs");
    });

    it("returns empty array for unknown terms", () => {
      const synonyms = getSynonyms("xyznonexistent");
      expect(synonyms).toEqual([]);
    });

    it("handles whitespace in input", () => {
      const synonyms = getSynonyms("  react  ");
      expect(synonyms).toContain("react");
    });

    it("includes backend/server-side synonym group", () => {
      const synonyms = getSynonyms("backend");
      expect(synonyms).toContain("server-side");
      expect(synonyms).toContain("back-end");
    });

    it("includes leadership/soft skill synonyms", () => {
      const synonyms = getSynonyms("leadership");
      expect(synonyms).toContain("led");
      expect(synonyms).toContain("managed");
      expect(synonyms).toContain("directed");
    });
  });

  describe("areSynonyms", () => {
    it("returns true for identical terms", () => {
      expect(areSynonyms("react", "react")).toBe(true);
    });

    it("returns true for known synonyms", () => {
      expect(areSynonyms("react", "reactjs")).toBe(true);
      expect(areSynonyms("reactjs", "react")).toBe(true);
    });

    it("returns true for backend/server-side", () => {
      expect(areSynonyms("backend", "server-side")).toBe(true);
    });

    it("returns false for unrelated terms", () => {
      expect(areSynonyms("react", "python")).toBe(false);
    });

    it("returns false for unknown terms", () => {
      expect(areSynonyms("xyzabc", "defghi")).toBe(false);
    });

    it("is case-insensitive", () => {
      expect(areSynonyms("React", "ReactJS")).toBe(true);
    });
  });

  describe("SYNONYM_GROUPS", () => {
    it("has at least 50 synonym groups", () => {
      expect(SYNONYM_GROUPS.length).toBeGreaterThanOrEqual(50);
    });

    it("all groups have at least one synonym", () => {
      for (const group of SYNONYM_GROUPS) {
        expect(group.synonyms.length).toBeGreaterThanOrEqual(1);
      }
    });

    it("all terms are lowercase", () => {
      for (const group of SYNONYM_GROUPS) {
        expect(group.canonical).toBe(group.canonical.toLowerCase());
        for (const synonym of group.synonyms) {
          expect(synonym).toBe(synonym.toLowerCase());
        }
      }
    });
  });

  describe("SYNONYM_MATCH_WEIGHT", () => {
    it("is 0.8", () => {
      expect(SYNONYM_MATCH_WEIGHT).toBe(0.8);
    });
  });
});

describe("analyzeATS with synonym matching", () => {
  const createProfile = (skills: string[]): Profile => ({
    id: "profile-1",
    contact: {
      name: "John Doe",
      email: "john@example.com",
      phone: "555-0123",
    },
    summary: "Experienced software developer with 5 years building web apps.",
    experiences: [
      {
        id: "exp-1",
        title: "Software Engineer",
        company: "Tech Corp",
        location: "Remote",
        startDate: "2020-01",
        endDate: "2024-01",
        current: false,
        description: "Led development of web applications",
        highlights: ["Improved performance by 30%", "Led team of 5 developers"],
        skills,
      },
    ],
    education: [
      {
        id: "edu-1",
        institution: "State University",
        degree: "BS",
        field: "Computer Science",
        startDate: "2016-09",
        endDate: "2020-05",
        highlights: [],
      },
    ],
    skills: skills.map((s, i) => ({
      id: `skill-${i}`,
      name: s,
      category: "technical" as const,
      proficiency: "advanced" as const,
    })),
    projects: [],
    certifications: [],
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  });

  const createJob = (keywords: string[]): JobDescription => ({
    id: "job-1",
    title: "Software Engineer",
    company: "Test Co",
    description: "We need an engineer.",
    requirements: [],
    responsibilities: [],
    keywords,
    createdAt: new Date().toISOString(),
  });

  it("matches ReactJS in resume to React in job description", () => {
    const profile = createProfile(["ReactJS", "Node.js"]);
    const job = createJob(["React"]);
    const result = analyzeATS(profile, job);

    const reactKeyword = result.keywords.find(
      (k) => k.keyword.toLowerCase() === "react"
    );
    expect(reactKeyword?.found).toBe(true);
    expect(reactKeyword?.matchType).toBe("synonym");
  });

  it("matches backend in resume to server-side in job description", () => {
    const profile = createProfile(["backend", "Python"]);
    const job = createJob(["server-side"]);
    const result = analyzeATS(profile, job);

    const keyword = result.keywords.find(
      (k) => k.keyword.toLowerCase() === "server-side"
    );
    expect(keyword?.found).toBe(true);
    expect(keyword?.matchType).toBe("synonym");
  });

  it("exact matches score higher than synonym matches", () => {
    // Profile with exact match
    const profileExact = createProfile(["React"]);
    const job = createJob(["React"]);
    const resultExact = analyzeATS(profileExact, job);

    // Profile with synonym match
    const profileSynonym = createProfile(["ReactJS"]);
    const resultSynonym = analyzeATS(profileSynonym, job);

    const exactKeyword = resultExact.keywords.find(
      (k) => k.keyword.toLowerCase() === "react"
    );
    const synonymKeyword = resultSynonym.keywords.find(
      (k) => k.keyword.toLowerCase() === "react"
    );

    expect(exactKeyword?.matchType).toBe("exact");
    expect(synonymKeyword?.matchType).toBe("synonym");
    // Synonym match scores 80% so overall keyword score should be lower
    expect(resultSynonym.score.keywords).toBeLessThanOrEqual(
      resultExact.score.keywords
    );
  });

  it("synonym matches score 80% of exact matches", () => {
    // Single keyword job with empty description to avoid extracted keywords
    const profile = createProfile(["ReactJS"]);
    const job: JobDescription = {
      id: "job-1",
      title: "Role",
      company: "Co",
      description: "",
      requirements: [],
      responsibilities: [],
      keywords: ["React"],
      createdAt: new Date().toISOString(),
    };
    const result = analyzeATS(profile, job);

    // With one keyword, synonym match = 0.8 weight, so score = 80
    expect(result.score.keywords).toBe(80);
  });

  it("prefers exact match over synonym match", () => {
    // Profile has both "React" and "ReactJS"
    const profile = createProfile(["React", "ReactJS"]);
    const job = createJob(["React"]);
    const result = analyzeATS(profile, job);

    const reactKeyword = result.keywords.find(
      (k) => k.keyword.toLowerCase() === "react"
    );
    expect(reactKeyword?.matchType).toBe("exact");
  });

  it("records the matched synonym term", () => {
    const profile = createProfile(["ReactJS"]);
    const job = createJob(["React"]);
    const result = analyzeATS(profile, job);

    const reactKeyword = result.keywords.find(
      (k) => k.keyword.toLowerCase() === "react"
    );
    expect(reactKeyword?.matchedTerm).toBe("reactjs");
  });

  it("handles kubernetes/k8s synonym", () => {
    const profile = createProfile(["k8s"]);
    const job = createJob(["kubernetes"]);
    const result = analyzeATS(profile, job);

    const keyword = result.keywords.find(
      (k) => k.keyword.toLowerCase() === "kubernetes"
    );
    expect(keyword?.found).toBe(true);
    expect(keyword?.matchType).toBe("synonym");
  });

  it("handles AWS/amazon web services synonym", () => {
    const profile = createProfile(["Amazon Web Services"]);
    const job = createJob(["AWS"]);
    const result = analyzeATS(profile, job);

    const keyword = result.keywords.find(
      (k) => k.keyword.toLowerCase() === "aws"
    );
    expect(keyword?.found).toBe(true);
    expect(keyword?.matchType).toBe("synonym");
  });
});
