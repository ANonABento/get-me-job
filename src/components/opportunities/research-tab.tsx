"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ExternalLink,
  Github,
  Loader2,
  MessageCircle,
  Newspaper,
  RefreshCw,
  Rss,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { readJsonResponse } from "@/lib/http";
import { formatRelativeTime } from "@/lib/utils";
import type {
  CompanyEnrichment,
  EnrichmentSourceResult,
  EnrichmentSourceData,
  GitHubEnrichment,
  HnEnrichment,
  LevelsEnrichment,
  NewsEnrichment,
  BlogEnrichment,
} from "@/lib/enrichment/types";

interface EnrichResponse {
  company: string;
  enrichment: CompanyEnrichment;
  enrichedAt: string;
  fromCache: boolean;
}

interface ResearchTabProps {
  opportunityId: string;
  companyName: string;
}

function formatUSD(value: number | null): string {
  if (value === null) return "?";
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}k`;
  return `$${value}`;
}

function StatusLabel<T extends EnrichmentSourceData>({
  result,
  emptyMessage,
}: {
  result: EnrichmentSourceResult<T>;
  emptyMessage: string;
}) {
  if (result.status === "ok") return null;
  return (
    <p className="text-sm text-muted-foreground">
      {result.status === "error"
        ? `Could not load (${result.error ?? "unknown error"}).`
        : emptyMessage}
    </p>
  );
}

function GitHubSection({
  result,
}: {
  result: EnrichmentSourceResult<GitHubEnrichment>;
}) {
  return (
    <section className="rounded-lg border bg-card">
      <header className="flex items-center justify-between border-b px-5 py-4">
        <div className="flex items-center gap-2">
          <Github className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-base font-semibold">GitHub</h3>
        </div>
        {result.data?.url ? (
          <a
            href={result.data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            View org <ExternalLink className="h-3 w-3" />
          </a>
        ) : null}
      </header>
      <div className="space-y-3 px-5 py-4">
        <StatusLabel
          result={result}
          emptyMessage="No public GitHub org detected."
        />
        {result.data ? (
          <>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <div className="text-muted-foreground">Total stars</div>
                <div className="font-medium">
                  {result.data.totalStars.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Active repos</div>
                <div className="font-medium">{result.data.publicRepoCount}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Last push</div>
                <div className="font-medium">
                  {result.data.recentActivityAt
                    ? formatRelativeTime(result.data.recentActivityAt)
                    : "Unknown"}
                </div>
              </div>
            </div>
            {result.data.topLanguages.length > 0 ? (
              <div className="text-sm">
                <span className="text-muted-foreground">Top languages:</span>{" "}
                {result.data.topLanguages.join(", ")}
              </div>
            ) : null}
            {result.data.topRepos.length > 0 ? (
              <ul className="space-y-2">
                {result.data.topRepos.map((repo) => (
                  <li
                    key={repo.url}
                    className="rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline"
                      >
                        {repo.name}
                      </a>
                      <span className="text-muted-foreground">
                        ★ {repo.stars.toLocaleString()}
                      </span>
                    </div>
                    {repo.description ? (
                      <p className="mt-1 text-muted-foreground">
                        {repo.description}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        ) : null}
      </div>
    </section>
  );
}

function NewsSection({
  result,
}: {
  result: EnrichmentSourceResult<NewsEnrichment>;
}) {
  return (
    <section className="rounded-lg border bg-card">
      <header className="flex items-center gap-2 border-b px-5 py-4">
        <Newspaper className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-base font-semibold">Recent news (7d)</h3>
      </header>
      <div className="space-y-3 px-5 py-4">
        <StatusLabel
          result={result}
          emptyMessage="No recent headlines."
        />
        {result.data ? (
          <ul className="space-y-2">
            {result.data.headlines.map((headline) => (
              <li
                key={headline.link}
                className="rounded-md border bg-background px-3 py-2 text-sm"
              >
                <a
                  href={headline.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline"
                >
                  {headline.title}
                </a>
                <div className="mt-1 text-xs text-muted-foreground">
                  {headline.source ?? "Unknown source"}
                  {headline.publishedAt
                    ? ` · ${formatRelativeTime(headline.publishedAt)}`
                    : ""}
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

function LevelsSection({
  result,
}: {
  result: EnrichmentSourceResult<LevelsEnrichment>;
}) {
  return (
    <section className="rounded-lg border bg-card">
      <header className="flex items-center justify-between border-b px-5 py-4">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-base font-semibold">Salary ranges</h3>
        </div>
        {result.data?.url ? (
          <a
            href={result.data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            levels.fyi <ExternalLink className="h-3 w-3" />
          </a>
        ) : null}
      </header>
      <div className="space-y-3 px-5 py-4">
        <StatusLabel
          result={result}
          emptyMessage="No public salary ranges available."
        />
        {result.data ? (
          <ul className="space-y-2">
            {result.data.ranges.map((range) => (
              <li
                key={`${range.role}-${range.level ?? "any"}`}
                className="rounded-md border bg-background px-3 py-2 text-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium">
                    {range.role}
                    {range.level ? (
                      <span className="ml-2 text-muted-foreground">
                        {range.level}
                      </span>
                    ) : null}
                  </div>
                  <div className="text-muted-foreground">
                    {formatUSD(range.totalCompMin)} –{" "}
                    {formatUSD(range.totalCompMax)} {range.currency}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

function BlogSection({
  result,
}: {
  result: EnrichmentSourceResult<BlogEnrichment>;
}) {
  return (
    <section className="rounded-lg border bg-card">
      <header className="flex items-center justify-between border-b px-5 py-4">
        <div className="flex items-center gap-2">
          <Rss className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-base font-semibold">Engineering blog</h3>
        </div>
        {result.data?.blogUrl ? (
          <a
            href={result.data.blogUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Visit blog <ExternalLink className="h-3 w-3" />
          </a>
        ) : null}
      </header>
      <div className="space-y-3 px-5 py-4">
        <StatusLabel
          result={result}
          emptyMessage="No company blog detected."
        />
        {result.data ? (
          <ul className="space-y-2">
            {result.data.posts.map((post) => (
              <li
                key={post.url}
                className="rounded-md border bg-background px-3 py-2 text-sm"
              >
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline"
                >
                  {post.title}
                </a>
                <p className="mt-1 text-muted-foreground">{post.excerpt}</p>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

function HnSection({
  result,
}: {
  result: EnrichmentSourceResult<HnEnrichment>;
}) {
  return (
    <section className="rounded-lg border bg-card">
      <header className="flex items-center gap-2 border-b px-5 py-4">
        <MessageCircle className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-base font-semibold">Hacker News (30d)</h3>
      </header>
      <div className="space-y-3 px-5 py-4">
        <StatusLabel
          result={result}
          emptyMessage="No recent HN mentions."
        />
        {result.data ? (
          <ul className="space-y-2">
            {result.data.mentions.map((mention) => (
              <li
                key={mention.hnUrl}
                className="rounded-md border bg-background px-3 py-2 text-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <a
                    href={mention.url ?? mention.hnUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    {mention.title}
                  </a>
                  <a
                    href={mention.hnUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:underline"
                  >
                    {mention.points} pts · {mention.numComments} comments
                  </a>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

export function OpportunityResearchTab({
  opportunityId,
  companyName,
}: ResearchTabProps) {
  const [data, setData] = useState<EnrichResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEnrichment = useCallback(
    async (refresh: boolean) => {
      setLoading(true);
      setError(null);
      try {
        const url = `/api/companies/${encodeURIComponent(opportunityId)}/enrich${refresh ? "?refresh=true" : ""}`;
        const response = await fetch(url);
        const payload = await readJsonResponse<EnrichResponse>(
          response,
          "Failed to load company research",
        );
        setData(payload);
      } catch (caught) {
        setError(
          caught instanceof Error ? caught.message : "Failed to load research",
        );
      } finally {
        setLoading(false);
      }
    },
    [opportunityId],
  );

  useEffect(() => {
    void loadEnrichment(false);
  }, [loadEnrichment]);

  const enrichment = data?.enrichment;
  const enrichedLabel = useMemo(() => {
    if (!data) return null;
    return `Updated ${formatRelativeTime(data.enrichedAt)}${
      data.fromCache ? " · cached" : ""
    }`;
  }, [data]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Company research</h2>
          <p className="text-sm text-muted-foreground">
            Public-data dossier for {companyName}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {enrichedLabel ? (
            <span className="text-xs text-muted-foreground">
              {enrichedLabel}
            </span>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void loadEnrichment(true)}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-1.5 h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {!enrichment && loading ? (
        <div className="flex items-center justify-center rounded-lg border bg-card py-12">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : null}

      {enrichment ? (
        <div className="grid gap-4">
          <GitHubSection result={enrichment.github} />
          <NewsSection result={enrichment.news} />
          <LevelsSection result={enrichment.levels} />
          <BlogSection result={enrichment.blog} />
          <HnSection result={enrichment.hn} />
        </div>
      ) : null}
    </div>
  );
}
