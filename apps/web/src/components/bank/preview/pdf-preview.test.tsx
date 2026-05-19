import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PdfPreview } from "./pdf-preview";

describe("PdfPreview", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise<Response>(() => {})),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows parser-v2 source text in the PDF preview source tab", () => {
    render(
      <PdfPreview
        documentId="doc-1"
        filename="resume.pdf"
        highlights={[]}
        selectedEntryId={null}
        onSelectEntry={vi.fn()}
        sourceText="Jake Ryan\nEngineer at Acme"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Source" }));

    expect(screen.getByText(/Jake Ryan/)).toBeInTheDocument();
    expect(screen.getByText(/Engineer at Acme/)).toBeInTheDocument();
  });

  it("shows parser-v2 diagnostic counts in the diagnostics tab", () => {
    render(
      <PdfPreview
        documentId="doc-1"
        filename="resume.pdf"
        highlights={[]}
        selectedEntryId={null}
        onSelectEntry={vi.fn()}
        diagnostic={{
          lineCount: 12,
          parsedRoots: {
            education: 1,
            experiences: 2,
            projects: 1,
            skills: 3,
          },
          missingRootSourceSpans: ["exp-1"],
          missingBulletSourceSpans: [],
          partialRootSourceSpans: [],
          partialBulletSourceSpans: ["project-1:0"],
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Diagnostics" }));

    expect(screen.getByText("Source lines")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("Parsed roots")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("Missing spans")).toBeInTheDocument();
    expect(screen.getByText("Partial spans")).toBeInTheDocument();
  });
});
