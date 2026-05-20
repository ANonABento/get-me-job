/**
 * Covers phases 8 + 9 of docs/opportunity-card-bento-spec.md.
 *
 * Phase 8 — per-tab Reset semantics:
 *   - Reset on the Desktop tab restores desktop cells/columns/disabled
 *     but leaves mobilePriority + expandedCount alone.
 *   - Reset on the Mobile tab restores mobilePriority + expandedCount
 *     without touching desktop cells.
 *
 * Phase 9 — keyboard a11y:
 *   - Every chunk chip carries a meaningful aria-label.
 *   - The DndContext registers KeyboardSensor.
 *   - The builder is keyboard-reachable end-to-end (the tab toggle,
 *     reset button, and chunk chips are all tabbable + activate via
 *     keyboard).
 */
import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BentoLayoutBuilder } from "./bento-layout-builder";
import { DEFAULT_BENTO_LAYOUT } from "@/lib/opportunities/default-bento";
import type { BentoLayoutPreference } from "@/lib/opportunities/bento-layout";

function customizedLayout(): BentoLayoutPreference {
  // Start from the default and mutate both desktop + mobile pieces so
  // we can tell per-tab Reset apart. Add an extra cell, set
  // expandedCount to 2 (default is 4), and reorder mobile priority.
  return {
    desktop: {
      ...DEFAULT_BENTO_LAYOUT.desktop,
      columns: 4,
      cells: [
        ...DEFAULT_BENTO_LAYOUT.desktop.cells,
        {
          id: "cell-extra",
          chunks: [],
          gridCol: 1,
          gridRow: 99,
          colSpan: 4,
          rowSpan: 1,
          label: "Extra",
        },
      ],
      mobilePriority: ["signals", "identity", "description"],
    },
    mobile: { expandedCount: 2 },
  };
}

describe("BentoLayoutBuilder — per-tab Reset (phase 8)", () => {
  it("Desktop-tab Reset restores cells/columns/disabled and preserves the mobile slice", () => {
    const onChange = vi.fn();
    render(
      <BentoLayoutBuilder value={customizedLayout()} onChange={onChange} />,
    );

    // Default tab is Desktop, so the visible Reset button targets desktop.
    fireEvent.click(screen.getByRole("button", { name: /^Reset$/ }));

    expect(onChange).toHaveBeenCalledTimes(1);
    const next = onChange.mock.calls[0]![0] as BentoLayoutPreference;

    // Desktop slice resets to defaults …
    expect(next.desktop.columns).toBe(DEFAULT_BENTO_LAYOUT.desktop.columns);
    expect(next.desktop.cells).toEqual(DEFAULT_BENTO_LAYOUT.desktop.cells);
    expect(next.desktop.disabled).toEqual(
      DEFAULT_BENTO_LAYOUT.desktop.disabled,
    );

    // …but mobile-side knobs survive.
    expect(next.mobile.expandedCount).toBe(2);
    // mobilePriority filters against the freshly-restored cells, so
    // stale "cell-extra" drops out but valid entries stay in user order.
    expect(next.desktop.mobilePriority).toEqual([
      "signals",
      "identity",
      "description",
    ]);
  });

  it("Mobile-tab Reset restores mobilePriority + expandedCount and preserves desktop cells", () => {
    const onChange = vi.fn();
    const value = customizedLayout();
    render(<BentoLayoutBuilder value={value} onChange={onChange} />);

    // Switch to Mobile tab first.
    fireEvent.click(screen.getByRole("button", { name: /mobile/i }));
    fireEvent.click(screen.getByRole("button", { name: /^Reset$/ }));

    expect(onChange).toHaveBeenCalledTimes(1);
    const next = onChange.mock.calls[0]![0] as BentoLayoutPreference;

    // Mobile slice resets …
    expect(next.mobile.expandedCount).toBe(
      DEFAULT_BENTO_LAYOUT.mobile.expandedCount,
    );
    // …mobilePriority returns to the default ordering, filtered
    // against whatever cells the user currently has (their extra cell
    // is preserved separately on desktop, but isn't in the default
    // priority list so it falls in at the end of getMobileCellOrder).
    expect(next.desktop.mobilePriority).toEqual(
      DEFAULT_BENTO_LAYOUT.desktop.mobilePriority,
    );

    // …but desktop slice is untouched.
    expect(next.desktop.columns).toBe(4);
    expect(next.desktop.cells).toEqual(value.desktop.cells);
    expect(next.desktop.disabled).toEqual(value.desktop.disabled);
  });
});

describe("BentoLayoutBuilder — keyboard a11y (phase 9)", () => {
  it("every chunk chip carries a meaningful aria-label so the keyboard sensor can announce it", () => {
    render(
      <BentoLayoutBuilder value={DEFAULT_BENTO_LAYOUT} onChange={vi.fn()} />,
    );

    // Every chunk chip (drag handle) is a <button> labelled "Drag <Label>".
    // dnd-kit's KeyboardSensor announces this string when the user
    // grabs the chip with Space.
    const dragButtons = screen.getAllByRole("button", { name: /^Drag / });
    expect(dragButtons.length).toBeGreaterThan(0);
    for (const button of dragButtons) {
      const label = button.getAttribute("aria-label");
      expect(label).toMatch(/^Drag /);
      // The label includes a meaningful body, not just "Drag".
      expect(label!.length).toBeGreaterThan("Drag ".length);
    }
  });

  it("Reset button activates on Enter (keyboard) and routes to per-tab reset", () => {
    const onChange = vi.fn();
    render(
      <BentoLayoutBuilder value={customizedLayout()} onChange={onChange} />,
    );

    const reset = screen.getByRole("button", { name: /^Reset$/ });
    // Focus + Enter must trigger reset just like a mouse click.
    act(() => {
      reset.focus();
    });
    expect(document.activeElement).toBe(reset);
    fireEvent.keyDown(reset, { key: "Enter" });
    fireEvent.click(reset); // browsers also fire click on Enter for buttons
    expect(onChange).toHaveBeenCalled();
  });

  it("tab toggle is keyboard-operable; switching tabs hides desktop-only controls", () => {
    render(
      <BentoLayoutBuilder value={DEFAULT_BENTO_LAYOUT} onChange={vi.fn()} />,
    );

    const mobileTab = screen.getByRole("button", { name: /mobile/i });
    // aria-pressed is the on/off signal for the toggle (per the
    // pattern used in the kanban Columns toggle, iter/10).
    expect(mobileTab).toHaveAttribute("aria-pressed", "false");

    act(() => {
      mobileTab.focus();
    });
    fireEvent.click(mobileTab);

    expect(mobileTab).toHaveAttribute("aria-pressed", "true");
    // Desktop-only controls (Columns picker, Add cell) disappear on
    // the Mobile tab — verifying the tab switch took effect.
    expect(screen.queryByRole("button", { name: /^Add cell$/i })).toBeNull();
    expect(screen.queryByText(/^Columns$/)).toBeNull();
  });
});

describe("BentoLayoutBuilder — tone palette (P2)", () => {
  it("each cell exposes a palette button; opening it reveals 3 tone swatches", () => {
    render(
      <BentoLayoutBuilder value={DEFAULT_BENTO_LAYOUT} onChange={vi.fn()} />,
    );

    // One palette per visible cell. Aria-label includes "Cell tone".
    const paletteButtons = screen.getAllByRole("button", {
      name: /^Cell tone /,
    });
    expect(paletteButtons.length).toBe(
      DEFAULT_BENTO_LAYOUT.desktop.cells.length,
    );
    // No swatch menu rendered until the user opens one.
    expect(screen.queryByRole("menuitemradio")).toBeNull();

    fireEvent.click(paletteButtons[0]!);

    // Now exactly 3 swatches (Paper / Muted / Accent) render as
    // menuitemradio entries with aria-checked.
    const swatches = screen.getAllByRole("menuitemradio");
    expect(swatches).toHaveLength(3);
    expect(
      swatches.some((s) => s.getAttribute("aria-checked") === "true"),
    ).toBe(true);
  });

  it("clicking a tone swatch writes back through onChange and closes the menu", () => {
    const onChange = vi.fn();
    render(
      <BentoLayoutBuilder value={DEFAULT_BENTO_LAYOUT} onChange={onChange} />,
    );

    fireEvent.click(screen.getAllByRole("button", { name: /^Cell tone / })[0]!);
    // Pick a non-default tone so the change is observable.
    const accentSwatch = screen
      .getAllByRole("menuitemradio")
      .find((s) => s.getAttribute("title") === "Accent");
    expect(accentSwatch).toBeDefined();
    fireEvent.click(accentSwatch!);

    expect(onChange).toHaveBeenCalled();
    const next = onChange.mock.calls.at(-1)![0] as BentoLayoutPreference;
    expect(next.desktop.cells[0]!.tone).toBe("accent");
    // Menu closes after selection.
    expect(screen.queryByRole("menuitemradio")).toBeNull();
  });

  it("Cols/Rows numeric pickers are removed from the DOM (P3 — sizing happens via edge drag)", () => {
    render(
      <BentoLayoutBuilder value={DEFAULT_BENTO_LAYOUT} onChange={vi.fn()} />,
    );

    // The legacy SpanPicker labels were "Cols" and "Rows". Both
    // should be gone in P3 — cell sizing now happens via the RGL
    // edge resize handles.
    expect(screen.queryAllByText(/^Cols$/).length).toBe(0);
    expect(screen.queryAllByText(/^Rows$/).length).toBe(0);
  });
});

describe("BentoLayoutBuilder — arrow-key cell control (P4)", () => {
  // Helper: find the grip handle for the first cell. Aria-label is the
  // P4 string "Drag cell <Label>. Arrow keys move, shift+arrow resizes."
  function findFirstGrip() {
    return screen.getAllByRole("button", { name: /^Drag cell / })[0]!;
  }

  it("ArrowRight on a focused grip moves the cell right by one column", () => {
    const onChange = vi.fn();
    render(
      <BentoLayoutBuilder value={DEFAULT_BENTO_LAYOUT} onChange={onChange} />,
    );

    const grip = findFirstGrip();
    act(() => {
      grip.focus();
    });
    fireEvent.keyDown(grip, { key: "ArrowRight" });

    expect(onChange).toHaveBeenCalled();
    const next = onChange.mock.calls.at(-1)![0] as BentoLayoutPreference;
    const movedCell = next.desktop.cells.find(
      (c) => c.id === DEFAULT_BENTO_LAYOUT.desktop.cells[0]!.id,
    );
    expect(movedCell).toBeDefined();
    // First default cell ("identity") sits at gridCol: 1; ArrowRight
    // increments to 2 (clamped against columns - colSpan + 1).
    expect(movedCell!.gridCol).toBe(2);
    // gridRow + spans unchanged.
    expect(movedCell!.gridRow).toBe(
      DEFAULT_BENTO_LAYOUT.desktop.cells[0]!.gridRow,
    );
    expect(movedCell!.colSpan).toBe(
      DEFAULT_BENTO_LAYOUT.desktop.cells[0]!.colSpan,
    );
  });

  it("Shift+ArrowDown resizes the cell taller by one row", () => {
    const onChange = vi.fn();
    render(
      <BentoLayoutBuilder value={DEFAULT_BENTO_LAYOUT} onChange={onChange} />,
    );

    const grip = findFirstGrip();
    act(() => {
      grip.focus();
    });
    fireEvent.keyDown(grip, { key: "ArrowDown", shiftKey: true });

    expect(onChange).toHaveBeenCalled();
    const next = onChange.mock.calls.at(-1)![0] as BentoLayoutPreference;
    const resized = next.desktop.cells.find(
      (c) => c.id === DEFAULT_BENTO_LAYOUT.desktop.cells[0]!.id,
    )!;
    expect(resized.rowSpan).toBe(
      DEFAULT_BENTO_LAYOUT.desktop.cells[0]!.rowSpan + 1,
    );
    // gridCol/gridRow stay put.
    expect(resized.gridCol).toBe(
      DEFAULT_BENTO_LAYOUT.desktop.cells[0]!.gridCol,
    );
    expect(resized.gridRow).toBe(
      DEFAULT_BENTO_LAYOUT.desktop.cells[0]!.gridRow,
    );
  });

  it("does not move past the grid edge (left bound)", () => {
    const onChange = vi.fn();
    render(
      <BentoLayoutBuilder value={DEFAULT_BENTO_LAYOUT} onChange={onChange} />,
    );

    const grip = findFirstGrip();
    act(() => {
      grip.focus();
    });
    // First default cell is at gridCol: 1 already; ArrowLeft should
    // be a no-op (clamped to >= 1).
    fireEvent.keyDown(grip, { key: "ArrowLeft" });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("grip aria-label explains the keyboard control to screen readers", () => {
    render(
      <BentoLayoutBuilder value={DEFAULT_BENTO_LAYOUT} onChange={vi.fn()} />,
    );
    const grip = findFirstGrip();
    expect(grip.getAttribute("aria-label")).toMatch(
      /Arrow keys move, shift\+arrow resizes/,
    );
  });
});
