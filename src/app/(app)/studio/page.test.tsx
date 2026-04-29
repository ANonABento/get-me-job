import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import StudioPage from "./page";
import type { BankEntry } from "@/types";

const mockShowErrorToast = vi.hoisted(() => vi.fn());
const mockResumePreview = vi.hoisted(() => vi.fn());

vi.mock("@/components/builder/section-list", () => ({
  SectionList: ({
    selectedIds,
    onToggleEntry,
    pickerOpen,
  }: {
    selectedIds: Set<string>;
    onToggleEntry: (entryId: string) => void;
    pickerOpen?: boolean;
  }) => (
    <div>
      <div>Resume sections</div>
      <div>Selected {selectedIds.size}</div>
      {pickerOpen && <div>Bank Entry Picker</div>}
      <button type="button" onClick={() => onToggleEntry("entry-1")}>
        Toggle entry
      </button>
    </div>
  ),
}));

vi.mock("@/components/studio/resume-preview", () => ({
  ResumePreview: (props: {
    html: string;
    content?: unknown;
    onContentChange?: (content: {
      type: string;
      content?: Array<Record<string, unknown>>;
    }) => void;
  }) => {
    mockResumePreview(props);

    return (
      <div>
        <div>Resume preview</div>
        <div data-testid="resume-html">{props.html}</div>
        <div data-testid="resume-content">
          {props.content ? "editable" : "static"}
        </div>
        <button
          type="button"
          onClick={() =>
            props.onContentChange?.({
              type: "doc",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Edited inline" }],
                },
              ],
            })
          }
        >
          Edit preview
        </button>
      </div>
    );
  },
}));

vi.mock("@/hooks/use-error-toast", () => ({
  useErrorToast: () => mockShowErrorToast,
}));

const bankEntries: BankEntry[] = [
  {
    id: "entry-1",
    userId: "user-1",
    category: "experience",
    content: { title: "Engineer" },
    confidenceScore: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "entry-2",
    userId: "user-1",
    category: "skill",
    content: { name: "TypeScript" },
    confidenceScore: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

function mockStorage(initialValues: Record<string, string> = {}) {
  const values = new Map(Object.entries(initialValues));
  vi.mocked(window.localStorage.getItem).mockImplementation(
    (key) => values.get(key) ?? null
  );
  vi.mocked(window.localStorage.setItem).mockImplementation((key, value) => {
    values.set(key, value);
  });
  vi.mocked(window.localStorage.removeItem).mockImplementation((key) => {
    values.delete(key);
  });
  vi.mocked(window.localStorage.clear).mockImplementation(() => {
    values.clear();
  });
  return values;
}

function mockStudioFetch(
  entries: BankEntry[] = [],
  createPreviewHtml = () => "<p>Current HTML</p>"
) {
  let builderRequestCount = 0;

  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => {
      if (url === "/api/builder") {
        builderRequestCount++;
        if (typeof init?.body === "string") {
          JSON.parse(init.body);
        }

        return new Response(
          JSON.stringify({
            html: createPreviewHtml(),
            resume: {
              contact: { name: "Jane Doe" },
              summary: "Current summary",
              experiences: [
                {
                  company: "Acme",
                  title: "Engineer",
                  dates: "2024",
                  highlights: ["Built workflows"],
                },
              ],
              skills: ["TypeScript"],
              education: [],
            },
          }),
          { status: 200 }
        );
      }

      return new Response(JSON.stringify({ entries }), { status: 200 });
    })
  );

  return {
    getBuilderRequestCount: () => builderRequestCount,
  };
}

describe("StudioPage", () => {
  beforeEach(() => {
    mockShowErrorToast.mockClear();
    mockResumePreview.mockClear();
    mockStorage();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ entries: [] }),
      })
    );
  });

  it("renders resume builder mode by default with a file panel", async () => {
    render(<StudioPage />);

    expect(await screen.findByText("Resume sections")).toBeInTheDocument();
    expect(screen.getByText("Resume preview")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Files" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Resume" })).toHaveLength(2);
  });

  it("renders document mode controls in the studio header", async () => {
    render(<StudioPage />);

    expect(await screen.findByText("Document Studio")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cover Letter" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /tailored/i })).not.toBeInTheDocument();
  });

  it("shows the draft as saved on fresh load", async () => {
    render(<StudioPage />);

    expect(await screen.findByText("Document Studio")).toBeInTheDocument();
    expect(screen.getByText("Saved")).toBeInTheDocument();
    expect(screen.queryByText("Unsaved")).not.toBeInTheDocument();
  });

  it("shows the draft as unsaved after a content edit", async () => {
    mockStudioFetch(bankEntries);

    render(<StudioPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Toggle entry" }));

    expect(screen.getByText("Unsaved")).toBeInTheDocument();
  });

  it("keeps untouched documents saved after another document is edited", async () => {
    mockStudioFetch(bankEntries);

    render(<StudioPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Toggle entry" }));
    expect(screen.getByText("Unsaved")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cover Letter" }));

    await waitFor(() => expect(screen.getByText("Saved")).toBeInTheDocument());
    expect(screen.queryByText("Unsaved")).not.toBeInTheDocument();
  });

  it("renders cover letter previews without calling the resume builder API", async () => {
    const fetchMock = mockStudioFetch(bankEntries);

    render(<StudioPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Cover Letter" }));
    fireEvent.click(screen.getByRole("button", { name: "Toggle entry" }));

    await waitFor(() => {
      expect(screen.getByTestId("resume-html")).toHaveTextContent(
        "cover-letter-document"
      );
      expect(screen.getByTestId("resume-html")).toHaveTextContent("Engineer");
    });
    expect(fetchMock.getBuilderRequestCount()).toBe(0);
  });

  it("opens the bank entry picker from the add button", async () => {
    mockStudioFetch(bankEntries);

    render(<StudioPage />);

    fireEvent.click(await screen.findByRole("button", { name: /add from bank/i }));

    expect(screen.getByText("Bank Entry Picker")).toBeInTheDocument();
  });

  it("renders a client-side preview when the builder API fails", async () => {
    let builderRequestCount = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url === "/api/builder") {
          builderRequestCount++;
          return new Response(JSON.stringify({ error: "DB unavailable" }), {
            status: 500,
          });
        }

        return new Response(JSON.stringify({ entries: bankEntries }), {
          status: 200,
        });
      })
    );

    render(<StudioPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Toggle entry" }));

    await waitFor(() => {
      expect(screen.getByTestId("resume-html")).toHaveTextContent("Engineer");
      expect(screen.getByTestId("resume-html")).toHaveTextContent("Your Name");
    });
    expect(builderRequestCount).toBe(1);
    expect(mockShowErrorToast).not.toHaveBeenCalled();
  });

  it("passes generated TipTap content to the resume preview for inline editing", async () => {
    mockStudioFetch(bankEntries);

    render(<StudioPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Toggle entry" }));

    await waitFor(() =>
      expect(screen.getByTestId("resume-content")).toHaveTextContent("editable")
    );
    expect(mockResumePreview).toHaveBeenLastCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({ type: "doc" }),
        onContentChange: expect.any(Function),
      })
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit preview" }));

    await waitFor(() =>
      expect(screen.getByTestId("resume-html")).toHaveTextContent("Edited inline")
    );
  });

  it("restores saved version HTML without a live preview overwrite", async () => {
    let previewCount = 0;
    const fetchMock = mockStudioFetch(
      bankEntries,
      () => `<p>Saved preview ${++previewCount}</p>`
    );

    render(<StudioPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Toggle entry" }));

    await waitFor(() =>
      expect(screen.getByTestId("resume-html")).toHaveTextContent(
        "Saved preview 1"
      )
    );

    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    fireEvent.click(screen.getByRole("button", { name: "Toggle entry" }));

    await waitFor(() =>
      expect(screen.getByTestId("resume-html")).toHaveTextContent(/^$/)
    );

    fireEvent.click(screen.getByRole("button", { name: "Saved version" }));

    await waitFor(() =>
      expect(screen.getByTestId("resume-html")).toHaveTextContent(
        "Saved preview 1"
      )
    );
    expect(fetchMock.getBuilderRequestCount()).toBe(1);

    fireEvent.click(screen.getByRole("button", { name: "Edit preview" }));

    await waitFor(() =>
      expect(screen.getByTestId("resume-html")).toHaveTextContent("Edited inline")
    );
    expect(fetchMock.getBuilderRequestCount()).toBe(1);
  });

  it("links saved resume versions to the selected job bank opportunity", async () => {
    const linkRequests: unknown[] = [];

    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        if (url === "/api/bank") {
          return new Response(JSON.stringify({ entries: bankEntries }), {
            status: 200,
          });
        }

        if (url === "/api/opportunities?status=saved,applied") {
          return new Response(
            JSON.stringify({
              opportunities: [
                {
                  id: "job-1",
                  type: "job",
                  title: "Frontend Engineer",
                  company: "Acme",
                  source: "manual",
                  summary: "Build accessible React workflows.",
                  status: "saved",
                  tags: [],
                  createdAt: "2026-01-01T00:00:00.000Z",
                  updatedAt: "2026-01-01T00:00:00.000Z",
                },
              ],
            }),
            { status: 200 }
          );
        }

        if (url === "/api/builder") {
          return new Response(
            JSON.stringify({
              html: "<p>Current HTML</p>",
              resume: {
                contact: { name: "Jane Doe" },
                summary: "Current summary",
                experiences: [],
                skills: [],
                education: [],
              },
            }),
            { status: 200 }
          );
        }

        if (url === "/api/opportunities/job-1/link") {
          linkRequests.push(JSON.parse(String(init?.body)));
          return new Response(JSON.stringify({ success: true }), { status: 200 });
        }

        return new Response("Not found", { status: 404 });
      })
    );

    render(<StudioPage />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Select from Job Bank" })
    );
    fireEvent.click(await screen.findByRole("button", { name: /frontend engineer/i }));
    fireEvent.click(screen.getByRole("button", { name: "Toggle entry" }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(linkRequests).toEqual([
        { resumeId: expect.stringMatching(/^manual-/) },
      ])
    );
  });
});
