"use client";

import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import { useEffect } from "react";
import type { MouseEvent } from "react";
import type { TemplateStyles } from "@/lib/resume/template-types";
import { getCoverLetterEditorStyles, getResumeEditorStyles } from "./styles";
import { resumeEditorExtensions } from "./extensions";
import type { TipTapJSONContent } from "./types";

interface ResumeEditorProps {
  content: TipTapJSONContent;
  templateStyles: TemplateStyles;
  editable?: boolean;
  className?: string;
  variant?: "resume" | "cover_letter";
  onUpdate?: (content: TipTapJSONContent) => void;
  onEditorReady?: (editor: Editor | null) => void;
}

export function ResumeEditor({
  content,
  templateStyles,
  editable = true,
  className,
  variant = "resume",
  onUpdate,
  onEditorReady,
}: ResumeEditorProps) {
  const editor = useEditor({
    extensions: resumeEditorExtensions,
    content,
    editable,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        "aria-label": "Editable document preview",
        tabindex: "0",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onUpdate?.(currentEditor.getJSON());
    },
  });

  useEffect(() => {
    onEditorReady?.(editor);
    return () => onEditorReady?.(null);
  }, [editor, onEditorReady]);

  useEffect(() => {
    if (!editor) return;
    if (JSON.stringify(editor.getJSON()) !== JSON.stringify(content)) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  useEffect(() => {
    editor?.setEditable(editable);
  }, [editable, editor]);

  const editorClassName = [
    variant === "cover_letter" ? "cover-letter-editor" : "resume-editor",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  function handleShellClick(event: MouseEvent<HTMLDivElement>) {
    if (!editable || !editor) return;

    const target = event.target as HTMLElement;
    if (target.closest("button, a, input, textarea, select")) return;

    editor.commands.focus();
  }

  return (
    <div className={editorClassName} onClick={handleShellClick}>
      {variant === "cover_letter" && (
        <style>{getCoverLetterEditorStyles(templateStyles)}</style>
      )}
      {variant === "resume" && (
        <style>{getResumeEditorStyles(templateStyles)}</style>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
