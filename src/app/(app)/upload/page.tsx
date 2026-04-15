"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Dropzone, UploadResult } from "@/components/upload/dropzone";
import { DriveFilePicker } from "@/components/google";
import {
  ArrowRight,
  FileText,
  Loader2,
  Sparkles,
  CheckCircle2,
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  ArrowLeft,
  Zap,
  Shield,
  Clock,
  HardDrive,
} from "lucide-react";

type ParseStep = "upload" | "parsing" | "success";

interface ParseApiResponse {
  success: boolean;
  profile?: {
    contact?: { name?: string; email?: string };
    experiences?: unknown[];
    skills?: unknown[];
    education?: unknown[];
  };
  parsingMethod?: "ai" | "basic";
  llmFallback?: boolean;
  llmConfigured?: boolean;
}

export default function UploadPage() {
  const router = useRouter();
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [step, setStep] = useState<ParseStep>("upload");
  const [parseError, setParseError] = useState<string | null>(null);
  const [parseResult, setParseResult] = useState<ParseApiResponse | null>(null);
  const [driveLoading, setDriveLoading] = useState(false);

  const handleUploadComplete = (results: UploadResult[]) => {
    setUploadResults(results);
    setParseError(null);
  };

  const handleDriveSelect = async (file: { id: string; name: string; mimeType: string }) => {
    setDriveLoading(true);
    setParseError(null);
    try {
      // Download file from Drive and upload to our system
      const downloadRes = await fetch(`/api/google/drive/files/${file.id}/download`);
      if (!downloadRes.ok) {
        throw new Error("Failed to download file from Google Drive");
      }
      const blob = await downloadRes.blob();

      // Upload to our system
      const formData = new FormData();
      formData.append("file", blob, file.name);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to upload file");
      }

      const uploadData = await uploadRes.json();
      if (!uploadData.document?.id) {
        throw new Error("Drive import completed without a document ID");
      }
      const uploadedFile = new File([blob], file.name, { type: file.mimeType });
      setUploadResults([{
        file: uploadedFile,
        documentId: uploadData.document?.id,
      }]);
    } catch (error) {
      console.error("Drive import error:", error);
      setParseError(error instanceof Error ? error.message : "Failed to import from Google Drive");
    } finally {
      setDriveLoading(false);
    }
  };

  const handleParseResume = async () => {
    if (uploadResults.length === 0) return;

    setStep("parsing");
    setParseError(null);
    try {
      const response = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: uploadResults[0].documentId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) {
          throw new Error("Authentication required. Please sign in and try again.");
        }
        throw new Error(errorData.error || "Parse failed");
      }

      const data: ParseApiResponse = await response.json();
      setParseResult(data);
      setStep("success");
    } catch (error) {
      console.error("Parse error:", error);
      setParseError(error instanceof Error ? error.message : "Failed to parse resume");
      setStep("upload");
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="hero-gradient border-b">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="space-y-4 animate-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              AI-Powered Extraction
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              Upload Your Resume
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Our AI will automatically extract your professional information,
              including experience, skills, and education, to build your profile.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="flex items-center gap-3 text-sm">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Zap className="h-4 w-4" />
              </div>
              <span className="text-muted-foreground">Instant extraction</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="p-2 rounded-lg bg-success/10 text-success">
                <Shield className="h-4 w-4" />
              </div>
              <span className="text-muted-foreground">Private & secure</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="p-2 rounded-lg bg-info/10 text-info">
                <Clock className="h-4 w-4" />
              </div>
              <span className="text-muted-foreground">Save hours of typing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {step === "upload" && (
          <div className="space-y-8 animate-in">
            {/* Dropzone */}
            <Dropzone onUploadComplete={handleUploadComplete} maxFiles={1} />

            {/* Google Drive Import */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or import from
                </span>
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                  <HardDrive className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Google Drive</h3>
                  <p className="text-sm text-muted-foreground">
                    Import your resume directly from Google Drive
                  </p>
                </div>
                <DriveFilePicker
                  onSelect={handleDriveSelect}
                  accept={["application/pdf", "text/plain"]}
                  trigger={
                    <button
                      disabled={driveLoading}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-background hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      {driveLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <HardDrive className="h-4 w-4" />
                      )}
                      {driveLoading ? "Importing..." : "Browse Drive"}
                    </button>
                  }
                />
              </div>
            </div>

            {/* Error Message */}
            {parseError && (
              <div className="rounded-xl border border-destructive/50 bg-destructive/5 p-4">
                <p className="text-destructive font-medium">{parseError}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Please try uploading your resume again. If the problem persists, check your{" "}
                  <Link href="/settings" className="text-primary underline">LLM settings</Link>.
                </p>
              </div>
            )}

            {/* Parse Button */}
            {uploadResults.length > 0 && (
              <div className="rounded-2xl border bg-card p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Ready to Extract</h3>
                    <p className="text-muted-foreground mt-1">
                      Click below to extract your professional information using AI.
                      This typically takes 10-15 seconds.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleParseResume}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl gradient-bg text-white font-medium shadow-lg hover:opacity-90 transition-opacity"
                >
                  <Sparkles className="h-5 w-5" />
                  Extract Information with AI
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        )}

        {step === "parsing" && (
          <div className="rounded-2xl border bg-card p-8 lg:p-12 text-center animate-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-bg text-white mb-6">
              <Loader2 className="h-10 w-10 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold">Analyzing Your Resume</h2>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              Our AI is reading through your resume and extracting key information.
              This usually takes 10-15 seconds.
            </p>

            {/* Progress Steps */}
            <div className="mt-8 space-y-3 max-w-sm mx-auto text-left">
              <ParseProgressItem label="Reading document" done />
              <ParseProgressItem label="Extracting contact info" done />
              <ParseProgressItem label="Analyzing experience" active />
              <ParseProgressItem label="Identifying skills" />
              <ParseProgressItem label="Processing education" />
            </div>
          </div>
        )}

        {step === "success" && parseResult && (
          <div className="space-y-6 animate-in">
            {/* Success Header */}
            <div className="rounded-2xl border border-success/50 bg-success/5 p-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/20 text-success mb-6">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-bold">Resume Parsed Successfully!</h2>
              <p className="text-muted-foreground mt-2">
                We&apos;ve extracted your professional information and saved it to your profile.
              </p>
            </div>

            {/* Basic parsing warning */}
            {parseResult.parsingMethod === "basic" && (
              <div className="rounded-xl border border-warning/50 bg-warning/5 p-4">
                <p className="font-medium text-warning-foreground">
                  {parseResult.llmFallback
                    ? "AI extraction failed — results were extracted using basic parsing."
                    : "No AI provider configured — results were extracted using basic parsing."}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  For better results, configure an AI provider in{" "}
                  <Link href="/settings" className="text-primary underline">Settings</Link>{" "}
                  and try again.
                </p>
              </div>
            )}

            {/* Extracted Summary */}
            <div className="rounded-2xl border bg-card p-6">
              <h3 className="font-semibold text-lg mb-4">What We Found</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <ExtractedItem
                  icon={User}
                  label="Contact Info"
                  value={parseResult.profile?.contact?.name || "Extracted"}
                  color="text-primary"
                />
                <ExtractedItem
                  icon={Briefcase}
                  label="Experience"
                  value={`${parseResult.profile?.experiences?.length || 0} positions`}
                  color="text-primary"
                />
                <ExtractedItem
                  icon={Wrench}
                  label="Skills"
                  value={`${parseResult.profile?.skills?.length || 0} skills`}
                  color="text-accent"
                />
                <ExtractedItem
                  icon={GraduationCap}
                  label="Education"
                  value={`${parseResult.profile?.education?.length || 0} entries`}
                  color="text-success"
                />
              </div>
            </div>

            {/* Next Steps */}
            <div className="rounded-2xl border bg-card p-6">
              <h3 className="font-semibold text-lg mb-4">What&apos;s Next?</h3>
              <div className="space-y-3">
                <NextStepItem
                  number={1}
                  title="Review your profile"
                  description="Check the extracted data and make any corrections"
                  href="/profile"
                />
                <NextStepItem
                  number={2}
                  title="Add target jobs"
                  description="Paste job descriptions to get tailored resumes"
                  href="/jobs"
                />
                <NextStepItem
                  number={3}
                  title="Practice interviews"
                  description="Prepare with AI-powered mock interviews"
                  href="/interview"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => router.push("/profile")}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl gradient-bg text-white font-medium shadow-lg hover:opacity-90 transition-opacity"
              >
                View & Edit Profile
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => {
                  setStep("upload");
                  setUploadResults([]);
                  setParseResult(null);
                  setParseError(null);
                }}
                className="px-6 py-3 rounded-xl border bg-card font-medium hover:bg-muted transition-colors"
              >
                Upload Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ParseProgressItem({
  label,
  done,
  active,
}: {
  label: string;
  done?: boolean;
  active?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
          done
            ? "bg-success text-success-foreground"
            : active
            ? "bg-primary text-primary-foreground animate-pulse"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {done ? <CheckCircle2 className="h-4 w-4" /> : active ? <Loader2 className="h-3 w-3 animate-spin" /> : ""}
      </div>
      <span className={done || active ? "text-foreground" : "text-muted-foreground"}>
        {label}
      </span>
    </div>
  );
}

function ExtractedItem({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
      <div className={`p-2 rounded-lg bg-background ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}

function NextStepItem({
  number,
  title,
  description,
  href,
}: {
  number: number;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors"
    >
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        {number}
      </div>
      <div className="flex-1">
        <p className="font-medium group-hover:text-primary transition-colors">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
    </Link>
  );
}
