import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ResumePreview } from "./resume-preview";
import type { TailoredResume } from "@/lib/resume/generator";

vi.mock("./export-menu", () => ({
  ExportMenu: ({ resume }: { resume: TailoredResume }) => (
    <div>Export resume {resume.summary}</div>
  ),
}));

const baseResume: TailoredResume = {
  contact: {
    name: "Jane Doe",
    email: "jane@example.com",
    phone: "555-1234",
    location: "New York, NY",
  },
  summary: "React engineer.",
  experiences: [
    {
      company: "Acme",
      title: "Senior Engineer",
      dates: "2020 - Present",
      highlights: ["Built TypeScript systems."],
    },
  ],
  skills: ["React", "TypeScript"],
  education: [],
};

const improvedResume: TailoredResume = {
  ...baseResume,
  summary: "React TypeScript GraphQL Kubernetes engineer.",
  skills: ["React", "TypeScript", "GraphQL", "Kubernetes"],
};

function renderPreview(onResumeChange = vi.fn()) {
  render(
    <ResumePreview
      resume={baseResume}
      pdfUrl="/resume.html"
      resumeId="resume-1"
      matchScore={50}
      templateId="classic"
      templates={[]}
      onTemplateChange={vi.fn()}
      keywordsFound={["react", "typescript"]}
      keywordsMissing={["graphql", "kubernetes"]}
      jobDescription="React TypeScript GraphQL Kubernetes"
      onResumeChange={onResumeChange}
    />
  );
}

describe("ResumePreview Auto-Tailor", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rewrites the displayed resume and can revert to the original resume", async () => {
    const onResumeChange = vi.fn();
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => {
      return new Response(JSON.stringify({ resume: improvedResume }), {
        status: 200,
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    renderPreview(onResumeChange);

    fireEvent.click(screen.getByRole("button", { name: "Auto-Tailor" }));

    expect(
      await screen.findAllByText("React TypeScript GraphQL Kubernetes engineer.")
    ).not.toHaveLength(0);
    expect(onResumeChange).toHaveBeenLastCalledWith(improvedResume);

    const body = JSON.parse(
      String(fetchMock.mock.calls[0][1]?.body)
    ) as Record<string, unknown>;
    expect(body.resume).toMatchObject({ summary: "React engineer." });

    fireEvent.click(screen.getByRole("button", { name: "Revert" }));

    await waitFor(() => {
      expect(onResumeChange).toHaveBeenLastCalledWith(baseResume);
    });
  });
});
