import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import OpportunityDetailPage from "./page";
import type { JobDescription } from "@/types";

const mockShowErrorToast = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/use-error-toast", () => ({
  useErrorToast: () => mockShowErrorToast,
}));

const baseOpportunity: JobDescription = {
  id: "job-1",
  title: "Frontend Engineer",
  company: "Acme",
  location: "Remote",
  type: "full-time",
  remote: true,
  salary: "$120k",
  description: "Build product UI",
  requirements: ["React"],
  responsibilities: ["Ship features"],
  keywords: ["frontend"],
  url: "https://example.com/job",
  status: "saved",
  deadline: "2026-05-10",
  notes: "Initial note",
  createdAt: "2026-04-29T12:00:00.000Z",
};

function mockOpportunityFetch(initialJob: JobDescription = baseOpportunity) {
  let currentJob = { ...initialJob };
  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    if (url === "/api/jobs/job-1" && init?.method === "PATCH") {
      const patch =
        typeof init.body === "string"
          ? (JSON.parse(init.body) as Partial<JobDescription>)
          : {};
      currentJob = { ...currentJob, ...patch };
      return new Response(JSON.stringify({ job: currentJob }), { status: 200 });
    }

    if (url === "/api/jobs/job-1") {
      return new Response(JSON.stringify({ job: currentJob }), { status: 200 });
    }

    if (url === "/api/jobs/job-1/resumes") {
      return new Response(
        JSON.stringify({
          resumes: [
            {
              id: "resume-1",
              htmlPath: "/generated/resume.html",
              matchScore: 87,
              createdAt: "2026-04-29T13:00:00.000Z",
            },
          ],
        }),
        { status: 200 }
      );
    }

    if (url === "/api/jobs/job-1/cover-letter/history") {
      return new Response(
        JSON.stringify({
          versions: [
            {
              id: "letter-1",
              version: 2,
              createdAt: "2026-04-29T14:00:00.000Z",
            },
          ],
        }),
        { status: 200 }
      );
    }

    return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
  });

  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("OpportunityDetailPage", () => {
  beforeEach(() => {
    mockShowErrorToast.mockClear();
    vi.restoreAllMocks();
    vi.stubGlobal("open", vi.fn());
  });

  it("renders opportunity details, actions, linked documents, and notes", async () => {
    mockOpportunityFetch();

    render(<OpportunityDetailPage params={{ id: "job-1" }} />);

    expect(await screen.findByRole("heading", { name: "Frontend Engineer" })).toBeInTheDocument();
    expect(screen.getByText("Acme · Remote")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Tailor Resume/i })).toHaveAttribute(
      "href",
      "/studio?mode=resume&opportunityId=job-1"
    );
    expect(
      screen.getByRole("link", { name: /Generate Cover Letter/i })
    ).toHaveAttribute("href", "/studio?mode=cover-letter&opportunityId=job-1");
    expect(screen.getByText("Resume · 87% match")).toBeInTheDocument();
    expect(screen.getByText("Version 2")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Initial note")).toBeInTheDocument();
  });

  it("saves an inline field edit through the job API", async () => {
    const fetchMock = mockOpportunityFetch();

    render(<OpportunityDetailPage params={{ id: "job-1" }} />);

    await screen.findByRole("heading", { name: "Frontend Engineer" });
    fireEvent.click(screen.getByRole("button", { name: "Edit Company" }));
    fireEvent.change(screen.getByDisplayValue("Acme"), {
      target: { value: "Globex" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(
        fetchMock.mock.calls.some(
          ([url, init]) =>
            url === "/api/jobs/job-1" &&
            init?.method === "PATCH" &&
            init.body === JSON.stringify({ company: "Globex" })
        )
      ).toBe(true)
    );
    expect(await screen.findByText("Globex · Remote")).toBeInTheDocument();
  });

  it("marks the opportunity applied and opens the source URL", async () => {
    const fetchMock = mockOpportunityFetch();
    const openMock = vi.mocked(window.open);

    render(<OpportunityDetailPage params={{ id: "job-1" }} />);

    await screen.findByRole("heading", { name: "Frontend Engineer" });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    await waitFor(() =>
      expect(
        fetchMock.mock.calls.some(
          ([url, init]) =>
            url === "/api/jobs/job-1" &&
            init?.method === "PATCH" &&
            typeof init.body === "string" &&
            JSON.parse(init.body).status === "applied"
        )
      ).toBe(true)
    );
    expect(openMock).toHaveBeenCalledWith(
      "https://example.com/job",
      "_blank",
      "noopener,noreferrer"
    );
  });
});
