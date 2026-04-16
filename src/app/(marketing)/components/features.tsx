import {
  Database,
  FileSearch,
  Wand2,
  ScanSearch,
} from "lucide-react";

const features = [
  {
    icon: Database,
    title: "Knowledge Bank",
    description:
      "Upload resumes, cover letters, and career docs. Taida chunks and indexes everything into a searchable knowledge bank — your career history, always ready.",
    gradient: "from-violet-500 to-purple-400",
  },
  {
    icon: FileSearch,
    title: "Smart Parser",
    description:
      "Deterministic section detection extracts experience, education, skills, and projects with precision. No LLM guesswork for structured data.",
    gradient: "from-rose-400 to-orange-400",
  },
  {
    icon: Wand2,
    title: "AI Tailoring",
    description:
      "Match your bank against any job description. Taida generates a tailored resume that highlights exactly what the role demands.",
    gradient: "from-blue-500 to-indigo-400",
  },
  {
    icon: ScanSearch,
    title: "ATS Scanner",
    description:
      "Score your resume against real ATS criteria — keyword matching, formatting, section completeness. Fix issues before you apply.",
    gradient: "from-amber-400 to-orange-400",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 lg:py-32">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Features
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Your career data,{" "}
            <span className="gradient-text">working for you</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Taida combines smart parsing with AI tailoring to turn your
            career history into job-winning resumes.
            Taida combines AI-powered tools with smart tracking to streamline
            your entire job search process.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl border bg-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
