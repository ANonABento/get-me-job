function formatListHighlight(
  label: string,
  items: unknown[] | undefined
): string | null {
  if (!items || items.length === 0) return null;

  const values = items.map((item) => String(item).trim()).filter(Boolean);
  return values.length > 0 ? `${label}: ${values.join(", ")}` : null;
}

export function formatHackathonHighlights(
  content: Record<string, unknown>
): string[] {
  const highlights = [
    Array.isArray(content.prizes)
      ? formatListHighlight("Prizes", content.prizes)
      : null,
    Array.isArray(content.tracks)
      ? formatListHighlight("Tracks", content.tracks)
      : null,
    Array.isArray(content.themes)
      ? formatListHighlight("Themes", content.themes)
      : null,
    content.notes ? String(content.notes).trim() : null,
  ];

  return highlights.filter((highlight): highlight is string => Boolean(highlight));
}
