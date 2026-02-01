import {
  Upload,
  Target,
  FileText,
  MessageSquare,
  ShieldCheck,
  BarChart3,
} from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "AI Resume Parsing",
    description:
      "Upload your resume and let AI extract your professional details instantly. No more manual data entry.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Target,
    title: "Job Match Scoring",
    description:
      "See how well you match with any job posting. Get instant compatibility scores and improvement suggestions.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: FileText,
    title: "Tailored Resumes",
    description:
      "Generate customized resumes for each application. Highlight the skills that matter most for each role.",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: MessageSquare,
    title: "AI Interview Coach",
    description:
      "Practice with realistic mock interviews. Get feedback on your answers and improve your confidence.",
    gradient: "from-orange-500 to-amber-500",
  },
  {
    icon: ShieldCheck,
    title: "ATS Optimization",
    description:
      "Ensure your resume passes applicant tracking systems. Get tips to improve ATS compatibility.",
    gradient: "from-rose-500 to-pink-500",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description:
      "Track all your applications in one place. See your funnel, success rates, and insights.",
    gradient: "from-indigo-500 to-blue-500",
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
            Everything you need to{" "}
            <span className="gradient-text">land your dream job</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Columbus combines AI-powered tools with smart tracking to streamline
            your entire job search process.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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

        {/* Stats Row */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "10K+", label: "Active Users" },
            { value: "50K+", label: "Resumes Optimized" },
            { value: "85%", label: "Interview Success Rate" },
            { value: "4.9/5", label: "User Rating" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
