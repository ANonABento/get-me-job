export interface GitHubRepoSummary {
  name: string;
  url: string;
  description: string | null;
  stars: number;
  language: string | null;
}

export interface GitHubEnrichment {
  org: string;
  url: string;
  totalStars: number;
  publicRepoCount: number;
  topLanguages: string[];
  topRepos: GitHubRepoSummary[];
  recentActivityAt: string | null;
}

export interface NewsHeadline {
  title: string;
  link: string;
  source: string | null;
  publishedAt: string | null;
}

export interface NewsEnrichment {
  query: string;
  headlines: NewsHeadline[];
}

export interface LevelsRange {
  role: string;
  level: string | null;
  totalCompMin: number | null;
  totalCompMax: number | null;
  currency: string;
}

export interface LevelsEnrichment {
  url: string;
  ranges: LevelsRange[];
}

export interface BlogPostSnippet {
  title: string;
  url: string;
  excerpt: string;
}

export interface BlogEnrichment {
  blogUrl: string;
  posts: BlogPostSnippet[];
}

export interface HnMention {
  title: string;
  url: string | null;
  hnUrl: string;
  points: number;
  numComments: number;
  createdAt: string;
}

export interface HnEnrichment {
  query: string;
  mentions: HnMention[];
}

export type EnrichmentSourceKey =
  | "github"
  | "news"
  | "levels"
  | "blog"
  | "hn";

export type EnrichmentSourceData =
  | GitHubEnrichment
  | NewsEnrichment
  | LevelsEnrichment
  | BlogEnrichment
  | HnEnrichment;

export interface EnrichmentSourceResult<T extends EnrichmentSourceData> {
  status: "ok" | "no_data" | "error";
  data: T | null;
  error?: string;
}

export interface CompanyEnrichment {
  company: string;
  github: EnrichmentSourceResult<GitHubEnrichment>;
  news: EnrichmentSourceResult<NewsEnrichment>;
  levels: EnrichmentSourceResult<LevelsEnrichment>;
  blog: EnrichmentSourceResult<BlogEnrichment>;
  hn: EnrichmentSourceResult<HnEnrichment>;
}

export interface EnrichmentInput {
  company: string;
  sourceUrl?: string | null;
  githubOrg?: string | null;
}
