import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import StudioPage from "./page";
import {
  AUTO_SAVE_INTERVAL_MS,
  getBuilderVersionStorageKey,
} from "@/lib/builder/version-history";
import { createInitialSections } from "@/lib/builder/section-manager";
import type { BankEntry } from "@/types";

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

vi.mock("@/components/builder/template-picker", () => ({
  TemplatePicker: () => <div>Template picker</div>,
}));

vi.mock("@/components/studio/resume-preview", () => ({
  ResumePreview: ({ html }: { html: string }) => (
    <div>
      <div>Resume preview</div>
      <div data-testid="resume-html">{html}</div>
    </div>
  ),
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
  });

  it("does not render legacy document mode tabs", async () => {
    render(<StudioPage />);

    expect(await screen.findByText("Document Studio")).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: /tailored/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: /cover letter/i })).not.toBeInTheDocument();
  });
});
