"use client";

import { useCallback, useEffect, useState } from "react";
import type { ResumeTemplate } from "@/lib/resume/template-types";
import type { ReusableResumeTemplateIR } from "@/lib/resume/universal-template-renderer";

interface TemplateApiItem {
  id: string;
  name: string;
  description?: string;
  customDescription?: string | null;
  type: "built-in" | "custom";
  analyzedStyles?: {
    styles: ResumeTemplate["styles"];
  };
  sourceFilename?: string | null;
  sourceType?: string | null;
  schemaVersion?: number;
  reusableTemplate?: ReusableResumeTemplateIR;
  updatedAt?: string;
}

interface TemplatesApiResponse {
  templates?: TemplateApiItem[];
}

let cachedCustomTemplates: ResumeTemplate[] | null = null;
let inflightRequest: Promise<ResumeTemplate[]> | null = null;

export function clearCustomTemplateCache() {
  cachedCustomTemplates = null;
  inflightRequest = null;
}

async function fetchCustomTemplates(): Promise<ResumeTemplate[]> {
  const response = await fetch("/api/templates");
  if (!response.ok) throw new Error("Failed to load custom templates");
  const data = (await response.json()) as TemplatesApiResponse;
  return (data.templates ?? [])
    .filter(
      (template) => template.type === "custom" && template.reusableTemplate,
    )
    .map((template) =>
      isReusableTemplateItem(template)
        ? reusableTemplateToResumeTemplate(template)
        : unreachableTemplate(template),
    );
}

function isReusableTemplateItem(
  template: TemplateApiItem,
): template is TemplateApiItem & {
  reusableTemplate: ReusableResumeTemplateIR;
} {
  return Boolean(template.reusableTemplate);
}

function reusableTemplateToResumeTemplate(
  template: TemplateApiItem & { reusableTemplate: ReusableResumeTemplateIR },
): ResumeTemplate {
  const reusableTemplate = template.reusableTemplate;
  const body = reusableTemplate.tokens.typography.body;
  const heading = reusableTemplate.tokens.typography.sectionHeading ?? body;
  const name = reusableTemplate.tokens.typography.name ?? heading;
  const accent =
    reusableTemplate.tokens.color.accent?.value ??
    heading?.color ??
    name?.color ??
    "#333333";

  return {
    id: template.id,
    name: template.name,
    description: template.description ?? "Reusable imported template",
    schemaVersion: 4,
    styles: {
      fontFamily: body?.fontFamily ?? "'Helvetica Neue', Arial, sans-serif",
      fontSize: `${body?.fontSizePt ?? 11}pt`,
      headerSize: `${name?.fontSizePt ?? 20}pt`,
      sectionHeaderSize: `${heading?.fontSizePt ?? 12}pt`,
      lineHeight: body?.lineHeight ?? "1.4",
      accentColor: accent,
      layout:
        reusableTemplate.tokens.layout.columns?.value === 2
          ? "two-column"
          : "single-column",
      headerStyle:
        reusableTemplate.tokens.layout.headerMode?.value === "stacked"
          ? "centered"
          : "left",
      bulletStyle: "disc",
      sectionDivider: reusableTemplate.tokens.rules.sectionDivider
        ? "line"
        : "space",
    },
  };
}

function unreachableTemplate(template: TemplateApiItem): ResumeTemplate {
  throw new Error(`Unsupported custom template payload: ${template.id}`);
}

export function useCustomTemplates() {
  const [customTemplates, setCustomTemplates] = useState<ResumeTemplate[]>(
    () => cachedCustomTemplates ?? [],
  );
  const [isLoading, setIsLoading] = useState(cachedCustomTemplates === null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      inflightRequest ??= fetchCustomTemplates().finally(() => {
        inflightRequest = null;
      });
      const templates = await inflightRequest;
      cachedCustomTemplates = templates;
      setCustomTemplates(templates);
      return templates;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (cachedCustomTemplates !== null) return;
    void refresh().catch(() => {
      cachedCustomTemplates = [];
      setCustomTemplates([]);
    });
  }, [refresh]);

  return { customTemplates, refresh, isLoading };
}
