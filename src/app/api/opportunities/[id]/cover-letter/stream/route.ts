/**
 * @route POST /api/opportunities/[id]/cover-letter/stream
 * @description Stream cover letter generation via Server-Sent Events (SSE)
 * @auth Required
 * @response Server-Sent Events stream
 */
import { NextRequest } from "next/server";
import { getJob } from "@/lib/db/jobs";
import { getProfile, getLLMConfig } from "@/lib/db";
import { LLMClient } from "@/lib/llm/client";
import { requireAuth, isAuthError } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const job = getJob(params.id, authResult.userId);
    if (!job) {
      return new Response(JSON.stringify({ error: "Opportunity not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const profile = getProfile(authResult.userId);
    if (!profile) {
      return new Response(
        JSON.stringify({ error: "No profile data. Upload a resume first." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const llmConfig = getLLMConfig(authResult.userId);
    if (!llmConfig) {
      // Return basic cover letter for non-LLM case
      const basicLetter = generateBasicCoverLetter(profile, job);
      return new Response(
        JSON.stringify({ content: basicLetter, done: true }),
        {
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const client = new LLMClient(llmConfig);

    const profileSummary = `
Name: ${profile.contact.name}
Email: ${profile.contact.email || "N/A"}
Phone: ${profile.contact.phone || "N/A"}
Summary: ${profile.summary || "N/A"}

Experience:
${profile.experiences.map((e) => `- ${e.title} at ${e.company}: ${e.description}`).join("\n")}

Skills: ${profile.skills.map((s) => s.name).join(", ")}
    `.trim();

    const prompt = `Generate a professional cover letter for this job application.

CANDIDATE PROFILE:
${profileSummary}

JOB DETAILS:
Position: ${job.title} at ${job.company}
${job.location ? `Location: ${job.location}` : ""}
Description: ${job.description}

Key Requirements: ${job.keywords.join(", ")}

Guidelines:
- Keep it professional but personable
- 3-4 paragraphs max
- Highlight relevant experience and skills
- Show enthusiasm for the role
- Don't use generic phrases
- Make it specific to this job
- Start directly with "Dear Hiring Manager," - no preamble`;

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const generator = client.stream({
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            maxTokens: 2000,
          });

          for await (const chunk of generator) {
            const data = JSON.stringify({ content: chunk, done: false });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }

          controller.enqueue(encoder.encode(`data: {"done": true}\n\n`));
          controller.close();
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : "Stream error";
          controller.enqueue(
            encoder.encode(`data: {"error": "${errorMsg}", "done": true}\n\n`),
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Cover letter stream error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate cover letter" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

function generateBasicCoverLetter(
  profile: {
    contact: { name?: string };
    summary?: string;
    experiences: { title: string; company: string }[];
    skills: { name: string }[];
  },
  job: { title: string; company: string },
): string {
  const name = profile.contact.name || "Applicant";
  const recentRole = profile.experiences[0];
  const topSkills = profile.skills.slice(0, 5).map((s) => s.name);

  return `Dear Hiring Manager,

I am writing to express my interest in the ${job.title} position at ${job.company}. With my background${recentRole ? ` as a ${recentRole.title} at ${recentRole.company}` : ""} and expertise in ${topSkills.slice(0, 3).join(", ")}, I am confident in my ability to contribute effectively to your team.

${profile.summary || `I am a dedicated professional with experience in ${topSkills.join(", ")}. I am passionate about delivering high-quality work and continuously improving my skills.`}

I am particularly excited about this opportunity because it aligns well with my experience and career goals. I would welcome the chance to discuss how my skills and experiences would benefit ${job.company}.

Thank you for considering my application. I look forward to the opportunity to speak with you.

Best regards,
${name}`;
}
