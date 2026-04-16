"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatEditor } from "@/components/cover-letter/chat-editor";
import { FileText, ArrowRight, Settings, Loader2 } from "lucide-react";
import Link from "next/link";

type Step = "input" | "editor";

export default function CoverLetterPage() {
  const [step, setStep] = useState<Step>("input");
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [initialContent, setInitialContent] = useState("");
  const [llmError, setLlmError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleGenerate() {
    if (jobDescription.trim().length < 20) return;
    setIsLoading(true);
    setLlmError(null);

    try {
      const res = await fetch("/api/cover-letter/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: jobDescription.trim(),
          jobTitle: jobTitle.trim() || undefined,
          company: company.trim() || undefined,
          action: "generate",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLlmError(data.error || "Failed to generate cover letter");
        return;
      }

      setInitialContent(data.content);
      setStep("editor");
    } catch {
      setLlmError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  }

  if (step === "editor") {
    return (
      <div className="flex flex-col h-[calc(100vh-2rem)] p-4 md:p-6 lg:p-8">
        <div className="mb-4">
          <button
            onClick={() => setStep("input")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; Back to input
          </button>
        </div>
        <ChatEditor
          jobDescription={jobDescription.trim()}
          jobTitle={jobTitle.trim() || "the position"}
          company={company.trim() || "the company"}
          initialContent={initialContent}
        />
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cover Letter Generator</h1>
        <p className="text-muted-foreground mt-1">
          Generate a personalized cover letter from your knowledge bank and iterate with chat.
        </p>
      </div>

      {llmError && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Settings className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm text-destructive">{llmError}</p>
                {llmError.includes("Settings") && (
                  <Link href="/settings">
                    <Button variant="outline" size="sm">
                      Go to Settings
                    </Button>
                  </Link>
                )}
                {llmError.includes("bank") && (
                  <Link href="/bank">
                    <Button variant="outline" size="sm">
                      Go to Documents
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Job Description
          </CardTitle>
          <CardDescription>
            Paste the job description and optionally add the job title and company name.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="jobTitle" className="text-sm font-medium mb-1 block">
                Job Title (optional)
              </label>
              <Input
                id="jobTitle"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Software Engineer"
              />
            </div>
            <div>
              <label htmlFor="company" className="text-sm font-medium mb-1 block">
                Company (optional)
              </label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Acme Corp"
              />
            </div>
          </div>

          <div>
            <label htmlFor="jobDescription" className="text-sm font-medium mb-1 block">
              Job Description
            </label>
            <Textarea
              id="jobDescription"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              className="min-h-[200px]"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Minimum 20 characters required.
            </p>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={jobDescription.trim().length < 20 || isLoading}
            className="w-full md:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                Generate Cover Letter
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
