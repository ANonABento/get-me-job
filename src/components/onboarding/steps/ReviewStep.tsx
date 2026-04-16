"use client";

import { FileText, User, Briefcase, GraduationCap, Code } from "lucide-react";

const SECTIONS = [
  { icon: User, label: "Contact info" },
  { icon: Briefcase, label: "Work experience" },
  { icon: GraduationCap, label: "Education" },
  { icon: Code, label: "Skills & projects" },
] as const;

export function ReviewStep() {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-400 to-orange-400 text-white shadow-lg mb-6">
        <FileText className="h-10 w-10" />
      </div>
      <h2 className="text-2xl font-semibold">Review Your Profile</h2>
      <p className="text-base mt-2 text-muted-foreground">
        After uploading, review the extracted entries and edit anything that
        needs fixing.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        {SECTIONS.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 text-sm text-muted-foreground"
          >
            <Icon className="h-4 w-4 text-primary" />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
