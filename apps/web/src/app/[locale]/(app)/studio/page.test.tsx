import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { KeyboardShortcutsProvider } from "@/components/keyboard-shortcuts";
import { ToastProvider } from "@/components/ui/toast";
import StudioPage from "./page";
import type { BankEntry } from "@/types";

const mockShowErrorToast = vi.hoisted(() => vi.fn());
const mockResumePreview = vi.hoisted(() => vi.fn());

vi.mock("@/components/builder/section-list", () => ({
  SectionList: ({
    selectedIds,
    onToggleEntry,
    pickerOpen,
    showSections = true,
    emptySelectionHint,
  }: {
    selectedIds: Set<string>;
    onToggleEntry: (entryId: string) => void;
    pickerOpen?: boolean;
    showSections?: boolean;
    emptySelectionHint?: string;
  }) => (
    <div>
      {showSections && <div>Resume sections</div>}
      {showSections && <div>Selected {selectedIds.size}</div>}
      {emptySelectionHint && <div>{emptySelectionHint}</div>}
      {pickerOpen && <div>Bank Entry Picker</div>}
      <button type="button" onClick={() => onToggleEntry("entry-1")}>
        Toggle entry
      </button>
    </div>
  ),
}));

vi.mock("@/components/studio/resume-preview", () => ({
  ResumePreview: (props: {
    html?: string;
    content?: unknown;
    onAddFromBank?: () => void;
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
        {!props.content && !props.html && (
          <button type="button" onClick={props.onAddFromBank}>
            Select entries from your bank
          </button>
        )}
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
    (key) => values.get(key) ?? null,
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
  createPreviewHtml = () => "<p>Current HTML</p>",
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
          { status: 200 },
        );
      }

      return new Response(JSON.stringify({ entries }), { status: 200 });
    }),
  );

  return {
    getBuilderRequestCount: () => builderRequestCount,
  };
}

function renderStudioPage() {
  return render(
    <ToastProvider>
      <KeyboardShortcutsProvider>
        <StudioPage />
      </KeyboardShortcutsProvider>
    </ToastProvider>,
  );
}

function pressShortcut(
  target: Window | HTMLElement,
  init: KeyboardEventInit & { key: string },
) {
  act(() => {
    fireEvent.keyDown(target, init);
  });
}

async function flushMicrotasks() {
  await act(async () => {
    await Promise.resolve();
  });
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
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders resume builder mode by default with sections + preview visible", async () => {
    renderStudioPage();

    // Default tab is Knowledge — SectionList + entries are visible.
    expect(await screen.findByText("Resume sections")).toBeInTheDocument();
    expect(screen.getByText("Resume preview")).toBeInTheDocument();
    // The doc-type tabs use role="tab" (not role="button") in the new
    // flat sub-bar; the remaining "Resume"-named button is the SectionList
    // entry button. Asserting "at least one" lets the test survive future
    // additions without re-counting.
    expect(
      screen.getAllByRole("button", { name: "Resume" }).length,
    ).toBeGreaterThanOrEqual(1);

    // Files tab still contains the file-panel + version-history group.
    fireEvent.click(screen.getByRole("tab", { name: /^files/i }));
    expect(
      await screen.findByRole("heading", { name: "Files" }),
    ).toBeInTheDocument();
  });

  it("renders document mode controls in the studio header", async () => {
    renderStudioPage();

    expect(
      await screen.findByRole("tab", { name: /^resume$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /cover letter/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /tailored/i }),
    ).not.toBeInTheDocument();
  });

  it("shows the draft as saved on fresh load", async () => {
    renderStudioPage();

    expect(
      await screen.findByRole("tab", { name: /^resume$/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Saved/)[0]).toBeInTheDocument();
    expect(screen.queryByText("Unsaved changes")).not.toBeInTheDocument();
  });

  it("saves the current document with Cmd+S", async () => {
    renderStudioPage();

    expect(
      await screen.findByRole("tab", { name: /^resume$/i }),
    ).toBeInTheDocument();

    pressShortcut(window, { key: "s", metaKey: true });

    expect(screen.getAllByText("Saving...")[0]).toBeInTheDocument();
    await flushMicrotasks();
  });

  it("toggles the files panel with Cmd+B", async () => {
    renderStudioPage();

    expect(
      await screen.findByRole("button", { name: "Collapse files panel" }),
    ).toBeInTheDocument();

    pressShortcut(window, { key: "b", metaKey: true });

    expect(
      screen.getByRole("button", { name: "Expand files panel" }),
    ).toBeInTheDocument();
  });

  it("toggles the AI panel with Cmd+/", async () => {
    renderStudioPage();

    expect(
      await screen.findByRole("button", {
        name: "Collapse AI assistant panel",
      }),
    ).toBeInTheDocument();

    pressShortcut(window, { key: "/", metaKey: true });

    expect(
      screen.getByRole("button", { name: "Expand AI assistant panel" }),
    ).toBeInTheDocument();
  });

  it("focuses the AI assistant input with Cmd+K", async () => {
    mockStorage({ "taida:studio:aiPanelCollapsed": "true" });
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      window.setTimeout(() => callback(0), 0);
      return 0;
    });
    renderStudioPage();

    expect(
      await screen.findByRole("button", {
        name: "Expand AI assistant panel",
      }),
    ).toBeInTheDocument();

    pressShortcut(window, { key: "k", metaKey: true });

    const textarea = await screen.findByLabelText("Job description");
    await waitFor(() => expect(textarea).toBe(document.activeElement));
    expect(
      screen.getByRole("button", { name: "Collapse AI assistant panel" }),
    ).toBeInTheDocument();
  });

  it("uses Cmd+P to enter and restore preview-only mode", async () => {
    renderStudioPage();

    expect(
      await screen.findByRole("button", { name: "Collapse files panel" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Collapse AI assistant panel" }),
    ).toBeInTheDocument();

    pressShortcut(window, { key: "p", metaKey: true });

    expect(
      screen.getByRole("button", { name: "Expand files panel" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Expand AI assistant panel" }),
    ).toBeInTheDocument();

    pressShortcut(window, { key: "p", metaKey: true });

    expect(
      screen.getByRole("button", { name: "Collapse files panel" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Collapse AI assistant panel" }),
    ).toBeInTheDocument();
  });

  it("opens the export menu with Cmd+E", async () => {
    mockStudioFetch(bankEntries);
    renderStudioPage();

    fireEvent.click(
      await screen.findByRole("button", { name: "Toggle entry" }),
    );
    await waitFor(() =>
      expect(screen.getByTestId("resume-html")).toHaveTextContent(
        "Current HTML",
      ),
    );

    pressShortcut(window, { key: "e", metaKey: true });

    expect(screen.getByRole("menuitem", { name: /^PDF/i })).toBeInTheDocument();
  });

  it("shows real LaTeX source with copy and download actions", async () => {
    mockStudioFetch(bankEntries);
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: vi.fn(() => "blob:latex"),
      revokeObjectURL: vi.fn(),
    });

    renderStudioPage();

    fireEvent.click(
      await screen.findByRole("button", { name: "Toggle entry" }),
    );
    await waitFor(() =>
      expect(screen.getByTestId("resume-html")).toHaveTextContent(
        "Current HTML",
      ),
    );

    fireEvent.click(screen.getByRole("tab", { name: "LaTeX" }));

    expect(screen.getByText(/\\documentclass/)).toBeInTheDocument();
    expect(screen.queryByText(/on the roadmap/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Template:/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Copy .tex" }));
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(
        expect.stringContaining("\\documentclass"),
      ),
    );

    fireEvent.click(screen.getByRole("button", { name: "Download .tex" }));
    expect(URL.createObjectURL).toHaveBeenCalledWith(
      expect.objectContaining({ type: "text/x-tex;charset=utf-8" }),
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Switch back to Visual" }),
    );
    expect(screen.getByText("Resume preview")).toBeInTheDocument();
  });

  it("does not trigger non-modifier shortcuts while typing in the JD textarea", async () => {
    renderStudioPage();

    const textarea = await screen.findByLabelText("Job description");
    textarea.focus();

    pressShortcut(textarea, { key: "b" });

    expect(
      screen.getByRole("button", { name: "Collapse files panel" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Expand files panel" }),
    ).not.toBeInTheDocument();
  });

  it("fires modifier shortcuts while focused in the JD textarea", async () => {
    renderStudioPage();

    const textarea = await screen.findByLabelText("Job description");
    textarea.focus();

    pressShortcut(textarea, { key: "s", metaKey: true });

    expect(screen.getAllByText("Saving...")[0]).toBeInTheDocument();
    await flushMicrotasks();
  });

  it("shows the draft as unsaved after a content edit", async () => {
    mockStudioFetch(bankEntries);

    renderStudioPage();

    fireEvent.click(
      await screen.findByRole("button", { name: "Toggle entry" }),
    );

    expect(screen.getAllByText("Unsaved changes")[0]).toBeInTheDocument();
  });

  it("keeps untouched documents saved after another document is edited", async () => {
    mockStudioFetch(bankEntries);

    renderStudioPage();

    fireEvent.click(
      await screen.findByRole("button", { name: "Toggle entry" }),
    );
    expect(screen.getAllByText("Unsaved changes")[0]).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: /cover letter/i }));

    await waitFor(() =>
      expect(screen.getAllByText(/Saved/)[0]).toBeInTheDocument(),
    );
    expect(screen.queryByText("Unsaved changes")).not.toBeInTheDocument();
  });

  it("uses a freeform cover letter editor instead of the resume section picker", async () => {
    renderStudioPage();

    fireEvent.click(await screen.findByRole("tab", { name: /cover letter/i }));

    await waitFor(() =>
      expect(screen.getByTestId("resume-content")).toHaveTextContent(
        "editable",
      ),
    );
    expect(screen.queryByText("Resume sections")).not.toBeInTheDocument();
  });

  it("renders cover letter drafts without calling the resume builder API", async () => {
    const fetchMock = mockStudioFetch(bankEntries);

    renderStudioPage();

    fireEvent.click(await screen.findByRole("tab", { name: /cover letter/i }));
    fireEvent.click(screen.getByRole("button", { name: "Toggle entry" }));

    await waitFor(() => {
      expect(screen.getByTestId("resume-content")).toHaveTextContent(
        "editable",
      );
      expect(screen.getByTestId("resume-html")).toHaveTextContent("Engineer");
    });
    expect(fetchMock.getBuilderRequestCount()).toBe(0);
  });

  it("does not overwrite manually edited cover letter text when bank selections change", async () => {
    mockStudioFetch(bankEntries);

    renderStudioPage();

    fireEvent.click(await screen.findByRole("tab", { name: /cover letter/i }));
    fireEvent.click(screen.getByRole("button", { name: "Toggle entry" }));

    await waitFor(() =>
      expect(screen.getByTestId("resume-html")).toHaveTextContent("Engineer"),
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit preview" }));

    await waitFor(() =>
      expect(screen.getByTestId("resume-html")).toHaveTextContent(
        "Edited inline",
      ),
    );

    fireEvent.click(screen.getByRole("button", { name: "Toggle entry" }));

    await waitFor(() =>
      expect(screen.getByTestId("resume-html")).toHaveTextContent(
        "Edited inline",
      ),
    );
  });

  it("opens the bank entry picker from the add button", async () => {
    mockStudioFetch(bankEntries);

    renderStudioPage();

    fireEvent.click(
      await screen.findByRole("button", { name: /open bank picker/i }),
    );

    expect(screen.getByText("Bank Entry Picker")).toBeInTheDocument();
  });

  it("generates from selected bank entries and closes the picker", async () => {
    mockStudioFetch(bankEntries);

    renderStudioPage();

    fireEvent.click(
      await screen.findByRole("button", { name: /open bank picker/i }),
    );
    expect(screen.getByText("Bank Entry Picker")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Toggle entry" }));
    await waitFor(() =>
      expect(screen.getByTestId("resume-html")).toHaveTextContent(
        "Current HTML",
      ),
    );

    fireEvent.click(screen.getByRole("button", { name: "Generate from Bank" }));

    await waitFor(() =>
      expect(screen.queryByText("Bank Entry Picker")).not.toBeInTheDocument(),
    );
    expect(screen.getByTestId("resume-html")).toHaveTextContent("Current HTML");
    expect(
      screen.getByText("Generated a resume draft from selected bank entries."),
    ).toBeInTheDocument();
  });

  it("shows first-run bank guidance and opens the picker from the preview CTA", async () => {
    mockStudioFetch(bankEntries);

    renderStudioPage();

    expect(
      await screen.findByRole("button", {
        name: /select entries from your bank/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Select entries to build your first draft."),
    ).toBeInTheDocument();
    // The sub-bar surfaces the same hint via the disabled Export button's
    // title attribute (tooltip on hover) rather than rendered inline text —
    // the visible affordance is the button's disabled state itself.
    const exportButton = screen.getByRole("button", {
      name: /Download (resume|cover letter) PDF/i,
    });
    expect(exportButton).toBeDisabled();
    expect(exportButton).toHaveAttribute(
      "title",
      expect.stringMatching(/Select bank entries/i),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /select entries from your bank/i,
      }),
    );

    expect(screen.getByText("Bank Entry Picker")).toBeInTheDocument();
  });

  it("applies staged bank selections from the documents page", async () => {
    const storage = mockStorage({
      "slothing:selectedBankEntryIds": JSON.stringify(["entry-1", "entry-2"]),
    });
    mockStudioFetch(bankEntries);

    renderStudioPage();

    await waitFor(() =>
      expect(screen.getByText("Selected 2")).toBeInTheDocument(),
    );
    expect(
      screen.getByText("Using 2 staged bank components"),
    ).toBeInTheDocument();
    expect(storage.has("slothing:selectedBankEntryIds")).toBe(false);
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
      }),
    );

    renderStudioPage();

    fireEvent.click(
      await screen.findByRole("button", { name: "Toggle entry" }),
    );

    await waitFor(() => {
      expect(screen.getByTestId("resume-html")).toHaveTextContent("Engineer");
      expect(screen.getByTestId("resume-html")).toHaveTextContent("Your Name");
    });
    expect(builderRequestCount).toBe(1);
    expect(mockShowErrorToast).not.toHaveBeenCalled();
  });

  it("passes generated TipTap content to the resume preview for inline editing", async () => {
    mockStudioFetch(bankEntries);

    renderStudioPage();

    fireEvent.click(
      await screen.findByRole("button", { name: "Toggle entry" }),
    );

    await waitFor(() =>
      expect(screen.getByTestId("resume-content")).toHaveTextContent(
        "editable",
      ),
    );
    expect(mockResumePreview).toHaveBeenLastCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({ type: "doc" }),
        onContentChange: expect.any(Function),
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit preview" }));

    await waitFor(() =>
      expect(screen.getByTestId("resume-html")).toHaveTextContent(
        "Edited inline",
      ),
    );
  });

  it("restores saved version HTML without a live preview overwrite", async () => {
    let previewCount = 0;
    const fetchMock = mockStudioFetch(
      bankEntries,
      () => `<p>Saved preview ${++previewCount}</p>`,
    );

    renderStudioPage();

    fireEvent.click(
      await screen.findByRole("button", { name: "Toggle entry" }),
    );

    await waitFor(() =>
      expect(screen.getByTestId("resume-html")).toHaveTextContent(
        "Saved preview 1",
      ),
    );

    // Save button lives in VersionHistorySection on the Files tab —
    // navigate there before clicking, then back to Knowledge for the
    // Toggle-entry interaction.
    fireEvent.click(screen.getByRole("tab", { name: /^files/i }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.getAllByText("Saving...")[0]).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: /^knowledge/i }));
    fireEvent.click(screen.getByRole("button", { name: "Toggle entry" }));

    await waitFor(() =>
      expect(screen.getByTestId("resume-html")).toHaveTextContent(/^$/),
    );

    // Version history list also lives on the Files tab.
    fireEvent.click(screen.getByRole("tab", { name: /^files/i }));
    fireEvent.click(
      await screen.findByRole("button", { name: "Saved version" }),
    );

    await waitFor(() =>
      expect(screen.getByTestId("resume-html")).toHaveTextContent(
        "Saved preview 1",
      ),
    );
    expect(fetchMock.getBuilderRequestCount()).toBe(1);

    fireEvent.click(screen.getByRole("button", { name: "Edit preview" }));

    await waitFor(() =>
      expect(screen.getByTestId("resume-html")).toHaveTextContent(
        "Edited inline",
      ),
    );
    expect(fetchMock.getBuilderRequestCount()).toBe(1);
  });

  it("restores a saved generated preview after reload with export enabled", async () => {
    mockStorage({
      "taida:builder:versions:resume": JSON.stringify([
        {
          id: "saved-reload",
          kind: "manual",
          name: "Saved version",
          savedAt: "2026-05-16T12:00:00.000Z",
          state: {
            documentMode: "resume",
            selectedIds: ["entry-1"],
            sections: [
              "experience",
              "skill",
              "project",
              "education",
              "certification",
            ].map((id) => ({ id, visible: true })),
            templateId: "classic",
            html: "<p>Reloaded preview 1</p>",
          },
        },
      ]),
    });
    const fetchMock = mockStudioFetch(bankEntries);

    renderStudioPage();

    await waitFor(() =>
      expect(screen.getByTestId("resume-html")).toHaveTextContent(
        "Reloaded preview 1",
      ),
    );
    expect(fetchMock.getBuilderRequestCount()).toBe(0);

    pressShortcut(window, { key: "e", metaKey: true });

    // Export menu items in the new sub-bar are renamed: "Download PDF"
    // became just "PDF" (with a description below). Match by regex so
    // either label survives a future copy revision.
    expect(screen.getByRole("menuitem", { name: /^PDF/i })).toBeInTheDocument();
  });

  it("shows a save failure status when browser storage rejects a version", async () => {
    const values = mockStorage();
    vi.mocked(window.localStorage.setItem).mockImplementation((key, value) => {
      if (key.startsWith("taida:builder:versions")) {
        throw new Error("Quota exceeded");
      }
      values.set(key, value);
    });

    renderStudioPage();

    // Save lives in VersionHistorySection on the Files tab.
    fireEvent.click(await screen.findByRole("tab", { name: /^files/i }));
    fireEvent.click(await screen.findByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(screen.getAllByText(/Save failed/)[0]).toBeInTheDocument(),
    );
    expect(mockShowErrorToast).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ title: "Could not save version" }),
    );
  });

  it("links saved resume versions to the selected opportunity bank opportunity", async () => {
    const linkRequests: unknown[] = [];

    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        if (url === "/api/bank") {
          return new Response(JSON.stringify({ entries: bankEntries }), {
            status: 200,
          });
        }

        if (url.startsWith("/api/opportunities?status=saved,applied")) {
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
            { status: 200 },
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
            { status: 200 },
          );
        }

        if (url === "/api/opportunities/job-1/link") {
          linkRequests.push(JSON.parse(String(init?.body)));
          return new Response(JSON.stringify({ success: true }), {
            status: 200,
          });
        }

        return new Response("Not found", { status: 404 });
      }),
    );

    renderStudioPage();

    fireEvent.click(
      await screen.findByRole("button", {
        name: "Select from Opportunity Bank",
      }),
    );
    fireEvent.click(
      await screen.findByRole("button", { name: /frontend engineer/i }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Toggle entry" }));
    // Save lives in VersionHistorySection on the Files tab.
    fireEvent.click(screen.getByRole("tab", { name: /^files/i }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(linkRequests).toEqual([
        { resumeId: expect.stringMatching(/^manual-/) },
      ]),
    );
  });
});
