import { fireEvent, render, screen } from "@testing-library/react";
import type { Editor } from "@tiptap/react";
import { describe, expect, it, vi } from "vitest";
import { TEMPLATES } from "@/lib/resume/template-data";
import { EditorToolbar } from "./editor-toolbar";

function makeEditorMock() {
  const run = vi.fn();
  const chain = {
    focus: vi.fn(() => chain),
    toggleBold: vi.fn(() => chain),
    toggleItalic: vi.fn(() => chain),
    toggleUnderline: vi.fn(() => chain),
    undo: vi.fn(() => chain),
    redo: vi.fn(() => chain),
    run,
  };

  return {
    editor: {
      chain: vi.fn(() => chain),
      isActive: vi.fn(() => false),
    } as unknown as Editor,
    chain,
  };
}

describe("EditorToolbar", () => {
  it("wires formatting and history buttons to TipTap commands", () => {
    const { editor, chain } = makeEditorMock();

    render(
      <EditorToolbar
        editor={editor}
        templates={TEMPLATES}
        templateId="classic"
        zoomPercent={100}
        canExport
        onTemplateChange={vi.fn()}
        onZoomChange={vi.fn()}
        onDownloadPdf={vi.fn()}
        onPrint={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Bold" }));
    fireEvent.click(screen.getByRole("button", { name: "Italic" }));
    fireEvent.click(screen.getByRole("button", { name: "Underline" }));
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    fireEvent.click(screen.getByRole("button", { name: "Redo" }));

    expect(chain.toggleBold).toHaveBeenCalledTimes(1);
    expect(chain.toggleItalic).toHaveBeenCalledTimes(1);
    expect(chain.toggleUnderline).toHaveBeenCalledTimes(1);
    expect(chain.undo).toHaveBeenCalledTimes(1);
    expect(chain.redo).toHaveBeenCalledTimes(1);
    expect(chain.run).toHaveBeenCalledTimes(5);
  });

  it("emits template, zoom, print, and download actions", () => {
    const { editor } = makeEditorMock();
    const onTemplateChange = vi.fn();
    const onZoomChange = vi.fn();
    const onDownloadPdf = vi.fn();
    const onPrint = vi.fn();

    render(
      <EditorToolbar
        editor={editor}
        templates={TEMPLATES}
        templateId="classic"
        zoomPercent={100}
        canExport
        onTemplateChange={onTemplateChange}
        onZoomChange={onZoomChange}
        onDownloadPdf={onDownloadPdf}
        onPrint={onPrint}
      />
    );

    fireEvent.change(screen.getByRole("combobox", { name: /resume template/i }), {
      target: { value: "modern" },
    });
    fireEvent.change(screen.getByRole("slider", { name: /preview zoom/i }), {
      target: { value: "150" },
    });
    fireEvent.click(screen.getByRole("button", { name: /print/i }));
    fireEvent.click(screen.getByRole("button", { name: /download pdf/i }));

    expect(onTemplateChange).toHaveBeenCalledWith("modern");
    expect(onZoomChange).toHaveBeenCalledWith(150);
    expect(onPrint).toHaveBeenCalledTimes(1);
    expect(onDownloadPdf).toHaveBeenCalledTimes(1);
  });
});
