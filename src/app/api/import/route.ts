import { NextRequest, NextResponse } from "next/server";
import { getProfile, getDocuments, getLLMConfig, updateProfile, setLLMConfig } from "@/lib/db";
import { getJobs, createJob } from "@/lib/db/jobs";
import { getAllGeneratedResumes } from "@/lib/db/resumes";
import { getAllCoverLetters, saveCoverLetter } from "@/lib/db/cover-letters";
import { getBankEntries, insertBankEntry, getDeduplicationKey, findDuplicateEntry } from "@/lib/db/profile-bank";
import { generateId } from "@/lib/utils";
import { fullExportDataSchema, JOB_TYPES, JOB_STATUSES, LLM_PROVIDERS } from "@/lib/constants";
import { requireAuth, isAuthError } from "@/lib/auth";
import { BANK_CATEGORIES, type BankCategory } from "@/types";

// POST - Import data from full export JSON
export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const rawData = await request.json();

    const parseResult = fullExportDataSchema.safeParse(rawData);
    if (!parseResult.success) {
      const errors = parseResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return NextResponse.json(
        { error: "Invalid export format", errors },
        { status: 400 }
      );
    }

    const exportData = parseResult.data;

    const results = {
      profile: false,
      jobs: { imported: 0, skipped: 0 },
      coverLetters: { imported: 0, skipped: 0 },
      bankEntries: { imported: 0, skipped: 0 },
      llmConfig: false,
    };

    // Restore profile
    if (exportData.data.profile) {
      const profile = exportData.data.profile;
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

    // Restore jobs (skip duplicates by title+company)
    if (exportData.data.jobs && Array.isArray(exportData.data.jobs)) {
      const existingJobs = getJobs(authResult.userId);
      const existingKeys = new Set(
        existingJobs.map((j) => `${j.title.toLowerCase()}-${j.company.toLowerCase()}`)
      );

      for (const job of exportData.data.jobs) {
        const key = `${job.title.toLowerCase()}-${job.company.toLowerCase()}`;
        if (existingKeys.has(key)) {
          results.jobs.skipped++;
          continue;
        }

        const jobType = JOB_TYPES.includes(job.type as typeof JOB_TYPES[number])
          ? (job.type as typeof JOB_TYPES[number])
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

    // Restore cover letters (skip duplicates by jobId+version)
    if (exportData.data.coverLetters && Array.isArray(exportData.data.coverLetters)) {
      const existingCoverLetters = getAllCoverLetters(authResult.userId);
      const existingKeys = new Set(
        existingCoverLetters.map((cl) => `${cl.jobId}-${cl.version}`)
      );

      for (const cl of exportData.data.coverLetters) {
        const key = `${cl.jobId}-${cl.version}`;
        if (existingKeys.has(key)) {
          results.coverLetters.skipped++;
          continue;
        }

        saveCoverLetter(cl.jobId, cl.content, cl.highlights, authResult.userId);
        existingKeys.add(key);
        results.coverLetters.imported++;
      }
    }

    // Restore bank entries (skip duplicates using deduplication keys)
    if (exportData.data.bankEntries && Array.isArray(exportData.data.bankEntries)) {
      for (const entry of exportData.data.bankEntries) {
        const category = entry.category as BankCategory;
        if (!BANK_CATEGORIES.includes(category)) {
          results.bankEntries.skipped++;
          continue;
        }

        const content = entry.content as Record<string, unknown>;
        const dedupKey = getDeduplicationKey(category, content);
        const existing = findDuplicateEntry(category, dedupKey, authResult.userId);

        if (existing) {
          results.bankEntries.skipped++;
          continue;
        }

        insertBankEntry({
          category,
          content,
          sourceDocumentId: entry.sourceDocumentId,
          confidenceScore: entry.confidenceScore,
        }, authResult.userId);
        results.bankEntries.imported++;
      }
    }

    // Restore LLM config
    if (exportData.data.llmConfig) {
      const config = exportData.data.llmConfig;
      if (LLM_PROVIDERS.includes(config.provider as typeof LLM_PROVIDERS[number])) {
        setLLMConfig({
          provider: config.provider as typeof LLM_PROVIDERS[number],
          apiKey: config.apiKey,
          baseUrl: config.baseUrl,
          model: config.model,
        }, authResult.userId);
        results.llmConfig = true;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Data imported successfully",
      results,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "Failed to import data" },
      { status: 500 }
    );
  }
}
