import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ComparisonView, VersionTimeline } from "./comparison-view";
import type { ResumeComparison, VersionInfo } from "@/lib/resume/compare";

const mockComparisonData = {
  comparison: {
    summary: {
      totalChanges: 5,
      additions: 2,
      removals: 1,
      modifications: 2,
    },
    diffs: [
      {
        type: "added" as const,
        path: "skills[2]",
        label: "Skill #3",
        newValue: "GraphQL",
      },
      {
        type: "removed" as const,
        path: "skills[1]",
        label: "Skill #2",
        oldValue: "Angular",
      },
      {
        type: "changed" as const,
        path: "summary",
        label: "Summary",
        oldValue: "Old summary text",
        newValue: "New summary text",
      },
    ],
    matchScoreChange: {
      before: 70,
      after: 85,
      change: 15,
    },
  } as ResumeComparison,
  before: {
    id: "resume-1",
    createdAt: "2024-01-01T00:00:00Z",
    matchScore: 70,
    content: {
      contact: { name: "John Doe", email: "john@example.com" },
      summary: "Old summary text",
      skills: ["React", "Angular"],
      experiences: [],
      education: [],
    },
  },
  after: {
    id: "resume-2",
    createdAt: "2024-01-15T00:00:00Z",
    matchScore: 85,
    content: {
      contact: { name: "John Doe", email: "john@example.com" },
      summary: "New summary text",
      skills: ["React", "GraphQL"],
      experiences: [],
      education: [],
    },
  },
};

describe("ComparisonView", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("shows loading state initially", () => {
    global.fetch = vi.fn(
      () => new Promise(() => {})
    ) as unknown as typeof fetch;

    render(<ComparisonView beforeId="resume-1" afterId="resume-2" />);

    expect(screen.getByText("Comparing resumes...")).toBeInTheDocument();
  });

  it("displays comparison data after loading", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockComparisonData),
      } as Response)
    );

    render(<ComparisonView beforeId="resume-1" afterId="resume-2" />);

    await waitFor(() => {
      expect(screen.getByText("Resume Comparison")).toBeInTheDocument();
    });
  });

  it("shows error message on API failure", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: "Failed to compare" }),
      } as Response)
    );

    render(<ComparisonView beforeId="resume-1" afterId="resume-2" />);

    await waitFor(() => {
      expect(screen.getByText("Failed to compare")).toBeInTheDocument();
    });
  });

  it("displays summary statistics", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockComparisonData),
      } as Response)
    );

    render(<ComparisonView beforeId="resume-1" afterId="resume-2" />);

    await waitFor(() => {
      expect(screen.getByText("Additions")).toBeInTheDocument();
      expect(screen.getByText("Removals")).toBeInTheDocument();
      expect(screen.getByText("Changes")).toBeInTheDocument();
    });

    // Check that summary stats section is present with the expected values
    const additionsSection = screen.getByText("Additions").closest(".text-center");
    const removalsSection = screen.getByText("Removals").closest(".text-center");
    expect(additionsSection).toHaveTextContent("2");
    expect(removalsSection).toHaveTextContent("1");
  });

  it("shows match score change when available", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockComparisonData),
      } as Response)
    );

    render(<ComparisonView beforeId="resume-1" afterId="resume-2" />);

    await waitFor(() => {
      expect(screen.getByText("Match Score Change")).toBeInTheDocument();
      expect(screen.getByText("70%")).toBeInTheDocument();
      expect(screen.getByText("85%")).toBeInTheDocument();
      expect(screen.getByText("+15%")).toBeInTheDocument();
    });
  });

  it("displays diff items", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockComparisonData),
      } as Response)
    );

    render(<ComparisonView beforeId="resume-1" afterId="resume-2" />);

    await waitFor(() => {
      expect(screen.getByText("Skill #3")).toBeInTheDocument();
      expect(screen.getByText("Summary")).toBeInTheDocument();
    });
  });

  it("expands diff item to show details", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockComparisonData),
      } as Response)
    );

    render(<ComparisonView beforeId="resume-1" afterId="resume-2" />);

    await waitFor(() => {
      expect(screen.getByText("Summary")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Summary"));

    await waitFor(() => {
      expect(screen.getByText("Old summary text")).toBeInTheDocument();
      expect(screen.getByText("New summary text")).toBeInTheDocument();
    });
  });

  it("calls onClose when close button is clicked", async () => {
    const onClose = vi.fn();
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockComparisonData),
      } as Response)
    );

    render(
      <ComparisonView beforeId="resume-1" afterId="resume-2" onClose={onClose} />
    );

    await waitFor(() => {
      expect(screen.getByText("Close")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Close"));

    expect(onClose).toHaveBeenCalled();
  });

  it("shows message when no differences found", async () => {
    const noDiffsData = {
      ...mockComparisonData,
      comparison: {
        ...mockComparisonData.comparison,
        diffs: [],
        summary: {
          totalChanges: 0,
          additions: 0,
          removals: 0,
          modifications: 0,
        },
      },
    };

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(noDiffsData),
      } as Response)
    );

    render(<ComparisonView beforeId="resume-1" afterId="resume-2" />);

    await waitFor(() => {
      expect(
        screen.getByText("No differences found between these versions.")
      ).toBeInTheDocument();
    });
  });
});

describe("VersionTimeline", () => {
  const mockVersions: VersionInfo[] = [
    {
      id: "v1",
      createdAt: "2024-01-01T00:00:00Z",
      matchScore: 70,
      jobTitle: "Software Engineer",
      jobCompany: "Tech Corp",
    },
    {
      id: "v2",
      createdAt: "2024-01-15T00:00:00Z",
      matchScore: 85,
      jobTitle: "Senior Engineer",
      jobCompany: "Big Tech",
    },
  ];

  it("renders version list", () => {
    render(
      <VersionTimeline
        versions={mockVersions}
        selectedVersions={[null, null]}
        onSelectVersion={vi.fn()}
      />
    );

    expect(screen.getByText("Software Engineer at Tech Corp")).toBeInTheDocument();
    expect(screen.getByText("Senior Engineer at Big Tech")).toBeInTheDocument();
  });

  it("shows empty state when no versions", () => {
    render(
      <VersionTimeline
        versions={[]}
        selectedVersions={[null, null]}
        onSelectVersion={vi.fn()}
      />
    );

    expect(screen.getByText("No resume versions available")).toBeInTheDocument();
  });

  it("calls onSelectVersion when Before button is clicked", () => {
    const onSelectVersion = vi.fn();
    render(
      <VersionTimeline
        versions={mockVersions}
        selectedVersions={[null, null]}
        onSelectVersion={onSelectVersion}
      />
    );

    const beforeButtons = screen.getAllByText("Before");
    fireEvent.click(beforeButtons[0]);

    expect(onSelectVersion).toHaveBeenCalledWith("v1", "before");
  });

  it("calls onSelectVersion when After button is clicked", () => {
    const onSelectVersion = vi.fn();
    render(
      <VersionTimeline
        versions={mockVersions}
        selectedVersions={[null, null]}
        onSelectVersion={onSelectVersion}
      />
    );

    const afterButtons = screen.getAllByText("After");
    fireEvent.click(afterButtons[1]);

    expect(onSelectVersion).toHaveBeenCalledWith("v2", "after");
  });

  it("highlights selected versions", () => {
    render(
      <VersionTimeline
        versions={mockVersions}
        selectedVersions={["v1", "v2"]}
        onSelectVersion={vi.fn()}
      />
    );

    const containers = screen.getAllByText("Before").map((el) => el.closest(".rounded-lg"));
    expect(containers[0]).toHaveClass("border-primary");
    expect(containers[1]).toHaveClass("border-primary");
  });

  it("shows match scores", () => {
    render(
      <VersionTimeline
        versions={mockVersions}
        selectedVersions={[null, null]}
        onSelectVersion={vi.fn()}
      />
    );

    expect(screen.getByText(/70% match/)).toBeInTheDocument();
    expect(screen.getByText(/85% match/)).toBeInTheDocument();
  });
});
