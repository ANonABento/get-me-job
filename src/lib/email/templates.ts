import type { JobDescription, Profile, EmailTemplate, EmailTemplateType } from "@/types";

export interface EmailContext {
  job?: JobDescription;
  profile?: Profile;
  interviewerName?: string;
  interviewDate?: string;
  daysAfter?: number;
  targetCompany?: string;
  connectionName?: string;
  customNote?: string;
}

interface GeneratedEmail {
  subject: string;
  body: string;
  placeholders: string[];
}

const PLACEHOLDER_PATTERN = /\[([^\]]+)\]/g;

function extractPlaceholders(text: string): string[] {
  const matches = text.match(PLACEHOLDER_PATTERN);
  return matches ? Array.from(new Set(matches)) : [];
}

function formatDate(date?: string): string {
  if (!date) return "[DATE]";
  try {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  } catch {
    return date;
  }
}

export function generateFollowUpEmail(context: EmailContext): GeneratedEmail {
  const { job, profile, daysAfter = 7 } = context;
  const name = profile?.contact?.name || "[YOUR NAME]";
  const jobTitle = job?.title || "[JOB TITLE]";
  const company = job?.company || "[COMPANY]";

  const subject = `Following Up - ${jobTitle} Application`;

  const body = `Dear Hiring Manager,

I hope this message finds you well. I am writing to follow up on my application for the ${jobTitle} position at ${company}, which I submitted ${daysAfter} days ago.

I remain very enthusiastic about the opportunity to contribute to ${company}'s team. My background in ${profile?.experiences?.[0]?.title || "[YOUR FIELD]"} aligns well with the requirements of this role, and I am confident I could make a meaningful impact.

I would welcome the opportunity to discuss how my skills and experience could benefit your team. Please let me know if you need any additional information from my end.

Thank you for your time and consideration. I look forward to hearing from you.

Best regards,
${name}
${profile?.contact?.email || "[YOUR EMAIL]"}
${profile?.contact?.phone || "[YOUR PHONE]"}`;

  return {
    subject,
    body,
    placeholders: extractPlaceholders(body),
  };
}

export function generateThankYouEmail(context: EmailContext): GeneratedEmail {
  const { job, profile, interviewerName, interviewDate } = context;
  const name = profile?.contact?.name || "[YOUR NAME]";
  const jobTitle = job?.title || "[JOB TITLE]";
  const company = job?.company || "[COMPANY]";
  const interviewer = interviewerName || "[INTERVIEWER NAME]";

  const subject = `Thank You - ${jobTitle} Interview`;

  const body = `Dear ${interviewer},

Thank you for taking the time to meet with me ${interviewDate ? `on ${formatDate(interviewDate)}` : "today"} to discuss the ${jobTitle} position at ${company}.

I thoroughly enjoyed learning more about the role and the team. Our conversation reinforced my enthusiasm for this opportunity, particularly [SPECIFIC ASPECT DISCUSSED].

I am excited about the possibility of contributing to ${company}'s success and believe my experience in ${profile?.experiences?.[0]?.title || "[YOUR FIELD]"} would be valuable to your team.

Please don't hesitate to reach out if you need any additional information. I look forward to the next steps in the process.

Best regards,
${name}
${profile?.contact?.email || "[YOUR EMAIL]"}`;

  return {
    subject,
    body,
    placeholders: extractPlaceholders(body),
  };
}

export function generateNetworkingEmail(context: EmailContext): GeneratedEmail {
  const { profile, targetCompany, connectionName } = context;
  const name = profile?.contact?.name || "[YOUR NAME]";
  const company = targetCompany || "[TARGET COMPANY]";
  const connection = connectionName || "[CONNECTION NAME]";

  const subject = `Introduction - ${name} | Interest in ${company}`;

  const body = `Dear ${connection},

I hope this message finds you well. My name is ${name}, and I am reaching out because I am very interested in opportunities at ${company}.

I noticed your profile on [PLATFORM] and was impressed by your work at ${company}. I am currently ${profile?.experiences?.[0] ? `working as a ${profile.experiences[0].title} at ${profile.experiences[0].company}` : "exploring new opportunities"}, and I am particularly drawn to ${company}'s [SPECIFIC ASPECT OF COMPANY].

I would greatly appreciate the opportunity to learn more about your experience at ${company} and any insights you might have about the company culture and potential opportunities. Would you be open to a brief 15-20 minute call at your convenience?

Thank you for considering my request. I understand you are busy, and I truly appreciate any time you can spare.

Best regards,
${name}
${profile?.contact?.email || "[YOUR EMAIL]"}
${profile?.contact?.linkedin || "[YOUR LINKEDIN]"}`;

  return {
    subject,
    body,
    placeholders: extractPlaceholders(body),
  };
}

export function generateStatusInquiryEmail(context: EmailContext): GeneratedEmail {
  const { job, profile } = context;
  const name = profile?.contact?.name || "[YOUR NAME]";
  const jobTitle = job?.title || "[JOB TITLE]";
  const company = job?.company || "[COMPANY]";

  const subject = `Application Status Inquiry - ${jobTitle}`;

  const body = `Dear Hiring Manager,

I hope this message finds you well. I am writing to inquire about the status of my application for the ${jobTitle} position at ${company}.

I submitted my application on ${job?.appliedAt ? formatDate(job.appliedAt) : "[APPLICATION DATE]"} and remain very interested in this opportunity. I understand that the hiring process can take time, and I wanted to reaffirm my enthusiasm for the role.

If there are any updates on my application status or if you need any additional information from me, please do not hesitate to let me know.

Thank you for your time and consideration.

Best regards,
${name}
${profile?.contact?.email || "[YOUR EMAIL]"}
${profile?.contact?.phone || "[YOUR PHONE]"}`;

  return {
    subject,
    body,
    placeholders: extractPlaceholders(body),
  };
}

export function generateNegotiationEmail(context: EmailContext): GeneratedEmail {
  const { job, profile, customNote } = context;
  const name = profile?.contact?.name || "[YOUR NAME]";
  const jobTitle = job?.title || "[JOB TITLE]";
  const company = job?.company || "[COMPANY]";

  const subject = `${jobTitle} Offer - Discussion`;

  const body = `Dear [HIRING MANAGER NAME],

Thank you so much for extending the offer for the ${jobTitle} position at ${company}. I am truly excited about the opportunity to join your team and contribute to the company's success.

After careful consideration, I would like to discuss the compensation package. Based on my research of market rates for similar positions and my ${profile?.experiences?.length || 0}+ years of experience in this field, I was hoping we could explore a salary of [DESIRED SALARY].

${customNote || "I believe my skills and experience would bring significant value to the team, and I am confident we can find a mutually beneficial arrangement."}

I remain very enthusiastic about this opportunity and look forward to discussing this further at your earliest convenience.

Thank you for your consideration.

Best regards,
${name}
${profile?.contact?.email || "[YOUR EMAIL]"}`;

  return {
    subject,
    body,
    placeholders: extractPlaceholders(body),
  };
}

export function generateEmail(
  type: EmailTemplateType,
  context: EmailContext
): GeneratedEmail {
  switch (type) {
    case "follow_up":
      return generateFollowUpEmail(context);
    case "thank_you":
      return generateThankYouEmail(context);
    case "networking":
      return generateNetworkingEmail(context);
    case "status_inquiry":
      return generateStatusInquiryEmail(context);
    case "negotiation":
      return generateNegotiationEmail(context);
    default:
      throw new Error(`Unknown email type: ${type}`);
  }
}

export const EMAIL_TEMPLATE_INFO: Record<
  EmailTemplateType,
  { title: string; description: string; icon: string }
> = {
  follow_up: {
    title: "Follow-up Email",
    description: "Check on your application status after applying",
    icon: "Mail",
  },
  thank_you: {
    title: "Thank You Email",
    description: "Send gratitude after an interview",
    icon: "Heart",
  },
  networking: {
    title: "Networking Email",
    description: "Reach out to connections at target companies",
    icon: "Users",
  },
  status_inquiry: {
    title: "Status Inquiry",
    description: "Politely ask about your application progress",
    icon: "HelpCircle",
  },
  negotiation: {
    title: "Offer Negotiation",
    description: "Discuss salary and compensation",
    icon: "DollarSign",
  },
};
