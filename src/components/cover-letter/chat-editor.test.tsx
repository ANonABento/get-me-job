import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ChatEditor } from "./chat-editor";

const baseProps = {
  jobDescription: "We need a React engineer who can improve API reliability.",
  jobTitle: "Frontend Engineer",
  company: "Acme",
  initialContent: "I built APIs quickly for internal teams.",
};

describe("ChatEditor AI assistant", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          content: "I built reliable APIs for internal teams.",
        }),
      })
    );
  });

  it("shows general suggestions before text is selected", () => {
    render(<ChatEditor {...baseProps} />);

    expect(screen.getByText("AI Assistant")).toBeInTheDocument();
    expect(
      screen.getByText("Select text in the editor to rewrite a specific passage.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Select relevant experience and match JD keywords.")
    ).toBeInTheDocument();
  });

  it("generates a selection rewrite and accepts it into the editor", async () => {
    render(<ChatEditor {...baseProps} />);

    const editor = screen.getByLabelText("Cover letter editor") as HTMLTextAreaElement;
    editor.setSelectionRange(0, baseProps.initialContent.length);
    fireEvent.select(editor);

    expect(screen.getByRole("button", { name: "Rewrite" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Make concise" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add metrics" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Match JD keywords" })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Rewrite" }));

    await waitFor(() => {
      expect(
        screen.getByText("I built reliable APIs for internal teams.")
      ).toBeInTheDocument();
    });
    expect(screen.getByText("Before")).toBeInTheDocument();
    expect(screen.getByText("After")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Accept" }));

    await waitFor(() => {
      expect(editor.value).toBe("I built reliable APIs for internal teams.");
    });
  });

  it("rejects generated rewrites without changing editor content", async () => {
    render(<ChatEditor {...baseProps} />);

    const editor = screen.getByLabelText("Cover letter editor") as HTMLTextAreaElement;
    editor.setSelectionRange(0, baseProps.initialContent.length);
    fireEvent.select(editor);
    fireEvent.click(screen.getByRole("button", { name: "Rewrite" }));

    await screen.findByText("I built reliable APIs for internal teams.");

    fireEvent.click(screen.getByRole("button", { name: "Reject" }));

    expect(editor.value).toBe(baseProps.initialContent);
    expect(
      screen.queryByText("I built reliable APIs for internal teams.")
    ).not.toBeInTheDocument();
  });
});
