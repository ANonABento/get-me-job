import { describe, expect, it } from "vitest";
import {
  buildResumeDefaults,
  formValuesToProfileUpdate,
  getProfileInitials,
  joinProfileList,
  profileToFormValues,
  splitProfileList,
  type ProfileFormValues,
} from "./profile-form";
import type { Profile } from "@/types";

const baseProfile: Profile = {
  id: "profile-1",
  contact: {
    name: "Ada Lovelace",
    email: "ada@example.com",
  },
  summary: "Analytical engineering leader.",
  experiences: [
    {
      id: "exp-1",
      company: "Engines Inc",
      title: "Staff Engineer",
      location: "Remote",
      startDate: "2023-01",
      current: true,
      description: "",
      highlights: [],
      skills: [],
    },
    {
      id: "exp-2",
      company: "Math Lab",
      title: "Software Engineer",
      startDate: "2020-01",
      current: false,
      description: "",
      highlights: [],
      skills: [],
    },
  ],
  education: [],
  skills: [
    { id: "skill-1", name: "TypeScript", category: "technical" },
    { id: "skill-2", name: "React", category: "tool" },
    { id: "skill-3", name: "Mentoring", category: "soft" },
  ],
  projects: [],
  certifications: [],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("profile-form", () => {
  it("splits and joins comma or newline separated profile lists", () => {
    expect(splitProfileList("Engineer, Manager\nEngineer, ")).toEqual([
      "Engineer",
      "Manager",
    ]);
    expect(joinProfileList(["Engineer", " Manager ", "Engineer"])).toBe(
      "Engineer, Manager",
    );
  });

  it("builds initials from a profile name", () => {
    expect(getProfileInitials("Ada Lovelace")).toBe("AL");
    expect(getProfileInitials("")).toBe("P");
  });

  it("derives defaults from resume experience and skills", () => {
    expect(buildResumeDefaults(baseProfile)).toEqual({
      headline: "Staff Engineer at Engines Inc",
      targetRoles: [
        "Staff Engineer",
        "Software Engineer",
        "TypeScript role",
        "React role",
      ],
    });
  });

  it("uses persisted contact values before resume-derived defaults", () => {
    const profile = {
      ...baseProfile,
      contact: {
        ...baseProfile.contact,
        headline: "Product-minded platform engineer",
        targetRoles: ["Platform Lead"],
        workStyle: ["remote"],
      },
    };

    expect(profileToFormValues(profile)).toMatchObject({
      headline: "Product-minded platform engineer",
      targetRoles: ["Platform Lead"],
      workStyle: ["remote"],
    });
  });

  it("converts form state to a profile update payload", () => {
    const values: ProfileFormValues = {
      ...profileToFormValues(baseProfile),
      name: " Ada Byron ",
      targetRoles: ["Engineering Manager", " Engineering Manager ", "Staff Engineer"],
      workStyle: ["remote", "hybrid"],
      targetSalaryMin: "150000",
      targetSalaryMax: "190000",
      openToRecruiters: true,
      shareContactInfo: true,
    };

    expect(formValuesToProfileUpdate(values, baseProfile)).toMatchObject({
      contact: {
        name: "Ada Byron",
        email: "ada@example.com",
        targetRoles: ["Engineering Manager", "Staff Engineer"],
        workStyle: ["remote", "hybrid"],
        targetSalaryMin: "150000",
        targetSalaryMax: "190000",
        targetSalaryCurrency: "USD",
        openToRecruiters: true,
        shareContactInfo: true,
      },
      summary: "Analytical engineering leader.",
    });
  });
});
