/**
 * @route GET /api/extension/profile
 * @description Fetch user profile with computed auto-fill values for the browser extension
 * @auth Extension token
 * @response ExtensionProfileResponse from @/types/api
 */
import { NextRequest, NextResponse } from "next/server";
import { requireExtensionAuth } from "@/lib/extension-auth";
import { getProfile } from "@/lib/db/queries";
import type { Experience, Education } from "@/types";

// GET - Fetch profile optimized for extension auto-fill
export async function GET(request: NextRequest) {
  const authResult = requireExtensionAuth(request);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const profile = getProfile(authResult.userId);

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Pre-compute common auto-fill values
    const computed = computeAutoFillValues(profile);

    return NextResponse.json({
      ...profile,
      computed,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

function computeAutoFillValues(profile: {
  contact: { name?: string; email?: string; phone?: string; location?: string; linkedin?: string; github?: string; website?: string };
  experiences: Experience[];
  education: Education[];
  skills: { name: string }[];
}) {
  const nameParts = profile.contact?.name?.split(" ") || [];
  const firstName = nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : undefined;

  // Get most recent experience (current or latest by start date)
  const sortedExperiences = [...(profile.experiences || [])].sort((a, b) => {
    if (a.current && !b.current) return -1;
    if (b.current && !a.current) return 1;
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });
  const currentExp = sortedExperiences[0];

  // Get most recent education
  const sortedEducation = [...(profile.education || [])].sort((a, b) => {
    const dateA = a.endDate ? new Date(a.endDate) : new Date();
    const dateB = b.endDate ? new Date(b.endDate) : new Date();
    return dateB.getTime() - dateA.getTime();
  });
  const latestEdu = sortedEducation[0];

  // Calculate total years of experience
  let totalMonths = 0;
  for (const exp of profile.experiences || []) {
    const start = new Date(exp.startDate);
    const end = exp.current ? new Date() : new Date(exp.endDate || new Date());
    totalMonths += (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  }
  const yearsExperience = Math.max(0, Math.round(totalMonths / 12));

  return {
    firstName,
    lastName,
    currentCompany: currentExp?.company,
    currentTitle: currentExp?.title,
    mostRecentSchool: latestEdu?.institution,
    mostRecentDegree: latestEdu?.degree,
    mostRecentField: latestEdu?.field,
    graduationYear: latestEdu?.endDate?.split("-")[0],
    yearsExperience,
    skillsList: (profile.skills || []).map((s) => s.name).join(", "),
  };
}
