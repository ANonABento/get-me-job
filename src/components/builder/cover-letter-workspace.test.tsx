import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CoverLetterWorkspace } from "./cover-letter-workspace";

const exportMocks = vi.hoisted(() => ({
  downloadHtmlAsPdf: vi.fn(),
}));

vi.mock("@/lib/builder/document-export", async () => {
  const actual = await vi.importActual<
    typeof import("@/lib/builder/document-export")
  >("@/lib/builder/document-export");

  return {
    ...actual,
    downloadHtmlAsPdf: exportMocks.downloadHtmlAsPdf,
  };
});

describe("CoverLetterWorkspace", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    exportMocks.downloadHtmlAsPdf.mockResolvedValue(undefined);
  });

  it("loads a cover-letter-only file list and opens extracted text in the structured editor", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          documents: [
            {
              id: "doc-1",
              filename: "acme-cover-letter.pdf",
              type: "cover_letter",
              mimeType: "application/pdf",
              size: 1024,
              path: "/uploads/acme-cover-letter.pdf",
              extractedText:
                "Dear Acme team,\n\nI built useful products.\n\nSincerely,\nJane",
              uploadedAt: "2026-04-01T10:00:00.000Z",
            },
          ],
        }),
        { status: 200 }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<CoverLetterWorkspace />);

    fireEvent.click(await screen.findByText("acme-cover-letter.pdf"));

    expect(fetchMock).toHaveBeenCalledWith("/api/documents?type=cover_letter");
    expect(screen.getByLabelText("Opening")).toHaveValue("Dear Acme team,");
    expect(screen.getByLabelText("Body")).toHaveValue("I built useful products.");
    expect(screen.getByLabelText("Closing")).toHaveValue("Sincerely, Jane");
  });

  it("clears the editor when the selected cover letter has no extracted text", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          documents: [
            {
              id: "doc-1",
              filename: "filled-cover-letter.pdf",
              type: "cover_letter",
              mimeType: "application/pdf",
              size: 1024,
              path: "/uploads/filled-cover-letter.pdf",
              extractedText:
                "Dear Acme team,\n\nI built useful products.\n\nSincerely,\nJane",
              uploadedAt: "2026-04-01T10:00:00.000Z",
            },
            {
              id: "doc-2",
              filename: "empty-cover-letter.pdf",
              type: "cover_letter",
              mimeType: "application/pdf",
              size: 256,
              path: "/uploads/empty-cover-letter.pdf",
              uploadedAt: "2026-04-02T10:00:00.000Z",
            },
          ],
        }),
        { status: 200 }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<CoverLetterWorkspace />);

    fireEvent.click(await screen.findByText("filled-cover-letter.pdf"));
    expect(screen.getByLabelText("Opening")).toHaveValue("Dear Acme team,");

    fireEvent.click(screen.getByText("empty-cover-letter.pdf"));

    expect(screen.getByLabelText("Opening")).toHaveValue("");
    expect(screen.getByLabelText("Body")).toHaveValue("");
    expect(screen.getByLabelText("Closing")).toHaveValue("");
  });

  it("generates from job description and bank data into opening, body, and closing sections", async () => {
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url === "/api/documents?type=cover_letter") {
        return new Response(JSON.stringify({ documents: [] }), { status: 200 });
      }

      return new Response(
        JSON.stringify({
          success: true,
          content:
            "Dear Acme team,\n\nMy React work maps to this role.\n\nI would welcome the chance to talk.",
        }),
        { status: 200 }
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<CoverLetterWorkspace />);

    fireEvent.change(screen.getByLabelText("Job Title"), {
      target: { value: "Senior Engineer" },
    });
    fireEvent.change(screen.getByLabelText("Company"), {
      target: { value: "Acme" },
    });
    fireEvent.change(screen.getByLabelText("Job Description"), {
      target: {
        value:
          "We need a senior engineer with React and TypeScript experience.",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: /generate cover letter/i }));

    await waitFor(() => {
      expect(screen.getByLabelText("Opening")).toHaveValue("Dear Acme team,");
    });

    expect(screen.getByLabelText("Body")).toHaveValue(
      "My React work maps to this role."
    );
    expect(screen.getByLabelText("Closing")).toHaveValue(
      "I would welcome the chance to talk."
    );

    const generateBody = JSON.parse(
      String(fetchMock.mock.calls[1][1]?.body)
    ) as Record<string, unknown>;
    expect(generateBody).toMatchObject({
      action: "generate",
      jobTitle: "Senior Engineer",
      company: "Acme",
    });
  });

  it("exports the structured cover letter preview through the shared PDF endpoint", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ documents: [] }), { status: 200 })
      )
    );

    render(<CoverLetterWorkspace />);

    fireEvent.change(screen.getByLabelText("Candidate Name"), {
      target: { value: "Jane Doe" },
    });
    fireEvent.change(screen.getByLabelText("Company"), {
      target: { value: "Acme" },
    });
    fireEvent.change(screen.getByLabelText("Opening"), {
      target: { value: "Dear Acme team," },
    });
    fireEvent.change(screen.getByLabelText("Body"), {
      target: { value: "I built the systems you need." },
    });
    fireEvent.change(screen.getByLabelText("Closing"), {
      target: { value: "Sincerely,\nJane" },
    });

    fireEvent.click(screen.getByRole("button", { name: /download pdf/i }));

    await waitFor(() =>
      expect(exportMocks.downloadHtmlAsPdf).toHaveBeenCalledWith(
        expect.stringContaining("I built the systems you need."),
        "cover-letter-acme.pdf"
      )
    );
  });
});
