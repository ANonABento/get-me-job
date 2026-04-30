import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { BuilderVersion } from "@/lib/builder/version-history";
import { VersionHistorySection } from "./version-history-section";

const version: BuilderVersion = {
  id: "version-1",
  kind: "manual",
  name: "Initial draft",
  savedAt: "2026-04-29T12:00:00.000Z",
  state: {
    documentMode: "resume",
    selectedIds: [],
    sections: [],
    templateId: "classic",
    html: "",
  },
};

describe("VersionHistorySection", () => {
  it("uses theme variable classes for version controls", () => {
    render(
      <VersionHistorySection
        versions={[version]}
        previewVersionId="version-1"
        manualVersionName=""
        onPreviewVersion={vi.fn()}
        onManualVersionNameChange={vi.fn()}
        onSaveVersion={vi.fn()}
      />,
    );

    expect(
      screen.getByText("Initial draft").parentElement?.className,
    ).toContain("rounded-[var(--radius)]");
    expect(screen.getByPlaceholderText("Version name...").className).toContain(
      "border-[length:var(--border-width)]",
    );
  });
});
