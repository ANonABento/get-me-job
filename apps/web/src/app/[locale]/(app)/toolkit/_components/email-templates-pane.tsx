"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Mail,
  Loader2,
  Copy,
  Check,
  Send,
  RefreshCw,
  Sparkles,
  Save,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
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
import { PagePanel, PagePanelHeader } from "@/components/ui/page-layout";
import { SkeletonButton } from "@/components/ui/skeleton";
import { showAchievementToasts } from "@/components/streak/achievement-toast";
import { useToast } from "@/components/ui/toast";
import { useErrorToast } from "@/hooks/use-error-toast";
import { readJsonResponse } from "@/lib/http";
import { extractUnlockedFromResponse } from "@/lib/streak/client";
import { getResponsiveDetailGridClass } from "../../shared-layout-utils";
import { DuplicateSendWarning } from "../../emails/_components/duplicate-send-warning";
import { findRecentDuplicateSend } from "../../emails/_data/duplicate-send";
import {
  DUPLICATE_SEND_WINDOW_DAYS,
  SHOW_DUPLICATE_SEND_WARNING,
  TEMPLATE_CONFIG,
  TEMPLATE_ORDER,
} from "../../emails/_data/templates";
import type { EmailTemplateType } from "@/types";
import type { Opportunity } from "@/types/opportunity";
import { useA11yTranslations } from "@/lib/i18n/use-a11y-translations";

const SendViaGmailButton = dynamic(
  () => import("@/components/google").then((m) => m.SendViaGmailButton),
  { loading: () => <SkeletonButton className="w-36" />, ssr: false },
);

const DraftsSheet = dynamic(
  () =>
    import("../../emails/_components/drafts-sheet").then((m) => m.DraftsSheet),
  { loading: () => null, ssr: false },
);

const SentTimeline = dynamic(
  () =>
    import("../../emails/_components/sent-timeline").then(
      (m) => m.SentTimeline,
    ),
  { loading: () => null, ssr: false },
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

interface OpportunitiesResponse {
  opportunities?: Opportunity[];
}

interface EmailDraftsResponse {
  drafts?: EmailDraft[];
  nextCursor?: string | null;
  hasMore?: boolean;
}

interface EmailSend {
  id: string;
  type: EmailTemplateType;
  jobId?: string;
  recipient: string;
  subject: string;
  body: string;
  inReplyToDraftId?: string;
  gmailMessageId?: string;
  status: "sent" | "failed";
  errorMessage?: string;
  sentAt: string;
}

interface EmailSendsResponse {
  sends?: EmailSend[];
}

interface GeneratedEmailResponse {
  email?: {
    subject: string;
    body: string;
  };
}

export function EmailTemplatesPane() {
  const a11yT = useA11yTranslations();

  const [selectedType, setSelectedType] = useState<EmailTemplateType | null>(
    null,
  );
  const [jobs, setJobs] = useState<Opportunity[]>([]);
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
  const [referenceName, setReferenceName] = useState("");
  const [recruiterName, setRecruiterName] = useState("");
  const [recruiterCompany, setRecruiterCompany] = useState("");
  const [recruiterStance, setRecruiterStance] = useState<
    "interested" | "not_a_fit"
  >("interested");
  const [applyingRole, setApplyingRole] = useState("");
  const [interviewStage, setInterviewStage] = useState("");
  const [hookNote, setHookNote] = useState("");
  const [customNote, setCustomNote] = useState("");

  // Drafts state
  const [drafts, setDrafts] = useState<EmailDraft[]>([]);
  const [draftsLoaded, setDraftsLoaded] = useState(false);
  const [draftsSheetOpen, setDraftsSheetOpen] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [draftsNextCursor, setDraftsNextCursor] = useState<string | null>(null);
  const [hasMoreDrafts, setHasMoreDrafts] = useState(false);
  const [loadingMoreDrafts, setLoadingMoreDrafts] = useState(false);

  // Sent state
  const [sends, setSends] = useState<EmailSend[]>([]);
  const [sendsLoaded, setSendsLoaded] = useState(false);
  const [sentSheetOpen, setSentSheetOpen] = useState(false);

  // Gmail state
  const [recipientEmail, setRecipientEmail] = useState("");
  const [jobsLoaded, setJobsLoaded] = useState(false);
  const showErrorToast = useErrorToast();
  const { addToast } = useToast();
  const { confirm, dialog: confirmDialog } = useConfirmDialog();

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch("/api/opportunities?limit=200");
      const data = await readJsonResponse<OpportunitiesResponse>(
        res,
        "Failed to load jobs",
      );
      setJobs(data.opportunities || []);
    } catch (error) {
      showErrorToast(error, {
        title: "Could not load jobs",
        fallbackDescription: "Please refresh the page and try again.",
      });
    } finally {
      setJobsLoaded(true);
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
      setDraftsNextCursor(data.nextCursor ?? null);
      setHasMoreDrafts(Boolean(data.hasMore));
    } catch (error) {
      showErrorToast(error, {
        title: "Could not load drafts",
        fallbackDescription: "Please refresh the page and try again.",
      });
    } finally {
      setDraftsLoaded(true);
    }
  }, [showErrorToast]);

  const loadMoreDrafts = useCallback(async () => {
    if (!draftsNextCursor) return;
    setLoadingMoreDrafts(true);
    try {
      const res = await fetch(
        `/api/email/drafts?cursor=${encodeURIComponent(draftsNextCursor)}`,
      );
      const data = await readJsonResponse<EmailDraftsResponse>(
        res,
        "Failed to load drafts",
      );
      setDrafts((current) => [...current, ...(data.drafts || [])]);
      setDraftsNextCursor(data.nextCursor ?? null);
      setHasMoreDrafts(Boolean(data.hasMore));
    } catch (error) {
      showErrorToast(error, {
        title: "Could not load more drafts",
        fallbackDescription: "Please try again.",
      });
    } finally {
      setLoadingMoreDrafts(false);
    }
  }, [draftsNextCursor, showErrorToast]);

  const fetchSends = useCallback(async () => {
    try {
      const res = await fetch("/api/email/sends");
      const data = await readJsonResponse<EmailSendsResponse>(
        res,
        "Failed to load sent emails",
      );
      setSends(data.sends || []);
    } catch (error) {
      showErrorToast(error, {
        title: "Could not load sent emails",
        fallbackDescription: "Please refresh the page and try again.",
      });
    } finally {
      setSendsLoaded(true);
    }
  }, [showErrorToast]);

  useEffect(() => {
    void fetchJobs();
    void fetchDrafts();
    void fetchSends();
  }, [fetchDrafts, fetchJobs, fetchSends]);

  const saveDraft = async () => {
    if (!selectedType || !generatedEmail) return;

    setSavingDraft(true);
    try {
      const context: Record<string, string> = {};
      if (interviewerName) context.interviewerName = interviewerName;
      if (interviewDate) context.interviewDate = interviewDate;
      if (targetCompany) context.targetCompany = targetCompany;
      if (connectionName) context.connectionName = connectionName;
      if (referenceName) context.referenceName = referenceName;
      if (recruiterName) context.recruiterName = recruiterName;
      if (recruiterCompany) context.recruiterCompany = recruiterCompany;
      if (recruiterStance) context.recruiterStance = recruiterStance;
      if (applyingRole) context.applyingRole = applyingRole;
      if (interviewStage) context.interviewStage = interviewStage;
      if (hookNote) context.hookNote = hookNote;
      if (customNote) context.customNote = customNote;

      if (editingDraftId) {
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

    if (draft.context) {
      setInterviewerName(draft.context.interviewerName || "");
      setInterviewDate(draft.context.interviewDate || "");
      setTargetCompany(draft.context.targetCompany || "");
      setConnectionName(draft.context.connectionName || "");
      setReferenceName(draft.context.referenceName || "");
      setRecruiterName(draft.context.recruiterName || "");
      setRecruiterCompany(draft.context.recruiterCompany || "");
      setRecruiterStance(
        draft.context.recruiterStance === "not_a_fit"
          ? "not_a_fit"
          : "interested",
      );
      setApplyingRole(draft.context.applyingRole || "");
      setInterviewStage(draft.context.interviewStage || "");
      setHookNote(draft.context.hookNote || "");
      setCustomNote(draft.context.customNote || "");
    }
    setDraftsSheetOpen(false);
  };

  const deleteDraft = async (draftId: string) => {
    const confirmed = await confirm({
      title: "Delete this email draft?",
      description:
        "This permanently removes the saved draft. The generated email currently on screen is not affected.",
      confirmLabel: "Delete",
    });
    if (!confirmed) return;

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
          referenceName: referenceName || undefined,
          recruiterName: recruiterName || undefined,
          recruiterCompany: recruiterCompany || undefined,
          recruiterStance,
          applyingRole: applyingRole || undefined,
          interviewStage: interviewStage || undefined,
          hookNote: hookNote || undefined,
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
    referenceName,
    recruiterName,
    recruiterCompany,
    recruiterStance,
    applyingRole,
    interviewStage,
    hookNote,
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

  const handleGmailSent = async (messageId?: string) => {
    if (!selectedType || !generatedEmail || !recipientEmail) return;

    try {
      const response = await fetch("/api/email/sends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          jobId: selectedJobId || undefined,
          recipient: recipientEmail,
          subject: generatedEmail.subject,
          body: generatedEmail.body,
          inReplyToDraftId: editingDraftId || undefined,
          gmailMessageId: messageId,
          status: "sent",
        }),
      });
      const data = await readJsonResponse<unknown>(
        response,
        "Failed to record sent email",
      );
      showAchievementToasts(extractUnlockedFromResponse(data), addToast);
      void fetchSends();
    } catch (error) {
      showErrorToast(error, {
        title: "Sent email was not recorded",
        fallbackDescription:
          "The Gmail send succeeded, but history did not update.",
      });
    }
  };

  const duplicateSend =
    SHOW_DUPLICATE_SEND_WARNING && selectedType
      ? findRecentDuplicateSend(sends, {
          type: selectedType,
          recipient: recipientEmail,
          windowDays: DUPLICATE_SEND_WINDOW_DAYS,
        })
      : null;

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
                  <SelectValue placeholder={a11yT("chooseAJobApplication")} />
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
                  <SelectValue
                    placeholder={a11yT("chooseTheJobYouInterviewedFor")}
                  />
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

      case "cold_outreach":
        return (
          <div className="space-y-4">
            <div>
              <Label>Target Company</Label>
              <Input
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                placeholder="e.g., Linear"
              />
            </div>
            <div>
              <Label>Hiring Manager or Engineer</Label>
              <Input
                value={connectionName}
                onChange={(e) => setConnectionName(e.target.value)}
                placeholder="e.g., Priya Shah"
              />
            </div>
            <div>
              <Label>Custom Hook</Label>
              <Textarea
                value={hookNote}
                onChange={(e) => setHookNote(e.target.value)}
                placeholder={a11yT(
                  "mentionARecentProjectSharedInterestOrCompany",
                )}
                rows={3}
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
                  <SelectValue placeholder={a11yT("chooseTheJobOffer")} />
                </SelectTrigger>
                <SelectContent>
                  {jobs
                    .filter((j) => j.status === "offer")
                    .map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.title} at {job.company}
                      </SelectItem>
                    ))}
                  {jobs.filter((j) => j.status === "offer").length === 0 && (
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
                placeholder={a11yT("addAnySpecificPointsYouWantToMention")}
                rows={3}
              />
            </div>
          </div>
        );

      case "recruiter_reply":
        return (
          <div className="space-y-4">
            <div>
              <Label>Recruiter Name</Label>
              <Input
                value={recruiterName}
                onChange={(e) => setRecruiterName(e.target.value)}
                placeholder="e.g., Morgan Lee"
              />
            </div>
            <div>
              <Label>Company</Label>
              <Input
                value={recruiterCompany}
                onChange={(e) => setRecruiterCompany(e.target.value)}
                placeholder="e.g., Stripe"
              />
            </div>
            <div>
              <Label>Reply Type</Label>
              <Select
                value={recruiterStance}
                onValueChange={(value) =>
                  setRecruiterStance(
                    value === "not_a_fit" ? "not_a_fit" : "interested",
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={a11yT("chooseAReplyType")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="interested">Interested</SelectItem>
                  <SelectItem value="not_a_fit">Not the right fit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Custom Note (optional)</Label>
              <Textarea
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder={a11yT(
                  "addConstraintsTimingCompensationExpectationsOrAFuture",
                )}
                rows={3}
              />
            </div>
          </div>
        );

      case "reference_request":
        return (
          <div className="space-y-4">
            <div>
              <Label>Select Job (optional)</Label>
              <Select
                value={selectedJobId}
                onValueChange={(value) => {
                  setSelectedJobId(value);
                  const job = jobs.find((candidate) => candidate.id === value);
                  if (job) {
                    setTargetCompany(job.company);
                    setApplyingRole(job.title);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={a11yT("chooseTheRoleYouReApplyingFor")}
                  />
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
            <div>
              <Label>Reference Name</Label>
              <Input
                value={referenceName}
                onChange={(e) => setReferenceName(e.target.value)}
                placeholder="e.g., Alex Chen"
              />
            </div>
            <div>
              <Label>Role</Label>
              <Input
                value={applyingRole}
                onChange={(e) => setApplyingRole(e.target.value)}
                placeholder="e.g., Senior Product Designer"
              />
            </div>
            <div>
              <Label>Company</Label>
              <Input
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                placeholder="e.g., Figma"
              />
            </div>
            <div>
              <Label>Interview Stage</Label>
              <Input
                value={interviewStage}
                onChange={(e) => setInterviewStage(e.target.value)}
                placeholder="e.g., final round"
              />
            </div>
            <div>
              <Label>Custom Note (optional)</Label>
              <Textarea
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder={a11yT("addARecentAccomplishmentOrProjectToRemind")}
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
    <>
      <div
        className={
          selectedType
            ? getResponsiveDetailGridClass(true)
            : getResponsiveDetailGridClass(false, "comfortable")
        }
      >
        <div className="space-y-6">
          <PagePanel>
            <PagePanelHeader
              title={a11yT("chooseTemplate")}
              className="mb-4"
              action={
                <Suspense fallback={<EmailActionsSkeleton />}>
                  <div
                    className="flex flex-wrap justify-end gap-2"
                    data-testid="emails-actions"
                  >
                    {draftsLoaded ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDraftsSheetOpen(true)}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Drafts ({drafts.length})
                      </Button>
                    ) : (
                      <SkeletonButton className="h-9 w-32" />
                    )}
                    {sendsLoaded ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSentSheetOpen(true)}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Sent ({sends.length})
                      </Button>
                    ) : (
                      <SkeletonButton className="h-9 w-28" />
                    )}
                  </div>
                </Suspense>
              }
            />
            <Suspense fallback={<EmailTemplateFormSkeleton />}>
              <div data-testid="emails-template-form">
                <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {TEMPLATE_ORDER.map((type) => {
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
                        className={`flex items-start gap-4 rounded-lg border p-4 text-left transition-all ${
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
                  })}
                </div>
              </div>
            </Suspense>
          </PagePanel>

          {selectedType && (
            <PagePanel>
              <PagePanelHeader title={a11yT("customize")} className="mb-4" />
              {jobsLoaded ? (
                renderContextFields()
              ) : (
                <SkeletonButton className="h-10 w-full" />
              )}

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
            </PagePanel>
          )}
        </div>

        {selectedType && (
          <PagePanel
            className="opacity-100 transition-all duration-300 ease-out animate-in fade-in slide-in-from-right-4"
            data-testid="emails-preview"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold tracking-tight">
                Preview
              </h2>
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
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Subject
                  </Label>
                  <div className="mt-1 p-3 rounded-lg bg-muted/50 font-medium">
                    {generatedEmail.subject}
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Body</Label>
                  <div className="mt-1 p-4 rounded-lg bg-muted/50 whitespace-pre-wrap text-sm leading-relaxed max-h-[400px] overflow-y-auto">
                    {generatedEmail.body}
                  </div>
                </div>

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

                <Suspense fallback={<SkeletonButton className="h-10 w-full" />}>
                  {sendsLoaded && duplicateSend ? (
                    <DuplicateSendWarning
                      recipient={recipientEmail}
                      sentAt={duplicateSend.sentAt}
                    />
                  ) : null}
                </Suspense>

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
                    onSuccess={handleGmailSent}
                  />
                </div>

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
          </PagePanel>
        )}
      </div>
      <DraftsSheet
        open={draftsSheetOpen}
        onOpenChange={setDraftsSheetOpen}
        drafts={drafts}
        jobs={jobs}
        onLoadDraft={loadDraft}
        onDeleteDraft={(draftId) => void deleteDraft(draftId)}
        hasMore={hasMoreDrafts}
        loadingMore={loadingMoreDrafts}
        onLoadMore={() => void loadMoreDrafts()}
      />
      <SentTimeline
        open={sentSheetOpen}
        onOpenChange={setSentSheetOpen}
        sends={sends}
        jobs={jobs}
        selectedJobId={selectedJobId}
      />
      {confirmDialog}
    </>
  );
}

function EmailActionsSkeleton() {
  return (
    <div className="flex flex-wrap justify-end gap-2">
      <SkeletonButton className="h-9 w-32" />
      <SkeletonButton className="h-9 w-28" />
    </div>
  );
}

function EmailTemplateFormSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="rounded-lg border p-4">
          <div className="flex items-start gap-4">
            <SkeletonButton className="h-9 w-9" />
            <div className="flex-1 space-y-2">
              <SkeletonButton className="h-4 w-32" />
              <SkeletonButton className="h-4 w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
