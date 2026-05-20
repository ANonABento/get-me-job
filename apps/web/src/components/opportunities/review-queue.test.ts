import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";
import messages from "@/messages/en.json";
import type { Opportunity } from "@/types/opportunity";
import {
  getDescriptionPreview,
  getOpportunityTags,
  getPendingOpportunities,
  OpportunityReviewQueue,
} from "./review-queue";

const baseJob: Opportunity = {
  id: "job-1",
  type: "job",
  title: "Frontend Engineer",
  company: "Acme",
  source: "manual",
  summary: "Build product experiences",
  status: "pending",
  tags: [],
  responsibilities: [],
  createdAt: "2026-04-20T00:00:00.000Z",
  updatedAt: "2026-04-20T00:00:00.000Z",
};

const IntlProvider = NextIntlClientProvider as React.ComponentType<{
  locale: string;
  messages: typeof messages;
  children?: React.ReactNode;
}>;

function renderWithIntl(element: React.ReactElement) {
  return render(
    React.createElement(
      IntlProvider,
      {
        locale: "en-US",
        messages,
      },
      element,
    ),
  );
}

describe("getPendingOpportunities", () => {
  it("returns only pending jobs ordered by nearest deadline then newest", () => {
    const jobs: Opportunity[] = [
      { ...baseJob, id: "saved", status: "saved" },
      {
        ...baseJob,
        id: "later",
        status: "pending",
        deadline: "2026-05-10",
        createdAt: "2026-04-25T00:00:00.000Z",
      },
      {
        ...baseJob,
        id: "sooner",
        status: "pending",
        deadline: "2026-05-01",
        createdAt: "2026-04-21T00:00:00.000Z",
      },
      {
        ...baseJob,
        id: "no-deadline",
        status: "pending",
        createdAt: "2026-04-26T00:00:00.000Z",
      },
    ];

    expect(getPendingOpportunities(jobs).map((job) => job.id)).toEqual([
      "sooner",
      "later",
      "no-deadline",
    ]);
  });

  it("treats invalid deadlines as missing deadlines", () => {
    const jobs: Opportunity[] = [
      {
        ...baseJob,
        id: "invalid",
        status: "pending",
        deadline: "not-a-date",
        createdAt: "2026-04-26T00:00:00.000Z",
      },
      {
        ...baseJob,
        id: "valid",
        status: "pending",
        deadline: "2026-05-01",
        createdAt: "2026-04-20T00:00:00.000Z",
      },
    ];

    expect(getPendingOpportunities(jobs).map((job) => job.id)).toEqual([
      "valid",
      "invalid",
    ]);
  });
});

describe("getOpportunityTags", () => {
  it("deduplicates and limits tags plus required skills", () => {
    expect(
      getOpportunityTags(
        {
          ...baseJob,
          tags: ["React", "TypeScript", "React"],
          requiredSkills: ["Node", "SQL"],
        },
        3,
      ),
    ).toEqual(["React", "TypeScript", "Node"]);
  });
});

describe("getDescriptionPreview", () => {
  it("truncates long descriptions", () => {
    // audit/03 bumped the preview length to 600 for the bento card.
    // Pass a string longer than the new cap to exercise truncation.
    const preview = getDescriptionPreview("a".repeat(700));

    expect(preview).toHaveLength(603);
    expect(preview.endsWith("...")).toBe(true);
  });

  it("returns descriptions under the cap unchanged", () => {
    expect(getDescriptionPreview("short")).toBe("short");
  });
});

describe("OpportunityReviewQueue", () => {
  it("shows the extension CTA first when the queue is empty", () => {
    renderWithIntl(
      React.createElement(OpportunityReviewQueue, {
        jobs: [],
        updating: false,
        onStatusChange: vi.fn(),
        onApplyNow: vi.fn(),
      }),
    );

    const installLink = screen.getByRole("link", {
      name: "Install the browser extension to auto-capture jobs",
    });
    expect(installLink).toHaveAttribute("href", "/extension");
    expect(screen.getByText("Queue cleared")).toBeInTheDocument();
  });

  it("saves and dismisses the active pending opportunity", async () => {
    const onStatusChange = vi.fn().mockResolvedValue(undefined);
    const onApplyNow = vi.fn().mockResolvedValue(undefined);

    renderWithIntl(
      React.createElement(OpportunityReviewQueue, {
        jobs: [{ ...baseJob, status: "pending" }],
        updating: false,
        onStatusChange,
        onApplyNow,
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: /save/i }));
    await waitFor(() => {
      expect(onStatusChange).toHaveBeenCalledWith(
        expect.objectContaining({ id: "job-1" }),
        "saved",
      );
    });

    fireEvent.click(screen.getByRole("button", { name: /dismiss/i }));
    await waitFor(() => {
      expect(onStatusChange).toHaveBeenCalledWith(
        expect.objectContaining({ id: "job-1" }),
        "dismissed",
      );
    });
  });

  it("applies only when the opportunity has a URL", async () => {
    const onStatusChange = vi.fn().mockResolvedValue(undefined);
    const onApplyNow = vi.fn().mockResolvedValue(undefined);

    const { rerender } = renderWithIntl(
      React.createElement(OpportunityReviewQueue, {
        jobs: [{ ...baseJob, status: "pending" }],
        updating: false,
        onStatusChange,
        onApplyNow,
      }),
    );

    expect(screen.getByRole("button", { name: /apply/i })).toBeDisabled();

    rerender(
      React.createElement(
        IntlProvider,
        {
          locale: "en-US",
          messages,
        },
        React.createElement(OpportunityReviewQueue, {
          jobs: [
            {
              ...baseJob,
              status: "pending",
              sourceUrl: "https://example.com/job",
            },
          ],
          updating: false,
          onStatusChange,
          onApplyNow,
        }),
      ),
    );

    fireEvent.click(screen.getByRole("button", { name: /apply/i }));
    await waitFor(() => {
      expect(onApplyNow).toHaveBeenCalledWith(
        expect.objectContaining({ sourceUrl: "https://example.com/job" }),
      );
    });
  });
});
