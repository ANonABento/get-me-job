import { Editor } from "@tiptap/react";
import { describe, expect, it } from "vitest";
import {
  CoverLetterBlock,
  ContactInfoNode,
  ResumeEntry,
  ResumeSection,
  resumeEditorExtensions,
} from "./extensions";
import type { TipTapJSONContent } from "./types";

describe("resume editor extensions", () => {
  it("defines the custom resume node names", () => {
    expect(ContactInfoNode.name).toBe("contactInfo");
    expect(ResumeSection.name).toBe("resumeSection");
    expect(ResumeEntry.name).toBe("resumeEntry");
    expect(CoverLetterBlock.name).toBe("coverLetterBlock");
  });

  it("renders custom resume JSON with TipTap", () => {
    const document: TipTapJSONContent = {
      type: "doc",
      content: [
        {
          type: "contactInfo",
          attrs: {
            name: "Jane Doe",
            email: "jane@example.com",
          },
        },
        {
          type: "resumeSection",
          attrs: { title: "Experience" },
          content: [
            {
              type: "resumeEntry",
              attrs: {
                company: "Acme",
                title: "Engineer",
                dates: "2020",
              },
              content: [
                {
                  type: "bulletList",
                  content: [
                    {
                      type: "listItem",
                      content: [
                        {
                          type: "paragraph",
                          content: [{ type: "text", text: "Built APIs" }],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };
    const editor = new Editor({
      extensions: resumeEditorExtensions,
      content: document,
    });

    expect(editor.getHTML()).toContain('data-type="resume-section"');
    expect(editor.getHTML()).toContain('data-type="resume-entry"');
    expect(editor.getHTML()).toContain("Built APIs");

    editor.destroy();
  });
});
