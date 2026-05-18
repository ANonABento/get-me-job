import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppBar } from "./app-bar";

const routerPush = vi.fn();
const setCommandPaletteOpen = vi.fn();
const toggleDark = vi.fn();
const showErrorToast = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPush }),
  usePathname: () => "/dashboard",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/components/command-palette/use-command-palette", () => ({
  useCommandPalette: () => ({ setOpen: setCommandPaletteOpen }),
}));

vi.mock("@/components/theme-provider", () => ({
  useTheme: () => ({ isDark: false, toggleDark }),
}));

vi.mock("@/components/keyboard-shortcuts", () => ({
  useRegisterShortcuts: vi.fn(),
}));

vi.mock("@/components/i18n/locale-switcher", () => ({
  LocaleSwitcherCompact: () => <button type="button">EN</button>,
}));

vi.mock("@/hooks/use-error-toast", () => ({
  useErrorToast: () => showErrorToast,
}));

function jsonResponse(body: unknown) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status: 200,
      headers: { "content-type": "application/json" },
    }),
  );
}

describe("AppBar notifications", () => {
  beforeEach(() => {
    routerPush.mockReset();
    setCommandPaletteOpen.mockReset();
    toggleDark.mockReset();
    showErrorToast.mockReset();
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("countOnly=true")) {
          return jsonResponse({ count: 0 });
        }
        return jsonResponse({ notifications: [], unreadCount: 0 });
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("opens the wired notifications panel from the AppBar bell", async () => {
    render(<AppBar />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Notifications" }),
    );

    expect(
      await screen.findByRole("dialog", { name: "Notifications" }),
    ).toBeInTheDocument();
    expect(screen.getByText("No action needed")).toBeInTheDocument();
  });
});
