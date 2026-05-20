"use client";

import { useCallback, useEffect, useState } from "react";
import type { ResumeTemplate } from "@/lib/resume/template-types";
import type { DocumentTemplateV3 } from "@/lib/resume/template-v3";
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
  documentTemplateV3?: DocumentTemplateV3;
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
      (template) =>
        template.type === "custom" &&
        (template.reusableTemplate || template.documentTemplateV3),
    )
    .map((template) =>
      isReusableTemplateItem(template)
        ? reusableTemplateToResumeTemplate(template)
        : isDocumentTemplateV3Item(template)
          ? documentTemplateV3ToResumeTemplate(template)
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

function isDocumentTemplateV3Item(
  template: TemplateApiItem,
): template is TemplateApiItem & { documentTemplateV3: DocumentTemplateV3 } {
  return Boolean(template.documentTemplateV3);
}

function documentTemplateV3ToResumeTemplate(
  template: TemplateApiItem & { documentTemplateV3: DocumentTemplateV3 },
): ResumeTemplate {
  const documentTemplate = template.documentTemplateV3;
  const body = documentTemplate.tokens.body;
  const heading = documentTemplate.tokens.heading ?? body;
  const name = documentTemplate.tokens.name ?? heading;
  const hasSidebar = documentTemplate.regions.some(
    (region) => region.role === "sidebar",
  );

  return {
    id: template.id,
    name: template.name,
    description: template.description ?? "Visual template",
    schemaVersion: 3,
    styles: {
      fontFamily: body?.fontFamily ?? "'Helvetica Neue', Arial, sans-serif",
      fontSize: body?.fontSize ?? "11pt",
      headerSize: name?.fontSize ?? "20pt",
      sectionHeaderSize: heading?.fontSize ?? "12pt",
      lineHeight: body?.lineHeight ?? "1.4",
      accentColor: heading?.color ?? name?.color ?? "#333333",
      layout: hasSidebar ? "two-column" : "single-column",
      headerStyle: "left",
      bulletStyle: "disc",
      sectionDivider: "line",
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
