import { Users, FileText, ScanSearch } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "10,000+",
    label: "Job seekers using Taida",
    quote:
      "Taida completely transformed my job search. The AI resume optimization helped me get callbacks from companies that never responded before.",
    author: "Sarah M.",
    role: "Software Engineer",
    company: "Now at Google",
  },
  {
    icon: FileText,
    value: "50,000+",
    label: "Tailored resumes generated",
  },
  {
    icon: ScanSearch,
    value: "85%",
    label: "ATS pass rate after optimization",
    quote:
      "I was applying to 50+ jobs with no response. After using Taida to tailor my resume, my response rate went from 2% to 40%. Game changer!",
    author: "Jennifer L.",
    role: "Marketing Director",
    company: "Now at HubSpot",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-20 lg:py-32">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Social Proof
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Trusted by job seekers{" "}
            <span className="gradient-text">everywhere</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Thousands of professionals rely on Taida to land interviews faster.
            See what our users have to say about their experience with Taida.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="relative p-8 rounded-2xl border bg-card text-center hover:shadow-lg transition-shadow duration-300"
            >
              <div className="inline-flex p-3 rounded-xl bg-primary/10 text-primary mb-4">
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Testimonial placeholder */}
        <div className="mt-12 p-8 rounded-2xl border bg-card text-center">
          <p className="text-muted-foreground italic">
            &quot;Taida turned my 3-hour resume rewrite into a 5-minute task.
            I got callbacks from companies that never responded before.&quot;
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm font-medium">
              S
            </div>
            <div className="text-left">
              <div className="font-medium">Sarah M.</div>
              <div className="text-sm text-muted-foreground">
                Software Engineer
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
