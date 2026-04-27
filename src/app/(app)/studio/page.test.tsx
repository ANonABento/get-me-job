import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import StudioPage from "./page";

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
    navigationMock.replace.mockClear();
    navigationMock.searchParams = new URLSearchParams();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ entries: [] }),
      })
    );
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
});
