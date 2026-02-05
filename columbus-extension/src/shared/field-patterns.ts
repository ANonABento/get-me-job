// Field detection patterns for auto-fill

import type { FieldType } from './types';

export interface FieldPattern {
  type: FieldType;
  autocompleteValues?: string[];
  namePatterns?: RegExp[];
  idPatterns?: RegExp[];
  labelPatterns?: RegExp[];
  placeholderPatterns?: RegExp[];
  negativePatterns?: RegExp[];
}

export const FIELD_PATTERNS: FieldPattern[] = [
  // Name fields
  {
    type: 'firstName',
    autocompleteValues: ['given-name', 'first-name'],
    namePatterns: [/first.?name/i, /fname/i, /given.?name/i, /forename/i],
    idPatterns: [/first.?name/i, /fname/i],
    labelPatterns: [/first\s*name/i, /given\s*name/i, /forename/i],
    placeholderPatterns: [/first\s*name/i],
    negativePatterns: [/last/i, /company/i, /middle/i, /business/i],
  },
  {
    type: 'lastName',
    autocompleteValues: ['family-name', 'last-name'],
    namePatterns: [/last.?name/i, /lname/i, /surname/i, /family.?name/i],
    idPatterns: [/last.?name/i, /lname/i, /surname/i],
    labelPatterns: [/last\s*name/i, /surname/i, /family\s*name/i],
    negativePatterns: [/first/i, /company/i, /business/i],
  },
  {
    type: 'fullName',
    autocompleteValues: ['name'],
    namePatterns: [/^name$/i, /full.?name/i, /your.?name/i, /candidate.?name/i],
    labelPatterns: [/^name$/i, /full\s*name/i, /your\s*name/i, /^name\s*\*/i],
    negativePatterns: [/company/i, /first/i, /last/i, /user/i, /business/i, /job/i],
  },
  // Contact fields
  {
    type: 'email',
    autocompleteValues: ['email'],
    namePatterns: [/e?-?mail/i, /email.?address/i],
    idPatterns: [/e?-?mail/i],
    labelPatterns: [/e-?mail/i, /email\s*address/i],
    placeholderPatterns: [/e-?mail/i, /@/],
  },
  {
    type: 'phone',
    autocompleteValues: ['tel', 'tel-national', 'tel-local'],
    namePatterns: [/phone/i, /mobile/i, /cell/i, /tel(?:ephone)?/i],
    labelPatterns: [/phone/i, /mobile/i, /cell/i, /telephone/i, /contact\s*number/i],
  },
  {
    type: 'address',
    autocompleteValues: ['street-address', 'address-line1'],
    namePatterns: [/address/i, /street/i],
    labelPatterns: [/address/i, /street/i],
    negativePatterns: [/email/i, /web/i, /url/i],
  },
  {
    type: 'city',
    autocompleteValues: ['address-level2'],
    namePatterns: [/city/i, /town/i],
    labelPatterns: [/city/i, /town/i],
  },
  {
    type: 'state',
    autocompleteValues: ['address-level1'],
    namePatterns: [/state/i, /province/i, /region/i],
    labelPatterns: [/state/i, /province/i, /region/i],
  },
  {
    type: 'zipCode',
    autocompleteValues: ['postal-code'],
    namePatterns: [/zip/i, /postal/i, /postcode/i],
    labelPatterns: [/zip/i, /postal/i, /post\s*code/i],
  },
  {
    type: 'country',
    autocompleteValues: ['country', 'country-name'],
    namePatterns: [/country/i],
    labelPatterns: [/country/i],
  },
  // Social/Professional links
  {
    type: 'linkedin',
    namePatterns: [/linkedin/i],
    labelPatterns: [/linkedin/i],
    placeholderPatterns: [/linkedin\.com/i, /linkedin/i],
  },
  {
    type: 'github',
    namePatterns: [/github/i],
    labelPatterns: [/github/i],
    placeholderPatterns: [/github\.com/i, /github/i],
  },
  {
    type: 'website',
    autocompleteValues: ['url'],
    namePatterns: [/website/i, /portfolio/i, /personal.?site/i, /blog/i],
    labelPatterns: [/website/i, /portfolio/i, /personal\s*(site|url)/i],
    negativePatterns: [/linkedin/i, /github/i, /company/i],
  },
  // Employment fields
  {
    type: 'currentCompany',
    autocompleteValues: ['organization'],
    namePatterns: [/current.?company/i, /employer/i, /company.?name/i, /organization/i],
    labelPatterns: [/current\s*(company|employer)/i, /company\s*name/i, /employer/i],
    negativePatterns: [/previous/i, /past/i, /former/i],
  },
  {
    type: 'currentTitle',
    autocompleteValues: ['organization-title'],
    namePatterns: [/current.?title/i, /job.?title/i, /position/i, /role/i],
    labelPatterns: [/current\s*(title|position|role)/i, /job\s*title/i],
    negativePatterns: [/previous/i, /past/i, /desired/i, /applying/i],
  },
  {
    type: 'yearsExperience',
    namePatterns: [/years?.?(of)?.?experience/i, /experience.?years/i, /yoe/i],
    labelPatterns: [/years?\s*(of\s*)?experience/i, /total\s*experience/i, /how\s*many\s*years/i],
  },
  // Education fields
  {
    type: 'school',
    namePatterns: [/school/i, /university/i, /college/i, /institution/i, /alma.?mater/i],
    labelPatterns: [/school/i, /university/i, /college/i, /institution/i],
    negativePatterns: [/high\s*school/i],
  },
  {
    type: 'degree',
    namePatterns: [/degree/i, /qualification/i],
    labelPatterns: [/degree/i, /qualification/i, /level\s*of\s*education/i],
  },
  {
    type: 'fieldOfStudy',
    namePatterns: [/field.?of.?study/i, /major/i, /concentration/i, /specialization/i],
    labelPatterns: [/field\s*of\s*study/i, /major/i, /area\s*of\s*study/i],
  },
  {
    type: 'graduationYear',
    namePatterns: [/graduation.?(year|date)/i, /grad.?year/i],
    labelPatterns: [/graduation\s*(year|date)/i, /year\s*of\s*graduation/i, /when\s*did\s*you\s*graduate/i],
  },
  {
    type: 'gpa',
    namePatterns: [/gpa/i, /grade.?point/i, /cgpa/i],
    labelPatterns: [/gpa/i, /grade\s*point/i, /cumulative\s*gpa/i],
  },
  // Documents
  {
    type: 'resume',
    namePatterns: [/resume/i, /cv/i, /curriculum.?vitae/i],
    labelPatterns: [/resume/i, /cv/i, /curriculum\s*vitae/i, /upload\s*(your\s*)?resume/i],
  },
  {
    type: 'coverLetter',
    namePatterns: [/cover.?letter/i, /motivation.?letter/i],
    labelPatterns: [/cover\s*letter/i, /motivation\s*letter/i],
  },
  // Compensation
  {
    type: 'salary',
    namePatterns: [/salary/i, /compensation/i, /pay/i, /wage/i],
    labelPatterns: [/salary/i, /compensation/i, /expected\s*(salary|pay)/i, /desired\s*salary/i],
  },
  // Availability
  {
    type: 'startDate',
    namePatterns: [/start.?date/i, /available.?date/i, /earliest.?start/i],
    labelPatterns: [/start\s*date/i, /when\s*can\s*you\s*start/i, /earliest\s*start/i, /availability/i],
    negativePatterns: [/end/i, /finish/i],
  },
  // Legal/Compliance
  {
    type: 'workAuthorization',
    namePatterns: [/work.?auth/i, /authorized.?to.?work/i, /legally.?work/i, /work.?permit/i, /visa.?status/i],
    labelPatterns: [/authorized\s*to\s*work/i, /legally\s*(authorized|permitted)/i, /work\s*authorization/i, /right\s*to\s*work/i],
  },
  {
    type: 'sponsorship',
    namePatterns: [/sponsor/i, /visa.?sponsor/i],
    labelPatterns: [/sponsor/i, /visa\s*sponsor/i, /require\s*sponsorship/i, /need\s*sponsorship/i],
  },
  // EEO fields
  {
    type: 'veteranStatus',
    namePatterns: [/veteran/i, /military/i],
    labelPatterns: [/veteran/i, /military\s*status/i, /served\s*in/i],
  },
  {
    type: 'disability',
    namePatterns: [/disability/i, /disabled/i],
    labelPatterns: [/disability/i, /disabled/i, /accommodation/i],
  },
  {
    type: 'gender',
    namePatterns: [/gender/i, /sex/i],
    labelPatterns: [/gender/i, /sex/i],
    negativePatterns: [/identity/i],
  },
  {
    type: 'ethnicity',
    namePatterns: [/ethnicity/i, /race/i, /ethnic/i],
    labelPatterns: [/ethnicity/i, /race/i, /ethnic\s*background/i],
  },
  // Skills
  {
    type: 'skills',
    namePatterns: [/skills?/i, /expertise/i, /competenc/i],
    labelPatterns: [/skills?/i, /technical\s*skills/i, /key\s*skills/i],
  },
  // Summary/Bio
  {
    type: 'summary',
    namePatterns: [/summary/i, /bio/i, /about.?you/i, /profile/i, /introduction/i],
    labelPatterns: [/summary/i, /professional\s*summary/i, /about\s*you/i, /tell\s*us\s*about/i, /bio/i],
    negativePatterns: [/job/i, /position/i],
  },
];

// Job site URL patterns for scraper detection
export const JOB_SITE_PATTERNS = {
  linkedin: [
    /linkedin\.com\/jobs\/view\//,
    /linkedin\.com\/jobs\/search/,
    /linkedin\.com\/jobs\/collections/,
  ],
  indeed: [
    /indeed\.com\/viewjob/,
    /indeed\.com\/jobs/,
    /indeed\.com\/cmp\/.+\/jobs/,
  ],
  greenhouse: [
    /boards\.greenhouse\.io\//,
    /greenhouse\.io\/.*\/jobs\//,
  ],
  lever: [
    /jobs\.lever\.co\//,
    /lever\.co\/.*\/jobs\//,
  ],
  waterlooWorks: [
    /waterlooworks\.uwaterloo\.ca/,
  ],
  workday: [
    /myworkdayjobs\.com/,
    /workdayjobs\.com/,
  ],
} as const;

export type JobSite = keyof typeof JOB_SITE_PATTERNS | 'unknown';

export function detectJobSite(url: string): JobSite {
  for (const [site, patterns] of Object.entries(JOB_SITE_PATTERNS)) {
    if (patterns.some(p => p.test(url))) {
      return site as JobSite;
    }
  }
  return 'unknown';
}

// Common question patterns for learning system
export const CUSTOM_QUESTION_INDICATORS = [
  /why.*(want|interested|apply|join)/i,
  /what.*(makes|attracted|excites)/i,
  /tell.*about.*yourself/i,
  /describe.*(situation|time|experience)/i,
  /how.*handle/i,
  /greatest.*(strength|weakness|achievement)/i,
  /where.*see.*yourself/i,
  /why.*should.*hire/i,
  /what.*contribute/i,
  /salary.*expectation/i,
  /additional.*information/i,
  /anything.*else/i,
];
