import { Upload, User, Target, Trophy } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Your Resume",
    description:
      "Start by uploading your existing resume. Our AI instantly parses and organizes your professional information.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    number: "02",
    icon: User,
    title: "Build Your Profile",
    description:
      "Review and enhance your profile. Add skills, experiences, and achievements to maximize your match potential.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    number: "03",
    icon: Target,
    title: "Match With Jobs",
    description:
      "Add target jobs and get instant match scores. Generate tailored resumes optimized for each position.",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    number: "04",
    icon: Trophy,
    title: "Land Interviews",
    description:
      "Prepare with AI interview coaching. Practice answers, get feedback, and land your dream job with confidence.",
    gradient: "from-orange-500 to-amber-500",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 lg:py-32 bg-muted/30">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            How It Works
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            From resume to offer in{" "}
            <span className="gradient-text">four simple steps</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Our streamlined process takes the guesswork out of job hunting.
            Follow these steps to maximize your success.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-1/2 w-full h-px bg-gradient-to-r from-border via-primary/30 to-border" />
              )}

              <div className="relative z-10 flex flex-col items-center text-center">
                {/* Number badge */}
                <div className="text-4xl font-bold text-muted-foreground/20 mb-2">
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
