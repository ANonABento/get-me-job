import { LLMClient, parseJSONFromLLM } from "@/lib/llm/client";
import type { LLMConfig } from "@/types";
import type { JobDescription } from "@/types";

export interface CompanyResearchData {
  summary: string;
  keyFacts: string[];
  interviewQuestions: string[];
  cultureNotes: string;
  recentNews: string;
}

export async function generateCompanyResearch(
  companyName: string,
  job: JobDescription | null,
  llmConfig: LLMConfig
): Promise<CompanyResearchData> {
  const client = new LLMClient(llmConfig);

  const jobContext = job
    ? `
The user is applying for: ${job.title}
Job Description: ${job.description}
Key Requirements: ${job.keywords.join(", ")}
`
    : "";

  const response = await client.complete({
    messages: [
      {
        role: "user",
        content: `Generate a comprehensive company research summary for "${companyName}" to help someone prepare for a job interview.
${jobContext}

Include:
1. A brief company overview (2-3 sentences about what they do, their mission, and market position)
2. 5-7 key facts that would be useful to know for an interview (founding year, size, notable achievements, products/services, etc.)
3. 5-6 thoughtful questions the candidate can ask the interviewer (about the team, growth, culture, role specifics)
4. Notes about company culture and work environment (based on what's publicly known)
5. Any recent notable news or developments

Return ONLY a JSON object:
{
  "summary": "Brief company overview...",
  "keyFacts": ["Fact 1", "Fact 2", ...],
  "interviewQuestions": ["Question 1?", "Question 2?", ...],
  "cultureNotes": "Notes about culture and work environment...",
  "recentNews": "Any recent news or developments..."
}

Be factual and helpful. If you're uncertain about specific details, focus on general industry knowledge and what can be reasonably inferred.`,
      },
    ],
    temperature: 0.7,
    maxTokens: 1500,
  });

  try {
    return parseJSONFromLLM<CompanyResearchData>(response);
  } catch {
    // If parsing fails, create a basic response
    return {
      summary: `${companyName} is a company you're researching for your job application.`,
      keyFacts: [
        "Research the company website for the most accurate information",
        "Check LinkedIn for company size and employee insights",
        "Review recent press releases and news articles",
        "Look at Glassdoor for employee reviews",
      ],
      interviewQuestions: [
        "What does a typical day look like in this role?",
        "How does the team measure success?",
        "What are the biggest challenges the team is facing?",
        "What opportunities for growth exist in this role?",
        "How would you describe the team culture?",
      ],
      cultureNotes: "Visit the company's careers page and LinkedIn for culture insights.",
      recentNews: "Search for recent news articles about the company.",
    };
  }
}

export function generateBasicResearch(
  companyName: string,
  job: JobDescription | null
): CompanyResearchData {
  const roleSpecificQuestions = job
    ? [
        `What are the most important goals for the ${job.title} role in the first 90 days?`,
        `How does the ${job.title} position collaborate with other teams?`,
        `What skills would make someone exceptionally successful as a ${job.title} here?`,
      ]
    : [];

  return {
    summary: `${companyName} is a company you're interested in. Research their website, LinkedIn page, and recent news to learn more about their products, services, and culture.`,
    keyFacts: [
      `Company Name: ${companyName}`,
      "Visit the company website for mission statement and values",
      "Check LinkedIn for company size and recent updates",
      "Look for press releases and news articles",
      "Review their products or services page",
      "Check Glassdoor for employee reviews and interview tips",
    ],
    interviewQuestions: [
      "What does success look like in this role after 6 months?",
      "How would you describe the team culture?",
      "What are the biggest challenges the team is currently facing?",
      "What do you enjoy most about working here?",
      "How does the company support professional development?",
      "What are the next steps in the interview process?",
      ...roleSpecificQuestions,
    ],
    cultureNotes: `To understand ${companyName}'s culture:
- Check their careers page for values and mission
- Read employee reviews on Glassdoor
- Look at their social media presence
- Review their blog or news section for company updates`,
    recentNews: `To find recent news about ${companyName}:
- Search Google News for recent articles
- Check their press release section
- Look for recent LinkedIn posts
- Search for industry news mentioning the company`,
  };
}
