import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ExportMenu, resumeToPlainText, EXPORT_OPTIONS } from "./export-menu";
import type { TailoredResume } from "@/lib/resume/generator";

const mockResume: TailoredResume = {
  contact: {
    name: "Jane Doe",
    email: "jane@example.com",
    phone: "555-1234",
    location: "New York, NY",
  },
  summary: "Experienced software engineer with 5 years of experience.",
  experiences: [
    {
      company: "Acme Corp",
      title: "Senior Engineer",
      dates: "2020-2024",
      highlights: ["Led team of 5", "Shipped v2.0"],
    },
  ],
  skills: ["TypeScript", "React", "Node.js"],
  education: [
    {
      institution: "MIT",
      degree: "BS",
      field: "Computer Science",
      date: "2020",
    },
  ],
};

describe("resumeToPlainText", () => {
  it("should include contact info", () => {
    const text = resumeToPlainText(mockResume);
    expect(text).toContain("Jane Doe");
    expect(text).toContain("jane@example.com");
    expect(text).toContain("555-1234");
    expect(text).toContain("New York, NY");
  });

  it("should include summary", () => {
    const text = resumeToPlainText(mockResume);
    expect(text).toContain("SUMMARY");
    expect(text).toContain("Experienced software engineer");
  });

  it("should include experience with highlights", () => {
    const text = resumeToPlainText(mockResume);
    expect(text).toContain("EXPERIENCE");
    expect(text).toContain("Senior Engineer at Acme Corp");
    expect(text).toContain("Led team of 5");
    expect(text).toContain("Shipped v2.0");
  });

  it("should include skills", () => {
    const text = resumeToPlainText(mockResume);
    expect(text).toContain("SKILLS");
    expect(text).toContain("TypeScript, React, Node.js");
  });

  it("should include education", () => {
    const text = resumeToPlainText(mockResume);
    expect(text).toContain("EDUCATION");
    expect(text).toContain("BS in Computer Science, MIT");
  });

  it("should handle empty sections", () => {
    const minimal: TailoredResume = {
      contact: { name: "Test", email: "", phone: "", location: "" },
      summary: "",
      experiences: [],
      skills: [],
      education: [],
    };
    const text = resumeToPlainText(minimal);
    expect(text).toContain("Test");
    expect(text).not.toContain("SUMMARY");
    expect(text).not.toContain("EXPERIENCE");
    expect(text).not.toContain("SKILLS");
    expect(text).not.toContain("EDUCATION");
  });
});

describe("EXPORT_OPTIONS", () => {
  it("should have 4 export options", () => {
    expect(EXPORT_OPTIONS).toHaveLength(4);
  });

  it("should include pdf, latex, html, and clipboard", () => {
    const formats = EXPORT_OPTIONS.map((o) => o.format);
    expect(formats).toEqual(["pdf", "latex", "html", "clipboard"]);
  });
});

describe("ExportMenu", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should render the export button", () => {
    render(
      <ExportMenu
        resumeId="test-id"
        resume={mockResume}
        templateId="classic"
      />
    );
    expect(screen.getByRole("button", { name: /export/i })).toBeInTheDocument();
  });

  it("should open dropdown menu on click", () => {
    render(
      <ExportMenu
        resumeId="test-id"
        resume={mockResume}
        templateId="classic"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /export/i }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /pdf/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /latex/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /html/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /clipboard/i })).toBeInTheDocument();
  });

  it("should close dropdown when clicking again", () => {
    render(
      <ExportMenu
        resumeId="test-id"
        resume={mockResume}
        templateId="classic"
      />
    );

    const btn = screen.getByRole("button", { name: /export/i });
    fireEvent.click(btn);
    expect(screen.getByRole("menu")).toBeInTheDocument();

    fireEvent.click(btn);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("should copy to clipboard and show feedback", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText },
    });

    render(
      <ExportMenu
        resumeId="test-id"
        resume={mockResume}
        templateId="classic"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /export/i }));
    fireEvent.click(screen.getByRole("menuitem", { name: /clipboard/i }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledTimes(1);
    });

    const clipboardArg = writeText.mock.calls[0][0];
    expect(clipboardArg).toContain("Jane Doe");
    expect(clipboardArg).toContain("Senior Engineer");

    // Should show "Copied!" feedback
    expect(screen.getByRole("button", { name: /copied/i })).toBeInTheDocument();
  });

  it("should call export API for PDF download", async () => {
    const mockBlob = new Blob(["pdf content"], { type: "application/pdf" });
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
    });

    const createObjectURL = vi.fn().mockReturnValue("blob:test-url");
    const revokeObjectURL = vi.fn();
    global.URL.createObjectURL = createObjectURL;
    global.URL.revokeObjectURL = revokeObjectURL;

    render(
      <ExportMenu
        resumeId="test-id"
        resume={mockResume}
        templateId="classic"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /export/i }));
    fireEvent.click(screen.getByRole("menuitem", { name: /pdf/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/resume/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: "test-id",
          templateId: "classic",
          format: "pdf",
        }),
      });
    });
  });

  it("should call export API for LaTeX download", async () => {
    const mockBlob = new Blob(["latex content"], { type: "application/x-tex" });
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
    });

    global.URL.createObjectURL = vi.fn().mockReturnValue("blob:test-url");
    global.URL.revokeObjectURL = vi.fn();

    render(
      <ExportMenu
        resumeId="test-id"
        resume={mockResume}
        templateId="modern"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /export/i }));
    fireEvent.click(screen.getByRole("menuitem", { name: /latex/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/resume/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: "test-id",
          templateId: "modern",
          format: "latex",
        }),
      });
    });
  });

  it("should show error when export fails", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: "Server error" }),
    });

    render(
      <ExportMenu
        resumeId="test-id"
        resume={mockResume}
        templateId="classic"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /export/i }));
    fireEvent.click(screen.getByRole("menuitem", { name: /pdf/i }));

    await waitFor(() => {
      expect(screen.getByText("Server error")).toBeInTheDocument();
    });
  });
});
