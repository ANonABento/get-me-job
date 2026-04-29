"use client";

import type { CSSProperties, ReactNode } from "react";
import type { CoverLetterTemplate } from "@/lib/builder/cover-letter-document";
import type { ResumeTemplate, TemplateStyles } from "@/lib/resume/template-data";
import { cn } from "@/lib/utils";

interface TemplatePreviewThumbnailProps {
  template: ResumeTemplate | CoverLetterTemplate;
  className?: string;
}

interface TemplateThumbnailTraits {
  accentColor: string;
  fontFamily: string;
  headerAlignmentClass: string;
  sectionRuleClass: string;
  bulletLabel: string;
  isTwoColumn: boolean;
  isLetter: boolean;
}

const HEADER_ALIGNMENT_CLASS_BY_STYLE = {
  centered: "items-center text-center",
  left: "items-start",
  minimal: "items-start",
} satisfies Record<TemplateStyles["headerStyle"], string>;

const SECTION_RULE_CLASS_BY_DIVIDER = {
  line: "border-b",
  space: "pb-1.5",
  none: "",
} satisfies Record<TemplateStyles["sectionDivider"], string>;

const BULLET_LABEL_BY_STYLE = {
  disc: "\u2022",
  dash: "-",
  arrow: "\u2192",
  none: "",
} satisfies Record<TemplateStyles["bulletStyle"], string>;

const SAMPLE_RESUME = {
  name: "Alex Morgan",
  headline: "Product Leader",
  contact: "alex@example.com | New York, NY",
  summary: "Built hiring tools used by fast-growing teams.",
  experience: [
    "Led roadmap for document workflows",
    "Improved activation by 24%",
  ],
  skills: ["Strategy", "Analytics", "AI tooling"],
};

const SAMPLE_LETTER = {
  name: "Alex Morgan",
  target: "Product Designer at Northstar",
  paragraphs: [
    "Dear Hiring Team,",
    "I am excited to bring a track record of thoughtful product work.",
    "Sincerely, Alex",
  ],
};

export function getTemplateThumbnailTraits(
  styles: TemplateStyles | CoverLetterTemplate["styles"]
): TemplateThumbnailTraits {
  if ("headerAlign" in styles) {
    return {
      accentColor: styles.accentColor,
      fontFamily: styles.fontFamily,
      headerAlignmentClass:
        styles.headerAlign === "center"
          ? "items-center text-center"
          : "items-start",
      sectionRuleClass: "",
      bulletLabel: "",
      isTwoColumn: false,
      isLetter: true,
    };
  }

  return {
    accentColor: styles.accentColor,
    fontFamily: styles.fontFamily,
    headerAlignmentClass: HEADER_ALIGNMENT_CLASS_BY_STYLE[styles.headerStyle],
    sectionRuleClass: SECTION_RULE_CLASS_BY_DIVIDER[styles.sectionDivider],
    bulletLabel: BULLET_LABEL_BY_STYLE[styles.bulletStyle],
    isTwoColumn: styles.layout === "two-column",
    isLetter: false,
  };
}

export function TemplatePreviewThumbnail({
  template,
  className,
}: TemplatePreviewThumbnailProps) {
  const traits = getTemplateThumbnailTraits(template.styles);
  const style = {
    "--template-accent": traits.accentColor,
    fontFamily: traits.fontFamily,
  } as CSSProperties;

  return (
    <div
      aria-hidden="true"
      data-testid={`template-thumbnail-${template.id}`}
      className={cn(
        "h-28 w-full overflow-hidden rounded border bg-white text-slate-950 shadow-sm",
        className
      )}
      style={style}
    >
      <div className="h-1 bg-[var(--template-accent)]" />
      <div className="space-y-1 p-2 text-[5px] leading-tight">
        {traits.isLetter ? (
          <LetterThumbnail traits={traits} />
        ) : (
          <ResumeThumbnail traits={traits} />
        )}
      </div>
    </div>
  );
}

function ResumeThumbnail({ traits }: { traits: TemplateThumbnailTraits }) {
  return (
    <>
      <header
        className={cn("flex flex-col gap-0.5", traits.headerAlignmentClass)}
      >
        <p className="text-[7px] font-semibold leading-none">
          {SAMPLE_RESUME.name}
        </p>
        <p className="text-slate-500">{SAMPLE_RESUME.headline}</p>
        <p className="truncate text-[4px] text-slate-400">
          {SAMPLE_RESUME.contact}
        </p>
      </header>

      <div
        className={cn(
          "pt-0.5",
          traits.isTwoColumn && "grid grid-cols-[0.9fr_1.5fr] gap-1.5"
        )}
      >
        {traits.isTwoColumn && <ThumbnailSidebar traits={traits} />}

        <div className="space-y-1">
          <PreviewSection traits={traits} title="Summary">
            <p className="line-clamp-2 text-slate-500">{SAMPLE_RESUME.summary}</p>
          </PreviewSection>
          <PreviewSection traits={traits} title="Experience">
            {SAMPLE_RESUME.experience.map((item) => (
              <PreviewBullet key={item} traits={traits}>
                {item}
              </PreviewBullet>
            ))}
          </PreviewSection>
        </div>
      </div>
    </>
  );
}

function LetterThumbnail({ traits }: { traits: TemplateThumbnailTraits }) {
  return (
    <div className="space-y-2 px-1 py-1.5">
      <header
        className={cn(
          "flex flex-col gap-0.5 border-b border-[var(--template-accent)] pb-1",
          traits.headerAlignmentClass
        )}
      >
        <p className="text-[7px] font-semibold leading-none text-[var(--template-accent)]">
          {SAMPLE_LETTER.name}
        </p>
        <p className="truncate text-[4px] text-slate-400">
          {SAMPLE_LETTER.target}
        </p>
      </header>
      <div className="space-y-1.5">
        {SAMPLE_LETTER.paragraphs.map((paragraph) => (
          <p key={paragraph} className="line-clamp-2 text-slate-500">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}

function ThumbnailSidebar({ traits }: { traits: TemplateThumbnailTraits }) {
  return (
    <aside
      className="space-y-1 rounded-sm p-1"
      style={{ backgroundColor: `${traits.accentColor}14` }}
    >
      <PreviewSection traits={traits} title="Skills" compact>
        {SAMPLE_RESUME.skills.map((skill) => (
          <p key={skill} className="truncate text-slate-500">
            {skill}
          </p>
        ))}
      </PreviewSection>
    </aside>
  );
}

function PreviewSection({
  traits,
  title,
  children,
  compact = false,
}: {
  traits: TemplateThumbnailTraits;
  title: string;
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <section className="space-y-0.5">
      <h3
        className={cn(
          "border-[var(--template-accent)] text-[5px] font-semibold uppercase leading-tight text-[var(--template-accent)]",
          traits.sectionRuleClass,
          compact ? "w-9" : "w-16"
        )}
      >
        {title}
      </h3>
      <div className="space-y-0.5">{children}</div>
    </section>
  );
}

function PreviewBullet({
  traits,
  children,
}: {
  traits: TemplateThumbnailTraits;
  children: ReactNode;
}) {
  if (!traits.bulletLabel) {
    return <p className="line-clamp-1 text-slate-500">{children}</p>;
  }

  return (
    <p className="flex gap-0.5 text-slate-500">
      <span className="w-1 text-[5px] leading-tight text-[var(--template-accent)]">
        {traits.bulletLabel}
      </span>
      <span className="line-clamp-1 min-w-0 flex-1">{children}</span>
    </p>
  );
}
