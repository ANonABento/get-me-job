import { NextRequest, NextResponse } from "next/server";
import { requireExtensionAuth } from "@/lib/extension-auth";
import { createJob } from "@/lib/db/jobs";

// POST - Import a job from extension
export async function POST(request: NextRequest) {
  const authResult = requireExtensionAuth(request);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const data = await request.json();

    if (!data.title || !data.company) {
      return NextResponse.json(
        { error: "Title and company are required" },
        { status: 400 }
      );
    }

    // Handle both single job and batch
    if (Array.isArray(data.jobs)) {
      // Batch import
      const results = [];
      for (const jobData of data.jobs) {
        if (!jobData.title || !jobData.company) continue;
        const job = createJob(
          {
            title: jobData.title,
            company: jobData.company,
            location: jobData.location,
            description: jobData.description || "",
            requirements: jobData.requirements || [],
            responsibilities: jobData.responsibilities || [],
            keywords: jobData.keywords || [],
            type: jobData.type,
            remote: jobData.remote,
            salary: jobData.salary,
            url: jobData.url,
            deadline: jobData.deadline,
            status: "saved",
          },
          authResult.userId
        );
        results.push(job.id);
      }
      return NextResponse.json({ imported: results.length, jobIds: results });
    }

    // Single import
    const job = createJob(
      {
        title: data.title,
        company: data.company,
        location: data.location,
        description: data.description || "",
        requirements: data.requirements || [],
        responsibilities: data.responsibilities || [],
        keywords: data.keywords || [],
        type: data.type,
        remote: data.remote,
        salary: data.salary,
        url: data.url,
        deadline: data.deadline,
        status: "saved",
      },
      authResult.userId
    );

    return NextResponse.json({ jobId: job.id });
  } catch (error) {
    console.error("Extension job import error:", error);
    return NextResponse.json(
      { error: "Failed to import job" },
      { status: 500 }
    );
  }
}
