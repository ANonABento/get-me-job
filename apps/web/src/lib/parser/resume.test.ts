import { describe, expect, it } from "vitest";
import {
  parseCareerNotesBasic,
  parseCoverLetterBasic,
  parsePortfolioBasic,
} from "./resume";

describe("career document deterministic parsers", () => {
  it("extracts cover-letter paragraphs and selling points", () => {
    const parsed = parseCoverLetterBasic(
      "Dear Hiring Manager,\n\nI am applying for the Product Engineer role at Acme Corp because I have built onboarding systems that improved activation by 22%.\n\nAt Beta, I led a cross-functional launch for 12,000 users and shipped reusable analytics dashboards.\n\nSincerely,\nAda",
    );

    expect(parsed.targetCompany).toBe("Acme Corp");
    expect(parsed.targetPosition).toBe("Product Engineer");
    expect(parsed.tone).toBe("professional");
    expect(parsed.reusableParagraphs).toEqual(
      expect.arrayContaining([
        expect.stringContaining("built onboarding systems"),
        expect.stringContaining("cross-functional launch"),
      ]),
    );
    expect(parsed.keySellingPoints).toEqual(
      expect.arrayContaining([expect.stringContaining("improved activation")]),
    );
  });

  it("extracts portfolio project URL, stack, proof points, and bullets", () => {
    const parsed = parsePortfolioBasic(
      "Selected Work\n\nProject: Launch Metrics\nhttps://github.com/ada/launch-metrics\nStack: Next.js, PostgreSQL\n- Built dashboards for 12,000 users\n- Reduced reporting latency by 45%",
    );

    expect(parsed.links).toContain("https://github.com/ada/launch-metrics");
    expect(parsed.projects).toEqual([
      expect.objectContaining({
        name: "Launch Metrics",
        url: "https://github.com/ada/launch-metrics",
        technologies: ["Next.js", "PostgreSQL"],
        bullets: [
          "Built dashboards for 12,000 users",
          "Reduced reporting latency by 45%",
        ],
        proofPoints: expect.arrayContaining([
          "Built dashboards for 12,000 users",
          "Reduced reporting latency by 45%",
        ]),
      }),
    ]);
  });

  it("extracts career notes into loose bullets, achievements, paragraphs, projects, and skills", () => {
    const parsed = parseCareerNotesBasic(
      "Career notes\nSkills: React, facilitation\n\nThis paragraph captures how I explain onboarding work in applications and should be reusable later.\n\n- Improved onboarding completion by 18%\n- Built Project Atlas for support teams\n- Mentored two interns on testing habits",
    );

    expect(parsed.skills).toEqual(["React", "facilitation"]);
    expect(parsed.paragraphs).toEqual([
      "This paragraph captures how I explain onboarding work in applications and should be reusable later.",
    ]);
    expect(parsed.bullets).toEqual(
      expect.arrayContaining([
        "Improved onboarding completion by 18%",
        "Built Project Atlas for support teams",
      ]),
    );
    expect(parsed.achievements).toEqual([
      "Improved onboarding completion by 18%",
    ]);
    expect(parsed.projects).toEqual([
      expect.objectContaining({
        name: "Atlas for support teams",
        bullets: ["Built Project Atlas for support teams"],
      }),
    ]);
  });
});
