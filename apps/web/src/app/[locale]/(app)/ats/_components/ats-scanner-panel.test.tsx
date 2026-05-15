import { render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
} from "vitest";
import { ToastProvider } from "@/components/ui/toast";
import enMessages from "@/messages/en.json";
import { AtsScannerPanel } from "./ats-scanner-panel";

function renderPanel() {
  return render(
    <NextIntlClientProvider locale="en" messages={enMessages}>
      <ToastProvider>
        <AtsScannerPanel locale="en" />
      </ToastProvider>
    </NextIntlClientProvider>,
  );
}

function jsonResponse(body: unknown, init: { status?: number } = {}) {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { "content-type": "application/json" },
  });
}

describe("AtsScannerPanel", () => {
  beforeEach(() => {
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("renders the scanner panel + history panel + opportunity picker fallback", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.startsWith("/api/opportunities")) {
        return jsonResponse({ opportunities: [] });
      }
      if (url.startsWith("/api/ats/scans")) {
        return jsonResponse({ history: [] });
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);

    renderPanel();

    expect(
      screen.getByRole("heading", { name: /Scan a resume/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Scan history/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Score against an existing opportunity/i),
    ).toBeInTheDocument();

    // After the opportunities + history fetches resolve, we see the empty
    // states for both.
    await waitFor(() => {
      expect(
        screen.getByText(/You have no saved opportunities yet/i),
      ).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText(/No scans yet/i)).toBeInTheDocument();
    });
  });

  it("renders saved scans with score and label", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.startsWith("/api/opportunities")) {
        return jsonResponse({ opportunities: [] });
      }
      if (url.startsWith("/api/ats/scans")) {
        return jsonResponse({
          history: [
            {
              id: "scan-1",
              userId: "default",
              jobId: null,
              overallScore: 78,
              letterGrade: "B",
              formattingScore: 80,
              structureScore: 70,
              contentScore: 85,
              keywordsScore: 60,
              issueCount: 3,
              fixCount: 2,
              scannedAt: "2026-05-14T12:00:00.000Z",
              report: {
                label: "Senior Engineer @ Acme",
              },
            },
          ],
        });
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);

    renderPanel();

    await waitFor(() => {
      expect(screen.getByText(/Senior Engineer @ Acme/i)).toBeInTheDocument();
    });
    expect(screen.getByText("78")).toBeInTheDocument();
    expect(screen.getByText(/3 issues/i)).toBeInTheDocument();
  });

  it("shows the opportunity dropdown when opportunities are available", async () => {
    const fetchMock: Mock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.startsWith("/api/opportunities")) {
        return jsonResponse({
          opportunities: [
            {
              id: "opp-1",
              title: "Frontend Engineer",
              company: "Northstar Labs",
              summary: "Build the platform.",
              responsibilities: ["Ship features"],
              requiredSkills: ["TypeScript"],
            },
          ],
        });
      }
      if (url.startsWith("/api/ats/scans")) {
        return jsonResponse({ history: [] });
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);

    renderPanel();

    await waitFor(() => {
      expect(
        screen.getByRole("combobox", {
          name: /Score against an existing opportunity/i,
        }),
      ).toBeInTheDocument();
    });
  });
});
