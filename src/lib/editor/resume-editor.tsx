"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { useEffect } from "react";
import type { Editor } from "@tiptap/react";
import type { TemplateStyles } from "@/lib/resume/template-types";
import { getResumeEditorStyles } from "./styles";
import { resumeEditorExtensions } from "./extensions";
import type { TipTapJSONContent } from "./types";

interface ResumeEditorProps {
  content: TipTapJSONContent;
  templateStyles: TemplateStyles;
  editable?: boolean;
  className?: string;
  onUpdate?: (content: TipTapJSONContent) => void;
  onEditorReady?: (editor: Editor | null) => void;
}

export function ResumeEditor({
  content,
  templateStyles,
  editable = true,
  className,
  onUpdate,
  onEditorReady,
}: ResumeEditorProps) {
  const editor = useEditor({
    extensions: resumeEditorExtensions,
    content,
    editable,
    immediatelyRender: false,
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

  const editorClassName = ["resume-editor", className].filter(Boolean).join(" ");

  return (
    <div className={editorClassName}>
      <style>{getResumeEditorStyles(templateStyles)}</style>
      <EditorContent editor={editor} />
    </div>
  );
}
