import {
  Node,
  mergeAttributes,
  type CommandProps,
} from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";

function getDataAttribute(element: HTMLElement, name: string): string {
  return element.getAttribute(name) || "";
}

function omitAttribute(
  attributes: Record<string, unknown>,
  key: string
): Record<string, unknown> {
  const { [key]: _omitted, ...rest } = attributes;
  return rest;
}

export const ResumeSection = Node.create({
  name: "resumeSection",
  group: "block",
  content: "block+",
  defining: true,

  addAttributes() {
    return {
      title: {
        default: "",
        parseHTML: (element: HTMLElement) =>
          getDataAttribute(element, "data-section-title"),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'section[data-type="resume-section"]' }];
  },

  renderHTML({ HTMLAttributes, node }) {
    const title = String(node.attrs.title || "");
    const attributes = omitAttribute(HTMLAttributes, "title");

    return [
      "section",
      mergeAttributes(attributes, {
        "data-type": "resume-section",
        "data-section-title": title,
        class: "resume-section",
      }),
      ["h2", { class: "resume-section-title" }, title],
      ["div", { class: "resume-section-content" }, 0],
    ];
  },
});

export const ResumeEntry = Node.create({
  name: "resumeEntry",
  group: "block",
  content: "bulletList?",
  defining: true,

  addAttributes() {
    return {
      company: {
        default: "",
        parseHTML: (element: HTMLElement) =>
          getDataAttribute(element, "data-company"),
      },
      title: {
        default: "",
        parseHTML: (element: HTMLElement) =>
          getDataAttribute(element, "data-title"),
      },
      dates: {
        default: "",
        parseHTML: (element: HTMLElement) =>
          getDataAttribute(element, "data-dates"),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="resume-entry"]' }];
  },

  renderHTML({ HTMLAttributes, node }) {
    const company = String(node.attrs.company || "");
    const title = String(node.attrs.title || "");
    const dates = String(node.attrs.dates || "");
    const attributes = omitAttribute(
      omitAttribute(omitAttribute(HTMLAttributes, "company"), "title"),
      "dates"
    );

    return [
      "div",
      mergeAttributes(attributes, {
        "data-type": "resume-entry",
        "data-company": company,
        "data-title": title,
        "data-dates": dates,
        class: "experience-item resume-entry",
      }),
      [
        "div",
        { class: "experience-header" },
        [
          "div",
          {},
          ["h3", {}, title],
          ["span", { class: "company" }, company],
        ],
        ["span", { class: "dates" }, dates],
      ],
      ["div", { class: "resume-entry-bullets" }, 0],
    ];
  },
});

export const ContactInfoNode = Node.create({
  name: "contactInfo",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      name: { default: "" },
      email: { default: "" },
      phone: { default: "" },
      location: { default: "" },
      linkedin: { default: "" },
      github: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="contact-info"]' }];
  },

  renderHTML({ HTMLAttributes, node }) {
    const name = String(node.attrs.name || "");
    const details = ["email", "phone", "location", "linkedin", "github"]
      .map((key) => String(node.attrs[key] || ""))
      .filter(Boolean);

    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "contact-info",
        class: "header",
      }),
      ["h1", {}, name],
      [
        "div",
        { class: "contact" },
        ...details.flatMap((detail, index) =>
          index === 0 ? [detail] : [["span", {}, "|"], detail]
        ),
      ],
    ];
  },
});

export const CoverLetterBlock = Node.create({
  name: "coverLetterBlock",
  group: "block",
  content: "block+",
  defining: true,

  addAttributes() {
    return {
      label: {
        default: "Cover Letter",
        parseHTML: (element: HTMLElement) =>
          getDataAttribute(element, "data-label") || "Cover Letter",
      },
    };
  },

  parseHTML() {
    return [{ tag: 'section[data-type="cover-letter-block"]' }];
  },

  renderHTML({ HTMLAttributes, node }) {
    const label = String(node.attrs.label || "Cover Letter");
    const attributes = omitAttribute(HTMLAttributes, "label");

    return [
      "section",
      mergeAttributes(attributes, {
        "data-type": "cover-letter-block",
        "data-label": label,
        class: "cover-letter-block",
      }),
      ["div", { class: "cover-letter-block-label" }, label],
      ["div", { class: "cover-letter-block-content" }, 0],
    ];
  },
});

export const resumeEditorExtensions = [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3],
    },
    underline: false,
  }),
  Underline,
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
  Placeholder.configure({
    placeholder: "Start writing...",
  }),
  ContactInfoNode,
  ResumeSection,
  ResumeEntry,
  CoverLetterBlock,
];

export function focusEditor({ commands }: CommandProps): boolean {
  return commands.focus();
}
