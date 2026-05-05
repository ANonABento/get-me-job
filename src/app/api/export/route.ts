import { NextResponse } from "next/server";
import { getProfile, getDocuments, getLLMConfig } from "@/lib/db";
import { getJobs } from "@/lib/db/jobs";
import { getInterviewSessions } from "@/lib/db/interviews";
import { getAllGeneratedResumes } from "@/lib/db/resumes";
import { getAllCoverLetters } from "@/lib/db/cover-letters";
import { getBankEntries } from "@/lib/db/profile-bank";
import { requireAuth, isAuthError } from "@/lib/auth";

// GET - Export all user data as JSON
export async function GET() {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const jobs = getJobs(authResult.userId);
    const documents = getDocuments(authResult.userId);
    const interviewSessions = getInterviewSessions(
      undefined,
      authResult.userId,
    );
    const generatedResumes = getAllGeneratedResumes(authResult.userId);
    const coverLetters = getAllCoverLetters(authResult.userId);
    const bankEntries = getBankEntries(authResult.userId);

    const exportData = {
      version: "2.0",
      exportedAt: new Date().toISOString(),
      data: {
        profile: getProfile(authResult.userId),
        jobs,
        documents: documents.map((d) => ({
          id: d.id,
          filename: d.filename,
          type: d.type,
          mimeType: d.mimeType,
          size: d.size,
          uploadedAt: d.uploadedAt,
        })),
        interviewSessions,
        generatedResumes,
        coverLetters,
        bankEntries,
        llmConfig: getLLMConfig(authResult.userId),
      },
      stats: {
        totalJobs: jobs.length,
        totalDocuments: documents.length,
        totalInterviews: interviewSessions.length,
        totalResumes: generatedResumes.length,
        totalCoverLetters: coverLetters.length,
        totalBankEntries: bankEntries.length,
      },
    };

    const dateStr = new Date().toISOString().split("T")[0];
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="slothing-export-${dateStr}.json"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 },
    );
  }
}
