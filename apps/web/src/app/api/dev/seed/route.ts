import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAuthError, requireAuth } from "@/lib/auth";
import { createJob } from "@/lib/db/jobs";
import { createEmailDraft } from "@/lib/db/email-drafts";
import { insertBankEntries } from "@/lib/db/profile-bank";
import { getDb } from "@/lib/db";
import { runDevCleanSlate } from "@/lib/dev/clean-slate";
import { generateId } from "@/lib/utils";
import type { InsertBankEntry } from "@/lib/db/profile-bank";
import type { JobDescription } from "@/types";

export const dynamic = "force-dynamic";

const DEV_TOOLS_HEADER = "x-slothing-dev-tools";
const DEV_TOOLS_HEADER_VALUE = "enabled";

const seedRequestSchema = z.object({
  preset: z.enum(["empty", "opportunities", "components", "full"]),
});

type SeedPreset = z.infer<typeof seedRequestSchema>["preset"];

interface SeedSummary {
  opportunities: number;
  components: number;
  drafts: number;
  atsScans: number;
}

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (request.headers.get(DEV_TOOLS_HEADER) !== DEV_TOOLS_HEADER_VALUE) {
    return NextResponse.json(
      { error: "Dev tools are not enabled for this request." },
      { status: 403 },
    );
  }

  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = seedRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const reset = await runDevCleanSlate(authResult.userId);
    const seeded = seedPreset(parsed.data.preset, authResult.userId);

    return NextResponse.json({
      success: true,
      preset: parsed.data.preset,
      userId: authResult.userId,
      reset,
      seeded,
    });
  } catch (error) {
    console.error("[dev-seed] seed failed:", error);
    return NextResponse.json(
      { error: "Failed to seed local dev data." },
      { status: 500 },
    );
  }
}

function seedPreset(preset: SeedPreset, userId: string): SeedSummary {
  const summary: SeedSummary = {
    opportunities: 0,
    components: 0,
    drafts: 0,
    atsScans: 0,
  };

  if (preset === "empty") return summary;

  if (preset === "opportunities" || preset === "full") {
    const jobs = seedOpportunities(userId);
    summary.opportunities = jobs.length;

    if (preset === "full") {
      summary.drafts = seedDrafts(userId, jobs);
      summary.atsScans = seedAtsScans(userId, jobs);
    }
  }

  if (preset === "components" || preset === "full") {
    summary.components = seedComponents(userId);
  }

  return summary;
}

function seedOpportunities(userId: string): JobDescription[] {
  const jobs: Array<Omit<JobDescription, "id" | "createdAt">> = [
    {
      title: "AI Toolchain Software Developer",
      company: "onsemi",
      location: "Waterloo, Ontario, Canada",
      type: "internship",
      remote: false,
      description:
        "Build internal automation for silicon validation, CI pipelines, and developer tooling.",
      requirements: ["Python", "Jenkins", "Linux"],
      responsibilities: ["Automate validation workflows", "Improve CI signal"],
      keywords: ["python", "jenkins"],
      url: "https://example.com/onsemi-toolchain",
      status: "pending",
      deadline: daysFromNow(1),
      notes: "Imported from dev seed.",
    },
    {
      title: "Senior Product Engineer",
      company: "ExampleWorks",
      location: "Toronto, ON, Canada",
      type: "full-time",
      remote: true,
      description:
        "Own user-facing product surfaces across dashboard workflows and collaboration features.",
      requirements: ["TypeScript", "React", "PostgreSQL"],
      responsibilities: ["Ship product experiments", "Improve performance"],
      keywords: ["typescript", "react", "node.js"],
      url: "https://example.com/exampleworks-product",
      status: "saved",
      deadline: daysFromNow(9),
      notes: "Good saved-card fixture.",
    },
    {
      title: "Robotics Platform Intern",
      company: "Reason Human Interaction Lab",
      location: "Akihabara, Tokyo, Japan",
      type: "internship",
      remote: false,
      description:
        "Prototype ROS2 tools for teleoperation, haptic feedback, and gesture control.",
      requirements: ["ROS2", "Python", "C++"],
      responsibilities: ["Build prototypes", "Run user studies"],
      keywords: ["ros2", "python", "c++"],
      url: "https://example.com/reason-robotics",
      status: "applied",
      appliedAt: daysAgo(4),
      deadline: daysFromNow(14),
    },
    {
      title: "Front-End Developer",
      company: "Cenith Energy Corporation",
      location: "Toronto, Ontario, Canada",
      type: "internship",
      remote: false,
      description:
        "Build accessible internal dashboards and campaign tooling for operations teams.",
      requirements: ["React", "Figma", "Accessibility"],
      responsibilities: ["Implement dashboards", "Refine component library"],
      keywords: ["react", "accessibility", "figma"],
      url: "https://example.com/cenith-frontend",
      status: "interviewing",
      appliedAt: daysAgo(10),
      deadline: daysFromNow(5),
    },
    {
      title: "Hardware Developer",
      company: "Midnight Sun",
      location: "Waterloo, Ontario, Canada",
      type: "internship",
      remote: false,
      description:
        "Design and validate embedded controller boards for electric vehicle subsystems.",
      requirements: ["Altium", "STM32", "C"],
      responsibilities: ["Route boards", "Validate firmware interfaces"],
      keywords: ["altium", "stm32", "embedded"],
      url: "https://example.com/midnight-hardware",
      status: "offer",
      appliedAt: daysAgo(22),
      deadline: daysFromNow(20),
    },
    {
      title: "Data Platform Co-op",
      company: "Northstar Systems",
      location: "Remote",
      type: "internship",
      remote: true,
      description:
        "Maintain data ingestion pipelines and dashboards for customer success teams.",
      requirements: ["SQL", "Python", "Airflow"],
      responsibilities: ["Monitor ETL", "Build reporting tables"],
      keywords: ["sql", "python", "airflow"],
      url: "https://example.com/northstar-data",
      status: "rejected",
      appliedAt: daysAgo(18),
      deadline: daysAgo(2),
    },
  ];

  return jobs.map((job) => createJob(job, userId));
}

function seedComponents(userId: string): number {
  const projectId = generateId();
  const hardwareId = generateId();
  const experienceId = generateId();
  const entries: InsertBankEntry[] = [
    {
      id: projectId,
      category: "project",
      content: {
        name: "Expressive Animatronic Head",
        technologies: [
          "Python",
          "PyTorch",
          "ROS2",
          "Linux",
          "llama.cpp",
          "Whisper",
          "ESP32",
          "FreeRTOS",
          "Fusion 360",
        ],
        childCount: 3,
      },
      confidenceScore: 0.9,
    },
    {
      category: "bullet",
      parentId: projectId,
      componentType: "project",
      componentOrder: 0,
      content: {
        parentId: projectId,
        parentType: "project",
        order: 0,
        description:
          "Integrated Silero VAD, Whisper STT, llama.cpp LLM, and Zonos TTS for real-time speech and movement sync.",
      },
      confidenceScore: 0.92,
    },
    {
      category: "bullet",
      parentId: projectId,
      componentType: "project",
      componentOrder: 1,
      content: {
        parentId: projectId,
        parentType: "project",
        order: 1,
        description:
          "Enabled expressive servo behaviors with waveform-driven lip sync, brow raises, and gaze shifts.",
      },
      confidenceScore: 0.9,
    },
    {
      category: "bullet",
      parentId: projectId,
      componentType: "project",
      componentOrder: 2,
      content: {
        parentId: projectId,
        parentType: "project",
        order: 2,
        description:
          "Optimized local inference to run multimodal pipeline steps within limited VRAM.",
      },
      confidenceScore: 0.88,
    },
    {
      id: hardwareId,
      category: "project",
      content: {
        name: "VR Haptic Gloves",
        technologies: ["C++", "ESP32", "Arduino", "OnShape", "Soldering"],
        childCount: 2,
      },
      confidenceScore: 0.86,
    },
    {
      category: "bullet",
      parentId: hardwareId,
      componentType: "project",
      componentOrder: 0,
      content: {
        parentId: hardwareId,
        parentType: "project",
        order: 0,
        description:
          "Built lightweight haptic actuators for finger-level force feedback during teleoperation demos.",
      },
      confidenceScore: 0.86,
    },
    {
      category: "bullet",
      parentId: hardwareId,
      componentType: "project",
      componentOrder: 1,
      content: {
        parentId: hardwareId,
        parentType: "project",
        order: 1,
        description:
          "Designed modular housings and wiring paths for quick controller maintenance.",
      },
      confidenceScore: 0.84,
    },
    {
      id: experienceId,
      category: "experience",
      content: {
        company: "Hamming AI",
        title: "Software Engineer",
        location: "Austin, Texas, United States",
        startDate: "Dec 2025",
        endDate: "Present",
        technologies: ["TypeScript", "Python", "LLM evals"],
        childCount: 2,
      },
      confidenceScore: 0.94,
    },
    {
      category: "bullet",
      parentId: experienceId,
      componentType: "experience",
      componentOrder: 0,
      content: {
        parentId: experienceId,
        parentType: "experience",
        order: 0,
        description:
          "Shipped red-teaming infrastructure with replayable traces and category-level test matrices.",
      },
      confidenceScore: 0.94,
    },
    {
      category: "skill",
      content: {
        name: "TypeScript",
        category: "programming",
        proficiency: "advanced",
      },
      confidenceScore: 0.96,
    },
    {
      category: "education",
      content: {
        institution: "University of Waterloo",
        degree: "Bachelor of Applied Science",
        field: "Mechatronics Engineering",
      },
      confidenceScore: 0.98,
    },
  ];

  return insertBankEntries(entries, userId).length;
}

function seedDrafts(userId: string, jobs: JobDescription[]): number {
  const targetJob =
    jobs.find((job) => job.status === "interviewing") ?? jobs[0];
  createEmailDraft(
    {
      type: "follow_up",
      jobId: targetJob?.id,
      subject: `Following up on ${targetJob?.title ?? "my application"}`,
      body: "Hi there,\n\nI wanted to follow up on my application and see whether there is any additional information I can provide.\n\nBest,\nKevin",
      context: {
        company: targetJob?.company ?? "Company",
        role: targetJob?.title ?? "Role",
      },
    },
    userId,
  );
  return 1;
}

function seedAtsScans(userId: string, jobs: JobDescription[]): number {
  const job = jobs[0];
  const id = generateId();
  getDb()
    .prepare(
      `INSERT INTO ats_scan_history
       (id, user_id, job_id, overall_score, letter_grade, formatting_score, structure_score, content_score, keywords_score, issue_count, fix_count, report_json, scanned_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      id,
      userId,
      job?.id ?? null,
      82,
      "B",
      88,
      80,
      78,
      84,
      3,
      4,
      JSON.stringify({
        label: job ? `${job.title} @ ${job.company}` : "Dev seed scan",
        result: {
          overall: 82,
          letterGrade: "B",
          issues: [
            "Add more direct keyword matches from the posting.",
            "Quantify one project bullet with a measurable outcome.",
            "Keep file naming consistent for ATS imports.",
          ],
        },
      }),
      new Date().toISOString(),
    );
  return 1;
}

function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function daysAgo(days: number): string {
  return daysFromNow(-days);
}
