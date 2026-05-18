import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GoogleConnectButton } from "./GoogleConnectButton";

const signIn = vi.fn();
const showErrorToast = vi.fn();
let sessionState: { status: "loading" | "authenticated" | "unauthenticated" } =
  {
    status: "unauthenticated",
  };

vi.mock("next-auth/react", () => ({
  signIn: (...args: unknown[]) => signIn(...args),
  useSession: () => sessionState,
}));

vi.mock("@/hooks/use-error-toast", () => ({
  useErrorToast: () => showErrorToast,
}));

describe("GoogleConnectButton", () => {
  const originalFlag = process.env.NEXT_PUBLIC_NEXTAUTH_ENABLED;

  beforeEach(() => {
    vi.clearAllMocks();
    sessionState = { status: "unauthenticated" };
    process.env.NEXT_PUBLIC_NEXTAUTH_ENABLED = "true";
    global.fetch = vi.fn();
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_NEXTAUTH_ENABLED = originalFlag;
  });

  it("uses friendly copy when NextAuth is not configured", () => {
    delete process.env.NEXT_PUBLIC_NEXTAUTH_ENABLED;

    render(<GoogleConnectButton />);

    const button = screen.getByRole("button", {
      name: /Google setup required/i,
    });
    expect(button).toBeDisabled();
    expect(
      screen.getByText(/Add Google OAuth credentials/i),
    ).toBeInTheDocument();
  });

  it("kicks off Google sign-in for signed-out users when they click connect", () => {
    render(<GoogleConnectButton />);

    fireEvent.click(
      screen.getByRole("button", { name: /Sign in to connect Google/i }),
    );

    expect(signIn).toHaveBeenCalledTimes(1);
    expect(signIn).toHaveBeenCalledWith(
      "google",
      expect.objectContaining({ callbackUrl: expect.any(String) }),
    );
  });

  it("shows connect copy for signed-in users without an existing connection", async () => {
    sessionState = { status: "authenticated" };
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ connected: false }),
    } as Response);

    render(<GoogleConnectButton />);

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /Connect Google account/i }),
      ).toBeInTheDocument(),
    );
  });
});
