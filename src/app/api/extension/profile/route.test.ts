import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireExtensionAuth: vi.fn(),
  getProfile: vi.fn(),
}));

vi.mock("@/lib/extension-auth", () => ({
  requireExtensionAuth: mocks.requireExtensionAuth,
}));

vi.mock("@/lib/db/drizzle/queries/profile", () => ({
  getProfile: mocks.getProfile,
}));

import { GET } from "./route";

describe("extension profile route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireExtensionAuth.mockReturnValue({ success: true, userId: "user-1" });
  });

  it("loads the profile from the Drizzle query layer and returns computed autofill values", async () => {
    mocks.getProfile.mockResolvedValueOnce({
      id: "profile-1",
      contact: { name: "Ada Lovelace", email: "ada@example.com" },
      experiences: [
        {
          id: "exp-1",
          company: "Analytical Engines",
          title: "Programmer",
          startDate: "2022-01-01",
          endDate: "2024-01-01",
          current: false,
          description: "",
          highlights: [],
          skills: [],
        },
        {
          id: "exp-2",
          company: "Current Co",
          title: "Staff Engineer",
          startDate: "2024-02-01",
          current: true,
          description: "",
          highlights: [],
          skills: [],
        },
      ],
      education: [
        {
          id: "edu-1",
          institution: "University",
          degree: "BS",
          field: "Computing",
          endDate: "2020-05-01",
          highlights: [],
        },
      ],
      skills: [{ id: "skill-1", name: "TypeScript" }],
      projects: [],
      certifications: [],
    });

    const response = await GET(new NextRequest("http://localhost/api/extension/profile"));
    const body = await response.json();

    expect(mocks.getProfile).toHaveBeenCalledWith("user-1");
    expect(body.computed).toEqual(expect.objectContaining({
      firstName: "Ada",
      lastName: "Lovelace",
      currentCompany: "Current Co",
      currentTitle: "Staff Engineer",
      mostRecentSchool: "University",
      graduationYear: "2020",
      skillsList: "TypeScript",
    }));
  });

  it("returns 404 when no Drizzle profile exists for the extension user", async () => {
    mocks.getProfile.mockResolvedValueOnce(null);

    const response = await GET(new NextRequest("http://localhost/api/extension/profile"));

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "Profile not found" });
  });
});
