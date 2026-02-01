import Link from "next/link";
import { Upload, FileText, Briefcase, MessageSquare, ArrowRight } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome to Columbus</h1>
        <p className="mt-2 text-muted-foreground">
          Your personal job application command center. Upload your resume, match with jobs, and prepare for interviews.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <QuickAction
          title="Upload Resume"
          description="Start by uploading your resume to build your profile"
          href="/upload"
          icon={Upload}
          color="bg-blue-500"
        />
        <QuickAction
          title="View Profile"
          description="Review and edit your extracted information"
          href="/profile"
          icon={FileText}
          color="bg-green-500"
        />
        <QuickAction
          title="Add Job"
          description="Paste a job description to get a tailored resume"
          href="/jobs"
          icon={Briefcase}
          color="bg-purple-500"
        />
        <QuickAction
          title="Interview Prep"
          description="Practice with AI-powered interview simulation"
          href="/interview"
          icon={MessageSquare}
          color="bg-orange-500"
        />
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
        <div className="space-y-4">
          <Step number={1} title="Upload your resume" done={false}>
            Upload your current resume (PDF, DOCX, or TXT) to extract your professional information.
          </Step>
          <Step number={2} title="Review your profile" done={false}>
            Check the extracted data and make any corrections or additions.
          </Step>
          <Step number={3} title="Add a job description" done={false}>
            Paste a job posting to see how well you match and generate a tailored resume.
          </Step>
          <Step number={4} title="Prepare for interviews" done={false}>
            Use AI-powered mock interviews to practice and improve.
          </Step>
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  title,
  description,
  href,
  icon: Icon,
  color,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-xl border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/50"
    >
      <div className={`inline-flex rounded-lg ${color} p-3 text-white`}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <ArrowRight className="absolute bottom-6 right-6 h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
    </Link>
  );
}

function Step({
  number,
  title,
  done,
  children,
}: {
  number: number;
  title: string;
  done: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
          done
            ? "bg-green-500 text-white"
            : "border-2 border-muted-foreground/30 text-muted-foreground"
        }`}
      >
        {done ? "✓" : number}
      </div>
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{children}</p>
      </div>
    </div>
  );
}
