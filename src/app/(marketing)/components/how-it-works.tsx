import { Upload, Database, FileOutput } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload",
    description:
      "Drop in your resumes, cover letters, and career docs. Taida parses and organizes everything automatically.",
    gradient: "from-violet-500 to-purple-400",
  },
  {
    number: "02",
    icon: Database,
    title: "Bank",
    description:
      "Your career data is chunked, indexed, and stored in a searchable knowledge bank — ready to be assembled on demand.",
    gradient: "from-rose-400 to-orange-400",
  },
  {
    number: "03",
    icon: FileOutput,
    title: "Build",
    description:
      "Paste a job description and Taida generates a tailored resume pulling exactly the right experience from your bank.",
    gradient: "from-blue-500 to-indigo-400",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 lg:py-32 bg-muted/30">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-sm font-medium text-foreground mb-4">
            How It Works
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            From upload to tailored resume in{" "}
            <span className="gradient-text">three steps</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            No more rewriting from scratch. Upload once, tailor endlessly.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-1/2 w-full h-px bg-gradient-to-r from-border via-primary/30 to-border" />
              )}

              <div className="relative z-10 flex flex-col items-center text-center">
                {/* Number badge */}
                <div className="text-4xl font-bold text-muted-foreground/80 mb-2">
                  {step.number}
                </div>

                {/* Icon */}
                <div
                  className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${step.gradient} text-white shadow-lg mb-4`}
                >
                  <step.icon className="h-8 w-8" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
