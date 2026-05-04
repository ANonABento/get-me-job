"use client";

import {
  FormEvent,
  KeyboardEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { useErrorToast } from "@/hooks/use-error-toast";
import { readJsonResponse } from "@/lib/http";
import { cn } from "@/lib/utils";
import {
  OPPORTUNITY_JOB_TYPE_OPTIONS,
  OPPORTUNITY_LEVEL_OPTIONS,
  REMOTE_TYPE_OPTIONS,
  parseOptionalNumber,
  splitDelimitedList,
  trimToUndefined,
  type Opportunity,
  type OpportunityJobType,
  type OpportunityLevel,
  type OpportunitySource,
  type RemoteType,
} from "@/app/(app)/opportunities/utils";

type WizardStep = 0 | 1 | 2 | 3;
type ConfirmMode = "save-exit" | "discard" | null;

interface AddOpportunityWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => Promise<void> | void;
}

interface OpportunityWizardState {
  title: string;
  company: string;
  sourceUrl: string;
  source: OpportunitySource;
  city: string;
  province: string;
  country: string;
  postalCode: string;
  remoteType: RemoteType | "";
  jobType: OpportunityJobType | "";
  level: OpportunityLevel | "";
  salaryMin: string;
  salaryMax: string;
  salaryCurrency: string;
  compensationNotes: string;
  tags: string;
  techStack: string;
  requiredSkills: string;
  summary: string;
}

interface ScrapedOpportunityResponse {
  opportunity?: {
    title?: string;
    company?: string;
    location?: string;
    type?: string;
    remote?: boolean;
    salary?: string;
    description?: string;
    requirements?: string[];
    keywords?: string[];
    url?: string;
    source?: OpportunitySource;
  };
}

const DEFAULT_WIZARD_STATE: OpportunityWizardState = {
  title: "",
  company: "",
  sourceUrl: "",
  source: "manual",
  city: "",
  province: "",
  country: "",
  postalCode: "",
  remoteType: "",
  jobType: "",
  level: "",
  salaryMin: "",
  salaryMax: "",
  salaryCurrency: "USD",
  compensationNotes: "",
  tags: "",
  techStack: "",
  requiredSkills: "",
  summary: "",
};

const CURRENCY_OPTIONS = ["USD", "CAD", "EUR", "GBP", "JPY"];
const STEP_FIELDS: Array<Array<keyof OpportunityWizardState>> = [
  ["title", "company", "sourceUrl"],
  [
    "city",
    "province",
    "country",
    "postalCode",
    "remoteType",
    "jobType",
    "level",
  ],
  ["salaryMin", "salaryMax", "salaryCurrency", "compensationNotes"],
  ["tags", "techStack", "requiredSkills", "summary"],
];

export function AddOpportunityWizard({
  open,
  onOpenChange,
  onSaved,
}: AddOpportunityWizardProps) {
  const [form, setForm] = useState(DEFAULT_WIZARD_STATE);
  const [step, setStep] = useState<WizardStep>(0);
  const [furthestStep, setFurthestStep] = useState<WizardStep>(0);
  const [dirtyFields, setDirtyFields] = useState<
    Set<keyof OpportunityWizardState>
  >(() => new Set());
  const [autoFilledFields, setAutoFilledFields] = useState<
    Set<keyof OpportunityWizardState>
  >(() => new Set());
  const [showRequiredHint, setShowRequiredHint] = useState(false);
  const [confirmMode, setConfirmMode] = useState<ConfirmMode>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeHint, setScrapeHint] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const showErrorToast = useErrorToast();
  const { addToast } = useToast();

  const isStepOneValid = form.title.trim() !== "" && form.company.trim() !== "";
  const hasDirtyFields = dirtyFields.size > 0;
  const currentStepIsDirty = STEP_FIELDS[step].some((field) =>
    dirtyFields.has(field),
  );

  useEffect(() => {
    if (!open) return;
    resetWizard();
    window.setTimeout(() => titleRef.current?.focus(), 0);
  }, [open]);

  function resetWizard() {
    setForm(DEFAULT_WIZARD_STATE);
    setStep(0);
    setFurthestStep(0);
    setDirtyFields(new Set());
    setAutoFilledFields(new Set());
    setShowRequiredHint(false);
    setConfirmMode(null);
    setIsSaving(false);
    setIsScraping(false);
    setScrapeHint(false);
  }

  function closeAndReset() {
    resetWizard();
    onOpenChange(false);
  }

  function requestClose(nextOpen: boolean) {
    if (nextOpen) {
      onOpenChange(true);
      return;
    }

    if (hasDirtyFields) {
      setConfirmMode("discard");
      return;
    }

    closeAndReset();
  }

  function updateForm<T extends keyof OpportunityWizardState>(
    key: T,
    value: OpportunityWizardState[T],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setDirtyFields((current) => new Set(current).add(key));
    setAutoFilledFields((current) => {
      if (!current.has(key)) return current;
      const next = new Set(current);
      next.delete(key);
      return next;
    });
  }

  function applyScrapedFields(
    fields: Partial<OpportunityWizardState>,
    source: OpportunitySource = "url",
  ) {
    const entries = Object.entries(fields).filter(([, value]) => value);
    if (entries.length === 0) return;

    setForm((current) => ({
      ...current,
      source,
      ...Object.fromEntries(entries),
    }));
    setAutoFilledFields((current) => {
      const next = new Set(current);
      entries.forEach(([key]) => next.add(key as keyof OpportunityWizardState));
      return next;
    });
  }

  function goNext() {
    if (step === 0 && !isStepOneValid) {
      setShowRequiredHint(true);
      return;
    }

    if (step < 3) {
      const nextStep = (step + 1) as WizardStep;
      setStep(nextStep);
      setFurthestStep((current) => Math.max(current, nextStep) as WizardStep);
    }
  }

  async function scrapeUrl() {
    const url = form.sourceUrl.trim();
    if (!url) return;

    setIsScraping(true);
    setScrapeHint(false);
    try {
      const response = await fetch("/api/opportunities/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (response.status === 429) {
        addToast({
          type: "warning",
          title: "Too many scrape requests — please wait and try again.",
        });
        return;
      }

      const data = await readJsonResponse<ScrapedOpportunityResponse>(
        response,
        "Failed to scrape opportunity",
      );
      if (!data.opportunity) return;

      const mapped = mapScrapedOpportunityToWizard(data.opportunity);
      applyScrapedFields(mapped, data.opportunity.source ?? "url");
      addToast({
        type: "success",
        title: `Filled in from ${new URL(url).hostname}`,
      });
    } catch {
      setScrapeHint(true);
    } finally {
      setIsScraping(false);
    }
  }

  async function saveOpportunity() {
    if (!isStepOneValid) {
      setStep(0);
      setShowRequiredHint(true);
      return;
    }

    setIsSaving(true);
    const now = new Date().toISOString();
    const nextOpportunity = buildCreateOpportunity(form, now);

    try {
      const response = await fetch("/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextOpportunity),
      });
      await readJsonResponse<{ opportunity?: Opportunity }>(
        response,
        "Failed to create opportunity",
      );
      await onSaved();
      closeAndReset();
    } catch (error) {
      showErrorToast(error, {
        title: "Could not create opportunity",
        fallbackDescription: "Please check the details and try again.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step < 3) {
      goNext();
      return;
    }
    void saveOpportunity();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if (event.key === "Enter" && event.target instanceof HTMLTextAreaElement) {
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      if (step < 3) goNext();
      else void saveOpportunity();
    }
  }

  async function confirmSaveAndExit() {
    setConfirmMode(null);
    await saveOpportunity();
  }

  const stepContent = (() => {
    if (step === 0) {
      return (
        <div className="grid gap-4">
          <WizardField
            label="Title"
            id="opportunity-title"
            required
            autoFilled={autoFilledFields.has("title")}
          >
            <Input
              ref={titleRef}
              id="opportunity-title"
              value={form.title}
              onBlur={() => {
                if (!form.title.trim()) setShowRequiredHint(true);
              }}
              onChange={(event) => updateForm("title", event.target.value)}
            />
          </WizardField>
          <WizardField
            label="Company"
            id="opportunity-company"
            required
            autoFilled={autoFilledFields.has("company")}
          >
            <Input
              id="opportunity-company"
              value={form.company}
              onBlur={() => {
                if (!form.company.trim()) setShowRequiredHint(true);
              }}
              onChange={(event) => updateForm("company", event.target.value)}
            />
          </WizardField>
          <WizardField
            label="URL"
            id="opportunity-source-url"
            aside={
              isScraping ? (
                <span className="text-xs text-muted-foreground">
                  Fetching...
                </span>
              ) : scrapeHint ? (
                <span
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground"
                  title="The site may not be supported or the posting could not be reached."
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  Couldn&apos;t auto-fill
                </span>
              ) : null
            }
            autoFilled={autoFilledFields.has("sourceUrl")}
          >
            <Input
              id="opportunity-source-url"
              value={form.sourceUrl}
              onBlur={() => void scrapeUrl()}
              onChange={(event) => updateForm("sourceUrl", event.target.value)}
              placeholder="https://..."
            />
          </WizardField>
        </div>
      );
    }

    if (step === 1) {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <WizardField
            label="City"
            id="opportunity-city"
            autoFilled={autoFilledFields.has("city")}
          >
            <Input
              id="opportunity-city"
              value={form.city}
              onChange={(event) => updateForm("city", event.target.value)}
            />
          </WizardField>
          <WizardField
            label="Province/State"
            id="opportunity-province"
            autoFilled={autoFilledFields.has("province")}
          >
            <Input
              id="opportunity-province"
              value={form.province}
              onChange={(event) => updateForm("province", event.target.value)}
            />
          </WizardField>
          <WizardField
            label="Country"
            id="opportunity-country"
            autoFilled={autoFilledFields.has("country")}
          >
            <Input
              id="opportunity-country"
              value={form.country}
              onChange={(event) => updateForm("country", event.target.value)}
            />
          </WizardField>
          <WizardField label="Postal code" id="opportunity-postal-code">
            <Input
              id="opportunity-postal-code"
              value={form.postalCode}
              onChange={(event) => updateForm("postalCode", event.target.value)}
            />
          </WizardField>
          <WizardField label="Remote type" id="opportunity-remote-type">
            <Select
              value={form.remoteType || "unset"}
              onValueChange={(value) =>
                updateForm(
                  "remoteType",
                  value === "unset" ? "" : (value as RemoteType),
                )
              }
            >
              <SelectTrigger id="opportunity-remote-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unset">Select remote type</SelectItem>
                {REMOTE_TYPE_OPTIONS.filter(
                  (option) => option.value !== "all",
                ).map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label === "Onsite" ? "On-site" : option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </WizardField>
          <WizardField label="Job type" id="opportunity-job-type">
            <Select
              value={form.jobType || "unset"}
              onValueChange={(value) =>
                updateForm(
                  "jobType",
                  value === "unset" ? "" : (value as OpportunityJobType),
                )
              }
            >
              <SelectTrigger id="opportunity-job-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unset">Select job type</SelectItem>
                {OPPORTUNITY_JOB_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </WizardField>
          <WizardField label="Level" id="opportunity-level">
            <Select
              value={form.level || "unset"}
              onValueChange={(value) =>
                updateForm(
                  "level",
                  value === "unset" ? "" : (value as OpportunityLevel),
                )
              }
            >
              <SelectTrigger id="opportunity-level">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unset">Select level</SelectItem>
                {OPPORTUNITY_LEVEL_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.value === "intermediate" ? "Mid" : option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </WizardField>
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="grid gap-4 md:grid-cols-3">
          <WizardField label="Salary min" id="opportunity-salary-min">
            <Input
              id="opportunity-salary-min"
              type="number"
              min="0"
              value={form.salaryMin}
              onChange={(event) => updateForm("salaryMin", event.target.value)}
            />
          </WizardField>
          <WizardField label="Salary max" id="opportunity-salary-max">
            <Input
              id="opportunity-salary-max"
              type="number"
              min="0"
              value={form.salaryMax}
              onChange={(event) => updateForm("salaryMax", event.target.value)}
            />
          </WizardField>
          <WizardField label="Currency" id="opportunity-currency">
            <Select
              value={form.salaryCurrency}
              onValueChange={(value) => updateForm("salaryCurrency", value)}
            >
              <SelectTrigger id="opportunity-currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_OPTIONS.map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </WizardField>
          <WizardField
            label="Equity / bonus notes"
            id="opportunity-compensation-notes"
            className="md:col-span-3"
          >
            <Textarea
              id="opportunity-compensation-notes"
              className="min-h-24"
              value={form.compensationNotes}
              onChange={(event) =>
                updateForm("compensationNotes", event.target.value)
              }
            />
          </WizardField>
        </div>
      );
    }

    return (
      <div className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-3">
          <WizardField
            label="Tags"
            id="opportunity-tags"
            autoFilled={autoFilledFields.has("tags")}
          >
            <Input
              id="opportunity-tags"
              value={form.tags}
              onChange={(event) => updateForm("tags", event.target.value)}
              placeholder="frontend, platform"
            />
          </WizardField>
          <WizardField
            label="Tech stack"
            id="opportunity-tech-stack"
            autoFilled={autoFilledFields.has("techStack")}
          >
            <Input
              id="opportunity-tech-stack"
              value={form.techStack}
              onChange={(event) => updateForm("techStack", event.target.value)}
              placeholder="React, TypeScript"
            />
          </WizardField>
          <WizardField
            label="Required skills"
            id="opportunity-required-skills"
            autoFilled={autoFilledFields.has("requiredSkills")}
          >
            <Input
              id="opportunity-required-skills"
              value={form.requiredSkills}
              onChange={(event) =>
                updateForm("requiredSkills", event.target.value)
              }
              placeholder="Accessibility, Testing"
            />
          </WizardField>
        </div>
        <WizardField
          label="Summary / job description"
          id="opportunity-summary"
          autoFilled={autoFilledFields.has("summary")}
        >
          <Textarea
            id="opportunity-summary"
            value={form.summary}
            onChange={(event) => updateForm("summary", event.target.value)}
            className="min-h-72"
          />
        </WizardField>
      </div>
    );
  })();

  return (
    <Dialog open={open} onOpenChange={requestClose}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <div
            className="mb-2 flex justify-center gap-2"
            aria-label="Wizard progress"
          >
            {[0, 1, 2, 3].map((index) => (
              <button
                key={index}
                type="button"
                aria-label={`Go to step ${index + 1}`}
                disabled={index > furthestStep}
                onClick={() => setStep(index as WizardStep)}
                className={cn(
                  "text-lg leading-none text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
                  step === index && "text-foreground",
                )}
              >
                {step === index ? "●" : "○"}
              </button>
            ))}
          </div>
          <DialogTitle>Add Opportunity</DialogTitle>
          <DialogDescription>{getStepDescription(step)}</DialogDescription>
        </DialogHeader>

        <form
          className="space-y-6"
          onSubmit={handleSubmit}
          onKeyDown={handleKeyDown}
        >
          {stepContent}

          <DialogFooter className="items-center gap-2 sm:justify-between sm:space-x-0">
            {showRequiredHint && step === 0 ? (
              <p className="text-sm text-muted-foreground">
                Title and Company are required
              </p>
            ) : (
              <span />
            )}
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              {step > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep((step - 1) as WizardStep)}
                >
                  ← Back
                </Button>
              )}
              {step > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSaving}
                  onClick={() => {
                    if (currentStepIsDirty) setConfirmMode("save-exit");
                    else void saveOpportunity();
                  }}
                >
                  Save & exit
                </Button>
              )}
              {step < 3 ? (
                <Button
                  type="submit"
                  variant="gradient"
                  disabled={step === 0 && !isStepOneValid}
                  onClick={() => {
                    if (step === 0 && !isStepOneValid)
                      setShowRequiredHint(true);
                  }}
                >
                  Next →
                </Button>
              ) : (
                <Button type="submit" variant="gradient" disabled={isSaving}>
                  Save
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>

        {confirmMode && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 p-4">
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="opportunity-wizard-confirm-title"
              className="w-full max-w-md rounded-[var(--radius)] border bg-background p-5 shadow-[var(--shadow-elevated)]"
            >
              <h2
                id="opportunity-wizard-confirm-title"
                className="text-lg font-semibold"
              >
                {confirmMode === "save-exit"
                  ? "Save with the data you've filled?"
                  : "Discard changes?"}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {confirmMode === "save-exit"
                  ? "You can complete the rest later."
                  : "This will clear the wizard and close the modal."}
              </p>
              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                {confirmMode === "save-exit" ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={closeAndReset}
                    >
                      Discard
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setConfirmMode(null)}
                    >
                      Keep editing
                    </Button>
                    <Button
                      type="button"
                      variant="gradient"
                      onClick={() => void confirmSaveAndExit()}
                    >
                      Save & exit
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setConfirmMode(null)}
                    >
                      Keep editing
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={closeAndReset}
                    >
                      Discard
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function WizardField({
  label,
  id,
  children,
  required = false,
  autoFilled = false,
  aside,
  className,
}: {
  label: string;
  id: string;
  children: ReactNode;
  required?: boolean;
  autoFilled?: boolean;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex min-h-5 items-center justify-between gap-3">
        <Label
          htmlFor={id}
          className="flex items-center gap-2 text-sm font-medium"
        >
          <span>
            {label}
            {required && (
              <span title="Required to save" className="ml-1 text-destructive">
                *
              </span>
            )}
          </span>
          {autoFilled && (
            <span className="rounded-full border bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
              ↺ auto-filled
            </span>
          )}
        </Label>
        {aside}
      </div>
      {children}
    </div>
  );
}

function getStepDescription(step: WizardStep) {
  if (step === 0) return "Step 1 of 4: Essentials";
  if (step === 1) return "Step 2 of 4: Where & how";
  if (step === 2) return "Step 3 of 4: Compensation";
  return "Step 4 of 4: Details + Save";
}

export function mapScrapedOpportunityToWizard(
  opportunity: NonNullable<ScrapedOpportunityResponse["opportunity"]>,
): Partial<OpportunityWizardState> {
  const location = parseLocation(opportunity.location);
  return {
    title: opportunity.title,
    company: opportunity.company,
    sourceUrl: opportunity.url,
    city: location.city,
    province: location.province,
    country: location.country,
    remoteType: opportunity.remote ? "remote" : undefined,
    jobType: mapJobType(opportunity.type),
    salaryCurrency: opportunity.salary ? "USD" : undefined,
    compensationNotes: opportunity.salary,
    summary: opportunity.description,
    requiredSkills: opportunity.requirements?.join(", "),
    tags: opportunity.keywords?.join(", "),
    techStack: opportunity.keywords?.join(", "),
  };
}

function parseLocation(location?: string) {
  const parts = (location ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  return {
    city: parts[0],
    province: parts.length > 2 ? parts[1] : undefined,
    country: parts.length > 1 ? parts[parts.length - 1] : undefined,
  };
}

function mapJobType(type?: string): OpportunityJobType | undefined {
  const normalized = type?.toLowerCase();
  if (!normalized) return undefined;
  if (normalized.includes("part")) return "part-time";
  if (normalized.includes("contract")) return "contract";
  if (normalized.includes("intern")) return "internship";
  if (normalized.includes("co-op") || normalized.includes("coop"))
    return "co-op";
  if (normalized.includes("full")) return "full-time";
  return undefined;
}

function buildCreateOpportunity(
  form: OpportunityWizardState,
  now: string,
): Opportunity {
  return {
    id: window.crypto?.randomUUID?.() ?? `opp-${now}`,
    type: "job",
    title: form.title.trim(),
    company: form.company.trim(),
    source: form.source,
    sourceUrl: trimToUndefined(form.sourceUrl),
    city: trimToUndefined(form.city),
    province: trimToUndefined(form.province),
    country: trimToUndefined(form.country),
    postalCode: trimToUndefined(form.postalCode),
    remoteType: form.remoteType || undefined,
    jobType: form.jobType || undefined,
    level: form.level || undefined,
    salaryMin: parseOptionalNumber(form.salaryMin),
    salaryMax: parseOptionalNumber(form.salaryMax),
    salaryCurrency: form.salaryCurrency.trim() || "USD",
    additionalInfo: trimToUndefined(form.compensationNotes),
    summary:
      form.summary.trim() || `${form.title.trim()} at ${form.company.trim()}`,
    requiredSkills: splitDelimitedList(form.requiredSkills),
    techStack: splitDelimitedList(form.techStack),
    status: "saved",
    scrapedAt: now,
    tags: splitDelimitedList(form.tags),
    createdAt: now,
    updatedAt: now,
  };
}
