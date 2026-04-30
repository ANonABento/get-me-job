"use client";

import { useState } from "react";
import { Briefcase, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useErrorToast } from "@/hooks/use-error-toast";
import { readJsonResponse } from "@/lib/http";
import { THEME_PRIMARY_GRADIENT_BUTTON_CLASSES } from "@/lib/theme/component-classes";
import type { JobDescription } from "@/types";

interface AddJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (job: JobDescription) => void;
}

interface NewJobForm {
  title: string;
  company: string;
  description: string;
  url: string;
}

interface CreateJobResponse {
  job?: JobDescription;
}

const EMPTY_FORM: NewJobForm = {
  title: "",
  company: "",
  description: "",
  url: "",
};

export function AddJobDialog({
  open,
  onOpenChange,
  onCreated,
}: AddJobDialogProps) {
  const [form, setForm] = useState<NewJobForm>(EMPTY_FORM);
  const [addingJob, setAddingJob] = useState(false);
  const showErrorToast = useErrorToast();

  const handleSubmit = async () => {
    if (!form.title || !form.company || !form.description) {
      return;
    }

    setAddingJob(true);

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await readJsonResponse<CreateJobResponse>(
        response,
        "Failed to add job",
      );

      if (!data.job) {
        throw new Error("Failed to add job");
      }

      setForm(EMPTY_FORM);
      onCreated(data.job);
      onOpenChange(false);
    } catch (error) {
      showErrorToast(error, {
        title: "Could not add job",
        fallbackDescription: "Please check the job details and try again.",
      });
    } finally {
      setAddingJob(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Add New Job
          </DialogTitle>
          <DialogDescription>
            Paste the job description to analyze your match and generate a
            tailored resume.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Job Title</Label>
              <Input
                value={form.title}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, title: event.target.value }))
                }
                placeholder="Software Engineer"
              />
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <Input
                value={form.company}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, company: event.target.value }))
                }
                placeholder="Acme Corp"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Job URL (optional)</Label>
            <Input
              value={form.url}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, url: event.target.value }))
              }
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label>Job Description</Label>
            <Textarea
              rows={10}
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              placeholder="Paste the full job description here..."
              className="resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              addingJob || !form.title || !form.company || !form.description
            }
            className={THEME_PRIMARY_GRADIENT_BUTTON_CLASSES}
          >
            {addingJob && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Add Job
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
