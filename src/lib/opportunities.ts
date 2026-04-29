import { generateId } from "@/lib/utils";
import {
  createOpportunitySchema,
  opportunitySchema,
  opportunityFiltersSchema,
  updateOpportunitySchema,
  type CreateOpportunityInput,
  type Opportunity,
  type OpportunityFilters,
  type OpportunityStatus,
  type UpdateOpportunityInput,
} from "@/types/opportunity";

export const OPPORTUNITIES_STORAGE_KEY = "taida.opportunities.v1";

export interface OpportunityStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface OpportunityClock {
  now(): Date;
}

const memoryStorage = new Map<string, string>();

export const inMemoryOpportunityStorage: OpportunityStorage = {
  getItem: (key) => memoryStorage.get(key) ?? null,
  setItem: (key, value) => {
    memoryStorage.set(key, value);
  },
  removeItem: (key) => {
    memoryStorage.delete(key);
  },
};

const systemClock: OpportunityClock = {
  now: () => new Date(),
};

export function getDefaultOpportunityStorage(): OpportunityStorage {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }

  return inMemoryOpportunityStorage;
}

export function parseOpportunityFilters(
  searchParams: URLSearchParams
): OpportunityFilters {
  const rawFilters = {
    type: searchParams.get("type") || undefined,
    status: searchParams.get("status") || undefined,
    source: searchParams.get("source") || undefined,
    tags: parseCommaSeparated(searchParams.get("tags")),
    search:
      searchParams.get("search") || searchParams.get("q") || undefined,
  };

  return opportunityFiltersSchema.parse(rawFilters);
}

export function listOpportunities(
  userId = "default",
  filters: OpportunityFilters = {},
  storage: OpportunityStorage = getDefaultOpportunityStorage()
): Opportunity[] {
  return filterOpportunities(readOpportunities(userId, storage), filters).sort(
    (a, b) => b.createdAt.localeCompare(a.createdAt)
  );
}

export function getOpportunity(
  id: string,
  userId = "default",
  storage: OpportunityStorage = getDefaultOpportunityStorage()
): Opportunity | null {
  return (
    readOpportunities(userId, storage).find((item) => item.id === id) ?? null
  );
}

export function createOpportunity(
  input: CreateOpportunityInput,
  userId = "default",
  storage: OpportunityStorage = getDefaultOpportunityStorage(),
  clock: OpportunityClock = systemClock
): Opportunity {
  const data = createOpportunitySchema.parse(input);
  const now = clock.now().toISOString();
  const opportunity = applyStatusTimestamps(
    {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    },
    now
  );

  writeOpportunities(
    userId,
    [opportunity, ...readOpportunities(userId, storage)],
    storage
  );
  return opportunity;
}

export function updateOpportunity(
  id: string,
  updates: UpdateOpportunityInput,
  userId = "default",
  storage: OpportunityStorage = getDefaultOpportunityStorage(),
  clock: OpportunityClock = systemClock
): Opportunity | null {
  const data = updateOpportunitySchema.parse(updates);
  const existing = readOpportunities(userId, storage);
  const index = existing.findIndex((item) => item.id === id);

  if (index === -1) return null;

  const now = clock.now().toISOString();
  const updated = applyStatusTimestamps(
    opportunitySchema.parse({
      ...existing[index],
      ...data,
      updatedAt: now,
    }),
    now
  );

  const next = [...existing];
  next[index] = updated;
  writeOpportunities(userId, next, storage);
  return updated;
}

export function changeOpportunityStatus(
  id: string,
  status: OpportunityStatus,
  userId = "default",
  storage: OpportunityStorage = getDefaultOpportunityStorage(),
  clock: OpportunityClock = systemClock
): Opportunity | null {
  return updateOpportunity(id, { status }, userId, storage, clock);
}

export function deleteOpportunity(
  id: string,
  userId = "default",
  storage: OpportunityStorage = getDefaultOpportunityStorage()
): boolean {
  const existing = readOpportunities(userId, storage);
  const next = existing.filter((item) => item.id !== id);

  if (next.length === existing.length) return false;

  writeOpportunities(userId, next, storage);
  return true;
}

export function filterOpportunities(
  opportunities: Opportunity[],
  filters: OpportunityFilters
): Opportunity[] {
  const normalizedSearch = filters.search?.trim().toLowerCase();
  const normalizedTags = filters.tags?.map((tag) => tag.toLowerCase()) ?? [];

  return opportunities.filter((opportunity) => {
    if (filters.type && opportunity.type !== filters.type) return false;
    if (filters.status && opportunity.status !== filters.status) return false;
    if (filters.source && opportunity.source !== filters.source) return false;

    if (
      normalizedTags.length > 0 &&
      !normalizedTags.every((tag) =>
        opportunity.tags.some(
          (opportunityTag) => opportunityTag.toLowerCase() === tag
        )
      )
    ) {
      return false;
    }

    if (
      normalizedSearch &&
      !getSearchText(opportunity).includes(normalizedSearch)
    ) {
      return false;
    }

    return true;
  });
}

export function clearOpportunitiesForUser(
  userId = "default",
  storage: OpportunityStorage = getDefaultOpportunityStorage()
): void {
  storage.removeItem(getUserStorageKey(userId));
}

function readOpportunities(
  userId: string,
  storage: OpportunityStorage
): Opportunity[] {
  const raw = storage.getItem(getUserStorageKey(userId));
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.flatMap((item) => {
      const result = opportunitySchema.safeParse(item);
      return result.success ? [result.data] : [];
    });
  } catch {
    return [];
  }
}

function writeOpportunities(
  userId: string,
  opportunities: Opportunity[],
  storage: OpportunityStorage
): void {
  storage.setItem(getUserStorageKey(userId), JSON.stringify(opportunities));
}

function getUserStorageKey(userId: string): string {
  return `${OPPORTUNITIES_STORAGE_KEY}:${userId}`;
}

function parseCommaSeparated(value: string | null): string[] | undefined {
  if (!value) return undefined;

  const items = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return items.length > 0 ? items : undefined;
}

function getSearchText(opportunity: Opportunity): string {
  return [opportunity.title, opportunity.company, opportunity.summary]
    .join(" ")
    .toLowerCase();
}

function applyStatusTimestamps<T extends Opportunity>(
  opportunity: T,
  timestamp: string
): T {
  if (opportunity.status === "saved" && !opportunity.savedAt) {
    return { ...opportunity, savedAt: timestamp };
  }

  if (opportunity.status === "applied" && !opportunity.appliedAt) {
    return { ...opportunity, appliedAt: timestamp };
  }

  return opportunity;
}
