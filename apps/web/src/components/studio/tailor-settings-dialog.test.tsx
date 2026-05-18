import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  TailorSettingsDialog,
  useTailorSettingsDialog,
} from "./tailor-settings-dialog";
import {
  DEFAULT_TAILOR_SETTINGS,
  TAILOR_SETTINGS_STORAGE_KEY,
} from "@/lib/tailor/settings";

describe("TailorSettingsDialog", () => {
  // Mirror the chrome-provider.test pattern: wire an in-memory localStorage
  // store on top of the bare vi.fn() mocks from setup.ts.
  let store: Record<string, string>;

  beforeEach(() => {
    store = {};
    vi.mocked(window.localStorage.getItem).mockImplementation(
      (key: string) => store[key] ?? null,
    );
    vi.mocked(window.localStorage.setItem).mockImplementation(
      (key: string, value: string) => {
        store[key] = String(value);
      },
    );
    vi.mocked(window.localStorage.removeItem).mockImplementation(
      (key: string) => {
        delete store[key];
      },
    );
    vi.mocked(window.localStorage.clear).mockImplementation(() => {
      for (const k of Object.keys(store)) delete store[k];
    });
  });

  afterEach(() => {
    store = {};
    vi.mocked(window.localStorage.getItem).mockReset();
    vi.mocked(window.localStorage.setItem).mockReset();
    vi.mocked(window.localStorage.removeItem).mockReset();
    vi.mocked(window.localStorage.clear).mockReset();
  });

  it("does not render the dialog content when closed", () => {
    render(
      <TailorSettingsDialog open={false} onOpenChange={() => undefined} />,
    );
    expect(screen.queryByText("Tailor settings")).not.toBeInTheDocument();
  });

  it("renders title, description, and core controls when open", async () => {
    render(<TailorSettingsDialog open onOpenChange={() => undefined} />);
    expect(screen.getByText("Tailor settings")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Minimum bullets per role"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Maximum bullets per role"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Minimum bullets per project"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Maximum bullets per project"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Maximum number of roles"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Maximum number of projects"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("ATS strictness")).toBeInTheDocument();
    expect(screen.queryByText(/coming soon/i)).not.toBeInTheDocument();
    expect(
      screen.getByText(
        /Shapes AI prompt guidance and deterministic manual output/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Drop bullets shorter than (characters)"),
    ).toBeInTheDocument();
  });

  it("hydrates the form from localStorage when opened", () => {
    store[TAILOR_SETTINGS_STORAGE_KEY] = JSON.stringify({
      bulletsPerRole: { min: 3, max: 6 },
      bulletsPerProject: { min: 2, max: 5 },
      maxRoles: 9,
      maxProjects: 4,
      atsStrictness: "strict",
      dropBulletsShorterThan: 50,
    });
    render(<TailorSettingsDialog open onOpenChange={() => undefined} />);
    expect(screen.getByLabelText("Minimum bullets per role")).toHaveValue(3);
    expect(screen.getByLabelText("Maximum bullets per role")).toHaveValue(6);
    expect(screen.getByLabelText("Maximum number of roles")).toHaveValue(9);
    expect(
      screen.getByLabelText("Drop bullets shorter than (characters)"),
    ).toHaveValue(50);
  });

  it("falls back to defaults when storage is empty", () => {
    render(<TailorSettingsDialog open onOpenChange={() => undefined} />);
    expect(screen.getByLabelText("Minimum bullets per role")).toHaveValue(
      DEFAULT_TAILOR_SETTINGS.bulletsPerRole.min,
    );
    expect(screen.getByLabelText("Maximum number of roles")).toHaveValue(
      DEFAULT_TAILOR_SETTINGS.maxRoles,
    );
  });

  it("persists edits and reports the saved blob to onSaved", () => {
    const onOpenChange = vi.fn();
    const onSaved = vi.fn();
    render(
      <TailorSettingsDialog
        open
        onOpenChange={onOpenChange}
        onSaved={onSaved}
      />,
    );

    const maxRolesInput = screen.getByLabelText("Maximum number of roles");
    fireEvent.change(maxRolesInput, { target: { value: "7" } });

    const dropInput = screen.getByLabelText(
      "Drop bullets shorter than (characters)",
    );
    fireEvent.change(dropInput, { target: { value: "60" } });

    fireEvent.click(screen.getByLabelText("Save tailor settings"));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onSaved).toHaveBeenCalledTimes(1);
    const savedArg = onSaved.mock.calls[0]?.[0];
    expect(savedArg).toMatchObject({ maxRoles: 7, dropBulletsShorterThan: 60 });

    const persisted = store[TAILOR_SETTINGS_STORAGE_KEY];
    expect(persisted).toBeTruthy();
    expect(JSON.parse(persisted!)).toMatchObject({
      maxRoles: 7,
      dropBulletsShorterThan: 60,
    });
  });

  it("reset reverts the form to defaults without persisting yet", () => {
    store[TAILOR_SETTINGS_STORAGE_KEY] = JSON.stringify({
      ...DEFAULT_TAILOR_SETTINGS,
      maxRoles: 12,
    });
    render(<TailorSettingsDialog open onOpenChange={() => undefined} />);
    expect(screen.getByLabelText("Maximum number of roles")).toHaveValue(12);

    fireEvent.click(screen.getByLabelText("Reset tailor settings to defaults"));

    expect(screen.getByLabelText("Maximum number of roles")).toHaveValue(
      DEFAULT_TAILOR_SETTINGS.maxRoles,
    );
    // Reset is staged — the persisted blob hasn't been overwritten yet.
    // The user still needs to hit Save to commit the reset.
    expect(JSON.parse(store[TAILOR_SETTINGS_STORAGE_KEY]!).maxRoles).toBe(12);
  });

  it("reset followed by save clears the persisted overrides", () => {
    store[TAILOR_SETTINGS_STORAGE_KEY] = JSON.stringify({
      ...DEFAULT_TAILOR_SETTINGS,
      maxRoles: 12,
    });
    render(<TailorSettingsDialog open onOpenChange={() => undefined} />);

    fireEvent.click(screen.getByLabelText("Reset tailor settings to defaults"));
    fireEvent.click(screen.getByLabelText("Save tailor settings"));

    const persisted = JSON.parse(store[TAILOR_SETTINGS_STORAGE_KEY]!);
    expect(persisted).toMatchObject(DEFAULT_TAILOR_SETTINGS);
  });

  it("cancel closes the dialog without persisting edits", () => {
    const onOpenChange = vi.fn();
    render(<TailorSettingsDialog open onOpenChange={onOpenChange} />);

    fireEvent.change(screen.getByLabelText("Maximum number of roles"), {
      target: { value: "11" },
    });
    fireEvent.click(screen.getByLabelText("Cancel tailor settings"));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    // Nothing should have been written to storage.
    expect(store[TAILOR_SETTINGS_STORAGE_KEY]).toBeUndefined();
  });
});

describe("useTailorSettingsDialog", () => {
  let store: Record<string, string>;

  beforeEach(() => {
    store = {};
    vi.mocked(window.localStorage.getItem).mockImplementation(
      (key: string) => store[key] ?? null,
    );
    vi.mocked(window.localStorage.setItem).mockImplementation(
      (key: string, value: string) => {
        store[key] = String(value);
      },
    );
    vi.mocked(window.localStorage.removeItem).mockImplementation(
      (key: string) => {
        delete store[key];
      },
    );
    vi.mocked(window.localStorage.clear).mockImplementation(() => {
      for (const k of Object.keys(store)) delete store[k];
    });
  });

  afterEach(() => {
    store = {};
    vi.mocked(window.localStorage.getItem).mockReset();
    vi.mocked(window.localStorage.setItem).mockReset();
    vi.mocked(window.localStorage.removeItem).mockReset();
    vi.mocked(window.localStorage.clear).mockReset();
  });

  function Harness({
    onSaved,
  }: {
    onSaved?: (settings: { maxRoles: number }) => void;
  }) {
    const { open, dialog } = useTailorSettingsDialog({
      onSaved: onSaved as never,
    });
    return (
      <div>
        <button type="button" onClick={open}>
          open-tailor-settings
        </button>
        {dialog}
      </div>
    );
  }

  it("returns an open() that mounts the dialog and renders nothing by default", async () => {
    render(<Harness />);
    expect(screen.queryByText("Tailor settings")).not.toBeInTheDocument();

    act(() => {
      screen.getByText("open-tailor-settings").click();
    });

    await waitFor(() => {
      expect(screen.getByText("Tailor settings")).toBeInTheDocument();
    });
  });

  it("propagates the onSaved callback through the hook", async () => {
    const onSaved = vi.fn();
    render(<Harness onSaved={onSaved} />);

    act(() => {
      screen.getByText("open-tailor-settings").click();
    });

    await waitFor(() => {
      expect(screen.getByLabelText("Save tailor settings")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText("Save tailor settings"));
    expect(onSaved).toHaveBeenCalledTimes(1);
  });
});
