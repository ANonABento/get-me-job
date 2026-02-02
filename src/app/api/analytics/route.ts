import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getJobs } from "@/lib/db/jobs";
import { getProfile, getDocuments } from "@/lib/db";
import { getInterviewSessions } from "@/lib/db/interviews";
import { getAllGeneratedResumes } from "@/lib/db/resumes";
import { saveAnalyticsSnapshot } from "@/lib/db/analytics";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Switch to Drizzle queries with userId once Neon is configured
    const profile = getProfile();
    const jobs = getJobs();
    const documents = getDocuments();
    const interviews = getInterviewSessions();
    const resumes = getAllGeneratedResumes();

    // Calculate profile completeness
    let profileScore = 0;
    if (profile) {
      if (profile.contact?.name) profileScore += 15;
      if (profile.contact?.email) profileScore += 10;
      if (profile.contact?.phone) profileScore += 5;
      if (profile.summary && profile.summary.length > 50) profileScore += 15;
      if (profile.experiences.length > 0) profileScore += 20;
      if (profile.education.length > 0) profileScore += 10;
      if (profile.skills.length >= 3) profileScore += 15;
      if (profile.projects.length > 0) profileScore += 5;
      if (profile.certifications.length > 0) profileScore += 5;
    }

    // Job status breakdown
    const jobsByStatus = jobs.reduce((acc, job) => {
      const status = job.status || "saved";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Interview stats
    const completedInterviews = interviews.filter((i) => i.status === "completed").length;
    const inProgressInterviews = interviews.filter((i) => i.status === "in_progress").length;

    // Skill gaps (from all jobs)
    const allKeywords = jobs.flatMap((j) => j.keywords || []);
    const profileSkills = profile?.skills.map((s) => s.name.toLowerCase()) || [];
    const skillGaps = Array.from(new Set(
      allKeywords
        .filter((kw) => !profileSkills.some((s) => s.includes(kw.toLowerCase()) || kw.toLowerCase().includes(s)))
        .map((kw) => kw.toLowerCase())
    )).slice(0, 10);

    // Recent activity
    const recentJobs = jobs.slice(0, 5).map((j) => ({
      id: j.id,
      title: j.title,
      company: j.company,
      status: j.status || "saved",
      createdAt: j.createdAt,
    }));

    const analytics = {
      overview: {
        profileCompleteness: Math.min(profileScore, 100),
        totalJobs: jobs.length,
        totalDocuments: documents.length,
        totalInterviews: interviews.length,
        totalResumesGenerated: resumes.length,
      },
      jobs: {
        byStatus: jobsByStatus,
        total: jobs.length,
        applied: jobsByStatus["applied"] || 0,
        interviewing: jobsByStatus["interviewing"] || 0,
        offered: jobsByStatus["offered"] || 0,
        rejected: jobsByStatus["rejected"] || 0,
      },
      interviews: {
        total: interviews.length,
        completed: completedInterviews,
        inProgress: inProgressInterviews,
      },
      skills: {
        total: profile?.skills.length || 0,
        gaps: skillGaps,
        byCategory: profile?.skills.reduce((acc, s) => {
          acc[s.category] = (acc[s.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {},
      },
      recent: {
        jobs: recentJobs,
      },
    };

    // Save today's snapshot for historical tracking
    try {
      const today = new Date().toISOString().split("T")[0];
      saveAnalyticsSnapshot({
        userId: "default", // TODO: Use actual userId when multi-user is ready
        snapshotDate: today,
        totalJobs: jobs.length,
        jobsSaved: jobsByStatus["saved"] || 0,
        jobsApplied: jobsByStatus["applied"] || 0,
        jobsInterviewing: jobsByStatus["interviewing"] || 0,
        jobsOffered: jobsByStatus["offered"] || 0,
        jobsRejected: jobsByStatus["rejected"] || 0,
        totalInterviews: interviews.length,
        interviewsCompleted: completedInterviews,
        totalDocuments: documents.length,
        totalResumes: resumes.length,
        profileCompleteness: Math.min(profileScore, 100),
      });
    } catch (snapshotError) {
      console.error("Failed to save analytics snapshot:", snapshotError);
      // Don't fail the request if snapshot fails
    }

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to get analytics" },
      { status: 500 }
    );
  }
}
