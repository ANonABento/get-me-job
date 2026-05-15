import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Dashboard from "./page";
import { BASIC_ONBOARDING_STEPS } from "@/lib/onboarding/steps";
import messages from "@/messages/en.json";

const toastMock = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/use-error-toast", () => ({
  useErrorToast: () => toastMock,
}));

function mockFetch({
  dismissedAt = null,
  firstName = "Kevin",
  documents = [],
  jobsByStatus = {},
  resumesGenerated = 0,
  streakFails = false,
}: {
  dismissedAt?: string | null;
  firstName?: string | null;
  documents?: Array<Record<string, unknown>>;
  jobsByStatus?: Record<string, number>;
  resumesGenerated?: number;
  streakFails?: boolean;
} = {}) {
  let shouldFailStreak = streakFails;

  global.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);

    if (url === "/api/profile") {
      return jsonResponse({ profile: null });
    }

    if (url.startsWith("/api/documents")) {
      return jsonResponse({ documents });
    }

    if (url === "/api/analytics") {
      return jsonResponse({
        overview: { totalResumesGenerated: resumesGenerated },
        jobs: { byStatus: jobsByStatus },
        recent: { jobs: [] },
      });
    }

    if (url === "/api/onboarding/dismiss" && init?.method === "POST") {
      return jsonResponse({
        dismissedAt: "2026-05-09T10:00:00.000Z",
        firstName,
      });
    }

    if (url === "/api/onboarding/state") {
      return jsonResponse({ dismissedAt, firstName });
    }

    if (url === "/api/streak") {
      if (shouldFailStreak) {
        return jsonResponse({ error: "Failed to get streak state" }, 400);
      }

      return jsonResponse({ streak: null });
    }

    throw new Error(`Unexpected fetch: ${url}`);
  }) as typeof fetch;

  return {
    resolveStreak() {
      shouldFailStreak = false;
    },
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

function renderDashboard() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <Dashboard />
    </NextIntlClientProvider>,
  );
}

describe("Dashboard onboarding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders basic onboarding steps from the registry", async () => {
    mockFetch();

    renderDashboard();

    expect(
      await screen.findByRole("heading", {
        level: 2,
        name: /Set up your workspace/i,
      }),
    ).toBeInTheDocument();
    expect(await screen.findByText(/Today, Kevin/)).toBeInTheDocument();
    expect(
      screen.getByText((_content, element) =>
        Boolean(
          element?.textContent ===
          `0of ${BASIC_ONBOARDING_STEPS.length} complete`,
        ),
      ),
    ).toBeInTheDocument();
    for (const step of BASIC_ONBOARDING_STEPS) {
      const stepMessages =
        messages.dashboard.onboarding.steps[
          step.id as keyof typeof messages.dashboard.onboarding.steps
        ];
      expect(screen.getByText(stepMessages.title)).toBeInTheDocument();
    }
    expect(screen.queryByText("Next best move")).not.toBeInTheDocument();
  });

  it("renders the active dashboard when onboarding is dismissed", async () => {
    mockFetch({ dismissedAt: "2026-05-09T10:00:00.000Z" });

    renderDashboard();

    expect(
      await screen.findByRole("heading", { level: 1, name: /Today, Kevin/ }),
    ).toBeInTheDocument();
    // Active state shows the editorial pipeline strip
    expect(await screen.findByText("Pipeline")).toBeInTheDocument();
  });

  it("deep-links pipeline stages to matching opportunity status filters", async () => {
    mockFetch({
      dismissedAt: "2026-05-09T10:00:00.000Z",
      jobsByStatus: {
        saved: 1,
        applied: 2,
        interviewing: 3,
        offered: 4,
      },
    });

    renderDashboard();

    expect(
      await screen.findByRole("link", { name: /Saved\s*1/ }),
    ).toHaveAttribute("href", "/en/opportunities?status=saved");
    expect(screen.getByRole("link", { name: /Applied\s*2/ })).toHaveAttribute(
      "href",
      "/en/opportunities?status=applied",
    );
    expect(
      screen.getByRole("link", { name: /Interviewing\s*3/ }),
    ).toHaveAttribute("href", "/en/opportunities?status=interviewing");
    expect(screen.getByRole("link", { name: /Offered\s*4/ })).toHaveAttribute(
      "href",
      "/en/opportunities?status=offered",
    );
  });

  it("posts skip and moves to active dashboard without reloading", async () => {
    mockFetch();

    renderDashboard();

    fireEvent.click(
      await screen.findByRole("button", { name: "Skip onboarding" }),
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/onboarding/dismiss", {
        method: "POST",
      });
    });
    expect(await screen.findByText("Pipeline")).toBeInTheDocument();
  });

  it("drops the name when onboarding state has no first name", async () => {
    mockFetch({ firstName: null });

    renderDashboard();

    expect(
      await screen.findByRole("heading", { level: 1, name: /^Today$/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { level: 1, name: /Today,/ }),
    ).not.toBeInTheDocument();
  });

  it("renders available dashboard panels when streak fails and retries only that panel", async () => {
    const fetchMock = mockFetch({
      dismissedAt: "2026-05-09T10:00:00.000Z",
      documents: [{ id: "doc-1" }],
      jobsByStatus: { saved: 2 },
      streakFails: true,
    });

    renderDashboard();

    expect(
      await screen.findByRole("heading", { level: 1, name: /Today, Kevin/ }),
    ).toBeInTheDocument();
    expect(await screen.findByText("Pipeline")).toBeInTheDocument();
    expect(screen.getByText("Recent applications")).toBeInTheDocument();
    expect(screen.getByText("Couldn't load this section")).toBeInTheDocument();

    fetchMock.resolveStreak();
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));

    await waitFor(() => {
      expect(
        (global.fetch as ReturnType<typeof vi.fn>).mock.calls.filter(
          ([input]) => String(input) === "/api/streak",
        ),
      ).toHaveLength(2);
    });
  });
});
