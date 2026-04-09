import { describe, expect, it } from "vitest";
import { getBasicInterviewFeedback } from "@/features/interview/server/feedback-utils";

describe("getBasicInterviewFeedback", () => {
  it("flags short answers", () => {
    expect(getBasicInterviewFeedback("too short answer")).toContain("quite brief");
  });

  it("flags long answers", () => {
    const answer = new Array(220).fill("word").join(" ");
    expect(getBasicInterviewFeedback(answer)).toContain("being more concise");
  });

  it("encourages medium-length answers", () => {
    const answer = new Array(60).fill("word").join(" ");
    expect(getBasicInterviewFeedback(answer)).toContain("Good job");
  });
});
