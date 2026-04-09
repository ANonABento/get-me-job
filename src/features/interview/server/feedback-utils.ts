export function getBasicInterviewFeedback(answer: string): string {
  const wordCount = answer.split(/\s+/).length;

  if (wordCount < 20) {
    return "Your answer is quite brief. Try to elaborate more with specific examples using the STAR method (Situation, Task, Action, Result).";
  }

  if (wordCount > 200) {
    return "Good detail in your answer! Consider being more concise - aim for 1-2 minutes when speaking. Focus on the most impactful points.";
  }

  return "Good job! Your answer has a good length. Remember to include specific metrics and outcomes when possible to make your answers more impactful.";
}
