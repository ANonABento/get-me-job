import { describe, expect, it } from "vitest";
import {
  buildCoverLetterCritiqueMessages,
  parseCoverLetterCritiqueResponse,
} from "./critique-prompts";

describe("cover letter critique prompts", () => {
  it("builds system and user prompts with the rubric and draft context", () => {
    const messages = buildCoverLetterCritiqueMessages({
      letter: "Dear Acme, I built reliable systems.",
      jd: "Acme needs a product engineer for developer tooling.",
      company: "Acme",
      role: "Product Engineer",
    });

    expect(messages[0]).toMatchObject({ role: "system" });
    expect(messages[0].content).toContain("Company fit");
    expect(messages[0].content).toContain("range_in_letter");
    expect(messages[1]).toEqual({
      role: "user",
      content: expect.stringContaining("Company: Acme"),
    });
    expect(messages[1].content).toContain("Role: Product Engineer");
    expect(messages[1].content).toContain("Dear Acme");
  });

  it("parses validated critique JSON from fenced LLM output", () => {
    const critique = parseCoverLetterCritiqueResponse(`\`\`\`json
{
  "scores": { "fit": 8, "specificity": 7, "hook": 6, "ask": 9 },
  "overall": 7.5,
  "rationale_per_axis": {
    "fit": "Names Acme and the tooling problem.",
    "specificity": "Includes some concrete systems.",
    "hook": "Opening is clear but not sharp.",
    "ask": "Close asks for a conversation."
  },
  "suggested_rewrites": [
    {
      "range_in_letter": "I built reliable systems.",
      "suggestion": "I improved reliability for developer workflows used daily.",
      "why": "Adds a clearer scope."
    },
    {
      "range_in_letter": "Dear Acme",
      "suggestion": "Dear Acme hiring team",
      "why": "Sounds more direct."
    }
  ]
}
\`\`\``);

    expect(critique.overall).toBe(7.5);
    expect(critique.scores.fit).toBe(8);
    expect(critique.suggested_rewrites).toHaveLength(2);
  });

  it("rejects responses with too few rewrite suggestions", () => {
    expect(() =>
      parseCoverLetterCritiqueResponse(
        JSON.stringify({
          scores: { fit: 8, specificity: 7, hook: 6, ask: 9 },
          overall: 7.5,
          rationale_per_axis: {
            fit: "Fit",
            specificity: "Specific",
            hook: "Hook",
            ask: "Ask",
          },
          suggested_rewrites: [
            {
              range_in_letter: "Generic sentence.",
              suggestion: "Better sentence.",
              why: "More specific.",
            },
          ],
        }),
      ),
    ).toThrow();
  });
});
