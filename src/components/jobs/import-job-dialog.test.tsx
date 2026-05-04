import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ImportJobDialog } from "./import-job-dialog";

const preview = {
  title: "Senior Engineer",
  company: "Acme Corp",
  location: "Remote",
  type: "full-time",
  remote: true,
  salary: "$120k",
  description: "Build useful products.",
  fullDescription: "Build useful products with TypeScript.",
  requirements: ["TypeScript", "React"],
  keywords: ["typescript", "react"],
  url: "https://example.com/job",
  source: "text",
};

function renderDialog(overrides = {}) {
  const props = {
    open: true,
    onOpenChange: vi.fn(),
    onJobImported: vi.fn(),
    ...overrides,
  };

  const renderResult = render(<ImportJobDialog {...props} />);
  return { ...props, ...renderResult };
}

describe("ImportJobDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("switches import modes", () => {
    renderDialog();

    expect(screen.getByText("Job Content")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /url/i }));
    expect(screen.getByText("Job Posting URL")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /csv/i }));
    expect(screen.getByText("Upload CSV File")).toBeInTheDocument();
  });

  it("validates URL mode before fetching", () => {
    renderDialog();

    fireEvent.click(screen.getByRole("button", { name: /url/i }));
    fireEvent.change(screen.getByPlaceholderText(/linkedin.com\/jobs/i), {
      target: { value: "not a url" },
    });
    fireEvent.click(screen.getByRole("button", { name: /fetch job/i }));

    expect(screen.getByText("Please enter a valid URL")).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("parses pasted text, saves the preview, and closes", async () => {
    const onOpenChange = vi.fn();
    const onJobImported = vi.fn();
    const fetchMock = vi.mocked(global.fetch);
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ preview }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

    renderDialog({ onOpenChange, onJobImported });

    fireEvent.change(screen.getByPlaceholderText(/paste the full job posting here/i), {
      target: { value: "Senior Engineer\nAcme Corp\nBuild useful products." },
    });
    fireEvent.click(screen.getByRole("button", { name: /parse job/i }));

    expect(await screen.findByText("Review Import")).toBeInTheDocument();
    expect(screen.getByText("Senior Engineer")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /import job/i }));

    await waitFor(() => expect(onJobImported).toHaveBeenCalledTimes(1));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/import/job",
      expect.objectContaining({ method: "POST" })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/import/job",
      expect.objectContaining({ method: "PUT" })
    );
  });

  it("reads a CSV file and shows the parsed CSV preview", async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        preview: {
          total: 1,
          valid: 1,
          invalid: 0,
          jobs: [
            {
              title: "Designer",
              company: "Acme Corp",
              location: "Remote",
              type: "contract",
              remote: true,
              salary: "",
              description: "Design product flows.",
              url: "",
              isValid: true,
              errors: [],
            },
          ],
          errors: [],
        },
      }),
    } as Response);

    renderDialog();

    fireEvent.click(screen.getByRole("button", { name: /csv/i }));
    const input = document.querySelector<HTMLInputElement>("input[type='file']");
    expect(input).not.toBeNull();

    const file = new File(["title,company\nDesigner,Acme Corp"], "jobs.csv", {
      type: "text/csv",
    });
    fireEvent.change(input!, { target: { files: [file] } });

    const parseButton = screen.getByRole("button", { name: /parse csv/i });
    await waitFor(() => expect(parseButton).not.toBeDisabled());
    fireEvent.click(parseButton);

    expect(await screen.findByText("Review CSV Import")).toBeInTheDocument();
    expect(screen.getByText("Designer")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /import 1 job/i })).toBeInTheDocument();
  });
});
