import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ToastProvider } from "@/components/ui/toast";
import { CustomTemplateManagerDialog } from "./custom-template-manager";

function renderDialog(
  props: Partial<React.ComponentProps<typeof CustomTemplateManagerDialog>> = {},
) {
  return render(
    <ToastProvider>
      <CustomTemplateManagerDialog
        open
        onOpenChange={() => undefined}
        onTemplatesChanged={() => undefined}
        {...props}
      />
    </ToastProvider>,
  );
}

describe("CustomTemplateManagerDialog", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("imports a Studio template and shows source, confidence, and warnings", async () => {
    const onTemplatesChanged = vi.fn();
    const onTemplateImported = vi.fn();
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/api/templates/import") {
        return Response.json({
          template: {
            id: "custom-tex",
            name: "Resume Template",
            sourceFilename: "resume.tex",
            sourceType: "tex",
          },
          warnings: ["Used defaults for page size."],
          confidence: "medium",
          sectionsFound: ["experience"],
        });
      }
      return Response.json({
        templates: [
          {
            id: "custom-tex",
            name: "Resume Template",
            description: "Imported from TEX",
            type: "custom",
            sourceFilename: "resume.tex",
            sourceType: "tex",
          },
        ],
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    renderDialog({
      onTemplatesChanged,
      onTemplateImported,
    });

    const input =
      document.querySelector<HTMLInputElement>("input[type='file']");
    expect(input).not.toBeNull();
    fireEvent.change(input!, {
      target: {
        files: [
          new File(["\\documentclass{article}"], "resume.tex", {
            type: "text/x-tex",
          }),
        ],
      },
    });

    await waitFor(() => {
      expect(screen.getAllByText("Resume Template").length).toBeGreaterThan(0);
      expect(screen.getByText("medium confidence")).toBeInTheDocument();
      expect(screen.getByText("resume.tex (TEX)")).toBeInTheDocument();
      expect(
        screen.getByText("Used defaults for page size."),
      ).toBeInTheDocument();
    });
    await waitFor(() => expect(onTemplatesChanged).toHaveBeenCalled());
    expect(onTemplateImported).toHaveBeenCalledWith("custom-tex");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/templates/import",
      expect.objectContaining({ method: "POST", body: expect.any(FormData) }),
    );
  });
});
