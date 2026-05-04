import {
  DEFAULT_TIMEOUT_MS,
  fetchWithTimeout,
} from "./utils";
import type { EnrichmentSourceResult, GitHubEnrichment, GitHubRepoSummary } from "./types";

interface GithubRepoApi {
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  pushed_at: string | null;
  fork?: boolean;
  archived?: boolean;
}

const REPOS_PER_PAGE = 30;

export function parseGithubRepos(repos: GithubRepoApi[]): GitHubEnrichment {
  const active = repos.filter((repo) => !repo.fork && !repo.archived);
  const sorted = [...active].sort(
    (a, b) => (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0),
  );

  const totalStars = active.reduce(
    (sum, repo) => sum + (repo.stargazers_count ?? 0),
    0,
  );

  const languageCounts = new Map<string, number>();
  for (const repo of active) {
    if (!repo.language) continue;
    languageCounts.set(repo.language, (languageCounts.get(repo.language) ?? 0) + 1);
  }
  const topLanguages = [...languageCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([language]) => language);

  const recentActivityAt = active
    .map((repo) => repo.pushed_at)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1) ?? null;

  const topRepos: GitHubRepoSummary[] = sorted.slice(0, 5).map((repo) => ({
    name: repo.name,
    url: repo.html_url,
    description: repo.description,
    stars: repo.stargazers_count ?? 0,
    language: repo.language,
  }));

  return {
    org: "",
    url: "",
    totalStars,
    publicRepoCount: active.length,
    topLanguages,
    topRepos,
    recentActivityAt,
  };
}

export async function fetchGithubEnrichment(
  org: string,
  options: { timeoutMs?: number } = {},
): Promise<EnrichmentSourceResult<GitHubEnrichment>> {
  const trimmed = org.trim();
  if (!trimmed) {
    return { status: "no_data", data: null };
  }

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const url = `https://api.github.com/orgs/${encodeURIComponent(trimmed)}/repos?per_page=${REPOS_PER_PAGE}&sort=updated`;

  try {
    const response = await fetchWithTimeout(
      url,
      {
        headers: {
          accept: "application/vnd.github+json",
          "x-github-api-version": "2022-11-28",
        },
      },
      timeoutMs,
    );

    if (response.status === 404) {
      return { status: "no_data", data: null };
    }
    if (!response.ok) {
      return {
        status: "error",
        data: null,
        error: `github status ${response.status}`,
      };
    }

    const repos = (await response.json()) as GithubRepoApi[];
    if (!Array.isArray(repos)) {
      return { status: "error", data: null, error: "unexpected response" };
    }
    if (repos.length === 0) {
      return { status: "no_data", data: null };
    }

    const parsed = parseGithubRepos(repos);
    return {
      status: "ok",
      data: {
        ...parsed,
        org: trimmed,
        url: `https://github.com/${trimmed}`,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    return { status: "error", data: null, error: message };
  }
}
