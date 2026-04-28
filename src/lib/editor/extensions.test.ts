import { Editor } from "@tiptap/react";
import { describe, expect, it } from "vitest";
import {
  CoverLetterBlock,
  ContactInfoNode,
  ResumeEntry,
  ResumeSection,
  findAdjacentResumeSectionTextPosition,
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

  it("finds the next and previous resume section text positions", () => {
    const document: TipTapJSONContent = {
      type: "doc",
      content: [
        {
          type: "resumeSection",
          attrs: { title: "Summary" },
          content: [{ type: "paragraph" }],
        },
        {
          type: "resumeSection",
          attrs: { title: "Experience" },
          content: [{ type: "paragraph" }],
        },
      ],
    };
    const editor = new Editor({
      extensions: resumeEditorExtensions,
      content: document,
    });
    const sections: Array<{ from: number; to: number }> = [];
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === "resumeSection") {
        sections.push({ from: pos, to: pos + node.nodeSize });
      }
    });

    expect(
      findAdjacentResumeSectionTextPosition(
        editor.state.doc,
        sections[0].from + 2,
        1
      )
    ).toBe(sections[1].from + 2);
    expect(
      findAdjacentResumeSectionTextPosition(
        editor.state.doc,
        sections[1].from,
        -1
      )
    ).toBe(sections[0].from + 2);
    expect(
      findAdjacentResumeSectionTextPosition(
        editor.state.doc,
        sections[1].from + 2,
        1
      )
    ).toBeNull();

    editor.destroy();
  });

  it("marks empty section paragraphs with placeholder attributes", () => {
    const document: TipTapJSONContent = {
      type: "doc",
      content: [
        {
          type: "resumeSection",
          attrs: { title: "Experience" },
          content: [{ type: "paragraph" }],
        },
      ],
    };
    const editor = new Editor({
      extensions: resumeEditorExtensions,
      content: document,
    });

    expect(editor.view.dom.innerHTML).toContain("is-empty");
    expect(editor.view.dom.innerHTML).toContain(
      'data-placeholder="Click to add your experience..."'
    );

    editor.destroy();
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
    expect(editor.getHTML()).toContain('class="resume-section-drag-handle"');
    expect(editor.getHTML()).toContain('data-type="resume-entry"');
    expect(editor.getHTML()).toContain("Built APIs");

    editor.destroy();
  });

  it("parses rendered resume HTML using only editable content containers", () => {
    const editor = new Editor({
      extensions: resumeEditorExtensions,
      content: `
        <div
          data-type="contact-info"
          data-contact-name="Jane Doe"
          data-contact-email="jane@example.com"
        >
          <h1>Jane Doe</h1>
          <div class="contact">jane@example.com</div>
        </div>
        <section data-type="resume-section" data-section-title="Experience">
          <h2 class="resume-section-title">Experience</h2>
          <div class="resume-section-content">
            <div
              data-type="resume-entry"
              data-company="Acme"
              data-title="Engineer"
              data-dates="2020"
            >
              <div class="experience-header">
                <div>
                  <h3>Engineer</h3>
                  <span class="company">Acme</span>
                </div>
                <span class="dates">2020</span>
              </div>
              <div class="resume-entry-bullets">
                <ul>
                  <li><p>Built APIs</p></li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      `,
    });

    expect(editor.getJSON()).toMatchObject({
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
    });

    editor.destroy();
  });

  it("parses cover letter content without including its fixed label", () => {
    const editor = new Editor({
      extensions: resumeEditorExtensions,
      content: `
        <section data-type="cover-letter-block" data-label="Letter">
          <div class="cover-letter-block-label">Letter</div>
          <div class="cover-letter-block-content">
            <p>Hello hiring team.</p>
          </div>
        </section>
      `,
    });

    expect(editor.getJSON()).toMatchObject({
      type: "doc",
      content: [
        {
          type: "coverLetterBlock",
          attrs: { label: "Letter" },
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Hello hiring team." }],
            },
          ],
        },
      ],
    });

    editor.destroy();
  });
});
