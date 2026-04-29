import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { JobDescription } from "@/types";
import {
  getDescriptionPreview,
  getOpportunityTags,
  getPendingOpportunities,
  OpportunityReviewQueue,
} from "./review-queue";

const baseJob: JobDescription = {
  id: "job-1",
  title: "Frontend Engineer",
  company: "Acme",
  description: "Build product experiences",
  requirements: [],
  responsibilities: [],
  keywords: [],
  createdAt: "2026-04-20T00:00:00.000Z",
};

describe("getPendingOpportunities", () => {
  it("returns only pending jobs ordered by nearest deadline then newest", () => {
    const jobs: JobDescription[] = [
      { ...baseJob, id: "saved", status: "saved" },
      { ...baseJob, id: "later", status: "pending", deadline: "2026-05-10", createdAt: "2026-04-25T00:00:00.000Z" },
      { ...baseJob, id: "sooner", status: "pending", deadline: "2026-05-01", createdAt: "2026-04-21T00:00:00.000Z" },
      { ...baseJob, id: "no-deadline", status: "pending", createdAt: "2026-04-26T00:00:00.000Z" },
    ];

    expect(getPendingOpportunities(jobs).map((job) => job.id)).toEqual([
      "sooner",
      "later",
      "no-deadline",
    ]);
  });

  it("treats invalid deadlines as missing deadlines", () => {
    const jobs: JobDescription[] = [
      { ...baseJob, id: "invalid", status: "pending", deadline: "not-a-date", createdAt: "2026-04-26T00:00:00.000Z" },
      { ...baseJob, id: "valid", status: "pending", deadline: "2026-05-01", createdAt: "2026-04-20T00:00:00.000Z" },
    ];

    expect(getPendingOpportunities(jobs).map((job) => job.id)).toEqual([
      "valid",
      "invalid",
    ]);
  });
});

describe("getOpportunityTags", () => {
  it("deduplicates and limits keywords plus requirements", () => {
    expect(
      getOpportunityTags(
        {
          ...baseJob,
          keywords: ["React", "TypeScript", "React"],
          requirements: ["Node", " ", "SQL"],
        },
        3
      )
    ).toEqual(["React", "TypeScript", "Node"]);
  });
});

describe("getDescriptionPreview", () => {
  it("truncates long descriptions", () => {
    const preview = getDescriptionPreview("a".repeat(300));

    expect(preview).toHaveLength(263);
    expect(preview.endsWith("...")).toBe(true);
  });
});

describe("OpportunityReviewQueue", () => {
  it("saves and dismisses the active pending opportunity", async () => {
    const onStatusChange = vi.fn().mockResolvedValue(undefined);
    const onApplyNow = vi.fn().mockResolvedValue(undefined);

    render(
      React.createElement(OpportunityReviewQueue, {
        jobs: [{ ...baseJob, status: "pending" }],
        updating: false,
        onStatusChange,
        onApplyNow,
      })
    );

    fireEvent.click(screen.getByRole("button", { name: /save/i }));
    await waitFor(() => {
      expect(onStatusChange).toHaveBeenCalledWith(
        expect.objectContaining({ id: "job-1" }),
        "saved"
      );
    });

    fireEvent.click(screen.getByRole("button", { name: /dismiss/i }));
    await waitFor(() => {
      expect(onStatusChange).toHaveBeenCalledWith(
        expect.objectContaining({ id: "job-1" }),
        "dismissed"
      );
    });
  });

  it("applies only when the opportunity has a URL", async () => {
    const onStatusChange = vi.fn().mockResolvedValue(undefined);
    const onApplyNow = vi.fn().mockResolvedValue(undefined);

    const { rerender } = render(
      React.createElement(OpportunityReviewQueue, {
        jobs: [{ ...baseJob, status: "pending" }],
        updating: false,
        onStatusChange,
        onApplyNow,
      })
    );

    expect(screen.getByRole("button", { name: /apply/i })).toBeDisabled();

    rerender(
      React.createElement(OpportunityReviewQueue, {
        jobs: [{ ...baseJob, status: "pending", url: "https://example.com/job" }],
        updating: false,
        onStatusChange,
        onApplyNow,
      })
    );

    fireEvent.click(screen.getByRole("button", { name: /apply/i }));
    await waitFor(() => {
      expect(onApplyNow).toHaveBeenCalledWith(
        expect.objectContaining({ url: "https://example.com/job" })
      );
    });
  });
});
