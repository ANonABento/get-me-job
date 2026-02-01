import { NextRequest, NextResponse } from "next/server";
import { getProfile, getDocuments } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get("format") || "json";

    const profile = getProfile();
    if (!profile) {
      return NextResponse.json(
        { error: "No profile data found" },
        { status: 404 }
      );
    }

    const documents = getDocuments();

    const exportData = {
      exportedAt: new Date().toISOString(),
      version: "1.0",
      profile: {
        contact: profile.contact,
        summary: profile.summary,
        experiences: profile.experiences.map((exp) => ({
          company: exp.company,
          title: exp.title,
          location: exp.location,
          startDate: exp.startDate,
          endDate: exp.endDate,
          current: exp.current,
          description: exp.description,
          highlights: exp.highlights,
          skills: exp.skills,
        })),
        education: profile.education.map((edu) => ({
          institution: edu.institution,
          degree: edu.degree,
          field: edu.field,
          startDate: edu.startDate,
          endDate: edu.endDate,
          gpa: edu.gpa,
          highlights: edu.highlights,
        })),
        skills: profile.skills.map((skill) => ({
          name: skill.name,
          category: skill.category,
          proficiency: skill.proficiency,
        })),
        projects: profile.projects.map((proj) => ({
          name: proj.name,
          description: proj.description,
          url: proj.url,
          technologies: proj.technologies,
          highlights: proj.highlights,
        })),
        certifications: profile.certifications.map((cert) => ({
          name: cert.name,
          issuer: cert.issuer,
          date: cert.date,
          url: cert.url,
        })),
      },
      documents: documents.map((doc) => ({
        filename: doc.filename,
        type: doc.type,
        uploadedAt: doc.uploadedAt,
      })),
    };

    if (format === "json") {
      return new NextResponse(JSON.stringify(exportData, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="columbus-profile-${new Date().toISOString().split("T")[0]}.json"`,
        },
      });
    }

    // For other formats, return JSON with content type
    return NextResponse.json(exportData);
  } catch (error) {
    console.error("Export profile error:", error);
    return NextResponse.json(
      { error: "Failed to export profile" },
      { status: 500 }
    );
  }
}
