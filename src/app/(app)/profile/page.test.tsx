import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProfilePage from "./page";

Element.prototype.scrollIntoView = vi.fn();

describe("ProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ profile: null }),
    } as Response);
  });

  it("makes empty profile summary fields clickable shortcuts to edit fields", async () => {
    render(<ProfilePage />);

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /No email/i })).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole("button", { name: /No email/i }));
    await waitFor(() => expect(screen.getByLabelText("Email address")).toHaveFocus());

    fireEvent.click(screen.getByRole("button", { name: /No location/i }));
    await waitFor(() => expect(screen.getByLabelText("Location")).toHaveFocus());

    fireEvent.click(screen.getByRole("button", { name: /No target salary/i }));

    await waitFor(() =>
      expect(screen.getByRole("tab", { name: /Preferences/i })).toHaveAttribute(
        "aria-selected",
        "true",
      ),
    );
    await waitFor(() => expect(screen.getByLabelText("Minimum")).toHaveFocus());
  });
});
