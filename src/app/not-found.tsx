import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
  description:
    "The page you're looking for doesn't exist. Head back to your dashboard to keep your job search moving.",
};

export default function NotFound() {
  return (
    <main className="relative min-h-screen flex items-center justify-center hero-gradient overflow-hidden grain px-6 py-16">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-primary/10 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-accent/8 via-transparent to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Compass className="h-4 w-4" />
          <span>Lost your way?</span>
        </div>

        <h1 className="text-7xl md:text-8xl font-bold tracking-tight mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          <span className="gradient-text">404</span>
        </h1>

        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          This page took a different career path.
        </h2>

        <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          We couldn&apos;t find what you were looking for. Let&apos;s get you
          back on track so you can keep applying.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
          <Button asChild size="lg" variant="outline">
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Back to home
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            className="gradient-bg text-white hover:opacity-90 shadow-lg shadow-primary/25"
          >
            <Link href="/dashboard">
              Go to Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
