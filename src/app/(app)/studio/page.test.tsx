import { beforeEach, describe, expect, it, vi } from "vitest";
<<<<<<< HEAD
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import StudioPage from "./page";
import type { BankEntry } from "@/types";

const editorSetContent = vi.hoisted(() => vi.fn());
=======
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import StudioPage from "./page";

>>>>>>> 0e974c5 (Consolidate document routes into studio)
const navigationMock = vi.hoisted(() => ({
  replace: vi.fn(),
  searchParams: new URLSearchParams(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: navigationMock.replace,
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/studio",
  useSearchParams: () => navigationMock.searchParams,
}));

<<<<<<< HEAD
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
=======
vi.mock("@/components/builder/section-list", () => ({
  SectionList: () => <div>Resume sections</div>,
}));

vi.mock("@/components/studio/resume-preview", () => ({
  ResumePreview: () => <div>Resume preview</div>,
}));

vi.mock("@/components/builder/cover-letter-workspace", () => ({
  CoverLetterWorkspace: () => <div>Cover letter workspace</div>,
}));

vi.mock("@/components/studio/tailor-workspace", () => ({
  TailorWorkspace: () => <div>Tailor workspace</div>,
}));

vi.mock("@/hooks/use-error-toast", () => ({
  useErrorToast: () => vi.fn(),
}));

describe("StudioPage", () => {
  beforeEach(() => {
>>>>>>> 0e974c5 (Consolidate document routes into studio)
    navigationMock.replace.mockClear();
    navigationMock.searchParams = new URLSearchParams();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
<<<<<<< HEAD
        json: async () => ({ entries: bankEntries }),
=======
        json: async () => ({ entries: [] }),
>>>>>>> 0e974c5 (Consolidate document routes into studio)
      })
    );
  });

<<<<<<< HEAD
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
    await waitFor(() => {
      expect(navigationMock.replace).toHaveBeenCalledWith("/studio", {
        scroll: false,
      });
    });
  });

  it("opens directly to the mode from the studio search param", async () => {
=======
  it("renders resume builder mode by default", async () => {
    render(<StudioPage />);

    expect(await screen.findByText("Resume sections")).toBeInTheDocument();
    expect(screen.getByText("Resume preview")).toBeInTheDocument();
    expect(screen.queryByText("Tailor workspace")).not.toBeInTheDocument();
    expect(screen.queryByText("Cover letter workspace")).not.toBeInTheDocument();
  });

  it("renders tailored mode from the studio mode search param", () => {
>>>>>>> 0e974c5 (Consolidate document routes into studio)
    navigationMock.searchParams = new URLSearchParams("mode=tailored");

    render(<StudioPage />);

<<<<<<< HEAD
    await screen.findByText("Experience");
=======
    expect(screen.getByText("Tailor workspace")).toBeInTheDocument();
    expect(screen.queryByText("Resume sections")).not.toBeInTheDocument();
>>>>>>> 0e974c5 (Consolidate document routes into studio)
    expect(screen.getByRole("tab", { name: /tailored/i })).toHaveAttribute(
      "aria-selected",
      "true"
    );
<<<<<<< HEAD
    expect(screen.getByLabelText("Job Description")).toBeInTheDocument();
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
=======
    expect(fetch).not.toHaveBeenCalled();
  });

  it("renders cover letter mode from the studio mode search param", () => {
    navigationMock.searchParams = new URLSearchParams("mode=cover-letter");

    render(<StudioPage />);

    expect(screen.getByText("Cover letter workspace")).toBeInTheDocument();
    expect(screen.queryByText("Resume sections")).not.toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /cover letter/i })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it("updates the URL when switching to cover letter mode", async () => {
    render(<StudioPage />);

    fireEvent.click(await screen.findByRole("tab", { name: /cover letter/i }));

    await waitFor(() => {
      expect(navigationMock.replace).toHaveBeenCalledWith(
        "/studio?mode=cover-letter",
        { scroll: false }
      );
    });
    expect(screen.getByText("Cover letter workspace")).toBeInTheDocument();
  });

  it("updates the URL when switching to tailored mode", async () => {
    render(<StudioPage />);

    fireEvent.click(await screen.findByRole("tab", { name: /tailored/i }));

    await waitFor(() => {
      expect(navigationMock.replace).toHaveBeenCalledWith(
        "/studio?mode=tailored",
        { scroll: false }
      );
    });
    expect(screen.getByText("Tailor workspace")).toBeInTheDocument();
>>>>>>> 0e974c5 (Consolidate document routes into studio)
  });
});
