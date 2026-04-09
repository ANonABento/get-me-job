"use client";

import { Upload, User } from "lucide-react";
import Link from "next/link";

export function EmptyProfileState() {
  return (
    <div className="min-h-screen">
      <div className="hero-gradient border-b">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold">My Profile</h1>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="rounded-2xl border bg-card p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted text-muted-foreground mb-6">
            <User className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold">No Profile Yet</h2>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Upload your resume to automatically extract your professional information, or start building your profile from scratch.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <Link
              href="/upload"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl gradient-bg text-white font-medium hover:opacity-90 transition-opacity"
            >
              <Upload className="h-5 w-5" />
              Upload Resume
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
