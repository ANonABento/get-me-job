import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProfilePage from "./page";
import type { Profile } from "@/types";
import messages from "@/messages/en.json";
import zhMessages from "@/messages/zh-CN.json";

Element.prototype.scrollIntoView = vi.fn();

const { replaceMock, routerMock } = vi.hoisted(() => {
  const replace = vi.fn();
  return { replaceMock: replace, routerMock: { replace } };
});

vi.mock("next/navigation", () => ({
  useRouter: () => routerMock,
}));

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

function mockProfileFetch(profile: Profile | null, status = 200) {
  global.fetch = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);

    if (url === "/api/profile") {
      return jsonResponse({ profile }, status);
    }

    if (url === "/api/streak") {
      return jsonResponse({ streak: null });
    }

    throw new Error(`Unexpected fetch: ${url}`);
  }) as typeof fetch;
}

function renderProfilePage(locale = "en", localeMessages = messages) {
  return render(
    <NextIntlClientProvider locale={locale} messages={localeMessages}>
      <ProfilePage />
    </NextIntlClientProvider>,
  );
}

async function showManualForm() {
  fireEvent.click(
    await screen.findByRole("button", { name: "Or fill manually" }),
  );
}

describe("ProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    replaceMock.mockClear();
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    });
    mockProfileFetch(null);
  });

  it("shows an empty state for a brand-new profile", async () => {
    renderProfilePage();

    expect(
      await screen.findByRole("heading", { name: "Let's set up your profile" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: /Upload your resume to fill this in/i,
      }),
    ).toHaveAttribute("href", "/en/components");
    expect(screen.queryByLabelText("Full name")).not.toBeInTheDocument();
    expect(screen.getByTestId("profile-empty-state")).toMatchSnapshot();
  });

  it("renders profile empty state and form chrome in Chinese", async () => {
    renderProfilePage("zh-CN", zhMessages);

    expect(
      await screen.findByRole("heading", { name: "让我们设置你的个人资料" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "或手动填写" }));

    expect(
      await screen.findByRole("tab", { name: "概览" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "偏好" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /保存更改/i }),
    ).toBeInTheDocument();
  });

  it("makes empty profile summary fields clickable shortcuts to edit fields", async () => {
    renderProfilePage();
    await showManualForm();

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /No email/i }),
      ).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole("button", { name: /No email/i }));
    await waitFor(() =>
      expect(screen.getByLabelText("Email address")).toHaveFocus(),
    );

    fireEvent.click(screen.getByRole("button", { name: /No location/i }));
    await waitFor(() =>
      expect(screen.getByLabelText("Location")).toHaveFocus(),
    );

    fireEvent.click(screen.getByRole("button", { name: /No target salary/i }));

    await waitFor(() =>
      expect(screen.getByRole("tab", { name: /Preferences/i })).toHaveAttribute(
        "aria-selected",
        "true",
      ),
    );
    await waitFor(() => expect(screen.getByLabelText("Minimum")).toHaveFocus());
  });

  it("labels long-form profile textareas with explicit accessible names", async () => {
    renderProfilePage();
    await showManualForm();

    expect(
      await screen.findByRole("textbox", { name: "Professional summary" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: /Preferences/i }));

    expect(
      screen.getByRole("textbox", { name: "Target roles" }),
    ).toBeInTheDocument();
  });

  it("shows the profile completeness card after loading", async () => {
    renderProfilePage();
    await showManualForm();

    expect(
      await screen.findByText(
        "Profile is 0% complete · 9 quick wins available",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
  });

  it("updates profile completeness live for editable overview fields", async () => {
    renderProfilePage();
    await showManualForm();

    await screen.findByText("Profile is 0% complete · 9 quick wins available");

    fireEvent.change(screen.getByLabelText("Full name"), {
      target: { value: "Ari Rivers" },
    });
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "ari@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Headline"), {
      target: { value: "Product engineer" },
    });
    fireEvent.change(screen.getByLabelText("Professional summary"), {
      target: { value: "I build reliable product workflows." },
    });

    expect(
      await screen.findByText(
        "Profile is 20% complete · 7 quick wins available",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "20",
    );
  });

  it("focuses an editable input when clicking an actionable gap", async () => {
    renderProfilePage();
    await showManualForm();

    fireEvent.click(
      await screen.findByRole("button", {
        name: /Add your name, email, and headline/i,
      }),
    );

    await waitFor(() =>
      expect(screen.getByLabelText("Full name")).toHaveFocus(),
    );
  });

  it("scrolls to display-only profile signal anchors from gaps", async () => {
    const profile: Profile = {
      id: "profile-1",
      contact: {
        name: "Ari Rivers",
        email: "ari@example.com",
        headline: "Product engineer",
        linkedin: "https://linkedin.com/in/ari",
      },
      summary: "I build reliable product workflows.",
      experiences: [
        {
          id: "exp-1",
          company: "Anthropic",
          title: "Product Engineer",
          startDate: "2024-01-01",
          current: true,
          description: "",
          highlights: [
            "Improved activation by 18%",
            "Supported 12 engineers",
            "Shipped workflow tools",
          ],
          skills: [],
        },
      ],
      education: [],
      skills: [
        { id: "ts", name: "TypeScript", category: "technical" },
        { id: "react", name: "React", category: "technical" },
        { id: "node", name: "Node.js", category: "technical" },
        { id: "sql", name: "SQL", category: "technical" },
        { id: "testing", name: "Testing", category: "technical" },
      ],
      projects: [
        {
          id: "project-1",
          name: "Resume Builder",
          description: "",
          technologies: [],
          highlights: [],
        },
      ],
      certifications: [],
    };
    mockProfileFetch(profile);

    renderProfilePage();

    fireEvent.click(
      await screen.findByRole("button", { name: /Add your education/i }),
    );

    await waitFor(() =>
      expect(Element.prototype.scrollIntoView).toHaveBeenCalled(),
    );
  });

  it("redirects 401 profile loads to localized sign-in", async () => {
    mockProfileFetch(null, 401);

    renderProfilePage();

    await waitFor(() =>
      expect(replaceMock).toHaveBeenCalledWith(
        "/en/sign-in?callbackUrl=%2Fen%2Fprofile",
      ),
    );
  });

  it("registers a beforeunload prompt when profile changes are unsaved", async () => {
    renderProfilePage();
    await showManualForm();

    fireEvent.change(await screen.findByLabelText("Full name"), {
      target: { value: "Ari Rivers" },
    });

    const event = new Event("beforeunload", {
      cancelable: true,
    }) as BeforeUnloadEvent;
    fireEvent(window, event);

    expect(event.defaultPrevented).toBe(true);
  });
});
