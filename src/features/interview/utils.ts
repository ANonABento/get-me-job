import type { JobDescription } from "@/types";
import type { InterviewPracticeSession } from "@/features/interview/client-types";

export function formatInterviewForDocs(
  session: InterviewPracticeSession,
  job?: JobDescription
): string {
  const lines: string[] = [];
  lines.push("Interview Preparation Notes");
  lines.push("=".repeat(30));
  lines.push("");

  if (job) {
    lines.push(`Position: ${job.title}`);
    lines.push(`Company: ${job.company}`);
    lines.push("");
  }

  lines.push(`Date: ${new Date().toLocaleDateString()}`);
  lines.push(`Mode: ${session.mode === "voice" ? "Voice" : "Text"}`);
  lines.push(`Questions: ${session.questions.length}`);
  lines.push("");
  lines.push("=".repeat(30));
  lines.push("");

  session.questions.forEach((question, index) => {
    lines.push(`Question ${index + 1} (${question.category})`);
    lines.push("-".repeat(20));
    lines.push(question.question);
    lines.push("");
    lines.push("Your Answer:");
    lines.push(session.answers[index] || "(No answer provided)");
    lines.push("");

    if (session.feedback[index]) {
      lines.push("AI Feedback:");
      lines.push(session.feedback[index]);
    }

    lines.push("");
    lines.push("");
  });

  return lines.join("\n");
}
