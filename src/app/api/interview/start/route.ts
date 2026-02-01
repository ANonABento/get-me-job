import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/lib/db/jobs";
import { getProfile, getLLMConfig } from "@/lib/db";
import { LLMClient } from "@/lib/llm/client";

interface InterviewQuestion {
  question: string;
  category: "behavioral" | "technical" | "situational" | "general";
  suggestedAnswer?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { jobId } = await request.json();

    const job = getJob(jobId);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const profile = getProfile();
    if (!profile) {
      return NextResponse.json(
        { error: "No profile data. Upload a resume first." },
        { status: 400 }
      );
    }

    const llmConfig = getLLMConfig();
    let questions: InterviewQuestion[];

    if (llmConfig) {
      // Generate personalized questions with LLM
      const client = new LLMClient(llmConfig);

      const response = await client.complete({
        messages: [
          {
            role: "user",
            content: `Generate 8 interview questions for a ${job.title} position at ${job.company}.

JOB DESCRIPTION:
${job.description}

KEY REQUIREMENTS:
${job.keywords.join(", ")}

CANDIDATE BACKGROUND:
- Experience: ${profile.experiences.map((e) => `${e.title} at ${e.company}`).join(", ")}
- Skills: ${profile.skills.map((s) => s.name).join(", ")}

Generate a mix of:
- 2 behavioral questions (using STAR method prompts)
- 3 technical questions specific to the role
- 2 situational/problem-solving questions
- 1 general question about motivation/fit

Return ONLY a JSON array with this structure:
[
  {
    "question": "Tell me about a time when...",
    "category": "behavioral",
    "suggestedAnswer": "Use STAR method: Describe a situation where you..."
  }
]`,
          },
        ],
        temperature: 0.7,
        maxTokens: 2000,
      });

      // Parse response
      let cleanResponse = response.trim();
      if (cleanResponse.startsWith("```json")) {
        cleanResponse = cleanResponse.slice(7);
      }
      if (cleanResponse.startsWith("```")) {
        cleanResponse = cleanResponse.slice(3);
      }
      if (cleanResponse.endsWith("```")) {
        cleanResponse = cleanResponse.slice(0, -3);
      }

      questions = JSON.parse(cleanResponse.trim());
    } else {
      // Default questions without LLM
      questions = getDefaultQuestions(job.title, job.company);
    }

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Interview start error:", error);
    return NextResponse.json(
      { error: "Failed to start interview", details: String(error) },
      { status: 500 }
    );
  }
}

function getDefaultQuestions(title: string, company: string): InterviewQuestion[] {
  return [
    {
      question: `Tell me about yourself and why you're interested in the ${title} position at ${company}.`,
      category: "general",
      suggestedAnswer: "Start with your current role, highlight relevant experience, and connect to why this opportunity excites you.",
    },
    {
      question: "Describe a challenging project you worked on. What was your role and what was the outcome?",
      category: "behavioral",
      suggestedAnswer: "Use STAR method: Situation, Task, Action, Result. Focus on measurable outcomes.",
    },
    {
      question: "How do you handle disagreements with team members or stakeholders?",
      category: "behavioral",
      suggestedAnswer: "Describe your communication approach, give a specific example, and emphasize resolution.",
    },
    {
      question: "What's your approach to learning new technologies or skills?",
      category: "technical",
      suggestedAnswer: "Discuss your learning methods, recent examples, and how you stay current in your field.",
    },
    {
      question: "Describe a time when you had to meet a tight deadline. How did you handle it?",
      category: "situational",
      suggestedAnswer: "Focus on prioritization, communication, and the successful outcome.",
    },
    {
      question: "Where do you see yourself in 5 years?",
      category: "general",
      suggestedAnswer: "Align your goals with growth at the company while showing ambition.",
    },
    {
      question: "What questions do you have for us about the role or company?",
      category: "general",
      suggestedAnswer: "Prepare thoughtful questions about team culture, growth opportunities, or recent company initiatives.",
    },
  ];
}
