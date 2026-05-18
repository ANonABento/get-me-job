/**
 * @route POST /api/opportunities/[id]/cover-letter
 * @description Generate a cover letter for an opportunity using LLM
 * @auth Required
 * @response CoverLetterGenerateResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/lib/db/jobs";
import { getProfile } from "@/lib/db";
import {
  gateOptionalAiFeature,
  isAiGateResponse,
  type OptionalAiGatePass,
} from "@/lib/billing/ai-gate";
import { LLMClient, parseJSONFromLLM } from "@/lib/llm/client";
import { requireAuth, isAuthError } from "@/lib/auth";
import { buildOpportunityCoverLetterJsonPrompt } from "@/lib/cover-letter/opportunity-prompts";
import {
  detectGenericPhrases,
  mergeGenericPhraseMatches,
} from "@/lib/ai/prompt-quality";

export const dynamic = "force-dynamic";

interface CoverLetterResponse {
  coverLetter: string;
  highlights: string[];
  selfCheck?: {
    evidencePoint: string;
    matchedRequirement: string;
    unsupportedCompanyFacts: string[];
    genericPhrases: string[];
    hasClearCTA: boolean;
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;
  let aiGate: OptionalAiGatePass | null = null;

  try {
    const job = getJob(params.id, authResult.userId);
    if (!job) {
      return NextResponse.json(
        { error: "Opportunity not found" },
        { status: 404 },
      );
    }

    const profile = getProfile(authResult.userId);
    if (!profile) {
      return NextResponse.json(
        { error: "No profile data. Upload a resume first." },
        { status: 400 },
      );
    }

    const gate = gateOptionalAiFeature(
      authResult.userId,
      "cover_letter",
      params.id,
    );
    if (isAiGateResponse(gate)) return gate;
    aiGate = gate;

    let coverLetter: string;
    let highlights: string[] = [];
    let selfCheck: CoverLetterResponse["selfCheck"] | undefined;
    let usedLLM = false;
    let fallbackReason: "provider_not_configured" | "llm_error" | null =
      gate.llmConfig ? null : "provider_not_configured";

    if (gate.llmConfig) {
      try {
        const client = new LLMClient(gate.llmConfig);

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
              content: buildOpportunityCoverLetterJsonPrompt({
                profileSummary,
                job,
              }),
            },
          ],
          temperature: 0.7,
          maxTokens: 2000,
        });

        try {
          const parsed = parseJSONFromLLM<CoverLetterResponse>(response);
          coverLetter =
            parsed.coverLetter || generateBasicCoverLetter(profile, job);
          highlights = parsed.highlights || [];
          selfCheck = parsed.selfCheck
            ? {
                ...parsed.selfCheck,
                genericPhrases: mergeGenericPhraseMatches(
                  parsed.selfCheck.genericPhrases,
                  detectGenericPhrases(coverLetter),
                ),
              }
            : {
                evidencePoint: "",
                matchedRequirement: "",
                unsupportedCompanyFacts: [],
                genericPhrases: detectGenericPhrases(coverLetter),
                hasClearCTA: false,
              };
        } catch {
          coverLetter = response; // Use raw response if JSON parsing fails
          selfCheck = {
            evidencePoint: "",
            matchedRequirement: "",
            unsupportedCompanyFacts: [],
            genericPhrases: detectGenericPhrases(coverLetter),
            hasClearCTA: false,
          };
        }
        usedLLM = true;
      } catch (llmError) {
        aiGate?.refund();
        fallbackReason = "llm_error";
        console.error("Cover letter LLM generation failed:", llmError);
        coverLetter = generateBasicCoverLetter(profile, job);
      }
    } else {
      // Generate basic cover letter without LLM
      coverLetter = generateBasicCoverLetter(profile, job);
      const topSkillNames = profile.skills
        .slice(0, 3)
        .map((skill) => (typeof skill === "string" ? skill : skill.name))
        .filter(Boolean);
      highlights = [
        `Experience as ${profile.experiences?.[0]?.title || "professional"}`,
        `Skills in ${topSkillNames.join(", ")}`,
        "Motivated to contribute to the team",
      ];
    }
    if (highlights.length === 0) {
      const topSkillNames = profile.skills
        .slice(0, 3)
        .map((skill) => (typeof skill === "string" ? skill : skill.name))
        .filter(Boolean);
      highlights = [
        `Experience as ${profile.experiences?.[0]?.title || "professional"}`,
        `Skills in ${topSkillNames.join(", ")}`,
        "Motivated to contribute to the team",
      ];
    }

    return NextResponse.json({
      success: true,
      coverLetter,
      highlights,
      ...(selfCheck ? { selfCheck } : {}),
      usedLLM,
      fallbackUsed: !usedLLM,
      fallbackReason: usedLLM ? null : fallbackReason,
    });
  } catch (error) {
    aiGate?.refund();
    console.error("Cover letter generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate cover letter" },
      { status: 500 },
    );
  }
}

function generateBasicCoverLetter(
  profile: {
    contact?: { name?: string; email?: string };
    name?: string;
    summary?: string;
    experiences?: { title: string; company: string }[];
    skills: Array<{ name: string } | string>;
  },
  job: { title: string; company: string; description: string },
): string {
  const name = profile.contact?.name || profile.name || "Applicant";
  const recentRole = profile.experiences?.[0];
  const topSkills = profile.skills
    .slice(0, 5)
    .map((skill) => (typeof skill === "string" ? skill : skill.name))
    .filter(Boolean);

  return `Dear Hiring Manager,

${recentRole ? `As a ${recentRole.title} at ${recentRole.company}` : "With my recent work"} and experience with ${topSkills.slice(0, 3).join(", ") || "the requirements you outlined"}, I can bring relevant evidence to the ${job.title} role at ${job.company}.

${profile.summary || `My background includes hands-on work across ${topSkills.join(", ") || "the skills needed for this role"}, and I focus on turning that experience into practical, reliable results.`}

The role's requirements connect directly to that experience, and I would welcome the chance to discuss how my skills could support ${job.company}'s needs.

Thank you for considering my application. I look forward to the opportunity to speak with you.

Best regards,
${name}`;
}
