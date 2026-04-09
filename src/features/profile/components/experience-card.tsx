"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Experience } from "@/types";
import { Trash2 } from "lucide-react";

interface ExperienceCardProps {
  experience: Experience;
  onChange: (experience: Experience) => void;
  onRemove: () => void;
}

export function ExperienceCard({
  experience,
  onChange,
  onRemove,
}: ExperienceCardProps) {
  return (
    <div className="rounded-xl border p-4 space-y-4 bg-muted/30">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm">Company</Label>
            <Input
              value={experience.company}
              onChange={(event) => onChange({ ...experience, company: event.target.value })}
              placeholder="Company name"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Job Title</Label>
            <Input
              value={experience.title}
              onChange={(event) => onChange({ ...experience, title: event.target.value })}
              placeholder="Your role"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Start Date</Label>
            <Input
              value={experience.startDate}
              onChange={(event) => onChange({ ...experience, startDate: event.target.value })}
              placeholder="Jan 2020"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">End Date</Label>
            <Input
              value={experience.current ? "" : experience.endDate || ""}
              onChange={(event) => onChange({ ...experience, endDate: event.target.value })}
              placeholder={experience.current ? "Present" : "Dec 2023"}
              disabled={experience.current}
            />
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={experience.current}
                onChange={(event) =>
                  onChange({
                    ...experience,
                    current: event.target.checked,
                    endDate: event.target.checked ? undefined : experience.endDate,
                  })
                }
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-muted-foreground">I currently work here</span>
            </label>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onRemove} className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-2">
        <Label className="text-sm">Description</Label>
        <Textarea
          rows={3}
          value={experience.description}
          onChange={(event) => onChange({ ...experience, description: event.target.value })}
          placeholder="Describe your responsibilities and achievements..."
          className="resize-none"
        />
      </div>
    </div>
  );
}
