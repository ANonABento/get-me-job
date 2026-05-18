import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ToolkitTabs } from "./toolkit-tabs";

const navigation = vi.hoisted(() => ({
  replace: vi.fn(),
  push: vi.fn(),
  searchParams: new URLSearchParams(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: navigation.replace,
    push: navigation.push,
  }),
  usePathname: () => "/toolkit",
  useSearchParams: () => navigation.searchParams,
}));

vi.mock("./email-templates-pane", () => ({
  EmailTemplatesPane: () => <div>Email pane</div>,
}));

vi.mock("./salary-research-pane", () => ({
  SalaryResearchPane: () => <div>Salary pane</div>,
}));

describe("ToolkitTabs", () => {
  beforeEach(() => {
    navigation.replace.mockClear();
    navigation.push.mockClear();
    navigation.searchParams = new URLSearchParams();
  });

  it("redirects the cover-letter tab to Studio cover-letter mode", async () => {
    navigation.searchParams = new URLSearchParams("tab=cover-letter");

    render(<ToolkitTabs />);

    await waitFor(() => {
      expect(navigation.replace).toHaveBeenCalledWith(
        "/studio?mode=cover-letter",
        { scroll: false },
      );
    });
  });

  it("hides the recruiter rewriter tab until it has a workflow", () => {
    render(<ToolkitTabs />);

    expect(
      screen.queryByRole("tab", { name: /recruiter rewriter/i }),
    ).not.toBeInTheDocument();
  });

  it("opens Studio when the cover-letter tab is clicked", async () => {
    render(<ToolkitTabs />);

    fireEvent.click(screen.getByRole("tab", { name: /cover letter/i }));

    expect(navigation.push).toHaveBeenCalledWith("/studio?mode=cover-letter");
  });
});
