import { escapeHtml } from "@/lib/html";
import type { TailoredResume } from "@/lib/resume/generator";
import type {
  BorderSet,
  BorderStyle,
  BoxEdges,
  DocumentTemplateV3,
  FillStyle,
  TemplateNodeV3,
  TemplateRegionV3,
  TemplateSlotV3,
  TemplateTable,
  TemplateTableCell,
  TemplateTableRow,
  TypographyTokenV3,
} from "@/lib/resume/template-v3";

export function generateResumeHTMLV3(
  resume: TailoredResume,
  template: DocumentTemplateV3,
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(resume.contact.name || template.name)} - Resume</title>
  <style>${generateDocumentTemplateV3CSS(template)}</style>
</head>
<body>
  <article class="resume-v3">
    ${template.regions.map((region) => renderRegion(region, resume, template)).join("\n")}
  </article>
</body>
</html>`.trim();
}

export function generateDocumentTemplateV3CSS(
  template: DocumentTemplateV3,
): string {
  const body = tokenFor(template, "body", {
    fontFamily: "Arial, sans-serif",
    fontSize: "10pt",
    lineHeight: "1.35",
  });
  const pageWidth = template.page.widthPt || 612;
  const pageHeight = template.page.heightPt || 792;
  const margins = template.page.margins;

  return `
* { box-sizing: border-box; }
body { margin: 0; background: #f4f4f5; color: ${body.color ?? "#222"}; font-family: ${body.fontFamily}; font-size: ${body.fontSize}; line-height: ${body.lineHeight}; }
.resume-v3 {
  width: ${round(pageWidth)}pt;
  min-height: ${round(pageHeight)}pt;
  margin: 0 auto;
  padding: ${edgeCss(margins)};
  background: ${template.page.background?.color ?? "#fff"};
  position: relative;
}
.v3-region { margin: 0; }
.v3-region-flow-absolute { position: relative; padding: 0; }
.v3-absolute-node { position: absolute; margin: 0; overflow: visible; white-space: nowrap; }
.v3-table { width: 100%; border-collapse: collapse; table-layout: fixed; margin: 0; }
.v3-table-row { break-inside: avoid; }
.v3-cell { vertical-align: top; overflow-wrap: anywhere; }
.v3-text { margin: 0; }
.v3-section-title { margin: 0; }
.v3-list { margin: 2pt 0 0 13pt; padding: 0; }
.v3-list.marker-none { list-style: none; margin-left: 0; }
.v3-list.marker-decimal { list-style: decimal; }
.v3-list.marker-dash { list-style: none; margin-left: 0; }
.v3-list.marker-dash li::before { content: "- "; }
.v3-list li { margin: 0 0 1.5pt; }
@page { size: ${round(pageWidth)}pt ${round(pageHeight)}pt; margin: 0; }
@media print { body { background: #fff; print-color-adjust: exact; -webkit-print-color-adjust: exact; } .resume-v3 { margin: 0; } }
`.trim();
}

export function getDocumentTemplateV3PDFOptions(template: DocumentTemplateV3) {
  return {
    width: `${round(template.page.widthPt)}pt`,
    height: `${round(template.page.heightPt)}pt`,
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
  };
}

function renderRegion(
  region: TemplateRegionV3,
  resume: TailoredResume,
  template: DocumentTemplateV3,
): string {
  const style = [
    region.box?.widthPt ? `width:${round(region.box.widthPt)}pt` : "",
    region.box?.heightPt ? `min-height:${round(region.box.heightPt)}pt` : "",
    region.style?.padding ? `padding:${edgeCss(region.style.padding)}` : "",
    region.style?.fill ? `background:${region.style.fill.color}` : "",
  ]
    .filter(Boolean)
    .join(";");
  return `<section class="v3-region v3-region-${region.role} v3-region-flow-${region.flow}"${style ? ` style="${style}"` : ""}>${region.nodes
    .map((node) => renderNode(node, resume, template))
    .join("")}</section>`;
}

function renderNode(
  node: TemplateNodeV3,
  resume: TailoredResume,
  template: DocumentTemplateV3,
): string {
  if (node.kind === "table") return renderTable(node, resume, template);
  if (node.kind === "row") {
    return `<table class="v3-table"><tbody>${renderRow(node, resume, template)}</tbody></table>`;
  }
  if (node.kind === "cell") return renderCell(node, resume, template);
  if (node.kind === "slot") {
    const slot = template.slots.find(
      (candidate) => candidate.id === node.slotId,
    );
    const value = slot
      ? renderSlot(slot, resume, undefined, node.slotOccurrence)
      : "";
    const content = value || escapeHtml(node.fallback ?? "");
    const style = mergedStyleAttr([
      typographyStyle(node.token ? template.tokens[node.token] : undefined),
      typographyStyle(node.style, node.textAlign),
      absoluteBoxStyle(node.box),
    ]);
    if (!style && !node.box)
      return `<span${nodeDebugAttrs(node)}>${content}</span>`;
    return `<p class="v3-text${node.box ? " v3-absolute-node" : ""}"${nodeDebugAttrs(node)}${style}>${content}</p>`;
  }
  if (node.kind === "list") {
    const items = node.slotId
      ? listValuesForSlot(node.slotId, resume, template)
      : node.items;
    if (!items.length) return "";
    return renderList(items, node.marker, node.style, nodeDebugAttrs(node));
  }
  if (node.kind === "section") {
    const style = mergedStyleAttr([
      typographyStyle(template.tokens[node.token ?? "heading"]),
      typographyStyle(node.style),
      absoluteBoxStyle(node.box),
    ]);
    return `<h2 class="v3-section-title${node.box ? " v3-absolute-node" : ""}"${nodeDebugAttrs(node)}${style}>${escapeHtml(node.title)}</h2>`;
  }
  const text = escapeHtml(node.text);
  const content = node.href
    ? `<a href="${escapeHtml(node.href)}">${text}</a>`
    : text;
  const style = mergedStyleAttr([
    typographyStyle(template.tokens[node.token ?? "body"], node.textAlign),
    typographyStyle(node.style, node.textAlign),
    absoluteBoxStyle(node.box),
  ]);
  return `<p class="v3-text${node.box ? " v3-absolute-node" : ""}"${nodeDebugAttrs(node)}${style}>${content}</p>`;
}

function renderTable(
  table: TemplateTable,
  resume: TailoredResume,
  template: DocumentTemplateV3,
): string {
  const colgroup = table.columns.length
    ? `<colgroup>${table.columns
        .map((column) =>
          column.widthPt
            ? `<col style="width:${round(column.widthPt)}pt" />`
            : column.widthPct
              ? `<col style="width:${round(column.widthPct)}%" />`
              : "<col />",
        )
        .join("")}</colgroup>`
    : "";
  const style = [
    borderCss(table.borders),
    boxCss(table.box),
    tableAlignmentCss(table.alignment),
  ].filter(Boolean);
  return `<table class="v3-table"${nodeDebugAttrs(table)}${style.length ? ` style="${style.join(";")}"` : ""}>${colgroup}<tbody>${table.rows
    .map((row, index) =>
      renderTableRowAt(table.rows, index, resume, template, table),
    )
    .join("")}</tbody></table>`;
}

function renderTableRowAt(
  rows: TemplateTableRow[],
  index: number,
  resume: TailoredResume,
  template: DocumentTemplateV3,
  table: TemplateTable,
): string {
  const row = rows[index];
  if (!row.repeatGroupId) return renderRow(row, resume, template, table, index);
  if (index > 0 && rows[index - 1]?.repeatGroupId === row.repeatGroupId) {
    return "";
  }
  const groupRows: TemplateTableRow[] = [];
  for (let cursor = index; cursor < rows.length; cursor += 1) {
    if (rows[cursor]?.repeatGroupId !== row.repeatGroupId) break;
    groupRows.push(rows[cursor]);
  }
  const repeatGroup = template.repeatGroups.find(
    (group) => group.id === row.repeatGroupId,
  );
  if (!repeatGroup)
    return groupRows
      .map((item) => renderRow(item, resume, template, table, index))
      .join("");
  const items = collectionItems(repeatGroup.collection, resume);
  if (!items.length) {
    return repeatGroup.emptyBehavior === "hide"
      ? ""
      : groupRows
          .map((item) =>
            renderConcreteRow(item, resume, template, table, undefined, index),
          )
          .join("");
  }
  return items
    .map((item, itemIndex) =>
      groupRows
        .map((groupRow) =>
          renderConcreteRow(
            groupRow,
            resume,
            template,
            table,
            {
              item,
              index: itemIndex,
            },
            rows.indexOf(groupRow),
          ),
        )
        .join(""),
    )
    .join("");
}

function renderRow(
  row: TemplateTableRow,
  resume: TailoredResume,
  template: DocumentTemplateV3,
  table?: TemplateTable,
  rowIndex = 0,
): string {
  const repeatGroup = row.repeatGroupId
    ? template.repeatGroups.find((group) => group.id === row.repeatGroupId)
    : null;
  if (repeatGroup) {
    const rows = collectionItems(repeatGroup.collection, resume).map(
      (item, index) =>
        renderConcreteRow(
          row,
          resume,
          template,
          table,
          { item, index },
          rowIndex,
        ),
    );
    if (rows.length) return rows.join("");
    if (repeatGroup.emptyBehavior === "hide") return "";
  }
  return renderConcreteRow(row, resume, template, table, undefined, rowIndex);
}

function renderConcreteRow(
  row: TemplateTableRow,
  resume: TailoredResume,
  template: DocumentTemplateV3,
  table?: TemplateTable,
  repeat?: { item: unknown; index: number },
  rowIndex = 0,
): string {
  const style = [
    row.heightPt ? `height:${round(row.heightPt)}pt` : "",
    row.fill ? fillCss(row.fill) : "",
    borderCss(row.borders),
  ].filter(Boolean);
  return `<tr class="v3-table-row"${nodeDebugAttrs(row)}${style.length ? ` style="${style.join(";")}"` : ""}>${row.cells
    .map((cell, cellIndex) =>
      renderCell(cell, resume, template, table, repeat, rowIndex, cellIndex),
    )
    .join("")}</tr>`;
}

function renderCell(
  cell: TemplateTableCell,
  resume: TailoredResume,
  template: DocumentTemplateV3,
  table?: TemplateTable,
  repeat?: { item: unknown; index: number },
  rowIndex = 0,
  cellIndex = 0,
): string {
  const style = [
    cell.widthPt ? `width:${round(cell.widthPt)}pt` : "",
    `padding:${edgeCss(cell.padding ?? table?.cellDefaults?.padding ?? defaultCellPadding)}`,
    `vertical-align:${cell.verticalAlign ?? table?.cellDefaults?.verticalAlign ?? "top"}`,
    cell.textAlign ? `text-align:${cell.textAlign}` : "",
    cell.fill
      ? fillCss(cell.fill)
      : table?.cellDefaults?.fill
        ? fillCss(table.cellDefaults.fill)
        : "",
    cellBorderCss(cell, table, rowIndex, cellIndex),
  ].filter(Boolean);
  const content = cell.nodes
    .map((node) => renderRepeatedNode(node, resume, template, repeat))
    .join("");
  return `<td class="v3-cell"${nodeDebugAttrs(cell)}${cell.colSpan ? ` colspan="${cell.colSpan}"` : ""}${cell.rowSpan ? ` rowspan="${cell.rowSpan}"` : ""}${style.length ? ` style="${style.join(";")}"` : ""}>${content}</td>`;
}

function renderRepeatedNode(
  node: TemplateNodeV3,
  resume: TailoredResume,
  template: DocumentTemplateV3,
  repeat?: { item: unknown; index: number },
): string {
  if (!repeat) return renderNode(node, resume, template);
  if (node.kind === "list" && node.slotId) {
    const slot = template.slots.find(
      (candidate) => candidate.id === node.slotId,
    );
    const value = slot ? slotValue(slot.path, resume, repeat.item) : [];
    const items = Array.isArray(value) ? value : value ? [value] : node.items;
    if (!items.length) return "";
    return renderList(
      items.map(String),
      node.marker,
      node.style,
      nodeDebugAttrs(node),
    );
  }
  if (node.kind !== "slot") return renderNode(node, resume, template);
  const slot = template.slots.find((candidate) => candidate.id === node.slotId);
  return slot ? renderSlot(slot, resume, repeat.item) : "";
}

function renderSlot(
  slot: TemplateSlotV3,
  resume: TailoredResume,
  repeatedItem?: unknown,
  occurrence?: number,
): string {
  const value = slotValue(slot.path, resume, repeatedItem, occurrence);
  if (Array.isArray(value))
    return value.map((item) => escapeHtml(item)).join(", ");
  return escapeHtml(String(value || slot.fallback || ""));
}

function renderList(
  items: string[],
  marker: "disc" | "decimal" | "dash" | "none",
  style?: Partial<TypographyTokenV3>,
  debugAttrs = "",
): string {
  return `<ul class="v3-list marker-${marker}"${debugAttrs}${typographyStyleAttr(style)}>${items
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("")}</ul>`;
}

function listValuesForSlot(
  slotId: string,
  resume: TailoredResume,
  template: DocumentTemplateV3,
): string[] {
  const slot = template.slots.find((candidate) => candidate.id === slotId);
  const value = slot ? slotValue(slot.path, resume) : [];
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function slotValue(
  path: TemplateSlotV3["path"],
  resume: TailoredResume,
  repeatedItem?: unknown,
  occurrence?: number,
): string | string[] {
  const source =
    repeatedItem && path.includes("[]")
      ? repeatedItem
      : (collectionItemForOccurrence(path, resume, occurrence) ??
        firstCollectionItem(path, resume) ??
        resume);
  switch (path) {
    case "contact.name":
      return resume.contact.name ?? "";
    case "contact.email":
      return resume.contact.email ?? "";
    case "contact.phone":
      return resume.contact.phone ?? "";
    case "contact.location":
      return resume.contact.location ?? "";
    case "contact.linkedin":
      return resume.contact.linkedin ?? "";
    case "contact.github":
      return resume.contact.github ?? "";
    case "summary":
      return resume.summary ?? "";
    case "skills[]":
      return resume.skills ?? [];
    case "certifications[]":
      return resume.certifications ?? [];
    case "awards[]":
      return resume.awards ?? [];
    case "experiences[].title":
      return prop(source, "title");
    case "experiences[].company":
      return prop(source, "company");
    case "experiences[].dates":
      return prop(source, "dates");
    case "experiences[].highlights[]":
      return occurrence === undefined
        ? arrayProp(source, "highlights")
        : flatCollectionArrayValue(
            resume.experiences,
            "highlights",
            occurrence,
          );
    case "projects[].name":
      return prop(source, "name");
    case "projects[].description":
      return prop(source, "description");
    case "projects[].highlights[]":
      return occurrence === undefined
        ? arrayProp(source, "highlights")
        : flatCollectionArrayValue(
            resume.projects ?? [],
            "highlights",
            occurrence,
          );
    case "education[].institution":
      return prop(source, "institution");
    case "education[].degree":
      return prop(source, "degree");
    case "education[].field":
      return prop(source, "field");
    case "education[].date":
      return prop(source, "date");
    default:
      return "";
  }
}

function firstCollectionItem(
  path: TemplateSlotV3["path"],
  resume: TailoredResume,
): unknown | null {
  if (path.startsWith("experiences[]")) return resume.experiences[0] ?? null;
  if (path.startsWith("projects[]")) return resume.projects?.[0] ?? null;
  if (path.startsWith("education[]")) return resume.education[0] ?? null;
  return null;
}

function collectionItemForOccurrence(
  path: TemplateSlotV3["path"],
  resume: TailoredResume,
  occurrence?: number,
): unknown | null {
  if (occurrence === undefined || occurrence < 0) return null;
  if (path.endsWith(".highlights[]")) return null;
  if (path.startsWith("experiences[]"))
    return resume.experiences[occurrence] ?? null;
  if (path.startsWith("projects[]"))
    return resume.projects?.[occurrence] ?? null;
  if (path.startsWith("education[]"))
    return resume.education[occurrence] ?? null;
  return null;
}

function flatCollectionArrayValue(
  collection: unknown[],
  key: string,
  occurrence: number,
): string {
  let cursor = 0;
  for (const item of collection) {
    const values = arrayProp(item, key);
    for (const value of values) {
      if (cursor === occurrence) return value;
      cursor += 1;
    }
  }
  return "";
}

function collectionItems(
  collection:
    | "experiences"
    | "projects"
    | "education"
    | "skills"
    | "certifications"
    | "awards",
  resume: TailoredResume,
): unknown[] {
  const value = resume[collection as keyof TailoredResume];
  return Array.isArray(value) ? value : [];
}

function prop(source: unknown, key: string): string {
  return typeof source === "object" && source && key in source
    ? String((source as Record<string, unknown>)[key] ?? "")
    : "";
}

function arrayProp(source: unknown, key: string): string[] {
  const value =
    typeof source === "object" && source
      ? (source as Record<string, unknown>)[key]
      : null;
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function tokenFor(
  template: DocumentTemplateV3,
  key: string,
  fallback: TypographyTokenV3,
): TypographyTokenV3 {
  return template.tokens[key] ?? fallback;
}

function tokenStyleAttr(
  template: DocumentTemplateV3,
  key: string,
  alignment?: string,
  override?: Partial<TypographyTokenV3>,
): string {
  const token = { ...(template.tokens[key] ?? {}), ...(override ?? {}) };
  return typographyStyleAttr(token, alignment);
}

function typographyStyleAttr(
  token: Partial<TypographyTokenV3> | undefined,
  alignment?: string,
): string {
  return mergedStyleAttr([typographyStyle(token, alignment)]);
}

function typographyStyle(
  token: Partial<TypographyTokenV3> | undefined,
  alignment?: string,
): string {
  return [
    token?.fontFamily ? `font-family:${token.fontFamily}` : "",
    token?.fontSize ? `font-size:${token.fontSize}` : "",
    token?.lineHeight ? `line-height:${token.lineHeight}` : "",
    token?.color ? `color:${token.color}` : "",
    token?.fontWeight ? `font-weight:${token.fontWeight}` : "",
    token?.fontStyle ? `font-style:${token.fontStyle}` : "",
    token?.textTransform ? `text-transform:${token.textTransform}` : "",
    token?.letterSpacing ? `letter-spacing:${token.letterSpacing}` : "",
    alignment ? `text-align:${alignment}` : "",
  ]
    .filter(Boolean)
    .join(";");
}

function absoluteBoxStyle(box?: {
  xPt?: number;
  yPt?: number;
  widthPt?: number;
  heightPt?: number;
}): string {
  if (!box) return "";
  return [
    box.xPt !== undefined ? `left:${round(box.xPt)}pt` : "",
    box.yPt !== undefined ? `top:${round(box.yPt)}pt` : "",
    box.widthPt ? `width:${round(box.widthPt)}pt` : "",
    box.heightPt ? `min-height:${round(box.heightPt)}pt` : "",
  ]
    .filter(Boolean)
    .join(";");
}

function mergedStyleAttr(styles: string[]): string {
  const style = styles.filter(Boolean).join(";");
  return style ? ` style="${style}"` : "";
}

function nodeDebugAttrs(
  node: Pick<TemplateNodeV3, "id" | "sourceRef">,
): string {
  const attrs = [`data-v3-node-id="${escapeHtml(node.id)}"`];
  if (node.sourceRef?.sourceId) {
    attrs.push(`data-source-id="${escapeHtml(node.sourceRef.sourceId)}"`);
  }
  return ` ${attrs.join(" ")}`;
}

const defaultCellPadding: BoxEdges = {
  top: "2pt",
  right: "3pt",
  bottom: "2pt",
  left: "3pt",
};

function edgeCss(edges: BoxEdges): string {
  return `${edges.top} ${edges.right} ${edges.bottom} ${edges.left}`;
}

function fillCss(fill: FillStyle): string {
  return `background:${fill.color}`;
}

function borderCss(borders?: BorderSet): string {
  if (!borders) return "";
  return [
    sideBorderCss("top", borders.top),
    sideBorderCss("right", borders.right),
    sideBorderCss("bottom", borders.bottom),
    sideBorderCss("left", borders.left),
  ]
    .filter(Boolean)
    .join(";");
}

function cellBorderCss(
  cell: TemplateTableCell,
  table: TemplateTable | undefined,
  rowIndex: number,
  cellIndex: number,
): string {
  const explicit = cell.borders ?? table?.cellDefaults?.borders;
  const borders = borderCss(explicit).split(";").filter(Boolean);
  if (rowIndex > 0 && !explicit?.top && table?.borders?.insideH) {
    borders.push(sideBorderCss("top", table.borders.insideH));
  }
  if (cellIndex > 0 && !explicit?.left && table?.borders?.insideV) {
    borders.push(sideBorderCss("left", table.borders.insideV));
  }
  return borders.join(";");
}

function sideBorderCss(side: string, border?: BorderStyle): string {
  if (!border) return "";
  if (border.style === "none" || border.widthPt <= 0) {
    return `border-${side}:0`;
  }
  return `border-${side}:${round(border.widthPt)}pt ${border.style} ${border.color}`;
}

function boxCss(box?: { widthPt?: number; heightPt?: number }): string {
  if (!box) return "";
  return [
    box.widthPt ? `width:${round(box.widthPt)}pt` : "",
    box.heightPt ? `height:${round(box.heightPt)}pt` : "",
  ]
    .filter(Boolean)
    .join(";");
}

function tableAlignmentCss(alignment?: TemplateTable["alignment"]): string {
  if (alignment === "center") return "margin-left:auto;margin-right:auto";
  if (alignment === "right") return "margin-left:auto;margin-right:0";
  if (alignment === "left") return "margin-left:0;margin-right:auto";
  return "";
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
