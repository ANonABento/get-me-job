"use client";

import { PartyPopper } from "lucide-react";

export function DoneStep() {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-400 text-white shadow-lg mb-6">
        <PartyPopper className="h-10 w-10" />
      </div>
      <h2 className="text-2xl font-semibold">You&apos;re All Set!</h2>
      <p className="text-base mt-2 text-muted-foreground">
        Your knowledge bank is ready. Try tailoring a resume to a job
        description!
      </p>
    </div>
  );
}
