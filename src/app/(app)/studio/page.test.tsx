import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import StudioPage from "./page";
import type { BankEntry } from "@/types";

const editorSetContent = vi.hoisted(() => vi.fn());

vi.mock("@tiptap/react", () => ({
  useEditor: () => ({
    commands: {
      setContent: editorSetContent,
    },
    getHTML: () => "<p>Editor content</p>",
  }),
  EditorContent: () => (
    <div aria-label="Document editor" role="textbox">
      TipTap editor
    </div>
  ),
}));

vi.mock("@tiptap/starter-kit", () => ({
  default: {},
}));

const bankEntries: BankEntry[] = [
  {
    id: "entry-1",
    userId: "user-1",
    category: "experience",
    content: { title: "Engineer", company: "Acme" },
    confidenceScore: 0.95,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "entry-2",
    userId: "user-1",
    category: "skill",
    content: { name: "TypeScript" },
    confidenceScore: 0.9,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

function createDataTransfer() {
  const data = new Map<string, string>();
  return {
    effectAllowed: "",
    dropEffect: "",
    getData: (type: string) => data.get(type) ?? "",
    setData: (type: string, value: string) => data.set(type, value),
  };
}

describe("StudioPage", () => {
  beforeEach(() => {
    editorSetContent.mockClear();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ entries: bankEntries }),
      })
    );
  });

  it("renders the three-panel document studio layout", async () => {
    render(<StudioPage />);

    expect(screen.getByRole("heading", { name: "Document Studio" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /resume/i })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(await screen.findByText("Experience")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Document editor" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "AI Assistant" })).toBeInTheDocument();
  });

  it("switches document modes and shows the job description input for job-specific modes", async () => {
    render(<StudioPage />);

    fireEvent.click(screen.getByRole("tab", { name: /cover letter/i }));

    expect(screen.getByRole("tab", { name: /cover letter/i })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByLabelText("Job Description")).toBeInTheDocument();
    await waitFor(() => {
      expect(editorSetContent).toHaveBeenCalledWith(expect.stringContaining("Dear Hiring Manager"));
    });

    fireEvent.click(screen.getByRole("tab", { name: /^resume$/i }));

    expect(screen.queryByLabelText("Job Description")).not.toBeInTheDocument();
  });

  it("opens the entry picker modal from Add from bank", async () => {
    render(<StudioPage />);

    await screen.findByText("Experience");
    fireEvent.click(screen.getByRole("button", { name: /add from bank/i }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Select Entries")).toBeInTheDocument();
    expect(screen.getByText("Engineer at Acme")).toBeInTheDocument();
  });

  it("applies the selected template styles to the page frame", async () => {
    render(<StudioPage />);

    await screen.findByText("Experience");
    fireEvent.click(screen.getByRole("button", { name: /modern/i }));

    expect(screen.getByTestId("studio-page-frame")).toHaveStyle({
      borderTop: "5px solid #2563eb",
    });
  });

  it("reorders sections through drag and drop", async () => {
    render(<StudioPage />);

    const experienceLabel = await screen.findByText("Experience");
    const skillLabel = screen.getByText("Skills");
    const experienceSection = experienceLabel.closest("[draggable='true']");
    const skillSection = skillLabel.closest("[draggable='true']");

    expect(experienceSection).not.toBeNull();
    expect(skillSection).not.toBeNull();

    const dataTransfer = createDataTransfer();
    fireEvent.dragStart(experienceSection!, { dataTransfer });
    fireEvent.dragOver(skillSection!, { dataTransfer });
    fireEvent.drop(skillSection!, { dataTransfer });

    const sectionList = screen.getByText("Drag to reorder").closest("div")!
      .parentElement!;
    const labels = within(sectionList)
      .getAllByRole("button")
      .map((button) => button.textContent);

    expect(labels.findIndex((text) => text === "Skills")).toBeLessThan(
      labels.findIndex((text) => text === "Experience")
    );
  });
});
