import { Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "Columbus completely transformed my job search. The AI resume optimization helped me get callbacks from companies that never responded before.",
    author: "Sarah M.",
    role: "Software Engineer",
    company: "Now at Google",
  },
  {
    quote:
      "The interview prep feature is incredible. I practiced with the AI coach and felt so confident walking into my interviews. Landed my dream job in 3 weeks!",
    author: "Michael R.",
    role: "Product Manager",
    company: "Now at Stripe",
  },
  {
    quote:
      "I was applying to 50+ jobs with no response. After using Columbus to tailor my resume, my response rate went from 2% to 40%. Game changer!",
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
            Testimonials
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Loved by job seekers{" "}
            <span className="gradient-text">worldwide</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            See what our users have to say about their experience with Columbus.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.author}
              className="relative p-6 rounded-2xl border bg-card hover:shadow-lg transition-shadow duration-300"
            >
              {/* Quote icon */}
              <div className="absolute -top-3 -left-3 p-2 rounded-full bg-primary/10">
                <Quote className="h-4 w-4 text-primary" />
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg
                    key={i}
                    className="w-4 h-4 text-amber-400 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p className="text-muted-foreground mb-6 leading-relaxed">
                &quot;{testimonial.quote}&quot;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-violet-500/20 flex items-center justify-center text-sm font-medium">
                  {testimonial.author.charAt(0)}
                </div>
                <div>
                  <div className="font-medium">{testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role} · {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
