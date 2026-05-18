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
  extractSkills,
  extractFieldsFromSections,
} from "./field-extractor";

describe("hasDateRange", () => {
  it("matches 'January 2020 - Present'", () => {
    expect(hasDateRange("Software Engineer  January 2020 - Present")).toBe(
      true,
    );
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
    expect(extractDateRange("Software Engineer  January 2020 - Present")).toBe(
      "January 2020 - Present",
    );
  });

  it("extracts abbreviated date range", () => {
    expect(extractDateRange("Jan 2020 - Dec 2023 | Google")).toBe(
      "Jan 2020 - Dec 2023",
    );
  });

  it("extracts year-only range", () => {
    expect(extractDateRange("2020 - 2024")).toBe("2020 - 2024");
  });

  it("extracts 'to' separator range", () => {
    expect(extractDateRange("March 2019 to Current")).toBe(
      "March 2019 to Current",
    );
  });
});

describe("splitDateRange", () => {
  it("splits dash-separated dates", () => {
    expect(splitDateRange("January 2020 - Present")).toEqual({
      start: "January 2020",
      end: "Present",
    });
  });

  it("splits em-dash dates", () => {
    expect(splitDateRange("2020 — 2024")).toEqual({
      start: "2020",
      end: "2024",
    });
  });

  it("splits 'to' dates", () => {
    expect(splitDateRange("March 2019 to Current")).toEqual({
      start: "March 2019",
      end: "Current",
    });
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
    const result = parseDegreeAndField(
      "Bachelor of Science in Mechanical Engineering",
    );
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
  it("does not steal a wrapped-bullet tail as the next experience's title", () => {
    // Regression: pdf-extracted resume bullets often wrap to multiple
    // lines without bullet markers. The last line of a wrapped bullet
    // can sit directly above the next experience's header — and the
    // "short non-bullet line + dates below = pending header" heuristic
    // used to steal it. Verified against KevinJiang_Resume.pdf where
    // the Hamming AI bullet "Stabilized production reliability ...
    // webhook stall guards" wrapped, and "resolving P2002 races, ...
    // and webhook stall guards" got glued onto the next experience's
    // title.
    const text = `Software Engineer — Hamming AI — Austin, TX Dec 2025 — Apr 2026
• Stabilized production reliability with phased chunked writes for long agent-flow transactions, idempotent creates
resolving P2002 races, transaction-timeout fixes for large test suites, and webhook stall guards
Robotics Engineer — Reazon Human Interaction Lab — Tokyo, Japan Jun 2025 — Aug 2025
• Designed a lightweight exoskeleton wrist controller`;
    const result = extractExperiences(text);
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe("Software Engineer");
    expect(result[0].highlights[0]).toContain("webhook stall guards");
    expect(result[1].title).toBe("Robotics Engineer");
    expect(result[1].title).not.toContain("P2002");
  });

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

  it("extracts compact resume rows with title, company, location, and dates", () => {
    const text = `Software Engineer — Hamming AI (YC S24) — Austin, Texas, United States    Dec 2025 — Present
Robotics Engineer — Reazon Human Interaction Lab — Akihabara, Tokyo, Japan    Jun 2025 — Aug 2025
• Designed a lightweight exoskeleton wrist controller
• Developed a custom wrist-mounted AprilTags tracking system`;

    const result = extractExperiences(text);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      title: "Software Engineer",
      company: "Hamming AI (YC S24)",
      location: "Austin, Texas, United States",
      startDate: "Dec 2025",
      endDate: "Present",
      current: true,
    });
    expect(result[1]).toMatchObject({
      title: "Robotics Engineer",
      company: "Reazon Human Interaction Lab",
      location: "Akihabara, Tokyo, Japan",
      startDate: "Jun 2025",
      endDate: "Aug 2025",
      highlights: [
        "Designed a lightweight exoskeleton wrist controller",
        "Developed a custom wrist-mounted AprilTags tracking system",
      ],
    });
  });

  it("attaches PDF-extracted standalone bullet markers to the following wrapped lines", () => {
    const text = `Robotics Engineer — Reazon Human Interaction Lab — Akihabara, Tokyo, Japan Jun 2025 — Aug 2025
●
Designed a lightweight exoskeleton wrist controller in Fusion 360 using Dynamixel actuators for encoder
feedback and haptic response
●
Developed a custom wrist-mounted AprilTags tracking system using dual cameras, Python, and ROS 2
Hardware Developer — Midnight Sun — Waterloo, Ontario, Canada Sep 2024 — Apr 2025
●
Designed and routed double-layer PCBs`;

    const result = extractExperiences(text);

    expect(result).toHaveLength(2);
    expect(result[0].highlights).toEqual([
      "Designed a lightweight exoskeleton wrist controller in Fusion 360 using Dynamixel actuators for encoder feedback and haptic response",
      "Developed a custom wrist-mounted AprilTags tracking system using dual cameras, Python, and ROS 2",
    ]);
    expect(result[1].highlights).toEqual([
      "Designed and routed double-layer PCBs",
    ]);
  });

  it("does not let embedded link URLs pollute experience headers", () => {
    const text = `Robotics Engineer — Reazon Human Interaction Lab — Akihabara, Tokyo, Japan https://openarm.dev/ Jun 2025 — Aug 2025
• Designed a lightweight exoskeleton wrist controller`;

    const result = extractExperiences(text);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      title: "Robotics Engineer",
      company: "Reazon Human Interaction Lab",
      location: "Akihabara, Tokyo, Japan",
      startDate: "Jun 2025",
      endDate: "Aug 2025",
    });
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

  it("extracts Waterloo-style BASc education rows", () => {
    const text = `University of Waterloo — BASc in Computer Engineering    Sept 2024 - Present`;
    const result = extractEducation(text);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      institution: "University of Waterloo",
      degree: "BASc",
      field: "Computer Engineering",
      startDate: "Sept 2024",
      endDate: "Present",
    });
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

  it("extracts name from the first pipe-delimited contact line", () => {
    const text = `Kevin Jiang | Dual Citizen (U.S. & Canada) | k69jiang@uwaterloo.ca
Kevin Jiang Portfolio`;
    const { contact } = extractContact(text);
    expect(contact.name).toBe("Kevin Jiang");
  });
});

describe("extractSkills", () => {
  it("extracts skills from labeled category lines", () => {
    const skills = extractSkills(
      "Languages: Python, JavaScript\nFrameworks: React, Vue\nTools: Docker, Git",
    );
    const names = skills.map((skill) => skill.name);

    expect(names).toEqual([
      "Python",
      "JavaScript",
      "React",
      "Vue",
      "Docker",
      "Git",
    ]);
    expect(names).not.toContain("Languages");
    expect(names).not.toContain("Frameworks");
    expect(names).not.toContain("Tools");
    expect(names).not.toContain("Languages: Python");
    expect(skills.find((skill) => skill.name === "Python")?.category).toBe(
      "language",
    );
    expect(skills.find((skill) => skill.name === "Docker")?.category).toBe(
      "tool",
    );
    expect(skills.find((skill) => skill.name === "React")?.category).toBe(
      "technical",
    );
  });

  it("keeps flat comma-separated skill lists working", () => {
    expect(extractSkills("JavaScript, TypeScript, Python, Go")).toHaveLength(4);
  });

  it("dedupes skills case-insensitively", () => {
    expect(extractSkills("Python, Python, python")).toHaveLength(1);
  });

  it("keeps punctuation-heavy language names", () => {
    expect(
      extractSkills("C++, C#, Node.js").map((skill) => skill.name),
    ).toEqual(["C++", "C#", "Node.js"]);
  });
});

describe("extractFieldsFromSections project parsing", () => {
  it("stores project URLs from header links instead of treating them as stack items", () => {
    const result = extractFieldsFromSections([
      {
        type: "projects",
        startIndex: 0,
        endIndex: 2,
        content: `Expressive Animatronic Head | Python | PyTorch | ROS2 | Linux | llama.cpp | Whisper | ESP32 | FreeRTOS | Fusion 360 https://github.com/MaidReal/Head
- Integrated Silero for real-time speech, gaze, and movement sync
One Handed Keyboard | C | STM32 | GPIO | UART | FSM | 3D-Printing | OnShape https://github.com/k69jiang/keyboard
- Programmed STM32 microcontrollers to process GPIO-based key inputs`,
      },
    ]);

    expect(result.projects).toHaveLength(2);
    expect(result.projects[0]).toMatchObject({
      name: "Expressive Animatronic Head",
      url: "https://github.com/MaidReal/Head",
      technologies: expect.arrayContaining(["llama.cpp", "Fusion 360"]),
    });
    expect(result.projects[0].technologies).not.toContain(
      "https://github.com/MaidReal/Head",
    );
    expect(result.projects[1]).toMatchObject({
      name: "One Handed Keyboard",
      url: "https://github.com/k69jiang/keyboard",
      technologies: expect.arrayContaining(["C", "STM32", "GPIO"]),
      highlights: expect.arrayContaining([
        "Programmed STM32 microcontrollers to process GPIO-based key inputs",
      ]),
    });
    expect(result.projects[1].technologies).not.toContain(
      "https://github.com/k69jiang/keyboard",
    );
  });

  it("keeps a long linked project header from being merged into the previous bullet", () => {
    const result = extractFieldsFromSections([
      {
        type: "projects",
        startIndex: 0,
        endIndex: 5,
        content: `One Handed Keyboard | C | STM32 | GPIO | UART | FSM | 3D-Printing | OnShape https://github.com/ANonABento/SeqKeyTransmitter
- Combined a trie and fuzzy algorithm for prefix and approximate autocomplete system through a list of 10,000 words
VR Haptic Gloves | C++ | ESP32 | Arduino | 3D-Printing | OnShape | Cura | Soldering https://docs.google.com/document/d/e/2PACX-1vRLroLu5HL4aumIrzk0m8yt12p1fcz71PYzMZr4-zGnSM3_nHtHXJBuG4p2ZwJUUarX05p-KjZQPZsa/pub
- Built an affordable full-finger tracking glove with servo-assisted haptics`,
      },
    ]);

    expect(result.projects).toHaveLength(2);
    expect(result.projects[0]).toMatchObject({
      name: "One Handed Keyboard",
      highlights: [
        "Combined a trie and fuzzy algorithm for prefix and approximate autocomplete system through a list of 10,000 words",
      ],
    });
    expect(result.projects[1]).toMatchObject({
      name: "VR Haptic Gloves",
      url: "https://docs.google.com/document/d/e/2PACX-1vRLroLu5HL4aumIrzk0m8yt12p1fcz71PYzMZr4-zGnSM3_nHtHXJBuG4p2ZwJUUarX05p-KjZQPZsa/pub",
      highlights: [
        "Built an affordable full-finger tracking glove with servo-assisted haptics",
      ],
    });
  });

  it("keeps bare custom-domain project URLs without treating technology names as links", () => {
    const result = extractFieldsFromSections([
      {
        type: "projects",
        startIndex: 0,
        endIndex: 2,
        content: `Launch Tracker | Next.js | llama.cpp | launch.example.dev/demo
- Built a dashboard`,
      },
    ]);

    expect(result.projects[0]).toMatchObject({
      name: "Launch Tracker",
      url: "launch.example.dev/demo",
      technologies: expect.arrayContaining(["Next.js", "llama.cpp"]),
    });
    expect(result.projects[0].technologies).not.toContain(
      "launch.example.dev/demo",
    );
  });
});

describe("extractFieldsFromSections", () => {
  it("processes complete resume sections", () => {
    const sections = [
      {
        type: "contact" as const,
        content: "John Doe\njohn@email.com\n(555) 111-2222",
        startIndex: 0,
        endIndex: 40,
      },
      {
        type: "summary" as const,
        content: "Experienced engineer",
        startIndex: 41,
        endIndex: 61,
      },
      {
        type: "experience" as const,
        content: "Software Engineer  Jan 2020 - Present\nGoogle\n- Built APIs",
        startIndex: 62,
        endIndex: 120,
      },
      {
        type: "education" as const,
        content: "B.S. in Computer Science\nMIT\nGPA: 3.9",
        startIndex: 121,
        endIndex: 160,
      },
      {
        type: "skills" as const,
        content: "JavaScript, TypeScript, Python, Go",
        startIndex: 161,
        endIndex: 195,
      },
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

  it("extracts repeated sections instead of only the first occurrence", () => {
    const result = extractFieldsFromSections([
      {
        type: "experience" as const,
        content: "Engineer | Acme | Jan 2020 - Present\n- Built x",
        startIndex: 0,
        endIndex: 50,
      },
      {
        type: "experience" as const,
        content: "Volunteer | Community Lab | Jan 2021 - Jan 2022\n- Helped y",
        startIndex: 51,
        endIndex: 110,
      },
    ]);

    expect(result.experiences.map((experience) => experience.company)).toEqual([
      "Acme",
      "Community Lab",
    ]);
  });
});
