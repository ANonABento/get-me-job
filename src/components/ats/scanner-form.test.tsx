import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ScannerForm } from "./scanner-form";

describe("ScannerForm", () => {
  it("makes the required resume textarea more prominent than the optional job textarea", () => {
    render(<ScannerForm />);

    const resume = screen.getByLabelText(/Paste your resume text/i);
    const job = screen.getByLabelText(/Paste job description/i);

    expect(resume.className).toContain("min-h-[200px]");
    expect(job.className).toContain("min-h-[96px]");
    expect(job.className).toContain("placeholder:italic");
    expect(job).toHaveAttribute(
      "placeholder",
      expect.stringMatching(/^Optional:/),
    );
  });
});
