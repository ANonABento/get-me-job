import type { JobDescription, Profile } from "@/types";
import type { CompanyResearch } from "@/lib/db/company-research";
import { LLMClient, parseJSONFromLLM } from "@/lib/llm/client";
import type { LLMConfig } from "@/types";

export interface PrepChecklistItem {
  id: string;
  category: "before" | "during" | "after";
  task: string;
  description?: string;
  completed: boolean;
}

export interface PrepQuestion {
  question: string;
  category: "behavioral" | "technical" | "situational" | "company";
  yourAnswer?: string;
  tips: string[];
}

export interface InterviewPrepGuide {
  jobTitle: string;
  company: string;
  summary: string;
  checklist: PrepChecklistItem[];
  questions: PrepQuestion[];
  keyTopics: string[];
  yourStrengths: string[];
  potentialGaps: string[];
  talkingPoints: string[];
  createdAt: string;
}

export async function generatePrepGuide(
  job: JobDescription,
  profile: Profile | null,
  companyResearch: CompanyResearch | null,
  llmConfig: LLMConfig | null
): Promise<InterviewPrepGuide> {
  const now = new Date().toISOString();

  if (llmConfig) {
    return generateWithLLM(job, profile, companyResearch, llmConfig, now);
  }

  return generateBasicPrepGuide(job, profile, companyResearch, now);
}

async function generateWithLLM(
  job: JobDescription,
  profile: Profile | null,
  companyResearch: CompanyResearch | null,
  llmConfig: LLMConfig,
  createdAt: string
): Promise<InterviewPrepGuide> {
  const client = new LLMClient(llmConfig);

  const profileContext = profile
    ? `
Candidate Background:
- Name: ${profile.contact?.name}
- Skills: ${profile.skills.map((s) => s.name).join(", ")}
- Experience: ${profile.experiences.map((e) => `${e.title} at ${e.company}`).join("; ")}
`
    : "";

  const companyContext = companyResearch
    ? `
Company Research:
- Summary: ${companyResearch.summary}
- Key Facts: ${companyResearch.keyFacts.join("; ")}
- Culture: ${companyResearch.cultureNotes}
`
    : "";

  const response = await client.complete({
    messages: [
      {
        role: "user",
        content: `Generate a comprehensive interview preparation guide.

Job Details:
- Title: ${job.title}
- Company: ${job.company}
- Description: ${job.description}
- Requirements: ${job.requirements.join(", ")}
- Key Skills: ${job.keywords.join(", ")}
${profileContext}
${companyContext}

Generate a JSON object with:
{
  "summary": "2-3 sentences summarizing what to focus on for this interview",
  "keyTopics": ["Topic 1", "Topic 2", ...], // 5-7 key topics to prepare
  "yourStrengths": ["Strength 1", ...], // 3-5 strengths that match this role (based on profile)
  "potentialGaps": ["Gap 1", ...], // 2-4 potential skill gaps to address
  "talkingPoints": ["Point 1", ...], // 4-6 key talking points for the interview
  "questions": [
    {
      "question": "Likely interview question",
      "category": "behavioral|technical|situational|company",
      "tips": ["Tip 1", "Tip 2"]
    }
  ] // 8-10 likely questions with tips
}

Focus on practical, actionable preparation advice.`,
      },
    ],
    temperature: 0.7,
    maxTokens: 2000,
  });

  try {
    const generated = parseJSONFromLLM<{
      summary: string;
      keyTopics: string[];
      yourStrengths: string[];
      potentialGaps: string[];
      talkingPoints: string[];
      questions: Array<{
        question: string;
        category: "behavioral" | "technical" | "situational" | "company";
        tips: string[];
      }>;
    }>(response);

    return {
      jobTitle: job.title,
      company: job.company,
      summary: generated.summary,
      checklist: generateChecklist(job, companyResearch),
      questions: generated.questions.map((q, i) => ({
        ...q,
        completed: false,
      })) as PrepQuestion[],
      keyTopics: generated.keyTopics,
      yourStrengths: generated.yourStrengths,
      potentialGaps: generated.potentialGaps,
      talkingPoints: generated.talkingPoints,
      createdAt,
    };
  } catch {
    return generateBasicPrepGuide(job, profile, companyResearch, createdAt);
  }
}

function generateBasicPrepGuide(
  job: JobDescription,
  profile: Profile | null,
  companyResearch: CompanyResearch | null,
  createdAt: string
): InterviewPrepGuide {
  // Identify matching skills
  const profileSkills = profile?.skills.map((s) => s.name.toLowerCase()) || [];
  const jobKeywords = job.keywords.map((k) => k.toLowerCase());

  const matchedSkills = profileSkills.filter((skill) =>
    jobKeywords.some((kw) => skill.includes(kw) || kw.includes(skill))
  );

  const missingSkills = jobKeywords.filter(
    (kw) => !profileSkills.some((skill) => skill.includes(kw) || kw.includes(skill))
  );

  return {
    jobTitle: job.title,
    company: job.company,
    summary: `Prepare for your ${job.title} interview at ${job.company}. Focus on demonstrating your experience with ${job.keywords.slice(0, 3).join(", ")}, and be ready to discuss specific projects and achievements.`,
    checklist: generateChecklist(job, companyResearch),
    questions: generateDefaultQuestions(job, companyResearch),
    keyTopics: [
      ...job.keywords.slice(0, 4),
      "Your relevant experience",
      "Career goals",
      "Team collaboration",
    ],
    yourStrengths: matchedSkills.length > 0
      ? matchedSkills.slice(0, 5)
      : ["Review your resume to identify matching skills"],
    potentialGaps: missingSkills.length > 0
      ? missingSkills.slice(0, 4)
      : ["No major gaps identified - review job requirements carefully"],
    talkingPoints: [
      `Why you're interested in ${job.company}`,
      `Your experience with ${job.keywords[0] || "relevant technologies"}`,
      "A challenging project you led successfully",
      "How you handle tight deadlines or competing priorities",
      "Your career goals and how this role fits",
    ],
    createdAt,
  };
}

function generateChecklist(
  job: JobDescription,
  companyResearch: CompanyResearch | null
): PrepChecklistItem[] {
  return [
    // Before
    {
      id: "research-company",
      category: "before",
      task: `Research ${job.company}`,
      description: "Understand their products, mission, recent news, and culture",
      completed: false,
    },
    {
      id: "review-job",
      category: "before",
      task: "Review the job description thoroughly",
      description: "Identify key requirements and prepare examples for each",
      completed: false,
    },
    {
      id: "prepare-stories",
      category: "before",
      task: "Prepare STAR stories",
      description: "Have 5-6 stories ready that demonstrate key skills",
      completed: false,
    },
    {
      id: "practice-questions",
      category: "before",
      task: "Practice common interview questions",
      description: "Record yourself answering and review for improvement",
      completed: false,
    },
    {
      id: "prepare-questions",
      category: "before",
      task: "Prepare questions to ask",
      description: companyResearch
        ? "Review suggested questions from company research"
        : "Prepare 3-5 thoughtful questions about the role and team",
      completed: false,
    },
    {
      id: "test-tech",
      category: "before",
      task: "Test technology (if virtual)",
      description: "Check camera, microphone, internet connection, and background",
      completed: false,
    },
    {
      id: "plan-outfit",
      category: "before",
      task: "Plan professional attire",
      description: "Choose outfit appropriate for company culture",
      completed: false,
    },
    // During
    {
      id: "arrive-early",
      category: "during",
      task: "Arrive 10-15 minutes early",
      description: "Shows punctuality and gives time to settle",
      completed: false,
    },
    {
      id: "body-language",
      category: "during",
      task: "Maintain positive body language",
      description: "Eye contact, good posture, engaged listening",
      completed: false,
    },
    {
      id: "take-notes",
      category: "during",
      task: "Take brief notes",
      description: "Write down interviewer names and key points",
      completed: false,
    },
    {
      id: "ask-questions",
      category: "during",
      task: "Ask your prepared questions",
      description: "Shows interest and helps you evaluate the opportunity",
      completed: false,
    },
    // After
    {
      id: "send-thanks",
      category: "after",
      task: "Send thank-you email within 24 hours",
      description: "Personalize for each interviewer if possible",
      completed: false,
    },
    {
      id: "reflect",
      category: "after",
      task: "Reflect on the interview",
      description: "Note what went well and areas to improve",
      completed: false,
    },
    {
      id: "follow-up",
      category: "after",
      task: "Follow up if no response after expected timeline",
      description: "Send a polite inquiry about next steps",
      completed: false,
    },
  ];
}

function generateDefaultQuestions(
  job: JobDescription,
  companyResearch: CompanyResearch | null
): PrepQuestion[] {
  const questions: PrepQuestion[] = [
    {
      question: `Tell me about yourself and why you're interested in this ${job.title} role.`,
      category: "behavioral",
      tips: [
        "Keep it to 2-3 minutes",
        "Focus on relevant experience",
        "End with why you're excited about this role",
      ],
    },
    {
      question: "Describe a challenging project you worked on. What was your approach?",
      category: "behavioral",
      tips: [
        "Use the STAR method",
        "Quantify your impact",
        "Highlight problem-solving skills",
      ],
    },
    {
      question: "How do you handle tight deadlines or competing priorities?",
      category: "situational",
      tips: [
        "Give a specific example",
        "Explain your prioritization process",
        "Show how you communicated with stakeholders",
      ],
    },
    {
      question: `What experience do you have with ${job.keywords[0] || "the technologies listed"}?`,
      category: "technical",
      tips: [
        "Be specific about projects",
        "Mention any certifications or training",
        "Acknowledge areas you're still learning",
      ],
    },
    {
      question: "Tell me about a time you disagreed with a colleague. How did you handle it?",
      category: "behavioral",
      tips: [
        "Focus on constructive resolution",
        "Show emotional intelligence",
        "Emphasize the positive outcome",
      ],
    },
    {
      question: "Where do you see yourself in 5 years?",
      category: "situational",
      tips: [
        "Align with the role's growth path",
        "Show ambition but also commitment",
        "Be realistic and authentic",
      ],
    },
    {
      question: `Why do you want to work at ${job.company}?`,
      category: "company",
      tips: [
        companyResearch
          ? "Reference company research findings"
          : "Research their mission and values",
        "Connect to your own goals",
        "Be specific, not generic",
      ],
    },
    {
      question: "What questions do you have for us?",
      category: "company",
      tips: [
        "Always have questions ready",
        "Ask about team dynamics and success metrics",
        "Avoid questions about salary in first round",
      ],
    },
  ];

  // Add company-specific questions if research available
  if (companyResearch?.interviewQuestions) {
    questions.push({
      question: "Be prepared to ask: " + companyResearch.interviewQuestions[0],
      category: "company",
      tips: ["Shows you've done your research", "Demonstrates genuine interest"],
    });
  }

  return questions;
}

export function generateExportableDocument(guide: InterviewPrepGuide): string {
  const sections: string[] = [];

  sections.push(`# Interview Preparation Guide
## ${guide.jobTitle} at ${guide.company}
Generated: ${new Date(guide.createdAt).toLocaleDateString()}

---

### Overview
${guide.summary}

---`);

  sections.push(`### Key Topics to Prepare
${guide.keyTopics.map((t) => `- ${t}`).join("\n")}

---`);

  sections.push(`### Your Strengths for This Role
${guide.yourStrengths.map((s) => `✓ ${s}`).join("\n")}

---`);

  sections.push(`### Potential Gaps to Address
${guide.potentialGaps.map((g) => `⚠ ${g}`).join("\n")}

---`);

  sections.push(`### Key Talking Points
${guide.talkingPoints.map((p, i) => `${i + 1}. ${p}`).join("\n")}

---`);

  sections.push(`### Preparation Checklist

**Before the Interview:**
${guide.checklist
  .filter((c) => c.category === "before")
  .map((c) => `[ ] ${c.task}${c.description ? `\n    ${c.description}` : ""}`)
  .join("\n")}

**During the Interview:**
${guide.checklist
  .filter((c) => c.category === "during")
  .map((c) => `[ ] ${c.task}${c.description ? `\n    ${c.description}` : ""}`)
  .join("\n")}

**After the Interview:**
${guide.checklist
  .filter((c) => c.category === "after")
  .map((c) => `[ ] ${c.task}${c.description ? `\n    ${c.description}` : ""}`)
  .join("\n")}

---`);

  sections.push(`### Likely Interview Questions

${guide.questions
  .map(
    (q, i) => `**${i + 1}. ${q.question}**
Category: ${q.category}
Tips:
${q.tips.map((t) => `  - ${t}`).join("\n")}
`
  )
  .join("\n")}

---

Good luck with your interview! 🎯`);

  return sections.join("\n\n");
}
