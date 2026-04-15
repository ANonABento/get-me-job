import { describe, it, expect } from "vitest";
import {
  generateFixSuggestions,
  calculateFixPriority,
  type FixSuggestion,
} from "./fix-suggestions";
import type { ATSIssue, KeywordAnalysis } from "./analyzer";
import type { Profile } from "@/types";

const createMinimalProfile = (): Profile => ({
  id: "profile-1",
  contact: {
    name: "John Doe",
    email: "john@example.com",
    phone: "555-0123",
  },
  summary:
    "Experienced software developer with 5 years of experience building web applications.",
  experiences: [
    {
      id: "exp-1",
      title: "Software Engineer",
      company: "Tech Corp",
      location: "San Francisco, CA",
      startDate: "2020-01",
      endDate: "2024-01",
      current: false,
      description: "Led development of web applications",
      highlights: [
        "Improved performance by 30%",
        "Led team of 5 developers",
      ],
      skills: ["JavaScript", "React", "Node.js"],
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "State University",
      degree: "Bachelor of Science",
      field: "Computer Science",
      startDate: "2016-09",
      endDate: "2020-05",
      highlights: ["Dean's List"],
    },
  ],
  skills: [
    { id: "skill-1", name: "JavaScript", category: "technical", proficiency: "advanced" },
    { id: "skill-2", name: "React", category: "technical", proficiency: "advanced" },
  ],
  projects: [],
  certifications: [],
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
});

describe("calculateFixPriority", () => {
  it("returns high for impact > 5", () => {
    expect(calculateFixPriority(6)).toBe("high");
    expect(calculateFixPriority(10)).toBe("high");
  });

  it("returns medium for impact 2-5", () => {
    expect(calculateFixPriority(2)).toBe("medium");
    expect(calculateFixPriority(5)).toBe("medium");
  });

  it("returns low for impact < 2", () => {
    expect(calculateFixPriority(1)).toBe("low");
    expect(calculateFixPriority(0)).toBe("low");
  });
});

describe("generateFixSuggestions", () => {
  it("generates add_keyword fixes for missing keywords", () => {
    const profile = createMinimalProfile();
    const issues: ATSIssue[] = [];
    const keywords: KeywordAnalysis[] = [
      { keyword: "TypeScript", found: false, frequency: 0, locations: [] },
      { keyword: "React", found: true, frequency: 2, locations: ["skills"] },
    ];

    const fixes = generateFixSuggestions(profile, issues, keywords);

    const addKeywordFixes = fixes.filter((f) => f.type === "add_keyword");
    expect(addKeywordFixes.length).toBeGreaterThanOrEqual(1);
    expect(addKeywordFixes[0].replacementText).toBe("TypeScript");
    expect(addKeywordFixes[0].section).toBe("skills");
  });

  it("generates replace_character fixes for special characters", () => {
    const profile = createMinimalProfile();
    profile.summary = "I\u2019m a developer with \u201Cexperience\u201D";
    const issues: ATSIssue[] = [];
    const keywords: KeywordAnalysis[] = [];

    const fixes = generateFixSuggestions(profile, issues, keywords);

    const charFixes = fixes.filter((f) => f.type === "replace_character");
    expect(charFixes.length).toBeGreaterThanOrEqual(1);
    expect(charFixes.some((f) => f.replacementText === "'")).toBe(true);
  });

  it("generates add_section fixes for missing sections", () => {
    const profile = createMinimalProfile();
    const issues: ATSIssue[] = [
      {
        type: "error",
        category: "structure",
        title: "Missing skills section",
        description: "No skills listed.",
        suggestion: "Add skills.",
      },
    ];
    const keywords: KeywordAnalysis[] = [];

    const fixes = generateFixSuggestions(profile, issues, keywords);

    const sectionFixes = fixes.filter((f) => f.type === "add_section");
    expect(sectionFixes.length).toBeGreaterThanOrEqual(1);
    expect(sectionFixes[0].priority).toBe("high");
  });

  it("generates rewrite_bullet fixes for highlights without metrics", () => {
    const profile = createMinimalProfile();
    profile.experiences[0].highlights = [
      "Worked on frontend development projects",
      "Collaborated with design team on new features",
    ];
    const issues: ATSIssue[] = [];
    const keywords: KeywordAnalysis[] = [];

    const fixes = generateFixSuggestions(profile, issues, keywords);

    const bulletFixes = fixes.filter((f) => f.type === "rewrite_bullet");
    expect(bulletFixes.length).toBeGreaterThanOrEqual(1);
    expect(bulletFixes[0].section).toBe("experience");
    expect(bulletFixes[0].originalText).toBeTruthy();
  });

  it("does not generate rewrite_bullet for highlights with metrics", () => {
    const profile = createMinimalProfile();
    profile.experiences[0].highlights = [
      "Improved performance by 30%",
      "Led team of 5 developers",
    ];
    const issues: ATSIssue[] = [];
    const keywords: KeywordAnalysis[] = [];

    const fixes = generateFixSuggestions(profile, issues, keywords);

    const bulletFixes = fixes.filter((f) => f.type === "rewrite_bullet");
    expect(bulletFixes).toHaveLength(0);
  });

  it("includes at least 4 fix suggestion types", () => {
    // All 4 types: add_keyword, rewrite_bullet, replace_character, add_section
    const allTypes = new Set<string>();

    // Test with profile that triggers all fix types
    const profile = createMinimalProfile();
    profile.summary = "I\u2019m a developer";
    profile.experiences[0].highlights = [
      "Did frontend work for the company",
      "Worked on many projects",
    ];

    const issues: ATSIssue[] = [
      {
        type: "error",
        category: "structure",
        title: "Missing skills section",
        description: "No skills.",
        suggestion: "Add skills.",
      },
      {
        type: "warning",
        category: "content",
        title: "Few action verbs",
        description: "Lacks action verbs.",
        suggestion: "Use action verbs.",
      },
    ];

    const keywords: KeywordAnalysis[] = [
      { keyword: "TypeScript", found: false, frequency: 0, locations: [] },
    ];

    const fixes = generateFixSuggestions(profile, issues, keywords);
    fixes.forEach((f) => allTypes.add(f.type));

    expect(allTypes.size).toBeGreaterThanOrEqual(4);
  });

  it("sorts fixes by estimated impact descending", () => {
    const profile = createMinimalProfile();
    profile.summary = "I\u2019m a developer";
    profile.experiences[0].highlights = ["Worked on stuff for the team"];

    const issues: ATSIssue[] = [
      {
        type: "error",
        category: "structure",
        title: "Missing work experience",
        description: "No work experience.",
        suggestion: "Add experience.",
      },
    ];

    const keywords: KeywordAnalysis[] = [
      { keyword: "AWS", found: false, frequency: 0, locations: [] },
    ];

    const fixes = generateFixSuggestions(profile, issues, keywords);

    for (let i = 1; i < fixes.length; i++) {
      expect(fixes[i].estimatedImpact).toBeLessThanOrEqual(fixes[i - 1].estimatedImpact);
    }
  });

  it("each fix has unique id", () => {
    const profile = createMinimalProfile();
    profile.experiences[0].highlights = ["Worked on stuff", "Did things"];

    const keywords: KeywordAnalysis[] = [
      { keyword: "AWS", found: false, frequency: 0, locations: [] },
      { keyword: "Docker", found: false, frequency: 0, locations: [] },
    ];

    const fixes = generateFixSuggestions(profile, [], keywords);
    const ids = fixes.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("fix suggestions include replacement text", () => {
    const profile = createMinimalProfile();
    const keywords: KeywordAnalysis[] = [
      { keyword: "TypeScript", found: false, frequency: 0, locations: [] },
    ];

    const fixes = generateFixSuggestions(profile, [], keywords);

    for (const fix of fixes) {
      expect(fix.replacementText).toBeTruthy();
    }
  });
});
