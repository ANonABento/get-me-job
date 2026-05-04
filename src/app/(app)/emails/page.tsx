"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import {
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
  Save,
  FileText,
  Trash2,
  Edit3,
  Clock,
  ChevronDown,
  ChevronUp,
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
import { AppPage, PageContent, PageHeader } from "@/components/ui/page-layout";
import { SkeletonButton } from "@/components/ui/skeleton";
import { useErrorToast } from "@/hooks/use-error-toast";
import { readJsonResponse } from "@/lib/http";
import { getEmailTemplateLayoutClass } from "./utils";
import type { EmailTemplateType, JobDescription } from "@/types";

const SendViaGmailButton = dynamic(
  () => import("@/components/google").then((m) => m.SendViaGmailButton),
  { loading: () => <SkeletonButton className="w-36" />, ssr: false },
);

interface EmailDraft {
  id: string;
  type: EmailTemplateType;
  jobId?: string;
  subject: string;
  body: string;
  context?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

interface JobsResponse {
  jobs?: JobDescription[];
}

interface EmailDraftsResponse {
  drafts?: EmailDraft[];
}

interface GeneratedEmailResponse {
  email?: {
    subject: string;
    body: string;
  };
}

const TEMPLATE_CONFIG: Record<
  EmailTemplateType,
  { title: string; description: string; icon: React.ElementType; color: string }
> = {
  follow_up: {
    title: "Follow-up Email",
    description: "Check on your application status",
    icon: Mail,
    color: "text-info",
  },
  thank_you: {
    title: "Thank You Email",
    description: "Express gratitude after an interview",
    icon: Heart,
    color: "text-accent",
  },
  networking: {
    title: "Networking Email",
    description: "Connect with professionals at target companies",
    icon: Users,
    color: "text-primary",
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
    color: "text-success",
  },
};

export default function EmailTemplatesPage() {
  const [selectedType, setSelectedType] = useState<EmailTemplateType | null>(
    null,
  );
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

  // Drafts state
  const [drafts, setDrafts] = useState<EmailDraft[]>([]);
  const [showDrafts, setShowDrafts] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);

  // Gmail state
  const [recipientEmail, setRecipientEmail] = useState("");
  const showErrorToast = useErrorToast();

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch("/api/jobs");
      const data = await readJsonResponse<JobsResponse>(
        res,
        "Failed to load jobs",
      );
      setJobs(data.jobs || []);
    } catch (error) {
      showErrorToast(error, {
        title: "Could not load jobs",
        fallbackDescription: "Please refresh the page and try again.",
      });
    }
  }, [showErrorToast]);

  const fetchDrafts = useCallback(async () => {
    try {
      const res = await fetch("/api/email/drafts");
      const data = await readJsonResponse<EmailDraftsResponse>(
        res,
        "Failed to load drafts",
      );
      setDrafts(data.drafts || []);
    } catch (error) {
      showErrorToast(error, {
        title: "Could not load drafts",
        fallbackDescription: "Please refresh the page and try again.",
      });
    }
  }, [showErrorToast]);

  useEffect(() => {
    void fetchJobs();
    void fetchDrafts();
  }, [fetchDrafts, fetchJobs]);

  const saveDraft = async () => {
    if (!selectedType || !generatedEmail) return;

    setSavingDraft(true);
    try {
      const context: Record<string, string> = {};
      if (interviewerName) context.interviewerName = interviewerName;
      if (interviewDate) context.interviewDate = interviewDate;
      if (targetCompany) context.targetCompany = targetCompany;
      if (connectionName) context.connectionName = connectionName;
      if (customNote) context.customNote = customNote;

      if (editingDraftId) {
        // Update existing draft
        const response = await fetch(`/api/email/drafts/${editingDraftId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject: generatedEmail.subject,
            body: generatedEmail.body,
            context: Object.keys(context).length > 0 ? context : undefined,
          }),
        });
        await readJsonResponse<unknown>(response, "Failed to save draft");
      } else {
        // Create new draft
        const response = await fetch("/api/email/drafts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: selectedType,
            jobId: selectedJobId || undefined,
            subject: generatedEmail.subject,
            body: generatedEmail.body,
            context: Object.keys(context).length > 0 ? context : undefined,
          }),
        });
        await readJsonResponse<unknown>(response, "Failed to save draft");
      }
      void fetchDrafts();
      setEditingDraftId(null);
    } catch (error) {
      showErrorToast(error, {
        title: "Could not save draft",
        fallbackDescription: "Please try saving the draft again.",
      });
    } finally {
      setSavingDraft(false);
    }
  };

  const loadDraft = (draft: EmailDraft) => {
    setSelectedType(draft.type);
    setSelectedJobId(draft.jobId || "");
    setGeneratedEmail({ subject: draft.subject, body: draft.body });
    setEditingDraftId(draft.id);

    // Restore context
    if (draft.context) {
      setInterviewerName(draft.context.interviewerName || "");
      setInterviewDate(draft.context.interviewDate || "");
      setTargetCompany(draft.context.targetCompany || "");
      setConnectionName(draft.context.connectionName || "");
      setCustomNote(draft.context.customNote || "");
    }
    setShowDrafts(false);
  };

  const deleteDraft = async (draftId: string) => {
    try {
      const response = await fetch(`/api/email/drafts/${draftId}`, {
        method: "DELETE",
      });
      await readJsonResponse<unknown>(response, "Failed to delete draft");
      void fetchDrafts();
      if (editingDraftId === draftId) {
        setEditingDraftId(null);
      }
    } catch (error) {
      showErrorToast(error, {
        title: "Could not delete draft",
        fallbackDescription: "Please try deleting the draft again.",
      });
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

      const data = await readJsonResponse<GeneratedEmailResponse>(
        res,
        "Failed to generate email",
      );
      if (data.email) {
        setGeneratedEmail({
          subject: data.email.subject,
          body: data.email.body,
        });
      }
    } catch (error) {
      showErrorToast(error, {
        title: "Could not generate email",
        fallbackDescription: "Please adjust the details and try again.",
      });
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
    showErrorToast,
  ]);

  const copyToClipboard = async () => {
    if (!generatedEmail) return;
    const fullEmail = `Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`;
    try {
      await navigator.clipboard.writeText(fullEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      showErrorToast(error, {
        title: "Could not copy email",
        fallbackDescription: "Please copy the email manually.",
      });
    }
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
    <AppPage>
      <PageHeader
        icon={Mail}
        eyebrow="Communication"
        title="Email Templates"
        description="Generate professional emails for follow-ups, thank you notes, and networking."
      />

      {/* Main Content */}
      <PageContent>
        {/* Drafts Section */}
        {drafts.length > 0 && (
          <div className="rounded-2xl border bg-card overflow-hidden mb-8">
            <button
              onClick={() => setShowDrafts(!showDrafts)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <span className="flex items-center gap-2 font-medium">
                <FileText className="h-5 w-5 text-primary" />
                Saved Drafts ({drafts.length})
              </span>
              {showDrafts ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </button>

            {showDrafts && (
              <div className="border-t divide-y">
                {drafts.map((draft) => {
                  const config = TEMPLATE_CONFIG[draft.type];
                  const job = draft.jobId
                    ? jobs.find((j) => j.id === draft.jobId)
                    : null;

                  return (
                    <div
                      key={draft.id}
                      className="p-4 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`p-2 rounded-lg bg-muted ${config.color}`}
                        >
                          <config.icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">
                            {draft.subject}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <span>{config.title}</span>
                            {job && (
                              <>
                                <span>•</span>
                                <span>{job.company}</span>
                              </>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(draft.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadDraft(draft)}
                        >
                          <Edit3 className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteDraft(draft.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className={getEmailTemplateLayoutClass(Boolean(selectedType))}>
          {/* Left Column - Template Selection & Context */}
          <div className="space-y-6">
            {/* Template Selection */}
            <div className="rounded-2xl border bg-card p-6">
              <h2 className="font-semibold mb-4">Choose Template</h2>
              <div className="grid gap-3">
                {(Object.keys(TEMPLATE_CONFIG) as EmailTemplateType[]).map(
                  (type) => {
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
                        <div
                          className={`p-2 rounded-lg bg-muted ${config.color}`}
                        >
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
                  },
                )}
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
                  className="w-full mt-6 gradient-bg text-primary-foreground hover:opacity-90"
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

          {selectedType && (
            <div className="rounded-2xl border bg-card p-6 opacity-100 transition-all duration-300 ease-out animate-in fade-in slide-in-from-right-4">
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
                    <Label className="text-xs text-muted-foreground">
                      Subject
                    </Label>
                    <div className="mt-1 p-3 rounded-lg bg-muted/50 font-medium">
                      {generatedEmail.subject}
                    </div>
                  </div>

                  {/* Body */}
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Body
                    </Label>
                    <div className="mt-1 p-4 rounded-lg bg-muted/50 whitespace-pre-wrap text-sm leading-relaxed max-h-[400px] overflow-y-auto">
                      {generatedEmail.body}
                    </div>
                  </div>

                  {/* Recipient for Gmail */}
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Recipient (for Gmail)
                    </Label>
                    <Input
                      type="email"
                      placeholder="recipient@example.com"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      className="mt-1"
                    />
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
                    <Button
                      onClick={openInMailClient}
                      variant="outline"
                      className="flex-1"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Mail App
                    </Button>
                    <SendViaGmailButton
                      to={recipientEmail}
                      subject={generatedEmail.subject}
                      body={generatedEmail.body}
                      disabled={!recipientEmail}
                    />
                  </div>

                  {/* Save Draft */}
                  <Button
                    variant="outline"
                    onClick={saveDraft}
                    disabled={savingDraft}
                    className="w-full"
                  >
                    {savingDraft ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {editingDraftId ? "Update Draft" : "Save as Draft"}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="p-4 rounded-full bg-muted text-muted-foreground mb-4">
                    <Mail className="h-8 w-8" />
                  </div>
                  <p className="text-muted-foreground">
                    Click &apos;Generate Email&apos; to create your message
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </PageContent>
    </AppPage>
  );
}
