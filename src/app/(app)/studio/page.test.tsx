import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import StudioPage from "./page";
import {
  AUTO_SAVE_INTERVAL_MS,
  getBuilderVersionStorageKey,
} from "@/lib/builder/version-history";
import { createInitialSections } from "@/lib/builder/section-manager";
import type { BankEntry } from "@/types";

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

vi.mock("@/components/builder/section-list", () => ({
  SectionList: ({
    selectedIds,
    onToggleEntry,
  }: {
    selectedIds: Set<string>;
    onToggleEntry: (entryId: string) => void;
  }) => (
    <div>
      <div>Resume sections</div>
      <div>Selected {selectedIds.size}</div>
      <button type="button" onClick={() => onToggleEntry("entry-1")}>
        Toggle entry
      </button>
    </div>
  ),
}));

vi.mock("@/components/studio/resume-preview", () => ({
  ResumePreview: ({ html }: { html: string }) => (
    <div>
      <div>Resume preview</div>
      <div data-testid="resume-html">{html}</div>
    </div>
  ),
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

const storageKey = getBuilderVersionStorageKey("resume");

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

function mockStudioFetch(entries: BankEntry[] = []) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      if (url === "/api/builder") {
        return new Response(JSON.stringify({ html: "<p>Current HTML</p>" }), {
          status: 200,
        });
      }

      return new Response(JSON.stringify({ entries }), { status: 200 });
    })
  );
}

describe("StudioPage", () => {
  beforeEach(() => {
    vi.useRealTimers();
    navigationMock.replace.mockClear();
    navigationMock.searchParams = new URLSearchParams();
    vi.mocked(window.localStorage.getItem).mockReset();
    vi.mocked(window.localStorage.setItem).mockReset();
    vi.mocked(window.localStorage.removeItem).mockReset();
    vi.mocked(window.localStorage.clear).mockReset();
    mockStorage();
    mockStudioFetch();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders resume builder mode by default", async () => {
    render(<StudioPage />);

    expect(await screen.findByText("Resume sections")).toBeInTheDocument();
    expect(screen.getByText("Resume preview")).toBeInTheDocument();
    expect(screen.queryByText("Tailor workspace")).not.toBeInTheDocument();
    expect(screen.queryByText("Cover letter workspace")).not.toBeInTheDocument();
  });

  it("renders tailored mode from the studio mode search param", () => {
    navigationMock.searchParams = new URLSearchParams("mode=tailored");

    render(<StudioPage />);

    expect(screen.getByText("Tailor workspace")).toBeInTheDocument();
    expect(screen.queryByText("Resume sections")).not.toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /tailored/i })).toHaveAttribute(
      "aria-selected",
      "true"
    );
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
  });

  it("saves a manual version with an optional custom name", async () => {
    mockStudioFetch(bankEntries);
    render(<StudioPage />);

    expect(await screen.findByText("Resume sections")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Version name"), {
      target: { value: "Recruiter draft" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save version/i }));

    await waitFor(() => {
      const saved = JSON.parse(
        vi.mocked(window.localStorage.setItem).mock.calls.at(-1)?.[1] ?? "[]"
      ) as Array<{ kind: string; name: string }>;
      expect(saved[0]).toMatchObject({
        kind: "manual",
        name: "Recruiter draft",
      });
    });
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      storageKey,
      expect.any(String)
    );
    expect(screen.getByText("Saved")).toBeInTheDocument();
  });

  it("previews a saved version without changing the current draft and restores it on demand", async () => {
    mockStudioFetch(bankEntries);
    mockStorage({
      [storageKey]: JSON.stringify([
        {
          id: "manual-saved",
          kind: "manual",
          name: "Saved Draft",
          savedAt: "2026-01-01T00:00:00.000Z",
          state: {
            documentMode: "resume",
            selectedIds: ["entry-1"],
            sections: createInitialSections(),
            templateId: "classic",
            html: "<p>Saved Preview</p>",
          },
        },
      ]),
    });

    render(<StudioPage />);

    expect(await screen.findByText("Selected 2")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Preview Saved Draft" }));

    expect(screen.getByText("Previewing Saved Draft")).toBeInTheDocument();
    expect(screen.getByTestId("resume-html")).toHaveTextContent(
      "Saved Preview"
    );
    expect(screen.getByText("Selected 2")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Restore Saved Draft" }));

    expect(await screen.findByText("Selected 1")).toBeInTheDocument();
    expect(screen.queryByText("Previewing Saved Draft")).not.toBeInTheDocument();
  });

  it("auto-saves a changed draft after the 30 second debounce", async () => {
    mockStudioFetch([bankEntries[0]]);
    render(<StudioPage />);

    expect(await screen.findByText("Resume sections")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /save version/i }));
    await waitFor(() => expect(window.localStorage.setItem).toHaveBeenCalled());

    vi.useFakeTimers();
    fireEvent.click(screen.getByRole("button", { name: /toggle entry/i }));

    act(() => {
      vi.advanceTimersByTime(AUTO_SAVE_INTERVAL_MS - 1);
    });
    expect(window.localStorage.setItem).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(1);
    });

    const saved = JSON.parse(
      vi.mocked(window.localStorage.setItem).mock.calls.at(-1)?.[1] ?? "[]"
    ) as Array<{ kind: string; name: string }>;
    expect(saved[0]).toMatchObject({
      kind: "auto",
      name: "Auto-save",
    });
  });
});
