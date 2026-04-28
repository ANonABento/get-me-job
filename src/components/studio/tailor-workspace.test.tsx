import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TailorWorkspace } from "./tailor-workspace";
import type { TailoredResume } from "@/lib/resume/generator";

vi.mock("@/components/keyboard-shortcuts", () => ({
  useRegisterShortcuts: vi.fn(),
}));

vi.mock("@/components/tailor/gap-analysis", () => ({
  GapAnalysis: ({
    matchScore,
    keywordsFound,
    keywordsMissing,
  }: {
    matchScore: number;
    keywordsFound: string[];
    keywordsMissing: string[];
  }) => (
    <div>
      <span>Gap score {matchScore}</span>
      <span>Found {keywordsFound.join(", ")}</span>
      <span>Missing {keywordsMissing.join(", ")}</span>
    </div>
  ),
}));

vi.mock("@/components/tailor/resume-preview", () => ({
  ResumePreview: ({
    resume,
    matchScore,
    onResumeChange,
  }: {
    resume: TailoredResume;
    matchScore: number;
    onResumeChange?: (resume: TailoredResume) => void;
  }) => (
    <div>
      <div>Resume preview {resume.summary}</div>
      <div>Preview score {matchScore}</div>
      <button
        type="button"
        onClick={() =>
          onResumeChange?.({
            ...resume,
            summary: "React TypeScript GraphQL Kubernetes",
            skills: ["React", "TypeScript", "GraphQL", "Kubernetes"],
          })
        }
      >
        Mock resume update
      </button>
    </div>
  ),
}));

const generatedResume: TailoredResume = {
  contact: { name: "Jane Doe" },
  summary: "React engineer.",
  experiences: [
    {
      company: "Widgets Inc",
      title: "Senior Engineer",
      dates: "2020 - Present",
      highlights: ["Built TypeScript systems."],
    },
  ],
  skills: ["React", "TypeScript"],
  education: [],
};

describe("TailorWorkspace", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows gap analysis after a job description is pasted", async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      if (!init) {
        return new Response(
          JSON.stringify({
            templates: [{ id: "classic", name: "Classic", description: "" }],
          }),
          { status: 200 }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          analysis: {
            matchScore: 50,
            keywordsFound: ["react"],
            keywordsMissing: ["graphql"],
            gaps: [
              {
                requirement: "graphql",
                category: "skill",
                suggestion: 'Add "graphql" to Skills.',
              },
            ],
            matchedEntriesCount: 1,
          },
        }),
        { status: 200 }
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<TailorWorkspace />);

    fireEvent.change(screen.getByLabelText("Job Description"), {
      target: {
        value:
          "We need a frontend engineer with React, TypeScript, and GraphQL.",
      },
    });

    expect(await screen.findByText("Gap score 50")).toBeInTheDocument();
    expect(screen.getByText("Found react")).toBeInTheDocument();
    expect(screen.getByText("Missing graphql")).toBeInTheDocument();

    const analyzeBody = JSON.parse(
      String(fetchMock.mock.calls.at(-1)?.[1]?.body)
    ) as Record<string, unknown>;
    expect(analyzeBody.action).toBe("analyze");
  });

  it("uses Auto-Tailor to generate the full resume", async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      if (!init) {
        return new Response(JSON.stringify({ templates: [] }), { status: 200 });
      }

      const body = JSON.parse(String(init.body ?? "{}")) as {
        action?: string;
      };

      if (body.action === "analyze") {
        return new Response(
          JSON.stringify({
            success: true,
            analysis: {
              matchScore: 50,
              keywordsFound: ["react"],
              keywordsMissing: ["graphql"],
              gaps: [],
              matchedEntriesCount: 1,
            },
          }),
          { status: 200 }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          pdfUrl: "/resume.html",
          resume: generatedResume,
          savedResume: { id: "resume-1" },
          analysis: {
            matchScore: 90,
            keywordsFound: ["react", "typescript"],
            keywordsMissing: [],
            gaps: [],
            matchedEntriesCount: 2,
          },
          jobId: "job-1",
        }),
        { status: 200 }
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<TailorWorkspace />);

    fireEvent.change(screen.getByLabelText("Job Description"), {
      target: {
        value:
          "We need a frontend engineer with React, TypeScript, and GraphQL.",
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "Auto-Tailor" }));

    expect(
      await screen.findByText("Resume preview React engineer.")
    ).toBeInTheDocument();

    await waitFor(() => {
      const generateCall = fetchMock.mock.calls.find(([, init]) => {
        const body = JSON.parse(String(init?.body ?? "{}")) as {
          action?: string;
        };
        return body.action === "generate";
      });
      expect(generateCall).toBeTruthy();
    });
  });

  it("updates preview and gap scores when the resume changes", async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      if (!init) {
        return new Response(JSON.stringify({ templates: [] }), { status: 200 });
      }

      const body = JSON.parse(String(init.body ?? "{}")) as {
        action?: string;
      };

      if (body.action === "analyze") {
        return new Response(
          JSON.stringify({
            success: true,
            analysis: {
              matchScore: 25,
              keywordsFound: ["react"],
              keywordsMissing: ["graphql", "kubernetes"],
              gaps: [],
              matchedEntriesCount: 1,
            },
          }),
          { status: 200 }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          pdfUrl: "/resume.html",
          resume: generatedResume,
          savedResume: { id: "resume-1" },
          analysis: {
            matchScore: 50,
            keywordsFound: ["react", "typescript"],
            keywordsMissing: ["graphql", "kubernetes"],
            gaps: [],
            matchedEntriesCount: 2,
          },
          jobId: "job-1",
        }),
        { status: 200 }
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<TailorWorkspace />);

    fireEvent.change(screen.getByLabelText("Job Description"), {
      target: {
        value: "React TypeScript GraphQL Kubernetes",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Auto-Tailor" }));

    expect(await screen.findByText("Resume preview React engineer.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Mock resume update" }));

    await waitFor(() => {
      expect(screen.getByText("Preview score 100")).toBeInTheDocument();
      expect(screen.getAllByText("Gap score 100").length).toBeGreaterThan(0);
    });
  });
});
