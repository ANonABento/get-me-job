import { NextRequest, NextResponse } from "next/server";
import { getJobs } from "@/lib/db/jobs";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get("format") || "json";

    const jobs = getJobs();

    if (format === "csv") {
      // CSV export
      const headers = [
        "ID",
        "Title",
        "Company",
        "Location",
        "Type",
        "Remote",
        "Salary",
        "Status",
        "Applied At",
        "Deadline",
        "URL",
        "Notes",
        "Keywords",
        "Created At",
      ];

      const rows = jobs.map((job) => [
        job.id,
        escapeCsv(job.title),
        escapeCsv(job.company),
        escapeCsv(job.location || ""),
        job.type || "",
        job.remote ? "Yes" : "No",
        escapeCsv(job.salary || ""),
        job.status || "saved",
        job.appliedAt || "",
        job.deadline || "",
        escapeCsv(job.url || ""),
        escapeCsv(job.notes || ""),
        escapeCsv(job.keywords.join("; ")),
        job.createdAt,
      ]);

      const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join(
        "\n"
      );

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="columbus-jobs-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    // JSON export
    const exportData = {
      exportedAt: new Date().toISOString(),
      version: "1.0",
      totalJobs: jobs.length,
      jobs: jobs.map((job) => ({
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.type,
        remote: job.remote,
        salary: job.salary,
        description: job.description,
        requirements: job.requirements,
        responsibilities: job.responsibilities,
        keywords: job.keywords,
        url: job.url,
        status: job.status,
        appliedAt: job.appliedAt,
        deadline: job.deadline,
        notes: job.notes,
        createdAt: job.createdAt,
      })),
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="columbus-jobs-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("Export jobs error:", error);
    return NextResponse.json(
      { error: "Failed to export jobs" },
      { status: 500 }
    );
  }
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
