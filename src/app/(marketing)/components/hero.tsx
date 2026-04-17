import Link from "next/link";
import { ArrowRight, ScanSearch, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 hero-gradient overflow-hidden grain">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-primary/8 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-accent/6 via-transparent to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <ScanSearch className="h-4 w-4" />
            AI-Powered Resume Intelligence
            <Sparkles className="h-4 w-4" />
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            You&apos;re not lazy.{" "}
            <span className="gradient-text">You&apos;re efficient.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            Taida builds a knowledge bank from your career history, then
            generates perfectly tailored resumes for every job — so you
            can stop rewriting and start interviewing.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <Button
              asChild
              size="lg"
              variant="outline"
            >
              <Link href="/ats-scanner">
                <ScanSearch className="mr-2 h-5 w-5" />
                Try Free ATS Scanner
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="gradient-bg text-white hover:opacity-90 shadow-lg shadow-primary/25"
            >
              <Link href="/sign-up?redirect_url=/dashboard">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* Social proof */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-background flex items-center justify-center text-xs font-medium"
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <span>Join 10,000+ job seekers</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-border" />
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <svg
                  key={i}
                  className="w-4 h-4 text-amber-400 fill-current"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="ml-1">4.9/5 rating</span>
            </div>
          </div>
        </div>

        {/* App Preview */}
        <div className="mt-16 relative animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
          <div className="rounded-2xl border bg-card shadow-2xl overflow-hidden">
            <div className="p-4 border-b bg-muted/30 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 text-center text-sm text-muted-foreground">
                Taida Dashboard
              </div>
            </div>
            <div className="p-8 bg-gradient-to-br from-muted/20 to-muted/50">
              <div className="grid grid-cols-3 gap-4">
                {/* Mock stats */}
                <div className="p-4 rounded-xl bg-card border">
                  <div className="text-2xl font-bold text-primary">12</div>
                  <div className="text-sm text-muted-foreground">Jobs Tracked</div>
                </div>
                <div className="p-4 rounded-xl bg-card border">
                  <div className="text-2xl font-bold text-success">8</div>
                  <div className="text-sm text-muted-foreground">Applied</div>
                </div>
                <div className="p-4 rounded-xl bg-card border">
                  <div className="text-2xl font-bold text-amber-500">3</div>
                  <div className="text-sm text-muted-foreground">Interviews</div>
                </div>
              </div>
              <div className="mt-4 h-32 rounded-xl bg-card border flex items-center justify-center text-muted-foreground">
                <span className="text-sm">Your personalized job dashboard</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
