import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ChatEditor } from "./chat-editor";

const baseProps = {
  jobDescription: "We need a React engineer who can improve API reliability.",
  jobTitle: "Frontend Engineer",
  company: "Acme",
  initialContent: "I built APIs quickly for internal teams.",
};

describe("ChatEditor", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        return new Response(
          JSON.stringify({
            content: "I built reliable APIs for internal teams.",
          }),
          { status: 200 }
        );
      })
    );
  });

  it("renders the initial cover letter and revision controls", () => {
    render(<ChatEditor {...baseProps} />);

    expect(screen.getByText("Cover Letter")).toBeInTheDocument();
    expect(screen.getByText("v1 of 1")).toBeInTheDocument();
    expect(
      screen.getByText("I built APIs quickly for internal teams.")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Regenerate" })).toBeEnabled();
    expect(
      screen.getByRole("textbox", { name: "Revision instructions" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Revise cover letter" })
    ).toBeDisabled();
  });

  it("revises the current version with an instruction", async () => {
    const fetchMock = vi.mocked(fetch);
    render(<ChatEditor {...baseProps} />);

    fireEvent.change(
      screen.getByRole("textbox", { name: "Revision instructions" }),
      { target: { value: "Make it more specific." } }
    );
    fireEvent.click(screen.getByRole("button", { name: "Revise cover letter" }));

    expect(
      await screen.findByText("I built reliable APIs for internal teams.")
    ).toBeInTheDocument();
    expect(screen.getByText("v2 of 2")).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Revision instructions" })
    ).toHaveValue("");

    const body = JSON.parse(
      String(fetchMock.mock.calls[0][1]?.body)
    ) as Record<string, unknown>;
    expect(body).toMatchObject({
      action: "revise",
      currentContent: baseProps.initialContent,
      instruction: "Make it more specific.",
    });
  });

  it("can revert to an older version from history", async () => {
    render(<ChatEditor {...baseProps} />);

    fireEvent.change(
      screen.getByRole("textbox", { name: "Revision instructions" }),
      { target: { value: "Make it more specific." } }
    );
    fireEvent.click(screen.getByRole("button", { name: "Revise cover letter" }));

    await screen.findByText("v2 of 2");
    fireEvent.click(screen.getByRole("button", { name: "History" }));
    fireEvent.click(
      screen.getByRole("button", { name: "v1Initial generation" })
    );

    expect(screen.getByText("v1 of 2")).toBeInTheDocument();
    expect(
      screen.getByText("I built APIs quickly for internal teams.")
    ).toBeInTheDocument();
  });

  it("regenerates the cover letter and resets version history", async () => {
    const fetchMock = vi.mocked(fetch);
    render(<ChatEditor {...baseProps} />);

    fireEvent.change(
      screen.getByRole("textbox", { name: "Revision instructions" }),
      { target: { value: "Make it more specific." } }
    );
    fireEvent.click(screen.getByRole("button", { name: "Revise cover letter" }));
    await screen.findByText("v2 of 2");

    fireEvent.click(screen.getByRole("button", { name: "Regenerate" }));

    await waitFor(() => {
      expect(screen.getByText("v1 of 1")).toBeInTheDocument();
    });
    expect(
      screen.getByText("I built reliable APIs for internal teams.")
    ).toBeInTheDocument();

    const regenerateCall = fetchMock.mock.calls.find(([, init]) => {
      const body = JSON.parse(String(init?.body ?? "{}")) as {
        action?: string;
      };
      return body.action === "generate";
    });
    expect(regenerateCall).toBeTruthy();
  });
});
