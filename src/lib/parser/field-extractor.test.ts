import { describe, it, expect } from "vitest";
import {
  hasDateRange,
  extractDateRange,
  splitDateRange,
  isJobTitle,
  parseDegreeAndField,
  extractGpa,
  extractExperiences,
  extractEducation,
  extractContact,
  extractFieldsFromSections,
} from "./field-extractor";

describe("hasDateRange", () => {
  it("matches 'January 2020 - Present'", () => {
    expect(hasDateRange("Software Engineer  January 2020 - Present")).toBe(true);
  });

  it("matches 'Jan 2020 - Dec 2023'", () => {
    expect(hasDateRange("Jan 2020 - Dec 2023")).toBe(true);
  });

  it("matches '2020 - 2024'", () => {
    expect(hasDateRange("Senior Dev  2020 - 2024")).toBe(true);
  });

  it("matches 'Jan. 2020 - Present'", () => {
    expect(hasDateRange("Jan. 2020 - Present")).toBe(true);
  });

  it("matches '01/2020 - 06/2023'", () => {
    expect(hasDateRange("01/2020 - 06/2023")).toBe(true);
  });

  it("matches em dash: 'Mar 2019 — Current'", () => {
    expect(hasDateRange("Mar 2019 — Current")).toBe(true);
  });

  it("matches en dash: 'Feb 2018 – Aug 2021'", () => {
    expect(hasDateRange("Feb 2018 – Aug 2021")).toBe(true);
  });

  it("matches 'January 2020 to Present'", () => {
    expect(hasDateRange("January 2020 to Present")).toBe(true);
  });

  it("matches abbreviated with tick: Jan '20 - Dec '23", () => {
    expect(hasDateRange("Jan '20 - Dec '23")).toBe(true);
  });

  it("matches season: Summer 2019 - Fall 2020", () => {
    expect(hasDateRange("Summer 2019 - Fall 2020")).toBe(true);
  });

  it("does not match plain text", () => {
    expect(hasDateRange("Built a microservice architecture")).toBe(false);
  });

  it("does not match a standalone year", () => {
    expect(hasDateRange("Founded in 2020")).toBe(false);
  });
});

describe("extractDateRange", () => {
  it("extracts full month date range", () => {
    expect(extractDateRange("Software Engineer  January 2020 - Present")).toBe("January 2020 - Present");
  });

  it("extracts abbreviated date range", () => {
    expect(extractDateRange("Jan 2020 - Dec 2023 | Google")).toBe("Jan 2020 - Dec 2023");
  });

  it("extracts year-only range", () => {
    expect(extractDateRange("2020 - 2024")).toBe("2020 - 2024");
  });

  it("extracts 'to' separator range", () => {
    expect(extractDateRange("March 2019 to Current")).toBe("March 2019 to Current");
  });
});

describe("splitDateRange", () => {
  it("splits dash-separated dates", () => {
    expect(splitDateRange("January 2020 - Present")).toEqual({ start: "January 2020", end: "Present" });
  });

  it("splits em-dash dates", () => {
    expect(splitDateRange("2020 — 2024")).toEqual({ start: "2020", end: "2024" });
  });

  it("splits 'to' dates", () => {
    expect(splitDateRange("March 2019 to Current")).toEqual({ start: "March 2019", end: "Current" });
  });
});

describe("isJobTitle", () => {
  it("detects common titles", () => {
    expect(isJobTitle("Software Engineer")).toBe(true);
    expect(isJobTitle("Senior Product Manager")).toBe(true);
    expect(isJobTitle("Director of Engineering")).toBe(true);
    expect(isJobTitle("Data Analyst")).toBe(true);
    expect(isJobTitle("UX Designer")).toBe(true);
    expect(isJobTitle("Frontend Developer")).toBe(true);
    expect(isJobTitle("Team Lead")).toBe(true);
    expect(isJobTitle("Junior Associate")).toBe(true);
    expect(isJobTitle("Marketing Intern")).toBe(true);
    expect(isJobTitle("VP of Sales")).toBe(true);
    expect(isJobTitle("Principal Architect")).toBe(true);
    expect(isJobTitle("Staff Scientist")).toBe(true);
  });

  it("rejects non-title strings", () => {
    expect(isJobTitle("Google")).toBe(false);
    expect(isJobTitle("San Francisco, CA")).toBe(false);
    expect(isJobTitle("Built a scalable API")).toBe(false);
  });
});

describe("parseDegreeAndField", () => {
  it("parses 'B.S. in Computer Science'", () => {
    const result = parseDegreeAndField("B.S. in Computer Science");
    expect(result.degree).toBe("B.S.");
    expect(result.field).toBe("Computer Science");
  });

  it("parses 'Master of Business Administration'", () => {
    const result = parseDegreeAndField("Master of Business Administration");
    expect(result.degree).toBe("Master of Business Administration");
    expect(result.field).toBe("Business Administration");
  });

  it("parses 'Bachelor of Science in Mechanical Engineering'", () => {
    const result = parseDegreeAndField("Bachelor of Science in Mechanical Engineering");
    expect(result.degree).toBe("Bachelor of Science");
    expect(result.field).toBe("Mechanical Engineering");
  });

  it("parses 'M.A. in Economics'", () => {
    const result = parseDegreeAndField("M.A. in Economics");
    expect(result.degree).toBe("M.A.");
    expect(result.field).toBe("Economics");
  });

  it("parses 'Ph.D. in Physics'", () => {
    const result = parseDegreeAndField("Ph.D. in Physics");
    expect(result.degree).toBe("Ph.D.");
    expect(result.field).toBe("Physics");
  });

  it("parses 'Associate of Arts'", () => {
    const result = parseDegreeAndField("Associate of Arts");
    expect(result.degree).toBe("Associate of Arts");
    expect(result.field).toBe("Arts");
  });

  it("handles MBA without field", () => {
    const result = parseDegreeAndField("MBA");
    expect(result.degree).toBe("MBA");
  });
});

describe("extractGpa", () => {
  it("extracts 'GPA: 3.8'", () => {
    expect(extractGpa("GPA: 3.8")).toBe("3.8");
  });

  it("extracts '3.8/4.0'", () => {
    expect(extractGpa("3.8/4.0")).toBe("3.8");
  });

  it("extracts 'GPA 3.95'", () => {
    expect(extractGpa("GPA 3.95")).toBe("3.95");
  });

  it("converts 'Cum Laude' to approximate GPA", () => {
    expect(extractGpa("Graduated Cum Laude")).toBe("3.5");
  });

  it("converts 'Magna Cum Laude'", () => {
    expect(extractGpa("Magna Cum Laude")).toBe("3.7");
  });

  it("converts 'Summa Cum Laude'", () => {
    expect(extractGpa("Summa Cum Laude")).toBe("3.9");
  });

  it("returns undefined when no GPA found", () => {
    expect(extractGpa("No GPA here")).toBeUndefined();
  });
});

describe("extractExperiences", () => {
  it("extracts experience with full month dates", () => {
    const text = `Software Engineer  January 2020 - Present
Google
- Built scalable APIs
- Led team of 5`;
    const result = extractExperiences(text);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Software Engineer");
    expect(result[0].company).toBe("Google");
    expect(result[0].startDate).toBe("January 2020");
    expect(result[0].endDate).toBe("Present");
    expect(result[0].current).toBe(true);
    expect(result[0].highlights).toHaveLength(2);
  });

  it("extracts experience with abbreviated dates", () => {
    const text = `Product Manager  Jun 2018 - Dec 2022
Meta
- Managed roadmap for 3 products`;
    const result = extractExperiences(text);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Product Manager");
    expect(result[0].company).toBe("Meta");
    expect(result[0].startDate).toBe("Jun 2018");
    expect(result[0].endDate).toBe("Dec 2022");
    expect(result[0].current).toBe(false);
  });

  it("extracts experience with year-only dates", () => {
    const text = `Data Analyst  2020 - 2024
Amazon
- Analyzed customer trends`;
    const result = extractExperiences(text);
    expect(result).toHaveLength(1);
    expect(result[0].startDate).toBe("2020");
    expect(result[0].endDate).toBe("2024");
  });

  it("extracts multiple experiences", () => {
    const text = `Senior Developer  Jan 2022 - Present
Stripe
- Built payment systems

Junior Developer  Jun 2019 - Dec 2021
Shopify
- Maintained storefront`;
    const result = extractExperiences(text);
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe("Senior Developer");
    expect(result[0].company).toBe("Stripe");
    expect(result[1].title).toBe("Junior Developer");
    expect(result[1].company).toBe("Shopify");
  });

  it("handles dates on their own line", () => {
    const text = `2020 - 2023
Software Engineer
Microsoft
- Developed cloud services`;
    const result = extractExperiences(text);
    expect(result).toHaveLength(1);
    expect(result[0].company).toBe("Microsoft");
  });

  it("detects title from job keywords when title/company ambiguous", () => {
    const text = `2021 - Present
Acme Corp
Senior Software Engineer
- Built systems`;
    const result = extractExperiences(text);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Senior Software Engineer");
    expect(result[0].company).toBe("Acme Corp");
  });
});

describe("extractEducation", () => {
  it("extracts degree with field separation", () => {
    const text = `B.S. in Computer Science
MIT
GPA: 3.9`;
    const result = extractEducation(text);
    expect(result).toHaveLength(1);
    expect(result[0].degree).toBe("B.S.");
    expect(result[0].field).toBe("Computer Science");
    expect(result[0].institution).toBe("MIT");
    expect(result[0].gpa).toBe("3.9");
  });

  it("extracts Master of Business Administration", () => {
    const text = `Master of Business Administration
Harvard Business School
Magna Cum Laude`;
    const result = extractEducation(text);
    expect(result).toHaveLength(1);
    expect(result[0].degree).toBe("Master of Business Administration");
    expect(result[0].field).toBe("Business Administration");
    expect(result[0].institution).toBe("Harvard Business School");
    expect(result[0].gpa).toBe("3.7");
  });

  it("extracts Bachelor of Science in Mechanical Engineering", () => {
    const text = `Bachelor of Science in Mechanical Engineering
Stanford University
3.8/4.0`;
    const result = extractEducation(text);
    expect(result).toHaveLength(1);
    expect(result[0].degree).toBe("Bachelor of Science");
    expect(result[0].field).toBe("Mechanical Engineering");
    expect(result[0].gpa).toBe("3.8");
  });

  it("extracts dates from nearby lines", () => {
    const text = `B.A. in English
University of Oregon  2016 - 2020`;
    const result = extractEducation(text);
    expect(result).toHaveLength(1);
    expect(result[0].startDate).toBe("2016");
    expect(result[0].endDate).toBe("2020");
  });

  it("extracts GPA with /4.0 format", () => {
    const text = `M.S. in Data Science
NYU
3.95/4.0`;
    const result = extractEducation(text);
    expect(result).toHaveLength(1);
    expect(result[0].gpa).toBe("3.95");
  });

  it("extracts multiple education entries", () => {
    const text = `MBA
Wharton School

B.S. in Finance
Penn State
GPA: 3.7`;
    const result = extractEducation(text);
    expect(result).toHaveLength(2);
  });

  it("handles cum laude honors as GPA", () => {
    const text = `Bachelor of Arts
Yale University
Summa Cum Laude`;
    const result = extractEducation(text);
    expect(result).toHaveLength(1);
    expect(result[0].gpa).toBe("3.9");
  });
});

describe("extractContact", () => {
  it("extracts email and phone", () => {
    const text = `John Smith
john@example.com
(555) 123-4567
San Francisco, CA`;
    const { contact } = extractContact(text);
    expect(contact.name).toBe("John Smith");
    expect(contact.email).toBe("john@example.com");
    expect(contact.phone?.trim()).toBe("(555) 123-4567");
    expect(contact.location).toBe("San Francisco, CA");
  });

  it("extracts LinkedIn and GitHub", () => {
    const text = `Jane Doe
linkedin.com/in/janedoe
github.com/janedoe`;
    const { contact } = extractContact(text);
    expect(contact.linkedin).toBe("linkedin.com/in/janedoe");
    expect(contact.github).toBe("github.com/janedoe");
  });
});

describe("extractFieldsFromSections", () => {
  it("processes complete resume sections", () => {
    const sections = [
      { type: "contact" as const, content: "John Doe\njohn@email.com\n(555) 111-2222", startIndex: 0, endIndex: 40 },
      { type: "summary" as const, content: "Experienced engineer", startIndex: 41, endIndex: 61 },
      { type: "experience" as const, content: "Software Engineer  Jan 2020 - Present\nGoogle\n- Built APIs", startIndex: 62, endIndex: 120 },
      { type: "education" as const, content: "B.S. in Computer Science\nMIT\nGPA: 3.9", startIndex: 121, endIndex: 160 },
      { type: "skills" as const, content: "JavaScript, TypeScript, Python, Go", startIndex: 161, endIndex: 195 },
    ];
    const result = extractFieldsFromSections(sections);

    expect(result.contact.name).toBe("John Doe");
    expect(result.contact.email).toBe("john@email.com");
    expect(result.summary).toBe("Experienced engineer");
    expect(result.experiences).toHaveLength(1);
    expect(result.experiences[0].title).toBe("Software Engineer");
    expect(result.education).toHaveLength(1);
    expect(result.education[0].field).toBe("Computer Science");
    expect(result.skills.length).toBeGreaterThan(0);
  });

  it("handles missing sections gracefully", () => {
    const result = extractFieldsFromSections([]);
    expect(result.contact.name).toBe("");
    expect(result.experiences).toEqual([]);
    expect(result.education).toEqual([]);
    expect(result.skills).toEqual([]);
    expect(result.projects).toEqual([]);
  });
});
