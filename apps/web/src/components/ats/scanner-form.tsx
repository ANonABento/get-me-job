"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import {
  AlertCircle,
  CheckCircle2,
  FileSearch,
  FileText,
  Link as LinkIcon,
  Loader2,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatFileSize } from "@/lib/utils";
import {
  scanResume,
  type ATSAnalysisResult,
  type ATSScanResult,
  type FileMeta,
} from "@/lib/ats/analyzer";
import { pluralize } from "@/lib/text/pluralize";
import { textToProfile, textToJob } from "@/lib/ats/text-to-profile";
import { computeJdMatch, type JdMatchResult } from "@/lib/ats/match-score";
import { nowIso } from "@/lib/format/time";
import type { JobDescription, Profile } from "@/types";
import type { PdfLayoutReport } from "@/lib/ats/pdf-layout";
import { ScoreDisplay } from "./score-display";
import { FixSuggestionsList } from "./fix-suggestions";
import { JdMatchCard } from "./jd-match-card";
import { ContentInsightsCard } from "@/components/ats/content-insights-card";
import { PlatformCard } from "@/components/ats/platform-card";
import { ReferralHint } from "@/components/ats/referral-hint";
import { ResultQualityCard } from "@/components/result-quality/result-quality-card";
import { detectAndDescribe } from "@/lib/ats/platform-detection";
import {
  evaluateResultQuality,
  type ResultQualityRubric,
} from "@/lib/result-quality/rubric";
import { useA11yTranslations } from "@/lib/i18n/use-a11y-translations";

const MIN_RESUME_LENGTH = 50;
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;

interface ParseResponse {
  profile: Partial<Profile>;
  sectionsDetected: string[];
  confidence: number;
  warnings: string[];
  pdfLayout?: PdfLayoutReport;
}

type ParseErrorCode =
  | "file_too_large"
  | "password_protected"
  | "invalid_file_type"
  | "invalid_file_content";

const API_PARSE_ERROR_MESSAGES: Record<ParseErrorCode, string> = {
  file_too_large: `File too large. Maximum size is ${formatFileSize(MAX_UPLOAD_SIZE)}.`,
  password_protected:
    "This PDF is password-protected. Remove the password and try again.",
  invalid_file_type: "Upload a PDF or TXT file.",
  invalid_file_content:
    "The file content does not match its type. Upload a valid PDF or TXT file.",
};

interface ScrapedOpportunity {
  title: string;
  company: string;
  description: string;
  requirements?: string[];
  responsibilities?: string[];
  keywords?: string[];
  url?: string;
}

interface ScannerFormProps {
  locale?: string;
  /**
   * Optional initial value for the job description textarea. Used by the
   * in-app `/ats` page when the user picks a saved opportunity. Only
   * seeds the first render; subsequent edits are user-controlled.
   */
  defaultJobText?: string;
  /**
   * Hide the post-scan "Sign up free" promo (used in-app where the user
   * is already authenticated).
   */
  hideSignupPromo?: boolean;
  /**
   * Fires once after each successful scan with the full result. The
   * marketing scanner ignores this; the in-app page uses it to persist
   * the scan to history.
   */
  onScanComplete?: (payload: {
    result: ATSScanResult;
    jdText: string;
    jdMatch: JdMatchResult | null;
  }) => void;
}

function completeProfile(profile: Partial<Profile>, rawText?: string): Profile {
  const now = nowIso();
  return {
    id: profile.id || "scanner-anonymous",
    contact: profile.contact || { name: "" },
    summary: profile.summary,
    experiences: profile.experiences || [],
    education: profile.education || [],
    skills: profile.skills || [],
    projects: profile.projects || [],
    certifications: profile.certifications || [],
    rawText: rawText || profile.rawText,
    createdAt: profile.createdAt || now,
    updatedAt: profile.updatedAt || now,
  };
}

function hasMinimumContent(profile: Profile, fileMeta?: FileMeta) {
  const hasProfileContent =
    profile.experiences.length > 0 ||
    profile.skills.length > 0 ||
    (profile.summary?.trim().length ?? 0) >= MIN_RESUME_LENGTH;
  const hasUsableParse =
    !fileMeta ||
    (fileMeta.parseConfidence >= 0.25 && fileMeta.sectionsDetected.length > 0);

  return hasProfileContent && hasUsableParse;
}

function opportunityToJob(opportunity: ScrapedOpportunity): JobDescription {
  return {
    id: "scanner-imported-job",
    title: opportunity.title,
    company: opportunity.company,
    description: opportunity.description,
    requirements: opportunity.requirements || [],
    responsibilities: opportunity.responsibilities || [],
    keywords: opportunity.keywords || [],
    url: opportunity.url,
    createdAt: nowIso(),
  };
}

function opportunityToText(opportunity: ScrapedOpportunity) {
  return [
    `${opportunity.title} at ${opportunity.company}`,
    opportunity.description,
    ...(opportunity.requirements?.length
      ? ["Requirements", ...opportunity.requirements.map((item) => `- ${item}`)]
      : []),
    ...(opportunity.responsibilities?.length
      ? [
          "Responsibilities",
          ...opportunity.responsibilities.map((item) => `- ${item}`),
        ]
      : []),
  ]
    .filter(Boolean)
    .join("\n\n");
}

function buildCurrentJobForScan(
  currentJobText: string,
  importedJob: JobDescription | null,
  importedJobText: string,
) {
  const text = currentJobText.trim();
  if (text.length <= 20) return undefined;

  const parsed = textToJob(text);
  if (importedJob && text === importedJobText.trim()) {
    return {
      ...parsed,
      id: importedJob.id,
      title: importedJob.title,
      company: importedJob.company,
      url: importedJob.url,
      description: text,
      createdAt: importedJob.createdAt,
    };
  }

  return parsed;
}

function profileToMatchText(profile: Profile, fallbackText: string) {
  const experiences = profile.experiences ?? [];
  const education = profile.education ?? [];
  const skills = profile.skills ?? [];
  const projects = profile.projects ?? [];
  const certifications = profile.certifications ?? [];

  const parts = [
    fallbackText,
    profile.rawText,
    profile.contact?.name,
    profile.summary,
    ...experiences.flatMap((experience) => [
      experience.title,
      experience.company,
      experience.description,
      ...(experience.highlights ?? []),
      ...(experience.skills ?? []),
    ]),
    ...education.flatMap((educationItem) => [
      educationItem.institution,
      educationItem.degree,
      educationItem.field,
      ...(educationItem.highlights ?? []),
    ]),
    ...skills.map((skill) => skill.name),
    ...projects.flatMap((project) => [
      project.name,
      project.description,
      ...(project.technologies ?? []),
      ...(project.highlights ?? []),
    ]),
    ...certifications.flatMap((certification) => [
      certification.name,
      certification.issuer,
    ]),
  ];

  return parts.filter(Boolean).join(" ");
}

function getDropRejectionMessage(rejection: FileRejection) {
  const error = rejection.errors[0];

  if (error?.code === "file-too-large") {
    return `File too large. Maximum size is ${formatFileSize(MAX_UPLOAD_SIZE)}.`;
  }

  if (error?.code === "file-invalid-type") {
    return "Upload a PDF or TXT file.";
  }

  return error?.message || "Could not accept that file.";
}

function getParseApiErrorMessage(code: unknown, fallback?: string) {
  if (typeof code === "string" && code in API_PARSE_ERROR_MESSAGES) {
    return API_PARSE_ERROR_MESSAGES[code as ParseErrorCode];
  }

  return fallback || "Could not parse that resume.";
}

export function ScannerForm({
  locale = "en",
  defaultJobText,
  hideSignupPromo = false,
  onScanComplete,
}: ScannerFormProps = {}) {
  const a11yT = useA11yTranslations();

  const [resumeText, setResumeText] = useState("");
  const [jobText, setJobText] = useState(defaultJobText ?? "");
  const [jobUrl, setJobUrl] = useState("");
  const [parsedProfile, setParsedProfile] = useState<Profile | null>(null);
  const [fileMeta, setFileMeta] = useState<FileMeta | undefined>();
  const [pdfLayout, setPdfLayout] = useState<PdfLayoutReport | undefined>();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parseMessage, setParseMessage] = useState("");
  const [parseError, setParseError] = useState("");
  const [showPasteResume, setShowPasteResume] = useState(false);
  const [scrapedJob, setScrapedJob] = useState<JobDescription | null>(null);
  const [scrapedJobText, setScrapedJobText] = useState("");
  const [scrapeStatus, setScrapeStatus] = useState("");
  const [scrapeError, setScrapeError] = useState("");
  const [parsing, setParsing] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [result, setResult] = useState<ATSScanResult | null>(null);
  const [jdMatch, setJdMatch] = useState<JdMatchResult | null>(null);
  const [resultQuality, setResultQuality] =
    useState<ResultQualityRubric | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const scrapingRef = useRef(false);
  const jobTextareaRef = useRef<HTMLTextAreaElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result) {
      resultRef.current?.focus();
    }
  }, [result]);

  const parseFile = useCallback(async (file: File) => {
    setParseError("");
    setParseMessage("");
    setParsing(true);
    setUploadedFile(file);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/scanner/parse-resume", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json().catch(() => null)) as
        | (ParseResponse & { error?: string; code?: string })
        | null;

      if (!response.ok || !data) {
        throw new Error(getParseApiErrorMessage(data?.code, data?.error));
      }

      const rawText =
        file.type === "text/plain" ? await file.text() : undefined;
      const profile = completeProfile(data.profile, rawText);
      setParsedProfile(profile);
      if (rawText) setResumeText(rawText);
      setFileMeta({
        mimeType: file.type === "text/plain" ? "text/plain" : "application/pdf",
        sizeBytes: file.size,
        sectionsDetected: data.sectionsDetected,
        parseConfidence: data.confidence,
        warnings: data.warnings,
      });
      setPdfLayout(data.pdfLayout);
      setParseMessage(
        `Parsed ${pluralize(data.sectionsDetected.length, "section")}, confidence ${Math.round(data.confidence * 100)}%`,
      );
    } catch (error) {
      setParsedProfile(null);
      setFileMeta(undefined);
      setPdfLayout(undefined);
      setParseError(
        error instanceof Error ? error.message : "Could not parse that resume.",
      );
      setShowPasteResume(true);
    } finally {
      setParsing(false);
    }
  }, []);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const [file] = acceptedFiles;
      if (file) void parseFile(file);
    },
    [parseFile],
  );

  const onDropRejected = useCallback((rejections: FileRejection[]) => {
    const [rejection] = rejections;
    if (!rejection) return;

    setParseError(getDropRejectionMessage(rejection));
    setParseMessage("");
    setUploadedFile(null);
    setParsedProfile(null);
    setFileMeta(undefined);
    setPdfLayout(undefined);
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      onDropRejected,
      accept: {
        "application/pdf": [".pdf"],
        "text/plain": [".txt"],
      },
      maxFiles: 1,
      maxSize: MAX_UPLOAD_SIZE,
    });

  async function handleScrapeJob() {
    const url = jobUrl.trim();
    if (!url || scrapingRef.current) return;

    scrapingRef.current = true;
    setScrapeError("");
    setScrapeStatus("");
    setScraping(true);

    try {
      const response = await fetch("/api/scanner/scrape-job", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = (await response.json().catch(() => null)) as {
        opportunity?: ScrapedOpportunity;
        error?: string;
      } | null;
      if (!response.ok || !data?.opportunity) {
        throw new Error(data?.error || "Could not import that job posting.");
      }

      const job = opportunityToJob(data.opportunity);
      const importedText = opportunityToText(data.opportunity);
      setScrapedJob(job);
      setScrapedJobText(importedText);
      setJobText(importedText);
      setScrapeStatus(`Imported from ${new URL(url).hostname}`);
    } catch (error) {
      setScrapedJob(null);
      setScrapedJobText("");
      setScrapeError(
        `${error instanceof Error ? error.message : "Could not import that job posting."} Paste manually instead.`,
      );
    } finally {
      scrapingRef.current = false;
      setScraping(false);
    }
  }

  function focusManualJobPaste() {
    jobTextareaRef.current?.focus();
  }

  function handleAnalyze() {
    const profile = parsedProfile
      ? hasMinimumContent(parsedProfile, fileMeta)
        ? parsedProfile
        : null
      : resumeText.trim().length >= MIN_RESUME_LENGTH
        ? textToProfile(resumeText)
        : null;
    if (!profile) return;

    setAnalyzing(true);

    requestAnimationFrame(() => {
      const jdText = jobText.trim();
      const job = buildCurrentJobForScan(jobText, scrapedJob, scrapedJobText);
      const analysis = scanResume(profile, resumeText, job, {
        fileMeta,
        pdfLayout:
          fileMeta?.mimeType === "application/pdf" ? pdfLayout : undefined,
      });
      const jdMatchResult = jdText
        ? computeJdMatch(profileToMatchText(profile, resumeText), jdText, {
            missingLimit: 10,
          })
        : null;
      setResult(analysis);
      setJdMatch(jdMatchResult);
      setResultQuality(
        evaluateResultQuality({
          jdMatchScore: jdMatchResult?.score,
          missingKeywords: jdMatchResult?.missingKeywords,
          atsAxes: analysis.axes,
          atsIssues: analysis.issues,
          keywords: analysis.keywords,
          profile,
          hasJobDescription: Boolean(jdText),
        }),
      );
      setAnalyzing(false);

      if (onScanComplete) {
        onScanComplete({
          result: analysis,
          jdText,
          jdMatch: jdMatchResult,
        });
      }
    });
  }

  function handleReset() {
    setResult(null);
    setJdMatch(null);
    setResultQuality(null);
    setResumeText("");
    setJobText("");
    setJobUrl("");
    setParsedProfile(null);
    setFileMeta(undefined);
    setPdfLayout(undefined);
    setUploadedFile(null);
    setParseMessage("");
    setParseError("");
    setScrapedJob(null);
    setScrapedJobText("");
    setScrapeStatus("");
    setScrapeError("");
    setShowPasteResume(false);
  }

  const parsedProfileHasMinimumContent =
    parsedProfile && hasMinimumContent(parsedProfile, fileMeta);
  const uploadedProfileNeedsManualText =
    Boolean(parsedProfile) && !parsedProfileHasMinimumContent;
  const parseWarnings = fileMeta?.warnings.filter(Boolean) ?? [];
  const hasManualResumeText =
    !parsedProfile && resumeText.trim().length >= MIN_RESUME_LENGTH;
  const canAnalyze =
    Boolean(parsedProfileHasMinimumContent || hasManualResumeText) &&
    !analyzing &&
    !parsing;
  const scanHelpText = canAnalyze
    ? "Ready to scan."
    : "Upload a resume or paste at least 50 characters to scan.";
  const callbackUrl = `/${locale}/dashboard`;

  if (result) {
    const legacyResult: ATSAnalysisResult = result.legacy;
    const platformInfo = jobUrl ? detectAndDescribe(jobUrl) : null;
    return (
      <div
        ref={resultRef}
        tabIndex={-1}
        className="space-y-8 focus:outline-none"
        aria-label="ATS scan results"
      >
        <ScoreDisplay result={legacyResult} />

        {platformInfo ? <PlatformCard info={platformInfo} /> : null}

        {resultQuality ? <ResultQualityCard rubric={resultQuality} /> : null}

        {jdMatch ? <JdMatchCard match={jdMatch} /> : null}

        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold">Scoring axes</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.values(result.axes).map((axis) => (
              <div
                key={axis.key}
                className="rounded-md border border-border bg-muted/30 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">{axis.label}</span>
                  <span className="text-sm font-semibold">{axis.score}%</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Weight {Math.round(axis.weight * 100)}%
                </p>
              </div>
            ))}
          </div>
        </div>

        <FixSuggestionsList issues={legacyResult.issues} />

        {result.contentChecks ? (
          <ContentInsightsCard checks={result.contentChecks} />
        ) : null}

        <ReferralHint />

        {hideSignupPromo ? (
          <div className="flex justify-center">
            <Button variant="outline" onClick={handleReset}>
              Scan another resume
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-8 text-center">
            <h3 className="mb-2 text-xl font-bold">
              Want AI-powered resume tailoring?
            </h3>
            <p className="mb-4 text-muted-foreground">
              Get personalized rewrites, keyword optimization, and cover letters
              generated for each job.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button variant="gradient" size="pill" asChild>
                <Link href={{ pathname: "/sign-in", query: { callbackUrl } }}>
                  Sign up free &rarr;
                </Link>
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Scan another resume
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <label className="block text-sm font-medium">
            Upload your resume{" "}
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          </label>
          <button
            type="button"
            className="text-xs font-medium text-primary underline-offset-4 hover:underline"
            onClick={() => setShowPasteResume((current) => !current)}
          >
            Paste text instead
          </button>
        </div>

        <div
          {...getRootProps({
            "aria-describedby": "resume-upload-help",
            "aria-required": "true",
          })}
          className={cn(
            "cursor-pointer rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center transition-colors",
            isDragActive && "border-primary bg-primary/5",
            isDragReject && "border-destructive bg-destructive/5",
          )}
        >
          <input
            {...getInputProps()}
            aria-label={a11yT("uploadResumePdfOrTextFile")}
            aria-required="true"
          />
          {parsing ? (
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-primary" />
          ) : uploadedFile ? (
            <FileText className="mx-auto mb-3 h-8 w-8 text-primary" />
          ) : (
            <UploadCloud className="mx-auto mb-3 h-8 w-8 text-primary" />
          )}
          <p className="text-sm font-medium">
            {uploadedFile
              ? uploadedFile.name
              : "Drop a PDF here or click to browse"}
          </p>
          <p
            id="resume-upload-help"
            className="mt-1 text-xs text-muted-foreground"
          >
            PDF preferred, TXT fallback, up to {formatFileSize(MAX_UPLOAD_SIZE)}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Your file is sent to our servers for temporary parsing and is not
            saved after the scan completes.
          </p>
        </div>

        {parseMessage ? (
          <div className="mt-3 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span>{parseMessage}</span>
              <button
                type="button"
                className="ml-auto text-xs font-medium text-primary underline-offset-4 hover:underline"
                onClick={() => {
                  setUploadedFile(null);
                  setParsedProfile(null);
                  setFileMeta(undefined);
                  setPdfLayout(undefined);
                  setParseMessage("");
                }}
              >
                Replace file
              </button>
            </div>
            {parseWarnings.length > 0 ? (
              <ul className="mt-2 space-y-1 pl-6 text-xs text-muted-foreground">
                {parseWarnings.map((warning) => (
                  <li key={warning} className="list-disc">
                    {warning}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        {uploadedProfileNeedsManualText ? (
          <div className="mt-3 flex items-start gap-2 rounded-md border border-warning/30 bg-warning/5 px-3 py-2 text-sm">
            <AlertCircle className="mt-0.5 h-4 w-4 text-warning" />
            <div className="flex-1">
              <p>
                We couldn&apos;t extract enough content from this PDF. Try a
                text-based PDF, or paste your resume text below.
              </p>
              <button
                type="button"
                className="mt-2 text-xs font-medium text-primary underline-offset-4 hover:underline"
                onClick={() => setShowPasteResume(true)}
              >
                Paste text instead
              </button>
            </div>
          </div>
        ) : null}

        {parseError ? (
          <div className="mt-3 flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{parseError}</span>
          </div>
        ) : null}

        {showPasteResume ? (
          <div className="mt-4">
            <label
              htmlFor="resume-text"
              className="mb-2 block text-sm font-medium"
            >
              Paste your resume text{" "}
              <span className="text-destructive" aria-hidden="true">
                *
              </span>
            </label>
            <Textarea
              id="resume-text"
              aria-required="true"
              placeholder={a11yT("pasteYourFullResumeTextHere")}
              className="min-h-[200px] font-mono text-sm"
              value={resumeText}
              onChange={(event) => {
                setResumeText(event.target.value);
                setParsedProfile(null);
                setFileMeta(undefined);
                setPdfLayout(undefined);
              }}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {resumeText.trim().length < MIN_RESUME_LENGTH
                ? `At least ${MIN_RESUME_LENGTH} characters required`
                : pluralize(resumeText.trim().split(/\s+/).length, "word")}
            </p>
          </div>
        ) : null}
      </div>

      <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4">
        <label htmlFor="job-url" className="mb-2 block text-sm font-medium">
          Import job from URL{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="job-url"
              type="url"
              className="h-10 w-full rounded-md border border-input bg-background px-9 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="https://www.linkedin.com/jobs/..."
              value={jobUrl}
              onChange={(event) => setJobUrl(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleScrapeJob();
                }
              }}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleScrapeJob}
            disabled={!jobUrl.trim() || scraping}
          >
            {scraping ? <Loader2 className="h-4 w-4 animate-spin" /> : "Import"}
          </Button>
        </div>
        {scrapeStatus ? (
          <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3 w-3 text-success" />
            {scrapeStatus}
          </p>
        ) : null}
        {scrapeError ? (
          <button
            type="button"
            className="mt-2 flex items-center gap-1 text-left text-xs text-destructive underline-offset-4 hover:underline"
            onClick={focusManualJobPaste}
          >
            <AlertCircle className="h-3 w-3" />
            {scrapeError}
          </button>
        ) : null}
        <p className="mt-2 text-xs text-muted-foreground">
          Job URLs are sent to our servers for temporary scraping and are not
          saved after import.
        </p>

        <label htmlFor="job-text" className="mt-4 block text-sm font-medium">
          Paste job description{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <Textarea
          id="job-text"
          ref={jobTextareaRef}
          placeholder={a11yT("optionalPasteTheJobDescriptionToCheckKeyword")}
          className="mt-2 min-h-[96px] border-border bg-background/70 font-mono text-sm placeholder:italic focus:min-h-[140px]"
          value={jobText}
          onChange={(event) => {
            setJobText(event.target.value);
            if (event.target.value.trim() !== scrapedJobText.trim()) {
              setScrapedJob(null);
              setScrapedJobText("");
            }
          }}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Adding a job description enables keyword match analysis
        </p>
      </div>

      <Button
        onClick={handleAnalyze}
        disabled={!canAnalyze}
        aria-describedby="ats-scan-help"
        title={canAnalyze ? undefined : scanHelpText}
        variant="gradient"
        size="lg"
        className="w-full"
      >
        {analyzing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <FileSearch className="mr-2 h-4 w-4" />
            Scan Resume
          </>
        )}
      </Button>
      <p
        id="ats-scan-help"
        className="text-center text-xs text-muted-foreground"
      >
        {scanHelpText}
      </p>
    </div>
  );
}
