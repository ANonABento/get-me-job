import type { CommandItem } from "@/lib/command-palette";

export interface SearchGroup {
  id: string;
  label: string;
  items: CommandItem[];
}

interface SearchProvider {
  id: string;
  label: string;
  fetcher: (query: string, signal: AbortSignal) => Promise<CommandItem[]>;
}

type ApiRecord = Record<string, unknown>;

function asRecord(value: unknown): ApiRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as ApiRecord)
    : {};
}

function asArray(value: unknown): ApiRecord[] {
  return Array.isArray(value) ? value.map(asRecord) : [];
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function getItems(data: ApiRecord, key: string): ApiRecord[] {
  return asArray(data.items).length > 0
    ? asArray(data.items)
    : asArray(data[key]);
}

function includesQuery(
  query: string,
  values: Array<string | undefined>,
): boolean {
  const normalized = query.toLowerCase();
  return values.some((value) => value?.toLowerCase().includes(normalized));
}

async function fetchJson(
  path: string,
  signal: AbortSignal,
): Promise<ApiRecord> {
  const response = await fetch(path, { signal });
  if (!response.ok) return {};
  return asRecord(await response.json());
}

async function searchOpportunities(
  query: string,
  signal: AbortSignal,
): Promise<CommandItem[]> {
  const data = await fetchJson("/api/opportunities?limit=10", signal);
  return getItems(data, "opportunities")
    .filter((item) =>
      includesQuery(query, [text(item.title), text(item.company)]),
    )
    .slice(0, 5)
    .map((item) => ({
      id: `opportunity-${text(item.id)}`,
      label: text(item.title) || "Untitled opportunity",
      description: text(item.company),
      category: "opportunities",
      href: `/opportunities?highlight=${encodeURIComponent(text(item.id))}`,
      keywords: [text(item.company), text(item.status)].filter(Boolean),
    }));
}

async function searchBank(
  query: string,
  signal: AbortSignal,
): Promise<CommandItem[]> {
  const data = await fetchJson(
    `/api/bank?q=${encodeURIComponent(query)}&limit=10`,
    signal,
  );
  return getItems(data, "entries")
    .slice(0, 5)
    .map((item) => ({
      id: `bank-${text(item.id)}`,
      label: text(item.content).slice(0, 90) || "Profile bank entry",
      description: text(item.category),
      category: "bank",
      href: `/bank?q=${encodeURIComponent(query)}`,
      keywords: [text(item.category), text(item.content)].filter(Boolean),
    }));
}

async function searchAnswerBank(
  query: string,
  signal: AbortSignal,
): Promise<CommandItem[]> {
  const data = await fetchJson("/api/answer-bank?limit=10", signal);
  return getItems(data, "answers")
    .filter((item) =>
      includesQuery(query, [text(item.question), text(item.answer)]),
    )
    .slice(0, 5)
    .map((item) => ({
      id: `answer-${text(item.id)}`,
      label: text(item.question) || "Saved answer",
      description: text(item.sourceCompany) || text(item.source),
      category: "answer-bank",
      href: "/answers",
      keywords: [text(item.answer), text(item.sourceCompany)].filter(Boolean),
    }));
}

async function searchEmails(
  query: string,
  signal: AbortSignal,
): Promise<CommandItem[]> {
  const [draftData, templateData] = await Promise.all([
    fetchJson("/api/email/drafts?limit=10", signal),
    fetchJson("/api/templates", signal),
  ]);
  const drafts = getItems(draftData, "drafts")
    .filter((item) =>
      includesQuery(query, [text(item.subject), text(item.body)]),
    )
    .slice(0, 3)
    .map((item) => ({
      id: `email-draft-${text(item.id)}`,
      label: text(item.subject) || "Email draft",
      description: "Draft",
      category: "emails" as const,
      href: "/emails",
      keywords: [text(item.type), text(item.body)].filter(Boolean),
    }));
  const templates = getItems(templateData, "templates")
    .filter((item) =>
      includesQuery(query, [text(item.name), text(item.description)]),
    )
    .slice(0, 2)
    .map((item) => ({
      id: `template-${text(item.id)}`,
      label: text(item.name) || "Email template",
      description: text(item.description) || "Template",
      category: "emails" as const,
      href: "/studio",
      keywords: [text(item.type)].filter(Boolean),
    }));
  return [...drafts, ...templates];
}

function searchSettings(query: string): CommandItem[] {
  const settings: CommandItem[] = [
    {
      id: "setting-llm",
      label: "LLM settings",
      description: "Provider and model configuration",
      category: "settings",
      href: "/settings",
      keywords: ["ai", "model", "provider"],
    },
    {
      id: "setting-theme",
      label: "Theme settings",
      description: "Light, dark, and system appearance",
      category: "settings",
      href: "/settings",
      keywords: ["appearance", "dark", "light"],
    },
    {
      id: "setting-locale",
      label: "Locale settings",
      description: "Language and regional preferences",
      category: "settings",
      href: "/settings",
      keywords: ["language", "region"],
    },
    {
      id: "setting-profile",
      label: "Profile",
      description: "Personal profile and resume source data",
      category: "settings",
      href: "/profile",
      keywords: ["account", "personal"],
    },
  ];

  return settings.filter((item) =>
    includesQuery(query, [
      item.label,
      item.description,
      ...(item.keywords ?? []),
    ]),
  );
}

const providers: SearchProvider[] = [
  { id: "opportunities", label: "Opportunities", fetcher: searchOpportunities },
  { id: "bank", label: "Bank", fetcher: searchBank },
  { id: "answer-bank", label: "Answer Bank", fetcher: searchAnswerBank },
  { id: "emails", label: "Emails", fetcher: searchEmails },
  {
    id: "settings",
    label: "Settings & Profile",
    fetcher: async (query) => searchSettings(query),
  },
];

export async function runSearchProviders(
  query: string,
  signal: AbortSignal,
): Promise<SearchGroup[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const results = await Promise.allSettled(
    providers.map(async (provider) => ({
      id: provider.id,
      label: provider.label,
      items: await provider.fetcher(trimmed, signal),
    })),
  );

  return results
    .filter(
      (result): result is PromiseFulfilledResult<SearchGroup> =>
        result.status === "fulfilled" && result.value.items.length > 0,
    )
    .map((result) => result.value);
}
