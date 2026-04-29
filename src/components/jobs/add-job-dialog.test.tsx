import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { ComponentProps } from "react";
import { ToastProvider } from "@/components/ui/toast";
import { AddJobDialog } from "./add-job-dialog";

function renderDialog(props?: Partial<ComponentProps<typeof AddJobDialog>>) {
  return render(
    <ToastProvider>
      <AddJobDialog
        open
        onOpenChange={vi.fn()}
        onCreated={vi.fn()}
        {...props}
      />
    </ToastProvider>
  );
}

function fillRequiredFields() {
  fireEvent.change(screen.getByPlaceholderText("Software Engineer"), {
    target: { value: "Frontend Engineer" },
  });
  fireEvent.change(screen.getByPlaceholderText("Acme Corp"), {
    target: { value: "Acme" },
  });
  fireEvent.change(screen.getByPlaceholderText("Paste the full job description here..."), {
    target: { value: "Build user interfaces." },
  });
}

describe("AddJobDialog", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows an error toast and leaves the dialog open when creation fails", async () => {
    const onOpenChange = vi.fn();
    const onCreated = vi.fn();
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Job could not be saved" }),
    } as Response);

    renderDialog({ onOpenChange, onCreated });
    fillRequiredFields();
    fireEvent.click(screen.getByRole("button", { name: "Add Job" }));

    await waitFor(() => {
      expect(screen.getByText("Could not add job")).toBeInTheDocument();
    });
    expect(screen.getByText("Job could not be saved")).toBeInTheDocument();
    expect(screen.getByText("Add New Job")).toBeInTheDocument();
    expect(onCreated).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it.skip("scrapes a pasted URL and fills the create form", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        opportunity: {
          title: "Backend Engineer",
          company: "Beta",
          description: "Build APIs with TypeScript.",
          url: "https://jobs.lever.co/beta/123",
          source: "lever",
        },
      }),
    } as Response);

    renderDialog();

    fireEvent.change(screen.getByPlaceholderText("https://..."), {
      target: { value: "https://jobs.lever.co/beta/123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Scrape" }));

    await waitFor(() => {
      expect(screen.getByDisplayValue("Backend Engineer")).toBeInTheDocument();
    });
    expect(screen.getByDisplayValue("Beta")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Build APIs with TypeScript.")).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith("/api/opportunities/scrape", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ url: "https://jobs.lever.co/beta/123" }),
    }));
  });
});
