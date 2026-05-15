import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
import { DangerZoneSection } from "./danger-zone-section";

/**
 * The global test setup (`src/test/setup.ts`) replaces `window.localStorage`
 * with `vi.fn()` stubs that don't actually store anything. The danger-zone
 * action depends on real read/clear semantics, so install a small in-memory
 * implementation just for this file.
 */
function installRealLocalStorage() {
  const store = new Map<string, string>();
  const real: Storage = {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key) => (store.has(key) ? store.get(key)! : null),
    key: (index) => {
      const keys = Array.from(store.keys());
      return keys[index] ?? null;
    },
    removeItem: (key) => {
      store.delete(key);
    },
    setItem: (key, value) => {
      store.set(key, String(value));
    },
  };
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: real,
  });
}

let priorLocalStorage: PropertyDescriptor | undefined;

beforeAll(() => {
  priorLocalStorage = Object.getOwnPropertyDescriptor(window, "localStorage");
  installRealLocalStorage();
});

afterAll(() => {
  if (priorLocalStorage) {
    Object.defineProperty(window, "localStorage", priorLocalStorage);
  }
});

describe("DangerZoneSection", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it("renders the panel head with a Reset local data action", () => {
    render(<DangerZoneSection />);
    expect(screen.getByText("Danger zone")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /reset local data/i }),
    ).toBeInTheDocument();
  });

  it("requires confirm before clearing taida:* keys and reports the count", async () => {
    window.localStorage.setItem("taida:onboarding-dismissed-at", "2025-01-01");
    window.localStorage.setItem("taida:builder:versions:abc", "[]");
    window.localStorage.setItem("not-taida-key", "keep-me");

    render(<DangerZoneSection />);

    fireEvent.click(screen.getByRole("button", { name: /reset local data/i }));

    const dialog = await screen.findByRole("dialog");
    fireEvent.click(
      within(dialog).getByRole("button", { name: /reset local data/i }),
    );

    await waitFor(() => {
      expect(screen.getByText(/Cleared 2 local keys/)).toBeInTheDocument();
    });

    // Non-taida keys are preserved.
    expect(window.localStorage.getItem("not-taida-key")).toBe("keep-me");
    expect(
      window.localStorage.getItem("taida:onboarding-dismissed-at"),
    ).toBeNull();
    expect(
      window.localStorage.getItem("taida:builder:versions:abc"),
    ).toBeNull();
  });

  it("uses singular copy when exactly one key is cleared", async () => {
    window.localStorage.setItem("taida:only-one", "v");

    render(<DangerZoneSection />);

    fireEvent.click(screen.getByRole("button", { name: /reset local data/i }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(
      within(dialog).getByRole("button", { name: /reset local data/i }),
    );

    await waitFor(() => {
      expect(screen.getByText(/Cleared 1 local key/)).toBeInTheDocument();
    });
  });

  it("does nothing when the user cancels the confirm dialog", async () => {
    window.localStorage.setItem("taida:keep", "yes");

    render(<DangerZoneSection />);

    fireEvent.click(screen.getByRole("button", { name: /reset local data/i }));

    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: /cancel/i }));

    expect(window.localStorage.getItem("taida:keep")).toBe("yes");
    expect(screen.queryByText(/Cleared/)).not.toBeInTheDocument();
  });
});
