import { render, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ResumePreview } from "./resume-preview";
import type { TailoredResume } from "@/lib/resume/generator";

const resume: TailoredResume = {
  contact: { name: "Jane Doe" },
  summary: "",
  experiences: [],
  skills: [],
  education: [],
};

describe("ResumePreview", () => {
  it("keeps fit scaling positive when the panel has no measured width", async () => {
    const { container } = render(
      <ResumePreview
        resume={resume}
        templateId="classic"
        html="<p>Resume body</p>"
      />
    );

    const outer = container.firstElementChild as HTMLElement;
    const pageWrapper = outer.firstElementChild as HTMLElement;

    await waitFor(() => {
      expect(pageWrapper).toHaveStyle({ width: "1px" });
    });
  });
});
