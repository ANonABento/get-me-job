import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CommandPalette } from "./command-palette";
import { CommandPaletteProvider } from "./command-palette-provider";
import { useCommandPalette } from "./use-command-palette";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

function OpenPaletteButton() {
  const palette = useCommandPalette();
  return <button onClick={palette.toggle}>Open palette</button>;
}

function renderPalette() {
  return render(
    <CommandPaletteProvider>
      <OpenPaletteButton />
      <CommandPalette />
    </CommandPaletteProvider>,
  );
}

function stubLocalStorage() {
  const store: Record<string, string> = {};
  vi.stubGlobal("localStorage", {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
  });
}

describe("CommandPalette", () => {
  beforeEach(() => {
    push.mockClear();
    stubLocalStorage();
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ items: [] }),
        } as Response),
      ),
    );
  });

  it("opens through context and shows default groups", async () => {
    renderPalette();
    fireEvent.click(screen.getByText("Open palette"));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Type a command or search..."),
    ).toHaveFocus();
    expect(screen.getByText("Quick Actions")).toBeInTheDocument();
    expect(screen.getByText("New opportunity")).toBeInTheDocument();
  });

  it("navigates and persists recent/frequent state when an item is selected", async () => {
    renderPalette();
    fireEvent.click(screen.getByText("Open palette"));

    fireEvent.click(await screen.findByText("Open Studio"));

    expect(push).toHaveBeenCalledWith("/studio");
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "command-palette-recent",
      JSON.stringify(["act-studio"]),
    );
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "taida:cmdk:frequency",
      JSON.stringify({ "act-studio": 1 }),
    );
  });

  it("searches remote providers after debounce", async () => {
    vi.mocked(fetch).mockImplementation((input: string | URL | Request) => {
      const url = String(input);
      if (url.startsWith("/api/opportunities")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              items: [
                { id: "job-1", title: "React Engineer", company: "Acme" },
              ],
            }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ items: [] }),
      } as Response);
    });

    renderPalette();
    fireEvent.click(screen.getByText("Open palette"));
    fireEvent.change(
      screen.getByPlaceholderText("Type a command or search..."),
      {
        target: { value: "react" },
      },
    );

    await waitFor(() => {
      expect(screen.getByText("React Engineer")).toBeInTheDocument();
    });
  });
});
