import Link from "next/link";
import { ArrowRight, ScanSearch, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const benefits = [
  "Free ATS scanner included",
  "Smart resume parsing",
  "Unlimited tailored resumes",
  "Knowledge bank for your career",
];

export function CTASection() {
  return (
    <section className="py-20 lg:py-32 bg-muted/30">
      <div className="max-w-4xl mx-auto px-6 text-center">
        {/* ATS Scanner CTA */}
        <div className="relative rounded-3xl border bg-card p-8 md:p-12 overflow-hidden mb-8">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-primary/5 via-transparent to-transparent rounded-full" />
            <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-accent/5 via-transparent to-transparent rounded-full" />
          </div>

          <div className="relative z-10">
            <div className="inline-flex p-3 rounded-xl bg-primary/10 text-primary mb-4">
              <ScanSearch className="h-8 w-8" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Try the free{" "}
              <span className="gradient-text">ATS Scanner</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Paste your resume and a job description. Get an instant ATS
              compatibility score with actionable fixes — no sign-up required.
            </p>

            <Button
              asChild
              size="lg"
              className="gradient-bg text-white hover:opacity-90 shadow-lg shadow-primary/25"
            >
              <Link href="/ats-scanner">
                Scan My Resume
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Get Started CTA */}
        <div className="relative rounded-3xl border bg-card p-8 md:p-12 overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
              Ready to stop rewriting{" "}
              <span className="gradient-text">resumes</span>?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of job seekers who build tailored resumes in
              minutes, not hours.
              Join thousands of successful job seekers who have transformed their
              career journey with Taida.
            </p>

            {/* Benefits */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-8">
              {benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <Check className="h-4 w-4 text-primary" />
                  {benefit}
                </div>
              ))}
            </div>

            <Button
              asChild
              size="lg"
              variant="outline"
            >
              <Link href="/sign-up?redirect_url=/dashboard">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
