(self["webpackChunk_slothing_extension"] = self["webpackChunk_slothing_extension"] || []).push([[887],{

/***/ 997
(__unused_webpack_module, exports, __webpack_require__) {

"use strict";
var __webpack_unused_export__;


var m = __webpack_require__(316);
if (true) {
  exports.H = m.createRoot;
  __webpack_unused_export__ = m.hydrateRoot;
} else // removed by dead control flow
{ var i; }


/***/ },

/***/ 921
(__unused_webpack_module, exports, __webpack_require__) {

"use strict";
var __webpack_unused_export__;
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var f=__webpack_require__(155),k=Symbol.for("react.element"),l=Symbol.for("react.fragment"),m=Object.prototype.hasOwnProperty,n=f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,p={key:!0,ref:!0,__self:!0,__source:!0};
function q(c,a,g){var b,d={},e=null,h=null;void 0!==g&&(e=""+g);void 0!==a.key&&(e=""+a.key);void 0!==a.ref&&(h=a.ref);for(b in a)m.call(a,b)&&!p.hasOwnProperty(b)&&(d[b]=a[b]);if(c&&c.defaultProps)for(b in a=c.defaultProps,a)void 0===d[b]&&(d[b]=a[b]);return{$$typeof:k,type:c,key:e,ref:h,props:d,_owner:n.current}}__webpack_unused_export__=l;exports.jsx=q;exports.jsxs=q;


/***/ },

/***/ 723
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


if (true) {
  module.exports = __webpack_require__(921);
} else // removed by dead control flow
{}


/***/ },

/***/ 779
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   kF: () => (/* binding */ nowIso),
/* harmony export */   om: () => (/* binding */ formatRelative)
/* harmony export */ });
/* unused harmony exports DEFAULT_LOCALE, LOCALE_COOKIE_NAME, LOCALE_CHANGE_EVENT, SUPPORTED_LOCALES, normalizeLocale, nowDate, nowEpoch, parseToDate, toIso, toNullableIso, toEpoch, toNullableEpoch, getUserTimezone, formatAbsolute, formatDateOnly, formatTimeOnly, formatIsoDateOnly, formatMonthYear, isPast, isFuture, diffSeconds, diffDays, addDays, addMinutes, startOfDay, endOfDay, toUserTz, formatDateAbsolute, formatDateRelative, getBrowserDefaultLocale */
const DEFAULT_LOCALE = "en-US";
const NUMERIC_PARTS_LOCALE = (/* unused pure expression or super */ null && (`${DEFAULT_LOCALE}-u-nu-latn`));
const LOCALE_COOKIE_NAME = "taida_locale";
const LOCALE_CHANGE_EVENT = "taida:locale-change";
const SUPPORTED_LOCALES = [
    { value: "en-US", label: "English (US)" },
    { value: "en-CA", label: "English (CA)" },
    { value: "en-GB", label: "English (UK)" },
    { value: "fr", label: "French" },
    { value: "es", label: "Spanish" },
    { value: "de", label: "German" },
    { value: "ja", label: "Japanese" },
    { value: "zh-CN", label: "Chinese (Simplified)" },
    { value: "pt", label: "Portuguese" },
    { value: "pt-BR", label: "Portuguese (Brazil)" },
    { value: "hi", label: "Hindi" },
    { value: "ko", label: "Korean" },
];
function normalizeLocale(locale) {
    if (!locale)
        return DEFAULT_LOCALE;
    const supported = SUPPORTED_LOCALES.find((candidate) => candidate.value.toLowerCase() === locale.toLowerCase() ||
        candidate.value.split("-")[0].toLowerCase() === locale.toLowerCase());
    return supported?.value ?? DEFAULT_LOCALE;
}
function nowIso() {
    return new Date().toISOString();
}
function nowDate() {
    return new Date();
}
function nowEpoch() {
    return Date.now();
}
function parseToDate(value) {
    if (value === null || value === undefined || value === "")
        return null;
    const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}
function toIso(value) {
    const date = parseToDate(value);
    if (!date) {
        throw new TypeError("Expected a valid date value");
    }
    return date.toISOString();
}
function toNullableIso(value) {
    return parseToDate(value)?.toISOString() ?? null;
}
function toEpoch(value) {
    const date = parseToDate(value);
    if (!date) {
        throw new TypeError("Expected a valid date value");
    }
    return date.getTime();
}
function toNullableEpoch(value) {
    return parseToDate(value)?.getTime() ?? null;
}
function getUserTimezone() {
    if (typeof Intl === "undefined")
        return "UTC";
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    }
    catch {
        return "UTC";
    }
}
function getDisplayTimezone(timeZone) {
    if (timeZone)
        return timeZone;
    return typeof window === "undefined" ? "UTC" : getUserTimezone();
}
function formatAbsolute(value, opts = {}) {
    const date = parseToDate(value);
    if (!date)
        return "Unknown date";
    const includeTime = opts.includeTime ?? true;
    const formatter = new Intl.DateTimeFormat(normalizeLocale(opts.locale), {
        month: "short",
        day: "numeric",
        year: "numeric",
        ...(includeTime ? { hour: "numeric", minute: "2-digit" } : {}),
        timeZone: getDisplayTimezone(opts.timeZone),
    });
    const formatted = formatter.format(date);
    if (!includeTime)
        return formatted;
    const lastComma = formatted.lastIndexOf(",");
    if (lastComma === -1)
        return formatted;
    return `${formatted.slice(0, lastComma)} · ${formatted
        .slice(lastComma + 1)
        .trim()}`;
}
function formatRelative(value, opts = {}) {
    const date = parseToDate(value);
    const current = parseToDate(opts.now ?? nowIso());
    if (!date || !current) {
        return "Unknown date";
    }
    const diffMs = current.getTime() - date.getTime();
    const absMs = Math.abs(diffMs);
    const isFuture = diffMs < 0;
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const week = 7 * day;
    const month = 30 * day;
    const year = 365 * day;
    if (absMs < minute)
        return "Just now";
    if (absMs < hour)
        return formatRelativeBucket(Math.floor(absMs / minute), "m", isFuture);
    if (absMs < day)
        return formatRelativeBucket(Math.floor(absMs / hour), "h", isFuture);
    if (absMs < 2 * day)
        return isFuture ? "Tomorrow" : "Yesterday";
    if (absMs < week)
        return formatRelativeBucket(Math.floor(absMs / day), "d", isFuture);
    if (absMs < month)
        return formatRelativeBucket(Math.floor(absMs / week), "w", isFuture);
    if (absMs < year)
        return formatRelativeBucket(Math.floor(absMs / month), "mo", isFuture);
    return formatRelativeBucket(Math.floor(absMs / year), "y", isFuture);
}
function formatDateOnly(value, opts = {}) {
    const date = parseToDate(value);
    if (!date)
        return "Unknown date";
    return new Intl.DateTimeFormat(normalizeLocale(opts.locale), {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: getDisplayTimezone(opts.timeZone),
    }).format(date);
}
function formatTimeOnly(value, opts = {}) {
    const date = parseToDate(value);
    if (!date)
        return "Unknown time";
    return new Intl.DateTimeFormat(normalizeLocale(opts.locale), {
        hour: "numeric",
        minute: "2-digit",
        timeZone: getDisplayTimezone(opts.timeZone),
    }).format(date);
}
function formatIsoDateOnly(value = nowIso()) {
    return toIso(parseToDate(value) ?? nowIso()).slice(0, 10);
}
function formatMonthYear(value, opts = {}) {
    const date = parseToDate(value);
    if (!date)
        return "";
    return new Intl.DateTimeFormat(normalizeLocale(opts.locale), {
        month: "short",
        year: "numeric",
        timeZone: getDisplayTimezone(opts.timeZone),
    }).format(date);
}
function isPast(value, now = nowIso()) {
    const date = parseToDate(value);
    const current = parseToDate(now);
    return Boolean(date && current && date.getTime() < current.getTime());
}
function isFuture(value, now = nowIso()) {
    const date = parseToDate(value);
    const current = parseToDate(now);
    return Boolean(date && current && date.getTime() > current.getTime());
}
function diffSeconds(a, b) {
    const first = parseToDate(a);
    const second = parseToDate(b);
    if (!first || !second)
        return Number.NaN;
    return Math.trunc((first.getTime() - second.getTime()) / 1000);
}
function diffDays(a, b) {
    const seconds = diffSeconds(a, b);
    return Number.isNaN(seconds) ? Number.NaN : seconds / 86400;
}
function addDays(value, days) {
    const date = parseToDate(value);
    if (!date)
        throw new TypeError("Expected a valid date value");
    return new Date(date.getTime() + days * 86400000);
}
function addMinutes(value, minutes) {
    const date = parseToDate(value);
    if (!date)
        throw new TypeError("Expected a valid date value");
    return new Date(date.getTime() + minutes * 60000);
}
function startOfDay(value, timeZone = "UTC") {
    const date = parseToDate(value);
    if (!date)
        throw new TypeError("Expected a valid date value");
    if (timeZone === "UTC") {
        return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    }
    const parts = getZonedParts(date, timeZone);
    return zonedTimeToUtc(parts.year, parts.month, parts.day, 0, 0, 0, timeZone);
}
function endOfDay(value, timeZone = "UTC") {
    return addMinutes(addDays(startOfDay(value, timeZone), 1), -1 / 60000);
}
function toUserTz(value, timeZone = getUserTimezone()) {
    const date = parseToDate(value);
    if (!date)
        throw new TypeError("Expected a valid date value");
    const parts = getZonedParts(date, timeZone);
    return new Date(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
}
function formatDateAbsolute(date, locale = DEFAULT_LOCALE) {
    return formatAbsolute(date, { locale });
}
function formatDateRelative(date, now = nowIso()) {
    return formatRelative(date, { now });
}
function getBrowserDefaultLocale() {
    if (typeof navigator === "undefined")
        return DEFAULT_LOCALE;
    return normalizeLocale(navigator.language);
}
function formatRelativeBucket(value, unit, isFuture) {
    return isFuture ? `in ${value}${unit}` : `${value}${unit} ago`;
}
function getZonedParts(date, timeZone) {
    const parts = new Intl.DateTimeFormat(NUMERIC_PARTS_LOCALE, {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
    }).formatToParts(date);
    const get = (type) => Number(parts.find((part) => part.type === type)?.value);
    return {
        year: get("year"),
        month: get("month"),
        day: get("day"),
        hour: get("hour"),
        minute: get("minute"),
        second: get("second"),
    };
}
function zonedTimeToUtc(year, month, day, hour, minute, second, timeZone) {
    const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
    const parts = getZonedParts(utcGuess, timeZone);
    const offsetMs = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second) - utcGuess.getTime();
    return new Date(utcGuess.getTime() - offsetMs);
}


/***/ },

/***/ 922
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  K3: () => (/* binding */ scoreResume)
});

// UNUSED EXPORTS: scoreActionVerbs, scoreAtsFriendliness, scoreKeywordMatch, scoreLength, scoreQuantifiedAchievements, scoreSectionCompleteness, scoreSpellingGrammar

// EXTERNAL MODULE: ../../packages/shared/src/formatters/index.ts
var formatters = __webpack_require__(779);
;// ../../packages/shared/src/scoring/constants.ts
const SUB_SCORE_MAX_POINTS = {
    sectionCompleteness: 10,
    actionVerbs: 15,
    quantifiedAchievements: 20,
    keywordMatch: 25,
    length: 10,
    spellingGrammar: 10,
    atsFriendliness: 10,
};
const ACTION_VERBS = [
    "achieved",
    "analyzed",
    "architected",
    "built",
    "collaborated",
    "created",
    "delivered",
    "designed",
    "developed",
    "drove",
    "improved",
    "increased",
    "launched",
    "led",
    "managed",
    "mentored",
    "optimized",
    "reduced",
    "resolved",
    "shipped",
    "streamlined",
    "supported",
    "transformed",
];
const QUANTIFIED_REGEX = /\d+%|\$[\d,]+(?:\.\d+)?[kKmMbB]?|\b\d+x\b|\bteam of \d+\b|\b\d+\s+(users|customers|clients|projects|people|engineers|reports|hours|members|countries|languages|states|cities|stores|partners|deals|leads)\b/gi;

;// ../../packages/shared/src/scoring/text.ts
function normalizeText(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9+#.\s/-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}
function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function wordBoundaryRegex(term, flags = "") {
    return new RegExp(`\\b${escapeRegExp(term)}\\b`, flags);
}
function containsWord(text, term) {
    return wordBoundaryRegex(term).test(text);
}
function countWordOccurrences(text, term) {
    return (text.match(wordBoundaryRegex(term, "g")) || []).length;
}
function getHighlights(profile) {
    return [
        ...profile.experiences.flatMap((experience) => experience.highlights),
        ...profile.projects.flatMap((project) => project.highlights),
    ].filter(Boolean);
}
function extractProfileText(profile) {
    const parts = [
        profile.contact?.name,
        profile.contact?.email,
        profile.contact?.phone,
        profile.contact?.location,
        profile.contact?.linkedin,
        profile.contact?.github,
        profile.contact?.website,
        profile.contact?.headline,
        profile.summary,
        ...profile.experiences.flatMap((experience) => [
            experience.title,
            experience.company,
            experience.location,
            experience.description,
            ...experience.highlights,
            ...experience.skills,
            experience.startDate,
            experience.endDate,
        ]),
        ...profile.education.flatMap((education) => [
            education.institution,
            education.degree,
            education.field,
            ...education.highlights,
            education.startDate,
            education.endDate,
        ]),
        ...profile.skills.map((skill) => skill.name),
        ...profile.projects.flatMap((project) => [
            project.name,
            project.description,
            project.url,
            ...project.highlights,
            ...project.technologies,
        ]),
        ...profile.certifications.flatMap((certification) => [
            certification.name,
            certification.issuer,
            certification.date,
            certification.url,
        ]),
    ];
    return parts.filter(Boolean).join("\n");
}
function getResumeText(profile, rawText) {
    return (rawText?.trim() || profile.rawText?.trim() || extractProfileText(profile));
}
function wordCount(text) {
    const normalized = normalizeText(text);
    if (!normalized)
        return 0;
    return normalized.split(/\s+/).filter(Boolean).length;
}

;// ../../packages/shared/src/scoring/action-verbs.ts


function pointsForDistinctVerbs(count) {
    if (count === 0)
        return 0;
    if (count <= 2)
        return 5;
    if (count <= 4)
        return 9;
    if (count <= 7)
        return 12;
    return 15;
}
function scoreActionVerbs(input) {
    const distinctVerbs = new Set();
    for (const highlight of getHighlights(input.profile)) {
        const firstWord = normalizeText(highlight).split(/\s+/)[0] ?? "";
        for (const verb of ACTION_VERBS) {
            if (wordBoundaryRegex(verb).test(firstWord)) {
                distinctVerbs.add(verb);
            }
        }
    }
    const verbs = Array.from(distinctVerbs).sort();
    const notes = verbs.length === 0
        ? ["Start achievement bullets with strong action verbs."]
        : [];
    const preview = verbs.slice(0, 5).join(", ");
    return {
        key: "actionVerbs",
        label: "Action verbs",
        earned: pointsForDistinctVerbs(verbs.length),
        maxPoints: SUB_SCORE_MAX_POINTS.actionVerbs,
        notes,
        evidence: [
            preview
                ? `${verbs.length} distinct action verbs (${preview})`
                : "0 distinct action verbs",
        ],
    };
}

;// ../../packages/shared/src/scoring/ats-characters.ts
const PROBLEMATIC_CHARACTERS = [
    { char: "\u2022", name: "bullet point", replacement: "-" },
    { char: "\u2013", name: "en dash", replacement: "-" },
    { char: "\u2014", name: "em dash", replacement: "-" },
    { char: "\u201c", name: "curly quote left", replacement: '"' },
    { char: "\u201d", name: "curly quote right", replacement: '"' },
    { char: "\u2018", name: "curly apostrophe left", replacement: "'" },
    { char: "\u2019", name: "curly apostrophe right", replacement: "'" },
    { char: "\u2026", name: "ellipsis", replacement: "..." },
    { char: "\u00a9", name: "copyright", replacement: "(c)" },
    { char: "\u00ae", name: "registered", replacement: "(R)" },
    { char: "\u2122", name: "trademark", replacement: "(TM)" },
];

;// ../../packages/shared/src/scoring/ats-friendliness.ts



function scoreAtsFriendliness(input) {
    const text = getResumeText(input.profile, input.rawText);
    const rawText = input.rawText ?? input.profile.rawText ?? "";
    const notes = [];
    const evidence = [];
    let deductions = 0;
    const foundProblematic = PROBLEMATIC_CHARACTERS.filter(({ char }) => text.includes(char));
    if (foundProblematic.length > 0) {
        const penalty = Math.min(3, foundProblematic.length);
        deductions += penalty;
        notes.push("Special formatting characters can reduce ATS parse quality.");
        evidence.push(`${foundProblematic.length} special characters`);
    }
    const badChars = (text.match(/[\uFFFD\u0000-\u0008\u000B\u000C\u000E-\u001F]/g) || []).length;
    if (badChars > 0) {
        deductions += 2;
        notes.push("Control or replacement characters detected.");
        evidence.push(`${badChars} control or replacement character(s)`);
    }
    if (rawText.includes("\t")) {
        deductions += 2;
        notes.push("Tab characters may indicate table-style formatting.");
        evidence.push("Tab characters found");
    }
    const longLines = rawText.split(/\r?\n/).filter((line) => line.length > 200);
    if (longLines.length >= 4) {
        deductions += 2;
        notes.push("Very long lines may indicate multi-column or table formatting.");
        evidence.push(`${longLines.length} over-long lines`);
    }
    if (/<[a-zA-Z/][^>]*>/.test(rawText)) {
        deductions += 2;
        notes.push("HTML tags detected in resume text.");
        evidence.push("HTML tags found");
    }
    if (!/[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}/.test(text)) {
        deductions += 2;
        notes.push("No email pattern detected in parseable resume text.");
        evidence.push("No email detected");
    }
    if (input.rawText !== undefined &&
        input.rawText.trim().length < 200 &&
        input.profile.experiences.length > 0) {
        deductions += 3;
        notes.push("Extracted text is very short for a resume with experience.");
        evidence.push("Possible image-only PDF");
    }
    return {
        key: "atsFriendliness",
        label: "ATS friendliness",
        earned: Math.max(0, SUB_SCORE_MAX_POINTS.atsFriendliness - deductions),
        maxPoints: SUB_SCORE_MAX_POINTS.atsFriendliness,
        notes,
        evidence: evidence.length > 0 ? evidence : ["No ATS formatting issues detected."],
    };
}

;// ../../packages/shared/src/scoring/synonyms.ts
/**
 * Synonym groups for semantic keyword matching in ATS scoring.
 * Each group maps a canonical term to its synonyms/variations.
 * All terms should be lowercase.
 */
const SYNONYM_GROUPS = [
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
    { canonical: "terraform", synonyms: ["infrastructure as code", "iac"] },
    {
        canonical: "ci/cd",
        synonyms: [
            "cicd",
            "ci cd",
            "continuous integration",
            "continuous deployment",
            "continuous delivery",
        ],
    },
    { canonical: "devops", synonyms: ["dev ops", "site reliability", "sre"] },
    // Tools & Platforms
    {
        canonical: "git",
        synonyms: ["github", "gitlab", "bitbucket", "version control"],
    },
    { canonical: "jira", synonyms: ["atlassian jira"] },
    { canonical: "figma", synonyms: ["figma design"] },
    { canonical: "webpack", synonyms: ["module bundler"] },
    { canonical: "graphql", synonyms: ["graph ql", "gql"] },
    {
        canonical: "rest api",
        synonyms: ["restful", "restful api", "rest", "api"],
    },
    // Role Terms
    {
        canonical: "frontend",
        synonyms: [
            "front-end",
            "front end",
            "client-side",
            "client side",
            "ui development",
        ],
    },
    {
        canonical: "backend",
        synonyms: ["back-end", "back end", "server-side", "server side"],
    },
    { canonical: "fullstack", synonyms: ["full-stack", "full stack"] },
    {
        canonical: "software engineer",
        synonyms: ["software developer", "swe", "developer", "programmer", "coder"],
    },
    {
        canonical: "data scientist",
        synonyms: ["data science", "ml engineer", "machine learning engineer"],
    },
    {
        canonical: "data engineer",
        synonyms: ["data engineering", "etl developer"],
    },
    { canonical: "product manager", synonyms: ["pm", "product owner", "po"] },
    {
        canonical: "qa engineer",
        synonyms: ["quality assurance", "qa", "test engineer", "sdet"],
    },
    {
        canonical: "ux designer",
        synonyms: ["ux", "user experience", "ui/ux", "ui ux"],
    },
    // Methodologies
    { canonical: "agile", synonyms: ["scrum", "kanban", "sprint", "sprints"] },
    {
        canonical: "tdd",
        synonyms: ["test driven development", "test-driven development"],
    },
    {
        canonical: "bdd",
        synonyms: ["behavior driven development", "behavior-driven development"],
    },
    {
        canonical: "microservices",
        synonyms: ["micro services", "micro-services", "service-oriented"],
    },
    // Soft Skills
    {
        canonical: "leadership",
        synonyms: [
            "led",
            "managed",
            "directed",
            "supervised",
            "mentored",
            "team lead",
        ],
    },
    {
        canonical: "communication",
        synonyms: ["communicated", "presented", "public speaking", "interpersonal"],
    },
    {
        canonical: "collaboration",
        synonyms: [
            "collaborated",
            "teamwork",
            "cross-functional",
            "cross functional",
        ],
    },
    {
        canonical: "problem solving",
        synonyms: ["problem-solving", "troubleshooting", "debugging", "analytical"],
    },
    {
        canonical: "project management",
        synonyms: [
            "project-management",
            "program management",
            "stakeholder management",
        ],
    },
    {
        canonical: "time management",
        synonyms: ["time-management", "prioritization", "organization"],
    },
    { canonical: "mentoring", synonyms: ["coaching", "training", "onboarding"] },
    // Data & ML
    {
        canonical: "machine learning",
        synonyms: ["ml", "deep learning", "dl", "ai", "artificial intelligence"],
    },
    {
        canonical: "nlp",
        synonyms: ["natural language processing", "text processing"],
    },
    {
        canonical: "computer vision",
        synonyms: ["cv", "image recognition", "image processing"],
    },
    { canonical: "tensorflow", synonyms: ["keras"] },
    { canonical: "pytorch", synonyms: ["torch"] },
    // Testing
    {
        canonical: "unit testing",
        synonyms: ["unit tests", "jest", "mocha", "vitest", "pytest"],
    },
    {
        canonical: "integration testing",
        synonyms: [
            "integration tests",
            "e2e testing",
            "end-to-end testing",
            "end to end",
        ],
    },
    {
        canonical: "automation testing",
        synonyms: [
            "test automation",
            "automated testing",
            "selenium",
            "cypress",
            "playwright",
        ],
    },
    // Security
    {
        canonical: "cybersecurity",
        synonyms: ["cyber security", "information security", "infosec"],
    },
    {
        canonical: "authentication",
        synonyms: ["auth", "oauth", "sso", "single sign-on"],
    },
    // Mobile
    { canonical: "ios", synonyms: ["swift", "apple development"] },
    { canonical: "android", synonyms: ["android development", "kotlin android"] },
    { canonical: "react native", synonyms: ["react-native", "rn"] },
    { canonical: "flutter", synonyms: ["dart"] },
    // Business & Analytics
    {
        canonical: "business intelligence",
        synonyms: ["bi", "tableau", "power bi", "looker"],
    },
    {
        canonical: "data analysis",
        synonyms: ["data analytics", "data analyst", "analytics"],
    },
    {
        canonical: "etl",
        synonyms: ["extract transform load", "data pipeline", "data pipelines"],
    },
];
/**
 * Builds a lookup map from any term (canonical or synonym) to
 * the set of all terms in the same group (including the canonical form).
 * All keys and values are lowercase.
 */
function buildSynonymLookup() {
    const lookup = new Map();
    for (const group of SYNONYM_GROUPS) {
        const allTerms = [group.canonical, ...group.synonyms];
        const termSet = new Set(allTerms);
        for (const term of allTerms) {
            const existing = lookup.get(term);
            if (existing) {
                // Merge sets if term appears in multiple groups
                termSet.forEach((t) => existing.add(t));
            }
            else {
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
function getSynonyms(term) {
    const normalized = term.toLowerCase().trim();
    const group = synonymLookup.get(normalized);
    if (!group)
        return [];
    return Array.from(group);
}
/**
 * Checks if two terms are synonyms of each other.
 */
function areSynonyms(termA, termB) {
    const normalizedA = termA.toLowerCase().trim();
    const normalizedB = termB.toLowerCase().trim();
    if (normalizedA === normalizedB)
        return true;
    const group = synonymLookup.get(normalizedA);
    return group ? group.has(normalizedB) : false;
}
/** Weight applied to synonym matches (vs 1.0 for exact matches) */
const SYNONYM_MATCH_WEIGHT = 0.8;

;// ../../packages/shared/src/scoring/keyword-match.ts



const STOP_WORDS = new Set([
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "in",
    "of",
    "on",
    "or",
    "our",
    "the",
    "to",
    "we",
    "with",
    "you",
    "your",
]);
function tokenizeKeywords(text) {
    return normalizeText(text)
        .split(/\s+/)
        .map((token) => token.trim())
        .filter((token) => token.length >= 3 && !STOP_WORDS.has(token));
}
function topTokens(text, limit) {
    const counts = new Map();
    for (const token of tokenizeKeywords(text)) {
        counts.set(token, (counts.get(token) ?? 0) + 1);
    }
    return Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, limit)
        .map(([token]) => token);
}
function buildKeywordSet(job) {
    const keywords = [
        ...job.keywords,
        ...job.requirements.flatMap(tokenizeKeywords),
        ...topTokens(job.description, 10),
    ];
    const normalized = keywords
        .map((keyword) => normalizeText(keyword))
        .filter((keyword) => keyword.length >= 2 && !STOP_WORDS.has(keyword));
    return Array.from(new Set(normalized)).slice(0, 24);
}
function scoreKeywordMatch(input) {
    if (!input.job) {
        return {
            key: "keywordMatch",
            label: "Keyword match",
            earned: 18,
            maxPoints: SUB_SCORE_MAX_POINTS.keywordMatch,
            notes: ["No job description supplied; neutral baseline."],
            evidence: ["No job description supplied."],
        };
    }
    const keywords = buildKeywordSet(input.job);
    if (keywords.length === 0) {
        return {
            key: "keywordMatch",
            label: "Keyword match",
            earned: 18,
            maxPoints: SUB_SCORE_MAX_POINTS.keywordMatch,
            notes: ["Job description has no usable keywords; neutral baseline."],
            evidence: ["0 keywords available."],
        };
    }
    const resumeText = normalizeText(getResumeText(input.profile, input.rawText));
    let weightedHits = 0;
    let exactHits = 0;
    let stuffing = false;
    for (const keyword of keywords) {
        const frequency = countWordOccurrences(resumeText, keyword);
        if (frequency > 10)
            stuffing = true;
        if (frequency > 0) {
            weightedHits += 1;
            exactHits += 1;
            continue;
        }
        const synonymHit = getSynonyms(keyword).some((synonym) => synonym !== keyword && containsWord(resumeText, synonym));
        if (synonymHit)
            weightedHits += SYNONYM_MATCH_WEIGHT;
    }
    const rawEarned = Math.round((weightedHits / keywords.length) * SUB_SCORE_MAX_POINTS.keywordMatch);
    const earned = Math.max(0, rawEarned - (stuffing ? 2 : 0));
    const notes = exactHits === keywords.length
        ? []
        : ["Add natural mentions of missing target job keywords."];
    if (stuffing)
        notes.push("Keyword stuffing detected; repeated terms too often.");
    return {
        key: "keywordMatch",
        label: "Keyword match",
        earned,
        maxPoints: SUB_SCORE_MAX_POINTS.keywordMatch,
        notes,
        evidence: [
            `${exactHits}/${keywords.length} keywords matched`,
            `${weightedHits.toFixed(1)}/${keywords.length} weighted keyword hits`,
        ],
    };
}

;// ../../packages/shared/src/scoring/length.ts


function pointsForWordCount(count) {
    if (count >= 400 && count <= 700)
        return 10;
    if ((count >= 300 && count <= 399) || (count >= 701 && count <= 900))
        return 7;
    if ((count >= 200 && count <= 299) || (count >= 901 && count <= 1100))
        return 4;
    if ((count >= 150 && count <= 199) || (count >= 1101 && count <= 1400)) {
        return 2;
    }
    return 0;
}
function scoreLength(input) {
    const count = wordCount(getResumeText(input.profile, input.rawText));
    const earned = pointsForWordCount(count);
    const notes = earned === SUB_SCORE_MAX_POINTS.length
        ? []
        : ["Resume length is outside the 400-700 word target band."];
    return {
        key: "length",
        label: "Length",
        earned,
        maxPoints: SUB_SCORE_MAX_POINTS.length,
        notes,
        evidence: [`${count} words`],
    };
}

;// ../../packages/shared/src/scoring/quantified-achievements.ts


function pointsForQuantifiedResults(count) {
    if (count === 0)
        return 0;
    if (count === 1)
        return 6;
    if (count === 2)
        return 12;
    if (count <= 4)
        return 16;
    return 20;
}
function scoreQuantifiedAchievements(input) {
    const text = getHighlights(input.profile).join("\n");
    const matches = Array.from(text.matchAll(QUANTIFIED_REGEX), (match) => match[0]);
    const notes = matches.length === 0
        ? ["Add metrics such as percentages, volume, team size, or revenue."]
        : [];
    return {
        key: "quantifiedAchievements",
        label: "Quantified achievements",
        earned: pointsForQuantifiedResults(matches.length),
        maxPoints: SUB_SCORE_MAX_POINTS.quantifiedAchievements,
        notes,
        evidence: [
            `${matches.length} quantified result(s)`,
            ...matches.slice(0, 3),
        ],
    };
}

;// ../../packages/shared/src/scoring/section-completeness.ts

function scoreSectionCompleteness(input) {
    const { profile } = input;
    const notes = [];
    const evidence = [];
    let earned = 0;
    let completeSections = 0;
    if (profile.contact.name?.trim()) {
        earned += 1;
    }
    else {
        notes.push("Missing contact name.");
    }
    if (profile.contact.email?.trim()) {
        earned += 1;
    }
    else {
        notes.push("Missing contact email.");
    }
    const summaryLength = profile.summary?.trim().length ?? 0;
    if (summaryLength >= 50 && summaryLength <= 500) {
        earned += 1;
        completeSections += 1;
    }
    else {
        notes.push("Summary should be between 50 and 500 characters.");
    }
    const hasExperience = profile.experiences.some((experience) => experience.title.trim() &&
        experience.company.trim() &&
        experience.startDate.trim());
    if (hasExperience) {
        earned += 2;
        completeSections += 1;
    }
    else {
        notes.push("Add at least one role with title, company, and start date.");
    }
    if (profile.education.length > 0) {
        earned += 1;
        completeSections += 1;
    }
    else {
        notes.push("Add at least one education entry.");
    }
    if (profile.skills.length >= 3) {
        earned += 2;
        completeSections += 1;
    }
    else if (profile.skills.length > 0) {
        earned += 1;
        notes.push("Add at least three skills.");
    }
    else {
        notes.push("Add a skills section.");
    }
    const hasHighlight = profile.experiences.some((experience) => experience.highlights.length > 0);
    if (hasHighlight) {
        earned += 1;
        completeSections += 1;
    }
    else {
        notes.push("Add achievement highlights to experience.");
    }
    const hasSecondaryContact = Boolean(profile.contact.phone?.trim() ||
        profile.contact.linkedin?.trim() ||
        profile.contact.location?.trim());
    if (hasSecondaryContact) {
        earned += 1;
        completeSections += 1;
    }
    else {
        notes.push("Add phone, LinkedIn, or location.");
    }
    if (profile.contact.name?.trim() && profile.contact.email?.trim()) {
        completeSections += 1;
    }
    evidence.push(`${completeSections}/7 sections complete`);
    return {
        key: "sectionCompleteness",
        label: "Section completeness",
        earned: Math.min(earned, SUB_SCORE_MAX_POINTS.sectionCompleteness),
        maxPoints: SUB_SCORE_MAX_POINTS.sectionCompleteness,
        notes,
        evidence,
    };
}

;// ../../packages/shared/src/scoring/spelling-grammar.ts


const REPEATED_WORD_EXCEPTIONS = new Set(["had had", "that that"]);
const ACRONYMS = new Set(["API", "AWS", "CSS", "GCP", "HTML", "SQL"]);
function hasVerbLikeToken(text) {
    const words = normalizeText(text).split(/\s+/).filter(Boolean);
    return words.some((word) => ACTION_VERBS.includes(word) ||
        /(?:ed|ing|s)$/.test(word));
}
function scoreSpellingGrammar(input) {
    const highlights = getHighlights(input.profile);
    const text = highlights.join("\n");
    const notes = [];
    const evidence = [];
    let deductions = 0;
    const repeated = Array.from(text.matchAll(/\b(\w+)\s+\1\b/gi), (match) => match[0]).filter((match) => !REPEATED_WORD_EXCEPTIONS.has(match.toLowerCase()));
    if (repeated.length > 0) {
        const penalty = Math.min(2, repeated.length);
        deductions += penalty;
        notes.push("Repeated adjacent words detected.");
        evidence.push(`Repeated word: ${repeated[0]}`);
    }
    if (/  +/.test(text)) {
        deductions += 1;
        notes.push("Multiple spaces between words detected.");
        evidence.push("Multiple spaces found.");
    }
    const lowercaseStarts = highlights.filter((highlight) => /^[a-z]/.test(highlight.trim()));
    if (lowercaseStarts.length > 0) {
        const penalty = Math.min(3, lowercaseStarts.length);
        deductions += penalty;
        notes.push("Some highlights start with lowercase letters.");
        evidence.push(`Lowercase start: ${lowercaseStarts[0]}`);
    }
    const fragments = highlights.filter((highlight) => highlight.length > 40 && !hasVerbLikeToken(highlight));
    if (fragments.length > 0) {
        const penalty = Math.min(2, fragments.length);
        deductions += penalty;
        notes.push("Some long highlights may read like sentence fragments.");
        evidence.push(`Possible fragment: ${fragments[0]}`);
    }
    const punctuationEndings = highlights.filter((highlight) => /\.$/.test(highlight.trim())).length;
    if (highlights.length > 1) {
        const rate = punctuationEndings / highlights.length;
        if (rate > 0.3 && rate < 0.7) {
            deductions += 1;
            notes.push("Trailing punctuation is inconsistent across highlights.");
            evidence.push(`${punctuationEndings}/${highlights.length} highlights end with periods.`);
        }
    }
    const allCaps = Array.from(text.matchAll(/\b[A-Z]{4,}\b/g), (match) => match[0]).filter((word) => !ACRONYMS.has(word));
    if (allCaps.length > 5) {
        deductions += 1;
        notes.push("Excessive all-caps words detected.");
        evidence.push(`All-caps words: ${allCaps.slice(0, 3).join(", ")}`);
    }
    return {
        key: "spellingGrammar",
        label: "Spelling and grammar",
        earned: Math.max(0, SUB_SCORE_MAX_POINTS.spellingGrammar - deductions),
        maxPoints: SUB_SCORE_MAX_POINTS.spellingGrammar,
        notes,
        evidence: evidence.length > 0 ? evidence : ["No heuristic issues detected."],
    };
}

;// ../../packages/shared/src/scoring/index.ts








function scoreResume(input) {
    const subScores = {
        sectionCompleteness: scoreSectionCompleteness(input),
        actionVerbs: scoreActionVerbs(input),
        quantifiedAchievements: scoreQuantifiedAchievements(input),
        keywordMatch: scoreKeywordMatch(input),
        length: scoreLength(input),
        spellingGrammar: scoreSpellingGrammar(input),
        atsFriendliness: scoreAtsFriendliness(input),
    };
    const overall = Object.values(subScores).reduce((sum, subScore) => sum + subScore.earned, 0);
    return {
        overall: Math.max(0, Math.min(100, Math.round(overall))),
        subScores,
        generatedAt: (0,formatters/* nowIso */.kF)(),
    };
}









/***/ },

/***/ 120
(__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) {

"use strict";

// EXTERNAL MODULE: ../../node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(723);
// EXTERNAL MODULE: ../../node_modules/.pnpm/webextension-polyfill@0.10.0/node_modules/webextension-polyfill/dist/browser-polyfill.js
var browser_polyfill = __webpack_require__(948);
var browser_polyfill_default = /*#__PURE__*/__webpack_require__.n(browser_polyfill);
// EXTERNAL MODULE: ../../node_modules/.pnpm/react@18.3.1/node_modules/react/index.js
var react = __webpack_require__(155);
// EXTERNAL MODULE: ../../node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom/client.js
var client = __webpack_require__(997);
// EXTERNAL MODULE: ../../packages/shared/src/formatters/index.ts
var formatters = __webpack_require__(779);
// EXTERNAL MODULE: ../../packages/shared/src/scoring/index.ts + 11 modules
var scoring = __webpack_require__(922);
// EXTERNAL MODULE: ./src/shared/types.ts
var types = __webpack_require__(353);
// EXTERNAL MODULE: ./src/shared/messages.ts
var messages = __webpack_require__(154);
// EXTERNAL MODULE: ./src/shared/error-messages.ts
var error_messages = __webpack_require__(543);
;// ./src/popup/deep-links.ts
/**
 * Deep-link URL builders for the popup's post-import success buttons (#31).
 *
 * Kept in its own module so the URL shape is unit-testable without booting
 * React/jsdom. The popup component imports both helpers and threads the
 * configured `apiBaseUrl` (from GET_AUTH_STATUS) through.
 */
/**
 * Builds the deep-link to a single opportunity's detail page.
 *
 * Trailing slashes on the base URL are stripped so we don't produce
 * `http://localhost:3000//opportunities/...`. The opportunity id is
 * URI-encoded defensively even though server-side ids are safe today.
 */
function opportunityDetailUrl(apiBaseUrl, opportunityId) {
    const base = apiBaseUrl.replace(/\/+$/, "");
    return `${base}/opportunities/${encodeURIComponent(opportunityId)}`;
}
/**
 * Builds the deep-link to the review queue used after a bulk scrape import.
 */
function opportunityReviewUrl(apiBaseUrl) {
    const base = apiBaseUrl.replace(/\/+$/, "");
    return `${base}/opportunities/review`;
}

;// ./src/popup/BulkSourceCard.tsx

function BulkSourceCard(props) {
    const { sourceLabel, detectedCount, busy, progress, lastResult, lastError, onScrapeVisible, onScrapePaginated, onCancel, onViewTracker, } = props;
    const disabled = busy !== null || detectedCount === 0;
    return ((0,jsx_runtime.jsxs)("article", { className: "card bulk-source", "data-bulk-source": sourceLabel.toLowerCase(), children: [(0,jsx_runtime.jsxs)("header", { className: "bulk-source-head", children: [(0,jsx_runtime.jsx)("span", { className: "card-title", children: sourceLabel }), (0,jsx_runtime.jsxs)("span", { className: "badge", children: [detectedCount, " row", detectedCount === 1 ? "" : "s"] })] }), (0,jsx_runtime.jsxs)("div", { className: "bulk-action-row", children: [(0,jsx_runtime.jsx)("button", { className: "btn primary", onClick: onScrapeVisible, disabled: disabled, children: busy === "visible"
                            ? "Scraping visible…"
                            : `Scrape ${detectedCount} visible` }), (0,jsx_runtime.jsx)("button", { className: "btn", onClick: onScrapePaginated, disabled: disabled, title: `Walks every page in your current filter set; capped at 200 jobs.`, children: busy === "paginated" ? "Scraping all…" : "Scrape all" })] }), busy && ((0,jsx_runtime.jsxs)("div", { className: "bulk-progress", children: [(0,jsx_runtime.jsx)("p", { className: "inline-note bulk-progress-summary", children: progress
                            ? formatProgressLine(busy, progress)
                            : "Starting…" }), progress?.lastTitle && ((0,jsx_runtime.jsx)("p", { className: "inline-note bulk-progress-title clip", title: progress.lastTitle, children: progress.lastTitle })), onCancel && ((0,jsx_runtime.jsx)("button", { className: "btn ghost tight bulk-progress-stop", onClick: onCancel, children: "Stop" }))] })), lastResult && ((0,jsx_runtime.jsxs)("div", { className: "bulk-result", children: [(0,jsx_runtime.jsxs)("p", { className: "inline-note", children: ["Imported ", lastResult.imported, "/", lastResult.attempted, lastResult.pages > 1 && ` · ${lastResult.pages} pages`, lastResult.duplicateCount
                                ? ` · ${lastResult.duplicateCount} duplicates`
                                : "", lastResult.errors.length > 0 &&
                                ` · ${lastResult.errors.length} errors`] }), lastResult.dedupedIds?.length ? ((0,jsx_runtime.jsxs)("p", { className: "inline-note bulk-duplicates", children: ["Duplicates: ", lastResult.dedupedIds.join(", ")] })) : null, lastResult.imported > 0 && onViewTracker && ((0,jsx_runtime.jsx)("button", { className: "success-link", onClick: onViewTracker, children: "View tracker \u2192" }))] })), lastError && (0,jsx_runtime.jsx)("p", { className: "inline-error", children: lastError })] }));
}
/**
 * Progress label format depends on the scrape mode:
 *
 * - Visible: "Scraped N/total" — total is the row count on the page;
 *   meaningful denominator.
 * - Paginated: "Scraped N · page X" — N is cumulative across pages,
 *   total-rows-on-page belongs to the *current* page so showing
 *   "Scraped 57/50" reads as a bug ("how can you scrape more than
 *   there are?"). Drop the denominator and lead with the page index
 *   instead.
 */
function formatProgressLine(mode, progress) {
    const errorSuffix = progress.errors.length > 0
        ? ` · ${progress.errors.length} error${progress.errors.length === 1 ? "" : "s"}`
        : "";
    if (mode === "paginated") {
        return `Scraped ${progress.scrapedCount} · page ${progress.currentPage}${errorSuffix}`;
    }
    return `Scraped ${progress.scrapedCount}/${progress.totalRowsOnPage}${errorSuffix}`;
}

;// ./src/popup/App.tsx









const BULK_SOURCE_LABELS = {
    greenhouse: "Greenhouse",
    lever: "Lever",
    workday: "Workday",
};
const BULK_SOURCE_URL_PATTERNS = {
    greenhouse: [/boards\.greenhouse\.io\//, /[\w-]+\.greenhouse\.io\//],
    lever: [/jobs\.lever\.co\//, /[\w-]+\.lever\.co\//],
    workday: [/\.myworkdayjobs\.com\//, /\.workdayjobs\.com\//],
};
const CONTENT_SCRIPT_URL_PATTERNS = [
    /linkedin\.com\//,
    /indeed\.com\//,
    /greenhouse\.io\//,
    /boards\.greenhouse\.io\//,
    /lever\.co\//,
    /jobs\.lever\.co\//,
    /\/\/waterlooworks[-.a-z0-9]*\.uwaterloo\.ca\//i,
    /workdayjobs\.com\//,
    /myworkdayjobs\.com\//,
];
const LINKEDIN_JOBS_URL_PATTERN = /linkedin\.com\/jobs\/(?:view|search-results|search|collections)/;
const LINKEDIN_JOB_RETRY_DELAYS_MS = [600, 1400];
const PAGE_PROBE_TIMEOUT_MS = 4500;
function matchBulkSource(url) {
    if (!url)
        return null;
    for (const key of Object.keys(BULK_SOURCE_URL_PATTERNS)) {
        if (BULK_SOURCE_URL_PATTERNS[key].some((p) => p.test(url)))
            return key;
    }
    return null;
}
function hasContentScriptHost(url) {
    return (!!url && CONTENT_SCRIPT_URL_PATTERNS.some((pattern) => pattern.test(url)));
}
function isLinkedInJobsUrl(url) {
    return !!url && LINKEDIN_JOBS_URL_PATTERN.test(url);
}
function App() {
    const [viewState, setViewState] = (0,react.useState)("loading");
    const [profile, setProfile] = (0,react.useState)(null);
    const [pageStatus, setPageStatus] = (0,react.useState)(null);
    const [surfaceContext, setSurfaceContext] = (0,react.useState)(null);
    const [latestResume, setLatestResume] = (0,react.useState)(null);
    const [activeTabId, setActiveTabId] = (0,react.useState)(null);
    const [activeTabUrl, setActiveTabUrl] = (0,react.useState)(null);
    const [pageProbeState, setPageProbeState] = (0,react.useState)("checking");
    const [pageScanInFlight, setPageScanInFlight] = (0,react.useState)(false);
    const [pageScanError, setPageScanError] = (0,react.useState)(null);
    const [error, setError] = (0,react.useState)(null);
    // Cached so dashboard/review links can render without querying
    // GET_AUTH_STATUS again. Populated from the auth-status response on first
    // load and kept stable for the lifetime of the popup.
    const [apiBaseUrl, setApiBaseUrl] = (0,react.useState)(null);
    const [wwState, setWwState] = (0,react.useState)(null);
    const [wwBulkInFlight, setWwBulkInFlight] = (0,react.useState)(null);
    const [wwBulkResult, setWwBulkResult] = (0,react.useState)(null);
    const [wwBulkError, setWwBulkError] = (0,react.useState)(null);
    const [wwBulkProgress, setWwBulkProgress] = (0,react.useState)(null);
    // P3/#39 — Per-source state for Greenhouse / Lever / Workday. Keyed by
    // BulkSourceKey so a future source is a one-line addition.
    const [bulkStates, setBulkStates] = (0,react.useState)({});
    const [bulkInFlight, setBulkInFlight] = (0,react.useState)({});
    const [bulkResults, setBulkResults] = (0,react.useState)({});
    const [bulkErrors, setBulkErrors] = (0,react.useState)({});
    const [confirmingLogout, setConfirmingLogout] = (0,react.useState)(false);
    const profileScore = profile ? (0,scoring/* scoreResume */.K3)({ profile }).overall : null;
    (0,react.useEffect)(() => {
        checkAuthStatus();
        checkPageStatus();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    (0,react.useEffect)(() => {
        const listener = (message) => {
            if (message.type === "AUTH_STATUS_CHANGED") {
                void checkAuthStatus();
            }
            if (message.type === "WW_BULK_PROGRESS_FANOUT" && message.payload) {
                // The background re-broadcasts every progress event the content
                // script emitted. Stash it so the bulk card can render live counts;
                // clear on the terminal `done` event so the card flips back to its
                // idle / result state.
                if (message.payload.done) {
                    setWwBulkProgress(null);
                }
                else {
                    setWwBulkProgress(message.payload);
                }
            }
        };
        chrome.runtime.onMessage.addListener(listener);
        return () => chrome.runtime.onMessage.removeListener(listener);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    // On mount, ask the background for the latest bulk-scrape snapshot so a
    // popup reopened mid-scrape rehydrates its progress UI instead of looking
    // idle.
    (0,react.useEffect)(() => {
        let cancelled = false;
        (async () => {
            try {
                const resp = await (0,messages/* sendMessage */._z)({
                    type: "GET_BULK_PROGRESS",
                });
                if (!cancelled && resp.success && resp.data?.ww) {
                    setWwBulkProgress(resp.data.ww);
                    setWwBulkInFlight((resp.data.ww.currentPage ?? 1) > 1 ? "paginated" : "visible");
                }
            }
            catch {
                // best-effort; missing snapshot just means no scrape in flight
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);
    (0,react.useEffect)(() => {
        if (viewState !== "session-lost")
            return;
        const intervalId = window.setInterval(() => {
            void checkAuthStatus();
        }, 1000);
        return () => window.clearInterval(intervalId);
    }, [viewState]); // eslint-disable-line react-hooks/exhaustive-deps
    async function checkAuthStatus() {
        try {
            const response = await (0,messages/* sendMessage */._z)(messages/* Messages */.B2.getAuthStatus());
            if (response.success && response.data) {
                const { isAuthenticated, sessionLost, apiBaseUrl: url, } = response.data;
                if (url)
                    setApiBaseUrl(url);
                if (isAuthenticated) {
                    setViewState("authenticated");
                    loadProfile();
                }
                else if (sessionLost) {
                    setViewState("session-lost");
                }
                else {
                    setViewState("unauthenticated");
                }
            }
            else {
                setViewState("unauthenticated");
            }
        }
        catch (err) {
            setError(err.message);
            setViewState("error");
        }
    }
    async function loadProfile() {
        const response = await (0,messages/* sendMessage */._z)(messages/* Messages */.B2.getProfile());
        if (response.success && response.data) {
            setProfile(response.data);
        }
    }
    async function checkPageStatus(attempt = 0) {
        if (attempt === 0)
            setPageProbeState("checking");
        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true,
        });
        if (tab?.id) {
            setActiveTabId(tab.id);
            setActiveTabUrl(tab.url || null);
            let waterlooWorksListDetected = false;
            if (isWaterlooWorksUrl(tab.url)) {
                try {
                    const r = await sendTabMessageWithTimeout(tab.id, messages/* Messages */.B2.wwGetPageState(), PAGE_PROBE_TIMEOUT_MS);
                    if (r?.success && r.data) {
                        setWwState(r.data);
                        if (r.data.kind === "list") {
                            waterlooWorksListDetected = true;
                            setPageProbeState("ready");
                        }
                    }
                }
                catch {
                    setWwState(null);
                }
            }
            else {
                setWwState(null);
            }
            try {
                const response = await sendTabMessageWithTimeout(tab.id, messages/* Messages */.B2.getSurfaceContext(), PAGE_PROBE_TIMEOUT_MS);
                const context = (response ?? null);
                if (context?.page) {
                    setSurfaceContext(context);
                    setPageStatus({
                        hasForm: context.page.hasApplicationForm,
                        hasJobListing: context.page.job !== null,
                        detectedFields: context.page.detectedFieldCount,
                        detectedUploadCount: context.page.detectedUploadCount,
                        documentUploads: context.page.documentUploads,
                        scrapedJob: context.page.job,
                    });
                    if (context.page.detectedUploadCount > 0) {
                        void loadLatestResume();
                    }
                    else {
                        setLatestResume(null);
                    }
                    setPageProbeState("ready");
                    setPageScanError(null);
                    if (!context.page.job &&
                        isLinkedInJobsUrl(tab.url) &&
                        attempt < LINKEDIN_JOB_RETRY_DELAYS_MS.length) {
                        window.setTimeout(() => {
                            void checkPageStatus(attempt + 1);
                        }, LINKEDIN_JOB_RETRY_DELAYS_MS[attempt]);
                    }
                }
                else if (waterlooWorksListDetected) {
                    // Surface context came back empty but the WW row probe already
                    // told us this is a list page — keep state at "ready" so the bulk
                    // card renders.
                    setPageProbeState("ready");
                }
                else {
                    // No usable surface and no positive WW signal: force-resolve so the
                    // popup never stays in the "checking" idle state forever.
                    setPageProbeState(!tab.url || hasContentScriptHost(tab.url)
                        ? "needs-refresh"
                        : "unknown");
                }
            }
            catch {
                if (waterlooWorksListDetected) {
                    setPageProbeState("ready");
                }
                else {
                    setPageProbeState(!tab.url || hasContentScriptHost(tab.url)
                        ? "needs-refresh"
                        : "unknown");
                }
            }
            // P3/#39 — probe Greenhouse/Lever/Workday listing pages. Only one
            // matcher fires per visit (the user is on a single host).
            const bulkKey = matchBulkSource(tab.url);
            if (bulkKey) {
                try {
                    const messageType = bulkPageStateMessage(bulkKey);
                    const r = await sendTabMessageWithTimeout(tab.id, { type: messageType }, PAGE_PROBE_TIMEOUT_MS);
                    if (r?.success && r.data) {
                        setBulkStates((prev) => ({ ...prev, [bulkKey]: r.data }));
                    }
                }
                catch {
                    // Content script not yet loaded
                }
            }
        }
        else {
            setActiveTabId(null);
            setActiveTabUrl(null);
            setPageProbeState("unknown");
        }
    }
    function bulkPageStateMessage(key) {
        return `BULK_${key.toUpperCase()}_GET_PAGE_STATE`;
    }
    function bulkScrapeMessage(key, mode) {
        const suffix = mode === "visible" ? "SCRAPE_VISIBLE" : "SCRAPE_PAGINATED";
        return `BULK_${key.toUpperCase()}_${suffix}`;
    }
    async function handleBulkSourceScrape(key, mode) {
        setBulkInFlight((prev) => ({ ...prev, [key]: mode }));
        setBulkErrors((prev) => ({ ...prev, [key]: undefined }));
        setBulkResults((prev) => ({ ...prev, [key]: undefined }));
        try {
            const [tab] = await chrome.tabs.query({
                active: true,
                lastFocusedWindow: true,
            });
            if (!tab?.id)
                throw new Error("No active tab");
            const message = { type: bulkScrapeMessage(key, mode), payload: {} };
            const response = await chrome.tabs.sendMessage(tab.id, message);
            if (response?.success && response.data) {
                setBulkResults((prev) => ({ ...prev, [key]: response.data }));
            }
            else {
                setBulkErrors((prev) => ({
                    ...prev,
                    [key]: (0,error_messages/* messageForError */.p3)(new Error(response?.error || "Bulk scrape failed")),
                }));
            }
        }
        catch (err) {
            setBulkErrors((prev) => ({ ...prev, [key]: (0,error_messages/* messageForError */.p3)(err) }));
        }
        finally {
            setBulkInFlight((prev) => {
                const next = { ...prev };
                delete next[key];
                return next;
            });
        }
    }
    async function handleWwBulkScrape(mode) {
        setWwBulkInFlight(mode);
        setWwBulkError(null);
        setWwBulkResult(null);
        try {
            const [tab] = await chrome.tabs.query({
                active: true,
                lastFocusedWindow: true,
            });
            if (!tab?.id)
                throw new Error("No active tab");
            const message = mode === "visible"
                ? messages/* Messages */.B2.wwScrapeAllVisible()
                : messages/* Messages */.B2.wwScrapeAllPaginated();
            const response = await chrome.tabs.sendMessage(tab.id, message);
            if (response?.success && response.data) {
                setWwBulkResult(response.data);
            }
            else {
                setWwBulkError((0,error_messages/* messageForError */.p3)(new Error(response?.error || "Bulk scrape failed")));
            }
        }
        catch (err) {
            setWwBulkError((0,error_messages/* messageForError */.p3)(err));
        }
        finally {
            setWwBulkInFlight(null);
            setWwBulkProgress(null);
        }
    }
    async function handleWwBulkCancel() {
        try {
            const [tab] = await chrome.tabs.query({
                active: true,
                lastFocusedWindow: true,
            });
            if (!tab?.id)
                return;
            // The content script holds the AbortController; this just trips it.
            // The in-flight handleWwBulkScrape's `await chrome.tabs.sendMessage`
            // will resolve normally with whatever partial result was collected.
            await chrome.tabs.sendMessage(tab.id, { type: "WW_BULK_CANCEL" });
        }
        catch {
            // best-effort
        }
    }
    async function handleConnect() {
        setError(null);
        try {
            const response = await (0,messages/* sendMessage */._z)(messages/* Messages */.B2.openAuth());
            if (response.success) {
                window.close();
                return;
            }
            setError((0,error_messages/* messageForError */.p3)(new Error(response.error || "Failed to open")));
            setViewState("error");
        }
        catch (err) {
            setError((0,error_messages/* messageForError */.p3)(err));
            setViewState("error");
        }
    }
    async function handleLogout() {
        if (!confirmingLogout) {
            setConfirmingLogout(true);
            setTimeout(() => setConfirmingLogout(false), 4000);
            return;
        }
        await (0,messages/* sendMessage */._z)(messages/* Messages */.B2.logout());
        setViewState("unauthenticated");
        setProfile(null);
        setConfirmingLogout(false);
    }
    async function handleOpenDashboard() {
        const baseUrl = await resolveApiBaseUrl();
        chrome.tabs.create({ url: `${baseUrl}/dashboard` });
        window.close();
    }
    async function loadLatestResume() {
        const response = await (0,messages/* sendMessage */._z)(messages/* Messages */.B2.listResumes());
        if (response.success) {
            setLatestResume(response.data?.[0] ?? null);
        }
    }
    async function handleOpenStudioForResume() {
        const baseUrl = await resolveApiBaseUrl();
        const resumeParam = latestResume
            ? `?from=extension&tailorId=${encodeURIComponent(latestResume.id)}`
            : "";
        chrome.tabs.create({ url: `${baseUrl}/en/studio${resumeParam}` });
        window.close();
    }
    async function handleShowPanel() {
        if (!activeTabId)
            return;
        try {
            const response = await chrome.tabs.sendMessage(activeTabId, {
                type: "SHOW_SLOTHING_PANEL",
            });
            if (!response?.success) {
                await checkPageStatus();
                return;
            }
            window.close();
        }
        catch {
            await chrome.tabs.reload(activeTabId);
            window.close();
        }
    }
    async function handleRefreshTab() {
        if (!activeTabId)
            return;
        await chrome.tabs.reload(activeTabId);
        window.close();
    }
    async function handleScanCurrentPage() {
        setPageScanInFlight(true);
        setPageScanError(null);
        try {
            const [tab] = await chrome.tabs.query({
                active: true,
                lastFocusedWindow: true,
            });
            if (!tab?.id)
                throw new Error("No active tab");
            if (!canInjectIntoUrl(tab.url)) {
                throw new Error("This browser page cannot be scanned.");
            }
            await injectContentScripts(tab.id);
            await wait(250);
            await checkPageStatus();
        }
        catch (err) {
            setPageScanError(messageForPageScanError(err));
        }
        finally {
            setPageScanInFlight(false);
        }
    }
    /**
     * Resolves the configured Slothing API base URL, preferring the value we
     * cached at first paint (`apiBaseUrl`) and falling back to a fresh
     * GET_AUTH_STATUS roundtrip if we haven't seen one yet. Used by all the
     * deep-link handlers (#31).
     */
    async function resolveApiBaseUrl() {
        if (apiBaseUrl)
            return apiBaseUrl;
        const response = await (0,messages/* sendMessage */._z)(messages/* Messages */.B2.getAuthStatus());
        const data = response.data;
        return data?.apiBaseUrl || types/* DEFAULT_API_BASE_URL */.Ri;
    }
    /** Opens the review queue for the user to triage their bulk imports. (#31) */
    async function handleViewReviewQueue() {
        const baseUrl = await resolveApiBaseUrl();
        chrome.tabs.create({ url: opportunityReviewUrl(baseUrl) });
        window.close();
    }
    function profileInitial() {
        const name = profile?.contact?.name?.trim();
        if (name)
            return name.charAt(0).toUpperCase();
        const email = profile?.contact?.email;
        return email ? email.charAt(0).toUpperCase() : "S";
    }
    function supportedTabLabel() {
        const url = surfaceContext?.tab.url || activeTabUrl || undefined;
        if (!url || !hasContentScriptHost(url))
            return null;
        if (isWaterlooWorksUrl(url))
            return "WaterlooWorks";
        if (/linkedin\.com/.test(url))
            return "LinkedIn";
        if (/indeed\.com/.test(url))
            return "Indeed";
        if (/greenhouse\.io/.test(url))
            return "Greenhouse";
        if (/lever\.co/.test(url))
            return "Lever";
        if (/workdayjobs\.com/.test(url))
            return "Workday";
        return "this job site";
    }
    function signedOutContextCopy() {
        const site = supportedTabLabel();
        if (wwState?.kind === "list") {
            return {
                title: "WaterlooWorks jobs found",
                body: `Connect Slothing to import and track these ${wwState.rowCount} postings.`,
                site: "WaterlooWorks",
            };
        }
        if (pageStatus?.scrapedJob) {
            return {
                title: "Job detected",
                body: "Connect Slothing to tailor, save, and autofill from this posting.",
                site,
            };
        }
        if (pageStatus?.hasForm) {
            return {
                title: "Application page detected",
                body: "Connect Slothing to autofill this application from your profile.",
                site,
            };
        }
        if (site) {
            return {
                title: `${site} is supported`,
                body: "Connect Slothing to scan jobs, import postings, and open job tools here.",
                site,
            };
        }
        return null;
    }
    if (viewState === "loading") {
        return ((0,jsx_runtime.jsx)("div", { className: "popup", children: (0,jsx_runtime.jsxs)("div", { className: "state-center", children: [(0,jsx_runtime.jsx)("div", { className: "spinner" }), (0,jsx_runtime.jsx)("p", { className: "state-text", children: "Connecting\u2026" })] }) }));
    }
    if (viewState === "error") {
        return ((0,jsx_runtime.jsx)("div", { className: "popup", children: (0,jsx_runtime.jsxs)("div", { className: "state-center", children: [(0,jsx_runtime.jsx)("div", { className: "state-icon error", "aria-hidden": true, children: "!" }), (0,jsx_runtime.jsx)("h2", { className: "state-title", children: "Something went wrong" }), (0,jsx_runtime.jsx)("p", { className: "state-text", children: error }), (0,jsx_runtime.jsx)("button", { className: "btn primary", onClick: () => checkAuthStatus(), children: "Try again" })] }) }));
    }
    if (viewState === "unauthenticated") {
        const contextCopy = signedOutContextCopy();
        return ((0,jsx_runtime.jsx)("div", { className: "popup", children: (0,jsx_runtime.jsxs)("div", { className: `hero ${contextCopy ? "contextual" : ""}`, children: [(0,jsx_runtime.jsx)("img", { className: "hero-mark", src: chrome.runtime.getURL("brand/slothing-mark.png"), alt: "" }), contextCopy?.site && ((0,jsx_runtime.jsx)("span", { className: "hero-kicker", children: contextCopy.site })), (0,jsx_runtime.jsx)("h1", { className: "hero-title", children: contextCopy?.title || "Slothing" }), (0,jsx_runtime.jsx)("p", { className: "hero-sub", children: contextCopy?.body ||
                            "Auto-fill applications. Import jobs. Track everything." }), (0,jsx_runtime.jsx)("button", { className: "btn primary block", onClick: handleConnect, children: contextCopy ? "Connect to use job tools" : "Connect account" }), (0,jsx_runtime.jsx)("p", { className: "hero-foot", children: "You'll sign in once \u2014 Slothing remembers." })] }) }));
    }
    if (viewState === "session-lost") {
        const contextCopy = signedOutContextCopy();
        return ((0,jsx_runtime.jsx)("div", { className: "popup", children: (0,jsx_runtime.jsxs)("div", { className: `hero session-lost ${contextCopy ? "contextual" : ""}`, children: [(0,jsx_runtime.jsx)("div", { className: "hero-mark warn", "aria-hidden": true, children: "!" }), contextCopy?.site && ((0,jsx_runtime.jsx)("span", { className: "hero-kicker", children: contextCopy.site })), (0,jsx_runtime.jsx)("h1", { className: "hero-title", children: "Session lost" }), (0,jsx_runtime.jsx)("p", { className: "hero-sub", children: contextCopy
                            ? "Reconnect to use Slothing job tools on this page."
                            : "Slothing got reset by your browser. Reconnect to pick up where you left off — your profile and data are safe." }), (0,jsx_runtime.jsx)("button", { className: "btn primary block", onClick: handleConnect, children: "Reconnect" }), (0,jsx_runtime.jsx)("p", { className: "hero-foot", children: "Takes about five seconds." })] }) }));
    }
    const detectedJob = pageStatus?.scrapedJob;
    const supportedSite = supportedTabLabel();
    const workspaceVisible = !!surfaceContext?.workspace.visible;
    const showWwBulk = wwState && wwState.kind === "list";
    const detectedBulkSources = Object.keys(BULK_SOURCE_LABELS).filter((key) => bulkStates[key]?.detected);
    const nothingDetected = !pageStatus?.hasForm &&
        !detectedJob &&
        !showWwBulk &&
        detectedBulkSources.length === 0 &&
        pageProbeState !== "checking" &&
        pageProbeState !== "needs-refresh" &&
        !supportedSite;
    // On a WW list page the bulk card already conveys "we know what this page
    // is"; the per-job "No job detected" status card becomes pure noise. Only
    // render the status card when we have something useful to say about a
    // specific job/form/workspace, OR when no bulk source has matched.
    //
    // Also suppress while a bulk scrape is in flight — the orchestrator opens
    // posting modals as part of its walk, and surfacing "Job detected: <last
    // row>" would confuse the user into thinking they navigated there.
    const hasPageStatus = !wwBulkInFlight &&
        (!!detectedJob ||
            !!pageStatus?.hasForm ||
            workspaceVisible ||
            (pageProbeState === "ready" &&
                !showWwBulk &&
                detectedBulkSources.length === 0));
    const currentTabTitle = workspaceVisible
        ? "Job workspace active"
        : detectedJob
            ? "Job detected"
            : pageStatus?.hasForm
                ? "Application detected"
                : pageProbeState === "ready"
                    ? "No job detected"
                    : pageProbeState === "checking"
                        ? "Scanning page"
                        : "Unsupported page";
    return ((0,jsx_runtime.jsxs)("div", { className: "popup", children: [(0,jsx_runtime.jsxs)("header", { className: "topbar", children: [(0,jsx_runtime.jsxs)("div", { className: "brand", children: [(0,jsx_runtime.jsx)("img", { className: "brand-mark", src: chrome.runtime.getURL("brand/slothing-mark.png"), alt: "" }), (0,jsx_runtime.jsx)("span", { className: "brand-name", children: "Slothing" })] }), (0,jsx_runtime.jsxs)("span", { className: "pill ok", title: "Extension connected", children: [(0,jsx_runtime.jsx)("span", { className: "pill-dot" }), "Connected"] })] }), (0,jsx_runtime.jsxs)("section", { className: "profile-card", children: [(0,jsx_runtime.jsx)("div", { className: "avatar", children: profileInitial() }), (0,jsx_runtime.jsxs)("div", { className: "profile-meta", children: [(0,jsx_runtime.jsx)("div", { className: "profile-name", children: profile?.contact?.name ||
                                    profile?.contact?.email ||
                                    "Set up your profile" }), (0,jsx_runtime.jsx)("div", { className: "profile-sub", children: profile?.computed?.currentTitle &&
                                    profile?.computed?.currentCompany
                                    ? `${profile.computed.currentTitle} · ${profile.computed.currentCompany}`
                                    : profile?.contact?.email ||
                                        "Add your work history so Slothing can tailor" })] }), profileScore !== null ? ((0,jsx_runtime.jsxs)("div", { className: `score ${profileScore >= 80 ? "high" : profileScore >= 50 ? "mid" : "low"}`, title: "Profile completeness", children: [(0,jsx_runtime.jsx)("span", { className: "score-num", children: profileScore }), (0,jsx_runtime.jsx)("span", { className: "score-unit", children: "/100" })] })) : ((0,jsx_runtime.jsx)("button", { className: "btn ghost tight", onClick: handleOpenDashboard, children: "Open" }))] }), (0,jsx_runtime.jsxs)("main", { className: "content", children: [pageProbeState === "needs-refresh" && ((0,jsx_runtime.jsxs)("article", { className: "status-card", children: [(0,jsx_runtime.jsxs)("div", { className: "status-copy", children: [(0,jsx_runtime.jsx)("span", { className: "status-eyebrow", children: "Current tab" }), (0,jsx_runtime.jsx)("span", { className: "status-title", children: "Page needs refresh" })] }), (0,jsx_runtime.jsxs)("div", { className: "status-actions", children: [(0,jsx_runtime.jsx)("button", { className: "btn primary", onClick: handleScanCurrentPage, disabled: pageScanInFlight, children: pageScanInFlight ? "Scanning…" : "Scan this page" }), (0,jsx_runtime.jsx)("button", { className: "btn", onClick: handleRefreshTab, children: "Refresh tab" })] }), pageScanError && (0,jsx_runtime.jsx)("p", { className: "inline-error", children: pageScanError })] })), pageProbeState === "checking" && ((0,jsx_runtime.jsxs)("div", { className: "idle", children: [(0,jsx_runtime.jsx)("p", { className: "idle-title", children: "Scanning current tab" }), (0,jsx_runtime.jsx)("p", { className: "idle-sub", children: "Checking this page for jobs, lists, and application forms." })] })), hasPageStatus && ((0,jsx_runtime.jsxs)("article", { className: "status-card active", children: [(0,jsx_runtime.jsxs)("header", { className: "status-head", children: [(0,jsx_runtime.jsxs)("div", { className: "status-copy", children: [(0,jsx_runtime.jsx)("span", { className: "status-eyebrow", children: "Current tab" }), (0,jsx_runtime.jsx)("span", { className: "status-title", children: currentTabTitle })] }), pageStatus?.hasForm && ((0,jsx_runtime.jsxs)("span", { className: "badge", children: [pageStatus.detectedFields, " fields"] }))] }), detectedJob ? ((0,jsx_runtime.jsxs)("div", { className: "page-summary", children: [(0,jsx_runtime.jsx)("span", { className: "clip", title: detectedJob.title, children: detectedJob.title }), (0,jsx_runtime.jsx)("span", { className: "card-sub clip", children: detectedJob.company })] })) : ((0,jsx_runtime.jsx)("p", { className: "inline-note", children: pageStatus?.hasForm
                                    ? "Ready on this application page."
                                    : "Open a job posting, then scan again." })), (pageStatus?.detectedUploadCount ?? 0) > 0 && ((0,jsx_runtime.jsxs)("div", { className: "page-summary", children: [(0,jsx_runtime.jsx)("span", { className: "clip", children: "Resume upload detected. Attach your file manually." }), latestResume ? ((0,jsx_runtime.jsxs)("span", { className: "card-sub clip", title: latestResume.name, children: ["Latest: ", latestResume.name] })) : ((0,jsx_runtime.jsx)("span", { className: "card-sub clip", children: "Open Studio to export your latest document." })), (0,jsx_runtime.jsx)("button", { className: "btn block", onClick: handleOpenStudioForResume, children: latestResume ? "Open latest resume" : "Open Studio" })] })), detectedJob && ((0,jsx_runtime.jsx)("button", { className: "btn primary block", onClick: handleShowPanel, children: "Open job tools" })), !detectedJob && pageProbeState === "ready" && ((0,jsx_runtime.jsx)("button", { className: "btn block", onClick: () => checkPageStatus(), children: "Scan again" }))] })), showWwBulk && wwState && ((0,jsx_runtime.jsx)(BulkSourceCard, { sourceLabel: "WaterlooWorks", detectedCount: wwState.rowCount, busy: wwBulkInFlight, progress: wwBulkProgress, lastResult: wwBulkResult, lastError: wwBulkError, onScrapeVisible: () => handleWwBulkScrape("visible"), onScrapePaginated: () => handleWwBulkScrape("paginated"), onCancel: handleWwBulkCancel, onViewTracker: handleViewReviewQueue })), detectedBulkSources.map((key) => {
                        const state = bulkStates[key];
                        if (!state)
                            return null;
                        return ((0,jsx_runtime.jsx)(BulkSourceCard, { sourceLabel: BULK_SOURCE_LABELS[key], detectedCount: state.rowCount, busy: bulkInFlight[key] ?? null, lastResult: bulkResults[key] ?? null, lastError: bulkErrors[key] ?? null, onScrapeVisible: () => handleBulkSourceScrape(key, "visible"), onScrapePaginated: () => handleBulkSourceScrape(key, "paginated"), onViewTracker: handleViewReviewQueue }, key));
                    }), nothingDetected && !hasPageStatus && ((0,jsx_runtime.jsxs)("div", { className: "idle", children: [(0,jsx_runtime.jsx)("p", { className: "idle-title", children: "Unsupported page" }), (0,jsx_runtime.jsx)("p", { className: "idle-sub", children: "Slothing is not running on this tab. Scan once, or open a supported job page." }), (0,jsx_runtime.jsx)("button", { className: "btn block", onClick: handleScanCurrentPage, disabled: pageScanInFlight, children: pageScanInFlight ? "Scanning…" : "Scan this page" }), pageScanError && (0,jsx_runtime.jsx)("p", { className: "inline-error", children: pageScanError })] })), !hasPageStatus &&
                        !nothingDetected &&
                        supportedSite &&
                        !showWwBulk &&
                        detectedBulkSources.length === 0 && ((0,jsx_runtime.jsxs)("div", { className: "idle", children: [(0,jsx_runtime.jsxs)("p", { className: "idle-title", children: [supportedSite, " is supported"] }), (0,jsx_runtime.jsx)("p", { className: "idle-sub", children: "Scanning this tab for a job posting or application form." })] })), (0,jsx_runtime.jsxs)("div", { className: "quick-row", children: [(0,jsx_runtime.jsxs)("button", { className: "quick", onClick: handleOpenDashboard, children: [(0,jsx_runtime.jsx)("span", { className: "quick-icon", "aria-hidden": true, children: "\u2197" }), (0,jsx_runtime.jsx)("span", { children: "Dashboard" })] }), (0,jsx_runtime.jsxs)("button", { className: "quick", onClick: () => chrome.runtime.openOptionsPage(), children: [(0,jsx_runtime.jsx)("span", { className: "quick-icon", "aria-hidden": true, children: "\u2699" }), (0,jsx_runtime.jsx)("span", { children: "Settings" })] })] })] }), (0,jsx_runtime.jsxs)("footer", { className: "footbar", children: [(0,jsx_runtime.jsx)("button", { className: `link ${confirmingLogout ? "warn" : ""}`, onClick: handleLogout, children: confirmingLogout ? "Click again to disconnect" : "Disconnect" }), profile?.updatedAt && ((0,jsx_runtime.jsxs)("span", { className: "updated", children: ["Synced ", (0,formatters/* formatRelative */.om)(profile.updatedAt)] }))] })] }));
}
function wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
}
function sendTabMessageWithTimeout(tabId, message, timeoutMs) {
    return new Promise((resolve, reject) => {
        let settled = false;
        const timeoutId = window.setTimeout(() => {
            if (settled)
                return;
            settled = true;
            reject(new Error("Slothing did not hear back from this page."));
        }, timeoutMs);
        const settle = (fn) => {
            if (settled)
                return;
            settled = true;
            window.clearTimeout(timeoutId);
            fn();
        };
        try {
            // Firefox's chrome.* WebExtension methods require their native `this`
            // binding. Calling an extracted `sendMessage` reference throws an
            // "Illegal invocation" TypeError (or silently fails), which left the
            // popup stuck in its initial "checking" state because nothing ever
            // reached the content script. Invoke via the namespace, or — when
            // passing it through here — bind explicitly.
            const callback = (response) => {
                const lastError = chrome.runtime.lastError;
                settle(() => {
                    if (lastError)
                        reject(new Error(lastError.message));
                    else
                        resolve(response);
                });
            };
            const maybePromise = chrome.tabs.sendMessage(tabId, message, callback);
            if (maybePromise &&
                typeof maybePromise.then === "function") {
                maybePromise.then((response) => settle(() => resolve(response)), (err) => settle(() => reject(err)));
            }
        }
        catch (err) {
            settle(() => reject(err));
        }
    });
}
function canInjectIntoUrl(url) {
    if (!url)
        return false;
    return /^(https?|file):\/\//i.test(url);
}
async function injectContentScripts(tabId) {
    if (chrome.scripting?.executeScript) {
        await chrome.scripting
            .insertCSS({
            target: { tabId },
            files: ["content.css"],
        })
            .catch(() => undefined);
        await chrome.scripting.executeScript({
            target: { tabId },
            files: ["sharedUi.js"],
        });
        await chrome.scripting.executeScript({
            target: { tabId },
            files: ["content.js"],
        });
        return;
    }
    const tabs = chrome.tabs;
    await callTabsInjection(tabs, "insertCSS", tabId, "content.css", true);
    await callTabsInjection(tabs, "executeScript", tabId, "sharedUi.js");
    await callTabsInjection(tabs, "executeScript", tabId, "content.js");
}
function callTabsInjection(tabs, method, tabId, file, optional = false) {
    const fn = tabs[method];
    if (!fn) {
        return optional
            ? Promise.resolve()
            : Promise.reject(new Error("This browser cannot scan the current page."));
    }
    return new Promise((resolve, reject) => {
        let settled = false;
        const settle = (err) => {
            if (settled)
                return;
            settled = true;
            if (err) {
                if (optional)
                    resolve();
                else
                    reject(toPageScanError(err));
                return;
            }
            const lastError = chrome.runtime.lastError;
            if (lastError && !optional) {
                reject(new Error(lastError.message));
                return;
            }
            resolve();
        };
        try {
            // Firefox's chrome.* WebExtension methods require their native `this`
            // binding. Calling an extracted `executeScript` function throws a
            // TypeError, which previously surfaced as a misleading "Network error".
            const result = fn.call(tabs, tabId, { file }, () => settle());
            if (result && typeof result.then === "function") {
                result.then(() => settle(), settle);
            }
        }
        catch (err) {
            settle(err);
        }
    });
}
function toPageScanError(err) {
    const raw = err instanceof Error ? err.message : String(err || "");
    if (/permission|access|privilege|not allowed|cannot access/i.test(raw)) {
        return new Error("Firefox blocked access to this tab. Refresh it and scan again.");
    }
    if (/executeScript|insertCSS|not a function|interface/i.test(raw)) {
        return new Error("Firefox could not inject Slothing into this tab. Refresh it and scan again.");
    }
    return err instanceof Error
        ? err
        : new Error(raw || "Could not scan this page.");
}
function messageForPageScanError(err) {
    const normalized = toPageScanError(err);
    if (err instanceof TypeError && normalized === err) {
        return "Firefox could not inject Slothing into this tab. Refresh it and scan again.";
    }
    return (0,error_messages/* messageForError */.p3)(normalized);
}
function isWaterlooWorksUrl(url) {
    if (!url)
        return false;
    try {
        return /^waterlooworks[-.a-z0-9]*\.uwaterloo\.ca$/i.test(new URL(url).hostname);
    }
    catch {
        return /waterlooworks/i.test(url);
    }
}

;// ./src/popup/index.tsx

// Firefox's `chrome.*` compat is callback-based, so `await chrome.tabs.query(...)`
// resolves to `undefined` and downstream code throws. Aliasing global `chrome`
// to the polyfilled `browser` makes every existing `chrome.*` call Promise-
// returning on both Firefox and Chrome with no call-site changes.

if (typeof globalThis !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    globalThis.chrome = (browser_polyfill_default());
}




const container = document.getElementById("root");
if (container) {
    const root = (0,client/* createRoot */.H)(container);
    root.render((0,jsx_runtime.jsx)(react.StrictMode, { children: (0,jsx_runtime.jsx)(App, {}) }));
}


/***/ },

/***/ 543
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   p3: () => (/* binding */ messageForError)
/* harmony export */ });
/* unused harmony exports messageForStatus, retryExhaustedMessage */
/**
 * User-facing error string mapping for the Slothing extension.
 *
 * The popup (and any other extension surface) should never show raw
 * `"Request failed: 503"` / `"Authentication expired"` strings. Wrap any
 * error path in `messageForError(err)` to get an English sentence safe
 * for end-users.
 *
 * Mirror of the message tone used by `apps/web/.../extension/connect/page.tsx`
 * `messageForStatus` — the connect page keeps its own copy because it sits
 * inside the next-intl tree (different package boundary), but the
 * user-visible strings should stay aligned. If you change one, change both.
 *
 * English-only by design: the extension itself does not use next-intl.
 */
/**
 * Maps an HTTP status code to a human-friendly message.
 */
function messageForStatus(status) {
    if (status === 401 || status === 403) {
        return "Sign in expired. Reconnect the extension.";
    }
    if (status === 429) {
        return "We're rate-limited. Try again in a minute.";
    }
    if (status >= 500) {
        return "Slothing servers are having a problem.";
    }
    return "Something went wrong. Please try again.";
}
function retryExhaustedMessage() {
    return "Slothing is still not responding after retrying. Try again in a minute.";
}
/**
 * Best-effort mapping of an unknown thrown value to a human-friendly
 * message. Recognises the specific phrases the api-client throws today
 * (`"Authentication expired"`, `"Not authenticated"`, `"Request failed: <code>"`,
 * `"Failed to fetch"`) and falls back to the original message for anything
 * else — that's almost always more useful than a generic catch-all.
 */
function messageForError(err) {
    // Generic network failure (fetch in service workers throws TypeError here)
    if (err instanceof TypeError) {
        return "Network error. Check your connection and try again.";
    }
    const raw = err instanceof Error ? err.message : "";
    if (!raw)
        return "Something went wrong. Please try again.";
    // Auth-shaped messages from SlothingAPIClient.
    if (raw === "Authentication expired" ||
        raw === "Not authenticated" ||
        /unauthor/i.test(raw)) {
        return messageForStatus(401);
    }
    // `Request failed: 503` — recover the status code.
    const match = raw.match(/Request failed:\s*(\d{3})/);
    if (match) {
        const code = Number(match[1]);
        if (Number.isFinite(code))
            return messageForStatus(code);
    }
    const retryMatch = raw.match(/Request still failing after retry:\s*(\d{3})/);
    if (retryMatch) {
        return retryExhaustedMessage();
    }
    // Browser fetch failures bubble up as "Failed to fetch".
    if (/failed to fetch/i.test(raw) || /network/i.test(raw)) {
        return "Network error. Check your connection and try again.";
    }
    // For anything else, the underlying message is usually a sentence already
    // (e.g. "Couldn't read the full job description from this page.").
    return raw;
}


/***/ },

/***/ 154
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   B2: () => (/* binding */ Messages),
/* harmony export */   _z: () => (/* binding */ sendMessage)
/* harmony export */ });
/* unused harmony exports sendToTab, broadcastMessage */
// Message passing utilities for extension communication
// Type-safe message creators
const Messages = {
    // Auth messages
    getAuthStatus: () => ({ type: "GET_AUTH_STATUS" }),
    getSurfaceContext: () => ({ type: "GET_SURFACE_CONTEXT" }),
    openAuth: () => ({ type: "OPEN_AUTH" }),
    logout: () => ({ type: "LOGOUT" }),
    // Profile messages
    getProfile: () => ({ type: "GET_PROFILE" }),
    getSettings: () => ({ type: "GET_SETTINGS" }),
    // Form filling messages
    fillForm: (fields) => ({
        type: "FILL_FORM",
        payload: fields,
    }),
    // Scraping messages
    scrapeJob: () => ({ type: "SCRAPE_JOB" }),
    scrapeJobList: () => ({ type: "SCRAPE_JOB_LIST" }),
    importJob: (job) => ({
        type: "IMPORT_JOB",
        payload: job,
    }),
    importJobsBatch: (jobs) => ({
        type: "IMPORT_JOBS_BATCH",
        payload: jobs,
    }),
    trackApplied: (payload) => ({
        type: "TRACK_APPLIED",
        payload,
    }),
    openDashboard: () => ({ type: "OPEN_DASHBOARD" }),
    captureVisibleTab: () => ({ type: "CAPTURE_VISIBLE_TAB" }),
    tailorFromPage: (job, baseResumeId) => ({
        type: "TAILOR_FROM_PAGE",
        payload: { job, baseResumeId },
    }),
    generateCoverLetterFromPage: (job) => ({
        type: "GENERATE_COVER_LETTER_FROM_PAGE",
        payload: job,
    }),
    /** #34 — fetch the user's recently-saved tailored resumes for the picker. */
    listResumes: () => ({ type: "LIST_RESUMES" }),
    // Learning messages
    saveAnswer: (data) => ({
        type: "SAVE_ANSWER",
        payload: data,
    }),
    searchAnswers: (question) => ({
        type: "SEARCH_ANSWERS",
        payload: question,
    }),
    matchAnswerBank: (payload) => ({
        type: "MATCH_ANSWER_BANK",
        payload,
    }),
    jobDetected: (meta) => ({
        type: "JOB_DETECTED",
        payload: meta,
    }),
    // WaterlooWorks-specific bulk scraping (driven from popup, executed in content
    // script by waterloo-works-orchestrator.ts).
    wwScrapeAllVisible: () => ({
        type: "WW_SCRAPE_ALL_VISIBLE",
    }),
    wwScrapeAllPaginated: (opts) => ({
        type: "WW_SCRAPE_ALL_PAGINATED",
        payload: opts ?? {},
    }),
    wwGetPageState: () => ({ type: "WW_GET_PAGE_STATE" }),
    // P3/#39 — Bulk scraping for public ATS board hosts. Popup → content-script.
    // Each pair mirrors the WW shape so the same `BulkSourceCard` UX can drive
    // every source. Each orchestrator caps at 200/session (overridable below).
    bulkGreenhouseGetPageState: () => ({
        type: "BULK_GREENHOUSE_GET_PAGE_STATE",
    }),
    bulkGreenhouseScrapeVisible: () => ({
        type: "BULK_GREENHOUSE_SCRAPE_VISIBLE",
    }),
    bulkGreenhouseScrapePaginated: (opts) => ({
        type: "BULK_GREENHOUSE_SCRAPE_PAGINATED",
        payload: opts ?? {},
    }),
    bulkLeverGetPageState: () => ({
        type: "BULK_LEVER_GET_PAGE_STATE",
    }),
    bulkLeverScrapeVisible: () => ({
        type: "BULK_LEVER_SCRAPE_VISIBLE",
    }),
    bulkLeverScrapePaginated: (opts) => ({
        type: "BULK_LEVER_SCRAPE_PAGINATED",
        payload: opts ?? {},
    }),
    bulkWorkdayGetPageState: () => ({
        type: "BULK_WORKDAY_GET_PAGE_STATE",
    }),
    bulkWorkdayScrapeVisible: () => ({
        type: "BULK_WORKDAY_SCRAPE_VISIBLE",
    }),
    bulkWorkdayScrapePaginated: (opts) => ({
        type: "BULK_WORKDAY_SCRAPE_PAGINATED",
        payload: opts ?? {},
    }),
    // P4/#40 — Helper for the chat-port start frame. The actual stream uses a
    // long-lived chrome.runtime.connect port (CHAT_PORT_NAME) rather than
    // chrome.runtime.sendMessage, but exposing a typed builder keeps callsites
    // self-documenting.
    chatStreamStart: (payload) => ({
        type: "CHAT_STREAM_START",
        prompt: payload.prompt,
        jobContext: payload.jobContext,
    }),
    // Corrections feedback loop (#33). Fired when a user edits an autofilled
    // field and the final value differs from the original suggestion — the
    // background forwards it to /api/extension/field-mappings/correct so
    // future autofills on the same domain prefer the corrected value.
    saveCorrection: (payload) => ({
        type: "SAVE_CORRECTION",
        payload,
    }),
    // P3 / #36 #37 — multi-step form support (Workday, Greenhouse).
    /** Background → content: a step transition just fired for this tab. */
    multistepStepTransition: (payload) => ({
        type: "MULTISTEP_STEP_TRANSITION",
        payload,
    }),
    /** Content → background: return the current tab id. */
    getTabId: () => ({ type: "GET_TAB_ID" }),
    /**
     * Content → background: ensure the `webNavigation` permission is granted.
     * In Chrome MV3 it's declared at install time and the response is always
     * `{ granted: true }`. In Firefox MV2 the background calls
     * `browser.permissions.request(...)` and returns the user's verdict.
     */
    requestWebNavigationPermission: () => ({
        type: "REQUEST_WEBNAVIGATION_PERMISSION",
    }),
    /** Content → background: is `webNavigation` currently usable? */
    hasWebNavigationPermission: () => ({
        type: "HAS_WEBNAVIGATION_PERMISSION",
    }),
};
// Send message to background script
async function sendMessage(message) {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage(message, (response) => {
            if (chrome.runtime.lastError) {
                resolve({ success: false, error: chrome.runtime.lastError.message });
            }
            else {
                resolve(response || { success: false, error: "No response received" });
            }
        });
    });
}
// Send message to content script in specific tab
async function sendToTab(tabId, message) {
    return new Promise((resolve) => {
        chrome.tabs.sendMessage(tabId, message, (response) => {
            if (chrome.runtime.lastError) {
                resolve({ success: false, error: chrome.runtime.lastError.message });
            }
            else {
                resolve(response || { success: false, error: "No response received" });
            }
        });
    });
}
// Send message to all content scripts
async function broadcastMessage(message) {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
        if (tab.id) {
            try {
                await chrome.tabs.sendMessage(tab.id, message);
            }
            catch {
                // Tab might not have content script loaded
            }
        }
    }
}


/***/ },

/***/ 353
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Ri: () => (/* binding */ DEFAULT_API_BASE_URL),
/* harmony export */   Xf: () => (/* binding */ LEGACY_LOCAL_API_BASE_URL),
/* harmony export */   a$: () => (/* binding */ DEFAULT_SETTINGS),
/* harmony export */   eA: () => (/* binding */ SHOULD_PROMOTE_LEGACY_LOCAL_API_BASE_URL),
/* harmony export */   fc: () => (/* binding */ CHAT_PORT_NAME)
/* harmony export */ });
/**
 * P4/#40 — Long-lived port name used by the inline AI assistant. The content
 * script calls `chrome.runtime.connect({ name: CHAT_PORT_NAME })` and the
 * background's `chrome.runtime.onConnect` listener filters by this name.
 */
const CHAT_PORT_NAME = "slothing-chat-stream";
const DEFAULT_SETTINGS = {
    autoFillEnabled: true,
    showConfidenceIndicators: true,
    minimumConfidence: 0.5,
    learnFromAnswers: true,
    notifyOnJobDetected: true,
    autoTrackApplicationsEnabled: true,
    captureScreenshotEnabled: false,
    scrapeThrottleMs: 500,
    scrapeChunkSize: 5,
    scrapeMaxJobs: 200,
    scrapeMaxPages: 50,
    scrapeDedupeEnabled: true,
};
const LEGACY_LOCAL_API_BASE_URL = "http://localhost:3000";
const DEFAULT_API_BASE_URL = "http://localhost:3000" || 0;
const SHOULD_PROMOTE_LEGACY_LOCAL_API_BASE_URL = DEFAULT_API_BASE_URL !== LEGACY_LOCAL_API_BASE_URL;


/***/ },

/***/ 948
(module, exports) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
  if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else // removed by dead control flow
{ var mod; }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (module) {
  /* webextension-polyfill - v0.10.0 - Fri Aug 12 2022 19:42:44 */

  /* -*- Mode: indent-tabs-mode: nil; js-indent-level: 2 -*- */

  /* vim: set sts=2 sw=2 et tw=80: */

  /* This Source Code Form is subject to the terms of the Mozilla Public
   * License, v. 2.0. If a copy of the MPL was not distributed with this
   * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
  "use strict";

  if (!globalThis.chrome?.runtime?.id) {
    throw new Error("This script should only be loaded in a browser extension.");
  }

  if (typeof globalThis.browser === "undefined" || Object.getPrototypeOf(globalThis.browser) !== Object.prototype) {
    const CHROME_SEND_MESSAGE_CALLBACK_NO_RESPONSE_MESSAGE = "The message port closed before a response was received."; // Wrapping the bulk of this polyfill in a one-time-use function is a minor
    // optimization for Firefox. Since Spidermonkey does not fully parse the
    // contents of a function until the first time it's called, and since it will
    // never actually need to be called, this allows the polyfill to be included
    // in Firefox nearly for free.

    const wrapAPIs = extensionAPIs => {
      // NOTE: apiMetadata is associated to the content of the api-metadata.json file
      // at build time by replacing the following "include" with the content of the
      // JSON file.
      const apiMetadata = {
        "alarms": {
          "clear": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "clearAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "get": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "bookmarks": {
          "create": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "get": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getChildren": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getRecent": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getSubTree": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getTree": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "move": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeTree": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "search": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "update": {
            "minArgs": 2,
            "maxArgs": 2
          }
        },
        "browserAction": {
          "disable": {
            "minArgs": 0,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "enable": {
            "minArgs": 0,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "getBadgeBackgroundColor": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getBadgeText": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getPopup": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getTitle": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "openPopup": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "setBadgeBackgroundColor": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setBadgeText": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setIcon": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "setPopup": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setTitle": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          }
        },
        "browsingData": {
          "remove": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "removeCache": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeCookies": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeDownloads": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeFormData": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeHistory": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeLocalStorage": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removePasswords": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removePluginData": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "settings": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "commands": {
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "contextMenus": {
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "update": {
            "minArgs": 2,
            "maxArgs": 2
          }
        },
        "cookies": {
          "get": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAll": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAllCookieStores": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "set": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "devtools": {
          "inspectedWindow": {
            "eval": {
              "minArgs": 1,
              "maxArgs": 2,
              "singleCallbackArg": false
            }
          },
          "panels": {
            "create": {
              "minArgs": 3,
              "maxArgs": 3,
              "singleCallbackArg": true
            },
            "elements": {
              "createSidebarPane": {
                "minArgs": 1,
                "maxArgs": 1
              }
            }
          }
        },
        "downloads": {
          "cancel": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "download": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "erase": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getFileIcon": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "open": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "pause": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeFile": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "resume": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "search": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "show": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          }
        },
        "extension": {
          "isAllowedFileSchemeAccess": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "isAllowedIncognitoAccess": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "history": {
          "addUrl": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "deleteAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "deleteRange": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "deleteUrl": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getVisits": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "search": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "i18n": {
          "detectLanguage": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAcceptLanguages": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "identity": {
          "launchWebAuthFlow": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "idle": {
          "queryState": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "management": {
          "get": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getSelf": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "setEnabled": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "uninstallSelf": {
            "minArgs": 0,
            "maxArgs": 1
          }
        },
        "notifications": {
          "clear": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "create": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getPermissionLevel": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "update": {
            "minArgs": 2,
            "maxArgs": 2
          }
        },
        "pageAction": {
          "getPopup": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getTitle": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "hide": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setIcon": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "setPopup": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setTitle": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "show": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          }
        },
        "permissions": {
          "contains": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "request": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "runtime": {
          "getBackgroundPage": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getPlatformInfo": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "openOptionsPage": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "requestUpdateCheck": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "sendMessage": {
            "minArgs": 1,
            "maxArgs": 3
          },
          "sendNativeMessage": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "setUninstallURL": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "sessions": {
          "getDevices": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getRecentlyClosed": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "restore": {
            "minArgs": 0,
            "maxArgs": 1
          }
        },
        "storage": {
          "local": {
            "clear": {
              "minArgs": 0,
              "maxArgs": 0
            },
            "get": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "getBytesInUse": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "remove": {
              "minArgs": 1,
              "maxArgs": 1
            },
            "set": {
              "minArgs": 1,
              "maxArgs": 1
            }
          },
          "managed": {
            "get": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "getBytesInUse": {
              "minArgs": 0,
              "maxArgs": 1
            }
          },
          "sync": {
            "clear": {
              "minArgs": 0,
              "maxArgs": 0
            },
            "get": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "getBytesInUse": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "remove": {
              "minArgs": 1,
              "maxArgs": 1
            },
            "set": {
              "minArgs": 1,
              "maxArgs": 1
            }
          }
        },
        "tabs": {
          "captureVisibleTab": {
            "minArgs": 0,
            "maxArgs": 2
          },
          "create": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "detectLanguage": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "discard": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "duplicate": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "executeScript": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "get": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getCurrent": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getZoom": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getZoomSettings": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "goBack": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "goForward": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "highlight": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "insertCSS": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "move": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "query": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "reload": {
            "minArgs": 0,
            "maxArgs": 2
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeCSS": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "sendMessage": {
            "minArgs": 2,
            "maxArgs": 3
          },
          "setZoom": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "setZoomSettings": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "update": {
            "minArgs": 1,
            "maxArgs": 2
          }
        },
        "topSites": {
          "get": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "webNavigation": {
          "getAllFrames": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getFrame": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "webRequest": {
          "handlerBehaviorChanged": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "windows": {
          "create": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "get": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getCurrent": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getLastFocused": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "update": {
            "minArgs": 2,
            "maxArgs": 2
          }
        }
      };

      if (Object.keys(apiMetadata).length === 0) {
        throw new Error("api-metadata.json has not been included in browser-polyfill");
      }
      /**
       * A WeakMap subclass which creates and stores a value for any key which does
       * not exist when accessed, but behaves exactly as an ordinary WeakMap
       * otherwise.
       *
       * @param {function} createItem
       *        A function which will be called in order to create the value for any
       *        key which does not exist, the first time it is accessed. The
       *        function receives, as its only argument, the key being created.
       */


      class DefaultWeakMap extends WeakMap {
        constructor(createItem, items = undefined) {
          super(items);
          this.createItem = createItem;
        }

        get(key) {
          if (!this.has(key)) {
            this.set(key, this.createItem(key));
          }

          return super.get(key);
        }

      }
      /**
       * Returns true if the given object is an object with a `then` method, and can
       * therefore be assumed to behave as a Promise.
       *
       * @param {*} value The value to test.
       * @returns {boolean} True if the value is thenable.
       */


      const isThenable = value => {
        return value && typeof value === "object" && typeof value.then === "function";
      };
      /**
       * Creates and returns a function which, when called, will resolve or reject
       * the given promise based on how it is called:
       *
       * - If, when called, `chrome.runtime.lastError` contains a non-null object,
       *   the promise is rejected with that value.
       * - If the function is called with exactly one argument, the promise is
       *   resolved to that value.
       * - Otherwise, the promise is resolved to an array containing all of the
       *   function's arguments.
       *
       * @param {object} promise
       *        An object containing the resolution and rejection functions of a
       *        promise.
       * @param {function} promise.resolve
       *        The promise's resolution function.
       * @param {function} promise.reject
       *        The promise's rejection function.
       * @param {object} metadata
       *        Metadata about the wrapped method which has created the callback.
       * @param {boolean} metadata.singleCallbackArg
       *        Whether or not the promise is resolved with only the first
       *        argument of the callback, alternatively an array of all the
       *        callback arguments is resolved. By default, if the callback
       *        function is invoked with only a single argument, that will be
       *        resolved to the promise, while all arguments will be resolved as
       *        an array if multiple are given.
       *
       * @returns {function}
       *        The generated callback function.
       */


      const makeCallback = (promise, metadata) => {
        return (...callbackArgs) => {
          if (extensionAPIs.runtime.lastError) {
            promise.reject(new Error(extensionAPIs.runtime.lastError.message));
          } else if (metadata.singleCallbackArg || callbackArgs.length <= 1 && metadata.singleCallbackArg !== false) {
            promise.resolve(callbackArgs[0]);
          } else {
            promise.resolve(callbackArgs);
          }
        };
      };

      const pluralizeArguments = numArgs => numArgs == 1 ? "argument" : "arguments";
      /**
       * Creates a wrapper function for a method with the given name and metadata.
       *
       * @param {string} name
       *        The name of the method which is being wrapped.
       * @param {object} metadata
       *        Metadata about the method being wrapped.
       * @param {integer} metadata.minArgs
       *        The minimum number of arguments which must be passed to the
       *        function. If called with fewer than this number of arguments, the
       *        wrapper will raise an exception.
       * @param {integer} metadata.maxArgs
       *        The maximum number of arguments which may be passed to the
       *        function. If called with more than this number of arguments, the
       *        wrapper will raise an exception.
       * @param {boolean} metadata.singleCallbackArg
       *        Whether or not the promise is resolved with only the first
       *        argument of the callback, alternatively an array of all the
       *        callback arguments is resolved. By default, if the callback
       *        function is invoked with only a single argument, that will be
       *        resolved to the promise, while all arguments will be resolved as
       *        an array if multiple are given.
       *
       * @returns {function(object, ...*)}
       *       The generated wrapper function.
       */


      const wrapAsyncFunction = (name, metadata) => {
        return function asyncFunctionWrapper(target, ...args) {
          if (args.length < metadata.minArgs) {
            throw new Error(`Expected at least ${metadata.minArgs} ${pluralizeArguments(metadata.minArgs)} for ${name}(), got ${args.length}`);
          }

          if (args.length > metadata.maxArgs) {
            throw new Error(`Expected at most ${metadata.maxArgs} ${pluralizeArguments(metadata.maxArgs)} for ${name}(), got ${args.length}`);
          }

          return new Promise((resolve, reject) => {
            if (metadata.fallbackToNoCallback) {
              // This API method has currently no callback on Chrome, but it return a promise on Firefox,
              // and so the polyfill will try to call it with a callback first, and it will fallback
              // to not passing the callback if the first call fails.
              try {
                target[name](...args, makeCallback({
                  resolve,
                  reject
                }, metadata));
              } catch (cbError) {
                console.warn(`${name} API method doesn't seem to support the callback parameter, ` + "falling back to call it without a callback: ", cbError);
                target[name](...args); // Update the API method metadata, so that the next API calls will not try to
                // use the unsupported callback anymore.

                metadata.fallbackToNoCallback = false;
                metadata.noCallback = true;
                resolve();
              }
            } else if (metadata.noCallback) {
              target[name](...args);
              resolve();
            } else {
              target[name](...args, makeCallback({
                resolve,
                reject
              }, metadata));
            }
          });
        };
      };
      /**
       * Wraps an existing method of the target object, so that calls to it are
       * intercepted by the given wrapper function. The wrapper function receives,
       * as its first argument, the original `target` object, followed by each of
       * the arguments passed to the original method.
       *
       * @param {object} target
       *        The original target object that the wrapped method belongs to.
       * @param {function} method
       *        The method being wrapped. This is used as the target of the Proxy
       *        object which is created to wrap the method.
       * @param {function} wrapper
       *        The wrapper function which is called in place of a direct invocation
       *        of the wrapped method.
       *
       * @returns {Proxy<function>}
       *        A Proxy object for the given method, which invokes the given wrapper
       *        method in its place.
       */


      const wrapMethod = (target, method, wrapper) => {
        return new Proxy(method, {
          apply(targetMethod, thisObj, args) {
            return wrapper.call(thisObj, target, ...args);
          }

        });
      };

      let hasOwnProperty = Function.call.bind(Object.prototype.hasOwnProperty);
      /**
       * Wraps an object in a Proxy which intercepts and wraps certain methods
       * based on the given `wrappers` and `metadata` objects.
       *
       * @param {object} target
       *        The target object to wrap.
       *
       * @param {object} [wrappers = {}]
       *        An object tree containing wrapper functions for special cases. Any
       *        function present in this object tree is called in place of the
       *        method in the same location in the `target` object tree. These
       *        wrapper methods are invoked as described in {@see wrapMethod}.
       *
       * @param {object} [metadata = {}]
       *        An object tree containing metadata used to automatically generate
       *        Promise-based wrapper functions for asynchronous. Any function in
       *        the `target` object tree which has a corresponding metadata object
       *        in the same location in the `metadata` tree is replaced with an
       *        automatically-generated wrapper function, as described in
       *        {@see wrapAsyncFunction}
       *
       * @returns {Proxy<object>}
       */

      const wrapObject = (target, wrappers = {}, metadata = {}) => {
        let cache = Object.create(null);
        let handlers = {
          has(proxyTarget, prop) {
            return prop in target || prop in cache;
          },

          get(proxyTarget, prop, receiver) {
            if (prop in cache) {
              return cache[prop];
            }

            if (!(prop in target)) {
              return undefined;
            }

            let value = target[prop];

            if (typeof value === "function") {
              // This is a method on the underlying object. Check if we need to do
              // any wrapping.
              if (typeof wrappers[prop] === "function") {
                // We have a special-case wrapper for this method.
                value = wrapMethod(target, target[prop], wrappers[prop]);
              } else if (hasOwnProperty(metadata, prop)) {
                // This is an async method that we have metadata for. Create a
                // Promise wrapper for it.
                let wrapper = wrapAsyncFunction(prop, metadata[prop]);
                value = wrapMethod(target, target[prop], wrapper);
              } else {
                // This is a method that we don't know or care about. Return the
                // original method, bound to the underlying object.
                value = value.bind(target);
              }
            } else if (typeof value === "object" && value !== null && (hasOwnProperty(wrappers, prop) || hasOwnProperty(metadata, prop))) {
              // This is an object that we need to do some wrapping for the children
              // of. Create a sub-object wrapper for it with the appropriate child
              // metadata.
              value = wrapObject(value, wrappers[prop], metadata[prop]);
            } else if (hasOwnProperty(metadata, "*")) {
              // Wrap all properties in * namespace.
              value = wrapObject(value, wrappers[prop], metadata["*"]);
            } else {
              // We don't need to do any wrapping for this property,
              // so just forward all access to the underlying object.
              Object.defineProperty(cache, prop, {
                configurable: true,
                enumerable: true,

                get() {
                  return target[prop];
                },

                set(value) {
                  target[prop] = value;
                }

              });
              return value;
            }

            cache[prop] = value;
            return value;
          },

          set(proxyTarget, prop, value, receiver) {
            if (prop in cache) {
              cache[prop] = value;
            } else {
              target[prop] = value;
            }

            return true;
          },

          defineProperty(proxyTarget, prop, desc) {
            return Reflect.defineProperty(cache, prop, desc);
          },

          deleteProperty(proxyTarget, prop) {
            return Reflect.deleteProperty(cache, prop);
          }

        }; // Per contract of the Proxy API, the "get" proxy handler must return the
        // original value of the target if that value is declared read-only and
        // non-configurable. For this reason, we create an object with the
        // prototype set to `target` instead of using `target` directly.
        // Otherwise we cannot return a custom object for APIs that
        // are declared read-only and non-configurable, such as `chrome.devtools`.
        //
        // The proxy handlers themselves will still use the original `target`
        // instead of the `proxyTarget`, so that the methods and properties are
        // dereferenced via the original targets.

        let proxyTarget = Object.create(target);
        return new Proxy(proxyTarget, handlers);
      };
      /**
       * Creates a set of wrapper functions for an event object, which handles
       * wrapping of listener functions that those messages are passed.
       *
       * A single wrapper is created for each listener function, and stored in a
       * map. Subsequent calls to `addListener`, `hasListener`, or `removeListener`
       * retrieve the original wrapper, so that  attempts to remove a
       * previously-added listener work as expected.
       *
       * @param {DefaultWeakMap<function, function>} wrapperMap
       *        A DefaultWeakMap object which will create the appropriate wrapper
       *        for a given listener function when one does not exist, and retrieve
       *        an existing one when it does.
       *
       * @returns {object}
       */


      const wrapEvent = wrapperMap => ({
        addListener(target, listener, ...args) {
          target.addListener(wrapperMap.get(listener), ...args);
        },

        hasListener(target, listener) {
          return target.hasListener(wrapperMap.get(listener));
        },

        removeListener(target, listener) {
          target.removeListener(wrapperMap.get(listener));
        }

      });

      const onRequestFinishedWrappers = new DefaultWeakMap(listener => {
        if (typeof listener !== "function") {
          return listener;
        }
        /**
         * Wraps an onRequestFinished listener function so that it will return a
         * `getContent()` property which returns a `Promise` rather than using a
         * callback API.
         *
         * @param {object} req
         *        The HAR entry object representing the network request.
         */


        return function onRequestFinished(req) {
          const wrappedReq = wrapObject(req, {}
          /* wrappers */
          , {
            getContent: {
              minArgs: 0,
              maxArgs: 0
            }
          });
          listener(wrappedReq);
        };
      });
      const onMessageWrappers = new DefaultWeakMap(listener => {
        if (typeof listener !== "function") {
          return listener;
        }
        /**
         * Wraps a message listener function so that it may send responses based on
         * its return value, rather than by returning a sentinel value and calling a
         * callback. If the listener function returns a Promise, the response is
         * sent when the promise either resolves or rejects.
         *
         * @param {*} message
         *        The message sent by the other end of the channel.
         * @param {object} sender
         *        Details about the sender of the message.
         * @param {function(*)} sendResponse
         *        A callback which, when called with an arbitrary argument, sends
         *        that value as a response.
         * @returns {boolean}
         *        True if the wrapped listener returned a Promise, which will later
         *        yield a response. False otherwise.
         */


        return function onMessage(message, sender, sendResponse) {
          let didCallSendResponse = false;
          let wrappedSendResponse;
          let sendResponsePromise = new Promise(resolve => {
            wrappedSendResponse = function (response) {
              didCallSendResponse = true;
              resolve(response);
            };
          });
          let result;

          try {
            result = listener(message, sender, wrappedSendResponse);
          } catch (err) {
            result = Promise.reject(err);
          }

          const isResultThenable = result !== true && isThenable(result); // If the listener didn't returned true or a Promise, or called
          // wrappedSendResponse synchronously, we can exit earlier
          // because there will be no response sent from this listener.

          if (result !== true && !isResultThenable && !didCallSendResponse) {
            return false;
          } // A small helper to send the message if the promise resolves
          // and an error if the promise rejects (a wrapped sendMessage has
          // to translate the message into a resolved promise or a rejected
          // promise).


          const sendPromisedResult = promise => {
            promise.then(msg => {
              // send the message value.
              sendResponse(msg);
            }, error => {
              // Send a JSON representation of the error if the rejected value
              // is an instance of error, or the object itself otherwise.
              let message;

              if (error && (error instanceof Error || typeof error.message === "string")) {
                message = error.message;
              } else {
                message = "An unexpected error occurred";
              }

              sendResponse({
                __mozWebExtensionPolyfillReject__: true,
                message
              });
            }).catch(err => {
              // Print an error on the console if unable to send the response.
              console.error("Failed to send onMessage rejected reply", err);
            });
          }; // If the listener returned a Promise, send the resolved value as a
          // result, otherwise wait the promise related to the wrappedSendResponse
          // callback to resolve and send it as a response.


          if (isResultThenable) {
            sendPromisedResult(result);
          } else {
            sendPromisedResult(sendResponsePromise);
          } // Let Chrome know that the listener is replying.


          return true;
        };
      });

      const wrappedSendMessageCallback = ({
        reject,
        resolve
      }, reply) => {
        if (extensionAPIs.runtime.lastError) {
          // Detect when none of the listeners replied to the sendMessage call and resolve
          // the promise to undefined as in Firefox.
          // See https://github.com/mozilla/webextension-polyfill/issues/130
          if (extensionAPIs.runtime.lastError.message === CHROME_SEND_MESSAGE_CALLBACK_NO_RESPONSE_MESSAGE) {
            resolve();
          } else {
            reject(new Error(extensionAPIs.runtime.lastError.message));
          }
        } else if (reply && reply.__mozWebExtensionPolyfillReject__) {
          // Convert back the JSON representation of the error into
          // an Error instance.
          reject(new Error(reply.message));
        } else {
          resolve(reply);
        }
      };

      const wrappedSendMessage = (name, metadata, apiNamespaceObj, ...args) => {
        if (args.length < metadata.minArgs) {
          throw new Error(`Expected at least ${metadata.minArgs} ${pluralizeArguments(metadata.minArgs)} for ${name}(), got ${args.length}`);
        }

        if (args.length > metadata.maxArgs) {
          throw new Error(`Expected at most ${metadata.maxArgs} ${pluralizeArguments(metadata.maxArgs)} for ${name}(), got ${args.length}`);
        }

        return new Promise((resolve, reject) => {
          const wrappedCb = wrappedSendMessageCallback.bind(null, {
            resolve,
            reject
          });
          args.push(wrappedCb);
          apiNamespaceObj.sendMessage(...args);
        });
      };

      const staticWrappers = {
        devtools: {
          network: {
            onRequestFinished: wrapEvent(onRequestFinishedWrappers)
          }
        },
        runtime: {
          onMessage: wrapEvent(onMessageWrappers),
          onMessageExternal: wrapEvent(onMessageWrappers),
          sendMessage: wrappedSendMessage.bind(null, "sendMessage", {
            minArgs: 1,
            maxArgs: 3
          })
        },
        tabs: {
          sendMessage: wrappedSendMessage.bind(null, "sendMessage", {
            minArgs: 2,
            maxArgs: 3
          })
        }
      };
      const settingMetadata = {
        clear: {
          minArgs: 1,
          maxArgs: 1
        },
        get: {
          minArgs: 1,
          maxArgs: 1
        },
        set: {
          minArgs: 1,
          maxArgs: 1
        }
      };
      apiMetadata.privacy = {
        network: {
          "*": settingMetadata
        },
        services: {
          "*": settingMetadata
        },
        websites: {
          "*": settingMetadata
        }
      };
      return wrapObject(extensionAPIs, staticWrappers, apiMetadata);
    }; // The build process adds a UMD wrapper around this file, which makes the
    // `module` variable available.


    module.exports = wrapAPIs(chrome);
  } else {
    module.exports = globalThis.browser;
  }
});
//# sourceMappingURL=browser-polyfill.js.map


/***/ }

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
/******/ var __webpack_exports__ = (__webpack_exec__(120));
/******/ }
]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LE1BQU0scURBQXFEO0FBQzNEO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsTUFBTSxnRUFBZ0U7QUFDdEU7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsTUFBTSx1RUFBdUU7QUFDN0U7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLE1BQU0sd0VBQXdFO0FBQzlFO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxNQUFNLDBFQUEwRTtBQUNoRjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLE1BQU0sOENBQThDO0FBQ3BELE1BQU0sMkNBQTJDO0FBQ2pEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFD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QUVBO0FBQ0Esd0hBQXdIO0FBQ3hIO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUIsVUFBVTtBQUMzQjtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUIsR0FBRztBQUNwQixtQkFBbUIsU0FBUztBQUM1Qjs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQixRQUFRO0FBQ3pCO0FBQ0E7QUFDQSxpQkFBaUIsVUFBVTtBQUMzQjtBQUNBLGlCQUFpQixVQUFVO0FBQzNCO0FBQ0EsaUJBQWlCLFFBQVE7QUFDekI7QUFDQSxpQkFBaUIsU0FBUztBQUMxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQjtBQUNuQjtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQixRQUFRO0FBQ3pCO0FBQ0EsaUJBQWlCLFFBQVE7QUFDekI7QUFDQSxpQkFBaUIsU0FBUztBQUMxQjtBQUNBO0FBQ0E7QUFDQSxpQkFBaUIsU0FBUztBQUMxQjtBQUNBO0FBQ0E7QUFDQSxpQkFBaUIsU0FBUztBQUMxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQjtBQUNuQjtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQSxpREFBaUQsa0JBQWtCLEVBQUUsc0NBQXNDLE1BQU0sS0FBSyxVQUFVLFlBQVk7QUFDNUk7O0FBRUE7QUFDQSxnREFBZ0Qsa0JBQWtCLEVBQUUsc0NBQXNDLE1BQU0sS0FBSyxVQUFVLFlBQVk7QUFDM0k7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCLGdCQUFnQjtBQUNoQixnQ0FBZ0MsTUFBTTtBQUN0Qyx1Q0FBdUM7QUFDdkM7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQSxlQUFlO0FBQ2Y7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQixRQUFRO0FBQ3pCO0FBQ0EsaUJBQWlCLFVBQVU7QUFDM0I7QUFDQTtBQUNBLGlCQUFpQixVQUFVO0FBQzNCO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQjtBQUNuQjtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBUztBQUNUOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUIsUUFBUTtBQUN6QjtBQUNBO0FBQ0EsaUJBQWlCLFFBQVEsY0FBYztBQUN2QztBQUNBO0FBQ0E7QUFDQSw2REFBNkQsZ0JBQWdCO0FBQzdFO0FBQ0EsaUJBQWlCLFFBQVEsY0FBYztBQUN2QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0EsbUJBQW1CO0FBQ25COztBQUVBLCtDQUErQyxlQUFlO0FBQzlEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVzs7QUFFWDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsaUJBQWlCOztBQUVqQjtBQUNBO0FBQ0E7O0FBRUEsZUFBZTtBQUNmO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFdBQVc7O0FBRVg7QUFDQTtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7O0FBRUE7QUFDQSxXQUFXOztBQUVYO0FBQ0E7QUFDQSxXQUFXOztBQUVYO0FBQ0E7QUFDQTs7QUFFQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQixvQ0FBb0M7QUFDckQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUI7QUFDbkI7OztBQUdBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTtBQUNBOztBQUVBLE9BQU87O0FBRVA7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLFFBQVE7QUFDM0I7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLEdBQUc7QUFDdEI7QUFDQSxtQkFBbUIsUUFBUTtBQUMzQjtBQUNBLG1CQUFtQixhQUFhO0FBQ2hDO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYOztBQUVBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTs7QUFFQSwwRUFBMEU7QUFDMUU7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxnQkFBZ0I7QUFDaEI7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxlQUFlO0FBQ2YsYUFBYTtBQUNiO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsYUFBYTtBQUNiO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQSxZQUFZOzs7QUFHWjtBQUNBO0FBQ0EsT0FBTzs7QUFFUDtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsK0NBQStDLGtCQUFrQixFQUFFLHNDQUFzQyxNQUFNLEtBQUssVUFBVSxZQUFZO0FBQzFJOztBQUVBO0FBQ0EsOENBQThDLGtCQUFrQixFQUFFLHNDQUFzQyxNQUFNLEtBQUssVUFBVSxZQUFZO0FBQ3pJOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1gsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7OztBQUdBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQSxDQUFDO0FBQ0QiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9yZWFjdC1kb21AMTguMy4xX3JlYWN0QDE4LjMuMS9ub2RlX21vZHVsZXMvcmVhY3QtZG9tL2NsaWVudC5qcyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9yZWFjdEAxOC4zLjEvbm9kZV9tb2R1bGVzL3JlYWN0L2Nqcy9yZWFjdC1qc3gtcnVudGltZS5wcm9kdWN0aW9uLm1pbi5qcyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9yZWFjdEAxOC4zLjEvbm9kZV9tb2R1bGVzL3JlYWN0L2pzeC1ydW50aW1lLmpzIiwid2VicGFjazovL0BzbG90aGluZy9leHRlbnNpb24vLi4vLi4vcGFja2FnZXMvc2hhcmVkL3NyYy9mb3JtYXR0ZXJzL2luZGV4LnRzIiwid2VicGFjazovL0BzbG90aGluZy9leHRlbnNpb24vLi4vLi4vcGFja2FnZXMvc2hhcmVkL3NyYy9zY29yaW5nL2NvbnN0YW50cy50cyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4uLy4uL3BhY2thZ2VzL3NoYXJlZC9zcmMvc2NvcmluZy90ZXh0LnRzIiwid2VicGFjazovL0BzbG90aGluZy9leHRlbnNpb24vLi4vLi4vcGFja2FnZXMvc2hhcmVkL3NyYy9zY29yaW5nL2FjdGlvbi12ZXJicy50cyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4uLy4uL3BhY2thZ2VzL3NoYXJlZC9zcmMvc2NvcmluZy9hdHMtY2hhcmFjdGVycy50cyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4uLy4uL3BhY2thZ2VzL3NoYXJlZC9zcmMvc2NvcmluZy9hdHMtZnJpZW5kbGluZXNzLnRzIiwid2VicGFjazovL0BzbG90aGluZy9leHRlbnNpb24vLi4vLi4vcGFja2FnZXMvc2hhcmVkL3NyYy9zY29yaW5nL3N5bm9ueW1zLnRzIiwid2VicGFjazovL0BzbG90aGluZy9leHRlbnNpb24vLi4vLi4vcGFja2FnZXMvc2hhcmVkL3NyYy9zY29yaW5nL2tleXdvcmQtbWF0Y2gudHMiLCJ3ZWJwYWNrOi8vQHNsb3RoaW5nL2V4dGVuc2lvbi8uLi8uLi9wYWNrYWdlcy9zaGFyZWQvc3JjL3Njb3JpbmcvbGVuZ3RoLnRzIiwid2VicGFjazovL0BzbG90aGluZy9leHRlbnNpb24vLi4vLi4vcGFja2FnZXMvc2hhcmVkL3NyYy9zY29yaW5nL3F1YW50aWZpZWQtYWNoaWV2ZW1lbnRzLnRzIiwid2VicGFjazovL0BzbG90aGluZy9leHRlbnNpb24vLi4vLi4vcGFja2FnZXMvc2hhcmVkL3NyYy9zY29yaW5nL3NlY3Rpb24tY29tcGxldGVuZXNzLnRzIiwid2VicGFjazovL0BzbG90aGluZy9leHRlbnNpb24vLi4vLi4vcGFja2FnZXMvc2hhcmVkL3NyYy9zY29yaW5nL3NwZWxsaW5nLWdyYW1tYXIudHMiLCJ3ZWJwYWNrOi8vQHNsb3RoaW5nL2V4dGVuc2lvbi8uLi8uLi9wYWNrYWdlcy9zaGFyZWQvc3JjL3Njb3JpbmcvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vQHNsb3RoaW5nL2V4dGVuc2lvbi8uL3NyYy9wb3B1cC9kZWVwLWxpbmtzLnRzIiwid2VicGFjazovL0BzbG90aGluZy9leHRlbnNpb24vLi9zcmMvcG9wdXAvQnVsa1NvdXJjZUNhcmQudHN4Iiwid2VicGFjazovL0BzbG90aGluZy9leHRlbnNpb24vLi9zcmMvcG9wdXAvQXBwLnRzeCIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4vc3JjL3BvcHVwL2luZGV4LnRzeCIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4vc3JjL3NoYXJlZC9lcnJvci1tZXNzYWdlcy50cyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4vc3JjL3NoYXJlZC9tZXNzYWdlcy50cyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4vc3JjL3NoYXJlZC90eXBlcy50cyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS93ZWJleHRlbnNpb24tcG9seWZpbGxAMC4xMC4wL25vZGVfbW9kdWxlcy93ZWJleHRlbnNpb24tcG9seWZpbGwvZGlzdC9icm93c2VyLXBvbHlmaWxsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxudmFyIG0gPSByZXF1aXJlKCdyZWFjdC1kb20nKTtcbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nKSB7XG4gIGV4cG9ydHMuY3JlYXRlUm9vdCA9IG0uY3JlYXRlUm9vdDtcbiAgZXhwb3J0cy5oeWRyYXRlUm9vdCA9IG0uaHlkcmF0ZVJvb3Q7XG59IGVsc2Uge1xuICB2YXIgaSA9IG0uX19TRUNSRVRfSU5URVJOQUxTX0RPX05PVF9VU0VfT1JfWU9VX1dJTExfQkVfRklSRUQ7XG4gIGV4cG9ydHMuY3JlYXRlUm9vdCA9IGZ1bmN0aW9uKGMsIG8pIHtcbiAgICBpLnVzaW5nQ2xpZW50RW50cnlQb2ludCA9IHRydWU7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBtLmNyZWF0ZVJvb3QoYywgbyk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGkudXNpbmdDbGllbnRFbnRyeVBvaW50ID0gZmFsc2U7XG4gICAgfVxuICB9O1xuICBleHBvcnRzLmh5ZHJhdGVSb290ID0gZnVuY3Rpb24oYywgaCwgbykge1xuICAgIGkudXNpbmdDbGllbnRFbnRyeVBvaW50ID0gdHJ1ZTtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIG0uaHlkcmF0ZVJvb3QoYywgaCwgbyk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGkudXNpbmdDbGllbnRFbnRyeVBvaW50ID0gZmFsc2U7XG4gICAgfVxuICB9O1xufVxuIiwiLyoqXG4gKiBAbGljZW5zZSBSZWFjdFxuICogcmVhY3QtanN4LXJ1bnRpbWUucHJvZHVjdGlvbi5taW4uanNcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIEZhY2Vib29rLCBJbmMuIGFuZCBpdHMgYWZmaWxpYXRlcy5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuJ3VzZSBzdHJpY3QnO3ZhciBmPXJlcXVpcmUoXCJyZWFjdFwiKSxrPVN5bWJvbC5mb3IoXCJyZWFjdC5lbGVtZW50XCIpLGw9U3ltYm9sLmZvcihcInJlYWN0LmZyYWdtZW50XCIpLG09T2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSxuPWYuX19TRUNSRVRfSU5URVJOQUxTX0RPX05PVF9VU0VfT1JfWU9VX1dJTExfQkVfRklSRUQuUmVhY3RDdXJyZW50T3duZXIscD17a2V5OiEwLHJlZjohMCxfX3NlbGY6ITAsX19zb3VyY2U6ITB9O1xuZnVuY3Rpb24gcShjLGEsZyl7dmFyIGIsZD17fSxlPW51bGwsaD1udWxsO3ZvaWQgMCE9PWcmJihlPVwiXCIrZyk7dm9pZCAwIT09YS5rZXkmJihlPVwiXCIrYS5rZXkpO3ZvaWQgMCE9PWEucmVmJiYoaD1hLnJlZik7Zm9yKGIgaW4gYSltLmNhbGwoYSxiKSYmIXAuaGFzT3duUHJvcGVydHkoYikmJihkW2JdPWFbYl0pO2lmKGMmJmMuZGVmYXVsdFByb3BzKWZvcihiIGluIGE9Yy5kZWZhdWx0UHJvcHMsYSl2b2lkIDA9PT1kW2JdJiYoZFtiXT1hW2JdKTtyZXR1cm57JCR0eXBlb2Y6ayx0eXBlOmMsa2V5OmUscmVmOmgscHJvcHM6ZCxfb3duZXI6bi5jdXJyZW50fX1leHBvcnRzLkZyYWdtZW50PWw7ZXhwb3J0cy5qc3g9cTtleHBvcnRzLmpzeHM9cTtcbiIsIid1c2Ugc3RyaWN0JztcblxuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAncHJvZHVjdGlvbicpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2Nqcy9yZWFjdC1qc3gtcnVudGltZS5wcm9kdWN0aW9uLm1pbi5qcycpO1xufSBlbHNlIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2Nqcy9yZWFjdC1qc3gtcnVudGltZS5kZXZlbG9wbWVudC5qcycpO1xufVxuIiwiZXhwb3J0IGNvbnN0IERFRkFVTFRfTE9DQUxFID0gXCJlbi1VU1wiO1xuY29uc3QgTlVNRVJJQ19QQVJUU19MT0NBTEUgPSBgJHtERUZBVUxUX0xPQ0FMRX0tdS1udS1sYXRuYDtcbmV4cG9ydCBjb25zdCBMT0NBTEVfQ09PS0lFX05BTUUgPSBcInRhaWRhX2xvY2FsZVwiO1xuZXhwb3J0IGNvbnN0IExPQ0FMRV9DSEFOR0VfRVZFTlQgPSBcInRhaWRhOmxvY2FsZS1jaGFuZ2VcIjtcbmV4cG9ydCBjb25zdCBTVVBQT1JURURfTE9DQUxFUyA9IFtcbiAgICB7IHZhbHVlOiBcImVuLVVTXCIsIGxhYmVsOiBcIkVuZ2xpc2ggKFVTKVwiIH0sXG4gICAgeyB2YWx1ZTogXCJlbi1DQVwiLCBsYWJlbDogXCJFbmdsaXNoIChDQSlcIiB9LFxuICAgIHsgdmFsdWU6IFwiZW4tR0JcIiwgbGFiZWw6IFwiRW5nbGlzaCAoVUspXCIgfSxcbiAgICB7IHZhbHVlOiBcImZyXCIsIGxhYmVsOiBcIkZyZW5jaFwiIH0sXG4gICAgeyB2YWx1ZTogXCJlc1wiLCBsYWJlbDogXCJTcGFuaXNoXCIgfSxcbiAgICB7IHZhbHVlOiBcImRlXCIsIGxhYmVsOiBcIkdlcm1hblwiIH0sXG4gICAgeyB2YWx1ZTogXCJqYVwiLCBsYWJlbDogXCJKYXBhbmVzZVwiIH0sXG4gICAgeyB2YWx1ZTogXCJ6aC1DTlwiLCBsYWJlbDogXCJDaGluZXNlIChTaW1wbGlmaWVkKVwiIH0sXG4gICAgeyB2YWx1ZTogXCJwdFwiLCBsYWJlbDogXCJQb3J0dWd1ZXNlXCIgfSxcbiAgICB7IHZhbHVlOiBcInB0LUJSXCIsIGxhYmVsOiBcIlBvcnR1Z3Vlc2UgKEJyYXppbClcIiB9LFxuICAgIHsgdmFsdWU6IFwiaGlcIiwgbGFiZWw6IFwiSGluZGlcIiB9LFxuICAgIHsgdmFsdWU6IFwia29cIiwgbGFiZWw6IFwiS29yZWFuXCIgfSxcbl07XG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplTG9jYWxlKGxvY2FsZSkge1xuICAgIGlmICghbG9jYWxlKVxuICAgICAgICByZXR1cm4gREVGQVVMVF9MT0NBTEU7XG4gICAgY29uc3Qgc3VwcG9ydGVkID0gU1VQUE9SVEVEX0xPQ0FMRVMuZmluZCgoY2FuZGlkYXRlKSA9PiBjYW5kaWRhdGUudmFsdWUudG9Mb3dlckNhc2UoKSA9PT0gbG9jYWxlLnRvTG93ZXJDYXNlKCkgfHxcbiAgICAgICAgY2FuZGlkYXRlLnZhbHVlLnNwbGl0KFwiLVwiKVswXS50b0xvd2VyQ2FzZSgpID09PSBsb2NhbGUudG9Mb3dlckNhc2UoKSk7XG4gICAgcmV0dXJuIHN1cHBvcnRlZD8udmFsdWUgPz8gREVGQVVMVF9MT0NBTEU7XG59XG5leHBvcnQgZnVuY3Rpb24gbm93SXNvKCkge1xuICAgIHJldHVybiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG59XG5leHBvcnQgZnVuY3Rpb24gbm93RGF0ZSgpIHtcbiAgICByZXR1cm4gbmV3IERhdGUoKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBub3dFcG9jaCgpIHtcbiAgICByZXR1cm4gRGF0ZS5ub3coKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVRvRGF0ZSh2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBcIlwiKVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICBjb25zdCBkYXRlID0gdmFsdWUgaW5zdGFuY2VvZiBEYXRlID8gbmV3IERhdGUodmFsdWUuZ2V0VGltZSgpKSA6IG5ldyBEYXRlKHZhbHVlKTtcbiAgICByZXR1cm4gTnVtYmVyLmlzTmFOKGRhdGUuZ2V0VGltZSgpKSA/IG51bGwgOiBkYXRlO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHRvSXNvKHZhbHVlKSB7XG4gICAgY29uc3QgZGF0ZSA9IHBhcnNlVG9EYXRlKHZhbHVlKTtcbiAgICBpZiAoIWRhdGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkV4cGVjdGVkIGEgdmFsaWQgZGF0ZSB2YWx1ZVwiKTtcbiAgICB9XG4gICAgcmV0dXJuIGRhdGUudG9JU09TdHJpbmcoKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiB0b051bGxhYmxlSXNvKHZhbHVlKSB7XG4gICAgcmV0dXJuIHBhcnNlVG9EYXRlKHZhbHVlKT8udG9JU09TdHJpbmcoKSA/PyBudWxsO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHRvRXBvY2godmFsdWUpIHtcbiAgICBjb25zdCBkYXRlID0gcGFyc2VUb0RhdGUodmFsdWUpO1xuICAgIGlmICghZGF0ZSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRXhwZWN0ZWQgYSB2YWxpZCBkYXRlIHZhbHVlXCIpO1xuICAgIH1cbiAgICByZXR1cm4gZGF0ZS5nZXRUaW1lKCk7XG59XG5leHBvcnQgZnVuY3Rpb24gdG9OdWxsYWJsZUVwb2NoKHZhbHVlKSB7XG4gICAgcmV0dXJuIHBhcnNlVG9EYXRlKHZhbHVlKT8uZ2V0VGltZSgpID8/IG51bGw7XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0VXNlclRpbWV6b25lKCkge1xuICAgIGlmICh0eXBlb2YgSW50bCA9PT0gXCJ1bmRlZmluZWRcIilcbiAgICAgICAgcmV0dXJuIFwiVVRDXCI7XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIEludGwuRGF0ZVRpbWVGb3JtYXQoKS5yZXNvbHZlZE9wdGlvbnMoKS50aW1lWm9uZSB8fCBcIlVUQ1wiO1xuICAgIH1cbiAgICBjYXRjaCB7XG4gICAgICAgIHJldHVybiBcIlVUQ1wiO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGdldERpc3BsYXlUaW1lem9uZSh0aW1lWm9uZSkge1xuICAgIGlmICh0aW1lWm9uZSlcbiAgICAgICAgcmV0dXJuIHRpbWVab25lO1xuICAgIHJldHVybiB0eXBlb2Ygd2luZG93ID09PSBcInVuZGVmaW5lZFwiID8gXCJVVENcIiA6IGdldFVzZXJUaW1lem9uZSgpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdEFic29sdXRlKHZhbHVlLCBvcHRzID0ge30pIHtcbiAgICBjb25zdCBkYXRlID0gcGFyc2VUb0RhdGUodmFsdWUpO1xuICAgIGlmICghZGF0ZSlcbiAgICAgICAgcmV0dXJuIFwiVW5rbm93biBkYXRlXCI7XG4gICAgY29uc3QgaW5jbHVkZVRpbWUgPSBvcHRzLmluY2x1ZGVUaW1lID8/IHRydWU7XG4gICAgY29uc3QgZm9ybWF0dGVyID0gbmV3IEludGwuRGF0ZVRpbWVGb3JtYXQobm9ybWFsaXplTG9jYWxlKG9wdHMubG9jYWxlKSwge1xuICAgICAgICBtb250aDogXCJzaG9ydFwiLFxuICAgICAgICBkYXk6IFwibnVtZXJpY1wiLFxuICAgICAgICB5ZWFyOiBcIm51bWVyaWNcIixcbiAgICAgICAgLi4uKGluY2x1ZGVUaW1lID8geyBob3VyOiBcIm51bWVyaWNcIiwgbWludXRlOiBcIjItZGlnaXRcIiB9IDoge30pLFxuICAgICAgICB0aW1lWm9uZTogZ2V0RGlzcGxheVRpbWV6b25lKG9wdHMudGltZVpvbmUpLFxuICAgIH0pO1xuICAgIGNvbnN0IGZvcm1hdHRlZCA9IGZvcm1hdHRlci5mb3JtYXQoZGF0ZSk7XG4gICAgaWYgKCFpbmNsdWRlVGltZSlcbiAgICAgICAgcmV0dXJuIGZvcm1hdHRlZDtcbiAgICBjb25zdCBsYXN0Q29tbWEgPSBmb3JtYXR0ZWQubGFzdEluZGV4T2YoXCIsXCIpO1xuICAgIGlmIChsYXN0Q29tbWEgPT09IC0xKVxuICAgICAgICByZXR1cm4gZm9ybWF0dGVkO1xuICAgIHJldHVybiBgJHtmb3JtYXR0ZWQuc2xpY2UoMCwgbGFzdENvbW1hKX0gwrcgJHtmb3JtYXR0ZWRcbiAgICAgICAgLnNsaWNlKGxhc3RDb21tYSArIDEpXG4gICAgICAgIC50cmltKCl9YDtcbn1cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRSZWxhdGl2ZSh2YWx1ZSwgb3B0cyA9IHt9KSB7XG4gICAgY29uc3QgZGF0ZSA9IHBhcnNlVG9EYXRlKHZhbHVlKTtcbiAgICBjb25zdCBjdXJyZW50ID0gcGFyc2VUb0RhdGUob3B0cy5ub3cgPz8gbm93SXNvKCkpO1xuICAgIGlmICghZGF0ZSB8fCAhY3VycmVudCkge1xuICAgICAgICByZXR1cm4gXCJVbmtub3duIGRhdGVcIjtcbiAgICB9XG4gICAgY29uc3QgZGlmZk1zID0gY3VycmVudC5nZXRUaW1lKCkgLSBkYXRlLmdldFRpbWUoKTtcbiAgICBjb25zdCBhYnNNcyA9IE1hdGguYWJzKGRpZmZNcyk7XG4gICAgY29uc3QgaXNGdXR1cmUgPSBkaWZmTXMgPCAwO1xuICAgIGNvbnN0IG1pbnV0ZSA9IDYwICogMTAwMDtcbiAgICBjb25zdCBob3VyID0gNjAgKiBtaW51dGU7XG4gICAgY29uc3QgZGF5ID0gMjQgKiBob3VyO1xuICAgIGNvbnN0IHdlZWsgPSA3ICogZGF5O1xuICAgIGNvbnN0IG1vbnRoID0gMzAgKiBkYXk7XG4gICAgY29uc3QgeWVhciA9IDM2NSAqIGRheTtcbiAgICBpZiAoYWJzTXMgPCBtaW51dGUpXG4gICAgICAgIHJldHVybiBcIkp1c3Qgbm93XCI7XG4gICAgaWYgKGFic01zIDwgaG91cilcbiAgICAgICAgcmV0dXJuIGZvcm1hdFJlbGF0aXZlQnVja2V0KE1hdGguZmxvb3IoYWJzTXMgLyBtaW51dGUpLCBcIm1cIiwgaXNGdXR1cmUpO1xuICAgIGlmIChhYnNNcyA8IGRheSlcbiAgICAgICAgcmV0dXJuIGZvcm1hdFJlbGF0aXZlQnVja2V0KE1hdGguZmxvb3IoYWJzTXMgLyBob3VyKSwgXCJoXCIsIGlzRnV0dXJlKTtcbiAgICBpZiAoYWJzTXMgPCAyICogZGF5KVxuICAgICAgICByZXR1cm4gaXNGdXR1cmUgPyBcIlRvbW9ycm93XCIgOiBcIlllc3RlcmRheVwiO1xuICAgIGlmIChhYnNNcyA8IHdlZWspXG4gICAgICAgIHJldHVybiBmb3JtYXRSZWxhdGl2ZUJ1Y2tldChNYXRoLmZsb29yKGFic01zIC8gZGF5KSwgXCJkXCIsIGlzRnV0dXJlKTtcbiAgICBpZiAoYWJzTXMgPCBtb250aClcbiAgICAgICAgcmV0dXJuIGZvcm1hdFJlbGF0aXZlQnVja2V0KE1hdGguZmxvb3IoYWJzTXMgLyB3ZWVrKSwgXCJ3XCIsIGlzRnV0dXJlKTtcbiAgICBpZiAoYWJzTXMgPCB5ZWFyKVxuICAgICAgICByZXR1cm4gZm9ybWF0UmVsYXRpdmVCdWNrZXQoTWF0aC5mbG9vcihhYnNNcyAvIG1vbnRoKSwgXCJtb1wiLCBpc0Z1dHVyZSk7XG4gICAgcmV0dXJuIGZvcm1hdFJlbGF0aXZlQnVja2V0KE1hdGguZmxvb3IoYWJzTXMgLyB5ZWFyKSwgXCJ5XCIsIGlzRnV0dXJlKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXREYXRlT25seSh2YWx1ZSwgb3B0cyA9IHt9KSB7XG4gICAgY29uc3QgZGF0ZSA9IHBhcnNlVG9EYXRlKHZhbHVlKTtcbiAgICBpZiAoIWRhdGUpXG4gICAgICAgIHJldHVybiBcIlVua25vd24gZGF0ZVwiO1xuICAgIHJldHVybiBuZXcgSW50bC5EYXRlVGltZUZvcm1hdChub3JtYWxpemVMb2NhbGUob3B0cy5sb2NhbGUpLCB7XG4gICAgICAgIG1vbnRoOiBcInNob3J0XCIsXG4gICAgICAgIGRheTogXCJudW1lcmljXCIsXG4gICAgICAgIHllYXI6IFwibnVtZXJpY1wiLFxuICAgICAgICB0aW1lWm9uZTogZ2V0RGlzcGxheVRpbWV6b25lKG9wdHMudGltZVpvbmUpLFxuICAgIH0pLmZvcm1hdChkYXRlKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRUaW1lT25seSh2YWx1ZSwgb3B0cyA9IHt9KSB7XG4gICAgY29uc3QgZGF0ZSA9IHBhcnNlVG9EYXRlKHZhbHVlKTtcbiAgICBpZiAoIWRhdGUpXG4gICAgICAgIHJldHVybiBcIlVua25vd24gdGltZVwiO1xuICAgIHJldHVybiBuZXcgSW50bC5EYXRlVGltZUZvcm1hdChub3JtYWxpemVMb2NhbGUob3B0cy5sb2NhbGUpLCB7XG4gICAgICAgIGhvdXI6IFwibnVtZXJpY1wiLFxuICAgICAgICBtaW51dGU6IFwiMi1kaWdpdFwiLFxuICAgICAgICB0aW1lWm9uZTogZ2V0RGlzcGxheVRpbWV6b25lKG9wdHMudGltZVpvbmUpLFxuICAgIH0pLmZvcm1hdChkYXRlKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRJc29EYXRlT25seSh2YWx1ZSA9IG5vd0lzbygpKSB7XG4gICAgcmV0dXJuIHRvSXNvKHBhcnNlVG9EYXRlKHZhbHVlKSA/PyBub3dJc28oKSkuc2xpY2UoMCwgMTApO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdE1vbnRoWWVhcih2YWx1ZSwgb3B0cyA9IHt9KSB7XG4gICAgY29uc3QgZGF0ZSA9IHBhcnNlVG9EYXRlKHZhbHVlKTtcbiAgICBpZiAoIWRhdGUpXG4gICAgICAgIHJldHVybiBcIlwiO1xuICAgIHJldHVybiBuZXcgSW50bC5EYXRlVGltZUZvcm1hdChub3JtYWxpemVMb2NhbGUob3B0cy5sb2NhbGUpLCB7XG4gICAgICAgIG1vbnRoOiBcInNob3J0XCIsXG4gICAgICAgIHllYXI6IFwibnVtZXJpY1wiLFxuICAgICAgICB0aW1lWm9uZTogZ2V0RGlzcGxheVRpbWV6b25lKG9wdHMudGltZVpvbmUpLFxuICAgIH0pLmZvcm1hdChkYXRlKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBpc1Bhc3QodmFsdWUsIG5vdyA9IG5vd0lzbygpKSB7XG4gICAgY29uc3QgZGF0ZSA9IHBhcnNlVG9EYXRlKHZhbHVlKTtcbiAgICBjb25zdCBjdXJyZW50ID0gcGFyc2VUb0RhdGUobm93KTtcbiAgICByZXR1cm4gQm9vbGVhbihkYXRlICYmIGN1cnJlbnQgJiYgZGF0ZS5nZXRUaW1lKCkgPCBjdXJyZW50LmdldFRpbWUoKSk7XG59XG5leHBvcnQgZnVuY3Rpb24gaXNGdXR1cmUodmFsdWUsIG5vdyA9IG5vd0lzbygpKSB7XG4gICAgY29uc3QgZGF0ZSA9IHBhcnNlVG9EYXRlKHZhbHVlKTtcbiAgICBjb25zdCBjdXJyZW50ID0gcGFyc2VUb0RhdGUobm93KTtcbiAgICByZXR1cm4gQm9vbGVhbihkYXRlICYmIGN1cnJlbnQgJiYgZGF0ZS5nZXRUaW1lKCkgPiBjdXJyZW50LmdldFRpbWUoKSk7XG59XG5leHBvcnQgZnVuY3Rpb24gZGlmZlNlY29uZHMoYSwgYikge1xuICAgIGNvbnN0IGZpcnN0ID0gcGFyc2VUb0RhdGUoYSk7XG4gICAgY29uc3Qgc2Vjb25kID0gcGFyc2VUb0RhdGUoYik7XG4gICAgaWYgKCFmaXJzdCB8fCAhc2Vjb25kKVxuICAgICAgICByZXR1cm4gTnVtYmVyLk5hTjtcbiAgICByZXR1cm4gTWF0aC50cnVuYygoZmlyc3QuZ2V0VGltZSgpIC0gc2Vjb25kLmdldFRpbWUoKSkgLyAxMDAwKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBkaWZmRGF5cyhhLCBiKSB7XG4gICAgY29uc3Qgc2Vjb25kcyA9IGRpZmZTZWNvbmRzKGEsIGIpO1xuICAgIHJldHVybiBOdW1iZXIuaXNOYU4oc2Vjb25kcykgPyBOdW1iZXIuTmFOIDogc2Vjb25kcyAvIDg2NDAwO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGFkZERheXModmFsdWUsIGRheXMpIHtcbiAgICBjb25zdCBkYXRlID0gcGFyc2VUb0RhdGUodmFsdWUpO1xuICAgIGlmICghZGF0ZSlcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkV4cGVjdGVkIGEgdmFsaWQgZGF0ZSB2YWx1ZVwiKTtcbiAgICByZXR1cm4gbmV3IERhdGUoZGF0ZS5nZXRUaW1lKCkgKyBkYXlzICogODY0MDAwMDApO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGFkZE1pbnV0ZXModmFsdWUsIG1pbnV0ZXMpIHtcbiAgICBjb25zdCBkYXRlID0gcGFyc2VUb0RhdGUodmFsdWUpO1xuICAgIGlmICghZGF0ZSlcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkV4cGVjdGVkIGEgdmFsaWQgZGF0ZSB2YWx1ZVwiKTtcbiAgICByZXR1cm4gbmV3IERhdGUoZGF0ZS5nZXRUaW1lKCkgKyBtaW51dGVzICogNjAwMDApO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0T2ZEYXkodmFsdWUsIHRpbWVab25lID0gXCJVVENcIikge1xuICAgIGNvbnN0IGRhdGUgPSBwYXJzZVRvRGF0ZSh2YWx1ZSk7XG4gICAgaWYgKCFkYXRlKVxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRXhwZWN0ZWQgYSB2YWxpZCBkYXRlIHZhbHVlXCIpO1xuICAgIGlmICh0aW1lWm9uZSA9PT0gXCJVVENcIikge1xuICAgICAgICByZXR1cm4gbmV3IERhdGUoRGF0ZS5VVEMoZGF0ZS5nZXRVVENGdWxsWWVhcigpLCBkYXRlLmdldFVUQ01vbnRoKCksIGRhdGUuZ2V0VVRDRGF0ZSgpKSk7XG4gICAgfVxuICAgIGNvbnN0IHBhcnRzID0gZ2V0Wm9uZWRQYXJ0cyhkYXRlLCB0aW1lWm9uZSk7XG4gICAgcmV0dXJuIHpvbmVkVGltZVRvVXRjKHBhcnRzLnllYXIsIHBhcnRzLm1vbnRoLCBwYXJ0cy5kYXksIDAsIDAsIDAsIHRpbWVab25lKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBlbmRPZkRheSh2YWx1ZSwgdGltZVpvbmUgPSBcIlVUQ1wiKSB7XG4gICAgcmV0dXJuIGFkZE1pbnV0ZXMoYWRkRGF5cyhzdGFydE9mRGF5KHZhbHVlLCB0aW1lWm9uZSksIDEpLCAtMSAvIDYwMDAwKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiB0b1VzZXJUeih2YWx1ZSwgdGltZVpvbmUgPSBnZXRVc2VyVGltZXpvbmUoKSkge1xuICAgIGNvbnN0IGRhdGUgPSBwYXJzZVRvRGF0ZSh2YWx1ZSk7XG4gICAgaWYgKCFkYXRlKVxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRXhwZWN0ZWQgYSB2YWxpZCBkYXRlIHZhbHVlXCIpO1xuICAgIGNvbnN0IHBhcnRzID0gZ2V0Wm9uZWRQYXJ0cyhkYXRlLCB0aW1lWm9uZSk7XG4gICAgcmV0dXJuIG5ldyBEYXRlKHBhcnRzLnllYXIsIHBhcnRzLm1vbnRoIC0gMSwgcGFydHMuZGF5LCBwYXJ0cy5ob3VyLCBwYXJ0cy5taW51dGUsIHBhcnRzLnNlY29uZCk7XG59XG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0RGF0ZUFic29sdXRlKGRhdGUsIGxvY2FsZSA9IERFRkFVTFRfTE9DQUxFKSB7XG4gICAgcmV0dXJuIGZvcm1hdEFic29sdXRlKGRhdGUsIHsgbG9jYWxlIH0pO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdERhdGVSZWxhdGl2ZShkYXRlLCBub3cgPSBub3dJc28oKSkge1xuICAgIHJldHVybiBmb3JtYXRSZWxhdGl2ZShkYXRlLCB7IG5vdyB9KTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXRCcm93c2VyRGVmYXVsdExvY2FsZSgpIHtcbiAgICBpZiAodHlwZW9mIG5hdmlnYXRvciA9PT0gXCJ1bmRlZmluZWRcIilcbiAgICAgICAgcmV0dXJuIERFRkFVTFRfTE9DQUxFO1xuICAgIHJldHVybiBub3JtYWxpemVMb2NhbGUobmF2aWdhdG9yLmxhbmd1YWdlKTtcbn1cbmZ1bmN0aW9uIGZvcm1hdFJlbGF0aXZlQnVja2V0KHZhbHVlLCB1bml0LCBpc0Z1dHVyZSkge1xuICAgIHJldHVybiBpc0Z1dHVyZSA/IGBpbiAke3ZhbHVlfSR7dW5pdH1gIDogYCR7dmFsdWV9JHt1bml0fSBhZ29gO1xufVxuZnVuY3Rpb24gZ2V0Wm9uZWRQYXJ0cyhkYXRlLCB0aW1lWm9uZSkge1xuICAgIGNvbnN0IHBhcnRzID0gbmV3IEludGwuRGF0ZVRpbWVGb3JtYXQoTlVNRVJJQ19QQVJUU19MT0NBTEUsIHtcbiAgICAgICAgdGltZVpvbmUsXG4gICAgICAgIHllYXI6IFwibnVtZXJpY1wiLFxuICAgICAgICBtb250aDogXCIyLWRpZ2l0XCIsXG4gICAgICAgIGRheTogXCIyLWRpZ2l0XCIsXG4gICAgICAgIGhvdXI6IFwiMi1kaWdpdFwiLFxuICAgICAgICBtaW51dGU6IFwiMi1kaWdpdFwiLFxuICAgICAgICBzZWNvbmQ6IFwiMi1kaWdpdFwiLFxuICAgICAgICBob3VyQ3ljbGU6IFwiaDIzXCIsXG4gICAgfSkuZm9ybWF0VG9QYXJ0cyhkYXRlKTtcbiAgICBjb25zdCBnZXQgPSAodHlwZSkgPT4gTnVtYmVyKHBhcnRzLmZpbmQoKHBhcnQpID0+IHBhcnQudHlwZSA9PT0gdHlwZSk/LnZhbHVlKTtcbiAgICByZXR1cm4ge1xuICAgICAgICB5ZWFyOiBnZXQoXCJ5ZWFyXCIpLFxuICAgICAgICBtb250aDogZ2V0KFwibW9udGhcIiksXG4gICAgICAgIGRheTogZ2V0KFwiZGF5XCIpLFxuICAgICAgICBob3VyOiBnZXQoXCJob3VyXCIpLFxuICAgICAgICBtaW51dGU6IGdldChcIm1pbnV0ZVwiKSxcbiAgICAgICAgc2Vjb25kOiBnZXQoXCJzZWNvbmRcIiksXG4gICAgfTtcbn1cbmZ1bmN0aW9uIHpvbmVkVGltZVRvVXRjKHllYXIsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCB0aW1lWm9uZSkge1xuICAgIGNvbnN0IHV0Y0d1ZXNzID0gbmV3IERhdGUoRGF0ZS5VVEMoeWVhciwgbW9udGggLSAxLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kKSk7XG4gICAgY29uc3QgcGFydHMgPSBnZXRab25lZFBhcnRzKHV0Y0d1ZXNzLCB0aW1lWm9uZSk7XG4gICAgY29uc3Qgb2Zmc2V0TXMgPSBEYXRlLlVUQyhwYXJ0cy55ZWFyLCBwYXJ0cy5tb250aCAtIDEsIHBhcnRzLmRheSwgcGFydHMuaG91ciwgcGFydHMubWludXRlLCBwYXJ0cy5zZWNvbmQpIC0gdXRjR3Vlc3MuZ2V0VGltZSgpO1xuICAgIHJldHVybiBuZXcgRGF0ZSh1dGNHdWVzcy5nZXRUaW1lKCkgLSBvZmZzZXRNcyk7XG59XG4iLCJleHBvcnQgY29uc3QgU1VCX1NDT1JFX01BWF9QT0lOVFMgPSB7XG4gICAgc2VjdGlvbkNvbXBsZXRlbmVzczogMTAsXG4gICAgYWN0aW9uVmVyYnM6IDE1LFxuICAgIHF1YW50aWZpZWRBY2hpZXZlbWVudHM6IDIwLFxuICAgIGtleXdvcmRNYXRjaDogMjUsXG4gICAgbGVuZ3RoOiAxMCxcbiAgICBzcGVsbGluZ0dyYW1tYXI6IDEwLFxuICAgIGF0c0ZyaWVuZGxpbmVzczogMTAsXG59O1xuZXhwb3J0IGNvbnN0IEFDVElPTl9WRVJCUyA9IFtcbiAgICBcImFjaGlldmVkXCIsXG4gICAgXCJhbmFseXplZFwiLFxuICAgIFwiYXJjaGl0ZWN0ZWRcIixcbiAgICBcImJ1aWx0XCIsXG4gICAgXCJjb2xsYWJvcmF0ZWRcIixcbiAgICBcImNyZWF0ZWRcIixcbiAgICBcImRlbGl2ZXJlZFwiLFxuICAgIFwiZGVzaWduZWRcIixcbiAgICBcImRldmVsb3BlZFwiLFxuICAgIFwiZHJvdmVcIixcbiAgICBcImltcHJvdmVkXCIsXG4gICAgXCJpbmNyZWFzZWRcIixcbiAgICBcImxhdW5jaGVkXCIsXG4gICAgXCJsZWRcIixcbiAgICBcIm1hbmFnZWRcIixcbiAgICBcIm1lbnRvcmVkXCIsXG4gICAgXCJvcHRpbWl6ZWRcIixcbiAgICBcInJlZHVjZWRcIixcbiAgICBcInJlc29sdmVkXCIsXG4gICAgXCJzaGlwcGVkXCIsXG4gICAgXCJzdHJlYW1saW5lZFwiLFxuICAgIFwic3VwcG9ydGVkXCIsXG4gICAgXCJ0cmFuc2Zvcm1lZFwiLFxuXTtcbmV4cG9ydCBjb25zdCBRVUFOVElGSUVEX1JFR0VYID0gL1xcZCslfFxcJFtcXGQsXSsoPzpcXC5cXGQrKT9ba0ttTWJCXT98XFxiXFxkK3hcXGJ8XFxidGVhbSBvZiBcXGQrXFxifFxcYlxcZCtcXHMrKHVzZXJzfGN1c3RvbWVyc3xjbGllbnRzfHByb2plY3RzfHBlb3BsZXxlbmdpbmVlcnN8cmVwb3J0c3xob3Vyc3xtZW1iZXJzfGNvdW50cmllc3xsYW5ndWFnZXN8c3RhdGVzfGNpdGllc3xzdG9yZXN8cGFydG5lcnN8ZGVhbHN8bGVhZHMpXFxiL2dpO1xuIiwiZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZVRleHQodGV4dCkge1xuICAgIHJldHVybiB0ZXh0XG4gICAgICAgIC50b0xvd2VyQ2FzZSgpXG4gICAgICAgIC5yZXBsYWNlKC9bXmEtejAtOSsjLlxccy8tXS9nLCBcIiBcIilcbiAgICAgICAgLnJlcGxhY2UoL1xccysvZywgXCIgXCIpXG4gICAgICAgIC50cmltKCk7XG59XG5leHBvcnQgZnVuY3Rpb24gZXNjYXBlUmVnRXhwKHN0cikge1xuICAgIHJldHVybiBzdHIucmVwbGFjZSgvWy4qKz9eJHt9KCl8W1xcXVxcXFxdL2csIFwiXFxcXCQmXCIpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHdvcmRCb3VuZGFyeVJlZ2V4KHRlcm0sIGZsYWdzID0gXCJcIikge1xuICAgIHJldHVybiBuZXcgUmVnRXhwKGBcXFxcYiR7ZXNjYXBlUmVnRXhwKHRlcm0pfVxcXFxiYCwgZmxhZ3MpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGNvbnRhaW5zV29yZCh0ZXh0LCB0ZXJtKSB7XG4gICAgcmV0dXJuIHdvcmRCb3VuZGFyeVJlZ2V4KHRlcm0pLnRlc3QodGV4dCk7XG59XG5leHBvcnQgZnVuY3Rpb24gY291bnRXb3JkT2NjdXJyZW5jZXModGV4dCwgdGVybSkge1xuICAgIHJldHVybiAodGV4dC5tYXRjaCh3b3JkQm91bmRhcnlSZWdleCh0ZXJtLCBcImdcIikpIHx8IFtdKS5sZW5ndGg7XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0SGlnaGxpZ2h0cyhwcm9maWxlKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgLi4ucHJvZmlsZS5leHBlcmllbmNlcy5mbGF0TWFwKChleHBlcmllbmNlKSA9PiBleHBlcmllbmNlLmhpZ2hsaWdodHMpLFxuICAgICAgICAuLi5wcm9maWxlLnByb2plY3RzLmZsYXRNYXAoKHByb2plY3QpID0+IHByb2plY3QuaGlnaGxpZ2h0cyksXG4gICAgXS5maWx0ZXIoQm9vbGVhbik7XG59XG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdFByb2ZpbGVUZXh0KHByb2ZpbGUpIHtcbiAgICBjb25zdCBwYXJ0cyA9IFtcbiAgICAgICAgcHJvZmlsZS5jb250YWN0Py5uYW1lLFxuICAgICAgICBwcm9maWxlLmNvbnRhY3Q/LmVtYWlsLFxuICAgICAgICBwcm9maWxlLmNvbnRhY3Q/LnBob25lLFxuICAgICAgICBwcm9maWxlLmNvbnRhY3Q/LmxvY2F0aW9uLFxuICAgICAgICBwcm9maWxlLmNvbnRhY3Q/LmxpbmtlZGluLFxuICAgICAgICBwcm9maWxlLmNvbnRhY3Q/LmdpdGh1YixcbiAgICAgICAgcHJvZmlsZS5jb250YWN0Py53ZWJzaXRlLFxuICAgICAgICBwcm9maWxlLmNvbnRhY3Q/LmhlYWRsaW5lLFxuICAgICAgICBwcm9maWxlLnN1bW1hcnksXG4gICAgICAgIC4uLnByb2ZpbGUuZXhwZXJpZW5jZXMuZmxhdE1hcCgoZXhwZXJpZW5jZSkgPT4gW1xuICAgICAgICAgICAgZXhwZXJpZW5jZS50aXRsZSxcbiAgICAgICAgICAgIGV4cGVyaWVuY2UuY29tcGFueSxcbiAgICAgICAgICAgIGV4cGVyaWVuY2UubG9jYXRpb24sXG4gICAgICAgICAgICBleHBlcmllbmNlLmRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgLi4uZXhwZXJpZW5jZS5oaWdobGlnaHRzLFxuICAgICAgICAgICAgLi4uZXhwZXJpZW5jZS5za2lsbHMsXG4gICAgICAgICAgICBleHBlcmllbmNlLnN0YXJ0RGF0ZSxcbiAgICAgICAgICAgIGV4cGVyaWVuY2UuZW5kRGF0ZSxcbiAgICAgICAgXSksXG4gICAgICAgIC4uLnByb2ZpbGUuZWR1Y2F0aW9uLmZsYXRNYXAoKGVkdWNhdGlvbikgPT4gW1xuICAgICAgICAgICAgZWR1Y2F0aW9uLmluc3RpdHV0aW9uLFxuICAgICAgICAgICAgZWR1Y2F0aW9uLmRlZ3JlZSxcbiAgICAgICAgICAgIGVkdWNhdGlvbi5maWVsZCxcbiAgICAgICAgICAgIC4uLmVkdWNhdGlvbi5oaWdobGlnaHRzLFxuICAgICAgICAgICAgZWR1Y2F0aW9uLnN0YXJ0RGF0ZSxcbiAgICAgICAgICAgIGVkdWNhdGlvbi5lbmREYXRlLFxuICAgICAgICBdKSxcbiAgICAgICAgLi4ucHJvZmlsZS5za2lsbHMubWFwKChza2lsbCkgPT4gc2tpbGwubmFtZSksXG4gICAgICAgIC4uLnByb2ZpbGUucHJvamVjdHMuZmxhdE1hcCgocHJvamVjdCkgPT4gW1xuICAgICAgICAgICAgcHJvamVjdC5uYW1lLFxuICAgICAgICAgICAgcHJvamVjdC5kZXNjcmlwdGlvbixcbiAgICAgICAgICAgIHByb2plY3QudXJsLFxuICAgICAgICAgICAgLi4ucHJvamVjdC5oaWdobGlnaHRzLFxuICAgICAgICAgICAgLi4ucHJvamVjdC50ZWNobm9sb2dpZXMsXG4gICAgICAgIF0pLFxuICAgICAgICAuLi5wcm9maWxlLmNlcnRpZmljYXRpb25zLmZsYXRNYXAoKGNlcnRpZmljYXRpb24pID0+IFtcbiAgICAgICAgICAgIGNlcnRpZmljYXRpb24ubmFtZSxcbiAgICAgICAgICAgIGNlcnRpZmljYXRpb24uaXNzdWVyLFxuICAgICAgICAgICAgY2VydGlmaWNhdGlvbi5kYXRlLFxuICAgICAgICAgICAgY2VydGlmaWNhdGlvbi51cmwsXG4gICAgICAgIF0pLFxuICAgIF07XG4gICAgcmV0dXJuIHBhcnRzLmZpbHRlcihCb29sZWFuKS5qb2luKFwiXFxuXCIpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldFJlc3VtZVRleHQocHJvZmlsZSwgcmF3VGV4dCkge1xuICAgIHJldHVybiAocmF3VGV4dD8udHJpbSgpIHx8IHByb2ZpbGUucmF3VGV4dD8udHJpbSgpIHx8IGV4dHJhY3RQcm9maWxlVGV4dChwcm9maWxlKSk7XG59XG5leHBvcnQgZnVuY3Rpb24gd29yZENvdW50KHRleHQpIHtcbiAgICBjb25zdCBub3JtYWxpemVkID0gbm9ybWFsaXplVGV4dCh0ZXh0KTtcbiAgICBpZiAoIW5vcm1hbGl6ZWQpXG4gICAgICAgIHJldHVybiAwO1xuICAgIHJldHVybiBub3JtYWxpemVkLnNwbGl0KC9cXHMrLykuZmlsdGVyKEJvb2xlYW4pLmxlbmd0aDtcbn1cbiIsImltcG9ydCB7IEFDVElPTl9WRVJCUywgU1VCX1NDT1JFX01BWF9QT0lOVFMgfSBmcm9tIFwiLi9jb25zdGFudHNcIjtcbmltcG9ydCB7IGdldEhpZ2hsaWdodHMsIG5vcm1hbGl6ZVRleHQsIHdvcmRCb3VuZGFyeVJlZ2V4IH0gZnJvbSBcIi4vdGV4dFwiO1xuZnVuY3Rpb24gcG9pbnRzRm9yRGlzdGluY3RWZXJicyhjb3VudCkge1xuICAgIGlmIChjb3VudCA9PT0gMClcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgaWYgKGNvdW50IDw9IDIpXG4gICAgICAgIHJldHVybiA1O1xuICAgIGlmIChjb3VudCA8PSA0KVxuICAgICAgICByZXR1cm4gOTtcbiAgICBpZiAoY291bnQgPD0gNylcbiAgICAgICAgcmV0dXJuIDEyO1xuICAgIHJldHVybiAxNTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBzY29yZUFjdGlvblZlcmJzKGlucHV0KSB7XG4gICAgY29uc3QgZGlzdGluY3RWZXJicyA9IG5ldyBTZXQoKTtcbiAgICBmb3IgKGNvbnN0IGhpZ2hsaWdodCBvZiBnZXRIaWdobGlnaHRzKGlucHV0LnByb2ZpbGUpKSB7XG4gICAgICAgIGNvbnN0IGZpcnN0V29yZCA9IG5vcm1hbGl6ZVRleHQoaGlnaGxpZ2h0KS5zcGxpdCgvXFxzKy8pWzBdID8/IFwiXCI7XG4gICAgICAgIGZvciAoY29uc3QgdmVyYiBvZiBBQ1RJT05fVkVSQlMpIHtcbiAgICAgICAgICAgIGlmICh3b3JkQm91bmRhcnlSZWdleCh2ZXJiKS50ZXN0KGZpcnN0V29yZCkpIHtcbiAgICAgICAgICAgICAgICBkaXN0aW5jdFZlcmJzLmFkZCh2ZXJiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCB2ZXJicyA9IEFycmF5LmZyb20oZGlzdGluY3RWZXJicykuc29ydCgpO1xuICAgIGNvbnN0IG5vdGVzID0gdmVyYnMubGVuZ3RoID09PSAwXG4gICAgICAgID8gW1wiU3RhcnQgYWNoaWV2ZW1lbnQgYnVsbGV0cyB3aXRoIHN0cm9uZyBhY3Rpb24gdmVyYnMuXCJdXG4gICAgICAgIDogW107XG4gICAgY29uc3QgcHJldmlldyA9IHZlcmJzLnNsaWNlKDAsIDUpLmpvaW4oXCIsIFwiKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBrZXk6IFwiYWN0aW9uVmVyYnNcIixcbiAgICAgICAgbGFiZWw6IFwiQWN0aW9uIHZlcmJzXCIsXG4gICAgICAgIGVhcm5lZDogcG9pbnRzRm9yRGlzdGluY3RWZXJicyh2ZXJicy5sZW5ndGgpLFxuICAgICAgICBtYXhQb2ludHM6IFNVQl9TQ09SRV9NQVhfUE9JTlRTLmFjdGlvblZlcmJzLFxuICAgICAgICBub3RlcyxcbiAgICAgICAgZXZpZGVuY2U6IFtcbiAgICAgICAgICAgIHByZXZpZXdcbiAgICAgICAgICAgICAgICA/IGAke3ZlcmJzLmxlbmd0aH0gZGlzdGluY3QgYWN0aW9uIHZlcmJzICgke3ByZXZpZXd9KWBcbiAgICAgICAgICAgICAgICA6IFwiMCBkaXN0aW5jdCBhY3Rpb24gdmVyYnNcIixcbiAgICAgICAgXSxcbiAgICB9O1xufVxuIiwiZXhwb3J0IGNvbnN0IFBST0JMRU1BVElDX0NIQVJBQ1RFUlMgPSBbXG4gICAgeyBjaGFyOiBcIlxcdTIwMjJcIiwgbmFtZTogXCJidWxsZXQgcG9pbnRcIiwgcmVwbGFjZW1lbnQ6IFwiLVwiIH0sXG4gICAgeyBjaGFyOiBcIlxcdTIwMTNcIiwgbmFtZTogXCJlbiBkYXNoXCIsIHJlcGxhY2VtZW50OiBcIi1cIiB9LFxuICAgIHsgY2hhcjogXCJcXHUyMDE0XCIsIG5hbWU6IFwiZW0gZGFzaFwiLCByZXBsYWNlbWVudDogXCItXCIgfSxcbiAgICB7IGNoYXI6IFwiXFx1MjAxY1wiLCBuYW1lOiBcImN1cmx5IHF1b3RlIGxlZnRcIiwgcmVwbGFjZW1lbnQ6ICdcIicgfSxcbiAgICB7IGNoYXI6IFwiXFx1MjAxZFwiLCBuYW1lOiBcImN1cmx5IHF1b3RlIHJpZ2h0XCIsIHJlcGxhY2VtZW50OiAnXCInIH0sXG4gICAgeyBjaGFyOiBcIlxcdTIwMThcIiwgbmFtZTogXCJjdXJseSBhcG9zdHJvcGhlIGxlZnRcIiwgcmVwbGFjZW1lbnQ6IFwiJ1wiIH0sXG4gICAgeyBjaGFyOiBcIlxcdTIwMTlcIiwgbmFtZTogXCJjdXJseSBhcG9zdHJvcGhlIHJpZ2h0XCIsIHJlcGxhY2VtZW50OiBcIidcIiB9LFxuICAgIHsgY2hhcjogXCJcXHUyMDI2XCIsIG5hbWU6IFwiZWxsaXBzaXNcIiwgcmVwbGFjZW1lbnQ6IFwiLi4uXCIgfSxcbiAgICB7IGNoYXI6IFwiXFx1MDBhOVwiLCBuYW1lOiBcImNvcHlyaWdodFwiLCByZXBsYWNlbWVudDogXCIoYylcIiB9LFxuICAgIHsgY2hhcjogXCJcXHUwMGFlXCIsIG5hbWU6IFwicmVnaXN0ZXJlZFwiLCByZXBsYWNlbWVudDogXCIoUilcIiB9LFxuICAgIHsgY2hhcjogXCJcXHUyMTIyXCIsIG5hbWU6IFwidHJhZGVtYXJrXCIsIHJlcGxhY2VtZW50OiBcIihUTSlcIiB9LFxuXTtcbiIsImltcG9ydCB7IFBST0JMRU1BVElDX0NIQVJBQ1RFUlMgfSBmcm9tIFwiLi9hdHMtY2hhcmFjdGVyc1wiO1xuaW1wb3J0IHsgU1VCX1NDT1JFX01BWF9QT0lOVFMgfSBmcm9tIFwiLi9jb25zdGFudHNcIjtcbmltcG9ydCB7IGdldFJlc3VtZVRleHQgfSBmcm9tIFwiLi90ZXh0XCI7XG5leHBvcnQgZnVuY3Rpb24gc2NvcmVBdHNGcmllbmRsaW5lc3MoaW5wdXQpIHtcbiAgICBjb25zdCB0ZXh0ID0gZ2V0UmVzdW1lVGV4dChpbnB1dC5wcm9maWxlLCBpbnB1dC5yYXdUZXh0KTtcbiAgICBjb25zdCByYXdUZXh0ID0gaW5wdXQucmF3VGV4dCA/PyBpbnB1dC5wcm9maWxlLnJhd1RleHQgPz8gXCJcIjtcbiAgICBjb25zdCBub3RlcyA9IFtdO1xuICAgIGNvbnN0IGV2aWRlbmNlID0gW107XG4gICAgbGV0IGRlZHVjdGlvbnMgPSAwO1xuICAgIGNvbnN0IGZvdW5kUHJvYmxlbWF0aWMgPSBQUk9CTEVNQVRJQ19DSEFSQUNURVJTLmZpbHRlcigoeyBjaGFyIH0pID0+IHRleHQuaW5jbHVkZXMoY2hhcikpO1xuICAgIGlmIChmb3VuZFByb2JsZW1hdGljLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgcGVuYWx0eSA9IE1hdGgubWluKDMsIGZvdW5kUHJvYmxlbWF0aWMubGVuZ3RoKTtcbiAgICAgICAgZGVkdWN0aW9ucyArPSBwZW5hbHR5O1xuICAgICAgICBub3Rlcy5wdXNoKFwiU3BlY2lhbCBmb3JtYXR0aW5nIGNoYXJhY3RlcnMgY2FuIHJlZHVjZSBBVFMgcGFyc2UgcXVhbGl0eS5cIik7XG4gICAgICAgIGV2aWRlbmNlLnB1c2goYCR7Zm91bmRQcm9ibGVtYXRpYy5sZW5ndGh9IHNwZWNpYWwgY2hhcmFjdGVyc2ApO1xuICAgIH1cbiAgICBjb25zdCBiYWRDaGFycyA9ICh0ZXh0Lm1hdGNoKC9bXFx1RkZGRFxcdTAwMDAtXFx1MDAwOFxcdTAwMEJcXHUwMDBDXFx1MDAwRS1cXHUwMDFGXS9nKSB8fCBbXSkubGVuZ3RoO1xuICAgIGlmIChiYWRDaGFycyA+IDApIHtcbiAgICAgICAgZGVkdWN0aW9ucyArPSAyO1xuICAgICAgICBub3Rlcy5wdXNoKFwiQ29udHJvbCBvciByZXBsYWNlbWVudCBjaGFyYWN0ZXJzIGRldGVjdGVkLlwiKTtcbiAgICAgICAgZXZpZGVuY2UucHVzaChgJHtiYWRDaGFyc30gY29udHJvbCBvciByZXBsYWNlbWVudCBjaGFyYWN0ZXIocylgKTtcbiAgICB9XG4gICAgaWYgKHJhd1RleHQuaW5jbHVkZXMoXCJcXHRcIikpIHtcbiAgICAgICAgZGVkdWN0aW9ucyArPSAyO1xuICAgICAgICBub3Rlcy5wdXNoKFwiVGFiIGNoYXJhY3RlcnMgbWF5IGluZGljYXRlIHRhYmxlLXN0eWxlIGZvcm1hdHRpbmcuXCIpO1xuICAgICAgICBldmlkZW5jZS5wdXNoKFwiVGFiIGNoYXJhY3RlcnMgZm91bmRcIik7XG4gICAgfVxuICAgIGNvbnN0IGxvbmdMaW5lcyA9IHJhd1RleHQuc3BsaXQoL1xccj9cXG4vKS5maWx0ZXIoKGxpbmUpID0+IGxpbmUubGVuZ3RoID4gMjAwKTtcbiAgICBpZiAobG9uZ0xpbmVzLmxlbmd0aCA+PSA0KSB7XG4gICAgICAgIGRlZHVjdGlvbnMgKz0gMjtcbiAgICAgICAgbm90ZXMucHVzaChcIlZlcnkgbG9uZyBsaW5lcyBtYXkgaW5kaWNhdGUgbXVsdGktY29sdW1uIG9yIHRhYmxlIGZvcm1hdHRpbmcuXCIpO1xuICAgICAgICBldmlkZW5jZS5wdXNoKGAke2xvbmdMaW5lcy5sZW5ndGh9IG92ZXItbG9uZyBsaW5lc2ApO1xuICAgIH1cbiAgICBpZiAoLzxbYS16QS1aL11bXj5dKj4vLnRlc3QocmF3VGV4dCkpIHtcbiAgICAgICAgZGVkdWN0aW9ucyArPSAyO1xuICAgICAgICBub3Rlcy5wdXNoKFwiSFRNTCB0YWdzIGRldGVjdGVkIGluIHJlc3VtZSB0ZXh0LlwiKTtcbiAgICAgICAgZXZpZGVuY2UucHVzaChcIkhUTUwgdGFncyBmb3VuZFwiKTtcbiAgICB9XG4gICAgaWYgKCEvW1xcdy4rLV0rQFtcXHcuLV0rXFwuW2EtekEtWl17Mix9Ly50ZXN0KHRleHQpKSB7XG4gICAgICAgIGRlZHVjdGlvbnMgKz0gMjtcbiAgICAgICAgbm90ZXMucHVzaChcIk5vIGVtYWlsIHBhdHRlcm4gZGV0ZWN0ZWQgaW4gcGFyc2VhYmxlIHJlc3VtZSB0ZXh0LlwiKTtcbiAgICAgICAgZXZpZGVuY2UucHVzaChcIk5vIGVtYWlsIGRldGVjdGVkXCIpO1xuICAgIH1cbiAgICBpZiAoaW5wdXQucmF3VGV4dCAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgIGlucHV0LnJhd1RleHQudHJpbSgpLmxlbmd0aCA8IDIwMCAmJlxuICAgICAgICBpbnB1dC5wcm9maWxlLmV4cGVyaWVuY2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgZGVkdWN0aW9ucyArPSAzO1xuICAgICAgICBub3Rlcy5wdXNoKFwiRXh0cmFjdGVkIHRleHQgaXMgdmVyeSBzaG9ydCBmb3IgYSByZXN1bWUgd2l0aCBleHBlcmllbmNlLlwiKTtcbiAgICAgICAgZXZpZGVuY2UucHVzaChcIlBvc3NpYmxlIGltYWdlLW9ubHkgUERGXCIpO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBrZXk6IFwiYXRzRnJpZW5kbGluZXNzXCIsXG4gICAgICAgIGxhYmVsOiBcIkFUUyBmcmllbmRsaW5lc3NcIixcbiAgICAgICAgZWFybmVkOiBNYXRoLm1heCgwLCBTVUJfU0NPUkVfTUFYX1BPSU5UUy5hdHNGcmllbmRsaW5lc3MgLSBkZWR1Y3Rpb25zKSxcbiAgICAgICAgbWF4UG9pbnRzOiBTVUJfU0NPUkVfTUFYX1BPSU5UUy5hdHNGcmllbmRsaW5lc3MsXG4gICAgICAgIG5vdGVzLFxuICAgICAgICBldmlkZW5jZTogZXZpZGVuY2UubGVuZ3RoID4gMCA/IGV2aWRlbmNlIDogW1wiTm8gQVRTIGZvcm1hdHRpbmcgaXNzdWVzIGRldGVjdGVkLlwiXSxcbiAgICB9O1xufVxuIiwiLyoqXG4gKiBTeW5vbnltIGdyb3VwcyBmb3Igc2VtYW50aWMga2V5d29yZCBtYXRjaGluZyBpbiBBVFMgc2NvcmluZy5cbiAqIEVhY2ggZ3JvdXAgbWFwcyBhIGNhbm9uaWNhbCB0ZXJtIHRvIGl0cyBzeW5vbnltcy92YXJpYXRpb25zLlxuICogQWxsIHRlcm1zIHNob3VsZCBiZSBsb3dlcmNhc2UuXG4gKi9cbmV4cG9ydCBjb25zdCBTWU5PTllNX0dST1VQUyA9IFtcbiAgICAvLyBQcm9ncmFtbWluZyBMYW5ndWFnZXNcbiAgICB7IGNhbm9uaWNhbDogXCJqYXZhc2NyaXB0XCIsIHN5bm9ueW1zOiBbXCJqc1wiLCBcImVjbWFzY3JpcHRcIiwgXCJlczZcIiwgXCJlczIwMTVcIl0gfSxcbiAgICB7IGNhbm9uaWNhbDogXCJ0eXBlc2NyaXB0XCIsIHN5bm9ueW1zOiBbXCJ0c1wiXSB9LFxuICAgIHsgY2Fub25pY2FsOiBcInB5dGhvblwiLCBzeW5vbnltczogW1wicHlcIiwgXCJweXRob24zXCJdIH0sXG4gICAgeyBjYW5vbmljYWw6IFwiZ29sYW5nXCIsIHN5bm9ueW1zOiBbXCJnb1wiXSB9LFxuICAgIHsgY2Fub25pY2FsOiBcImMjXCIsIHN5bm9ueW1zOiBbXCJjc2hhcnBcIiwgXCJjIHNoYXJwXCIsIFwiZG90bmV0XCIsIFwiLm5ldFwiXSB9LFxuICAgIHsgY2Fub25pY2FsOiBcImMrK1wiLCBzeW5vbnltczogW1wiY3BwXCIsIFwiY3BsdXNwbHVzXCJdIH0sXG4gICAgeyBjYW5vbmljYWw6IFwicnVieVwiLCBzeW5vbnltczogW1wicmJcIl0gfSxcbiAgICB7IGNhbm9uaWNhbDogXCJrb3RsaW5cIiwgc3lub255bXM6IFtcImt0XCJdIH0sXG4gICAgeyBjYW5vbmljYWw6IFwib2JqZWN0aXZlLWNcIiwgc3lub255bXM6IFtcIm9iamNcIiwgXCJvYmotY1wiXSB9LFxuICAgIC8vIEZyb250ZW5kIEZyYW1ld29ya3NcbiAgICB7IGNhbm9uaWNhbDogXCJyZWFjdFwiLCBzeW5vbnltczogW1wicmVhY3Rqc1wiLCBcInJlYWN0LmpzXCIsIFwicmVhY3QganNcIl0gfSxcbiAgICB7IGNhbm9uaWNhbDogXCJhbmd1bGFyXCIsIHN5bm9ueW1zOiBbXCJhbmd1bGFyanNcIiwgXCJhbmd1bGFyLmpzXCIsIFwiYW5ndWxhciBqc1wiXSB9LFxuICAgIHsgY2Fub25pY2FsOiBcInZ1ZVwiLCBzeW5vbnltczogW1widnVlanNcIiwgXCJ2dWUuanNcIiwgXCJ2dWUganNcIl0gfSxcbiAgICB7IGNhbm9uaWNhbDogXCJuZXh0LmpzXCIsIHN5bm9ueW1zOiBbXCJuZXh0anNcIiwgXCJuZXh0IGpzXCIsIFwibmV4dFwiXSB9LFxuICAgIHsgY2Fub25pY2FsOiBcIm51eHRcIiwgc3lub255bXM6IFtcIm51eHRqc1wiLCBcIm51eHQuanNcIl0gfSxcbiAgICB7IGNhbm9uaWNhbDogXCJzdmVsdGVcIiwgc3lub255bXM6IFtcInN2ZWx0ZWpzXCIsIFwic3ZlbHRla2l0XCJdIH0sXG4gICAgLy8gQmFja2VuZCBGcmFtZXdvcmtzXG4gICAgeyBjYW5vbmljYWw6IFwibm9kZS5qc1wiLCBzeW5vbnltczogW1wibm9kZWpzXCIsIFwibm9kZSBqc1wiLCBcIm5vZGVcIl0gfSxcbiAgICB7IGNhbm9uaWNhbDogXCJleHByZXNzXCIsIHN5bm9ueW1zOiBbXCJleHByZXNzanNcIiwgXCJleHByZXNzLmpzXCJdIH0sXG4gICAgeyBjYW5vbmljYWw6IFwiZGphbmdvXCIsIHN5bm9ueW1zOiBbXCJkamFuZ28gcmVzdCBmcmFtZXdvcmtcIiwgXCJkcmZcIl0gfSxcbiAgICB7IGNhbm9uaWNhbDogXCJmbGFza1wiLCBzeW5vbnltczogW1wiZmxhc2sgcHl0aG9uXCJdIH0sXG4gICAgeyBjYW5vbmljYWw6IFwic3ByaW5nXCIsIHN5bm9ueW1zOiBbXCJzcHJpbmcgYm9vdFwiLCBcInNwcmluZ2Jvb3RcIl0gfSxcbiAgICB7IGNhbm9uaWNhbDogXCJydWJ5IG9uIHJhaWxzXCIsIHN5bm9ueW1zOiBbXCJyYWlsc1wiLCBcInJvclwiXSB9LFxuICAgIHsgY2Fub25pY2FsOiBcImZhc3RhcGlcIiwgc3lub255bXM6IFtcImZhc3QgYXBpXCJdIH0sXG4gICAgLy8gRGF0YWJhc2VzXG4gICAgeyBjYW5vbmljYWw6IFwicG9zdGdyZXNxbFwiLCBzeW5vbnltczogW1wicG9zdGdyZXNcIiwgXCJwc3FsXCIsIFwicGdcIl0gfSxcbiAgICB7IGNhbm9uaWNhbDogXCJtb25nb2RiXCIsIHN5bm9ueW1zOiBbXCJtb25nb1wiXSB9LFxuICAgIHsgY2Fub25pY2FsOiBcIm15c3FsXCIsIHN5bm9ueW1zOiBbXCJtYXJpYWRiXCJdIH0sXG4gICAgeyBjYW5vbmljYWw6IFwiZHluYW1vZGJcIiwgc3lub255bXM6IFtcImR5bmFtbyBkYlwiLCBcImR5bmFtb1wiXSB9LFxuICAgIHsgY2Fub25pY2FsOiBcImVsYXN0aWNzZWFyY2hcIiwgc3lub255bXM6IFtcImVsYXN0aWMgc2VhcmNoXCIsIFwiZWxhc3RpY1wiLCBcImVzXCJdIH0sXG4gICAgeyBjYW5vbmljYWw6IFwicmVkaXNcIiwgc3lub255bXM6IFtcInJlZGlzIGNhY2hlXCJdIH0sXG4gICAgeyBjYW5vbmljYWw6IFwic3FsXCIsIHN5bm9ueW1zOiBbXCJzdHJ1Y3R1cmVkIHF1ZXJ5IGxhbmd1YWdlXCJdIH0sXG4gICAgeyBjYW5vbmljYWw6IFwibm9zcWxcIiwgc3lub255bXM6IFtcIm5vIHNxbFwiLCBcIm5vbi1yZWxhdGlvbmFsXCJdIH0sXG4gICAgLy8gQ2xvdWQgJiBJbmZyYXN0cnVjdHVyZVxuICAgIHsgY2Fub25pY2FsOiBcImF3c1wiLCBzeW5vbnltczogW1wiYW1hem9uIHdlYiBzZXJ2aWNlc1wiLCBcImFtYXpvbiBjbG91ZFwiXSB9LFxuICAgIHsgY2Fub25pY2FsOiBcImdjcFwiLCBzeW5vbnltczogW1wiZ29vZ2xlIGNsb3VkXCIsIFwiZ29vZ2xlIGNsb3VkIHBsYXRmb3JtXCJdIH0sXG4gICAgeyBjYW5vbmljYWw6IFwiYXp1cmVcIiwgc3lub255bXM6IFtcIm1pY3Jvc29mdCBhenVyZVwiLCBcIm1zIGF6dXJlXCJdIH0sXG4gICAgeyBjYW5vbmljYWw6IFwiZG9ja2VyXCIsIHN5bm9ueW1zOiBbXCJjb250YWluZXJpemF0aW9uXCIsIFwiY29udGFpbmVyc1wiXSB9LFxuICAgIHsgY2Fub25pY2FsOiBcImt1YmVybmV0ZXNcIiwgc3lub255bXM6IFtcIms4c1wiLCBcImt1YmVcIl0gfSxcbiAgICB7IGNhbm9uaWNhbDogXCJ0ZXJyYWZvcm1cIiwgc3lub255bXM6IFtcImluZnJhc3RydWN0dXJlIGFzIGNvZGVcIiwgXCJpYWNcIl0gfSxcbiAgICB7XG4gICAgICAgIGNhbm9uaWNhbDogXCJjaS9jZFwiLFxuICAgICAgICBzeW5vbnltczogW1xuICAgICAgICAgICAgXCJjaWNkXCIsXG4gICAgICAgICAgICBcImNpIGNkXCIsXG4gICAgICAgICAgICBcImNvbnRpbnVvdXMgaW50ZWdyYXRpb25cIixcbiAgICAgICAgICAgIFwiY29udGludW91cyBkZXBsb3ltZW50XCIsXG4gICAgICAgICAgICBcImNvbnRpbnVvdXMgZGVsaXZlcnlcIixcbiAgICAgICAgXSxcbiAgICB9LFxuICAgIHsgY2Fub25pY2FsOiBcImRldm9wc1wiLCBzeW5vbnltczogW1wiZGV2IG9wc1wiLCBcInNpdGUgcmVsaWFiaWxpdHlcIiwgXCJzcmVcIl0gfSxcbiAgICAvLyBUb29scyAmIFBsYXRmb3Jtc1xuICAgIHtcbiAgICAgICAgY2Fub25pY2FsOiBcImdpdFwiLFxuICAgICAgICBzeW5vbnltczogW1wiZ2l0aHViXCIsIFwiZ2l0bGFiXCIsIFwiYml0YnVja2V0XCIsIFwidmVyc2lvbiBjb250cm9sXCJdLFxuICAgIH0sXG4gICAgeyBjYW5vbmljYWw6IFwiamlyYVwiLCBzeW5vbnltczogW1wiYXRsYXNzaWFuIGppcmFcIl0gfSxcbiAgICB7IGNhbm9uaWNhbDogXCJmaWdtYVwiLCBzeW5vbnltczogW1wiZmlnbWEgZGVzaWduXCJdIH0sXG4gICAgeyBjYW5vbmljYWw6IFwid2VicGFja1wiLCBzeW5vbnltczogW1wibW9kdWxlIGJ1bmRsZXJcIl0gfSxcbiAgICB7IGNhbm9uaWNhbDogXCJncmFwaHFsXCIsIHN5bm9ueW1zOiBbXCJncmFwaCBxbFwiLCBcImdxbFwiXSB9LFxuICAgIHtcbiAgICAgICAgY2Fub25pY2FsOiBcInJlc3QgYXBpXCIsXG4gICAgICAgIHN5bm9ueW1zOiBbXCJyZXN0ZnVsXCIsIFwicmVzdGZ1bCBhcGlcIiwgXCJyZXN0XCIsIFwiYXBpXCJdLFxuICAgIH0sXG4gICAgLy8gUm9sZSBUZXJtc1xuICAgIHtcbiAgICAgICAgY2Fub25pY2FsOiBcImZyb250ZW5kXCIsXG4gICAgICAgIHN5bm9ueW1zOiBbXG4gICAgICAgICAgICBcImZyb250LWVuZFwiLFxuICAgICAgICAgICAgXCJmcm9udCBlbmRcIixcbiAgICAgICAgICAgIFwiY2xpZW50LXNpZGVcIixcbiAgICAgICAgICAgIFwiY2xpZW50IHNpZGVcIixcbiAgICAgICAgICAgIFwidWkgZGV2ZWxvcG1lbnRcIixcbiAgICAgICAgXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgY2Fub25pY2FsOiBcImJhY2tlbmRcIixcbiAgICAgICAgc3lub255bXM6IFtcImJhY2stZW5kXCIsIFwiYmFjayBlbmRcIiwgXCJzZXJ2ZXItc2lkZVwiLCBcInNlcnZlciBzaWRlXCJdLFxuICAgIH0sXG4gICAgeyBjYW5vbmljYWw6IFwiZnVsbHN0YWNrXCIsIHN5bm9ueW1zOiBbXCJmdWxsLXN0YWNrXCIsIFwiZnVsbCBzdGFja1wiXSB9LFxuICAgIHtcbiAgICAgICAgY2Fub25pY2FsOiBcInNvZnR3YXJlIGVuZ2luZWVyXCIsXG4gICAgICAgIHN5bm9ueW1zOiBbXCJzb2Z0d2FyZSBkZXZlbG9wZXJcIiwgXCJzd2VcIiwgXCJkZXZlbG9wZXJcIiwgXCJwcm9ncmFtbWVyXCIsIFwiY29kZXJcIl0sXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGNhbm9uaWNhbDogXCJkYXRhIHNjaWVudGlzdFwiLFxuICAgICAgICBzeW5vbnltczogW1wiZGF0YSBzY2llbmNlXCIsIFwibWwgZW5naW5lZXJcIiwgXCJtYWNoaW5lIGxlYXJuaW5nIGVuZ2luZWVyXCJdLFxuICAgIH0sXG4gICAge1xuICAgICAgICBjYW5vbmljYWw6IFwiZGF0YSBlbmdpbmVlclwiLFxuICAgICAgICBzeW5vbnltczogW1wiZGF0YSBlbmdpbmVlcmluZ1wiLCBcImV0bCBkZXZlbG9wZXJcIl0sXG4gICAgfSxcbiAgICB7IGNhbm9uaWNhbDogXCJwcm9kdWN0IG1hbmFnZXJcIiwgc3lub255bXM6IFtcInBtXCIsIFwicHJvZHVjdCBvd25lclwiLCBcInBvXCJdIH0sXG4gICAge1xuICAgICAgICBjYW5vbmljYWw6IFwicWEgZW5naW5lZXJcIixcbiAgICAgICAgc3lub255bXM6IFtcInF1YWxpdHkgYXNzdXJhbmNlXCIsIFwicWFcIiwgXCJ0ZXN0IGVuZ2luZWVyXCIsIFwic2RldFwiXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgY2Fub25pY2FsOiBcInV4IGRlc2lnbmVyXCIsXG4gICAgICAgIHN5bm9ueW1zOiBbXCJ1eFwiLCBcInVzZXIgZXhwZXJpZW5jZVwiLCBcInVpL3V4XCIsIFwidWkgdXhcIl0sXG4gICAgfSxcbiAgICAvLyBNZXRob2RvbG9naWVzXG4gICAgeyBjYW5vbmljYWw6IFwiYWdpbGVcIiwgc3lub255bXM6IFtcInNjcnVtXCIsIFwia2FuYmFuXCIsIFwic3ByaW50XCIsIFwic3ByaW50c1wiXSB9LFxuICAgIHtcbiAgICAgICAgY2Fub25pY2FsOiBcInRkZFwiLFxuICAgICAgICBzeW5vbnltczogW1widGVzdCBkcml2ZW4gZGV2ZWxvcG1lbnRcIiwgXCJ0ZXN0LWRyaXZlbiBkZXZlbG9wbWVudFwiXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgY2Fub25pY2FsOiBcImJkZFwiLFxuICAgICAgICBzeW5vbnltczogW1wiYmVoYXZpb3IgZHJpdmVuIGRldmVsb3BtZW50XCIsIFwiYmVoYXZpb3ItZHJpdmVuIGRldmVsb3BtZW50XCJdLFxuICAgIH0sXG4gICAge1xuICAgICAgICBjYW5vbmljYWw6IFwibWljcm9zZXJ2aWNlc1wiLFxuICAgICAgICBzeW5vbnltczogW1wibWljcm8gc2VydmljZXNcIiwgXCJtaWNyby1zZXJ2aWNlc1wiLCBcInNlcnZpY2Utb3JpZW50ZWRcIl0sXG4gICAgfSxcbiAgICAvLyBTb2Z0IFNraWxsc1xuICAgIHtcbiAgICAgICAgY2Fub25pY2FsOiBcImxlYWRlcnNoaXBcIixcbiAgICAgICAgc3lub255bXM6IFtcbiAgICAgICAgICAgIFwibGVkXCIsXG4gICAgICAgICAgICBcIm1hbmFnZWRcIixcbiAgICAgICAgICAgIFwiZGlyZWN0ZWRcIixcbiAgICAgICAgICAgIFwic3VwZXJ2aXNlZFwiLFxuICAgICAgICAgICAgXCJtZW50b3JlZFwiLFxuICAgICAgICAgICAgXCJ0ZWFtIGxlYWRcIixcbiAgICAgICAgXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgY2Fub25pY2FsOiBcImNvbW11bmljYXRpb25cIixcbiAgICAgICAgc3lub255bXM6IFtcImNvbW11bmljYXRlZFwiLCBcInByZXNlbnRlZFwiLCBcInB1YmxpYyBzcGVha2luZ1wiLCBcImludGVycGVyc29uYWxcIl0sXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGNhbm9uaWNhbDogXCJjb2xsYWJvcmF0aW9uXCIsXG4gICAgICAgIHN5bm9ueW1zOiBbXG4gICAgICAgICAgICBcImNvbGxhYm9yYXRlZFwiLFxuICAgICAgICAgICAgXCJ0ZWFtd29ya1wiLFxuICAgICAgICAgICAgXCJjcm9zcy1mdW5jdGlvbmFsXCIsXG4gICAgICAgICAgICBcImNyb3NzIGZ1bmN0aW9uYWxcIixcbiAgICAgICAgXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgY2Fub25pY2FsOiBcInByb2JsZW0gc29sdmluZ1wiLFxuICAgICAgICBzeW5vbnltczogW1wicHJvYmxlbS1zb2x2aW5nXCIsIFwidHJvdWJsZXNob290aW5nXCIsIFwiZGVidWdnaW5nXCIsIFwiYW5hbHl0aWNhbFwiXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgY2Fub25pY2FsOiBcInByb2plY3QgbWFuYWdlbWVudFwiLFxuICAgICAgICBzeW5vbnltczogW1xuICAgICAgICAgICAgXCJwcm9qZWN0LW1hbmFnZW1lbnRcIixcbiAgICAgICAgICAgIFwicHJvZ3JhbSBtYW5hZ2VtZW50XCIsXG4gICAgICAgICAgICBcInN0YWtlaG9sZGVyIG1hbmFnZW1lbnRcIixcbiAgICAgICAgXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgY2Fub25pY2FsOiBcInRpbWUgbWFuYWdlbWVudFwiLFxuICAgICAgICBzeW5vbnltczogW1widGltZS1tYW5hZ2VtZW50XCIsIFwicHJpb3JpdGl6YXRpb25cIiwgXCJvcmdhbml6YXRpb25cIl0sXG4gICAgfSxcbiAgICB7IGNhbm9uaWNhbDogXCJtZW50b3JpbmdcIiwgc3lub255bXM6IFtcImNvYWNoaW5nXCIsIFwidHJhaW5pbmdcIiwgXCJvbmJvYXJkaW5nXCJdIH0sXG4gICAgLy8gRGF0YSAmIE1MXG4gICAge1xuICAgICAgICBjYW5vbmljYWw6IFwibWFjaGluZSBsZWFybmluZ1wiLFxuICAgICAgICBzeW5vbnltczogW1wibWxcIiwgXCJkZWVwIGxlYXJuaW5nXCIsIFwiZGxcIiwgXCJhaVwiLCBcImFydGlmaWNpYWwgaW50ZWxsaWdlbmNlXCJdLFxuICAgIH0sXG4gICAge1xuICAgICAgICBjYW5vbmljYWw6IFwibmxwXCIsXG4gICAgICAgIHN5bm9ueW1zOiBbXCJuYXR1cmFsIGxhbmd1YWdlIHByb2Nlc3NpbmdcIiwgXCJ0ZXh0IHByb2Nlc3NpbmdcIl0sXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGNhbm9uaWNhbDogXCJjb21wdXRlciB2aXNpb25cIixcbiAgICAgICAgc3lub255bXM6IFtcImN2XCIsIFwiaW1hZ2UgcmVjb2duaXRpb25cIiwgXCJpbWFnZSBwcm9jZXNzaW5nXCJdLFxuICAgIH0sXG4gICAgeyBjYW5vbmljYWw6IFwidGVuc29yZmxvd1wiLCBzeW5vbnltczogW1wia2VyYXNcIl0gfSxcbiAgICB7IGNhbm9uaWNhbDogXCJweXRvcmNoXCIsIHN5bm9ueW1zOiBbXCJ0b3JjaFwiXSB9LFxuICAgIC8vIFRlc3RpbmdcbiAgICB7XG4gICAgICAgIGNhbm9uaWNhbDogXCJ1bml0IHRlc3RpbmdcIixcbiAgICAgICAgc3lub255bXM6IFtcInVuaXQgdGVzdHNcIiwgXCJqZXN0XCIsIFwibW9jaGFcIiwgXCJ2aXRlc3RcIiwgXCJweXRlc3RcIl0sXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGNhbm9uaWNhbDogXCJpbnRlZ3JhdGlvbiB0ZXN0aW5nXCIsXG4gICAgICAgIHN5bm9ueW1zOiBbXG4gICAgICAgICAgICBcImludGVncmF0aW9uIHRlc3RzXCIsXG4gICAgICAgICAgICBcImUyZSB0ZXN0aW5nXCIsXG4gICAgICAgICAgICBcImVuZC10by1lbmQgdGVzdGluZ1wiLFxuICAgICAgICAgICAgXCJlbmQgdG8gZW5kXCIsXG4gICAgICAgIF0sXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGNhbm9uaWNhbDogXCJhdXRvbWF0aW9uIHRlc3RpbmdcIixcbiAgICAgICAgc3lub255bXM6IFtcbiAgICAgICAgICAgIFwidGVzdCBhdXRvbWF0aW9uXCIsXG4gICAgICAgICAgICBcImF1dG9tYXRlZCB0ZXN0aW5nXCIsXG4gICAgICAgICAgICBcInNlbGVuaXVtXCIsXG4gICAgICAgICAgICBcImN5cHJlc3NcIixcbiAgICAgICAgICAgIFwicGxheXdyaWdodFwiLFxuICAgICAgICBdLFxuICAgIH0sXG4gICAgLy8gU2VjdXJpdHlcbiAgICB7XG4gICAgICAgIGNhbm9uaWNhbDogXCJjeWJlcnNlY3VyaXR5XCIsXG4gICAgICAgIHN5bm9ueW1zOiBbXCJjeWJlciBzZWN1cml0eVwiLCBcImluZm9ybWF0aW9uIHNlY3VyaXR5XCIsIFwiaW5mb3NlY1wiXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgY2Fub25pY2FsOiBcImF1dGhlbnRpY2F0aW9uXCIsXG4gICAgICAgIHN5bm9ueW1zOiBbXCJhdXRoXCIsIFwib2F1dGhcIiwgXCJzc29cIiwgXCJzaW5nbGUgc2lnbi1vblwiXSxcbiAgICB9LFxuICAgIC8vIE1vYmlsZVxuICAgIHsgY2Fub25pY2FsOiBcImlvc1wiLCBzeW5vbnltczogW1wic3dpZnRcIiwgXCJhcHBsZSBkZXZlbG9wbWVudFwiXSB9LFxuICAgIHsgY2Fub25pY2FsOiBcImFuZHJvaWRcIiwgc3lub255bXM6IFtcImFuZHJvaWQgZGV2ZWxvcG1lbnRcIiwgXCJrb3RsaW4gYW5kcm9pZFwiXSB9LFxuICAgIHsgY2Fub25pY2FsOiBcInJlYWN0IG5hdGl2ZVwiLCBzeW5vbnltczogW1wicmVhY3QtbmF0aXZlXCIsIFwicm5cIl0gfSxcbiAgICB7IGNhbm9uaWNhbDogXCJmbHV0dGVyXCIsIHN5bm9ueW1zOiBbXCJkYXJ0XCJdIH0sXG4gICAgLy8gQnVzaW5lc3MgJiBBbmFseXRpY3NcbiAgICB7XG4gICAgICAgIGNhbm9uaWNhbDogXCJidXNpbmVzcyBpbnRlbGxpZ2VuY2VcIixcbiAgICAgICAgc3lub255bXM6IFtcImJpXCIsIFwidGFibGVhdVwiLCBcInBvd2VyIGJpXCIsIFwibG9va2VyXCJdLFxuICAgIH0sXG4gICAge1xuICAgICAgICBjYW5vbmljYWw6IFwiZGF0YSBhbmFseXNpc1wiLFxuICAgICAgICBzeW5vbnltczogW1wiZGF0YSBhbmFseXRpY3NcIiwgXCJkYXRhIGFuYWx5c3RcIiwgXCJhbmFseXRpY3NcIl0sXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGNhbm9uaWNhbDogXCJldGxcIixcbiAgICAgICAgc3lub255bXM6IFtcImV4dHJhY3QgdHJhbnNmb3JtIGxvYWRcIiwgXCJkYXRhIHBpcGVsaW5lXCIsIFwiZGF0YSBwaXBlbGluZXNcIl0sXG4gICAgfSxcbl07XG4vKipcbiAqIEJ1aWxkcyBhIGxvb2t1cCBtYXAgZnJvbSBhbnkgdGVybSAoY2Fub25pY2FsIG9yIHN5bm9ueW0pIHRvXG4gKiB0aGUgc2V0IG9mIGFsbCB0ZXJtcyBpbiB0aGUgc2FtZSBncm91cCAoaW5jbHVkaW5nIHRoZSBjYW5vbmljYWwgZm9ybSkuXG4gKiBBbGwga2V5cyBhbmQgdmFsdWVzIGFyZSBsb3dlcmNhc2UuXG4gKi9cbmZ1bmN0aW9uIGJ1aWxkU3lub255bUxvb2t1cCgpIHtcbiAgICBjb25zdCBsb29rdXAgPSBuZXcgTWFwKCk7XG4gICAgZm9yIChjb25zdCBncm91cCBvZiBTWU5PTllNX0dST1VQUykge1xuICAgICAgICBjb25zdCBhbGxUZXJtcyA9IFtncm91cC5jYW5vbmljYWwsIC4uLmdyb3VwLnN5bm9ueW1zXTtcbiAgICAgICAgY29uc3QgdGVybVNldCA9IG5ldyBTZXQoYWxsVGVybXMpO1xuICAgICAgICBmb3IgKGNvbnN0IHRlcm0gb2YgYWxsVGVybXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nID0gbG9va3VwLmdldCh0ZXJtKTtcbiAgICAgICAgICAgIGlmIChleGlzdGluZykge1xuICAgICAgICAgICAgICAgIC8vIE1lcmdlIHNldHMgaWYgdGVybSBhcHBlYXJzIGluIG11bHRpcGxlIGdyb3Vwc1xuICAgICAgICAgICAgICAgIHRlcm1TZXQuZm9yRWFjaCgodCkgPT4gZXhpc3RpbmcuYWRkKHQpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGxvb2t1cC5zZXQodGVybSwgbmV3IFNldCh0ZXJtU2V0KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGxvb2t1cDtcbn1cbmNvbnN0IHN5bm9ueW1Mb29rdXAgPSBidWlsZFN5bm9ueW1Mb29rdXAoKTtcbi8qKlxuICogUmV0dXJucyBhbGwgc3lub255bXMgZm9yIGEgZ2l2ZW4gdGVybSAoaW5jbHVkaW5nIHRoZSB0ZXJtIGl0c2VsZikuXG4gKiBSZXR1cm5zIGFuIGVtcHR5IGFycmF5IGlmIG5vIHN5bm9ueW1zIGFyZSBmb3VuZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFN5bm9ueW1zKHRlcm0pIHtcbiAgICBjb25zdCBub3JtYWxpemVkID0gdGVybS50b0xvd2VyQ2FzZSgpLnRyaW0oKTtcbiAgICBjb25zdCBncm91cCA9IHN5bm9ueW1Mb29rdXAuZ2V0KG5vcm1hbGl6ZWQpO1xuICAgIGlmICghZ3JvdXApXG4gICAgICAgIHJldHVybiBbXTtcbiAgICByZXR1cm4gQXJyYXkuZnJvbShncm91cCk7XG59XG4vKipcbiAqIENoZWNrcyBpZiB0d28gdGVybXMgYXJlIHN5bm9ueW1zIG9mIGVhY2ggb3RoZXIuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcmVTeW5vbnltcyh0ZXJtQSwgdGVybUIpIHtcbiAgICBjb25zdCBub3JtYWxpemVkQSA9IHRlcm1BLnRvTG93ZXJDYXNlKCkudHJpbSgpO1xuICAgIGNvbnN0IG5vcm1hbGl6ZWRCID0gdGVybUIudG9Mb3dlckNhc2UoKS50cmltKCk7XG4gICAgaWYgKG5vcm1hbGl6ZWRBID09PSBub3JtYWxpemVkQilcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgY29uc3QgZ3JvdXAgPSBzeW5vbnltTG9va3VwLmdldChub3JtYWxpemVkQSk7XG4gICAgcmV0dXJuIGdyb3VwID8gZ3JvdXAuaGFzKG5vcm1hbGl6ZWRCKSA6IGZhbHNlO1xufVxuLyoqIFdlaWdodCBhcHBsaWVkIHRvIHN5bm9ueW0gbWF0Y2hlcyAodnMgMS4wIGZvciBleGFjdCBtYXRjaGVzKSAqL1xuZXhwb3J0IGNvbnN0IFNZTk9OWU1fTUFUQ0hfV0VJR0hUID0gMC44O1xuIiwiaW1wb3J0IHsgZ2V0U3lub255bXMsIFNZTk9OWU1fTUFUQ0hfV0VJR0hUIH0gZnJvbSBcIi4vc3lub255bXNcIjtcbmltcG9ydCB7IFNVQl9TQ09SRV9NQVhfUE9JTlRTIH0gZnJvbSBcIi4vY29uc3RhbnRzXCI7XG5pbXBvcnQgeyBjb250YWluc1dvcmQsIGNvdW50V29yZE9jY3VycmVuY2VzLCBnZXRSZXN1bWVUZXh0LCBub3JtYWxpemVUZXh0LCB9IGZyb20gXCIuL3RleHRcIjtcbmNvbnN0IFNUT1BfV09SRFMgPSBuZXcgU2V0KFtcbiAgICBcImFcIixcbiAgICBcImFuXCIsXG4gICAgXCJhbmRcIixcbiAgICBcImFyZVwiLFxuICAgIFwiYXNcIixcbiAgICBcImF0XCIsXG4gICAgXCJiZVwiLFxuICAgIFwiYnlcIixcbiAgICBcImZvclwiLFxuICAgIFwiZnJvbVwiLFxuICAgIFwiaW5cIixcbiAgICBcIm9mXCIsXG4gICAgXCJvblwiLFxuICAgIFwib3JcIixcbiAgICBcIm91clwiLFxuICAgIFwidGhlXCIsXG4gICAgXCJ0b1wiLFxuICAgIFwid2VcIixcbiAgICBcIndpdGhcIixcbiAgICBcInlvdVwiLFxuICAgIFwieW91clwiLFxuXSk7XG5mdW5jdGlvbiB0b2tlbml6ZUtleXdvcmRzKHRleHQpIHtcbiAgICByZXR1cm4gbm9ybWFsaXplVGV4dCh0ZXh0KVxuICAgICAgICAuc3BsaXQoL1xccysvKVxuICAgICAgICAubWFwKCh0b2tlbikgPT4gdG9rZW4udHJpbSgpKVxuICAgICAgICAuZmlsdGVyKCh0b2tlbikgPT4gdG9rZW4ubGVuZ3RoID49IDMgJiYgIVNUT1BfV09SRFMuaGFzKHRva2VuKSk7XG59XG5mdW5jdGlvbiB0b3BUb2tlbnModGV4dCwgbGltaXQpIHtcbiAgICBjb25zdCBjb3VudHMgPSBuZXcgTWFwKCk7XG4gICAgZm9yIChjb25zdCB0b2tlbiBvZiB0b2tlbml6ZUtleXdvcmRzKHRleHQpKSB7XG4gICAgICAgIGNvdW50cy5zZXQodG9rZW4sIChjb3VudHMuZ2V0KHRva2VuKSA/PyAwKSArIDEpO1xuICAgIH1cbiAgICByZXR1cm4gQXJyYXkuZnJvbShjb3VudHMuZW50cmllcygpKVxuICAgICAgICAuc29ydCgoYSwgYikgPT4gYlsxXSAtIGFbMV0gfHwgYVswXS5sb2NhbGVDb21wYXJlKGJbMF0pKVxuICAgICAgICAuc2xpY2UoMCwgbGltaXQpXG4gICAgICAgIC5tYXAoKFt0b2tlbl0pID0+IHRva2VuKTtcbn1cbmZ1bmN0aW9uIGJ1aWxkS2V5d29yZFNldChqb2IpIHtcbiAgICBjb25zdCBrZXl3b3JkcyA9IFtcbiAgICAgICAgLi4uam9iLmtleXdvcmRzLFxuICAgICAgICAuLi5qb2IucmVxdWlyZW1lbnRzLmZsYXRNYXAodG9rZW5pemVLZXl3b3JkcyksXG4gICAgICAgIC4uLnRvcFRva2Vucyhqb2IuZGVzY3JpcHRpb24sIDEwKSxcbiAgICBdO1xuICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSBrZXl3b3Jkc1xuICAgICAgICAubWFwKChrZXl3b3JkKSA9PiBub3JtYWxpemVUZXh0KGtleXdvcmQpKVxuICAgICAgICAuZmlsdGVyKChrZXl3b3JkKSA9PiBrZXl3b3JkLmxlbmd0aCA+PSAyICYmICFTVE9QX1dPUkRTLmhhcyhrZXl3b3JkKSk7XG4gICAgcmV0dXJuIEFycmF5LmZyb20obmV3IFNldChub3JtYWxpemVkKSkuc2xpY2UoMCwgMjQpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHNjb3JlS2V5d29yZE1hdGNoKGlucHV0KSB7XG4gICAgaWYgKCFpbnB1dC5qb2IpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGtleTogXCJrZXl3b3JkTWF0Y2hcIixcbiAgICAgICAgICAgIGxhYmVsOiBcIktleXdvcmQgbWF0Y2hcIixcbiAgICAgICAgICAgIGVhcm5lZDogMTgsXG4gICAgICAgICAgICBtYXhQb2ludHM6IFNVQl9TQ09SRV9NQVhfUE9JTlRTLmtleXdvcmRNYXRjaCxcbiAgICAgICAgICAgIG5vdGVzOiBbXCJObyBqb2IgZGVzY3JpcHRpb24gc3VwcGxpZWQ7IG5ldXRyYWwgYmFzZWxpbmUuXCJdLFxuICAgICAgICAgICAgZXZpZGVuY2U6IFtcIk5vIGpvYiBkZXNjcmlwdGlvbiBzdXBwbGllZC5cIl0sXG4gICAgICAgIH07XG4gICAgfVxuICAgIGNvbnN0IGtleXdvcmRzID0gYnVpbGRLZXl3b3JkU2V0KGlucHV0LmpvYik7XG4gICAgaWYgKGtleXdvcmRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAga2V5OiBcImtleXdvcmRNYXRjaFwiLFxuICAgICAgICAgICAgbGFiZWw6IFwiS2V5d29yZCBtYXRjaFwiLFxuICAgICAgICAgICAgZWFybmVkOiAxOCxcbiAgICAgICAgICAgIG1heFBvaW50czogU1VCX1NDT1JFX01BWF9QT0lOVFMua2V5d29yZE1hdGNoLFxuICAgICAgICAgICAgbm90ZXM6IFtcIkpvYiBkZXNjcmlwdGlvbiBoYXMgbm8gdXNhYmxlIGtleXdvcmRzOyBuZXV0cmFsIGJhc2VsaW5lLlwiXSxcbiAgICAgICAgICAgIGV2aWRlbmNlOiBbXCIwIGtleXdvcmRzIGF2YWlsYWJsZS5cIl0sXG4gICAgICAgIH07XG4gICAgfVxuICAgIGNvbnN0IHJlc3VtZVRleHQgPSBub3JtYWxpemVUZXh0KGdldFJlc3VtZVRleHQoaW5wdXQucHJvZmlsZSwgaW5wdXQucmF3VGV4dCkpO1xuICAgIGxldCB3ZWlnaHRlZEhpdHMgPSAwO1xuICAgIGxldCBleGFjdEhpdHMgPSAwO1xuICAgIGxldCBzdHVmZmluZyA9IGZhbHNlO1xuICAgIGZvciAoY29uc3Qga2V5d29yZCBvZiBrZXl3b3Jkcykge1xuICAgICAgICBjb25zdCBmcmVxdWVuY3kgPSBjb3VudFdvcmRPY2N1cnJlbmNlcyhyZXN1bWVUZXh0LCBrZXl3b3JkKTtcbiAgICAgICAgaWYgKGZyZXF1ZW5jeSA+IDEwKVxuICAgICAgICAgICAgc3R1ZmZpbmcgPSB0cnVlO1xuICAgICAgICBpZiAoZnJlcXVlbmN5ID4gMCkge1xuICAgICAgICAgICAgd2VpZ2h0ZWRIaXRzICs9IDE7XG4gICAgICAgICAgICBleGFjdEhpdHMgKz0gMTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHN5bm9ueW1IaXQgPSBnZXRTeW5vbnltcyhrZXl3b3JkKS5zb21lKChzeW5vbnltKSA9PiBzeW5vbnltICE9PSBrZXl3b3JkICYmIGNvbnRhaW5zV29yZChyZXN1bWVUZXh0LCBzeW5vbnltKSk7XG4gICAgICAgIGlmIChzeW5vbnltSGl0KVxuICAgICAgICAgICAgd2VpZ2h0ZWRIaXRzICs9IFNZTk9OWU1fTUFUQ0hfV0VJR0hUO1xuICAgIH1cbiAgICBjb25zdCByYXdFYXJuZWQgPSBNYXRoLnJvdW5kKCh3ZWlnaHRlZEhpdHMgLyBrZXl3b3Jkcy5sZW5ndGgpICogU1VCX1NDT1JFX01BWF9QT0lOVFMua2V5d29yZE1hdGNoKTtcbiAgICBjb25zdCBlYXJuZWQgPSBNYXRoLm1heCgwLCByYXdFYXJuZWQgLSAoc3R1ZmZpbmcgPyAyIDogMCkpO1xuICAgIGNvbnN0IG5vdGVzID0gZXhhY3RIaXRzID09PSBrZXl3b3Jkcy5sZW5ndGhcbiAgICAgICAgPyBbXVxuICAgICAgICA6IFtcIkFkZCBuYXR1cmFsIG1lbnRpb25zIG9mIG1pc3NpbmcgdGFyZ2V0IGpvYiBrZXl3b3Jkcy5cIl07XG4gICAgaWYgKHN0dWZmaW5nKVxuICAgICAgICBub3Rlcy5wdXNoKFwiS2V5d29yZCBzdHVmZmluZyBkZXRlY3RlZDsgcmVwZWF0ZWQgdGVybXMgdG9vIG9mdGVuLlwiKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBrZXk6IFwia2V5d29yZE1hdGNoXCIsXG4gICAgICAgIGxhYmVsOiBcIktleXdvcmQgbWF0Y2hcIixcbiAgICAgICAgZWFybmVkLFxuICAgICAgICBtYXhQb2ludHM6IFNVQl9TQ09SRV9NQVhfUE9JTlRTLmtleXdvcmRNYXRjaCxcbiAgICAgICAgbm90ZXMsXG4gICAgICAgIGV2aWRlbmNlOiBbXG4gICAgICAgICAgICBgJHtleGFjdEhpdHN9LyR7a2V5d29yZHMubGVuZ3RofSBrZXl3b3JkcyBtYXRjaGVkYCxcbiAgICAgICAgICAgIGAke3dlaWdodGVkSGl0cy50b0ZpeGVkKDEpfS8ke2tleXdvcmRzLmxlbmd0aH0gd2VpZ2h0ZWQga2V5d29yZCBoaXRzYCxcbiAgICAgICAgXSxcbiAgICB9O1xufVxuIiwiaW1wb3J0IHsgU1VCX1NDT1JFX01BWF9QT0lOVFMgfSBmcm9tIFwiLi9jb25zdGFudHNcIjtcbmltcG9ydCB7IGdldFJlc3VtZVRleHQsIHdvcmRDb3VudCB9IGZyb20gXCIuL3RleHRcIjtcbmZ1bmN0aW9uIHBvaW50c0ZvcldvcmRDb3VudChjb3VudCkge1xuICAgIGlmIChjb3VudCA+PSA0MDAgJiYgY291bnQgPD0gNzAwKVxuICAgICAgICByZXR1cm4gMTA7XG4gICAgaWYgKChjb3VudCA+PSAzMDAgJiYgY291bnQgPD0gMzk5KSB8fCAoY291bnQgPj0gNzAxICYmIGNvdW50IDw9IDkwMCkpXG4gICAgICAgIHJldHVybiA3O1xuICAgIGlmICgoY291bnQgPj0gMjAwICYmIGNvdW50IDw9IDI5OSkgfHwgKGNvdW50ID49IDkwMSAmJiBjb3VudCA8PSAxMTAwKSlcbiAgICAgICAgcmV0dXJuIDQ7XG4gICAgaWYgKChjb3VudCA+PSAxNTAgJiYgY291bnQgPD0gMTk5KSB8fCAoY291bnQgPj0gMTEwMSAmJiBjb3VudCA8PSAxNDAwKSkge1xuICAgICAgICByZXR1cm4gMjtcbiAgICB9XG4gICAgcmV0dXJuIDA7XG59XG5leHBvcnQgZnVuY3Rpb24gc2NvcmVMZW5ndGgoaW5wdXQpIHtcbiAgICBjb25zdCBjb3VudCA9IHdvcmRDb3VudChnZXRSZXN1bWVUZXh0KGlucHV0LnByb2ZpbGUsIGlucHV0LnJhd1RleHQpKTtcbiAgICBjb25zdCBlYXJuZWQgPSBwb2ludHNGb3JXb3JkQ291bnQoY291bnQpO1xuICAgIGNvbnN0IG5vdGVzID0gZWFybmVkID09PSBTVUJfU0NPUkVfTUFYX1BPSU5UUy5sZW5ndGhcbiAgICAgICAgPyBbXVxuICAgICAgICA6IFtcIlJlc3VtZSBsZW5ndGggaXMgb3V0c2lkZSB0aGUgNDAwLTcwMCB3b3JkIHRhcmdldCBiYW5kLlwiXTtcbiAgICByZXR1cm4ge1xuICAgICAgICBrZXk6IFwibGVuZ3RoXCIsXG4gICAgICAgIGxhYmVsOiBcIkxlbmd0aFwiLFxuICAgICAgICBlYXJuZWQsXG4gICAgICAgIG1heFBvaW50czogU1VCX1NDT1JFX01BWF9QT0lOVFMubGVuZ3RoLFxuICAgICAgICBub3RlcyxcbiAgICAgICAgZXZpZGVuY2U6IFtgJHtjb3VudH0gd29yZHNgXSxcbiAgICB9O1xufVxuIiwiaW1wb3J0IHsgUVVBTlRJRklFRF9SRUdFWCwgU1VCX1NDT1JFX01BWF9QT0lOVFMgfSBmcm9tIFwiLi9jb25zdGFudHNcIjtcbmltcG9ydCB7IGdldEhpZ2hsaWdodHMgfSBmcm9tIFwiLi90ZXh0XCI7XG5mdW5jdGlvbiBwb2ludHNGb3JRdWFudGlmaWVkUmVzdWx0cyhjb3VudCkge1xuICAgIGlmIChjb3VudCA9PT0gMClcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgaWYgKGNvdW50ID09PSAxKVxuICAgICAgICByZXR1cm4gNjtcbiAgICBpZiAoY291bnQgPT09IDIpXG4gICAgICAgIHJldHVybiAxMjtcbiAgICBpZiAoY291bnQgPD0gNClcbiAgICAgICAgcmV0dXJuIDE2O1xuICAgIHJldHVybiAyMDtcbn1cbmV4cG9ydCBmdW5jdGlvbiBzY29yZVF1YW50aWZpZWRBY2hpZXZlbWVudHMoaW5wdXQpIHtcbiAgICBjb25zdCB0ZXh0ID0gZ2V0SGlnaGxpZ2h0cyhpbnB1dC5wcm9maWxlKS5qb2luKFwiXFxuXCIpO1xuICAgIGNvbnN0IG1hdGNoZXMgPSBBcnJheS5mcm9tKHRleHQubWF0Y2hBbGwoUVVBTlRJRklFRF9SRUdFWCksIChtYXRjaCkgPT4gbWF0Y2hbMF0pO1xuICAgIGNvbnN0IG5vdGVzID0gbWF0Y2hlcy5sZW5ndGggPT09IDBcbiAgICAgICAgPyBbXCJBZGQgbWV0cmljcyBzdWNoIGFzIHBlcmNlbnRhZ2VzLCB2b2x1bWUsIHRlYW0gc2l6ZSwgb3IgcmV2ZW51ZS5cIl1cbiAgICAgICAgOiBbXTtcbiAgICByZXR1cm4ge1xuICAgICAgICBrZXk6IFwicXVhbnRpZmllZEFjaGlldmVtZW50c1wiLFxuICAgICAgICBsYWJlbDogXCJRdWFudGlmaWVkIGFjaGlldmVtZW50c1wiLFxuICAgICAgICBlYXJuZWQ6IHBvaW50c0ZvclF1YW50aWZpZWRSZXN1bHRzKG1hdGNoZXMubGVuZ3RoKSxcbiAgICAgICAgbWF4UG9pbnRzOiBTVUJfU0NPUkVfTUFYX1BPSU5UUy5xdWFudGlmaWVkQWNoaWV2ZW1lbnRzLFxuICAgICAgICBub3RlcyxcbiAgICAgICAgZXZpZGVuY2U6IFtcbiAgICAgICAgICAgIGAke21hdGNoZXMubGVuZ3RofSBxdWFudGlmaWVkIHJlc3VsdChzKWAsXG4gICAgICAgICAgICAuLi5tYXRjaGVzLnNsaWNlKDAsIDMpLFxuICAgICAgICBdLFxuICAgIH07XG59XG4iLCJpbXBvcnQgeyBTVUJfU0NPUkVfTUFYX1BPSU5UUyB9IGZyb20gXCIuL2NvbnN0YW50c1wiO1xuZXhwb3J0IGZ1bmN0aW9uIHNjb3JlU2VjdGlvbkNvbXBsZXRlbmVzcyhpbnB1dCkge1xuICAgIGNvbnN0IHsgcHJvZmlsZSB9ID0gaW5wdXQ7XG4gICAgY29uc3Qgbm90ZXMgPSBbXTtcbiAgICBjb25zdCBldmlkZW5jZSA9IFtdO1xuICAgIGxldCBlYXJuZWQgPSAwO1xuICAgIGxldCBjb21wbGV0ZVNlY3Rpb25zID0gMDtcbiAgICBpZiAocHJvZmlsZS5jb250YWN0Lm5hbWU/LnRyaW0oKSkge1xuICAgICAgICBlYXJuZWQgKz0gMTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIG5vdGVzLnB1c2goXCJNaXNzaW5nIGNvbnRhY3QgbmFtZS5cIik7XG4gICAgfVxuICAgIGlmIChwcm9maWxlLmNvbnRhY3QuZW1haWw/LnRyaW0oKSkge1xuICAgICAgICBlYXJuZWQgKz0gMTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIG5vdGVzLnB1c2goXCJNaXNzaW5nIGNvbnRhY3QgZW1haWwuXCIpO1xuICAgIH1cbiAgICBjb25zdCBzdW1tYXJ5TGVuZ3RoID0gcHJvZmlsZS5zdW1tYXJ5Py50cmltKCkubGVuZ3RoID8/IDA7XG4gICAgaWYgKHN1bW1hcnlMZW5ndGggPj0gNTAgJiYgc3VtbWFyeUxlbmd0aCA8PSA1MDApIHtcbiAgICAgICAgZWFybmVkICs9IDE7XG4gICAgICAgIGNvbXBsZXRlU2VjdGlvbnMgKz0gMTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIG5vdGVzLnB1c2goXCJTdW1tYXJ5IHNob3VsZCBiZSBiZXR3ZWVuIDUwIGFuZCA1MDAgY2hhcmFjdGVycy5cIik7XG4gICAgfVxuICAgIGNvbnN0IGhhc0V4cGVyaWVuY2UgPSBwcm9maWxlLmV4cGVyaWVuY2VzLnNvbWUoKGV4cGVyaWVuY2UpID0+IGV4cGVyaWVuY2UudGl0bGUudHJpbSgpICYmXG4gICAgICAgIGV4cGVyaWVuY2UuY29tcGFueS50cmltKCkgJiZcbiAgICAgICAgZXhwZXJpZW5jZS5zdGFydERhdGUudHJpbSgpKTtcbiAgICBpZiAoaGFzRXhwZXJpZW5jZSkge1xuICAgICAgICBlYXJuZWQgKz0gMjtcbiAgICAgICAgY29tcGxldGVTZWN0aW9ucyArPSAxO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgbm90ZXMucHVzaChcIkFkZCBhdCBsZWFzdCBvbmUgcm9sZSB3aXRoIHRpdGxlLCBjb21wYW55LCBhbmQgc3RhcnQgZGF0ZS5cIik7XG4gICAgfVxuICAgIGlmIChwcm9maWxlLmVkdWNhdGlvbi5sZW5ndGggPiAwKSB7XG4gICAgICAgIGVhcm5lZCArPSAxO1xuICAgICAgICBjb21wbGV0ZVNlY3Rpb25zICs9IDE7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBub3Rlcy5wdXNoKFwiQWRkIGF0IGxlYXN0IG9uZSBlZHVjYXRpb24gZW50cnkuXCIpO1xuICAgIH1cbiAgICBpZiAocHJvZmlsZS5za2lsbHMubGVuZ3RoID49IDMpIHtcbiAgICAgICAgZWFybmVkICs9IDI7XG4gICAgICAgIGNvbXBsZXRlU2VjdGlvbnMgKz0gMTtcbiAgICB9XG4gICAgZWxzZSBpZiAocHJvZmlsZS5za2lsbHMubGVuZ3RoID4gMCkge1xuICAgICAgICBlYXJuZWQgKz0gMTtcbiAgICAgICAgbm90ZXMucHVzaChcIkFkZCBhdCBsZWFzdCB0aHJlZSBza2lsbHMuXCIpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgbm90ZXMucHVzaChcIkFkZCBhIHNraWxscyBzZWN0aW9uLlwiKTtcbiAgICB9XG4gICAgY29uc3QgaGFzSGlnaGxpZ2h0ID0gcHJvZmlsZS5leHBlcmllbmNlcy5zb21lKChleHBlcmllbmNlKSA9PiBleHBlcmllbmNlLmhpZ2hsaWdodHMubGVuZ3RoID4gMCk7XG4gICAgaWYgKGhhc0hpZ2hsaWdodCkge1xuICAgICAgICBlYXJuZWQgKz0gMTtcbiAgICAgICAgY29tcGxldGVTZWN0aW9ucyArPSAxO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgbm90ZXMucHVzaChcIkFkZCBhY2hpZXZlbWVudCBoaWdobGlnaHRzIHRvIGV4cGVyaWVuY2UuXCIpO1xuICAgIH1cbiAgICBjb25zdCBoYXNTZWNvbmRhcnlDb250YWN0ID0gQm9vbGVhbihwcm9maWxlLmNvbnRhY3QucGhvbmU/LnRyaW0oKSB8fFxuICAgICAgICBwcm9maWxlLmNvbnRhY3QubGlua2VkaW4/LnRyaW0oKSB8fFxuICAgICAgICBwcm9maWxlLmNvbnRhY3QubG9jYXRpb24/LnRyaW0oKSk7XG4gICAgaWYgKGhhc1NlY29uZGFyeUNvbnRhY3QpIHtcbiAgICAgICAgZWFybmVkICs9IDE7XG4gICAgICAgIGNvbXBsZXRlU2VjdGlvbnMgKz0gMTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIG5vdGVzLnB1c2goXCJBZGQgcGhvbmUsIExpbmtlZEluLCBvciBsb2NhdGlvbi5cIik7XG4gICAgfVxuICAgIGlmIChwcm9maWxlLmNvbnRhY3QubmFtZT8udHJpbSgpICYmIHByb2ZpbGUuY29udGFjdC5lbWFpbD8udHJpbSgpKSB7XG4gICAgICAgIGNvbXBsZXRlU2VjdGlvbnMgKz0gMTtcbiAgICB9XG4gICAgZXZpZGVuY2UucHVzaChgJHtjb21wbGV0ZVNlY3Rpb25zfS83IHNlY3Rpb25zIGNvbXBsZXRlYCk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAga2V5OiBcInNlY3Rpb25Db21wbGV0ZW5lc3NcIixcbiAgICAgICAgbGFiZWw6IFwiU2VjdGlvbiBjb21wbGV0ZW5lc3NcIixcbiAgICAgICAgZWFybmVkOiBNYXRoLm1pbihlYXJuZWQsIFNVQl9TQ09SRV9NQVhfUE9JTlRTLnNlY3Rpb25Db21wbGV0ZW5lc3MpLFxuICAgICAgICBtYXhQb2ludHM6IFNVQl9TQ09SRV9NQVhfUE9JTlRTLnNlY3Rpb25Db21wbGV0ZW5lc3MsXG4gICAgICAgIG5vdGVzLFxuICAgICAgICBldmlkZW5jZSxcbiAgICB9O1xufVxuIiwiaW1wb3J0IHsgQUNUSU9OX1ZFUkJTLCBTVUJfU0NPUkVfTUFYX1BPSU5UUyB9IGZyb20gXCIuL2NvbnN0YW50c1wiO1xuaW1wb3J0IHsgZ2V0SGlnaGxpZ2h0cywgbm9ybWFsaXplVGV4dCB9IGZyb20gXCIuL3RleHRcIjtcbmNvbnN0IFJFUEVBVEVEX1dPUkRfRVhDRVBUSU9OUyA9IG5ldyBTZXQoW1wiaGFkIGhhZFwiLCBcInRoYXQgdGhhdFwiXSk7XG5jb25zdCBBQ1JPTllNUyA9IG5ldyBTZXQoW1wiQVBJXCIsIFwiQVdTXCIsIFwiQ1NTXCIsIFwiR0NQXCIsIFwiSFRNTFwiLCBcIlNRTFwiXSk7XG5mdW5jdGlvbiBoYXNWZXJiTGlrZVRva2VuKHRleHQpIHtcbiAgICBjb25zdCB3b3JkcyA9IG5vcm1hbGl6ZVRleHQodGV4dCkuc3BsaXQoL1xccysvKS5maWx0ZXIoQm9vbGVhbik7XG4gICAgcmV0dXJuIHdvcmRzLnNvbWUoKHdvcmQpID0+IEFDVElPTl9WRVJCUy5pbmNsdWRlcyh3b3JkKSB8fFxuICAgICAgICAvKD86ZWR8aW5nfHMpJC8udGVzdCh3b3JkKSk7XG59XG5leHBvcnQgZnVuY3Rpb24gc2NvcmVTcGVsbGluZ0dyYW1tYXIoaW5wdXQpIHtcbiAgICBjb25zdCBoaWdobGlnaHRzID0gZ2V0SGlnaGxpZ2h0cyhpbnB1dC5wcm9maWxlKTtcbiAgICBjb25zdCB0ZXh0ID0gaGlnaGxpZ2h0cy5qb2luKFwiXFxuXCIpO1xuICAgIGNvbnN0IG5vdGVzID0gW107XG4gICAgY29uc3QgZXZpZGVuY2UgPSBbXTtcbiAgICBsZXQgZGVkdWN0aW9ucyA9IDA7XG4gICAgY29uc3QgcmVwZWF0ZWQgPSBBcnJheS5mcm9tKHRleHQubWF0Y2hBbGwoL1xcYihcXHcrKVxccytcXDFcXGIvZ2kpLCAobWF0Y2gpID0+IG1hdGNoWzBdKS5maWx0ZXIoKG1hdGNoKSA9PiAhUkVQRUFURURfV09SRF9FWENFUFRJT05TLmhhcyhtYXRjaC50b0xvd2VyQ2FzZSgpKSk7XG4gICAgaWYgKHJlcGVhdGVkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgcGVuYWx0eSA9IE1hdGgubWluKDIsIHJlcGVhdGVkLmxlbmd0aCk7XG4gICAgICAgIGRlZHVjdGlvbnMgKz0gcGVuYWx0eTtcbiAgICAgICAgbm90ZXMucHVzaChcIlJlcGVhdGVkIGFkamFjZW50IHdvcmRzIGRldGVjdGVkLlwiKTtcbiAgICAgICAgZXZpZGVuY2UucHVzaChgUmVwZWF0ZWQgd29yZDogJHtyZXBlYXRlZFswXX1gKTtcbiAgICB9XG4gICAgaWYgKC8gICsvLnRlc3QodGV4dCkpIHtcbiAgICAgICAgZGVkdWN0aW9ucyArPSAxO1xuICAgICAgICBub3Rlcy5wdXNoKFwiTXVsdGlwbGUgc3BhY2VzIGJldHdlZW4gd29yZHMgZGV0ZWN0ZWQuXCIpO1xuICAgICAgICBldmlkZW5jZS5wdXNoKFwiTXVsdGlwbGUgc3BhY2VzIGZvdW5kLlwiKTtcbiAgICB9XG4gICAgY29uc3QgbG93ZXJjYXNlU3RhcnRzID0gaGlnaGxpZ2h0cy5maWx0ZXIoKGhpZ2hsaWdodCkgPT4gL15bYS16XS8udGVzdChoaWdobGlnaHQudHJpbSgpKSk7XG4gICAgaWYgKGxvd2VyY2FzZVN0YXJ0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IHBlbmFsdHkgPSBNYXRoLm1pbigzLCBsb3dlcmNhc2VTdGFydHMubGVuZ3RoKTtcbiAgICAgICAgZGVkdWN0aW9ucyArPSBwZW5hbHR5O1xuICAgICAgICBub3Rlcy5wdXNoKFwiU29tZSBoaWdobGlnaHRzIHN0YXJ0IHdpdGggbG93ZXJjYXNlIGxldHRlcnMuXCIpO1xuICAgICAgICBldmlkZW5jZS5wdXNoKGBMb3dlcmNhc2Ugc3RhcnQ6ICR7bG93ZXJjYXNlU3RhcnRzWzBdfWApO1xuICAgIH1cbiAgICBjb25zdCBmcmFnbWVudHMgPSBoaWdobGlnaHRzLmZpbHRlcigoaGlnaGxpZ2h0KSA9PiBoaWdobGlnaHQubGVuZ3RoID4gNDAgJiYgIWhhc1ZlcmJMaWtlVG9rZW4oaGlnaGxpZ2h0KSk7XG4gICAgaWYgKGZyYWdtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IHBlbmFsdHkgPSBNYXRoLm1pbigyLCBmcmFnbWVudHMubGVuZ3RoKTtcbiAgICAgICAgZGVkdWN0aW9ucyArPSBwZW5hbHR5O1xuICAgICAgICBub3Rlcy5wdXNoKFwiU29tZSBsb25nIGhpZ2hsaWdodHMgbWF5IHJlYWQgbGlrZSBzZW50ZW5jZSBmcmFnbWVudHMuXCIpO1xuICAgICAgICBldmlkZW5jZS5wdXNoKGBQb3NzaWJsZSBmcmFnbWVudDogJHtmcmFnbWVudHNbMF19YCk7XG4gICAgfVxuICAgIGNvbnN0IHB1bmN0dWF0aW9uRW5kaW5ncyA9IGhpZ2hsaWdodHMuZmlsdGVyKChoaWdobGlnaHQpID0+IC9cXC4kLy50ZXN0KGhpZ2hsaWdodC50cmltKCkpKS5sZW5ndGg7XG4gICAgaWYgKGhpZ2hsaWdodHMubGVuZ3RoID4gMSkge1xuICAgICAgICBjb25zdCByYXRlID0gcHVuY3R1YXRpb25FbmRpbmdzIC8gaGlnaGxpZ2h0cy5sZW5ndGg7XG4gICAgICAgIGlmIChyYXRlID4gMC4zICYmIHJhdGUgPCAwLjcpIHtcbiAgICAgICAgICAgIGRlZHVjdGlvbnMgKz0gMTtcbiAgICAgICAgICAgIG5vdGVzLnB1c2goXCJUcmFpbGluZyBwdW5jdHVhdGlvbiBpcyBpbmNvbnNpc3RlbnQgYWNyb3NzIGhpZ2hsaWdodHMuXCIpO1xuICAgICAgICAgICAgZXZpZGVuY2UucHVzaChgJHtwdW5jdHVhdGlvbkVuZGluZ3N9LyR7aGlnaGxpZ2h0cy5sZW5ndGh9IGhpZ2hsaWdodHMgZW5kIHdpdGggcGVyaW9kcy5gKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBhbGxDYXBzID0gQXJyYXkuZnJvbSh0ZXh0Lm1hdGNoQWxsKC9cXGJbQS1aXXs0LH1cXGIvZyksIChtYXRjaCkgPT4gbWF0Y2hbMF0pLmZpbHRlcigod29yZCkgPT4gIUFDUk9OWU1TLmhhcyh3b3JkKSk7XG4gICAgaWYgKGFsbENhcHMubGVuZ3RoID4gNSkge1xuICAgICAgICBkZWR1Y3Rpb25zICs9IDE7XG4gICAgICAgIG5vdGVzLnB1c2goXCJFeGNlc3NpdmUgYWxsLWNhcHMgd29yZHMgZGV0ZWN0ZWQuXCIpO1xuICAgICAgICBldmlkZW5jZS5wdXNoKGBBbGwtY2FwcyB3b3JkczogJHthbGxDYXBzLnNsaWNlKDAsIDMpLmpvaW4oXCIsIFwiKX1gKTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAga2V5OiBcInNwZWxsaW5nR3JhbW1hclwiLFxuICAgICAgICBsYWJlbDogXCJTcGVsbGluZyBhbmQgZ3JhbW1hclwiLFxuICAgICAgICBlYXJuZWQ6IE1hdGgubWF4KDAsIFNVQl9TQ09SRV9NQVhfUE9JTlRTLnNwZWxsaW5nR3JhbW1hciAtIGRlZHVjdGlvbnMpLFxuICAgICAgICBtYXhQb2ludHM6IFNVQl9TQ09SRV9NQVhfUE9JTlRTLnNwZWxsaW5nR3JhbW1hcixcbiAgICAgICAgbm90ZXMsXG4gICAgICAgIGV2aWRlbmNlOiBldmlkZW5jZS5sZW5ndGggPiAwID8gZXZpZGVuY2UgOiBbXCJObyBoZXVyaXN0aWMgaXNzdWVzIGRldGVjdGVkLlwiXSxcbiAgICB9O1xufVxuIiwiaW1wb3J0IHsgbm93SXNvIH0gZnJvbSBcIi4uL2Zvcm1hdHRlcnNcIjtcbmltcG9ydCB7IHNjb3JlQWN0aW9uVmVyYnMgfSBmcm9tIFwiLi9hY3Rpb24tdmVyYnNcIjtcbmltcG9ydCB7IHNjb3JlQXRzRnJpZW5kbGluZXNzIH0gZnJvbSBcIi4vYXRzLWZyaWVuZGxpbmVzc1wiO1xuaW1wb3J0IHsgc2NvcmVLZXl3b3JkTWF0Y2ggfSBmcm9tIFwiLi9rZXl3b3JkLW1hdGNoXCI7XG5pbXBvcnQgeyBzY29yZUxlbmd0aCB9IGZyb20gXCIuL2xlbmd0aFwiO1xuaW1wb3J0IHsgc2NvcmVRdWFudGlmaWVkQWNoaWV2ZW1lbnRzIH0gZnJvbSBcIi4vcXVhbnRpZmllZC1hY2hpZXZlbWVudHNcIjtcbmltcG9ydCB7IHNjb3JlU2VjdGlvbkNvbXBsZXRlbmVzcyB9IGZyb20gXCIuL3NlY3Rpb24tY29tcGxldGVuZXNzXCI7XG5pbXBvcnQgeyBzY29yZVNwZWxsaW5nR3JhbW1hciB9IGZyb20gXCIuL3NwZWxsaW5nLWdyYW1tYXJcIjtcbmV4cG9ydCBmdW5jdGlvbiBzY29yZVJlc3VtZShpbnB1dCkge1xuICAgIGNvbnN0IHN1YlNjb3JlcyA9IHtcbiAgICAgICAgc2VjdGlvbkNvbXBsZXRlbmVzczogc2NvcmVTZWN0aW9uQ29tcGxldGVuZXNzKGlucHV0KSxcbiAgICAgICAgYWN0aW9uVmVyYnM6IHNjb3JlQWN0aW9uVmVyYnMoaW5wdXQpLFxuICAgICAgICBxdWFudGlmaWVkQWNoaWV2ZW1lbnRzOiBzY29yZVF1YW50aWZpZWRBY2hpZXZlbWVudHMoaW5wdXQpLFxuICAgICAgICBrZXl3b3JkTWF0Y2g6IHNjb3JlS2V5d29yZE1hdGNoKGlucHV0KSxcbiAgICAgICAgbGVuZ3RoOiBzY29yZUxlbmd0aChpbnB1dCksXG4gICAgICAgIHNwZWxsaW5nR3JhbW1hcjogc2NvcmVTcGVsbGluZ0dyYW1tYXIoaW5wdXQpLFxuICAgICAgICBhdHNGcmllbmRsaW5lc3M6IHNjb3JlQXRzRnJpZW5kbGluZXNzKGlucHV0KSxcbiAgICB9O1xuICAgIGNvbnN0IG92ZXJhbGwgPSBPYmplY3QudmFsdWVzKHN1YlNjb3JlcykucmVkdWNlKChzdW0sIHN1YlNjb3JlKSA9PiBzdW0gKyBzdWJTY29yZS5lYXJuZWQsIDApO1xuICAgIHJldHVybiB7XG4gICAgICAgIG92ZXJhbGw6IE1hdGgubWF4KDAsIE1hdGgubWluKDEwMCwgTWF0aC5yb3VuZChvdmVyYWxsKSkpLFxuICAgICAgICBzdWJTY29yZXMsXG4gICAgICAgIGdlbmVyYXRlZEF0OiBub3dJc28oKSxcbiAgICB9O1xufVxuZXhwb3J0IHsgc2NvcmVBY3Rpb25WZXJicyB9IGZyb20gXCIuL2FjdGlvbi12ZXJic1wiO1xuZXhwb3J0IHsgc2NvcmVBdHNGcmllbmRsaW5lc3MgfSBmcm9tIFwiLi9hdHMtZnJpZW5kbGluZXNzXCI7XG5leHBvcnQgeyBzY29yZUtleXdvcmRNYXRjaCB9IGZyb20gXCIuL2tleXdvcmQtbWF0Y2hcIjtcbmV4cG9ydCB7IHNjb3JlTGVuZ3RoIH0gZnJvbSBcIi4vbGVuZ3RoXCI7XG5leHBvcnQgeyBzY29yZVF1YW50aWZpZWRBY2hpZXZlbWVudHMgfSBmcm9tIFwiLi9xdWFudGlmaWVkLWFjaGlldmVtZW50c1wiO1xuZXhwb3J0IHsgc2NvcmVTZWN0aW9uQ29tcGxldGVuZXNzIH0gZnJvbSBcIi4vc2VjdGlvbi1jb21wbGV0ZW5lc3NcIjtcbmV4cG9ydCB7IHNjb3JlU3BlbGxpbmdHcmFtbWFyIH0gZnJvbSBcIi4vc3BlbGxpbmctZ3JhbW1hclwiO1xuIiwiLyoqXG4gKiBEZWVwLWxpbmsgVVJMIGJ1aWxkZXJzIGZvciB0aGUgcG9wdXAncyBwb3N0LWltcG9ydCBzdWNjZXNzIGJ1dHRvbnMgKCMzMSkuXG4gKlxuICogS2VwdCBpbiBpdHMgb3duIG1vZHVsZSBzbyB0aGUgVVJMIHNoYXBlIGlzIHVuaXQtdGVzdGFibGUgd2l0aG91dCBib290aW5nXG4gKiBSZWFjdC9qc2RvbS4gVGhlIHBvcHVwIGNvbXBvbmVudCBpbXBvcnRzIGJvdGggaGVscGVycyBhbmQgdGhyZWFkcyB0aGVcbiAqIGNvbmZpZ3VyZWQgYGFwaUJhc2VVcmxgIChmcm9tIEdFVF9BVVRIX1NUQVRVUykgdGhyb3VnaC5cbiAqL1xuLyoqXG4gKiBCdWlsZHMgdGhlIGRlZXAtbGluayB0byBhIHNpbmdsZSBvcHBvcnR1bml0eSdzIGRldGFpbCBwYWdlLlxuICpcbiAqIFRyYWlsaW5nIHNsYXNoZXMgb24gdGhlIGJhc2UgVVJMIGFyZSBzdHJpcHBlZCBzbyB3ZSBkb24ndCBwcm9kdWNlXG4gKiBgaHR0cDovL2xvY2FsaG9zdDozMDAwLy9vcHBvcnR1bml0aWVzLy4uLmAuIFRoZSBvcHBvcnR1bml0eSBpZCBpc1xuICogVVJJLWVuY29kZWQgZGVmZW5zaXZlbHkgZXZlbiB0aG91Z2ggc2VydmVyLXNpZGUgaWRzIGFyZSBzYWZlIHRvZGF5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gb3Bwb3J0dW5pdHlEZXRhaWxVcmwoYXBpQmFzZVVybCwgb3Bwb3J0dW5pdHlJZCkge1xuICAgIGNvbnN0IGJhc2UgPSBhcGlCYXNlVXJsLnJlcGxhY2UoL1xcLyskLywgXCJcIik7XG4gICAgcmV0dXJuIGAke2Jhc2V9L29wcG9ydHVuaXRpZXMvJHtlbmNvZGVVUklDb21wb25lbnQob3Bwb3J0dW5pdHlJZCl9YDtcbn1cbi8qKlxuICogQnVpbGRzIHRoZSBkZWVwLWxpbmsgdG8gdGhlIHJldmlldyBxdWV1ZSB1c2VkIGFmdGVyIGEgYnVsayBzY3JhcGUgaW1wb3J0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gb3Bwb3J0dW5pdHlSZXZpZXdVcmwoYXBpQmFzZVVybCkge1xuICAgIGNvbnN0IGJhc2UgPSBhcGlCYXNlVXJsLnJlcGxhY2UoL1xcLyskLywgXCJcIik7XG4gICAgcmV0dXJuIGAke2Jhc2V9L29wcG9ydHVuaXRpZXMvcmV2aWV3YDtcbn1cbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG5leHBvcnQgZnVuY3Rpb24gQnVsa1NvdXJjZUNhcmQocHJvcHMpIHtcbiAgICBjb25zdCB7IHNvdXJjZUxhYmVsLCBkZXRlY3RlZENvdW50LCBidXN5LCBwcm9ncmVzcywgbGFzdFJlc3VsdCwgbGFzdEVycm9yLCBvblNjcmFwZVZpc2libGUsIG9uU2NyYXBlUGFnaW5hdGVkLCBvbkNhbmNlbCwgb25WaWV3VHJhY2tlciwgfSA9IHByb3BzO1xuICAgIGNvbnN0IGRpc2FibGVkID0gYnVzeSAhPT0gbnVsbCB8fCBkZXRlY3RlZENvdW50ID09PSAwO1xuICAgIHJldHVybiAoX2pzeHMoXCJhcnRpY2xlXCIsIHsgY2xhc3NOYW1lOiBcImNhcmQgYnVsay1zb3VyY2VcIiwgXCJkYXRhLWJ1bGstc291cmNlXCI6IHNvdXJjZUxhYmVsLnRvTG93ZXJDYXNlKCksIGNoaWxkcmVuOiBbX2pzeHMoXCJoZWFkZXJcIiwgeyBjbGFzc05hbWU6IFwiYnVsay1zb3VyY2UtaGVhZFwiLCBjaGlsZHJlbjogW19qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcImNhcmQtdGl0bGVcIiwgY2hpbGRyZW46IHNvdXJjZUxhYmVsIH0pLCBfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwiYmFkZ2VcIiwgY2hpbGRyZW46IFtkZXRlY3RlZENvdW50LCBcIiByb3dcIiwgZGV0ZWN0ZWRDb3VudCA9PT0gMSA/IFwiXCIgOiBcInNcIl0gfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJidWxrLWFjdGlvbi1yb3dcIiwgY2hpbGRyZW46IFtfanN4KFwiYnV0dG9uXCIsIHsgY2xhc3NOYW1lOiBcImJ0biBwcmltYXJ5XCIsIG9uQ2xpY2s6IG9uU2NyYXBlVmlzaWJsZSwgZGlzYWJsZWQ6IGRpc2FibGVkLCBjaGlsZHJlbjogYnVzeSA9PT0gXCJ2aXNpYmxlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IFwiU2NyYXBpbmcgdmlzaWJsZeKAplwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBgU2NyYXBlICR7ZGV0ZWN0ZWRDb3VudH0gdmlzaWJsZWAgfSksIF9qc3goXCJidXR0b25cIiwgeyBjbGFzc05hbWU6IFwiYnRuXCIsIG9uQ2xpY2s6IG9uU2NyYXBlUGFnaW5hdGVkLCBkaXNhYmxlZDogZGlzYWJsZWQsIHRpdGxlOiBgV2Fsa3MgZXZlcnkgcGFnZSBpbiB5b3VyIGN1cnJlbnQgZmlsdGVyIHNldDsgY2FwcGVkIGF0IDIwMCBqb2JzLmAsIGNoaWxkcmVuOiBidXN5ID09PSBcInBhZ2luYXRlZFwiID8gXCJTY3JhcGluZyBhbGzigKZcIiA6IFwiU2NyYXBlIGFsbFwiIH0pXSB9KSwgYnVzeSAmJiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYnVsay1wcm9ncmVzc1wiLCBjaGlsZHJlbjogW19qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcImlubGluZS1ub3RlIGJ1bGstcHJvZ3Jlc3Mtc3VtbWFyeVwiLCBjaGlsZHJlbjogcHJvZ3Jlc3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IGZvcm1hdFByb2dyZXNzTGluZShidXN5LCBwcm9ncmVzcylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFwiU3RhcnRpbmfigKZcIiB9KSwgcHJvZ3Jlc3M/Lmxhc3RUaXRsZSAmJiAoX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwiaW5saW5lLW5vdGUgYnVsay1wcm9ncmVzcy10aXRsZSBjbGlwXCIsIHRpdGxlOiBwcm9ncmVzcy5sYXN0VGl0bGUsIGNoaWxkcmVuOiBwcm9ncmVzcy5sYXN0VGl0bGUgfSkpLCBvbkNhbmNlbCAmJiAoX2pzeChcImJ1dHRvblwiLCB7IGNsYXNzTmFtZTogXCJidG4gZ2hvc3QgdGlnaHQgYnVsay1wcm9ncmVzcy1zdG9wXCIsIG9uQ2xpY2s6IG9uQ2FuY2VsLCBjaGlsZHJlbjogXCJTdG9wXCIgfSkpXSB9KSksIGxhc3RSZXN1bHQgJiYgKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJ1bGstcmVzdWx0XCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJwXCIsIHsgY2xhc3NOYW1lOiBcImlubGluZS1ub3RlXCIsIGNoaWxkcmVuOiBbXCJJbXBvcnRlZCBcIiwgbGFzdFJlc3VsdC5pbXBvcnRlZCwgXCIvXCIsIGxhc3RSZXN1bHQuYXR0ZW1wdGVkLCBsYXN0UmVzdWx0LnBhZ2VzID4gMSAmJiBgIMK3ICR7bGFzdFJlc3VsdC5wYWdlc30gcGFnZXNgLCBsYXN0UmVzdWx0LmR1cGxpY2F0ZUNvdW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gYCDCtyAke2xhc3RSZXN1bHQuZHVwbGljYXRlQ291bnR9IGR1cGxpY2F0ZXNgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogXCJcIiwgbGFzdFJlc3VsdC5lcnJvcnMubGVuZ3RoID4gMCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgIMK3ICR7bGFzdFJlc3VsdC5lcnJvcnMubGVuZ3RofSBlcnJvcnNgXSB9KSwgbGFzdFJlc3VsdC5kZWR1cGVkSWRzPy5sZW5ndGggPyAoX2pzeHMoXCJwXCIsIHsgY2xhc3NOYW1lOiBcImlubGluZS1ub3RlIGJ1bGstZHVwbGljYXRlc1wiLCBjaGlsZHJlbjogW1wiRHVwbGljYXRlczogXCIsIGxhc3RSZXN1bHQuZGVkdXBlZElkcy5qb2luKFwiLCBcIildIH0pKSA6IG51bGwsIGxhc3RSZXN1bHQuaW1wb3J0ZWQgPiAwICYmIG9uVmlld1RyYWNrZXIgJiYgKF9qc3goXCJidXR0b25cIiwgeyBjbGFzc05hbWU6IFwic3VjY2Vzcy1saW5rXCIsIG9uQ2xpY2s6IG9uVmlld1RyYWNrZXIsIGNoaWxkcmVuOiBcIlZpZXcgdHJhY2tlciBcXHUyMTkyXCIgfSkpXSB9KSksIGxhc3RFcnJvciAmJiBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJpbmxpbmUtZXJyb3JcIiwgY2hpbGRyZW46IGxhc3RFcnJvciB9KV0gfSkpO1xufVxuLyoqXG4gKiBQcm9ncmVzcyBsYWJlbCBmb3JtYXQgZGVwZW5kcyBvbiB0aGUgc2NyYXBlIG1vZGU6XG4gKlxuICogLSBWaXNpYmxlOiBcIlNjcmFwZWQgTi90b3RhbFwiIOKAlCB0b3RhbCBpcyB0aGUgcm93IGNvdW50IG9uIHRoZSBwYWdlO1xuICogICBtZWFuaW5nZnVsIGRlbm9taW5hdG9yLlxuICogLSBQYWdpbmF0ZWQ6IFwiU2NyYXBlZCBOIMK3IHBhZ2UgWFwiIOKAlCBOIGlzIGN1bXVsYXRpdmUgYWNyb3NzIHBhZ2VzLFxuICogICB0b3RhbC1yb3dzLW9uLXBhZ2UgYmVsb25ncyB0byB0aGUgKmN1cnJlbnQqIHBhZ2Ugc28gc2hvd2luZ1xuICogICBcIlNjcmFwZWQgNTcvNTBcIiByZWFkcyBhcyBhIGJ1ZyAoXCJob3cgY2FuIHlvdSBzY3JhcGUgbW9yZSB0aGFuXG4gKiAgIHRoZXJlIGFyZT9cIikuIERyb3AgdGhlIGRlbm9taW5hdG9yIGFuZCBsZWFkIHdpdGggdGhlIHBhZ2UgaW5kZXhcbiAqICAgaW5zdGVhZC5cbiAqL1xuZnVuY3Rpb24gZm9ybWF0UHJvZ3Jlc3NMaW5lKG1vZGUsIHByb2dyZXNzKSB7XG4gICAgY29uc3QgZXJyb3JTdWZmaXggPSBwcm9ncmVzcy5lcnJvcnMubGVuZ3RoID4gMFxuICAgICAgICA/IGAgwrcgJHtwcm9ncmVzcy5lcnJvcnMubGVuZ3RofSBlcnJvciR7cHJvZ3Jlc3MuZXJyb3JzLmxlbmd0aCA9PT0gMSA/IFwiXCIgOiBcInNcIn1gXG4gICAgICAgIDogXCJcIjtcbiAgICBpZiAobW9kZSA9PT0gXCJwYWdpbmF0ZWRcIikge1xuICAgICAgICByZXR1cm4gYFNjcmFwZWQgJHtwcm9ncmVzcy5zY3JhcGVkQ291bnR9IMK3IHBhZ2UgJHtwcm9ncmVzcy5jdXJyZW50UGFnZX0ke2Vycm9yU3VmZml4fWA7XG4gICAgfVxuICAgIHJldHVybiBgU2NyYXBlZCAke3Byb2dyZXNzLnNjcmFwZWRDb3VudH0vJHtwcm9ncmVzcy50b3RhbFJvd3NPblBhZ2V9JHtlcnJvclN1ZmZpeH1gO1xufVxuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbmltcG9ydCB7IHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IGZvcm1hdFJlbGF0aXZlIH0gZnJvbSBcIkBzbG90aGluZy9zaGFyZWQvZm9ybWF0dGVyc1wiO1xuaW1wb3J0IHsgc2NvcmVSZXN1bWUgfSBmcm9tIFwiQHNsb3RoaW5nL3NoYXJlZC9zY29yaW5nXCI7XG5pbXBvcnQgeyBERUZBVUxUX0FQSV9CQVNFX1VSTCB9IGZyb20gXCJAL3NoYXJlZC90eXBlc1wiO1xuaW1wb3J0IHsgc2VuZE1lc3NhZ2UsIE1lc3NhZ2VzIH0gZnJvbSBcIkAvc2hhcmVkL21lc3NhZ2VzXCI7XG5pbXBvcnQgeyBtZXNzYWdlRm9yRXJyb3IgfSBmcm9tIFwiQC9zaGFyZWQvZXJyb3ItbWVzc2FnZXNcIjtcbmltcG9ydCB7IG9wcG9ydHVuaXR5UmV2aWV3VXJsIH0gZnJvbSBcIi4vZGVlcC1saW5rc1wiO1xuaW1wb3J0IHsgQnVsa1NvdXJjZUNhcmQsIH0gZnJvbSBcIi4vQnVsa1NvdXJjZUNhcmRcIjtcbmNvbnN0IEJVTEtfU09VUkNFX0xBQkVMUyA9IHtcbiAgICBncmVlbmhvdXNlOiBcIkdyZWVuaG91c2VcIixcbiAgICBsZXZlcjogXCJMZXZlclwiLFxuICAgIHdvcmtkYXk6IFwiV29ya2RheVwiLFxufTtcbmNvbnN0IEJVTEtfU09VUkNFX1VSTF9QQVRURVJOUyA9IHtcbiAgICBncmVlbmhvdXNlOiBbL2JvYXJkc1xcLmdyZWVuaG91c2VcXC5pb1xcLy8sIC9bXFx3LV0rXFwuZ3JlZW5ob3VzZVxcLmlvXFwvL10sXG4gICAgbGV2ZXI6IFsvam9ic1xcLmxldmVyXFwuY29cXC8vLCAvW1xcdy1dK1xcLmxldmVyXFwuY29cXC8vXSxcbiAgICB3b3JrZGF5OiBbL1xcLm15d29ya2RheWpvYnNcXC5jb21cXC8vLCAvXFwud29ya2RheWpvYnNcXC5jb21cXC8vXSxcbn07XG5jb25zdCBDT05URU5UX1NDUklQVF9VUkxfUEFUVEVSTlMgPSBbXG4gICAgL2xpbmtlZGluXFwuY29tXFwvLyxcbiAgICAvaW5kZWVkXFwuY29tXFwvLyxcbiAgICAvZ3JlZW5ob3VzZVxcLmlvXFwvLyxcbiAgICAvYm9hcmRzXFwuZ3JlZW5ob3VzZVxcLmlvXFwvLyxcbiAgICAvbGV2ZXJcXC5jb1xcLy8sXG4gICAgL2pvYnNcXC5sZXZlclxcLmNvXFwvLyxcbiAgICAvXFwvXFwvd2F0ZXJsb293b3Jrc1stLmEtejAtOV0qXFwudXdhdGVybG9vXFwuY2FcXC8vaSxcbiAgICAvd29ya2RheWpvYnNcXC5jb21cXC8vLFxuICAgIC9teXdvcmtkYXlqb2JzXFwuY29tXFwvLyxcbl07XG5jb25zdCBMSU5LRURJTl9KT0JTX1VSTF9QQVRURVJOID0gL2xpbmtlZGluXFwuY29tXFwvam9ic1xcLyg/OnZpZXd8c2VhcmNoLXJlc3VsdHN8c2VhcmNofGNvbGxlY3Rpb25zKS87XG5jb25zdCBMSU5LRURJTl9KT0JfUkVUUllfREVMQVlTX01TID0gWzYwMCwgMTQwMF07XG5jb25zdCBQQUdFX1BST0JFX1RJTUVPVVRfTVMgPSA0NTAwO1xuZnVuY3Rpb24gbWF0Y2hCdWxrU291cmNlKHVybCkge1xuICAgIGlmICghdXJsKVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhCVUxLX1NPVVJDRV9VUkxfUEFUVEVSTlMpKSB7XG4gICAgICAgIGlmIChCVUxLX1NPVVJDRV9VUkxfUEFUVEVSTlNba2V5XS5zb21lKChwKSA9PiBwLnRlc3QodXJsKSkpXG4gICAgICAgICAgICByZXR1cm4ga2V5O1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn1cbmZ1bmN0aW9uIGhhc0NvbnRlbnRTY3JpcHRIb3N0KHVybCkge1xuICAgIHJldHVybiAoISF1cmwgJiYgQ09OVEVOVF9TQ1JJUFRfVVJMX1BBVFRFUk5TLnNvbWUoKHBhdHRlcm4pID0+IHBhdHRlcm4udGVzdCh1cmwpKSk7XG59XG5mdW5jdGlvbiBpc0xpbmtlZEluSm9ic1VybCh1cmwpIHtcbiAgICByZXR1cm4gISF1cmwgJiYgTElOS0VESU5fSk9CU19VUkxfUEFUVEVSTi50ZXN0KHVybCk7XG59XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBBcHAoKSB7XG4gICAgY29uc3QgW3ZpZXdTdGF0ZSwgc2V0Vmlld1N0YXRlXSA9IHVzZVN0YXRlKFwibG9hZGluZ1wiKTtcbiAgICBjb25zdCBbcHJvZmlsZSwgc2V0UHJvZmlsZV0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbcGFnZVN0YXR1cywgc2V0UGFnZVN0YXR1c10gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbc3VyZmFjZUNvbnRleHQsIHNldFN1cmZhY2VDb250ZXh0XSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtsYXRlc3RSZXN1bWUsIHNldExhdGVzdFJlc3VtZV0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbYWN0aXZlVGFiSWQsIHNldEFjdGl2ZVRhYklkXSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFthY3RpdmVUYWJVcmwsIHNldEFjdGl2ZVRhYlVybF0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbcGFnZVByb2JlU3RhdGUsIHNldFBhZ2VQcm9iZVN0YXRlXSA9IHVzZVN0YXRlKFwiY2hlY2tpbmdcIik7XG4gICAgY29uc3QgW3BhZ2VTY2FuSW5GbGlnaHQsIHNldFBhZ2VTY2FuSW5GbGlnaHRdID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IFtwYWdlU2NhbkVycm9yLCBzZXRQYWdlU2NhbkVycm9yXSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgLy8gQ2FjaGVkIHNvIGRhc2hib2FyZC9yZXZpZXcgbGlua3MgY2FuIHJlbmRlciB3aXRob3V0IHF1ZXJ5aW5nXG4gICAgLy8gR0VUX0FVVEhfU1RBVFVTIGFnYWluLiBQb3B1bGF0ZWQgZnJvbSB0aGUgYXV0aC1zdGF0dXMgcmVzcG9uc2Ugb24gZmlyc3RcbiAgICAvLyBsb2FkIGFuZCBrZXB0IHN0YWJsZSBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBwb3B1cC5cbiAgICBjb25zdCBbYXBpQmFzZVVybCwgc2V0QXBpQmFzZVVybF0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbd3dTdGF0ZSwgc2V0V3dTdGF0ZV0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbd3dCdWxrSW5GbGlnaHQsIHNldFd3QnVsa0luRmxpZ2h0XSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFt3d0J1bGtSZXN1bHQsIHNldFd3QnVsa1Jlc3VsdF0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbd3dCdWxrRXJyb3IsIHNldFd3QnVsa0Vycm9yXSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFt3d0J1bGtQcm9ncmVzcywgc2V0V3dCdWxrUHJvZ3Jlc3NdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgLy8gUDMvIzM5IOKAlCBQZXItc291cmNlIHN0YXRlIGZvciBHcmVlbmhvdXNlIC8gTGV2ZXIgLyBXb3JrZGF5LiBLZXllZCBieVxuICAgIC8vIEJ1bGtTb3VyY2VLZXkgc28gYSBmdXR1cmUgc291cmNlIGlzIGEgb25lLWxpbmUgYWRkaXRpb24uXG4gICAgY29uc3QgW2J1bGtTdGF0ZXMsIHNldEJ1bGtTdGF0ZXNdID0gdXNlU3RhdGUoe30pO1xuICAgIGNvbnN0IFtidWxrSW5GbGlnaHQsIHNldEJ1bGtJbkZsaWdodF0gPSB1c2VTdGF0ZSh7fSk7XG4gICAgY29uc3QgW2J1bGtSZXN1bHRzLCBzZXRCdWxrUmVzdWx0c10gPSB1c2VTdGF0ZSh7fSk7XG4gICAgY29uc3QgW2J1bGtFcnJvcnMsIHNldEJ1bGtFcnJvcnNdID0gdXNlU3RhdGUoe30pO1xuICAgIGNvbnN0IFtjb25maXJtaW5nTG9nb3V0LCBzZXRDb25maXJtaW5nTG9nb3V0XSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCBwcm9maWxlU2NvcmUgPSBwcm9maWxlID8gc2NvcmVSZXN1bWUoeyBwcm9maWxlIH0pLm92ZXJhbGwgOiBudWxsO1xuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGNoZWNrQXV0aFN0YXR1cygpO1xuICAgICAgICBjaGVja1BhZ2VTdGF0dXMoKTtcbiAgICB9LCBbXSk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgY29uc3QgbGlzdGVuZXIgPSAobWVzc2FnZSkgPT4ge1xuICAgICAgICAgICAgaWYgKG1lc3NhZ2UudHlwZSA9PT0gXCJBVVRIX1NUQVRVU19DSEFOR0VEXCIpIHtcbiAgICAgICAgICAgICAgICB2b2lkIGNoZWNrQXV0aFN0YXR1cygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG1lc3NhZ2UudHlwZSA9PT0gXCJXV19CVUxLX1BST0dSRVNTX0ZBTk9VVFwiICYmIG1lc3NhZ2UucGF5bG9hZCkge1xuICAgICAgICAgICAgICAgIC8vIFRoZSBiYWNrZ3JvdW5kIHJlLWJyb2FkY2FzdHMgZXZlcnkgcHJvZ3Jlc3MgZXZlbnQgdGhlIGNvbnRlbnRcbiAgICAgICAgICAgICAgICAvLyBzY3JpcHQgZW1pdHRlZC4gU3Rhc2ggaXQgc28gdGhlIGJ1bGsgY2FyZCBjYW4gcmVuZGVyIGxpdmUgY291bnRzO1xuICAgICAgICAgICAgICAgIC8vIGNsZWFyIG9uIHRoZSB0ZXJtaW5hbCBgZG9uZWAgZXZlbnQgc28gdGhlIGNhcmQgZmxpcHMgYmFjayB0byBpdHNcbiAgICAgICAgICAgICAgICAvLyBpZGxlIC8gcmVzdWx0IHN0YXRlLlxuICAgICAgICAgICAgICAgIGlmIChtZXNzYWdlLnBheWxvYWQuZG9uZSkge1xuICAgICAgICAgICAgICAgICAgICBzZXRXd0J1bGtQcm9ncmVzcyhudWxsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHNldFd3QnVsa1Byb2dyZXNzKG1lc3NhZ2UucGF5bG9hZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIobGlzdGVuZXIpO1xuICAgICAgICByZXR1cm4gKCkgPT4gY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLnJlbW92ZUxpc3RlbmVyKGxpc3RlbmVyKTtcbiAgICB9LCBbXSk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG4gICAgLy8gT24gbW91bnQsIGFzayB0aGUgYmFja2dyb3VuZCBmb3IgdGhlIGxhdGVzdCBidWxrLXNjcmFwZSBzbmFwc2hvdCBzbyBhXG4gICAgLy8gcG9wdXAgcmVvcGVuZWQgbWlkLXNjcmFwZSByZWh5ZHJhdGVzIGl0cyBwcm9ncmVzcyBVSSBpbnN0ZWFkIG9mIGxvb2tpbmdcbiAgICAvLyBpZGxlLlxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGxldCBjYW5jZWxsZWQgPSBmYWxzZTtcbiAgICAgICAgKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzcCA9IGF3YWl0IHNlbmRNZXNzYWdlKHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJHRVRfQlVMS19QUk9HUkVTU1wiLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmICghY2FuY2VsbGVkICYmIHJlc3Auc3VjY2VzcyAmJiByZXNwLmRhdGE/Lnd3KSB7XG4gICAgICAgICAgICAgICAgICAgIHNldFd3QnVsa1Byb2dyZXNzKHJlc3AuZGF0YS53dyk7XG4gICAgICAgICAgICAgICAgICAgIHNldFd3QnVsa0luRmxpZ2h0KChyZXNwLmRhdGEud3cuY3VycmVudFBhZ2UgPz8gMSkgPiAxID8gXCJwYWdpbmF0ZWRcIiA6IFwidmlzaWJsZVwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCB7XG4gICAgICAgICAgICAgICAgLy8gYmVzdC1lZmZvcnQ7IG1pc3Npbmcgc25hcHNob3QganVzdCBtZWFucyBubyBzY3JhcGUgaW4gZmxpZ2h0XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKCk7XG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICBjYW5jZWxsZWQgPSB0cnVlO1xuICAgICAgICB9O1xuICAgIH0sIFtdKTtcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBpZiAodmlld1N0YXRlICE9PSBcInNlc3Npb24tbG9zdFwiKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBjb25zdCBpbnRlcnZhbElkID0gd2luZG93LnNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgIHZvaWQgY2hlY2tBdXRoU3RhdHVzKCk7XG4gICAgICAgIH0sIDEwMDApO1xuICAgICAgICByZXR1cm4gKCkgPT4gd2luZG93LmNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZCk7XG4gICAgfSwgW3ZpZXdTdGF0ZV0pOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHJlYWN0LWhvb2tzL2V4aGF1c3RpdmUtZGVwc1xuICAgIGFzeW5jIGZ1bmN0aW9uIGNoZWNrQXV0aFN0YXR1cygpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgc2VuZE1lc3NhZ2UoTWVzc2FnZXMuZ2V0QXV0aFN0YXR1cygpKTtcbiAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdWNjZXNzICYmIHJlc3BvbnNlLmRhdGEpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB7IGlzQXV0aGVudGljYXRlZCwgc2Vzc2lvbkxvc3QsIGFwaUJhc2VVcmw6IHVybCwgfSA9IHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICAgICAgaWYgKHVybClcbiAgICAgICAgICAgICAgICAgICAgc2V0QXBpQmFzZVVybCh1cmwpO1xuICAgICAgICAgICAgICAgIGlmIChpc0F1dGhlbnRpY2F0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0Vmlld1N0YXRlKFwiYXV0aGVudGljYXRlZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgbG9hZFByb2ZpbGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoc2Vzc2lvbkxvc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0Vmlld1N0YXRlKFwic2Vzc2lvbi1sb3N0XCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0Vmlld1N0YXRlKFwidW5hdXRoZW50aWNhdGVkXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHNldFZpZXdTdGF0ZShcInVuYXV0aGVudGljYXRlZFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBzZXRFcnJvcihlcnIubWVzc2FnZSk7XG4gICAgICAgICAgICBzZXRWaWV3U3RhdGUoXCJlcnJvclwiKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBhc3luYyBmdW5jdGlvbiBsb2FkUHJvZmlsZSgpIHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBzZW5kTWVzc2FnZShNZXNzYWdlcy5nZXRQcm9maWxlKCkpO1xuICAgICAgICBpZiAocmVzcG9uc2Uuc3VjY2VzcyAmJiByZXNwb25zZS5kYXRhKSB7XG4gICAgICAgICAgICBzZXRQcm9maWxlKHJlc3BvbnNlLmRhdGEpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGFzeW5jIGZ1bmN0aW9uIGNoZWNrUGFnZVN0YXR1cyhhdHRlbXB0ID0gMCkge1xuICAgICAgICBpZiAoYXR0ZW1wdCA9PT0gMClcbiAgICAgICAgICAgIHNldFBhZ2VQcm9iZVN0YXRlKFwiY2hlY2tpbmdcIik7XG4gICAgICAgIGNvbnN0IFt0YWJdID0gYXdhaXQgY2hyb21lLnRhYnMucXVlcnkoe1xuICAgICAgICAgICAgYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgY3VycmVudFdpbmRvdzogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICh0YWI/LmlkKSB7XG4gICAgICAgICAgICBzZXRBY3RpdmVUYWJJZCh0YWIuaWQpO1xuICAgICAgICAgICAgc2V0QWN0aXZlVGFiVXJsKHRhYi51cmwgfHwgbnVsbCk7XG4gICAgICAgICAgICBsZXQgd2F0ZXJsb29Xb3Jrc0xpc3REZXRlY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKGlzV2F0ZXJsb29Xb3Jrc1VybCh0YWIudXJsKSkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHIgPSBhd2FpdCBzZW5kVGFiTWVzc2FnZVdpdGhUaW1lb3V0KHRhYi5pZCwgTWVzc2FnZXMud3dHZXRQYWdlU3RhdGUoKSwgUEFHRV9QUk9CRV9USU1FT1VUX01TKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHI/LnN1Y2Nlc3MgJiYgci5kYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRXd1N0YXRlKHIuZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoci5kYXRhLmtpbmQgPT09IFwibGlzdFwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0ZXJsb29Xb3Jrc0xpc3REZXRlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0UGFnZVByb2JlU3RhdGUoXCJyZWFkeVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCB7XG4gICAgICAgICAgICAgICAgICAgIHNldFd3U3RhdGUobnVsbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgc2V0V3dTdGF0ZShudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBzZW5kVGFiTWVzc2FnZVdpdGhUaW1lb3V0KHRhYi5pZCwgTWVzc2FnZXMuZ2V0U3VyZmFjZUNvbnRleHQoKSwgUEFHRV9QUk9CRV9USU1FT1VUX01TKTtcbiAgICAgICAgICAgICAgICBjb25zdCBjb250ZXh0ID0gKHJlc3BvbnNlID8/IG51bGwpO1xuICAgICAgICAgICAgICAgIGlmIChjb250ZXh0Py5wYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgIHNldFN1cmZhY2VDb250ZXh0KGNvbnRleHQpO1xuICAgICAgICAgICAgICAgICAgICBzZXRQYWdlU3RhdHVzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhc0Zvcm06IGNvbnRleHQucGFnZS5oYXNBcHBsaWNhdGlvbkZvcm0sXG4gICAgICAgICAgICAgICAgICAgICAgICBoYXNKb2JMaXN0aW5nOiBjb250ZXh0LnBhZ2Uuam9iICE9PSBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGV0ZWN0ZWRGaWVsZHM6IGNvbnRleHQucGFnZS5kZXRlY3RlZEZpZWxkQ291bnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXRlY3RlZFVwbG9hZENvdW50OiBjb250ZXh0LnBhZ2UuZGV0ZWN0ZWRVcGxvYWRDb3VudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50VXBsb2FkczogY29udGV4dC5wYWdlLmRvY3VtZW50VXBsb2FkcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjcmFwZWRKb2I6IGNvbnRleHQucGFnZS5qb2IsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29udGV4dC5wYWdlLmRldGVjdGVkVXBsb2FkQ291bnQgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2b2lkIGxvYWRMYXRlc3RSZXN1bWUoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldExhdGVzdFJlc3VtZShudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBzZXRQYWdlUHJvYmVTdGF0ZShcInJlYWR5XCIpO1xuICAgICAgICAgICAgICAgICAgICBzZXRQYWdlU2NhbkVycm9yKG51bGwpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWNvbnRleHQucGFnZS5qb2IgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzTGlua2VkSW5Kb2JzVXJsKHRhYi51cmwpICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBhdHRlbXB0IDwgTElOS0VESU5fSk9CX1JFVFJZX0RFTEFZU19NUy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2b2lkIGNoZWNrUGFnZVN0YXR1cyhhdHRlbXB0ICsgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBMSU5LRURJTl9KT0JfUkVUUllfREVMQVlTX01TW2F0dGVtcHRdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICh3YXRlcmxvb1dvcmtzTGlzdERldGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFN1cmZhY2UgY29udGV4dCBjYW1lIGJhY2sgZW1wdHkgYnV0IHRoZSBXVyByb3cgcHJvYmUgYWxyZWFkeVxuICAgICAgICAgICAgICAgICAgICAvLyB0b2xkIHVzIHRoaXMgaXMgYSBsaXN0IHBhZ2Ug4oCUIGtlZXAgc3RhdGUgYXQgXCJyZWFkeVwiIHNvIHRoZSBidWxrXG4gICAgICAgICAgICAgICAgICAgIC8vIGNhcmQgcmVuZGVycy5cbiAgICAgICAgICAgICAgICAgICAgc2V0UGFnZVByb2JlU3RhdGUoXCJyZWFkeVwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE5vIHVzYWJsZSBzdXJmYWNlIGFuZCBubyBwb3NpdGl2ZSBXVyBzaWduYWw6IGZvcmNlLXJlc29sdmUgc28gdGhlXG4gICAgICAgICAgICAgICAgICAgIC8vIHBvcHVwIG5ldmVyIHN0YXlzIGluIHRoZSBcImNoZWNraW5nXCIgaWRsZSBzdGF0ZSBmb3JldmVyLlxuICAgICAgICAgICAgICAgICAgICBzZXRQYWdlUHJvYmVTdGF0ZSghdGFiLnVybCB8fCBoYXNDb250ZW50U2NyaXB0SG9zdCh0YWIudXJsKVxuICAgICAgICAgICAgICAgICAgICAgICAgPyBcIm5lZWRzLXJlZnJlc2hcIlxuICAgICAgICAgICAgICAgICAgICAgICAgOiBcInVua25vd25cIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2gge1xuICAgICAgICAgICAgICAgIGlmICh3YXRlcmxvb1dvcmtzTGlzdERldGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHNldFBhZ2VQcm9iZVN0YXRlKFwicmVhZHlcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzZXRQYWdlUHJvYmVTdGF0ZSghdGFiLnVybCB8fCBoYXNDb250ZW50U2NyaXB0SG9zdCh0YWIudXJsKVxuICAgICAgICAgICAgICAgICAgICAgICAgPyBcIm5lZWRzLXJlZnJlc2hcIlxuICAgICAgICAgICAgICAgICAgICAgICAgOiBcInVua25vd25cIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gUDMvIzM5IOKAlCBwcm9iZSBHcmVlbmhvdXNlL0xldmVyL1dvcmtkYXkgbGlzdGluZyBwYWdlcy4gT25seSBvbmVcbiAgICAgICAgICAgIC8vIG1hdGNoZXIgZmlyZXMgcGVyIHZpc2l0ICh0aGUgdXNlciBpcyBvbiBhIHNpbmdsZSBob3N0KS5cbiAgICAgICAgICAgIGNvbnN0IGJ1bGtLZXkgPSBtYXRjaEJ1bGtTb3VyY2UodGFiLnVybCk7XG4gICAgICAgICAgICBpZiAoYnVsa0tleSkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2VUeXBlID0gYnVsa1BhZ2VTdGF0ZU1lc3NhZ2UoYnVsa0tleSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHIgPSBhd2FpdCBzZW5kVGFiTWVzc2FnZVdpdGhUaW1lb3V0KHRhYi5pZCwgeyB0eXBlOiBtZXNzYWdlVHlwZSB9LCBQQUdFX1BST0JFX1RJTUVPVVRfTVMpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocj8uc3VjY2VzcyAmJiByLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldEJ1bGtTdGF0ZXMoKHByZXYpID0+ICh7IC4uLnByZXYsIFtidWxrS2V5XTogci5kYXRhIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCB7XG4gICAgICAgICAgICAgICAgICAgIC8vIENvbnRlbnQgc2NyaXB0IG5vdCB5ZXQgbG9hZGVkXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgc2V0QWN0aXZlVGFiSWQobnVsbCk7XG4gICAgICAgICAgICBzZXRBY3RpdmVUYWJVcmwobnVsbCk7XG4gICAgICAgICAgICBzZXRQYWdlUHJvYmVTdGF0ZShcInVua25vd25cIik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gYnVsa1BhZ2VTdGF0ZU1lc3NhZ2Uoa2V5KSB7XG4gICAgICAgIHJldHVybiBgQlVMS18ke2tleS50b1VwcGVyQ2FzZSgpfV9HRVRfUEFHRV9TVEFURWA7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGJ1bGtTY3JhcGVNZXNzYWdlKGtleSwgbW9kZSkge1xuICAgICAgICBjb25zdCBzdWZmaXggPSBtb2RlID09PSBcInZpc2libGVcIiA/IFwiU0NSQVBFX1ZJU0lCTEVcIiA6IFwiU0NSQVBFX1BBR0lOQVRFRFwiO1xuICAgICAgICByZXR1cm4gYEJVTEtfJHtrZXkudG9VcHBlckNhc2UoKX1fJHtzdWZmaXh9YDtcbiAgICB9XG4gICAgYXN5bmMgZnVuY3Rpb24gaGFuZGxlQnVsa1NvdXJjZVNjcmFwZShrZXksIG1vZGUpIHtcbiAgICAgICAgc2V0QnVsa0luRmxpZ2h0KChwcmV2KSA9PiAoeyAuLi5wcmV2LCBba2V5XTogbW9kZSB9KSk7XG4gICAgICAgIHNldEJ1bGtFcnJvcnMoKHByZXYpID0+ICh7IC4uLnByZXYsIFtrZXldOiB1bmRlZmluZWQgfSkpO1xuICAgICAgICBzZXRCdWxrUmVzdWx0cygocHJldikgPT4gKHsgLi4ucHJldiwgW2tleV06IHVuZGVmaW5lZCB9KSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBbdGFiXSA9IGF3YWl0IGNocm9tZS50YWJzLnF1ZXJ5KHtcbiAgICAgICAgICAgICAgICBhY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgbGFzdEZvY3VzZWRXaW5kb3c6IHRydWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmICghdGFiPy5pZClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBhY3RpdmUgdGFiXCIpO1xuICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9IHsgdHlwZTogYnVsa1NjcmFwZU1lc3NhZ2Uoa2V5LCBtb2RlKSwgcGF5bG9hZDoge30gfTtcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UodGFiLmlkLCBtZXNzYWdlKTtcbiAgICAgICAgICAgIGlmIChyZXNwb25zZT8uc3VjY2VzcyAmJiByZXNwb25zZS5kYXRhKSB7XG4gICAgICAgICAgICAgICAgc2V0QnVsa1Jlc3VsdHMoKHByZXYpID0+ICh7IC4uLnByZXYsIFtrZXldOiByZXNwb25zZS5kYXRhIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHNldEJ1bGtFcnJvcnMoKHByZXYpID0+ICh7XG4gICAgICAgICAgICAgICAgICAgIC4uLnByZXYsXG4gICAgICAgICAgICAgICAgICAgIFtrZXldOiBtZXNzYWdlRm9yRXJyb3IobmV3IEVycm9yKHJlc3BvbnNlPy5lcnJvciB8fCBcIkJ1bGsgc2NyYXBlIGZhaWxlZFwiKSksXG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHNldEJ1bGtFcnJvcnMoKHByZXYpID0+ICh7IC4uLnByZXYsIFtrZXldOiBtZXNzYWdlRm9yRXJyb3IoZXJyKSB9KSk7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICBzZXRCdWxrSW5GbGlnaHQoKHByZXYpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXh0ID0geyAuLi5wcmV2IH07XG4gICAgICAgICAgICAgICAgZGVsZXRlIG5leHRba2V5XTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIGFzeW5jIGZ1bmN0aW9uIGhhbmRsZVd3QnVsa1NjcmFwZShtb2RlKSB7XG4gICAgICAgIHNldFd3QnVsa0luRmxpZ2h0KG1vZGUpO1xuICAgICAgICBzZXRXd0J1bGtFcnJvcihudWxsKTtcbiAgICAgICAgc2V0V3dCdWxrUmVzdWx0KG51bGwpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgW3RhYl0gPSBhd2FpdCBjaHJvbWUudGFicy5xdWVyeSh7XG4gICAgICAgICAgICAgICAgYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGxhc3RGb2N1c2VkV2luZG93OiB0cnVlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoIXRhYj8uaWQpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gYWN0aXZlIHRhYlwiKTtcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBtb2RlID09PSBcInZpc2libGVcIlxuICAgICAgICAgICAgICAgID8gTWVzc2FnZXMud3dTY3JhcGVBbGxWaXNpYmxlKClcbiAgICAgICAgICAgICAgICA6IE1lc3NhZ2VzLnd3U2NyYXBlQWxsUGFnaW5hdGVkKCk7XG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYi5pZCwgbWVzc2FnZSk7XG4gICAgICAgICAgICBpZiAocmVzcG9uc2U/LnN1Y2Nlc3MgJiYgcmVzcG9uc2UuZGF0YSkge1xuICAgICAgICAgICAgICAgIHNldFd3QnVsa1Jlc3VsdChyZXNwb25zZS5kYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHNldFd3QnVsa0Vycm9yKG1lc3NhZ2VGb3JFcnJvcihuZXcgRXJyb3IocmVzcG9uc2U/LmVycm9yIHx8IFwiQnVsayBzY3JhcGUgZmFpbGVkXCIpKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgc2V0V3dCdWxrRXJyb3IobWVzc2FnZUZvckVycm9yKGVycikpO1xuICAgICAgICB9XG4gICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgc2V0V3dCdWxrSW5GbGlnaHQobnVsbCk7XG4gICAgICAgICAgICBzZXRXd0J1bGtQcm9ncmVzcyhudWxsKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBhc3luYyBmdW5jdGlvbiBoYW5kbGVXd0J1bGtDYW5jZWwoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBbdGFiXSA9IGF3YWl0IGNocm9tZS50YWJzLnF1ZXJ5KHtcbiAgICAgICAgICAgICAgICBhY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgbGFzdEZvY3VzZWRXaW5kb3c6IHRydWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmICghdGFiPy5pZClcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAvLyBUaGUgY29udGVudCBzY3JpcHQgaG9sZHMgdGhlIEFib3J0Q29udHJvbGxlcjsgdGhpcyBqdXN0IHRyaXBzIGl0LlxuICAgICAgICAgICAgLy8gVGhlIGluLWZsaWdodCBoYW5kbGVXd0J1bGtTY3JhcGUncyBgYXdhaXQgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2VgXG4gICAgICAgICAgICAvLyB3aWxsIHJlc29sdmUgbm9ybWFsbHkgd2l0aCB3aGF0ZXZlciBwYXJ0aWFsIHJlc3VsdCB3YXMgY29sbGVjdGVkLlxuICAgICAgICAgICAgYXdhaXQgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UodGFiLmlkLCB7IHR5cGU6IFwiV1dfQlVMS19DQU5DRUxcIiB9KTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCB7XG4gICAgICAgICAgICAvLyBiZXN0LWVmZm9ydFxuICAgICAgICB9XG4gICAgfVxuICAgIGFzeW5jIGZ1bmN0aW9uIGhhbmRsZUNvbm5lY3QoKSB7XG4gICAgICAgIHNldEVycm9yKG51bGwpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBzZW5kTWVzc2FnZShNZXNzYWdlcy5vcGVuQXV0aCgpKTtcbiAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgd2luZG93LmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2V0RXJyb3IobWVzc2FnZUZvckVycm9yKG5ldyBFcnJvcihyZXNwb25zZS5lcnJvciB8fCBcIkZhaWxlZCB0byBvcGVuXCIpKSk7XG4gICAgICAgICAgICBzZXRWaWV3U3RhdGUoXCJlcnJvclwiKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBzZXRFcnJvcihtZXNzYWdlRm9yRXJyb3IoZXJyKSk7XG4gICAgICAgICAgICBzZXRWaWV3U3RhdGUoXCJlcnJvclwiKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBhc3luYyBmdW5jdGlvbiBoYW5kbGVMb2dvdXQoKSB7XG4gICAgICAgIGlmICghY29uZmlybWluZ0xvZ291dCkge1xuICAgICAgICAgICAgc2V0Q29uZmlybWluZ0xvZ291dCh0cnVlKTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gc2V0Q29uZmlybWluZ0xvZ291dChmYWxzZSksIDQwMDApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGF3YWl0IHNlbmRNZXNzYWdlKE1lc3NhZ2VzLmxvZ291dCgpKTtcbiAgICAgICAgc2V0Vmlld1N0YXRlKFwidW5hdXRoZW50aWNhdGVkXCIpO1xuICAgICAgICBzZXRQcm9maWxlKG51bGwpO1xuICAgICAgICBzZXRDb25maXJtaW5nTG9nb3V0KGZhbHNlKTtcbiAgICB9XG4gICAgYXN5bmMgZnVuY3Rpb24gaGFuZGxlT3BlbkRhc2hib2FyZCgpIHtcbiAgICAgICAgY29uc3QgYmFzZVVybCA9IGF3YWl0IHJlc29sdmVBcGlCYXNlVXJsKCk7XG4gICAgICAgIGNocm9tZS50YWJzLmNyZWF0ZSh7IHVybDogYCR7YmFzZVVybH0vZGFzaGJvYXJkYCB9KTtcbiAgICAgICAgd2luZG93LmNsb3NlKCk7XG4gICAgfVxuICAgIGFzeW5jIGZ1bmN0aW9uIGxvYWRMYXRlc3RSZXN1bWUoKSB7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgc2VuZE1lc3NhZ2UoTWVzc2FnZXMubGlzdFJlc3VtZXMoKSk7XG4gICAgICAgIGlmIChyZXNwb25zZS5zdWNjZXNzKSB7XG4gICAgICAgICAgICBzZXRMYXRlc3RSZXN1bWUocmVzcG9uc2UuZGF0YT8uWzBdID8/IG51bGwpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGFzeW5jIGZ1bmN0aW9uIGhhbmRsZU9wZW5TdHVkaW9Gb3JSZXN1bWUoKSB7XG4gICAgICAgIGNvbnN0IGJhc2VVcmwgPSBhd2FpdCByZXNvbHZlQXBpQmFzZVVybCgpO1xuICAgICAgICBjb25zdCByZXN1bWVQYXJhbSA9IGxhdGVzdFJlc3VtZVxuICAgICAgICAgICAgPyBgP2Zyb209ZXh0ZW5zaW9uJnRhaWxvcklkPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGxhdGVzdFJlc3VtZS5pZCl9YFxuICAgICAgICAgICAgOiBcIlwiO1xuICAgICAgICBjaHJvbWUudGFicy5jcmVhdGUoeyB1cmw6IGAke2Jhc2VVcmx9L2VuL3N0dWRpbyR7cmVzdW1lUGFyYW19YCB9KTtcbiAgICAgICAgd2luZG93LmNsb3NlKCk7XG4gICAgfVxuICAgIGFzeW5jIGZ1bmN0aW9uIGhhbmRsZVNob3dQYW5lbCgpIHtcbiAgICAgICAgaWYgKCFhY3RpdmVUYWJJZClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UoYWN0aXZlVGFiSWQsIHtcbiAgICAgICAgICAgICAgICB0eXBlOiBcIlNIT1dfU0xPVEhJTkdfUEFORUxcIixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKCFyZXNwb25zZT8uc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIGF3YWl0IGNoZWNrUGFnZVN0YXR1cygpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHdpbmRvdy5jbG9zZSgpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIHtcbiAgICAgICAgICAgIGF3YWl0IGNocm9tZS50YWJzLnJlbG9hZChhY3RpdmVUYWJJZCk7XG4gICAgICAgICAgICB3aW5kb3cuY2xvc2UoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBhc3luYyBmdW5jdGlvbiBoYW5kbGVSZWZyZXNoVGFiKCkge1xuICAgICAgICBpZiAoIWFjdGl2ZVRhYklkKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBhd2FpdCBjaHJvbWUudGFicy5yZWxvYWQoYWN0aXZlVGFiSWQpO1xuICAgICAgICB3aW5kb3cuY2xvc2UoKTtcbiAgICB9XG4gICAgYXN5bmMgZnVuY3Rpb24gaGFuZGxlU2NhbkN1cnJlbnRQYWdlKCkge1xuICAgICAgICBzZXRQYWdlU2NhbkluRmxpZ2h0KHRydWUpO1xuICAgICAgICBzZXRQYWdlU2NhbkVycm9yKG51bGwpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgW3RhYl0gPSBhd2FpdCBjaHJvbWUudGFicy5xdWVyeSh7XG4gICAgICAgICAgICAgICAgYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGxhc3RGb2N1c2VkV2luZG93OiB0cnVlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoIXRhYj8uaWQpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gYWN0aXZlIHRhYlwiKTtcbiAgICAgICAgICAgIGlmICghY2FuSW5qZWN0SW50b1VybCh0YWIudXJsKSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoaXMgYnJvd3NlciBwYWdlIGNhbm5vdCBiZSBzY2FubmVkLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGF3YWl0IGluamVjdENvbnRlbnRTY3JpcHRzKHRhYi5pZCk7XG4gICAgICAgICAgICBhd2FpdCB3YWl0KDI1MCk7XG4gICAgICAgICAgICBhd2FpdCBjaGVja1BhZ2VTdGF0dXMoKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBzZXRQYWdlU2NhbkVycm9yKG1lc3NhZ2VGb3JQYWdlU2NhbkVycm9yKGVycikpO1xuICAgICAgICB9XG4gICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgc2V0UGFnZVNjYW5JbkZsaWdodChmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVzb2x2ZXMgdGhlIGNvbmZpZ3VyZWQgU2xvdGhpbmcgQVBJIGJhc2UgVVJMLCBwcmVmZXJyaW5nIHRoZSB2YWx1ZSB3ZVxuICAgICAqIGNhY2hlZCBhdCBmaXJzdCBwYWludCAoYGFwaUJhc2VVcmxgKSBhbmQgZmFsbGluZyBiYWNrIHRvIGEgZnJlc2hcbiAgICAgKiBHRVRfQVVUSF9TVEFUVVMgcm91bmR0cmlwIGlmIHdlIGhhdmVuJ3Qgc2VlbiBvbmUgeWV0LiBVc2VkIGJ5IGFsbCB0aGVcbiAgICAgKiBkZWVwLWxpbmsgaGFuZGxlcnMgKCMzMSkuXG4gICAgICovXG4gICAgYXN5bmMgZnVuY3Rpb24gcmVzb2x2ZUFwaUJhc2VVcmwoKSB7XG4gICAgICAgIGlmIChhcGlCYXNlVXJsKVxuICAgICAgICAgICAgcmV0dXJuIGFwaUJhc2VVcmw7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgc2VuZE1lc3NhZ2UoTWVzc2FnZXMuZ2V0QXV0aFN0YXR1cygpKTtcbiAgICAgICAgY29uc3QgZGF0YSA9IHJlc3BvbnNlLmRhdGE7XG4gICAgICAgIHJldHVybiBkYXRhPy5hcGlCYXNlVXJsIHx8IERFRkFVTFRfQVBJX0JBU0VfVVJMO1xuICAgIH1cbiAgICAvKiogT3BlbnMgdGhlIHJldmlldyBxdWV1ZSBmb3IgdGhlIHVzZXIgdG8gdHJpYWdlIHRoZWlyIGJ1bGsgaW1wb3J0cy4gKCMzMSkgKi9cbiAgICBhc3luYyBmdW5jdGlvbiBoYW5kbGVWaWV3UmV2aWV3UXVldWUoKSB7XG4gICAgICAgIGNvbnN0IGJhc2VVcmwgPSBhd2FpdCByZXNvbHZlQXBpQmFzZVVybCgpO1xuICAgICAgICBjaHJvbWUudGFicy5jcmVhdGUoeyB1cmw6IG9wcG9ydHVuaXR5UmV2aWV3VXJsKGJhc2VVcmwpIH0pO1xuICAgICAgICB3aW5kb3cuY2xvc2UoKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gcHJvZmlsZUluaXRpYWwoKSB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBwcm9maWxlPy5jb250YWN0Py5uYW1lPy50cmltKCk7XG4gICAgICAgIGlmIChuYW1lKVxuICAgICAgICAgICAgcmV0dXJuIG5hbWUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCk7XG4gICAgICAgIGNvbnN0IGVtYWlsID0gcHJvZmlsZT8uY29udGFjdD8uZW1haWw7XG4gICAgICAgIHJldHVybiBlbWFpbCA/IGVtYWlsLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpIDogXCJTXCI7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHN1cHBvcnRlZFRhYkxhYmVsKCkge1xuICAgICAgICBjb25zdCB1cmwgPSBzdXJmYWNlQ29udGV4dD8udGFiLnVybCB8fCBhY3RpdmVUYWJVcmwgfHwgdW5kZWZpbmVkO1xuICAgICAgICBpZiAoIXVybCB8fCAhaGFzQ29udGVudFNjcmlwdEhvc3QodXJsKSlcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICBpZiAoaXNXYXRlcmxvb1dvcmtzVXJsKHVybCkpXG4gICAgICAgICAgICByZXR1cm4gXCJXYXRlcmxvb1dvcmtzXCI7XG4gICAgICAgIGlmICgvbGlua2VkaW5cXC5jb20vLnRlc3QodXJsKSlcbiAgICAgICAgICAgIHJldHVybiBcIkxpbmtlZEluXCI7XG4gICAgICAgIGlmICgvaW5kZWVkXFwuY29tLy50ZXN0KHVybCkpXG4gICAgICAgICAgICByZXR1cm4gXCJJbmRlZWRcIjtcbiAgICAgICAgaWYgKC9ncmVlbmhvdXNlXFwuaW8vLnRlc3QodXJsKSlcbiAgICAgICAgICAgIHJldHVybiBcIkdyZWVuaG91c2VcIjtcbiAgICAgICAgaWYgKC9sZXZlclxcLmNvLy50ZXN0KHVybCkpXG4gICAgICAgICAgICByZXR1cm4gXCJMZXZlclwiO1xuICAgICAgICBpZiAoL3dvcmtkYXlqb2JzXFwuY29tLy50ZXN0KHVybCkpXG4gICAgICAgICAgICByZXR1cm4gXCJXb3JrZGF5XCI7XG4gICAgICAgIHJldHVybiBcInRoaXMgam9iIHNpdGVcIjtcbiAgICB9XG4gICAgZnVuY3Rpb24gc2lnbmVkT3V0Q29udGV4dENvcHkoKSB7XG4gICAgICAgIGNvbnN0IHNpdGUgPSBzdXBwb3J0ZWRUYWJMYWJlbCgpO1xuICAgICAgICBpZiAod3dTdGF0ZT8ua2luZCA9PT0gXCJsaXN0XCIpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IFwiV2F0ZXJsb29Xb3JrcyBqb2JzIGZvdW5kXCIsXG4gICAgICAgICAgICAgICAgYm9keTogYENvbm5lY3QgU2xvdGhpbmcgdG8gaW1wb3J0IGFuZCB0cmFjayB0aGVzZSAke3d3U3RhdGUucm93Q291bnR9IHBvc3RpbmdzLmAsXG4gICAgICAgICAgICAgICAgc2l0ZTogXCJXYXRlcmxvb1dvcmtzXCIsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGlmIChwYWdlU3RhdHVzPy5zY3JhcGVkSm9iKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBcIkpvYiBkZXRlY3RlZFwiLFxuICAgICAgICAgICAgICAgIGJvZHk6IFwiQ29ubmVjdCBTbG90aGluZyB0byB0YWlsb3IsIHNhdmUsIGFuZCBhdXRvZmlsbCBmcm9tIHRoaXMgcG9zdGluZy5cIixcbiAgICAgICAgICAgICAgICBzaXRlLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGFnZVN0YXR1cz8uaGFzRm9ybSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogXCJBcHBsaWNhdGlvbiBwYWdlIGRldGVjdGVkXCIsXG4gICAgICAgICAgICAgICAgYm9keTogXCJDb25uZWN0IFNsb3RoaW5nIHRvIGF1dG9maWxsIHRoaXMgYXBwbGljYXRpb24gZnJvbSB5b3VyIHByb2ZpbGUuXCIsXG4gICAgICAgICAgICAgICAgc2l0ZSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNpdGUpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IGAke3NpdGV9IGlzIHN1cHBvcnRlZGAsXG4gICAgICAgICAgICAgICAgYm9keTogXCJDb25uZWN0IFNsb3RoaW5nIHRvIHNjYW4gam9icywgaW1wb3J0IHBvc3RpbmdzLCBhbmQgb3BlbiBqb2IgdG9vbHMgaGVyZS5cIixcbiAgICAgICAgICAgICAgICBzaXRlLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKHZpZXdTdGF0ZSA9PT0gXCJsb2FkaW5nXCIpIHtcbiAgICAgICAgcmV0dXJuIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInBvcHVwXCIsIGNoaWxkcmVuOiBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJzdGF0ZS1jZW50ZXJcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInNwaW5uZXJcIiB9KSwgX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwic3RhdGUtdGV4dFwiLCBjaGlsZHJlbjogXCJDb25uZWN0aW5nXFx1MjAyNlwiIH0pXSB9KSB9KSk7XG4gICAgfVxuICAgIGlmICh2aWV3U3RhdGUgPT09IFwiZXJyb3JcIikge1xuICAgICAgICByZXR1cm4gKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicG9wdXBcIiwgY2hpbGRyZW46IF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInN0YXRlLWNlbnRlclwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwic3RhdGUtaWNvbiBlcnJvclwiLCBcImFyaWEtaGlkZGVuXCI6IHRydWUsIGNoaWxkcmVuOiBcIiFcIiB9KSwgX2pzeChcImgyXCIsIHsgY2xhc3NOYW1lOiBcInN0YXRlLXRpdGxlXCIsIGNoaWxkcmVuOiBcIlNvbWV0aGluZyB3ZW50IHdyb25nXCIgfSksIF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInN0YXRlLXRleHRcIiwgY2hpbGRyZW46IGVycm9yIH0pLCBfanN4KFwiYnV0dG9uXCIsIHsgY2xhc3NOYW1lOiBcImJ0biBwcmltYXJ5XCIsIG9uQ2xpY2s6ICgpID0+IGNoZWNrQXV0aFN0YXR1cygpLCBjaGlsZHJlbjogXCJUcnkgYWdhaW5cIiB9KV0gfSkgfSkpO1xuICAgIH1cbiAgICBpZiAodmlld1N0YXRlID09PSBcInVuYXV0aGVudGljYXRlZFwiKSB7XG4gICAgICAgIGNvbnN0IGNvbnRleHRDb3B5ID0gc2lnbmVkT3V0Q29udGV4dENvcHkoKTtcbiAgICAgICAgcmV0dXJuIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInBvcHVwXCIsIGNoaWxkcmVuOiBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogYGhlcm8gJHtjb250ZXh0Q29weSA/IFwiY29udGV4dHVhbFwiIDogXCJcIn1gLCBjaGlsZHJlbjogW19qc3goXCJpbWdcIiwgeyBjbGFzc05hbWU6IFwiaGVyby1tYXJrXCIsIHNyYzogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKFwiYnJhbmQvc2xvdGhpbmctbWFyay5wbmdcIiksIGFsdDogXCJcIiB9KSwgY29udGV4dENvcHk/LnNpdGUgJiYgKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcImhlcm8ta2lja2VyXCIsIGNoaWxkcmVuOiBjb250ZXh0Q29weS5zaXRlIH0pKSwgX2pzeChcImgxXCIsIHsgY2xhc3NOYW1lOiBcImhlcm8tdGl0bGVcIiwgY2hpbGRyZW46IGNvbnRleHRDb3B5Py50aXRsZSB8fCBcIlNsb3RoaW5nXCIgfSksIF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcImhlcm8tc3ViXCIsIGNoaWxkcmVuOiBjb250ZXh0Q29weT8uYm9keSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQXV0by1maWxsIGFwcGxpY2F0aW9ucy4gSW1wb3J0IGpvYnMuIFRyYWNrIGV2ZXJ5dGhpbmcuXCIgfSksIF9qc3goXCJidXR0b25cIiwgeyBjbGFzc05hbWU6IFwiYnRuIHByaW1hcnkgYmxvY2tcIiwgb25DbGljazogaGFuZGxlQ29ubmVjdCwgY2hpbGRyZW46IGNvbnRleHRDb3B5ID8gXCJDb25uZWN0IHRvIHVzZSBqb2IgdG9vbHNcIiA6IFwiQ29ubmVjdCBhY2NvdW50XCIgfSksIF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcImhlcm8tZm9vdFwiLCBjaGlsZHJlbjogXCJZb3UnbGwgc2lnbiBpbiBvbmNlIFxcdTIwMTQgU2xvdGhpbmcgcmVtZW1iZXJzLlwiIH0pXSB9KSB9KSk7XG4gICAgfVxuICAgIGlmICh2aWV3U3RhdGUgPT09IFwic2Vzc2lvbi1sb3N0XCIpIHtcbiAgICAgICAgY29uc3QgY29udGV4dENvcHkgPSBzaWduZWRPdXRDb250ZXh0Q29weSgpO1xuICAgICAgICByZXR1cm4gKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicG9wdXBcIiwgY2hpbGRyZW46IF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBgaGVybyBzZXNzaW9uLWxvc3QgJHtjb250ZXh0Q29weSA/IFwiY29udGV4dHVhbFwiIDogXCJcIn1gLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiaGVyby1tYXJrIHdhcm5cIiwgXCJhcmlhLWhpZGRlblwiOiB0cnVlLCBjaGlsZHJlbjogXCIhXCIgfSksIGNvbnRleHRDb3B5Py5zaXRlICYmIChfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJoZXJvLWtpY2tlclwiLCBjaGlsZHJlbjogY29udGV4dENvcHkuc2l0ZSB9KSksIF9qc3goXCJoMVwiLCB7IGNsYXNzTmFtZTogXCJoZXJvLXRpdGxlXCIsIGNoaWxkcmVuOiBcIlNlc3Npb24gbG9zdFwiIH0pLCBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJoZXJvLXN1YlwiLCBjaGlsZHJlbjogY29udGV4dENvcHlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IFwiUmVjb25uZWN0IHRvIHVzZSBTbG90aGluZyBqb2IgdG9vbHMgb24gdGhpcyBwYWdlLlwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBcIlNsb3RoaW5nIGdvdCByZXNldCBieSB5b3VyIGJyb3dzZXIuIFJlY29ubmVjdCB0byBwaWNrIHVwIHdoZXJlIHlvdSBsZWZ0IG9mZiDigJQgeW91ciBwcm9maWxlIGFuZCBkYXRhIGFyZSBzYWZlLlwiIH0pLCBfanN4KFwiYnV0dG9uXCIsIHsgY2xhc3NOYW1lOiBcImJ0biBwcmltYXJ5IGJsb2NrXCIsIG9uQ2xpY2s6IGhhbmRsZUNvbm5lY3QsIGNoaWxkcmVuOiBcIlJlY29ubmVjdFwiIH0pLCBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJoZXJvLWZvb3RcIiwgY2hpbGRyZW46IFwiVGFrZXMgYWJvdXQgZml2ZSBzZWNvbmRzLlwiIH0pXSB9KSB9KSk7XG4gICAgfVxuICAgIGNvbnN0IGRldGVjdGVkSm9iID0gcGFnZVN0YXR1cz8uc2NyYXBlZEpvYjtcbiAgICBjb25zdCBzdXBwb3J0ZWRTaXRlID0gc3VwcG9ydGVkVGFiTGFiZWwoKTtcbiAgICBjb25zdCB3b3Jrc3BhY2VWaXNpYmxlID0gISFzdXJmYWNlQ29udGV4dD8ud29ya3NwYWNlLnZpc2libGU7XG4gICAgY29uc3Qgc2hvd1d3QnVsayA9IHd3U3RhdGUgJiYgd3dTdGF0ZS5raW5kID09PSBcImxpc3RcIjtcbiAgICBjb25zdCBkZXRlY3RlZEJ1bGtTb3VyY2VzID0gT2JqZWN0LmtleXMoQlVMS19TT1VSQ0VfTEFCRUxTKS5maWx0ZXIoKGtleSkgPT4gYnVsa1N0YXRlc1trZXldPy5kZXRlY3RlZCk7XG4gICAgY29uc3Qgbm90aGluZ0RldGVjdGVkID0gIXBhZ2VTdGF0dXM/Lmhhc0Zvcm0gJiZcbiAgICAgICAgIWRldGVjdGVkSm9iICYmXG4gICAgICAgICFzaG93V3dCdWxrICYmXG4gICAgICAgIGRldGVjdGVkQnVsa1NvdXJjZXMubGVuZ3RoID09PSAwICYmXG4gICAgICAgIHBhZ2VQcm9iZVN0YXRlICE9PSBcImNoZWNraW5nXCIgJiZcbiAgICAgICAgcGFnZVByb2JlU3RhdGUgIT09IFwibmVlZHMtcmVmcmVzaFwiICYmXG4gICAgICAgICFzdXBwb3J0ZWRTaXRlO1xuICAgIC8vIE9uIGEgV1cgbGlzdCBwYWdlIHRoZSBidWxrIGNhcmQgYWxyZWFkeSBjb252ZXlzIFwid2Uga25vdyB3aGF0IHRoaXMgcGFnZVxuICAgIC8vIGlzXCI7IHRoZSBwZXItam9iIFwiTm8gam9iIGRldGVjdGVkXCIgc3RhdHVzIGNhcmQgYmVjb21lcyBwdXJlIG5vaXNlLiBPbmx5XG4gICAgLy8gcmVuZGVyIHRoZSBzdGF0dXMgY2FyZCB3aGVuIHdlIGhhdmUgc29tZXRoaW5nIHVzZWZ1bCB0byBzYXkgYWJvdXQgYVxuICAgIC8vIHNwZWNpZmljIGpvYi9mb3JtL3dvcmtzcGFjZSwgT1Igd2hlbiBubyBidWxrIHNvdXJjZSBoYXMgbWF0Y2hlZC5cbiAgICAvL1xuICAgIC8vIEFsc28gc3VwcHJlc3Mgd2hpbGUgYSBidWxrIHNjcmFwZSBpcyBpbiBmbGlnaHQg4oCUIHRoZSBvcmNoZXN0cmF0b3Igb3BlbnNcbiAgICAvLyBwb3N0aW5nIG1vZGFscyBhcyBwYXJ0IG9mIGl0cyB3YWxrLCBhbmQgc3VyZmFjaW5nIFwiSm9iIGRldGVjdGVkOiA8bGFzdFxuICAgIC8vIHJvdz5cIiB3b3VsZCBjb25mdXNlIHRoZSB1c2VyIGludG8gdGhpbmtpbmcgdGhleSBuYXZpZ2F0ZWQgdGhlcmUuXG4gICAgY29uc3QgaGFzUGFnZVN0YXR1cyA9ICF3d0J1bGtJbkZsaWdodCAmJlxuICAgICAgICAoISFkZXRlY3RlZEpvYiB8fFxuICAgICAgICAgICAgISFwYWdlU3RhdHVzPy5oYXNGb3JtIHx8XG4gICAgICAgICAgICB3b3Jrc3BhY2VWaXNpYmxlIHx8XG4gICAgICAgICAgICAocGFnZVByb2JlU3RhdGUgPT09IFwicmVhZHlcIiAmJlxuICAgICAgICAgICAgICAgICFzaG93V3dCdWxrICYmXG4gICAgICAgICAgICAgICAgZGV0ZWN0ZWRCdWxrU291cmNlcy5sZW5ndGggPT09IDApKTtcbiAgICBjb25zdCBjdXJyZW50VGFiVGl0bGUgPSB3b3Jrc3BhY2VWaXNpYmxlXG4gICAgICAgID8gXCJKb2Igd29ya3NwYWNlIGFjdGl2ZVwiXG4gICAgICAgIDogZGV0ZWN0ZWRKb2JcbiAgICAgICAgICAgID8gXCJKb2IgZGV0ZWN0ZWRcIlxuICAgICAgICAgICAgOiBwYWdlU3RhdHVzPy5oYXNGb3JtXG4gICAgICAgICAgICAgICAgPyBcIkFwcGxpY2F0aW9uIGRldGVjdGVkXCJcbiAgICAgICAgICAgICAgICA6IHBhZ2VQcm9iZVN0YXRlID09PSBcInJlYWR5XCJcbiAgICAgICAgICAgICAgICAgICAgPyBcIk5vIGpvYiBkZXRlY3RlZFwiXG4gICAgICAgICAgICAgICAgICAgIDogcGFnZVByb2JlU3RhdGUgPT09IFwiY2hlY2tpbmdcIlxuICAgICAgICAgICAgICAgICAgICAgICAgPyBcIlNjYW5uaW5nIHBhZ2VcIlxuICAgICAgICAgICAgICAgICAgICAgICAgOiBcIlVuc3VwcG9ydGVkIHBhZ2VcIjtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInBvcHVwXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJoZWFkZXJcIiwgeyBjbGFzc05hbWU6IFwidG9wYmFyXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYnJhbmRcIiwgY2hpbGRyZW46IFtfanN4KFwiaW1nXCIsIHsgY2xhc3NOYW1lOiBcImJyYW5kLW1hcmtcIiwgc3JjOiBjaHJvbWUucnVudGltZS5nZXRVUkwoXCJicmFuZC9zbG90aGluZy1tYXJrLnBuZ1wiKSwgYWx0OiBcIlwiIH0pLCBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJicmFuZC1uYW1lXCIsIGNoaWxkcmVuOiBcIlNsb3RoaW5nXCIgfSldIH0pLCBfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwicGlsbCBva1wiLCB0aXRsZTogXCJFeHRlbnNpb24gY29ubmVjdGVkXCIsIGNoaWxkcmVuOiBbX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwicGlsbC1kb3RcIiB9KSwgXCJDb25uZWN0ZWRcIl0gfSldIH0pLCBfanN4cyhcInNlY3Rpb25cIiwgeyBjbGFzc05hbWU6IFwicHJvZmlsZS1jYXJkXCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJhdmF0YXJcIiwgY2hpbGRyZW46IHByb2ZpbGVJbml0aWFsKCkgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInByb2ZpbGUtbWV0YVwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicHJvZmlsZS1uYW1lXCIsIGNoaWxkcmVuOiBwcm9maWxlPy5jb250YWN0Py5uYW1lIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9maWxlPy5jb250YWN0Py5lbWFpbCB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJTZXQgdXAgeW91ciBwcm9maWxlXCIgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicHJvZmlsZS1zdWJcIiwgY2hpbGRyZW46IHByb2ZpbGU/LmNvbXB1dGVkPy5jdXJyZW50VGl0bGUgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2ZpbGU/LmNvbXB1dGVkPy5jdXJyZW50Q29tcGFueVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBgJHtwcm9maWxlLmNvbXB1dGVkLmN1cnJlbnRUaXRsZX0gwrcgJHtwcm9maWxlLmNvbXB1dGVkLmN1cnJlbnRDb21wYW55fWBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogcHJvZmlsZT8uY29udGFjdD8uZW1haWwgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkFkZCB5b3VyIHdvcmsgaGlzdG9yeSBzbyBTbG90aGluZyBjYW4gdGFpbG9yXCIgfSldIH0pLCBwcm9maWxlU2NvcmUgIT09IG51bGwgPyAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IGBzY29yZSAke3Byb2ZpbGVTY29yZSA+PSA4MCA/IFwiaGlnaFwiIDogcHJvZmlsZVNjb3JlID49IDUwID8gXCJtaWRcIiA6IFwibG93XCJ9YCwgdGl0bGU6IFwiUHJvZmlsZSBjb21wbGV0ZW5lc3NcIiwgY2hpbGRyZW46IFtfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJzY29yZS1udW1cIiwgY2hpbGRyZW46IHByb2ZpbGVTY29yZSB9KSwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwic2NvcmUtdW5pdFwiLCBjaGlsZHJlbjogXCIvMTAwXCIgfSldIH0pKSA6IChfanN4KFwiYnV0dG9uXCIsIHsgY2xhc3NOYW1lOiBcImJ0biBnaG9zdCB0aWdodFwiLCBvbkNsaWNrOiBoYW5kbGVPcGVuRGFzaGJvYXJkLCBjaGlsZHJlbjogXCJPcGVuXCIgfSkpXSB9KSwgX2pzeHMoXCJtYWluXCIsIHsgY2xhc3NOYW1lOiBcImNvbnRlbnRcIiwgY2hpbGRyZW46IFtwYWdlUHJvYmVTdGF0ZSA9PT0gXCJuZWVkcy1yZWZyZXNoXCIgJiYgKF9qc3hzKFwiYXJ0aWNsZVwiLCB7IGNsYXNzTmFtZTogXCJzdGF0dXMtY2FyZFwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInN0YXR1cy1jb3B5XCIsIGNoaWxkcmVuOiBbX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwic3RhdHVzLWV5ZWJyb3dcIiwgY2hpbGRyZW46IFwiQ3VycmVudCB0YWJcIiB9KSwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwic3RhdHVzLXRpdGxlXCIsIGNoaWxkcmVuOiBcIlBhZ2UgbmVlZHMgcmVmcmVzaFwiIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwic3RhdHVzLWFjdGlvbnNcIiwgY2hpbGRyZW46IFtfanN4KFwiYnV0dG9uXCIsIHsgY2xhc3NOYW1lOiBcImJ0biBwcmltYXJ5XCIsIG9uQ2xpY2s6IGhhbmRsZVNjYW5DdXJyZW50UGFnZSwgZGlzYWJsZWQ6IHBhZ2VTY2FuSW5GbGlnaHQsIGNoaWxkcmVuOiBwYWdlU2NhbkluRmxpZ2h0ID8gXCJTY2FubmluZ+KAplwiIDogXCJTY2FuIHRoaXMgcGFnZVwiIH0pLCBfanN4KFwiYnV0dG9uXCIsIHsgY2xhc3NOYW1lOiBcImJ0blwiLCBvbkNsaWNrOiBoYW5kbGVSZWZyZXNoVGFiLCBjaGlsZHJlbjogXCJSZWZyZXNoIHRhYlwiIH0pXSB9KSwgcGFnZVNjYW5FcnJvciAmJiBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJpbmxpbmUtZXJyb3JcIiwgY2hpbGRyZW46IHBhZ2VTY2FuRXJyb3IgfSldIH0pKSwgcGFnZVByb2JlU3RhdGUgPT09IFwiY2hlY2tpbmdcIiAmJiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiaWRsZVwiLCBjaGlsZHJlbjogW19qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcImlkbGUtdGl0bGVcIiwgY2hpbGRyZW46IFwiU2Nhbm5pbmcgY3VycmVudCB0YWJcIiB9KSwgX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwiaWRsZS1zdWJcIiwgY2hpbGRyZW46IFwiQ2hlY2tpbmcgdGhpcyBwYWdlIGZvciBqb2JzLCBsaXN0cywgYW5kIGFwcGxpY2F0aW9uIGZvcm1zLlwiIH0pXSB9KSksIGhhc1BhZ2VTdGF0dXMgJiYgKF9qc3hzKFwiYXJ0aWNsZVwiLCB7IGNsYXNzTmFtZTogXCJzdGF0dXMtY2FyZCBhY3RpdmVcIiwgY2hpbGRyZW46IFtfanN4cyhcImhlYWRlclwiLCB7IGNsYXNzTmFtZTogXCJzdGF0dXMtaGVhZFwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInN0YXR1cy1jb3B5XCIsIGNoaWxkcmVuOiBbX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwic3RhdHVzLWV5ZWJyb3dcIiwgY2hpbGRyZW46IFwiQ3VycmVudCB0YWJcIiB9KSwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwic3RhdHVzLXRpdGxlXCIsIGNoaWxkcmVuOiBjdXJyZW50VGFiVGl0bGUgfSldIH0pLCBwYWdlU3RhdHVzPy5oYXNGb3JtICYmIChfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwiYmFkZ2VcIiwgY2hpbGRyZW46IFtwYWdlU3RhdHVzLmRldGVjdGVkRmllbGRzLCBcIiBmaWVsZHNcIl0gfSkpXSB9KSwgZGV0ZWN0ZWRKb2IgPyAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicGFnZS1zdW1tYXJ5XCIsIGNoaWxkcmVuOiBbX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwiY2xpcFwiLCB0aXRsZTogZGV0ZWN0ZWRKb2IudGl0bGUsIGNoaWxkcmVuOiBkZXRlY3RlZEpvYi50aXRsZSB9KSwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwiY2FyZC1zdWIgY2xpcFwiLCBjaGlsZHJlbjogZGV0ZWN0ZWRKb2IuY29tcGFueSB9KV0gfSkpIDogKF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcImlubGluZS1ub3RlXCIsIGNoaWxkcmVuOiBwYWdlU3RhdHVzPy5oYXNGb3JtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IFwiUmVhZHkgb24gdGhpcyBhcHBsaWNhdGlvbiBwYWdlLlwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFwiT3BlbiBhIGpvYiBwb3N0aW5nLCB0aGVuIHNjYW4gYWdhaW4uXCIgfSkpLCAocGFnZVN0YXR1cz8uZGV0ZWN0ZWRVcGxvYWRDb3VudCA/PyAwKSA+IDAgJiYgKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInBhZ2Utc3VtbWFyeVwiLCBjaGlsZHJlbjogW19qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcImNsaXBcIiwgY2hpbGRyZW46IFwiUmVzdW1lIHVwbG9hZCBkZXRlY3RlZC4gQXR0YWNoIHlvdXIgZmlsZSBtYW51YWxseS5cIiB9KSwgbGF0ZXN0UmVzdW1lID8gKF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJjYXJkLXN1YiBjbGlwXCIsIHRpdGxlOiBsYXRlc3RSZXN1bWUubmFtZSwgY2hpbGRyZW46IFtcIkxhdGVzdDogXCIsIGxhdGVzdFJlc3VtZS5uYW1lXSB9KSkgOiAoX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwiY2FyZC1zdWIgY2xpcFwiLCBjaGlsZHJlbjogXCJPcGVuIFN0dWRpbyB0byBleHBvcnQgeW91ciBsYXRlc3QgZG9jdW1lbnQuXCIgfSkpLCBfanN4KFwiYnV0dG9uXCIsIHsgY2xhc3NOYW1lOiBcImJ0biBibG9ja1wiLCBvbkNsaWNrOiBoYW5kbGVPcGVuU3R1ZGlvRm9yUmVzdW1lLCBjaGlsZHJlbjogbGF0ZXN0UmVzdW1lID8gXCJPcGVuIGxhdGVzdCByZXN1bWVcIiA6IFwiT3BlbiBTdHVkaW9cIiB9KV0gfSkpLCBkZXRlY3RlZEpvYiAmJiAoX2pzeChcImJ1dHRvblwiLCB7IGNsYXNzTmFtZTogXCJidG4gcHJpbWFyeSBibG9ja1wiLCBvbkNsaWNrOiBoYW5kbGVTaG93UGFuZWwsIGNoaWxkcmVuOiBcIk9wZW4gam9iIHRvb2xzXCIgfSkpLCAhZGV0ZWN0ZWRKb2IgJiYgcGFnZVByb2JlU3RhdGUgPT09IFwicmVhZHlcIiAmJiAoX2pzeChcImJ1dHRvblwiLCB7IGNsYXNzTmFtZTogXCJidG4gYmxvY2tcIiwgb25DbGljazogKCkgPT4gY2hlY2tQYWdlU3RhdHVzKCksIGNoaWxkcmVuOiBcIlNjYW4gYWdhaW5cIiB9KSldIH0pKSwgc2hvd1d3QnVsayAmJiB3d1N0YXRlICYmIChfanN4KEJ1bGtTb3VyY2VDYXJkLCB7IHNvdXJjZUxhYmVsOiBcIldhdGVybG9vV29ya3NcIiwgZGV0ZWN0ZWRDb3VudDogd3dTdGF0ZS5yb3dDb3VudCwgYnVzeTogd3dCdWxrSW5GbGlnaHQsIHByb2dyZXNzOiB3d0J1bGtQcm9ncmVzcywgbGFzdFJlc3VsdDogd3dCdWxrUmVzdWx0LCBsYXN0RXJyb3I6IHd3QnVsa0Vycm9yLCBvblNjcmFwZVZpc2libGU6ICgpID0+IGhhbmRsZVd3QnVsa1NjcmFwZShcInZpc2libGVcIiksIG9uU2NyYXBlUGFnaW5hdGVkOiAoKSA9PiBoYW5kbGVXd0J1bGtTY3JhcGUoXCJwYWdpbmF0ZWRcIiksIG9uQ2FuY2VsOiBoYW5kbGVXd0J1bGtDYW5jZWwsIG9uVmlld1RyYWNrZXI6IGhhbmRsZVZpZXdSZXZpZXdRdWV1ZSB9KSksIGRldGVjdGVkQnVsa1NvdXJjZXMubWFwKChrZXkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0YXRlID0gYnVsa1N0YXRlc1trZXldO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFzdGF0ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoX2pzeChCdWxrU291cmNlQ2FyZCwgeyBzb3VyY2VMYWJlbDogQlVMS19TT1VSQ0VfTEFCRUxTW2tleV0sIGRldGVjdGVkQ291bnQ6IHN0YXRlLnJvd0NvdW50LCBidXN5OiBidWxrSW5GbGlnaHRba2V5XSA/PyBudWxsLCBsYXN0UmVzdWx0OiBidWxrUmVzdWx0c1trZXldID8/IG51bGwsIGxhc3RFcnJvcjogYnVsa0Vycm9yc1trZXldID8/IG51bGwsIG9uU2NyYXBlVmlzaWJsZTogKCkgPT4gaGFuZGxlQnVsa1NvdXJjZVNjcmFwZShrZXksIFwidmlzaWJsZVwiKSwgb25TY3JhcGVQYWdpbmF0ZWQ6ICgpID0+IGhhbmRsZUJ1bGtTb3VyY2VTY3JhcGUoa2V5LCBcInBhZ2luYXRlZFwiKSwgb25WaWV3VHJhY2tlcjogaGFuZGxlVmlld1Jldmlld1F1ZXVlIH0sIGtleSkpO1xuICAgICAgICAgICAgICAgICAgICB9KSwgbm90aGluZ0RldGVjdGVkICYmICFoYXNQYWdlU3RhdHVzICYmIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJpZGxlXCIsIGNoaWxkcmVuOiBbX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwiaWRsZS10aXRsZVwiLCBjaGlsZHJlbjogXCJVbnN1cHBvcnRlZCBwYWdlXCIgfSksIF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcImlkbGUtc3ViXCIsIGNoaWxkcmVuOiBcIlNsb3RoaW5nIGlzIG5vdCBydW5uaW5nIG9uIHRoaXMgdGFiLiBTY2FuIG9uY2UsIG9yIG9wZW4gYSBzdXBwb3J0ZWQgam9iIHBhZ2UuXCIgfSksIF9qc3goXCJidXR0b25cIiwgeyBjbGFzc05hbWU6IFwiYnRuIGJsb2NrXCIsIG9uQ2xpY2s6IGhhbmRsZVNjYW5DdXJyZW50UGFnZSwgZGlzYWJsZWQ6IHBhZ2VTY2FuSW5GbGlnaHQsIGNoaWxkcmVuOiBwYWdlU2NhbkluRmxpZ2h0ID8gXCJTY2FubmluZ+KAplwiIDogXCJTY2FuIHRoaXMgcGFnZVwiIH0pLCBwYWdlU2NhbkVycm9yICYmIF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcImlubGluZS1lcnJvclwiLCBjaGlsZHJlbjogcGFnZVNjYW5FcnJvciB9KV0gfSkpLCAhaGFzUGFnZVN0YXR1cyAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgIW5vdGhpbmdEZXRlY3RlZCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgc3VwcG9ydGVkU2l0ZSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgIXNob3dXd0J1bGsgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGRldGVjdGVkQnVsa1NvdXJjZXMubGVuZ3RoID09PSAwICYmIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJpZGxlXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJwXCIsIHsgY2xhc3NOYW1lOiBcImlkbGUtdGl0bGVcIiwgY2hpbGRyZW46IFtzdXBwb3J0ZWRTaXRlLCBcIiBpcyBzdXBwb3J0ZWRcIl0gfSksIF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcImlkbGUtc3ViXCIsIGNoaWxkcmVuOiBcIlNjYW5uaW5nIHRoaXMgdGFiIGZvciBhIGpvYiBwb3N0aW5nIG9yIGFwcGxpY2F0aW9uIGZvcm0uXCIgfSldIH0pKSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicXVpY2stcm93XCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJidXR0b25cIiwgeyBjbGFzc05hbWU6IFwicXVpY2tcIiwgb25DbGljazogaGFuZGxlT3BlbkRhc2hib2FyZCwgY2hpbGRyZW46IFtfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJxdWljay1pY29uXCIsIFwiYXJpYS1oaWRkZW5cIjogdHJ1ZSwgY2hpbGRyZW46IFwiXFx1MjE5N1wiIH0pLCBfanN4KFwic3BhblwiLCB7IGNoaWxkcmVuOiBcIkRhc2hib2FyZFwiIH0pXSB9KSwgX2pzeHMoXCJidXR0b25cIiwgeyBjbGFzc05hbWU6IFwicXVpY2tcIiwgb25DbGljazogKCkgPT4gY2hyb21lLnJ1bnRpbWUub3Blbk9wdGlvbnNQYWdlKCksIGNoaWxkcmVuOiBbX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwicXVpY2staWNvblwiLCBcImFyaWEtaGlkZGVuXCI6IHRydWUsIGNoaWxkcmVuOiBcIlxcdTI2OTlcIiB9KSwgX2pzeChcInNwYW5cIiwgeyBjaGlsZHJlbjogXCJTZXR0aW5nc1wiIH0pXSB9KV0gfSldIH0pLCBfanN4cyhcImZvb3RlclwiLCB7IGNsYXNzTmFtZTogXCJmb290YmFyXCIsIGNoaWxkcmVuOiBbX2pzeChcImJ1dHRvblwiLCB7IGNsYXNzTmFtZTogYGxpbmsgJHtjb25maXJtaW5nTG9nb3V0ID8gXCJ3YXJuXCIgOiBcIlwifWAsIG9uQ2xpY2s6IGhhbmRsZUxvZ291dCwgY2hpbGRyZW46IGNvbmZpcm1pbmdMb2dvdXQgPyBcIkNsaWNrIGFnYWluIHRvIGRpc2Nvbm5lY3RcIiA6IFwiRGlzY29ubmVjdFwiIH0pLCBwcm9maWxlPy51cGRhdGVkQXQgJiYgKF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ1cGRhdGVkXCIsIGNoaWxkcmVuOiBbXCJTeW5jZWQgXCIsIGZvcm1hdFJlbGF0aXZlKHByb2ZpbGUudXBkYXRlZEF0KV0gfSkpXSB9KV0gfSkpO1xufVxuZnVuY3Rpb24gd2FpdChtcykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gd2luZG93LnNldFRpbWVvdXQocmVzb2x2ZSwgbXMpKTtcbn1cbmZ1bmN0aW9uIHNlbmRUYWJNZXNzYWdlV2l0aFRpbWVvdXQodGFiSWQsIG1lc3NhZ2UsIHRpbWVvdXRNcykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGxldCBzZXR0bGVkID0gZmFsc2U7XG4gICAgICAgIGNvbnN0IHRpbWVvdXRJZCA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGlmIChzZXR0bGVkKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIHNldHRsZWQgPSB0cnVlO1xuICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihcIlNsb3RoaW5nIGRpZCBub3QgaGVhciBiYWNrIGZyb20gdGhpcyBwYWdlLlwiKSk7XG4gICAgICAgIH0sIHRpbWVvdXRNcyk7XG4gICAgICAgIGNvbnN0IHNldHRsZSA9IChmbikgPT4ge1xuICAgICAgICAgICAgaWYgKHNldHRsZWQpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgc2V0dGxlZCA9IHRydWU7XG4gICAgICAgICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgICAgICAgICBmbigpO1xuICAgICAgICB9O1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gRmlyZWZveCdzIGNocm9tZS4qIFdlYkV4dGVuc2lvbiBtZXRob2RzIHJlcXVpcmUgdGhlaXIgbmF0aXZlIGB0aGlzYFxuICAgICAgICAgICAgLy8gYmluZGluZy4gQ2FsbGluZyBhbiBleHRyYWN0ZWQgYHNlbmRNZXNzYWdlYCByZWZlcmVuY2UgdGhyb3dzIGFuXG4gICAgICAgICAgICAvLyBcIklsbGVnYWwgaW52b2NhdGlvblwiIFR5cGVFcnJvciAob3Igc2lsZW50bHkgZmFpbHMpLCB3aGljaCBsZWZ0IHRoZVxuICAgICAgICAgICAgLy8gcG9wdXAgc3R1Y2sgaW4gaXRzIGluaXRpYWwgXCJjaGVja2luZ1wiIHN0YXRlIGJlY2F1c2Ugbm90aGluZyBldmVyXG4gICAgICAgICAgICAvLyByZWFjaGVkIHRoZSBjb250ZW50IHNjcmlwdC4gSW52b2tlIHZpYSB0aGUgbmFtZXNwYWNlLCBvciDigJQgd2hlblxuICAgICAgICAgICAgLy8gcGFzc2luZyBpdCB0aHJvdWdoIGhlcmUg4oCUIGJpbmQgZXhwbGljaXRseS5cbiAgICAgICAgICAgIGNvbnN0IGNhbGxiYWNrID0gKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbGFzdEVycm9yID0gY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yO1xuICAgICAgICAgICAgICAgIHNldHRsZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChsYXN0RXJyb3IpXG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKGxhc3RFcnJvci5tZXNzYWdlKSk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnN0IG1heWJlUHJvbWlzZSA9IGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYklkLCBtZXNzYWdlLCBjYWxsYmFjayk7XG4gICAgICAgICAgICBpZiAobWF5YmVQcm9taXNlICYmXG4gICAgICAgICAgICAgICAgdHlwZW9mIG1heWJlUHJvbWlzZS50aGVuID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICBtYXliZVByb21pc2UudGhlbigocmVzcG9uc2UpID0+IHNldHRsZSgoKSA9PiByZXNvbHZlKHJlc3BvbnNlKSksIChlcnIpID0+IHNldHRsZSgoKSA9PiByZWplY3QoZXJyKSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHNldHRsZSgoKSA9PiByZWplY3QoZXJyKSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbmZ1bmN0aW9uIGNhbkluamVjdEludG9VcmwodXJsKSB7XG4gICAgaWYgKCF1cmwpXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gL14oaHR0cHM/fGZpbGUpOlxcL1xcLy9pLnRlc3QodXJsKTtcbn1cbmFzeW5jIGZ1bmN0aW9uIGluamVjdENvbnRlbnRTY3JpcHRzKHRhYklkKSB7XG4gICAgaWYgKGNocm9tZS5zY3JpcHRpbmc/LmV4ZWN1dGVTY3JpcHQpIHtcbiAgICAgICAgYXdhaXQgY2hyb21lLnNjcmlwdGluZ1xuICAgICAgICAgICAgLmluc2VydENTUyh7XG4gICAgICAgICAgICB0YXJnZXQ6IHsgdGFiSWQgfSxcbiAgICAgICAgICAgIGZpbGVzOiBbXCJjb250ZW50LmNzc1wiXSxcbiAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB1bmRlZmluZWQpO1xuICAgICAgICBhd2FpdCBjaHJvbWUuc2NyaXB0aW5nLmV4ZWN1dGVTY3JpcHQoe1xuICAgICAgICAgICAgdGFyZ2V0OiB7IHRhYklkIH0sXG4gICAgICAgICAgICBmaWxlczogW1wic2hhcmVkVWkuanNcIl0sXG4gICAgICAgIH0pO1xuICAgICAgICBhd2FpdCBjaHJvbWUuc2NyaXB0aW5nLmV4ZWN1dGVTY3JpcHQoe1xuICAgICAgICAgICAgdGFyZ2V0OiB7IHRhYklkIH0sXG4gICAgICAgICAgICBmaWxlczogW1wiY29udGVudC5qc1wiXSxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgdGFicyA9IGNocm9tZS50YWJzO1xuICAgIGF3YWl0IGNhbGxUYWJzSW5qZWN0aW9uKHRhYnMsIFwiaW5zZXJ0Q1NTXCIsIHRhYklkLCBcImNvbnRlbnQuY3NzXCIsIHRydWUpO1xuICAgIGF3YWl0IGNhbGxUYWJzSW5qZWN0aW9uKHRhYnMsIFwiZXhlY3V0ZVNjcmlwdFwiLCB0YWJJZCwgXCJzaGFyZWRVaS5qc1wiKTtcbiAgICBhd2FpdCBjYWxsVGFic0luamVjdGlvbih0YWJzLCBcImV4ZWN1dGVTY3JpcHRcIiwgdGFiSWQsIFwiY29udGVudC5qc1wiKTtcbn1cbmZ1bmN0aW9uIGNhbGxUYWJzSW5qZWN0aW9uKHRhYnMsIG1ldGhvZCwgdGFiSWQsIGZpbGUsIG9wdGlvbmFsID0gZmFsc2UpIHtcbiAgICBjb25zdCBmbiA9IHRhYnNbbWV0aG9kXTtcbiAgICBpZiAoIWZuKSB7XG4gICAgICAgIHJldHVybiBvcHRpb25hbFxuICAgICAgICAgICAgPyBQcm9taXNlLnJlc29sdmUoKVxuICAgICAgICAgICAgOiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoXCJUaGlzIGJyb3dzZXIgY2Fubm90IHNjYW4gdGhlIGN1cnJlbnQgcGFnZS5cIikpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBsZXQgc2V0dGxlZCA9IGZhbHNlO1xuICAgICAgICBjb25zdCBzZXR0bGUgPSAoZXJyKSA9PiB7XG4gICAgICAgICAgICBpZiAoc2V0dGxlZClcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBzZXR0bGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9uYWwpXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHJlamVjdCh0b1BhZ2VTY2FuRXJyb3IoZXJyKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgbGFzdEVycm9yID0gY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yO1xuICAgICAgICAgICAgaWYgKGxhc3RFcnJvciAmJiAhb3B0aW9uYWwpIHtcbiAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKGxhc3RFcnJvci5tZXNzYWdlKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9O1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gRmlyZWZveCdzIGNocm9tZS4qIFdlYkV4dGVuc2lvbiBtZXRob2RzIHJlcXVpcmUgdGhlaXIgbmF0aXZlIGB0aGlzYFxuICAgICAgICAgICAgLy8gYmluZGluZy4gQ2FsbGluZyBhbiBleHRyYWN0ZWQgYGV4ZWN1dGVTY3JpcHRgIGZ1bmN0aW9uIHRocm93cyBhXG4gICAgICAgICAgICAvLyBUeXBlRXJyb3IsIHdoaWNoIHByZXZpb3VzbHkgc3VyZmFjZWQgYXMgYSBtaXNsZWFkaW5nIFwiTmV0d29yayBlcnJvclwiLlxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gZm4uY2FsbCh0YWJzLCB0YWJJZCwgeyBmaWxlIH0sICgpID0+IHNldHRsZSgpKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQgJiYgdHlwZW9mIHJlc3VsdC50aGVuID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQudGhlbigoKSA9PiBzZXR0bGUoKSwgc2V0dGxlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBzZXR0bGUoZXJyKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuZnVuY3Rpb24gdG9QYWdlU2NhbkVycm9yKGVycikge1xuICAgIGNvbnN0IHJhdyA9IGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBTdHJpbmcoZXJyIHx8IFwiXCIpO1xuICAgIGlmICgvcGVybWlzc2lvbnxhY2Nlc3N8cHJpdmlsZWdlfG5vdCBhbGxvd2VkfGNhbm5vdCBhY2Nlc3MvaS50ZXN0KHJhdykpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBFcnJvcihcIkZpcmVmb3ggYmxvY2tlZCBhY2Nlc3MgdG8gdGhpcyB0YWIuIFJlZnJlc2ggaXQgYW5kIHNjYW4gYWdhaW4uXCIpO1xuICAgIH1cbiAgICBpZiAoL2V4ZWN1dGVTY3JpcHR8aW5zZXJ0Q1NTfG5vdCBhIGZ1bmN0aW9ufGludGVyZmFjZS9pLnRlc3QocmF3KSkge1xuICAgICAgICByZXR1cm4gbmV3IEVycm9yKFwiRmlyZWZveCBjb3VsZCBub3QgaW5qZWN0IFNsb3RoaW5nIGludG8gdGhpcyB0YWIuIFJlZnJlc2ggaXQgYW5kIHNjYW4gYWdhaW4uXCIpO1xuICAgIH1cbiAgICByZXR1cm4gZXJyIGluc3RhbmNlb2YgRXJyb3JcbiAgICAgICAgPyBlcnJcbiAgICAgICAgOiBuZXcgRXJyb3IocmF3IHx8IFwiQ291bGQgbm90IHNjYW4gdGhpcyBwYWdlLlwiKTtcbn1cbmZ1bmN0aW9uIG1lc3NhZ2VGb3JQYWdlU2NhbkVycm9yKGVycikge1xuICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSB0b1BhZ2VTY2FuRXJyb3IoZXJyKTtcbiAgICBpZiAoZXJyIGluc3RhbmNlb2YgVHlwZUVycm9yICYmIG5vcm1hbGl6ZWQgPT09IGVycikge1xuICAgICAgICByZXR1cm4gXCJGaXJlZm94IGNvdWxkIG5vdCBpbmplY3QgU2xvdGhpbmcgaW50byB0aGlzIHRhYi4gUmVmcmVzaCBpdCBhbmQgc2NhbiBhZ2Fpbi5cIjtcbiAgICB9XG4gICAgcmV0dXJuIG1lc3NhZ2VGb3JFcnJvcihub3JtYWxpemVkKTtcbn1cbmZ1bmN0aW9uIGlzV2F0ZXJsb29Xb3Jrc1VybCh1cmwpIHtcbiAgICBpZiAoIXVybClcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiAvXndhdGVybG9vd29ya3NbLS5hLXowLTldKlxcLnV3YXRlcmxvb1xcLmNhJC9pLnRlc3QobmV3IFVSTCh1cmwpLmhvc3RuYW1lKTtcbiAgICB9XG4gICAgY2F0Y2gge1xuICAgICAgICByZXR1cm4gL3dhdGVybG9vd29ya3MvaS50ZXN0KHVybCk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsganN4IGFzIF9qc3ggfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8vIEZpcmVmb3gncyBgY2hyb21lLipgIGNvbXBhdCBpcyBjYWxsYmFjay1iYXNlZCwgc28gYGF3YWl0IGNocm9tZS50YWJzLnF1ZXJ5KC4uLilgXG4vLyByZXNvbHZlcyB0byBgdW5kZWZpbmVkYCBhbmQgZG93bnN0cmVhbSBjb2RlIHRocm93cy4gQWxpYXNpbmcgZ2xvYmFsIGBjaHJvbWVgXG4vLyB0byB0aGUgcG9seWZpbGxlZCBgYnJvd3NlcmAgbWFrZXMgZXZlcnkgZXhpc3RpbmcgYGNocm9tZS4qYCBjYWxsIFByb21pc2UtXG4vLyByZXR1cm5pbmcgb24gYm90aCBGaXJlZm94IGFuZCBDaHJvbWUgd2l0aCBubyBjYWxsLXNpdGUgY2hhbmdlcy5cbmltcG9ydCBicm93c2VyIGZyb20gXCJ3ZWJleHRlbnNpb24tcG9seWZpbGxcIjtcbmlmICh0eXBlb2YgZ2xvYmFsVGhpcyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgZ2xvYmFsVGhpcy5jaHJvbWUgPSBicm93c2VyO1xufVxuaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgY3JlYXRlUm9vdCB9IGZyb20gXCJyZWFjdC1kb20vY2xpZW50XCI7XG5pbXBvcnQgQXBwIGZyb20gXCIuL0FwcFwiO1xuaW1wb3J0IFwiLi9zdHlsZXMuY3NzXCI7XG5jb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJvb3RcIik7XG5pZiAoY29udGFpbmVyKSB7XG4gICAgY29uc3Qgcm9vdCA9IGNyZWF0ZVJvb3QoY29udGFpbmVyKTtcbiAgICByb290LnJlbmRlcihfanN4KFJlYWN0LlN0cmljdE1vZGUsIHsgY2hpbGRyZW46IF9qc3goQXBwLCB7fSkgfSkpO1xufVxuIiwiLyoqXG4gKiBVc2VyLWZhY2luZyBlcnJvciBzdHJpbmcgbWFwcGluZyBmb3IgdGhlIFNsb3RoaW5nIGV4dGVuc2lvbi5cbiAqXG4gKiBUaGUgcG9wdXAgKGFuZCBhbnkgb3RoZXIgZXh0ZW5zaW9uIHN1cmZhY2UpIHNob3VsZCBuZXZlciBzaG93IHJhd1xuICogYFwiUmVxdWVzdCBmYWlsZWQ6IDUwM1wiYCAvIGBcIkF1dGhlbnRpY2F0aW9uIGV4cGlyZWRcImAgc3RyaW5ncy4gV3JhcCBhbnlcbiAqIGVycm9yIHBhdGggaW4gYG1lc3NhZ2VGb3JFcnJvcihlcnIpYCB0byBnZXQgYW4gRW5nbGlzaCBzZW50ZW5jZSBzYWZlXG4gKiBmb3IgZW5kLXVzZXJzLlxuICpcbiAqIE1pcnJvciBvZiB0aGUgbWVzc2FnZSB0b25lIHVzZWQgYnkgYGFwcHMvd2ViLy4uLi9leHRlbnNpb24vY29ubmVjdC9wYWdlLnRzeGBcbiAqIGBtZXNzYWdlRm9yU3RhdHVzYCDigJQgdGhlIGNvbm5lY3QgcGFnZSBrZWVwcyBpdHMgb3duIGNvcHkgYmVjYXVzZSBpdCBzaXRzXG4gKiBpbnNpZGUgdGhlIG5leHQtaW50bCB0cmVlIChkaWZmZXJlbnQgcGFja2FnZSBib3VuZGFyeSksIGJ1dCB0aGVcbiAqIHVzZXItdmlzaWJsZSBzdHJpbmdzIHNob3VsZCBzdGF5IGFsaWduZWQuIElmIHlvdSBjaGFuZ2Ugb25lLCBjaGFuZ2UgYm90aC5cbiAqXG4gKiBFbmdsaXNoLW9ubHkgYnkgZGVzaWduOiB0aGUgZXh0ZW5zaW9uIGl0c2VsZiBkb2VzIG5vdCB1c2UgbmV4dC1pbnRsLlxuICovXG4vKipcbiAqIE1hcHMgYW4gSFRUUCBzdGF0dXMgY29kZSB0byBhIGh1bWFuLWZyaWVuZGx5IG1lc3NhZ2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtZXNzYWdlRm9yU3RhdHVzKHN0YXR1cykge1xuICAgIGlmIChzdGF0dXMgPT09IDQwMSB8fCBzdGF0dXMgPT09IDQwMykge1xuICAgICAgICByZXR1cm4gXCJTaWduIGluIGV4cGlyZWQuIFJlY29ubmVjdCB0aGUgZXh0ZW5zaW9uLlwiO1xuICAgIH1cbiAgICBpZiAoc3RhdHVzID09PSA0MjkpIHtcbiAgICAgICAgcmV0dXJuIFwiV2UncmUgcmF0ZS1saW1pdGVkLiBUcnkgYWdhaW4gaW4gYSBtaW51dGUuXCI7XG4gICAgfVxuICAgIGlmIChzdGF0dXMgPj0gNTAwKSB7XG4gICAgICAgIHJldHVybiBcIlNsb3RoaW5nIHNlcnZlcnMgYXJlIGhhdmluZyBhIHByb2JsZW0uXCI7XG4gICAgfVxuICAgIHJldHVybiBcIlNvbWV0aGluZyB3ZW50IHdyb25nLiBQbGVhc2UgdHJ5IGFnYWluLlwiO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHJldHJ5RXhoYXVzdGVkTWVzc2FnZSgpIHtcbiAgICByZXR1cm4gXCJTbG90aGluZyBpcyBzdGlsbCBub3QgcmVzcG9uZGluZyBhZnRlciByZXRyeWluZy4gVHJ5IGFnYWluIGluIGEgbWludXRlLlwiO1xufVxuLyoqXG4gKiBCZXN0LWVmZm9ydCBtYXBwaW5nIG9mIGFuIHVua25vd24gdGhyb3duIHZhbHVlIHRvIGEgaHVtYW4tZnJpZW5kbHlcbiAqIG1lc3NhZ2UuIFJlY29nbmlzZXMgdGhlIHNwZWNpZmljIHBocmFzZXMgdGhlIGFwaS1jbGllbnQgdGhyb3dzIHRvZGF5XG4gKiAoYFwiQXV0aGVudGljYXRpb24gZXhwaXJlZFwiYCwgYFwiTm90IGF1dGhlbnRpY2F0ZWRcImAsIGBcIlJlcXVlc3QgZmFpbGVkOiA8Y29kZT5cImAsXG4gKiBgXCJGYWlsZWQgdG8gZmV0Y2hcImApIGFuZCBmYWxscyBiYWNrIHRvIHRoZSBvcmlnaW5hbCBtZXNzYWdlIGZvciBhbnl0aGluZ1xuICogZWxzZSDigJQgdGhhdCdzIGFsbW9zdCBhbHdheXMgbW9yZSB1c2VmdWwgdGhhbiBhIGdlbmVyaWMgY2F0Y2gtYWxsLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWVzc2FnZUZvckVycm9yKGVycikge1xuICAgIC8vIEdlbmVyaWMgbmV0d29yayBmYWlsdXJlIChmZXRjaCBpbiBzZXJ2aWNlIHdvcmtlcnMgdGhyb3dzIFR5cGVFcnJvciBoZXJlKVxuICAgIGlmIChlcnIgaW5zdGFuY2VvZiBUeXBlRXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIFwiTmV0d29yayBlcnJvci4gQ2hlY2sgeW91ciBjb25uZWN0aW9uIGFuZCB0cnkgYWdhaW4uXCI7XG4gICAgfVxuICAgIGNvbnN0IHJhdyA9IGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBcIlwiO1xuICAgIGlmICghcmF3KVxuICAgICAgICByZXR1cm4gXCJTb21ldGhpbmcgd2VudCB3cm9uZy4gUGxlYXNlIHRyeSBhZ2Fpbi5cIjtcbiAgICAvLyBBdXRoLXNoYXBlZCBtZXNzYWdlcyBmcm9tIFNsb3RoaW5nQVBJQ2xpZW50LlxuICAgIGlmIChyYXcgPT09IFwiQXV0aGVudGljYXRpb24gZXhwaXJlZFwiIHx8XG4gICAgICAgIHJhdyA9PT0gXCJOb3QgYXV0aGVudGljYXRlZFwiIHx8XG4gICAgICAgIC91bmF1dGhvci9pLnRlc3QocmF3KSkge1xuICAgICAgICByZXR1cm4gbWVzc2FnZUZvclN0YXR1cyg0MDEpO1xuICAgIH1cbiAgICAvLyBgUmVxdWVzdCBmYWlsZWQ6IDUwM2Ag4oCUIHJlY292ZXIgdGhlIHN0YXR1cyBjb2RlLlxuICAgIGNvbnN0IG1hdGNoID0gcmF3Lm1hdGNoKC9SZXF1ZXN0IGZhaWxlZDpcXHMqKFxcZHszfSkvKTtcbiAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgY29uc3QgY29kZSA9IE51bWJlcihtYXRjaFsxXSk7XG4gICAgICAgIGlmIChOdW1iZXIuaXNGaW5pdGUoY29kZSkpXG4gICAgICAgICAgICByZXR1cm4gbWVzc2FnZUZvclN0YXR1cyhjb2RlKTtcbiAgICB9XG4gICAgY29uc3QgcmV0cnlNYXRjaCA9IHJhdy5tYXRjaCgvUmVxdWVzdCBzdGlsbCBmYWlsaW5nIGFmdGVyIHJldHJ5OlxccyooXFxkezN9KS8pO1xuICAgIGlmIChyZXRyeU1hdGNoKSB7XG4gICAgICAgIHJldHVybiByZXRyeUV4aGF1c3RlZE1lc3NhZ2UoKTtcbiAgICB9XG4gICAgLy8gQnJvd3NlciBmZXRjaCBmYWlsdXJlcyBidWJibGUgdXAgYXMgXCJGYWlsZWQgdG8gZmV0Y2hcIi5cbiAgICBpZiAoL2ZhaWxlZCB0byBmZXRjaC9pLnRlc3QocmF3KSB8fCAvbmV0d29yay9pLnRlc3QocmF3KSkge1xuICAgICAgICByZXR1cm4gXCJOZXR3b3JrIGVycm9yLiBDaGVjayB5b3VyIGNvbm5lY3Rpb24gYW5kIHRyeSBhZ2Fpbi5cIjtcbiAgICB9XG4gICAgLy8gRm9yIGFueXRoaW5nIGVsc2UsIHRoZSB1bmRlcmx5aW5nIG1lc3NhZ2UgaXMgdXN1YWxseSBhIHNlbnRlbmNlIGFscmVhZHlcbiAgICAvLyAoZS5nLiBcIkNvdWxkbid0IHJlYWQgdGhlIGZ1bGwgam9iIGRlc2NyaXB0aW9uIGZyb20gdGhpcyBwYWdlLlwiKS5cbiAgICByZXR1cm4gcmF3O1xufVxuIiwiLy8gTWVzc2FnZSBwYXNzaW5nIHV0aWxpdGllcyBmb3IgZXh0ZW5zaW9uIGNvbW11bmljYXRpb25cbi8vIFR5cGUtc2FmZSBtZXNzYWdlIGNyZWF0b3JzXG5leHBvcnQgY29uc3QgTWVzc2FnZXMgPSB7XG4gICAgLy8gQXV0aCBtZXNzYWdlc1xuICAgIGdldEF1dGhTdGF0dXM6ICgpID0+ICh7IHR5cGU6IFwiR0VUX0FVVEhfU1RBVFVTXCIgfSksXG4gICAgZ2V0U3VyZmFjZUNvbnRleHQ6ICgpID0+ICh7IHR5cGU6IFwiR0VUX1NVUkZBQ0VfQ09OVEVYVFwiIH0pLFxuICAgIG9wZW5BdXRoOiAoKSA9PiAoeyB0eXBlOiBcIk9QRU5fQVVUSFwiIH0pLFxuICAgIGxvZ291dDogKCkgPT4gKHsgdHlwZTogXCJMT0dPVVRcIiB9KSxcbiAgICAvLyBQcm9maWxlIG1lc3NhZ2VzXG4gICAgZ2V0UHJvZmlsZTogKCkgPT4gKHsgdHlwZTogXCJHRVRfUFJPRklMRVwiIH0pLFxuICAgIGdldFNldHRpbmdzOiAoKSA9PiAoeyB0eXBlOiBcIkdFVF9TRVRUSU5HU1wiIH0pLFxuICAgIC8vIEZvcm0gZmlsbGluZyBtZXNzYWdlc1xuICAgIGZpbGxGb3JtOiAoZmllbGRzKSA9PiAoe1xuICAgICAgICB0eXBlOiBcIkZJTExfRk9STVwiLFxuICAgICAgICBwYXlsb2FkOiBmaWVsZHMsXG4gICAgfSksXG4gICAgLy8gU2NyYXBpbmcgbWVzc2FnZXNcbiAgICBzY3JhcGVKb2I6ICgpID0+ICh7IHR5cGU6IFwiU0NSQVBFX0pPQlwiIH0pLFxuICAgIHNjcmFwZUpvYkxpc3Q6ICgpID0+ICh7IHR5cGU6IFwiU0NSQVBFX0pPQl9MSVNUXCIgfSksXG4gICAgaW1wb3J0Sm9iOiAoam9iKSA9PiAoe1xuICAgICAgICB0eXBlOiBcIklNUE9SVF9KT0JcIixcbiAgICAgICAgcGF5bG9hZDogam9iLFxuICAgIH0pLFxuICAgIGltcG9ydEpvYnNCYXRjaDogKGpvYnMpID0+ICh7XG4gICAgICAgIHR5cGU6IFwiSU1QT1JUX0pPQlNfQkFUQ0hcIixcbiAgICAgICAgcGF5bG9hZDogam9icyxcbiAgICB9KSxcbiAgICB0cmFja0FwcGxpZWQ6IChwYXlsb2FkKSA9PiAoe1xuICAgICAgICB0eXBlOiBcIlRSQUNLX0FQUExJRURcIixcbiAgICAgICAgcGF5bG9hZCxcbiAgICB9KSxcbiAgICBvcGVuRGFzaGJvYXJkOiAoKSA9PiAoeyB0eXBlOiBcIk9QRU5fREFTSEJPQVJEXCIgfSksXG4gICAgY2FwdHVyZVZpc2libGVUYWI6ICgpID0+ICh7IHR5cGU6IFwiQ0FQVFVSRV9WSVNJQkxFX1RBQlwiIH0pLFxuICAgIHRhaWxvckZyb21QYWdlOiAoam9iLCBiYXNlUmVzdW1lSWQpID0+ICh7XG4gICAgICAgIHR5cGU6IFwiVEFJTE9SX0ZST01fUEFHRVwiLFxuICAgICAgICBwYXlsb2FkOiB7IGpvYiwgYmFzZVJlc3VtZUlkIH0sXG4gICAgfSksXG4gICAgZ2VuZXJhdGVDb3ZlckxldHRlckZyb21QYWdlOiAoam9iKSA9PiAoe1xuICAgICAgICB0eXBlOiBcIkdFTkVSQVRFX0NPVkVSX0xFVFRFUl9GUk9NX1BBR0VcIixcbiAgICAgICAgcGF5bG9hZDogam9iLFxuICAgIH0pLFxuICAgIC8qKiAjMzQg4oCUIGZldGNoIHRoZSB1c2VyJ3MgcmVjZW50bHktc2F2ZWQgdGFpbG9yZWQgcmVzdW1lcyBmb3IgdGhlIHBpY2tlci4gKi9cbiAgICBsaXN0UmVzdW1lczogKCkgPT4gKHsgdHlwZTogXCJMSVNUX1JFU1VNRVNcIiB9KSxcbiAgICAvLyBMZWFybmluZyBtZXNzYWdlc1xuICAgIHNhdmVBbnN3ZXI6IChkYXRhKSA9PiAoe1xuICAgICAgICB0eXBlOiBcIlNBVkVfQU5TV0VSXCIsXG4gICAgICAgIHBheWxvYWQ6IGRhdGEsXG4gICAgfSksXG4gICAgc2VhcmNoQW5zd2VyczogKHF1ZXN0aW9uKSA9PiAoe1xuICAgICAgICB0eXBlOiBcIlNFQVJDSF9BTlNXRVJTXCIsXG4gICAgICAgIHBheWxvYWQ6IHF1ZXN0aW9uLFxuICAgIH0pLFxuICAgIG1hdGNoQW5zd2VyQmFuazogKHBheWxvYWQpID0+ICh7XG4gICAgICAgIHR5cGU6IFwiTUFUQ0hfQU5TV0VSX0JBTktcIixcbiAgICAgICAgcGF5bG9hZCxcbiAgICB9KSxcbiAgICBqb2JEZXRlY3RlZDogKG1ldGEpID0+ICh7XG4gICAgICAgIHR5cGU6IFwiSk9CX0RFVEVDVEVEXCIsXG4gICAgICAgIHBheWxvYWQ6IG1ldGEsXG4gICAgfSksXG4gICAgLy8gV2F0ZXJsb29Xb3Jrcy1zcGVjaWZpYyBidWxrIHNjcmFwaW5nIChkcml2ZW4gZnJvbSBwb3B1cCwgZXhlY3V0ZWQgaW4gY29udGVudFxuICAgIC8vIHNjcmlwdCBieSB3YXRlcmxvby13b3Jrcy1vcmNoZXN0cmF0b3IudHMpLlxuICAgIHd3U2NyYXBlQWxsVmlzaWJsZTogKCkgPT4gKHtcbiAgICAgICAgdHlwZTogXCJXV19TQ1JBUEVfQUxMX1ZJU0lCTEVcIixcbiAgICB9KSxcbiAgICB3d1NjcmFwZUFsbFBhZ2luYXRlZDogKG9wdHMpID0+ICh7XG4gICAgICAgIHR5cGU6IFwiV1dfU0NSQVBFX0FMTF9QQUdJTkFURURcIixcbiAgICAgICAgcGF5bG9hZDogb3B0cyA/PyB7fSxcbiAgICB9KSxcbiAgICB3d0dldFBhZ2VTdGF0ZTogKCkgPT4gKHsgdHlwZTogXCJXV19HRVRfUEFHRV9TVEFURVwiIH0pLFxuICAgIC8vIFAzLyMzOSDigJQgQnVsayBzY3JhcGluZyBmb3IgcHVibGljIEFUUyBib2FyZCBob3N0cy4gUG9wdXAg4oaSIGNvbnRlbnQtc2NyaXB0LlxuICAgIC8vIEVhY2ggcGFpciBtaXJyb3JzIHRoZSBXVyBzaGFwZSBzbyB0aGUgc2FtZSBgQnVsa1NvdXJjZUNhcmRgIFVYIGNhbiBkcml2ZVxuICAgIC8vIGV2ZXJ5IHNvdXJjZS4gRWFjaCBvcmNoZXN0cmF0b3IgY2FwcyBhdCAyMDAvc2Vzc2lvbiAob3ZlcnJpZGFibGUgYmVsb3cpLlxuICAgIGJ1bGtHcmVlbmhvdXNlR2V0UGFnZVN0YXRlOiAoKSA9PiAoe1xuICAgICAgICB0eXBlOiBcIkJVTEtfR1JFRU5IT1VTRV9HRVRfUEFHRV9TVEFURVwiLFxuICAgIH0pLFxuICAgIGJ1bGtHcmVlbmhvdXNlU2NyYXBlVmlzaWJsZTogKCkgPT4gKHtcbiAgICAgICAgdHlwZTogXCJCVUxLX0dSRUVOSE9VU0VfU0NSQVBFX1ZJU0lCTEVcIixcbiAgICB9KSxcbiAgICBidWxrR3JlZW5ob3VzZVNjcmFwZVBhZ2luYXRlZDogKG9wdHMpID0+ICh7XG4gICAgICAgIHR5cGU6IFwiQlVMS19HUkVFTkhPVVNFX1NDUkFQRV9QQUdJTkFURURcIixcbiAgICAgICAgcGF5bG9hZDogb3B0cyA/PyB7fSxcbiAgICB9KSxcbiAgICBidWxrTGV2ZXJHZXRQYWdlU3RhdGU6ICgpID0+ICh7XG4gICAgICAgIHR5cGU6IFwiQlVMS19MRVZFUl9HRVRfUEFHRV9TVEFURVwiLFxuICAgIH0pLFxuICAgIGJ1bGtMZXZlclNjcmFwZVZpc2libGU6ICgpID0+ICh7XG4gICAgICAgIHR5cGU6IFwiQlVMS19MRVZFUl9TQ1JBUEVfVklTSUJMRVwiLFxuICAgIH0pLFxuICAgIGJ1bGtMZXZlclNjcmFwZVBhZ2luYXRlZDogKG9wdHMpID0+ICh7XG4gICAgICAgIHR5cGU6IFwiQlVMS19MRVZFUl9TQ1JBUEVfUEFHSU5BVEVEXCIsXG4gICAgICAgIHBheWxvYWQ6IG9wdHMgPz8ge30sXG4gICAgfSksXG4gICAgYnVsa1dvcmtkYXlHZXRQYWdlU3RhdGU6ICgpID0+ICh7XG4gICAgICAgIHR5cGU6IFwiQlVMS19XT1JLREFZX0dFVF9QQUdFX1NUQVRFXCIsXG4gICAgfSksXG4gICAgYnVsa1dvcmtkYXlTY3JhcGVWaXNpYmxlOiAoKSA9PiAoe1xuICAgICAgICB0eXBlOiBcIkJVTEtfV09SS0RBWV9TQ1JBUEVfVklTSUJMRVwiLFxuICAgIH0pLFxuICAgIGJ1bGtXb3JrZGF5U2NyYXBlUGFnaW5hdGVkOiAob3B0cykgPT4gKHtcbiAgICAgICAgdHlwZTogXCJCVUxLX1dPUktEQVlfU0NSQVBFX1BBR0lOQVRFRFwiLFxuICAgICAgICBwYXlsb2FkOiBvcHRzID8/IHt9LFxuICAgIH0pLFxuICAgIC8vIFA0LyM0MCDigJQgSGVscGVyIGZvciB0aGUgY2hhdC1wb3J0IHN0YXJ0IGZyYW1lLiBUaGUgYWN0dWFsIHN0cmVhbSB1c2VzIGFcbiAgICAvLyBsb25nLWxpdmVkIGNocm9tZS5ydW50aW1lLmNvbm5lY3QgcG9ydCAoQ0hBVF9QT1JUX05BTUUpIHJhdGhlciB0aGFuXG4gICAgLy8gY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UsIGJ1dCBleHBvc2luZyBhIHR5cGVkIGJ1aWxkZXIga2VlcHMgY2FsbHNpdGVzXG4gICAgLy8gc2VsZi1kb2N1bWVudGluZy5cbiAgICBjaGF0U3RyZWFtU3RhcnQ6IChwYXlsb2FkKSA9PiAoe1xuICAgICAgICB0eXBlOiBcIkNIQVRfU1RSRUFNX1NUQVJUXCIsXG4gICAgICAgIHByb21wdDogcGF5bG9hZC5wcm9tcHQsXG4gICAgICAgIGpvYkNvbnRleHQ6IHBheWxvYWQuam9iQ29udGV4dCxcbiAgICB9KSxcbiAgICAvLyBDb3JyZWN0aW9ucyBmZWVkYmFjayBsb29wICgjMzMpLiBGaXJlZCB3aGVuIGEgdXNlciBlZGl0cyBhbiBhdXRvZmlsbGVkXG4gICAgLy8gZmllbGQgYW5kIHRoZSBmaW5hbCB2YWx1ZSBkaWZmZXJzIGZyb20gdGhlIG9yaWdpbmFsIHN1Z2dlc3Rpb24g4oCUIHRoZVxuICAgIC8vIGJhY2tncm91bmQgZm9yd2FyZHMgaXQgdG8gL2FwaS9leHRlbnNpb24vZmllbGQtbWFwcGluZ3MvY29ycmVjdCBzb1xuICAgIC8vIGZ1dHVyZSBhdXRvZmlsbHMgb24gdGhlIHNhbWUgZG9tYWluIHByZWZlciB0aGUgY29ycmVjdGVkIHZhbHVlLlxuICAgIHNhdmVDb3JyZWN0aW9uOiAocGF5bG9hZCkgPT4gKHtcbiAgICAgICAgdHlwZTogXCJTQVZFX0NPUlJFQ1RJT05cIixcbiAgICAgICAgcGF5bG9hZCxcbiAgICB9KSxcbiAgICAvLyBQMyAvICMzNiAjMzcg4oCUIG11bHRpLXN0ZXAgZm9ybSBzdXBwb3J0IChXb3JrZGF5LCBHcmVlbmhvdXNlKS5cbiAgICAvKiogQmFja2dyb3VuZCDihpIgY29udGVudDogYSBzdGVwIHRyYW5zaXRpb24ganVzdCBmaXJlZCBmb3IgdGhpcyB0YWIuICovXG4gICAgbXVsdGlzdGVwU3RlcFRyYW5zaXRpb246IChwYXlsb2FkKSA9PiAoe1xuICAgICAgICB0eXBlOiBcIk1VTFRJU1RFUF9TVEVQX1RSQU5TSVRJT05cIixcbiAgICAgICAgcGF5bG9hZCxcbiAgICB9KSxcbiAgICAvKiogQ29udGVudCDihpIgYmFja2dyb3VuZDogcmV0dXJuIHRoZSBjdXJyZW50IHRhYiBpZC4gKi9cbiAgICBnZXRUYWJJZDogKCkgPT4gKHsgdHlwZTogXCJHRVRfVEFCX0lEXCIgfSksXG4gICAgLyoqXG4gICAgICogQ29udGVudCDihpIgYmFja2dyb3VuZDogZW5zdXJlIHRoZSBgd2ViTmF2aWdhdGlvbmAgcGVybWlzc2lvbiBpcyBncmFudGVkLlxuICAgICAqIEluIENocm9tZSBNVjMgaXQncyBkZWNsYXJlZCBhdCBpbnN0YWxsIHRpbWUgYW5kIHRoZSByZXNwb25zZSBpcyBhbHdheXNcbiAgICAgKiBgeyBncmFudGVkOiB0cnVlIH1gLiBJbiBGaXJlZm94IE1WMiB0aGUgYmFja2dyb3VuZCBjYWxsc1xuICAgICAqIGBicm93c2VyLnBlcm1pc3Npb25zLnJlcXVlc3QoLi4uKWAgYW5kIHJldHVybnMgdGhlIHVzZXIncyB2ZXJkaWN0LlxuICAgICAqL1xuICAgIHJlcXVlc3RXZWJOYXZpZ2F0aW9uUGVybWlzc2lvbjogKCkgPT4gKHtcbiAgICAgICAgdHlwZTogXCJSRVFVRVNUX1dFQk5BVklHQVRJT05fUEVSTUlTU0lPTlwiLFxuICAgIH0pLFxuICAgIC8qKiBDb250ZW50IOKGkiBiYWNrZ3JvdW5kOiBpcyBgd2ViTmF2aWdhdGlvbmAgY3VycmVudGx5IHVzYWJsZT8gKi9cbiAgICBoYXNXZWJOYXZpZ2F0aW9uUGVybWlzc2lvbjogKCkgPT4gKHtcbiAgICAgICAgdHlwZTogXCJIQVNfV0VCTkFWSUdBVElPTl9QRVJNSVNTSU9OXCIsXG4gICAgfSksXG59O1xuLy8gU2VuZCBtZXNzYWdlIHRvIGJhY2tncm91bmQgc2NyaXB0XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2VuZE1lc3NhZ2UobWVzc2FnZSkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZShtZXNzYWdlLCAocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgIGlmIChjaHJvbWUucnVudGltZS5sYXN0RXJyb3IpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBjaHJvbWUucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzcG9uc2UgfHwgeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IFwiTm8gcmVzcG9uc2UgcmVjZWl2ZWRcIiB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG4vLyBTZW5kIG1lc3NhZ2UgdG8gY29udGVudCBzY3JpcHQgaW4gc3BlY2lmaWMgdGFiXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2VuZFRvVGFiKHRhYklkLCBtZXNzYWdlKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYklkLCBtZXNzYWdlLCAocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgIGlmIChjaHJvbWUucnVudGltZS5sYXN0RXJyb3IpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBjaHJvbWUucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzcG9uc2UgfHwgeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IFwiTm8gcmVzcG9uc2UgcmVjZWl2ZWRcIiB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG4vLyBTZW5kIG1lc3NhZ2UgdG8gYWxsIGNvbnRlbnQgc2NyaXB0c1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGJyb2FkY2FzdE1lc3NhZ2UobWVzc2FnZSkge1xuICAgIGNvbnN0IHRhYnMgPSBhd2FpdCBjaHJvbWUudGFicy5xdWVyeSh7fSk7XG4gICAgZm9yIChjb25zdCB0YWIgb2YgdGFicykge1xuICAgICAgICBpZiAodGFiLmlkKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGF3YWl0IGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYi5pZCwgbWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCB7XG4gICAgICAgICAgICAgICAgLy8gVGFiIG1pZ2h0IG5vdCBoYXZlIGNvbnRlbnQgc2NyaXB0IGxvYWRlZFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuIiwiLyoqXG4gKiBQNC8jNDAg4oCUIExvbmctbGl2ZWQgcG9ydCBuYW1lIHVzZWQgYnkgdGhlIGlubGluZSBBSSBhc3Npc3RhbnQuIFRoZSBjb250ZW50XG4gKiBzY3JpcHQgY2FsbHMgYGNocm9tZS5ydW50aW1lLmNvbm5lY3QoeyBuYW1lOiBDSEFUX1BPUlRfTkFNRSB9KWAgYW5kIHRoZVxuICogYmFja2dyb3VuZCdzIGBjaHJvbWUucnVudGltZS5vbkNvbm5lY3RgIGxpc3RlbmVyIGZpbHRlcnMgYnkgdGhpcyBuYW1lLlxuICovXG5leHBvcnQgY29uc3QgQ0hBVF9QT1JUX05BTUUgPSBcInNsb3RoaW5nLWNoYXQtc3RyZWFtXCI7XG5leHBvcnQgY29uc3QgREVGQVVMVF9TRVRUSU5HUyA9IHtcbiAgICBhdXRvRmlsbEVuYWJsZWQ6IHRydWUsXG4gICAgc2hvd0NvbmZpZGVuY2VJbmRpY2F0b3JzOiB0cnVlLFxuICAgIG1pbmltdW1Db25maWRlbmNlOiAwLjUsXG4gICAgbGVhcm5Gcm9tQW5zd2VyczogdHJ1ZSxcbiAgICBub3RpZnlPbkpvYkRldGVjdGVkOiB0cnVlLFxuICAgIGF1dG9UcmFja0FwcGxpY2F0aW9uc0VuYWJsZWQ6IHRydWUsXG4gICAgY2FwdHVyZVNjcmVlbnNob3RFbmFibGVkOiBmYWxzZSxcbiAgICBzY3JhcGVUaHJvdHRsZU1zOiA1MDAsXG4gICAgc2NyYXBlQ2h1bmtTaXplOiA1LFxuICAgIHNjcmFwZU1heEpvYnM6IDIwMCxcbiAgICBzY3JhcGVNYXhQYWdlczogNTAsXG4gICAgc2NyYXBlRGVkdXBlRW5hYmxlZDogdHJ1ZSxcbn07XG5leHBvcnQgY29uc3QgTEVHQUNZX0xPQ0FMX0FQSV9CQVNFX1VSTCA9IFwiaHR0cDovL2xvY2FsaG9zdDozMDAwXCI7XG5leHBvcnQgY29uc3QgREVGQVVMVF9BUElfQkFTRV9VUkwgPSBwcm9jZXNzLmVudi5TTE9USElOR19FWFRFTlNJT05fQVBJX0JBU0VfVVJMIHx8IFwiaHR0cHM6Ly9zbG90aGluZy53b3JrXCI7XG5leHBvcnQgY29uc3QgU0hPVUxEX1BST01PVEVfTEVHQUNZX0xPQ0FMX0FQSV9CQVNFX1VSTCA9IERFRkFVTFRfQVBJX0JBU0VfVVJMICE9PSBMRUdBQ1lfTE9DQUxfQVBJX0JBU0VfVVJMO1xuIiwiKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgZGVmaW5lKFwid2ViZXh0ZW5zaW9uLXBvbHlmaWxsXCIsIFtcIm1vZHVsZVwiXSwgZmFjdG9yeSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBmYWN0b3J5KG1vZHVsZSk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIG1vZCA9IHtcbiAgICAgIGV4cG9ydHM6IHt9XG4gICAgfTtcbiAgICBmYWN0b3J5KG1vZCk7XG4gICAgZ2xvYmFsLmJyb3dzZXIgPSBtb2QuZXhwb3J0cztcbiAgfVxufSkodHlwZW9mIGdsb2JhbFRoaXMgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxUaGlzIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdGhpcywgZnVuY3Rpb24gKG1vZHVsZSkge1xuICAvKiB3ZWJleHRlbnNpb24tcG9seWZpbGwgLSB2MC4xMC4wIC0gRnJpIEF1ZyAxMiAyMDIyIDE5OjQyOjQ0ICovXG5cbiAgLyogLSotIE1vZGU6IGluZGVudC10YWJzLW1vZGU6IG5pbDsganMtaW5kZW50LWxldmVsOiAyIC0qLSAqL1xuXG4gIC8qIHZpbTogc2V0IHN0cz0yIHN3PTIgZXQgdHc9ODA6ICovXG5cbiAgLyogVGhpcyBTb3VyY2UgQ29kZSBGb3JtIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zIG9mIHRoZSBNb3ppbGxhIFB1YmxpY1xuICAgKiBMaWNlbnNlLCB2LiAyLjAuIElmIGEgY29weSBvZiB0aGUgTVBMIHdhcyBub3QgZGlzdHJpYnV0ZWQgd2l0aCB0aGlzXG4gICAqIGZpbGUsIFlvdSBjYW4gb2J0YWluIG9uZSBhdCBodHRwOi8vbW96aWxsYS5vcmcvTVBMLzIuMC8uICovXG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIGlmICghZ2xvYmFsVGhpcy5jaHJvbWU/LnJ1bnRpbWU/LmlkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVGhpcyBzY3JpcHQgc2hvdWxkIG9ubHkgYmUgbG9hZGVkIGluIGEgYnJvd3NlciBleHRlbnNpb24uXCIpO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBnbG9iYWxUaGlzLmJyb3dzZXIgPT09IFwidW5kZWZpbmVkXCIgfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKGdsb2JhbFRoaXMuYnJvd3NlcikgIT09IE9iamVjdC5wcm90b3R5cGUpIHtcbiAgICBjb25zdCBDSFJPTUVfU0VORF9NRVNTQUdFX0NBTExCQUNLX05PX1JFU1BPTlNFX01FU1NBR0UgPSBcIlRoZSBtZXNzYWdlIHBvcnQgY2xvc2VkIGJlZm9yZSBhIHJlc3BvbnNlIHdhcyByZWNlaXZlZC5cIjsgLy8gV3JhcHBpbmcgdGhlIGJ1bGsgb2YgdGhpcyBwb2x5ZmlsbCBpbiBhIG9uZS10aW1lLXVzZSBmdW5jdGlvbiBpcyBhIG1pbm9yXG4gICAgLy8gb3B0aW1pemF0aW9uIGZvciBGaXJlZm94LiBTaW5jZSBTcGlkZXJtb25rZXkgZG9lcyBub3QgZnVsbHkgcGFyc2UgdGhlXG4gICAgLy8gY29udGVudHMgb2YgYSBmdW5jdGlvbiB1bnRpbCB0aGUgZmlyc3QgdGltZSBpdCdzIGNhbGxlZCwgYW5kIHNpbmNlIGl0IHdpbGxcbiAgICAvLyBuZXZlciBhY3R1YWxseSBuZWVkIHRvIGJlIGNhbGxlZCwgdGhpcyBhbGxvd3MgdGhlIHBvbHlmaWxsIHRvIGJlIGluY2x1ZGVkXG4gICAgLy8gaW4gRmlyZWZveCBuZWFybHkgZm9yIGZyZWUuXG5cbiAgICBjb25zdCB3cmFwQVBJcyA9IGV4dGVuc2lvbkFQSXMgPT4ge1xuICAgICAgLy8gTk9URTogYXBpTWV0YWRhdGEgaXMgYXNzb2NpYXRlZCB0byB0aGUgY29udGVudCBvZiB0aGUgYXBpLW1ldGFkYXRhLmpzb24gZmlsZVxuICAgICAgLy8gYXQgYnVpbGQgdGltZSBieSByZXBsYWNpbmcgdGhlIGZvbGxvd2luZyBcImluY2x1ZGVcIiB3aXRoIHRoZSBjb250ZW50IG9mIHRoZVxuICAgICAgLy8gSlNPTiBmaWxlLlxuICAgICAgY29uc3QgYXBpTWV0YWRhdGEgPSB7XG4gICAgICAgIFwiYWxhcm1zXCI6IHtcbiAgICAgICAgICBcImNsZWFyXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiY2xlYXJBbGxcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRBbGxcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJib29rbWFya3NcIjoge1xuICAgICAgICAgIFwiY3JlYXRlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0XCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0Q2hpbGRyZW5cIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRSZWNlbnRcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRTdWJUcmVlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0VHJlZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcIm1vdmVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDIsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJyZW1vdmVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJyZW1vdmVUcmVlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwic2VhcmNoXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwidXBkYXRlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAyLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwiYnJvd3NlckFjdGlvblwiOiB7XG4gICAgICAgICAgXCJkaXNhYmxlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDEsXG4gICAgICAgICAgICBcImZhbGxiYWNrVG9Ob0NhbGxiYWNrXCI6IHRydWVcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZW5hYmxlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDEsXG4gICAgICAgICAgICBcImZhbGxiYWNrVG9Ob0NhbGxiYWNrXCI6IHRydWVcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0QmFkZ2VCYWNrZ3JvdW5kQ29sb3JcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRCYWRnZVRleHRcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRQb3B1cFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldFRpdGxlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwib3BlblBvcHVwXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwic2V0QmFkZ2VCYWNrZ3JvdW5kQ29sb3JcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwiZmFsbGJhY2tUb05vQ2FsbGJhY2tcIjogdHJ1ZVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJzZXRCYWRnZVRleHRcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwiZmFsbGJhY2tUb05vQ2FsbGJhY2tcIjogdHJ1ZVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJzZXRJY29uXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwic2V0UG9wdXBcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwiZmFsbGJhY2tUb05vQ2FsbGJhY2tcIjogdHJ1ZVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJzZXRUaXRsZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJmYWxsYmFja1RvTm9DYWxsYmFja1wiOiB0cnVlXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcImJyb3dzaW5nRGF0YVwiOiB7XG4gICAgICAgICAgXCJyZW1vdmVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDIsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJyZW1vdmVDYWNoZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInJlbW92ZUNvb2tpZXNcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJyZW1vdmVEb3dubG9hZHNcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJyZW1vdmVGb3JtRGF0YVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInJlbW92ZUhpc3RvcnlcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJyZW1vdmVMb2NhbFN0b3JhZ2VcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJyZW1vdmVQYXNzd29yZHNcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJyZW1vdmVQbHVnaW5EYXRhXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwic2V0dGluZ3NcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJjb21tYW5kc1wiOiB7XG4gICAgICAgICAgXCJnZXRBbGxcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJjb250ZXh0TWVudXNcIjoge1xuICAgICAgICAgIFwicmVtb3ZlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwicmVtb3ZlQWxsXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwidXBkYXRlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAyLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwiY29va2llc1wiOiB7XG4gICAgICAgICAgXCJnZXRcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRBbGxcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRBbGxDb29raWVTdG9yZXNcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJyZW1vdmVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJzZXRcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJkZXZ0b29sc1wiOiB7XG4gICAgICAgICAgXCJpbnNwZWN0ZWRXaW5kb3dcIjoge1xuICAgICAgICAgICAgXCJldmFsXCI6IHtcbiAgICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICAgIFwibWF4QXJnc1wiOiAyLFxuICAgICAgICAgICAgICBcInNpbmdsZUNhbGxiYWNrQXJnXCI6IGZhbHNlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInBhbmVsc1wiOiB7XG4gICAgICAgICAgICBcImNyZWF0ZVwiOiB7XG4gICAgICAgICAgICAgIFwibWluQXJnc1wiOiAzLFxuICAgICAgICAgICAgICBcIm1heEFyZ3NcIjogMyxcbiAgICAgICAgICAgICAgXCJzaW5nbGVDYWxsYmFja0FyZ1wiOiB0cnVlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJlbGVtZW50c1wiOiB7XG4gICAgICAgICAgICAgIFwiY3JlYXRlU2lkZWJhclBhbmVcIjoge1xuICAgICAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwiZG93bmxvYWRzXCI6IHtcbiAgICAgICAgICBcImNhbmNlbFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImRvd25sb2FkXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZXJhc2VcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRGaWxlSWNvblwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcIm9wZW5cIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwiZmFsbGJhY2tUb05vQ2FsbGJhY2tcIjogdHJ1ZVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJwYXVzZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInJlbW92ZUZpbGVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJyZXN1bWVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJzZWFyY2hcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJzaG93XCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDEsXG4gICAgICAgICAgICBcImZhbGxiYWNrVG9Ob0NhbGxiYWNrXCI6IHRydWVcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwiZXh0ZW5zaW9uXCI6IHtcbiAgICAgICAgICBcImlzQWxsb3dlZEZpbGVTY2hlbWVBY2Nlc3NcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJpc0FsbG93ZWRJbmNvZ25pdG9BY2Nlc3NcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJoaXN0b3J5XCI6IHtcbiAgICAgICAgICBcImFkZFVybFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImRlbGV0ZUFsbFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImRlbGV0ZVJhbmdlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZGVsZXRlVXJsXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0VmlzaXRzXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwic2VhcmNoXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwiaTE4blwiOiB7XG4gICAgICAgICAgXCJkZXRlY3RMYW5ndWFnZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldEFjY2VwdExhbmd1YWdlc1wiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcImlkZW50aXR5XCI6IHtcbiAgICAgICAgICBcImxhdW5jaFdlYkF1dGhGbG93XCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwiaWRsZVwiOiB7XG4gICAgICAgICAgXCJxdWVyeVN0YXRlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwibWFuYWdlbWVudFwiOiB7XG4gICAgICAgICAgXCJnZXRcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRBbGxcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRTZWxmXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwic2V0RW5hYmxlZFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMixcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInVuaW5zdGFsbFNlbGZcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJub3RpZmljYXRpb25zXCI6IHtcbiAgICAgICAgICBcImNsZWFyXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiY3JlYXRlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0QWxsXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0UGVybWlzc2lvbkxldmVsXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwidXBkYXRlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAyLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwicGFnZUFjdGlvblwiOiB7XG4gICAgICAgICAgXCJnZXRQb3B1cFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldFRpdGxlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiaGlkZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJmYWxsYmFja1RvTm9DYWxsYmFja1wiOiB0cnVlXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInNldEljb25cIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJzZXRQb3B1cFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJmYWxsYmFja1RvTm9DYWxsYmFja1wiOiB0cnVlXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInNldFRpdGxlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDEsXG4gICAgICAgICAgICBcImZhbGxiYWNrVG9Ob0NhbGxiYWNrXCI6IHRydWVcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwic2hvd1wiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJmYWxsYmFja1RvTm9DYWxsYmFja1wiOiB0cnVlXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcInBlcm1pc3Npb25zXCI6IHtcbiAgICAgICAgICBcImNvbnRhaW5zXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0QWxsXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwicmVtb3ZlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwicmVxdWVzdFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcInJ1bnRpbWVcIjoge1xuICAgICAgICAgIFwiZ2V0QmFja2dyb3VuZFBhZ2VcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRQbGF0Zm9ybUluZm9cIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJvcGVuT3B0aW9uc1BhZ2VcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJyZXF1ZXN0VXBkYXRlQ2hlY2tcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJzZW5kTWVzc2FnZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAzXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInNlbmROYXRpdmVNZXNzYWdlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAyLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwic2V0VW5pbnN0YWxsVVJMXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwic2Vzc2lvbnNcIjoge1xuICAgICAgICAgIFwiZ2V0RGV2aWNlc1wiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldFJlY2VudGx5Q2xvc2VkXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwicmVzdG9yZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcInN0b3JhZ2VcIjoge1xuICAgICAgICAgIFwibG9jYWxcIjoge1xuICAgICAgICAgICAgXCJjbGVhclwiOiB7XG4gICAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiZ2V0XCI6IHtcbiAgICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJnZXRCeXRlc0luVXNlXCI6IHtcbiAgICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJyZW1vdmVcIjoge1xuICAgICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInNldFwiOiB7XG4gICAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJtYW5hZ2VkXCI6IHtcbiAgICAgICAgICAgIFwiZ2V0XCI6IHtcbiAgICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJnZXRCeXRlc0luVXNlXCI6IHtcbiAgICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInN5bmNcIjoge1xuICAgICAgICAgICAgXCJjbGVhclwiOiB7XG4gICAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiZ2V0XCI6IHtcbiAgICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJnZXRCeXRlc0luVXNlXCI6IHtcbiAgICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJyZW1vdmVcIjoge1xuICAgICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInNldFwiOiB7XG4gICAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJ0YWJzXCI6IHtcbiAgICAgICAgICBcImNhcHR1cmVWaXNpYmxlVGFiXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiY3JlYXRlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZGV0ZWN0TGFuZ3VhZ2VcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJkaXNjYXJkXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZHVwbGljYXRlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZXhlY3V0ZVNjcmlwdFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldEN1cnJlbnRcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRab29tXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0Wm9vbVNldHRpbmdzXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ29CYWNrXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ29Gb3J3YXJkXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiaGlnaGxpZ2h0XCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiaW5zZXJ0Q1NTXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwibW92ZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMixcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInF1ZXJ5XCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwicmVsb2FkXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwicmVtb3ZlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwicmVtb3ZlQ1NTXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwic2VuZE1lc3NhZ2VcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDIsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogM1xuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJzZXRab29tXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwic2V0Wm9vbVNldHRpbmdzXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwidXBkYXRlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwidG9wU2l0ZXNcIjoge1xuICAgICAgICAgIFwiZ2V0XCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwid2ViTmF2aWdhdGlvblwiOiB7XG4gICAgICAgICAgXCJnZXRBbGxGcmFtZXNcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRGcmFtZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcIndlYlJlcXVlc3RcIjoge1xuICAgICAgICAgIFwiaGFuZGxlckJlaGF2aW9yQ2hhbmdlZFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcIndpbmRvd3NcIjoge1xuICAgICAgICAgIFwiY3JlYXRlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0XCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0QWxsXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0Q3VycmVudFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldExhc3RGb2N1c2VkXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwicmVtb3ZlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwidXBkYXRlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAyLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGlmIChPYmplY3Qua2V5cyhhcGlNZXRhZGF0YSkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImFwaS1tZXRhZGF0YS5qc29uIGhhcyBub3QgYmVlbiBpbmNsdWRlZCBpbiBicm93c2VyLXBvbHlmaWxsXCIpO1xuICAgICAgfVxuICAgICAgLyoqXG4gICAgICAgKiBBIFdlYWtNYXAgc3ViY2xhc3Mgd2hpY2ggY3JlYXRlcyBhbmQgc3RvcmVzIGEgdmFsdWUgZm9yIGFueSBrZXkgd2hpY2ggZG9lc1xuICAgICAgICogbm90IGV4aXN0IHdoZW4gYWNjZXNzZWQsIGJ1dCBiZWhhdmVzIGV4YWN0bHkgYXMgYW4gb3JkaW5hcnkgV2Vha01hcFxuICAgICAgICogb3RoZXJ3aXNlLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNyZWF0ZUl0ZW1cbiAgICAgICAqICAgICAgICBBIGZ1bmN0aW9uIHdoaWNoIHdpbGwgYmUgY2FsbGVkIGluIG9yZGVyIHRvIGNyZWF0ZSB0aGUgdmFsdWUgZm9yIGFueVxuICAgICAgICogICAgICAgIGtleSB3aGljaCBkb2VzIG5vdCBleGlzdCwgdGhlIGZpcnN0IHRpbWUgaXQgaXMgYWNjZXNzZWQuIFRoZVxuICAgICAgICogICAgICAgIGZ1bmN0aW9uIHJlY2VpdmVzLCBhcyBpdHMgb25seSBhcmd1bWVudCwgdGhlIGtleSBiZWluZyBjcmVhdGVkLlxuICAgICAgICovXG5cblxuICAgICAgY2xhc3MgRGVmYXVsdFdlYWtNYXAgZXh0ZW5kcyBXZWFrTWFwIHtcbiAgICAgICAgY29uc3RydWN0b3IoY3JlYXRlSXRlbSwgaXRlbXMgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBzdXBlcihpdGVtcyk7XG4gICAgICAgICAgdGhpcy5jcmVhdGVJdGVtID0gY3JlYXRlSXRlbTtcbiAgICAgICAgfVxuXG4gICAgICAgIGdldChrZXkpIHtcbiAgICAgICAgICBpZiAoIXRoaXMuaGFzKGtleSkpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KGtleSwgdGhpcy5jcmVhdGVJdGVtKGtleSkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBzdXBlci5nZXQoa2V5KTtcbiAgICAgICAgfVxuXG4gICAgICB9XG4gICAgICAvKipcbiAgICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgZ2l2ZW4gb2JqZWN0IGlzIGFuIG9iamVjdCB3aXRoIGEgYHRoZW5gIG1ldGhvZCwgYW5kIGNhblxuICAgICAgICogdGhlcmVmb3JlIGJlIGFzc3VtZWQgdG8gYmVoYXZlIGFzIGEgUHJvbWlzZS5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byB0ZXN0LlxuICAgICAgICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHZhbHVlIGlzIHRoZW5hYmxlLlxuICAgICAgICovXG5cblxuICAgICAgY29uc3QgaXNUaGVuYWJsZSA9IHZhbHVlID0+IHtcbiAgICAgICAgcmV0dXJuIHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgdmFsdWUudGhlbiA9PT0gXCJmdW5jdGlvblwiO1xuICAgICAgfTtcbiAgICAgIC8qKlxuICAgICAgICogQ3JlYXRlcyBhbmQgcmV0dXJucyBhIGZ1bmN0aW9uIHdoaWNoLCB3aGVuIGNhbGxlZCwgd2lsbCByZXNvbHZlIG9yIHJlamVjdFxuICAgICAgICogdGhlIGdpdmVuIHByb21pc2UgYmFzZWQgb24gaG93IGl0IGlzIGNhbGxlZDpcbiAgICAgICAqXG4gICAgICAgKiAtIElmLCB3aGVuIGNhbGxlZCwgYGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcmAgY29udGFpbnMgYSBub24tbnVsbCBvYmplY3QsXG4gICAgICAgKiAgIHRoZSBwcm9taXNlIGlzIHJlamVjdGVkIHdpdGggdGhhdCB2YWx1ZS5cbiAgICAgICAqIC0gSWYgdGhlIGZ1bmN0aW9uIGlzIGNhbGxlZCB3aXRoIGV4YWN0bHkgb25lIGFyZ3VtZW50LCB0aGUgcHJvbWlzZSBpc1xuICAgICAgICogICByZXNvbHZlZCB0byB0aGF0IHZhbHVlLlxuICAgICAgICogLSBPdGhlcndpc2UsIHRoZSBwcm9taXNlIGlzIHJlc29sdmVkIHRvIGFuIGFycmF5IGNvbnRhaW5pbmcgYWxsIG9mIHRoZVxuICAgICAgICogICBmdW5jdGlvbidzIGFyZ3VtZW50cy5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0ge29iamVjdH0gcHJvbWlzZVxuICAgICAgICogICAgICAgIEFuIG9iamVjdCBjb250YWluaW5nIHRoZSByZXNvbHV0aW9uIGFuZCByZWplY3Rpb24gZnVuY3Rpb25zIG9mIGFcbiAgICAgICAqICAgICAgICBwcm9taXNlLlxuICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gcHJvbWlzZS5yZXNvbHZlXG4gICAgICAgKiAgICAgICAgVGhlIHByb21pc2UncyByZXNvbHV0aW9uIGZ1bmN0aW9uLlxuICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gcHJvbWlzZS5yZWplY3RcbiAgICAgICAqICAgICAgICBUaGUgcHJvbWlzZSdzIHJlamVjdGlvbiBmdW5jdGlvbi5cbiAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBtZXRhZGF0YVxuICAgICAgICogICAgICAgIE1ldGFkYXRhIGFib3V0IHRoZSB3cmFwcGVkIG1ldGhvZCB3aGljaCBoYXMgY3JlYXRlZCB0aGUgY2FsbGJhY2suXG4gICAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IG1ldGFkYXRhLnNpbmdsZUNhbGxiYWNrQXJnXG4gICAgICAgKiAgICAgICAgV2hldGhlciBvciBub3QgdGhlIHByb21pc2UgaXMgcmVzb2x2ZWQgd2l0aCBvbmx5IHRoZSBmaXJzdFxuICAgICAgICogICAgICAgIGFyZ3VtZW50IG9mIHRoZSBjYWxsYmFjaywgYWx0ZXJuYXRpdmVseSBhbiBhcnJheSBvZiBhbGwgdGhlXG4gICAgICAgKiAgICAgICAgY2FsbGJhY2sgYXJndW1lbnRzIGlzIHJlc29sdmVkLiBCeSBkZWZhdWx0LCBpZiB0aGUgY2FsbGJhY2tcbiAgICAgICAqICAgICAgICBmdW5jdGlvbiBpcyBpbnZva2VkIHdpdGggb25seSBhIHNpbmdsZSBhcmd1bWVudCwgdGhhdCB3aWxsIGJlXG4gICAgICAgKiAgICAgICAgcmVzb2x2ZWQgdG8gdGhlIHByb21pc2UsIHdoaWxlIGFsbCBhcmd1bWVudHMgd2lsbCBiZSByZXNvbHZlZCBhc1xuICAgICAgICogICAgICAgIGFuIGFycmF5IGlmIG11bHRpcGxlIGFyZSBnaXZlbi5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJucyB7ZnVuY3Rpb259XG4gICAgICAgKiAgICAgICAgVGhlIGdlbmVyYXRlZCBjYWxsYmFjayBmdW5jdGlvbi5cbiAgICAgICAqL1xuXG5cbiAgICAgIGNvbnN0IG1ha2VDYWxsYmFjayA9IChwcm9taXNlLCBtZXRhZGF0YSkgPT4ge1xuICAgICAgICByZXR1cm4gKC4uLmNhbGxiYWNrQXJncykgPT4ge1xuICAgICAgICAgIGlmIChleHRlbnNpb25BUElzLnJ1bnRpbWUubGFzdEVycm9yKSB7XG4gICAgICAgICAgICBwcm9taXNlLnJlamVjdChuZXcgRXJyb3IoZXh0ZW5zaW9uQVBJcy5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlKSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChtZXRhZGF0YS5zaW5nbGVDYWxsYmFja0FyZyB8fCBjYWxsYmFja0FyZ3MubGVuZ3RoIDw9IDEgJiYgbWV0YWRhdGEuc2luZ2xlQ2FsbGJhY2tBcmcgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICBwcm9taXNlLnJlc29sdmUoY2FsbGJhY2tBcmdzWzBdKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcHJvbWlzZS5yZXNvbHZlKGNhbGxiYWNrQXJncyk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfTtcblxuICAgICAgY29uc3QgcGx1cmFsaXplQXJndW1lbnRzID0gbnVtQXJncyA9PiBudW1BcmdzID09IDEgPyBcImFyZ3VtZW50XCIgOiBcImFyZ3VtZW50c1wiO1xuICAgICAgLyoqXG4gICAgICAgKiBDcmVhdGVzIGEgd3JhcHBlciBmdW5jdGlvbiBmb3IgYSBtZXRob2Qgd2l0aCB0aGUgZ2l2ZW4gbmFtZSBhbmQgbWV0YWRhdGEuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICAgICAqICAgICAgICBUaGUgbmFtZSBvZiB0aGUgbWV0aG9kIHdoaWNoIGlzIGJlaW5nIHdyYXBwZWQuXG4gICAgICAgKiBAcGFyYW0ge29iamVjdH0gbWV0YWRhdGFcbiAgICAgICAqICAgICAgICBNZXRhZGF0YSBhYm91dCB0aGUgbWV0aG9kIGJlaW5nIHdyYXBwZWQuXG4gICAgICAgKiBAcGFyYW0ge2ludGVnZXJ9IG1ldGFkYXRhLm1pbkFyZ3NcbiAgICAgICAqICAgICAgICBUaGUgbWluaW11bSBudW1iZXIgb2YgYXJndW1lbnRzIHdoaWNoIG11c3QgYmUgcGFzc2VkIHRvIHRoZVxuICAgICAgICogICAgICAgIGZ1bmN0aW9uLiBJZiBjYWxsZWQgd2l0aCBmZXdlciB0aGFuIHRoaXMgbnVtYmVyIG9mIGFyZ3VtZW50cywgdGhlXG4gICAgICAgKiAgICAgICAgd3JhcHBlciB3aWxsIHJhaXNlIGFuIGV4Y2VwdGlvbi5cbiAgICAgICAqIEBwYXJhbSB7aW50ZWdlcn0gbWV0YWRhdGEubWF4QXJnc1xuICAgICAgICogICAgICAgIFRoZSBtYXhpbXVtIG51bWJlciBvZiBhcmd1bWVudHMgd2hpY2ggbWF5IGJlIHBhc3NlZCB0byB0aGVcbiAgICAgICAqICAgICAgICBmdW5jdGlvbi4gSWYgY2FsbGVkIHdpdGggbW9yZSB0aGFuIHRoaXMgbnVtYmVyIG9mIGFyZ3VtZW50cywgdGhlXG4gICAgICAgKiAgICAgICAgd3JhcHBlciB3aWxsIHJhaXNlIGFuIGV4Y2VwdGlvbi5cbiAgICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gbWV0YWRhdGEuc2luZ2xlQ2FsbGJhY2tBcmdcbiAgICAgICAqICAgICAgICBXaGV0aGVyIG9yIG5vdCB0aGUgcHJvbWlzZSBpcyByZXNvbHZlZCB3aXRoIG9ubHkgdGhlIGZpcnN0XG4gICAgICAgKiAgICAgICAgYXJndW1lbnQgb2YgdGhlIGNhbGxiYWNrLCBhbHRlcm5hdGl2ZWx5IGFuIGFycmF5IG9mIGFsbCB0aGVcbiAgICAgICAqICAgICAgICBjYWxsYmFjayBhcmd1bWVudHMgaXMgcmVzb2x2ZWQuIEJ5IGRlZmF1bHQsIGlmIHRoZSBjYWxsYmFja1xuICAgICAgICogICAgICAgIGZ1bmN0aW9uIGlzIGludm9rZWQgd2l0aCBvbmx5IGEgc2luZ2xlIGFyZ3VtZW50LCB0aGF0IHdpbGwgYmVcbiAgICAgICAqICAgICAgICByZXNvbHZlZCB0byB0aGUgcHJvbWlzZSwgd2hpbGUgYWxsIGFyZ3VtZW50cyB3aWxsIGJlIHJlc29sdmVkIGFzXG4gICAgICAgKiAgICAgICAgYW4gYXJyYXkgaWYgbXVsdGlwbGUgYXJlIGdpdmVuLlxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm5zIHtmdW5jdGlvbihvYmplY3QsIC4uLiopfVxuICAgICAgICogICAgICAgVGhlIGdlbmVyYXRlZCB3cmFwcGVyIGZ1bmN0aW9uLlxuICAgICAgICovXG5cblxuICAgICAgY29uc3Qgd3JhcEFzeW5jRnVuY3Rpb24gPSAobmFtZSwgbWV0YWRhdGEpID0+IHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIGFzeW5jRnVuY3Rpb25XcmFwcGVyKHRhcmdldCwgLi4uYXJncykge1xuICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCA8IG1ldGFkYXRhLm1pbkFyZ3MpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgYXQgbGVhc3QgJHttZXRhZGF0YS5taW5BcmdzfSAke3BsdXJhbGl6ZUFyZ3VtZW50cyhtZXRhZGF0YS5taW5BcmdzKX0gZm9yICR7bmFtZX0oKSwgZ290ICR7YXJncy5sZW5ndGh9YCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGFyZ3MubGVuZ3RoID4gbWV0YWRhdGEubWF4QXJncykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCBhdCBtb3N0ICR7bWV0YWRhdGEubWF4QXJnc30gJHtwbHVyYWxpemVBcmd1bWVudHMobWV0YWRhdGEubWF4QXJncyl9IGZvciAke25hbWV9KCksIGdvdCAke2FyZ3MubGVuZ3RofWApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBpZiAobWV0YWRhdGEuZmFsbGJhY2tUb05vQ2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgLy8gVGhpcyBBUEkgbWV0aG9kIGhhcyBjdXJyZW50bHkgbm8gY2FsbGJhY2sgb24gQ2hyb21lLCBidXQgaXQgcmV0dXJuIGEgcHJvbWlzZSBvbiBGaXJlZm94LFxuICAgICAgICAgICAgICAvLyBhbmQgc28gdGhlIHBvbHlmaWxsIHdpbGwgdHJ5IHRvIGNhbGwgaXQgd2l0aCBhIGNhbGxiYWNrIGZpcnN0LCBhbmQgaXQgd2lsbCBmYWxsYmFja1xuICAgICAgICAgICAgICAvLyB0byBub3QgcGFzc2luZyB0aGUgY2FsbGJhY2sgaWYgdGhlIGZpcnN0IGNhbGwgZmFpbHMuXG4gICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0W25hbWVdKC4uLmFyZ3MsIG1ha2VDYWxsYmFjayh7XG4gICAgICAgICAgICAgICAgICByZXNvbHZlLFxuICAgICAgICAgICAgICAgICAgcmVqZWN0XG4gICAgICAgICAgICAgICAgfSwgbWV0YWRhdGEpKTtcbiAgICAgICAgICAgICAgfSBjYXRjaCAoY2JFcnJvcikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgJHtuYW1lfSBBUEkgbWV0aG9kIGRvZXNuJ3Qgc2VlbSB0byBzdXBwb3J0IHRoZSBjYWxsYmFjayBwYXJhbWV0ZXIsIGAgKyBcImZhbGxpbmcgYmFjayB0byBjYWxsIGl0IHdpdGhvdXQgYSBjYWxsYmFjazogXCIsIGNiRXJyb3IpO1xuICAgICAgICAgICAgICAgIHRhcmdldFtuYW1lXSguLi5hcmdzKTsgLy8gVXBkYXRlIHRoZSBBUEkgbWV0aG9kIG1ldGFkYXRhLCBzbyB0aGF0IHRoZSBuZXh0IEFQSSBjYWxscyB3aWxsIG5vdCB0cnkgdG9cbiAgICAgICAgICAgICAgICAvLyB1c2UgdGhlIHVuc3VwcG9ydGVkIGNhbGxiYWNrIGFueW1vcmUuXG5cbiAgICAgICAgICAgICAgICBtZXRhZGF0YS5mYWxsYmFja1RvTm9DYWxsYmFjayA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIG1ldGFkYXRhLm5vQ2FsbGJhY2sgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChtZXRhZGF0YS5ub0NhbGxiYWNrKSB7XG4gICAgICAgICAgICAgIHRhcmdldFtuYW1lXSguLi5hcmdzKTtcbiAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGFyZ2V0W25hbWVdKC4uLmFyZ3MsIG1ha2VDYWxsYmFjayh7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSxcbiAgICAgICAgICAgICAgICByZWplY3RcbiAgICAgICAgICAgICAgfSwgbWV0YWRhdGEpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgIH07XG4gICAgICAvKipcbiAgICAgICAqIFdyYXBzIGFuIGV4aXN0aW5nIG1ldGhvZCBvZiB0aGUgdGFyZ2V0IG9iamVjdCwgc28gdGhhdCBjYWxscyB0byBpdCBhcmVcbiAgICAgICAqIGludGVyY2VwdGVkIGJ5IHRoZSBnaXZlbiB3cmFwcGVyIGZ1bmN0aW9uLiBUaGUgd3JhcHBlciBmdW5jdGlvbiByZWNlaXZlcyxcbiAgICAgICAqIGFzIGl0cyBmaXJzdCBhcmd1bWVudCwgdGhlIG9yaWdpbmFsIGB0YXJnZXRgIG9iamVjdCwgZm9sbG93ZWQgYnkgZWFjaCBvZlxuICAgICAgICogdGhlIGFyZ3VtZW50cyBwYXNzZWQgdG8gdGhlIG9yaWdpbmFsIG1ldGhvZC5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0ge29iamVjdH0gdGFyZ2V0XG4gICAgICAgKiAgICAgICAgVGhlIG9yaWdpbmFsIHRhcmdldCBvYmplY3QgdGhhdCB0aGUgd3JhcHBlZCBtZXRob2QgYmVsb25ncyB0by5cbiAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IG1ldGhvZFxuICAgICAgICogICAgICAgIFRoZSBtZXRob2QgYmVpbmcgd3JhcHBlZC4gVGhpcyBpcyB1c2VkIGFzIHRoZSB0YXJnZXQgb2YgdGhlIFByb3h5XG4gICAgICAgKiAgICAgICAgb2JqZWN0IHdoaWNoIGlzIGNyZWF0ZWQgdG8gd3JhcCB0aGUgbWV0aG9kLlxuICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gd3JhcHBlclxuICAgICAgICogICAgICAgIFRoZSB3cmFwcGVyIGZ1bmN0aW9uIHdoaWNoIGlzIGNhbGxlZCBpbiBwbGFjZSBvZiBhIGRpcmVjdCBpbnZvY2F0aW9uXG4gICAgICAgKiAgICAgICAgb2YgdGhlIHdyYXBwZWQgbWV0aG9kLlxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm5zIHtQcm94eTxmdW5jdGlvbj59XG4gICAgICAgKiAgICAgICAgQSBQcm94eSBvYmplY3QgZm9yIHRoZSBnaXZlbiBtZXRob2QsIHdoaWNoIGludm9rZXMgdGhlIGdpdmVuIHdyYXBwZXJcbiAgICAgICAqICAgICAgICBtZXRob2QgaW4gaXRzIHBsYWNlLlxuICAgICAgICovXG5cblxuICAgICAgY29uc3Qgd3JhcE1ldGhvZCA9ICh0YXJnZXQsIG1ldGhvZCwgd3JhcHBlcikgPT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb3h5KG1ldGhvZCwge1xuICAgICAgICAgIGFwcGx5KHRhcmdldE1ldGhvZCwgdGhpc09iaiwgYXJncykge1xuICAgICAgICAgICAgcmV0dXJuIHdyYXBwZXIuY2FsbCh0aGlzT2JqLCB0YXJnZXQsIC4uLmFyZ3MpO1xuICAgICAgICAgIH1cblxuICAgICAgICB9KTtcbiAgICAgIH07XG5cbiAgICAgIGxldCBoYXNPd25Qcm9wZXJ0eSA9IEZ1bmN0aW9uLmNhbGwuYmluZChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5KTtcbiAgICAgIC8qKlxuICAgICAgICogV3JhcHMgYW4gb2JqZWN0IGluIGEgUHJveHkgd2hpY2ggaW50ZXJjZXB0cyBhbmQgd3JhcHMgY2VydGFpbiBtZXRob2RzXG4gICAgICAgKiBiYXNlZCBvbiB0aGUgZ2l2ZW4gYHdyYXBwZXJzYCBhbmQgYG1ldGFkYXRhYCBvYmplY3RzLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0YXJnZXRcbiAgICAgICAqICAgICAgICBUaGUgdGFyZ2V0IG9iamVjdCB0byB3cmFwLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbd3JhcHBlcnMgPSB7fV1cbiAgICAgICAqICAgICAgICBBbiBvYmplY3QgdHJlZSBjb250YWluaW5nIHdyYXBwZXIgZnVuY3Rpb25zIGZvciBzcGVjaWFsIGNhc2VzLiBBbnlcbiAgICAgICAqICAgICAgICBmdW5jdGlvbiBwcmVzZW50IGluIHRoaXMgb2JqZWN0IHRyZWUgaXMgY2FsbGVkIGluIHBsYWNlIG9mIHRoZVxuICAgICAgICogICAgICAgIG1ldGhvZCBpbiB0aGUgc2FtZSBsb2NhdGlvbiBpbiB0aGUgYHRhcmdldGAgb2JqZWN0IHRyZWUuIFRoZXNlXG4gICAgICAgKiAgICAgICAgd3JhcHBlciBtZXRob2RzIGFyZSBpbnZva2VkIGFzIGRlc2NyaWJlZCBpbiB7QHNlZSB3cmFwTWV0aG9kfS5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0ge29iamVjdH0gW21ldGFkYXRhID0ge31dXG4gICAgICAgKiAgICAgICAgQW4gb2JqZWN0IHRyZWUgY29udGFpbmluZyBtZXRhZGF0YSB1c2VkIHRvIGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVcbiAgICAgICAqICAgICAgICBQcm9taXNlLWJhc2VkIHdyYXBwZXIgZnVuY3Rpb25zIGZvciBhc3luY2hyb25vdXMuIEFueSBmdW5jdGlvbiBpblxuICAgICAgICogICAgICAgIHRoZSBgdGFyZ2V0YCBvYmplY3QgdHJlZSB3aGljaCBoYXMgYSBjb3JyZXNwb25kaW5nIG1ldGFkYXRhIG9iamVjdFxuICAgICAgICogICAgICAgIGluIHRoZSBzYW1lIGxvY2F0aW9uIGluIHRoZSBgbWV0YWRhdGFgIHRyZWUgaXMgcmVwbGFjZWQgd2l0aCBhblxuICAgICAgICogICAgICAgIGF1dG9tYXRpY2FsbHktZ2VuZXJhdGVkIHdyYXBwZXIgZnVuY3Rpb24sIGFzIGRlc2NyaWJlZCBpblxuICAgICAgICogICAgICAgIHtAc2VlIHdyYXBBc3luY0Z1bmN0aW9ufVxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm5zIHtQcm94eTxvYmplY3Q+fVxuICAgICAgICovXG5cbiAgICAgIGNvbnN0IHdyYXBPYmplY3QgPSAodGFyZ2V0LCB3cmFwcGVycyA9IHt9LCBtZXRhZGF0YSA9IHt9KSA9PiB7XG4gICAgICAgIGxldCBjYWNoZSA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICAgIGxldCBoYW5kbGVycyA9IHtcbiAgICAgICAgICBoYXMocHJveHlUYXJnZXQsIHByb3ApIHtcbiAgICAgICAgICAgIHJldHVybiBwcm9wIGluIHRhcmdldCB8fCBwcm9wIGluIGNhY2hlO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBnZXQocHJveHlUYXJnZXQsIHByb3AsIHJlY2VpdmVyKSB7XG4gICAgICAgICAgICBpZiAocHJvcCBpbiBjYWNoZSkge1xuICAgICAgICAgICAgICByZXR1cm4gY2FjaGVbcHJvcF07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghKHByb3AgaW4gdGFyZ2V0KSkge1xuICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgdmFsdWUgPSB0YXJnZXRbcHJvcF07XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAvLyBUaGlzIGlzIGEgbWV0aG9kIG9uIHRoZSB1bmRlcmx5aW5nIG9iamVjdC4gQ2hlY2sgaWYgd2UgbmVlZCB0byBkb1xuICAgICAgICAgICAgICAvLyBhbnkgd3JhcHBpbmcuXG4gICAgICAgICAgICAgIGlmICh0eXBlb2Ygd3JhcHBlcnNbcHJvcF0gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIC8vIFdlIGhhdmUgYSBzcGVjaWFsLWNhc2Ugd3JhcHBlciBmb3IgdGhpcyBtZXRob2QuXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB3cmFwTWV0aG9kKHRhcmdldCwgdGFyZ2V0W3Byb3BdLCB3cmFwcGVyc1twcm9wXSk7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoaGFzT3duUHJvcGVydHkobWV0YWRhdGEsIHByb3ApKSB7XG4gICAgICAgICAgICAgICAgLy8gVGhpcyBpcyBhbiBhc3luYyBtZXRob2QgdGhhdCB3ZSBoYXZlIG1ldGFkYXRhIGZvci4gQ3JlYXRlIGFcbiAgICAgICAgICAgICAgICAvLyBQcm9taXNlIHdyYXBwZXIgZm9yIGl0LlxuICAgICAgICAgICAgICAgIGxldCB3cmFwcGVyID0gd3JhcEFzeW5jRnVuY3Rpb24ocHJvcCwgbWV0YWRhdGFbcHJvcF0pO1xuICAgICAgICAgICAgICAgIHZhbHVlID0gd3JhcE1ldGhvZCh0YXJnZXQsIHRhcmdldFtwcm9wXSwgd3JhcHBlcik7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gVGhpcyBpcyBhIG1ldGhvZCB0aGF0IHdlIGRvbid0IGtub3cgb3IgY2FyZSBhYm91dC4gUmV0dXJuIHRoZVxuICAgICAgICAgICAgICAgIC8vIG9yaWdpbmFsIG1ldGhvZCwgYm91bmQgdG8gdGhlIHVuZGVybHlpbmcgb2JqZWN0LlxuICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUuYmluZCh0YXJnZXQpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJiB2YWx1ZSAhPT0gbnVsbCAmJiAoaGFzT3duUHJvcGVydHkod3JhcHBlcnMsIHByb3ApIHx8IGhhc093blByb3BlcnR5KG1ldGFkYXRhLCBwcm9wKSkpIHtcbiAgICAgICAgICAgICAgLy8gVGhpcyBpcyBhbiBvYmplY3QgdGhhdCB3ZSBuZWVkIHRvIGRvIHNvbWUgd3JhcHBpbmcgZm9yIHRoZSBjaGlsZHJlblxuICAgICAgICAgICAgICAvLyBvZi4gQ3JlYXRlIGEgc3ViLW9iamVjdCB3cmFwcGVyIGZvciBpdCB3aXRoIHRoZSBhcHByb3ByaWF0ZSBjaGlsZFxuICAgICAgICAgICAgICAvLyBtZXRhZGF0YS5cbiAgICAgICAgICAgICAgdmFsdWUgPSB3cmFwT2JqZWN0KHZhbHVlLCB3cmFwcGVyc1twcm9wXSwgbWV0YWRhdGFbcHJvcF0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChoYXNPd25Qcm9wZXJ0eShtZXRhZGF0YSwgXCIqXCIpKSB7XG4gICAgICAgICAgICAgIC8vIFdyYXAgYWxsIHByb3BlcnRpZXMgaW4gKiBuYW1lc3BhY2UuXG4gICAgICAgICAgICAgIHZhbHVlID0gd3JhcE9iamVjdCh2YWx1ZSwgd3JhcHBlcnNbcHJvcF0sIG1ldGFkYXRhW1wiKlwiXSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBXZSBkb24ndCBuZWVkIHRvIGRvIGFueSB3cmFwcGluZyBmb3IgdGhpcyBwcm9wZXJ0eSxcbiAgICAgICAgICAgICAgLy8gc28ganVzdCBmb3J3YXJkIGFsbCBhY2Nlc3MgdG8gdGhlIHVuZGVybHlpbmcgb2JqZWN0LlxuICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY2FjaGUsIHByb3AsIHtcbiAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcblxuICAgICAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiB0YXJnZXRbcHJvcF07XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIHNldCh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgdGFyZ2V0W3Byb3BdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNhY2hlW3Byb3BdID0gdmFsdWU7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIHNldChwcm94eVRhcmdldCwgcHJvcCwgdmFsdWUsIHJlY2VpdmVyKSB7XG4gICAgICAgICAgICBpZiAocHJvcCBpbiBjYWNoZSkge1xuICAgICAgICAgICAgICBjYWNoZVtwcm9wXSA9IHZhbHVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGFyZ2V0W3Byb3BdID0gdmFsdWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBkZWZpbmVQcm9wZXJ0eShwcm94eVRhcmdldCwgcHJvcCwgZGVzYykge1xuICAgICAgICAgICAgcmV0dXJuIFJlZmxlY3QuZGVmaW5lUHJvcGVydHkoY2FjaGUsIHByb3AsIGRlc2MpO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBkZWxldGVQcm9wZXJ0eShwcm94eVRhcmdldCwgcHJvcCkge1xuICAgICAgICAgICAgcmV0dXJuIFJlZmxlY3QuZGVsZXRlUHJvcGVydHkoY2FjaGUsIHByb3ApO1xuICAgICAgICAgIH1cblxuICAgICAgICB9OyAvLyBQZXIgY29udHJhY3Qgb2YgdGhlIFByb3h5IEFQSSwgdGhlIFwiZ2V0XCIgcHJveHkgaGFuZGxlciBtdXN0IHJldHVybiB0aGVcbiAgICAgICAgLy8gb3JpZ2luYWwgdmFsdWUgb2YgdGhlIHRhcmdldCBpZiB0aGF0IHZhbHVlIGlzIGRlY2xhcmVkIHJlYWQtb25seSBhbmRcbiAgICAgICAgLy8gbm9uLWNvbmZpZ3VyYWJsZS4gRm9yIHRoaXMgcmVhc29uLCB3ZSBjcmVhdGUgYW4gb2JqZWN0IHdpdGggdGhlXG4gICAgICAgIC8vIHByb3RvdHlwZSBzZXQgdG8gYHRhcmdldGAgaW5zdGVhZCBvZiB1c2luZyBgdGFyZ2V0YCBkaXJlY3RseS5cbiAgICAgICAgLy8gT3RoZXJ3aXNlIHdlIGNhbm5vdCByZXR1cm4gYSBjdXN0b20gb2JqZWN0IGZvciBBUElzIHRoYXRcbiAgICAgICAgLy8gYXJlIGRlY2xhcmVkIHJlYWQtb25seSBhbmQgbm9uLWNvbmZpZ3VyYWJsZSwgc3VjaCBhcyBgY2hyb21lLmRldnRvb2xzYC5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gVGhlIHByb3h5IGhhbmRsZXJzIHRoZW1zZWx2ZXMgd2lsbCBzdGlsbCB1c2UgdGhlIG9yaWdpbmFsIGB0YXJnZXRgXG4gICAgICAgIC8vIGluc3RlYWQgb2YgdGhlIGBwcm94eVRhcmdldGAsIHNvIHRoYXQgdGhlIG1ldGhvZHMgYW5kIHByb3BlcnRpZXMgYXJlXG4gICAgICAgIC8vIGRlcmVmZXJlbmNlZCB2aWEgdGhlIG9yaWdpbmFsIHRhcmdldHMuXG5cbiAgICAgICAgbGV0IHByb3h5VGFyZ2V0ID0gT2JqZWN0LmNyZWF0ZSh0YXJnZXQpO1xuICAgICAgICByZXR1cm4gbmV3IFByb3h5KHByb3h5VGFyZ2V0LCBoYW5kbGVycyk7XG4gICAgICB9O1xuICAgICAgLyoqXG4gICAgICAgKiBDcmVhdGVzIGEgc2V0IG9mIHdyYXBwZXIgZnVuY3Rpb25zIGZvciBhbiBldmVudCBvYmplY3QsIHdoaWNoIGhhbmRsZXNcbiAgICAgICAqIHdyYXBwaW5nIG9mIGxpc3RlbmVyIGZ1bmN0aW9ucyB0aGF0IHRob3NlIG1lc3NhZ2VzIGFyZSBwYXNzZWQuXG4gICAgICAgKlxuICAgICAgICogQSBzaW5nbGUgd3JhcHBlciBpcyBjcmVhdGVkIGZvciBlYWNoIGxpc3RlbmVyIGZ1bmN0aW9uLCBhbmQgc3RvcmVkIGluIGFcbiAgICAgICAqIG1hcC4gU3Vic2VxdWVudCBjYWxscyB0byBgYWRkTGlzdGVuZXJgLCBgaGFzTGlzdGVuZXJgLCBvciBgcmVtb3ZlTGlzdGVuZXJgXG4gICAgICAgKiByZXRyaWV2ZSB0aGUgb3JpZ2luYWwgd3JhcHBlciwgc28gdGhhdCAgYXR0ZW1wdHMgdG8gcmVtb3ZlIGFcbiAgICAgICAqIHByZXZpb3VzbHktYWRkZWQgbGlzdGVuZXIgd29yayBhcyBleHBlY3RlZC5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0ge0RlZmF1bHRXZWFrTWFwPGZ1bmN0aW9uLCBmdW5jdGlvbj59IHdyYXBwZXJNYXBcbiAgICAgICAqICAgICAgICBBIERlZmF1bHRXZWFrTWFwIG9iamVjdCB3aGljaCB3aWxsIGNyZWF0ZSB0aGUgYXBwcm9wcmlhdGUgd3JhcHBlclxuICAgICAgICogICAgICAgIGZvciBhIGdpdmVuIGxpc3RlbmVyIGZ1bmN0aW9uIHdoZW4gb25lIGRvZXMgbm90IGV4aXN0LCBhbmQgcmV0cmlldmVcbiAgICAgICAqICAgICAgICBhbiBleGlzdGluZyBvbmUgd2hlbiBpdCBkb2VzLlxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm5zIHtvYmplY3R9XG4gICAgICAgKi9cblxuXG4gICAgICBjb25zdCB3cmFwRXZlbnQgPSB3cmFwcGVyTWFwID0+ICh7XG4gICAgICAgIGFkZExpc3RlbmVyKHRhcmdldCwgbGlzdGVuZXIsIC4uLmFyZ3MpIHtcbiAgICAgICAgICB0YXJnZXQuYWRkTGlzdGVuZXIod3JhcHBlck1hcC5nZXQobGlzdGVuZXIpLCAuLi5hcmdzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBoYXNMaXN0ZW5lcih0YXJnZXQsIGxpc3RlbmVyKSB7XG4gICAgICAgICAgcmV0dXJuIHRhcmdldC5oYXNMaXN0ZW5lcih3cmFwcGVyTWFwLmdldChsaXN0ZW5lcikpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZUxpc3RlbmVyKHRhcmdldCwgbGlzdGVuZXIpIHtcbiAgICAgICAgICB0YXJnZXQucmVtb3ZlTGlzdGVuZXIod3JhcHBlck1hcC5nZXQobGlzdGVuZXIpKTtcbiAgICAgICAgfVxuXG4gICAgICB9KTtcblxuICAgICAgY29uc3Qgb25SZXF1ZXN0RmluaXNoZWRXcmFwcGVycyA9IG5ldyBEZWZhdWx0V2Vha01hcChsaXN0ZW5lciA9PiB7XG4gICAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgIHJldHVybiBsaXN0ZW5lcjtcbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogV3JhcHMgYW4gb25SZXF1ZXN0RmluaXNoZWQgbGlzdGVuZXIgZnVuY3Rpb24gc28gdGhhdCBpdCB3aWxsIHJldHVybiBhXG4gICAgICAgICAqIGBnZXRDb250ZW50KClgIHByb3BlcnR5IHdoaWNoIHJldHVybnMgYSBgUHJvbWlzZWAgcmF0aGVyIHRoYW4gdXNpbmcgYVxuICAgICAgICAgKiBjYWxsYmFjayBBUEkuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSByZXFcbiAgICAgICAgICogICAgICAgIFRoZSBIQVIgZW50cnkgb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgbmV0d29yayByZXF1ZXN0LlxuICAgICAgICAgKi9cblxuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBvblJlcXVlc3RGaW5pc2hlZChyZXEpIHtcbiAgICAgICAgICBjb25zdCB3cmFwcGVkUmVxID0gd3JhcE9iamVjdChyZXEsIHt9XG4gICAgICAgICAgLyogd3JhcHBlcnMgKi9cbiAgICAgICAgICAsIHtcbiAgICAgICAgICAgIGdldENvbnRlbnQ6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMCxcbiAgICAgICAgICAgICAgbWF4QXJnczogMFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGxpc3RlbmVyKHdyYXBwZWRSZXEpO1xuICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgICBjb25zdCBvbk1lc3NhZ2VXcmFwcGVycyA9IG5ldyBEZWZhdWx0V2Vha01hcChsaXN0ZW5lciA9PiB7XG4gICAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgIHJldHVybiBsaXN0ZW5lcjtcbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogV3JhcHMgYSBtZXNzYWdlIGxpc3RlbmVyIGZ1bmN0aW9uIHNvIHRoYXQgaXQgbWF5IHNlbmQgcmVzcG9uc2VzIGJhc2VkIG9uXG4gICAgICAgICAqIGl0cyByZXR1cm4gdmFsdWUsIHJhdGhlciB0aGFuIGJ5IHJldHVybmluZyBhIHNlbnRpbmVsIHZhbHVlIGFuZCBjYWxsaW5nIGFcbiAgICAgICAgICogY2FsbGJhY2suIElmIHRoZSBsaXN0ZW5lciBmdW5jdGlvbiByZXR1cm5zIGEgUHJvbWlzZSwgdGhlIHJlc3BvbnNlIGlzXG4gICAgICAgICAqIHNlbnQgd2hlbiB0aGUgcHJvbWlzZSBlaXRoZXIgcmVzb2x2ZXMgb3IgcmVqZWN0cy5cbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHsqfSBtZXNzYWdlXG4gICAgICAgICAqICAgICAgICBUaGUgbWVzc2FnZSBzZW50IGJ5IHRoZSBvdGhlciBlbmQgb2YgdGhlIGNoYW5uZWwuXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBzZW5kZXJcbiAgICAgICAgICogICAgICAgIERldGFpbHMgYWJvdXQgdGhlIHNlbmRlciBvZiB0aGUgbWVzc2FnZS5cbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbigqKX0gc2VuZFJlc3BvbnNlXG4gICAgICAgICAqICAgICAgICBBIGNhbGxiYWNrIHdoaWNoLCB3aGVuIGNhbGxlZCB3aXRoIGFuIGFyYml0cmFyeSBhcmd1bWVudCwgc2VuZHNcbiAgICAgICAgICogICAgICAgIHRoYXQgdmFsdWUgYXMgYSByZXNwb25zZS5cbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICAgICAqICAgICAgICBUcnVlIGlmIHRoZSB3cmFwcGVkIGxpc3RlbmVyIHJldHVybmVkIGEgUHJvbWlzZSwgd2hpY2ggd2lsbCBsYXRlclxuICAgICAgICAgKiAgICAgICAgeWllbGQgYSByZXNwb25zZS4gRmFsc2Ugb3RoZXJ3aXNlLlxuICAgICAgICAgKi9cblxuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBvbk1lc3NhZ2UobWVzc2FnZSwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpIHtcbiAgICAgICAgICBsZXQgZGlkQ2FsbFNlbmRSZXNwb25zZSA9IGZhbHNlO1xuICAgICAgICAgIGxldCB3cmFwcGVkU2VuZFJlc3BvbnNlO1xuICAgICAgICAgIGxldCBzZW5kUmVzcG9uc2VQcm9taXNlID0gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgICAgICB3cmFwcGVkU2VuZFJlc3BvbnNlID0gZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgIGRpZENhbGxTZW5kUmVzcG9uc2UgPSB0cnVlO1xuICAgICAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgbGV0IHJlc3VsdDtcblxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXN1bHQgPSBsaXN0ZW5lcihtZXNzYWdlLCBzZW5kZXIsIHdyYXBwZWRTZW5kUmVzcG9uc2UpO1xuICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgcmVzdWx0ID0gUHJvbWlzZS5yZWplY3QoZXJyKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBpc1Jlc3VsdFRoZW5hYmxlID0gcmVzdWx0ICE9PSB0cnVlICYmIGlzVGhlbmFibGUocmVzdWx0KTsgLy8gSWYgdGhlIGxpc3RlbmVyIGRpZG4ndCByZXR1cm5lZCB0cnVlIG9yIGEgUHJvbWlzZSwgb3IgY2FsbGVkXG4gICAgICAgICAgLy8gd3JhcHBlZFNlbmRSZXNwb25zZSBzeW5jaHJvbm91c2x5LCB3ZSBjYW4gZXhpdCBlYXJsaWVyXG4gICAgICAgICAgLy8gYmVjYXVzZSB0aGVyZSB3aWxsIGJlIG5vIHJlc3BvbnNlIHNlbnQgZnJvbSB0aGlzIGxpc3RlbmVyLlxuXG4gICAgICAgICAgaWYgKHJlc3VsdCAhPT0gdHJ1ZSAmJiAhaXNSZXN1bHRUaGVuYWJsZSAmJiAhZGlkQ2FsbFNlbmRSZXNwb25zZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH0gLy8gQSBzbWFsbCBoZWxwZXIgdG8gc2VuZCB0aGUgbWVzc2FnZSBpZiB0aGUgcHJvbWlzZSByZXNvbHZlc1xuICAgICAgICAgIC8vIGFuZCBhbiBlcnJvciBpZiB0aGUgcHJvbWlzZSByZWplY3RzIChhIHdyYXBwZWQgc2VuZE1lc3NhZ2UgaGFzXG4gICAgICAgICAgLy8gdG8gdHJhbnNsYXRlIHRoZSBtZXNzYWdlIGludG8gYSByZXNvbHZlZCBwcm9taXNlIG9yIGEgcmVqZWN0ZWRcbiAgICAgICAgICAvLyBwcm9taXNlKS5cblxuXG4gICAgICAgICAgY29uc3Qgc2VuZFByb21pc2VkUmVzdWx0ID0gcHJvbWlzZSA9PiB7XG4gICAgICAgICAgICBwcm9taXNlLnRoZW4obXNnID0+IHtcbiAgICAgICAgICAgICAgLy8gc2VuZCB0aGUgbWVzc2FnZSB2YWx1ZS5cbiAgICAgICAgICAgICAgc2VuZFJlc3BvbnNlKG1zZyk7XG4gICAgICAgICAgICB9LCBlcnJvciA9PiB7XG4gICAgICAgICAgICAgIC8vIFNlbmQgYSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBlcnJvciBpZiB0aGUgcmVqZWN0ZWQgdmFsdWVcbiAgICAgICAgICAgICAgLy8gaXMgYW4gaW5zdGFuY2Ugb2YgZXJyb3IsIG9yIHRoZSBvYmplY3QgaXRzZWxmIG90aGVyd2lzZS5cbiAgICAgICAgICAgICAgbGV0IG1lc3NhZ2U7XG5cbiAgICAgICAgICAgICAgaWYgKGVycm9yICYmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yIHx8IHR5cGVvZiBlcnJvci5tZXNzYWdlID09PSBcInN0cmluZ1wiKSkge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBcIkFuIHVuZXhwZWN0ZWQgZXJyb3Igb2NjdXJyZWRcIjtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7XG4gICAgICAgICAgICAgICAgX19tb3pXZWJFeHRlbnNpb25Qb2x5ZmlsbFJlamVjdF9fOiB0cnVlLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2VcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgICAvLyBQcmludCBhbiBlcnJvciBvbiB0aGUgY29uc29sZSBpZiB1bmFibGUgdG8gc2VuZCB0aGUgcmVzcG9uc2UuXG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gc2VuZCBvbk1lc3NhZ2UgcmVqZWN0ZWQgcmVwbHlcIiwgZXJyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH07IC8vIElmIHRoZSBsaXN0ZW5lciByZXR1cm5lZCBhIFByb21pc2UsIHNlbmQgdGhlIHJlc29sdmVkIHZhbHVlIGFzIGFcbiAgICAgICAgICAvLyByZXN1bHQsIG90aGVyd2lzZSB3YWl0IHRoZSBwcm9taXNlIHJlbGF0ZWQgdG8gdGhlIHdyYXBwZWRTZW5kUmVzcG9uc2VcbiAgICAgICAgICAvLyBjYWxsYmFjayB0byByZXNvbHZlIGFuZCBzZW5kIGl0IGFzIGEgcmVzcG9uc2UuXG5cblxuICAgICAgICAgIGlmIChpc1Jlc3VsdFRoZW5hYmxlKSB7XG4gICAgICAgICAgICBzZW5kUHJvbWlzZWRSZXN1bHQocmVzdWx0KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VuZFByb21pc2VkUmVzdWx0KHNlbmRSZXNwb25zZVByb21pc2UpO1xuICAgICAgICAgIH0gLy8gTGV0IENocm9tZSBrbm93IHRoYXQgdGhlIGxpc3RlbmVyIGlzIHJlcGx5aW5nLlxuXG5cbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCB3cmFwcGVkU2VuZE1lc3NhZ2VDYWxsYmFjayA9ICh7XG4gICAgICAgIHJlamVjdCxcbiAgICAgICAgcmVzb2x2ZVxuICAgICAgfSwgcmVwbHkpID0+IHtcbiAgICAgICAgaWYgKGV4dGVuc2lvbkFQSXMucnVudGltZS5sYXN0RXJyb3IpIHtcbiAgICAgICAgICAvLyBEZXRlY3Qgd2hlbiBub25lIG9mIHRoZSBsaXN0ZW5lcnMgcmVwbGllZCB0byB0aGUgc2VuZE1lc3NhZ2UgY2FsbCBhbmQgcmVzb2x2ZVxuICAgICAgICAgIC8vIHRoZSBwcm9taXNlIHRvIHVuZGVmaW5lZCBhcyBpbiBGaXJlZm94LlxuICAgICAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vbW96aWxsYS93ZWJleHRlbnNpb24tcG9seWZpbGwvaXNzdWVzLzEzMFxuICAgICAgICAgIGlmIChleHRlbnNpb25BUElzLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2UgPT09IENIUk9NRV9TRU5EX01FU1NBR0VfQ0FMTEJBQ0tfTk9fUkVTUE9OU0VfTUVTU0FHRSkge1xuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZWplY3QobmV3IEVycm9yKGV4dGVuc2lvbkFQSXMucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChyZXBseSAmJiByZXBseS5fX21veldlYkV4dGVuc2lvblBvbHlmaWxsUmVqZWN0X18pIHtcbiAgICAgICAgICAvLyBDb252ZXJ0IGJhY2sgdGhlIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIGVycm9yIGludG9cbiAgICAgICAgICAvLyBhbiBFcnJvciBpbnN0YW5jZS5cbiAgICAgICAgICByZWplY3QobmV3IEVycm9yKHJlcGx5Lm1lc3NhZ2UpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXNvbHZlKHJlcGx5KTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgY29uc3Qgd3JhcHBlZFNlbmRNZXNzYWdlID0gKG5hbWUsIG1ldGFkYXRhLCBhcGlOYW1lc3BhY2VPYmosIC4uLmFyZ3MpID0+IHtcbiAgICAgICAgaWYgKGFyZ3MubGVuZ3RoIDwgbWV0YWRhdGEubWluQXJncykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgYXQgbGVhc3QgJHttZXRhZGF0YS5taW5BcmdzfSAke3BsdXJhbGl6ZUFyZ3VtZW50cyhtZXRhZGF0YS5taW5BcmdzKX0gZm9yICR7bmFtZX0oKSwgZ290ICR7YXJncy5sZW5ndGh9YCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYXJncy5sZW5ndGggPiBtZXRhZGF0YS5tYXhBcmdzKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCBhdCBtb3N0ICR7bWV0YWRhdGEubWF4QXJnc30gJHtwbHVyYWxpemVBcmd1bWVudHMobWV0YWRhdGEubWF4QXJncyl9IGZvciAke25hbWV9KCksIGdvdCAke2FyZ3MubGVuZ3RofWApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBjb25zdCB3cmFwcGVkQ2IgPSB3cmFwcGVkU2VuZE1lc3NhZ2VDYWxsYmFjay5iaW5kKG51bGwsIHtcbiAgICAgICAgICAgIHJlc29sdmUsXG4gICAgICAgICAgICByZWplY3RcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBhcmdzLnB1c2god3JhcHBlZENiKTtcbiAgICAgICAgICBhcGlOYW1lc3BhY2VPYmouc2VuZE1lc3NhZ2UoLi4uYXJncyk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICAgICAgY29uc3Qgc3RhdGljV3JhcHBlcnMgPSB7XG4gICAgICAgIGRldnRvb2xzOiB7XG4gICAgICAgICAgbmV0d29yazoge1xuICAgICAgICAgICAgb25SZXF1ZXN0RmluaXNoZWQ6IHdyYXBFdmVudChvblJlcXVlc3RGaW5pc2hlZFdyYXBwZXJzKVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgcnVudGltZToge1xuICAgICAgICAgIG9uTWVzc2FnZTogd3JhcEV2ZW50KG9uTWVzc2FnZVdyYXBwZXJzKSxcbiAgICAgICAgICBvbk1lc3NhZ2VFeHRlcm5hbDogd3JhcEV2ZW50KG9uTWVzc2FnZVdyYXBwZXJzKSxcbiAgICAgICAgICBzZW5kTWVzc2FnZTogd3JhcHBlZFNlbmRNZXNzYWdlLmJpbmQobnVsbCwgXCJzZW5kTWVzc2FnZVwiLCB7XG4gICAgICAgICAgICBtaW5BcmdzOiAxLFxuICAgICAgICAgICAgbWF4QXJnczogM1xuICAgICAgICAgIH0pXG4gICAgICAgIH0sXG4gICAgICAgIHRhYnM6IHtcbiAgICAgICAgICBzZW5kTWVzc2FnZTogd3JhcHBlZFNlbmRNZXNzYWdlLmJpbmQobnVsbCwgXCJzZW5kTWVzc2FnZVwiLCB7XG4gICAgICAgICAgICBtaW5BcmdzOiAyLFxuICAgICAgICAgICAgbWF4QXJnczogM1xuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBjb25zdCBzZXR0aW5nTWV0YWRhdGEgPSB7XG4gICAgICAgIGNsZWFyOiB7XG4gICAgICAgICAgbWluQXJnczogMSxcbiAgICAgICAgICBtYXhBcmdzOiAxXG4gICAgICAgIH0sXG4gICAgICAgIGdldDoge1xuICAgICAgICAgIG1pbkFyZ3M6IDEsXG4gICAgICAgICAgbWF4QXJnczogMVxuICAgICAgICB9LFxuICAgICAgICBzZXQ6IHtcbiAgICAgICAgICBtaW5BcmdzOiAxLFxuICAgICAgICAgIG1heEFyZ3M6IDFcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGFwaU1ldGFkYXRhLnByaXZhY3kgPSB7XG4gICAgICAgIG5ldHdvcms6IHtcbiAgICAgICAgICBcIipcIjogc2V0dGluZ01ldGFkYXRhXG4gICAgICAgIH0sXG4gICAgICAgIHNlcnZpY2VzOiB7XG4gICAgICAgICAgXCIqXCI6IHNldHRpbmdNZXRhZGF0YVxuICAgICAgICB9LFxuICAgICAgICB3ZWJzaXRlczoge1xuICAgICAgICAgIFwiKlwiOiBzZXR0aW5nTWV0YWRhdGFcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHJldHVybiB3cmFwT2JqZWN0KGV4dGVuc2lvbkFQSXMsIHN0YXRpY1dyYXBwZXJzLCBhcGlNZXRhZGF0YSk7XG4gICAgfTsgLy8gVGhlIGJ1aWxkIHByb2Nlc3MgYWRkcyBhIFVNRCB3cmFwcGVyIGFyb3VuZCB0aGlzIGZpbGUsIHdoaWNoIG1ha2VzIHRoZVxuICAgIC8vIGBtb2R1bGVgIHZhcmlhYmxlIGF2YWlsYWJsZS5cblxuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSB3cmFwQVBJcyhjaHJvbWUpO1xuICB9IGVsc2Uge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZ2xvYmFsVGhpcy5icm93c2VyO1xuICB9XG59KTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWJyb3dzZXItcG9seWZpbGwuanMubWFwXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=