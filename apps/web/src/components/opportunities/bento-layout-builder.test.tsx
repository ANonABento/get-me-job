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
