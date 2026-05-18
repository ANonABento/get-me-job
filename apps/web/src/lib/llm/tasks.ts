export type TaskExecutionMode = "heuristic" | "optional_llm" | "needs_llm";

export type AiTaskSurface =
  | "Studio"
  | "Opportunities"
  | "Cover Letters"
  | "Interview"
  | "Email"
  | "Extension"
  | "Learning";

export interface SlothingAiTask {
  id: string;
  label: string;
  surface: AiTaskSurface;
  route?: string;
  mode: TaskExecutionMode;
  fallbackDescription?: string;
  bentoTaskId?: string;
}

export const AI_TASK_SURFACES: readonly AiTaskSurface[] = [
  "Studio",
  "Opportunities",
  "Cover Letters",
  "Interview",
  "Email",
  "Extension",
  "Learning",
] as const;

export const SLOTHING_AI_TASKS: readonly SlothingAiTask[] = [
  {
    id: "studio.template_import",
    label: "Template import",
    surface: "Studio",
    route: "POST /api/templates/import",
    mode: "optional_llm",
    fallbackDescription:
      "Extracts template style signals with deterministic PDF, DOCX, and LaTeX heuristics.",
    bentoTaskId: "slothing.profile_extract",
  },
  {
    id: "studio.template_analyze",
    label: "Template text analyze",
    surface: "Studio",
    route: "POST /api/templates/analyze",
    mode: "optional_llm",
    fallbackDescription:
      "Uses text structure, bullets, section dividers, and spacing estimates when no model is available.",
    bentoTaskId: "slothing.profile_extract",
  },
  {
    id: "studio.tailor_analysis",
    label: "Tailor analysis",
    surface: "Studio",
    route: "POST /api/tailor action=analyze",
    mode: "heuristic",
    fallbackDescription:
      "Keyword matching and fit analysis run locally without a provider.",
  },
  {
    id: "studio.template_render",
    label: "Template render",
    surface: "Studio",
    route: "POST /api/tailor action=render",
    mode: "heuristic",
    fallbackDescription: "Renders the selected resume template locally.",
  },
  {
    id: "studio.tailor_generate",
    label: "Tailor generate from bank",
    surface: "Studio",
    route: "POST /api/tailor action=generate",
    mode: "optional_llm",
    fallbackDescription:
      "Builds a base tailored resume from matched knowledge-bank entries.",
    bentoTaskId: "slothing.tailor_resume",
  },
  {
    id: "studio.parse_basic",
    label: "Resume parse, basic mode",
    surface: "Studio",
    route: "POST /api/parse mode=basic",
    mode: "heuristic",
    fallbackDescription: "Parses resume text with the local smart parser.",
  },
  {
    id: "studio.parse_ai",
    label: "Resume parse, AI mode",
    surface: "Studio",
    route: "POST /api/parse mode=ai",
    mode: "optional_llm",
    fallbackDescription:
      "Falls back to the smart parser when no model is available.",
    bentoTaskId: "slothing.parse_resume",
  },
  {
    id: "studio.upload_classification",
    label: "Upload classification",
    surface: "Studio",
    route: "POST /api/upload",
    mode: "optional_llm",
    fallbackDescription:
      "Classifies documents from extracted content and filename signals.",
    bentoTaskId: "slothing.profile_extract",
  },
  {
    id: "studio.document_assistant",
    label: "Document assistant rewrite",
    surface: "Studio",
    route: "POST /api/documents/assistant",
    mode: "needs_llm",
    bentoTaskId: "slothing.tailor_resume",
  },
  {
    id: "studio.tailor_autofix",
    label: "Tailor autofix",
    surface: "Studio",
    route: "POST /api/tailor/autofix",
    mode: "needs_llm",
    bentoTaskId: "slothing.tailor_resume",
  },
  {
    id: "opportunities.resume_generate",
    label: "Opportunity resume generate",
    surface: "Opportunities",
    route: "POST /api/opportunities/[id]/generate",
    mode: "optional_llm",
    fallbackDescription:
      "Falls back to a deterministic resume generated from the opportunity and profile bank.",
    bentoTaskId: "slothing.tailor_resume",
  },
  {
    id: "opportunities.match_analysis",
    label: "Opportunity match analysis",
    surface: "Opportunities",
    route: "POST /api/opportunities/[id]/analyze",
    mode: "optional_llm",
    fallbackDescription:
      "Uses basic keyword overlap and requirement matching when no model is available.",
    bentoTaskId: "slothing.score_match",
  },
  {
    id: "opportunities.legacy_keyword_extract",
    label: "Legacy keyword extraction",
    surface: "Opportunities",
    route: "POST /api/opportunities",
    mode: "optional_llm",
    fallbackDescription:
      "Extracts known technology keywords from the job description.",
    bentoTaskId: "slothing.opportunity_extract",
  },
  {
    id: "opportunities.cover_letter",
    label: "Opportunity cover letter",
    surface: "Opportunities",
    route: "POST /api/opportunities/[id]/cover-letter",
    mode: "optional_llm",
    fallbackDescription:
      "Composes a basic cover letter from profile summary, recent experience, skills, and the role.",
    bentoTaskId: "slothing.cover_letter_generate",
  },
  {
    id: "opportunities.salary_negotiate",
    label: "Salary negotiation script",
    surface: "Opportunities",
    route: "POST /api/salary/negotiate",
    mode: "optional_llm",
    fallbackDescription:
      "Generates a structured negotiation script from offer numbers and role context.",
    bentoTaskId: "slothing.answer_generate",
  },
  {
    id: "cover_letters.stream",
    label: "Streaming cover letter",
    surface: "Cover Letters",
    route: "POST /api/opportunities/[id]/cover-letter/stream",
    mode: "needs_llm",
    bentoTaskId: "slothing.cover_letter_generate",
  },
  {
    id: "cover_letters.generate",
    label: "Generate, revise, or rewrite cover letter",
    surface: "Cover Letters",
    route: "POST /api/cover-letter/generate",
    mode: "needs_llm",
    bentoTaskId: "slothing.cover_letter_generate",
  },
  {
    id: "cover_letters.critique",
    label: "Cover letter critique",
    surface: "Cover Letters",
    route: "POST /api/ai/critique-cover-letter",
    mode: "needs_llm",
    bentoTaskId: "slothing.cover_letter_generate",
  },
  {
    id: "email.generate_template",
    label: "Email template mode",
    surface: "Email",
    route: "POST /api/email/generate useLLM=false",
    mode: "heuristic",
    fallbackDescription:
      "Fills the selected email template with profile and job context.",
  },
  {
    id: "email.generate_llm_requested",
    label: "Email generation with LLM requested",
    surface: "Email",
    route: "POST /api/email/generate useLLM=true",
    mode: "optional_llm",
    fallbackDescription:
      "Falls back to the same deterministic email template when no model is available.",
    bentoTaskId: "slothing.answer_generate",
  },
  {
    id: "interview.start",
    label: "Interview start questions",
    surface: "Interview",
    route: "POST /api/interview/start",
    mode: "optional_llm",
    fallbackDescription:
      "Uses default job-aware or category-specific question sets.",
    bentoTaskId: "slothing.answer_generate",
  },
  {
    id: "interview.answer",
    label: "Interview answer feedback",
    surface: "Interview",
    route: "POST /api/interview/answer",
    mode: "optional_llm",
    fallbackDescription:
      "Scores answer length and gives STAR-method coaching without a model.",
    bentoTaskId: "slothing.answer_generate",
  },
  {
    id: "interview.followup",
    label: "Interview follow-up question",
    surface: "Interview",
    route: "POST /api/interview/followup",
    mode: "optional_llm",
    fallbackDescription:
      "Generates follow-up prompts from answer length, metrics, results, and question category.",
    bentoTaskId: "slothing.answer_generate",
  },
  {
    id: "interview.prep_guide",
    label: "Interview prep guide",
    surface: "Interview",
    route: "GET /api/interview/prep-guide",
    mode: "optional_llm",
    fallbackDescription:
      "Builds a prep guide from opportunity keywords, profile skills, and company research.",
    bentoTaskId: "slothing.answer_generate",
  },
  {
    id: "learning.paths_base",
    label: "Learning paths",
    surface: "Learning",
    route: "GET /api/learning/paths?enhance=false",
    mode: "heuristic",
    fallbackDescription:
      "Compares profile skills with saved opportunities and emits default resources.",
  },
  {
    id: "learning.paths_enhanced",
    label: "Enhanced learning resources",
    surface: "Learning",
    route: "GET /api/learning/paths?enhance=true",
    mode: "optional_llm",
    fallbackDescription:
      "Returns base learning paths with default resource suggestions.",
    bentoTaskId: "slothing.answer_generate",
  },
  {
    id: "extension.chat",
    label: "Extension chat",
    surface: "Extension",
    route: "POST /api/extension/chat",
    mode: "needs_llm",
    bentoTaskId: "slothing.answer_generate",
  },
  {
    id: "extension.resume_generate",
    label: "Retrieval resume generation",
    surface: "Extension",
    route: "POST /api/resume/generate",
    mode: "needs_llm",
    bentoTaskId: "slothing.tailor_resume",
  },
] as const;

export function getAiTasksBySurface() {
  return AI_TASK_SURFACES.map((surface) => ({
    surface,
    tasks: SLOTHING_AI_TASKS.filter((task) => task.surface === surface),
  })).filter((group) => group.tasks.length > 0);
}
