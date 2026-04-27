import { beforeEach, describe, expect, it, vi } from "vitest";
<<<<<<< HEAD
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import BuilderPage from "./page";
import { getBuilderVersionStorageKey } from "@/lib/builder/version-history";
import type {
  BuilderDraftState,
  BuilderVersion,
} from "@/lib/builder/version-history";
=======
import BuilderRedirectPage from "./page";
>>>>>>> 0e974c5 (Consolidate document routes into studio)

const redirectMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

<<<<<<< HEAD
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
=======
describe("BuilderRedirectPage", () => {
  beforeEach(() => {
    redirectMock.mockClear();
>>>>>>> 0e974c5 (Consolidate document routes into studio)
  });

  it("redirects to Document Studio", () => {
    BuilderRedirectPage({});

    expect(redirectMock).toHaveBeenCalledWith("/studio");
  });

  it("preserves the legacy cover letter builder mode", () => {
    BuilderRedirectPage({ searchParams: { mode: "cover-letter" } });

    expect(redirectMock).toHaveBeenCalledWith("/studio?mode=cover-letter");
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
