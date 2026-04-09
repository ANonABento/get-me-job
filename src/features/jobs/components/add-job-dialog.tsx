"use client";

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
import type { AddJobDraft } from "@/features/jobs/client-types";
import { Briefcase, Loader2 } from "lucide-react";

interface AddJobDialogProps {
  addingJob: boolean;
  newJob: AddJobDraft;
  onNewJobChange: (job: AddJobDraft) => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  open: boolean;
}

export function AddJobDialog({
  addingJob,
  newJob,
  onNewJobChange,
  onOpenChange,
  onSubmit,
  open,
}: AddJobDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Add New Job
          </DialogTitle>
          <DialogDescription>
            Paste the job description to analyze your match and generate a tailored resume.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Job Title</Label>
              <Input
                value={newJob.title}
                onChange={(event) =>
                  onNewJobChange({ ...newJob, title: event.target.value })
                }
                placeholder="Software Engineer"
              />
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <Input
                value={newJob.company}
                onChange={(event) =>
                  onNewJobChange({ ...newJob, company: event.target.value })
                }
                placeholder="Acme Corp"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Job URL (optional)</Label>
            <Input
              value={newJob.url}
              onChange={(event) =>
                onNewJobChange({ ...newJob, url: event.target.value })
              }
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label>Job Description</Label>
            <Textarea
              rows={10}
              value={newJob.description}
              onChange={(event) =>
                onNewJobChange({ ...newJob, description: event.target.value })
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
            onClick={onSubmit}
            disabled={addingJob || !newJob.title || !newJob.company || !newJob.description}
            className="gradient-bg text-white hover:opacity-90"
          >
            {addingJob && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Add Job
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
