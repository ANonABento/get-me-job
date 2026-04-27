import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import BuilderPage from "./page";
import { getBuilderVersionStorageKey } from "@/lib/builder/version-history";
import type {
  BuilderDraftState,
  BuilderVersion,
} from "@/lib/builder/version-history";

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
  usePathname: () => "/builder",
  useSearchParams: () => navigationMock.searchParams,
}));

vi.mock("@/components/builder/section-list", () => ({
  SectionList: () => <div>Resume sections</div>,
}));

vi.mock("@/components/builder/resume-preview", () => ({
  ResumePreview: () => <div>Resume preview</div>,
}));

vi.mock("@/components/builder/cover-letter-workspace", () => ({
  CoverLetterWorkspace: () => <div>Cover letter workspace</div>,
}));

vi.mock("@/hooks/use-error-toast", () => ({
  useErrorToast: () => vi.fn(),
}));

const baseDraftState: BuilderDraftState = {
  documentMode: "resume",
  selectedIds: [],
  sections: [
    { id: "experience", visible: true },
    { id: "education", visible: true },
    { id: "skill", visible: true },
    { id: "project", visible: true },
    { id: "achievement", visible: true },
    { id: "certification", visible: true },
  ],
  templateId: "classic",
  html: "",
};

function resetLocalStorageMock() {
  const store = new Map<string, string>();

  vi.mocked(window.localStorage.getItem).mockImplementation(
    (key) => store.get(key) ?? null
  );
  vi.mocked(window.localStorage.setItem).mockImplementation((key, value) => {
    store.set(key, value);
  });
  vi.mocked(window.localStorage.removeItem).mockImplementation((key) => {
    store.delete(key);
  });
  vi.mocked(window.localStorage.clear).mockImplementation(() => {
    store.clear();
  });
}

describe("BuilderPage", () => {
  beforeEach(() => {
    navigationMock.replace.mockClear();
    navigationMock.searchParams = new URLSearchParams();
    resetLocalStorageMock();
    window.localStorage.clear();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ entries: [] }),
      })
    );
  });

  it("renders resume builder mode by default", async () => {
    render(<BuilderPage />);

    expect(await screen.findByText("Resume sections")).toBeInTheDocument();
    expect(screen.getByText("Resume preview")).toBeInTheDocument();
    expect(screen.queryByText("Cover letter workspace")).not.toBeInTheDocument();
  });

  it("renders cover letter mode from the builder mode search param", () => {
    navigationMock.searchParams = new URLSearchParams("mode=cover-letter");

    render(<BuilderPage />);

    expect(screen.getByText("Cover letter workspace")).toBeInTheDocument();
    expect(screen.queryByText("Resume sections")).not.toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /cover letter/i })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it("updates the URL when switching to cover letter mode", async () => {
    render(<BuilderPage />);

    fireEvent.click(await screen.findByRole("tab", { name: /cover letter/i }));

    await waitFor(() => {
      expect(navigationMock.replace).toHaveBeenCalledWith(
        "/builder?mode=cover-letter",
        { scroll: false }
      );
    });
    expect(screen.getByText("Cover letter workspace")).toBeInTheDocument();
  });

  it("persists a restored version as the newest version", async () => {
    const oldVersion: BuilderVersion = {
      id: "old",
      kind: "manual",
      name: "Old version",
      savedAt: "2026-01-01T00:00:00.000Z",
      state: {
        ...baseDraftState,
        templateId: "modern",
      },
    };
    const latestVersion: BuilderVersion = {
      id: "latest",
      kind: "manual",
      name: "Latest version",
      savedAt: "2026-01-02T00:00:00.000Z",
      state: baseDraftState,
    };

    window.localStorage.setItem(
      getBuilderVersionStorageKey("resume"),
      JSON.stringify([latestVersion, oldVersion])
    );

    render(<BuilderPage />);

    fireEvent.click(await screen.findByRole("button", { name: /old version/i }));
    fireEvent.click(screen.getByRole("button", { name: /restore/i }));

    await waitFor(() => {
      const rawVersions = window.localStorage.getItem(
        getBuilderVersionStorageKey("resume")
      );
      const versions = JSON.parse(rawVersions ?? "[]") as BuilderVersion[];

      expect(versions[0]).toMatchObject({
        kind: "manual",
        name: "Restored Old version",
        state: {
          templateId: "modern",
        },
      });
    });
  });
});
