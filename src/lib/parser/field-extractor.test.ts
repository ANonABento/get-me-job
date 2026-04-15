import { describe, it, expect } from "vitest";
import {
  extractContact,
  extractExperiences,
  extractEducation,
  extractSkills,
  extractProjects,
} from "./field-extractor";

// ─── extractContact ─────────────────────────────────────────────────

describe("extractContact", () => {
  it("extracts name, email, phone from standard header", () => {
    const text = `John Doe
john.doe@gmail.com
(555) 123-4567
San Francisco, CA`;

    const result = extractContact(text);
    expect(result.name).toBe("John Doe");
    expect(result.email).toBe("john.doe@gmail.com");
    expect(result.phone).toBe("(555) 123-4567");
    expect(result.location).toBe("San Francisco, CA");
    expect(result.confidence).toBeGreaterThan(0);
  });

  it("extracts LinkedIn and GitHub URLs", () => {
    const text = `Jane Smith
jane@example.com
linkedin.com/in/janesmith
github.com/janesmith`;

    const result = extractContact(text);
    expect(result.name).toBe("Jane Smith");
    expect(result.email).toBe("jane@example.com");
    expect(result.linkedin).toBe("linkedin.com/in/janesmith");
    expect(result.github).toBe("github.com/janesmith");
  });

  it("extracts full URLs with https", () => {
    const text = `Alex Johnson
https://www.linkedin.com/in/alexj
https://github.com/alexj
alex@company.com`;

    const result = extractContact(text);
    expect(result.linkedin).toBe("https://www.linkedin.com/in/alexj");
    expect(result.github).toBe("https://github.com/alexj");
  });

  it("extracts website that isn't LinkedIn or GitHub", () => {
    const text = `Bob Builder
bob@bob.com
linkedin.com/in/bob
github.com/bob
bobbuilds.dev`;

    const result = extractContact(text);
    expect(result.website).toBe("bobbuilds.dev");
  });

  it("detects Remote as location", () => {
    const text = `Remote Developer
dev@example.com
Remote`;

    const result = extractContact(text);
    expect(result.location).toBe("Remote");
  });

  it("handles single-line contact with pipes", () => {
    const text = `Sarah Connor | sarah@skynet.com | (555) 999-0000 | Austin, TX`;

    const result = extractContact(text);
    expect(result.name).toBe("Sarah Connor");
    expect(result.email).toBe("sarah@skynet.com");
    expect(result.phone).toBe("(555) 999-0000");
    expect(result.location).toBe("Austin, TX");
  });

  it("returns empty name when text is empty", () => {
    const result = extractContact("");
    expect(result.name).toBe("");
    expect(result.confidence).toBe(0);
  });

  it("confidence increases with more fields found", () => {
    const minimal = extractContact("John Doe");
    const full = extractContact(`John Doe
john@example.com
(555) 123-4567
New York, NY
linkedin.com/in/john
github.com/john
johndoe.com`);

    expect(full.confidence).toBeGreaterThan(minimal.confidence);
  });
});

// ─── extractExperiences ──────────────────────────────────────────────

describe("extractExperiences", () => {
  it("extracts a single experience entry", () => {
    const text = `Software Engineer
Google
Jan 2020 - Present
Mountain View, CA
• Built scalable microservices handling 1M+ requests/day
• Led migration from monolith to microservice architecture
• Mentored team of 5 junior developers`;

    const results = extractExperiences(text);
    expect(results.length).toBeGreaterThanOrEqual(1);
    const exp = results[0];
    expect(exp.title).toContain("Engineer");
    expect(exp.startDate).toBe("Jan 2020");
    expect(exp.current).toBe(true);
    expect(exp.highlights.length).toBeGreaterThanOrEqual(2);
  });

  it("extracts dates in MM/YYYY format", () => {
    const text = `Data Analyst
Acme Corp
01/2019 - 12/2021
- Analyzed datasets with Python and SQL
- Created automated reporting dashboards`;

    const results = extractExperiences(text);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].startDate).toBe("01/2019");
    expect(results[0].endDate).toBe("12/2021");
    expect(results[0].current).toBe(false);
  });

  it("extracts dates in YYYY - YYYY format", () => {
    const text = `Project Manager
BigCo Inc
2018 - 2022
- Managed 10+ cross-functional projects`;

    const results = extractExperiences(text);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].startDate).toBe("2018");
    expect(results[0].endDate).toBe("2022");
  });

  it("extracts multiple experiences separated by blank lines", () => {
    const text = `Senior Developer
CompanyA
Jan 2021 - Present
• Led frontend development

Junior Developer
CompanyB
Jun 2018 - Dec 2020
• Built React components`;

    const results = extractExperiences(text);
    expect(results.length).toBe(2);
  });

  it("detects location including Remote", () => {
    const text = `DevOps Engineer
Remote
Jan 2022 - Present
• Managed CI/CD pipelines`;

    const results = extractExperiences(text);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].location).toBe("Remote");
  });

  it("returns empty array for empty text", () => {
    expect(extractExperiences("")).toEqual([]);
  });

  it("assigns confidence based on matched fields", () => {
    const text = `Software Engineer
Google
Jan 2020 - Present
Mountain View, CA
• Built services`;

    const results = extractExperiences(text);
    expect(results[0].confidence).toBeGreaterThan(0.5);
  });
});

// ─── extractEducation ────────────────────────────────────────────────

describe("extractEducation", () => {
  it("extracts degree, field, and institution", () => {
    const text = `Massachusetts Institute of Technology
Bachelor of Science in Computer Science
2016 - 2020
GPA: 3.9/4.0`;

    const results = extractEducation(text);
    expect(results.length).toBeGreaterThanOrEqual(1);
    const edu = results[0];
    expect(edu.degree).toMatch(/Bachelor/i);
    expect(edu.field).toContain("Computer Science");
    expect(edu.gpa).toContain("3.9");
  });

  it("handles B.S. abbreviation", () => {
    const text = `Stanford University
B.S. in Electrical Engineering
2014 - 2018`;

    const results = extractEducation(text);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].degree).toMatch(/B\.?S\.?/);
  });

  it("handles MBA", () => {
    const text = `Harvard Business School
MBA
2020 - 2022
• Dean's List`;

    const results = extractEducation(text);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].degree).toBe("MBA");
    expect(results[0].highlights).toContain("Dean's List");
  });

  it("extracts GPA in different formats", () => {
    const text1 = `University of Washington
B.A. in Economics
GPA: 3.7`;

    const text2 = `UCLA
M.S. in Data Science
3.85/4.0`;

    const r1 = extractEducation(text1);
    const r2 = extractEducation(text2);
    expect(r1[0].gpa).toBe("3.7");
    expect(r2[0].gpa).toContain("3.85");
  });

  it("extracts PhD", () => {
    const text = `Carnegie Mellon University
Ph.D. in Machine Learning
2015 - 2020`;

    const results = extractEducation(text);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].degree).toMatch(/Ph\.?D/);
  });

  it("returns empty for text without degree keywords", () => {
    const text = `Some random text without education info
Just a regular paragraph`;

    const results = extractEducation(text);
    expect(results).toEqual([]);
  });

  it("handles multiple education entries", () => {
    const text = `MIT
M.S. in Computer Science
2020 - 2022

UC Berkeley
B.S. in Computer Science
2016 - 2020`;

    const results = extractEducation(text);
    expect(results.length).toBe(2);
  });
});

// ─── extractSkills ──────────────────────────────────────────────────

describe("extractSkills", () => {
  it("extracts comma-separated skills", () => {
    const text = `JavaScript, TypeScript, Python, React, Node.js`;

    const results = extractSkills(text);
    expect(results.length).toBeGreaterThanOrEqual(5);
    const names = results.map((s) => s.name.toLowerCase());
    expect(names).toContain("javascript");
    expect(names).toContain("typescript");
    expect(names).toContain("react");
  });

  it("categorizes programming languages as technical", () => {
    const text = `Python, Java, Go, Rust`;

    const results = extractSkills(text);
    for (const skill of results) {
      expect(skill.category).toBe("technical");
    }
  });

  it("categorizes tools correctly", () => {
    const text = `Docker, Kubernetes, AWS, Terraform`;

    const results = extractSkills(text);
    for (const skill of results) {
      expect(skill.category).toBe("tool");
    }
  });

  it("categorizes soft skills", () => {
    const text = `Leadership, Communication, Teamwork, Problem-solving`;

    const results = extractSkills(text);
    for (const skill of results) {
      expect(skill.category).toBe("soft");
    }
  });

  it("handles pipe-separated skills", () => {
    const text = `React | Angular | Vue | Svelte`;

    const results = extractSkills(text);
    expect(results.length).toBe(4);
  });

  it("handles bullet-separated skills", () => {
    const text = `• Git • Docker • Jenkins • AWS`;

    const results = extractSkills(text);
    expect(results.length).toBeGreaterThanOrEqual(4);
  });

  it("removes category headers", () => {
    const text = `Languages: Python, JavaScript, Go
Frameworks: React, Django, Express
Tools: Docker, AWS, Git`;

    const results = extractSkills(text);
    const names = results.map((s) => s.name.toLowerCase());
    expect(names).not.toContain("languages");
    expect(names).not.toContain("frameworks");
    expect(names).not.toContain("tools");
    expect(names).toContain("python");
    expect(names).toContain("react");
    expect(names).toContain("docker");
  });

  it("deduplicates skills", () => {
    const text = `Python, python, PYTHON`;

    const results = extractSkills(text);
    expect(results.length).toBe(1);
  });

  it("assigns higher confidence to known skills", () => {
    const text = `Python, SomeObscureTool`;

    const results = extractSkills(text);
    const python = results.find(
      (s) => s.name.toLowerCase() === "python"
    );
    const obscure = results.find(
      (s) => s.name.toLowerCase() === "someobscuretool"
    );
    expect(python!.confidence).toBeGreaterThan(obscure!.confidence);
  });

  it("returns empty for empty text", () => {
    expect(extractSkills("")).toEqual([]);
  });
});

// ─── extractProjects ─────────────────────────────────────────────────

describe("extractProjects", () => {
  it("extracts project with name and bullets", () => {
    const text = `Task Manager App
• Built a full-stack task management application
• Implemented real-time updates with WebSocket
Technologies: React, Node.js, PostgreSQL`;

    const results = extractProjects(text);
    expect(results.length).toBeGreaterThanOrEqual(1);
    const proj = results[0];
    expect(proj.name).toContain("Task Manager");
    expect(proj.highlights.length).toBeGreaterThanOrEqual(2);
    expect(proj.technologies).toContain("React");
    expect(proj.technologies).toContain("Node.js");
  });

  it("extracts project URL", () => {
    const text = `Portfolio Website
https://github.com/user/portfolio
• Personal portfolio built with Next.js`;

    const results = extractProjects(text);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].url).toContain("github.com");
  });

  it("extracts technologies from bracket notation", () => {
    const text = `Chat Application [React, Socket.io, MongoDB]
• Real-time messaging app with 1000+ users`;

    const results = extractProjects(text);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].technologies.length).toBeGreaterThanOrEqual(2);
  });

  it("handles multiple projects", () => {
    const text = `E-commerce Platform
• Built online store with payment integration

Blog Engine
• Static site generator with markdown support`;

    const results = extractProjects(text);
    expect(results.length).toBe(2);
  });

  it("returns empty for empty text", () => {
    expect(extractProjects("")).toEqual([]);
  });

  it("assigns confidence based on matched fields", () => {
    const text = `Cool Project
https://github.com/user/cool
• Amazing description
Technologies: React, TypeScript`;

    const results = extractProjects(text);
    expect(results[0].confidence).toBeGreaterThan(0.5);
  });
});

// ─── Confidence scoring ──────────────────────────────────────────────

describe("confidence scoring", () => {
  it("contact confidence is between 0 and 1", () => {
    const result = extractContact("Any text");
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });

  it("experience confidence is between 0 and 1", () => {
    const results = extractExperiences(`Engineer
SomeCo
2020 - 2023
• Did things`);

    for (const r of results) {
      expect(r.confidence).toBeGreaterThanOrEqual(0);
      expect(r.confidence).toBeLessThanOrEqual(1);
    }
  });

  it("education confidence is between 0 and 1", () => {
    const results = extractEducation(`B.S. in CS
2020`);

    for (const r of results) {
      expect(r.confidence).toBeGreaterThanOrEqual(0);
      expect(r.confidence).toBeLessThanOrEqual(1);
    }
  });

  it("skill confidence is between 0 and 1", () => {
    const results = extractSkills("Python, React, Leadership");
    for (const r of results) {
      expect(r.confidence).toBeGreaterThanOrEqual(0);
      expect(r.confidence).toBeLessThanOrEqual(1);
    }
  });

  it("project confidence is between 0 and 1", () => {
    const results = extractProjects(`My Project
• A description`);

    for (const r of results) {
      expect(r.confidence).toBeGreaterThanOrEqual(0);
      expect(r.confidence).toBeLessThanOrEqual(1);
    }
  });
});

// ─── Integration-style: realistic resume section ─────────────────────

describe("realistic resume sections", () => {
  it("parses a typical contact header", () => {
    const text = `JOHN A. SMITH
Software Engineer | john.smith@email.com | (415) 555-1234
San Francisco, CA | linkedin.com/in/johnsmith | github.com/johnsmith`;

    const contact = extractContact(text);
    expect(contact.name).toBe("JOHN A. SMITH");
    expect(contact.email).toBe("john.smith@email.com");
    expect(contact.phone).toBe("(415) 555-1234");
    expect(contact.location).toBe("San Francisco, CA");
    expect(contact.linkedin).toBe("linkedin.com/in/johnsmith");
    expect(contact.github).toBe("github.com/johnsmith");
    expect(contact.confidence).toBeGreaterThan(0.7);
  });

  it("parses a realistic experience section", () => {
    const text = `Senior Software Engineer
Meta (formerly Facebook)
July 2021 - Present
Menlo Park, CA
• Architected and built real-time notification system serving 2B+ users
• Reduced API latency by 40% through caching and query optimization
• Led team of 8 engineers in platform reliability initiative

Software Engineer
Stripe
March 2018 - June 2021
San Francisco, CA
• Developed payment processing APIs handling $50B+ annually
• Implemented fraud detection pipeline reducing false positives by 30%`;

    const experiences = extractExperiences(text);
    expect(experiences.length).toBe(2);
    expect(experiences[0].title).toContain("Engineer");
    expect(experiences[0].current).toBe(true);
    expect(experiences[1].current).toBe(false);
    expect(experiences[0].highlights.length).toBe(3);
    expect(experiences[1].highlights.length).toBe(2);
  });

  it("parses a realistic education section", () => {
    const text = `Stanford University
Master of Science in Computer Science
2016 - 2018
GPA: 3.95/4.0
• Specialization in Machine Learning

University of California, Berkeley
Bachelor of Science in Electrical Engineering & Computer Science
2012 - 2016
• Magna Cum Laude`;

    const education = extractEducation(text);
    expect(education.length).toBe(2);
    expect(education[0].degree).toMatch(/Master/);
    expect(education[0].gpa).toContain("3.95");
    expect(education[1].degree).toMatch(/Bachelor/);
  });

  it("parses a realistic skills section", () => {
    const text = `Languages: Python, TypeScript, Go, Rust, SQL
Frameworks: React, Next.js, FastAPI, Django
Cloud & DevOps: AWS, Docker, Kubernetes, Terraform, CI/CD
Databases: PostgreSQL, Redis, MongoDB, Elasticsearch
Soft Skills: Leadership, Agile, Mentoring`;

    const skills = extractSkills(text);
    expect(skills.length).toBeGreaterThanOrEqual(15);

    const technical = skills.filter((s) => s.category === "technical");
    const tools = skills.filter((s) => s.category === "tool");
    const soft = skills.filter((s) => s.category === "soft");

    expect(technical.length).toBeGreaterThan(0);
    expect(tools.length).toBeGreaterThan(0);
    expect(soft.length).toBeGreaterThan(0);
  });
});
