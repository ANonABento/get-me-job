import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
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
      }),
    );
  });

  it("shows general suggestions before text is selected", () => {
    render(<ChatEditor {...baseProps} />);

    expect(screen.getByText("AI Assistant")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Select text in the editor to rewrite a specific passage.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Select relevant experience and match JD keywords."),
    ).toBeInTheDocument();
  });

  it("generates a selection rewrite and accepts it into the editor", async () => {
    render(<ChatEditor {...baseProps} />);

    const editor = screen.getByLabelText(
      "Cover letter editor",
    ) as HTMLTextAreaElement;
    editor.setSelectionRange(0, baseProps.initialContent.length);
    fireEvent.select(editor);

    expect(screen.getByRole("button", { name: "Rewrite" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Make concise" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add metrics" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Match JD keywords" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Rewrite" }));

    await waitFor(() => {
      expect(
        screen.getByText("I built reliable APIs for internal teams."),
      ).toBeInTheDocument();
    });
    const rewriteRequest = vi.mocked(fetch).mock.calls[0];
    expect(rewriteRequest[0]).toBe("/api/cover-letter/generate");
    expect(
      JSON.parse((rewriteRequest[1] as RequestInit).body as string),
    ).toMatchObject({
      action: "rewrite",
      currentContent: baseProps.initialContent,
      selectedText: baseProps.initialContent,
      instruction: "Rewrite",
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

    const editor = screen.getByLabelText(
      "Cover letter editor",
    ) as HTMLTextAreaElement;
    editor.setSelectionRange(0, baseProps.initialContent.length);
    fireEvent.select(editor);
    fireEvent.click(screen.getByRole("button", { name: "Rewrite" }));

    await screen.findByText("I built reliable APIs for internal teams.");

    fireEvent.click(screen.getByRole("button", { name: "Reject" }));

    expect(editor.value).toBe(baseProps.initialContent);
    expect(
      screen.queryByText("I built reliable APIs for internal teams."),
    ).not.toBeInTheDocument();
  });

  it("ignores assistant rewrites that resolve after the editor changes", async () => {
    let resolveFetch: (response: Response) => void = () => {};
    vi.stubGlobal(
      "fetch",
      vi.fn(
        () =>
          new Promise<Response>((resolve) => {
            resolveFetch = resolve;
          }),
      ),
    );

    render(<ChatEditor {...baseProps} />);

    const editor = screen.getByLabelText(
      "Cover letter editor",
    ) as HTMLTextAreaElement;
    editor.setSelectionRange(0, baseProps.initialContent.length);
    fireEvent.select(editor);
    fireEvent.click(screen.getByRole("button", { name: "Rewrite" }));

    fireEvent.change(editor, {
      target: { value: "Manual edit while assistant runs." },
    });

    await act(async () => {
      resolveFetch(
        new Response(
          JSON.stringify({
            success: true,
            content: "This stale rewrite should not appear.",
          }),
          { status: 200 },
        ),
      );
    });

    expect(editor.value).toBe("Manual edit while assistant runs.");
    expect(
      screen.queryByText("This stale rewrite should not appear."),
    ).not.toBeInTheDocument();

    editor.setSelectionRange(0, editor.value.length);
    fireEvent.select(editor);

    expect(screen.getByRole("button", { name: "Rewrite" })).not.toBeDisabled();
  });

  it("clears selected rewrite actions when switching versions", async () => {
    render(<ChatEditor {...baseProps} />);

    const instruction = screen.getByPlaceholderText(
      /make it more concise/i,
    ) as HTMLTextAreaElement;
    fireEvent.change(instruction, {
      target: { value: "Emphasize reliability" },
    });
    fireEvent.keyDown(instruction, { key: "Enter" });

    expect(await screen.findByText("v2 of 2")).toBeInTheDocument();

    const editor = screen.getByLabelText(
      "Cover letter editor",
    ) as HTMLTextAreaElement;
    editor.setSelectionRange(0, editor.value.length);
    fireEvent.select(editor);

    expect(screen.getByRole("button", { name: "Rewrite" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "History" }));
    fireEvent.click(screen.getByRole("button", { name: /v1/i }));

    expect(
      screen.queryByRole("button", { name: "Rewrite" }),
    ).not.toBeInTheDocument();
  });
});
