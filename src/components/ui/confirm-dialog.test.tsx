import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useConfirmDialog } from "./confirm-dialog";

function TestConfirmDialog({
  onResult,
}: {
  onResult: (result: boolean) => void;
}) {
  const { confirm, dialog } = useConfirmDialog();

  async function handleClick() {
    const result = await confirm({
      title: "Delete this record?",
      description: "This cannot be undone.",
      confirmLabel: "Delete",
    });
    onResult(result);
  }

  return (
    <>
      <button type="button" onClick={() => void handleClick()}>
        Open confirm
      </button>
      {dialog}
    </>
  );
}

function TestSequentialConfirmDialog({
  onFirstResult,
}: {
  onFirstResult: (result: boolean) => void;
}) {
  const { confirm, dialog } = useConfirmDialog();

  async function handleClick() {
    void confirm({
      title: "First action?",
      description: "First description.",
    }).then(onFirstResult);

    void confirm({
      title: "Second action?",
      description: "Second description.",
    });
  }

  return (
    <>
      <button type="button" onClick={() => void handleClick()}>
        Open sequential confirms
      </button>
      {dialog}
    </>
  );
}

describe("useConfirmDialog", () => {
  it("resolves true when the destructive action is confirmed", async () => {
    const onResult = vi.fn();
    render(<TestConfirmDialog onResult={onResult} />);

    fireEvent.click(screen.getByRole("button", { name: "Open confirm" }));
    expect(await screen.findByText("Delete this record?")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    await waitFor(() => expect(onResult).toHaveBeenCalledWith(true));
  });

  it("resolves false when the dialog is cancelled", async () => {
    const onResult = vi.fn();
    render(<TestConfirmDialog onResult={onResult} />);

    fireEvent.click(screen.getByRole("button", { name: "Open confirm" }));
    expect(await screen.findByText("Delete this record?")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(onResult).toHaveBeenCalledWith(false));
  });

  it("focuses cancel by default", async () => {
    render(<TestConfirmDialog onResult={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Open confirm" }));

    expect(await screen.findByRole("button", { name: "Cancel" })).toHaveFocus();
  });

  it("cancels a pending confirmation when a new one opens", async () => {
    const onFirstResult = vi.fn();
    render(<TestSequentialConfirmDialog onFirstResult={onFirstResult} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Open sequential confirms" }),
    );

    await waitFor(() => expect(onFirstResult).toHaveBeenCalledWith(false));
    expect(await screen.findByText("Second action?")).toBeInTheDocument();
  });
});
