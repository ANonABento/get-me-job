import { describe, expect, it } from "vitest";
import { getProfileCompleteness } from "./utils";
import type { Profile } from "@/types";

const baseProfile: Profile = {
  id: "profile-1",
  contact: { name: "", email: "" },
  summary: "",
  experiences: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  createdAt: "2026-04-09T00:00:00.000Z",
  updatedAt: "2026-04-09T00:00:00.000Z",
};

describe("getProfileCompleteness", () => {
  it("returns zero for a missing profile", () => {
    expect(getProfileCompleteness(null)).toBe(0);
  });

  it("scores the expected sections", () => {
    const profile: Profile = {
      ...baseProfile,
      contact: {
        name: "Jane Doe",
        email: "jane@example.com",
      },
      summary: "Experienced engineer with a strong record of shipping customer-facing products.",
      experiences: [
        {
          id: "exp-1",
          company: "Acme",
          title: "Engineer",
          startDate: "2023",
          current: true,
          description: "",
          highlights: [],
          skills: [],
        },
      ],
      education: [
        {
          id: "edu-1",
          institution: "State University",
          degree: "BS",
          field: "Computer Science",
          highlights: [],
        },
      ],
      skills: [
        { id: "skill-1", name: "TypeScript", category: "technical" },
        { id: "skill-2", name: "React", category: "technical" },
        { id: "skill-3", name: "Node.js", category: "technical" },
      ],
    };

    expect(getProfileCompleteness(profile)).toBe(100);
  });
});
