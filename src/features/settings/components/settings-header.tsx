import Link from "next/link";
import { ArrowLeft, Settings } from "lucide-react";

export function SettingsHeader() {
  return (
    <div className="hero-gradient border-b">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="space-y-4 animate-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Settings className="h-4 w-4" />
            Configuration
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            Configure your AI provider for resume parsing and interview preparation.
          </p>
        </div>
      </div>
    </div>
  );
}

