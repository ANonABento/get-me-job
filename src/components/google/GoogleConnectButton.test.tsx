import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GoogleConnectButton } from "./GoogleConnectButton";

const openSignIn = vi.fn();
const openUserProfile = vi.fn();
const showErrorToast = vi.fn();
let clerkUserState = { isLoaded: true, isSignedIn: false };

vi.mock("@clerk/nextjs", () => ({
  useClerk: () => ({ openSignIn, openUserProfile }),
  useUser: () => clerkUserState,
}));

vi.mock("@/hooks/use-error-toast", () => ({
  useErrorToast: () => showErrorToast,
}));

describe("GoogleConnectButton", () => {
  const originalKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
    clerkUserState = { isLoaded: true, isSignedIn: false };
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_123";
    global.fetch = vi.fn();
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = originalKey;
  });

  it("uses friendly copy when Clerk is not configured", () => {
    delete process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

    render(<GoogleConnectButton />);

    const button = screen.getByRole("button", {
      name: /Coming soon - Google integration/i,
    });
    expect(button).toBeDisabled();
    expect(screen.queryByText(/Clerk required/i)).not.toBeInTheDocument();
  });

  it("prompts signed-out users to sign in before connecting Google", () => {
    render(<GoogleConnectButton />);

    fireEvent.click(
      screen.getByRole("button", { name: /Sign in to connect Google/i }),
    );

    expect(openSignIn).toHaveBeenCalledTimes(1);
    expect(openUserProfile).not.toHaveBeenCalled();
  });

  it("shows connect copy for signed-in users without an existing connection", async () => {
    clerkUserState = { isLoaded: true, isSignedIn: true };
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
