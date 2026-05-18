import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { LLMConfig } from "@/types";

const mockComplete = vi.fn();

vi.mock("@/lib/llm/client", () => ({
  LLMClient: class MockLLMClient {
    complete = mockComplete;
  },
  parseJSONFromLLM: vi.fn((response: string) => JSON.parse(response)),
}));

// Must import after mock setup
import { smartParseResume } from "./smart-parser";
import { extractTextFromFile } from "./pdf";

const WELL_FORMATTED_RESUME = `John Doe
john@example.com | (555) 123-4567
San Francisco, CA

EXPERIENCE
Software Engineer at Acme Corp
Jan 2020 - Present
- Built scalable APIs serving 1M+ requests/day
- Led migration from monolith to microservices

Junior Developer at StartupCo
Jun 2018 - Dec 2019
- Developed React frontend components

EDUCATION
Bachelor of Science in Computer Science
Stanford University
2014 - 2018
GPA: 3.8

SKILLS
JavaScript, TypeScript, Python, React, Node.js, AWS, Docker, PostgreSQL

PROJECTS
Personal Portfolio
- Built with Next.js and Tailwind CSS
`;

const POORLY_FORMATTED_RESUME = `some text about my career I worked at a company doing things and have a degree`;

const KEVIN_RESUME_EXCERPT = `Kevin Jiang
k69jiang@uwaterloo.ca

EXPERIENCE
Software Engineer — Hamming AI (YC S24) — Austin, Texas, United States    Dec 2025 — Present
Robotics Engineer — Reazon Human Interaction Lab — Akihabara, Tokyo, Japan    Jun 2025 — Aug 2025
• Designed a lightweight (<150 g) exoskeleton wrist controller in Fusion 360 using Dynamixel actuators
• Developed a custom wrist-mounted magnetic AprilTags tracking system using dual cameras, Python, and ROS 2
Hardware Developer — Midnight Sun — Waterloo, Ontario, Canada    Sep 2024 — Apr 2025
• Designed and routed double-layer PCBs for controller subsystem testing and validation in Altium Designer

PROJECTS
Expressive Animatronic Head | Python | PyTorch | ROS2 | Linux | llama.cpp | Whisper | ESP32 | FreeRTOS | Fusion 360
• Integrated Silero (VAD), Whisper (STT), llama.cpp (LLM), and Zonos (TTS) for real-time speech, gaze, and movement sync
• Developed FreeRTOS-based multithreaded firmware on ESP32 for low-latency synchronized actuation of 12 servos
AR Gesture Controlled Robot | Javascript | Python | ROS2 | Jetson Nano | Docker | MQTT | Flask | Fusion 360
• Built a modular 2-wheel drive robot platform with a 3-DOF arm on Nvidia Jetson Nano running ROS2 on Docker

EDUCATION
University of Waterloo — BASc in Computer Engineering    Sept 2024 - Present`;

const PDF_EXTRACTED_KEVIN_RESUME_EXCERPT = `Kevin Jiang
k69jiang@uwaterloo.ca

EXPERIENCE

Software Engineer — Hamming AI (YC S24) — Austin, Texas, United States Dec 2025 — Present

Robotics Engineer — Reazon Human Interaction Lab — Akihabara, Tokyo, Japan Jun 2025 — Aug 2025
●
Designed a lightweight (<150 g) exoskeleton wrist controller in Fusion 360 using Dynamixel actuators for encoder
feedback and haptic response, enabling remote teleoperation of an 8-DOF Damiao robotic arm for RL data collection
●
Developed a custom wrist-mounted magnetic AprilTags tracking system using dual cameras, Python, and ROS 2 for
real-time motion capture, improving tag recognition and bundle pose accuracy by 20% over lab's existing architecture

PROJECTS 

Expressive Animatronic Head  | Python | PyTorch | ROS2 | Linux | llama.cpp | Whisper | ESP32 | FreeRTOS | Fusion 360 
●
Integrated Silero (VAD), Whisper (STT), llama.cpp (LLM), and Zonos (TTS) for real-time speech, gaze, and movement sync
●
Developed FreeRTOS-based multithreaded firmware on ESP32 for low-latency synchronized actuation of 12 servos

EDUCATION

University of Waterloo — BASc in Computer Engineering

Sept 2024 - Present`;

const llmConfig: LLMConfig = {
  provider: "openai",
  apiKey: "test-key",
  model: "gpt-4",
};

describe("smartParseResume", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("parses well-formatted resume without LLM", async () => {
    const result = await smartParseResume(WELL_FORMATTED_RESUME);

    expect(result.llmUsed).toBe(false);
    expect(result.llmSectionsCount).toBe(0);
    expect(result.confidence).toBeGreaterThanOrEqual(0.7);
    expect(result.profile.contact?.name).toBe("John Doe");
    expect(result.profile.contact?.email).toBe("john@example.com");
    expect(result.profile.experiences!.length).toBeGreaterThanOrEqual(1);
    expect(result.profile.skills!.length).toBeGreaterThanOrEqual(4);
    expect(result.sectionsDetected).toContain("experience");
    expect(result.sectionsDetected).toContain("education");
    expect(result.sectionsDetected).toContain("skills");
    expect(result.warnings).toHaveLength(0);
    // LLM should NOT have been called
    expect(mockComplete).not.toHaveBeenCalled();
  });

  it("parses well-formatted resume without LLM even when config provided", async () => {
    const result = await smartParseResume(WELL_FORMATTED_RESUME, llmConfig);

    expect(result.llmUsed).toBe(false);
    expect(result.confidence).toBeGreaterThanOrEqual(0.7);
    expect(mockComplete).not.toHaveBeenCalled();
  });

  it("returns low confidence with warnings for poorly formatted resume (no LLM)", async () => {
    const result = await smartParseResume(POORLY_FORMATTED_RESUME);

    expect(result.confidence).toBeLessThan(0.7);
    expect(result.llmUsed).toBe(false);
    expect(result.warnings.length).toBeGreaterThan(0);
    // Should still have a profile (just lower quality)
    expect(result.profile).toBeDefined();
    expect(result.profile.rawText).toBe(POORLY_FORMATTED_RESUME);
  });

  it("uses targeted LLM for low-confidence sections", async () => {
    // LLM returns parsed data for ambiguous sections
    mockComplete.mockResolvedValueOnce(
      JSON.stringify({
        experience: [
          {
            company: "Some Corp",
            title: "Developer",
            startDate: "2020",
            endDate: "Present",
            current: true,
            description: "Did work",
            highlights: ["Built things"],
          },
        ],
      }),
    );

    const result = await smartParseResume(POORLY_FORMATTED_RESUME, llmConfig);

    // LLM should have been called (for ambiguous sections)
    expect(mockComplete).toHaveBeenCalled();
    expect(result.profile).toBeDefined();
  });

  it("handles LLM failure gracefully", async () => {
    mockComplete.mockRejectedValueOnce(new Error("API rate limit"));

    const result = await smartParseResume(POORLY_FORMATTED_RESUME, llmConfig);

    expect(result.profile).toBeDefined();
    expect(
      result.warnings.some((w) => w.includes("LLM enhancement failed")),
    ).toBe(true);
  });

  it("returns correct metadata shape", async () => {
    const result = await smartParseResume(WELL_FORMATTED_RESUME);

    expect(result).toHaveProperty("profile");
    expect(result).toHaveProperty("confidence");
    expect(result).toHaveProperty("sectionsDetected");
    expect(result).toHaveProperty("llmUsed");
    expect(result).toHaveProperty("llmSectionsCount");
    expect(result).toHaveProperty("warnings");
    expect(typeof result.confidence).toBe("number");
    expect(typeof result.llmUsed).toBe("boolean");
    expect(typeof result.llmSectionsCount).toBe("number");
    expect(Array.isArray(result.sectionsDetected)).toBe(true);
    expect(Array.isArray(result.warnings)).toBe(true);
  });

  it("works with null llmConfig (same as no config)", async () => {
    const result = await smartParseResume(WELL_FORMATTED_RESUME, null);

    expect(result.llmUsed).toBe(false);
    expect(result.profile.contact?.name).toBe("John Doe");
  });

  it("includes rawText in profile", async () => {
    const result = await smartParseResume(WELL_FORMATTED_RESUME);
    expect(result.profile.rawText).toBe(WELL_FORMATTED_RESUME);
  });

  it("extracts contact info even without dedicated contact section", async () => {
    const resumeNoContactSection = `Jane Smith
jane@test.com

EXPERIENCE
Engineer at Corp
2020 - Present`;

    const result = await smartParseResume(resumeNoContactSection);
    expect(result.profile.contact?.name).toBe("Jane Smith");
    expect(result.profile.contact?.email).toBe("jane@test.com");
  });

  it("chunks the Kevin resume example into reusable resume components", async () => {
    const result = await smartParseResume(KEVIN_RESUME_EXCERPT);

    expect(result.profile.contact?.name).toBe("Kevin Jiang");
    expect(result.profile.experiences).toHaveLength(3);
    expect(result.profile.experiences?.[0]).toMatchObject({
      title: "Software Engineer",
      company: "Hamming AI (YC S24)",
      location: "Austin, Texas, United States",
      startDate: "Dec 2025",
      endDate: "Present",
    });
    expect(result.profile.experiences?.[1].highlights).toHaveLength(2);
    expect(result.profile.projects?.[0]).toMatchObject({
      name: "Expressive Animatronic Head",
      technologies: expect.arrayContaining(["Python", "PyTorch", "ROS2"]),
      highlights: expect.arrayContaining([
        expect.stringContaining("Integrated Silero"),
      ]),
    });
    expect(result.profile.education?.[0]).toMatchObject({
      institution: "University of Waterloo",
      degree: "BASc",
      field: "Computer Engineering",
    });
  });

  it("chunks PDF-extracted Kevin resume text with split bullets and header glyphs", async () => {
    const result = await smartParseResume(PDF_EXTRACTED_KEVIN_RESUME_EXCERPT);

    expect(result.sectionsDetected).toEqual(
      expect.arrayContaining(["experience", "projects", "education"]),
    );
    expect(result.profile.experiences).toHaveLength(2);
    expect(result.profile.experiences?.[1].highlights).toHaveLength(2);
    expect(result.profile.experiences?.[1].highlights[0]).toContain(
      "encoder feedback and haptic response",
    );
    expect(result.profile.projects).toHaveLength(1);
    expect(result.profile.projects?.[0]).toMatchObject({
      name: "Expressive Animatronic Head",
      technologies: expect.arrayContaining(["Python", "PyTorch", "ROS2"]),
      highlights: expect.arrayContaining([
        expect.stringContaining("Integrated Silero"),
        expect.stringContaining("FreeRTOS-based"),
      ]),
    });
    expect(result.profile.education?.[0]).toMatchObject({
      institution: "University of Waterloo",
      degree: "BASc",
      field: "Computer Engineering",
      startDate: "Sept 2024",
      endDate: "Present",
    });
  });

  it("parses dogfood markdown resumes with heading markers and ISO month dates", async () => {
    const resume = readFileSync(
      resolve("tests/fixtures/dogfood/edge-case-resume.md"),
      "utf8",
    );

    const result = await smartParseResume(resume);

    expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    expect(result.sectionsDetected).toEqual(
      expect.arrayContaining([
        "contact",
        "summary",
        "experience",
        "skills",
        "education",
      ]),
    );
    expect(result.profile.contact).toMatchObject({
      name: "Riley Chen",
      email: "riley.chen@example.test",
    });
    expect(result.profile.experiences).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: "Product Engineer",
          company: "Northstar Analytics",
          startDate: "2025-02",
          endDate: "Present",
          highlights: expect.arrayContaining([
            expect.stringContaining("42 account managers"),
          ]),
        }),
        expect.objectContaining({
          title: "Career Break",
          startDate: "2023-04",
          endDate: "2025-01",
          highlights: expect.arrayContaining([
            expect.stringContaining("parental leave"),
          ]),
        }),
        expect.objectContaining({
          title: "Operations Analyst",
          company: "Brightline Logistics",
          startDate: "2019-06",
          endDate: "2023-03",
          highlights: expect.arrayContaining([
            expect.stringContaining("$120k per year"),
          ]),
        }),
      ]),
    );
    expect(result.profile.skills?.map((skill) => skill.name)).toEqual(
      expect.arrayContaining(["TypeScript", "React", "GraphQL", "Docker"]),
    );
    expect(result.profile.skills).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "English", category: "language" }),
        expect.objectContaining({ name: "French", category: "language" }),
      ]),
    );
    expect(result.profile.skills?.map((skill) => skill.name)).not.toContain(
      "bilingual English/French.",
    );
    expect(result.profile.education?.[0]).toMatchObject({
      institution: "University of Waterloo",
      degree: "BMath",
      field: "Statistics",
      endDate: "2019",
    });
  });

  it("parses DOCX table-extracted resume text with unusual bullets without LLM", async () => {
    const resume = readFileSync(
      resolve("tests/fixtures/dogfood/table-docx-resume.txt"),
      "utf8",
    );

    const result = await smartParseResume(resume);

    expect(result.llmUsed).toBe(false);
    expect(result.profile.contact?.name).toBe("Alex Rivera");
    expect(
      result.profile.experiences?.map((experience) => experience.company),
    ).toEqual(expect.arrayContaining(["Northstar Labs", "CivicByte Studio"]));
    const northstar = result.profile.experiences?.find(
      (experience) => experience.company === "Northstar Labs",
    );
    expect(northstar).toMatchObject({
      title: "Senior Platform Engineer",
      startDate: "Jan 2022",
      endDate: "Present",
      current: true,
    });
    expect(northstar?.location).toBe("Toronto, ON");
    expect(northstar?.highlights).toEqual(
      expect.arrayContaining([
        expect.stringContaining("release dashboard"),
        expect.stringContaining("manual deployment checks"),
        expect.stringContaining("Mentored 4 engineers"),
      ]),
    );
    expect(result.profile.education?.[0]).toMatchObject({
      institution: "University of Waterloo",
      degree: "BMath",
      field: "Statistics",
      startDate: "2015",
      endDate: "2019",
    });
    expect(result.profile.skills?.map((skill) => skill.name)).toEqual(
      expect.arrayContaining(["TypeScript", "Kubernetes", "OpenTelemetry"]),
    );
  });

  it("extracts and parses the binary DOCX table resume fixture without LLM", async () => {
    const resume = await extractTextFromFile(
      resolve("tests/fixtures/dogfood/table-docx-resume.docx"),
    );

    expect(resume).toContain("Senior Platform Engineer");
    expect(resume).toContain("Northstar Labs");

    const result = await smartParseResume(resume);

    expect(result.llmUsed).toBe(false);
    expect(result.profile.contact?.name).toBe("Alex Rivera");
    expect(result.profile.experiences).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: "Senior Platform Engineer",
          company: "Northstar Labs",
          startDate: "Jan 2022",
          endDate: "Present",
          current: true,
        }),
        expect.objectContaining({
          title: "Developer Experience Engineer",
          company: "CivicByte Studio",
          startDate: "2019",
          endDate: "2021",
        }),
      ]),
    );
    expect(result.profile.education?.[0]).toMatchObject({
      institution: "University of Waterloo",
      degree: "BMath",
      field: "Statistics",
      startDate: "2015",
      endDate: "2019",
    });
    expect(result.profile.skills?.map((skill) => skill.name)).toEqual(
      expect.arrayContaining(["TypeScript", "Kubernetes", "OpenTelemetry"]),
    );
  });

  it("parses portfolio sections as projects without contaminating skills", async () => {
    const result = await smartParseResume(`Alex Lee | alex@example.com

EXPERIENCE
Engineer | Acme | Jan 2020 - Present
- Built x

EDUCATION
B.S. in Computer Science
State University
2020 - 2024

SKILLS
TypeScript, React, SQL

PORTFOLIO
Launch Tracker | Next.js | launch.example.dev/demo
- Built a dashboard`);

    expect(result.profile.projects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Launch Tracker",
          url: "launch.example.dev/demo",
          technologies: expect.arrayContaining(["Next.js"]),
        }),
      ]),
    );
    expect(result.profile.skills?.map((skill) => skill.name)).toEqual([
      "TypeScript",
      "React",
      "SQL",
    ]);
  });
});
