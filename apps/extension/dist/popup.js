"use strict";
(self["webpackChunk_slothing_extension"] = self["webpackChunk_slothing_extension"] || []).push([[887],{

/***/ 997
(__unused_webpack_module, exports, __webpack_require__) {

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



if (true) {
  module.exports = __webpack_require__(921);
} else // removed by dead control flow
{}


/***/ },

/***/ 779
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

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


// EXTERNAL MODULE: ../../node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(723);
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
    const { sourceLabel, detectedCount, busy, lastResult, lastError, onScrapeVisible, onScrapePaginated, onViewTracker, } = props;
    const disabled = busy !== null || detectedCount === 0;
    return ((0,jsx_runtime.jsxs)("article", { className: "card", "data-bulk-source": sourceLabel.toLowerCase(), children: [(0,jsx_runtime.jsxs)("header", { className: "card-head", children: [(0,jsx_runtime.jsxs)("span", { className: "card-title", children: [sourceLabel, " list"] }), (0,jsx_runtime.jsxs)("span", { className: "badge", children: [detectedCount, " row", detectedCount === 1 ? "" : "s"] })] }), (0,jsx_runtime.jsxs)("div", { className: "action-grid", children: [(0,jsx_runtime.jsx)("button", { className: "btn primary full", onClick: onScrapeVisible, disabled: disabled, children: busy === "visible"
                            ? "Scraping visible…"
                            : `Scrape ${detectedCount} visible` }), (0,jsx_runtime.jsx)("button", { className: "btn full", onClick: onScrapePaginated, disabled: disabled, title: `Walks every page in your current filter set; capped at 200 jobs.`, children: busy === "paginated" ? "Walking pages…" : "Scrape filtered set" })] }), lastResult && ((0,jsx_runtime.jsxs)("div", { className: "bulk-result", children: [(0,jsx_runtime.jsxs)("p", { className: "inline-note", children: ["Imported ", lastResult.imported, "/", lastResult.attempted, lastResult.pages > 1 && ` · ${lastResult.pages} pages`, lastResult.duplicateCount
                                ? ` · ${lastResult.duplicateCount} duplicates`
                                : "", lastResult.errors.length > 0 &&
                                ` · ${lastResult.errors.length} errors`] }), lastResult.dedupedIds?.length ? ((0,jsx_runtime.jsxs)("p", { className: "inline-note bulk-duplicates", children: ["Duplicates: ", lastResult.dedupedIds.join(", ")] })) : null, lastResult.imported > 0 && onViewTracker && ((0,jsx_runtime.jsx)("button", { className: "success-link", onClick: onViewTracker, children: "View tracker \u2192" }))] })), lastError && (0,jsx_runtime.jsx)("p", { className: "inline-error", children: lastError })] }));
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
    /waterlooworks\.uwaterloo\.ca\//,
    /workdayjobs\.com\//,
    /myworkdayjobs\.com\//,
];
const LINKEDIN_JOBS_URL_PATTERN = /linkedin\.com\/jobs\/(?:view|search-results|search|collections)/;
const LINKEDIN_JOB_RETRY_DELAYS_MS = [600, 1400];
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
    const [pageProbeState, setPageProbeState] = (0,react.useState)("unknown");
    const [error, setError] = (0,react.useState)(null);
    // Cached so dashboard/review links can render without querying
    // GET_AUTH_STATUS again. Populated from the auth-status response on first
    // load and kept stable for the lifetime of the popup.
    const [apiBaseUrl, setApiBaseUrl] = (0,react.useState)(null);
    const [wwState, setWwState] = (0,react.useState)(null);
    const [wwBulkInFlight, setWwBulkInFlight] = (0,react.useState)(null);
    const [wwBulkResult, setWwBulkResult] = (0,react.useState)(null);
    const [wwBulkError, setWwBulkError] = (0,react.useState)(null);
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
        };
        chrome.runtime.onMessage.addListener(listener);
        return () => chrome.runtime.onMessage.removeListener(listener);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
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
        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true,
        });
        if (tab?.id) {
            setActiveTabId(tab.id);
            setActiveTabUrl(tab.url || null);
            try {
                const response = await chrome.tabs.sendMessage(tab.id, messages/* Messages */.B2.getSurfaceContext());
                if (response) {
                    const context = response;
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
                    if (!context.page.job &&
                        isLinkedInJobsUrl(tab.url) &&
                        attempt < LINKEDIN_JOB_RETRY_DELAYS_MS.length) {
                        window.setTimeout(() => {
                            void checkPageStatus(attempt + 1);
                        }, LINKEDIN_JOB_RETRY_DELAYS_MS[attempt]);
                    }
                }
            }
            catch {
                setPageProbeState(!tab.url || hasContentScriptHost(tab.url)
                    ? "needs-refresh"
                    : "unknown");
            }
            if (tab.url && /waterlooworks\.uwaterloo\.ca/.test(tab.url)) {
                try {
                    const r = await chrome.tabs.sendMessage(tab.id, {
                        type: "WW_GET_PAGE_STATE",
                    });
                    if (r?.success)
                        setWwState(r.data);
                }
                catch {
                    // Content script not yet loaded
                }
            }
            // P3/#39 — probe Greenhouse/Lever/Workday listing pages. Only one
            // matcher fires per visit (the user is on a single host).
            const bulkKey = matchBulkSource(tab.url);
            if (bulkKey) {
                try {
                    const messageType = bulkPageStateMessage(bulkKey);
                    const r = await chrome.tabs.sendMessage(tab.id, {
                        type: messageType,
                    });
                    if (r?.success && r.data) {
                        setBulkStates((prev) => ({ ...prev, [bulkKey]: r.data }));
                    }
                }
                catch {
                    // Content script not yet loaded
                }
            }
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
                currentWindow: true,
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
                currentWindow: true,
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
        if (/waterlooworks\.uwaterloo\.ca/.test(url))
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
        pageProbeState !== "needs-refresh" &&
        !supportedSite;
    const hasPageStatus = !!detectedJob || !!pageStatus?.hasForm || pageProbeState === "ready";
    const currentTabTitle = workspaceVisible
        ? "Job workspace active"
        : detectedJob
            ? "Job detected"
            : pageStatus?.hasForm
                ? "Application detected"
                : pageProbeState === "ready"
                    ? "No job detected"
                    : "Unsupported page";
    return ((0,jsx_runtime.jsxs)("div", { className: "popup", children: [(0,jsx_runtime.jsxs)("header", { className: "topbar", children: [(0,jsx_runtime.jsxs)("div", { className: "brand", children: [(0,jsx_runtime.jsx)("img", { className: "brand-mark", src: chrome.runtime.getURL("brand/slothing-mark.png"), alt: "" }), (0,jsx_runtime.jsx)("span", { className: "brand-name", children: "Slothing" })] }), (0,jsx_runtime.jsxs)("span", { className: "pill ok", title: "Extension connected", children: [(0,jsx_runtime.jsx)("span", { className: "pill-dot" }), "Connected"] })] }), (0,jsx_runtime.jsxs)("section", { className: "profile-card", children: [(0,jsx_runtime.jsx)("div", { className: "avatar", children: profileInitial() }), (0,jsx_runtime.jsxs)("div", { className: "profile-meta", children: [(0,jsx_runtime.jsx)("div", { className: "profile-name", children: profile?.contact?.name ||
                                    profile?.contact?.email ||
                                    "Set up your profile" }), (0,jsx_runtime.jsx)("div", { className: "profile-sub", children: profile?.computed?.currentTitle &&
                                    profile?.computed?.currentCompany
                                    ? `${profile.computed.currentTitle} · ${profile.computed.currentCompany}`
                                    : profile?.contact?.email ||
                                        "Add your work history so Slothing can tailor" })] }), profileScore !== null ? ((0,jsx_runtime.jsxs)("div", { className: `score ${profileScore >= 80 ? "high" : profileScore >= 50 ? "mid" : "low"}`, title: "Profile completeness", children: [(0,jsx_runtime.jsx)("span", { className: "score-num", children: profileScore }), (0,jsx_runtime.jsx)("span", { className: "score-unit", children: "/100" })] })) : ((0,jsx_runtime.jsx)("button", { className: "btn ghost tight", onClick: handleOpenDashboard, children: "Open" }))] }), (0,jsx_runtime.jsxs)("main", { className: "content", children: [pageProbeState === "needs-refresh" && ((0,jsx_runtime.jsxs)("article", { className: "status-card", children: [(0,jsx_runtime.jsxs)("div", { className: "status-copy", children: [(0,jsx_runtime.jsx)("span", { className: "status-eyebrow", children: "Current tab" }), (0,jsx_runtime.jsx)("span", { className: "status-title", children: "Page needs refresh" })] }), (0,jsx_runtime.jsx)("button", { className: "btn block", onClick: handleRefreshTab, children: "Refresh tab" })] })), hasPageStatus && ((0,jsx_runtime.jsxs)("article", { className: "status-card active", children: [(0,jsx_runtime.jsxs)("header", { className: "status-head", children: [(0,jsx_runtime.jsxs)("div", { className: "status-copy", children: [(0,jsx_runtime.jsx)("span", { className: "status-eyebrow", children: "Current tab" }), (0,jsx_runtime.jsx)("span", { className: "status-title", children: currentTabTitle })] }), pageStatus?.hasForm && ((0,jsx_runtime.jsxs)("span", { className: "badge", children: [pageStatus.detectedFields, " fields"] }))] }), detectedJob ? ((0,jsx_runtime.jsxs)("div", { className: "page-summary", children: [(0,jsx_runtime.jsx)("span", { className: "clip", title: detectedJob.title, children: detectedJob.title }), (0,jsx_runtime.jsx)("span", { className: "card-sub clip", children: detectedJob.company })] })) : ((0,jsx_runtime.jsx)("p", { className: "inline-note", children: pageStatus?.hasForm
                                    ? "Ready on this application page."
                                    : "Open a job posting, then scan again." })), (pageStatus?.detectedUploadCount ?? 0) > 0 && ((0,jsx_runtime.jsxs)("div", { className: "page-summary", children: [(0,jsx_runtime.jsx)("span", { className: "clip", children: "Resume upload detected. Attach your file manually." }), latestResume ? ((0,jsx_runtime.jsxs)("span", { className: "card-sub clip", title: latestResume.name, children: ["Latest: ", latestResume.name] })) : ((0,jsx_runtime.jsx)("span", { className: "card-sub clip", children: "Open Studio to export your latest document." })), (0,jsx_runtime.jsx)("button", { className: "btn block", onClick: handleOpenStudioForResume, children: latestResume ? "Open latest resume" : "Open Studio" })] })), detectedJob && ((0,jsx_runtime.jsx)("button", { className: "btn primary block", onClick: handleShowPanel, children: "Open job tools" })), !detectedJob && pageProbeState === "ready" && ((0,jsx_runtime.jsx)("button", { className: "btn block", onClick: () => checkPageStatus(), children: "Scan again" }))] })), showWwBulk && wwState && ((0,jsx_runtime.jsx)(BulkSourceCard, { sourceLabel: "WaterlooWorks", detectedCount: wwState.rowCount, busy: wwBulkInFlight, lastResult: wwBulkResult, lastError: wwBulkError, onScrapeVisible: () => handleWwBulkScrape("visible"), onScrapePaginated: () => handleWwBulkScrape("paginated"), onViewTracker: handleViewReviewQueue })), detectedBulkSources.map((key) => {
                        const state = bulkStates[key];
                        if (!state)
                            return null;
                        return ((0,jsx_runtime.jsx)(BulkSourceCard, { sourceLabel: BULK_SOURCE_LABELS[key], detectedCount: state.rowCount, busy: bulkInFlight[key] ?? null, lastResult: bulkResults[key] ?? null, lastError: bulkErrors[key] ?? null, onScrapeVisible: () => handleBulkSourceScrape(key, "visible"), onScrapePaginated: () => handleBulkSourceScrape(key, "paginated"), onViewTracker: handleViewReviewQueue }, key));
                    }), nothingDetected && !hasPageStatus && ((0,jsx_runtime.jsxs)("div", { className: "idle", children: [(0,jsx_runtime.jsx)("p", { className: "idle-title", children: "Unsupported page" }), (0,jsx_runtime.jsx)("p", { className: "idle-sub", children: "Open a supported job posting or application page." })] })), !hasPageStatus && !nothingDetected && supportedSite && ((0,jsx_runtime.jsxs)("div", { className: "idle", children: [(0,jsx_runtime.jsxs)("p", { className: "idle-title", children: [supportedSite, " is supported"] }), (0,jsx_runtime.jsx)("p", { className: "idle-sub", children: "Scanning this tab for a job posting or application form." })] })), (0,jsx_runtime.jsxs)("div", { className: "quick-row", children: [(0,jsx_runtime.jsxs)("button", { className: "quick", onClick: handleOpenDashboard, children: [(0,jsx_runtime.jsx)("span", { className: "quick-icon", "aria-hidden": true, children: "\u2197" }), (0,jsx_runtime.jsx)("span", { children: "Dashboard" })] }), (0,jsx_runtime.jsxs)("button", { className: "quick", onClick: () => chrome.runtime.openOptionsPage(), children: [(0,jsx_runtime.jsx)("span", { className: "quick-icon", "aria-hidden": true, children: "\u2699" }), (0,jsx_runtime.jsx)("span", { children: "Settings" })] })] })] }), (0,jsx_runtime.jsxs)("footer", { className: "footbar", children: [(0,jsx_runtime.jsx)("button", { className: `link ${confirmingLogout ? "warn" : ""}`, onClick: handleLogout, children: confirmingLogout ? "Click again to disconnect" : "Disconnect" }), profile?.updatedAt && ((0,jsx_runtime.jsxs)("span", { className: "updated", children: ["Synced ", (0,formatters/* formatRelative */.om)(profile.updatedAt)] }))] })] }));
}

;// ./src/popup/index.tsx





const container = document.getElementById("root");
if (container) {
    const root = (0,client/* createRoot */.H)(container);
    root.render((0,jsx_runtime.jsx)(react.StrictMode, { children: (0,jsx_runtime.jsx)(App, {}) }));
}


/***/ },

/***/ 543
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

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
};
const LEGACY_LOCAL_API_BASE_URL = "http://localhost:3000";
const DEFAULT_API_BASE_URL = "http://localhost:3000" || 0;
const SHOULD_PROMOTE_LEGACY_LOCAL_API_BASE_URL = DEFAULT_API_BASE_URL !== LEGACY_LOCAL_API_BASE_URL;


/***/ }

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
/******/ var __webpack_exports__ = (__webpack_exec__(120));
/******/ }
]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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TSxxREFBcUQ7QUFDM0Q7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxNQUFNLGdFQUFnRTtBQUN0RTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxNQUFNLHVFQUF1RTtBQUM3RTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsTUFBTSx3RUFBd0U7QUFDOUU7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLE1BQU0sMEVBQTBFO0FBQ2hGO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsTUFBTSw4Q0FBOEM7QUFDcEQsTUFBTSwyQ0FBMkM7QUFDakQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FB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QUFDQSxzQ0FBc0MsK0NBQStDO0FBQ3JGO0FBQ0EsU0FBUztBQUNULEtBQUs7QUFDTDtBQUNBO0FBQ087QUFDUCwyQ0FBMkM7QUFDM0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7O0FDckxBO0FBQ0E7QUFDQSwwQ0FBMEMsc0JBQXNCO0FBQ2hFO0FBQ0E7QUFDTztBQUNBO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ0EsNkJBQTZCLHVCQUEyQyxJQUFJLENBQXVCO0FBQ25HIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vQHNsb3RoaW5nL2V4dGVuc2lvbi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vcmVhY3QtZG9tQDE4LjMuMV9yZWFjdEAxOC4zLjEvbm9kZV9tb2R1bGVzL3JlYWN0LWRvbS9jbGllbnQuanMiLCJ3ZWJwYWNrOi8vQHNsb3RoaW5nL2V4dGVuc2lvbi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vcmVhY3RAMTguMy4xL25vZGVfbW9kdWxlcy9yZWFjdC9janMvcmVhY3QtanN4LXJ1bnRpbWUucHJvZHVjdGlvbi5taW4uanMiLCJ3ZWJwYWNrOi8vQHNsb3RoaW5nL2V4dGVuc2lvbi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vcmVhY3RAMTguMy4xL25vZGVfbW9kdWxlcy9yZWFjdC9qc3gtcnVudGltZS5qcyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4uLy4uL3BhY2thZ2VzL3NoYXJlZC9zcmMvZm9ybWF0dGVycy9pbmRleC50cyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4uLy4uL3BhY2thZ2VzL3NoYXJlZC9zcmMvc2NvcmluZy9jb25zdGFudHMudHMiLCJ3ZWJwYWNrOi8vQHNsb3RoaW5nL2V4dGVuc2lvbi8uLi8uLi9wYWNrYWdlcy9zaGFyZWQvc3JjL3Njb3JpbmcvdGV4dC50cyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4uLy4uL3BhY2thZ2VzL3NoYXJlZC9zcmMvc2NvcmluZy9hY3Rpb24tdmVyYnMudHMiLCJ3ZWJwYWNrOi8vQHNsb3RoaW5nL2V4dGVuc2lvbi8uLi8uLi9wYWNrYWdlcy9zaGFyZWQvc3JjL3Njb3JpbmcvYXRzLWNoYXJhY3RlcnMudHMiLCJ3ZWJwYWNrOi8vQHNsb3RoaW5nL2V4dGVuc2lvbi8uLi8uLi9wYWNrYWdlcy9zaGFyZWQvc3JjL3Njb3JpbmcvYXRzLWZyaWVuZGxpbmVzcy50cyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4uLy4uL3BhY2thZ2VzL3NoYXJlZC9zcmMvc2NvcmluZy9zeW5vbnltcy50cyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4uLy4uL3BhY2thZ2VzL3NoYXJlZC9zcmMvc2NvcmluZy9rZXl3b3JkLW1hdGNoLnRzIiwid2VicGFjazovL0BzbG90aGluZy9leHRlbnNpb24vLi4vLi4vcGFja2FnZXMvc2hhcmVkL3NyYy9zY29yaW5nL2xlbmd0aC50cyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4uLy4uL3BhY2thZ2VzL3NoYXJlZC9zcmMvc2NvcmluZy9xdWFudGlmaWVkLWFjaGlldmVtZW50cy50cyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4uLy4uL3BhY2thZ2VzL3NoYXJlZC9zcmMvc2NvcmluZy9zZWN0aW9uLWNvbXBsZXRlbmVzcy50cyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4uLy4uL3BhY2thZ2VzL3NoYXJlZC9zcmMvc2NvcmluZy9zcGVsbGluZy1ncmFtbWFyLnRzIiwid2VicGFjazovL0BzbG90aGluZy9leHRlbnNpb24vLi4vLi4vcGFja2FnZXMvc2hhcmVkL3NyYy9zY29yaW5nL2luZGV4LnRzIiwid2VicGFjazovL0BzbG90aGluZy9leHRlbnNpb24vLi9zcmMvcG9wdXAvZGVlcC1saW5rcy50cyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4vc3JjL3BvcHVwL0J1bGtTb3VyY2VDYXJkLnRzeCIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4vc3JjL3BvcHVwL0FwcC50c3giLCJ3ZWJwYWNrOi8vQHNsb3RoaW5nL2V4dGVuc2lvbi8uL3NyYy9wb3B1cC9pbmRleC50c3giLCJ3ZWJwYWNrOi8vQHNsb3RoaW5nL2V4dGVuc2lvbi8uL3NyYy9zaGFyZWQvZXJyb3ItbWVzc2FnZXMudHMiLCJ3ZWJwYWNrOi8vQHNsb3RoaW5nL2V4dGVuc2lvbi8uL3NyYy9zaGFyZWQvbWVzc2FnZXMudHMiLCJ3ZWJwYWNrOi8vQHNsb3RoaW5nL2V4dGVuc2lvbi8uL3NyYy9zaGFyZWQvdHlwZXMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbSA9IHJlcXVpcmUoJ3JlYWN0LWRvbScpO1xuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAncHJvZHVjdGlvbicpIHtcbiAgZXhwb3J0cy5jcmVhdGVSb290ID0gbS5jcmVhdGVSb290O1xuICBleHBvcnRzLmh5ZHJhdGVSb290ID0gbS5oeWRyYXRlUm9vdDtcbn0gZWxzZSB7XG4gIHZhciBpID0gbS5fX1NFQ1JFVF9JTlRFUk5BTFNfRE9fTk9UX1VTRV9PUl9ZT1VfV0lMTF9CRV9GSVJFRDtcbiAgZXhwb3J0cy5jcmVhdGVSb290ID0gZnVuY3Rpb24oYywgbykge1xuICAgIGkudXNpbmdDbGllbnRFbnRyeVBvaW50ID0gdHJ1ZTtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIG0uY3JlYXRlUm9vdChjLCBvKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgaS51c2luZ0NsaWVudEVudHJ5UG9pbnQgPSBmYWxzZTtcbiAgICB9XG4gIH07XG4gIGV4cG9ydHMuaHlkcmF0ZVJvb3QgPSBmdW5jdGlvbihjLCBoLCBvKSB7XG4gICAgaS51c2luZ0NsaWVudEVudHJ5UG9pbnQgPSB0cnVlO1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gbS5oeWRyYXRlUm9vdChjLCBoLCBvKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgaS51c2luZ0NsaWVudEVudHJ5UG9pbnQgPSBmYWxzZTtcbiAgICB9XG4gIH07XG59XG4iLCIvKipcbiAqIEBsaWNlbnNlIFJlYWN0XG4gKiByZWFjdC1qc3gtcnVudGltZS5wcm9kdWN0aW9uLm1pbi5qc1xuICpcbiAqIENvcHlyaWdodCAoYykgRmFjZWJvb2ssIEluYy4gYW5kIGl0cyBhZmZpbGlhdGVzLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG4ndXNlIHN0cmljdCc7dmFyIGY9cmVxdWlyZShcInJlYWN0XCIpLGs9U3ltYm9sLmZvcihcInJlYWN0LmVsZW1lbnRcIiksbD1TeW1ib2wuZm9yKFwicmVhY3QuZnJhZ21lbnRcIiksbT1PYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LG49Zi5fX1NFQ1JFVF9JTlRFUk5BTFNfRE9fTk9UX1VTRV9PUl9ZT1VfV0lMTF9CRV9GSVJFRC5SZWFjdEN1cnJlbnRPd25lcixwPXtrZXk6ITAscmVmOiEwLF9fc2VsZjohMCxfX3NvdXJjZTohMH07XG5mdW5jdGlvbiBxKGMsYSxnKXt2YXIgYixkPXt9LGU9bnVsbCxoPW51bGw7dm9pZCAwIT09ZyYmKGU9XCJcIitnKTt2b2lkIDAhPT1hLmtleSYmKGU9XCJcIithLmtleSk7dm9pZCAwIT09YS5yZWYmJihoPWEucmVmKTtmb3IoYiBpbiBhKW0uY2FsbChhLGIpJiYhcC5oYXNPd25Qcm9wZXJ0eShiKSYmKGRbYl09YVtiXSk7aWYoYyYmYy5kZWZhdWx0UHJvcHMpZm9yKGIgaW4gYT1jLmRlZmF1bHRQcm9wcyxhKXZvaWQgMD09PWRbYl0mJihkW2JdPWFbYl0pO3JldHVybnskJHR5cGVvZjprLHR5cGU6YyxrZXk6ZSxyZWY6aCxwcm9wczpkLF9vd25lcjpuLmN1cnJlbnR9fWV4cG9ydHMuRnJhZ21lbnQ9bDtleHBvcnRzLmpzeD1xO2V4cG9ydHMuanN4cz1xO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdwcm9kdWN0aW9uJykge1xuICBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vY2pzL3JlYWN0LWpzeC1ydW50aW1lLnByb2R1Y3Rpb24ubWluLmpzJyk7XG59IGVsc2Uge1xuICBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vY2pzL3JlYWN0LWpzeC1ydW50aW1lLmRldmVsb3BtZW50LmpzJyk7XG59XG4iLCJleHBvcnQgY29uc3QgREVGQVVMVF9MT0NBTEUgPSBcImVuLVVTXCI7XG5jb25zdCBOVU1FUklDX1BBUlRTX0xPQ0FMRSA9IGAke0RFRkFVTFRfTE9DQUxFfS11LW51LWxhdG5gO1xuZXhwb3J0IGNvbnN0IExPQ0FMRV9DT09LSUVfTkFNRSA9IFwidGFpZGFfbG9jYWxlXCI7XG5leHBvcnQgY29uc3QgTE9DQUxFX0NIQU5HRV9FVkVOVCA9IFwidGFpZGE6bG9jYWxlLWNoYW5nZVwiO1xuZXhwb3J0IGNvbnN0IFNVUFBPUlRFRF9MT0NBTEVTID0gW1xuICAgIHsgdmFsdWU6IFwiZW4tVVNcIiwgbGFiZWw6IFwiRW5nbGlzaCAoVVMpXCIgfSxcbiAgICB7IHZhbHVlOiBcImVuLUNBXCIsIGxhYmVsOiBcIkVuZ2xpc2ggKENBKVwiIH0sXG4gICAgeyB2YWx1ZTogXCJlbi1HQlwiLCBsYWJlbDogXCJFbmdsaXNoIChVSylcIiB9LFxuICAgIHsgdmFsdWU6IFwiZnJcIiwgbGFiZWw6IFwiRnJlbmNoXCIgfSxcbiAgICB7IHZhbHVlOiBcImVzXCIsIGxhYmVsOiBcIlNwYW5pc2hcIiB9LFxuICAgIHsgdmFsdWU6IFwiZGVcIiwgbGFiZWw6IFwiR2VybWFuXCIgfSxcbiAgICB7IHZhbHVlOiBcImphXCIsIGxhYmVsOiBcIkphcGFuZXNlXCIgfSxcbiAgICB7IHZhbHVlOiBcInpoLUNOXCIsIGxhYmVsOiBcIkNoaW5lc2UgKFNpbXBsaWZpZWQpXCIgfSxcbiAgICB7IHZhbHVlOiBcInB0XCIsIGxhYmVsOiBcIlBvcnR1Z3Vlc2VcIiB9LFxuICAgIHsgdmFsdWU6IFwicHQtQlJcIiwgbGFiZWw6IFwiUG9ydHVndWVzZSAoQnJhemlsKVwiIH0sXG4gICAgeyB2YWx1ZTogXCJoaVwiLCBsYWJlbDogXCJIaW5kaVwiIH0sXG4gICAgeyB2YWx1ZTogXCJrb1wiLCBsYWJlbDogXCJLb3JlYW5cIiB9LFxuXTtcbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVMb2NhbGUobG9jYWxlKSB7XG4gICAgaWYgKCFsb2NhbGUpXG4gICAgICAgIHJldHVybiBERUZBVUxUX0xPQ0FMRTtcbiAgICBjb25zdCBzdXBwb3J0ZWQgPSBTVVBQT1JURURfTE9DQUxFUy5maW5kKChjYW5kaWRhdGUpID0+IGNhbmRpZGF0ZS52YWx1ZS50b0xvd2VyQ2FzZSgpID09PSBsb2NhbGUudG9Mb3dlckNhc2UoKSB8fFxuICAgICAgICBjYW5kaWRhdGUudmFsdWUuc3BsaXQoXCItXCIpWzBdLnRvTG93ZXJDYXNlKCkgPT09IGxvY2FsZS50b0xvd2VyQ2FzZSgpKTtcbiAgICByZXR1cm4gc3VwcG9ydGVkPy52YWx1ZSA/PyBERUZBVUxUX0xPQ0FMRTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBub3dJc28oKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBub3dEYXRlKCkge1xuICAgIHJldHVybiBuZXcgRGF0ZSgpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIG5vd0Vwb2NoKCkge1xuICAgIHJldHVybiBEYXRlLm5vdygpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlVG9EYXRlKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IFwiXCIpXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIGNvbnN0IGRhdGUgPSB2YWx1ZSBpbnN0YW5jZW9mIERhdGUgPyBuZXcgRGF0ZSh2YWx1ZS5nZXRUaW1lKCkpIDogbmV3IERhdGUodmFsdWUpO1xuICAgIHJldHVybiBOdW1iZXIuaXNOYU4oZGF0ZS5nZXRUaW1lKCkpID8gbnVsbCA6IGRhdGU7XG59XG5leHBvcnQgZnVuY3Rpb24gdG9Jc28odmFsdWUpIHtcbiAgICBjb25zdCBkYXRlID0gcGFyc2VUb0RhdGUodmFsdWUpO1xuICAgIGlmICghZGF0ZSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRXhwZWN0ZWQgYSB2YWxpZCBkYXRlIHZhbHVlXCIpO1xuICAgIH1cbiAgICByZXR1cm4gZGF0ZS50b0lTT1N0cmluZygpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHRvTnVsbGFibGVJc28odmFsdWUpIHtcbiAgICByZXR1cm4gcGFyc2VUb0RhdGUodmFsdWUpPy50b0lTT1N0cmluZygpID8/IG51bGw7XG59XG5leHBvcnQgZnVuY3Rpb24gdG9FcG9jaCh2YWx1ZSkge1xuICAgIGNvbnN0IGRhdGUgPSBwYXJzZVRvRGF0ZSh2YWx1ZSk7XG4gICAgaWYgKCFkYXRlKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJFeHBlY3RlZCBhIHZhbGlkIGRhdGUgdmFsdWVcIik7XG4gICAgfVxuICAgIHJldHVybiBkYXRlLmdldFRpbWUoKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiB0b051bGxhYmxlRXBvY2godmFsdWUpIHtcbiAgICByZXR1cm4gcGFyc2VUb0RhdGUodmFsdWUpPy5nZXRUaW1lKCkgPz8gbnVsbDtcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXRVc2VyVGltZXpvbmUoKSB7XG4gICAgaWYgKHR5cGVvZiBJbnRsID09PSBcInVuZGVmaW5lZFwiKVxuICAgICAgICByZXR1cm4gXCJVVENcIjtcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4gSW50bC5EYXRlVGltZUZvcm1hdCgpLnJlc29sdmVkT3B0aW9ucygpLnRpbWVab25lIHx8IFwiVVRDXCI7XG4gICAgfVxuICAgIGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIFwiVVRDXCI7XG4gICAgfVxufVxuZnVuY3Rpb24gZ2V0RGlzcGxheVRpbWV6b25lKHRpbWVab25lKSB7XG4gICAgaWYgKHRpbWVab25lKVxuICAgICAgICByZXR1cm4gdGltZVpvbmU7XG4gICAgcmV0dXJuIHR5cGVvZiB3aW5kb3cgPT09IFwidW5kZWZpbmVkXCIgPyBcIlVUQ1wiIDogZ2V0VXNlclRpbWV6b25lKCk7XG59XG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0QWJzb2x1dGUodmFsdWUsIG9wdHMgPSB7fSkge1xuICAgIGNvbnN0IGRhdGUgPSBwYXJzZVRvRGF0ZSh2YWx1ZSk7XG4gICAgaWYgKCFkYXRlKVxuICAgICAgICByZXR1cm4gXCJVbmtub3duIGRhdGVcIjtcbiAgICBjb25zdCBpbmNsdWRlVGltZSA9IG9wdHMuaW5jbHVkZVRpbWUgPz8gdHJ1ZTtcbiAgICBjb25zdCBmb3JtYXR0ZXIgPSBuZXcgSW50bC5EYXRlVGltZUZvcm1hdChub3JtYWxpemVMb2NhbGUob3B0cy5sb2NhbGUpLCB7XG4gICAgICAgIG1vbnRoOiBcInNob3J0XCIsXG4gICAgICAgIGRheTogXCJudW1lcmljXCIsXG4gICAgICAgIHllYXI6IFwibnVtZXJpY1wiLFxuICAgICAgICAuLi4oaW5jbHVkZVRpbWUgPyB7IGhvdXI6IFwibnVtZXJpY1wiLCBtaW51dGU6IFwiMi1kaWdpdFwiIH0gOiB7fSksXG4gICAgICAgIHRpbWVab25lOiBnZXREaXNwbGF5VGltZXpvbmUob3B0cy50aW1lWm9uZSksXG4gICAgfSk7XG4gICAgY29uc3QgZm9ybWF0dGVkID0gZm9ybWF0dGVyLmZvcm1hdChkYXRlKTtcbiAgICBpZiAoIWluY2x1ZGVUaW1lKVxuICAgICAgICByZXR1cm4gZm9ybWF0dGVkO1xuICAgIGNvbnN0IGxhc3RDb21tYSA9IGZvcm1hdHRlZC5sYXN0SW5kZXhPZihcIixcIik7XG4gICAgaWYgKGxhc3RDb21tYSA9PT0gLTEpXG4gICAgICAgIHJldHVybiBmb3JtYXR0ZWQ7XG4gICAgcmV0dXJuIGAke2Zvcm1hdHRlZC5zbGljZSgwLCBsYXN0Q29tbWEpfSDCtyAke2Zvcm1hdHRlZFxuICAgICAgICAuc2xpY2UobGFzdENvbW1hICsgMSlcbiAgICAgICAgLnRyaW0oKX1gO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdFJlbGF0aXZlKHZhbHVlLCBvcHRzID0ge30pIHtcbiAgICBjb25zdCBkYXRlID0gcGFyc2VUb0RhdGUodmFsdWUpO1xuICAgIGNvbnN0IGN1cnJlbnQgPSBwYXJzZVRvRGF0ZShvcHRzLm5vdyA/PyBub3dJc28oKSk7XG4gICAgaWYgKCFkYXRlIHx8ICFjdXJyZW50KSB7XG4gICAgICAgIHJldHVybiBcIlVua25vd24gZGF0ZVwiO1xuICAgIH1cbiAgICBjb25zdCBkaWZmTXMgPSBjdXJyZW50LmdldFRpbWUoKSAtIGRhdGUuZ2V0VGltZSgpO1xuICAgIGNvbnN0IGFic01zID0gTWF0aC5hYnMoZGlmZk1zKTtcbiAgICBjb25zdCBpc0Z1dHVyZSA9IGRpZmZNcyA8IDA7XG4gICAgY29uc3QgbWludXRlID0gNjAgKiAxMDAwO1xuICAgIGNvbnN0IGhvdXIgPSA2MCAqIG1pbnV0ZTtcbiAgICBjb25zdCBkYXkgPSAyNCAqIGhvdXI7XG4gICAgY29uc3Qgd2VlayA9IDcgKiBkYXk7XG4gICAgY29uc3QgbW9udGggPSAzMCAqIGRheTtcbiAgICBjb25zdCB5ZWFyID0gMzY1ICogZGF5O1xuICAgIGlmIChhYnNNcyA8IG1pbnV0ZSlcbiAgICAgICAgcmV0dXJuIFwiSnVzdCBub3dcIjtcbiAgICBpZiAoYWJzTXMgPCBob3VyKVxuICAgICAgICByZXR1cm4gZm9ybWF0UmVsYXRpdmVCdWNrZXQoTWF0aC5mbG9vcihhYnNNcyAvIG1pbnV0ZSksIFwibVwiLCBpc0Z1dHVyZSk7XG4gICAgaWYgKGFic01zIDwgZGF5KVxuICAgICAgICByZXR1cm4gZm9ybWF0UmVsYXRpdmVCdWNrZXQoTWF0aC5mbG9vcihhYnNNcyAvIGhvdXIpLCBcImhcIiwgaXNGdXR1cmUpO1xuICAgIGlmIChhYnNNcyA8IDIgKiBkYXkpXG4gICAgICAgIHJldHVybiBpc0Z1dHVyZSA/IFwiVG9tb3Jyb3dcIiA6IFwiWWVzdGVyZGF5XCI7XG4gICAgaWYgKGFic01zIDwgd2VlaylcbiAgICAgICAgcmV0dXJuIGZvcm1hdFJlbGF0aXZlQnVja2V0KE1hdGguZmxvb3IoYWJzTXMgLyBkYXkpLCBcImRcIiwgaXNGdXR1cmUpO1xuICAgIGlmIChhYnNNcyA8IG1vbnRoKVxuICAgICAgICByZXR1cm4gZm9ybWF0UmVsYXRpdmVCdWNrZXQoTWF0aC5mbG9vcihhYnNNcyAvIHdlZWspLCBcIndcIiwgaXNGdXR1cmUpO1xuICAgIGlmIChhYnNNcyA8IHllYXIpXG4gICAgICAgIHJldHVybiBmb3JtYXRSZWxhdGl2ZUJ1Y2tldChNYXRoLmZsb29yKGFic01zIC8gbW9udGgpLCBcIm1vXCIsIGlzRnV0dXJlKTtcbiAgICByZXR1cm4gZm9ybWF0UmVsYXRpdmVCdWNrZXQoTWF0aC5mbG9vcihhYnNNcyAvIHllYXIpLCBcInlcIiwgaXNGdXR1cmUpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdERhdGVPbmx5KHZhbHVlLCBvcHRzID0ge30pIHtcbiAgICBjb25zdCBkYXRlID0gcGFyc2VUb0RhdGUodmFsdWUpO1xuICAgIGlmICghZGF0ZSlcbiAgICAgICAgcmV0dXJuIFwiVW5rbm93biBkYXRlXCI7XG4gICAgcmV0dXJuIG5ldyBJbnRsLkRhdGVUaW1lRm9ybWF0KG5vcm1hbGl6ZUxvY2FsZShvcHRzLmxvY2FsZSksIHtcbiAgICAgICAgbW9udGg6IFwic2hvcnRcIixcbiAgICAgICAgZGF5OiBcIm51bWVyaWNcIixcbiAgICAgICAgeWVhcjogXCJudW1lcmljXCIsXG4gICAgICAgIHRpbWVab25lOiBnZXREaXNwbGF5VGltZXpvbmUob3B0cy50aW1lWm9uZSksXG4gICAgfSkuZm9ybWF0KGRhdGUpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdFRpbWVPbmx5KHZhbHVlLCBvcHRzID0ge30pIHtcbiAgICBjb25zdCBkYXRlID0gcGFyc2VUb0RhdGUodmFsdWUpO1xuICAgIGlmICghZGF0ZSlcbiAgICAgICAgcmV0dXJuIFwiVW5rbm93biB0aW1lXCI7XG4gICAgcmV0dXJuIG5ldyBJbnRsLkRhdGVUaW1lRm9ybWF0KG5vcm1hbGl6ZUxvY2FsZShvcHRzLmxvY2FsZSksIHtcbiAgICAgICAgaG91cjogXCJudW1lcmljXCIsXG4gICAgICAgIG1pbnV0ZTogXCIyLWRpZ2l0XCIsXG4gICAgICAgIHRpbWVab25lOiBnZXREaXNwbGF5VGltZXpvbmUob3B0cy50aW1lWm9uZSksXG4gICAgfSkuZm9ybWF0KGRhdGUpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdElzb0RhdGVPbmx5KHZhbHVlID0gbm93SXNvKCkpIHtcbiAgICByZXR1cm4gdG9Jc28ocGFyc2VUb0RhdGUodmFsdWUpID8/IG5vd0lzbygpKS5zbGljZSgwLCAxMCk7XG59XG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0TW9udGhZZWFyKHZhbHVlLCBvcHRzID0ge30pIHtcbiAgICBjb25zdCBkYXRlID0gcGFyc2VUb0RhdGUodmFsdWUpO1xuICAgIGlmICghZGF0ZSlcbiAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgcmV0dXJuIG5ldyBJbnRsLkRhdGVUaW1lRm9ybWF0KG5vcm1hbGl6ZUxvY2FsZShvcHRzLmxvY2FsZSksIHtcbiAgICAgICAgbW9udGg6IFwic2hvcnRcIixcbiAgICAgICAgeWVhcjogXCJudW1lcmljXCIsXG4gICAgICAgIHRpbWVab25lOiBnZXREaXNwbGF5VGltZXpvbmUob3B0cy50aW1lWm9uZSksXG4gICAgfSkuZm9ybWF0KGRhdGUpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzUGFzdCh2YWx1ZSwgbm93ID0gbm93SXNvKCkpIHtcbiAgICBjb25zdCBkYXRlID0gcGFyc2VUb0RhdGUodmFsdWUpO1xuICAgIGNvbnN0IGN1cnJlbnQgPSBwYXJzZVRvRGF0ZShub3cpO1xuICAgIHJldHVybiBCb29sZWFuKGRhdGUgJiYgY3VycmVudCAmJiBkYXRlLmdldFRpbWUoKSA8IGN1cnJlbnQuZ2V0VGltZSgpKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBpc0Z1dHVyZSh2YWx1ZSwgbm93ID0gbm93SXNvKCkpIHtcbiAgICBjb25zdCBkYXRlID0gcGFyc2VUb0RhdGUodmFsdWUpO1xuICAgIGNvbnN0IGN1cnJlbnQgPSBwYXJzZVRvRGF0ZShub3cpO1xuICAgIHJldHVybiBCb29sZWFuKGRhdGUgJiYgY3VycmVudCAmJiBkYXRlLmdldFRpbWUoKSA+IGN1cnJlbnQuZ2V0VGltZSgpKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBkaWZmU2Vjb25kcyhhLCBiKSB7XG4gICAgY29uc3QgZmlyc3QgPSBwYXJzZVRvRGF0ZShhKTtcbiAgICBjb25zdCBzZWNvbmQgPSBwYXJzZVRvRGF0ZShiKTtcbiAgICBpZiAoIWZpcnN0IHx8ICFzZWNvbmQpXG4gICAgICAgIHJldHVybiBOdW1iZXIuTmFOO1xuICAgIHJldHVybiBNYXRoLnRydW5jKChmaXJzdC5nZXRUaW1lKCkgLSBzZWNvbmQuZ2V0VGltZSgpKSAvIDEwMDApO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGRpZmZEYXlzKGEsIGIpIHtcbiAgICBjb25zdCBzZWNvbmRzID0gZGlmZlNlY29uZHMoYSwgYik7XG4gICAgcmV0dXJuIE51bWJlci5pc05hTihzZWNvbmRzKSA/IE51bWJlci5OYU4gOiBzZWNvbmRzIC8gODY0MDA7XG59XG5leHBvcnQgZnVuY3Rpb24gYWRkRGF5cyh2YWx1ZSwgZGF5cykge1xuICAgIGNvbnN0IGRhdGUgPSBwYXJzZVRvRGF0ZSh2YWx1ZSk7XG4gICAgaWYgKCFkYXRlKVxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRXhwZWN0ZWQgYSB2YWxpZCBkYXRlIHZhbHVlXCIpO1xuICAgIHJldHVybiBuZXcgRGF0ZShkYXRlLmdldFRpbWUoKSArIGRheXMgKiA4NjQwMDAwMCk7XG59XG5leHBvcnQgZnVuY3Rpb24gYWRkTWludXRlcyh2YWx1ZSwgbWludXRlcykge1xuICAgIGNvbnN0IGRhdGUgPSBwYXJzZVRvRGF0ZSh2YWx1ZSk7XG4gICAgaWYgKCFkYXRlKVxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRXhwZWN0ZWQgYSB2YWxpZCBkYXRlIHZhbHVlXCIpO1xuICAgIHJldHVybiBuZXcgRGF0ZShkYXRlLmdldFRpbWUoKSArIG1pbnV0ZXMgKiA2MDAwMCk7XG59XG5leHBvcnQgZnVuY3Rpb24gc3RhcnRPZkRheSh2YWx1ZSwgdGltZVpvbmUgPSBcIlVUQ1wiKSB7XG4gICAgY29uc3QgZGF0ZSA9IHBhcnNlVG9EYXRlKHZhbHVlKTtcbiAgICBpZiAoIWRhdGUpXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJFeHBlY3RlZCBhIHZhbGlkIGRhdGUgdmFsdWVcIik7XG4gICAgaWYgKHRpbWVab25lID09PSBcIlVUQ1wiKSB7XG4gICAgICAgIHJldHVybiBuZXcgRGF0ZShEYXRlLlVUQyhkYXRlLmdldFVUQ0Z1bGxZZWFyKCksIGRhdGUuZ2V0VVRDTW9udGgoKSwgZGF0ZS5nZXRVVENEYXRlKCkpKTtcbiAgICB9XG4gICAgY29uc3QgcGFydHMgPSBnZXRab25lZFBhcnRzKGRhdGUsIHRpbWVab25lKTtcbiAgICByZXR1cm4gem9uZWRUaW1lVG9VdGMocGFydHMueWVhciwgcGFydHMubW9udGgsIHBhcnRzLmRheSwgMCwgMCwgMCwgdGltZVpvbmUpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGVuZE9mRGF5KHZhbHVlLCB0aW1lWm9uZSA9IFwiVVRDXCIpIHtcbiAgICByZXR1cm4gYWRkTWludXRlcyhhZGREYXlzKHN0YXJ0T2ZEYXkodmFsdWUsIHRpbWVab25lKSwgMSksIC0xIC8gNjAwMDApO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHRvVXNlclR6KHZhbHVlLCB0aW1lWm9uZSA9IGdldFVzZXJUaW1lem9uZSgpKSB7XG4gICAgY29uc3QgZGF0ZSA9IHBhcnNlVG9EYXRlKHZhbHVlKTtcbiAgICBpZiAoIWRhdGUpXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJFeHBlY3RlZCBhIHZhbGlkIGRhdGUgdmFsdWVcIik7XG4gICAgY29uc3QgcGFydHMgPSBnZXRab25lZFBhcnRzKGRhdGUsIHRpbWVab25lKTtcbiAgICByZXR1cm4gbmV3IERhdGUocGFydHMueWVhciwgcGFydHMubW9udGggLSAxLCBwYXJ0cy5kYXksIHBhcnRzLmhvdXIsIHBhcnRzLm1pbnV0ZSwgcGFydHMuc2Vjb25kKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXREYXRlQWJzb2x1dGUoZGF0ZSwgbG9jYWxlID0gREVGQVVMVF9MT0NBTEUpIHtcbiAgICByZXR1cm4gZm9ybWF0QWJzb2x1dGUoZGF0ZSwgeyBsb2NhbGUgfSk7XG59XG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0RGF0ZVJlbGF0aXZlKGRhdGUsIG5vdyA9IG5vd0lzbygpKSB7XG4gICAgcmV0dXJuIGZvcm1hdFJlbGF0aXZlKGRhdGUsIHsgbm93IH0pO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldEJyb3dzZXJEZWZhdWx0TG9jYWxlKCkge1xuICAgIGlmICh0eXBlb2YgbmF2aWdhdG9yID09PSBcInVuZGVmaW5lZFwiKVxuICAgICAgICByZXR1cm4gREVGQVVMVF9MT0NBTEU7XG4gICAgcmV0dXJuIG5vcm1hbGl6ZUxvY2FsZShuYXZpZ2F0b3IubGFuZ3VhZ2UpO1xufVxuZnVuY3Rpb24gZm9ybWF0UmVsYXRpdmVCdWNrZXQodmFsdWUsIHVuaXQsIGlzRnV0dXJlKSB7XG4gICAgcmV0dXJuIGlzRnV0dXJlID8gYGluICR7dmFsdWV9JHt1bml0fWAgOiBgJHt2YWx1ZX0ke3VuaXR9IGFnb2A7XG59XG5mdW5jdGlvbiBnZXRab25lZFBhcnRzKGRhdGUsIHRpbWVab25lKSB7XG4gICAgY29uc3QgcGFydHMgPSBuZXcgSW50bC5EYXRlVGltZUZvcm1hdChOVU1FUklDX1BBUlRTX0xPQ0FMRSwge1xuICAgICAgICB0aW1lWm9uZSxcbiAgICAgICAgeWVhcjogXCJudW1lcmljXCIsXG4gICAgICAgIG1vbnRoOiBcIjItZGlnaXRcIixcbiAgICAgICAgZGF5OiBcIjItZGlnaXRcIixcbiAgICAgICAgaG91cjogXCIyLWRpZ2l0XCIsXG4gICAgICAgIG1pbnV0ZTogXCIyLWRpZ2l0XCIsXG4gICAgICAgIHNlY29uZDogXCIyLWRpZ2l0XCIsXG4gICAgICAgIGhvdXJDeWNsZTogXCJoMjNcIixcbiAgICB9KS5mb3JtYXRUb1BhcnRzKGRhdGUpO1xuICAgIGNvbnN0IGdldCA9ICh0eXBlKSA9PiBOdW1iZXIocGFydHMuZmluZCgocGFydCkgPT4gcGFydC50eXBlID09PSB0eXBlKT8udmFsdWUpO1xuICAgIHJldHVybiB7XG4gICAgICAgIHllYXI6IGdldChcInllYXJcIiksXG4gICAgICAgIG1vbnRoOiBnZXQoXCJtb250aFwiKSxcbiAgICAgICAgZGF5OiBnZXQoXCJkYXlcIiksXG4gICAgICAgIGhvdXI6IGdldChcImhvdXJcIiksXG4gICAgICAgIG1pbnV0ZTogZ2V0KFwibWludXRlXCIpLFxuICAgICAgICBzZWNvbmQ6IGdldChcInNlY29uZFwiKSxcbiAgICB9O1xufVxuZnVuY3Rpb24gem9uZWRUaW1lVG9VdGMoeWVhciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIHRpbWVab25lKSB7XG4gICAgY29uc3QgdXRjR3Vlc3MgPSBuZXcgRGF0ZShEYXRlLlVUQyh5ZWFyLCBtb250aCAtIDEsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQpKTtcbiAgICBjb25zdCBwYXJ0cyA9IGdldFpvbmVkUGFydHModXRjR3Vlc3MsIHRpbWVab25lKTtcbiAgICBjb25zdCBvZmZzZXRNcyA9IERhdGUuVVRDKHBhcnRzLnllYXIsIHBhcnRzLm1vbnRoIC0gMSwgcGFydHMuZGF5LCBwYXJ0cy5ob3VyLCBwYXJ0cy5taW51dGUsIHBhcnRzLnNlY29uZCkgLSB1dGNHdWVzcy5nZXRUaW1lKCk7XG4gICAgcmV0dXJuIG5ldyBEYXRlKHV0Y0d1ZXNzLmdldFRpbWUoKSAtIG9mZnNldE1zKTtcbn1cbiIsImV4cG9ydCBjb25zdCBTVUJfU0NPUkVfTUFYX1BPSU5UUyA9IHtcbiAgICBzZWN0aW9uQ29tcGxldGVuZXNzOiAxMCxcbiAgICBhY3Rpb25WZXJiczogMTUsXG4gICAgcXVhbnRpZmllZEFjaGlldmVtZW50czogMjAsXG4gICAga2V5d29yZE1hdGNoOiAyNSxcbiAgICBsZW5ndGg6IDEwLFxuICAgIHNwZWxsaW5nR3JhbW1hcjogMTAsXG4gICAgYXRzRnJpZW5kbGluZXNzOiAxMCxcbn07XG5leHBvcnQgY29uc3QgQUNUSU9OX1ZFUkJTID0gW1xuICAgIFwiYWNoaWV2ZWRcIixcbiAgICBcImFuYWx5emVkXCIsXG4gICAgXCJhcmNoaXRlY3RlZFwiLFxuICAgIFwiYnVpbHRcIixcbiAgICBcImNvbGxhYm9yYXRlZFwiLFxuICAgIFwiY3JlYXRlZFwiLFxuICAgIFwiZGVsaXZlcmVkXCIsXG4gICAgXCJkZXNpZ25lZFwiLFxuICAgIFwiZGV2ZWxvcGVkXCIsXG4gICAgXCJkcm92ZVwiLFxuICAgIFwiaW1wcm92ZWRcIixcbiAgICBcImluY3JlYXNlZFwiLFxuICAgIFwibGF1bmNoZWRcIixcbiAgICBcImxlZFwiLFxuICAgIFwibWFuYWdlZFwiLFxuICAgIFwibWVudG9yZWRcIixcbiAgICBcIm9wdGltaXplZFwiLFxuICAgIFwicmVkdWNlZFwiLFxuICAgIFwicmVzb2x2ZWRcIixcbiAgICBcInNoaXBwZWRcIixcbiAgICBcInN0cmVhbWxpbmVkXCIsXG4gICAgXCJzdXBwb3J0ZWRcIixcbiAgICBcInRyYW5zZm9ybWVkXCIsXG5dO1xuZXhwb3J0IGNvbnN0IFFVQU5USUZJRURfUkVHRVggPSAvXFxkKyV8XFwkW1xcZCxdKyg/OlxcLlxcZCspP1trS21NYkJdP3xcXGJcXGQreFxcYnxcXGJ0ZWFtIG9mIFxcZCtcXGJ8XFxiXFxkK1xccysodXNlcnN8Y3VzdG9tZXJzfGNsaWVudHN8cHJvamVjdHN8cGVvcGxlfGVuZ2luZWVyc3xyZXBvcnRzfGhvdXJzfG1lbWJlcnN8Y291bnRyaWVzfGxhbmd1YWdlc3xzdGF0ZXN8Y2l0aWVzfHN0b3Jlc3xwYXJ0bmVyc3xkZWFsc3xsZWFkcylcXGIvZ2k7XG4iLCJleHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplVGV4dCh0ZXh0KSB7XG4gICAgcmV0dXJuIHRleHRcbiAgICAgICAgLnRvTG93ZXJDYXNlKClcbiAgICAgICAgLnJlcGxhY2UoL1teYS16MC05KyMuXFxzLy1dL2csIFwiIFwiKVxuICAgICAgICAucmVwbGFjZSgvXFxzKy9nLCBcIiBcIilcbiAgICAgICAgLnRyaW0oKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBlc2NhcGVSZWdFeHAoc3RyKSB7XG4gICAgcmV0dXJuIHN0ci5yZXBsYWNlKC9bLiorP14ke30oKXxbXFxdXFxcXF0vZywgXCJcXFxcJCZcIik7XG59XG5leHBvcnQgZnVuY3Rpb24gd29yZEJvdW5kYXJ5UmVnZXgodGVybSwgZmxhZ3MgPSBcIlwiKSB7XG4gICAgcmV0dXJuIG5ldyBSZWdFeHAoYFxcXFxiJHtlc2NhcGVSZWdFeHAodGVybSl9XFxcXGJgLCBmbGFncyk7XG59XG5leHBvcnQgZnVuY3Rpb24gY29udGFpbnNXb3JkKHRleHQsIHRlcm0pIHtcbiAgICByZXR1cm4gd29yZEJvdW5kYXJ5UmVnZXgodGVybSkudGVzdCh0ZXh0KTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBjb3VudFdvcmRPY2N1cnJlbmNlcyh0ZXh0LCB0ZXJtKSB7XG4gICAgcmV0dXJuICh0ZXh0Lm1hdGNoKHdvcmRCb3VuZGFyeVJlZ2V4KHRlcm0sIFwiZ1wiKSkgfHwgW10pLmxlbmd0aDtcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXRIaWdobGlnaHRzKHByb2ZpbGUpIHtcbiAgICByZXR1cm4gW1xuICAgICAgICAuLi5wcm9maWxlLmV4cGVyaWVuY2VzLmZsYXRNYXAoKGV4cGVyaWVuY2UpID0+IGV4cGVyaWVuY2UuaGlnaGxpZ2h0cyksXG4gICAgICAgIC4uLnByb2ZpbGUucHJvamVjdHMuZmxhdE1hcCgocHJvamVjdCkgPT4gcHJvamVjdC5oaWdobGlnaHRzKSxcbiAgICBdLmZpbHRlcihCb29sZWFuKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0UHJvZmlsZVRleHQocHJvZmlsZSkge1xuICAgIGNvbnN0IHBhcnRzID0gW1xuICAgICAgICBwcm9maWxlLmNvbnRhY3Q/Lm5hbWUsXG4gICAgICAgIHByb2ZpbGUuY29udGFjdD8uZW1haWwsXG4gICAgICAgIHByb2ZpbGUuY29udGFjdD8ucGhvbmUsXG4gICAgICAgIHByb2ZpbGUuY29udGFjdD8ubG9jYXRpb24sXG4gICAgICAgIHByb2ZpbGUuY29udGFjdD8ubGlua2VkaW4sXG4gICAgICAgIHByb2ZpbGUuY29udGFjdD8uZ2l0aHViLFxuICAgICAgICBwcm9maWxlLmNvbnRhY3Q/LndlYnNpdGUsXG4gICAgICAgIHByb2ZpbGUuY29udGFjdD8uaGVhZGxpbmUsXG4gICAgICAgIHByb2ZpbGUuc3VtbWFyeSxcbiAgICAgICAgLi4ucHJvZmlsZS5leHBlcmllbmNlcy5mbGF0TWFwKChleHBlcmllbmNlKSA9PiBbXG4gICAgICAgICAgICBleHBlcmllbmNlLnRpdGxlLFxuICAgICAgICAgICAgZXhwZXJpZW5jZS5jb21wYW55LFxuICAgICAgICAgICAgZXhwZXJpZW5jZS5sb2NhdGlvbixcbiAgICAgICAgICAgIGV4cGVyaWVuY2UuZGVzY3JpcHRpb24sXG4gICAgICAgICAgICAuLi5leHBlcmllbmNlLmhpZ2hsaWdodHMsXG4gICAgICAgICAgICAuLi5leHBlcmllbmNlLnNraWxscyxcbiAgICAgICAgICAgIGV4cGVyaWVuY2Uuc3RhcnREYXRlLFxuICAgICAgICAgICAgZXhwZXJpZW5jZS5lbmREYXRlLFxuICAgICAgICBdKSxcbiAgICAgICAgLi4ucHJvZmlsZS5lZHVjYXRpb24uZmxhdE1hcCgoZWR1Y2F0aW9uKSA9PiBbXG4gICAgICAgICAgICBlZHVjYXRpb24uaW5zdGl0dXRpb24sXG4gICAgICAgICAgICBlZHVjYXRpb24uZGVncmVlLFxuICAgICAgICAgICAgZWR1Y2F0aW9uLmZpZWxkLFxuICAgICAgICAgICAgLi4uZWR1Y2F0aW9uLmhpZ2hsaWdodHMsXG4gICAgICAgICAgICBlZHVjYXRpb24uc3RhcnREYXRlLFxuICAgICAgICAgICAgZWR1Y2F0aW9uLmVuZERhdGUsXG4gICAgICAgIF0pLFxuICAgICAgICAuLi5wcm9maWxlLnNraWxscy5tYXAoKHNraWxsKSA9PiBza2lsbC5uYW1lKSxcbiAgICAgICAgLi4ucHJvZmlsZS5wcm9qZWN0cy5mbGF0TWFwKChwcm9qZWN0KSA9PiBbXG4gICAgICAgICAgICBwcm9qZWN0Lm5hbWUsXG4gICAgICAgICAgICBwcm9qZWN0LmRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgcHJvamVjdC51cmwsXG4gICAgICAgICAgICAuLi5wcm9qZWN0LmhpZ2hsaWdodHMsXG4gICAgICAgICAgICAuLi5wcm9qZWN0LnRlY2hub2xvZ2llcyxcbiAgICAgICAgXSksXG4gICAgICAgIC4uLnByb2ZpbGUuY2VydGlmaWNhdGlvbnMuZmxhdE1hcCgoY2VydGlmaWNhdGlvbikgPT4gW1xuICAgICAgICAgICAgY2VydGlmaWNhdGlvbi5uYW1lLFxuICAgICAgICAgICAgY2VydGlmaWNhdGlvbi5pc3N1ZXIsXG4gICAgICAgICAgICBjZXJ0aWZpY2F0aW9uLmRhdGUsXG4gICAgICAgICAgICBjZXJ0aWZpY2F0aW9uLnVybCxcbiAgICAgICAgXSksXG4gICAgXTtcbiAgICByZXR1cm4gcGFydHMuZmlsdGVyKEJvb2xlYW4pLmpvaW4oXCJcXG5cIik7XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0UmVzdW1lVGV4dChwcm9maWxlLCByYXdUZXh0KSB7XG4gICAgcmV0dXJuIChyYXdUZXh0Py50cmltKCkgfHwgcHJvZmlsZS5yYXdUZXh0Py50cmltKCkgfHwgZXh0cmFjdFByb2ZpbGVUZXh0KHByb2ZpbGUpKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiB3b3JkQ291bnQodGV4dCkge1xuICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSBub3JtYWxpemVUZXh0KHRleHQpO1xuICAgIGlmICghbm9ybWFsaXplZClcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgcmV0dXJuIG5vcm1hbGl6ZWQuc3BsaXQoL1xccysvKS5maWx0ZXIoQm9vbGVhbikubGVuZ3RoO1xufVxuIiwiaW1wb3J0IHsgQUNUSU9OX1ZFUkJTLCBTVUJfU0NPUkVfTUFYX1BPSU5UUyB9IGZyb20gXCIuL2NvbnN0YW50c1wiO1xuaW1wb3J0IHsgZ2V0SGlnaGxpZ2h0cywgbm9ybWFsaXplVGV4dCwgd29yZEJvdW5kYXJ5UmVnZXggfSBmcm9tIFwiLi90ZXh0XCI7XG5mdW5jdGlvbiBwb2ludHNGb3JEaXN0aW5jdFZlcmJzKGNvdW50KSB7XG4gICAgaWYgKGNvdW50ID09PSAwKVxuICAgICAgICByZXR1cm4gMDtcbiAgICBpZiAoY291bnQgPD0gMilcbiAgICAgICAgcmV0dXJuIDU7XG4gICAgaWYgKGNvdW50IDw9IDQpXG4gICAgICAgIHJldHVybiA5O1xuICAgIGlmIChjb3VudCA8PSA3KVxuICAgICAgICByZXR1cm4gMTI7XG4gICAgcmV0dXJuIDE1O1xufVxuZXhwb3J0IGZ1bmN0aW9uIHNjb3JlQWN0aW9uVmVyYnMoaW5wdXQpIHtcbiAgICBjb25zdCBkaXN0aW5jdFZlcmJzID0gbmV3IFNldCgpO1xuICAgIGZvciAoY29uc3QgaGlnaGxpZ2h0IG9mIGdldEhpZ2hsaWdodHMoaW5wdXQucHJvZmlsZSkpIHtcbiAgICAgICAgY29uc3QgZmlyc3RXb3JkID0gbm9ybWFsaXplVGV4dChoaWdobGlnaHQpLnNwbGl0KC9cXHMrLylbMF0gPz8gXCJcIjtcbiAgICAgICAgZm9yIChjb25zdCB2ZXJiIG9mIEFDVElPTl9WRVJCUykge1xuICAgICAgICAgICAgaWYgKHdvcmRCb3VuZGFyeVJlZ2V4KHZlcmIpLnRlc3QoZmlyc3RXb3JkKSkge1xuICAgICAgICAgICAgICAgIGRpc3RpbmN0VmVyYnMuYWRkKHZlcmIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHZlcmJzID0gQXJyYXkuZnJvbShkaXN0aW5jdFZlcmJzKS5zb3J0KCk7XG4gICAgY29uc3Qgbm90ZXMgPSB2ZXJicy5sZW5ndGggPT09IDBcbiAgICAgICAgPyBbXCJTdGFydCBhY2hpZXZlbWVudCBidWxsZXRzIHdpdGggc3Ryb25nIGFjdGlvbiB2ZXJicy5cIl1cbiAgICAgICAgOiBbXTtcbiAgICBjb25zdCBwcmV2aWV3ID0gdmVyYnMuc2xpY2UoMCwgNSkuam9pbihcIiwgXCIpO1xuICAgIHJldHVybiB7XG4gICAgICAgIGtleTogXCJhY3Rpb25WZXJic1wiLFxuICAgICAgICBsYWJlbDogXCJBY3Rpb24gdmVyYnNcIixcbiAgICAgICAgZWFybmVkOiBwb2ludHNGb3JEaXN0aW5jdFZlcmJzKHZlcmJzLmxlbmd0aCksXG4gICAgICAgIG1heFBvaW50czogU1VCX1NDT1JFX01BWF9QT0lOVFMuYWN0aW9uVmVyYnMsXG4gICAgICAgIG5vdGVzLFxuICAgICAgICBldmlkZW5jZTogW1xuICAgICAgICAgICAgcHJldmlld1xuICAgICAgICAgICAgICAgID8gYCR7dmVyYnMubGVuZ3RofSBkaXN0aW5jdCBhY3Rpb24gdmVyYnMgKCR7cHJldmlld30pYFxuICAgICAgICAgICAgICAgIDogXCIwIGRpc3RpbmN0IGFjdGlvbiB2ZXJic1wiLFxuICAgICAgICBdLFxuICAgIH07XG59XG4iLCJleHBvcnQgY29uc3QgUFJPQkxFTUFUSUNfQ0hBUkFDVEVSUyA9IFtcbiAgICB7IGNoYXI6IFwiXFx1MjAyMlwiLCBuYW1lOiBcImJ1bGxldCBwb2ludFwiLCByZXBsYWNlbWVudDogXCItXCIgfSxcbiAgICB7IGNoYXI6IFwiXFx1MjAxM1wiLCBuYW1lOiBcImVuIGRhc2hcIiwgcmVwbGFjZW1lbnQ6IFwiLVwiIH0sXG4gICAgeyBjaGFyOiBcIlxcdTIwMTRcIiwgbmFtZTogXCJlbSBkYXNoXCIsIHJlcGxhY2VtZW50OiBcIi1cIiB9LFxuICAgIHsgY2hhcjogXCJcXHUyMDFjXCIsIG5hbWU6IFwiY3VybHkgcXVvdGUgbGVmdFwiLCByZXBsYWNlbWVudDogJ1wiJyB9LFxuICAgIHsgY2hhcjogXCJcXHUyMDFkXCIsIG5hbWU6IFwiY3VybHkgcXVvdGUgcmlnaHRcIiwgcmVwbGFjZW1lbnQ6ICdcIicgfSxcbiAgICB7IGNoYXI6IFwiXFx1MjAxOFwiLCBuYW1lOiBcImN1cmx5IGFwb3N0cm9waGUgbGVmdFwiLCByZXBsYWNlbWVudDogXCInXCIgfSxcbiAgICB7IGNoYXI6IFwiXFx1MjAxOVwiLCBuYW1lOiBcImN1cmx5IGFwb3N0cm9waGUgcmlnaHRcIiwgcmVwbGFjZW1lbnQ6IFwiJ1wiIH0sXG4gICAgeyBjaGFyOiBcIlxcdTIwMjZcIiwgbmFtZTogXCJlbGxpcHNpc1wiLCByZXBsYWNlbWVudDogXCIuLi5cIiB9LFxuICAgIHsgY2hhcjogXCJcXHUwMGE5XCIsIG5hbWU6IFwiY29weXJpZ2h0XCIsIHJlcGxhY2VtZW50OiBcIihjKVwiIH0sXG4gICAgeyBjaGFyOiBcIlxcdTAwYWVcIiwgbmFtZTogXCJyZWdpc3RlcmVkXCIsIHJlcGxhY2VtZW50OiBcIihSKVwiIH0sXG4gICAgeyBjaGFyOiBcIlxcdTIxMjJcIiwgbmFtZTogXCJ0cmFkZW1hcmtcIiwgcmVwbGFjZW1lbnQ6IFwiKFRNKVwiIH0sXG5dO1xuIiwiaW1wb3J0IHsgUFJPQkxFTUFUSUNfQ0hBUkFDVEVSUyB9IGZyb20gXCIuL2F0cy1jaGFyYWN0ZXJzXCI7XG5pbXBvcnQgeyBTVUJfU0NPUkVfTUFYX1BPSU5UUyB9IGZyb20gXCIuL2NvbnN0YW50c1wiO1xuaW1wb3J0IHsgZ2V0UmVzdW1lVGV4dCB9IGZyb20gXCIuL3RleHRcIjtcbmV4cG9ydCBmdW5jdGlvbiBzY29yZUF0c0ZyaWVuZGxpbmVzcyhpbnB1dCkge1xuICAgIGNvbnN0IHRleHQgPSBnZXRSZXN1bWVUZXh0KGlucHV0LnByb2ZpbGUsIGlucHV0LnJhd1RleHQpO1xuICAgIGNvbnN0IHJhd1RleHQgPSBpbnB1dC5yYXdUZXh0ID8/IGlucHV0LnByb2ZpbGUucmF3VGV4dCA/PyBcIlwiO1xuICAgIGNvbnN0IG5vdGVzID0gW107XG4gICAgY29uc3QgZXZpZGVuY2UgPSBbXTtcbiAgICBsZXQgZGVkdWN0aW9ucyA9IDA7XG4gICAgY29uc3QgZm91bmRQcm9ibGVtYXRpYyA9IFBST0JMRU1BVElDX0NIQVJBQ1RFUlMuZmlsdGVyKCh7IGNoYXIgfSkgPT4gdGV4dC5pbmNsdWRlcyhjaGFyKSk7XG4gICAgaWYgKGZvdW5kUHJvYmxlbWF0aWMubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBwZW5hbHR5ID0gTWF0aC5taW4oMywgZm91bmRQcm9ibGVtYXRpYy5sZW5ndGgpO1xuICAgICAgICBkZWR1Y3Rpb25zICs9IHBlbmFsdHk7XG4gICAgICAgIG5vdGVzLnB1c2goXCJTcGVjaWFsIGZvcm1hdHRpbmcgY2hhcmFjdGVycyBjYW4gcmVkdWNlIEFUUyBwYXJzZSBxdWFsaXR5LlwiKTtcbiAgICAgICAgZXZpZGVuY2UucHVzaChgJHtmb3VuZFByb2JsZW1hdGljLmxlbmd0aH0gc3BlY2lhbCBjaGFyYWN0ZXJzYCk7XG4gICAgfVxuICAgIGNvbnN0IGJhZENoYXJzID0gKHRleHQubWF0Y2goL1tcXHVGRkZEXFx1MDAwMC1cXHUwMDA4XFx1MDAwQlxcdTAwMENcXHUwMDBFLVxcdTAwMUZdL2cpIHx8IFtdKS5sZW5ndGg7XG4gICAgaWYgKGJhZENoYXJzID4gMCkge1xuICAgICAgICBkZWR1Y3Rpb25zICs9IDI7XG4gICAgICAgIG5vdGVzLnB1c2goXCJDb250cm9sIG9yIHJlcGxhY2VtZW50IGNoYXJhY3RlcnMgZGV0ZWN0ZWQuXCIpO1xuICAgICAgICBldmlkZW5jZS5wdXNoKGAke2JhZENoYXJzfSBjb250cm9sIG9yIHJlcGxhY2VtZW50IGNoYXJhY3RlcihzKWApO1xuICAgIH1cbiAgICBpZiAocmF3VGV4dC5pbmNsdWRlcyhcIlxcdFwiKSkge1xuICAgICAgICBkZWR1Y3Rpb25zICs9IDI7XG4gICAgICAgIG5vdGVzLnB1c2goXCJUYWIgY2hhcmFjdGVycyBtYXkgaW5kaWNhdGUgdGFibGUtc3R5bGUgZm9ybWF0dGluZy5cIik7XG4gICAgICAgIGV2aWRlbmNlLnB1c2goXCJUYWIgY2hhcmFjdGVycyBmb3VuZFwiKTtcbiAgICB9XG4gICAgY29uc3QgbG9uZ0xpbmVzID0gcmF3VGV4dC5zcGxpdCgvXFxyP1xcbi8pLmZpbHRlcigobGluZSkgPT4gbGluZS5sZW5ndGggPiAyMDApO1xuICAgIGlmIChsb25nTGluZXMubGVuZ3RoID49IDQpIHtcbiAgICAgICAgZGVkdWN0aW9ucyArPSAyO1xuICAgICAgICBub3Rlcy5wdXNoKFwiVmVyeSBsb25nIGxpbmVzIG1heSBpbmRpY2F0ZSBtdWx0aS1jb2x1bW4gb3IgdGFibGUgZm9ybWF0dGluZy5cIik7XG4gICAgICAgIGV2aWRlbmNlLnB1c2goYCR7bG9uZ0xpbmVzLmxlbmd0aH0gb3Zlci1sb25nIGxpbmVzYCk7XG4gICAgfVxuICAgIGlmICgvPFthLXpBLVovXVtePl0qPi8udGVzdChyYXdUZXh0KSkge1xuICAgICAgICBkZWR1Y3Rpb25zICs9IDI7XG4gICAgICAgIG5vdGVzLnB1c2goXCJIVE1MIHRhZ3MgZGV0ZWN0ZWQgaW4gcmVzdW1lIHRleHQuXCIpO1xuICAgICAgICBldmlkZW5jZS5wdXNoKFwiSFRNTCB0YWdzIGZvdW5kXCIpO1xuICAgIH1cbiAgICBpZiAoIS9bXFx3ListXStAW1xcdy4tXStcXC5bYS16QS1aXXsyLH0vLnRlc3QodGV4dCkpIHtcbiAgICAgICAgZGVkdWN0aW9ucyArPSAyO1xuICAgICAgICBub3Rlcy5wdXNoKFwiTm8gZW1haWwgcGF0dGVybiBkZXRlY3RlZCBpbiBwYXJzZWFibGUgcmVzdW1lIHRleHQuXCIpO1xuICAgICAgICBldmlkZW5jZS5wdXNoKFwiTm8gZW1haWwgZGV0ZWN0ZWRcIik7XG4gICAgfVxuICAgIGlmIChpbnB1dC5yYXdUZXh0ICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgaW5wdXQucmF3VGV4dC50cmltKCkubGVuZ3RoIDwgMjAwICYmXG4gICAgICAgIGlucHV0LnByb2ZpbGUuZXhwZXJpZW5jZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBkZWR1Y3Rpb25zICs9IDM7XG4gICAgICAgIG5vdGVzLnB1c2goXCJFeHRyYWN0ZWQgdGV4dCBpcyB2ZXJ5IHNob3J0IGZvciBhIHJlc3VtZSB3aXRoIGV4cGVyaWVuY2UuXCIpO1xuICAgICAgICBldmlkZW5jZS5wdXNoKFwiUG9zc2libGUgaW1hZ2Utb25seSBQREZcIik7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIGtleTogXCJhdHNGcmllbmRsaW5lc3NcIixcbiAgICAgICAgbGFiZWw6IFwiQVRTIGZyaWVuZGxpbmVzc1wiLFxuICAgICAgICBlYXJuZWQ6IE1hdGgubWF4KDAsIFNVQl9TQ09SRV9NQVhfUE9JTlRTLmF0c0ZyaWVuZGxpbmVzcyAtIGRlZHVjdGlvbnMpLFxuICAgICAgICBtYXhQb2ludHM6IFNVQl9TQ09SRV9NQVhfUE9JTlRTLmF0c0ZyaWVuZGxpbmVzcyxcbiAgICAgICAgbm90ZXMsXG4gICAgICAgIGV2aWRlbmNlOiBldmlkZW5jZS5sZW5ndGggPiAwID8gZXZpZGVuY2UgOiBbXCJObyBBVFMgZm9ybWF0dGluZyBpc3N1ZXMgZGV0ZWN0ZWQuXCJdLFxuICAgIH07XG59XG4iLCIvKipcbiAqIFN5bm9ueW0gZ3JvdXBzIGZvciBzZW1hbnRpYyBrZXl3b3JkIG1hdGNoaW5nIGluIEFUUyBzY29yaW5nLlxuICogRWFjaCBncm91cCBtYXBzIGEgY2Fub25pY2FsIHRlcm0gdG8gaXRzIHN5bm9ueW1zL3ZhcmlhdGlvbnMuXG4gKiBBbGwgdGVybXMgc2hvdWxkIGJlIGxvd2VyY2FzZS5cbiAqL1xuZXhwb3J0IGNvbnN0IFNZTk9OWU1fR1JPVVBTID0gW1xuICAgIC8vIFByb2dyYW1taW5nIExhbmd1YWdlc1xuICAgIHsgY2Fub25pY2FsOiBcImphdmFzY3JpcHRcIiwgc3lub255bXM6IFtcImpzXCIsIFwiZWNtYXNjcmlwdFwiLCBcImVzNlwiLCBcImVzMjAxNVwiXSB9LFxuICAgIHsgY2Fub25pY2FsOiBcInR5cGVzY3JpcHRcIiwgc3lub255bXM6IFtcInRzXCJdIH0sXG4gICAgeyBjYW5vbmljYWw6IFwicHl0aG9uXCIsIHN5bm9ueW1zOiBbXCJweVwiLCBcInB5dGhvbjNcIl0gfSxcbiAgICB7IGNhbm9uaWNhbDogXCJnb2xhbmdcIiwgc3lub255bXM6IFtcImdvXCJdIH0sXG4gICAgeyBjYW5vbmljYWw6IFwiYyNcIiwgc3lub255bXM6IFtcImNzaGFycFwiLCBcImMgc2hhcnBcIiwgXCJkb3RuZXRcIiwgXCIubmV0XCJdIH0sXG4gICAgeyBjYW5vbmljYWw6IFwiYysrXCIsIHN5bm9ueW1zOiBbXCJjcHBcIiwgXCJjcGx1c3BsdXNcIl0gfSxcbiAgICB7IGNhbm9uaWNhbDogXCJydWJ5XCIsIHN5bm9ueW1zOiBbXCJyYlwiXSB9LFxuICAgIHsgY2Fub25pY2FsOiBcImtvdGxpblwiLCBzeW5vbnltczogW1wia3RcIl0gfSxcbiAgICB7IGNhbm9uaWNhbDogXCJvYmplY3RpdmUtY1wiLCBzeW5vbnltczogW1wib2JqY1wiLCBcIm9iai1jXCJdIH0sXG4gICAgLy8gRnJvbnRlbmQgRnJhbWV3b3Jrc1xuICAgIHsgY2Fub25pY2FsOiBcInJlYWN0XCIsIHN5bm9ueW1zOiBbXCJyZWFjdGpzXCIsIFwicmVhY3QuanNcIiwgXCJyZWFjdCBqc1wiXSB9LFxuICAgIHsgY2Fub25pY2FsOiBcImFuZ3VsYXJcIiwgc3lub255bXM6IFtcImFuZ3VsYXJqc1wiLCBcImFuZ3VsYXIuanNcIiwgXCJhbmd1bGFyIGpzXCJdIH0sXG4gICAgeyBjYW5vbmljYWw6IFwidnVlXCIsIHN5bm9ueW1zOiBbXCJ2dWVqc1wiLCBcInZ1ZS5qc1wiLCBcInZ1ZSBqc1wiXSB9LFxuICAgIHsgY2Fub25pY2FsOiBcIm5leHQuanNcIiwgc3lub255bXM6IFtcIm5leHRqc1wiLCBcIm5leHQganNcIiwgXCJuZXh0XCJdIH0sXG4gICAgeyBjYW5vbmljYWw6IFwibnV4dFwiLCBzeW5vbnltczogW1wibnV4dGpzXCIsIFwibnV4dC5qc1wiXSB9LFxuICAgIHsgY2Fub25pY2FsOiBcInN2ZWx0ZVwiLCBzeW5vbnltczogW1wic3ZlbHRlanNcIiwgXCJzdmVsdGVraXRcIl0gfSxcbiAgICAvLyBCYWNrZW5kIEZyYW1ld29ya3NcbiAgICB7IGNhbm9uaWNhbDogXCJub2RlLmpzXCIsIHN5bm9ueW1zOiBbXCJub2RlanNcIiwgXCJub2RlIGpzXCIsIFwibm9kZVwiXSB9LFxuICAgIHsgY2Fub25pY2FsOiBcImV4cHJlc3NcIiwgc3lub255bXM6IFtcImV4cHJlc3Nqc1wiLCBcImV4cHJlc3MuanNcIl0gfSxcbiAgICB7IGNhbm9uaWNhbDogXCJkamFuZ29cIiwgc3lub255bXM6IFtcImRqYW5nbyByZXN0IGZyYW1ld29ya1wiLCBcImRyZlwiXSB9LFxuICAgIHsgY2Fub25pY2FsOiBcImZsYXNrXCIsIHN5bm9ueW1zOiBbXCJmbGFzayBweXRob25cIl0gfSxcbiAgICB7IGNhbm9uaWNhbDogXCJzcHJpbmdcIiwgc3lub255bXM6IFtcInNwcmluZyBib290XCIsIFwic3ByaW5nYm9vdFwiXSB9LFxuICAgIHsgY2Fub25pY2FsOiBcInJ1Ynkgb24gcmFpbHNcIiwgc3lub255bXM6IFtcInJhaWxzXCIsIFwicm9yXCJdIH0sXG4gICAgeyBjYW5vbmljYWw6IFwiZmFzdGFwaVwiLCBzeW5vbnltczogW1wiZmFzdCBhcGlcIl0gfSxcbiAgICAvLyBEYXRhYmFzZXNcbiAgICB7IGNhbm9uaWNhbDogXCJwb3N0Z3Jlc3FsXCIsIHN5bm9ueW1zOiBbXCJwb3N0Z3Jlc1wiLCBcInBzcWxcIiwgXCJwZ1wiXSB9LFxuICAgIHsgY2Fub25pY2FsOiBcIm1vbmdvZGJcIiwgc3lub255bXM6IFtcIm1vbmdvXCJdIH0sXG4gICAgeyBjYW5vbmljYWw6IFwibXlzcWxcIiwgc3lub255bXM6IFtcIm1hcmlhZGJcIl0gfSxcbiAgICB7IGNhbm9uaWNhbDogXCJkeW5hbW9kYlwiLCBzeW5vbnltczogW1wiZHluYW1vIGRiXCIsIFwiZHluYW1vXCJdIH0sXG4gICAgeyBjYW5vbmljYWw6IFwiZWxhc3RpY3NlYXJjaFwiLCBzeW5vbnltczogW1wiZWxhc3RpYyBzZWFyY2hcIiwgXCJlbGFzdGljXCIsIFwiZXNcIl0gfSxcbiAgICB7IGNhbm9uaWNhbDogXCJyZWRpc1wiLCBzeW5vbnltczogW1wicmVkaXMgY2FjaGVcIl0gfSxcbiAgICB7IGNhbm9uaWNhbDogXCJzcWxcIiwgc3lub255bXM6IFtcInN0cnVjdHVyZWQgcXVlcnkgbGFuZ3VhZ2VcIl0gfSxcbiAgICB7IGNhbm9uaWNhbDogXCJub3NxbFwiLCBzeW5vbnltczogW1wibm8gc3FsXCIsIFwibm9uLXJlbGF0aW9uYWxcIl0gfSxcbiAgICAvLyBDbG91ZCAmIEluZnJhc3RydWN0dXJlXG4gICAgeyBjYW5vbmljYWw6IFwiYXdzXCIsIHN5bm9ueW1zOiBbXCJhbWF6b24gd2ViIHNlcnZpY2VzXCIsIFwiYW1hem9uIGNsb3VkXCJdIH0sXG4gICAgeyBjYW5vbmljYWw6IFwiZ2NwXCIsIHN5bm9ueW1zOiBbXCJnb29nbGUgY2xvdWRcIiwgXCJnb29nbGUgY2xvdWQgcGxhdGZvcm1cIl0gfSxcbiAgICB7IGNhbm9uaWNhbDogXCJhenVyZVwiLCBzeW5vbnltczogW1wibWljcm9zb2Z0IGF6dXJlXCIsIFwibXMgYXp1cmVcIl0gfSxcbiAgICB7IGNhbm9uaWNhbDogXCJkb2NrZXJcIiwgc3lub255bXM6IFtcImNvbnRhaW5lcml6YXRpb25cIiwgXCJjb250YWluZXJzXCJdIH0sXG4gICAgeyBjYW5vbmljYWw6IFwia3ViZXJuZXRlc1wiLCBzeW5vbnltczogW1wiazhzXCIsIFwia3ViZVwiXSB9LFxuICAgIHsgY2Fub25pY2FsOiBcInRlcnJhZm9ybVwiLCBzeW5vbnltczogW1wiaW5mcmFzdHJ1Y3R1cmUgYXMgY29kZVwiLCBcImlhY1wiXSB9LFxuICAgIHtcbiAgICAgICAgY2Fub25pY2FsOiBcImNpL2NkXCIsXG4gICAgICAgIHN5bm9ueW1zOiBbXG4gICAgICAgICAgICBcImNpY2RcIixcbiAgICAgICAgICAgIFwiY2kgY2RcIixcbiAgICAgICAgICAgIFwiY29udGludW91cyBpbnRlZ3JhdGlvblwiLFxuICAgICAgICAgICAgXCJjb250aW51b3VzIGRlcGxveW1lbnRcIixcbiAgICAgICAgICAgIFwiY29udGludW91cyBkZWxpdmVyeVwiLFxuICAgICAgICBdLFxuICAgIH0sXG4gICAgeyBjYW5vbmljYWw6IFwiZGV2b3BzXCIsIHN5bm9ueW1zOiBbXCJkZXYgb3BzXCIsIFwic2l0ZSByZWxpYWJpbGl0eVwiLCBcInNyZVwiXSB9LFxuICAgIC8vIFRvb2xzICYgUGxhdGZvcm1zXG4gICAge1xuICAgICAgICBjYW5vbmljYWw6IFwiZ2l0XCIsXG4gICAgICAgIHN5bm9ueW1zOiBbXCJnaXRodWJcIiwgXCJnaXRsYWJcIiwgXCJiaXRidWNrZXRcIiwgXCJ2ZXJzaW9uIGNvbnRyb2xcIl0sXG4gICAgfSxcbiAgICB7IGNhbm9uaWNhbDogXCJqaXJhXCIsIHN5bm9ueW1zOiBbXCJhdGxhc3NpYW4gamlyYVwiXSB9LFxuICAgIHsgY2Fub25pY2FsOiBcImZpZ21hXCIsIHN5bm9ueW1zOiBbXCJmaWdtYSBkZXNpZ25cIl0gfSxcbiAgICB7IGNhbm9uaWNhbDogXCJ3ZWJwYWNrXCIsIHN5bm9ueW1zOiBbXCJtb2R1bGUgYnVuZGxlclwiXSB9LFxuICAgIHsgY2Fub25pY2FsOiBcImdyYXBocWxcIiwgc3lub255bXM6IFtcImdyYXBoIHFsXCIsIFwiZ3FsXCJdIH0sXG4gICAge1xuICAgICAgICBjYW5vbmljYWw6IFwicmVzdCBhcGlcIixcbiAgICAgICAgc3lub255bXM6IFtcInJlc3RmdWxcIiwgXCJyZXN0ZnVsIGFwaVwiLCBcInJlc3RcIiwgXCJhcGlcIl0sXG4gICAgfSxcbiAgICAvLyBSb2xlIFRlcm1zXG4gICAge1xuICAgICAgICBjYW5vbmljYWw6IFwiZnJvbnRlbmRcIixcbiAgICAgICAgc3lub255bXM6IFtcbiAgICAgICAgICAgIFwiZnJvbnQtZW5kXCIsXG4gICAgICAgICAgICBcImZyb250IGVuZFwiLFxuICAgICAgICAgICAgXCJjbGllbnQtc2lkZVwiLFxuICAgICAgICAgICAgXCJjbGllbnQgc2lkZVwiLFxuICAgICAgICAgICAgXCJ1aSBkZXZlbG9wbWVudFwiLFxuICAgICAgICBdLFxuICAgIH0sXG4gICAge1xuICAgICAgICBjYW5vbmljYWw6IFwiYmFja2VuZFwiLFxuICAgICAgICBzeW5vbnltczogW1wiYmFjay1lbmRcIiwgXCJiYWNrIGVuZFwiLCBcInNlcnZlci1zaWRlXCIsIFwic2VydmVyIHNpZGVcIl0sXG4gICAgfSxcbiAgICB7IGNhbm9uaWNhbDogXCJmdWxsc3RhY2tcIiwgc3lub255bXM6IFtcImZ1bGwtc3RhY2tcIiwgXCJmdWxsIHN0YWNrXCJdIH0sXG4gICAge1xuICAgICAgICBjYW5vbmljYWw6IFwic29mdHdhcmUgZW5naW5lZXJcIixcbiAgICAgICAgc3lub255bXM6IFtcInNvZnR3YXJlIGRldmVsb3BlclwiLCBcInN3ZVwiLCBcImRldmVsb3BlclwiLCBcInByb2dyYW1tZXJcIiwgXCJjb2RlclwiXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgY2Fub25pY2FsOiBcImRhdGEgc2NpZW50aXN0XCIsXG4gICAgICAgIHN5bm9ueW1zOiBbXCJkYXRhIHNjaWVuY2VcIiwgXCJtbCBlbmdpbmVlclwiLCBcIm1hY2hpbmUgbGVhcm5pbmcgZW5naW5lZXJcIl0sXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGNhbm9uaWNhbDogXCJkYXRhIGVuZ2luZWVyXCIsXG4gICAgICAgIHN5bm9ueW1zOiBbXCJkYXRhIGVuZ2luZWVyaW5nXCIsIFwiZXRsIGRldmVsb3BlclwiXSxcbiAgICB9LFxuICAgIHsgY2Fub25pY2FsOiBcInByb2R1Y3QgbWFuYWdlclwiLCBzeW5vbnltczogW1wicG1cIiwgXCJwcm9kdWN0IG93bmVyXCIsIFwicG9cIl0gfSxcbiAgICB7XG4gICAgICAgIGNhbm9uaWNhbDogXCJxYSBlbmdpbmVlclwiLFxuICAgICAgICBzeW5vbnltczogW1wicXVhbGl0eSBhc3N1cmFuY2VcIiwgXCJxYVwiLCBcInRlc3QgZW5naW5lZXJcIiwgXCJzZGV0XCJdLFxuICAgIH0sXG4gICAge1xuICAgICAgICBjYW5vbmljYWw6IFwidXggZGVzaWduZXJcIixcbiAgICAgICAgc3lub255bXM6IFtcInV4XCIsIFwidXNlciBleHBlcmllbmNlXCIsIFwidWkvdXhcIiwgXCJ1aSB1eFwiXSxcbiAgICB9LFxuICAgIC8vIE1ldGhvZG9sb2dpZXNcbiAgICB7IGNhbm9uaWNhbDogXCJhZ2lsZVwiLCBzeW5vbnltczogW1wic2NydW1cIiwgXCJrYW5iYW5cIiwgXCJzcHJpbnRcIiwgXCJzcHJpbnRzXCJdIH0sXG4gICAge1xuICAgICAgICBjYW5vbmljYWw6IFwidGRkXCIsXG4gICAgICAgIHN5bm9ueW1zOiBbXCJ0ZXN0IGRyaXZlbiBkZXZlbG9wbWVudFwiLCBcInRlc3QtZHJpdmVuIGRldmVsb3BtZW50XCJdLFxuICAgIH0sXG4gICAge1xuICAgICAgICBjYW5vbmljYWw6IFwiYmRkXCIsXG4gICAgICAgIHN5bm9ueW1zOiBbXCJiZWhhdmlvciBkcml2ZW4gZGV2ZWxvcG1lbnRcIiwgXCJiZWhhdmlvci1kcml2ZW4gZGV2ZWxvcG1lbnRcIl0sXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGNhbm9uaWNhbDogXCJtaWNyb3NlcnZpY2VzXCIsXG4gICAgICAgIHN5bm9ueW1zOiBbXCJtaWNybyBzZXJ2aWNlc1wiLCBcIm1pY3JvLXNlcnZpY2VzXCIsIFwic2VydmljZS1vcmllbnRlZFwiXSxcbiAgICB9LFxuICAgIC8vIFNvZnQgU2tpbGxzXG4gICAge1xuICAgICAgICBjYW5vbmljYWw6IFwibGVhZGVyc2hpcFwiLFxuICAgICAgICBzeW5vbnltczogW1xuICAgICAgICAgICAgXCJsZWRcIixcbiAgICAgICAgICAgIFwibWFuYWdlZFwiLFxuICAgICAgICAgICAgXCJkaXJlY3RlZFwiLFxuICAgICAgICAgICAgXCJzdXBlcnZpc2VkXCIsXG4gICAgICAgICAgICBcIm1lbnRvcmVkXCIsXG4gICAgICAgICAgICBcInRlYW0gbGVhZFwiLFxuICAgICAgICBdLFxuICAgIH0sXG4gICAge1xuICAgICAgICBjYW5vbmljYWw6IFwiY29tbXVuaWNhdGlvblwiLFxuICAgICAgICBzeW5vbnltczogW1wiY29tbXVuaWNhdGVkXCIsIFwicHJlc2VudGVkXCIsIFwicHVibGljIHNwZWFraW5nXCIsIFwiaW50ZXJwZXJzb25hbFwiXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgY2Fub25pY2FsOiBcImNvbGxhYm9yYXRpb25cIixcbiAgICAgICAgc3lub255bXM6IFtcbiAgICAgICAgICAgIFwiY29sbGFib3JhdGVkXCIsXG4gICAgICAgICAgICBcInRlYW13b3JrXCIsXG4gICAgICAgICAgICBcImNyb3NzLWZ1bmN0aW9uYWxcIixcbiAgICAgICAgICAgIFwiY3Jvc3MgZnVuY3Rpb25hbFwiLFxuICAgICAgICBdLFxuICAgIH0sXG4gICAge1xuICAgICAgICBjYW5vbmljYWw6IFwicHJvYmxlbSBzb2x2aW5nXCIsXG4gICAgICAgIHN5bm9ueW1zOiBbXCJwcm9ibGVtLXNvbHZpbmdcIiwgXCJ0cm91Ymxlc2hvb3RpbmdcIiwgXCJkZWJ1Z2dpbmdcIiwgXCJhbmFseXRpY2FsXCJdLFxuICAgIH0sXG4gICAge1xuICAgICAgICBjYW5vbmljYWw6IFwicHJvamVjdCBtYW5hZ2VtZW50XCIsXG4gICAgICAgIHN5bm9ueW1zOiBbXG4gICAgICAgICAgICBcInByb2plY3QtbWFuYWdlbWVudFwiLFxuICAgICAgICAgICAgXCJwcm9ncmFtIG1hbmFnZW1lbnRcIixcbiAgICAgICAgICAgIFwic3Rha2Vob2xkZXIgbWFuYWdlbWVudFwiLFxuICAgICAgICBdLFxuICAgIH0sXG4gICAge1xuICAgICAgICBjYW5vbmljYWw6IFwidGltZSBtYW5hZ2VtZW50XCIsXG4gICAgICAgIHN5bm9ueW1zOiBbXCJ0aW1lLW1hbmFnZW1lbnRcIiwgXCJwcmlvcml0aXphdGlvblwiLCBcIm9yZ2FuaXphdGlvblwiXSxcbiAgICB9LFxuICAgIHsgY2Fub25pY2FsOiBcIm1lbnRvcmluZ1wiLCBzeW5vbnltczogW1wiY29hY2hpbmdcIiwgXCJ0cmFpbmluZ1wiLCBcIm9uYm9hcmRpbmdcIl0gfSxcbiAgICAvLyBEYXRhICYgTUxcbiAgICB7XG4gICAgICAgIGNhbm9uaWNhbDogXCJtYWNoaW5lIGxlYXJuaW5nXCIsXG4gICAgICAgIHN5bm9ueW1zOiBbXCJtbFwiLCBcImRlZXAgbGVhcm5pbmdcIiwgXCJkbFwiLCBcImFpXCIsIFwiYXJ0aWZpY2lhbCBpbnRlbGxpZ2VuY2VcIl0sXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGNhbm9uaWNhbDogXCJubHBcIixcbiAgICAgICAgc3lub255bXM6IFtcIm5hdHVyYWwgbGFuZ3VhZ2UgcHJvY2Vzc2luZ1wiLCBcInRleHQgcHJvY2Vzc2luZ1wiXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgY2Fub25pY2FsOiBcImNvbXB1dGVyIHZpc2lvblwiLFxuICAgICAgICBzeW5vbnltczogW1wiY3ZcIiwgXCJpbWFnZSByZWNvZ25pdGlvblwiLCBcImltYWdlIHByb2Nlc3NpbmdcIl0sXG4gICAgfSxcbiAgICB7IGNhbm9uaWNhbDogXCJ0ZW5zb3JmbG93XCIsIHN5bm9ueW1zOiBbXCJrZXJhc1wiXSB9LFxuICAgIHsgY2Fub25pY2FsOiBcInB5dG9yY2hcIiwgc3lub255bXM6IFtcInRvcmNoXCJdIH0sXG4gICAgLy8gVGVzdGluZ1xuICAgIHtcbiAgICAgICAgY2Fub25pY2FsOiBcInVuaXQgdGVzdGluZ1wiLFxuICAgICAgICBzeW5vbnltczogW1widW5pdCB0ZXN0c1wiLCBcImplc3RcIiwgXCJtb2NoYVwiLCBcInZpdGVzdFwiLCBcInB5dGVzdFwiXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgY2Fub25pY2FsOiBcImludGVncmF0aW9uIHRlc3RpbmdcIixcbiAgICAgICAgc3lub255bXM6IFtcbiAgICAgICAgICAgIFwiaW50ZWdyYXRpb24gdGVzdHNcIixcbiAgICAgICAgICAgIFwiZTJlIHRlc3RpbmdcIixcbiAgICAgICAgICAgIFwiZW5kLXRvLWVuZCB0ZXN0aW5nXCIsXG4gICAgICAgICAgICBcImVuZCB0byBlbmRcIixcbiAgICAgICAgXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgY2Fub25pY2FsOiBcImF1dG9tYXRpb24gdGVzdGluZ1wiLFxuICAgICAgICBzeW5vbnltczogW1xuICAgICAgICAgICAgXCJ0ZXN0IGF1dG9tYXRpb25cIixcbiAgICAgICAgICAgIFwiYXV0b21hdGVkIHRlc3RpbmdcIixcbiAgICAgICAgICAgIFwic2VsZW5pdW1cIixcbiAgICAgICAgICAgIFwiY3lwcmVzc1wiLFxuICAgICAgICAgICAgXCJwbGF5d3JpZ2h0XCIsXG4gICAgICAgIF0sXG4gICAgfSxcbiAgICAvLyBTZWN1cml0eVxuICAgIHtcbiAgICAgICAgY2Fub25pY2FsOiBcImN5YmVyc2VjdXJpdHlcIixcbiAgICAgICAgc3lub255bXM6IFtcImN5YmVyIHNlY3VyaXR5XCIsIFwiaW5mb3JtYXRpb24gc2VjdXJpdHlcIiwgXCJpbmZvc2VjXCJdLFxuICAgIH0sXG4gICAge1xuICAgICAgICBjYW5vbmljYWw6IFwiYXV0aGVudGljYXRpb25cIixcbiAgICAgICAgc3lub255bXM6IFtcImF1dGhcIiwgXCJvYXV0aFwiLCBcInNzb1wiLCBcInNpbmdsZSBzaWduLW9uXCJdLFxuICAgIH0sXG4gICAgLy8gTW9iaWxlXG4gICAgeyBjYW5vbmljYWw6IFwiaW9zXCIsIHN5bm9ueW1zOiBbXCJzd2lmdFwiLCBcImFwcGxlIGRldmVsb3BtZW50XCJdIH0sXG4gICAgeyBjYW5vbmljYWw6IFwiYW5kcm9pZFwiLCBzeW5vbnltczogW1wiYW5kcm9pZCBkZXZlbG9wbWVudFwiLCBcImtvdGxpbiBhbmRyb2lkXCJdIH0sXG4gICAgeyBjYW5vbmljYWw6IFwicmVhY3QgbmF0aXZlXCIsIHN5bm9ueW1zOiBbXCJyZWFjdC1uYXRpdmVcIiwgXCJyblwiXSB9LFxuICAgIHsgY2Fub25pY2FsOiBcImZsdXR0ZXJcIiwgc3lub255bXM6IFtcImRhcnRcIl0gfSxcbiAgICAvLyBCdXNpbmVzcyAmIEFuYWx5dGljc1xuICAgIHtcbiAgICAgICAgY2Fub25pY2FsOiBcImJ1c2luZXNzIGludGVsbGlnZW5jZVwiLFxuICAgICAgICBzeW5vbnltczogW1wiYmlcIiwgXCJ0YWJsZWF1XCIsIFwicG93ZXIgYmlcIiwgXCJsb29rZXJcIl0sXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGNhbm9uaWNhbDogXCJkYXRhIGFuYWx5c2lzXCIsXG4gICAgICAgIHN5bm9ueW1zOiBbXCJkYXRhIGFuYWx5dGljc1wiLCBcImRhdGEgYW5hbHlzdFwiLCBcImFuYWx5dGljc1wiXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgY2Fub25pY2FsOiBcImV0bFwiLFxuICAgICAgICBzeW5vbnltczogW1wiZXh0cmFjdCB0cmFuc2Zvcm0gbG9hZFwiLCBcImRhdGEgcGlwZWxpbmVcIiwgXCJkYXRhIHBpcGVsaW5lc1wiXSxcbiAgICB9LFxuXTtcbi8qKlxuICogQnVpbGRzIGEgbG9va3VwIG1hcCBmcm9tIGFueSB0ZXJtIChjYW5vbmljYWwgb3Igc3lub255bSkgdG9cbiAqIHRoZSBzZXQgb2YgYWxsIHRlcm1zIGluIHRoZSBzYW1lIGdyb3VwIChpbmNsdWRpbmcgdGhlIGNhbm9uaWNhbCBmb3JtKS5cbiAqIEFsbCBrZXlzIGFuZCB2YWx1ZXMgYXJlIGxvd2VyY2FzZS5cbiAqL1xuZnVuY3Rpb24gYnVpbGRTeW5vbnltTG9va3VwKCkge1xuICAgIGNvbnN0IGxvb2t1cCA9IG5ldyBNYXAoKTtcbiAgICBmb3IgKGNvbnN0IGdyb3VwIG9mIFNZTk9OWU1fR1JPVVBTKSB7XG4gICAgICAgIGNvbnN0IGFsbFRlcm1zID0gW2dyb3VwLmNhbm9uaWNhbCwgLi4uZ3JvdXAuc3lub255bXNdO1xuICAgICAgICBjb25zdCB0ZXJtU2V0ID0gbmV3IFNldChhbGxUZXJtcyk7XG4gICAgICAgIGZvciAoY29uc3QgdGVybSBvZiBhbGxUZXJtcykge1xuICAgICAgICAgICAgY29uc3QgZXhpc3RpbmcgPSBsb29rdXAuZ2V0KHRlcm0pO1xuICAgICAgICAgICAgaWYgKGV4aXN0aW5nKSB7XG4gICAgICAgICAgICAgICAgLy8gTWVyZ2Ugc2V0cyBpZiB0ZXJtIGFwcGVhcnMgaW4gbXVsdGlwbGUgZ3JvdXBzXG4gICAgICAgICAgICAgICAgdGVybVNldC5mb3JFYWNoKCh0KSA9PiBleGlzdGluZy5hZGQodCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgbG9va3VwLnNldCh0ZXJtLCBuZXcgU2V0KHRlcm1TZXQpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbG9va3VwO1xufVxuY29uc3Qgc3lub255bUxvb2t1cCA9IGJ1aWxkU3lub255bUxvb2t1cCgpO1xuLyoqXG4gKiBSZXR1cm5zIGFsbCBzeW5vbnltcyBmb3IgYSBnaXZlbiB0ZXJtIChpbmNsdWRpbmcgdGhlIHRlcm0gaXRzZWxmKS5cbiAqIFJldHVybnMgYW4gZW1wdHkgYXJyYXkgaWYgbm8gc3lub255bXMgYXJlIGZvdW5kLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0U3lub255bXModGVybSkge1xuICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSB0ZXJtLnRvTG93ZXJDYXNlKCkudHJpbSgpO1xuICAgIGNvbnN0IGdyb3VwID0gc3lub255bUxvb2t1cC5nZXQobm9ybWFsaXplZCk7XG4gICAgaWYgKCFncm91cClcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIHJldHVybiBBcnJheS5mcm9tKGdyb3VwKTtcbn1cbi8qKlxuICogQ2hlY2tzIGlmIHR3byB0ZXJtcyBhcmUgc3lub255bXMgb2YgZWFjaCBvdGhlci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFyZVN5bm9ueW1zKHRlcm1BLCB0ZXJtQikge1xuICAgIGNvbnN0IG5vcm1hbGl6ZWRBID0gdGVybUEudG9Mb3dlckNhc2UoKS50cmltKCk7XG4gICAgY29uc3Qgbm9ybWFsaXplZEIgPSB0ZXJtQi50b0xvd2VyQ2FzZSgpLnRyaW0oKTtcbiAgICBpZiAobm9ybWFsaXplZEEgPT09IG5vcm1hbGl6ZWRCKVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICBjb25zdCBncm91cCA9IHN5bm9ueW1Mb29rdXAuZ2V0KG5vcm1hbGl6ZWRBKTtcbiAgICByZXR1cm4gZ3JvdXAgPyBncm91cC5oYXMobm9ybWFsaXplZEIpIDogZmFsc2U7XG59XG4vKiogV2VpZ2h0IGFwcGxpZWQgdG8gc3lub255bSBtYXRjaGVzICh2cyAxLjAgZm9yIGV4YWN0IG1hdGNoZXMpICovXG5leHBvcnQgY29uc3QgU1lOT05ZTV9NQVRDSF9XRUlHSFQgPSAwLjg7XG4iLCJpbXBvcnQgeyBnZXRTeW5vbnltcywgU1lOT05ZTV9NQVRDSF9XRUlHSFQgfSBmcm9tIFwiLi9zeW5vbnltc1wiO1xuaW1wb3J0IHsgU1VCX1NDT1JFX01BWF9QT0lOVFMgfSBmcm9tIFwiLi9jb25zdGFudHNcIjtcbmltcG9ydCB7IGNvbnRhaW5zV29yZCwgY291bnRXb3JkT2NjdXJyZW5jZXMsIGdldFJlc3VtZVRleHQsIG5vcm1hbGl6ZVRleHQsIH0gZnJvbSBcIi4vdGV4dFwiO1xuY29uc3QgU1RPUF9XT1JEUyA9IG5ldyBTZXQoW1xuICAgIFwiYVwiLFxuICAgIFwiYW5cIixcbiAgICBcImFuZFwiLFxuICAgIFwiYXJlXCIsXG4gICAgXCJhc1wiLFxuICAgIFwiYXRcIixcbiAgICBcImJlXCIsXG4gICAgXCJieVwiLFxuICAgIFwiZm9yXCIsXG4gICAgXCJmcm9tXCIsXG4gICAgXCJpblwiLFxuICAgIFwib2ZcIixcbiAgICBcIm9uXCIsXG4gICAgXCJvclwiLFxuICAgIFwib3VyXCIsXG4gICAgXCJ0aGVcIixcbiAgICBcInRvXCIsXG4gICAgXCJ3ZVwiLFxuICAgIFwid2l0aFwiLFxuICAgIFwieW91XCIsXG4gICAgXCJ5b3VyXCIsXG5dKTtcbmZ1bmN0aW9uIHRva2VuaXplS2V5d29yZHModGV4dCkge1xuICAgIHJldHVybiBub3JtYWxpemVUZXh0KHRleHQpXG4gICAgICAgIC5zcGxpdCgvXFxzKy8pXG4gICAgICAgIC5tYXAoKHRva2VuKSA9PiB0b2tlbi50cmltKCkpXG4gICAgICAgIC5maWx0ZXIoKHRva2VuKSA9PiB0b2tlbi5sZW5ndGggPj0gMyAmJiAhU1RPUF9XT1JEUy5oYXModG9rZW4pKTtcbn1cbmZ1bmN0aW9uIHRvcFRva2Vucyh0ZXh0LCBsaW1pdCkge1xuICAgIGNvbnN0IGNvdW50cyA9IG5ldyBNYXAoKTtcbiAgICBmb3IgKGNvbnN0IHRva2VuIG9mIHRva2VuaXplS2V5d29yZHModGV4dCkpIHtcbiAgICAgICAgY291bnRzLnNldCh0b2tlbiwgKGNvdW50cy5nZXQodG9rZW4pID8/IDApICsgMSk7XG4gICAgfVxuICAgIHJldHVybiBBcnJheS5mcm9tKGNvdW50cy5lbnRyaWVzKCkpXG4gICAgICAgIC5zb3J0KChhLCBiKSA9PiBiWzFdIC0gYVsxXSB8fCBhWzBdLmxvY2FsZUNvbXBhcmUoYlswXSkpXG4gICAgICAgIC5zbGljZSgwLCBsaW1pdClcbiAgICAgICAgLm1hcCgoW3Rva2VuXSkgPT4gdG9rZW4pO1xufVxuZnVuY3Rpb24gYnVpbGRLZXl3b3JkU2V0KGpvYikge1xuICAgIGNvbnN0IGtleXdvcmRzID0gW1xuICAgICAgICAuLi5qb2Iua2V5d29yZHMsXG4gICAgICAgIC4uLmpvYi5yZXF1aXJlbWVudHMuZmxhdE1hcCh0b2tlbml6ZUtleXdvcmRzKSxcbiAgICAgICAgLi4udG9wVG9rZW5zKGpvYi5kZXNjcmlwdGlvbiwgMTApLFxuICAgIF07XG4gICAgY29uc3Qgbm9ybWFsaXplZCA9IGtleXdvcmRzXG4gICAgICAgIC5tYXAoKGtleXdvcmQpID0+IG5vcm1hbGl6ZVRleHQoa2V5d29yZCkpXG4gICAgICAgIC5maWx0ZXIoKGtleXdvcmQpID0+IGtleXdvcmQubGVuZ3RoID49IDIgJiYgIVNUT1BfV09SRFMuaGFzKGtleXdvcmQpKTtcbiAgICByZXR1cm4gQXJyYXkuZnJvbShuZXcgU2V0KG5vcm1hbGl6ZWQpKS5zbGljZSgwLCAyNCk7XG59XG5leHBvcnQgZnVuY3Rpb24gc2NvcmVLZXl3b3JkTWF0Y2goaW5wdXQpIHtcbiAgICBpZiAoIWlucHV0LmpvYikge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAga2V5OiBcImtleXdvcmRNYXRjaFwiLFxuICAgICAgICAgICAgbGFiZWw6IFwiS2V5d29yZCBtYXRjaFwiLFxuICAgICAgICAgICAgZWFybmVkOiAxOCxcbiAgICAgICAgICAgIG1heFBvaW50czogU1VCX1NDT1JFX01BWF9QT0lOVFMua2V5d29yZE1hdGNoLFxuICAgICAgICAgICAgbm90ZXM6IFtcIk5vIGpvYiBkZXNjcmlwdGlvbiBzdXBwbGllZDsgbmV1dHJhbCBiYXNlbGluZS5cIl0sXG4gICAgICAgICAgICBldmlkZW5jZTogW1wiTm8gam9iIGRlc2NyaXB0aW9uIHN1cHBsaWVkLlwiXSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgY29uc3Qga2V5d29yZHMgPSBidWlsZEtleXdvcmRTZXQoaW5wdXQuam9iKTtcbiAgICBpZiAoa2V5d29yZHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBrZXk6IFwia2V5d29yZE1hdGNoXCIsXG4gICAgICAgICAgICBsYWJlbDogXCJLZXl3b3JkIG1hdGNoXCIsXG4gICAgICAgICAgICBlYXJuZWQ6IDE4LFxuICAgICAgICAgICAgbWF4UG9pbnRzOiBTVUJfU0NPUkVfTUFYX1BPSU5UUy5rZXl3b3JkTWF0Y2gsXG4gICAgICAgICAgICBub3RlczogW1wiSm9iIGRlc2NyaXB0aW9uIGhhcyBubyB1c2FibGUga2V5d29yZHM7IG5ldXRyYWwgYmFzZWxpbmUuXCJdLFxuICAgICAgICAgICAgZXZpZGVuY2U6IFtcIjAga2V5d29yZHMgYXZhaWxhYmxlLlwiXSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgY29uc3QgcmVzdW1lVGV4dCA9IG5vcm1hbGl6ZVRleHQoZ2V0UmVzdW1lVGV4dChpbnB1dC5wcm9maWxlLCBpbnB1dC5yYXdUZXh0KSk7XG4gICAgbGV0IHdlaWdodGVkSGl0cyA9IDA7XG4gICAgbGV0IGV4YWN0SGl0cyA9IDA7XG4gICAgbGV0IHN0dWZmaW5nID0gZmFsc2U7XG4gICAgZm9yIChjb25zdCBrZXl3b3JkIG9mIGtleXdvcmRzKSB7XG4gICAgICAgIGNvbnN0IGZyZXF1ZW5jeSA9IGNvdW50V29yZE9jY3VycmVuY2VzKHJlc3VtZVRleHQsIGtleXdvcmQpO1xuICAgICAgICBpZiAoZnJlcXVlbmN5ID4gMTApXG4gICAgICAgICAgICBzdHVmZmluZyA9IHRydWU7XG4gICAgICAgIGlmIChmcmVxdWVuY3kgPiAwKSB7XG4gICAgICAgICAgICB3ZWlnaHRlZEhpdHMgKz0gMTtcbiAgICAgICAgICAgIGV4YWN0SGl0cyArPSAxO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgc3lub255bUhpdCA9IGdldFN5bm9ueW1zKGtleXdvcmQpLnNvbWUoKHN5bm9ueW0pID0+IHN5bm9ueW0gIT09IGtleXdvcmQgJiYgY29udGFpbnNXb3JkKHJlc3VtZVRleHQsIHN5bm9ueW0pKTtcbiAgICAgICAgaWYgKHN5bm9ueW1IaXQpXG4gICAgICAgICAgICB3ZWlnaHRlZEhpdHMgKz0gU1lOT05ZTV9NQVRDSF9XRUlHSFQ7XG4gICAgfVxuICAgIGNvbnN0IHJhd0Vhcm5lZCA9IE1hdGgucm91bmQoKHdlaWdodGVkSGl0cyAvIGtleXdvcmRzLmxlbmd0aCkgKiBTVUJfU0NPUkVfTUFYX1BPSU5UUy5rZXl3b3JkTWF0Y2gpO1xuICAgIGNvbnN0IGVhcm5lZCA9IE1hdGgubWF4KDAsIHJhd0Vhcm5lZCAtIChzdHVmZmluZyA/IDIgOiAwKSk7XG4gICAgY29uc3Qgbm90ZXMgPSBleGFjdEhpdHMgPT09IGtleXdvcmRzLmxlbmd0aFxuICAgICAgICA/IFtdXG4gICAgICAgIDogW1wiQWRkIG5hdHVyYWwgbWVudGlvbnMgb2YgbWlzc2luZyB0YXJnZXQgam9iIGtleXdvcmRzLlwiXTtcbiAgICBpZiAoc3R1ZmZpbmcpXG4gICAgICAgIG5vdGVzLnB1c2goXCJLZXl3b3JkIHN0dWZmaW5nIGRldGVjdGVkOyByZXBlYXRlZCB0ZXJtcyB0b28gb2Z0ZW4uXCIpO1xuICAgIHJldHVybiB7XG4gICAgICAgIGtleTogXCJrZXl3b3JkTWF0Y2hcIixcbiAgICAgICAgbGFiZWw6IFwiS2V5d29yZCBtYXRjaFwiLFxuICAgICAgICBlYXJuZWQsXG4gICAgICAgIG1heFBvaW50czogU1VCX1NDT1JFX01BWF9QT0lOVFMua2V5d29yZE1hdGNoLFxuICAgICAgICBub3RlcyxcbiAgICAgICAgZXZpZGVuY2U6IFtcbiAgICAgICAgICAgIGAke2V4YWN0SGl0c30vJHtrZXl3b3Jkcy5sZW5ndGh9IGtleXdvcmRzIG1hdGNoZWRgLFxuICAgICAgICAgICAgYCR7d2VpZ2h0ZWRIaXRzLnRvRml4ZWQoMSl9LyR7a2V5d29yZHMubGVuZ3RofSB3ZWlnaHRlZCBrZXl3b3JkIGhpdHNgLFxuICAgICAgICBdLFxuICAgIH07XG59XG4iLCJpbXBvcnQgeyBTVUJfU0NPUkVfTUFYX1BPSU5UUyB9IGZyb20gXCIuL2NvbnN0YW50c1wiO1xuaW1wb3J0IHsgZ2V0UmVzdW1lVGV4dCwgd29yZENvdW50IH0gZnJvbSBcIi4vdGV4dFwiO1xuZnVuY3Rpb24gcG9pbnRzRm9yV29yZENvdW50KGNvdW50KSB7XG4gICAgaWYgKGNvdW50ID49IDQwMCAmJiBjb3VudCA8PSA3MDApXG4gICAgICAgIHJldHVybiAxMDtcbiAgICBpZiAoKGNvdW50ID49IDMwMCAmJiBjb3VudCA8PSAzOTkpIHx8IChjb3VudCA+PSA3MDEgJiYgY291bnQgPD0gOTAwKSlcbiAgICAgICAgcmV0dXJuIDc7XG4gICAgaWYgKChjb3VudCA+PSAyMDAgJiYgY291bnQgPD0gMjk5KSB8fCAoY291bnQgPj0gOTAxICYmIGNvdW50IDw9IDExMDApKVxuICAgICAgICByZXR1cm4gNDtcbiAgICBpZiAoKGNvdW50ID49IDE1MCAmJiBjb3VudCA8PSAxOTkpIHx8IChjb3VudCA+PSAxMTAxICYmIGNvdW50IDw9IDE0MDApKSB7XG4gICAgICAgIHJldHVybiAyO1xuICAgIH1cbiAgICByZXR1cm4gMDtcbn1cbmV4cG9ydCBmdW5jdGlvbiBzY29yZUxlbmd0aChpbnB1dCkge1xuICAgIGNvbnN0IGNvdW50ID0gd29yZENvdW50KGdldFJlc3VtZVRleHQoaW5wdXQucHJvZmlsZSwgaW5wdXQucmF3VGV4dCkpO1xuICAgIGNvbnN0IGVhcm5lZCA9IHBvaW50c0ZvcldvcmRDb3VudChjb3VudCk7XG4gICAgY29uc3Qgbm90ZXMgPSBlYXJuZWQgPT09IFNVQl9TQ09SRV9NQVhfUE9JTlRTLmxlbmd0aFxuICAgICAgICA/IFtdXG4gICAgICAgIDogW1wiUmVzdW1lIGxlbmd0aCBpcyBvdXRzaWRlIHRoZSA0MDAtNzAwIHdvcmQgdGFyZ2V0IGJhbmQuXCJdO1xuICAgIHJldHVybiB7XG4gICAgICAgIGtleTogXCJsZW5ndGhcIixcbiAgICAgICAgbGFiZWw6IFwiTGVuZ3RoXCIsXG4gICAgICAgIGVhcm5lZCxcbiAgICAgICAgbWF4UG9pbnRzOiBTVUJfU0NPUkVfTUFYX1BPSU5UUy5sZW5ndGgsXG4gICAgICAgIG5vdGVzLFxuICAgICAgICBldmlkZW5jZTogW2Ake2NvdW50fSB3b3Jkc2BdLFxuICAgIH07XG59XG4iLCJpbXBvcnQgeyBRVUFOVElGSUVEX1JFR0VYLCBTVUJfU0NPUkVfTUFYX1BPSU5UUyB9IGZyb20gXCIuL2NvbnN0YW50c1wiO1xuaW1wb3J0IHsgZ2V0SGlnaGxpZ2h0cyB9IGZyb20gXCIuL3RleHRcIjtcbmZ1bmN0aW9uIHBvaW50c0ZvclF1YW50aWZpZWRSZXN1bHRzKGNvdW50KSB7XG4gICAgaWYgKGNvdW50ID09PSAwKVxuICAgICAgICByZXR1cm4gMDtcbiAgICBpZiAoY291bnQgPT09IDEpXG4gICAgICAgIHJldHVybiA2O1xuICAgIGlmIChjb3VudCA9PT0gMilcbiAgICAgICAgcmV0dXJuIDEyO1xuICAgIGlmIChjb3VudCA8PSA0KVxuICAgICAgICByZXR1cm4gMTY7XG4gICAgcmV0dXJuIDIwO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHNjb3JlUXVhbnRpZmllZEFjaGlldmVtZW50cyhpbnB1dCkge1xuICAgIGNvbnN0IHRleHQgPSBnZXRIaWdobGlnaHRzKGlucHV0LnByb2ZpbGUpLmpvaW4oXCJcXG5cIik7XG4gICAgY29uc3QgbWF0Y2hlcyA9IEFycmF5LmZyb20odGV4dC5tYXRjaEFsbChRVUFOVElGSUVEX1JFR0VYKSwgKG1hdGNoKSA9PiBtYXRjaFswXSk7XG4gICAgY29uc3Qgbm90ZXMgPSBtYXRjaGVzLmxlbmd0aCA9PT0gMFxuICAgICAgICA/IFtcIkFkZCBtZXRyaWNzIHN1Y2ggYXMgcGVyY2VudGFnZXMsIHZvbHVtZSwgdGVhbSBzaXplLCBvciByZXZlbnVlLlwiXVxuICAgICAgICA6IFtdO1xuICAgIHJldHVybiB7XG4gICAgICAgIGtleTogXCJxdWFudGlmaWVkQWNoaWV2ZW1lbnRzXCIsXG4gICAgICAgIGxhYmVsOiBcIlF1YW50aWZpZWQgYWNoaWV2ZW1lbnRzXCIsXG4gICAgICAgIGVhcm5lZDogcG9pbnRzRm9yUXVhbnRpZmllZFJlc3VsdHMobWF0Y2hlcy5sZW5ndGgpLFxuICAgICAgICBtYXhQb2ludHM6IFNVQl9TQ09SRV9NQVhfUE9JTlRTLnF1YW50aWZpZWRBY2hpZXZlbWVudHMsXG4gICAgICAgIG5vdGVzLFxuICAgICAgICBldmlkZW5jZTogW1xuICAgICAgICAgICAgYCR7bWF0Y2hlcy5sZW5ndGh9IHF1YW50aWZpZWQgcmVzdWx0KHMpYCxcbiAgICAgICAgICAgIC4uLm1hdGNoZXMuc2xpY2UoMCwgMyksXG4gICAgICAgIF0sXG4gICAgfTtcbn1cbiIsImltcG9ydCB7IFNVQl9TQ09SRV9NQVhfUE9JTlRTIH0gZnJvbSBcIi4vY29uc3RhbnRzXCI7XG5leHBvcnQgZnVuY3Rpb24gc2NvcmVTZWN0aW9uQ29tcGxldGVuZXNzKGlucHV0KSB7XG4gICAgY29uc3QgeyBwcm9maWxlIH0gPSBpbnB1dDtcbiAgICBjb25zdCBub3RlcyA9IFtdO1xuICAgIGNvbnN0IGV2aWRlbmNlID0gW107XG4gICAgbGV0IGVhcm5lZCA9IDA7XG4gICAgbGV0IGNvbXBsZXRlU2VjdGlvbnMgPSAwO1xuICAgIGlmIChwcm9maWxlLmNvbnRhY3QubmFtZT8udHJpbSgpKSB7XG4gICAgICAgIGVhcm5lZCArPSAxO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgbm90ZXMucHVzaChcIk1pc3NpbmcgY29udGFjdCBuYW1lLlwiKTtcbiAgICB9XG4gICAgaWYgKHByb2ZpbGUuY29udGFjdC5lbWFpbD8udHJpbSgpKSB7XG4gICAgICAgIGVhcm5lZCArPSAxO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgbm90ZXMucHVzaChcIk1pc3NpbmcgY29udGFjdCBlbWFpbC5cIik7XG4gICAgfVxuICAgIGNvbnN0IHN1bW1hcnlMZW5ndGggPSBwcm9maWxlLnN1bW1hcnk/LnRyaW0oKS5sZW5ndGggPz8gMDtcbiAgICBpZiAoc3VtbWFyeUxlbmd0aCA+PSA1MCAmJiBzdW1tYXJ5TGVuZ3RoIDw9IDUwMCkge1xuICAgICAgICBlYXJuZWQgKz0gMTtcbiAgICAgICAgY29tcGxldGVTZWN0aW9ucyArPSAxO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgbm90ZXMucHVzaChcIlN1bW1hcnkgc2hvdWxkIGJlIGJldHdlZW4gNTAgYW5kIDUwMCBjaGFyYWN0ZXJzLlwiKTtcbiAgICB9XG4gICAgY29uc3QgaGFzRXhwZXJpZW5jZSA9IHByb2ZpbGUuZXhwZXJpZW5jZXMuc29tZSgoZXhwZXJpZW5jZSkgPT4gZXhwZXJpZW5jZS50aXRsZS50cmltKCkgJiZcbiAgICAgICAgZXhwZXJpZW5jZS5jb21wYW55LnRyaW0oKSAmJlxuICAgICAgICBleHBlcmllbmNlLnN0YXJ0RGF0ZS50cmltKCkpO1xuICAgIGlmIChoYXNFeHBlcmllbmNlKSB7XG4gICAgICAgIGVhcm5lZCArPSAyO1xuICAgICAgICBjb21wbGV0ZVNlY3Rpb25zICs9IDE7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBub3Rlcy5wdXNoKFwiQWRkIGF0IGxlYXN0IG9uZSByb2xlIHdpdGggdGl0bGUsIGNvbXBhbnksIGFuZCBzdGFydCBkYXRlLlwiKTtcbiAgICB9XG4gICAgaWYgKHByb2ZpbGUuZWR1Y2F0aW9uLmxlbmd0aCA+IDApIHtcbiAgICAgICAgZWFybmVkICs9IDE7XG4gICAgICAgIGNvbXBsZXRlU2VjdGlvbnMgKz0gMTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIG5vdGVzLnB1c2goXCJBZGQgYXQgbGVhc3Qgb25lIGVkdWNhdGlvbiBlbnRyeS5cIik7XG4gICAgfVxuICAgIGlmIChwcm9maWxlLnNraWxscy5sZW5ndGggPj0gMykge1xuICAgICAgICBlYXJuZWQgKz0gMjtcbiAgICAgICAgY29tcGxldGVTZWN0aW9ucyArPSAxO1xuICAgIH1cbiAgICBlbHNlIGlmIChwcm9maWxlLnNraWxscy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGVhcm5lZCArPSAxO1xuICAgICAgICBub3Rlcy5wdXNoKFwiQWRkIGF0IGxlYXN0IHRocmVlIHNraWxscy5cIik7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBub3Rlcy5wdXNoKFwiQWRkIGEgc2tpbGxzIHNlY3Rpb24uXCIpO1xuICAgIH1cbiAgICBjb25zdCBoYXNIaWdobGlnaHQgPSBwcm9maWxlLmV4cGVyaWVuY2VzLnNvbWUoKGV4cGVyaWVuY2UpID0+IGV4cGVyaWVuY2UuaGlnaGxpZ2h0cy5sZW5ndGggPiAwKTtcbiAgICBpZiAoaGFzSGlnaGxpZ2h0KSB7XG4gICAgICAgIGVhcm5lZCArPSAxO1xuICAgICAgICBjb21wbGV0ZVNlY3Rpb25zICs9IDE7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBub3Rlcy5wdXNoKFwiQWRkIGFjaGlldmVtZW50IGhpZ2hsaWdodHMgdG8gZXhwZXJpZW5jZS5cIik7XG4gICAgfVxuICAgIGNvbnN0IGhhc1NlY29uZGFyeUNvbnRhY3QgPSBCb29sZWFuKHByb2ZpbGUuY29udGFjdC5waG9uZT8udHJpbSgpIHx8XG4gICAgICAgIHByb2ZpbGUuY29udGFjdC5saW5rZWRpbj8udHJpbSgpIHx8XG4gICAgICAgIHByb2ZpbGUuY29udGFjdC5sb2NhdGlvbj8udHJpbSgpKTtcbiAgICBpZiAoaGFzU2Vjb25kYXJ5Q29udGFjdCkge1xuICAgICAgICBlYXJuZWQgKz0gMTtcbiAgICAgICAgY29tcGxldGVTZWN0aW9ucyArPSAxO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgbm90ZXMucHVzaChcIkFkZCBwaG9uZSwgTGlua2VkSW4sIG9yIGxvY2F0aW9uLlwiKTtcbiAgICB9XG4gICAgaWYgKHByb2ZpbGUuY29udGFjdC5uYW1lPy50cmltKCkgJiYgcHJvZmlsZS5jb250YWN0LmVtYWlsPy50cmltKCkpIHtcbiAgICAgICAgY29tcGxldGVTZWN0aW9ucyArPSAxO1xuICAgIH1cbiAgICBldmlkZW5jZS5wdXNoKGAke2NvbXBsZXRlU2VjdGlvbnN9Lzcgc2VjdGlvbnMgY29tcGxldGVgKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBrZXk6IFwic2VjdGlvbkNvbXBsZXRlbmVzc1wiLFxuICAgICAgICBsYWJlbDogXCJTZWN0aW9uIGNvbXBsZXRlbmVzc1wiLFxuICAgICAgICBlYXJuZWQ6IE1hdGgubWluKGVhcm5lZCwgU1VCX1NDT1JFX01BWF9QT0lOVFMuc2VjdGlvbkNvbXBsZXRlbmVzcyksXG4gICAgICAgIG1heFBvaW50czogU1VCX1NDT1JFX01BWF9QT0lOVFMuc2VjdGlvbkNvbXBsZXRlbmVzcyxcbiAgICAgICAgbm90ZXMsXG4gICAgICAgIGV2aWRlbmNlLFxuICAgIH07XG59XG4iLCJpbXBvcnQgeyBBQ1RJT05fVkVSQlMsIFNVQl9TQ09SRV9NQVhfUE9JTlRTIH0gZnJvbSBcIi4vY29uc3RhbnRzXCI7XG5pbXBvcnQgeyBnZXRIaWdobGlnaHRzLCBub3JtYWxpemVUZXh0IH0gZnJvbSBcIi4vdGV4dFwiO1xuY29uc3QgUkVQRUFURURfV09SRF9FWENFUFRJT05TID0gbmV3IFNldChbXCJoYWQgaGFkXCIsIFwidGhhdCB0aGF0XCJdKTtcbmNvbnN0IEFDUk9OWU1TID0gbmV3IFNldChbXCJBUElcIiwgXCJBV1NcIiwgXCJDU1NcIiwgXCJHQ1BcIiwgXCJIVE1MXCIsIFwiU1FMXCJdKTtcbmZ1bmN0aW9uIGhhc1ZlcmJMaWtlVG9rZW4odGV4dCkge1xuICAgIGNvbnN0IHdvcmRzID0gbm9ybWFsaXplVGV4dCh0ZXh0KS5zcGxpdCgvXFxzKy8pLmZpbHRlcihCb29sZWFuKTtcbiAgICByZXR1cm4gd29yZHMuc29tZSgod29yZCkgPT4gQUNUSU9OX1ZFUkJTLmluY2x1ZGVzKHdvcmQpIHx8XG4gICAgICAgIC8oPzplZHxpbmd8cykkLy50ZXN0KHdvcmQpKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBzY29yZVNwZWxsaW5nR3JhbW1hcihpbnB1dCkge1xuICAgIGNvbnN0IGhpZ2hsaWdodHMgPSBnZXRIaWdobGlnaHRzKGlucHV0LnByb2ZpbGUpO1xuICAgIGNvbnN0IHRleHQgPSBoaWdobGlnaHRzLmpvaW4oXCJcXG5cIik7XG4gICAgY29uc3Qgbm90ZXMgPSBbXTtcbiAgICBjb25zdCBldmlkZW5jZSA9IFtdO1xuICAgIGxldCBkZWR1Y3Rpb25zID0gMDtcbiAgICBjb25zdCByZXBlYXRlZCA9IEFycmF5LmZyb20odGV4dC5tYXRjaEFsbCgvXFxiKFxcdyspXFxzK1xcMVxcYi9naSksIChtYXRjaCkgPT4gbWF0Y2hbMF0pLmZpbHRlcigobWF0Y2gpID0+ICFSRVBFQVRFRF9XT1JEX0VYQ0VQVElPTlMuaGFzKG1hdGNoLnRvTG93ZXJDYXNlKCkpKTtcbiAgICBpZiAocmVwZWF0ZWQubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBwZW5hbHR5ID0gTWF0aC5taW4oMiwgcmVwZWF0ZWQubGVuZ3RoKTtcbiAgICAgICAgZGVkdWN0aW9ucyArPSBwZW5hbHR5O1xuICAgICAgICBub3Rlcy5wdXNoKFwiUmVwZWF0ZWQgYWRqYWNlbnQgd29yZHMgZGV0ZWN0ZWQuXCIpO1xuICAgICAgICBldmlkZW5jZS5wdXNoKGBSZXBlYXRlZCB3b3JkOiAke3JlcGVhdGVkWzBdfWApO1xuICAgIH1cbiAgICBpZiAoLyAgKy8udGVzdCh0ZXh0KSkge1xuICAgICAgICBkZWR1Y3Rpb25zICs9IDE7XG4gICAgICAgIG5vdGVzLnB1c2goXCJNdWx0aXBsZSBzcGFjZXMgYmV0d2VlbiB3b3JkcyBkZXRlY3RlZC5cIik7XG4gICAgICAgIGV2aWRlbmNlLnB1c2goXCJNdWx0aXBsZSBzcGFjZXMgZm91bmQuXCIpO1xuICAgIH1cbiAgICBjb25zdCBsb3dlcmNhc2VTdGFydHMgPSBoaWdobGlnaHRzLmZpbHRlcigoaGlnaGxpZ2h0KSA9PiAvXlthLXpdLy50ZXN0KGhpZ2hsaWdodC50cmltKCkpKTtcbiAgICBpZiAobG93ZXJjYXNlU3RhcnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgcGVuYWx0eSA9IE1hdGgubWluKDMsIGxvd2VyY2FzZVN0YXJ0cy5sZW5ndGgpO1xuICAgICAgICBkZWR1Y3Rpb25zICs9IHBlbmFsdHk7XG4gICAgICAgIG5vdGVzLnB1c2goXCJTb21lIGhpZ2hsaWdodHMgc3RhcnQgd2l0aCBsb3dlcmNhc2UgbGV0dGVycy5cIik7XG4gICAgICAgIGV2aWRlbmNlLnB1c2goYExvd2VyY2FzZSBzdGFydDogJHtsb3dlcmNhc2VTdGFydHNbMF19YCk7XG4gICAgfVxuICAgIGNvbnN0IGZyYWdtZW50cyA9IGhpZ2hsaWdodHMuZmlsdGVyKChoaWdobGlnaHQpID0+IGhpZ2hsaWdodC5sZW5ndGggPiA0MCAmJiAhaGFzVmVyYkxpa2VUb2tlbihoaWdobGlnaHQpKTtcbiAgICBpZiAoZnJhZ21lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgcGVuYWx0eSA9IE1hdGgubWluKDIsIGZyYWdtZW50cy5sZW5ndGgpO1xuICAgICAgICBkZWR1Y3Rpb25zICs9IHBlbmFsdHk7XG4gICAgICAgIG5vdGVzLnB1c2goXCJTb21lIGxvbmcgaGlnaGxpZ2h0cyBtYXkgcmVhZCBsaWtlIHNlbnRlbmNlIGZyYWdtZW50cy5cIik7XG4gICAgICAgIGV2aWRlbmNlLnB1c2goYFBvc3NpYmxlIGZyYWdtZW50OiAke2ZyYWdtZW50c1swXX1gKTtcbiAgICB9XG4gICAgY29uc3QgcHVuY3R1YXRpb25FbmRpbmdzID0gaGlnaGxpZ2h0cy5maWx0ZXIoKGhpZ2hsaWdodCkgPT4gL1xcLiQvLnRlc3QoaGlnaGxpZ2h0LnRyaW0oKSkpLmxlbmd0aDtcbiAgICBpZiAoaGlnaGxpZ2h0cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGNvbnN0IHJhdGUgPSBwdW5jdHVhdGlvbkVuZGluZ3MgLyBoaWdobGlnaHRzLmxlbmd0aDtcbiAgICAgICAgaWYgKHJhdGUgPiAwLjMgJiYgcmF0ZSA8IDAuNykge1xuICAgICAgICAgICAgZGVkdWN0aW9ucyArPSAxO1xuICAgICAgICAgICAgbm90ZXMucHVzaChcIlRyYWlsaW5nIHB1bmN0dWF0aW9uIGlzIGluY29uc2lzdGVudCBhY3Jvc3MgaGlnaGxpZ2h0cy5cIik7XG4gICAgICAgICAgICBldmlkZW5jZS5wdXNoKGAke3B1bmN0dWF0aW9uRW5kaW5nc30vJHtoaWdobGlnaHRzLmxlbmd0aH0gaGlnaGxpZ2h0cyBlbmQgd2l0aCBwZXJpb2RzLmApO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGFsbENhcHMgPSBBcnJheS5mcm9tKHRleHQubWF0Y2hBbGwoL1xcYltBLVpdezQsfVxcYi9nKSwgKG1hdGNoKSA9PiBtYXRjaFswXSkuZmlsdGVyKCh3b3JkKSA9PiAhQUNST05ZTVMuaGFzKHdvcmQpKTtcbiAgICBpZiAoYWxsQ2Fwcy5sZW5ndGggPiA1KSB7XG4gICAgICAgIGRlZHVjdGlvbnMgKz0gMTtcbiAgICAgICAgbm90ZXMucHVzaChcIkV4Y2Vzc2l2ZSBhbGwtY2FwcyB3b3JkcyBkZXRlY3RlZC5cIik7XG4gICAgICAgIGV2aWRlbmNlLnB1c2goYEFsbC1jYXBzIHdvcmRzOiAke2FsbENhcHMuc2xpY2UoMCwgMykuam9pbihcIiwgXCIpfWApO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBrZXk6IFwic3BlbGxpbmdHcmFtbWFyXCIsXG4gICAgICAgIGxhYmVsOiBcIlNwZWxsaW5nIGFuZCBncmFtbWFyXCIsXG4gICAgICAgIGVhcm5lZDogTWF0aC5tYXgoMCwgU1VCX1NDT1JFX01BWF9QT0lOVFMuc3BlbGxpbmdHcmFtbWFyIC0gZGVkdWN0aW9ucyksXG4gICAgICAgIG1heFBvaW50czogU1VCX1NDT1JFX01BWF9QT0lOVFMuc3BlbGxpbmdHcmFtbWFyLFxuICAgICAgICBub3RlcyxcbiAgICAgICAgZXZpZGVuY2U6IGV2aWRlbmNlLmxlbmd0aCA+IDAgPyBldmlkZW5jZSA6IFtcIk5vIGhldXJpc3RpYyBpc3N1ZXMgZGV0ZWN0ZWQuXCJdLFxuICAgIH07XG59XG4iLCJpbXBvcnQgeyBub3dJc28gfSBmcm9tIFwiLi4vZm9ybWF0dGVyc1wiO1xuaW1wb3J0IHsgc2NvcmVBY3Rpb25WZXJicyB9IGZyb20gXCIuL2FjdGlvbi12ZXJic1wiO1xuaW1wb3J0IHsgc2NvcmVBdHNGcmllbmRsaW5lc3MgfSBmcm9tIFwiLi9hdHMtZnJpZW5kbGluZXNzXCI7XG5pbXBvcnQgeyBzY29yZUtleXdvcmRNYXRjaCB9IGZyb20gXCIuL2tleXdvcmQtbWF0Y2hcIjtcbmltcG9ydCB7IHNjb3JlTGVuZ3RoIH0gZnJvbSBcIi4vbGVuZ3RoXCI7XG5pbXBvcnQgeyBzY29yZVF1YW50aWZpZWRBY2hpZXZlbWVudHMgfSBmcm9tIFwiLi9xdWFudGlmaWVkLWFjaGlldmVtZW50c1wiO1xuaW1wb3J0IHsgc2NvcmVTZWN0aW9uQ29tcGxldGVuZXNzIH0gZnJvbSBcIi4vc2VjdGlvbi1jb21wbGV0ZW5lc3NcIjtcbmltcG9ydCB7IHNjb3JlU3BlbGxpbmdHcmFtbWFyIH0gZnJvbSBcIi4vc3BlbGxpbmctZ3JhbW1hclwiO1xuZXhwb3J0IGZ1bmN0aW9uIHNjb3JlUmVzdW1lKGlucHV0KSB7XG4gICAgY29uc3Qgc3ViU2NvcmVzID0ge1xuICAgICAgICBzZWN0aW9uQ29tcGxldGVuZXNzOiBzY29yZVNlY3Rpb25Db21wbGV0ZW5lc3MoaW5wdXQpLFxuICAgICAgICBhY3Rpb25WZXJiczogc2NvcmVBY3Rpb25WZXJicyhpbnB1dCksXG4gICAgICAgIHF1YW50aWZpZWRBY2hpZXZlbWVudHM6IHNjb3JlUXVhbnRpZmllZEFjaGlldmVtZW50cyhpbnB1dCksXG4gICAgICAgIGtleXdvcmRNYXRjaDogc2NvcmVLZXl3b3JkTWF0Y2goaW5wdXQpLFxuICAgICAgICBsZW5ndGg6IHNjb3JlTGVuZ3RoKGlucHV0KSxcbiAgICAgICAgc3BlbGxpbmdHcmFtbWFyOiBzY29yZVNwZWxsaW5nR3JhbW1hcihpbnB1dCksXG4gICAgICAgIGF0c0ZyaWVuZGxpbmVzczogc2NvcmVBdHNGcmllbmRsaW5lc3MoaW5wdXQpLFxuICAgIH07XG4gICAgY29uc3Qgb3ZlcmFsbCA9IE9iamVjdC52YWx1ZXMoc3ViU2NvcmVzKS5yZWR1Y2UoKHN1bSwgc3ViU2NvcmUpID0+IHN1bSArIHN1YlNjb3JlLmVhcm5lZCwgMCk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgb3ZlcmFsbDogTWF0aC5tYXgoMCwgTWF0aC5taW4oMTAwLCBNYXRoLnJvdW5kKG92ZXJhbGwpKSksXG4gICAgICAgIHN1YlNjb3JlcyxcbiAgICAgICAgZ2VuZXJhdGVkQXQ6IG5vd0lzbygpLFxuICAgIH07XG59XG5leHBvcnQgeyBzY29yZUFjdGlvblZlcmJzIH0gZnJvbSBcIi4vYWN0aW9uLXZlcmJzXCI7XG5leHBvcnQgeyBzY29yZUF0c0ZyaWVuZGxpbmVzcyB9IGZyb20gXCIuL2F0cy1mcmllbmRsaW5lc3NcIjtcbmV4cG9ydCB7IHNjb3JlS2V5d29yZE1hdGNoIH0gZnJvbSBcIi4va2V5d29yZC1tYXRjaFwiO1xuZXhwb3J0IHsgc2NvcmVMZW5ndGggfSBmcm9tIFwiLi9sZW5ndGhcIjtcbmV4cG9ydCB7IHNjb3JlUXVhbnRpZmllZEFjaGlldmVtZW50cyB9IGZyb20gXCIuL3F1YW50aWZpZWQtYWNoaWV2ZW1lbnRzXCI7XG5leHBvcnQgeyBzY29yZVNlY3Rpb25Db21wbGV0ZW5lc3MgfSBmcm9tIFwiLi9zZWN0aW9uLWNvbXBsZXRlbmVzc1wiO1xuZXhwb3J0IHsgc2NvcmVTcGVsbGluZ0dyYW1tYXIgfSBmcm9tIFwiLi9zcGVsbGluZy1ncmFtbWFyXCI7XG4iLCIvKipcbiAqIERlZXAtbGluayBVUkwgYnVpbGRlcnMgZm9yIHRoZSBwb3B1cCdzIHBvc3QtaW1wb3J0IHN1Y2Nlc3MgYnV0dG9ucyAoIzMxKS5cbiAqXG4gKiBLZXB0IGluIGl0cyBvd24gbW9kdWxlIHNvIHRoZSBVUkwgc2hhcGUgaXMgdW5pdC10ZXN0YWJsZSB3aXRob3V0IGJvb3RpbmdcbiAqIFJlYWN0L2pzZG9tLiBUaGUgcG9wdXAgY29tcG9uZW50IGltcG9ydHMgYm90aCBoZWxwZXJzIGFuZCB0aHJlYWRzIHRoZVxuICogY29uZmlndXJlZCBgYXBpQmFzZVVybGAgKGZyb20gR0VUX0FVVEhfU1RBVFVTKSB0aHJvdWdoLlxuICovXG4vKipcbiAqIEJ1aWxkcyB0aGUgZGVlcC1saW5rIHRvIGEgc2luZ2xlIG9wcG9ydHVuaXR5J3MgZGV0YWlsIHBhZ2UuXG4gKlxuICogVHJhaWxpbmcgc2xhc2hlcyBvbiB0aGUgYmFzZSBVUkwgYXJlIHN0cmlwcGVkIHNvIHdlIGRvbid0IHByb2R1Y2VcbiAqIGBodHRwOi8vbG9jYWxob3N0OjMwMDAvL29wcG9ydHVuaXRpZXMvLi4uYC4gVGhlIG9wcG9ydHVuaXR5IGlkIGlzXG4gKiBVUkktZW5jb2RlZCBkZWZlbnNpdmVseSBldmVuIHRob3VnaCBzZXJ2ZXItc2lkZSBpZHMgYXJlIHNhZmUgdG9kYXkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvcHBvcnR1bml0eURldGFpbFVybChhcGlCYXNlVXJsLCBvcHBvcnR1bml0eUlkKSB7XG4gICAgY29uc3QgYmFzZSA9IGFwaUJhc2VVcmwucmVwbGFjZSgvXFwvKyQvLCBcIlwiKTtcbiAgICByZXR1cm4gYCR7YmFzZX0vb3Bwb3J0dW5pdGllcy8ke2VuY29kZVVSSUNvbXBvbmVudChvcHBvcnR1bml0eUlkKX1gO1xufVxuLyoqXG4gKiBCdWlsZHMgdGhlIGRlZXAtbGluayB0byB0aGUgcmV2aWV3IHF1ZXVlIHVzZWQgYWZ0ZXIgYSBidWxrIHNjcmFwZSBpbXBvcnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvcHBvcnR1bml0eVJldmlld1VybChhcGlCYXNlVXJsKSB7XG4gICAgY29uc3QgYmFzZSA9IGFwaUJhc2VVcmwucmVwbGFjZSgvXFwvKyQvLCBcIlwiKTtcbiAgICByZXR1cm4gYCR7YmFzZX0vb3Bwb3J0dW5pdGllcy9yZXZpZXdgO1xufVxuIiwiaW1wb3J0IHsganN4cyBhcyBfanN4cywganN4IGFzIF9qc3ggfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbmV4cG9ydCBmdW5jdGlvbiBCdWxrU291cmNlQ2FyZChwcm9wcykge1xuICAgIGNvbnN0IHsgc291cmNlTGFiZWwsIGRldGVjdGVkQ291bnQsIGJ1c3ksIGxhc3RSZXN1bHQsIGxhc3RFcnJvciwgb25TY3JhcGVWaXNpYmxlLCBvblNjcmFwZVBhZ2luYXRlZCwgb25WaWV3VHJhY2tlciwgfSA9IHByb3BzO1xuICAgIGNvbnN0IGRpc2FibGVkID0gYnVzeSAhPT0gbnVsbCB8fCBkZXRlY3RlZENvdW50ID09PSAwO1xuICAgIHJldHVybiAoX2pzeHMoXCJhcnRpY2xlXCIsIHsgY2xhc3NOYW1lOiBcImNhcmRcIiwgXCJkYXRhLWJ1bGstc291cmNlXCI6IHNvdXJjZUxhYmVsLnRvTG93ZXJDYXNlKCksIGNoaWxkcmVuOiBbX2pzeHMoXCJoZWFkZXJcIiwgeyBjbGFzc05hbWU6IFwiY2FyZC1oZWFkXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcImNhcmQtdGl0bGVcIiwgY2hpbGRyZW46IFtzb3VyY2VMYWJlbCwgXCIgbGlzdFwiXSB9KSwgX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcImJhZGdlXCIsIGNoaWxkcmVuOiBbZGV0ZWN0ZWRDb3VudCwgXCIgcm93XCIsIGRldGVjdGVkQ291bnQgPT09IDEgPyBcIlwiIDogXCJzXCJdIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYWN0aW9uLWdyaWRcIiwgY2hpbGRyZW46IFtfanN4KFwiYnV0dG9uXCIsIHsgY2xhc3NOYW1lOiBcImJ0biBwcmltYXJ5IGZ1bGxcIiwgb25DbGljazogb25TY3JhcGVWaXNpYmxlLCBkaXNhYmxlZDogZGlzYWJsZWQsIGNoaWxkcmVuOiBidXN5ID09PSBcInZpc2libGVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gXCJTY3JhcGluZyB2aXNpYmxl4oCmXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IGBTY3JhcGUgJHtkZXRlY3RlZENvdW50fSB2aXNpYmxlYCB9KSwgX2pzeChcImJ1dHRvblwiLCB7IGNsYXNzTmFtZTogXCJidG4gZnVsbFwiLCBvbkNsaWNrOiBvblNjcmFwZVBhZ2luYXRlZCwgZGlzYWJsZWQ6IGRpc2FibGVkLCB0aXRsZTogYFdhbGtzIGV2ZXJ5IHBhZ2UgaW4geW91ciBjdXJyZW50IGZpbHRlciBzZXQ7IGNhcHBlZCBhdCAyMDAgam9icy5gLCBjaGlsZHJlbjogYnVzeSA9PT0gXCJwYWdpbmF0ZWRcIiA/IFwiV2Fsa2luZyBwYWdlc+KAplwiIDogXCJTY3JhcGUgZmlsdGVyZWQgc2V0XCIgfSldIH0pLCBsYXN0UmVzdWx0ICYmIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJidWxrLXJlc3VsdFwiLCBjaGlsZHJlbjogW19qc3hzKFwicFwiLCB7IGNsYXNzTmFtZTogXCJpbmxpbmUtbm90ZVwiLCBjaGlsZHJlbjogW1wiSW1wb3J0ZWQgXCIsIGxhc3RSZXN1bHQuaW1wb3J0ZWQsIFwiL1wiLCBsYXN0UmVzdWx0LmF0dGVtcHRlZCwgbGFzdFJlc3VsdC5wYWdlcyA+IDEgJiYgYCDCtyAke2xhc3RSZXN1bHQucGFnZXN9IHBhZ2VzYCwgbGFzdFJlc3VsdC5kdXBsaWNhdGVDb3VudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IGAgwrcgJHtsYXN0UmVzdWx0LmR1cGxpY2F0ZUNvdW50fSBkdXBsaWNhdGVzYFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFwiXCIsIGxhc3RSZXN1bHQuZXJyb3JzLmxlbmd0aCA+IDAgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYCDCtyAke2xhc3RSZXN1bHQuZXJyb3JzLmxlbmd0aH0gZXJyb3JzYF0gfSksIGxhc3RSZXN1bHQuZGVkdXBlZElkcz8ubGVuZ3RoID8gKF9qc3hzKFwicFwiLCB7IGNsYXNzTmFtZTogXCJpbmxpbmUtbm90ZSBidWxrLWR1cGxpY2F0ZXNcIiwgY2hpbGRyZW46IFtcIkR1cGxpY2F0ZXM6IFwiLCBsYXN0UmVzdWx0LmRlZHVwZWRJZHMuam9pbihcIiwgXCIpXSB9KSkgOiBudWxsLCBsYXN0UmVzdWx0LmltcG9ydGVkID4gMCAmJiBvblZpZXdUcmFja2VyICYmIChfanN4KFwiYnV0dG9uXCIsIHsgY2xhc3NOYW1lOiBcInN1Y2Nlc3MtbGlua1wiLCBvbkNsaWNrOiBvblZpZXdUcmFja2VyLCBjaGlsZHJlbjogXCJWaWV3IHRyYWNrZXIgXFx1MjE5MlwiIH0pKV0gfSkpLCBsYXN0RXJyb3IgJiYgX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwiaW5saW5lLWVycm9yXCIsIGNoaWxkcmVuOiBsYXN0RXJyb3IgfSldIH0pKTtcbn1cbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG5pbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBmb3JtYXRSZWxhdGl2ZSB9IGZyb20gXCJAc2xvdGhpbmcvc2hhcmVkL2Zvcm1hdHRlcnNcIjtcbmltcG9ydCB7IHNjb3JlUmVzdW1lIH0gZnJvbSBcIkBzbG90aGluZy9zaGFyZWQvc2NvcmluZ1wiO1xuaW1wb3J0IHsgREVGQVVMVF9BUElfQkFTRV9VUkwgfSBmcm9tIFwiQC9zaGFyZWQvdHlwZXNcIjtcbmltcG9ydCB7IHNlbmRNZXNzYWdlLCBNZXNzYWdlcyB9IGZyb20gXCJAL3NoYXJlZC9tZXNzYWdlc1wiO1xuaW1wb3J0IHsgbWVzc2FnZUZvckVycm9yIH0gZnJvbSBcIkAvc2hhcmVkL2Vycm9yLW1lc3NhZ2VzXCI7XG5pbXBvcnQgeyBvcHBvcnR1bml0eVJldmlld1VybCB9IGZyb20gXCIuL2RlZXAtbGlua3NcIjtcbmltcG9ydCB7IEJ1bGtTb3VyY2VDYXJkLCB9IGZyb20gXCIuL0J1bGtTb3VyY2VDYXJkXCI7XG5jb25zdCBCVUxLX1NPVVJDRV9MQUJFTFMgPSB7XG4gICAgZ3JlZW5ob3VzZTogXCJHcmVlbmhvdXNlXCIsXG4gICAgbGV2ZXI6IFwiTGV2ZXJcIixcbiAgICB3b3JrZGF5OiBcIldvcmtkYXlcIixcbn07XG5jb25zdCBCVUxLX1NPVVJDRV9VUkxfUEFUVEVSTlMgPSB7XG4gICAgZ3JlZW5ob3VzZTogWy9ib2FyZHNcXC5ncmVlbmhvdXNlXFwuaW9cXC8vLCAvW1xcdy1dK1xcLmdyZWVuaG91c2VcXC5pb1xcLy9dLFxuICAgIGxldmVyOiBbL2pvYnNcXC5sZXZlclxcLmNvXFwvLywgL1tcXHctXStcXC5sZXZlclxcLmNvXFwvL10sXG4gICAgd29ya2RheTogWy9cXC5teXdvcmtkYXlqb2JzXFwuY29tXFwvLywgL1xcLndvcmtkYXlqb2JzXFwuY29tXFwvL10sXG59O1xuY29uc3QgQ09OVEVOVF9TQ1JJUFRfVVJMX1BBVFRFUk5TID0gW1xuICAgIC9saW5rZWRpblxcLmNvbVxcLy8sXG4gICAgL2luZGVlZFxcLmNvbVxcLy8sXG4gICAgL2dyZWVuaG91c2VcXC5pb1xcLy8sXG4gICAgL2JvYXJkc1xcLmdyZWVuaG91c2VcXC5pb1xcLy8sXG4gICAgL2xldmVyXFwuY29cXC8vLFxuICAgIC9qb2JzXFwubGV2ZXJcXC5jb1xcLy8sXG4gICAgL3dhdGVybG9vd29ya3NcXC51d2F0ZXJsb29cXC5jYVxcLy8sXG4gICAgL3dvcmtkYXlqb2JzXFwuY29tXFwvLyxcbiAgICAvbXl3b3JrZGF5am9ic1xcLmNvbVxcLy8sXG5dO1xuY29uc3QgTElOS0VESU5fSk9CU19VUkxfUEFUVEVSTiA9IC9saW5rZWRpblxcLmNvbVxcL2pvYnNcXC8oPzp2aWV3fHNlYXJjaC1yZXN1bHRzfHNlYXJjaHxjb2xsZWN0aW9ucykvO1xuY29uc3QgTElOS0VESU5fSk9CX1JFVFJZX0RFTEFZU19NUyA9IFs2MDAsIDE0MDBdO1xuZnVuY3Rpb24gbWF0Y2hCdWxrU291cmNlKHVybCkge1xuICAgIGlmICghdXJsKVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhCVUxLX1NPVVJDRV9VUkxfUEFUVEVSTlMpKSB7XG4gICAgICAgIGlmIChCVUxLX1NPVVJDRV9VUkxfUEFUVEVSTlNba2V5XS5zb21lKChwKSA9PiBwLnRlc3QodXJsKSkpXG4gICAgICAgICAgICByZXR1cm4ga2V5O1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn1cbmZ1bmN0aW9uIGhhc0NvbnRlbnRTY3JpcHRIb3N0KHVybCkge1xuICAgIHJldHVybiAoISF1cmwgJiYgQ09OVEVOVF9TQ1JJUFRfVVJMX1BBVFRFUk5TLnNvbWUoKHBhdHRlcm4pID0+IHBhdHRlcm4udGVzdCh1cmwpKSk7XG59XG5mdW5jdGlvbiBpc0xpbmtlZEluSm9ic1VybCh1cmwpIHtcbiAgICByZXR1cm4gISF1cmwgJiYgTElOS0VESU5fSk9CU19VUkxfUEFUVEVSTi50ZXN0KHVybCk7XG59XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBBcHAoKSB7XG4gICAgY29uc3QgW3ZpZXdTdGF0ZSwgc2V0Vmlld1N0YXRlXSA9IHVzZVN0YXRlKFwibG9hZGluZ1wiKTtcbiAgICBjb25zdCBbcHJvZmlsZSwgc2V0UHJvZmlsZV0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbcGFnZVN0YXR1cywgc2V0UGFnZVN0YXR1c10gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbc3VyZmFjZUNvbnRleHQsIHNldFN1cmZhY2VDb250ZXh0XSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtsYXRlc3RSZXN1bWUsIHNldExhdGVzdFJlc3VtZV0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbYWN0aXZlVGFiSWQsIHNldEFjdGl2ZVRhYklkXSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFthY3RpdmVUYWJVcmwsIHNldEFjdGl2ZVRhYlVybF0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbcGFnZVByb2JlU3RhdGUsIHNldFBhZ2VQcm9iZVN0YXRlXSA9IHVzZVN0YXRlKFwidW5rbm93blwiKTtcbiAgICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIC8vIENhY2hlZCBzbyBkYXNoYm9hcmQvcmV2aWV3IGxpbmtzIGNhbiByZW5kZXIgd2l0aG91dCBxdWVyeWluZ1xuICAgIC8vIEdFVF9BVVRIX1NUQVRVUyBhZ2Fpbi4gUG9wdWxhdGVkIGZyb20gdGhlIGF1dGgtc3RhdHVzIHJlc3BvbnNlIG9uIGZpcnN0XG4gICAgLy8gbG9hZCBhbmQga2VwdCBzdGFibGUgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgcG9wdXAuXG4gICAgY29uc3QgW2FwaUJhc2VVcmwsIHNldEFwaUJhc2VVcmxdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW3d3U3RhdGUsIHNldFd3U3RhdGVdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW3d3QnVsa0luRmxpZ2h0LCBzZXRXd0J1bGtJbkZsaWdodF0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbd3dCdWxrUmVzdWx0LCBzZXRXd0J1bGtSZXN1bHRdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW3d3QnVsa0Vycm9yLCBzZXRXd0J1bGtFcnJvcl0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICAvLyBQMy8jMzkg4oCUIFBlci1zb3VyY2Ugc3RhdGUgZm9yIEdyZWVuaG91c2UgLyBMZXZlciAvIFdvcmtkYXkuIEtleWVkIGJ5XG4gICAgLy8gQnVsa1NvdXJjZUtleSBzbyBhIGZ1dHVyZSBzb3VyY2UgaXMgYSBvbmUtbGluZSBhZGRpdGlvbi5cbiAgICBjb25zdCBbYnVsa1N0YXRlcywgc2V0QnVsa1N0YXRlc10gPSB1c2VTdGF0ZSh7fSk7XG4gICAgY29uc3QgW2J1bGtJbkZsaWdodCwgc2V0QnVsa0luRmxpZ2h0XSA9IHVzZVN0YXRlKHt9KTtcbiAgICBjb25zdCBbYnVsa1Jlc3VsdHMsIHNldEJ1bGtSZXN1bHRzXSA9IHVzZVN0YXRlKHt9KTtcbiAgICBjb25zdCBbYnVsa0Vycm9ycywgc2V0QnVsa0Vycm9yc10gPSB1c2VTdGF0ZSh7fSk7XG4gICAgY29uc3QgW2NvbmZpcm1pbmdMb2dvdXQsIHNldENvbmZpcm1pbmdMb2dvdXRdID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IHByb2ZpbGVTY29yZSA9IHByb2ZpbGUgPyBzY29yZVJlc3VtZSh7IHByb2ZpbGUgfSkub3ZlcmFsbCA6IG51bGw7XG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgY2hlY2tBdXRoU3RhdHVzKCk7XG4gICAgICAgIGNoZWNrUGFnZVN0YXR1cygpO1xuICAgIH0sIFtdKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBjb25zdCBsaXN0ZW5lciA9IChtZXNzYWdlKSA9PiB7XG4gICAgICAgICAgICBpZiAobWVzc2FnZS50eXBlID09PSBcIkFVVEhfU1RBVFVTX0NIQU5HRURcIikge1xuICAgICAgICAgICAgICAgIHZvaWQgY2hlY2tBdXRoU3RhdHVzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcihsaXN0ZW5lcik7XG4gICAgICAgIHJldHVybiAoKSA9PiBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2UucmVtb3ZlTGlzdGVuZXIobGlzdGVuZXIpO1xuICAgIH0sIFtdKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBpZiAodmlld1N0YXRlICE9PSBcInNlc3Npb24tbG9zdFwiKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBjb25zdCBpbnRlcnZhbElkID0gd2luZG93LnNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgIHZvaWQgY2hlY2tBdXRoU3RhdHVzKCk7XG4gICAgICAgIH0sIDEwMDApO1xuICAgICAgICByZXR1cm4gKCkgPT4gd2luZG93LmNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZCk7XG4gICAgfSwgW3ZpZXdTdGF0ZV0pOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHJlYWN0LWhvb2tzL2V4aGF1c3RpdmUtZGVwc1xuICAgIGFzeW5jIGZ1bmN0aW9uIGNoZWNrQXV0aFN0YXR1cygpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgc2VuZE1lc3NhZ2UoTWVzc2FnZXMuZ2V0QXV0aFN0YXR1cygpKTtcbiAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdWNjZXNzICYmIHJlc3BvbnNlLmRhdGEpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB7IGlzQXV0aGVudGljYXRlZCwgc2Vzc2lvbkxvc3QsIGFwaUJhc2VVcmw6IHVybCwgfSA9IHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICAgICAgaWYgKHVybClcbiAgICAgICAgICAgICAgICAgICAgc2V0QXBpQmFzZVVybCh1cmwpO1xuICAgICAgICAgICAgICAgIGlmIChpc0F1dGhlbnRpY2F0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0Vmlld1N0YXRlKFwiYXV0aGVudGljYXRlZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgbG9hZFByb2ZpbGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoc2Vzc2lvbkxvc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0Vmlld1N0YXRlKFwic2Vzc2lvbi1sb3N0XCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0Vmlld1N0YXRlKFwidW5hdXRoZW50aWNhdGVkXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHNldFZpZXdTdGF0ZShcInVuYXV0aGVudGljYXRlZFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBzZXRFcnJvcihlcnIubWVzc2FnZSk7XG4gICAgICAgICAgICBzZXRWaWV3U3RhdGUoXCJlcnJvclwiKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBhc3luYyBmdW5jdGlvbiBsb2FkUHJvZmlsZSgpIHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBzZW5kTWVzc2FnZShNZXNzYWdlcy5nZXRQcm9maWxlKCkpO1xuICAgICAgICBpZiAocmVzcG9uc2Uuc3VjY2VzcyAmJiByZXNwb25zZS5kYXRhKSB7XG4gICAgICAgICAgICBzZXRQcm9maWxlKHJlc3BvbnNlLmRhdGEpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGFzeW5jIGZ1bmN0aW9uIGNoZWNrUGFnZVN0YXR1cyhhdHRlbXB0ID0gMCkge1xuICAgICAgICBjb25zdCBbdGFiXSA9IGF3YWl0IGNocm9tZS50YWJzLnF1ZXJ5KHtcbiAgICAgICAgICAgIGFjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgIGN1cnJlbnRXaW5kb3c6IHRydWUsXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAodGFiPy5pZCkge1xuICAgICAgICAgICAgc2V0QWN0aXZlVGFiSWQodGFiLmlkKTtcbiAgICAgICAgICAgIHNldEFjdGl2ZVRhYlVybCh0YWIudXJsIHx8IG51bGwpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYi5pZCwgTWVzc2FnZXMuZ2V0U3VyZmFjZUNvbnRleHQoKSk7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRleHQgPSByZXNwb25zZTtcbiAgICAgICAgICAgICAgICAgICAgc2V0U3VyZmFjZUNvbnRleHQoY29udGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIHNldFBhZ2VTdGF0dXMoe1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFzRm9ybTogY29udGV4dC5wYWdlLmhhc0FwcGxpY2F0aW9uRm9ybSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhc0pvYkxpc3Rpbmc6IGNvbnRleHQucGFnZS5qb2IgIT09IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXRlY3RlZEZpZWxkczogY29udGV4dC5wYWdlLmRldGVjdGVkRmllbGRDb3VudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRldGVjdGVkVXBsb2FkQ291bnQ6IGNvbnRleHQucGFnZS5kZXRlY3RlZFVwbG9hZENvdW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnRVcGxvYWRzOiBjb250ZXh0LnBhZ2UuZG9jdW1lbnRVcGxvYWRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2NyYXBlZEpvYjogY29udGV4dC5wYWdlLmpvYixcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb250ZXh0LnBhZ2UuZGV0ZWN0ZWRVcGxvYWRDb3VudCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZvaWQgbG9hZExhdGVzdFJlc3VtZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0TGF0ZXN0UmVzdW1lKG51bGwpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHNldFBhZ2VQcm9iZVN0YXRlKFwicmVhZHlcIik7XG4gICAgICAgICAgICAgICAgICAgIGlmICghY29udGV4dC5wYWdlLmpvYiAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgaXNMaW5rZWRJbkpvYnNVcmwodGFiLnVybCkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGF0dGVtcHQgPCBMSU5LRURJTl9KT0JfUkVUUllfREVMQVlTX01TLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZvaWQgY2hlY2tQYWdlU3RhdHVzKGF0dGVtcHQgKyAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIExJTktFRElOX0pPQl9SRVRSWV9ERUxBWVNfTVNbYXR0ZW1wdF0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2gge1xuICAgICAgICAgICAgICAgIHNldFBhZ2VQcm9iZVN0YXRlKCF0YWIudXJsIHx8IGhhc0NvbnRlbnRTY3JpcHRIb3N0KHRhYi51cmwpXG4gICAgICAgICAgICAgICAgICAgID8gXCJuZWVkcy1yZWZyZXNoXCJcbiAgICAgICAgICAgICAgICAgICAgOiBcInVua25vd25cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGFiLnVybCAmJiAvd2F0ZXJsb293b3Jrc1xcLnV3YXRlcmxvb1xcLmNhLy50ZXN0KHRhYi51cmwpKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgciA9IGF3YWl0IGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYi5pZCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJXV19HRVRfUEFHRV9TVEFURVwiLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHI/LnN1Y2Nlc3MpXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRXd1N0YXRlKHIuZGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQ29udGVudCBzY3JpcHQgbm90IHlldCBsb2FkZWRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBQMy8jMzkg4oCUIHByb2JlIEdyZWVuaG91c2UvTGV2ZXIvV29ya2RheSBsaXN0aW5nIHBhZ2VzLiBPbmx5IG9uZVxuICAgICAgICAgICAgLy8gbWF0Y2hlciBmaXJlcyBwZXIgdmlzaXQgKHRoZSB1c2VyIGlzIG9uIGEgc2luZ2xlIGhvc3QpLlxuICAgICAgICAgICAgY29uc3QgYnVsa0tleSA9IG1hdGNoQnVsa1NvdXJjZSh0YWIudXJsKTtcbiAgICAgICAgICAgIGlmIChidWxrS2V5KSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbWVzc2FnZVR5cGUgPSBidWxrUGFnZVN0YXRlTWVzc2FnZShidWxrS2V5KTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgciA9IGF3YWl0IGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYi5pZCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogbWVzc2FnZVR5cGUsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAocj8uc3VjY2VzcyAmJiByLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldEJ1bGtTdGF0ZXMoKHByZXYpID0+ICh7IC4uLnByZXYsIFtidWxrS2V5XTogci5kYXRhIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCB7XG4gICAgICAgICAgICAgICAgICAgIC8vIENvbnRlbnQgc2NyaXB0IG5vdCB5ZXQgbG9hZGVkXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIGJ1bGtQYWdlU3RhdGVNZXNzYWdlKGtleSkge1xuICAgICAgICByZXR1cm4gYEJVTEtfJHtrZXkudG9VcHBlckNhc2UoKX1fR0VUX1BBR0VfU1RBVEVgO1xuICAgIH1cbiAgICBmdW5jdGlvbiBidWxrU2NyYXBlTWVzc2FnZShrZXksIG1vZGUpIHtcbiAgICAgICAgY29uc3Qgc3VmZml4ID0gbW9kZSA9PT0gXCJ2aXNpYmxlXCIgPyBcIlNDUkFQRV9WSVNJQkxFXCIgOiBcIlNDUkFQRV9QQUdJTkFURURcIjtcbiAgICAgICAgcmV0dXJuIGBCVUxLXyR7a2V5LnRvVXBwZXJDYXNlKCl9XyR7c3VmZml4fWA7XG4gICAgfVxuICAgIGFzeW5jIGZ1bmN0aW9uIGhhbmRsZUJ1bGtTb3VyY2VTY3JhcGUoa2V5LCBtb2RlKSB7XG4gICAgICAgIHNldEJ1bGtJbkZsaWdodCgocHJldikgPT4gKHsgLi4ucHJldiwgW2tleV06IG1vZGUgfSkpO1xuICAgICAgICBzZXRCdWxrRXJyb3JzKChwcmV2KSA9PiAoeyAuLi5wcmV2LCBba2V5XTogdW5kZWZpbmVkIH0pKTtcbiAgICAgICAgc2V0QnVsa1Jlc3VsdHMoKHByZXYpID0+ICh7IC4uLnByZXYsIFtrZXldOiB1bmRlZmluZWQgfSkpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgW3RhYl0gPSBhd2FpdCBjaHJvbWUudGFicy5xdWVyeSh7XG4gICAgICAgICAgICAgICAgYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRXaW5kb3c6IHRydWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmICghdGFiPy5pZClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBhY3RpdmUgdGFiXCIpO1xuICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9IHsgdHlwZTogYnVsa1NjcmFwZU1lc3NhZ2Uoa2V5LCBtb2RlKSwgcGF5bG9hZDoge30gfTtcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UodGFiLmlkLCBtZXNzYWdlKTtcbiAgICAgICAgICAgIGlmIChyZXNwb25zZT8uc3VjY2VzcyAmJiByZXNwb25zZS5kYXRhKSB7XG4gICAgICAgICAgICAgICAgc2V0QnVsa1Jlc3VsdHMoKHByZXYpID0+ICh7IC4uLnByZXYsIFtrZXldOiByZXNwb25zZS5kYXRhIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHNldEJ1bGtFcnJvcnMoKHByZXYpID0+ICh7XG4gICAgICAgICAgICAgICAgICAgIC4uLnByZXYsXG4gICAgICAgICAgICAgICAgICAgIFtrZXldOiBtZXNzYWdlRm9yRXJyb3IobmV3IEVycm9yKHJlc3BvbnNlPy5lcnJvciB8fCBcIkJ1bGsgc2NyYXBlIGZhaWxlZFwiKSksXG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHNldEJ1bGtFcnJvcnMoKHByZXYpID0+ICh7IC4uLnByZXYsIFtrZXldOiBtZXNzYWdlRm9yRXJyb3IoZXJyKSB9KSk7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICBzZXRCdWxrSW5GbGlnaHQoKHByZXYpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXh0ID0geyAuLi5wcmV2IH07XG4gICAgICAgICAgICAgICAgZGVsZXRlIG5leHRba2V5XTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIGFzeW5jIGZ1bmN0aW9uIGhhbmRsZVd3QnVsa1NjcmFwZShtb2RlKSB7XG4gICAgICAgIHNldFd3QnVsa0luRmxpZ2h0KG1vZGUpO1xuICAgICAgICBzZXRXd0J1bGtFcnJvcihudWxsKTtcbiAgICAgICAgc2V0V3dCdWxrUmVzdWx0KG51bGwpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgW3RhYl0gPSBhd2FpdCBjaHJvbWUudGFicy5xdWVyeSh7XG4gICAgICAgICAgICAgICAgYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRXaW5kb3c6IHRydWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmICghdGFiPy5pZClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBhY3RpdmUgdGFiXCIpO1xuICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9IG1vZGUgPT09IFwidmlzaWJsZVwiXG4gICAgICAgICAgICAgICAgPyBNZXNzYWdlcy53d1NjcmFwZUFsbFZpc2libGUoKVxuICAgICAgICAgICAgICAgIDogTWVzc2FnZXMud3dTY3JhcGVBbGxQYWdpbmF0ZWQoKTtcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UodGFiLmlkLCBtZXNzYWdlKTtcbiAgICAgICAgICAgIGlmIChyZXNwb25zZT8uc3VjY2VzcyAmJiByZXNwb25zZS5kYXRhKSB7XG4gICAgICAgICAgICAgICAgc2V0V3dCdWxrUmVzdWx0KHJlc3BvbnNlLmRhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgc2V0V3dCdWxrRXJyb3IobWVzc2FnZUZvckVycm9yKG5ldyBFcnJvcihyZXNwb25zZT8uZXJyb3IgfHwgXCJCdWxrIHNjcmFwZSBmYWlsZWRcIikpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBzZXRXd0J1bGtFcnJvcihtZXNzYWdlRm9yRXJyb3IoZXJyKSk7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICBzZXRXd0J1bGtJbkZsaWdodChudWxsKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBhc3luYyBmdW5jdGlvbiBoYW5kbGVDb25uZWN0KCkge1xuICAgICAgICBzZXRFcnJvcihudWxsKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgc2VuZE1lc3NhZ2UoTWVzc2FnZXMub3BlbkF1dGgoKSk7XG4gICAgICAgICAgICBpZiAocmVzcG9uc2Uuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5jbG9zZSgpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNldEVycm9yKG1lc3NhZ2VGb3JFcnJvcihuZXcgRXJyb3IocmVzcG9uc2UuZXJyb3IgfHwgXCJGYWlsZWQgdG8gb3BlblwiKSkpO1xuICAgICAgICAgICAgc2V0Vmlld1N0YXRlKFwiZXJyb3JcIik7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgc2V0RXJyb3IobWVzc2FnZUZvckVycm9yKGVycikpO1xuICAgICAgICAgICAgc2V0Vmlld1N0YXRlKFwiZXJyb3JcIik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgYXN5bmMgZnVuY3Rpb24gaGFuZGxlTG9nb3V0KCkge1xuICAgICAgICBpZiAoIWNvbmZpcm1pbmdMb2dvdXQpIHtcbiAgICAgICAgICAgIHNldENvbmZpcm1pbmdMb2dvdXQodHJ1ZSk7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHNldENvbmZpcm1pbmdMb2dvdXQoZmFsc2UpLCA0MDAwKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBhd2FpdCBzZW5kTWVzc2FnZShNZXNzYWdlcy5sb2dvdXQoKSk7XG4gICAgICAgIHNldFZpZXdTdGF0ZShcInVuYXV0aGVudGljYXRlZFwiKTtcbiAgICAgICAgc2V0UHJvZmlsZShudWxsKTtcbiAgICAgICAgc2V0Q29uZmlybWluZ0xvZ291dChmYWxzZSk7XG4gICAgfVxuICAgIGFzeW5jIGZ1bmN0aW9uIGhhbmRsZU9wZW5EYXNoYm9hcmQoKSB7XG4gICAgICAgIGNvbnN0IGJhc2VVcmwgPSBhd2FpdCByZXNvbHZlQXBpQmFzZVVybCgpO1xuICAgICAgICBjaHJvbWUudGFicy5jcmVhdGUoeyB1cmw6IGAke2Jhc2VVcmx9L2Rhc2hib2FyZGAgfSk7XG4gICAgICAgIHdpbmRvdy5jbG9zZSgpO1xuICAgIH1cbiAgICBhc3luYyBmdW5jdGlvbiBsb2FkTGF0ZXN0UmVzdW1lKCkge1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHNlbmRNZXNzYWdlKE1lc3NhZ2VzLmxpc3RSZXN1bWVzKCkpO1xuICAgICAgICBpZiAocmVzcG9uc2Uuc3VjY2Vzcykge1xuICAgICAgICAgICAgc2V0TGF0ZXN0UmVzdW1lKHJlc3BvbnNlLmRhdGE/LlswXSA/PyBudWxsKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBhc3luYyBmdW5jdGlvbiBoYW5kbGVPcGVuU3R1ZGlvRm9yUmVzdW1lKCkge1xuICAgICAgICBjb25zdCBiYXNlVXJsID0gYXdhaXQgcmVzb2x2ZUFwaUJhc2VVcmwoKTtcbiAgICAgICAgY29uc3QgcmVzdW1lUGFyYW0gPSBsYXRlc3RSZXN1bWVcbiAgICAgICAgICAgID8gYD9mcm9tPWV4dGVuc2lvbiZ0YWlsb3JJZD0ke2VuY29kZVVSSUNvbXBvbmVudChsYXRlc3RSZXN1bWUuaWQpfWBcbiAgICAgICAgICAgIDogXCJcIjtcbiAgICAgICAgY2hyb21lLnRhYnMuY3JlYXRlKHsgdXJsOiBgJHtiYXNlVXJsfS9lbi9zdHVkaW8ke3Jlc3VtZVBhcmFtfWAgfSk7XG4gICAgICAgIHdpbmRvdy5jbG9zZSgpO1xuICAgIH1cbiAgICBhc3luYyBmdW5jdGlvbiBoYW5kbGVTaG93UGFuZWwoKSB7XG4gICAgICAgIGlmICghYWN0aXZlVGFiSWQpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKGFjdGl2ZVRhYklkLCB7XG4gICAgICAgICAgICAgICAgdHlwZTogXCJTSE9XX1NMT1RISU5HX1BBTkVMXCIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmICghcmVzcG9uc2U/LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBjaGVja1BhZ2VTdGF0dXMoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB3aW5kb3cuY2xvc2UoKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCB7XG4gICAgICAgICAgICBhd2FpdCBjaHJvbWUudGFicy5yZWxvYWQoYWN0aXZlVGFiSWQpO1xuICAgICAgICAgICAgd2luZG93LmNsb3NlKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgYXN5bmMgZnVuY3Rpb24gaGFuZGxlUmVmcmVzaFRhYigpIHtcbiAgICAgICAgaWYgKCFhY3RpdmVUYWJJZClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgYXdhaXQgY2hyb21lLnRhYnMucmVsb2FkKGFjdGl2ZVRhYklkKTtcbiAgICAgICAgd2luZG93LmNsb3NlKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlc29sdmVzIHRoZSBjb25maWd1cmVkIFNsb3RoaW5nIEFQSSBiYXNlIFVSTCwgcHJlZmVycmluZyB0aGUgdmFsdWUgd2VcbiAgICAgKiBjYWNoZWQgYXQgZmlyc3QgcGFpbnQgKGBhcGlCYXNlVXJsYCkgYW5kIGZhbGxpbmcgYmFjayB0byBhIGZyZXNoXG4gICAgICogR0VUX0FVVEhfU1RBVFVTIHJvdW5kdHJpcCBpZiB3ZSBoYXZlbid0IHNlZW4gb25lIHlldC4gVXNlZCBieSBhbGwgdGhlXG4gICAgICogZGVlcC1saW5rIGhhbmRsZXJzICgjMzEpLlxuICAgICAqL1xuICAgIGFzeW5jIGZ1bmN0aW9uIHJlc29sdmVBcGlCYXNlVXJsKCkge1xuICAgICAgICBpZiAoYXBpQmFzZVVybClcbiAgICAgICAgICAgIHJldHVybiBhcGlCYXNlVXJsO1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHNlbmRNZXNzYWdlKE1lc3NhZ2VzLmdldEF1dGhTdGF0dXMoKSk7XG4gICAgICAgIGNvbnN0IGRhdGEgPSByZXNwb25zZS5kYXRhO1xuICAgICAgICByZXR1cm4gZGF0YT8uYXBpQmFzZVVybCB8fCBERUZBVUxUX0FQSV9CQVNFX1VSTDtcbiAgICB9XG4gICAgLyoqIE9wZW5zIHRoZSByZXZpZXcgcXVldWUgZm9yIHRoZSB1c2VyIHRvIHRyaWFnZSB0aGVpciBidWxrIGltcG9ydHMuICgjMzEpICovXG4gICAgYXN5bmMgZnVuY3Rpb24gaGFuZGxlVmlld1Jldmlld1F1ZXVlKCkge1xuICAgICAgICBjb25zdCBiYXNlVXJsID0gYXdhaXQgcmVzb2x2ZUFwaUJhc2VVcmwoKTtcbiAgICAgICAgY2hyb21lLnRhYnMuY3JlYXRlKHsgdXJsOiBvcHBvcnR1bml0eVJldmlld1VybChiYXNlVXJsKSB9KTtcbiAgICAgICAgd2luZG93LmNsb3NlKCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHByb2ZpbGVJbml0aWFsKCkge1xuICAgICAgICBjb25zdCBuYW1lID0gcHJvZmlsZT8uY29udGFjdD8ubmFtZT8udHJpbSgpO1xuICAgICAgICBpZiAobmFtZSlcbiAgICAgICAgICAgIHJldHVybiBuYW1lLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpO1xuICAgICAgICBjb25zdCBlbWFpbCA9IHByb2ZpbGU/LmNvbnRhY3Q/LmVtYWlsO1xuICAgICAgICByZXR1cm4gZW1haWwgPyBlbWFpbC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSA6IFwiU1wiO1xuICAgIH1cbiAgICBmdW5jdGlvbiBzdXBwb3J0ZWRUYWJMYWJlbCgpIHtcbiAgICAgICAgY29uc3QgdXJsID0gc3VyZmFjZUNvbnRleHQ/LnRhYi51cmwgfHwgYWN0aXZlVGFiVXJsIHx8IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKCF1cmwgfHwgIWhhc0NvbnRlbnRTY3JpcHRIb3N0KHVybCkpXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgaWYgKC93YXRlcmxvb3dvcmtzXFwudXdhdGVybG9vXFwuY2EvLnRlc3QodXJsKSlcbiAgICAgICAgICAgIHJldHVybiBcIldhdGVybG9vV29ya3NcIjtcbiAgICAgICAgaWYgKC9saW5rZWRpblxcLmNvbS8udGVzdCh1cmwpKVxuICAgICAgICAgICAgcmV0dXJuIFwiTGlua2VkSW5cIjtcbiAgICAgICAgaWYgKC9pbmRlZWRcXC5jb20vLnRlc3QodXJsKSlcbiAgICAgICAgICAgIHJldHVybiBcIkluZGVlZFwiO1xuICAgICAgICBpZiAoL2dyZWVuaG91c2VcXC5pby8udGVzdCh1cmwpKVxuICAgICAgICAgICAgcmV0dXJuIFwiR3JlZW5ob3VzZVwiO1xuICAgICAgICBpZiAoL2xldmVyXFwuY28vLnRlc3QodXJsKSlcbiAgICAgICAgICAgIHJldHVybiBcIkxldmVyXCI7XG4gICAgICAgIGlmICgvd29ya2RheWpvYnNcXC5jb20vLnRlc3QodXJsKSlcbiAgICAgICAgICAgIHJldHVybiBcIldvcmtkYXlcIjtcbiAgICAgICAgcmV0dXJuIFwidGhpcyBqb2Igc2l0ZVwiO1xuICAgIH1cbiAgICBmdW5jdGlvbiBzaWduZWRPdXRDb250ZXh0Q29weSgpIHtcbiAgICAgICAgY29uc3Qgc2l0ZSA9IHN1cHBvcnRlZFRhYkxhYmVsKCk7XG4gICAgICAgIGlmICh3d1N0YXRlPy5raW5kID09PSBcImxpc3RcIikge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogXCJXYXRlcmxvb1dvcmtzIGpvYnMgZm91bmRcIixcbiAgICAgICAgICAgICAgICBib2R5OiBgQ29ubmVjdCBTbG90aGluZyB0byBpbXBvcnQgYW5kIHRyYWNrIHRoZXNlICR7d3dTdGF0ZS5yb3dDb3VudH0gcG9zdGluZ3MuYCxcbiAgICAgICAgICAgICAgICBzaXRlOiBcIldhdGVybG9vV29ya3NcIixcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBhZ2VTdGF0dXM/LnNjcmFwZWRKb2IpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IFwiSm9iIGRldGVjdGVkXCIsXG4gICAgICAgICAgICAgICAgYm9keTogXCJDb25uZWN0IFNsb3RoaW5nIHRvIHRhaWxvciwgc2F2ZSwgYW5kIGF1dG9maWxsIGZyb20gdGhpcyBwb3N0aW5nLlwiLFxuICAgICAgICAgICAgICAgIHNpdGUsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGlmIChwYWdlU3RhdHVzPy5oYXNGb3JtKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBcIkFwcGxpY2F0aW9uIHBhZ2UgZGV0ZWN0ZWRcIixcbiAgICAgICAgICAgICAgICBib2R5OiBcIkNvbm5lY3QgU2xvdGhpbmcgdG8gYXV0b2ZpbGwgdGhpcyBhcHBsaWNhdGlvbiBmcm9tIHlvdXIgcHJvZmlsZS5cIixcbiAgICAgICAgICAgICAgICBzaXRlLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2l0ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogYCR7c2l0ZX0gaXMgc3VwcG9ydGVkYCxcbiAgICAgICAgICAgICAgICBib2R5OiBcIkNvbm5lY3QgU2xvdGhpbmcgdG8gc2NhbiBqb2JzLCBpbXBvcnQgcG9zdGluZ3MsIGFuZCBvcGVuIGpvYiB0b29scyBoZXJlLlwiLFxuICAgICAgICAgICAgICAgIHNpdGUsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAodmlld1N0YXRlID09PSBcImxvYWRpbmdcIikge1xuICAgICAgICByZXR1cm4gKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicG9wdXBcIiwgY2hpbGRyZW46IF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInN0YXRlLWNlbnRlclwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwic3Bpbm5lclwiIH0pLCBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJzdGF0ZS10ZXh0XCIsIGNoaWxkcmVuOiBcIkNvbm5lY3RpbmdcXHUyMDI2XCIgfSldIH0pIH0pKTtcbiAgICB9XG4gICAgaWYgKHZpZXdTdGF0ZSA9PT0gXCJlcnJvclwiKSB7XG4gICAgICAgIHJldHVybiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJwb3B1cFwiLCBjaGlsZHJlbjogX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwic3RhdGUtY2VudGVyXCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJzdGF0ZS1pY29uIGVycm9yXCIsIFwiYXJpYS1oaWRkZW5cIjogdHJ1ZSwgY2hpbGRyZW46IFwiIVwiIH0pLCBfanN4KFwiaDJcIiwgeyBjbGFzc05hbWU6IFwic3RhdGUtdGl0bGVcIiwgY2hpbGRyZW46IFwiU29tZXRoaW5nIHdlbnQgd3JvbmdcIiB9KSwgX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwic3RhdGUtdGV4dFwiLCBjaGlsZHJlbjogZXJyb3IgfSksIF9qc3goXCJidXR0b25cIiwgeyBjbGFzc05hbWU6IFwiYnRuIHByaW1hcnlcIiwgb25DbGljazogKCkgPT4gY2hlY2tBdXRoU3RhdHVzKCksIGNoaWxkcmVuOiBcIlRyeSBhZ2FpblwiIH0pXSB9KSB9KSk7XG4gICAgfVxuICAgIGlmICh2aWV3U3RhdGUgPT09IFwidW5hdXRoZW50aWNhdGVkXCIpIHtcbiAgICAgICAgY29uc3QgY29udGV4dENvcHkgPSBzaWduZWRPdXRDb250ZXh0Q29weSgpO1xuICAgICAgICByZXR1cm4gKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicG9wdXBcIiwgY2hpbGRyZW46IF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBgaGVybyAke2NvbnRleHRDb3B5ID8gXCJjb250ZXh0dWFsXCIgOiBcIlwifWAsIGNoaWxkcmVuOiBbX2pzeChcImltZ1wiLCB7IGNsYXNzTmFtZTogXCJoZXJvLW1hcmtcIiwgc3JjOiBjaHJvbWUucnVudGltZS5nZXRVUkwoXCJicmFuZC9zbG90aGluZy1tYXJrLnBuZ1wiKSwgYWx0OiBcIlwiIH0pLCBjb250ZXh0Q29weT8uc2l0ZSAmJiAoX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwiaGVyby1raWNrZXJcIiwgY2hpbGRyZW46IGNvbnRleHRDb3B5LnNpdGUgfSkpLCBfanN4KFwiaDFcIiwgeyBjbGFzc05hbWU6IFwiaGVyby10aXRsZVwiLCBjaGlsZHJlbjogY29udGV4dENvcHk/LnRpdGxlIHx8IFwiU2xvdGhpbmdcIiB9KSwgX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwiaGVyby1zdWJcIiwgY2hpbGRyZW46IGNvbnRleHRDb3B5Py5ib2R5IHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJBdXRvLWZpbGwgYXBwbGljYXRpb25zLiBJbXBvcnQgam9icy4gVHJhY2sgZXZlcnl0aGluZy5cIiB9KSwgX2pzeChcImJ1dHRvblwiLCB7IGNsYXNzTmFtZTogXCJidG4gcHJpbWFyeSBibG9ja1wiLCBvbkNsaWNrOiBoYW5kbGVDb25uZWN0LCBjaGlsZHJlbjogY29udGV4dENvcHkgPyBcIkNvbm5lY3QgdG8gdXNlIGpvYiB0b29sc1wiIDogXCJDb25uZWN0IGFjY291bnRcIiB9KSwgX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwiaGVyby1mb290XCIsIGNoaWxkcmVuOiBcIllvdSdsbCBzaWduIGluIG9uY2UgXFx1MjAxNCBTbG90aGluZyByZW1lbWJlcnMuXCIgfSldIH0pIH0pKTtcbiAgICB9XG4gICAgaWYgKHZpZXdTdGF0ZSA9PT0gXCJzZXNzaW9uLWxvc3RcIikge1xuICAgICAgICBjb25zdCBjb250ZXh0Q29weSA9IHNpZ25lZE91dENvbnRleHRDb3B5KCk7XG4gICAgICAgIHJldHVybiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJwb3B1cFwiLCBjaGlsZHJlbjogX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IGBoZXJvIHNlc3Npb24tbG9zdCAke2NvbnRleHRDb3B5ID8gXCJjb250ZXh0dWFsXCIgOiBcIlwifWAsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJoZXJvLW1hcmsgd2FyblwiLCBcImFyaWEtaGlkZGVuXCI6IHRydWUsIGNoaWxkcmVuOiBcIiFcIiB9KSwgY29udGV4dENvcHk/LnNpdGUgJiYgKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcImhlcm8ta2lja2VyXCIsIGNoaWxkcmVuOiBjb250ZXh0Q29weS5zaXRlIH0pKSwgX2pzeChcImgxXCIsIHsgY2xhc3NOYW1lOiBcImhlcm8tdGl0bGVcIiwgY2hpbGRyZW46IFwiU2Vzc2lvbiBsb3N0XCIgfSksIF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcImhlcm8tc3ViXCIsIGNoaWxkcmVuOiBjb250ZXh0Q29weVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gXCJSZWNvbm5lY3QgdG8gdXNlIFNsb3RoaW5nIGpvYiB0b29scyBvbiB0aGlzIHBhZ2UuXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFwiU2xvdGhpbmcgZ290IHJlc2V0IGJ5IHlvdXIgYnJvd3Nlci4gUmVjb25uZWN0IHRvIHBpY2sgdXAgd2hlcmUgeW91IGxlZnQgb2ZmIOKAlCB5b3VyIHByb2ZpbGUgYW5kIGRhdGEgYXJlIHNhZmUuXCIgfSksIF9qc3goXCJidXR0b25cIiwgeyBjbGFzc05hbWU6IFwiYnRuIHByaW1hcnkgYmxvY2tcIiwgb25DbGljazogaGFuZGxlQ29ubmVjdCwgY2hpbGRyZW46IFwiUmVjb25uZWN0XCIgfSksIF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcImhlcm8tZm9vdFwiLCBjaGlsZHJlbjogXCJUYWtlcyBhYm91dCBmaXZlIHNlY29uZHMuXCIgfSldIH0pIH0pKTtcbiAgICB9XG4gICAgY29uc3QgZGV0ZWN0ZWRKb2IgPSBwYWdlU3RhdHVzPy5zY3JhcGVkSm9iO1xuICAgIGNvbnN0IHN1cHBvcnRlZFNpdGUgPSBzdXBwb3J0ZWRUYWJMYWJlbCgpO1xuICAgIGNvbnN0IHdvcmtzcGFjZVZpc2libGUgPSAhIXN1cmZhY2VDb250ZXh0Py53b3Jrc3BhY2UudmlzaWJsZTtcbiAgICBjb25zdCBzaG93V3dCdWxrID0gd3dTdGF0ZSAmJiB3d1N0YXRlLmtpbmQgPT09IFwibGlzdFwiO1xuICAgIGNvbnN0IGRldGVjdGVkQnVsa1NvdXJjZXMgPSBPYmplY3Qua2V5cyhCVUxLX1NPVVJDRV9MQUJFTFMpLmZpbHRlcigoa2V5KSA9PiBidWxrU3RhdGVzW2tleV0/LmRldGVjdGVkKTtcbiAgICBjb25zdCBub3RoaW5nRGV0ZWN0ZWQgPSAhcGFnZVN0YXR1cz8uaGFzRm9ybSAmJlxuICAgICAgICAhZGV0ZWN0ZWRKb2IgJiZcbiAgICAgICAgIXNob3dXd0J1bGsgJiZcbiAgICAgICAgZGV0ZWN0ZWRCdWxrU291cmNlcy5sZW5ndGggPT09IDAgJiZcbiAgICAgICAgcGFnZVByb2JlU3RhdGUgIT09IFwibmVlZHMtcmVmcmVzaFwiICYmXG4gICAgICAgICFzdXBwb3J0ZWRTaXRlO1xuICAgIGNvbnN0IGhhc1BhZ2VTdGF0dXMgPSAhIWRldGVjdGVkSm9iIHx8ICEhcGFnZVN0YXR1cz8uaGFzRm9ybSB8fCBwYWdlUHJvYmVTdGF0ZSA9PT0gXCJyZWFkeVwiO1xuICAgIGNvbnN0IGN1cnJlbnRUYWJUaXRsZSA9IHdvcmtzcGFjZVZpc2libGVcbiAgICAgICAgPyBcIkpvYiB3b3Jrc3BhY2UgYWN0aXZlXCJcbiAgICAgICAgOiBkZXRlY3RlZEpvYlxuICAgICAgICAgICAgPyBcIkpvYiBkZXRlY3RlZFwiXG4gICAgICAgICAgICA6IHBhZ2VTdGF0dXM/Lmhhc0Zvcm1cbiAgICAgICAgICAgICAgICA/IFwiQXBwbGljYXRpb24gZGV0ZWN0ZWRcIlxuICAgICAgICAgICAgICAgIDogcGFnZVByb2JlU3RhdGUgPT09IFwicmVhZHlcIlxuICAgICAgICAgICAgICAgICAgICA/IFwiTm8gam9iIGRldGVjdGVkXCJcbiAgICAgICAgICAgICAgICAgICAgOiBcIlVuc3VwcG9ydGVkIHBhZ2VcIjtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInBvcHVwXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJoZWFkZXJcIiwgeyBjbGFzc05hbWU6IFwidG9wYmFyXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYnJhbmRcIiwgY2hpbGRyZW46IFtfanN4KFwiaW1nXCIsIHsgY2xhc3NOYW1lOiBcImJyYW5kLW1hcmtcIiwgc3JjOiBjaHJvbWUucnVudGltZS5nZXRVUkwoXCJicmFuZC9zbG90aGluZy1tYXJrLnBuZ1wiKSwgYWx0OiBcIlwiIH0pLCBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJicmFuZC1uYW1lXCIsIGNoaWxkcmVuOiBcIlNsb3RoaW5nXCIgfSldIH0pLCBfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwicGlsbCBva1wiLCB0aXRsZTogXCJFeHRlbnNpb24gY29ubmVjdGVkXCIsIGNoaWxkcmVuOiBbX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwicGlsbC1kb3RcIiB9KSwgXCJDb25uZWN0ZWRcIl0gfSldIH0pLCBfanN4cyhcInNlY3Rpb25cIiwgeyBjbGFzc05hbWU6IFwicHJvZmlsZS1jYXJkXCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJhdmF0YXJcIiwgY2hpbGRyZW46IHByb2ZpbGVJbml0aWFsKCkgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInByb2ZpbGUtbWV0YVwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicHJvZmlsZS1uYW1lXCIsIGNoaWxkcmVuOiBwcm9maWxlPy5jb250YWN0Py5uYW1lIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9maWxlPy5jb250YWN0Py5lbWFpbCB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJTZXQgdXAgeW91ciBwcm9maWxlXCIgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicHJvZmlsZS1zdWJcIiwgY2hpbGRyZW46IHByb2ZpbGU/LmNvbXB1dGVkPy5jdXJyZW50VGl0bGUgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2ZpbGU/LmNvbXB1dGVkPy5jdXJyZW50Q29tcGFueVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBgJHtwcm9maWxlLmNvbXB1dGVkLmN1cnJlbnRUaXRsZX0gwrcgJHtwcm9maWxlLmNvbXB1dGVkLmN1cnJlbnRDb21wYW55fWBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogcHJvZmlsZT8uY29udGFjdD8uZW1haWwgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkFkZCB5b3VyIHdvcmsgaGlzdG9yeSBzbyBTbG90aGluZyBjYW4gdGFpbG9yXCIgfSldIH0pLCBwcm9maWxlU2NvcmUgIT09IG51bGwgPyAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IGBzY29yZSAke3Byb2ZpbGVTY29yZSA+PSA4MCA/IFwiaGlnaFwiIDogcHJvZmlsZVNjb3JlID49IDUwID8gXCJtaWRcIiA6IFwibG93XCJ9YCwgdGl0bGU6IFwiUHJvZmlsZSBjb21wbGV0ZW5lc3NcIiwgY2hpbGRyZW46IFtfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJzY29yZS1udW1cIiwgY2hpbGRyZW46IHByb2ZpbGVTY29yZSB9KSwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwic2NvcmUtdW5pdFwiLCBjaGlsZHJlbjogXCIvMTAwXCIgfSldIH0pKSA6IChfanN4KFwiYnV0dG9uXCIsIHsgY2xhc3NOYW1lOiBcImJ0biBnaG9zdCB0aWdodFwiLCBvbkNsaWNrOiBoYW5kbGVPcGVuRGFzaGJvYXJkLCBjaGlsZHJlbjogXCJPcGVuXCIgfSkpXSB9KSwgX2pzeHMoXCJtYWluXCIsIHsgY2xhc3NOYW1lOiBcImNvbnRlbnRcIiwgY2hpbGRyZW46IFtwYWdlUHJvYmVTdGF0ZSA9PT0gXCJuZWVkcy1yZWZyZXNoXCIgJiYgKF9qc3hzKFwiYXJ0aWNsZVwiLCB7IGNsYXNzTmFtZTogXCJzdGF0dXMtY2FyZFwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInN0YXR1cy1jb3B5XCIsIGNoaWxkcmVuOiBbX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwic3RhdHVzLWV5ZWJyb3dcIiwgY2hpbGRyZW46IFwiQ3VycmVudCB0YWJcIiB9KSwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwic3RhdHVzLXRpdGxlXCIsIGNoaWxkcmVuOiBcIlBhZ2UgbmVlZHMgcmVmcmVzaFwiIH0pXSB9KSwgX2pzeChcImJ1dHRvblwiLCB7IGNsYXNzTmFtZTogXCJidG4gYmxvY2tcIiwgb25DbGljazogaGFuZGxlUmVmcmVzaFRhYiwgY2hpbGRyZW46IFwiUmVmcmVzaCB0YWJcIiB9KV0gfSkpLCBoYXNQYWdlU3RhdHVzICYmIChfanN4cyhcImFydGljbGVcIiwgeyBjbGFzc05hbWU6IFwic3RhdHVzLWNhcmQgYWN0aXZlXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJoZWFkZXJcIiwgeyBjbGFzc05hbWU6IFwic3RhdHVzLWhlYWRcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJzdGF0dXMtY29weVwiLCBjaGlsZHJlbjogW19qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInN0YXR1cy1leWVicm93XCIsIGNoaWxkcmVuOiBcIkN1cnJlbnQgdGFiXCIgfSksIF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInN0YXR1cy10aXRsZVwiLCBjaGlsZHJlbjogY3VycmVudFRhYlRpdGxlIH0pXSB9KSwgcGFnZVN0YXR1cz8uaGFzRm9ybSAmJiAoX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcImJhZGdlXCIsIGNoaWxkcmVuOiBbcGFnZVN0YXR1cy5kZXRlY3RlZEZpZWxkcywgXCIgZmllbGRzXCJdIH0pKV0gfSksIGRldGVjdGVkSm9iID8gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInBhZ2Utc3VtbWFyeVwiLCBjaGlsZHJlbjogW19qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcImNsaXBcIiwgdGl0bGU6IGRldGVjdGVkSm9iLnRpdGxlLCBjaGlsZHJlbjogZGV0ZWN0ZWRKb2IudGl0bGUgfSksIF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcImNhcmQtc3ViIGNsaXBcIiwgY2hpbGRyZW46IGRldGVjdGVkSm9iLmNvbXBhbnkgfSldIH0pKSA6IChfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJpbmxpbmUtbm90ZVwiLCBjaGlsZHJlbjogcGFnZVN0YXR1cz8uaGFzRm9ybVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBcIlJlYWR5IG9uIHRoaXMgYXBwbGljYXRpb24gcGFnZS5cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBcIk9wZW4gYSBqb2IgcG9zdGluZywgdGhlbiBzY2FuIGFnYWluLlwiIH0pKSwgKHBhZ2VTdGF0dXM/LmRldGVjdGVkVXBsb2FkQ291bnQgPz8gMCkgPiAwICYmIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJwYWdlLXN1bW1hcnlcIiwgY2hpbGRyZW46IFtfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJjbGlwXCIsIGNoaWxkcmVuOiBcIlJlc3VtZSB1cGxvYWQgZGV0ZWN0ZWQuIEF0dGFjaCB5b3VyIGZpbGUgbWFudWFsbHkuXCIgfSksIGxhdGVzdFJlc3VtZSA/IChfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwiY2FyZC1zdWIgY2xpcFwiLCB0aXRsZTogbGF0ZXN0UmVzdW1lLm5hbWUsIGNoaWxkcmVuOiBbXCJMYXRlc3Q6IFwiLCBsYXRlc3RSZXN1bWUubmFtZV0gfSkpIDogKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcImNhcmQtc3ViIGNsaXBcIiwgY2hpbGRyZW46IFwiT3BlbiBTdHVkaW8gdG8gZXhwb3J0IHlvdXIgbGF0ZXN0IGRvY3VtZW50LlwiIH0pKSwgX2pzeChcImJ1dHRvblwiLCB7IGNsYXNzTmFtZTogXCJidG4gYmxvY2tcIiwgb25DbGljazogaGFuZGxlT3BlblN0dWRpb0ZvclJlc3VtZSwgY2hpbGRyZW46IGxhdGVzdFJlc3VtZSA/IFwiT3BlbiBsYXRlc3QgcmVzdW1lXCIgOiBcIk9wZW4gU3R1ZGlvXCIgfSldIH0pKSwgZGV0ZWN0ZWRKb2IgJiYgKF9qc3goXCJidXR0b25cIiwgeyBjbGFzc05hbWU6IFwiYnRuIHByaW1hcnkgYmxvY2tcIiwgb25DbGljazogaGFuZGxlU2hvd1BhbmVsLCBjaGlsZHJlbjogXCJPcGVuIGpvYiB0b29sc1wiIH0pKSwgIWRldGVjdGVkSm9iICYmIHBhZ2VQcm9iZVN0YXRlID09PSBcInJlYWR5XCIgJiYgKF9qc3goXCJidXR0b25cIiwgeyBjbGFzc05hbWU6IFwiYnRuIGJsb2NrXCIsIG9uQ2xpY2s6ICgpID0+IGNoZWNrUGFnZVN0YXR1cygpLCBjaGlsZHJlbjogXCJTY2FuIGFnYWluXCIgfSkpXSB9KSksIHNob3dXd0J1bGsgJiYgd3dTdGF0ZSAmJiAoX2pzeChCdWxrU291cmNlQ2FyZCwgeyBzb3VyY2VMYWJlbDogXCJXYXRlcmxvb1dvcmtzXCIsIGRldGVjdGVkQ291bnQ6IHd3U3RhdGUucm93Q291bnQsIGJ1c3k6IHd3QnVsa0luRmxpZ2h0LCBsYXN0UmVzdWx0OiB3d0J1bGtSZXN1bHQsIGxhc3RFcnJvcjogd3dCdWxrRXJyb3IsIG9uU2NyYXBlVmlzaWJsZTogKCkgPT4gaGFuZGxlV3dCdWxrU2NyYXBlKFwidmlzaWJsZVwiKSwgb25TY3JhcGVQYWdpbmF0ZWQ6ICgpID0+IGhhbmRsZVd3QnVsa1NjcmFwZShcInBhZ2luYXRlZFwiKSwgb25WaWV3VHJhY2tlcjogaGFuZGxlVmlld1Jldmlld1F1ZXVlIH0pKSwgZGV0ZWN0ZWRCdWxrU291cmNlcy5tYXAoKGtleSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RhdGUgPSBidWxrU3RhdGVzW2tleV07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXN0YXRlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChfanN4KEJ1bGtTb3VyY2VDYXJkLCB7IHNvdXJjZUxhYmVsOiBCVUxLX1NPVVJDRV9MQUJFTFNba2V5XSwgZGV0ZWN0ZWRDb3VudDogc3RhdGUucm93Q291bnQsIGJ1c3k6IGJ1bGtJbkZsaWdodFtrZXldID8/IG51bGwsIGxhc3RSZXN1bHQ6IGJ1bGtSZXN1bHRzW2tleV0gPz8gbnVsbCwgbGFzdEVycm9yOiBidWxrRXJyb3JzW2tleV0gPz8gbnVsbCwgb25TY3JhcGVWaXNpYmxlOiAoKSA9PiBoYW5kbGVCdWxrU291cmNlU2NyYXBlKGtleSwgXCJ2aXNpYmxlXCIpLCBvblNjcmFwZVBhZ2luYXRlZDogKCkgPT4gaGFuZGxlQnVsa1NvdXJjZVNjcmFwZShrZXksIFwicGFnaW5hdGVkXCIpLCBvblZpZXdUcmFja2VyOiBoYW5kbGVWaWV3UmV2aWV3UXVldWUgfSwga2V5KSk7XG4gICAgICAgICAgICAgICAgICAgIH0pLCBub3RoaW5nRGV0ZWN0ZWQgJiYgIWhhc1BhZ2VTdGF0dXMgJiYgKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImlkbGVcIiwgY2hpbGRyZW46IFtfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJpZGxlLXRpdGxlXCIsIGNoaWxkcmVuOiBcIlVuc3VwcG9ydGVkIHBhZ2VcIiB9KSwgX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwiaWRsZS1zdWJcIiwgY2hpbGRyZW46IFwiT3BlbiBhIHN1cHBvcnRlZCBqb2IgcG9zdGluZyBvciBhcHBsaWNhdGlvbiBwYWdlLlwiIH0pXSB9KSksICFoYXNQYWdlU3RhdHVzICYmICFub3RoaW5nRGV0ZWN0ZWQgJiYgc3VwcG9ydGVkU2l0ZSAmJiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiaWRsZVwiLCBjaGlsZHJlbjogW19qc3hzKFwicFwiLCB7IGNsYXNzTmFtZTogXCJpZGxlLXRpdGxlXCIsIGNoaWxkcmVuOiBbc3VwcG9ydGVkU2l0ZSwgXCIgaXMgc3VwcG9ydGVkXCJdIH0pLCBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJpZGxlLXN1YlwiLCBjaGlsZHJlbjogXCJTY2FubmluZyB0aGlzIHRhYiBmb3IgYSBqb2IgcG9zdGluZyBvciBhcHBsaWNhdGlvbiBmb3JtLlwiIH0pXSB9KSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInF1aWNrLXJvd1wiLCBjaGlsZHJlbjogW19qc3hzKFwiYnV0dG9uXCIsIHsgY2xhc3NOYW1lOiBcInF1aWNrXCIsIG9uQ2xpY2s6IGhhbmRsZU9wZW5EYXNoYm9hcmQsIGNoaWxkcmVuOiBbX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwicXVpY2staWNvblwiLCBcImFyaWEtaGlkZGVuXCI6IHRydWUsIGNoaWxkcmVuOiBcIlxcdTIxOTdcIiB9KSwgX2pzeChcInNwYW5cIiwgeyBjaGlsZHJlbjogXCJEYXNoYm9hcmRcIiB9KV0gfSksIF9qc3hzKFwiYnV0dG9uXCIsIHsgY2xhc3NOYW1lOiBcInF1aWNrXCIsIG9uQ2xpY2s6ICgpID0+IGNocm9tZS5ydW50aW1lLm9wZW5PcHRpb25zUGFnZSgpLCBjaGlsZHJlbjogW19qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInF1aWNrLWljb25cIiwgXCJhcmlhLWhpZGRlblwiOiB0cnVlLCBjaGlsZHJlbjogXCJcXHUyNjk5XCIgfSksIF9qc3goXCJzcGFuXCIsIHsgY2hpbGRyZW46IFwiU2V0dGluZ3NcIiB9KV0gfSldIH0pXSB9KSwgX2pzeHMoXCJmb290ZXJcIiwgeyBjbGFzc05hbWU6IFwiZm9vdGJhclwiLCBjaGlsZHJlbjogW19qc3goXCJidXR0b25cIiwgeyBjbGFzc05hbWU6IGBsaW5rICR7Y29uZmlybWluZ0xvZ291dCA/IFwid2FyblwiIDogXCJcIn1gLCBvbkNsaWNrOiBoYW5kbGVMb2dvdXQsIGNoaWxkcmVuOiBjb25maXJtaW5nTG9nb3V0ID8gXCJDbGljayBhZ2FpbiB0byBkaXNjb25uZWN0XCIgOiBcIkRpc2Nvbm5lY3RcIiB9KSwgcHJvZmlsZT8udXBkYXRlZEF0ICYmIChfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidXBkYXRlZFwiLCBjaGlsZHJlbjogW1wiU3luY2VkIFwiLCBmb3JtYXRSZWxhdGl2ZShwcm9maWxlLnVwZGF0ZWRBdCldIH0pKV0gfSldIH0pKTtcbn1cbiIsImltcG9ydCB7IGpzeCBhcyBfanN4IH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBjcmVhdGVSb290IH0gZnJvbSBcInJlYWN0LWRvbS9jbGllbnRcIjtcbmltcG9ydCBBcHAgZnJvbSBcIi4vQXBwXCI7XG5pbXBvcnQgXCIuL3N0eWxlcy5jc3NcIjtcbmNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicm9vdFwiKTtcbmlmIChjb250YWluZXIpIHtcbiAgICBjb25zdCByb290ID0gY3JlYXRlUm9vdChjb250YWluZXIpO1xuICAgIHJvb3QucmVuZGVyKF9qc3goUmVhY3QuU3RyaWN0TW9kZSwgeyBjaGlsZHJlbjogX2pzeChBcHAsIHt9KSB9KSk7XG59XG4iLCIvKipcbiAqIFVzZXItZmFjaW5nIGVycm9yIHN0cmluZyBtYXBwaW5nIGZvciB0aGUgU2xvdGhpbmcgZXh0ZW5zaW9uLlxuICpcbiAqIFRoZSBwb3B1cCAoYW5kIGFueSBvdGhlciBleHRlbnNpb24gc3VyZmFjZSkgc2hvdWxkIG5ldmVyIHNob3cgcmF3XG4gKiBgXCJSZXF1ZXN0IGZhaWxlZDogNTAzXCJgIC8gYFwiQXV0aGVudGljYXRpb24gZXhwaXJlZFwiYCBzdHJpbmdzLiBXcmFwIGFueVxuICogZXJyb3IgcGF0aCBpbiBgbWVzc2FnZUZvckVycm9yKGVycilgIHRvIGdldCBhbiBFbmdsaXNoIHNlbnRlbmNlIHNhZmVcbiAqIGZvciBlbmQtdXNlcnMuXG4gKlxuICogTWlycm9yIG9mIHRoZSBtZXNzYWdlIHRvbmUgdXNlZCBieSBgYXBwcy93ZWIvLi4uL2V4dGVuc2lvbi9jb25uZWN0L3BhZ2UudHN4YFxuICogYG1lc3NhZ2VGb3JTdGF0dXNgIOKAlCB0aGUgY29ubmVjdCBwYWdlIGtlZXBzIGl0cyBvd24gY29weSBiZWNhdXNlIGl0IHNpdHNcbiAqIGluc2lkZSB0aGUgbmV4dC1pbnRsIHRyZWUgKGRpZmZlcmVudCBwYWNrYWdlIGJvdW5kYXJ5KSwgYnV0IHRoZVxuICogdXNlci12aXNpYmxlIHN0cmluZ3Mgc2hvdWxkIHN0YXkgYWxpZ25lZC4gSWYgeW91IGNoYW5nZSBvbmUsIGNoYW5nZSBib3RoLlxuICpcbiAqIEVuZ2xpc2gtb25seSBieSBkZXNpZ246IHRoZSBleHRlbnNpb24gaXRzZWxmIGRvZXMgbm90IHVzZSBuZXh0LWludGwuXG4gKi9cbi8qKlxuICogTWFwcyBhbiBIVFRQIHN0YXR1cyBjb2RlIHRvIGEgaHVtYW4tZnJpZW5kbHkgbWVzc2FnZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1lc3NhZ2VGb3JTdGF0dXMoc3RhdHVzKSB7XG4gICAgaWYgKHN0YXR1cyA9PT0gNDAxIHx8IHN0YXR1cyA9PT0gNDAzKSB7XG4gICAgICAgIHJldHVybiBcIlNpZ24gaW4gZXhwaXJlZC4gUmVjb25uZWN0IHRoZSBleHRlbnNpb24uXCI7XG4gICAgfVxuICAgIGlmIChzdGF0dXMgPT09IDQyOSkge1xuICAgICAgICByZXR1cm4gXCJXZSdyZSByYXRlLWxpbWl0ZWQuIFRyeSBhZ2FpbiBpbiBhIG1pbnV0ZS5cIjtcbiAgICB9XG4gICAgaWYgKHN0YXR1cyA+PSA1MDApIHtcbiAgICAgICAgcmV0dXJuIFwiU2xvdGhpbmcgc2VydmVycyBhcmUgaGF2aW5nIGEgcHJvYmxlbS5cIjtcbiAgICB9XG4gICAgcmV0dXJuIFwiU29tZXRoaW5nIHdlbnQgd3JvbmcuIFBsZWFzZSB0cnkgYWdhaW4uXCI7XG59XG5leHBvcnQgZnVuY3Rpb24gcmV0cnlFeGhhdXN0ZWRNZXNzYWdlKCkge1xuICAgIHJldHVybiBcIlNsb3RoaW5nIGlzIHN0aWxsIG5vdCByZXNwb25kaW5nIGFmdGVyIHJldHJ5aW5nLiBUcnkgYWdhaW4gaW4gYSBtaW51dGUuXCI7XG59XG4vKipcbiAqIEJlc3QtZWZmb3J0IG1hcHBpbmcgb2YgYW4gdW5rbm93biB0aHJvd24gdmFsdWUgdG8gYSBodW1hbi1mcmllbmRseVxuICogbWVzc2FnZS4gUmVjb2duaXNlcyB0aGUgc3BlY2lmaWMgcGhyYXNlcyB0aGUgYXBpLWNsaWVudCB0aHJvd3MgdG9kYXlcbiAqIChgXCJBdXRoZW50aWNhdGlvbiBleHBpcmVkXCJgLCBgXCJOb3QgYXV0aGVudGljYXRlZFwiYCwgYFwiUmVxdWVzdCBmYWlsZWQ6IDxjb2RlPlwiYCxcbiAqIGBcIkZhaWxlZCB0byBmZXRjaFwiYCkgYW5kIGZhbGxzIGJhY2sgdG8gdGhlIG9yaWdpbmFsIG1lc3NhZ2UgZm9yIGFueXRoaW5nXG4gKiBlbHNlIOKAlCB0aGF0J3MgYWxtb3N0IGFsd2F5cyBtb3JlIHVzZWZ1bCB0aGFuIGEgZ2VuZXJpYyBjYXRjaC1hbGwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtZXNzYWdlRm9yRXJyb3IoZXJyKSB7XG4gICAgLy8gR2VuZXJpYyBuZXR3b3JrIGZhaWx1cmUgKGZldGNoIGluIHNlcnZpY2Ugd29ya2VycyB0aHJvd3MgVHlwZUVycm9yIGhlcmUpXG4gICAgaWYgKGVyciBpbnN0YW5jZW9mIFR5cGVFcnJvcikge1xuICAgICAgICByZXR1cm4gXCJOZXR3b3JrIGVycm9yLiBDaGVjayB5b3VyIGNvbm5lY3Rpb24gYW5kIHRyeSBhZ2Fpbi5cIjtcbiAgICB9XG4gICAgY29uc3QgcmF3ID0gZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFwiXCI7XG4gICAgaWYgKCFyYXcpXG4gICAgICAgIHJldHVybiBcIlNvbWV0aGluZyB3ZW50IHdyb25nLiBQbGVhc2UgdHJ5IGFnYWluLlwiO1xuICAgIC8vIEF1dGgtc2hhcGVkIG1lc3NhZ2VzIGZyb20gU2xvdGhpbmdBUElDbGllbnQuXG4gICAgaWYgKHJhdyA9PT0gXCJBdXRoZW50aWNhdGlvbiBleHBpcmVkXCIgfHxcbiAgICAgICAgcmF3ID09PSBcIk5vdCBhdXRoZW50aWNhdGVkXCIgfHxcbiAgICAgICAgL3VuYXV0aG9yL2kudGVzdChyYXcpKSB7XG4gICAgICAgIHJldHVybiBtZXNzYWdlRm9yU3RhdHVzKDQwMSk7XG4gICAgfVxuICAgIC8vIGBSZXF1ZXN0IGZhaWxlZDogNTAzYCDigJQgcmVjb3ZlciB0aGUgc3RhdHVzIGNvZGUuXG4gICAgY29uc3QgbWF0Y2ggPSByYXcubWF0Y2goL1JlcXVlc3QgZmFpbGVkOlxccyooXFxkezN9KS8pO1xuICAgIGlmIChtYXRjaCkge1xuICAgICAgICBjb25zdCBjb2RlID0gTnVtYmVyKG1hdGNoWzFdKTtcbiAgICAgICAgaWYgKE51bWJlci5pc0Zpbml0ZShjb2RlKSlcbiAgICAgICAgICAgIHJldHVybiBtZXNzYWdlRm9yU3RhdHVzKGNvZGUpO1xuICAgIH1cbiAgICBjb25zdCByZXRyeU1hdGNoID0gcmF3Lm1hdGNoKC9SZXF1ZXN0IHN0aWxsIGZhaWxpbmcgYWZ0ZXIgcmV0cnk6XFxzKihcXGR7M30pLyk7XG4gICAgaWYgKHJldHJ5TWF0Y2gpIHtcbiAgICAgICAgcmV0dXJuIHJldHJ5RXhoYXVzdGVkTWVzc2FnZSgpO1xuICAgIH1cbiAgICAvLyBCcm93c2VyIGZldGNoIGZhaWx1cmVzIGJ1YmJsZSB1cCBhcyBcIkZhaWxlZCB0byBmZXRjaFwiLlxuICAgIGlmICgvZmFpbGVkIHRvIGZldGNoL2kudGVzdChyYXcpIHx8IC9uZXR3b3JrL2kudGVzdChyYXcpKSB7XG4gICAgICAgIHJldHVybiBcIk5ldHdvcmsgZXJyb3IuIENoZWNrIHlvdXIgY29ubmVjdGlvbiBhbmQgdHJ5IGFnYWluLlwiO1xuICAgIH1cbiAgICAvLyBGb3IgYW55dGhpbmcgZWxzZSwgdGhlIHVuZGVybHlpbmcgbWVzc2FnZSBpcyB1c3VhbGx5IGEgc2VudGVuY2UgYWxyZWFkeVxuICAgIC8vIChlLmcuIFwiQ291bGRuJ3QgcmVhZCB0aGUgZnVsbCBqb2IgZGVzY3JpcHRpb24gZnJvbSB0aGlzIHBhZ2UuXCIpLlxuICAgIHJldHVybiByYXc7XG59XG4iLCIvLyBNZXNzYWdlIHBhc3NpbmcgdXRpbGl0aWVzIGZvciBleHRlbnNpb24gY29tbXVuaWNhdGlvblxuLy8gVHlwZS1zYWZlIG1lc3NhZ2UgY3JlYXRvcnNcbmV4cG9ydCBjb25zdCBNZXNzYWdlcyA9IHtcbiAgICAvLyBBdXRoIG1lc3NhZ2VzXG4gICAgZ2V0QXV0aFN0YXR1czogKCkgPT4gKHsgdHlwZTogXCJHRVRfQVVUSF9TVEFUVVNcIiB9KSxcbiAgICBnZXRTdXJmYWNlQ29udGV4dDogKCkgPT4gKHsgdHlwZTogXCJHRVRfU1VSRkFDRV9DT05URVhUXCIgfSksXG4gICAgb3BlbkF1dGg6ICgpID0+ICh7IHR5cGU6IFwiT1BFTl9BVVRIXCIgfSksXG4gICAgbG9nb3V0OiAoKSA9PiAoeyB0eXBlOiBcIkxPR09VVFwiIH0pLFxuICAgIC8vIFByb2ZpbGUgbWVzc2FnZXNcbiAgICBnZXRQcm9maWxlOiAoKSA9PiAoeyB0eXBlOiBcIkdFVF9QUk9GSUxFXCIgfSksXG4gICAgZ2V0U2V0dGluZ3M6ICgpID0+ICh7IHR5cGU6IFwiR0VUX1NFVFRJTkdTXCIgfSksXG4gICAgLy8gRm9ybSBmaWxsaW5nIG1lc3NhZ2VzXG4gICAgZmlsbEZvcm06IChmaWVsZHMpID0+ICh7XG4gICAgICAgIHR5cGU6IFwiRklMTF9GT1JNXCIsXG4gICAgICAgIHBheWxvYWQ6IGZpZWxkcyxcbiAgICB9KSxcbiAgICAvLyBTY3JhcGluZyBtZXNzYWdlc1xuICAgIHNjcmFwZUpvYjogKCkgPT4gKHsgdHlwZTogXCJTQ1JBUEVfSk9CXCIgfSksXG4gICAgc2NyYXBlSm9iTGlzdDogKCkgPT4gKHsgdHlwZTogXCJTQ1JBUEVfSk9CX0xJU1RcIiB9KSxcbiAgICBpbXBvcnRKb2I6IChqb2IpID0+ICh7XG4gICAgICAgIHR5cGU6IFwiSU1QT1JUX0pPQlwiLFxuICAgICAgICBwYXlsb2FkOiBqb2IsXG4gICAgfSksXG4gICAgaW1wb3J0Sm9ic0JhdGNoOiAoam9icykgPT4gKHtcbiAgICAgICAgdHlwZTogXCJJTVBPUlRfSk9CU19CQVRDSFwiLFxuICAgICAgICBwYXlsb2FkOiBqb2JzLFxuICAgIH0pLFxuICAgIHRyYWNrQXBwbGllZDogKHBheWxvYWQpID0+ICh7XG4gICAgICAgIHR5cGU6IFwiVFJBQ0tfQVBQTElFRFwiLFxuICAgICAgICBwYXlsb2FkLFxuICAgIH0pLFxuICAgIG9wZW5EYXNoYm9hcmQ6ICgpID0+ICh7IHR5cGU6IFwiT1BFTl9EQVNIQk9BUkRcIiB9KSxcbiAgICBjYXB0dXJlVmlzaWJsZVRhYjogKCkgPT4gKHsgdHlwZTogXCJDQVBUVVJFX1ZJU0lCTEVfVEFCXCIgfSksXG4gICAgdGFpbG9yRnJvbVBhZ2U6IChqb2IsIGJhc2VSZXN1bWVJZCkgPT4gKHtcbiAgICAgICAgdHlwZTogXCJUQUlMT1JfRlJPTV9QQUdFXCIsXG4gICAgICAgIHBheWxvYWQ6IHsgam9iLCBiYXNlUmVzdW1lSWQgfSxcbiAgICB9KSxcbiAgICBnZW5lcmF0ZUNvdmVyTGV0dGVyRnJvbVBhZ2U6IChqb2IpID0+ICh7XG4gICAgICAgIHR5cGU6IFwiR0VORVJBVEVfQ09WRVJfTEVUVEVSX0ZST01fUEFHRVwiLFxuICAgICAgICBwYXlsb2FkOiBqb2IsXG4gICAgfSksXG4gICAgLyoqICMzNCDigJQgZmV0Y2ggdGhlIHVzZXIncyByZWNlbnRseS1zYXZlZCB0YWlsb3JlZCByZXN1bWVzIGZvciB0aGUgcGlja2VyLiAqL1xuICAgIGxpc3RSZXN1bWVzOiAoKSA9PiAoeyB0eXBlOiBcIkxJU1RfUkVTVU1FU1wiIH0pLFxuICAgIC8vIExlYXJuaW5nIG1lc3NhZ2VzXG4gICAgc2F2ZUFuc3dlcjogKGRhdGEpID0+ICh7XG4gICAgICAgIHR5cGU6IFwiU0FWRV9BTlNXRVJcIixcbiAgICAgICAgcGF5bG9hZDogZGF0YSxcbiAgICB9KSxcbiAgICBzZWFyY2hBbnN3ZXJzOiAocXVlc3Rpb24pID0+ICh7XG4gICAgICAgIHR5cGU6IFwiU0VBUkNIX0FOU1dFUlNcIixcbiAgICAgICAgcGF5bG9hZDogcXVlc3Rpb24sXG4gICAgfSksXG4gICAgbWF0Y2hBbnN3ZXJCYW5rOiAocGF5bG9hZCkgPT4gKHtcbiAgICAgICAgdHlwZTogXCJNQVRDSF9BTlNXRVJfQkFOS1wiLFxuICAgICAgICBwYXlsb2FkLFxuICAgIH0pLFxuICAgIGpvYkRldGVjdGVkOiAobWV0YSkgPT4gKHtcbiAgICAgICAgdHlwZTogXCJKT0JfREVURUNURURcIixcbiAgICAgICAgcGF5bG9hZDogbWV0YSxcbiAgICB9KSxcbiAgICAvLyBXYXRlcmxvb1dvcmtzLXNwZWNpZmljIGJ1bGsgc2NyYXBpbmcgKGRyaXZlbiBmcm9tIHBvcHVwLCBleGVjdXRlZCBpbiBjb250ZW50XG4gICAgLy8gc2NyaXB0IGJ5IHdhdGVybG9vLXdvcmtzLW9yY2hlc3RyYXRvci50cykuXG4gICAgd3dTY3JhcGVBbGxWaXNpYmxlOiAoKSA9PiAoe1xuICAgICAgICB0eXBlOiBcIldXX1NDUkFQRV9BTExfVklTSUJMRVwiLFxuICAgIH0pLFxuICAgIHd3U2NyYXBlQWxsUGFnaW5hdGVkOiAob3B0cykgPT4gKHtcbiAgICAgICAgdHlwZTogXCJXV19TQ1JBUEVfQUxMX1BBR0lOQVRFRFwiLFxuICAgICAgICBwYXlsb2FkOiBvcHRzID8/IHt9LFxuICAgIH0pLFxuICAgIHd3R2V0UGFnZVN0YXRlOiAoKSA9PiAoeyB0eXBlOiBcIldXX0dFVF9QQUdFX1NUQVRFXCIgfSksXG4gICAgLy8gUDMvIzM5IOKAlCBCdWxrIHNjcmFwaW5nIGZvciBwdWJsaWMgQVRTIGJvYXJkIGhvc3RzLiBQb3B1cCDihpIgY29udGVudC1zY3JpcHQuXG4gICAgLy8gRWFjaCBwYWlyIG1pcnJvcnMgdGhlIFdXIHNoYXBlIHNvIHRoZSBzYW1lIGBCdWxrU291cmNlQ2FyZGAgVVggY2FuIGRyaXZlXG4gICAgLy8gZXZlcnkgc291cmNlLiBFYWNoIG9yY2hlc3RyYXRvciBjYXBzIGF0IDIwMC9zZXNzaW9uIChvdmVycmlkYWJsZSBiZWxvdykuXG4gICAgYnVsa0dyZWVuaG91c2VHZXRQYWdlU3RhdGU6ICgpID0+ICh7XG4gICAgICAgIHR5cGU6IFwiQlVMS19HUkVFTkhPVVNFX0dFVF9QQUdFX1NUQVRFXCIsXG4gICAgfSksXG4gICAgYnVsa0dyZWVuaG91c2VTY3JhcGVWaXNpYmxlOiAoKSA9PiAoe1xuICAgICAgICB0eXBlOiBcIkJVTEtfR1JFRU5IT1VTRV9TQ1JBUEVfVklTSUJMRVwiLFxuICAgIH0pLFxuICAgIGJ1bGtHcmVlbmhvdXNlU2NyYXBlUGFnaW5hdGVkOiAob3B0cykgPT4gKHtcbiAgICAgICAgdHlwZTogXCJCVUxLX0dSRUVOSE9VU0VfU0NSQVBFX1BBR0lOQVRFRFwiLFxuICAgICAgICBwYXlsb2FkOiBvcHRzID8/IHt9LFxuICAgIH0pLFxuICAgIGJ1bGtMZXZlckdldFBhZ2VTdGF0ZTogKCkgPT4gKHtcbiAgICAgICAgdHlwZTogXCJCVUxLX0xFVkVSX0dFVF9QQUdFX1NUQVRFXCIsXG4gICAgfSksXG4gICAgYnVsa0xldmVyU2NyYXBlVmlzaWJsZTogKCkgPT4gKHtcbiAgICAgICAgdHlwZTogXCJCVUxLX0xFVkVSX1NDUkFQRV9WSVNJQkxFXCIsXG4gICAgfSksXG4gICAgYnVsa0xldmVyU2NyYXBlUGFnaW5hdGVkOiAob3B0cykgPT4gKHtcbiAgICAgICAgdHlwZTogXCJCVUxLX0xFVkVSX1NDUkFQRV9QQUdJTkFURURcIixcbiAgICAgICAgcGF5bG9hZDogb3B0cyA/PyB7fSxcbiAgICB9KSxcbiAgICBidWxrV29ya2RheUdldFBhZ2VTdGF0ZTogKCkgPT4gKHtcbiAgICAgICAgdHlwZTogXCJCVUxLX1dPUktEQVlfR0VUX1BBR0VfU1RBVEVcIixcbiAgICB9KSxcbiAgICBidWxrV29ya2RheVNjcmFwZVZpc2libGU6ICgpID0+ICh7XG4gICAgICAgIHR5cGU6IFwiQlVMS19XT1JLREFZX1NDUkFQRV9WSVNJQkxFXCIsXG4gICAgfSksXG4gICAgYnVsa1dvcmtkYXlTY3JhcGVQYWdpbmF0ZWQ6IChvcHRzKSA9PiAoe1xuICAgICAgICB0eXBlOiBcIkJVTEtfV09SS0RBWV9TQ1JBUEVfUEFHSU5BVEVEXCIsXG4gICAgICAgIHBheWxvYWQ6IG9wdHMgPz8ge30sXG4gICAgfSksXG4gICAgLy8gUDQvIzQwIOKAlCBIZWxwZXIgZm9yIHRoZSBjaGF0LXBvcnQgc3RhcnQgZnJhbWUuIFRoZSBhY3R1YWwgc3RyZWFtIHVzZXMgYVxuICAgIC8vIGxvbmctbGl2ZWQgY2hyb21lLnJ1bnRpbWUuY29ubmVjdCBwb3J0IChDSEFUX1BPUlRfTkFNRSkgcmF0aGVyIHRoYW5cbiAgICAvLyBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSwgYnV0IGV4cG9zaW5nIGEgdHlwZWQgYnVpbGRlciBrZWVwcyBjYWxsc2l0ZXNcbiAgICAvLyBzZWxmLWRvY3VtZW50aW5nLlxuICAgIGNoYXRTdHJlYW1TdGFydDogKHBheWxvYWQpID0+ICh7XG4gICAgICAgIHR5cGU6IFwiQ0hBVF9TVFJFQU1fU1RBUlRcIixcbiAgICAgICAgcHJvbXB0OiBwYXlsb2FkLnByb21wdCxcbiAgICAgICAgam9iQ29udGV4dDogcGF5bG9hZC5qb2JDb250ZXh0LFxuICAgIH0pLFxuICAgIC8vIENvcnJlY3Rpb25zIGZlZWRiYWNrIGxvb3AgKCMzMykuIEZpcmVkIHdoZW4gYSB1c2VyIGVkaXRzIGFuIGF1dG9maWxsZWRcbiAgICAvLyBmaWVsZCBhbmQgdGhlIGZpbmFsIHZhbHVlIGRpZmZlcnMgZnJvbSB0aGUgb3JpZ2luYWwgc3VnZ2VzdGlvbiDigJQgdGhlXG4gICAgLy8gYmFja2dyb3VuZCBmb3J3YXJkcyBpdCB0byAvYXBpL2V4dGVuc2lvbi9maWVsZC1tYXBwaW5ncy9jb3JyZWN0IHNvXG4gICAgLy8gZnV0dXJlIGF1dG9maWxscyBvbiB0aGUgc2FtZSBkb21haW4gcHJlZmVyIHRoZSBjb3JyZWN0ZWQgdmFsdWUuXG4gICAgc2F2ZUNvcnJlY3Rpb246IChwYXlsb2FkKSA9PiAoe1xuICAgICAgICB0eXBlOiBcIlNBVkVfQ09SUkVDVElPTlwiLFxuICAgICAgICBwYXlsb2FkLFxuICAgIH0pLFxuICAgIC8vIFAzIC8gIzM2ICMzNyDigJQgbXVsdGktc3RlcCBmb3JtIHN1cHBvcnQgKFdvcmtkYXksIEdyZWVuaG91c2UpLlxuICAgIC8qKiBCYWNrZ3JvdW5kIOKGkiBjb250ZW50OiBhIHN0ZXAgdHJhbnNpdGlvbiBqdXN0IGZpcmVkIGZvciB0aGlzIHRhYi4gKi9cbiAgICBtdWx0aXN0ZXBTdGVwVHJhbnNpdGlvbjogKHBheWxvYWQpID0+ICh7XG4gICAgICAgIHR5cGU6IFwiTVVMVElTVEVQX1NURVBfVFJBTlNJVElPTlwiLFxuICAgICAgICBwYXlsb2FkLFxuICAgIH0pLFxuICAgIC8qKiBDb250ZW50IOKGkiBiYWNrZ3JvdW5kOiByZXR1cm4gdGhlIGN1cnJlbnQgdGFiIGlkLiAqL1xuICAgIGdldFRhYklkOiAoKSA9PiAoeyB0eXBlOiBcIkdFVF9UQUJfSURcIiB9KSxcbiAgICAvKipcbiAgICAgKiBDb250ZW50IOKGkiBiYWNrZ3JvdW5kOiBlbnN1cmUgdGhlIGB3ZWJOYXZpZ2F0aW9uYCBwZXJtaXNzaW9uIGlzIGdyYW50ZWQuXG4gICAgICogSW4gQ2hyb21lIE1WMyBpdCdzIGRlY2xhcmVkIGF0IGluc3RhbGwgdGltZSBhbmQgdGhlIHJlc3BvbnNlIGlzIGFsd2F5c1xuICAgICAqIGB7IGdyYW50ZWQ6IHRydWUgfWAuIEluIEZpcmVmb3ggTVYyIHRoZSBiYWNrZ3JvdW5kIGNhbGxzXG4gICAgICogYGJyb3dzZXIucGVybWlzc2lvbnMucmVxdWVzdCguLi4pYCBhbmQgcmV0dXJucyB0aGUgdXNlcidzIHZlcmRpY3QuXG4gICAgICovXG4gICAgcmVxdWVzdFdlYk5hdmlnYXRpb25QZXJtaXNzaW9uOiAoKSA9PiAoe1xuICAgICAgICB0eXBlOiBcIlJFUVVFU1RfV0VCTkFWSUdBVElPTl9QRVJNSVNTSU9OXCIsXG4gICAgfSksXG4gICAgLyoqIENvbnRlbnQg4oaSIGJhY2tncm91bmQ6IGlzIGB3ZWJOYXZpZ2F0aW9uYCBjdXJyZW50bHkgdXNhYmxlPyAqL1xuICAgIGhhc1dlYk5hdmlnYXRpb25QZXJtaXNzaW9uOiAoKSA9PiAoe1xuICAgICAgICB0eXBlOiBcIkhBU19XRUJOQVZJR0FUSU9OX1BFUk1JU1NJT05cIixcbiAgICB9KSxcbn07XG4vLyBTZW5kIG1lc3NhZ2UgdG8gYmFja2dyb3VuZCBzY3JpcHRcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZW5kTWVzc2FnZShtZXNzYWdlKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKG1lc3NhZ2UsIChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcikge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGNocm9tZS5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXNwb25zZSB8fCB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogXCJObyByZXNwb25zZSByZWNlaXZlZFwiIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcbn1cbi8vIFNlbmQgbWVzc2FnZSB0byBjb250ZW50IHNjcmlwdCBpbiBzcGVjaWZpYyB0YWJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZW5kVG9UYWIodGFiSWQsIG1lc3NhZ2UpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UodGFiSWQsIG1lc3NhZ2UsIChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcikge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGNocm9tZS5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXNwb25zZSB8fCB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogXCJObyByZXNwb25zZSByZWNlaXZlZFwiIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcbn1cbi8vIFNlbmQgbWVzc2FnZSB0byBhbGwgY29udGVudCBzY3JpcHRzXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYnJvYWRjYXN0TWVzc2FnZShtZXNzYWdlKSB7XG4gICAgY29uc3QgdGFicyA9IGF3YWl0IGNocm9tZS50YWJzLnF1ZXJ5KHt9KTtcbiAgICBmb3IgKGNvbnN0IHRhYiBvZiB0YWJzKSB7XG4gICAgICAgIGlmICh0YWIuaWQpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UodGFiLmlkLCBtZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIHtcbiAgICAgICAgICAgICAgICAvLyBUYWIgbWlnaHQgbm90IGhhdmUgY29udGVudCBzY3JpcHQgbG9hZGVkXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvKipcbiAqIFA0LyM0MCDigJQgTG9uZy1saXZlZCBwb3J0IG5hbWUgdXNlZCBieSB0aGUgaW5saW5lIEFJIGFzc2lzdGFudC4gVGhlIGNvbnRlbnRcbiAqIHNjcmlwdCBjYWxscyBgY2hyb21lLnJ1bnRpbWUuY29ubmVjdCh7IG5hbWU6IENIQVRfUE9SVF9OQU1FIH0pYCBhbmQgdGhlXG4gKiBiYWNrZ3JvdW5kJ3MgYGNocm9tZS5ydW50aW1lLm9uQ29ubmVjdGAgbGlzdGVuZXIgZmlsdGVycyBieSB0aGlzIG5hbWUuXG4gKi9cbmV4cG9ydCBjb25zdCBDSEFUX1BPUlRfTkFNRSA9IFwic2xvdGhpbmctY2hhdC1zdHJlYW1cIjtcbmV4cG9ydCBjb25zdCBERUZBVUxUX1NFVFRJTkdTID0ge1xuICAgIGF1dG9GaWxsRW5hYmxlZDogdHJ1ZSxcbiAgICBzaG93Q29uZmlkZW5jZUluZGljYXRvcnM6IHRydWUsXG4gICAgbWluaW11bUNvbmZpZGVuY2U6IDAuNSxcbiAgICBsZWFybkZyb21BbnN3ZXJzOiB0cnVlLFxuICAgIG5vdGlmeU9uSm9iRGV0ZWN0ZWQ6IHRydWUsXG4gICAgYXV0b1RyYWNrQXBwbGljYXRpb25zRW5hYmxlZDogdHJ1ZSxcbiAgICBjYXB0dXJlU2NyZWVuc2hvdEVuYWJsZWQ6IGZhbHNlLFxufTtcbmV4cG9ydCBjb25zdCBMRUdBQ1lfTE9DQUxfQVBJX0JBU0VfVVJMID0gXCJodHRwOi8vbG9jYWxob3N0OjMwMDBcIjtcbmV4cG9ydCBjb25zdCBERUZBVUxUX0FQSV9CQVNFX1VSTCA9IHByb2Nlc3MuZW52LlNMT1RISU5HX0VYVEVOU0lPTl9BUElfQkFTRV9VUkwgfHwgXCJodHRwczovL3Nsb3RoaW5nLndvcmtcIjtcbmV4cG9ydCBjb25zdCBTSE9VTERfUFJPTU9URV9MRUdBQ1lfTE9DQUxfQVBJX0JBU0VfVVJMID0gREVGQVVMVF9BUElfQkFTRV9VUkwgIT09IExFR0FDWV9MT0NBTF9BUElfQkFTRV9VUkw7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=