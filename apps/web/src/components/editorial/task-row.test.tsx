import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TaskRow } from "./task-row";

describe("TaskRow", () => {
  it("renders the title and zero-padded index", () => {
    render(<TaskRow index={1} title="Review 3 new opportunities" />);
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("Review 3 new opportunities")).toBeInTheDocument();
  });

  it("preserves a string index without padding", () => {
    render(<TaskRow index="•" title="Anything" />);
    expect(screen.getByText("•")).toBeInTheDocument();
  });

  it("renders eyebrow, meta, and action slots when provided", () => {
    render(
      <TaskRow
        index={2}
        eyebrow="TODAY"
        title="Prep for Linear screen"
        meta="In 4 days"
        action={<button>Open</button>}
      />,
    );
    expect(screen.getByText("TODAY")).toBeInTheDocument();
    expect(screen.getByText("In 4 days")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open" })).toBeInTheDocument();
  });

  it("invokes onClick when activated as a button", () => {
    const handler = vi.fn();
    render(<TaskRow index={1} title="x" onClick={handler} />);
    const row = screen.getByRole("button");
    row.click();
    expect(handler).toHaveBeenCalledOnce();
  });

  it("invokes onClick on Enter when interactive", () => {
    const handler = vi.fn();
    render(<TaskRow index={1} title="x" onClick={handler} />);
    fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
    expect(handler).toHaveBeenCalledOnce();
  });

  it("is not a button when no onClick is provided", () => {
    render(<TaskRow index={1} title="x" />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("shows the active treatment when active", () => {
    const { container } = render(<TaskRow index={1} title="x" active />);
    expect((container.firstChild as HTMLElement).className).toMatch(
      /border-brand/,
    );
  });
});
