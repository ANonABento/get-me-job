import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AiAssistantPanel } from "./ai-assistant-panel";

function statusResponse(configured: boolean) {
  return new Response(
    JSON.stringify({
      configured,
      provider: configured ? "openai" : null,
    }),
    { status: 200 },
  );
}

function renderWithSelectableText(
  anchorText = "Built APIs quickly.",
  options: {
    onOpportunityClear?: () => void;
    onOpportunitySelect?: (opportunityId: string) => void;
  } = {},
) {
  const onOpenBank = vi.fn();
  const view = render(
    <div>
      <div data-document-editor-root="true">
        <p>{anchorText}</p>
      </div>
      <AiAssistantPanel
        documentContent="<p>Built APIs quickly.</p>"
        selectedEntryCount={1}
        onOpenBank={onOpenBank}
        onOpportunityClear={options.onOpportunityClear}
        onOpportunitySelect={options.onOpportunitySelect}
      />
    </div>,
  );

  return { ...view, onOpenBank };
}

function selectionWithText(text: string, anchorNode: Node | null): Selection {
  return {
    toString: () => text,
    anchorNode,
  } as unknown as Selection;
}

describe("AiAssistantPanel", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    window.history.replaceState(null, "", "/");
  });

  it("renders the AI assistant controls", () => {
    render(
      <AiAssistantPanel
        documentContent=""
        selectedEntryCount={0}
        onOpenBank={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Job description")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Tailor to JD" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Select from Job Bank" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Generate from Bank" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Rewrite Section")).toBeInTheDocument();
  });

  it("shows a setup prompt when LLM providers are not configured", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(statusResponse(false)));
    renderWithSelectableText();

    fireEvent.change(screen.getByLabelText("Job description"), {
      target: { value: "React role" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Tailor to JD" }));

    expect(
      await screen.findByText("Set up an LLM provider to use AI tools."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open Settings" })).toHaveAttribute(
      "href",
      "/settings",
    );
  });

  it("shows a loading state while checking setup", async () => {
    let resolveStatus: (response: Response) => void = () => {};
    vi.stubGlobal(
      "fetch",
      vi.fn(
        () =>
          new Promise<Response>((resolve) => {
            resolveStatus = resolve;
          }),
      ),
    );
    renderWithSelectableText();

    fireEvent.change(screen.getByLabelText("Job description"), {
      target: { value: "React role" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Tailor to JD" }));

    expect(
      screen.getByRole("button", { name: "Tailoring..." }),
    ).toBeDisabled();
    resolveStatus(statusResponse(false));

    expect(
      await screen.findByText("Set up an LLM provider to use AI tools."),
    ).toBeInTheDocument();
  });

  it("validates job-description actions before checking setup", () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    renderWithSelectableText();

    fireEvent.click(screen.getByRole("button", { name: "Tailor to JD" }));

    expect(screen.getByText("Paste a job description first.")).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("disables other assistant actions while an action is running", async () => {
    let resolveStatus: (response: Response) => void = () => {};
    vi.stubGlobal(
      "fetch",
      vi.fn(
        () =>
          new Promise<Response>((resolve) => {
            resolveStatus = resolve;
          }),
      ),
    );
    renderWithSelectableText();

    fireEvent.change(screen.getByLabelText("Job description"), {
      target: { value: "React role" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Tailor to JD" }));

    expect(
      screen.getByRole("button", { name: "Tailoring..." }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Generate from Bank" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Rewrite selected section" }),
    ).toBeDisabled();

    resolveStatus(statusResponse(false));
    expect(
      await screen.findByText("Set up an LLM provider to use AI tools."),
    ).toBeInTheDocument();
  });

  it("shows contextual quick actions for selected document text", async () => {
    const { container } = renderWithSelectableText();
    const paragraph = container.querySelector("p");
    const textNode = paragraph?.firstChild;
    vi.spyOn(window, "getSelection").mockReturnValue(
      selectionWithText("Built APIs quickly.", textNode ?? null),
    );

    fireEvent(document, new Event("selectionchange"));

    expect(
      await screen.findByRole("region", {
        name: "Selected text quick actions",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Rewrite" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Make concise" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add metrics" }),
    ).toBeInTheDocument();
  });

  it("keeps selected text actions visible when focus moves into the assistant panel", async () => {
    const { container } = renderWithSelectableText();
    const paragraph = container.querySelector("p");
    const textNode = paragraph?.firstChild;
    const getSelection = vi.spyOn(window, "getSelection");
    getSelection.mockReturnValue(
      selectionWithText("Built APIs quickly.", textNode ?? null),
    );

    fireEvent(document, new Event("selectionchange"));

    const rewriteButton = await screen.findByRole("button", {
      name: "Rewrite",
    });
    getSelection.mockReturnValue(
      selectionWithText("", rewriteButton.firstChild),
    );
    rewriteButton.focus();
    fireEvent(document, new Event("selectionchange"));

    expect(
      screen.getByRole("region", {
        name: "Selected text quick actions",
      }),
    ).toBeInTheDocument();
  });

  it("hides selected text actions when selection moves outside the document and panel", async () => {
    const { container } = renderWithSelectableText();
    const paragraph = container.querySelector("p");
    const textNode = paragraph?.firstChild;
    const getSelection = vi.spyOn(window, "getSelection");
    getSelection.mockReturnValue(
      selectionWithText("Built APIs quickly.", textNode ?? null),
    );

    fireEvent(document, new Event("selectionchange"));
    expect(await screen.findByText("Selected text")).toBeInTheDocument();

    getSelection.mockReturnValue(selectionWithText("", document.body));
    fireEvent(document, new Event("selectionchange"));

    await waitFor(() =>
      expect(screen.queryByText("Selected text")).not.toBeInTheDocument(),
    );
  });

  it("sends selected text rewrites to the assistant endpoint", async () => {
    const assistantRequests: unknown[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        if (url === "/api/settings/status") return statusResponse(true);
        if (url === "/api/documents/assistant") {
          assistantRequests.push(JSON.parse(String(init?.body)));
          return new Response(
            JSON.stringify({
              success: true,
              content: "Built reliable APIs quickly.",
            }),
            { status: 200 },
          );
        }
        return new Response("Not found", { status: 404 });
      }),
    );
    const { container } = renderWithSelectableText();
    const textNode = container.querySelector("p")?.firstChild;
    vi.spyOn(window, "getSelection").mockReturnValue(
      selectionWithText("Built APIs quickly.", textNode ?? null),
    );

    fireEvent(document, new Event("selectionchange"));
    fireEvent.click(await screen.findByRole("button", { name: "Rewrite" }));

    await waitFor(() =>
      expect(assistantRequests).toEqual([
        {
          action: "rewrite",
          selectedText: "Built APIs quickly.",
          documentContent: "<p>Built APIs quickly.</p>",
        },
      ]),
    );
    expect(screen.getByText("Built reliable APIs quickly.")).toBeInTheDocument();
  });

  it("opens the bank picker from the generate action after setup passes", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(statusResponse(true)));
    const { onOpenBank } = renderWithSelectableText();

    fireEvent.click(screen.getByRole("button", { name: "Generate from Bank" }));

    await waitFor(() => expect(onOpenBank).toHaveBeenCalledTimes(1));
    expect(
      screen.getByText("Bank entries are ready for the next generation step."),
    ).toBeInTheDocument();
  });

  it("loads a selected job bank opportunity into the JD input", async () => {
    const onOpportunitySelect = vi.fn();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url === "/api/opportunities?status=saved,applied") {
          return new Response(
            JSON.stringify({
              opportunities: [
                {
                  id: "job-1",
                  type: "job",
                  title: "Frontend Engineer",
                  company: "Acme",
                  source: "manual",
                  summary: "Build accessible React workflows.",
                  status: "saved",
                  tags: [],
                  createdAt: "2026-01-01T00:00:00.000Z",
                  updatedAt: "2026-01-01T00:00:00.000Z",
                },
              ],
            }),
            { status: 200 },
          );
        }
        return new Response("Not found", { status: 404 });
      }),
    );
    renderWithSelectableText("Built APIs quickly.", { onOpportunitySelect });

    fireEvent.click(screen.getByRole("button", { name: "Select from Job Bank" }));
    fireEvent.click(await screen.findByRole("button", { name: /frontend engineer/i }));

    expect(screen.getByLabelText("Job description")).toHaveValue(
      "Build accessible React workflows.",
    );
    expect(screen.getByText("Frontend Engineer at Acme")).toBeInTheDocument();
    expect(onOpportunitySelect).toHaveBeenCalledWith("job-1");
  });

  it("preloads the URL opportunity parameter into the JD input", async () => {
    const onOpportunitySelect = vi.fn();
    window.history.pushState(null, "", "/studio?opportunityId=job-2");
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url === "/api/opportunities/job-2") {
          return new Response(
            JSON.stringify({
              opportunity: {
                id: "job-2",
                type: "job",
                title: "Product Engineer",
                company: "Beta",
                source: "manual",
                summary: "Own full-stack product quality.",
                status: "applied",
                tags: [],
                createdAt: "2026-01-01T00:00:00.000Z",
                updatedAt: "2026-01-01T00:00:00.000Z",
              },
            }),
            { status: 200 },
          );
        }
        return new Response("Not found", { status: 404 });
      }),
    );

    renderWithSelectableText("Built APIs quickly.", { onOpportunitySelect });

    await waitFor(() =>
      expect(screen.getByLabelText("Job description")).toHaveValue(
        "Own full-stack product quality.",
      ),
    );
    expect(screen.getByText("Product Engineer at Beta")).toBeInTheDocument();
    expect(onOpportunitySelect).toHaveBeenCalledWith("job-2");
  });

  it("clears the selected opportunity when the JD is edited manually", async () => {
    const onOpportunityClear = vi.fn();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url === "/api/opportunities?status=saved,applied") {
          return new Response(
            JSON.stringify({
              opportunities: [
                {
                  id: "job-1",
                  type: "job",
                  title: "Frontend Engineer",
                  company: "Acme",
                  source: "manual",
                  summary: "Build accessible React workflows.",
                  status: "saved",
                  tags: [],
                  createdAt: "2026-01-01T00:00:00.000Z",
                  updatedAt: "2026-01-01T00:00:00.000Z",
                },
              ],
            }),
            { status: 200 },
          );
        }
        return new Response("Not found", { status: 404 });
      }),
    );
    renderWithSelectableText("Built APIs quickly.", { onOpportunityClear });

    fireEvent.click(screen.getByRole("button", { name: "Select from Job Bank" }));
    fireEvent.click(await screen.findByRole("button", { name: /frontend engineer/i }));
    fireEvent.change(screen.getByLabelText("Job description"), {
      target: { value: "Manual JD override" },
    });

    expect(onOpportunityClear).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Frontend Engineer at Acme")).not.toBeInTheDocument();
  });
});
