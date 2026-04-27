import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TailoredResumeWorkspace } from "./tailored-resume-workspace";
import type { TailoredResume } from "@/lib/resume/generator";

const exportMocks = vi.hoisted(() => ({
  downloadHtmlAsPdf: vi.fn(),
}));

vi.mock("@/components/tailor/jd-input", () => ({
  JDInput: ({
    onSubmit,
    isLoading,
  }: {
    onSubmit: (input: {
      jobDescription: string;
      jobTitle: string;
      company: string;
    }) => void;
    isLoading: boolean;
  }) => (
    <button
      type="button"
      disabled={isLoading}
      onClick={() =>
        onSubmit({
          jobDescription:
            "We need a senior engineer with React and TypeScript experience.",
          jobTitle: "Senior Engineer",
          company: "Acme",
        })
      }
    >
      Generate Tailored Resume
    </button>
  ),
}));

vi.mock("@/components/tailor/gap-analysis", () => ({
  GapAnalysis: ({ matchScore }: { matchScore: number }) => (
    <div>Gap score {matchScore}</div>
  ),
}));

vi.mock("@/components/builder/resume-preview", () => ({
  ResumePreview: ({ html }: { html: string }) => (
    <div data-testid="resume-html">{html}</div>
  ),
}));

vi.mock("@/lib/builder/document-export", async () => {
  const actual = await vi.importActual<
    typeof import("@/lib/builder/document-export")
  >("@/lib/builder/document-export");

  return {
    ...actual,
    downloadHtmlAsPdf: exportMocks.downloadHtmlAsPdf,
  };
});

const generatedResume: TailoredResume = {
  contact: { name: "Jane Doe" },
  summary: "Experienced engineer.",
  experiences: [
    {
      company: "Widgets Inc",
      title: "Senior Engineer",
      dates: "2020 - Present",
      highlights: ["Built reliable systems."],
    },
  ],
  skills: ["React", "TypeScript"],
  education: [],
};

describe("TailoredResumeWorkspace", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    exportMocks.downloadHtmlAsPdf.mockResolvedValue(undefined);
  });

  it("renders existing tailored resume HTML when the template changes and exports the updated HTML", async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body ?? "{}")) as {
        action?: string;
      };

      if (body.action === "render") {
        return new Response(
          JSON.stringify({ success: true, html: "modern-html" }),
          { status: 200 }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          html: "classic-html",
          resume: generatedResume,
          analysis: {
            matchScore: 82,
            keywordsFound: ["React"],
            keywordsMissing: ["GraphQL"],
            gaps: [],
            matchedEntriesCount: 2,
          },
        }),
        { status: 200 }
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<TailoredResumeWorkspace />);

    fireEvent.click(screen.getByRole("button", { name: /generate tailored/i }));

    expect(await screen.findByTestId("resume-html")).toHaveTextContent(
      "classic-html"
    );

    fireEvent.change(
      screen.getByRole("combobox", { name: /resume template/i }),
      {
        target: { value: "modern" },
      }
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    const generateBody = JSON.parse(
      String(fetchMock.mock.calls[0][1]?.body)
    ) as Record<string, unknown>;
    const renderBody = JSON.parse(
      String(fetchMock.mock.calls[1][1]?.body)
    ) as Record<string, unknown>;

    expect(generateBody).toMatchObject({
      action: "generate",
      templateId: "classic",
    });
    expect(renderBody).toMatchObject({
      action: "render",
      templateId: "modern",
      resume: generatedResume,
    });
    expect(screen.getByTestId("resume-html")).toHaveTextContent("modern-html");

    fireEvent.click(screen.getByRole("button", { name: /download pdf/i }));

    await waitFor(() =>
      expect(exportMocks.downloadHtmlAsPdf).toHaveBeenCalledWith(
        "modern-html",
        "tailored-resume-acme.pdf"
      )
    );
  });
});
