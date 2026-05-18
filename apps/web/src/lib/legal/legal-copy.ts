export const TERMS_LAST_UPDATED = "May 18, 2026";
export const PRIVACY_LAST_UPDATED = "May 18, 2026";
export const LEGAL_CONTACT_EMAIL = "support@slothing.work";

export interface LegalSection {
  title: string;
  body: string;
}

export const TERMS_SECTIONS: LegalSection[] = [
  {
    title: "Use of the service",
    body: "Slothing is provided to help you organize and improve your job search. You are responsible for the accuracy of the information you upload and for how you use any generated content in applications or interviews. You may use the service only for lawful personal or internal business purposes and must comply with laws, third-party site terms, and integration provider rules that apply to your use.",
  },
  {
    title: "Accounts and access",
    body: `Access is tied to your authenticated account. You are responsible for keeping your credentials secure and for reviewing integrations you authorize, including Google services and external AI providers. You must provide accurate account information, keep contact and billing details current, and promptly notify us at ${LEGAL_CONTACT_EMAIL} if you believe your account has been compromised.`,
  },
  {
    title: "Generated content",
    body: "AI-generated resumes, interview feedback, and outreach messages are assistive outputs. You should review them before relying on them in a professional context. As between you and Slothing, you keep ownership of the resumes, profiles, job notes, prompts, and other content you provide, and you may use generated content for your job search subject to these Terms. You grant Slothing the limited permission needed to host, process, generate, display, export, and improve the service for you.",
  },
  {
    title: "Availability",
    body: "The service may change over time, including integrations, file support, and export features. We may suspend access to protect the platform, perform maintenance, address abuse, or comply with legal and security requirements. We do not guarantee that the service, integrations, AI providers, or third-party job sites will always be available or error-free.",
  },
  {
    title: "Billing and refunds",
    body: `Paid plans, including any Pro tier, are billed according to the price, billing interval, and checkout terms shown when you subscribe. Subscriptions may renew automatically until canceled. You are responsible for applicable taxes and payment provider fees. Unless a checkout flow or applicable law states otherwise, fees are non-refundable after the paid period begins, and cancellation stops future renewal rather than refunding past use. To request a refund within 14 days of a charge, contact ${LEGAL_CONTACT_EMAIL} and we will review your request.`,
  },
  {
    title: "Termination",
    body: `You may stop using Slothing or cancel a paid plan at any time through the available account or billing controls, or by contacting ${LEGAL_CONTACT_EMAIL}. We may suspend or terminate access if you violate these Terms, create risk for the service or other users, fail to pay amounts due, or use the service unlawfully. Termination does not remove obligations that by their nature should continue, including payment obligations, ownership terms, disclaimers, liability limits, and dispute terms.`,
  },
  {
    title: "Acceptable use",
    body: "You may not misuse Slothing, attempt unauthorized access, scrape or overload the service, bypass rate limits, interfere with security, upload malicious code, infringe third-party rights, submit unlawful or deceptive content, resell or sublicense the service without permission, or use automation in a way that violates job site, Google, AI provider, or other third-party terms.",
  },
  {
    title: "Disclaimer and limitation of liability",
    body: "The product is offered on an as-is basis. It is intended to support your workflow, not to guarantee hiring outcomes, interview performance, or offer decisions. To the fullest extent permitted by law, Slothing disclaims implied warranties of merchantability, fitness for a particular purpose, non-infringement, and uninterrupted or error-free operation. Slothing will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for lost profits, lost data, or lost opportunities arising from your use of the service.",
  },
  {
    title: "Indemnification",
    body: "You agree to defend, indemnify, and hold Slothing harmless from claims, damages, liabilities, costs, and expenses arising from your content, your use of the service, your breach of these Terms, or your violation of law or third-party rights.",
  },
  {
    title: "Governing law",
    body: "These Terms are governed by the laws of the State of Delaware and applicable United States federal law, without regard to conflict-of-law rules. This governing law clause does not limit consumer protection rights that cannot be waived under the laws of your place of residence.",
  },
  {
    title: "Disputes",
    body: `Before filing a claim, you agree to contact ${LEGAL_CONTACT_EMAIL} so we can try to resolve the issue informally. If we cannot resolve it within 30 days, either party may bring an individual claim in the state or federal courts located in Delaware, and both parties consent to personal jurisdiction and venue there. Claims must be brought individually and not as a plaintiff or class member in a class, consolidated, or representative action, except where applicable law gives you a non-waivable right to proceed otherwise.`,
  },
];

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    title: "What we collect",
    body: "Slothing stores the profile, resume, job tracking, reminder, and interview preparation data you add to the product. If you connect Google services, the app also stores the minimum tokens and metadata needed to sync with those tools. We may also collect account identifiers, email address, usage events, device and log information, and files or text you upload for parsing, generation, export, or troubleshooting.",
  },
  {
    title: "How we use it",
    body: "Your data is used to power application tracking, document parsing, analytics, calendar exports, reminders, and AI-assisted features you explicitly trigger. We do not sell your personal job search data. We may also use limited operational data to secure the service, prevent abuse, debug errors, improve product quality, and communicate important account or service updates.",
  },
  {
    title: "Data sharing",
    body: "Third-party providers are only involved when you use integrations or AI features, such as Google for sign-in and connected workflows, hosting and infrastructure providers, analytics and email tooling, or an LLM provider you configure in the app. These providers may process data on our behalf under their own security and privacy commitments. We may disclose information if required by law, to protect rights and safety, or as part of a corporate transaction.",
  },
  {
    title: "Retention and deletion",
    body: "You control the content you add. Deleting jobs, reminders, documents, or generated resumes removes them from the app's active workspace. Account records, audit logs, security records, billing records, and backup copies may remain for a limited period where needed for legal, security, fraud prevention, tax, accounting, disaster recovery, or operational purposes. Backup exports are created only when you request them.",
  },
  {
    title: "Your privacy rights",
    body: `Depending on where you live, you may have rights to request access to personal information we hold about you, correction of inaccurate information, deletion of your information, a portable copy of your information, restriction of certain processing, or an objection to certain uses. California residents may also have rights to know, delete, correct, and opt out of certain sharing or sale of personal information. We do not sell personal job search data. To exercise these rights, contact us at ${LEGAL_CONTACT_EMAIL}.`,
  },
  {
    title: "Cookies and local storage",
    body: "Slothing uses cookies and similar technologies for authentication, session management, locale preferences, security, and basic product functionality. For example, NextAuth may set cookies to keep you signed in. The browser extension uses browser local storage for extension state such as authentication tokens, dismissed domains, and settings needed to operate across job sites. You can control cookies through your browser settings, but disabling them may prevent sign-in or core features from working.",
  },
  {
    title: "Children's privacy",
    body: "Slothing is not directed to children under 13, and we do not knowingly collect personal information from children under 13. If you believe a child has provided personal information to Slothing, contact us so we can take appropriate deletion steps.",
  },
  {
    title: "International transfers",
    body: "Slothing and its providers may process information in countries other than where you live, including where Google services, hosting providers, support tools, analytics providers, or LLM providers operate. When required, we use appropriate safeguards for international transfers, such as contractual commitments and provider security terms.",
  },
  {
    title: "Security",
    body: "We use administrative, technical, and organizational measures designed to protect personal information, including authenticated access, limited provider access, encrypted transport where supported, and monitoring for abuse or operational issues. No online service can guarantee absolute security, so you should use a strong account credential and keep connected integrations under your control.",
  },
  {
    title: "Contact",
    body: `Questions about privacy, data handling, or rights requests can be sent to ${LEGAL_CONTACT_EMAIL}. We use this address for account support, privacy questions, and requests to exercise privacy rights.`,
  },
];

export const PRIVACY_ADDITIONAL_PARAGRAPHS = [
  "Google sign-in scopes. When you sign in with Google, Slothing currently requests the following scopes together so connected workflows are ready when you need them: basic account profile and email, Google Calendar, Drive (files created by the app), Gmail read and send, and read-only Contacts. You will be shown these scopes by Google before you grant access, and you can revoke them at any time from your Google Account permissions page. Slothing only calls these APIs in response to features you trigger, and does not background-scan your inbox or files outside of features you explicitly use.",
  "Slothing AI credits vs. BYOK. On Weekly and Monthly plans, your content is sent to Slothing's LLM provider accounts to generate AI outputs. We do not use your job search content to train models, and we do not retain raw LLM inputs beyond what is needed to display results. On BYOK (Hosted Free), content goes directly from the app to the provider you configured; their terms and data policies apply. In both cases, you can review which providers are involved in the relevant account settings screen.",
  "Browser extension. The Slothing browser extension requests only the permissions needed to read job pages you visit on supported job sites and to keep your connection token in extension storage. It does not request Gmail, Calendar, Drive, or Contacts permissions; those workflows run in the Slothing web app under your Google sign-in instead.",
];
