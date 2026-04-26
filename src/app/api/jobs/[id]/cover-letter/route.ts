/**
 * @route POST /api/jobs/[id]/cover-letter
 * @description Generate a cover letter for a job using LLM
 * @auth Required
 * @response CoverLetterGenerateResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/lib/db/jobs";
import { getProfile, getLLMConfig } from "@/lib/db";
import { LLMClient, parseJSONFromLLM } from "@/lib/llm/client";
import { requireAuth, isAuthError } from "@/lib/auth";

interface CoverLetterResponse {
  coverLetter: string;
  highlights: string[];
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const job = getJob(params.id, authResult.userId);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const profile = getProfile(authResult.userId);
    if (!profile) {
      return NextResponse.json(
        { error: "No profile data. Upload a resume first." },
        { status: 400 }
      );
    }

    const llmConfig = getLLMConfig(authResult.userId);

    let coverLetter: string;
    let highlights: string[] = [];

    if (llmConfig) {
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

      const response = await client.complete({
        messages: [
          {
            role: "user",
            content: `Generate a professional cover letter for this job application.

CANDIDATE PROFILE:
${profileSummary}

JOB DETAILS:
Position: ${job.title} at ${job.company}
${job.location ? `Location: ${job.location}` : ""}
Description: ${job.description}

Key Requirements: ${job.keywords.join(", ")}

Return a JSON object with:
{
  "coverLetter": "The full cover letter text with proper formatting and paragraphs",
  "highlights": ["Key point 1 that makes this candidate stand out", "Key point 2", "Key point 3"]
}

Guidelines:
- Keep it professional but personable
- 3-4 paragraphs max
- Highlight relevant experience and skills
- Show enthusiasm for the role
- Don't use generic phrases
- Make it specific to this job`,
          },
        ],
        temperature: 0.7,
        maxTokens: 2000,
      });

      try {
        const parsed = parseJSONFromLLM<CoverLetterResponse>(response);
        coverLetter = parsed.coverLetter || generateBasicCoverLetter(profile, job);
        highlights = parsed.highlights || [];
      } catch {
        coverLetter = response; // Use raw response if JSON parsing fails
      }
    } else {
      // Generate basic cover letter without LLM
      coverLetter = generateBasicCoverLetter(profile, job);
      highlights = [
        `Experience as ${profile.experiences[0]?.title || "professional"}`,
        `Skills in ${profile.skills.slice(0, 3).map((s) => s.name).join(", ")}`,
        "Motivated to contribute to the team",
      ];
    }

    return NextResponse.json({
      success: true,
      coverLetter,
      highlights,
      usedLLM: !!llmConfig,
    });
  } catch (error) {
    console.error("Cover letter generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate cover letter" },
      { status: 500 }
    );
  }
}

function generateBasicCoverLetter(
  profile: { contact: { name?: string; email?: string }; summary?: string; experiences: { title: string; company: string }[]; skills: { name: string }[] },
  job: { title: string; company: string; description: string }
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
