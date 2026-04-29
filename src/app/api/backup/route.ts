/**
 * @route GET /api/backup
 * @route POST /api/backup
 * @description GET: Export full backup. POST: Restore from backup.
 * @auth Required
 * @request { backup: object } (POST)
 * @response BackupRestoreResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import { getProfile, getDocuments, getLLMConfig, updateProfile, setLLMConfig } from "@/lib/db";
import { getJobs, createJob } from "@/lib/db/jobs";
import { getInterviewSessions } from "@/lib/db/interviews";
import { getAllGeneratedResumes } from "@/lib/db/resumes";
import { generateId } from "@/lib/utils";
import { JOB_STATUSES, backupDataSchema } from "@/lib/constants";
import { requireAuth, isAuthError } from "@/lib/auth";

// GET - Export full backup
export async function GET() {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const backup = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      data: {
        profile: getProfile(authResult.userId),
        jobs: getJobs(authResult.userId),
        documents: getDocuments(authResult.userId).map((d) => ({
          filename: d.filename,
          type: d.type,
          mimeType: d.mimeType,
          uploadedAt: d.uploadedAt,
        })),
        interviewSessions: getInterviewSessions(undefined, authResult.userId),
        generatedResumes: getAllGeneratedResumes(authResult.userId).map((r) => ({
          jobId: r.jobId,
          matchScore: r.matchScore,
          createdAt: r.createdAt,
        })),
        llmConfig: getLLMConfig(authResult.userId),
      },
      stats: {
        totalJobs: getJobs(authResult.userId).length,
        totalDocuments: getDocuments(authResult.userId).length,
        totalInterviews: getInterviewSessions(undefined, authResult.userId).length,
        totalResumes: getAllGeneratedResumes(authResult.userId).length,
      },
    };

    return new NextResponse(JSON.stringify(backup, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="taida-backup-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("Backup error:", error);
    return NextResponse.json(
      { error: "Failed to create backup" },
      { status: 500 }
    );
  }
}

// POST - Restore from backup
export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const rawData = await request.json();

    // Validate backup format with Zod
    const parseResult = backupDataSchema.safeParse(rawData);
    if (!parseResult.success) {
      const errors = parseResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return NextResponse.json(
        { error: "Invalid backup format", errors },
        { status: 400 }
      );
    }

    const backup = parseResult.data;

    const results = {
      profile: false,
      jobs: { imported: 0, skipped: 0 },
      llmConfig: false,
    };

    // Restore profile
    if (backup.data.profile) {
      const profile = backup.data.profile;
      updateProfile({
        contact: profile.contact as { name: string; email?: string; phone?: string; location?: string; linkedin?: string; github?: string; website?: string } | undefined,
        summary: profile.summary,
        rawText: profile.rawText,
        experiences: profile.experiences?.map((exp) => ({
          id: (exp.id as string) || generateId(),
          company: exp.company as string,
          title: exp.title as string,
          location: exp.location as string | undefined,
          startDate: exp.startDate as string,
          endDate: exp.endDate as string | undefined,
          current: exp.current as boolean,
          description: exp.description as string,
          highlights: exp.highlights as string[],
          skills: exp.skills as string[],
        })),
        education: profile.education?.map((edu) => ({
          id: (edu.id as string) || generateId(),
          institution: edu.institution as string,
          degree: edu.degree as string,
          field: edu.field as string,
          startDate: edu.startDate as string | undefined,
          endDate: edu.endDate as string | undefined,
          gpa: edu.gpa as string | undefined,
          highlights: edu.highlights as string[],
        })),
        skills: profile.skills?.map((skill) => ({
          id: (skill.id as string) || generateId(),
          name: skill.name as string,
          category: skill.category as "technical" | "soft" | "language" | "tool" | "other",
          proficiency: skill.proficiency as "beginner" | "intermediate" | "advanced" | "expert" | undefined,
        })),
        projects: profile.projects?.map((proj) => ({
          id: (proj.id as string) || generateId(),
          name: proj.name as string,
          description: proj.description as string,
          url: proj.url as string | undefined,
          technologies: proj.technologies as string[],
          highlights: proj.highlights as string[],
        })),
        certifications: profile.certifications?.map((cert) => ({
          id: (cert.id as string) || generateId(),
          name: cert.name as string,
          issuer: cert.issuer as string,
          date: cert.date as string | undefined,
          url: cert.url as string | undefined,
        })),
      }, authResult.userId);
      results.profile = true;
    }

    // Restore jobs (skip duplicates)
    if (backup.data.jobs && Array.isArray(backup.data.jobs)) {
      const existingJobs = getJobs(authResult.userId);
      const existingKeys = new Set(
        existingJobs.map((j) => `${j.title.toLowerCase()}-${j.company.toLowerCase()}`)
      );

      for (const job of backup.data.jobs) {
        const key = `${job.title.toLowerCase()}-${job.company.toLowerCase()}`;
        if (existingKeys.has(key)) {
          results.jobs.skipped++;
          continue;
        }

        // Validate and cast job type and status
        const validJobTypes = ["full-time", "part-time", "contract", "internship"] as const;
        const jobType = validJobTypes.includes(job.type as typeof validJobTypes[number])
          ? (job.type as typeof validJobTypes[number])
          : undefined;
        const jobStatus = JOB_STATUSES.includes((job.status || "saved") as typeof JOB_STATUSES[number])
          ? ((job.status || "saved") as typeof JOB_STATUSES[number])
          : "saved";

        createJob({
          title: job.title,
          company: job.company,
          location: job.location,
          type: jobType,
          remote: job.remote,
          salary: job.salary,
          description: job.description,
          requirements: job.requirements || [],
          responsibilities: job.responsibilities || [],
          keywords: job.keywords || [],
          url: job.url,
          status: jobStatus,
          notes: job.notes,
        }, authResult.userId);
        existingKeys.add(key);
        results.jobs.imported++;
      }
    }

    // Restore LLM config
    if (backup.data.llmConfig) {
      const validProviders = ["openai", "anthropic", "ollama", "openrouter"] as const;
      const config = backup.data.llmConfig;

      if (validProviders.includes(config.provider as typeof validProviders[number])) {
        setLLMConfig({
          provider: config.provider as typeof validProviders[number],
          apiKey: config.apiKey,
          baseUrl: config.baseUrl,
          model: config.model,
        }, authResult.userId);
        results.llmConfig = true;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Backup restored successfully",
      results,
    });
  } catch (error) {
    console.error("Restore error:", error);
    return NextResponse.json(
      { error: "Failed to restore backup" },
      { status: 500 }
    );
  }
}
