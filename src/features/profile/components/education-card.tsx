"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Education } from "@/types";
import { Trash2 } from "lucide-react";

interface EducationCardProps {
  education: Education;
  onChange: (education: Education) => void;
  onRemove: () => void;
}

export function EducationCard({
  education,
  onChange,
  onRemove,
}: EducationCardProps) {
  return (
    <div className="rounded-xl border p-4 bg-muted/30">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm">Institution</Label>
            <Input
              value={education.institution}
              onChange={(event) => onChange({ ...education, institution: event.target.value })}
              placeholder="University name"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Degree</Label>
            <Input
              value={education.degree}
              onChange={(event) => onChange({ ...education, degree: event.target.value })}
              placeholder="Bachelor's, Master's, etc."
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Field of Study</Label>
            <Input
              value={education.field}
              onChange={(event) => onChange({ ...education, field: event.target.value })}
              placeholder="Computer Science"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Graduation Year</Label>
            <Input
              value={education.endDate || ""}
              onChange={(event) => onChange({ ...education, endDate: event.target.value })}
              placeholder="2020"
            />
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onRemove} className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
