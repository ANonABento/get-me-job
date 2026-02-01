"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Loader2,
  Copy,
  Check,
  Send,
  RefreshCw,
  Heart,
  Users,
  HelpCircle,
  DollarSign,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EmailTemplateType, JobDescription } from "@/types";

const TEMPLATE_CONFIG: Record<
  EmailTemplateType,
  { title: string; description: string; icon: React.ElementType; color: string }
> = {
  follow_up: {
    title: "Follow-up Email",
    description: "Check on your application status",
    icon: Mail,
    color: "text-blue-500",
  },
  thank_you: {
    title: "Thank You Email",
    description: "Express gratitude after an interview",
    icon: Heart,
    color: "text-pink-500",
  },
  networking: {
    title: "Networking Email",
    description: "Connect with professionals at target companies",
    icon: Users,
    color: "text-purple-500",
  },
  status_inquiry: {
    title: "Status Inquiry",
    description: "Politely ask about application progress",
    icon: HelpCircle,
    color: "text-amber-500",
  },
  negotiation: {
    title: "Offer Negotiation",
    description: "Discuss salary and benefits",
    icon: DollarSign,
    color: "text-green-500",
  },
};

export default function EmailTemplatesPage() {
  const [selectedType, setSelectedType] = useState<EmailTemplateType | null>(null);
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState<{
    subject: string;
    body: string;
  } | null>(null);

  // Context fields
  const [interviewerName, setInterviewerName] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [targetCompany, setTargetCompany] = useState("");
  const [connectionName, setConnectionName] = useState("");
  const [customNote, setCustomNote] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/jobs");
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    }
  };

  const generateEmail = useCallback(async () => {
    if (!selectedType) return;

    setLoading(true);
    try {
      const res = await fetch("/api/email/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          jobId: selectedJobId || undefined,
          interviewerName: interviewerName || undefined,
          interviewDate: interviewDate || undefined,
          targetCompany: targetCompany || undefined,
          connectionName: connectionName || undefined,
          customNote: customNote || undefined,
        }),
      });

      const data = await res.json();
      if (data.email) {
        setGeneratedEmail({
          subject: data.email.subject,
          body: data.email.body,
        });
      }
    } catch (error) {
      console.error("Failed to generate email:", error);
    } finally {
      setLoading(false);
    }
  }, [
    selectedType,
    selectedJobId,
    interviewerName,
    interviewDate,
    targetCompany,
    connectionName,
    customNote,
  ]);

  const copyToClipboard = async () => {
    if (!generatedEmail) return;
    const fullEmail = `Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`;
    await navigator.clipboard.writeText(fullEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openInMailClient = () => {
    if (!generatedEmail) return;
    const mailto = `mailto:?subject=${encodeURIComponent(generatedEmail.subject)}&body=${encodeURIComponent(generatedEmail.body)}`;
    window.location.href = mailto;
  };

  const renderContextFields = () => {
    if (!selectedType) return null;

    switch (selectedType) {
      case "follow_up":
      case "status_inquiry":
        return (
          <div className="space-y-4">
            <div>
              <Label>Select Job (optional)</Label>
              <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a job application" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No job selected</SelectItem>
                  {jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title} at {job.company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "thank_you":
        return (
          <div className="space-y-4">
            <div>
              <Label>Select Job</Label>
              <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose the job you interviewed for" />
                </SelectTrigger>
                <SelectContent>
                  {jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title} at {job.company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Interviewer Name</Label>
              <Input
                value={interviewerName}
                onChange={(e) => setInterviewerName(e.target.value)}
                placeholder="e.g., John Smith"
              />
            </div>
            <div>
              <Label>Interview Date</Label>
              <Input
                type="date"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
              />
            </div>
          </div>
        );

      case "networking":
        return (
          <div className="space-y-4">
            <div>
              <Label>Target Company</Label>
              <Input
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                placeholder="e.g., Google"
              />
            </div>
            <div>
              <Label>Connection Name</Label>
              <Input
                value={connectionName}
                onChange={(e) => setConnectionName(e.target.value)}
                placeholder="e.g., Jane Doe"
              />
            </div>
          </div>
        );

      case "negotiation":
        return (
          <div className="space-y-4">
            <div>
              <Label>Select Job</Label>
              <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose the job offer" />
                </SelectTrigger>
                <SelectContent>
                  {jobs
                    .filter((j) => j.status === "offered")
                    .map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.title} at {job.company}
                      </SelectItem>
                    ))}
                  {jobs.filter((j) => j.status === "offered").length === 0 && (
                    <SelectItem value="" disabled>
                      No offers yet
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Custom Note (optional)</Label>
              <Textarea
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Add any specific points you want to mention..."
                rows={3}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Section */}
      <div className="hero-gradient border-b">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="space-y-4 animate-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Mail className="h-4 w-4" />
              Communication
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Email Templates</h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Generate professional emails for follow-ups, thank you notes, and networking.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Template Selection & Context */}
          <div className="space-y-6">
            {/* Template Selection */}
            <div className="rounded-2xl border bg-card p-6">
              <h2 className="font-semibold mb-4">Choose Template</h2>
              <div className="grid gap-3">
                {(Object.keys(TEMPLATE_CONFIG) as EmailTemplateType[]).map((type) => {
                  const config = TEMPLATE_CONFIG[type];
                  const Icon = config.icon;
                  const isSelected = selectedType === type;

                  return (
                    <button
                      key={type}
                      onClick={() => {
                        setSelectedType(type);
                        setGeneratedEmail(null);
                      }}
                      className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      <div className={`p-2 rounded-lg bg-muted ${config.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{config.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {config.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Context Fields */}
            {selectedType && (
              <div className="rounded-2xl border bg-card p-6">
                <h2 className="font-semibold mb-4">Customize</h2>
                {renderContextFields()}

                <Button
                  onClick={generateEmail}
                  disabled={loading}
                  className="w-full mt-6 gradient-bg text-white hover:opacity-90"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Generate Email
                </Button>
              </div>
            )}
          </div>

          {/* Right Column - Preview */}
          <div className="rounded-2xl border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Preview</h2>
              {generatedEmail && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateEmail}
                    disabled={loading}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerate
                  </Button>
                </div>
              )}
            </div>

            {generatedEmail ? (
              <div className="space-y-4">
                {/* Subject */}
                <div>
                  <Label className="text-xs text-muted-foreground">Subject</Label>
                  <div className="mt-1 p-3 rounded-lg bg-muted/50 font-medium">
                    {generatedEmail.subject}
                  </div>
                </div>

                {/* Body */}
                <div>
                  <Label className="text-xs text-muted-foreground">Body</Label>
                  <div className="mt-1 p-4 rounded-lg bg-muted/50 whitespace-pre-wrap text-sm leading-relaxed max-h-[400px] overflow-y-auto">
                    {generatedEmail.body}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={copyToClipboard}
                    disabled={copied}
                    className="flex-1"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button onClick={openInMailClient} className="flex-1">
                    <Send className="h-4 w-4 mr-2" />
                    Open in Mail
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="p-4 rounded-full bg-muted text-muted-foreground mb-4">
                  <Mail className="h-8 w-8" />
                </div>
                <p className="text-muted-foreground">
                  {selectedType
                    ? "Click 'Generate Email' to create your message"
                    : "Select a template type to get started"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
