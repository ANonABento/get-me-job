import { fetchBlogEnrichment } from "./blog";
import { fetchGithubEnrichment } from "./github";
import { fetchHnEnrichment } from "./hn";
import { fetchLevelsEnrichment } from "./levels";
import { fetchNewsEnrichment } from "./news";
import { guessGithubOrg } from "./utils";
import type {
  CompanyEnrichment,
  EnrichmentInput,
  EnrichmentSourceData,
  EnrichmentSourceResult,
} from "./types";

function settledToResult<T extends EnrichmentSourceData>(
  result: PromiseSettledResult<EnrichmentSourceResult<T>>,
): EnrichmentSourceResult<T> {
  if (result.status === "fulfilled") return result.value;
  const message =
    result.reason instanceof Error ? result.reason.message : "rejected";
  return { status: "error", data: null, error: message };
}

export async function enrichCompany(
  input: EnrichmentInput,
): Promise<CompanyEnrichment> {
  const company = input.company.trim();
  const githubOrg = (input.githubOrg ?? guessGithubOrg(company, input.sourceUrl)).trim();

  const [github, news, levels, blog, hn] = await Promise.allSettled([
    fetchGithubEnrichment(githubOrg),
    fetchNewsEnrichment(company),
    fetchLevelsEnrichment(company),
    fetchBlogEnrichment(input.sourceUrl ?? null),
    fetchHnEnrichment(company),
  ]);

  return {
    company,
    github: settledToResult(github),
    news: settledToResult(news),
    levels: settledToResult(levels),
    blog: settledToResult(blog),
    hn: settledToResult(hn),
  };
}

export type {
  BlogEnrichment,
  BlogPostSnippet,
  CompanyEnrichment,
  EnrichmentInput,
  EnrichmentSourceKey,
  EnrichmentSourceResult,
  GitHubEnrichment,
  GitHubRepoSummary,
  HnEnrichment,
  HnMention,
  LevelsEnrichment,
  LevelsRange,
  NewsEnrichment,
  NewsHeadline,
} from "./types";
