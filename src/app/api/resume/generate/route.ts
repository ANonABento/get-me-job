/**
 * @route POST /api/resume/generate
 * @description Generate a tailored resume from the knowledge bank
 * @auth Required
 * @request { jobId: string, options?: { tone?: string, length?: string } }
 * @response ResumeGenerateResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isAuthError } from "@/lib/auth";
import { getLLMConfig } from "@/lib/db/queries";
import { saveGeneratedResume } from "@/lib/db/resumes";
import { runRetrievalPipeline } from "@/lib/knowledge/retrieval";

const generateResumeSchema = z.object({
  jobDescription: z.string().min(10, "Job description must be at least 10 characters"),
  templateId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const body = await request.json();
    const parsed = generateResumeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          errors: parsed.error.issues.map((i) => ({
            field: i.path.join("."),
            message: i.message,
          })),
        },
        { status: 400 }
      );
    }

    const { jobDescription, templateId } = parsed.data;

    const llmConfig = getLLMConfig(authResult.userId);
    if (!llmConfig) {
      return NextResponse.json(
        { error: "No LLM provider configured. Go to Settings to set one up." },
        { status: 400 }
      );
    }

    // Run the retrieval pipeline
    const result = await runRetrievalPipeline(
      jobDescription,
      authResult.userId,
      llmConfig
    );

    // Save generated resume to database
    const savedResume = saveGeneratedResume(
      "standalone", // No specific job ID for standalone generation
      templateId || "retrieval",
      result.resume,
      "", // No HTML path yet — can be generated separately
      undefined,
      authResult.userId
    );

    return NextResponse.json({
      success: true,
      resume: result.resume,
      gaps: result.gaps,
      chunksUsed: result.chunks.length,
      queryCount: result.queryCount,
      savedResume: {
        id: savedResume.id,
        createdAt: savedResume.createdAt,
      },
    });
  } catch (error) {
    console.error("Resume generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate resume", details: String(error) },
      { status: 500 }
    );
  }
}
