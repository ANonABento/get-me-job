import { describe, expect, it } from "vitest";
import {
  HACKATHON_TEMPLATES,
  applyHackathonTemplate,
  getHackathonTemplate,
} from "./hackathon-templates";

describe("hackathon templates", () => {
  it("exposes smart defaults for multiple hackathon shapes", () => {
    expect(HACKATHON_TEMPLATES.length).toBeGreaterThanOrEqual(3);
    expect(getHackathonTemplate("devpost-online")?.defaults).toEqual(
      expect.objectContaining({
        organizer: "Devpost",
        location: "Online",
        teamSizeMax: "4",
      })
    );
  });

  it("applies defaults while preserving meaningful existing content", () => {
    const result = applyHackathonTemplate(
      {
        name: "AI Build Weekend",
        location: "Montevideo",
        prizes: [],
      },
      "devpost-online"
    );

    expect(result.name).toBe("AI Build Weekend");
    expect(result.location).toBe("Montevideo");
    expect(result.organizer).toBe("Devpost");
    expect(result.prizes).toEqual([
      "Grand Prize",
      "Best Use of Sponsor API",
      "Community Choice",
    ]);
  });

  it("returns unchanged content for unknown templates", () => {
    const content = { name: "Unknown Event" };
    expect(applyHackathonTemplate(content, "missing")).toBe(content);
  });
});
