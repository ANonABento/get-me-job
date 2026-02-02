import { NextRequest, NextResponse } from "next/server";
import { getLLMConfig } from "@/lib/db";
import { LLMClient } from "@/lib/llm/client";
import { formatCurrency } from "@/lib/salary/calculator";
import { requireAuth, isAuthError } from "@/lib/auth";

interface NegotiationRequest {
  company: string;
  role: string;
  currentOffer: number;
  targetSalary: number;
  marketMedian: number;
  marketMax: number;
  hasCompetingOffers?: boolean;
  competingOfferAmount?: number;
  strengths?: string[];
  concerns?: string[];
}

const NEGOTIATION_SCRIPT_PROMPT = `You are an expert salary negotiation coach. Generate a professional, confident negotiation script for the following scenario.

Context:
- Company: {company}
- Role: {role}
- Current Offer: {currentOffer}
- Your Target: {targetSalary}
- Market Median: {marketMedian}
- Market Max: {marketMax}
{competingOffers}
{strengths}
{concerns}

Generate a negotiation script with:
1. An opening statement (professional, confident, grateful)
2. Your value proposition (2-3 key points)
3. The ask (specific number with justification)
4. Handling potential pushback (2-3 common objections)
5. A graceful close

Format the response as JSON:
{
  "opening": "Your opening statement...",
  "valuePoints": ["Point 1", "Point 2", "Point 3"],
  "theAsk": "Your specific ask with justification...",
  "pushbackResponses": [
    {"objection": "Budget constraints", "response": "Your response..."},
    {"objection": "Internal equity", "response": "Your response..."}
  ],
  "close": "Your closing statement..."
}`;

function buildPrompt(request: NegotiationRequest): string {
  let prompt = NEGOTIATION_SCRIPT_PROMPT
    .replace("{company}", request.company)
    .replace("{role}", request.role)
    .replace("{currentOffer}", formatCurrency(request.currentOffer))
    .replace("{targetSalary}", formatCurrency(request.targetSalary))
    .replace("{marketMedian}", formatCurrency(request.marketMedian))
    .replace("{marketMax}", formatCurrency(request.marketMax));

  if (request.hasCompetingOffers && request.competingOfferAmount) {
    prompt = prompt.replace(
      "{competingOffers}",
      `- Competing Offer: ${formatCurrency(request.competingOfferAmount)}`
    );
  } else {
    prompt = prompt.replace("{competingOffers}", "");
  }

  if (request.strengths && request.strengths.length > 0) {
    prompt = prompt.replace("{strengths}", `- Key Strengths: ${request.strengths.join(", ")}`);
  } else {
    prompt = prompt.replace("{strengths}", "");
  }

  if (request.concerns && request.concerns.length > 0) {
    prompt = prompt.replace("{concerns}", `- Your Concerns: ${request.concerns.join(", ")}`);
  } else {
    prompt = prompt.replace("{concerns}", "");
  }

  return prompt;
}

function generateFallbackScript(request: NegotiationRequest) {
  const increase = ((request.targetSalary - request.currentOffer) / request.currentOffer) * 100;

  return {
    opening: `Thank you so much for the offer to join ${request.company} as a ${request.role}. I'm genuinely excited about the opportunity and the team. Before I sign, I'd like to discuss the compensation package.`,
    valuePoints: [
      "I bring [X years] of relevant experience in this exact space",
      "My skills in [key technology/domain] directly align with your priorities",
      "I've successfully [specific achievement] which demonstrates my ability to deliver results",
    ],
    theAsk: `Based on my research of market rates and the value I'll bring, I'm looking for a base salary of ${formatCurrency(request.targetSalary)}. This is ${increase > 0 ? `a ${Math.round(increase)}% increase` : "in line with"} the current offer and reflects the ${formatCurrency(request.marketMedian)} to ${formatCurrency(request.marketMax)} range for this role in this market.`,
    pushbackResponses: [
      {
        objection: "We don't have budget flexibility",
        response:
          "I understand budget constraints. Could we explore other forms of compensation like a signing bonus, additional equity, or a structured review in 6 months with a guaranteed increase if I meet performance targets?",
      },
      {
        objection: "This is above our internal pay bands",
        response:
          "I appreciate the transparency about internal equity. Given the market rate for this role, could we discuss how to bridge this gap? Perhaps through a title adjustment or performance-based compensation?",
      },
      {
        objection: "This is our final offer",
        response:
          "I understand. Before I make my final decision, could you help me understand the full compensation picture including bonus potential, equity refresh grants, and promotion timeline?",
      },
    ],
    close:
      "I want to make this work because I'm genuinely excited about the role and the team. I hope we can find a number that reflects the value I'll bring and allows me to accept with enthusiasm.",
  };
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  try {
    const body: NegotiationRequest = await request.json();

    if (!body.company || !body.role || !body.currentOffer || !body.targetSalary) {
      return NextResponse.json(
        { error: "Missing required fields: company, role, currentOffer, targetSalary" },
        { status: 400 }
      );
    }

    // Try to use LLM if configured
    const llmConfig = getLLMConfig();
    if (llmConfig) {
      try {
        const client = new LLMClient(llmConfig);
        const prompt = buildPrompt(body);

        const content = await client.complete({
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          maxTokens: 1500,
        });

        // Try to parse JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const script = JSON.parse(jsonMatch[0]);
          return NextResponse.json({ script, source: "ai" });
        }
      } catch (llmError) {
        console.error("LLM generation failed, using fallback:", llmError);
      }
    }

    // Fallback to template-based script
    const script = generateFallbackScript(body);
    return NextResponse.json({ script, source: "template" });
  } catch (error) {
    console.error("Negotiation script error:", error);
    return NextResponse.json(
      { error: "Failed to generate negotiation script" },
      { status: 500 }
    );
  }
}
