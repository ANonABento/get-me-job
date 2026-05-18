import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NotificationCenter } from "./notification-center";
import type { Notification } from "@/lib/db/notifications";

const routerPush = vi.fn();
const showErrorToast = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPush }),
  usePathname: () => "/dashboard",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/hooks/use-error-toast", () => ({
  useErrorToast: () => showErrorToast,
}));

const baseNotification: Notification = {
  id: "notification-1",
  type: "info",
  title: "3 new opportunities waiting for review",
  message: "3 pending opportunities are ready to review.",
  link: "/opportunities/review",
  read: false,
  createdAt: "2026-05-18T10:00:00.000Z",
};

function jsonResponse(body: unknown, init?: ResponseInit) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status: init?.status ?? 200,
      headers: { "content-type": "application/json" },
    }),
  );
}

function mockNotificationsResponse(
  notifications: Notification[],
  unreadCount: number,
) {
  const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);

    if (url.includes("countOnly=true")) {
      return jsonResponse({ count: unreadCount });
    }

    if (init?.method === "PATCH") {
      return jsonResponse({ success: true });
    }

    if (init?.method === "DELETE") {
      return jsonResponse({ success: true });
    }

    if (init?.method === "POST") {
      return jsonResponse({ success: true });
    }

    return jsonResponse({ notifications, unreadCount });
  });

  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((nextResolve) => {
    resolve = nextResolve;
  });

  return { promise, resolve };
}

async function openPanel() {
  fireEvent.click(await screen.findByRole("button", { name: /Notifications/ }));
  return screen.findByRole("dialog", { name: "Notifications" });
}

describe("NotificationCenter", () => {
  beforeEach(() => {
    routerPush.mockReset();
    showErrorToast.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows capped unread count on the AppBar trigger", async () => {
    mockNotificationsResponse([{ ...baseNotification }], 120);

    render(<NotificationCenter variant="appbar" />);

    expect(await screen.findByText("99+")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Notifications (120 unread)" }),
    ).toBeInTheDocument();
  });

  it("opens to the action-inbox empty state", async () => {
    mockNotificationsResponse([], 0);

    render(<NotificationCenter variant="appbar" />);
    const panel = await openPanel();

    expect(panel).toHaveClass("w-[min(calc(100vw_-_2rem),420px)]");
    expect(screen.getByText("No action needed").parentElement).toHaveClass(
      "min-h-[188px]",
    );
    expect(screen.getByText("No action needed")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Deadlines, imports, and status suggestions will appear here.",
      ),
    ).toBeInTheDocument();
  });

  it("keeps the body reserved while the empty-state fetch resolves", async () => {
    const request = deferred<Response>();
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("countOnly=true")) {
        return jsonResponse({ count: 0 });
      }
      return request.promise;
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<NotificationCenter variant="appbar" />);
    const panel = await openPanel();

    const loadingBody = screen.getByLabelText("Loading notifications");
    expect(panel).toBeInTheDocument();
    expect(loadingBody).toHaveClass("min-h-[188px]");

    await act(async () => {
      request.resolve(
        new Response(JSON.stringify({ notifications: [], unreadCount: 0 }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );
    });

    await waitFor(() =>
      expect(screen.getByText("No action needed")).toBeInTheDocument(),
    );
    expect(screen.getByText("No action needed").parentElement).toHaveClass(
      "min-h-[188px]",
    );
  });

  it("groups pending imports under Needs review with a review queue action", async () => {
    mockNotificationsResponse([{ ...baseNotification }], 1);

    render(<NotificationCenter variant="appbar" />);
    await openPanel();

    expect(screen.getByText("Needs review")).toBeInTheDocument();
    expect(
      screen.getByText("3 new opportunities waiting for review"),
    ).toBeInTheDocument();
    expect(screen.getByText("Review queue")).toBeInTheDocument();
  });

  it("renders suggested status accept and dismiss actions", async () => {
    const suggestion: Notification = {
      ...baseNotification,
      id: "suggestion-1",
      type: "application_update",
      title: "Review Gmail status suggestion",
      message: "Ashby Senior Designer may be ready to move to interviewing.",
      link: "/opportunities?id=opp-1",
      suggestedStatusUpdate: {
        state: "pending",
        opportunityId: "opp-1",
        suggestedStatus: "interviewing",
        confidence: 0.72,
        reason: "gmail interview signal",
        evidence: ["Can you meet Thursday?"],
      },
    };
    const fetchMock = mockNotificationsResponse([suggestion], 1);

    render(<NotificationCenter variant="appbar" />);
    await openPanel();

    expect(screen.getByText("Needs review")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Accept" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dismiss" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Accept" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/notifications/suggestion-1",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ action: "acceptSuggestedStatus" }),
        }),
      ),
    );
  });

  it("renders undo for auto-applied Gmail status updates", async () => {
    const updated: Notification = {
      ...baseNotification,
      id: "updated-1",
      type: "application_update",
      title: "Application status updated from Gmail",
      message: "Northstar Backend Engineer moved from applied to rejected.",
      link: "/opportunities?id=opp-2&undoStatus=applied&currentStatus=rejected",
    };
    const fetchMock = mockNotificationsResponse([updated], 1);

    render(<NotificationCenter variant="appbar" />);
    await openPanel();

    expect(screen.getByText("Updated automatically")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/opportunities/opp-2/status/undo",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            previousStatus: "applied",
            currentStatus: "rejected",
          }),
        }),
      ),
    );
  });

  it("marks linked notifications read and navigates when opened", async () => {
    const fetchMock = mockNotificationsResponse([{ ...baseNotification }], 1);

    render(<NotificationCenter variant="appbar" />);
    await openPanel();

    fireEvent.click(
      screen.getByRole("link", {
        name: /3 new opportunities waiting for review/,
      }),
    );

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/notifications/notification-1",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ action: "markRead" }),
        }),
      ),
    );
    expect(routerPush).toHaveBeenCalledWith("/opportunities/review");
  });

  it("keeps mark-all-read and delete-read behavior wired", async () => {
    const fetchMock = mockNotificationsResponse(
      [
        { ...baseNotification },
        { ...baseNotification, id: "read-1", read: true },
      ],
      1,
    );

    render(<NotificationCenter variant="appbar" />);
    await openPanel();

    fireEvent.click(screen.getByRole("button", { name: "Mark all as read" }));
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/notifications",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ action: "markAllRead" }),
        }),
      ),
    );
    expect(screen.getByText("0 unread")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Delete read notifications" }),
    );
    expect(
      await screen.findByText("Delete read notifications?"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Delete read" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/notifications",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ action: "deleteRead" }),
        }),
      ),
    );
  });
});
