/**
 * @route POST /api/email/generate
 * @description Generate an email from a template or via LLM based on job and profile context
 * @auth Required
 * @request { jobId: string, templateType: string, customPrompt?: string }
 * @response EmailGenerateResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/lib/db/jobs";
import { getProfile, getLLMConfig } from "@/lib/db";
import { LLMClient, parseJSONFromLLM } from "@/lib/llm/client";
import { generateEmail, EMAIL_TEMPLATE_INFO } from "@/lib/email/templates";
import { generateEmailSchema } from "@/lib/constants";
import { requireAuth, isAuthError } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const rawData = await request.json();

    // Validate input with Zod
    const parseResult = generateEmailSchema.safeParse(rawData);
    if (!parseResult.success) {
      const errors = parseResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return NextResponse.json(
        { error: "Validation failed", errors },
        { status: 400 }
      );
    }

    const { type, jobId, useLLM, ...contextParams } = parseResult.data;

    if (!EMAIL_TEMPLATE_INFO[type]) {
      return NextResponse.json(
        { error: "Invalid email type" },
        { status: 400 }
      );
    }

    const profile = getProfile(authResult.userId);
    const job = jobId ? getJob(jobId, authResult.userId) : undefined;

    const context = {
      job: job || undefined,
      profile: profile || undefined,
      ...contextParams,
    };

    // Try LLM-enhanced generation first
    const llmConfig = getLLMConfig(authResult.userId);
    if (useLLM && llmConfig) {
      try {
        const client = new LLMClient(llmConfig);
        const templateInfo = EMAIL_TEMPLATE_INFO[type];

        const profileSummary = profile
          ? `
Name: ${profile.contact.name}
Email: ${profile.contact.email || "N/A"}
Phone: ${profile.contact.phone || "N/A"}
Current Role: ${profile.experiences[0]?.title || "N/A"} at ${profile.experiences[0]?.company || "N/A"}
Skills: ${profile.skills.slice(0, 10).map((s) => s.name).join(", ")}
          `.trim()
          : "No profile data available";

        const jobSummary = job
          ? `
Position: ${job.title}
Company: ${job.company}
Applied: ${job.appliedAt || "Not yet applied"}
Status: ${job.status || "saved"}
          `.trim()
          : "No job selected";

        const prompt = `Generate a professional ${templateInfo.title.toLowerCase()} for a job seeker.

CANDIDATE PROFILE:
${profileSummary}

JOB DETAILS:
${jobSummary}

ADDITIONAL CONTEXT:
${contextParams.interviewerName ? `Interviewer: ${contextParams.interviewerName}` : ""}
${contextParams.interviewDate ? `Interview Date: ${contextParams.interviewDate}` : ""}
${contextParams.targetCompany ? `Target Company: ${contextParams.targetCompany}` : ""}
${contextParams.connectionName ? `Connection: ${contextParams.connectionName}` : ""}
${contextParams.customNote ? `Custom Note: ${contextParams.customNote}` : ""}

Return a JSON object with:
{
  "subject": "Email subject line",
  "body": "Full email body with proper formatting and paragraphs"
}

Guidelines:
- Keep it professional but warm
- Be concise (under 200 words for the body)
- Use specific details from the context provided
- Include a clear call-to-action
- Sign off with the candidate's name`;

        const response = await client.complete({
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          maxTokens: 1000,
        });

        const parsed = parseJSONFromLLM<{ subject: string; body: string }>(response);
        if (parsed.subject && parsed.body) {
          return NextResponse.json({
            success: true,
            email: {
              subject: parsed.subject,
              body: parsed.body,
              placeholders: [],
            },
            usedLLM: true,
          });
        }
      } catch (llmError) {
        console.error("LLM generation failed, falling back to template:", llmError);
      }
    }

    // Fallback to template-based generation
    const email = generateEmail(type, context);

    return NextResponse.json({
      success: true,
      email,
      usedLLM: false,
    });
  } catch (error) {
    console.error("Email generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate email" },
      { status: 500 }
    );
  }
}
