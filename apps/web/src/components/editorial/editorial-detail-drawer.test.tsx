import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EditorialDetailDrawer } from "./editorial-detail-drawer";

describe("EditorialDetailDrawer", () => {
  it("renders nothing when closed", () => {
    render(
      <EditorialDetailDrawer open={false} onClose={() => {}} title="Hidden">
        Body
      </EditorialDetailDrawer>,
    );
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders title + eyebrow + body when open", () => {
    render(
      <EditorialDetailDrawer
        open
        onClose={() => {}}
        title="Senior Designer"
        eyebrow="OPPORTUNITY"
      >
        <p>Acme Inc.</p>
      </EditorialDetailDrawer>,
    );
    expect(screen.getByRole("dialog")).toHaveAttribute(
      "aria-label",
      "Senior Designer",
    );
    expect(
      screen.getByRole("heading", { name: "Senior Designer" }),
    ).toBeVisible();
    expect(screen.getByText("OPPORTUNITY")).toBeVisible();
    expect(screen.getByText("Acme Inc.")).toBeVisible();
  });

  it("invokes onClose when the close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <EditorialDetailDrawer open onClose={onClose} title="x">
        body
      </EditorialDetailDrawer>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("invokes onClose when the scrim is clicked", () => {
    const onClose = vi.fn();
    render(
      <EditorialDetailDrawer open onClose={onClose} title="x">
        body
      </EditorialDetailDrawer>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Dismiss drawer" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("invokes onClose on Escape", () => {
    const onClose = vi.fn();
    render(
      <EditorialDetailDrawer open onClose={onClose} title="x">
        body
      </EditorialDetailDrawer>,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("renders a header action slot", () => {
    render(
      <EditorialDetailDrawer
        open
        onClose={() => {}}
        title="x"
        headerAction={<span>tag</span>}
      >
        body
      </EditorialDetailDrawer>,
    );
    expect(screen.getByText("tag")).toBeInTheDocument();
  });

  it("renders a footer slot when provided", () => {
    render(
      <EditorialDetailDrawer
        open
        onClose={() => {}}
        title="x"
        footer={<button>Save</button>}
      >
        body
      </EditorialDetailDrawer>,
    );
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("respects a custom widthPx", () => {
    render(
      <EditorialDetailDrawer open onClose={() => {}} title="x" widthPx={600}>
        body
      </EditorialDetailDrawer>,
    );
    const dialog = screen.getByRole("dialog");
    // The drawer body is the second child (after the scrim button).
    const drawerBody = dialog.querySelector("[tabindex='-1']") as HTMLElement;
    expect(drawerBody.style.maxWidth).toBe("600px");
  });
});
