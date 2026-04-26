import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SourceDocuments } from "./source-documents";

const mocks = vi.hoisted(() => ({
  showErrorToast: vi.fn(),
}));

vi.mock("@/hooks/use-error-toast", () => ({
  useErrorToast: () => mocks.showErrorToast,
}));

const documents = [
  {
    id: "doc-1",
    filename: "resume.pdf",
    size: 2048,
    uploadedAt: "2024-01-15T10:00:00.000Z",
    chunkCount: 3,
  },
  {
    id: "doc-2",
    filename: "portfolio.pdf",
    size: 4096,
    uploadedAt: "2024-01-16T10:00:00.000Z",
    chunkCount: 0,
  },
];

function jsonResponse(body: unknown, ok = true) {
  return {
    ok,
    json: () => Promise.resolve(body),
  } as Response;
}

describe("SourceDocuments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue(jsonResponse({ documents }));
  });

  it("renders source documents returned from the API", async () => {
    render(
      <SourceDocuments
        refreshKey={0}
        onFilterByDocument={vi.fn()}
        activeDocumentId={null}
      />
    );

    expect(await screen.findByText("resume.pdf")).toBeInTheDocument();
    expect(screen.getByText("portfolio.pdf")).toBeInTheDocument();
  });

  it("selects all source files from the header checkbox", async () => {
    render(
      <SourceDocuments
        refreshKey={0}
        onFilterByDocument={vi.fn()}
        activeDocumentId={null}
      />
    );

    await screen.findByText("resume.pdf");
    fireEvent.click(screen.getByLabelText("Select all source files"));

    expect(screen.getByText("2 selected")).toBeInTheDocument();
    expect(screen.getByLabelText("Select resume.pdf")).toBeChecked();
    expect(screen.getByLabelText("Select portfolio.pdf")).toBeChecked();
  });

  it("bulk deletes selected source files", async () => {
    const onDelete = vi.fn();
    const onFilterByDocument = vi.fn();
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ documents }))
      .mockResolvedValueOnce(
        jsonResponse({ success: true, documentsDeleted: 1, chunksDeleted: 3 })
      );

    render(
      <SourceDocuments
        refreshKey={0}
        onFilterByDocument={onFilterByDocument}
        activeDocumentId="doc-1"
        onDelete={onDelete}
      />
    );

    await screen.findByText("resume.pdf");
    fireEvent.click(screen.getByLabelText("Select resume.pdf"));
    fireEvent.click(screen.getByRole("button", { name: "Delete Selected" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Delete Selected" }).at(-1)!);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenLastCalledWith("/api/bank/documents", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentIds: ["doc-1"] }),
      });
    });
    expect(onFilterByDocument).toHaveBeenCalledWith(null);
    expect(onDelete).toHaveBeenCalled();
    expect(screen.queryByText("resume.pdf")).not.toBeInTheDocument();
  });

  it("removes only the documents included in the confirmed bulk delete request", async () => {
    let resolveDelete: (value: Response) => void = () => {};
    const deletePromise = new Promise<Response>((resolve) => {
      resolveDelete = resolve;
    });
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ documents }))
      .mockReturnValueOnce(deletePromise);

    render(
      <SourceDocuments
        refreshKey={0}
        onFilterByDocument={vi.fn()}
        activeDocumentId={null}
      />
    );

    await screen.findByText("resume.pdf");
    fireEvent.click(screen.getByLabelText("Select resume.pdf"));
    fireEvent.click(screen.getByRole("button", { name: "Delete Selected" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Delete Selected" }).at(-1)!);

    fireEvent.click(screen.getByLabelText("Select portfolio.pdf"));
    resolveDelete(
      jsonResponse({ success: true, documentsDeleted: 1, chunksDeleted: 3 })
    );

    await waitFor(() => {
      expect(screen.queryByText("resume.pdf")).not.toBeInTheDocument();
    });
    expect(screen.getByText("portfolio.pdf")).toBeInTheDocument();
  });
});
