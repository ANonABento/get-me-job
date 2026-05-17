"use strict";
(self["webpackChunk_slothing_extension"] = self["webpackChunk_slothing_extension"] || []).push([[854],{

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

/***/ 227
(__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) {


;// ./src/shared/field-patterns.ts
// Field detection patterns for auto-fill
const FIELD_PATTERNS = [
    // Name fields
    {
        type: "firstName",
        autocompleteValues: ["given-name", "first-name"],
        namePatterns: [/first.?name/i, /fname/i, /given.?name/i, /forename/i],
        idPatterns: [/first.?name/i, /fname/i],
        labelPatterns: [/first\s*name/i, /given\s*name/i, /forename/i],
        placeholderPatterns: [/first\s*name/i],
        negativePatterns: [/last/i, /company/i, /middle/i, /business/i],
    },
    {
        type: "lastName",
        autocompleteValues: ["family-name", "last-name"],
        namePatterns: [/last.?name/i, /lname/i, /surname/i, /family.?name/i],
        idPatterns: [/last.?name/i, /lname/i, /surname/i],
        labelPatterns: [/last\s*name/i, /surname/i, /family\s*name/i],
        negativePatterns: [/first/i, /company/i, /business/i],
    },
    {
        type: "fullName",
        autocompleteValues: ["name"],
        namePatterns: [/^name$/i, /full.?name/i, /your.?name/i, /candidate.?name/i],
        labelPatterns: [/^name$/i, /full\s*name/i, /your\s*name/i, /^name\s*\*/i],
        negativePatterns: [
            /company/i,
            /first/i,
            /last/i,
            /user/i,
            /business/i,
            /job/i,
        ],
    },
    // Contact fields
    {
        type: "email",
        autocompleteValues: ["email"],
        namePatterns: [/e?-?mail/i, /email.?address/i],
        idPatterns: [/e?-?mail/i],
        labelPatterns: [/e-?mail/i, /email\s*address/i],
        placeholderPatterns: [/e-?mail/i, /@/],
    },
    {
        type: "phone",
        autocompleteValues: ["tel", "tel-national", "tel-local"],
        namePatterns: [/phone/i, /mobile/i, /cell/i, /tel(?:ephone)?/i],
        labelPatterns: [
            /phone/i,
            /mobile/i,
            /cell/i,
            /telephone/i,
            /contact\s*number/i,
        ],
    },
    {
        type: "address",
        autocompleteValues: ["street-address", "address-line1"],
        namePatterns: [/address/i, /street/i],
        labelPatterns: [/address/i, /street/i],
        negativePatterns: [/email/i, /web/i, /url/i],
    },
    {
        type: "city",
        autocompleteValues: ["address-level2"],
        namePatterns: [/city/i, /town/i],
        labelPatterns: [/city/i, /town/i],
    },
    {
        type: "state",
        autocompleteValues: ["address-level1"],
        namePatterns: [/state/i, /province/i, /region/i],
        labelPatterns: [/state/i, /province/i, /region/i],
    },
    {
        type: "zipCode",
        autocompleteValues: ["postal-code"],
        namePatterns: [/zip/i, /postal/i, /postcode/i],
        labelPatterns: [/zip/i, /postal/i, /post\s*code/i],
    },
    {
        type: "country",
        autocompleteValues: ["country", "country-name"],
        namePatterns: [/country/i],
        labelPatterns: [/country/i],
    },
    // Social/Professional links
    {
        type: "linkedin",
        autocompleteValues: ["url"],
        namePatterns: [/linkedin/i],
        idPatterns: [/linkedin/i],
        labelPatterns: [/linkedin/i],
        placeholderPatterns: [/linkedin\.com/i, /linkedin/i],
    },
    {
        type: "github",
        autocompleteValues: ["url"],
        namePatterns: [/github/i],
        idPatterns: [/github/i],
        labelPatterns: [/github/i],
        placeholderPatterns: [/github\.com/i, /github/i],
    },
    {
        type: "website",
        autocompleteValues: ["url"],
        idPatterns: [/website/i, /portfolio/i, /personal.?site/i, /blog/i],
        namePatterns: [/website/i, /portfolio/i, /personal.?site/i, /blog/i],
        labelPatterns: [/website/i, /portfolio/i, /personal\s*(site|url)/i],
        negativePatterns: [/linkedin/i, /github/i, /company/i],
    },
    // Employment fields
    {
        type: "currentCompany",
        autocompleteValues: ["organization"],
        namePatterns: [
            /current.?company/i,
            /employer/i,
            /company.?name/i,
            /organization/i,
        ],
        labelPatterns: [
            /current\s*(company|employer)/i,
            /company\s*name/i,
            /employer/i,
        ],
        negativePatterns: [/previous/i, /past/i, /former/i],
    },
    {
        type: "currentTitle",
        autocompleteValues: ["organization-title"],
        namePatterns: [/current.?title/i, /job.?title/i, /position/i, /role/i],
        labelPatterns: [/current\s*(title|position|role)/i, /job\s*title/i],
        negativePatterns: [/previous/i, /past/i, /desired/i, /applying/i],
    },
    {
        type: "yearsExperience",
        namePatterns: [/years?.?(of)?.?experience/i, /experience.?years/i, /yoe/i],
        idPatterns: [
            /years?.?(of)?.?experience/i,
            /experience.?years/i,
            /experience/i,
            /yoe/i,
        ],
        labelPatterns: [
            /years?\s*(of\s*)?experience/i,
            /total\s*experience/i,
            /how\s*many\s*years/i,
        ],
        placeholderPatterns: [/years?/i, /yoe/i],
    },
    // Education fields
    {
        type: "school",
        namePatterns: [
            /school/i,
            /university/i,
            /college/i,
            /institution/i,
            /alma.?mater/i,
        ],
        labelPatterns: [/school/i, /university/i, /college/i, /institution/i],
        negativePatterns: [/high\s*school/i],
    },
    {
        type: "degree",
        namePatterns: [/degree/i, /qualification/i],
        labelPatterns: [/degree/i, /qualification/i, /level\s*of\s*education/i],
    },
    {
        type: "fieldOfStudy",
        namePatterns: [
            /field.?of.?study/i,
            /major/i,
            /concentration/i,
            /specialization/i,
        ],
        labelPatterns: [/field\s*of\s*study/i, /major/i, /area\s*of\s*study/i],
    },
    {
        type: "graduationYear",
        namePatterns: [/graduation.?(year|date)/i, /grad.?year/i],
        labelPatterns: [
            /graduation\s*(year|date)/i,
            /year\s*of\s*graduation/i,
            /when\s*did\s*you\s*graduate/i,
        ],
    },
    {
        type: "gpa",
        namePatterns: [/gpa/i, /grade.?point/i, /cgpa/i],
        labelPatterns: [/gpa/i, /grade\s*point/i, /cumulative\s*gpa/i],
    },
    // Documents
    {
        type: "resume",
        namePatterns: [/resume/i, /cv/i, /curriculum.?vitae/i],
        labelPatterns: [
            /resume/i,
            /cv/i,
            /curriculum\s*vitae/i,
            /upload\s*(your\s*)?resume/i,
        ],
    },
    {
        type: "coverLetter",
        namePatterns: [/cover.?letter/i, /motivation.?letter/i],
        labelPatterns: [/cover\s*letter/i, /motivation\s*letter/i],
    },
    // Compensation
    {
        type: "salary",
        namePatterns: [/salary/i, /compensation/i, /pay/i, /wage/i],
        labelPatterns: [
            /salary/i,
            /compensation/i,
            /expected\s*(salary|pay)/i,
            /desired\s*salary/i,
        ],
    },
    // Availability
    {
        type: "startDate",
        namePatterns: [/start.?date/i, /available.?date/i, /earliest.?start/i],
        labelPatterns: [
            /start\s*date/i,
            /when\s*can\s*you\s*start/i,
            /earliest\s*start/i,
            /availability/i,
        ],
        negativePatterns: [/end/i, /finish/i],
    },
    // Legal/Compliance
    {
        type: "workAuthorization",
        namePatterns: [
            /work.?auth/i,
            /authorized.?to.?work/i,
            /legally.?work/i,
            /work.?permit/i,
            /visa.?status/i,
        ],
        labelPatterns: [
            /authorized\s*to\s*work/i,
            /legally\s*(authorized|permitted)/i,
            /work\s*authorization/i,
            /right\s*to\s*work/i,
        ],
    },
    {
        type: "sponsorship",
        namePatterns: [/sponsor/i, /visa.?sponsor/i],
        labelPatterns: [
            /sponsor/i,
            /visa\s*sponsor/i,
            /require\s*sponsorship/i,
            /need\s*sponsorship/i,
        ],
    },
    // EEO fields
    {
        type: "veteranStatus",
        namePatterns: [/veteran/i, /military/i],
        labelPatterns: [/veteran/i, /military\s*status/i, /served\s*in/i],
    },
    {
        type: "disability",
        namePatterns: [/disability/i, /disabled/i],
        labelPatterns: [/disability/i, /disabled/i, /accommodation/i],
    },
    {
        type: "gender",
        namePatterns: [/gender/i, /sex/i],
        labelPatterns: [/gender/i, /sex/i],
        negativePatterns: [/identity/i],
    },
    {
        type: "ethnicity",
        namePatterns: [/ethnicity/i, /race/i, /ethnic/i],
        labelPatterns: [/ethnicity/i, /race/i, /ethnic\s*background/i],
    },
    // Skills
    {
        type: "skills",
        namePatterns: [/skills?/i, /expertise/i, /competenc/i],
        labelPatterns: [/skills?/i, /technical\s*skills/i, /key\s*skills/i],
    },
    // Summary/Bio
    {
        type: "summary",
        namePatterns: [
            /summary/i,
            /bio/i,
            /about.?you/i,
            /profile/i,
            /introduction/i,
        ],
        labelPatterns: [
            /summary/i,
            /professional\s*summary/i,
            /about\s*you/i,
            /tell\s*us\s*about/i,
            /bio/i,
        ],
        negativePatterns: [/job/i, /position/i],
    },
];
// Job site URL patterns for scraper detection
const JOB_SITE_PATTERNS = {
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
    greenhouse: [/boards\.greenhouse\.io\//, /greenhouse\.io\/.*\/jobs\//],
    lever: [/jobs\.lever\.co\//, /lever\.co\/.*\/jobs\//],
    waterlooWorks: [/waterlooworks\.uwaterloo\.ca/],
    workday: [/myworkdayjobs\.com/, /workdayjobs\.com/],
};
function detectJobSite(url) {
    for (const [site, patterns] of Object.entries(JOB_SITE_PATTERNS)) {
        if (patterns.some((p) => p.test(url))) {
            return site;
        }
    }
    return "unknown";
}
// Common question patterns for learning system
const CUSTOM_QUESTION_INDICATORS = [
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

;// ./src/content/auto-fill/field-detector.ts
// Field detection for auto-fill

class FieldDetector {
    detectFields(form) {
        const fields = [];
        const inputs = form.querySelectorAll("input, textarea, select");
        for (const input of inputs) {
            const element = input;
            // Skip hidden, disabled, or submit inputs
            if (this.shouldSkipElement(element))
                continue;
            const detection = this.detectFieldType(element);
            if (detection.fieldType !== "unknown" || detection.confidence > 0.1) {
                fields.push(detection);
            }
        }
        return fields;
    }
    shouldSkipElement(element) {
        const input = element;
        // Check computed style for visibility
        const style = window.getComputedStyle(element);
        if (style.display === "none" || style.visibility === "hidden") {
            return true;
        }
        // Check disabled state
        if (input.disabled)
            return true;
        // Check input type
        const skipTypes = ["hidden", "submit", "button", "reset", "image", "file"];
        if (skipTypes.includes(input.type))
            return true;
        // Check if it's a CSRF/token field
        if (input.name?.includes("csrf") || input.name?.includes("token")) {
            return true;
        }
        return false;
    }
    detectFieldType(element) {
        const signals = this.gatherSignals(element);
        const scores = this.scoreAllPatterns(signals);
        // Get best match
        scores.sort((a, b) => b.confidence - a.confidence);
        const best = scores[0];
        // Determine if this is a custom question
        let fieldType = best?.fieldType || "unknown";
        let confidence = best?.confidence || 0;
        if (confidence < 0.3) {
            // Check if it looks like a custom question
            if (this.looksLikeCustomQuestion(signals)) {
                fieldType = "customQuestion";
                confidence = 0.5;
            }
        }
        return {
            element,
            fieldType,
            confidence,
            label: signals.label || undefined,
            placeholder: signals.placeholder || undefined,
        };
    }
    gatherSignals(element) {
        return {
            name: element.name?.toLowerCase() || "",
            id: element.id?.toLowerCase() || "",
            type: element.type || "text",
            placeholder: element.placeholder?.toLowerCase() || "",
            autocomplete: element.autocomplete || "",
            label: this.findLabel(element)?.toLowerCase() || "",
            ariaLabel: element.getAttribute("aria-label")?.toLowerCase() || "",
            nearbyText: this.getNearbyText(element)?.toLowerCase() || "",
            parentClasses: this.getParentClasses(element),
        };
    }
    scoreAllPatterns(signals) {
        return FIELD_PATTERNS.map((pattern) => ({
            fieldType: pattern.type,
            confidence: this.calculateConfidence(signals, pattern),
        }));
    }
    calculateConfidence(signals, pattern) {
        let score = 0;
        let maxScore = 0;
        // Weight different signals
        const weights = {
            autocomplete: 0.4,
            name: 0.2,
            id: 0.15,
            label: 0.15,
            placeholder: 0.1,
            ariaLabel: 0.1,
        };
        // Check autocomplete attribute (most reliable)
        if (signals.autocomplete &&
            pattern.autocompleteValues?.includes(signals.autocomplete)) {
            score += weights.autocomplete;
        }
        maxScore += weights.autocomplete;
        // Check name attribute
        if (pattern.namePatterns?.some((p) => p.test(signals.name))) {
            score += weights.name;
        }
        maxScore += weights.name;
        // Check ID
        if (pattern.idPatterns?.some((p) => p.test(signals.id))) {
            score += weights.id;
        }
        maxScore += weights.id;
        // Check label
        if (pattern.labelPatterns?.some((p) => p.test(signals.label))) {
            score += weights.label;
        }
        maxScore += weights.label;
        // Check placeholder
        if (pattern.placeholderPatterns?.some((p) => p.test(signals.placeholder))) {
            score += weights.placeholder;
        }
        maxScore += weights.placeholder;
        // Check aria-label
        if (pattern.labelPatterns?.some((p) => p.test(signals.ariaLabel))) {
            score += weights.ariaLabel;
        }
        maxScore += weights.ariaLabel;
        // Negative signals (reduce confidence if found)
        if (pattern.negativePatterns?.some((p) => p.test(signals.name) || p.test(signals.label) || p.test(signals.id))) {
            score -= 0.3;
        }
        return Math.max(0, maxScore > 0 ? score / maxScore : 0);
    }
    findLabel(element) {
        // Method 1: Explicit label via for attribute
        if (element.id) {
            const label = document.querySelector(`label[for="${element.id}"]`);
            if (label?.textContent)
                return label.textContent.trim();
        }
        // Method 2: Wrapping label
        const parentLabel = element.closest("label");
        if (parentLabel?.textContent) {
            // Remove the input's value from label text
            const text = parentLabel.textContent.trim();
            const inputValue = element.value || "";
            return text.replace(inputValue, "").trim();
        }
        // Method 3: aria-labelledby
        const labelledBy = element.getAttribute("aria-labelledby");
        if (labelledBy) {
            const labelEl = document.getElementById(labelledBy);
            if (labelEl?.textContent)
                return labelEl.textContent.trim();
        }
        // Method 4: Previous sibling label
        let sibling = element.previousElementSibling;
        while (sibling) {
            if (sibling.tagName === "LABEL") {
                return sibling.textContent?.trim() || null;
            }
            sibling = sibling.previousElementSibling;
        }
        // Method 5: Parent's previous sibling label
        const parent = element.parentElement;
        if (parent) {
            let parentSibling = parent.previousElementSibling;
            if (parentSibling?.tagName === "LABEL") {
                return parentSibling.textContent?.trim() || null;
            }
        }
        return null;
    }
    getNearbyText(element) {
        const parent = element.closest('.form-group, .field, .input-wrapper, [class*="field"], [class*="input"]');
        if (parent) {
            const text = parent.textContent?.trim();
            if (text && text.length < 200)
                return text;
        }
        return null;
    }
    getParentClasses(element) {
        const classes = [];
        let current = element.parentElement;
        let depth = 0;
        while (current && depth < 3) {
            if (current.className) {
                classes.push(...current.className.split(" ").filter(Boolean));
            }
            current = current.parentElement;
            depth++;
        }
        return classes;
    }
    looksLikeCustomQuestion(signals) {
        const text = `${signals.label} ${signals.placeholder} ${signals.nearbyText}`;
        return CUSTOM_QUESTION_INDICATORS.some((pattern) => pattern.test(text));
    }
}

;// ./src/content/auto-fill/field-mapper.ts
// Field-to-profile value mapping
class FieldMapper {
    constructor(profile) {
        this.profile = profile;
    }
    mapFieldToValue(field) {
        const fieldType = field.fieldType;
        const mapping = this.getMappings();
        const mapper = mapping[fieldType];
        if (mapper) {
            return mapper();
        }
        return null;
    }
    getMappings() {
        const p = this.profile;
        const c = p.computed;
        return {
            // Name fields
            firstName: () => c?.firstName || null,
            lastName: () => c?.lastName || null,
            fullName: () => p.contact?.name || null,
            // Contact fields
            email: () => p.contact?.email || null,
            phone: () => p.contact?.phone || null,
            address: () => p.contact?.location || null,
            city: () => this.extractCity(p.contact?.location),
            state: () => this.extractState(p.contact?.location),
            zipCode: () => null, // Not typically stored
            country: () => this.extractCountry(p.contact?.location),
            // Social/Professional
            linkedin: () => p.contact?.linkedin || null,
            github: () => p.contact?.github || null,
            website: () => p.contact?.website || null,
            portfolio: () => p.contact?.website || null,
            // Employment
            currentCompany: () => c?.currentCompany || null,
            currentTitle: () => c?.currentTitle || null,
            yearsExperience: () => c?.yearsExperience?.toString() || null,
            // Education
            school: () => c?.mostRecentSchool || null,
            education: () => this.formatEducation(),
            degree: () => c?.mostRecentDegree || null,
            fieldOfStudy: () => c?.mostRecentField || null,
            graduationYear: () => c?.graduationYear || null,
            gpa: () => p.education?.[0]?.gpa || null,
            // Documents (return null, handled separately)
            resume: () => null,
            coverLetter: () => null,
            // Compensation
            salary: () => null, // User-specific, don't auto-fill
            salaryExpectation: () => null,
            // Availability
            startDate: () => null, // User-specific
            availability: () => null,
            // Work authorization (sensitive, don't auto-fill)
            workAuthorization: () => null,
            sponsorship: () => null,
            // EEO fields (sensitive, don't auto-fill)
            veteranStatus: () => null,
            disability: () => null,
            gender: () => null,
            ethnicity: () => null,
            // Skills/Summary
            skills: () => c?.skillsList || null,
            summary: () => p.summary || null,
            experience: () => this.formatExperience(),
            // Custom/Unknown (handled by learning system)
            customQuestion: () => null,
            unknown: () => null,
        };
    }
    extractCity(location) {
        if (!location)
            return null;
        // Common pattern: "City, State" or "City, State, Country"
        const parts = location.split(",").map((p) => p.trim());
        return parts[0] || null;
    }
    extractState(location) {
        if (!location)
            return null;
        const parts = location.split(",").map((p) => p.trim());
        if (parts.length >= 2) {
            // Handle "CA" or "California" or "CA 94105"
            const state = parts[1].split(" ")[0];
            return state || null;
        }
        return null;
    }
    extractCountry(location) {
        if (!location)
            return null;
        const parts = location.split(",").map((p) => p.trim());
        if (parts.length >= 3) {
            return parts[parts.length - 1];
        }
        // Default to USA if only city/state
        if (parts.length === 2) {
            return "United States";
        }
        return null;
    }
    formatEducation() {
        const edu = this.profile.education?.[0];
        if (!edu)
            return null;
        return `${edu.degree} in ${edu.field} from ${edu.institution}`;
    }
    formatExperience() {
        const exps = this.profile.experiences;
        if (!exps || exps.length === 0)
            return null;
        return exps
            .slice(0, 3)
            .map((exp) => {
            const period = exp.current
                ? `${exp.startDate} - Present`
                : `${exp.startDate} - ${exp.endDate}`;
            return `${exp.title} at ${exp.company} (${period})`;
        })
            .join("\n");
    }
    // Get all mapped values for a form
    getAllMappedValues(fields) {
        const values = new Map();
        for (const field of fields) {
            const value = this.mapFieldToValue(field);
            if (value) {
                values.set(field.element, value);
            }
        }
        return values;
    }
}

;// ./src/content/ui/confidence-band.ts
// Two-pass confidence-driven autofill — zone classification + DOM markers.
//
// Roadmap reference: docs/extension-roadmap-2026-05.md, task #32.
//
// Today the autofill writes any field with confidence >= settings.minimumConfidence
// (default 0.5). The 0.5–0.7 band fills wrong often enough that users distrust
// autofill. This module splits fill behavior into three zones:
//
//   - silent  (>= 0.85): fill the field, no visual marker.
//   - yellow  (0.6–0.85): fill the field, apply a 1px yellow outline + "?" tooltip.
//   - cold    (< 0.6):    don't fill, place a small "?" badge near the field that
//                          opens a popover with the top-3 candidates from profile.
//
// `settings.minimumConfidence` becomes the cold-zone floor (existing semantics
// preserved). This module is presentation only — it never alters the scoring
// algorithm.
/** Lower bound (inclusive) for the silent zone. */
const SILENT_THRESHOLD = 0.85;
/** Lower bound (inclusive) for the yellow zone. */
const YELLOW_THRESHOLD = 0.6;
/**
 * Classify a confidence score into a zone.
 *
 * Boundaries are inclusive of the lower bound so that:
 *   - score >= 0.85           → "silent"
 *   - 0.6  <= score < 0.85    → "yellow"
 *   - score <  0.6            → "cold"
 *
 * NaN / non-finite scores are treated as cold (safest default).
 */
function classifyConfidence(score) {
    if (!Number.isFinite(score))
        return "cold";
    if (score >= SILENT_THRESHOLD)
        return "silent";
    if (score >= YELLOW_THRESHOLD)
        return "yellow";
    return "cold";
}
/** Class names used by the yellow band + cold badge. Mirrors styles.css. */
const ZONE_YELLOW_CLASS = "slothing-zone-yellow";
const ZONE_BADGE_CLASS = "slothing-zone-badge";
const ZONE_POPOVER_CLASS = "slothing-zone-popover";
const YELLOW_TOOLTIP = "Press Enter to accept · Esc to clear";
const COLD_TOOLTIP_PREFIX = "Slothing has";
const COLD_TOOLTIP_SUFFIX = "candidates — click to pick";
/**
 * Apply the yellow-zone outline + "?" tooltip to a freshly-filled field, and
 * register listeners that clear the marker once the user interacts (typing or
 * focus-out after edit).
 *
 * Returns a `dispose` function that removes the marker manually (used in tests
 * and on pagehide).
 */
function applyYellowMarker(element, options = {}) {
    if (typeof document === "undefined")
        return () => undefined;
    element.classList.add(ZONE_YELLOW_CLASS);
    element.setAttribute("data-slothing-zone", "yellow");
    element.setAttribute("data-slothing-zone-tooltip", options.tooltip ?? YELLOW_TOOLTIP);
    const originalValue = "value" in element ? element.value : "";
    let cleared = false;
    const clear = () => {
        if (cleared)
            return;
        cleared = true;
        element.classList.remove(ZONE_YELLOW_CLASS);
        element.removeAttribute("data-slothing-zone");
        element.removeAttribute("data-slothing-zone-tooltip");
        element.removeEventListener("input", onInput);
        element.removeEventListener("blur", onBlur);
        element.removeEventListener("keydown", onKeyDown);
    };
    const onInput = () => {
        // Typing into the field is acceptance signal — clear the marker.
        clear();
    };
    const onBlur = () => {
        // Focus-out only counts as acceptance if the value changed from the autofilled value.
        if ("value" in element && element.value !== originalValue) {
            clear();
        }
    };
    const onKeyDown = (event) => {
        if (event.key === "Enter" || event.key === "Escape") {
            clear();
        }
    };
    element.addEventListener("input", onInput);
    element.addEventListener("blur", onBlur);
    element.addEventListener("keydown", onKeyDown);
    return clear;
}
/**
 * Build the small "?" badge that announces a cold-zone field. Clicking the
 * badge invokes `onPick` so the caller can render the candidate popover.
 *
 * The badge is positioned absolutely; the caller is responsible for placing it
 * in a container that establishes a positioning context near the field.
 */
function createColdBadge(opts) {
    if (typeof document === "undefined") {
        // Return a stub for non-DOM environments.
        return { onclick: null };
    }
    const badge = document.createElement("button");
    badge.type = "button";
    badge.className = ZONE_BADGE_CLASS;
    badge.setAttribute("data-slothing-zone", "cold");
    badge.setAttribute("aria-label", `${COLD_TOOLTIP_PREFIX} ${opts.candidateCount} ${COLD_TOOLTIP_SUFFIX}`);
    badge.title = `${COLD_TOOLTIP_PREFIX} ${opts.candidateCount} ${COLD_TOOLTIP_SUFFIX}`;
    badge.textContent = "?";
    badge.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        opts.onPick();
    });
    return badge;
}
/**
 * Render a small popover listing the top-3 cold-zone candidates. Clicking a
 * candidate invokes `onSelect(value)` and dismisses the popover.
 *
 * Returns a `dispose` function that removes the popover. The popover is added
 * to `document.body` so it floats above the host site's layout.
 */
function showColdPopover(opts) {
    if (typeof document === "undefined")
        return () => undefined;
    const popover = document.createElement("div");
    popover.className = ZONE_POPOVER_CLASS;
    popover.setAttribute("role", "listbox");
    const heading = document.createElement("div");
    heading.className = `${ZONE_POPOVER_CLASS}__title`;
    heading.textContent = "Pick a value";
    popover.appendChild(heading);
    const list = document.createElement("ul");
    list.className = `${ZONE_POPOVER_CLASS}__list`;
    for (const candidate of opts.candidates.slice(0, 3)) {
        const item = document.createElement("li");
        const button = document.createElement("button");
        button.type = "button";
        button.className = `${ZONE_POPOVER_CLASS}__item`;
        button.setAttribute("role", "option");
        const label = document.createElement("span");
        label.className = `${ZONE_POPOVER_CLASS}__label`;
        label.textContent = candidate.label;
        const value = document.createElement("span");
        value.className = `${ZONE_POPOVER_CLASS}__value`;
        value.textContent = candidate.value;
        button.append(label, value);
        button.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            opts.onSelect(candidate.value);
            dispose();
        });
        item.appendChild(button);
        list.appendChild(item);
    }
    popover.appendChild(list);
    // Position the popover near the anchor (below + right-aligned).
    const rect = opts.anchor.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset || 0;
    const scrollY = window.scrollY || window.pageYOffset || 0;
    popover.style.position = "absolute";
    popover.style.top = `${rect.bottom + scrollY + 6}px`;
    popover.style.left = `${rect.left + scrollX}px`;
    document.body.appendChild(popover);
    const onDocClick = (event) => {
        if (event.target instanceof Node && popover.contains(event.target))
            return;
        if (event.target === opts.anchor)
            return;
        dispose();
    };
    const onKey = (event) => {
        if (event.key === "Escape")
            dispose();
    };
    let disposed = false;
    function dispose() {
        if (disposed)
            return;
        disposed = true;
        document.removeEventListener("mousedown", onDocClick, true);
        document.removeEventListener("keydown", onKey, true);
        popover.remove();
    }
    // Defer the listener-binding so the click that opened the popover doesn't
    // immediately close it.
    setTimeout(() => {
        if (disposed)
            return;
        document.addEventListener("mousedown", onDocClick, true);
        document.addEventListener("keydown", onKey, true);
    }, 0);
    return dispose;
}

;// ./src/content/auto-fill/engine.ts
// Auto-fill engine orchestrator

class AutoFillEngine {
    constructor(detector, mapper) {
        this.detector = detector;
        this.mapper = mapper;
    }
    async fillForm(fields, options = {}) {
        const result = {
            filled: 0,
            skipped: 0,
            errors: 0,
            cold: 0,
            yellow: 0,
            details: [],
        };
        const minimumConfidence = options.minimumConfidence ?? 0;
        for (const field of fields) {
            try {
                const value = this.mapper.mapFieldToValue(field);
                const zone = classifyConfidence(field.confidence);
                if (zone === "cold") {
                    // Cold zone: don't fill. Optionally add a "?" badge so the user can
                    // pick from candidates. Fields below the minimumConfidence floor get
                    // no badge either (existing semantics: settings.minimumConfidence is
                    // now the cold-zone floor).
                    result.skipped++;
                    result.details.push({
                        fieldType: field.fieldType,
                        filled: false,
                        zone,
                    });
                    if (field.confidence >= minimumConfidence && value) {
                        this.attachColdBadge(field, value);
                        result.cold++;
                    }
                    continue;
                }
                if (!value) {
                    result.skipped++;
                    result.details.push({
                        fieldType: field.fieldType,
                        filled: false,
                        zone,
                    });
                    continue;
                }
                const filled = await this.fillField(field.element, value);
                if (filled) {
                    result.filled++;
                    result.details.push({
                        fieldType: field.fieldType,
                        filled: true,
                        zone,
                    });
                    if (zone === "yellow") {
                        applyYellowMarker(field.element);
                        result.yellow++;
                    }
                    try {
                        options.onFilled?.({ field, value });
                    }
                    catch (cbErr) {
                        console.error("[Slothing] onFilled callback failed:", cbErr);
                    }
                }
                else {
                    result.skipped++;
                    result.details.push({
                        fieldType: field.fieldType,
                        filled: false,
                        zone,
                    });
                }
            }
            catch (err) {
                result.errors++;
                result.details.push({
                    fieldType: field.fieldType,
                    filled: false,
                    error: err.message,
                });
            }
        }
        return result;
    }
    attachColdBadge(field, primary) {
        if (typeof document === "undefined")
            return;
        const anchor = field.element;
        if (!anchor.parentElement)
            return;
        // De-dupe: if a badge already exists for this field, leave it alone.
        const existing = anchor.parentElement.querySelector(`[data-slothing-badge-for="${cssEscape(fieldKey(field))}"]`);
        if (existing)
            return;
        const candidates = [
            { label: field.fieldType, value: primary },
        ];
        const badge = createColdBadge({
            candidateCount: candidates.length,
            onPick: () => {
                showColdPopover({
                    anchor: badge,
                    candidates,
                    onSelect: (chosen) => {
                        void this.fillField(anchor, chosen);
                    },
                });
            },
        });
        badge.setAttribute("data-slothing-badge-for", fieldKey(field));
        // Place the badge in a small wrapper so it can be positioned next to the
        // field without disturbing the host layout. If the field already has a
        // positioned parent, append directly.
        anchor.parentElement.appendChild(badge);
    }
    async fillField(element, value) {
        const tagName = element.tagName.toLowerCase();
        const inputType = element.type?.toLowerCase() || "text";
        // Handle different input types
        if (tagName === "select") {
            return this.fillSelect(element, value);
        }
        if (tagName === "textarea") {
            return this.fillTextInput(element, value);
        }
        if (tagName === "input") {
            switch (inputType) {
                case "text":
                case "email":
                case "tel":
                case "url":
                case "number":
                    return this.fillTextInput(element, value);
                case "checkbox":
                    return this.fillCheckbox(element, value);
                case "radio":
                    return this.fillRadio(element, value);
                case "date":
                    return this.fillDateInput(element, value);
                default:
                    return this.fillTextInput(element, value);
            }
        }
        return false;
    }
    fillTextInput(element, value) {
        // Focus the element
        element.focus();
        // Clear existing value
        element.value = "";
        // Set new value
        element.value = value;
        // Dispatch events to trigger validation and frameworks
        this.dispatchInputEvents(element);
        return element.value === value;
    }
    fillSelect(element, value) {
        const options = Array.from(element.options);
        const normalizedValue = value.toLowerCase();
        // Try exact match first
        let matchingOption = options.find((opt) => opt.value.toLowerCase() === normalizedValue ||
            opt.text.toLowerCase() === normalizedValue);
        // Try partial match
        if (!matchingOption) {
            matchingOption = options.find((opt) => opt.value.toLowerCase().includes(normalizedValue) ||
                opt.text.toLowerCase().includes(normalizedValue) ||
                normalizedValue.includes(opt.value.toLowerCase()) ||
                normalizedValue.includes(opt.text.toLowerCase()));
        }
        if (matchingOption) {
            element.value = matchingOption.value;
            this.dispatchInputEvents(element);
            return true;
        }
        return false;
    }
    fillCheckbox(element, value) {
        const shouldCheck = ["true", "yes", "1", "on"].includes(value.toLowerCase());
        element.checked = shouldCheck;
        this.dispatchInputEvents(element);
        return true;
    }
    fillRadio(element, value) {
        const normalizedValue = value.toLowerCase();
        // Find the radio group
        const name = element.name;
        if (!name)
            return false;
        const radios = document.querySelectorAll(`input[type="radio"][name="${name}"]`);
        for (const radio of radios) {
            const radioInput = radio;
            const radioValue = radioInput.value.toLowerCase();
            const radioLabel = this.getRadioLabel(radioInput)?.toLowerCase() || "";
            if (radioValue === normalizedValue ||
                radioLabel.includes(normalizedValue) ||
                normalizedValue.includes(radioValue)) {
                radioInput.checked = true;
                this.dispatchInputEvents(radioInput);
                return true;
            }
        }
        return false;
    }
    fillDateInput(element, value) {
        // Try to parse and format the date
        const date = new Date(value);
        if (isNaN(date.getTime()))
            return false;
        // Format as YYYY-MM-DD for date input
        const formatted = date.toISOString().split("T")[0];
        element.value = formatted;
        this.dispatchInputEvents(element);
        return true;
    }
    getRadioLabel(radio) {
        // Check for associated label
        if (radio.id) {
            const label = document.querySelector(`label[for="${radio.id}"]`);
            if (label)
                return label.textContent?.trim() || null;
        }
        // Check for wrapping label
        const parent = radio.closest("label");
        if (parent) {
            return parent.textContent?.trim() || null;
        }
        // Check for next sibling text
        const next = radio.nextSibling;
        if (next?.nodeType === Node.TEXT_NODE) {
            return next.textContent?.trim() || null;
        }
        return null;
    }
    dispatchInputEvents(element) {
        // Dispatch events in order that most frameworks expect
        element.dispatchEvent(new Event("focus", { bubbles: true }));
        element.dispatchEvent(new Event("input", { bubbles: true }));
        element.dispatchEvent(new Event("change", { bubbles: true }));
        element.dispatchEvent(new Event("blur", { bubbles: true }));
        // For React controlled components
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
        if (nativeInputValueSetter && element instanceof HTMLInputElement) {
            const value = element.value;
            nativeInputValueSetter.call(element, value);
            element.dispatchEvent(new Event("input", { bubbles: true }));
        }
    }
}
function fieldKey(field) {
    // Stable per-field marker so repeat fills don't stack badges.
    const el = field.element;
    return el.id || el.name || `${field.fieldType}-${el.tagName}`;
}
function cssEscape(value) {
    // Minimal escape sufficient for attribute selectors built from element ids /
    // names. Avoids pulling in a polyfill for environments without CSS.escape.
    if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
        return CSS.escape(value);
    }
    return value.replace(/(["\\\[\]])/g, "\\$1");
}

;// ./src/content/scrapers/base-scraper.ts
// Base scraper interface and utilities
class BaseScraper {
    // Shared utilities
    extractTextContent(selector) {
        const el = document.querySelector(selector);
        return el?.textContent?.trim() || null;
    }
    extractHtmlContent(selector) {
        const el = document.querySelector(selector);
        return el?.innerHTML?.trim() || null;
    }
    extractAttribute(selector, attr) {
        const el = document.querySelector(selector);
        return el?.getAttribute(attr) || null;
    }
    extractAllText(selector) {
        const elements = document.querySelectorAll(selector);
        return Array.from(elements)
            .map((el) => el.textContent?.trim())
            .filter((text) => !!text);
    }
    waitForElement(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const el = document.querySelector(selector);
            if (el)
                return resolve(el);
            const observer = new MutationObserver((_, obs) => {
                const el = document.querySelector(selector);
                if (el) {
                    obs.disconnect();
                    resolve(el);
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Element ${selector} not found after ${timeout}ms`));
            }, timeout);
        });
    }
    extractRequirements(text) {
        const requirements = [];
        // Split by common bullet patterns
        const lines = text.split(/\n|•|◦|◆|▪|●|-\s|\*\s/);
        for (const line of lines) {
            const cleaned = line.trim();
            if (cleaned.length > 20 && cleaned.length < 500) {
                // Check if it looks like a requirement
                if (cleaned.match(/^(you|we|the|must|should|will|experience|proficiency|knowledge|ability|strong|excellent)/i) ||
                    cleaned.match(/required|preferred|bonus|plus/i) ||
                    cleaned.match(/^\d+\+?\s*years?/i)) {
                    requirements.push(cleaned);
                }
            }
        }
        return requirements.slice(0, 15);
    }
    extractKeywords(text) {
        const keywords = new Set();
        // Common tech skills patterns
        const techPatterns = [
            /\b(react|angular|vue|svelte|next\.?js|nuxt)\b/gi,
            /\b(node\.?js|express|fastify|nest\.?js)\b/gi,
            /\b(python|django|flask|fastapi)\b/gi,
            /\b(java|spring|kotlin)\b/gi,
            /\b(go|golang|rust|c\+\+|c#|\.net)\b/gi,
            /\b(typescript|javascript|es6)\b/gi,
            /\b(sql|mysql|postgresql|mongodb|redis|elasticsearch)\b/gi,
            /\b(aws|gcp|azure|docker|kubernetes|k8s)\b/gi,
            /\b(git|ci\/cd|jenkins|github\s*actions)\b/gi,
            /\b(graphql|rest|api|microservices)\b/gi,
        ];
        for (const pattern of techPatterns) {
            const matches = text.match(pattern);
            if (matches) {
                matches.forEach((m) => keywords.add(m.toLowerCase().trim()));
            }
        }
        return Array.from(keywords);
    }
    detectJobType(text) {
        const lower = text.toLowerCase();
        if (lower.includes("intern") ||
            lower.includes("internship") ||
            lower.includes("co-op")) {
            return "internship";
        }
        if (lower.includes("contract") || lower.includes("contractor")) {
            return "contract";
        }
        if (lower.includes("part-time") || lower.includes("part time")) {
            return "part-time";
        }
        if (lower.includes("full-time") || lower.includes("full time")) {
            return "full-time";
        }
        return undefined;
    }
    detectRemote(text) {
        const lower = text.toLowerCase();
        return (lower.includes("remote") ||
            lower.includes("work from home") ||
            lower.includes("wfh") ||
            lower.includes("fully distributed") ||
            lower.includes("anywhere"));
    }
    extractSalary(text) {
        // Match salary patterns like $100,000 - $150,000 or $100k - $150k
        const pattern = /\$[\d,]+(?:k)?(?:\s*[-–]\s*\$[\d,]+(?:k)?)?(?:\s*(?:per|\/)\s*(?:year|yr|annum|annual|hour|hr))?/gi;
        const match = pattern.exec(text);
        return match ? match[0] : undefined;
    }
    cleanDescription(html) {
        // Remove HTML tags but preserve line breaks
        return html
            .replace(/<br\s*\/?>/gi, "\n")
            .replace(/<\/p>/gi, "\n\n")
            .replace(/<\/div>/gi, "\n")
            .replace(/<\/li>/gi, "\n")
            .replace(/<[^>]+>/g, "")
            .replace(/&nbsp;/g, " ")
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/\n{3,}/g, "\n\n")
            .trim();
    }
}

;// ./src/content/scrapers/linkedin-scraper.ts
// LinkedIn job scraper

class LinkedInScraper extends BaseScraper {
    constructor() {
        super(...arguments);
        this.source = "linkedin";
        this.urlPatterns = [
            /linkedin\.com\/jobs\/view\/(\d+)/,
            /linkedin\.com\/jobs\/search-results/,
            /linkedin\.com\/jobs\/search/,
            /linkedin\.com\/jobs\/collections/,
        ];
    }
    canHandle(url) {
        return this.urlPatterns.some((p) => p.test(url));
    }
    async scrapeJobListing() {
        // Wait for job details to load
        try {
            await this.waitForElement(".job-details-jobs-unified-top-card__job-title, .jobs-unified-top-card__job-title, .scaffold-layout__detail h1, main h1", 3000);
        }
        catch {
            // Try alternative selectors
        }
        // Try multiple selector strategies (LinkedIn changes DOM frequently)
        const title = this.extractJobTitle();
        const company = this.extractCompany() || this.extractCompanyFromText(title);
        const location = this.extractLocation() || this.extractLocationFromText();
        const description = this.extractDescription() ||
            this.buildFallbackDescription(title, company, location);
        if (!title || !company) {
            console.log("[Slothing] LinkedIn scraper: Missing required fields", {
                title,
                company,
                description: !!description,
            });
            return null;
        }
        // Try to extract from structured data
        const structuredData = this.extractStructuredData();
        return {
            title,
            company,
            location: location || structuredData?.location,
            description,
            requirements: this.extractRequirements(description),
            keywords: this.extractKeywords(description),
            salary: this.extractSalary(description) || structuredData?.salary,
            type: this.detectJobType(description),
            remote: this.detectRemote(location || "") || this.detectRemote(description),
            url: window.location.href,
            source: this.source,
            sourceJobId: this.extractJobId(),
            postedAt: structuredData?.postedAt,
        };
    }
    async scrapeJobList() {
        const jobs = [];
        // Job cards in search results
        const jobCards = document.querySelectorAll(".job-card-container, .jobs-search-results__list-item, .scaffold-layout__list-item");
        for (const card of jobCards) {
            try {
                const titleEl = card.querySelector('.job-card-list__title, .job-card-container__link, a[data-control-name="job_card_title"]');
                const companyEl = card.querySelector(".job-card-container__company-name, .job-card-container__primary-description");
                const locationEl = card.querySelector(".job-card-container__metadata-item");
                const title = titleEl?.textContent?.trim();
                const company = companyEl?.textContent?.trim();
                const location = locationEl?.textContent?.trim();
                const url = titleEl?.href;
                if (title && company && url) {
                    jobs.push({
                        title,
                        company,
                        location,
                        description: "", // Would need to navigate to get full description
                        requirements: [],
                        url,
                        source: this.source,
                    });
                }
            }
            catch (err) {
                console.error("[Slothing] Error scraping job card:", err);
            }
        }
        return jobs;
    }
    extractJobTitle() {
        const selectors = [
            ".job-details-jobs-unified-top-card__job-title",
            ".jobs-unified-top-card__job-title",
            ".t-24.job-details-jobs-unified-top-card__job-title",
            "h1.t-24",
            ".jobs-top-card__job-title",
            ".scaffold-layout__detail h1",
            ".jobs-search__job-details--container h1",
            'h1[class*="job-title"]',
            "main h1",
        ];
        for (const selector of selectors) {
            const text = this.extractTextContent(selector);
            if (text)
                return text;
        }
        return null;
    }
    extractCompany() {
        const selectors = [
            ".job-details-jobs-unified-top-card__company-name",
            ".jobs-unified-top-card__company-name",
            ".jobs-top-card__company-url",
            'a[data-tracking-control-name="public_jobs_topcard-org-name"]',
            ".job-details-jobs-unified-top-card__company-name a",
            ".job-details-jobs-unified-top-card__primary-description-container a",
            ".jobs-unified-top-card__company-name a",
        ];
        for (const selector of selectors) {
            const text = this.extractTextContent(selector);
            if (text)
                return text;
        }
        return null;
    }
    extractLocation() {
        const selectors = [
            ".job-details-jobs-unified-top-card__bullet",
            ".jobs-unified-top-card__bullet",
            ".jobs-top-card__bullet",
            ".job-details-jobs-unified-top-card__primary-description-container .t-black--light",
        ];
        for (const selector of selectors) {
            const text = this.extractTextContent(selector);
            if (text && !text.includes("applicant") && !text.includes("ago")) {
                return text;
            }
        }
        return null;
    }
    extractDescription() {
        const selectors = [
            ".jobs-description__content",
            ".jobs-description-content__text",
            ".jobs-box__html-content",
            "#job-details",
            ".jobs-description",
            ".jobs-description__container",
        ];
        for (const selector of selectors) {
            const html = this.extractHtmlContent(selector);
            if (html) {
                return this.cleanDescription(html);
            }
        }
        return null;
    }
    buildFallbackDescription(title, company, location) {
        return [
            title && company ? `${title} at ${company}` : title || company,
            location,
            "LinkedIn job details visible; full description not loaded.",
        ]
            .filter((part) => !!part)
            .join("\n");
    }
    extractJobId() {
        const match = window.location.href.match(/\/view\/(\d+)/) ||
            window.location.href.match(/[?&]currentJobId=(\d+)/);
        return match?.[1];
    }
    extractStructuredData() {
        try {
            const ldJson = document.querySelector('script[type="application/ld+json"]');
            if (!ldJson?.textContent)
                return null;
            const data = JSON.parse(ldJson.textContent);
            return {
                location: data.jobLocation?.address?.addressLocality,
                salary: data.baseSalary?.value
                    ? `$${data.baseSalary.value.minValue || ""}-${data.baseSalary.value.maxValue || ""}`
                    : undefined,
                postedAt: data.datePosted,
            };
        }
        catch {
            return null;
        }
    }
    extractCompanyFromText(title) {
        if (!title)
            return null;
        const lines = this.visibleLines();
        const index = lines.findIndex((line) => line === title);
        const next = index >= 0 ? lines[index + 1] : undefined;
        if (!next)
            return null;
        if (/^(apply|save|viewed|promoted|responses managed|over \d+)/i.test(next)) {
            return null;
        }
        return next;
    }
    extractLocationFromText() {
        return (this.visibleLines().find((line) => /^[A-Z][A-Za-z .'-]+,\s*[A-Z]{2}\b/.test(line)) || null);
    }
    visibleLines() {
        const text = document.body.innerText ||
            document.body.textContent ||
            "";
        return text
            .split(/\n+/)
            .map((line) => line.trim())
            .filter(Boolean);
    }
}

;// ./src/content/scrapers/waterloo-works-scraper.ts
// Waterloo Works job scraper (University of Waterloo co-op portal).
//
// Targets the modern student posting-search UI (body.new-student__posting-search).
// The legacy Orbis-era selectors (#postingDiv, .posting-details, .job-listing-table)
// are no longer present on the production site; this scraper does not try to
// support both — if WW reverts or a different surface appears, add a branch.

// Field labels from the live UI. Each entry lists prefixes we want to match
// against the .label text (which is normalized — trailing colons and whitespace
// stripped before comparison). The first matching candidate wins per row.
const FIELD_LABELS = {
    title: ["Job Title"],
    summary: ["Job Summary"],
    responsibilities: ["Job Responsibilities", "Responsibilities"],
    requirements: [
        "Required Skills",
        "Targeted Skills",
        "Targeted Degrees and Disciplines",
    ],
    organization: ["Organization", "Employer", "Company"],
    // Modern WW splits location across multiple labelled rows; we collect each
    // piece separately and stitch them in composeLocation().
    locationCity: ["Job - City"],
    locationRegion: ["Job - Province/State", "Job - Province / State"],
    locationCountry: ["Job - Country"],
    locationFull: [
        "Job Location",
        "Location",
        "Job - City, Province / State, Country",
    ],
    employmentArrangement: ["Employment Location Arrangement"],
    workTerm: ["Work Term"],
    workTermDuration: ["Work Term Duration"],
    level: ["Level"],
    openings: ["Number of Job Openings"],
    deadline: ["Application Deadline", "Deadline"],
    salary: [
        "Compensation and Benefits Information",
        "Compensation and Benefits",
        "Compensation",
        "Salary",
    ],
    jobType: ["Job Type"],
};
class WaterlooWorksScraper extends BaseScraper {
    constructor() {
        super(...arguments);
        this.source = "waterlooworks";
        this.urlPatterns = [/waterlooworks\.uwaterloo\.ca/];
    }
    canHandle(url) {
        return this.urlPatterns.some((p) => p.test(url));
    }
    async scrapeJobListing() {
        if (this.isLoginPage()) {
            console.log("[Slothing] Waterloo Works: Please log in first");
            return null;
        }
        try {
            await this.waitForElement('.dashboard-header__posting-title, [role="dialog"], .ReactModal__Content, .modal', 3000);
        }
        catch {
            if (!this.isLikelyPostingDetail()) {
                // No posting panel open — not a scrape error, just nothing to scrape.
                return null;
            }
        }
        if (!this.isLikelyPostingDetail())
            return null;
        const fields = this.collectFields();
        const { sourceJobId, title: panelTitle, company: panelCompany, } = this.parsePostingHeader(fields.title);
        const title = fields.title || panelTitle;
        const company = fields.organization || panelCompany;
        const description = this.composeDescription(fields) ||
            this.composeFallbackDescription(fields, title, company);
        if (!title || !description) {
            console.log("[Slothing] Waterloo Works scraper: Missing title or description");
            return null;
        }
        const location = this.composeLocation(fields);
        return {
            title,
            company: company || "Unknown Employer",
            location,
            description,
            requirements: this.parseBulletList(fields.requirements) ||
                this.extractRequirements(description),
            responsibilities: this.parseBulletList(fields.responsibilities),
            keywords: this.extractKeywords(description),
            // Slothing's extension schema caps optional strings at 500 chars and
            // WaterlooWorks puts the full benefits blurb in "Compensation and
            // Benefits". Take the first line/sentence so wage ranges survive.
            salary: this.condenseSalary(fields.salary),
            type: this.detectJobType(fields.jobType || description) || "internship",
            remote: this.detectRemoteFromFields(fields, location, description),
            url: window.location.href,
            source: this.source,
            sourceJobId,
            deadline: fields.deadline,
        };
    }
    async scrapeJobList() {
        // Modern WaterlooWorks renders the postings list in a virtualized SPA view
        // and the row summaries don't include full descriptions. Bulk-import from
        // the list view is provided by the orchestrator (see
        // waterloo-works-orchestrator.ts), which walks each row, opens its detail
        // panel, and calls scrapeJobListing() per row. scrapeJobList() itself stays
        // empty so the generic auto-detect path doesn't accidentally pick it up.
        return [];
    }
    isLoginPage() {
        const url = window.location.href.toLowerCase();
        return (url.includes("/cas/") ||
            url.includes("/login") ||
            url.includes("/signin") ||
            document.querySelector('input[type="password"]') !== null);
    }
    isLikelyPostingDetail() {
        const text = this.visibleText();
        if (/keep me logged in|session timeout|stay logged in/i.test(text)) {
            return false;
        }
        if (this.hasStructuredPostingFields())
            return true;
        if (!/job posting information/i.test(text) || !/job title/i.test(text))
            return false;
        const detailRoot = this.postingDetailRoot();
        if (!detailRoot)
            return false;
        return /job posting information/i.test(detailRoot.textContent || text);
    }
    hasStructuredPostingFields() {
        return Array.from(document.querySelectorAll(".tag__key-value-list.js--question--container")).some((block) => /^job title$/i.test(this.normalizeLabel(block.querySelector(".label")?.textContent || "")));
    }
    postingDetailRoot() {
        return (Array.from(document.querySelectorAll('[role="dialog"], .ReactModal__Content, .modal, main, body')).find((candidate) => /job posting information/i.test(candidate.textContent || "")) || null);
    }
    parsePostingHeader(title) {
        const header = document.querySelector(".dashboard-header__posting-title");
        if (header) {
            const h2Text = header.querySelector("h2")?.textContent?.trim();
            const idMatch = (header.textContent || "").match(/\b(\d{4,10})\b/);
            const company = this.findHeaderCompany(header, h2Text);
            return { sourceJobId: idMatch?.[1], title: h2Text, company };
        }
        const lines = this.visibleLines();
        const idMatch = this.visibleText().match(/\b(\d{4,10})\b/);
        const heading = Array.from(document.querySelectorAll("h1,h2,h3"))
            .map((el) => el.textContent?.trim() || "")
            .find((text) => text.length > 10 &&
            !/waterlooworks|job posting information|overview|map|ratings/i.test(text));
        const resolvedTitle = title || heading;
        let company;
        if (resolvedTitle) {
            const titleIndex = lines.findIndex((line) => line === resolvedTitle);
            const next = titleIndex >= 0 ? lines[titleIndex + 1] : undefined;
            if (next && !/new|viewed|deadline|overview|map|ratings/i.test(next)) {
                company = next;
            }
        }
        return { sourceJobId: idMatch?.[1], title: resolvedTitle, company };
    }
    findHeaderCompany(header, title) {
        const container = header.closest("section, header, [role='dialog']");
        const candidates = [
            header.nextElementSibling?.textContent?.trim(),
            container?.querySelector("p")?.textContent?.trim(),
        ];
        return candidates.find((value) => !!value &&
            value !== title &&
            !/new|viewed|deadline|overview|map|ratings/i.test(value));
    }
    collectFields() {
        const bag = {};
        const blocks = document.querySelectorAll(".tag__key-value-list.js--question--container");
        for (const block of blocks) {
            const labelRaw = block.querySelector(".label")?.textContent?.trim();
            if (!labelRaw)
                continue;
            const label = this.normalizeLabel(labelRaw);
            const valueEl = block.querySelector(".value");
            const value = valueEl
                ? valueEl.innerHTML
                : this.stripLabelFromBlock(block, labelRaw);
            if (!value)
                continue;
            this.assignField(bag, label, value);
        }
        if (blocks.length === 0) {
            this.collectPlainTextFields(bag);
        }
        return bag;
    }
    collectPlainTextFields(bag) {
        const lines = this.visibleLines();
        for (let i = 0; i < lines.length; i += 1) {
            const match = lines[i].match(/^([^:]{3,80}):\s*(.*)$/);
            if (!match)
                continue;
            const label = this.normalizeLabel(match[1]);
            const sameLineValue = match[2]?.trim();
            const value = sameLineValue ||
                lines.slice(i + 1).find((line) => !/^([^:]{3,80}):\s*/.test(line));
            if (!value)
                continue;
            this.assignField(bag, label, value);
        }
    }
    // "Work Term:  " → "work term"
    normalizeLabel(label) {
        return label
            .replace(/\s+/g, " ")
            .replace(/[:\s]+$/, "")
            .toLowerCase();
    }
    stripLabelFromBlock(block, label) {
        const clone = block.cloneNode(true);
        clone.querySelector(".label")?.remove();
        return (clone.innerHTML.trim() ||
            clone.textContent?.replace(label, "").trim() ||
            "");
    }
    assignField(bag, normalizedLabel, htmlValue) {
        const cleaned = this.cleanDescription(htmlValue);
        for (const [key, candidates] of Object.entries(FIELD_LABELS)) {
            if (candidates.some((c) => this.matchesLabel(key, normalizedLabel, c))) {
                if (!bag[key]) {
                    bag[key] =
                        key === "responsibilities" ||
                            key === "requirements" ||
                            key === "summary"
                            ? htmlValue // keep HTML for bullet parsing
                            : cleaned;
                }
                return;
            }
        }
    }
    matchesLabel(key, normalizedLabel, candidate) {
        const normalizedCandidate = candidate.toLowerCase();
        if (normalizedLabel === normalizedCandidate)
            return true;
        // WaterlooWorks has labels like "Employer Internal Job Number". That is
        // not the employer/company field and must not override the header company.
        if (key === "organization" &&
            (normalizedCandidate === "employer" || normalizedCandidate === "company")) {
            return false;
        }
        return normalizedLabel.startsWith(`${normalizedCandidate} `);
    }
    composeDescription(fields) {
        const parts = [];
        if (fields.summary)
            parts.push(this.cleanDescription(fields.summary));
        if (fields.responsibilities) {
            parts.push("Responsibilities:");
            parts.push(this.cleanDescription(fields.responsibilities));
        }
        if (fields.requirements) {
            parts.push("Required Skills:");
            parts.push(this.cleanDescription(fields.requirements));
        }
        return parts.filter(Boolean).join("\n\n").trim();
    }
    composeFallbackDescription(fields, title, company) {
        const parts = [
            title && company ? `${title} at ${company}` : title,
            fields.jobType,
            fields.workTerm,
            "WaterlooWorks job details visible; full description not loaded.",
        ];
        return parts.filter((part) => !!part).join("\n");
    }
    composeLocation(fields) {
        if (fields.locationFull)
            return fields.locationFull;
        const pieces = [
            fields.locationCity,
            fields.locationRegion,
            fields.locationCountry,
        ]
            .map((p) => p?.trim())
            .filter((p) => !!p && p.length > 0);
        return pieces.length > 0 ? pieces.join(", ") : undefined;
    }
    detectRemoteFromFields(fields, location, description) {
        const arrangement = (fields.employmentArrangement || "").toLowerCase();
        if (/remote|virtual|work from home|distributed/.test(arrangement))
            return true;
        if (/hybrid/.test(arrangement))
            return true; // hybrid implies some remote
        return this.detectRemote(location || "") || this.detectRemote(description);
    }
    condenseSalary(raw) {
        if (!raw)
            return undefined;
        const trimmed = raw.trim();
        if (trimmed.length === 0)
            return undefined;
        // Prefer the first line / sentence — usually the wage range. If still too
        // long, hard-cap at 480 chars with an ellipsis so the schema validator
        // accepts it (limit is 500).
        const firstChunk = trimmed.split(/\n\n|\n(?=[A-Z])/)[0]?.trim() || trimmed;
        if (firstChunk.length <= 480)
            return firstChunk;
        return firstChunk.slice(0, 477) + "...";
    }
    parseBulletList(html) {
        if (!html)
            return undefined;
        const doc = new DOMParser().parseFromString(html, "text/html");
        const items = Array.from(doc.querySelectorAll("li"))
            .map((li) => li.textContent?.trim() || "")
            .filter((t) => t.length > 0);
        return items.length > 0 ? items : undefined;
    }
    visibleText() {
        return (document.body.innerText ||
            document.body.textContent ||
            "");
    }
    visibleLines() {
        return this.visibleText()
            .split(/\n+/)
            .map((line) => line.trim())
            .filter(Boolean);
    }
}

;// ./src/content/scrapers/indeed-scraper.ts
// Indeed job scraper

class IndeedScraper extends BaseScraper {
    constructor() {
        super(...arguments);
        this.source = "indeed";
        this.urlPatterns = [
            /indeed\.com\/viewjob/,
            /indeed\.com\/jobs\//,
            /indeed\.com\/job\//,
            /indeed\.com\/rc\/clk/,
        ];
    }
    canHandle(url) {
        return this.urlPatterns.some((p) => p.test(url));
    }
    async scrapeJobListing() {
        // Wait for job details to load
        try {
            await this.waitForElement('.jobsearch-JobInfoHeader-title, [data-testid="jobsearch-JobInfoHeader-title"]', 3000);
        }
        catch {
            // Continue with available data
        }
        const title = this.extractJobTitle();
        const company = this.extractCompany();
        const location = this.extractLocation();
        const description = this.extractDescription();
        if (!title || !company || !description) {
            console.log("[Slothing] Indeed scraper: Missing required fields", {
                title,
                company,
                description: !!description,
            });
            return null;
        }
        const structuredData = this.extractStructuredData();
        return {
            title,
            company,
            location: location || structuredData?.location,
            description,
            requirements: this.extractRequirements(description),
            keywords: this.extractKeywords(description),
            salary: this.extractSalaryFromPage() ||
                this.extractSalary(description) ||
                structuredData?.salary,
            type: this.detectJobType(description),
            remote: this.detectRemote(location || "") || this.detectRemote(description),
            url: window.location.href,
            source: this.source,
            sourceJobId: this.extractJobId(),
            postedAt: structuredData?.postedAt,
        };
    }
    async scrapeJobList() {
        const jobs = [];
        // Job cards in search results
        const jobCards = document.querySelectorAll('.job_seen_beacon, .jobsearch-ResultsList > li, [data-testid="job-card"]');
        for (const card of jobCards) {
            try {
                const titleEl = card.querySelector('.jobTitle, [data-testid="jobTitle"], h2.jobTitle a, .jcs-JobTitle');
                const companyEl = card.querySelector('.companyName, [data-testid="company-name"], .company_location .companyName');
                const locationEl = card.querySelector('.companyLocation, [data-testid="text-location"], .company_location .companyLocation');
                const salaryEl = card.querySelector('.salary-snippet-container, [data-testid="attribute_snippet_testid"], .estimated-salary');
                const title = titleEl?.textContent?.trim();
                const company = companyEl?.textContent?.trim();
                const location = locationEl?.textContent?.trim();
                const salary = salaryEl?.textContent?.trim();
                // Get URL from title link or data attribute
                let url = titleEl?.href;
                if (!url) {
                    const jobKey = card.getAttribute("data-jk");
                    if (jobKey) {
                        url = `https://www.indeed.com/viewjob?jk=${jobKey}`;
                    }
                }
                if (title && company && url) {
                    jobs.push({
                        title,
                        company,
                        location,
                        salary,
                        description: "",
                        requirements: [],
                        url,
                        source: this.source,
                        sourceJobId: this.extractJobIdFromUrl(url),
                    });
                }
            }
            catch (err) {
                console.error("[Slothing] Error scraping Indeed job card:", err);
            }
        }
        return jobs;
    }
    extractJobTitle() {
        const selectors = [
            ".jobsearch-JobInfoHeader-title",
            '[data-testid="jobsearch-JobInfoHeader-title"]',
            "h1.jobsearch-JobInfoHeader-title",
            ".icl-u-xs-mb--xs h1",
            'h1[class*="JobInfoHeader"]',
        ];
        for (const selector of selectors) {
            const text = this.extractTextContent(selector);
            if (text)
                return text;
        }
        return null;
    }
    extractCompany() {
        const selectors = [
            '[data-testid="inlineHeader-companyName"] a',
            '[data-testid="inlineHeader-companyName"]',
            ".jobsearch-InlineCompanyRating-companyHeader a",
            ".jobsearch-InlineCompanyRating a",
            ".icl-u-lg-mr--sm a",
            '[data-company-name="true"]',
        ];
        for (const selector of selectors) {
            const text = this.extractTextContent(selector);
            if (text)
                return text;
        }
        return null;
    }
    extractLocation() {
        const selectors = [
            '[data-testid="inlineHeader-companyLocation"]',
            '[data-testid="job-location"]',
            ".jobsearch-JobInfoHeader-subtitle > div:nth-child(2)",
            ".jobsearch-InlineCompanyRating + div",
            ".icl-u-xs-mt--xs .icl-u-textColor--secondary",
        ];
        for (const selector of selectors) {
            const text = this.extractTextContent(selector);
            if (text && !text.includes("reviews") && !text.includes("rating")) {
                return text;
            }
        }
        return null;
    }
    extractDescription() {
        const selectors = [
            "#jobDescriptionText",
            '[data-testid="jobDescriptionText"]',
            ".jobsearch-jobDescriptionText",
            ".jobsearch-JobComponent-description",
        ];
        for (const selector of selectors) {
            const html = this.extractHtmlContent(selector);
            if (html) {
                return this.cleanDescription(html);
            }
        }
        return null;
    }
    extractSalaryFromPage() {
        const selectors = [
            '[data-testid="jobsearch-JobMetadataHeader-salaryInfo"]',
            ".jobsearch-JobMetadataHeader-salaryInfo",
            "#salaryInfoAndJobType .attribute_snippet",
            ".jobsearch-JobInfoHeader-salary",
        ];
        for (const selector of selectors) {
            const text = this.extractTextContent(selector);
            if (text && text.includes("$")) {
                return text;
            }
        }
        return undefined;
    }
    extractJobId() {
        // From URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const jk = urlParams.get("jk");
        if (jk)
            return jk;
        // From URL path
        const match = window.location.href.match(/\/job\/([a-f0-9]+)/i);
        return match?.[1];
    }
    extractJobIdFromUrl(url) {
        try {
            const urlObj = new URL(url);
            const jk = urlObj.searchParams.get("jk");
            if (jk)
                return jk;
            const match = url.match(/\/job\/([a-f0-9]+)/i);
            return match?.[1];
        }
        catch {
            return undefined;
        }
    }
    extractStructuredData() {
        try {
            const ldJson = document.querySelector('script[type="application/ld+json"]');
            if (!ldJson?.textContent)
                return null;
            const data = JSON.parse(ldJson.textContent);
            // Indeed may have an array of structured data
            const jobData = Array.isArray(data)
                ? data.find((d) => d["@type"] === "JobPosting")
                : data;
            if (!jobData || jobData["@type"] !== "JobPosting")
                return null;
            return {
                location: jobData.jobLocation?.address?.addressLocality ||
                    jobData.jobLocation?.address?.name,
                salary: jobData.baseSalary?.value
                    ? `$${jobData.baseSalary.value.minValue || ""}-${jobData.baseSalary.value.maxValue || ""} ${jobData.baseSalary.value.unitText || ""}`
                    : undefined,
                postedAt: jobData.datePosted,
            };
        }
        catch {
            return null;
        }
    }
}

;// ./src/content/scrapers/greenhouse-scraper.ts
// Greenhouse job board scraper

class GreenhouseScraper extends BaseScraper {
    constructor() {
        super(...arguments);
        this.source = "greenhouse";
        this.urlPatterns = [
            /boards\.greenhouse\.io\/[\w-]+\/jobs\/\d+/,
            /[\w-]+\.greenhouse\.io\/jobs\/\d+/,
            /greenhouse\.io\/embed\/job_app/,
        ];
    }
    canHandle(url) {
        return this.urlPatterns.some((p) => p.test(url));
    }
    async scrapeJobListing() {
        // Wait for job content to load
        try {
            await this.waitForElement(".app-title, #header .company-name, .job-title", 3000);
        }
        catch {
            // Continue with available data
        }
        const title = this.extractJobTitle();
        const company = this.extractCompany();
        const location = this.extractLocation();
        const description = this.extractDescription();
        if (!title || !company || !description) {
            console.log("[Slothing] Greenhouse scraper: Missing required fields", {
                title,
                company,
                description: !!description,
            });
            return null;
        }
        const structuredData = this.extractStructuredData();
        return {
            title,
            company,
            location: location || structuredData?.location,
            description,
            requirements: this.extractRequirements(description),
            keywords: this.extractKeywords(description),
            salary: this.extractSalary(description) || structuredData?.salary,
            type: this.detectJobType(description) || structuredData?.type,
            remote: this.detectRemote(location || "") || this.detectRemote(description),
            url: window.location.href,
            source: this.source,
            sourceJobId: this.extractJobId(),
            postedAt: structuredData?.postedAt,
        };
    }
    async scrapeJobList() {
        const jobs = [];
        // Job cards on department/listing pages
        const jobCards = document.querySelectorAll('.opening, .job-post, [data-mapped="true"], section.level-0 > div');
        for (const card of jobCards) {
            try {
                const titleEl = card.querySelector("a, .opening-title, .job-title");
                const locationEl = card.querySelector(".location, .job-location, span:last-child");
                const title = titleEl?.textContent?.trim();
                const location = locationEl?.textContent?.trim();
                const url = titleEl?.href;
                // Company is usually in header
                const company = this.extractCompany();
                if (title && url && company) {
                    jobs.push({
                        title,
                        company,
                        location,
                        description: "",
                        requirements: [],
                        url,
                        source: this.source,
                        sourceJobId: this.extractJobIdFromUrl(url),
                    });
                }
            }
            catch (err) {
                console.error("[Slothing] Error scraping Greenhouse job card:", err);
            }
        }
        return jobs;
    }
    extractJobTitle() {
        const selectors = [
            ".app-title",
            ".job-title",
            "h1.heading",
            ".job-info h1",
            "#header h1",
            'h1[class*="job"]',
            ".hero h1",
        ];
        for (const selector of selectors) {
            const text = this.extractTextContent(selector);
            if (text)
                return text;
        }
        // Try structured data
        const ldJson = this.extractStructuredData();
        if (ldJson?.title)
            return ldJson.title;
        return null;
    }
    extractCompany() {
        const selectors = [
            ".company-name",
            "#header .company-name",
            ".logo-wrapper img[alt]",
            ".company-header .name",
            'meta[property="og:site_name"]',
        ];
        for (const selector of selectors) {
            if (selector.includes("meta")) {
                const meta = document.querySelector(selector);
                const content = meta?.getAttribute("content");
                if (content)
                    return content;
            }
            else if (selector.includes("img[alt]")) {
                const img = document.querySelector(selector);
                const alt = img?.getAttribute("alt");
                if (alt)
                    return alt;
            }
            else {
                const text = this.extractTextContent(selector);
                if (text)
                    return text;
            }
        }
        // Extract from URL (boards.greenhouse.io/COMPANY/jobs/...)
        const match = window.location.href.match(/greenhouse\.io\/([^/]+)/);
        if (match && match[1] !== "jobs") {
            return match[1]
                .replace(/-/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase());
        }
        return null;
    }
    extractLocation() {
        const selectors = [
            ".location",
            ".job-location",
            ".company-location",
            ".job-info .location",
            "#header .location",
        ];
        for (const selector of selectors) {
            const text = this.extractTextContent(selector);
            if (text)
                return text;
        }
        return null;
    }
    extractDescription() {
        const selectors = [
            "#content",
            ".job-description",
            ".content-wrapper .content",
            "#job_description",
            ".job-content",
            ".job-info .content",
        ];
        for (const selector of selectors) {
            const html = this.extractHtmlContent(selector);
            if (html && html.length > 100) {
                return this.cleanDescription(html);
            }
        }
        return null;
    }
    extractJobId() {
        // From URL: boards.greenhouse.io/company/jobs/12345
        const match = window.location.href.match(/\/jobs\/(\d+)/);
        return match?.[1];
    }
    extractJobIdFromUrl(url) {
        const match = url.match(/\/jobs\/(\d+)/);
        return match?.[1];
    }
    extractStructuredData() {
        try {
            const ldJsonElements = document.querySelectorAll('script[type="application/ld+json"]');
            for (const el of ldJsonElements) {
                if (!el.textContent)
                    continue;
                const data = JSON.parse(el.textContent);
                const jobData = Array.isArray(data)
                    ? data.find((d) => d["@type"] === "JobPosting")
                    : data;
                if (!jobData || jobData["@type"] !== "JobPosting")
                    continue;
                const employmentType = jobData.employmentType?.toLowerCase();
                let type;
                if (employmentType?.includes("full"))
                    type = "full-time";
                else if (employmentType?.includes("part"))
                    type = "part-time";
                else if (employmentType?.includes("contract"))
                    type = "contract";
                else if (employmentType?.includes("intern"))
                    type = "internship";
                return {
                    title: jobData.title,
                    location: typeof jobData.jobLocation === "string"
                        ? jobData.jobLocation
                        : jobData.jobLocation?.address?.addressLocality ||
                            jobData.jobLocation?.address?.name ||
                            jobData.jobLocation?.name,
                    salary: jobData.baseSalary?.value
                        ? `$${jobData.baseSalary.value.minValue || ""}-${jobData.baseSalary.value.maxValue || ""}`
                        : undefined,
                    postedAt: jobData.datePosted,
                    type,
                };
            }
            return null;
        }
        catch {
            return null;
        }
    }
}

;// ./src/content/scrapers/lever-scraper.ts
// Lever job board scraper

class LeverScraper extends BaseScraper {
    constructor() {
        super(...arguments);
        this.source = "lever";
        this.urlPatterns = [
            /jobs\.lever\.co\/[\w-]+\/[\w-]+/,
            /[\w-]+\.lever\.co\/[\w-]+/,
        ];
    }
    canHandle(url) {
        return this.urlPatterns.some((p) => p.test(url));
    }
    async scrapeJobListing() {
        // Wait for job content to load
        try {
            await this.waitForElement(".posting-headline h2, .posting-headline h1, .section-wrapper", 3000);
        }
        catch {
            // Continue with available data
        }
        const title = this.extractJobTitle();
        const company = this.extractCompany();
        const location = this.extractLocation();
        const description = this.extractDescription();
        if (!title || !company || !description) {
            console.log("[Slothing] Lever scraper: Missing required fields", {
                title,
                company,
                description: !!description,
            });
            return null;
        }
        const structuredData = this.extractStructuredData();
        const commitment = this.extractCommitment();
        return {
            title,
            company,
            location: location || structuredData?.location,
            description,
            requirements: this.extractRequirements(description),
            keywords: this.extractKeywords(description),
            salary: this.extractSalary(description) || structuredData?.salary,
            type: this.detectJobTypeFromCommitment(commitment) ||
                this.detectJobType(description),
            remote: this.detectRemote(location || "") || this.detectRemote(description),
            url: window.location.href,
            source: this.source,
            sourceJobId: this.extractJobId(),
            postedAt: structuredData?.postedAt,
        };
    }
    async scrapeJobList() {
        const jobs = [];
        // Job postings on company page
        const jobCards = document.querySelectorAll('.posting, [data-qa="posting-name"]');
        for (const card of jobCards) {
            try {
                const titleEl = card.querySelector('.posting-title h5, .posting-name, a[data-qa="posting-name"]');
                const locationEl = card.querySelector(".location, .posting-categories .sort-by-location, .workplaceTypes");
                const commitmentEl = card.querySelector(".commitment, .posting-categories .sort-by-commitment");
                const title = titleEl?.textContent?.trim();
                const location = locationEl?.textContent?.trim();
                const commitment = commitmentEl?.textContent?.trim();
                const url = card.querySelector('a.posting-title, a[data-qa="posting-name"]')?.href || card.href;
                const company = this.extractCompany();
                if (title && url && company) {
                    jobs.push({
                        title,
                        company,
                        location,
                        description: "",
                        requirements: [],
                        url,
                        source: this.source,
                        sourceJobId: this.extractJobIdFromUrl(url),
                        type: this.detectJobTypeFromCommitment(commitment ?? null),
                    });
                }
            }
            catch (err) {
                console.error("[Slothing] Error scraping Lever job card:", err);
            }
        }
        return jobs;
    }
    extractJobTitle() {
        const selectors = [
            ".posting-headline h2",
            ".posting-headline h1",
            '[data-qa="posting-name"]',
            ".posting-header h2",
            ".section.page-centered.posting-header h1",
        ];
        for (const selector of selectors) {
            const text = this.extractTextContent(selector);
            if (text)
                return text;
        }
        return null;
    }
    extractCompany() {
        // Try logo alt text
        const logo = document.querySelector(".main-header-logo img, .posting-header .logo img, header img");
        if (logo) {
            const alt = logo.getAttribute("alt");
            if (alt && alt !== "Company Logo")
                return alt;
        }
        // Try page title
        const pageTitle = document.title;
        if (pageTitle) {
            // Format: "Job Title - Company Name"
            const parts = pageTitle.split(" - ");
            if (parts.length >= 2) {
                return parts[parts.length - 1].replace(" Jobs", "").trim();
            }
        }
        // Extract from URL
        const match = window.location.href.match(/lever\.co\/([^/]+)/);
        if (match) {
            return match[1]
                .replace(/-/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase());
        }
        return null;
    }
    extractLocation() {
        const selectors = [
            ".posting-categories .location",
            ".posting-headline .location",
            ".sort-by-location",
            ".workplaceTypes",
            '[data-qa="posting-location"]',
        ];
        for (const selector of selectors) {
            const text = this.extractTextContent(selector);
            if (text)
                return text;
        }
        return null;
    }
    extractCommitment() {
        const selectors = [
            ".posting-categories .commitment",
            ".sort-by-commitment",
            '[data-qa="posting-commitment"]',
        ];
        for (const selector of selectors) {
            const text = this.extractTextContent(selector);
            if (text)
                return text;
        }
        return null;
    }
    extractDescription() {
        const selectors = [
            ".posting-page .content",
            ".section-wrapper.page-full-width",
            ".section.page-centered",
            '[data-qa="job-description"]',
            ".posting-description",
        ];
        for (const selector of selectors) {
            // For Lever, we want to get all content sections
            const sections = document.querySelectorAll(selector);
            if (sections.length > 0) {
                const html = Array.from(sections)
                    .map((s) => s.innerHTML)
                    .join("\n\n");
                if (html.length > 100) {
                    return this.cleanDescription(html);
                }
            }
        }
        // Try getting the main content area
        const mainContent = document.querySelector(".content-wrapper .content, main .content");
        if (mainContent) {
            return this.cleanDescription(mainContent.innerHTML);
        }
        return null;
    }
    extractJobId() {
        // From URL: jobs.lever.co/company/job-id-uuid
        const match = window.location.href.match(/lever\.co\/[^/]+\/([a-f0-9-]+)/i);
        return match?.[1];
    }
    extractJobIdFromUrl(url) {
        const match = url.match(/lever\.co\/[^/]+\/([a-f0-9-]+)/i);
        return match?.[1];
    }
    detectJobTypeFromCommitment(commitment) {
        if (!commitment)
            return undefined;
        const lower = commitment.toLowerCase();
        if (lower.includes("full-time") || lower.includes("full time"))
            return "full-time";
        if (lower.includes("part-time") || lower.includes("part time"))
            return "part-time";
        if (lower.includes("contract") || lower.includes("contractor"))
            return "contract";
        if (lower.includes("intern"))
            return "internship";
        return undefined;
    }
    extractStructuredData() {
        try {
            const ldJsonElements = document.querySelectorAll('script[type="application/ld+json"]');
            for (const el of ldJsonElements) {
                if (!el.textContent)
                    continue;
                const data = JSON.parse(el.textContent);
                const jobData = Array.isArray(data)
                    ? data.find((d) => d["@type"] === "JobPosting")
                    : data;
                if (!jobData || jobData["@type"] !== "JobPosting")
                    continue;
                return {
                    location: typeof jobData.jobLocation === "string"
                        ? jobData.jobLocation
                        : jobData.jobLocation?.address?.addressLocality ||
                            jobData.jobLocation?.name,
                    salary: jobData.baseSalary?.value
                        ? `$${jobData.baseSalary.value.minValue || ""}-${jobData.baseSalary.value.maxValue || ""}`
                        : undefined,
                    postedAt: jobData.datePosted,
                };
            }
            return null;
        }
        catch {
            return null;
        }
    }
}

;// ./src/content/scrapers/generic-scraper.ts
// Generic job scraper for unknown sites

class GenericScraper extends BaseScraper {
    constructor() {
        super(...arguments);
        this.source = "unknown";
        this.urlPatterns = [];
    }
    canHandle(_url) {
        // Generic scraper always returns true as fallback
        return true;
    }
    async scrapeJobListing() {
        // Try to extract job information using common patterns
        // Check for structured data first
        const structuredData = this.extractStructuredData();
        if (structuredData) {
            return structuredData;
        }
        // Try common selectors
        const title = this.findTitle();
        const company = this.findCompany();
        const description = this.findDescription();
        if (!title || !description) {
            console.log("[Slothing] Generic scraper: Could not find required fields");
            return null;
        }
        const location = this.findLocation();
        return {
            title,
            company: company || "Unknown Company",
            location: location || undefined,
            description,
            requirements: this.extractRequirements(description),
            keywords: this.extractKeywords(description),
            salary: this.extractSalary(description),
            type: this.detectJobType(description),
            remote: this.detectRemote(location || "") || this.detectRemote(description),
            url: window.location.href,
            source: this.detectSource(),
        };
    }
    async scrapeJobList() {
        // Generic scraping of job lists is unreliable
        // Return empty array for unknown sites
        return [];
    }
    extractStructuredData() {
        try {
            // Look for JSON-LD job posting schema
            const scripts = document.querySelectorAll('script[type="application/ld+json"]');
            for (const script of scripts) {
                const data = JSON.parse(script.textContent || "");
                // Handle single job posting
                if (data["@type"] === "JobPosting") {
                    return this.parseJobPostingSchema(data);
                }
                // Handle array of items
                if (Array.isArray(data)) {
                    const jobPosting = data.find((item) => item["@type"] === "JobPosting");
                    if (jobPosting) {
                        return this.parseJobPostingSchema(jobPosting);
                    }
                }
                // Handle @graph
                if (data["@graph"]) {
                    const jobPosting = data["@graph"].find((item) => item["@type"] === "JobPosting");
                    if (jobPosting) {
                        return this.parseJobPostingSchema(jobPosting);
                    }
                }
            }
        }
        catch (err) {
            console.log("[Slothing] Could not parse structured data:", err);
        }
        return null;
    }
    parseJobPostingSchema(data) {
        const title = data.title || "";
        const company = data.hiringOrganization?.name || "";
        const description = data.description || "";
        // Extract location
        let location;
        const jobLocation = data.jobLocation;
        if (jobLocation) {
            const address = jobLocation.address;
            if (address) {
                location = [
                    address.addressLocality,
                    address.addressRegion,
                    address.addressCountry,
                ]
                    .filter(Boolean)
                    .join(", ");
            }
        }
        // Extract salary
        let salary;
        const baseSalary = data.baseSalary;
        if (baseSalary) {
            const value = baseSalary.value;
            if (value) {
                const currency = baseSalary.currency || "USD";
                const min = value.minValue;
                const max = value.maxValue;
                if (min && max) {
                    salary = `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
                }
                else if (value) {
                    salary = `${currency} ${value.toLocaleString()}`;
                }
            }
        }
        return {
            title,
            company,
            location,
            description: this.cleanDescription(description),
            requirements: this.extractRequirements(description),
            keywords: this.extractKeywords(description),
            salary,
            type: this.parseEmploymentType(data.employmentType),
            remote: this.detectRemote(description),
            url: window.location.href,
            source: this.detectSource(),
            postedAt: data.datePosted,
        };
    }
    parseEmploymentType(type) {
        if (!type)
            return undefined;
        const lower = type.toLowerCase();
        if (lower.includes("full"))
            return "full-time";
        if (lower.includes("part"))
            return "part-time";
        if (lower.includes("contract") || lower.includes("temporary"))
            return "contract";
        if (lower.includes("intern"))
            return "internship";
        return undefined;
    }
    findTitle() {
        // Common title selectors
        const selectors = [
            'h1[class*="title"]',
            'h1[class*="job"]',
            ".job-title",
            ".posting-title",
            '[class*="job-title"]',
            '[class*="posting-title"]',
            "h1",
        ];
        for (const selector of selectors) {
            const text = this.extractTextContent(selector);
            if (text && text.length > 3 && text.length < 200) {
                // Filter out common non-title content
                if (!text.toLowerCase().includes("sign in") &&
                    !text.toLowerCase().includes("log in")) {
                    return text;
                }
            }
        }
        // Try document title
        const docTitle = document.title;
        if (docTitle && docTitle.length > 5) {
            // Remove common suffixes
            const cleaned = docTitle
                .replace(/\s*[-|]\s*.+$/, "")
                .replace(/\s*at\s+.+$/i, "")
                .trim();
            if (cleaned.length > 3) {
                return cleaned;
            }
        }
        return null;
    }
    findCompany() {
        const selectors = [
            '[class*="company-name"]',
            '[class*="employer"]',
            '[class*="organization"]',
            ".company",
            ".employer",
            'a[href*="company"]',
        ];
        for (const selector of selectors) {
            const text = this.extractTextContent(selector);
            if (text && text.length > 1 && text.length < 100) {
                return text;
            }
        }
        // Try meta tags
        const ogSiteName = document.querySelector('meta[property="og:site_name"]');
        if (ogSiteName) {
            const content = ogSiteName.getAttribute("content");
            if (content)
                return content;
        }
        return null;
    }
    findDescription() {
        const selectors = [
            ".job-description",
            ".posting-description",
            '[class*="job-description"]',
            '[class*="posting-description"]',
            '[class*="description"]',
            "article",
            ".content",
            "main",
        ];
        for (const selector of selectors) {
            const html = this.extractHtmlContent(selector);
            if (html && html.length > 100) {
                return this.cleanDescription(html);
            }
        }
        return null;
    }
    findLocation() {
        const selectors = [
            '[class*="location"]',
            '[class*="address"]',
            ".location",
            ".job-location",
        ];
        for (const selector of selectors) {
            const text = this.extractTextContent(selector);
            if (text && text.length > 2 && text.length < 100) {
                return text;
            }
        }
        return null;
    }
    detectSource() {
        const hostname = window.location.hostname.toLowerCase();
        // Remove common prefixes
        const cleaned = hostname
            .replace(/^www\./, "")
            .replace(/^jobs\./, "")
            .replace(/^careers\./, "");
        // Extract main domain
        const parts = cleaned.split(".");
        if (parts.length >= 2) {
            return parts[parts.length - 2];
        }
        return cleaned;
    }
}

;// ./src/content/scrapers/scraper-registry.ts
// Scraper registry - maps URLs to appropriate scrapers






// Initialize all scrapers
const scrapers = [
    new LinkedInScraper(),
    new WaterlooWorksScraper(),
    new IndeedScraper(),
    new GreenhouseScraper(),
    new LeverScraper(),
];
const genericScraper = new GenericScraper();
/**
 * Get the appropriate scraper for a URL
 */
function getScraperForUrl(url) {
    const scraper = scrapers.find((s) => s.canHandle(url));
    return scraper || genericScraper;
}
/**
 * Check if we have a specialized scraper for this URL
 */
function hasSpecializedScraper(url) {
    return scrapers.some((s) => s.canHandle(url));
}
/**
 * Get all available scraper sources
 */
function getAvailableSources() {
    return scrapers.map((s) => s.source);
}

;// ./src/content/scrapers/waterloo-works-orchestrator.ts
// Orchestrator for bulk WaterlooWorks scraping. Walks the visible postings
// table, opens each row's detail panel, runs the single-posting scraper, and
// yields the results. Two modes:
//
//   scrapeAllVisible()   — current page only
//   scrapeAllPaginated() — current page, then clicks "Next page" and repeats
//                          until there is no next page (or the hard cap hits).
//
// Lives in the content script. Pagination + row clicks rely on selectors
// observed on the live modern WW UI in 2026-05. If WW redesigns again, the
// orchestrator will return [] gracefully (no exceptions thrown to the caller).

const DEFAULT_THROTTLE_MS = 500;
const ROW_SELECTORS = [
    "table.data-viewer-table tbody tr.table__row--body",
    "table.data-viewer-table tbody tr",
    "table tbody tr.table__row--body",
    "table tbody tr",
];
const ROW_TITLE_LINK_SELECTOR = "td a[href='javascript:void(0)']";
const POSTING_PANEL_SELECTOR = ".dashboard-header__posting-title";
const NEXT_PAGE_SELECTOR = 'a.pagination__link[aria-label="Go to next page"]';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function isHidden(el) {
    if (!el)
        return true;
    return el.classList.contains("disabled");
}
function getWaterlooWorksRows() {
    for (const selector of ROW_SELECTORS) {
        const rows = Array.from(document.querySelectorAll(selector)).filter(isLikelyPostingRow);
        if (rows.length > 0)
            return dedupeElements(rows);
    }
    const linkRows = Array.from(document.querySelectorAll("table a[href='javascript:void(0)'], table button"))
        .map((el) => el.closest("tr"))
        .filter((row) => !!row)
        .filter(isLikelyPostingRow);
    return dedupeElements(linkRows);
}
function getWaterlooWorksNextPageLink() {
    return (document.querySelector(NEXT_PAGE_SELECTOR) ||
        Array.from(document.querySelectorAll("a, button"))
            .filter((el) => el instanceof HTMLAnchorElement)
            .find((el) => /next/i.test(el.getAttribute("aria-label") || el.textContent || "")) ||
        null);
}
function isLikelyPostingRow(row) {
    const text = normalizeText(row.textContent || "");
    if (!text)
        return false;
    if (/^(job title|organization|work term|location|level|applications?)$/i.test(text)) {
        return false;
    }
    if (row.querySelector("th"))
        return false;
    if (row.querySelector(ROW_TITLE_LINK_SELECTOR))
        return true;
    if (row.querySelector("a, button"))
        return text.length > 8;
    const cells = row.querySelectorAll("td, [role='cell']");
    return cells.length >= 2 && text.length > 12;
}
function normalizeText(value) {
    return value.replace(/\s+/g, " ").trim();
}
function dedupeElements(items) {
    return Array.from(new Set(items));
}
async function waitFor(predicate, timeoutMs, intervalMs = 100) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        if (predicate())
            return true;
        await sleep(intervalMs);
    }
    return false;
}
class WaterlooWorksOrchestrator {
    constructor() {
        this.scraper = new WaterlooWorksScraper();
    }
    /** Scrape every row visible on the current page. */
    async scrapeAllVisible(opts = {}) {
        const { jobs } = await this.scrapeCurrentPage({
            scrapedSoFar: 0,
            pageIndex: 1,
            opts,
            errors: [],
        });
        return jobs;
    }
    /** Walk every row across every page (capped by maxJobs / maxPages). */
    async scrapeAllPaginated(opts = {}) {
        const maxJobs = opts.maxJobs ?? 200;
        const maxPages = opts.maxPages ?? 50;
        const throttle = opts.throttleMs ?? DEFAULT_THROTTLE_MS;
        const allJobs = [];
        const errors = [];
        let pageIndex = 1;
        while (pageIndex <= maxPages && allJobs.length < maxJobs) {
            const { jobs, stopReason } = await this.scrapeCurrentPage({
                scrapedSoFar: allJobs.length,
                pageIndex,
                opts: { ...opts, maxJobs },
                errors,
            });
            allJobs.push(...jobs);
            if (stopReason === "cap-hit")
                break;
            // Try to go to the next page
            const advanced = await this.goToNextPage(throttle);
            if (!advanced)
                break;
            pageIndex++;
        }
        opts.onProgress?.({
            scrapedCount: allJobs.length,
            attemptedCount: allJobs.length,
            currentPage: pageIndex,
            totalRowsOnPage: this.getRows().length,
            done: true,
            errors,
        });
        return allJobs;
    }
    async scrapeCurrentPage(args) {
        const { scrapedSoFar, pageIndex, opts, errors } = args;
        const maxJobs = opts.maxJobs ?? 200;
        const throttle = opts.throttleMs ?? DEFAULT_THROTTLE_MS;
        const rows = this.getRows();
        const jobs = [];
        for (let i = 0; i < rows.length; i++) {
            if (scrapedSoFar + jobs.length >= maxJobs) {
                return { jobs, stopReason: "cap-hit" };
            }
            // Re-fetch the row each iteration — the DOM may rebuild after panel close.
            const liveRows = this.getRows();
            const row = liveRows[i];
            if (!row)
                break;
            const titleLink = row.querySelector(ROW_TITLE_LINK_SELECTOR);
            const expectedTitle = titleLink?.textContent?.trim();
            if (!titleLink)
                continue;
            // Capture the panel's current title so we can detect when the new
            // posting's content has actually rendered (the panel may already be
            // visible from a previous row).
            const previousPanelTitle = document
                .querySelector(POSTING_PANEL_SELECTOR + " h2")
                ?.textContent?.trim();
            titleLink.click();
            const opened = await waitFor(() => !!document.querySelector(POSTING_PANEL_SELECTOR), 5000);
            if (!opened) {
                errors.push(`row ${i} (${expectedTitle}): panel did not open`);
                continue;
            }
            // Wait for the panel's h2 to update (or appear for the first time) AND
            // for posting-specific field rows to be present. We check for a
            // recognisable label like "Job Title" — search filters share the same
            // .tag__key-value-list class so a non-zero count is not a reliable
            // signal that the posting body has rendered.
            const fullyRendered = await waitFor(() => {
                const h2 = document
                    .querySelector(POSTING_PANEL_SELECTOR + " h2")
                    ?.textContent?.trim();
                if (!h2)
                    return false;
                if (previousPanelTitle && h2 === previousPanelTitle)
                    return false;
                const labels = Array.from(document.querySelectorAll(".tag__key-value-list.js--question--container .label")).map((el) => (el.textContent || "").trim().toLowerCase());
                return labels.some((l) => l.startsWith("job title") || l.startsWith("organization"));
            }, 8000);
            if (!fullyRendered) {
                errors.push(`row ${i} (${expectedTitle}): panel never fully rendered`);
                continue;
            }
            await sleep(throttle);
            let job = null;
            try {
                job = await this.scraper.scrapeJobListing();
            }
            catch (err) {
                errors.push(`row ${i} (${expectedTitle}): ${String(err).slice(0, 200)}`);
            }
            if (job)
                jobs.push(job);
            opts.onProgress?.({
                scrapedCount: scrapedSoFar + jobs.length,
                attemptedCount: scrapedSoFar + i + 1,
                currentPage: pageIndex,
                totalRowsOnPage: liveRows.length,
                lastTitle: job?.title || expectedTitle,
                done: false,
                errors,
            });
            // No need to explicitly close the panel — clicking the next row replaces
            // its content. We only stop here if this was the last row on the page.
            await sleep(throttle);
        }
        return { jobs };
    }
    async goToNextPage(throttleMs) {
        const nextBtn = document.querySelector(NEXT_PAGE_SELECTOR);
        if (!nextBtn || isHidden(nextBtn))
            return false;
        // Capture the first row's signature to detect when the page has changed.
        const beforeSig = this.firstRowSignature();
        nextBtn.click();
        const changed = await waitFor(() => this.firstRowSignature() !== beforeSig && this.getRows().length > 0, 8000);
        if (!changed)
            return false;
        await sleep(throttleMs);
        return true;
    }
    getRows() {
        return getWaterlooWorksRows();
    }
    firstRowSignature() {
        const row = this.getRows()[0];
        return row?.textContent?.trim().slice(0, 120) || "";
    }
}

;// ./src/content/scrapers/greenhouse-orchestrator.ts
// P3/#39 — Bulk-scrape orchestrator for Greenhouse company boards.
//
// Walks the visible openings table on a `boards.greenhouse.io/<company>` page
// (and embedded board iframes that mount under the same host), assembles a
// `ScrapedJob` for each row using the meta we have on the listing page itself,
// and yields the result. Two modes mirror the WaterlooWorks orchestrator:
//
//   scrapeAllVisible()   — current page only
//   scrapeAllPaginated() — current page, then clicks "Next" if Greenhouse has
//                          paginated the board, repeating until no next link.
//
// Greenhouse boards are public, indexed by search engines, and intentionally
// syndicated by the hiring company — no anti-scrape posture. This orchestrator
// is part of the popup-driven UX (popup → BulkSourceCard → content script
// orchestrator) and never touches the apply flow.
//
// Selectors observed on `boards.greenhouse.io/<company>` (2026-05). Most
// Greenhouse boards still use the classic markup:
//   - `div.opening` per posting (newer boards: `.job-post`)
//   - `a` inside `div.opening` whose href points at `/<company>/jobs/<id>`
//   - `.location` sibling for the location
//   - department headings: `section.level-0 > h3`
//   - "Show more" / paginated load-more: rare for Greenhouse, but we look for
//     `a[rel="next"]` and a `button[aria-label="Next" i]` as defensive fallbacks.
const greenhouse_orchestrator_DEFAULT_THROTTLE_MS = 50;
const MAX_JOBS_DEFAULT = 200;
const MAX_PAGES_DEFAULT = 50;
// Selectors. Multiple variants because Greenhouse boards drift slowly — some
// older boards use `.opening`, newer ones use `.job-post`, and the
// `[data-mapped="true"]` attribute appears on a different generation again.
const greenhouse_orchestrator_ROW_SELECTORS = [
    "div.opening",
    ".job-post",
    '[data-mapped="true"]',
    "section.level-0 div.opening",
];
const NEXT_PAGE_SELECTORS = [
    'a[rel="next"]',
    'a[aria-label="Next page" i]',
    'button[aria-label="Next" i]',
    ".pagination .next a",
];
const greenhouse_orchestrator_sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function greenhouse_orchestrator_waitFor(predicate, timeoutMs, intervalMs = 100) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        if (predicate())
            return true;
        await greenhouse_orchestrator_sleep(intervalMs);
    }
    return false;
}
class GreenhouseOrchestrator {
    /** Quick detection helper used by content-script entry. */
    static canHandle(url) {
        return (/boards\.greenhouse\.io\//.test(url) ||
            /[\w-]+\.greenhouse\.io\//.test(url) ||
            /greenhouse\.io\/embed\/job_board/.test(url));
    }
    /** Scrape every row visible on the current page. */
    async scrapeAllVisible(opts = {}) {
        const { jobs } = await this.scrapeCurrentPage({
            scrapedSoFar: 0,
            pageIndex: 1,
            opts,
            errors: [],
            seenKeys: new Set(),
        });
        return jobs;
    }
    /** Walk every row on every page (capped by maxJobs / maxPages). */
    async scrapeAllPaginated(opts = {}) {
        const maxJobs = opts.maxJobs ?? MAX_JOBS_DEFAULT;
        const maxPages = opts.maxPages ?? MAX_PAGES_DEFAULT;
        const throttle = opts.throttleMs ?? greenhouse_orchestrator_DEFAULT_THROTTLE_MS;
        const allJobs = [];
        const errors = [];
        const seenKeys = new Set();
        let pageIndex = 1;
        while (pageIndex <= maxPages && allJobs.length < maxJobs) {
            const { jobs, stopReason } = await this.scrapeCurrentPage({
                scrapedSoFar: allJobs.length,
                pageIndex,
                opts: { ...opts, maxJobs },
                errors,
                seenKeys,
            });
            allJobs.push(...jobs);
            if (stopReason === "cap-hit")
                break;
            const advanced = await this.goToNextPage(throttle);
            if (!advanced)
                break;
            pageIndex++;
        }
        opts.onProgress?.({
            scrapedCount: allJobs.length,
            attemptedCount: allJobs.length,
            currentPage: pageIndex,
            totalRowsOnPage: this.getRows().length,
            done: true,
            errors,
        });
        return allJobs;
    }
    async scrapeCurrentPage(args) {
        const { scrapedSoFar, pageIndex, opts, errors, seenKeys } = args;
        const maxJobs = opts.maxJobs ?? MAX_JOBS_DEFAULT;
        const throttle = opts.throttleMs ?? greenhouse_orchestrator_DEFAULT_THROTTLE_MS;
        const rows = this.getRows();
        const jobs = [];
        const company = this.extractCompany();
        for (let i = 0; i < rows.length; i++) {
            if (scrapedSoFar + jobs.length >= maxJobs) {
                return { jobs, stopReason: "cap-hit" };
            }
            const row = rows[i];
            let job = null;
            try {
                job = this.scrapeRow(row, company);
            }
            catch (err) {
                // Per-row error isolation — never abort the whole batch.
                errors.push(`row ${i}: ${String(err).slice(0, 200)}`);
            }
            if (job) {
                const dedupeKey = this.dedupeKey(job);
                if (!seenKeys.has(dedupeKey)) {
                    seenKeys.add(dedupeKey);
                    jobs.push(job);
                }
            }
            opts.onProgress?.({
                scrapedCount: scrapedSoFar + jobs.length,
                attemptedCount: scrapedSoFar + i + 1,
                currentPage: pageIndex,
                totalRowsOnPage: rows.length,
                lastTitle: job?.title,
                done: false,
                errors,
            });
            if (throttle > 0)
                await greenhouse_orchestrator_sleep(throttle);
        }
        return { jobs };
    }
    /**
     * Build a ScrapedJob from a single Greenhouse listing row. We rely on the
     * listing-page metadata only (title, location, URL, sourceJobId) — fetching
     * the full description per row would require visiting each posting URL,
     * which is out of scope for the bulk orchestrator (#39). The description
     * is left empty so the import endpoint backfills/marks it as needing review.
     */
    scrapeRow(row, company) {
        const titleEl = row.querySelector("a.opening-title, .opening-title a, a");
        const title = titleEl?.textContent?.trim() ||
            row.querySelector(".job-title")?.textContent?.trim() ||
            "";
        if (!title) {
            throw new Error("missing title");
        }
        // Prefer the closest anchor with an href — Greenhouse markup often wraps
        // the entire row in an anchor.
        const anchor = titleEl ||
            row.querySelector('a[href*="/jobs/"]') ||
            (row.matches("a") ? row : null);
        const href = anchor?.getAttribute("href") || "";
        const url = href ? new URL(href, window.location.href).toString() : "";
        const locationEl = row.querySelector(".location, .job-location, .opening-location");
        const location = locationEl?.textContent?.trim() || undefined;
        const sourceJobId = this.extractJobIdFromUrl(url);
        return {
            title,
            company,
            location,
            // Bulk mode: listing-page snippets are short and inconsistent across
            // Greenhouse boards, so leave description empty rather than ship junk.
            description: "",
            requirements: [],
            url: url || window.location.href,
            source: "greenhouse",
            sourceJobId,
        };
    }
    /**
     * Extract the hiring company. Greenhouse boards use one of:
     *   - <meta property="og:site_name">  ← most reliable
     *   - `#header .company-name`
     *   - first segment of the URL path: `boards.greenhouse.io/<company>/...`
     */
    extractCompany() {
        const ogSiteName = document
            .querySelector('meta[property="og:site_name"]')
            ?.getAttribute("content");
        if (ogSiteName)
            return ogSiteName.trim();
        const header = document.querySelector("#header .company-name, .company-name");
        const headerText = header?.textContent?.trim();
        if (headerText)
            return headerText;
        const match = window.location.pathname.match(/^\/([^/]+)/);
        if (match && match[1] && match[1] !== "embed" && match[1] !== "jobs") {
            return match[1]
                .replace(/-/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase());
        }
        return "Unknown Employer";
    }
    extractJobIdFromUrl(url) {
        const match = url.match(/\/jobs\/(\d+)/);
        return match?.[1];
    }
    dedupeKey(job) {
        if (job.sourceJobId)
            return `id:${job.sourceJobId}`;
        if (job.url)
            return `url:${job.url}`;
        return `title:${job.title}|${job.company}|${job.location ?? ""}`;
    }
    getRows() {
        const seen = new Set();
        const out = [];
        for (const selector of greenhouse_orchestrator_ROW_SELECTORS) {
            for (const el of Array.from(document.querySelectorAll(selector))) {
                if (!seen.has(el)) {
                    seen.add(el);
                    out.push(el);
                }
            }
            if (out.length > 0) {
                // Take the first selector that yielded matches — keeps row order stable.
                break;
            }
        }
        return out;
    }
    async goToNextPage(throttleMs) {
        let nextBtn = null;
        for (const selector of NEXT_PAGE_SELECTORS) {
            nextBtn = document.querySelector(selector);
            if (nextBtn)
                break;
        }
        if (!nextBtn)
            return false;
        if (nextBtn.classList.contains("disabled") ||
            nextBtn.getAttribute("aria-disabled") === "true") {
            return false;
        }
        const beforeSig = this.firstRowSignature();
        nextBtn.click();
        const changed = await greenhouse_orchestrator_waitFor(() => this.firstRowSignature() !== beforeSig && this.getRows().length > 0, 8000);
        if (!changed)
            return false;
        if (throttleMs > 0)
            await greenhouse_orchestrator_sleep(throttleMs);
        return true;
    }
    firstRowSignature() {
        const row = this.getRows()[0];
        return row?.textContent?.trim().slice(0, 120) || "";
    }
}

;// ./src/content/scrapers/lever-orchestrator.ts
// P3/#39 — Bulk-scrape orchestrator for Lever company pages.
//
// Walks the visible postings on a `jobs.lever.co/<company>` page (or one of
// the older `<company>.lever.co/<role>` variants), assembles a `ScrapedJob`
// from each row's listing-page metadata, and yields results. Two modes mirror
// the WaterlooWorks orchestrator:
//
//   scrapeAllVisible()   — current visible postings only
//   scrapeAllPaginated() — Lever boards are typically single-page, but we still
//                          probe for "Show more" / Next-style controls so the
//                          contract matches the popup expectation.
//
// Lever boards are public, intentionally syndicated by the hiring company, and
// have no anti-scrape posture. This orchestrator never visits the apply flow.
//
// Selectors observed on `jobs.lever.co/<company>` (2026-05):
//   - `.posting` per opening (canonical)
//   - title: `.posting-title h5` or `[data-qa="posting-name"]`
//   - location: `.posting-categories .location` or `.sort-by-location`
//   - commitment / type: `.posting-categories .commitment`
//   - posting URL: anchor wrapping the posting block
//   - company: logo alt or first path segment
const lever_orchestrator_DEFAULT_THROTTLE_MS = 50;
const lever_orchestrator_MAX_JOBS_DEFAULT = 200;
const lever_orchestrator_MAX_PAGES_DEFAULT = 50;
const lever_orchestrator_ROW_SELECTORS = [".posting", '[data-qa="posting-name"]'];
const lever_orchestrator_NEXT_PAGE_SELECTORS = [
    'a[rel="next"]',
    'button[aria-label="Next" i]',
    'button[aria-label="Load more" i]',
    ".pagination .next a",
];
const lever_orchestrator_sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function lever_orchestrator_waitFor(predicate, timeoutMs, intervalMs = 100) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        if (predicate())
            return true;
        await lever_orchestrator_sleep(intervalMs);
    }
    return false;
}
class LeverOrchestrator {
    static canHandle(url) {
        return /jobs\.lever\.co\//.test(url) || /[\w-]+\.lever\.co\//.test(url);
    }
    async scrapeAllVisible(opts = {}) {
        const { jobs } = await this.scrapeCurrentPage({
            scrapedSoFar: 0,
            pageIndex: 1,
            opts,
            errors: [],
        });
        return jobs;
    }
    async scrapeAllPaginated(opts = {}) {
        const maxJobs = opts.maxJobs ?? lever_orchestrator_MAX_JOBS_DEFAULT;
        const maxPages = opts.maxPages ?? lever_orchestrator_MAX_PAGES_DEFAULT;
        const throttle = opts.throttleMs ?? lever_orchestrator_DEFAULT_THROTTLE_MS;
        const allJobs = [];
        const errors = [];
        let pageIndex = 1;
        while (pageIndex <= maxPages && allJobs.length < maxJobs) {
            const { jobs, stopReason } = await this.scrapeCurrentPage({
                scrapedSoFar: allJobs.length,
                pageIndex,
                opts: { ...opts, maxJobs },
                errors,
            });
            allJobs.push(...jobs);
            if (stopReason === "cap-hit")
                break;
            const advanced = await this.goToNextPage(throttle);
            if (!advanced)
                break;
            pageIndex++;
        }
        opts.onProgress?.({
            scrapedCount: allJobs.length,
            attemptedCount: allJobs.length,
            currentPage: pageIndex,
            totalRowsOnPage: this.getRows().length,
            done: true,
            errors,
        });
        return allJobs;
    }
    async scrapeCurrentPage(args) {
        const { scrapedSoFar, pageIndex, opts, errors } = args;
        const maxJobs = opts.maxJobs ?? lever_orchestrator_MAX_JOBS_DEFAULT;
        const throttle = opts.throttleMs ?? lever_orchestrator_DEFAULT_THROTTLE_MS;
        const rows = this.getRows();
        const jobs = [];
        const company = this.extractCompany();
        for (let i = 0; i < rows.length; i++) {
            if (scrapedSoFar + jobs.length >= maxJobs) {
                return { jobs, stopReason: "cap-hit" };
            }
            const row = rows[i];
            let job = null;
            try {
                job = this.scrapeRow(row, company);
            }
            catch (err) {
                errors.push(`row ${i}: ${String(err).slice(0, 200)}`);
            }
            if (job)
                jobs.push(job);
            opts.onProgress?.({
                scrapedCount: scrapedSoFar + jobs.length,
                attemptedCount: scrapedSoFar + i + 1,
                currentPage: pageIndex,
                totalRowsOnPage: rows.length,
                lastTitle: job?.title,
                done: false,
                errors,
            });
            if (throttle > 0)
                await lever_orchestrator_sleep(throttle);
        }
        return { jobs };
    }
    scrapeRow(row, company) {
        const titleEl = row.querySelector('.posting-title h5, .posting-name, [data-qa="posting-name"]');
        const title = titleEl?.textContent?.trim();
        if (!title) {
            throw new Error("missing title");
        }
        // Lever wraps the posting in an anchor — either the title anchor or the
        // whole row. Either is fine.
        const anchor = row.querySelector('a.posting-title, a[data-qa="posting-name"], a') || (row.matches("a") ? row : null);
        const href = anchor?.getAttribute("href") || "";
        const url = href ? new URL(href, window.location.href).toString() : "";
        const locationEl = row.querySelector('.posting-categories .location, .sort-by-location, .workplaceTypes, [data-qa="posting-location"]');
        const location = locationEl?.textContent?.trim() || undefined;
        const commitmentEl = row.querySelector(".posting-categories .commitment, .sort-by-commitment");
        const commitment = commitmentEl?.textContent?.trim() || null;
        return {
            title,
            company,
            location,
            description: "",
            requirements: [],
            type: this.detectJobTypeFromCommitment(commitment),
            url: url || window.location.href,
            source: "lever",
            sourceJobId: this.extractJobIdFromUrl(url),
        };
    }
    extractCompany() {
        // Logo alt — works for most boards.
        const logo = document.querySelector(".main-header-logo img, .posting-header .logo img, header img");
        const alt = logo?.getAttribute("alt");
        if (alt && alt.trim() && alt.trim() !== "Company Logo")
            return alt.trim();
        // Page title format: "Job Title - Company Name" or just "Company Name Jobs"
        const pageTitle = document.title;
        if (pageTitle) {
            const parts = pageTitle.split(" - ");
            if (parts.length >= 2) {
                return parts[parts.length - 1].replace(" Jobs", "").trim();
            }
            const trimmed = pageTitle.replace(/Jobs$/i, "").trim();
            if (trimmed)
                return trimmed;
        }
        // URL fallback: jobs.lever.co/<company>/...
        const match = window.location.href.match(/lever\.co\/([^/]+)/);
        if (match && match[1]) {
            return match[1]
                .replace(/-/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase());
        }
        return "Unknown Employer";
    }
    extractJobIdFromUrl(url) {
        const match = url.match(/lever\.co\/[^/]+\/([a-f0-9-]+)/i);
        return match?.[1];
    }
    detectJobTypeFromCommitment(commitment) {
        if (!commitment)
            return undefined;
        const lower = commitment.toLowerCase();
        if (lower.includes("full-time") || lower.includes("full time"))
            return "full-time";
        if (lower.includes("part-time") || lower.includes("part time"))
            return "part-time";
        if (lower.includes("contract") || lower.includes("contractor"))
            return "contract";
        if (lower.includes("intern"))
            return "internship";
        return undefined;
    }
    getRows() {
        const seen = new Set();
        const out = [];
        for (const selector of lever_orchestrator_ROW_SELECTORS) {
            for (const el of Array.from(document.querySelectorAll(selector))) {
                if (!seen.has(el)) {
                    seen.add(el);
                    out.push(el);
                }
            }
            if (out.length > 0)
                break;
        }
        return out;
    }
    async goToNextPage(throttleMs) {
        let nextBtn = null;
        for (const selector of lever_orchestrator_NEXT_PAGE_SELECTORS) {
            nextBtn = document.querySelector(selector);
            if (nextBtn)
                break;
        }
        if (!nextBtn)
            return false;
        if (nextBtn.classList.contains("disabled") ||
            nextBtn.getAttribute("aria-disabled") === "true") {
            return false;
        }
        const beforeSig = this.firstRowSignature();
        nextBtn.click();
        const changed = await lever_orchestrator_waitFor(() => this.firstRowSignature() !== beforeSig && this.getRows().length > 0, 8000);
        if (!changed)
            return false;
        if (throttleMs > 0)
            await lever_orchestrator_sleep(throttleMs);
        return true;
    }
    firstRowSignature() {
        const row = this.getRows()[0];
        return row?.textContent?.trim().slice(0, 120) || "";
    }
}

;// ./src/content/scrapers/workday-orchestrator.ts
// P3/#39 — Bulk-scrape orchestrator for Workday job-listing pages.
//
// Targets the listing surface at `<tenant>.<region>.myworkdayjobs.com/<board>`
// (or the legacy `*.workdayjobs.com/<board>`). Walks the visible job rows,
// builds a `ScrapedJob` from each, and yields the result. Two modes mirror the
// WaterlooWorks orchestrator:
//
//   scrapeAllVisible()   — current visible rows only
//   scrapeAllPaginated() — clicks Workday's "Next page" arrow until exhausted
//                          or the 200/session cap hits.
//
// **NOT** the apply flow. Workday's apply funnel is a separate surface (#36).
// This orchestrator hard-stops if it sees that we've navigated off a listing
// view by checking for the canonical `[data-automation-id="jobSearch"]`
// container or a recognisable job row before each iteration.
//
// Workday boards are public, intentionally syndicated by the hiring tenant,
// and have no anti-scrape posture on listing pages.
//
// Selectors observed on `*.myworkdayjobs.com/*` listing pages (2026-05):
//   - rows: `[data-automation-id="jobResults"] li` or
//           `li.css-1q2dra3` (older skin) or
//           `[role="listitem"]` inside the results region
//   - title: `[data-automation-id="jobTitle"]` (an anchor)
//   - location: `[data-automation-id="locations"]`
//   - posted at: `[data-automation-id="postedOn"]`
//   - req id: `[data-automation-id="requisitionId"]`
//   - next page: `button[data-uxi-element-id="next"]` or
//                `nav[aria-label="pagination"] button[aria-label="next" i]`
const workday_orchestrator_DEFAULT_THROTTLE_MS = 50;
const workday_orchestrator_MAX_JOBS_DEFAULT = 200;
const workday_orchestrator_MAX_PAGES_DEFAULT = 50;
const workday_orchestrator_ROW_SELECTORS = [
    '[data-automation-id="jobResults"] li',
    '[data-automation-id="jobResults"] [role="listitem"]',
    'ul[role="list"] li[data-automation-id*="job"]',
    "li.css-1q2dra3",
];
const workday_orchestrator_NEXT_PAGE_SELECTORS = [
    'button[data-uxi-element-id="next"]',
    'nav[aria-label="pagination"] button[aria-label*="next" i]',
    'button[aria-label="next" i]',
];
const workday_orchestrator_sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function workday_orchestrator_waitFor(predicate, timeoutMs, intervalMs = 100) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        if (predicate())
            return true;
        await workday_orchestrator_sleep(intervalMs);
    }
    return false;
}
class WorkdayOrchestrator {
    /**
     * Detect a Workday LISTING page (not the apply flow). We accept the public
     * tenant hosts and require either the job-results region or a recognisable
     * job-card row in the DOM — never the apply funnel.
     */
    static canHandle(url) {
        if (!/\.(my)?workdayjobs\.com\//.test(url))
            return false;
        // The apply flow lives under `/apply/` or includes `/apply` in the path —
        // bail out so we don't blow up an apply form mid-flight.
        if (/\/apply(\b|\/)/.test(url))
            return false;
        return true;
    }
    async scrapeAllVisible(opts = {}) {
        const { jobs } = await this.scrapeCurrentPage({
            scrapedSoFar: 0,
            pageIndex: 1,
            opts,
            errors: [],
        });
        return jobs;
    }
    async scrapeAllPaginated(opts = {}) {
        const maxJobs = opts.maxJobs ?? workday_orchestrator_MAX_JOBS_DEFAULT;
        const maxPages = opts.maxPages ?? workday_orchestrator_MAX_PAGES_DEFAULT;
        const throttle = opts.throttleMs ?? workday_orchestrator_DEFAULT_THROTTLE_MS;
        const allJobs = [];
        const errors = [];
        let pageIndex = 1;
        while (pageIndex <= maxPages && allJobs.length < maxJobs) {
            const { jobs, stopReason } = await this.scrapeCurrentPage({
                scrapedSoFar: allJobs.length,
                pageIndex,
                opts: { ...opts, maxJobs },
                errors,
            });
            allJobs.push(...jobs);
            if (stopReason === "cap-hit")
                break;
            const advanced = await this.goToNextPage(throttle);
            if (!advanced)
                break;
            pageIndex++;
        }
        opts.onProgress?.({
            scrapedCount: allJobs.length,
            attemptedCount: allJobs.length,
            currentPage: pageIndex,
            totalRowsOnPage: this.getRows().length,
            done: true,
            errors,
        });
        return allJobs;
    }
    async scrapeCurrentPage(args) {
        const { scrapedSoFar, pageIndex, opts, errors } = args;
        const maxJobs = opts.maxJobs ?? workday_orchestrator_MAX_JOBS_DEFAULT;
        const throttle = opts.throttleMs ?? workday_orchestrator_DEFAULT_THROTTLE_MS;
        const rows = this.getRows();
        const jobs = [];
        const company = this.extractCompany();
        for (let i = 0; i < rows.length; i++) {
            if (scrapedSoFar + jobs.length >= maxJobs) {
                return { jobs, stopReason: "cap-hit" };
            }
            const row = rows[i];
            let job = null;
            try {
                job = this.scrapeRow(row, company);
            }
            catch (err) {
                errors.push(`row ${i}: ${String(err).slice(0, 200)}`);
            }
            if (job)
                jobs.push(job);
            opts.onProgress?.({
                scrapedCount: scrapedSoFar + jobs.length,
                attemptedCount: scrapedSoFar + i + 1,
                currentPage: pageIndex,
                totalRowsOnPage: rows.length,
                lastTitle: job?.title,
                done: false,
                errors,
            });
            if (throttle > 0)
                await workday_orchestrator_sleep(throttle);
        }
        return { jobs };
    }
    scrapeRow(row, company) {
        const titleEl = row.querySelector('[data-automation-id="jobTitle"]');
        const title = titleEl?.textContent?.trim();
        if (!title) {
            throw new Error("missing title");
        }
        const href = titleEl?.getAttribute("href") || "";
        const url = href ? new URL(href, window.location.href).toString() : "";
        const locationEl = row.querySelector('[data-automation-id="locations"], [data-automation-id="locationLabel"]');
        const location = locationEl?.textContent?.trim() || undefined;
        const reqIdEl = row.querySelector('[data-automation-id="requisitionId"]');
        const sourceJobId = reqIdEl?.textContent?.trim() || this.extractJobIdFromUrl(url);
        const postedEl = row.querySelector('[data-automation-id="postedOn"]');
        const postedAt = postedEl?.textContent?.trim() || undefined;
        return {
            title,
            company,
            location,
            description: "",
            requirements: [],
            url: url || window.location.href,
            source: "workday",
            sourceJobId,
            postedAt,
        };
    }
    /**
     * Workday boards typically show the tenant name in the header banner. Try a
     * few common slots, then fall back to the first label-style hostname
     * fragment.
     */
    extractCompany() {
        const labelled = document.querySelector('[data-automation-id="pageHeader"], [data-automation-id="companyLogo"] img, [data-automation-id="header"] h1');
        if (labelled instanceof HTMLImageElement && labelled.alt) {
            return labelled.alt.trim();
        }
        const text = labelled?.textContent?.trim();
        if (text)
            return text;
        const ogSiteName = document
            .querySelector('meta[property="og:site_name"]')
            ?.getAttribute("content");
        if (ogSiteName)
            return ogSiteName.trim();
        // Hostname is typically `<tenant>.<region>.myworkdayjobs.com`.
        const tenant = window.location.hostname.split(".")[0];
        if (tenant) {
            return tenant.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        }
        return "Unknown Employer";
    }
    extractJobIdFromUrl(url) {
        // Workday URLs end in /job/.../R-12345 or _R-12345 — pull the requisition.
        const match = url.match(/[_/]([Rr]-?\d{3,})(?:[/?#]|$)/);
        return match?.[1];
    }
    getRows() {
        const seen = new Set();
        const out = [];
        for (const selector of workday_orchestrator_ROW_SELECTORS) {
            for (const el of Array.from(document.querySelectorAll(selector))) {
                if (!seen.has(el)) {
                    seen.add(el);
                    out.push(el);
                }
            }
            if (out.length > 0)
                break;
        }
        return out;
    }
    async goToNextPage(throttleMs) {
        let nextBtn = null;
        for (const selector of workday_orchestrator_NEXT_PAGE_SELECTORS) {
            nextBtn = document.querySelector(selector);
            if (nextBtn)
                break;
        }
        if (!nextBtn)
            return false;
        if (nextBtn.hasAttribute("disabled") ||
            nextBtn.getAttribute("aria-disabled") === "true" ||
            nextBtn.classList.contains("disabled")) {
            return false;
        }
        const beforeSig = this.firstRowSignature();
        nextBtn.click();
        const changed = await workday_orchestrator_waitFor(() => this.firstRowSignature() !== beforeSig && this.getRows().length > 0, 8000);
        if (!changed)
            return false;
        if (throttleMs > 0)
            await workday_orchestrator_sleep(throttleMs);
        return true;
    }
    firstRowSignature() {
        const row = this.getRows()[0];
        return row?.textContent?.trim().slice(0, 120) || "";
    }
}

// EXTERNAL MODULE: ./src/shared/types.ts
var types = __webpack_require__(353);
// EXTERNAL MODULE: ./src/shared/messages.ts
var messages = __webpack_require__(154);
// EXTERNAL MODULE: ./src/shared/error-messages.ts
var error_messages = __webpack_require__(543);
;// ./src/content/tracking/applied-toast.ts
function showAppliedToast(company, onClick) {
    document.querySelector(".slothing-toast-applied")?.remove();
    const toast = document.createElement("div");
    toast.className = "slothing-toast slothing-toast-applied";
    toast.tabIndex = 0;
    toast.setAttribute("role", "button");
    toast.setAttribute("aria-label", "Open Slothing dashboard");
    toast.textContent = `✓ Tracked in Slothing - applied to ${company}`;
    const dismiss = () => toast.remove();
    const timeoutId = window.setTimeout(dismiss, 6000);
    toast.addEventListener("click", () => {
        window.clearTimeout(timeoutId);
        onClick();
        dismiss();
    });
    toast.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toast.click();
            return;
        }
        if (event.key === "Escape") {
            window.clearTimeout(timeoutId);
            dismiss();
        }
    });
    document.body.appendChild(toast);
}

;// ./src/content/tracking/page-snapshot.ts

const MAX_HEADLINE_LENGTH = 200;
async function buildPageSnapshot({ captureScreenshot, }) {
    const title = document.title.trim();
    const headline = page_snapshot_normalizeText(document.querySelector("h1")?.textContent || title);
    return {
        url: window.location.href,
        host: window.location.hostname,
        title,
        headline: headline ? truncate(headline, MAX_HEADLINE_LENGTH) : undefined,
        submittedAt: new Date().toISOString(),
        thumbnailDataUrl: captureScreenshot
            ? await captureVisibleTabSafely()
            : undefined,
    };
}
function page_snapshot_normalizeText(value) {
    return value.replace(/\s+/g, " ").trim();
}
function truncate(value, maxLength) {
    if (value.length <= maxLength)
        return value;
    return value.slice(0, maxLength - 1).trimEnd();
}
async function captureVisibleTabSafely() {
    try {
        const response = await (0,messages/* sendMessage */._z)(messages/* Messages */.B2.captureVisibleTab());
        return response.success ? response.data?.dataUrl : undefined;
    }
    catch {
        return undefined;
    }
}

;// ./src/content/tracking/submit-watcher.ts

const APPLICATION_FIELD_TYPES = new Set([
    "firstName",
    "lastName",
    "fullName",
    "email",
    "phone",
    "linkedin",
    "github",
    "website",
    "portfolio",
    "resume",
    "coverLetter",
    "workAuthorization",
    "sponsorship",
    "customQuestion",
]);
const BLOCKED_FORM_KEYWORDS = [
    "login",
    "log in",
    "signin",
    "sign in",
    "signup",
    "sign up",
    "register",
    "search",
    "subscribe",
    "newsletter",
];
class SubmitWatcher {
    constructor(options) {
        this.handledForms = new WeakSet();
        this.pendingForms = new WeakSet();
        this.trackedUrls = new Set();
        this.attached = false;
        this.handleSubmit = (event) => {
            const form = event.target;
            if (!(form instanceof HTMLFormElement))
                return;
            void this.trackFormSubmit(form);
        };
        this.options = options;
    }
    attach() {
        if (this.attached)
            return;
        document.addEventListener("submit", this.handleSubmit, true);
        this.attached = true;
    }
    detach() {
        if (!this.attached)
            return;
        document.removeEventListener("submit", this.handleSubmit, true);
        this.attached = false;
    }
    async trackFormSubmit(form) {
        if (this.handledForms.has(form) ||
            this.pendingForms.has(form) ||
            this.trackedUrls.has(window.location.href)) {
            return;
        }
        this.pendingForms.add(form);
        try {
            const settings = await this.options.getSettings();
            if (!settings.autoTrackApplicationsEnabled)
                return;
            const detectedFields = this.options.getDetectedFields(form);
            if (isLikelySearchOrLoginForm(form, window.location.href) ||
                !looksLikeApplicationForm(detectedFields, form, this.options.wasAutofilled(form))) {
                return;
            }
            this.handledForms.add(form);
            this.trackedUrls.add(window.location.href);
            const snapshot = await buildPageSnapshot({
                captureScreenshot: settings.captureScreenshotEnabled,
            });
            await this.options.onTracked({
                ...snapshot,
                scrapedJob: this.options.getScrapedJob(),
            });
        }
        finally {
            this.pendingForms.delete(form);
        }
    }
}
function isLikelySearchOrLoginForm(form, url) {
    const urlText = url.toLowerCase();
    if (/(\/|\b)(login|signin|signup|register|search)(\/|\?|#|\b)/.test(urlText)) {
        return true;
    }
    const text = [
        form.id,
        form.className,
        form.getAttribute("name"),
        form.getAttribute("aria-label"),
        form.getAttribute("action"),
        form.textContent,
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
    if (BLOCKED_FORM_KEYWORDS.some((keyword) => text.includes(keyword))) {
        return true;
    }
    const inputs = Array.from(form.querySelectorAll("input"));
    return inputs.some((input) => {
        const type = input.type.toLowerCase();
        const name = `${input.name} ${input.id} ${input.placeholder}`.toLowerCase();
        return type === "search" || name.includes("search");
    });
}
function looksLikeApplicationForm(detectedFields, form, wasAutofilled = false) {
    const highConfidenceApplicationFields = detectedFields.filter((field) => field.confidence >= 0.3 && APPLICATION_FIELD_TYPES.has(field.fieldType));
    if (wasAutofilled && highConfidenceApplicationFields.length >= 2) {
        return true;
    }
    if (highConfidenceApplicationFields.length >= 3) {
        return true;
    }
    const formText = [
        form.id,
        form.className,
        form.getAttribute("action"),
        form.textContent,
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
    return (wasAutofilled &&
        highConfidenceApplicationFields.length > 0 &&
        /\b(apply|application|resume|cover letter|submit application)\b/.test(formText));
}
function extractCompanyHint(scrapedJob, host) {
    if (scrapedJob?.company)
        return scrapedJob.company;
    return host.replace(/^www\./, "");
}

// EXTERNAL MODULE: ../../node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(723);
// EXTERNAL MODULE: ../../node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom/client.js
var client = __webpack_require__(997);
// EXTERNAL MODULE: ../../node_modules/.pnpm/react@18.3.1/node_modules/react/index.js
var react = __webpack_require__(155);
;// ./src/content/sidebar/chat-panel.tsx


const QUALIFIED_PROMPT = "In 4 sentences, explain why I'm qualified for this role. Reference 1-2 specific items from my profile and tie them to the job's requirements. No fluff.";
const COVER_LETTER_PROMPT = "Draft only the OPENING PARAGRAPH of a cover letter for this role. 3-5 sentences. Hook the reader by tying one specific item from my profile to one specific need from the job. No salutation, no closing.";
/**
 * Truncation cap on the seed query-string parameter so we don't blow URL
 * limits. Studio re-renders the full text once the page loads, so this is
 * just for the deep-link payload.
 */
const COVER_LETTER_SEED_MAX = 500;
function ChatPanel(props) {
    const [intent, setIntent] = (0,react.useState)("free");
    const [draft, setDraft] = (0,react.useState)("");
    const [streaming, setStreaming] = (0,react.useState)(false);
    const [output, setOutput] = (0,react.useState)("");
    const [error, setError] = (0,react.useState)(null);
    const [completed, setCompleted] = (0,react.useState)(false);
    const run = (0,react.useCallback)(async (prompt, kind) => {
        if (streaming)
            return;
        setStreaming(true);
        setIntent(kind);
        setOutput("");
        setError(null);
        setCompleted(false);
        const controller = new AbortController();
        try {
            await props.onStream({
                prompt,
                intent: kind,
                onToken: (token) => setOutput((prev) => prev + token),
                signal: controller.signal,
            });
            setCompleted(true);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
        }
        finally {
            setStreaming(false);
        }
    }, [props, streaming]);
    const handleQualified = () => {
        void run(QUALIFIED_PROMPT, "qualified");
    };
    const handleCoverLetter = () => {
        void run(COVER_LETTER_PROMPT, "coverLetter");
    };
    const handleFreeSubmit = (event) => {
        event.preventDefault();
        const trimmed = draft.trim();
        if (!trimmed)
            return;
        void run(trimmed, "free");
    };
    const showCoverLetterCta = !streaming &&
        completed &&
        intent === "coverLetter" &&
        output.trim().length > 0;
    return ((0,jsx_runtime.jsxs)("section", { className: "chat-panel", "aria-label": "AI assistant", children: [(0,jsx_runtime.jsx)("p", { className: "section-title", children: "AI assistant" }), (0,jsx_runtime.jsxs)("div", { className: "chat-seed-row", children: [(0,jsx_runtime.jsx)("button", { type: "button", className: "small-button secondary", disabled: streaming, onClick: handleQualified, children: "Why am I qualified?" }), (0,jsx_runtime.jsx)("button", { type: "button", className: "small-button secondary", disabled: streaming, onClick: handleCoverLetter, children: "Cover-letter opener" })] }), (0,jsx_runtime.jsxs)("form", { className: "chat-input-row", onSubmit: handleFreeSubmit, children: [(0,jsx_runtime.jsx)("textarea", { value: draft, onChange: (event) => setDraft(event.target.value), placeholder: "Ask anything about this job\u2026", rows: 2, disabled: streaming, "aria-label": "Ask the AI assistant" }), (0,jsx_runtime.jsx)("button", { type: "submit", className: "small-button", disabled: streaming || !draft.trim(), children: streaming && intent === "free" ? "…" : "Send" })] }), (0,jsx_runtime.jsxs)("div", { className: "chat-result", role: "status", "aria-live": "polite", "aria-busy": streaming, children: [streaming && output.length === 0 && ((0,jsx_runtime.jsx)("p", { className: "chat-spinner", children: "Thinking\u2026" })), output && (0,jsx_runtime.jsx)("p", { className: "chat-output", children: output }), error && ((0,jsx_runtime.jsx)("p", { className: "status-card error chat-error", role: "alert", children: error })), showCoverLetterCta && ((0,jsx_runtime.jsx)("button", { type: "button", className: "small-button chat-use-cta", onClick: () => props.onUseInCoverLetter(output.trim().slice(0, COVER_LETTER_SEED_MAX)), children: "Use in cover letter" }))] })] }));
}

;// ./src/content/sidebar/job-page-sidebar.tsx



const ACTION_LABELS = {
    tailor: "Tailor",
    coverLetter: "Cover Letter",
    save: "Save",
    autoFill: "Auto-fill",
};
function JobPageSidebar(props) {
    const [activeAction, setActiveAction] = (0,react.useState)(null);
    const [actionFeedback, setActionFeedback] = (0,react.useState)(null);
    const [notice, setNotice] = (0,react.useState)(null);
    const [query, setQuery] = (0,react.useState)("");
    const [answers, setAnswers] = (0,react.useState)([]);
    const [searching, setSearching] = (0,react.useState)(false);
    const [searchError, setSearchError] = (0,react.useState)(null);
    const dragState = (0,react.useRef)(null);
    const scoreValue = props.score?.overall ?? null;
    const jobMeta = (0,react.useMemo)(() => [props.scrapedJob.company, props.scrapedJob.location]
        .filter(Boolean)
        .join(" / "), [props.scrapedJob.company, props.scrapedJob.location]);
    const sidebarClassName = `slothing-sidebar dock-${props.layout.dock}`;
    function sidebarStyle() {
        if (props.layout.dock === "left") {
            return { left: 0, right: "auto" };
        }
        if (props.layout.dock === "floating" && props.layout.position) {
            return {
                left: `${props.layout.position.x}px`,
                right: "auto",
                top: `${props.layout.position.y}px`,
            };
        }
        return undefined;
    }
    function startDrag(event) {
        if (event.button !== 0)
            return;
        const target = event.target;
        if (target.closest("button, input, textarea, select, a"))
            return;
        const sidebar = event.currentTarget.closest(".slothing-sidebar");
        if (!sidebar)
            return;
        const rect = sidebar.getBoundingClientRect();
        const nextPosition = clampSidebarPosition(rect.left, rect.top, rect.width, rect.height);
        props.onLayoutChange({ dock: "floating", position: nextPosition });
        dragState.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            originX: nextPosition.x,
            originY: nextPosition.y,
            width: rect.width,
            height: rect.height,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
        event.preventDefault();
    }
    function moveDrag(event) {
        const drag = dragState.current;
        if (!drag || drag.pointerId !== event.pointerId)
            return;
        const x = drag.originX + event.clientX - drag.startX;
        const y = drag.originY + event.clientY - drag.startY;
        props.onLayoutChange({
            dock: "floating",
            position: clampSidebarPosition(x, y, drag.width, drag.height),
        });
    }
    function endDrag(event) {
        const drag = dragState.current;
        if (!drag || drag.pointerId !== event.pointerId)
            return;
        dragState.current = null;
        try {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
        catch {
            // The browser may release capture first if the pointer is canceled.
        }
    }
    function floatAtCurrentPosition(event) {
        const sidebar = event.currentTarget.closest(".slothing-sidebar");
        if (!sidebar)
            return;
        const rect = sidebar.getBoundingClientRect();
        props.onLayoutChange({
            dock: "floating",
            position: clampSidebarPosition(rect.left, rect.top, rect.width, rect.height),
        });
    }
    async function runAction(action, callback) {
        setActiveAction(action);
        setActionFeedback(null);
        setNotice(null);
        try {
            await callback();
            setActionFeedback({
                action,
                label: action === "autoFill" ? "Fields updated" : "Done",
            });
        }
        catch (error) {
            setNotice({
                kind: "error",
                message: error.message || `${ACTION_LABELS[action]} failed.`,
            });
        }
        finally {
            setActiveAction(null);
        }
    }
    async function handleSearch(event) {
        event.preventDefault();
        const trimmed = query.trim();
        if (!trimmed)
            return;
        setSearching(true);
        setSearchError(null);
        try {
            setAnswers(await props.onSearchAnswers(trimmed));
        }
        catch (error) {
            setSearchError(error.message || "Answer search failed.");
        }
        finally {
            setSearching(false);
        }
    }
    async function copyAnswer(answer) {
        await navigator.clipboard.writeText(answer.answer);
        setNotice({ kind: "success", message: "Answer copied." });
    }
    if (props.layout.collapsed) {
        return ((0,jsx_runtime.jsx)("aside", { className: sidebarClassName, style: sidebarStyle(), "aria-label": "Slothing job sidebar", children: (0,jsx_runtime.jsxs)("button", { className: "rail", type: "button", onClick: () => props.onLayoutChange({ collapsed: false }), "aria-label": "Open Slothing sidebar", title: "Open Slothing sidebar", children: [(0,jsx_runtime.jsx)("span", { className: "rail-score", children: scoreValue ?? "--" }), (0,jsx_runtime.jsx)("span", { className: "rail-label", children: "Slothing" })] }) }));
    }
    return ((0,jsx_runtime.jsx)("aside", { className: sidebarClassName, style: sidebarStyle(), "aria-label": "Slothing job sidebar", children: (0,jsx_runtime.jsxs)("div", { className: "panel", children: [(0,jsx_runtime.jsxs)("header", { className: "header", onPointerDown: startDrag, onPointerMove: moveDrag, onPointerUp: endDrag, onPointerCancel: endDrag, title: "Drag to move", children: [(0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsxs)("div", { className: "workspace-brand-row", children: [(0,jsx_runtime.jsx)("img", { className: "workspace-mark", src: chrome.runtime.getURL("brand/slothing-mark.png"), alt: "" }), (0,jsx_runtime.jsx)("span", { children: "Slothing" })] }), (0,jsx_runtime.jsx)("h2", { className: "title", children: props.scrapedJob.title }), (0,jsx_runtime.jsx)("p", { className: "company", children: jobMeta || props.scrapedJob.company })] }), (0,jsx_runtime.jsxs)("div", { className: "icon-row", children: [(0,jsx_runtime.jsx)("button", { className: "icon-button", type: "button", onClick: () => props.onLayoutChange({ dock: "left" }), "aria-label": "Dock Slothing sidebar on the left", title: "Dock left", children: "\u2039" }), (0,jsx_runtime.jsx)("button", { className: "icon-button", type: "button", onClick: () => props.onLayoutChange({ dock: "right" }), "aria-label": "Dock Slothing sidebar on the right", title: "Dock right", children: "\u203A" }), (0,jsx_runtime.jsx)("button", { className: "icon-button", type: "button", onClick: floatAtCurrentPosition, "aria-label": "Float Slothing sidebar", title: "Float", children: "\u25A1" }), (0,jsx_runtime.jsx)("button", { className: "icon-button", type: "button", onClick: () => props.onLayoutChange({ collapsed: true }), "aria-label": "Collapse Slothing sidebar", title: "Collapse", children: "-" }), (0,jsx_runtime.jsx)("button", { className: "icon-button", type: "button", onClick: () => void props.onDismiss(), "aria-label": "Dismiss Slothing sidebar for this domain", title: "Dismiss for this domain", children: "\u00D7" })] })] }), (0,jsx_runtime.jsxs)("div", { className: "body", children: [(0,jsx_runtime.jsxs)("section", { className: "score-card", "aria-label": "Match score", children: [(0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("p", { className: "score-label", children: scoreValue === null ? "Profile needed" : "Match score" }), (0,jsx_runtime.jsx)("p", { className: "score-note", children: scoreValue === null
                                                ? "Connect your profile to score this job."
                                                : "Based on your profile and this job description." })] }), (0,jsx_runtime.jsxs)("div", { className: "score-pill", "aria-label": "Match score value", children: [(0,jsx_runtime.jsx)("span", { children: scoreValue ?? "--" }), scoreValue !== null && (0,jsx_runtime.jsx)("small", { children: "/100" })] })] }), (0,jsx_runtime.jsxs)("section", { className: "actions", "aria-label": "Job actions", children: [(0,jsx_runtime.jsx)(ActionButton, { label: "Tailor resume", activeLabel: "Tailoring...", active: activeAction === "tailor", feedback: actionFeedback?.action === "tailor"
                                        ? actionFeedback.label
                                        : undefined, disabled: activeAction !== null, primary: true, onClick: () => runAction("tailor", props.onTailor) }), (0,jsx_runtime.jsx)(ActionButton, { label: "Cover letter", activeLabel: "Generating...", active: activeAction === "coverLetter", feedback: actionFeedback?.action === "coverLetter"
                                        ? actionFeedback.label
                                        : undefined, disabled: activeAction !== null, onClick: () => runAction("coverLetter", props.onCoverLetter) }), (0,jsx_runtime.jsx)(ActionButton, { label: "Save job", activeLabel: "Saving...", active: activeAction === "save", feedback: actionFeedback?.action === "save" ? "Saved" : undefined, disabled: activeAction !== null, onClick: () => runAction("save", props.onSave) }), (0,jsx_runtime.jsx)(ActionButton, { label: props.detectedFieldCount > 0
                                        ? `Auto-fill ${props.detectedFieldCount} fields`
                                        : "Auto-fill", activeLabel: "Filling...", active: activeAction === "autoFill", feedback: actionFeedback?.action === "autoFill"
                                        ? actionFeedback.label
                                        : undefined, disabled: activeAction !== null || props.detectedFieldCount === 0, onClick: () => runAction("autoFill", props.onAutoFill) })] }), notice?.kind === "error" && ((0,jsx_runtime.jsx)("div", { className: `status-card ${notice.kind}`, role: "status", children: notice.message })), (0,jsx_runtime.jsxs)("details", { className: "utility-section", children: [(0,jsx_runtime.jsx)("summary", { children: "AI assistant" }), (0,jsx_runtime.jsx)(ChatPanel, { onStream: props.onChatStream, onUseInCoverLetter: props.onUseInCoverLetter })] }), (0,jsx_runtime.jsxs)("details", { className: "utility-section", children: [(0,jsx_runtime.jsx)("summary", { children: "Answer bank" }), (0,jsx_runtime.jsxs)("section", { className: "answer-bank", "aria-label": "Answer bank search", children: [(0,jsx_runtime.jsxs)("form", { className: "search-row", onSubmit: handleSearch, children: [(0,jsx_runtime.jsx)("input", { value: query, onChange: (event) => setQuery(event.target.value), placeholder: "Search saved answers", "aria-label": "Search saved answers" }), (0,jsx_runtime.jsx)("button", { type: "submit", disabled: searching || !query.trim(), children: searching ? "..." : "Search" })] }), searchError && ((0,jsx_runtime.jsx)("p", { className: "status-card error", children: searchError })), (0,jsx_runtime.jsx)("div", { className: "results", children: answers.map((answer) => ((0,jsx_runtime.jsxs)("article", { className: "result", children: [(0,jsx_runtime.jsx)("p", { className: "result-question", children: answer.question }), (0,jsx_runtime.jsx)("p", { className: "result-answer", children: answer.answer }), (0,jsx_runtime.jsxs)("p", { className: "result-meta", children: [Math.round(answer.similarity * 100), "% match / used", " ", answer.timesUsed, " times"] }), (0,jsx_runtime.jsxs)("div", { className: "result-actions", children: [(0,jsx_runtime.jsx)("button", { className: "small-button secondary", type: "button", onClick: () => copyAnswer(answer), children: "Copy" }), (0,jsx_runtime.jsx)("button", { className: "small-button", type: "button", onClick: () => void props.onApplyAnswer(answer), children: "Apply" })] })] }, answer.id))) })] })] })] })] }) }));
}
function clampSidebarPosition(x, y, width, height) {
    const margin = 8;
    const maxX = Math.max(margin, window.innerWidth - width - margin);
    const maxY = Math.max(margin, window.innerHeight - height - margin);
    return {
        x: Math.min(Math.max(x, margin), maxX),
        y: Math.min(Math.max(y, margin), maxY),
    };
}
function ActionButton({ label, activeLabel, active, feedback, disabled, primary, onClick, }) {
    return ((0,jsx_runtime.jsxs)("button", { className: `action-button${primary ? " primary" : ""}`, type: "button", disabled: disabled, onClick: onClick, children: [(0,jsx_runtime.jsx)("span", { children: active ? activeLabel : feedback || label }), (active || feedback) && ((0,jsx_runtime.jsx)("span", { className: "action-status", "aria-hidden": "true", children: feedback ? "Done" : "Working" }))] }));
}

// EXTERNAL MODULE: ../../packages/shared/src/scoring/index.ts + 11 modules
var scoring = __webpack_require__(922);
;// ./src/content/sidebar/scoring.ts

function scrapedJobToJobDescription(job, createdAt = new Date().toISOString()) {
    return {
        id: job.sourceJobId || job.url,
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.type,
        remote: job.remote,
        salary: job.salary,
        description: job.description,
        requirements: job.requirements || [],
        responsibilities: job.responsibilities || [],
        keywords: job.keywords || [],
        url: job.url,
        deadline: job.deadline,
        createdAt,
    };
}
function computeJobMatchScore(profile, job) {
    if (!profile || !job)
        return null;
    return (0,scoring/* scoreResume */.K3)({
        profile,
        rawText: profile.rawText,
        job: scrapedJobToJobDescription(job),
    });
}

;// ./src/content/sidebar/storage.ts
const DISMISSED_DOMAINS_KEY = "slothing:sidebar:dismissedDomains";
const LAYOUT_BY_DOMAIN_KEY = "slothing:sidebar:layoutByDomain";
const DEFAULT_SIDEBAR_LAYOUT = {
    dock: "right",
    position: null,
    collapsed: false,
};
function normalizeSidebarDomain(hostname) {
    return hostname
        .trim()
        .toLowerCase()
        .replace(/^www\./, "");
}
async function getDismissedSidebarDomains() {
    return new Promise((resolve) => {
        chrome.storage.local.get(DISMISSED_DOMAINS_KEY, (result) => {
            const value = result[DISMISSED_DOMAINS_KEY];
            resolve(Array.isArray(value) ? value.filter(isString) : []);
        });
    });
}
async function isSidebarDismissedForDomain(hostname = window.location.hostname) {
    const domain = normalizeSidebarDomain(hostname);
    const dismissedDomains = await getDismissedSidebarDomains();
    return dismissedDomains.includes(domain);
}
async function dismissSidebarForDomain(hostname = window.location.hostname) {
    const domain = normalizeSidebarDomain(hostname);
    const dismissedDomains = await getDismissedSidebarDomains();
    const next = Array.from(new Set([...dismissedDomains, domain]));
    return new Promise((resolve) => {
        chrome.storage.local.set({ [DISMISSED_DOMAINS_KEY]: next }, resolve);
    });
}
async function restoreSidebarForDomain(hostname = window.location.hostname) {
    const domain = normalizeSidebarDomain(hostname);
    const dismissedDomains = await getDismissedSidebarDomains();
    const next = dismissedDomains.filter((item) => item !== domain);
    return new Promise((resolve) => {
        chrome.storage.local.set({ [DISMISSED_DOMAINS_KEY]: next }, resolve);
    });
}
async function getSidebarLayoutForDomain(hostname = window.location.hostname) {
    const domain = normalizeSidebarDomain(hostname);
    return new Promise((resolve) => {
        chrome.storage.local.get(LAYOUT_BY_DOMAIN_KEY, (result) => {
            const byDomain = result[LAYOUT_BY_DOMAIN_KEY];
            const value = byDomain && typeof byDomain === "object"
                ? byDomain[domain]
                : undefined;
            resolve(normalizeSidebarLayout(value));
        });
    });
}
async function setSidebarLayoutForDomain(updates, hostname = window.location.hostname) {
    const domain = normalizeSidebarDomain(hostname);
    const current = await getSidebarLayoutForDomain(hostname);
    const next = normalizeSidebarLayout({ ...current, ...updates });
    return new Promise((resolve) => {
        chrome.storage.local.get(LAYOUT_BY_DOMAIN_KEY, (result) => {
            const byDomain = result[LAYOUT_BY_DOMAIN_KEY] &&
                typeof result[LAYOUT_BY_DOMAIN_KEY] === "object"
                ? result[LAYOUT_BY_DOMAIN_KEY]
                : {};
            chrome.storage.local.set({ [LAYOUT_BY_DOMAIN_KEY]: { ...byDomain, [domain]: next } }, () => resolve(next));
        });
    });
}
function normalizeSidebarLayout(value) {
    const dock = value?.dock === "left" || value?.dock === "floating" ? value.dock : "right";
    const position = value?.position &&
        Number.isFinite(value.position.x) &&
        Number.isFinite(value.position.y)
        ? { x: value.position.x, y: value.position.y }
        : null;
    return {
        dock,
        position: dock === "floating" ? position : null,
        collapsed: !!value?.collapsed,
    };
}
function isString(value) {
    return typeof value === "string";
}

;// ./src/content/sidebar/styles.ts
const SIDEBAR_STYLES = `
:host {
  all: initial;
  color-scheme: light;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --slothing-bg: #f5efe2;
  --slothing-bg-2: #e9dec8;
  --slothing-paper: #fffaef;
  --slothing-ink: #1a1530;
  --slothing-ink-2: #3a2f24;
  --slothing-ink-3: #6a5e4a;
  --slothing-rule: rgba(26, 20, 16, 0.12);
  --slothing-rule-strong: rgba(26, 20, 16, 0.4);
  --slothing-rule-strong-bg: rgba(26, 20, 16, 0.07);
  --slothing-brand: #b8704a;
  --slothing-brand-dark: #8e5132;
  --slothing-brand-soft: #f0d9c1;
  --slothing-success: #2f6b4f;
  --slothing-success-soft: #dcebdc;
  --slothing-danger: #991b1b;
  --slothing-danger-soft: #f3d6d1;
  --slothing-shadow: 0 16px 42px rgba(26, 21, 48, 0.18);
}

*, *::before, *::after {
  box-sizing: border-box;
}

.slothing-sidebar {
  position: fixed;
  top: 96px;
  right: 0;
  z-index: 2147483000;
  color: var(--slothing-ink);
  font-family: inherit;
}

.slothing-sidebar.dock-left {
  left: 0;
  right: auto;
}

.slothing-sidebar[hidden] {
  display: none;
}

.rail,
.panel {
  border: 1px solid var(--slothing-rule);
  box-shadow: var(--slothing-shadow);
}

.rail {
  display: grid;
  grid-template-rows: auto auto;
  justify-items: center;
  align-items: center;
  gap: 8px;
  width: 52px;
  min-height: 116px;
  padding: 10px 7px;
  border-right: 0;
  border-radius: 8px 0 0 8px;
  background: var(--slothing-paper);
  cursor: pointer;
}

.dock-left .rail {
  border-right: 1px solid var(--slothing-rule);
  border-left: 0;
  border-radius: 0 8px 8px 0;
}

.rail-score {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 30px;
  min-height: 30px;
  border-radius: 999px;
  background: var(--slothing-brand-soft);
  color: var(--slothing-brand-dark);
  font-size: 12px;
  font-weight: 800;
  writing-mode: horizontal-tb;
}

.rail-label {
  max-width: 44px;
  color: var(--slothing-ink);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1.1;
  text-align: center;
  writing-mode: horizontal-tb;
}

.panel {
  width: min(330px, calc(100vw - 28px));
  max-height: min(680px, calc(100vh - 112px));
  overflow: auto;
  border-right: 0;
  border-radius: 8px 0 0 8px;
  background: var(--slothing-bg);
}

.dock-left .panel {
  border-right: 1px solid var(--slothing-rule);
  border-left: 0;
  border-radius: 0 8px 8px 0;
}

.header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 12px 10px;
  border-bottom: 1px solid var(--slothing-rule);
  background: var(--slothing-paper);
  cursor: grab;
  user-select: none;
  touch-action: none;
}

.header:active {
  cursor: grabbing;
}

.brand {
  margin: 0 0 8px;
  color: var(--slothing-brand-dark);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

.workspace-brand-row {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 7px;
  color: var(--slothing-brand-dark);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

.workspace-mark {
  display: block;
  width: 18px;
  height: 18px;
  border-radius: 5px;
  object-fit: cover;
}

.title {
  margin: 0;
  font-size: 15px;
  line-height: 1.25;
  font-weight: 800;
  overflow-wrap: anywhere;
}

.company {
  margin: 3px 0 0;
  color: #536068;
  font-size: 13px;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.icon-row {
  display: flex;
  gap: 4px;
}

button {
  border: 0;
  font: inherit;
}

button:focus-visible,
input:focus-visible {
  outline: 2px solid var(--slothing-brand);
  outline-offset: 2px;
}

.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid var(--slothing-rule);
  background: var(--slothing-bg);
  color: var(--slothing-ink);
  cursor: pointer;
}

.icon-button:hover {
  background: var(--slothing-rule-strong-bg);
}

.body {
  display: grid;
  gap: 10px;
  padding: 12px;
}

.score-card,
.actions,
.status-card {
  border: 1px solid var(--slothing-rule);
  border-radius: 8px;
  background: var(--slothing-paper);
}

.score-card {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 10px;
}

.score-pill {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  min-width: 58px;
  justify-content: flex-end;
  padding: 5px 8px;
  border: 1px solid rgba(184, 112, 74, 0.3);
  border-radius: 999px;
  background: var(--slothing-brand-soft);
  color: var(--slothing-ink);
}

.score-pill span {
  font-size: 14px;
  font-weight: 900;
  line-height: 1;
}

.score-pill small {
  color: var(--slothing-brand-dark);
  font-size: 10px;
  font-weight: 800;
  line-height: 1;
}

.score-label {
  margin: 0;
  font-size: 13px;
  font-weight: 800;
}

.score-note,
.muted,
.result-meta {
  color: var(--slothing-ink-3);
  font-size: 11px;
  line-height: 1.4;
}

.actions {
  display: grid;
  gap: 6px;
  padding: 8px;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 36px;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid var(--slothing-rule);
  background: var(--slothing-paper);
  color: var(--slothing-ink);
  font-weight: 750;
  cursor: pointer;
}

.action-status {
  color: var(--slothing-success);
  font-size: 10px;
  font-weight: 850;
  text-transform: uppercase;
}

.action-button.primary {
  background: var(--slothing-ink);
  color: var(--slothing-paper);
}

.action-button:hover:not(:disabled) {
  filter: brightness(0.96);
}

.action-button:disabled {
  cursor: not-allowed;
  opacity: 0.62;
}

.status-card {
  padding: 10px 12px;
  font-size: 12px;
  line-height: 1.4;
}

.status-card.success {
  border-color: rgba(47, 107, 79, 0.3);
  color: var(--slothing-success);
  background: var(--slothing-success-soft);
}

.status-card.error {
  border-color: rgba(153, 27, 27, 0.26);
  color: var(--slothing-danger);
  background: var(--slothing-danger-soft);
}

.utility-section {
  border: 1px solid var(--slothing-rule);
  border-radius: 8px;
  background: var(--slothing-paper);
}

.utility-section summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 36px;
  padding: 0 10px;
  color: var(--slothing-ink);
  font-size: 13px;
  font-weight: 850;
  cursor: pointer;
  list-style: none;
}

.utility-section summary::-webkit-details-marker {
  display: none;
}

.utility-section summary::after {
  content: "+";
  color: var(--slothing-ink-3);
  font-weight: 900;
}

.utility-section[open] summary {
  border-bottom: 1px solid var(--slothing-rule);
}

.utility-section[open] summary::after {
  content: "-";
}

.answer-bank {
  padding: 10px;
}

.section-title {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 850;
}

.search-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
}

.search-row input {
  width: 100%;
  min-width: 0;
  height: 34px;
  border: 1px solid var(--slothing-rule);
  border-radius: 6px;
  padding: 0 10px;
  color: var(--slothing-ink);
  font: inherit;
  font-size: 13px;
}

.search-row button,
.small-button {
  min-height: 34px;
  border-radius: 6px;
  padding: 0 10px;
  border: 1px solid var(--slothing-ink);
  background: var(--slothing-ink);
  color: var(--slothing-paper);
  cursor: pointer;
}

.results {
  display: grid;
  gap: 8px;
  margin-top: 10px;
}

.result {
  border-top: 1px solid var(--slothing-rule);
  padding-top: 8px;
}

.result-question,
.result-answer {
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
}

.result-question {
  font-weight: 800;
}

.result-answer {
  margin-top: 4px;
  color: var(--slothing-ink-2);
}

.result-actions {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}

.small-button {
  min-height: 28px;
  padding: 0 8px;
  font-size: 12px;
}

.small-button.secondary {
  border-color: var(--slothing-rule);
  background: var(--slothing-paper);
  color: var(--slothing-ink);
}

/* P4/#40 — Inline AI assistant chat panel */
.chat-panel {
  border: 0;
  border-radius: 0;
  padding: 10px;
}

.chat-panel .section-title {
  display: none;
}

.chat-seed-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-bottom: 8px;
}

.chat-seed-row .small-button {
  width: 100%;
  min-height: 32px;
  padding: 0 8px;
  font-size: 12px;
  white-space: normal;
  line-height: 1.2;
}

.chat-input-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 6px;
  align-items: end;
}

.chat-input-row textarea {
  width: 100%;
  min-width: 0;
  resize: vertical;
  min-height: 36px;
  max-height: 120px;
  border: 1px solid var(--slothing-rule);
  border-radius: 6px;
  padding: 8px 10px;
  color: var(--slothing-ink);
  font: inherit;
  font-size: 13px;
  line-height: 1.35;
  background: var(--slothing-paper);
}

.chat-input-row textarea:disabled {
  background: var(--slothing-bg-2);
  color: var(--slothing-ink-3);
}

.chat-result {
  margin-top: 10px;
  min-height: 16px;
}

.chat-spinner {
  margin: 0;
  color: var(--slothing-ink-3);
  font-size: 12px;
  font-style: italic;
}

.chat-output {
  margin: 0;
  color: var(--slothing-ink);
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.chat-error {
  margin-top: 8px;
}

.chat-use-cta {
  margin-top: 10px;
  width: 100%;
}

@media (max-width: 1023px) {
  .slothing-sidebar {
    display: none;
  }
}
`;

;// ./src/content/sidebar/controller.tsx






const HOST_ID = "slothing-job-page-sidebar-host";
const DESKTOP_MIN_WIDTH = 1024;
class JobPageSidebarController {
    constructor() {
        this.host = null;
        this.root = null;
        this.state = null;
        this.layout = DEFAULT_SIDEBAR_LAYOUT;
        this.dismissedDomain = null;
        this.handleResize = () => this.render();
        window.addEventListener("resize", this.handleResize);
    }
    async update(next) {
        this.state = next;
        this.dismissedDomain = (await isSidebarDismissedForDomain())
            ? normalizeSidebarDomain(window.location.hostname)
            : null;
        this.layout = await getSidebarLayoutForDomain();
        this.render();
    }
    showCollapsed() {
        void this.updateLayout({ collapsed: true });
        this.render();
    }
    async dismissDomain() {
        await dismissSidebarForDomain();
        this.dismissedDomain = normalizeSidebarDomain(window.location.hostname);
        this.unmount();
    }
    async restoreDomain() {
        await restoreSidebarForDomain();
        this.dismissedDomain = null;
        await this.updateLayout({ collapsed: false });
        this.render();
    }
    getStatus() {
        return {
            visible: !!this.root && !!this.state?.scrapedJob && !this.dismissedDomain,
            dismissed: this.dismissedDomain ===
                normalizeSidebarDomain(window.location.hostname),
            layout: this.layout,
        };
    }
    destroy() {
        window.removeEventListener("resize", this.handleResize);
        this.unmount();
        this.state = null;
    }
    render() {
        if (!this.state?.scrapedJob ||
            window.innerWidth < DESKTOP_MIN_WIDTH ||
            this.dismissedDomain === normalizeSidebarDomain(window.location.hostname)) {
            this.unmount();
            return;
        }
        const root = this.ensureRoot();
        const score = computeJobMatchScore(this.state.profile, this.state.scrapedJob);
        root.render((0,jsx_runtime.jsx)(JobPageSidebar, { scrapedJob: this.state.scrapedJob, detectedFieldCount: this.state.detectedFieldCount, score: score, layout: this.layout, onLayoutChange: (updates) => {
                void this.updateLayout(updates);
            }, onDismiss: () => this.dismissDomain(), onTailor: this.state.onTailor, onCoverLetter: this.state.onCoverLetter, onSave: this.state.onSave, onAutoFill: this.state.onAutoFill, onSearchAnswers: this.state.onSearchAnswers, onApplyAnswer: this.state.onApplyAnswer, onChatStream: this.state.onChatStream, onUseInCoverLetter: this.state.onUseInCoverLetter }));
    }
    async updateLayout(updates) {
        this.layout = { ...this.layout, ...updates };
        if (this.layout.dock !== "floating") {
            this.layout.position = null;
        }
        this.render();
        this.layout = await setSidebarLayoutForDomain(this.layout);
        this.render();
    }
    ensureRoot() {
        if (this.root)
            return this.root;
        const existing = document.getElementById(HOST_ID);
        this.host = existing || document.createElement("div");
        this.host.id = HOST_ID;
        if (!existing) {
            document.documentElement.appendChild(this.host);
        }
        const shadowRoot = this.host.shadowRoot || this.host.attachShadow({ mode: "open" });
        if (!shadowRoot.querySelector("style")) {
            const style = document.createElement("style");
            style.textContent = SIDEBAR_STYLES;
            shadowRoot.appendChild(style);
        }
        let mount = shadowRoot.querySelector("[data-sidebar-root]");
        if (!mount) {
            mount = document.createElement("div");
            mount.dataset.sidebarRoot = "true";
            shadowRoot.appendChild(mount);
        }
        this.root = (0,client/* createRoot */.H)(mount);
        return this.root;
    }
    unmount() {
        this.root?.unmount();
        this.root = null;
        this.host?.remove();
        this.host = null;
    }
}

;// ./src/content/corrections-tracker.ts
// Corrections feedback loop (#33).
//
// When the autofill writes a value into a field we register it here for a
// 30-second window. If the user edits the value and the final value differs
// from the original suggestion when they blur the field, we POST a
// SAVE_CORRECTION message to the background script so the per-domain field
// mapping grows stronger over time.
//
// This module deliberately has no DOM-querying side-effects at import time so
// it stays pure-importable from tests.

/**
 * Default tracking window. Per the roadmap we track for 30s after fill so
 * we only learn from "I am correcting what you just filled" edits, not from
 * a user revisiting the form 20 minutes later. Exposed for tests.
 */
const CORRECTION_TRACK_WINDOW_MS = 30000;
/**
 * Pure heuristic: returns true when the user's final value should be treated
 * as a correction of the original suggestion. We normalize whitespace + case
 * because trailing spaces, casing differences in emails, and a stray newline
 * in a textarea shouldn't count as "the user disagreed with our suggestion."
 *
 * Exported so the unit test can lock the behavior in independently.
 */
function wasCorrection(original, current) {
    const a = normalize(original);
    const b = normalize(current);
    if (b.length === 0) {
        // Clearing the field is also a correction — but only if the original
        // was non-empty. An empty-on-empty pair is not a correction.
        return a.length > 0;
    }
    return a !== b;
}
function normalize(value) {
    return value.replace(/\s+/g, " ").trim().toLowerCase();
}
/**
 * Build a stable signature for a field. The roadmap calls for a
 * `fieldSignature` keyed against `(user_id, domain, field_signature)`, so we
 * want something that's stable across form re-renders (e.g. React keys
 * regenerating on every state change) yet specific enough to disambiguate
 * the email field on /apply from the email field on /signup.
 *
 * We combine: field type, autocomplete hint, name, id, label, placeholder,
 * and the form's path-derived id. None of these alone is reliable —
 * Workday uses `data-automation-id`, Lever uses `name`, Greenhouse uses `id`
 * — but the conjunction is.
 */
function computeFieldSignature(field) {
    const el = field.element;
    const signals = gatherSignalSubset(el);
    const parts = [
        `t:${field.fieldType}`,
        signals.autocomplete ? `ac:${signals.autocomplete}` : "",
        signals.name ? `n:${signals.name}` : "",
        signals.id ? `i:${signals.id}` : "",
        field.label ? `l:${normalize(field.label).slice(0, 80)}` : "",
        field.placeholder ? `p:${normalize(field.placeholder).slice(0, 60)}` : "",
    ].filter(Boolean);
    return parts.join("|");
}
function gatherSignalSubset(el) {
    return {
        name: el.name?.toLowerCase() || "",
        id: el.id?.toLowerCase() || "",
        autocomplete: el.autocomplete || "",
    };
}
class CorrectionsTracker {
    constructor(options = {}) {
        this.entries = new Map();
        this.windowMs = options.windowMs ?? CORRECTION_TRACK_WINDOW_MS;
        this.domain = options.domain ?? this.getDefaultDomain();
        this.send = options.send ?? defaultSender;
        this.now = options.now ?? (() => Date.now());
    }
    /**
     * Register a field that was just autofilled. The tracker will fire
     * SAVE_CORRECTION on blur within the next 30 seconds if and only if the
     * user has edited the value to something different from the suggestion.
     *
     * Calling `track` on a field that's already tracked replaces the prior
     * entry so the most recent suggestion is the one we diff against.
     */
    track(field, originalSuggestion) {
        const el = field.element;
        if (originalSuggestion.length === 0) {
            // Nothing to compare against — bail.
            return;
        }
        this.untrack(el);
        const fieldSignature = computeFieldSignature(field);
        const fieldType = field.fieldType;
        const startedAt = this.now();
        const blurHandler = (event) => {
            const target = event.target;
            if (!target)
                return;
            const entry = this.entries.get(target);
            if (!entry || entry.fired)
                return;
            const elapsed = this.now() - entry.startedAt;
            if (elapsed > this.windowMs)
                return;
            const userValue = readValue(target);
            if (!wasCorrection(entry.originalSuggestion, userValue))
                return;
            entry.fired = true;
            void Promise.resolve(this.send({
                domain: this.domain,
                fieldSignature: entry.fieldSignature,
                fieldType: entry.fieldType,
                originalSuggestion: entry.originalSuggestion,
                userValue,
                confidence: entry.confidence,
            })).catch((err) => {
                console.error("[Slothing] saveCorrection failed:", err);
            });
            // Once we've fired the correction we can stop listening — no point
            // re-firing on every subsequent blur.
            this.untrack(target);
        };
        el.addEventListener("blur", blurHandler);
        const expiryTimer = setTimeout(() => {
            this.untrack(el);
        }, this.windowMs);
        this.entries.set(el, {
            element: el,
            originalSuggestion,
            fieldType,
            fieldSignature,
            confidence: field.confidence,
            startedAt,
            blurHandler,
            expiryTimer,
            fired: false,
        });
    }
    /** Stop tracking a single field (also called automatically on 30s expiry). */
    untrack(element) {
        const entry = this.entries.get(element);
        if (!entry)
            return;
        element.removeEventListener("blur", entry.blurHandler);
        clearTimeout(entry.expiryTimer);
        this.entries.delete(element);
    }
    /** Stop tracking every field. Called on page hide. */
    clear() {
        for (const entry of this.entries.values()) {
            entry.element.removeEventListener("blur", entry.blurHandler);
            clearTimeout(entry.expiryTimer);
        }
        this.entries.clear();
    }
    /** Number of fields currently being tracked. Exposed for tests. */
    size() {
        return this.entries.size;
    }
    getDefaultDomain() {
        try {
            // hostname strips port + path so two ports on the same host (rare) share
            // a mapping. Matches the server-side normalization in the route.
            return typeof window === "undefined"
                ? "unknown"
                : window.location.hostname || "unknown";
        }
        catch {
            return "unknown";
        }
    }
}
function readValue(el) {
    if (el instanceof HTMLSelectElement) {
        const selected = el.options[el.selectedIndex];
        return selected?.text ?? el.value ?? "";
    }
    return el.value ?? "";
}
async function defaultSender(payload) {
    await (0,messages/* sendMessage */._z)(messages/* Messages */.B2.saveCorrection(payload));
}

;// ./src/content/scrapers/linkedin-passive-capture.ts
// P3/#38 — Passive LinkedIn capture.
//
// LinkedIn's TOS prohibits auto-navigation and their anti-bot is active, so
// this module is deliberately read-only. It runs *after* the content script
// has scraped a LinkedIn detail page the user is already viewing and:
//
//   1. Looks up the LinkedIn jobId against a session-scoped seen set
//      (`chrome.storage.session.linkedInSeen`) and short-circuits on hit.
//   2. Enforces a 50-capture-per-24h daily cap, keyed by a `{date, count}`
//      record in `chrome.storage.local`. Hitting the cap is a silent no-op
//      (no error toast, no enqueue).
//   3. Enqueues the scraped job via the existing `IMPORT_JOB` message, which
//      lands at `/api/opportunities/from-extension` and ends up in the review
//      queue.
//   4. Shows a one-shot "Saved for later" toast on the first capture per
//      session.
//
// Everything in this file is passive: no `.click()`, no list-page traversal,
// no DOM mutation other than mounting the toast element in document.body.
//
// Storage shapes:
//   chrome.storage.session[LINKEDIN_SEEN_KEY] : string[]      // job ids
//   chrome.storage.local[LINKEDIN_DAILY_KEY]  : { date: "YYYY-MM-DD",
//                                                 count: number }
const LINKEDIN_SEEN_KEY = "linkedInSeen";
const LINKEDIN_DAILY_KEY = "slothingLinkedInDailyCap";
const LINKEDIN_DAILY_CAP = 50;
const LINKEDIN_TOAST_CLASS = "slothing-toast-linkedin-capture";
/** YYYY-MM-DD in the user's local timezone — same calendar day the user sees. */
function localDateStamp(now = new Date()) {
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}
// ---- session-scoped seen set --------------------------------------------
/**
 * Reads the current session's seen list. Returns `[]` when
 * `chrome.storage.session` is unavailable (older browsers) or the entry is
 * missing — both branches are safe because a missing seen entry just means
 * "no captures yet this session", which is the correct default.
 */
async function getLinkedInSeenIds() {
    const session = chrome.storage?.session;
    if (!session)
        return [];
    return new Promise((resolve) => {
        session.get(LINKEDIN_SEEN_KEY, (result) => {
            const value = result?.[LINKEDIN_SEEN_KEY];
            if (Array.isArray(value)) {
                // Defensive — filter to strings only so a malformed write can't crash
                // the rest of the capture pipeline.
                resolve(value.filter((id) => typeof id === "string"));
            }
            else {
                resolve([]);
            }
        });
    });
}
/**
 * Appends a jobId to the session-scoped seen list. No-ops when the session
 * store is unavailable — the daily cap is the safety net on browsers without
 * `chrome.storage.session`.
 */
async function addLinkedInSeenId(jobId) {
    const session = chrome.storage?.session;
    if (!session)
        return;
    const current = await getLinkedInSeenIds();
    if (current.includes(jobId))
        return;
    const next = [...current, jobId];
    return new Promise((resolve) => {
        session.set({ [LINKEDIN_SEEN_KEY]: next }, () => resolve());
    });
}
// ---- daily cap counter --------------------------------------------------
/**
 * Reads the daily-cap counter from `chrome.storage.local`. Returns a fresh
 * `{date, count: 0}` when:
 *   - nothing has been written yet,
 *   - the stored stamp is from a previous local-time day (cross-day reset),
 *   - the value is malformed.
 */
async function getLinkedInDailyCapState(now = new Date()) {
    const today = localDateStamp(now);
    const local = chrome.storage?.local;
    if (!local)
        return { date: today, count: 0 };
    return new Promise((resolve) => {
        local.get(LINKEDIN_DAILY_KEY, (result) => {
            const stored = result?.[LINKEDIN_DAILY_KEY];
            if (stored &&
                typeof stored.date === "string" &&
                typeof stored.count === "number" &&
                stored.date === today) {
                resolve({ date: stored.date, count: stored.count });
            }
            else {
                // Stale day / missing / malformed — same behaviour: today's count = 0.
                resolve({ date: today, count: 0 });
            }
        });
    });
}
/**
 * Increments the daily-cap counter and persists it. Returns the new state so
 * callers don't need a second read to display the running tally.
 */
async function incrementLinkedInDailyCap(now = new Date()) {
    const current = await getLinkedInDailyCapState(now);
    const next = {
        date: current.date,
        count: current.count + 1,
    };
    const local = chrome.storage?.local;
    if (!local)
        return next;
    return new Promise((resolve) => {
        local.set({ [LINKEDIN_DAILY_KEY]: next }, () => resolve(next));
    });
}
// ---- toast --------------------------------------------------------------
/**
 * Mounts a non-blocking toast announcing the running session capture count.
 * Idempotent: any prior LinkedIn-capture toast is removed first so a rapid
 * second capture doesn't stack toasts on top of each other.
 *
 * The toast is the ONLY DOM mutation this module performs on a LinkedIn page,
 * and it's appended to `document.body` rather than spliced into LinkedIn's
 * own markup. This keeps us off the anti-bot radar (we're not touching their
 * elements) and makes the "no DOM mutation beyond toast container" test
 * cheap to assert.
 */
function showLinkedInCaptureToast(count) {
    if (typeof document === "undefined" || !document.body)
        return;
    document.querySelector(`.${LINKEDIN_TOAST_CLASS}`)?.remove();
    const toast = document.createElement("div");
    toast.className = `slothing-toast ${LINKEDIN_TOAST_CLASS}`;
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    // Pluralisation is local rather than via @slothing/web's pluralize() because
    // this content script can't pull in the web workspace's helpers without
    // bloating the bundle.
    const noun = count === 1 ? "job" : "jobs";
    toast.textContent = `Saved for later — ${count} LinkedIn ${noun} captured this session.`;
    const dismiss = () => toast.remove();
    window.setTimeout(dismiss, 5000);
    document.body.appendChild(toast);
}
const sessionState = { toastShown: false };
/** Test hook — resets the in-memory "first capture this session" flag. */
function resetLinkedInCaptureSessionState() {
    sessionState.toastShown = false;
}
/**
 * Main entry point. Call once per LinkedIn detail-page scrape. The caller is
 * responsible for ensuring `job.source === "linkedin"` and `job.sourceJobId`
 * is set before invoking this function — passing an unrelated job here is a
 * no-op (`skipped`) rather than an error to keep the integration point in
 * `content/index.ts` ergonomic.
 */
async function tryCaptureLinkedInJob(job, deps) {
    if (job.source !== "linkedin")
        return "skipped";
    const jobId = job.sourceJobId;
    if (!jobId)
        return "skipped";
    const now = (deps.now || (() => new Date()))();
    // 1. Session-scoped dedupe — visiting the same job twice in one session
    //    must not double-enqueue.
    const seen = await getLinkedInSeenIds();
    if (seen.includes(jobId))
        return "deduped";
    // 2. Daily cap — hitting 50/day is a silent no-op. We intentionally do NOT
    //    show an error toast (per #38 acceptance: "no error toast").
    const cap = await getLinkedInDailyCapState(now);
    if (cap.count >= LINKEDIN_DAILY_CAP)
        return "capped";
    // 3. Enqueue. We update the seen set and the daily counter BEFORE awaiting
    //    the network call so a slow response can't let a duplicate slip
    //    through if the user navigates back to the same job before the first
    //    request completes. If the network call fails we still consume one
    //    daily-cap slot — that's the conservative behaviour for an anti-spam
    //    rate limiter.
    await addLinkedInSeenId(jobId);
    const nextCap = await incrementLinkedInDailyCap(now);
    try {
        const response = await deps.sendMessage(deps.buildImportMessage(job));
        if (!response.success) {
            // Background already logs the underlying error; we just bail so the
            // toast doesn't claim a successful capture.
            return "error";
        }
    }
    catch {
        return "error";
    }
    // 4. First-capture-of-session toast only. We use the running session
    //    counter for the displayed number rather than the daily count because
    //    "captured this session" is what the copy promises.
    if (!sessionState.toastShown) {
        sessionState.toastShown = true;
        const sessionCount = (await getLinkedInSeenIds()).length;
        const showToast = deps.showToast || showLinkedInCaptureToast;
        showToast(sessionCount);
    }
    // Hint to the caller for tests/logs. The daily counter is included for
    // observability but isn't part of the user-facing flow.
    void nextCap;
    return "captured";
}

;// ./src/content/ui/answer-bank-button-styles.ts
// Styles for the inline answer-bank button + popover.
//
// Lives in a TS file (not a CSS file) so we can inject it directly into the
// shadow root of each decoration. We mirror the popup design tokens locally —
// the spec says to NOT import from `popup/styles.css`, so any token change in
// the popup needs a parallel change here.
//
// Tokens mirrored from the Slothing editorial palette in the popup/options.
const ANSWER_BANK_BUTTON_STYLES = `
:host, .slothing-ab-root {
  --slothing-ab-primary: #1a1530;
  --slothing-ab-primary-hover: #8e5132;
  --slothing-ab-primary-soft: #f0d9c1;
  --slothing-ab-bg: #f5efe2;
  --slothing-ab-bg-soft: #e9dec8;
  --slothing-ab-surface: #fffaef;
  --slothing-ab-border: rgba(26, 20, 16, 0.12);
  --slothing-ab-border-strong: rgba(26, 20, 16, 0.4);
  --slothing-ab-text: #1a1530;
  --slothing-ab-text-muted: #6a5e4a;
  --slothing-ab-brand: #b8704a;
  --slothing-ab-shadow: 0 10px 24px rgba(26, 21, 48, 0.14);
  --slothing-ab-radius: 10px;
  --slothing-ab-radius-sm: 6px;
}

.slothing-ab-root {
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto,
    Oxygen, Ubuntu, sans-serif;
  font-size: 12px;
  line-height: 1.4;
  color: var(--slothing-ab-text);
}

.slothing-ab-button {
  width: 16px;
  height: 16px;
  padding: 0;
  margin: 0;
  border: 1px solid var(--slothing-ab-border-strong);
  border-radius: 50%;
  background: var(--slothing-ab-surface);
  color: var(--slothing-ab-brand);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  line-height: 1;
  cursor: pointer;
  box-shadow: var(--slothing-ab-shadow);
  transition: transform 100ms ease, box-shadow 100ms ease;
}

.slothing-ab-button:hover {
  transform: scale(1.06);
}

.slothing-ab-button:focus-visible {
  outline: 2px solid var(--slothing-ab-brand);
  outline-offset: 2px;
}

.slothing-ab-icon {
  display: inline-block;
  font-size: 11px;
  line-height: 1;
}

.slothing-ab-popover {
  position: absolute;
  top: 22px;
  right: 0;
  width: 240px;
  max-height: 240px;
  display: flex;
  flex-direction: column;
  background: var(--slothing-ab-surface);
  border: 1px solid var(--slothing-ab-border);
  border-radius: var(--slothing-ab-radius);
  box-shadow: var(--slothing-ab-shadow);
  overflow: hidden;
  z-index: 1;
}

.slothing-ab-popover__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background: var(--slothing-ab-bg-soft);
  border-bottom: 1px solid var(--slothing-ab-border);
}

.slothing-ab-popover__title {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--slothing-ab-text);
}

.slothing-ab-popover__close {
  width: 18px;
  height: 18px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--slothing-ab-text-muted);
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  border-radius: 4px;
}

.slothing-ab-popover__close:hover {
  background: var(--slothing-ab-primary-soft);
  color: var(--slothing-ab-primary-hover);
}

.slothing-ab-popover__body {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 6px;
}

.slothing-ab-popover__status {
  margin: 8px 6px;
  color: var(--slothing-ab-text-muted);
  font-size: 12px;
}

.slothing-ab-popover__status--error {
  color: #b91c1c;
}

.slothing-ab-match {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-areas:
    "question score"
    "answer answer";
  gap: 2px 6px;
  width: 100%;
  padding: 6px 8px;
  margin: 2px 0;
  border: 0;
  border-radius: var(--slothing-ab-radius-sm);
  background: transparent;
  cursor: pointer;
  text-align: left;
  font: inherit;
  color: inherit;
}

.slothing-ab-match:hover,
.slothing-ab-match:focus-visible {
  background: var(--slothing-ab-primary-soft);
  outline: none;
}

.slothing-ab-match__question {
  grid-area: question;
  font-weight: 600;
  font-size: 12px;
  color: var(--slothing-ab-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.slothing-ab-match__answer {
  grid-area: answer;
  font-size: 11px;
  color: var(--slothing-ab-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.slothing-ab-match__score {
  grid-area: score;
  align-self: start;
  font-size: 10px;
  font-weight: 600;
  color: var(--slothing-ab-primary-hover);
  background: var(--slothing-ab-primary-soft);
  padding: 1px 6px;
  border-radius: 999px;
}

.slothing-ab-popover__footer {
  padding: 6px;
  border-top: 1px solid var(--slothing-ab-border);
  background: var(--slothing-ab-bg-soft);
}

.slothing-ab-popover__generate {
  display: inline-block;
  width: 100%;
  padding: 6px 8px;
  border: 0;
  border-radius: var(--slothing-ab-radius-sm);
  background: var(--slothing-ab-primary);
  color: var(--slothing-ab-surface);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.slothing-ab-popover__generate:hover {
  background: var(--slothing-ab-primary-hover);
}

.slothing-ab-popover__generate:focus-visible {
  outline: 2px solid var(--slothing-ab-brand);
  outline-offset: 2px;
}
`;

;// ./src/content/ui/answer-bank-button.tsx

// P2/#35 — Inline answer-bank search on long textareas.
//
// Scans textareas where:
//   - maxlength > 300 OR no maxlength
//   - AND the associated label matches LABEL_MATCH_REGEX
// and decorates each match with a 16x16 "lightbulb" affordance pinned to the
// textarea's top-right corner. Clicking the affordance toggles a popover
// showing the top 3 answer-bank matches plus a "Generate new" button.
//
// Rendering follows the same pattern as the in-page sidebar
// (`apps/extension/src/content/sidebar/controller.tsx`): one shadow-DOM host
// per textarea, React renders inside the shadow root. We DO NOT import the
// sidebar's design — we mirror the popup tokens locally in
// `apps/extension/src/content/ui/styles.css` instead.
//
// IMPORTANT: this module is also imported by a unit test in a jsdom
// environment. Anything that needs `createRoot` or chrome APIs is lazily
// resolved (the predicate + regex are pure helpers).

// Matches application essay prompts ("Tell us about a time…", "Why are you
// interested in this role?", "Describe a challenge you've overcome", etc.).
// Keep this list aligned with the spec in docs/extension-roadmap-2026-05.md #35
// — DO NOT broaden without a roadmap update.
const LABEL_MATCH_REGEX = /tell us about|describe a|why are you interested|why this company|what motivates|biggest challenge/i;
// 300 character minimum maxlength to count as a "long" textarea. Anything
// below 300 is almost certainly a short-answer field that doesn't need the
// answer-bank surface. Textareas with no maxlength at all also qualify.
const LONG_TEXTAREA_MIN_MAXLENGTH = 300;
// Extracts the text associated with a textarea. Tries, in order:
//   1. aria-label on the textarea itself
//   2. aria-labelledby pointing to one or more elements
//   3. <label for="textareaId">
//   4. an ancestor <label>
//   5. the placeholder, as a last resort
// Returns the trimmed string, or "" if no label could be found.
function extractTextareaLabel(textarea) {
    const ariaLabel = textarea.getAttribute("aria-label");
    if (ariaLabel && ariaLabel.trim())
        return ariaLabel.trim();
    const labelledBy = textarea.getAttribute("aria-labelledby");
    if (labelledBy && textarea.ownerDocument) {
        const parts = labelledBy
            .split(/\s+/)
            .map((id) => textarea.ownerDocument.getElementById(id))
            .filter((el) => Boolean(el))
            .map((el) => el.textContent?.trim() || "")
            .filter(Boolean);
        if (parts.length > 0)
            return parts.join(" ").trim();
    }
    const id = textarea.id;
    if (id && textarea.ownerDocument) {
        // CSS.escape isn't available in all jsdom builds; do a manual escape on the
        // very narrow set of characters that could appear in an HTML id.
        const escapedId = id.replace(/(["\\\]])/g, "\\$1");
        const explicit = textarea.ownerDocument.querySelector(`label[for="${escapedId}"]`);
        if (explicit?.textContent?.trim())
            return explicit.textContent.trim();
    }
    let parent = textarea.parentElement;
    while (parent) {
        if (parent.tagName === "LABEL" && parent.textContent?.trim()) {
            // Strip out the textarea's own value/content from the ancestor label
            // text. We do this naively by replacing the textarea's value if it
            // appears as a substring.
            const text = parent.textContent.trim();
            const ownValue = textarea.value || "";
            const cleaned = ownValue ? text.replace(ownValue, "").trim() : text;
            if (cleaned)
                return cleaned;
        }
        parent = parent.parentElement;
    }
    const placeholder = textarea.placeholder?.trim();
    if (placeholder)
        return placeholder;
    return "";
}
// Predicate: should we decorate this textarea with the 💡 affordance?
// Pure function — no DOM mutations, safe to call from a MutationObserver.
function shouldDecorateTextarea(textarea) {
    // Skip disabled / hidden / readonly textareas.
    if (textarea.disabled || textarea.readOnly)
        return false;
    if (textarea.getAttribute("aria-hidden") === "true")
        return false;
    if (textarea.type === "hidden")
        return false;
    // Length filter: maxlength > 300 OR no maxlength attribute at all.
    // Note `textarea.maxLength` returns -1 when the attribute is absent.
    const hasAttr = textarea.hasAttribute("maxlength");
    if (hasAttr) {
        const max = textarea.maxLength;
        if (!(max > LONG_TEXTAREA_MIN_MAXLENGTH))
            return false;
    }
    const label = extractTextareaLabel(textarea);
    if (!label)
        return false;
    return LABEL_MATCH_REGEX.test(label);
}
function AnswerBankButton(props) {
    const [open, setOpen] = (0,react.useState)(false);
    const [loading, setLoading] = (0,react.useState)(false);
    const [error, setError] = (0,react.useState)(null);
    const [matches, setMatches] = (0,react.useState)([]);
    const containerRef = (0,react.useRef)(null);
    // Close on Escape, close on outside-click. Both effects only attach while
    // the popover is open so we never leak listeners.
    (0,react.useEffect)(() => {
        if (!open)
            return;
        function handleDocClick(event) {
            const target = event.target;
            if (!target)
                return;
            if (containerRef.current && containerRef.current.contains(target))
                return;
            setOpen(false);
        }
        function handleDocKey(event) {
            if (event.key === "Escape") {
                setOpen(false);
            }
        }
        // `mousedown` fires before any nested click, so we avoid the "click closes
        // before the picked answer's click fires" race.
        document.addEventListener("mousedown", handleDocClick, true);
        document.addEventListener("keydown", handleDocKey, true);
        return () => {
            document.removeEventListener("mousedown", handleDocClick, true);
            document.removeEventListener("keydown", handleDocKey, true);
        };
    }, [open]);
    // Fetch matches when the popover opens (or when the question changes while
    // open). We refetch on each open so the bank stays fresh.
    (0,react.useEffect)(() => {
        if (!open)
            return;
        let cancelled = false;
        setLoading(true);
        setError(null);
        props
            .onMatch(props.question, 3)
            .then((results) => {
            if (cancelled)
                return;
            setMatches(results.slice(0, 3));
        })
            .catch((err) => {
            if (cancelled)
                return;
            setError(err?.message || "Couldn't reach Slothing.");
        })
            .finally(() => {
            if (!cancelled)
                setLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, [open, props.question]);
    function handleButtonKey(event) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen((v) => !v);
        }
    }
    return ((0,jsx_runtime.jsxs)("div", { ref: containerRef, className: "slothing-ab-root", "data-testid": "slothing-ab-root", children: [(0,jsx_runtime.jsx)("button", { type: "button", className: "slothing-ab-button", "aria-label": "Open Slothing answer bank", title: "Slothing answer bank", 
                // Only focusable while the popover is open. Per spec we don't want to
                // hijack tab order on long forms — the user reaches the button by
                // clicking, not tabbing.
                tabIndex: open ? 0 : -1, onClick: () => setOpen((v) => !v), onKeyDown: handleButtonKey, children: (0,jsx_runtime.jsx)("span", { "aria-hidden": "true", className: "slothing-ab-icon", children: "\uD83D\uDCA1" }) }), open && ((0,jsx_runtime.jsxs)("div", { className: "slothing-ab-popover", role: "dialog", "aria-label": "Saved answers", children: [(0,jsx_runtime.jsxs)("header", { className: "slothing-ab-popover__header", children: [(0,jsx_runtime.jsx)("p", { className: "slothing-ab-popover__title", children: "Saved answers" }), (0,jsx_runtime.jsx)("button", { type: "button", className: "slothing-ab-popover__close", "aria-label": "Close", onClick: () => setOpen(false), children: "\u00D7" })] }), (0,jsx_runtime.jsxs)("div", { className: "slothing-ab-popover__body", children: [loading && ((0,jsx_runtime.jsx)("p", { className: "slothing-ab-popover__status", children: "Searching\u2026" })), error && ((0,jsx_runtime.jsx)("p", { className: "slothing-ab-popover__status slothing-ab-popover__status--error", role: "status", children: error })), !loading && !error && matches.length === 0 && ((0,jsx_runtime.jsx)("p", { className: "slothing-ab-popover__status", children: "No saved answers yet. Try Generate new \u2192" })), matches.map((match) => ((0,jsx_runtime.jsxs)("button", { type: "button", className: "slothing-ab-match", onClick: () => {
                                    props.onPick(match);
                                    setOpen(false);
                                }, children: [(0,jsx_runtime.jsx)("span", { className: "slothing-ab-match__question", children: match.question }), (0,jsx_runtime.jsx)("span", { className: "slothing-ab-match__answer", children: answer_bank_button_truncate(match.answer, 80) }), (0,jsx_runtime.jsxs)("span", { className: "slothing-ab-match__score", "aria-label": `Match ${Math.round((match.score ?? 0) * 100)} percent`, children: [Math.round((match.score ?? 0) * 100), "%"] })] }, match.id)))] }), (0,jsx_runtime.jsx)("footer", { className: "slothing-ab-popover__footer", children: (0,jsx_runtime.jsx)("button", { type: "button", className: "slothing-ab-popover__generate", onClick: () => {
                                props.onGenerate(props.question);
                                setOpen(false);
                            }, children: "Generate new" }) })] }))] }));
}
// Truncate a string at `max` characters, appending an ellipsis when clipped.
// Pure helper so tests can assert behaviour deterministically.
function answer_bank_button_truncate(input, max) {
    if (input.length <= max)
        return input;
    return `${input.slice(0, max).trimEnd()}…`;
}
// ---- Decorator API (mount/unmount) -------------------------------------
//
// This module is loaded by both jsdom unit tests (which only exercise the
// regex/predicate exports above) and the real content script. Anything below
// uses `react-dom/client` and may touch chrome APIs indirectly.


const DECORATION_MARKER = "__slothingAbDecorated";
const HOST_CLASS = "slothing-ab-host";
// Keep a registry so unmountAllAnswerBankButtons() can tear everything down on
// pagehide without leaking observers or React roots.
const mountedDecorations = new Set();
function mountAnswerBankButton(textarea, handlers) {
    // De-dupe: never decorate the same textarea twice.
    const marked = textarea;
    if (marked[DECORATION_MARKER])
        return null;
    marked[DECORATION_MARKER] = true;
    const question = extractTextareaLabel(textarea);
    if (!question) {
        marked[DECORATION_MARKER] = false;
        return null;
    }
    const host = document.createElement("div");
    host.className = HOST_CLASS;
    // Absolute position relative to the document — we'll keep the host pinned
    // to the textarea's bounding rect via ResizeObserver + scroll listeners.
    host.style.position = "absolute";
    host.style.zIndex = "2147483640";
    host.style.pointerEvents = "auto";
    // The host is fixed-size (16x16 button area) but the popover overflows
    // outside; we hide the host overflow only when collapsed to avoid stealing
    // clicks from the page.
    host.style.width = "0";
    host.style.height = "0";
    const shadow = host.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = ANSWER_BANK_BUTTON_STYLES;
    shadow.appendChild(style);
    const mount = document.createElement("div");
    mount.dataset.slothingAbMount = "true";
    shadow.appendChild(mount);
    document.body.appendChild(host);
    const root = (0,client/* createRoot */.H)(mount);
    function reposition() {
        const rect = textarea.getBoundingClientRect();
        // Pin to the top-right INSIDE the textarea's bounding box. The button is
        // 16×16 + 4px padding; place it 6px from the top-right corner.
        const top = rect.top + window.scrollY + 6;
        const right = rect.left + window.scrollX + rect.width - 6 - 16; /* button width */
        host.style.top = `${top}px`;
        host.style.left = `${right}px`;
        // If the textarea has been removed or is no longer in the layout tree,
        // hide the host so we don't draw the button in an arbitrary location.
        if (rect.width === 0 && rect.height === 0) {
            host.style.display = "none";
        }
        else {
            host.style.display = "";
        }
    }
    reposition();
    // Re-render on text resize / page reflow without sprinkling raf calls.
    let resizeObserver = null;
    if (typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(reposition);
        resizeObserver.observe(textarea);
    }
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    function renderRoot() {
        root.render((0,jsx_runtime.jsx)(AnswerBankButton, { question: question, onMatch: handlers.onMatch, onPick: (match) => {
                // Insert into the textarea. Replaces existing value per spec.
                textarea.value = match.answer;
                textarea.dispatchEvent(new Event("input", { bubbles: true }));
                textarea.dispatchEvent(new Event("change", { bubbles: true }));
                handlers.onPick(match);
            }, onGenerate: (q) => handlers.onGenerate(q) }));
    }
    renderRoot();
    const decoration = {
        host,
        root,
        observer: resizeObserver,
        textarea,
    };
    mountedDecorations.add(decoration);
    // Cleanup hook on the textarea — best-effort. When the host textarea is
    // garbage-collected the WeakRef set is the source of truth.
    const detach = () => {
        unmountDecoration(decoration);
        window.removeEventListener("scroll", reposition, true);
        window.removeEventListener("resize", reposition);
    };
    textarea.__slothingAbDetach = detach;
    return decoration;
}
function unmountDecoration(decoration) {
    if (!mountedDecorations.has(decoration))
        return;
    mountedDecorations.delete(decoration);
    decoration.observer?.disconnect();
    try {
        decoration.root.unmount();
    }
    catch {
        // ignore
    }
    decoration.host.remove();
    const marked = decoration.textarea;
    marked[DECORATION_MARKER] = false;
    marked.__slothingAbDetach = undefined;
}
function unmountAllAnswerBankButtons() {
    for (const decoration of Array.from(mountedDecorations)) {
        unmountDecoration(decoration);
    }
}
// Visible-for-testing — let tests inspect / reset mounted state.
const __test = {
    mountedDecorations,
    DECORATION_MARKER,
};

;// ./src/content/multistep/session.ts
// Multi-step session state (P3 / #36 / #37).
//
// When the user confirms "Auto-fill this application" on a multi-step ATS
// flow (Workday, Greenhouse), we capture a snapshot of the profile + base
// resume + job URL and persist it under `chrome.storage.session` keyed by
// the current tabId. Each subsequent step transition — either via the
// webNavigation listener (preferred) or via the prompted fallback toast —
// looks up this snapshot to fill the next page without re-asking the user.
//
// The session naturally clears on:
// - explicit `clearSession` (submit click, "No" on the fallback toast)
// - tab close (chrome wipes session storage when the tab is gone — we also
//   clear on `pagehide` as a belt-and-suspenders for bfcache restores)
// - 30 minutes of inactivity (`confirmedAt` TTL)
//
// We deliberately use `chrome.storage.session` instead of in-memory state so
// the session survives content-script re-injection when Workday/Greenhouse
// blow away the DOM between steps. The TTL is enforced on read, not on write,
// because session storage doesn't expose TTLs natively.
/** TTL after which a captured session is considered stale and ignored. */
const MULTISTEP_SESSION_TTL_MS = 30 * 60 * 1000;
/** Storage key under chrome.storage.session. Keyed by tabId. */
const MULTISTEP_SESSION_KEY = "slothing_multistep_sessions";
/**
 * chrome.storage.session is MV3-only. In MV2 (Firefox) we fall back to
 * `chrome.storage.local` with the same TTL gating — the data is wiped on
 * `chrome.runtime.onInstalled` / first read after the TTL passes, so the
 * "session" semantics are preserved at the cost of one extra disk hit.
 */
function getSessionArea() {
    // The `session` API is only present in MV3. webextension-polyfill exposes
    // `local` in both manifest versions, so it's a safe last resort.
    const area = chrome.storage.session;
    return area ?? chrome.storage.local;
}
async function readMap() {
    return new Promise((resolve) => {
        getSessionArea().get(MULTISTEP_SESSION_KEY, (result) => {
            const raw = result?.[MULTISTEP_SESSION_KEY] ?? {};
            resolve(raw);
        });
    });
}
async function writeMap(map) {
    return new Promise((resolve) => {
        getSessionArea().set({ [MULTISTEP_SESSION_KEY]: map }, () => resolve());
    });
}
function isExpired(session, now = Date.now()) {
    const confirmed = Date.parse(session.confirmedAt);
    if (!Number.isFinite(confirmed))
        return true;
    return now - confirmed > MULTISTEP_SESSION_TTL_MS;
}
/**
 * Persist a new (or refreshed) session snapshot.
 *
 * Calling this again with the same tabId overwrites the existing snapshot —
 * intentionally — because the user has just re-confirmed.
 */
async function setSession(session) {
    const map = await readMap();
    map[String(session.tabId)] = session;
    await writeMap(map);
}
/**
 * Look up the live session for a tab, returning `null` if absent, expired,
 * or pointing at a different ATS provider than the caller expects.
 *
 * Expired entries are evicted opportunistically on read so we don't leak
 * stale snapshots into long-lived storage.
 */
async function getSession(tabId, provider) {
    const map = await readMap();
    const entry = map[String(tabId)];
    if (!entry)
        return null;
    if (isExpired(entry)) {
        delete map[String(tabId)];
        await writeMap(map);
        return null;
    }
    if (provider && entry.provider !== provider)
        return null;
    return entry;
}
/**
 * Drop the session for a tab. Called on submit click, on tab close, and when
 * the user says "No" to the prompted fallback toast.
 */
async function clearSession(tabId) {
    const map = await readMap();
    if (!(String(tabId) in map))
        return;
    delete map[String(tabId)];
    await writeMap(map);
}
/**
 * Sweep every expired entry. Called from the background on startup to keep
 * the session-area small if the browser crashed mid-flow.
 */
async function purgeExpiredSessions(now = Date.now()) {
    const map = await readMap();
    let changed = false;
    for (const [key, entry] of Object.entries(map)) {
        if (isExpired(entry, now)) {
            delete map[key];
            changed = true;
        }
    }
    if (changed)
        await writeMap(map);
}
/**
 * Read every live session — used by the background webNavigation listener
 * to decide whether the tab it just saw a history-update on is one we own.
 */
async function listSessions() {
    const map = await readMap();
    const now = Date.now();
    return Object.values(map).filter((entry) => !isExpired(entry, now));
}

;// ./src/content/multistep/prompt-fallback.ts
// Prompted fallback toast for multi-step flows when webNavigation is
// unavailable (Firefox users who declined the optional permission, or any
// future browser where the API is gated).
//
// On each detected step transition we show a non-blocking in-page toast:
//   "Looks like step 2 of 4 — fill this page too?"   [Yes] [No]
//
// - "Yes"  → resolve(true). The caller re-runs the autofill engine against
//   the new DOM with the persisted session profile.
// - "No"   → resolve(false). The caller clears the session for the rest of
//   the flow (no more prompts until the user re-triggers "Auto-fill this
//   application" from the sidebar).
// - 12s timeout → resolve(false). Treated as "No" so a user who tabs away
//   doesn't come back to a stranded prompt.
//
// The toast uses the same paper/ink/rust palette as the popup
// (apps/extension/src/popup/styles.css) so it doesn't look like a foreign
// browser dialog. We deliberately avoid the forbidden `bg-white` etc.
// Tailwind classes — this is plain DOM, but the *values* are mirrored from
// the popup tokens so the design system stays consistent.
const TOAST_CONTAINER_ID = "slothing-multistep-toast";
const TOAST_TIMEOUT_MS = 12000;
/**
 * Show the prompt and resolve with the user's choice. Safe to call from
 * either provider handler; only one toast is visible at a time (an in-flight
 * prompt is auto-resolved as `false` before a new one mounts).
 */
function promptStepFallback(options = {}) {
    // If there's already a toast on screen, dismiss it as a "No" so the new
    // prompt can take over. Without this two rapid step transitions could
    // stack toasts on top of each other.
    const existing = document.getElementById(TOAST_CONTAINER_ID);
    if (existing) {
        existing.dispatchEvent(new CustomEvent("slothing-dismiss"));
        existing.remove();
    }
    return new Promise((resolve) => {
        const toast = document.createElement("div");
        toast.id = TOAST_CONTAINER_ID;
        toast.setAttribute("role", "dialog");
        toast.setAttribute("aria-live", "polite");
        toast.setAttribute("aria-label", "Continue auto-fill on this step?");
        // Inline-style the toast so we don't have to mount yet another CSS file
        // and risk page-CSS overriding us. All colors mirror the popup tokens.
        Object.assign(toast.style, {
            position: "fixed",
            bottom: "20px",
            right: "20px",
            maxWidth: "320px",
            padding: "14px 16px",
            background: "#fffaef",
            color: "#1a1530",
            border: "1px solid rgba(26, 20, 16, 0.12)",
            borderRadius: "10px",
            boxShadow: "0 10px 24px rgba(26, 21, 48, 0.14)",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif",
            fontSize: "14px",
            lineHeight: "1.45",
            zIndex: "2147483647",
        });
        const title = document.createElement("div");
        title.style.fontWeight = "600";
        title.style.marginBottom = "4px";
        const stepText = options.stepNumber && options.totalSteps
            ? `Looks like step ${options.stepNumber} of ${options.totalSteps}`
            : options.stepNumber
                ? `Looks like step ${options.stepNumber}`
                : "Looks like a new step";
        title.textContent = `${stepText} — fill this page too?`;
        toast.appendChild(title);
        if (options.providerLabel) {
            const sub = document.createElement("div");
            sub.style.fontSize = "12px";
            sub.style.color = "#6a5e4a";
            sub.style.marginBottom = "10px";
            sub.textContent = `${options.providerLabel} multi-step application`;
            toast.appendChild(sub);
        }
        const actions = document.createElement("div");
        actions.style.display = "flex";
        actions.style.gap = "8px";
        actions.style.justifyContent = "flex-end";
        const noBtn = document.createElement("button");
        noBtn.type = "button";
        noBtn.textContent = "No";
        Object.assign(noBtn.style, {
            padding: "6px 12px",
            background: "transparent",
            color: "#6a5e4a",
            border: "1px solid rgba(26, 20, 16, 0.12)",
            borderRadius: "6px",
            cursor: "pointer",
            font: "inherit",
        });
        const yesBtn = document.createElement("button");
        yesBtn.type = "button";
        yesBtn.textContent = "Yes, fill";
        Object.assign(yesBtn.style, {
            padding: "6px 12px",
            background: "#1a1530",
            color: "#fffaef",
            border: "1px solid #1a1530",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600",
            font: "inherit",
        });
        actions.appendChild(noBtn);
        actions.appendChild(yesBtn);
        toast.appendChild(actions);
        let settled = false;
        const settle = (value) => {
            if (settled)
                return;
            settled = true;
            window.clearTimeout(timeoutId);
            toast.remove();
            resolve(value);
        };
        yesBtn.addEventListener("click", () => settle(true));
        noBtn.addEventListener("click", () => settle(false));
        toast.addEventListener("slothing-dismiss", () => settle(false));
        const timeoutId = window.setTimeout(() => settle(false), TOAST_TIMEOUT_MS);
        document.body.appendChild(toast);
        // Focus the primary action so keyboard users don't get lost.
        yesBtn.focus();
    });
}
/**
 * Forcibly remove any in-flight prompt. Used on `pagehide` so we don't leak
 * a toast into a bfcache restore.
 */
function dismissStepFallback() {
    const existing = document.getElementById(TOAST_CONTAINER_ID);
    if (!existing)
        return;
    existing.dispatchEvent(new CustomEvent("slothing-dismiss"));
    existing.remove();
}

;// ./src/content/multistep/workday.ts
// Workday multi-step applicant flow handler (P3 / #36).
//
// Workday applications are wizard-shaped — the URL changes by hash + history
// state as the user clicks "Next". We:
//
// 1. Detect that we're on a `myworkdayjobs.com/.../job/.../apply` flow (or
//    the post-click `applyManually` route).
// 2. Wait for the user to click the explicit "Auto-fill this application"
//    button in the sidebar. No automatic capture — multi-step fills only
//    start on explicit intent (per #36 acceptance).
// 3. Persist the session in `chrome.storage.session` keyed by tabId.
// 4. On every step transition (broadcast from the background's
//    webNavigation listener, or surfaced via the prompted-fallback toast
//    when webNavigation is unavailable), re-run the field detector against
//    the new DOM and fill with the persisted profile.
// 5. Stop on submit click (we watch for `[data-automation-id]` submit
//    selectors), tab close (chrome wipes session storage), or 30-min
//    inactivity (handled by the session TTL).





/** URL substring that identifies a Workday host. */
const WORKDAY_HOST_RE = /\.myworkdayjobs\.com$/i;
/**
 * URL match for the apply flow itself. Workday URLs typically look like:
 *   https://acme.wd5.myworkdayjobs.com/en-US/Acme/job/Remote/Software-Engineer_R-1234/apply
 *   …/applyManually
 *   …/apply/applyManually
 */
const WORKDAY_APPLY_PATH_RE = /\/job\/[^/]+\/[^/]+\/(apply|applyManually|apply\/applyManually)(\/|$)/i;
/**
 * Selectors used to find Workday submit buttons. `[data-automation-id]` is
 * Workday's stable hook even across UI refreshes — we match on the prefix
 * and check the text to filter out "Next" / "Save and continue" etc.
 */
const WORKDAY_SUBMIT_SELECTORS = [
    'button[data-automation-id="bottom-navigation-next-button"]',
    'button[data-automation-id*="submit"]',
    'button[data-automation-id*="Submit"]',
];
/** Submit-button labels we treat as final (vs. "Next" / "Save and continue"). */
const WORKDAY_SUBMIT_LABELS_RE = /(submit application|submit|review and submit)/i;
/** True when the given URL is a Workday applicant page. */
function isWorkdayApplyUrl(url) {
    try {
        const parsed = new URL(url);
        if (!WORKDAY_HOST_RE.test(parsed.host))
            return false;
        return WORKDAY_APPLY_PATH_RE.test(parsed.pathname);
    }
    catch {
        return false;
    }
}
/**
 * Public surface used by the content-script entry point. Construct one of
 * these per tab and forward the lifecycle hooks (step transition,
 * pagehide).
 */
class WorkdayMultistepHandler {
    constructor(deps) {
        this.detector = new FieldDetector();
        this.submitListenerAttached = false;
        this.fallbackDeclined = false;
        this.deps = deps;
    }
    /** True when the current URL is one we should be watching. */
    isActive() {
        return isWorkdayApplyUrl(window.location.href);
    }
    /**
     * Called when the user clicks the explicit "Auto-fill this application"
     * sidebar action. Captures the snapshot, runs the first fill, and arms
     * the submit-button watcher so a final submit clears state.
     */
    async confirm(options = {}) {
        if (!this.isActive())
            return null;
        const [tabId, profile] = await Promise.all([
            this.deps.getTabId(),
            this.deps.getProfile(),
        ]);
        if (!tabId || !profile) {
            console.warn("[Slothing] Workday confirm: missing tabId or profile");
            return null;
        }
        const session = {
            tabId,
            provider: "workday",
            jobUrl: window.location.href,
            profile,
            baseResumeId: options.baseResumeId,
            confirmedAt: new Date().toISOString(),
        };
        await setSession(session);
        this.fallbackDeclined = false;
        this.attachSubmitWatcher(tabId);
        return this.runFill(session);
    }
    /**
     * Fired by the background when `webNavigation.onHistoryStateUpdated`
     * sees a navigation on this tab. We re-run the fill against the new DOM.
     * If webNavigation isn't available the prompted-fallback path covers this.
     */
    async onStepTransition() {
        if (!this.isActive())
            return null;
        const tabId = await this.deps.getTabId();
        if (!tabId)
            return null;
        const session = await getSession(tabId, "workday");
        if (!session)
            return null;
        // Workday re-renders the whole step DOM; wait a tick so the new form
        // fields are present before the detector runs.
        await waitForWorkdayStepReady();
        return this.runFill(session);
    }
    /**
     * No-webNavigation fallback path. Called from a MutationObserver / URL
     * watcher in the content script when we notice the page changed but
     * never got a webNavigation event. Asks the user "fill this page too?".
     */
    async onStepTransitionViaFallback(stepHint) {
        if (!this.isActive())
            return null;
        if (this.fallbackDeclined)
            return null;
        const tabId = await this.deps.getTabId();
        if (!tabId)
            return null;
        const session = await getSession(tabId, "workday");
        if (!session)
            return null;
        const accepted = await promptStepFallback({
            providerLabel: "Workday",
            stepNumber: stepHint?.stepNumber,
            totalSteps: stepHint?.totalSteps,
        });
        if (!accepted) {
            this.fallbackDeclined = true;
            await clearSession(tabId);
            return null;
        }
        await waitForWorkdayStepReady();
        return this.runFill(session);
    }
    /**
     * Detects the page-progress hint Workday surfaces as
     * `[data-automation-id="progressBarItem"]` so the fallback toast can say
     * "step 2 of 4" instead of "a new step".
     */
    detectStepHint() {
        const items = document.querySelectorAll('[data-automation-id="progressBarItem"], [data-automation-id="progressBarActiveItem"]');
        if (items.length === 0)
            return {};
        const active = Array.from(items).findIndex((node) => /active|current/i.test(node.getAttribute("data-automation-id") ?? ""));
        return {
            stepNumber: active >= 0 ? active + 1 : undefined,
            totalSteps: items.length,
        };
    }
    /** Detach watchers — called from `pagehide`. */
    destroy() {
        // Submit listener is on document so it lives with the page; explicit
        // detach happens via the controller wrapper in index.ts.
    }
    async runFill(session) {
        const fields = this.collectFields();
        if (fields.length === 0)
            return null;
        const mapper = new FieldMapper(session.profile);
        const engine = new AutoFillEngine(this.detector, mapper);
        return engine.fillForm(fields);
    }
    /**
     * Workday doesn't always wrap fields in `<form>` — some steps render the
     * inputs as bare divs inside the application shell. We scope to the
     * Workday application container if present, else fall back to the whole
     * document, then call into `FieldDetector.detectFieldType` per input.
     */
    collectFields() {
        const scope = document.querySelector('[data-automation-id="applyFlowContainer"]') ??
            document.querySelector('[data-automation-id*="application"]') ??
            document.body;
        if (!scope)
            return [];
        const inputs = scope.querySelectorAll("input, textarea, select");
        const results = [];
        for (const el of inputs) {
            if (shouldSkipForWorkday(el))
                continue;
            const detected = this.detector.detectFieldType(el);
            if (detected.fieldType !== "unknown" || detected.confidence > 0.1) {
                results.push(detected);
            }
        }
        return results;
    }
    /**
     * Watch for a click on a Workday submit button. The watcher lives on the
     * document so it survives Workday's step-level DOM re-renders.
     */
    attachSubmitWatcher(tabId) {
        if (this.submitListenerAttached)
            return;
        this.submitListenerAttached = true;
        document.addEventListener("click", (event) => {
            const target = event.target;
            if (!target)
                return;
            const button = target.closest("button");
            if (!button)
                return;
            if (!matchesWorkdaySubmitButton(button))
                return;
            // Don't preventDefault — we don't want to block submission. Just
            // clear the session so the next page (confirmation / "thanks for
            // applying") doesn't try to autofill anything.
            void clearSession(tabId);
        }, true);
    }
}
function shouldSkipForWorkday(el) {
    const input = el;
    if (input.disabled)
        return true;
    if (input.readOnly)
        return true;
    if (input.type === "hidden" ||
        input.type === "submit" ||
        input.type === "button" ||
        input.type === "reset" ||
        input.type === "image" ||
        input.type === "file") {
        return true;
    }
    return false;
}
function matchesWorkdaySubmitButton(button) {
    if (WORKDAY_SUBMIT_SELECTORS.some((sel) => {
        try {
            return button.matches(sel);
        }
        catch {
            return false;
        }
    })) {
        const text = (button.textContent ?? "").trim();
        return WORKDAY_SUBMIT_LABELS_RE.test(text);
    }
    return false;
}
/**
 * Workday animates between steps; the next-step DOM mounts a frame or two
 * later. Resolve when at least one Workday-marked input is present or 500ms
 * has elapsed, whichever comes first.
 */
async function waitForWorkdayStepReady(timeoutMs = 500) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        if (document.querySelector('[data-automation-id="textInputBox"], [data-automation-id="formField"], [data-automation-id*="input"]')) {
            return;
        }
        await new Promise((r) => setTimeout(r, 50));
    }
}

;// ./src/content/multistep/greenhouse.ts
// Greenhouse multi-step applicant flow handler (P3 / #37).
//
// Two flavours of Greenhouse application surface:
//
//   1. `boards.greenhouse.io/<company>/jobs/<id>` — a single-page form
//      embedded in the careers site. Step transitions are rare here but
//      some larger employers split the application into multiple sections
//      that use `#fragment` / `pushState` navigation.
//
//   2. `app.greenhouse.io/jobs/<id>/applications/new` — the canonical app
//      flow. Some employers embed this in an `<iframe>` on their own
//      careers domain. When iframed, URL-based listeners don't fire on the
//      outer page; we need a MutationObserver on the iframe's document
//      instead.
//
// The detection logic in this file mirrors workday.ts but uses Greenhouse-
// specific selectors and an iframe-aware "step transition" trigger.





const GREENHOUSE_HOST_RE = /(boards|app)\.greenhouse\.io$/i;
const GREENHOUSE_APP_FORM_RE = /\/(jobs|applications)\b/i;
/**
 * Submit selectors. Greenhouse uses `#submit_app` on boards.greenhouse.io
 * and `[data-test*="submit"]` on the embedded app domain. We also look at
 * button text to filter false positives ("Save draft" etc.).
 */
const GREENHOUSE_SUBMIT_SELECTORS = [
    "#submit_app",
    'button[type="submit"]',
    'button[data-test*="submit"]',
    'input[type="submit"]#submit_app',
];
const GREENHOUSE_SUBMIT_LABELS_RE = /(submit application|submit|review and submit)/i;
/** True when the URL belongs to a Greenhouse applicant flow. */
function isGreenhouseApplyUrl(url) {
    try {
        const parsed = new URL(url);
        if (!GREENHOUSE_HOST_RE.test(parsed.host))
            return false;
        return GREENHOUSE_APP_FORM_RE.test(parsed.pathname);
    }
    catch {
        return false;
    }
}
/**
 * Returns the document we should inspect for fields. When the current page
 * iframes the `app.greenhouse.io` flow, the form lives in the iframe — we
 * try to reach into its `contentDocument` (works for same-origin / friendly
 * iframes; cross-origin frames are inaccessible and we fall back to the
 * outer document, which is harmless because the detector finds zero fields
 * there and the caller no-ops).
 */
function getGreenhouseScopeDocument(root = document) {
    // Direct page: the current document already is the Greenhouse form.
    if (GREENHOUSE_HOST_RE.test(root.location.host))
        return root;
    // Iframed app: find an iframe pointing at greenhouse.io and try to read it.
    const frames = root.querySelectorAll("iframe");
    for (const frame of frames) {
        const src = frame.getAttribute("src") ?? "";
        if (!/greenhouse\.io/i.test(src))
            continue;
        try {
            const doc = frame.contentDocument;
            if (doc)
                return doc;
        }
        catch {
            // Cross-origin frame — can't read it. Move on; the outer page will
            // still match URL-host detection if the user is on greenhouse.io
            // directly, and we no-op otherwise.
            continue;
        }
    }
    return root;
}
class GreenhouseMultistepHandler {
    constructor(deps) {
        this.detector = new FieldDetector();
        this.submitListenerAttached = false;
        this.fallbackDeclined = false;
        this.iframeObserver = null;
        this.deps = deps;
    }
    isActive() {
        if (isGreenhouseApplyUrl(window.location.href))
            return true;
        // Iframed flow: outer URL might be the employer's careers site. Check
        // for a Greenhouse-app iframe on the page.
        return !!document.querySelector('iframe[src*="greenhouse.io"]');
    }
    async confirm(options = {}) {
        if (!this.isActive())
            return null;
        const [tabId, profile] = await Promise.all([
            this.deps.getTabId(),
            this.deps.getProfile(),
        ]);
        if (!tabId || !profile) {
            console.warn("[Slothing] Greenhouse confirm: missing tabId or profile");
            return null;
        }
        const session = {
            tabId,
            provider: "greenhouse",
            jobUrl: window.location.href,
            profile,
            baseResumeId: options.baseResumeId,
            confirmedAt: new Date().toISOString(),
        };
        await setSession(session);
        this.fallbackDeclined = false;
        this.attachSubmitWatcher(tabId);
        this.attachIframeObserver();
        return this.runFill(session);
    }
    async onStepTransition() {
        if (!this.isActive())
            return null;
        const tabId = await this.deps.getTabId();
        if (!tabId)
            return null;
        const session = await getSession(tabId, "greenhouse");
        if (!session)
            return null;
        await waitForGreenhouseStepReady();
        return this.runFill(session);
    }
    async onStepTransitionViaFallback(stepHint) {
        if (!this.isActive())
            return null;
        if (this.fallbackDeclined)
            return null;
        const tabId = await this.deps.getTabId();
        if (!tabId)
            return null;
        const session = await getSession(tabId, "greenhouse");
        if (!session)
            return null;
        const accepted = await promptStepFallback({
            providerLabel: "Greenhouse",
            stepNumber: stepHint?.stepNumber,
            totalSteps: stepHint?.totalSteps,
        });
        if (!accepted) {
            this.fallbackDeclined = true;
            await clearSession(tabId);
            return null;
        }
        await waitForGreenhouseStepReady();
        return this.runFill(session);
    }
    /**
     * Greenhouse doesn't expose a numbered progress bar consistently. We
     * inspect `[data-test*="step"]` and `[role="tab"]` for an "active" hint
     * but if nothing matches we just omit the step text from the toast.
     */
    detectStepHint() {
        const doc = getGreenhouseScopeDocument();
        const candidates = doc.querySelectorAll('[role="tab"], [data-test*="step"]');
        if (candidates.length === 0)
            return {};
        const activeIdx = Array.from(candidates).findIndex((node) => node.getAttribute("aria-selected") === "true" ||
            /active|current/i.test(node.className));
        return {
            stepNumber: activeIdx >= 0 ? activeIdx + 1 : undefined,
            totalSteps: candidates.length,
        };
    }
    destroy() {
        this.iframeObserver?.disconnect();
        this.iframeObserver = null;
    }
    async runFill(session) {
        const fields = this.collectFields();
        if (fields.length === 0)
            return null;
        const mapper = new FieldMapper(session.profile);
        const engine = new AutoFillEngine(this.detector, mapper);
        return engine.fillForm(fields);
    }
    collectFields() {
        const doc = getGreenhouseScopeDocument();
        const scope = doc.querySelector("#application") ??
            doc.querySelector("#main_fields") ??
            doc.querySelector("form#application_form") ??
            doc.body ??
            doc.documentElement;
        if (!scope)
            return [];
        const inputs = scope.querySelectorAll("input, textarea, select");
        const results = [];
        for (const el of inputs) {
            if (shouldSkipForGreenhouse(el))
                continue;
            const detected = this.detector.detectFieldType(el);
            if (detected.fieldType !== "unknown" || detected.confidence > 0.1) {
                results.push(detected);
            }
        }
        return results;
    }
    attachSubmitWatcher(tabId) {
        if (this.submitListenerAttached)
            return;
        this.submitListenerAttached = true;
        const handler = (event) => {
            const target = event.target;
            if (!target)
                return;
            const button = target.closest('button, input[type="submit"]');
            if (!button)
                return;
            if (!matchesGreenhouseSubmitButton(button))
                return;
            void clearSession(tabId);
        };
        document.addEventListener("click", handler, true);
        // Also listen inside the iframe (same-origin case). Cross-origin
        // frames will throw; the catch keeps us robust.
        const iframe = document.querySelector('iframe[src*="greenhouse.io"]');
        try {
            iframe?.contentDocument?.addEventListener("click", handler, true);
        }
        catch {
            // ignore — cross-origin frame
        }
    }
    /**
     * When the page is the outer careers site with an iframed Greenhouse app,
     * URL changes on the outer page don't tell us about the iframe's
     * navigation. Watch the iframe's body for DOM mutations as a step-
     * transition proxy. We debounce so a single step transition doesn't fire
     * a hundred prompts.
     */
    attachIframeObserver() {
        if (this.iframeObserver)
            return;
        const iframe = document.querySelector('iframe[src*="greenhouse.io"]');
        if (!iframe)
            return;
        let frameDoc;
        try {
            frameDoc = iframe.contentDocument;
        }
        catch {
            return;
        }
        if (!frameDoc)
            return;
        let lastTrigger = 0;
        this.iframeObserver = new MutationObserver(() => {
            const now = Date.now();
            if (now - lastTrigger < 750)
                return;
            lastTrigger = now;
            // Re-trigger the step pipeline. The controller dispatches between
            // the webNav and fallback paths.
            void this.onStepTransition();
        });
        try {
            this.iframeObserver.observe(frameDoc.body ?? frameDoc.documentElement, {
                childList: true,
                subtree: true,
            });
        }
        catch {
            this.iframeObserver = null;
        }
    }
}
function shouldSkipForGreenhouse(el) {
    const input = el;
    if (input.disabled)
        return true;
    if (input.type === "hidden" ||
        input.type === "submit" ||
        input.type === "button") {
        return true;
    }
    return false;
}
function matchesGreenhouseSubmitButton(button) {
    const matches = GREENHOUSE_SUBMIT_SELECTORS.some((sel) => {
        try {
            return button.matches(sel);
        }
        catch {
            return false;
        }
    });
    if (!matches)
        return false;
    const text = (button.textContent ?? "").trim() ||
        button.value ||
        "";
    return GREENHOUSE_SUBMIT_LABELS_RE.test(text);
}
async function waitForGreenhouseStepReady(timeoutMs = 500) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        const doc = getGreenhouseScopeDocument();
        if (doc.querySelector("#application") ||
            doc.querySelector("#main_fields") ||
            doc.querySelector("form#application_form")) {
            return;
        }
        await new Promise((r) => setTimeout(r, 50));
    }
}

;// ./src/content/multistep/controller.ts
// Controller that wires the Workday + Greenhouse multi-step handlers into
// the content-script entry point.
//
// Responsibilities:
//   - Decide which (if any) provider handler is active for the current URL.
//   - Forward step-transition events from the background (webNavigation) to
//     the active handler.
//   - When webNavigation is unavailable, fall back to MutationObserver +
//     URL change detection and surface the prompted toast.
//
// The controller is created once per content-script load. It's intentionally
// thin — almost all logic lives in the per-provider handlers — so the
// wiring in `content/index.ts` stays compact.




class MultistepController {
    constructor(deps) {
        this.active = null;
        this.lastUrl = window.location.href;
        this.fallbackUrlInterval = null;
        this.cachedTabId = null;
        this.cachedHasWebNav = null;
        this.deps = deps;
    }
    /**
     * Initialise the controller for the current page. Returns the provider
     * that's active (or `null` if neither Workday nor Greenhouse matches).
     * Safe to call multiple times — the second call no-ops if the provider
     * hasn't changed.
     */
    init() {
        const provider = this.detectProvider();
        if (!provider) {
            this.active = null;
            return null;
        }
        if (this.active?.provider === provider)
            return provider;
        const sharedDeps = {
            getTabId: () => this.getTabId(),
            getProfile: () => this.deps.getProfile(),
            hasWebNavigationPermission: () => this.hasWebNavigationPermission(),
        };
        if (provider === "workday") {
            this.active = {
                provider,
                workday: new WorkdayMultistepHandler(sharedDeps),
            };
        }
        else {
            this.active = {
                provider,
                greenhouse: new GreenhouseMultistepHandler(sharedDeps),
            };
        }
        this.startFallbackUrlWatcher();
        return provider;
    }
    /**
     * The user clicked "Auto-fill this application" in the sidebar. This
     * captures the session, fills page 1, and arms the step pipeline.
     * If webNavigation isn't already granted (Firefox first-run), we ask for
     * it here — explicitly at the moment of intent, per the permission
     * strategy confirmed 2026-05-12.
     */
    async confirm(options = {}) {
        const provider = this.init();
        if (!provider)
            return false;
        // Try to obtain webNavigation now so future step transitions can take
        // the silent path. If the user declines (Firefox) the fallback toast
        // takes over — we still proceed with the first-page fill.
        void this.requestWebNavigationPermission();
        if (provider === "workday" && this.active?.workday) {
            const result = await this.active.workday.confirm(options);
            return !!result;
        }
        if (provider === "greenhouse" && this.active?.greenhouse) {
            const result = await this.active.greenhouse.confirm(options);
            return !!result;
        }
        return false;
    }
    /**
     * Handle a step-transition message from the background's webNavigation
     * listener. Dispatched in `content/index.ts`.
     */
    async onWebNavigationTransition() {
        if (!this.active)
            return;
        this.lastUrl = window.location.href;
        if (this.active.workday) {
            await this.active.workday.onStepTransition();
        }
        else if (this.active.greenhouse) {
            await this.active.greenhouse.onStepTransition();
        }
    }
    /**
     * Tear down per-provider watchers. Called from `pagehide`.
     */
    destroy() {
        if (this.fallbackUrlInterval) {
            clearInterval(this.fallbackUrlInterval);
            this.fallbackUrlInterval = null;
        }
        this.active?.workday?.destroy();
        this.active?.greenhouse?.destroy();
        dismissStepFallback();
    }
    detectProvider() {
        const url = window.location.href;
        if (isWorkdayApplyUrl(url))
            return "workday";
        if (isGreenhouseApplyUrl(url))
            return "greenhouse";
        // Iframed Greenhouse on a third-party careers site.
        if (document.querySelector('iframe[src*="greenhouse.io"]')) {
            return "greenhouse";
        }
        return null;
    }
    /**
     * When webNavigation isn't granted, watch for URL changes (history.pushState
     * / hashchange / popstate) and trigger the prompted-fallback path. The
     * iframe-Greenhouse case is covered by a MutationObserver inside its handler.
     */
    startFallbackUrlWatcher() {
        if (this.fallbackUrlInterval)
            return;
        const tick = async () => {
            if (!this.active)
                return;
            // If webNavigation IS granted, the background already fires us
            // explicit transition events — skip the fallback to avoid double-
            // prompting.
            if (await this.hasWebNavigationPermission())
                return;
            if (window.location.href === this.lastUrl)
                return;
            this.lastUrl = window.location.href;
            if (this.active.workday) {
                const hint = this.active.workday.detectStepHint();
                await this.active.workday.onStepTransitionViaFallback(hint);
            }
            else if (this.active.greenhouse) {
                const hint = this.active.greenhouse.detectStepHint();
                await this.active.greenhouse.onStepTransitionViaFallback(hint);
            }
        };
        // 500ms is a sensible balance — webNav-listener latency on real
        // browsers is ~100-300ms, and we don't want to thrash on every
        // hashchange.
        this.fallbackUrlInterval = setInterval(() => {
            void tick();
        }, 500);
        window.addEventListener("popstate", () => void tick());
        window.addEventListener("hashchange", () => void tick());
    }
    async getTabId() {
        if (this.cachedTabId !== null)
            return this.cachedTabId;
        const response = await (0,messages/* sendMessage */._z)(messages/* Messages */.B2.getTabId());
        if (response.success && response.data?.tabId != null) {
            this.cachedTabId = response.data.tabId;
            return this.cachedTabId;
        }
        return null;
    }
    async hasWebNavigationPermission() {
        if (this.cachedHasWebNav !== null)
            return this.cachedHasWebNav;
        try {
            const response = await (0,messages/* sendMessage */._z)(messages/* Messages */.B2.hasWebNavigationPermission());
            this.cachedHasWebNav = !!(response.success && response.data?.granted);
        }
        catch {
            this.cachedHasWebNav = false;
        }
        return this.cachedHasWebNav;
    }
    async requestWebNavigationPermission() {
        try {
            const response = await (0,messages/* sendMessage */._z)(messages/* Messages */.B2.requestWebNavigationPermission());
            const granted = !!(response.success && response.data?.granted);
            this.cachedHasWebNav = granted;
            return granted;
        }
        catch {
            this.cachedHasWebNav = false;
            return false;
        }
    }
}

;// ./src/content/index.ts
// Content script entry point for Slothing extension
// Import styles for content script



















// Initialize components
const fieldDetector = new FieldDetector();
let autoFillEngine = null;
let cachedProfile = null;
let detectedFields = [];
const detectedFieldsByForm = new WeakMap();
const autofilledForms = new WeakSet();
let scrapedJob = null;
let jobDetectedForUrl = null;
let profileLoadPromise = null;
const sidebarController = new JobPageSidebarController();
const correctionsTracker = new CorrectionsTracker();
// P3 / #36 #37 — wires Workday + Greenhouse multi-step handlers. The
// controller itself decides per-URL whether it should attach.
const multistepController = new MultistepController({
    getProfile: () => loadProfileForSidebar(),
});
multistepController.init();
const submitWatcher = new SubmitWatcher({
    getDetectedFields: (form) => detectedFieldsByForm.get(form) || [],
    getScrapedJob: () => scrapedJob,
    getSettings: getExtensionSettings,
    wasAutofilled: (form) => autofilledForms.has(form),
    onTracked: async (payload) => {
        const response = await (0,messages/* sendMessage */._z)(messages/* Messages */.B2.trackApplied(payload));
        if (!response.success) {
            console.error("[Slothing] Failed to track application:", response.error);
            return;
        }
        showAppliedToast(extractCompanyHint(scrapedJob, payload.host), () => {
            (0,messages/* sendMessage */._z)(messages/* Messages */.B2.openDashboard()).catch((err) => console.error("[Slothing] Failed to open dashboard:", err));
        });
    },
});
// Scan page on load
scanPage();
submitWatcher.attach();
// Re-scan on dynamic content changes
const observer = new MutationObserver(debounce(scanPage, 500));
observer.observe(document.body, { childList: true, subtree: true });
async function scanPage() {
    // Detect forms
    const forms = document.querySelectorAll("form");
    for (const form of forms) {
        const fields = fieldDetector.detectFields(form);
        if (fields.length > 0) {
            detectedFieldsByForm.set(form, fields);
            detectedFields = fields;
            console.log("[Slothing] Detected fields:", fields.length);
        }
    }
    // P2/#35 — decorate long essay textareas with the inline answer-bank
    // popover. This runs in addition to the field detector above because the
    // textareas we care about often aren't owned by a recognised form (some
    // ATS portals use bare <textarea> with dynamic labels).
    scanForAnswerBankTextareas();
    await refreshScrapedJob();
    void updateSidebar();
}
async function refreshScrapedJob() {
    if (isSlothingWebAppPage()) {
        scrapedJob = null;
        return null;
    }
    const scraper = getScraperForUrl(window.location.href);
    if (!scraper.canHandle(window.location.href))
        return null;
    let nextScrapedJob = null;
    try {
        nextScrapedJob = await scraper.scrapeJobListing();
        scrapedJob = nextScrapedJob;
        if (nextScrapedJob) {
            console.log("[Slothing] Scraped job:", nextScrapedJob.title);
            const detectionKey = nextScrapedJob.sourceJobId || nextScrapedJob.url;
            if (jobDetectedForUrl !== detectionKey) {
                jobDetectedForUrl = detectionKey;
                (0,messages/* sendMessage */._z)(messages/* Messages */.B2.jobDetected({
                    title: nextScrapedJob.title,
                    company: nextScrapedJob.company,
                    url: nextScrapedJob.url,
                })).catch((err) => console.error("[Slothing] Failed to notify job detected:", err));
                // P3/#38 — passive LinkedIn capture. Only runs on detail pages the
                // user navigated to themselves; the scraper already enforces this
                // because `sourceJobId` is only populated when the URL matches the
                // `/jobs/view/:id` pattern. Failures here are fire-and-forget so a
                // capture hiccup never blocks the visible scrape/sidebar UX.
                if (nextScrapedJob.source === "linkedin") {
                    void tryCaptureLinkedInJob(nextScrapedJob, {
                        sendMessage: messages/* sendMessage */._z,
                        buildImportMessage: messages/* Messages */.B2.importJob,
                    }).catch((err) => console.warn("[Slothing] LinkedIn passive capture failed:", err));
                }
            }
        }
    }
    catch (err) {
        console.error("[Slothing] Scrape error:", err);
    }
    if (!nextScrapedJob && scrapedJob?.url !== window.location.href) {
        scrapedJob = null;
    }
    return scrapedJob;
}
function isSlothingWebAppPage() {
    const host = window.location.hostname;
    if (host === "slothing.work" || host.endsWith(".slothing.work")) {
        return true;
    }
    if (host !== "localhost" && host !== "127.0.0.1")
        return false;
    return /\/(?:[a-z]{2}(?:-[A-Z]{2})?\/)?extension\/connect(?:\/|$)/.test(window.location.pathname);
}
// Handle messages from popup and background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    handleMessage(message)
        .then(sendResponse)
        .catch((err) => sendResponse({ success: false, error: err.message }));
    return true; // Async response
});
async function handleMessage(message) {
    switch (message.type) {
        case "GET_PAGE_STATUS":
            if (!scrapedJob) {
                await refreshScrapedJob();
                void updateSidebar();
            }
            return {
                hasForm: detectedFields.length > 0,
                hasJobListing: scrapedJob !== null,
                detectedFields: detectedFields.length,
                scrapedJob,
            };
        case "GET_SURFACE_CONTEXT":
            return getSurfaceContext();
        case "SHOW_SLOTHING_PANEL":
            await refreshScrapedJob();
            await sidebarController.restoreDomain();
            await updateSidebar();
            return { success: scrapedJob !== null, scrapedJob };
        case "TRIGGER_FILL":
            return handleFillForm();
        case "TRIGGER_IMPORT":
            if (scrapedJob) {
                return (0,messages/* sendMessage */._z)(messages/* Messages */.B2.importJob(scrapedJob));
            }
            return { success: false, error: "No job detected" };
        case "SCRAPE_JOB":
            const scraper = getScraperForUrl(window.location.href);
            if (scraper.canHandle(window.location.href)) {
                scrapedJob = await scraper.scrapeJobListing();
                return { success: true, data: scrapedJob };
            }
            return { success: false, error: "No scraper available for this site" };
        case "SCRAPE_JOB_LIST":
            const listScraper = getScraperForUrl(window.location.href);
            if (listScraper.canHandle(window.location.href)) {
                const jobs = await listScraper.scrapeJobList();
                return { success: true, data: jobs };
            }
            return { success: false, error: "No scraper available for this site" };
        case "WW_GET_PAGE_STATE":
            return getWwPageState();
        case "WW_SCRAPE_ALL_VISIBLE":
            return runWwBulkScrape({ paginated: false });
        case "WW_SCRAPE_ALL_PAGINATED":
            return runWwBulkScrape({
                paginated: true,
                ...message.payload,
            });
        // P3/#39 — Generic bulk-scrape orchestrators for public ATS hosts.
        case "BULK_GREENHOUSE_GET_PAGE_STATE":
            return getBulkSourcePageState("greenhouse");
        case "BULK_GREENHOUSE_SCRAPE_VISIBLE":
            return runBulkSourceScrape("greenhouse", { paginated: false });
        case "BULK_GREENHOUSE_SCRAPE_PAGINATED":
            return runBulkSourceScrape("greenhouse", {
                paginated: true,
                ...message.payload,
            });
        case "BULK_LEVER_GET_PAGE_STATE":
            return getBulkSourcePageState("lever");
        case "BULK_LEVER_SCRAPE_VISIBLE":
            return runBulkSourceScrape("lever", { paginated: false });
        case "BULK_LEVER_SCRAPE_PAGINATED":
            return runBulkSourceScrape("lever", {
                paginated: true,
                ...message.payload,
            });
        case "BULK_WORKDAY_GET_PAGE_STATE":
            return getBulkSourcePageState("workday");
        case "BULK_WORKDAY_SCRAPE_VISIBLE":
            return runBulkSourceScrape("workday", { paginated: false });
        case "BULK_WORKDAY_SCRAPE_PAGINATED":
            return runBulkSourceScrape("workday", {
                paginated: true,
                ...message.payload,
            });
        case "MULTISTEP_STEP_TRANSITION":
            // P3 / #36 #37 — background's webNavigation listener saw a step
            // transition for this tab. The controller dispatches to the active
            // provider handler (Workday / Greenhouse), which re-fills the new DOM.
            await multistepController.onWebNavigationTransition();
            return { success: true };
        default:
            return { success: false, error: `Unknown message type: ${message.type}` };
    }
}
async function getSurfaceContext() {
    if (!scrapedJob) {
        await refreshScrapedJob();
        void updateSidebar();
    }
    const sidebar = sidebarController.getStatus();
    return {
        tab: {
            url: window.location.href,
            host: window.location.hostname,
            supported: true,
            contentScriptReady: true,
        },
        page: {
            hasApplicationForm: detectedFields.length > 0,
            detectedFieldCount: detectedFields.length,
            job: scrapedJob,
        },
        workspace: sidebar,
    };
}
function isWaterlooWorks() {
    return /waterlooworks\.uwaterloo\.ca/.test(window.location.href);
}
function getWwPageState() {
    if (!isWaterlooWorks()) {
        return {
            success: true,
            data: { kind: "other", rowCount: 0, hasNextPage: false },
        };
    }
    const rows = getWaterlooWorksRows();
    const nextBtn = getWaterlooWorksNextPageLink();
    const currentPage = document
        .querySelector("a.pagination__link.active")
        ?.textContent?.trim();
    const hasDetail = !!document.querySelector(".dashboard-header__posting-title");
    return {
        success: true,
        data: {
            kind: hasDetail ? "detail" : rows.length > 0 ? "list" : "other",
            rowCount: rows.length,
            hasNextPage: !!nextBtn && !nextBtn.classList.contains("disabled"),
            currentPage,
        },
    };
}
function getOrchestratorForSource(source) {
    switch (source) {
        case "greenhouse":
            return new GreenhouseOrchestrator();
        case "lever":
            return new LeverOrchestrator();
        case "workday":
            return new WorkdayOrchestrator();
    }
}
function isBulkSourceHandled(source, url) {
    switch (source) {
        case "greenhouse":
            return GreenhouseOrchestrator.canHandle(url);
        case "lever":
            return LeverOrchestrator.canHandle(url);
        case "workday":
            return WorkdayOrchestrator.canHandle(url);
    }
}
/**
 * Selectors used to count visible rows for the popup's "Detected: <source> —
 * N rows" badge. Each list mirrors the orchestrator's row selectors but stays
 * out-of-band so we can probe the page cheaply without instantiating the
 * orchestrator just to count.
 */
const BULK_ROW_SELECTORS = {
    greenhouse: [
        "div.opening",
        ".job-post",
        '[data-mapped="true"]',
        "section.level-0 div.opening",
    ],
    lever: [".posting", '[data-qa="posting-name"]'],
    workday: [
        '[data-automation-id="jobResults"] li',
        '[data-automation-id="jobResults"] [role="listitem"]',
        'ul[role="list"] li[data-automation-id*="job"]',
        "li.css-1q2dra3",
    ],
};
const BULK_NEXT_SELECTORS = {
    greenhouse: [
        'a[rel="next"]',
        'a[aria-label="Next page" i]',
        'button[aria-label="Next" i]',
        ".pagination .next a",
    ],
    lever: [
        'a[rel="next"]',
        'button[aria-label="Next" i]',
        'button[aria-label="Load more" i]',
    ],
    workday: [
        'button[data-uxi-element-id="next"]',
        'nav[aria-label="pagination"] button[aria-label*="next" i]',
        'button[aria-label="next" i]',
    ],
};
function countBulkRows(source) {
    for (const selector of BULK_ROW_SELECTORS[source]) {
        const matches = document.querySelectorAll(selector);
        if (matches.length > 0)
            return matches.length;
    }
    return 0;
}
function bulkHasNextPage(source) {
    for (const selector of BULK_NEXT_SELECTORS[source]) {
        const el = document.querySelector(selector);
        if (!el)
            continue;
        if (el.hasAttribute("disabled") ||
            el.getAttribute("aria-disabled") === "true" ||
            el.classList.contains("disabled")) {
            continue;
        }
        return true;
    }
    return false;
}
function getBulkSourcePageState(source) {
    const url = window.location.href;
    if (!isBulkSourceHandled(source, url)) {
        return {
            success: true,
            data: { detected: false, rowCount: 0, hasNextPage: false },
        };
    }
    const rowCount = countBulkRows(source);
    return {
        success: true,
        data: {
            detected: rowCount > 0,
            rowCount,
            hasNextPage: bulkHasNextPage(source),
        },
    };
}
async function runBulkSourceScrape(source, opts) {
    const url = window.location.href;
    if (!isBulkSourceHandled(source, url)) {
        return { success: false, error: `Not a ${source} listing page` };
    }
    const orchestrator = getOrchestratorForSource(source);
    let errors = [];
    let pages = 1;
    const onProgress = (p) => {
        pages = p.currentPage;
        errors = p.errors;
        // Best-effort progress fan-out. The background routes it to the popup.
        (0,messages/* sendMessage */._z)({
            type: `BULK_${source.toUpperCase()}_PROGRESS`,
            payload: p,
        }).catch(() => undefined);
    };
    const jobs = opts.paginated
        ? await orchestrator.scrapeAllPaginated({
            onProgress,
            maxJobs: opts.maxJobs,
            maxPages: opts.maxPages,
        })
        : await orchestrator.scrapeAllVisible({ onProgress });
    if (jobs.length === 0) {
        return {
            success: true,
            data: { imported: 0, attempted: 0, pages, errors },
        };
    }
    const importResp = await (0,messages/* sendMessage */._z)(messages/* Messages */.B2.importJobsBatch(jobs));
    if (!importResp.success) {
        return {
            success: false,
            error: importResp.error || "Bulk import failed",
        };
    }
    return {
        success: true,
        data: {
            imported: importResp.data?.imported ?? jobs.length,
            attempted: jobs.length,
            pages,
            duplicateCount: importResp.data?.dedupedIds?.length ??
                Math.max(0, jobs.length - (importResp.data?.imported ?? jobs.length)),
            dedupedIds: importResp.data?.dedupedIds,
            errors,
        },
    };
}
async function runWwBulkScrape(opts) {
    if (!isWaterlooWorks()) {
        return { success: false, error: "Not a WaterlooWorks page" };
    }
    const orchestrator = new WaterlooWorksOrchestrator();
    let errors = [];
    let pages = 1;
    const onProgress = (p) => {
        pages = p.currentPage;
        errors = p.errors;
        // Fire-and-forget progress event to the background, which can fan it out
        // to the popup if open.
        (0,messages/* sendMessage */._z)({
            type: "WW_BULK_PROGRESS",
            payload: p,
        }).catch(() => undefined);
    };
    const jobs = opts.paginated
        ? await orchestrator.scrapeAllPaginated({
            onProgress,
            maxJobs: opts.maxJobs,
            maxPages: opts.maxPages,
        })
        : await orchestrator.scrapeAllVisible({ onProgress });
    if (jobs.length === 0) {
        return {
            success: true,
            data: { imported: 0, attempted: 0, pages, errors },
        };
    }
    // Hand off to background to bulk-import to Slothing.
    const importResp = await (0,messages/* sendMessage */._z)(messages/* Messages */.B2.importJobsBatch(jobs));
    if (!importResp.success) {
        return {
            success: false,
            error: importResp.error || "Bulk import failed",
        };
    }
    return {
        success: true,
        data: {
            imported: importResp.data?.imported ?? jobs.length,
            attempted: jobs.length,
            pages,
            duplicateCount: importResp.data?.dedupedIds?.length ??
                Math.max(0, jobs.length - (importResp.data?.imported ?? jobs.length)),
            dedupedIds: importResp.data?.dedupedIds,
            errors,
        },
    };
}
async function handleFillForm() {
    if (detectedFields.length === 0) {
        return { success: false, error: "No fields detected" };
    }
    // Get profile if not cached
    if (!cachedProfile) {
        const response = await (0,messages/* sendMessage */._z)(messages/* Messages */.B2.getProfile());
        if (!response.success || !response.data) {
            return { success: false, error: "Failed to load profile" };
        }
        cachedProfile = response.data;
    }
    // Create mapper and engine
    const mapper = new FieldMapper(cachedProfile);
    autoFillEngine = new AutoFillEngine(fieldDetector, mapper);
    // Read the cold-zone floor from settings. Defaults to the legacy 0.5 if
    // settings aren't available (e.g. transient background-storage failure).
    let minimumConfidence = 0.5;
    try {
        const settings = await getExtensionSettings();
        minimumConfidence = settings.minimumConfidence;
    }
    catch (err) {
        console.warn("[Slothing] Failed to load settings; using default 0.5", err);
    }
    // Fill the form. Hand each successful fill to the corrections tracker so
    // edits-after-fill flow back into the per-domain field mapping (#33).
    const result = await autoFillEngine.fillForm(detectedFields, {
        minimumConfidence,
        onFilled: ({ field, value }) => {
            correctionsTracker.track(field, value);
        },
    });
    if (result.filled >= 2) {
        for (const form of new Set(detectedFields
            .map((field) => field.element.closest("form"))
            .filter((form) => form instanceof HTMLFormElement))) {
            autofilledForms.add(form);
        }
    }
    return { success: true, data: result };
}
// Opens the web answer-bank page in a new tab, pre-seeded with the question
// label. Used by the "Generate new" button in the inline popover. The
// background returns the configured Slothing API base URL alongside the auth
// status, which is the same host the user's logged-in answer bank lives on.
async function openAnswerBankSeed(question) {
    const auth = await (0,messages/* sendMessage */._z)(messages/* Messages */.B2.getAuthStatus());
    const base = (auth.success && auth.data?.apiBaseUrl) || types/* DEFAULT_API_BASE_URL */.Ri;
    const url = `${base.replace(/\/$/, "")}/en/bank?seed=${encodeURIComponent(question)}`;
    window.open(url, "_blank", "noopener,noreferrer");
}
// P2/#35 — scan textareas + decorate matches with the floating 💡 popover.
// Idempotent: the decorator marks each textarea so re-scans don't double-mount.
function scanForAnswerBankTextareas() {
    // querySelectorAll across the whole document. Workday/Greenhouse essay
    // fields don't always live inside a <form>, so we don't scope this to forms.
    const textareas = document.querySelectorAll("textarea");
    for (const textarea of textareas) {
        try {
            if (!shouldDecorateTextarea(textarea))
                continue;
            mountAnswerBankButton(textarea, {
                onMatch: async (q, limit) => {
                    const response = await (0,messages/* sendMessage */._z)(messages/* Messages */.B2.matchAnswerBank({ q, limit: limit ?? 3 }));
                    if (!response.success) {
                        throw new Error(response.error || "Couldn't reach the Slothing answer bank.");
                    }
                    return response.data || [];
                },
                onPick: () => {
                    // The decorator handles the DOM insertion (value + input/change
                    // events). Nothing else to do here — kept as a hook for future
                    // analytics / corrections (#33).
                },
                onGenerate: (q) => {
                    // V1: ask the background to open the web answer-bank page with the
                    // question pre-seeded. A streamed generation endpoint is deferred
                    // to a follow-up (called out in the PR body).
                    openAnswerBankSeed(q).catch((err) => console.warn("[Slothing] open bank failed:", err));
                },
            });
        }
        catch (err) {
            // A single textarea failure shouldn't abort the scan.
            console.warn("[Slothing] answer-bank decorate failed:", err);
        }
    }
}
async function getExtensionSettings() {
    const response = await (0,messages/* sendMessage */._z)(messages/* Messages */.B2.getSettings());
    if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to load extension settings");
    }
    return response.data;
}
async function updateSidebar() {
    const profile = await loadProfileForSidebar();
    await sidebarController.update({
        scrapedJob,
        detectedFieldCount: detectedFields.length,
        profile,
        onTailor: async () => {
            if (!scrapedJob)
                throw new Error("No job detected");
            const response = await (0,messages/* sendMessage */._z)(messages/* Messages */.B2.tailorFromPage(scrapedJob));
            if (!response.success || !response.data?.url) {
                throw new Error(response.error || "Failed to tailor resume");
            }
            window.open(response.data.url, "_blank", "noopener,noreferrer");
        },
        onCoverLetter: async () => {
            if (!scrapedJob)
                throw new Error("No job detected");
            const response = await (0,messages/* sendMessage */._z)(messages/* Messages */.B2.generateCoverLetterFromPage(scrapedJob));
            if (!response.success || !response.data?.url) {
                throw new Error(response.error || "Failed to generate cover letter");
            }
            window.open(response.data.url, "_blank", "noopener,noreferrer");
        },
        onSave: async () => {
            if (!scrapedJob)
                throw new Error("No job detected");
            const response = await (0,messages/* sendMessage */._z)(messages/* Messages */.B2.importJob(scrapedJob));
            if (!response.success) {
                throw new Error(response.error || "Failed to save job");
            }
        },
        onAutoFill: async () => {
            // P3 / #36 #37 — Workday / Greenhouse get the multi-step pipeline so
            // subsequent steps in the application are filled automatically. Other
            // sites fall through to the single-page `handleFillForm` path.
            const provider = multistepController.init();
            if (provider) {
                const ok = await multistepController.confirm();
                if (!ok) {
                    // The controller's confirm() returns false when there were no
                    // fillable fields detected on the current page. Fall back to the
                    // single-page path so users still get a meaningful error.
                    const response = await handleFillForm();
                    if (!response.success) {
                        throw new Error(response.error || "Failed to auto-fill form");
                    }
                }
                return;
            }
            const response = await handleFillForm();
            if (!response.success) {
                throw new Error(response.error || "Failed to auto-fill form");
            }
        },
        onSearchAnswers: async (query) => {
            const response = await (0,messages/* sendMessage */._z)(messages/* Messages */.B2.searchAnswers(query));
            if (!response.success) {
                throw new Error(response.error || "Answer search failed");
            }
            return response.data || [];
        },
        onApplyAnswer: (answer) => {
            const active = document.activeElement;
            if (active instanceof HTMLInputElement ||
                active instanceof HTMLTextAreaElement) {
                active.value = answer.answer;
                active.dispatchEvent(new Event("input", { bubbles: true }));
                active.dispatchEvent(new Event("change", { bubbles: true }));
            }
        },
        onChatStream: ({ prompt, intent, onToken, signal }) => streamChat({ prompt, intent, onToken, signal }),
        onUseInCoverLetter: (seedText) => {
            void openCoverLetterStudio(seedText);
        },
    });
}
/**
 * P4/#40 — Build the trimmed job-context payload sent to the background's
 * chat port. We deliberately drop large fields like `responsibilities` and
 * cap the description here too so we don't blow message-size limits before
 * the SW even sees it; the server clamps again as a safety net.
 */
function buildChatJobContext() {
    if (!scrapedJob)
        return undefined;
    const context = {
        title: scrapedJob.title,
        company: scrapedJob.company,
    };
    if (scrapedJob.location)
        context.location = scrapedJob.location;
    if (scrapedJob.description) {
        context.description = scrapedJob.description.slice(0, 2400);
    }
    if (scrapedJob.requirements?.length) {
        context.requirements = scrapedJob.requirements.slice(0, 10);
    }
    if (scrapedJob.url)
        context.url = scrapedJob.url;
    if (scrapedJob.sourceJobId)
        context.sourceJobId = scrapedJob.sourceJobId;
    return context;
}
/**
 * P4/#40 — Open a long-lived `chrome.runtime.connect` Port to the background
 * service worker, post a CHAT_STREAM_START frame, and resolve / reject the
 * returned Promise based on the terminal frame the background sends back.
 *
 * We chose a Port (rather than chrome.tabs.sendMessage round-trips) because:
 *   1. The SW can stream tokens back-to-back without needing the tab id.
 *   2. Either side disconnecting cleanly tears down the other half — so an
 *      AbortSignal from the React UI can cancel the upstream LLM call by
 *      simply disconnecting the port.
 */
async function streamChat(params) {
    const startFrame = {
        type: "CHAT_STREAM_START",
        prompt: params.prompt,
        jobContext: buildChatJobContext(),
    };
    return new Promise((resolve, reject) => {
        let port;
        try {
            port = chrome.runtime.connect({ name: types/* CHAT_PORT_NAME */.fc });
        }
        catch (error) {
            reject(new Error((0,error_messages/* messageForError */.p)(error)));
            return;
        }
        let settled = false;
        const finish = (err) => {
            if (settled)
                return;
            settled = true;
            params.signal.removeEventListener("abort", onAbort);
            try {
                port.disconnect();
            }
            catch {
                // Already torn down.
            }
            if (err)
                reject(err);
            else
                resolve();
        };
        const onAbort = () => finish(new Error("Cancelled"));
        params.signal.addEventListener("abort", onAbort);
        port.onMessage.addListener((message) => {
            switch (message.type) {
                case "CHAT_STREAM_TOKEN":
                    params.onToken(message.token);
                    break;
                case "CHAT_STREAM_END":
                    finish();
                    break;
                case "CHAT_STREAM_ERROR":
                    finish(new Error(message.error));
                    break;
                default:
                    break;
            }
        });
        port.onDisconnect.addListener(() => {
            // Background-initiated disconnect with no terminal frame = treat as a
            // generic failure so the UI surfaces a sensible message.
            if (!settled) {
                const runtimeError = chrome.runtime.lastError?.message;
                finish(new Error(runtimeError || "Chat stream closed unexpectedly."));
            }
        });
        try {
            port.postMessage(startFrame);
        }
        catch (error) {
            finish(new Error((0,error_messages/* messageForError */.p)(error)));
        }
    });
}
/**
 * P4/#40 — Open `/studio?mode=cover_letter&jobId=...&seed=...` in a new tab,
 * URL-encoding the seed text and truncating to keep the URL short.
 */
async function openCoverLetterStudio(seedText) {
    const auth = await (0,messages/* sendMessage */._z)(messages/* Messages */.B2.getAuthStatus());
    const base = ((auth.success && auth.data?.apiBaseUrl) ||
        types/* DEFAULT_API_BASE_URL */.Ri).replace(/\/$/, "");
    const params = new URLSearchParams({
        mode: "cover_letter",
        seed: seedText,
    });
    if (scrapedJob?.sourceJobId) {
        params.set("jobId", scrapedJob.sourceJobId);
    }
    else if (scrapedJob?.url) {
        params.set("jobUrl", scrapedJob.url);
    }
    window.open(`${base}/studio?${params.toString()}`, "_blank", "noopener,noreferrer");
}
async function loadProfileForSidebar() {
    if (cachedProfile)
        return cachedProfile;
    if (!profileLoadPromise) {
        profileLoadPromise = (0,messages/* sendMessage */._z)(messages/* Messages */.B2.getProfile())
            .then((response) => {
            if (response.success && response.data) {
                cachedProfile = response.data;
                return response.data;
            }
            return null;
        })
            .catch(() => null)
            .finally(() => {
            profileLoadPromise = null;
        });
    }
    return profileLoadPromise;
}
window.addEventListener("pagehide", () => {
    submitWatcher.detach();
    sidebarController.destroy();
    correctionsTracker.clear();
    // P2/#35 — tear down every mounted answer-bank decoration so we don't leak
    // ResizeObservers or React roots when the page is bfcache-restored.
    unmountAllAnswerBankButtons();
    // P3 / #36 #37 — destroy the per-provider observers + dismiss any
    // in-flight fallback toast.
    multistepController.destroy();
});
// Utility: debounce function
function debounce(fn, delay) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
}
console.log("[Slothing] Content script loaded");
// Pick up a localStorage-transported auth token from the Slothing connect page.
// Used on browsers that don't honor externally_connectable (Firefox in
// particular). The connect page writes the token under this key; we forward it
// to the background, which stores it in chrome.storage.local and clears the
// localStorage entry. Polls for ~30s in case the script runs before the page
// has written the key.
const SLOTHING_TOKEN_KEY = "slothing_extension_token";
let pickupInFlight = false;
function pickUpSlothingToken() {
    try {
        const raw = localStorage.getItem(SLOTHING_TOKEN_KEY);
        if (!raw)
            return "empty";
        const parsed = JSON.parse(raw);
        if (!parsed?.token || !parsed?.expiresAt) {
            // Malformed payload — purge so we stop polling.
            try {
                localStorage.removeItem(SLOTHING_TOKEN_KEY);
            }
            catch {
                // ignore
            }
            return "empty";
        }
        if (pickupInFlight)
            return "pending";
        pickupInFlight = true;
        chrome.runtime.sendMessage({
            type: "AUTH_CALLBACK",
            token: parsed.token,
            expiresAt: parsed.expiresAt,
            apiBaseUrl: parsed.apiBaseUrl || window.location.origin,
        }, (response) => {
            pickupInFlight = false;
            if (response?.success) {
                try {
                    localStorage.removeItem(SLOTHING_TOKEN_KEY);
                }
                catch {
                    // ignore
                }
                console.log("[Slothing] picked up localStorage token");
            }
        });
        return "pending";
    }
    catch {
        return "empty";
    }
}
if (/(^|\.)localhost(:|$)|^127\.0\.0\.1(:|$)|^\[::1\](:|$)/.test(window.location.host) ||
    /(^|\.)slothing\.work(:|$)/.test(window.location.host)) {
    // Initial probe: if there's nothing to pick up and we're not on the connect
    // page itself, there's no reason to poll — the page hasn't been opened.
    // On the connect page (or anywhere else if the user is about to land on
    // /extension/connect via SPA nav), keep polling for 30s.
    const initial = pickUpSlothingToken();
    const onConnectPath = /\/extension\/connect(\b|\/)/.test(window.location.pathname);
    if (initial !== "empty" || onConnectPath) {
        let elapsedMs = 0;
        const intervalId = setInterval(() => {
            elapsedMs += 500;
            const result = pickUpSlothingToken();
            if ((!onConnectPath &&
                result === "empty" &&
                !pickupInFlight &&
                elapsedMs > 2000) ||
                elapsedMs >= 30000) {
                clearInterval(intervalId);
            }
        }, 500);
    }
}


/***/ },

/***/ 543
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   p: () => (/* binding */ messageForError)
/* harmony export */ });
/* unused harmony export messageForStatus */
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
/******/ var __webpack_exports__ = (__webpack_exec__(227));
/******/ }
]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNQLGtDQUFrQyxRQUFRO0FBQzFDO0FBQ087QUFDUCxrQ0FBa0MsS0FBSztBQUN2QztBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUE0QixNQUFNLEVBQUUsS0FBSyxPQUFPLE1BQU0sRUFBRSxNQUFNO0FBQzlEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUMvUE87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTzs7O0FDbENBO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUCxpQ0FBaUM7QUFDakM7QUFDTztBQUNQLDRCQUE0QixtQkFBbUI7QUFDL0M7QUFDTztBQUNQO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDL0VpRTtBQUNRO0FBQ3pFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0EsNEJBQTRCLGFBQWE7QUFDekMsMEJBQTBCLGFBQWE7QUFDdkMsMkJBQTJCLFlBQVk7QUFDdkMsZ0JBQWdCLGlCQUFpQjtBQUNqQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixvQkFBb0I7QUFDdkM7QUFDQTtBQUNBO0FBQ0EscUJBQXFCLGNBQWMseUJBQXlCLFFBQVE7QUFDcEU7QUFDQTtBQUNBO0FBQ0E7OztBQ3hDTztBQUNQLE1BQU0sd0RBQXdEO0FBQzlELE1BQU0sbURBQW1EO0FBQ3pELE1BQU0sbURBQW1EO0FBQ3pELE1BQU0sNERBQTREO0FBQ2xFLE1BQU0sNkRBQTZEO0FBQ25FLE1BQU0saUVBQWlFO0FBQ3ZFLE1BQU0sa0VBQWtFO0FBQ3hFLE1BQU0sc0RBQXNEO0FBQzVELE1BQU0sdURBQXVEO0FBQzdELE1BQU0sd0RBQXdEO0FBQzlELE1BQU0sd0RBQXdEO0FBQzlEOzs7QUNaMEQ7QUFDUDtBQUNaO0FBQ2hDO0FBQ1AsaUJBQWlCLGFBQWE7QUFDOUI7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2QkFBNkIsc0JBQXNCLFdBQVcsTUFBTTtBQUNwRTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUF5Qix5QkFBeUI7QUFDbEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUF5QixVQUFVO0FBQ25DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUJBQXlCLGtCQUFrQjtBQUMzQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQ0FBcUMsR0FBRztBQUN4QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNEJBQTRCLG9CQUFvQjtBQUNoRCxtQkFBbUIsb0JBQW9CO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBOzs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQSxNQUFNLDBFQUEwRTtBQUNoRixNQUFNLDJDQUEyQztBQUNqRCxNQUFNLGtEQUFrRDtBQUN4RCxNQUFNLHVDQUF1QztBQUM3QyxNQUFNLG9FQUFvRTtBQUMxRSxNQUFNLGtEQUFrRDtBQUN4RCxNQUFNLHFDQUFxQztBQUMzQyxNQUFNLHVDQUF1QztBQUM3QyxNQUFNLHVEQUF1RDtBQUM3RDtBQUNBLE1BQU0sbUVBQW1FO0FBQ3pFLE1BQU0sMkVBQTJFO0FBQ2pGLE1BQU0sMkRBQTJEO0FBQ2pFLE1BQU0sK0RBQStEO0FBQ3JFLE1BQU0sb0RBQW9EO0FBQzFELE1BQU0sMERBQTBEO0FBQ2hFO0FBQ0EsTUFBTSwrREFBK0Q7QUFDckUsTUFBTSw2REFBNkQ7QUFDbkUsTUFBTSxpRUFBaUU7QUFDdkUsTUFBTSxnREFBZ0Q7QUFDdEQsTUFBTSw4REFBOEQ7QUFDcEUsTUFBTSx3REFBd0Q7QUFDOUQsTUFBTSw4Q0FBOEM7QUFDcEQ7QUFDQSxNQUFNLCtEQUErRDtBQUNyRSxNQUFNLDJDQUEyQztBQUNqRCxNQUFNLDJDQUEyQztBQUNqRCxNQUFNLDBEQUEwRDtBQUNoRSxNQUFNLDJFQUEyRTtBQUNqRixNQUFNLCtDQUErQztBQUNyRCxNQUFNLDJEQUEyRDtBQUNqRSxNQUFNLDREQUE0RDtBQUNsRTtBQUNBLE1BQU0scUVBQXFFO0FBQzNFLE1BQU0sdUVBQXVFO0FBQzdFLE1BQU0sK0RBQStEO0FBQ3JFLE1BQU0sbUVBQW1FO0FBQ3pFLE1BQU0sb0RBQW9EO0FBQzFELE1BQU0scUVBQXFFO0FBQzNFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxNQUFNLHVFQUF1RTtBQUM3RTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxNQUFNLGlEQUFpRDtBQUN2RCxNQUFNLGdEQUFnRDtBQUN0RCxNQUFNLG9EQUFvRDtBQUMxRCxNQUFNLHFEQUFxRDtBQUMzRDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLE1BQU0sZ0VBQWdFO0FBQ3RFO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLE1BQU0sdUVBQXVFO0FBQzdFO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxNQUFNLHdFQUF3RTtBQUM5RTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsTUFBTSwwRUFBMEU7QUFDaEY7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxNQUFNLDhDQUE4QztBQUNwRCxNQUFNLDJDQUEyQztBQUNqRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUMxVkE7QUFDc0Y7QUFDL0U7QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsY0FBYztBQUM3QjtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwrREFBK0QsV0FBVztBQUMxRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLGVBQWUsRUFBRSxxQkFBcUIsRUFBRSxtQkFBbUI7QUFDbkYsZUFBZSwwQkFBMEI7QUFDekM7QUFDQTs7O0FDcE1BO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUE0QjtBQUM1QiwyQkFBMkI7QUFDM0IsMEJBQTBCO0FBQzFCLDBCQUEwQjtBQUMxQix5QkFBeUIsR0FBRztBQUM1QjtBQUNBO0FBQ0E7OztBQy9IQTtBQUM2QztBQUN0Qyw4QkFBOEIsV0FBVztBQUNoRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkNBQTZDLHFCQUFxQjtBQUNsRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0NBQWtDLE9BQU8sS0FBSyxRQUFRO0FBQ3REO0FBQ0E7QUFDQSxnREFBZ0Q7QUFDaEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUF5QjtBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDdlVBO0FBQzZDO0FBQ3RDLDRCQUE0QixXQUFXO0FBQzlDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1FQUFtRSxPQUFPO0FBQzFFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMEJBQTBCLHdDQUF3QyxHQUFHLHlDQUF5QyxFQUFFLHdDQUF3QztBQUN4SjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzlOQTtBQUM2QztBQUN0QyxnQ0FBZ0MsV0FBVztBQUNsRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhCQUE4Qix3Q0FBd0MsR0FBRyx3Q0FBd0M7QUFDakg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNoT0E7QUFDNkM7QUFDdEMsMkJBQTJCLFdBQVc7QUFDN0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4QkFBOEIsd0NBQXdDLEdBQUcsd0NBQXdDO0FBQ2pIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzNPQTtBQUM2QztBQUN0Qyw2QkFBNkIsV0FBVztBQUMvQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0NBQWdDLFVBQVUsRUFBRSxzQkFBc0IsSUFBSSxxQkFBcUI7QUFDM0Y7QUFDQTtBQUNBLGdDQUFnQyxVQUFVLEVBQUUsdUJBQXVCO0FBQ25FO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDbkZPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzdoQmdEO0FBQ0Y7QUFDTTtBQUNIO0FBQ2dLO0FBQ3ZLO0FBQzFDO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLHNCQUFzQjtBQUM1QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQ0FBc0MsMkJBQTJCO0FBQ2pFLGNBQWMsc0JBQXNCO0FBQ3BDO0FBQ0EsNEJBQTRCLHlCQUF5QjtBQUNyRDtBQUNBO0FBQ0E7QUFDQSxpQ0FBaUMsaUJBQWlCO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBLGNBQWMsdUJBQXVCO0FBQ3JDLCtCQUErQixzQkFBc0I7QUFDckQ7QUFDQTtBQUNBO0FBQ0EsY0FBYyx1QkFBdUI7QUFDckM7QUFDQSxrQ0FBa0Msa0JBQWtCO0FBQ3BEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixzQkFBc0I7QUFDdEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFDQUFxQyxzQkFBc0I7QUFDM0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0Isb0JBQW9CO0FBQzFDLG9CQUFvQixtQkFBSSxDQUFDLGNBQWMsSUFBSTtBQUMzQztBQUNBLGFBQWEsK1ZBQStWO0FBQzVXO0FBQ0E7QUFDQSx3QkFBd0I7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBNEIseUJBQXlCO0FBQ3JEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0RUFBNEUsY0FBYztBQUMxRjtBQUNBO0FBQ0EsZ0NBQWdDLGNBQWM7QUFDOUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQiw0QkFBVTtBQUM5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUMwRDtBQUMxRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBLGFBQWEsZ0JBQWdCO0FBQzdCLHFDQUFxQyxxQkFBcUI7QUFDMUQsNEJBQTRCLGFBQWE7QUFDekMsMEJBQTBCLFdBQVc7QUFDckMsMkJBQTJCLG9DQUFvQztBQUMvRCxpQ0FBaUMsMENBQTBDO0FBQzNFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUCw0QkFBNEI7QUFDNUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVSxnQ0FBVyxDQUFDLHlCQUFRO0FBQzlCOzs7QUN2TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhEQUE4RCxZQUFZO0FBQzFFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbURBQW1EO0FBQ25EO0FBQ087QUFDQTtBQUNBO0FBQ0E7QUFDUDtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0EsY0FBYyxLQUFLLEdBQUcsTUFBTSxHQUFHLElBQUk7QUFDbkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLDJCQUEyQjtBQUNqRCxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLLGVBQWU7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBCQUEwQix3Q0FBd0M7QUFDbEU7QUFDQTtBQUNBO0FBQ0EsMEJBQTBCLHVCQUF1QjtBQUNqRDtBQUNBLFNBQVM7QUFDVCxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLDRCQUE0QjtBQUNoRCxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQSwrQkFBK0IscUJBQXFCO0FBQ3BEO0FBQ0Esd0NBQXdDLHFCQUFxQjtBQUM3RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2Q0FBNkMsT0FBTyxXQUFXLE1BQU07QUFDckU7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUI7QUFDdkI7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkRBQTZEO0FBQzdEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDck5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzNOK0Q7QUFDL0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ3FEO0FBQ3JEO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJEQUEyRDtBQUMzRDtBQUNBO0FBQ0EsNEVBQTRFLFVBQVU7QUFDdEY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsK0JBQStCLDhCQUE4QjtBQUM3RCxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBOzs7QUN6SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNEJBQTRCO0FBQzVCO0FBQ0E7QUFDTyx3Q0FBd0M7QUFDL0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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QkFBMEIseURBQXlEO0FBQ25GO0FBQ0E7QUFDQSxzQ0FBc0MsK0NBQStDO0FBQ3JGO0FBQ0EsU0FBUztBQUNULEtBQUs7QUFDTDtBQUNBO0FBQ087QUFDUCwyQ0FBMkM7QUFDM0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7O0FDckxBO0FBQ0E7QUFDQSwwQ0FBMEMsc0JBQXNCO0FBQ2hFO0FBQ0E7QUFDTztBQUNBO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ0EsNkJBQTZCLHVCQUEyQyxJQUFJLENBQXVCO0FBQ25HIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vQHNsb3RoaW5nL2V4dGVuc2lvbi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vcmVhY3QtZG9tQDE4LjMuMV9yZWFjdEAxOC4zLjEvbm9kZV9tb2R1bGVzL3JlYWN0LWRvbS9jbGllbnQuanMiLCJ3ZWJwYWNrOi8vQHNsb3RoaW5nL2V4dGVuc2lvbi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vcmVhY3RAMTguMy4xL25vZGVfbW9kdWxlcy9yZWFjdC9janMvcmVhY3QtanN4LXJ1bnRpbWUucHJvZHVjdGlvbi5taW4uanMiLCJ3ZWJwYWNrOi8vQHNsb3RoaW5nL2V4dGVuc2lvbi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vcmVhY3RAMTguMy4xL25vZGVfbW9kdWxlcy9yZWFjdC9qc3gtcnVudGltZS5qcyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4uLy4uL3BhY2thZ2VzL3NoYXJlZC9zcmMvZm9ybWF0dGVycy9pbmRleC50cyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4uLy4uL3BhY2thZ2VzL3NoYXJlZC9zcmMvc2NvcmluZy9jb25zdGFudHMudHMiLCJ3ZWJwYWNrOi8vQHNsb3RoaW5nL2V4dGVuc2lvbi8uLi8uLi9wYWNrYWdlcy9zaGFyZWQvc3JjL3Njb3JpbmcvdGV4dC50cyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4uLy4uL3BhY2thZ2VzL3NoYXJlZC9zcmMvc2NvcmluZy9hY3Rpb24tdmVyYnMudHMiLCJ3ZWJwYWNrOi8vQHNsb3RoaW5nL2V4dGVuc2lvbi8uLi8uLi9wYWNrYWdlcy9zaGFyZWQvc3JjL3Njb3JpbmcvYXRzLWNoYXJhY3RlcnMudHMiLCJ3ZWJwYWNrOi8vQHNsb3RoaW5nL2V4dGVuc2lvbi8uLi8uLi9wYWNrYWdlcy9zaGFyZWQvc3JjL3Njb3JpbmcvYXRzLWZyaWVuZGxpbmVzcy50cyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4uLy4uL3BhY2thZ2VzL3NoYXJlZC9zcmMvc2NvcmluZy9zeW5vbnltcy50cyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4uLy4uL3BhY2thZ2VzL3NoYXJlZC9zcmMvc2NvcmluZy9rZXl3b3JkLW1hdGNoLnRzIiwid2VicGFjazovL0BzbG90aGluZy9leHRlbnNpb24vLi4vLi4vcGFja2FnZXMvc2hhcmVkL3NyYy9zY29yaW5nL2xlbmd0aC50cyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4uLy4uL3BhY2thZ2VzL3NoYXJlZC9zcmMvc2NvcmluZy9xdWFudGlmaWVkLWFjaGlldmVtZW50cy50cyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4uLy4uL3BhY2thZ2VzL3NoYXJlZC9zcmMvc2NvcmluZy9zZWN0aW9uLWNvbXBsZXRlbmVzcy50cyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4uLy4uL3BhY2thZ2VzL3NoYXJlZC9zcmMvc2NvcmluZy9zcGVsbGluZy1ncmFtbWFyLnRzIiwid2VicGFjazovL0BzbG90aGluZy9leHRlbnNpb24vLi4vLi4vcGFja2FnZXMvc2hhcmVkL3NyYy9zY29yaW5nL2luZGV4LnRzIiwid2VicGFjazovL0BzbG90aGluZy9leHRlbnNpb24vLi9zcmMvc2hhcmVkL2ZpZWxkLXBhdHRlcm5zLnRzIiwid2VicGFjazovL0BzbG90aGluZy9leHRlbnNpb24vLi9zcmMvY29udGVudC9hdXRvLWZpbGwvZmllbGQtZGV0ZWN0b3IudHMiLCJ3ZWJwYWNrOi8vQHNsb3RoaW5nL2V4dGVuc2lvbi8uL3NyYy9jb250ZW50L2F1dG8tZmlsbC9maWVsZC1tYXBwZXIudHMiLCJ3ZWJwYWNrOi8vQHNsb3RoaW5nL2V4dGVuc2lvbi8uL3NyYy9jb250ZW50L3VpL2NvbmZpZGVuY2UtYmFuZC50cyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4vc3JjL2NvbnRlbnQvYXV0by1maWxsL2VuZ2luZS50cyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4vc3JjL2NvbnRlbnQvc2NyYXBlcnMvYmFzZS1zY3JhcGVyLnRzIiwid2VicGFjazovL0BzbG90aGluZy9leHRlbnNpb24vLi9zcmMvY29udGVudC9zY3JhcGVycy9saW5rZWRpbi1zY3JhcGVyLnRzIiwid2VicGFjazovL0BzbG90aGluZy9leHRlbnNpb24vLi9zcmMvY29udGVudC9zY3JhcGVycy93YXRlcmxvby13b3Jrcy1zY3JhcGVyLnRzIiwid2VicGFjazovL0BzbG90aGluZy9leHRlbnNpb24vLi9zcmMvY29udGVudC9zY3JhcGVycy9pbmRlZWQtc2NyYXBlci50cyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4vc3JjL2NvbnRlbnQvc2NyYXBlcnMvZ3JlZW5ob3VzZS1zY3JhcGVyLnRzIiwid2VicGFjazovL0BzbG90aGluZy9leHRlbnNpb24vLi9zcmMvY29udGVudC9zY3JhcGVycy9sZXZlci1zY3JhcGVyLnRzIiwid2VicGFjazovL0BzbG90aGluZy9leHRlbnNpb24vLi9zcmMvY29udGVudC9zY3JhcGVycy9nZW5lcmljLXNjcmFwZXIudHMiLCJ3ZWJwYWNrOi8vQHNsb3RoaW5nL2V4dGVuc2lvbi8uL3NyYy9jb250ZW50L3NjcmFwZXJzL3NjcmFwZXItcmVnaXN0cnkudHMiLCJ3ZWJwYWNrOi8vQHNsb3RoaW5nL2V4dGVuc2lvbi8uL3NyYy9jb250ZW50L3NjcmFwZXJzL3dhdGVybG9vLXdvcmtzLW9yY2hlc3RyYXRvci50cyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4vc3JjL2NvbnRlbnQvc2NyYXBlcnMvZ3JlZW5ob3VzZS1vcmNoZXN0cmF0b3IudHMiLCJ3ZWJwYWNrOi8vQHNsb3RoaW5nL2V4dGVuc2lvbi8uL3NyYy9jb250ZW50L3NjcmFwZXJzL2xldmVyLW9yY2hlc3RyYXRvci50cyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4vc3JjL2NvbnRlbnQvc2NyYXBlcnMvd29ya2RheS1vcmNoZXN0cmF0b3IudHMiLCJ3ZWJwYWNrOi8vQHNsb3RoaW5nL2V4dGVuc2lvbi8uL3NyYy9jb250ZW50L3RyYWNraW5nL2FwcGxpZWQtdG9hc3QudHMiLCJ3ZWJwYWNrOi8vQHNsb3RoaW5nL2V4dGVuc2lvbi8uL3NyYy9jb250ZW50L3RyYWNraW5nL3BhZ2Utc25hcHNob3QudHMiLCJ3ZWJwYWNrOi8vQHNsb3RoaW5nL2V4dGVuc2lvbi8uL3NyYy9jb250ZW50L3RyYWNraW5nL3N1Ym1pdC13YXRjaGVyLnRzIiwid2VicGFjazovL0BzbG90aGluZy9leHRlbnNpb24vLi9zcmMvY29udGVudC9zaWRlYmFyL2NoYXQtcGFuZWwudHN4Iiwid2VicGFjazovL0BzbG90aGluZy9leHRlbnNpb24vLi9zcmMvY29udGVudC9zaWRlYmFyL2pvYi1wYWdlLXNpZGViYXIudHN4Iiwid2VicGFjazovL0BzbG90aGluZy9leHRlbnNpb24vLi9zcmMvY29udGVudC9zaWRlYmFyL3Njb3JpbmcudHMiLCJ3ZWJwYWNrOi8vQHNsb3RoaW5nL2V4dGVuc2lvbi8uL3NyYy9jb250ZW50L3NpZGViYXIvc3RvcmFnZS50cyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4vc3JjL2NvbnRlbnQvc2lkZWJhci9zdHlsZXMudHMiLCJ3ZWJwYWNrOi8vQHNsb3RoaW5nL2V4dGVuc2lvbi8uL3NyYy9jb250ZW50L3NpZGViYXIvY29udHJvbGxlci50c3giLCJ3ZWJwYWNrOi8vQHNsb3RoaW5nL2V4dGVuc2lvbi8uL3NyYy9jb250ZW50L2NvcnJlY3Rpb25zLXRyYWNrZXIudHMiLCJ3ZWJwYWNrOi8vQHNsb3RoaW5nL2V4dGVuc2lvbi8uL3NyYy9jb250ZW50L3NjcmFwZXJzL2xpbmtlZGluLXBhc3NpdmUtY2FwdHVyZS50cyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4vc3JjL2NvbnRlbnQvdWkvYW5zd2VyLWJhbmstYnV0dG9uLXN0eWxlcy50cyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4vc3JjL2NvbnRlbnQvdWkvYW5zd2VyLWJhbmstYnV0dG9uLnRzeCIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4vc3JjL2NvbnRlbnQvbXVsdGlzdGVwL3Nlc3Npb24udHMiLCJ3ZWJwYWNrOi8vQHNsb3RoaW5nL2V4dGVuc2lvbi8uL3NyYy9jb250ZW50L211bHRpc3RlcC9wcm9tcHQtZmFsbGJhY2sudHMiLCJ3ZWJwYWNrOi8vQHNsb3RoaW5nL2V4dGVuc2lvbi8uL3NyYy9jb250ZW50L211bHRpc3RlcC93b3JrZGF5LnRzIiwid2VicGFjazovL0BzbG90aGluZy9leHRlbnNpb24vLi9zcmMvY29udGVudC9tdWx0aXN0ZXAvZ3JlZW5ob3VzZS50cyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4vc3JjL2NvbnRlbnQvbXVsdGlzdGVwL2NvbnRyb2xsZXIudHMiLCJ3ZWJwYWNrOi8vQHNsb3RoaW5nL2V4dGVuc2lvbi8uL3NyYy9jb250ZW50L2luZGV4LnRzIiwid2VicGFjazovL0BzbG90aGluZy9leHRlbnNpb24vLi9zcmMvc2hhcmVkL2Vycm9yLW1lc3NhZ2VzLnRzIiwid2VicGFjazovL0BzbG90aGluZy9leHRlbnNpb24vLi9zcmMvc2hhcmVkL21lc3NhZ2VzLnRzIiwid2VicGFjazovL0BzbG90aGluZy9leHRlbnNpb24vLi9zcmMvc2hhcmVkL3R5cGVzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxudmFyIG0gPSByZXF1aXJlKCdyZWFjdC1kb20nKTtcbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nKSB7XG4gIGV4cG9ydHMuY3JlYXRlUm9vdCA9IG0uY3JlYXRlUm9vdDtcbiAgZXhwb3J0cy5oeWRyYXRlUm9vdCA9IG0uaHlkcmF0ZVJvb3Q7XG59IGVsc2Uge1xuICB2YXIgaSA9IG0uX19TRUNSRVRfSU5URVJOQUxTX0RPX05PVF9VU0VfT1JfWU9VX1dJTExfQkVfRklSRUQ7XG4gIGV4cG9ydHMuY3JlYXRlUm9vdCA9IGZ1bmN0aW9uKGMsIG8pIHtcbiAgICBpLnVzaW5nQ2xpZW50RW50cnlQb2ludCA9IHRydWU7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBtLmNyZWF0ZVJvb3QoYywgbyk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGkudXNpbmdDbGllbnRFbnRyeVBvaW50ID0gZmFsc2U7XG4gICAgfVxuICB9O1xuICBleHBvcnRzLmh5ZHJhdGVSb290ID0gZnVuY3Rpb24oYywgaCwgbykge1xuICAgIGkudXNpbmdDbGllbnRFbnRyeVBvaW50ID0gdHJ1ZTtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIG0uaHlkcmF0ZVJvb3QoYywgaCwgbyk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGkudXNpbmdDbGllbnRFbnRyeVBvaW50ID0gZmFsc2U7XG4gICAgfVxuICB9O1xufVxuIiwiLyoqXG4gKiBAbGljZW5zZSBSZWFjdFxuICogcmVhY3QtanN4LXJ1bnRpbWUucHJvZHVjdGlvbi5taW4uanNcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIEZhY2Vib29rLCBJbmMuIGFuZCBpdHMgYWZmaWxpYXRlcy5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuJ3VzZSBzdHJpY3QnO3ZhciBmPXJlcXVpcmUoXCJyZWFjdFwiKSxrPVN5bWJvbC5mb3IoXCJyZWFjdC5lbGVtZW50XCIpLGw9U3ltYm9sLmZvcihcInJlYWN0LmZyYWdtZW50XCIpLG09T2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSxuPWYuX19TRUNSRVRfSU5URVJOQUxTX0RPX05PVF9VU0VfT1JfWU9VX1dJTExfQkVfRklSRUQuUmVhY3RDdXJyZW50T3duZXIscD17a2V5OiEwLHJlZjohMCxfX3NlbGY6ITAsX19zb3VyY2U6ITB9O1xuZnVuY3Rpb24gcShjLGEsZyl7dmFyIGIsZD17fSxlPW51bGwsaD1udWxsO3ZvaWQgMCE9PWcmJihlPVwiXCIrZyk7dm9pZCAwIT09YS5rZXkmJihlPVwiXCIrYS5rZXkpO3ZvaWQgMCE9PWEucmVmJiYoaD1hLnJlZik7Zm9yKGIgaW4gYSltLmNhbGwoYSxiKSYmIXAuaGFzT3duUHJvcGVydHkoYikmJihkW2JdPWFbYl0pO2lmKGMmJmMuZGVmYXVsdFByb3BzKWZvcihiIGluIGE9Yy5kZWZhdWx0UHJvcHMsYSl2b2lkIDA9PT1kW2JdJiYoZFtiXT1hW2JdKTtyZXR1cm57JCR0eXBlb2Y6ayx0eXBlOmMsa2V5OmUscmVmOmgscHJvcHM6ZCxfb3duZXI6bi5jdXJyZW50fX1leHBvcnRzLkZyYWdtZW50PWw7ZXhwb3J0cy5qc3g9cTtleHBvcnRzLmpzeHM9cTtcbiIsIid1c2Ugc3RyaWN0JztcblxuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAncHJvZHVjdGlvbicpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2Nqcy9yZWFjdC1qc3gtcnVudGltZS5wcm9kdWN0aW9uLm1pbi5qcycpO1xufSBlbHNlIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2Nqcy9yZWFjdC1qc3gtcnVudGltZS5kZXZlbG9wbWVudC5qcycpO1xufVxuIiwiZXhwb3J0IGNvbnN0IERFRkFVTFRfTE9DQUxFID0gXCJlbi1VU1wiO1xuY29uc3QgTlVNRVJJQ19QQVJUU19MT0NBTEUgPSBgJHtERUZBVUxUX0xPQ0FMRX0tdS1udS1sYXRuYDtcbmV4cG9ydCBjb25zdCBMT0NBTEVfQ09PS0lFX05BTUUgPSBcInRhaWRhX2xvY2FsZVwiO1xuZXhwb3J0IGNvbnN0IExPQ0FMRV9DSEFOR0VfRVZFTlQgPSBcInRhaWRhOmxvY2FsZS1jaGFuZ2VcIjtcbmV4cG9ydCBjb25zdCBTVVBQT1JURURfTE9DQUxFUyA9IFtcbiAgICB7IHZhbHVlOiBcImVuLVVTXCIsIGxhYmVsOiBcIkVuZ2xpc2ggKFVTKVwiIH0sXG4gICAgeyB2YWx1ZTogXCJlbi1DQVwiLCBsYWJlbDogXCJFbmdsaXNoIChDQSlcIiB9LFxuICAgIHsgdmFsdWU6IFwiZW4tR0JcIiwgbGFiZWw6IFwiRW5nbGlzaCAoVUspXCIgfSxcbiAgICB7IHZhbHVlOiBcImZyXCIsIGxhYmVsOiBcIkZyZW5jaFwiIH0sXG4gICAgeyB2YWx1ZTogXCJlc1wiLCBsYWJlbDogXCJTcGFuaXNoXCIgfSxcbiAgICB7IHZhbHVlOiBcImRlXCIsIGxhYmVsOiBcIkdlcm1hblwiIH0sXG4gICAgeyB2YWx1ZTogXCJqYVwiLCBsYWJlbDogXCJKYXBhbmVzZVwiIH0sXG4gICAgeyB2YWx1ZTogXCJ6aC1DTlwiLCBsYWJlbDogXCJDaGluZXNlIChTaW1wbGlmaWVkKVwiIH0sXG4gICAgeyB2YWx1ZTogXCJwdFwiLCBsYWJlbDogXCJQb3J0dWd1ZXNlXCIgfSxcbiAgICB7IHZhbHVlOiBcInB0LUJSXCIsIGxhYmVsOiBcIlBvcnR1Z3Vlc2UgKEJyYXppbClcIiB9LFxuICAgIHsgdmFsdWU6IFwiaGlcIiwgbGFiZWw6IFwiSGluZGlcIiB9LFxuICAgIHsgdmFsdWU6IFwia29cIiwgbGFiZWw6IFwiS29yZWFuXCIgfSxcbl07XG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplTG9jYWxlKGxvY2FsZSkge1xuICAgIGlmICghbG9jYWxlKVxuICAgICAgICByZXR1cm4gREVGQVVMVF9MT0NBTEU7XG4gICAgY29uc3Qgc3VwcG9ydGVkID0gU1VQUE9SVEVEX0xPQ0FMRVMuZmluZCgoY2FuZGlkYXRlKSA9PiBjYW5kaWRhdGUudmFsdWUudG9Mb3dlckNhc2UoKSA9PT0gbG9jYWxlLnRvTG93ZXJDYXNlKCkgfHxcbiAgICAgICAgY2FuZGlkYXRlLnZhbHVlLnNwbGl0KFwiLVwiKVswXS50b0xvd2VyQ2FzZSgpID09PSBsb2NhbGUudG9Mb3dlckNhc2UoKSk7XG4gICAgcmV0dXJuIHN1cHBvcnRlZD8udmFsdWUgPz8gREVGQVVMVF9MT0NBTEU7XG59XG5leHBvcnQgZnVuY3Rpb24gbm93SXNvKCkge1xuICAgIHJldHVybiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG59XG5leHBvcnQgZnVuY3Rpb24gbm93RGF0ZSgpIHtcbiAgICByZXR1cm4gbmV3IERhdGUoKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBub3dFcG9jaCgpIHtcbiAgICByZXR1cm4gRGF0ZS5ub3coKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVRvRGF0ZSh2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBcIlwiKVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICBjb25zdCBkYXRlID0gdmFsdWUgaW5zdGFuY2VvZiBEYXRlID8gbmV3IERhdGUodmFsdWUuZ2V0VGltZSgpKSA6IG5ldyBEYXRlKHZhbHVlKTtcbiAgICByZXR1cm4gTnVtYmVyLmlzTmFOKGRhdGUuZ2V0VGltZSgpKSA/IG51bGwgOiBkYXRlO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHRvSXNvKHZhbHVlKSB7XG4gICAgY29uc3QgZGF0ZSA9IHBhcnNlVG9EYXRlKHZhbHVlKTtcbiAgICBpZiAoIWRhdGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkV4cGVjdGVkIGEgdmFsaWQgZGF0ZSB2YWx1ZVwiKTtcbiAgICB9XG4gICAgcmV0dXJuIGRhdGUudG9JU09TdHJpbmcoKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiB0b051bGxhYmxlSXNvKHZhbHVlKSB7XG4gICAgcmV0dXJuIHBhcnNlVG9EYXRlKHZhbHVlKT8udG9JU09TdHJpbmcoKSA/PyBudWxsO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHRvRXBvY2godmFsdWUpIHtcbiAgICBjb25zdCBkYXRlID0gcGFyc2VUb0RhdGUodmFsdWUpO1xuICAgIGlmICghZGF0ZSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRXhwZWN0ZWQgYSB2YWxpZCBkYXRlIHZhbHVlXCIpO1xuICAgIH1cbiAgICByZXR1cm4gZGF0ZS5nZXRUaW1lKCk7XG59XG5leHBvcnQgZnVuY3Rpb24gdG9OdWxsYWJsZUVwb2NoKHZhbHVlKSB7XG4gICAgcmV0dXJuIHBhcnNlVG9EYXRlKHZhbHVlKT8uZ2V0VGltZSgpID8/IG51bGw7XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0VXNlclRpbWV6b25lKCkge1xuICAgIGlmICh0eXBlb2YgSW50bCA9PT0gXCJ1bmRlZmluZWRcIilcbiAgICAgICAgcmV0dXJuIFwiVVRDXCI7XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIEludGwuRGF0ZVRpbWVGb3JtYXQoKS5yZXNvbHZlZE9wdGlvbnMoKS50aW1lWm9uZSB8fCBcIlVUQ1wiO1xuICAgIH1cbiAgICBjYXRjaCB7XG4gICAgICAgIHJldHVybiBcIlVUQ1wiO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGdldERpc3BsYXlUaW1lem9uZSh0aW1lWm9uZSkge1xuICAgIGlmICh0aW1lWm9uZSlcbiAgICAgICAgcmV0dXJuIHRpbWVab25lO1xuICAgIHJldHVybiB0eXBlb2Ygd2luZG93ID09PSBcInVuZGVmaW5lZFwiID8gXCJVVENcIiA6IGdldFVzZXJUaW1lem9uZSgpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdEFic29sdXRlKHZhbHVlLCBvcHRzID0ge30pIHtcbiAgICBjb25zdCBkYXRlID0gcGFyc2VUb0RhdGUodmFsdWUpO1xuICAgIGlmICghZGF0ZSlcbiAgICAgICAgcmV0dXJuIFwiVW5rbm93biBkYXRlXCI7XG4gICAgY29uc3QgaW5jbHVkZVRpbWUgPSBvcHRzLmluY2x1ZGVUaW1lID8/IHRydWU7XG4gICAgY29uc3QgZm9ybWF0dGVyID0gbmV3IEludGwuRGF0ZVRpbWVGb3JtYXQobm9ybWFsaXplTG9jYWxlKG9wdHMubG9jYWxlKSwge1xuICAgICAgICBtb250aDogXCJzaG9ydFwiLFxuICAgICAgICBkYXk6IFwibnVtZXJpY1wiLFxuICAgICAgICB5ZWFyOiBcIm51bWVyaWNcIixcbiAgICAgICAgLi4uKGluY2x1ZGVUaW1lID8geyBob3VyOiBcIm51bWVyaWNcIiwgbWludXRlOiBcIjItZGlnaXRcIiB9IDoge30pLFxuICAgICAgICB0aW1lWm9uZTogZ2V0RGlzcGxheVRpbWV6b25lKG9wdHMudGltZVpvbmUpLFxuICAgIH0pO1xuICAgIGNvbnN0IGZvcm1hdHRlZCA9IGZvcm1hdHRlci5mb3JtYXQoZGF0ZSk7XG4gICAgaWYgKCFpbmNsdWRlVGltZSlcbiAgICAgICAgcmV0dXJuIGZvcm1hdHRlZDtcbiAgICBjb25zdCBsYXN0Q29tbWEgPSBmb3JtYXR0ZWQubGFzdEluZGV4T2YoXCIsXCIpO1xuICAgIGlmIChsYXN0Q29tbWEgPT09IC0xKVxuICAgICAgICByZXR1cm4gZm9ybWF0dGVkO1xuICAgIHJldHVybiBgJHtmb3JtYXR0ZWQuc2xpY2UoMCwgbGFzdENvbW1hKX0gwrcgJHtmb3JtYXR0ZWRcbiAgICAgICAgLnNsaWNlKGxhc3RDb21tYSArIDEpXG4gICAgICAgIC50cmltKCl9YDtcbn1cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRSZWxhdGl2ZSh2YWx1ZSwgb3B0cyA9IHt9KSB7XG4gICAgY29uc3QgZGF0ZSA9IHBhcnNlVG9EYXRlKHZhbHVlKTtcbiAgICBjb25zdCBjdXJyZW50ID0gcGFyc2VUb0RhdGUob3B0cy5ub3cgPz8gbm93SXNvKCkpO1xuICAgIGlmICghZGF0ZSB8fCAhY3VycmVudCkge1xuICAgICAgICByZXR1cm4gXCJVbmtub3duIGRhdGVcIjtcbiAgICB9XG4gICAgY29uc3QgZGlmZk1zID0gY3VycmVudC5nZXRUaW1lKCkgLSBkYXRlLmdldFRpbWUoKTtcbiAgICBjb25zdCBhYnNNcyA9IE1hdGguYWJzKGRpZmZNcyk7XG4gICAgY29uc3QgaXNGdXR1cmUgPSBkaWZmTXMgPCAwO1xuICAgIGNvbnN0IG1pbnV0ZSA9IDYwICogMTAwMDtcbiAgICBjb25zdCBob3VyID0gNjAgKiBtaW51dGU7XG4gICAgY29uc3QgZGF5ID0gMjQgKiBob3VyO1xuICAgIGNvbnN0IHdlZWsgPSA3ICogZGF5O1xuICAgIGNvbnN0IG1vbnRoID0gMzAgKiBkYXk7XG4gICAgY29uc3QgeWVhciA9IDM2NSAqIGRheTtcbiAgICBpZiAoYWJzTXMgPCBtaW51dGUpXG4gICAgICAgIHJldHVybiBcIkp1c3Qgbm93XCI7XG4gICAgaWYgKGFic01zIDwgaG91cilcbiAgICAgICAgcmV0dXJuIGZvcm1hdFJlbGF0aXZlQnVja2V0KE1hdGguZmxvb3IoYWJzTXMgLyBtaW51dGUpLCBcIm1cIiwgaXNGdXR1cmUpO1xuICAgIGlmIChhYnNNcyA8IGRheSlcbiAgICAgICAgcmV0dXJuIGZvcm1hdFJlbGF0aXZlQnVja2V0KE1hdGguZmxvb3IoYWJzTXMgLyBob3VyKSwgXCJoXCIsIGlzRnV0dXJlKTtcbiAgICBpZiAoYWJzTXMgPCAyICogZGF5KVxuICAgICAgICByZXR1cm4gaXNGdXR1cmUgPyBcIlRvbW9ycm93XCIgOiBcIlllc3RlcmRheVwiO1xuICAgIGlmIChhYnNNcyA8IHdlZWspXG4gICAgICAgIHJldHVybiBmb3JtYXRSZWxhdGl2ZUJ1Y2tldChNYXRoLmZsb29yKGFic01zIC8gZGF5KSwgXCJkXCIsIGlzRnV0dXJlKTtcbiAgICBpZiAoYWJzTXMgPCBtb250aClcbiAgICAgICAgcmV0dXJuIGZvcm1hdFJlbGF0aXZlQnVja2V0KE1hdGguZmxvb3IoYWJzTXMgLyB3ZWVrKSwgXCJ3XCIsIGlzRnV0dXJlKTtcbiAgICBpZiAoYWJzTXMgPCB5ZWFyKVxuICAgICAgICByZXR1cm4gZm9ybWF0UmVsYXRpdmVCdWNrZXQoTWF0aC5mbG9vcihhYnNNcyAvIG1vbnRoKSwgXCJtb1wiLCBpc0Z1dHVyZSk7XG4gICAgcmV0dXJuIGZvcm1hdFJlbGF0aXZlQnVja2V0KE1hdGguZmxvb3IoYWJzTXMgLyB5ZWFyKSwgXCJ5XCIsIGlzRnV0dXJlKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXREYXRlT25seSh2YWx1ZSwgb3B0cyA9IHt9KSB7XG4gICAgY29uc3QgZGF0ZSA9IHBhcnNlVG9EYXRlKHZhbHVlKTtcbiAgICBpZiAoIWRhdGUpXG4gICAgICAgIHJldHVybiBcIlVua25vd24gZGF0ZVwiO1xuICAgIHJldHVybiBuZXcgSW50bC5EYXRlVGltZUZvcm1hdChub3JtYWxpemVMb2NhbGUob3B0cy5sb2NhbGUpLCB7XG4gICAgICAgIG1vbnRoOiBcInNob3J0XCIsXG4gICAgICAgIGRheTogXCJudW1lcmljXCIsXG4gICAgICAgIHllYXI6IFwibnVtZXJpY1wiLFxuICAgICAgICB0aW1lWm9uZTogZ2V0RGlzcGxheVRpbWV6b25lKG9wdHMudGltZVpvbmUpLFxuICAgIH0pLmZvcm1hdChkYXRlKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRUaW1lT25seSh2YWx1ZSwgb3B0cyA9IHt9KSB7XG4gICAgY29uc3QgZGF0ZSA9IHBhcnNlVG9EYXRlKHZhbHVlKTtcbiAgICBpZiAoIWRhdGUpXG4gICAgICAgIHJldHVybiBcIlVua25vd24gdGltZVwiO1xuICAgIHJldHVybiBuZXcgSW50bC5EYXRlVGltZUZvcm1hdChub3JtYWxpemVMb2NhbGUob3B0cy5sb2NhbGUpLCB7XG4gICAgICAgIGhvdXI6IFwibnVtZXJpY1wiLFxuICAgICAgICBtaW51dGU6IFwiMi1kaWdpdFwiLFxuICAgICAgICB0aW1lWm9uZTogZ2V0RGlzcGxheVRpbWV6b25lKG9wdHMudGltZVpvbmUpLFxuICAgIH0pLmZvcm1hdChkYXRlKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRJc29EYXRlT25seSh2YWx1ZSA9IG5vd0lzbygpKSB7XG4gICAgcmV0dXJuIHRvSXNvKHBhcnNlVG9EYXRlKHZhbHVlKSA/PyBub3dJc28oKSkuc2xpY2UoMCwgMTApO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdE1vbnRoWWVhcih2YWx1ZSwgb3B0cyA9IHt9KSB7XG4gICAgY29uc3QgZGF0ZSA9IHBhcnNlVG9EYXRlKHZhbHVlKTtcbiAgICBpZiAoIWRhdGUpXG4gICAgICAgIHJldHVybiBcIlwiO1xuICAgIHJldHVybiBuZXcgSW50bC5EYXRlVGltZUZvcm1hdChub3JtYWxpemVMb2NhbGUob3B0cy5sb2NhbGUpLCB7XG4gICAgICAgIG1vbnRoOiBcInNob3J0XCIsXG4gICAgICAgIHllYXI6IFwibnVtZXJpY1wiLFxuICAgICAgICB0aW1lWm9uZTogZ2V0RGlzcGxheVRpbWV6b25lKG9wdHMudGltZVpvbmUpLFxuICAgIH0pLmZvcm1hdChkYXRlKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBpc1Bhc3QodmFsdWUsIG5vdyA9IG5vd0lzbygpKSB7XG4gICAgY29uc3QgZGF0ZSA9IHBhcnNlVG9EYXRlKHZhbHVlKTtcbiAgICBjb25zdCBjdXJyZW50ID0gcGFyc2VUb0RhdGUobm93KTtcbiAgICByZXR1cm4gQm9vbGVhbihkYXRlICYmIGN1cnJlbnQgJiYgZGF0ZS5nZXRUaW1lKCkgPCBjdXJyZW50LmdldFRpbWUoKSk7XG59XG5leHBvcnQgZnVuY3Rpb24gaXNGdXR1cmUodmFsdWUsIG5vdyA9IG5vd0lzbygpKSB7XG4gICAgY29uc3QgZGF0ZSA9IHBhcnNlVG9EYXRlKHZhbHVlKTtcbiAgICBjb25zdCBjdXJyZW50ID0gcGFyc2VUb0RhdGUobm93KTtcbiAgICByZXR1cm4gQm9vbGVhbihkYXRlICYmIGN1cnJlbnQgJiYgZGF0ZS5nZXRUaW1lKCkgPiBjdXJyZW50LmdldFRpbWUoKSk7XG59XG5leHBvcnQgZnVuY3Rpb24gZGlmZlNlY29uZHMoYSwgYikge1xuICAgIGNvbnN0IGZpcnN0ID0gcGFyc2VUb0RhdGUoYSk7XG4gICAgY29uc3Qgc2Vjb25kID0gcGFyc2VUb0RhdGUoYik7XG4gICAgaWYgKCFmaXJzdCB8fCAhc2Vjb25kKVxuICAgICAgICByZXR1cm4gTnVtYmVyLk5hTjtcbiAgICByZXR1cm4gTWF0aC50cnVuYygoZmlyc3QuZ2V0VGltZSgpIC0gc2Vjb25kLmdldFRpbWUoKSkgLyAxMDAwKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBkaWZmRGF5cyhhLCBiKSB7XG4gICAgY29uc3Qgc2Vjb25kcyA9IGRpZmZTZWNvbmRzKGEsIGIpO1xuICAgIHJldHVybiBOdW1iZXIuaXNOYU4oc2Vjb25kcykgPyBOdW1iZXIuTmFOIDogc2Vjb25kcyAvIDg2NDAwO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGFkZERheXModmFsdWUsIGRheXMpIHtcbiAgICBjb25zdCBkYXRlID0gcGFyc2VUb0RhdGUodmFsdWUpO1xuICAgIGlmICghZGF0ZSlcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkV4cGVjdGVkIGEgdmFsaWQgZGF0ZSB2YWx1ZVwiKTtcbiAgICByZXR1cm4gbmV3IERhdGUoZGF0ZS5nZXRUaW1lKCkgKyBkYXlzICogODY0MDAwMDApO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGFkZE1pbnV0ZXModmFsdWUsIG1pbnV0ZXMpIHtcbiAgICBjb25zdCBkYXRlID0gcGFyc2VUb0RhdGUodmFsdWUpO1xuICAgIGlmICghZGF0ZSlcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkV4cGVjdGVkIGEgdmFsaWQgZGF0ZSB2YWx1ZVwiKTtcbiAgICByZXR1cm4gbmV3IERhdGUoZGF0ZS5nZXRUaW1lKCkgKyBtaW51dGVzICogNjAwMDApO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0T2ZEYXkodmFsdWUsIHRpbWVab25lID0gXCJVVENcIikge1xuICAgIGNvbnN0IGRhdGUgPSBwYXJzZVRvRGF0ZSh2YWx1ZSk7XG4gICAgaWYgKCFkYXRlKVxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRXhwZWN0ZWQgYSB2YWxpZCBkYXRlIHZhbHVlXCIpO1xuICAgIGlmICh0aW1lWm9uZSA9PT0gXCJVVENcIikge1xuICAgICAgICByZXR1cm4gbmV3IERhdGUoRGF0ZS5VVEMoZGF0ZS5nZXRVVENGdWxsWWVhcigpLCBkYXRlLmdldFVUQ01vbnRoKCksIGRhdGUuZ2V0VVRDRGF0ZSgpKSk7XG4gICAgfVxuICAgIGNvbnN0IHBhcnRzID0gZ2V0Wm9uZWRQYXJ0cyhkYXRlLCB0aW1lWm9uZSk7XG4gICAgcmV0dXJuIHpvbmVkVGltZVRvVXRjKHBhcnRzLnllYXIsIHBhcnRzLm1vbnRoLCBwYXJ0cy5kYXksIDAsIDAsIDAsIHRpbWVab25lKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBlbmRPZkRheSh2YWx1ZSwgdGltZVpvbmUgPSBcIlVUQ1wiKSB7XG4gICAgcmV0dXJuIGFkZE1pbnV0ZXMoYWRkRGF5cyhzdGFydE9mRGF5KHZhbHVlLCB0aW1lWm9uZSksIDEpLCAtMSAvIDYwMDAwKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiB0b1VzZXJUeih2YWx1ZSwgdGltZVpvbmUgPSBnZXRVc2VyVGltZXpvbmUoKSkge1xuICAgIGNvbnN0IGRhdGUgPSBwYXJzZVRvRGF0ZSh2YWx1ZSk7XG4gICAgaWYgKCFkYXRlKVxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRXhwZWN0ZWQgYSB2YWxpZCBkYXRlIHZhbHVlXCIpO1xuICAgIGNvbnN0IHBhcnRzID0gZ2V0Wm9uZWRQYXJ0cyhkYXRlLCB0aW1lWm9uZSk7XG4gICAgcmV0dXJuIG5ldyBEYXRlKHBhcnRzLnllYXIsIHBhcnRzLm1vbnRoIC0gMSwgcGFydHMuZGF5LCBwYXJ0cy5ob3VyLCBwYXJ0cy5taW51dGUsIHBhcnRzLnNlY29uZCk7XG59XG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0RGF0ZUFic29sdXRlKGRhdGUsIGxvY2FsZSA9IERFRkFVTFRfTE9DQUxFKSB7XG4gICAgcmV0dXJuIGZvcm1hdEFic29sdXRlKGRhdGUsIHsgbG9jYWxlIH0pO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdERhdGVSZWxhdGl2ZShkYXRlLCBub3cgPSBub3dJc28oKSkge1xuICAgIHJldHVybiBmb3JtYXRSZWxhdGl2ZShkYXRlLCB7IG5vdyB9KTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXRCcm93c2VyRGVmYXVsdExvY2FsZSgpIHtcbiAgICBpZiAodHlwZW9mIG5hdmlnYXRvciA9PT0gXCJ1bmRlZmluZWRcIilcbiAgICAgICAgcmV0dXJuIERFRkFVTFRfTE9DQUxFO1xuICAgIHJldHVybiBub3JtYWxpemVMb2NhbGUobmF2aWdhdG9yLmxhbmd1YWdlKTtcbn1cbmZ1bmN0aW9uIGZvcm1hdFJlbGF0aXZlQnVja2V0KHZhbHVlLCB1bml0LCBpc0Z1dHVyZSkge1xuICAgIHJldHVybiBpc0Z1dHVyZSA/IGBpbiAke3ZhbHVlfSR7dW5pdH1gIDogYCR7dmFsdWV9JHt1bml0fSBhZ29gO1xufVxuZnVuY3Rpb24gZ2V0Wm9uZWRQYXJ0cyhkYXRlLCB0aW1lWm9uZSkge1xuICAgIGNvbnN0IHBhcnRzID0gbmV3IEludGwuRGF0ZVRpbWVGb3JtYXQoTlVNRVJJQ19QQVJUU19MT0NBTEUsIHtcbiAgICAgICAgdGltZVpvbmUsXG4gICAgICAgIHllYXI6IFwibnVtZXJpY1wiLFxuICAgICAgICBtb250aDogXCIyLWRpZ2l0XCIsXG4gICAgICAgIGRheTogXCIyLWRpZ2l0XCIsXG4gICAgICAgIGhvdXI6IFwiMi1kaWdpdFwiLFxuICAgICAgICBtaW51dGU6IFwiMi1kaWdpdFwiLFxuICAgICAgICBzZWNvbmQ6IFwiMi1kaWdpdFwiLFxuICAgICAgICBob3VyQ3ljbGU6IFwiaDIzXCIsXG4gICAgfSkuZm9ybWF0VG9QYXJ0cyhkYXRlKTtcbiAgICBjb25zdCBnZXQgPSAodHlwZSkgPT4gTnVtYmVyKHBhcnRzLmZpbmQoKHBhcnQpID0+IHBhcnQudHlwZSA9PT0gdHlwZSk/LnZhbHVlKTtcbiAgICByZXR1cm4ge1xuICAgICAgICB5ZWFyOiBnZXQoXCJ5ZWFyXCIpLFxuICAgICAgICBtb250aDogZ2V0KFwibW9udGhcIiksXG4gICAgICAgIGRheTogZ2V0KFwiZGF5XCIpLFxuICAgICAgICBob3VyOiBnZXQoXCJob3VyXCIpLFxuICAgICAgICBtaW51dGU6IGdldChcIm1pbnV0ZVwiKSxcbiAgICAgICAgc2Vjb25kOiBnZXQoXCJzZWNvbmRcIiksXG4gICAgfTtcbn1cbmZ1bmN0aW9uIHpvbmVkVGltZVRvVXRjKHllYXIsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCB0aW1lWm9uZSkge1xuICAgIGNvbnN0IHV0Y0d1ZXNzID0gbmV3IERhdGUoRGF0ZS5VVEMoeWVhciwgbW9udGggLSAxLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kKSk7XG4gICAgY29uc3QgcGFydHMgPSBnZXRab25lZFBhcnRzKHV0Y0d1ZXNzLCB0aW1lWm9uZSk7XG4gICAgY29uc3Qgb2Zmc2V0TXMgPSBEYXRlLlVUQyhwYXJ0cy55ZWFyLCBwYXJ0cy5tb250aCAtIDEsIHBhcnRzLmRheSwgcGFydHMuaG91ciwgcGFydHMubWludXRlLCBwYXJ0cy5zZWNvbmQpIC0gdXRjR3Vlc3MuZ2V0VGltZSgpO1xuICAgIHJldHVybiBuZXcgRGF0ZSh1dGNHdWVzcy5nZXRUaW1lKCkgLSBvZmZzZXRNcyk7XG59XG4iLCJleHBvcnQgY29uc3QgU1VCX1NDT1JFX01BWF9QT0lOVFMgPSB7XG4gICAgc2VjdGlvbkNvbXBsZXRlbmVzczogMTAsXG4gICAgYWN0aW9uVmVyYnM6IDE1LFxuICAgIHF1YW50aWZpZWRBY2hpZXZlbWVudHM6IDIwLFxuICAgIGtleXdvcmRNYXRjaDogMjUsXG4gICAgbGVuZ3RoOiAxMCxcbiAgICBzcGVsbGluZ0dyYW1tYXI6IDEwLFxuICAgIGF0c0ZyaWVuZGxpbmVzczogMTAsXG59O1xuZXhwb3J0IGNvbnN0IEFDVElPTl9WRVJCUyA9IFtcbiAgICBcImFjaGlldmVkXCIsXG4gICAgXCJhbmFseXplZFwiLFxuICAgIFwiYXJjaGl0ZWN0ZWRcIixcbiAgICBcImJ1aWx0XCIsXG4gICAgXCJjb2xsYWJvcmF0ZWRcIixcbiAgICBcImNyZWF0ZWRcIixcbiAgICBcImRlbGl2ZXJlZFwiLFxuICAgIFwiZGVzaWduZWRcIixcbiAgICBcImRldmVsb3BlZFwiLFxuICAgIFwiZHJvdmVcIixcbiAgICBcImltcHJvdmVkXCIsXG4gICAgXCJpbmNyZWFzZWRcIixcbiAgICBcImxhdW5jaGVkXCIsXG4gICAgXCJsZWRcIixcbiAgICBcIm1hbmFnZWRcIixcbiAgICBcIm1lbnRvcmVkXCIsXG4gICAgXCJvcHRpbWl6ZWRcIixcbiAgICBcInJlZHVjZWRcIixcbiAgICBcInJlc29sdmVkXCIsXG4gICAgXCJzaGlwcGVkXCIsXG4gICAgXCJzdHJlYW1saW5lZFwiLFxuICAgIFwic3VwcG9ydGVkXCIsXG4gICAgXCJ0cmFuc2Zvcm1lZFwiLFxuXTtcbmV4cG9ydCBjb25zdCBRVUFOVElGSUVEX1JFR0VYID0gL1xcZCslfFxcJFtcXGQsXSsoPzpcXC5cXGQrKT9ba0ttTWJCXT98XFxiXFxkK3hcXGJ8XFxidGVhbSBvZiBcXGQrXFxifFxcYlxcZCtcXHMrKHVzZXJzfGN1c3RvbWVyc3xjbGllbnRzfHByb2plY3RzfHBlb3BsZXxlbmdpbmVlcnN8cmVwb3J0c3xob3Vyc3xtZW1iZXJzfGNvdW50cmllc3xsYW5ndWFnZXN8c3RhdGVzfGNpdGllc3xzdG9yZXN8cGFydG5lcnN8ZGVhbHN8bGVhZHMpXFxiL2dpO1xuIiwiZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZVRleHQodGV4dCkge1xuICAgIHJldHVybiB0ZXh0XG4gICAgICAgIC50b0xvd2VyQ2FzZSgpXG4gICAgICAgIC5yZXBsYWNlKC9bXmEtejAtOSsjLlxccy8tXS9nLCBcIiBcIilcbiAgICAgICAgLnJlcGxhY2UoL1xccysvZywgXCIgXCIpXG4gICAgICAgIC50cmltKCk7XG59XG5leHBvcnQgZnVuY3Rpb24gZXNjYXBlUmVnRXhwKHN0cikge1xuICAgIHJldHVybiBzdHIucmVwbGFjZSgvWy4qKz9eJHt9KCl8W1xcXVxcXFxdL2csIFwiXFxcXCQmXCIpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHdvcmRCb3VuZGFyeVJlZ2V4KHRlcm0sIGZsYWdzID0gXCJcIikge1xuICAgIHJldHVybiBuZXcgUmVnRXhwKGBcXFxcYiR7ZXNjYXBlUmVnRXhwKHRlcm0pfVxcXFxiYCwgZmxhZ3MpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGNvbnRhaW5zV29yZCh0ZXh0LCB0ZXJtKSB7XG4gICAgcmV0dXJuIHdvcmRCb3VuZGFyeVJlZ2V4KHRlcm0pLnRlc3QodGV4dCk7XG59XG5leHBvcnQgZnVuY3Rpb24gY291bnRXb3JkT2NjdXJyZW5jZXModGV4dCwgdGVybSkge1xuICAgIHJldHVybiAodGV4dC5tYXRjaCh3b3JkQm91bmRhcnlSZWdleCh0ZXJtLCBcImdcIikpIHx8IFtdKS5sZW5ndGg7XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0SGlnaGxpZ2h0cyhwcm9maWxlKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgLi4ucHJvZmlsZS5leHBlcmllbmNlcy5mbGF0TWFwKChleHBlcmllbmNlKSA9PiBleHBlcmllbmNlLmhpZ2hsaWdodHMpLFxuICAgICAgICAuLi5wcm9maWxlLnByb2plY3RzLmZsYXRNYXAoKHByb2plY3QpID0+IHByb2plY3QuaGlnaGxpZ2h0cyksXG4gICAgXS5maWx0ZXIoQm9vbGVhbik7XG59XG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdFByb2ZpbGVUZXh0KHByb2ZpbGUpIHtcbiAgICBjb25zdCBwYXJ0cyA9IFtcbiAgICAgICAgcHJvZmlsZS5jb250YWN0Py5uYW1lLFxuICAgICAgICBwcm9maWxlLmNvbnRhY3Q/LmVtYWlsLFxuICAgICAgICBwcm9maWxlLmNvbnRhY3Q/LnBob25lLFxuICAgICAgICBwcm9maWxlLmNvbnRhY3Q/LmxvY2F0aW9uLFxuICAgICAgICBwcm9maWxlLmNvbnRhY3Q/LmxpbmtlZGluLFxuICAgICAgICBwcm9maWxlLmNvbnRhY3Q/LmdpdGh1YixcbiAgICAgICAgcHJvZmlsZS5jb250YWN0Py53ZWJzaXRlLFxuICAgICAgICBwcm9maWxlLmNvbnRhY3Q/LmhlYWRsaW5lLFxuICAgICAgICBwcm9maWxlLnN1bW1hcnksXG4gICAgICAgIC4uLnByb2ZpbGUuZXhwZXJpZW5jZXMuZmxhdE1hcCgoZXhwZXJpZW5jZSkgPT4gW1xuICAgICAgICAgICAgZXhwZXJpZW5jZS50aXRsZSxcbiAgICAgICAgICAgIGV4cGVyaWVuY2UuY29tcGFueSxcbiAgICAgICAgICAgIGV4cGVyaWVuY2UubG9jYXRpb24sXG4gICAgICAgICAgICBleHBlcmllbmNlLmRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgLi4uZXhwZXJpZW5jZS5oaWdobGlnaHRzLFxuICAgICAgICAgICAgLi4uZXhwZXJpZW5jZS5za2lsbHMsXG4gICAgICAgICAgICBleHBlcmllbmNlLnN0YXJ0RGF0ZSxcbiAgICAgICAgICAgIGV4cGVyaWVuY2UuZW5kRGF0ZSxcbiAgICAgICAgXSksXG4gICAgICAgIC4uLnByb2ZpbGUuZWR1Y2F0aW9uLmZsYXRNYXAoKGVkdWNhdGlvbikgPT4gW1xuICAgICAgICAgICAgZWR1Y2F0aW9uLmluc3RpdHV0aW9uLFxuICAgICAgICAgICAgZWR1Y2F0aW9uLmRlZ3JlZSxcbiAgICAgICAgICAgIGVkdWNhdGlvbi5maWVsZCxcbiAgICAgICAgICAgIC4uLmVkdWNhdGlvbi5oaWdobGlnaHRzLFxuICAgICAgICAgICAgZWR1Y2F0aW9uLnN0YXJ0RGF0ZSxcbiAgICAgICAgICAgIGVkdWNhdGlvbi5lbmREYXRlLFxuICAgICAgICBdKSxcbiAgICAgICAgLi4ucHJvZmlsZS5za2lsbHMubWFwKChza2lsbCkgPT4gc2tpbGwubmFtZSksXG4gICAgICAgIC4uLnByb2ZpbGUucHJvamVjdHMuZmxhdE1hcCgocHJvamVjdCkgPT4gW1xuICAgICAgICAgICAgcHJvamVjdC5uYW1lLFxuICAgICAgICAgICAgcHJvamVjdC5kZXNjcmlwdGlvbixcbiAgICAgICAgICAgIHByb2plY3QudXJsLFxuICAgICAgICAgICAgLi4ucHJvamVjdC5oaWdobGlnaHRzLFxuICAgICAgICAgICAgLi4ucHJvamVjdC50ZWNobm9sb2dpZXMsXG4gICAgICAgIF0pLFxuICAgICAgICAuLi5wcm9maWxlLmNlcnRpZmljYXRpb25zLmZsYXRNYXAoKGNlcnRpZmljYXRpb24pID0+IFtcbiAgICAgICAgICAgIGNlcnRpZmljYXRpb24ubmFtZSxcbiAgICAgICAgICAgIGNlcnRpZmljYXRpb24uaXNzdWVyLFxuICAgICAgICAgICAgY2VydGlmaWNhdGlvbi5kYXRlLFxuICAgICAgICAgICAgY2VydGlmaWNhdGlvbi51cmwsXG4gICAgICAgIF0pLFxuICAgIF07XG4gICAgcmV0dXJuIHBhcnRzLmZpbHRlcihCb29sZWFuKS5qb2luKFwiXFxuXCIpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldFJlc3VtZVRleHQocHJvZmlsZSwgcmF3VGV4dCkge1xuICAgIHJldHVybiAocmF3VGV4dD8udHJpbSgpIHx8IHByb2ZpbGUucmF3VGV4dD8udHJpbSgpIHx8IGV4dHJhY3RQcm9maWxlVGV4dChwcm9maWxlKSk7XG59XG5leHBvcnQgZnVuY3Rpb24gd29yZENvdW50KHRleHQpIHtcbiAgICBjb25zdCBub3JtYWxpemVkID0gbm9ybWFsaXplVGV4dCh0ZXh0KTtcbiAgICBpZiAoIW5vcm1hbGl6ZWQpXG4gICAgICAgIHJldHVybiAwO1xuICAgIHJldHVybiBub3JtYWxpemVkLnNwbGl0KC9cXHMrLykuZmlsdGVyKEJvb2xlYW4pLmxlbmd0aDtcbn1cbiIsImltcG9ydCB7IEFDVElPTl9WRVJCUywgU1VCX1NDT1JFX01BWF9QT0lOVFMgfSBmcm9tIFwiLi9jb25zdGFudHNcIjtcbmltcG9ydCB7IGdldEhpZ2hsaWdodHMsIG5vcm1hbGl6ZVRleHQsIHdvcmRCb3VuZGFyeVJlZ2V4IH0gZnJvbSBcIi4vdGV4dFwiO1xuZnVuY3Rpb24gcG9pbnRzRm9yRGlzdGluY3RWZXJicyhjb3VudCkge1xuICAgIGlmIChjb3VudCA9PT0gMClcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgaWYgKGNvdW50IDw9IDIpXG4gICAgICAgIHJldHVybiA1O1xuICAgIGlmIChjb3VudCA8PSA0KVxuICAgICAgICByZXR1cm4gOTtcbiAgICBpZiAoY291bnQgPD0gNylcbiAgICAgICAgcmV0dXJuIDEyO1xuICAgIHJldHVybiAxNTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBzY29yZUFjdGlvblZlcmJzKGlucHV0KSB7XG4gICAgY29uc3QgZGlzdGluY3RWZXJicyA9IG5ldyBTZXQoKTtcbiAgICBmb3IgKGNvbnN0IGhpZ2hsaWdodCBvZiBnZXRIaWdobGlnaHRzKGlucHV0LnByb2ZpbGUpKSB7XG4gICAgICAgIGNvbnN0IGZpcnN0V29yZCA9IG5vcm1hbGl6ZVRleHQoaGlnaGxpZ2h0KS5zcGxpdCgvXFxzKy8pWzBdID8/IFwiXCI7XG4gICAgICAgIGZvciAoY29uc3QgdmVyYiBvZiBBQ1RJT05fVkVSQlMpIHtcbiAgICAgICAgICAgIGlmICh3b3JkQm91bmRhcnlSZWdleCh2ZXJiKS50ZXN0KGZpcnN0V29yZCkpIHtcbiAgICAgICAgICAgICAgICBkaXN0aW5jdFZlcmJzLmFkZCh2ZXJiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCB2ZXJicyA9IEFycmF5LmZyb20oZGlzdGluY3RWZXJicykuc29ydCgpO1xuICAgIGNvbnN0IG5vdGVzID0gdmVyYnMubGVuZ3RoID09PSAwXG4gICAgICAgID8gW1wiU3RhcnQgYWNoaWV2ZW1lbnQgYnVsbGV0cyB3aXRoIHN0cm9uZyBhY3Rpb24gdmVyYnMuXCJdXG4gICAgICAgIDogW107XG4gICAgY29uc3QgcHJldmlldyA9IHZlcmJzLnNsaWNlKDAsIDUpLmpvaW4oXCIsIFwiKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBrZXk6IFwiYWN0aW9uVmVyYnNcIixcbiAgICAgICAgbGFiZWw6IFwiQWN0aW9uIHZlcmJzXCIsXG4gICAgICAgIGVhcm5lZDogcG9pbnRzRm9yRGlzdGluY3RWZXJicyh2ZXJicy5sZW5ndGgpLFxuICAgICAgICBtYXhQb2ludHM6IFNVQl9TQ09SRV9NQVhfUE9JTlRTLmFjdGlvblZlcmJzLFxuICAgICAgICBub3RlcyxcbiAgICAgICAgZXZpZGVuY2U6IFtcbiAgICAgICAgICAgIHByZXZpZXdcbiAgICAgICAgICAgICAgICA/IGAke3ZlcmJzLmxlbmd0aH0gZGlzdGluY3QgYWN0aW9uIHZlcmJzICgke3ByZXZpZXd9KWBcbiAgICAgICAgICAgICAgICA6IFwiMCBkaXN0aW5jdCBhY3Rpb24gdmVyYnNcIixcbiAgICAgICAgXSxcbiAgICB9O1xufVxuIiwiZXhwb3J0IGNvbnN0IFBST0JMRU1BVElDX0NIQVJBQ1RFUlMgPSBbXG4gICAgeyBjaGFyOiBcIlxcdTIwMjJcIiwgbmFtZTogXCJidWxsZXQgcG9pbnRcIiwgcmVwbGFjZW1lbnQ6IFwiLVwiIH0sXG4gICAgeyBjaGFyOiBcIlxcdTIwMTNcIiwgbmFtZTogXCJlbiBkYXNoXCIsIHJlcGxhY2VtZW50OiBcIi1cIiB9LFxuICAgIHsgY2hhcjogXCJcXHUyMDE0XCIsIG5hbWU6IFwiZW0gZGFzaFwiLCByZXBsYWNlbWVudDogXCItXCIgfSxcbiAgICB7IGNoYXI6IFwiXFx1MjAxY1wiLCBuYW1lOiBcImN1cmx5IHF1b3RlIGxlZnRcIiwgcmVwbGFjZW1lbnQ6ICdcIicgfSxcbiAgICB7IGNoYXI6IFwiXFx1MjAxZFwiLCBuYW1lOiBcImN1cmx5IHF1b3RlIHJpZ2h0XCIsIHJlcGxhY2VtZW50OiAnXCInIH0sXG4gICAgeyBjaGFyOiBcIlxcdTIwMThcIiwgbmFtZTogXCJjdXJseSBhcG9zdHJvcGhlIGxlZnRcIiwgcmVwbGFjZW1lbnQ6IFwiJ1wiIH0sXG4gICAgeyBjaGFyOiBcIlxcdTIwMTlcIiwgbmFtZTogXCJjdXJseSBhcG9zdHJvcGhlIHJpZ2h0XCIsIHJlcGxhY2VtZW50OiBcIidcIiB9LFxuICAgIHsgY2hhcjogXCJcXHUyMDI2XCIsIG5hbWU6IFwiZWxsaXBzaXNcIiwgcmVwbGFjZW1lbnQ6IFwiLi4uXCIgfSxcbiAgICB7IGNoYXI6IFwiXFx1MDBhOVwiLCBuYW1lOiBcImNvcHlyaWdodFwiLCByZXBsYWNlbWVudDogXCIoYylcIiB9LFxuICAgIHsgY2hhcjogXCJcXHUwMGFlXCIsIG5hbWU6IFwicmVnaXN0ZXJlZFwiLCByZXBsYWNlbWVudDogXCIoUilcIiB9LFxuICAgIHsgY2hhcjogXCJcXHUyMTIyXCIsIG5hbWU6IFwidHJhZGVtYXJrXCIsIHJlcGxhY2VtZW50OiBcIihUTSlcIiB9LFxuXTtcbiIsImltcG9ydCB7IFBST0JMRU1BVElDX0NIQVJBQ1RFUlMgfSBmcm9tIFwiLi9hdHMtY2hhcmFjdGVyc1wiO1xuaW1wb3J0IHsgU1VCX1NDT1JFX01BWF9QT0lOVFMgfSBmcm9tIFwiLi9jb25zdGFudHNcIjtcbmltcG9ydCB7IGdldFJlc3VtZVRleHQgfSBmcm9tIFwiLi90ZXh0XCI7XG5leHBvcnQgZnVuY3Rpb24gc2NvcmVBdHNGcmllbmRsaW5lc3MoaW5wdXQpIHtcbiAgICBjb25zdCB0ZXh0ID0gZ2V0UmVzdW1lVGV4dChpbnB1dC5wcm9maWxlLCBpbnB1dC5yYXdUZXh0KTtcbiAgICBjb25zdCByYXdUZXh0ID0gaW5wdXQucmF3VGV4dCA/PyBpbnB1dC5wcm9maWxlLnJhd1RleHQgPz8gXCJcIjtcbiAgICBjb25zdCBub3RlcyA9IFtdO1xuICAgIGNvbnN0IGV2aWRlbmNlID0gW107XG4gICAgbGV0IGRlZHVjdGlvbnMgPSAwO1xuICAgIGNvbnN0IGZvdW5kUHJvYmxlbWF0aWMgPSBQUk9CTEVNQVRJQ19DSEFSQUNURVJTLmZpbHRlcigoeyBjaGFyIH0pID0+IHRleHQuaW5jbHVkZXMoY2hhcikpO1xuICAgIGlmIChmb3VuZFByb2JsZW1hdGljLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgcGVuYWx0eSA9IE1hdGgubWluKDMsIGZvdW5kUHJvYmxlbWF0aWMubGVuZ3RoKTtcbiAgICAgICAgZGVkdWN0aW9ucyArPSBwZW5hbHR5O1xuICAgICAgICBub3Rlcy5wdXNoKFwiU3BlY2lhbCBmb3JtYXR0aW5nIGNoYXJhY3RlcnMgY2FuIHJlZHVjZSBBVFMgcGFyc2UgcXVhbGl0eS5cIik7XG4gICAgICAgIGV2aWRlbmNlLnB1c2goYCR7Zm91bmRQcm9ibGVtYXRpYy5sZW5ndGh9IHNwZWNpYWwgY2hhcmFjdGVyc2ApO1xuICAgIH1cbiAgICBjb25zdCBiYWRDaGFycyA9ICh0ZXh0Lm1hdGNoKC9bXFx1RkZGRFxcdTAwMDAtXFx1MDAwOFxcdTAwMEJcXHUwMDBDXFx1MDAwRS1cXHUwMDFGXS9nKSB8fCBbXSkubGVuZ3RoO1xuICAgIGlmIChiYWRDaGFycyA+IDApIHtcbiAgICAgICAgZGVkdWN0aW9ucyArPSAyO1xuICAgICAgICBub3Rlcy5wdXNoKFwiQ29udHJvbCBvciByZXBsYWNlbWVudCBjaGFyYWN0ZXJzIGRldGVjdGVkLlwiKTtcbiAgICAgICAgZXZpZGVuY2UucHVzaChgJHtiYWRDaGFyc30gY29udHJvbCBvciByZXBsYWNlbWVudCBjaGFyYWN0ZXIocylgKTtcbiAgICB9XG4gICAgaWYgKHJhd1RleHQuaW5jbHVkZXMoXCJcXHRcIikpIHtcbiAgICAgICAgZGVkdWN0aW9ucyArPSAyO1xuICAgICAgICBub3Rlcy5wdXNoKFwiVGFiIGNoYXJhY3RlcnMgbWF5IGluZGljYXRlIHRhYmxlLXN0eWxlIGZvcm1hdHRpbmcuXCIpO1xuICAgICAgICBldmlkZW5jZS5wdXNoKFwiVGFiIGNoYXJhY3RlcnMgZm91bmRcIik7XG4gICAgfVxuICAgIGNvbnN0IGxvbmdMaW5lcyA9IHJhd1RleHQuc3BsaXQoL1xccj9cXG4vKS5maWx0ZXIoKGxpbmUpID0+IGxpbmUubGVuZ3RoID4gMjAwKTtcbiAgICBpZiAobG9uZ0xpbmVzLmxlbmd0aCA+PSA0KSB7XG4gICAgICAgIGRlZHVjdGlvbnMgKz0gMjtcbiAgICAgICAgbm90ZXMucHVzaChcIlZlcnkgbG9uZyBsaW5lcyBtYXkgaW5kaWNhdGUgbXVsdGktY29sdW1uIG9yIHRhYmxlIGZvcm1hdHRpbmcuXCIpO1xuICAgICAgICBldmlkZW5jZS5wdXNoKGAke2xvbmdMaW5lcy5sZW5ndGh9IG92ZXItbG9uZyBsaW5lc2ApO1xuICAgIH1cbiAgICBpZiAoLzxbYS16QS1aL11bXj5dKj4vLnRlc3QocmF3VGV4dCkpIHtcbiAgICAgICAgZGVkdWN0aW9ucyArPSAyO1xuICAgICAgICBub3Rlcy5wdXNoKFwiSFRNTCB0YWdzIGRldGVjdGVkIGluIHJlc3VtZSB0ZXh0LlwiKTtcbiAgICAgICAgZXZpZGVuY2UucHVzaChcIkhUTUwgdGFncyBmb3VuZFwiKTtcbiAgICB9XG4gICAgaWYgKCEvW1xcdy4rLV0rQFtcXHcuLV0rXFwuW2EtekEtWl17Mix9Ly50ZXN0KHRleHQpKSB7XG4gICAgICAgIGRlZHVjdGlvbnMgKz0gMjtcbiAgICAgICAgbm90ZXMucHVzaChcIk5vIGVtYWlsIHBhdHRlcm4gZGV0ZWN0ZWQgaW4gcGFyc2VhYmxlIHJlc3VtZSB0ZXh0LlwiKTtcbiAgICAgICAgZXZpZGVuY2UucHVzaChcIk5vIGVtYWlsIGRldGVjdGVkXCIpO1xuICAgIH1cbiAgICBpZiAoaW5wdXQucmF3VGV4dCAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgIGlucHV0LnJhd1RleHQudHJpbSgpLmxlbmd0aCA8IDIwMCAmJlxuICAgICAgICBpbnB1dC5wcm9maWxlLmV4cGVyaWVuY2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgZGVkdWN0aW9ucyArPSAzO1xuICAgICAgICBub3Rlcy5wdXNoKFwiRXh0cmFjdGVkIHRleHQgaXMgdmVyeSBzaG9ydCBmb3IgYSByZXN1bWUgd2l0aCBleHBlcmllbmNlLlwiKTtcbiAgICAgICAgZXZpZGVuY2UucHVzaChcIlBvc3NpYmxlIGltYWdlLW9ubHkgUERGXCIpO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBrZXk6IFwiYXRzRnJpZW5kbGluZXNzXCIsXG4gICAgICAgIGxhYmVsOiBcIkFUUyBmcmllbmRsaW5lc3NcIixcbiAgICAgICAgZWFybmVkOiBNYXRoLm1heCgwLCBTVUJfU0NPUkVfTUFYX1BPSU5UUy5hdHNGcmllbmRsaW5lc3MgLSBkZWR1Y3Rpb25zKSxcbiAgICAgICAgbWF4UG9pbnRzOiBTVUJfU0NPUkVfTUFYX1BPSU5UUy5hdHNGcmllbmRsaW5lc3MsXG4gICAgICAgIG5vdGVzLFxuICAgICAgICBldmlkZW5jZTogZXZpZGVuY2UubGVuZ3RoID4gMCA/IGV2aWRlbmNlIDogW1wiTm8gQVRTIGZvcm1hdHRpbmcgaXNzdWVzIGRldGVjdGVkLlwiXSxcbiAgICB9O1xufVxuIiwiLyoqXG4gKiBTeW5vbnltIGdyb3VwcyBmb3Igc2VtYW50aWMga2V5d29yZCBtYXRjaGluZyBpbiBBVFMgc2NvcmluZy5cbiAqIEVhY2ggZ3JvdXAgbWFwcyBhIGNhbm9uaWNhbCB0ZXJtIHRvIGl0cyBzeW5vbnltcy92YXJpYXRpb25zLlxuICogQWxsIHRlcm1zIHNob3VsZCBiZSBsb3dlcmNhc2UuXG4gKi9cbmV4cG9ydCBjb25zdCBTWU5PTllNX0dST1VQUyA9IFtcbiAgICAvLyBQcm9ncmFtbWluZyBMYW5ndWFnZXNcbiAgICB7IGNhbm9uaWNhbDogXCJqYXZhc2NyaXB0XCIsIHN5bm9ueW1zOiBbXCJqc1wiLCBcImVjbWFzY3JpcHRcIiwgXCJlczZcIiwgXCJlczIwMTVcIl0gfSxcbiAgICB7IGNhbm9uaWNhbDogXCJ0eXBlc2NyaXB0XCIsIHN5bm9ueW1zOiBbXCJ0c1wiXSB9LFxuICAgIHsgY2Fub25pY2FsOiBcInB5dGhvblwiLCBzeW5vbnltczogW1wicHlcIiwgXCJweXRob24zXCJdIH0sXG4gICAgeyBjYW5vbmljYWw6IFwiZ29sYW5nXCIsIHN5bm9ueW1zOiBbXCJnb1wiXSB9LFxuICAgIHsgY2Fub25pY2FsOiBcImMjXCIsIHN5bm9ueW1zOiBbXCJjc2hhcnBcIiwgXCJjIHNoYXJwXCIsIFwiZG90bmV0XCIsIFwiLm5ldFwiXSB9LFxuICAgIHsgY2Fub25pY2FsOiBcImMrK1wiLCBzeW5vbnltczogW1wiY3BwXCIsIFwiY3BsdXNwbHVzXCJdIH0sXG4gICAgeyBjYW5vbmljYWw6IFwicnVieVwiLCBzeW5vbnltczogW1wicmJcIl0gfSxcbiAgICB7IGNhbm9uaWNhbDogXCJrb3RsaW5cIiwgc3lub255bXM6IFtcImt0XCJdIH0sXG4gICAgeyBjYW5vbmljYWw6IFwib2JqZWN0aXZlLWNcIiwgc3lub255bXM6IFtcIm9iamNcIiwgXCJvYmotY1wiXSB9LFxuICAgIC8vIEZyb250ZW5kIEZyYW1ld29ya3NcbiAgICB7IGNhbm9uaWNhbDogXCJyZWFjdFwiLCBzeW5vbnltczogW1wicmVhY3Rqc1wiLCBcInJlYWN0LmpzXCIsIFwicmVhY3QganNcIl0gfSxcbiAgICB7IGNhbm9uaWNhbDogXCJhbmd1bGFyXCIsIHN5bm9ueW1zOiBbXCJhbmd1bGFyanNcIiwgXCJhbmd1bGFyLmpzXCIsIFwiYW5ndWxhciBqc1wiXSB9LFxuICAgIHsgY2Fub25pY2FsOiBcInZ1ZVwiLCBzeW5vbnltczogW1widnVlanNcIiwgXCJ2dWUuanNcIiwgXCJ2dWUganNcIl0gfSxcbiAgICB7IGNhbm9uaWNhbDogXCJuZXh0LmpzXCIsIHN5bm9ueW1zOiBbXCJuZXh0anNcIiwgXCJuZXh0IGpzXCIsIFwibmV4dFwiXSB9LFxuICAgIHsgY2Fub25pY2FsOiBcIm51eHRcIiwgc3lub255bXM6IFtcIm51eHRqc1wiLCBcIm51eHQuanNcIl0gfSxcbiAgICB7IGNhbm9uaWNhbDogXCJzdmVsdGVcIiwgc3lub255bXM6IFtcInN2ZWx0ZWpzXCIsIFwic3ZlbHRla2l0XCJdIH0sXG4gICAgLy8gQmFja2VuZCBGcmFtZXdvcmtzXG4gICAgeyBjYW5vbmljYWw6IFwibm9kZS5qc1wiLCBzeW5vbnltczogW1wibm9kZWpzXCIsIFwibm9kZSBqc1wiLCBcIm5vZGVcIl0gfSxcbiAgICB7IGNhbm9uaWNhbDogXCJleHByZXNzXCIsIHN5bm9ueW1zOiBbXCJleHByZXNzanNcIiwgXCJleHByZXNzLmpzXCJdIH0sXG4gICAgeyBjYW5vbmljYWw6IFwiZGphbmdvXCIsIHN5bm9ueW1zOiBbXCJkamFuZ28gcmVzdCBmcmFtZXdvcmtcIiwgXCJkcmZcIl0gfSxcbiAgICB7IGNhbm9uaWNhbDogXCJmbGFza1wiLCBzeW5vbnltczogW1wiZmxhc2sgcHl0aG9uXCJdIH0sXG4gICAgeyBjYW5vbmljYWw6IFwic3ByaW5nXCIsIHN5bm9ueW1zOiBbXCJzcHJpbmcgYm9vdFwiLCBcInNwcmluZ2Jvb3RcIl0gfSxcbiAgICB7IGNhbm9uaWNhbDogXCJydWJ5IG9uIHJhaWxzXCIsIHN5bm9ueW1zOiBbXCJyYWlsc1wiLCBcInJvclwiXSB9LFxuICAgIHsgY2Fub25pY2FsOiBcImZhc3RhcGlcIiwgc3lub255bXM6IFtcImZhc3QgYXBpXCJdIH0sXG4gICAgLy8gRGF0YWJhc2VzXG4gICAgeyBjYW5vbmljYWw6IFwicG9zdGdyZXNxbFwiLCBzeW5vbnltczogW1wicG9zdGdyZXNcIiwgXCJwc3FsXCIsIFwicGdcIl0gfSxcbiAgICB7IGNhbm9uaWNhbDogXCJtb25nb2RiXCIsIHN5bm9ueW1zOiBbXCJtb25nb1wiXSB9LFxuICAgIHsgY2Fub25pY2FsOiBcIm15c3FsXCIsIHN5bm9ueW1zOiBbXCJtYXJpYWRiXCJdIH0sXG4gICAgeyBjYW5vbmljYWw6IFwiZHluYW1vZGJcIiwgc3lub255bXM6IFtcImR5bmFtbyBkYlwiLCBcImR5bmFtb1wiXSB9LFxuICAgIHsgY2Fub25pY2FsOiBcImVsYXN0aWNzZWFyY2hcIiwgc3lub255bXM6IFtcImVsYXN0aWMgc2VhcmNoXCIsIFwiZWxhc3RpY1wiLCBcImVzXCJdIH0sXG4gICAgeyBjYW5vbmljYWw6IFwicmVkaXNcIiwgc3lub255bXM6IFtcInJlZGlzIGNhY2hlXCJdIH0sXG4gICAgeyBjYW5vbmljYWw6IFwic3FsXCIsIHN5bm9ueW1zOiBbXCJzdHJ1Y3R1cmVkIHF1ZXJ5IGxhbmd1YWdlXCJdIH0sXG4gICAgeyBjYW5vbmljYWw6IFwibm9zcWxcIiwgc3lub255bXM6IFtcIm5vIHNxbFwiLCBcIm5vbi1yZWxhdGlvbmFsXCJdIH0sXG4gICAgLy8gQ2xvdWQgJiBJbmZyYXN0cnVjdHVyZVxuICAgIHsgY2Fub25pY2FsOiBcImF3c1wiLCBzeW5vbnltczogW1wiYW1hem9uIHdlYiBzZXJ2aWNlc1wiLCBcImFtYXpvbiBjbG91ZFwiXSB9LFxuICAgIHsgY2Fub25pY2FsOiBcImdjcFwiLCBzeW5vbnltczogW1wiZ29vZ2xlIGNsb3VkXCIsIFwiZ29vZ2xlIGNsb3VkIHBsYXRmb3JtXCJdIH0sXG4gICAgeyBjYW5vbmljYWw6IFwiYXp1cmVcIiwgc3lub255bXM6IFtcIm1pY3Jvc29mdCBhenVyZVwiLCBcIm1zIGF6dXJlXCJdIH0sXG4gICAgeyBjYW5vbmljYWw6IFwiZG9ja2VyXCIsIHN5bm9ueW1zOiBbXCJjb250YWluZXJpemF0aW9uXCIsIFwiY29udGFpbmVyc1wiXSB9LFxuICAgIHsgY2Fub25pY2FsOiBcImt1YmVybmV0ZXNcIiwgc3lub255bXM6IFtcIms4c1wiLCBcImt1YmVcIl0gfSxcbiAgICB7IGNhbm9uaWNhbDogXCJ0ZXJyYWZvcm1cIiwgc3lub255bXM6IFtcImluZnJhc3RydWN0dXJlIGFzIGNvZGVcIiwgXCJpYWNcIl0gfSxcbiAgICB7XG4gICAgICAgIGNhbm9uaWNhbDogXCJjaS9jZFwiLFxuICAgICAgICBzeW5vbnltczogW1xuICAgICAgICAgICAgXCJjaWNkXCIsXG4gICAgICAgICAgICBcImNpIGNkXCIsXG4gICAgICAgICAgICBcImNvbnRpbnVvdXMgaW50ZWdyYXRpb25cIixcbiAgICAgICAgICAgIFwiY29udGludW91cyBkZXBsb3ltZW50XCIsXG4gICAgICAgICAgICBcImNvbnRpbnVvdXMgZGVsaXZlcnlcIixcbiAgICAgICAgXSxcbiAgICB9LFxuICAgIHsgY2Fub25pY2FsOiBcImRldm9wc1wiLCBzeW5vbnltczogW1wiZGV2IG9wc1wiLCBcInNpdGUgcmVsaWFiaWxpdHlcIiwgXCJzcmVcIl0gfSxcbiAgICAvLyBUb29scyAmIFBsYXRmb3Jtc1xuICAgIHtcbiAgICAgICAgY2Fub25pY2FsOiBcImdpdFwiLFxuICAgICAgICBzeW5vbnltczogW1wiZ2l0aHViXCIsIFwiZ2l0bGFiXCIsIFwiYml0YnVja2V0XCIsIFwidmVyc2lvbiBjb250cm9sXCJdLFxuICAgIH0sXG4gICAgeyBjYW5vbmljYWw6IFwiamlyYVwiLCBzeW5vbnltczogW1wiYXRsYXNzaWFuIGppcmFcIl0gfSxcbiAgICB7IGNhbm9uaWNhbDogXCJmaWdtYVwiLCBzeW5vbnltczogW1wiZmlnbWEgZGVzaWduXCJdIH0sXG4gICAgeyBjYW5vbmljYWw6IFwid2VicGFja1wiLCBzeW5vbnltczogW1wibW9kdWxlIGJ1bmRsZXJcIl0gfSxcbiAgICB7IGNhbm9uaWNhbDogXCJncmFwaHFsXCIsIHN5bm9ueW1zOiBbXCJncmFwaCBxbFwiLCBcImdxbFwiXSB9LFxuICAgIHtcbiAgICAgICAgY2Fub25pY2FsOiBcInJlc3QgYXBpXCIsXG4gICAgICAgIHN5bm9ueW1zOiBbXCJyZXN0ZnVsXCIsIFwicmVzdGZ1bCBhcGlcIiwgXCJyZXN0XCIsIFwiYXBpXCJdLFxuICAgIH0sXG4gICAgLy8gUm9sZSBUZXJtc1xuICAgIHtcbiAgICAgICAgY2Fub25pY2FsOiBcImZyb250ZW5kXCIsXG4gICAgICAgIHN5bm9ueW1zOiBbXG4gICAgICAgICAgICBcImZyb250LWVuZFwiLFxuICAgICAgICAgICAgXCJmcm9udCBlbmRcIixcbiAgICAgICAgICAgIFwiY2xpZW50LXNpZGVcIixcbiAgICAgICAgICAgIFwiY2xpZW50IHNpZGVcIixcbiAgICAgICAgICAgIFwidWkgZGV2ZWxvcG1lbnRcIixcbiAgICAgICAgXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgY2Fub25pY2FsOiBcImJhY2tlbmRcIixcbiAgICAgICAgc3lub255bXM6IFtcImJhY2stZW5kXCIsIFwiYmFjayBlbmRcIiwgXCJzZXJ2ZXItc2lkZVwiLCBcInNlcnZlciBzaWRlXCJdLFxuICAgIH0sXG4gICAgeyBjYW5vbmljYWw6IFwiZnVsbHN0YWNrXCIsIHN5bm9ueW1zOiBbXCJmdWxsLXN0YWNrXCIsIFwiZnVsbCBzdGFja1wiXSB9LFxuICAgIHtcbiAgICAgICAgY2Fub25pY2FsOiBcInNvZnR3YXJlIGVuZ2luZWVyXCIsXG4gICAgICAgIHN5bm9ueW1zOiBbXCJzb2Z0d2FyZSBkZXZlbG9wZXJcIiwgXCJzd2VcIiwgXCJkZXZlbG9wZXJcIiwgXCJwcm9ncmFtbWVyXCIsIFwiY29kZXJcIl0sXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGNhbm9uaWNhbDogXCJkYXRhIHNjaWVudGlzdFwiLFxuICAgICAgICBzeW5vbnltczogW1wiZGF0YSBzY2llbmNlXCIsIFwibWwgZW5naW5lZXJcIiwgXCJtYWNoaW5lIGxlYXJuaW5nIGVuZ2luZWVyXCJdLFxuICAgIH0sXG4gICAge1xuICAgICAgICBjYW5vbmljYWw6IFwiZGF0YSBlbmdpbmVlclwiLFxuICAgICAgICBzeW5vbnltczogW1wiZGF0YSBlbmdpbmVlcmluZ1wiLCBcImV0bCBkZXZlbG9wZXJcIl0sXG4gICAgfSxcbiAgICB7IGNhbm9uaWNhbDogXCJwcm9kdWN0IG1hbmFnZXJcIiwgc3lub255bXM6IFtcInBtXCIsIFwicHJvZHVjdCBvd25lclwiLCBcInBvXCJdIH0sXG4gICAge1xuICAgICAgICBjYW5vbmljYWw6IFwicWEgZW5naW5lZXJcIixcbiAgICAgICAgc3lub255bXM6IFtcInF1YWxpdHkgYXNzdXJhbmNlXCIsIFwicWFcIiwgXCJ0ZXN0IGVuZ2luZWVyXCIsIFwic2RldFwiXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgY2Fub25pY2FsOiBcInV4IGRlc2lnbmVyXCIsXG4gICAgICAgIHN5bm9ueW1zOiBbXCJ1eFwiLCBcInVzZXIgZXhwZXJpZW5jZVwiLCBcInVpL3V4XCIsIFwidWkgdXhcIl0sXG4gICAgfSxcbiAgICAvLyBNZXRob2RvbG9naWVzXG4gICAgeyBjYW5vbmljYWw6IFwiYWdpbGVcIiwgc3lub255bXM6IFtcInNjcnVtXCIsIFwia2FuYmFuXCIsIFwic3ByaW50XCIsIFwic3ByaW50c1wiXSB9LFxuICAgIHtcbiAgICAgICAgY2Fub25pY2FsOiBcInRkZFwiLFxuICAgICAgICBzeW5vbnltczogW1widGVzdCBkcml2ZW4gZGV2ZWxvcG1lbnRcIiwgXCJ0ZXN0LWRyaXZlbiBkZXZlbG9wbWVudFwiXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgY2Fub25pY2FsOiBcImJkZFwiLFxuICAgICAgICBzeW5vbnltczogW1wiYmVoYXZpb3IgZHJpdmVuIGRldmVsb3BtZW50XCIsIFwiYmVoYXZpb3ItZHJpdmVuIGRldmVsb3BtZW50XCJdLFxuICAgIH0sXG4gICAge1xuICAgICAgICBjYW5vbmljYWw6IFwibWljcm9zZXJ2aWNlc1wiLFxuICAgICAgICBzeW5vbnltczogW1wibWljcm8gc2VydmljZXNcIiwgXCJtaWNyby1zZXJ2aWNlc1wiLCBcInNlcnZpY2Utb3JpZW50ZWRcIl0sXG4gICAgfSxcbiAgICAvLyBTb2Z0IFNraWxsc1xuICAgIHtcbiAgICAgICAgY2Fub25pY2FsOiBcImxlYWRlcnNoaXBcIixcbiAgICAgICAgc3lub255bXM6IFtcbiAgICAgICAgICAgIFwibGVkXCIsXG4gICAgICAgICAgICBcIm1hbmFnZWRcIixcbiAgICAgICAgICAgIFwiZGlyZWN0ZWRcIixcbiAgICAgICAgICAgIFwic3VwZXJ2aXNlZFwiLFxuICAgICAgICAgICAgXCJtZW50b3JlZFwiLFxuICAgICAgICAgICAgXCJ0ZWFtIGxlYWRcIixcbiAgICAgICAgXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgY2Fub25pY2FsOiBcImNvbW11bmljYXRpb25cIixcbiAgICAgICAgc3lub255bXM6IFtcImNvbW11bmljYXRlZFwiLCBcInByZXNlbnRlZFwiLCBcInB1YmxpYyBzcGVha2luZ1wiLCBcImludGVycGVyc29uYWxcIl0sXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGNhbm9uaWNhbDogXCJjb2xsYWJvcmF0aW9uXCIsXG4gICAgICAgIHN5bm9ueW1zOiBbXG4gICAgICAgICAgICBcImNvbGxhYm9yYXRlZFwiLFxuICAgICAgICAgICAgXCJ0ZWFtd29ya1wiLFxuICAgICAgICAgICAgXCJjcm9zcy1mdW5jdGlvbmFsXCIsXG4gICAgICAgICAgICBcImNyb3NzIGZ1bmN0aW9uYWxcIixcbiAgICAgICAgXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgY2Fub25pY2FsOiBcInByb2JsZW0gc29sdmluZ1wiLFxuICAgICAgICBzeW5vbnltczogW1wicHJvYmxlbS1zb2x2aW5nXCIsIFwidHJvdWJsZXNob290aW5nXCIsIFwiZGVidWdnaW5nXCIsIFwiYW5hbHl0aWNhbFwiXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgY2Fub25pY2FsOiBcInByb2plY3QgbWFuYWdlbWVudFwiLFxuICAgICAgICBzeW5vbnltczogW1xuICAgICAgICAgICAgXCJwcm9qZWN0LW1hbmFnZW1lbnRcIixcbiAgICAgICAgICAgIFwicHJvZ3JhbSBtYW5hZ2VtZW50XCIsXG4gICAgICAgICAgICBcInN0YWtlaG9sZGVyIG1hbmFnZW1lbnRcIixcbiAgICAgICAgXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgY2Fub25pY2FsOiBcInRpbWUgbWFuYWdlbWVudFwiLFxuICAgICAgICBzeW5vbnltczogW1widGltZS1tYW5hZ2VtZW50XCIsIFwicHJpb3JpdGl6YXRpb25cIiwgXCJvcmdhbml6YXRpb25cIl0sXG4gICAgfSxcbiAgICB7IGNhbm9uaWNhbDogXCJtZW50b3JpbmdcIiwgc3lub255bXM6IFtcImNvYWNoaW5nXCIsIFwidHJhaW5pbmdcIiwgXCJvbmJvYXJkaW5nXCJdIH0sXG4gICAgLy8gRGF0YSAmIE1MXG4gICAge1xuICAgICAgICBjYW5vbmljYWw6IFwibWFjaGluZSBsZWFybmluZ1wiLFxuICAgICAgICBzeW5vbnltczogW1wibWxcIiwgXCJkZWVwIGxlYXJuaW5nXCIsIFwiZGxcIiwgXCJhaVwiLCBcImFydGlmaWNpYWwgaW50ZWxsaWdlbmNlXCJdLFxuICAgIH0sXG4gICAge1xuICAgICAgICBjYW5vbmljYWw6IFwibmxwXCIsXG4gICAgICAgIHN5bm9ueW1zOiBbXCJuYXR1cmFsIGxhbmd1YWdlIHByb2Nlc3NpbmdcIiwgXCJ0ZXh0IHByb2Nlc3NpbmdcIl0sXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGNhbm9uaWNhbDogXCJjb21wdXRlciB2aXNpb25cIixcbiAgICAgICAgc3lub255bXM6IFtcImN2XCIsIFwiaW1hZ2UgcmVjb2duaXRpb25cIiwgXCJpbWFnZSBwcm9jZXNzaW5nXCJdLFxuICAgIH0sXG4gICAgeyBjYW5vbmljYWw6IFwidGVuc29yZmxvd1wiLCBzeW5vbnltczogW1wia2VyYXNcIl0gfSxcbiAgICB7IGNhbm9uaWNhbDogXCJweXRvcmNoXCIsIHN5bm9ueW1zOiBbXCJ0b3JjaFwiXSB9LFxuICAgIC8vIFRlc3RpbmdcbiAgICB7XG4gICAgICAgIGNhbm9uaWNhbDogXCJ1bml0IHRlc3RpbmdcIixcbiAgICAgICAgc3lub255bXM6IFtcInVuaXQgdGVzdHNcIiwgXCJqZXN0XCIsIFwibW9jaGFcIiwgXCJ2aXRlc3RcIiwgXCJweXRlc3RcIl0sXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGNhbm9uaWNhbDogXCJpbnRlZ3JhdGlvbiB0ZXN0aW5nXCIsXG4gICAgICAgIHN5bm9ueW1zOiBbXG4gICAgICAgICAgICBcImludGVncmF0aW9uIHRlc3RzXCIsXG4gICAgICAgICAgICBcImUyZSB0ZXN0aW5nXCIsXG4gICAgICAgICAgICBcImVuZC10by1lbmQgdGVzdGluZ1wiLFxuICAgICAgICAgICAgXCJlbmQgdG8gZW5kXCIsXG4gICAgICAgIF0sXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGNhbm9uaWNhbDogXCJhdXRvbWF0aW9uIHRlc3RpbmdcIixcbiAgICAgICAgc3lub255bXM6IFtcbiAgICAgICAgICAgIFwidGVzdCBhdXRvbWF0aW9uXCIsXG4gICAgICAgICAgICBcImF1dG9tYXRlZCB0ZXN0aW5nXCIsXG4gICAgICAgICAgICBcInNlbGVuaXVtXCIsXG4gICAgICAgICAgICBcImN5cHJlc3NcIixcbiAgICAgICAgICAgIFwicGxheXdyaWdodFwiLFxuICAgICAgICBdLFxuICAgIH0sXG4gICAgLy8gU2VjdXJpdHlcbiAgICB7XG4gICAgICAgIGNhbm9uaWNhbDogXCJjeWJlcnNlY3VyaXR5XCIsXG4gICAgICAgIHN5bm9ueW1zOiBbXCJjeWJlciBzZWN1cml0eVwiLCBcImluZm9ybWF0aW9uIHNlY3VyaXR5XCIsIFwiaW5mb3NlY1wiXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgY2Fub25pY2FsOiBcImF1dGhlbnRpY2F0aW9uXCIsXG4gICAgICAgIHN5bm9ueW1zOiBbXCJhdXRoXCIsIFwib2F1dGhcIiwgXCJzc29cIiwgXCJzaW5nbGUgc2lnbi1vblwiXSxcbiAgICB9LFxuICAgIC8vIE1vYmlsZVxuICAgIHsgY2Fub25pY2FsOiBcImlvc1wiLCBzeW5vbnltczogW1wic3dpZnRcIiwgXCJhcHBsZSBkZXZlbG9wbWVudFwiXSB9LFxuICAgIHsgY2Fub25pY2FsOiBcImFuZHJvaWRcIiwgc3lub255bXM6IFtcImFuZHJvaWQgZGV2ZWxvcG1lbnRcIiwgXCJrb3RsaW4gYW5kcm9pZFwiXSB9LFxuICAgIHsgY2Fub25pY2FsOiBcInJlYWN0IG5hdGl2ZVwiLCBzeW5vbnltczogW1wicmVhY3QtbmF0aXZlXCIsIFwicm5cIl0gfSxcbiAgICB7IGNhbm9uaWNhbDogXCJmbHV0dGVyXCIsIHN5bm9ueW1zOiBbXCJkYXJ0XCJdIH0sXG4gICAgLy8gQnVzaW5lc3MgJiBBbmFseXRpY3NcbiAgICB7XG4gICAgICAgIGNhbm9uaWNhbDogXCJidXNpbmVzcyBpbnRlbGxpZ2VuY2VcIixcbiAgICAgICAgc3lub255bXM6IFtcImJpXCIsIFwidGFibGVhdVwiLCBcInBvd2VyIGJpXCIsIFwibG9va2VyXCJdLFxuICAgIH0sXG4gICAge1xuICAgICAgICBjYW5vbmljYWw6IFwiZGF0YSBhbmFseXNpc1wiLFxuICAgICAgICBzeW5vbnltczogW1wiZGF0YSBhbmFseXRpY3NcIiwgXCJkYXRhIGFuYWx5c3RcIiwgXCJhbmFseXRpY3NcIl0sXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGNhbm9uaWNhbDogXCJldGxcIixcbiAgICAgICAgc3lub255bXM6IFtcImV4dHJhY3QgdHJhbnNmb3JtIGxvYWRcIiwgXCJkYXRhIHBpcGVsaW5lXCIsIFwiZGF0YSBwaXBlbGluZXNcIl0sXG4gICAgfSxcbl07XG4vKipcbiAqIEJ1aWxkcyBhIGxvb2t1cCBtYXAgZnJvbSBhbnkgdGVybSAoY2Fub25pY2FsIG9yIHN5bm9ueW0pIHRvXG4gKiB0aGUgc2V0IG9mIGFsbCB0ZXJtcyBpbiB0aGUgc2FtZSBncm91cCAoaW5jbHVkaW5nIHRoZSBjYW5vbmljYWwgZm9ybSkuXG4gKiBBbGwga2V5cyBhbmQgdmFsdWVzIGFyZSBsb3dlcmNhc2UuXG4gKi9cbmZ1bmN0aW9uIGJ1aWxkU3lub255bUxvb2t1cCgpIHtcbiAgICBjb25zdCBsb29rdXAgPSBuZXcgTWFwKCk7XG4gICAgZm9yIChjb25zdCBncm91cCBvZiBTWU5PTllNX0dST1VQUykge1xuICAgICAgICBjb25zdCBhbGxUZXJtcyA9IFtncm91cC5jYW5vbmljYWwsIC4uLmdyb3VwLnN5bm9ueW1zXTtcbiAgICAgICAgY29uc3QgdGVybVNldCA9IG5ldyBTZXQoYWxsVGVybXMpO1xuICAgICAgICBmb3IgKGNvbnN0IHRlcm0gb2YgYWxsVGVybXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nID0gbG9va3VwLmdldCh0ZXJtKTtcbiAgICAgICAgICAgIGlmIChleGlzdGluZykge1xuICAgICAgICAgICAgICAgIC8vIE1lcmdlIHNldHMgaWYgdGVybSBhcHBlYXJzIGluIG11bHRpcGxlIGdyb3Vwc1xuICAgICAgICAgICAgICAgIHRlcm1TZXQuZm9yRWFjaCgodCkgPT4gZXhpc3RpbmcuYWRkKHQpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGxvb2t1cC5zZXQodGVybSwgbmV3IFNldCh0ZXJtU2V0KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGxvb2t1cDtcbn1cbmNvbnN0IHN5bm9ueW1Mb29rdXAgPSBidWlsZFN5bm9ueW1Mb29rdXAoKTtcbi8qKlxuICogUmV0dXJucyBhbGwgc3lub255bXMgZm9yIGEgZ2l2ZW4gdGVybSAoaW5jbHVkaW5nIHRoZSB0ZXJtIGl0c2VsZikuXG4gKiBSZXR1cm5zIGFuIGVtcHR5IGFycmF5IGlmIG5vIHN5bm9ueW1zIGFyZSBmb3VuZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFN5bm9ueW1zKHRlcm0pIHtcbiAgICBjb25zdCBub3JtYWxpemVkID0gdGVybS50b0xvd2VyQ2FzZSgpLnRyaW0oKTtcbiAgICBjb25zdCBncm91cCA9IHN5bm9ueW1Mb29rdXAuZ2V0KG5vcm1hbGl6ZWQpO1xuICAgIGlmICghZ3JvdXApXG4gICAgICAgIHJldHVybiBbXTtcbiAgICByZXR1cm4gQXJyYXkuZnJvbShncm91cCk7XG59XG4vKipcbiAqIENoZWNrcyBpZiB0d28gdGVybXMgYXJlIHN5bm9ueW1zIG9mIGVhY2ggb3RoZXIuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcmVTeW5vbnltcyh0ZXJtQSwgdGVybUIpIHtcbiAgICBjb25zdCBub3JtYWxpemVkQSA9IHRlcm1BLnRvTG93ZXJDYXNlKCkudHJpbSgpO1xuICAgIGNvbnN0IG5vcm1hbGl6ZWRCID0gdGVybUIudG9Mb3dlckNhc2UoKS50cmltKCk7XG4gICAgaWYgKG5vcm1hbGl6ZWRBID09PSBub3JtYWxpemVkQilcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgY29uc3QgZ3JvdXAgPSBzeW5vbnltTG9va3VwLmdldChub3JtYWxpemVkQSk7XG4gICAgcmV0dXJuIGdyb3VwID8gZ3JvdXAuaGFzKG5vcm1hbGl6ZWRCKSA6IGZhbHNlO1xufVxuLyoqIFdlaWdodCBhcHBsaWVkIHRvIHN5bm9ueW0gbWF0Y2hlcyAodnMgMS4wIGZvciBleGFjdCBtYXRjaGVzKSAqL1xuZXhwb3J0IGNvbnN0IFNZTk9OWU1fTUFUQ0hfV0VJR0hUID0gMC44O1xuIiwiaW1wb3J0IHsgZ2V0U3lub255bXMsIFNZTk9OWU1fTUFUQ0hfV0VJR0hUIH0gZnJvbSBcIi4vc3lub255bXNcIjtcbmltcG9ydCB7IFNVQl9TQ09SRV9NQVhfUE9JTlRTIH0gZnJvbSBcIi4vY29uc3RhbnRzXCI7XG5pbXBvcnQgeyBjb250YWluc1dvcmQsIGNvdW50V29yZE9jY3VycmVuY2VzLCBnZXRSZXN1bWVUZXh0LCBub3JtYWxpemVUZXh0LCB9IGZyb20gXCIuL3RleHRcIjtcbmNvbnN0IFNUT1BfV09SRFMgPSBuZXcgU2V0KFtcbiAgICBcImFcIixcbiAgICBcImFuXCIsXG4gICAgXCJhbmRcIixcbiAgICBcImFyZVwiLFxuICAgIFwiYXNcIixcbiAgICBcImF0XCIsXG4gICAgXCJiZVwiLFxuICAgIFwiYnlcIixcbiAgICBcImZvclwiLFxuICAgIFwiZnJvbVwiLFxuICAgIFwiaW5cIixcbiAgICBcIm9mXCIsXG4gICAgXCJvblwiLFxuICAgIFwib3JcIixcbiAgICBcIm91clwiLFxuICAgIFwidGhlXCIsXG4gICAgXCJ0b1wiLFxuICAgIFwid2VcIixcbiAgICBcIndpdGhcIixcbiAgICBcInlvdVwiLFxuICAgIFwieW91clwiLFxuXSk7XG5mdW5jdGlvbiB0b2tlbml6ZUtleXdvcmRzKHRleHQpIHtcbiAgICByZXR1cm4gbm9ybWFsaXplVGV4dCh0ZXh0KVxuICAgICAgICAuc3BsaXQoL1xccysvKVxuICAgICAgICAubWFwKCh0b2tlbikgPT4gdG9rZW4udHJpbSgpKVxuICAgICAgICAuZmlsdGVyKCh0b2tlbikgPT4gdG9rZW4ubGVuZ3RoID49IDMgJiYgIVNUT1BfV09SRFMuaGFzKHRva2VuKSk7XG59XG5mdW5jdGlvbiB0b3BUb2tlbnModGV4dCwgbGltaXQpIHtcbiAgICBjb25zdCBjb3VudHMgPSBuZXcgTWFwKCk7XG4gICAgZm9yIChjb25zdCB0b2tlbiBvZiB0b2tlbml6ZUtleXdvcmRzKHRleHQpKSB7XG4gICAgICAgIGNvdW50cy5zZXQodG9rZW4sIChjb3VudHMuZ2V0KHRva2VuKSA/PyAwKSArIDEpO1xuICAgIH1cbiAgICByZXR1cm4gQXJyYXkuZnJvbShjb3VudHMuZW50cmllcygpKVxuICAgICAgICAuc29ydCgoYSwgYikgPT4gYlsxXSAtIGFbMV0gfHwgYVswXS5sb2NhbGVDb21wYXJlKGJbMF0pKVxuICAgICAgICAuc2xpY2UoMCwgbGltaXQpXG4gICAgICAgIC5tYXAoKFt0b2tlbl0pID0+IHRva2VuKTtcbn1cbmZ1bmN0aW9uIGJ1aWxkS2V5d29yZFNldChqb2IpIHtcbiAgICBjb25zdCBrZXl3b3JkcyA9IFtcbiAgICAgICAgLi4uam9iLmtleXdvcmRzLFxuICAgICAgICAuLi5qb2IucmVxdWlyZW1lbnRzLmZsYXRNYXAodG9rZW5pemVLZXl3b3JkcyksXG4gICAgICAgIC4uLnRvcFRva2Vucyhqb2IuZGVzY3JpcHRpb24sIDEwKSxcbiAgICBdO1xuICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSBrZXl3b3Jkc1xuICAgICAgICAubWFwKChrZXl3b3JkKSA9PiBub3JtYWxpemVUZXh0KGtleXdvcmQpKVxuICAgICAgICAuZmlsdGVyKChrZXl3b3JkKSA9PiBrZXl3b3JkLmxlbmd0aCA+PSAyICYmICFTVE9QX1dPUkRTLmhhcyhrZXl3b3JkKSk7XG4gICAgcmV0dXJuIEFycmF5LmZyb20obmV3IFNldChub3JtYWxpemVkKSkuc2xpY2UoMCwgMjQpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHNjb3JlS2V5d29yZE1hdGNoKGlucHV0KSB7XG4gICAgaWYgKCFpbnB1dC5qb2IpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGtleTogXCJrZXl3b3JkTWF0Y2hcIixcbiAgICAgICAgICAgIGxhYmVsOiBcIktleXdvcmQgbWF0Y2hcIixcbiAgICAgICAgICAgIGVhcm5lZDogMTgsXG4gICAgICAgICAgICBtYXhQb2ludHM6IFNVQl9TQ09SRV9NQVhfUE9JTlRTLmtleXdvcmRNYXRjaCxcbiAgICAgICAgICAgIG5vdGVzOiBbXCJObyBqb2IgZGVzY3JpcHRpb24gc3VwcGxpZWQ7IG5ldXRyYWwgYmFzZWxpbmUuXCJdLFxuICAgICAgICAgICAgZXZpZGVuY2U6IFtcIk5vIGpvYiBkZXNjcmlwdGlvbiBzdXBwbGllZC5cIl0sXG4gICAgICAgIH07XG4gICAgfVxuICAgIGNvbnN0IGtleXdvcmRzID0gYnVpbGRLZXl3b3JkU2V0KGlucHV0LmpvYik7XG4gICAgaWYgKGtleXdvcmRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAga2V5OiBcImtleXdvcmRNYXRjaFwiLFxuICAgICAgICAgICAgbGFiZWw6IFwiS2V5d29yZCBtYXRjaFwiLFxuICAgICAgICAgICAgZWFybmVkOiAxOCxcbiAgICAgICAgICAgIG1heFBvaW50czogU1VCX1NDT1JFX01BWF9QT0lOVFMua2V5d29yZE1hdGNoLFxuICAgICAgICAgICAgbm90ZXM6IFtcIkpvYiBkZXNjcmlwdGlvbiBoYXMgbm8gdXNhYmxlIGtleXdvcmRzOyBuZXV0cmFsIGJhc2VsaW5lLlwiXSxcbiAgICAgICAgICAgIGV2aWRlbmNlOiBbXCIwIGtleXdvcmRzIGF2YWlsYWJsZS5cIl0sXG4gICAgICAgIH07XG4gICAgfVxuICAgIGNvbnN0IHJlc3VtZVRleHQgPSBub3JtYWxpemVUZXh0KGdldFJlc3VtZVRleHQoaW5wdXQucHJvZmlsZSwgaW5wdXQucmF3VGV4dCkpO1xuICAgIGxldCB3ZWlnaHRlZEhpdHMgPSAwO1xuICAgIGxldCBleGFjdEhpdHMgPSAwO1xuICAgIGxldCBzdHVmZmluZyA9IGZhbHNlO1xuICAgIGZvciAoY29uc3Qga2V5d29yZCBvZiBrZXl3b3Jkcykge1xuICAgICAgICBjb25zdCBmcmVxdWVuY3kgPSBjb3VudFdvcmRPY2N1cnJlbmNlcyhyZXN1bWVUZXh0LCBrZXl3b3JkKTtcbiAgICAgICAgaWYgKGZyZXF1ZW5jeSA+IDEwKVxuICAgICAgICAgICAgc3R1ZmZpbmcgPSB0cnVlO1xuICAgICAgICBpZiAoZnJlcXVlbmN5ID4gMCkge1xuICAgICAgICAgICAgd2VpZ2h0ZWRIaXRzICs9IDE7XG4gICAgICAgICAgICBleGFjdEhpdHMgKz0gMTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHN5bm9ueW1IaXQgPSBnZXRTeW5vbnltcyhrZXl3b3JkKS5zb21lKChzeW5vbnltKSA9PiBzeW5vbnltICE9PSBrZXl3b3JkICYmIGNvbnRhaW5zV29yZChyZXN1bWVUZXh0LCBzeW5vbnltKSk7XG4gICAgICAgIGlmIChzeW5vbnltSGl0KVxuICAgICAgICAgICAgd2VpZ2h0ZWRIaXRzICs9IFNZTk9OWU1fTUFUQ0hfV0VJR0hUO1xuICAgIH1cbiAgICBjb25zdCByYXdFYXJuZWQgPSBNYXRoLnJvdW5kKCh3ZWlnaHRlZEhpdHMgLyBrZXl3b3Jkcy5sZW5ndGgpICogU1VCX1NDT1JFX01BWF9QT0lOVFMua2V5d29yZE1hdGNoKTtcbiAgICBjb25zdCBlYXJuZWQgPSBNYXRoLm1heCgwLCByYXdFYXJuZWQgLSAoc3R1ZmZpbmcgPyAyIDogMCkpO1xuICAgIGNvbnN0IG5vdGVzID0gZXhhY3RIaXRzID09PSBrZXl3b3Jkcy5sZW5ndGhcbiAgICAgICAgPyBbXVxuICAgICAgICA6IFtcIkFkZCBuYXR1cmFsIG1lbnRpb25zIG9mIG1pc3NpbmcgdGFyZ2V0IGpvYiBrZXl3b3Jkcy5cIl07XG4gICAgaWYgKHN0dWZmaW5nKVxuICAgICAgICBub3Rlcy5wdXNoKFwiS2V5d29yZCBzdHVmZmluZyBkZXRlY3RlZDsgcmVwZWF0ZWQgdGVybXMgdG9vIG9mdGVuLlwiKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBrZXk6IFwia2V5d29yZE1hdGNoXCIsXG4gICAgICAgIGxhYmVsOiBcIktleXdvcmQgbWF0Y2hcIixcbiAgICAgICAgZWFybmVkLFxuICAgICAgICBtYXhQb2ludHM6IFNVQl9TQ09SRV9NQVhfUE9JTlRTLmtleXdvcmRNYXRjaCxcbiAgICAgICAgbm90ZXMsXG4gICAgICAgIGV2aWRlbmNlOiBbXG4gICAgICAgICAgICBgJHtleGFjdEhpdHN9LyR7a2V5d29yZHMubGVuZ3RofSBrZXl3b3JkcyBtYXRjaGVkYCxcbiAgICAgICAgICAgIGAke3dlaWdodGVkSGl0cy50b0ZpeGVkKDEpfS8ke2tleXdvcmRzLmxlbmd0aH0gd2VpZ2h0ZWQga2V5d29yZCBoaXRzYCxcbiAgICAgICAgXSxcbiAgICB9O1xufVxuIiwiaW1wb3J0IHsgU1VCX1NDT1JFX01BWF9QT0lOVFMgfSBmcm9tIFwiLi9jb25zdGFudHNcIjtcbmltcG9ydCB7IGdldFJlc3VtZVRleHQsIHdvcmRDb3VudCB9IGZyb20gXCIuL3RleHRcIjtcbmZ1bmN0aW9uIHBvaW50c0ZvcldvcmRDb3VudChjb3VudCkge1xuICAgIGlmIChjb3VudCA+PSA0MDAgJiYgY291bnQgPD0gNzAwKVxuICAgICAgICByZXR1cm4gMTA7XG4gICAgaWYgKChjb3VudCA+PSAzMDAgJiYgY291bnQgPD0gMzk5KSB8fCAoY291bnQgPj0gNzAxICYmIGNvdW50IDw9IDkwMCkpXG4gICAgICAgIHJldHVybiA3O1xuICAgIGlmICgoY291bnQgPj0gMjAwICYmIGNvdW50IDw9IDI5OSkgfHwgKGNvdW50ID49IDkwMSAmJiBjb3VudCA8PSAxMTAwKSlcbiAgICAgICAgcmV0dXJuIDQ7XG4gICAgaWYgKChjb3VudCA+PSAxNTAgJiYgY291bnQgPD0gMTk5KSB8fCAoY291bnQgPj0gMTEwMSAmJiBjb3VudCA8PSAxNDAwKSkge1xuICAgICAgICByZXR1cm4gMjtcbiAgICB9XG4gICAgcmV0dXJuIDA7XG59XG5leHBvcnQgZnVuY3Rpb24gc2NvcmVMZW5ndGgoaW5wdXQpIHtcbiAgICBjb25zdCBjb3VudCA9IHdvcmRDb3VudChnZXRSZXN1bWVUZXh0KGlucHV0LnByb2ZpbGUsIGlucHV0LnJhd1RleHQpKTtcbiAgICBjb25zdCBlYXJuZWQgPSBwb2ludHNGb3JXb3JkQ291bnQoY291bnQpO1xuICAgIGNvbnN0IG5vdGVzID0gZWFybmVkID09PSBTVUJfU0NPUkVfTUFYX1BPSU5UUy5sZW5ndGhcbiAgICAgICAgPyBbXVxuICAgICAgICA6IFtcIlJlc3VtZSBsZW5ndGggaXMgb3V0c2lkZSB0aGUgNDAwLTcwMCB3b3JkIHRhcmdldCBiYW5kLlwiXTtcbiAgICByZXR1cm4ge1xuICAgICAgICBrZXk6IFwibGVuZ3RoXCIsXG4gICAgICAgIGxhYmVsOiBcIkxlbmd0aFwiLFxuICAgICAgICBlYXJuZWQsXG4gICAgICAgIG1heFBvaW50czogU1VCX1NDT1JFX01BWF9QT0lOVFMubGVuZ3RoLFxuICAgICAgICBub3RlcyxcbiAgICAgICAgZXZpZGVuY2U6IFtgJHtjb3VudH0gd29yZHNgXSxcbiAgICB9O1xufVxuIiwiaW1wb3J0IHsgUVVBTlRJRklFRF9SRUdFWCwgU1VCX1NDT1JFX01BWF9QT0lOVFMgfSBmcm9tIFwiLi9jb25zdGFudHNcIjtcbmltcG9ydCB7IGdldEhpZ2hsaWdodHMgfSBmcm9tIFwiLi90ZXh0XCI7XG5mdW5jdGlvbiBwb2ludHNGb3JRdWFudGlmaWVkUmVzdWx0cyhjb3VudCkge1xuICAgIGlmIChjb3VudCA9PT0gMClcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgaWYgKGNvdW50ID09PSAxKVxuICAgICAgICByZXR1cm4gNjtcbiAgICBpZiAoY291bnQgPT09IDIpXG4gICAgICAgIHJldHVybiAxMjtcbiAgICBpZiAoY291bnQgPD0gNClcbiAgICAgICAgcmV0dXJuIDE2O1xuICAgIHJldHVybiAyMDtcbn1cbmV4cG9ydCBmdW5jdGlvbiBzY29yZVF1YW50aWZpZWRBY2hpZXZlbWVudHMoaW5wdXQpIHtcbiAgICBjb25zdCB0ZXh0ID0gZ2V0SGlnaGxpZ2h0cyhpbnB1dC5wcm9maWxlKS5qb2luKFwiXFxuXCIpO1xuICAgIGNvbnN0IG1hdGNoZXMgPSBBcnJheS5mcm9tKHRleHQubWF0Y2hBbGwoUVVBTlRJRklFRF9SRUdFWCksIChtYXRjaCkgPT4gbWF0Y2hbMF0pO1xuICAgIGNvbnN0IG5vdGVzID0gbWF0Y2hlcy5sZW5ndGggPT09IDBcbiAgICAgICAgPyBbXCJBZGQgbWV0cmljcyBzdWNoIGFzIHBlcmNlbnRhZ2VzLCB2b2x1bWUsIHRlYW0gc2l6ZSwgb3IgcmV2ZW51ZS5cIl1cbiAgICAgICAgOiBbXTtcbiAgICByZXR1cm4ge1xuICAgICAgICBrZXk6IFwicXVhbnRpZmllZEFjaGlldmVtZW50c1wiLFxuICAgICAgICBsYWJlbDogXCJRdWFudGlmaWVkIGFjaGlldmVtZW50c1wiLFxuICAgICAgICBlYXJuZWQ6IHBvaW50c0ZvclF1YW50aWZpZWRSZXN1bHRzKG1hdGNoZXMubGVuZ3RoKSxcbiAgICAgICAgbWF4UG9pbnRzOiBTVUJfU0NPUkVfTUFYX1BPSU5UUy5xdWFudGlmaWVkQWNoaWV2ZW1lbnRzLFxuICAgICAgICBub3RlcyxcbiAgICAgICAgZXZpZGVuY2U6IFtcbiAgICAgICAgICAgIGAke21hdGNoZXMubGVuZ3RofSBxdWFudGlmaWVkIHJlc3VsdChzKWAsXG4gICAgICAgICAgICAuLi5tYXRjaGVzLnNsaWNlKDAsIDMpLFxuICAgICAgICBdLFxuICAgIH07XG59XG4iLCJpbXBvcnQgeyBTVUJfU0NPUkVfTUFYX1BPSU5UUyB9IGZyb20gXCIuL2NvbnN0YW50c1wiO1xuZXhwb3J0IGZ1bmN0aW9uIHNjb3JlU2VjdGlvbkNvbXBsZXRlbmVzcyhpbnB1dCkge1xuICAgIGNvbnN0IHsgcHJvZmlsZSB9ID0gaW5wdXQ7XG4gICAgY29uc3Qgbm90ZXMgPSBbXTtcbiAgICBjb25zdCBldmlkZW5jZSA9IFtdO1xuICAgIGxldCBlYXJuZWQgPSAwO1xuICAgIGxldCBjb21wbGV0ZVNlY3Rpb25zID0gMDtcbiAgICBpZiAocHJvZmlsZS5jb250YWN0Lm5hbWU/LnRyaW0oKSkge1xuICAgICAgICBlYXJuZWQgKz0gMTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIG5vdGVzLnB1c2goXCJNaXNzaW5nIGNvbnRhY3QgbmFtZS5cIik7XG4gICAgfVxuICAgIGlmIChwcm9maWxlLmNvbnRhY3QuZW1haWw/LnRyaW0oKSkge1xuICAgICAgICBlYXJuZWQgKz0gMTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIG5vdGVzLnB1c2goXCJNaXNzaW5nIGNvbnRhY3QgZW1haWwuXCIpO1xuICAgIH1cbiAgICBjb25zdCBzdW1tYXJ5TGVuZ3RoID0gcHJvZmlsZS5zdW1tYXJ5Py50cmltKCkubGVuZ3RoID8/IDA7XG4gICAgaWYgKHN1bW1hcnlMZW5ndGggPj0gNTAgJiYgc3VtbWFyeUxlbmd0aCA8PSA1MDApIHtcbiAgICAgICAgZWFybmVkICs9IDE7XG4gICAgICAgIGNvbXBsZXRlU2VjdGlvbnMgKz0gMTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIG5vdGVzLnB1c2goXCJTdW1tYXJ5IHNob3VsZCBiZSBiZXR3ZWVuIDUwIGFuZCA1MDAgY2hhcmFjdGVycy5cIik7XG4gICAgfVxuICAgIGNvbnN0IGhhc0V4cGVyaWVuY2UgPSBwcm9maWxlLmV4cGVyaWVuY2VzLnNvbWUoKGV4cGVyaWVuY2UpID0+IGV4cGVyaWVuY2UudGl0bGUudHJpbSgpICYmXG4gICAgICAgIGV4cGVyaWVuY2UuY29tcGFueS50cmltKCkgJiZcbiAgICAgICAgZXhwZXJpZW5jZS5zdGFydERhdGUudHJpbSgpKTtcbiAgICBpZiAoaGFzRXhwZXJpZW5jZSkge1xuICAgICAgICBlYXJuZWQgKz0gMjtcbiAgICAgICAgY29tcGxldGVTZWN0aW9ucyArPSAxO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgbm90ZXMucHVzaChcIkFkZCBhdCBsZWFzdCBvbmUgcm9sZSB3aXRoIHRpdGxlLCBjb21wYW55LCBhbmQgc3RhcnQgZGF0ZS5cIik7XG4gICAgfVxuICAgIGlmIChwcm9maWxlLmVkdWNhdGlvbi5sZW5ndGggPiAwKSB7XG4gICAgICAgIGVhcm5lZCArPSAxO1xuICAgICAgICBjb21wbGV0ZVNlY3Rpb25zICs9IDE7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBub3Rlcy5wdXNoKFwiQWRkIGF0IGxlYXN0IG9uZSBlZHVjYXRpb24gZW50cnkuXCIpO1xuICAgIH1cbiAgICBpZiAocHJvZmlsZS5za2lsbHMubGVuZ3RoID49IDMpIHtcbiAgICAgICAgZWFybmVkICs9IDI7XG4gICAgICAgIGNvbXBsZXRlU2VjdGlvbnMgKz0gMTtcbiAgICB9XG4gICAgZWxzZSBpZiAocHJvZmlsZS5za2lsbHMubGVuZ3RoID4gMCkge1xuICAgICAgICBlYXJuZWQgKz0gMTtcbiAgICAgICAgbm90ZXMucHVzaChcIkFkZCBhdCBsZWFzdCB0aHJlZSBza2lsbHMuXCIpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgbm90ZXMucHVzaChcIkFkZCBhIHNraWxscyBzZWN0aW9uLlwiKTtcbiAgICB9XG4gICAgY29uc3QgaGFzSGlnaGxpZ2h0ID0gcHJvZmlsZS5leHBlcmllbmNlcy5zb21lKChleHBlcmllbmNlKSA9PiBleHBlcmllbmNlLmhpZ2hsaWdodHMubGVuZ3RoID4gMCk7XG4gICAgaWYgKGhhc0hpZ2hsaWdodCkge1xuICAgICAgICBlYXJuZWQgKz0gMTtcbiAgICAgICAgY29tcGxldGVTZWN0aW9ucyArPSAxO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgbm90ZXMucHVzaChcIkFkZCBhY2hpZXZlbWVudCBoaWdobGlnaHRzIHRvIGV4cGVyaWVuY2UuXCIpO1xuICAgIH1cbiAgICBjb25zdCBoYXNTZWNvbmRhcnlDb250YWN0ID0gQm9vbGVhbihwcm9maWxlLmNvbnRhY3QucGhvbmU/LnRyaW0oKSB8fFxuICAgICAgICBwcm9maWxlLmNvbnRhY3QubGlua2VkaW4/LnRyaW0oKSB8fFxuICAgICAgICBwcm9maWxlLmNvbnRhY3QubG9jYXRpb24/LnRyaW0oKSk7XG4gICAgaWYgKGhhc1NlY29uZGFyeUNvbnRhY3QpIHtcbiAgICAgICAgZWFybmVkICs9IDE7XG4gICAgICAgIGNvbXBsZXRlU2VjdGlvbnMgKz0gMTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIG5vdGVzLnB1c2goXCJBZGQgcGhvbmUsIExpbmtlZEluLCBvciBsb2NhdGlvbi5cIik7XG4gICAgfVxuICAgIGlmIChwcm9maWxlLmNvbnRhY3QubmFtZT8udHJpbSgpICYmIHByb2ZpbGUuY29udGFjdC5lbWFpbD8udHJpbSgpKSB7XG4gICAgICAgIGNvbXBsZXRlU2VjdGlvbnMgKz0gMTtcbiAgICB9XG4gICAgZXZpZGVuY2UucHVzaChgJHtjb21wbGV0ZVNlY3Rpb25zfS83IHNlY3Rpb25zIGNvbXBsZXRlYCk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAga2V5OiBcInNlY3Rpb25Db21wbGV0ZW5lc3NcIixcbiAgICAgICAgbGFiZWw6IFwiU2VjdGlvbiBjb21wbGV0ZW5lc3NcIixcbiAgICAgICAgZWFybmVkOiBNYXRoLm1pbihlYXJuZWQsIFNVQl9TQ09SRV9NQVhfUE9JTlRTLnNlY3Rpb25Db21wbGV0ZW5lc3MpLFxuICAgICAgICBtYXhQb2ludHM6IFNVQl9TQ09SRV9NQVhfUE9JTlRTLnNlY3Rpb25Db21wbGV0ZW5lc3MsXG4gICAgICAgIG5vdGVzLFxuICAgICAgICBldmlkZW5jZSxcbiAgICB9O1xufVxuIiwiaW1wb3J0IHsgQUNUSU9OX1ZFUkJTLCBTVUJfU0NPUkVfTUFYX1BPSU5UUyB9IGZyb20gXCIuL2NvbnN0YW50c1wiO1xuaW1wb3J0IHsgZ2V0SGlnaGxpZ2h0cywgbm9ybWFsaXplVGV4dCB9IGZyb20gXCIuL3RleHRcIjtcbmNvbnN0IFJFUEVBVEVEX1dPUkRfRVhDRVBUSU9OUyA9IG5ldyBTZXQoW1wiaGFkIGhhZFwiLCBcInRoYXQgdGhhdFwiXSk7XG5jb25zdCBBQ1JPTllNUyA9IG5ldyBTZXQoW1wiQVBJXCIsIFwiQVdTXCIsIFwiQ1NTXCIsIFwiR0NQXCIsIFwiSFRNTFwiLCBcIlNRTFwiXSk7XG5mdW5jdGlvbiBoYXNWZXJiTGlrZVRva2VuKHRleHQpIHtcbiAgICBjb25zdCB3b3JkcyA9IG5vcm1hbGl6ZVRleHQodGV4dCkuc3BsaXQoL1xccysvKS5maWx0ZXIoQm9vbGVhbik7XG4gICAgcmV0dXJuIHdvcmRzLnNvbWUoKHdvcmQpID0+IEFDVElPTl9WRVJCUy5pbmNsdWRlcyh3b3JkKSB8fFxuICAgICAgICAvKD86ZWR8aW5nfHMpJC8udGVzdCh3b3JkKSk7XG59XG5leHBvcnQgZnVuY3Rpb24gc2NvcmVTcGVsbGluZ0dyYW1tYXIoaW5wdXQpIHtcbiAgICBjb25zdCBoaWdobGlnaHRzID0gZ2V0SGlnaGxpZ2h0cyhpbnB1dC5wcm9maWxlKTtcbiAgICBjb25zdCB0ZXh0ID0gaGlnaGxpZ2h0cy5qb2luKFwiXFxuXCIpO1xuICAgIGNvbnN0IG5vdGVzID0gW107XG4gICAgY29uc3QgZXZpZGVuY2UgPSBbXTtcbiAgICBsZXQgZGVkdWN0aW9ucyA9IDA7XG4gICAgY29uc3QgcmVwZWF0ZWQgPSBBcnJheS5mcm9tKHRleHQubWF0Y2hBbGwoL1xcYihcXHcrKVxccytcXDFcXGIvZ2kpLCAobWF0Y2gpID0+IG1hdGNoWzBdKS5maWx0ZXIoKG1hdGNoKSA9PiAhUkVQRUFURURfV09SRF9FWENFUFRJT05TLmhhcyhtYXRjaC50b0xvd2VyQ2FzZSgpKSk7XG4gICAgaWYgKHJlcGVhdGVkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgcGVuYWx0eSA9IE1hdGgubWluKDIsIHJlcGVhdGVkLmxlbmd0aCk7XG4gICAgICAgIGRlZHVjdGlvbnMgKz0gcGVuYWx0eTtcbiAgICAgICAgbm90ZXMucHVzaChcIlJlcGVhdGVkIGFkamFjZW50IHdvcmRzIGRldGVjdGVkLlwiKTtcbiAgICAgICAgZXZpZGVuY2UucHVzaChgUmVwZWF0ZWQgd29yZDogJHtyZXBlYXRlZFswXX1gKTtcbiAgICB9XG4gICAgaWYgKC8gICsvLnRlc3QodGV4dCkpIHtcbiAgICAgICAgZGVkdWN0aW9ucyArPSAxO1xuICAgICAgICBub3Rlcy5wdXNoKFwiTXVsdGlwbGUgc3BhY2VzIGJldHdlZW4gd29yZHMgZGV0ZWN0ZWQuXCIpO1xuICAgICAgICBldmlkZW5jZS5wdXNoKFwiTXVsdGlwbGUgc3BhY2VzIGZvdW5kLlwiKTtcbiAgICB9XG4gICAgY29uc3QgbG93ZXJjYXNlU3RhcnRzID0gaGlnaGxpZ2h0cy5maWx0ZXIoKGhpZ2hsaWdodCkgPT4gL15bYS16XS8udGVzdChoaWdobGlnaHQudHJpbSgpKSk7XG4gICAgaWYgKGxvd2VyY2FzZVN0YXJ0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IHBlbmFsdHkgPSBNYXRoLm1pbigzLCBsb3dlcmNhc2VTdGFydHMubGVuZ3RoKTtcbiAgICAgICAgZGVkdWN0aW9ucyArPSBwZW5hbHR5O1xuICAgICAgICBub3Rlcy5wdXNoKFwiU29tZSBoaWdobGlnaHRzIHN0YXJ0IHdpdGggbG93ZXJjYXNlIGxldHRlcnMuXCIpO1xuICAgICAgICBldmlkZW5jZS5wdXNoKGBMb3dlcmNhc2Ugc3RhcnQ6ICR7bG93ZXJjYXNlU3RhcnRzWzBdfWApO1xuICAgIH1cbiAgICBjb25zdCBmcmFnbWVudHMgPSBoaWdobGlnaHRzLmZpbHRlcigoaGlnaGxpZ2h0KSA9PiBoaWdobGlnaHQubGVuZ3RoID4gNDAgJiYgIWhhc1ZlcmJMaWtlVG9rZW4oaGlnaGxpZ2h0KSk7XG4gICAgaWYgKGZyYWdtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IHBlbmFsdHkgPSBNYXRoLm1pbigyLCBmcmFnbWVudHMubGVuZ3RoKTtcbiAgICAgICAgZGVkdWN0aW9ucyArPSBwZW5hbHR5O1xuICAgICAgICBub3Rlcy5wdXNoKFwiU29tZSBsb25nIGhpZ2hsaWdodHMgbWF5IHJlYWQgbGlrZSBzZW50ZW5jZSBmcmFnbWVudHMuXCIpO1xuICAgICAgICBldmlkZW5jZS5wdXNoKGBQb3NzaWJsZSBmcmFnbWVudDogJHtmcmFnbWVudHNbMF19YCk7XG4gICAgfVxuICAgIGNvbnN0IHB1bmN0dWF0aW9uRW5kaW5ncyA9IGhpZ2hsaWdodHMuZmlsdGVyKChoaWdobGlnaHQpID0+IC9cXC4kLy50ZXN0KGhpZ2hsaWdodC50cmltKCkpKS5sZW5ndGg7XG4gICAgaWYgKGhpZ2hsaWdodHMubGVuZ3RoID4gMSkge1xuICAgICAgICBjb25zdCByYXRlID0gcHVuY3R1YXRpb25FbmRpbmdzIC8gaGlnaGxpZ2h0cy5sZW5ndGg7XG4gICAgICAgIGlmIChyYXRlID4gMC4zICYmIHJhdGUgPCAwLjcpIHtcbiAgICAgICAgICAgIGRlZHVjdGlvbnMgKz0gMTtcbiAgICAgICAgICAgIG5vdGVzLnB1c2goXCJUcmFpbGluZyBwdW5jdHVhdGlvbiBpcyBpbmNvbnNpc3RlbnQgYWNyb3NzIGhpZ2hsaWdodHMuXCIpO1xuICAgICAgICAgICAgZXZpZGVuY2UucHVzaChgJHtwdW5jdHVhdGlvbkVuZGluZ3N9LyR7aGlnaGxpZ2h0cy5sZW5ndGh9IGhpZ2hsaWdodHMgZW5kIHdpdGggcGVyaW9kcy5gKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBhbGxDYXBzID0gQXJyYXkuZnJvbSh0ZXh0Lm1hdGNoQWxsKC9cXGJbQS1aXXs0LH1cXGIvZyksIChtYXRjaCkgPT4gbWF0Y2hbMF0pLmZpbHRlcigod29yZCkgPT4gIUFDUk9OWU1TLmhhcyh3b3JkKSk7XG4gICAgaWYgKGFsbENhcHMubGVuZ3RoID4gNSkge1xuICAgICAgICBkZWR1Y3Rpb25zICs9IDE7XG4gICAgICAgIG5vdGVzLnB1c2goXCJFeGNlc3NpdmUgYWxsLWNhcHMgd29yZHMgZGV0ZWN0ZWQuXCIpO1xuICAgICAgICBldmlkZW5jZS5wdXNoKGBBbGwtY2FwcyB3b3JkczogJHthbGxDYXBzLnNsaWNlKDAsIDMpLmpvaW4oXCIsIFwiKX1gKTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAga2V5OiBcInNwZWxsaW5nR3JhbW1hclwiLFxuICAgICAgICBsYWJlbDogXCJTcGVsbGluZyBhbmQgZ3JhbW1hclwiLFxuICAgICAgICBlYXJuZWQ6IE1hdGgubWF4KDAsIFNVQl9TQ09SRV9NQVhfUE9JTlRTLnNwZWxsaW5nR3JhbW1hciAtIGRlZHVjdGlvbnMpLFxuICAgICAgICBtYXhQb2ludHM6IFNVQl9TQ09SRV9NQVhfUE9JTlRTLnNwZWxsaW5nR3JhbW1hcixcbiAgICAgICAgbm90ZXMsXG4gICAgICAgIGV2aWRlbmNlOiBldmlkZW5jZS5sZW5ndGggPiAwID8gZXZpZGVuY2UgOiBbXCJObyBoZXVyaXN0aWMgaXNzdWVzIGRldGVjdGVkLlwiXSxcbiAgICB9O1xufVxuIiwiaW1wb3J0IHsgbm93SXNvIH0gZnJvbSBcIi4uL2Zvcm1hdHRlcnNcIjtcbmltcG9ydCB7IHNjb3JlQWN0aW9uVmVyYnMgfSBmcm9tIFwiLi9hY3Rpb24tdmVyYnNcIjtcbmltcG9ydCB7IHNjb3JlQXRzRnJpZW5kbGluZXNzIH0gZnJvbSBcIi4vYXRzLWZyaWVuZGxpbmVzc1wiO1xuaW1wb3J0IHsgc2NvcmVLZXl3b3JkTWF0Y2ggfSBmcm9tIFwiLi9rZXl3b3JkLW1hdGNoXCI7XG5pbXBvcnQgeyBzY29yZUxlbmd0aCB9IGZyb20gXCIuL2xlbmd0aFwiO1xuaW1wb3J0IHsgc2NvcmVRdWFudGlmaWVkQWNoaWV2ZW1lbnRzIH0gZnJvbSBcIi4vcXVhbnRpZmllZC1hY2hpZXZlbWVudHNcIjtcbmltcG9ydCB7IHNjb3JlU2VjdGlvbkNvbXBsZXRlbmVzcyB9IGZyb20gXCIuL3NlY3Rpb24tY29tcGxldGVuZXNzXCI7XG5pbXBvcnQgeyBzY29yZVNwZWxsaW5nR3JhbW1hciB9IGZyb20gXCIuL3NwZWxsaW5nLWdyYW1tYXJcIjtcbmV4cG9ydCBmdW5jdGlvbiBzY29yZVJlc3VtZShpbnB1dCkge1xuICAgIGNvbnN0IHN1YlNjb3JlcyA9IHtcbiAgICAgICAgc2VjdGlvbkNvbXBsZXRlbmVzczogc2NvcmVTZWN0aW9uQ29tcGxldGVuZXNzKGlucHV0KSxcbiAgICAgICAgYWN0aW9uVmVyYnM6IHNjb3JlQWN0aW9uVmVyYnMoaW5wdXQpLFxuICAgICAgICBxdWFudGlmaWVkQWNoaWV2ZW1lbnRzOiBzY29yZVF1YW50aWZpZWRBY2hpZXZlbWVudHMoaW5wdXQpLFxuICAgICAgICBrZXl3b3JkTWF0Y2g6IHNjb3JlS2V5d29yZE1hdGNoKGlucHV0KSxcbiAgICAgICAgbGVuZ3RoOiBzY29yZUxlbmd0aChpbnB1dCksXG4gICAgICAgIHNwZWxsaW5nR3JhbW1hcjogc2NvcmVTcGVsbGluZ0dyYW1tYXIoaW5wdXQpLFxuICAgICAgICBhdHNGcmllbmRsaW5lc3M6IHNjb3JlQXRzRnJpZW5kbGluZXNzKGlucHV0KSxcbiAgICB9O1xuICAgIGNvbnN0IG92ZXJhbGwgPSBPYmplY3QudmFsdWVzKHN1YlNjb3JlcykucmVkdWNlKChzdW0sIHN1YlNjb3JlKSA9PiBzdW0gKyBzdWJTY29yZS5lYXJuZWQsIDApO1xuICAgIHJldHVybiB7XG4gICAgICAgIG92ZXJhbGw6IE1hdGgubWF4KDAsIE1hdGgubWluKDEwMCwgTWF0aC5yb3VuZChvdmVyYWxsKSkpLFxuICAgICAgICBzdWJTY29yZXMsXG4gICAgICAgIGdlbmVyYXRlZEF0OiBub3dJc28oKSxcbiAgICB9O1xufVxuZXhwb3J0IHsgc2NvcmVBY3Rpb25WZXJicyB9IGZyb20gXCIuL2FjdGlvbi12ZXJic1wiO1xuZXhwb3J0IHsgc2NvcmVBdHNGcmllbmRsaW5lc3MgfSBmcm9tIFwiLi9hdHMtZnJpZW5kbGluZXNzXCI7XG5leHBvcnQgeyBzY29yZUtleXdvcmRNYXRjaCB9IGZyb20gXCIuL2tleXdvcmQtbWF0Y2hcIjtcbmV4cG9ydCB7IHNjb3JlTGVuZ3RoIH0gZnJvbSBcIi4vbGVuZ3RoXCI7XG5leHBvcnQgeyBzY29yZVF1YW50aWZpZWRBY2hpZXZlbWVudHMgfSBmcm9tIFwiLi9xdWFudGlmaWVkLWFjaGlldmVtZW50c1wiO1xuZXhwb3J0IHsgc2NvcmVTZWN0aW9uQ29tcGxldGVuZXNzIH0gZnJvbSBcIi4vc2VjdGlvbi1jb21wbGV0ZW5lc3NcIjtcbmV4cG9ydCB7IHNjb3JlU3BlbGxpbmdHcmFtbWFyIH0gZnJvbSBcIi4vc3BlbGxpbmctZ3JhbW1hclwiO1xuIiwiLy8gRmllbGQgZGV0ZWN0aW9uIHBhdHRlcm5zIGZvciBhdXRvLWZpbGxcbmV4cG9ydCBjb25zdCBGSUVMRF9QQVRURVJOUyA9IFtcbiAgICAvLyBOYW1lIGZpZWxkc1xuICAgIHtcbiAgICAgICAgdHlwZTogXCJmaXJzdE5hbWVcIixcbiAgICAgICAgYXV0b2NvbXBsZXRlVmFsdWVzOiBbXCJnaXZlbi1uYW1lXCIsIFwiZmlyc3QtbmFtZVwiXSxcbiAgICAgICAgbmFtZVBhdHRlcm5zOiBbL2ZpcnN0Lj9uYW1lL2ksIC9mbmFtZS9pLCAvZ2l2ZW4uP25hbWUvaSwgL2ZvcmVuYW1lL2ldLFxuICAgICAgICBpZFBhdHRlcm5zOiBbL2ZpcnN0Lj9uYW1lL2ksIC9mbmFtZS9pXSxcbiAgICAgICAgbGFiZWxQYXR0ZXJuczogWy9maXJzdFxccypuYW1lL2ksIC9naXZlblxccypuYW1lL2ksIC9mb3JlbmFtZS9pXSxcbiAgICAgICAgcGxhY2Vob2xkZXJQYXR0ZXJuczogWy9maXJzdFxccypuYW1lL2ldLFxuICAgICAgICBuZWdhdGl2ZVBhdHRlcm5zOiBbL2xhc3QvaSwgL2NvbXBhbnkvaSwgL21pZGRsZS9pLCAvYnVzaW5lc3MvaV0sXG4gICAgfSxcbiAgICB7XG4gICAgICAgIHR5cGU6IFwibGFzdE5hbWVcIixcbiAgICAgICAgYXV0b2NvbXBsZXRlVmFsdWVzOiBbXCJmYW1pbHktbmFtZVwiLCBcImxhc3QtbmFtZVwiXSxcbiAgICAgICAgbmFtZVBhdHRlcm5zOiBbL2xhc3QuP25hbWUvaSwgL2xuYW1lL2ksIC9zdXJuYW1lL2ksIC9mYW1pbHkuP25hbWUvaV0sXG4gICAgICAgIGlkUGF0dGVybnM6IFsvbGFzdC4/bmFtZS9pLCAvbG5hbWUvaSwgL3N1cm5hbWUvaV0sXG4gICAgICAgIGxhYmVsUGF0dGVybnM6IFsvbGFzdFxccypuYW1lL2ksIC9zdXJuYW1lL2ksIC9mYW1pbHlcXHMqbmFtZS9pXSxcbiAgICAgICAgbmVnYXRpdmVQYXR0ZXJuczogWy9maXJzdC9pLCAvY29tcGFueS9pLCAvYnVzaW5lc3MvaV0sXG4gICAgfSxcbiAgICB7XG4gICAgICAgIHR5cGU6IFwiZnVsbE5hbWVcIixcbiAgICAgICAgYXV0b2NvbXBsZXRlVmFsdWVzOiBbXCJuYW1lXCJdLFxuICAgICAgICBuYW1lUGF0dGVybnM6IFsvXm5hbWUkL2ksIC9mdWxsLj9uYW1lL2ksIC95b3VyLj9uYW1lL2ksIC9jYW5kaWRhdGUuP25hbWUvaV0sXG4gICAgICAgIGxhYmVsUGF0dGVybnM6IFsvXm5hbWUkL2ksIC9mdWxsXFxzKm5hbWUvaSwgL3lvdXJcXHMqbmFtZS9pLCAvXm5hbWVcXHMqXFwqL2ldLFxuICAgICAgICBuZWdhdGl2ZVBhdHRlcm5zOiBbXG4gICAgICAgICAgICAvY29tcGFueS9pLFxuICAgICAgICAgICAgL2ZpcnN0L2ksXG4gICAgICAgICAgICAvbGFzdC9pLFxuICAgICAgICAgICAgL3VzZXIvaSxcbiAgICAgICAgICAgIC9idXNpbmVzcy9pLFxuICAgICAgICAgICAgL2pvYi9pLFxuICAgICAgICBdLFxuICAgIH0sXG4gICAgLy8gQ29udGFjdCBmaWVsZHNcbiAgICB7XG4gICAgICAgIHR5cGU6IFwiZW1haWxcIixcbiAgICAgICAgYXV0b2NvbXBsZXRlVmFsdWVzOiBbXCJlbWFpbFwiXSxcbiAgICAgICAgbmFtZVBhdHRlcm5zOiBbL2U/LT9tYWlsL2ksIC9lbWFpbC4/YWRkcmVzcy9pXSxcbiAgICAgICAgaWRQYXR0ZXJuczogWy9lPy0/bWFpbC9pXSxcbiAgICAgICAgbGFiZWxQYXR0ZXJuczogWy9lLT9tYWlsL2ksIC9lbWFpbFxccyphZGRyZXNzL2ldLFxuICAgICAgICBwbGFjZWhvbGRlclBhdHRlcm5zOiBbL2UtP21haWwvaSwgL0AvXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgdHlwZTogXCJwaG9uZVwiLFxuICAgICAgICBhdXRvY29tcGxldGVWYWx1ZXM6IFtcInRlbFwiLCBcInRlbC1uYXRpb25hbFwiLCBcInRlbC1sb2NhbFwiXSxcbiAgICAgICAgbmFtZVBhdHRlcm5zOiBbL3Bob25lL2ksIC9tb2JpbGUvaSwgL2NlbGwvaSwgL3RlbCg/OmVwaG9uZSk/L2ldLFxuICAgICAgICBsYWJlbFBhdHRlcm5zOiBbXG4gICAgICAgICAgICAvcGhvbmUvaSxcbiAgICAgICAgICAgIC9tb2JpbGUvaSxcbiAgICAgICAgICAgIC9jZWxsL2ksXG4gICAgICAgICAgICAvdGVsZXBob25lL2ksXG4gICAgICAgICAgICAvY29udGFjdFxccypudW1iZXIvaSxcbiAgICAgICAgXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgdHlwZTogXCJhZGRyZXNzXCIsXG4gICAgICAgIGF1dG9jb21wbGV0ZVZhbHVlczogW1wic3RyZWV0LWFkZHJlc3NcIiwgXCJhZGRyZXNzLWxpbmUxXCJdLFxuICAgICAgICBuYW1lUGF0dGVybnM6IFsvYWRkcmVzcy9pLCAvc3RyZWV0L2ldLFxuICAgICAgICBsYWJlbFBhdHRlcm5zOiBbL2FkZHJlc3MvaSwgL3N0cmVldC9pXSxcbiAgICAgICAgbmVnYXRpdmVQYXR0ZXJuczogWy9lbWFpbC9pLCAvd2ViL2ksIC91cmwvaV0sXG4gICAgfSxcbiAgICB7XG4gICAgICAgIHR5cGU6IFwiY2l0eVwiLFxuICAgICAgICBhdXRvY29tcGxldGVWYWx1ZXM6IFtcImFkZHJlc3MtbGV2ZWwyXCJdLFxuICAgICAgICBuYW1lUGF0dGVybnM6IFsvY2l0eS9pLCAvdG93bi9pXSxcbiAgICAgICAgbGFiZWxQYXR0ZXJuczogWy9jaXR5L2ksIC90b3duL2ldLFxuICAgIH0sXG4gICAge1xuICAgICAgICB0eXBlOiBcInN0YXRlXCIsXG4gICAgICAgIGF1dG9jb21wbGV0ZVZhbHVlczogW1wiYWRkcmVzcy1sZXZlbDFcIl0sXG4gICAgICAgIG5hbWVQYXR0ZXJuczogWy9zdGF0ZS9pLCAvcHJvdmluY2UvaSwgL3JlZ2lvbi9pXSxcbiAgICAgICAgbGFiZWxQYXR0ZXJuczogWy9zdGF0ZS9pLCAvcHJvdmluY2UvaSwgL3JlZ2lvbi9pXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgdHlwZTogXCJ6aXBDb2RlXCIsXG4gICAgICAgIGF1dG9jb21wbGV0ZVZhbHVlczogW1wicG9zdGFsLWNvZGVcIl0sXG4gICAgICAgIG5hbWVQYXR0ZXJuczogWy96aXAvaSwgL3Bvc3RhbC9pLCAvcG9zdGNvZGUvaV0sXG4gICAgICAgIGxhYmVsUGF0dGVybnM6IFsvemlwL2ksIC9wb3N0YWwvaSwgL3Bvc3RcXHMqY29kZS9pXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgdHlwZTogXCJjb3VudHJ5XCIsXG4gICAgICAgIGF1dG9jb21wbGV0ZVZhbHVlczogW1wiY291bnRyeVwiLCBcImNvdW50cnktbmFtZVwiXSxcbiAgICAgICAgbmFtZVBhdHRlcm5zOiBbL2NvdW50cnkvaV0sXG4gICAgICAgIGxhYmVsUGF0dGVybnM6IFsvY291bnRyeS9pXSxcbiAgICB9LFxuICAgIC8vIFNvY2lhbC9Qcm9mZXNzaW9uYWwgbGlua3NcbiAgICB7XG4gICAgICAgIHR5cGU6IFwibGlua2VkaW5cIixcbiAgICAgICAgYXV0b2NvbXBsZXRlVmFsdWVzOiBbXCJ1cmxcIl0sXG4gICAgICAgIG5hbWVQYXR0ZXJuczogWy9saW5rZWRpbi9pXSxcbiAgICAgICAgaWRQYXR0ZXJuczogWy9saW5rZWRpbi9pXSxcbiAgICAgICAgbGFiZWxQYXR0ZXJuczogWy9saW5rZWRpbi9pXSxcbiAgICAgICAgcGxhY2Vob2xkZXJQYXR0ZXJuczogWy9saW5rZWRpblxcLmNvbS9pLCAvbGlua2VkaW4vaV0sXG4gICAgfSxcbiAgICB7XG4gICAgICAgIHR5cGU6IFwiZ2l0aHViXCIsXG4gICAgICAgIGF1dG9jb21wbGV0ZVZhbHVlczogW1widXJsXCJdLFxuICAgICAgICBuYW1lUGF0dGVybnM6IFsvZ2l0aHViL2ldLFxuICAgICAgICBpZFBhdHRlcm5zOiBbL2dpdGh1Yi9pXSxcbiAgICAgICAgbGFiZWxQYXR0ZXJuczogWy9naXRodWIvaV0sXG4gICAgICAgIHBsYWNlaG9sZGVyUGF0dGVybnM6IFsvZ2l0aHViXFwuY29tL2ksIC9naXRodWIvaV0sXG4gICAgfSxcbiAgICB7XG4gICAgICAgIHR5cGU6IFwid2Vic2l0ZVwiLFxuICAgICAgICBhdXRvY29tcGxldGVWYWx1ZXM6IFtcInVybFwiXSxcbiAgICAgICAgaWRQYXR0ZXJuczogWy93ZWJzaXRlL2ksIC9wb3J0Zm9saW8vaSwgL3BlcnNvbmFsLj9zaXRlL2ksIC9ibG9nL2ldLFxuICAgICAgICBuYW1lUGF0dGVybnM6IFsvd2Vic2l0ZS9pLCAvcG9ydGZvbGlvL2ksIC9wZXJzb25hbC4/c2l0ZS9pLCAvYmxvZy9pXSxcbiAgICAgICAgbGFiZWxQYXR0ZXJuczogWy93ZWJzaXRlL2ksIC9wb3J0Zm9saW8vaSwgL3BlcnNvbmFsXFxzKihzaXRlfHVybCkvaV0sXG4gICAgICAgIG5lZ2F0aXZlUGF0dGVybnM6IFsvbGlua2VkaW4vaSwgL2dpdGh1Yi9pLCAvY29tcGFueS9pXSxcbiAgICB9LFxuICAgIC8vIEVtcGxveW1lbnQgZmllbGRzXG4gICAge1xuICAgICAgICB0eXBlOiBcImN1cnJlbnRDb21wYW55XCIsXG4gICAgICAgIGF1dG9jb21wbGV0ZVZhbHVlczogW1wib3JnYW5pemF0aW9uXCJdLFxuICAgICAgICBuYW1lUGF0dGVybnM6IFtcbiAgICAgICAgICAgIC9jdXJyZW50Lj9jb21wYW55L2ksXG4gICAgICAgICAgICAvZW1wbG95ZXIvaSxcbiAgICAgICAgICAgIC9jb21wYW55Lj9uYW1lL2ksXG4gICAgICAgICAgICAvb3JnYW5pemF0aW9uL2ksXG4gICAgICAgIF0sXG4gICAgICAgIGxhYmVsUGF0dGVybnM6IFtcbiAgICAgICAgICAgIC9jdXJyZW50XFxzKihjb21wYW55fGVtcGxveWVyKS9pLFxuICAgICAgICAgICAgL2NvbXBhbnlcXHMqbmFtZS9pLFxuICAgICAgICAgICAgL2VtcGxveWVyL2ksXG4gICAgICAgIF0sXG4gICAgICAgIG5lZ2F0aXZlUGF0dGVybnM6IFsvcHJldmlvdXMvaSwgL3Bhc3QvaSwgL2Zvcm1lci9pXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgdHlwZTogXCJjdXJyZW50VGl0bGVcIixcbiAgICAgICAgYXV0b2NvbXBsZXRlVmFsdWVzOiBbXCJvcmdhbml6YXRpb24tdGl0bGVcIl0sXG4gICAgICAgIG5hbWVQYXR0ZXJuczogWy9jdXJyZW50Lj90aXRsZS9pLCAvam9iLj90aXRsZS9pLCAvcG9zaXRpb24vaSwgL3JvbGUvaV0sXG4gICAgICAgIGxhYmVsUGF0dGVybnM6IFsvY3VycmVudFxccyoodGl0bGV8cG9zaXRpb258cm9sZSkvaSwgL2pvYlxccyp0aXRsZS9pXSxcbiAgICAgICAgbmVnYXRpdmVQYXR0ZXJuczogWy9wcmV2aW91cy9pLCAvcGFzdC9pLCAvZGVzaXJlZC9pLCAvYXBwbHlpbmcvaV0sXG4gICAgfSxcbiAgICB7XG4gICAgICAgIHR5cGU6IFwieWVhcnNFeHBlcmllbmNlXCIsXG4gICAgICAgIG5hbWVQYXR0ZXJuczogWy95ZWFycz8uPyhvZik/Lj9leHBlcmllbmNlL2ksIC9leHBlcmllbmNlLj95ZWFycy9pLCAveW9lL2ldLFxuICAgICAgICBpZFBhdHRlcm5zOiBbXG4gICAgICAgICAgICAveWVhcnM/Lj8ob2YpPy4/ZXhwZXJpZW5jZS9pLFxuICAgICAgICAgICAgL2V4cGVyaWVuY2UuP3llYXJzL2ksXG4gICAgICAgICAgICAvZXhwZXJpZW5jZS9pLFxuICAgICAgICAgICAgL3lvZS9pLFxuICAgICAgICBdLFxuICAgICAgICBsYWJlbFBhdHRlcm5zOiBbXG4gICAgICAgICAgICAveWVhcnM/XFxzKihvZlxccyopP2V4cGVyaWVuY2UvaSxcbiAgICAgICAgICAgIC90b3RhbFxccypleHBlcmllbmNlL2ksXG4gICAgICAgICAgICAvaG93XFxzKm1hbnlcXHMqeWVhcnMvaSxcbiAgICAgICAgXSxcbiAgICAgICAgcGxhY2Vob2xkZXJQYXR0ZXJuczogWy95ZWFycz8vaSwgL3lvZS9pXSxcbiAgICB9LFxuICAgIC8vIEVkdWNhdGlvbiBmaWVsZHNcbiAgICB7XG4gICAgICAgIHR5cGU6IFwic2Nob29sXCIsXG4gICAgICAgIG5hbWVQYXR0ZXJuczogW1xuICAgICAgICAgICAgL3NjaG9vbC9pLFxuICAgICAgICAgICAgL3VuaXZlcnNpdHkvaSxcbiAgICAgICAgICAgIC9jb2xsZWdlL2ksXG4gICAgICAgICAgICAvaW5zdGl0dXRpb24vaSxcbiAgICAgICAgICAgIC9hbG1hLj9tYXRlci9pLFxuICAgICAgICBdLFxuICAgICAgICBsYWJlbFBhdHRlcm5zOiBbL3NjaG9vbC9pLCAvdW5pdmVyc2l0eS9pLCAvY29sbGVnZS9pLCAvaW5zdGl0dXRpb24vaV0sXG4gICAgICAgIG5lZ2F0aXZlUGF0dGVybnM6IFsvaGlnaFxccypzY2hvb2wvaV0sXG4gICAgfSxcbiAgICB7XG4gICAgICAgIHR5cGU6IFwiZGVncmVlXCIsXG4gICAgICAgIG5hbWVQYXR0ZXJuczogWy9kZWdyZWUvaSwgL3F1YWxpZmljYXRpb24vaV0sXG4gICAgICAgIGxhYmVsUGF0dGVybnM6IFsvZGVncmVlL2ksIC9xdWFsaWZpY2F0aW9uL2ksIC9sZXZlbFxccypvZlxccyplZHVjYXRpb24vaV0sXG4gICAgfSxcbiAgICB7XG4gICAgICAgIHR5cGU6IFwiZmllbGRPZlN0dWR5XCIsXG4gICAgICAgIG5hbWVQYXR0ZXJuczogW1xuICAgICAgICAgICAgL2ZpZWxkLj9vZi4/c3R1ZHkvaSxcbiAgICAgICAgICAgIC9tYWpvci9pLFxuICAgICAgICAgICAgL2NvbmNlbnRyYXRpb24vaSxcbiAgICAgICAgICAgIC9zcGVjaWFsaXphdGlvbi9pLFxuICAgICAgICBdLFxuICAgICAgICBsYWJlbFBhdHRlcm5zOiBbL2ZpZWxkXFxzKm9mXFxzKnN0dWR5L2ksIC9tYWpvci9pLCAvYXJlYVxccypvZlxccypzdHVkeS9pXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgdHlwZTogXCJncmFkdWF0aW9uWWVhclwiLFxuICAgICAgICBuYW1lUGF0dGVybnM6IFsvZ3JhZHVhdGlvbi4/KHllYXJ8ZGF0ZSkvaSwgL2dyYWQuP3llYXIvaV0sXG4gICAgICAgIGxhYmVsUGF0dGVybnM6IFtcbiAgICAgICAgICAgIC9ncmFkdWF0aW9uXFxzKih5ZWFyfGRhdGUpL2ksXG4gICAgICAgICAgICAveWVhclxccypvZlxccypncmFkdWF0aW9uL2ksXG4gICAgICAgICAgICAvd2hlblxccypkaWRcXHMqeW91XFxzKmdyYWR1YXRlL2ksXG4gICAgICAgIF0sXG4gICAgfSxcbiAgICB7XG4gICAgICAgIHR5cGU6IFwiZ3BhXCIsXG4gICAgICAgIG5hbWVQYXR0ZXJuczogWy9ncGEvaSwgL2dyYWRlLj9wb2ludC9pLCAvY2dwYS9pXSxcbiAgICAgICAgbGFiZWxQYXR0ZXJuczogWy9ncGEvaSwgL2dyYWRlXFxzKnBvaW50L2ksIC9jdW11bGF0aXZlXFxzKmdwYS9pXSxcbiAgICB9LFxuICAgIC8vIERvY3VtZW50c1xuICAgIHtcbiAgICAgICAgdHlwZTogXCJyZXN1bWVcIixcbiAgICAgICAgbmFtZVBhdHRlcm5zOiBbL3Jlc3VtZS9pLCAvY3YvaSwgL2N1cnJpY3VsdW0uP3ZpdGFlL2ldLFxuICAgICAgICBsYWJlbFBhdHRlcm5zOiBbXG4gICAgICAgICAgICAvcmVzdW1lL2ksXG4gICAgICAgICAgICAvY3YvaSxcbiAgICAgICAgICAgIC9jdXJyaWN1bHVtXFxzKnZpdGFlL2ksXG4gICAgICAgICAgICAvdXBsb2FkXFxzKih5b3VyXFxzKik/cmVzdW1lL2ksXG4gICAgICAgIF0sXG4gICAgfSxcbiAgICB7XG4gICAgICAgIHR5cGU6IFwiY292ZXJMZXR0ZXJcIixcbiAgICAgICAgbmFtZVBhdHRlcm5zOiBbL2NvdmVyLj9sZXR0ZXIvaSwgL21vdGl2YXRpb24uP2xldHRlci9pXSxcbiAgICAgICAgbGFiZWxQYXR0ZXJuczogWy9jb3ZlclxccypsZXR0ZXIvaSwgL21vdGl2YXRpb25cXHMqbGV0dGVyL2ldLFxuICAgIH0sXG4gICAgLy8gQ29tcGVuc2F0aW9uXG4gICAge1xuICAgICAgICB0eXBlOiBcInNhbGFyeVwiLFxuICAgICAgICBuYW1lUGF0dGVybnM6IFsvc2FsYXJ5L2ksIC9jb21wZW5zYXRpb24vaSwgL3BheS9pLCAvd2FnZS9pXSxcbiAgICAgICAgbGFiZWxQYXR0ZXJuczogW1xuICAgICAgICAgICAgL3NhbGFyeS9pLFxuICAgICAgICAgICAgL2NvbXBlbnNhdGlvbi9pLFxuICAgICAgICAgICAgL2V4cGVjdGVkXFxzKihzYWxhcnl8cGF5KS9pLFxuICAgICAgICAgICAgL2Rlc2lyZWRcXHMqc2FsYXJ5L2ksXG4gICAgICAgIF0sXG4gICAgfSxcbiAgICAvLyBBdmFpbGFiaWxpdHlcbiAgICB7XG4gICAgICAgIHR5cGU6IFwic3RhcnREYXRlXCIsXG4gICAgICAgIG5hbWVQYXR0ZXJuczogWy9zdGFydC4/ZGF0ZS9pLCAvYXZhaWxhYmxlLj9kYXRlL2ksIC9lYXJsaWVzdC4/c3RhcnQvaV0sXG4gICAgICAgIGxhYmVsUGF0dGVybnM6IFtcbiAgICAgICAgICAgIC9zdGFydFxccypkYXRlL2ksXG4gICAgICAgICAgICAvd2hlblxccypjYW5cXHMqeW91XFxzKnN0YXJ0L2ksXG4gICAgICAgICAgICAvZWFybGllc3RcXHMqc3RhcnQvaSxcbiAgICAgICAgICAgIC9hdmFpbGFiaWxpdHkvaSxcbiAgICAgICAgXSxcbiAgICAgICAgbmVnYXRpdmVQYXR0ZXJuczogWy9lbmQvaSwgL2ZpbmlzaC9pXSxcbiAgICB9LFxuICAgIC8vIExlZ2FsL0NvbXBsaWFuY2VcbiAgICB7XG4gICAgICAgIHR5cGU6IFwid29ya0F1dGhvcml6YXRpb25cIixcbiAgICAgICAgbmFtZVBhdHRlcm5zOiBbXG4gICAgICAgICAgICAvd29yay4/YXV0aC9pLFxuICAgICAgICAgICAgL2F1dGhvcml6ZWQuP3RvLj93b3JrL2ksXG4gICAgICAgICAgICAvbGVnYWxseS4/d29yay9pLFxuICAgICAgICAgICAgL3dvcmsuP3Blcm1pdC9pLFxuICAgICAgICAgICAgL3Zpc2EuP3N0YXR1cy9pLFxuICAgICAgICBdLFxuICAgICAgICBsYWJlbFBhdHRlcm5zOiBbXG4gICAgICAgICAgICAvYXV0aG9yaXplZFxccyp0b1xccyp3b3JrL2ksXG4gICAgICAgICAgICAvbGVnYWxseVxccyooYXV0aG9yaXplZHxwZXJtaXR0ZWQpL2ksXG4gICAgICAgICAgICAvd29ya1xccyphdXRob3JpemF0aW9uL2ksXG4gICAgICAgICAgICAvcmlnaHRcXHMqdG9cXHMqd29yay9pLFxuICAgICAgICBdLFxuICAgIH0sXG4gICAge1xuICAgICAgICB0eXBlOiBcInNwb25zb3JzaGlwXCIsXG4gICAgICAgIG5hbWVQYXR0ZXJuczogWy9zcG9uc29yL2ksIC92aXNhLj9zcG9uc29yL2ldLFxuICAgICAgICBsYWJlbFBhdHRlcm5zOiBbXG4gICAgICAgICAgICAvc3BvbnNvci9pLFxuICAgICAgICAgICAgL3Zpc2FcXHMqc3BvbnNvci9pLFxuICAgICAgICAgICAgL3JlcXVpcmVcXHMqc3BvbnNvcnNoaXAvaSxcbiAgICAgICAgICAgIC9uZWVkXFxzKnNwb25zb3JzaGlwL2ksXG4gICAgICAgIF0sXG4gICAgfSxcbiAgICAvLyBFRU8gZmllbGRzXG4gICAge1xuICAgICAgICB0eXBlOiBcInZldGVyYW5TdGF0dXNcIixcbiAgICAgICAgbmFtZVBhdHRlcm5zOiBbL3ZldGVyYW4vaSwgL21pbGl0YXJ5L2ldLFxuICAgICAgICBsYWJlbFBhdHRlcm5zOiBbL3ZldGVyYW4vaSwgL21pbGl0YXJ5XFxzKnN0YXR1cy9pLCAvc2VydmVkXFxzKmluL2ldLFxuICAgIH0sXG4gICAge1xuICAgICAgICB0eXBlOiBcImRpc2FiaWxpdHlcIixcbiAgICAgICAgbmFtZVBhdHRlcm5zOiBbL2Rpc2FiaWxpdHkvaSwgL2Rpc2FibGVkL2ldLFxuICAgICAgICBsYWJlbFBhdHRlcm5zOiBbL2Rpc2FiaWxpdHkvaSwgL2Rpc2FibGVkL2ksIC9hY2NvbW1vZGF0aW9uL2ldLFxuICAgIH0sXG4gICAge1xuICAgICAgICB0eXBlOiBcImdlbmRlclwiLFxuICAgICAgICBuYW1lUGF0dGVybnM6IFsvZ2VuZGVyL2ksIC9zZXgvaV0sXG4gICAgICAgIGxhYmVsUGF0dGVybnM6IFsvZ2VuZGVyL2ksIC9zZXgvaV0sXG4gICAgICAgIG5lZ2F0aXZlUGF0dGVybnM6IFsvaWRlbnRpdHkvaV0sXG4gICAgfSxcbiAgICB7XG4gICAgICAgIHR5cGU6IFwiZXRobmljaXR5XCIsXG4gICAgICAgIG5hbWVQYXR0ZXJuczogWy9ldGhuaWNpdHkvaSwgL3JhY2UvaSwgL2V0aG5pYy9pXSxcbiAgICAgICAgbGFiZWxQYXR0ZXJuczogWy9ldGhuaWNpdHkvaSwgL3JhY2UvaSwgL2V0aG5pY1xccypiYWNrZ3JvdW5kL2ldLFxuICAgIH0sXG4gICAgLy8gU2tpbGxzXG4gICAge1xuICAgICAgICB0eXBlOiBcInNraWxsc1wiLFxuICAgICAgICBuYW1lUGF0dGVybnM6IFsvc2tpbGxzPy9pLCAvZXhwZXJ0aXNlL2ksIC9jb21wZXRlbmMvaV0sXG4gICAgICAgIGxhYmVsUGF0dGVybnM6IFsvc2tpbGxzPy9pLCAvdGVjaG5pY2FsXFxzKnNraWxscy9pLCAva2V5XFxzKnNraWxscy9pXSxcbiAgICB9LFxuICAgIC8vIFN1bW1hcnkvQmlvXG4gICAge1xuICAgICAgICB0eXBlOiBcInN1bW1hcnlcIixcbiAgICAgICAgbmFtZVBhdHRlcm5zOiBbXG4gICAgICAgICAgICAvc3VtbWFyeS9pLFxuICAgICAgICAgICAgL2Jpby9pLFxuICAgICAgICAgICAgL2Fib3V0Lj95b3UvaSxcbiAgICAgICAgICAgIC9wcm9maWxlL2ksXG4gICAgICAgICAgICAvaW50cm9kdWN0aW9uL2ksXG4gICAgICAgIF0sXG4gICAgICAgIGxhYmVsUGF0dGVybnM6IFtcbiAgICAgICAgICAgIC9zdW1tYXJ5L2ksXG4gICAgICAgICAgICAvcHJvZmVzc2lvbmFsXFxzKnN1bW1hcnkvaSxcbiAgICAgICAgICAgIC9hYm91dFxccyp5b3UvaSxcbiAgICAgICAgICAgIC90ZWxsXFxzKnVzXFxzKmFib3V0L2ksXG4gICAgICAgICAgICAvYmlvL2ksXG4gICAgICAgIF0sXG4gICAgICAgIG5lZ2F0aXZlUGF0dGVybnM6IFsvam9iL2ksIC9wb3NpdGlvbi9pXSxcbiAgICB9LFxuXTtcbi8vIEpvYiBzaXRlIFVSTCBwYXR0ZXJucyBmb3Igc2NyYXBlciBkZXRlY3Rpb25cbmV4cG9ydCBjb25zdCBKT0JfU0lURV9QQVRURVJOUyA9IHtcbiAgICBsaW5rZWRpbjogW1xuICAgICAgICAvbGlua2VkaW5cXC5jb21cXC9qb2JzXFwvdmlld1xcLy8sXG4gICAgICAgIC9saW5rZWRpblxcLmNvbVxcL2pvYnNcXC9zZWFyY2gvLFxuICAgICAgICAvbGlua2VkaW5cXC5jb21cXC9qb2JzXFwvY29sbGVjdGlvbnMvLFxuICAgIF0sXG4gICAgaW5kZWVkOiBbXG4gICAgICAgIC9pbmRlZWRcXC5jb21cXC92aWV3am9iLyxcbiAgICAgICAgL2luZGVlZFxcLmNvbVxcL2pvYnMvLFxuICAgICAgICAvaW5kZWVkXFwuY29tXFwvY21wXFwvLitcXC9qb2JzLyxcbiAgICBdLFxuICAgIGdyZWVuaG91c2U6IFsvYm9hcmRzXFwuZ3JlZW5ob3VzZVxcLmlvXFwvLywgL2dyZWVuaG91c2VcXC5pb1xcLy4qXFwvam9ic1xcLy9dLFxuICAgIGxldmVyOiBbL2pvYnNcXC5sZXZlclxcLmNvXFwvLywgL2xldmVyXFwuY29cXC8uKlxcL2pvYnNcXC8vXSxcbiAgICB3YXRlcmxvb1dvcmtzOiBbL3dhdGVybG9vd29ya3NcXC51d2F0ZXJsb29cXC5jYS9dLFxuICAgIHdvcmtkYXk6IFsvbXl3b3JrZGF5am9ic1xcLmNvbS8sIC93b3JrZGF5am9ic1xcLmNvbS9dLFxufTtcbmV4cG9ydCBmdW5jdGlvbiBkZXRlY3RKb2JTaXRlKHVybCkge1xuICAgIGZvciAoY29uc3QgW3NpdGUsIHBhdHRlcm5zXSBvZiBPYmplY3QuZW50cmllcyhKT0JfU0lURV9QQVRURVJOUykpIHtcbiAgICAgICAgaWYgKHBhdHRlcm5zLnNvbWUoKHApID0+IHAudGVzdCh1cmwpKSkge1xuICAgICAgICAgICAgcmV0dXJuIHNpdGU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIFwidW5rbm93blwiO1xufVxuLy8gQ29tbW9uIHF1ZXN0aW9uIHBhdHRlcm5zIGZvciBsZWFybmluZyBzeXN0ZW1cbmV4cG9ydCBjb25zdCBDVVNUT01fUVVFU1RJT05fSU5ESUNBVE9SUyA9IFtcbiAgICAvd2h5Liood2FudHxpbnRlcmVzdGVkfGFwcGx5fGpvaW4pL2ksXG4gICAgL3doYXQuKihtYWtlc3xhdHRyYWN0ZWR8ZXhjaXRlcykvaSxcbiAgICAvdGVsbC4qYWJvdXQuKnlvdXJzZWxmL2ksXG4gICAgL2Rlc2NyaWJlLiooc2l0dWF0aW9ufHRpbWV8ZXhwZXJpZW5jZSkvaSxcbiAgICAvaG93LipoYW5kbGUvaSxcbiAgICAvZ3JlYXRlc3QuKihzdHJlbmd0aHx3ZWFrbmVzc3xhY2hpZXZlbWVudCkvaSxcbiAgICAvd2hlcmUuKnNlZS4qeW91cnNlbGYvaSxcbiAgICAvd2h5LipzaG91bGQuKmhpcmUvaSxcbiAgICAvd2hhdC4qY29udHJpYnV0ZS9pLFxuICAgIC9zYWxhcnkuKmV4cGVjdGF0aW9uL2ksXG4gICAgL2FkZGl0aW9uYWwuKmluZm9ybWF0aW9uL2ksXG4gICAgL2FueXRoaW5nLiplbHNlL2ksXG5dO1xuIiwiLy8gRmllbGQgZGV0ZWN0aW9uIGZvciBhdXRvLWZpbGxcbmltcG9ydCB7IEZJRUxEX1BBVFRFUk5TLCBDVVNUT01fUVVFU1RJT05fSU5ESUNBVE9SUywgfSBmcm9tIFwiQC9zaGFyZWQvZmllbGQtcGF0dGVybnNcIjtcbmV4cG9ydCBjbGFzcyBGaWVsZERldGVjdG9yIHtcbiAgICBkZXRlY3RGaWVsZHMoZm9ybSkge1xuICAgICAgICBjb25zdCBmaWVsZHMgPSBbXTtcbiAgICAgICAgY29uc3QgaW5wdXRzID0gZm9ybS5xdWVyeVNlbGVjdG9yQWxsKFwiaW5wdXQsIHRleHRhcmVhLCBzZWxlY3RcIik7XG4gICAgICAgIGZvciAoY29uc3QgaW5wdXQgb2YgaW5wdXRzKSB7XG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gaW5wdXQ7XG4gICAgICAgICAgICAvLyBTa2lwIGhpZGRlbiwgZGlzYWJsZWQsIG9yIHN1Ym1pdCBpbnB1dHNcbiAgICAgICAgICAgIGlmICh0aGlzLnNob3VsZFNraXBFbGVtZW50KGVsZW1lbnQpKVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgY29uc3QgZGV0ZWN0aW9uID0gdGhpcy5kZXRlY3RGaWVsZFR5cGUoZWxlbWVudCk7XG4gICAgICAgICAgICBpZiAoZGV0ZWN0aW9uLmZpZWxkVHlwZSAhPT0gXCJ1bmtub3duXCIgfHwgZGV0ZWN0aW9uLmNvbmZpZGVuY2UgPiAwLjEpIHtcbiAgICAgICAgICAgICAgICBmaWVsZHMucHVzaChkZXRlY3Rpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmaWVsZHM7XG4gICAgfVxuICAgIHNob3VsZFNraXBFbGVtZW50KGVsZW1lbnQpIHtcbiAgICAgICAgY29uc3QgaW5wdXQgPSBlbGVtZW50O1xuICAgICAgICAvLyBDaGVjayBjb21wdXRlZCBzdHlsZSBmb3IgdmlzaWJpbGl0eVxuICAgICAgICBjb25zdCBzdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpO1xuICAgICAgICBpZiAoc3R5bGUuZGlzcGxheSA9PT0gXCJub25lXCIgfHwgc3R5bGUudmlzaWJpbGl0eSA9PT0gXCJoaWRkZW5cIikge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQ2hlY2sgZGlzYWJsZWQgc3RhdGVcbiAgICAgICAgaWYgKGlucHV0LmRpc2FibGVkKVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIC8vIENoZWNrIGlucHV0IHR5cGVcbiAgICAgICAgY29uc3Qgc2tpcFR5cGVzID0gW1wiaGlkZGVuXCIsIFwic3VibWl0XCIsIFwiYnV0dG9uXCIsIFwicmVzZXRcIiwgXCJpbWFnZVwiLCBcImZpbGVcIl07XG4gICAgICAgIGlmIChza2lwVHlwZXMuaW5jbHVkZXMoaW5wdXQudHlwZSkpXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgLy8gQ2hlY2sgaWYgaXQncyBhIENTUkYvdG9rZW4gZmllbGRcbiAgICAgICAgaWYgKGlucHV0Lm5hbWU/LmluY2x1ZGVzKFwiY3NyZlwiKSB8fCBpbnB1dC5uYW1lPy5pbmNsdWRlcyhcInRva2VuXCIpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGRldGVjdEZpZWxkVHlwZShlbGVtZW50KSB7XG4gICAgICAgIGNvbnN0IHNpZ25hbHMgPSB0aGlzLmdhdGhlclNpZ25hbHMoZWxlbWVudCk7XG4gICAgICAgIGNvbnN0IHNjb3JlcyA9IHRoaXMuc2NvcmVBbGxQYXR0ZXJucyhzaWduYWxzKTtcbiAgICAgICAgLy8gR2V0IGJlc3QgbWF0Y2hcbiAgICAgICAgc2NvcmVzLnNvcnQoKGEsIGIpID0+IGIuY29uZmlkZW5jZSAtIGEuY29uZmlkZW5jZSk7XG4gICAgICAgIGNvbnN0IGJlc3QgPSBzY29yZXNbMF07XG4gICAgICAgIC8vIERldGVybWluZSBpZiB0aGlzIGlzIGEgY3VzdG9tIHF1ZXN0aW9uXG4gICAgICAgIGxldCBmaWVsZFR5cGUgPSBiZXN0Py5maWVsZFR5cGUgfHwgXCJ1bmtub3duXCI7XG4gICAgICAgIGxldCBjb25maWRlbmNlID0gYmVzdD8uY29uZmlkZW5jZSB8fCAwO1xuICAgICAgICBpZiAoY29uZmlkZW5jZSA8IDAuMykge1xuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgaXQgbG9va3MgbGlrZSBhIGN1c3RvbSBxdWVzdGlvblxuICAgICAgICAgICAgaWYgKHRoaXMubG9va3NMaWtlQ3VzdG9tUXVlc3Rpb24oc2lnbmFscykpIHtcbiAgICAgICAgICAgICAgICBmaWVsZFR5cGUgPSBcImN1c3RvbVF1ZXN0aW9uXCI7XG4gICAgICAgICAgICAgICAgY29uZmlkZW5jZSA9IDAuNTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZWxlbWVudCxcbiAgICAgICAgICAgIGZpZWxkVHlwZSxcbiAgICAgICAgICAgIGNvbmZpZGVuY2UsXG4gICAgICAgICAgICBsYWJlbDogc2lnbmFscy5sYWJlbCB8fCB1bmRlZmluZWQsXG4gICAgICAgICAgICBwbGFjZWhvbGRlcjogc2lnbmFscy5wbGFjZWhvbGRlciB8fCB1bmRlZmluZWQsXG4gICAgICAgIH07XG4gICAgfVxuICAgIGdhdGhlclNpZ25hbHMoZWxlbWVudCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbmFtZTogZWxlbWVudC5uYW1lPy50b0xvd2VyQ2FzZSgpIHx8IFwiXCIsXG4gICAgICAgICAgICBpZDogZWxlbWVudC5pZD8udG9Mb3dlckNhc2UoKSB8fCBcIlwiLFxuICAgICAgICAgICAgdHlwZTogZWxlbWVudC50eXBlIHx8IFwidGV4dFwiLFxuICAgICAgICAgICAgcGxhY2Vob2xkZXI6IGVsZW1lbnQucGxhY2Vob2xkZXI/LnRvTG93ZXJDYXNlKCkgfHwgXCJcIixcbiAgICAgICAgICAgIGF1dG9jb21wbGV0ZTogZWxlbWVudC5hdXRvY29tcGxldGUgfHwgXCJcIixcbiAgICAgICAgICAgIGxhYmVsOiB0aGlzLmZpbmRMYWJlbChlbGVtZW50KT8udG9Mb3dlckNhc2UoKSB8fCBcIlwiLFxuICAgICAgICAgICAgYXJpYUxhYmVsOiBlbGVtZW50LmdldEF0dHJpYnV0ZShcImFyaWEtbGFiZWxcIik/LnRvTG93ZXJDYXNlKCkgfHwgXCJcIixcbiAgICAgICAgICAgIG5lYXJieVRleHQ6IHRoaXMuZ2V0TmVhcmJ5VGV4dChlbGVtZW50KT8udG9Mb3dlckNhc2UoKSB8fCBcIlwiLFxuICAgICAgICAgICAgcGFyZW50Q2xhc3NlczogdGhpcy5nZXRQYXJlbnRDbGFzc2VzKGVsZW1lbnQpLFxuICAgICAgICB9O1xuICAgIH1cbiAgICBzY29yZUFsbFBhdHRlcm5zKHNpZ25hbHMpIHtcbiAgICAgICAgcmV0dXJuIEZJRUxEX1BBVFRFUk5TLm1hcCgocGF0dGVybikgPT4gKHtcbiAgICAgICAgICAgIGZpZWxkVHlwZTogcGF0dGVybi50eXBlLFxuICAgICAgICAgICAgY29uZmlkZW5jZTogdGhpcy5jYWxjdWxhdGVDb25maWRlbmNlKHNpZ25hbHMsIHBhdHRlcm4pLFxuICAgICAgICB9KSk7XG4gICAgfVxuICAgIGNhbGN1bGF0ZUNvbmZpZGVuY2Uoc2lnbmFscywgcGF0dGVybikge1xuICAgICAgICBsZXQgc2NvcmUgPSAwO1xuICAgICAgICBsZXQgbWF4U2NvcmUgPSAwO1xuICAgICAgICAvLyBXZWlnaHQgZGlmZmVyZW50IHNpZ25hbHNcbiAgICAgICAgY29uc3Qgd2VpZ2h0cyA9IHtcbiAgICAgICAgICAgIGF1dG9jb21wbGV0ZTogMC40LFxuICAgICAgICAgICAgbmFtZTogMC4yLFxuICAgICAgICAgICAgaWQ6IDAuMTUsXG4gICAgICAgICAgICBsYWJlbDogMC4xNSxcbiAgICAgICAgICAgIHBsYWNlaG9sZGVyOiAwLjEsXG4gICAgICAgICAgICBhcmlhTGFiZWw6IDAuMSxcbiAgICAgICAgfTtcbiAgICAgICAgLy8gQ2hlY2sgYXV0b2NvbXBsZXRlIGF0dHJpYnV0ZSAobW9zdCByZWxpYWJsZSlcbiAgICAgICAgaWYgKHNpZ25hbHMuYXV0b2NvbXBsZXRlICYmXG4gICAgICAgICAgICBwYXR0ZXJuLmF1dG9jb21wbGV0ZVZhbHVlcz8uaW5jbHVkZXMoc2lnbmFscy5hdXRvY29tcGxldGUpKSB7XG4gICAgICAgICAgICBzY29yZSArPSB3ZWlnaHRzLmF1dG9jb21wbGV0ZTtcbiAgICAgICAgfVxuICAgICAgICBtYXhTY29yZSArPSB3ZWlnaHRzLmF1dG9jb21wbGV0ZTtcbiAgICAgICAgLy8gQ2hlY2sgbmFtZSBhdHRyaWJ1dGVcbiAgICAgICAgaWYgKHBhdHRlcm4ubmFtZVBhdHRlcm5zPy5zb21lKChwKSA9PiBwLnRlc3Qoc2lnbmFscy5uYW1lKSkpIHtcbiAgICAgICAgICAgIHNjb3JlICs9IHdlaWdodHMubmFtZTtcbiAgICAgICAgfVxuICAgICAgICBtYXhTY29yZSArPSB3ZWlnaHRzLm5hbWU7XG4gICAgICAgIC8vIENoZWNrIElEXG4gICAgICAgIGlmIChwYXR0ZXJuLmlkUGF0dGVybnM/LnNvbWUoKHApID0+IHAudGVzdChzaWduYWxzLmlkKSkpIHtcbiAgICAgICAgICAgIHNjb3JlICs9IHdlaWdodHMuaWQ7XG4gICAgICAgIH1cbiAgICAgICAgbWF4U2NvcmUgKz0gd2VpZ2h0cy5pZDtcbiAgICAgICAgLy8gQ2hlY2sgbGFiZWxcbiAgICAgICAgaWYgKHBhdHRlcm4ubGFiZWxQYXR0ZXJucz8uc29tZSgocCkgPT4gcC50ZXN0KHNpZ25hbHMubGFiZWwpKSkge1xuICAgICAgICAgICAgc2NvcmUgKz0gd2VpZ2h0cy5sYWJlbDtcbiAgICAgICAgfVxuICAgICAgICBtYXhTY29yZSArPSB3ZWlnaHRzLmxhYmVsO1xuICAgICAgICAvLyBDaGVjayBwbGFjZWhvbGRlclxuICAgICAgICBpZiAocGF0dGVybi5wbGFjZWhvbGRlclBhdHRlcm5zPy5zb21lKChwKSA9PiBwLnRlc3Qoc2lnbmFscy5wbGFjZWhvbGRlcikpKSB7XG4gICAgICAgICAgICBzY29yZSArPSB3ZWlnaHRzLnBsYWNlaG9sZGVyO1xuICAgICAgICB9XG4gICAgICAgIG1heFNjb3JlICs9IHdlaWdodHMucGxhY2Vob2xkZXI7XG4gICAgICAgIC8vIENoZWNrIGFyaWEtbGFiZWxcbiAgICAgICAgaWYgKHBhdHRlcm4ubGFiZWxQYXR0ZXJucz8uc29tZSgocCkgPT4gcC50ZXN0KHNpZ25hbHMuYXJpYUxhYmVsKSkpIHtcbiAgICAgICAgICAgIHNjb3JlICs9IHdlaWdodHMuYXJpYUxhYmVsO1xuICAgICAgICB9XG4gICAgICAgIG1heFNjb3JlICs9IHdlaWdodHMuYXJpYUxhYmVsO1xuICAgICAgICAvLyBOZWdhdGl2ZSBzaWduYWxzIChyZWR1Y2UgY29uZmlkZW5jZSBpZiBmb3VuZClcbiAgICAgICAgaWYgKHBhdHRlcm4ubmVnYXRpdmVQYXR0ZXJucz8uc29tZSgocCkgPT4gcC50ZXN0KHNpZ25hbHMubmFtZSkgfHwgcC50ZXN0KHNpZ25hbHMubGFiZWwpIHx8IHAudGVzdChzaWduYWxzLmlkKSkpIHtcbiAgICAgICAgICAgIHNjb3JlIC09IDAuMztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTWF0aC5tYXgoMCwgbWF4U2NvcmUgPiAwID8gc2NvcmUgLyBtYXhTY29yZSA6IDApO1xuICAgIH1cbiAgICBmaW5kTGFiZWwoZWxlbWVudCkge1xuICAgICAgICAvLyBNZXRob2QgMTogRXhwbGljaXQgbGFiZWwgdmlhIGZvciBhdHRyaWJ1dGVcbiAgICAgICAgaWYgKGVsZW1lbnQuaWQpIHtcbiAgICAgICAgICAgIGNvbnN0IGxhYmVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgbGFiZWxbZm9yPVwiJHtlbGVtZW50LmlkfVwiXWApO1xuICAgICAgICAgICAgaWYgKGxhYmVsPy50ZXh0Q29udGVudClcbiAgICAgICAgICAgICAgICByZXR1cm4gbGFiZWwudGV4dENvbnRlbnQudHJpbSgpO1xuICAgICAgICB9XG4gICAgICAgIC8vIE1ldGhvZCAyOiBXcmFwcGluZyBsYWJlbFxuICAgICAgICBjb25zdCBwYXJlbnRMYWJlbCA9IGVsZW1lbnQuY2xvc2VzdChcImxhYmVsXCIpO1xuICAgICAgICBpZiAocGFyZW50TGFiZWw/LnRleHRDb250ZW50KSB7XG4gICAgICAgICAgICAvLyBSZW1vdmUgdGhlIGlucHV0J3MgdmFsdWUgZnJvbSBsYWJlbCB0ZXh0XG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0gcGFyZW50TGFiZWwudGV4dENvbnRlbnQudHJpbSgpO1xuICAgICAgICAgICAgY29uc3QgaW5wdXRWYWx1ZSA9IGVsZW1lbnQudmFsdWUgfHwgXCJcIjtcbiAgICAgICAgICAgIHJldHVybiB0ZXh0LnJlcGxhY2UoaW5wdXRWYWx1ZSwgXCJcIikudHJpbSgpO1xuICAgICAgICB9XG4gICAgICAgIC8vIE1ldGhvZCAzOiBhcmlhLWxhYmVsbGVkYnlcbiAgICAgICAgY29uc3QgbGFiZWxsZWRCeSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiYXJpYS1sYWJlbGxlZGJ5XCIpO1xuICAgICAgICBpZiAobGFiZWxsZWRCeSkge1xuICAgICAgICAgICAgY29uc3QgbGFiZWxFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGxhYmVsbGVkQnkpO1xuICAgICAgICAgICAgaWYgKGxhYmVsRWw/LnRleHRDb250ZW50KVxuICAgICAgICAgICAgICAgIHJldHVybiBsYWJlbEVsLnRleHRDb250ZW50LnRyaW0oKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBNZXRob2QgNDogUHJldmlvdXMgc2libGluZyBsYWJlbFxuICAgICAgICBsZXQgc2libGluZyA9IGVsZW1lbnQucHJldmlvdXNFbGVtZW50U2libGluZztcbiAgICAgICAgd2hpbGUgKHNpYmxpbmcpIHtcbiAgICAgICAgICAgIGlmIChzaWJsaW5nLnRhZ05hbWUgPT09IFwiTEFCRUxcIikge1xuICAgICAgICAgICAgICAgIHJldHVybiBzaWJsaW5nLnRleHRDb250ZW50Py50cmltKCkgfHwgbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNpYmxpbmcgPSBzaWJsaW5nLnByZXZpb3VzRWxlbWVudFNpYmxpbmc7XG4gICAgICAgIH1cbiAgICAgICAgLy8gTWV0aG9kIDU6IFBhcmVudCdzIHByZXZpb3VzIHNpYmxpbmcgbGFiZWxcbiAgICAgICAgY29uc3QgcGFyZW50ID0gZWxlbWVudC5wYXJlbnRFbGVtZW50O1xuICAgICAgICBpZiAocGFyZW50KSB7XG4gICAgICAgICAgICBsZXQgcGFyZW50U2libGluZyA9IHBhcmVudC5wcmV2aW91c0VsZW1lbnRTaWJsaW5nO1xuICAgICAgICAgICAgaWYgKHBhcmVudFNpYmxpbmc/LnRhZ05hbWUgPT09IFwiTEFCRUxcIikge1xuICAgICAgICAgICAgICAgIHJldHVybiBwYXJlbnRTaWJsaW5nLnRleHRDb250ZW50Py50cmltKCkgfHwgbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZ2V0TmVhcmJ5VGV4dChlbGVtZW50KSB7XG4gICAgICAgIGNvbnN0IHBhcmVudCA9IGVsZW1lbnQuY2xvc2VzdCgnLmZvcm0tZ3JvdXAsIC5maWVsZCwgLmlucHV0LXdyYXBwZXIsIFtjbGFzcyo9XCJmaWVsZFwiXSwgW2NsYXNzKj1cImlucHV0XCJdJyk7XG4gICAgICAgIGlmIChwYXJlbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IHRleHQgPSBwYXJlbnQudGV4dENvbnRlbnQ/LnRyaW0oKTtcbiAgICAgICAgICAgIGlmICh0ZXh0ICYmIHRleHQubGVuZ3RoIDwgMjAwKVxuICAgICAgICAgICAgICAgIHJldHVybiB0ZXh0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBnZXRQYXJlbnRDbGFzc2VzKGVsZW1lbnQpIHtcbiAgICAgICAgY29uc3QgY2xhc3NlcyA9IFtdO1xuICAgICAgICBsZXQgY3VycmVudCA9IGVsZW1lbnQucGFyZW50RWxlbWVudDtcbiAgICAgICAgbGV0IGRlcHRoID0gMDtcbiAgICAgICAgd2hpbGUgKGN1cnJlbnQgJiYgZGVwdGggPCAzKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudC5jbGFzc05hbWUpIHtcbiAgICAgICAgICAgICAgICBjbGFzc2VzLnB1c2goLi4uY3VycmVudC5jbGFzc05hbWUuc3BsaXQoXCIgXCIpLmZpbHRlcihCb29sZWFuKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjdXJyZW50ID0gY3VycmVudC5wYXJlbnRFbGVtZW50O1xuICAgICAgICAgICAgZGVwdGgrKztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2xhc3NlcztcbiAgICB9XG4gICAgbG9va3NMaWtlQ3VzdG9tUXVlc3Rpb24oc2lnbmFscykge1xuICAgICAgICBjb25zdCB0ZXh0ID0gYCR7c2lnbmFscy5sYWJlbH0gJHtzaWduYWxzLnBsYWNlaG9sZGVyfSAke3NpZ25hbHMubmVhcmJ5VGV4dH1gO1xuICAgICAgICByZXR1cm4gQ1VTVE9NX1FVRVNUSU9OX0lORElDQVRPUlMuc29tZSgocGF0dGVybikgPT4gcGF0dGVybi50ZXN0KHRleHQpKTtcbiAgICB9XG59XG4iLCIvLyBGaWVsZC10by1wcm9maWxlIHZhbHVlIG1hcHBpbmdcbmV4cG9ydCBjbGFzcyBGaWVsZE1hcHBlciB7XG4gICAgY29uc3RydWN0b3IocHJvZmlsZSkge1xuICAgICAgICB0aGlzLnByb2ZpbGUgPSBwcm9maWxlO1xuICAgIH1cbiAgICBtYXBGaWVsZFRvVmFsdWUoZmllbGQpIHtcbiAgICAgICAgY29uc3QgZmllbGRUeXBlID0gZmllbGQuZmllbGRUeXBlO1xuICAgICAgICBjb25zdCBtYXBwaW5nID0gdGhpcy5nZXRNYXBwaW5ncygpO1xuICAgICAgICBjb25zdCBtYXBwZXIgPSBtYXBwaW5nW2ZpZWxkVHlwZV07XG4gICAgICAgIGlmIChtYXBwZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBtYXBwZXIoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZ2V0TWFwcGluZ3MoKSB7XG4gICAgICAgIGNvbnN0IHAgPSB0aGlzLnByb2ZpbGU7XG4gICAgICAgIGNvbnN0IGMgPSBwLmNvbXB1dGVkO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgLy8gTmFtZSBmaWVsZHNcbiAgICAgICAgICAgIGZpcnN0TmFtZTogKCkgPT4gYz8uZmlyc3ROYW1lIHx8IG51bGwsXG4gICAgICAgICAgICBsYXN0TmFtZTogKCkgPT4gYz8ubGFzdE5hbWUgfHwgbnVsbCxcbiAgICAgICAgICAgIGZ1bGxOYW1lOiAoKSA9PiBwLmNvbnRhY3Q/Lm5hbWUgfHwgbnVsbCxcbiAgICAgICAgICAgIC8vIENvbnRhY3QgZmllbGRzXG4gICAgICAgICAgICBlbWFpbDogKCkgPT4gcC5jb250YWN0Py5lbWFpbCB8fCBudWxsLFxuICAgICAgICAgICAgcGhvbmU6ICgpID0+IHAuY29udGFjdD8ucGhvbmUgfHwgbnVsbCxcbiAgICAgICAgICAgIGFkZHJlc3M6ICgpID0+IHAuY29udGFjdD8ubG9jYXRpb24gfHwgbnVsbCxcbiAgICAgICAgICAgIGNpdHk6ICgpID0+IHRoaXMuZXh0cmFjdENpdHkocC5jb250YWN0Py5sb2NhdGlvbiksXG4gICAgICAgICAgICBzdGF0ZTogKCkgPT4gdGhpcy5leHRyYWN0U3RhdGUocC5jb250YWN0Py5sb2NhdGlvbiksXG4gICAgICAgICAgICB6aXBDb2RlOiAoKSA9PiBudWxsLCAvLyBOb3QgdHlwaWNhbGx5IHN0b3JlZFxuICAgICAgICAgICAgY291bnRyeTogKCkgPT4gdGhpcy5leHRyYWN0Q291bnRyeShwLmNvbnRhY3Q/LmxvY2F0aW9uKSxcbiAgICAgICAgICAgIC8vIFNvY2lhbC9Qcm9mZXNzaW9uYWxcbiAgICAgICAgICAgIGxpbmtlZGluOiAoKSA9PiBwLmNvbnRhY3Q/LmxpbmtlZGluIHx8IG51bGwsXG4gICAgICAgICAgICBnaXRodWI6ICgpID0+IHAuY29udGFjdD8uZ2l0aHViIHx8IG51bGwsXG4gICAgICAgICAgICB3ZWJzaXRlOiAoKSA9PiBwLmNvbnRhY3Q/LndlYnNpdGUgfHwgbnVsbCxcbiAgICAgICAgICAgIHBvcnRmb2xpbzogKCkgPT4gcC5jb250YWN0Py53ZWJzaXRlIHx8IG51bGwsXG4gICAgICAgICAgICAvLyBFbXBsb3ltZW50XG4gICAgICAgICAgICBjdXJyZW50Q29tcGFueTogKCkgPT4gYz8uY3VycmVudENvbXBhbnkgfHwgbnVsbCxcbiAgICAgICAgICAgIGN1cnJlbnRUaXRsZTogKCkgPT4gYz8uY3VycmVudFRpdGxlIHx8IG51bGwsXG4gICAgICAgICAgICB5ZWFyc0V4cGVyaWVuY2U6ICgpID0+IGM/LnllYXJzRXhwZXJpZW5jZT8udG9TdHJpbmcoKSB8fCBudWxsLFxuICAgICAgICAgICAgLy8gRWR1Y2F0aW9uXG4gICAgICAgICAgICBzY2hvb2w6ICgpID0+IGM/Lm1vc3RSZWNlbnRTY2hvb2wgfHwgbnVsbCxcbiAgICAgICAgICAgIGVkdWNhdGlvbjogKCkgPT4gdGhpcy5mb3JtYXRFZHVjYXRpb24oKSxcbiAgICAgICAgICAgIGRlZ3JlZTogKCkgPT4gYz8ubW9zdFJlY2VudERlZ3JlZSB8fCBudWxsLFxuICAgICAgICAgICAgZmllbGRPZlN0dWR5OiAoKSA9PiBjPy5tb3N0UmVjZW50RmllbGQgfHwgbnVsbCxcbiAgICAgICAgICAgIGdyYWR1YXRpb25ZZWFyOiAoKSA9PiBjPy5ncmFkdWF0aW9uWWVhciB8fCBudWxsLFxuICAgICAgICAgICAgZ3BhOiAoKSA9PiBwLmVkdWNhdGlvbj8uWzBdPy5ncGEgfHwgbnVsbCxcbiAgICAgICAgICAgIC8vIERvY3VtZW50cyAocmV0dXJuIG51bGwsIGhhbmRsZWQgc2VwYXJhdGVseSlcbiAgICAgICAgICAgIHJlc3VtZTogKCkgPT4gbnVsbCxcbiAgICAgICAgICAgIGNvdmVyTGV0dGVyOiAoKSA9PiBudWxsLFxuICAgICAgICAgICAgLy8gQ29tcGVuc2F0aW9uXG4gICAgICAgICAgICBzYWxhcnk6ICgpID0+IG51bGwsIC8vIFVzZXItc3BlY2lmaWMsIGRvbid0IGF1dG8tZmlsbFxuICAgICAgICAgICAgc2FsYXJ5RXhwZWN0YXRpb246ICgpID0+IG51bGwsXG4gICAgICAgICAgICAvLyBBdmFpbGFiaWxpdHlcbiAgICAgICAgICAgIHN0YXJ0RGF0ZTogKCkgPT4gbnVsbCwgLy8gVXNlci1zcGVjaWZpY1xuICAgICAgICAgICAgYXZhaWxhYmlsaXR5OiAoKSA9PiBudWxsLFxuICAgICAgICAgICAgLy8gV29yayBhdXRob3JpemF0aW9uIChzZW5zaXRpdmUsIGRvbid0IGF1dG8tZmlsbClcbiAgICAgICAgICAgIHdvcmtBdXRob3JpemF0aW9uOiAoKSA9PiBudWxsLFxuICAgICAgICAgICAgc3BvbnNvcnNoaXA6ICgpID0+IG51bGwsXG4gICAgICAgICAgICAvLyBFRU8gZmllbGRzIChzZW5zaXRpdmUsIGRvbid0IGF1dG8tZmlsbClcbiAgICAgICAgICAgIHZldGVyYW5TdGF0dXM6ICgpID0+IG51bGwsXG4gICAgICAgICAgICBkaXNhYmlsaXR5OiAoKSA9PiBudWxsLFxuICAgICAgICAgICAgZ2VuZGVyOiAoKSA9PiBudWxsLFxuICAgICAgICAgICAgZXRobmljaXR5OiAoKSA9PiBudWxsLFxuICAgICAgICAgICAgLy8gU2tpbGxzL1N1bW1hcnlcbiAgICAgICAgICAgIHNraWxsczogKCkgPT4gYz8uc2tpbGxzTGlzdCB8fCBudWxsLFxuICAgICAgICAgICAgc3VtbWFyeTogKCkgPT4gcC5zdW1tYXJ5IHx8IG51bGwsXG4gICAgICAgICAgICBleHBlcmllbmNlOiAoKSA9PiB0aGlzLmZvcm1hdEV4cGVyaWVuY2UoKSxcbiAgICAgICAgICAgIC8vIEN1c3RvbS9Vbmtub3duIChoYW5kbGVkIGJ5IGxlYXJuaW5nIHN5c3RlbSlcbiAgICAgICAgICAgIGN1c3RvbVF1ZXN0aW9uOiAoKSA9PiBudWxsLFxuICAgICAgICAgICAgdW5rbm93bjogKCkgPT4gbnVsbCxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgZXh0cmFjdENpdHkobG9jYXRpb24pIHtcbiAgICAgICAgaWYgKCFsb2NhdGlvbilcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAvLyBDb21tb24gcGF0dGVybjogXCJDaXR5LCBTdGF0ZVwiIG9yIFwiQ2l0eSwgU3RhdGUsIENvdW50cnlcIlxuICAgICAgICBjb25zdCBwYXJ0cyA9IGxvY2F0aW9uLnNwbGl0KFwiLFwiKS5tYXAoKHApID0+IHAudHJpbSgpKTtcbiAgICAgICAgcmV0dXJuIHBhcnRzWzBdIHx8IG51bGw7XG4gICAgfVxuICAgIGV4dHJhY3RTdGF0ZShsb2NhdGlvbikge1xuICAgICAgICBpZiAoIWxvY2F0aW9uKVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIGNvbnN0IHBhcnRzID0gbG9jYXRpb24uc3BsaXQoXCIsXCIpLm1hcCgocCkgPT4gcC50cmltKCkpO1xuICAgICAgICBpZiAocGFydHMubGVuZ3RoID49IDIpIHtcbiAgICAgICAgICAgIC8vIEhhbmRsZSBcIkNBXCIgb3IgXCJDYWxpZm9ybmlhXCIgb3IgXCJDQSA5NDEwNVwiXG4gICAgICAgICAgICBjb25zdCBzdGF0ZSA9IHBhcnRzWzFdLnNwbGl0KFwiIFwiKVswXTtcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZSB8fCBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBleHRyYWN0Q291bnRyeShsb2NhdGlvbikge1xuICAgICAgICBpZiAoIWxvY2F0aW9uKVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIGNvbnN0IHBhcnRzID0gbG9jYXRpb24uc3BsaXQoXCIsXCIpLm1hcCgocCkgPT4gcC50cmltKCkpO1xuICAgICAgICBpZiAocGFydHMubGVuZ3RoID49IDMpIHtcbiAgICAgICAgICAgIHJldHVybiBwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXTtcbiAgICAgICAgfVxuICAgICAgICAvLyBEZWZhdWx0IHRvIFVTQSBpZiBvbmx5IGNpdHkvc3RhdGVcbiAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgICAgICAgcmV0dXJuIFwiVW5pdGVkIFN0YXRlc1wiO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBmb3JtYXRFZHVjYXRpb24oKSB7XG4gICAgICAgIGNvbnN0IGVkdSA9IHRoaXMucHJvZmlsZS5lZHVjYXRpb24/LlswXTtcbiAgICAgICAgaWYgKCFlZHUpXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgcmV0dXJuIGAke2VkdS5kZWdyZWV9IGluICR7ZWR1LmZpZWxkfSBmcm9tICR7ZWR1Lmluc3RpdHV0aW9ufWA7XG4gICAgfVxuICAgIGZvcm1hdEV4cGVyaWVuY2UoKSB7XG4gICAgICAgIGNvbnN0IGV4cHMgPSB0aGlzLnByb2ZpbGUuZXhwZXJpZW5jZXM7XG4gICAgICAgIGlmICghZXhwcyB8fCBleHBzLmxlbmd0aCA9PT0gMClcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICByZXR1cm4gZXhwc1xuICAgICAgICAgICAgLnNsaWNlKDAsIDMpXG4gICAgICAgICAgICAubWFwKChleHApID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHBlcmlvZCA9IGV4cC5jdXJyZW50XG4gICAgICAgICAgICAgICAgPyBgJHtleHAuc3RhcnREYXRlfSAtIFByZXNlbnRgXG4gICAgICAgICAgICAgICAgOiBgJHtleHAuc3RhcnREYXRlfSAtICR7ZXhwLmVuZERhdGV9YDtcbiAgICAgICAgICAgIHJldHVybiBgJHtleHAudGl0bGV9IGF0ICR7ZXhwLmNvbXBhbnl9ICgke3BlcmlvZH0pYDtcbiAgICAgICAgfSlcbiAgICAgICAgICAgIC5qb2luKFwiXFxuXCIpO1xuICAgIH1cbiAgICAvLyBHZXQgYWxsIG1hcHBlZCB2YWx1ZXMgZm9yIGEgZm9ybVxuICAgIGdldEFsbE1hcHBlZFZhbHVlcyhmaWVsZHMpIHtcbiAgICAgICAgY29uc3QgdmFsdWVzID0gbmV3IE1hcCgpO1xuICAgICAgICBmb3IgKGNvbnN0IGZpZWxkIG9mIGZpZWxkcykge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLm1hcEZpZWxkVG9WYWx1ZShmaWVsZCk7XG4gICAgICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZXMuc2V0KGZpZWxkLmVsZW1lbnQsIHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWVzO1xuICAgIH1cbn1cbiIsIi8vIFR3by1wYXNzIGNvbmZpZGVuY2UtZHJpdmVuIGF1dG9maWxsIOKAlCB6b25lIGNsYXNzaWZpY2F0aW9uICsgRE9NIG1hcmtlcnMuXG4vL1xuLy8gUm9hZG1hcCByZWZlcmVuY2U6IGRvY3MvZXh0ZW5zaW9uLXJvYWRtYXAtMjAyNi0wNS5tZCwgdGFzayAjMzIuXG4vL1xuLy8gVG9kYXkgdGhlIGF1dG9maWxsIHdyaXRlcyBhbnkgZmllbGQgd2l0aCBjb25maWRlbmNlID49IHNldHRpbmdzLm1pbmltdW1Db25maWRlbmNlXG4vLyAoZGVmYXVsdCAwLjUpLiBUaGUgMC414oCTMC43IGJhbmQgZmlsbHMgd3Jvbmcgb2Z0ZW4gZW5vdWdoIHRoYXQgdXNlcnMgZGlzdHJ1c3Rcbi8vIGF1dG9maWxsLiBUaGlzIG1vZHVsZSBzcGxpdHMgZmlsbCBiZWhhdmlvciBpbnRvIHRocmVlIHpvbmVzOlxuLy9cbi8vICAgLSBzaWxlbnQgICg+PSAwLjg1KTogZmlsbCB0aGUgZmllbGQsIG5vIHZpc3VhbCBtYXJrZXIuXG4vLyAgIC0geWVsbG93ICAoMC424oCTMC44NSk6IGZpbGwgdGhlIGZpZWxkLCBhcHBseSBhIDFweCB5ZWxsb3cgb3V0bGluZSArIFwiP1wiIHRvb2x0aXAuXG4vLyAgIC0gY29sZCAgICAoPCAwLjYpOiAgICBkb24ndCBmaWxsLCBwbGFjZSBhIHNtYWxsIFwiP1wiIGJhZGdlIG5lYXIgdGhlIGZpZWxkIHRoYXRcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVucyBhIHBvcG92ZXIgd2l0aCB0aGUgdG9wLTMgY2FuZGlkYXRlcyBmcm9tIHByb2ZpbGUuXG4vL1xuLy8gYHNldHRpbmdzLm1pbmltdW1Db25maWRlbmNlYCBiZWNvbWVzIHRoZSBjb2xkLXpvbmUgZmxvb3IgKGV4aXN0aW5nIHNlbWFudGljc1xuLy8gcHJlc2VydmVkKS4gVGhpcyBtb2R1bGUgaXMgcHJlc2VudGF0aW9uIG9ubHkg4oCUIGl0IG5ldmVyIGFsdGVycyB0aGUgc2NvcmluZ1xuLy8gYWxnb3JpdGhtLlxuLyoqIExvd2VyIGJvdW5kIChpbmNsdXNpdmUpIGZvciB0aGUgc2lsZW50IHpvbmUuICovXG5leHBvcnQgY29uc3QgU0lMRU5UX1RIUkVTSE9MRCA9IDAuODU7XG4vKiogTG93ZXIgYm91bmQgKGluY2x1c2l2ZSkgZm9yIHRoZSB5ZWxsb3cgem9uZS4gKi9cbmV4cG9ydCBjb25zdCBZRUxMT1dfVEhSRVNIT0xEID0gMC42O1xuLyoqXG4gKiBDbGFzc2lmeSBhIGNvbmZpZGVuY2Ugc2NvcmUgaW50byBhIHpvbmUuXG4gKlxuICogQm91bmRhcmllcyBhcmUgaW5jbHVzaXZlIG9mIHRoZSBsb3dlciBib3VuZCBzbyB0aGF0OlxuICogICAtIHNjb3JlID49IDAuODUgICAgICAgICAgIOKGkiBcInNpbGVudFwiXG4gKiAgIC0gMC42ICA8PSBzY29yZSA8IDAuODUgICAg4oaSIFwieWVsbG93XCJcbiAqICAgLSBzY29yZSA8ICAwLjYgICAgICAgICAgICDihpIgXCJjb2xkXCJcbiAqXG4gKiBOYU4gLyBub24tZmluaXRlIHNjb3JlcyBhcmUgdHJlYXRlZCBhcyBjb2xkIChzYWZlc3QgZGVmYXVsdCkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGFzc2lmeUNvbmZpZGVuY2Uoc2NvcmUpIHtcbiAgICBpZiAoIU51bWJlci5pc0Zpbml0ZShzY29yZSkpXG4gICAgICAgIHJldHVybiBcImNvbGRcIjtcbiAgICBpZiAoc2NvcmUgPj0gU0lMRU5UX1RIUkVTSE9MRClcbiAgICAgICAgcmV0dXJuIFwic2lsZW50XCI7XG4gICAgaWYgKHNjb3JlID49IFlFTExPV19USFJFU0hPTEQpXG4gICAgICAgIHJldHVybiBcInllbGxvd1wiO1xuICAgIHJldHVybiBcImNvbGRcIjtcbn1cbi8qKiBDbGFzcyBuYW1lcyB1c2VkIGJ5IHRoZSB5ZWxsb3cgYmFuZCArIGNvbGQgYmFkZ2UuIE1pcnJvcnMgc3R5bGVzLmNzcy4gKi9cbmV4cG9ydCBjb25zdCBaT05FX1lFTExPV19DTEFTUyA9IFwic2xvdGhpbmctem9uZS15ZWxsb3dcIjtcbmV4cG9ydCBjb25zdCBaT05FX0JBREdFX0NMQVNTID0gXCJzbG90aGluZy16b25lLWJhZGdlXCI7XG5leHBvcnQgY29uc3QgWk9ORV9QT1BPVkVSX0NMQVNTID0gXCJzbG90aGluZy16b25lLXBvcG92ZXJcIjtcbmNvbnN0IFlFTExPV19UT09MVElQID0gXCJQcmVzcyBFbnRlciB0byBhY2NlcHQgwrcgRXNjIHRvIGNsZWFyXCI7XG5jb25zdCBDT0xEX1RPT0xUSVBfUFJFRklYID0gXCJTbG90aGluZyBoYXNcIjtcbmNvbnN0IENPTERfVE9PTFRJUF9TVUZGSVggPSBcImNhbmRpZGF0ZXMg4oCUIGNsaWNrIHRvIHBpY2tcIjtcbi8qKlxuICogQXBwbHkgdGhlIHllbGxvdy16b25lIG91dGxpbmUgKyBcIj9cIiB0b29sdGlwIHRvIGEgZnJlc2hseS1maWxsZWQgZmllbGQsIGFuZFxuICogcmVnaXN0ZXIgbGlzdGVuZXJzIHRoYXQgY2xlYXIgdGhlIG1hcmtlciBvbmNlIHRoZSB1c2VyIGludGVyYWN0cyAodHlwaW5nIG9yXG4gKiBmb2N1cy1vdXQgYWZ0ZXIgZWRpdCkuXG4gKlxuICogUmV0dXJucyBhIGBkaXNwb3NlYCBmdW5jdGlvbiB0aGF0IHJlbW92ZXMgdGhlIG1hcmtlciBtYW51YWxseSAodXNlZCBpbiB0ZXN0c1xuICogYW5kIG9uIHBhZ2VoaWRlKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5WWVsbG93TWFya2VyKGVsZW1lbnQsIG9wdGlvbnMgPSB7fSkge1xuICAgIGlmICh0eXBlb2YgZG9jdW1lbnQgPT09IFwidW5kZWZpbmVkXCIpXG4gICAgICAgIHJldHVybiAoKSA9PiB1bmRlZmluZWQ7XG4gICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKFpPTkVfWUVMTE9XX0NMQVNTKTtcbiAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShcImRhdGEtc2xvdGhpbmctem9uZVwiLCBcInllbGxvd1wiKTtcbiAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShcImRhdGEtc2xvdGhpbmctem9uZS10b29sdGlwXCIsIG9wdGlvbnMudG9vbHRpcCA/PyBZRUxMT1dfVE9PTFRJUCk7XG4gICAgY29uc3Qgb3JpZ2luYWxWYWx1ZSA9IFwidmFsdWVcIiBpbiBlbGVtZW50ID8gZWxlbWVudC52YWx1ZSA6IFwiXCI7XG4gICAgbGV0IGNsZWFyZWQgPSBmYWxzZTtcbiAgICBjb25zdCBjbGVhciA9ICgpID0+IHtcbiAgICAgICAgaWYgKGNsZWFyZWQpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNsZWFyZWQgPSB0cnVlO1xuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoWk9ORV9ZRUxMT1dfQ0xBU1MpO1xuICAgICAgICBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZShcImRhdGEtc2xvdGhpbmctem9uZVwiKTtcbiAgICAgICAgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoXCJkYXRhLXNsb3RoaW5nLXpvbmUtdG9vbHRpcFwiKTtcbiAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgb25JbnB1dCk7XG4gICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImJsdXJcIiwgb25CbHVyKTtcbiAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBvbktleURvd24pO1xuICAgIH07XG4gICAgY29uc3Qgb25JbnB1dCA9ICgpID0+IHtcbiAgICAgICAgLy8gVHlwaW5nIGludG8gdGhlIGZpZWxkIGlzIGFjY2VwdGFuY2Ugc2lnbmFsIOKAlCBjbGVhciB0aGUgbWFya2VyLlxuICAgICAgICBjbGVhcigpO1xuICAgIH07XG4gICAgY29uc3Qgb25CbHVyID0gKCkgPT4ge1xuICAgICAgICAvLyBGb2N1cy1vdXQgb25seSBjb3VudHMgYXMgYWNjZXB0YW5jZSBpZiB0aGUgdmFsdWUgY2hhbmdlZCBmcm9tIHRoZSBhdXRvZmlsbGVkIHZhbHVlLlxuICAgICAgICBpZiAoXCJ2YWx1ZVwiIGluIGVsZW1lbnQgJiYgZWxlbWVudC52YWx1ZSAhPT0gb3JpZ2luYWxWYWx1ZSkge1xuICAgICAgICAgICAgY2xlYXIoKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgY29uc3Qgb25LZXlEb3duID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChldmVudC5rZXkgPT09IFwiRW50ZXJcIiB8fCBldmVudC5rZXkgPT09IFwiRXNjYXBlXCIpIHtcbiAgICAgICAgICAgIGNsZWFyKCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIG9uSW5wdXQpO1xuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImJsdXJcIiwgb25CbHVyKTtcbiAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIG9uS2V5RG93bik7XG4gICAgcmV0dXJuIGNsZWFyO1xufVxuLyoqXG4gKiBCdWlsZCB0aGUgc21hbGwgXCI/XCIgYmFkZ2UgdGhhdCBhbm5vdW5jZXMgYSBjb2xkLXpvbmUgZmllbGQuIENsaWNraW5nIHRoZVxuICogYmFkZ2UgaW52b2tlcyBgb25QaWNrYCBzbyB0aGUgY2FsbGVyIGNhbiByZW5kZXIgdGhlIGNhbmRpZGF0ZSBwb3BvdmVyLlxuICpcbiAqIFRoZSBiYWRnZSBpcyBwb3NpdGlvbmVkIGFic29sdXRlbHk7IHRoZSBjYWxsZXIgaXMgcmVzcG9uc2libGUgZm9yIHBsYWNpbmcgaXRcbiAqIGluIGEgY29udGFpbmVyIHRoYXQgZXN0YWJsaXNoZXMgYSBwb3NpdGlvbmluZyBjb250ZXh0IG5lYXIgdGhlIGZpZWxkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ29sZEJhZGdlKG9wdHMpIHtcbiAgICBpZiAodHlwZW9mIGRvY3VtZW50ID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIC8vIFJldHVybiBhIHN0dWIgZm9yIG5vbi1ET00gZW52aXJvbm1lbnRzLlxuICAgICAgICByZXR1cm4geyBvbmNsaWNrOiBudWxsIH07XG4gICAgfVxuICAgIGNvbnN0IGJhZGdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcbiAgICBiYWRnZS50eXBlID0gXCJidXR0b25cIjtcbiAgICBiYWRnZS5jbGFzc05hbWUgPSBaT05FX0JBREdFX0NMQVNTO1xuICAgIGJhZGdlLnNldEF0dHJpYnV0ZShcImRhdGEtc2xvdGhpbmctem9uZVwiLCBcImNvbGRcIik7XG4gICAgYmFkZ2Uuc2V0QXR0cmlidXRlKFwiYXJpYS1sYWJlbFwiLCBgJHtDT0xEX1RPT0xUSVBfUFJFRklYfSAke29wdHMuY2FuZGlkYXRlQ291bnR9ICR7Q09MRF9UT09MVElQX1NVRkZJWH1gKTtcbiAgICBiYWRnZS50aXRsZSA9IGAke0NPTERfVE9PTFRJUF9QUkVGSVh9ICR7b3B0cy5jYW5kaWRhdGVDb3VudH0gJHtDT0xEX1RPT0xUSVBfU1VGRklYfWA7XG4gICAgYmFkZ2UudGV4dENvbnRlbnQgPSBcIj9cIjtcbiAgICBiYWRnZS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBvcHRzLm9uUGljaygpO1xuICAgIH0pO1xuICAgIHJldHVybiBiYWRnZTtcbn1cbi8qKlxuICogUmVuZGVyIGEgc21hbGwgcG9wb3ZlciBsaXN0aW5nIHRoZSB0b3AtMyBjb2xkLXpvbmUgY2FuZGlkYXRlcy4gQ2xpY2tpbmcgYVxuICogY2FuZGlkYXRlIGludm9rZXMgYG9uU2VsZWN0KHZhbHVlKWAgYW5kIGRpc21pc3NlcyB0aGUgcG9wb3Zlci5cbiAqXG4gKiBSZXR1cm5zIGEgYGRpc3Bvc2VgIGZ1bmN0aW9uIHRoYXQgcmVtb3ZlcyB0aGUgcG9wb3Zlci4gVGhlIHBvcG92ZXIgaXMgYWRkZWRcbiAqIHRvIGBkb2N1bWVudC5ib2R5YCBzbyBpdCBmbG9hdHMgYWJvdmUgdGhlIGhvc3Qgc2l0ZSdzIGxheW91dC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNob3dDb2xkUG9wb3ZlcihvcHRzKSB7XG4gICAgaWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gXCJ1bmRlZmluZWRcIilcbiAgICAgICAgcmV0dXJuICgpID0+IHVuZGVmaW5lZDtcbiAgICBjb25zdCBwb3BvdmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBwb3BvdmVyLmNsYXNzTmFtZSA9IFpPTkVfUE9QT1ZFUl9DTEFTUztcbiAgICBwb3BvdmVyLnNldEF0dHJpYnV0ZShcInJvbGVcIiwgXCJsaXN0Ym94XCIpO1xuICAgIGNvbnN0IGhlYWRpbmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGhlYWRpbmcuY2xhc3NOYW1lID0gYCR7Wk9ORV9QT1BPVkVSX0NMQVNTfV9fdGl0bGVgO1xuICAgIGhlYWRpbmcudGV4dENvbnRlbnQgPSBcIlBpY2sgYSB2YWx1ZVwiO1xuICAgIHBvcG92ZXIuYXBwZW5kQ2hpbGQoaGVhZGluZyk7XG4gICAgY29uc3QgbGlzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ1bFwiKTtcbiAgICBsaXN0LmNsYXNzTmFtZSA9IGAke1pPTkVfUE9QT1ZFUl9DTEFTU31fX2xpc3RgO1xuICAgIGZvciAoY29uc3QgY2FuZGlkYXRlIG9mIG9wdHMuY2FuZGlkYXRlcy5zbGljZSgwLCAzKSkge1xuICAgICAgICBjb25zdCBpdGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpXCIpO1xuICAgICAgICBjb25zdCBidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpO1xuICAgICAgICBidXR0b24udHlwZSA9IFwiYnV0dG9uXCI7XG4gICAgICAgIGJ1dHRvbi5jbGFzc05hbWUgPSBgJHtaT05FX1BPUE9WRVJfQ0xBU1N9X19pdGVtYDtcbiAgICAgICAgYnV0dG9uLnNldEF0dHJpYnV0ZShcInJvbGVcIiwgXCJvcHRpb25cIik7XG4gICAgICAgIGNvbnN0IGxhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG4gICAgICAgIGxhYmVsLmNsYXNzTmFtZSA9IGAke1pPTkVfUE9QT1ZFUl9DTEFTU31fX2xhYmVsYDtcbiAgICAgICAgbGFiZWwudGV4dENvbnRlbnQgPSBjYW5kaWRhdGUubGFiZWw7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG4gICAgICAgIHZhbHVlLmNsYXNzTmFtZSA9IGAke1pPTkVfUE9QT1ZFUl9DTEFTU31fX3ZhbHVlYDtcbiAgICAgICAgdmFsdWUudGV4dENvbnRlbnQgPSBjYW5kaWRhdGUudmFsdWU7XG4gICAgICAgIGJ1dHRvbi5hcHBlbmQobGFiZWwsIHZhbHVlKTtcbiAgICAgICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIG9wdHMub25TZWxlY3QoY2FuZGlkYXRlLnZhbHVlKTtcbiAgICAgICAgICAgIGRpc3Bvc2UoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0ZW0uYXBwZW5kQ2hpbGQoYnV0dG9uKTtcbiAgICAgICAgbGlzdC5hcHBlbmRDaGlsZChpdGVtKTtcbiAgICB9XG4gICAgcG9wb3Zlci5hcHBlbmRDaGlsZChsaXN0KTtcbiAgICAvLyBQb3NpdGlvbiB0aGUgcG9wb3ZlciBuZWFyIHRoZSBhbmNob3IgKGJlbG93ICsgcmlnaHQtYWxpZ25lZCkuXG4gICAgY29uc3QgcmVjdCA9IG9wdHMuYW5jaG9yLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGNvbnN0IHNjcm9sbFggPSB3aW5kb3cuc2Nyb2xsWCB8fCB3aW5kb3cucGFnZVhPZmZzZXQgfHwgMDtcbiAgICBjb25zdCBzY3JvbGxZID0gd2luZG93LnNjcm9sbFkgfHwgd2luZG93LnBhZ2VZT2Zmc2V0IHx8IDA7XG4gICAgcG9wb3Zlci5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcbiAgICBwb3BvdmVyLnN0eWxlLnRvcCA9IGAke3JlY3QuYm90dG9tICsgc2Nyb2xsWSArIDZ9cHhgO1xuICAgIHBvcG92ZXIuc3R5bGUubGVmdCA9IGAke3JlY3QubGVmdCArIHNjcm9sbFh9cHhgO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQocG9wb3Zlcik7XG4gICAgY29uc3Qgb25Eb2NDbGljayA9IChldmVudCkgPT4ge1xuICAgICAgICBpZiAoZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgTm9kZSAmJiBwb3BvdmVyLmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGlmIChldmVudC50YXJnZXQgPT09IG9wdHMuYW5jaG9yKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBkaXNwb3NlKCk7XG4gICAgfTtcbiAgICBjb25zdCBvbktleSA9IChldmVudCkgPT4ge1xuICAgICAgICBpZiAoZXZlbnQua2V5ID09PSBcIkVzY2FwZVwiKVxuICAgICAgICAgICAgZGlzcG9zZSgpO1xuICAgIH07XG4gICAgbGV0IGRpc3Bvc2VkID0gZmFsc2U7XG4gICAgZnVuY3Rpb24gZGlzcG9zZSgpIHtcbiAgICAgICAgaWYgKGRpc3Bvc2VkKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBkaXNwb3NlZCA9IHRydWU7XG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgb25Eb2NDbGljaywgdHJ1ZSk7XG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIG9uS2V5LCB0cnVlKTtcbiAgICAgICAgcG9wb3Zlci5yZW1vdmUoKTtcbiAgICB9XG4gICAgLy8gRGVmZXIgdGhlIGxpc3RlbmVyLWJpbmRpbmcgc28gdGhlIGNsaWNrIHRoYXQgb3BlbmVkIHRoZSBwb3BvdmVyIGRvZXNuJ3RcbiAgICAvLyBpbW1lZGlhdGVseSBjbG9zZSBpdC5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgaWYgKGRpc3Bvc2VkKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIG9uRG9jQ2xpY2ssIHRydWUpO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBvbktleSwgdHJ1ZSk7XG4gICAgfSwgMCk7XG4gICAgcmV0dXJuIGRpc3Bvc2U7XG59XG4iLCIvLyBBdXRvLWZpbGwgZW5naW5lIG9yY2hlc3RyYXRvclxuaW1wb3J0IHsgYXBwbHlZZWxsb3dNYXJrZXIsIGNsYXNzaWZ5Q29uZmlkZW5jZSwgY3JlYXRlQ29sZEJhZGdlLCBzaG93Q29sZFBvcG92ZXIsIH0gZnJvbSBcIi4uL3VpL2NvbmZpZGVuY2UtYmFuZFwiO1xuZXhwb3J0IGNsYXNzIEF1dG9GaWxsRW5naW5lIHtcbiAgICBjb25zdHJ1Y3RvcihkZXRlY3RvciwgbWFwcGVyKSB7XG4gICAgICAgIHRoaXMuZGV0ZWN0b3IgPSBkZXRlY3RvcjtcbiAgICAgICAgdGhpcy5tYXBwZXIgPSBtYXBwZXI7XG4gICAgfVxuICAgIGFzeW5jIGZpbGxGb3JtKGZpZWxkcywgb3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgIGZpbGxlZDogMCxcbiAgICAgICAgICAgIHNraXBwZWQ6IDAsXG4gICAgICAgICAgICBlcnJvcnM6IDAsXG4gICAgICAgICAgICBjb2xkOiAwLFxuICAgICAgICAgICAgeWVsbG93OiAwLFxuICAgICAgICAgICAgZGV0YWlsczogW10sXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IG1pbmltdW1Db25maWRlbmNlID0gb3B0aW9ucy5taW5pbXVtQ29uZmlkZW5jZSA/PyAwO1xuICAgICAgICBmb3IgKGNvbnN0IGZpZWxkIG9mIGZpZWxkcykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMubWFwcGVyLm1hcEZpZWxkVG9WYWx1ZShmaWVsZCk7XG4gICAgICAgICAgICAgICAgY29uc3Qgem9uZSA9IGNsYXNzaWZ5Q29uZmlkZW5jZShmaWVsZC5jb25maWRlbmNlKTtcbiAgICAgICAgICAgICAgICBpZiAoem9uZSA9PT0gXCJjb2xkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQ29sZCB6b25lOiBkb24ndCBmaWxsLiBPcHRpb25hbGx5IGFkZCBhIFwiP1wiIGJhZGdlIHNvIHRoZSB1c2VyIGNhblxuICAgICAgICAgICAgICAgICAgICAvLyBwaWNrIGZyb20gY2FuZGlkYXRlcy4gRmllbGRzIGJlbG93IHRoZSBtaW5pbXVtQ29uZmlkZW5jZSBmbG9vciBnZXRcbiAgICAgICAgICAgICAgICAgICAgLy8gbm8gYmFkZ2UgZWl0aGVyIChleGlzdGluZyBzZW1hbnRpY3M6IHNldHRpbmdzLm1pbmltdW1Db25maWRlbmNlIGlzXG4gICAgICAgICAgICAgICAgICAgIC8vIG5vdyB0aGUgY29sZC16b25lIGZsb29yKS5cbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnNraXBwZWQrKztcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LmRldGFpbHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWVsZFR5cGU6IGZpZWxkLmZpZWxkVHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGxlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICB6b25lLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpZWxkLmNvbmZpZGVuY2UgPj0gbWluaW11bUNvbmZpZGVuY2UgJiYgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYXR0YWNoQ29sZEJhZGdlKGZpZWxkLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQuY29sZCsrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5za2lwcGVkKys7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5kZXRhaWxzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgZmllbGRUeXBlOiBmaWVsZC5maWVsZFR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgem9uZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBmaWxsZWQgPSBhd2FpdCB0aGlzLmZpbGxGaWVsZChmaWVsZC5lbGVtZW50LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgaWYgKGZpbGxlZCkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQuZmlsbGVkKys7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5kZXRhaWxzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgZmllbGRUeXBlOiBmaWVsZC5maWVsZFR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxsZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB6b25lLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHpvbmUgPT09IFwieWVsbG93XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcGx5WWVsbG93TWFya2VyKGZpZWxkLmVsZW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnllbGxvdysrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLm9uRmlsbGVkPy4oeyBmaWVsZCwgdmFsdWUgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGNiRXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiW1Nsb3RoaW5nXSBvbkZpbGxlZCBjYWxsYmFjayBmYWlsZWQ6XCIsIGNiRXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnNraXBwZWQrKztcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LmRldGFpbHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWVsZFR5cGU6IGZpZWxkLmZpZWxkVHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGxlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICB6b25lLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LmVycm9ycysrO1xuICAgICAgICAgICAgICAgIHJlc3VsdC5kZXRhaWxzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBmaWVsZFR5cGU6IGZpZWxkLmZpZWxkVHlwZSxcbiAgICAgICAgICAgICAgICAgICAgZmlsbGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGVyci5tZXNzYWdlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIGF0dGFjaENvbGRCYWRnZShmaWVsZCwgcHJpbWFyeSkge1xuICAgICAgICBpZiAodHlwZW9mIGRvY3VtZW50ID09PSBcInVuZGVmaW5lZFwiKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBjb25zdCBhbmNob3IgPSBmaWVsZC5lbGVtZW50O1xuICAgICAgICBpZiAoIWFuY2hvci5wYXJlbnRFbGVtZW50KVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAvLyBEZS1kdXBlOiBpZiBhIGJhZGdlIGFscmVhZHkgZXhpc3RzIGZvciB0aGlzIGZpZWxkLCBsZWF2ZSBpdCBhbG9uZS5cbiAgICAgICAgY29uc3QgZXhpc3RpbmcgPSBhbmNob3IucGFyZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yKGBbZGF0YS1zbG90aGluZy1iYWRnZS1mb3I9XCIke2Nzc0VzY2FwZShmaWVsZEtleShmaWVsZCkpfVwiXWApO1xuICAgICAgICBpZiAoZXhpc3RpbmcpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNvbnN0IGNhbmRpZGF0ZXMgPSBbXG4gICAgICAgICAgICB7IGxhYmVsOiBmaWVsZC5maWVsZFR5cGUsIHZhbHVlOiBwcmltYXJ5IH0sXG4gICAgICAgIF07XG4gICAgICAgIGNvbnN0IGJhZGdlID0gY3JlYXRlQ29sZEJhZGdlKHtcbiAgICAgICAgICAgIGNhbmRpZGF0ZUNvdW50OiBjYW5kaWRhdGVzLmxlbmd0aCxcbiAgICAgICAgICAgIG9uUGljazogKCkgPT4ge1xuICAgICAgICAgICAgICAgIHNob3dDb2xkUG9wb3Zlcih7XG4gICAgICAgICAgICAgICAgICAgIGFuY2hvcjogYmFkZ2UsXG4gICAgICAgICAgICAgICAgICAgIGNhbmRpZGF0ZXMsXG4gICAgICAgICAgICAgICAgICAgIG9uU2VsZWN0OiAoY2hvc2VuKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2b2lkIHRoaXMuZmlsbEZpZWxkKGFuY2hvciwgY2hvc2VuKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgICAgICBiYWRnZS5zZXRBdHRyaWJ1dGUoXCJkYXRhLXNsb3RoaW5nLWJhZGdlLWZvclwiLCBmaWVsZEtleShmaWVsZCkpO1xuICAgICAgICAvLyBQbGFjZSB0aGUgYmFkZ2UgaW4gYSBzbWFsbCB3cmFwcGVyIHNvIGl0IGNhbiBiZSBwb3NpdGlvbmVkIG5leHQgdG8gdGhlXG4gICAgICAgIC8vIGZpZWxkIHdpdGhvdXQgZGlzdHVyYmluZyB0aGUgaG9zdCBsYXlvdXQuIElmIHRoZSBmaWVsZCBhbHJlYWR5IGhhcyBhXG4gICAgICAgIC8vIHBvc2l0aW9uZWQgcGFyZW50LCBhcHBlbmQgZGlyZWN0bHkuXG4gICAgICAgIGFuY2hvci5wYXJlbnRFbGVtZW50LmFwcGVuZENoaWxkKGJhZGdlKTtcbiAgICB9XG4gICAgYXN5bmMgZmlsbEZpZWxkKGVsZW1lbnQsIHZhbHVlKSB7XG4gICAgICAgIGNvbnN0IHRhZ05hbWUgPSBlbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgY29uc3QgaW5wdXRUeXBlID0gZWxlbWVudC50eXBlPy50b0xvd2VyQ2FzZSgpIHx8IFwidGV4dFwiO1xuICAgICAgICAvLyBIYW5kbGUgZGlmZmVyZW50IGlucHV0IHR5cGVzXG4gICAgICAgIGlmICh0YWdOYW1lID09PSBcInNlbGVjdFwiKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5maWxsU2VsZWN0KGVsZW1lbnQsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGFnTmFtZSA9PT0gXCJ0ZXh0YXJlYVwiKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5maWxsVGV4dElucHV0KGVsZW1lbnQsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGFnTmFtZSA9PT0gXCJpbnB1dFwiKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKGlucHV0VHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgXCJ0ZXh0XCI6XG4gICAgICAgICAgICAgICAgY2FzZSBcImVtYWlsXCI6XG4gICAgICAgICAgICAgICAgY2FzZSBcInRlbFwiOlxuICAgICAgICAgICAgICAgIGNhc2UgXCJ1cmxcIjpcbiAgICAgICAgICAgICAgICBjYXNlIFwibnVtYmVyXCI6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbGxUZXh0SW5wdXQoZWxlbWVudCwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJjaGVja2JveFwiOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5maWxsQ2hlY2tib3goZWxlbWVudCwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJyYWRpb1wiOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5maWxsUmFkaW8oZWxlbWVudCwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJkYXRlXCI6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbGxEYXRlSW5wdXQoZWxlbWVudCwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbGxUZXh0SW5wdXQoZWxlbWVudCwgdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgZmlsbFRleHRJbnB1dChlbGVtZW50LCB2YWx1ZSkge1xuICAgICAgICAvLyBGb2N1cyB0aGUgZWxlbWVudFxuICAgICAgICBlbGVtZW50LmZvY3VzKCk7XG4gICAgICAgIC8vIENsZWFyIGV4aXN0aW5nIHZhbHVlXG4gICAgICAgIGVsZW1lbnQudmFsdWUgPSBcIlwiO1xuICAgICAgICAvLyBTZXQgbmV3IHZhbHVlXG4gICAgICAgIGVsZW1lbnQudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgLy8gRGlzcGF0Y2ggZXZlbnRzIHRvIHRyaWdnZXIgdmFsaWRhdGlvbiBhbmQgZnJhbWV3b3Jrc1xuICAgICAgICB0aGlzLmRpc3BhdGNoSW5wdXRFdmVudHMoZWxlbWVudCk7XG4gICAgICAgIHJldHVybiBlbGVtZW50LnZhbHVlID09PSB2YWx1ZTtcbiAgICB9XG4gICAgZmlsbFNlbGVjdChlbGVtZW50LCB2YWx1ZSkge1xuICAgICAgICBjb25zdCBvcHRpb25zID0gQXJyYXkuZnJvbShlbGVtZW50Lm9wdGlvbnMpO1xuICAgICAgICBjb25zdCBub3JtYWxpemVkVmFsdWUgPSB2YWx1ZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAvLyBUcnkgZXhhY3QgbWF0Y2ggZmlyc3RcbiAgICAgICAgbGV0IG1hdGNoaW5nT3B0aW9uID0gb3B0aW9ucy5maW5kKChvcHQpID0+IG9wdC52YWx1ZS50b0xvd2VyQ2FzZSgpID09PSBub3JtYWxpemVkVmFsdWUgfHxcbiAgICAgICAgICAgIG9wdC50ZXh0LnRvTG93ZXJDYXNlKCkgPT09IG5vcm1hbGl6ZWRWYWx1ZSk7XG4gICAgICAgIC8vIFRyeSBwYXJ0aWFsIG1hdGNoXG4gICAgICAgIGlmICghbWF0Y2hpbmdPcHRpb24pIHtcbiAgICAgICAgICAgIG1hdGNoaW5nT3B0aW9uID0gb3B0aW9ucy5maW5kKChvcHQpID0+IG9wdC52YWx1ZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKG5vcm1hbGl6ZWRWYWx1ZSkgfHxcbiAgICAgICAgICAgICAgICBvcHQudGV4dC50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKG5vcm1hbGl6ZWRWYWx1ZSkgfHxcbiAgICAgICAgICAgICAgICBub3JtYWxpemVkVmFsdWUuaW5jbHVkZXMob3B0LnZhbHVlLnRvTG93ZXJDYXNlKCkpIHx8XG4gICAgICAgICAgICAgICAgbm9ybWFsaXplZFZhbHVlLmluY2x1ZGVzKG9wdC50ZXh0LnRvTG93ZXJDYXNlKCkpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobWF0Y2hpbmdPcHRpb24pIHtcbiAgICAgICAgICAgIGVsZW1lbnQudmFsdWUgPSBtYXRjaGluZ09wdGlvbi52YWx1ZTtcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hJbnB1dEV2ZW50cyhlbGVtZW50KTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgZmlsbENoZWNrYm94KGVsZW1lbnQsIHZhbHVlKSB7XG4gICAgICAgIGNvbnN0IHNob3VsZENoZWNrID0gW1widHJ1ZVwiLCBcInllc1wiLCBcIjFcIiwgXCJvblwiXS5pbmNsdWRlcyh2YWx1ZS50b0xvd2VyQ2FzZSgpKTtcbiAgICAgICAgZWxlbWVudC5jaGVja2VkID0gc2hvdWxkQ2hlY2s7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hJbnB1dEV2ZW50cyhlbGVtZW50KTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGZpbGxSYWRpbyhlbGVtZW50LCB2YWx1ZSkge1xuICAgICAgICBjb25zdCBub3JtYWxpemVkVmFsdWUgPSB2YWx1ZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAvLyBGaW5kIHRoZSByYWRpbyBncm91cFxuICAgICAgICBjb25zdCBuYW1lID0gZWxlbWVudC5uYW1lO1xuICAgICAgICBpZiAoIW5hbWUpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGNvbnN0IHJhZGlvcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoYGlucHV0W3R5cGU9XCJyYWRpb1wiXVtuYW1lPVwiJHtuYW1lfVwiXWApO1xuICAgICAgICBmb3IgKGNvbnN0IHJhZGlvIG9mIHJhZGlvcykge1xuICAgICAgICAgICAgY29uc3QgcmFkaW9JbnB1dCA9IHJhZGlvO1xuICAgICAgICAgICAgY29uc3QgcmFkaW9WYWx1ZSA9IHJhZGlvSW5wdXQudmFsdWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIGNvbnN0IHJhZGlvTGFiZWwgPSB0aGlzLmdldFJhZGlvTGFiZWwocmFkaW9JbnB1dCk/LnRvTG93ZXJDYXNlKCkgfHwgXCJcIjtcbiAgICAgICAgICAgIGlmIChyYWRpb1ZhbHVlID09PSBub3JtYWxpemVkVmFsdWUgfHxcbiAgICAgICAgICAgICAgICByYWRpb0xhYmVsLmluY2x1ZGVzKG5vcm1hbGl6ZWRWYWx1ZSkgfHxcbiAgICAgICAgICAgICAgICBub3JtYWxpemVkVmFsdWUuaW5jbHVkZXMocmFkaW9WYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICByYWRpb0lucHV0LmNoZWNrZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hJbnB1dEV2ZW50cyhyYWRpb0lucHV0KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGZpbGxEYXRlSW5wdXQoZWxlbWVudCwgdmFsdWUpIHtcbiAgICAgICAgLy8gVHJ5IHRvIHBhcnNlIGFuZCBmb3JtYXQgdGhlIGRhdGVcbiAgICAgICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKHZhbHVlKTtcbiAgICAgICAgaWYgKGlzTmFOKGRhdGUuZ2V0VGltZSgpKSlcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgLy8gRm9ybWF0IGFzIFlZWVktTU0tREQgZm9yIGRhdGUgaW5wdXRcbiAgICAgICAgY29uc3QgZm9ybWF0dGVkID0gZGF0ZS50b0lTT1N0cmluZygpLnNwbGl0KFwiVFwiKVswXTtcbiAgICAgICAgZWxlbWVudC52YWx1ZSA9IGZvcm1hdHRlZDtcbiAgICAgICAgdGhpcy5kaXNwYXRjaElucHV0RXZlbnRzKGVsZW1lbnQpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgZ2V0UmFkaW9MYWJlbChyYWRpbykge1xuICAgICAgICAvLyBDaGVjayBmb3IgYXNzb2NpYXRlZCBsYWJlbFxuICAgICAgICBpZiAocmFkaW8uaWQpIHtcbiAgICAgICAgICAgIGNvbnN0IGxhYmVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgbGFiZWxbZm9yPVwiJHtyYWRpby5pZH1cIl1gKTtcbiAgICAgICAgICAgIGlmIChsYWJlbClcbiAgICAgICAgICAgICAgICByZXR1cm4gbGFiZWwudGV4dENvbnRlbnQ/LnRyaW0oKSB8fCBudWxsO1xuICAgICAgICB9XG4gICAgICAgIC8vIENoZWNrIGZvciB3cmFwcGluZyBsYWJlbFxuICAgICAgICBjb25zdCBwYXJlbnQgPSByYWRpby5jbG9zZXN0KFwibGFiZWxcIik7XG4gICAgICAgIGlmIChwYXJlbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBwYXJlbnQudGV4dENvbnRlbnQ/LnRyaW0oKSB8fCBudWxsO1xuICAgICAgICB9XG4gICAgICAgIC8vIENoZWNrIGZvciBuZXh0IHNpYmxpbmcgdGV4dFxuICAgICAgICBjb25zdCBuZXh0ID0gcmFkaW8ubmV4dFNpYmxpbmc7XG4gICAgICAgIGlmIChuZXh0Py5ub2RlVHlwZSA9PT0gTm9kZS5URVhUX05PREUpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXh0LnRleHRDb250ZW50Py50cmltKCkgfHwgbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZGlzcGF0Y2hJbnB1dEV2ZW50cyhlbGVtZW50KSB7XG4gICAgICAgIC8vIERpc3BhdGNoIGV2ZW50cyBpbiBvcmRlciB0aGF0IG1vc3QgZnJhbWV3b3JrcyBleHBlY3RcbiAgICAgICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcImZvY3VzXCIsIHsgYnViYmxlczogdHJ1ZSB9KSk7XG4gICAgICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJpbnB1dFwiLCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xuICAgICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwiY2hhbmdlXCIsIHsgYnViYmxlczogdHJ1ZSB9KSk7XG4gICAgICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJibHVyXCIsIHsgYnViYmxlczogdHJ1ZSB9KSk7XG4gICAgICAgIC8vIEZvciBSZWFjdCBjb250cm9sbGVkIGNvbXBvbmVudHNcbiAgICAgICAgY29uc3QgbmF0aXZlSW5wdXRWYWx1ZVNldHRlciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iod2luZG93LkhUTUxJbnB1dEVsZW1lbnQucHJvdG90eXBlLCBcInZhbHVlXCIpPy5zZXQ7XG4gICAgICAgIGlmIChuYXRpdmVJbnB1dFZhbHVlU2V0dGVyICYmIGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGVsZW1lbnQudmFsdWU7XG4gICAgICAgICAgICBuYXRpdmVJbnB1dFZhbHVlU2V0dGVyLmNhbGwoZWxlbWVudCwgdmFsdWUpO1xuICAgICAgICAgICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcImlucHV0XCIsIHsgYnViYmxlczogdHJ1ZSB9KSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiBmaWVsZEtleShmaWVsZCkge1xuICAgIC8vIFN0YWJsZSBwZXItZmllbGQgbWFya2VyIHNvIHJlcGVhdCBmaWxscyBkb24ndCBzdGFjayBiYWRnZXMuXG4gICAgY29uc3QgZWwgPSBmaWVsZC5lbGVtZW50O1xuICAgIHJldHVybiBlbC5pZCB8fCBlbC5uYW1lIHx8IGAke2ZpZWxkLmZpZWxkVHlwZX0tJHtlbC50YWdOYW1lfWA7XG59XG5mdW5jdGlvbiBjc3NFc2NhcGUodmFsdWUpIHtcbiAgICAvLyBNaW5pbWFsIGVzY2FwZSBzdWZmaWNpZW50IGZvciBhdHRyaWJ1dGUgc2VsZWN0b3JzIGJ1aWx0IGZyb20gZWxlbWVudCBpZHMgL1xuICAgIC8vIG5hbWVzLiBBdm9pZHMgcHVsbGluZyBpbiBhIHBvbHlmaWxsIGZvciBlbnZpcm9ubWVudHMgd2l0aG91dCBDU1MuZXNjYXBlLlxuICAgIGlmICh0eXBlb2YgQ1NTICE9PSBcInVuZGVmaW5lZFwiICYmIHR5cGVvZiBDU1MuZXNjYXBlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIENTUy5lc2NhcGUodmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWUucmVwbGFjZSgvKFtcIlxcXFxcXFtcXF1dKS9nLCBcIlxcXFwkMVwiKTtcbn1cbiIsIi8vIEJhc2Ugc2NyYXBlciBpbnRlcmZhY2UgYW5kIHV0aWxpdGllc1xuZXhwb3J0IGNsYXNzIEJhc2VTY3JhcGVyIHtcbiAgICAvLyBTaGFyZWQgdXRpbGl0aWVzXG4gICAgZXh0cmFjdFRleHRDb250ZW50KHNlbGVjdG9yKSB7XG4gICAgICAgIGNvbnN0IGVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgICAgIHJldHVybiBlbD8udGV4dENvbnRlbnQ/LnRyaW0oKSB8fCBudWxsO1xuICAgIH1cbiAgICBleHRyYWN0SHRtbENvbnRlbnQoc2VsZWN0b3IpIHtcbiAgICAgICAgY29uc3QgZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgICAgcmV0dXJuIGVsPy5pbm5lckhUTUw/LnRyaW0oKSB8fCBudWxsO1xuICAgIH1cbiAgICBleHRyYWN0QXR0cmlidXRlKHNlbGVjdG9yLCBhdHRyKSB7XG4gICAgICAgIGNvbnN0IGVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgICAgIHJldHVybiBlbD8uZ2V0QXR0cmlidXRlKGF0dHIpIHx8IG51bGw7XG4gICAgfVxuICAgIGV4dHJhY3RBbGxUZXh0KHNlbGVjdG9yKSB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKGVsZW1lbnRzKVxuICAgICAgICAgICAgLm1hcCgoZWwpID0+IGVsLnRleHRDb250ZW50Py50cmltKCkpXG4gICAgICAgICAgICAuZmlsdGVyKCh0ZXh0KSA9PiAhIXRleHQpO1xuICAgIH1cbiAgICB3YWl0Rm9yRWxlbWVudChzZWxlY3RvciwgdGltZW91dCA9IDUwMDApIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgICAgICAgICBpZiAoZWwpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoZWwpO1xuICAgICAgICAgICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigoXywgb2JzKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgICAgICAgICAgICBpZiAoZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgb2JzLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShlbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmJvZHksIHsgY2hpbGRMaXN0OiB0cnVlLCBzdWJ0cmVlOiB0cnVlIH0pO1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoYEVsZW1lbnQgJHtzZWxlY3Rvcn0gbm90IGZvdW5kIGFmdGVyICR7dGltZW91dH1tc2ApKTtcbiAgICAgICAgICAgIH0sIHRpbWVvdXQpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgZXh0cmFjdFJlcXVpcmVtZW50cyh0ZXh0KSB7XG4gICAgICAgIGNvbnN0IHJlcXVpcmVtZW50cyA9IFtdO1xuICAgICAgICAvLyBTcGxpdCBieSBjb21tb24gYnVsbGV0IHBhdHRlcm5zXG4gICAgICAgIGNvbnN0IGxpbmVzID0gdGV4dC5zcGxpdCgvXFxufOKAonzil6Z84peGfOKWqnzil498LVxcc3xcXCpcXHMvKTtcbiAgICAgICAgZm9yIChjb25zdCBsaW5lIG9mIGxpbmVzKSB7XG4gICAgICAgICAgICBjb25zdCBjbGVhbmVkID0gbGluZS50cmltKCk7XG4gICAgICAgICAgICBpZiAoY2xlYW5lZC5sZW5ndGggPiAyMCAmJiBjbGVhbmVkLmxlbmd0aCA8IDUwMCkge1xuICAgICAgICAgICAgICAgIC8vIENoZWNrIGlmIGl0IGxvb2tzIGxpa2UgYSByZXF1aXJlbWVudFxuICAgICAgICAgICAgICAgIGlmIChjbGVhbmVkLm1hdGNoKC9eKHlvdXx3ZXx0aGV8bXVzdHxzaG91bGR8d2lsbHxleHBlcmllbmNlfHByb2ZpY2llbmN5fGtub3dsZWRnZXxhYmlsaXR5fHN0cm9uZ3xleGNlbGxlbnQpL2kpIHx8XG4gICAgICAgICAgICAgICAgICAgIGNsZWFuZWQubWF0Y2goL3JlcXVpcmVkfHByZWZlcnJlZHxib251c3xwbHVzL2kpIHx8XG4gICAgICAgICAgICAgICAgICAgIGNsZWFuZWQubWF0Y2goL15cXGQrXFwrP1xccyp5ZWFycz8vaSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVxdWlyZW1lbnRzLnB1c2goY2xlYW5lZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXF1aXJlbWVudHMuc2xpY2UoMCwgMTUpO1xuICAgIH1cbiAgICBleHRyYWN0S2V5d29yZHModGV4dCkge1xuICAgICAgICBjb25zdCBrZXl3b3JkcyA9IG5ldyBTZXQoKTtcbiAgICAgICAgLy8gQ29tbW9uIHRlY2ggc2tpbGxzIHBhdHRlcm5zXG4gICAgICAgIGNvbnN0IHRlY2hQYXR0ZXJucyA9IFtcbiAgICAgICAgICAgIC9cXGIocmVhY3R8YW5ndWxhcnx2dWV8c3ZlbHRlfG5leHRcXC4/anN8bnV4dClcXGIvZ2ksXG4gICAgICAgICAgICAvXFxiKG5vZGVcXC4/anN8ZXhwcmVzc3xmYXN0aWZ5fG5lc3RcXC4/anMpXFxiL2dpLFxuICAgICAgICAgICAgL1xcYihweXRob258ZGphbmdvfGZsYXNrfGZhc3RhcGkpXFxiL2dpLFxuICAgICAgICAgICAgL1xcYihqYXZhfHNwcmluZ3xrb3RsaW4pXFxiL2dpLFxuICAgICAgICAgICAgL1xcYihnb3xnb2xhbmd8cnVzdHxjXFwrXFwrfGMjfFxcLm5ldClcXGIvZ2ksXG4gICAgICAgICAgICAvXFxiKHR5cGVzY3JpcHR8amF2YXNjcmlwdHxlczYpXFxiL2dpLFxuICAgICAgICAgICAgL1xcYihzcWx8bXlzcWx8cG9zdGdyZXNxbHxtb25nb2RifHJlZGlzfGVsYXN0aWNzZWFyY2gpXFxiL2dpLFxuICAgICAgICAgICAgL1xcYihhd3N8Z2NwfGF6dXJlfGRvY2tlcnxrdWJlcm5ldGVzfGs4cylcXGIvZ2ksXG4gICAgICAgICAgICAvXFxiKGdpdHxjaVxcL2NkfGplbmtpbnN8Z2l0aHViXFxzKmFjdGlvbnMpXFxiL2dpLFxuICAgICAgICAgICAgL1xcYihncmFwaHFsfHJlc3R8YXBpfG1pY3Jvc2VydmljZXMpXFxiL2dpLFxuICAgICAgICBdO1xuICAgICAgICBmb3IgKGNvbnN0IHBhdHRlcm4gb2YgdGVjaFBhdHRlcm5zKSB7XG4gICAgICAgICAgICBjb25zdCBtYXRjaGVzID0gdGV4dC5tYXRjaChwYXR0ZXJuKTtcbiAgICAgICAgICAgIGlmIChtYXRjaGVzKSB7XG4gICAgICAgICAgICAgICAgbWF0Y2hlcy5mb3JFYWNoKChtKSA9PiBrZXl3b3Jkcy5hZGQobS50b0xvd2VyQ2FzZSgpLnRyaW0oKSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKGtleXdvcmRzKTtcbiAgICB9XG4gICAgZGV0ZWN0Sm9iVHlwZSh0ZXh0KSB7XG4gICAgICAgIGNvbnN0IGxvd2VyID0gdGV4dC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBpZiAobG93ZXIuaW5jbHVkZXMoXCJpbnRlcm5cIikgfHxcbiAgICAgICAgICAgIGxvd2VyLmluY2x1ZGVzKFwiaW50ZXJuc2hpcFwiKSB8fFxuICAgICAgICAgICAgbG93ZXIuaW5jbHVkZXMoXCJjby1vcFwiKSkge1xuICAgICAgICAgICAgcmV0dXJuIFwiaW50ZXJuc2hpcFwiO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsb3dlci5pbmNsdWRlcyhcImNvbnRyYWN0XCIpIHx8IGxvd2VyLmluY2x1ZGVzKFwiY29udHJhY3RvclwiKSkge1xuICAgICAgICAgICAgcmV0dXJuIFwiY29udHJhY3RcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAobG93ZXIuaW5jbHVkZXMoXCJwYXJ0LXRpbWVcIikgfHwgbG93ZXIuaW5jbHVkZXMoXCJwYXJ0IHRpbWVcIikpIHtcbiAgICAgICAgICAgIHJldHVybiBcInBhcnQtdGltZVwiO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsb3dlci5pbmNsdWRlcyhcImZ1bGwtdGltZVwiKSB8fCBsb3dlci5pbmNsdWRlcyhcImZ1bGwgdGltZVwiKSkge1xuICAgICAgICAgICAgcmV0dXJuIFwiZnVsbC10aW1lXCI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgZGV0ZWN0UmVtb3RlKHRleHQpIHtcbiAgICAgICAgY29uc3QgbG93ZXIgPSB0ZXh0LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIHJldHVybiAobG93ZXIuaW5jbHVkZXMoXCJyZW1vdGVcIikgfHxcbiAgICAgICAgICAgIGxvd2VyLmluY2x1ZGVzKFwid29yayBmcm9tIGhvbWVcIikgfHxcbiAgICAgICAgICAgIGxvd2VyLmluY2x1ZGVzKFwid2ZoXCIpIHx8XG4gICAgICAgICAgICBsb3dlci5pbmNsdWRlcyhcImZ1bGx5IGRpc3RyaWJ1dGVkXCIpIHx8XG4gICAgICAgICAgICBsb3dlci5pbmNsdWRlcyhcImFueXdoZXJlXCIpKTtcbiAgICB9XG4gICAgZXh0cmFjdFNhbGFyeSh0ZXh0KSB7XG4gICAgICAgIC8vIE1hdGNoIHNhbGFyeSBwYXR0ZXJucyBsaWtlICQxMDAsMDAwIC0gJDE1MCwwMDAgb3IgJDEwMGsgLSAkMTUwa1xuICAgICAgICBjb25zdCBwYXR0ZXJuID0gL1xcJFtcXGQsXSsoPzprKT8oPzpcXHMqWy3igJNdXFxzKlxcJFtcXGQsXSsoPzprKT8pPyg/OlxccyooPzpwZXJ8XFwvKVxccyooPzp5ZWFyfHlyfGFubnVtfGFubnVhbHxob3VyfGhyKSk/L2dpO1xuICAgICAgICBjb25zdCBtYXRjaCA9IHBhdHRlcm4uZXhlYyh0ZXh0KTtcbiAgICAgICAgcmV0dXJuIG1hdGNoID8gbWF0Y2hbMF0gOiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGNsZWFuRGVzY3JpcHRpb24oaHRtbCkge1xuICAgICAgICAvLyBSZW1vdmUgSFRNTCB0YWdzIGJ1dCBwcmVzZXJ2ZSBsaW5lIGJyZWFrc1xuICAgICAgICByZXR1cm4gaHRtbFxuICAgICAgICAgICAgLnJlcGxhY2UoLzxiclxccypcXC8/Pi9naSwgXCJcXG5cIilcbiAgICAgICAgICAgIC5yZXBsYWNlKC88XFwvcD4vZ2ksIFwiXFxuXFxuXCIpXG4gICAgICAgICAgICAucmVwbGFjZSgvPFxcL2Rpdj4vZ2ksIFwiXFxuXCIpXG4gICAgICAgICAgICAucmVwbGFjZSgvPFxcL2xpPi9naSwgXCJcXG5cIilcbiAgICAgICAgICAgIC5yZXBsYWNlKC88W14+XSs+L2csIFwiXCIpXG4gICAgICAgICAgICAucmVwbGFjZSgvJm5ic3A7L2csIFwiIFwiKVxuICAgICAgICAgICAgLnJlcGxhY2UoLyZhbXA7L2csIFwiJlwiKVxuICAgICAgICAgICAgLnJlcGxhY2UoLyZsdDsvZywgXCI8XCIpXG4gICAgICAgICAgICAucmVwbGFjZSgvJmd0Oy9nLCBcIj5cIilcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cXG57Myx9L2csIFwiXFxuXFxuXCIpXG4gICAgICAgICAgICAudHJpbSgpO1xuICAgIH1cbn1cbiIsIi8vIExpbmtlZEluIGpvYiBzY3JhcGVyXG5pbXBvcnQgeyBCYXNlU2NyYXBlciB9IGZyb20gXCIuL2Jhc2Utc2NyYXBlclwiO1xuZXhwb3J0IGNsYXNzIExpbmtlZEluU2NyYXBlciBleHRlbmRzIEJhc2VTY3JhcGVyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcbiAgICAgICAgdGhpcy5zb3VyY2UgPSBcImxpbmtlZGluXCI7XG4gICAgICAgIHRoaXMudXJsUGF0dGVybnMgPSBbXG4gICAgICAgICAgICAvbGlua2VkaW5cXC5jb21cXC9qb2JzXFwvdmlld1xcLyhcXGQrKS8sXG4gICAgICAgICAgICAvbGlua2VkaW5cXC5jb21cXC9qb2JzXFwvc2VhcmNoLXJlc3VsdHMvLFxuICAgICAgICAgICAgL2xpbmtlZGluXFwuY29tXFwvam9ic1xcL3NlYXJjaC8sXG4gICAgICAgICAgICAvbGlua2VkaW5cXC5jb21cXC9qb2JzXFwvY29sbGVjdGlvbnMvLFxuICAgICAgICBdO1xuICAgIH1cbiAgICBjYW5IYW5kbGUodXJsKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnVybFBhdHRlcm5zLnNvbWUoKHApID0+IHAudGVzdCh1cmwpKTtcbiAgICB9XG4gICAgYXN5bmMgc2NyYXBlSm9iTGlzdGluZygpIHtcbiAgICAgICAgLy8gV2FpdCBmb3Igam9iIGRldGFpbHMgdG8gbG9hZFxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy53YWl0Rm9yRWxlbWVudChcIi5qb2ItZGV0YWlscy1qb2JzLXVuaWZpZWQtdG9wLWNhcmRfX2pvYi10aXRsZSwgLmpvYnMtdW5pZmllZC10b3AtY2FyZF9fam9iLXRpdGxlLCAuc2NhZmZvbGQtbGF5b3V0X19kZXRhaWwgaDEsIG1haW4gaDFcIiwgMzAwMCk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2gge1xuICAgICAgICAgICAgLy8gVHJ5IGFsdGVybmF0aXZlIHNlbGVjdG9yc1xuICAgICAgICB9XG4gICAgICAgIC8vIFRyeSBtdWx0aXBsZSBzZWxlY3RvciBzdHJhdGVnaWVzIChMaW5rZWRJbiBjaGFuZ2VzIERPTSBmcmVxdWVudGx5KVxuICAgICAgICBjb25zdCB0aXRsZSA9IHRoaXMuZXh0cmFjdEpvYlRpdGxlKCk7XG4gICAgICAgIGNvbnN0IGNvbXBhbnkgPSB0aGlzLmV4dHJhY3RDb21wYW55KCkgfHwgdGhpcy5leHRyYWN0Q29tcGFueUZyb21UZXh0KHRpdGxlKTtcbiAgICAgICAgY29uc3QgbG9jYXRpb24gPSB0aGlzLmV4dHJhY3RMb2NhdGlvbigpIHx8IHRoaXMuZXh0cmFjdExvY2F0aW9uRnJvbVRleHQoKTtcbiAgICAgICAgY29uc3QgZGVzY3JpcHRpb24gPSB0aGlzLmV4dHJhY3REZXNjcmlwdGlvbigpIHx8XG4gICAgICAgICAgICB0aGlzLmJ1aWxkRmFsbGJhY2tEZXNjcmlwdGlvbih0aXRsZSwgY29tcGFueSwgbG9jYXRpb24pO1xuICAgICAgICBpZiAoIXRpdGxlIHx8ICFjb21wYW55KSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIltTbG90aGluZ10gTGlua2VkSW4gc2NyYXBlcjogTWlzc2luZyByZXF1aXJlZCBmaWVsZHNcIiwge1xuICAgICAgICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgICAgICAgIGNvbXBhbnksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICEhZGVzY3JpcHRpb24sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIC8vIFRyeSB0byBleHRyYWN0IGZyb20gc3RydWN0dXJlZCBkYXRhXG4gICAgICAgIGNvbnN0IHN0cnVjdHVyZWREYXRhID0gdGhpcy5leHRyYWN0U3RydWN0dXJlZERhdGEoKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgICAgY29tcGFueSxcbiAgICAgICAgICAgIGxvY2F0aW9uOiBsb2NhdGlvbiB8fCBzdHJ1Y3R1cmVkRGF0YT8ubG9jYXRpb24sXG4gICAgICAgICAgICBkZXNjcmlwdGlvbixcbiAgICAgICAgICAgIHJlcXVpcmVtZW50czogdGhpcy5leHRyYWN0UmVxdWlyZW1lbnRzKGRlc2NyaXB0aW9uKSxcbiAgICAgICAgICAgIGtleXdvcmRzOiB0aGlzLmV4dHJhY3RLZXl3b3JkcyhkZXNjcmlwdGlvbiksXG4gICAgICAgICAgICBzYWxhcnk6IHRoaXMuZXh0cmFjdFNhbGFyeShkZXNjcmlwdGlvbikgfHwgc3RydWN0dXJlZERhdGE/LnNhbGFyeSxcbiAgICAgICAgICAgIHR5cGU6IHRoaXMuZGV0ZWN0Sm9iVHlwZShkZXNjcmlwdGlvbiksXG4gICAgICAgICAgICByZW1vdGU6IHRoaXMuZGV0ZWN0UmVtb3RlKGxvY2F0aW9uIHx8IFwiXCIpIHx8IHRoaXMuZGV0ZWN0UmVtb3RlKGRlc2NyaXB0aW9uKSxcbiAgICAgICAgICAgIHVybDogd2luZG93LmxvY2F0aW9uLmhyZWYsXG4gICAgICAgICAgICBzb3VyY2U6IHRoaXMuc291cmNlLFxuICAgICAgICAgICAgc291cmNlSm9iSWQ6IHRoaXMuZXh0cmFjdEpvYklkKCksXG4gICAgICAgICAgICBwb3N0ZWRBdDogc3RydWN0dXJlZERhdGE/LnBvc3RlZEF0LFxuICAgICAgICB9O1xuICAgIH1cbiAgICBhc3luYyBzY3JhcGVKb2JMaXN0KCkge1xuICAgICAgICBjb25zdCBqb2JzID0gW107XG4gICAgICAgIC8vIEpvYiBjYXJkcyBpbiBzZWFyY2ggcmVzdWx0c1xuICAgICAgICBjb25zdCBqb2JDYXJkcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuam9iLWNhcmQtY29udGFpbmVyLCAuam9icy1zZWFyY2gtcmVzdWx0c19fbGlzdC1pdGVtLCAuc2NhZmZvbGQtbGF5b3V0X19saXN0LWl0ZW1cIik7XG4gICAgICAgIGZvciAoY29uc3QgY2FyZCBvZiBqb2JDYXJkcykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCB0aXRsZUVsID0gY2FyZC5xdWVyeVNlbGVjdG9yKCcuam9iLWNhcmQtbGlzdF9fdGl0bGUsIC5qb2ItY2FyZC1jb250YWluZXJfX2xpbmssIGFbZGF0YS1jb250cm9sLW5hbWU9XCJqb2JfY2FyZF90aXRsZVwiXScpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbXBhbnlFbCA9IGNhcmQucXVlcnlTZWxlY3RvcihcIi5qb2ItY2FyZC1jb250YWluZXJfX2NvbXBhbnktbmFtZSwgLmpvYi1jYXJkLWNvbnRhaW5lcl9fcHJpbWFyeS1kZXNjcmlwdGlvblwiKTtcbiAgICAgICAgICAgICAgICBjb25zdCBsb2NhdGlvbkVsID0gY2FyZC5xdWVyeVNlbGVjdG9yKFwiLmpvYi1jYXJkLWNvbnRhaW5lcl9fbWV0YWRhdGEtaXRlbVwiKTtcbiAgICAgICAgICAgICAgICBjb25zdCB0aXRsZSA9IHRpdGxlRWw/LnRleHRDb250ZW50Py50cmltKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgY29tcGFueSA9IGNvbXBhbnlFbD8udGV4dENvbnRlbnQ/LnRyaW0oKTtcbiAgICAgICAgICAgICAgICBjb25zdCBsb2NhdGlvbiA9IGxvY2F0aW9uRWw/LnRleHRDb250ZW50Py50cmltKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgdXJsID0gdGl0bGVFbD8uaHJlZjtcbiAgICAgICAgICAgICAgICBpZiAodGl0bGUgJiYgY29tcGFueSAmJiB1cmwpIHtcbiAgICAgICAgICAgICAgICAgICAgam9icy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGFueSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiXCIsIC8vIFdvdWxkIG5lZWQgdG8gbmF2aWdhdGUgdG8gZ2V0IGZ1bGwgZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmVtZW50czogW10sXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmwsXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IHRoaXMuc291cmNlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIltTbG90aGluZ10gRXJyb3Igc2NyYXBpbmcgam9iIGNhcmQ6XCIsIGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGpvYnM7XG4gICAgfVxuICAgIGV4dHJhY3RKb2JUaXRsZSgpIHtcbiAgICAgICAgY29uc3Qgc2VsZWN0b3JzID0gW1xuICAgICAgICAgICAgXCIuam9iLWRldGFpbHMtam9icy11bmlmaWVkLXRvcC1jYXJkX19qb2ItdGl0bGVcIixcbiAgICAgICAgICAgIFwiLmpvYnMtdW5pZmllZC10b3AtY2FyZF9fam9iLXRpdGxlXCIsXG4gICAgICAgICAgICBcIi50LTI0LmpvYi1kZXRhaWxzLWpvYnMtdW5pZmllZC10b3AtY2FyZF9fam9iLXRpdGxlXCIsXG4gICAgICAgICAgICBcImgxLnQtMjRcIixcbiAgICAgICAgICAgIFwiLmpvYnMtdG9wLWNhcmRfX2pvYi10aXRsZVwiLFxuICAgICAgICAgICAgXCIuc2NhZmZvbGQtbGF5b3V0X19kZXRhaWwgaDFcIixcbiAgICAgICAgICAgIFwiLmpvYnMtc2VhcmNoX19qb2ItZGV0YWlscy0tY29udGFpbmVyIGgxXCIsXG4gICAgICAgICAgICAnaDFbY2xhc3MqPVwiam9iLXRpdGxlXCJdJyxcbiAgICAgICAgICAgIFwibWFpbiBoMVwiLFxuICAgICAgICBdO1xuICAgICAgICBmb3IgKGNvbnN0IHNlbGVjdG9yIG9mIHNlbGVjdG9ycykge1xuICAgICAgICAgICAgY29uc3QgdGV4dCA9IHRoaXMuZXh0cmFjdFRleHRDb250ZW50KHNlbGVjdG9yKTtcbiAgICAgICAgICAgIGlmICh0ZXh0KVxuICAgICAgICAgICAgICAgIHJldHVybiB0ZXh0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBleHRyYWN0Q29tcGFueSgpIHtcbiAgICAgICAgY29uc3Qgc2VsZWN0b3JzID0gW1xuICAgICAgICAgICAgXCIuam9iLWRldGFpbHMtam9icy11bmlmaWVkLXRvcC1jYXJkX19jb21wYW55LW5hbWVcIixcbiAgICAgICAgICAgIFwiLmpvYnMtdW5pZmllZC10b3AtY2FyZF9fY29tcGFueS1uYW1lXCIsXG4gICAgICAgICAgICBcIi5qb2JzLXRvcC1jYXJkX19jb21wYW55LXVybFwiLFxuICAgICAgICAgICAgJ2FbZGF0YS10cmFja2luZy1jb250cm9sLW5hbWU9XCJwdWJsaWNfam9ic190b3BjYXJkLW9yZy1uYW1lXCJdJyxcbiAgICAgICAgICAgIFwiLmpvYi1kZXRhaWxzLWpvYnMtdW5pZmllZC10b3AtY2FyZF9fY29tcGFueS1uYW1lIGFcIixcbiAgICAgICAgICAgIFwiLmpvYi1kZXRhaWxzLWpvYnMtdW5pZmllZC10b3AtY2FyZF9fcHJpbWFyeS1kZXNjcmlwdGlvbi1jb250YWluZXIgYVwiLFxuICAgICAgICAgICAgXCIuam9icy11bmlmaWVkLXRvcC1jYXJkX19jb21wYW55LW5hbWUgYVwiLFxuICAgICAgICBdO1xuICAgICAgICBmb3IgKGNvbnN0IHNlbGVjdG9yIG9mIHNlbGVjdG9ycykge1xuICAgICAgICAgICAgY29uc3QgdGV4dCA9IHRoaXMuZXh0cmFjdFRleHRDb250ZW50KHNlbGVjdG9yKTtcbiAgICAgICAgICAgIGlmICh0ZXh0KVxuICAgICAgICAgICAgICAgIHJldHVybiB0ZXh0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBleHRyYWN0TG9jYXRpb24oKSB7XG4gICAgICAgIGNvbnN0IHNlbGVjdG9ycyA9IFtcbiAgICAgICAgICAgIFwiLmpvYi1kZXRhaWxzLWpvYnMtdW5pZmllZC10b3AtY2FyZF9fYnVsbGV0XCIsXG4gICAgICAgICAgICBcIi5qb2JzLXVuaWZpZWQtdG9wLWNhcmRfX2J1bGxldFwiLFxuICAgICAgICAgICAgXCIuam9icy10b3AtY2FyZF9fYnVsbGV0XCIsXG4gICAgICAgICAgICBcIi5qb2ItZGV0YWlscy1qb2JzLXVuaWZpZWQtdG9wLWNhcmRfX3ByaW1hcnktZGVzY3JpcHRpb24tY29udGFpbmVyIC50LWJsYWNrLS1saWdodFwiLFxuICAgICAgICBdO1xuICAgICAgICBmb3IgKGNvbnN0IHNlbGVjdG9yIG9mIHNlbGVjdG9ycykge1xuICAgICAgICAgICAgY29uc3QgdGV4dCA9IHRoaXMuZXh0cmFjdFRleHRDb250ZW50KHNlbGVjdG9yKTtcbiAgICAgICAgICAgIGlmICh0ZXh0ICYmICF0ZXh0LmluY2x1ZGVzKFwiYXBwbGljYW50XCIpICYmICF0ZXh0LmluY2x1ZGVzKFwiYWdvXCIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGV4dHJhY3REZXNjcmlwdGlvbigpIHtcbiAgICAgICAgY29uc3Qgc2VsZWN0b3JzID0gW1xuICAgICAgICAgICAgXCIuam9icy1kZXNjcmlwdGlvbl9fY29udGVudFwiLFxuICAgICAgICAgICAgXCIuam9icy1kZXNjcmlwdGlvbi1jb250ZW50X190ZXh0XCIsXG4gICAgICAgICAgICBcIi5qb2JzLWJveF9faHRtbC1jb250ZW50XCIsXG4gICAgICAgICAgICBcIiNqb2ItZGV0YWlsc1wiLFxuICAgICAgICAgICAgXCIuam9icy1kZXNjcmlwdGlvblwiLFxuICAgICAgICAgICAgXCIuam9icy1kZXNjcmlwdGlvbl9fY29udGFpbmVyXCIsXG4gICAgICAgIF07XG4gICAgICAgIGZvciAoY29uc3Qgc2VsZWN0b3Igb2Ygc2VsZWN0b3JzKSB7XG4gICAgICAgICAgICBjb25zdCBodG1sID0gdGhpcy5leHRyYWN0SHRtbENvbnRlbnQoc2VsZWN0b3IpO1xuICAgICAgICAgICAgaWYgKGh0bWwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jbGVhbkRlc2NyaXB0aW9uKGh0bWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBidWlsZEZhbGxiYWNrRGVzY3JpcHRpb24odGl0bGUsIGNvbXBhbnksIGxvY2F0aW9uKSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICB0aXRsZSAmJiBjb21wYW55ID8gYCR7dGl0bGV9IGF0ICR7Y29tcGFueX1gIDogdGl0bGUgfHwgY29tcGFueSxcbiAgICAgICAgICAgIGxvY2F0aW9uLFxuICAgICAgICAgICAgXCJMaW5rZWRJbiBqb2IgZGV0YWlscyB2aXNpYmxlOyBmdWxsIGRlc2NyaXB0aW9uIG5vdCBsb2FkZWQuXCIsXG4gICAgICAgIF1cbiAgICAgICAgICAgIC5maWx0ZXIoKHBhcnQpID0+ICEhcGFydClcbiAgICAgICAgICAgIC5qb2luKFwiXFxuXCIpO1xuICAgIH1cbiAgICBleHRyYWN0Sm9iSWQoKSB7XG4gICAgICAgIGNvbnN0IG1hdGNoID0gd2luZG93LmxvY2F0aW9uLmhyZWYubWF0Y2goL1xcL3ZpZXdcXC8oXFxkKykvKSB8fFxuICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYubWF0Y2goL1s/Jl1jdXJyZW50Sm9iSWQ9KFxcZCspLyk7XG4gICAgICAgIHJldHVybiBtYXRjaD8uWzFdO1xuICAgIH1cbiAgICBleHRyYWN0U3RydWN0dXJlZERhdGEoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBsZEpzb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdzY3JpcHRbdHlwZT1cImFwcGxpY2F0aW9uL2xkK2pzb25cIl0nKTtcbiAgICAgICAgICAgIGlmICghbGRKc29uPy50ZXh0Q29udGVudClcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKGxkSnNvbi50ZXh0Q29udGVudCk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGxvY2F0aW9uOiBkYXRhLmpvYkxvY2F0aW9uPy5hZGRyZXNzPy5hZGRyZXNzTG9jYWxpdHksXG4gICAgICAgICAgICAgICAgc2FsYXJ5OiBkYXRhLmJhc2VTYWxhcnk/LnZhbHVlXG4gICAgICAgICAgICAgICAgICAgID8gYCQke2RhdGEuYmFzZVNhbGFyeS52YWx1ZS5taW5WYWx1ZSB8fCBcIlwifS0ke2RhdGEuYmFzZVNhbGFyeS52YWx1ZS5tYXhWYWx1ZSB8fCBcIlwifWBcbiAgICAgICAgICAgICAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgcG9zdGVkQXQ6IGRhdGEuZGF0ZVBvc3RlZCxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2gge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZXh0cmFjdENvbXBhbnlGcm9tVGV4dCh0aXRsZSkge1xuICAgICAgICBpZiAoIXRpdGxlKVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIGNvbnN0IGxpbmVzID0gdGhpcy52aXNpYmxlTGluZXMoKTtcbiAgICAgICAgY29uc3QgaW5kZXggPSBsaW5lcy5maW5kSW5kZXgoKGxpbmUpID0+IGxpbmUgPT09IHRpdGxlKTtcbiAgICAgICAgY29uc3QgbmV4dCA9IGluZGV4ID49IDAgPyBsaW5lc1tpbmRleCArIDFdIDogdW5kZWZpbmVkO1xuICAgICAgICBpZiAoIW5leHQpXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgaWYgKC9eKGFwcGx5fHNhdmV8dmlld2VkfHByb21vdGVkfHJlc3BvbnNlcyBtYW5hZ2VkfG92ZXIgXFxkKykvaS50ZXN0KG5leHQpKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV4dDtcbiAgICB9XG4gICAgZXh0cmFjdExvY2F0aW9uRnJvbVRleHQoKSB7XG4gICAgICAgIHJldHVybiAodGhpcy52aXNpYmxlTGluZXMoKS5maW5kKChsaW5lKSA9PiAvXltBLVpdW0EtWmEteiAuJy1dKyxcXHMqW0EtWl17Mn1cXGIvLnRlc3QobGluZSkpIHx8IG51bGwpO1xuICAgIH1cbiAgICB2aXNpYmxlTGluZXMoKSB7XG4gICAgICAgIGNvbnN0IHRleHQgPSBkb2N1bWVudC5ib2R5LmlubmVyVGV4dCB8fFxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS50ZXh0Q29udGVudCB8fFxuICAgICAgICAgICAgXCJcIjtcbiAgICAgICAgcmV0dXJuIHRleHRcbiAgICAgICAgICAgIC5zcGxpdCgvXFxuKy8pXG4gICAgICAgICAgICAubWFwKChsaW5lKSA9PiBsaW5lLnRyaW0oKSlcbiAgICAgICAgICAgIC5maWx0ZXIoQm9vbGVhbik7XG4gICAgfVxufVxuIiwiLy8gV2F0ZXJsb28gV29ya3Mgam9iIHNjcmFwZXIgKFVuaXZlcnNpdHkgb2YgV2F0ZXJsb28gY28tb3AgcG9ydGFsKS5cbi8vXG4vLyBUYXJnZXRzIHRoZSBtb2Rlcm4gc3R1ZGVudCBwb3N0aW5nLXNlYXJjaCBVSSAoYm9keS5uZXctc3R1ZGVudF9fcG9zdGluZy1zZWFyY2gpLlxuLy8gVGhlIGxlZ2FjeSBPcmJpcy1lcmEgc2VsZWN0b3JzICgjcG9zdGluZ0RpdiwgLnBvc3RpbmctZGV0YWlscywgLmpvYi1saXN0aW5nLXRhYmxlKVxuLy8gYXJlIG5vIGxvbmdlciBwcmVzZW50IG9uIHRoZSBwcm9kdWN0aW9uIHNpdGU7IHRoaXMgc2NyYXBlciBkb2VzIG5vdCB0cnkgdG9cbi8vIHN1cHBvcnQgYm90aCDigJQgaWYgV1cgcmV2ZXJ0cyBvciBhIGRpZmZlcmVudCBzdXJmYWNlIGFwcGVhcnMsIGFkZCBhIGJyYW5jaC5cbmltcG9ydCB7IEJhc2VTY3JhcGVyIH0gZnJvbSBcIi4vYmFzZS1zY3JhcGVyXCI7XG4vLyBGaWVsZCBsYWJlbHMgZnJvbSB0aGUgbGl2ZSBVSS4gRWFjaCBlbnRyeSBsaXN0cyBwcmVmaXhlcyB3ZSB3YW50IHRvIG1hdGNoXG4vLyBhZ2FpbnN0IHRoZSAubGFiZWwgdGV4dCAod2hpY2ggaXMgbm9ybWFsaXplZCDigJQgdHJhaWxpbmcgY29sb25zIGFuZCB3aGl0ZXNwYWNlXG4vLyBzdHJpcHBlZCBiZWZvcmUgY29tcGFyaXNvbikuIFRoZSBmaXJzdCBtYXRjaGluZyBjYW5kaWRhdGUgd2lucyBwZXIgcm93LlxuY29uc3QgRklFTERfTEFCRUxTID0ge1xuICAgIHRpdGxlOiBbXCJKb2IgVGl0bGVcIl0sXG4gICAgc3VtbWFyeTogW1wiSm9iIFN1bW1hcnlcIl0sXG4gICAgcmVzcG9uc2liaWxpdGllczogW1wiSm9iIFJlc3BvbnNpYmlsaXRpZXNcIiwgXCJSZXNwb25zaWJpbGl0aWVzXCJdLFxuICAgIHJlcXVpcmVtZW50czogW1xuICAgICAgICBcIlJlcXVpcmVkIFNraWxsc1wiLFxuICAgICAgICBcIlRhcmdldGVkIFNraWxsc1wiLFxuICAgICAgICBcIlRhcmdldGVkIERlZ3JlZXMgYW5kIERpc2NpcGxpbmVzXCIsXG4gICAgXSxcbiAgICBvcmdhbml6YXRpb246IFtcIk9yZ2FuaXphdGlvblwiLCBcIkVtcGxveWVyXCIsIFwiQ29tcGFueVwiXSxcbiAgICAvLyBNb2Rlcm4gV1cgc3BsaXRzIGxvY2F0aW9uIGFjcm9zcyBtdWx0aXBsZSBsYWJlbGxlZCByb3dzOyB3ZSBjb2xsZWN0IGVhY2hcbiAgICAvLyBwaWVjZSBzZXBhcmF0ZWx5IGFuZCBzdGl0Y2ggdGhlbSBpbiBjb21wb3NlTG9jYXRpb24oKS5cbiAgICBsb2NhdGlvbkNpdHk6IFtcIkpvYiAtIENpdHlcIl0sXG4gICAgbG9jYXRpb25SZWdpb246IFtcIkpvYiAtIFByb3ZpbmNlL1N0YXRlXCIsIFwiSm9iIC0gUHJvdmluY2UgLyBTdGF0ZVwiXSxcbiAgICBsb2NhdGlvbkNvdW50cnk6IFtcIkpvYiAtIENvdW50cnlcIl0sXG4gICAgbG9jYXRpb25GdWxsOiBbXG4gICAgICAgIFwiSm9iIExvY2F0aW9uXCIsXG4gICAgICAgIFwiTG9jYXRpb25cIixcbiAgICAgICAgXCJKb2IgLSBDaXR5LCBQcm92aW5jZSAvIFN0YXRlLCBDb3VudHJ5XCIsXG4gICAgXSxcbiAgICBlbXBsb3ltZW50QXJyYW5nZW1lbnQ6IFtcIkVtcGxveW1lbnQgTG9jYXRpb24gQXJyYW5nZW1lbnRcIl0sXG4gICAgd29ya1Rlcm06IFtcIldvcmsgVGVybVwiXSxcbiAgICB3b3JrVGVybUR1cmF0aW9uOiBbXCJXb3JrIFRlcm0gRHVyYXRpb25cIl0sXG4gICAgbGV2ZWw6IFtcIkxldmVsXCJdLFxuICAgIG9wZW5pbmdzOiBbXCJOdW1iZXIgb2YgSm9iIE9wZW5pbmdzXCJdLFxuICAgIGRlYWRsaW5lOiBbXCJBcHBsaWNhdGlvbiBEZWFkbGluZVwiLCBcIkRlYWRsaW5lXCJdLFxuICAgIHNhbGFyeTogW1xuICAgICAgICBcIkNvbXBlbnNhdGlvbiBhbmQgQmVuZWZpdHMgSW5mb3JtYXRpb25cIixcbiAgICAgICAgXCJDb21wZW5zYXRpb24gYW5kIEJlbmVmaXRzXCIsXG4gICAgICAgIFwiQ29tcGVuc2F0aW9uXCIsXG4gICAgICAgIFwiU2FsYXJ5XCIsXG4gICAgXSxcbiAgICBqb2JUeXBlOiBbXCJKb2IgVHlwZVwiXSxcbn07XG5leHBvcnQgY2xhc3MgV2F0ZXJsb29Xb3Jrc1NjcmFwZXIgZXh0ZW5kcyBCYXNlU2NyYXBlciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKC4uLmFyZ3VtZW50cyk7XG4gICAgICAgIHRoaXMuc291cmNlID0gXCJ3YXRlcmxvb3dvcmtzXCI7XG4gICAgICAgIHRoaXMudXJsUGF0dGVybnMgPSBbL3dhdGVybG9vd29ya3NcXC51d2F0ZXJsb29cXC5jYS9dO1xuICAgIH1cbiAgICBjYW5IYW5kbGUodXJsKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnVybFBhdHRlcm5zLnNvbWUoKHApID0+IHAudGVzdCh1cmwpKTtcbiAgICB9XG4gICAgYXN5bmMgc2NyYXBlSm9iTGlzdGluZygpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNMb2dpblBhZ2UoKSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJbU2xvdGhpbmddIFdhdGVybG9vIFdvcmtzOiBQbGVhc2UgbG9nIGluIGZpcnN0XCIpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMud2FpdEZvckVsZW1lbnQoJy5kYXNoYm9hcmQtaGVhZGVyX19wb3N0aW5nLXRpdGxlLCBbcm9sZT1cImRpYWxvZ1wiXSwgLlJlYWN0TW9kYWxfX0NvbnRlbnQsIC5tb2RhbCcsIDMwMDApO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5pc0xpa2VseVBvc3RpbmdEZXRhaWwoKSkge1xuICAgICAgICAgICAgICAgIC8vIE5vIHBvc3RpbmcgcGFuZWwgb3BlbiDigJQgbm90IGEgc2NyYXBlIGVycm9yLCBqdXN0IG5vdGhpbmcgdG8gc2NyYXBlLlxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5pc0xpa2VseVBvc3RpbmdEZXRhaWwoKSlcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICBjb25zdCBmaWVsZHMgPSB0aGlzLmNvbGxlY3RGaWVsZHMoKTtcbiAgICAgICAgY29uc3QgeyBzb3VyY2VKb2JJZCwgdGl0bGU6IHBhbmVsVGl0bGUsIGNvbXBhbnk6IHBhbmVsQ29tcGFueSwgfSA9IHRoaXMucGFyc2VQb3N0aW5nSGVhZGVyKGZpZWxkcy50aXRsZSk7XG4gICAgICAgIGNvbnN0IHRpdGxlID0gZmllbGRzLnRpdGxlIHx8IHBhbmVsVGl0bGU7XG4gICAgICAgIGNvbnN0IGNvbXBhbnkgPSBmaWVsZHMub3JnYW5pemF0aW9uIHx8IHBhbmVsQ29tcGFueTtcbiAgICAgICAgY29uc3QgZGVzY3JpcHRpb24gPSB0aGlzLmNvbXBvc2VEZXNjcmlwdGlvbihmaWVsZHMpIHx8XG4gICAgICAgICAgICB0aGlzLmNvbXBvc2VGYWxsYmFja0Rlc2NyaXB0aW9uKGZpZWxkcywgdGl0bGUsIGNvbXBhbnkpO1xuICAgICAgICBpZiAoIXRpdGxlIHx8ICFkZXNjcmlwdGlvbikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJbU2xvdGhpbmddIFdhdGVybG9vIFdvcmtzIHNjcmFwZXI6IE1pc3NpbmcgdGl0bGUgb3IgZGVzY3JpcHRpb25cIik7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBsb2NhdGlvbiA9IHRoaXMuY29tcG9zZUxvY2F0aW9uKGZpZWxkcyk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICAgIGNvbXBhbnk6IGNvbXBhbnkgfHwgXCJVbmtub3duIEVtcGxveWVyXCIsXG4gICAgICAgICAgICBsb2NhdGlvbixcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgcmVxdWlyZW1lbnRzOiB0aGlzLnBhcnNlQnVsbGV0TGlzdChmaWVsZHMucmVxdWlyZW1lbnRzKSB8fFxuICAgICAgICAgICAgICAgIHRoaXMuZXh0cmFjdFJlcXVpcmVtZW50cyhkZXNjcmlwdGlvbiksXG4gICAgICAgICAgICByZXNwb25zaWJpbGl0aWVzOiB0aGlzLnBhcnNlQnVsbGV0TGlzdChmaWVsZHMucmVzcG9uc2liaWxpdGllcyksXG4gICAgICAgICAgICBrZXl3b3JkczogdGhpcy5leHRyYWN0S2V5d29yZHMoZGVzY3JpcHRpb24pLFxuICAgICAgICAgICAgLy8gU2xvdGhpbmcncyBleHRlbnNpb24gc2NoZW1hIGNhcHMgb3B0aW9uYWwgc3RyaW5ncyBhdCA1MDAgY2hhcnMgYW5kXG4gICAgICAgICAgICAvLyBXYXRlcmxvb1dvcmtzIHB1dHMgdGhlIGZ1bGwgYmVuZWZpdHMgYmx1cmIgaW4gXCJDb21wZW5zYXRpb24gYW5kXG4gICAgICAgICAgICAvLyBCZW5lZml0c1wiLiBUYWtlIHRoZSBmaXJzdCBsaW5lL3NlbnRlbmNlIHNvIHdhZ2UgcmFuZ2VzIHN1cnZpdmUuXG4gICAgICAgICAgICBzYWxhcnk6IHRoaXMuY29uZGVuc2VTYWxhcnkoZmllbGRzLnNhbGFyeSksXG4gICAgICAgICAgICB0eXBlOiB0aGlzLmRldGVjdEpvYlR5cGUoZmllbGRzLmpvYlR5cGUgfHwgZGVzY3JpcHRpb24pIHx8IFwiaW50ZXJuc2hpcFwiLFxuICAgICAgICAgICAgcmVtb3RlOiB0aGlzLmRldGVjdFJlbW90ZUZyb21GaWVsZHMoZmllbGRzLCBsb2NhdGlvbiwgZGVzY3JpcHRpb24pLFxuICAgICAgICAgICAgdXJsOiB3aW5kb3cubG9jYXRpb24uaHJlZixcbiAgICAgICAgICAgIHNvdXJjZTogdGhpcy5zb3VyY2UsXG4gICAgICAgICAgICBzb3VyY2VKb2JJZCxcbiAgICAgICAgICAgIGRlYWRsaW5lOiBmaWVsZHMuZGVhZGxpbmUsXG4gICAgICAgIH07XG4gICAgfVxuICAgIGFzeW5jIHNjcmFwZUpvYkxpc3QoKSB7XG4gICAgICAgIC8vIE1vZGVybiBXYXRlcmxvb1dvcmtzIHJlbmRlcnMgdGhlIHBvc3RpbmdzIGxpc3QgaW4gYSB2aXJ0dWFsaXplZCBTUEEgdmlld1xuICAgICAgICAvLyBhbmQgdGhlIHJvdyBzdW1tYXJpZXMgZG9uJ3QgaW5jbHVkZSBmdWxsIGRlc2NyaXB0aW9ucy4gQnVsay1pbXBvcnQgZnJvbVxuICAgICAgICAvLyB0aGUgbGlzdCB2aWV3IGlzIHByb3ZpZGVkIGJ5IHRoZSBvcmNoZXN0cmF0b3IgKHNlZVxuICAgICAgICAvLyB3YXRlcmxvby13b3Jrcy1vcmNoZXN0cmF0b3IudHMpLCB3aGljaCB3YWxrcyBlYWNoIHJvdywgb3BlbnMgaXRzIGRldGFpbFxuICAgICAgICAvLyBwYW5lbCwgYW5kIGNhbGxzIHNjcmFwZUpvYkxpc3RpbmcoKSBwZXIgcm93LiBzY3JhcGVKb2JMaXN0KCkgaXRzZWxmIHN0YXlzXG4gICAgICAgIC8vIGVtcHR5IHNvIHRoZSBnZW5lcmljIGF1dG8tZGV0ZWN0IHBhdGggZG9lc24ndCBhY2NpZGVudGFsbHkgcGljayBpdCB1cC5cbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBpc0xvZ2luUGFnZSgpIHtcbiAgICAgICAgY29uc3QgdXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWYudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgcmV0dXJuICh1cmwuaW5jbHVkZXMoXCIvY2FzL1wiKSB8fFxuICAgICAgICAgICAgdXJsLmluY2x1ZGVzKFwiL2xvZ2luXCIpIHx8XG4gICAgICAgICAgICB1cmwuaW5jbHVkZXMoXCIvc2lnbmluXCIpIHx8XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFt0eXBlPVwicGFzc3dvcmRcIl0nKSAhPT0gbnVsbCk7XG4gICAgfVxuICAgIGlzTGlrZWx5UG9zdGluZ0RldGFpbCgpIHtcbiAgICAgICAgY29uc3QgdGV4dCA9IHRoaXMudmlzaWJsZVRleHQoKTtcbiAgICAgICAgaWYgKC9rZWVwIG1lIGxvZ2dlZCBpbnxzZXNzaW9uIHRpbWVvdXR8c3RheSBsb2dnZWQgaW4vaS50ZXN0KHRleHQpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuaGFzU3RydWN0dXJlZFBvc3RpbmdGaWVsZHMoKSlcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICBpZiAoIS9qb2IgcG9zdGluZyBpbmZvcm1hdGlvbi9pLnRlc3QodGV4dCkgfHwgIS9qb2IgdGl0bGUvaS50ZXN0KHRleHQpKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICBjb25zdCBkZXRhaWxSb290ID0gdGhpcy5wb3N0aW5nRGV0YWlsUm9vdCgpO1xuICAgICAgICBpZiAoIWRldGFpbFJvb3QpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIHJldHVybiAvam9iIHBvc3RpbmcgaW5mb3JtYXRpb24vaS50ZXN0KGRldGFpbFJvb3QudGV4dENvbnRlbnQgfHwgdGV4dCk7XG4gICAgfVxuICAgIGhhc1N0cnVjdHVyZWRQb3N0aW5nRmllbGRzKCkge1xuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnRhZ19fa2V5LXZhbHVlLWxpc3QuanMtLXF1ZXN0aW9uLS1jb250YWluZXJcIikpLnNvbWUoKGJsb2NrKSA9PiAvXmpvYiB0aXRsZSQvaS50ZXN0KHRoaXMubm9ybWFsaXplTGFiZWwoYmxvY2sucXVlcnlTZWxlY3RvcihcIi5sYWJlbFwiKT8udGV4dENvbnRlbnQgfHwgXCJcIikpKTtcbiAgICB9XG4gICAgcG9zdGluZ0RldGFpbFJvb3QoKSB7XG4gICAgICAgIHJldHVybiAoQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbcm9sZT1cImRpYWxvZ1wiXSwgLlJlYWN0TW9kYWxfX0NvbnRlbnQsIC5tb2RhbCwgbWFpbiwgYm9keScpKS5maW5kKChjYW5kaWRhdGUpID0+IC9qb2IgcG9zdGluZyBpbmZvcm1hdGlvbi9pLnRlc3QoY2FuZGlkYXRlLnRleHRDb250ZW50IHx8IFwiXCIpKSB8fCBudWxsKTtcbiAgICB9XG4gICAgcGFyc2VQb3N0aW5nSGVhZGVyKHRpdGxlKSB7XG4gICAgICAgIGNvbnN0IGhlYWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZGFzaGJvYXJkLWhlYWRlcl9fcG9zdGluZy10aXRsZVwiKTtcbiAgICAgICAgaWYgKGhlYWRlcikge1xuICAgICAgICAgICAgY29uc3QgaDJUZXh0ID0gaGVhZGVyLnF1ZXJ5U2VsZWN0b3IoXCJoMlwiKT8udGV4dENvbnRlbnQ/LnRyaW0oKTtcbiAgICAgICAgICAgIGNvbnN0IGlkTWF0Y2ggPSAoaGVhZGVyLnRleHRDb250ZW50IHx8IFwiXCIpLm1hdGNoKC9cXGIoXFxkezQsMTB9KVxcYi8pO1xuICAgICAgICAgICAgY29uc3QgY29tcGFueSA9IHRoaXMuZmluZEhlYWRlckNvbXBhbnkoaGVhZGVyLCBoMlRleHQpO1xuICAgICAgICAgICAgcmV0dXJuIHsgc291cmNlSm9iSWQ6IGlkTWF0Y2g/LlsxXSwgdGl0bGU6IGgyVGV4dCwgY29tcGFueSB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGxpbmVzID0gdGhpcy52aXNpYmxlTGluZXMoKTtcbiAgICAgICAgY29uc3QgaWRNYXRjaCA9IHRoaXMudmlzaWJsZVRleHQoKS5tYXRjaCgvXFxiKFxcZHs0LDEwfSlcXGIvKTtcbiAgICAgICAgY29uc3QgaGVhZGluZyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcImgxLGgyLGgzXCIpKVxuICAgICAgICAgICAgLm1hcCgoZWwpID0+IGVsLnRleHRDb250ZW50Py50cmltKCkgfHwgXCJcIilcbiAgICAgICAgICAgIC5maW5kKCh0ZXh0KSA9PiB0ZXh0Lmxlbmd0aCA+IDEwICYmXG4gICAgICAgICAgICAhL3dhdGVybG9vd29ya3N8am9iIHBvc3RpbmcgaW5mb3JtYXRpb258b3ZlcnZpZXd8bWFwfHJhdGluZ3MvaS50ZXN0KHRleHQpKTtcbiAgICAgICAgY29uc3QgcmVzb2x2ZWRUaXRsZSA9IHRpdGxlIHx8IGhlYWRpbmc7XG4gICAgICAgIGxldCBjb21wYW55O1xuICAgICAgICBpZiAocmVzb2x2ZWRUaXRsZSkge1xuICAgICAgICAgICAgY29uc3QgdGl0bGVJbmRleCA9IGxpbmVzLmZpbmRJbmRleCgobGluZSkgPT4gbGluZSA9PT0gcmVzb2x2ZWRUaXRsZSk7XG4gICAgICAgICAgICBjb25zdCBuZXh0ID0gdGl0bGVJbmRleCA+PSAwID8gbGluZXNbdGl0bGVJbmRleCArIDFdIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgaWYgKG5leHQgJiYgIS9uZXd8dmlld2VkfGRlYWRsaW5lfG92ZXJ2aWV3fG1hcHxyYXRpbmdzL2kudGVzdChuZXh0KSkge1xuICAgICAgICAgICAgICAgIGNvbXBhbnkgPSBuZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHNvdXJjZUpvYklkOiBpZE1hdGNoPy5bMV0sIHRpdGxlOiByZXNvbHZlZFRpdGxlLCBjb21wYW55IH07XG4gICAgfVxuICAgIGZpbmRIZWFkZXJDb21wYW55KGhlYWRlciwgdGl0bGUpIHtcbiAgICAgICAgY29uc3QgY29udGFpbmVyID0gaGVhZGVyLmNsb3Nlc3QoXCJzZWN0aW9uLCBoZWFkZXIsIFtyb2xlPSdkaWFsb2cnXVwiKTtcbiAgICAgICAgY29uc3QgY2FuZGlkYXRlcyA9IFtcbiAgICAgICAgICAgIGhlYWRlci5uZXh0RWxlbWVudFNpYmxpbmc/LnRleHRDb250ZW50Py50cmltKCksXG4gICAgICAgICAgICBjb250YWluZXI/LnF1ZXJ5U2VsZWN0b3IoXCJwXCIpPy50ZXh0Q29udGVudD8udHJpbSgpLFxuICAgICAgICBdO1xuICAgICAgICByZXR1cm4gY2FuZGlkYXRlcy5maW5kKCh2YWx1ZSkgPT4gISF2YWx1ZSAmJlxuICAgICAgICAgICAgdmFsdWUgIT09IHRpdGxlICYmXG4gICAgICAgICAgICAhL25ld3x2aWV3ZWR8ZGVhZGxpbmV8b3ZlcnZpZXd8bWFwfHJhdGluZ3MvaS50ZXN0KHZhbHVlKSk7XG4gICAgfVxuICAgIGNvbGxlY3RGaWVsZHMoKSB7XG4gICAgICAgIGNvbnN0IGJhZyA9IHt9O1xuICAgICAgICBjb25zdCBibG9ja3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnRhZ19fa2V5LXZhbHVlLWxpc3QuanMtLXF1ZXN0aW9uLS1jb250YWluZXJcIik7XG4gICAgICAgIGZvciAoY29uc3QgYmxvY2sgb2YgYmxvY2tzKSB7XG4gICAgICAgICAgICBjb25zdCBsYWJlbFJhdyA9IGJsb2NrLnF1ZXJ5U2VsZWN0b3IoXCIubGFiZWxcIik/LnRleHRDb250ZW50Py50cmltKCk7XG4gICAgICAgICAgICBpZiAoIWxhYmVsUmF3KVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgY29uc3QgbGFiZWwgPSB0aGlzLm5vcm1hbGl6ZUxhYmVsKGxhYmVsUmF3KTtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlRWwgPSBibG9jay5xdWVyeVNlbGVjdG9yKFwiLnZhbHVlXCIpO1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSB2YWx1ZUVsXG4gICAgICAgICAgICAgICAgPyB2YWx1ZUVsLmlubmVySFRNTFxuICAgICAgICAgICAgICAgIDogdGhpcy5zdHJpcExhYmVsRnJvbUJsb2NrKGJsb2NrLCBsYWJlbFJhdyk7XG4gICAgICAgICAgICBpZiAoIXZhbHVlKVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgdGhpcy5hc3NpZ25GaWVsZChiYWcsIGxhYmVsLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGJsb2Nrcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMuY29sbGVjdFBsYWluVGV4dEZpZWxkcyhiYWcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBiYWc7XG4gICAgfVxuICAgIGNvbGxlY3RQbGFpblRleHRGaWVsZHMoYmFnKSB7XG4gICAgICAgIGNvbnN0IGxpbmVzID0gdGhpcy52aXNpYmxlTGluZXMoKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgY29uc3QgbWF0Y2ggPSBsaW5lc1tpXS5tYXRjaCgvXihbXjpdezMsODB9KTpcXHMqKC4qKSQvKTtcbiAgICAgICAgICAgIGlmICghbWF0Y2gpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICBjb25zdCBsYWJlbCA9IHRoaXMubm9ybWFsaXplTGFiZWwobWF0Y2hbMV0pO1xuICAgICAgICAgICAgY29uc3Qgc2FtZUxpbmVWYWx1ZSA9IG1hdGNoWzJdPy50cmltKCk7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHNhbWVMaW5lVmFsdWUgfHxcbiAgICAgICAgICAgICAgICBsaW5lcy5zbGljZShpICsgMSkuZmluZCgobGluZSkgPT4gIS9eKFteOl17Myw4MH0pOlxccyovLnRlc3QobGluZSkpO1xuICAgICAgICAgICAgaWYgKCF2YWx1ZSlcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIHRoaXMuYXNzaWduRmllbGQoYmFnLCBsYWJlbCwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIFwiV29yayBUZXJtOiAgXCIg4oaSIFwid29yayB0ZXJtXCJcbiAgICBub3JtYWxpemVMYWJlbChsYWJlbCkge1xuICAgICAgICByZXR1cm4gbGFiZWxcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cXHMrL2csIFwiIFwiKVxuICAgICAgICAgICAgLnJlcGxhY2UoL1s6XFxzXSskLywgXCJcIilcbiAgICAgICAgICAgIC50b0xvd2VyQ2FzZSgpO1xuICAgIH1cbiAgICBzdHJpcExhYmVsRnJvbUJsb2NrKGJsb2NrLCBsYWJlbCkge1xuICAgICAgICBjb25zdCBjbG9uZSA9IGJsb2NrLmNsb25lTm9kZSh0cnVlKTtcbiAgICAgICAgY2xvbmUucXVlcnlTZWxlY3RvcihcIi5sYWJlbFwiKT8ucmVtb3ZlKCk7XG4gICAgICAgIHJldHVybiAoY2xvbmUuaW5uZXJIVE1MLnRyaW0oKSB8fFxuICAgICAgICAgICAgY2xvbmUudGV4dENvbnRlbnQ/LnJlcGxhY2UobGFiZWwsIFwiXCIpLnRyaW0oKSB8fFxuICAgICAgICAgICAgXCJcIik7XG4gICAgfVxuICAgIGFzc2lnbkZpZWxkKGJhZywgbm9ybWFsaXplZExhYmVsLCBodG1sVmFsdWUpIHtcbiAgICAgICAgY29uc3QgY2xlYW5lZCA9IHRoaXMuY2xlYW5EZXNjcmlwdGlvbihodG1sVmFsdWUpO1xuICAgICAgICBmb3IgKGNvbnN0IFtrZXksIGNhbmRpZGF0ZXNdIG9mIE9iamVjdC5lbnRyaWVzKEZJRUxEX0xBQkVMUykpIHtcbiAgICAgICAgICAgIGlmIChjYW5kaWRhdGVzLnNvbWUoKGMpID0+IHRoaXMubWF0Y2hlc0xhYmVsKGtleSwgbm9ybWFsaXplZExhYmVsLCBjKSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWJhZ1trZXldKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhZ1trZXldID1cbiAgICAgICAgICAgICAgICAgICAgICAgIGtleSA9PT0gXCJyZXNwb25zaWJpbGl0aWVzXCIgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXkgPT09IFwicmVxdWlyZW1lbnRzXCIgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXkgPT09IFwic3VtbWFyeVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBodG1sVmFsdWUgLy8ga2VlcCBIVE1MIGZvciBidWxsZXQgcGFyc2luZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogY2xlYW5lZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIG1hdGNoZXNMYWJlbChrZXksIG5vcm1hbGl6ZWRMYWJlbCwgY2FuZGlkYXRlKSB7XG4gICAgICAgIGNvbnN0IG5vcm1hbGl6ZWRDYW5kaWRhdGUgPSBjYW5kaWRhdGUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgaWYgKG5vcm1hbGl6ZWRMYWJlbCA9PT0gbm9ybWFsaXplZENhbmRpZGF0ZSlcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAvLyBXYXRlcmxvb1dvcmtzIGhhcyBsYWJlbHMgbGlrZSBcIkVtcGxveWVyIEludGVybmFsIEpvYiBOdW1iZXJcIi4gVGhhdCBpc1xuICAgICAgICAvLyBub3QgdGhlIGVtcGxveWVyL2NvbXBhbnkgZmllbGQgYW5kIG11c3Qgbm90IG92ZXJyaWRlIHRoZSBoZWFkZXIgY29tcGFueS5cbiAgICAgICAgaWYgKGtleSA9PT0gXCJvcmdhbml6YXRpb25cIiAmJlxuICAgICAgICAgICAgKG5vcm1hbGl6ZWRDYW5kaWRhdGUgPT09IFwiZW1wbG95ZXJcIiB8fCBub3JtYWxpemVkQ2FuZGlkYXRlID09PSBcImNvbXBhbnlcIikpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbm9ybWFsaXplZExhYmVsLnN0YXJ0c1dpdGgoYCR7bm9ybWFsaXplZENhbmRpZGF0ZX0gYCk7XG4gICAgfVxuICAgIGNvbXBvc2VEZXNjcmlwdGlvbihmaWVsZHMpIHtcbiAgICAgICAgY29uc3QgcGFydHMgPSBbXTtcbiAgICAgICAgaWYgKGZpZWxkcy5zdW1tYXJ5KVxuICAgICAgICAgICAgcGFydHMucHVzaCh0aGlzLmNsZWFuRGVzY3JpcHRpb24oZmllbGRzLnN1bW1hcnkpKTtcbiAgICAgICAgaWYgKGZpZWxkcy5yZXNwb25zaWJpbGl0aWVzKSB7XG4gICAgICAgICAgICBwYXJ0cy5wdXNoKFwiUmVzcG9uc2liaWxpdGllczpcIik7XG4gICAgICAgICAgICBwYXJ0cy5wdXNoKHRoaXMuY2xlYW5EZXNjcmlwdGlvbihmaWVsZHMucmVzcG9uc2liaWxpdGllcykpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChmaWVsZHMucmVxdWlyZW1lbnRzKSB7XG4gICAgICAgICAgICBwYXJ0cy5wdXNoKFwiUmVxdWlyZWQgU2tpbGxzOlwiKTtcbiAgICAgICAgICAgIHBhcnRzLnB1c2godGhpcy5jbGVhbkRlc2NyaXB0aW9uKGZpZWxkcy5yZXF1aXJlbWVudHMpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGFydHMuZmlsdGVyKEJvb2xlYW4pLmpvaW4oXCJcXG5cXG5cIikudHJpbSgpO1xuICAgIH1cbiAgICBjb21wb3NlRmFsbGJhY2tEZXNjcmlwdGlvbihmaWVsZHMsIHRpdGxlLCBjb21wYW55KSB7XG4gICAgICAgIGNvbnN0IHBhcnRzID0gW1xuICAgICAgICAgICAgdGl0bGUgJiYgY29tcGFueSA/IGAke3RpdGxlfSBhdCAke2NvbXBhbnl9YCA6IHRpdGxlLFxuICAgICAgICAgICAgZmllbGRzLmpvYlR5cGUsXG4gICAgICAgICAgICBmaWVsZHMud29ya1Rlcm0sXG4gICAgICAgICAgICBcIldhdGVybG9vV29ya3Mgam9iIGRldGFpbHMgdmlzaWJsZTsgZnVsbCBkZXNjcmlwdGlvbiBub3QgbG9hZGVkLlwiLFxuICAgICAgICBdO1xuICAgICAgICByZXR1cm4gcGFydHMuZmlsdGVyKChwYXJ0KSA9PiAhIXBhcnQpLmpvaW4oXCJcXG5cIik7XG4gICAgfVxuICAgIGNvbXBvc2VMb2NhdGlvbihmaWVsZHMpIHtcbiAgICAgICAgaWYgKGZpZWxkcy5sb2NhdGlvbkZ1bGwpXG4gICAgICAgICAgICByZXR1cm4gZmllbGRzLmxvY2F0aW9uRnVsbDtcbiAgICAgICAgY29uc3QgcGllY2VzID0gW1xuICAgICAgICAgICAgZmllbGRzLmxvY2F0aW9uQ2l0eSxcbiAgICAgICAgICAgIGZpZWxkcy5sb2NhdGlvblJlZ2lvbixcbiAgICAgICAgICAgIGZpZWxkcy5sb2NhdGlvbkNvdW50cnksXG4gICAgICAgIF1cbiAgICAgICAgICAgIC5tYXAoKHApID0+IHA/LnRyaW0oKSlcbiAgICAgICAgICAgIC5maWx0ZXIoKHApID0+ICEhcCAmJiBwLmxlbmd0aCA+IDApO1xuICAgICAgICByZXR1cm4gcGllY2VzLmxlbmd0aCA+IDAgPyBwaWVjZXMuam9pbihcIiwgXCIpIDogdW5kZWZpbmVkO1xuICAgIH1cbiAgICBkZXRlY3RSZW1vdGVGcm9tRmllbGRzKGZpZWxkcywgbG9jYXRpb24sIGRlc2NyaXB0aW9uKSB7XG4gICAgICAgIGNvbnN0IGFycmFuZ2VtZW50ID0gKGZpZWxkcy5lbXBsb3ltZW50QXJyYW5nZW1lbnQgfHwgXCJcIikudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgaWYgKC9yZW1vdGV8dmlydHVhbHx3b3JrIGZyb20gaG9tZXxkaXN0cmlidXRlZC8udGVzdChhcnJhbmdlbWVudCkpXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgaWYgKC9oeWJyaWQvLnRlc3QoYXJyYW5nZW1lbnQpKVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7IC8vIGh5YnJpZCBpbXBsaWVzIHNvbWUgcmVtb3RlXG4gICAgICAgIHJldHVybiB0aGlzLmRldGVjdFJlbW90ZShsb2NhdGlvbiB8fCBcIlwiKSB8fCB0aGlzLmRldGVjdFJlbW90ZShkZXNjcmlwdGlvbik7XG4gICAgfVxuICAgIGNvbmRlbnNlU2FsYXJ5KHJhdykge1xuICAgICAgICBpZiAoIXJhdylcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIGNvbnN0IHRyaW1tZWQgPSByYXcudHJpbSgpO1xuICAgICAgICBpZiAodHJpbW1lZC5sZW5ndGggPT09IDApXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAvLyBQcmVmZXIgdGhlIGZpcnN0IGxpbmUgLyBzZW50ZW5jZSDigJQgdXN1YWxseSB0aGUgd2FnZSByYW5nZS4gSWYgc3RpbGwgdG9vXG4gICAgICAgIC8vIGxvbmcsIGhhcmQtY2FwIGF0IDQ4MCBjaGFycyB3aXRoIGFuIGVsbGlwc2lzIHNvIHRoZSBzY2hlbWEgdmFsaWRhdG9yXG4gICAgICAgIC8vIGFjY2VwdHMgaXQgKGxpbWl0IGlzIDUwMCkuXG4gICAgICAgIGNvbnN0IGZpcnN0Q2h1bmsgPSB0cmltbWVkLnNwbGl0KC9cXG5cXG58XFxuKD89W0EtWl0pLylbMF0/LnRyaW0oKSB8fCB0cmltbWVkO1xuICAgICAgICBpZiAoZmlyc3RDaHVuay5sZW5ndGggPD0gNDgwKVxuICAgICAgICAgICAgcmV0dXJuIGZpcnN0Q2h1bms7XG4gICAgICAgIHJldHVybiBmaXJzdENodW5rLnNsaWNlKDAsIDQ3NykgKyBcIi4uLlwiO1xuICAgIH1cbiAgICBwYXJzZUJ1bGxldExpc3QoaHRtbCkge1xuICAgICAgICBpZiAoIWh0bWwpXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICBjb25zdCBkb2MgPSBuZXcgRE9NUGFyc2VyKCkucGFyc2VGcm9tU3RyaW5nKGh0bWwsIFwidGV4dC9odG1sXCIpO1xuICAgICAgICBjb25zdCBpdGVtcyA9IEFycmF5LmZyb20oZG9jLnF1ZXJ5U2VsZWN0b3JBbGwoXCJsaVwiKSlcbiAgICAgICAgICAgIC5tYXAoKGxpKSA9PiBsaS50ZXh0Q29udGVudD8udHJpbSgpIHx8IFwiXCIpXG4gICAgICAgICAgICAuZmlsdGVyKCh0KSA9PiB0Lmxlbmd0aCA+IDApO1xuICAgICAgICByZXR1cm4gaXRlbXMubGVuZ3RoID4gMCA/IGl0ZW1zIDogdW5kZWZpbmVkO1xuICAgIH1cbiAgICB2aXNpYmxlVGV4dCgpIHtcbiAgICAgICAgcmV0dXJuIChkb2N1bWVudC5ib2R5LmlubmVyVGV4dCB8fFxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS50ZXh0Q29udGVudCB8fFxuICAgICAgICAgICAgXCJcIik7XG4gICAgfVxuICAgIHZpc2libGVMaW5lcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudmlzaWJsZVRleHQoKVxuICAgICAgICAgICAgLnNwbGl0KC9cXG4rLylcbiAgICAgICAgICAgIC5tYXAoKGxpbmUpID0+IGxpbmUudHJpbSgpKVxuICAgICAgICAgICAgLmZpbHRlcihCb29sZWFuKTtcbiAgICB9XG59XG4iLCIvLyBJbmRlZWQgam9iIHNjcmFwZXJcbmltcG9ydCB7IEJhc2VTY3JhcGVyIH0gZnJvbSBcIi4vYmFzZS1zY3JhcGVyXCI7XG5leHBvcnQgY2xhc3MgSW5kZWVkU2NyYXBlciBleHRlbmRzIEJhc2VTY3JhcGVyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcbiAgICAgICAgdGhpcy5zb3VyY2UgPSBcImluZGVlZFwiO1xuICAgICAgICB0aGlzLnVybFBhdHRlcm5zID0gW1xuICAgICAgICAgICAgL2luZGVlZFxcLmNvbVxcL3ZpZXdqb2IvLFxuICAgICAgICAgICAgL2luZGVlZFxcLmNvbVxcL2pvYnNcXC8vLFxuICAgICAgICAgICAgL2luZGVlZFxcLmNvbVxcL2pvYlxcLy8sXG4gICAgICAgICAgICAvaW5kZWVkXFwuY29tXFwvcmNcXC9jbGsvLFxuICAgICAgICBdO1xuICAgIH1cbiAgICBjYW5IYW5kbGUodXJsKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnVybFBhdHRlcm5zLnNvbWUoKHApID0+IHAudGVzdCh1cmwpKTtcbiAgICB9XG4gICAgYXN5bmMgc2NyYXBlSm9iTGlzdGluZygpIHtcbiAgICAgICAgLy8gV2FpdCBmb3Igam9iIGRldGFpbHMgdG8gbG9hZFxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy53YWl0Rm9yRWxlbWVudCgnLmpvYnNlYXJjaC1Kb2JJbmZvSGVhZGVyLXRpdGxlLCBbZGF0YS10ZXN0aWQ9XCJqb2JzZWFyY2gtSm9iSW5mb0hlYWRlci10aXRsZVwiXScsIDMwMDApO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIHtcbiAgICAgICAgICAgIC8vIENvbnRpbnVlIHdpdGggYXZhaWxhYmxlIGRhdGFcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0aXRsZSA9IHRoaXMuZXh0cmFjdEpvYlRpdGxlKCk7XG4gICAgICAgIGNvbnN0IGNvbXBhbnkgPSB0aGlzLmV4dHJhY3RDb21wYW55KCk7XG4gICAgICAgIGNvbnN0IGxvY2F0aW9uID0gdGhpcy5leHRyYWN0TG9jYXRpb24oKTtcbiAgICAgICAgY29uc3QgZGVzY3JpcHRpb24gPSB0aGlzLmV4dHJhY3REZXNjcmlwdGlvbigpO1xuICAgICAgICBpZiAoIXRpdGxlIHx8ICFjb21wYW55IHx8ICFkZXNjcmlwdGlvbikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJbU2xvdGhpbmddIEluZGVlZCBzY3JhcGVyOiBNaXNzaW5nIHJlcXVpcmVkIGZpZWxkc1wiLCB7XG4gICAgICAgICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgICAgICAgY29tcGFueSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogISFkZXNjcmlwdGlvbixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgc3RydWN0dXJlZERhdGEgPSB0aGlzLmV4dHJhY3RTdHJ1Y3R1cmVkRGF0YSgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgICBjb21wYW55LFxuICAgICAgICAgICAgbG9jYXRpb246IGxvY2F0aW9uIHx8IHN0cnVjdHVyZWREYXRhPy5sb2NhdGlvbixcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgcmVxdWlyZW1lbnRzOiB0aGlzLmV4dHJhY3RSZXF1aXJlbWVudHMoZGVzY3JpcHRpb24pLFxuICAgICAgICAgICAga2V5d29yZHM6IHRoaXMuZXh0cmFjdEtleXdvcmRzKGRlc2NyaXB0aW9uKSxcbiAgICAgICAgICAgIHNhbGFyeTogdGhpcy5leHRyYWN0U2FsYXJ5RnJvbVBhZ2UoKSB8fFxuICAgICAgICAgICAgICAgIHRoaXMuZXh0cmFjdFNhbGFyeShkZXNjcmlwdGlvbikgfHxcbiAgICAgICAgICAgICAgICBzdHJ1Y3R1cmVkRGF0YT8uc2FsYXJ5LFxuICAgICAgICAgICAgdHlwZTogdGhpcy5kZXRlY3RKb2JUeXBlKGRlc2NyaXB0aW9uKSxcbiAgICAgICAgICAgIHJlbW90ZTogdGhpcy5kZXRlY3RSZW1vdGUobG9jYXRpb24gfHwgXCJcIikgfHwgdGhpcy5kZXRlY3RSZW1vdGUoZGVzY3JpcHRpb24pLFxuICAgICAgICAgICAgdXJsOiB3aW5kb3cubG9jYXRpb24uaHJlZixcbiAgICAgICAgICAgIHNvdXJjZTogdGhpcy5zb3VyY2UsXG4gICAgICAgICAgICBzb3VyY2VKb2JJZDogdGhpcy5leHRyYWN0Sm9iSWQoKSxcbiAgICAgICAgICAgIHBvc3RlZEF0OiBzdHJ1Y3R1cmVkRGF0YT8ucG9zdGVkQXQsXG4gICAgICAgIH07XG4gICAgfVxuICAgIGFzeW5jIHNjcmFwZUpvYkxpc3QoKSB7XG4gICAgICAgIGNvbnN0IGpvYnMgPSBbXTtcbiAgICAgICAgLy8gSm9iIGNhcmRzIGluIHNlYXJjaCByZXN1bHRzXG4gICAgICAgIGNvbnN0IGpvYkNhcmRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpvYl9zZWVuX2JlYWNvbiwgLmpvYnNlYXJjaC1SZXN1bHRzTGlzdCA+IGxpLCBbZGF0YS10ZXN0aWQ9XCJqb2ItY2FyZFwiXScpO1xuICAgICAgICBmb3IgKGNvbnN0IGNhcmQgb2Ygam9iQ2FyZHMpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdGl0bGVFbCA9IGNhcmQucXVlcnlTZWxlY3RvcignLmpvYlRpdGxlLCBbZGF0YS10ZXN0aWQ9XCJqb2JUaXRsZVwiXSwgaDIuam9iVGl0bGUgYSwgLmpjcy1Kb2JUaXRsZScpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbXBhbnlFbCA9IGNhcmQucXVlcnlTZWxlY3RvcignLmNvbXBhbnlOYW1lLCBbZGF0YS10ZXN0aWQ9XCJjb21wYW55LW5hbWVcIl0sIC5jb21wYW55X2xvY2F0aW9uIC5jb21wYW55TmFtZScpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2F0aW9uRWwgPSBjYXJkLnF1ZXJ5U2VsZWN0b3IoJy5jb21wYW55TG9jYXRpb24sIFtkYXRhLXRlc3RpZD1cInRleHQtbG9jYXRpb25cIl0sIC5jb21wYW55X2xvY2F0aW9uIC5jb21wYW55TG9jYXRpb24nKTtcbiAgICAgICAgICAgICAgICBjb25zdCBzYWxhcnlFbCA9IGNhcmQucXVlcnlTZWxlY3RvcignLnNhbGFyeS1zbmlwcGV0LWNvbnRhaW5lciwgW2RhdGEtdGVzdGlkPVwiYXR0cmlidXRlX3NuaXBwZXRfdGVzdGlkXCJdLCAuZXN0aW1hdGVkLXNhbGFyeScpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRpdGxlID0gdGl0bGVFbD8udGV4dENvbnRlbnQ/LnRyaW0oKTtcbiAgICAgICAgICAgICAgICBjb25zdCBjb21wYW55ID0gY29tcGFueUVsPy50ZXh0Q29udGVudD8udHJpbSgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2F0aW9uID0gbG9jYXRpb25FbD8udGV4dENvbnRlbnQ/LnRyaW0oKTtcbiAgICAgICAgICAgICAgICBjb25zdCBzYWxhcnkgPSBzYWxhcnlFbD8udGV4dENvbnRlbnQ/LnRyaW0oKTtcbiAgICAgICAgICAgICAgICAvLyBHZXQgVVJMIGZyb20gdGl0bGUgbGluayBvciBkYXRhIGF0dHJpYnV0ZVxuICAgICAgICAgICAgICAgIGxldCB1cmwgPSB0aXRsZUVsPy5ocmVmO1xuICAgICAgICAgICAgICAgIGlmICghdXJsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGpvYktleSA9IGNhcmQuZ2V0QXR0cmlidXRlKFwiZGF0YS1qa1wiKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGpvYktleSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXJsID0gYGh0dHBzOi8vd3d3LmluZGVlZC5jb20vdmlld2pvYj9qaz0ke2pvYktleX1gO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aXRsZSAmJiBjb21wYW55ICYmIHVybCkge1xuICAgICAgICAgICAgICAgICAgICBqb2JzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wYW55LFxuICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBzYWxhcnksXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmVtZW50czogW10sXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmwsXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IHRoaXMuc291cmNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlSm9iSWQ6IHRoaXMuZXh0cmFjdEpvYklkRnJvbVVybCh1cmwpLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIltTbG90aGluZ10gRXJyb3Igc2NyYXBpbmcgSW5kZWVkIGpvYiBjYXJkOlwiLCBlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBqb2JzO1xuICAgIH1cbiAgICBleHRyYWN0Sm9iVGl0bGUoKSB7XG4gICAgICAgIGNvbnN0IHNlbGVjdG9ycyA9IFtcbiAgICAgICAgICAgIFwiLmpvYnNlYXJjaC1Kb2JJbmZvSGVhZGVyLXRpdGxlXCIsXG4gICAgICAgICAgICAnW2RhdGEtdGVzdGlkPVwiam9ic2VhcmNoLUpvYkluZm9IZWFkZXItdGl0bGVcIl0nLFxuICAgICAgICAgICAgXCJoMS5qb2JzZWFyY2gtSm9iSW5mb0hlYWRlci10aXRsZVwiLFxuICAgICAgICAgICAgXCIuaWNsLXUteHMtbWItLXhzIGgxXCIsXG4gICAgICAgICAgICAnaDFbY2xhc3MqPVwiSm9iSW5mb0hlYWRlclwiXScsXG4gICAgICAgIF07XG4gICAgICAgIGZvciAoY29uc3Qgc2VsZWN0b3Igb2Ygc2VsZWN0b3JzKSB7XG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0gdGhpcy5leHRyYWN0VGV4dENvbnRlbnQoc2VsZWN0b3IpO1xuICAgICAgICAgICAgaWYgKHRleHQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGV4dHJhY3RDb21wYW55KCkge1xuICAgICAgICBjb25zdCBzZWxlY3RvcnMgPSBbXG4gICAgICAgICAgICAnW2RhdGEtdGVzdGlkPVwiaW5saW5lSGVhZGVyLWNvbXBhbnlOYW1lXCJdIGEnLFxuICAgICAgICAgICAgJ1tkYXRhLXRlc3RpZD1cImlubGluZUhlYWRlci1jb21wYW55TmFtZVwiXScsXG4gICAgICAgICAgICBcIi5qb2JzZWFyY2gtSW5saW5lQ29tcGFueVJhdGluZy1jb21wYW55SGVhZGVyIGFcIixcbiAgICAgICAgICAgIFwiLmpvYnNlYXJjaC1JbmxpbmVDb21wYW55UmF0aW5nIGFcIixcbiAgICAgICAgICAgIFwiLmljbC11LWxnLW1yLS1zbSBhXCIsXG4gICAgICAgICAgICAnW2RhdGEtY29tcGFueS1uYW1lPVwidHJ1ZVwiXScsXG4gICAgICAgIF07XG4gICAgICAgIGZvciAoY29uc3Qgc2VsZWN0b3Igb2Ygc2VsZWN0b3JzKSB7XG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0gdGhpcy5leHRyYWN0VGV4dENvbnRlbnQoc2VsZWN0b3IpO1xuICAgICAgICAgICAgaWYgKHRleHQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGV4dHJhY3RMb2NhdGlvbigpIHtcbiAgICAgICAgY29uc3Qgc2VsZWN0b3JzID0gW1xuICAgICAgICAgICAgJ1tkYXRhLXRlc3RpZD1cImlubGluZUhlYWRlci1jb21wYW55TG9jYXRpb25cIl0nLFxuICAgICAgICAgICAgJ1tkYXRhLXRlc3RpZD1cImpvYi1sb2NhdGlvblwiXScsXG4gICAgICAgICAgICBcIi5qb2JzZWFyY2gtSm9iSW5mb0hlYWRlci1zdWJ0aXRsZSA+IGRpdjpudGgtY2hpbGQoMilcIixcbiAgICAgICAgICAgIFwiLmpvYnNlYXJjaC1JbmxpbmVDb21wYW55UmF0aW5nICsgZGl2XCIsXG4gICAgICAgICAgICBcIi5pY2wtdS14cy1tdC0teHMgLmljbC11LXRleHRDb2xvci0tc2Vjb25kYXJ5XCIsXG4gICAgICAgIF07XG4gICAgICAgIGZvciAoY29uc3Qgc2VsZWN0b3Igb2Ygc2VsZWN0b3JzKSB7XG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0gdGhpcy5leHRyYWN0VGV4dENvbnRlbnQoc2VsZWN0b3IpO1xuICAgICAgICAgICAgaWYgKHRleHQgJiYgIXRleHQuaW5jbHVkZXMoXCJyZXZpZXdzXCIpICYmICF0ZXh0LmluY2x1ZGVzKFwicmF0aW5nXCIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGV4dHJhY3REZXNjcmlwdGlvbigpIHtcbiAgICAgICAgY29uc3Qgc2VsZWN0b3JzID0gW1xuICAgICAgICAgICAgXCIjam9iRGVzY3JpcHRpb25UZXh0XCIsXG4gICAgICAgICAgICAnW2RhdGEtdGVzdGlkPVwiam9iRGVzY3JpcHRpb25UZXh0XCJdJyxcbiAgICAgICAgICAgIFwiLmpvYnNlYXJjaC1qb2JEZXNjcmlwdGlvblRleHRcIixcbiAgICAgICAgICAgIFwiLmpvYnNlYXJjaC1Kb2JDb21wb25lbnQtZGVzY3JpcHRpb25cIixcbiAgICAgICAgXTtcbiAgICAgICAgZm9yIChjb25zdCBzZWxlY3RvciBvZiBzZWxlY3RvcnMpIHtcbiAgICAgICAgICAgIGNvbnN0IGh0bWwgPSB0aGlzLmV4dHJhY3RIdG1sQ29udGVudChzZWxlY3Rvcik7XG4gICAgICAgICAgICBpZiAoaHRtbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNsZWFuRGVzY3JpcHRpb24oaHRtbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGV4dHJhY3RTYWxhcnlGcm9tUGFnZSgpIHtcbiAgICAgICAgY29uc3Qgc2VsZWN0b3JzID0gW1xuICAgICAgICAgICAgJ1tkYXRhLXRlc3RpZD1cImpvYnNlYXJjaC1Kb2JNZXRhZGF0YUhlYWRlci1zYWxhcnlJbmZvXCJdJyxcbiAgICAgICAgICAgIFwiLmpvYnNlYXJjaC1Kb2JNZXRhZGF0YUhlYWRlci1zYWxhcnlJbmZvXCIsXG4gICAgICAgICAgICBcIiNzYWxhcnlJbmZvQW5kSm9iVHlwZSAuYXR0cmlidXRlX3NuaXBwZXRcIixcbiAgICAgICAgICAgIFwiLmpvYnNlYXJjaC1Kb2JJbmZvSGVhZGVyLXNhbGFyeVwiLFxuICAgICAgICBdO1xuICAgICAgICBmb3IgKGNvbnN0IHNlbGVjdG9yIG9mIHNlbGVjdG9ycykge1xuICAgICAgICAgICAgY29uc3QgdGV4dCA9IHRoaXMuZXh0cmFjdFRleHRDb250ZW50KHNlbGVjdG9yKTtcbiAgICAgICAgICAgIGlmICh0ZXh0ICYmIHRleHQuaW5jbHVkZXMoXCIkXCIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgZXh0cmFjdEpvYklkKCkge1xuICAgICAgICAvLyBGcm9tIFVSTCBwYXJhbWV0ZXJcbiAgICAgICAgY29uc3QgdXJsUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcbiAgICAgICAgY29uc3QgamsgPSB1cmxQYXJhbXMuZ2V0KFwiamtcIik7XG4gICAgICAgIGlmIChqaylcbiAgICAgICAgICAgIHJldHVybiBqaztcbiAgICAgICAgLy8gRnJvbSBVUkwgcGF0aFxuICAgICAgICBjb25zdCBtYXRjaCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLm1hdGNoKC9cXC9qb2JcXC8oW2EtZjAtOV0rKS9pKTtcbiAgICAgICAgcmV0dXJuIG1hdGNoPy5bMV07XG4gICAgfVxuICAgIGV4dHJhY3RKb2JJZEZyb21VcmwodXJsKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB1cmxPYmogPSBuZXcgVVJMKHVybCk7XG4gICAgICAgICAgICBjb25zdCBqayA9IHVybE9iai5zZWFyY2hQYXJhbXMuZ2V0KFwiamtcIik7XG4gICAgICAgICAgICBpZiAoamspXG4gICAgICAgICAgICAgICAgcmV0dXJuIGprO1xuICAgICAgICAgICAgY29uc3QgbWF0Y2ggPSB1cmwubWF0Y2goL1xcL2pvYlxcLyhbYS1mMC05XSspL2kpO1xuICAgICAgICAgICAgcmV0dXJuIG1hdGNoPy5bMV07XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2gge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBleHRyYWN0U3RydWN0dXJlZERhdGEoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBsZEpzb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdzY3JpcHRbdHlwZT1cImFwcGxpY2F0aW9uL2xkK2pzb25cIl0nKTtcbiAgICAgICAgICAgIGlmICghbGRKc29uPy50ZXh0Q29udGVudClcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKGxkSnNvbi50ZXh0Q29udGVudCk7XG4gICAgICAgICAgICAvLyBJbmRlZWQgbWF5IGhhdmUgYW4gYXJyYXkgb2Ygc3RydWN0dXJlZCBkYXRhXG4gICAgICAgICAgICBjb25zdCBqb2JEYXRhID0gQXJyYXkuaXNBcnJheShkYXRhKVxuICAgICAgICAgICAgICAgID8gZGF0YS5maW5kKChkKSA9PiBkW1wiQHR5cGVcIl0gPT09IFwiSm9iUG9zdGluZ1wiKVxuICAgICAgICAgICAgICAgIDogZGF0YTtcbiAgICAgICAgICAgIGlmICgham9iRGF0YSB8fCBqb2JEYXRhW1wiQHR5cGVcIl0gIT09IFwiSm9iUG9zdGluZ1wiKVxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBsb2NhdGlvbjogam9iRGF0YS5qb2JMb2NhdGlvbj8uYWRkcmVzcz8uYWRkcmVzc0xvY2FsaXR5IHx8XG4gICAgICAgICAgICAgICAgICAgIGpvYkRhdGEuam9iTG9jYXRpb24/LmFkZHJlc3M/Lm5hbWUsXG4gICAgICAgICAgICAgICAgc2FsYXJ5OiBqb2JEYXRhLmJhc2VTYWxhcnk/LnZhbHVlXG4gICAgICAgICAgICAgICAgICAgID8gYCQke2pvYkRhdGEuYmFzZVNhbGFyeS52YWx1ZS5taW5WYWx1ZSB8fCBcIlwifS0ke2pvYkRhdGEuYmFzZVNhbGFyeS52YWx1ZS5tYXhWYWx1ZSB8fCBcIlwifSAke2pvYkRhdGEuYmFzZVNhbGFyeS52YWx1ZS51bml0VGV4dCB8fCBcIlwifWBcbiAgICAgICAgICAgICAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgcG9zdGVkQXQ6IGpvYkRhdGEuZGF0ZVBvc3RlZCxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2gge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLyBHcmVlbmhvdXNlIGpvYiBib2FyZCBzY3JhcGVyXG5pbXBvcnQgeyBCYXNlU2NyYXBlciB9IGZyb20gXCIuL2Jhc2Utc2NyYXBlclwiO1xuZXhwb3J0IGNsYXNzIEdyZWVuaG91c2VTY3JhcGVyIGV4dGVuZHMgQmFzZVNjcmFwZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlciguLi5hcmd1bWVudHMpO1xuICAgICAgICB0aGlzLnNvdXJjZSA9IFwiZ3JlZW5ob3VzZVwiO1xuICAgICAgICB0aGlzLnVybFBhdHRlcm5zID0gW1xuICAgICAgICAgICAgL2JvYXJkc1xcLmdyZWVuaG91c2VcXC5pb1xcL1tcXHctXStcXC9qb2JzXFwvXFxkKy8sXG4gICAgICAgICAgICAvW1xcdy1dK1xcLmdyZWVuaG91c2VcXC5pb1xcL2pvYnNcXC9cXGQrLyxcbiAgICAgICAgICAgIC9ncmVlbmhvdXNlXFwuaW9cXC9lbWJlZFxcL2pvYl9hcHAvLFxuICAgICAgICBdO1xuICAgIH1cbiAgICBjYW5IYW5kbGUodXJsKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnVybFBhdHRlcm5zLnNvbWUoKHApID0+IHAudGVzdCh1cmwpKTtcbiAgICB9XG4gICAgYXN5bmMgc2NyYXBlSm9iTGlzdGluZygpIHtcbiAgICAgICAgLy8gV2FpdCBmb3Igam9iIGNvbnRlbnQgdG8gbG9hZFxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy53YWl0Rm9yRWxlbWVudChcIi5hcHAtdGl0bGUsICNoZWFkZXIgLmNvbXBhbnktbmFtZSwgLmpvYi10aXRsZVwiLCAzMDAwKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCB7XG4gICAgICAgICAgICAvLyBDb250aW51ZSB3aXRoIGF2YWlsYWJsZSBkYXRhXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdGl0bGUgPSB0aGlzLmV4dHJhY3RKb2JUaXRsZSgpO1xuICAgICAgICBjb25zdCBjb21wYW55ID0gdGhpcy5leHRyYWN0Q29tcGFueSgpO1xuICAgICAgICBjb25zdCBsb2NhdGlvbiA9IHRoaXMuZXh0cmFjdExvY2F0aW9uKCk7XG4gICAgICAgIGNvbnN0IGRlc2NyaXB0aW9uID0gdGhpcy5leHRyYWN0RGVzY3JpcHRpb24oKTtcbiAgICAgICAgaWYgKCF0aXRsZSB8fCAhY29tcGFueSB8fCAhZGVzY3JpcHRpb24pIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiW1Nsb3RoaW5nXSBHcmVlbmhvdXNlIHNjcmFwZXI6IE1pc3NpbmcgcmVxdWlyZWQgZmllbGRzXCIsIHtcbiAgICAgICAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICAgICAgICBjb21wYW55LFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAhIWRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzdHJ1Y3R1cmVkRGF0YSA9IHRoaXMuZXh0cmFjdFN0cnVjdHVyZWREYXRhKCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICAgIGNvbXBhbnksXG4gICAgICAgICAgICBsb2NhdGlvbjogbG9jYXRpb24gfHwgc3RydWN0dXJlZERhdGE/LmxvY2F0aW9uLFxuICAgICAgICAgICAgZGVzY3JpcHRpb24sXG4gICAgICAgICAgICByZXF1aXJlbWVudHM6IHRoaXMuZXh0cmFjdFJlcXVpcmVtZW50cyhkZXNjcmlwdGlvbiksXG4gICAgICAgICAgICBrZXl3b3JkczogdGhpcy5leHRyYWN0S2V5d29yZHMoZGVzY3JpcHRpb24pLFxuICAgICAgICAgICAgc2FsYXJ5OiB0aGlzLmV4dHJhY3RTYWxhcnkoZGVzY3JpcHRpb24pIHx8IHN0cnVjdHVyZWREYXRhPy5zYWxhcnksXG4gICAgICAgICAgICB0eXBlOiB0aGlzLmRldGVjdEpvYlR5cGUoZGVzY3JpcHRpb24pIHx8IHN0cnVjdHVyZWREYXRhPy50eXBlLFxuICAgICAgICAgICAgcmVtb3RlOiB0aGlzLmRldGVjdFJlbW90ZShsb2NhdGlvbiB8fCBcIlwiKSB8fCB0aGlzLmRldGVjdFJlbW90ZShkZXNjcmlwdGlvbiksXG4gICAgICAgICAgICB1cmw6IHdpbmRvdy5sb2NhdGlvbi5ocmVmLFxuICAgICAgICAgICAgc291cmNlOiB0aGlzLnNvdXJjZSxcbiAgICAgICAgICAgIHNvdXJjZUpvYklkOiB0aGlzLmV4dHJhY3RKb2JJZCgpLFxuICAgICAgICAgICAgcG9zdGVkQXQ6IHN0cnVjdHVyZWREYXRhPy5wb3N0ZWRBdCxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgYXN5bmMgc2NyYXBlSm9iTGlzdCgpIHtcbiAgICAgICAgY29uc3Qgam9icyA9IFtdO1xuICAgICAgICAvLyBKb2IgY2FyZHMgb24gZGVwYXJ0bWVudC9saXN0aW5nIHBhZ2VzXG4gICAgICAgIGNvbnN0IGpvYkNhcmRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLm9wZW5pbmcsIC5qb2ItcG9zdCwgW2RhdGEtbWFwcGVkPVwidHJ1ZVwiXSwgc2VjdGlvbi5sZXZlbC0wID4gZGl2Jyk7XG4gICAgICAgIGZvciAoY29uc3QgY2FyZCBvZiBqb2JDYXJkcykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCB0aXRsZUVsID0gY2FyZC5xdWVyeVNlbGVjdG9yKFwiYSwgLm9wZW5pbmctdGl0bGUsIC5qb2ItdGl0bGVcIik7XG4gICAgICAgICAgICAgICAgY29uc3QgbG9jYXRpb25FbCA9IGNhcmQucXVlcnlTZWxlY3RvcihcIi5sb2NhdGlvbiwgLmpvYi1sb2NhdGlvbiwgc3BhbjpsYXN0LWNoaWxkXCIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRpdGxlID0gdGl0bGVFbD8udGV4dENvbnRlbnQ/LnRyaW0oKTtcbiAgICAgICAgICAgICAgICBjb25zdCBsb2NhdGlvbiA9IGxvY2F0aW9uRWw/LnRleHRDb250ZW50Py50cmltKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgdXJsID0gdGl0bGVFbD8uaHJlZjtcbiAgICAgICAgICAgICAgICAvLyBDb21wYW55IGlzIHVzdWFsbHkgaW4gaGVhZGVyXG4gICAgICAgICAgICAgICAgY29uc3QgY29tcGFueSA9IHRoaXMuZXh0cmFjdENvbXBhbnkoKTtcbiAgICAgICAgICAgICAgICBpZiAodGl0bGUgJiYgdXJsICYmIGNvbXBhbnkpIHtcbiAgICAgICAgICAgICAgICAgICAgam9icy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGFueSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXF1aXJlbWVudHM6IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsLFxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiB0aGlzLnNvdXJjZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZUpvYklkOiB0aGlzLmV4dHJhY3RKb2JJZEZyb21VcmwodXJsKSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJbU2xvdGhpbmddIEVycm9yIHNjcmFwaW5nIEdyZWVuaG91c2Ugam9iIGNhcmQ6XCIsIGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGpvYnM7XG4gICAgfVxuICAgIGV4dHJhY3RKb2JUaXRsZSgpIHtcbiAgICAgICAgY29uc3Qgc2VsZWN0b3JzID0gW1xuICAgICAgICAgICAgXCIuYXBwLXRpdGxlXCIsXG4gICAgICAgICAgICBcIi5qb2ItdGl0bGVcIixcbiAgICAgICAgICAgIFwiaDEuaGVhZGluZ1wiLFxuICAgICAgICAgICAgXCIuam9iLWluZm8gaDFcIixcbiAgICAgICAgICAgIFwiI2hlYWRlciBoMVwiLFxuICAgICAgICAgICAgJ2gxW2NsYXNzKj1cImpvYlwiXScsXG4gICAgICAgICAgICBcIi5oZXJvIGgxXCIsXG4gICAgICAgIF07XG4gICAgICAgIGZvciAoY29uc3Qgc2VsZWN0b3Igb2Ygc2VsZWN0b3JzKSB7XG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0gdGhpcy5leHRyYWN0VGV4dENvbnRlbnQoc2VsZWN0b3IpO1xuICAgICAgICAgICAgaWYgKHRleHQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVHJ5IHN0cnVjdHVyZWQgZGF0YVxuICAgICAgICBjb25zdCBsZEpzb24gPSB0aGlzLmV4dHJhY3RTdHJ1Y3R1cmVkRGF0YSgpO1xuICAgICAgICBpZiAobGRKc29uPy50aXRsZSlcbiAgICAgICAgICAgIHJldHVybiBsZEpzb24udGl0bGU7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBleHRyYWN0Q29tcGFueSgpIHtcbiAgICAgICAgY29uc3Qgc2VsZWN0b3JzID0gW1xuICAgICAgICAgICAgXCIuY29tcGFueS1uYW1lXCIsXG4gICAgICAgICAgICBcIiNoZWFkZXIgLmNvbXBhbnktbmFtZVwiLFxuICAgICAgICAgICAgXCIubG9nby13cmFwcGVyIGltZ1thbHRdXCIsXG4gICAgICAgICAgICBcIi5jb21wYW55LWhlYWRlciAubmFtZVwiLFxuICAgICAgICAgICAgJ21ldGFbcHJvcGVydHk9XCJvZzpzaXRlX25hbWVcIl0nLFxuICAgICAgICBdO1xuICAgICAgICBmb3IgKGNvbnN0IHNlbGVjdG9yIG9mIHNlbGVjdG9ycykge1xuICAgICAgICAgICAgaWYgKHNlbGVjdG9yLmluY2x1ZGVzKFwibWV0YVwiKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1ldGEgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgICAgICAgICAgICBjb25zdCBjb250ZW50ID0gbWV0YT8uZ2V0QXR0cmlidXRlKFwiY29udGVudFwiKTtcbiAgICAgICAgICAgICAgICBpZiAoY29udGVudClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbnRlbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChzZWxlY3Rvci5pbmNsdWRlcyhcImltZ1thbHRdXCIpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW1nID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgICAgICAgICAgICAgY29uc3QgYWx0ID0gaW1nPy5nZXRBdHRyaWJ1dGUoXCJhbHRcIik7XG4gICAgICAgICAgICAgICAgaWYgKGFsdClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRleHQgPSB0aGlzLmV4dHJhY3RUZXh0Q29udGVudChzZWxlY3Rvcik7XG4gICAgICAgICAgICAgICAgaWYgKHRleHQpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0ZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIEV4dHJhY3QgZnJvbSBVUkwgKGJvYXJkcy5ncmVlbmhvdXNlLmlvL0NPTVBBTlkvam9icy8uLi4pXG4gICAgICAgIGNvbnN0IG1hdGNoID0gd2luZG93LmxvY2F0aW9uLmhyZWYubWF0Y2goL2dyZWVuaG91c2VcXC5pb1xcLyhbXi9dKykvKTtcbiAgICAgICAgaWYgKG1hdGNoICYmIG1hdGNoWzFdICE9PSBcImpvYnNcIikge1xuICAgICAgICAgICAgcmV0dXJuIG1hdGNoWzFdXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoLy0vZywgXCIgXCIpXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcYlxcdy9nLCAoYykgPT4gYy50b1VwcGVyQ2FzZSgpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZXh0cmFjdExvY2F0aW9uKCkge1xuICAgICAgICBjb25zdCBzZWxlY3RvcnMgPSBbXG4gICAgICAgICAgICBcIi5sb2NhdGlvblwiLFxuICAgICAgICAgICAgXCIuam9iLWxvY2F0aW9uXCIsXG4gICAgICAgICAgICBcIi5jb21wYW55LWxvY2F0aW9uXCIsXG4gICAgICAgICAgICBcIi5qb2ItaW5mbyAubG9jYXRpb25cIixcbiAgICAgICAgICAgIFwiI2hlYWRlciAubG9jYXRpb25cIixcbiAgICAgICAgXTtcbiAgICAgICAgZm9yIChjb25zdCBzZWxlY3RvciBvZiBzZWxlY3RvcnMpIHtcbiAgICAgICAgICAgIGNvbnN0IHRleHQgPSB0aGlzLmV4dHJhY3RUZXh0Q29udGVudChzZWxlY3Rvcik7XG4gICAgICAgICAgICBpZiAodGV4dClcbiAgICAgICAgICAgICAgICByZXR1cm4gdGV4dDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZXh0cmFjdERlc2NyaXB0aW9uKCkge1xuICAgICAgICBjb25zdCBzZWxlY3RvcnMgPSBbXG4gICAgICAgICAgICBcIiNjb250ZW50XCIsXG4gICAgICAgICAgICBcIi5qb2ItZGVzY3JpcHRpb25cIixcbiAgICAgICAgICAgIFwiLmNvbnRlbnQtd3JhcHBlciAuY29udGVudFwiLFxuICAgICAgICAgICAgXCIjam9iX2Rlc2NyaXB0aW9uXCIsXG4gICAgICAgICAgICBcIi5qb2ItY29udGVudFwiLFxuICAgICAgICAgICAgXCIuam9iLWluZm8gLmNvbnRlbnRcIixcbiAgICAgICAgXTtcbiAgICAgICAgZm9yIChjb25zdCBzZWxlY3RvciBvZiBzZWxlY3RvcnMpIHtcbiAgICAgICAgICAgIGNvbnN0IGh0bWwgPSB0aGlzLmV4dHJhY3RIdG1sQ29udGVudChzZWxlY3Rvcik7XG4gICAgICAgICAgICBpZiAoaHRtbCAmJiBodG1sLmxlbmd0aCA+IDEwMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNsZWFuRGVzY3JpcHRpb24oaHRtbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGV4dHJhY3RKb2JJZCgpIHtcbiAgICAgICAgLy8gRnJvbSBVUkw6IGJvYXJkcy5ncmVlbmhvdXNlLmlvL2NvbXBhbnkvam9icy8xMjM0NVxuICAgICAgICBjb25zdCBtYXRjaCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLm1hdGNoKC9cXC9qb2JzXFwvKFxcZCspLyk7XG4gICAgICAgIHJldHVybiBtYXRjaD8uWzFdO1xuICAgIH1cbiAgICBleHRyYWN0Sm9iSWRGcm9tVXJsKHVybCkge1xuICAgICAgICBjb25zdCBtYXRjaCA9IHVybC5tYXRjaCgvXFwvam9ic1xcLyhcXGQrKS8pO1xuICAgICAgICByZXR1cm4gbWF0Y2g/LlsxXTtcbiAgICB9XG4gICAgZXh0cmFjdFN0cnVjdHVyZWREYXRhKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgbGRKc29uRWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdzY3JpcHRbdHlwZT1cImFwcGxpY2F0aW9uL2xkK2pzb25cIl0nKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgZWwgb2YgbGRKc29uRWxlbWVudHMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWVsLnRleHRDb250ZW50KVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0gSlNPTi5wYXJzZShlbC50ZXh0Q29udGVudCk7XG4gICAgICAgICAgICAgICAgY29uc3Qgam9iRGF0YSA9IEFycmF5LmlzQXJyYXkoZGF0YSlcbiAgICAgICAgICAgICAgICAgICAgPyBkYXRhLmZpbmQoKGQpID0+IGRbXCJAdHlwZVwiXSA9PT0gXCJKb2JQb3N0aW5nXCIpXG4gICAgICAgICAgICAgICAgICAgIDogZGF0YTtcbiAgICAgICAgICAgICAgICBpZiAoIWpvYkRhdGEgfHwgam9iRGF0YVtcIkB0eXBlXCJdICE9PSBcIkpvYlBvc3RpbmdcIilcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgY29uc3QgZW1wbG95bWVudFR5cGUgPSBqb2JEYXRhLmVtcGxveW1lbnRUeXBlPy50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgICAgIGxldCB0eXBlO1xuICAgICAgICAgICAgICAgIGlmIChlbXBsb3ltZW50VHlwZT8uaW5jbHVkZXMoXCJmdWxsXCIpKVxuICAgICAgICAgICAgICAgICAgICB0eXBlID0gXCJmdWxsLXRpbWVcIjtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChlbXBsb3ltZW50VHlwZT8uaW5jbHVkZXMoXCJwYXJ0XCIpKVxuICAgICAgICAgICAgICAgICAgICB0eXBlID0gXCJwYXJ0LXRpbWVcIjtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChlbXBsb3ltZW50VHlwZT8uaW5jbHVkZXMoXCJjb250cmFjdFwiKSlcbiAgICAgICAgICAgICAgICAgICAgdHlwZSA9IFwiY29udHJhY3RcIjtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChlbXBsb3ltZW50VHlwZT8uaW5jbHVkZXMoXCJpbnRlcm5cIikpXG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPSBcImludGVybnNoaXBcIjtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZTogam9iRGF0YS50aXRsZSxcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb246IHR5cGVvZiBqb2JEYXRhLmpvYkxvY2F0aW9uID09PSBcInN0cmluZ1wiXG4gICAgICAgICAgICAgICAgICAgICAgICA/IGpvYkRhdGEuam9iTG9jYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIDogam9iRGF0YS5qb2JMb2NhdGlvbj8uYWRkcmVzcz8uYWRkcmVzc0xvY2FsaXR5IHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgam9iRGF0YS5qb2JMb2NhdGlvbj8uYWRkcmVzcz8ubmFtZSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGpvYkRhdGEuam9iTG9jYXRpb24/Lm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIHNhbGFyeTogam9iRGF0YS5iYXNlU2FsYXJ5Py52YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgPyBgJCR7am9iRGF0YS5iYXNlU2FsYXJ5LnZhbHVlLm1pblZhbHVlIHx8IFwiXCJ9LSR7am9iRGF0YS5iYXNlU2FsYXJ5LnZhbHVlLm1heFZhbHVlIHx8IFwiXCJ9YFxuICAgICAgICAgICAgICAgICAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgIHBvc3RlZEF0OiBqb2JEYXRhLmRhdGVQb3N0ZWQsXG4gICAgICAgICAgICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8gTGV2ZXIgam9iIGJvYXJkIHNjcmFwZXJcbmltcG9ydCB7IEJhc2VTY3JhcGVyIH0gZnJvbSBcIi4vYmFzZS1zY3JhcGVyXCI7XG5leHBvcnQgY2xhc3MgTGV2ZXJTY3JhcGVyIGV4dGVuZHMgQmFzZVNjcmFwZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlciguLi5hcmd1bWVudHMpO1xuICAgICAgICB0aGlzLnNvdXJjZSA9IFwibGV2ZXJcIjtcbiAgICAgICAgdGhpcy51cmxQYXR0ZXJucyA9IFtcbiAgICAgICAgICAgIC9qb2JzXFwubGV2ZXJcXC5jb1xcL1tcXHctXStcXC9bXFx3LV0rLyxcbiAgICAgICAgICAgIC9bXFx3LV0rXFwubGV2ZXJcXC5jb1xcL1tcXHctXSsvLFxuICAgICAgICBdO1xuICAgIH1cbiAgICBjYW5IYW5kbGUodXJsKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnVybFBhdHRlcm5zLnNvbWUoKHApID0+IHAudGVzdCh1cmwpKTtcbiAgICB9XG4gICAgYXN5bmMgc2NyYXBlSm9iTGlzdGluZygpIHtcbiAgICAgICAgLy8gV2FpdCBmb3Igam9iIGNvbnRlbnQgdG8gbG9hZFxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy53YWl0Rm9yRWxlbWVudChcIi5wb3N0aW5nLWhlYWRsaW5lIGgyLCAucG9zdGluZy1oZWFkbGluZSBoMSwgLnNlY3Rpb24td3JhcHBlclwiLCAzMDAwKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCB7XG4gICAgICAgICAgICAvLyBDb250aW51ZSB3aXRoIGF2YWlsYWJsZSBkYXRhXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdGl0bGUgPSB0aGlzLmV4dHJhY3RKb2JUaXRsZSgpO1xuICAgICAgICBjb25zdCBjb21wYW55ID0gdGhpcy5leHRyYWN0Q29tcGFueSgpO1xuICAgICAgICBjb25zdCBsb2NhdGlvbiA9IHRoaXMuZXh0cmFjdExvY2F0aW9uKCk7XG4gICAgICAgIGNvbnN0IGRlc2NyaXB0aW9uID0gdGhpcy5leHRyYWN0RGVzY3JpcHRpb24oKTtcbiAgICAgICAgaWYgKCF0aXRsZSB8fCAhY29tcGFueSB8fCAhZGVzY3JpcHRpb24pIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiW1Nsb3RoaW5nXSBMZXZlciBzY3JhcGVyOiBNaXNzaW5nIHJlcXVpcmVkIGZpZWxkc1wiLCB7XG4gICAgICAgICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgICAgICAgY29tcGFueSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogISFkZXNjcmlwdGlvbixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgc3RydWN0dXJlZERhdGEgPSB0aGlzLmV4dHJhY3RTdHJ1Y3R1cmVkRGF0YSgpO1xuICAgICAgICBjb25zdCBjb21taXRtZW50ID0gdGhpcy5leHRyYWN0Q29tbWl0bWVudCgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgICBjb21wYW55LFxuICAgICAgICAgICAgbG9jYXRpb246IGxvY2F0aW9uIHx8IHN0cnVjdHVyZWREYXRhPy5sb2NhdGlvbixcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgcmVxdWlyZW1lbnRzOiB0aGlzLmV4dHJhY3RSZXF1aXJlbWVudHMoZGVzY3JpcHRpb24pLFxuICAgICAgICAgICAga2V5d29yZHM6IHRoaXMuZXh0cmFjdEtleXdvcmRzKGRlc2NyaXB0aW9uKSxcbiAgICAgICAgICAgIHNhbGFyeTogdGhpcy5leHRyYWN0U2FsYXJ5KGRlc2NyaXB0aW9uKSB8fCBzdHJ1Y3R1cmVkRGF0YT8uc2FsYXJ5LFxuICAgICAgICAgICAgdHlwZTogdGhpcy5kZXRlY3RKb2JUeXBlRnJvbUNvbW1pdG1lbnQoY29tbWl0bWVudCkgfHxcbiAgICAgICAgICAgICAgICB0aGlzLmRldGVjdEpvYlR5cGUoZGVzY3JpcHRpb24pLFxuICAgICAgICAgICAgcmVtb3RlOiB0aGlzLmRldGVjdFJlbW90ZShsb2NhdGlvbiB8fCBcIlwiKSB8fCB0aGlzLmRldGVjdFJlbW90ZShkZXNjcmlwdGlvbiksXG4gICAgICAgICAgICB1cmw6IHdpbmRvdy5sb2NhdGlvbi5ocmVmLFxuICAgICAgICAgICAgc291cmNlOiB0aGlzLnNvdXJjZSxcbiAgICAgICAgICAgIHNvdXJjZUpvYklkOiB0aGlzLmV4dHJhY3RKb2JJZCgpLFxuICAgICAgICAgICAgcG9zdGVkQXQ6IHN0cnVjdHVyZWREYXRhPy5wb3N0ZWRBdCxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgYXN5bmMgc2NyYXBlSm9iTGlzdCgpIHtcbiAgICAgICAgY29uc3Qgam9icyA9IFtdO1xuICAgICAgICAvLyBKb2IgcG9zdGluZ3Mgb24gY29tcGFueSBwYWdlXG4gICAgICAgIGNvbnN0IGpvYkNhcmRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnBvc3RpbmcsIFtkYXRhLXFhPVwicG9zdGluZy1uYW1lXCJdJyk7XG4gICAgICAgIGZvciAoY29uc3QgY2FyZCBvZiBqb2JDYXJkcykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCB0aXRsZUVsID0gY2FyZC5xdWVyeVNlbGVjdG9yKCcucG9zdGluZy10aXRsZSBoNSwgLnBvc3RpbmctbmFtZSwgYVtkYXRhLXFhPVwicG9zdGluZy1uYW1lXCJdJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgbG9jYXRpb25FbCA9IGNhcmQucXVlcnlTZWxlY3RvcihcIi5sb2NhdGlvbiwgLnBvc3RpbmctY2F0ZWdvcmllcyAuc29ydC1ieS1sb2NhdGlvbiwgLndvcmtwbGFjZVR5cGVzXCIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbW1pdG1lbnRFbCA9IGNhcmQucXVlcnlTZWxlY3RvcihcIi5jb21taXRtZW50LCAucG9zdGluZy1jYXRlZ29yaWVzIC5zb3J0LWJ5LWNvbW1pdG1lbnRcIik7XG4gICAgICAgICAgICAgICAgY29uc3QgdGl0bGUgPSB0aXRsZUVsPy50ZXh0Q29udGVudD8udHJpbSgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2F0aW9uID0gbG9jYXRpb25FbD8udGV4dENvbnRlbnQ/LnRyaW0oKTtcbiAgICAgICAgICAgICAgICBjb25zdCBjb21taXRtZW50ID0gY29tbWl0bWVudEVsPy50ZXh0Q29udGVudD8udHJpbSgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IGNhcmQucXVlcnlTZWxlY3RvcignYS5wb3N0aW5nLXRpdGxlLCBhW2RhdGEtcWE9XCJwb3N0aW5nLW5hbWVcIl0nKT8uaHJlZiB8fCBjYXJkLmhyZWY7XG4gICAgICAgICAgICAgICAgY29uc3QgY29tcGFueSA9IHRoaXMuZXh0cmFjdENvbXBhbnkoKTtcbiAgICAgICAgICAgICAgICBpZiAodGl0bGUgJiYgdXJsICYmIGNvbXBhbnkpIHtcbiAgICAgICAgICAgICAgICAgICAgam9icy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGFueSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXF1aXJlbWVudHM6IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsLFxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiB0aGlzLnNvdXJjZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZUpvYklkOiB0aGlzLmV4dHJhY3RKb2JJZEZyb21VcmwodXJsKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IHRoaXMuZGV0ZWN0Sm9iVHlwZUZyb21Db21taXRtZW50KGNvbW1pdG1lbnQgPz8gbnVsbCksXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiW1Nsb3RoaW5nXSBFcnJvciBzY3JhcGluZyBMZXZlciBqb2IgY2FyZDpcIiwgZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gam9icztcbiAgICB9XG4gICAgZXh0cmFjdEpvYlRpdGxlKCkge1xuICAgICAgICBjb25zdCBzZWxlY3RvcnMgPSBbXG4gICAgICAgICAgICBcIi5wb3N0aW5nLWhlYWRsaW5lIGgyXCIsXG4gICAgICAgICAgICBcIi5wb3N0aW5nLWhlYWRsaW5lIGgxXCIsXG4gICAgICAgICAgICAnW2RhdGEtcWE9XCJwb3N0aW5nLW5hbWVcIl0nLFxuICAgICAgICAgICAgXCIucG9zdGluZy1oZWFkZXIgaDJcIixcbiAgICAgICAgICAgIFwiLnNlY3Rpb24ucGFnZS1jZW50ZXJlZC5wb3N0aW5nLWhlYWRlciBoMVwiLFxuICAgICAgICBdO1xuICAgICAgICBmb3IgKGNvbnN0IHNlbGVjdG9yIG9mIHNlbGVjdG9ycykge1xuICAgICAgICAgICAgY29uc3QgdGV4dCA9IHRoaXMuZXh0cmFjdFRleHRDb250ZW50KHNlbGVjdG9yKTtcbiAgICAgICAgICAgIGlmICh0ZXh0KVxuICAgICAgICAgICAgICAgIHJldHVybiB0ZXh0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBleHRyYWN0Q29tcGFueSgpIHtcbiAgICAgICAgLy8gVHJ5IGxvZ28gYWx0IHRleHRcbiAgICAgICAgY29uc3QgbG9nbyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubWFpbi1oZWFkZXItbG9nbyBpbWcsIC5wb3N0aW5nLWhlYWRlciAubG9nbyBpbWcsIGhlYWRlciBpbWdcIik7XG4gICAgICAgIGlmIChsb2dvKSB7XG4gICAgICAgICAgICBjb25zdCBhbHQgPSBsb2dvLmdldEF0dHJpYnV0ZShcImFsdFwiKTtcbiAgICAgICAgICAgIGlmIChhbHQgJiYgYWx0ICE9PSBcIkNvbXBhbnkgTG9nb1wiKVxuICAgICAgICAgICAgICAgIHJldHVybiBhbHQ7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVHJ5IHBhZ2UgdGl0bGVcbiAgICAgICAgY29uc3QgcGFnZVRpdGxlID0gZG9jdW1lbnQudGl0bGU7XG4gICAgICAgIGlmIChwYWdlVGl0bGUpIHtcbiAgICAgICAgICAgIC8vIEZvcm1hdDogXCJKb2IgVGl0bGUgLSBDb21wYW55IE5hbWVcIlxuICAgICAgICAgICAgY29uc3QgcGFydHMgPSBwYWdlVGl0bGUuc3BsaXQoXCIgLSBcIik7XG4gICAgICAgICAgICBpZiAocGFydHMubGVuZ3RoID49IDIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFydHNbcGFydHMubGVuZ3RoIC0gMV0ucmVwbGFjZShcIiBKb2JzXCIsIFwiXCIpLnRyaW0oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBFeHRyYWN0IGZyb20gVVJMXG4gICAgICAgIGNvbnN0IG1hdGNoID0gd2luZG93LmxvY2F0aW9uLmhyZWYubWF0Y2goL2xldmVyXFwuY29cXC8oW14vXSspLyk7XG4gICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgICAgcmV0dXJuIG1hdGNoWzFdXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoLy0vZywgXCIgXCIpXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcYlxcdy9nLCAoYykgPT4gYy50b1VwcGVyQ2FzZSgpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZXh0cmFjdExvY2F0aW9uKCkge1xuICAgICAgICBjb25zdCBzZWxlY3RvcnMgPSBbXG4gICAgICAgICAgICBcIi5wb3N0aW5nLWNhdGVnb3JpZXMgLmxvY2F0aW9uXCIsXG4gICAgICAgICAgICBcIi5wb3N0aW5nLWhlYWRsaW5lIC5sb2NhdGlvblwiLFxuICAgICAgICAgICAgXCIuc29ydC1ieS1sb2NhdGlvblwiLFxuICAgICAgICAgICAgXCIud29ya3BsYWNlVHlwZXNcIixcbiAgICAgICAgICAgICdbZGF0YS1xYT1cInBvc3RpbmctbG9jYXRpb25cIl0nLFxuICAgICAgICBdO1xuICAgICAgICBmb3IgKGNvbnN0IHNlbGVjdG9yIG9mIHNlbGVjdG9ycykge1xuICAgICAgICAgICAgY29uc3QgdGV4dCA9IHRoaXMuZXh0cmFjdFRleHRDb250ZW50KHNlbGVjdG9yKTtcbiAgICAgICAgICAgIGlmICh0ZXh0KVxuICAgICAgICAgICAgICAgIHJldHVybiB0ZXh0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBleHRyYWN0Q29tbWl0bWVudCgpIHtcbiAgICAgICAgY29uc3Qgc2VsZWN0b3JzID0gW1xuICAgICAgICAgICAgXCIucG9zdGluZy1jYXRlZ29yaWVzIC5jb21taXRtZW50XCIsXG4gICAgICAgICAgICBcIi5zb3J0LWJ5LWNvbW1pdG1lbnRcIixcbiAgICAgICAgICAgICdbZGF0YS1xYT1cInBvc3RpbmctY29tbWl0bWVudFwiXScsXG4gICAgICAgIF07XG4gICAgICAgIGZvciAoY29uc3Qgc2VsZWN0b3Igb2Ygc2VsZWN0b3JzKSB7XG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0gdGhpcy5leHRyYWN0VGV4dENvbnRlbnQoc2VsZWN0b3IpO1xuICAgICAgICAgICAgaWYgKHRleHQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGV4dHJhY3REZXNjcmlwdGlvbigpIHtcbiAgICAgICAgY29uc3Qgc2VsZWN0b3JzID0gW1xuICAgICAgICAgICAgXCIucG9zdGluZy1wYWdlIC5jb250ZW50XCIsXG4gICAgICAgICAgICBcIi5zZWN0aW9uLXdyYXBwZXIucGFnZS1mdWxsLXdpZHRoXCIsXG4gICAgICAgICAgICBcIi5zZWN0aW9uLnBhZ2UtY2VudGVyZWRcIixcbiAgICAgICAgICAgICdbZGF0YS1xYT1cImpvYi1kZXNjcmlwdGlvblwiXScsXG4gICAgICAgICAgICBcIi5wb3N0aW5nLWRlc2NyaXB0aW9uXCIsXG4gICAgICAgIF07XG4gICAgICAgIGZvciAoY29uc3Qgc2VsZWN0b3Igb2Ygc2VsZWN0b3JzKSB7XG4gICAgICAgICAgICAvLyBGb3IgTGV2ZXIsIHdlIHdhbnQgdG8gZ2V0IGFsbCBjb250ZW50IHNlY3Rpb25zXG4gICAgICAgICAgICBjb25zdCBzZWN0aW9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICAgICAgICAgICAgaWYgKHNlY3Rpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBodG1sID0gQXJyYXkuZnJvbShzZWN0aW9ucylcbiAgICAgICAgICAgICAgICAgICAgLm1hcCgocykgPT4gcy5pbm5lckhUTUwpXG4gICAgICAgICAgICAgICAgICAgIC5qb2luKFwiXFxuXFxuXCIpO1xuICAgICAgICAgICAgICAgIGlmIChodG1sLmxlbmd0aCA+IDEwMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jbGVhbkRlc2NyaXB0aW9uKGh0bWwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBUcnkgZ2V0dGluZyB0aGUgbWFpbiBjb250ZW50IGFyZWFcbiAgICAgICAgY29uc3QgbWFpbkNvbnRlbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnQtd3JhcHBlciAuY29udGVudCwgbWFpbiAuY29udGVudFwiKTtcbiAgICAgICAgaWYgKG1haW5Db250ZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jbGVhbkRlc2NyaXB0aW9uKG1haW5Db250ZW50LmlubmVySFRNTCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGV4dHJhY3RKb2JJZCgpIHtcbiAgICAgICAgLy8gRnJvbSBVUkw6IGpvYnMubGV2ZXIuY28vY29tcGFueS9qb2ItaWQtdXVpZFxuICAgICAgICBjb25zdCBtYXRjaCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLm1hdGNoKC9sZXZlclxcLmNvXFwvW14vXStcXC8oW2EtZjAtOS1dKykvaSk7XG4gICAgICAgIHJldHVybiBtYXRjaD8uWzFdO1xuICAgIH1cbiAgICBleHRyYWN0Sm9iSWRGcm9tVXJsKHVybCkge1xuICAgICAgICBjb25zdCBtYXRjaCA9IHVybC5tYXRjaCgvbGV2ZXJcXC5jb1xcL1teL10rXFwvKFthLWYwLTktXSspL2kpO1xuICAgICAgICByZXR1cm4gbWF0Y2g/LlsxXTtcbiAgICB9XG4gICAgZGV0ZWN0Sm9iVHlwZUZyb21Db21taXRtZW50KGNvbW1pdG1lbnQpIHtcbiAgICAgICAgaWYgKCFjb21taXRtZW50KVxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgY29uc3QgbG93ZXIgPSBjb21taXRtZW50LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGlmIChsb3dlci5pbmNsdWRlcyhcImZ1bGwtdGltZVwiKSB8fCBsb3dlci5pbmNsdWRlcyhcImZ1bGwgdGltZVwiKSlcbiAgICAgICAgICAgIHJldHVybiBcImZ1bGwtdGltZVwiO1xuICAgICAgICBpZiAobG93ZXIuaW5jbHVkZXMoXCJwYXJ0LXRpbWVcIikgfHwgbG93ZXIuaW5jbHVkZXMoXCJwYXJ0IHRpbWVcIikpXG4gICAgICAgICAgICByZXR1cm4gXCJwYXJ0LXRpbWVcIjtcbiAgICAgICAgaWYgKGxvd2VyLmluY2x1ZGVzKFwiY29udHJhY3RcIikgfHwgbG93ZXIuaW5jbHVkZXMoXCJjb250cmFjdG9yXCIpKVxuICAgICAgICAgICAgcmV0dXJuIFwiY29udHJhY3RcIjtcbiAgICAgICAgaWYgKGxvd2VyLmluY2x1ZGVzKFwiaW50ZXJuXCIpKVxuICAgICAgICAgICAgcmV0dXJuIFwiaW50ZXJuc2hpcFwiO1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBleHRyYWN0U3RydWN0dXJlZERhdGEoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBsZEpzb25FbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ3NjcmlwdFt0eXBlPVwiYXBwbGljYXRpb24vbGQranNvblwiXScpO1xuICAgICAgICAgICAgZm9yIChjb25zdCBlbCBvZiBsZEpzb25FbGVtZW50cykge1xuICAgICAgICAgICAgICAgIGlmICghZWwudGV4dENvbnRlbnQpXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKGVsLnRleHRDb250ZW50KTtcbiAgICAgICAgICAgICAgICBjb25zdCBqb2JEYXRhID0gQXJyYXkuaXNBcnJheShkYXRhKVxuICAgICAgICAgICAgICAgICAgICA/IGRhdGEuZmluZCgoZCkgPT4gZFtcIkB0eXBlXCJdID09PSBcIkpvYlBvc3RpbmdcIilcbiAgICAgICAgICAgICAgICAgICAgOiBkYXRhO1xuICAgICAgICAgICAgICAgIGlmICgham9iRGF0YSB8fCBqb2JEYXRhW1wiQHR5cGVcIl0gIT09IFwiSm9iUG9zdGluZ1wiKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbjogdHlwZW9mIGpvYkRhdGEuam9iTG9jYXRpb24gPT09IFwic3RyaW5nXCJcbiAgICAgICAgICAgICAgICAgICAgICAgID8gam9iRGF0YS5qb2JMb2NhdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgOiBqb2JEYXRhLmpvYkxvY2F0aW9uPy5hZGRyZXNzPy5hZGRyZXNzTG9jYWxpdHkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqb2JEYXRhLmpvYkxvY2F0aW9uPy5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBzYWxhcnk6IGpvYkRhdGEuYmFzZVNhbGFyeT8udmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgID8gYCQke2pvYkRhdGEuYmFzZVNhbGFyeS52YWx1ZS5taW5WYWx1ZSB8fCBcIlwifS0ke2pvYkRhdGEuYmFzZVNhbGFyeS52YWx1ZS5tYXhWYWx1ZSB8fCBcIlwifWBcbiAgICAgICAgICAgICAgICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICBwb3N0ZWRBdDogam9iRGF0YS5kYXRlUG9zdGVkLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vIEdlbmVyaWMgam9iIHNjcmFwZXIgZm9yIHVua25vd24gc2l0ZXNcbmltcG9ydCB7IEJhc2VTY3JhcGVyIH0gZnJvbSBcIi4vYmFzZS1zY3JhcGVyXCI7XG5leHBvcnQgY2xhc3MgR2VuZXJpY1NjcmFwZXIgZXh0ZW5kcyBCYXNlU2NyYXBlciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKC4uLmFyZ3VtZW50cyk7XG4gICAgICAgIHRoaXMuc291cmNlID0gXCJ1bmtub3duXCI7XG4gICAgICAgIHRoaXMudXJsUGF0dGVybnMgPSBbXTtcbiAgICB9XG4gICAgY2FuSGFuZGxlKF91cmwpIHtcbiAgICAgICAgLy8gR2VuZXJpYyBzY3JhcGVyIGFsd2F5cyByZXR1cm5zIHRydWUgYXMgZmFsbGJhY2tcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGFzeW5jIHNjcmFwZUpvYkxpc3RpbmcoKSB7XG4gICAgICAgIC8vIFRyeSB0byBleHRyYWN0IGpvYiBpbmZvcm1hdGlvbiB1c2luZyBjb21tb24gcGF0dGVybnNcbiAgICAgICAgLy8gQ2hlY2sgZm9yIHN0cnVjdHVyZWQgZGF0YSBmaXJzdFxuICAgICAgICBjb25zdCBzdHJ1Y3R1cmVkRGF0YSA9IHRoaXMuZXh0cmFjdFN0cnVjdHVyZWREYXRhKCk7XG4gICAgICAgIGlmIChzdHJ1Y3R1cmVkRGF0YSkge1xuICAgICAgICAgICAgcmV0dXJuIHN0cnVjdHVyZWREYXRhO1xuICAgICAgICB9XG4gICAgICAgIC8vIFRyeSBjb21tb24gc2VsZWN0b3JzXG4gICAgICAgIGNvbnN0IHRpdGxlID0gdGhpcy5maW5kVGl0bGUoKTtcbiAgICAgICAgY29uc3QgY29tcGFueSA9IHRoaXMuZmluZENvbXBhbnkoKTtcbiAgICAgICAgY29uc3QgZGVzY3JpcHRpb24gPSB0aGlzLmZpbmREZXNjcmlwdGlvbigpO1xuICAgICAgICBpZiAoIXRpdGxlIHx8ICFkZXNjcmlwdGlvbikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJbU2xvdGhpbmddIEdlbmVyaWMgc2NyYXBlcjogQ291bGQgbm90IGZpbmQgcmVxdWlyZWQgZmllbGRzXCIpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbG9jYXRpb24gPSB0aGlzLmZpbmRMb2NhdGlvbigpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgICBjb21wYW55OiBjb21wYW55IHx8IFwiVW5rbm93biBDb21wYW55XCIsXG4gICAgICAgICAgICBsb2NhdGlvbjogbG9jYXRpb24gfHwgdW5kZWZpbmVkLFxuICAgICAgICAgICAgZGVzY3JpcHRpb24sXG4gICAgICAgICAgICByZXF1aXJlbWVudHM6IHRoaXMuZXh0cmFjdFJlcXVpcmVtZW50cyhkZXNjcmlwdGlvbiksXG4gICAgICAgICAgICBrZXl3b3JkczogdGhpcy5leHRyYWN0S2V5d29yZHMoZGVzY3JpcHRpb24pLFxuICAgICAgICAgICAgc2FsYXJ5OiB0aGlzLmV4dHJhY3RTYWxhcnkoZGVzY3JpcHRpb24pLFxuICAgICAgICAgICAgdHlwZTogdGhpcy5kZXRlY3RKb2JUeXBlKGRlc2NyaXB0aW9uKSxcbiAgICAgICAgICAgIHJlbW90ZTogdGhpcy5kZXRlY3RSZW1vdGUobG9jYXRpb24gfHwgXCJcIikgfHwgdGhpcy5kZXRlY3RSZW1vdGUoZGVzY3JpcHRpb24pLFxuICAgICAgICAgICAgdXJsOiB3aW5kb3cubG9jYXRpb24uaHJlZixcbiAgICAgICAgICAgIHNvdXJjZTogdGhpcy5kZXRlY3RTb3VyY2UoKSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgYXN5bmMgc2NyYXBlSm9iTGlzdCgpIHtcbiAgICAgICAgLy8gR2VuZXJpYyBzY3JhcGluZyBvZiBqb2IgbGlzdHMgaXMgdW5yZWxpYWJsZVxuICAgICAgICAvLyBSZXR1cm4gZW1wdHkgYXJyYXkgZm9yIHVua25vd24gc2l0ZXNcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBleHRyYWN0U3RydWN0dXJlZERhdGEoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBMb29rIGZvciBKU09OLUxEIGpvYiBwb3N0aW5nIHNjaGVtYVxuICAgICAgICAgICAgY29uc3Qgc2NyaXB0cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ3NjcmlwdFt0eXBlPVwiYXBwbGljYXRpb24vbGQranNvblwiXScpO1xuICAgICAgICAgICAgZm9yIChjb25zdCBzY3JpcHQgb2Ygc2NyaXB0cykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKHNjcmlwdC50ZXh0Q29udGVudCB8fCBcIlwiKTtcbiAgICAgICAgICAgICAgICAvLyBIYW5kbGUgc2luZ2xlIGpvYiBwb3N0aW5nXG4gICAgICAgICAgICAgICAgaWYgKGRhdGFbXCJAdHlwZVwiXSA9PT0gXCJKb2JQb3N0aW5nXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VKb2JQb3N0aW5nU2NoZW1hKGRhdGEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBIYW5kbGUgYXJyYXkgb2YgaXRlbXNcbiAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShkYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBqb2JQb3N0aW5nID0gZGF0YS5maW5kKChpdGVtKSA9PiBpdGVtW1wiQHR5cGVcIl0gPT09IFwiSm9iUG9zdGluZ1wiKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGpvYlBvc3RpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlSm9iUG9zdGluZ1NjaGVtYShqb2JQb3N0aW5nKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBIYW5kbGUgQGdyYXBoXG4gICAgICAgICAgICAgICAgaWYgKGRhdGFbXCJAZ3JhcGhcIl0pIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgam9iUG9zdGluZyA9IGRhdGFbXCJAZ3JhcGhcIl0uZmluZCgoaXRlbSkgPT4gaXRlbVtcIkB0eXBlXCJdID09PSBcIkpvYlBvc3RpbmdcIik7XG4gICAgICAgICAgICAgICAgICAgIGlmIChqb2JQb3N0aW5nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5wYXJzZUpvYlBvc3RpbmdTY2hlbWEoam9iUG9zdGluZyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJbU2xvdGhpbmddIENvdWxkIG5vdCBwYXJzZSBzdHJ1Y3R1cmVkIGRhdGE6XCIsIGVycik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHBhcnNlSm9iUG9zdGluZ1NjaGVtYShkYXRhKSB7XG4gICAgICAgIGNvbnN0IHRpdGxlID0gZGF0YS50aXRsZSB8fCBcIlwiO1xuICAgICAgICBjb25zdCBjb21wYW55ID0gZGF0YS5oaXJpbmdPcmdhbml6YXRpb24/Lm5hbWUgfHwgXCJcIjtcbiAgICAgICAgY29uc3QgZGVzY3JpcHRpb24gPSBkYXRhLmRlc2NyaXB0aW9uIHx8IFwiXCI7XG4gICAgICAgIC8vIEV4dHJhY3QgbG9jYXRpb25cbiAgICAgICAgbGV0IGxvY2F0aW9uO1xuICAgICAgICBjb25zdCBqb2JMb2NhdGlvbiA9IGRhdGEuam9iTG9jYXRpb247XG4gICAgICAgIGlmIChqb2JMb2NhdGlvbikge1xuICAgICAgICAgICAgY29uc3QgYWRkcmVzcyA9IGpvYkxvY2F0aW9uLmFkZHJlc3M7XG4gICAgICAgICAgICBpZiAoYWRkcmVzcykge1xuICAgICAgICAgICAgICAgIGxvY2F0aW9uID0gW1xuICAgICAgICAgICAgICAgICAgICBhZGRyZXNzLmFkZHJlc3NMb2NhbGl0eSxcbiAgICAgICAgICAgICAgICAgICAgYWRkcmVzcy5hZGRyZXNzUmVnaW9uLFxuICAgICAgICAgICAgICAgICAgICBhZGRyZXNzLmFkZHJlc3NDb3VudHJ5LFxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgLmZpbHRlcihCb29sZWFuKVxuICAgICAgICAgICAgICAgICAgICAuam9pbihcIiwgXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIEV4dHJhY3Qgc2FsYXJ5XG4gICAgICAgIGxldCBzYWxhcnk7XG4gICAgICAgIGNvbnN0IGJhc2VTYWxhcnkgPSBkYXRhLmJhc2VTYWxhcnk7XG4gICAgICAgIGlmIChiYXNlU2FsYXJ5KSB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGJhc2VTYWxhcnkudmFsdWU7XG4gICAgICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW5jeSA9IGJhc2VTYWxhcnkuY3VycmVuY3kgfHwgXCJVU0RcIjtcbiAgICAgICAgICAgICAgICBjb25zdCBtaW4gPSB2YWx1ZS5taW5WYWx1ZTtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXggPSB2YWx1ZS5tYXhWYWx1ZTtcbiAgICAgICAgICAgICAgICBpZiAobWluICYmIG1heCkge1xuICAgICAgICAgICAgICAgICAgICBzYWxhcnkgPSBgJHtjdXJyZW5jeX0gJHttaW4udG9Mb2NhbGVTdHJpbmcoKX0gLSAke21heC50b0xvY2FsZVN0cmluZygpfWA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHNhbGFyeSA9IGAke2N1cnJlbmN5fSAke3ZhbHVlLnRvTG9jYWxlU3RyaW5nKCl9YDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgICAgY29tcGFueSxcbiAgICAgICAgICAgIGxvY2F0aW9uLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IHRoaXMuY2xlYW5EZXNjcmlwdGlvbihkZXNjcmlwdGlvbiksXG4gICAgICAgICAgICByZXF1aXJlbWVudHM6IHRoaXMuZXh0cmFjdFJlcXVpcmVtZW50cyhkZXNjcmlwdGlvbiksXG4gICAgICAgICAgICBrZXl3b3JkczogdGhpcy5leHRyYWN0S2V5d29yZHMoZGVzY3JpcHRpb24pLFxuICAgICAgICAgICAgc2FsYXJ5LFxuICAgICAgICAgICAgdHlwZTogdGhpcy5wYXJzZUVtcGxveW1lbnRUeXBlKGRhdGEuZW1wbG95bWVudFR5cGUpLFxuICAgICAgICAgICAgcmVtb3RlOiB0aGlzLmRldGVjdFJlbW90ZShkZXNjcmlwdGlvbiksXG4gICAgICAgICAgICB1cmw6IHdpbmRvdy5sb2NhdGlvbi5ocmVmLFxuICAgICAgICAgICAgc291cmNlOiB0aGlzLmRldGVjdFNvdXJjZSgpLFxuICAgICAgICAgICAgcG9zdGVkQXQ6IGRhdGEuZGF0ZVBvc3RlZCxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgcGFyc2VFbXBsb3ltZW50VHlwZSh0eXBlKSB7XG4gICAgICAgIGlmICghdHlwZSlcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIGNvbnN0IGxvd2VyID0gdHlwZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBpZiAobG93ZXIuaW5jbHVkZXMoXCJmdWxsXCIpKVxuICAgICAgICAgICAgcmV0dXJuIFwiZnVsbC10aW1lXCI7XG4gICAgICAgIGlmIChsb3dlci5pbmNsdWRlcyhcInBhcnRcIikpXG4gICAgICAgICAgICByZXR1cm4gXCJwYXJ0LXRpbWVcIjtcbiAgICAgICAgaWYgKGxvd2VyLmluY2x1ZGVzKFwiY29udHJhY3RcIikgfHwgbG93ZXIuaW5jbHVkZXMoXCJ0ZW1wb3JhcnlcIikpXG4gICAgICAgICAgICByZXR1cm4gXCJjb250cmFjdFwiO1xuICAgICAgICBpZiAobG93ZXIuaW5jbHVkZXMoXCJpbnRlcm5cIikpXG4gICAgICAgICAgICByZXR1cm4gXCJpbnRlcm5zaGlwXCI7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGZpbmRUaXRsZSgpIHtcbiAgICAgICAgLy8gQ29tbW9uIHRpdGxlIHNlbGVjdG9yc1xuICAgICAgICBjb25zdCBzZWxlY3RvcnMgPSBbXG4gICAgICAgICAgICAnaDFbY2xhc3MqPVwidGl0bGVcIl0nLFxuICAgICAgICAgICAgJ2gxW2NsYXNzKj1cImpvYlwiXScsXG4gICAgICAgICAgICBcIi5qb2ItdGl0bGVcIixcbiAgICAgICAgICAgIFwiLnBvc3RpbmctdGl0bGVcIixcbiAgICAgICAgICAgICdbY2xhc3MqPVwiam9iLXRpdGxlXCJdJyxcbiAgICAgICAgICAgICdbY2xhc3MqPVwicG9zdGluZy10aXRsZVwiXScsXG4gICAgICAgICAgICBcImgxXCIsXG4gICAgICAgIF07XG4gICAgICAgIGZvciAoY29uc3Qgc2VsZWN0b3Igb2Ygc2VsZWN0b3JzKSB7XG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0gdGhpcy5leHRyYWN0VGV4dENvbnRlbnQoc2VsZWN0b3IpO1xuICAgICAgICAgICAgaWYgKHRleHQgJiYgdGV4dC5sZW5ndGggPiAzICYmIHRleHQubGVuZ3RoIDwgMjAwKSB7XG4gICAgICAgICAgICAgICAgLy8gRmlsdGVyIG91dCBjb21tb24gbm9uLXRpdGxlIGNvbnRlbnRcbiAgICAgICAgICAgICAgICBpZiAoIXRleHQudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhcInNpZ24gaW5cIikgJiZcbiAgICAgICAgICAgICAgICAgICAgIXRleHQudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhcImxvZyBpblwiKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGV4dDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gVHJ5IGRvY3VtZW50IHRpdGxlXG4gICAgICAgIGNvbnN0IGRvY1RpdGxlID0gZG9jdW1lbnQudGl0bGU7XG4gICAgICAgIGlmIChkb2NUaXRsZSAmJiBkb2NUaXRsZS5sZW5ndGggPiA1KSB7XG4gICAgICAgICAgICAvLyBSZW1vdmUgY29tbW9uIHN1ZmZpeGVzXG4gICAgICAgICAgICBjb25zdCBjbGVhbmVkID0gZG9jVGl0bGVcbiAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxzKlstfF1cXHMqLiskLywgXCJcIilcbiAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxzKmF0XFxzKy4rJC9pLCBcIlwiKVxuICAgICAgICAgICAgICAgIC50cmltKCk7XG4gICAgICAgICAgICBpZiAoY2xlYW5lZC5sZW5ndGggPiAzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNsZWFuZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGZpbmRDb21wYW55KCkge1xuICAgICAgICBjb25zdCBzZWxlY3RvcnMgPSBbXG4gICAgICAgICAgICAnW2NsYXNzKj1cImNvbXBhbnktbmFtZVwiXScsXG4gICAgICAgICAgICAnW2NsYXNzKj1cImVtcGxveWVyXCJdJyxcbiAgICAgICAgICAgICdbY2xhc3MqPVwib3JnYW5pemF0aW9uXCJdJyxcbiAgICAgICAgICAgIFwiLmNvbXBhbnlcIixcbiAgICAgICAgICAgIFwiLmVtcGxveWVyXCIsXG4gICAgICAgICAgICAnYVtocmVmKj1cImNvbXBhbnlcIl0nLFxuICAgICAgICBdO1xuICAgICAgICBmb3IgKGNvbnN0IHNlbGVjdG9yIG9mIHNlbGVjdG9ycykge1xuICAgICAgICAgICAgY29uc3QgdGV4dCA9IHRoaXMuZXh0cmFjdFRleHRDb250ZW50KHNlbGVjdG9yKTtcbiAgICAgICAgICAgIGlmICh0ZXh0ICYmIHRleHQubGVuZ3RoID4gMSAmJiB0ZXh0Lmxlbmd0aCA8IDEwMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0ZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIFRyeSBtZXRhIHRhZ3NcbiAgICAgICAgY29uc3Qgb2dTaXRlTmFtZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ21ldGFbcHJvcGVydHk9XCJvZzpzaXRlX25hbWVcIl0nKTtcbiAgICAgICAgaWYgKG9nU2l0ZU5hbWUpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBvZ1NpdGVOYW1lLmdldEF0dHJpYnV0ZShcImNvbnRlbnRcIik7XG4gICAgICAgICAgICBpZiAoY29udGVudClcbiAgICAgICAgICAgICAgICByZXR1cm4gY29udGVudDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZmluZERlc2NyaXB0aW9uKCkge1xuICAgICAgICBjb25zdCBzZWxlY3RvcnMgPSBbXG4gICAgICAgICAgICBcIi5qb2ItZGVzY3JpcHRpb25cIixcbiAgICAgICAgICAgIFwiLnBvc3RpbmctZGVzY3JpcHRpb25cIixcbiAgICAgICAgICAgICdbY2xhc3MqPVwiam9iLWRlc2NyaXB0aW9uXCJdJyxcbiAgICAgICAgICAgICdbY2xhc3MqPVwicG9zdGluZy1kZXNjcmlwdGlvblwiXScsXG4gICAgICAgICAgICAnW2NsYXNzKj1cImRlc2NyaXB0aW9uXCJdJyxcbiAgICAgICAgICAgIFwiYXJ0aWNsZVwiLFxuICAgICAgICAgICAgXCIuY29udGVudFwiLFxuICAgICAgICAgICAgXCJtYWluXCIsXG4gICAgICAgIF07XG4gICAgICAgIGZvciAoY29uc3Qgc2VsZWN0b3Igb2Ygc2VsZWN0b3JzKSB7XG4gICAgICAgICAgICBjb25zdCBodG1sID0gdGhpcy5leHRyYWN0SHRtbENvbnRlbnQoc2VsZWN0b3IpO1xuICAgICAgICAgICAgaWYgKGh0bWwgJiYgaHRtbC5sZW5ndGggPiAxMDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jbGVhbkRlc2NyaXB0aW9uKGh0bWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBmaW5kTG9jYXRpb24oKSB7XG4gICAgICAgIGNvbnN0IHNlbGVjdG9ycyA9IFtcbiAgICAgICAgICAgICdbY2xhc3MqPVwibG9jYXRpb25cIl0nLFxuICAgICAgICAgICAgJ1tjbGFzcyo9XCJhZGRyZXNzXCJdJyxcbiAgICAgICAgICAgIFwiLmxvY2F0aW9uXCIsXG4gICAgICAgICAgICBcIi5qb2ItbG9jYXRpb25cIixcbiAgICAgICAgXTtcbiAgICAgICAgZm9yIChjb25zdCBzZWxlY3RvciBvZiBzZWxlY3RvcnMpIHtcbiAgICAgICAgICAgIGNvbnN0IHRleHQgPSB0aGlzLmV4dHJhY3RUZXh0Q29udGVudChzZWxlY3Rvcik7XG4gICAgICAgICAgICBpZiAodGV4dCAmJiB0ZXh0Lmxlbmd0aCA+IDIgJiYgdGV4dC5sZW5ndGggPCAxMDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZGV0ZWN0U291cmNlKCkge1xuICAgICAgICBjb25zdCBob3N0bmFtZSA9IHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAvLyBSZW1vdmUgY29tbW9uIHByZWZpeGVzXG4gICAgICAgIGNvbnN0IGNsZWFuZWQgPSBob3N0bmFtZVxuICAgICAgICAgICAgLnJlcGxhY2UoL153d3dcXC4vLCBcIlwiKVxuICAgICAgICAgICAgLnJlcGxhY2UoL15qb2JzXFwuLywgXCJcIilcbiAgICAgICAgICAgIC5yZXBsYWNlKC9eY2FyZWVyc1xcLi8sIFwiXCIpO1xuICAgICAgICAvLyBFeHRyYWN0IG1haW4gZG9tYWluXG4gICAgICAgIGNvbnN0IHBhcnRzID0gY2xlYW5lZC5zcGxpdChcIi5cIik7XG4gICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPj0gMikge1xuICAgICAgICAgICAgcmV0dXJuIHBhcnRzW3BhcnRzLmxlbmd0aCAtIDJdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjbGVhbmVkO1xuICAgIH1cbn1cbiIsIi8vIFNjcmFwZXIgcmVnaXN0cnkgLSBtYXBzIFVSTHMgdG8gYXBwcm9wcmlhdGUgc2NyYXBlcnNcbmltcG9ydCB7IExpbmtlZEluU2NyYXBlciB9IGZyb20gXCIuL2xpbmtlZGluLXNjcmFwZXJcIjtcbmltcG9ydCB7IFdhdGVybG9vV29ya3NTY3JhcGVyIH0gZnJvbSBcIi4vd2F0ZXJsb28td29ya3Mtc2NyYXBlclwiO1xuaW1wb3J0IHsgSW5kZWVkU2NyYXBlciB9IGZyb20gXCIuL2luZGVlZC1zY3JhcGVyXCI7XG5pbXBvcnQgeyBHcmVlbmhvdXNlU2NyYXBlciB9IGZyb20gXCIuL2dyZWVuaG91c2Utc2NyYXBlclwiO1xuaW1wb3J0IHsgTGV2ZXJTY3JhcGVyIH0gZnJvbSBcIi4vbGV2ZXItc2NyYXBlclwiO1xuaW1wb3J0IHsgR2VuZXJpY1NjcmFwZXIgfSBmcm9tIFwiLi9nZW5lcmljLXNjcmFwZXJcIjtcbi8vIEluaXRpYWxpemUgYWxsIHNjcmFwZXJzXG5jb25zdCBzY3JhcGVycyA9IFtcbiAgICBuZXcgTGlua2VkSW5TY3JhcGVyKCksXG4gICAgbmV3IFdhdGVybG9vV29ya3NTY3JhcGVyKCksXG4gICAgbmV3IEluZGVlZFNjcmFwZXIoKSxcbiAgICBuZXcgR3JlZW5ob3VzZVNjcmFwZXIoKSxcbiAgICBuZXcgTGV2ZXJTY3JhcGVyKCksXG5dO1xuY29uc3QgZ2VuZXJpY1NjcmFwZXIgPSBuZXcgR2VuZXJpY1NjcmFwZXIoKTtcbi8qKlxuICogR2V0IHRoZSBhcHByb3ByaWF0ZSBzY3JhcGVyIGZvciBhIFVSTFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2NyYXBlckZvclVybCh1cmwpIHtcbiAgICBjb25zdCBzY3JhcGVyID0gc2NyYXBlcnMuZmluZCgocykgPT4gcy5jYW5IYW5kbGUodXJsKSk7XG4gICAgcmV0dXJuIHNjcmFwZXIgfHwgZ2VuZXJpY1NjcmFwZXI7XG59XG4vKipcbiAqIENoZWNrIGlmIHdlIGhhdmUgYSBzcGVjaWFsaXplZCBzY3JhcGVyIGZvciB0aGlzIFVSTFxuICovXG5leHBvcnQgZnVuY3Rpb24gaGFzU3BlY2lhbGl6ZWRTY3JhcGVyKHVybCkge1xuICAgIHJldHVybiBzY3JhcGVycy5zb21lKChzKSA9PiBzLmNhbkhhbmRsZSh1cmwpKTtcbn1cbi8qKlxuICogR2V0IGFsbCBhdmFpbGFibGUgc2NyYXBlciBzb3VyY2VzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBdmFpbGFibGVTb3VyY2VzKCkge1xuICAgIHJldHVybiBzY3JhcGVycy5tYXAoKHMpID0+IHMuc291cmNlKTtcbn1cbiIsIi8vIE9yY2hlc3RyYXRvciBmb3IgYnVsayBXYXRlcmxvb1dvcmtzIHNjcmFwaW5nLiBXYWxrcyB0aGUgdmlzaWJsZSBwb3N0aW5nc1xuLy8gdGFibGUsIG9wZW5zIGVhY2ggcm93J3MgZGV0YWlsIHBhbmVsLCBydW5zIHRoZSBzaW5nbGUtcG9zdGluZyBzY3JhcGVyLCBhbmRcbi8vIHlpZWxkcyB0aGUgcmVzdWx0cy4gVHdvIG1vZGVzOlxuLy9cbi8vICAgc2NyYXBlQWxsVmlzaWJsZSgpICAg4oCUIGN1cnJlbnQgcGFnZSBvbmx5XG4vLyAgIHNjcmFwZUFsbFBhZ2luYXRlZCgpIOKAlCBjdXJyZW50IHBhZ2UsIHRoZW4gY2xpY2tzIFwiTmV4dCBwYWdlXCIgYW5kIHJlcGVhdHNcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICB1bnRpbCB0aGVyZSBpcyBubyBuZXh0IHBhZ2UgKG9yIHRoZSBoYXJkIGNhcCBoaXRzKS5cbi8vXG4vLyBMaXZlcyBpbiB0aGUgY29udGVudCBzY3JpcHQuIFBhZ2luYXRpb24gKyByb3cgY2xpY2tzIHJlbHkgb24gc2VsZWN0b3JzXG4vLyBvYnNlcnZlZCBvbiB0aGUgbGl2ZSBtb2Rlcm4gV1cgVUkgaW4gMjAyNi0wNS4gSWYgV1cgcmVkZXNpZ25zIGFnYWluLCB0aGVcbi8vIG9yY2hlc3RyYXRvciB3aWxsIHJldHVybiBbXSBncmFjZWZ1bGx5IChubyBleGNlcHRpb25zIHRocm93biB0byB0aGUgY2FsbGVyKS5cbmltcG9ydCB7IFdhdGVybG9vV29ya3NTY3JhcGVyIH0gZnJvbSBcIi4vd2F0ZXJsb28td29ya3Mtc2NyYXBlclwiO1xuY29uc3QgREVGQVVMVF9USFJPVFRMRV9NUyA9IDUwMDtcbmNvbnN0IFJPV19TRUxFQ1RPUlMgPSBbXG4gICAgXCJ0YWJsZS5kYXRhLXZpZXdlci10YWJsZSB0Ym9keSB0ci50YWJsZV9fcm93LS1ib2R5XCIsXG4gICAgXCJ0YWJsZS5kYXRhLXZpZXdlci10YWJsZSB0Ym9keSB0clwiLFxuICAgIFwidGFibGUgdGJvZHkgdHIudGFibGVfX3Jvdy0tYm9keVwiLFxuICAgIFwidGFibGUgdGJvZHkgdHJcIixcbl07XG5jb25zdCBST1dfVElUTEVfTElOS19TRUxFQ1RPUiA9IFwidGQgYVtocmVmPSdqYXZhc2NyaXB0OnZvaWQoMCknXVwiO1xuY29uc3QgUE9TVElOR19QQU5FTF9TRUxFQ1RPUiA9IFwiLmRhc2hib2FyZC1oZWFkZXJfX3Bvc3RpbmctdGl0bGVcIjtcbmNvbnN0IE5FWFRfUEFHRV9TRUxFQ1RPUiA9ICdhLnBhZ2luYXRpb25fX2xpbmtbYXJpYS1sYWJlbD1cIkdvIHRvIG5leHQgcGFnZVwiXSc7XG5jb25zdCBzbGVlcCA9IChtcykgPT4gbmV3IFByb21pc2UoKHIpID0+IHNldFRpbWVvdXQociwgbXMpKTtcbmZ1bmN0aW9uIGlzSGlkZGVuKGVsKSB7XG4gICAgaWYgKCFlbClcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgcmV0dXJuIGVsLmNsYXNzTGlzdC5jb250YWlucyhcImRpc2FibGVkXCIpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldFdhdGVybG9vV29ya3NSb3dzKCkge1xuICAgIGZvciAoY29uc3Qgc2VsZWN0b3Igb2YgUk9XX1NFTEVDVE9SUykge1xuICAgICAgICBjb25zdCByb3dzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSkuZmlsdGVyKGlzTGlrZWx5UG9zdGluZ1Jvdyk7XG4gICAgICAgIGlmIChyb3dzLmxlbmd0aCA+IDApXG4gICAgICAgICAgICByZXR1cm4gZGVkdXBlRWxlbWVudHMocm93cyk7XG4gICAgfVxuICAgIGNvbnN0IGxpbmtSb3dzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwidGFibGUgYVtocmVmPSdqYXZhc2NyaXB0OnZvaWQoMCknXSwgdGFibGUgYnV0dG9uXCIpKVxuICAgICAgICAubWFwKChlbCkgPT4gZWwuY2xvc2VzdChcInRyXCIpKVxuICAgICAgICAuZmlsdGVyKChyb3cpID0+ICEhcm93KVxuICAgICAgICAuZmlsdGVyKGlzTGlrZWx5UG9zdGluZ1Jvdyk7XG4gICAgcmV0dXJuIGRlZHVwZUVsZW1lbnRzKGxpbmtSb3dzKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXRXYXRlcmxvb1dvcmtzTmV4dFBhZ2VMaW5rKCkge1xuICAgIHJldHVybiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihORVhUX1BBR0VfU0VMRUNUT1IpIHx8XG4gICAgICAgIEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcImEsIGJ1dHRvblwiKSlcbiAgICAgICAgICAgIC5maWx0ZXIoKGVsKSA9PiBlbCBpbnN0YW5jZW9mIEhUTUxBbmNob3JFbGVtZW50KVxuICAgICAgICAgICAgLmZpbmQoKGVsKSA9PiAvbmV4dC9pLnRlc3QoZWwuZ2V0QXR0cmlidXRlKFwiYXJpYS1sYWJlbFwiKSB8fCBlbC50ZXh0Q29udGVudCB8fCBcIlwiKSkgfHxcbiAgICAgICAgbnVsbCk7XG59XG5mdW5jdGlvbiBpc0xpa2VseVBvc3RpbmdSb3cocm93KSB7XG4gICAgY29uc3QgdGV4dCA9IG5vcm1hbGl6ZVRleHQocm93LnRleHRDb250ZW50IHx8IFwiXCIpO1xuICAgIGlmICghdGV4dClcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIGlmICgvXihqb2IgdGl0bGV8b3JnYW5pemF0aW9ufHdvcmsgdGVybXxsb2NhdGlvbnxsZXZlbHxhcHBsaWNhdGlvbnM/KSQvaS50ZXN0KHRleHQpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKHJvdy5xdWVyeVNlbGVjdG9yKFwidGhcIikpXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICBpZiAocm93LnF1ZXJ5U2VsZWN0b3IoUk9XX1RJVExFX0xJTktfU0VMRUNUT1IpKVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICBpZiAocm93LnF1ZXJ5U2VsZWN0b3IoXCJhLCBidXR0b25cIikpXG4gICAgICAgIHJldHVybiB0ZXh0Lmxlbmd0aCA+IDg7XG4gICAgY29uc3QgY2VsbHMgPSByb3cucXVlcnlTZWxlY3RvckFsbChcInRkLCBbcm9sZT0nY2VsbCddXCIpO1xuICAgIHJldHVybiBjZWxscy5sZW5ndGggPj0gMiAmJiB0ZXh0Lmxlbmd0aCA+IDEyO1xufVxuZnVuY3Rpb24gbm9ybWFsaXplVGV4dCh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKC9cXHMrL2csIFwiIFwiKS50cmltKCk7XG59XG5mdW5jdGlvbiBkZWR1cGVFbGVtZW50cyhpdGVtcykge1xuICAgIHJldHVybiBBcnJheS5mcm9tKG5ldyBTZXQoaXRlbXMpKTtcbn1cbmFzeW5jIGZ1bmN0aW9uIHdhaXRGb3IocHJlZGljYXRlLCB0aW1lb3V0TXMsIGludGVydmFsTXMgPSAxMDApIHtcbiAgICBjb25zdCBzdGFydCA9IERhdGUubm93KCk7XG4gICAgd2hpbGUgKERhdGUubm93KCkgLSBzdGFydCA8IHRpbWVvdXRNcykge1xuICAgICAgICBpZiAocHJlZGljYXRlKCkpXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgYXdhaXQgc2xlZXAoaW50ZXJ2YWxNcyk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cbmV4cG9ydCBjbGFzcyBXYXRlcmxvb1dvcmtzT3JjaGVzdHJhdG9yIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5zY3JhcGVyID0gbmV3IFdhdGVybG9vV29ya3NTY3JhcGVyKCk7XG4gICAgfVxuICAgIC8qKiBTY3JhcGUgZXZlcnkgcm93IHZpc2libGUgb24gdGhlIGN1cnJlbnQgcGFnZS4gKi9cbiAgICBhc3luYyBzY3JhcGVBbGxWaXNpYmxlKG9wdHMgPSB7fSkge1xuICAgICAgICBjb25zdCB7IGpvYnMgfSA9IGF3YWl0IHRoaXMuc2NyYXBlQ3VycmVudFBhZ2Uoe1xuICAgICAgICAgICAgc2NyYXBlZFNvRmFyOiAwLFxuICAgICAgICAgICAgcGFnZUluZGV4OiAxLFxuICAgICAgICAgICAgb3B0cyxcbiAgICAgICAgICAgIGVycm9yczogW10sXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gam9icztcbiAgICB9XG4gICAgLyoqIFdhbGsgZXZlcnkgcm93IGFjcm9zcyBldmVyeSBwYWdlIChjYXBwZWQgYnkgbWF4Sm9icyAvIG1heFBhZ2VzKS4gKi9cbiAgICBhc3luYyBzY3JhcGVBbGxQYWdpbmF0ZWQob3B0cyA9IHt9KSB7XG4gICAgICAgIGNvbnN0IG1heEpvYnMgPSBvcHRzLm1heEpvYnMgPz8gMjAwO1xuICAgICAgICBjb25zdCBtYXhQYWdlcyA9IG9wdHMubWF4UGFnZXMgPz8gNTA7XG4gICAgICAgIGNvbnN0IHRocm90dGxlID0gb3B0cy50aHJvdHRsZU1zID8/IERFRkFVTFRfVEhST1RUTEVfTVM7XG4gICAgICAgIGNvbnN0IGFsbEpvYnMgPSBbXTtcbiAgICAgICAgY29uc3QgZXJyb3JzID0gW107XG4gICAgICAgIGxldCBwYWdlSW5kZXggPSAxO1xuICAgICAgICB3aGlsZSAocGFnZUluZGV4IDw9IG1heFBhZ2VzICYmIGFsbEpvYnMubGVuZ3RoIDwgbWF4Sm9icykge1xuICAgICAgICAgICAgY29uc3QgeyBqb2JzLCBzdG9wUmVhc29uIH0gPSBhd2FpdCB0aGlzLnNjcmFwZUN1cnJlbnRQYWdlKHtcbiAgICAgICAgICAgICAgICBzY3JhcGVkU29GYXI6IGFsbEpvYnMubGVuZ3RoLFxuICAgICAgICAgICAgICAgIHBhZ2VJbmRleCxcbiAgICAgICAgICAgICAgICBvcHRzOiB7IC4uLm9wdHMsIG1heEpvYnMgfSxcbiAgICAgICAgICAgICAgICBlcnJvcnMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGFsbEpvYnMucHVzaCguLi5qb2JzKTtcbiAgICAgICAgICAgIGlmIChzdG9wUmVhc29uID09PSBcImNhcC1oaXRcIilcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIC8vIFRyeSB0byBnbyB0byB0aGUgbmV4dCBwYWdlXG4gICAgICAgICAgICBjb25zdCBhZHZhbmNlZCA9IGF3YWl0IHRoaXMuZ29Ub05leHRQYWdlKHRocm90dGxlKTtcbiAgICAgICAgICAgIGlmICghYWR2YW5jZWQpXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBwYWdlSW5kZXgrKztcbiAgICAgICAgfVxuICAgICAgICBvcHRzLm9uUHJvZ3Jlc3M/Lih7XG4gICAgICAgICAgICBzY3JhcGVkQ291bnQ6IGFsbEpvYnMubGVuZ3RoLFxuICAgICAgICAgICAgYXR0ZW1wdGVkQ291bnQ6IGFsbEpvYnMubGVuZ3RoLFxuICAgICAgICAgICAgY3VycmVudFBhZ2U6IHBhZ2VJbmRleCxcbiAgICAgICAgICAgIHRvdGFsUm93c09uUGFnZTogdGhpcy5nZXRSb3dzKCkubGVuZ3RoLFxuICAgICAgICAgICAgZG9uZTogdHJ1ZSxcbiAgICAgICAgICAgIGVycm9ycyxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBhbGxKb2JzO1xuICAgIH1cbiAgICBhc3luYyBzY3JhcGVDdXJyZW50UGFnZShhcmdzKSB7XG4gICAgICAgIGNvbnN0IHsgc2NyYXBlZFNvRmFyLCBwYWdlSW5kZXgsIG9wdHMsIGVycm9ycyB9ID0gYXJncztcbiAgICAgICAgY29uc3QgbWF4Sm9icyA9IG9wdHMubWF4Sm9icyA/PyAyMDA7XG4gICAgICAgIGNvbnN0IHRocm90dGxlID0gb3B0cy50aHJvdHRsZU1zID8/IERFRkFVTFRfVEhST1RUTEVfTVM7XG4gICAgICAgIGNvbnN0IHJvd3MgPSB0aGlzLmdldFJvd3MoKTtcbiAgICAgICAgY29uc3Qgam9icyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJvd3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChzY3JhcGVkU29GYXIgKyBqb2JzLmxlbmd0aCA+PSBtYXhKb2JzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgam9icywgc3RvcFJlYXNvbjogXCJjYXAtaGl0XCIgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFJlLWZldGNoIHRoZSByb3cgZWFjaCBpdGVyYXRpb24g4oCUIHRoZSBET00gbWF5IHJlYnVpbGQgYWZ0ZXIgcGFuZWwgY2xvc2UuXG4gICAgICAgICAgICBjb25zdCBsaXZlUm93cyA9IHRoaXMuZ2V0Um93cygpO1xuICAgICAgICAgICAgY29uc3Qgcm93ID0gbGl2ZVJvd3NbaV07XG4gICAgICAgICAgICBpZiAoIXJvdylcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNvbnN0IHRpdGxlTGluayA9IHJvdy5xdWVyeVNlbGVjdG9yKFJPV19USVRMRV9MSU5LX1NFTEVDVE9SKTtcbiAgICAgICAgICAgIGNvbnN0IGV4cGVjdGVkVGl0bGUgPSB0aXRsZUxpbms/LnRleHRDb250ZW50Py50cmltKCk7XG4gICAgICAgICAgICBpZiAoIXRpdGxlTGluaylcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIC8vIENhcHR1cmUgdGhlIHBhbmVsJ3MgY3VycmVudCB0aXRsZSBzbyB3ZSBjYW4gZGV0ZWN0IHdoZW4gdGhlIG5ld1xuICAgICAgICAgICAgLy8gcG9zdGluZydzIGNvbnRlbnQgaGFzIGFjdHVhbGx5IHJlbmRlcmVkICh0aGUgcGFuZWwgbWF5IGFscmVhZHkgYmVcbiAgICAgICAgICAgIC8vIHZpc2libGUgZnJvbSBhIHByZXZpb3VzIHJvdykuXG4gICAgICAgICAgICBjb25zdCBwcmV2aW91c1BhbmVsVGl0bGUgPSBkb2N1bWVudFxuICAgICAgICAgICAgICAgIC5xdWVyeVNlbGVjdG9yKFBPU1RJTkdfUEFORUxfU0VMRUNUT1IgKyBcIiBoMlwiKVxuICAgICAgICAgICAgICAgID8udGV4dENvbnRlbnQ/LnRyaW0oKTtcbiAgICAgICAgICAgIHRpdGxlTGluay5jbGljaygpO1xuICAgICAgICAgICAgY29uc3Qgb3BlbmVkID0gYXdhaXQgd2FpdEZvcigoKSA9PiAhIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoUE9TVElOR19QQU5FTF9TRUxFQ1RPUiksIDUwMDApO1xuICAgICAgICAgICAgaWYgKCFvcGVuZWQpIHtcbiAgICAgICAgICAgICAgICBlcnJvcnMucHVzaChgcm93ICR7aX0gKCR7ZXhwZWN0ZWRUaXRsZX0pOiBwYW5lbCBkaWQgbm90IG9wZW5gKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFdhaXQgZm9yIHRoZSBwYW5lbCdzIGgyIHRvIHVwZGF0ZSAob3IgYXBwZWFyIGZvciB0aGUgZmlyc3QgdGltZSkgQU5EXG4gICAgICAgICAgICAvLyBmb3IgcG9zdGluZy1zcGVjaWZpYyBmaWVsZCByb3dzIHRvIGJlIHByZXNlbnQuIFdlIGNoZWNrIGZvciBhXG4gICAgICAgICAgICAvLyByZWNvZ25pc2FibGUgbGFiZWwgbGlrZSBcIkpvYiBUaXRsZVwiIOKAlCBzZWFyY2ggZmlsdGVycyBzaGFyZSB0aGUgc2FtZVxuICAgICAgICAgICAgLy8gLnRhZ19fa2V5LXZhbHVlLWxpc3QgY2xhc3Mgc28gYSBub24temVybyBjb3VudCBpcyBub3QgYSByZWxpYWJsZVxuICAgICAgICAgICAgLy8gc2lnbmFsIHRoYXQgdGhlIHBvc3RpbmcgYm9keSBoYXMgcmVuZGVyZWQuXG4gICAgICAgICAgICBjb25zdCBmdWxseVJlbmRlcmVkID0gYXdhaXQgd2FpdEZvcigoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgaDIgPSBkb2N1bWVudFxuICAgICAgICAgICAgICAgICAgICAucXVlcnlTZWxlY3RvcihQT1NUSU5HX1BBTkVMX1NFTEVDVE9SICsgXCIgaDJcIilcbiAgICAgICAgICAgICAgICAgICAgPy50ZXh0Q29udGVudD8udHJpbSgpO1xuICAgICAgICAgICAgICAgIGlmICghaDIpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAocHJldmlvdXNQYW5lbFRpdGxlICYmIGgyID09PSBwcmV2aW91c1BhbmVsVGl0bGUpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICBjb25zdCBsYWJlbHMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudGFnX19rZXktdmFsdWUtbGlzdC5qcy0tcXVlc3Rpb24tLWNvbnRhaW5lciAubGFiZWxcIikpLm1hcCgoZWwpID0+IChlbC50ZXh0Q29udGVudCB8fCBcIlwiKS50cmltKCkudG9Mb3dlckNhc2UoKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxhYmVscy5zb21lKChsKSA9PiBsLnN0YXJ0c1dpdGgoXCJqb2IgdGl0bGVcIikgfHwgbC5zdGFydHNXaXRoKFwib3JnYW5pemF0aW9uXCIpKTtcbiAgICAgICAgICAgIH0sIDgwMDApO1xuICAgICAgICAgICAgaWYgKCFmdWxseVJlbmRlcmVkKSB7XG4gICAgICAgICAgICAgICAgZXJyb3JzLnB1c2goYHJvdyAke2l9ICgke2V4cGVjdGVkVGl0bGV9KTogcGFuZWwgbmV2ZXIgZnVsbHkgcmVuZGVyZWRgKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGF3YWl0IHNsZWVwKHRocm90dGxlKTtcbiAgICAgICAgICAgIGxldCBqb2IgPSBudWxsO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBqb2IgPSBhd2FpdCB0aGlzLnNjcmFwZXIuc2NyYXBlSm9iTGlzdGluZygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKGByb3cgJHtpfSAoJHtleHBlY3RlZFRpdGxlfSk6ICR7U3RyaW5nKGVycikuc2xpY2UoMCwgMjAwKX1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChqb2IpXG4gICAgICAgICAgICAgICAgam9icy5wdXNoKGpvYik7XG4gICAgICAgICAgICBvcHRzLm9uUHJvZ3Jlc3M/Lih7XG4gICAgICAgICAgICAgICAgc2NyYXBlZENvdW50OiBzY3JhcGVkU29GYXIgKyBqb2JzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBhdHRlbXB0ZWRDb3VudDogc2NyYXBlZFNvRmFyICsgaSArIDEsXG4gICAgICAgICAgICAgICAgY3VycmVudFBhZ2U6IHBhZ2VJbmRleCxcbiAgICAgICAgICAgICAgICB0b3RhbFJvd3NPblBhZ2U6IGxpdmVSb3dzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBsYXN0VGl0bGU6IGpvYj8udGl0bGUgfHwgZXhwZWN0ZWRUaXRsZSxcbiAgICAgICAgICAgICAgICBkb25lOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBlcnJvcnMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIE5vIG5lZWQgdG8gZXhwbGljaXRseSBjbG9zZSB0aGUgcGFuZWwg4oCUIGNsaWNraW5nIHRoZSBuZXh0IHJvdyByZXBsYWNlc1xuICAgICAgICAgICAgLy8gaXRzIGNvbnRlbnQuIFdlIG9ubHkgc3RvcCBoZXJlIGlmIHRoaXMgd2FzIHRoZSBsYXN0IHJvdyBvbiB0aGUgcGFnZS5cbiAgICAgICAgICAgIGF3YWl0IHNsZWVwKHRocm90dGxlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBqb2JzIH07XG4gICAgfVxuICAgIGFzeW5jIGdvVG9OZXh0UGFnZSh0aHJvdHRsZU1zKSB7XG4gICAgICAgIGNvbnN0IG5leHRCdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKE5FWFRfUEFHRV9TRUxFQ1RPUik7XG4gICAgICAgIGlmICghbmV4dEJ0biB8fCBpc0hpZGRlbihuZXh0QnRuKSlcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgLy8gQ2FwdHVyZSB0aGUgZmlyc3Qgcm93J3Mgc2lnbmF0dXJlIHRvIGRldGVjdCB3aGVuIHRoZSBwYWdlIGhhcyBjaGFuZ2VkLlxuICAgICAgICBjb25zdCBiZWZvcmVTaWcgPSB0aGlzLmZpcnN0Um93U2lnbmF0dXJlKCk7XG4gICAgICAgIG5leHRCdG4uY2xpY2soKTtcbiAgICAgICAgY29uc3QgY2hhbmdlZCA9IGF3YWl0IHdhaXRGb3IoKCkgPT4gdGhpcy5maXJzdFJvd1NpZ25hdHVyZSgpICE9PSBiZWZvcmVTaWcgJiYgdGhpcy5nZXRSb3dzKCkubGVuZ3RoID4gMCwgODAwMCk7XG4gICAgICAgIGlmICghY2hhbmdlZClcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgYXdhaXQgc2xlZXAodGhyb3R0bGVNcyk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBnZXRSb3dzKCkge1xuICAgICAgICByZXR1cm4gZ2V0V2F0ZXJsb29Xb3Jrc1Jvd3MoKTtcbiAgICB9XG4gICAgZmlyc3RSb3dTaWduYXR1cmUoKSB7XG4gICAgICAgIGNvbnN0IHJvdyA9IHRoaXMuZ2V0Um93cygpWzBdO1xuICAgICAgICByZXR1cm4gcm93Py50ZXh0Q29udGVudD8udHJpbSgpLnNsaWNlKDAsIDEyMCkgfHwgXCJcIjtcbiAgICB9XG59XG4iLCIvLyBQMy8jMzkg4oCUIEJ1bGstc2NyYXBlIG9yY2hlc3RyYXRvciBmb3IgR3JlZW5ob3VzZSBjb21wYW55IGJvYXJkcy5cbi8vXG4vLyBXYWxrcyB0aGUgdmlzaWJsZSBvcGVuaW5ncyB0YWJsZSBvbiBhIGBib2FyZHMuZ3JlZW5ob3VzZS5pby88Y29tcGFueT5gIHBhZ2Vcbi8vIChhbmQgZW1iZWRkZWQgYm9hcmQgaWZyYW1lcyB0aGF0IG1vdW50IHVuZGVyIHRoZSBzYW1lIGhvc3QpLCBhc3NlbWJsZXMgYVxuLy8gYFNjcmFwZWRKb2JgIGZvciBlYWNoIHJvdyB1c2luZyB0aGUgbWV0YSB3ZSBoYXZlIG9uIHRoZSBsaXN0aW5nIHBhZ2UgaXRzZWxmLFxuLy8gYW5kIHlpZWxkcyB0aGUgcmVzdWx0LiBUd28gbW9kZXMgbWlycm9yIHRoZSBXYXRlcmxvb1dvcmtzIG9yY2hlc3RyYXRvcjpcbi8vXG4vLyAgIHNjcmFwZUFsbFZpc2libGUoKSAgIOKAlCBjdXJyZW50IHBhZ2Ugb25seVxuLy8gICBzY3JhcGVBbGxQYWdpbmF0ZWQoKSDigJQgY3VycmVudCBwYWdlLCB0aGVuIGNsaWNrcyBcIk5leHRcIiBpZiBHcmVlbmhvdXNlIGhhc1xuLy8gICAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2luYXRlZCB0aGUgYm9hcmQsIHJlcGVhdGluZyB1bnRpbCBubyBuZXh0IGxpbmsuXG4vL1xuLy8gR3JlZW5ob3VzZSBib2FyZHMgYXJlIHB1YmxpYywgaW5kZXhlZCBieSBzZWFyY2ggZW5naW5lcywgYW5kIGludGVudGlvbmFsbHlcbi8vIHN5bmRpY2F0ZWQgYnkgdGhlIGhpcmluZyBjb21wYW55IOKAlCBubyBhbnRpLXNjcmFwZSBwb3N0dXJlLiBUaGlzIG9yY2hlc3RyYXRvclxuLy8gaXMgcGFydCBvZiB0aGUgcG9wdXAtZHJpdmVuIFVYIChwb3B1cCDihpIgQnVsa1NvdXJjZUNhcmQg4oaSIGNvbnRlbnQgc2NyaXB0XG4vLyBvcmNoZXN0cmF0b3IpIGFuZCBuZXZlciB0b3VjaGVzIHRoZSBhcHBseSBmbG93LlxuLy9cbi8vIFNlbGVjdG9ycyBvYnNlcnZlZCBvbiBgYm9hcmRzLmdyZWVuaG91c2UuaW8vPGNvbXBhbnk+YCAoMjAyNi0wNSkuIE1vc3Rcbi8vIEdyZWVuaG91c2UgYm9hcmRzIHN0aWxsIHVzZSB0aGUgY2xhc3NpYyBtYXJrdXA6XG4vLyAgIC0gYGRpdi5vcGVuaW5nYCBwZXIgcG9zdGluZyAobmV3ZXIgYm9hcmRzOiBgLmpvYi1wb3N0YClcbi8vICAgLSBgYWAgaW5zaWRlIGBkaXYub3BlbmluZ2Agd2hvc2UgaHJlZiBwb2ludHMgYXQgYC88Y29tcGFueT4vam9icy88aWQ+YFxuLy8gICAtIGAubG9jYXRpb25gIHNpYmxpbmcgZm9yIHRoZSBsb2NhdGlvblxuLy8gICAtIGRlcGFydG1lbnQgaGVhZGluZ3M6IGBzZWN0aW9uLmxldmVsLTAgPiBoM2Bcbi8vICAgLSBcIlNob3cgbW9yZVwiIC8gcGFnaW5hdGVkIGxvYWQtbW9yZTogcmFyZSBmb3IgR3JlZW5ob3VzZSwgYnV0IHdlIGxvb2sgZm9yXG4vLyAgICAgYGFbcmVsPVwibmV4dFwiXWAgYW5kIGEgYGJ1dHRvblthcmlhLWxhYmVsPVwiTmV4dFwiIGldYCBhcyBkZWZlbnNpdmUgZmFsbGJhY2tzLlxuY29uc3QgREVGQVVMVF9USFJPVFRMRV9NUyA9IDUwO1xuY29uc3QgTUFYX0pPQlNfREVGQVVMVCA9IDIwMDtcbmNvbnN0IE1BWF9QQUdFU19ERUZBVUxUID0gNTA7XG4vLyBTZWxlY3RvcnMuIE11bHRpcGxlIHZhcmlhbnRzIGJlY2F1c2UgR3JlZW5ob3VzZSBib2FyZHMgZHJpZnQgc2xvd2x5IOKAlCBzb21lXG4vLyBvbGRlciBib2FyZHMgdXNlIGAub3BlbmluZ2AsIG5ld2VyIG9uZXMgdXNlIGAuam9iLXBvc3RgLCBhbmQgdGhlXG4vLyBgW2RhdGEtbWFwcGVkPVwidHJ1ZVwiXWAgYXR0cmlidXRlIGFwcGVhcnMgb24gYSBkaWZmZXJlbnQgZ2VuZXJhdGlvbiBhZ2Fpbi5cbmNvbnN0IFJPV19TRUxFQ1RPUlMgPSBbXG4gICAgXCJkaXYub3BlbmluZ1wiLFxuICAgIFwiLmpvYi1wb3N0XCIsXG4gICAgJ1tkYXRhLW1hcHBlZD1cInRydWVcIl0nLFxuICAgIFwic2VjdGlvbi5sZXZlbC0wIGRpdi5vcGVuaW5nXCIsXG5dO1xuY29uc3QgTkVYVF9QQUdFX1NFTEVDVE9SUyA9IFtcbiAgICAnYVtyZWw9XCJuZXh0XCJdJyxcbiAgICAnYVthcmlhLWxhYmVsPVwiTmV4dCBwYWdlXCIgaV0nLFxuICAgICdidXR0b25bYXJpYS1sYWJlbD1cIk5leHRcIiBpXScsXG4gICAgXCIucGFnaW5hdGlvbiAubmV4dCBhXCIsXG5dO1xuY29uc3Qgc2xlZXAgPSAobXMpID0+IG5ldyBQcm9taXNlKChyKSA9PiBzZXRUaW1lb3V0KHIsIG1zKSk7XG5hc3luYyBmdW5jdGlvbiB3YWl0Rm9yKHByZWRpY2F0ZSwgdGltZW91dE1zLCBpbnRlcnZhbE1zID0gMTAwKSB7XG4gICAgY29uc3Qgc3RhcnQgPSBEYXRlLm5vdygpO1xuICAgIHdoaWxlIChEYXRlLm5vdygpIC0gc3RhcnQgPCB0aW1lb3V0TXMpIHtcbiAgICAgICAgaWYgKHByZWRpY2F0ZSgpKVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIGF3YWl0IHNsZWVwKGludGVydmFsTXMpO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5leHBvcnQgY2xhc3MgR3JlZW5ob3VzZU9yY2hlc3RyYXRvciB7XG4gICAgLyoqIFF1aWNrIGRldGVjdGlvbiBoZWxwZXIgdXNlZCBieSBjb250ZW50LXNjcmlwdCBlbnRyeS4gKi9cbiAgICBzdGF0aWMgY2FuSGFuZGxlKHVybCkge1xuICAgICAgICByZXR1cm4gKC9ib2FyZHNcXC5ncmVlbmhvdXNlXFwuaW9cXC8vLnRlc3QodXJsKSB8fFxuICAgICAgICAgICAgL1tcXHctXStcXC5ncmVlbmhvdXNlXFwuaW9cXC8vLnRlc3QodXJsKSB8fFxuICAgICAgICAgICAgL2dyZWVuaG91c2VcXC5pb1xcL2VtYmVkXFwvam9iX2JvYXJkLy50ZXN0KHVybCkpO1xuICAgIH1cbiAgICAvKiogU2NyYXBlIGV2ZXJ5IHJvdyB2aXNpYmxlIG9uIHRoZSBjdXJyZW50IHBhZ2UuICovXG4gICAgYXN5bmMgc2NyYXBlQWxsVmlzaWJsZShvcHRzID0ge30pIHtcbiAgICAgICAgY29uc3QgeyBqb2JzIH0gPSBhd2FpdCB0aGlzLnNjcmFwZUN1cnJlbnRQYWdlKHtcbiAgICAgICAgICAgIHNjcmFwZWRTb0ZhcjogMCxcbiAgICAgICAgICAgIHBhZ2VJbmRleDogMSxcbiAgICAgICAgICAgIG9wdHMsXG4gICAgICAgICAgICBlcnJvcnM6IFtdLFxuICAgICAgICAgICAgc2VlbktleXM6IG5ldyBTZXQoKSxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBqb2JzO1xuICAgIH1cbiAgICAvKiogV2FsayBldmVyeSByb3cgb24gZXZlcnkgcGFnZSAoY2FwcGVkIGJ5IG1heEpvYnMgLyBtYXhQYWdlcykuICovXG4gICAgYXN5bmMgc2NyYXBlQWxsUGFnaW5hdGVkKG9wdHMgPSB7fSkge1xuICAgICAgICBjb25zdCBtYXhKb2JzID0gb3B0cy5tYXhKb2JzID8/IE1BWF9KT0JTX0RFRkFVTFQ7XG4gICAgICAgIGNvbnN0IG1heFBhZ2VzID0gb3B0cy5tYXhQYWdlcyA/PyBNQVhfUEFHRVNfREVGQVVMVDtcbiAgICAgICAgY29uc3QgdGhyb3R0bGUgPSBvcHRzLnRocm90dGxlTXMgPz8gREVGQVVMVF9USFJPVFRMRV9NUztcbiAgICAgICAgY29uc3QgYWxsSm9icyA9IFtdO1xuICAgICAgICBjb25zdCBlcnJvcnMgPSBbXTtcbiAgICAgICAgY29uc3Qgc2VlbktleXMgPSBuZXcgU2V0KCk7XG4gICAgICAgIGxldCBwYWdlSW5kZXggPSAxO1xuICAgICAgICB3aGlsZSAocGFnZUluZGV4IDw9IG1heFBhZ2VzICYmIGFsbEpvYnMubGVuZ3RoIDwgbWF4Sm9icykge1xuICAgICAgICAgICAgY29uc3QgeyBqb2JzLCBzdG9wUmVhc29uIH0gPSBhd2FpdCB0aGlzLnNjcmFwZUN1cnJlbnRQYWdlKHtcbiAgICAgICAgICAgICAgICBzY3JhcGVkU29GYXI6IGFsbEpvYnMubGVuZ3RoLFxuICAgICAgICAgICAgICAgIHBhZ2VJbmRleCxcbiAgICAgICAgICAgICAgICBvcHRzOiB7IC4uLm9wdHMsIG1heEpvYnMgfSxcbiAgICAgICAgICAgICAgICBlcnJvcnMsXG4gICAgICAgICAgICAgICAgc2VlbktleXMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGFsbEpvYnMucHVzaCguLi5qb2JzKTtcbiAgICAgICAgICAgIGlmIChzdG9wUmVhc29uID09PSBcImNhcC1oaXRcIilcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNvbnN0IGFkdmFuY2VkID0gYXdhaXQgdGhpcy5nb1RvTmV4dFBhZ2UodGhyb3R0bGUpO1xuICAgICAgICAgICAgaWYgKCFhZHZhbmNlZClcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIHBhZ2VJbmRleCsrO1xuICAgICAgICB9XG4gICAgICAgIG9wdHMub25Qcm9ncmVzcz8uKHtcbiAgICAgICAgICAgIHNjcmFwZWRDb3VudDogYWxsSm9icy5sZW5ndGgsXG4gICAgICAgICAgICBhdHRlbXB0ZWRDb3VudDogYWxsSm9icy5sZW5ndGgsXG4gICAgICAgICAgICBjdXJyZW50UGFnZTogcGFnZUluZGV4LFxuICAgICAgICAgICAgdG90YWxSb3dzT25QYWdlOiB0aGlzLmdldFJvd3MoKS5sZW5ndGgsXG4gICAgICAgICAgICBkb25lOiB0cnVlLFxuICAgICAgICAgICAgZXJyb3JzLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGFsbEpvYnM7XG4gICAgfVxuICAgIGFzeW5jIHNjcmFwZUN1cnJlbnRQYWdlKGFyZ3MpIHtcbiAgICAgICAgY29uc3QgeyBzY3JhcGVkU29GYXIsIHBhZ2VJbmRleCwgb3B0cywgZXJyb3JzLCBzZWVuS2V5cyB9ID0gYXJncztcbiAgICAgICAgY29uc3QgbWF4Sm9icyA9IG9wdHMubWF4Sm9icyA/PyBNQVhfSk9CU19ERUZBVUxUO1xuICAgICAgICBjb25zdCB0aHJvdHRsZSA9IG9wdHMudGhyb3R0bGVNcyA/PyBERUZBVUxUX1RIUk9UVExFX01TO1xuICAgICAgICBjb25zdCByb3dzID0gdGhpcy5nZXRSb3dzKCk7XG4gICAgICAgIGNvbnN0IGpvYnMgPSBbXTtcbiAgICAgICAgY29uc3QgY29tcGFueSA9IHRoaXMuZXh0cmFjdENvbXBhbnkoKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByb3dzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoc2NyYXBlZFNvRmFyICsgam9icy5sZW5ndGggPj0gbWF4Sm9icykge1xuICAgICAgICAgICAgICAgIHJldHVybiB7IGpvYnMsIHN0b3BSZWFzb246IFwiY2FwLWhpdFwiIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCByb3cgPSByb3dzW2ldO1xuICAgICAgICAgICAgbGV0IGpvYiA9IG51bGw7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGpvYiA9IHRoaXMuc2NyYXBlUm93KHJvdywgY29tcGFueSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgLy8gUGVyLXJvdyBlcnJvciBpc29sYXRpb24g4oCUIG5ldmVyIGFib3J0IHRoZSB3aG9sZSBiYXRjaC5cbiAgICAgICAgICAgICAgICBlcnJvcnMucHVzaChgcm93ICR7aX06ICR7U3RyaW5nKGVycikuc2xpY2UoMCwgMjAwKX1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChqb2IpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBkZWR1cGVLZXkgPSB0aGlzLmRlZHVwZUtleShqb2IpO1xuICAgICAgICAgICAgICAgIGlmICghc2VlbktleXMuaGFzKGRlZHVwZUtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VlbktleXMuYWRkKGRlZHVwZUtleSk7XG4gICAgICAgICAgICAgICAgICAgIGpvYnMucHVzaChqb2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9wdHMub25Qcm9ncmVzcz8uKHtcbiAgICAgICAgICAgICAgICBzY3JhcGVkQ291bnQ6IHNjcmFwZWRTb0ZhciArIGpvYnMubGVuZ3RoLFxuICAgICAgICAgICAgICAgIGF0dGVtcHRlZENvdW50OiBzY3JhcGVkU29GYXIgKyBpICsgMSxcbiAgICAgICAgICAgICAgICBjdXJyZW50UGFnZTogcGFnZUluZGV4LFxuICAgICAgICAgICAgICAgIHRvdGFsUm93c09uUGFnZTogcm93cy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgbGFzdFRpdGxlOiBqb2I/LnRpdGxlLFxuICAgICAgICAgICAgICAgIGRvbmU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVycm9ycyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHRocm90dGxlID4gMClcbiAgICAgICAgICAgICAgICBhd2FpdCBzbGVlcCh0aHJvdHRsZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgam9icyB9O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBCdWlsZCBhIFNjcmFwZWRKb2IgZnJvbSBhIHNpbmdsZSBHcmVlbmhvdXNlIGxpc3Rpbmcgcm93LiBXZSByZWx5IG9uIHRoZVxuICAgICAqIGxpc3RpbmctcGFnZSBtZXRhZGF0YSBvbmx5ICh0aXRsZSwgbG9jYXRpb24sIFVSTCwgc291cmNlSm9iSWQpIOKAlCBmZXRjaGluZ1xuICAgICAqIHRoZSBmdWxsIGRlc2NyaXB0aW9uIHBlciByb3cgd291bGQgcmVxdWlyZSB2aXNpdGluZyBlYWNoIHBvc3RpbmcgVVJMLFxuICAgICAqIHdoaWNoIGlzIG91dCBvZiBzY29wZSBmb3IgdGhlIGJ1bGsgb3JjaGVzdHJhdG9yICgjMzkpLiBUaGUgZGVzY3JpcHRpb25cbiAgICAgKiBpcyBsZWZ0IGVtcHR5IHNvIHRoZSBpbXBvcnQgZW5kcG9pbnQgYmFja2ZpbGxzL21hcmtzIGl0IGFzIG5lZWRpbmcgcmV2aWV3LlxuICAgICAqL1xuICAgIHNjcmFwZVJvdyhyb3csIGNvbXBhbnkpIHtcbiAgICAgICAgY29uc3QgdGl0bGVFbCA9IHJvdy5xdWVyeVNlbGVjdG9yKFwiYS5vcGVuaW5nLXRpdGxlLCAub3BlbmluZy10aXRsZSBhLCBhXCIpO1xuICAgICAgICBjb25zdCB0aXRsZSA9IHRpdGxlRWw/LnRleHRDb250ZW50Py50cmltKCkgfHxcbiAgICAgICAgICAgIHJvdy5xdWVyeVNlbGVjdG9yKFwiLmpvYi10aXRsZVwiKT8udGV4dENvbnRlbnQ/LnRyaW0oKSB8fFxuICAgICAgICAgICAgXCJcIjtcbiAgICAgICAgaWYgKCF0aXRsZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwibWlzc2luZyB0aXRsZVwiKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBQcmVmZXIgdGhlIGNsb3Nlc3QgYW5jaG9yIHdpdGggYW4gaHJlZiDigJQgR3JlZW5ob3VzZSBtYXJrdXAgb2Z0ZW4gd3JhcHNcbiAgICAgICAgLy8gdGhlIGVudGlyZSByb3cgaW4gYW4gYW5jaG9yLlxuICAgICAgICBjb25zdCBhbmNob3IgPSB0aXRsZUVsIHx8XG4gICAgICAgICAgICByb3cucXVlcnlTZWxlY3RvcignYVtocmVmKj1cIi9qb2JzL1wiXScpIHx8XG4gICAgICAgICAgICAocm93Lm1hdGNoZXMoXCJhXCIpID8gcm93IDogbnVsbCk7XG4gICAgICAgIGNvbnN0IGhyZWYgPSBhbmNob3I/LmdldEF0dHJpYnV0ZShcImhyZWZcIikgfHwgXCJcIjtcbiAgICAgICAgY29uc3QgdXJsID0gaHJlZiA/IG5ldyBVUkwoaHJlZiwgd2luZG93LmxvY2F0aW9uLmhyZWYpLnRvU3RyaW5nKCkgOiBcIlwiO1xuICAgICAgICBjb25zdCBsb2NhdGlvbkVsID0gcm93LnF1ZXJ5U2VsZWN0b3IoXCIubG9jYXRpb24sIC5qb2ItbG9jYXRpb24sIC5vcGVuaW5nLWxvY2F0aW9uXCIpO1xuICAgICAgICBjb25zdCBsb2NhdGlvbiA9IGxvY2F0aW9uRWw/LnRleHRDb250ZW50Py50cmltKCkgfHwgdW5kZWZpbmVkO1xuICAgICAgICBjb25zdCBzb3VyY2VKb2JJZCA9IHRoaXMuZXh0cmFjdEpvYklkRnJvbVVybCh1cmwpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgICBjb21wYW55LFxuICAgICAgICAgICAgbG9jYXRpb24sXG4gICAgICAgICAgICAvLyBCdWxrIG1vZGU6IGxpc3RpbmctcGFnZSBzbmlwcGV0cyBhcmUgc2hvcnQgYW5kIGluY29uc2lzdGVudCBhY3Jvc3NcbiAgICAgICAgICAgIC8vIEdyZWVuaG91c2UgYm9hcmRzLCBzbyBsZWF2ZSBkZXNjcmlwdGlvbiBlbXB0eSByYXRoZXIgdGhhbiBzaGlwIGp1bmsuXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJcIixcbiAgICAgICAgICAgIHJlcXVpcmVtZW50czogW10sXG4gICAgICAgICAgICB1cmw6IHVybCB8fCB3aW5kb3cubG9jYXRpb24uaHJlZixcbiAgICAgICAgICAgIHNvdXJjZTogXCJncmVlbmhvdXNlXCIsXG4gICAgICAgICAgICBzb3VyY2VKb2JJZCxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRXh0cmFjdCB0aGUgaGlyaW5nIGNvbXBhbnkuIEdyZWVuaG91c2UgYm9hcmRzIHVzZSBvbmUgb2Y6XG4gICAgICogICAtIDxtZXRhIHByb3BlcnR5PVwib2c6c2l0ZV9uYW1lXCI+ICDihpAgbW9zdCByZWxpYWJsZVxuICAgICAqICAgLSBgI2hlYWRlciAuY29tcGFueS1uYW1lYFxuICAgICAqICAgLSBmaXJzdCBzZWdtZW50IG9mIHRoZSBVUkwgcGF0aDogYGJvYXJkcy5ncmVlbmhvdXNlLmlvLzxjb21wYW55Pi8uLi5gXG4gICAgICovXG4gICAgZXh0cmFjdENvbXBhbnkoKSB7XG4gICAgICAgIGNvbnN0IG9nU2l0ZU5hbWUgPSBkb2N1bWVudFxuICAgICAgICAgICAgLnF1ZXJ5U2VsZWN0b3IoJ21ldGFbcHJvcGVydHk9XCJvZzpzaXRlX25hbWVcIl0nKVxuICAgICAgICAgICAgPy5nZXRBdHRyaWJ1dGUoXCJjb250ZW50XCIpO1xuICAgICAgICBpZiAob2dTaXRlTmFtZSlcbiAgICAgICAgICAgIHJldHVybiBvZ1NpdGVOYW1lLnRyaW0oKTtcbiAgICAgICAgY29uc3QgaGVhZGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNoZWFkZXIgLmNvbXBhbnktbmFtZSwgLmNvbXBhbnktbmFtZVwiKTtcbiAgICAgICAgY29uc3QgaGVhZGVyVGV4dCA9IGhlYWRlcj8udGV4dENvbnRlbnQ/LnRyaW0oKTtcbiAgICAgICAgaWYgKGhlYWRlclRleHQpXG4gICAgICAgICAgICByZXR1cm4gaGVhZGVyVGV4dDtcbiAgICAgICAgY29uc3QgbWF0Y2ggPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUubWF0Y2goL15cXC8oW14vXSspLyk7XG4gICAgICAgIGlmIChtYXRjaCAmJiBtYXRjaFsxXSAmJiBtYXRjaFsxXSAhPT0gXCJlbWJlZFwiICYmIG1hdGNoWzFdICE9PSBcImpvYnNcIikge1xuICAgICAgICAgICAgcmV0dXJuIG1hdGNoWzFdXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoLy0vZywgXCIgXCIpXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcYlxcdy9nLCAoYykgPT4gYy50b1VwcGVyQ2FzZSgpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gXCJVbmtub3duIEVtcGxveWVyXCI7XG4gICAgfVxuICAgIGV4dHJhY3RKb2JJZEZyb21VcmwodXJsKSB7XG4gICAgICAgIGNvbnN0IG1hdGNoID0gdXJsLm1hdGNoKC9cXC9qb2JzXFwvKFxcZCspLyk7XG4gICAgICAgIHJldHVybiBtYXRjaD8uWzFdO1xuICAgIH1cbiAgICBkZWR1cGVLZXkoam9iKSB7XG4gICAgICAgIGlmIChqb2Iuc291cmNlSm9iSWQpXG4gICAgICAgICAgICByZXR1cm4gYGlkOiR7am9iLnNvdXJjZUpvYklkfWA7XG4gICAgICAgIGlmIChqb2IudXJsKVxuICAgICAgICAgICAgcmV0dXJuIGB1cmw6JHtqb2IudXJsfWA7XG4gICAgICAgIHJldHVybiBgdGl0bGU6JHtqb2IudGl0bGV9fCR7am9iLmNvbXBhbnl9fCR7am9iLmxvY2F0aW9uID8/IFwiXCJ9YDtcbiAgICB9XG4gICAgZ2V0Um93cygpIHtcbiAgICAgICAgY29uc3Qgc2VlbiA9IG5ldyBTZXQoKTtcbiAgICAgICAgY29uc3Qgb3V0ID0gW107XG4gICAgICAgIGZvciAoY29uc3Qgc2VsZWN0b3Igb2YgUk9XX1NFTEVDVE9SUykge1xuICAgICAgICAgICAgZm9yIChjb25zdCBlbCBvZiBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpKSkge1xuICAgICAgICAgICAgICAgIGlmICghc2Vlbi5oYXMoZWwpKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlZW4uYWRkKGVsKTtcbiAgICAgICAgICAgICAgICAgICAgb3V0LnB1c2goZWwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChvdXQubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIC8vIFRha2UgdGhlIGZpcnN0IHNlbGVjdG9yIHRoYXQgeWllbGRlZCBtYXRjaGVzIOKAlCBrZWVwcyByb3cgb3JkZXIgc3RhYmxlLlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvdXQ7XG4gICAgfVxuICAgIGFzeW5jIGdvVG9OZXh0UGFnZSh0aHJvdHRsZU1zKSB7XG4gICAgICAgIGxldCBuZXh0QnRuID0gbnVsbDtcbiAgICAgICAgZm9yIChjb25zdCBzZWxlY3RvciBvZiBORVhUX1BBR0VfU0VMRUNUT1JTKSB7XG4gICAgICAgICAgICBuZXh0QnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgICAgICAgICBpZiAobmV4dEJ0bilcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBpZiAoIW5leHRCdG4pXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmIChuZXh0QnRuLmNsYXNzTGlzdC5jb250YWlucyhcImRpc2FibGVkXCIpIHx8XG4gICAgICAgICAgICBuZXh0QnRuLmdldEF0dHJpYnV0ZShcImFyaWEtZGlzYWJsZWRcIikgPT09IFwidHJ1ZVwiKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYmVmb3JlU2lnID0gdGhpcy5maXJzdFJvd1NpZ25hdHVyZSgpO1xuICAgICAgICBuZXh0QnRuLmNsaWNrKCk7XG4gICAgICAgIGNvbnN0IGNoYW5nZWQgPSBhd2FpdCB3YWl0Rm9yKCgpID0+IHRoaXMuZmlyc3RSb3dTaWduYXR1cmUoKSAhPT0gYmVmb3JlU2lnICYmIHRoaXMuZ2V0Um93cygpLmxlbmd0aCA+IDAsIDgwMDApO1xuICAgICAgICBpZiAoIWNoYW5nZWQpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmICh0aHJvdHRsZU1zID4gMClcbiAgICAgICAgICAgIGF3YWl0IHNsZWVwKHRocm90dGxlTXMpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgZmlyc3RSb3dTaWduYXR1cmUoKSB7XG4gICAgICAgIGNvbnN0IHJvdyA9IHRoaXMuZ2V0Um93cygpWzBdO1xuICAgICAgICByZXR1cm4gcm93Py50ZXh0Q29udGVudD8udHJpbSgpLnNsaWNlKDAsIDEyMCkgfHwgXCJcIjtcbiAgICB9XG59XG4iLCIvLyBQMy8jMzkg4oCUIEJ1bGstc2NyYXBlIG9yY2hlc3RyYXRvciBmb3IgTGV2ZXIgY29tcGFueSBwYWdlcy5cbi8vXG4vLyBXYWxrcyB0aGUgdmlzaWJsZSBwb3N0aW5ncyBvbiBhIGBqb2JzLmxldmVyLmNvLzxjb21wYW55PmAgcGFnZSAob3Igb25lIG9mXG4vLyB0aGUgb2xkZXIgYDxjb21wYW55Pi5sZXZlci5jby88cm9sZT5gIHZhcmlhbnRzKSwgYXNzZW1ibGVzIGEgYFNjcmFwZWRKb2JgXG4vLyBmcm9tIGVhY2ggcm93J3MgbGlzdGluZy1wYWdlIG1ldGFkYXRhLCBhbmQgeWllbGRzIHJlc3VsdHMuIFR3byBtb2RlcyBtaXJyb3Jcbi8vIHRoZSBXYXRlcmxvb1dvcmtzIG9yY2hlc3RyYXRvcjpcbi8vXG4vLyAgIHNjcmFwZUFsbFZpc2libGUoKSAgIOKAlCBjdXJyZW50IHZpc2libGUgcG9zdGluZ3Mgb25seVxuLy8gICBzY3JhcGVBbGxQYWdpbmF0ZWQoKSDigJQgTGV2ZXIgYm9hcmRzIGFyZSB0eXBpY2FsbHkgc2luZ2xlLXBhZ2UsIGJ1dCB3ZSBzdGlsbFxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgIHByb2JlIGZvciBcIlNob3cgbW9yZVwiIC8gTmV4dC1zdHlsZSBjb250cm9scyBzbyB0aGVcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cmFjdCBtYXRjaGVzIHRoZSBwb3B1cCBleHBlY3RhdGlvbi5cbi8vXG4vLyBMZXZlciBib2FyZHMgYXJlIHB1YmxpYywgaW50ZW50aW9uYWxseSBzeW5kaWNhdGVkIGJ5IHRoZSBoaXJpbmcgY29tcGFueSwgYW5kXG4vLyBoYXZlIG5vIGFudGktc2NyYXBlIHBvc3R1cmUuIFRoaXMgb3JjaGVzdHJhdG9yIG5ldmVyIHZpc2l0cyB0aGUgYXBwbHkgZmxvdy5cbi8vXG4vLyBTZWxlY3RvcnMgb2JzZXJ2ZWQgb24gYGpvYnMubGV2ZXIuY28vPGNvbXBhbnk+YCAoMjAyNi0wNSk6XG4vLyAgIC0gYC5wb3N0aW5nYCBwZXIgb3BlbmluZyAoY2Fub25pY2FsKVxuLy8gICAtIHRpdGxlOiBgLnBvc3RpbmctdGl0bGUgaDVgIG9yIGBbZGF0YS1xYT1cInBvc3RpbmctbmFtZVwiXWBcbi8vICAgLSBsb2NhdGlvbjogYC5wb3N0aW5nLWNhdGVnb3JpZXMgLmxvY2F0aW9uYCBvciBgLnNvcnQtYnktbG9jYXRpb25gXG4vLyAgIC0gY29tbWl0bWVudCAvIHR5cGU6IGAucG9zdGluZy1jYXRlZ29yaWVzIC5jb21taXRtZW50YFxuLy8gICAtIHBvc3RpbmcgVVJMOiBhbmNob3Igd3JhcHBpbmcgdGhlIHBvc3RpbmcgYmxvY2tcbi8vICAgLSBjb21wYW55OiBsb2dvIGFsdCBvciBmaXJzdCBwYXRoIHNlZ21lbnRcbmNvbnN0IERFRkFVTFRfVEhST1RUTEVfTVMgPSA1MDtcbmNvbnN0IE1BWF9KT0JTX0RFRkFVTFQgPSAyMDA7XG5jb25zdCBNQVhfUEFHRVNfREVGQVVMVCA9IDUwO1xuY29uc3QgUk9XX1NFTEVDVE9SUyA9IFtcIi5wb3N0aW5nXCIsICdbZGF0YS1xYT1cInBvc3RpbmctbmFtZVwiXSddO1xuY29uc3QgTkVYVF9QQUdFX1NFTEVDVE9SUyA9IFtcbiAgICAnYVtyZWw9XCJuZXh0XCJdJyxcbiAgICAnYnV0dG9uW2FyaWEtbGFiZWw9XCJOZXh0XCIgaV0nLFxuICAgICdidXR0b25bYXJpYS1sYWJlbD1cIkxvYWQgbW9yZVwiIGldJyxcbiAgICBcIi5wYWdpbmF0aW9uIC5uZXh0IGFcIixcbl07XG5jb25zdCBzbGVlcCA9IChtcykgPT4gbmV3IFByb21pc2UoKHIpID0+IHNldFRpbWVvdXQociwgbXMpKTtcbmFzeW5jIGZ1bmN0aW9uIHdhaXRGb3IocHJlZGljYXRlLCB0aW1lb3V0TXMsIGludGVydmFsTXMgPSAxMDApIHtcbiAgICBjb25zdCBzdGFydCA9IERhdGUubm93KCk7XG4gICAgd2hpbGUgKERhdGUubm93KCkgLSBzdGFydCA8IHRpbWVvdXRNcykge1xuICAgICAgICBpZiAocHJlZGljYXRlKCkpXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgYXdhaXQgc2xlZXAoaW50ZXJ2YWxNcyk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cbmV4cG9ydCBjbGFzcyBMZXZlck9yY2hlc3RyYXRvciB7XG4gICAgc3RhdGljIGNhbkhhbmRsZSh1cmwpIHtcbiAgICAgICAgcmV0dXJuIC9qb2JzXFwubGV2ZXJcXC5jb1xcLy8udGVzdCh1cmwpIHx8IC9bXFx3LV0rXFwubGV2ZXJcXC5jb1xcLy8udGVzdCh1cmwpO1xuICAgIH1cbiAgICBhc3luYyBzY3JhcGVBbGxWaXNpYmxlKG9wdHMgPSB7fSkge1xuICAgICAgICBjb25zdCB7IGpvYnMgfSA9IGF3YWl0IHRoaXMuc2NyYXBlQ3VycmVudFBhZ2Uoe1xuICAgICAgICAgICAgc2NyYXBlZFNvRmFyOiAwLFxuICAgICAgICAgICAgcGFnZUluZGV4OiAxLFxuICAgICAgICAgICAgb3B0cyxcbiAgICAgICAgICAgIGVycm9yczogW10sXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gam9icztcbiAgICB9XG4gICAgYXN5bmMgc2NyYXBlQWxsUGFnaW5hdGVkKG9wdHMgPSB7fSkge1xuICAgICAgICBjb25zdCBtYXhKb2JzID0gb3B0cy5tYXhKb2JzID8/IE1BWF9KT0JTX0RFRkFVTFQ7XG4gICAgICAgIGNvbnN0IG1heFBhZ2VzID0gb3B0cy5tYXhQYWdlcyA/PyBNQVhfUEFHRVNfREVGQVVMVDtcbiAgICAgICAgY29uc3QgdGhyb3R0bGUgPSBvcHRzLnRocm90dGxlTXMgPz8gREVGQVVMVF9USFJPVFRMRV9NUztcbiAgICAgICAgY29uc3QgYWxsSm9icyA9IFtdO1xuICAgICAgICBjb25zdCBlcnJvcnMgPSBbXTtcbiAgICAgICAgbGV0IHBhZ2VJbmRleCA9IDE7XG4gICAgICAgIHdoaWxlIChwYWdlSW5kZXggPD0gbWF4UGFnZXMgJiYgYWxsSm9icy5sZW5ndGggPCBtYXhKb2JzKSB7XG4gICAgICAgICAgICBjb25zdCB7IGpvYnMsIHN0b3BSZWFzb24gfSA9IGF3YWl0IHRoaXMuc2NyYXBlQ3VycmVudFBhZ2Uoe1xuICAgICAgICAgICAgICAgIHNjcmFwZWRTb0ZhcjogYWxsSm9icy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgcGFnZUluZGV4LFxuICAgICAgICAgICAgICAgIG9wdHM6IHsgLi4ub3B0cywgbWF4Sm9icyB9LFxuICAgICAgICAgICAgICAgIGVycm9ycyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYWxsSm9icy5wdXNoKC4uLmpvYnMpO1xuICAgICAgICAgICAgaWYgKHN0b3BSZWFzb24gPT09IFwiY2FwLWhpdFwiKVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY29uc3QgYWR2YW5jZWQgPSBhd2FpdCB0aGlzLmdvVG9OZXh0UGFnZSh0aHJvdHRsZSk7XG4gICAgICAgICAgICBpZiAoIWFkdmFuY2VkKVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgcGFnZUluZGV4Kys7XG4gICAgICAgIH1cbiAgICAgICAgb3B0cy5vblByb2dyZXNzPy4oe1xuICAgICAgICAgICAgc2NyYXBlZENvdW50OiBhbGxKb2JzLmxlbmd0aCxcbiAgICAgICAgICAgIGF0dGVtcHRlZENvdW50OiBhbGxKb2JzLmxlbmd0aCxcbiAgICAgICAgICAgIGN1cnJlbnRQYWdlOiBwYWdlSW5kZXgsXG4gICAgICAgICAgICB0b3RhbFJvd3NPblBhZ2U6IHRoaXMuZ2V0Um93cygpLmxlbmd0aCxcbiAgICAgICAgICAgIGRvbmU6IHRydWUsXG4gICAgICAgICAgICBlcnJvcnMsXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gYWxsSm9icztcbiAgICB9XG4gICAgYXN5bmMgc2NyYXBlQ3VycmVudFBhZ2UoYXJncykge1xuICAgICAgICBjb25zdCB7IHNjcmFwZWRTb0ZhciwgcGFnZUluZGV4LCBvcHRzLCBlcnJvcnMgfSA9IGFyZ3M7XG4gICAgICAgIGNvbnN0IG1heEpvYnMgPSBvcHRzLm1heEpvYnMgPz8gTUFYX0pPQlNfREVGQVVMVDtcbiAgICAgICAgY29uc3QgdGhyb3R0bGUgPSBvcHRzLnRocm90dGxlTXMgPz8gREVGQVVMVF9USFJPVFRMRV9NUztcbiAgICAgICAgY29uc3Qgcm93cyA9IHRoaXMuZ2V0Um93cygpO1xuICAgICAgICBjb25zdCBqb2JzID0gW107XG4gICAgICAgIGNvbnN0IGNvbXBhbnkgPSB0aGlzLmV4dHJhY3RDb21wYW55KCk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcm93cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHNjcmFwZWRTb0ZhciArIGpvYnMubGVuZ3RoID49IG1heEpvYnMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geyBqb2JzLCBzdG9wUmVhc29uOiBcImNhcC1oaXRcIiB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3Qgcm93ID0gcm93c1tpXTtcbiAgICAgICAgICAgIGxldCBqb2IgPSBudWxsO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBqb2IgPSB0aGlzLnNjcmFwZVJvdyhyb3csIGNvbXBhbnkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKGByb3cgJHtpfTogJHtTdHJpbmcoZXJyKS5zbGljZSgwLCAyMDApfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGpvYilcbiAgICAgICAgICAgICAgICBqb2JzLnB1c2goam9iKTtcbiAgICAgICAgICAgIG9wdHMub25Qcm9ncmVzcz8uKHtcbiAgICAgICAgICAgICAgICBzY3JhcGVkQ291bnQ6IHNjcmFwZWRTb0ZhciArIGpvYnMubGVuZ3RoLFxuICAgICAgICAgICAgICAgIGF0dGVtcHRlZENvdW50OiBzY3JhcGVkU29GYXIgKyBpICsgMSxcbiAgICAgICAgICAgICAgICBjdXJyZW50UGFnZTogcGFnZUluZGV4LFxuICAgICAgICAgICAgICAgIHRvdGFsUm93c09uUGFnZTogcm93cy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgbGFzdFRpdGxlOiBqb2I/LnRpdGxlLFxuICAgICAgICAgICAgICAgIGRvbmU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVycm9ycyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHRocm90dGxlID4gMClcbiAgICAgICAgICAgICAgICBhd2FpdCBzbGVlcCh0aHJvdHRsZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgam9icyB9O1xuICAgIH1cbiAgICBzY3JhcGVSb3cocm93LCBjb21wYW55KSB7XG4gICAgICAgIGNvbnN0IHRpdGxlRWwgPSByb3cucXVlcnlTZWxlY3RvcignLnBvc3RpbmctdGl0bGUgaDUsIC5wb3N0aW5nLW5hbWUsIFtkYXRhLXFhPVwicG9zdGluZy1uYW1lXCJdJyk7XG4gICAgICAgIGNvbnN0IHRpdGxlID0gdGl0bGVFbD8udGV4dENvbnRlbnQ/LnRyaW0oKTtcbiAgICAgICAgaWYgKCF0aXRsZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwibWlzc2luZyB0aXRsZVwiKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBMZXZlciB3cmFwcyB0aGUgcG9zdGluZyBpbiBhbiBhbmNob3Ig4oCUIGVpdGhlciB0aGUgdGl0bGUgYW5jaG9yIG9yIHRoZVxuICAgICAgICAvLyB3aG9sZSByb3cuIEVpdGhlciBpcyBmaW5lLlxuICAgICAgICBjb25zdCBhbmNob3IgPSByb3cucXVlcnlTZWxlY3RvcignYS5wb3N0aW5nLXRpdGxlLCBhW2RhdGEtcWE9XCJwb3N0aW5nLW5hbWVcIl0sIGEnKSB8fCAocm93Lm1hdGNoZXMoXCJhXCIpID8gcm93IDogbnVsbCk7XG4gICAgICAgIGNvbnN0IGhyZWYgPSBhbmNob3I/LmdldEF0dHJpYnV0ZShcImhyZWZcIikgfHwgXCJcIjtcbiAgICAgICAgY29uc3QgdXJsID0gaHJlZiA/IG5ldyBVUkwoaHJlZiwgd2luZG93LmxvY2F0aW9uLmhyZWYpLnRvU3RyaW5nKCkgOiBcIlwiO1xuICAgICAgICBjb25zdCBsb2NhdGlvbkVsID0gcm93LnF1ZXJ5U2VsZWN0b3IoJy5wb3N0aW5nLWNhdGVnb3JpZXMgLmxvY2F0aW9uLCAuc29ydC1ieS1sb2NhdGlvbiwgLndvcmtwbGFjZVR5cGVzLCBbZGF0YS1xYT1cInBvc3RpbmctbG9jYXRpb25cIl0nKTtcbiAgICAgICAgY29uc3QgbG9jYXRpb24gPSBsb2NhdGlvbkVsPy50ZXh0Q29udGVudD8udHJpbSgpIHx8IHVuZGVmaW5lZDtcbiAgICAgICAgY29uc3QgY29tbWl0bWVudEVsID0gcm93LnF1ZXJ5U2VsZWN0b3IoXCIucG9zdGluZy1jYXRlZ29yaWVzIC5jb21taXRtZW50LCAuc29ydC1ieS1jb21taXRtZW50XCIpO1xuICAgICAgICBjb25zdCBjb21taXRtZW50ID0gY29tbWl0bWVudEVsPy50ZXh0Q29udGVudD8udHJpbSgpIHx8IG51bGw7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICAgIGNvbXBhbnksXG4gICAgICAgICAgICBsb2NhdGlvbixcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIlwiLFxuICAgICAgICAgICAgcmVxdWlyZW1lbnRzOiBbXSxcbiAgICAgICAgICAgIHR5cGU6IHRoaXMuZGV0ZWN0Sm9iVHlwZUZyb21Db21taXRtZW50KGNvbW1pdG1lbnQpLFxuICAgICAgICAgICAgdXJsOiB1cmwgfHwgd2luZG93LmxvY2F0aW9uLmhyZWYsXG4gICAgICAgICAgICBzb3VyY2U6IFwibGV2ZXJcIixcbiAgICAgICAgICAgIHNvdXJjZUpvYklkOiB0aGlzLmV4dHJhY3RKb2JJZEZyb21VcmwodXJsKSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgZXh0cmFjdENvbXBhbnkoKSB7XG4gICAgICAgIC8vIExvZ28gYWx0IOKAlCB3b3JrcyBmb3IgbW9zdCBib2FyZHMuXG4gICAgICAgIGNvbnN0IGxvZ28gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLm1haW4taGVhZGVyLWxvZ28gaW1nLCAucG9zdGluZy1oZWFkZXIgLmxvZ28gaW1nLCBoZWFkZXIgaW1nXCIpO1xuICAgICAgICBjb25zdCBhbHQgPSBsb2dvPy5nZXRBdHRyaWJ1dGUoXCJhbHRcIik7XG4gICAgICAgIGlmIChhbHQgJiYgYWx0LnRyaW0oKSAmJiBhbHQudHJpbSgpICE9PSBcIkNvbXBhbnkgTG9nb1wiKVxuICAgICAgICAgICAgcmV0dXJuIGFsdC50cmltKCk7XG4gICAgICAgIC8vIFBhZ2UgdGl0bGUgZm9ybWF0OiBcIkpvYiBUaXRsZSAtIENvbXBhbnkgTmFtZVwiIG9yIGp1c3QgXCJDb21wYW55IE5hbWUgSm9ic1wiXG4gICAgICAgIGNvbnN0IHBhZ2VUaXRsZSA9IGRvY3VtZW50LnRpdGxlO1xuICAgICAgICBpZiAocGFnZVRpdGxlKSB7XG4gICAgICAgICAgICBjb25zdCBwYXJ0cyA9IHBhZ2VUaXRsZS5zcGxpdChcIiAtIFwiKTtcbiAgICAgICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPj0gMikge1xuICAgICAgICAgICAgICAgIHJldHVybiBwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXS5yZXBsYWNlKFwiIEpvYnNcIiwgXCJcIikudHJpbSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgdHJpbW1lZCA9IHBhZ2VUaXRsZS5yZXBsYWNlKC9Kb2JzJC9pLCBcIlwiKS50cmltKCk7XG4gICAgICAgICAgICBpZiAodHJpbW1lZClcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJpbW1lZDtcbiAgICAgICAgfVxuICAgICAgICAvLyBVUkwgZmFsbGJhY2s6IGpvYnMubGV2ZXIuY28vPGNvbXBhbnk+Ly4uLlxuICAgICAgICBjb25zdCBtYXRjaCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLm1hdGNoKC9sZXZlclxcLmNvXFwvKFteL10rKS8pO1xuICAgICAgICBpZiAobWF0Y2ggJiYgbWF0Y2hbMV0pIHtcbiAgICAgICAgICAgIHJldHVybiBtYXRjaFsxXVxuICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8tL2csIFwiIFwiKVxuICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXGJcXHcvZywgKGMpID0+IGMudG9VcHBlckNhc2UoKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFwiVW5rbm93biBFbXBsb3llclwiO1xuICAgIH1cbiAgICBleHRyYWN0Sm9iSWRGcm9tVXJsKHVybCkge1xuICAgICAgICBjb25zdCBtYXRjaCA9IHVybC5tYXRjaCgvbGV2ZXJcXC5jb1xcL1teL10rXFwvKFthLWYwLTktXSspL2kpO1xuICAgICAgICByZXR1cm4gbWF0Y2g/LlsxXTtcbiAgICB9XG4gICAgZGV0ZWN0Sm9iVHlwZUZyb21Db21taXRtZW50KGNvbW1pdG1lbnQpIHtcbiAgICAgICAgaWYgKCFjb21taXRtZW50KVxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgY29uc3QgbG93ZXIgPSBjb21taXRtZW50LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGlmIChsb3dlci5pbmNsdWRlcyhcImZ1bGwtdGltZVwiKSB8fCBsb3dlci5pbmNsdWRlcyhcImZ1bGwgdGltZVwiKSlcbiAgICAgICAgICAgIHJldHVybiBcImZ1bGwtdGltZVwiO1xuICAgICAgICBpZiAobG93ZXIuaW5jbHVkZXMoXCJwYXJ0LXRpbWVcIikgfHwgbG93ZXIuaW5jbHVkZXMoXCJwYXJ0IHRpbWVcIikpXG4gICAgICAgICAgICByZXR1cm4gXCJwYXJ0LXRpbWVcIjtcbiAgICAgICAgaWYgKGxvd2VyLmluY2x1ZGVzKFwiY29udHJhY3RcIikgfHwgbG93ZXIuaW5jbHVkZXMoXCJjb250cmFjdG9yXCIpKVxuICAgICAgICAgICAgcmV0dXJuIFwiY29udHJhY3RcIjtcbiAgICAgICAgaWYgKGxvd2VyLmluY2x1ZGVzKFwiaW50ZXJuXCIpKVxuICAgICAgICAgICAgcmV0dXJuIFwiaW50ZXJuc2hpcFwiO1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBnZXRSb3dzKCkge1xuICAgICAgICBjb25zdCBzZWVuID0gbmV3IFNldCgpO1xuICAgICAgICBjb25zdCBvdXQgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBzZWxlY3RvciBvZiBST1dfU0VMRUNUT1JTKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGVsIG9mIEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikpKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFzZWVuLmhhcyhlbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgc2Vlbi5hZGQoZWwpO1xuICAgICAgICAgICAgICAgICAgICBvdXQucHVzaChlbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG91dC5sZW5ndGggPiAwKVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvdXQ7XG4gICAgfVxuICAgIGFzeW5jIGdvVG9OZXh0UGFnZSh0aHJvdHRsZU1zKSB7XG4gICAgICAgIGxldCBuZXh0QnRuID0gbnVsbDtcbiAgICAgICAgZm9yIChjb25zdCBzZWxlY3RvciBvZiBORVhUX1BBR0VfU0VMRUNUT1JTKSB7XG4gICAgICAgICAgICBuZXh0QnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgICAgICAgICBpZiAobmV4dEJ0bilcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBpZiAoIW5leHRCdG4pXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmIChuZXh0QnRuLmNsYXNzTGlzdC5jb250YWlucyhcImRpc2FibGVkXCIpIHx8XG4gICAgICAgICAgICBuZXh0QnRuLmdldEF0dHJpYnV0ZShcImFyaWEtZGlzYWJsZWRcIikgPT09IFwidHJ1ZVwiKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYmVmb3JlU2lnID0gdGhpcy5maXJzdFJvd1NpZ25hdHVyZSgpO1xuICAgICAgICBuZXh0QnRuLmNsaWNrKCk7XG4gICAgICAgIGNvbnN0IGNoYW5nZWQgPSBhd2FpdCB3YWl0Rm9yKCgpID0+IHRoaXMuZmlyc3RSb3dTaWduYXR1cmUoKSAhPT0gYmVmb3JlU2lnICYmIHRoaXMuZ2V0Um93cygpLmxlbmd0aCA+IDAsIDgwMDApO1xuICAgICAgICBpZiAoIWNoYW5nZWQpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmICh0aHJvdHRsZU1zID4gMClcbiAgICAgICAgICAgIGF3YWl0IHNsZWVwKHRocm90dGxlTXMpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgZmlyc3RSb3dTaWduYXR1cmUoKSB7XG4gICAgICAgIGNvbnN0IHJvdyA9IHRoaXMuZ2V0Um93cygpWzBdO1xuICAgICAgICByZXR1cm4gcm93Py50ZXh0Q29udGVudD8udHJpbSgpLnNsaWNlKDAsIDEyMCkgfHwgXCJcIjtcbiAgICB9XG59XG4iLCIvLyBQMy8jMzkg4oCUIEJ1bGstc2NyYXBlIG9yY2hlc3RyYXRvciBmb3IgV29ya2RheSBqb2ItbGlzdGluZyBwYWdlcy5cbi8vXG4vLyBUYXJnZXRzIHRoZSBsaXN0aW5nIHN1cmZhY2UgYXQgYDx0ZW5hbnQ+LjxyZWdpb24+Lm15d29ya2RheWpvYnMuY29tLzxib2FyZD5gXG4vLyAob3IgdGhlIGxlZ2FjeSBgKi53b3JrZGF5am9icy5jb20vPGJvYXJkPmApLiBXYWxrcyB0aGUgdmlzaWJsZSBqb2Igcm93cyxcbi8vIGJ1aWxkcyBhIGBTY3JhcGVkSm9iYCBmcm9tIGVhY2gsIGFuZCB5aWVsZHMgdGhlIHJlc3VsdC4gVHdvIG1vZGVzIG1pcnJvciB0aGVcbi8vIFdhdGVybG9vV29ya3Mgb3JjaGVzdHJhdG9yOlxuLy9cbi8vICAgc2NyYXBlQWxsVmlzaWJsZSgpICAg4oCUIGN1cnJlbnQgdmlzaWJsZSByb3dzIG9ubHlcbi8vICAgc2NyYXBlQWxsUGFnaW5hdGVkKCkg4oCUIGNsaWNrcyBXb3JrZGF5J3MgXCJOZXh0IHBhZ2VcIiBhcnJvdyB1bnRpbCBleGhhdXN0ZWRcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICBvciB0aGUgMjAwL3Nlc3Npb24gY2FwIGhpdHMuXG4vL1xuLy8gKipOT1QqKiB0aGUgYXBwbHkgZmxvdy4gV29ya2RheSdzIGFwcGx5IGZ1bm5lbCBpcyBhIHNlcGFyYXRlIHN1cmZhY2UgKCMzNikuXG4vLyBUaGlzIG9yY2hlc3RyYXRvciBoYXJkLXN0b3BzIGlmIGl0IHNlZXMgdGhhdCB3ZSd2ZSBuYXZpZ2F0ZWQgb2ZmIGEgbGlzdGluZ1xuLy8gdmlldyBieSBjaGVja2luZyBmb3IgdGhlIGNhbm9uaWNhbCBgW2RhdGEtYXV0b21hdGlvbi1pZD1cImpvYlNlYXJjaFwiXWBcbi8vIGNvbnRhaW5lciBvciBhIHJlY29nbmlzYWJsZSBqb2Igcm93IGJlZm9yZSBlYWNoIGl0ZXJhdGlvbi5cbi8vXG4vLyBXb3JrZGF5IGJvYXJkcyBhcmUgcHVibGljLCBpbnRlbnRpb25hbGx5IHN5bmRpY2F0ZWQgYnkgdGhlIGhpcmluZyB0ZW5hbnQsXG4vLyBhbmQgaGF2ZSBubyBhbnRpLXNjcmFwZSBwb3N0dXJlIG9uIGxpc3RpbmcgcGFnZXMuXG4vL1xuLy8gU2VsZWN0b3JzIG9ic2VydmVkIG9uIGAqLm15d29ya2RheWpvYnMuY29tLypgIGxpc3RpbmcgcGFnZXMgKDIwMjYtMDUpOlxuLy8gICAtIHJvd3M6IGBbZGF0YS1hdXRvbWF0aW9uLWlkPVwiam9iUmVzdWx0c1wiXSBsaWAgb3Jcbi8vICAgICAgICAgICBgbGkuY3NzLTFxMmRyYTNgIChvbGRlciBza2luKSBvclxuLy8gICAgICAgICAgIGBbcm9sZT1cImxpc3RpdGVtXCJdYCBpbnNpZGUgdGhlIHJlc3VsdHMgcmVnaW9uXG4vLyAgIC0gdGl0bGU6IGBbZGF0YS1hdXRvbWF0aW9uLWlkPVwiam9iVGl0bGVcIl1gIChhbiBhbmNob3IpXG4vLyAgIC0gbG9jYXRpb246IGBbZGF0YS1hdXRvbWF0aW9uLWlkPVwibG9jYXRpb25zXCJdYFxuLy8gICAtIHBvc3RlZCBhdDogYFtkYXRhLWF1dG9tYXRpb24taWQ9XCJwb3N0ZWRPblwiXWBcbi8vICAgLSByZXEgaWQ6IGBbZGF0YS1hdXRvbWF0aW9uLWlkPVwicmVxdWlzaXRpb25JZFwiXWBcbi8vICAgLSBuZXh0IHBhZ2U6IGBidXR0b25bZGF0YS11eGktZWxlbWVudC1pZD1cIm5leHRcIl1gIG9yXG4vLyAgICAgICAgICAgICAgICBgbmF2W2FyaWEtbGFiZWw9XCJwYWdpbmF0aW9uXCJdIGJ1dHRvblthcmlhLWxhYmVsPVwibmV4dFwiIGldYFxuY29uc3QgREVGQVVMVF9USFJPVFRMRV9NUyA9IDUwO1xuY29uc3QgTUFYX0pPQlNfREVGQVVMVCA9IDIwMDtcbmNvbnN0IE1BWF9QQUdFU19ERUZBVUxUID0gNTA7XG5jb25zdCBST1dfU0VMRUNUT1JTID0gW1xuICAgICdbZGF0YS1hdXRvbWF0aW9uLWlkPVwiam9iUmVzdWx0c1wiXSBsaScsXG4gICAgJ1tkYXRhLWF1dG9tYXRpb24taWQ9XCJqb2JSZXN1bHRzXCJdIFtyb2xlPVwibGlzdGl0ZW1cIl0nLFxuICAgICd1bFtyb2xlPVwibGlzdFwiXSBsaVtkYXRhLWF1dG9tYXRpb24taWQqPVwiam9iXCJdJyxcbiAgICBcImxpLmNzcy0xcTJkcmEzXCIsXG5dO1xuY29uc3QgTkVYVF9QQUdFX1NFTEVDVE9SUyA9IFtcbiAgICAnYnV0dG9uW2RhdGEtdXhpLWVsZW1lbnQtaWQ9XCJuZXh0XCJdJyxcbiAgICAnbmF2W2FyaWEtbGFiZWw9XCJwYWdpbmF0aW9uXCJdIGJ1dHRvblthcmlhLWxhYmVsKj1cIm5leHRcIiBpXScsXG4gICAgJ2J1dHRvblthcmlhLWxhYmVsPVwibmV4dFwiIGldJyxcbl07XG5jb25zdCBzbGVlcCA9IChtcykgPT4gbmV3IFByb21pc2UoKHIpID0+IHNldFRpbWVvdXQociwgbXMpKTtcbmFzeW5jIGZ1bmN0aW9uIHdhaXRGb3IocHJlZGljYXRlLCB0aW1lb3V0TXMsIGludGVydmFsTXMgPSAxMDApIHtcbiAgICBjb25zdCBzdGFydCA9IERhdGUubm93KCk7XG4gICAgd2hpbGUgKERhdGUubm93KCkgLSBzdGFydCA8IHRpbWVvdXRNcykge1xuICAgICAgICBpZiAocHJlZGljYXRlKCkpXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgYXdhaXQgc2xlZXAoaW50ZXJ2YWxNcyk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cbmV4cG9ydCBjbGFzcyBXb3JrZGF5T3JjaGVzdHJhdG9yIHtcbiAgICAvKipcbiAgICAgKiBEZXRlY3QgYSBXb3JrZGF5IExJU1RJTkcgcGFnZSAobm90IHRoZSBhcHBseSBmbG93KS4gV2UgYWNjZXB0IHRoZSBwdWJsaWNcbiAgICAgKiB0ZW5hbnQgaG9zdHMgYW5kIHJlcXVpcmUgZWl0aGVyIHRoZSBqb2ItcmVzdWx0cyByZWdpb24gb3IgYSByZWNvZ25pc2FibGVcbiAgICAgKiBqb2ItY2FyZCByb3cgaW4gdGhlIERPTSDigJQgbmV2ZXIgdGhlIGFwcGx5IGZ1bm5lbC5cbiAgICAgKi9cbiAgICBzdGF0aWMgY2FuSGFuZGxlKHVybCkge1xuICAgICAgICBpZiAoIS9cXC4obXkpP3dvcmtkYXlqb2JzXFwuY29tXFwvLy50ZXN0KHVybCkpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIC8vIFRoZSBhcHBseSBmbG93IGxpdmVzIHVuZGVyIGAvYXBwbHkvYCBvciBpbmNsdWRlcyBgL2FwcGx5YCBpbiB0aGUgcGF0aCDigJRcbiAgICAgICAgLy8gYmFpbCBvdXQgc28gd2UgZG9uJ3QgYmxvdyB1cCBhbiBhcHBseSBmb3JtIG1pZC1mbGlnaHQuXG4gICAgICAgIGlmICgvXFwvYXBwbHkoXFxifFxcLykvLnRlc3QodXJsKSlcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGFzeW5jIHNjcmFwZUFsbFZpc2libGUob3B0cyA9IHt9KSB7XG4gICAgICAgIGNvbnN0IHsgam9icyB9ID0gYXdhaXQgdGhpcy5zY3JhcGVDdXJyZW50UGFnZSh7XG4gICAgICAgICAgICBzY3JhcGVkU29GYXI6IDAsXG4gICAgICAgICAgICBwYWdlSW5kZXg6IDEsXG4gICAgICAgICAgICBvcHRzLFxuICAgICAgICAgICAgZXJyb3JzOiBbXSxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBqb2JzO1xuICAgIH1cbiAgICBhc3luYyBzY3JhcGVBbGxQYWdpbmF0ZWQob3B0cyA9IHt9KSB7XG4gICAgICAgIGNvbnN0IG1heEpvYnMgPSBvcHRzLm1heEpvYnMgPz8gTUFYX0pPQlNfREVGQVVMVDtcbiAgICAgICAgY29uc3QgbWF4UGFnZXMgPSBvcHRzLm1heFBhZ2VzID8/IE1BWF9QQUdFU19ERUZBVUxUO1xuICAgICAgICBjb25zdCB0aHJvdHRsZSA9IG9wdHMudGhyb3R0bGVNcyA/PyBERUZBVUxUX1RIUk9UVExFX01TO1xuICAgICAgICBjb25zdCBhbGxKb2JzID0gW107XG4gICAgICAgIGNvbnN0IGVycm9ycyA9IFtdO1xuICAgICAgICBsZXQgcGFnZUluZGV4ID0gMTtcbiAgICAgICAgd2hpbGUgKHBhZ2VJbmRleCA8PSBtYXhQYWdlcyAmJiBhbGxKb2JzLmxlbmd0aCA8IG1heEpvYnMpIHtcbiAgICAgICAgICAgIGNvbnN0IHsgam9icywgc3RvcFJlYXNvbiB9ID0gYXdhaXQgdGhpcy5zY3JhcGVDdXJyZW50UGFnZSh7XG4gICAgICAgICAgICAgICAgc2NyYXBlZFNvRmFyOiBhbGxKb2JzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBwYWdlSW5kZXgsXG4gICAgICAgICAgICAgICAgb3B0czogeyAuLi5vcHRzLCBtYXhKb2JzIH0sXG4gICAgICAgICAgICAgICAgZXJyb3JzLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBhbGxKb2JzLnB1c2goLi4uam9icyk7XG4gICAgICAgICAgICBpZiAoc3RvcFJlYXNvbiA9PT0gXCJjYXAtaGl0XCIpXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjb25zdCBhZHZhbmNlZCA9IGF3YWl0IHRoaXMuZ29Ub05leHRQYWdlKHRocm90dGxlKTtcbiAgICAgICAgICAgIGlmICghYWR2YW5jZWQpXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBwYWdlSW5kZXgrKztcbiAgICAgICAgfVxuICAgICAgICBvcHRzLm9uUHJvZ3Jlc3M/Lih7XG4gICAgICAgICAgICBzY3JhcGVkQ291bnQ6IGFsbEpvYnMubGVuZ3RoLFxuICAgICAgICAgICAgYXR0ZW1wdGVkQ291bnQ6IGFsbEpvYnMubGVuZ3RoLFxuICAgICAgICAgICAgY3VycmVudFBhZ2U6IHBhZ2VJbmRleCxcbiAgICAgICAgICAgIHRvdGFsUm93c09uUGFnZTogdGhpcy5nZXRSb3dzKCkubGVuZ3RoLFxuICAgICAgICAgICAgZG9uZTogdHJ1ZSxcbiAgICAgICAgICAgIGVycm9ycyxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBhbGxKb2JzO1xuICAgIH1cbiAgICBhc3luYyBzY3JhcGVDdXJyZW50UGFnZShhcmdzKSB7XG4gICAgICAgIGNvbnN0IHsgc2NyYXBlZFNvRmFyLCBwYWdlSW5kZXgsIG9wdHMsIGVycm9ycyB9ID0gYXJncztcbiAgICAgICAgY29uc3QgbWF4Sm9icyA9IG9wdHMubWF4Sm9icyA/PyBNQVhfSk9CU19ERUZBVUxUO1xuICAgICAgICBjb25zdCB0aHJvdHRsZSA9IG9wdHMudGhyb3R0bGVNcyA/PyBERUZBVUxUX1RIUk9UVExFX01TO1xuICAgICAgICBjb25zdCByb3dzID0gdGhpcy5nZXRSb3dzKCk7XG4gICAgICAgIGNvbnN0IGpvYnMgPSBbXTtcbiAgICAgICAgY29uc3QgY29tcGFueSA9IHRoaXMuZXh0cmFjdENvbXBhbnkoKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByb3dzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoc2NyYXBlZFNvRmFyICsgam9icy5sZW5ndGggPj0gbWF4Sm9icykge1xuICAgICAgICAgICAgICAgIHJldHVybiB7IGpvYnMsIHN0b3BSZWFzb246IFwiY2FwLWhpdFwiIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCByb3cgPSByb3dzW2ldO1xuICAgICAgICAgICAgbGV0IGpvYiA9IG51bGw7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGpvYiA9IHRoaXMuc2NyYXBlUm93KHJvdywgY29tcGFueSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgZXJyb3JzLnB1c2goYHJvdyAke2l9OiAke1N0cmluZyhlcnIpLnNsaWNlKDAsIDIwMCl9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoam9iKVxuICAgICAgICAgICAgICAgIGpvYnMucHVzaChqb2IpO1xuICAgICAgICAgICAgb3B0cy5vblByb2dyZXNzPy4oe1xuICAgICAgICAgICAgICAgIHNjcmFwZWRDb3VudDogc2NyYXBlZFNvRmFyICsgam9icy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgYXR0ZW1wdGVkQ291bnQ6IHNjcmFwZWRTb0ZhciArIGkgKyAxLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRQYWdlOiBwYWdlSW5kZXgsXG4gICAgICAgICAgICAgICAgdG90YWxSb3dzT25QYWdlOiByb3dzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBsYXN0VGl0bGU6IGpvYj8udGl0bGUsXG4gICAgICAgICAgICAgICAgZG9uZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgZXJyb3JzLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAodGhyb3R0bGUgPiAwKVxuICAgICAgICAgICAgICAgIGF3YWl0IHNsZWVwKHRocm90dGxlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBqb2JzIH07XG4gICAgfVxuICAgIHNjcmFwZVJvdyhyb3csIGNvbXBhbnkpIHtcbiAgICAgICAgY29uc3QgdGl0bGVFbCA9IHJvdy5xdWVyeVNlbGVjdG9yKCdbZGF0YS1hdXRvbWF0aW9uLWlkPVwiam9iVGl0bGVcIl0nKTtcbiAgICAgICAgY29uc3QgdGl0bGUgPSB0aXRsZUVsPy50ZXh0Q29udGVudD8udHJpbSgpO1xuICAgICAgICBpZiAoIXRpdGxlKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJtaXNzaW5nIHRpdGxlXCIpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGhyZWYgPSB0aXRsZUVsPy5nZXRBdHRyaWJ1dGUoXCJocmVmXCIpIHx8IFwiXCI7XG4gICAgICAgIGNvbnN0IHVybCA9IGhyZWYgPyBuZXcgVVJMKGhyZWYsIHdpbmRvdy5sb2NhdGlvbi5ocmVmKS50b1N0cmluZygpIDogXCJcIjtcbiAgICAgICAgY29uc3QgbG9jYXRpb25FbCA9IHJvdy5xdWVyeVNlbGVjdG9yKCdbZGF0YS1hdXRvbWF0aW9uLWlkPVwibG9jYXRpb25zXCJdLCBbZGF0YS1hdXRvbWF0aW9uLWlkPVwibG9jYXRpb25MYWJlbFwiXScpO1xuICAgICAgICBjb25zdCBsb2NhdGlvbiA9IGxvY2F0aW9uRWw/LnRleHRDb250ZW50Py50cmltKCkgfHwgdW5kZWZpbmVkO1xuICAgICAgICBjb25zdCByZXFJZEVsID0gcm93LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWF1dG9tYXRpb24taWQ9XCJyZXF1aXNpdGlvbklkXCJdJyk7XG4gICAgICAgIGNvbnN0IHNvdXJjZUpvYklkID0gcmVxSWRFbD8udGV4dENvbnRlbnQ/LnRyaW0oKSB8fCB0aGlzLmV4dHJhY3RKb2JJZEZyb21VcmwodXJsKTtcbiAgICAgICAgY29uc3QgcG9zdGVkRWwgPSByb3cucXVlcnlTZWxlY3RvcignW2RhdGEtYXV0b21hdGlvbi1pZD1cInBvc3RlZE9uXCJdJyk7XG4gICAgICAgIGNvbnN0IHBvc3RlZEF0ID0gcG9zdGVkRWw/LnRleHRDb250ZW50Py50cmltKCkgfHwgdW5kZWZpbmVkO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgICBjb21wYW55LFxuICAgICAgICAgICAgbG9jYXRpb24sXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJcIixcbiAgICAgICAgICAgIHJlcXVpcmVtZW50czogW10sXG4gICAgICAgICAgICB1cmw6IHVybCB8fCB3aW5kb3cubG9jYXRpb24uaHJlZixcbiAgICAgICAgICAgIHNvdXJjZTogXCJ3b3JrZGF5XCIsXG4gICAgICAgICAgICBzb3VyY2VKb2JJZCxcbiAgICAgICAgICAgIHBvc3RlZEF0LFxuICAgICAgICB9O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBXb3JrZGF5IGJvYXJkcyB0eXBpY2FsbHkgc2hvdyB0aGUgdGVuYW50IG5hbWUgaW4gdGhlIGhlYWRlciBiYW5uZXIuIFRyeSBhXG4gICAgICogZmV3IGNvbW1vbiBzbG90cywgdGhlbiBmYWxsIGJhY2sgdG8gdGhlIGZpcnN0IGxhYmVsLXN0eWxlIGhvc3RuYW1lXG4gICAgICogZnJhZ21lbnQuXG4gICAgICovXG4gICAgZXh0cmFjdENvbXBhbnkoKSB7XG4gICAgICAgIGNvbnN0IGxhYmVsbGVkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignW2RhdGEtYXV0b21hdGlvbi1pZD1cInBhZ2VIZWFkZXJcIl0sIFtkYXRhLWF1dG9tYXRpb24taWQ9XCJjb21wYW55TG9nb1wiXSBpbWcsIFtkYXRhLWF1dG9tYXRpb24taWQ9XCJoZWFkZXJcIl0gaDEnKTtcbiAgICAgICAgaWYgKGxhYmVsbGVkIGluc3RhbmNlb2YgSFRNTEltYWdlRWxlbWVudCAmJiBsYWJlbGxlZC5hbHQpIHtcbiAgICAgICAgICAgIHJldHVybiBsYWJlbGxlZC5hbHQudHJpbSgpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRleHQgPSBsYWJlbGxlZD8udGV4dENvbnRlbnQ/LnRyaW0oKTtcbiAgICAgICAgaWYgKHRleHQpXG4gICAgICAgICAgICByZXR1cm4gdGV4dDtcbiAgICAgICAgY29uc3Qgb2dTaXRlTmFtZSA9IGRvY3VtZW50XG4gICAgICAgICAgICAucXVlcnlTZWxlY3RvcignbWV0YVtwcm9wZXJ0eT1cIm9nOnNpdGVfbmFtZVwiXScpXG4gICAgICAgICAgICA/LmdldEF0dHJpYnV0ZShcImNvbnRlbnRcIik7XG4gICAgICAgIGlmIChvZ1NpdGVOYW1lKVxuICAgICAgICAgICAgcmV0dXJuIG9nU2l0ZU5hbWUudHJpbSgpO1xuICAgICAgICAvLyBIb3N0bmFtZSBpcyB0eXBpY2FsbHkgYDx0ZW5hbnQ+LjxyZWdpb24+Lm15d29ya2RheWpvYnMuY29tYC5cbiAgICAgICAgY29uc3QgdGVuYW50ID0gd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lLnNwbGl0KFwiLlwiKVswXTtcbiAgICAgICAgaWYgKHRlbmFudCkge1xuICAgICAgICAgICAgcmV0dXJuIHRlbmFudC5yZXBsYWNlKC8tL2csIFwiIFwiKS5yZXBsYWNlKC9cXGJcXHcvZywgKGMpID0+IGMudG9VcHBlckNhc2UoKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFwiVW5rbm93biBFbXBsb3llclwiO1xuICAgIH1cbiAgICBleHRyYWN0Sm9iSWRGcm9tVXJsKHVybCkge1xuICAgICAgICAvLyBXb3JrZGF5IFVSTHMgZW5kIGluIC9qb2IvLi4uL1ItMTIzNDUgb3IgX1ItMTIzNDUg4oCUIHB1bGwgdGhlIHJlcXVpc2l0aW9uLlxuICAgICAgICBjb25zdCBtYXRjaCA9IHVybC5tYXRjaCgvW18vXShbUnJdLT9cXGR7Myx9KSg/OlsvPyNdfCQpLyk7XG4gICAgICAgIHJldHVybiBtYXRjaD8uWzFdO1xuICAgIH1cbiAgICBnZXRSb3dzKCkge1xuICAgICAgICBjb25zdCBzZWVuID0gbmV3IFNldCgpO1xuICAgICAgICBjb25zdCBvdXQgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBzZWxlY3RvciBvZiBST1dfU0VMRUNUT1JTKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGVsIG9mIEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikpKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFzZWVuLmhhcyhlbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgc2Vlbi5hZGQoZWwpO1xuICAgICAgICAgICAgICAgICAgICBvdXQucHVzaChlbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG91dC5sZW5ndGggPiAwKVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvdXQ7XG4gICAgfVxuICAgIGFzeW5jIGdvVG9OZXh0UGFnZSh0aHJvdHRsZU1zKSB7XG4gICAgICAgIGxldCBuZXh0QnRuID0gbnVsbDtcbiAgICAgICAgZm9yIChjb25zdCBzZWxlY3RvciBvZiBORVhUX1BBR0VfU0VMRUNUT1JTKSB7XG4gICAgICAgICAgICBuZXh0QnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgICAgICAgICBpZiAobmV4dEJ0bilcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBpZiAoIW5leHRCdG4pXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmIChuZXh0QnRuLmhhc0F0dHJpYnV0ZShcImRpc2FibGVkXCIpIHx8XG4gICAgICAgICAgICBuZXh0QnRuLmdldEF0dHJpYnV0ZShcImFyaWEtZGlzYWJsZWRcIikgPT09IFwidHJ1ZVwiIHx8XG4gICAgICAgICAgICBuZXh0QnRuLmNsYXNzTGlzdC5jb250YWlucyhcImRpc2FibGVkXCIpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYmVmb3JlU2lnID0gdGhpcy5maXJzdFJvd1NpZ25hdHVyZSgpO1xuICAgICAgICBuZXh0QnRuLmNsaWNrKCk7XG4gICAgICAgIGNvbnN0IGNoYW5nZWQgPSBhd2FpdCB3YWl0Rm9yKCgpID0+IHRoaXMuZmlyc3RSb3dTaWduYXR1cmUoKSAhPT0gYmVmb3JlU2lnICYmIHRoaXMuZ2V0Um93cygpLmxlbmd0aCA+IDAsIDgwMDApO1xuICAgICAgICBpZiAoIWNoYW5nZWQpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmICh0aHJvdHRsZU1zID4gMClcbiAgICAgICAgICAgIGF3YWl0IHNsZWVwKHRocm90dGxlTXMpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgZmlyc3RSb3dTaWduYXR1cmUoKSB7XG4gICAgICAgIGNvbnN0IHJvdyA9IHRoaXMuZ2V0Um93cygpWzBdO1xuICAgICAgICByZXR1cm4gcm93Py50ZXh0Q29udGVudD8udHJpbSgpLnNsaWNlKDAsIDEyMCkgfHwgXCJcIjtcbiAgICB9XG59XG4iLCJleHBvcnQgZnVuY3Rpb24gc2hvd0FwcGxpZWRUb2FzdChjb21wYW55LCBvbkNsaWNrKSB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5zbG90aGluZy10b2FzdC1hcHBsaWVkXCIpPy5yZW1vdmUoKTtcbiAgICBjb25zdCB0b2FzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgdG9hc3QuY2xhc3NOYW1lID0gXCJzbG90aGluZy10b2FzdCBzbG90aGluZy10b2FzdC1hcHBsaWVkXCI7XG4gICAgdG9hc3QudGFiSW5kZXggPSAwO1xuICAgIHRvYXN0LnNldEF0dHJpYnV0ZShcInJvbGVcIiwgXCJidXR0b25cIik7XG4gICAgdG9hc3Quc2V0QXR0cmlidXRlKFwiYXJpYS1sYWJlbFwiLCBcIk9wZW4gU2xvdGhpbmcgZGFzaGJvYXJkXCIpO1xuICAgIHRvYXN0LnRleHRDb250ZW50ID0gYOKckyBUcmFja2VkIGluIFNsb3RoaW5nIC0gYXBwbGllZCB0byAke2NvbXBhbnl9YDtcbiAgICBjb25zdCBkaXNtaXNzID0gKCkgPT4gdG9hc3QucmVtb3ZlKCk7XG4gICAgY29uc3QgdGltZW91dElkID0gd2luZG93LnNldFRpbWVvdXQoZGlzbWlzcywgNjAwMCk7XG4gICAgdG9hc3QuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgd2luZG93LmNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgICAgICBvbkNsaWNrKCk7XG4gICAgICAgIGRpc21pc3MoKTtcbiAgICB9KTtcbiAgICB0b2FzdC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKGV2ZW50LmtleSA9PT0gXCJFbnRlclwiIHx8IGV2ZW50LmtleSA9PT0gXCIgXCIpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB0b2FzdC5jbGljaygpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChldmVudC5rZXkgPT09IFwiRXNjYXBlXCIpIHtcbiAgICAgICAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICAgICAgICAgIGRpc21pc3MoKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodG9hc3QpO1xufVxuIiwiaW1wb3J0IHsgc2VuZE1lc3NhZ2UsIE1lc3NhZ2VzIH0gZnJvbSBcIkAvc2hhcmVkL21lc3NhZ2VzXCI7XG5jb25zdCBNQVhfSEVBRExJTkVfTEVOR1RIID0gMjAwO1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGJ1aWxkUGFnZVNuYXBzaG90KHsgY2FwdHVyZVNjcmVlbnNob3QsIH0pIHtcbiAgICBjb25zdCB0aXRsZSA9IGRvY3VtZW50LnRpdGxlLnRyaW0oKTtcbiAgICBjb25zdCBoZWFkbGluZSA9IG5vcm1hbGl6ZVRleHQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImgxXCIpPy50ZXh0Q29udGVudCB8fCB0aXRsZSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdXJsOiB3aW5kb3cubG9jYXRpb24uaHJlZixcbiAgICAgICAgaG9zdDogd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lLFxuICAgICAgICB0aXRsZSxcbiAgICAgICAgaGVhZGxpbmU6IGhlYWRsaW5lID8gdHJ1bmNhdGUoaGVhZGxpbmUsIE1BWF9IRUFETElORV9MRU5HVEgpIDogdW5kZWZpbmVkLFxuICAgICAgICBzdWJtaXR0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICB0aHVtYm5haWxEYXRhVXJsOiBjYXB0dXJlU2NyZWVuc2hvdFxuICAgICAgICAgICAgPyBhd2FpdCBjYXB0dXJlVmlzaWJsZVRhYlNhZmVseSgpXG4gICAgICAgICAgICA6IHVuZGVmaW5lZCxcbiAgICB9O1xufVxuZnVuY3Rpb24gbm9ybWFsaXplVGV4dCh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKC9cXHMrL2csIFwiIFwiKS50cmltKCk7XG59XG5mdW5jdGlvbiB0cnVuY2F0ZSh2YWx1ZSwgbWF4TGVuZ3RoKSB7XG4gICAgaWYgKHZhbHVlLmxlbmd0aCA8PSBtYXhMZW5ndGgpXG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICByZXR1cm4gdmFsdWUuc2xpY2UoMCwgbWF4TGVuZ3RoIC0gMSkudHJpbUVuZCgpO1xufVxuYXN5bmMgZnVuY3Rpb24gY2FwdHVyZVZpc2libGVUYWJTYWZlbHkoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBzZW5kTWVzc2FnZShNZXNzYWdlcy5jYXB0dXJlVmlzaWJsZVRhYigpKTtcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLnN1Y2Nlc3MgPyByZXNwb25zZS5kYXRhPy5kYXRhVXJsIDogdW5kZWZpbmVkO1xuICAgIH1cbiAgICBjYXRjaCB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgYnVpbGRQYWdlU25hcHNob3QgfSBmcm9tIFwiLi9wYWdlLXNuYXBzaG90XCI7XG5jb25zdCBBUFBMSUNBVElPTl9GSUVMRF9UWVBFUyA9IG5ldyBTZXQoW1xuICAgIFwiZmlyc3ROYW1lXCIsXG4gICAgXCJsYXN0TmFtZVwiLFxuICAgIFwiZnVsbE5hbWVcIixcbiAgICBcImVtYWlsXCIsXG4gICAgXCJwaG9uZVwiLFxuICAgIFwibGlua2VkaW5cIixcbiAgICBcImdpdGh1YlwiLFxuICAgIFwid2Vic2l0ZVwiLFxuICAgIFwicG9ydGZvbGlvXCIsXG4gICAgXCJyZXN1bWVcIixcbiAgICBcImNvdmVyTGV0dGVyXCIsXG4gICAgXCJ3b3JrQXV0aG9yaXphdGlvblwiLFxuICAgIFwic3BvbnNvcnNoaXBcIixcbiAgICBcImN1c3RvbVF1ZXN0aW9uXCIsXG5dKTtcbmNvbnN0IEJMT0NLRURfRk9STV9LRVlXT1JEUyA9IFtcbiAgICBcImxvZ2luXCIsXG4gICAgXCJsb2cgaW5cIixcbiAgICBcInNpZ25pblwiLFxuICAgIFwic2lnbiBpblwiLFxuICAgIFwic2lnbnVwXCIsXG4gICAgXCJzaWduIHVwXCIsXG4gICAgXCJyZWdpc3RlclwiLFxuICAgIFwic2VhcmNoXCIsXG4gICAgXCJzdWJzY3JpYmVcIixcbiAgICBcIm5ld3NsZXR0ZXJcIixcbl07XG5leHBvcnQgY2xhc3MgU3VibWl0V2F0Y2hlciB7XG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgICAgICB0aGlzLmhhbmRsZWRGb3JtcyA9IG5ldyBXZWFrU2V0KCk7XG4gICAgICAgIHRoaXMucGVuZGluZ0Zvcm1zID0gbmV3IFdlYWtTZXQoKTtcbiAgICAgICAgdGhpcy50cmFja2VkVXJscyA9IG5ldyBTZXQoKTtcbiAgICAgICAgdGhpcy5hdHRhY2hlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmhhbmRsZVN1Ym1pdCA9IChldmVudCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZm9ybSA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgICAgIGlmICghKGZvcm0gaW5zdGFuY2VvZiBIVE1MRm9ybUVsZW1lbnQpKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIHZvaWQgdGhpcy50cmFja0Zvcm1TdWJtaXQoZm9ybSk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgfVxuICAgIGF0dGFjaCgpIHtcbiAgICAgICAgaWYgKHRoaXMuYXR0YWNoZWQpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJzdWJtaXRcIiwgdGhpcy5oYW5kbGVTdWJtaXQsIHRydWUpO1xuICAgICAgICB0aGlzLmF0dGFjaGVkID0gdHJ1ZTtcbiAgICB9XG4gICAgZGV0YWNoKCkge1xuICAgICAgICBpZiAoIXRoaXMuYXR0YWNoZWQpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJzdWJtaXRcIiwgdGhpcy5oYW5kbGVTdWJtaXQsIHRydWUpO1xuICAgICAgICB0aGlzLmF0dGFjaGVkID0gZmFsc2U7XG4gICAgfVxuICAgIGFzeW5jIHRyYWNrRm9ybVN1Ym1pdChmb3JtKSB7XG4gICAgICAgIGlmICh0aGlzLmhhbmRsZWRGb3Jtcy5oYXMoZm9ybSkgfHxcbiAgICAgICAgICAgIHRoaXMucGVuZGluZ0Zvcm1zLmhhcyhmb3JtKSB8fFxuICAgICAgICAgICAgdGhpcy50cmFja2VkVXJscy5oYXMod2luZG93LmxvY2F0aW9uLmhyZWYpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wZW5kaW5nRm9ybXMuYWRkKGZvcm0pO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3Qgc2V0dGluZ3MgPSBhd2FpdCB0aGlzLm9wdGlvbnMuZ2V0U2V0dGluZ3MoKTtcbiAgICAgICAgICAgIGlmICghc2V0dGluZ3MuYXV0b1RyYWNrQXBwbGljYXRpb25zRW5hYmxlZClcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBjb25zdCBkZXRlY3RlZEZpZWxkcyA9IHRoaXMub3B0aW9ucy5nZXREZXRlY3RlZEZpZWxkcyhmb3JtKTtcbiAgICAgICAgICAgIGlmIChpc0xpa2VseVNlYXJjaE9yTG9naW5Gb3JtKGZvcm0sIHdpbmRvdy5sb2NhdGlvbi5ocmVmKSB8fFxuICAgICAgICAgICAgICAgICFsb29rc0xpa2VBcHBsaWNhdGlvbkZvcm0oZGV0ZWN0ZWRGaWVsZHMsIGZvcm0sIHRoaXMub3B0aW9ucy53YXNBdXRvZmlsbGVkKGZvcm0pKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuaGFuZGxlZEZvcm1zLmFkZChmb3JtKTtcbiAgICAgICAgICAgIHRoaXMudHJhY2tlZFVybHMuYWRkKHdpbmRvdy5sb2NhdGlvbi5ocmVmKTtcbiAgICAgICAgICAgIGNvbnN0IHNuYXBzaG90ID0gYXdhaXQgYnVpbGRQYWdlU25hcHNob3Qoe1xuICAgICAgICAgICAgICAgIGNhcHR1cmVTY3JlZW5zaG90OiBzZXR0aW5ncy5jYXB0dXJlU2NyZWVuc2hvdEVuYWJsZWQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMub3B0aW9ucy5vblRyYWNrZWQoe1xuICAgICAgICAgICAgICAgIC4uLnNuYXBzaG90LFxuICAgICAgICAgICAgICAgIHNjcmFwZWRKb2I6IHRoaXMub3B0aW9ucy5nZXRTY3JhcGVkSm9iKCksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIHRoaXMucGVuZGluZ0Zvcm1zLmRlbGV0ZShmb3JtKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmV4cG9ydCBmdW5jdGlvbiBpc0xpa2VseVNlYXJjaE9yTG9naW5Gb3JtKGZvcm0sIHVybCkge1xuICAgIGNvbnN0IHVybFRleHQgPSB1cmwudG9Mb3dlckNhc2UoKTtcbiAgICBpZiAoLyhcXC98XFxiKShsb2dpbnxzaWduaW58c2lnbnVwfHJlZ2lzdGVyfHNlYXJjaCkoXFwvfFxcP3wjfFxcYikvLnRlc3QodXJsVGV4dCkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGNvbnN0IHRleHQgPSBbXG4gICAgICAgIGZvcm0uaWQsXG4gICAgICAgIGZvcm0uY2xhc3NOYW1lLFxuICAgICAgICBmb3JtLmdldEF0dHJpYnV0ZShcIm5hbWVcIiksXG4gICAgICAgIGZvcm0uZ2V0QXR0cmlidXRlKFwiYXJpYS1sYWJlbFwiKSxcbiAgICAgICAgZm9ybS5nZXRBdHRyaWJ1dGUoXCJhY3Rpb25cIiksXG4gICAgICAgIGZvcm0udGV4dENvbnRlbnQsXG4gICAgXVxuICAgICAgICAuZmlsdGVyKEJvb2xlYW4pXG4gICAgICAgIC5qb2luKFwiIFwiKVxuICAgICAgICAudG9Mb3dlckNhc2UoKTtcbiAgICBpZiAoQkxPQ0tFRF9GT1JNX0tFWVdPUkRTLnNvbWUoKGtleXdvcmQpID0+IHRleHQuaW5jbHVkZXMoa2V5d29yZCkpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBjb25zdCBpbnB1dHMgPSBBcnJheS5mcm9tKGZvcm0ucXVlcnlTZWxlY3RvckFsbChcImlucHV0XCIpKTtcbiAgICByZXR1cm4gaW5wdXRzLnNvbWUoKGlucHV0KSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGUgPSBpbnB1dC50eXBlLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBgJHtpbnB1dC5uYW1lfSAke2lucHV0LmlkfSAke2lucHV0LnBsYWNlaG9sZGVyfWAudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgcmV0dXJuIHR5cGUgPT09IFwic2VhcmNoXCIgfHwgbmFtZS5pbmNsdWRlcyhcInNlYXJjaFwiKTtcbiAgICB9KTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBsb29rc0xpa2VBcHBsaWNhdGlvbkZvcm0oZGV0ZWN0ZWRGaWVsZHMsIGZvcm0sIHdhc0F1dG9maWxsZWQgPSBmYWxzZSkge1xuICAgIGNvbnN0IGhpZ2hDb25maWRlbmNlQXBwbGljYXRpb25GaWVsZHMgPSBkZXRlY3RlZEZpZWxkcy5maWx0ZXIoKGZpZWxkKSA9PiBmaWVsZC5jb25maWRlbmNlID49IDAuMyAmJiBBUFBMSUNBVElPTl9GSUVMRF9UWVBFUy5oYXMoZmllbGQuZmllbGRUeXBlKSk7XG4gICAgaWYgKHdhc0F1dG9maWxsZWQgJiYgaGlnaENvbmZpZGVuY2VBcHBsaWNhdGlvbkZpZWxkcy5sZW5ndGggPj0gMikge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGhpZ2hDb25maWRlbmNlQXBwbGljYXRpb25GaWVsZHMubGVuZ3RoID49IDMpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGNvbnN0IGZvcm1UZXh0ID0gW1xuICAgICAgICBmb3JtLmlkLFxuICAgICAgICBmb3JtLmNsYXNzTmFtZSxcbiAgICAgICAgZm9ybS5nZXRBdHRyaWJ1dGUoXCJhY3Rpb25cIiksXG4gICAgICAgIGZvcm0udGV4dENvbnRlbnQsXG4gICAgXVxuICAgICAgICAuZmlsdGVyKEJvb2xlYW4pXG4gICAgICAgIC5qb2luKFwiIFwiKVxuICAgICAgICAudG9Mb3dlckNhc2UoKTtcbiAgICByZXR1cm4gKHdhc0F1dG9maWxsZWQgJiZcbiAgICAgICAgaGlnaENvbmZpZGVuY2VBcHBsaWNhdGlvbkZpZWxkcy5sZW5ndGggPiAwICYmXG4gICAgICAgIC9cXGIoYXBwbHl8YXBwbGljYXRpb258cmVzdW1lfGNvdmVyIGxldHRlcnxzdWJtaXQgYXBwbGljYXRpb24pXFxiLy50ZXN0KGZvcm1UZXh0KSk7XG59XG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdENvbXBhbnlIaW50KHNjcmFwZWRKb2IsIGhvc3QpIHtcbiAgICBpZiAoc2NyYXBlZEpvYj8uY29tcGFueSlcbiAgICAgICAgcmV0dXJuIHNjcmFwZWRKb2IuY29tcGFueTtcbiAgICByZXR1cm4gaG9zdC5yZXBsYWNlKC9ed3d3XFwuLywgXCJcIik7XG59XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuaW1wb3J0IHsgdXNlQ2FsbGJhY2ssIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5jb25zdCBRVUFMSUZJRURfUFJPTVBUID0gXCJJbiA0IHNlbnRlbmNlcywgZXhwbGFpbiB3aHkgSSdtIHF1YWxpZmllZCBmb3IgdGhpcyByb2xlLiBSZWZlcmVuY2UgMS0yIHNwZWNpZmljIGl0ZW1zIGZyb20gbXkgcHJvZmlsZSBhbmQgdGllIHRoZW0gdG8gdGhlIGpvYidzIHJlcXVpcmVtZW50cy4gTm8gZmx1ZmYuXCI7XG5jb25zdCBDT1ZFUl9MRVRURVJfUFJPTVBUID0gXCJEcmFmdCBvbmx5IHRoZSBPUEVOSU5HIFBBUkFHUkFQSCBvZiBhIGNvdmVyIGxldHRlciBmb3IgdGhpcyByb2xlLiAzLTUgc2VudGVuY2VzLiBIb29rIHRoZSByZWFkZXIgYnkgdHlpbmcgb25lIHNwZWNpZmljIGl0ZW0gZnJvbSBteSBwcm9maWxlIHRvIG9uZSBzcGVjaWZpYyBuZWVkIGZyb20gdGhlIGpvYi4gTm8gc2FsdXRhdGlvbiwgbm8gY2xvc2luZy5cIjtcbi8qKlxuICogVHJ1bmNhdGlvbiBjYXAgb24gdGhlIHNlZWQgcXVlcnktc3RyaW5nIHBhcmFtZXRlciBzbyB3ZSBkb24ndCBibG93IFVSTFxuICogbGltaXRzLiBTdHVkaW8gcmUtcmVuZGVycyB0aGUgZnVsbCB0ZXh0IG9uY2UgdGhlIHBhZ2UgbG9hZHMsIHNvIHRoaXMgaXNcbiAqIGp1c3QgZm9yIHRoZSBkZWVwLWxpbmsgcGF5bG9hZC5cbiAqL1xuZXhwb3J0IGNvbnN0IENPVkVSX0xFVFRFUl9TRUVEX01BWCA9IDUwMDtcbmV4cG9ydCBmdW5jdGlvbiBDaGF0UGFuZWwocHJvcHMpIHtcbiAgICBjb25zdCBbaW50ZW50LCBzZXRJbnRlbnRdID0gdXNlU3RhdGUoXCJmcmVlXCIpO1xuICAgIGNvbnN0IFtkcmFmdCwgc2V0RHJhZnRdID0gdXNlU3RhdGUoXCJcIik7XG4gICAgY29uc3QgW3N0cmVhbWluZywgc2V0U3RyZWFtaW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCBbb3V0cHV0LCBzZXRPdXRwdXRdID0gdXNlU3RhdGUoXCJcIik7XG4gICAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbY29tcGxldGVkLCBzZXRDb21wbGV0ZWRdID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IHJ1biA9IHVzZUNhbGxiYWNrKGFzeW5jIChwcm9tcHQsIGtpbmQpID0+IHtcbiAgICAgICAgaWYgKHN0cmVhbWluZylcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgc2V0U3RyZWFtaW5nKHRydWUpO1xuICAgICAgICBzZXRJbnRlbnQoa2luZCk7XG4gICAgICAgIHNldE91dHB1dChcIlwiKTtcbiAgICAgICAgc2V0RXJyb3IobnVsbCk7XG4gICAgICAgIHNldENvbXBsZXRlZChmYWxzZSk7XG4gICAgICAgIGNvbnN0IGNvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBwcm9wcy5vblN0cmVhbSh7XG4gICAgICAgICAgICAgICAgcHJvbXB0LFxuICAgICAgICAgICAgICAgIGludGVudDoga2luZCxcbiAgICAgICAgICAgICAgICBvblRva2VuOiAodG9rZW4pID0+IHNldE91dHB1dCgocHJldikgPT4gcHJldiArIHRva2VuKSxcbiAgICAgICAgICAgICAgICBzaWduYWw6IGNvbnRyb2xsZXIuc2lnbmFsLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzZXRDb21wbGV0ZWQodHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgc2V0RXJyb3IoZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFwiU29tZXRoaW5nIHdlbnQgd3JvbmcuXCIpO1xuICAgICAgICB9XG4gICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgc2V0U3RyZWFtaW5nKGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH0sIFtwcm9wcywgc3RyZWFtaW5nXSk7XG4gICAgY29uc3QgaGFuZGxlUXVhbGlmaWVkID0gKCkgPT4ge1xuICAgICAgICB2b2lkIHJ1bihRVUFMSUZJRURfUFJPTVBULCBcInF1YWxpZmllZFwiKTtcbiAgICB9O1xuICAgIGNvbnN0IGhhbmRsZUNvdmVyTGV0dGVyID0gKCkgPT4ge1xuICAgICAgICB2b2lkIHJ1bihDT1ZFUl9MRVRURVJfUFJPTVBULCBcImNvdmVyTGV0dGVyXCIpO1xuICAgIH07XG4gICAgY29uc3QgaGFuZGxlRnJlZVN1Ym1pdCA9IChldmVudCkgPT4ge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBjb25zdCB0cmltbWVkID0gZHJhZnQudHJpbSgpO1xuICAgICAgICBpZiAoIXRyaW1tZWQpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHZvaWQgcnVuKHRyaW1tZWQsIFwiZnJlZVwiKTtcbiAgICB9O1xuICAgIGNvbnN0IHNob3dDb3ZlckxldHRlckN0YSA9ICFzdHJlYW1pbmcgJiZcbiAgICAgICAgY29tcGxldGVkICYmXG4gICAgICAgIGludGVudCA9PT0gXCJjb3ZlckxldHRlclwiICYmXG4gICAgICAgIG91dHB1dC50cmltKCkubGVuZ3RoID4gMDtcbiAgICByZXR1cm4gKF9qc3hzKFwic2VjdGlvblwiLCB7IGNsYXNzTmFtZTogXCJjaGF0LXBhbmVsXCIsIFwiYXJpYS1sYWJlbFwiOiBcIkFJIGFzc2lzdGFudFwiLCBjaGlsZHJlbjogW19qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInNlY3Rpb24tdGl0bGVcIiwgY2hpbGRyZW46IFwiQUkgYXNzaXN0YW50XCIgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImNoYXQtc2VlZC1yb3dcIiwgY2hpbGRyZW46IFtfanN4KFwiYnV0dG9uXCIsIHsgdHlwZTogXCJidXR0b25cIiwgY2xhc3NOYW1lOiBcInNtYWxsLWJ1dHRvbiBzZWNvbmRhcnlcIiwgZGlzYWJsZWQ6IHN0cmVhbWluZywgb25DbGljazogaGFuZGxlUXVhbGlmaWVkLCBjaGlsZHJlbjogXCJXaHkgYW0gSSBxdWFsaWZpZWQ/XCIgfSksIF9qc3goXCJidXR0b25cIiwgeyB0eXBlOiBcImJ1dHRvblwiLCBjbGFzc05hbWU6IFwic21hbGwtYnV0dG9uIHNlY29uZGFyeVwiLCBkaXNhYmxlZDogc3RyZWFtaW5nLCBvbkNsaWNrOiBoYW5kbGVDb3ZlckxldHRlciwgY2hpbGRyZW46IFwiQ292ZXItbGV0dGVyIG9wZW5lclwiIH0pXSB9KSwgX2pzeHMoXCJmb3JtXCIsIHsgY2xhc3NOYW1lOiBcImNoYXQtaW5wdXQtcm93XCIsIG9uU3VibWl0OiBoYW5kbGVGcmVlU3VibWl0LCBjaGlsZHJlbjogW19qc3goXCJ0ZXh0YXJlYVwiLCB7IHZhbHVlOiBkcmFmdCwgb25DaGFuZ2U6IChldmVudCkgPT4gc2V0RHJhZnQoZXZlbnQudGFyZ2V0LnZhbHVlKSwgcGxhY2Vob2xkZXI6IFwiQXNrIGFueXRoaW5nIGFib3V0IHRoaXMgam9iXFx1MjAyNlwiLCByb3dzOiAyLCBkaXNhYmxlZDogc3RyZWFtaW5nLCBcImFyaWEtbGFiZWxcIjogXCJBc2sgdGhlIEFJIGFzc2lzdGFudFwiIH0pLCBfanN4KFwiYnV0dG9uXCIsIHsgdHlwZTogXCJzdWJtaXRcIiwgY2xhc3NOYW1lOiBcInNtYWxsLWJ1dHRvblwiLCBkaXNhYmxlZDogc3RyZWFtaW5nIHx8ICFkcmFmdC50cmltKCksIGNoaWxkcmVuOiBzdHJlYW1pbmcgJiYgaW50ZW50ID09PSBcImZyZWVcIiA/IFwi4oCmXCIgOiBcIlNlbmRcIiB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImNoYXQtcmVzdWx0XCIsIHJvbGU6IFwic3RhdHVzXCIsIFwiYXJpYS1saXZlXCI6IFwicG9saXRlXCIsIFwiYXJpYS1idXN5XCI6IHN0cmVhbWluZywgY2hpbGRyZW46IFtzdHJlYW1pbmcgJiYgb3V0cHV0Lmxlbmd0aCA9PT0gMCAmJiAoX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwiY2hhdC1zcGlubmVyXCIsIGNoaWxkcmVuOiBcIlRoaW5raW5nXFx1MjAyNlwiIH0pKSwgb3V0cHV0ICYmIF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcImNoYXQtb3V0cHV0XCIsIGNoaWxkcmVuOiBvdXRwdXQgfSksIGVycm9yICYmIChfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJzdGF0dXMtY2FyZCBlcnJvciBjaGF0LWVycm9yXCIsIHJvbGU6IFwiYWxlcnRcIiwgY2hpbGRyZW46IGVycm9yIH0pKSwgc2hvd0NvdmVyTGV0dGVyQ3RhICYmIChfanN4KFwiYnV0dG9uXCIsIHsgdHlwZTogXCJidXR0b25cIiwgY2xhc3NOYW1lOiBcInNtYWxsLWJ1dHRvbiBjaGF0LXVzZS1jdGFcIiwgb25DbGljazogKCkgPT4gcHJvcHMub25Vc2VJbkNvdmVyTGV0dGVyKG91dHB1dC50cmltKCkuc2xpY2UoMCwgQ09WRVJfTEVUVEVSX1NFRURfTUFYKSksIGNoaWxkcmVuOiBcIlVzZSBpbiBjb3ZlciBsZXR0ZXJcIiB9KSldIH0pXSB9KSk7XG59XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuaW1wb3J0IHsgdXNlTWVtbywgdXNlUmVmLCB1c2VTdGF0ZSwgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IENoYXRQYW5lbCB9IGZyb20gXCIuL2NoYXQtcGFuZWxcIjtcbmNvbnN0IEFDVElPTl9MQUJFTFMgPSB7XG4gICAgdGFpbG9yOiBcIlRhaWxvclwiLFxuICAgIGNvdmVyTGV0dGVyOiBcIkNvdmVyIExldHRlclwiLFxuICAgIHNhdmU6IFwiU2F2ZVwiLFxuICAgIGF1dG9GaWxsOiBcIkF1dG8tZmlsbFwiLFxufTtcbmV4cG9ydCBmdW5jdGlvbiBKb2JQYWdlU2lkZWJhcihwcm9wcykge1xuICAgIGNvbnN0IFthY3RpdmVBY3Rpb24sIHNldEFjdGl2ZUFjdGlvbl0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbYWN0aW9uRmVlZGJhY2ssIHNldEFjdGlvbkZlZWRiYWNrXSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtub3RpY2UsIHNldE5vdGljZV0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbcXVlcnksIHNldFF1ZXJ5XSA9IHVzZVN0YXRlKFwiXCIpO1xuICAgIGNvbnN0IFthbnN3ZXJzLCBzZXRBbnN3ZXJzXSA9IHVzZVN0YXRlKFtdKTtcbiAgICBjb25zdCBbc2VhcmNoaW5nLCBzZXRTZWFyY2hpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IFtzZWFyY2hFcnJvciwgc2V0U2VhcmNoRXJyb3JdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgZHJhZ1N0YXRlID0gdXNlUmVmKG51bGwpO1xuICAgIGNvbnN0IHNjb3JlVmFsdWUgPSBwcm9wcy5zY29yZT8ub3ZlcmFsbCA/PyBudWxsO1xuICAgIGNvbnN0IGpvYk1ldGEgPSB1c2VNZW1vKCgpID0+IFtwcm9wcy5zY3JhcGVkSm9iLmNvbXBhbnksIHByb3BzLnNjcmFwZWRKb2IubG9jYXRpb25dXG4gICAgICAgIC5maWx0ZXIoQm9vbGVhbilcbiAgICAgICAgLmpvaW4oXCIgLyBcIiksIFtwcm9wcy5zY3JhcGVkSm9iLmNvbXBhbnksIHByb3BzLnNjcmFwZWRKb2IubG9jYXRpb25dKTtcbiAgICBjb25zdCBzaWRlYmFyQ2xhc3NOYW1lID0gYHNsb3RoaW5nLXNpZGViYXIgZG9jay0ke3Byb3BzLmxheW91dC5kb2NrfWA7XG4gICAgZnVuY3Rpb24gc2lkZWJhclN0eWxlKCkge1xuICAgICAgICBpZiAocHJvcHMubGF5b3V0LmRvY2sgPT09IFwibGVmdFwiKSB7XG4gICAgICAgICAgICByZXR1cm4geyBsZWZ0OiAwLCByaWdodDogXCJhdXRvXCIgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocHJvcHMubGF5b3V0LmRvY2sgPT09IFwiZmxvYXRpbmdcIiAmJiBwcm9wcy5sYXlvdXQucG9zaXRpb24pIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgbGVmdDogYCR7cHJvcHMubGF5b3V0LnBvc2l0aW9uLnh9cHhgLFxuICAgICAgICAgICAgICAgIHJpZ2h0OiBcImF1dG9cIixcbiAgICAgICAgICAgICAgICB0b3A6IGAke3Byb3BzLmxheW91dC5wb3NpdGlvbi55fXB4YCxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgZnVuY3Rpb24gc3RhcnREcmFnKGV2ZW50KSB7XG4gICAgICAgIGlmIChldmVudC5idXR0b24gIT09IDApXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgaWYgKHRhcmdldC5jbG9zZXN0KFwiYnV0dG9uLCBpbnB1dCwgdGV4dGFyZWEsIHNlbGVjdCwgYVwiKSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY29uc3Qgc2lkZWJhciA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuY2xvc2VzdChcIi5zbG90aGluZy1zaWRlYmFyXCIpO1xuICAgICAgICBpZiAoIXNpZGViYXIpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNvbnN0IHJlY3QgPSBzaWRlYmFyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBjb25zdCBuZXh0UG9zaXRpb24gPSBjbGFtcFNpZGViYXJQb3NpdGlvbihyZWN0LmxlZnQsIHJlY3QudG9wLCByZWN0LndpZHRoLCByZWN0LmhlaWdodCk7XG4gICAgICAgIHByb3BzLm9uTGF5b3V0Q2hhbmdlKHsgZG9jazogXCJmbG9hdGluZ1wiLCBwb3NpdGlvbjogbmV4dFBvc2l0aW9uIH0pO1xuICAgICAgICBkcmFnU3RhdGUuY3VycmVudCA9IHtcbiAgICAgICAgICAgIHBvaW50ZXJJZDogZXZlbnQucG9pbnRlcklkLFxuICAgICAgICAgICAgc3RhcnRYOiBldmVudC5jbGllbnRYLFxuICAgICAgICAgICAgc3RhcnRZOiBldmVudC5jbGllbnRZLFxuICAgICAgICAgICAgb3JpZ2luWDogbmV4dFBvc2l0aW9uLngsXG4gICAgICAgICAgICBvcmlnaW5ZOiBuZXh0UG9zaXRpb24ueSxcbiAgICAgICAgICAgIHdpZHRoOiByZWN0LndpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiByZWN0LmhlaWdodCxcbiAgICAgICAgfTtcbiAgICAgICAgZXZlbnQuY3VycmVudFRhcmdldC5zZXRQb2ludGVyQ2FwdHVyZShldmVudC5wb2ludGVySWQpO1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBtb3ZlRHJhZyhldmVudCkge1xuICAgICAgICBjb25zdCBkcmFnID0gZHJhZ1N0YXRlLmN1cnJlbnQ7XG4gICAgICAgIGlmICghZHJhZyB8fCBkcmFnLnBvaW50ZXJJZCAhPT0gZXZlbnQucG9pbnRlcklkKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBjb25zdCB4ID0gZHJhZy5vcmlnaW5YICsgZXZlbnQuY2xpZW50WCAtIGRyYWcuc3RhcnRYO1xuICAgICAgICBjb25zdCB5ID0gZHJhZy5vcmlnaW5ZICsgZXZlbnQuY2xpZW50WSAtIGRyYWcuc3RhcnRZO1xuICAgICAgICBwcm9wcy5vbkxheW91dENoYW5nZSh7XG4gICAgICAgICAgICBkb2NrOiBcImZsb2F0aW5nXCIsXG4gICAgICAgICAgICBwb3NpdGlvbjogY2xhbXBTaWRlYmFyUG9zaXRpb24oeCwgeSwgZHJhZy53aWR0aCwgZHJhZy5oZWlnaHQpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZW5kRHJhZyhldmVudCkge1xuICAgICAgICBjb25zdCBkcmFnID0gZHJhZ1N0YXRlLmN1cnJlbnQ7XG4gICAgICAgIGlmICghZHJhZyB8fCBkcmFnLnBvaW50ZXJJZCAhPT0gZXZlbnQucG9pbnRlcklkKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBkcmFnU3RhdGUuY3VycmVudCA9IG51bGw7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBldmVudC5jdXJyZW50VGFyZ2V0LnJlbGVhc2VQb2ludGVyQ2FwdHVyZShldmVudC5wb2ludGVySWQpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIHtcbiAgICAgICAgICAgIC8vIFRoZSBicm93c2VyIG1heSByZWxlYXNlIGNhcHR1cmUgZmlyc3QgaWYgdGhlIHBvaW50ZXIgaXMgY2FuY2VsZWQuXG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gZmxvYXRBdEN1cnJlbnRQb3NpdGlvbihldmVudCkge1xuICAgICAgICBjb25zdCBzaWRlYmFyID0gZXZlbnQuY3VycmVudFRhcmdldC5jbG9zZXN0KFwiLnNsb3RoaW5nLXNpZGViYXJcIik7XG4gICAgICAgIGlmICghc2lkZWJhcilcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY29uc3QgcmVjdCA9IHNpZGViYXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIHByb3BzLm9uTGF5b3V0Q2hhbmdlKHtcbiAgICAgICAgICAgIGRvY2s6IFwiZmxvYXRpbmdcIixcbiAgICAgICAgICAgIHBvc2l0aW9uOiBjbGFtcFNpZGViYXJQb3NpdGlvbihyZWN0LmxlZnQsIHJlY3QudG9wLCByZWN0LndpZHRoLCByZWN0LmhlaWdodCksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBhc3luYyBmdW5jdGlvbiBydW5BY3Rpb24oYWN0aW9uLCBjYWxsYmFjaykge1xuICAgICAgICBzZXRBY3RpdmVBY3Rpb24oYWN0aW9uKTtcbiAgICAgICAgc2V0QWN0aW9uRmVlZGJhY2sobnVsbCk7XG4gICAgICAgIHNldE5vdGljZShudWxsKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IGNhbGxiYWNrKCk7XG4gICAgICAgICAgICBzZXRBY3Rpb25GZWVkYmFjayh7XG4gICAgICAgICAgICAgICAgYWN0aW9uLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBhY3Rpb24gPT09IFwiYXV0b0ZpbGxcIiA/IFwiRmllbGRzIHVwZGF0ZWRcIiA6IFwiRG9uZVwiLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBzZXROb3RpY2Uoe1xuICAgICAgICAgICAgICAgIGtpbmQ6IFwiZXJyb3JcIixcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnJvci5tZXNzYWdlIHx8IGAke0FDVElPTl9MQUJFTFNbYWN0aW9uXX0gZmFpbGVkLmAsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIHNldEFjdGl2ZUFjdGlvbihudWxsKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBhc3luYyBmdW5jdGlvbiBoYW5kbGVTZWFyY2goZXZlbnQpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgY29uc3QgdHJpbW1lZCA9IHF1ZXJ5LnRyaW0oKTtcbiAgICAgICAgaWYgKCF0cmltbWVkKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBzZXRTZWFyY2hpbmcodHJ1ZSk7XG4gICAgICAgIHNldFNlYXJjaEVycm9yKG51bGwpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgc2V0QW5zd2Vycyhhd2FpdCBwcm9wcy5vblNlYXJjaEFuc3dlcnModHJpbW1lZCkpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgc2V0U2VhcmNoRXJyb3IoZXJyb3IubWVzc2FnZSB8fCBcIkFuc3dlciBzZWFyY2ggZmFpbGVkLlwiKTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIHNldFNlYXJjaGluZyhmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgYXN5bmMgZnVuY3Rpb24gY29weUFuc3dlcihhbnN3ZXIpIHtcbiAgICAgICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQoYW5zd2VyLmFuc3dlcik7XG4gICAgICAgIHNldE5vdGljZSh7IGtpbmQ6IFwic3VjY2Vzc1wiLCBtZXNzYWdlOiBcIkFuc3dlciBjb3BpZWQuXCIgfSk7XG4gICAgfVxuICAgIGlmIChwcm9wcy5sYXlvdXQuY29sbGFwc2VkKSB7XG4gICAgICAgIHJldHVybiAoX2pzeChcImFzaWRlXCIsIHsgY2xhc3NOYW1lOiBzaWRlYmFyQ2xhc3NOYW1lLCBzdHlsZTogc2lkZWJhclN0eWxlKCksIFwiYXJpYS1sYWJlbFwiOiBcIlNsb3RoaW5nIGpvYiBzaWRlYmFyXCIsIGNoaWxkcmVuOiBfanN4cyhcImJ1dHRvblwiLCB7IGNsYXNzTmFtZTogXCJyYWlsXCIsIHR5cGU6IFwiYnV0dG9uXCIsIG9uQ2xpY2s6ICgpID0+IHByb3BzLm9uTGF5b3V0Q2hhbmdlKHsgY29sbGFwc2VkOiBmYWxzZSB9KSwgXCJhcmlhLWxhYmVsXCI6IFwiT3BlbiBTbG90aGluZyBzaWRlYmFyXCIsIHRpdGxlOiBcIk9wZW4gU2xvdGhpbmcgc2lkZWJhclwiLCBjaGlsZHJlbjogW19qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInJhaWwtc2NvcmVcIiwgY2hpbGRyZW46IHNjb3JlVmFsdWUgPz8gXCItLVwiIH0pLCBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJyYWlsLWxhYmVsXCIsIGNoaWxkcmVuOiBcIlNsb3RoaW5nXCIgfSldIH0pIH0pKTtcbiAgICB9XG4gICAgcmV0dXJuIChfanN4KFwiYXNpZGVcIiwgeyBjbGFzc05hbWU6IHNpZGViYXJDbGFzc05hbWUsIHN0eWxlOiBzaWRlYmFyU3R5bGUoKSwgXCJhcmlhLWxhYmVsXCI6IFwiU2xvdGhpbmcgam9iIHNpZGViYXJcIiwgY2hpbGRyZW46IF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInBhbmVsXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJoZWFkZXJcIiwgeyBjbGFzc05hbWU6IFwiaGVhZGVyXCIsIG9uUG9pbnRlckRvd246IHN0YXJ0RHJhZywgb25Qb2ludGVyTW92ZTogbW92ZURyYWcsIG9uUG9pbnRlclVwOiBlbmREcmFnLCBvblBvaW50ZXJDYW5jZWw6IGVuZERyYWcsIHRpdGxlOiBcIkRyYWcgdG8gbW92ZVwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ3b3Jrc3BhY2UtYnJhbmQtcm93XCIsIGNoaWxkcmVuOiBbX2pzeChcImltZ1wiLCB7IGNsYXNzTmFtZTogXCJ3b3Jrc3BhY2UtbWFya1wiLCBzcmM6IGNocm9tZS5ydW50aW1lLmdldFVSTChcImJyYW5kL3Nsb3RoaW5nLW1hcmsucG5nXCIpLCBhbHQ6IFwiXCIgfSksIF9qc3goXCJzcGFuXCIsIHsgY2hpbGRyZW46IFwiU2xvdGhpbmdcIiB9KV0gfSksIF9qc3goXCJoMlwiLCB7IGNsYXNzTmFtZTogXCJ0aXRsZVwiLCBjaGlsZHJlbjogcHJvcHMuc2NyYXBlZEpvYi50aXRsZSB9KSwgX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwiY29tcGFueVwiLCBjaGlsZHJlbjogam9iTWV0YSB8fCBwcm9wcy5zY3JhcGVkSm9iLmNvbXBhbnkgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJpY29uLXJvd1wiLCBjaGlsZHJlbjogW19qc3goXCJidXR0b25cIiwgeyBjbGFzc05hbWU6IFwiaWNvbi1idXR0b25cIiwgdHlwZTogXCJidXR0b25cIiwgb25DbGljazogKCkgPT4gcHJvcHMub25MYXlvdXRDaGFuZ2UoeyBkb2NrOiBcImxlZnRcIiB9KSwgXCJhcmlhLWxhYmVsXCI6IFwiRG9jayBTbG90aGluZyBzaWRlYmFyIG9uIHRoZSBsZWZ0XCIsIHRpdGxlOiBcIkRvY2sgbGVmdFwiLCBjaGlsZHJlbjogXCJcXHUyMDM5XCIgfSksIF9qc3goXCJidXR0b25cIiwgeyBjbGFzc05hbWU6IFwiaWNvbi1idXR0b25cIiwgdHlwZTogXCJidXR0b25cIiwgb25DbGljazogKCkgPT4gcHJvcHMub25MYXlvdXRDaGFuZ2UoeyBkb2NrOiBcInJpZ2h0XCIgfSksIFwiYXJpYS1sYWJlbFwiOiBcIkRvY2sgU2xvdGhpbmcgc2lkZWJhciBvbiB0aGUgcmlnaHRcIiwgdGl0bGU6IFwiRG9jayByaWdodFwiLCBjaGlsZHJlbjogXCJcXHUyMDNBXCIgfSksIF9qc3goXCJidXR0b25cIiwgeyBjbGFzc05hbWU6IFwiaWNvbi1idXR0b25cIiwgdHlwZTogXCJidXR0b25cIiwgb25DbGljazogZmxvYXRBdEN1cnJlbnRQb3NpdGlvbiwgXCJhcmlhLWxhYmVsXCI6IFwiRmxvYXQgU2xvdGhpbmcgc2lkZWJhclwiLCB0aXRsZTogXCJGbG9hdFwiLCBjaGlsZHJlbjogXCJcXHUyNUExXCIgfSksIF9qc3goXCJidXR0b25cIiwgeyBjbGFzc05hbWU6IFwiaWNvbi1idXR0b25cIiwgdHlwZTogXCJidXR0b25cIiwgb25DbGljazogKCkgPT4gcHJvcHMub25MYXlvdXRDaGFuZ2UoeyBjb2xsYXBzZWQ6IHRydWUgfSksIFwiYXJpYS1sYWJlbFwiOiBcIkNvbGxhcHNlIFNsb3RoaW5nIHNpZGViYXJcIiwgdGl0bGU6IFwiQ29sbGFwc2VcIiwgY2hpbGRyZW46IFwiLVwiIH0pLCBfanN4KFwiYnV0dG9uXCIsIHsgY2xhc3NOYW1lOiBcImljb24tYnV0dG9uXCIsIHR5cGU6IFwiYnV0dG9uXCIsIG9uQ2xpY2s6ICgpID0+IHZvaWQgcHJvcHMub25EaXNtaXNzKCksIFwiYXJpYS1sYWJlbFwiOiBcIkRpc21pc3MgU2xvdGhpbmcgc2lkZWJhciBmb3IgdGhpcyBkb21haW5cIiwgdGl0bGU6IFwiRGlzbWlzcyBmb3IgdGhpcyBkb21haW5cIiwgY2hpbGRyZW46IFwiXFx1MDBEN1wiIH0pXSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJvZHlcIiwgY2hpbGRyZW46IFtfanN4cyhcInNlY3Rpb25cIiwgeyBjbGFzc05hbWU6IFwic2NvcmUtY2FyZFwiLCBcImFyaWEtbGFiZWxcIjogXCJNYXRjaCBzY29yZVwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2hpbGRyZW46IFtfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJzY29yZS1sYWJlbFwiLCBjaGlsZHJlbjogc2NvcmVWYWx1ZSA9PT0gbnVsbCA/IFwiUHJvZmlsZSBuZWVkZWRcIiA6IFwiTWF0Y2ggc2NvcmVcIiB9KSwgX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwic2NvcmUtbm90ZVwiLCBjaGlsZHJlbjogc2NvcmVWYWx1ZSA9PT0gbnVsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBcIkNvbm5lY3QgeW91ciBwcm9maWxlIHRvIHNjb3JlIHRoaXMgam9iLlwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFwiQmFzZWQgb24geW91ciBwcm9maWxlIGFuZCB0aGlzIGpvYiBkZXNjcmlwdGlvbi5cIiB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInNjb3JlLXBpbGxcIiwgXCJhcmlhLWxhYmVsXCI6IFwiTWF0Y2ggc2NvcmUgdmFsdWVcIiwgY2hpbGRyZW46IFtfanN4KFwic3BhblwiLCB7IGNoaWxkcmVuOiBzY29yZVZhbHVlID8/IFwiLS1cIiB9KSwgc2NvcmVWYWx1ZSAhPT0gbnVsbCAmJiBfanN4KFwic21hbGxcIiwgeyBjaGlsZHJlbjogXCIvMTAwXCIgfSldIH0pXSB9KSwgX2pzeHMoXCJzZWN0aW9uXCIsIHsgY2xhc3NOYW1lOiBcImFjdGlvbnNcIiwgXCJhcmlhLWxhYmVsXCI6IFwiSm9iIGFjdGlvbnNcIiwgY2hpbGRyZW46IFtfanN4KEFjdGlvbkJ1dHRvbiwgeyBsYWJlbDogXCJUYWlsb3IgcmVzdW1lXCIsIGFjdGl2ZUxhYmVsOiBcIlRhaWxvcmluZy4uLlwiLCBhY3RpdmU6IGFjdGl2ZUFjdGlvbiA9PT0gXCJ0YWlsb3JcIiwgZmVlZGJhY2s6IGFjdGlvbkZlZWRiYWNrPy5hY3Rpb24gPT09IFwidGFpbG9yXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IGFjdGlvbkZlZWRiYWNrLmxhYmVsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiB1bmRlZmluZWQsIGRpc2FibGVkOiBhY3RpdmVBY3Rpb24gIT09IG51bGwsIHByaW1hcnk6IHRydWUsIG9uQ2xpY2s6ICgpID0+IHJ1bkFjdGlvbihcInRhaWxvclwiLCBwcm9wcy5vblRhaWxvcikgfSksIF9qc3goQWN0aW9uQnV0dG9uLCB7IGxhYmVsOiBcIkNvdmVyIGxldHRlclwiLCBhY3RpdmVMYWJlbDogXCJHZW5lcmF0aW5nLi4uXCIsIGFjdGl2ZTogYWN0aXZlQWN0aW9uID09PSBcImNvdmVyTGV0dGVyXCIsIGZlZWRiYWNrOiBhY3Rpb25GZWVkYmFjaz8uYWN0aW9uID09PSBcImNvdmVyTGV0dGVyXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IGFjdGlvbkZlZWRiYWNrLmxhYmVsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiB1bmRlZmluZWQsIGRpc2FibGVkOiBhY3RpdmVBY3Rpb24gIT09IG51bGwsIG9uQ2xpY2s6ICgpID0+IHJ1bkFjdGlvbihcImNvdmVyTGV0dGVyXCIsIHByb3BzLm9uQ292ZXJMZXR0ZXIpIH0pLCBfanN4KEFjdGlvbkJ1dHRvbiwgeyBsYWJlbDogXCJTYXZlIGpvYlwiLCBhY3RpdmVMYWJlbDogXCJTYXZpbmcuLi5cIiwgYWN0aXZlOiBhY3RpdmVBY3Rpb24gPT09IFwic2F2ZVwiLCBmZWVkYmFjazogYWN0aW9uRmVlZGJhY2s/LmFjdGlvbiA9PT0gXCJzYXZlXCIgPyBcIlNhdmVkXCIgOiB1bmRlZmluZWQsIGRpc2FibGVkOiBhY3RpdmVBY3Rpb24gIT09IG51bGwsIG9uQ2xpY2s6ICgpID0+IHJ1bkFjdGlvbihcInNhdmVcIiwgcHJvcHMub25TYXZlKSB9KSwgX2pzeChBY3Rpb25CdXR0b24sIHsgbGFiZWw6IHByb3BzLmRldGVjdGVkRmllbGRDb3VudCA+IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IGBBdXRvLWZpbGwgJHtwcm9wcy5kZXRlY3RlZEZpZWxkQ291bnR9IGZpZWxkc2BcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFwiQXV0by1maWxsXCIsIGFjdGl2ZUxhYmVsOiBcIkZpbGxpbmcuLi5cIiwgYWN0aXZlOiBhY3RpdmVBY3Rpb24gPT09IFwiYXV0b0ZpbGxcIiwgZmVlZGJhY2s6IGFjdGlvbkZlZWRiYWNrPy5hY3Rpb24gPT09IFwiYXV0b0ZpbGxcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gYWN0aW9uRmVlZGJhY2subGFiZWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IHVuZGVmaW5lZCwgZGlzYWJsZWQ6IGFjdGl2ZUFjdGlvbiAhPT0gbnVsbCB8fCBwcm9wcy5kZXRlY3RlZEZpZWxkQ291bnQgPT09IDAsIG9uQ2xpY2s6ICgpID0+IHJ1bkFjdGlvbihcImF1dG9GaWxsXCIsIHByb3BzLm9uQXV0b0ZpbGwpIH0pXSB9KSwgbm90aWNlPy5raW5kID09PSBcImVycm9yXCIgJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IGBzdGF0dXMtY2FyZCAke25vdGljZS5raW5kfWAsIHJvbGU6IFwic3RhdHVzXCIsIGNoaWxkcmVuOiBub3RpY2UubWVzc2FnZSB9KSksIF9qc3hzKFwiZGV0YWlsc1wiLCB7IGNsYXNzTmFtZTogXCJ1dGlsaXR5LXNlY3Rpb25cIiwgY2hpbGRyZW46IFtfanN4KFwic3VtbWFyeVwiLCB7IGNoaWxkcmVuOiBcIkFJIGFzc2lzdGFudFwiIH0pLCBfanN4KENoYXRQYW5lbCwgeyBvblN0cmVhbTogcHJvcHMub25DaGF0U3RyZWFtLCBvblVzZUluQ292ZXJMZXR0ZXI6IHByb3BzLm9uVXNlSW5Db3ZlckxldHRlciB9KV0gfSksIF9qc3hzKFwiZGV0YWlsc1wiLCB7IGNsYXNzTmFtZTogXCJ1dGlsaXR5LXNlY3Rpb25cIiwgY2hpbGRyZW46IFtfanN4KFwic3VtbWFyeVwiLCB7IGNoaWxkcmVuOiBcIkFuc3dlciBiYW5rXCIgfSksIF9qc3hzKFwic2VjdGlvblwiLCB7IGNsYXNzTmFtZTogXCJhbnN3ZXItYmFua1wiLCBcImFyaWEtbGFiZWxcIjogXCJBbnN3ZXIgYmFuayBzZWFyY2hcIiwgY2hpbGRyZW46IFtfanN4cyhcImZvcm1cIiwgeyBjbGFzc05hbWU6IFwic2VhcmNoLXJvd1wiLCBvblN1Ym1pdDogaGFuZGxlU2VhcmNoLCBjaGlsZHJlbjogW19qc3goXCJpbnB1dFwiLCB7IHZhbHVlOiBxdWVyeSwgb25DaGFuZ2U6IChldmVudCkgPT4gc2V0UXVlcnkoZXZlbnQudGFyZ2V0LnZhbHVlKSwgcGxhY2Vob2xkZXI6IFwiU2VhcmNoIHNhdmVkIGFuc3dlcnNcIiwgXCJhcmlhLWxhYmVsXCI6IFwiU2VhcmNoIHNhdmVkIGFuc3dlcnNcIiB9KSwgX2pzeChcImJ1dHRvblwiLCB7IHR5cGU6IFwic3VibWl0XCIsIGRpc2FibGVkOiBzZWFyY2hpbmcgfHwgIXF1ZXJ5LnRyaW0oKSwgY2hpbGRyZW46IHNlYXJjaGluZyA/IFwiLi4uXCIgOiBcIlNlYXJjaFwiIH0pXSB9KSwgc2VhcmNoRXJyb3IgJiYgKF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInN0YXR1cy1jYXJkIGVycm9yXCIsIGNoaWxkcmVuOiBzZWFyY2hFcnJvciB9KSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicmVzdWx0c1wiLCBjaGlsZHJlbjogYW5zd2Vycy5tYXAoKGFuc3dlcikgPT4gKF9qc3hzKFwiYXJ0aWNsZVwiLCB7IGNsYXNzTmFtZTogXCJyZXN1bHRcIiwgY2hpbGRyZW46IFtfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJyZXN1bHQtcXVlc3Rpb25cIiwgY2hpbGRyZW46IGFuc3dlci5xdWVzdGlvbiB9KSwgX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwicmVzdWx0LWFuc3dlclwiLCBjaGlsZHJlbjogYW5zd2VyLmFuc3dlciB9KSwgX2pzeHMoXCJwXCIsIHsgY2xhc3NOYW1lOiBcInJlc3VsdC1tZXRhXCIsIGNoaWxkcmVuOiBbTWF0aC5yb3VuZChhbnN3ZXIuc2ltaWxhcml0eSAqIDEwMCksIFwiJSBtYXRjaCAvIHVzZWRcIiwgXCIgXCIsIGFuc3dlci50aW1lc1VzZWQsIFwiIHRpbWVzXCJdIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJyZXN1bHQtYWN0aW9uc1wiLCBjaGlsZHJlbjogW19qc3goXCJidXR0b25cIiwgeyBjbGFzc05hbWU6IFwic21hbGwtYnV0dG9uIHNlY29uZGFyeVwiLCB0eXBlOiBcImJ1dHRvblwiLCBvbkNsaWNrOiAoKSA9PiBjb3B5QW5zd2VyKGFuc3dlciksIGNoaWxkcmVuOiBcIkNvcHlcIiB9KSwgX2pzeChcImJ1dHRvblwiLCB7IGNsYXNzTmFtZTogXCJzbWFsbC1idXR0b25cIiwgdHlwZTogXCJidXR0b25cIiwgb25DbGljazogKCkgPT4gdm9pZCBwcm9wcy5vbkFwcGx5QW5zd2VyKGFuc3dlciksIGNoaWxkcmVuOiBcIkFwcGx5XCIgfSldIH0pXSB9LCBhbnN3ZXIuaWQpKSkgfSldIH0pXSB9KV0gfSldIH0pIH0pKTtcbn1cbmZ1bmN0aW9uIGNsYW1wU2lkZWJhclBvc2l0aW9uKHgsIHksIHdpZHRoLCBoZWlnaHQpIHtcbiAgICBjb25zdCBtYXJnaW4gPSA4O1xuICAgIGNvbnN0IG1heFggPSBNYXRoLm1heChtYXJnaW4sIHdpbmRvdy5pbm5lcldpZHRoIC0gd2lkdGggLSBtYXJnaW4pO1xuICAgIGNvbnN0IG1heFkgPSBNYXRoLm1heChtYXJnaW4sIHdpbmRvdy5pbm5lckhlaWdodCAtIGhlaWdodCAtIG1hcmdpbik7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgeDogTWF0aC5taW4oTWF0aC5tYXgoeCwgbWFyZ2luKSwgbWF4WCksXG4gICAgICAgIHk6IE1hdGgubWluKE1hdGgubWF4KHksIG1hcmdpbiksIG1heFkpLFxuICAgIH07XG59XG5mdW5jdGlvbiBBY3Rpb25CdXR0b24oeyBsYWJlbCwgYWN0aXZlTGFiZWwsIGFjdGl2ZSwgZmVlZGJhY2ssIGRpc2FibGVkLCBwcmltYXJ5LCBvbkNsaWNrLCB9KSB7XG4gICAgcmV0dXJuIChfanN4cyhcImJ1dHRvblwiLCB7IGNsYXNzTmFtZTogYGFjdGlvbi1idXR0b24ke3ByaW1hcnkgPyBcIiBwcmltYXJ5XCIgOiBcIlwifWAsIHR5cGU6IFwiYnV0dG9uXCIsIGRpc2FibGVkOiBkaXNhYmxlZCwgb25DbGljazogb25DbGljaywgY2hpbGRyZW46IFtfanN4KFwic3BhblwiLCB7IGNoaWxkcmVuOiBhY3RpdmUgPyBhY3RpdmVMYWJlbCA6IGZlZWRiYWNrIHx8IGxhYmVsIH0pLCAoYWN0aXZlIHx8IGZlZWRiYWNrKSAmJiAoX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwiYWN0aW9uLXN0YXR1c1wiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiLCBjaGlsZHJlbjogZmVlZGJhY2sgPyBcIkRvbmVcIiA6IFwiV29ya2luZ1wiIH0pKV0gfSkpO1xufVxuIiwiaW1wb3J0IHsgc2NvcmVSZXN1bWUgfSBmcm9tIFwiQHNsb3RoaW5nL3NoYXJlZC9zY29yaW5nXCI7XG5leHBvcnQgZnVuY3Rpb24gc2NyYXBlZEpvYlRvSm9iRGVzY3JpcHRpb24oam9iLCBjcmVhdGVkQXQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBpZDogam9iLnNvdXJjZUpvYklkIHx8IGpvYi51cmwsXG4gICAgICAgIHRpdGxlOiBqb2IudGl0bGUsXG4gICAgICAgIGNvbXBhbnk6IGpvYi5jb21wYW55LFxuICAgICAgICBsb2NhdGlvbjogam9iLmxvY2F0aW9uLFxuICAgICAgICB0eXBlOiBqb2IudHlwZSxcbiAgICAgICAgcmVtb3RlOiBqb2IucmVtb3RlLFxuICAgICAgICBzYWxhcnk6IGpvYi5zYWxhcnksXG4gICAgICAgIGRlc2NyaXB0aW9uOiBqb2IuZGVzY3JpcHRpb24sXG4gICAgICAgIHJlcXVpcmVtZW50czogam9iLnJlcXVpcmVtZW50cyB8fCBbXSxcbiAgICAgICAgcmVzcG9uc2liaWxpdGllczogam9iLnJlc3BvbnNpYmlsaXRpZXMgfHwgW10sXG4gICAgICAgIGtleXdvcmRzOiBqb2Iua2V5d29yZHMgfHwgW10sXG4gICAgICAgIHVybDogam9iLnVybCxcbiAgICAgICAgZGVhZGxpbmU6IGpvYi5kZWFkbGluZSxcbiAgICAgICAgY3JlYXRlZEF0LFxuICAgIH07XG59XG5leHBvcnQgZnVuY3Rpb24gY29tcHV0ZUpvYk1hdGNoU2NvcmUocHJvZmlsZSwgam9iKSB7XG4gICAgaWYgKCFwcm9maWxlIHx8ICFqb2IpXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIHJldHVybiBzY29yZVJlc3VtZSh7XG4gICAgICAgIHByb2ZpbGUsXG4gICAgICAgIHJhd1RleHQ6IHByb2ZpbGUucmF3VGV4dCxcbiAgICAgICAgam9iOiBzY3JhcGVkSm9iVG9Kb2JEZXNjcmlwdGlvbihqb2IpLFxuICAgIH0pO1xufVxuIiwiY29uc3QgRElTTUlTU0VEX0RPTUFJTlNfS0VZID0gXCJzbG90aGluZzpzaWRlYmFyOmRpc21pc3NlZERvbWFpbnNcIjtcbmNvbnN0IExBWU9VVF9CWV9ET01BSU5fS0VZID0gXCJzbG90aGluZzpzaWRlYmFyOmxheW91dEJ5RG9tYWluXCI7XG5leHBvcnQgY29uc3QgREVGQVVMVF9TSURFQkFSX0xBWU9VVCA9IHtcbiAgICBkb2NrOiBcInJpZ2h0XCIsXG4gICAgcG9zaXRpb246IG51bGwsXG4gICAgY29sbGFwc2VkOiBmYWxzZSxcbn07XG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplU2lkZWJhckRvbWFpbihob3N0bmFtZSkge1xuICAgIHJldHVybiBob3N0bmFtZVxuICAgICAgICAudHJpbSgpXG4gICAgICAgIC50b0xvd2VyQ2FzZSgpXG4gICAgICAgIC5yZXBsYWNlKC9ed3d3XFwuLywgXCJcIik7XG59XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0RGlzbWlzc2VkU2lkZWJhckRvbWFpbnMoKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChESVNNSVNTRURfRE9NQUlOU19LRVksIChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gcmVzdWx0W0RJU01JU1NFRF9ET01BSU5TX0tFWV07XG4gICAgICAgICAgICByZXNvbHZlKEFycmF5LmlzQXJyYXkodmFsdWUpID8gdmFsdWUuZmlsdGVyKGlzU3RyaW5nKSA6IFtdKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaXNTaWRlYmFyRGlzbWlzc2VkRm9yRG9tYWluKGhvc3RuYW1lID0gd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lKSB7XG4gICAgY29uc3QgZG9tYWluID0gbm9ybWFsaXplU2lkZWJhckRvbWFpbihob3N0bmFtZSk7XG4gICAgY29uc3QgZGlzbWlzc2VkRG9tYWlucyA9IGF3YWl0IGdldERpc21pc3NlZFNpZGViYXJEb21haW5zKCk7XG4gICAgcmV0dXJuIGRpc21pc3NlZERvbWFpbnMuaW5jbHVkZXMoZG9tYWluKTtcbn1cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkaXNtaXNzU2lkZWJhckZvckRvbWFpbihob3N0bmFtZSA9IHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSkge1xuICAgIGNvbnN0IGRvbWFpbiA9IG5vcm1hbGl6ZVNpZGViYXJEb21haW4oaG9zdG5hbWUpO1xuICAgIGNvbnN0IGRpc21pc3NlZERvbWFpbnMgPSBhd2FpdCBnZXREaXNtaXNzZWRTaWRlYmFyRG9tYWlucygpO1xuICAgIGNvbnN0IG5leHQgPSBBcnJheS5mcm9tKG5ldyBTZXQoWy4uLmRpc21pc3NlZERvbWFpbnMsIGRvbWFpbl0pKTtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHsgW0RJU01JU1NFRF9ET01BSU5TX0tFWV06IG5leHQgfSwgcmVzb2x2ZSk7XG4gICAgfSk7XG59XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVzdG9yZVNpZGViYXJGb3JEb21haW4oaG9zdG5hbWUgPSB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUpIHtcbiAgICBjb25zdCBkb21haW4gPSBub3JtYWxpemVTaWRlYmFyRG9tYWluKGhvc3RuYW1lKTtcbiAgICBjb25zdCBkaXNtaXNzZWREb21haW5zID0gYXdhaXQgZ2V0RGlzbWlzc2VkU2lkZWJhckRvbWFpbnMoKTtcbiAgICBjb25zdCBuZXh0ID0gZGlzbWlzc2VkRG9tYWlucy5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0gIT09IGRvbWFpbik7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7IFtESVNNSVNTRURfRE9NQUlOU19LRVldOiBuZXh0IH0sIHJlc29sdmUpO1xuICAgIH0pO1xufVxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFNpZGViYXJMYXlvdXRGb3JEb21haW4oaG9zdG5hbWUgPSB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUpIHtcbiAgICBjb25zdCBkb21haW4gPSBub3JtYWxpemVTaWRlYmFyRG9tYWluKGhvc3RuYW1lKTtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0KExBWU9VVF9CWV9ET01BSU5fS0VZLCAocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBieURvbWFpbiA9IHJlc3VsdFtMQVlPVVRfQllfRE9NQUlOX0tFWV07XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGJ5RG9tYWluICYmIHR5cGVvZiBieURvbWFpbiA9PT0gXCJvYmplY3RcIlxuICAgICAgICAgICAgICAgID8gYnlEb21haW5bZG9tYWluXVxuICAgICAgICAgICAgICAgIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgcmVzb2x2ZShub3JtYWxpemVTaWRlYmFyTGF5b3V0KHZhbHVlKSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldFNpZGViYXJMYXlvdXRGb3JEb21haW4odXBkYXRlcywgaG9zdG5hbWUgPSB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUpIHtcbiAgICBjb25zdCBkb21haW4gPSBub3JtYWxpemVTaWRlYmFyRG9tYWluKGhvc3RuYW1lKTtcbiAgICBjb25zdCBjdXJyZW50ID0gYXdhaXQgZ2V0U2lkZWJhckxheW91dEZvckRvbWFpbihob3N0bmFtZSk7XG4gICAgY29uc3QgbmV4dCA9IG5vcm1hbGl6ZVNpZGViYXJMYXlvdXQoeyAuLi5jdXJyZW50LCAuLi51cGRhdGVzIH0pO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQoTEFZT1VUX0JZX0RPTUFJTl9LRVksIChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGJ5RG9tYWluID0gcmVzdWx0W0xBWU9VVF9CWV9ET01BSU5fS0VZXSAmJlxuICAgICAgICAgICAgICAgIHR5cGVvZiByZXN1bHRbTEFZT1VUX0JZX0RPTUFJTl9LRVldID09PSBcIm9iamVjdFwiXG4gICAgICAgICAgICAgICAgPyByZXN1bHRbTEFZT1VUX0JZX0RPTUFJTl9LRVldXG4gICAgICAgICAgICAgICAgOiB7fTtcbiAgICAgICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7IFtMQVlPVVRfQllfRE9NQUlOX0tFWV06IHsgLi4uYnlEb21haW4sIFtkb21haW5dOiBuZXh0IH0gfSwgKCkgPT4gcmVzb2x2ZShuZXh0KSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuZnVuY3Rpb24gbm9ybWFsaXplU2lkZWJhckxheW91dCh2YWx1ZSkge1xuICAgIGNvbnN0IGRvY2sgPSB2YWx1ZT8uZG9jayA9PT0gXCJsZWZ0XCIgfHwgdmFsdWU/LmRvY2sgPT09IFwiZmxvYXRpbmdcIiA/IHZhbHVlLmRvY2sgOiBcInJpZ2h0XCI7XG4gICAgY29uc3QgcG9zaXRpb24gPSB2YWx1ZT8ucG9zaXRpb24gJiZcbiAgICAgICAgTnVtYmVyLmlzRmluaXRlKHZhbHVlLnBvc2l0aW9uLngpICYmXG4gICAgICAgIE51bWJlci5pc0Zpbml0ZSh2YWx1ZS5wb3NpdGlvbi55KVxuICAgICAgICA/IHsgeDogdmFsdWUucG9zaXRpb24ueCwgeTogdmFsdWUucG9zaXRpb24ueSB9XG4gICAgICAgIDogbnVsbDtcbiAgICByZXR1cm4ge1xuICAgICAgICBkb2NrLFxuICAgICAgICBwb3NpdGlvbjogZG9jayA9PT0gXCJmbG9hdGluZ1wiID8gcG9zaXRpb24gOiBudWxsLFxuICAgICAgICBjb2xsYXBzZWQ6ICEhdmFsdWU/LmNvbGxhcHNlZCxcbiAgICB9O1xufVxuZnVuY3Rpb24gaXNTdHJpbmcodmFsdWUpIHtcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiO1xufVxuIiwiZXhwb3J0IGNvbnN0IFNJREVCQVJfU1RZTEVTID0gYFxuOmhvc3Qge1xuICBhbGw6IGluaXRpYWw7XG4gIGNvbG9yLXNjaGVtZTogbGlnaHQ7XG4gIGZvbnQtZmFtaWx5OiBJbnRlciwgdWktc2Fucy1zZXJpZiwgc3lzdGVtLXVpLCAtYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsIFwiU2Vnb2UgVUlcIiwgc2Fucy1zZXJpZjtcbiAgLS1zbG90aGluZy1iZzogI2Y1ZWZlMjtcbiAgLS1zbG90aGluZy1iZy0yOiAjZTlkZWM4O1xuICAtLXNsb3RoaW5nLXBhcGVyOiAjZmZmYWVmO1xuICAtLXNsb3RoaW5nLWluazogIzFhMTUzMDtcbiAgLS1zbG90aGluZy1pbmstMjogIzNhMmYyNDtcbiAgLS1zbG90aGluZy1pbmstMzogIzZhNWU0YTtcbiAgLS1zbG90aGluZy1ydWxlOiByZ2JhKDI2LCAyMCwgMTYsIDAuMTIpO1xuICAtLXNsb3RoaW5nLXJ1bGUtc3Ryb25nOiByZ2JhKDI2LCAyMCwgMTYsIDAuNCk7XG4gIC0tc2xvdGhpbmctcnVsZS1zdHJvbmctYmc6IHJnYmEoMjYsIDIwLCAxNiwgMC4wNyk7XG4gIC0tc2xvdGhpbmctYnJhbmQ6ICNiODcwNGE7XG4gIC0tc2xvdGhpbmctYnJhbmQtZGFyazogIzhlNTEzMjtcbiAgLS1zbG90aGluZy1icmFuZC1zb2Z0OiAjZjBkOWMxO1xuICAtLXNsb3RoaW5nLXN1Y2Nlc3M6ICMyZjZiNGY7XG4gIC0tc2xvdGhpbmctc3VjY2Vzcy1zb2Z0OiAjZGNlYmRjO1xuICAtLXNsb3RoaW5nLWRhbmdlcjogIzk5MWIxYjtcbiAgLS1zbG90aGluZy1kYW5nZXItc29mdDogI2YzZDZkMTtcbiAgLS1zbG90aGluZy1zaGFkb3c6IDAgMTZweCA0MnB4IHJnYmEoMjYsIDIxLCA0OCwgMC4xOCk7XG59XG5cbiosICo6OmJlZm9yZSwgKjo6YWZ0ZXIge1xuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xufVxuXG4uc2xvdGhpbmctc2lkZWJhciB7XG4gIHBvc2l0aW9uOiBmaXhlZDtcbiAgdG9wOiA5NnB4O1xuICByaWdodDogMDtcbiAgei1pbmRleDogMjE0NzQ4MzAwMDtcbiAgY29sb3I6IHZhcigtLXNsb3RoaW5nLWluayk7XG4gIGZvbnQtZmFtaWx5OiBpbmhlcml0O1xufVxuXG4uc2xvdGhpbmctc2lkZWJhci5kb2NrLWxlZnQge1xuICBsZWZ0OiAwO1xuICByaWdodDogYXV0bztcbn1cblxuLnNsb3RoaW5nLXNpZGViYXJbaGlkZGVuXSB7XG4gIGRpc3BsYXk6IG5vbmU7XG59XG5cbi5yYWlsLFxuLnBhbmVsIHtcbiAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tc2xvdGhpbmctcnVsZSk7XG4gIGJveC1zaGFkb3c6IHZhcigtLXNsb3RoaW5nLXNoYWRvdyk7XG59XG5cbi5yYWlsIHtcbiAgZGlzcGxheTogZ3JpZDtcbiAgZ3JpZC10ZW1wbGF0ZS1yb3dzOiBhdXRvIGF1dG87XG4gIGp1c3RpZnktaXRlbXM6IGNlbnRlcjtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgZ2FwOiA4cHg7XG4gIHdpZHRoOiA1MnB4O1xuICBtaW4taGVpZ2h0OiAxMTZweDtcbiAgcGFkZGluZzogMTBweCA3cHg7XG4gIGJvcmRlci1yaWdodDogMDtcbiAgYm9yZGVyLXJhZGl1czogOHB4IDAgMCA4cHg7XG4gIGJhY2tncm91bmQ6IHZhcigtLXNsb3RoaW5nLXBhcGVyKTtcbiAgY3Vyc29yOiBwb2ludGVyO1xufVxuXG4uZG9jay1sZWZ0IC5yYWlsIHtcbiAgYm9yZGVyLXJpZ2h0OiAxcHggc29saWQgdmFyKC0tc2xvdGhpbmctcnVsZSk7XG4gIGJvcmRlci1sZWZ0OiAwO1xuICBib3JkZXItcmFkaXVzOiAwIDhweCA4cHggMDtcbn1cblxuLnJhaWwtc2NvcmUge1xuICBkaXNwbGF5OiBpbmxpbmUtZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gIG1pbi13aWR0aDogMzBweDtcbiAgbWluLWhlaWdodDogMzBweDtcbiAgYm9yZGVyLXJhZGl1czogOTk5cHg7XG4gIGJhY2tncm91bmQ6IHZhcigtLXNsb3RoaW5nLWJyYW5kLXNvZnQpO1xuICBjb2xvcjogdmFyKC0tc2xvdGhpbmctYnJhbmQtZGFyayk7XG4gIGZvbnQtc2l6ZTogMTJweDtcbiAgZm9udC13ZWlnaHQ6IDgwMDtcbiAgd3JpdGluZy1tb2RlOiBob3Jpem9udGFsLXRiO1xufVxuXG4ucmFpbC1sYWJlbCB7XG4gIG1heC13aWR0aDogNDRweDtcbiAgY29sb3I6IHZhcigtLXNsb3RoaW5nLWluayk7XG4gIGZvbnQtc2l6ZTogMTBweDtcbiAgZm9udC13ZWlnaHQ6IDgwMDtcbiAgbGV0dGVyLXNwYWNpbmc6IDA7XG4gIGxpbmUtaGVpZ2h0OiAxLjE7XG4gIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgd3JpdGluZy1tb2RlOiBob3Jpem9udGFsLXRiO1xufVxuXG4ucGFuZWwge1xuICB3aWR0aDogbWluKDMzMHB4LCBjYWxjKDEwMHZ3IC0gMjhweCkpO1xuICBtYXgtaGVpZ2h0OiBtaW4oNjgwcHgsIGNhbGMoMTAwdmggLSAxMTJweCkpO1xuICBvdmVyZmxvdzogYXV0bztcbiAgYm9yZGVyLXJpZ2h0OiAwO1xuICBib3JkZXItcmFkaXVzOiA4cHggMCAwIDhweDtcbiAgYmFja2dyb3VuZDogdmFyKC0tc2xvdGhpbmctYmcpO1xufVxuXG4uZG9jay1sZWZ0IC5wYW5lbCB7XG4gIGJvcmRlci1yaWdodDogMXB4IHNvbGlkIHZhcigtLXNsb3RoaW5nLXJ1bGUpO1xuICBib3JkZXItbGVmdDogMDtcbiAgYm9yZGVyLXJhZGl1czogMCA4cHggOHB4IDA7XG59XG5cbi5oZWFkZXIge1xuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogZmxleC1zdGFydDtcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICBnYXA6IDEwcHg7XG4gIHBhZGRpbmc6IDEycHggMTJweCAxMHB4O1xuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgdmFyKC0tc2xvdGhpbmctcnVsZSk7XG4gIGJhY2tncm91bmQ6IHZhcigtLXNsb3RoaW5nLXBhcGVyKTtcbiAgY3Vyc29yOiBncmFiO1xuICB1c2VyLXNlbGVjdDogbm9uZTtcbiAgdG91Y2gtYWN0aW9uOiBub25lO1xufVxuXG4uaGVhZGVyOmFjdGl2ZSB7XG4gIGN1cnNvcjogZ3JhYmJpbmc7XG59XG5cbi5icmFuZCB7XG4gIG1hcmdpbjogMCAwIDhweDtcbiAgY29sb3I6IHZhcigtLXNsb3RoaW5nLWJyYW5kLWRhcmspO1xuICBmb250LXNpemU6IDEycHg7XG4gIGZvbnQtd2VpZ2h0OiA4MDA7XG4gIGxldHRlci1zcGFjaW5nOiAwO1xuICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xufVxuXG4ud29ya3NwYWNlLWJyYW5kLXJvdyB7XG4gIGRpc3BsYXk6IGlubGluZS1mbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBnYXA6IDZweDtcbiAgbWFyZ2luOiAwIDAgN3B4O1xuICBjb2xvcjogdmFyKC0tc2xvdGhpbmctYnJhbmQtZGFyayk7XG4gIGZvbnQtc2l6ZTogMTFweDtcbiAgZm9udC13ZWlnaHQ6IDgwMDtcbiAgbGV0dGVyLXNwYWNpbmc6IDA7XG4gIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XG59XG5cbi53b3Jrc3BhY2UtbWFyayB7XG4gIGRpc3BsYXk6IGJsb2NrO1xuICB3aWR0aDogMThweDtcbiAgaGVpZ2h0OiAxOHB4O1xuICBib3JkZXItcmFkaXVzOiA1cHg7XG4gIG9iamVjdC1maXQ6IGNvdmVyO1xufVxuXG4udGl0bGUge1xuICBtYXJnaW46IDA7XG4gIGZvbnQtc2l6ZTogMTVweDtcbiAgbGluZS1oZWlnaHQ6IDEuMjU7XG4gIGZvbnQtd2VpZ2h0OiA4MDA7XG4gIG92ZXJmbG93LXdyYXA6IGFueXdoZXJlO1xufVxuXG4uY29tcGFueSB7XG4gIG1hcmdpbjogM3B4IDAgMDtcbiAgY29sb3I6ICM1MzYwNjg7XG4gIGZvbnQtc2l6ZTogMTNweDtcbiAgbGluZS1oZWlnaHQ6IDEuMzU7XG4gIG92ZXJmbG93LXdyYXA6IGFueXdoZXJlO1xufVxuXG4uaWNvbi1yb3cge1xuICBkaXNwbGF5OiBmbGV4O1xuICBnYXA6IDRweDtcbn1cblxuYnV0dG9uIHtcbiAgYm9yZGVyOiAwO1xuICBmb250OiBpbmhlcml0O1xufVxuXG5idXR0b246Zm9jdXMtdmlzaWJsZSxcbmlucHV0OmZvY3VzLXZpc2libGUge1xuICBvdXRsaW5lOiAycHggc29saWQgdmFyKC0tc2xvdGhpbmctYnJhbmQpO1xuICBvdXRsaW5lLW9mZnNldDogMnB4O1xufVxuXG4uaWNvbi1idXR0b24ge1xuICBkaXNwbGF5OiBpbmxpbmUtZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gIHdpZHRoOiAyOHB4O1xuICBoZWlnaHQ6IDI4cHg7XG4gIGJvcmRlci1yYWRpdXM6IDZweDtcbiAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tc2xvdGhpbmctcnVsZSk7XG4gIGJhY2tncm91bmQ6IHZhcigtLXNsb3RoaW5nLWJnKTtcbiAgY29sb3I6IHZhcigtLXNsb3RoaW5nLWluayk7XG4gIGN1cnNvcjogcG9pbnRlcjtcbn1cblxuLmljb24tYnV0dG9uOmhvdmVyIHtcbiAgYmFja2dyb3VuZDogdmFyKC0tc2xvdGhpbmctcnVsZS1zdHJvbmctYmcpO1xufVxuXG4uYm9keSB7XG4gIGRpc3BsYXk6IGdyaWQ7XG4gIGdhcDogMTBweDtcbiAgcGFkZGluZzogMTJweDtcbn1cblxuLnNjb3JlLWNhcmQsXG4uYWN0aW9ucyxcbi5zdGF0dXMtY2FyZCB7XG4gIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLXNsb3RoaW5nLXJ1bGUpO1xuICBib3JkZXItcmFkaXVzOiA4cHg7XG4gIGJhY2tncm91bmQ6IHZhcigtLXNsb3RoaW5nLXBhcGVyKTtcbn1cblxuLnNjb3JlLWNhcmQge1xuICBkaXNwbGF5OiBncmlkO1xuICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IDFmciBhdXRvO1xuICBnYXA6IDEwcHg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIHBhZGRpbmc6IDEwcHg7XG59XG5cbi5zY29yZS1waWxsIHtcbiAgZGlzcGxheTogaW5saW5lLWZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGdhcDogMnB4O1xuICBtaW4td2lkdGg6IDU4cHg7XG4gIGp1c3RpZnktY29udGVudDogZmxleC1lbmQ7XG4gIHBhZGRpbmc6IDVweCA4cHg7XG4gIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMTg0LCAxMTIsIDc0LCAwLjMpO1xuICBib3JkZXItcmFkaXVzOiA5OTlweDtcbiAgYmFja2dyb3VuZDogdmFyKC0tc2xvdGhpbmctYnJhbmQtc29mdCk7XG4gIGNvbG9yOiB2YXIoLS1zbG90aGluZy1pbmspO1xufVxuXG4uc2NvcmUtcGlsbCBzcGFuIHtcbiAgZm9udC1zaXplOiAxNHB4O1xuICBmb250LXdlaWdodDogOTAwO1xuICBsaW5lLWhlaWdodDogMTtcbn1cblxuLnNjb3JlLXBpbGwgc21hbGwge1xuICBjb2xvcjogdmFyKC0tc2xvdGhpbmctYnJhbmQtZGFyayk7XG4gIGZvbnQtc2l6ZTogMTBweDtcbiAgZm9udC13ZWlnaHQ6IDgwMDtcbiAgbGluZS1oZWlnaHQ6IDE7XG59XG5cbi5zY29yZS1sYWJlbCB7XG4gIG1hcmdpbjogMDtcbiAgZm9udC1zaXplOiAxM3B4O1xuICBmb250LXdlaWdodDogODAwO1xufVxuXG4uc2NvcmUtbm90ZSxcbi5tdXRlZCxcbi5yZXN1bHQtbWV0YSB7XG4gIGNvbG9yOiB2YXIoLS1zbG90aGluZy1pbmstMyk7XG4gIGZvbnQtc2l6ZTogMTFweDtcbiAgbGluZS1oZWlnaHQ6IDEuNDtcbn1cblxuLmFjdGlvbnMge1xuICBkaXNwbGF5OiBncmlkO1xuICBnYXA6IDZweDtcbiAgcGFkZGluZzogOHB4O1xufVxuXG4uYWN0aW9uLWJ1dHRvbiB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcbiAgd2lkdGg6IDEwMCU7XG4gIG1pbi1oZWlnaHQ6IDM2cHg7XG4gIHBhZGRpbmc6IDhweCAxMHB4O1xuICBib3JkZXItcmFkaXVzOiA2cHg7XG4gIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLXNsb3RoaW5nLXJ1bGUpO1xuICBiYWNrZ3JvdW5kOiB2YXIoLS1zbG90aGluZy1wYXBlcik7XG4gIGNvbG9yOiB2YXIoLS1zbG90aGluZy1pbmspO1xuICBmb250LXdlaWdodDogNzUwO1xuICBjdXJzb3I6IHBvaW50ZXI7XG59XG5cbi5hY3Rpb24tc3RhdHVzIHtcbiAgY29sb3I6IHZhcigtLXNsb3RoaW5nLXN1Y2Nlc3MpO1xuICBmb250LXNpemU6IDEwcHg7XG4gIGZvbnQtd2VpZ2h0OiA4NTA7XG4gIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XG59XG5cbi5hY3Rpb24tYnV0dG9uLnByaW1hcnkge1xuICBiYWNrZ3JvdW5kOiB2YXIoLS1zbG90aGluZy1pbmspO1xuICBjb2xvcjogdmFyKC0tc2xvdGhpbmctcGFwZXIpO1xufVxuXG4uYWN0aW9uLWJ1dHRvbjpob3Zlcjpub3QoOmRpc2FibGVkKSB7XG4gIGZpbHRlcjogYnJpZ2h0bmVzcygwLjk2KTtcbn1cblxuLmFjdGlvbi1idXR0b246ZGlzYWJsZWQge1xuICBjdXJzb3I6IG5vdC1hbGxvd2VkO1xuICBvcGFjaXR5OiAwLjYyO1xufVxuXG4uc3RhdHVzLWNhcmQge1xuICBwYWRkaW5nOiAxMHB4IDEycHg7XG4gIGZvbnQtc2l6ZTogMTJweDtcbiAgbGluZS1oZWlnaHQ6IDEuNDtcbn1cblxuLnN0YXR1cy1jYXJkLnN1Y2Nlc3Mge1xuICBib3JkZXItY29sb3I6IHJnYmEoNDcsIDEwNywgNzksIDAuMyk7XG4gIGNvbG9yOiB2YXIoLS1zbG90aGluZy1zdWNjZXNzKTtcbiAgYmFja2dyb3VuZDogdmFyKC0tc2xvdGhpbmctc3VjY2Vzcy1zb2Z0KTtcbn1cblxuLnN0YXR1cy1jYXJkLmVycm9yIHtcbiAgYm9yZGVyLWNvbG9yOiByZ2JhKDE1MywgMjcsIDI3LCAwLjI2KTtcbiAgY29sb3I6IHZhcigtLXNsb3RoaW5nLWRhbmdlcik7XG4gIGJhY2tncm91bmQ6IHZhcigtLXNsb3RoaW5nLWRhbmdlci1zb2Z0KTtcbn1cblxuLnV0aWxpdHktc2VjdGlvbiB7XG4gIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLXNsb3RoaW5nLXJ1bGUpO1xuICBib3JkZXItcmFkaXVzOiA4cHg7XG4gIGJhY2tncm91bmQ6IHZhcigtLXNsb3RoaW5nLXBhcGVyKTtcbn1cblxuLnV0aWxpdHktc2VjdGlvbiBzdW1tYXJ5IHtcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICBtaW4taGVpZ2h0OiAzNnB4O1xuICBwYWRkaW5nOiAwIDEwcHg7XG4gIGNvbG9yOiB2YXIoLS1zbG90aGluZy1pbmspO1xuICBmb250LXNpemU6IDEzcHg7XG4gIGZvbnQtd2VpZ2h0OiA4NTA7XG4gIGN1cnNvcjogcG9pbnRlcjtcbiAgbGlzdC1zdHlsZTogbm9uZTtcbn1cblxuLnV0aWxpdHktc2VjdGlvbiBzdW1tYXJ5Ojotd2Via2l0LWRldGFpbHMtbWFya2VyIHtcbiAgZGlzcGxheTogbm9uZTtcbn1cblxuLnV0aWxpdHktc2VjdGlvbiBzdW1tYXJ5OjphZnRlciB7XG4gIGNvbnRlbnQ6IFwiK1wiO1xuICBjb2xvcjogdmFyKC0tc2xvdGhpbmctaW5rLTMpO1xuICBmb250LXdlaWdodDogOTAwO1xufVxuXG4udXRpbGl0eS1zZWN0aW9uW29wZW5dIHN1bW1hcnkge1xuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgdmFyKC0tc2xvdGhpbmctcnVsZSk7XG59XG5cbi51dGlsaXR5LXNlY3Rpb25bb3Blbl0gc3VtbWFyeTo6YWZ0ZXIge1xuICBjb250ZW50OiBcIi1cIjtcbn1cblxuLmFuc3dlci1iYW5rIHtcbiAgcGFkZGluZzogMTBweDtcbn1cblxuLnNlY3Rpb24tdGl0bGUge1xuICBtYXJnaW46IDAgMCA4cHg7XG4gIGZvbnQtc2l6ZTogMTNweDtcbiAgZm9udC13ZWlnaHQ6IDg1MDtcbn1cblxuLnNlYXJjaC1yb3cge1xuICBkaXNwbGF5OiBncmlkO1xuICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IDFmciBhdXRvO1xuICBnYXA6IDhweDtcbn1cblxuLnNlYXJjaC1yb3cgaW5wdXQge1xuICB3aWR0aDogMTAwJTtcbiAgbWluLXdpZHRoOiAwO1xuICBoZWlnaHQ6IDM0cHg7XG4gIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLXNsb3RoaW5nLXJ1bGUpO1xuICBib3JkZXItcmFkaXVzOiA2cHg7XG4gIHBhZGRpbmc6IDAgMTBweDtcbiAgY29sb3I6IHZhcigtLXNsb3RoaW5nLWluayk7XG4gIGZvbnQ6IGluaGVyaXQ7XG4gIGZvbnQtc2l6ZTogMTNweDtcbn1cblxuLnNlYXJjaC1yb3cgYnV0dG9uLFxuLnNtYWxsLWJ1dHRvbiB7XG4gIG1pbi1oZWlnaHQ6IDM0cHg7XG4gIGJvcmRlci1yYWRpdXM6IDZweDtcbiAgcGFkZGluZzogMCAxMHB4O1xuICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1zbG90aGluZy1pbmspO1xuICBiYWNrZ3JvdW5kOiB2YXIoLS1zbG90aGluZy1pbmspO1xuICBjb2xvcjogdmFyKC0tc2xvdGhpbmctcGFwZXIpO1xuICBjdXJzb3I6IHBvaW50ZXI7XG59XG5cbi5yZXN1bHRzIHtcbiAgZGlzcGxheTogZ3JpZDtcbiAgZ2FwOiA4cHg7XG4gIG1hcmdpbi10b3A6IDEwcHg7XG59XG5cbi5yZXN1bHQge1xuICBib3JkZXItdG9wOiAxcHggc29saWQgdmFyKC0tc2xvdGhpbmctcnVsZSk7XG4gIHBhZGRpbmctdG9wOiA4cHg7XG59XG5cbi5yZXN1bHQtcXVlc3Rpb24sXG4ucmVzdWx0LWFuc3dlciB7XG4gIG1hcmdpbjogMDtcbiAgZm9udC1zaXplOiAxMnB4O1xuICBsaW5lLWhlaWdodDogMS40O1xufVxuXG4ucmVzdWx0LXF1ZXN0aW9uIHtcbiAgZm9udC13ZWlnaHQ6IDgwMDtcbn1cblxuLnJlc3VsdC1hbnN3ZXIge1xuICBtYXJnaW4tdG9wOiA0cHg7XG4gIGNvbG9yOiB2YXIoLS1zbG90aGluZy1pbmstMik7XG59XG5cbi5yZXN1bHQtYWN0aW9ucyB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGdhcDogNnB4O1xuICBtYXJnaW4tdG9wOiA4cHg7XG59XG5cbi5zbWFsbC1idXR0b24ge1xuICBtaW4taGVpZ2h0OiAyOHB4O1xuICBwYWRkaW5nOiAwIDhweDtcbiAgZm9udC1zaXplOiAxMnB4O1xufVxuXG4uc21hbGwtYnV0dG9uLnNlY29uZGFyeSB7XG4gIGJvcmRlci1jb2xvcjogdmFyKC0tc2xvdGhpbmctcnVsZSk7XG4gIGJhY2tncm91bmQ6IHZhcigtLXNsb3RoaW5nLXBhcGVyKTtcbiAgY29sb3I6IHZhcigtLXNsb3RoaW5nLWluayk7XG59XG5cbi8qIFA0LyM0MCDigJQgSW5saW5lIEFJIGFzc2lzdGFudCBjaGF0IHBhbmVsICovXG4uY2hhdC1wYW5lbCB7XG4gIGJvcmRlcjogMDtcbiAgYm9yZGVyLXJhZGl1czogMDtcbiAgcGFkZGluZzogMTBweDtcbn1cblxuLmNoYXQtcGFuZWwgLnNlY3Rpb24tdGl0bGUge1xuICBkaXNwbGF5OiBub25lO1xufVxuXG4uY2hhdC1zZWVkLXJvdyB7XG4gIGRpc3BsYXk6IGdyaWQ7XG4gIGdyaWQtdGVtcGxhdGUtY29sdW1uczogMWZyIDFmcjtcbiAgZ2FwOiA2cHg7XG4gIG1hcmdpbi1ib3R0b206IDhweDtcbn1cblxuLmNoYXQtc2VlZC1yb3cgLnNtYWxsLWJ1dHRvbiB7XG4gIHdpZHRoOiAxMDAlO1xuICBtaW4taGVpZ2h0OiAzMnB4O1xuICBwYWRkaW5nOiAwIDhweDtcbiAgZm9udC1zaXplOiAxMnB4O1xuICB3aGl0ZS1zcGFjZTogbm9ybWFsO1xuICBsaW5lLWhlaWdodDogMS4yO1xufVxuXG4uY2hhdC1pbnB1dC1yb3cge1xuICBkaXNwbGF5OiBncmlkO1xuICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IDFmciBhdXRvO1xuICBnYXA6IDZweDtcbiAgYWxpZ24taXRlbXM6IGVuZDtcbn1cblxuLmNoYXQtaW5wdXQtcm93IHRleHRhcmVhIHtcbiAgd2lkdGg6IDEwMCU7XG4gIG1pbi13aWR0aDogMDtcbiAgcmVzaXplOiB2ZXJ0aWNhbDtcbiAgbWluLWhlaWdodDogMzZweDtcbiAgbWF4LWhlaWdodDogMTIwcHg7XG4gIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLXNsb3RoaW5nLXJ1bGUpO1xuICBib3JkZXItcmFkaXVzOiA2cHg7XG4gIHBhZGRpbmc6IDhweCAxMHB4O1xuICBjb2xvcjogdmFyKC0tc2xvdGhpbmctaW5rKTtcbiAgZm9udDogaW5oZXJpdDtcbiAgZm9udC1zaXplOiAxM3B4O1xuICBsaW5lLWhlaWdodDogMS4zNTtcbiAgYmFja2dyb3VuZDogdmFyKC0tc2xvdGhpbmctcGFwZXIpO1xufVxuXG4uY2hhdC1pbnB1dC1yb3cgdGV4dGFyZWE6ZGlzYWJsZWQge1xuICBiYWNrZ3JvdW5kOiB2YXIoLS1zbG90aGluZy1iZy0yKTtcbiAgY29sb3I6IHZhcigtLXNsb3RoaW5nLWluay0zKTtcbn1cblxuLmNoYXQtcmVzdWx0IHtcbiAgbWFyZ2luLXRvcDogMTBweDtcbiAgbWluLWhlaWdodDogMTZweDtcbn1cblxuLmNoYXQtc3Bpbm5lciB7XG4gIG1hcmdpbjogMDtcbiAgY29sb3I6IHZhcigtLXNsb3RoaW5nLWluay0zKTtcbiAgZm9udC1zaXplOiAxMnB4O1xuICBmb250LXN0eWxlOiBpdGFsaWM7XG59XG5cbi5jaGF0LW91dHB1dCB7XG4gIG1hcmdpbjogMDtcbiAgY29sb3I6IHZhcigtLXNsb3RoaW5nLWluayk7XG4gIGZvbnQtc2l6ZTogMTNweDtcbiAgbGluZS1oZWlnaHQ6IDEuNTtcbiAgd2hpdGUtc3BhY2U6IHByZS13cmFwO1xuICBvdmVyZmxvdy13cmFwOiBhbnl3aGVyZTtcbn1cblxuLmNoYXQtZXJyb3Ige1xuICBtYXJnaW4tdG9wOiA4cHg7XG59XG5cbi5jaGF0LXVzZS1jdGEge1xuICBtYXJnaW4tdG9wOiAxMHB4O1xuICB3aWR0aDogMTAwJTtcbn1cblxuQG1lZGlhIChtYXgtd2lkdGg6IDEwMjNweCkge1xuICAuc2xvdGhpbmctc2lkZWJhciB7XG4gICAgZGlzcGxheTogbm9uZTtcbiAgfVxufVxuYDtcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4IH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG5pbXBvcnQgeyBjcmVhdGVSb290IH0gZnJvbSBcInJlYWN0LWRvbS9jbGllbnRcIjtcbmltcG9ydCB7IEpvYlBhZ2VTaWRlYmFyIH0gZnJvbSBcIi4vam9iLXBhZ2Utc2lkZWJhclwiO1xuaW1wb3J0IHsgY29tcHV0ZUpvYk1hdGNoU2NvcmUgfSBmcm9tIFwiLi9zY29yaW5nXCI7XG5pbXBvcnQgeyBERUZBVUxUX1NJREVCQVJfTEFZT1VULCBkaXNtaXNzU2lkZWJhckZvckRvbWFpbiwgZ2V0U2lkZWJhckxheW91dEZvckRvbWFpbiwgaXNTaWRlYmFyRGlzbWlzc2VkRm9yRG9tYWluLCBub3JtYWxpemVTaWRlYmFyRG9tYWluLCByZXN0b3JlU2lkZWJhckZvckRvbWFpbiwgc2V0U2lkZWJhckxheW91dEZvckRvbWFpbiwgfSBmcm9tIFwiLi9zdG9yYWdlXCI7XG5pbXBvcnQgeyBTSURFQkFSX1NUWUxFUyB9IGZyb20gXCIuL3N0eWxlc1wiO1xuY29uc3QgSE9TVF9JRCA9IFwic2xvdGhpbmctam9iLXBhZ2Utc2lkZWJhci1ob3N0XCI7XG5jb25zdCBERVNLVE9QX01JTl9XSURUSCA9IDEwMjQ7XG5leHBvcnQgY2xhc3MgSm9iUGFnZVNpZGViYXJDb250cm9sbGVyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5ob3N0ID0gbnVsbDtcbiAgICAgICAgdGhpcy5yb290ID0gbnVsbDtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IG51bGw7XG4gICAgICAgIHRoaXMubGF5b3V0ID0gREVGQVVMVF9TSURFQkFSX0xBWU9VVDtcbiAgICAgICAgdGhpcy5kaXNtaXNzZWREb21haW4gPSBudWxsO1xuICAgICAgICB0aGlzLmhhbmRsZVJlc2l6ZSA9ICgpID0+IHRoaXMucmVuZGVyKCk7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHRoaXMuaGFuZGxlUmVzaXplKTtcbiAgICB9XG4gICAgYXN5bmMgdXBkYXRlKG5leHQpIHtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IG5leHQ7XG4gICAgICAgIHRoaXMuZGlzbWlzc2VkRG9tYWluID0gKGF3YWl0IGlzU2lkZWJhckRpc21pc3NlZEZvckRvbWFpbigpKVxuICAgICAgICAgICAgPyBub3JtYWxpemVTaWRlYmFyRG9tYWluKHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSlcbiAgICAgICAgICAgIDogbnVsbDtcbiAgICAgICAgdGhpcy5sYXlvdXQgPSBhd2FpdCBnZXRTaWRlYmFyTGF5b3V0Rm9yRG9tYWluKCk7XG4gICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgfVxuICAgIHNob3dDb2xsYXBzZWQoKSB7XG4gICAgICAgIHZvaWQgdGhpcy51cGRhdGVMYXlvdXQoeyBjb2xsYXBzZWQ6IHRydWUgfSk7XG4gICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgfVxuICAgIGFzeW5jIGRpc21pc3NEb21haW4oKSB7XG4gICAgICAgIGF3YWl0IGRpc21pc3NTaWRlYmFyRm9yRG9tYWluKCk7XG4gICAgICAgIHRoaXMuZGlzbWlzc2VkRG9tYWluID0gbm9ybWFsaXplU2lkZWJhckRvbWFpbih3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUpO1xuICAgICAgICB0aGlzLnVubW91bnQoKTtcbiAgICB9XG4gICAgYXN5bmMgcmVzdG9yZURvbWFpbigpIHtcbiAgICAgICAgYXdhaXQgcmVzdG9yZVNpZGViYXJGb3JEb21haW4oKTtcbiAgICAgICAgdGhpcy5kaXNtaXNzZWREb21haW4gPSBudWxsO1xuICAgICAgICBhd2FpdCB0aGlzLnVwZGF0ZUxheW91dCh7IGNvbGxhcHNlZDogZmFsc2UgfSk7XG4gICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgfVxuICAgIGdldFN0YXR1cygpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHZpc2libGU6ICEhdGhpcy5yb290ICYmICEhdGhpcy5zdGF0ZT8uc2NyYXBlZEpvYiAmJiAhdGhpcy5kaXNtaXNzZWREb21haW4sXG4gICAgICAgICAgICBkaXNtaXNzZWQ6IHRoaXMuZGlzbWlzc2VkRG9tYWluID09PVxuICAgICAgICAgICAgICAgIG5vcm1hbGl6ZVNpZGViYXJEb21haW4od2luZG93LmxvY2F0aW9uLmhvc3RuYW1lKSxcbiAgICAgICAgICAgIGxheW91dDogdGhpcy5sYXlvdXQsXG4gICAgICAgIH07XG4gICAgfVxuICAgIGRlc3Ryb3koKSB7XG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHRoaXMuaGFuZGxlUmVzaXplKTtcbiAgICAgICAgdGhpcy51bm1vdW50KCk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSBudWxsO1xuICAgIH1cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGlmICghdGhpcy5zdGF0ZT8uc2NyYXBlZEpvYiB8fFxuICAgICAgICAgICAgd2luZG93LmlubmVyV2lkdGggPCBERVNLVE9QX01JTl9XSURUSCB8fFxuICAgICAgICAgICAgdGhpcy5kaXNtaXNzZWREb21haW4gPT09IG5vcm1hbGl6ZVNpZGViYXJEb21haW4od2luZG93LmxvY2F0aW9uLmhvc3RuYW1lKSkge1xuICAgICAgICAgICAgdGhpcy51bm1vdW50KCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgcm9vdCA9IHRoaXMuZW5zdXJlUm9vdCgpO1xuICAgICAgICBjb25zdCBzY29yZSA9IGNvbXB1dGVKb2JNYXRjaFNjb3JlKHRoaXMuc3RhdGUucHJvZmlsZSwgdGhpcy5zdGF0ZS5zY3JhcGVkSm9iKTtcbiAgICAgICAgcm9vdC5yZW5kZXIoX2pzeChKb2JQYWdlU2lkZWJhciwgeyBzY3JhcGVkSm9iOiB0aGlzLnN0YXRlLnNjcmFwZWRKb2IsIGRldGVjdGVkRmllbGRDb3VudDogdGhpcy5zdGF0ZS5kZXRlY3RlZEZpZWxkQ291bnQsIHNjb3JlOiBzY29yZSwgbGF5b3V0OiB0aGlzLmxheW91dCwgb25MYXlvdXRDaGFuZ2U6ICh1cGRhdGVzKSA9PiB7XG4gICAgICAgICAgICAgICAgdm9pZCB0aGlzLnVwZGF0ZUxheW91dCh1cGRhdGVzKTtcbiAgICAgICAgICAgIH0sIG9uRGlzbWlzczogKCkgPT4gdGhpcy5kaXNtaXNzRG9tYWluKCksIG9uVGFpbG9yOiB0aGlzLnN0YXRlLm9uVGFpbG9yLCBvbkNvdmVyTGV0dGVyOiB0aGlzLnN0YXRlLm9uQ292ZXJMZXR0ZXIsIG9uU2F2ZTogdGhpcy5zdGF0ZS5vblNhdmUsIG9uQXV0b0ZpbGw6IHRoaXMuc3RhdGUub25BdXRvRmlsbCwgb25TZWFyY2hBbnN3ZXJzOiB0aGlzLnN0YXRlLm9uU2VhcmNoQW5zd2Vycywgb25BcHBseUFuc3dlcjogdGhpcy5zdGF0ZS5vbkFwcGx5QW5zd2VyLCBvbkNoYXRTdHJlYW06IHRoaXMuc3RhdGUub25DaGF0U3RyZWFtLCBvblVzZUluQ292ZXJMZXR0ZXI6IHRoaXMuc3RhdGUub25Vc2VJbkNvdmVyTGV0dGVyIH0pKTtcbiAgICB9XG4gICAgYXN5bmMgdXBkYXRlTGF5b3V0KHVwZGF0ZXMpIHtcbiAgICAgICAgdGhpcy5sYXlvdXQgPSB7IC4uLnRoaXMubGF5b3V0LCAuLi51cGRhdGVzIH07XG4gICAgICAgIGlmICh0aGlzLmxheW91dC5kb2NrICE9PSBcImZsb2F0aW5nXCIpIHtcbiAgICAgICAgICAgIHRoaXMubGF5b3V0LnBvc2l0aW9uID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgICAgICB0aGlzLmxheW91dCA9IGF3YWl0IHNldFNpZGViYXJMYXlvdXRGb3JEb21haW4odGhpcy5sYXlvdXQpO1xuICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgIH1cbiAgICBlbnN1cmVSb290KCkge1xuICAgICAgICBpZiAodGhpcy5yb290KVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucm9vdDtcbiAgICAgICAgY29uc3QgZXhpc3RpbmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChIT1NUX0lEKTtcbiAgICAgICAgdGhpcy5ob3N0ID0gZXhpc3RpbmcgfHwgZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgdGhpcy5ob3N0LmlkID0gSE9TVF9JRDtcbiAgICAgICAgaWYgKCFleGlzdGluZykge1xuICAgICAgICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuaG9zdCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgc2hhZG93Um9vdCA9IHRoaXMuaG9zdC5zaGFkb3dSb290IHx8IHRoaXMuaG9zdC5hdHRhY2hTaGFkb3coeyBtb2RlOiBcIm9wZW5cIiB9KTtcbiAgICAgICAgaWYgKCFzaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoXCJzdHlsZVwiKSkge1xuICAgICAgICAgICAgY29uc3Qgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XG4gICAgICAgICAgICBzdHlsZS50ZXh0Q29udGVudCA9IFNJREVCQVJfU1RZTEVTO1xuICAgICAgICAgICAgc2hhZG93Um9vdC5hcHBlbmRDaGlsZChzdHlsZSk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IG1vdW50ID0gc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKFwiW2RhdGEtc2lkZWJhci1yb290XVwiKTtcbiAgICAgICAgaWYgKCFtb3VudCkge1xuICAgICAgICAgICAgbW91bnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICAgICAgbW91bnQuZGF0YXNldC5zaWRlYmFyUm9vdCA9IFwidHJ1ZVwiO1xuICAgICAgICAgICAgc2hhZG93Um9vdC5hcHBlbmRDaGlsZChtb3VudCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yb290ID0gY3JlYXRlUm9vdChtb3VudCk7XG4gICAgICAgIHJldHVybiB0aGlzLnJvb3Q7XG4gICAgfVxuICAgIHVubW91bnQoKSB7XG4gICAgICAgIHRoaXMucm9vdD8udW5tb3VudCgpO1xuICAgICAgICB0aGlzLnJvb3QgPSBudWxsO1xuICAgICAgICB0aGlzLmhvc3Q/LnJlbW92ZSgpO1xuICAgICAgICB0aGlzLmhvc3QgPSBudWxsO1xuICAgIH1cbn1cbiIsIi8vIENvcnJlY3Rpb25zIGZlZWRiYWNrIGxvb3AgKCMzMykuXG4vL1xuLy8gV2hlbiB0aGUgYXV0b2ZpbGwgd3JpdGVzIGEgdmFsdWUgaW50byBhIGZpZWxkIHdlIHJlZ2lzdGVyIGl0IGhlcmUgZm9yIGFcbi8vIDMwLXNlY29uZCB3aW5kb3cuIElmIHRoZSB1c2VyIGVkaXRzIHRoZSB2YWx1ZSBhbmQgdGhlIGZpbmFsIHZhbHVlIGRpZmZlcnNcbi8vIGZyb20gdGhlIG9yaWdpbmFsIHN1Z2dlc3Rpb24gd2hlbiB0aGV5IGJsdXIgdGhlIGZpZWxkLCB3ZSBQT1NUIGFcbi8vIFNBVkVfQ09SUkVDVElPTiBtZXNzYWdlIHRvIHRoZSBiYWNrZ3JvdW5kIHNjcmlwdCBzbyB0aGUgcGVyLWRvbWFpbiBmaWVsZFxuLy8gbWFwcGluZyBncm93cyBzdHJvbmdlciBvdmVyIHRpbWUuXG4vL1xuLy8gVGhpcyBtb2R1bGUgZGVsaWJlcmF0ZWx5IGhhcyBubyBET00tcXVlcnlpbmcgc2lkZS1lZmZlY3RzIGF0IGltcG9ydCB0aW1lIHNvXG4vLyBpdCBzdGF5cyBwdXJlLWltcG9ydGFibGUgZnJvbSB0ZXN0cy5cbmltcG9ydCB7IE1lc3NhZ2VzLCBzZW5kTWVzc2FnZSB9IGZyb20gXCJAL3NoYXJlZC9tZXNzYWdlc1wiO1xuLyoqXG4gKiBEZWZhdWx0IHRyYWNraW5nIHdpbmRvdy4gUGVyIHRoZSByb2FkbWFwIHdlIHRyYWNrIGZvciAzMHMgYWZ0ZXIgZmlsbCBzb1xuICogd2Ugb25seSBsZWFybiBmcm9tIFwiSSBhbSBjb3JyZWN0aW5nIHdoYXQgeW91IGp1c3QgZmlsbGVkXCIgZWRpdHMsIG5vdCBmcm9tXG4gKiBhIHVzZXIgcmV2aXNpdGluZyB0aGUgZm9ybSAyMCBtaW51dGVzIGxhdGVyLiBFeHBvc2VkIGZvciB0ZXN0cy5cbiAqL1xuZXhwb3J0IGNvbnN0IENPUlJFQ1RJT05fVFJBQ0tfV0lORE9XX01TID0gMzAwMDA7XG4vKipcbiAqIFB1cmUgaGV1cmlzdGljOiByZXR1cm5zIHRydWUgd2hlbiB0aGUgdXNlcidzIGZpbmFsIHZhbHVlIHNob3VsZCBiZSB0cmVhdGVkXG4gKiBhcyBhIGNvcnJlY3Rpb24gb2YgdGhlIG9yaWdpbmFsIHN1Z2dlc3Rpb24uIFdlIG5vcm1hbGl6ZSB3aGl0ZXNwYWNlICsgY2FzZVxuICogYmVjYXVzZSB0cmFpbGluZyBzcGFjZXMsIGNhc2luZyBkaWZmZXJlbmNlcyBpbiBlbWFpbHMsIGFuZCBhIHN0cmF5IG5ld2xpbmVcbiAqIGluIGEgdGV4dGFyZWEgc2hvdWxkbid0IGNvdW50IGFzIFwidGhlIHVzZXIgZGlzYWdyZWVkIHdpdGggb3VyIHN1Z2dlc3Rpb24uXCJcbiAqXG4gKiBFeHBvcnRlZCBzbyB0aGUgdW5pdCB0ZXN0IGNhbiBsb2NrIHRoZSBiZWhhdmlvciBpbiBpbmRlcGVuZGVudGx5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gd2FzQ29ycmVjdGlvbihvcmlnaW5hbCwgY3VycmVudCkge1xuICAgIGNvbnN0IGEgPSBub3JtYWxpemUob3JpZ2luYWwpO1xuICAgIGNvbnN0IGIgPSBub3JtYWxpemUoY3VycmVudCk7XG4gICAgaWYgKGIubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIC8vIENsZWFyaW5nIHRoZSBmaWVsZCBpcyBhbHNvIGEgY29ycmVjdGlvbiDigJQgYnV0IG9ubHkgaWYgdGhlIG9yaWdpbmFsXG4gICAgICAgIC8vIHdhcyBub24tZW1wdHkuIEFuIGVtcHR5LW9uLWVtcHR5IHBhaXIgaXMgbm90IGEgY29ycmVjdGlvbi5cbiAgICAgICAgcmV0dXJuIGEubGVuZ3RoID4gMDtcbiAgICB9XG4gICAgcmV0dXJuIGEgIT09IGI7XG59XG5mdW5jdGlvbiBub3JtYWxpemUodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUucmVwbGFjZSgvXFxzKy9nLCBcIiBcIikudHJpbSgpLnRvTG93ZXJDYXNlKCk7XG59XG4vKipcbiAqIEJ1aWxkIGEgc3RhYmxlIHNpZ25hdHVyZSBmb3IgYSBmaWVsZC4gVGhlIHJvYWRtYXAgY2FsbHMgZm9yIGFcbiAqIGBmaWVsZFNpZ25hdHVyZWAga2V5ZWQgYWdhaW5zdCBgKHVzZXJfaWQsIGRvbWFpbiwgZmllbGRfc2lnbmF0dXJlKWAsIHNvIHdlXG4gKiB3YW50IHNvbWV0aGluZyB0aGF0J3Mgc3RhYmxlIGFjcm9zcyBmb3JtIHJlLXJlbmRlcnMgKGUuZy4gUmVhY3Qga2V5c1xuICogcmVnZW5lcmF0aW5nIG9uIGV2ZXJ5IHN0YXRlIGNoYW5nZSkgeWV0IHNwZWNpZmljIGVub3VnaCB0byBkaXNhbWJpZ3VhdGVcbiAqIHRoZSBlbWFpbCBmaWVsZCBvbiAvYXBwbHkgZnJvbSB0aGUgZW1haWwgZmllbGQgb24gL3NpZ251cC5cbiAqXG4gKiBXZSBjb21iaW5lOiBmaWVsZCB0eXBlLCBhdXRvY29tcGxldGUgaGludCwgbmFtZSwgaWQsIGxhYmVsLCBwbGFjZWhvbGRlcixcbiAqIGFuZCB0aGUgZm9ybSdzIHBhdGgtZGVyaXZlZCBpZC4gTm9uZSBvZiB0aGVzZSBhbG9uZSBpcyByZWxpYWJsZSDigJRcbiAqIFdvcmtkYXkgdXNlcyBgZGF0YS1hdXRvbWF0aW9uLWlkYCwgTGV2ZXIgdXNlcyBgbmFtZWAsIEdyZWVuaG91c2UgdXNlcyBgaWRgXG4gKiDigJQgYnV0IHRoZSBjb25qdW5jdGlvbiBpcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbXB1dGVGaWVsZFNpZ25hdHVyZShmaWVsZCkge1xuICAgIGNvbnN0IGVsID0gZmllbGQuZWxlbWVudDtcbiAgICBjb25zdCBzaWduYWxzID0gZ2F0aGVyU2lnbmFsU3Vic2V0KGVsKTtcbiAgICBjb25zdCBwYXJ0cyA9IFtcbiAgICAgICAgYHQ6JHtmaWVsZC5maWVsZFR5cGV9YCxcbiAgICAgICAgc2lnbmFscy5hdXRvY29tcGxldGUgPyBgYWM6JHtzaWduYWxzLmF1dG9jb21wbGV0ZX1gIDogXCJcIixcbiAgICAgICAgc2lnbmFscy5uYW1lID8gYG46JHtzaWduYWxzLm5hbWV9YCA6IFwiXCIsXG4gICAgICAgIHNpZ25hbHMuaWQgPyBgaToke3NpZ25hbHMuaWR9YCA6IFwiXCIsXG4gICAgICAgIGZpZWxkLmxhYmVsID8gYGw6JHtub3JtYWxpemUoZmllbGQubGFiZWwpLnNsaWNlKDAsIDgwKX1gIDogXCJcIixcbiAgICAgICAgZmllbGQucGxhY2Vob2xkZXIgPyBgcDoke25vcm1hbGl6ZShmaWVsZC5wbGFjZWhvbGRlcikuc2xpY2UoMCwgNjApfWAgOiBcIlwiLFxuICAgIF0uZmlsdGVyKEJvb2xlYW4pO1xuICAgIHJldHVybiBwYXJ0cy5qb2luKFwifFwiKTtcbn1cbmZ1bmN0aW9uIGdhdGhlclNpZ25hbFN1YnNldChlbCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIG5hbWU6IGVsLm5hbWU/LnRvTG93ZXJDYXNlKCkgfHwgXCJcIixcbiAgICAgICAgaWQ6IGVsLmlkPy50b0xvd2VyQ2FzZSgpIHx8IFwiXCIsXG4gICAgICAgIGF1dG9jb21wbGV0ZTogZWwuYXV0b2NvbXBsZXRlIHx8IFwiXCIsXG4gICAgfTtcbn1cbmV4cG9ydCBjbGFzcyBDb3JyZWN0aW9uc1RyYWNrZXIge1xuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgICAgICB0aGlzLmVudHJpZXMgPSBuZXcgTWFwKCk7XG4gICAgICAgIHRoaXMud2luZG93TXMgPSBvcHRpb25zLndpbmRvd01zID8/IENPUlJFQ1RJT05fVFJBQ0tfV0lORE9XX01TO1xuICAgICAgICB0aGlzLmRvbWFpbiA9IG9wdGlvbnMuZG9tYWluID8/IHRoaXMuZ2V0RGVmYXVsdERvbWFpbigpO1xuICAgICAgICB0aGlzLnNlbmQgPSBvcHRpb25zLnNlbmQgPz8gZGVmYXVsdFNlbmRlcjtcbiAgICAgICAgdGhpcy5ub3cgPSBvcHRpb25zLm5vdyA/PyAoKCkgPT4gRGF0ZS5ub3coKSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyIGEgZmllbGQgdGhhdCB3YXMganVzdCBhdXRvZmlsbGVkLiBUaGUgdHJhY2tlciB3aWxsIGZpcmVcbiAgICAgKiBTQVZFX0NPUlJFQ1RJT04gb24gYmx1ciB3aXRoaW4gdGhlIG5leHQgMzAgc2Vjb25kcyBpZiBhbmQgb25seSBpZiB0aGVcbiAgICAgKiB1c2VyIGhhcyBlZGl0ZWQgdGhlIHZhbHVlIHRvIHNvbWV0aGluZyBkaWZmZXJlbnQgZnJvbSB0aGUgc3VnZ2VzdGlvbi5cbiAgICAgKlxuICAgICAqIENhbGxpbmcgYHRyYWNrYCBvbiBhIGZpZWxkIHRoYXQncyBhbHJlYWR5IHRyYWNrZWQgcmVwbGFjZXMgdGhlIHByaW9yXG4gICAgICogZW50cnkgc28gdGhlIG1vc3QgcmVjZW50IHN1Z2dlc3Rpb24gaXMgdGhlIG9uZSB3ZSBkaWZmIGFnYWluc3QuXG4gICAgICovXG4gICAgdHJhY2soZmllbGQsIG9yaWdpbmFsU3VnZ2VzdGlvbikge1xuICAgICAgICBjb25zdCBlbCA9IGZpZWxkLmVsZW1lbnQ7XG4gICAgICAgIGlmIChvcmlnaW5hbFN1Z2dlc3Rpb24ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAvLyBOb3RoaW5nIHRvIGNvbXBhcmUgYWdhaW5zdCDigJQgYmFpbC5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnVudHJhY2soZWwpO1xuICAgICAgICBjb25zdCBmaWVsZFNpZ25hdHVyZSA9IGNvbXB1dGVGaWVsZFNpZ25hdHVyZShmaWVsZCk7XG4gICAgICAgIGNvbnN0IGZpZWxkVHlwZSA9IGZpZWxkLmZpZWxkVHlwZTtcbiAgICAgICAgY29uc3Qgc3RhcnRlZEF0ID0gdGhpcy5ub3coKTtcbiAgICAgICAgY29uc3QgYmx1ckhhbmRsZXIgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgICAgIGlmICghdGFyZ2V0KVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIGNvbnN0IGVudHJ5ID0gdGhpcy5lbnRyaWVzLmdldCh0YXJnZXQpO1xuICAgICAgICAgICAgaWYgKCFlbnRyeSB8fCBlbnRyeS5maXJlZClcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBjb25zdCBlbGFwc2VkID0gdGhpcy5ub3coKSAtIGVudHJ5LnN0YXJ0ZWRBdDtcbiAgICAgICAgICAgIGlmIChlbGFwc2VkID4gdGhpcy53aW5kb3dNcylcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBjb25zdCB1c2VyVmFsdWUgPSByZWFkVmFsdWUodGFyZ2V0KTtcbiAgICAgICAgICAgIGlmICghd2FzQ29ycmVjdGlvbihlbnRyeS5vcmlnaW5hbFN1Z2dlc3Rpb24sIHVzZXJWYWx1ZSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgZW50cnkuZmlyZWQgPSB0cnVlO1xuICAgICAgICAgICAgdm9pZCBQcm9taXNlLnJlc29sdmUodGhpcy5zZW5kKHtcbiAgICAgICAgICAgICAgICBkb21haW46IHRoaXMuZG9tYWluLFxuICAgICAgICAgICAgICAgIGZpZWxkU2lnbmF0dXJlOiBlbnRyeS5maWVsZFNpZ25hdHVyZSxcbiAgICAgICAgICAgICAgICBmaWVsZFR5cGU6IGVudHJ5LmZpZWxkVHlwZSxcbiAgICAgICAgICAgICAgICBvcmlnaW5hbFN1Z2dlc3Rpb246IGVudHJ5Lm9yaWdpbmFsU3VnZ2VzdGlvbixcbiAgICAgICAgICAgICAgICB1c2VyVmFsdWUsXG4gICAgICAgICAgICAgICAgY29uZmlkZW5jZTogZW50cnkuY29uZmlkZW5jZSxcbiAgICAgICAgICAgIH0pKS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIltTbG90aGluZ10gc2F2ZUNvcnJlY3Rpb24gZmFpbGVkOlwiLCBlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBPbmNlIHdlJ3ZlIGZpcmVkIHRoZSBjb3JyZWN0aW9uIHdlIGNhbiBzdG9wIGxpc3RlbmluZyDigJQgbm8gcG9pbnRcbiAgICAgICAgICAgIC8vIHJlLWZpcmluZyBvbiBldmVyeSBzdWJzZXF1ZW50IGJsdXIuXG4gICAgICAgICAgICB0aGlzLnVudHJhY2sodGFyZ2V0KTtcbiAgICAgICAgfTtcbiAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihcImJsdXJcIiwgYmx1ckhhbmRsZXIpO1xuICAgICAgICBjb25zdCBleHBpcnlUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy51bnRyYWNrKGVsKTtcbiAgICAgICAgfSwgdGhpcy53aW5kb3dNcyk7XG4gICAgICAgIHRoaXMuZW50cmllcy5zZXQoZWwsIHtcbiAgICAgICAgICAgIGVsZW1lbnQ6IGVsLFxuICAgICAgICAgICAgb3JpZ2luYWxTdWdnZXN0aW9uLFxuICAgICAgICAgICAgZmllbGRUeXBlLFxuICAgICAgICAgICAgZmllbGRTaWduYXR1cmUsXG4gICAgICAgICAgICBjb25maWRlbmNlOiBmaWVsZC5jb25maWRlbmNlLFxuICAgICAgICAgICAgc3RhcnRlZEF0LFxuICAgICAgICAgICAgYmx1ckhhbmRsZXIsXG4gICAgICAgICAgICBleHBpcnlUaW1lcixcbiAgICAgICAgICAgIGZpcmVkOiBmYWxzZSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKiBTdG9wIHRyYWNraW5nIGEgc2luZ2xlIGZpZWxkIChhbHNvIGNhbGxlZCBhdXRvbWF0aWNhbGx5IG9uIDMwcyBleHBpcnkpLiAqL1xuICAgIHVudHJhY2soZWxlbWVudCkge1xuICAgICAgICBjb25zdCBlbnRyeSA9IHRoaXMuZW50cmllcy5nZXQoZWxlbWVudCk7XG4gICAgICAgIGlmICghZW50cnkpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImJsdXJcIiwgZW50cnkuYmx1ckhhbmRsZXIpO1xuICAgICAgICBjbGVhclRpbWVvdXQoZW50cnkuZXhwaXJ5VGltZXIpO1xuICAgICAgICB0aGlzLmVudHJpZXMuZGVsZXRlKGVsZW1lbnQpO1xuICAgIH1cbiAgICAvKiogU3RvcCB0cmFja2luZyBldmVyeSBmaWVsZC4gQ2FsbGVkIG9uIHBhZ2UgaGlkZS4gKi9cbiAgICBjbGVhcigpIHtcbiAgICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiB0aGlzLmVudHJpZXMudmFsdWVzKCkpIHtcbiAgICAgICAgICAgIGVudHJ5LmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImJsdXJcIiwgZW50cnkuYmx1ckhhbmRsZXIpO1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGVudHJ5LmV4cGlyeVRpbWVyKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmVudHJpZXMuY2xlYXIoKTtcbiAgICB9XG4gICAgLyoqIE51bWJlciBvZiBmaWVsZHMgY3VycmVudGx5IGJlaW5nIHRyYWNrZWQuIEV4cG9zZWQgZm9yIHRlc3RzLiAqL1xuICAgIHNpemUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVudHJpZXMuc2l6ZTtcbiAgICB9XG4gICAgZ2V0RGVmYXVsdERvbWFpbigpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIGhvc3RuYW1lIHN0cmlwcyBwb3J0ICsgcGF0aCBzbyB0d28gcG9ydHMgb24gdGhlIHNhbWUgaG9zdCAocmFyZSkgc2hhcmVcbiAgICAgICAgICAgIC8vIGEgbWFwcGluZy4gTWF0Y2hlcyB0aGUgc2VydmVyLXNpZGUgbm9ybWFsaXphdGlvbiBpbiB0aGUgcm91dGUuXG4gICAgICAgICAgICByZXR1cm4gdHlwZW9mIHdpbmRvdyA9PT0gXCJ1bmRlZmluZWRcIlxuICAgICAgICAgICAgICAgID8gXCJ1bmtub3duXCJcbiAgICAgICAgICAgICAgICA6IHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSB8fCBcInVua25vd25cIjtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCB7XG4gICAgICAgICAgICByZXR1cm4gXCJ1bmtub3duXCI7XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiByZWFkVmFsdWUoZWwpIHtcbiAgICBpZiAoZWwgaW5zdGFuY2VvZiBIVE1MU2VsZWN0RWxlbWVudCkge1xuICAgICAgICBjb25zdCBzZWxlY3RlZCA9IGVsLm9wdGlvbnNbZWwuc2VsZWN0ZWRJbmRleF07XG4gICAgICAgIHJldHVybiBzZWxlY3RlZD8udGV4dCA/PyBlbC52YWx1ZSA/PyBcIlwiO1xuICAgIH1cbiAgICByZXR1cm4gZWwudmFsdWUgPz8gXCJcIjtcbn1cbmFzeW5jIGZ1bmN0aW9uIGRlZmF1bHRTZW5kZXIocGF5bG9hZCkge1xuICAgIGF3YWl0IHNlbmRNZXNzYWdlKE1lc3NhZ2VzLnNhdmVDb3JyZWN0aW9uKHBheWxvYWQpKTtcbn1cbiIsIi8vIFAzLyMzOCDigJQgUGFzc2l2ZSBMaW5rZWRJbiBjYXB0dXJlLlxuLy9cbi8vIExpbmtlZEluJ3MgVE9TIHByb2hpYml0cyBhdXRvLW5hdmlnYXRpb24gYW5kIHRoZWlyIGFudGktYm90IGlzIGFjdGl2ZSwgc29cbi8vIHRoaXMgbW9kdWxlIGlzIGRlbGliZXJhdGVseSByZWFkLW9ubHkuIEl0IHJ1bnMgKmFmdGVyKiB0aGUgY29udGVudCBzY3JpcHRcbi8vIGhhcyBzY3JhcGVkIGEgTGlua2VkSW4gZGV0YWlsIHBhZ2UgdGhlIHVzZXIgaXMgYWxyZWFkeSB2aWV3aW5nIGFuZDpcbi8vXG4vLyAgIDEuIExvb2tzIHVwIHRoZSBMaW5rZWRJbiBqb2JJZCBhZ2FpbnN0IGEgc2Vzc2lvbi1zY29wZWQgc2VlbiBzZXRcbi8vICAgICAgKGBjaHJvbWUuc3RvcmFnZS5zZXNzaW9uLmxpbmtlZEluU2VlbmApIGFuZCBzaG9ydC1jaXJjdWl0cyBvbiBoaXQuXG4vLyAgIDIuIEVuZm9yY2VzIGEgNTAtY2FwdHVyZS1wZXItMjRoIGRhaWx5IGNhcCwga2V5ZWQgYnkgYSBge2RhdGUsIGNvdW50fWBcbi8vICAgICAgcmVjb3JkIGluIGBjaHJvbWUuc3RvcmFnZS5sb2NhbGAuIEhpdHRpbmcgdGhlIGNhcCBpcyBhIHNpbGVudCBuby1vcFxuLy8gICAgICAobm8gZXJyb3IgdG9hc3QsIG5vIGVucXVldWUpLlxuLy8gICAzLiBFbnF1ZXVlcyB0aGUgc2NyYXBlZCBqb2IgdmlhIHRoZSBleGlzdGluZyBgSU1QT1JUX0pPQmAgbWVzc2FnZSwgd2hpY2hcbi8vICAgICAgbGFuZHMgYXQgYC9hcGkvb3Bwb3J0dW5pdGllcy9mcm9tLWV4dGVuc2lvbmAgYW5kIGVuZHMgdXAgaW4gdGhlIHJldmlld1xuLy8gICAgICBxdWV1ZS5cbi8vICAgNC4gU2hvd3MgYSBvbmUtc2hvdCBcIlNhdmVkIGZvciBsYXRlclwiIHRvYXN0IG9uIHRoZSBmaXJzdCBjYXB0dXJlIHBlclxuLy8gICAgICBzZXNzaW9uLlxuLy9cbi8vIEV2ZXJ5dGhpbmcgaW4gdGhpcyBmaWxlIGlzIHBhc3NpdmU6IG5vIGAuY2xpY2soKWAsIG5vIGxpc3QtcGFnZSB0cmF2ZXJzYWwsXG4vLyBubyBET00gbXV0YXRpb24gb3RoZXIgdGhhbiBtb3VudGluZyB0aGUgdG9hc3QgZWxlbWVudCBpbiBkb2N1bWVudC5ib2R5LlxuLy9cbi8vIFN0b3JhZ2Ugc2hhcGVzOlxuLy8gICBjaHJvbWUuc3RvcmFnZS5zZXNzaW9uW0xJTktFRElOX1NFRU5fS0VZXSA6IHN0cmluZ1tdICAgICAgLy8gam9iIGlkc1xuLy8gICBjaHJvbWUuc3RvcmFnZS5sb2NhbFtMSU5LRURJTl9EQUlMWV9LRVldICA6IHsgZGF0ZTogXCJZWVlZLU1NLUREXCIsXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3VudDogbnVtYmVyIH1cbmV4cG9ydCBjb25zdCBMSU5LRURJTl9TRUVOX0tFWSA9IFwibGlua2VkSW5TZWVuXCI7XG5leHBvcnQgY29uc3QgTElOS0VESU5fREFJTFlfS0VZID0gXCJzbG90aGluZ0xpbmtlZEluRGFpbHlDYXBcIjtcbmV4cG9ydCBjb25zdCBMSU5LRURJTl9EQUlMWV9DQVAgPSA1MDtcbmV4cG9ydCBjb25zdCBMSU5LRURJTl9UT0FTVF9DTEFTUyA9IFwic2xvdGhpbmctdG9hc3QtbGlua2VkaW4tY2FwdHVyZVwiO1xuLyoqIFlZWVktTU0tREQgaW4gdGhlIHVzZXIncyBsb2NhbCB0aW1lem9uZSDigJQgc2FtZSBjYWxlbmRhciBkYXkgdGhlIHVzZXIgc2Vlcy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsb2NhbERhdGVTdGFtcChub3cgPSBuZXcgRGF0ZSgpKSB7XG4gICAgY29uc3QgeWVhciA9IG5vdy5nZXRGdWxsWWVhcigpO1xuICAgIGNvbnN0IG1vbnRoID0gU3RyaW5nKG5vdy5nZXRNb250aCgpICsgMSkucGFkU3RhcnQoMiwgXCIwXCIpO1xuICAgIGNvbnN0IGRheSA9IFN0cmluZyhub3cuZ2V0RGF0ZSgpKS5wYWRTdGFydCgyLCBcIjBcIik7XG4gICAgcmV0dXJuIGAke3llYXJ9LSR7bW9udGh9LSR7ZGF5fWA7XG59XG4vLyAtLS0tIHNlc3Npb24tc2NvcGVkIHNlZW4gc2V0IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vKipcbiAqIFJlYWRzIHRoZSBjdXJyZW50IHNlc3Npb24ncyBzZWVuIGxpc3QuIFJldHVybnMgYFtdYCB3aGVuXG4gKiBgY2hyb21lLnN0b3JhZ2Uuc2Vzc2lvbmAgaXMgdW5hdmFpbGFibGUgKG9sZGVyIGJyb3dzZXJzKSBvciB0aGUgZW50cnkgaXNcbiAqIG1pc3Npbmcg4oCUIGJvdGggYnJhbmNoZXMgYXJlIHNhZmUgYmVjYXVzZSBhIG1pc3Npbmcgc2VlbiBlbnRyeSBqdXN0IG1lYW5zXG4gKiBcIm5vIGNhcHR1cmVzIHlldCB0aGlzIHNlc3Npb25cIiwgd2hpY2ggaXMgdGhlIGNvcnJlY3QgZGVmYXVsdC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldExpbmtlZEluU2VlbklkcygpIHtcbiAgICBjb25zdCBzZXNzaW9uID0gY2hyb21lLnN0b3JhZ2U/LnNlc3Npb247XG4gICAgaWYgKCFzZXNzaW9uKVxuICAgICAgICByZXR1cm4gW107XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIHNlc3Npb24uZ2V0KExJTktFRElOX1NFRU5fS0VZLCAocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHJlc3VsdD8uW0xJTktFRElOX1NFRU5fS0VZXTtcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIC8vIERlZmVuc2l2ZSDigJQgZmlsdGVyIHRvIHN0cmluZ3Mgb25seSBzbyBhIG1hbGZvcm1lZCB3cml0ZSBjYW4ndCBjcmFzaFxuICAgICAgICAgICAgICAgIC8vIHRoZSByZXN0IG9mIHRoZSBjYXB0dXJlIHBpcGVsaW5lLlxuICAgICAgICAgICAgICAgIHJlc29sdmUodmFsdWUuZmlsdGVyKChpZCkgPT4gdHlwZW9mIGlkID09PSBcInN0cmluZ1wiKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKFtdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG4vKipcbiAqIEFwcGVuZHMgYSBqb2JJZCB0byB0aGUgc2Vzc2lvbi1zY29wZWQgc2VlbiBsaXN0LiBOby1vcHMgd2hlbiB0aGUgc2Vzc2lvblxuICogc3RvcmUgaXMgdW5hdmFpbGFibGUg4oCUIHRoZSBkYWlseSBjYXAgaXMgdGhlIHNhZmV0eSBuZXQgb24gYnJvd3NlcnMgd2l0aG91dFxuICogYGNocm9tZS5zdG9yYWdlLnNlc3Npb25gLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYWRkTGlua2VkSW5TZWVuSWQoam9iSWQpIHtcbiAgICBjb25zdCBzZXNzaW9uID0gY2hyb21lLnN0b3JhZ2U/LnNlc3Npb247XG4gICAgaWYgKCFzZXNzaW9uKVxuICAgICAgICByZXR1cm47XG4gICAgY29uc3QgY3VycmVudCA9IGF3YWl0IGdldExpbmtlZEluU2VlbklkcygpO1xuICAgIGlmIChjdXJyZW50LmluY2x1ZGVzKGpvYklkKSlcbiAgICAgICAgcmV0dXJuO1xuICAgIGNvbnN0IG5leHQgPSBbLi4uY3VycmVudCwgam9iSWRdO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICBzZXNzaW9uLnNldCh7IFtMSU5LRURJTl9TRUVOX0tFWV06IG5leHQgfSwgKCkgPT4gcmVzb2x2ZSgpKTtcbiAgICB9KTtcbn1cbi8vIC0tLS0gZGFpbHkgY2FwIGNvdW50ZXIgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8qKlxuICogUmVhZHMgdGhlIGRhaWx5LWNhcCBjb3VudGVyIGZyb20gYGNocm9tZS5zdG9yYWdlLmxvY2FsYC4gUmV0dXJucyBhIGZyZXNoXG4gKiBge2RhdGUsIGNvdW50OiAwfWAgd2hlbjpcbiAqICAgLSBub3RoaW5nIGhhcyBiZWVuIHdyaXR0ZW4geWV0LFxuICogICAtIHRoZSBzdG9yZWQgc3RhbXAgaXMgZnJvbSBhIHByZXZpb3VzIGxvY2FsLXRpbWUgZGF5IChjcm9zcy1kYXkgcmVzZXQpLFxuICogICAtIHRoZSB2YWx1ZSBpcyBtYWxmb3JtZWQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRMaW5rZWRJbkRhaWx5Q2FwU3RhdGUobm93ID0gbmV3IERhdGUoKSkge1xuICAgIGNvbnN0IHRvZGF5ID0gbG9jYWxEYXRlU3RhbXAobm93KTtcbiAgICBjb25zdCBsb2NhbCA9IGNocm9tZS5zdG9yYWdlPy5sb2NhbDtcbiAgICBpZiAoIWxvY2FsKVxuICAgICAgICByZXR1cm4geyBkYXRlOiB0b2RheSwgY291bnQ6IDAgfTtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgbG9jYWwuZ2V0KExJTktFRElOX0RBSUxZX0tFWSwgKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc3RvcmVkID0gcmVzdWx0Py5bTElOS0VESU5fREFJTFlfS0VZXTtcbiAgICAgICAgICAgIGlmIChzdG9yZWQgJiZcbiAgICAgICAgICAgICAgICB0eXBlb2Ygc3RvcmVkLmRhdGUgPT09IFwic3RyaW5nXCIgJiZcbiAgICAgICAgICAgICAgICB0eXBlb2Ygc3RvcmVkLmNvdW50ID09PSBcIm51bWJlclwiICYmXG4gICAgICAgICAgICAgICAgc3RvcmVkLmRhdGUgPT09IHRvZGF5KSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7IGRhdGU6IHN0b3JlZC5kYXRlLCBjb3VudDogc3RvcmVkLmNvdW50IH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gU3RhbGUgZGF5IC8gbWlzc2luZyAvIG1hbGZvcm1lZCDigJQgc2FtZSBiZWhhdmlvdXI6IHRvZGF5J3MgY291bnQgPSAwLlxuICAgICAgICAgICAgICAgIHJlc29sdmUoeyBkYXRlOiB0b2RheSwgY291bnQ6IDAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuLyoqXG4gKiBJbmNyZW1lbnRzIHRoZSBkYWlseS1jYXAgY291bnRlciBhbmQgcGVyc2lzdHMgaXQuIFJldHVybnMgdGhlIG5ldyBzdGF0ZSBzb1xuICogY2FsbGVycyBkb24ndCBuZWVkIGEgc2Vjb25kIHJlYWQgdG8gZGlzcGxheSB0aGUgcnVubmluZyB0YWxseS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGluY3JlbWVudExpbmtlZEluRGFpbHlDYXAobm93ID0gbmV3IERhdGUoKSkge1xuICAgIGNvbnN0IGN1cnJlbnQgPSBhd2FpdCBnZXRMaW5rZWRJbkRhaWx5Q2FwU3RhdGUobm93KTtcbiAgICBjb25zdCBuZXh0ID0ge1xuICAgICAgICBkYXRlOiBjdXJyZW50LmRhdGUsXG4gICAgICAgIGNvdW50OiBjdXJyZW50LmNvdW50ICsgMSxcbiAgICB9O1xuICAgIGNvbnN0IGxvY2FsID0gY2hyb21lLnN0b3JhZ2U/LmxvY2FsO1xuICAgIGlmICghbG9jYWwpXG4gICAgICAgIHJldHVybiBuZXh0O1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICBsb2NhbC5zZXQoeyBbTElOS0VESU5fREFJTFlfS0VZXTogbmV4dCB9LCAoKSA9PiByZXNvbHZlKG5leHQpKTtcbiAgICB9KTtcbn1cbi8vIC0tLS0gdG9hc3QgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8qKlxuICogTW91bnRzIGEgbm9uLWJsb2NraW5nIHRvYXN0IGFubm91bmNpbmcgdGhlIHJ1bm5pbmcgc2Vzc2lvbiBjYXB0dXJlIGNvdW50LlxuICogSWRlbXBvdGVudDogYW55IHByaW9yIExpbmtlZEluLWNhcHR1cmUgdG9hc3QgaXMgcmVtb3ZlZCBmaXJzdCBzbyBhIHJhcGlkXG4gKiBzZWNvbmQgY2FwdHVyZSBkb2Vzbid0IHN0YWNrIHRvYXN0cyBvbiB0b3Agb2YgZWFjaCBvdGhlci5cbiAqXG4gKiBUaGUgdG9hc3QgaXMgdGhlIE9OTFkgRE9NIG11dGF0aW9uIHRoaXMgbW9kdWxlIHBlcmZvcm1zIG9uIGEgTGlua2VkSW4gcGFnZSxcbiAqIGFuZCBpdCdzIGFwcGVuZGVkIHRvIGBkb2N1bWVudC5ib2R5YCByYXRoZXIgdGhhbiBzcGxpY2VkIGludG8gTGlua2VkSW4nc1xuICogb3duIG1hcmt1cC4gVGhpcyBrZWVwcyB1cyBvZmYgdGhlIGFudGktYm90IHJhZGFyICh3ZSdyZSBub3QgdG91Y2hpbmcgdGhlaXJcbiAqIGVsZW1lbnRzKSBhbmQgbWFrZXMgdGhlIFwibm8gRE9NIG11dGF0aW9uIGJleW9uZCB0b2FzdCBjb250YWluZXJcIiB0ZXN0XG4gKiBjaGVhcCB0byBhc3NlcnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzaG93TGlua2VkSW5DYXB0dXJlVG9hc3QoY291bnQpIHtcbiAgICBpZiAodHlwZW9mIGRvY3VtZW50ID09PSBcInVuZGVmaW5lZFwiIHx8ICFkb2N1bWVudC5ib2R5KVxuICAgICAgICByZXR1cm47XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLiR7TElOS0VESU5fVE9BU1RfQ0xBU1N9YCk/LnJlbW92ZSgpO1xuICAgIGNvbnN0IHRvYXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICB0b2FzdC5jbGFzc05hbWUgPSBgc2xvdGhpbmctdG9hc3QgJHtMSU5LRURJTl9UT0FTVF9DTEFTU31gO1xuICAgIHRvYXN0LnNldEF0dHJpYnV0ZShcInJvbGVcIiwgXCJzdGF0dXNcIik7XG4gICAgdG9hc3Quc2V0QXR0cmlidXRlKFwiYXJpYS1saXZlXCIsIFwicG9saXRlXCIpO1xuICAgIC8vIFBsdXJhbGlzYXRpb24gaXMgbG9jYWwgcmF0aGVyIHRoYW4gdmlhIEBzbG90aGluZy93ZWIncyBwbHVyYWxpemUoKSBiZWNhdXNlXG4gICAgLy8gdGhpcyBjb250ZW50IHNjcmlwdCBjYW4ndCBwdWxsIGluIHRoZSB3ZWIgd29ya3NwYWNlJ3MgaGVscGVycyB3aXRob3V0XG4gICAgLy8gYmxvYXRpbmcgdGhlIGJ1bmRsZS5cbiAgICBjb25zdCBub3VuID0gY291bnQgPT09IDEgPyBcImpvYlwiIDogXCJqb2JzXCI7XG4gICAgdG9hc3QudGV4dENvbnRlbnQgPSBgU2F2ZWQgZm9yIGxhdGVyIOKAlCAke2NvdW50fSBMaW5rZWRJbiAke25vdW59IGNhcHR1cmVkIHRoaXMgc2Vzc2lvbi5gO1xuICAgIGNvbnN0IGRpc21pc3MgPSAoKSA9PiB0b2FzdC5yZW1vdmUoKTtcbiAgICB3aW5kb3cuc2V0VGltZW91dChkaXNtaXNzLCA1MDAwKTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRvYXN0KTtcbn1cbmNvbnN0IHNlc3Npb25TdGF0ZSA9IHsgdG9hc3RTaG93bjogZmFsc2UgfTtcbi8qKiBUZXN0IGhvb2sg4oCUIHJlc2V0cyB0aGUgaW4tbWVtb3J5IFwiZmlyc3QgY2FwdHVyZSB0aGlzIHNlc3Npb25cIiBmbGFnLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0TGlua2VkSW5DYXB0dXJlU2Vzc2lvblN0YXRlKCkge1xuICAgIHNlc3Npb25TdGF0ZS50b2FzdFNob3duID0gZmFsc2U7XG59XG4vKipcbiAqIE1haW4gZW50cnkgcG9pbnQuIENhbGwgb25jZSBwZXIgTGlua2VkSW4gZGV0YWlsLXBhZ2Ugc2NyYXBlLiBUaGUgY2FsbGVyIGlzXG4gKiByZXNwb25zaWJsZSBmb3IgZW5zdXJpbmcgYGpvYi5zb3VyY2UgPT09IFwibGlua2VkaW5cImAgYW5kIGBqb2Iuc291cmNlSm9iSWRgXG4gKiBpcyBzZXQgYmVmb3JlIGludm9raW5nIHRoaXMgZnVuY3Rpb24g4oCUIHBhc3NpbmcgYW4gdW5yZWxhdGVkIGpvYiBoZXJlIGlzIGFcbiAqIG5vLW9wIChgc2tpcHBlZGApIHJhdGhlciB0aGFuIGFuIGVycm9yIHRvIGtlZXAgdGhlIGludGVncmF0aW9uIHBvaW50IGluXG4gKiBgY29udGVudC9pbmRleC50c2AgZXJnb25vbWljLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdHJ5Q2FwdHVyZUxpbmtlZEluSm9iKGpvYiwgZGVwcykge1xuICAgIGlmIChqb2Iuc291cmNlICE9PSBcImxpbmtlZGluXCIpXG4gICAgICAgIHJldHVybiBcInNraXBwZWRcIjtcbiAgICBjb25zdCBqb2JJZCA9IGpvYi5zb3VyY2VKb2JJZDtcbiAgICBpZiAoIWpvYklkKVxuICAgICAgICByZXR1cm4gXCJza2lwcGVkXCI7XG4gICAgY29uc3Qgbm93ID0gKGRlcHMubm93IHx8ICgoKSA9PiBuZXcgRGF0ZSgpKSkoKTtcbiAgICAvLyAxLiBTZXNzaW9uLXNjb3BlZCBkZWR1cGUg4oCUIHZpc2l0aW5nIHRoZSBzYW1lIGpvYiB0d2ljZSBpbiBvbmUgc2Vzc2lvblxuICAgIC8vICAgIG11c3Qgbm90IGRvdWJsZS1lbnF1ZXVlLlxuICAgIGNvbnN0IHNlZW4gPSBhd2FpdCBnZXRMaW5rZWRJblNlZW5JZHMoKTtcbiAgICBpZiAoc2Vlbi5pbmNsdWRlcyhqb2JJZCkpXG4gICAgICAgIHJldHVybiBcImRlZHVwZWRcIjtcbiAgICAvLyAyLiBEYWlseSBjYXAg4oCUIGhpdHRpbmcgNTAvZGF5IGlzIGEgc2lsZW50IG5vLW9wLiBXZSBpbnRlbnRpb25hbGx5IGRvIE5PVFxuICAgIC8vICAgIHNob3cgYW4gZXJyb3IgdG9hc3QgKHBlciAjMzggYWNjZXB0YW5jZTogXCJubyBlcnJvciB0b2FzdFwiKS5cbiAgICBjb25zdCBjYXAgPSBhd2FpdCBnZXRMaW5rZWRJbkRhaWx5Q2FwU3RhdGUobm93KTtcbiAgICBpZiAoY2FwLmNvdW50ID49IExJTktFRElOX0RBSUxZX0NBUClcbiAgICAgICAgcmV0dXJuIFwiY2FwcGVkXCI7XG4gICAgLy8gMy4gRW5xdWV1ZS4gV2UgdXBkYXRlIHRoZSBzZWVuIHNldCBhbmQgdGhlIGRhaWx5IGNvdW50ZXIgQkVGT1JFIGF3YWl0aW5nXG4gICAgLy8gICAgdGhlIG5ldHdvcmsgY2FsbCBzbyBhIHNsb3cgcmVzcG9uc2UgY2FuJ3QgbGV0IGEgZHVwbGljYXRlIHNsaXBcbiAgICAvLyAgICB0aHJvdWdoIGlmIHRoZSB1c2VyIG5hdmlnYXRlcyBiYWNrIHRvIHRoZSBzYW1lIGpvYiBiZWZvcmUgdGhlIGZpcnN0XG4gICAgLy8gICAgcmVxdWVzdCBjb21wbGV0ZXMuIElmIHRoZSBuZXR3b3JrIGNhbGwgZmFpbHMgd2Ugc3RpbGwgY29uc3VtZSBvbmVcbiAgICAvLyAgICBkYWlseS1jYXAgc2xvdCDigJQgdGhhdCdzIHRoZSBjb25zZXJ2YXRpdmUgYmVoYXZpb3VyIGZvciBhbiBhbnRpLXNwYW1cbiAgICAvLyAgICByYXRlIGxpbWl0ZXIuXG4gICAgYXdhaXQgYWRkTGlua2VkSW5TZWVuSWQoam9iSWQpO1xuICAgIGNvbnN0IG5leHRDYXAgPSBhd2FpdCBpbmNyZW1lbnRMaW5rZWRJbkRhaWx5Q2FwKG5vdyk7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBkZXBzLnNlbmRNZXNzYWdlKGRlcHMuYnVpbGRJbXBvcnRNZXNzYWdlKGpvYikpO1xuICAgICAgICBpZiAoIXJlc3BvbnNlLnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIC8vIEJhY2tncm91bmQgYWxyZWFkeSBsb2dzIHRoZSB1bmRlcmx5aW5nIGVycm9yOyB3ZSBqdXN0IGJhaWwgc28gdGhlXG4gICAgICAgICAgICAvLyB0b2FzdCBkb2Vzbid0IGNsYWltIGEgc3VjY2Vzc2Z1bCBjYXB0dXJlLlxuICAgICAgICAgICAgcmV0dXJuIFwiZXJyb3JcIjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjYXRjaCB7XG4gICAgICAgIHJldHVybiBcImVycm9yXCI7XG4gICAgfVxuICAgIC8vIDQuIEZpcnN0LWNhcHR1cmUtb2Ytc2Vzc2lvbiB0b2FzdCBvbmx5LiBXZSB1c2UgdGhlIHJ1bm5pbmcgc2Vzc2lvblxuICAgIC8vICAgIGNvdW50ZXIgZm9yIHRoZSBkaXNwbGF5ZWQgbnVtYmVyIHJhdGhlciB0aGFuIHRoZSBkYWlseSBjb3VudCBiZWNhdXNlXG4gICAgLy8gICAgXCJjYXB0dXJlZCB0aGlzIHNlc3Npb25cIiBpcyB3aGF0IHRoZSBjb3B5IHByb21pc2VzLlxuICAgIGlmICghc2Vzc2lvblN0YXRlLnRvYXN0U2hvd24pIHtcbiAgICAgICAgc2Vzc2lvblN0YXRlLnRvYXN0U2hvd24gPSB0cnVlO1xuICAgICAgICBjb25zdCBzZXNzaW9uQ291bnQgPSAoYXdhaXQgZ2V0TGlua2VkSW5TZWVuSWRzKCkpLmxlbmd0aDtcbiAgICAgICAgY29uc3Qgc2hvd1RvYXN0ID0gZGVwcy5zaG93VG9hc3QgfHwgc2hvd0xpbmtlZEluQ2FwdHVyZVRvYXN0O1xuICAgICAgICBzaG93VG9hc3Qoc2Vzc2lvbkNvdW50KTtcbiAgICB9XG4gICAgLy8gSGludCB0byB0aGUgY2FsbGVyIGZvciB0ZXN0cy9sb2dzLiBUaGUgZGFpbHkgY291bnRlciBpcyBpbmNsdWRlZCBmb3JcbiAgICAvLyBvYnNlcnZhYmlsaXR5IGJ1dCBpc24ndCBwYXJ0IG9mIHRoZSB1c2VyLWZhY2luZyBmbG93LlxuICAgIHZvaWQgbmV4dENhcDtcbiAgICByZXR1cm4gXCJjYXB0dXJlZFwiO1xufVxuIiwiLy8gU3R5bGVzIGZvciB0aGUgaW5saW5lIGFuc3dlci1iYW5rIGJ1dHRvbiArIHBvcG92ZXIuXG4vL1xuLy8gTGl2ZXMgaW4gYSBUUyBmaWxlIChub3QgYSBDU1MgZmlsZSkgc28gd2UgY2FuIGluamVjdCBpdCBkaXJlY3RseSBpbnRvIHRoZVxuLy8gc2hhZG93IHJvb3Qgb2YgZWFjaCBkZWNvcmF0aW9uLiBXZSBtaXJyb3IgdGhlIHBvcHVwIGRlc2lnbiB0b2tlbnMgbG9jYWxseSDigJRcbi8vIHRoZSBzcGVjIHNheXMgdG8gTk9UIGltcG9ydCBmcm9tIGBwb3B1cC9zdHlsZXMuY3NzYCwgc28gYW55IHRva2VuIGNoYW5nZSBpblxuLy8gdGhlIHBvcHVwIG5lZWRzIGEgcGFyYWxsZWwgY2hhbmdlIGhlcmUuXG4vL1xuLy8gVG9rZW5zIG1pcnJvcmVkIGZyb20gdGhlIFNsb3RoaW5nIGVkaXRvcmlhbCBwYWxldHRlIGluIHRoZSBwb3B1cC9vcHRpb25zLlxuZXhwb3J0IGNvbnN0IEFOU1dFUl9CQU5LX0JVVFRPTl9TVFlMRVMgPSBgXG46aG9zdCwgLnNsb3RoaW5nLWFiLXJvb3Qge1xuICAtLXNsb3RoaW5nLWFiLXByaW1hcnk6ICMxYTE1MzA7XG4gIC0tc2xvdGhpbmctYWItcHJpbWFyeS1ob3ZlcjogIzhlNTEzMjtcbiAgLS1zbG90aGluZy1hYi1wcmltYXJ5LXNvZnQ6ICNmMGQ5YzE7XG4gIC0tc2xvdGhpbmctYWItYmc6ICNmNWVmZTI7XG4gIC0tc2xvdGhpbmctYWItYmctc29mdDogI2U5ZGVjODtcbiAgLS1zbG90aGluZy1hYi1zdXJmYWNlOiAjZmZmYWVmO1xuICAtLXNsb3RoaW5nLWFiLWJvcmRlcjogcmdiYSgyNiwgMjAsIDE2LCAwLjEyKTtcbiAgLS1zbG90aGluZy1hYi1ib3JkZXItc3Ryb25nOiByZ2JhKDI2LCAyMCwgMTYsIDAuNCk7XG4gIC0tc2xvdGhpbmctYWItdGV4dDogIzFhMTUzMDtcbiAgLS1zbG90aGluZy1hYi10ZXh0LW11dGVkOiAjNmE1ZTRhO1xuICAtLXNsb3RoaW5nLWFiLWJyYW5kOiAjYjg3MDRhO1xuICAtLXNsb3RoaW5nLWFiLXNoYWRvdzogMCAxMHB4IDI0cHggcmdiYSgyNiwgMjEsIDQ4LCAwLjE0KTtcbiAgLS1zbG90aGluZy1hYi1yYWRpdXM6IDEwcHg7XG4gIC0tc2xvdGhpbmctYWItcmFkaXVzLXNtOiA2cHg7XG59XG5cbi5zbG90aGluZy1hYi1yb290IHtcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xuICBmb250LWZhbWlseTogLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCBcIkludGVyXCIsIFwiU2Vnb2UgVUlcIiwgUm9ib3RvLFxuICAgIE94eWdlbiwgVWJ1bnR1LCBzYW5zLXNlcmlmO1xuICBmb250LXNpemU6IDEycHg7XG4gIGxpbmUtaGVpZ2h0OiAxLjQ7XG4gIGNvbG9yOiB2YXIoLS1zbG90aGluZy1hYi10ZXh0KTtcbn1cblxuLnNsb3RoaW5nLWFiLWJ1dHRvbiB7XG4gIHdpZHRoOiAxNnB4O1xuICBoZWlnaHQ6IDE2cHg7XG4gIHBhZGRpbmc6IDA7XG4gIG1hcmdpbjogMDtcbiAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tc2xvdGhpbmctYWItYm9yZGVyLXN0cm9uZyk7XG4gIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgYmFja2dyb3VuZDogdmFyKC0tc2xvdGhpbmctYWItc3VyZmFjZSk7XG4gIGNvbG9yOiB2YXIoLS1zbG90aGluZy1hYi1icmFuZCk7XG4gIGRpc3BsYXk6IGlubGluZS1mbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgZm9udC1zaXplOiAxMXB4O1xuICBsaW5lLWhlaWdodDogMTtcbiAgY3Vyc29yOiBwb2ludGVyO1xuICBib3gtc2hhZG93OiB2YXIoLS1zbG90aGluZy1hYi1zaGFkb3cpO1xuICB0cmFuc2l0aW9uOiB0cmFuc2Zvcm0gMTAwbXMgZWFzZSwgYm94LXNoYWRvdyAxMDBtcyBlYXNlO1xufVxuXG4uc2xvdGhpbmctYWItYnV0dG9uOmhvdmVyIHtcbiAgdHJhbnNmb3JtOiBzY2FsZSgxLjA2KTtcbn1cblxuLnNsb3RoaW5nLWFiLWJ1dHRvbjpmb2N1cy12aXNpYmxlIHtcbiAgb3V0bGluZTogMnB4IHNvbGlkIHZhcigtLXNsb3RoaW5nLWFiLWJyYW5kKTtcbiAgb3V0bGluZS1vZmZzZXQ6IDJweDtcbn1cblxuLnNsb3RoaW5nLWFiLWljb24ge1xuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG4gIGZvbnQtc2l6ZTogMTFweDtcbiAgbGluZS1oZWlnaHQ6IDE7XG59XG5cbi5zbG90aGluZy1hYi1wb3BvdmVyIHtcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICB0b3A6IDIycHg7XG4gIHJpZ2h0OiAwO1xuICB3aWR0aDogMjQwcHg7XG4gIG1heC1oZWlnaHQ6IDI0MHB4O1xuICBkaXNwbGF5OiBmbGV4O1xuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICBiYWNrZ3JvdW5kOiB2YXIoLS1zbG90aGluZy1hYi1zdXJmYWNlKTtcbiAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tc2xvdGhpbmctYWItYm9yZGVyKTtcbiAgYm9yZGVyLXJhZGl1czogdmFyKC0tc2xvdGhpbmctYWItcmFkaXVzKTtcbiAgYm94LXNoYWRvdzogdmFyKC0tc2xvdGhpbmctYWItc2hhZG93KTtcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgei1pbmRleDogMTtcbn1cblxuLnNsb3RoaW5nLWFiLXBvcG92ZXJfX2hlYWRlciB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcbiAgcGFkZGluZzogOHB4IDEwcHg7XG4gIGJhY2tncm91bmQ6IHZhcigtLXNsb3RoaW5nLWFiLWJnLXNvZnQpO1xuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgdmFyKC0tc2xvdGhpbmctYWItYm9yZGVyKTtcbn1cblxuLnNsb3RoaW5nLWFiLXBvcG92ZXJfX3RpdGxlIHtcbiAgbWFyZ2luOiAwO1xuICBmb250LXNpemU6IDEycHg7XG4gIGZvbnQtd2VpZ2h0OiA2MDA7XG4gIGNvbG9yOiB2YXIoLS1zbG90aGluZy1hYi10ZXh0KTtcbn1cblxuLnNsb3RoaW5nLWFiLXBvcG92ZXJfX2Nsb3NlIHtcbiAgd2lkdGg6IDE4cHg7XG4gIGhlaWdodDogMThweDtcbiAgcGFkZGluZzogMDtcbiAgYm9yZGVyOiAwO1xuICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDtcbiAgY29sb3I6IHZhcigtLXNsb3RoaW5nLWFiLXRleHQtbXV0ZWQpO1xuICBmb250LXNpemU6IDE2cHg7XG4gIGxpbmUtaGVpZ2h0OiAxO1xuICBjdXJzb3I6IHBvaW50ZXI7XG4gIGJvcmRlci1yYWRpdXM6IDRweDtcbn1cblxuLnNsb3RoaW5nLWFiLXBvcG92ZXJfX2Nsb3NlOmhvdmVyIHtcbiAgYmFja2dyb3VuZDogdmFyKC0tc2xvdGhpbmctYWItcHJpbWFyeS1zb2Z0KTtcbiAgY29sb3I6IHZhcigtLXNsb3RoaW5nLWFiLXByaW1hcnktaG92ZXIpO1xufVxuXG4uc2xvdGhpbmctYWItcG9wb3Zlcl9fYm9keSB7XG4gIGZsZXg6IDEgMSBhdXRvO1xuICBvdmVyZmxvdy15OiBhdXRvO1xuICBwYWRkaW5nOiA2cHg7XG59XG5cbi5zbG90aGluZy1hYi1wb3BvdmVyX19zdGF0dXMge1xuICBtYXJnaW46IDhweCA2cHg7XG4gIGNvbG9yOiB2YXIoLS1zbG90aGluZy1hYi10ZXh0LW11dGVkKTtcbiAgZm9udC1zaXplOiAxMnB4O1xufVxuXG4uc2xvdGhpbmctYWItcG9wb3Zlcl9fc3RhdHVzLS1lcnJvciB7XG4gIGNvbG9yOiAjYjkxYzFjO1xufVxuXG4uc2xvdGhpbmctYWItbWF0Y2gge1xuICBkaXNwbGF5OiBncmlkO1xuICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IDFmciBhdXRvO1xuICBncmlkLXRlbXBsYXRlLWFyZWFzOlxuICAgIFwicXVlc3Rpb24gc2NvcmVcIlxuICAgIFwiYW5zd2VyIGFuc3dlclwiO1xuICBnYXA6IDJweCA2cHg7XG4gIHdpZHRoOiAxMDAlO1xuICBwYWRkaW5nOiA2cHggOHB4O1xuICBtYXJnaW46IDJweCAwO1xuICBib3JkZXI6IDA7XG4gIGJvcmRlci1yYWRpdXM6IHZhcigtLXNsb3RoaW5nLWFiLXJhZGl1cy1zbSk7XG4gIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50O1xuICBjdXJzb3I6IHBvaW50ZXI7XG4gIHRleHQtYWxpZ246IGxlZnQ7XG4gIGZvbnQ6IGluaGVyaXQ7XG4gIGNvbG9yOiBpbmhlcml0O1xufVxuXG4uc2xvdGhpbmctYWItbWF0Y2g6aG92ZXIsXG4uc2xvdGhpbmctYWItbWF0Y2g6Zm9jdXMtdmlzaWJsZSB7XG4gIGJhY2tncm91bmQ6IHZhcigtLXNsb3RoaW5nLWFiLXByaW1hcnktc29mdCk7XG4gIG91dGxpbmU6IG5vbmU7XG59XG5cbi5zbG90aGluZy1hYi1tYXRjaF9fcXVlc3Rpb24ge1xuICBncmlkLWFyZWE6IHF1ZXN0aW9uO1xuICBmb250LXdlaWdodDogNjAwO1xuICBmb250LXNpemU6IDEycHg7XG4gIGNvbG9yOiB2YXIoLS1zbG90aGluZy1hYi10ZXh0KTtcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7XG4gIHdoaXRlLXNwYWNlOiBub3dyYXA7XG59XG5cbi5zbG90aGluZy1hYi1tYXRjaF9fYW5zd2VyIHtcbiAgZ3JpZC1hcmVhOiBhbnN3ZXI7XG4gIGZvbnQtc2l6ZTogMTFweDtcbiAgY29sb3I6IHZhcigtLXNsb3RoaW5nLWFiLXRleHQtbXV0ZWQpO1xuICBvdmVyZmxvdzogaGlkZGVuO1xuICB0ZXh0LW92ZXJmbG93OiBlbGxpcHNpcztcbiAgZGlzcGxheTogLXdlYmtpdC1ib3g7XG4gIC13ZWJraXQtbGluZS1jbGFtcDogMjtcbiAgLXdlYmtpdC1ib3gtb3JpZW50OiB2ZXJ0aWNhbDtcbn1cblxuLnNsb3RoaW5nLWFiLW1hdGNoX19zY29yZSB7XG4gIGdyaWQtYXJlYTogc2NvcmU7XG4gIGFsaWduLXNlbGY6IHN0YXJ0O1xuICBmb250LXNpemU6IDEwcHg7XG4gIGZvbnQtd2VpZ2h0OiA2MDA7XG4gIGNvbG9yOiB2YXIoLS1zbG90aGluZy1hYi1wcmltYXJ5LWhvdmVyKTtcbiAgYmFja2dyb3VuZDogdmFyKC0tc2xvdGhpbmctYWItcHJpbWFyeS1zb2Z0KTtcbiAgcGFkZGluZzogMXB4IDZweDtcbiAgYm9yZGVyLXJhZGl1czogOTk5cHg7XG59XG5cbi5zbG90aGluZy1hYi1wb3BvdmVyX19mb290ZXIge1xuICBwYWRkaW5nOiA2cHg7XG4gIGJvcmRlci10b3A6IDFweCBzb2xpZCB2YXIoLS1zbG90aGluZy1hYi1ib3JkZXIpO1xuICBiYWNrZ3JvdW5kOiB2YXIoLS1zbG90aGluZy1hYi1iZy1zb2Z0KTtcbn1cblxuLnNsb3RoaW5nLWFiLXBvcG92ZXJfX2dlbmVyYXRlIHtcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xuICB3aWR0aDogMTAwJTtcbiAgcGFkZGluZzogNnB4IDhweDtcbiAgYm9yZGVyOiAwO1xuICBib3JkZXItcmFkaXVzOiB2YXIoLS1zbG90aGluZy1hYi1yYWRpdXMtc20pO1xuICBiYWNrZ3JvdW5kOiB2YXIoLS1zbG90aGluZy1hYi1wcmltYXJ5KTtcbiAgY29sb3I6IHZhcigtLXNsb3RoaW5nLWFiLXN1cmZhY2UpO1xuICBmb250LXNpemU6IDEycHg7XG4gIGZvbnQtd2VpZ2h0OiA2MDA7XG4gIGN1cnNvcjogcG9pbnRlcjtcbn1cblxuLnNsb3RoaW5nLWFiLXBvcG92ZXJfX2dlbmVyYXRlOmhvdmVyIHtcbiAgYmFja2dyb3VuZDogdmFyKC0tc2xvdGhpbmctYWItcHJpbWFyeS1ob3Zlcik7XG59XG5cbi5zbG90aGluZy1hYi1wb3BvdmVyX19nZW5lcmF0ZTpmb2N1cy12aXNpYmxlIHtcbiAgb3V0bGluZTogMnB4IHNvbGlkIHZhcigtLXNsb3RoaW5nLWFiLWJyYW5kKTtcbiAgb3V0bGluZS1vZmZzZXQ6IDJweDtcbn1cbmA7XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLy8gUDIvIzM1IOKAlCBJbmxpbmUgYW5zd2VyLWJhbmsgc2VhcmNoIG9uIGxvbmcgdGV4dGFyZWFzLlxuLy9cbi8vIFNjYW5zIHRleHRhcmVhcyB3aGVyZTpcbi8vICAgLSBtYXhsZW5ndGggPiAzMDAgT1Igbm8gbWF4bGVuZ3RoXG4vLyAgIC0gQU5EIHRoZSBhc3NvY2lhdGVkIGxhYmVsIG1hdGNoZXMgTEFCRUxfTUFUQ0hfUkVHRVhcbi8vIGFuZCBkZWNvcmF0ZXMgZWFjaCBtYXRjaCB3aXRoIGEgMTZ4MTYgXCJsaWdodGJ1bGJcIiBhZmZvcmRhbmNlIHBpbm5lZCB0byB0aGVcbi8vIHRleHRhcmVhJ3MgdG9wLXJpZ2h0IGNvcm5lci4gQ2xpY2tpbmcgdGhlIGFmZm9yZGFuY2UgdG9nZ2xlcyBhIHBvcG92ZXJcbi8vIHNob3dpbmcgdGhlIHRvcCAzIGFuc3dlci1iYW5rIG1hdGNoZXMgcGx1cyBhIFwiR2VuZXJhdGUgbmV3XCIgYnV0dG9uLlxuLy9cbi8vIFJlbmRlcmluZyBmb2xsb3dzIHRoZSBzYW1lIHBhdHRlcm4gYXMgdGhlIGluLXBhZ2Ugc2lkZWJhclxuLy8gKGBhcHBzL2V4dGVuc2lvbi9zcmMvY29udGVudC9zaWRlYmFyL2NvbnRyb2xsZXIudHN4YCk6IG9uZSBzaGFkb3ctRE9NIGhvc3Rcbi8vIHBlciB0ZXh0YXJlYSwgUmVhY3QgcmVuZGVycyBpbnNpZGUgdGhlIHNoYWRvdyByb290LiBXZSBETyBOT1QgaW1wb3J0IHRoZVxuLy8gc2lkZWJhcidzIGRlc2lnbiDigJQgd2UgbWlycm9yIHRoZSBwb3B1cCB0b2tlbnMgbG9jYWxseSBpblxuLy8gYGFwcHMvZXh0ZW5zaW9uL3NyYy9jb250ZW50L3VpL3N0eWxlcy5jc3NgIGluc3RlYWQuXG4vL1xuLy8gSU1QT1JUQU5UOiB0aGlzIG1vZHVsZSBpcyBhbHNvIGltcG9ydGVkIGJ5IGEgdW5pdCB0ZXN0IGluIGEganNkb21cbi8vIGVudmlyb25tZW50LiBBbnl0aGluZyB0aGF0IG5lZWRzIGBjcmVhdGVSb290YCBvciBjaHJvbWUgQVBJcyBpcyBsYXppbHlcbi8vIHJlc29sdmVkICh0aGUgcHJlZGljYXRlICsgcmVnZXggYXJlIHB1cmUgaGVscGVycykuXG5pbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVJlZiwgdXNlU3RhdGUsIH0gZnJvbSBcInJlYWN0XCI7XG4vLyBNYXRjaGVzIGFwcGxpY2F0aW9uIGVzc2F5IHByb21wdHMgKFwiVGVsbCB1cyBhYm91dCBhIHRpbWXigKZcIiwgXCJXaHkgYXJlIHlvdVxuLy8gaW50ZXJlc3RlZCBpbiB0aGlzIHJvbGU/XCIsIFwiRGVzY3JpYmUgYSBjaGFsbGVuZ2UgeW91J3ZlIG92ZXJjb21lXCIsIGV0Yy4pLlxuLy8gS2VlcCB0aGlzIGxpc3QgYWxpZ25lZCB3aXRoIHRoZSBzcGVjIGluIGRvY3MvZXh0ZW5zaW9uLXJvYWRtYXAtMjAyNi0wNS5tZCAjMzVcbi8vIOKAlCBETyBOT1QgYnJvYWRlbiB3aXRob3V0IGEgcm9hZG1hcCB1cGRhdGUuXG5leHBvcnQgY29uc3QgTEFCRUxfTUFUQ0hfUkVHRVggPSAvdGVsbCB1cyBhYm91dHxkZXNjcmliZSBhfHdoeSBhcmUgeW91IGludGVyZXN0ZWR8d2h5IHRoaXMgY29tcGFueXx3aGF0IG1vdGl2YXRlc3xiaWdnZXN0IGNoYWxsZW5nZS9pO1xuLy8gMzAwIGNoYXJhY3RlciBtaW5pbXVtIG1heGxlbmd0aCB0byBjb3VudCBhcyBhIFwibG9uZ1wiIHRleHRhcmVhLiBBbnl0aGluZ1xuLy8gYmVsb3cgMzAwIGlzIGFsbW9zdCBjZXJ0YWlubHkgYSBzaG9ydC1hbnN3ZXIgZmllbGQgdGhhdCBkb2Vzbid0IG5lZWQgdGhlXG4vLyBhbnN3ZXItYmFuayBzdXJmYWNlLiBUZXh0YXJlYXMgd2l0aCBubyBtYXhsZW5ndGggYXQgYWxsIGFsc28gcXVhbGlmeS5cbmV4cG9ydCBjb25zdCBMT05HX1RFWFRBUkVBX01JTl9NQVhMRU5HVEggPSAzMDA7XG4vLyBFeHRyYWN0cyB0aGUgdGV4dCBhc3NvY2lhdGVkIHdpdGggYSB0ZXh0YXJlYS4gVHJpZXMsIGluIG9yZGVyOlxuLy8gICAxLiBhcmlhLWxhYmVsIG9uIHRoZSB0ZXh0YXJlYSBpdHNlbGZcbi8vICAgMi4gYXJpYS1sYWJlbGxlZGJ5IHBvaW50aW5nIHRvIG9uZSBvciBtb3JlIGVsZW1lbnRzXG4vLyAgIDMuIDxsYWJlbCBmb3I9XCJ0ZXh0YXJlYUlkXCI+XG4vLyAgIDQuIGFuIGFuY2VzdG9yIDxsYWJlbD5cbi8vICAgNS4gdGhlIHBsYWNlaG9sZGVyLCBhcyBhIGxhc3QgcmVzb3J0XG4vLyBSZXR1cm5zIHRoZSB0cmltbWVkIHN0cmluZywgb3IgXCJcIiBpZiBubyBsYWJlbCBjb3VsZCBiZSBmb3VuZC5cbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0VGV4dGFyZWFMYWJlbCh0ZXh0YXJlYSkge1xuICAgIGNvbnN0IGFyaWFMYWJlbCA9IHRleHRhcmVhLmdldEF0dHJpYnV0ZShcImFyaWEtbGFiZWxcIik7XG4gICAgaWYgKGFyaWFMYWJlbCAmJiBhcmlhTGFiZWwudHJpbSgpKVxuICAgICAgICByZXR1cm4gYXJpYUxhYmVsLnRyaW0oKTtcbiAgICBjb25zdCBsYWJlbGxlZEJ5ID0gdGV4dGFyZWEuZ2V0QXR0cmlidXRlKFwiYXJpYS1sYWJlbGxlZGJ5XCIpO1xuICAgIGlmIChsYWJlbGxlZEJ5ICYmIHRleHRhcmVhLm93bmVyRG9jdW1lbnQpIHtcbiAgICAgICAgY29uc3QgcGFydHMgPSBsYWJlbGxlZEJ5XG4gICAgICAgICAgICAuc3BsaXQoL1xccysvKVxuICAgICAgICAgICAgLm1hcCgoaWQpID0+IHRleHRhcmVhLm93bmVyRG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpKVxuICAgICAgICAgICAgLmZpbHRlcigoZWwpID0+IEJvb2xlYW4oZWwpKVxuICAgICAgICAgICAgLm1hcCgoZWwpID0+IGVsLnRleHRDb250ZW50Py50cmltKCkgfHwgXCJcIilcbiAgICAgICAgICAgIC5maWx0ZXIoQm9vbGVhbik7XG4gICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPiAwKVxuICAgICAgICAgICAgcmV0dXJuIHBhcnRzLmpvaW4oXCIgXCIpLnRyaW0oKTtcbiAgICB9XG4gICAgY29uc3QgaWQgPSB0ZXh0YXJlYS5pZDtcbiAgICBpZiAoaWQgJiYgdGV4dGFyZWEub3duZXJEb2N1bWVudCkge1xuICAgICAgICAvLyBDU1MuZXNjYXBlIGlzbid0IGF2YWlsYWJsZSBpbiBhbGwganNkb20gYnVpbGRzOyBkbyBhIG1hbnVhbCBlc2NhcGUgb24gdGhlXG4gICAgICAgIC8vIHZlcnkgbmFycm93IHNldCBvZiBjaGFyYWN0ZXJzIHRoYXQgY291bGQgYXBwZWFyIGluIGFuIEhUTUwgaWQuXG4gICAgICAgIGNvbnN0IGVzY2FwZWRJZCA9IGlkLnJlcGxhY2UoLyhbXCJcXFxcXFxdXSkvZywgXCJcXFxcJDFcIik7XG4gICAgICAgIGNvbnN0IGV4cGxpY2l0ID0gdGV4dGFyZWEub3duZXJEb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBsYWJlbFtmb3I9XCIke2VzY2FwZWRJZH1cIl1gKTtcbiAgICAgICAgaWYgKGV4cGxpY2l0Py50ZXh0Q29udGVudD8udHJpbSgpKVxuICAgICAgICAgICAgcmV0dXJuIGV4cGxpY2l0LnRleHRDb250ZW50LnRyaW0oKTtcbiAgICB9XG4gICAgbGV0IHBhcmVudCA9IHRleHRhcmVhLnBhcmVudEVsZW1lbnQ7XG4gICAgd2hpbGUgKHBhcmVudCkge1xuICAgICAgICBpZiAocGFyZW50LnRhZ05hbWUgPT09IFwiTEFCRUxcIiAmJiBwYXJlbnQudGV4dENvbnRlbnQ/LnRyaW0oKSkge1xuICAgICAgICAgICAgLy8gU3RyaXAgb3V0IHRoZSB0ZXh0YXJlYSdzIG93biB2YWx1ZS9jb250ZW50IGZyb20gdGhlIGFuY2VzdG9yIGxhYmVsXG4gICAgICAgICAgICAvLyB0ZXh0LiBXZSBkbyB0aGlzIG5haXZlbHkgYnkgcmVwbGFjaW5nIHRoZSB0ZXh0YXJlYSdzIHZhbHVlIGlmIGl0XG4gICAgICAgICAgICAvLyBhcHBlYXJzIGFzIGEgc3Vic3RyaW5nLlxuICAgICAgICAgICAgY29uc3QgdGV4dCA9IHBhcmVudC50ZXh0Q29udGVudC50cmltKCk7XG4gICAgICAgICAgICBjb25zdCBvd25WYWx1ZSA9IHRleHRhcmVhLnZhbHVlIHx8IFwiXCI7XG4gICAgICAgICAgICBjb25zdCBjbGVhbmVkID0gb3duVmFsdWUgPyB0ZXh0LnJlcGxhY2Uob3duVmFsdWUsIFwiXCIpLnRyaW0oKSA6IHRleHQ7XG4gICAgICAgICAgICBpZiAoY2xlYW5lZClcbiAgICAgICAgICAgICAgICByZXR1cm4gY2xlYW5lZDtcbiAgICAgICAgfVxuICAgICAgICBwYXJlbnQgPSBwYXJlbnQucGFyZW50RWxlbWVudDtcbiAgICB9XG4gICAgY29uc3QgcGxhY2Vob2xkZXIgPSB0ZXh0YXJlYS5wbGFjZWhvbGRlcj8udHJpbSgpO1xuICAgIGlmIChwbGFjZWhvbGRlcilcbiAgICAgICAgcmV0dXJuIHBsYWNlaG9sZGVyO1xuICAgIHJldHVybiBcIlwiO1xufVxuLy8gUHJlZGljYXRlOiBzaG91bGQgd2UgZGVjb3JhdGUgdGhpcyB0ZXh0YXJlYSB3aXRoIHRoZSDwn5KhIGFmZm9yZGFuY2U/XG4vLyBQdXJlIGZ1bmN0aW9uIOKAlCBubyBET00gbXV0YXRpb25zLCBzYWZlIHRvIGNhbGwgZnJvbSBhIE11dGF0aW9uT2JzZXJ2ZXIuXG5leHBvcnQgZnVuY3Rpb24gc2hvdWxkRGVjb3JhdGVUZXh0YXJlYSh0ZXh0YXJlYSkge1xuICAgIC8vIFNraXAgZGlzYWJsZWQgLyBoaWRkZW4gLyByZWFkb25seSB0ZXh0YXJlYXMuXG4gICAgaWYgKHRleHRhcmVhLmRpc2FibGVkIHx8IHRleHRhcmVhLnJlYWRPbmx5KVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgaWYgKHRleHRhcmVhLmdldEF0dHJpYnV0ZShcImFyaWEtaGlkZGVuXCIpID09PSBcInRydWVcIilcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIGlmICh0ZXh0YXJlYS50eXBlID09PSBcImhpZGRlblwiKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgLy8gTGVuZ3RoIGZpbHRlcjogbWF4bGVuZ3RoID4gMzAwIE9SIG5vIG1heGxlbmd0aCBhdHRyaWJ1dGUgYXQgYWxsLlxuICAgIC8vIE5vdGUgYHRleHRhcmVhLm1heExlbmd0aGAgcmV0dXJucyAtMSB3aGVuIHRoZSBhdHRyaWJ1dGUgaXMgYWJzZW50LlxuICAgIGNvbnN0IGhhc0F0dHIgPSB0ZXh0YXJlYS5oYXNBdHRyaWJ1dGUoXCJtYXhsZW5ndGhcIik7XG4gICAgaWYgKGhhc0F0dHIpIHtcbiAgICAgICAgY29uc3QgbWF4ID0gdGV4dGFyZWEubWF4TGVuZ3RoO1xuICAgICAgICBpZiAoIShtYXggPiBMT05HX1RFWFRBUkVBX01JTl9NQVhMRU5HVEgpKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCBsYWJlbCA9IGV4dHJhY3RUZXh0YXJlYUxhYmVsKHRleHRhcmVhKTtcbiAgICBpZiAoIWxhYmVsKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIExBQkVMX01BVENIX1JFR0VYLnRlc3QobGFiZWwpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIEFuc3dlckJhbmtCdXR0b24ocHJvcHMpIHtcbiAgICBjb25zdCBbb3Blbiwgc2V0T3Blbl0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW21hdGNoZXMsIHNldE1hdGNoZXNdID0gdXNlU3RhdGUoW10pO1xuICAgIGNvbnN0IGNvbnRhaW5lclJlZiA9IHVzZVJlZihudWxsKTtcbiAgICAvLyBDbG9zZSBvbiBFc2NhcGUsIGNsb3NlIG9uIG91dHNpZGUtY2xpY2suIEJvdGggZWZmZWN0cyBvbmx5IGF0dGFjaCB3aGlsZVxuICAgIC8vIHRoZSBwb3BvdmVyIGlzIG9wZW4gc28gd2UgbmV2ZXIgbGVhayBsaXN0ZW5lcnMuXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgaWYgKCFvcGVuKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBmdW5jdGlvbiBoYW5kbGVEb2NDbGljayhldmVudCkge1xuICAgICAgICAgICAgY29uc3QgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xuICAgICAgICAgICAgaWYgKCF0YXJnZXQpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKGNvbnRhaW5lclJlZi5jdXJyZW50ICYmIGNvbnRhaW5lclJlZi5jdXJyZW50LmNvbnRhaW5zKHRhcmdldCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgc2V0T3BlbihmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gaGFuZGxlRG9jS2V5KGV2ZW50KSB7XG4gICAgICAgICAgICBpZiAoZXZlbnQua2V5ID09PSBcIkVzY2FwZVwiKSB7XG4gICAgICAgICAgICAgICAgc2V0T3BlbihmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gYG1vdXNlZG93bmAgZmlyZXMgYmVmb3JlIGFueSBuZXN0ZWQgY2xpY2ssIHNvIHdlIGF2b2lkIHRoZSBcImNsaWNrIGNsb3Nlc1xuICAgICAgICAvLyBiZWZvcmUgdGhlIHBpY2tlZCBhbnN3ZXIncyBjbGljayBmaXJlc1wiIHJhY2UuXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgaGFuZGxlRG9jQ2xpY2ssIHRydWUpO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBoYW5kbGVEb2NLZXksIHRydWUpO1xuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCBoYW5kbGVEb2NDbGljaywgdHJ1ZSk7XG4gICAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBoYW5kbGVEb2NLZXksIHRydWUpO1xuICAgICAgICB9O1xuICAgIH0sIFtvcGVuXSk7XG4gICAgLy8gRmV0Y2ggbWF0Y2hlcyB3aGVuIHRoZSBwb3BvdmVyIG9wZW5zIChvciB3aGVuIHRoZSBxdWVzdGlvbiBjaGFuZ2VzIHdoaWxlXG4gICAgLy8gb3BlbikuIFdlIHJlZmV0Y2ggb24gZWFjaCBvcGVuIHNvIHRoZSBiYW5rIHN0YXlzIGZyZXNoLlxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGlmICghb3BlbilcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgbGV0IGNhbmNlbGxlZCA9IGZhbHNlO1xuICAgICAgICBzZXRMb2FkaW5nKHRydWUpO1xuICAgICAgICBzZXRFcnJvcihudWxsKTtcbiAgICAgICAgcHJvcHNcbiAgICAgICAgICAgIC5vbk1hdGNoKHByb3BzLnF1ZXN0aW9uLCAzKVxuICAgICAgICAgICAgLnRoZW4oKHJlc3VsdHMpID0+IHtcbiAgICAgICAgICAgIGlmIChjYW5jZWxsZWQpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgc2V0TWF0Y2hlcyhyZXN1bHRzLnNsaWNlKDAsIDMpKTtcbiAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICBpZiAoY2FuY2VsbGVkKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIHNldEVycm9yKGVycj8ubWVzc2FnZSB8fCBcIkNvdWxkbid0IHJlYWNoIFNsb3RoaW5nLlwiKTtcbiAgICAgICAgfSlcbiAgICAgICAgICAgIC5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgICAgIGlmICghY2FuY2VsbGVkKVxuICAgICAgICAgICAgICAgIHNldExvYWRpbmcoZmFsc2UpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIGNhbmNlbGxlZCA9IHRydWU7XG4gICAgICAgIH07XG4gICAgfSwgW29wZW4sIHByb3BzLnF1ZXN0aW9uXSk7XG4gICAgZnVuY3Rpb24gaGFuZGxlQnV0dG9uS2V5KGV2ZW50KSB7XG4gICAgICAgIGlmIChldmVudC5rZXkgPT09IFwiRW50ZXJcIiB8fCBldmVudC5rZXkgPT09IFwiIFwiKSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgc2V0T3BlbigodikgPT4gIXYpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyByZWY6IGNvbnRhaW5lclJlZiwgY2xhc3NOYW1lOiBcInNsb3RoaW5nLWFiLXJvb3RcIiwgXCJkYXRhLXRlc3RpZFwiOiBcInNsb3RoaW5nLWFiLXJvb3RcIiwgY2hpbGRyZW46IFtfanN4KFwiYnV0dG9uXCIsIHsgdHlwZTogXCJidXR0b25cIiwgY2xhc3NOYW1lOiBcInNsb3RoaW5nLWFiLWJ1dHRvblwiLCBcImFyaWEtbGFiZWxcIjogXCJPcGVuIFNsb3RoaW5nIGFuc3dlciBiYW5rXCIsIHRpdGxlOiBcIlNsb3RoaW5nIGFuc3dlciBiYW5rXCIsIFxuICAgICAgICAgICAgICAgIC8vIE9ubHkgZm9jdXNhYmxlIHdoaWxlIHRoZSBwb3BvdmVyIGlzIG9wZW4uIFBlciBzcGVjIHdlIGRvbid0IHdhbnQgdG9cbiAgICAgICAgICAgICAgICAvLyBoaWphY2sgdGFiIG9yZGVyIG9uIGxvbmcgZm9ybXMg4oCUIHRoZSB1c2VyIHJlYWNoZXMgdGhlIGJ1dHRvbiBieVxuICAgICAgICAgICAgICAgIC8vIGNsaWNraW5nLCBub3QgdGFiYmluZy5cbiAgICAgICAgICAgICAgICB0YWJJbmRleDogb3BlbiA/IDAgOiAtMSwgb25DbGljazogKCkgPT4gc2V0T3BlbigodikgPT4gIXYpLCBvbktleURvd246IGhhbmRsZUJ1dHRvbktleSwgY2hpbGRyZW46IF9qc3goXCJzcGFuXCIsIHsgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiwgY2xhc3NOYW1lOiBcInNsb3RoaW5nLWFiLWljb25cIiwgY2hpbGRyZW46IFwiXFx1RDgzRFxcdURDQTFcIiB9KSB9KSwgb3BlbiAmJiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwic2xvdGhpbmctYWItcG9wb3ZlclwiLCByb2xlOiBcImRpYWxvZ1wiLCBcImFyaWEtbGFiZWxcIjogXCJTYXZlZCBhbnN3ZXJzXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJoZWFkZXJcIiwgeyBjbGFzc05hbWU6IFwic2xvdGhpbmctYWItcG9wb3Zlcl9faGVhZGVyXCIsIGNoaWxkcmVuOiBbX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwic2xvdGhpbmctYWItcG9wb3Zlcl9fdGl0bGVcIiwgY2hpbGRyZW46IFwiU2F2ZWQgYW5zd2Vyc1wiIH0pLCBfanN4KFwiYnV0dG9uXCIsIHsgdHlwZTogXCJidXR0b25cIiwgY2xhc3NOYW1lOiBcInNsb3RoaW5nLWFiLXBvcG92ZXJfX2Nsb3NlXCIsIFwiYXJpYS1sYWJlbFwiOiBcIkNsb3NlXCIsIG9uQ2xpY2s6ICgpID0+IHNldE9wZW4oZmFsc2UpLCBjaGlsZHJlbjogXCJcXHUwMEQ3XCIgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJzbG90aGluZy1hYi1wb3BvdmVyX19ib2R5XCIsIGNoaWxkcmVuOiBbbG9hZGluZyAmJiAoX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwic2xvdGhpbmctYWItcG9wb3Zlcl9fc3RhdHVzXCIsIGNoaWxkcmVuOiBcIlNlYXJjaGluZ1xcdTIwMjZcIiB9KSksIGVycm9yICYmIChfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJzbG90aGluZy1hYi1wb3BvdmVyX19zdGF0dXMgc2xvdGhpbmctYWItcG9wb3Zlcl9fc3RhdHVzLS1lcnJvclwiLCByb2xlOiBcInN0YXR1c1wiLCBjaGlsZHJlbjogZXJyb3IgfSkpLCAhbG9hZGluZyAmJiAhZXJyb3IgJiYgbWF0Y2hlcy5sZW5ndGggPT09IDAgJiYgKF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInNsb3RoaW5nLWFiLXBvcG92ZXJfX3N0YXR1c1wiLCBjaGlsZHJlbjogXCJObyBzYXZlZCBhbnN3ZXJzIHlldC4gVHJ5IEdlbmVyYXRlIG5ldyBcXHUyMTkyXCIgfSkpLCBtYXRjaGVzLm1hcCgobWF0Y2gpID0+IChfanN4cyhcImJ1dHRvblwiLCB7IHR5cGU6IFwiYnV0dG9uXCIsIGNsYXNzTmFtZTogXCJzbG90aGluZy1hYi1tYXRjaFwiLCBvbkNsaWNrOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wcy5vblBpY2sobWF0Y2gpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0T3BlbihmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGNoaWxkcmVuOiBbX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwic2xvdGhpbmctYWItbWF0Y2hfX3F1ZXN0aW9uXCIsIGNoaWxkcmVuOiBtYXRjaC5xdWVzdGlvbiB9KSwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwic2xvdGhpbmctYWItbWF0Y2hfX2Fuc3dlclwiLCBjaGlsZHJlbjogdHJ1bmNhdGUobWF0Y2guYW5zd2VyLCA4MCkgfSksIF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJzbG90aGluZy1hYi1tYXRjaF9fc2NvcmVcIiwgXCJhcmlhLWxhYmVsXCI6IGBNYXRjaCAke01hdGgucm91bmQoKG1hdGNoLnNjb3JlID8/IDApICogMTAwKX0gcGVyY2VudGAsIGNoaWxkcmVuOiBbTWF0aC5yb3VuZCgobWF0Y2guc2NvcmUgPz8gMCkgKiAxMDApLCBcIiVcIl0gfSldIH0sIG1hdGNoLmlkKSkpXSB9KSwgX2pzeChcImZvb3RlclwiLCB7IGNsYXNzTmFtZTogXCJzbG90aGluZy1hYi1wb3BvdmVyX19mb290ZXJcIiwgY2hpbGRyZW46IF9qc3goXCJidXR0b25cIiwgeyB0eXBlOiBcImJ1dHRvblwiLCBjbGFzc05hbWU6IFwic2xvdGhpbmctYWItcG9wb3Zlcl9fZ2VuZXJhdGVcIiwgb25DbGljazogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wcy5vbkdlbmVyYXRlKHByb3BzLnF1ZXN0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0T3BlbihmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgY2hpbGRyZW46IFwiR2VuZXJhdGUgbmV3XCIgfSkgfSldIH0pKV0gfSkpO1xufVxuLy8gVHJ1bmNhdGUgYSBzdHJpbmcgYXQgYG1heGAgY2hhcmFjdGVycywgYXBwZW5kaW5nIGFuIGVsbGlwc2lzIHdoZW4gY2xpcHBlZC5cbi8vIFB1cmUgaGVscGVyIHNvIHRlc3RzIGNhbiBhc3NlcnQgYmVoYXZpb3VyIGRldGVybWluaXN0aWNhbGx5LlxuZXhwb3J0IGZ1bmN0aW9uIHRydW5jYXRlKGlucHV0LCBtYXgpIHtcbiAgICBpZiAoaW5wdXQubGVuZ3RoIDw9IG1heClcbiAgICAgICAgcmV0dXJuIGlucHV0O1xuICAgIHJldHVybiBgJHtpbnB1dC5zbGljZSgwLCBtYXgpLnRyaW1FbmQoKX3igKZgO1xufVxuLy8gLS0tLSBEZWNvcmF0b3IgQVBJIChtb3VudC91bm1vdW50KSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vL1xuLy8gVGhpcyBtb2R1bGUgaXMgbG9hZGVkIGJ5IGJvdGgganNkb20gdW5pdCB0ZXN0cyAod2hpY2ggb25seSBleGVyY2lzZSB0aGVcbi8vIHJlZ2V4L3ByZWRpY2F0ZSBleHBvcnRzIGFib3ZlKSBhbmQgdGhlIHJlYWwgY29udGVudCBzY3JpcHQuIEFueXRoaW5nIGJlbG93XG4vLyB1c2VzIGByZWFjdC1kb20vY2xpZW50YCBhbmQgbWF5IHRvdWNoIGNocm9tZSBBUElzIGluZGlyZWN0bHkuXG5pbXBvcnQgeyBjcmVhdGVSb290IH0gZnJvbSBcInJlYWN0LWRvbS9jbGllbnRcIjtcbmltcG9ydCB7IEFOU1dFUl9CQU5LX0JVVFRPTl9TVFlMRVMgfSBmcm9tIFwiLi9hbnN3ZXItYmFuay1idXR0b24tc3R5bGVzXCI7XG5jb25zdCBERUNPUkFUSU9OX01BUktFUiA9IFwiX19zbG90aGluZ0FiRGVjb3JhdGVkXCI7XG5jb25zdCBIT1NUX0NMQVNTID0gXCJzbG90aGluZy1hYi1ob3N0XCI7XG4vLyBLZWVwIGEgcmVnaXN0cnkgc28gdW5tb3VudEFsbEFuc3dlckJhbmtCdXR0b25zKCkgY2FuIHRlYXIgZXZlcnl0aGluZyBkb3duIG9uXG4vLyBwYWdlaGlkZSB3aXRob3V0IGxlYWtpbmcgb2JzZXJ2ZXJzIG9yIFJlYWN0IHJvb3RzLlxuY29uc3QgbW91bnRlZERlY29yYXRpb25zID0gbmV3IFNldCgpO1xuZXhwb3J0IGZ1bmN0aW9uIG1vdW50QW5zd2VyQmFua0J1dHRvbih0ZXh0YXJlYSwgaGFuZGxlcnMpIHtcbiAgICAvLyBEZS1kdXBlOiBuZXZlciBkZWNvcmF0ZSB0aGUgc2FtZSB0ZXh0YXJlYSB0d2ljZS5cbiAgICBjb25zdCBtYXJrZWQgPSB0ZXh0YXJlYTtcbiAgICBpZiAobWFya2VkW0RFQ09SQVRJT05fTUFSS0VSXSlcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgbWFya2VkW0RFQ09SQVRJT05fTUFSS0VSXSA9IHRydWU7XG4gICAgY29uc3QgcXVlc3Rpb24gPSBleHRyYWN0VGV4dGFyZWFMYWJlbCh0ZXh0YXJlYSk7XG4gICAgaWYgKCFxdWVzdGlvbikge1xuICAgICAgICBtYXJrZWRbREVDT1JBVElPTl9NQVJLRVJdID0gZmFsc2U7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBob3N0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBob3N0LmNsYXNzTmFtZSA9IEhPU1RfQ0xBU1M7XG4gICAgLy8gQWJzb2x1dGUgcG9zaXRpb24gcmVsYXRpdmUgdG8gdGhlIGRvY3VtZW50IOKAlCB3ZSdsbCBrZWVwIHRoZSBob3N0IHBpbm5lZFxuICAgIC8vIHRvIHRoZSB0ZXh0YXJlYSdzIGJvdW5kaW5nIHJlY3QgdmlhIFJlc2l6ZU9ic2VydmVyICsgc2Nyb2xsIGxpc3RlbmVycy5cbiAgICBob3N0LnN0eWxlLnBvc2l0aW9uID0gXCJhYnNvbHV0ZVwiO1xuICAgIGhvc3Quc3R5bGUuekluZGV4ID0gXCIyMTQ3NDgzNjQwXCI7XG4gICAgaG9zdC5zdHlsZS5wb2ludGVyRXZlbnRzID0gXCJhdXRvXCI7XG4gICAgLy8gVGhlIGhvc3QgaXMgZml4ZWQtc2l6ZSAoMTZ4MTYgYnV0dG9uIGFyZWEpIGJ1dCB0aGUgcG9wb3ZlciBvdmVyZmxvd3NcbiAgICAvLyBvdXRzaWRlOyB3ZSBoaWRlIHRoZSBob3N0IG92ZXJmbG93IG9ubHkgd2hlbiBjb2xsYXBzZWQgdG8gYXZvaWQgc3RlYWxpbmdcbiAgICAvLyBjbGlja3MgZnJvbSB0aGUgcGFnZS5cbiAgICBob3N0LnN0eWxlLndpZHRoID0gXCIwXCI7XG4gICAgaG9zdC5zdHlsZS5oZWlnaHQgPSBcIjBcIjtcbiAgICBjb25zdCBzaGFkb3cgPSBob3N0LmF0dGFjaFNoYWRvdyh7IG1vZGU6IFwib3BlblwiIH0pO1xuICAgIGNvbnN0IHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xuICAgIHN0eWxlLnRleHRDb250ZW50ID0gQU5TV0VSX0JBTktfQlVUVE9OX1NUWUxFUztcbiAgICBzaGFkb3cuYXBwZW5kQ2hpbGQoc3R5bGUpO1xuICAgIGNvbnN0IG1vdW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBtb3VudC5kYXRhc2V0LnNsb3RoaW5nQWJNb3VudCA9IFwidHJ1ZVwiO1xuICAgIHNoYWRvdy5hcHBlbmRDaGlsZChtb3VudCk7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChob3N0KTtcbiAgICBjb25zdCByb290ID0gY3JlYXRlUm9vdChtb3VudCk7XG4gICAgZnVuY3Rpb24gcmVwb3NpdGlvbigpIHtcbiAgICAgICAgY29uc3QgcmVjdCA9IHRleHRhcmVhLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAvLyBQaW4gdG8gdGhlIHRvcC1yaWdodCBJTlNJREUgdGhlIHRleHRhcmVhJ3MgYm91bmRpbmcgYm94LiBUaGUgYnV0dG9uIGlzXG4gICAgICAgIC8vIDE2w5cxNiArIDRweCBwYWRkaW5nOyBwbGFjZSBpdCA2cHggZnJvbSB0aGUgdG9wLXJpZ2h0IGNvcm5lci5cbiAgICAgICAgY29uc3QgdG9wID0gcmVjdC50b3AgKyB3aW5kb3cuc2Nyb2xsWSArIDY7XG4gICAgICAgIGNvbnN0IHJpZ2h0ID0gcmVjdC5sZWZ0ICsgd2luZG93LnNjcm9sbFggKyByZWN0LndpZHRoIC0gNiAtIDE2OyAvKiBidXR0b24gd2lkdGggKi9cbiAgICAgICAgaG9zdC5zdHlsZS50b3AgPSBgJHt0b3B9cHhgO1xuICAgICAgICBob3N0LnN0eWxlLmxlZnQgPSBgJHtyaWdodH1weGA7XG4gICAgICAgIC8vIElmIHRoZSB0ZXh0YXJlYSBoYXMgYmVlbiByZW1vdmVkIG9yIGlzIG5vIGxvbmdlciBpbiB0aGUgbGF5b3V0IHRyZWUsXG4gICAgICAgIC8vIGhpZGUgdGhlIGhvc3Qgc28gd2UgZG9uJ3QgZHJhdyB0aGUgYnV0dG9uIGluIGFuIGFyYml0cmFyeSBsb2NhdGlvbi5cbiAgICAgICAgaWYgKHJlY3Qud2lkdGggPT09IDAgJiYgcmVjdC5oZWlnaHQgPT09IDApIHtcbiAgICAgICAgICAgIGhvc3Quc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaG9zdC5zdHlsZS5kaXNwbGF5ID0gXCJcIjtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXBvc2l0aW9uKCk7XG4gICAgLy8gUmUtcmVuZGVyIG9uIHRleHQgcmVzaXplIC8gcGFnZSByZWZsb3cgd2l0aG91dCBzcHJpbmtsaW5nIHJhZiBjYWxscy5cbiAgICBsZXQgcmVzaXplT2JzZXJ2ZXIgPSBudWxsO1xuICAgIGlmICh0eXBlb2YgUmVzaXplT2JzZXJ2ZXIgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgcmVzaXplT2JzZXJ2ZXIgPSBuZXcgUmVzaXplT2JzZXJ2ZXIocmVwb3NpdGlvbik7XG4gICAgICAgIHJlc2l6ZU9ic2VydmVyLm9ic2VydmUodGV4dGFyZWEpO1xuICAgIH1cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLCByZXBvc2l0aW9uLCB0cnVlKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCByZXBvc2l0aW9uKTtcbiAgICBmdW5jdGlvbiByZW5kZXJSb290KCkge1xuICAgICAgICByb290LnJlbmRlcihfanN4KEFuc3dlckJhbmtCdXR0b24sIHsgcXVlc3Rpb246IHF1ZXN0aW9uLCBvbk1hdGNoOiBoYW5kbGVycy5vbk1hdGNoLCBvblBpY2s6IChtYXRjaCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIEluc2VydCBpbnRvIHRoZSB0ZXh0YXJlYS4gUmVwbGFjZXMgZXhpc3RpbmcgdmFsdWUgcGVyIHNwZWMuXG4gICAgICAgICAgICAgICAgdGV4dGFyZWEudmFsdWUgPSBtYXRjaC5hbnN3ZXI7XG4gICAgICAgICAgICAgICAgdGV4dGFyZWEuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJpbnB1dFwiLCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xuICAgICAgICAgICAgICAgIHRleHRhcmVhLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwiY2hhbmdlXCIsIHsgYnViYmxlczogdHJ1ZSB9KSk7XG4gICAgICAgICAgICAgICAgaGFuZGxlcnMub25QaWNrKG1hdGNoKTtcbiAgICAgICAgICAgIH0sIG9uR2VuZXJhdGU6IChxKSA9PiBoYW5kbGVycy5vbkdlbmVyYXRlKHEpIH0pKTtcbiAgICB9XG4gICAgcmVuZGVyUm9vdCgpO1xuICAgIGNvbnN0IGRlY29yYXRpb24gPSB7XG4gICAgICAgIGhvc3QsXG4gICAgICAgIHJvb3QsXG4gICAgICAgIG9ic2VydmVyOiByZXNpemVPYnNlcnZlcixcbiAgICAgICAgdGV4dGFyZWEsXG4gICAgfTtcbiAgICBtb3VudGVkRGVjb3JhdGlvbnMuYWRkKGRlY29yYXRpb24pO1xuICAgIC8vIENsZWFudXAgaG9vayBvbiB0aGUgdGV4dGFyZWEg4oCUIGJlc3QtZWZmb3J0LiBXaGVuIHRoZSBob3N0IHRleHRhcmVhIGlzXG4gICAgLy8gZ2FyYmFnZS1jb2xsZWN0ZWQgdGhlIFdlYWtSZWYgc2V0IGlzIHRoZSBzb3VyY2Ugb2YgdHJ1dGguXG4gICAgY29uc3QgZGV0YWNoID0gKCkgPT4ge1xuICAgICAgICB1bm1vdW50RGVjb3JhdGlvbihkZWNvcmF0aW9uKTtcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJzY3JvbGxcIiwgcmVwb3NpdGlvbiwgdHJ1ZSk7XG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHJlcG9zaXRpb24pO1xuICAgIH07XG4gICAgdGV4dGFyZWEuX19zbG90aGluZ0FiRGV0YWNoID0gZGV0YWNoO1xuICAgIHJldHVybiBkZWNvcmF0aW9uO1xufVxuZnVuY3Rpb24gdW5tb3VudERlY29yYXRpb24oZGVjb3JhdGlvbikge1xuICAgIGlmICghbW91bnRlZERlY29yYXRpb25zLmhhcyhkZWNvcmF0aW9uKSlcbiAgICAgICAgcmV0dXJuO1xuICAgIG1vdW50ZWREZWNvcmF0aW9ucy5kZWxldGUoZGVjb3JhdGlvbik7XG4gICAgZGVjb3JhdGlvbi5vYnNlcnZlcj8uZGlzY29ubmVjdCgpO1xuICAgIHRyeSB7XG4gICAgICAgIGRlY29yYXRpb24ucm9vdC51bm1vdW50KCk7XG4gICAgfVxuICAgIGNhdGNoIHtcbiAgICAgICAgLy8gaWdub3JlXG4gICAgfVxuICAgIGRlY29yYXRpb24uaG9zdC5yZW1vdmUoKTtcbiAgICBjb25zdCBtYXJrZWQgPSBkZWNvcmF0aW9uLnRleHRhcmVhO1xuICAgIG1hcmtlZFtERUNPUkFUSU9OX01BUktFUl0gPSBmYWxzZTtcbiAgICBtYXJrZWQuX19zbG90aGluZ0FiRGV0YWNoID0gdW5kZWZpbmVkO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHVubW91bnRBbGxBbnN3ZXJCYW5rQnV0dG9ucygpIHtcbiAgICBmb3IgKGNvbnN0IGRlY29yYXRpb24gb2YgQXJyYXkuZnJvbShtb3VudGVkRGVjb3JhdGlvbnMpKSB7XG4gICAgICAgIHVubW91bnREZWNvcmF0aW9uKGRlY29yYXRpb24pO1xuICAgIH1cbn1cbi8vIFZpc2libGUtZm9yLXRlc3Rpbmcg4oCUIGxldCB0ZXN0cyBpbnNwZWN0IC8gcmVzZXQgbW91bnRlZCBzdGF0ZS5cbmV4cG9ydCBjb25zdCBfX3Rlc3QgPSB7XG4gICAgbW91bnRlZERlY29yYXRpb25zLFxuICAgIERFQ09SQVRJT05fTUFSS0VSLFxufTtcbiIsIi8vIE11bHRpLXN0ZXAgc2Vzc2lvbiBzdGF0ZSAoUDMgLyAjMzYgLyAjMzcpLlxuLy9cbi8vIFdoZW4gdGhlIHVzZXIgY29uZmlybXMgXCJBdXRvLWZpbGwgdGhpcyBhcHBsaWNhdGlvblwiIG9uIGEgbXVsdGktc3RlcCBBVFNcbi8vIGZsb3cgKFdvcmtkYXksIEdyZWVuaG91c2UpLCB3ZSBjYXB0dXJlIGEgc25hcHNob3Qgb2YgdGhlIHByb2ZpbGUgKyBiYXNlXG4vLyByZXN1bWUgKyBqb2IgVVJMIGFuZCBwZXJzaXN0IGl0IHVuZGVyIGBjaHJvbWUuc3RvcmFnZS5zZXNzaW9uYCBrZXllZCBieVxuLy8gdGhlIGN1cnJlbnQgdGFiSWQuIEVhY2ggc3Vic2VxdWVudCBzdGVwIHRyYW5zaXRpb24g4oCUIGVpdGhlciB2aWEgdGhlXG4vLyB3ZWJOYXZpZ2F0aW9uIGxpc3RlbmVyIChwcmVmZXJyZWQpIG9yIHZpYSB0aGUgcHJvbXB0ZWQgZmFsbGJhY2sgdG9hc3Qg4oCUXG4vLyBsb29rcyB1cCB0aGlzIHNuYXBzaG90IHRvIGZpbGwgdGhlIG5leHQgcGFnZSB3aXRob3V0IHJlLWFza2luZyB0aGUgdXNlci5cbi8vXG4vLyBUaGUgc2Vzc2lvbiBuYXR1cmFsbHkgY2xlYXJzIG9uOlxuLy8gLSBleHBsaWNpdCBgY2xlYXJTZXNzaW9uYCAoc3VibWl0IGNsaWNrLCBcIk5vXCIgb24gdGhlIGZhbGxiYWNrIHRvYXN0KVxuLy8gLSB0YWIgY2xvc2UgKGNocm9tZSB3aXBlcyBzZXNzaW9uIHN0b3JhZ2Ugd2hlbiB0aGUgdGFiIGlzIGdvbmUg4oCUIHdlIGFsc29cbi8vICAgY2xlYXIgb24gYHBhZ2VoaWRlYCBhcyBhIGJlbHQtYW5kLXN1c3BlbmRlcnMgZm9yIGJmY2FjaGUgcmVzdG9yZXMpXG4vLyAtIDMwIG1pbnV0ZXMgb2YgaW5hY3Rpdml0eSAoYGNvbmZpcm1lZEF0YCBUVEwpXG4vL1xuLy8gV2UgZGVsaWJlcmF0ZWx5IHVzZSBgY2hyb21lLnN0b3JhZ2Uuc2Vzc2lvbmAgaW5zdGVhZCBvZiBpbi1tZW1vcnkgc3RhdGUgc29cbi8vIHRoZSBzZXNzaW9uIHN1cnZpdmVzIGNvbnRlbnQtc2NyaXB0IHJlLWluamVjdGlvbiB3aGVuIFdvcmtkYXkvR3JlZW5ob3VzZVxuLy8gYmxvdyBhd2F5IHRoZSBET00gYmV0d2VlbiBzdGVwcy4gVGhlIFRUTCBpcyBlbmZvcmNlZCBvbiByZWFkLCBub3Qgb24gd3JpdGUsXG4vLyBiZWNhdXNlIHNlc3Npb24gc3RvcmFnZSBkb2Vzbid0IGV4cG9zZSBUVExzIG5hdGl2ZWx5LlxuLyoqIFRUTCBhZnRlciB3aGljaCBhIGNhcHR1cmVkIHNlc3Npb24gaXMgY29uc2lkZXJlZCBzdGFsZSBhbmQgaWdub3JlZC4gKi9cbmV4cG9ydCBjb25zdCBNVUxUSVNURVBfU0VTU0lPTl9UVExfTVMgPSAzMCAqIDYwICogMTAwMDtcbi8qKiBTdG9yYWdlIGtleSB1bmRlciBjaHJvbWUuc3RvcmFnZS5zZXNzaW9uLiBLZXllZCBieSB0YWJJZC4gKi9cbmNvbnN0IE1VTFRJU1RFUF9TRVNTSU9OX0tFWSA9IFwic2xvdGhpbmdfbXVsdGlzdGVwX3Nlc3Npb25zXCI7XG4vKipcbiAqIGNocm9tZS5zdG9yYWdlLnNlc3Npb24gaXMgTVYzLW9ubHkuIEluIE1WMiAoRmlyZWZveCkgd2UgZmFsbCBiYWNrIHRvXG4gKiBgY2hyb21lLnN0b3JhZ2UubG9jYWxgIHdpdGggdGhlIHNhbWUgVFRMIGdhdGluZyDigJQgdGhlIGRhdGEgaXMgd2lwZWQgb25cbiAqIGBjaHJvbWUucnVudGltZS5vbkluc3RhbGxlZGAgLyBmaXJzdCByZWFkIGFmdGVyIHRoZSBUVEwgcGFzc2VzLCBzbyB0aGVcbiAqIFwic2Vzc2lvblwiIHNlbWFudGljcyBhcmUgcHJlc2VydmVkIGF0IHRoZSBjb3N0IG9mIG9uZSBleHRyYSBkaXNrIGhpdC5cbiAqL1xuZnVuY3Rpb24gZ2V0U2Vzc2lvbkFyZWEoKSB7XG4gICAgLy8gVGhlIGBzZXNzaW9uYCBBUEkgaXMgb25seSBwcmVzZW50IGluIE1WMy4gd2ViZXh0ZW5zaW9uLXBvbHlmaWxsIGV4cG9zZXNcbiAgICAvLyBgbG9jYWxgIGluIGJvdGggbWFuaWZlc3QgdmVyc2lvbnMsIHNvIGl0J3MgYSBzYWZlIGxhc3QgcmVzb3J0LlxuICAgIGNvbnN0IGFyZWEgPSBjaHJvbWUuc3RvcmFnZS5zZXNzaW9uO1xuICAgIHJldHVybiBhcmVhID8/IGNocm9tZS5zdG9yYWdlLmxvY2FsO1xufVxuYXN5bmMgZnVuY3Rpb24gcmVhZE1hcCgpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgZ2V0U2Vzc2lvbkFyZWEoKS5nZXQoTVVMVElTVEVQX1NFU1NJT05fS0VZLCAocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCByYXcgPSByZXN1bHQ/LltNVUxUSVNURVBfU0VTU0lPTl9LRVldID8/IHt9O1xuICAgICAgICAgICAgcmVzb2x2ZShyYXcpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn1cbmFzeW5jIGZ1bmN0aW9uIHdyaXRlTWFwKG1hcCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICBnZXRTZXNzaW9uQXJlYSgpLnNldCh7IFtNVUxUSVNURVBfU0VTU0lPTl9LRVldOiBtYXAgfSwgKCkgPT4gcmVzb2x2ZSgpKTtcbiAgICB9KTtcbn1cbmZ1bmN0aW9uIGlzRXhwaXJlZChzZXNzaW9uLCBub3cgPSBEYXRlLm5vdygpKSB7XG4gICAgY29uc3QgY29uZmlybWVkID0gRGF0ZS5wYXJzZShzZXNzaW9uLmNvbmZpcm1lZEF0KTtcbiAgICBpZiAoIU51bWJlci5pc0Zpbml0ZShjb25maXJtZWQpKVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICByZXR1cm4gbm93IC0gY29uZmlybWVkID4gTVVMVElTVEVQX1NFU1NJT05fVFRMX01TO1xufVxuLyoqXG4gKiBQZXJzaXN0IGEgbmV3IChvciByZWZyZXNoZWQpIHNlc3Npb24gc25hcHNob3QuXG4gKlxuICogQ2FsbGluZyB0aGlzIGFnYWluIHdpdGggdGhlIHNhbWUgdGFiSWQgb3ZlcndyaXRlcyB0aGUgZXhpc3Rpbmcgc25hcHNob3Qg4oCUXG4gKiBpbnRlbnRpb25hbGx5IOKAlCBiZWNhdXNlIHRoZSB1c2VyIGhhcyBqdXN0IHJlLWNvbmZpcm1lZC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldFNlc3Npb24oc2Vzc2lvbikge1xuICAgIGNvbnN0IG1hcCA9IGF3YWl0IHJlYWRNYXAoKTtcbiAgICBtYXBbU3RyaW5nKHNlc3Npb24udGFiSWQpXSA9IHNlc3Npb247XG4gICAgYXdhaXQgd3JpdGVNYXAobWFwKTtcbn1cbi8qKlxuICogTG9vayB1cCB0aGUgbGl2ZSBzZXNzaW9uIGZvciBhIHRhYiwgcmV0dXJuaW5nIGBudWxsYCBpZiBhYnNlbnQsIGV4cGlyZWQsXG4gKiBvciBwb2ludGluZyBhdCBhIGRpZmZlcmVudCBBVFMgcHJvdmlkZXIgdGhhbiB0aGUgY2FsbGVyIGV4cGVjdHMuXG4gKlxuICogRXhwaXJlZCBlbnRyaWVzIGFyZSBldmljdGVkIG9wcG9ydHVuaXN0aWNhbGx5IG9uIHJlYWQgc28gd2UgZG9uJ3QgbGVha1xuICogc3RhbGUgc25hcHNob3RzIGludG8gbG9uZy1saXZlZCBzdG9yYWdlLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0U2Vzc2lvbih0YWJJZCwgcHJvdmlkZXIpIHtcbiAgICBjb25zdCBtYXAgPSBhd2FpdCByZWFkTWFwKCk7XG4gICAgY29uc3QgZW50cnkgPSBtYXBbU3RyaW5nKHRhYklkKV07XG4gICAgaWYgKCFlbnRyeSlcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgaWYgKGlzRXhwaXJlZChlbnRyeSkpIHtcbiAgICAgICAgZGVsZXRlIG1hcFtTdHJpbmcodGFiSWQpXTtcbiAgICAgICAgYXdhaXQgd3JpdGVNYXAobWFwKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGlmIChwcm92aWRlciAmJiBlbnRyeS5wcm92aWRlciAhPT0gcHJvdmlkZXIpXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIHJldHVybiBlbnRyeTtcbn1cbi8qKlxuICogRHJvcCB0aGUgc2Vzc2lvbiBmb3IgYSB0YWIuIENhbGxlZCBvbiBzdWJtaXQgY2xpY2ssIG9uIHRhYiBjbG9zZSwgYW5kIHdoZW5cbiAqIHRoZSB1c2VyIHNheXMgXCJOb1wiIHRvIHRoZSBwcm9tcHRlZCBmYWxsYmFjayB0b2FzdC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsZWFyU2Vzc2lvbih0YWJJZCkge1xuICAgIGNvbnN0IG1hcCA9IGF3YWl0IHJlYWRNYXAoKTtcbiAgICBpZiAoIShTdHJpbmcodGFiSWQpIGluIG1hcCkpXG4gICAgICAgIHJldHVybjtcbiAgICBkZWxldGUgbWFwW1N0cmluZyh0YWJJZCldO1xuICAgIGF3YWl0IHdyaXRlTWFwKG1hcCk7XG59XG4vKipcbiAqIFN3ZWVwIGV2ZXJ5IGV4cGlyZWQgZW50cnkuIENhbGxlZCBmcm9tIHRoZSBiYWNrZ3JvdW5kIG9uIHN0YXJ0dXAgdG8ga2VlcFxuICogdGhlIHNlc3Npb24tYXJlYSBzbWFsbCBpZiB0aGUgYnJvd3NlciBjcmFzaGVkIG1pZC1mbG93LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHVyZ2VFeHBpcmVkU2Vzc2lvbnMobm93ID0gRGF0ZS5ub3coKSkge1xuICAgIGNvbnN0IG1hcCA9IGF3YWl0IHJlYWRNYXAoKTtcbiAgICBsZXQgY2hhbmdlZCA9IGZhbHNlO1xuICAgIGZvciAoY29uc3QgW2tleSwgZW50cnldIG9mIE9iamVjdC5lbnRyaWVzKG1hcCkpIHtcbiAgICAgICAgaWYgKGlzRXhwaXJlZChlbnRyeSwgbm93KSkge1xuICAgICAgICAgICAgZGVsZXRlIG1hcFtrZXldO1xuICAgICAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGNoYW5nZWQpXG4gICAgICAgIGF3YWl0IHdyaXRlTWFwKG1hcCk7XG59XG4vKipcbiAqIFJlYWQgZXZlcnkgbGl2ZSBzZXNzaW9uIOKAlCB1c2VkIGJ5IHRoZSBiYWNrZ3JvdW5kIHdlYk5hdmlnYXRpb24gbGlzdGVuZXJcbiAqIHRvIGRlY2lkZSB3aGV0aGVyIHRoZSB0YWIgaXQganVzdCBzYXcgYSBoaXN0b3J5LXVwZGF0ZSBvbiBpcyBvbmUgd2Ugb3duLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbGlzdFNlc3Npb25zKCkge1xuICAgIGNvbnN0IG1hcCA9IGF3YWl0IHJlYWRNYXAoKTtcbiAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuICAgIHJldHVybiBPYmplY3QudmFsdWVzKG1hcCkuZmlsdGVyKChlbnRyeSkgPT4gIWlzRXhwaXJlZChlbnRyeSwgbm93KSk7XG59XG4iLCIvLyBQcm9tcHRlZCBmYWxsYmFjayB0b2FzdCBmb3IgbXVsdGktc3RlcCBmbG93cyB3aGVuIHdlYk5hdmlnYXRpb24gaXNcbi8vIHVuYXZhaWxhYmxlIChGaXJlZm94IHVzZXJzIHdobyBkZWNsaW5lZCB0aGUgb3B0aW9uYWwgcGVybWlzc2lvbiwgb3IgYW55XG4vLyBmdXR1cmUgYnJvd3NlciB3aGVyZSB0aGUgQVBJIGlzIGdhdGVkKS5cbi8vXG4vLyBPbiBlYWNoIGRldGVjdGVkIHN0ZXAgdHJhbnNpdGlvbiB3ZSBzaG93IGEgbm9uLWJsb2NraW5nIGluLXBhZ2UgdG9hc3Q6XG4vLyAgIFwiTG9va3MgbGlrZSBzdGVwIDIgb2YgNCDigJQgZmlsbCB0aGlzIHBhZ2UgdG9vP1wiICAgW1llc10gW05vXVxuLy9cbi8vIC0gXCJZZXNcIiAg4oaSIHJlc29sdmUodHJ1ZSkuIFRoZSBjYWxsZXIgcmUtcnVucyB0aGUgYXV0b2ZpbGwgZW5naW5lIGFnYWluc3Rcbi8vICAgdGhlIG5ldyBET00gd2l0aCB0aGUgcGVyc2lzdGVkIHNlc3Npb24gcHJvZmlsZS5cbi8vIC0gXCJOb1wiICAg4oaSIHJlc29sdmUoZmFsc2UpLiBUaGUgY2FsbGVyIGNsZWFycyB0aGUgc2Vzc2lvbiBmb3IgdGhlIHJlc3Qgb2Zcbi8vICAgdGhlIGZsb3cgKG5vIG1vcmUgcHJvbXB0cyB1bnRpbCB0aGUgdXNlciByZS10cmlnZ2VycyBcIkF1dG8tZmlsbCB0aGlzXG4vLyAgIGFwcGxpY2F0aW9uXCIgZnJvbSB0aGUgc2lkZWJhcikuXG4vLyAtIDEycyB0aW1lb3V0IOKGkiByZXNvbHZlKGZhbHNlKS4gVHJlYXRlZCBhcyBcIk5vXCIgc28gYSB1c2VyIHdobyB0YWJzIGF3YXlcbi8vICAgZG9lc24ndCBjb21lIGJhY2sgdG8gYSBzdHJhbmRlZCBwcm9tcHQuXG4vL1xuLy8gVGhlIHRvYXN0IHVzZXMgdGhlIHNhbWUgcGFwZXIvaW5rL3J1c3QgcGFsZXR0ZSBhcyB0aGUgcG9wdXBcbi8vIChhcHBzL2V4dGVuc2lvbi9zcmMvcG9wdXAvc3R5bGVzLmNzcykgc28gaXQgZG9lc24ndCBsb29rIGxpa2UgYSBmb3JlaWduXG4vLyBicm93c2VyIGRpYWxvZy4gV2UgZGVsaWJlcmF0ZWx5IGF2b2lkIHRoZSBmb3JiaWRkZW4gYGJnLXdoaXRlYCBldGMuXG4vLyBUYWlsd2luZCBjbGFzc2VzIOKAlCB0aGlzIGlzIHBsYWluIERPTSwgYnV0IHRoZSAqdmFsdWVzKiBhcmUgbWlycm9yZWQgZnJvbVxuLy8gdGhlIHBvcHVwIHRva2VucyBzbyB0aGUgZGVzaWduIHN5c3RlbSBzdGF5cyBjb25zaXN0ZW50LlxuY29uc3QgVE9BU1RfQ09OVEFJTkVSX0lEID0gXCJzbG90aGluZy1tdWx0aXN0ZXAtdG9hc3RcIjtcbmNvbnN0IFRPQVNUX1RJTUVPVVRfTVMgPSAxMjAwMDtcbi8qKlxuICogU2hvdyB0aGUgcHJvbXB0IGFuZCByZXNvbHZlIHdpdGggdGhlIHVzZXIncyBjaG9pY2UuIFNhZmUgdG8gY2FsbCBmcm9tXG4gKiBlaXRoZXIgcHJvdmlkZXIgaGFuZGxlcjsgb25seSBvbmUgdG9hc3QgaXMgdmlzaWJsZSBhdCBhIHRpbWUgKGFuIGluLWZsaWdodFxuICogcHJvbXB0IGlzIGF1dG8tcmVzb2x2ZWQgYXMgYGZhbHNlYCBiZWZvcmUgYSBuZXcgb25lIG1vdW50cykuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcm9tcHRTdGVwRmFsbGJhY2sob3B0aW9ucyA9IHt9KSB7XG4gICAgLy8gSWYgdGhlcmUncyBhbHJlYWR5IGEgdG9hc3Qgb24gc2NyZWVuLCBkaXNtaXNzIGl0IGFzIGEgXCJOb1wiIHNvIHRoZSBuZXdcbiAgICAvLyBwcm9tcHQgY2FuIHRha2Ugb3Zlci4gV2l0aG91dCB0aGlzIHR3byByYXBpZCBzdGVwIHRyYW5zaXRpb25zIGNvdWxkXG4gICAgLy8gc3RhY2sgdG9hc3RzIG9uIHRvcCBvZiBlYWNoIG90aGVyLlxuICAgIGNvbnN0IGV4aXN0aW5nID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoVE9BU1RfQ09OVEFJTkVSX0lEKTtcbiAgICBpZiAoZXhpc3RpbmcpIHtcbiAgICAgICAgZXhpc3RpbmcuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoXCJzbG90aGluZy1kaXNtaXNzXCIpKTtcbiAgICAgICAgZXhpc3RpbmcucmVtb3ZlKCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICBjb25zdCB0b2FzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIHRvYXN0LmlkID0gVE9BU1RfQ09OVEFJTkVSX0lEO1xuICAgICAgICB0b2FzdC5zZXRBdHRyaWJ1dGUoXCJyb2xlXCIsIFwiZGlhbG9nXCIpO1xuICAgICAgICB0b2FzdC5zZXRBdHRyaWJ1dGUoXCJhcmlhLWxpdmVcIiwgXCJwb2xpdGVcIik7XG4gICAgICAgIHRvYXN0LnNldEF0dHJpYnV0ZShcImFyaWEtbGFiZWxcIiwgXCJDb250aW51ZSBhdXRvLWZpbGwgb24gdGhpcyBzdGVwP1wiKTtcbiAgICAgICAgLy8gSW5saW5lLXN0eWxlIHRoZSB0b2FzdCBzbyB3ZSBkb24ndCBoYXZlIHRvIG1vdW50IHlldCBhbm90aGVyIENTUyBmaWxlXG4gICAgICAgIC8vIGFuZCByaXNrIHBhZ2UtQ1NTIG92ZXJyaWRpbmcgdXMuIEFsbCBjb2xvcnMgbWlycm9yIHRoZSBwb3B1cCB0b2tlbnMuXG4gICAgICAgIE9iamVjdC5hc3NpZ24odG9hc3Quc3R5bGUsIHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiBcImZpeGVkXCIsXG4gICAgICAgICAgICBib3R0b206IFwiMjBweFwiLFxuICAgICAgICAgICAgcmlnaHQ6IFwiMjBweFwiLFxuICAgICAgICAgICAgbWF4V2lkdGg6IFwiMzIwcHhcIixcbiAgICAgICAgICAgIHBhZGRpbmc6IFwiMTRweCAxNnB4XCIsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiBcIiNmZmZhZWZcIixcbiAgICAgICAgICAgIGNvbG9yOiBcIiMxYTE1MzBcIixcbiAgICAgICAgICAgIGJvcmRlcjogXCIxcHggc29saWQgcmdiYSgyNiwgMjAsIDE2LCAwLjEyKVwiLFxuICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiBcIjEwcHhcIixcbiAgICAgICAgICAgIGJveFNoYWRvdzogXCIwIDEwcHggMjRweCByZ2JhKDI2LCAyMSwgNDgsIDAuMTQpXCIsXG4gICAgICAgICAgICBmb250RmFtaWx5OiBcIi1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ0ludGVyJywgJ1NlZ29lIFVJJywgUm9ib3RvLCBzYW5zLXNlcmlmXCIsXG4gICAgICAgICAgICBmb250U2l6ZTogXCIxNHB4XCIsXG4gICAgICAgICAgICBsaW5lSGVpZ2h0OiBcIjEuNDVcIixcbiAgICAgICAgICAgIHpJbmRleDogXCIyMTQ3NDgzNjQ3XCIsXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCB0aXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIHRpdGxlLnN0eWxlLmZvbnRXZWlnaHQgPSBcIjYwMFwiO1xuICAgICAgICB0aXRsZS5zdHlsZS5tYXJnaW5Cb3R0b20gPSBcIjRweFwiO1xuICAgICAgICBjb25zdCBzdGVwVGV4dCA9IG9wdGlvbnMuc3RlcE51bWJlciAmJiBvcHRpb25zLnRvdGFsU3RlcHNcbiAgICAgICAgICAgID8gYExvb2tzIGxpa2Ugc3RlcCAke29wdGlvbnMuc3RlcE51bWJlcn0gb2YgJHtvcHRpb25zLnRvdGFsU3RlcHN9YFxuICAgICAgICAgICAgOiBvcHRpb25zLnN0ZXBOdW1iZXJcbiAgICAgICAgICAgICAgICA/IGBMb29rcyBsaWtlIHN0ZXAgJHtvcHRpb25zLnN0ZXBOdW1iZXJ9YFxuICAgICAgICAgICAgICAgIDogXCJMb29rcyBsaWtlIGEgbmV3IHN0ZXBcIjtcbiAgICAgICAgdGl0bGUudGV4dENvbnRlbnQgPSBgJHtzdGVwVGV4dH0g4oCUIGZpbGwgdGhpcyBwYWdlIHRvbz9gO1xuICAgICAgICB0b2FzdC5hcHBlbmRDaGlsZCh0aXRsZSk7XG4gICAgICAgIGlmIChvcHRpb25zLnByb3ZpZGVyTGFiZWwpIHtcbiAgICAgICAgICAgIGNvbnN0IHN1YiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgICAgICBzdWIuc3R5bGUuZm9udFNpemUgPSBcIjEycHhcIjtcbiAgICAgICAgICAgIHN1Yi5zdHlsZS5jb2xvciA9IFwiIzZhNWU0YVwiO1xuICAgICAgICAgICAgc3ViLnN0eWxlLm1hcmdpbkJvdHRvbSA9IFwiMTBweFwiO1xuICAgICAgICAgICAgc3ViLnRleHRDb250ZW50ID0gYCR7b3B0aW9ucy5wcm92aWRlckxhYmVsfSBtdWx0aS1zdGVwIGFwcGxpY2F0aW9uYDtcbiAgICAgICAgICAgIHRvYXN0LmFwcGVuZENoaWxkKHN1Yik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYWN0aW9ucyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIGFjdGlvbnMuc3R5bGUuZGlzcGxheSA9IFwiZmxleFwiO1xuICAgICAgICBhY3Rpb25zLnN0eWxlLmdhcCA9IFwiOHB4XCI7XG4gICAgICAgIGFjdGlvbnMuc3R5bGUuanVzdGlmeUNvbnRlbnQgPSBcImZsZXgtZW5kXCI7XG4gICAgICAgIGNvbnN0IG5vQnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcbiAgICAgICAgbm9CdG4udHlwZSA9IFwiYnV0dG9uXCI7XG4gICAgICAgIG5vQnRuLnRleHRDb250ZW50ID0gXCJOb1wiO1xuICAgICAgICBPYmplY3QuYXNzaWduKG5vQnRuLnN0eWxlLCB7XG4gICAgICAgICAgICBwYWRkaW5nOiBcIjZweCAxMnB4XCIsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiBcInRyYW5zcGFyZW50XCIsXG4gICAgICAgICAgICBjb2xvcjogXCIjNmE1ZTRhXCIsXG4gICAgICAgICAgICBib3JkZXI6IFwiMXB4IHNvbGlkIHJnYmEoMjYsIDIwLCAxNiwgMC4xMilcIixcbiAgICAgICAgICAgIGJvcmRlclJhZGl1czogXCI2cHhcIixcbiAgICAgICAgICAgIGN1cnNvcjogXCJwb2ludGVyXCIsXG4gICAgICAgICAgICBmb250OiBcImluaGVyaXRcIixcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHllc0J0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XG4gICAgICAgIHllc0J0bi50eXBlID0gXCJidXR0b25cIjtcbiAgICAgICAgeWVzQnRuLnRleHRDb250ZW50ID0gXCJZZXMsIGZpbGxcIjtcbiAgICAgICAgT2JqZWN0LmFzc2lnbih5ZXNCdG4uc3R5bGUsIHtcbiAgICAgICAgICAgIHBhZGRpbmc6IFwiNnB4IDEycHhcIixcbiAgICAgICAgICAgIGJhY2tncm91bmQ6IFwiIzFhMTUzMFwiLFxuICAgICAgICAgICAgY29sb3I6IFwiI2ZmZmFlZlwiLFxuICAgICAgICAgICAgYm9yZGVyOiBcIjFweCBzb2xpZCAjMWExNTMwXCIsXG4gICAgICAgICAgICBib3JkZXJSYWRpdXM6IFwiNnB4XCIsXG4gICAgICAgICAgICBjdXJzb3I6IFwicG9pbnRlclwiLFxuICAgICAgICAgICAgZm9udFdlaWdodDogXCI2MDBcIixcbiAgICAgICAgICAgIGZvbnQ6IFwiaW5oZXJpdFwiLFxuICAgICAgICB9KTtcbiAgICAgICAgYWN0aW9ucy5hcHBlbmRDaGlsZChub0J0bik7XG4gICAgICAgIGFjdGlvbnMuYXBwZW5kQ2hpbGQoeWVzQnRuKTtcbiAgICAgICAgdG9hc3QuYXBwZW5kQ2hpbGQoYWN0aW9ucyk7XG4gICAgICAgIGxldCBzZXR0bGVkID0gZmFsc2U7XG4gICAgICAgIGNvbnN0IHNldHRsZSA9ICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgaWYgKHNldHRsZWQpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgc2V0dGxlZCA9IHRydWU7XG4gICAgICAgICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgICAgICAgICB0b2FzdC5yZW1vdmUoKTtcbiAgICAgICAgICAgIHJlc29sdmUodmFsdWUpO1xuICAgICAgICB9O1xuICAgICAgICB5ZXNCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHNldHRsZSh0cnVlKSk7XG4gICAgICAgIG5vQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiBzZXR0bGUoZmFsc2UpKTtcbiAgICAgICAgdG9hc3QuYWRkRXZlbnRMaXN0ZW5lcihcInNsb3RoaW5nLWRpc21pc3NcIiwgKCkgPT4gc2V0dGxlKGZhbHNlKSk7XG4gICAgICAgIGNvbnN0IHRpbWVvdXRJZCA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHNldHRsZShmYWxzZSksIFRPQVNUX1RJTUVPVVRfTVMpO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRvYXN0KTtcbiAgICAgICAgLy8gRm9jdXMgdGhlIHByaW1hcnkgYWN0aW9uIHNvIGtleWJvYXJkIHVzZXJzIGRvbid0IGdldCBsb3N0LlxuICAgICAgICB5ZXNCdG4uZm9jdXMoKTtcbiAgICB9KTtcbn1cbi8qKlxuICogRm9yY2libHkgcmVtb3ZlIGFueSBpbi1mbGlnaHQgcHJvbXB0LiBVc2VkIG9uIGBwYWdlaGlkZWAgc28gd2UgZG9uJ3QgbGVha1xuICogYSB0b2FzdCBpbnRvIGEgYmZjYWNoZSByZXN0b3JlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGlzbWlzc1N0ZXBGYWxsYmFjaygpIHtcbiAgICBjb25zdCBleGlzdGluZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFRPQVNUX0NPTlRBSU5FUl9JRCk7XG4gICAgaWYgKCFleGlzdGluZylcbiAgICAgICAgcmV0dXJuO1xuICAgIGV4aXN0aW5nLmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KFwic2xvdGhpbmctZGlzbWlzc1wiKSk7XG4gICAgZXhpc3RpbmcucmVtb3ZlKCk7XG59XG4iLCIvLyBXb3JrZGF5IG11bHRpLXN0ZXAgYXBwbGljYW50IGZsb3cgaGFuZGxlciAoUDMgLyAjMzYpLlxuLy9cbi8vIFdvcmtkYXkgYXBwbGljYXRpb25zIGFyZSB3aXphcmQtc2hhcGVkIOKAlCB0aGUgVVJMIGNoYW5nZXMgYnkgaGFzaCArIGhpc3Rvcnlcbi8vIHN0YXRlIGFzIHRoZSB1c2VyIGNsaWNrcyBcIk5leHRcIi4gV2U6XG4vL1xuLy8gMS4gRGV0ZWN0IHRoYXQgd2UncmUgb24gYSBgbXl3b3JrZGF5am9icy5jb20vLi4uL2pvYi8uLi4vYXBwbHlgIGZsb3cgKG9yXG4vLyAgICB0aGUgcG9zdC1jbGljayBgYXBwbHlNYW51YWxseWAgcm91dGUpLlxuLy8gMi4gV2FpdCBmb3IgdGhlIHVzZXIgdG8gY2xpY2sgdGhlIGV4cGxpY2l0IFwiQXV0by1maWxsIHRoaXMgYXBwbGljYXRpb25cIlxuLy8gICAgYnV0dG9uIGluIHRoZSBzaWRlYmFyLiBObyBhdXRvbWF0aWMgY2FwdHVyZSDigJQgbXVsdGktc3RlcCBmaWxscyBvbmx5XG4vLyAgICBzdGFydCBvbiBleHBsaWNpdCBpbnRlbnQgKHBlciAjMzYgYWNjZXB0YW5jZSkuXG4vLyAzLiBQZXJzaXN0IHRoZSBzZXNzaW9uIGluIGBjaHJvbWUuc3RvcmFnZS5zZXNzaW9uYCBrZXllZCBieSB0YWJJZC5cbi8vIDQuIE9uIGV2ZXJ5IHN0ZXAgdHJhbnNpdGlvbiAoYnJvYWRjYXN0IGZyb20gdGhlIGJhY2tncm91bmQnc1xuLy8gICAgd2ViTmF2aWdhdGlvbiBsaXN0ZW5lciwgb3Igc3VyZmFjZWQgdmlhIHRoZSBwcm9tcHRlZC1mYWxsYmFjayB0b2FzdFxuLy8gICAgd2hlbiB3ZWJOYXZpZ2F0aW9uIGlzIHVuYXZhaWxhYmxlKSwgcmUtcnVuIHRoZSBmaWVsZCBkZXRlY3RvciBhZ2FpbnN0XG4vLyAgICB0aGUgbmV3IERPTSBhbmQgZmlsbCB3aXRoIHRoZSBwZXJzaXN0ZWQgcHJvZmlsZS5cbi8vIDUuIFN0b3Agb24gc3VibWl0IGNsaWNrICh3ZSB3YXRjaCBmb3IgYFtkYXRhLWF1dG9tYXRpb24taWRdYCBzdWJtaXRcbi8vICAgIHNlbGVjdG9ycyksIHRhYiBjbG9zZSAoY2hyb21lIHdpcGVzIHNlc3Npb24gc3RvcmFnZSksIG9yIDMwLW1pblxuLy8gICAgaW5hY3Rpdml0eSAoaGFuZGxlZCBieSB0aGUgc2Vzc2lvbiBUVEwpLlxuaW1wb3J0IHsgRmllbGREZXRlY3RvciB9IGZyb20gXCIuLi9hdXRvLWZpbGwvZmllbGQtZGV0ZWN0b3JcIjtcbmltcG9ydCB7IEZpZWxkTWFwcGVyIH0gZnJvbSBcIi4uL2F1dG8tZmlsbC9maWVsZC1tYXBwZXJcIjtcbmltcG9ydCB7IEF1dG9GaWxsRW5naW5lIH0gZnJvbSBcIi4uL2F1dG8tZmlsbC9lbmdpbmVcIjtcbmltcG9ydCB7IGNsZWFyU2Vzc2lvbiwgZ2V0U2Vzc2lvbiwgc2V0U2Vzc2lvbiwgfSBmcm9tIFwiLi9zZXNzaW9uXCI7XG5pbXBvcnQgeyBwcm9tcHRTdGVwRmFsbGJhY2sgfSBmcm9tIFwiLi9wcm9tcHQtZmFsbGJhY2tcIjtcbi8qKiBVUkwgc3Vic3RyaW5nIHRoYXQgaWRlbnRpZmllcyBhIFdvcmtkYXkgaG9zdC4gKi9cbmNvbnN0IFdPUktEQVlfSE9TVF9SRSA9IC9cXC5teXdvcmtkYXlqb2JzXFwuY29tJC9pO1xuLyoqXG4gKiBVUkwgbWF0Y2ggZm9yIHRoZSBhcHBseSBmbG93IGl0c2VsZi4gV29ya2RheSBVUkxzIHR5cGljYWxseSBsb29rIGxpa2U6XG4gKiAgIGh0dHBzOi8vYWNtZS53ZDUubXl3b3JrZGF5am9icy5jb20vZW4tVVMvQWNtZS9qb2IvUmVtb3RlL1NvZnR3YXJlLUVuZ2luZWVyX1ItMTIzNC9hcHBseVxuICogICDigKYvYXBwbHlNYW51YWxseVxuICogICDigKYvYXBwbHkvYXBwbHlNYW51YWxseVxuICovXG5jb25zdCBXT1JLREFZX0FQUExZX1BBVEhfUkUgPSAvXFwvam9iXFwvW14vXStcXC9bXi9dK1xcLyhhcHBseXxhcHBseU1hbnVhbGx5fGFwcGx5XFwvYXBwbHlNYW51YWxseSkoXFwvfCQpL2k7XG4vKipcbiAqIFNlbGVjdG9ycyB1c2VkIHRvIGZpbmQgV29ya2RheSBzdWJtaXQgYnV0dG9ucy4gYFtkYXRhLWF1dG9tYXRpb24taWRdYCBpc1xuICogV29ya2RheSdzIHN0YWJsZSBob29rIGV2ZW4gYWNyb3NzIFVJIHJlZnJlc2hlcyDigJQgd2UgbWF0Y2ggb24gdGhlIHByZWZpeFxuICogYW5kIGNoZWNrIHRoZSB0ZXh0IHRvIGZpbHRlciBvdXQgXCJOZXh0XCIgLyBcIlNhdmUgYW5kIGNvbnRpbnVlXCIgZXRjLlxuICovXG5jb25zdCBXT1JLREFZX1NVQk1JVF9TRUxFQ1RPUlMgPSBbXG4gICAgJ2J1dHRvbltkYXRhLWF1dG9tYXRpb24taWQ9XCJib3R0b20tbmF2aWdhdGlvbi1uZXh0LWJ1dHRvblwiXScsXG4gICAgJ2J1dHRvbltkYXRhLWF1dG9tYXRpb24taWQqPVwic3VibWl0XCJdJyxcbiAgICAnYnV0dG9uW2RhdGEtYXV0b21hdGlvbi1pZCo9XCJTdWJtaXRcIl0nLFxuXTtcbi8qKiBTdWJtaXQtYnV0dG9uIGxhYmVscyB3ZSB0cmVhdCBhcyBmaW5hbCAodnMuIFwiTmV4dFwiIC8gXCJTYXZlIGFuZCBjb250aW51ZVwiKS4gKi9cbmNvbnN0IFdPUktEQVlfU1VCTUlUX0xBQkVMU19SRSA9IC8oc3VibWl0IGFwcGxpY2F0aW9ufHN1Ym1pdHxyZXZpZXcgYW5kIHN1Ym1pdCkvaTtcbi8qKiBUcnVlIHdoZW4gdGhlIGdpdmVuIFVSTCBpcyBhIFdvcmtkYXkgYXBwbGljYW50IHBhZ2UuICovXG5leHBvcnQgZnVuY3Rpb24gaXNXb3JrZGF5QXBwbHlVcmwodXJsKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcGFyc2VkID0gbmV3IFVSTCh1cmwpO1xuICAgICAgICBpZiAoIVdPUktEQVlfSE9TVF9SRS50ZXN0KHBhcnNlZC5ob3N0KSlcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIFdPUktEQVlfQVBQTFlfUEFUSF9SRS50ZXN0KHBhcnNlZC5wYXRobmFtZSk7XG4gICAgfVxuICAgIGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cbi8qKlxuICogUHVibGljIHN1cmZhY2UgdXNlZCBieSB0aGUgY29udGVudC1zY3JpcHQgZW50cnkgcG9pbnQuIENvbnN0cnVjdCBvbmUgb2ZcbiAqIHRoZXNlIHBlciB0YWIgYW5kIGZvcndhcmQgdGhlIGxpZmVjeWNsZSBob29rcyAoc3RlcCB0cmFuc2l0aW9uLFxuICogcGFnZWhpZGUpLlxuICovXG5leHBvcnQgY2xhc3MgV29ya2RheU11bHRpc3RlcEhhbmRsZXIge1xuICAgIGNvbnN0cnVjdG9yKGRlcHMpIHtcbiAgICAgICAgdGhpcy5kZXRlY3RvciA9IG5ldyBGaWVsZERldGVjdG9yKCk7XG4gICAgICAgIHRoaXMuc3VibWl0TGlzdGVuZXJBdHRhY2hlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmZhbGxiYWNrRGVjbGluZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5kZXBzID0gZGVwcztcbiAgICB9XG4gICAgLyoqIFRydWUgd2hlbiB0aGUgY3VycmVudCBVUkwgaXMgb25lIHdlIHNob3VsZCBiZSB3YXRjaGluZy4gKi9cbiAgICBpc0FjdGl2ZSgpIHtcbiAgICAgICAgcmV0dXJuIGlzV29ya2RheUFwcGx5VXJsKHdpbmRvdy5sb2NhdGlvbi5ocmVmKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2FsbGVkIHdoZW4gdGhlIHVzZXIgY2xpY2tzIHRoZSBleHBsaWNpdCBcIkF1dG8tZmlsbCB0aGlzIGFwcGxpY2F0aW9uXCJcbiAgICAgKiBzaWRlYmFyIGFjdGlvbi4gQ2FwdHVyZXMgdGhlIHNuYXBzaG90LCBydW5zIHRoZSBmaXJzdCBmaWxsLCBhbmQgYXJtc1xuICAgICAqIHRoZSBzdWJtaXQtYnV0dG9uIHdhdGNoZXIgc28gYSBmaW5hbCBzdWJtaXQgY2xlYXJzIHN0YXRlLlxuICAgICAqL1xuICAgIGFzeW5jIGNvbmZpcm0ob3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIGlmICghdGhpcy5pc0FjdGl2ZSgpKVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIGNvbnN0IFt0YWJJZCwgcHJvZmlsZV0gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgICAgICB0aGlzLmRlcHMuZ2V0VGFiSWQoKSxcbiAgICAgICAgICAgIHRoaXMuZGVwcy5nZXRQcm9maWxlKCksXG4gICAgICAgIF0pO1xuICAgICAgICBpZiAoIXRhYklkIHx8ICFwcm9maWxlKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCJbU2xvdGhpbmddIFdvcmtkYXkgY29uZmlybTogbWlzc2luZyB0YWJJZCBvciBwcm9maWxlXCIpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgc2Vzc2lvbiA9IHtcbiAgICAgICAgICAgIHRhYklkLFxuICAgICAgICAgICAgcHJvdmlkZXI6IFwid29ya2RheVwiLFxuICAgICAgICAgICAgam9iVXJsOiB3aW5kb3cubG9jYXRpb24uaHJlZixcbiAgICAgICAgICAgIHByb2ZpbGUsXG4gICAgICAgICAgICBiYXNlUmVzdW1lSWQ6IG9wdGlvbnMuYmFzZVJlc3VtZUlkLFxuICAgICAgICAgICAgY29uZmlybWVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgfTtcbiAgICAgICAgYXdhaXQgc2V0U2Vzc2lvbihzZXNzaW9uKTtcbiAgICAgICAgdGhpcy5mYWxsYmFja0RlY2xpbmVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuYXR0YWNoU3VibWl0V2F0Y2hlcih0YWJJZCk7XG4gICAgICAgIHJldHVybiB0aGlzLnJ1bkZpbGwoc2Vzc2lvbik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEZpcmVkIGJ5IHRoZSBiYWNrZ3JvdW5kIHdoZW4gYHdlYk5hdmlnYXRpb24ub25IaXN0b3J5U3RhdGVVcGRhdGVkYFxuICAgICAqIHNlZXMgYSBuYXZpZ2F0aW9uIG9uIHRoaXMgdGFiLiBXZSByZS1ydW4gdGhlIGZpbGwgYWdhaW5zdCB0aGUgbmV3IERPTS5cbiAgICAgKiBJZiB3ZWJOYXZpZ2F0aW9uIGlzbid0IGF2YWlsYWJsZSB0aGUgcHJvbXB0ZWQtZmFsbGJhY2sgcGF0aCBjb3ZlcnMgdGhpcy5cbiAgICAgKi9cbiAgICBhc3luYyBvblN0ZXBUcmFuc2l0aW9uKCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNBY3RpdmUoKSlcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICBjb25zdCB0YWJJZCA9IGF3YWl0IHRoaXMuZGVwcy5nZXRUYWJJZCgpO1xuICAgICAgICBpZiAoIXRhYklkKVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIGNvbnN0IHNlc3Npb24gPSBhd2FpdCBnZXRTZXNzaW9uKHRhYklkLCBcIndvcmtkYXlcIik7XG4gICAgICAgIGlmICghc2Vzc2lvbilcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAvLyBXb3JrZGF5IHJlLXJlbmRlcnMgdGhlIHdob2xlIHN0ZXAgRE9NOyB3YWl0IGEgdGljayBzbyB0aGUgbmV3IGZvcm1cbiAgICAgICAgLy8gZmllbGRzIGFyZSBwcmVzZW50IGJlZm9yZSB0aGUgZGV0ZWN0b3IgcnVucy5cbiAgICAgICAgYXdhaXQgd2FpdEZvcldvcmtkYXlTdGVwUmVhZHkoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMucnVuRmlsbChzZXNzaW9uKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogTm8td2ViTmF2aWdhdGlvbiBmYWxsYmFjayBwYXRoLiBDYWxsZWQgZnJvbSBhIE11dGF0aW9uT2JzZXJ2ZXIgLyBVUkxcbiAgICAgKiB3YXRjaGVyIGluIHRoZSBjb250ZW50IHNjcmlwdCB3aGVuIHdlIG5vdGljZSB0aGUgcGFnZSBjaGFuZ2VkIGJ1dFxuICAgICAqIG5ldmVyIGdvdCBhIHdlYk5hdmlnYXRpb24gZXZlbnQuIEFza3MgdGhlIHVzZXIgXCJmaWxsIHRoaXMgcGFnZSB0b28/XCIuXG4gICAgICovXG4gICAgYXN5bmMgb25TdGVwVHJhbnNpdGlvblZpYUZhbGxiYWNrKHN0ZXBIaW50KSB7XG4gICAgICAgIGlmICghdGhpcy5pc0FjdGl2ZSgpKVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIGlmICh0aGlzLmZhbGxiYWNrRGVjbGluZWQpXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgY29uc3QgdGFiSWQgPSBhd2FpdCB0aGlzLmRlcHMuZ2V0VGFiSWQoKTtcbiAgICAgICAgaWYgKCF0YWJJZClcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICBjb25zdCBzZXNzaW9uID0gYXdhaXQgZ2V0U2Vzc2lvbih0YWJJZCwgXCJ3b3JrZGF5XCIpO1xuICAgICAgICBpZiAoIXNlc3Npb24pXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgY29uc3QgYWNjZXB0ZWQgPSBhd2FpdCBwcm9tcHRTdGVwRmFsbGJhY2soe1xuICAgICAgICAgICAgcHJvdmlkZXJMYWJlbDogXCJXb3JrZGF5XCIsXG4gICAgICAgICAgICBzdGVwTnVtYmVyOiBzdGVwSGludD8uc3RlcE51bWJlcixcbiAgICAgICAgICAgIHRvdGFsU3RlcHM6IHN0ZXBIaW50Py50b3RhbFN0ZXBzLFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCFhY2NlcHRlZCkge1xuICAgICAgICAgICAgdGhpcy5mYWxsYmFja0RlY2xpbmVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGF3YWl0IGNsZWFyU2Vzc2lvbih0YWJJZCk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBhd2FpdCB3YWl0Rm9yV29ya2RheVN0ZXBSZWFkeSgpO1xuICAgICAgICByZXR1cm4gdGhpcy5ydW5GaWxsKHNlc3Npb24pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZXRlY3RzIHRoZSBwYWdlLXByb2dyZXNzIGhpbnQgV29ya2RheSBzdXJmYWNlcyBhc1xuICAgICAqIGBbZGF0YS1hdXRvbWF0aW9uLWlkPVwicHJvZ3Jlc3NCYXJJdGVtXCJdYCBzbyB0aGUgZmFsbGJhY2sgdG9hc3QgY2FuIHNheVxuICAgICAqIFwic3RlcCAyIG9mIDRcIiBpbnN0ZWFkIG9mIFwiYSBuZXcgc3RlcFwiLlxuICAgICAqL1xuICAgIGRldGVjdFN0ZXBIaW50KCkge1xuICAgICAgICBjb25zdCBpdGVtcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWF1dG9tYXRpb24taWQ9XCJwcm9ncmVzc0Jhckl0ZW1cIl0sIFtkYXRhLWF1dG9tYXRpb24taWQ9XCJwcm9ncmVzc0JhckFjdGl2ZUl0ZW1cIl0nKTtcbiAgICAgICAgaWYgKGl0ZW1zLmxlbmd0aCA9PT0gMClcbiAgICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgY29uc3QgYWN0aXZlID0gQXJyYXkuZnJvbShpdGVtcykuZmluZEluZGV4KChub2RlKSA9PiAvYWN0aXZlfGN1cnJlbnQvaS50ZXN0KG5vZGUuZ2V0QXR0cmlidXRlKFwiZGF0YS1hdXRvbWF0aW9uLWlkXCIpID8/IFwiXCIpKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN0ZXBOdW1iZXI6IGFjdGl2ZSA+PSAwID8gYWN0aXZlICsgMSA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHRvdGFsU3RlcHM6IGl0ZW1zLmxlbmd0aCxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgLyoqIERldGFjaCB3YXRjaGVycyDigJQgY2FsbGVkIGZyb20gYHBhZ2VoaWRlYC4gKi9cbiAgICBkZXN0cm95KCkge1xuICAgICAgICAvLyBTdWJtaXQgbGlzdGVuZXIgaXMgb24gZG9jdW1lbnQgc28gaXQgbGl2ZXMgd2l0aCB0aGUgcGFnZTsgZXhwbGljaXRcbiAgICAgICAgLy8gZGV0YWNoIGhhcHBlbnMgdmlhIHRoZSBjb250cm9sbGVyIHdyYXBwZXIgaW4gaW5kZXgudHMuXG4gICAgfVxuICAgIGFzeW5jIHJ1bkZpbGwoc2Vzc2lvbikge1xuICAgICAgICBjb25zdCBmaWVsZHMgPSB0aGlzLmNvbGxlY3RGaWVsZHMoKTtcbiAgICAgICAgaWYgKGZpZWxkcy5sZW5ndGggPT09IDApXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgY29uc3QgbWFwcGVyID0gbmV3IEZpZWxkTWFwcGVyKHNlc3Npb24ucHJvZmlsZSk7XG4gICAgICAgIGNvbnN0IGVuZ2luZSA9IG5ldyBBdXRvRmlsbEVuZ2luZSh0aGlzLmRldGVjdG9yLCBtYXBwZXIpO1xuICAgICAgICByZXR1cm4gZW5naW5lLmZpbGxGb3JtKGZpZWxkcyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFdvcmtkYXkgZG9lc24ndCBhbHdheXMgd3JhcCBmaWVsZHMgaW4gYDxmb3JtPmAg4oCUIHNvbWUgc3RlcHMgcmVuZGVyIHRoZVxuICAgICAqIGlucHV0cyBhcyBiYXJlIGRpdnMgaW5zaWRlIHRoZSBhcHBsaWNhdGlvbiBzaGVsbC4gV2Ugc2NvcGUgdG8gdGhlXG4gICAgICogV29ya2RheSBhcHBsaWNhdGlvbiBjb250YWluZXIgaWYgcHJlc2VudCwgZWxzZSBmYWxsIGJhY2sgdG8gdGhlIHdob2xlXG4gICAgICogZG9jdW1lbnQsIHRoZW4gY2FsbCBpbnRvIGBGaWVsZERldGVjdG9yLmRldGVjdEZpZWxkVHlwZWAgcGVyIGlucHV0LlxuICAgICAqL1xuICAgIGNvbGxlY3RGaWVsZHMoKSB7XG4gICAgICAgIGNvbnN0IHNjb3BlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignW2RhdGEtYXV0b21hdGlvbi1pZD1cImFwcGx5Rmxvd0NvbnRhaW5lclwiXScpID8/XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1hdXRvbWF0aW9uLWlkKj1cImFwcGxpY2F0aW9uXCJdJykgPz9cbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHk7XG4gICAgICAgIGlmICghc2NvcGUpXG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIGNvbnN0IGlucHV0cyA9IHNjb3BlLnF1ZXJ5U2VsZWN0b3JBbGwoXCJpbnB1dCwgdGV4dGFyZWEsIHNlbGVjdFwiKTtcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IGVsIG9mIGlucHV0cykge1xuICAgICAgICAgICAgaWYgKHNob3VsZFNraXBGb3JXb3JrZGF5KGVsKSlcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIGNvbnN0IGRldGVjdGVkID0gdGhpcy5kZXRlY3Rvci5kZXRlY3RGaWVsZFR5cGUoZWwpO1xuICAgICAgICAgICAgaWYgKGRldGVjdGVkLmZpZWxkVHlwZSAhPT0gXCJ1bmtub3duXCIgfHwgZGV0ZWN0ZWQuY29uZmlkZW5jZSA+IDAuMSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChkZXRlY3RlZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFdhdGNoIGZvciBhIGNsaWNrIG9uIGEgV29ya2RheSBzdWJtaXQgYnV0dG9uLiBUaGUgd2F0Y2hlciBsaXZlcyBvbiB0aGVcbiAgICAgKiBkb2N1bWVudCBzbyBpdCBzdXJ2aXZlcyBXb3JrZGF5J3Mgc3RlcC1sZXZlbCBET00gcmUtcmVuZGVycy5cbiAgICAgKi9cbiAgICBhdHRhY2hTdWJtaXRXYXRjaGVyKHRhYklkKSB7XG4gICAgICAgIGlmICh0aGlzLnN1Ym1pdExpc3RlbmVyQXR0YWNoZWQpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHRoaXMuc3VibWl0TGlzdGVuZXJBdHRhY2hlZCA9IHRydWU7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgICAgIGlmICghdGFyZ2V0KVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIGNvbnN0IGJ1dHRvbiA9IHRhcmdldC5jbG9zZXN0KFwiYnV0dG9uXCIpO1xuICAgICAgICAgICAgaWYgKCFidXR0b24pXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKCFtYXRjaGVzV29ya2RheVN1Ym1pdEJ1dHRvbihidXR0b24pKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIC8vIERvbid0IHByZXZlbnREZWZhdWx0IOKAlCB3ZSBkb24ndCB3YW50IHRvIGJsb2NrIHN1Ym1pc3Npb24uIEp1c3RcbiAgICAgICAgICAgIC8vIGNsZWFyIHRoZSBzZXNzaW9uIHNvIHRoZSBuZXh0IHBhZ2UgKGNvbmZpcm1hdGlvbiAvIFwidGhhbmtzIGZvclxuICAgICAgICAgICAgLy8gYXBwbHlpbmdcIikgZG9lc24ndCB0cnkgdG8gYXV0b2ZpbGwgYW55dGhpbmcuXG4gICAgICAgICAgICB2b2lkIGNsZWFyU2Vzc2lvbih0YWJJZCk7XG4gICAgICAgIH0sIHRydWUpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHNob3VsZFNraXBGb3JXb3JrZGF5KGVsKSB7XG4gICAgY29uc3QgaW5wdXQgPSBlbDtcbiAgICBpZiAoaW5wdXQuZGlzYWJsZWQpXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIGlmIChpbnB1dC5yZWFkT25seSlcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgaWYgKGlucHV0LnR5cGUgPT09IFwiaGlkZGVuXCIgfHxcbiAgICAgICAgaW5wdXQudHlwZSA9PT0gXCJzdWJtaXRcIiB8fFxuICAgICAgICBpbnB1dC50eXBlID09PSBcImJ1dHRvblwiIHx8XG4gICAgICAgIGlucHV0LnR5cGUgPT09IFwicmVzZXRcIiB8fFxuICAgICAgICBpbnB1dC50eXBlID09PSBcImltYWdlXCIgfHxcbiAgICAgICAgaW5wdXQudHlwZSA9PT0gXCJmaWxlXCIpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cbmZ1bmN0aW9uIG1hdGNoZXNXb3JrZGF5U3VibWl0QnV0dG9uKGJ1dHRvbikge1xuICAgIGlmIChXT1JLREFZX1NVQk1JVF9TRUxFQ1RPUlMuc29tZSgoc2VsKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gYnV0dG9uLm1hdGNoZXMoc2VsKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9KSkge1xuICAgICAgICBjb25zdCB0ZXh0ID0gKGJ1dHRvbi50ZXh0Q29udGVudCA/PyBcIlwiKS50cmltKCk7XG4gICAgICAgIHJldHVybiBXT1JLREFZX1NVQk1JVF9MQUJFTFNfUkUudGVzdCh0ZXh0KTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuLyoqXG4gKiBXb3JrZGF5IGFuaW1hdGVzIGJldHdlZW4gc3RlcHM7IHRoZSBuZXh0LXN0ZXAgRE9NIG1vdW50cyBhIGZyYW1lIG9yIHR3b1xuICogbGF0ZXIuIFJlc29sdmUgd2hlbiBhdCBsZWFzdCBvbmUgV29ya2RheS1tYXJrZWQgaW5wdXQgaXMgcHJlc2VudCBvciA1MDBtc1xuICogaGFzIGVsYXBzZWQsIHdoaWNoZXZlciBjb21lcyBmaXJzdC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gd2FpdEZvcldvcmtkYXlTdGVwUmVhZHkodGltZW91dE1zID0gNTAwKSB7XG4gICAgY29uc3Qgc3RhcnQgPSBEYXRlLm5vdygpO1xuICAgIHdoaWxlIChEYXRlLm5vdygpIC0gc3RhcnQgPCB0aW1lb3V0TXMpIHtcbiAgICAgICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWF1dG9tYXRpb24taWQ9XCJ0ZXh0SW5wdXRCb3hcIl0sIFtkYXRhLWF1dG9tYXRpb24taWQ9XCJmb3JtRmllbGRcIl0sIFtkYXRhLWF1dG9tYXRpb24taWQqPVwiaW5wdXRcIl0nKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKChyKSA9PiBzZXRUaW1lb3V0KHIsIDUwKSk7XG4gICAgfVxufVxuIiwiLy8gR3JlZW5ob3VzZSBtdWx0aS1zdGVwIGFwcGxpY2FudCBmbG93IGhhbmRsZXIgKFAzIC8gIzM3KS5cbi8vXG4vLyBUd28gZmxhdm91cnMgb2YgR3JlZW5ob3VzZSBhcHBsaWNhdGlvbiBzdXJmYWNlOlxuLy9cbi8vICAgMS4gYGJvYXJkcy5ncmVlbmhvdXNlLmlvLzxjb21wYW55Pi9qb2JzLzxpZD5gIOKAlCBhIHNpbmdsZS1wYWdlIGZvcm1cbi8vICAgICAgZW1iZWRkZWQgaW4gdGhlIGNhcmVlcnMgc2l0ZS4gU3RlcCB0cmFuc2l0aW9ucyBhcmUgcmFyZSBoZXJlIGJ1dFxuLy8gICAgICBzb21lIGxhcmdlciBlbXBsb3llcnMgc3BsaXQgdGhlIGFwcGxpY2F0aW9uIGludG8gbXVsdGlwbGUgc2VjdGlvbnNcbi8vICAgICAgdGhhdCB1c2UgYCNmcmFnbWVudGAgLyBgcHVzaFN0YXRlYCBuYXZpZ2F0aW9uLlxuLy9cbi8vICAgMi4gYGFwcC5ncmVlbmhvdXNlLmlvL2pvYnMvPGlkPi9hcHBsaWNhdGlvbnMvbmV3YCDigJQgdGhlIGNhbm9uaWNhbCBhcHBcbi8vICAgICAgZmxvdy4gU29tZSBlbXBsb3llcnMgZW1iZWQgdGhpcyBpbiBhbiBgPGlmcmFtZT5gIG9uIHRoZWlyIG93blxuLy8gICAgICBjYXJlZXJzIGRvbWFpbi4gV2hlbiBpZnJhbWVkLCBVUkwtYmFzZWQgbGlzdGVuZXJzIGRvbid0IGZpcmUgb24gdGhlXG4vLyAgICAgIG91dGVyIHBhZ2U7IHdlIG5lZWQgYSBNdXRhdGlvbk9ic2VydmVyIG9uIHRoZSBpZnJhbWUncyBkb2N1bWVudFxuLy8gICAgICBpbnN0ZWFkLlxuLy9cbi8vIFRoZSBkZXRlY3Rpb24gbG9naWMgaW4gdGhpcyBmaWxlIG1pcnJvcnMgd29ya2RheS50cyBidXQgdXNlcyBHcmVlbmhvdXNlLVxuLy8gc3BlY2lmaWMgc2VsZWN0b3JzIGFuZCBhbiBpZnJhbWUtYXdhcmUgXCJzdGVwIHRyYW5zaXRpb25cIiB0cmlnZ2VyLlxuaW1wb3J0IHsgRmllbGREZXRlY3RvciB9IGZyb20gXCIuLi9hdXRvLWZpbGwvZmllbGQtZGV0ZWN0b3JcIjtcbmltcG9ydCB7IEZpZWxkTWFwcGVyIH0gZnJvbSBcIi4uL2F1dG8tZmlsbC9maWVsZC1tYXBwZXJcIjtcbmltcG9ydCB7IEF1dG9GaWxsRW5naW5lIH0gZnJvbSBcIi4uL2F1dG8tZmlsbC9lbmdpbmVcIjtcbmltcG9ydCB7IGNsZWFyU2Vzc2lvbiwgZ2V0U2Vzc2lvbiwgc2V0U2Vzc2lvbiwgfSBmcm9tIFwiLi9zZXNzaW9uXCI7XG5pbXBvcnQgeyBwcm9tcHRTdGVwRmFsbGJhY2sgfSBmcm9tIFwiLi9wcm9tcHQtZmFsbGJhY2tcIjtcbmNvbnN0IEdSRUVOSE9VU0VfSE9TVF9SRSA9IC8oYm9hcmRzfGFwcClcXC5ncmVlbmhvdXNlXFwuaW8kL2k7XG5jb25zdCBHUkVFTkhPVVNFX0FQUF9GT1JNX1JFID0gL1xcLyhqb2JzfGFwcGxpY2F0aW9ucylcXGIvaTtcbi8qKlxuICogU3VibWl0IHNlbGVjdG9ycy4gR3JlZW5ob3VzZSB1c2VzIGAjc3VibWl0X2FwcGAgb24gYm9hcmRzLmdyZWVuaG91c2UuaW9cbiAqIGFuZCBgW2RhdGEtdGVzdCo9XCJzdWJtaXRcIl1gIG9uIHRoZSBlbWJlZGRlZCBhcHAgZG9tYWluLiBXZSBhbHNvIGxvb2sgYXRcbiAqIGJ1dHRvbiB0ZXh0IHRvIGZpbHRlciBmYWxzZSBwb3NpdGl2ZXMgKFwiU2F2ZSBkcmFmdFwiIGV0Yy4pLlxuICovXG5jb25zdCBHUkVFTkhPVVNFX1NVQk1JVF9TRUxFQ1RPUlMgPSBbXG4gICAgXCIjc3VibWl0X2FwcFwiLFxuICAgICdidXR0b25bdHlwZT1cInN1Ym1pdFwiXScsXG4gICAgJ2J1dHRvbltkYXRhLXRlc3QqPVwic3VibWl0XCJdJyxcbiAgICAnaW5wdXRbdHlwZT1cInN1Ym1pdFwiXSNzdWJtaXRfYXBwJyxcbl07XG5jb25zdCBHUkVFTkhPVVNFX1NVQk1JVF9MQUJFTFNfUkUgPSAvKHN1Ym1pdCBhcHBsaWNhdGlvbnxzdWJtaXR8cmV2aWV3IGFuZCBzdWJtaXQpL2k7XG4vKiogVHJ1ZSB3aGVuIHRoZSBVUkwgYmVsb25ncyB0byBhIEdyZWVuaG91c2UgYXBwbGljYW50IGZsb3cuICovXG5leHBvcnQgZnVuY3Rpb24gaXNHcmVlbmhvdXNlQXBwbHlVcmwodXJsKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcGFyc2VkID0gbmV3IFVSTCh1cmwpO1xuICAgICAgICBpZiAoIUdSRUVOSE9VU0VfSE9TVF9SRS50ZXN0KHBhcnNlZC5ob3N0KSlcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIEdSRUVOSE9VU0VfQVBQX0ZPUk1fUkUudGVzdChwYXJzZWQucGF0aG5hbWUpO1xuICAgIH1cbiAgICBjYXRjaCB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG4vKipcbiAqIFJldHVybnMgdGhlIGRvY3VtZW50IHdlIHNob3VsZCBpbnNwZWN0IGZvciBmaWVsZHMuIFdoZW4gdGhlIGN1cnJlbnQgcGFnZVxuICogaWZyYW1lcyB0aGUgYGFwcC5ncmVlbmhvdXNlLmlvYCBmbG93LCB0aGUgZm9ybSBsaXZlcyBpbiB0aGUgaWZyYW1lIOKAlCB3ZVxuICogdHJ5IHRvIHJlYWNoIGludG8gaXRzIGBjb250ZW50RG9jdW1lbnRgICh3b3JrcyBmb3Igc2FtZS1vcmlnaW4gLyBmcmllbmRseVxuICogaWZyYW1lczsgY3Jvc3Mtb3JpZ2luIGZyYW1lcyBhcmUgaW5hY2Nlc3NpYmxlIGFuZCB3ZSBmYWxsIGJhY2sgdG8gdGhlXG4gKiBvdXRlciBkb2N1bWVudCwgd2hpY2ggaXMgaGFybWxlc3MgYmVjYXVzZSB0aGUgZGV0ZWN0b3IgZmluZHMgemVybyBmaWVsZHNcbiAqIHRoZXJlIGFuZCB0aGUgY2FsbGVyIG5vLW9wcykuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRHcmVlbmhvdXNlU2NvcGVEb2N1bWVudChyb290ID0gZG9jdW1lbnQpIHtcbiAgICAvLyBEaXJlY3QgcGFnZTogdGhlIGN1cnJlbnQgZG9jdW1lbnQgYWxyZWFkeSBpcyB0aGUgR3JlZW5ob3VzZSBmb3JtLlxuICAgIGlmIChHUkVFTkhPVVNFX0hPU1RfUkUudGVzdChyb290LmxvY2F0aW9uLmhvc3QpKVxuICAgICAgICByZXR1cm4gcm9vdDtcbiAgICAvLyBJZnJhbWVkIGFwcDogZmluZCBhbiBpZnJhbWUgcG9pbnRpbmcgYXQgZ3JlZW5ob3VzZS5pbyBhbmQgdHJ5IHRvIHJlYWQgaXQuXG4gICAgY29uc3QgZnJhbWVzID0gcm9vdC5xdWVyeVNlbGVjdG9yQWxsKFwiaWZyYW1lXCIpO1xuICAgIGZvciAoY29uc3QgZnJhbWUgb2YgZnJhbWVzKSB7XG4gICAgICAgIGNvbnN0IHNyYyA9IGZyYW1lLmdldEF0dHJpYnV0ZShcInNyY1wiKSA/PyBcIlwiO1xuICAgICAgICBpZiAoIS9ncmVlbmhvdXNlXFwuaW8vaS50ZXN0KHNyYykpXG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGRvYyA9IGZyYW1lLmNvbnRlbnREb2N1bWVudDtcbiAgICAgICAgICAgIGlmIChkb2MpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvYztcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCB7XG4gICAgICAgICAgICAvLyBDcm9zcy1vcmlnaW4gZnJhbWUg4oCUIGNhbid0IHJlYWQgaXQuIE1vdmUgb247IHRoZSBvdXRlciBwYWdlIHdpbGxcbiAgICAgICAgICAgIC8vIHN0aWxsIG1hdGNoIFVSTC1ob3N0IGRldGVjdGlvbiBpZiB0aGUgdXNlciBpcyBvbiBncmVlbmhvdXNlLmlvXG4gICAgICAgICAgICAvLyBkaXJlY3RseSwgYW5kIHdlIG5vLW9wIG90aGVyd2lzZS5cbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByb290O1xufVxuZXhwb3J0IGNsYXNzIEdyZWVuaG91c2VNdWx0aXN0ZXBIYW5kbGVyIHtcbiAgICBjb25zdHJ1Y3RvcihkZXBzKSB7XG4gICAgICAgIHRoaXMuZGV0ZWN0b3IgPSBuZXcgRmllbGREZXRlY3RvcigpO1xuICAgICAgICB0aGlzLnN1Ym1pdExpc3RlbmVyQXR0YWNoZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5mYWxsYmFja0RlY2xpbmVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaWZyYW1lT2JzZXJ2ZXIgPSBudWxsO1xuICAgICAgICB0aGlzLmRlcHMgPSBkZXBzO1xuICAgIH1cbiAgICBpc0FjdGl2ZSgpIHtcbiAgICAgICAgaWYgKGlzR3JlZW5ob3VzZUFwcGx5VXJsKHdpbmRvdy5sb2NhdGlvbi5ocmVmKSlcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAvLyBJZnJhbWVkIGZsb3c6IG91dGVyIFVSTCBtaWdodCBiZSB0aGUgZW1wbG95ZXIncyBjYXJlZXJzIHNpdGUuIENoZWNrXG4gICAgICAgIC8vIGZvciBhIEdyZWVuaG91c2UtYXBwIGlmcmFtZSBvbiB0aGUgcGFnZS5cbiAgICAgICAgcmV0dXJuICEhZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaWZyYW1lW3NyYyo9XCJncmVlbmhvdXNlLmlvXCJdJyk7XG4gICAgfVxuICAgIGFzeW5jIGNvbmZpcm0ob3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIGlmICghdGhpcy5pc0FjdGl2ZSgpKVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIGNvbnN0IFt0YWJJZCwgcHJvZmlsZV0gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgICAgICB0aGlzLmRlcHMuZ2V0VGFiSWQoKSxcbiAgICAgICAgICAgIHRoaXMuZGVwcy5nZXRQcm9maWxlKCksXG4gICAgICAgIF0pO1xuICAgICAgICBpZiAoIXRhYklkIHx8ICFwcm9maWxlKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCJbU2xvdGhpbmddIEdyZWVuaG91c2UgY29uZmlybTogbWlzc2luZyB0YWJJZCBvciBwcm9maWxlXCIpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgc2Vzc2lvbiA9IHtcbiAgICAgICAgICAgIHRhYklkLFxuICAgICAgICAgICAgcHJvdmlkZXI6IFwiZ3JlZW5ob3VzZVwiLFxuICAgICAgICAgICAgam9iVXJsOiB3aW5kb3cubG9jYXRpb24uaHJlZixcbiAgICAgICAgICAgIHByb2ZpbGUsXG4gICAgICAgICAgICBiYXNlUmVzdW1lSWQ6IG9wdGlvbnMuYmFzZVJlc3VtZUlkLFxuICAgICAgICAgICAgY29uZmlybWVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgfTtcbiAgICAgICAgYXdhaXQgc2V0U2Vzc2lvbihzZXNzaW9uKTtcbiAgICAgICAgdGhpcy5mYWxsYmFja0RlY2xpbmVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuYXR0YWNoU3VibWl0V2F0Y2hlcih0YWJJZCk7XG4gICAgICAgIHRoaXMuYXR0YWNoSWZyYW1lT2JzZXJ2ZXIoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMucnVuRmlsbChzZXNzaW9uKTtcbiAgICB9XG4gICAgYXN5bmMgb25TdGVwVHJhbnNpdGlvbigpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzQWN0aXZlKCkpXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgY29uc3QgdGFiSWQgPSBhd2FpdCB0aGlzLmRlcHMuZ2V0VGFiSWQoKTtcbiAgICAgICAgaWYgKCF0YWJJZClcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICBjb25zdCBzZXNzaW9uID0gYXdhaXQgZ2V0U2Vzc2lvbih0YWJJZCwgXCJncmVlbmhvdXNlXCIpO1xuICAgICAgICBpZiAoIXNlc3Npb24pXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgYXdhaXQgd2FpdEZvckdyZWVuaG91c2VTdGVwUmVhZHkoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMucnVuRmlsbChzZXNzaW9uKTtcbiAgICB9XG4gICAgYXN5bmMgb25TdGVwVHJhbnNpdGlvblZpYUZhbGxiYWNrKHN0ZXBIaW50KSB7XG4gICAgICAgIGlmICghdGhpcy5pc0FjdGl2ZSgpKVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIGlmICh0aGlzLmZhbGxiYWNrRGVjbGluZWQpXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgY29uc3QgdGFiSWQgPSBhd2FpdCB0aGlzLmRlcHMuZ2V0VGFiSWQoKTtcbiAgICAgICAgaWYgKCF0YWJJZClcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICBjb25zdCBzZXNzaW9uID0gYXdhaXQgZ2V0U2Vzc2lvbih0YWJJZCwgXCJncmVlbmhvdXNlXCIpO1xuICAgICAgICBpZiAoIXNlc3Npb24pXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgY29uc3QgYWNjZXB0ZWQgPSBhd2FpdCBwcm9tcHRTdGVwRmFsbGJhY2soe1xuICAgICAgICAgICAgcHJvdmlkZXJMYWJlbDogXCJHcmVlbmhvdXNlXCIsXG4gICAgICAgICAgICBzdGVwTnVtYmVyOiBzdGVwSGludD8uc3RlcE51bWJlcixcbiAgICAgICAgICAgIHRvdGFsU3RlcHM6IHN0ZXBIaW50Py50b3RhbFN0ZXBzLFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCFhY2NlcHRlZCkge1xuICAgICAgICAgICAgdGhpcy5mYWxsYmFja0RlY2xpbmVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGF3YWl0IGNsZWFyU2Vzc2lvbih0YWJJZCk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBhd2FpdCB3YWl0Rm9yR3JlZW5ob3VzZVN0ZXBSZWFkeSgpO1xuICAgICAgICByZXR1cm4gdGhpcy5ydW5GaWxsKHNlc3Npb24pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHcmVlbmhvdXNlIGRvZXNuJ3QgZXhwb3NlIGEgbnVtYmVyZWQgcHJvZ3Jlc3MgYmFyIGNvbnNpc3RlbnRseS4gV2VcbiAgICAgKiBpbnNwZWN0IGBbZGF0YS10ZXN0Kj1cInN0ZXBcIl1gIGFuZCBgW3JvbGU9XCJ0YWJcIl1gIGZvciBhbiBcImFjdGl2ZVwiIGhpbnRcbiAgICAgKiBidXQgaWYgbm90aGluZyBtYXRjaGVzIHdlIGp1c3Qgb21pdCB0aGUgc3RlcCB0ZXh0IGZyb20gdGhlIHRvYXN0LlxuICAgICAqL1xuICAgIGRldGVjdFN0ZXBIaW50KCkge1xuICAgICAgICBjb25zdCBkb2MgPSBnZXRHcmVlbmhvdXNlU2NvcGVEb2N1bWVudCgpO1xuICAgICAgICBjb25zdCBjYW5kaWRhdGVzID0gZG9jLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tyb2xlPVwidGFiXCJdLCBbZGF0YS10ZXN0Kj1cInN0ZXBcIl0nKTtcbiAgICAgICAgaWYgKGNhbmRpZGF0ZXMubGVuZ3RoID09PSAwKVxuICAgICAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgICBjb25zdCBhY3RpdmVJZHggPSBBcnJheS5mcm9tKGNhbmRpZGF0ZXMpLmZpbmRJbmRleCgobm9kZSkgPT4gbm9kZS5nZXRBdHRyaWJ1dGUoXCJhcmlhLXNlbGVjdGVkXCIpID09PSBcInRydWVcIiB8fFxuICAgICAgICAgICAgL2FjdGl2ZXxjdXJyZW50L2kudGVzdChub2RlLmNsYXNzTmFtZSkpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3RlcE51bWJlcjogYWN0aXZlSWR4ID49IDAgPyBhY3RpdmVJZHggKyAxIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgdG90YWxTdGVwczogY2FuZGlkYXRlcy5sZW5ndGgsXG4gICAgICAgIH07XG4gICAgfVxuICAgIGRlc3Ryb3koKSB7XG4gICAgICAgIHRoaXMuaWZyYW1lT2JzZXJ2ZXI/LmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgdGhpcy5pZnJhbWVPYnNlcnZlciA9IG51bGw7XG4gICAgfVxuICAgIGFzeW5jIHJ1bkZpbGwoc2Vzc2lvbikge1xuICAgICAgICBjb25zdCBmaWVsZHMgPSB0aGlzLmNvbGxlY3RGaWVsZHMoKTtcbiAgICAgICAgaWYgKGZpZWxkcy5sZW5ndGggPT09IDApXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgY29uc3QgbWFwcGVyID0gbmV3IEZpZWxkTWFwcGVyKHNlc3Npb24ucHJvZmlsZSk7XG4gICAgICAgIGNvbnN0IGVuZ2luZSA9IG5ldyBBdXRvRmlsbEVuZ2luZSh0aGlzLmRldGVjdG9yLCBtYXBwZXIpO1xuICAgICAgICByZXR1cm4gZW5naW5lLmZpbGxGb3JtKGZpZWxkcyk7XG4gICAgfVxuICAgIGNvbGxlY3RGaWVsZHMoKSB7XG4gICAgICAgIGNvbnN0IGRvYyA9IGdldEdyZWVuaG91c2VTY29wZURvY3VtZW50KCk7XG4gICAgICAgIGNvbnN0IHNjb3BlID0gZG9jLnF1ZXJ5U2VsZWN0b3IoXCIjYXBwbGljYXRpb25cIikgPz9cbiAgICAgICAgICAgIGRvYy5xdWVyeVNlbGVjdG9yKFwiI21haW5fZmllbGRzXCIpID8/XG4gICAgICAgICAgICBkb2MucXVlcnlTZWxlY3RvcihcImZvcm0jYXBwbGljYXRpb25fZm9ybVwiKSA/P1xuICAgICAgICAgICAgZG9jLmJvZHkgPz9cbiAgICAgICAgICAgIGRvYy5kb2N1bWVudEVsZW1lbnQ7XG4gICAgICAgIGlmICghc2NvcGUpXG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIGNvbnN0IGlucHV0cyA9IHNjb3BlLnF1ZXJ5U2VsZWN0b3JBbGwoXCJpbnB1dCwgdGV4dGFyZWEsIHNlbGVjdFwiKTtcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IGVsIG9mIGlucHV0cykge1xuICAgICAgICAgICAgaWYgKHNob3VsZFNraXBGb3JHcmVlbmhvdXNlKGVsKSlcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIGNvbnN0IGRldGVjdGVkID0gdGhpcy5kZXRlY3Rvci5kZXRlY3RGaWVsZFR5cGUoZWwpO1xuICAgICAgICAgICAgaWYgKGRldGVjdGVkLmZpZWxkVHlwZSAhPT0gXCJ1bmtub3duXCIgfHwgZGV0ZWN0ZWQuY29uZmlkZW5jZSA+IDAuMSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChkZXRlY3RlZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfVxuICAgIGF0dGFjaFN1Ym1pdFdhdGNoZXIodGFiSWQpIHtcbiAgICAgICAgaWYgKHRoaXMuc3VibWl0TGlzdGVuZXJBdHRhY2hlZClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgdGhpcy5zdWJtaXRMaXN0ZW5lckF0dGFjaGVkID0gdHJ1ZTtcbiAgICAgICAgY29uc3QgaGFuZGxlciA9IChldmVudCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xuICAgICAgICAgICAgaWYgKCF0YXJnZXQpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgY29uc3QgYnV0dG9uID0gdGFyZ2V0LmNsb3Nlc3QoJ2J1dHRvbiwgaW5wdXRbdHlwZT1cInN1Ym1pdFwiXScpO1xuICAgICAgICAgICAgaWYgKCFidXR0b24pXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKCFtYXRjaGVzR3JlZW5ob3VzZVN1Ym1pdEJ1dHRvbihidXR0b24pKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIHZvaWQgY2xlYXJTZXNzaW9uKHRhYklkKTtcbiAgICAgICAgfTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGhhbmRsZXIsIHRydWUpO1xuICAgICAgICAvLyBBbHNvIGxpc3RlbiBpbnNpZGUgdGhlIGlmcmFtZSAoc2FtZS1vcmlnaW4gY2FzZSkuIENyb3NzLW9yaWdpblxuICAgICAgICAvLyBmcmFtZXMgd2lsbCB0aHJvdzsgdGhlIGNhdGNoIGtlZXBzIHVzIHJvYnVzdC5cbiAgICAgICAgY29uc3QgaWZyYW1lID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaWZyYW1lW3NyYyo9XCJncmVlbmhvdXNlLmlvXCJdJyk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZnJhbWU/LmNvbnRlbnREb2N1bWVudD8uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGhhbmRsZXIsIHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIHtcbiAgICAgICAgICAgIC8vIGlnbm9yZSDigJQgY3Jvc3Mtb3JpZ2luIGZyYW1lXG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogV2hlbiB0aGUgcGFnZSBpcyB0aGUgb3V0ZXIgY2FyZWVycyBzaXRlIHdpdGggYW4gaWZyYW1lZCBHcmVlbmhvdXNlIGFwcCxcbiAgICAgKiBVUkwgY2hhbmdlcyBvbiB0aGUgb3V0ZXIgcGFnZSBkb24ndCB0ZWxsIHVzIGFib3V0IHRoZSBpZnJhbWUnc1xuICAgICAqIG5hdmlnYXRpb24uIFdhdGNoIHRoZSBpZnJhbWUncyBib2R5IGZvciBET00gbXV0YXRpb25zIGFzIGEgc3RlcC1cbiAgICAgKiB0cmFuc2l0aW9uIHByb3h5LiBXZSBkZWJvdW5jZSBzbyBhIHNpbmdsZSBzdGVwIHRyYW5zaXRpb24gZG9lc24ndCBmaXJlXG4gICAgICogYSBodW5kcmVkIHByb21wdHMuXG4gICAgICovXG4gICAgYXR0YWNoSWZyYW1lT2JzZXJ2ZXIoKSB7XG4gICAgICAgIGlmICh0aGlzLmlmcmFtZU9ic2VydmVyKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBjb25zdCBpZnJhbWUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpZnJhbWVbc3JjKj1cImdyZWVuaG91c2UuaW9cIl0nKTtcbiAgICAgICAgaWYgKCFpZnJhbWUpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGxldCBmcmFtZURvYztcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGZyYW1lRG9jID0gaWZyYW1lLmNvbnRlbnREb2N1bWVudDtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFmcmFtZURvYylcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgbGV0IGxhc3RUcmlnZ2VyID0gMDtcbiAgICAgICAgdGhpcy5pZnJhbWVPYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG4gICAgICAgICAgICBpZiAobm93IC0gbGFzdFRyaWdnZXIgPCA3NTApXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgbGFzdFRyaWdnZXIgPSBub3c7XG4gICAgICAgICAgICAvLyBSZS10cmlnZ2VyIHRoZSBzdGVwIHBpcGVsaW5lLiBUaGUgY29udHJvbGxlciBkaXNwYXRjaGVzIGJldHdlZW5cbiAgICAgICAgICAgIC8vIHRoZSB3ZWJOYXYgYW5kIGZhbGxiYWNrIHBhdGhzLlxuICAgICAgICAgICAgdm9pZCB0aGlzLm9uU3RlcFRyYW5zaXRpb24oKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLmlmcmFtZU9ic2VydmVyLm9ic2VydmUoZnJhbWVEb2MuYm9keSA/PyBmcmFtZURvYy5kb2N1bWVudEVsZW1lbnQsIHtcbiAgICAgICAgICAgICAgICBjaGlsZExpc3Q6IHRydWUsXG4gICAgICAgICAgICAgICAgc3VidHJlZTogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIHtcbiAgICAgICAgICAgIHRoaXMuaWZyYW1lT2JzZXJ2ZXIgPSBudWxsO1xuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gc2hvdWxkU2tpcEZvckdyZWVuaG91c2UoZWwpIHtcbiAgICBjb25zdCBpbnB1dCA9IGVsO1xuICAgIGlmIChpbnB1dC5kaXNhYmxlZClcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgaWYgKGlucHV0LnR5cGUgPT09IFwiaGlkZGVuXCIgfHxcbiAgICAgICAgaW5wdXQudHlwZSA9PT0gXCJzdWJtaXRcIiB8fFxuICAgICAgICBpbnB1dC50eXBlID09PSBcImJ1dHRvblwiKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5mdW5jdGlvbiBtYXRjaGVzR3JlZW5ob3VzZVN1Ym1pdEJ1dHRvbihidXR0b24pIHtcbiAgICBjb25zdCBtYXRjaGVzID0gR1JFRU5IT1VTRV9TVUJNSVRfU0VMRUNUT1JTLnNvbWUoKHNlbCkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIGJ1dHRvbi5tYXRjaGVzKHNlbCk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2gge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgaWYgKCFtYXRjaGVzKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgY29uc3QgdGV4dCA9IChidXR0b24udGV4dENvbnRlbnQgPz8gXCJcIikudHJpbSgpIHx8XG4gICAgICAgIGJ1dHRvbi52YWx1ZSB8fFxuICAgICAgICBcIlwiO1xuICAgIHJldHVybiBHUkVFTkhPVVNFX1NVQk1JVF9MQUJFTFNfUkUudGVzdCh0ZXh0KTtcbn1cbmFzeW5jIGZ1bmN0aW9uIHdhaXRGb3JHcmVlbmhvdXNlU3RlcFJlYWR5KHRpbWVvdXRNcyA9IDUwMCkge1xuICAgIGNvbnN0IHN0YXJ0ID0gRGF0ZS5ub3coKTtcbiAgICB3aGlsZSAoRGF0ZS5ub3coKSAtIHN0YXJ0IDwgdGltZW91dE1zKSB7XG4gICAgICAgIGNvbnN0IGRvYyA9IGdldEdyZWVuaG91c2VTY29wZURvY3VtZW50KCk7XG4gICAgICAgIGlmIChkb2MucXVlcnlTZWxlY3RvcihcIiNhcHBsaWNhdGlvblwiKSB8fFxuICAgICAgICAgICAgZG9jLnF1ZXJ5U2VsZWN0b3IoXCIjbWFpbl9maWVsZHNcIikgfHxcbiAgICAgICAgICAgIGRvYy5xdWVyeVNlbGVjdG9yKFwiZm9ybSNhcHBsaWNhdGlvbl9mb3JtXCIpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgYXdhaXQgbmV3IFByb21pc2UoKHIpID0+IHNldFRpbWVvdXQociwgNTApKTtcbiAgICB9XG59XG4iLCIvLyBDb250cm9sbGVyIHRoYXQgd2lyZXMgdGhlIFdvcmtkYXkgKyBHcmVlbmhvdXNlIG11bHRpLXN0ZXAgaGFuZGxlcnMgaW50b1xuLy8gdGhlIGNvbnRlbnQtc2NyaXB0IGVudHJ5IHBvaW50LlxuLy9cbi8vIFJlc3BvbnNpYmlsaXRpZXM6XG4vLyAgIC0gRGVjaWRlIHdoaWNoIChpZiBhbnkpIHByb3ZpZGVyIGhhbmRsZXIgaXMgYWN0aXZlIGZvciB0aGUgY3VycmVudCBVUkwuXG4vLyAgIC0gRm9yd2FyZCBzdGVwLXRyYW5zaXRpb24gZXZlbnRzIGZyb20gdGhlIGJhY2tncm91bmQgKHdlYk5hdmlnYXRpb24pIHRvXG4vLyAgICAgdGhlIGFjdGl2ZSBoYW5kbGVyLlxuLy8gICAtIFdoZW4gd2ViTmF2aWdhdGlvbiBpcyB1bmF2YWlsYWJsZSwgZmFsbCBiYWNrIHRvIE11dGF0aW9uT2JzZXJ2ZXIgK1xuLy8gICAgIFVSTCBjaGFuZ2UgZGV0ZWN0aW9uIGFuZCBzdXJmYWNlIHRoZSBwcm9tcHRlZCB0b2FzdC5cbi8vXG4vLyBUaGUgY29udHJvbGxlciBpcyBjcmVhdGVkIG9uY2UgcGVyIGNvbnRlbnQtc2NyaXB0IGxvYWQuIEl0J3MgaW50ZW50aW9uYWxseVxuLy8gdGhpbiDigJQgYWxtb3N0IGFsbCBsb2dpYyBsaXZlcyBpbiB0aGUgcGVyLXByb3ZpZGVyIGhhbmRsZXJzIOKAlCBzbyB0aGVcbi8vIHdpcmluZyBpbiBgY29udGVudC9pbmRleC50c2Agc3RheXMgY29tcGFjdC5cbmltcG9ydCB7IHNlbmRNZXNzYWdlLCBNZXNzYWdlcyB9IGZyb20gXCJAL3NoYXJlZC9tZXNzYWdlc1wiO1xuaW1wb3J0IHsgV29ya2RheU11bHRpc3RlcEhhbmRsZXIsIGlzV29ya2RheUFwcGx5VXJsIH0gZnJvbSBcIi4vd29ya2RheVwiO1xuaW1wb3J0IHsgR3JlZW5ob3VzZU11bHRpc3RlcEhhbmRsZXIsIGlzR3JlZW5ob3VzZUFwcGx5VXJsIH0gZnJvbSBcIi4vZ3JlZW5ob3VzZVwiO1xuaW1wb3J0IHsgZGlzbWlzc1N0ZXBGYWxsYmFjayB9IGZyb20gXCIuL3Byb21wdC1mYWxsYmFja1wiO1xuZXhwb3J0IGNsYXNzIE11bHRpc3RlcENvbnRyb2xsZXIge1xuICAgIGNvbnN0cnVjdG9yKGRlcHMpIHtcbiAgICAgICAgdGhpcy5hY3RpdmUgPSBudWxsO1xuICAgICAgICB0aGlzLmxhc3RVcmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZjtcbiAgICAgICAgdGhpcy5mYWxsYmFja1VybEludGVydmFsID0gbnVsbDtcbiAgICAgICAgdGhpcy5jYWNoZWRUYWJJZCA9IG51bGw7XG4gICAgICAgIHRoaXMuY2FjaGVkSGFzV2ViTmF2ID0gbnVsbDtcbiAgICAgICAgdGhpcy5kZXBzID0gZGVwcztcbiAgICB9XG4gICAgLyoqXG4gICAgICogSW5pdGlhbGlzZSB0aGUgY29udHJvbGxlciBmb3IgdGhlIGN1cnJlbnQgcGFnZS4gUmV0dXJucyB0aGUgcHJvdmlkZXJcbiAgICAgKiB0aGF0J3MgYWN0aXZlIChvciBgbnVsbGAgaWYgbmVpdGhlciBXb3JrZGF5IG5vciBHcmVlbmhvdXNlIG1hdGNoZXMpLlxuICAgICAqIFNhZmUgdG8gY2FsbCBtdWx0aXBsZSB0aW1lcyDigJQgdGhlIHNlY29uZCBjYWxsIG5vLW9wcyBpZiB0aGUgcHJvdmlkZXJcbiAgICAgKiBoYXNuJ3QgY2hhbmdlZC5cbiAgICAgKi9cbiAgICBpbml0KCkge1xuICAgICAgICBjb25zdCBwcm92aWRlciA9IHRoaXMuZGV0ZWN0UHJvdmlkZXIoKTtcbiAgICAgICAgaWYgKCFwcm92aWRlcikge1xuICAgICAgICAgICAgdGhpcy5hY3RpdmUgPSBudWxsO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuYWN0aXZlPy5wcm92aWRlciA9PT0gcHJvdmlkZXIpXG4gICAgICAgICAgICByZXR1cm4gcHJvdmlkZXI7XG4gICAgICAgIGNvbnN0IHNoYXJlZERlcHMgPSB7XG4gICAgICAgICAgICBnZXRUYWJJZDogKCkgPT4gdGhpcy5nZXRUYWJJZCgpLFxuICAgICAgICAgICAgZ2V0UHJvZmlsZTogKCkgPT4gdGhpcy5kZXBzLmdldFByb2ZpbGUoKSxcbiAgICAgICAgICAgIGhhc1dlYk5hdmlnYXRpb25QZXJtaXNzaW9uOiAoKSA9PiB0aGlzLmhhc1dlYk5hdmlnYXRpb25QZXJtaXNzaW9uKCksXG4gICAgICAgIH07XG4gICAgICAgIGlmIChwcm92aWRlciA9PT0gXCJ3b3JrZGF5XCIpIHtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlID0ge1xuICAgICAgICAgICAgICAgIHByb3ZpZGVyLFxuICAgICAgICAgICAgICAgIHdvcmtkYXk6IG5ldyBXb3JrZGF5TXVsdGlzdGVwSGFuZGxlcihzaGFyZWREZXBzKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZSA9IHtcbiAgICAgICAgICAgICAgICBwcm92aWRlcixcbiAgICAgICAgICAgICAgICBncmVlbmhvdXNlOiBuZXcgR3JlZW5ob3VzZU11bHRpc3RlcEhhbmRsZXIoc2hhcmVkRGVwcyksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc3RhcnRGYWxsYmFja1VybFdhdGNoZXIoKTtcbiAgICAgICAgcmV0dXJuIHByb3ZpZGVyO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBUaGUgdXNlciBjbGlja2VkIFwiQXV0by1maWxsIHRoaXMgYXBwbGljYXRpb25cIiBpbiB0aGUgc2lkZWJhci4gVGhpc1xuICAgICAqIGNhcHR1cmVzIHRoZSBzZXNzaW9uLCBmaWxscyBwYWdlIDEsIGFuZCBhcm1zIHRoZSBzdGVwIHBpcGVsaW5lLlxuICAgICAqIElmIHdlYk5hdmlnYXRpb24gaXNuJ3QgYWxyZWFkeSBncmFudGVkIChGaXJlZm94IGZpcnN0LXJ1biksIHdlIGFzayBmb3JcbiAgICAgKiBpdCBoZXJlIOKAlCBleHBsaWNpdGx5IGF0IHRoZSBtb21lbnQgb2YgaW50ZW50LCBwZXIgdGhlIHBlcm1pc3Npb25cbiAgICAgKiBzdHJhdGVneSBjb25maXJtZWQgMjAyNi0wNS0xMi5cbiAgICAgKi9cbiAgICBhc3luYyBjb25maXJtKG9wdGlvbnMgPSB7fSkge1xuICAgICAgICBjb25zdCBwcm92aWRlciA9IHRoaXMuaW5pdCgpO1xuICAgICAgICBpZiAoIXByb3ZpZGVyKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAvLyBUcnkgdG8gb2J0YWluIHdlYk5hdmlnYXRpb24gbm93IHNvIGZ1dHVyZSBzdGVwIHRyYW5zaXRpb25zIGNhbiB0YWtlXG4gICAgICAgIC8vIHRoZSBzaWxlbnQgcGF0aC4gSWYgdGhlIHVzZXIgZGVjbGluZXMgKEZpcmVmb3gpIHRoZSBmYWxsYmFjayB0b2FzdFxuICAgICAgICAvLyB0YWtlcyBvdmVyIOKAlCB3ZSBzdGlsbCBwcm9jZWVkIHdpdGggdGhlIGZpcnN0LXBhZ2UgZmlsbC5cbiAgICAgICAgdm9pZCB0aGlzLnJlcXVlc3RXZWJOYXZpZ2F0aW9uUGVybWlzc2lvbigpO1xuICAgICAgICBpZiAocHJvdmlkZXIgPT09IFwid29ya2RheVwiICYmIHRoaXMuYWN0aXZlPy53b3JrZGF5KSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLmFjdGl2ZS53b3JrZGF5LmNvbmZpcm0ob3B0aW9ucyk7XG4gICAgICAgICAgICByZXR1cm4gISFyZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHByb3ZpZGVyID09PSBcImdyZWVuaG91c2VcIiAmJiB0aGlzLmFjdGl2ZT8uZ3JlZW5ob3VzZSkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5hY3RpdmUuZ3JlZW5ob3VzZS5jb25maXJtKG9wdGlvbnMpO1xuICAgICAgICAgICAgcmV0dXJuICEhcmVzdWx0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogSGFuZGxlIGEgc3RlcC10cmFuc2l0aW9uIG1lc3NhZ2UgZnJvbSB0aGUgYmFja2dyb3VuZCdzIHdlYk5hdmlnYXRpb25cbiAgICAgKiBsaXN0ZW5lci4gRGlzcGF0Y2hlZCBpbiBgY29udGVudC9pbmRleC50c2AuXG4gICAgICovXG4gICAgYXN5bmMgb25XZWJOYXZpZ2F0aW9uVHJhbnNpdGlvbigpIHtcbiAgICAgICAgaWYgKCF0aGlzLmFjdGl2ZSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgdGhpcy5sYXN0VXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWY7XG4gICAgICAgIGlmICh0aGlzLmFjdGl2ZS53b3JrZGF5KSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLmFjdGl2ZS53b3JrZGF5Lm9uU3RlcFRyYW5zaXRpb24oKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzLmFjdGl2ZS5ncmVlbmhvdXNlKSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLmFjdGl2ZS5ncmVlbmhvdXNlLm9uU3RlcFRyYW5zaXRpb24oKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBUZWFyIGRvd24gcGVyLXByb3ZpZGVyIHdhdGNoZXJzLiBDYWxsZWQgZnJvbSBgcGFnZWhpZGVgLlxuICAgICAqL1xuICAgIGRlc3Ryb3koKSB7XG4gICAgICAgIGlmICh0aGlzLmZhbGxiYWNrVXJsSW50ZXJ2YWwpIHtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5mYWxsYmFja1VybEludGVydmFsKTtcbiAgICAgICAgICAgIHRoaXMuZmFsbGJhY2tVcmxJbnRlcnZhbCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5hY3RpdmU/LndvcmtkYXk/LmRlc3Ryb3koKTtcbiAgICAgICAgdGhpcy5hY3RpdmU/LmdyZWVuaG91c2U/LmRlc3Ryb3koKTtcbiAgICAgICAgZGlzbWlzc1N0ZXBGYWxsYmFjaygpO1xuICAgIH1cbiAgICBkZXRlY3RQcm92aWRlcigpIHtcbiAgICAgICAgY29uc3QgdXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWY7XG4gICAgICAgIGlmIChpc1dvcmtkYXlBcHBseVVybCh1cmwpKVxuICAgICAgICAgICAgcmV0dXJuIFwid29ya2RheVwiO1xuICAgICAgICBpZiAoaXNHcmVlbmhvdXNlQXBwbHlVcmwodXJsKSlcbiAgICAgICAgICAgIHJldHVybiBcImdyZWVuaG91c2VcIjtcbiAgICAgICAgLy8gSWZyYW1lZCBHcmVlbmhvdXNlIG9uIGEgdGhpcmQtcGFydHkgY2FyZWVycyBzaXRlLlxuICAgICAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaWZyYW1lW3NyYyo9XCJncmVlbmhvdXNlLmlvXCJdJykpIHtcbiAgICAgICAgICAgIHJldHVybiBcImdyZWVuaG91c2VcIjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogV2hlbiB3ZWJOYXZpZ2F0aW9uIGlzbid0IGdyYW50ZWQsIHdhdGNoIGZvciBVUkwgY2hhbmdlcyAoaGlzdG9yeS5wdXNoU3RhdGVcbiAgICAgKiAvIGhhc2hjaGFuZ2UgLyBwb3BzdGF0ZSkgYW5kIHRyaWdnZXIgdGhlIHByb21wdGVkLWZhbGxiYWNrIHBhdGguIFRoZVxuICAgICAqIGlmcmFtZS1HcmVlbmhvdXNlIGNhc2UgaXMgY292ZXJlZCBieSBhIE11dGF0aW9uT2JzZXJ2ZXIgaW5zaWRlIGl0cyBoYW5kbGVyLlxuICAgICAqL1xuICAgIHN0YXJ0RmFsbGJhY2tVcmxXYXRjaGVyKCkge1xuICAgICAgICBpZiAodGhpcy5mYWxsYmFja1VybEludGVydmFsKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBjb25zdCB0aWNrID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmFjdGl2ZSlcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAvLyBJZiB3ZWJOYXZpZ2F0aW9uIElTIGdyYW50ZWQsIHRoZSBiYWNrZ3JvdW5kIGFscmVhZHkgZmlyZXMgdXNcbiAgICAgICAgICAgIC8vIGV4cGxpY2l0IHRyYW5zaXRpb24gZXZlbnRzIOKAlCBza2lwIHRoZSBmYWxsYmFjayB0byBhdm9pZCBkb3VibGUtXG4gICAgICAgICAgICAvLyBwcm9tcHRpbmcuXG4gICAgICAgICAgICBpZiAoYXdhaXQgdGhpcy5oYXNXZWJOYXZpZ2F0aW9uUGVybWlzc2lvbigpKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIGlmICh3aW5kb3cubG9jYXRpb24uaHJlZiA9PT0gdGhpcy5sYXN0VXJsKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIHRoaXMubGFzdFVybCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuICAgICAgICAgICAgaWYgKHRoaXMuYWN0aXZlLndvcmtkYXkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBoaW50ID0gdGhpcy5hY3RpdmUud29ya2RheS5kZXRlY3RTdGVwSGludCgpO1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuYWN0aXZlLndvcmtkYXkub25TdGVwVHJhbnNpdGlvblZpYUZhbGxiYWNrKGhpbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5hY3RpdmUuZ3JlZW5ob3VzZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGhpbnQgPSB0aGlzLmFjdGl2ZS5ncmVlbmhvdXNlLmRldGVjdFN0ZXBIaW50KCk7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5hY3RpdmUuZ3JlZW5ob3VzZS5vblN0ZXBUcmFuc2l0aW9uVmlhRmFsbGJhY2soaGludCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIC8vIDUwMG1zIGlzIGEgc2Vuc2libGUgYmFsYW5jZSDigJQgd2ViTmF2LWxpc3RlbmVyIGxhdGVuY3kgb24gcmVhbFxuICAgICAgICAvLyBicm93c2VycyBpcyB+MTAwLTMwMG1zLCBhbmQgd2UgZG9uJ3Qgd2FudCB0byB0aHJhc2ggb24gZXZlcnlcbiAgICAgICAgLy8gaGFzaGNoYW5nZS5cbiAgICAgICAgdGhpcy5mYWxsYmFja1VybEludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgdm9pZCB0aWNrKCk7XG4gICAgICAgIH0sIDUwMCk7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicG9wc3RhdGVcIiwgKCkgPT4gdm9pZCB0aWNrKCkpO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImhhc2hjaGFuZ2VcIiwgKCkgPT4gdm9pZCB0aWNrKCkpO1xuICAgIH1cbiAgICBhc3luYyBnZXRUYWJJZCgpIHtcbiAgICAgICAgaWYgKHRoaXMuY2FjaGVkVGFiSWQgIT09IG51bGwpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jYWNoZWRUYWJJZDtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBzZW5kTWVzc2FnZShNZXNzYWdlcy5nZXRUYWJJZCgpKTtcbiAgICAgICAgaWYgKHJlc3BvbnNlLnN1Y2Nlc3MgJiYgcmVzcG9uc2UuZGF0YT8udGFiSWQgIT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5jYWNoZWRUYWJJZCA9IHJlc3BvbnNlLmRhdGEudGFiSWQ7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jYWNoZWRUYWJJZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgYXN5bmMgaGFzV2ViTmF2aWdhdGlvblBlcm1pc3Npb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmNhY2hlZEhhc1dlYk5hdiAhPT0gbnVsbClcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNhY2hlZEhhc1dlYk5hdjtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgc2VuZE1lc3NhZ2UoTWVzc2FnZXMuaGFzV2ViTmF2aWdhdGlvblBlcm1pc3Npb24oKSk7XG4gICAgICAgICAgICB0aGlzLmNhY2hlZEhhc1dlYk5hdiA9ICEhKHJlc3BvbnNlLnN1Y2Nlc3MgJiYgcmVzcG9uc2UuZGF0YT8uZ3JhbnRlZCk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2gge1xuICAgICAgICAgICAgdGhpcy5jYWNoZWRIYXNXZWJOYXYgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5jYWNoZWRIYXNXZWJOYXY7XG4gICAgfVxuICAgIGFzeW5jIHJlcXVlc3RXZWJOYXZpZ2F0aW9uUGVybWlzc2lvbigpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgc2VuZE1lc3NhZ2UoTWVzc2FnZXMucmVxdWVzdFdlYk5hdmlnYXRpb25QZXJtaXNzaW9uKCkpO1xuICAgICAgICAgICAgY29uc3QgZ3JhbnRlZCA9ICEhKHJlc3BvbnNlLnN1Y2Nlc3MgJiYgcmVzcG9uc2UuZGF0YT8uZ3JhbnRlZCk7XG4gICAgICAgICAgICB0aGlzLmNhY2hlZEhhc1dlYk5hdiA9IGdyYW50ZWQ7XG4gICAgICAgICAgICByZXR1cm4gZ3JhbnRlZDtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCB7XG4gICAgICAgICAgICB0aGlzLmNhY2hlZEhhc1dlYk5hdiA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8gQ29udGVudCBzY3JpcHQgZW50cnkgcG9pbnQgZm9yIFNsb3RoaW5nIGV4dGVuc2lvblxuLy8gSW1wb3J0IHN0eWxlcyBmb3IgY29udGVudCBzY3JpcHRcbmltcG9ydCBcIi4vdWkvc3R5bGVzLmNzc1wiO1xuaW1wb3J0IHsgRmllbGREZXRlY3RvciB9IGZyb20gXCIuL2F1dG8tZmlsbC9maWVsZC1kZXRlY3RvclwiO1xuaW1wb3J0IHsgRmllbGRNYXBwZXIgfSBmcm9tIFwiLi9hdXRvLWZpbGwvZmllbGQtbWFwcGVyXCI7XG5pbXBvcnQgeyBBdXRvRmlsbEVuZ2luZSB9IGZyb20gXCIuL2F1dG8tZmlsbC9lbmdpbmVcIjtcbmltcG9ydCB7IGdldFNjcmFwZXJGb3JVcmwgfSBmcm9tIFwiLi9zY3JhcGVycy9zY3JhcGVyLXJlZ2lzdHJ5XCI7XG5pbXBvcnQgeyBXYXRlcmxvb1dvcmtzT3JjaGVzdHJhdG9yLCBnZXRXYXRlcmxvb1dvcmtzTmV4dFBhZ2VMaW5rLCBnZXRXYXRlcmxvb1dvcmtzUm93cywgfSBmcm9tIFwiLi9zY3JhcGVycy93YXRlcmxvby13b3Jrcy1vcmNoZXN0cmF0b3JcIjtcbmltcG9ydCB7IEdyZWVuaG91c2VPcmNoZXN0cmF0b3IgfSBmcm9tIFwiLi9zY3JhcGVycy9ncmVlbmhvdXNlLW9yY2hlc3RyYXRvclwiO1xuaW1wb3J0IHsgTGV2ZXJPcmNoZXN0cmF0b3IgfSBmcm9tIFwiLi9zY3JhcGVycy9sZXZlci1vcmNoZXN0cmF0b3JcIjtcbmltcG9ydCB7IFdvcmtkYXlPcmNoZXN0cmF0b3IgfSBmcm9tIFwiLi9zY3JhcGVycy93b3JrZGF5LW9yY2hlc3RyYXRvclwiO1xuaW1wb3J0IHsgQ0hBVF9QT1JUX05BTUUsIERFRkFVTFRfQVBJX0JBU0VfVVJMIH0gZnJvbSBcIkAvc2hhcmVkL3R5cGVzXCI7XG5pbXBvcnQgeyBzZW5kTWVzc2FnZSwgTWVzc2FnZXMgfSBmcm9tIFwiQC9zaGFyZWQvbWVzc2FnZXNcIjtcbmltcG9ydCB7IG1lc3NhZ2VGb3JFcnJvciB9IGZyb20gXCJAL3NoYXJlZC9lcnJvci1tZXNzYWdlc1wiO1xuaW1wb3J0IHsgc2hvd0FwcGxpZWRUb2FzdCB9IGZyb20gXCIuL3RyYWNraW5nL2FwcGxpZWQtdG9hc3RcIjtcbmltcG9ydCB7IFN1Ym1pdFdhdGNoZXIsIGV4dHJhY3RDb21wYW55SGludCB9IGZyb20gXCIuL3RyYWNraW5nL3N1Ym1pdC13YXRjaGVyXCI7XG5pbXBvcnQgeyBKb2JQYWdlU2lkZWJhckNvbnRyb2xsZXIgfSBmcm9tIFwiLi9zaWRlYmFyL2NvbnRyb2xsZXJcIjtcbmltcG9ydCB7IENvcnJlY3Rpb25zVHJhY2tlciB9IGZyb20gXCIuL2NvcnJlY3Rpb25zLXRyYWNrZXJcIjtcbmltcG9ydCB7IHRyeUNhcHR1cmVMaW5rZWRJbkpvYiB9IGZyb20gXCIuL3NjcmFwZXJzL2xpbmtlZGluLXBhc3NpdmUtY2FwdHVyZVwiO1xuaW1wb3J0IHsgbW91bnRBbnN3ZXJCYW5rQnV0dG9uLCBzaG91bGREZWNvcmF0ZVRleHRhcmVhLCB1bm1vdW50QWxsQW5zd2VyQmFua0J1dHRvbnMsIH0gZnJvbSBcIi4vdWkvYW5zd2VyLWJhbmstYnV0dG9uXCI7XG5pbXBvcnQgeyBNdWx0aXN0ZXBDb250cm9sbGVyIH0gZnJvbSBcIi4vbXVsdGlzdGVwL2NvbnRyb2xsZXJcIjtcbi8vIEluaXRpYWxpemUgY29tcG9uZW50c1xuY29uc3QgZmllbGREZXRlY3RvciA9IG5ldyBGaWVsZERldGVjdG9yKCk7XG5sZXQgYXV0b0ZpbGxFbmdpbmUgPSBudWxsO1xubGV0IGNhY2hlZFByb2ZpbGUgPSBudWxsO1xubGV0IGRldGVjdGVkRmllbGRzID0gW107XG5jb25zdCBkZXRlY3RlZEZpZWxkc0J5Rm9ybSA9IG5ldyBXZWFrTWFwKCk7XG5jb25zdCBhdXRvZmlsbGVkRm9ybXMgPSBuZXcgV2Vha1NldCgpO1xubGV0IHNjcmFwZWRKb2IgPSBudWxsO1xubGV0IGpvYkRldGVjdGVkRm9yVXJsID0gbnVsbDtcbmxldCBwcm9maWxlTG9hZFByb21pc2UgPSBudWxsO1xuY29uc3Qgc2lkZWJhckNvbnRyb2xsZXIgPSBuZXcgSm9iUGFnZVNpZGViYXJDb250cm9sbGVyKCk7XG5jb25zdCBjb3JyZWN0aW9uc1RyYWNrZXIgPSBuZXcgQ29ycmVjdGlvbnNUcmFja2VyKCk7XG4vLyBQMyAvICMzNiAjMzcg4oCUIHdpcmVzIFdvcmtkYXkgKyBHcmVlbmhvdXNlIG11bHRpLXN0ZXAgaGFuZGxlcnMuIFRoZVxuLy8gY29udHJvbGxlciBpdHNlbGYgZGVjaWRlcyBwZXItVVJMIHdoZXRoZXIgaXQgc2hvdWxkIGF0dGFjaC5cbmNvbnN0IG11bHRpc3RlcENvbnRyb2xsZXIgPSBuZXcgTXVsdGlzdGVwQ29udHJvbGxlcih7XG4gICAgZ2V0UHJvZmlsZTogKCkgPT4gbG9hZFByb2ZpbGVGb3JTaWRlYmFyKCksXG59KTtcbm11bHRpc3RlcENvbnRyb2xsZXIuaW5pdCgpO1xuY29uc3Qgc3VibWl0V2F0Y2hlciA9IG5ldyBTdWJtaXRXYXRjaGVyKHtcbiAgICBnZXREZXRlY3RlZEZpZWxkczogKGZvcm0pID0+IGRldGVjdGVkRmllbGRzQnlGb3JtLmdldChmb3JtKSB8fCBbXSxcbiAgICBnZXRTY3JhcGVkSm9iOiAoKSA9PiBzY3JhcGVkSm9iLFxuICAgIGdldFNldHRpbmdzOiBnZXRFeHRlbnNpb25TZXR0aW5ncyxcbiAgICB3YXNBdXRvZmlsbGVkOiAoZm9ybSkgPT4gYXV0b2ZpbGxlZEZvcm1zLmhhcyhmb3JtKSxcbiAgICBvblRyYWNrZWQ6IGFzeW5jIChwYXlsb2FkKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgc2VuZE1lc3NhZ2UoTWVzc2FnZXMudHJhY2tBcHBsaWVkKHBheWxvYWQpKTtcbiAgICAgICAgaWYgKCFyZXNwb25zZS5zdWNjZXNzKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiW1Nsb3RoaW5nXSBGYWlsZWQgdG8gdHJhY2sgYXBwbGljYXRpb246XCIsIHJlc3BvbnNlLmVycm9yKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBzaG93QXBwbGllZFRvYXN0KGV4dHJhY3RDb21wYW55SGludChzY3JhcGVkSm9iLCBwYXlsb2FkLmhvc3QpLCAoKSA9PiB7XG4gICAgICAgICAgICBzZW5kTWVzc2FnZShNZXNzYWdlcy5vcGVuRGFzaGJvYXJkKCkpLmNhdGNoKChlcnIpID0+IGNvbnNvbGUuZXJyb3IoXCJbU2xvdGhpbmddIEZhaWxlZCB0byBvcGVuIGRhc2hib2FyZDpcIiwgZXJyKSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG59KTtcbi8vIFNjYW4gcGFnZSBvbiBsb2FkXG5zY2FuUGFnZSgpO1xuc3VibWl0V2F0Y2hlci5hdHRhY2goKTtcbi8vIFJlLXNjYW4gb24gZHluYW1pYyBjb250ZW50IGNoYW5nZXNcbmNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoZGVib3VuY2Uoc2NhblBhZ2UsIDUwMCkpO1xub2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7IGNoaWxkTGlzdDogdHJ1ZSwgc3VidHJlZTogdHJ1ZSB9KTtcbmFzeW5jIGZ1bmN0aW9uIHNjYW5QYWdlKCkge1xuICAgIC8vIERldGVjdCBmb3Jtc1xuICAgIGNvbnN0IGZvcm1zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcImZvcm1cIik7XG4gICAgZm9yIChjb25zdCBmb3JtIG9mIGZvcm1zKSB7XG4gICAgICAgIGNvbnN0IGZpZWxkcyA9IGZpZWxkRGV0ZWN0b3IuZGV0ZWN0RmllbGRzKGZvcm0pO1xuICAgICAgICBpZiAoZmllbGRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGRldGVjdGVkRmllbGRzQnlGb3JtLnNldChmb3JtLCBmaWVsZHMpO1xuICAgICAgICAgICAgZGV0ZWN0ZWRGaWVsZHMgPSBmaWVsZHM7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIltTbG90aGluZ10gRGV0ZWN0ZWQgZmllbGRzOlwiLCBmaWVsZHMubGVuZ3RoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBQMi8jMzUg4oCUIGRlY29yYXRlIGxvbmcgZXNzYXkgdGV4dGFyZWFzIHdpdGggdGhlIGlubGluZSBhbnN3ZXItYmFua1xuICAgIC8vIHBvcG92ZXIuIFRoaXMgcnVucyBpbiBhZGRpdGlvbiB0byB0aGUgZmllbGQgZGV0ZWN0b3IgYWJvdmUgYmVjYXVzZSB0aGVcbiAgICAvLyB0ZXh0YXJlYXMgd2UgY2FyZSBhYm91dCBvZnRlbiBhcmVuJ3Qgb3duZWQgYnkgYSByZWNvZ25pc2VkIGZvcm0gKHNvbWVcbiAgICAvLyBBVFMgcG9ydGFscyB1c2UgYmFyZSA8dGV4dGFyZWE+IHdpdGggZHluYW1pYyBsYWJlbHMpLlxuICAgIHNjYW5Gb3JBbnN3ZXJCYW5rVGV4dGFyZWFzKCk7XG4gICAgYXdhaXQgcmVmcmVzaFNjcmFwZWRKb2IoKTtcbiAgICB2b2lkIHVwZGF0ZVNpZGViYXIoKTtcbn1cbmFzeW5jIGZ1bmN0aW9uIHJlZnJlc2hTY3JhcGVkSm9iKCkge1xuICAgIGlmIChpc1Nsb3RoaW5nV2ViQXBwUGFnZSgpKSB7XG4gICAgICAgIHNjcmFwZWRKb2IgPSBudWxsO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3Qgc2NyYXBlciA9IGdldFNjcmFwZXJGb3JVcmwod2luZG93LmxvY2F0aW9uLmhyZWYpO1xuICAgIGlmICghc2NyYXBlci5jYW5IYW5kbGUod2luZG93LmxvY2F0aW9uLmhyZWYpKVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICBsZXQgbmV4dFNjcmFwZWRKb2IgPSBudWxsO1xuICAgIHRyeSB7XG4gICAgICAgIG5leHRTY3JhcGVkSm9iID0gYXdhaXQgc2NyYXBlci5zY3JhcGVKb2JMaXN0aW5nKCk7XG4gICAgICAgIHNjcmFwZWRKb2IgPSBuZXh0U2NyYXBlZEpvYjtcbiAgICAgICAgaWYgKG5leHRTY3JhcGVkSm9iKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIltTbG90aGluZ10gU2NyYXBlZCBqb2I6XCIsIG5leHRTY3JhcGVkSm9iLnRpdGxlKTtcbiAgICAgICAgICAgIGNvbnN0IGRldGVjdGlvbktleSA9IG5leHRTY3JhcGVkSm9iLnNvdXJjZUpvYklkIHx8IG5leHRTY3JhcGVkSm9iLnVybDtcbiAgICAgICAgICAgIGlmIChqb2JEZXRlY3RlZEZvclVybCAhPT0gZGV0ZWN0aW9uS2V5KSB7XG4gICAgICAgICAgICAgICAgam9iRGV0ZWN0ZWRGb3JVcmwgPSBkZXRlY3Rpb25LZXk7XG4gICAgICAgICAgICAgICAgc2VuZE1lc3NhZ2UoTWVzc2FnZXMuam9iRGV0ZWN0ZWQoe1xuICAgICAgICAgICAgICAgICAgICB0aXRsZTogbmV4dFNjcmFwZWRKb2IudGl0bGUsXG4gICAgICAgICAgICAgICAgICAgIGNvbXBhbnk6IG5leHRTY3JhcGVkSm9iLmNvbXBhbnksXG4gICAgICAgICAgICAgICAgICAgIHVybDogbmV4dFNjcmFwZWRKb2IudXJsLFxuICAgICAgICAgICAgICAgIH0pKS5jYXRjaCgoZXJyKSA9PiBjb25zb2xlLmVycm9yKFwiW1Nsb3RoaW5nXSBGYWlsZWQgdG8gbm90aWZ5IGpvYiBkZXRlY3RlZDpcIiwgZXJyKSk7XG4gICAgICAgICAgICAgICAgLy8gUDMvIzM4IOKAlCBwYXNzaXZlIExpbmtlZEluIGNhcHR1cmUuIE9ubHkgcnVucyBvbiBkZXRhaWwgcGFnZXMgdGhlXG4gICAgICAgICAgICAgICAgLy8gdXNlciBuYXZpZ2F0ZWQgdG8gdGhlbXNlbHZlczsgdGhlIHNjcmFwZXIgYWxyZWFkeSBlbmZvcmNlcyB0aGlzXG4gICAgICAgICAgICAgICAgLy8gYmVjYXVzZSBgc291cmNlSm9iSWRgIGlzIG9ubHkgcG9wdWxhdGVkIHdoZW4gdGhlIFVSTCBtYXRjaGVzIHRoZVxuICAgICAgICAgICAgICAgIC8vIGAvam9icy92aWV3LzppZGAgcGF0dGVybi4gRmFpbHVyZXMgaGVyZSBhcmUgZmlyZS1hbmQtZm9yZ2V0IHNvIGFcbiAgICAgICAgICAgICAgICAvLyBjYXB0dXJlIGhpY2N1cCBuZXZlciBibG9ja3MgdGhlIHZpc2libGUgc2NyYXBlL3NpZGViYXIgVVguXG4gICAgICAgICAgICAgICAgaWYgKG5leHRTY3JhcGVkSm9iLnNvdXJjZSA9PT0gXCJsaW5rZWRpblwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHZvaWQgdHJ5Q2FwdHVyZUxpbmtlZEluSm9iKG5leHRTY3JhcGVkSm9iLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZW5kTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkSW1wb3J0TWVzc2FnZTogTWVzc2FnZXMuaW1wb3J0Sm9iLFxuICAgICAgICAgICAgICAgICAgICB9KS5jYXRjaCgoZXJyKSA9PiBjb25zb2xlLndhcm4oXCJbU2xvdGhpbmddIExpbmtlZEluIHBhc3NpdmUgY2FwdHVyZSBmYWlsZWQ6XCIsIGVycikpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJbU2xvdGhpbmddIFNjcmFwZSBlcnJvcjpcIiwgZXJyKTtcbiAgICB9XG4gICAgaWYgKCFuZXh0U2NyYXBlZEpvYiAmJiBzY3JhcGVkSm9iPy51cmwgIT09IHdpbmRvdy5sb2NhdGlvbi5ocmVmKSB7XG4gICAgICAgIHNjcmFwZWRKb2IgPSBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gc2NyYXBlZEpvYjtcbn1cbmZ1bmN0aW9uIGlzU2xvdGhpbmdXZWJBcHBQYWdlKCkge1xuICAgIGNvbnN0IGhvc3QgPSB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWU7XG4gICAgaWYgKGhvc3QgPT09IFwic2xvdGhpbmcud29ya1wiIHx8IGhvc3QuZW5kc1dpdGgoXCIuc2xvdGhpbmcud29ya1wiKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGhvc3QgIT09IFwibG9jYWxob3N0XCIgJiYgaG9zdCAhPT0gXCIxMjcuMC4wLjFcIilcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiAvXFwvKD86W2Etel17Mn0oPzotW0EtWl17Mn0pP1xcLyk/ZXh0ZW5zaW9uXFwvY29ubmVjdCg/OlxcL3wkKS8udGVzdCh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUpO1xufVxuLy8gSGFuZGxlIG1lc3NhZ2VzIGZyb20gcG9wdXAgYW5kIGJhY2tncm91bmRcbmNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcigobWVzc2FnZSwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcbiAgICBoYW5kbGVNZXNzYWdlKG1lc3NhZ2UpXG4gICAgICAgIC50aGVuKHNlbmRSZXNwb25zZSlcbiAgICAgICAgLmNhdGNoKChlcnIpID0+IHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyLm1lc3NhZ2UgfSkpO1xuICAgIHJldHVybiB0cnVlOyAvLyBBc3luYyByZXNwb25zZVxufSk7XG5hc3luYyBmdW5jdGlvbiBoYW5kbGVNZXNzYWdlKG1lc3NhZ2UpIHtcbiAgICBzd2l0Y2ggKG1lc3NhZ2UudHlwZSkge1xuICAgICAgICBjYXNlIFwiR0VUX1BBR0VfU1RBVFVTXCI6XG4gICAgICAgICAgICBpZiAoIXNjcmFwZWRKb2IpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCByZWZyZXNoU2NyYXBlZEpvYigpO1xuICAgICAgICAgICAgICAgIHZvaWQgdXBkYXRlU2lkZWJhcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBoYXNGb3JtOiBkZXRlY3RlZEZpZWxkcy5sZW5ndGggPiAwLFxuICAgICAgICAgICAgICAgIGhhc0pvYkxpc3Rpbmc6IHNjcmFwZWRKb2IgIT09IG51bGwsXG4gICAgICAgICAgICAgICAgZGV0ZWN0ZWRGaWVsZHM6IGRldGVjdGVkRmllbGRzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBzY3JhcGVkSm9iLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgY2FzZSBcIkdFVF9TVVJGQUNFX0NPTlRFWFRcIjpcbiAgICAgICAgICAgIHJldHVybiBnZXRTdXJmYWNlQ29udGV4dCgpO1xuICAgICAgICBjYXNlIFwiU0hPV19TTE9USElOR19QQU5FTFwiOlxuICAgICAgICAgICAgYXdhaXQgcmVmcmVzaFNjcmFwZWRKb2IoKTtcbiAgICAgICAgICAgIGF3YWl0IHNpZGViYXJDb250cm9sbGVyLnJlc3RvcmVEb21haW4oKTtcbiAgICAgICAgICAgIGF3YWl0IHVwZGF0ZVNpZGViYXIoKTtcbiAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHNjcmFwZWRKb2IgIT09IG51bGwsIHNjcmFwZWRKb2IgfTtcbiAgICAgICAgY2FzZSBcIlRSSUdHRVJfRklMTFwiOlxuICAgICAgICAgICAgcmV0dXJuIGhhbmRsZUZpbGxGb3JtKCk7XG4gICAgICAgIGNhc2UgXCJUUklHR0VSX0lNUE9SVFwiOlxuICAgICAgICAgICAgaWYgKHNjcmFwZWRKb2IpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VuZE1lc3NhZ2UoTWVzc2FnZXMuaW1wb3J0Sm9iKHNjcmFwZWRKb2IpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogXCJObyBqb2IgZGV0ZWN0ZWRcIiB9O1xuICAgICAgICBjYXNlIFwiU0NSQVBFX0pPQlwiOlxuICAgICAgICAgICAgY29uc3Qgc2NyYXBlciA9IGdldFNjcmFwZXJGb3JVcmwod2luZG93LmxvY2F0aW9uLmhyZWYpO1xuICAgICAgICAgICAgaWYgKHNjcmFwZXIuY2FuSGFuZGxlKHdpbmRvdy5sb2NhdGlvbi5ocmVmKSkge1xuICAgICAgICAgICAgICAgIHNjcmFwZWRKb2IgPSBhd2FpdCBzY3JhcGVyLnNjcmFwZUpvYkxpc3RpbmcoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiBzY3JhcGVkSm9iIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IFwiTm8gc2NyYXBlciBhdmFpbGFibGUgZm9yIHRoaXMgc2l0ZVwiIH07XG4gICAgICAgIGNhc2UgXCJTQ1JBUEVfSk9CX0xJU1RcIjpcbiAgICAgICAgICAgIGNvbnN0IGxpc3RTY3JhcGVyID0gZ2V0U2NyYXBlckZvclVybCh3aW5kb3cubG9jYXRpb24uaHJlZik7XG4gICAgICAgICAgICBpZiAobGlzdFNjcmFwZXIuY2FuSGFuZGxlKHdpbmRvdy5sb2NhdGlvbi5ocmVmKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGpvYnMgPSBhd2FpdCBsaXN0U2NyYXBlci5zY3JhcGVKb2JMaXN0KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogam9icyB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBcIk5vIHNjcmFwZXIgYXZhaWxhYmxlIGZvciB0aGlzIHNpdGVcIiB9O1xuICAgICAgICBjYXNlIFwiV1dfR0VUX1BBR0VfU1RBVEVcIjpcbiAgICAgICAgICAgIHJldHVybiBnZXRXd1BhZ2VTdGF0ZSgpO1xuICAgICAgICBjYXNlIFwiV1dfU0NSQVBFX0FMTF9WSVNJQkxFXCI6XG4gICAgICAgICAgICByZXR1cm4gcnVuV3dCdWxrU2NyYXBlKHsgcGFnaW5hdGVkOiBmYWxzZSB9KTtcbiAgICAgICAgY2FzZSBcIldXX1NDUkFQRV9BTExfUEFHSU5BVEVEXCI6XG4gICAgICAgICAgICByZXR1cm4gcnVuV3dCdWxrU2NyYXBlKHtcbiAgICAgICAgICAgICAgICBwYWdpbmF0ZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgLi4ubWVzc2FnZS5wYXlsb2FkLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIC8vIFAzLyMzOSDigJQgR2VuZXJpYyBidWxrLXNjcmFwZSBvcmNoZXN0cmF0b3JzIGZvciBwdWJsaWMgQVRTIGhvc3RzLlxuICAgICAgICBjYXNlIFwiQlVMS19HUkVFTkhPVVNFX0dFVF9QQUdFX1NUQVRFXCI6XG4gICAgICAgICAgICByZXR1cm4gZ2V0QnVsa1NvdXJjZVBhZ2VTdGF0ZShcImdyZWVuaG91c2VcIik7XG4gICAgICAgIGNhc2UgXCJCVUxLX0dSRUVOSE9VU0VfU0NSQVBFX1ZJU0lCTEVcIjpcbiAgICAgICAgICAgIHJldHVybiBydW5CdWxrU291cmNlU2NyYXBlKFwiZ3JlZW5ob3VzZVwiLCB7IHBhZ2luYXRlZDogZmFsc2UgfSk7XG4gICAgICAgIGNhc2UgXCJCVUxLX0dSRUVOSE9VU0VfU0NSQVBFX1BBR0lOQVRFRFwiOlxuICAgICAgICAgICAgcmV0dXJuIHJ1bkJ1bGtTb3VyY2VTY3JhcGUoXCJncmVlbmhvdXNlXCIsIHtcbiAgICAgICAgICAgICAgICBwYWdpbmF0ZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgLi4ubWVzc2FnZS5wYXlsb2FkLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIGNhc2UgXCJCVUxLX0xFVkVSX0dFVF9QQUdFX1NUQVRFXCI6XG4gICAgICAgICAgICByZXR1cm4gZ2V0QnVsa1NvdXJjZVBhZ2VTdGF0ZShcImxldmVyXCIpO1xuICAgICAgICBjYXNlIFwiQlVMS19MRVZFUl9TQ1JBUEVfVklTSUJMRVwiOlxuICAgICAgICAgICAgcmV0dXJuIHJ1bkJ1bGtTb3VyY2VTY3JhcGUoXCJsZXZlclwiLCB7IHBhZ2luYXRlZDogZmFsc2UgfSk7XG4gICAgICAgIGNhc2UgXCJCVUxLX0xFVkVSX1NDUkFQRV9QQUdJTkFURURcIjpcbiAgICAgICAgICAgIHJldHVybiBydW5CdWxrU291cmNlU2NyYXBlKFwibGV2ZXJcIiwge1xuICAgICAgICAgICAgICAgIHBhZ2luYXRlZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAuLi5tZXNzYWdlLnBheWxvYWQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgY2FzZSBcIkJVTEtfV09SS0RBWV9HRVRfUEFHRV9TVEFURVwiOlxuICAgICAgICAgICAgcmV0dXJuIGdldEJ1bGtTb3VyY2VQYWdlU3RhdGUoXCJ3b3JrZGF5XCIpO1xuICAgICAgICBjYXNlIFwiQlVMS19XT1JLREFZX1NDUkFQRV9WSVNJQkxFXCI6XG4gICAgICAgICAgICByZXR1cm4gcnVuQnVsa1NvdXJjZVNjcmFwZShcIndvcmtkYXlcIiwgeyBwYWdpbmF0ZWQ6IGZhbHNlIH0pO1xuICAgICAgICBjYXNlIFwiQlVMS19XT1JLREFZX1NDUkFQRV9QQUdJTkFURURcIjpcbiAgICAgICAgICAgIHJldHVybiBydW5CdWxrU291cmNlU2NyYXBlKFwid29ya2RheVwiLCB7XG4gICAgICAgICAgICAgICAgcGFnaW5hdGVkOiB0cnVlLFxuICAgICAgICAgICAgICAgIC4uLm1lc3NhZ2UucGF5bG9hZCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICBjYXNlIFwiTVVMVElTVEVQX1NURVBfVFJBTlNJVElPTlwiOlxuICAgICAgICAgICAgLy8gUDMgLyAjMzYgIzM3IOKAlCBiYWNrZ3JvdW5kJ3Mgd2ViTmF2aWdhdGlvbiBsaXN0ZW5lciBzYXcgYSBzdGVwXG4gICAgICAgICAgICAvLyB0cmFuc2l0aW9uIGZvciB0aGlzIHRhYi4gVGhlIGNvbnRyb2xsZXIgZGlzcGF0Y2hlcyB0byB0aGUgYWN0aXZlXG4gICAgICAgICAgICAvLyBwcm92aWRlciBoYW5kbGVyIChXb3JrZGF5IC8gR3JlZW5ob3VzZSksIHdoaWNoIHJlLWZpbGxzIHRoZSBuZXcgRE9NLlxuICAgICAgICAgICAgYXdhaXQgbXVsdGlzdGVwQ29udHJvbGxlci5vbldlYk5hdmlnYXRpb25UcmFuc2l0aW9uKCk7XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH07XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBVbmtub3duIG1lc3NhZ2UgdHlwZTogJHttZXNzYWdlLnR5cGV9YCB9O1xuICAgIH1cbn1cbmFzeW5jIGZ1bmN0aW9uIGdldFN1cmZhY2VDb250ZXh0KCkge1xuICAgIGlmICghc2NyYXBlZEpvYikge1xuICAgICAgICBhd2FpdCByZWZyZXNoU2NyYXBlZEpvYigpO1xuICAgICAgICB2b2lkIHVwZGF0ZVNpZGViYXIoKTtcbiAgICB9XG4gICAgY29uc3Qgc2lkZWJhciA9IHNpZGViYXJDb250cm9sbGVyLmdldFN0YXR1cygpO1xuICAgIHJldHVybiB7XG4gICAgICAgIHRhYjoge1xuICAgICAgICAgICAgdXJsOiB3aW5kb3cubG9jYXRpb24uaHJlZixcbiAgICAgICAgICAgIGhvc3Q6IHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSxcbiAgICAgICAgICAgIHN1cHBvcnRlZDogdHJ1ZSxcbiAgICAgICAgICAgIGNvbnRlbnRTY3JpcHRSZWFkeTogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgICAgcGFnZToge1xuICAgICAgICAgICAgaGFzQXBwbGljYXRpb25Gb3JtOiBkZXRlY3RlZEZpZWxkcy5sZW5ndGggPiAwLFxuICAgICAgICAgICAgZGV0ZWN0ZWRGaWVsZENvdW50OiBkZXRlY3RlZEZpZWxkcy5sZW5ndGgsXG4gICAgICAgICAgICBqb2I6IHNjcmFwZWRKb2IsXG4gICAgICAgIH0sXG4gICAgICAgIHdvcmtzcGFjZTogc2lkZWJhcixcbiAgICB9O1xufVxuZnVuY3Rpb24gaXNXYXRlcmxvb1dvcmtzKCkge1xuICAgIHJldHVybiAvd2F0ZXJsb293b3Jrc1xcLnV3YXRlcmxvb1xcLmNhLy50ZXN0KHdpbmRvdy5sb2NhdGlvbi5ocmVmKTtcbn1cbmZ1bmN0aW9uIGdldFd3UGFnZVN0YXRlKCkge1xuICAgIGlmICghaXNXYXRlcmxvb1dvcmtzKCkpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICBkYXRhOiB7IGtpbmQ6IFwib3RoZXJcIiwgcm93Q291bnQ6IDAsIGhhc05leHRQYWdlOiBmYWxzZSB9LFxuICAgICAgICB9O1xuICAgIH1cbiAgICBjb25zdCByb3dzID0gZ2V0V2F0ZXJsb29Xb3Jrc1Jvd3MoKTtcbiAgICBjb25zdCBuZXh0QnRuID0gZ2V0V2F0ZXJsb29Xb3Jrc05leHRQYWdlTGluaygpO1xuICAgIGNvbnN0IGN1cnJlbnRQYWdlID0gZG9jdW1lbnRcbiAgICAgICAgLnF1ZXJ5U2VsZWN0b3IoXCJhLnBhZ2luYXRpb25fX2xpbmsuYWN0aXZlXCIpXG4gICAgICAgID8udGV4dENvbnRlbnQ/LnRyaW0oKTtcbiAgICBjb25zdCBoYXNEZXRhaWwgPSAhIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZGFzaGJvYXJkLWhlYWRlcl9fcG9zdGluZy10aXRsZVwiKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICBraW5kOiBoYXNEZXRhaWwgPyBcImRldGFpbFwiIDogcm93cy5sZW5ndGggPiAwID8gXCJsaXN0XCIgOiBcIm90aGVyXCIsXG4gICAgICAgICAgICByb3dDb3VudDogcm93cy5sZW5ndGgsXG4gICAgICAgICAgICBoYXNOZXh0UGFnZTogISFuZXh0QnRuICYmICFuZXh0QnRuLmNsYXNzTGlzdC5jb250YWlucyhcImRpc2FibGVkXCIpLFxuICAgICAgICAgICAgY3VycmVudFBhZ2UsXG4gICAgICAgIH0sXG4gICAgfTtcbn1cbmZ1bmN0aW9uIGdldE9yY2hlc3RyYXRvckZvclNvdXJjZShzb3VyY2UpIHtcbiAgICBzd2l0Y2ggKHNvdXJjZSkge1xuICAgICAgICBjYXNlIFwiZ3JlZW5ob3VzZVwiOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBHcmVlbmhvdXNlT3JjaGVzdHJhdG9yKCk7XG4gICAgICAgIGNhc2UgXCJsZXZlclwiOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBMZXZlck9yY2hlc3RyYXRvcigpO1xuICAgICAgICBjYXNlIFwid29ya2RheVwiOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBXb3JrZGF5T3JjaGVzdHJhdG9yKCk7XG4gICAgfVxufVxuZnVuY3Rpb24gaXNCdWxrU291cmNlSGFuZGxlZChzb3VyY2UsIHVybCkge1xuICAgIHN3aXRjaCAoc291cmNlKSB7XG4gICAgICAgIGNhc2UgXCJncmVlbmhvdXNlXCI6XG4gICAgICAgICAgICByZXR1cm4gR3JlZW5ob3VzZU9yY2hlc3RyYXRvci5jYW5IYW5kbGUodXJsKTtcbiAgICAgICAgY2FzZSBcImxldmVyXCI6XG4gICAgICAgICAgICByZXR1cm4gTGV2ZXJPcmNoZXN0cmF0b3IuY2FuSGFuZGxlKHVybCk7XG4gICAgICAgIGNhc2UgXCJ3b3JrZGF5XCI6XG4gICAgICAgICAgICByZXR1cm4gV29ya2RheU9yY2hlc3RyYXRvci5jYW5IYW5kbGUodXJsKTtcbiAgICB9XG59XG4vKipcbiAqIFNlbGVjdG9ycyB1c2VkIHRvIGNvdW50IHZpc2libGUgcm93cyBmb3IgdGhlIHBvcHVwJ3MgXCJEZXRlY3RlZDogPHNvdXJjZT4g4oCUXG4gKiBOIHJvd3NcIiBiYWRnZS4gRWFjaCBsaXN0IG1pcnJvcnMgdGhlIG9yY2hlc3RyYXRvcidzIHJvdyBzZWxlY3RvcnMgYnV0IHN0YXlzXG4gKiBvdXQtb2YtYmFuZCBzbyB3ZSBjYW4gcHJvYmUgdGhlIHBhZ2UgY2hlYXBseSB3aXRob3V0IGluc3RhbnRpYXRpbmcgdGhlXG4gKiBvcmNoZXN0cmF0b3IganVzdCB0byBjb3VudC5cbiAqL1xuY29uc3QgQlVMS19ST1dfU0VMRUNUT1JTID0ge1xuICAgIGdyZWVuaG91c2U6IFtcbiAgICAgICAgXCJkaXYub3BlbmluZ1wiLFxuICAgICAgICBcIi5qb2ItcG9zdFwiLFxuICAgICAgICAnW2RhdGEtbWFwcGVkPVwidHJ1ZVwiXScsXG4gICAgICAgIFwic2VjdGlvbi5sZXZlbC0wIGRpdi5vcGVuaW5nXCIsXG4gICAgXSxcbiAgICBsZXZlcjogW1wiLnBvc3RpbmdcIiwgJ1tkYXRhLXFhPVwicG9zdGluZy1uYW1lXCJdJ10sXG4gICAgd29ya2RheTogW1xuICAgICAgICAnW2RhdGEtYXV0b21hdGlvbi1pZD1cImpvYlJlc3VsdHNcIl0gbGknLFxuICAgICAgICAnW2RhdGEtYXV0b21hdGlvbi1pZD1cImpvYlJlc3VsdHNcIl0gW3JvbGU9XCJsaXN0aXRlbVwiXScsXG4gICAgICAgICd1bFtyb2xlPVwibGlzdFwiXSBsaVtkYXRhLWF1dG9tYXRpb24taWQqPVwiam9iXCJdJyxcbiAgICAgICAgXCJsaS5jc3MtMXEyZHJhM1wiLFxuICAgIF0sXG59O1xuY29uc3QgQlVMS19ORVhUX1NFTEVDVE9SUyA9IHtcbiAgICBncmVlbmhvdXNlOiBbXG4gICAgICAgICdhW3JlbD1cIm5leHRcIl0nLFxuICAgICAgICAnYVthcmlhLWxhYmVsPVwiTmV4dCBwYWdlXCIgaV0nLFxuICAgICAgICAnYnV0dG9uW2FyaWEtbGFiZWw9XCJOZXh0XCIgaV0nLFxuICAgICAgICBcIi5wYWdpbmF0aW9uIC5uZXh0IGFcIixcbiAgICBdLFxuICAgIGxldmVyOiBbXG4gICAgICAgICdhW3JlbD1cIm5leHRcIl0nLFxuICAgICAgICAnYnV0dG9uW2FyaWEtbGFiZWw9XCJOZXh0XCIgaV0nLFxuICAgICAgICAnYnV0dG9uW2FyaWEtbGFiZWw9XCJMb2FkIG1vcmVcIiBpXScsXG4gICAgXSxcbiAgICB3b3JrZGF5OiBbXG4gICAgICAgICdidXR0b25bZGF0YS11eGktZWxlbWVudC1pZD1cIm5leHRcIl0nLFxuICAgICAgICAnbmF2W2FyaWEtbGFiZWw9XCJwYWdpbmF0aW9uXCJdIGJ1dHRvblthcmlhLWxhYmVsKj1cIm5leHRcIiBpXScsXG4gICAgICAgICdidXR0b25bYXJpYS1sYWJlbD1cIm5leHRcIiBpXScsXG4gICAgXSxcbn07XG5mdW5jdGlvbiBjb3VudEJ1bGtSb3dzKHNvdXJjZSkge1xuICAgIGZvciAoY29uc3Qgc2VsZWN0b3Igb2YgQlVMS19ST1dfU0VMRUNUT1JTW3NvdXJjZV0pIHtcbiAgICAgICAgY29uc3QgbWF0Y2hlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICAgICAgICBpZiAobWF0Y2hlcy5sZW5ndGggPiAwKVxuICAgICAgICAgICAgcmV0dXJuIG1hdGNoZXMubGVuZ3RoO1xuICAgIH1cbiAgICByZXR1cm4gMDtcbn1cbmZ1bmN0aW9uIGJ1bGtIYXNOZXh0UGFnZShzb3VyY2UpIHtcbiAgICBmb3IgKGNvbnN0IHNlbGVjdG9yIG9mIEJVTEtfTkVYVF9TRUxFQ1RPUlNbc291cmNlXSkge1xuICAgICAgICBjb25zdCBlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICAgICBpZiAoIWVsKVxuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIGlmIChlbC5oYXNBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiKSB8fFxuICAgICAgICAgICAgZWwuZ2V0QXR0cmlidXRlKFwiYXJpYS1kaXNhYmxlZFwiKSA9PT0gXCJ0cnVlXCIgfHxcbiAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5jb250YWlucyhcImRpc2FibGVkXCIpKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuZnVuY3Rpb24gZ2V0QnVsa1NvdXJjZVBhZ2VTdGF0ZShzb3VyY2UpIHtcbiAgICBjb25zdCB1cmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZjtcbiAgICBpZiAoIWlzQnVsa1NvdXJjZUhhbmRsZWQoc291cmNlLCB1cmwpKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgZGF0YTogeyBkZXRlY3RlZDogZmFsc2UsIHJvd0NvdW50OiAwLCBoYXNOZXh0UGFnZTogZmFsc2UgfSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgY29uc3Qgcm93Q291bnQgPSBjb3VudEJ1bGtSb3dzKHNvdXJjZSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgZGV0ZWN0ZWQ6IHJvd0NvdW50ID4gMCxcbiAgICAgICAgICAgIHJvd0NvdW50LFxuICAgICAgICAgICAgaGFzTmV4dFBhZ2U6IGJ1bGtIYXNOZXh0UGFnZShzb3VyY2UpLFxuICAgICAgICB9LFxuICAgIH07XG59XG5hc3luYyBmdW5jdGlvbiBydW5CdWxrU291cmNlU2NyYXBlKHNvdXJjZSwgb3B0cykge1xuICAgIGNvbnN0IHVybCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuICAgIGlmICghaXNCdWxrU291cmNlSGFuZGxlZChzb3VyY2UsIHVybCkpIHtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgTm90IGEgJHtzb3VyY2V9IGxpc3RpbmcgcGFnZWAgfTtcbiAgICB9XG4gICAgY29uc3Qgb3JjaGVzdHJhdG9yID0gZ2V0T3JjaGVzdHJhdG9yRm9yU291cmNlKHNvdXJjZSk7XG4gICAgbGV0IGVycm9ycyA9IFtdO1xuICAgIGxldCBwYWdlcyA9IDE7XG4gICAgY29uc3Qgb25Qcm9ncmVzcyA9IChwKSA9PiB7XG4gICAgICAgIHBhZ2VzID0gcC5jdXJyZW50UGFnZTtcbiAgICAgICAgZXJyb3JzID0gcC5lcnJvcnM7XG4gICAgICAgIC8vIEJlc3QtZWZmb3J0IHByb2dyZXNzIGZhbi1vdXQuIFRoZSBiYWNrZ3JvdW5kIHJvdXRlcyBpdCB0byB0aGUgcG9wdXAuXG4gICAgICAgIHNlbmRNZXNzYWdlKHtcbiAgICAgICAgICAgIHR5cGU6IGBCVUxLXyR7c291cmNlLnRvVXBwZXJDYXNlKCl9X1BST0dSRVNTYCxcbiAgICAgICAgICAgIHBheWxvYWQ6IHAsXG4gICAgICAgIH0pLmNhdGNoKCgpID0+IHVuZGVmaW5lZCk7XG4gICAgfTtcbiAgICBjb25zdCBqb2JzID0gb3B0cy5wYWdpbmF0ZWRcbiAgICAgICAgPyBhd2FpdCBvcmNoZXN0cmF0b3Iuc2NyYXBlQWxsUGFnaW5hdGVkKHtcbiAgICAgICAgICAgIG9uUHJvZ3Jlc3MsXG4gICAgICAgICAgICBtYXhKb2JzOiBvcHRzLm1heEpvYnMsXG4gICAgICAgICAgICBtYXhQYWdlczogb3B0cy5tYXhQYWdlcyxcbiAgICAgICAgfSlcbiAgICAgICAgOiBhd2FpdCBvcmNoZXN0cmF0b3Iuc2NyYXBlQWxsVmlzaWJsZSh7IG9uUHJvZ3Jlc3MgfSk7XG4gICAgaWYgKGpvYnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgZGF0YTogeyBpbXBvcnRlZDogMCwgYXR0ZW1wdGVkOiAwLCBwYWdlcywgZXJyb3JzIH0sXG4gICAgICAgIH07XG4gICAgfVxuICAgIGNvbnN0IGltcG9ydFJlc3AgPSBhd2FpdCBzZW5kTWVzc2FnZShNZXNzYWdlcy5pbXBvcnRKb2JzQmF0Y2goam9icykpO1xuICAgIGlmICghaW1wb3J0UmVzcC5zdWNjZXNzKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgIGVycm9yOiBpbXBvcnRSZXNwLmVycm9yIHx8IFwiQnVsayBpbXBvcnQgZmFpbGVkXCIsXG4gICAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIGltcG9ydGVkOiBpbXBvcnRSZXNwLmRhdGE/LmltcG9ydGVkID8/IGpvYnMubGVuZ3RoLFxuICAgICAgICAgICAgYXR0ZW1wdGVkOiBqb2JzLmxlbmd0aCxcbiAgICAgICAgICAgIHBhZ2VzLFxuICAgICAgICAgICAgZHVwbGljYXRlQ291bnQ6IGltcG9ydFJlc3AuZGF0YT8uZGVkdXBlZElkcz8ubGVuZ3RoID8/XG4gICAgICAgICAgICAgICAgTWF0aC5tYXgoMCwgam9icy5sZW5ndGggLSAoaW1wb3J0UmVzcC5kYXRhPy5pbXBvcnRlZCA/PyBqb2JzLmxlbmd0aCkpLFxuICAgICAgICAgICAgZGVkdXBlZElkczogaW1wb3J0UmVzcC5kYXRhPy5kZWR1cGVkSWRzLFxuICAgICAgICAgICAgZXJyb3JzLFxuICAgICAgICB9LFxuICAgIH07XG59XG5hc3luYyBmdW5jdGlvbiBydW5Xd0J1bGtTY3JhcGUob3B0cykge1xuICAgIGlmICghaXNXYXRlcmxvb1dvcmtzKCkpIHtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBcIk5vdCBhIFdhdGVybG9vV29ya3MgcGFnZVwiIH07XG4gICAgfVxuICAgIGNvbnN0IG9yY2hlc3RyYXRvciA9IG5ldyBXYXRlcmxvb1dvcmtzT3JjaGVzdHJhdG9yKCk7XG4gICAgbGV0IGVycm9ycyA9IFtdO1xuICAgIGxldCBwYWdlcyA9IDE7XG4gICAgY29uc3Qgb25Qcm9ncmVzcyA9IChwKSA9PiB7XG4gICAgICAgIHBhZ2VzID0gcC5jdXJyZW50UGFnZTtcbiAgICAgICAgZXJyb3JzID0gcC5lcnJvcnM7XG4gICAgICAgIC8vIEZpcmUtYW5kLWZvcmdldCBwcm9ncmVzcyBldmVudCB0byB0aGUgYmFja2dyb3VuZCwgd2hpY2ggY2FuIGZhbiBpdCBvdXRcbiAgICAgICAgLy8gdG8gdGhlIHBvcHVwIGlmIG9wZW4uXG4gICAgICAgIHNlbmRNZXNzYWdlKHtcbiAgICAgICAgICAgIHR5cGU6IFwiV1dfQlVMS19QUk9HUkVTU1wiLFxuICAgICAgICAgICAgcGF5bG9hZDogcCxcbiAgICAgICAgfSkuY2F0Y2goKCkgPT4gdW5kZWZpbmVkKTtcbiAgICB9O1xuICAgIGNvbnN0IGpvYnMgPSBvcHRzLnBhZ2luYXRlZFxuICAgICAgICA/IGF3YWl0IG9yY2hlc3RyYXRvci5zY3JhcGVBbGxQYWdpbmF0ZWQoe1xuICAgICAgICAgICAgb25Qcm9ncmVzcyxcbiAgICAgICAgICAgIG1heEpvYnM6IG9wdHMubWF4Sm9icyxcbiAgICAgICAgICAgIG1heFBhZ2VzOiBvcHRzLm1heFBhZ2VzLFxuICAgICAgICB9KVxuICAgICAgICA6IGF3YWl0IG9yY2hlc3RyYXRvci5zY3JhcGVBbGxWaXNpYmxlKHsgb25Qcm9ncmVzcyB9KTtcbiAgICBpZiAoam9icy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICBkYXRhOiB7IGltcG9ydGVkOiAwLCBhdHRlbXB0ZWQ6IDAsIHBhZ2VzLCBlcnJvcnMgfSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgLy8gSGFuZCBvZmYgdG8gYmFja2dyb3VuZCB0byBidWxrLWltcG9ydCB0byBTbG90aGluZy5cbiAgICBjb25zdCBpbXBvcnRSZXNwID0gYXdhaXQgc2VuZE1lc3NhZ2UoTWVzc2FnZXMuaW1wb3J0Sm9ic0JhdGNoKGpvYnMpKTtcbiAgICBpZiAoIWltcG9ydFJlc3Auc3VjY2Vzcykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICBlcnJvcjogaW1wb3J0UmVzcC5lcnJvciB8fCBcIkJ1bGsgaW1wb3J0IGZhaWxlZFwiLFxuICAgICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICBpbXBvcnRlZDogaW1wb3J0UmVzcC5kYXRhPy5pbXBvcnRlZCA/PyBqb2JzLmxlbmd0aCxcbiAgICAgICAgICAgIGF0dGVtcHRlZDogam9icy5sZW5ndGgsXG4gICAgICAgICAgICBwYWdlcyxcbiAgICAgICAgICAgIGR1cGxpY2F0ZUNvdW50OiBpbXBvcnRSZXNwLmRhdGE/LmRlZHVwZWRJZHM/Lmxlbmd0aCA/P1xuICAgICAgICAgICAgICAgIE1hdGgubWF4KDAsIGpvYnMubGVuZ3RoIC0gKGltcG9ydFJlc3AuZGF0YT8uaW1wb3J0ZWQgPz8gam9icy5sZW5ndGgpKSxcbiAgICAgICAgICAgIGRlZHVwZWRJZHM6IGltcG9ydFJlc3AuZGF0YT8uZGVkdXBlZElkcyxcbiAgICAgICAgICAgIGVycm9ycyxcbiAgICAgICAgfSxcbiAgICB9O1xufVxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlRmlsbEZvcm0oKSB7XG4gICAgaWYgKGRldGVjdGVkRmllbGRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IFwiTm8gZmllbGRzIGRldGVjdGVkXCIgfTtcbiAgICB9XG4gICAgLy8gR2V0IHByb2ZpbGUgaWYgbm90IGNhY2hlZFxuICAgIGlmICghY2FjaGVkUHJvZmlsZSkge1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHNlbmRNZXNzYWdlKE1lc3NhZ2VzLmdldFByb2ZpbGUoKSk7XG4gICAgICAgIGlmICghcmVzcG9uc2Uuc3VjY2VzcyB8fCAhcmVzcG9uc2UuZGF0YSkge1xuICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBcIkZhaWxlZCB0byBsb2FkIHByb2ZpbGVcIiB9O1xuICAgICAgICB9XG4gICAgICAgIGNhY2hlZFByb2ZpbGUgPSByZXNwb25zZS5kYXRhO1xuICAgIH1cbiAgICAvLyBDcmVhdGUgbWFwcGVyIGFuZCBlbmdpbmVcbiAgICBjb25zdCBtYXBwZXIgPSBuZXcgRmllbGRNYXBwZXIoY2FjaGVkUHJvZmlsZSk7XG4gICAgYXV0b0ZpbGxFbmdpbmUgPSBuZXcgQXV0b0ZpbGxFbmdpbmUoZmllbGREZXRlY3RvciwgbWFwcGVyKTtcbiAgICAvLyBSZWFkIHRoZSBjb2xkLXpvbmUgZmxvb3IgZnJvbSBzZXR0aW5ncy4gRGVmYXVsdHMgdG8gdGhlIGxlZ2FjeSAwLjUgaWZcbiAgICAvLyBzZXR0aW5ncyBhcmVuJ3QgYXZhaWxhYmxlIChlLmcuIHRyYW5zaWVudCBiYWNrZ3JvdW5kLXN0b3JhZ2UgZmFpbHVyZSkuXG4gICAgbGV0IG1pbmltdW1Db25maWRlbmNlID0gMC41O1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHNldHRpbmdzID0gYXdhaXQgZ2V0RXh0ZW5zaW9uU2V0dGluZ3MoKTtcbiAgICAgICAgbWluaW11bUNvbmZpZGVuY2UgPSBzZXR0aW5ncy5taW5pbXVtQ29uZmlkZW5jZTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zb2xlLndhcm4oXCJbU2xvdGhpbmddIEZhaWxlZCB0byBsb2FkIHNldHRpbmdzOyB1c2luZyBkZWZhdWx0IDAuNVwiLCBlcnIpO1xuICAgIH1cbiAgICAvLyBGaWxsIHRoZSBmb3JtLiBIYW5kIGVhY2ggc3VjY2Vzc2Z1bCBmaWxsIHRvIHRoZSBjb3JyZWN0aW9ucyB0cmFja2VyIHNvXG4gICAgLy8gZWRpdHMtYWZ0ZXItZmlsbCBmbG93IGJhY2sgaW50byB0aGUgcGVyLWRvbWFpbiBmaWVsZCBtYXBwaW5nICgjMzMpLlxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGF1dG9GaWxsRW5naW5lLmZpbGxGb3JtKGRldGVjdGVkRmllbGRzLCB7XG4gICAgICAgIG1pbmltdW1Db25maWRlbmNlLFxuICAgICAgICBvbkZpbGxlZDogKHsgZmllbGQsIHZhbHVlIH0pID0+IHtcbiAgICAgICAgICAgIGNvcnJlY3Rpb25zVHJhY2tlci50cmFjayhmaWVsZCwgdmFsdWUpO1xuICAgICAgICB9LFxuICAgIH0pO1xuICAgIGlmIChyZXN1bHQuZmlsbGVkID49IDIpIHtcbiAgICAgICAgZm9yIChjb25zdCBmb3JtIG9mIG5ldyBTZXQoZGV0ZWN0ZWRGaWVsZHNcbiAgICAgICAgICAgIC5tYXAoKGZpZWxkKSA9PiBmaWVsZC5lbGVtZW50LmNsb3Nlc3QoXCJmb3JtXCIpKVxuICAgICAgICAgICAgLmZpbHRlcigoZm9ybSkgPT4gZm9ybSBpbnN0YW5jZW9mIEhUTUxGb3JtRWxlbWVudCkpKSB7XG4gICAgICAgICAgICBhdXRvZmlsbGVkRm9ybXMuYWRkKGZvcm0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHJlc3VsdCB9O1xufVxuLy8gT3BlbnMgdGhlIHdlYiBhbnN3ZXItYmFuayBwYWdlIGluIGEgbmV3IHRhYiwgcHJlLXNlZWRlZCB3aXRoIHRoZSBxdWVzdGlvblxuLy8gbGFiZWwuIFVzZWQgYnkgdGhlIFwiR2VuZXJhdGUgbmV3XCIgYnV0dG9uIGluIHRoZSBpbmxpbmUgcG9wb3Zlci4gVGhlXG4vLyBiYWNrZ3JvdW5kIHJldHVybnMgdGhlIGNvbmZpZ3VyZWQgU2xvdGhpbmcgQVBJIGJhc2UgVVJMIGFsb25nc2lkZSB0aGUgYXV0aFxuLy8gc3RhdHVzLCB3aGljaCBpcyB0aGUgc2FtZSBob3N0IHRoZSB1c2VyJ3MgbG9nZ2VkLWluIGFuc3dlciBiYW5rIGxpdmVzIG9uLlxuYXN5bmMgZnVuY3Rpb24gb3BlbkFuc3dlckJhbmtTZWVkKHF1ZXN0aW9uKSB7XG4gICAgY29uc3QgYXV0aCA9IGF3YWl0IHNlbmRNZXNzYWdlKE1lc3NhZ2VzLmdldEF1dGhTdGF0dXMoKSk7XG4gICAgY29uc3QgYmFzZSA9IChhdXRoLnN1Y2Nlc3MgJiYgYXV0aC5kYXRhPy5hcGlCYXNlVXJsKSB8fCBERUZBVUxUX0FQSV9CQVNFX1VSTDtcbiAgICBjb25zdCB1cmwgPSBgJHtiYXNlLnJlcGxhY2UoL1xcLyQvLCBcIlwiKX0vZW4vYmFuaz9zZWVkPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHF1ZXN0aW9uKX1gO1xuICAgIHdpbmRvdy5vcGVuKHVybCwgXCJfYmxhbmtcIiwgXCJub29wZW5lcixub3JlZmVycmVyXCIpO1xufVxuLy8gUDIvIzM1IOKAlCBzY2FuIHRleHRhcmVhcyArIGRlY29yYXRlIG1hdGNoZXMgd2l0aCB0aGUgZmxvYXRpbmcg8J+SoSBwb3BvdmVyLlxuLy8gSWRlbXBvdGVudDogdGhlIGRlY29yYXRvciBtYXJrcyBlYWNoIHRleHRhcmVhIHNvIHJlLXNjYW5zIGRvbid0IGRvdWJsZS1tb3VudC5cbmZ1bmN0aW9uIHNjYW5Gb3JBbnN3ZXJCYW5rVGV4dGFyZWFzKCkge1xuICAgIC8vIHF1ZXJ5U2VsZWN0b3JBbGwgYWNyb3NzIHRoZSB3aG9sZSBkb2N1bWVudC4gV29ya2RheS9HcmVlbmhvdXNlIGVzc2F5XG4gICAgLy8gZmllbGRzIGRvbid0IGFsd2F5cyBsaXZlIGluc2lkZSBhIDxmb3JtPiwgc28gd2UgZG9uJ3Qgc2NvcGUgdGhpcyB0byBmb3Jtcy5cbiAgICBjb25zdCB0ZXh0YXJlYXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwidGV4dGFyZWFcIik7XG4gICAgZm9yIChjb25zdCB0ZXh0YXJlYSBvZiB0ZXh0YXJlYXMpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICghc2hvdWxkRGVjb3JhdGVUZXh0YXJlYSh0ZXh0YXJlYSkpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICBtb3VudEFuc3dlckJhbmtCdXR0b24odGV4dGFyZWEsIHtcbiAgICAgICAgICAgICAgICBvbk1hdGNoOiBhc3luYyAocSwgbGltaXQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBzZW5kTWVzc2FnZShNZXNzYWdlcy5tYXRjaEFuc3dlckJhbmsoeyBxLCBsaW1pdDogbGltaXQgPz8gMyB9KSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghcmVzcG9uc2Uuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHJlc3BvbnNlLmVycm9yIHx8IFwiQ291bGRuJ3QgcmVhY2ggdGhlIFNsb3RoaW5nIGFuc3dlciBiYW5rLlwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YSB8fCBbXTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9uUGljazogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBUaGUgZGVjb3JhdG9yIGhhbmRsZXMgdGhlIERPTSBpbnNlcnRpb24gKHZhbHVlICsgaW5wdXQvY2hhbmdlXG4gICAgICAgICAgICAgICAgICAgIC8vIGV2ZW50cykuIE5vdGhpbmcgZWxzZSB0byBkbyBoZXJlIOKAlCBrZXB0IGFzIGEgaG9vayBmb3IgZnV0dXJlXG4gICAgICAgICAgICAgICAgICAgIC8vIGFuYWx5dGljcyAvIGNvcnJlY3Rpb25zICgjMzMpLlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25HZW5lcmF0ZTogKHEpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVjE6IGFzayB0aGUgYmFja2dyb3VuZCB0byBvcGVuIHRoZSB3ZWIgYW5zd2VyLWJhbmsgcGFnZSB3aXRoIHRoZVxuICAgICAgICAgICAgICAgICAgICAvLyBxdWVzdGlvbiBwcmUtc2VlZGVkLiBBIHN0cmVhbWVkIGdlbmVyYXRpb24gZW5kcG9pbnQgaXMgZGVmZXJyZWRcbiAgICAgICAgICAgICAgICAgICAgLy8gdG8gYSBmb2xsb3ctdXAgKGNhbGxlZCBvdXQgaW4gdGhlIFBSIGJvZHkpLlxuICAgICAgICAgICAgICAgICAgICBvcGVuQW5zd2VyQmFua1NlZWQocSkuY2F0Y2goKGVycikgPT4gY29uc29sZS53YXJuKFwiW1Nsb3RoaW5nXSBvcGVuIGJhbmsgZmFpbGVkOlwiLCBlcnIpKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgLy8gQSBzaW5nbGUgdGV4dGFyZWEgZmFpbHVyZSBzaG91bGRuJ3QgYWJvcnQgdGhlIHNjYW4uXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCJbU2xvdGhpbmddIGFuc3dlci1iYW5rIGRlY29yYXRlIGZhaWxlZDpcIiwgZXJyKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmFzeW5jIGZ1bmN0aW9uIGdldEV4dGVuc2lvblNldHRpbmdzKCkge1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgc2VuZE1lc3NhZ2UoTWVzc2FnZXMuZ2V0U2V0dGluZ3MoKSk7XG4gICAgaWYgKCFyZXNwb25zZS5zdWNjZXNzIHx8ICFyZXNwb25zZS5kYXRhKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihyZXNwb25zZS5lcnJvciB8fCBcIkZhaWxlZCB0byBsb2FkIGV4dGVuc2lvbiBzZXR0aW5nc1wiKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG59XG5hc3luYyBmdW5jdGlvbiB1cGRhdGVTaWRlYmFyKCkge1xuICAgIGNvbnN0IHByb2ZpbGUgPSBhd2FpdCBsb2FkUHJvZmlsZUZvclNpZGViYXIoKTtcbiAgICBhd2FpdCBzaWRlYmFyQ29udHJvbGxlci51cGRhdGUoe1xuICAgICAgICBzY3JhcGVkSm9iLFxuICAgICAgICBkZXRlY3RlZEZpZWxkQ291bnQ6IGRldGVjdGVkRmllbGRzLmxlbmd0aCxcbiAgICAgICAgcHJvZmlsZSxcbiAgICAgICAgb25UYWlsb3I6IGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGlmICghc2NyYXBlZEpvYilcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBqb2IgZGV0ZWN0ZWRcIik7XG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHNlbmRNZXNzYWdlKE1lc3NhZ2VzLnRhaWxvckZyb21QYWdlKHNjcmFwZWRKb2IpKTtcbiAgICAgICAgICAgIGlmICghcmVzcG9uc2Uuc3VjY2VzcyB8fCAhcmVzcG9uc2UuZGF0YT8udXJsKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHJlc3BvbnNlLmVycm9yIHx8IFwiRmFpbGVkIHRvIHRhaWxvciByZXN1bWVcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB3aW5kb3cub3BlbihyZXNwb25zZS5kYXRhLnVybCwgXCJfYmxhbmtcIiwgXCJub29wZW5lcixub3JlZmVycmVyXCIpO1xuICAgICAgICB9LFxuICAgICAgICBvbkNvdmVyTGV0dGVyOiBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXNjcmFwZWRKb2IpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gam9iIGRldGVjdGVkXCIpO1xuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBzZW5kTWVzc2FnZShNZXNzYWdlcy5nZW5lcmF0ZUNvdmVyTGV0dGVyRnJvbVBhZ2Uoc2NyYXBlZEpvYikpO1xuICAgICAgICAgICAgaWYgKCFyZXNwb25zZS5zdWNjZXNzIHx8ICFyZXNwb25zZS5kYXRhPy51cmwpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IocmVzcG9uc2UuZXJyb3IgfHwgXCJGYWlsZWQgdG8gZ2VuZXJhdGUgY292ZXIgbGV0dGVyXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgd2luZG93Lm9wZW4ocmVzcG9uc2UuZGF0YS51cmwsIFwiX2JsYW5rXCIsIFwibm9vcGVuZXIsbm9yZWZlcnJlclwiKTtcbiAgICAgICAgfSxcbiAgICAgICAgb25TYXZlOiBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXNjcmFwZWRKb2IpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gam9iIGRldGVjdGVkXCIpO1xuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBzZW5kTWVzc2FnZShNZXNzYWdlcy5pbXBvcnRKb2Ioc2NyYXBlZEpvYikpO1xuICAgICAgICAgICAgaWYgKCFyZXNwb25zZS5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHJlc3BvbnNlLmVycm9yIHx8IFwiRmFpbGVkIHRvIHNhdmUgam9iXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBvbkF1dG9GaWxsOiBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAvLyBQMyAvICMzNiAjMzcg4oCUIFdvcmtkYXkgLyBHcmVlbmhvdXNlIGdldCB0aGUgbXVsdGktc3RlcCBwaXBlbGluZSBzb1xuICAgICAgICAgICAgLy8gc3Vic2VxdWVudCBzdGVwcyBpbiB0aGUgYXBwbGljYXRpb24gYXJlIGZpbGxlZCBhdXRvbWF0aWNhbGx5LiBPdGhlclxuICAgICAgICAgICAgLy8gc2l0ZXMgZmFsbCB0aHJvdWdoIHRvIHRoZSBzaW5nbGUtcGFnZSBgaGFuZGxlRmlsbEZvcm1gIHBhdGguXG4gICAgICAgICAgICBjb25zdCBwcm92aWRlciA9IG11bHRpc3RlcENvbnRyb2xsZXIuaW5pdCgpO1xuICAgICAgICAgICAgaWYgKHByb3ZpZGVyKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgb2sgPSBhd2FpdCBtdWx0aXN0ZXBDb250cm9sbGVyLmNvbmZpcm0oKTtcbiAgICAgICAgICAgICAgICBpZiAoIW9rKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFRoZSBjb250cm9sbGVyJ3MgY29uZmlybSgpIHJldHVybnMgZmFsc2Ugd2hlbiB0aGVyZSB3ZXJlIG5vXG4gICAgICAgICAgICAgICAgICAgIC8vIGZpbGxhYmxlIGZpZWxkcyBkZXRlY3RlZCBvbiB0aGUgY3VycmVudCBwYWdlLiBGYWxsIGJhY2sgdG8gdGhlXG4gICAgICAgICAgICAgICAgICAgIC8vIHNpbmdsZS1wYWdlIHBhdGggc28gdXNlcnMgc3RpbGwgZ2V0IGEgbWVhbmluZ2Z1bCBlcnJvci5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBoYW5kbGVGaWxsRm9ybSgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXJlc3BvbnNlLnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihyZXNwb25zZS5lcnJvciB8fCBcIkZhaWxlZCB0byBhdXRvLWZpbGwgZm9ybVwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGhhbmRsZUZpbGxGb3JtKCk7XG4gICAgICAgICAgICBpZiAoIXJlc3BvbnNlLnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IocmVzcG9uc2UuZXJyb3IgfHwgXCJGYWlsZWQgdG8gYXV0by1maWxsIGZvcm1cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIG9uU2VhcmNoQW5zd2VyczogYXN5bmMgKHF1ZXJ5KSA9PiB7XG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHNlbmRNZXNzYWdlKE1lc3NhZ2VzLnNlYXJjaEFuc3dlcnMocXVlcnkpKTtcbiAgICAgICAgICAgIGlmICghcmVzcG9uc2Uuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihyZXNwb25zZS5lcnJvciB8fCBcIkFuc3dlciBzZWFyY2ggZmFpbGVkXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEgfHwgW107XG4gICAgICAgIH0sXG4gICAgICAgIG9uQXBwbHlBbnN3ZXI6IChhbnN3ZXIpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFjdGl2ZSA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG4gICAgICAgICAgICBpZiAoYWN0aXZlIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCB8fFxuICAgICAgICAgICAgICAgIGFjdGl2ZSBpbnN0YW5jZW9mIEhUTUxUZXh0QXJlYUVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBhY3RpdmUudmFsdWUgPSBhbnN3ZXIuYW5zd2VyO1xuICAgICAgICAgICAgICAgIGFjdGl2ZS5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcImlucHV0XCIsIHsgYnViYmxlczogdHJ1ZSB9KSk7XG4gICAgICAgICAgICAgICAgYWN0aXZlLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwiY2hhbmdlXCIsIHsgYnViYmxlczogdHJ1ZSB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIG9uQ2hhdFN0cmVhbTogKHsgcHJvbXB0LCBpbnRlbnQsIG9uVG9rZW4sIHNpZ25hbCB9KSA9PiBzdHJlYW1DaGF0KHsgcHJvbXB0LCBpbnRlbnQsIG9uVG9rZW4sIHNpZ25hbCB9KSxcbiAgICAgICAgb25Vc2VJbkNvdmVyTGV0dGVyOiAoc2VlZFRleHQpID0+IHtcbiAgICAgICAgICAgIHZvaWQgb3BlbkNvdmVyTGV0dGVyU3R1ZGlvKHNlZWRUZXh0KTtcbiAgICAgICAgfSxcbiAgICB9KTtcbn1cbi8qKlxuICogUDQvIzQwIOKAlCBCdWlsZCB0aGUgdHJpbW1lZCBqb2ItY29udGV4dCBwYXlsb2FkIHNlbnQgdG8gdGhlIGJhY2tncm91bmQnc1xuICogY2hhdCBwb3J0LiBXZSBkZWxpYmVyYXRlbHkgZHJvcCBsYXJnZSBmaWVsZHMgbGlrZSBgcmVzcG9uc2liaWxpdGllc2AgYW5kXG4gKiBjYXAgdGhlIGRlc2NyaXB0aW9uIGhlcmUgdG9vIHNvIHdlIGRvbid0IGJsb3cgbWVzc2FnZS1zaXplIGxpbWl0cyBiZWZvcmVcbiAqIHRoZSBTVyBldmVuIHNlZXMgaXQ7IHRoZSBzZXJ2ZXIgY2xhbXBzIGFnYWluIGFzIGEgc2FmZXR5IG5ldC5cbiAqL1xuZnVuY3Rpb24gYnVpbGRDaGF0Sm9iQ29udGV4dCgpIHtcbiAgICBpZiAoIXNjcmFwZWRKb2IpXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgY29uc3QgY29udGV4dCA9IHtcbiAgICAgICAgdGl0bGU6IHNjcmFwZWRKb2IudGl0bGUsXG4gICAgICAgIGNvbXBhbnk6IHNjcmFwZWRKb2IuY29tcGFueSxcbiAgICB9O1xuICAgIGlmIChzY3JhcGVkSm9iLmxvY2F0aW9uKVxuICAgICAgICBjb250ZXh0LmxvY2F0aW9uID0gc2NyYXBlZEpvYi5sb2NhdGlvbjtcbiAgICBpZiAoc2NyYXBlZEpvYi5kZXNjcmlwdGlvbikge1xuICAgICAgICBjb250ZXh0LmRlc2NyaXB0aW9uID0gc2NyYXBlZEpvYi5kZXNjcmlwdGlvbi5zbGljZSgwLCAyNDAwKTtcbiAgICB9XG4gICAgaWYgKHNjcmFwZWRKb2IucmVxdWlyZW1lbnRzPy5sZW5ndGgpIHtcbiAgICAgICAgY29udGV4dC5yZXF1aXJlbWVudHMgPSBzY3JhcGVkSm9iLnJlcXVpcmVtZW50cy5zbGljZSgwLCAxMCk7XG4gICAgfVxuICAgIGlmIChzY3JhcGVkSm9iLnVybClcbiAgICAgICAgY29udGV4dC51cmwgPSBzY3JhcGVkSm9iLnVybDtcbiAgICBpZiAoc2NyYXBlZEpvYi5zb3VyY2VKb2JJZClcbiAgICAgICAgY29udGV4dC5zb3VyY2VKb2JJZCA9IHNjcmFwZWRKb2Iuc291cmNlSm9iSWQ7XG4gICAgcmV0dXJuIGNvbnRleHQ7XG59XG4vKipcbiAqIFA0LyM0MCDigJQgT3BlbiBhIGxvbmctbGl2ZWQgYGNocm9tZS5ydW50aW1lLmNvbm5lY3RgIFBvcnQgdG8gdGhlIGJhY2tncm91bmRcbiAqIHNlcnZpY2Ugd29ya2VyLCBwb3N0IGEgQ0hBVF9TVFJFQU1fU1RBUlQgZnJhbWUsIGFuZCByZXNvbHZlIC8gcmVqZWN0IHRoZVxuICogcmV0dXJuZWQgUHJvbWlzZSBiYXNlZCBvbiB0aGUgdGVybWluYWwgZnJhbWUgdGhlIGJhY2tncm91bmQgc2VuZHMgYmFjay5cbiAqXG4gKiBXZSBjaG9zZSBhIFBvcnQgKHJhdGhlciB0aGFuIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlIHJvdW5kLXRyaXBzKSBiZWNhdXNlOlxuICogICAxLiBUaGUgU1cgY2FuIHN0cmVhbSB0b2tlbnMgYmFjay10by1iYWNrIHdpdGhvdXQgbmVlZGluZyB0aGUgdGFiIGlkLlxuICogICAyLiBFaXRoZXIgc2lkZSBkaXNjb25uZWN0aW5nIGNsZWFubHkgdGVhcnMgZG93biB0aGUgb3RoZXIgaGFsZiDigJQgc28gYW5cbiAqICAgICAgQWJvcnRTaWduYWwgZnJvbSB0aGUgUmVhY3QgVUkgY2FuIGNhbmNlbCB0aGUgdXBzdHJlYW0gTExNIGNhbGwgYnlcbiAqICAgICAgc2ltcGx5IGRpc2Nvbm5lY3RpbmcgdGhlIHBvcnQuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHN0cmVhbUNoYXQocGFyYW1zKSB7XG4gICAgY29uc3Qgc3RhcnRGcmFtZSA9IHtcbiAgICAgICAgdHlwZTogXCJDSEFUX1NUUkVBTV9TVEFSVFwiLFxuICAgICAgICBwcm9tcHQ6IHBhcmFtcy5wcm9tcHQsXG4gICAgICAgIGpvYkNvbnRleHQ6IGJ1aWxkQ2hhdEpvYkNvbnRleHQoKSxcbiAgICB9O1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGxldCBwb3J0O1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcG9ydCA9IGNocm9tZS5ydW50aW1lLmNvbm5lY3QoeyBuYW1lOiBDSEFUX1BPUlRfTkFNRSB9KTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IobWVzc2FnZUZvckVycm9yKGVycm9yKSkpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCBzZXR0bGVkID0gZmFsc2U7XG4gICAgICAgIGNvbnN0IGZpbmlzaCA9IChlcnIpID0+IHtcbiAgICAgICAgICAgIGlmIChzZXR0bGVkKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIHNldHRsZWQgPSB0cnVlO1xuICAgICAgICAgICAgcGFyYW1zLnNpZ25hbC5yZW1vdmVFdmVudExpc3RlbmVyKFwiYWJvcnRcIiwgb25BYm9ydCk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHBvcnQuZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2gge1xuICAgICAgICAgICAgICAgIC8vIEFscmVhZHkgdG9ybiBkb3duLlxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGVycilcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IG9uQWJvcnQgPSAoKSA9PiBmaW5pc2gobmV3IEVycm9yKFwiQ2FuY2VsbGVkXCIpKTtcbiAgICAgICAgcGFyYW1zLnNpZ25hbC5hZGRFdmVudExpc3RlbmVyKFwiYWJvcnRcIiwgb25BYm9ydCk7XG4gICAgICAgIHBvcnQub25NZXNzYWdlLmFkZExpc3RlbmVyKChtZXNzYWdlKSA9PiB7XG4gICAgICAgICAgICBzd2l0Y2ggKG1lc3NhZ2UudHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgXCJDSEFUX1NUUkVBTV9UT0tFTlwiOlxuICAgICAgICAgICAgICAgICAgICBwYXJhbXMub25Ub2tlbihtZXNzYWdlLnRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkNIQVRfU1RSRUFNX0VORFwiOlxuICAgICAgICAgICAgICAgICAgICBmaW5pc2goKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkNIQVRfU1RSRUFNX0VSUk9SXCI6XG4gICAgICAgICAgICAgICAgICAgIGZpbmlzaChuZXcgRXJyb3IobWVzc2FnZS5lcnJvcikpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHBvcnQub25EaXNjb25uZWN0LmFkZExpc3RlbmVyKCgpID0+IHtcbiAgICAgICAgICAgIC8vIEJhY2tncm91bmQtaW5pdGlhdGVkIGRpc2Nvbm5lY3Qgd2l0aCBubyB0ZXJtaW5hbCBmcmFtZSA9IHRyZWF0IGFzIGFcbiAgICAgICAgICAgIC8vIGdlbmVyaWMgZmFpbHVyZSBzbyB0aGUgVUkgc3VyZmFjZXMgYSBzZW5zaWJsZSBtZXNzYWdlLlxuICAgICAgICAgICAgaWYgKCFzZXR0bGVkKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcnVudGltZUVycm9yID0gY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yPy5tZXNzYWdlO1xuICAgICAgICAgICAgICAgIGZpbmlzaChuZXcgRXJyb3IocnVudGltZUVycm9yIHx8IFwiQ2hhdCBzdHJlYW0gY2xvc2VkIHVuZXhwZWN0ZWRseS5cIikpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHBvcnQucG9zdE1lc3NhZ2Uoc3RhcnRGcmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBmaW5pc2gobmV3IEVycm9yKG1lc3NhZ2VGb3JFcnJvcihlcnJvcikpKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuLyoqXG4gKiBQNC8jNDAg4oCUIE9wZW4gYC9zdHVkaW8/bW9kZT1jb3Zlcl9sZXR0ZXImam9iSWQ9Li4uJnNlZWQ9Li4uYCBpbiBhIG5ldyB0YWIsXG4gKiBVUkwtZW5jb2RpbmcgdGhlIHNlZWQgdGV4dCBhbmQgdHJ1bmNhdGluZyB0byBrZWVwIHRoZSBVUkwgc2hvcnQuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIG9wZW5Db3ZlckxldHRlclN0dWRpbyhzZWVkVGV4dCkge1xuICAgIGNvbnN0IGF1dGggPSBhd2FpdCBzZW5kTWVzc2FnZShNZXNzYWdlcy5nZXRBdXRoU3RhdHVzKCkpO1xuICAgIGNvbnN0IGJhc2UgPSAoKGF1dGguc3VjY2VzcyAmJiBhdXRoLmRhdGE/LmFwaUJhc2VVcmwpIHx8XG4gICAgICAgIERFRkFVTFRfQVBJX0JBU0VfVVJMKS5yZXBsYWNlKC9cXC8kLywgXCJcIik7XG4gICAgY29uc3QgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh7XG4gICAgICAgIG1vZGU6IFwiY292ZXJfbGV0dGVyXCIsXG4gICAgICAgIHNlZWQ6IHNlZWRUZXh0LFxuICAgIH0pO1xuICAgIGlmIChzY3JhcGVkSm9iPy5zb3VyY2VKb2JJZCkge1xuICAgICAgICBwYXJhbXMuc2V0KFwiam9iSWRcIiwgc2NyYXBlZEpvYi5zb3VyY2VKb2JJZCk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHNjcmFwZWRKb2I/LnVybCkge1xuICAgICAgICBwYXJhbXMuc2V0KFwiam9iVXJsXCIsIHNjcmFwZWRKb2IudXJsKTtcbiAgICB9XG4gICAgd2luZG93Lm9wZW4oYCR7YmFzZX0vc3R1ZGlvPyR7cGFyYW1zLnRvU3RyaW5nKCl9YCwgXCJfYmxhbmtcIiwgXCJub29wZW5lcixub3JlZmVycmVyXCIpO1xufVxuYXN5bmMgZnVuY3Rpb24gbG9hZFByb2ZpbGVGb3JTaWRlYmFyKCkge1xuICAgIGlmIChjYWNoZWRQcm9maWxlKVxuICAgICAgICByZXR1cm4gY2FjaGVkUHJvZmlsZTtcbiAgICBpZiAoIXByb2ZpbGVMb2FkUHJvbWlzZSkge1xuICAgICAgICBwcm9maWxlTG9hZFByb21pc2UgPSBzZW5kTWVzc2FnZShNZXNzYWdlcy5nZXRQcm9maWxlKCkpXG4gICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdWNjZXNzICYmIHJlc3BvbnNlLmRhdGEpIHtcbiAgICAgICAgICAgICAgICBjYWNoZWRQcm9maWxlID0gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKCgpID0+IG51bGwpXG4gICAgICAgICAgICAuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgICBwcm9maWxlTG9hZFByb21pc2UgPSBudWxsO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHByb2ZpbGVMb2FkUHJvbWlzZTtcbn1cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicGFnZWhpZGVcIiwgKCkgPT4ge1xuICAgIHN1Ym1pdFdhdGNoZXIuZGV0YWNoKCk7XG4gICAgc2lkZWJhckNvbnRyb2xsZXIuZGVzdHJveSgpO1xuICAgIGNvcnJlY3Rpb25zVHJhY2tlci5jbGVhcigpO1xuICAgIC8vIFAyLyMzNSDigJQgdGVhciBkb3duIGV2ZXJ5IG1vdW50ZWQgYW5zd2VyLWJhbmsgZGVjb3JhdGlvbiBzbyB3ZSBkb24ndCBsZWFrXG4gICAgLy8gUmVzaXplT2JzZXJ2ZXJzIG9yIFJlYWN0IHJvb3RzIHdoZW4gdGhlIHBhZ2UgaXMgYmZjYWNoZS1yZXN0b3JlZC5cbiAgICB1bm1vdW50QWxsQW5zd2VyQmFua0J1dHRvbnMoKTtcbiAgICAvLyBQMyAvICMzNiAjMzcg4oCUIGRlc3Ryb3kgdGhlIHBlci1wcm92aWRlciBvYnNlcnZlcnMgKyBkaXNtaXNzIGFueVxuICAgIC8vIGluLWZsaWdodCBmYWxsYmFjayB0b2FzdC5cbiAgICBtdWx0aXN0ZXBDb250cm9sbGVyLmRlc3Ryb3koKTtcbn0pO1xuLy8gVXRpbGl0eTogZGVib3VuY2UgZnVuY3Rpb25cbmZ1bmN0aW9uIGRlYm91bmNlKGZuLCBkZWxheSkge1xuICAgIGxldCB0aW1lb3V0SWQ7XG4gICAgcmV0dXJuICguLi5hcmdzKSA9PiB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgICAgICB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KCgpID0+IGZuKC4uLmFyZ3MpLCBkZWxheSk7XG4gICAgfTtcbn1cbmNvbnNvbGUubG9nKFwiW1Nsb3RoaW5nXSBDb250ZW50IHNjcmlwdCBsb2FkZWRcIik7XG4vLyBQaWNrIHVwIGEgbG9jYWxTdG9yYWdlLXRyYW5zcG9ydGVkIGF1dGggdG9rZW4gZnJvbSB0aGUgU2xvdGhpbmcgY29ubmVjdCBwYWdlLlxuLy8gVXNlZCBvbiBicm93c2VycyB0aGF0IGRvbid0IGhvbm9yIGV4dGVybmFsbHlfY29ubmVjdGFibGUgKEZpcmVmb3ggaW5cbi8vIHBhcnRpY3VsYXIpLiBUaGUgY29ubmVjdCBwYWdlIHdyaXRlcyB0aGUgdG9rZW4gdW5kZXIgdGhpcyBrZXk7IHdlIGZvcndhcmQgaXRcbi8vIHRvIHRoZSBiYWNrZ3JvdW5kLCB3aGljaCBzdG9yZXMgaXQgaW4gY2hyb21lLnN0b3JhZ2UubG9jYWwgYW5kIGNsZWFycyB0aGVcbi8vIGxvY2FsU3RvcmFnZSBlbnRyeS4gUG9sbHMgZm9yIH4zMHMgaW4gY2FzZSB0aGUgc2NyaXB0IHJ1bnMgYmVmb3JlIHRoZSBwYWdlXG4vLyBoYXMgd3JpdHRlbiB0aGUga2V5LlxuY29uc3QgU0xPVEhJTkdfVE9LRU5fS0VZID0gXCJzbG90aGluZ19leHRlbnNpb25fdG9rZW5cIjtcbmxldCBwaWNrdXBJbkZsaWdodCA9IGZhbHNlO1xuZnVuY3Rpb24gcGlja1VwU2xvdGhpbmdUb2tlbigpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCByYXcgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShTTE9USElOR19UT0tFTl9LRVkpO1xuICAgICAgICBpZiAoIXJhdylcbiAgICAgICAgICAgIHJldHVybiBcImVtcHR5XCI7XG4gICAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UocmF3KTtcbiAgICAgICAgaWYgKCFwYXJzZWQ/LnRva2VuIHx8ICFwYXJzZWQ/LmV4cGlyZXNBdCkge1xuICAgICAgICAgICAgLy8gTWFsZm9ybWVkIHBheWxvYWQg4oCUIHB1cmdlIHNvIHdlIHN0b3AgcG9sbGluZy5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oU0xPVEhJTkdfVE9LRU5fS0VZKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIHtcbiAgICAgICAgICAgICAgICAvLyBpZ25vcmVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBcImVtcHR5XCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBpY2t1cEluRmxpZ2h0KVxuICAgICAgICAgICAgcmV0dXJuIFwicGVuZGluZ1wiO1xuICAgICAgICBwaWNrdXBJbkZsaWdodCA9IHRydWU7XG4gICAgICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgICAgIHR5cGU6IFwiQVVUSF9DQUxMQkFDS1wiLFxuICAgICAgICAgICAgdG9rZW46IHBhcnNlZC50b2tlbixcbiAgICAgICAgICAgIGV4cGlyZXNBdDogcGFyc2VkLmV4cGlyZXNBdCxcbiAgICAgICAgICAgIGFwaUJhc2VVcmw6IHBhcnNlZC5hcGlCYXNlVXJsIHx8IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4sXG4gICAgICAgIH0sIChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgcGlja3VwSW5GbGlnaHQgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmIChyZXNwb25zZT8uc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFNMT1RISU5HX1RPS0VOX0tFWSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaWdub3JlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiW1Nsb3RoaW5nXSBwaWNrZWQgdXAgbG9jYWxTdG9yYWdlIHRva2VuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIFwicGVuZGluZ1wiO1xuICAgIH1cbiAgICBjYXRjaCB7XG4gICAgICAgIHJldHVybiBcImVtcHR5XCI7XG4gICAgfVxufVxuaWYgKC8oXnxcXC4pbG9jYWxob3N0KDp8JCl8XjEyN1xcLjBcXC4wXFwuMSg6fCQpfF5cXFs6OjFcXF0oOnwkKS8udGVzdCh3aW5kb3cubG9jYXRpb24uaG9zdCkgfHxcbiAgICAvKF58XFwuKXNsb3RoaW5nXFwud29yayg6fCQpLy50ZXN0KHdpbmRvdy5sb2NhdGlvbi5ob3N0KSkge1xuICAgIC8vIEluaXRpYWwgcHJvYmU6IGlmIHRoZXJlJ3Mgbm90aGluZyB0byBwaWNrIHVwIGFuZCB3ZSdyZSBub3Qgb24gdGhlIGNvbm5lY3RcbiAgICAvLyBwYWdlIGl0c2VsZiwgdGhlcmUncyBubyByZWFzb24gdG8gcG9sbCDigJQgdGhlIHBhZ2UgaGFzbid0IGJlZW4gb3BlbmVkLlxuICAgIC8vIE9uIHRoZSBjb25uZWN0IHBhZ2UgKG9yIGFueXdoZXJlIGVsc2UgaWYgdGhlIHVzZXIgaXMgYWJvdXQgdG8gbGFuZCBvblxuICAgIC8vIC9leHRlbnNpb24vY29ubmVjdCB2aWEgU1BBIG5hdiksIGtlZXAgcG9sbGluZyBmb3IgMzBzLlxuICAgIGNvbnN0IGluaXRpYWwgPSBwaWNrVXBTbG90aGluZ1Rva2VuKCk7XG4gICAgY29uc3Qgb25Db25uZWN0UGF0aCA9IC9cXC9leHRlbnNpb25cXC9jb25uZWN0KFxcYnxcXC8pLy50ZXN0KHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSk7XG4gICAgaWYgKGluaXRpYWwgIT09IFwiZW1wdHlcIiB8fCBvbkNvbm5lY3RQYXRoKSB7XG4gICAgICAgIGxldCBlbGFwc2VkTXMgPSAwO1xuICAgICAgICBjb25zdCBpbnRlcnZhbElkID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgZWxhcHNlZE1zICs9IDUwMDtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHBpY2tVcFNsb3RoaW5nVG9rZW4oKTtcbiAgICAgICAgICAgIGlmICgoIW9uQ29ubmVjdFBhdGggJiZcbiAgICAgICAgICAgICAgICByZXN1bHQgPT09IFwiZW1wdHlcIiAmJlxuICAgICAgICAgICAgICAgICFwaWNrdXBJbkZsaWdodCAmJlxuICAgICAgICAgICAgICAgIGVsYXBzZWRNcyA+IDIwMDApIHx8XG4gICAgICAgICAgICAgICAgZWxhcHNlZE1zID49IDMwMDAwKSB7XG4gICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbElkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgNTAwKTtcbiAgICB9XG59XG4iLCIvKipcbiAqIFVzZXItZmFjaW5nIGVycm9yIHN0cmluZyBtYXBwaW5nIGZvciB0aGUgU2xvdGhpbmcgZXh0ZW5zaW9uLlxuICpcbiAqIFRoZSBwb3B1cCAoYW5kIGFueSBvdGhlciBleHRlbnNpb24gc3VyZmFjZSkgc2hvdWxkIG5ldmVyIHNob3cgcmF3XG4gKiBgXCJSZXF1ZXN0IGZhaWxlZDogNTAzXCJgIC8gYFwiQXV0aGVudGljYXRpb24gZXhwaXJlZFwiYCBzdHJpbmdzLiBXcmFwIGFueVxuICogZXJyb3IgcGF0aCBpbiBgbWVzc2FnZUZvckVycm9yKGVycilgIHRvIGdldCBhbiBFbmdsaXNoIHNlbnRlbmNlIHNhZmVcbiAqIGZvciBlbmQtdXNlcnMuXG4gKlxuICogTWlycm9yIG9mIHRoZSBtZXNzYWdlIHRvbmUgdXNlZCBieSBgYXBwcy93ZWIvLi4uL2V4dGVuc2lvbi9jb25uZWN0L3BhZ2UudHN4YFxuICogYG1lc3NhZ2VGb3JTdGF0dXNgIOKAlCB0aGUgY29ubmVjdCBwYWdlIGtlZXBzIGl0cyBvd24gY29weSBiZWNhdXNlIGl0IHNpdHNcbiAqIGluc2lkZSB0aGUgbmV4dC1pbnRsIHRyZWUgKGRpZmZlcmVudCBwYWNrYWdlIGJvdW5kYXJ5KSwgYnV0IHRoZVxuICogdXNlci12aXNpYmxlIHN0cmluZ3Mgc2hvdWxkIHN0YXkgYWxpZ25lZC4gSWYgeW91IGNoYW5nZSBvbmUsIGNoYW5nZSBib3RoLlxuICpcbiAqIEVuZ2xpc2gtb25seSBieSBkZXNpZ246IHRoZSBleHRlbnNpb24gaXRzZWxmIGRvZXMgbm90IHVzZSBuZXh0LWludGwuXG4gKi9cbi8qKlxuICogTWFwcyBhbiBIVFRQIHN0YXR1cyBjb2RlIHRvIGEgaHVtYW4tZnJpZW5kbHkgbWVzc2FnZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1lc3NhZ2VGb3JTdGF0dXMoc3RhdHVzKSB7XG4gICAgaWYgKHN0YXR1cyA9PT0gNDAxIHx8IHN0YXR1cyA9PT0gNDAzKSB7XG4gICAgICAgIHJldHVybiBcIlNpZ24gaW4gZXhwaXJlZC4gUmVjb25uZWN0IHRoZSBleHRlbnNpb24uXCI7XG4gICAgfVxuICAgIGlmIChzdGF0dXMgPT09IDQyOSkge1xuICAgICAgICByZXR1cm4gXCJXZSdyZSByYXRlLWxpbWl0ZWQuIFRyeSBhZ2FpbiBpbiBhIG1pbnV0ZS5cIjtcbiAgICB9XG4gICAgaWYgKHN0YXR1cyA+PSA1MDApIHtcbiAgICAgICAgcmV0dXJuIFwiU2xvdGhpbmcgc2VydmVycyBhcmUgaGF2aW5nIGEgcHJvYmxlbS5cIjtcbiAgICB9XG4gICAgcmV0dXJuIFwiU29tZXRoaW5nIHdlbnQgd3JvbmcuIFBsZWFzZSB0cnkgYWdhaW4uXCI7XG59XG4vKipcbiAqIEJlc3QtZWZmb3J0IG1hcHBpbmcgb2YgYW4gdW5rbm93biB0aHJvd24gdmFsdWUgdG8gYSBodW1hbi1mcmllbmRseVxuICogbWVzc2FnZS4gUmVjb2duaXNlcyB0aGUgc3BlY2lmaWMgcGhyYXNlcyB0aGUgYXBpLWNsaWVudCB0aHJvd3MgdG9kYXlcbiAqIChgXCJBdXRoZW50aWNhdGlvbiBleHBpcmVkXCJgLCBgXCJOb3QgYXV0aGVudGljYXRlZFwiYCwgYFwiUmVxdWVzdCBmYWlsZWQ6IDxjb2RlPlwiYCxcbiAqIGBcIkZhaWxlZCB0byBmZXRjaFwiYCkgYW5kIGZhbGxzIGJhY2sgdG8gdGhlIG9yaWdpbmFsIG1lc3NhZ2UgZm9yIGFueXRoaW5nXG4gKiBlbHNlIOKAlCB0aGF0J3MgYWxtb3N0IGFsd2F5cyBtb3JlIHVzZWZ1bCB0aGFuIGEgZ2VuZXJpYyBjYXRjaC1hbGwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtZXNzYWdlRm9yRXJyb3IoZXJyKSB7XG4gICAgLy8gR2VuZXJpYyBuZXR3b3JrIGZhaWx1cmUgKGZldGNoIGluIHNlcnZpY2Ugd29ya2VycyB0aHJvd3MgVHlwZUVycm9yIGhlcmUpXG4gICAgaWYgKGVyciBpbnN0YW5jZW9mIFR5cGVFcnJvcikge1xuICAgICAgICByZXR1cm4gXCJOZXR3b3JrIGVycm9yLiBDaGVjayB5b3VyIGNvbm5lY3Rpb24gYW5kIHRyeSBhZ2Fpbi5cIjtcbiAgICB9XG4gICAgY29uc3QgcmF3ID0gZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFwiXCI7XG4gICAgaWYgKCFyYXcpXG4gICAgICAgIHJldHVybiBcIlNvbWV0aGluZyB3ZW50IHdyb25nLiBQbGVhc2UgdHJ5IGFnYWluLlwiO1xuICAgIC8vIEF1dGgtc2hhcGVkIG1lc3NhZ2VzIGZyb20gU2xvdGhpbmdBUElDbGllbnQuXG4gICAgaWYgKHJhdyA9PT0gXCJBdXRoZW50aWNhdGlvbiBleHBpcmVkXCIgfHxcbiAgICAgICAgcmF3ID09PSBcIk5vdCBhdXRoZW50aWNhdGVkXCIgfHxcbiAgICAgICAgL3VuYXV0aG9yL2kudGVzdChyYXcpKSB7XG4gICAgICAgIHJldHVybiBtZXNzYWdlRm9yU3RhdHVzKDQwMSk7XG4gICAgfVxuICAgIC8vIGBSZXF1ZXN0IGZhaWxlZDogNTAzYCDigJQgcmVjb3ZlciB0aGUgc3RhdHVzIGNvZGUuXG4gICAgY29uc3QgbWF0Y2ggPSByYXcubWF0Y2goL1JlcXVlc3QgZmFpbGVkOlxccyooXFxkezN9KS8pO1xuICAgIGlmIChtYXRjaCkge1xuICAgICAgICBjb25zdCBjb2RlID0gTnVtYmVyKG1hdGNoWzFdKTtcbiAgICAgICAgaWYgKE51bWJlci5pc0Zpbml0ZShjb2RlKSlcbiAgICAgICAgICAgIHJldHVybiBtZXNzYWdlRm9yU3RhdHVzKGNvZGUpO1xuICAgIH1cbiAgICAvLyBCcm93c2VyIGZldGNoIGZhaWx1cmVzIGJ1YmJsZSB1cCBhcyBcIkZhaWxlZCB0byBmZXRjaFwiLlxuICAgIGlmICgvZmFpbGVkIHRvIGZldGNoL2kudGVzdChyYXcpIHx8IC9uZXR3b3JrL2kudGVzdChyYXcpKSB7XG4gICAgICAgIHJldHVybiBcIk5ldHdvcmsgZXJyb3IuIENoZWNrIHlvdXIgY29ubmVjdGlvbiBhbmQgdHJ5IGFnYWluLlwiO1xuICAgIH1cbiAgICAvLyBGb3IgYW55dGhpbmcgZWxzZSwgdGhlIHVuZGVybHlpbmcgbWVzc2FnZSBpcyB1c3VhbGx5IGEgc2VudGVuY2UgYWxyZWFkeVxuICAgIC8vIChlLmcuIFwiQ291bGRuJ3QgcmVhZCB0aGUgZnVsbCBqb2IgZGVzY3JpcHRpb24gZnJvbSB0aGlzIHBhZ2UuXCIpLlxuICAgIHJldHVybiByYXc7XG59XG4iLCIvLyBNZXNzYWdlIHBhc3NpbmcgdXRpbGl0aWVzIGZvciBleHRlbnNpb24gY29tbXVuaWNhdGlvblxuLy8gVHlwZS1zYWZlIG1lc3NhZ2UgY3JlYXRvcnNcbmV4cG9ydCBjb25zdCBNZXNzYWdlcyA9IHtcbiAgICAvLyBBdXRoIG1lc3NhZ2VzXG4gICAgZ2V0QXV0aFN0YXR1czogKCkgPT4gKHsgdHlwZTogXCJHRVRfQVVUSF9TVEFUVVNcIiB9KSxcbiAgICBnZXRTdXJmYWNlQ29udGV4dDogKCkgPT4gKHsgdHlwZTogXCJHRVRfU1VSRkFDRV9DT05URVhUXCIgfSksXG4gICAgb3BlbkF1dGg6ICgpID0+ICh7IHR5cGU6IFwiT1BFTl9BVVRIXCIgfSksXG4gICAgbG9nb3V0OiAoKSA9PiAoeyB0eXBlOiBcIkxPR09VVFwiIH0pLFxuICAgIC8vIFByb2ZpbGUgbWVzc2FnZXNcbiAgICBnZXRQcm9maWxlOiAoKSA9PiAoeyB0eXBlOiBcIkdFVF9QUk9GSUxFXCIgfSksXG4gICAgZ2V0U2V0dGluZ3M6ICgpID0+ICh7IHR5cGU6IFwiR0VUX1NFVFRJTkdTXCIgfSksXG4gICAgLy8gRm9ybSBmaWxsaW5nIG1lc3NhZ2VzXG4gICAgZmlsbEZvcm06IChmaWVsZHMpID0+ICh7XG4gICAgICAgIHR5cGU6IFwiRklMTF9GT1JNXCIsXG4gICAgICAgIHBheWxvYWQ6IGZpZWxkcyxcbiAgICB9KSxcbiAgICAvLyBTY3JhcGluZyBtZXNzYWdlc1xuICAgIHNjcmFwZUpvYjogKCkgPT4gKHsgdHlwZTogXCJTQ1JBUEVfSk9CXCIgfSksXG4gICAgc2NyYXBlSm9iTGlzdDogKCkgPT4gKHsgdHlwZTogXCJTQ1JBUEVfSk9CX0xJU1RcIiB9KSxcbiAgICBpbXBvcnRKb2I6IChqb2IpID0+ICh7XG4gICAgICAgIHR5cGU6IFwiSU1QT1JUX0pPQlwiLFxuICAgICAgICBwYXlsb2FkOiBqb2IsXG4gICAgfSksXG4gICAgaW1wb3J0Sm9ic0JhdGNoOiAoam9icykgPT4gKHtcbiAgICAgICAgdHlwZTogXCJJTVBPUlRfSk9CU19CQVRDSFwiLFxuICAgICAgICBwYXlsb2FkOiBqb2JzLFxuICAgIH0pLFxuICAgIHRyYWNrQXBwbGllZDogKHBheWxvYWQpID0+ICh7XG4gICAgICAgIHR5cGU6IFwiVFJBQ0tfQVBQTElFRFwiLFxuICAgICAgICBwYXlsb2FkLFxuICAgIH0pLFxuICAgIG9wZW5EYXNoYm9hcmQ6ICgpID0+ICh7IHR5cGU6IFwiT1BFTl9EQVNIQk9BUkRcIiB9KSxcbiAgICBjYXB0dXJlVmlzaWJsZVRhYjogKCkgPT4gKHsgdHlwZTogXCJDQVBUVVJFX1ZJU0lCTEVfVEFCXCIgfSksXG4gICAgdGFpbG9yRnJvbVBhZ2U6IChqb2IsIGJhc2VSZXN1bWVJZCkgPT4gKHtcbiAgICAgICAgdHlwZTogXCJUQUlMT1JfRlJPTV9QQUdFXCIsXG4gICAgICAgIHBheWxvYWQ6IHsgam9iLCBiYXNlUmVzdW1lSWQgfSxcbiAgICB9KSxcbiAgICBnZW5lcmF0ZUNvdmVyTGV0dGVyRnJvbVBhZ2U6IChqb2IpID0+ICh7XG4gICAgICAgIHR5cGU6IFwiR0VORVJBVEVfQ09WRVJfTEVUVEVSX0ZST01fUEFHRVwiLFxuICAgICAgICBwYXlsb2FkOiBqb2IsXG4gICAgfSksXG4gICAgLyoqICMzNCDigJQgZmV0Y2ggdGhlIHVzZXIncyByZWNlbnRseS1zYXZlZCB0YWlsb3JlZCByZXN1bWVzIGZvciB0aGUgcGlja2VyLiAqL1xuICAgIGxpc3RSZXN1bWVzOiAoKSA9PiAoeyB0eXBlOiBcIkxJU1RfUkVTVU1FU1wiIH0pLFxuICAgIC8vIExlYXJuaW5nIG1lc3NhZ2VzXG4gICAgc2F2ZUFuc3dlcjogKGRhdGEpID0+ICh7XG4gICAgICAgIHR5cGU6IFwiU0FWRV9BTlNXRVJcIixcbiAgICAgICAgcGF5bG9hZDogZGF0YSxcbiAgICB9KSxcbiAgICBzZWFyY2hBbnN3ZXJzOiAocXVlc3Rpb24pID0+ICh7XG4gICAgICAgIHR5cGU6IFwiU0VBUkNIX0FOU1dFUlNcIixcbiAgICAgICAgcGF5bG9hZDogcXVlc3Rpb24sXG4gICAgfSksXG4gICAgbWF0Y2hBbnN3ZXJCYW5rOiAocGF5bG9hZCkgPT4gKHtcbiAgICAgICAgdHlwZTogXCJNQVRDSF9BTlNXRVJfQkFOS1wiLFxuICAgICAgICBwYXlsb2FkLFxuICAgIH0pLFxuICAgIGpvYkRldGVjdGVkOiAobWV0YSkgPT4gKHtcbiAgICAgICAgdHlwZTogXCJKT0JfREVURUNURURcIixcbiAgICAgICAgcGF5bG9hZDogbWV0YSxcbiAgICB9KSxcbiAgICAvLyBXYXRlcmxvb1dvcmtzLXNwZWNpZmljIGJ1bGsgc2NyYXBpbmcgKGRyaXZlbiBmcm9tIHBvcHVwLCBleGVjdXRlZCBpbiBjb250ZW50XG4gICAgLy8gc2NyaXB0IGJ5IHdhdGVybG9vLXdvcmtzLW9yY2hlc3RyYXRvci50cykuXG4gICAgd3dTY3JhcGVBbGxWaXNpYmxlOiAoKSA9PiAoe1xuICAgICAgICB0eXBlOiBcIldXX1NDUkFQRV9BTExfVklTSUJMRVwiLFxuICAgIH0pLFxuICAgIHd3U2NyYXBlQWxsUGFnaW5hdGVkOiAob3B0cykgPT4gKHtcbiAgICAgICAgdHlwZTogXCJXV19TQ1JBUEVfQUxMX1BBR0lOQVRFRFwiLFxuICAgICAgICBwYXlsb2FkOiBvcHRzID8/IHt9LFxuICAgIH0pLFxuICAgIHd3R2V0UGFnZVN0YXRlOiAoKSA9PiAoeyB0eXBlOiBcIldXX0dFVF9QQUdFX1NUQVRFXCIgfSksXG4gICAgLy8gUDMvIzM5IOKAlCBCdWxrIHNjcmFwaW5nIGZvciBwdWJsaWMgQVRTIGJvYXJkIGhvc3RzLiBQb3B1cCDihpIgY29udGVudC1zY3JpcHQuXG4gICAgLy8gRWFjaCBwYWlyIG1pcnJvcnMgdGhlIFdXIHNoYXBlIHNvIHRoZSBzYW1lIGBCdWxrU291cmNlQ2FyZGAgVVggY2FuIGRyaXZlXG4gICAgLy8gZXZlcnkgc291cmNlLiBFYWNoIG9yY2hlc3RyYXRvciBjYXBzIGF0IDIwMC9zZXNzaW9uIChvdmVycmlkYWJsZSBiZWxvdykuXG4gICAgYnVsa0dyZWVuaG91c2VHZXRQYWdlU3RhdGU6ICgpID0+ICh7XG4gICAgICAgIHR5cGU6IFwiQlVMS19HUkVFTkhPVVNFX0dFVF9QQUdFX1NUQVRFXCIsXG4gICAgfSksXG4gICAgYnVsa0dyZWVuaG91c2VTY3JhcGVWaXNpYmxlOiAoKSA9PiAoe1xuICAgICAgICB0eXBlOiBcIkJVTEtfR1JFRU5IT1VTRV9TQ1JBUEVfVklTSUJMRVwiLFxuICAgIH0pLFxuICAgIGJ1bGtHcmVlbmhvdXNlU2NyYXBlUGFnaW5hdGVkOiAob3B0cykgPT4gKHtcbiAgICAgICAgdHlwZTogXCJCVUxLX0dSRUVOSE9VU0VfU0NSQVBFX1BBR0lOQVRFRFwiLFxuICAgICAgICBwYXlsb2FkOiBvcHRzID8/IHt9LFxuICAgIH0pLFxuICAgIGJ1bGtMZXZlckdldFBhZ2VTdGF0ZTogKCkgPT4gKHtcbiAgICAgICAgdHlwZTogXCJCVUxLX0xFVkVSX0dFVF9QQUdFX1NUQVRFXCIsXG4gICAgfSksXG4gICAgYnVsa0xldmVyU2NyYXBlVmlzaWJsZTogKCkgPT4gKHtcbiAgICAgICAgdHlwZTogXCJCVUxLX0xFVkVSX1NDUkFQRV9WSVNJQkxFXCIsXG4gICAgfSksXG4gICAgYnVsa0xldmVyU2NyYXBlUGFnaW5hdGVkOiAob3B0cykgPT4gKHtcbiAgICAgICAgdHlwZTogXCJCVUxLX0xFVkVSX1NDUkFQRV9QQUdJTkFURURcIixcbiAgICAgICAgcGF5bG9hZDogb3B0cyA/PyB7fSxcbiAgICB9KSxcbiAgICBidWxrV29ya2RheUdldFBhZ2VTdGF0ZTogKCkgPT4gKHtcbiAgICAgICAgdHlwZTogXCJCVUxLX1dPUktEQVlfR0VUX1BBR0VfU1RBVEVcIixcbiAgICB9KSxcbiAgICBidWxrV29ya2RheVNjcmFwZVZpc2libGU6ICgpID0+ICh7XG4gICAgICAgIHR5cGU6IFwiQlVMS19XT1JLREFZX1NDUkFQRV9WSVNJQkxFXCIsXG4gICAgfSksXG4gICAgYnVsa1dvcmtkYXlTY3JhcGVQYWdpbmF0ZWQ6IChvcHRzKSA9PiAoe1xuICAgICAgICB0eXBlOiBcIkJVTEtfV09SS0RBWV9TQ1JBUEVfUEFHSU5BVEVEXCIsXG4gICAgICAgIHBheWxvYWQ6IG9wdHMgPz8ge30sXG4gICAgfSksXG4gICAgLy8gUDQvIzQwIOKAlCBIZWxwZXIgZm9yIHRoZSBjaGF0LXBvcnQgc3RhcnQgZnJhbWUuIFRoZSBhY3R1YWwgc3RyZWFtIHVzZXMgYVxuICAgIC8vIGxvbmctbGl2ZWQgY2hyb21lLnJ1bnRpbWUuY29ubmVjdCBwb3J0IChDSEFUX1BPUlRfTkFNRSkgcmF0aGVyIHRoYW5cbiAgICAvLyBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSwgYnV0IGV4cG9zaW5nIGEgdHlwZWQgYnVpbGRlciBrZWVwcyBjYWxsc2l0ZXNcbiAgICAvLyBzZWxmLWRvY3VtZW50aW5nLlxuICAgIGNoYXRTdHJlYW1TdGFydDogKHBheWxvYWQpID0+ICh7XG4gICAgICAgIHR5cGU6IFwiQ0hBVF9TVFJFQU1fU1RBUlRcIixcbiAgICAgICAgcHJvbXB0OiBwYXlsb2FkLnByb21wdCxcbiAgICAgICAgam9iQ29udGV4dDogcGF5bG9hZC5qb2JDb250ZXh0LFxuICAgIH0pLFxuICAgIC8vIENvcnJlY3Rpb25zIGZlZWRiYWNrIGxvb3AgKCMzMykuIEZpcmVkIHdoZW4gYSB1c2VyIGVkaXRzIGFuIGF1dG9maWxsZWRcbiAgICAvLyBmaWVsZCBhbmQgdGhlIGZpbmFsIHZhbHVlIGRpZmZlcnMgZnJvbSB0aGUgb3JpZ2luYWwgc3VnZ2VzdGlvbiDigJQgdGhlXG4gICAgLy8gYmFja2dyb3VuZCBmb3J3YXJkcyBpdCB0byAvYXBpL2V4dGVuc2lvbi9maWVsZC1tYXBwaW5ncy9jb3JyZWN0IHNvXG4gICAgLy8gZnV0dXJlIGF1dG9maWxscyBvbiB0aGUgc2FtZSBkb21haW4gcHJlZmVyIHRoZSBjb3JyZWN0ZWQgdmFsdWUuXG4gICAgc2F2ZUNvcnJlY3Rpb246IChwYXlsb2FkKSA9PiAoe1xuICAgICAgICB0eXBlOiBcIlNBVkVfQ09SUkVDVElPTlwiLFxuICAgICAgICBwYXlsb2FkLFxuICAgIH0pLFxuICAgIC8vIFAzIC8gIzM2ICMzNyDigJQgbXVsdGktc3RlcCBmb3JtIHN1cHBvcnQgKFdvcmtkYXksIEdyZWVuaG91c2UpLlxuICAgIC8qKiBCYWNrZ3JvdW5kIOKGkiBjb250ZW50OiBhIHN0ZXAgdHJhbnNpdGlvbiBqdXN0IGZpcmVkIGZvciB0aGlzIHRhYi4gKi9cbiAgICBtdWx0aXN0ZXBTdGVwVHJhbnNpdGlvbjogKHBheWxvYWQpID0+ICh7XG4gICAgICAgIHR5cGU6IFwiTVVMVElTVEVQX1NURVBfVFJBTlNJVElPTlwiLFxuICAgICAgICBwYXlsb2FkLFxuICAgIH0pLFxuICAgIC8qKiBDb250ZW50IOKGkiBiYWNrZ3JvdW5kOiByZXR1cm4gdGhlIGN1cnJlbnQgdGFiIGlkLiAqL1xuICAgIGdldFRhYklkOiAoKSA9PiAoeyB0eXBlOiBcIkdFVF9UQUJfSURcIiB9KSxcbiAgICAvKipcbiAgICAgKiBDb250ZW50IOKGkiBiYWNrZ3JvdW5kOiBlbnN1cmUgdGhlIGB3ZWJOYXZpZ2F0aW9uYCBwZXJtaXNzaW9uIGlzIGdyYW50ZWQuXG4gICAgICogSW4gQ2hyb21lIE1WMyBpdCdzIGRlY2xhcmVkIGF0IGluc3RhbGwgdGltZSBhbmQgdGhlIHJlc3BvbnNlIGlzIGFsd2F5c1xuICAgICAqIGB7IGdyYW50ZWQ6IHRydWUgfWAuIEluIEZpcmVmb3ggTVYyIHRoZSBiYWNrZ3JvdW5kIGNhbGxzXG4gICAgICogYGJyb3dzZXIucGVybWlzc2lvbnMucmVxdWVzdCguLi4pYCBhbmQgcmV0dXJucyB0aGUgdXNlcidzIHZlcmRpY3QuXG4gICAgICovXG4gICAgcmVxdWVzdFdlYk5hdmlnYXRpb25QZXJtaXNzaW9uOiAoKSA9PiAoe1xuICAgICAgICB0eXBlOiBcIlJFUVVFU1RfV0VCTkFWSUdBVElPTl9QRVJNSVNTSU9OXCIsXG4gICAgfSksXG4gICAgLyoqIENvbnRlbnQg4oaSIGJhY2tncm91bmQ6IGlzIGB3ZWJOYXZpZ2F0aW9uYCBjdXJyZW50bHkgdXNhYmxlPyAqL1xuICAgIGhhc1dlYk5hdmlnYXRpb25QZXJtaXNzaW9uOiAoKSA9PiAoe1xuICAgICAgICB0eXBlOiBcIkhBU19XRUJOQVZJR0FUSU9OX1BFUk1JU1NJT05cIixcbiAgICB9KSxcbn07XG4vLyBTZW5kIG1lc3NhZ2UgdG8gYmFja2dyb3VuZCBzY3JpcHRcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZW5kTWVzc2FnZShtZXNzYWdlKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKG1lc3NhZ2UsIChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcikge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGNocm9tZS5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXNwb25zZSB8fCB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogXCJObyByZXNwb25zZSByZWNlaXZlZFwiIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcbn1cbi8vIFNlbmQgbWVzc2FnZSB0byBjb250ZW50IHNjcmlwdCBpbiBzcGVjaWZpYyB0YWJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZW5kVG9UYWIodGFiSWQsIG1lc3NhZ2UpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UodGFiSWQsIG1lc3NhZ2UsIChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcikge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGNocm9tZS5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXNwb25zZSB8fCB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogXCJObyByZXNwb25zZSByZWNlaXZlZFwiIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcbn1cbi8vIFNlbmQgbWVzc2FnZSB0byBhbGwgY29udGVudCBzY3JpcHRzXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYnJvYWRjYXN0TWVzc2FnZShtZXNzYWdlKSB7XG4gICAgY29uc3QgdGFicyA9IGF3YWl0IGNocm9tZS50YWJzLnF1ZXJ5KHt9KTtcbiAgICBmb3IgKGNvbnN0IHRhYiBvZiB0YWJzKSB7XG4gICAgICAgIGlmICh0YWIuaWQpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UodGFiLmlkLCBtZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIHtcbiAgICAgICAgICAgICAgICAvLyBUYWIgbWlnaHQgbm90IGhhdmUgY29udGVudCBzY3JpcHQgbG9hZGVkXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvKipcbiAqIFA0LyM0MCDigJQgTG9uZy1saXZlZCBwb3J0IG5hbWUgdXNlZCBieSB0aGUgaW5saW5lIEFJIGFzc2lzdGFudC4gVGhlIGNvbnRlbnRcbiAqIHNjcmlwdCBjYWxscyBgY2hyb21lLnJ1bnRpbWUuY29ubmVjdCh7IG5hbWU6IENIQVRfUE9SVF9OQU1FIH0pYCBhbmQgdGhlXG4gKiBiYWNrZ3JvdW5kJ3MgYGNocm9tZS5ydW50aW1lLm9uQ29ubmVjdGAgbGlzdGVuZXIgZmlsdGVycyBieSB0aGlzIG5hbWUuXG4gKi9cbmV4cG9ydCBjb25zdCBDSEFUX1BPUlRfTkFNRSA9IFwic2xvdGhpbmctY2hhdC1zdHJlYW1cIjtcbmV4cG9ydCBjb25zdCBERUZBVUxUX1NFVFRJTkdTID0ge1xuICAgIGF1dG9GaWxsRW5hYmxlZDogdHJ1ZSxcbiAgICBzaG93Q29uZmlkZW5jZUluZGljYXRvcnM6IHRydWUsXG4gICAgbWluaW11bUNvbmZpZGVuY2U6IDAuNSxcbiAgICBsZWFybkZyb21BbnN3ZXJzOiB0cnVlLFxuICAgIG5vdGlmeU9uSm9iRGV0ZWN0ZWQ6IHRydWUsXG4gICAgYXV0b1RyYWNrQXBwbGljYXRpb25zRW5hYmxlZDogdHJ1ZSxcbiAgICBjYXB0dXJlU2NyZWVuc2hvdEVuYWJsZWQ6IGZhbHNlLFxufTtcbmV4cG9ydCBjb25zdCBMRUdBQ1lfTE9DQUxfQVBJX0JBU0VfVVJMID0gXCJodHRwOi8vbG9jYWxob3N0OjMwMDBcIjtcbmV4cG9ydCBjb25zdCBERUZBVUxUX0FQSV9CQVNFX1VSTCA9IHByb2Nlc3MuZW52LlNMT1RISU5HX0VYVEVOU0lPTl9BUElfQkFTRV9VUkwgfHwgXCJodHRwczovL3Nsb3RoaW5nLndvcmtcIjtcbmV4cG9ydCBjb25zdCBTSE9VTERfUFJPTU9URV9MRUdBQ1lfTE9DQUxfQVBJX0JBU0VfVVJMID0gREVGQVVMVF9BUElfQkFTRV9VUkwgIT09IExFR0FDWV9MT0NBTF9BUElfQkFTRV9VUkw7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=