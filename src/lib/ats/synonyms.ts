/**
 * Synonym groups for semantic keyword matching in ATS scoring.
 * Each group maps a canonical term to its synonyms/variations.
 * All terms should be lowercase.
 */

export interface SynonymGroup {
  canonical: string;
  synonyms: string[];
}

const SYNONYM_GROUPS: SynonymGroup[] = [
  // Programming Languages
  { canonical: "javascript", synonyms: ["js", "ecmascript", "es6", "es2015"] },
  { canonical: "typescript", synonyms: ["ts"] },
  { canonical: "python", synonyms: ["py", "python3"] },
  { canonical: "golang", synonyms: ["go"] },
  { canonical: "c#", synonyms: ["csharp", "c sharp", "dotnet", ".net"] },
  { canonical: "c++", synonyms: ["cpp", "cplusplus"] },
  { canonical: "ruby", synonyms: ["rb"] },
  { canonical: "kotlin", synonyms: ["kt"] },
  { canonical: "objective-c", synonyms: ["objc", "obj-c"] },

  // Frontend Frameworks
  { canonical: "react", synonyms: ["reactjs", "react.js", "react js"] },
  { canonical: "angular", synonyms: ["angularjs", "angular.js", "angular js"] },
  { canonical: "vue", synonyms: ["vuejs", "vue.js", "vue js"] },
  { canonical: "next.js", synonyms: ["nextjs", "next js", "next"] },
  { canonical: "nuxt", synonyms: ["nuxtjs", "nuxt.js"] },
  { canonical: "svelte", synonyms: ["sveltejs", "sveltekit"] },

  // Backend Frameworks
  { canonical: "node.js", synonyms: ["nodejs", "node js", "node"] },
  { canonical: "express", synonyms: ["expressjs", "express.js"] },
  { canonical: "django", synonyms: ["django rest framework", "drf"] },
  { canonical: "flask", synonyms: ["flask python"] },
  { canonical: "spring", synonyms: ["spring boot", "springboot"] },
  { canonical: "ruby on rails", synonyms: ["rails", "ror"] },
  { canonical: "fastapi", synonyms: ["fast api"] },

  // Databases
  { canonical: "postgresql", synonyms: ["postgres", "psql", "pg"] },
  { canonical: "mongodb", synonyms: ["mongo"] },
  { canonical: "mysql", synonyms: ["mariadb"] },
  { canonical: "dynamodb", synonyms: ["dynamo db", "dynamo"] },
  { canonical: "elasticsearch", synonyms: ["elastic search", "elastic", "es"] },
  { canonical: "redis", synonyms: ["redis cache"] },
  { canonical: "sql", synonyms: ["structured query language"] },
  { canonical: "nosql", synonyms: ["no sql", "non-relational"] },

  // Cloud & Infrastructure
  { canonical: "aws", synonyms: ["amazon web services", "amazon cloud"] },
  { canonical: "gcp", synonyms: ["google cloud", "google cloud platform"] },
  { canonical: "azure", synonyms: ["microsoft azure", "ms azure"] },
  { canonical: "docker", synonyms: ["containerization", "containers"] },
  { canonical: "kubernetes", synonyms: ["k8s", "kube"] },
  { canonical: "terraform", synonyms: ["tf", "infrastructure as code", "iac"] },
  { canonical: "ci/cd", synonyms: ["cicd", "ci cd", "continuous integration", "continuous deployment", "continuous delivery"] },
  { canonical: "devops", synonyms: ["dev ops", "site reliability", "sre"] },

  // Tools & Platforms
  { canonical: "git", synonyms: ["github", "gitlab", "bitbucket", "version control"] },
  { canonical: "jira", synonyms: ["atlassian jira"] },
  { canonical: "figma", synonyms: ["figma design"] },
  { canonical: "webpack", synonyms: ["module bundler"] },
  { canonical: "graphql", synonyms: ["graph ql", "gql"] },
  { canonical: "rest api", synonyms: ["restful", "restful api", "rest", "api"] },

  // Role Terms
  { canonical: "frontend", synonyms: ["front-end", "front end", "client-side", "client side", "ui development"] },
  { canonical: "backend", synonyms: ["back-end", "back end", "server-side", "server side"] },
  { canonical: "fullstack", synonyms: ["full-stack", "full stack"] },
  { canonical: "software engineer", synonyms: ["software developer", "swe", "developer", "programmer", "coder"] },
  { canonical: "data scientist", synonyms: ["data science", "ml engineer", "machine learning engineer"] },
  { canonical: "data engineer", synonyms: ["data engineering", "etl developer"] },
  { canonical: "product manager", synonyms: ["pm", "product owner", "po"] },
  { canonical: "qa engineer", synonyms: ["quality assurance", "qa", "test engineer", "sdet"] },
  { canonical: "ux designer", synonyms: ["ux", "user experience", "ui/ux", "ui ux"] },

  // Methodologies
  { canonical: "agile", synonyms: ["scrum", "kanban", "sprint", "sprints"] },
  { canonical: "tdd", synonyms: ["test driven development", "test-driven development"] },
  { canonical: "bdd", synonyms: ["behavior driven development", "behavior-driven development"] },
  { canonical: "microservices", synonyms: ["micro services", "micro-services", "service-oriented"] },

  // Soft Skills
  { canonical: "leadership", synonyms: ["led", "managed", "directed", "supervised", "mentored", "team lead"] },
  { canonical: "communication", synonyms: ["communicated", "presented", "public speaking", "interpersonal"] },
  { canonical: "collaboration", synonyms: ["collaborated", "teamwork", "cross-functional", "cross functional"] },
  { canonical: "problem solving", synonyms: ["problem-solving", "troubleshooting", "debugging", "analytical"] },
  { canonical: "project management", synonyms: ["project-management", "program management", "stakeholder management"] },
  { canonical: "time management", synonyms: ["time-management", "prioritization", "organization"] },
  { canonical: "mentoring", synonyms: ["coaching", "training", "onboarding"] },

  // Data & ML
  { canonical: "machine learning", synonyms: ["ml", "deep learning", "dl", "ai", "artificial intelligence"] },
  { canonical: "nlp", synonyms: ["natural language processing", "text processing"] },
  { canonical: "computer vision", synonyms: ["cv", "image recognition", "image processing"] },
  { canonical: "tensorflow", synonyms: ["tf"] },
  { canonical: "pytorch", synonyms: ["torch"] },

  // Testing
  { canonical: "unit testing", synonyms: ["unit tests", "jest", "mocha", "vitest", "pytest"] },
  { canonical: "integration testing", synonyms: ["integration tests", "e2e testing", "end-to-end testing", "end to end"] },
  { canonical: "automation testing", synonyms: ["test automation", "automated testing", "selenium", "cypress", "playwright"] },

  // Security
  { canonical: "cybersecurity", synonyms: ["cyber security", "information security", "infosec"] },
  { canonical: "authentication", synonyms: ["auth", "oauth", "sso", "single sign-on"] },

  // Mobile
  { canonical: "ios", synonyms: ["swift", "objective-c", "apple development"] },
  { canonical: "android", synonyms: ["android development", "kotlin android"] },
  { canonical: "react native", synonyms: ["react-native", "rn"] },
  { canonical: "flutter", synonyms: ["dart"] },

  // Business & Analytics
  { canonical: "business intelligence", synonyms: ["bi", "tableau", "power bi", "looker"] },
  { canonical: "data analysis", synonyms: ["data analytics", "data analyst", "analytics"] },
  { canonical: "etl", synonyms: ["extract transform load", "data pipeline", "data pipelines"] },
];

/**
 * Builds a lookup map from any term (canonical or synonym) to
 * the set of all terms in the same group (including the canonical form).
 * All keys and values are lowercase.
 */
function buildSynonymLookup(): Map<string, Set<string>> {
  const lookup = new Map<string, Set<string>>();

  for (const group of SYNONYM_GROUPS) {
    const allTerms = [group.canonical, ...group.synonyms];
    const termSet = new Set(allTerms);

    for (const term of allTerms) {
      const existing = lookup.get(term);
      if (existing) {
        // Merge sets if term appears in multiple groups
        termSet.forEach((t) => existing.add(t));
      } else {
        lookup.set(term, new Set(termSet));
      }
    }
  }

  return lookup;
}

const synonymLookup = buildSynonymLookup();

/**
 * Returns all synonyms for a given term (including the term itself).
 * Returns an empty array if no synonyms are found.
 */
export function getSynonyms(term: string): string[] {
  const normalized = term.toLowerCase().trim();
  const group = synonymLookup.get(normalized);
  if (!group) return [];
  return Array.from(group);
}

/**
 * Checks if two terms are synonyms of each other.
 */
export function areSynonyms(termA: string, termB: string): boolean {
  const normalizedA = termA.toLowerCase().trim();
  const normalizedB = termB.toLowerCase().trim();
  if (normalizedA === normalizedB) return true;
  const group = synonymLookup.get(normalizedA);
  return group ? group.has(normalizedB) : false;
}

/** Weight applied to synonym matches (vs 1.0 for exact matches) */
export const SYNONYM_MATCH_WEIGHT = 0.8;

/** Exported for testing */
export { SYNONYM_GROUPS };
