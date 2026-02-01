import { NextRequest, NextResponse } from "next/server";
import { getProfile, getDocuments, getLLMConfig, updateProfile, setLLMConfig } from "@/lib/db";
import { getJobs, createJob } from "@/lib/db/jobs";
import { getInterviewSessions } from "@/lib/db/interviews";
import { getAllGeneratedResumes } from "@/lib/db/resumes";
import { generateId } from "@/lib/utils";

// GET - Export full backup
export async function GET() {
  try {
    const backup = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      data: {
        profile: getProfile(),
        jobs: getJobs(),
        documents: getDocuments().map((d) => ({
          filename: d.filename,
          type: d.type,
          mimeType: d.mimeType,
          uploadedAt: d.uploadedAt,
        })),
        interviewSessions: getInterviewSessions(),
        generatedResumes: getAllGeneratedResumes().map((r) => ({
          jobId: r.jobId,
          matchScore: r.matchScore,
          createdAt: r.createdAt,
        })),
        llmConfig: getLLMConfig(),
      },
      stats: {
        totalJobs: getJobs().length,
        totalDocuments: getDocuments().length,
        totalInterviews: getInterviewSessions().length,
        totalResumes: getAllGeneratedResumes().length,
      },
    };

    return new NextResponse(JSON.stringify(backup, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="columbus-backup-${new Date().toISOString().split("T")[0]}.json"`,
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
  try {
    const backup = await request.json();

    // Validate backup format
    if (!backup.version || !backup.data) {
      return NextResponse.json(
        { error: "Invalid backup format" },
        { status: 400 }
      );
    }

    const results = {
      profile: false,
      jobs: { imported: 0, skipped: 0 },
      llmConfig: false,
    };

    // Restore profile
    if (backup.data.profile) {
      const profile = backup.data.profile;
      updateProfile({
        contact: profile.contact,
        summary: profile.summary,
        rawText: profile.rawText,
        experiences: profile.experiences?.map((exp: Record<string, unknown>) => ({
          ...exp,
          id: exp.id || generateId(),
        })),
        education: profile.education?.map((edu: Record<string, unknown>) => ({
          ...edu,
          id: edu.id || generateId(),
        })),
        skills: profile.skills?.map((skill: Record<string, unknown>) => ({
          ...skill,
          id: skill.id || generateId(),
        })),
        projects: profile.projects?.map((proj: Record<string, unknown>) => ({
          ...proj,
          id: proj.id || generateId(),
        })),
        certifications: profile.certifications?.map((cert: Record<string, unknown>) => ({
          ...cert,
          id: cert.id || generateId(),
        })),
      });
      results.profile = true;
    }

    // Restore jobs (skip duplicates)
    if (backup.data.jobs && Array.isArray(backup.data.jobs)) {
      const existingJobs = getJobs();
      const existingKeys = new Set(
        existingJobs.map((j) => `${j.title.toLowerCase()}-${j.company.toLowerCase()}`)
      );

      for (const job of backup.data.jobs) {
        const key = `${job.title.toLowerCase()}-${job.company.toLowerCase()}`;
        if (existingKeys.has(key)) {
          results.jobs.skipped++;
          continue;
        }

        createJob({
          title: job.title,
          company: job.company,
          location: job.location,
          type: job.type,
          remote: job.remote,
          salary: job.salary,
          description: job.description,
          requirements: job.requirements || [],
          responsibilities: job.responsibilities || [],
          keywords: job.keywords || [],
          url: job.url,
          status: job.status || "saved",
          notes: job.notes,
        });
        existingKeys.add(key);
        results.jobs.imported++;
      }
    }

    // Restore LLM config
    if (backup.data.llmConfig) {
      setLLMConfig(backup.data.llmConfig);
      results.llmConfig = true;
    }

    return NextResponse.json({
      success: true,
      message: "Backup restored successfully",
      results,
    });
  } catch (error) {
    console.error("Restore error:", error);
    return NextResponse.json(
      { error: "Failed to restore backup", details: String(error) },
      { status: 500 }
    );
  }
}
