import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/lib/db/jobs";
import { getProfile, getLLMConfig } from "@/lib/db";
import { getCompanyResearch } from "@/lib/db/company-research";
import { generatePrepGuide, generateExportableDocument } from "@/lib/interview/prep-guide";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");
    const format = searchParams.get("format"); // "json" or "markdown"

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

    const job = getJob(jobId);
    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    const profile = getProfile();
    const llmConfig = getLLMConfig();
    const companyResearch = getCompanyResearch(job.company);

    const guide = await generatePrepGuide(job, profile, companyResearch, llmConfig);

    if (format === "markdown") {
      const markdown = generateExportableDocument(guide);
      return new NextResponse(markdown, {
        headers: {
          "Content-Type": "text/markdown",
          "Content-Disposition": `attachment; filename="interview-prep-${job.company.replace(/\s+/g, "-")}.md"`,
        },
      });
    }

    return NextResponse.json(guide);
  } catch (error) {
    console.error("Prep guide error:", error);
    return NextResponse.json(
      { error: "Failed to generate preparation guide" },
      { status: 500 }
    );
  }
}
