import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const benefits = [
  "Free to get started",
  "AI-powered resume optimization",
  "Unlimited job applications",
  "Mock interview practice",
];

export function CTASection() {
  return (
    <section className="py-20 lg:py-32 bg-muted/30">
      <div className="max-w-4xl mx-auto px-6 text-center">
        {/* Main CTA Box */}
        <div className="relative rounded-3xl border bg-card p-8 md:p-12 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-primary/5 via-transparent to-transparent rounded-full" />
            <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-violet-500/5 via-transparent to-transparent rounded-full" />
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Ready to land your{" "}
              <span className="gradient-text">dream job</span>?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of successful job seekers who have transformed their
              career journey with Columbus.
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

            {/* CTA Button */}
            <Button
              asChild
              size="lg"
              className="gradient-bg text-white hover:opacity-90 shadow-lg shadow-primary/25"
            >
              <Link href="/dashboard">
                Start Your Job Search
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required · Setup in 2 minutes
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
