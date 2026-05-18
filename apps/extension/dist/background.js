/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// ./src/shared/types.ts
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

;// ./src/shared/error-messages.ts
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

;// ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/core.js
var _a;
/** A special constant with type `never` */
const NEVER = /*@__PURE__*/ Object.freeze({
    status: "aborted",
});
function $constructor(name, initializer, params) {
    function init(inst, def) {
        if (!inst._zod) {
            Object.defineProperty(inst, "_zod", {
                value: {
                    def,
                    constr: _,
                    traits: new Set(),
                },
                enumerable: false,
            });
        }
        if (inst._zod.traits.has(name)) {
            return;
        }
        inst._zod.traits.add(name);
        initializer(inst, def);
        // support prototype modifications
        const proto = _.prototype;
        const keys = Object.keys(proto);
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            if (!(k in inst)) {
                inst[k] = proto[k].bind(inst);
            }
        }
    }
    // doesn't work if Parent has a constructor with arguments
    const Parent = params?.Parent ?? Object;
    class Definition extends Parent {
    }
    Object.defineProperty(Definition, "name", { value: name });
    function _(def) {
        var _a;
        const inst = params?.Parent ? new Definition() : this;
        init(inst, def);
        (_a = inst._zod).deferred ?? (_a.deferred = []);
        for (const fn of inst._zod.deferred) {
            fn();
        }
        return inst;
    }
    Object.defineProperty(_, "init", { value: init });
    Object.defineProperty(_, Symbol.hasInstance, {
        value: (inst) => {
            if (params?.Parent && inst instanceof params.Parent)
                return true;
            return inst?._zod?.traits?.has(name);
        },
    });
    Object.defineProperty(_, "name", { value: name });
    return _;
}
//////////////////////////////   UTILITIES   ///////////////////////////////////////
const $brand = Symbol("zod_brand");
class $ZodAsyncError extends Error {
    constructor() {
        super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
    }
}
class $ZodEncodeError extends Error {
    constructor(name) {
        super(`Encountered unidirectional transform during encode: ${name}`);
        this.name = "ZodEncodeError";
    }
}
(_a = globalThis).__zod_globalConfig ?? (_a.__zod_globalConfig = {});
const globalConfig = globalThis.__zod_globalConfig;
function config(newConfig) {
    if (newConfig)
        Object.assign(globalConfig, newConfig);
    return globalConfig;
}

;// ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/regexes.js
/* unused harmony import specifier */ var util;

/**
 * @deprecated CUID v1 is deprecated by its authors due to information leakage
 * (timestamps embedded in the id). Use {@link cuid2} instead.
 * See https://github.com/paralleldrive/cuid.
 */
const cuid = /^[cC][0-9a-z]{6,}$/;
const cuid2 = /^[0-9a-z]+$/;
const ulid = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/;
const xid = /^[0-9a-vA-V]{20}$/;
const ksuid = /^[A-Za-z0-9]{27}$/;
const nanoid = /^[a-zA-Z0-9_-]{21}$/;
/** ISO 8601-1 duration regex. Does not support the 8601-2 extensions like negative durations or fractional/negative components. */
const duration = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/;
/** Implements ISO 8601-2 extensions like explicit +- prefixes, mixing weeks with other units, and fractional/negative components. */
const extendedDuration = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
/** A regex for any UUID-like identifier: 8-4-4-4-12 hex pattern */
const guid = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
/** Returns a regex for validating an RFC 9562/4122 UUID.
 *
 * @param version Optionally specify a version 1-8. If no version is specified, all versions are supported. */
const uuid = (version) => {
    if (!version)
        return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;
    return new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`);
};
const uuid4 = /*@__PURE__*/ (/* unused pure expression or super */ null && (uuid(4)));
const uuid6 = /*@__PURE__*/ (/* unused pure expression or super */ null && (uuid(6)));
const uuid7 = /*@__PURE__*/ (/* unused pure expression or super */ null && (uuid(7)));
/** Practical email validation */
const email = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
/** Equivalent to the HTML5 input[type=email] validation implemented by browsers. Source: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email */
const html5Email = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
/** The classic emailregex.com regex for RFC 5322-compliant emails */
const rfc5322Email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
/** A loose regex that allows Unicode characters, enforces length limits, and that's about it. */
const unicodeEmail = /^[^\s@"]{1,64}@[^\s@]{1,255}$/u;
const idnEmail = (/* unused pure expression or super */ null && (unicodeEmail));
const browserEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
// from https://thekevinscott.com/emojis-in-javascript/#writing-a-regular-expression
const _emoji = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
function emoji() {
    return new RegExp(_emoji, "u");
}
const ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
const ipv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
const mac = (delimiter) => {
    const escapedDelim = util.escapeRegex(delimiter ?? ":");
    return new RegExp(`^(?:[0-9A-F]{2}${escapedDelim}){5}[0-9A-F]{2}$|^(?:[0-9a-f]{2}${escapedDelim}){5}[0-9a-f]{2}$`);
};
const cidrv4 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/;
const cidrv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
// https://stackoverflow.com/questions/7860392/determine-if-string-is-in-base64-using-javascript
const base64 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/;
const base64url = /^[A-Za-z0-9_-]*$/;
// based on https://stackoverflow.com/questions/106179/regular-expression-to-match-dns-hostname-or-ip-address
// export const hostname: RegExp = /^([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+$/;
const hostname = /^(?=.{1,253}\.?$)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[-0-9a-zA-Z]{0,61}[0-9a-zA-Z])?)*\.?$/;
const domain = /^([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
const httpProtocol = /^https?$/;
// https://blog.stevenlevithan.com/archives/validate-phone-number#r4-3 (regex sans spaces)
// E.164: leading digit must be 1-9; total digits (excluding '+') between 7-15
const e164 = /^\+[1-9]\d{6,14}$/;
// const dateSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
const dateSource = `(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))`;
const date = /*@__PURE__*/ new RegExp(`^${dateSource}$`);
function timeSource(args) {
    const hhmm = `(?:[01]\\d|2[0-3]):[0-5]\\d`;
    const regex = typeof args.precision === "number"
        ? args.precision === -1
            ? `${hhmm}`
            : args.precision === 0
                ? `${hhmm}:[0-5]\\d`
                : `${hhmm}:[0-5]\\d\\.\\d{${args.precision}}`
        : `${hhmm}(?::[0-5]\\d(?:\\.\\d+)?)?`;
    return regex;
}
function time(args) {
    return new RegExp(`^${timeSource(args)}$`);
}
// Adapted from https://stackoverflow.com/a/3143231
function datetime(args) {
    const time = timeSource({ precision: args.precision });
    const opts = ["Z"];
    if (args.local)
        opts.push("");
    // if (args.offset) opts.push(`([+-]\\d{2}:\\d{2})`);
    if (args.offset)
        opts.push(`([+-](?:[01]\\d|2[0-3]):[0-5]\\d)`);
    const timeRegex = `${time}(?:${opts.join("|")})`;
    return new RegExp(`^${dateSource}T(?:${timeRegex})$`);
}
const string = (params) => {
    const regex = params ? `[\\s\\S]{${params?.minimum ?? 0},${params?.maximum ?? ""}}` : `[\\s\\S]*`;
    return new RegExp(`^${regex}$`);
};
const bigint = /^-?\d+n?$/;
const integer = /^-?\d+$/;
const number = /^-?\d+(?:\.\d+)?$/;
const regexes_boolean = /^(?:true|false)$/i;
const _null = /^null$/i;

const _undefined = /^undefined$/i;

// regex for string with no uppercase letters
const lowercase = /^[^A-Z]*$/;
// regex for string with no lowercase letters
const uppercase = /^[^a-z]*$/;
// regex for hexadecimal strings (any length)
const hex = /^[0-9a-fA-F]*$/;
// Hash regexes for different algorithms and encodings
// Helper function to create base64 regex with exact length and padding
function fixedBase64(bodyLength, padding) {
    return new RegExp(`^[A-Za-z0-9+/]{${bodyLength}}${padding}$`);
}
// Helper function to create base64url regex with exact length (no padding)
function fixedBase64url(length) {
    return new RegExp(`^[A-Za-z0-9_-]{${length}}$`);
}
// MD5 (16 bytes): base64 = 24 chars total (22 + "==")
const md5_hex = /^[0-9a-fA-F]{32}$/;
const md5_base64 = /*@__PURE__*/ (/* unused pure expression or super */ null && (fixedBase64(22, "==")));
const md5_base64url = /*@__PURE__*/ (/* unused pure expression or super */ null && (fixedBase64url(22)));
// SHA1 (20 bytes): base64 = 28 chars total (27 + "=")
const sha1_hex = /^[0-9a-fA-F]{40}$/;
const sha1_base64 = /*@__PURE__*/ (/* unused pure expression or super */ null && (fixedBase64(27, "=")));
const sha1_base64url = /*@__PURE__*/ (/* unused pure expression or super */ null && (fixedBase64url(27)));
// SHA256 (32 bytes): base64 = 44 chars total (43 + "=")
const sha256_hex = /^[0-9a-fA-F]{64}$/;
const sha256_base64 = /*@__PURE__*/ (/* unused pure expression or super */ null && (fixedBase64(43, "=")));
const sha256_base64url = /*@__PURE__*/ (/* unused pure expression or super */ null && (fixedBase64url(43)));
// SHA384 (48 bytes): base64 = 64 chars total (no padding)
const sha384_hex = /^[0-9a-fA-F]{96}$/;
const sha384_base64 = /*@__PURE__*/ (/* unused pure expression or super */ null && (fixedBase64(64, "")));
const sha384_base64url = /*@__PURE__*/ (/* unused pure expression or super */ null && (fixedBase64url(64)));
// SHA512 (64 bytes): base64 = 88 chars total (86 + "==")
const sha512_hex = /^[0-9a-fA-F]{128}$/;
const sha512_base64 = /*@__PURE__*/ (/* unused pure expression or super */ null && (fixedBase64(86, "==")));
const sha512_base64url = /*@__PURE__*/ (/* unused pure expression or super */ null && (fixedBase64url(86)));

;// ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/util.js

// functions
function assertEqual(val) {
    return val;
}
function assertNotEqual(val) {
    return val;
}
function assertIs(_arg) { }
function assertNever(_x) {
    throw new Error("Unexpected value in exhaustive check");
}
function assert(_) { }
function getEnumValues(entries) {
    const numericValues = Object.values(entries).filter((v) => typeof v === "number");
    const values = Object.entries(entries)
        .filter(([k, _]) => numericValues.indexOf(+k) === -1)
        .map(([_, v]) => v);
    return values;
}
function joinValues(array, separator = "|") {
    return array.map((val) => stringifyPrimitive(val)).join(separator);
}
function jsonStringifyReplacer(_, value) {
    if (typeof value === "bigint")
        return value.toString();
    return value;
}
function cached(getter) {
    const set = false;
    return {
        get value() {
            if (!set) {
                const value = getter();
                Object.defineProperty(this, "value", { value });
                return value;
            }
            throw new Error("cached value already set");
        },
    };
}
function nullish(input) {
    return input === null || input === undefined;
}
function cleanRegex(source) {
    const start = source.startsWith("^") ? 1 : 0;
    const end = source.endsWith("$") ? source.length - 1 : source.length;
    return source.slice(start, end);
}
function floatSafeRemainder(val, step) {
    const ratio = val / step;
    const roundedRatio = Math.round(ratio);
    // Use a relative epsilon scaled to the magnitude of the result
    const tolerance = Number.EPSILON * Math.max(Math.abs(ratio), 1);
    if (Math.abs(ratio - roundedRatio) < tolerance)
        return 0;
    return ratio - roundedRatio;
}
const EVALUATING = /* @__PURE__*/ Symbol("evaluating");
function defineLazy(object, key, getter) {
    let value = undefined;
    Object.defineProperty(object, key, {
        get() {
            if (value === EVALUATING) {
                // Circular reference detected, return undefined to break the cycle
                return undefined;
            }
            if (value === undefined) {
                value = EVALUATING;
                value = getter();
            }
            return value;
        },
        set(v) {
            Object.defineProperty(object, key, {
                value: v,
                // configurable: true,
            });
            // object[key] = v;
        },
        configurable: true,
    });
}
function objectClone(obj) {
    return Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj));
}
function assignProp(target, prop, value) {
    Object.defineProperty(target, prop, {
        value,
        writable: true,
        enumerable: true,
        configurable: true,
    });
}
function mergeDefs(...defs) {
    const mergedDescriptors = {};
    for (const def of defs) {
        const descriptors = Object.getOwnPropertyDescriptors(def);
        Object.assign(mergedDescriptors, descriptors);
    }
    return Object.defineProperties({}, mergedDescriptors);
}
function cloneDef(schema) {
    return mergeDefs(schema._zod.def);
}
function getElementAtPath(obj, path) {
    if (!path)
        return obj;
    return path.reduce((acc, key) => acc?.[key], obj);
}
function promiseAllObject(promisesObj) {
    const keys = Object.keys(promisesObj);
    const promises = keys.map((key) => promisesObj[key]);
    return Promise.all(promises).then((results) => {
        const resolvedObj = {};
        for (let i = 0; i < keys.length; i++) {
            resolvedObj[keys[i]] = results[i];
        }
        return resolvedObj;
    });
}
function randomString(length = 10) {
    const chars = "abcdefghijklmnopqrstuvwxyz";
    let str = "";
    for (let i = 0; i < length; i++) {
        str += chars[Math.floor(Math.random() * chars.length)];
    }
    return str;
}
function esc(str) {
    return JSON.stringify(str);
}
function slugify(input) {
    return input
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
}
const captureStackTrace = ("captureStackTrace" in Error ? Error.captureStackTrace : (..._args) => { });
function util_isObject(data) {
    return typeof data === "object" && data !== null && !Array.isArray(data);
}
const util_allowsEval = /* @__PURE__*/ cached(() => {
    // Skip the probe under `jitless`: strict CSPs report the caught `new Function`
    // as a `securitypolicyviolation` even though the throw is swallowed.
    if (globalConfig.jitless) {
        return false;
    }
    // @ts-ignore
    if (typeof navigator !== "undefined" && navigator?.userAgent?.includes("Cloudflare")) {
        return false;
    }
    try {
        const F = Function;
        new F("");
        return true;
    }
    catch (_) {
        return false;
    }
});
function isPlainObject(o) {
    if (util_isObject(o) === false)
        return false;
    // modified constructor
    const ctor = o.constructor;
    if (ctor === undefined)
        return true;
    if (typeof ctor !== "function")
        return true;
    // modified prototype
    const prot = ctor.prototype;
    if (util_isObject(prot) === false)
        return false;
    // ctor doesn't have static `isPrototypeOf`
    if (Object.prototype.hasOwnProperty.call(prot, "isPrototypeOf") === false) {
        return false;
    }
    return true;
}
function shallowClone(o) {
    if (isPlainObject(o))
        return { ...o };
    if (Array.isArray(o))
        return [...o];
    if (o instanceof Map)
        return new Map(o);
    if (o instanceof Set)
        return new Set(o);
    return o;
}
function numKeys(data) {
    let keyCount = 0;
    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            keyCount++;
        }
    }
    return keyCount;
}
const getParsedType = (data) => {
    const t = typeof data;
    switch (t) {
        case "undefined":
            return "undefined";
        case "string":
            return "string";
        case "number":
            return Number.isNaN(data) ? "nan" : "number";
        case "boolean":
            return "boolean";
        case "function":
            return "function";
        case "bigint":
            return "bigint";
        case "symbol":
            return "symbol";
        case "object":
            if (Array.isArray(data)) {
                return "array";
            }
            if (data === null) {
                return "null";
            }
            if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
                return "promise";
            }
            if (typeof Map !== "undefined" && data instanceof Map) {
                return "map";
            }
            if (typeof Set !== "undefined" && data instanceof Set) {
                return "set";
            }
            if (typeof Date !== "undefined" && data instanceof Date) {
                return "date";
            }
            // @ts-ignore
            if (typeof File !== "undefined" && data instanceof File) {
                return "file";
            }
            return "object";
        default:
            throw new Error(`Unknown data type: ${t}`);
    }
};
const propertyKeyTypes = /* @__PURE__*/ new Set(["string", "number", "symbol"]);
const primitiveTypes = /* @__PURE__*/ new Set([
    "string",
    "number",
    "bigint",
    "boolean",
    "symbol",
    "undefined",
]);
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
// zod-specific utils
function clone(inst, def, params) {
    const cl = new inst._zod.constr(def ?? inst._zod.def);
    if (!def || params?.parent)
        cl._zod.parent = inst;
    return cl;
}
function normalizeParams(_params) {
    const params = _params;
    if (!params)
        return {};
    if (typeof params === "string")
        return { error: () => params };
    if (params?.message !== undefined) {
        if (params?.error !== undefined)
            throw new Error("Cannot specify both `message` and `error` params");
        params.error = params.message;
    }
    delete params.message;
    if (typeof params.error === "string")
        return { ...params, error: () => params.error };
    return params;
}
function createTransparentProxy(getter) {
    let target;
    return new Proxy({}, {
        get(_, prop, receiver) {
            target ?? (target = getter());
            return Reflect.get(target, prop, receiver);
        },
        set(_, prop, value, receiver) {
            target ?? (target = getter());
            return Reflect.set(target, prop, value, receiver);
        },
        has(_, prop) {
            target ?? (target = getter());
            return Reflect.has(target, prop);
        },
        deleteProperty(_, prop) {
            target ?? (target = getter());
            return Reflect.deleteProperty(target, prop);
        },
        ownKeys(_) {
            target ?? (target = getter());
            return Reflect.ownKeys(target);
        },
        getOwnPropertyDescriptor(_, prop) {
            target ?? (target = getter());
            return Reflect.getOwnPropertyDescriptor(target, prop);
        },
        defineProperty(_, prop, descriptor) {
            target ?? (target = getter());
            return Reflect.defineProperty(target, prop, descriptor);
        },
    });
}
function stringifyPrimitive(value) {
    if (typeof value === "bigint")
        return value.toString() + "n";
    if (typeof value === "string")
        return `"${value}"`;
    return `${value}`;
}
function optionalKeys(shape) {
    return Object.keys(shape).filter((k) => {
        return shape[k]._zod.optin === "optional" && shape[k]._zod.optout === "optional";
    });
}
const NUMBER_FORMAT_RANGES = {
    safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
    int32: [-2147483648, 2147483647],
    uint32: [0, 4294967295],
    float32: [-3.4028234663852886e38, 3.4028234663852886e38],
    float64: [-Number.MAX_VALUE, Number.MAX_VALUE],
};
const BIGINT_FORMAT_RANGES = {
    int64: [/* @__PURE__*/ BigInt("-9223372036854775808"), /* @__PURE__*/ BigInt("9223372036854775807")],
    uint64: [/* @__PURE__*/ BigInt(0), /* @__PURE__*/ BigInt("18446744073709551615")],
};
function pick(schema, mask) {
    const currDef = schema._zod.def;
    const checks = currDef.checks;
    const hasChecks = checks && checks.length > 0;
    if (hasChecks) {
        throw new Error(".pick() cannot be used on object schemas containing refinements");
    }
    const def = mergeDefs(schema._zod.def, {
        get shape() {
            const newShape = {};
            for (const key in mask) {
                if (!(key in currDef.shape)) {
                    throw new Error(`Unrecognized key: "${key}"`);
                }
                if (!mask[key])
                    continue;
                newShape[key] = currDef.shape[key];
            }
            assignProp(this, "shape", newShape); // self-caching
            return newShape;
        },
        checks: [],
    });
    return clone(schema, def);
}
function omit(schema, mask) {
    const currDef = schema._zod.def;
    const checks = currDef.checks;
    const hasChecks = checks && checks.length > 0;
    if (hasChecks) {
        throw new Error(".omit() cannot be used on object schemas containing refinements");
    }
    const def = mergeDefs(schema._zod.def, {
        get shape() {
            const newShape = { ...schema._zod.def.shape };
            for (const key in mask) {
                if (!(key in currDef.shape)) {
                    throw new Error(`Unrecognized key: "${key}"`);
                }
                if (!mask[key])
                    continue;
                delete newShape[key];
            }
            assignProp(this, "shape", newShape); // self-caching
            return newShape;
        },
        checks: [],
    });
    return clone(schema, def);
}
function extend(schema, shape) {
    if (!isPlainObject(shape)) {
        throw new Error("Invalid input to extend: expected a plain object");
    }
    const checks = schema._zod.def.checks;
    const hasChecks = checks && checks.length > 0;
    if (hasChecks) {
        // Only throw if new shape overlaps with existing shape
        // Use getOwnPropertyDescriptor to check key existence without accessing values
        const existingShape = schema._zod.def.shape;
        for (const key in shape) {
            if (Object.getOwnPropertyDescriptor(existingShape, key) !== undefined) {
                throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
            }
        }
    }
    const def = mergeDefs(schema._zod.def, {
        get shape() {
            const _shape = { ...schema._zod.def.shape, ...shape };
            assignProp(this, "shape", _shape); // self-caching
            return _shape;
        },
    });
    return clone(schema, def);
}
function safeExtend(schema, shape) {
    if (!isPlainObject(shape)) {
        throw new Error("Invalid input to safeExtend: expected a plain object");
    }
    const def = mergeDefs(schema._zod.def, {
        get shape() {
            const _shape = { ...schema._zod.def.shape, ...shape };
            assignProp(this, "shape", _shape); // self-caching
            return _shape;
        },
    });
    return clone(schema, def);
}
function merge(a, b) {
    if (a._zod.def.checks?.length) {
        throw new Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
    }
    const def = mergeDefs(a._zod.def, {
        get shape() {
            const _shape = { ...a._zod.def.shape, ...b._zod.def.shape };
            assignProp(this, "shape", _shape); // self-caching
            return _shape;
        },
        get catchall() {
            return b._zod.def.catchall;
        },
        checks: b._zod.def.checks ?? [],
    });
    return clone(a, def);
}
function partial(Class, schema, mask) {
    const currDef = schema._zod.def;
    const checks = currDef.checks;
    const hasChecks = checks && checks.length > 0;
    if (hasChecks) {
        throw new Error(".partial() cannot be used on object schemas containing refinements");
    }
    const def = mergeDefs(schema._zod.def, {
        get shape() {
            const oldShape = schema._zod.def.shape;
            const shape = { ...oldShape };
            if (mask) {
                for (const key in mask) {
                    if (!(key in oldShape)) {
                        throw new Error(`Unrecognized key: "${key}"`);
                    }
                    if (!mask[key])
                        continue;
                    // if (oldShape[key]!._zod.optin === "optional") continue;
                    shape[key] = Class
                        ? new Class({
                            type: "optional",
                            innerType: oldShape[key],
                        })
                        : oldShape[key];
                }
            }
            else {
                for (const key in oldShape) {
                    // if (oldShape[key]!._zod.optin === "optional") continue;
                    shape[key] = Class
                        ? new Class({
                            type: "optional",
                            innerType: oldShape[key],
                        })
                        : oldShape[key];
                }
            }
            assignProp(this, "shape", shape); // self-caching
            return shape;
        },
        checks: [],
    });
    return clone(schema, def);
}
function required(Class, schema, mask) {
    const def = mergeDefs(schema._zod.def, {
        get shape() {
            const oldShape = schema._zod.def.shape;
            const shape = { ...oldShape };
            if (mask) {
                for (const key in mask) {
                    if (!(key in shape)) {
                        throw new Error(`Unrecognized key: "${key}"`);
                    }
                    if (!mask[key])
                        continue;
                    // overwrite with non-optional
                    shape[key] = new Class({
                        type: "nonoptional",
                        innerType: oldShape[key],
                    });
                }
            }
            else {
                for (const key in oldShape) {
                    // overwrite with non-optional
                    shape[key] = new Class({
                        type: "nonoptional",
                        innerType: oldShape[key],
                    });
                }
            }
            assignProp(this, "shape", shape); // self-caching
            return shape;
        },
    });
    return clone(schema, def);
}
// invalid_type | too_big | too_small | invalid_format | not_multiple_of | unrecognized_keys | invalid_union | invalid_key | invalid_element | invalid_value | custom
function aborted(x, startIndex = 0) {
    if (x.aborted === true)
        return true;
    for (let i = startIndex; i < x.issues.length; i++) {
        if (x.issues[i]?.continue !== true) {
            return true;
        }
    }
    return false;
}
// Checks for explicit abort (continue === false), as opposed to implicit abort (continue === undefined).
// Used to respect `abort: true` in .refine() even for checks that have a `when` function.
function explicitlyAborted(x, startIndex = 0) {
    if (x.aborted === true)
        return true;
    for (let i = startIndex; i < x.issues.length; i++) {
        if (x.issues[i]?.continue === false) {
            return true;
        }
    }
    return false;
}
function prefixIssues(path, issues) {
    return issues.map((iss) => {
        var _a;
        (_a = iss).path ?? (_a.path = []);
        iss.path.unshift(path);
        return iss;
    });
}
function unwrapMessage(message) {
    return typeof message === "string" ? message : message?.message;
}
function finalizeIssue(iss, ctx, config) {
    const message = iss.message
        ? iss.message
        : (unwrapMessage(iss.inst?._zod.def?.error?.(iss)) ??
            unwrapMessage(ctx?.error?.(iss)) ??
            unwrapMessage(config.customError?.(iss)) ??
            unwrapMessage(config.localeError?.(iss)) ??
            "Invalid input");
    const { inst: _inst, continue: _continue, input: _input, ...rest } = iss;
    rest.path ?? (rest.path = []);
    rest.message = message;
    if (ctx?.reportInput) {
        rest.input = _input;
    }
    return rest;
}
function getSizableOrigin(input) {
    if (input instanceof Set)
        return "set";
    if (input instanceof Map)
        return "map";
    // @ts-ignore
    if (input instanceof File)
        return "file";
    return "unknown";
}
function getLengthableOrigin(input) {
    if (Array.isArray(input))
        return "array";
    if (typeof input === "string")
        return "string";
    return "unknown";
}
function parsedType(data) {
    const t = typeof data;
    switch (t) {
        case "number": {
            return Number.isNaN(data) ? "nan" : "number";
        }
        case "object": {
            if (data === null) {
                return "null";
            }
            if (Array.isArray(data)) {
                return "array";
            }
            const obj = data;
            if (obj && Object.getPrototypeOf(obj) !== Object.prototype && "constructor" in obj && obj.constructor) {
                return obj.constructor.name;
            }
        }
    }
    return t;
}
function util_issue(...args) {
    const [iss, input, inst] = args;
    if (typeof iss === "string") {
        return {
            message: iss,
            code: "custom",
            input,
            inst,
        };
    }
    return { ...iss };
}
function cleanEnum(obj) {
    return Object.entries(obj)
        .filter(([k, _]) => {
        // return true if NaN, meaning it's not a number, thus a string key
        return Number.isNaN(Number.parseInt(k, 10));
    })
        .map((el) => el[1]);
}
// Codec utility functions
function base64ToUint8Array(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}
function uint8ArrayToBase64(bytes) {
    let binaryString = "";
    for (let i = 0; i < bytes.length; i++) {
        binaryString += String.fromCharCode(bytes[i]);
    }
    return btoa(binaryString);
}
function base64urlToUint8Array(base64url) {
    const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
    const padding = "=".repeat((4 - (base64.length % 4)) % 4);
    return base64ToUint8Array(base64 + padding);
}
function uint8ArrayToBase64url(bytes) {
    return uint8ArrayToBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
function hexToUint8Array(hex) {
    const cleanHex = hex.replace(/^0x/, "");
    if (cleanHex.length % 2 !== 0) {
        throw new Error("Invalid hex string length");
    }
    const bytes = new Uint8Array(cleanHex.length / 2);
    for (let i = 0; i < cleanHex.length; i += 2) {
        bytes[i / 2] = Number.parseInt(cleanHex.slice(i, i + 2), 16);
    }
    return bytes;
}
function uint8ArrayToHex(bytes) {
    return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}
// instanceof
class Class {
    constructor(..._args) { }
}

;// ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/checks.js
/* unused harmony import specifier */ var core;
/* unused harmony import specifier */ var checks_util;
// import { $ZodType } from "./schemas.js";



const $ZodCheck = /*@__PURE__*/ $constructor("$ZodCheck", (inst, def) => {
    var _a;
    inst._zod ?? (inst._zod = {});
    inst._zod.def = def;
    (_a = inst._zod).onattach ?? (_a.onattach = []);
});
const numericOriginMap = {
    number: "number",
    bigint: "bigint",
    object: "date",
};
const $ZodCheckLessThan = /*@__PURE__*/ $constructor("$ZodCheckLessThan", (inst, def) => {
    $ZodCheck.init(inst, def);
    const origin = numericOriginMap[typeof def.value];
    inst._zod.onattach.push((inst) => {
        const bag = inst._zod.bag;
        const curr = (def.inclusive ? bag.maximum : bag.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
        if (def.value < curr) {
            if (def.inclusive)
                bag.maximum = def.value;
            else
                bag.exclusiveMaximum = def.value;
        }
    });
    inst._zod.check = (payload) => {
        if (def.inclusive ? payload.value <= def.value : payload.value < def.value) {
            return;
        }
        payload.issues.push({
            origin,
            code: "too_big",
            maximum: typeof def.value === "object" ? def.value.getTime() : def.value,
            input: payload.value,
            inclusive: def.inclusive,
            inst,
            continue: !def.abort,
        });
    };
});
const $ZodCheckGreaterThan = /*@__PURE__*/ $constructor("$ZodCheckGreaterThan", (inst, def) => {
    $ZodCheck.init(inst, def);
    const origin = numericOriginMap[typeof def.value];
    inst._zod.onattach.push((inst) => {
        const bag = inst._zod.bag;
        const curr = (def.inclusive ? bag.minimum : bag.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
        if (def.value > curr) {
            if (def.inclusive)
                bag.minimum = def.value;
            else
                bag.exclusiveMinimum = def.value;
        }
    });
    inst._zod.check = (payload) => {
        if (def.inclusive ? payload.value >= def.value : payload.value > def.value) {
            return;
        }
        payload.issues.push({
            origin,
            code: "too_small",
            minimum: typeof def.value === "object" ? def.value.getTime() : def.value,
            input: payload.value,
            inclusive: def.inclusive,
            inst,
            continue: !def.abort,
        });
    };
});
const $ZodCheckMultipleOf = 
/*@__PURE__*/ $constructor("$ZodCheckMultipleOf", (inst, def) => {
    $ZodCheck.init(inst, def);
    inst._zod.onattach.push((inst) => {
        var _a;
        (_a = inst._zod.bag).multipleOf ?? (_a.multipleOf = def.value);
    });
    inst._zod.check = (payload) => {
        if (typeof payload.value !== typeof def.value)
            throw new Error("Cannot mix number and bigint in multiple_of check.");
        const isMultiple = typeof payload.value === "bigint"
            ? payload.value % def.value === BigInt(0)
            : floatSafeRemainder(payload.value, def.value) === 0;
        if (isMultiple)
            return;
        payload.issues.push({
            origin: typeof payload.value,
            code: "not_multiple_of",
            divisor: def.value,
            input: payload.value,
            inst,
            continue: !def.abort,
        });
    };
});
const $ZodCheckNumberFormat = /*@__PURE__*/ $constructor("$ZodCheckNumberFormat", (inst, def) => {
    $ZodCheck.init(inst, def); // no format checks
    def.format = def.format || "float64";
    const isInt = def.format?.includes("int");
    const origin = isInt ? "int" : "number";
    const [minimum, maximum] = NUMBER_FORMAT_RANGES[def.format];
    inst._zod.onattach.push((inst) => {
        const bag = inst._zod.bag;
        bag.format = def.format;
        bag.minimum = minimum;
        bag.maximum = maximum;
        if (isInt)
            bag.pattern = integer;
    });
    inst._zod.check = (payload) => {
        const input = payload.value;
        if (isInt) {
            if (!Number.isInteger(input)) {
                // invalid_format issue
                // payload.issues.push({
                //   expected: def.format,
                //   format: def.format,
                //   code: "invalid_format",
                //   input,
                //   inst,
                // });
                // invalid_type issue
                payload.issues.push({
                    expected: origin,
                    format: def.format,
                    code: "invalid_type",
                    continue: false,
                    input,
                    inst,
                });
                return;
                // not_multiple_of issue
                // payload.issues.push({
                //   code: "not_multiple_of",
                //   origin: "number",
                //   input,
                //   inst,
                //   divisor: 1,
                // });
            }
            if (!Number.isSafeInteger(input)) {
                if (input > 0) {
                    // too_big
                    payload.issues.push({
                        input,
                        code: "too_big",
                        maximum: Number.MAX_SAFE_INTEGER,
                        note: "Integers must be within the safe integer range.",
                        inst,
                        origin,
                        inclusive: true,
                        continue: !def.abort,
                    });
                }
                else {
                    // too_small
                    payload.issues.push({
                        input,
                        code: "too_small",
                        minimum: Number.MIN_SAFE_INTEGER,
                        note: "Integers must be within the safe integer range.",
                        inst,
                        origin,
                        inclusive: true,
                        continue: !def.abort,
                    });
                }
                return;
            }
        }
        if (input < minimum) {
            payload.issues.push({
                origin: "number",
                input,
                code: "too_small",
                minimum,
                inclusive: true,
                inst,
                continue: !def.abort,
            });
        }
        if (input > maximum) {
            payload.issues.push({
                origin: "number",
                input,
                code: "too_big",
                maximum,
                inclusive: true,
                inst,
                continue: !def.abort,
            });
        }
    };
});
const $ZodCheckBigIntFormat = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("$ZodCheckBigIntFormat", (inst, def) => {
    $ZodCheck.init(inst, def); // no format checks
    const [minimum, maximum] = checks_util.BIGINT_FORMAT_RANGES[def.format];
    inst._zod.onattach.push((inst) => {
        const bag = inst._zod.bag;
        bag.format = def.format;
        bag.minimum = minimum;
        bag.maximum = maximum;
    });
    inst._zod.check = (payload) => {
        const input = payload.value;
        if (input < minimum) {
            payload.issues.push({
                origin: "bigint",
                input,
                code: "too_small",
                minimum: minimum,
                inclusive: true,
                inst,
                continue: !def.abort,
            });
        }
        if (input > maximum) {
            payload.issues.push({
                origin: "bigint",
                input,
                code: "too_big",
                maximum,
                inclusive: true,
                inst,
                continue: !def.abort,
            });
        }
    };
})));
const $ZodCheckMaxSize = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("$ZodCheckMaxSize", (inst, def) => {
    var _a;
    $ZodCheck.init(inst, def);
    (_a = inst._zod.def).when ?? (_a.when = (payload) => {
        const val = payload.value;
        return !checks_util.nullish(val) && val.size !== undefined;
    });
    inst._zod.onattach.push((inst) => {
        const curr = (inst._zod.bag.maximum ?? Number.POSITIVE_INFINITY);
        if (def.maximum < curr)
            inst._zod.bag.maximum = def.maximum;
    });
    inst._zod.check = (payload) => {
        const input = payload.value;
        const size = input.size;
        if (size <= def.maximum)
            return;
        payload.issues.push({
            origin: checks_util.getSizableOrigin(input),
            code: "too_big",
            maximum: def.maximum,
            inclusive: true,
            input,
            inst,
            continue: !def.abort,
        });
    };
})));
const $ZodCheckMinSize = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("$ZodCheckMinSize", (inst, def) => {
    var _a;
    $ZodCheck.init(inst, def);
    (_a = inst._zod.def).when ?? (_a.when = (payload) => {
        const val = payload.value;
        return !checks_util.nullish(val) && val.size !== undefined;
    });
    inst._zod.onattach.push((inst) => {
        const curr = (inst._zod.bag.minimum ?? Number.NEGATIVE_INFINITY);
        if (def.minimum > curr)
            inst._zod.bag.minimum = def.minimum;
    });
    inst._zod.check = (payload) => {
        const input = payload.value;
        const size = input.size;
        if (size >= def.minimum)
            return;
        payload.issues.push({
            origin: checks_util.getSizableOrigin(input),
            code: "too_small",
            minimum: def.minimum,
            inclusive: true,
            input,
            inst,
            continue: !def.abort,
        });
    };
})));
const $ZodCheckSizeEquals = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("$ZodCheckSizeEquals", (inst, def) => {
    var _a;
    $ZodCheck.init(inst, def);
    (_a = inst._zod.def).when ?? (_a.when = (payload) => {
        const val = payload.value;
        return !checks_util.nullish(val) && val.size !== undefined;
    });
    inst._zod.onattach.push((inst) => {
        const bag = inst._zod.bag;
        bag.minimum = def.size;
        bag.maximum = def.size;
        bag.size = def.size;
    });
    inst._zod.check = (payload) => {
        const input = payload.value;
        const size = input.size;
        if (size === def.size)
            return;
        const tooBig = size > def.size;
        payload.issues.push({
            origin: checks_util.getSizableOrigin(input),
            ...(tooBig ? { code: "too_big", maximum: def.size } : { code: "too_small", minimum: def.size }),
            inclusive: true,
            exact: true,
            input: payload.value,
            inst,
            continue: !def.abort,
        });
    };
})));
const $ZodCheckMaxLength = /*@__PURE__*/ $constructor("$ZodCheckMaxLength", (inst, def) => {
    var _a;
    $ZodCheck.init(inst, def);
    (_a = inst._zod.def).when ?? (_a.when = (payload) => {
        const val = payload.value;
        return !nullish(val) && val.length !== undefined;
    });
    inst._zod.onattach.push((inst) => {
        const curr = (inst._zod.bag.maximum ?? Number.POSITIVE_INFINITY);
        if (def.maximum < curr)
            inst._zod.bag.maximum = def.maximum;
    });
    inst._zod.check = (payload) => {
        const input = payload.value;
        const length = input.length;
        if (length <= def.maximum)
            return;
        const origin = getLengthableOrigin(input);
        payload.issues.push({
            origin,
            code: "too_big",
            maximum: def.maximum,
            inclusive: true,
            input,
            inst,
            continue: !def.abort,
        });
    };
});
const $ZodCheckMinLength = /*@__PURE__*/ $constructor("$ZodCheckMinLength", (inst, def) => {
    var _a;
    $ZodCheck.init(inst, def);
    (_a = inst._zod.def).when ?? (_a.when = (payload) => {
        const val = payload.value;
        return !nullish(val) && val.length !== undefined;
    });
    inst._zod.onattach.push((inst) => {
        const curr = (inst._zod.bag.minimum ?? Number.NEGATIVE_INFINITY);
        if (def.minimum > curr)
            inst._zod.bag.minimum = def.minimum;
    });
    inst._zod.check = (payload) => {
        const input = payload.value;
        const length = input.length;
        if (length >= def.minimum)
            return;
        const origin = getLengthableOrigin(input);
        payload.issues.push({
            origin,
            code: "too_small",
            minimum: def.minimum,
            inclusive: true,
            input,
            inst,
            continue: !def.abort,
        });
    };
});
const $ZodCheckLengthEquals = /*@__PURE__*/ $constructor("$ZodCheckLengthEquals", (inst, def) => {
    var _a;
    $ZodCheck.init(inst, def);
    (_a = inst._zod.def).when ?? (_a.when = (payload) => {
        const val = payload.value;
        return !nullish(val) && val.length !== undefined;
    });
    inst._zod.onattach.push((inst) => {
        const bag = inst._zod.bag;
        bag.minimum = def.length;
        bag.maximum = def.length;
        bag.length = def.length;
    });
    inst._zod.check = (payload) => {
        const input = payload.value;
        const length = input.length;
        if (length === def.length)
            return;
        const origin = getLengthableOrigin(input);
        const tooBig = length > def.length;
        payload.issues.push({
            origin,
            ...(tooBig ? { code: "too_big", maximum: def.length } : { code: "too_small", minimum: def.length }),
            inclusive: true,
            exact: true,
            input: payload.value,
            inst,
            continue: !def.abort,
        });
    };
});
const $ZodCheckStringFormat = /*@__PURE__*/ $constructor("$ZodCheckStringFormat", (inst, def) => {
    var _a, _b;
    $ZodCheck.init(inst, def);
    inst._zod.onattach.push((inst) => {
        const bag = inst._zod.bag;
        bag.format = def.format;
        if (def.pattern) {
            bag.patterns ?? (bag.patterns = new Set());
            bag.patterns.add(def.pattern);
        }
    });
    if (def.pattern)
        (_a = inst._zod).check ?? (_a.check = (payload) => {
            def.pattern.lastIndex = 0;
            if (def.pattern.test(payload.value))
                return;
            payload.issues.push({
                origin: "string",
                code: "invalid_format",
                format: def.format,
                input: payload.value,
                ...(def.pattern ? { pattern: def.pattern.toString() } : {}),
                inst,
                continue: !def.abort,
            });
        });
    else
        (_b = inst._zod).check ?? (_b.check = () => { });
});
const $ZodCheckRegex = /*@__PURE__*/ $constructor("$ZodCheckRegex", (inst, def) => {
    $ZodCheckStringFormat.init(inst, def);
    inst._zod.check = (payload) => {
        def.pattern.lastIndex = 0;
        if (def.pattern.test(payload.value))
            return;
        payload.issues.push({
            origin: "string",
            code: "invalid_format",
            format: "regex",
            input: payload.value,
            pattern: def.pattern.toString(),
            inst,
            continue: !def.abort,
        });
    };
});
const $ZodCheckLowerCase = /*@__PURE__*/ $constructor("$ZodCheckLowerCase", (inst, def) => {
    def.pattern ?? (def.pattern = lowercase);
    $ZodCheckStringFormat.init(inst, def);
});
const $ZodCheckUpperCase = /*@__PURE__*/ $constructor("$ZodCheckUpperCase", (inst, def) => {
    def.pattern ?? (def.pattern = uppercase);
    $ZodCheckStringFormat.init(inst, def);
});
const $ZodCheckIncludes = /*@__PURE__*/ $constructor("$ZodCheckIncludes", (inst, def) => {
    $ZodCheck.init(inst, def);
    const escapedRegex = escapeRegex(def.includes);
    const pattern = new RegExp(typeof def.position === "number" ? `^.{${def.position}}${escapedRegex}` : escapedRegex);
    def.pattern = pattern;
    inst._zod.onattach.push((inst) => {
        const bag = inst._zod.bag;
        bag.patterns ?? (bag.patterns = new Set());
        bag.patterns.add(pattern);
    });
    inst._zod.check = (payload) => {
        if (payload.value.includes(def.includes, def.position))
            return;
        payload.issues.push({
            origin: "string",
            code: "invalid_format",
            format: "includes",
            includes: def.includes,
            input: payload.value,
            inst,
            continue: !def.abort,
        });
    };
});
const $ZodCheckStartsWith = /*@__PURE__*/ $constructor("$ZodCheckStartsWith", (inst, def) => {
    $ZodCheck.init(inst, def);
    const pattern = new RegExp(`^${escapeRegex(def.prefix)}.*`);
    def.pattern ?? (def.pattern = pattern);
    inst._zod.onattach.push((inst) => {
        const bag = inst._zod.bag;
        bag.patterns ?? (bag.patterns = new Set());
        bag.patterns.add(pattern);
    });
    inst._zod.check = (payload) => {
        if (payload.value.startsWith(def.prefix))
            return;
        payload.issues.push({
            origin: "string",
            code: "invalid_format",
            format: "starts_with",
            prefix: def.prefix,
            input: payload.value,
            inst,
            continue: !def.abort,
        });
    };
});
const $ZodCheckEndsWith = /*@__PURE__*/ $constructor("$ZodCheckEndsWith", (inst, def) => {
    $ZodCheck.init(inst, def);
    const pattern = new RegExp(`.*${escapeRegex(def.suffix)}$`);
    def.pattern ?? (def.pattern = pattern);
    inst._zod.onattach.push((inst) => {
        const bag = inst._zod.bag;
        bag.patterns ?? (bag.patterns = new Set());
        bag.patterns.add(pattern);
    });
    inst._zod.check = (payload) => {
        if (payload.value.endsWith(def.suffix))
            return;
        payload.issues.push({
            origin: "string",
            code: "invalid_format",
            format: "ends_with",
            suffix: def.suffix,
            input: payload.value,
            inst,
            continue: !def.abort,
        });
    };
});
///////////////////////////////////
/////    $ZodCheckProperty    /////
///////////////////////////////////
function handleCheckPropertyResult(result, payload, property) {
    if (result.issues.length) {
        payload.issues.push(...checks_util.prefixIssues(property, result.issues));
    }
}
const $ZodCheckProperty = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("$ZodCheckProperty", (inst, def) => {
    $ZodCheck.init(inst, def);
    inst._zod.check = (payload) => {
        const result = def.schema._zod.run({
            value: payload.value[def.property],
            issues: [],
        }, {});
        if (result instanceof Promise) {
            return result.then((result) => handleCheckPropertyResult(result, payload, def.property));
        }
        handleCheckPropertyResult(result, payload, def.property);
        return;
    };
})));
const $ZodCheckMimeType = /*@__PURE__*/ (/* unused pure expression or super */ null && (core.$constructor("$ZodCheckMimeType", (inst, def) => {
    $ZodCheck.init(inst, def);
    const mimeSet = new Set(def.mime);
    inst._zod.onattach.push((inst) => {
        inst._zod.bag.mime = def.mime;
    });
    inst._zod.check = (payload) => {
        if (mimeSet.has(payload.value.type))
            return;
        payload.issues.push({
            code: "invalid_value",
            values: def.mime,
            input: payload.value.type,
            inst,
            continue: !def.abort,
        });
    };
})));
const $ZodCheckOverwrite = /*@__PURE__*/ $constructor("$ZodCheckOverwrite", (inst, def) => {
    $ZodCheck.init(inst, def);
    inst._zod.check = (payload) => {
        payload.value = def.tx(payload.value);
    };
});

;// ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/doc.js
class Doc {
    constructor(args = []) {
        this.content = [];
        this.indent = 0;
        if (this)
            this.args = args;
    }
    indented(fn) {
        this.indent += 1;
        fn(this);
        this.indent -= 1;
    }
    write(arg) {
        if (typeof arg === "function") {
            arg(this, { execution: "sync" });
            arg(this, { execution: "async" });
            return;
        }
        const content = arg;
        const lines = content.split("\n").filter((x) => x);
        const minIndent = Math.min(...lines.map((x) => x.length - x.trimStart().length));
        const dedented = lines.map((x) => x.slice(minIndent)).map((x) => " ".repeat(this.indent * 2) + x);
        for (const line of dedented) {
            this.content.push(line);
        }
    }
    compile() {
        const F = Function;
        const args = this?.args;
        const content = this?.content ?? [``];
        const lines = [...content.map((x) => `  ${x}`)];
        // console.log(lines.join("\n"));
        return new F(...args, lines.join("\n"));
    }
}

;// ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/errors.js


const initializer = (inst, def) => {
    inst.name = "$ZodError";
    Object.defineProperty(inst, "_zod", {
        value: inst._zod,
        enumerable: false,
    });
    Object.defineProperty(inst, "issues", {
        value: def,
        enumerable: false,
    });
    inst.message = JSON.stringify(def, jsonStringifyReplacer, 2);
    Object.defineProperty(inst, "toString", {
        value: () => inst.message,
        enumerable: false,
    });
};
const $ZodError = $constructor("$ZodError", initializer);
const $ZodRealError = $constructor("$ZodError", initializer, { Parent: Error });
function flattenError(error, mapper = (issue) => issue.message) {
    const fieldErrors = {};
    const formErrors = [];
    for (const sub of error.issues) {
        if (sub.path.length > 0) {
            fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
            fieldErrors[sub.path[0]].push(mapper(sub));
        }
        else {
            formErrors.push(mapper(sub));
        }
    }
    return { formErrors, fieldErrors };
}
function formatError(error, mapper = (issue) => issue.message) {
    const fieldErrors = { _errors: [] };
    const processError = (error, path = []) => {
        for (const issue of error.issues) {
            if (issue.code === "invalid_union" && issue.errors.length) {
                issue.errors.map((issues) => processError({ issues }, [...path, ...issue.path]));
            }
            else if (issue.code === "invalid_key") {
                processError({ issues: issue.issues }, [...path, ...issue.path]);
            }
            else if (issue.code === "invalid_element") {
                processError({ issues: issue.issues }, [...path, ...issue.path]);
            }
            else {
                const fullpath = [...path, ...issue.path];
                if (fullpath.length === 0) {
                    fieldErrors._errors.push(mapper(issue));
                }
                else {
                    let curr = fieldErrors;
                    let i = 0;
                    while (i < fullpath.length) {
                        const el = fullpath[i];
                        const terminal = i === fullpath.length - 1;
                        if (!terminal) {
                            curr[el] = curr[el] || { _errors: [] };
                        }
                        else {
                            curr[el] = curr[el] || { _errors: [] };
                            curr[el]._errors.push(mapper(issue));
                        }
                        curr = curr[el];
                        i++;
                    }
                }
            }
        }
    };
    processError(error);
    return fieldErrors;
}
function treeifyError(error, mapper = (issue) => issue.message) {
    const result = { errors: [] };
    const processError = (error, path = []) => {
        var _a, _b;
        for (const issue of error.issues) {
            if (issue.code === "invalid_union" && issue.errors.length) {
                // regular union error
                issue.errors.map((issues) => processError({ issues }, [...path, ...issue.path]));
            }
            else if (issue.code === "invalid_key") {
                processError({ issues: issue.issues }, [...path, ...issue.path]);
            }
            else if (issue.code === "invalid_element") {
                processError({ issues: issue.issues }, [...path, ...issue.path]);
            }
            else {
                const fullpath = [...path, ...issue.path];
                if (fullpath.length === 0) {
                    result.errors.push(mapper(issue));
                    continue;
                }
                let curr = result;
                let i = 0;
                while (i < fullpath.length) {
                    const el = fullpath[i];
                    const terminal = i === fullpath.length - 1;
                    if (typeof el === "string") {
                        curr.properties ?? (curr.properties = {});
                        (_a = curr.properties)[el] ?? (_a[el] = { errors: [] });
                        curr = curr.properties[el];
                    }
                    else {
                        curr.items ?? (curr.items = []);
                        (_b = curr.items)[el] ?? (_b[el] = { errors: [] });
                        curr = curr.items[el];
                    }
                    if (terminal) {
                        curr.errors.push(mapper(issue));
                    }
                    i++;
                }
            }
        }
    };
    processError(error);
    return result;
}
/** Format a ZodError as a human-readable string in the following form.
 *
 * From
 *
 * ```ts
 * ZodError {
 *   issues: [
 *     {
 *       expected: 'string',
 *       code: 'invalid_type',
 *       path: [ 'username' ],
 *       message: 'Invalid input: expected string'
 *     },
 *     {
 *       expected: 'number',
 *       code: 'invalid_type',
 *       path: [ 'favoriteNumbers', 1 ],
 *       message: 'Invalid input: expected number'
 *     }
 *   ];
 * }
 * ```
 *
 * to
 *
 * ```
 * username
 *   ✖ Expected number, received string at "username
 * favoriteNumbers[0]
 *   ✖ Invalid input: expected number
 * ```
 */
function toDotPath(_path) {
    const segs = [];
    const path = _path.map((seg) => (typeof seg === "object" ? seg.key : seg));
    for (const seg of path) {
        if (typeof seg === "number")
            segs.push(`[${seg}]`);
        else if (typeof seg === "symbol")
            segs.push(`[${JSON.stringify(String(seg))}]`);
        else if (/[^\w$]/.test(seg))
            segs.push(`[${JSON.stringify(seg)}]`);
        else {
            if (segs.length)
                segs.push(".");
            segs.push(seg);
        }
    }
    return segs.join("");
}
function prettifyError(error) {
    const lines = [];
    // sort by path length
    const issues = [...error.issues].sort((a, b) => (a.path ?? []).length - (b.path ?? []).length);
    // Process each issue
    for (const issue of issues) {
        lines.push(`✖ ${issue.message}`);
        if (issue.path?.length)
            lines.push(`  → at ${toDotPath(issue.path)}`);
    }
    // Convert Map to formatted string
    return lines.join("\n");
}

;// ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/parse.js



const _parse = (_Err) => (schema, value, _ctx, _params) => {
    const ctx = _ctx ? { ..._ctx, async: false } : { async: false };
    const result = schema._zod.run({ value, issues: [] }, ctx);
    if (result instanceof Promise) {
        throw new $ZodAsyncError();
    }
    if (result.issues.length) {
        const e = new (_params?.Err ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
        captureStackTrace(e, _params?.callee);
        throw e;
    }
    return result.value;
};
const parse = /* @__PURE__*/ _parse($ZodRealError);
const _parseAsync = (_Err) => async (schema, value, _ctx, params) => {
    const ctx = _ctx ? { ..._ctx, async: true } : { async: true };
    let result = schema._zod.run({ value, issues: [] }, ctx);
    if (result instanceof Promise)
        result = await result;
    if (result.issues.length) {
        const e = new (params?.Err ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
        captureStackTrace(e, params?.callee);
        throw e;
    }
    return result.value;
};
const parseAsync = /* @__PURE__*/ _parseAsync($ZodRealError);
const _safeParse = (_Err) => (schema, value, _ctx) => {
    const ctx = _ctx ? { ..._ctx, async: false } : { async: false };
    const result = schema._zod.run({ value, issues: [] }, ctx);
    if (result instanceof Promise) {
        throw new $ZodAsyncError();
    }
    return result.issues.length
        ? {
            success: false,
            error: new (_Err ?? $ZodError)(result.issues.map((iss) => finalizeIssue(iss, ctx, config()))),
        }
        : { success: true, data: result.value };
};
const safeParse = /* @__PURE__*/ _safeParse($ZodRealError);
const _safeParseAsync = (_Err) => async (schema, value, _ctx) => {
    const ctx = _ctx ? { ..._ctx, async: true } : { async: true };
    let result = schema._zod.run({ value, issues: [] }, ctx);
    if (result instanceof Promise)
        result = await result;
    return result.issues.length
        ? {
            success: false,
            error: new _Err(result.issues.map((iss) => finalizeIssue(iss, ctx, config()))),
        }
        : { success: true, data: result.value };
};
const safeParseAsync = /* @__PURE__*/ _safeParseAsync($ZodRealError);
const _encode = (_Err) => (schema, value, _ctx) => {
    const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
    return _parse(_Err)(schema, value, ctx);
};
const encode = /* @__PURE__*/ _encode($ZodRealError);
const _decode = (_Err) => (schema, value, _ctx) => {
    return _parse(_Err)(schema, value, _ctx);
};
const decode = /* @__PURE__*/ _decode($ZodRealError);
const _encodeAsync = (_Err) => async (schema, value, _ctx) => {
    const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
    return _parseAsync(_Err)(schema, value, ctx);
};
const encodeAsync = /* @__PURE__*/ _encodeAsync($ZodRealError);
const _decodeAsync = (_Err) => async (schema, value, _ctx) => {
    return _parseAsync(_Err)(schema, value, _ctx);
};
const decodeAsync = /* @__PURE__*/ _decodeAsync($ZodRealError);
const _safeEncode = (_Err) => (schema, value, _ctx) => {
    const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
    return _safeParse(_Err)(schema, value, ctx);
};
const safeEncode = /* @__PURE__*/ _safeEncode($ZodRealError);
const _safeDecode = (_Err) => (schema, value, _ctx) => {
    return _safeParse(_Err)(schema, value, _ctx);
};
const safeDecode = /* @__PURE__*/ _safeDecode($ZodRealError);
const _safeEncodeAsync = (_Err) => async (schema, value, _ctx) => {
    const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
    return _safeParseAsync(_Err)(schema, value, ctx);
};
const safeEncodeAsync = /* @__PURE__*/ _safeEncodeAsync($ZodRealError);
const _safeDecodeAsync = (_Err) => async (schema, value, _ctx) => {
    return _safeParseAsync(_Err)(schema, value, _ctx);
};
const safeDecodeAsync = /* @__PURE__*/ _safeDecodeAsync($ZodRealError);

;// ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/versions.js
const version = {
    major: 4,
    minor: 4,
    patch: 3,
};

;// ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/schemas.js
/* unused harmony import specifier */ var checks;
/* unused harmony import specifier */ var schemas_core;
/* unused harmony import specifier */ var schemas_parse;
/* unused harmony import specifier */ var schemas_parseAsync;
/* unused harmony import specifier */ var regexes;
/* unused harmony import specifier */ var schemas_util;







const $ZodType = /*@__PURE__*/ $constructor("$ZodType", (inst, def) => {
    var _a;
    inst ?? (inst = {});
    inst._zod.def = def; // set _def property
    inst._zod.bag = inst._zod.bag || {}; // initialize _bag object
    inst._zod.version = version;
    const checks = [...(inst._zod.def.checks ?? [])];
    // if inst is itself a checks.$ZodCheck, run it as a check
    if (inst._zod.traits.has("$ZodCheck")) {
        checks.unshift(inst);
    }
    for (const ch of checks) {
        for (const fn of ch._zod.onattach) {
            fn(inst);
        }
    }
    if (checks.length === 0) {
        // deferred initializer
        // inst._zod.parse is not yet defined
        (_a = inst._zod).deferred ?? (_a.deferred = []);
        inst._zod.deferred?.push(() => {
            inst._zod.run = inst._zod.parse;
        });
    }
    else {
        const runChecks = (payload, checks, ctx) => {
            let isAborted = aborted(payload);
            let asyncResult;
            for (const ch of checks) {
                if (ch._zod.def.when) {
                    if (explicitlyAborted(payload))
                        continue;
                    const shouldRun = ch._zod.def.when(payload);
                    if (!shouldRun)
                        continue;
                }
                else if (isAborted) {
                    continue;
                }
                const currLen = payload.issues.length;
                const _ = ch._zod.check(payload);
                if (_ instanceof Promise && ctx?.async === false) {
                    throw new $ZodAsyncError();
                }
                if (asyncResult || _ instanceof Promise) {
                    asyncResult = (asyncResult ?? Promise.resolve()).then(async () => {
                        await _;
                        const nextLen = payload.issues.length;
                        if (nextLen === currLen)
                            return;
                        if (!isAborted)
                            isAborted = aborted(payload, currLen);
                    });
                }
                else {
                    const nextLen = payload.issues.length;
                    if (nextLen === currLen)
                        continue;
                    if (!isAborted)
                        isAborted = aborted(payload, currLen);
                }
            }
            if (asyncResult) {
                return asyncResult.then(() => {
                    return payload;
                });
            }
            return payload;
        };
        const handleCanaryResult = (canary, payload, ctx) => {
            // abort if the canary is aborted
            if (aborted(canary)) {
                canary.aborted = true;
                return canary;
            }
            // run checks first, then
            const checkResult = runChecks(payload, checks, ctx);
            if (checkResult instanceof Promise) {
                if (ctx.async === false)
                    throw new $ZodAsyncError();
                return checkResult.then((checkResult) => inst._zod.parse(checkResult, ctx));
            }
            return inst._zod.parse(checkResult, ctx);
        };
        inst._zod.run = (payload, ctx) => {
            if (ctx.skipChecks) {
                return inst._zod.parse(payload, ctx);
            }
            if (ctx.direction === "backward") {
                // run canary
                // initial pass (no checks)
                const canary = inst._zod.parse({ value: payload.value, issues: [] }, { ...ctx, skipChecks: true });
                if (canary instanceof Promise) {
                    return canary.then((canary) => {
                        return handleCanaryResult(canary, payload, ctx);
                    });
                }
                return handleCanaryResult(canary, payload, ctx);
            }
            // forward
            const result = inst._zod.parse(payload, ctx);
            if (result instanceof Promise) {
                if (ctx.async === false)
                    throw new $ZodAsyncError();
                return result.then((result) => runChecks(result, checks, ctx));
            }
            return runChecks(result, checks, ctx);
        };
    }
    // Lazy initialize ~standard to avoid creating objects for every schema
    defineLazy(inst, "~standard", () => ({
        validate: (value) => {
            try {
                const r = safeParse(inst, value);
                return r.success ? { value: r.data } : { issues: r.error?.issues };
            }
            catch (_) {
                return safeParseAsync(inst, value).then((r) => (r.success ? { value: r.data } : { issues: r.error?.issues }));
            }
        },
        vendor: "zod",
        version: 1,
    }));
});

const $ZodString = /*@__PURE__*/ $constructor("$ZodString", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.pattern = [...(inst?._zod.bag?.patterns ?? [])].pop() ?? string(inst._zod.bag);
    inst._zod.parse = (payload, _) => {
        if (def.coerce)
            try {
                payload.value = String(payload.value);
            }
            catch (_) { }
        if (typeof payload.value === "string")
            return payload;
        payload.issues.push({
            expected: "string",
            code: "invalid_type",
            input: payload.value,
            inst,
        });
        return payload;
    };
});
const $ZodStringFormat = /*@__PURE__*/ $constructor("$ZodStringFormat", (inst, def) => {
    // check initialization must come first
    $ZodCheckStringFormat.init(inst, def);
    $ZodString.init(inst, def);
});
const $ZodGUID = /*@__PURE__*/ $constructor("$ZodGUID", (inst, def) => {
    def.pattern ?? (def.pattern = guid);
    $ZodStringFormat.init(inst, def);
});
const $ZodUUID = /*@__PURE__*/ $constructor("$ZodUUID", (inst, def) => {
    if (def.version) {
        const versionMap = {
            v1: 1,
            v2: 2,
            v3: 3,
            v4: 4,
            v5: 5,
            v6: 6,
            v7: 7,
            v8: 8,
        };
        const v = versionMap[def.version];
        if (v === undefined)
            throw new Error(`Invalid UUID version: "${def.version}"`);
        def.pattern ?? (def.pattern = uuid(v));
    }
    else
        def.pattern ?? (def.pattern = uuid());
    $ZodStringFormat.init(inst, def);
});
const $ZodEmail = /*@__PURE__*/ $constructor("$ZodEmail", (inst, def) => {
    def.pattern ?? (def.pattern = email);
    $ZodStringFormat.init(inst, def);
});
const $ZodURL = /*@__PURE__*/ $constructor("$ZodURL", (inst, def) => {
    $ZodStringFormat.init(inst, def);
    inst._zod.check = (payload) => {
        try {
            // Trim whitespace from input
            const trimmed = payload.value.trim();
            // When normalize is off, require :// for http/https URLs
            // This prevents strings like "http:example.com" or "https:/path" from being silently accepted
            if (!def.normalize && def.protocol?.source === httpProtocol.source) {
                if (!/^https?:\/\//i.test(trimmed)) {
                    payload.issues.push({
                        code: "invalid_format",
                        format: "url",
                        note: "Invalid URL format",
                        input: payload.value,
                        inst,
                        continue: !def.abort,
                    });
                    return;
                }
            }
            // @ts-ignore
            const url = new URL(trimmed);
            if (def.hostname) {
                def.hostname.lastIndex = 0;
                if (!def.hostname.test(url.hostname)) {
                    payload.issues.push({
                        code: "invalid_format",
                        format: "url",
                        note: "Invalid hostname",
                        pattern: def.hostname.source,
                        input: payload.value,
                        inst,
                        continue: !def.abort,
                    });
                }
            }
            if (def.protocol) {
                def.protocol.lastIndex = 0;
                if (!def.protocol.test(url.protocol.endsWith(":") ? url.protocol.slice(0, -1) : url.protocol)) {
                    payload.issues.push({
                        code: "invalid_format",
                        format: "url",
                        note: "Invalid protocol",
                        pattern: def.protocol.source,
                        input: payload.value,
                        inst,
                        continue: !def.abort,
                    });
                }
            }
            // Set the output value based on normalize flag
            if (def.normalize) {
                // Use normalized URL
                payload.value = url.href;
            }
            else {
                // Preserve the original input (trimmed)
                payload.value = trimmed;
            }
            return;
        }
        catch (_) {
            payload.issues.push({
                code: "invalid_format",
                format: "url",
                input: payload.value,
                inst,
                continue: !def.abort,
            });
        }
    };
});
const $ZodEmoji = /*@__PURE__*/ $constructor("$ZodEmoji", (inst, def) => {
    def.pattern ?? (def.pattern = emoji());
    $ZodStringFormat.init(inst, def);
});
const $ZodNanoID = /*@__PURE__*/ $constructor("$ZodNanoID", (inst, def) => {
    def.pattern ?? (def.pattern = nanoid);
    $ZodStringFormat.init(inst, def);
});
/**
 * @deprecated CUID v1 is deprecated by its authors due to information leakage
 * (timestamps embedded in the id). Use {@link $ZodCUID2} instead.
 * See https://github.com/paralleldrive/cuid.
 */
const $ZodCUID = /*@__PURE__*/ $constructor("$ZodCUID", (inst, def) => {
    def.pattern ?? (def.pattern = cuid);
    $ZodStringFormat.init(inst, def);
});
const $ZodCUID2 = /*@__PURE__*/ $constructor("$ZodCUID2", (inst, def) => {
    def.pattern ?? (def.pattern = cuid2);
    $ZodStringFormat.init(inst, def);
});
const $ZodULID = /*@__PURE__*/ $constructor("$ZodULID", (inst, def) => {
    def.pattern ?? (def.pattern = ulid);
    $ZodStringFormat.init(inst, def);
});
const $ZodXID = /*@__PURE__*/ $constructor("$ZodXID", (inst, def) => {
    def.pattern ?? (def.pattern = xid);
    $ZodStringFormat.init(inst, def);
});
const $ZodKSUID = /*@__PURE__*/ $constructor("$ZodKSUID", (inst, def) => {
    def.pattern ?? (def.pattern = ksuid);
    $ZodStringFormat.init(inst, def);
});
const $ZodISODateTime = /*@__PURE__*/ $constructor("$ZodISODateTime", (inst, def) => {
    def.pattern ?? (def.pattern = datetime(def));
    $ZodStringFormat.init(inst, def);
});
const $ZodISODate = /*@__PURE__*/ $constructor("$ZodISODate", (inst, def) => {
    def.pattern ?? (def.pattern = date);
    $ZodStringFormat.init(inst, def);
});
const $ZodISOTime = /*@__PURE__*/ $constructor("$ZodISOTime", (inst, def) => {
    def.pattern ?? (def.pattern = time(def));
    $ZodStringFormat.init(inst, def);
});
const $ZodISODuration = /*@__PURE__*/ $constructor("$ZodISODuration", (inst, def) => {
    def.pattern ?? (def.pattern = duration);
    $ZodStringFormat.init(inst, def);
});
const $ZodIPv4 = /*@__PURE__*/ $constructor("$ZodIPv4", (inst, def) => {
    def.pattern ?? (def.pattern = ipv4);
    $ZodStringFormat.init(inst, def);
    inst._zod.bag.format = `ipv4`;
});
const $ZodIPv6 = /*@__PURE__*/ $constructor("$ZodIPv6", (inst, def) => {
    def.pattern ?? (def.pattern = ipv6);
    $ZodStringFormat.init(inst, def);
    inst._zod.bag.format = `ipv6`;
    inst._zod.check = (payload) => {
        try {
            // @ts-ignore
            new URL(`http://[${payload.value}]`);
            // return;
        }
        catch {
            payload.issues.push({
                code: "invalid_format",
                format: "ipv6",
                input: payload.value,
                inst,
                continue: !def.abort,
            });
        }
    };
});
const $ZodMAC = /*@__PURE__*/ (/* unused pure expression or super */ null && (schemas_core.$constructor("$ZodMAC", (inst, def) => {
    def.pattern ?? (def.pattern = regexes.mac(def.delimiter));
    $ZodStringFormat.init(inst, def);
    inst._zod.bag.format = `mac`;
})));
const $ZodCIDRv4 = /*@__PURE__*/ $constructor("$ZodCIDRv4", (inst, def) => {
    def.pattern ?? (def.pattern = cidrv4);
    $ZodStringFormat.init(inst, def);
});
const $ZodCIDRv6 = /*@__PURE__*/ $constructor("$ZodCIDRv6", (inst, def) => {
    def.pattern ?? (def.pattern = cidrv6); // not used for validation
    $ZodStringFormat.init(inst, def);
    inst._zod.check = (payload) => {
        const parts = payload.value.split("/");
        try {
            if (parts.length !== 2)
                throw new Error();
            const [address, prefix] = parts;
            if (!prefix)
                throw new Error();
            const prefixNum = Number(prefix);
            if (`${prefixNum}` !== prefix)
                throw new Error();
            if (prefixNum < 0 || prefixNum > 128)
                throw new Error();
            // @ts-ignore
            new URL(`http://[${address}]`);
        }
        catch {
            payload.issues.push({
                code: "invalid_format",
                format: "cidrv6",
                input: payload.value,
                inst,
                continue: !def.abort,
            });
        }
    };
});
//////////////////////////////   ZodBase64   //////////////////////////////
function isValidBase64(data) {
    if (data === "")
        return true;
    // atob ignores whitespace, so reject it up front.
    if (/\s/.test(data))
        return false;
    if (data.length % 4 !== 0)
        return false;
    try {
        // @ts-ignore
        atob(data);
        return true;
    }
    catch {
        return false;
    }
}
const $ZodBase64 = /*@__PURE__*/ $constructor("$ZodBase64", (inst, def) => {
    def.pattern ?? (def.pattern = base64);
    $ZodStringFormat.init(inst, def);
    inst._zod.bag.contentEncoding = "base64";
    inst._zod.check = (payload) => {
        if (isValidBase64(payload.value))
            return;
        payload.issues.push({
            code: "invalid_format",
            format: "base64",
            input: payload.value,
            inst,
            continue: !def.abort,
        });
    };
});
//////////////////////////////   ZodBase64   //////////////////////////////
function isValidBase64URL(data) {
    if (!base64url.test(data))
        return false;
    const base64 = data.replace(/[-_]/g, (c) => (c === "-" ? "+" : "/"));
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    return isValidBase64(padded);
}
const $ZodBase64URL = /*@__PURE__*/ $constructor("$ZodBase64URL", (inst, def) => {
    def.pattern ?? (def.pattern = base64url);
    $ZodStringFormat.init(inst, def);
    inst._zod.bag.contentEncoding = "base64url";
    inst._zod.check = (payload) => {
        if (isValidBase64URL(payload.value))
            return;
        payload.issues.push({
            code: "invalid_format",
            format: "base64url",
            input: payload.value,
            inst,
            continue: !def.abort,
        });
    };
});
const $ZodE164 = /*@__PURE__*/ $constructor("$ZodE164", (inst, def) => {
    def.pattern ?? (def.pattern = e164);
    $ZodStringFormat.init(inst, def);
});
//////////////////////////////   ZodJWT   //////////////////////////////
function isValidJWT(token, algorithm = null) {
    try {
        const tokensParts = token.split(".");
        if (tokensParts.length !== 3)
            return false;
        const [header] = tokensParts;
        if (!header)
            return false;
        // @ts-ignore
        const parsedHeader = JSON.parse(atob(header));
        if ("typ" in parsedHeader && parsedHeader?.typ !== "JWT")
            return false;
        if (!parsedHeader.alg)
            return false;
        if (algorithm && (!("alg" in parsedHeader) || parsedHeader.alg !== algorithm))
            return false;
        return true;
    }
    catch {
        return false;
    }
}
const $ZodJWT = /*@__PURE__*/ $constructor("$ZodJWT", (inst, def) => {
    $ZodStringFormat.init(inst, def);
    inst._zod.check = (payload) => {
        if (isValidJWT(payload.value, def.alg))
            return;
        payload.issues.push({
            code: "invalid_format",
            format: "jwt",
            input: payload.value,
            inst,
            continue: !def.abort,
        });
    };
});
const $ZodCustomStringFormat = /*@__PURE__*/ (/* unused pure expression or super */ null && (schemas_core.$constructor("$ZodCustomStringFormat", (inst, def) => {
    $ZodStringFormat.init(inst, def);
    inst._zod.check = (payload) => {
        if (def.fn(payload.value))
            return;
        payload.issues.push({
            code: "invalid_format",
            format: def.format,
            input: payload.value,
            inst,
            continue: !def.abort,
        });
    };
})));
const $ZodNumber = /*@__PURE__*/ $constructor("$ZodNumber", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.pattern = inst._zod.bag.pattern ?? number;
    inst._zod.parse = (payload, _ctx) => {
        if (def.coerce)
            try {
                payload.value = Number(payload.value);
            }
            catch (_) { }
        const input = payload.value;
        if (typeof input === "number" && !Number.isNaN(input) && Number.isFinite(input)) {
            return payload;
        }
        const received = typeof input === "number"
            ? Number.isNaN(input)
                ? "NaN"
                : !Number.isFinite(input)
                    ? "Infinity"
                    : undefined
            : undefined;
        payload.issues.push({
            expected: "number",
            code: "invalid_type",
            input,
            inst,
            ...(received ? { received } : {}),
        });
        return payload;
    };
});
const $ZodNumberFormat = /*@__PURE__*/ $constructor("$ZodNumberFormat", (inst, def) => {
    $ZodCheckNumberFormat.init(inst, def);
    $ZodNumber.init(inst, def); // no format checks
});
const $ZodBoolean = /*@__PURE__*/ (/* unused pure expression or super */ null && (schemas_core.$constructor("$ZodBoolean", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.pattern = regexes.boolean;
    inst._zod.parse = (payload, _ctx) => {
        if (def.coerce)
            try {
                payload.value = Boolean(payload.value);
            }
            catch (_) { }
        const input = payload.value;
        if (typeof input === "boolean")
            return payload;
        payload.issues.push({
            expected: "boolean",
            code: "invalid_type",
            input,
            inst,
        });
        return payload;
    };
})));
const $ZodBigInt = /*@__PURE__*/ (/* unused pure expression or super */ null && (schemas_core.$constructor("$ZodBigInt", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.pattern = regexes.bigint;
    inst._zod.parse = (payload, _ctx) => {
        if (def.coerce)
            try {
                payload.value = BigInt(payload.value);
            }
            catch (_) { }
        if (typeof payload.value === "bigint")
            return payload;
        payload.issues.push({
            expected: "bigint",
            code: "invalid_type",
            input: payload.value,
            inst,
        });
        return payload;
    };
})));
const $ZodBigIntFormat = /*@__PURE__*/ (/* unused pure expression or super */ null && (schemas_core.$constructor("$ZodBigIntFormat", (inst, def) => {
    checks.$ZodCheckBigIntFormat.init(inst, def);
    $ZodBigInt.init(inst, def); // no format checks
})));
const $ZodSymbol = /*@__PURE__*/ (/* unused pure expression or super */ null && (schemas_core.$constructor("$ZodSymbol", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload, _ctx) => {
        const input = payload.value;
        if (typeof input === "symbol")
            return payload;
        payload.issues.push({
            expected: "symbol",
            code: "invalid_type",
            input,
            inst,
        });
        return payload;
    };
})));
const $ZodUndefined = /*@__PURE__*/ (/* unused pure expression or super */ null && (schemas_core.$constructor("$ZodUndefined", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.pattern = regexes.undefined;
    inst._zod.values = new Set([undefined]);
    inst._zod.parse = (payload, _ctx) => {
        const input = payload.value;
        if (typeof input === "undefined")
            return payload;
        payload.issues.push({
            expected: "undefined",
            code: "invalid_type",
            input,
            inst,
        });
        return payload;
    };
})));
const $ZodNull = /*@__PURE__*/ (/* unused pure expression or super */ null && (schemas_core.$constructor("$ZodNull", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.pattern = regexes.null;
    inst._zod.values = new Set([null]);
    inst._zod.parse = (payload, _ctx) => {
        const input = payload.value;
        if (input === null)
            return payload;
        payload.issues.push({
            expected: "null",
            code: "invalid_type",
            input,
            inst,
        });
        return payload;
    };
})));
const $ZodAny = /*@__PURE__*/ (/* unused pure expression or super */ null && (schemas_core.$constructor("$ZodAny", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload) => payload;
})));
const $ZodUnknown = /*@__PURE__*/ $constructor("$ZodUnknown", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload) => payload;
});
const $ZodNever = /*@__PURE__*/ $constructor("$ZodNever", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload, _ctx) => {
        payload.issues.push({
            expected: "never",
            code: "invalid_type",
            input: payload.value,
            inst,
        });
        return payload;
    };
});
const $ZodVoid = /*@__PURE__*/ (/* unused pure expression or super */ null && (schemas_core.$constructor("$ZodVoid", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload, _ctx) => {
        const input = payload.value;
        if (typeof input === "undefined")
            return payload;
        payload.issues.push({
            expected: "void",
            code: "invalid_type",
            input,
            inst,
        });
        return payload;
    };
})));
const $ZodDate = /*@__PURE__*/ (/* unused pure expression or super */ null && (schemas_core.$constructor("$ZodDate", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload, _ctx) => {
        if (def.coerce) {
            try {
                payload.value = new Date(payload.value);
            }
            catch (_err) { }
        }
        const input = payload.value;
        const isDate = input instanceof Date;
        const isValidDate = isDate && !Number.isNaN(input.getTime());
        if (isValidDate)
            return payload;
        payload.issues.push({
            expected: "date",
            code: "invalid_type",
            input,
            ...(isDate ? { received: "Invalid Date" } : {}),
            inst,
        });
        return payload;
    };
})));
function handleArrayResult(result, final, index) {
    if (result.issues.length) {
        final.issues.push(...prefixIssues(index, result.issues));
    }
    final.value[index] = result.value;
}
const $ZodArray = /*@__PURE__*/ $constructor("$ZodArray", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload, ctx) => {
        const input = payload.value;
        if (!Array.isArray(input)) {
            payload.issues.push({
                expected: "array",
                code: "invalid_type",
                input,
                inst,
            });
            return payload;
        }
        payload.value = Array(input.length);
        const proms = [];
        for (let i = 0; i < input.length; i++) {
            const item = input[i];
            const result = def.element._zod.run({
                value: item,
                issues: [],
            }, ctx);
            if (result instanceof Promise) {
                proms.push(result.then((result) => handleArrayResult(result, payload, i)));
            }
            else {
                handleArrayResult(result, payload, i);
            }
        }
        if (proms.length) {
            return Promise.all(proms).then(() => payload);
        }
        return payload; //handleArrayResultsAsync(parseResults, final);
    };
});
function handlePropertyResult(result, final, key, input, isOptionalIn, isOptionalOut) {
    const isPresent = key in input;
    if (result.issues.length) {
        // For optional-in/out schemas, ignore errors on absent keys.
        if (isOptionalIn && isOptionalOut && !isPresent) {
            return;
        }
        final.issues.push(...prefixIssues(key, result.issues));
    }
    if (!isPresent && !isOptionalIn) {
        if (!result.issues.length) {
            final.issues.push({
                code: "invalid_type",
                expected: "nonoptional",
                input: undefined,
                path: [key],
            });
        }
        return;
    }
    if (result.value === undefined) {
        if (isPresent) {
            final.value[key] = undefined;
        }
    }
    else {
        final.value[key] = result.value;
    }
}
function normalizeDef(def) {
    const keys = Object.keys(def.shape);
    for (const k of keys) {
        if (!def.shape?.[k]?._zod?.traits?.has("$ZodType")) {
            throw new Error(`Invalid element at key "${k}": expected a Zod schema`);
        }
    }
    const okeys = optionalKeys(def.shape);
    return {
        ...def,
        keys,
        keySet: new Set(keys),
        numKeys: keys.length,
        optionalKeys: new Set(okeys),
    };
}
function handleCatchall(proms, input, payload, ctx, def, inst) {
    const unrecognized = [];
    const keySet = def.keySet;
    const _catchall = def.catchall._zod;
    const t = _catchall.def.type;
    const isOptionalIn = _catchall.optin === "optional";
    const isOptionalOut = _catchall.optout === "optional";
    for (const key in input) {
        // skip __proto__ so it can't replace the result prototype via the
        // assignment setter on the plain {} we build into
        if (key === "__proto__")
            continue;
        if (keySet.has(key))
            continue;
        if (t === "never") {
            unrecognized.push(key);
            continue;
        }
        const r = _catchall.run({ value: input[key], issues: [] }, ctx);
        if (r instanceof Promise) {
            proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut)));
        }
        else {
            handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut);
        }
    }
    if (unrecognized.length) {
        payload.issues.push({
            code: "unrecognized_keys",
            keys: unrecognized,
            input,
            inst,
        });
    }
    if (!proms.length)
        return payload;
    return Promise.all(proms).then(() => {
        return payload;
    });
}
const $ZodObject = /*@__PURE__*/ $constructor("$ZodObject", (inst, def) => {
    // requires cast because technically $ZodObject doesn't extend
    $ZodType.init(inst, def);
    // const sh = def.shape;
    const desc = Object.getOwnPropertyDescriptor(def, "shape");
    if (!desc?.get) {
        const sh = def.shape;
        Object.defineProperty(def, "shape", {
            get: () => {
                const newSh = { ...sh };
                Object.defineProperty(def, "shape", {
                    value: newSh,
                });
                return newSh;
            },
        });
    }
    const _normalized = cached(() => normalizeDef(def));
    defineLazy(inst._zod, "propValues", () => {
        const shape = def.shape;
        const propValues = {};
        for (const key in shape) {
            const field = shape[key]._zod;
            if (field.values) {
                propValues[key] ?? (propValues[key] = new Set());
                for (const v of field.values)
                    propValues[key].add(v);
            }
        }
        return propValues;
    });
    const isObject = util_isObject;
    const catchall = def.catchall;
    let value;
    inst._zod.parse = (payload, ctx) => {
        value ?? (value = _normalized.value);
        const input = payload.value;
        if (!isObject(input)) {
            payload.issues.push({
                expected: "object",
                code: "invalid_type",
                input,
                inst,
            });
            return payload;
        }
        payload.value = {};
        const proms = [];
        const shape = value.shape;
        for (const key of value.keys) {
            const el = shape[key];
            const isOptionalIn = el._zod.optin === "optional";
            const isOptionalOut = el._zod.optout === "optional";
            const r = el._zod.run({ value: input[key], issues: [] }, ctx);
            if (r instanceof Promise) {
                proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut)));
            }
            else {
                handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut);
            }
        }
        if (!catchall) {
            return proms.length ? Promise.all(proms).then(() => payload) : payload;
        }
        return handleCatchall(proms, input, payload, ctx, _normalized.value, inst);
    };
});
const $ZodObjectJIT = /*@__PURE__*/ $constructor("$ZodObjectJIT", (inst, def) => {
    // requires cast because technically $ZodObject doesn't extend
    $ZodObject.init(inst, def);
    const superParse = inst._zod.parse;
    const _normalized = cached(() => normalizeDef(def));
    const generateFastpass = (shape) => {
        const doc = new Doc(["shape", "payload", "ctx"]);
        const normalized = _normalized.value;
        const parseStr = (key) => {
            const k = esc(key);
            return `shape[${k}]._zod.run({ value: input[${k}], issues: [] }, ctx)`;
        };
        doc.write(`const input = payload.value;`);
        const ids = Object.create(null);
        let counter = 0;
        for (const key of normalized.keys) {
            ids[key] = `key_${counter++}`;
        }
        // A: preserve key order {
        doc.write(`const newResult = {};`);
        for (const key of normalized.keys) {
            const id = ids[key];
            const k = esc(key);
            const schema = shape[key];
            const isOptionalIn = schema?._zod?.optin === "optional";
            const isOptionalOut = schema?._zod?.optout === "optional";
            doc.write(`const ${id} = ${parseStr(key)};`);
            if (isOptionalIn && isOptionalOut) {
                // For optional-in/out schemas, ignore errors on absent keys
                doc.write(`
        if (${id}.issues.length) {
          if (${k} in input) {
            payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${k}, ...iss.path] : [${k}]
            })));
          }
        }
        
        if (${id}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }
        
      `);
            }
            else if (!isOptionalIn) {
                doc.write(`
        const ${id}_present = ${k} in input;
        if (${id}.issues.length) {
          payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${k}, ...iss.path] : [${k}]
          })));
        }
        if (!${id}_present && !${id}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${k}]
          });
        }

        if (${id}_present) {
          if (${id}.value === undefined) {
            newResult[${k}] = undefined;
          } else {
            newResult[${k}] = ${id}.value;
          }
        }

      `);
            }
            else {
                doc.write(`
        if (${id}.issues.length) {
          payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${k}, ...iss.path] : [${k}]
          })));
        }
        
        if (${id}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }
        
      `);
            }
        }
        doc.write(`payload.value = newResult;`);
        doc.write(`return payload;`);
        const fn = doc.compile();
        return (payload, ctx) => fn(shape, payload, ctx);
    };
    let fastpass;
    const isObject = util_isObject;
    const jit = !globalConfig.jitless;
    const allowsEval = util_allowsEval;
    const fastEnabled = jit && allowsEval.value; // && !def.catchall;
    const catchall = def.catchall;
    let value;
    inst._zod.parse = (payload, ctx) => {
        value ?? (value = _normalized.value);
        const input = payload.value;
        if (!isObject(input)) {
            payload.issues.push({
                expected: "object",
                code: "invalid_type",
                input,
                inst,
            });
            return payload;
        }
        if (jit && fastEnabled && ctx?.async === false && ctx.jitless !== true) {
            // always synchronous
            if (!fastpass)
                fastpass = generateFastpass(def.shape);
            payload = fastpass(payload, ctx);
            if (!catchall)
                return payload;
            return handleCatchall([], input, payload, ctx, value, inst);
        }
        return superParse(payload, ctx);
    };
});
function handleUnionResults(results, final, inst, ctx) {
    for (const result of results) {
        if (result.issues.length === 0) {
            final.value = result.value;
            return final;
        }
    }
    const nonaborted = results.filter((r) => !aborted(r));
    if (nonaborted.length === 1) {
        final.value = nonaborted[0].value;
        return nonaborted[0];
    }
    final.issues.push({
        code: "invalid_union",
        input: final.value,
        inst,
        errors: results.map((result) => result.issues.map((iss) => finalizeIssue(iss, ctx, config()))),
    });
    return final;
}
const $ZodUnion = /*@__PURE__*/ $constructor("$ZodUnion", (inst, def) => {
    $ZodType.init(inst, def);
    defineLazy(inst._zod, "optin", () => def.options.some((o) => o._zod.optin === "optional") ? "optional" : undefined);
    defineLazy(inst._zod, "optout", () => def.options.some((o) => o._zod.optout === "optional") ? "optional" : undefined);
    defineLazy(inst._zod, "values", () => {
        if (def.options.every((o) => o._zod.values)) {
            return new Set(def.options.flatMap((option) => Array.from(option._zod.values)));
        }
        return undefined;
    });
    defineLazy(inst._zod, "pattern", () => {
        if (def.options.every((o) => o._zod.pattern)) {
            const patterns = def.options.map((o) => o._zod.pattern);
            return new RegExp(`^(${patterns.map((p) => cleanRegex(p.source)).join("|")})$`);
        }
        return undefined;
    });
    const first = def.options.length === 1 ? def.options[0]._zod.run : null;
    inst._zod.parse = (payload, ctx) => {
        if (first) {
            return first(payload, ctx);
        }
        let async = false;
        const results = [];
        for (const option of def.options) {
            const result = option._zod.run({
                value: payload.value,
                issues: [],
            }, ctx);
            if (result instanceof Promise) {
                results.push(result);
                async = true;
            }
            else {
                if (result.issues.length === 0)
                    return result;
                results.push(result);
            }
        }
        if (!async)
            return handleUnionResults(results, payload, inst, ctx);
        return Promise.all(results).then((results) => {
            return handleUnionResults(results, payload, inst, ctx);
        });
    };
});
function handleExclusiveUnionResults(results, final, inst, ctx) {
    const successes = results.filter((r) => r.issues.length === 0);
    if (successes.length === 1) {
        final.value = successes[0].value;
        return final;
    }
    if (successes.length === 0) {
        // No matches - same as regular union
        final.issues.push({
            code: "invalid_union",
            input: final.value,
            inst,
            errors: results.map((result) => result.issues.map((iss) => schemas_util.finalizeIssue(iss, ctx, schemas_core.config()))),
        });
    }
    else {
        // Multiple matches - exclusive union failure
        final.issues.push({
            code: "invalid_union",
            input: final.value,
            inst,
            errors: [],
            inclusive: false,
        });
    }
    return final;
}
const $ZodXor = /*@__PURE__*/ (/* unused pure expression or super */ null && (schemas_core.$constructor("$ZodXor", (inst, def) => {
    $ZodUnion.init(inst, def);
    def.inclusive = false;
    const first = def.options.length === 1 ? def.options[0]._zod.run : null;
    inst._zod.parse = (payload, ctx) => {
        if (first) {
            return first(payload, ctx);
        }
        let async = false;
        const results = [];
        for (const option of def.options) {
            const result = option._zod.run({
                value: payload.value,
                issues: [],
            }, ctx);
            if (result instanceof Promise) {
                results.push(result);
                async = true;
            }
            else {
                results.push(result);
            }
        }
        if (!async)
            return handleExclusiveUnionResults(results, payload, inst, ctx);
        return Promise.all(results).then((results) => {
            return handleExclusiveUnionResults(results, payload, inst, ctx);
        });
    };
})));
const $ZodDiscriminatedUnion = 
/*@__PURE__*/
(/* unused pure expression or super */ null && (schemas_core.$constructor("$ZodDiscriminatedUnion", (inst, def) => {
    def.inclusive = false;
    $ZodUnion.init(inst, def);
    const _super = inst._zod.parse;
    schemas_util.defineLazy(inst._zod, "propValues", () => {
        const propValues = {};
        for (const option of def.options) {
            const pv = option._zod.propValues;
            if (!pv || Object.keys(pv).length === 0)
                throw new Error(`Invalid discriminated union option at index "${def.options.indexOf(option)}"`);
            for (const [k, v] of Object.entries(pv)) {
                if (!propValues[k])
                    propValues[k] = new Set();
                for (const val of v) {
                    propValues[k].add(val);
                }
            }
        }
        return propValues;
    });
    const disc = schemas_util.cached(() => {
        const opts = def.options;
        const map = new Map();
        for (const o of opts) {
            const values = o._zod.propValues?.[def.discriminator];
            if (!values || values.size === 0)
                throw new Error(`Invalid discriminated union option at index "${def.options.indexOf(o)}"`);
            for (const v of values) {
                if (map.has(v)) {
                    throw new Error(`Duplicate discriminator value "${String(v)}"`);
                }
                map.set(v, o);
            }
        }
        return map;
    });
    inst._zod.parse = (payload, ctx) => {
        const input = payload.value;
        if (!schemas_util.isObject(input)) {
            payload.issues.push({
                code: "invalid_type",
                expected: "object",
                input,
                inst,
            });
            return payload;
        }
        const opt = disc.value.get(input?.[def.discriminator]);
        if (opt) {
            return opt._zod.run(payload, ctx);
        }
        // Fall back to union matching when the fast discriminator path fails:
        // - explicitly enabled via unionFallback, or
        // - during backward direction (encode), since codec-based discriminators
        //   have different values in forward vs backward directions
        if (def.unionFallback || ctx.direction === "backward") {
            return _super(payload, ctx);
        }
        // no matching discriminator
        payload.issues.push({
            code: "invalid_union",
            errors: [],
            note: "No matching discriminator",
            discriminator: def.discriminator,
            options: Array.from(disc.value.keys()),
            input,
            path: [def.discriminator],
            inst,
        });
        return payload;
    };
})));
const $ZodIntersection = /*@__PURE__*/ $constructor("$ZodIntersection", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload, ctx) => {
        const input = payload.value;
        const left = def.left._zod.run({ value: input, issues: [] }, ctx);
        const right = def.right._zod.run({ value: input, issues: [] }, ctx);
        const async = left instanceof Promise || right instanceof Promise;
        if (async) {
            return Promise.all([left, right]).then(([left, right]) => {
                return handleIntersectionResults(payload, left, right);
            });
        }
        return handleIntersectionResults(payload, left, right);
    };
});
function mergeValues(a, b) {
    // const aType = parse.t(a);
    // const bType = parse.t(b);
    if (a === b) {
        return { valid: true, data: a };
    }
    if (a instanceof Date && b instanceof Date && +a === +b) {
        return { valid: true, data: a };
    }
    if (isPlainObject(a) && isPlainObject(b)) {
        const bKeys = Object.keys(b);
        const sharedKeys = Object.keys(a).filter((key) => bKeys.indexOf(key) !== -1);
        const newObj = { ...a, ...b };
        for (const key of sharedKeys) {
            const sharedValue = mergeValues(a[key], b[key]);
            if (!sharedValue.valid) {
                return {
                    valid: false,
                    mergeErrorPath: [key, ...sharedValue.mergeErrorPath],
                };
            }
            newObj[key] = sharedValue.data;
        }
        return { valid: true, data: newObj };
    }
    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) {
            return { valid: false, mergeErrorPath: [] };
        }
        const newArray = [];
        for (let index = 0; index < a.length; index++) {
            const itemA = a[index];
            const itemB = b[index];
            const sharedValue = mergeValues(itemA, itemB);
            if (!sharedValue.valid) {
                return {
                    valid: false,
                    mergeErrorPath: [index, ...sharedValue.mergeErrorPath],
                };
            }
            newArray.push(sharedValue.data);
        }
        return { valid: true, data: newArray };
    }
    return { valid: false, mergeErrorPath: [] };
}
function handleIntersectionResults(result, left, right) {
    // Track which side(s) report each key as unrecognized
    const unrecKeys = new Map();
    let unrecIssue;
    for (const iss of left.issues) {
        if (iss.code === "unrecognized_keys") {
            unrecIssue ?? (unrecIssue = iss);
            for (const k of iss.keys) {
                if (!unrecKeys.has(k))
                    unrecKeys.set(k, {});
                unrecKeys.get(k).l = true;
            }
        }
        else {
            result.issues.push(iss);
        }
    }
    for (const iss of right.issues) {
        if (iss.code === "unrecognized_keys") {
            for (const k of iss.keys) {
                if (!unrecKeys.has(k))
                    unrecKeys.set(k, {});
                unrecKeys.get(k).r = true;
            }
        }
        else {
            result.issues.push(iss);
        }
    }
    // Report only keys unrecognized by BOTH sides
    const bothKeys = [...unrecKeys].filter(([, f]) => f.l && f.r).map(([k]) => k);
    if (bothKeys.length && unrecIssue) {
        result.issues.push({ ...unrecIssue, keys: bothKeys });
    }
    if (aborted(result))
        return result;
    const merged = mergeValues(left.value, right.value);
    if (!merged.valid) {
        throw new Error(`Unmergable intersection. Error path: ` + `${JSON.stringify(merged.mergeErrorPath)}`);
    }
    result.value = merged.data;
    return result;
}
const $ZodTuple = /*@__PURE__*/ (/* unused pure expression or super */ null && (schemas_core.$constructor("$ZodTuple", (inst, def) => {
    $ZodType.init(inst, def);
    const items = def.items;
    inst._zod.parse = (payload, ctx) => {
        const input = payload.value;
        if (!Array.isArray(input)) {
            payload.issues.push({
                input,
                inst,
                expected: "tuple",
                code: "invalid_type",
            });
            return payload;
        }
        payload.value = [];
        const proms = [];
        const optinStart = getTupleOptStart(items, "optin");
        const optoutStart = getTupleOptStart(items, "optout");
        if (!def.rest) {
            if (input.length < optinStart) {
                payload.issues.push({
                    code: "too_small",
                    minimum: optinStart,
                    inclusive: true,
                    input,
                    inst,
                    origin: "array",
                });
                return payload;
            }
            if (input.length > items.length) {
                payload.issues.push({
                    code: "too_big",
                    maximum: items.length,
                    inclusive: true,
                    input,
                    inst,
                    origin: "array",
                });
            }
        }
        // Run every item in parallel, collecting results into an indexed
        // array. The post-processing in `handleTupleResults` walks them in
        // order so it can decide whether an absent optional-output error can
        // truncate the tail or must be reported to preserve required output.
        const itemResults = new Array(items.length);
        for (let i = 0; i < items.length; i++) {
            const r = items[i]._zod.run({ value: input[i], issues: [] }, ctx);
            if (r instanceof Promise) {
                proms.push(r.then((rr) => {
                    itemResults[i] = rr;
                }));
            }
            else {
                itemResults[i] = r;
            }
        }
        if (def.rest) {
            let i = items.length - 1;
            const rest = input.slice(items.length);
            for (const el of rest) {
                i++;
                const result = def.rest._zod.run({ value: el, issues: [] }, ctx);
                if (result instanceof Promise) {
                    proms.push(result.then((r) => handleTupleResult(r, payload, i)));
                }
                else {
                    handleTupleResult(result, payload, i);
                }
            }
        }
        if (proms.length) {
            return Promise.all(proms).then(() => handleTupleResults(itemResults, payload, items, input, optoutStart));
        }
        return handleTupleResults(itemResults, payload, items, input, optoutStart);
    };
})));
function getTupleOptStart(items, key) {
    for (let i = items.length - 1; i >= 0; i--) {
        if (items[i]._zod[key] !== "optional")
            return i + 1;
    }
    return 0;
}
function handleTupleResult(result, final, index) {
    if (result.issues.length) {
        final.issues.push(...schemas_util.prefixIssues(index, result.issues));
    }
    final.value[index] = result.value;
}
function handleTupleResults(itemResults, final, items, input, optoutStart) {
    // Walk results in order. Mirror $ZodObject's swallow-on-absent-optional
    // rule, but only after `optoutStart`: the first index where the output
    // tuple tail can be absent.
    for (let i = 0; i < items.length; i++) {
        const r = itemResults[i];
        const isPresent = i < input.length;
        if (r.issues.length) {
            if (!isPresent && i >= optoutStart) {
                final.value.length = i;
                break;
            }
            final.issues.push(...schemas_util.prefixIssues(i, r.issues));
        }
        final.value[i] = r.value;
    }
    // Drop trailing slots that produced `undefined` for absent input
    // (the array analog of an absent optional key on an object). The
    // `i >= input.length` floor is critical: an explicit `undefined`
    // *inside* the input must be preserved even when the schema is
    // optional-out (e.g. `z.string().or(z.undefined())` accepting an
    // explicit undefined value).
    for (let i = final.value.length - 1; i >= input.length; i--) {
        if (items[i]._zod.optout === "optional" && final.value[i] === undefined) {
            final.value.length = i;
        }
        else {
            break;
        }
    }
    return final;
}
const $ZodRecord = /*@__PURE__*/ (/* unused pure expression or super */ null && (schemas_core.$constructor("$ZodRecord", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload, ctx) => {
        const input = payload.value;
        if (!schemas_util.isPlainObject(input)) {
            payload.issues.push({
                expected: "record",
                code: "invalid_type",
                input,
                inst,
            });
            return payload;
        }
        const proms = [];
        const values = def.keyType._zod.values;
        if (values) {
            payload.value = {};
            const recordKeys = new Set();
            for (const key of values) {
                if (typeof key === "string" || typeof key === "number" || typeof key === "symbol") {
                    recordKeys.add(typeof key === "number" ? key.toString() : key);
                    const keyResult = def.keyType._zod.run({ value: key, issues: [] }, ctx);
                    if (keyResult instanceof Promise) {
                        throw new Error("Async schemas not supported in object keys currently");
                    }
                    if (keyResult.issues.length) {
                        payload.issues.push({
                            code: "invalid_key",
                            origin: "record",
                            issues: keyResult.issues.map((iss) => schemas_util.finalizeIssue(iss, ctx, schemas_core.config())),
                            input: key,
                            path: [key],
                            inst,
                        });
                        continue;
                    }
                    const outKey = keyResult.value;
                    const result = def.valueType._zod.run({ value: input[key], issues: [] }, ctx);
                    if (result instanceof Promise) {
                        proms.push(result.then((result) => {
                            if (result.issues.length) {
                                payload.issues.push(...schemas_util.prefixIssues(key, result.issues));
                            }
                            payload.value[outKey] = result.value;
                        }));
                    }
                    else {
                        if (result.issues.length) {
                            payload.issues.push(...schemas_util.prefixIssues(key, result.issues));
                        }
                        payload.value[outKey] = result.value;
                    }
                }
            }
            let unrecognized;
            for (const key in input) {
                if (!recordKeys.has(key)) {
                    unrecognized = unrecognized ?? [];
                    unrecognized.push(key);
                }
            }
            if (unrecognized && unrecognized.length > 0) {
                payload.issues.push({
                    code: "unrecognized_keys",
                    input,
                    inst,
                    keys: unrecognized,
                });
            }
        }
        else {
            payload.value = {};
            // Reflect.ownKeys for Symbol-key support; filter non-enumerable to match z.object()
            for (const key of Reflect.ownKeys(input)) {
                if (key === "__proto__")
                    continue;
                if (!Object.prototype.propertyIsEnumerable.call(input, key))
                    continue;
                let keyResult = def.keyType._zod.run({ value: key, issues: [] }, ctx);
                if (keyResult instanceof Promise) {
                    throw new Error("Async schemas not supported in object keys currently");
                }
                // Numeric string fallback: if key is a numeric string and failed, retry with Number(key)
                // This handles z.number(), z.literal([1, 2, 3]), and unions containing numeric literals
                const checkNumericKey = typeof key === "string" && regexes.number.test(key) && keyResult.issues.length;
                if (checkNumericKey) {
                    const retryResult = def.keyType._zod.run({ value: Number(key), issues: [] }, ctx);
                    if (retryResult instanceof Promise) {
                        throw new Error("Async schemas not supported in object keys currently");
                    }
                    if (retryResult.issues.length === 0) {
                        keyResult = retryResult;
                    }
                }
                if (keyResult.issues.length) {
                    if (def.mode === "loose") {
                        // Pass through unchanged
                        payload.value[key] = input[key];
                    }
                    else {
                        // Default "strict" behavior: error on invalid key
                        payload.issues.push({
                            code: "invalid_key",
                            origin: "record",
                            issues: keyResult.issues.map((iss) => schemas_util.finalizeIssue(iss, ctx, schemas_core.config())),
                            input: key,
                            path: [key],
                            inst,
                        });
                    }
                    continue;
                }
                const result = def.valueType._zod.run({ value: input[key], issues: [] }, ctx);
                if (result instanceof Promise) {
                    proms.push(result.then((result) => {
                        if (result.issues.length) {
                            payload.issues.push(...schemas_util.prefixIssues(key, result.issues));
                        }
                        payload.value[keyResult.value] = result.value;
                    }));
                }
                else {
                    if (result.issues.length) {
                        payload.issues.push(...schemas_util.prefixIssues(key, result.issues));
                    }
                    payload.value[keyResult.value] = result.value;
                }
            }
        }
        if (proms.length) {
            return Promise.all(proms).then(() => payload);
        }
        return payload;
    };
})));
const $ZodMap = /*@__PURE__*/ (/* unused pure expression or super */ null && (schemas_core.$constructor("$ZodMap", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload, ctx) => {
        const input = payload.value;
        if (!(input instanceof Map)) {
            payload.issues.push({
                expected: "map",
                code: "invalid_type",
                input,
                inst,
            });
            return payload;
        }
        const proms = [];
        payload.value = new Map();
        for (const [key, value] of input) {
            const keyResult = def.keyType._zod.run({ value: key, issues: [] }, ctx);
            const valueResult = def.valueType._zod.run({ value: value, issues: [] }, ctx);
            if (keyResult instanceof Promise || valueResult instanceof Promise) {
                proms.push(Promise.all([keyResult, valueResult]).then(([keyResult, valueResult]) => {
                    handleMapResult(keyResult, valueResult, payload, key, input, inst, ctx);
                }));
            }
            else {
                handleMapResult(keyResult, valueResult, payload, key, input, inst, ctx);
            }
        }
        if (proms.length)
            return Promise.all(proms).then(() => payload);
        return payload;
    };
})));
function handleMapResult(keyResult, valueResult, final, key, input, inst, ctx) {
    if (keyResult.issues.length) {
        if (schemas_util.propertyKeyTypes.has(typeof key)) {
            final.issues.push(...schemas_util.prefixIssues(key, keyResult.issues));
        }
        else {
            final.issues.push({
                code: "invalid_key",
                origin: "map",
                input,
                inst,
                issues: keyResult.issues.map((iss) => schemas_util.finalizeIssue(iss, ctx, schemas_core.config())),
            });
        }
    }
    if (valueResult.issues.length) {
        if (schemas_util.propertyKeyTypes.has(typeof key)) {
            final.issues.push(...schemas_util.prefixIssues(key, valueResult.issues));
        }
        else {
            final.issues.push({
                origin: "map",
                code: "invalid_element",
                input,
                inst,
                key: key,
                issues: valueResult.issues.map((iss) => schemas_util.finalizeIssue(iss, ctx, schemas_core.config())),
            });
        }
    }
    final.value.set(keyResult.value, valueResult.value);
}
const $ZodSet = /*@__PURE__*/ (/* unused pure expression or super */ null && (schemas_core.$constructor("$ZodSet", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload, ctx) => {
        const input = payload.value;
        if (!(input instanceof Set)) {
            payload.issues.push({
                input,
                inst,
                expected: "set",
                code: "invalid_type",
            });
            return payload;
        }
        const proms = [];
        payload.value = new Set();
        for (const item of input) {
            const result = def.valueType._zod.run({ value: item, issues: [] }, ctx);
            if (result instanceof Promise) {
                proms.push(result.then((result) => handleSetResult(result, payload)));
            }
            else
                handleSetResult(result, payload);
        }
        if (proms.length)
            return Promise.all(proms).then(() => payload);
        return payload;
    };
})));
function handleSetResult(result, final) {
    if (result.issues.length) {
        final.issues.push(...result.issues);
    }
    final.value.add(result.value);
}
const $ZodEnum = /*@__PURE__*/ $constructor("$ZodEnum", (inst, def) => {
    $ZodType.init(inst, def);
    const values = getEnumValues(def.entries);
    const valuesSet = new Set(values);
    inst._zod.values = valuesSet;
    inst._zod.pattern = new RegExp(`^(${values
        .filter((k) => propertyKeyTypes.has(typeof k))
        .map((o) => (typeof o === "string" ? escapeRegex(o) : o.toString()))
        .join("|")})$`);
    inst._zod.parse = (payload, _ctx) => {
        const input = payload.value;
        if (valuesSet.has(input)) {
            return payload;
        }
        payload.issues.push({
            code: "invalid_value",
            values,
            input,
            inst,
        });
        return payload;
    };
});
const $ZodLiteral = /*@__PURE__*/ $constructor("$ZodLiteral", (inst, def) => {
    $ZodType.init(inst, def);
    if (def.values.length === 0) {
        throw new Error("Cannot create literal schema with no valid values");
    }
    const values = new Set(def.values);
    inst._zod.values = values;
    inst._zod.pattern = new RegExp(`^(${def.values
        .map((o) => (typeof o === "string" ? escapeRegex(o) : o ? escapeRegex(o.toString()) : String(o)))
        .join("|")})$`);
    inst._zod.parse = (payload, _ctx) => {
        const input = payload.value;
        if (values.has(input)) {
            return payload;
        }
        payload.issues.push({
            code: "invalid_value",
            values: def.values,
            input,
            inst,
        });
        return payload;
    };
});
const $ZodFile = /*@__PURE__*/ (/* unused pure expression or super */ null && (schemas_core.$constructor("$ZodFile", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload, _ctx) => {
        const input = payload.value;
        // @ts-ignore
        if (input instanceof File)
            return payload;
        payload.issues.push({
            expected: "file",
            code: "invalid_type",
            input,
            inst,
        });
        return payload;
    };
})));
const $ZodTransform = /*@__PURE__*/ $constructor("$ZodTransform", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.optin = "optional";
    inst._zod.parse = (payload, ctx) => {
        if (ctx.direction === "backward") {
            throw new $ZodEncodeError(inst.constructor.name);
        }
        const _out = def.transform(payload.value, payload);
        if (ctx.async) {
            const output = _out instanceof Promise ? _out : Promise.resolve(_out);
            return output.then((output) => {
                payload.value = output;
                payload.fallback = true;
                return payload;
            });
        }
        if (_out instanceof Promise) {
            throw new $ZodAsyncError();
        }
        payload.value = _out;
        payload.fallback = true;
        return payload;
    };
});
function handleOptionalResult(result, input) {
    if (input === undefined && (result.issues.length || result.fallback)) {
        return { issues: [], value: undefined };
    }
    return result;
}
const $ZodOptional = /*@__PURE__*/ $constructor("$ZodOptional", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.optin = "optional";
    inst._zod.optout = "optional";
    defineLazy(inst._zod, "values", () => {
        return def.innerType._zod.values ? new Set([...def.innerType._zod.values, undefined]) : undefined;
    });
    defineLazy(inst._zod, "pattern", () => {
        const pattern = def.innerType._zod.pattern;
        return pattern ? new RegExp(`^(${cleanRegex(pattern.source)})?$`) : undefined;
    });
    inst._zod.parse = (payload, ctx) => {
        if (def.innerType._zod.optin === "optional") {
            const input = payload.value;
            const result = def.innerType._zod.run(payload, ctx);
            if (result instanceof Promise)
                return result.then((r) => handleOptionalResult(r, input));
            return handleOptionalResult(result, input);
        }
        if (payload.value === undefined) {
            return payload;
        }
        return def.innerType._zod.run(payload, ctx);
    };
});
const $ZodExactOptional = /*@__PURE__*/ $constructor("$ZodExactOptional", (inst, def) => {
    // Call parent init - inherits optin/optout = "optional"
    $ZodOptional.init(inst, def);
    // Override values/pattern to NOT add undefined
    defineLazy(inst._zod, "values", () => def.innerType._zod.values);
    defineLazy(inst._zod, "pattern", () => def.innerType._zod.pattern);
    // Override parse to just delegate (no undefined handling)
    inst._zod.parse = (payload, ctx) => {
        return def.innerType._zod.run(payload, ctx);
    };
});
const $ZodNullable = /*@__PURE__*/ $constructor("$ZodNullable", (inst, def) => {
    $ZodType.init(inst, def);
    defineLazy(inst._zod, "optin", () => def.innerType._zod.optin);
    defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
    defineLazy(inst._zod, "pattern", () => {
        const pattern = def.innerType._zod.pattern;
        return pattern ? new RegExp(`^(${cleanRegex(pattern.source)}|null)$`) : undefined;
    });
    defineLazy(inst._zod, "values", () => {
        return def.innerType._zod.values ? new Set([...def.innerType._zod.values, null]) : undefined;
    });
    inst._zod.parse = (payload, ctx) => {
        // Forward direction (decode): allow null to pass through
        if (payload.value === null)
            return payload;
        return def.innerType._zod.run(payload, ctx);
    };
});
const $ZodDefault = /*@__PURE__*/ $constructor("$ZodDefault", (inst, def) => {
    $ZodType.init(inst, def);
    // inst._zod.qin = "true";
    inst._zod.optin = "optional";
    defineLazy(inst._zod, "values", () => def.innerType._zod.values);
    inst._zod.parse = (payload, ctx) => {
        if (ctx.direction === "backward") {
            return def.innerType._zod.run(payload, ctx);
        }
        // Forward direction (decode): apply defaults for undefined input
        if (payload.value === undefined) {
            payload.value = def.defaultValue;
            /**
             * $ZodDefault returns the default value immediately in forward direction.
             * It doesn't pass the default value into the validator ("prefault"). There's no reason to pass the default value through validation. The validity of the default is enforced by TypeScript statically. Otherwise, it's the responsibility of the user to ensure the default is valid. In the case of pipes with divergent in/out types, you can specify the default on the `in` schema of your ZodPipe to set a "prefault" for the pipe.   */
            return payload;
        }
        // Forward direction: continue with default handling
        const result = def.innerType._zod.run(payload, ctx);
        if (result instanceof Promise) {
            return result.then((result) => handleDefaultResult(result, def));
        }
        return handleDefaultResult(result, def);
    };
});
function handleDefaultResult(payload, def) {
    if (payload.value === undefined) {
        payload.value = def.defaultValue;
    }
    return payload;
}
const $ZodPrefault = /*@__PURE__*/ $constructor("$ZodPrefault", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.optin = "optional";
    defineLazy(inst._zod, "values", () => def.innerType._zod.values);
    inst._zod.parse = (payload, ctx) => {
        if (ctx.direction === "backward") {
            return def.innerType._zod.run(payload, ctx);
        }
        // Forward direction (decode): apply prefault for undefined input
        if (payload.value === undefined) {
            payload.value = def.defaultValue;
        }
        return def.innerType._zod.run(payload, ctx);
    };
});
const $ZodNonOptional = /*@__PURE__*/ $constructor("$ZodNonOptional", (inst, def) => {
    $ZodType.init(inst, def);
    defineLazy(inst._zod, "values", () => {
        const v = def.innerType._zod.values;
        return v ? new Set([...v].filter((x) => x !== undefined)) : undefined;
    });
    inst._zod.parse = (payload, ctx) => {
        const result = def.innerType._zod.run(payload, ctx);
        if (result instanceof Promise) {
            return result.then((result) => handleNonOptionalResult(result, inst));
        }
        return handleNonOptionalResult(result, inst);
    };
});
function handleNonOptionalResult(payload, inst) {
    if (!payload.issues.length && payload.value === undefined) {
        payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: payload.value,
            inst,
        });
    }
    return payload;
}
const $ZodSuccess = /*@__PURE__*/ (/* unused pure expression or super */ null && (schemas_core.$constructor("$ZodSuccess", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload, ctx) => {
        if (ctx.direction === "backward") {
            throw new schemas_core.$ZodEncodeError("ZodSuccess");
        }
        const result = def.innerType._zod.run(payload, ctx);
        if (result instanceof Promise) {
            return result.then((result) => {
                payload.value = result.issues.length === 0;
                return payload;
            });
        }
        payload.value = result.issues.length === 0;
        return payload;
    };
})));
const $ZodCatch = /*@__PURE__*/ $constructor("$ZodCatch", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.optin = "optional";
    defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
    defineLazy(inst._zod, "values", () => def.innerType._zod.values);
    inst._zod.parse = (payload, ctx) => {
        if (ctx.direction === "backward") {
            return def.innerType._zod.run(payload, ctx);
        }
        // Forward direction (decode): apply catch logic
        const result = def.innerType._zod.run(payload, ctx);
        if (result instanceof Promise) {
            return result.then((result) => {
                payload.value = result.value;
                if (result.issues.length) {
                    payload.value = def.catchValue({
                        ...payload,
                        error: {
                            issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config())),
                        },
                        input: payload.value,
                    });
                    payload.issues = [];
                    payload.fallback = true;
                }
                return payload;
            });
        }
        payload.value = result.value;
        if (result.issues.length) {
            payload.value = def.catchValue({
                ...payload,
                error: {
                    issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config())),
                },
                input: payload.value,
            });
            payload.issues = [];
            payload.fallback = true;
        }
        return payload;
    };
});
const $ZodNaN = /*@__PURE__*/ (/* unused pure expression or super */ null && (schemas_core.$constructor("$ZodNaN", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload, _ctx) => {
        if (typeof payload.value !== "number" || !Number.isNaN(payload.value)) {
            payload.issues.push({
                input: payload.value,
                inst,
                expected: "nan",
                code: "invalid_type",
            });
            return payload;
        }
        return payload;
    };
})));
const $ZodPipe = /*@__PURE__*/ $constructor("$ZodPipe", (inst, def) => {
    $ZodType.init(inst, def);
    defineLazy(inst._zod, "values", () => def.in._zod.values);
    defineLazy(inst._zod, "optin", () => def.in._zod.optin);
    defineLazy(inst._zod, "optout", () => def.out._zod.optout);
    defineLazy(inst._zod, "propValues", () => def.in._zod.propValues);
    inst._zod.parse = (payload, ctx) => {
        if (ctx.direction === "backward") {
            const right = def.out._zod.run(payload, ctx);
            if (right instanceof Promise) {
                return right.then((right) => handlePipeResult(right, def.in, ctx));
            }
            return handlePipeResult(right, def.in, ctx);
        }
        const left = def.in._zod.run(payload, ctx);
        if (left instanceof Promise) {
            return left.then((left) => handlePipeResult(left, def.out, ctx));
        }
        return handlePipeResult(left, def.out, ctx);
    };
});
function handlePipeResult(left, next, ctx) {
    if (left.issues.length) {
        // prevent further checks
        left.aborted = true;
        return left;
    }
    return next._zod.run({ value: left.value, issues: left.issues, fallback: left.fallback }, ctx);
}
const $ZodCodec = /*@__PURE__*/ (/* unused pure expression or super */ null && (schemas_core.$constructor("$ZodCodec", (inst, def) => {
    $ZodType.init(inst, def);
    schemas_util.defineLazy(inst._zod, "values", () => def.in._zod.values);
    schemas_util.defineLazy(inst._zod, "optin", () => def.in._zod.optin);
    schemas_util.defineLazy(inst._zod, "optout", () => def.out._zod.optout);
    schemas_util.defineLazy(inst._zod, "propValues", () => def.in._zod.propValues);
    inst._zod.parse = (payload, ctx) => {
        const direction = ctx.direction || "forward";
        if (direction === "forward") {
            const left = def.in._zod.run(payload, ctx);
            if (left instanceof Promise) {
                return left.then((left) => handleCodecAResult(left, def, ctx));
            }
            return handleCodecAResult(left, def, ctx);
        }
        else {
            const right = def.out._zod.run(payload, ctx);
            if (right instanceof Promise) {
                return right.then((right) => handleCodecAResult(right, def, ctx));
            }
            return handleCodecAResult(right, def, ctx);
        }
    };
})));
function handleCodecAResult(result, def, ctx) {
    if (result.issues.length) {
        // prevent further checks
        result.aborted = true;
        return result;
    }
    const direction = ctx.direction || "forward";
    if (direction === "forward") {
        const transformed = def.transform(result.value, result);
        if (transformed instanceof Promise) {
            return transformed.then((value) => handleCodecTxResult(result, value, def.out, ctx));
        }
        return handleCodecTxResult(result, transformed, def.out, ctx);
    }
    else {
        const transformed = def.reverseTransform(result.value, result);
        if (transformed instanceof Promise) {
            return transformed.then((value) => handleCodecTxResult(result, value, def.in, ctx));
        }
        return handleCodecTxResult(result, transformed, def.in, ctx);
    }
}
function handleCodecTxResult(left, value, nextSchema, ctx) {
    // Check if transform added any issues
    if (left.issues.length) {
        left.aborted = true;
        return left;
    }
    return nextSchema._zod.run({ value, issues: left.issues }, ctx);
}
const $ZodPreprocess = /*@__PURE__*/ (/* unused pure expression or super */ null && (schemas_core.$constructor("$ZodPreprocess", (inst, def) => {
    $ZodPipe.init(inst, def);
})));
const $ZodReadonly = /*@__PURE__*/ $constructor("$ZodReadonly", (inst, def) => {
    $ZodType.init(inst, def);
    defineLazy(inst._zod, "propValues", () => def.innerType._zod.propValues);
    defineLazy(inst._zod, "values", () => def.innerType._zod.values);
    defineLazy(inst._zod, "optin", () => def.innerType?._zod?.optin);
    defineLazy(inst._zod, "optout", () => def.innerType?._zod?.optout);
    inst._zod.parse = (payload, ctx) => {
        if (ctx.direction === "backward") {
            return def.innerType._zod.run(payload, ctx);
        }
        const result = def.innerType._zod.run(payload, ctx);
        if (result instanceof Promise) {
            return result.then(handleReadonlyResult);
        }
        return handleReadonlyResult(result);
    };
});
function handleReadonlyResult(payload) {
    payload.value = Object.freeze(payload.value);
    return payload;
}
const $ZodTemplateLiteral = /*@__PURE__*/ (/* unused pure expression or super */ null && (schemas_core.$constructor("$ZodTemplateLiteral", (inst, def) => {
    $ZodType.init(inst, def);
    const regexParts = [];
    for (const part of def.parts) {
        if (typeof part === "object" && part !== null) {
            // is Zod schema
            if (!part._zod.pattern) {
                // if (!source)
                throw new Error(`Invalid template literal part, no pattern found: ${[...part._zod.traits].shift()}`);
            }
            const source = part._zod.pattern instanceof RegExp ? part._zod.pattern.source : part._zod.pattern;
            if (!source)
                throw new Error(`Invalid template literal part: ${part._zod.traits}`);
            const start = source.startsWith("^") ? 1 : 0;
            const end = source.endsWith("$") ? source.length - 1 : source.length;
            regexParts.push(source.slice(start, end));
        }
        else if (part === null || schemas_util.primitiveTypes.has(typeof part)) {
            regexParts.push(schemas_util.escapeRegex(`${part}`));
        }
        else {
            throw new Error(`Invalid template literal part: ${part}`);
        }
    }
    inst._zod.pattern = new RegExp(`^${regexParts.join("")}$`);
    inst._zod.parse = (payload, _ctx) => {
        if (typeof payload.value !== "string") {
            payload.issues.push({
                input: payload.value,
                inst,
                expected: "string",
                code: "invalid_type",
            });
            return payload;
        }
        inst._zod.pattern.lastIndex = 0;
        if (!inst._zod.pattern.test(payload.value)) {
            payload.issues.push({
                input: payload.value,
                inst,
                code: "invalid_format",
                format: def.format ?? "template_literal",
                pattern: inst._zod.pattern.source,
            });
            return payload;
        }
        return payload;
    };
})));
const $ZodFunction = /*@__PURE__*/ (/* unused pure expression or super */ null && (schemas_core.$constructor("$ZodFunction", (inst, def) => {
    $ZodType.init(inst, def);
    inst._def = def;
    inst._zod.def = def;
    inst.implement = (func) => {
        if (typeof func !== "function") {
            throw new Error("implement() must be called with a function");
        }
        return function (...args) {
            const parsedArgs = inst._def.input ? schemas_parse(inst._def.input, args) : args;
            const result = Reflect.apply(func, this, parsedArgs);
            if (inst._def.output) {
                return schemas_parse(inst._def.output, result);
            }
            return result;
        };
    };
    inst.implementAsync = (func) => {
        if (typeof func !== "function") {
            throw new Error("implementAsync() must be called with a function");
        }
        return async function (...args) {
            const parsedArgs = inst._def.input ? await schemas_parseAsync(inst._def.input, args) : args;
            const result = await Reflect.apply(func, this, parsedArgs);
            if (inst._def.output) {
                return await schemas_parseAsync(inst._def.output, result);
            }
            return result;
        };
    };
    inst._zod.parse = (payload, _ctx) => {
        if (typeof payload.value !== "function") {
            payload.issues.push({
                code: "invalid_type",
                expected: "function",
                input: payload.value,
                inst,
            });
            return payload;
        }
        // Check if output is a promise type to determine if we should use async implementation
        const hasPromiseOutput = inst._def.output && inst._def.output._zod.def.type === "promise";
        if (hasPromiseOutput) {
            payload.value = inst.implementAsync(payload.value);
        }
        else {
            payload.value = inst.implement(payload.value);
        }
        return payload;
    };
    inst.input = (...args) => {
        const F = inst.constructor;
        if (Array.isArray(args[0])) {
            return new F({
                type: "function",
                input: new $ZodTuple({
                    type: "tuple",
                    items: args[0],
                    rest: args[1],
                }),
                output: inst._def.output,
            });
        }
        return new F({
            type: "function",
            input: args[0],
            output: inst._def.output,
        });
    };
    inst.output = (output) => {
        const F = inst.constructor;
        return new F({
            type: "function",
            input: inst._def.input,
            output,
        });
    };
    return inst;
})));
const $ZodPromise = /*@__PURE__*/ (/* unused pure expression or super */ null && (schemas_core.$constructor("$ZodPromise", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload, ctx) => {
        return Promise.resolve(payload.value).then((inner) => def.innerType._zod.run({ value: inner, issues: [] }, ctx));
    };
})));
const $ZodLazy = /*@__PURE__*/ (/* unused pure expression or super */ null && (schemas_core.$constructor("$ZodLazy", (inst, def) => {
    $ZodType.init(inst, def);
    // Cache the resolved inner type on the shared `def` so all clones of this
    // lazy (e.g. via `.describe()`/`.meta()`) share the same inner instance,
    // preserving identity for cycle detection on recursive schemas.
    schemas_util.defineLazy(inst._zod, "innerType", () => {
        const d = def;
        if (!d._cachedInner)
            d._cachedInner = def.getter();
        return d._cachedInner;
    });
    schemas_util.defineLazy(inst._zod, "pattern", () => inst._zod.innerType?._zod?.pattern);
    schemas_util.defineLazy(inst._zod, "propValues", () => inst._zod.innerType?._zod?.propValues);
    schemas_util.defineLazy(inst._zod, "optin", () => inst._zod.innerType?._zod?.optin ?? undefined);
    schemas_util.defineLazy(inst._zod, "optout", () => inst._zod.innerType?._zod?.optout ?? undefined);
    inst._zod.parse = (payload, ctx) => {
        const inner = inst._zod.innerType;
        return inner._zod.run(payload, ctx);
    };
})));
const $ZodCustom = /*@__PURE__*/ $constructor("$ZodCustom", (inst, def) => {
    $ZodCheck.init(inst, def);
    $ZodType.init(inst, def);
    inst._zod.parse = (payload, _) => {
        return payload;
    };
    inst._zod.check = (payload) => {
        const input = payload.value;
        const r = def.fn(input);
        if (r instanceof Promise) {
            return r.then((r) => handleRefineResult(r, payload, input, inst));
        }
        handleRefineResult(r, payload, input, inst);
        return;
    };
});
function handleRefineResult(result, payload, input, inst) {
    if (!result) {
        const _iss = {
            code: "custom",
            input,
            inst, // incorporates params.error into issue reporting
            path: [...(inst._zod.def.path ?? [])], // incorporates params.error into issue reporting
            continue: !inst._zod.def.abort,
            // params: inst._zod.def.params,
        };
        if (inst._zod.def.params)
            _iss.params = inst._zod.def.params;
        payload.issues.push(util_issue(_iss));
    }
}

;// ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/registries.js
var registries_a;
const $output = Symbol("ZodOutput");
const $input = Symbol("ZodInput");
class $ZodRegistry {
    constructor() {
        this._map = new WeakMap();
        this._idmap = new Map();
    }
    add(schema, ..._meta) {
        const meta = _meta[0];
        this._map.set(schema, meta);
        if (meta && typeof meta === "object" && "id" in meta) {
            this._idmap.set(meta.id, schema);
        }
        return this;
    }
    clear() {
        this._map = new WeakMap();
        this._idmap = new Map();
        return this;
    }
    remove(schema) {
        const meta = this._map.get(schema);
        if (meta && typeof meta === "object" && "id" in meta) {
            this._idmap.delete(meta.id);
        }
        this._map.delete(schema);
        return this;
    }
    get(schema) {
        // return this._map.get(schema) as any;
        // inherit metadata
        const p = schema._zod.parent;
        if (p) {
            const pm = { ...(this.get(p) ?? {}) };
            delete pm.id; // do not inherit id
            const f = { ...pm, ...this._map.get(schema) };
            return Object.keys(f).length ? f : undefined;
        }
        return this._map.get(schema);
    }
    has(schema) {
        return this._map.has(schema);
    }
}
// registries
function registry() {
    return new $ZodRegistry();
}
(registries_a = globalThis).__zod_globalRegistry ?? (registries_a.__zod_globalRegistry = registry());
const globalRegistry = globalThis.__zod_globalRegistry;

;// ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/api.js
/* unused harmony import specifier */ var api_checks;
/* unused harmony import specifier */ var schemas;
/* unused harmony import specifier */ var api_util;




// @__NO_SIDE_EFFECTS__
function _string(Class, params) {
    return new Class({
        type: "string",
        ...normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _coercedString(Class, params) {
    return new Class({
        type: "string",
        coerce: true,
        ...api_util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _email(Class, params) {
    return new Class({
        type: "string",
        format: "email",
        check: "string_format",
        abort: false,
        ...normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _guid(Class, params) {
    return new Class({
        type: "string",
        format: "guid",
        check: "string_format",
        abort: false,
        ...normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _uuid(Class, params) {
    return new Class({
        type: "string",
        format: "uuid",
        check: "string_format",
        abort: false,
        ...normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _uuidv4(Class, params) {
    return new Class({
        type: "string",
        format: "uuid",
        check: "string_format",
        abort: false,
        version: "v4",
        ...normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _uuidv6(Class, params) {
    return new Class({
        type: "string",
        format: "uuid",
        check: "string_format",
        abort: false,
        version: "v6",
        ...normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _uuidv7(Class, params) {
    return new Class({
        type: "string",
        format: "uuid",
        check: "string_format",
        abort: false,
        version: "v7",
        ...normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _url(Class, params) {
    return new Class({
        type: "string",
        format: "url",
        check: "string_format",
        abort: false,
        ...normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function api_emoji(Class, params) {
    return new Class({
        type: "string",
        format: "emoji",
        check: "string_format",
        abort: false,
        ...normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _nanoid(Class, params) {
    return new Class({
        type: "string",
        format: "nanoid",
        check: "string_format",
        abort: false,
        ...normalizeParams(params),
    });
}
/**
 * @deprecated CUID v1 is deprecated by its authors due to information leakage
 * (timestamps embedded in the id). Use {@link _cuid2} instead.
 * See https://github.com/paralleldrive/cuid.
 */
// @__NO_SIDE_EFFECTS__
function _cuid(Class, params) {
    return new Class({
        type: "string",
        format: "cuid",
        check: "string_format",
        abort: false,
        ...normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _cuid2(Class, params) {
    return new Class({
        type: "string",
        format: "cuid2",
        check: "string_format",
        abort: false,
        ...normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _ulid(Class, params) {
    return new Class({
        type: "string",
        format: "ulid",
        check: "string_format",
        abort: false,
        ...normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _xid(Class, params) {
    return new Class({
        type: "string",
        format: "xid",
        check: "string_format",
        abort: false,
        ...normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _ksuid(Class, params) {
    return new Class({
        type: "string",
        format: "ksuid",
        check: "string_format",
        abort: false,
        ...normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _ipv4(Class, params) {
    return new Class({
        type: "string",
        format: "ipv4",
        check: "string_format",
        abort: false,
        ...normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _ipv6(Class, params) {
    return new Class({
        type: "string",
        format: "ipv6",
        check: "string_format",
        abort: false,
        ...normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _mac(Class, params) {
    return new Class({
        type: "string",
        format: "mac",
        check: "string_format",
        abort: false,
        ...api_util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _cidrv4(Class, params) {
    return new Class({
        type: "string",
        format: "cidrv4",
        check: "string_format",
        abort: false,
        ...normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _cidrv6(Class, params) {
    return new Class({
        type: "string",
        format: "cidrv6",
        check: "string_format",
        abort: false,
        ...normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _base64(Class, params) {
    return new Class({
        type: "string",
        format: "base64",
        check: "string_format",
        abort: false,
        ...normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _base64url(Class, params) {
    return new Class({
        type: "string",
        format: "base64url",
        check: "string_format",
        abort: false,
        ...normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _e164(Class, params) {
    return new Class({
        type: "string",
        format: "e164",
        check: "string_format",
        abort: false,
        ...normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _jwt(Class, params) {
    return new Class({
        type: "string",
        format: "jwt",
        check: "string_format",
        abort: false,
        ...normalizeParams(params),
    });
}
const TimePrecision = {
    Any: null,
    Minute: -1,
    Second: 0,
    Millisecond: 3,
    Microsecond: 6,
};
// @__NO_SIDE_EFFECTS__
function _isoDateTime(Class, params) {
    return new Class({
        type: "string",
        format: "datetime",
        check: "string_format",
        offset: false,
        local: false,
        precision: null,
        ...normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _isoDate(Class, params) {
    return new Class({
        type: "string",
        format: "date",
        check: "string_format",
        ...normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _isoTime(Class, params) {
    return new Class({
        type: "string",
        format: "time",
        check: "string_format",
        precision: null,
        ...normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _isoDuration(Class, params) {
    return new Class({
        type: "string",
        format: "duration",
        check: "string_format",
        ...normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _number(Class, params) {
    return new Class({
        type: "number",
        checks: [],
        ...normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _coercedNumber(Class, params) {
    return new Class({
        type: "number",
        coerce: true,
        checks: [],
        ...api_util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _int(Class, params) {
    return new Class({
        type: "number",
        check: "number_format",
        abort: false,
        format: "safeint",
        ...normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _float32(Class, params) {
    return new Class({
        type: "number",
        check: "number_format",
        abort: false,
        format: "float32",
        ...api_util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _float64(Class, params) {
    return new Class({
        type: "number",
        check: "number_format",
        abort: false,
        format: "float64",
        ...api_util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _int32(Class, params) {
    return new Class({
        type: "number",
        check: "number_format",
        abort: false,
        format: "int32",
        ...api_util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _uint32(Class, params) {
    return new Class({
        type: "number",
        check: "number_format",
        abort: false,
        format: "uint32",
        ...api_util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _boolean(Class, params) {
    return new Class({
        type: "boolean",
        ...api_util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _coercedBoolean(Class, params) {
    return new Class({
        type: "boolean",
        coerce: true,
        ...api_util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _bigint(Class, params) {
    return new Class({
        type: "bigint",
        ...api_util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _coercedBigint(Class, params) {
    return new Class({
        type: "bigint",
        coerce: true,
        ...api_util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _int64(Class, params) {
    return new Class({
        type: "bigint",
        check: "bigint_format",
        abort: false,
        format: "int64",
        ...api_util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _uint64(Class, params) {
    return new Class({
        type: "bigint",
        check: "bigint_format",
        abort: false,
        format: "uint64",
        ...api_util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _symbol(Class, params) {
    return new Class({
        type: "symbol",
        ...api_util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function api_undefined(Class, params) {
    return new Class({
        type: "undefined",
        ...api_util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function api_null(Class, params) {
    return new Class({
        type: "null",
        ...api_util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _any(Class) {
    return new Class({
        type: "any",
    });
}
// @__NO_SIDE_EFFECTS__
function _unknown(Class) {
    return new Class({
        type: "unknown",
    });
}
// @__NO_SIDE_EFFECTS__
function _never(Class, params) {
    return new Class({
        type: "never",
        ...normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _void(Class, params) {
    return new Class({
        type: "void",
        ...api_util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _date(Class, params) {
    return new Class({
        type: "date",
        ...api_util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _coercedDate(Class, params) {
    return new Class({
        type: "date",
        coerce: true,
        ...api_util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _nan(Class, params) {
    return new Class({
        type: "nan",
        ...api_util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _lt(value, params) {
    return new $ZodCheckLessThan({
        check: "less_than",
        ...normalizeParams(params),
        value,
        inclusive: false,
    });
}
// @__NO_SIDE_EFFECTS__
function _lte(value, params) {
    return new $ZodCheckLessThan({
        check: "less_than",
        ...normalizeParams(params),
        value,
        inclusive: true,
    });
}

// @__NO_SIDE_EFFECTS__
function _gt(value, params) {
    return new $ZodCheckGreaterThan({
        check: "greater_than",
        ...normalizeParams(params),
        value,
        inclusive: false,
    });
}
// @__NO_SIDE_EFFECTS__
function _gte(value, params) {
    return new $ZodCheckGreaterThan({
        check: "greater_than",
        ...normalizeParams(params),
        value,
        inclusive: true,
    });
}

// @__NO_SIDE_EFFECTS__
function _positive(params) {
    return _gt(0, params);
}
// negative
// @__NO_SIDE_EFFECTS__
function _negative(params) {
    return _lt(0, params);
}
// nonpositive
// @__NO_SIDE_EFFECTS__
function _nonpositive(params) {
    return _lte(0, params);
}
// nonnegative
// @__NO_SIDE_EFFECTS__
function _nonnegative(params) {
    return _gte(0, params);
}
// @__NO_SIDE_EFFECTS__
function _multipleOf(value, params) {
    return new $ZodCheckMultipleOf({
        check: "multiple_of",
        ...normalizeParams(params),
        value,
    });
}
// @__NO_SIDE_EFFECTS__
function _maxSize(maximum, params) {
    return new api_checks.$ZodCheckMaxSize({
        check: "max_size",
        ...api_util.normalizeParams(params),
        maximum,
    });
}
// @__NO_SIDE_EFFECTS__
function _minSize(minimum, params) {
    return new api_checks.$ZodCheckMinSize({
        check: "min_size",
        ...api_util.normalizeParams(params),
        minimum,
    });
}
// @__NO_SIDE_EFFECTS__
function _size(size, params) {
    return new api_checks.$ZodCheckSizeEquals({
        check: "size_equals",
        ...api_util.normalizeParams(params),
        size,
    });
}
// @__NO_SIDE_EFFECTS__
function _maxLength(maximum, params) {
    const ch = new $ZodCheckMaxLength({
        check: "max_length",
        ...normalizeParams(params),
        maximum,
    });
    return ch;
}
// @__NO_SIDE_EFFECTS__
function _minLength(minimum, params) {
    return new $ZodCheckMinLength({
        check: "min_length",
        ...normalizeParams(params),
        minimum,
    });
}
// @__NO_SIDE_EFFECTS__
function _length(length, params) {
    return new $ZodCheckLengthEquals({
        check: "length_equals",
        ...normalizeParams(params),
        length,
    });
}
// @__NO_SIDE_EFFECTS__
function _regex(pattern, params) {
    return new $ZodCheckRegex({
        check: "string_format",
        format: "regex",
        ...normalizeParams(params),
        pattern,
    });
}
// @__NO_SIDE_EFFECTS__
function _lowercase(params) {
    return new $ZodCheckLowerCase({
        check: "string_format",
        format: "lowercase",
        ...normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _uppercase(params) {
    return new $ZodCheckUpperCase({
        check: "string_format",
        format: "uppercase",
        ...normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _includes(includes, params) {
    return new $ZodCheckIncludes({
        check: "string_format",
        format: "includes",
        ...normalizeParams(params),
        includes,
    });
}
// @__NO_SIDE_EFFECTS__
function _startsWith(prefix, params) {
    return new $ZodCheckStartsWith({
        check: "string_format",
        format: "starts_with",
        ...normalizeParams(params),
        prefix,
    });
}
// @__NO_SIDE_EFFECTS__
function _endsWith(suffix, params) {
    return new $ZodCheckEndsWith({
        check: "string_format",
        format: "ends_with",
        ...normalizeParams(params),
        suffix,
    });
}
// @__NO_SIDE_EFFECTS__
function _property(property, schema, params) {
    return new api_checks.$ZodCheckProperty({
        check: "property",
        property,
        schema,
        ...api_util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _mime(types, params) {
    return new api_checks.$ZodCheckMimeType({
        check: "mime_type",
        mime: types,
        ...api_util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _overwrite(tx) {
    return new $ZodCheckOverwrite({
        check: "overwrite",
        tx,
    });
}
// normalize
// @__NO_SIDE_EFFECTS__
function _normalize(form) {
    return _overwrite((input) => input.normalize(form));
}
// trim
// @__NO_SIDE_EFFECTS__
function _trim() {
    return _overwrite((input) => input.trim());
}
// toLowerCase
// @__NO_SIDE_EFFECTS__
function _toLowerCase() {
    return _overwrite((input) => input.toLowerCase());
}
// toUpperCase
// @__NO_SIDE_EFFECTS__
function _toUpperCase() {
    return _overwrite((input) => input.toUpperCase());
}
// slugify
// @__NO_SIDE_EFFECTS__
function _slugify() {
    return _overwrite((input) => slugify(input));
}
// @__NO_SIDE_EFFECTS__
function _array(Class, element, params) {
    return new Class({
        type: "array",
        element,
        // get element() {
        //   return element;
        // },
        ...normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _union(Class, options, params) {
    return new Class({
        type: "union",
        options,
        ...api_util.normalizeParams(params),
    });
}
function _xor(Class, options, params) {
    return new Class({
        type: "union",
        options,
        inclusive: false,
        ...api_util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _discriminatedUnion(Class, discriminator, options, params) {
    return new Class({
        type: "union",
        options,
        discriminator,
        ...api_util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _intersection(Class, left, right) {
    return new Class({
        type: "intersection",
        left,
        right,
    });
}
// export function _tuple(
//   Class: util.SchemaClass<schemas.$ZodTuple>,
//   items: [],
//   params?: string | $ZodTupleParams
// ): schemas.$ZodTuple<[], null>;
// @__NO_SIDE_EFFECTS__
function _tuple(Class, items, _paramsOrRest, _params) {
    const hasRest = _paramsOrRest instanceof schemas.$ZodType;
    const params = hasRest ? _params : _paramsOrRest;
    const rest = hasRest ? _paramsOrRest : null;
    return new Class({
        type: "tuple",
        items,
        rest,
        ...api_util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _record(Class, keyType, valueType, params) {
    return new Class({
        type: "record",
        keyType,
        valueType,
        ...api_util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _map(Class, keyType, valueType, params) {
    return new Class({
        type: "map",
        keyType,
        valueType,
        ...api_util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _set(Class, valueType, params) {
    return new Class({
        type: "set",
        valueType,
        ...api_util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _enum(Class, values, params) {
    const entries = Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values;
    // if (Array.isArray(values)) {
    //   for (const value of values) {
    //     entries[value] = value;
    //   }
    // } else {
    //   Object.assign(entries, values);
    // }
    // const entries: util.EnumLike = {};
    // for (const val of values) {
    //   entries[val] = val;
    // }
    return new Class({
        type: "enum",
        entries,
        ...api_util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
/** @deprecated This API has been merged into `z.enum()`. Use `z.enum()` instead.
 *
 * ```ts
 * enum Colors { red, green, blue }
 * z.enum(Colors);
 * ```
 */
function _nativeEnum(Class, entries, params) {
    return new Class({
        type: "enum",
        entries,
        ...api_util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _literal(Class, value, params) {
    return new Class({
        type: "literal",
        values: Array.isArray(value) ? value : [value],
        ...api_util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _file(Class, params) {
    return new Class({
        type: "file",
        ...api_util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _transform(Class, fn) {
    return new Class({
        type: "transform",
        transform: fn,
    });
}
// @__NO_SIDE_EFFECTS__
function _optional(Class, innerType) {
    return new Class({
        type: "optional",
        innerType,
    });
}
// @__NO_SIDE_EFFECTS__
function _nullable(Class, innerType) {
    return new Class({
        type: "nullable",
        innerType,
    });
}
// @__NO_SIDE_EFFECTS__
function _default(Class, innerType, defaultValue) {
    return new Class({
        type: "default",
        innerType,
        get defaultValue() {
            return typeof defaultValue === "function" ? defaultValue() : api_util.shallowClone(defaultValue);
        },
    });
}
// @__NO_SIDE_EFFECTS__
function _nonoptional(Class, innerType, params) {
    return new Class({
        type: "nonoptional",
        innerType,
        ...api_util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _success(Class, innerType) {
    return new Class({
        type: "success",
        innerType,
    });
}
// @__NO_SIDE_EFFECTS__
function _catch(Class, innerType, catchValue) {
    return new Class({
        type: "catch",
        innerType,
        catchValue: (typeof catchValue === "function" ? catchValue : () => catchValue),
    });
}
// @__NO_SIDE_EFFECTS__
function _pipe(Class, in_, out) {
    return new Class({
        type: "pipe",
        in: in_,
        out,
    });
}
// @__NO_SIDE_EFFECTS__
function _readonly(Class, innerType) {
    return new Class({
        type: "readonly",
        innerType,
    });
}
// @__NO_SIDE_EFFECTS__
function _templateLiteral(Class, parts, params) {
    return new Class({
        type: "template_literal",
        parts,
        ...api_util.normalizeParams(params),
    });
}
// @__NO_SIDE_EFFECTS__
function _lazy(Class, getter) {
    return new Class({
        type: "lazy",
        getter,
    });
}
// @__NO_SIDE_EFFECTS__
function _promise(Class, innerType) {
    return new Class({
        type: "promise",
        innerType,
    });
}
// @__NO_SIDE_EFFECTS__
function _custom(Class, fn, _params) {
    const norm = api_util.normalizeParams(_params);
    norm.abort ?? (norm.abort = true); // default to abort:false
    const schema = new Class({
        type: "custom",
        check: "custom",
        fn: fn,
        ...norm,
    });
    return schema;
}
// same as _custom but defaults to abort:false
// @__NO_SIDE_EFFECTS__
function _refine(Class, fn, _params) {
    const schema = new Class({
        type: "custom",
        check: "custom",
        fn: fn,
        ...normalizeParams(_params),
    });
    return schema;
}
// @__NO_SIDE_EFFECTS__
function _superRefine(fn, params) {
    const ch = _check((payload) => {
        payload.addIssue = (issue) => {
            if (typeof issue === "string") {
                payload.issues.push(util_issue(issue, payload.value, ch._zod.def));
            }
            else {
                // for Zod 3 backwards compatibility
                const _issue = issue;
                if (_issue.fatal)
                    _issue.continue = false;
                _issue.code ?? (_issue.code = "custom");
                _issue.input ?? (_issue.input = payload.value);
                _issue.inst ?? (_issue.inst = ch);
                _issue.continue ?? (_issue.continue = !ch._zod.def.abort); // abort is always undefined, so this is always true...
                payload.issues.push(util_issue(_issue));
            }
        };
        return fn(payload.value, payload);
    }, params);
    return ch;
}
// @__NO_SIDE_EFFECTS__
function _check(fn, params) {
    const ch = new $ZodCheck({
        check: "custom",
        ...normalizeParams(params),
    });
    ch._zod.check = fn;
    return ch;
}
// @__NO_SIDE_EFFECTS__
function describe(description) {
    const ch = new $ZodCheck({ check: "describe" });
    ch._zod.onattach = [
        (inst) => {
            const existing = globalRegistry.get(inst) ?? {};
            globalRegistry.add(inst, { ...existing, description });
        },
    ];
    ch._zod.check = () => { }; // no-op check
    return ch;
}
// @__NO_SIDE_EFFECTS__
function meta(metadata) {
    const ch = new $ZodCheck({ check: "meta" });
    ch._zod.onattach = [
        (inst) => {
            const existing = globalRegistry.get(inst) ?? {};
            globalRegistry.add(inst, { ...existing, ...metadata });
        },
    ];
    ch._zod.check = () => { }; // no-op check
    return ch;
}
// @__NO_SIDE_EFFECTS__
function _stringbool(Classes, _params) {
    const params = api_util.normalizeParams(_params);
    let truthyArray = params.truthy ?? ["true", "1", "yes", "on", "y", "enabled"];
    let falsyArray = params.falsy ?? ["false", "0", "no", "off", "n", "disabled"];
    if (params.case !== "sensitive") {
        truthyArray = truthyArray.map((v) => (typeof v === "string" ? v.toLowerCase() : v));
        falsyArray = falsyArray.map((v) => (typeof v === "string" ? v.toLowerCase() : v));
    }
    const truthySet = new Set(truthyArray);
    const falsySet = new Set(falsyArray);
    const _Codec = Classes.Codec ?? schemas.$ZodCodec;
    const _Boolean = Classes.Boolean ?? schemas.$ZodBoolean;
    const _String = Classes.String ?? schemas.$ZodString;
    const stringSchema = new _String({ type: "string", error: params.error });
    const booleanSchema = new _Boolean({ type: "boolean", error: params.error });
    const codec = new _Codec({
        type: "pipe",
        in: stringSchema,
        out: booleanSchema,
        transform: ((input, payload) => {
            let data = input;
            if (params.case !== "sensitive")
                data = data.toLowerCase();
            if (truthySet.has(data)) {
                return true;
            }
            else if (falsySet.has(data)) {
                return false;
            }
            else {
                payload.issues.push({
                    code: "invalid_value",
                    expected: "stringbool",
                    values: [...truthySet, ...falsySet],
                    input: payload.value,
                    inst: codec,
                    continue: false,
                });
                return {};
            }
        }),
        reverseTransform: ((input, _payload) => {
            if (input === true) {
                return truthyArray[0] || "true";
            }
            else {
                return falsyArray[0] || "false";
            }
        }),
        error: params.error,
    });
    return codec;
}
// @__NO_SIDE_EFFECTS__
function _stringFormat(Class, format, fnOrRegex, _params = {}) {
    const params = api_util.normalizeParams(_params);
    const def = {
        ...api_util.normalizeParams(_params),
        check: "string_format",
        type: "string",
        format,
        fn: typeof fnOrRegex === "function" ? fnOrRegex : (val) => fnOrRegex.test(val),
        ...params,
    };
    if (fnOrRegex instanceof RegExp) {
        def.pattern = fnOrRegex;
    }
    const inst = new Class(def);
    return inst;
}

;// ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/to-json-schema.js

// function initializeContext<T extends schemas.$ZodType>(inputs: JSONSchemaGeneratorParams<T>): ToJSONSchemaContext<T> {
//   return {
//     processor: inputs.processor,
//     metadataRegistry: inputs.metadata ?? globalRegistry,
//     target: inputs.target ?? "draft-2020-12",
//     unrepresentable: inputs.unrepresentable ?? "throw",
//   };
// }
function initializeContext(params) {
    // Normalize target: convert old non-hyphenated versions to hyphenated versions
    let target = params?.target ?? "draft-2020-12";
    if (target === "draft-4")
        target = "draft-04";
    if (target === "draft-7")
        target = "draft-07";
    return {
        processors: params.processors ?? {},
        metadataRegistry: params?.metadata ?? globalRegistry,
        target,
        unrepresentable: params?.unrepresentable ?? "throw",
        override: params?.override ?? (() => { }),
        io: params?.io ?? "output",
        counter: 0,
        seen: new Map(),
        cycles: params?.cycles ?? "ref",
        reused: params?.reused ?? "inline",
        external: params?.external ?? undefined,
    };
}
function process(schema, ctx, _params = { path: [], schemaPath: [] }) {
    var _a;
    const def = schema._zod.def;
    // check for schema in seens
    const seen = ctx.seen.get(schema);
    if (seen) {
        seen.count++;
        // check if cycle
        const isCycle = _params.schemaPath.includes(schema);
        if (isCycle) {
            seen.cycle = _params.path;
        }
        return seen.schema;
    }
    // initialize
    const result = { schema: {}, count: 1, cycle: undefined, path: _params.path };
    ctx.seen.set(schema, result);
    // custom method overrides default behavior
    const overrideSchema = schema._zod.toJSONSchema?.();
    if (overrideSchema) {
        result.schema = overrideSchema;
    }
    else {
        const params = {
            ..._params,
            schemaPath: [..._params.schemaPath, schema],
            path: _params.path,
        };
        if (schema._zod.processJSONSchema) {
            schema._zod.processJSONSchema(ctx, result.schema, params);
        }
        else {
            const _json = result.schema;
            const processor = ctx.processors[def.type];
            if (!processor) {
                throw new Error(`[toJSONSchema]: Non-representable type encountered: ${def.type}`);
            }
            processor(schema, ctx, _json, params);
        }
        const parent = schema._zod.parent;
        if (parent) {
            // Also set ref if processor didn't (for inheritance)
            if (!result.ref)
                result.ref = parent;
            process(parent, ctx, params);
            ctx.seen.get(parent).isParent = true;
        }
    }
    // metadata
    const meta = ctx.metadataRegistry.get(schema);
    if (meta)
        Object.assign(result.schema, meta);
    if (ctx.io === "input" && isTransforming(schema)) {
        // examples/defaults only apply to output type of pipe
        delete result.schema.examples;
        delete result.schema.default;
    }
    // set prefault as default
    if (ctx.io === "input" && "_prefault" in result.schema)
        (_a = result.schema).default ?? (_a.default = result.schema._prefault);
    delete result.schema._prefault;
    // pulling fresh from ctx.seen in case it was overwritten
    const _result = ctx.seen.get(schema);
    return _result.schema;
}
function extractDefs(ctx, schema
// params: EmitParams
) {
    // iterate over seen map;
    const root = ctx.seen.get(schema);
    if (!root)
        throw new Error("Unprocessed schema. This is a bug in Zod.");
    // Track ids to detect duplicates across different schemas
    const idToSchema = new Map();
    for (const entry of ctx.seen.entries()) {
        const id = ctx.metadataRegistry.get(entry[0])?.id;
        if (id) {
            const existing = idToSchema.get(id);
            if (existing && existing !== entry[0]) {
                throw new Error(`Duplicate schema id "${id}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
            }
            idToSchema.set(id, entry[0]);
        }
    }
    // returns a ref to the schema
    // defId will be empty if the ref points to an external schema (or #)
    const makeURI = (entry) => {
        // comparing the seen objects because sometimes
        // multiple schemas map to the same seen object.
        // e.g. lazy
        // external is configured
        const defsSegment = ctx.target === "draft-2020-12" ? "$defs" : "definitions";
        if (ctx.external) {
            const externalId = ctx.external.registry.get(entry[0])?.id; // ?? "__shared";// `__schema${ctx.counter++}`;
            // check if schema is in the external registry
            const uriGenerator = ctx.external.uri ?? ((id) => id);
            if (externalId) {
                return { ref: uriGenerator(externalId) };
            }
            // otherwise, add to __shared
            const id = entry[1].defId ?? entry[1].schema.id ?? `schema${ctx.counter++}`;
            entry[1].defId = id; // set defId so it will be reused if needed
            return { defId: id, ref: `${uriGenerator("__shared")}#/${defsSegment}/${id}` };
        }
        if (entry[1] === root) {
            return { ref: "#" };
        }
        // self-contained schema
        const uriPrefix = `#`;
        const defUriPrefix = `${uriPrefix}/${defsSegment}/`;
        const defId = entry[1].schema.id ?? `__schema${ctx.counter++}`;
        return { defId, ref: defUriPrefix + defId };
    };
    // stored cached version in `def` property
    // remove all properties, set $ref
    const extractToDef = (entry) => {
        // if the schema is already a reference, do not extract it
        if (entry[1].schema.$ref) {
            return;
        }
        const seen = entry[1];
        const { ref, defId } = makeURI(entry);
        seen.def = { ...seen.schema };
        // defId won't be set if the schema is a reference to an external schema
        // or if the schema is the root schema
        if (defId)
            seen.defId = defId;
        // wipe away all properties except $ref
        const schema = seen.schema;
        for (const key in schema) {
            delete schema[key];
        }
        schema.$ref = ref;
    };
    // throw on cycles
    // break cycles
    if (ctx.cycles === "throw") {
        for (const entry of ctx.seen.entries()) {
            const seen = entry[1];
            if (seen.cycle) {
                throw new Error("Cycle detected: " +
                    `#/${seen.cycle?.join("/")}/<root>` +
                    '\n\nSet the `cycles` parameter to `"ref"` to resolve cyclical schemas with defs.');
            }
        }
    }
    // extract schemas into $defs
    for (const entry of ctx.seen.entries()) {
        const seen = entry[1];
        // convert root schema to # $ref
        if (schema === entry[0]) {
            extractToDef(entry); // this has special handling for the root schema
            continue;
        }
        // extract schemas that are in the external registry
        if (ctx.external) {
            const ext = ctx.external.registry.get(entry[0])?.id;
            if (schema !== entry[0] && ext) {
                extractToDef(entry);
                continue;
            }
        }
        // extract schemas with `id` meta
        const id = ctx.metadataRegistry.get(entry[0])?.id;
        if (id) {
            extractToDef(entry);
            continue;
        }
        // break cycles
        if (seen.cycle) {
            // any
            extractToDef(entry);
            continue;
        }
        // extract reused schemas
        if (seen.count > 1) {
            if (ctx.reused === "ref") {
                extractToDef(entry);
                // biome-ignore lint:
                continue;
            }
        }
    }
}
function finalize(ctx, schema) {
    const root = ctx.seen.get(schema);
    if (!root)
        throw new Error("Unprocessed schema. This is a bug in Zod.");
    // flatten refs - inherit properties from parent schemas
    const flattenRef = (zodSchema) => {
        const seen = ctx.seen.get(zodSchema);
        // already processed
        if (seen.ref === null)
            return;
        const schema = seen.def ?? seen.schema;
        const _cached = { ...schema };
        const ref = seen.ref;
        seen.ref = null; // prevent infinite recursion
        if (ref) {
            flattenRef(ref);
            const refSeen = ctx.seen.get(ref);
            const refSchema = refSeen.schema;
            // merge referenced schema into current
            if (refSchema.$ref && (ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0")) {
                // older drafts can't combine $ref with other properties
                schema.allOf = schema.allOf ?? [];
                schema.allOf.push(refSchema);
            }
            else {
                Object.assign(schema, refSchema);
            }
            // restore child's own properties (child wins)
            Object.assign(schema, _cached);
            const isParentRef = zodSchema._zod.parent === ref;
            // For parent chain, child is a refinement - remove parent-only properties
            if (isParentRef) {
                for (const key in schema) {
                    if (key === "$ref" || key === "allOf")
                        continue;
                    if (!(key in _cached)) {
                        delete schema[key];
                    }
                }
            }
            // When ref was extracted to $defs, remove properties that match the definition
            if (refSchema.$ref && refSeen.def) {
                for (const key in schema) {
                    if (key === "$ref" || key === "allOf")
                        continue;
                    if (key in refSeen.def && JSON.stringify(schema[key]) === JSON.stringify(refSeen.def[key])) {
                        delete schema[key];
                    }
                }
            }
        }
        // If parent was extracted (has $ref), propagate $ref to this schema
        // This handles cases like: readonly().meta({id}).describe()
        // where processor sets ref to innerType but parent should be referenced
        const parent = zodSchema._zod.parent;
        if (parent && parent !== ref) {
            // Ensure parent is processed first so its def has inherited properties
            flattenRef(parent);
            const parentSeen = ctx.seen.get(parent);
            if (parentSeen?.schema.$ref) {
                schema.$ref = parentSeen.schema.$ref;
                // De-duplicate with parent's definition
                if (parentSeen.def) {
                    for (const key in schema) {
                        if (key === "$ref" || key === "allOf")
                            continue;
                        if (key in parentSeen.def && JSON.stringify(schema[key]) === JSON.stringify(parentSeen.def[key])) {
                            delete schema[key];
                        }
                    }
                }
            }
        }
        // execute overrides
        ctx.override({
            zodSchema: zodSchema,
            jsonSchema: schema,
            path: seen.path ?? [],
        });
    };
    for (const entry of [...ctx.seen.entries()].reverse()) {
        flattenRef(entry[0]);
    }
    const result = {};
    if (ctx.target === "draft-2020-12") {
        result.$schema = "https://json-schema.org/draft/2020-12/schema";
    }
    else if (ctx.target === "draft-07") {
        result.$schema = "http://json-schema.org/draft-07/schema#";
    }
    else if (ctx.target === "draft-04") {
        result.$schema = "http://json-schema.org/draft-04/schema#";
    }
    else if (ctx.target === "openapi-3.0") {
        // OpenAPI 3.0 schema objects should not include a $schema property
    }
    else {
        // Arbitrary string values are allowed but won't have a $schema property set
    }
    if (ctx.external?.uri) {
        const id = ctx.external.registry.get(schema)?.id;
        if (!id)
            throw new Error("Schema is missing an `id` property");
        result.$id = ctx.external.uri(id);
    }
    Object.assign(result, root.def ?? root.schema);
    // The `id` in `.meta()` is a Zod-specific registration tag used to extract
    // schemas into $defs — it is not user-facing JSON Schema metadata. Strip it
    // from the output body where it would otherwise leak. The id is preserved
    // implicitly via the $defs key (and via $ref paths).
    const rootMetaId = ctx.metadataRegistry.get(schema)?.id;
    if (rootMetaId !== undefined && result.id === rootMetaId)
        delete result.id;
    // build defs object
    const defs = ctx.external?.defs ?? {};
    for (const entry of ctx.seen.entries()) {
        const seen = entry[1];
        if (seen.def && seen.defId) {
            if (seen.def.id === seen.defId)
                delete seen.def.id;
            defs[seen.defId] = seen.def;
        }
    }
    // set definitions in result
    if (ctx.external) {
    }
    else {
        if (Object.keys(defs).length > 0) {
            if (ctx.target === "draft-2020-12") {
                result.$defs = defs;
            }
            else {
                result.definitions = defs;
            }
        }
    }
    try {
        // this "finalizes" this schema and ensures all cycles are removed
        // each call to finalize() is functionally independent
        // though the seen map is shared
        const finalized = JSON.parse(JSON.stringify(result));
        Object.defineProperty(finalized, "~standard", {
            value: {
                ...schema["~standard"],
                jsonSchema: {
                    input: createStandardJSONSchemaMethod(schema, "input", ctx.processors),
                    output: createStandardJSONSchemaMethod(schema, "output", ctx.processors),
                },
            },
            enumerable: false,
            writable: false,
        });
        return finalized;
    }
    catch (_err) {
        throw new Error("Error converting schema to JSON.");
    }
}
function isTransforming(_schema, _ctx) {
    const ctx = _ctx ?? { seen: new Set() };
    if (ctx.seen.has(_schema))
        return false;
    ctx.seen.add(_schema);
    const def = _schema._zod.def;
    if (def.type === "transform")
        return true;
    if (def.type === "array")
        return isTransforming(def.element, ctx);
    if (def.type === "set")
        return isTransforming(def.valueType, ctx);
    if (def.type === "lazy")
        return isTransforming(def.getter(), ctx);
    if (def.type === "promise" ||
        def.type === "optional" ||
        def.type === "nonoptional" ||
        def.type === "nullable" ||
        def.type === "readonly" ||
        def.type === "default" ||
        def.type === "prefault") {
        return isTransforming(def.innerType, ctx);
    }
    if (def.type === "intersection") {
        return isTransforming(def.left, ctx) || isTransforming(def.right, ctx);
    }
    if (def.type === "record" || def.type === "map") {
        return isTransforming(def.keyType, ctx) || isTransforming(def.valueType, ctx);
    }
    if (def.type === "pipe") {
        if (_schema._zod.traits.has("$ZodCodec"))
            return true;
        return isTransforming(def.in, ctx) || isTransforming(def.out, ctx);
    }
    if (def.type === "object") {
        for (const key in def.shape) {
            if (isTransforming(def.shape[key], ctx))
                return true;
        }
        return false;
    }
    if (def.type === "union") {
        for (const option of def.options) {
            if (isTransforming(option, ctx))
                return true;
        }
        return false;
    }
    if (def.type === "tuple") {
        for (const item of def.items) {
            if (isTransforming(item, ctx))
                return true;
        }
        if (def.rest && isTransforming(def.rest, ctx))
            return true;
        return false;
    }
    return false;
}
/**
 * Creates a toJSONSchema method for a schema instance.
 * This encapsulates the logic of initializing context, processing, extracting defs, and finalizing.
 */
const createToJSONSchemaMethod = (schema, processors = {}) => (params) => {
    const ctx = initializeContext({ ...params, processors });
    process(schema, ctx);
    extractDefs(ctx, schema);
    return finalize(ctx, schema);
};
const createStandardJSONSchemaMethod = (schema, io, processors = {}) => (params) => {
    const { libraryOptions, target } = params ?? {};
    const ctx = initializeContext({ ...(libraryOptions ?? {}), target, io, processors });
    process(schema, ctx);
    extractDefs(ctx, schema);
    return finalize(ctx, schema);
};

;// ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/json-schema-processors.js
/* unused harmony import specifier */ var json_schema_processors_initializeContext;
/* unused harmony import specifier */ var json_schema_processors_process;
/* unused harmony import specifier */ var json_schema_processors_extractDefs;
/* unused harmony import specifier */ var json_schema_processors_finalize;


const formatMap = {
    guid: "uuid",
    url: "uri",
    datetime: "date-time",
    json_string: "json-string",
    regex: "", // do not set
};
// ==================== SIMPLE TYPE PROCESSORS ====================
const stringProcessor = (schema, ctx, _json, _params) => {
    const json = _json;
    json.type = "string";
    const { minimum, maximum, format, patterns, contentEncoding } = schema._zod
        .bag;
    if (typeof minimum === "number")
        json.minLength = minimum;
    if (typeof maximum === "number")
        json.maxLength = maximum;
    // custom pattern overrides format
    if (format) {
        json.format = formatMap[format] ?? format;
        if (json.format === "")
            delete json.format; // empty format is not valid
        // JSON Schema format: "time" requires a full time with offset or Z
        // z.iso.time() does not include timezone information, so format: "time" should never be used
        if (format === "time") {
            delete json.format;
        }
    }
    if (contentEncoding)
        json.contentEncoding = contentEncoding;
    if (patterns && patterns.size > 0) {
        const regexes = [...patterns];
        if (regexes.length === 1)
            json.pattern = regexes[0].source;
        else if (regexes.length > 1) {
            json.allOf = [
                ...regexes.map((regex) => ({
                    ...(ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0"
                        ? { type: "string" }
                        : {}),
                    pattern: regex.source,
                })),
            ];
        }
    }
};
const numberProcessor = (schema, ctx, _json, _params) => {
    const json = _json;
    const { minimum, maximum, format, multipleOf, exclusiveMaximum, exclusiveMinimum } = schema._zod.bag;
    if (typeof format === "string" && format.includes("int"))
        json.type = "integer";
    else
        json.type = "number";
    // when both minimum and exclusiveMinimum exist, pick the more restrictive one
    const exMin = typeof exclusiveMinimum === "number" && exclusiveMinimum >= (minimum ?? Number.NEGATIVE_INFINITY);
    const exMax = typeof exclusiveMaximum === "number" && exclusiveMaximum <= (maximum ?? Number.POSITIVE_INFINITY);
    const legacy = ctx.target === "draft-04" || ctx.target === "openapi-3.0";
    if (exMin) {
        if (legacy) {
            json.minimum = exclusiveMinimum;
            json.exclusiveMinimum = true;
        }
        else {
            json.exclusiveMinimum = exclusiveMinimum;
        }
    }
    else if (typeof minimum === "number") {
        json.minimum = minimum;
    }
    if (exMax) {
        if (legacy) {
            json.maximum = exclusiveMaximum;
            json.exclusiveMaximum = true;
        }
        else {
            json.exclusiveMaximum = exclusiveMaximum;
        }
    }
    else if (typeof maximum === "number") {
        json.maximum = maximum;
    }
    if (typeof multipleOf === "number")
        json.multipleOf = multipleOf;
};
const booleanProcessor = (_schema, _ctx, json, _params) => {
    json.type = "boolean";
};
const bigintProcessor = (_schema, ctx, _json, _params) => {
    if (ctx.unrepresentable === "throw") {
        throw new Error("BigInt cannot be represented in JSON Schema");
    }
};
const symbolProcessor = (_schema, ctx, _json, _params) => {
    if (ctx.unrepresentable === "throw") {
        throw new Error("Symbols cannot be represented in JSON Schema");
    }
};
const nullProcessor = (_schema, ctx, json, _params) => {
    if (ctx.target === "openapi-3.0") {
        json.type = "string";
        json.nullable = true;
        json.enum = [null];
    }
    else {
        json.type = "null";
    }
};
const undefinedProcessor = (_schema, ctx, _json, _params) => {
    if (ctx.unrepresentable === "throw") {
        throw new Error("Undefined cannot be represented in JSON Schema");
    }
};
const voidProcessor = (_schema, ctx, _json, _params) => {
    if (ctx.unrepresentable === "throw") {
        throw new Error("Void cannot be represented in JSON Schema");
    }
};
const neverProcessor = (_schema, _ctx, json, _params) => {
    json.not = {};
};
const anyProcessor = (_schema, _ctx, _json, _params) => {
    // empty schema accepts anything
};
const unknownProcessor = (_schema, _ctx, _json, _params) => {
    // empty schema accepts anything
};
const dateProcessor = (_schema, ctx, _json, _params) => {
    if (ctx.unrepresentable === "throw") {
        throw new Error("Date cannot be represented in JSON Schema");
    }
};
const enumProcessor = (schema, _ctx, json, _params) => {
    const def = schema._zod.def;
    const values = getEnumValues(def.entries);
    // Number enums can have both string and number values
    if (values.every((v) => typeof v === "number"))
        json.type = "number";
    if (values.every((v) => typeof v === "string"))
        json.type = "string";
    json.enum = values;
};
const literalProcessor = (schema, ctx, json, _params) => {
    const def = schema._zod.def;
    const vals = [];
    for (const val of def.values) {
        if (val === undefined) {
            if (ctx.unrepresentable === "throw") {
                throw new Error("Literal `undefined` cannot be represented in JSON Schema");
            }
            else {
                // do not add to vals
            }
        }
        else if (typeof val === "bigint") {
            if (ctx.unrepresentable === "throw") {
                throw new Error("BigInt literals cannot be represented in JSON Schema");
            }
            else {
                vals.push(Number(val));
            }
        }
        else {
            vals.push(val);
        }
    }
    if (vals.length === 0) {
        // do nothing (an undefined literal was stripped)
    }
    else if (vals.length === 1) {
        const val = vals[0];
        json.type = val === null ? "null" : typeof val;
        if (ctx.target === "draft-04" || ctx.target === "openapi-3.0") {
            json.enum = [val];
        }
        else {
            json.const = val;
        }
    }
    else {
        if (vals.every((v) => typeof v === "number"))
            json.type = "number";
        if (vals.every((v) => typeof v === "string"))
            json.type = "string";
        if (vals.every((v) => typeof v === "boolean"))
            json.type = "boolean";
        if (vals.every((v) => v === null))
            json.type = "null";
        json.enum = vals;
    }
};
const nanProcessor = (_schema, ctx, _json, _params) => {
    if (ctx.unrepresentable === "throw") {
        throw new Error("NaN cannot be represented in JSON Schema");
    }
};
const templateLiteralProcessor = (schema, _ctx, json, _params) => {
    const _json = json;
    const pattern = schema._zod.pattern;
    if (!pattern)
        throw new Error("Pattern not found in template literal");
    _json.type = "string";
    _json.pattern = pattern.source;
};
const fileProcessor = (schema, _ctx, json, _params) => {
    const _json = json;
    const file = {
        type: "string",
        format: "binary",
        contentEncoding: "binary",
    };
    const { minimum, maximum, mime } = schema._zod.bag;
    if (minimum !== undefined)
        file.minLength = minimum;
    if (maximum !== undefined)
        file.maxLength = maximum;
    if (mime) {
        if (mime.length === 1) {
            file.contentMediaType = mime[0];
            Object.assign(_json, file);
        }
        else {
            Object.assign(_json, file); // shared props at root
            _json.anyOf = mime.map((m) => ({ contentMediaType: m })); // only contentMediaType differs
        }
    }
    else {
        Object.assign(_json, file);
    }
};
const successProcessor = (_schema, _ctx, json, _params) => {
    json.type = "boolean";
};
const customProcessor = (_schema, ctx, _json, _params) => {
    if (ctx.unrepresentable === "throw") {
        throw new Error("Custom types cannot be represented in JSON Schema");
    }
};
const functionProcessor = (_schema, ctx, _json, _params) => {
    if (ctx.unrepresentable === "throw") {
        throw new Error("Function types cannot be represented in JSON Schema");
    }
};
const transformProcessor = (_schema, ctx, _json, _params) => {
    if (ctx.unrepresentable === "throw") {
        throw new Error("Transforms cannot be represented in JSON Schema");
    }
};
const mapProcessor = (_schema, ctx, _json, _params) => {
    if (ctx.unrepresentable === "throw") {
        throw new Error("Map cannot be represented in JSON Schema");
    }
};
const setProcessor = (_schema, ctx, _json, _params) => {
    if (ctx.unrepresentable === "throw") {
        throw new Error("Set cannot be represented in JSON Schema");
    }
};
// ==================== COMPOSITE TYPE PROCESSORS ====================
const arrayProcessor = (schema, ctx, _json, params) => {
    const json = _json;
    const def = schema._zod.def;
    const { minimum, maximum } = schema._zod.bag;
    if (typeof minimum === "number")
        json.minItems = minimum;
    if (typeof maximum === "number")
        json.maxItems = maximum;
    json.type = "array";
    json.items = process(def.element, ctx, {
        ...params,
        path: [...params.path, "items"],
    });
};
const objectProcessor = (schema, ctx, _json, params) => {
    const json = _json;
    const def = schema._zod.def;
    json.type = "object";
    json.properties = {};
    const shape = def.shape;
    for (const key in shape) {
        json.properties[key] = process(shape[key], ctx, {
            ...params,
            path: [...params.path, "properties", key],
        });
    }
    // required keys
    const allKeys = new Set(Object.keys(shape));
    const requiredKeys = new Set([...allKeys].filter((key) => {
        const v = def.shape[key]._zod;
        if (ctx.io === "input") {
            return v.optin === undefined;
        }
        else {
            return v.optout === undefined;
        }
    }));
    if (requiredKeys.size > 0) {
        json.required = Array.from(requiredKeys);
    }
    // catchall
    if (def.catchall?._zod.def.type === "never") {
        // strict
        json.additionalProperties = false;
    }
    else if (!def.catchall) {
        // regular
        if (ctx.io === "output")
            json.additionalProperties = false;
    }
    else if (def.catchall) {
        json.additionalProperties = process(def.catchall, ctx, {
            ...params,
            path: [...params.path, "additionalProperties"],
        });
    }
};
const unionProcessor = (schema, ctx, json, params) => {
    const def = schema._zod.def;
    // Exclusive unions (inclusive === false) use oneOf (exactly one match) instead of anyOf (one or more matches)
    // This includes both z.xor() and discriminated unions
    const isExclusive = def.inclusive === false;
    const options = def.options.map((x, i) => process(x, ctx, {
        ...params,
        path: [...params.path, isExclusive ? "oneOf" : "anyOf", i],
    }));
    if (isExclusive) {
        json.oneOf = options;
    }
    else {
        json.anyOf = options;
    }
};
const intersectionProcessor = (schema, ctx, json, params) => {
    const def = schema._zod.def;
    const a = process(def.left, ctx, {
        ...params,
        path: [...params.path, "allOf", 0],
    });
    const b = process(def.right, ctx, {
        ...params,
        path: [...params.path, "allOf", 1],
    });
    const isSimpleIntersection = (val) => "allOf" in val && Object.keys(val).length === 1;
    const allOf = [
        ...(isSimpleIntersection(a) ? a.allOf : [a]),
        ...(isSimpleIntersection(b) ? b.allOf : [b]),
    ];
    json.allOf = allOf;
};
const tupleProcessor = (schema, ctx, _json, params) => {
    const json = _json;
    const def = schema._zod.def;
    json.type = "array";
    const prefixPath = ctx.target === "draft-2020-12" ? "prefixItems" : "items";
    const restPath = ctx.target === "draft-2020-12" ? "items" : ctx.target === "openapi-3.0" ? "items" : "additionalItems";
    const prefixItems = def.items.map((x, i) => process(x, ctx, {
        ...params,
        path: [...params.path, prefixPath, i],
    }));
    const rest = def.rest
        ? process(def.rest, ctx, {
            ...params,
            path: [...params.path, restPath, ...(ctx.target === "openapi-3.0" ? [def.items.length] : [])],
        })
        : null;
    if (ctx.target === "draft-2020-12") {
        json.prefixItems = prefixItems;
        if (rest) {
            json.items = rest;
        }
    }
    else if (ctx.target === "openapi-3.0") {
        json.items = {
            anyOf: prefixItems,
        };
        if (rest) {
            json.items.anyOf.push(rest);
        }
        json.minItems = prefixItems.length;
        if (!rest) {
            json.maxItems = prefixItems.length;
        }
    }
    else {
        json.items = prefixItems;
        if (rest) {
            json.additionalItems = rest;
        }
    }
    // length
    const { minimum, maximum } = schema._zod.bag;
    if (typeof minimum === "number")
        json.minItems = minimum;
    if (typeof maximum === "number")
        json.maxItems = maximum;
};
const recordProcessor = (schema, ctx, _json, params) => {
    const json = _json;
    const def = schema._zod.def;
    json.type = "object";
    // For looseRecord with regex patterns, use patternProperties
    // This correctly represents "only validate keys matching the pattern" semantics
    // and composes well with allOf (intersections)
    const keyType = def.keyType;
    const keyBag = keyType._zod.bag;
    const patterns = keyBag?.patterns;
    if (def.mode === "loose" && patterns && patterns.size > 0) {
        // Use patternProperties for looseRecord with regex patterns
        const valueSchema = process(def.valueType, ctx, {
            ...params,
            path: [...params.path, "patternProperties", "*"],
        });
        json.patternProperties = {};
        for (const pattern of patterns) {
            json.patternProperties[pattern.source] = valueSchema;
        }
    }
    else {
        // Default behavior: use propertyNames + additionalProperties
        if (ctx.target === "draft-07" || ctx.target === "draft-2020-12") {
            json.propertyNames = process(def.keyType, ctx, {
                ...params,
                path: [...params.path, "propertyNames"],
            });
        }
        json.additionalProperties = process(def.valueType, ctx, {
            ...params,
            path: [...params.path, "additionalProperties"],
        });
    }
    // Add required for keys with discrete values (enum, literal, etc.)
    const keyValues = keyType._zod.values;
    if (keyValues) {
        const validKeyValues = [...keyValues].filter((v) => typeof v === "string" || typeof v === "number");
        if (validKeyValues.length > 0) {
            json.required = validKeyValues;
        }
    }
};
const nullableProcessor = (schema, ctx, json, params) => {
    const def = schema._zod.def;
    const inner = process(def.innerType, ctx, params);
    const seen = ctx.seen.get(schema);
    if (ctx.target === "openapi-3.0") {
        seen.ref = def.innerType;
        json.nullable = true;
    }
    else {
        json.anyOf = [inner, { type: "null" }];
    }
};
const nonoptionalProcessor = (schema, ctx, _json, params) => {
    const def = schema._zod.def;
    process(def.innerType, ctx, params);
    const seen = ctx.seen.get(schema);
    seen.ref = def.innerType;
};
const defaultProcessor = (schema, ctx, json, params) => {
    const def = schema._zod.def;
    process(def.innerType, ctx, params);
    const seen = ctx.seen.get(schema);
    seen.ref = def.innerType;
    json.default = JSON.parse(JSON.stringify(def.defaultValue));
};
const prefaultProcessor = (schema, ctx, json, params) => {
    const def = schema._zod.def;
    process(def.innerType, ctx, params);
    const seen = ctx.seen.get(schema);
    seen.ref = def.innerType;
    if (ctx.io === "input")
        json._prefault = JSON.parse(JSON.stringify(def.defaultValue));
};
const catchProcessor = (schema, ctx, json, params) => {
    const def = schema._zod.def;
    process(def.innerType, ctx, params);
    const seen = ctx.seen.get(schema);
    seen.ref = def.innerType;
    let catchValue;
    try {
        catchValue = def.catchValue(undefined);
    }
    catch {
        throw new Error("Dynamic catch values are not supported in JSON Schema");
    }
    json.default = catchValue;
};
const pipeProcessor = (schema, ctx, _json, params) => {
    const def = schema._zod.def;
    const inIsTransform = def.in._zod.traits.has("$ZodTransform");
    const innerType = ctx.io === "input" ? (inIsTransform ? def.out : def.in) : def.out;
    process(innerType, ctx, params);
    const seen = ctx.seen.get(schema);
    seen.ref = innerType;
};
const readonlyProcessor = (schema, ctx, json, params) => {
    const def = schema._zod.def;
    process(def.innerType, ctx, params);
    const seen = ctx.seen.get(schema);
    seen.ref = def.innerType;
    json.readOnly = true;
};
const promiseProcessor = (schema, ctx, _json, params) => {
    const def = schema._zod.def;
    process(def.innerType, ctx, params);
    const seen = ctx.seen.get(schema);
    seen.ref = def.innerType;
};
const optionalProcessor = (schema, ctx, _json, params) => {
    const def = schema._zod.def;
    process(def.innerType, ctx, params);
    const seen = ctx.seen.get(schema);
    seen.ref = def.innerType;
};
const lazyProcessor = (schema, ctx, _json, params) => {
    const innerType = schema._zod.innerType;
    process(innerType, ctx, params);
    const seen = ctx.seen.get(schema);
    seen.ref = innerType;
};
// ==================== ALL PROCESSORS ====================
const allProcessors = {
    string: stringProcessor,
    number: numberProcessor,
    boolean: booleanProcessor,
    bigint: bigintProcessor,
    symbol: symbolProcessor,
    null: nullProcessor,
    undefined: undefinedProcessor,
    void: voidProcessor,
    never: neverProcessor,
    any: anyProcessor,
    unknown: unknownProcessor,
    date: dateProcessor,
    enum: enumProcessor,
    literal: literalProcessor,
    nan: nanProcessor,
    template_literal: templateLiteralProcessor,
    file: fileProcessor,
    success: successProcessor,
    custom: customProcessor,
    function: functionProcessor,
    transform: transformProcessor,
    map: mapProcessor,
    set: setProcessor,
    array: arrayProcessor,
    object: objectProcessor,
    union: unionProcessor,
    intersection: intersectionProcessor,
    tuple: tupleProcessor,
    record: recordProcessor,
    nullable: nullableProcessor,
    nonoptional: nonoptionalProcessor,
    default: defaultProcessor,
    prefault: prefaultProcessor,
    catch: catchProcessor,
    pipe: pipeProcessor,
    readonly: readonlyProcessor,
    promise: promiseProcessor,
    optional: optionalProcessor,
    lazy: lazyProcessor,
};
function toJSONSchema(input, params) {
    if ("_idmap" in input) {
        // Registry case
        const registry = input;
        const ctx = json_schema_processors_initializeContext({ ...params, processors: allProcessors });
        const defs = {};
        // First pass: process all schemas to build the seen map
        for (const entry of registry._idmap.entries()) {
            const [_, schema] = entry;
            json_schema_processors_process(schema, ctx);
        }
        const schemas = {};
        const external = {
            registry,
            uri: params?.uri,
            defs,
        };
        // Update the context with external configuration
        ctx.external = external;
        // Second pass: emit each schema
        for (const entry of registry._idmap.entries()) {
            const [key, schema] = entry;
            json_schema_processors_extractDefs(ctx, schema);
            schemas[key] = json_schema_processors_finalize(ctx, schema);
        }
        if (Object.keys(defs).length > 0) {
            const defsSegment = ctx.target === "draft-2020-12" ? "$defs" : "definitions";
            schemas.__shared = {
                [defsSegment]: defs,
            };
        }
        return { schemas };
    }
    // Single schema case
    const ctx = json_schema_processors_initializeContext({ ...params, processors: allProcessors });
    json_schema_processors_process(input, ctx);
    json_schema_processors_extractDefs(ctx, input);
    return json_schema_processors_finalize(ctx, input);
}

;// ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/iso.js


const ZodISODateTime = /*@__PURE__*/ $constructor("ZodISODateTime", (inst, def) => {
    $ZodISODateTime.init(inst, def);
    ZodStringFormat.init(inst, def);
});
function iso_datetime(params) {
    return _isoDateTime(ZodISODateTime, params);
}
const ZodISODate = /*@__PURE__*/ $constructor("ZodISODate", (inst, def) => {
    $ZodISODate.init(inst, def);
    ZodStringFormat.init(inst, def);
});
function iso_date(params) {
    return _isoDate(ZodISODate, params);
}
const ZodISOTime = /*@__PURE__*/ $constructor("ZodISOTime", (inst, def) => {
    $ZodISOTime.init(inst, def);
    ZodStringFormat.init(inst, def);
});
function iso_time(params) {
    return _isoTime(ZodISOTime, params);
}
const ZodISODuration = /*@__PURE__*/ $constructor("ZodISODuration", (inst, def) => {
    $ZodISODuration.init(inst, def);
    ZodStringFormat.init(inst, def);
});
function iso_duration(params) {
    return _isoDuration(ZodISODuration, params);
}

;// ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/errors.js
/* unused harmony import specifier */ var errors_core;



const errors_initializer = (inst, issues) => {
    $ZodError.init(inst, issues);
    inst.name = "ZodError";
    Object.defineProperties(inst, {
        format: {
            value: (mapper) => formatError(inst, mapper),
            // enumerable: false,
        },
        flatten: {
            value: (mapper) => flattenError(inst, mapper),
            // enumerable: false,
        },
        addIssue: {
            value: (issue) => {
                inst.issues.push(issue);
                inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
            },
            // enumerable: false,
        },
        addIssues: {
            value: (issues) => {
                inst.issues.push(...issues);
                inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
            },
            // enumerable: false,
        },
        isEmpty: {
            get() {
                return inst.issues.length === 0;
            },
            // enumerable: false,
        },
    });
    // Object.defineProperty(inst, "isEmpty", {
    //   get() {
    //     return inst.issues.length === 0;
    //   },
    // });
};
const ZodError = /*@__PURE__*/ (/* unused pure expression or super */ null && (errors_core.$constructor("ZodError", errors_initializer)));
const ZodRealError = /*@__PURE__*/ $constructor("ZodError", errors_initializer, {
    Parent: Error,
});
// /** @deprecated Use `z.core.$ZodErrorMapCtx` instead. */
// export type ErrorMapCtx = core.$ZodErrorMapCtx;

;// ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/parse.js


const parse_parse = /* @__PURE__ */ _parse(ZodRealError);
const parse_parseAsync = /* @__PURE__ */ _parseAsync(ZodRealError);
const parse_safeParse = /* @__PURE__ */ _safeParse(ZodRealError);
const parse_safeParseAsync = /* @__PURE__ */ _safeParseAsync(ZodRealError);
// Codec functions
const parse_encode = /* @__PURE__ */ _encode(ZodRealError);
const parse_decode = /* @__PURE__ */ _decode(ZodRealError);
const parse_encodeAsync = /* @__PURE__ */ _encodeAsync(ZodRealError);
const parse_decodeAsync = /* @__PURE__ */ _decodeAsync(ZodRealError);
const parse_safeEncode = /* @__PURE__ */ _safeEncode(ZodRealError);
const parse_safeDecode = /* @__PURE__ */ _safeDecode(ZodRealError);
const parse_safeEncodeAsync = /* @__PURE__ */ _safeEncodeAsync(ZodRealError);
const parse_safeDecodeAsync = /* @__PURE__ */ _safeDecodeAsync(ZodRealError);

;// ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/schemas.js
/* unused harmony import specifier */ var classic_schemas_core;
/* unused harmony import specifier */ var classic_schemas_util;
/* unused harmony import specifier */ var processors;
/* unused harmony import specifier */ var schemas_checks;







// Lazy-bind builder methods.
//
// Builder methods (`.optional`, `.array`, `.refine`, ...) live as
// non-enumerable getters on each concrete schema constructor's
// prototype. On first access from an instance the getter allocates
// `fn.bind(this)` and caches it as an own property on that instance,
// so detached usage (`const m = schema.optional; m()`) still works
// and the per-instance allocation only happens for methods actually
// touched.
//
// One install per (prototype, group), memoized by `_installedGroups`.
const _installedGroups = /* @__PURE__ */ new WeakMap();
function _installLazyMethods(inst, group, methods) {
    const proto = Object.getPrototypeOf(inst);
    let installed = _installedGroups.get(proto);
    if (!installed) {
        installed = new Set();
        _installedGroups.set(proto, installed);
    }
    if (installed.has(group))
        return;
    installed.add(group);
    for (const key in methods) {
        const fn = methods[key];
        Object.defineProperty(proto, key, {
            configurable: true,
            enumerable: false,
            get() {
                const bound = fn.bind(this);
                Object.defineProperty(this, key, {
                    configurable: true,
                    writable: true,
                    enumerable: true,
                    value: bound,
                });
                return bound;
            },
            set(v) {
                Object.defineProperty(this, key, {
                    configurable: true,
                    writable: true,
                    enumerable: true,
                    value: v,
                });
            },
        });
    }
}
const ZodType = /*@__PURE__*/ $constructor("ZodType", (inst, def) => {
    $ZodType.init(inst, def);
    Object.assign(inst["~standard"], {
        jsonSchema: {
            input: createStandardJSONSchemaMethod(inst, "input"),
            output: createStandardJSONSchemaMethod(inst, "output"),
        },
    });
    inst.toJSONSchema = createToJSONSchemaMethod(inst, {});
    inst.def = def;
    inst.type = def.type;
    Object.defineProperty(inst, "_def", { value: def });
    // Parse-family is intentionally kept as per-instance closures: these are
    // the hot path AND the most-detached methods (`arr.map(schema.parse)`,
    // `const { parse } = schema`, etc.). Eager closures here mean callers pay
    // ~12 closure allocations per schema but get monomorphic call sites and
    // detached usage that "just works".
    inst.parse = (data, params) => parse_parse(inst, data, params, { callee: inst.parse });
    inst.safeParse = (data, params) => parse_safeParse(inst, data, params);
    inst.parseAsync = async (data, params) => parse_parseAsync(inst, data, params, { callee: inst.parseAsync });
    inst.safeParseAsync = async (data, params) => parse_safeParseAsync(inst, data, params);
    inst.spa = inst.safeParseAsync;
    inst.encode = (data, params) => parse_encode(inst, data, params);
    inst.decode = (data, params) => parse_decode(inst, data, params);
    inst.encodeAsync = async (data, params) => parse_encodeAsync(inst, data, params);
    inst.decodeAsync = async (data, params) => parse_decodeAsync(inst, data, params);
    inst.safeEncode = (data, params) => parse_safeEncode(inst, data, params);
    inst.safeDecode = (data, params) => parse_safeDecode(inst, data, params);
    inst.safeEncodeAsync = async (data, params) => parse_safeEncodeAsync(inst, data, params);
    inst.safeDecodeAsync = async (data, params) => parse_safeDecodeAsync(inst, data, params);
    // All builder methods are placed on the internal prototype as lazy-bind
    // getters. On first access per-instance, a bound thunk is allocated and
    // cached as an own property; subsequent accesses skip the getter. This
    // means: no per-instance allocation for unused methods, full
    // detachability preserved (`const m = schema.optional; m()` works), and
    // shared underlying function references across all instances.
    _installLazyMethods(inst, "ZodType", {
        check(...chks) {
            const def = this.def;
            return this.clone(mergeDefs(def, {
                checks: [
                    ...(def.checks ?? []),
                    ...chks.map((ch) => typeof ch === "function" ? { _zod: { check: ch, def: { check: "custom" }, onattach: [] } } : ch),
                ],
            }), { parent: true });
        },
        with(...chks) {
            return this.check(...chks);
        },
        clone(def, params) {
            return clone(this, def, params);
        },
        brand() {
            return this;
        },
        register(reg, meta) {
            reg.add(this, meta);
            return this;
        },
        refine(check, params) {
            return this.check(refine(check, params));
        },
        superRefine(refinement, params) {
            return this.check(superRefine(refinement, params));
        },
        overwrite(fn) {
            return this.check(_overwrite(fn));
        },
        optional() {
            return optional(this);
        },
        exactOptional() {
            return exactOptional(this);
        },
        nullable() {
            return nullable(this);
        },
        nullish() {
            return optional(nullable(this));
        },
        nonoptional(params) {
            return nonoptional(this, params);
        },
        array() {
            return array(this);
        },
        or(arg) {
            return union([this, arg]);
        },
        and(arg) {
            return intersection(this, arg);
        },
        transform(tx) {
            return pipe(this, transform(tx));
        },
        default(d) {
            return schemas_default(this, d);
        },
        prefault(d) {
            return prefault(this, d);
        },
        catch(params) {
            return schemas_catch(this, params);
        },
        pipe(target) {
            return pipe(this, target);
        },
        readonly() {
            return readonly(this);
        },
        describe(description) {
            const cl = this.clone();
            globalRegistry.add(cl, { description });
            return cl;
        },
        meta(...args) {
            // overloaded: meta() returns the registered metadata, meta(data)
            // returns a clone with `data` registered. The mapped type picks
            // up the second overload, so we accept variadic any-args and
            // return `any` to satisfy both at runtime.
            if (args.length === 0)
                return globalRegistry.get(this);
            const cl = this.clone();
            globalRegistry.add(cl, args[0]);
            return cl;
        },
        isOptional() {
            return this.safeParse(undefined).success;
        },
        isNullable() {
            return this.safeParse(null).success;
        },
        apply(fn) {
            return fn(this);
        },
    });
    Object.defineProperty(inst, "description", {
        get() {
            return globalRegistry.get(inst)?.description;
        },
        configurable: true,
    });
    return inst;
});
/** @internal */
const _ZodString = /*@__PURE__*/ $constructor("_ZodString", (inst, def) => {
    $ZodString.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => stringProcessor(inst, ctx, json, params);
    const bag = inst._zod.bag;
    inst.format = bag.format ?? null;
    inst.minLength = bag.minimum ?? null;
    inst.maxLength = bag.maximum ?? null;
    _installLazyMethods(inst, "_ZodString", {
        regex(...args) {
            return this.check(_regex(...args));
        },
        includes(...args) {
            return this.check(_includes(...args));
        },
        startsWith(...args) {
            return this.check(_startsWith(...args));
        },
        endsWith(...args) {
            return this.check(_endsWith(...args));
        },
        min(...args) {
            return this.check(_minLength(...args));
        },
        max(...args) {
            return this.check(_maxLength(...args));
        },
        length(...args) {
            return this.check(_length(...args));
        },
        nonempty(...args) {
            return this.check(_minLength(1, ...args));
        },
        lowercase(params) {
            return this.check(_lowercase(params));
        },
        uppercase(params) {
            return this.check(_uppercase(params));
        },
        trim() {
            return this.check(_trim());
        },
        normalize(...args) {
            return this.check(_normalize(...args));
        },
        toLowerCase() {
            return this.check(_toLowerCase());
        },
        toUpperCase() {
            return this.check(_toUpperCase());
        },
        slugify() {
            return this.check(_slugify());
        },
    });
});
const ZodString = /*@__PURE__*/ $constructor("ZodString", (inst, def) => {
    $ZodString.init(inst, def);
    _ZodString.init(inst, def);
    inst.email = (params) => inst.check(_email(ZodEmail, params));
    inst.url = (params) => inst.check(_url(ZodURL, params));
    inst.jwt = (params) => inst.check(_jwt(ZodJWT, params));
    inst.emoji = (params) => inst.check(api_emoji(ZodEmoji, params));
    inst.guid = (params) => inst.check(_guid(ZodGUID, params));
    inst.uuid = (params) => inst.check(_uuid(ZodUUID, params));
    inst.uuidv4 = (params) => inst.check(_uuidv4(ZodUUID, params));
    inst.uuidv6 = (params) => inst.check(_uuidv6(ZodUUID, params));
    inst.uuidv7 = (params) => inst.check(_uuidv7(ZodUUID, params));
    inst.nanoid = (params) => inst.check(_nanoid(ZodNanoID, params));
    inst.guid = (params) => inst.check(_guid(ZodGUID, params));
    inst.cuid = (params) => inst.check(_cuid(ZodCUID, params));
    inst.cuid2 = (params) => inst.check(_cuid2(ZodCUID2, params));
    inst.ulid = (params) => inst.check(_ulid(ZodULID, params));
    inst.base64 = (params) => inst.check(_base64(ZodBase64, params));
    inst.base64url = (params) => inst.check(_base64url(ZodBase64URL, params));
    inst.xid = (params) => inst.check(_xid(ZodXID, params));
    inst.ksuid = (params) => inst.check(_ksuid(ZodKSUID, params));
    inst.ipv4 = (params) => inst.check(_ipv4(ZodIPv4, params));
    inst.ipv6 = (params) => inst.check(_ipv6(ZodIPv6, params));
    inst.cidrv4 = (params) => inst.check(_cidrv4(ZodCIDRv4, params));
    inst.cidrv6 = (params) => inst.check(_cidrv6(ZodCIDRv6, params));
    inst.e164 = (params) => inst.check(_e164(ZodE164, params));
    // iso
    inst.datetime = (params) => inst.check(iso_datetime(params));
    inst.date = (params) => inst.check(iso_date(params));
    inst.time = (params) => inst.check(iso_time(params));
    inst.duration = (params) => inst.check(iso_duration(params));
});
function schemas_string(params) {
    return _string(ZodString, params);
}
const ZodStringFormat = /*@__PURE__*/ $constructor("ZodStringFormat", (inst, def) => {
    $ZodStringFormat.init(inst, def);
    _ZodString.init(inst, def);
});
const ZodEmail = /*@__PURE__*/ $constructor("ZodEmail", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    $ZodEmail.init(inst, def);
    ZodStringFormat.init(inst, def);
});
function schemas_email(params) {
    return classic_schemas_core._email(ZodEmail, params);
}
const ZodGUID = /*@__PURE__*/ $constructor("ZodGUID", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    $ZodGUID.init(inst, def);
    ZodStringFormat.init(inst, def);
});
function schemas_guid(params) {
    return classic_schemas_core._guid(ZodGUID, params);
}
const ZodUUID = /*@__PURE__*/ $constructor("ZodUUID", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    $ZodUUID.init(inst, def);
    ZodStringFormat.init(inst, def);
});
function schemas_uuid(params) {
    return classic_schemas_core._uuid(ZodUUID, params);
}
function uuidv4(params) {
    return classic_schemas_core._uuidv4(ZodUUID, params);
}
// ZodUUIDv6
function uuidv6(params) {
    return classic_schemas_core._uuidv6(ZodUUID, params);
}
// ZodUUIDv7
function uuidv7(params) {
    return classic_schemas_core._uuidv7(ZodUUID, params);
}
const ZodURL = /*@__PURE__*/ $constructor("ZodURL", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    $ZodURL.init(inst, def);
    ZodStringFormat.init(inst, def);
});
function url(params) {
    return classic_schemas_core._url(ZodURL, params);
}
function httpUrl(params) {
    return classic_schemas_core._url(ZodURL, {
        protocol: classic_schemas_core.regexes.httpProtocol,
        hostname: classic_schemas_core.regexes.domain,
        ...classic_schemas_util.normalizeParams(params),
    });
}
const ZodEmoji = /*@__PURE__*/ $constructor("ZodEmoji", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    $ZodEmoji.init(inst, def);
    ZodStringFormat.init(inst, def);
});
function schemas_emoji(params) {
    return classic_schemas_core._emoji(ZodEmoji, params);
}
const ZodNanoID = /*@__PURE__*/ $constructor("ZodNanoID", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    $ZodNanoID.init(inst, def);
    ZodStringFormat.init(inst, def);
});
function schemas_nanoid(params) {
    return classic_schemas_core._nanoid(ZodNanoID, params);
}
/**
 * @deprecated CUID v1 is deprecated by its authors due to information leakage
 * (timestamps embedded in the id). Use {@link ZodCUID2} instead.
 * See https://github.com/paralleldrive/cuid.
 */
const ZodCUID = /*@__PURE__*/ $constructor("ZodCUID", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    $ZodCUID.init(inst, def);
    ZodStringFormat.init(inst, def);
});
/**
 * Validates a CUID v1 string.
 *
 * @deprecated CUID v1 is deprecated by its authors due to information leakage
 * (timestamps embedded in the id). Use {@link cuid2 | `z.cuid2()`} instead.
 * See https://github.com/paralleldrive/cuid.
 */
function schemas_cuid(params) {
    return classic_schemas_core._cuid(ZodCUID, params);
}
const ZodCUID2 = /*@__PURE__*/ $constructor("ZodCUID2", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    $ZodCUID2.init(inst, def);
    ZodStringFormat.init(inst, def);
});
function schemas_cuid2(params) {
    return classic_schemas_core._cuid2(ZodCUID2, params);
}
const ZodULID = /*@__PURE__*/ $constructor("ZodULID", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    $ZodULID.init(inst, def);
    ZodStringFormat.init(inst, def);
});
function schemas_ulid(params) {
    return classic_schemas_core._ulid(ZodULID, params);
}
const ZodXID = /*@__PURE__*/ $constructor("ZodXID", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    $ZodXID.init(inst, def);
    ZodStringFormat.init(inst, def);
});
function schemas_xid(params) {
    return classic_schemas_core._xid(ZodXID, params);
}
const ZodKSUID = /*@__PURE__*/ $constructor("ZodKSUID", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    $ZodKSUID.init(inst, def);
    ZodStringFormat.init(inst, def);
});
function schemas_ksuid(params) {
    return classic_schemas_core._ksuid(ZodKSUID, params);
}
const ZodIPv4 = /*@__PURE__*/ $constructor("ZodIPv4", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    $ZodIPv4.init(inst, def);
    ZodStringFormat.init(inst, def);
});
function schemas_ipv4(params) {
    return classic_schemas_core._ipv4(ZodIPv4, params);
}
const ZodMAC = /*@__PURE__*/ (/* unused pure expression or super */ null && (classic_schemas_core.$constructor("ZodMAC", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    classic_schemas_core.$ZodMAC.init(inst, def);
    ZodStringFormat.init(inst, def);
})));
function schemas_mac(params) {
    return classic_schemas_core._mac(ZodMAC, params);
}
const ZodIPv6 = /*@__PURE__*/ $constructor("ZodIPv6", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    $ZodIPv6.init(inst, def);
    ZodStringFormat.init(inst, def);
});
function schemas_ipv6(params) {
    return classic_schemas_core._ipv6(ZodIPv6, params);
}
const ZodCIDRv4 = /*@__PURE__*/ $constructor("ZodCIDRv4", (inst, def) => {
    $ZodCIDRv4.init(inst, def);
    ZodStringFormat.init(inst, def);
});
function schemas_cidrv4(params) {
    return classic_schemas_core._cidrv4(ZodCIDRv4, params);
}
const ZodCIDRv6 = /*@__PURE__*/ $constructor("ZodCIDRv6", (inst, def) => {
    $ZodCIDRv6.init(inst, def);
    ZodStringFormat.init(inst, def);
});
function schemas_cidrv6(params) {
    return classic_schemas_core._cidrv6(ZodCIDRv6, params);
}
const ZodBase64 = /*@__PURE__*/ $constructor("ZodBase64", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    $ZodBase64.init(inst, def);
    ZodStringFormat.init(inst, def);
});
function schemas_base64(params) {
    return classic_schemas_core._base64(ZodBase64, params);
}
const ZodBase64URL = /*@__PURE__*/ $constructor("ZodBase64URL", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    $ZodBase64URL.init(inst, def);
    ZodStringFormat.init(inst, def);
});
function schemas_base64url(params) {
    return classic_schemas_core._base64url(ZodBase64URL, params);
}
const ZodE164 = /*@__PURE__*/ $constructor("ZodE164", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    $ZodE164.init(inst, def);
    ZodStringFormat.init(inst, def);
});
function schemas_e164(params) {
    return classic_schemas_core._e164(ZodE164, params);
}
const ZodJWT = /*@__PURE__*/ $constructor("ZodJWT", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    $ZodJWT.init(inst, def);
    ZodStringFormat.init(inst, def);
});
function jwt(params) {
    return classic_schemas_core._jwt(ZodJWT, params);
}
const ZodCustomStringFormat = /*@__PURE__*/ (/* unused pure expression or super */ null && (classic_schemas_core.$constructor("ZodCustomStringFormat", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    classic_schemas_core.$ZodCustomStringFormat.init(inst, def);
    ZodStringFormat.init(inst, def);
})));
function stringFormat(format, fnOrRegex, _params = {}) {
    return classic_schemas_core._stringFormat(ZodCustomStringFormat, format, fnOrRegex, _params);
}
function schemas_hostname(_params) {
    return classic_schemas_core._stringFormat(ZodCustomStringFormat, "hostname", classic_schemas_core.regexes.hostname, _params);
}
function schemas_hex(_params) {
    return classic_schemas_core._stringFormat(ZodCustomStringFormat, "hex", classic_schemas_core.regexes.hex, _params);
}
function hash(alg, params) {
    const enc = params?.enc ?? "hex";
    const format = `${alg}_${enc}`;
    const regex = classic_schemas_core.regexes[format];
    if (!regex)
        throw new Error(`Unrecognized hash format: ${format}`);
    return classic_schemas_core._stringFormat(ZodCustomStringFormat, format, regex, params);
}
const ZodNumber = /*@__PURE__*/ $constructor("ZodNumber", (inst, def) => {
    $ZodNumber.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => numberProcessor(inst, ctx, json, params);
    _installLazyMethods(inst, "ZodNumber", {
        gt(value, params) {
            return this.check(_gt(value, params));
        },
        gte(value, params) {
            return this.check(_gte(value, params));
        },
        min(value, params) {
            return this.check(_gte(value, params));
        },
        lt(value, params) {
            return this.check(_lt(value, params));
        },
        lte(value, params) {
            return this.check(_lte(value, params));
        },
        max(value, params) {
            return this.check(_lte(value, params));
        },
        int(params) {
            return this.check(schemas_int(params));
        },
        safe(params) {
            return this.check(schemas_int(params));
        },
        positive(params) {
            return this.check(_gt(0, params));
        },
        nonnegative(params) {
            return this.check(_gte(0, params));
        },
        negative(params) {
            return this.check(_lt(0, params));
        },
        nonpositive(params) {
            return this.check(_lte(0, params));
        },
        multipleOf(value, params) {
            return this.check(_multipleOf(value, params));
        },
        step(value, params) {
            return this.check(_multipleOf(value, params));
        },
        finite() {
            return this;
        },
    });
    const bag = inst._zod.bag;
    inst.minValue =
        Math.max(bag.minimum ?? Number.NEGATIVE_INFINITY, bag.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null;
    inst.maxValue =
        Math.min(bag.maximum ?? Number.POSITIVE_INFINITY, bag.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null;
    inst.isInt = (bag.format ?? "").includes("int") || Number.isSafeInteger(bag.multipleOf ?? 0.5);
    inst.isFinite = true;
    inst.format = bag.format ?? null;
});
function schemas_number(params) {
    return _number(ZodNumber, params);
}
const ZodNumberFormat = /*@__PURE__*/ $constructor("ZodNumberFormat", (inst, def) => {
    $ZodNumberFormat.init(inst, def);
    ZodNumber.init(inst, def);
});
function schemas_int(params) {
    return _int(ZodNumberFormat, params);
}
function float32(params) {
    return classic_schemas_core._float32(ZodNumberFormat, params);
}
function float64(params) {
    return classic_schemas_core._float64(ZodNumberFormat, params);
}
function int32(params) {
    return classic_schemas_core._int32(ZodNumberFormat, params);
}
function uint32(params) {
    return classic_schemas_core._uint32(ZodNumberFormat, params);
}
const ZodBoolean = /*@__PURE__*/ (/* unused pure expression or super */ null && (classic_schemas_core.$constructor("ZodBoolean", (inst, def) => {
    classic_schemas_core.$ZodBoolean.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => processors.booleanProcessor(inst, ctx, json, params);
})));
function schemas_boolean(params) {
    return classic_schemas_core._boolean(ZodBoolean, params);
}
const ZodBigInt = /*@__PURE__*/ (/* unused pure expression or super */ null && (classic_schemas_core.$constructor("ZodBigInt", (inst, def) => {
    classic_schemas_core.$ZodBigInt.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => processors.bigintProcessor(inst, ctx, json, params);
    inst.gte = (value, params) => inst.check(schemas_checks.gte(value, params));
    inst.min = (value, params) => inst.check(schemas_checks.gte(value, params));
    inst.gt = (value, params) => inst.check(schemas_checks.gt(value, params));
    inst.gte = (value, params) => inst.check(schemas_checks.gte(value, params));
    inst.min = (value, params) => inst.check(schemas_checks.gte(value, params));
    inst.lt = (value, params) => inst.check(schemas_checks.lt(value, params));
    inst.lte = (value, params) => inst.check(schemas_checks.lte(value, params));
    inst.max = (value, params) => inst.check(schemas_checks.lte(value, params));
    inst.positive = (params) => inst.check(schemas_checks.gt(BigInt(0), params));
    inst.negative = (params) => inst.check(schemas_checks.lt(BigInt(0), params));
    inst.nonpositive = (params) => inst.check(schemas_checks.lte(BigInt(0), params));
    inst.nonnegative = (params) => inst.check(schemas_checks.gte(BigInt(0), params));
    inst.multipleOf = (value, params) => inst.check(schemas_checks.multipleOf(value, params));
    const bag = inst._zod.bag;
    inst.minValue = bag.minimum ?? null;
    inst.maxValue = bag.maximum ?? null;
    inst.format = bag.format ?? null;
})));
function schemas_bigint(params) {
    return classic_schemas_core._bigint(ZodBigInt, params);
}
const ZodBigIntFormat = /*@__PURE__*/ (/* unused pure expression or super */ null && (classic_schemas_core.$constructor("ZodBigIntFormat", (inst, def) => {
    classic_schemas_core.$ZodBigIntFormat.init(inst, def);
    ZodBigInt.init(inst, def);
})));
// int64
function int64(params) {
    return classic_schemas_core._int64(ZodBigIntFormat, params);
}
// uint64
function uint64(params) {
    return classic_schemas_core._uint64(ZodBigIntFormat, params);
}
const ZodSymbol = /*@__PURE__*/ (/* unused pure expression or super */ null && (classic_schemas_core.$constructor("ZodSymbol", (inst, def) => {
    classic_schemas_core.$ZodSymbol.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => processors.symbolProcessor(inst, ctx, json, params);
})));
function symbol(params) {
    return classic_schemas_core._symbol(ZodSymbol, params);
}
const ZodUndefined = /*@__PURE__*/ (/* unused pure expression or super */ null && (classic_schemas_core.$constructor("ZodUndefined", (inst, def) => {
    classic_schemas_core.$ZodUndefined.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => processors.undefinedProcessor(inst, ctx, json, params);
})));
function schemas_undefined(params) {
    return classic_schemas_core._undefined(ZodUndefined, params);
}

const ZodNull = /*@__PURE__*/ (/* unused pure expression or super */ null && (classic_schemas_core.$constructor("ZodNull", (inst, def) => {
    classic_schemas_core.$ZodNull.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => processors.nullProcessor(inst, ctx, json, params);
})));
function schemas_null(params) {
    return classic_schemas_core._null(ZodNull, params);
}

const ZodAny = /*@__PURE__*/ (/* unused pure expression or super */ null && (classic_schemas_core.$constructor("ZodAny", (inst, def) => {
    classic_schemas_core.$ZodAny.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => processors.anyProcessor(inst, ctx, json, params);
})));
function any() {
    return classic_schemas_core._any(ZodAny);
}
const ZodUnknown = /*@__PURE__*/ $constructor("ZodUnknown", (inst, def) => {
    $ZodUnknown.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => unknownProcessor(inst, ctx, json, params);
});
function unknown() {
    return _unknown(ZodUnknown);
}
const ZodNever = /*@__PURE__*/ $constructor("ZodNever", (inst, def) => {
    $ZodNever.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => neverProcessor(inst, ctx, json, params);
});
function never(params) {
    return _never(ZodNever, params);
}
const ZodVoid = /*@__PURE__*/ (/* unused pure expression or super */ null && (classic_schemas_core.$constructor("ZodVoid", (inst, def) => {
    classic_schemas_core.$ZodVoid.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => processors.voidProcessor(inst, ctx, json, params);
})));
function schemas_void(params) {
    return classic_schemas_core._void(ZodVoid, params);
}

const ZodDate = /*@__PURE__*/ (/* unused pure expression or super */ null && (classic_schemas_core.$constructor("ZodDate", (inst, def) => {
    classic_schemas_core.$ZodDate.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => processors.dateProcessor(inst, ctx, json, params);
    inst.min = (value, params) => inst.check(schemas_checks.gte(value, params));
    inst.max = (value, params) => inst.check(schemas_checks.lte(value, params));
    const c = inst._zod.bag;
    inst.minDate = c.minimum ? new Date(c.minimum) : null;
    inst.maxDate = c.maximum ? new Date(c.maximum) : null;
})));
function schemas_date(params) {
    return classic_schemas_core._date(ZodDate, params);
}
const ZodArray = /*@__PURE__*/ $constructor("ZodArray", (inst, def) => {
    $ZodArray.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => arrayProcessor(inst, ctx, json, params);
    inst.element = def.element;
    _installLazyMethods(inst, "ZodArray", {
        min(n, params) {
            return this.check(_minLength(n, params));
        },
        nonempty(params) {
            return this.check(_minLength(1, params));
        },
        max(n, params) {
            return this.check(_maxLength(n, params));
        },
        length(n, params) {
            return this.check(_length(n, params));
        },
        unwrap() {
            return this.element;
        },
    });
});
function array(element, params) {
    return _array(ZodArray, element, params);
}
// .keyof
function keyof(schema) {
    const shape = schema._zod.def.shape;
    return schemas_enum(Object.keys(shape));
}
const ZodObject = /*@__PURE__*/ $constructor("ZodObject", (inst, def) => {
    $ZodObjectJIT.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => objectProcessor(inst, ctx, json, params);
    defineLazy(inst, "shape", () => {
        return def.shape;
    });
    _installLazyMethods(inst, "ZodObject", {
        keyof() {
            return schemas_enum(Object.keys(this._zod.def.shape));
        },
        catchall(catchall) {
            return this.clone({ ...this._zod.def, catchall: catchall });
        },
        passthrough() {
            return this.clone({ ...this._zod.def, catchall: unknown() });
        },
        loose() {
            return this.clone({ ...this._zod.def, catchall: unknown() });
        },
        strict() {
            return this.clone({ ...this._zod.def, catchall: never() });
        },
        strip() {
            return this.clone({ ...this._zod.def, catchall: undefined });
        },
        extend(incoming) {
            return extend(this, incoming);
        },
        safeExtend(incoming) {
            return safeExtend(this, incoming);
        },
        merge(other) {
            return merge(this, other);
        },
        pick(mask) {
            return pick(this, mask);
        },
        omit(mask) {
            return omit(this, mask);
        },
        partial(...args) {
            return partial(ZodOptional, this, args[0]);
        },
        required(...args) {
            return required(ZodNonOptional, this, args[0]);
        },
    });
});
function object(shape, params) {
    const def = {
        type: "object",
        shape: shape ?? {},
        ...normalizeParams(params),
    };
    return new ZodObject(def);
}
// strictObject
function strictObject(shape, params) {
    return new ZodObject({
        type: "object",
        shape,
        catchall: never(),
        ...classic_schemas_util.normalizeParams(params),
    });
}
// looseObject
function looseObject(shape, params) {
    return new ZodObject({
        type: "object",
        shape,
        catchall: unknown(),
        ...classic_schemas_util.normalizeParams(params),
    });
}
const ZodUnion = /*@__PURE__*/ $constructor("ZodUnion", (inst, def) => {
    $ZodUnion.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => unionProcessor(inst, ctx, json, params);
    inst.options = def.options;
});
function union(options, params) {
    return new ZodUnion({
        type: "union",
        options: options,
        ...normalizeParams(params),
    });
}
const ZodXor = /*@__PURE__*/ (/* unused pure expression or super */ null && (classic_schemas_core.$constructor("ZodXor", (inst, def) => {
    ZodUnion.init(inst, def);
    classic_schemas_core.$ZodXor.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => processors.unionProcessor(inst, ctx, json, params);
    inst.options = def.options;
})));
/** Creates an exclusive union (XOR) where exactly one option must match.
 * Unlike regular unions that succeed when any option matches, xor fails if
 * zero or more than one option matches the input. */
function xor(options, params) {
    return new ZodXor({
        type: "union",
        options: options,
        inclusive: false,
        ...classic_schemas_util.normalizeParams(params),
    });
}
const ZodDiscriminatedUnion = /*@__PURE__*/ (/* unused pure expression or super */ null && (classic_schemas_core.$constructor("ZodDiscriminatedUnion", (inst, def) => {
    ZodUnion.init(inst, def);
    classic_schemas_core.$ZodDiscriminatedUnion.init(inst, def);
})));
function discriminatedUnion(discriminator, options, params) {
    // const [options, params] = args;
    return new ZodDiscriminatedUnion({
        type: "union",
        options,
        discriminator,
        ...classic_schemas_util.normalizeParams(params),
    });
}
const ZodIntersection = /*@__PURE__*/ $constructor("ZodIntersection", (inst, def) => {
    $ZodIntersection.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => intersectionProcessor(inst, ctx, json, params);
});
function intersection(left, right) {
    return new ZodIntersection({
        type: "intersection",
        left: left,
        right: right,
    });
}
const ZodTuple = /*@__PURE__*/ (/* unused pure expression or super */ null && (classic_schemas_core.$constructor("ZodTuple", (inst, def) => {
    classic_schemas_core.$ZodTuple.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => processors.tupleProcessor(inst, ctx, json, params);
    inst.rest = (rest) => inst.clone({
        ...inst._zod.def,
        rest: rest,
    });
})));
function tuple(items, _paramsOrRest, _params) {
    const hasRest = _paramsOrRest instanceof classic_schemas_core.$ZodType;
    const params = hasRest ? _params : _paramsOrRest;
    const rest = hasRest ? _paramsOrRest : null;
    return new ZodTuple({
        type: "tuple",
        items: items,
        rest,
        ...classic_schemas_util.normalizeParams(params),
    });
}
const ZodRecord = /*@__PURE__*/ (/* unused pure expression or super */ null && (classic_schemas_core.$constructor("ZodRecord", (inst, def) => {
    classic_schemas_core.$ZodRecord.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => processors.recordProcessor(inst, ctx, json, params);
    inst.keyType = def.keyType;
    inst.valueType = def.valueType;
})));
function record(keyType, valueType, params) {
    // v3-compat: z.record(valueType, params?) — defaults keyType to z.string()
    if (!valueType || !valueType._zod) {
        return new ZodRecord({
            type: "record",
            keyType: schemas_string(),
            valueType: keyType,
            ...classic_schemas_util.normalizeParams(valueType),
        });
    }
    return new ZodRecord({
        type: "record",
        keyType,
        valueType: valueType,
        ...classic_schemas_util.normalizeParams(params),
    });
}
// type alksjf = core.output<core.$ZodRecordKey>;
function partialRecord(keyType, valueType, params) {
    const k = classic_schemas_core.clone(keyType);
    k._zod.values = undefined;
    return new ZodRecord({
        type: "record",
        keyType: k,
        valueType: valueType,
        ...classic_schemas_util.normalizeParams(params),
    });
}
function looseRecord(keyType, valueType, params) {
    return new ZodRecord({
        type: "record",
        keyType,
        valueType: valueType,
        mode: "loose",
        ...classic_schemas_util.normalizeParams(params),
    });
}
const ZodMap = /*@__PURE__*/ (/* unused pure expression or super */ null && (classic_schemas_core.$constructor("ZodMap", (inst, def) => {
    classic_schemas_core.$ZodMap.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => processors.mapProcessor(inst, ctx, json, params);
    inst.keyType = def.keyType;
    inst.valueType = def.valueType;
    inst.min = (...args) => inst.check(classic_schemas_core._minSize(...args));
    inst.nonempty = (params) => inst.check(classic_schemas_core._minSize(1, params));
    inst.max = (...args) => inst.check(classic_schemas_core._maxSize(...args));
    inst.size = (...args) => inst.check(classic_schemas_core._size(...args));
})));
function map(keyType, valueType, params) {
    return new ZodMap({
        type: "map",
        keyType: keyType,
        valueType: valueType,
        ...classic_schemas_util.normalizeParams(params),
    });
}
const ZodSet = /*@__PURE__*/ (/* unused pure expression or super */ null && (classic_schemas_core.$constructor("ZodSet", (inst, def) => {
    classic_schemas_core.$ZodSet.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => processors.setProcessor(inst, ctx, json, params);
    inst.min = (...args) => inst.check(classic_schemas_core._minSize(...args));
    inst.nonempty = (params) => inst.check(classic_schemas_core._minSize(1, params));
    inst.max = (...args) => inst.check(classic_schemas_core._maxSize(...args));
    inst.size = (...args) => inst.check(classic_schemas_core._size(...args));
})));
function set(valueType, params) {
    return new ZodSet({
        type: "set",
        valueType: valueType,
        ...classic_schemas_util.normalizeParams(params),
    });
}
const ZodEnum = /*@__PURE__*/ $constructor("ZodEnum", (inst, def) => {
    $ZodEnum.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => enumProcessor(inst, ctx, json, params);
    inst.enum = def.entries;
    inst.options = Object.values(def.entries);
    const keys = new Set(Object.keys(def.entries));
    inst.extract = (values, params) => {
        const newEntries = {};
        for (const value of values) {
            if (keys.has(value)) {
                newEntries[value] = def.entries[value];
            }
            else
                throw new Error(`Key ${value} not found in enum`);
        }
        return new ZodEnum({
            ...def,
            checks: [],
            ...normalizeParams(params),
            entries: newEntries,
        });
    };
    inst.exclude = (values, params) => {
        const newEntries = { ...def.entries };
        for (const value of values) {
            if (keys.has(value)) {
                delete newEntries[value];
            }
            else
                throw new Error(`Key ${value} not found in enum`);
        }
        return new ZodEnum({
            ...def,
            checks: [],
            ...normalizeParams(params),
            entries: newEntries,
        });
    };
});
function schemas_enum(values, params) {
    const entries = Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values;
    return new ZodEnum({
        type: "enum",
        entries,
        ...normalizeParams(params),
    });
}

/** @deprecated This API has been merged into `z.enum()`. Use `z.enum()` instead.
 *
 * ```ts
 * enum Colors { red, green, blue }
 * z.enum(Colors);
 * ```
 */
function nativeEnum(entries, params) {
    return new ZodEnum({
        type: "enum",
        entries,
        ...classic_schemas_util.normalizeParams(params),
    });
}
const ZodLiteral = /*@__PURE__*/ $constructor("ZodLiteral", (inst, def) => {
    $ZodLiteral.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => literalProcessor(inst, ctx, json, params);
    inst.values = new Set(def.values);
    Object.defineProperty(inst, "value", {
        get() {
            if (def.values.length > 1) {
                throw new Error("This schema contains multiple valid literal values. Use `.values` instead.");
            }
            return def.values[0];
        },
    });
});
function literal(value, params) {
    return new ZodLiteral({
        type: "literal",
        values: Array.isArray(value) ? value : [value],
        ...normalizeParams(params),
    });
}
const ZodFile = /*@__PURE__*/ (/* unused pure expression or super */ null && (classic_schemas_core.$constructor("ZodFile", (inst, def) => {
    classic_schemas_core.$ZodFile.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => processors.fileProcessor(inst, ctx, json, params);
    inst.min = (size, params) => inst.check(classic_schemas_core._minSize(size, params));
    inst.max = (size, params) => inst.check(classic_schemas_core._maxSize(size, params));
    inst.mime = (types, params) => inst.check(classic_schemas_core._mime(Array.isArray(types) ? types : [types], params));
})));
function file(params) {
    return classic_schemas_core._file(ZodFile, params);
}
const ZodTransform = /*@__PURE__*/ $constructor("ZodTransform", (inst, def) => {
    $ZodTransform.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => transformProcessor(inst, ctx, json, params);
    inst._zod.parse = (payload, _ctx) => {
        if (_ctx.direction === "backward") {
            throw new $ZodEncodeError(inst.constructor.name);
        }
        payload.addIssue = (issue) => {
            if (typeof issue === "string") {
                payload.issues.push(util_issue(issue, payload.value, def));
            }
            else {
                // for Zod 3 backwards compatibility
                const _issue = issue;
                if (_issue.fatal)
                    _issue.continue = false;
                _issue.code ?? (_issue.code = "custom");
                _issue.input ?? (_issue.input = payload.value);
                _issue.inst ?? (_issue.inst = inst);
                // _issue.continue ??= true;
                payload.issues.push(util_issue(_issue));
            }
        };
        const output = def.transform(payload.value, payload);
        if (output instanceof Promise) {
            return output.then((output) => {
                payload.value = output;
                payload.fallback = true;
                return payload;
            });
        }
        payload.value = output;
        payload.fallback = true;
        return payload;
    };
});
function transform(fn) {
    return new ZodTransform({
        type: "transform",
        transform: fn,
    });
}
const ZodOptional = /*@__PURE__*/ $constructor("ZodOptional", (inst, def) => {
    $ZodOptional.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
    inst.unwrap = () => inst._zod.def.innerType;
});
function optional(innerType) {
    return new ZodOptional({
        type: "optional",
        innerType: innerType,
    });
}
const ZodExactOptional = /*@__PURE__*/ $constructor("ZodExactOptional", (inst, def) => {
    $ZodExactOptional.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
    inst.unwrap = () => inst._zod.def.innerType;
});
function exactOptional(innerType) {
    return new ZodExactOptional({
        type: "optional",
        innerType: innerType,
    });
}
const ZodNullable = /*@__PURE__*/ $constructor("ZodNullable", (inst, def) => {
    $ZodNullable.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => nullableProcessor(inst, ctx, json, params);
    inst.unwrap = () => inst._zod.def.innerType;
});
function nullable(innerType) {
    return new ZodNullable({
        type: "nullable",
        innerType: innerType,
    });
}
// nullish
function schemas_nullish(innerType) {
    return optional(nullable(innerType));
}
const ZodDefault = /*@__PURE__*/ $constructor("ZodDefault", (inst, def) => {
    $ZodDefault.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => defaultProcessor(inst, ctx, json, params);
    inst.unwrap = () => inst._zod.def.innerType;
    inst.removeDefault = inst.unwrap;
});
function schemas_default(innerType, defaultValue) {
    return new ZodDefault({
        type: "default",
        innerType: innerType,
        get defaultValue() {
            return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
        },
    });
}
const ZodPrefault = /*@__PURE__*/ $constructor("ZodPrefault", (inst, def) => {
    $ZodPrefault.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => prefaultProcessor(inst, ctx, json, params);
    inst.unwrap = () => inst._zod.def.innerType;
});
function prefault(innerType, defaultValue) {
    return new ZodPrefault({
        type: "prefault",
        innerType: innerType,
        get defaultValue() {
            return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
        },
    });
}
const ZodNonOptional = /*@__PURE__*/ $constructor("ZodNonOptional", (inst, def) => {
    $ZodNonOptional.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => nonoptionalProcessor(inst, ctx, json, params);
    inst.unwrap = () => inst._zod.def.innerType;
});
function nonoptional(innerType, params) {
    return new ZodNonOptional({
        type: "nonoptional",
        innerType: innerType,
        ...normalizeParams(params),
    });
}
const ZodSuccess = /*@__PURE__*/ (/* unused pure expression or super */ null && (classic_schemas_core.$constructor("ZodSuccess", (inst, def) => {
    classic_schemas_core.$ZodSuccess.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => processors.successProcessor(inst, ctx, json, params);
    inst.unwrap = () => inst._zod.def.innerType;
})));
function success(innerType) {
    return new ZodSuccess({
        type: "success",
        innerType: innerType,
    });
}
const ZodCatch = /*@__PURE__*/ $constructor("ZodCatch", (inst, def) => {
    $ZodCatch.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => catchProcessor(inst, ctx, json, params);
    inst.unwrap = () => inst._zod.def.innerType;
    inst.removeCatch = inst.unwrap;
});
function schemas_catch(innerType, catchValue) {
    return new ZodCatch({
        type: "catch",
        innerType: innerType,
        catchValue: (typeof catchValue === "function" ? catchValue : () => catchValue),
    });
}

const ZodNaN = /*@__PURE__*/ (/* unused pure expression or super */ null && (classic_schemas_core.$constructor("ZodNaN", (inst, def) => {
    classic_schemas_core.$ZodNaN.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => processors.nanProcessor(inst, ctx, json, params);
})));
function nan(params) {
    return classic_schemas_core._nan(ZodNaN, params);
}
const ZodPipe = /*@__PURE__*/ $constructor("ZodPipe", (inst, def) => {
    $ZodPipe.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => pipeProcessor(inst, ctx, json, params);
    inst.in = def.in;
    inst.out = def.out;
});
function pipe(in_, out) {
    return new ZodPipe({
        type: "pipe",
        in: in_,
        out: out,
        // ...util.normalizeParams(params),
    });
}
const ZodCodec = /*@__PURE__*/ (/* unused pure expression or super */ null && (classic_schemas_core.$constructor("ZodCodec", (inst, def) => {
    ZodPipe.init(inst, def);
    classic_schemas_core.$ZodCodec.init(inst, def);
})));
function codec(in_, out, params) {
    return new ZodCodec({
        type: "pipe",
        in: in_,
        out: out,
        transform: params.decode,
        reverseTransform: params.encode,
    });
}
function invertCodec(codec) {
    const def = codec._zod.def;
    return new ZodCodec({
        type: "pipe",
        in: def.out,
        out: def.in,
        transform: def.reverseTransform,
        reverseTransform: def.transform,
    });
}
const ZodPreprocess = /*@__PURE__*/ (/* unused pure expression or super */ null && (classic_schemas_core.$constructor("ZodPreprocess", (inst, def) => {
    ZodPipe.init(inst, def);
    classic_schemas_core.$ZodPreprocess.init(inst, def);
})));
const ZodReadonly = /*@__PURE__*/ $constructor("ZodReadonly", (inst, def) => {
    $ZodReadonly.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => readonlyProcessor(inst, ctx, json, params);
    inst.unwrap = () => inst._zod.def.innerType;
});
function readonly(innerType) {
    return new ZodReadonly({
        type: "readonly",
        innerType: innerType,
    });
}
const ZodTemplateLiteral = /*@__PURE__*/ (/* unused pure expression or super */ null && (classic_schemas_core.$constructor("ZodTemplateLiteral", (inst, def) => {
    classic_schemas_core.$ZodTemplateLiteral.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => processors.templateLiteralProcessor(inst, ctx, json, params);
})));
function templateLiteral(parts, params) {
    return new ZodTemplateLiteral({
        type: "template_literal",
        parts,
        ...classic_schemas_util.normalizeParams(params),
    });
}
const ZodLazy = /*@__PURE__*/ (/* unused pure expression or super */ null && (classic_schemas_core.$constructor("ZodLazy", (inst, def) => {
    classic_schemas_core.$ZodLazy.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => processors.lazyProcessor(inst, ctx, json, params);
    inst.unwrap = () => inst._zod.def.getter();
})));
function lazy(getter) {
    return new ZodLazy({
        type: "lazy",
        getter: getter,
    });
}
const ZodPromise = /*@__PURE__*/ (/* unused pure expression or super */ null && (classic_schemas_core.$constructor("ZodPromise", (inst, def) => {
    classic_schemas_core.$ZodPromise.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => processors.promiseProcessor(inst, ctx, json, params);
    inst.unwrap = () => inst._zod.def.innerType;
})));
function promise(innerType) {
    return new ZodPromise({
        type: "promise",
        innerType: innerType,
    });
}
const ZodFunction = /*@__PURE__*/ (/* unused pure expression or super */ null && (classic_schemas_core.$constructor("ZodFunction", (inst, def) => {
    classic_schemas_core.$ZodFunction.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => processors.functionProcessor(inst, ctx, json, params);
})));
function _function(params) {
    return new ZodFunction({
        type: "function",
        input: Array.isArray(params?.input) ? tuple(params?.input) : (params?.input ?? array(unknown())),
        output: params?.output ?? unknown(),
    });
}

const ZodCustom = /*@__PURE__*/ $constructor("ZodCustom", (inst, def) => {
    $ZodCustom.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.processJSONSchema = (ctx, json, params) => customProcessor(inst, ctx, json, params);
});
// custom checks
function check(fn) {
    const ch = new classic_schemas_core.$ZodCheck({
        check: "custom",
        // ...util.normalizeParams(params),
    });
    ch._zod.check = fn;
    return ch;
}
function custom(fn, _params) {
    return classic_schemas_core._custom(ZodCustom, fn ?? (() => true), _params);
}
function refine(fn, _params = {}) {
    return _refine(ZodCustom, fn, _params);
}
// superRefine
function superRefine(fn, params) {
    return _superRefine(fn, params);
}
// Re-export describe and meta from core
const schemas_describe = describe;
const schemas_meta = meta;
function _instanceof(cls, params = {}) {
    const inst = new ZodCustom({
        type: "custom",
        check: "custom",
        fn: (data) => data instanceof cls,
        abort: true,
        ...classic_schemas_util.normalizeParams(params),
    });
    inst._zod.bag.Class = cls;
    // Override check to emit invalid_type instead of custom
    inst._zod.check = (payload) => {
        if (!(payload.value instanceof cls)) {
            payload.issues.push({
                code: "invalid_type",
                expected: cls.name,
                input: payload.value,
                inst,
                path: [...(inst._zod.def.path ?? [])],
            });
        }
    };
    return inst;
}

// stringbool
const stringbool = (...args) => classic_schemas_core._stringbool({
    Codec: ZodCodec,
    Boolean: ZodBoolean,
    String: ZodString,
}, ...args);
function json(params) {
    const jsonSchema = lazy(() => {
        return union([schemas_string(params), schemas_number(), schemas_boolean(), schemas_null(), array(jsonSchema), record(schemas_string(), jsonSchema)]);
    });
    return jsonSchema;
}
// preprocess
function preprocess(fn, schema) {
    return new ZodPreprocess({
        type: "pipe",
        in: transform(fn),
        out: schema,
    });
}

;// ../../packages/shared/src/schemas.ts

// Legacy `jobStatusSchema` + `createJobSchema` + `updateJobSchema` +
// `jobStatusUpdateSchema` (plus their `validate*` helpers) used to live here
// with a *different* value set (`offered` instead of `offer`, no `expired` /
// `dismissed` / `pending`). They were deleted as part of F2.1 consolidation —
// nothing outside the shared package consumed them, and the web app already
// validates opportunity inputs through `opportunityStatusSchema` below. Use
// `opportunityStatusSchema`, `createOpportunitySchema`, `updateOpportunitySchema`,
// and `opportunityStatusChangeSchema` instead.
const OPPORTUNITY_TYPES = ["job", "hackathon"];
const OPPORTUNITY_SOURCES = [
    "waterlooworks",
    "linkedin",
    "indeed",
    "greenhouse",
    "lever",
    "devpost",
    "manual",
    "url",
];
const OPPORTUNITY_REMOTE_TYPES = ["remote", "hybrid", "onsite"];
const OPPORTUNITY_JOB_TYPES = [
    "co-op",
    "full-time",
    "part-time",
    "contract",
    "internship",
];
const OPPORTUNITY_LEVELS = [
    "junior",
    "intermediate",
    "senior",
    "lead",
    "principal",
    "other",
    "staff",
];
const OPPORTUNITY_STATUSES = [
    "pending",
    "saved",
    "applied",
    "interviewing",
    "offer",
    "rejected",
    "expired",
    "dismissed",
];
const KANBAN_LANE_IDS = [
    "pending",
    "saved",
    "applied",
    "interviewing",
    "offer",
    "closed",
];
const CLOSED_SUB_STATUSES = [
    "rejected",
    "expired",
    "dismissed",
];
const KANBAN_LANE_GROUPS = {
    pending: ["pending"],
    saved: ["saved"],
    applied: ["applied"],
    interviewing: ["interviewing"],
    offer: ["offer"],
    closed: CLOSED_SUB_STATUSES,
};
const DEFAULT_KANBAN_VISIBLE_LANES = (/* unused pure expression or super */ null && (KANBAN_LANE_IDS));
const STATUS_TO_KANBAN_LANE = Object.fromEntries(KANBAN_LANE_IDS.flatMap((lane) => KANBAN_LANE_GROUPS[lane].map((status) => [status, lane])));
function inferLaneFromStatus(status) {
    return STATUS_TO_KANBAN_LANE[status];
}
function isClosedSubStatus(status) {
    return CLOSED_SUB_STATUSES.includes(status);
}
function normalizeKanbanVisibleLanes(input) {
    const parsedInput = typeof input === "string" ? parseJsonSafely(input) : input;
    if (!Array.isArray(parsedInput)) {
        return [...DEFAULT_KANBAN_VISIBLE_LANES];
    }
    const selected = KANBAN_LANE_IDS.filter((lane) => parsedInput.includes(lane));
    return selected.length > 0 ? selected : [...DEFAULT_KANBAN_VISIBLE_LANES];
}
function parseJsonSafely(value) {
    try {
        return JSON.parse(value);
    }
    catch {
        return null;
    }
}
const requiredText = (max, field) => schemas_string().trim().min(1, `${field} is required`).max(max);
const optionalText = (max) => schemas_string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value === "" ? undefined : value));
const optionalStringList = array(schemas_string().trim().min(1).max(200))
    .optional();
const optionalUrl = union([schemas_string().trim().url(), literal("")])
    .optional()
    .transform((value) => (value === "" ? undefined : value));
const opportunityTypeSchema = schemas_enum(OPPORTUNITY_TYPES);
const opportunitySourceSchema = schemas_enum(OPPORTUNITY_SOURCES);
const opportunityRemoteTypeSchema = schemas_enum(OPPORTUNITY_REMOTE_TYPES);
const opportunityJobTypeSchema = schemas_enum(OPPORTUNITY_JOB_TYPES);
const opportunityLevelSchema = schemas_enum(OPPORTUNITY_LEVELS);
const opportunityStatusSchema = schemas_enum(OPPORTUNITY_STATUSES);
const kanbanLaneIdSchema = schemas_enum(KANBAN_LANE_IDS);
const kanbanVisibleLanesSchema = array(kanbanLaneIdSchema)
    .min(1, "At least one kanban lane must remain visible");
const opportunityTeamSizeSchema = object({
    min: schemas_number().int().positive(),
    max: schemas_number().int().positive(),
})
    .refine((value) => value.min <= value.max, {
    message: "Minimum team size must be less than or equal to maximum team size",
    path: ["min"],
});
const salaryRangeRefinement = {
    message: "Minimum salary must be less than or equal to maximum salary",
    path: ["salaryMin"],
};
const hasValidSalaryRange = (value) => value.salaryMin === undefined ||
    value.salaryMax === undefined ||
    value.salaryMin <= value.salaryMax;
const opportunityInputFields = {
    type: opportunityTypeSchema,
    title: requiredText(200, "Title"),
    company: requiredText(200, "Company"),
    division: optionalText(200),
    source: opportunitySourceSchema,
    sourceUrl: optionalUrl,
    sourceId: optionalText(200),
    city: optionalText(120),
    province: optionalText(120),
    country: optionalText(120),
    postalCode: optionalText(40),
    region: optionalText(120),
    remoteType: opportunityRemoteTypeSchema.optional(),
    additionalLocationInfo: optionalText(500),
    jobType: opportunityJobTypeSchema.optional(),
    level: opportunityLevelSchema.optional(),
    openings: schemas_number().int().positive().optional(),
    workTerm: optionalText(120),
    applicationMethod: optionalText(120),
    requiredDocuments: optionalStringList,
    targetedDegrees: optionalStringList,
    targetedClusters: optionalStringList,
    prizes: optionalStringList,
    teamSize: opportunityTeamSizeSchema.optional(),
    tracks: optionalStringList,
    submissionUrl: optionalUrl,
    summary: requiredText(50000, "Summary"),
    responsibilities: optionalStringList,
    requiredSkills: optionalStringList,
    preferredSkills: optionalStringList,
    techStack: optionalStringList,
    salaryMin: schemas_number().nonnegative().optional(),
    salaryMax: schemas_number().nonnegative().optional(),
    salaryCurrency: optionalText(12),
    benefits: optionalStringList,
    deadline: optionalText(80),
    additionalInfo: optionalText(5000),
    scrapedAt: optionalText(80),
    savedAt: optionalText(80),
    appliedAt: optionalText(80),
    notes: optionalText(5000),
    linkedResumeId: optionalText(200),
    linkedCoverLetterId: optionalText(200),
};
const updateOpportunityInputFields = Object.fromEntries(Object.entries(opportunityInputFields).map(([key, schema]) => [
    key,
    schema.optional(),
]));
const createOpportunitySchema = object({
    ...opportunityInputFields,
    status: opportunityStatusSchema.default("pending"),
    tags: array(schemas_string().trim().min(1).max(80)).default([]),
})
    .refine(hasValidSalaryRange, salaryRangeRefinement);
const updateOpportunitySchema = object({
    ...updateOpportunityInputFields,
    status: opportunityStatusSchema.optional(),
    tags: array(schemas_string().trim().min(1).max(80)).optional(),
})
    .refine(hasValidSalaryRange, salaryRangeRefinement);
const opportunitySchema = object({
    ...opportunityInputFields,
    id: requiredText(200, "ID"),
    status: opportunityStatusSchema,
    tags: array(schemas_string().trim().min(1).max(80)),
    createdAt: requiredText(80, "Created at"),
    updatedAt: requiredText(80, "Updated at"),
})
    .refine(hasValidSalaryRange, salaryRangeRefinement);
const opportunityStatusChangeSchema = object({
    status: opportunityStatusSchema,
});
const opportunityFiltersSchema = object({
    type: opportunityTypeSchema.optional(),
    status: opportunityStatusSchema.optional(),
    source: opportunitySourceSchema.optional(),
    tags: array(schemas_string().trim().min(1)).optional(),
    search: schemas_string().trim().optional(),
});
// LLM provider configuration. The runtime validation source lives here so the
// `LLMConfig` type in `./types` can be derived from this schema via `z.infer`
// (kept in sync automatically — see F6.2 in `docs/legacy-duplication-audit.md`).
// `apps/web/src/lib/constants/llm.ts` re-exports this schema so existing
// callers that import from `@/lib/constants` keep working.
const LLM_PROVIDERS = [
    "openai",
    "anthropic",
    "ollama",
    "openrouter",
];
const llmProviderSchema = schemas_enum(LLM_PROVIDERS);
const llmConfigSchema = object({
    provider: llmProviderSchema,
    apiKey: schemas_string().optional(),
    baseUrl: schemas_string().url().optional().or(literal("")),
    model: schemas_string().min(1, "Model is required"),
});

;// ./src/background/storage.ts
// Extension storage utilities

const STORAGE_KEY = "slothing_extension";
async function getStorage() {
    return new Promise((resolve) => {
        chrome.storage.local.get(STORAGE_KEY, (result) => {
            const stored = result[STORAGE_KEY];
            const apiBaseUrl = SHOULD_PROMOTE_LEGACY_LOCAL_API_BASE_URL &&
                stored?.apiBaseUrl === LEGACY_LOCAL_API_BASE_URL &&
                !stored.authToken
                ? DEFAULT_API_BASE_URL
                : stored?.apiBaseUrl || DEFAULT_API_BASE_URL;
            resolve({
                ...stored,
                apiBaseUrl,
                settings: { ...DEFAULT_SETTINGS, ...stored?.settings },
            });
        });
    });
}
async function setStorage(updates) {
    const current = await getStorage();
    const updated = { ...current, ...updates };
    return new Promise((resolve) => {
        chrome.storage.local.set({ [STORAGE_KEY]: updated }, resolve);
    });
}
async function clearStorage() {
    return new Promise((resolve) => {
        chrome.storage.local.remove(STORAGE_KEY, resolve);
    });
}
// Auth token helpers
async function setAuthToken(token, expiresAt, apiBaseUrl) {
    await setStorage({
        authToken: token,
        tokenExpiry: expiresAt,
        ...(apiBaseUrl ? { apiBaseUrl } : {}),
        lastSeenAuthAt: new Date().toISOString(),
    });
    await setSessionAuthCache(true);
}
/**
 * Records that we just observed a working authenticated state. Called by the
 * API client after a successful `isAuthenticated()` check so the popup can
 * distinguish a real logout from a service-worker state-loss event.
 *
 * Distinct from `setAuthToken` because we don't always have a fresh token to
 * write — sometimes we just verified the existing one.
 */
async function markAuthSeen() {
    await setStorage({ lastSeenAuthAt: new Date().toISOString() });
}
/**
 * "Session lost" view (popup, #27) shows when we have no `authToken` but
 * `lastSeenAuthAt` is within this window. Beyond the window we treat the
 * extension as a fresh install / true logout and show the normal hero.
 */
const SESSION_LOST_WINDOW_MS = 24 * 60 * 60 * 1000; // 24h
/**
 * Returns true when the popup should render the "Session lost — reconnect"
 * branch instead of the unauthenticated hero. See #27.
 */
function isSessionLost(storage, now = Date.now()) {
    if (storage.authToken)
        return false;
    if (!storage.lastSeenAuthAt)
        return false;
    const lastSeen = new Date(storage.lastSeenAuthAt).getTime();
    if (!Number.isFinite(lastSeen))
        return false;
    return now - lastSeen <= SESSION_LOST_WINDOW_MS;
}
async function clearAuthToken() {
    // NOTE: we intentionally do NOT clear `lastSeenAuthAt` here. A true logout
    // path (handleLogout) calls `forgetAuthHistory` afterwards; this helper is
    // also used when a token quietly expires or a 401 trips the api-client,
    // and in those cases the session-lost UI is exactly what we want to show.
    await setStorage({
        authToken: undefined,
        tokenExpiry: undefined,
        cachedProfile: undefined,
        profileCachedAt: undefined,
    });
}
/**
 * Wipes the "we've seen you before" breadcrumb so the popup shows the
 * unauthenticated hero on next open. Call this from explicit-logout flows.
 */
async function forgetAuthHistory() {
    await setStorage({ lastSeenAuthAt: undefined });
}
async function getAuthToken() {
    const storage = await getStorage();
    if (!storage.authToken)
        return null;
    // Check expiry
    if (storage.tokenExpiry) {
        const expiry = new Date(storage.tokenExpiry);
        if (expiry < new Date()) {
            await clearAuthToken();
            return null;
        }
    }
    return storage.authToken;
}
// Profile cache helpers
const PROFILE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
async function getCachedProfile() {
    const storage = await getStorage();
    if (!storage.cachedProfile || !storage.profileCachedAt) {
        return null;
    }
    const cachedAt = new Date(storage.profileCachedAt);
    if (Date.now() - cachedAt.getTime() > PROFILE_CACHE_TTL) {
        return null; // Cache expired
    }
    return storage.cachedProfile;
}
async function setCachedProfile(profile) {
    await setStorage({
        cachedProfile: profile,
        profileCachedAt: new Date().toISOString(),
    });
}
async function clearCachedProfile() {
    await setStorage({
        cachedProfile: undefined,
        profileCachedAt: undefined,
    });
}
// Settings helpers
async function getSettings() {
    const storage = await getStorage();
    return storage.settings;
}
async function updateSettings(updates) {
    const storage = await getStorage();
    const updated = { ...storage.settings, ...updates };
    await setStorage({ settings: updated });
    return updated;
}
// API URL helper
async function setApiBaseUrl(url) {
    await setStorage({ apiBaseUrl: url });
}
async function getApiBaseUrl() {
    const storage = await getStorage();
    return storage.apiBaseUrl;
}
// ---- Session-scoped auth cache (#30) ------------------------------------
//
// `chrome.storage.session` is in-memory only — it survives suspending the
// service worker but is wiped on browser restart, which is exactly what we
// want for a short-lived auth verdict cache. Using session (not local)
// also means we never persist the verdict to disk.
//
// The cache stores `{ authenticated: boolean, at: ISO string }` so the
// popup can return a result in <50ms on the second open within a minute,
// while the background script revalidates in the background.
const AUTH_CACHE_TTL_MS = 60 * 1000;
const AUTH_CACHE_KEY = "slothing_auth_cache";
/**
 * Reads the session-scoped auth verdict cache. Returns null when:
 * - the entry has never been written,
 * - the entry is older than AUTH_CACHE_TTL_MS,
 * - the entry's timestamp is unparseable, or
 * - chrome.storage.session is unavailable (e.g. older browsers).
 *
 * Optional `now` parameter exists for tests.
 */
async function getSessionAuthCache(now = Date.now()) {
    const sessionStore = chrome.storage?.session;
    if (!sessionStore)
        return null;
    return new Promise((resolve) => {
        sessionStore.get(AUTH_CACHE_KEY, (result) => {
            const entry = result?.[AUTH_CACHE_KEY];
            if (!entry || typeof entry.at !== "string") {
                resolve(null);
                return;
            }
            const at = new Date(entry.at).getTime();
            if (!Number.isFinite(at)) {
                resolve(null);
                return;
            }
            if (now - at > AUTH_CACHE_TTL_MS) {
                resolve(null);
                return;
            }
            resolve({ authenticated: !!entry.authenticated, at: entry.at });
        });
    });
}
/**
 * Writes a fresh verdict to the session-scoped cache. No-ops when
 * chrome.storage.session is unavailable so callers don't need to guard.
 */
async function setSessionAuthCache(authenticated) {
    const sessionStore = chrome.storage?.session;
    if (!sessionStore)
        return;
    const entry = {
        authenticated,
        at: new Date().toISOString(),
    };
    return new Promise((resolve) => {
        sessionStore.set({ [AUTH_CACHE_KEY]: entry }, () => resolve());
    });
}
/**
 * Drops the cached verdict. Call this on any 401 so the next popup open
 * doesn't trust a stale "authenticated" answer.
 */
async function clearSessionAuthCache() {
    const sessionStore = chrome.storage?.session;
    if (!sessionStore)
        return;
    return new Promise((resolve) => {
        sessionStore.remove(AUTH_CACHE_KEY, () => resolve());
    });
}

;// ./src/background/api-client.ts
// Slothing API client for extension


const TRANSIENT_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);
const CHAT_RETRY_STATUS_CODES = new Set([500, 502, 503, 504]);
class SlothingAPIClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl.replace(/\/$/, "");
    }
    async getAuthToken() {
        const storage = await getStorage();
        if (!storage.authToken)
            return null;
        // Check expiry
        if (storage.tokenExpiry) {
            const expiry = new Date(storage.tokenExpiry);
            if (expiry < new Date()) {
                // Token expired, clear it
                await setStorage({ authToken: undefined, tokenExpiry: undefined });
                return null;
            }
        }
        return storage.authToken;
    }
    async authenticatedFetch(path, options = {}, retryPolicy = inferRetryPolicy(options)) {
        const token = await this.getAuthToken();
        if (!token) {
            throw new Error("Not authenticated");
        }
        const maxAttempts = retryPolicy === "safe" ? 3 : retryPolicy === "once" ? 2 : 1;
        let lastResponse = null;
        let sawRetry = false;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            let response;
            try {
                response = await fetch(`${this.baseUrl}${path}`, {
                    ...options,
                    headers: {
                        "Content-Type": "application/json",
                        "X-Extension-Token": token,
                        ...options.headers,
                    },
                });
            }
            catch (error) {
                if (attempt < maxAttempts) {
                    sawRetry = true;
                    await waitForRetry(retryDelayMs(attempt));
                    continue;
                }
                throw error;
            }
            if (response.status === 401) {
                // Clear invalid token AND the fast-path session cache (#30) so the
                // next popup open re-verifies instead of trusting a stale verdict.
                await setStorage({ authToken: undefined, tokenExpiry: undefined });
                await clearSessionAuthCache();
                throw new Error("Authentication expired");
            }
            if (response.ok) {
                return response.json();
            }
            lastResponse = response;
            if (attempt < maxAttempts &&
                TRANSIENT_STATUS_CODES.has(response.status)) {
                sawRetry = true;
                await waitForRetry(retryDelayMs(attempt, response));
                continue;
            }
            const error = await response
                .json()
                .catch(() => ({ error: "Request failed" }));
            const fallback = sawRetry
                ? `Request still failing after retry: ${response.status}`
                : `Request failed: ${response.status}`;
            throw new Error(error.error || fallback);
        }
        throw new Error(sawRetry && lastResponse
            ? `Request still failing after retry: ${lastResponse.status}`
            : "Request failed");
    }
    async isAuthenticated() {
        const token = await this.getAuthToken();
        if (!token)
            return false;
        try {
            await this.authenticatedFetch("/api/extension/auth/verify", {}, "safe");
            // Record the working-auth breadcrumb so the popup can distinguish a
            // true logout from a service-worker state-loss after this point.
            // See #27.
            await markAuthSeen();
            return true;
        }
        catch {
            return false;
        }
    }
    async getProfile() {
        return this.authenticatedFetch("/api/extension/profile", {}, "safe");
    }
    async importJob(job) {
        const opportunity = {
            type: "job",
            title: job.title,
            company: job.company,
            source: normalizeOpportunitySource(job.source),
            sourceUrl: job.url,
            sourceId: job.sourceJobId,
            summary: job.description,
            responsibilities: job.responsibilities || [],
            requiredSkills: job.requirements || [],
            techStack: job.keywords || [],
            jobType: job.type,
            remoteType: job.remote ? "remote" : undefined,
            deadline: job.deadline,
        };
        createOpportunitySchema.parse(opportunity);
        return this.authenticatedFetch("/api/opportunities/from-extension", {
            method: "POST",
            body: JSON.stringify({
                title: job.title,
                company: job.company,
                location: job.location,
                description: job.description,
                requirements: job.requirements,
                responsibilities: job.responsibilities || [],
                keywords: job.keywords || [],
                type: job.type,
                remote: job.remote,
                salary: job.salary,
                url: job.url,
                source: job.source,
                sourceJobId: job.sourceJobId,
                postedAt: job.postedAt,
                deadline: job.deadline,
            }),
        });
    }
    async importJobsBatch(jobs) {
        return this.authenticatedFetch("/api/opportunities/from-extension", {
            method: "POST",
            body: JSON.stringify({ jobs }),
        });
    }
    async trackApplied(payload) {
        const scrapedJob = payload.scrapedJob || undefined;
        const title = scrapedJob?.title || payload.headline || payload.title;
        const company = scrapedJob?.company || payload.host.replace(/^www\./, "");
        const notes = [
            payload.headline ? `Headline: ${payload.headline}` : undefined,
            payload.thumbnailDataUrl
                ? "Screenshot captured by extension."
                : undefined,
        ]
            .filter(Boolean)
            .join("\n");
        const response = await this.authenticatedFetch("/api/opportunities/from-extension", {
            method: "POST",
            body: JSON.stringify({
                title,
                company,
                location: scrapedJob?.location,
                description: scrapedJob?.description ||
                    payload.headline ||
                    "Application submitted via extension.",
                requirements: scrapedJob?.requirements || [],
                responsibilities: scrapedJob?.responsibilities || [],
                keywords: scrapedJob?.keywords || [],
                type: scrapedJob?.type,
                remote: scrapedJob?.remote,
                salary: scrapedJob?.salary,
                url: scrapedJob?.url || payload.url,
                source: scrapedJob?.source || payload.host,
                sourceJobId: scrapedJob?.sourceJobId,
                postedAt: scrapedJob?.postedAt,
                deadline: scrapedJob?.deadline,
                status: "applied",
                appliedAt: payload.submittedAt,
                notes,
            }),
        });
        const opportunityId = response.opportunityIds[0];
        if (!opportunityId) {
            throw new Error("Application was not tracked");
        }
        return {
            opportunityId,
            deduped: Boolean(response.dedupedIds?.includes(opportunityId)),
        };
    }
    async tailorFromJob(job, baseResumeId) {
        const jobDescription = getReadableJobDescription(job);
        const imported = await this.importJob(job);
        const opportunityId = getImportedOpportunityId(imported.opportunityIds);
        const requestBody = {
            action: "generate",
            jobDescription,
            jobTitle: job.title,
            company: job.company,
            opportunityId,
        };
        // Only thread the id through when the popup picked a non-default resume —
        // omitting the field keeps the request body byte-identical to the legacy
        // shape, so existing tests + telemetry don't churn for the master case.
        if (baseResumeId) {
            requestBody.baseResumeId = baseResumeId;
        }
        const response = await this.authenticatedFetch("/api/tailor", {
            method: "POST",
            body: JSON.stringify(requestBody),
        });
        if (!response.savedResume?.id || !response.jobId) {
            throw new Error("Tailored resume was generated without a saved resume.");
        }
        return {
            opportunityId,
            savedResume: { id: response.savedResume.id },
            jobId: response.jobId,
        };
    }
    async listResumes() {
        const response = await this.authenticatedFetch("/api/extension/resumes", {}, "safe");
        return response.resumes ?? [];
    }
    async generateCoverLetterFromJob(job) {
        const jobDescription = getReadableJobDescription(job);
        const imported = await this.importJob(job);
        const opportunityId = getImportedOpportunityId(imported.opportunityIds);
        const response = await this.authenticatedFetch("/api/cover-letter/generate", {
            method: "POST",
            body: JSON.stringify({
                action: "generate",
                jobDescription,
                jobTitle: job.title,
                company: job.company,
                opportunityId,
            }),
        });
        if (!response.savedCoverLetter?.id) {
            throw new Error("Cover letter was generated without a saved document.");
        }
        return {
            opportunityId,
            savedCoverLetter: { id: response.savedCoverLetter.id },
        };
    }
    async saveLearnedAnswer(data) {
        return this.authenticatedFetch("/api/extension/learned-answers", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }
    async searchSimilarAnswers(question) {
        const response = await this.authenticatedFetch("/api/extension/learned-answers/search", {
            method: "POST",
            body: JSON.stringify({ question }),
        });
        return response.results;
    }
    // P2/#35 — inline answer-bank search on long textareas.
    // Calls /api/answer-bank/match with `q` and optional `limit` (defaults to 5
    // server-side, capped). Used by the floating bulb popover decorator.
    async matchAnswerBank(q, limit) {
        const params = new URLSearchParams({ q });
        if (typeof limit === "number" && Number.isFinite(limit)) {
            params.set("limit", String(limit));
        }
        const response = await this.authenticatedFetch(`/api/answer-bank/match?${params.toString()}`);
        return response.results;
    }
    async getLearnedAnswers() {
        const response = await this.authenticatedFetch("/api/extension/learned-answers");
        return response.answers;
    }
    async deleteLearnedAnswer(id) {
        await this.authenticatedFetch(`/api/extension/learned-answers/${id}`, {
            method: "DELETE",
        });
    }
    async updateLearnedAnswer(id, answer) {
        return this.authenticatedFetch(`/api/extension/learned-answers/${id}`, {
            method: "PATCH",
            body: JSON.stringify({ answer }),
        });
    }
    /**
     * P4/#40 — Inline AI assistant streaming consumer.
     *
     * Opens an SSE request to /api/extension/chat and yields tokens as they
     * arrive. Service workers DO have `fetch` + `body.getReader()` (verified on
     * Chrome MV3 + Firefox MV2), so we don't need `EventSource` here — which
     * matters because EventSource can't attach the X-Extension-Token header.
     *
     * The server emits three SSE frame shapes:
     *   data: {"token": "..."}     // per token chunk
     *   data: {"done": true}        // end of stream
     *   data: {"error": "..."}      // mid-stream failure (followed by done:true)
     *
     * We yield string tokens to the caller and throw on `{error}` frames so the
     * background's port handler can forward a CHAT_STREAM_ERROR to the UI.
     */
    async *chat(prompt, jobContext) {
        const token = await this.getAuthToken();
        if (!token) {
            throw new Error("Not authenticated");
        }
        const response = await fetch(`${this.baseUrl}/api/extension/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Extension-Token": token,
                Accept: "text/event-stream",
            },
            body: JSON.stringify({ prompt, jobContext }),
        }).catch(async (error) => {
            await waitForRetry(retryDelayMs(1));
            const retried = await fetch(`${this.baseUrl}/api/extension/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Extension-Token": token,
                    Accept: "text/event-stream",
                },
                body: JSON.stringify({ prompt, jobContext }),
            });
            if (!retried.ok && CHAT_RETRY_STATUS_CODES.has(retried.status)) {
                throw error;
            }
            return retried;
        });
        if (!response.ok && CHAT_RETRY_STATUS_CODES.has(response.status)) {
            await waitForRetry(retryDelayMs(1, response));
            const retryResponse = await fetch(`${this.baseUrl}/api/extension/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Extension-Token": token,
                    Accept: "text/event-stream",
                },
                body: JSON.stringify({ prompt, jobContext }),
            });
            if (retryResponse.ok) {
                yield* readChatStream(retryResponse);
                return;
            }
        }
        if (!response.ok) {
            // 401: invalidate the token, mirror authenticatedFetch() so the popup
            // notices the session lost state on the next open.
            if (response.status === 401) {
                await setStorage({ authToken: undefined, tokenExpiry: undefined });
                await clearSessionAuthCache();
                throw new Error("Authentication expired");
            }
            let errMessage = `Request failed: ${response.status}`;
            try {
                const body = (await response.json());
                if (body?.error)
                    errMessage = body.error;
            }
            catch {
                // Body wasn't JSON; keep the generic message.
            }
            throw new Error(errMessage);
        }
        yield* readChatStream(response);
    }
    /**
     * Persist a user correction so the per-domain field mapping grows stronger
     * over time. See task #33 in docs/extension-roadmap-2026-05.md. The server
     * upserts into `field_mappings`, bumping `hit_count` on existing rows and
     * inserting fresh rows otherwise.
     */
    async saveCorrection(payload) {
        return this.authenticatedFetch("/api/extension/field-mappings/correct", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    }
}
async function* readChatStream(response) {
    const reader = response.body?.getReader();
    if (!reader) {
        throw new Error("No response body");
    }
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
        const { done, value } = await reader.read();
        if (done)
            break;
        buffer += decoder.decode(value, { stream: true });
        // SSE frames are separated by a blank line (\n\n). We split on it and
        // hold the trailing partial in `buffer`.
        const frames = buffer.split("\n\n");
        buffer = frames.pop() ?? "";
        for (const frame of frames) {
            const line = frame.split("\n").find((l) => l.startsWith("data: "));
            if (!line)
                continue;
            const dataStr = line.slice(6).trim();
            if (!dataStr)
                continue;
            let parsed;
            try {
                parsed = JSON.parse(dataStr);
            }
            catch {
                continue;
            }
            if (parsed.error) {
                throw new Error(parsed.error);
            }
            if (parsed.token) {
                yield parsed.token;
            }
            if (parsed.done) {
                return;
            }
        }
    }
}
function inferRetryPolicy(options) {
    const method = (options.method || "GET").toUpperCase();
    return method === "GET" ? "safe" : "none";
}
function retryDelayMs(attempt, response) {
    const retryAfter = response?.headers.get("Retry-After");
    if (retryAfter) {
        const seconds = Number(retryAfter);
        if (Number.isFinite(seconds) && seconds >= 0 && seconds < 5) {
            return seconds * 1000;
        }
    }
    const base = attempt === 1 ? 250 : 750;
    const jitter = Math.floor(Math.random() * 75);
    return base + jitter;
}
async function waitForRetry(delayMs) {
    if (false)
        // removed by dead control flow
{}
    await new Promise((resolve) => setTimeout(resolve, delayMs));
}
function getReadableJobDescription(job) {
    const description = job.description?.trim() ?? "";
    if (description.length < 20) {
        throw new Error("Couldn't read the full job description from this page.");
    }
    return description;
}
function getImportedOpportunityId(opportunityIds) {
    const opportunityId = opportunityIds[0];
    if (!opportunityId) {
        throw new Error("Job import did not return an opportunity id.");
    }
    return opportunityId;
}
function normalizeOpportunitySource(source) {
    const normalized = source.toLowerCase();
    if (normalized.includes("linkedin"))
        return "linkedin";
    if (normalized.includes("indeed"))
        return "indeed";
    if (normalized.includes("greenhouse"))
        return "greenhouse";
    if (normalized.includes("lever"))
        return "lever";
    if (normalized.includes("waterloo"))
        return "waterlooworks";
    if (normalized.includes("devpost"))
        return "devpost";
    return "url";
}
// Singleton instance
let client = null;
let clientBaseUrl = null;
async function getAPIClient() {
    const storage = await getStorage();
    if (!client || clientBaseUrl !== storage.apiBaseUrl) {
        client = new SlothingAPIClient(storage.apiBaseUrl);
        clientBaseUrl = storage.apiBaseUrl;
    }
    return client;
}
function resetAPIClient() {
    client = null;
    clientBaseUrl = null;
}

;// ./src/background/badge.ts

const BADGE_TEXT = "!";
const BADGE_COLOR = "#b8704a";
const BADGE_TITLE = "Job detected — press Cmd+Shift+I to import";
function getBadgeApi() {
    const runtime = chrome;
    return runtime.action ?? runtime.browserAction ?? null;
}
async function setBadgeForTab(tabId) {
    const settings = await getSettings();
    if (!settings.notifyOnJobDetected)
        return;
    const badgeApi = getBadgeApi();
    if (!badgeApi)
        return;
    await Promise.all([
        badgeApi.setBadgeText({ text: BADGE_TEXT, tabId }),
        badgeApi.setBadgeBackgroundColor({ color: BADGE_COLOR, tabId }),
        badgeApi.setTitle({ title: BADGE_TITLE, tabId }),
    ]);
}
async function clearBadgeForTab(tabId) {
    const badgeApi = getBadgeApi();
    if (!badgeApi)
        return;
    await Promise.all([
        badgeApi.setBadgeText({ text: "", tabId }),
        badgeApi.setTitle({ title: "", tabId }),
    ]);
}

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

;// ./src/background/index.ts
// Background service worker for Slothing extension






// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    handleMessage(message, sender)
        .then(sendResponse)
        .catch((error) => {
        console.error("[Slothing] Message handler error:", error);
        sendResponse({ success: false, error: error.message });
    });
    // Return true to indicate async response
    return true;
});
async function handleMessage(message, sender) {
    switch (message.type) {
        case "GET_AUTH_STATUS":
            return handleGetAuthStatus();
        case "OPEN_AUTH":
            return handleOpenAuth();
        case "LOGOUT":
            return handleLogout();
        case "GET_PROFILE":
            return handleGetProfile();
        case "GET_SETTINGS":
            return handleGetSettings();
        case "IMPORT_JOB":
            return handleImportJob(message.payload);
        case "IMPORT_JOBS_BATCH":
            return handleImportJobsBatch(message.payload);
        case "TRACK_APPLIED":
            return handleTrackApplied(message.payload);
        case "OPEN_DASHBOARD":
            return handleOpenDashboard();
        case "CAPTURE_VISIBLE_TAB":
            return handleCaptureVisibleTab();
        case "TAILOR_FROM_PAGE":
            return handleTailorFromPage(message.payload);
        case "GENERATE_COVER_LETTER_FROM_PAGE":
            return handleGenerateCoverLetterFromPage(message.payload);
        case "LIST_RESUMES":
            return handleListResumes();
        case "SAVE_ANSWER":
            return handleSaveAnswer(message.payload);
        case "SEARCH_ANSWERS":
            return handleSearchAnswers(message.payload);
        case "MATCH_ANSWER_BANK":
            return handleMatchAnswerBank(message.payload);
        case "GET_LEARNED_ANSWERS":
            return handleGetLearnedAnswers();
        case "DELETE_ANSWER":
            return handleDeleteAnswer(message.payload);
        case "SAVE_CORRECTION":
            return handleSaveCorrection(message.payload);
        // P3 / #36 #37 — multi-step support.
        case "GET_TAB_ID":
            return { success: true, data: { tabId: sender.tab?.id ?? null } };
        case "HAS_WEBNAVIGATION_PERMISSION":
            return handleHasWebNavigationPermission();
        case "REQUEST_WEBNAVIGATION_PERMISSION":
            return handleRequestWebNavigationPermission();
        case "JOB_DETECTED": {
            const tabId = sender.tab?.id;
            if (!tabId)
                return { success: false, error: "No tab ID in sender" };
            await setBadgeForTab(tabId);
            return { success: true };
        }
        case "AUTH_CALLBACK": {
            // Sent by the content script when it picks up a localStorage-transported
            // token from the Slothing connect page (the localStorage path is used on
            // browsers without externally_connectable — Firefox in particular).
            const payload = message;
            if (!payload.token || !payload.expiresAt) {
                return { success: false, error: "Missing token or expiresAt" };
            }
            try {
                await setAuthToken(payload.token, payload.expiresAt, authCallbackBaseUrl(payload.apiBaseUrl, sender.url));
                resetAPIClient();
                notifyAuthStatusChanged();
                return { success: true };
            }
            catch (error) {
                return {
                    success: false,
                    error: error.message,
                };
            }
        }
        default:
            return { success: false, error: `Unknown message type: ${message.type}` };
    }
}
async function handleTailorFromPage(payload) {
    // Support both the new wrapped payload ({job, baseResumeId}) used by the
    // popup picker (#34) and the legacy bare ScrapedJob still sent by the
    // content-script Tailor action. The "url" presence on the inner object is
    // the cheapest discriminator (ScrapedJob has it, TailorFromPagePayload
    // doesn't).
    const isLegacy = "url" in payload && !("job" in payload);
    const job = isLegacy
        ? payload
        : payload.job;
    const baseResumeId = isLegacy
        ? undefined
        : payload.baseResumeId;
    try {
        const client = await getAPIClient();
        const result = await client.tailorFromJob(job, baseResumeId);
        const apiBaseUrl = await getApiBaseUrl();
        const resumeId = result.savedResume.id;
        const studioParams = new URLSearchParams({
            from: "extension",
            tailorId: resumeId,
        });
        if (baseResumeId) {
            studioParams.set("baseResumeId", baseResumeId);
        }
        return {
            success: true,
            data: {
                url: `${apiBaseUrl}/studio?${studioParams.toString()}`,
                opportunityId: result.opportunityId,
                resumeId,
            },
        };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
}
async function handleListResumes() {
    try {
        const client = await getAPIClient();
        const resumes = await client.listResumes();
        return { success: true, data: { resumes } };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
}
async function handleGenerateCoverLetterFromPage(job) {
    try {
        const client = await getAPIClient();
        const result = await client.generateCoverLetterFromJob(job);
        const apiBaseUrl = await getApiBaseUrl();
        const coverLetterId = result.savedCoverLetter.id;
        return {
            success: true,
            data: {
                url: `${apiBaseUrl}/cover-letter?from=extension&id=${encodeURIComponent(coverLetterId)}`,
                opportunityId: result.opportunityId,
                coverLetterId,
            },
        };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
}
async function handleGetAuthStatus() {
    // Fast-path (#30): return a cached verdict if it's <60s old, then
    // revalidate in the background so a flipped server state still
    // self-corrects on the *next* popup open.
    try {
        const cached = await getSessionAuthCache();
        if (cached) {
            const apiBaseUrl = await getApiBaseUrl();
            const storage = await getStorage();
            const sessionLost = !cached.authenticated && isSessionLost(storage);
            // Fire-and-forget revalidation. We deliberately don't await it so
            // the popup gets its response immediately.
            void revalidateAuthInBackground();
            return {
                success: true,
                data: {
                    isAuthenticated: cached.authenticated,
                    apiBaseUrl,
                    sessionLost,
                },
            };
        }
    }
    catch {
        // Cache lookup failure is non-fatal; fall through to the verify path.
    }
    try {
        const client = await getAPIClient();
        const isAuthenticated = await client.isAuthenticated();
        const apiBaseUrl = await getApiBaseUrl();
        const storage = await getStorage();
        const sessionLost = !isAuthenticated && isSessionLost(storage);
        await setSessionAuthCache(isAuthenticated);
        return {
            success: true,
            data: { isAuthenticated, apiBaseUrl, sessionLost },
        };
    }
    catch (error) {
        const apiBaseUrl = await getApiBaseUrl();
        const storage = await getStorage().catch(() => null);
        const sessionLost = storage ? isSessionLost(storage) : false;
        return {
            success: true,
            data: { isAuthenticated: false, apiBaseUrl, sessionLost },
        };
    }
}
/**
 * Background revalidation that runs after we return a cached verdict.
 * Refreshes the session cache so subsequent reads stay fresh; on a 401
 * the api-client's authenticatedFetch clears `authToken` + the cache
 * already.
 */
async function revalidateAuthInBackground() {
    try {
        const client = await getAPIClient();
        const verdict = await client.isAuthenticated();
        await setSessionAuthCache(verdict);
    }
    catch {
        // Network blip — leave the cache alone; next miss will revalidate.
    }
}
async function handleOpenAuth() {
    try {
        const apiBaseUrl = await getApiBaseUrl();
        // Pass extension ID so the connect page can deliver the token back via
        // chrome.runtime.sendMessage(extensionId, ...). The page is a regular web
        // page and cannot resolve the calling extension by passing undefined.
        const authUrl = `${apiBaseUrl}/extension/connect?extensionId=${chrome.runtime.id}`;
        await chrome.tabs.create({ url: authUrl });
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
}
function authCallbackBaseUrl(explicitUrl, senderUrl) {
    const candidate = explicitUrl || senderUrl;
    if (!candidate)
        return undefined;
    try {
        const url = new URL(candidate);
        if (url.protocol !== "http:" && url.protocol !== "https:") {
            return undefined;
        }
        return url.origin;
    }
    catch {
        return undefined;
    }
}
async function handleLogout() {
    try {
        await clearAuthToken();
        // Explicit logout — also drop the "we've seen you before" breadcrumb so
        // the popup doesn't fall into the #27 "session lost" branch.
        await forgetAuthHistory();
        // And the fast-path cache (#30) so the next popup open re-verifies.
        await clearSessionAuthCache();
        resetAPIClient();
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
}
async function handleGetProfile() {
    try {
        // Check cache first
        const cached = await getCachedProfile();
        if (cached) {
            return { success: true, data: cached };
        }
        // Fetch from API
        const client = await getAPIClient();
        const profile = await client.getProfile();
        // Cache the profile
        await setCachedProfile(profile);
        return { success: true, data: profile };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
}
async function handleGetSettings() {
    try {
        return { success: true, data: await getSettings() };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
}
async function handleImportJob(job) {
    try {
        const client = await getAPIClient();
        const result = await client.importJob(job);
        return { success: true, data: result };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
}
async function handleImportJobsBatch(jobs) {
    try {
        const client = await getAPIClient();
        const result = await client.importJobsBatch(jobs);
        return { success: true, data: result };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
}
async function handleTrackApplied(payload) {
    try {
        const client = await getAPIClient();
        const result = await client.trackApplied(payload);
        return { success: true, data: result };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
}
async function handleOpenDashboard() {
    try {
        const apiBaseUrl = await getApiBaseUrl();
        await chrome.tabs.create({ url: `${apiBaseUrl}/dashboard` });
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
}
async function handleCaptureVisibleTab() {
    try {
        const dataUrl = await chrome.tabs.captureVisibleTab(undefined, {
            format: "jpeg",
            quality: 35,
        });
        return { success: true, data: { dataUrl } };
    }
    catch {
        return { success: false };
    }
}
async function handleSaveAnswer(data) {
    try {
        const client = await getAPIClient();
        const result = await client.saveLearnedAnswer({
            question: data.question,
            answer: data.answer,
            sourceUrl: data.url,
            sourceCompany: data.company,
        });
        return { success: true, data: result };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
}
async function handleSearchAnswers(question) {
    try {
        const client = await getAPIClient();
        const results = await client.searchSimilarAnswers(question);
        return { success: true, data: results };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
}
async function handleMatchAnswerBank(payload) {
    try {
        if (!payload?.q?.trim()) {
            return { success: false, error: "Question is required" };
        }
        const client = await getAPIClient();
        const results = await client.matchAnswerBank(payload.q, payload.limit);
        return { success: true, data: results };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
}
async function handleGetLearnedAnswers() {
    try {
        const client = await getAPIClient();
        const answers = await client.getLearnedAnswers();
        return { success: true, data: answers };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
}
async function handleDeleteAnswer(id) {
    try {
        const client = await getAPIClient();
        await client.deleteLearnedAnswer(id);
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
}
async function handleSaveCorrection(payload) {
    try {
        const client = await getAPIClient();
        const result = await client.saveCorrection(payload);
        return { success: true, data: result };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
}
// ----- Multi-step (P3 / #36 #37) ------------------------------------------
/**
 * Returns whether the `webNavigation` permission is granted right now.
 * In Chrome MV3 this is always true because the permission is in the
 * required `permissions` array. In Firefox MV2 it's in `optional_permissions`
 * and the user may not have approved it yet.
 */
async function handleHasWebNavigationPermission() {
    try {
        // chrome.permissions exists in both MV2 (via the polyfill) and MV3.
        const granted = await new Promise((resolve) => {
            try {
                chrome.permissions.contains({ permissions: ["webNavigation"] }, (has) => resolve(!!has));
            }
            catch {
                resolve(false);
            }
        });
        return { success: true, data: { granted } };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
}
/**
 * Ask the browser to request `webNavigation`. In Chrome MV3 the permission
 * is required at install time so this resolves instantly with true. In
 * Firefox MV2 the browser shows a permission prompt and the resolved value
 * reflects the user's verdict — a "No" leaves us on the prompted-toast
 * fallback path, which is exactly what we want.
 *
 * Important: `chrome.permissions.request` must be called from a user-gesture
 * context. The Firefox background can do this if invoked from a content-
 * script message handler that fired inside a button click; if Firefox
 * rejects with "may only be called from a user input handler" the
 * controller catches the failure and continues with the fallback path.
 */
async function handleRequestWebNavigationPermission() {
    try {
        const granted = await new Promise((resolve) => {
            try {
                chrome.permissions.request({ permissions: ["webNavigation"] }, (has) => resolve(!!has));
            }
            catch {
                resolve(false);
            }
        });
        if (granted) {
            attachWebNavigationListener();
        }
        return { success: true, data: { granted } };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
}
let webNavigationListenerAttached = false;
/**
 * Subscribe to `webNavigation.onHistoryStateUpdated`. Multi-step ATSes drive
 * step transitions via `history.pushState`, so this is the right event to
 * watch — `onCompleted` only fires for full document loads.
 *
 * Idempotent: safe to call after every install/update and after every
 * permission grant. Wrapped in try/catch because the API may not be
 * available in MV2 until the user grants the optional permission.
 */
function attachWebNavigationListener() {
    if (webNavigationListenerAttached)
        return;
    try {
        if (typeof chrome.webNavigation === "undefined" ||
            !chrome.webNavigation.onHistoryStateUpdated) {
            return;
        }
        chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
            if (details.frameId !== 0 && details.frameId !== undefined) {
                // We only care about the top frame here. Iframed Greenhouse is
                // handled by the per-provider MutationObserver inside the content
                // script.
                return;
            }
            void notifyTabOfStepTransition(details.tabId, details.url);
        });
        webNavigationListenerAttached = true;
    }
    catch (err) {
        console.warn("[Slothing] webNavigation listener attach failed:", err);
    }
}
async function notifyTabOfStepTransition(tabId, url) {
    // Only fire when the tab has an in-progress multi-step session — keeps
    // us from spamming every tab on every history event.
    const sessions = await listSessions();
    if (!sessions.some((s) => s.tabId === tabId))
        return;
    try {
        await chrome.tabs.sendMessage(tabId, {
            type: "MULTISTEP_STEP_TRANSITION",
            payload: { url, transitionType: "webNavigation" },
        });
    }
    catch {
        // Tab might be closed or the content script might not be loaded yet —
        // both are non-fatal.
    }
}
// Try to attach on startup. If the permission isn't granted yet (Firefox
// first run) this is a no-op; the listener attaches lazily when the user
// approves via `handleRequestWebNavigationPermission`.
attachWebNavigationListener();
// Clear the in-flight session when its tab closes. webNavigation's
// `onHistoryStateUpdated` also fires for back/forward inside the same tab;
// we deliberately keep the session in that case so the user doesn't lose
// state by accidentally hitting Back.
chrome.tabs.onRemoved.addListener((tabId) => {
    void clearSession(tabId);
});
// Sweep stale sessions on service-worker startup. Not strictly necessary —
// `getSession` already evicts expired entries on read — but it keeps the
// storage area small after a crash.
void purgeExpiredSessions();
/**
 * P4/#40 — Long-lived port handler for the inline AI assistant.
 *
 * The content-script sidebar opens `chrome.runtime.connect({name:
 * CHAT_PORT_NAME})` and posts a CHAT_STREAM_START frame. We translate that
 * into an SSE call via api-client.chat() and stream tokens back on the same
 * port until the generator completes (CHAT_STREAM_END) or throws
 * (CHAT_STREAM_ERROR). If the content-script disconnects mid-stream we set a
 * cancelled flag so the iterator stops enqueueing.
 */
chrome.runtime.onConnect.addListener((port) => {
    if (port.name !== CHAT_PORT_NAME)
        return;
    let cancelled = false;
    port.onDisconnect.addListener(() => {
        cancelled = true;
    });
    port.onMessage.addListener((message) => {
        if (message.type !== "CHAT_STREAM_START")
            return;
        void runChatStream(port, message, () => cancelled).catch((error) => {
            console.error("[Slothing] chat stream failure:", error);
        });
    });
});
async function runChatStream(port, message, isCancelled) {
    const safePost = (frame) => {
        if (isCancelled())
            return false;
        try {
            port.postMessage(frame);
            return true;
        }
        catch {
            // Port closed between cancellation checks — bail out quietly.
            return false;
        }
    };
    try {
        const client = await getAPIClient();
        const iterator = client.chat(message.prompt, message.jobContext);
        for await (const token of iterator) {
            if (isCancelled())
                return;
            if (!safePost({ type: "CHAT_STREAM_TOKEN", token }))
                return;
        }
        safePost({ type: "CHAT_STREAM_END" });
    }
    catch (error) {
        safePost({
            type: "CHAT_STREAM_ERROR",
            error: messageForError(error),
        });
    }
    finally {
        try {
            port.disconnect();
        }
        catch {
            // Already disconnected — nothing to do.
        }
    }
}
// Handle auth callback from Slothing web app
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
    if (message.type === "AUTH_CALLBACK" &&
        message.token &&
        message.expiresAt) {
        setAuthToken(message.token, message.expiresAt, authCallbackBaseUrl(message.apiBaseUrl, sender.url))
            .then(() => {
            resetAPIClient();
            notifyAuthStatusChanged();
            sendResponse({ success: true });
        })
            .catch((error) => {
            sendResponse({ success: false, error: error.message });
        });
        return true;
    }
});
function notifyAuthStatusChanged() {
    try {
        chrome.runtime.sendMessage({ type: "AUTH_STATUS_CHANGED" }, () => {
            // No popup may be open; consume lastError so Chrome does not log noise.
            void chrome.runtime.lastError;
        });
    }
    catch {
        // No active extension page listeners.
    }
}
// Handle keyboard shortcuts
chrome.commands.onCommand.addListener(async (command) => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id)
        return;
    switch (command) {
        case "fill-form":
            chrome.tabs.sendMessage(tab.id, { type: "TRIGGER_FILL" });
            break;
        case "import-job":
            chrome.tabs.sendMessage(tab.id, { type: "TRIGGER_IMPORT" });
            break;
    }
});
// Clear badge when a tab navigates to a new URL
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === "loading" && changeInfo.url) {
        clearBadgeForTab(tabId).catch(() => { });
    }
});
// Handle extension install/update
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
        console.log("[Slothing] Extension installed");
        // Could open onboarding page here
    }
    else if (details.reason === "update") {
        console.log("[Slothing] Extension updated to", chrome.runtime.getManifest().version);
    }
});
console.log("[Slothing] Background service worker started");

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBCQUEwQjtBQUMxQjtBQUNBLHlCQUF5QjtBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscURBQXFELEdBQUc7QUFDeEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQixhQUFhO0FBQ2I7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBCQUEwQjtBQUMxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QTtBQUNBLG1CQUFtQix5QkFBeUI7QUFDNUM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsZUFBZTtBQUNsQyxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSxZQUFZO0FBQ3BCO0FBQ0EsWUFBWSxjQUFjO0FBQzFCO0FBQ0EsMkJBQTJCLGVBQWU7QUFDMUMsU0FBUztBQUNUO0FBQ0EsMkJBQTJCLHNDQUFzQztBQUNqRSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0EscUNBQXFDLDZCQUE2QjtBQUNsRSxxQ0FBcUM7QUFDckM7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0Q0FBNEMsbUNBQW1DO0FBQy9FO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOENBQThDLHNCQUFzQjtBQUNwRTtBQUNBO0FBQ0EsOENBQThDLHdCQUF3QjtBQUN0RTtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsZ0JBQWdCLHVCQUF1QjtBQUMvQztBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0QiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4vc3JjL3NoYXJlZC90eXBlcy50cyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4vc3JjL3NoYXJlZC9lcnJvci1tZXNzYWdlcy50cyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS96b2RANC40LjMvbm9kZV9tb2R1bGVzL3pvZC92NC9jb3JlL2NvcmUuanMiLCJ3ZWJwYWNrOi8vQHNsb3RoaW5nL2V4dGVuc2lvbi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vem9kQDQuNC4zL25vZGVfbW9kdWxlcy96b2QvdjQvY29yZS9yZWdleGVzLmpzIiwid2VicGFjazovL0BzbG90aGluZy9leHRlbnNpb24vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3pvZEA0LjQuMy9ub2RlX21vZHVsZXMvem9kL3Y0L2NvcmUvdXRpbC5qcyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS96b2RANC40LjMvbm9kZV9tb2R1bGVzL3pvZC92NC9jb3JlL2NoZWNrcy5qcyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS96b2RANC40LjMvbm9kZV9tb2R1bGVzL3pvZC92NC9jb3JlL2RvYy5qcyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS96b2RANC40LjMvbm9kZV9tb2R1bGVzL3pvZC92NC9jb3JlL2Vycm9ycy5qcyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS96b2RANC40LjMvbm9kZV9tb2R1bGVzL3pvZC92NC9jb3JlL3BhcnNlLmpzIiwid2VicGFjazovL0BzbG90aGluZy9leHRlbnNpb24vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3pvZEA0LjQuMy9ub2RlX21vZHVsZXMvem9kL3Y0L2NvcmUvdmVyc2lvbnMuanMiLCJ3ZWJwYWNrOi8vQHNsb3RoaW5nL2V4dGVuc2lvbi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vem9kQDQuNC4zL25vZGVfbW9kdWxlcy96b2QvdjQvY29yZS9zY2hlbWFzLmpzIiwid2VicGFjazovL0BzbG90aGluZy9leHRlbnNpb24vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3pvZEA0LjQuMy9ub2RlX21vZHVsZXMvem9kL3Y0L2NvcmUvcmVnaXN0cmllcy5qcyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS96b2RANC40LjMvbm9kZV9tb2R1bGVzL3pvZC92NC9jb3JlL2FwaS5qcyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS96b2RANC40LjMvbm9kZV9tb2R1bGVzL3pvZC92NC9jb3JlL3RvLWpzb24tc2NoZW1hLmpzIiwid2VicGFjazovL0BzbG90aGluZy9leHRlbnNpb24vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3pvZEA0LjQuMy9ub2RlX21vZHVsZXMvem9kL3Y0L2NvcmUvanNvbi1zY2hlbWEtcHJvY2Vzc29ycy5qcyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS96b2RANC40LjMvbm9kZV9tb2R1bGVzL3pvZC92NC9jbGFzc2ljL2lzby5qcyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS96b2RANC40LjMvbm9kZV9tb2R1bGVzL3pvZC92NC9jbGFzc2ljL2Vycm9ycy5qcyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS96b2RANC40LjMvbm9kZV9tb2R1bGVzL3pvZC92NC9jbGFzc2ljL3BhcnNlLmpzIiwid2VicGFjazovL0BzbG90aGluZy9leHRlbnNpb24vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3pvZEA0LjQuMy9ub2RlX21vZHVsZXMvem9kL3Y0L2NsYXNzaWMvc2NoZW1hcy5qcyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4uLy4uL3BhY2thZ2VzL3NoYXJlZC9zcmMvc2NoZW1hcy50cyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4vc3JjL2JhY2tncm91bmQvc3RvcmFnZS50cyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4vc3JjL2JhY2tncm91bmQvYXBpLWNsaWVudC50cyIsIndlYnBhY2s6Ly9Ac2xvdGhpbmcvZXh0ZW5zaW9uLy4vc3JjL2JhY2tncm91bmQvYmFkZ2UudHMiLCJ3ZWJwYWNrOi8vQHNsb3RoaW5nL2V4dGVuc2lvbi8uL3NyYy9jb250ZW50L211bHRpc3RlcC9zZXNzaW9uLnRzIiwid2VicGFjazovL0BzbG90aGluZy9leHRlbnNpb24vLi9zcmMvYmFja2dyb3VuZC9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFA0LyM0MCDigJQgTG9uZy1saXZlZCBwb3J0IG5hbWUgdXNlZCBieSB0aGUgaW5saW5lIEFJIGFzc2lzdGFudC4gVGhlIGNvbnRlbnRcbiAqIHNjcmlwdCBjYWxscyBgY2hyb21lLnJ1bnRpbWUuY29ubmVjdCh7IG5hbWU6IENIQVRfUE9SVF9OQU1FIH0pYCBhbmQgdGhlXG4gKiBiYWNrZ3JvdW5kJ3MgYGNocm9tZS5ydW50aW1lLm9uQ29ubmVjdGAgbGlzdGVuZXIgZmlsdGVycyBieSB0aGlzIG5hbWUuXG4gKi9cbmV4cG9ydCBjb25zdCBDSEFUX1BPUlRfTkFNRSA9IFwic2xvdGhpbmctY2hhdC1zdHJlYW1cIjtcbmV4cG9ydCBjb25zdCBERUZBVUxUX1NFVFRJTkdTID0ge1xuICAgIGF1dG9GaWxsRW5hYmxlZDogdHJ1ZSxcbiAgICBzaG93Q29uZmlkZW5jZUluZGljYXRvcnM6IHRydWUsXG4gICAgbWluaW11bUNvbmZpZGVuY2U6IDAuNSxcbiAgICBsZWFybkZyb21BbnN3ZXJzOiB0cnVlLFxuICAgIG5vdGlmeU9uSm9iRGV0ZWN0ZWQ6IHRydWUsXG4gICAgYXV0b1RyYWNrQXBwbGljYXRpb25zRW5hYmxlZDogdHJ1ZSxcbiAgICBjYXB0dXJlU2NyZWVuc2hvdEVuYWJsZWQ6IGZhbHNlLFxufTtcbmV4cG9ydCBjb25zdCBMRUdBQ1lfTE9DQUxfQVBJX0JBU0VfVVJMID0gXCJodHRwOi8vbG9jYWxob3N0OjMwMDBcIjtcbmV4cG9ydCBjb25zdCBERUZBVUxUX0FQSV9CQVNFX1VSTCA9IHByb2Nlc3MuZW52LlNMT1RISU5HX0VYVEVOU0lPTl9BUElfQkFTRV9VUkwgfHwgXCJodHRwczovL3Nsb3RoaW5nLndvcmtcIjtcbmV4cG9ydCBjb25zdCBTSE9VTERfUFJPTU9URV9MRUdBQ1lfTE9DQUxfQVBJX0JBU0VfVVJMID0gREVGQVVMVF9BUElfQkFTRV9VUkwgIT09IExFR0FDWV9MT0NBTF9BUElfQkFTRV9VUkw7XG4iLCIvKipcbiAqIFVzZXItZmFjaW5nIGVycm9yIHN0cmluZyBtYXBwaW5nIGZvciB0aGUgU2xvdGhpbmcgZXh0ZW5zaW9uLlxuICpcbiAqIFRoZSBwb3B1cCAoYW5kIGFueSBvdGhlciBleHRlbnNpb24gc3VyZmFjZSkgc2hvdWxkIG5ldmVyIHNob3cgcmF3XG4gKiBgXCJSZXF1ZXN0IGZhaWxlZDogNTAzXCJgIC8gYFwiQXV0aGVudGljYXRpb24gZXhwaXJlZFwiYCBzdHJpbmdzLiBXcmFwIGFueVxuICogZXJyb3IgcGF0aCBpbiBgbWVzc2FnZUZvckVycm9yKGVycilgIHRvIGdldCBhbiBFbmdsaXNoIHNlbnRlbmNlIHNhZmVcbiAqIGZvciBlbmQtdXNlcnMuXG4gKlxuICogTWlycm9yIG9mIHRoZSBtZXNzYWdlIHRvbmUgdXNlZCBieSBgYXBwcy93ZWIvLi4uL2V4dGVuc2lvbi9jb25uZWN0L3BhZ2UudHN4YFxuICogYG1lc3NhZ2VGb3JTdGF0dXNgIOKAlCB0aGUgY29ubmVjdCBwYWdlIGtlZXBzIGl0cyBvd24gY29weSBiZWNhdXNlIGl0IHNpdHNcbiAqIGluc2lkZSB0aGUgbmV4dC1pbnRsIHRyZWUgKGRpZmZlcmVudCBwYWNrYWdlIGJvdW5kYXJ5KSwgYnV0IHRoZVxuICogdXNlci12aXNpYmxlIHN0cmluZ3Mgc2hvdWxkIHN0YXkgYWxpZ25lZC4gSWYgeW91IGNoYW5nZSBvbmUsIGNoYW5nZSBib3RoLlxuICpcbiAqIEVuZ2xpc2gtb25seSBieSBkZXNpZ246IHRoZSBleHRlbnNpb24gaXRzZWxmIGRvZXMgbm90IHVzZSBuZXh0LWludGwuXG4gKi9cbi8qKlxuICogTWFwcyBhbiBIVFRQIHN0YXR1cyBjb2RlIHRvIGEgaHVtYW4tZnJpZW5kbHkgbWVzc2FnZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1lc3NhZ2VGb3JTdGF0dXMoc3RhdHVzKSB7XG4gICAgaWYgKHN0YXR1cyA9PT0gNDAxIHx8IHN0YXR1cyA9PT0gNDAzKSB7XG4gICAgICAgIHJldHVybiBcIlNpZ24gaW4gZXhwaXJlZC4gUmVjb25uZWN0IHRoZSBleHRlbnNpb24uXCI7XG4gICAgfVxuICAgIGlmIChzdGF0dXMgPT09IDQyOSkge1xuICAgICAgICByZXR1cm4gXCJXZSdyZSByYXRlLWxpbWl0ZWQuIFRyeSBhZ2FpbiBpbiBhIG1pbnV0ZS5cIjtcbiAgICB9XG4gICAgaWYgKHN0YXR1cyA+PSA1MDApIHtcbiAgICAgICAgcmV0dXJuIFwiU2xvdGhpbmcgc2VydmVycyBhcmUgaGF2aW5nIGEgcHJvYmxlbS5cIjtcbiAgICB9XG4gICAgcmV0dXJuIFwiU29tZXRoaW5nIHdlbnQgd3JvbmcuIFBsZWFzZSB0cnkgYWdhaW4uXCI7XG59XG5leHBvcnQgZnVuY3Rpb24gcmV0cnlFeGhhdXN0ZWRNZXNzYWdlKCkge1xuICAgIHJldHVybiBcIlNsb3RoaW5nIGlzIHN0aWxsIG5vdCByZXNwb25kaW5nIGFmdGVyIHJldHJ5aW5nLiBUcnkgYWdhaW4gaW4gYSBtaW51dGUuXCI7XG59XG4vKipcbiAqIEJlc3QtZWZmb3J0IG1hcHBpbmcgb2YgYW4gdW5rbm93biB0aHJvd24gdmFsdWUgdG8gYSBodW1hbi1mcmllbmRseVxuICogbWVzc2FnZS4gUmVjb2duaXNlcyB0aGUgc3BlY2lmaWMgcGhyYXNlcyB0aGUgYXBpLWNsaWVudCB0aHJvd3MgdG9kYXlcbiAqIChgXCJBdXRoZW50aWNhdGlvbiBleHBpcmVkXCJgLCBgXCJOb3QgYXV0aGVudGljYXRlZFwiYCwgYFwiUmVxdWVzdCBmYWlsZWQ6IDxjb2RlPlwiYCxcbiAqIGBcIkZhaWxlZCB0byBmZXRjaFwiYCkgYW5kIGZhbGxzIGJhY2sgdG8gdGhlIG9yaWdpbmFsIG1lc3NhZ2UgZm9yIGFueXRoaW5nXG4gKiBlbHNlIOKAlCB0aGF0J3MgYWxtb3N0IGFsd2F5cyBtb3JlIHVzZWZ1bCB0aGFuIGEgZ2VuZXJpYyBjYXRjaC1hbGwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtZXNzYWdlRm9yRXJyb3IoZXJyKSB7XG4gICAgLy8gR2VuZXJpYyBuZXR3b3JrIGZhaWx1cmUgKGZldGNoIGluIHNlcnZpY2Ugd29ya2VycyB0aHJvd3MgVHlwZUVycm9yIGhlcmUpXG4gICAgaWYgKGVyciBpbnN0YW5jZW9mIFR5cGVFcnJvcikge1xuICAgICAgICByZXR1cm4gXCJOZXR3b3JrIGVycm9yLiBDaGVjayB5b3VyIGNvbm5lY3Rpb24gYW5kIHRyeSBhZ2Fpbi5cIjtcbiAgICB9XG4gICAgY29uc3QgcmF3ID0gZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFwiXCI7XG4gICAgaWYgKCFyYXcpXG4gICAgICAgIHJldHVybiBcIlNvbWV0aGluZyB3ZW50IHdyb25nLiBQbGVhc2UgdHJ5IGFnYWluLlwiO1xuICAgIC8vIEF1dGgtc2hhcGVkIG1lc3NhZ2VzIGZyb20gU2xvdGhpbmdBUElDbGllbnQuXG4gICAgaWYgKHJhdyA9PT0gXCJBdXRoZW50aWNhdGlvbiBleHBpcmVkXCIgfHxcbiAgICAgICAgcmF3ID09PSBcIk5vdCBhdXRoZW50aWNhdGVkXCIgfHxcbiAgICAgICAgL3VuYXV0aG9yL2kudGVzdChyYXcpKSB7XG4gICAgICAgIHJldHVybiBtZXNzYWdlRm9yU3RhdHVzKDQwMSk7XG4gICAgfVxuICAgIC8vIGBSZXF1ZXN0IGZhaWxlZDogNTAzYCDigJQgcmVjb3ZlciB0aGUgc3RhdHVzIGNvZGUuXG4gICAgY29uc3QgbWF0Y2ggPSByYXcubWF0Y2goL1JlcXVlc3QgZmFpbGVkOlxccyooXFxkezN9KS8pO1xuICAgIGlmIChtYXRjaCkge1xuICAgICAgICBjb25zdCBjb2RlID0gTnVtYmVyKG1hdGNoWzFdKTtcbiAgICAgICAgaWYgKE51bWJlci5pc0Zpbml0ZShjb2RlKSlcbiAgICAgICAgICAgIHJldHVybiBtZXNzYWdlRm9yU3RhdHVzKGNvZGUpO1xuICAgIH1cbiAgICBjb25zdCByZXRyeU1hdGNoID0gcmF3Lm1hdGNoKC9SZXF1ZXN0IHN0aWxsIGZhaWxpbmcgYWZ0ZXIgcmV0cnk6XFxzKihcXGR7M30pLyk7XG4gICAgaWYgKHJldHJ5TWF0Y2gpIHtcbiAgICAgICAgcmV0dXJuIHJldHJ5RXhoYXVzdGVkTWVzc2FnZSgpO1xuICAgIH1cbiAgICAvLyBCcm93c2VyIGZldGNoIGZhaWx1cmVzIGJ1YmJsZSB1cCBhcyBcIkZhaWxlZCB0byBmZXRjaFwiLlxuICAgIGlmICgvZmFpbGVkIHRvIGZldGNoL2kudGVzdChyYXcpIHx8IC9uZXR3b3JrL2kudGVzdChyYXcpKSB7XG4gICAgICAgIHJldHVybiBcIk5ldHdvcmsgZXJyb3IuIENoZWNrIHlvdXIgY29ubmVjdGlvbiBhbmQgdHJ5IGFnYWluLlwiO1xuICAgIH1cbiAgICAvLyBGb3IgYW55dGhpbmcgZWxzZSwgdGhlIHVuZGVybHlpbmcgbWVzc2FnZSBpcyB1c3VhbGx5IGEgc2VudGVuY2UgYWxyZWFkeVxuICAgIC8vIChlLmcuIFwiQ291bGRuJ3QgcmVhZCB0aGUgZnVsbCBqb2IgZGVzY3JpcHRpb24gZnJvbSB0aGlzIHBhZ2UuXCIpLlxuICAgIHJldHVybiByYXc7XG59XG4iLCJ2YXIgX2E7XG4vKiogQSBzcGVjaWFsIGNvbnN0YW50IHdpdGggdHlwZSBgbmV2ZXJgICovXG5leHBvcnQgY29uc3QgTkVWRVIgPSAvKkBfX1BVUkVfXyovIE9iamVjdC5mcmVlemUoe1xuICAgIHN0YXR1czogXCJhYm9ydGVkXCIsXG59KTtcbmV4cG9ydCAvKkBfX05PX1NJREVfRUZGRUNUU19fKi8gZnVuY3Rpb24gJGNvbnN0cnVjdG9yKG5hbWUsIGluaXRpYWxpemVyLCBwYXJhbXMpIHtcbiAgICBmdW5jdGlvbiBpbml0KGluc3QsIGRlZikge1xuICAgICAgICBpZiAoIWluc3QuX3pvZCkge1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGluc3QsIFwiX3pvZFwiLCB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgICAgICAgZGVmLFxuICAgICAgICAgICAgICAgICAgICBjb25zdHI6IF8sXG4gICAgICAgICAgICAgICAgICAgIHRyYWl0czogbmV3IFNldCgpLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5zdC5fem9kLnRyYWl0cy5oYXMobmFtZSkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpbnN0Ll96b2QudHJhaXRzLmFkZChuYW1lKTtcbiAgICAgICAgaW5pdGlhbGl6ZXIoaW5zdCwgZGVmKTtcbiAgICAgICAgLy8gc3VwcG9ydCBwcm90b3R5cGUgbW9kaWZpY2F0aW9uc1xuICAgICAgICBjb25zdCBwcm90byA9IF8ucHJvdG90eXBlO1xuICAgICAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMocHJvdG8pO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGsgPSBrZXlzW2ldO1xuICAgICAgICAgICAgaWYgKCEoayBpbiBpbnN0KSkge1xuICAgICAgICAgICAgICAgIGluc3Rba10gPSBwcm90b1trXS5iaW5kKGluc3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8vIGRvZXNuJ3Qgd29yayBpZiBQYXJlbnQgaGFzIGEgY29uc3RydWN0b3Igd2l0aCBhcmd1bWVudHNcbiAgICBjb25zdCBQYXJlbnQgPSBwYXJhbXM/LlBhcmVudCA/PyBPYmplY3Q7XG4gICAgY2xhc3MgRGVmaW5pdGlvbiBleHRlbmRzIFBhcmVudCB7XG4gICAgfVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShEZWZpbml0aW9uLCBcIm5hbWVcIiwgeyB2YWx1ZTogbmFtZSB9KTtcbiAgICBmdW5jdGlvbiBfKGRlZikge1xuICAgICAgICB2YXIgX2E7XG4gICAgICAgIGNvbnN0IGluc3QgPSBwYXJhbXM/LlBhcmVudCA/IG5ldyBEZWZpbml0aW9uKCkgOiB0aGlzO1xuICAgICAgICBpbml0KGluc3QsIGRlZik7XG4gICAgICAgIChfYSA9IGluc3QuX3pvZCkuZGVmZXJyZWQgPz8gKF9hLmRlZmVycmVkID0gW10pO1xuICAgICAgICBmb3IgKGNvbnN0IGZuIG9mIGluc3QuX3pvZC5kZWZlcnJlZCkge1xuICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaW5zdDtcbiAgICB9XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KF8sIFwiaW5pdFwiLCB7IHZhbHVlOiBpbml0IH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShfLCBTeW1ib2wuaGFzSW5zdGFuY2UsIHtcbiAgICAgICAgdmFsdWU6IChpbnN0KSA9PiB7XG4gICAgICAgICAgICBpZiAocGFyYW1zPy5QYXJlbnQgJiYgaW5zdCBpbnN0YW5jZW9mIHBhcmFtcy5QYXJlbnQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICByZXR1cm4gaW5zdD8uX3pvZD8udHJhaXRzPy5oYXMobmFtZSk7XG4gICAgICAgIH0sXG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KF8sIFwibmFtZVwiLCB7IHZhbHVlOiBuYW1lIH0pO1xuICAgIHJldHVybiBfO1xufVxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vICAgVVRJTElUSUVTICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5leHBvcnQgY29uc3QgJGJyYW5kID0gU3ltYm9sKFwiem9kX2JyYW5kXCIpO1xuZXhwb3J0IGNsYXNzICRab2RBc3luY0Vycm9yIGV4dGVuZHMgRXJyb3Ige1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcihgRW5jb3VudGVyZWQgUHJvbWlzZSBkdXJpbmcgc3luY2hyb25vdXMgcGFyc2UuIFVzZSAucGFyc2VBc3luYygpIGluc3RlYWQuYCk7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzICRab2RFbmNvZGVFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lKSB7XG4gICAgICAgIHN1cGVyKGBFbmNvdW50ZXJlZCB1bmlkaXJlY3Rpb25hbCB0cmFuc2Zvcm0gZHVyaW5nIGVuY29kZTogJHtuYW1lfWApO1xuICAgICAgICB0aGlzLm5hbWUgPSBcIlpvZEVuY29kZUVycm9yXCI7XG4gICAgfVxufVxuKF9hID0gZ2xvYmFsVGhpcykuX196b2RfZ2xvYmFsQ29uZmlnID8/IChfYS5fX3pvZF9nbG9iYWxDb25maWcgPSB7fSk7XG5leHBvcnQgY29uc3QgZ2xvYmFsQ29uZmlnID0gZ2xvYmFsVGhpcy5fX3pvZF9nbG9iYWxDb25maWc7XG5leHBvcnQgZnVuY3Rpb24gY29uZmlnKG5ld0NvbmZpZykge1xuICAgIGlmIChuZXdDb25maWcpXG4gICAgICAgIE9iamVjdC5hc3NpZ24oZ2xvYmFsQ29uZmlnLCBuZXdDb25maWcpO1xuICAgIHJldHVybiBnbG9iYWxDb25maWc7XG59XG4iLCJpbXBvcnQgKiBhcyB1dGlsIGZyb20gXCIuL3V0aWwuanNcIjtcbi8qKlxuICogQGRlcHJlY2F0ZWQgQ1VJRCB2MSBpcyBkZXByZWNhdGVkIGJ5IGl0cyBhdXRob3JzIGR1ZSB0byBpbmZvcm1hdGlvbiBsZWFrYWdlXG4gKiAodGltZXN0YW1wcyBlbWJlZGRlZCBpbiB0aGUgaWQpLiBVc2Uge0BsaW5rIGN1aWQyfSBpbnN0ZWFkLlxuICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9wYXJhbGxlbGRyaXZlL2N1aWQuXG4gKi9cbmV4cG9ydCBjb25zdCBjdWlkID0gL15bY0NdWzAtOWEtel17Nix9JC87XG5leHBvcnQgY29uc3QgY3VpZDIgPSAvXlswLTlhLXpdKyQvO1xuZXhwb3J0IGNvbnN0IHVsaWQgPSAvXlswLTlBLUhKS01OUC1UVi1aYS1oamttbnAtdHYtel17MjZ9JC87XG5leHBvcnQgY29uc3QgeGlkID0gL15bMC05YS12QS1WXXsyMH0kLztcbmV4cG9ydCBjb25zdCBrc3VpZCA9IC9eW0EtWmEtejAtOV17Mjd9JC87XG5leHBvcnQgY29uc3QgbmFub2lkID0gL15bYS16QS1aMC05Xy1dezIxfSQvO1xuLyoqIElTTyA4NjAxLTEgZHVyYXRpb24gcmVnZXguIERvZXMgbm90IHN1cHBvcnQgdGhlIDg2MDEtMiBleHRlbnNpb25zIGxpa2UgbmVnYXRpdmUgZHVyYXRpb25zIG9yIGZyYWN0aW9uYWwvbmVnYXRpdmUgY29tcG9uZW50cy4gKi9cbmV4cG9ydCBjb25zdCBkdXJhdGlvbiA9IC9eUCg/OihcXGQrVyl8KD8hLipXKSg/PVxcZHxUXFxkKShcXGQrWSk/KFxcZCtNKT8oXFxkK0QpPyhUKD89XFxkKShcXGQrSCk/KFxcZCtNKT8oXFxkKyhbLixdXFxkKyk/Uyk/KT8pJC87XG4vKiogSW1wbGVtZW50cyBJU08gODYwMS0yIGV4dGVuc2lvbnMgbGlrZSBleHBsaWNpdCArLSBwcmVmaXhlcywgbWl4aW5nIHdlZWtzIHdpdGggb3RoZXIgdW5pdHMsIGFuZCBmcmFjdGlvbmFsL25lZ2F0aXZlIGNvbXBvbmVudHMuICovXG5leHBvcnQgY29uc3QgZXh0ZW5kZWREdXJhdGlvbiA9IC9eWy0rXT9QKD8hJCkoPzooPzpbLStdP1xcZCtZKXwoPzpbLStdP1xcZCtbLixdXFxkK1kkKSk/KD86KD86Wy0rXT9cXGQrTSl8KD86Wy0rXT9cXGQrWy4sXVxcZCtNJCkpPyg/Oig/OlstK10/XFxkK1cpfCg/OlstK10/XFxkK1suLF1cXGQrVyQpKT8oPzooPzpbLStdP1xcZCtEKXwoPzpbLStdP1xcZCtbLixdXFxkK0QkKSk/KD86VCg/PVtcXGQrLV0pKD86KD86Wy0rXT9cXGQrSCl8KD86Wy0rXT9cXGQrWy4sXVxcZCtIJCkpPyg/Oig/OlstK10/XFxkK00pfCg/OlstK10/XFxkK1suLF1cXGQrTSQpKT8oPzpbLStdP1xcZCsoPzpbLixdXFxkKyk/Uyk/KT8/JC87XG4vKiogQSByZWdleCBmb3IgYW55IFVVSUQtbGlrZSBpZGVudGlmaWVyOiA4LTQtNC00LTEyIGhleCBwYXR0ZXJuICovXG5leHBvcnQgY29uc3QgZ3VpZCA9IC9eKFswLTlhLWZBLUZdezh9LVswLTlhLWZBLUZdezR9LVswLTlhLWZBLUZdezR9LVswLTlhLWZBLUZdezR9LVswLTlhLWZBLUZdezEyfSkkLztcbi8qKiBSZXR1cm5zIGEgcmVnZXggZm9yIHZhbGlkYXRpbmcgYW4gUkZDIDk1NjIvNDEyMiBVVUlELlxuICpcbiAqIEBwYXJhbSB2ZXJzaW9uIE9wdGlvbmFsbHkgc3BlY2lmeSBhIHZlcnNpb24gMS04LiBJZiBubyB2ZXJzaW9uIGlzIHNwZWNpZmllZCwgYWxsIHZlcnNpb25zIGFyZSBzdXBwb3J0ZWQuICovXG5leHBvcnQgY29uc3QgdXVpZCA9ICh2ZXJzaW9uKSA9PiB7XG4gICAgaWYgKCF2ZXJzaW9uKVxuICAgICAgICByZXR1cm4gL14oWzAtOWEtZkEtRl17OH0tWzAtOWEtZkEtRl17NH0tWzEtOF1bMC05YS1mQS1GXXszfS1bODlhYkFCXVswLTlhLWZBLUZdezN9LVswLTlhLWZBLUZdezEyfXwwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDB8ZmZmZmZmZmYtZmZmZi1mZmZmLWZmZmYtZmZmZmZmZmZmZmZmKSQvO1xuICAgIHJldHVybiBuZXcgUmVnRXhwKGBeKFswLTlhLWZBLUZdezh9LVswLTlhLWZBLUZdezR9LSR7dmVyc2lvbn1bMC05YS1mQS1GXXszfS1bODlhYkFCXVswLTlhLWZBLUZdezN9LVswLTlhLWZBLUZdezEyfSkkYCk7XG59O1xuZXhwb3J0IGNvbnN0IHV1aWQ0ID0gLypAX19QVVJFX18qLyB1dWlkKDQpO1xuZXhwb3J0IGNvbnN0IHV1aWQ2ID0gLypAX19QVVJFX18qLyB1dWlkKDYpO1xuZXhwb3J0IGNvbnN0IHV1aWQ3ID0gLypAX19QVVJFX18qLyB1dWlkKDcpO1xuLyoqIFByYWN0aWNhbCBlbWFpbCB2YWxpZGF0aW9uICovXG5leHBvcnQgY29uc3QgZW1haWwgPSAvXig/IVxcLikoPyEuKlxcLlxcLikoW0EtWmEtejAtOV8nK1xcLVxcLl0qKVtBLVphLXowLTlfKy1dQChbQS1aYS16MC05XVtBLVphLXowLTlcXC1dKlxcLikrW0EtWmEtel17Mix9JC87XG4vKiogRXF1aXZhbGVudCB0byB0aGUgSFRNTDUgaW5wdXRbdHlwZT1lbWFpbF0gdmFsaWRhdGlvbiBpbXBsZW1lbnRlZCBieSBicm93c2Vycy4gU291cmNlOiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9IVE1ML0VsZW1lbnQvaW5wdXQvZW1haWwgKi9cbmV4cG9ydCBjb25zdCBodG1sNUVtYWlsID0gL15bYS16QS1aMC05LiEjJCUmJyorLz0/Xl9ge3x9fi1dK0BbYS16QS1aMC05XSg/OlthLXpBLVowLTktXXswLDYxfVthLXpBLVowLTldKT8oPzpcXC5bYS16QS1aMC05XSg/OlthLXpBLVowLTktXXswLDYxfVthLXpBLVowLTldKT8pKiQvO1xuLyoqIFRoZSBjbGFzc2ljIGVtYWlscmVnZXguY29tIHJlZ2V4IGZvciBSRkMgNTMyMi1jb21wbGlhbnQgZW1haWxzICovXG5leHBvcnQgY29uc3QgcmZjNTMyMkVtYWlsID0gL14oKFtePD4oKVxcW1xcXVxcXFwuLDs6XFxzQFwiXSsoXFwuW148PigpXFxbXFxdXFxcXC4sOzpcXHNAXCJdKykqKXwoXCIuK1wiKSlAKChcXFtbMC05XXsxLDN9XFwuWzAtOV17MSwzfVxcLlswLTldezEsM31cXC5bMC05XXsxLDN9XSl8KChbYS16QS1aXFwtMC05XStcXC4pK1thLXpBLVpdezIsfSkpJC87XG4vKiogQSBsb29zZSByZWdleCB0aGF0IGFsbG93cyBVbmljb2RlIGNoYXJhY3RlcnMsIGVuZm9yY2VzIGxlbmd0aCBsaW1pdHMsIGFuZCB0aGF0J3MgYWJvdXQgaXQuICovXG5leHBvcnQgY29uc3QgdW5pY29kZUVtYWlsID0gL15bXlxcc0BcIl17MSw2NH1AW15cXHNAXXsxLDI1NX0kL3U7XG5leHBvcnQgY29uc3QgaWRuRW1haWwgPSB1bmljb2RlRW1haWw7XG5leHBvcnQgY29uc3QgYnJvd3NlckVtYWlsID0gL15bYS16QS1aMC05LiEjJCUmJyorLz0/Xl9ge3x9fi1dK0BbYS16QS1aMC05XSg/OlthLXpBLVowLTktXXswLDYxfVthLXpBLVowLTldKT8oPzpcXC5bYS16QS1aMC05XSg/OlthLXpBLVowLTktXXswLDYxfVthLXpBLVowLTldKT8pKiQvO1xuLy8gZnJvbSBodHRwczovL3RoZWtldmluc2NvdHQuY29tL2Vtb2ppcy1pbi1qYXZhc2NyaXB0LyN3cml0aW5nLWEtcmVndWxhci1leHByZXNzaW9uXG5jb25zdCBfZW1vamkgPSBgXihcXFxccHtFeHRlbmRlZF9QaWN0b2dyYXBoaWN9fFxcXFxwe0Vtb2ppX0NvbXBvbmVudH0pKyRgO1xuZXhwb3J0IGZ1bmN0aW9uIGVtb2ppKCkge1xuICAgIHJldHVybiBuZXcgUmVnRXhwKF9lbW9qaSwgXCJ1XCIpO1xufVxuZXhwb3J0IGNvbnN0IGlwdjQgPSAvXig/Oig/OjI1WzAtNV18MlswLTRdWzAtOV18MVswLTldWzAtOV18WzEtOV1bMC05XXxbMC05XSlcXC4pezN9KD86MjVbMC01XXwyWzAtNF1bMC05XXwxWzAtOV1bMC05XXxbMS05XVswLTldfFswLTldKSQvO1xuZXhwb3J0IGNvbnN0IGlwdjYgPSAvXigoWzAtOWEtZkEtRl17MSw0fTopezd9WzAtOWEtZkEtRl17MSw0fXwoWzAtOWEtZkEtRl17MSw0fTopezEsN306fChbMC05YS1mQS1GXXsxLDR9Oil7MSw2fTpbMC05YS1mQS1GXXsxLDR9fChbMC05YS1mQS1GXXsxLDR9Oil7MSw1fSg6WzAtOWEtZkEtRl17MSw0fSl7MSwyfXwoWzAtOWEtZkEtRl17MSw0fTopezEsNH0oOlswLTlhLWZBLUZdezEsNH0pezEsM318KFswLTlhLWZBLUZdezEsNH06KXsxLDN9KDpbMC05YS1mQS1GXXsxLDR9KXsxLDR9fChbMC05YS1mQS1GXXsxLDR9Oil7MSwyfSg6WzAtOWEtZkEtRl17MSw0fSl7MSw1fXxbMC05YS1mQS1GXXsxLDR9OigoOlswLTlhLWZBLUZdezEsNH0pezEsNn0pfDooKDpbMC05YS1mQS1GXXsxLDR9KXsxLDd9fDopKSQvO1xuZXhwb3J0IGNvbnN0IG1hYyA9IChkZWxpbWl0ZXIpID0+IHtcbiAgICBjb25zdCBlc2NhcGVkRGVsaW0gPSB1dGlsLmVzY2FwZVJlZ2V4KGRlbGltaXRlciA/PyBcIjpcIik7XG4gICAgcmV0dXJuIG5ldyBSZWdFeHAoYF4oPzpbMC05QS1GXXsyfSR7ZXNjYXBlZERlbGltfSl7NX1bMC05QS1GXXsyfSR8Xig/OlswLTlhLWZdezJ9JHtlc2NhcGVkRGVsaW19KXs1fVswLTlhLWZdezJ9JGApO1xufTtcbmV4cG9ydCBjb25zdCBjaWRydjQgPSAvXigoMjVbMC01XXwyWzAtNF1bMC05XXwxWzAtOV1bMC05XXxbMS05XVswLTldfFswLTldKVxcLil7M30oMjVbMC01XXwyWzAtNF1bMC05XXwxWzAtOV1bMC05XXxbMS05XVswLTldfFswLTldKVxcLyhbMC05XXxbMS0yXVswLTldfDNbMC0yXSkkLztcbmV4cG9ydCBjb25zdCBjaWRydjYgPSAvXigoWzAtOWEtZkEtRl17MSw0fTopezd9WzAtOWEtZkEtRl17MSw0fXw6OnwoWzAtOWEtZkEtRl17MSw0fSk/OjooWzAtOWEtZkEtRl17MSw0fTo/KXswLDZ9KVxcLygxMlswLThdfDFbMDFdWzAtOV18WzEtOV0/WzAtOV0pJC87XG4vLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy83ODYwMzkyL2RldGVybWluZS1pZi1zdHJpbmctaXMtaW4tYmFzZTY0LXVzaW5nLWphdmFzY3JpcHRcbmV4cG9ydCBjb25zdCBiYXNlNjQgPSAvXiR8Xig/OlswLTlhLXpBLVorL117NH0pKig/Oig/OlswLTlhLXpBLVorL117Mn09PSl8KD86WzAtOWEtekEtWisvXXszfT0pKT8kLztcbmV4cG9ydCBjb25zdCBiYXNlNjR1cmwgPSAvXltBLVphLXowLTlfLV0qJC87XG4vLyBiYXNlZCBvbiBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMDYxNzkvcmVndWxhci1leHByZXNzaW9uLXRvLW1hdGNoLWRucy1ob3N0bmFtZS1vci1pcC1hZGRyZXNzXG4vLyBleHBvcnQgY29uc3QgaG9zdG5hbWU6IFJlZ0V4cCA9IC9eKFthLXpBLVowLTktXStcXC4pKlthLXpBLVowLTktXSskLztcbmV4cG9ydCBjb25zdCBob3N0bmFtZSA9IC9eKD89LnsxLDI1M31cXC4/JClbYS16QS1aMC05XSg/OlthLXpBLVowLTktXXswLDYxfVthLXpBLVowLTldKT8oPzpcXC5bYS16QS1aMC05XSg/OlstMC05YS16QS1aXXswLDYxfVswLTlhLXpBLVpdKT8pKlxcLj8kLztcbmV4cG9ydCBjb25zdCBkb21haW4gPSAvXihbYS16QS1aMC05XSg/OlthLXpBLVowLTktXXswLDYxfVthLXpBLVowLTldKT9cXC4pK1thLXpBLVpdezIsfSQvO1xuZXhwb3J0IGNvbnN0IGh0dHBQcm90b2NvbCA9IC9eaHR0cHM/JC87XG4vLyBodHRwczovL2Jsb2cuc3RldmVubGV2aXRoYW4uY29tL2FyY2hpdmVzL3ZhbGlkYXRlLXBob25lLW51bWJlciNyNC0zIChyZWdleCBzYW5zIHNwYWNlcylcbi8vIEUuMTY0OiBsZWFkaW5nIGRpZ2l0IG11c3QgYmUgMS05OyB0b3RhbCBkaWdpdHMgKGV4Y2x1ZGluZyAnKycpIGJldHdlZW4gNy0xNVxuZXhwb3J0IGNvbnN0IGUxNjQgPSAvXlxcK1sxLTldXFxkezYsMTR9JC87XG4vLyBjb25zdCBkYXRlU291cmNlID0gYCgoXFxcXGRcXFxcZFsyNDY4XVswNDhdfFxcXFxkXFxcXGRbMTM1NzldWzI2XXxcXFxcZFxcXFxkMFs0OF18WzAyNDY4XVswNDhdMDB8WzEzNTc5XVsyNl0wMCktMDItMjl8XFxcXGR7NH0tKCgwWzEzNTc4XXwxWzAyXSktKDBbMS05XXxbMTJdXFxcXGR8M1swMV0pfCgwWzQ2OV18MTEpLSgwWzEtOV18WzEyXVxcXFxkfDMwKXwoMDIpLSgwWzEtOV18MVxcXFxkfDJbMC04XSkpKWA7XG5jb25zdCBkYXRlU291cmNlID0gYCg/Oig/OlxcXFxkXFxcXGRbMjQ2OF1bMDQ4XXxcXFxcZFxcXFxkWzEzNTc5XVsyNl18XFxcXGRcXFxcZDBbNDhdfFswMjQ2OF1bMDQ4XTAwfFsxMzU3OV1bMjZdMDApLTAyLTI5fFxcXFxkezR9LSg/Oig/OjBbMTM1NzhdfDFbMDJdKS0oPzowWzEtOV18WzEyXVxcXFxkfDNbMDFdKXwoPzowWzQ2OV18MTEpLSg/OjBbMS05XXxbMTJdXFxcXGR8MzApfCg/OjAyKS0oPzowWzEtOV18MVxcXFxkfDJbMC04XSkpKWA7XG5leHBvcnQgY29uc3QgZGF0ZSA9IC8qQF9fUFVSRV9fKi8gbmV3IFJlZ0V4cChgXiR7ZGF0ZVNvdXJjZX0kYCk7XG5mdW5jdGlvbiB0aW1lU291cmNlKGFyZ3MpIHtcbiAgICBjb25zdCBoaG1tID0gYCg/OlswMV1cXFxcZHwyWzAtM10pOlswLTVdXFxcXGRgO1xuICAgIGNvbnN0IHJlZ2V4ID0gdHlwZW9mIGFyZ3MucHJlY2lzaW9uID09PSBcIm51bWJlclwiXG4gICAgICAgID8gYXJncy5wcmVjaXNpb24gPT09IC0xXG4gICAgICAgICAgICA/IGAke2hobW19YFxuICAgICAgICAgICAgOiBhcmdzLnByZWNpc2lvbiA9PT0gMFxuICAgICAgICAgICAgICAgID8gYCR7aGhtbX06WzAtNV1cXFxcZGBcbiAgICAgICAgICAgICAgICA6IGAke2hobW19OlswLTVdXFxcXGRcXFxcLlxcXFxkeyR7YXJncy5wcmVjaXNpb259fWBcbiAgICAgICAgOiBgJHtoaG1tfSg/OjpbMC01XVxcXFxkKD86XFxcXC5cXFxcZCspPyk/YDtcbiAgICByZXR1cm4gcmVnZXg7XG59XG5leHBvcnQgZnVuY3Rpb24gdGltZShhcmdzKSB7XG4gICAgcmV0dXJuIG5ldyBSZWdFeHAoYF4ke3RpbWVTb3VyY2UoYXJncyl9JGApO1xufVxuLy8gQWRhcHRlZCBmcm9tIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8zMTQzMjMxXG5leHBvcnQgZnVuY3Rpb24gZGF0ZXRpbWUoYXJncykge1xuICAgIGNvbnN0IHRpbWUgPSB0aW1lU291cmNlKHsgcHJlY2lzaW9uOiBhcmdzLnByZWNpc2lvbiB9KTtcbiAgICBjb25zdCBvcHRzID0gW1wiWlwiXTtcbiAgICBpZiAoYXJncy5sb2NhbClcbiAgICAgICAgb3B0cy5wdXNoKFwiXCIpO1xuICAgIC8vIGlmIChhcmdzLm9mZnNldCkgb3B0cy5wdXNoKGAoWystXVxcXFxkezJ9OlxcXFxkezJ9KWApO1xuICAgIGlmIChhcmdzLm9mZnNldClcbiAgICAgICAgb3B0cy5wdXNoKGAoWystXSg/OlswMV1cXFxcZHwyWzAtM10pOlswLTVdXFxcXGQpYCk7XG4gICAgY29uc3QgdGltZVJlZ2V4ID0gYCR7dGltZX0oPzoke29wdHMuam9pbihcInxcIil9KWA7XG4gICAgcmV0dXJuIG5ldyBSZWdFeHAoYF4ke2RhdGVTb3VyY2V9VCg/OiR7dGltZVJlZ2V4fSkkYCk7XG59XG5leHBvcnQgY29uc3Qgc3RyaW5nID0gKHBhcmFtcykgPT4ge1xuICAgIGNvbnN0IHJlZ2V4ID0gcGFyYW1zID8gYFtcXFxcc1xcXFxTXXske3BhcmFtcz8ubWluaW11bSA/PyAwfSwke3BhcmFtcz8ubWF4aW11bSA/PyBcIlwifX1gIDogYFtcXFxcc1xcXFxTXSpgO1xuICAgIHJldHVybiBuZXcgUmVnRXhwKGBeJHtyZWdleH0kYCk7XG59O1xuZXhwb3J0IGNvbnN0IGJpZ2ludCA9IC9eLT9cXGQrbj8kLztcbmV4cG9ydCBjb25zdCBpbnRlZ2VyID0gL14tP1xcZCskLztcbmV4cG9ydCBjb25zdCBudW1iZXIgPSAvXi0/XFxkKyg/OlxcLlxcZCspPyQvO1xuZXhwb3J0IGNvbnN0IGJvb2xlYW4gPSAvXig/OnRydWV8ZmFsc2UpJC9pO1xuY29uc3QgX251bGwgPSAvXm51bGwkL2k7XG5leHBvcnQgeyBfbnVsbCBhcyBudWxsIH07XG5jb25zdCBfdW5kZWZpbmVkID0gL151bmRlZmluZWQkL2k7XG5leHBvcnQgeyBfdW5kZWZpbmVkIGFzIHVuZGVmaW5lZCB9O1xuLy8gcmVnZXggZm9yIHN0cmluZyB3aXRoIG5vIHVwcGVyY2FzZSBsZXR0ZXJzXG5leHBvcnQgY29uc3QgbG93ZXJjYXNlID0gL15bXkEtWl0qJC87XG4vLyByZWdleCBmb3Igc3RyaW5nIHdpdGggbm8gbG93ZXJjYXNlIGxldHRlcnNcbmV4cG9ydCBjb25zdCB1cHBlcmNhc2UgPSAvXlteYS16XSokLztcbi8vIHJlZ2V4IGZvciBoZXhhZGVjaW1hbCBzdHJpbmdzIChhbnkgbGVuZ3RoKVxuZXhwb3J0IGNvbnN0IGhleCA9IC9eWzAtOWEtZkEtRl0qJC87XG4vLyBIYXNoIHJlZ2V4ZXMgZm9yIGRpZmZlcmVudCBhbGdvcml0aG1zIGFuZCBlbmNvZGluZ3Ncbi8vIEhlbHBlciBmdW5jdGlvbiB0byBjcmVhdGUgYmFzZTY0IHJlZ2V4IHdpdGggZXhhY3QgbGVuZ3RoIGFuZCBwYWRkaW5nXG5mdW5jdGlvbiBmaXhlZEJhc2U2NChib2R5TGVuZ3RoLCBwYWRkaW5nKSB7XG4gICAgcmV0dXJuIG5ldyBSZWdFeHAoYF5bQS1aYS16MC05Ky9deyR7Ym9keUxlbmd0aH19JHtwYWRkaW5nfSRgKTtcbn1cbi8vIEhlbHBlciBmdW5jdGlvbiB0byBjcmVhdGUgYmFzZTY0dXJsIHJlZ2V4IHdpdGggZXhhY3QgbGVuZ3RoIChubyBwYWRkaW5nKVxuZnVuY3Rpb24gZml4ZWRCYXNlNjR1cmwobGVuZ3RoKSB7XG4gICAgcmV0dXJuIG5ldyBSZWdFeHAoYF5bQS1aYS16MC05Xy1deyR7bGVuZ3RofX0kYCk7XG59XG4vLyBNRDUgKDE2IGJ5dGVzKTogYmFzZTY0ID0gMjQgY2hhcnMgdG90YWwgKDIyICsgXCI9PVwiKVxuZXhwb3J0IGNvbnN0IG1kNV9oZXggPSAvXlswLTlhLWZBLUZdezMyfSQvO1xuZXhwb3J0IGNvbnN0IG1kNV9iYXNlNjQgPSAvKkBfX1BVUkVfXyovIGZpeGVkQmFzZTY0KDIyLCBcIj09XCIpO1xuZXhwb3J0IGNvbnN0IG1kNV9iYXNlNjR1cmwgPSAvKkBfX1BVUkVfXyovIGZpeGVkQmFzZTY0dXJsKDIyKTtcbi8vIFNIQTEgKDIwIGJ5dGVzKTogYmFzZTY0ID0gMjggY2hhcnMgdG90YWwgKDI3ICsgXCI9XCIpXG5leHBvcnQgY29uc3Qgc2hhMV9oZXggPSAvXlswLTlhLWZBLUZdezQwfSQvO1xuZXhwb3J0IGNvbnN0IHNoYTFfYmFzZTY0ID0gLypAX19QVVJFX18qLyBmaXhlZEJhc2U2NCgyNywgXCI9XCIpO1xuZXhwb3J0IGNvbnN0IHNoYTFfYmFzZTY0dXJsID0gLypAX19QVVJFX18qLyBmaXhlZEJhc2U2NHVybCgyNyk7XG4vLyBTSEEyNTYgKDMyIGJ5dGVzKTogYmFzZTY0ID0gNDQgY2hhcnMgdG90YWwgKDQzICsgXCI9XCIpXG5leHBvcnQgY29uc3Qgc2hhMjU2X2hleCA9IC9eWzAtOWEtZkEtRl17NjR9JC87XG5leHBvcnQgY29uc3Qgc2hhMjU2X2Jhc2U2NCA9IC8qQF9fUFVSRV9fKi8gZml4ZWRCYXNlNjQoNDMsIFwiPVwiKTtcbmV4cG9ydCBjb25zdCBzaGEyNTZfYmFzZTY0dXJsID0gLypAX19QVVJFX18qLyBmaXhlZEJhc2U2NHVybCg0Myk7XG4vLyBTSEEzODQgKDQ4IGJ5dGVzKTogYmFzZTY0ID0gNjQgY2hhcnMgdG90YWwgKG5vIHBhZGRpbmcpXG5leHBvcnQgY29uc3Qgc2hhMzg0X2hleCA9IC9eWzAtOWEtZkEtRl17OTZ9JC87XG5leHBvcnQgY29uc3Qgc2hhMzg0X2Jhc2U2NCA9IC8qQF9fUFVSRV9fKi8gZml4ZWRCYXNlNjQoNjQsIFwiXCIpO1xuZXhwb3J0IGNvbnN0IHNoYTM4NF9iYXNlNjR1cmwgPSAvKkBfX1BVUkVfXyovIGZpeGVkQmFzZTY0dXJsKDY0KTtcbi8vIFNIQTUxMiAoNjQgYnl0ZXMpOiBiYXNlNjQgPSA4OCBjaGFycyB0b3RhbCAoODYgKyBcIj09XCIpXG5leHBvcnQgY29uc3Qgc2hhNTEyX2hleCA9IC9eWzAtOWEtZkEtRl17MTI4fSQvO1xuZXhwb3J0IGNvbnN0IHNoYTUxMl9iYXNlNjQgPSAvKkBfX1BVUkVfXyovIGZpeGVkQmFzZTY0KDg2LCBcIj09XCIpO1xuZXhwb3J0IGNvbnN0IHNoYTUxMl9iYXNlNjR1cmwgPSAvKkBfX1BVUkVfXyovIGZpeGVkQmFzZTY0dXJsKDg2KTtcbiIsImltcG9ydCB7IGdsb2JhbENvbmZpZyB9IGZyb20gXCIuL2NvcmUuanNcIjtcbi8vIGZ1bmN0aW9uc1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydEVxdWFsKHZhbCkge1xuICAgIHJldHVybiB2YWw7XG59XG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0Tm90RXF1YWwodmFsKSB7XG4gICAgcmV0dXJuIHZhbDtcbn1cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRJcyhfYXJnKSB7IH1cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnROZXZlcihfeCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgdmFsdWUgaW4gZXhoYXVzdGl2ZSBjaGVja1wiKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnQoXykgeyB9XG5leHBvcnQgZnVuY3Rpb24gZ2V0RW51bVZhbHVlcyhlbnRyaWVzKSB7XG4gICAgY29uc3QgbnVtZXJpY1ZhbHVlcyA9IE9iamVjdC52YWx1ZXMoZW50cmllcykuZmlsdGVyKCh2KSA9PiB0eXBlb2YgdiA9PT0gXCJudW1iZXJcIik7XG4gICAgY29uc3QgdmFsdWVzID0gT2JqZWN0LmVudHJpZXMoZW50cmllcylcbiAgICAgICAgLmZpbHRlcigoW2ssIF9dKSA9PiBudW1lcmljVmFsdWVzLmluZGV4T2YoK2spID09PSAtMSlcbiAgICAgICAgLm1hcCgoW18sIHZdKSA9PiB2KTtcbiAgICByZXR1cm4gdmFsdWVzO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGpvaW5WYWx1ZXMoYXJyYXksIHNlcGFyYXRvciA9IFwifFwiKSB7XG4gICAgcmV0dXJuIGFycmF5Lm1hcCgodmFsKSA9PiBzdHJpbmdpZnlQcmltaXRpdmUodmFsKSkuam9pbihzZXBhcmF0b3IpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGpzb25TdHJpbmdpZnlSZXBsYWNlcihfLCB2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwiYmlnaW50XCIpXG4gICAgICAgIHJldHVybiB2YWx1ZS50b1N0cmluZygpO1xuICAgIHJldHVybiB2YWx1ZTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBjYWNoZWQoZ2V0dGVyKSB7XG4gICAgY29uc3Qgc2V0ID0gZmFsc2U7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ2V0IHZhbHVlKCkge1xuICAgICAgICAgICAgaWYgKCFzZXQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGdldHRlcigpO1xuICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBcInZhbHVlXCIsIHsgdmFsdWUgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiY2FjaGVkIHZhbHVlIGFscmVhZHkgc2V0XCIpO1xuICAgICAgICB9LFxuICAgIH07XG59XG5leHBvcnQgZnVuY3Rpb24gbnVsbGlzaChpbnB1dCkge1xuICAgIHJldHVybiBpbnB1dCA9PT0gbnVsbCB8fCBpbnB1dCA9PT0gdW5kZWZpbmVkO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGNsZWFuUmVnZXgoc291cmNlKSB7XG4gICAgY29uc3Qgc3RhcnQgPSBzb3VyY2Uuc3RhcnRzV2l0aChcIl5cIikgPyAxIDogMDtcbiAgICBjb25zdCBlbmQgPSBzb3VyY2UuZW5kc1dpdGgoXCIkXCIpID8gc291cmNlLmxlbmd0aCAtIDEgOiBzb3VyY2UubGVuZ3RoO1xuICAgIHJldHVybiBzb3VyY2Uuc2xpY2Uoc3RhcnQsIGVuZCk7XG59XG5leHBvcnQgZnVuY3Rpb24gZmxvYXRTYWZlUmVtYWluZGVyKHZhbCwgc3RlcCkge1xuICAgIGNvbnN0IHJhdGlvID0gdmFsIC8gc3RlcDtcbiAgICBjb25zdCByb3VuZGVkUmF0aW8gPSBNYXRoLnJvdW5kKHJhdGlvKTtcbiAgICAvLyBVc2UgYSByZWxhdGl2ZSBlcHNpbG9uIHNjYWxlZCB0byB0aGUgbWFnbml0dWRlIG9mIHRoZSByZXN1bHRcbiAgICBjb25zdCB0b2xlcmFuY2UgPSBOdW1iZXIuRVBTSUxPTiAqIE1hdGgubWF4KE1hdGguYWJzKHJhdGlvKSwgMSk7XG4gICAgaWYgKE1hdGguYWJzKHJhdGlvIC0gcm91bmRlZFJhdGlvKSA8IHRvbGVyYW5jZSlcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgcmV0dXJuIHJhdGlvIC0gcm91bmRlZFJhdGlvO1xufVxuY29uc3QgRVZBTFVBVElORyA9IC8qIEBfX1BVUkVfXyovIFN5bWJvbChcImV2YWx1YXRpbmdcIik7XG5leHBvcnQgZnVuY3Rpb24gZGVmaW5lTGF6eShvYmplY3QsIGtleSwgZ2V0dGVyKSB7XG4gICAgbGV0IHZhbHVlID0gdW5kZWZpbmVkO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmplY3QsIGtleSwge1xuICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IEVWQUxVQVRJTkcpIHtcbiAgICAgICAgICAgICAgICAvLyBDaXJjdWxhciByZWZlcmVuY2UgZGV0ZWN0ZWQsIHJldHVybiB1bmRlZmluZWQgdG8gYnJlYWsgdGhlIGN5Y2xlXG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBFVkFMVUFUSU5HO1xuICAgICAgICAgICAgICAgIHZhbHVlID0gZ2V0dGVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIHNldCh2KSB7XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqZWN0LCBrZXksIHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogdixcbiAgICAgICAgICAgICAgICAvLyBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIG9iamVjdFtrZXldID0gdjtcbiAgICAgICAgfSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIH0pO1xufVxuZXhwb3J0IGZ1bmN0aW9uIG9iamVjdENsb25lKG9iaikge1xuICAgIHJldHVybiBPYmplY3QuY3JlYXRlKE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmopLCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhvYmopKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBhc3NpZ25Qcm9wKHRhcmdldCwgcHJvcCwgdmFsdWUpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBwcm9wLCB7XG4gICAgICAgIHZhbHVlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIH0pO1xufVxuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlRGVmcyguLi5kZWZzKSB7XG4gICAgY29uc3QgbWVyZ2VkRGVzY3JpcHRvcnMgPSB7fTtcbiAgICBmb3IgKGNvbnN0IGRlZiBvZiBkZWZzKSB7XG4gICAgICAgIGNvbnN0IGRlc2NyaXB0b3JzID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoZGVmKTtcbiAgICAgICAgT2JqZWN0LmFzc2lnbihtZXJnZWREZXNjcmlwdG9ycywgZGVzY3JpcHRvcnMpO1xuICAgIH1cbiAgICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoe30sIG1lcmdlZERlc2NyaXB0b3JzKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBjbG9uZURlZihzY2hlbWEpIHtcbiAgICByZXR1cm4gbWVyZ2VEZWZzKHNjaGVtYS5fem9kLmRlZik7XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0RWxlbWVudEF0UGF0aChvYmosIHBhdGgpIHtcbiAgICBpZiAoIXBhdGgpXG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgcmV0dXJuIHBhdGgucmVkdWNlKChhY2MsIGtleSkgPT4gYWNjPy5ba2V5XSwgb2JqKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBwcm9taXNlQWxsT2JqZWN0KHByb21pc2VzT2JqKSB7XG4gICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKHByb21pc2VzT2JqKTtcbiAgICBjb25zdCBwcm9taXNlcyA9IGtleXMubWFwKChrZXkpID0+IHByb21pc2VzT2JqW2tleV0pO1xuICAgIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcykudGhlbigocmVzdWx0cykgPT4ge1xuICAgICAgICBjb25zdCByZXNvbHZlZE9iaiA9IHt9O1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHJlc29sdmVkT2JqW2tleXNbaV1dID0gcmVzdWx0c1tpXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzb2x2ZWRPYmo7XG4gICAgfSk7XG59XG5leHBvcnQgZnVuY3Rpb24gcmFuZG9tU3RyaW5nKGxlbmd0aCA9IDEwKSB7XG4gICAgY29uc3QgY2hhcnMgPSBcImFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6XCI7XG4gICAgbGV0IHN0ciA9IFwiXCI7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBzdHIgKz0gY2hhcnNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY2hhcnMubGVuZ3RoKV07XG4gICAgfVxuICAgIHJldHVybiBzdHI7XG59XG5leHBvcnQgZnVuY3Rpb24gZXNjKHN0cikge1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShzdHIpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHNsdWdpZnkoaW5wdXQpIHtcbiAgICByZXR1cm4gaW5wdXRcbiAgICAgICAgLnRvTG93ZXJDYXNlKClcbiAgICAgICAgLnRyaW0oKVxuICAgICAgICAucmVwbGFjZSgvW15cXHdcXHMtXS9nLCBcIlwiKVxuICAgICAgICAucmVwbGFjZSgvW1xcc18tXSsvZywgXCItXCIpXG4gICAgICAgIC5yZXBsYWNlKC9eLSt8LSskL2csIFwiXCIpO1xufVxuZXhwb3J0IGNvbnN0IGNhcHR1cmVTdGFja1RyYWNlID0gKFwiY2FwdHVyZVN0YWNrVHJhY2VcIiBpbiBFcnJvciA/IEVycm9yLmNhcHR1cmVTdGFja1RyYWNlIDogKC4uLl9hcmdzKSA9PiB7IH0pO1xuZXhwb3J0IGZ1bmN0aW9uIGlzT2JqZWN0KGRhdGEpIHtcbiAgICByZXR1cm4gdHlwZW9mIGRhdGEgPT09IFwib2JqZWN0XCIgJiYgZGF0YSAhPT0gbnVsbCAmJiAhQXJyYXkuaXNBcnJheShkYXRhKTtcbn1cbmV4cG9ydCBjb25zdCBhbGxvd3NFdmFsID0gLyogQF9fUFVSRV9fKi8gY2FjaGVkKCgpID0+IHtcbiAgICAvLyBTa2lwIHRoZSBwcm9iZSB1bmRlciBgaml0bGVzc2A6IHN0cmljdCBDU1BzIHJlcG9ydCB0aGUgY2F1Z2h0IGBuZXcgRnVuY3Rpb25gXG4gICAgLy8gYXMgYSBgc2VjdXJpdHlwb2xpY3l2aW9sYXRpb25gIGV2ZW4gdGhvdWdoIHRoZSB0aHJvdyBpcyBzd2FsbG93ZWQuXG4gICAgaWYgKGdsb2JhbENvbmZpZy5qaXRsZXNzKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIGlmICh0eXBlb2YgbmF2aWdhdG9yICE9PSBcInVuZGVmaW5lZFwiICYmIG5hdmlnYXRvcj8udXNlckFnZW50Py5pbmNsdWRlcyhcIkNsb3VkZmxhcmVcIikpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBjb25zdCBGID0gRnVuY3Rpb247XG4gICAgICAgIG5ldyBGKFwiXCIpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgY2F0Y2ggKF8pIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn0pO1xuZXhwb3J0IGZ1bmN0aW9uIGlzUGxhaW5PYmplY3Qobykge1xuICAgIGlmIChpc09iamVjdChvKSA9PT0gZmFsc2UpXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAvLyBtb2RpZmllZCBjb25zdHJ1Y3RvclxuICAgIGNvbnN0IGN0b3IgPSBvLmNvbnN0cnVjdG9yO1xuICAgIGlmIChjdG9yID09PSB1bmRlZmluZWQpXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIGlmICh0eXBlb2YgY3RvciAhPT0gXCJmdW5jdGlvblwiKVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAvLyBtb2RpZmllZCBwcm90b3R5cGVcbiAgICBjb25zdCBwcm90ID0gY3Rvci5wcm90b3R5cGU7XG4gICAgaWYgKGlzT2JqZWN0KHByb3QpID09PSBmYWxzZSlcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIC8vIGN0b3IgZG9lc24ndCBoYXZlIHN0YXRpYyBgaXNQcm90b3R5cGVPZmBcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHByb3QsIFwiaXNQcm90b3R5cGVPZlwiKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBzaGFsbG93Q2xvbmUobykge1xuICAgIGlmIChpc1BsYWluT2JqZWN0KG8pKVxuICAgICAgICByZXR1cm4geyAuLi5vIH07XG4gICAgaWYgKEFycmF5LmlzQXJyYXkobykpXG4gICAgICAgIHJldHVybiBbLi4ub107XG4gICAgaWYgKG8gaW5zdGFuY2VvZiBNYXApXG4gICAgICAgIHJldHVybiBuZXcgTWFwKG8pO1xuICAgIGlmIChvIGluc3RhbmNlb2YgU2V0KVxuICAgICAgICByZXR1cm4gbmV3IFNldChvKTtcbiAgICByZXR1cm4gbztcbn1cbmV4cG9ydCBmdW5jdGlvbiBudW1LZXlzKGRhdGEpIHtcbiAgICBsZXQga2V5Q291bnQgPSAwO1xuICAgIGZvciAoY29uc3Qga2V5IGluIGRhdGEpIHtcbiAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChkYXRhLCBrZXkpKSB7XG4gICAgICAgICAgICBrZXlDb3VudCsrO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBrZXlDb3VudDtcbn1cbmV4cG9ydCBjb25zdCBnZXRQYXJzZWRUeXBlID0gKGRhdGEpID0+IHtcbiAgICBjb25zdCB0ID0gdHlwZW9mIGRhdGE7XG4gICAgc3dpdGNoICh0KSB7XG4gICAgICAgIGNhc2UgXCJ1bmRlZmluZWRcIjpcbiAgICAgICAgICAgIHJldHVybiBcInVuZGVmaW5lZFwiO1xuICAgICAgICBjYXNlIFwic3RyaW5nXCI6XG4gICAgICAgICAgICByZXR1cm4gXCJzdHJpbmdcIjtcbiAgICAgICAgY2FzZSBcIm51bWJlclwiOlxuICAgICAgICAgICAgcmV0dXJuIE51bWJlci5pc05hTihkYXRhKSA/IFwibmFuXCIgOiBcIm51bWJlclwiO1xuICAgICAgICBjYXNlIFwiYm9vbGVhblwiOlxuICAgICAgICAgICAgcmV0dXJuIFwiYm9vbGVhblwiO1xuICAgICAgICBjYXNlIFwiZnVuY3Rpb25cIjpcbiAgICAgICAgICAgIHJldHVybiBcImZ1bmN0aW9uXCI7XG4gICAgICAgIGNhc2UgXCJiaWdpbnRcIjpcbiAgICAgICAgICAgIHJldHVybiBcImJpZ2ludFwiO1xuICAgICAgICBjYXNlIFwic3ltYm9sXCI6XG4gICAgICAgICAgICByZXR1cm4gXCJzeW1ib2xcIjtcbiAgICAgICAgY2FzZSBcIm9iamVjdFwiOlxuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZGF0YSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJhcnJheVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGRhdGEgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJudWxsXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZGF0YS50aGVuICYmIHR5cGVvZiBkYXRhLnRoZW4gPT09IFwiZnVuY3Rpb25cIiAmJiBkYXRhLmNhdGNoICYmIHR5cGVvZiBkYXRhLmNhdGNoID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJwcm9taXNlXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwZW9mIE1hcCAhPT0gXCJ1bmRlZmluZWRcIiAmJiBkYXRhIGluc3RhbmNlb2YgTWFwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwibWFwXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwZW9mIFNldCAhPT0gXCJ1bmRlZmluZWRcIiAmJiBkYXRhIGluc3RhbmNlb2YgU2V0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwic2V0XCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwZW9mIERhdGUgIT09IFwidW5kZWZpbmVkXCIgJiYgZGF0YSBpbnN0YW5jZW9mIERhdGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJkYXRlXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICBpZiAodHlwZW9mIEZpbGUgIT09IFwidW5kZWZpbmVkXCIgJiYgZGF0YSBpbnN0YW5jZW9mIEZpbGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJmaWxlXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gXCJvYmplY3RcIjtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBkYXRhIHR5cGU6ICR7dH1gKTtcbiAgICB9XG59O1xuZXhwb3J0IGNvbnN0IHByb3BlcnR5S2V5VHlwZXMgPSAvKiBAX19QVVJFX18qLyBuZXcgU2V0KFtcInN0cmluZ1wiLCBcIm51bWJlclwiLCBcInN5bWJvbFwiXSk7XG5leHBvcnQgY29uc3QgcHJpbWl0aXZlVHlwZXMgPSAvKiBAX19QVVJFX18qLyBuZXcgU2V0KFtcbiAgICBcInN0cmluZ1wiLFxuICAgIFwibnVtYmVyXCIsXG4gICAgXCJiaWdpbnRcIixcbiAgICBcImJvb2xlYW5cIixcbiAgICBcInN5bWJvbFwiLFxuICAgIFwidW5kZWZpbmVkXCIsXG5dKTtcbmV4cG9ydCBmdW5jdGlvbiBlc2NhcGVSZWdleChzdHIpIHtcbiAgICByZXR1cm4gc3RyLnJlcGxhY2UoL1suKis/XiR7fSgpfFtcXF1cXFxcXS9nLCBcIlxcXFwkJlwiKTtcbn1cbi8vIHpvZC1zcGVjaWZpYyB1dGlsc1xuZXhwb3J0IGZ1bmN0aW9uIGNsb25lKGluc3QsIGRlZiwgcGFyYW1zKSB7XG4gICAgY29uc3QgY2wgPSBuZXcgaW5zdC5fem9kLmNvbnN0cihkZWYgPz8gaW5zdC5fem9kLmRlZik7XG4gICAgaWYgKCFkZWYgfHwgcGFyYW1zPy5wYXJlbnQpXG4gICAgICAgIGNsLl96b2QucGFyZW50ID0gaW5zdDtcbiAgICByZXR1cm4gY2w7XG59XG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplUGFyYW1zKF9wYXJhbXMpIHtcbiAgICBjb25zdCBwYXJhbXMgPSBfcGFyYW1zO1xuICAgIGlmICghcGFyYW1zKVxuICAgICAgICByZXR1cm4ge307XG4gICAgaWYgKHR5cGVvZiBwYXJhbXMgPT09IFwic3RyaW5nXCIpXG4gICAgICAgIHJldHVybiB7IGVycm9yOiAoKSA9PiBwYXJhbXMgfTtcbiAgICBpZiAocGFyYW1zPy5tZXNzYWdlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKHBhcmFtcz8uZXJyb3IgIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBzcGVjaWZ5IGJvdGggYG1lc3NhZ2VgIGFuZCBgZXJyb3JgIHBhcmFtc1wiKTtcbiAgICAgICAgcGFyYW1zLmVycm9yID0gcGFyYW1zLm1lc3NhZ2U7XG4gICAgfVxuICAgIGRlbGV0ZSBwYXJhbXMubWVzc2FnZTtcbiAgICBpZiAodHlwZW9mIHBhcmFtcy5lcnJvciA9PT0gXCJzdHJpbmdcIilcbiAgICAgICAgcmV0dXJuIHsgLi4ucGFyYW1zLCBlcnJvcjogKCkgPT4gcGFyYW1zLmVycm9yIH07XG4gICAgcmV0dXJuIHBhcmFtcztcbn1cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVUcmFuc3BhcmVudFByb3h5KGdldHRlcikge1xuICAgIGxldCB0YXJnZXQ7XG4gICAgcmV0dXJuIG5ldyBQcm94eSh7fSwge1xuICAgICAgICBnZXQoXywgcHJvcCwgcmVjZWl2ZXIpIHtcbiAgICAgICAgICAgIHRhcmdldCA/PyAodGFyZ2V0ID0gZ2V0dGVyKCkpO1xuICAgICAgICAgICAgcmV0dXJuIFJlZmxlY3QuZ2V0KHRhcmdldCwgcHJvcCwgcmVjZWl2ZXIpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQoXywgcHJvcCwgdmFsdWUsIHJlY2VpdmVyKSB7XG4gICAgICAgICAgICB0YXJnZXQgPz8gKHRhcmdldCA9IGdldHRlcigpKTtcbiAgICAgICAgICAgIHJldHVybiBSZWZsZWN0LnNldCh0YXJnZXQsIHByb3AsIHZhbHVlLCByZWNlaXZlcik7XG4gICAgICAgIH0sXG4gICAgICAgIGhhcyhfLCBwcm9wKSB7XG4gICAgICAgICAgICB0YXJnZXQgPz8gKHRhcmdldCA9IGdldHRlcigpKTtcbiAgICAgICAgICAgIHJldHVybiBSZWZsZWN0Lmhhcyh0YXJnZXQsIHByb3ApO1xuICAgICAgICB9LFxuICAgICAgICBkZWxldGVQcm9wZXJ0eShfLCBwcm9wKSB7XG4gICAgICAgICAgICB0YXJnZXQgPz8gKHRhcmdldCA9IGdldHRlcigpKTtcbiAgICAgICAgICAgIHJldHVybiBSZWZsZWN0LmRlbGV0ZVByb3BlcnR5KHRhcmdldCwgcHJvcCk7XG4gICAgICAgIH0sXG4gICAgICAgIG93bktleXMoXykge1xuICAgICAgICAgICAgdGFyZ2V0ID8/ICh0YXJnZXQgPSBnZXR0ZXIoKSk7XG4gICAgICAgICAgICByZXR1cm4gUmVmbGVjdC5vd25LZXlzKHRhcmdldCk7XG4gICAgICAgIH0sXG4gICAgICAgIGdldE93blByb3BlcnR5RGVzY3JpcHRvcihfLCBwcm9wKSB7XG4gICAgICAgICAgICB0YXJnZXQgPz8gKHRhcmdldCA9IGdldHRlcigpKTtcbiAgICAgICAgICAgIHJldHVybiBSZWZsZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIHByb3ApO1xuICAgICAgICB9LFxuICAgICAgICBkZWZpbmVQcm9wZXJ0eShfLCBwcm9wLCBkZXNjcmlwdG9yKSB7XG4gICAgICAgICAgICB0YXJnZXQgPz8gKHRhcmdldCA9IGdldHRlcigpKTtcbiAgICAgICAgICAgIHJldHVybiBSZWZsZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgcHJvcCwgZGVzY3JpcHRvcik7XG4gICAgICAgIH0sXG4gICAgfSk7XG59XG5leHBvcnQgZnVuY3Rpb24gc3RyaW5naWZ5UHJpbWl0aXZlKHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJiaWdpbnRcIilcbiAgICAgICAgcmV0dXJuIHZhbHVlLnRvU3RyaW5nKCkgKyBcIm5cIjtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiKVxuICAgICAgICByZXR1cm4gYFwiJHt2YWx1ZX1cImA7XG4gICAgcmV0dXJuIGAke3ZhbHVlfWA7XG59XG5leHBvcnQgZnVuY3Rpb24gb3B0aW9uYWxLZXlzKHNoYXBlKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHNoYXBlKS5maWx0ZXIoKGspID0+IHtcbiAgICAgICAgcmV0dXJuIHNoYXBlW2tdLl96b2Qub3B0aW4gPT09IFwib3B0aW9uYWxcIiAmJiBzaGFwZVtrXS5fem9kLm9wdG91dCA9PT0gXCJvcHRpb25hbFwiO1xuICAgIH0pO1xufVxuZXhwb3J0IGNvbnN0IE5VTUJFUl9GT1JNQVRfUkFOR0VTID0ge1xuICAgIHNhZmVpbnQ6IFtOdW1iZXIuTUlOX1NBRkVfSU5URUdFUiwgTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVJdLFxuICAgIGludDMyOiBbLTIxNDc0ODM2NDgsIDIxNDc0ODM2NDddLFxuICAgIHVpbnQzMjogWzAsIDQyOTQ5NjcyOTVdLFxuICAgIGZsb2F0MzI6IFstMy40MDI4MjM0NjYzODUyODg2ZTM4LCAzLjQwMjgyMzQ2NjM4NTI4ODZlMzhdLFxuICAgIGZsb2F0NjQ6IFstTnVtYmVyLk1BWF9WQUxVRSwgTnVtYmVyLk1BWF9WQUxVRV0sXG59O1xuZXhwb3J0IGNvbnN0IEJJR0lOVF9GT1JNQVRfUkFOR0VTID0ge1xuICAgIGludDY0OiBbLyogQF9fUFVSRV9fKi8gQmlnSW50KFwiLTkyMjMzNzIwMzY4NTQ3NzU4MDhcIiksIC8qIEBfX1BVUkVfXyovIEJpZ0ludChcIjkyMjMzNzIwMzY4NTQ3NzU4MDdcIildLFxuICAgIHVpbnQ2NDogWy8qIEBfX1BVUkVfXyovIEJpZ0ludCgwKSwgLyogQF9fUFVSRV9fKi8gQmlnSW50KFwiMTg0NDY3NDQwNzM3MDk1NTE2MTVcIildLFxufTtcbmV4cG9ydCBmdW5jdGlvbiBwaWNrKHNjaGVtYSwgbWFzaykge1xuICAgIGNvbnN0IGN1cnJEZWYgPSBzY2hlbWEuX3pvZC5kZWY7XG4gICAgY29uc3QgY2hlY2tzID0gY3VyckRlZi5jaGVja3M7XG4gICAgY29uc3QgaGFzQ2hlY2tzID0gY2hlY2tzICYmIGNoZWNrcy5sZW5ndGggPiAwO1xuICAgIGlmIChoYXNDaGVja3MpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiLnBpY2soKSBjYW5ub3QgYmUgdXNlZCBvbiBvYmplY3Qgc2NoZW1hcyBjb250YWluaW5nIHJlZmluZW1lbnRzXCIpO1xuICAgIH1cbiAgICBjb25zdCBkZWYgPSBtZXJnZURlZnMoc2NoZW1hLl96b2QuZGVmLCB7XG4gICAgICAgIGdldCBzaGFwZSgpIHtcbiAgICAgICAgICAgIGNvbnN0IG5ld1NoYXBlID0ge307XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBtYXNrKSB7XG4gICAgICAgICAgICAgICAgaWYgKCEoa2V5IGluIGN1cnJEZWYuc2hhcGUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5yZWNvZ25pemVkIGtleTogXCIke2tleX1cImApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIW1hc2tba2V5XSlcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgbmV3U2hhcGVba2V5XSA9IGN1cnJEZWYuc2hhcGVba2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFzc2lnblByb3AodGhpcywgXCJzaGFwZVwiLCBuZXdTaGFwZSk7IC8vIHNlbGYtY2FjaGluZ1xuICAgICAgICAgICAgcmV0dXJuIG5ld1NoYXBlO1xuICAgICAgICB9LFxuICAgICAgICBjaGVja3M6IFtdLFxuICAgIH0pO1xuICAgIHJldHVybiBjbG9uZShzY2hlbWEsIGRlZik7XG59XG5leHBvcnQgZnVuY3Rpb24gb21pdChzY2hlbWEsIG1hc2spIHtcbiAgICBjb25zdCBjdXJyRGVmID0gc2NoZW1hLl96b2QuZGVmO1xuICAgIGNvbnN0IGNoZWNrcyA9IGN1cnJEZWYuY2hlY2tzO1xuICAgIGNvbnN0IGhhc0NoZWNrcyA9IGNoZWNrcyAmJiBjaGVja3MubGVuZ3RoID4gMDtcbiAgICBpZiAoaGFzQ2hlY2tzKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIi5vbWl0KCkgY2Fubm90IGJlIHVzZWQgb24gb2JqZWN0IHNjaGVtYXMgY29udGFpbmluZyByZWZpbmVtZW50c1wiKTtcbiAgICB9XG4gICAgY29uc3QgZGVmID0gbWVyZ2VEZWZzKHNjaGVtYS5fem9kLmRlZiwge1xuICAgICAgICBnZXQgc2hhcGUoKSB7XG4gICAgICAgICAgICBjb25zdCBuZXdTaGFwZSA9IHsgLi4uc2NoZW1hLl96b2QuZGVmLnNoYXBlIH07XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBtYXNrKSB7XG4gICAgICAgICAgICAgICAgaWYgKCEoa2V5IGluIGN1cnJEZWYuc2hhcGUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5yZWNvZ25pemVkIGtleTogXCIke2tleX1cImApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIW1hc2tba2V5XSlcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgZGVsZXRlIG5ld1NoYXBlW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhc3NpZ25Qcm9wKHRoaXMsIFwic2hhcGVcIiwgbmV3U2hhcGUpOyAvLyBzZWxmLWNhY2hpbmdcbiAgICAgICAgICAgIHJldHVybiBuZXdTaGFwZTtcbiAgICAgICAgfSxcbiAgICAgICAgY2hlY2tzOiBbXSxcbiAgICB9KTtcbiAgICByZXR1cm4gY2xvbmUoc2NoZW1hLCBkZWYpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGV4dGVuZChzY2hlbWEsIHNoYXBlKSB7XG4gICAgaWYgKCFpc1BsYWluT2JqZWN0KHNoYXBlKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGlucHV0IHRvIGV4dGVuZDogZXhwZWN0ZWQgYSBwbGFpbiBvYmplY3RcIik7XG4gICAgfVxuICAgIGNvbnN0IGNoZWNrcyA9IHNjaGVtYS5fem9kLmRlZi5jaGVja3M7XG4gICAgY29uc3QgaGFzQ2hlY2tzID0gY2hlY2tzICYmIGNoZWNrcy5sZW5ndGggPiAwO1xuICAgIGlmIChoYXNDaGVja3MpIHtcbiAgICAgICAgLy8gT25seSB0aHJvdyBpZiBuZXcgc2hhcGUgb3ZlcmxhcHMgd2l0aCBleGlzdGluZyBzaGFwZVxuICAgICAgICAvLyBVc2UgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yIHRvIGNoZWNrIGtleSBleGlzdGVuY2Ugd2l0aG91dCBhY2Nlc3NpbmcgdmFsdWVzXG4gICAgICAgIGNvbnN0IGV4aXN0aW5nU2hhcGUgPSBzY2hlbWEuX3pvZC5kZWYuc2hhcGU7XG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIHNoYXBlKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihleGlzdGluZ1NoYXBlLCBrZXkpICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3Qgb3ZlcndyaXRlIGtleXMgb24gb2JqZWN0IHNjaGVtYXMgY29udGFpbmluZyByZWZpbmVtZW50cy4gVXNlIGAuc2FmZUV4dGVuZCgpYCBpbnN0ZWFkLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBkZWYgPSBtZXJnZURlZnMoc2NoZW1hLl96b2QuZGVmLCB7XG4gICAgICAgIGdldCBzaGFwZSgpIHtcbiAgICAgICAgICAgIGNvbnN0IF9zaGFwZSA9IHsgLi4uc2NoZW1hLl96b2QuZGVmLnNoYXBlLCAuLi5zaGFwZSB9O1xuICAgICAgICAgICAgYXNzaWduUHJvcCh0aGlzLCBcInNoYXBlXCIsIF9zaGFwZSk7IC8vIHNlbGYtY2FjaGluZ1xuICAgICAgICAgICAgcmV0dXJuIF9zaGFwZTtcbiAgICAgICAgfSxcbiAgICB9KTtcbiAgICByZXR1cm4gY2xvbmUoc2NoZW1hLCBkZWYpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHNhZmVFeHRlbmQoc2NoZW1hLCBzaGFwZSkge1xuICAgIGlmICghaXNQbGFpbk9iamVjdChzaGFwZSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBpbnB1dCB0byBzYWZlRXh0ZW5kOiBleHBlY3RlZCBhIHBsYWluIG9iamVjdFwiKTtcbiAgICB9XG4gICAgY29uc3QgZGVmID0gbWVyZ2VEZWZzKHNjaGVtYS5fem9kLmRlZiwge1xuICAgICAgICBnZXQgc2hhcGUoKSB7XG4gICAgICAgICAgICBjb25zdCBfc2hhcGUgPSB7IC4uLnNjaGVtYS5fem9kLmRlZi5zaGFwZSwgLi4uc2hhcGUgfTtcbiAgICAgICAgICAgIGFzc2lnblByb3AodGhpcywgXCJzaGFwZVwiLCBfc2hhcGUpOyAvLyBzZWxmLWNhY2hpbmdcbiAgICAgICAgICAgIHJldHVybiBfc2hhcGU7XG4gICAgICAgIH0sXG4gICAgfSk7XG4gICAgcmV0dXJuIGNsb25lKHNjaGVtYSwgZGVmKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZShhLCBiKSB7XG4gICAgaWYgKGEuX3pvZC5kZWYuY2hlY2tzPy5sZW5ndGgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiLm1lcmdlKCkgY2Fubm90IGJlIHVzZWQgb24gb2JqZWN0IHNjaGVtYXMgY29udGFpbmluZyByZWZpbmVtZW50cy4gVXNlIC5zYWZlRXh0ZW5kKCkgaW5zdGVhZC5cIik7XG4gICAgfVxuICAgIGNvbnN0IGRlZiA9IG1lcmdlRGVmcyhhLl96b2QuZGVmLCB7XG4gICAgICAgIGdldCBzaGFwZSgpIHtcbiAgICAgICAgICAgIGNvbnN0IF9zaGFwZSA9IHsgLi4uYS5fem9kLmRlZi5zaGFwZSwgLi4uYi5fem9kLmRlZi5zaGFwZSB9O1xuICAgICAgICAgICAgYXNzaWduUHJvcCh0aGlzLCBcInNoYXBlXCIsIF9zaGFwZSk7IC8vIHNlbGYtY2FjaGluZ1xuICAgICAgICAgICAgcmV0dXJuIF9zaGFwZTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0IGNhdGNoYWxsKCkge1xuICAgICAgICAgICAgcmV0dXJuIGIuX3pvZC5kZWYuY2F0Y2hhbGw7XG4gICAgICAgIH0sXG4gICAgICAgIGNoZWNrczogYi5fem9kLmRlZi5jaGVja3MgPz8gW10sXG4gICAgfSk7XG4gICAgcmV0dXJuIGNsb25lKGEsIGRlZik7XG59XG5leHBvcnQgZnVuY3Rpb24gcGFydGlhbChDbGFzcywgc2NoZW1hLCBtYXNrKSB7XG4gICAgY29uc3QgY3VyckRlZiA9IHNjaGVtYS5fem9kLmRlZjtcbiAgICBjb25zdCBjaGVja3MgPSBjdXJyRGVmLmNoZWNrcztcbiAgICBjb25zdCBoYXNDaGVja3MgPSBjaGVja3MgJiYgY2hlY2tzLmxlbmd0aCA+IDA7XG4gICAgaWYgKGhhc0NoZWNrcykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCIucGFydGlhbCgpIGNhbm5vdCBiZSB1c2VkIG9uIG9iamVjdCBzY2hlbWFzIGNvbnRhaW5pbmcgcmVmaW5lbWVudHNcIik7XG4gICAgfVxuICAgIGNvbnN0IGRlZiA9IG1lcmdlRGVmcyhzY2hlbWEuX3pvZC5kZWYsIHtcbiAgICAgICAgZ2V0IHNoYXBlKCkge1xuICAgICAgICAgICAgY29uc3Qgb2xkU2hhcGUgPSBzY2hlbWEuX3pvZC5kZWYuc2hhcGU7XG4gICAgICAgICAgICBjb25zdCBzaGFwZSA9IHsgLi4ub2xkU2hhcGUgfTtcbiAgICAgICAgICAgIGlmIChtYXNrKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gbWFzaykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIShrZXkgaW4gb2xkU2hhcGUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVucmVjb2duaXplZCBrZXk6IFwiJHtrZXl9XCJgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoIW1hc2tba2V5XSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAvLyBpZiAob2xkU2hhcGVba2V5XSEuX3pvZC5vcHRpbiA9PT0gXCJvcHRpb25hbFwiKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgc2hhcGVba2V5XSA9IENsYXNzXG4gICAgICAgICAgICAgICAgICAgICAgICA/IG5ldyBDbGFzcyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJvcHRpb25hbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlubmVyVHlwZTogb2xkU2hhcGVba2V5XSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICA6IG9sZFNoYXBlW2tleV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gb2xkU2hhcGUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgKG9sZFNoYXBlW2tleV0hLl96b2Qub3B0aW4gPT09IFwib3B0aW9uYWxcIikgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIHNoYXBlW2tleV0gPSBDbGFzc1xuICAgICAgICAgICAgICAgICAgICAgICAgPyBuZXcgQ2xhc3Moe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwib3B0aW9uYWxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbm5lclR5cGU6IG9sZFNoYXBlW2tleV0sXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBvbGRTaGFwZVtrZXldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFzc2lnblByb3AodGhpcywgXCJzaGFwZVwiLCBzaGFwZSk7IC8vIHNlbGYtY2FjaGluZ1xuICAgICAgICAgICAgcmV0dXJuIHNoYXBlO1xuICAgICAgICB9LFxuICAgICAgICBjaGVja3M6IFtdLFxuICAgIH0pO1xuICAgIHJldHVybiBjbG9uZShzY2hlbWEsIGRlZik7XG59XG5leHBvcnQgZnVuY3Rpb24gcmVxdWlyZWQoQ2xhc3MsIHNjaGVtYSwgbWFzaykge1xuICAgIGNvbnN0IGRlZiA9IG1lcmdlRGVmcyhzY2hlbWEuX3pvZC5kZWYsIHtcbiAgICAgICAgZ2V0IHNoYXBlKCkge1xuICAgICAgICAgICAgY29uc3Qgb2xkU2hhcGUgPSBzY2hlbWEuX3pvZC5kZWYuc2hhcGU7XG4gICAgICAgICAgICBjb25zdCBzaGFwZSA9IHsgLi4ub2xkU2hhcGUgfTtcbiAgICAgICAgICAgIGlmIChtYXNrKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gbWFzaykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIShrZXkgaW4gc2hhcGUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVucmVjb2duaXplZCBrZXk6IFwiJHtrZXl9XCJgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoIW1hc2tba2V5XSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAvLyBvdmVyd3JpdGUgd2l0aCBub24tb3B0aW9uYWxcbiAgICAgICAgICAgICAgICAgICAgc2hhcGVba2V5XSA9IG5ldyBDbGFzcyh7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIm5vbm9wdGlvbmFsXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbm5lclR5cGU6IG9sZFNoYXBlW2tleV0sXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIG9sZFNoYXBlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIG92ZXJ3cml0ZSB3aXRoIG5vbi1vcHRpb25hbFxuICAgICAgICAgICAgICAgICAgICBzaGFwZVtrZXldID0gbmV3IENsYXNzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwibm9ub3B0aW9uYWxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGlubmVyVHlwZTogb2xkU2hhcGVba2V5XSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXNzaWduUHJvcCh0aGlzLCBcInNoYXBlXCIsIHNoYXBlKTsgLy8gc2VsZi1jYWNoaW5nXG4gICAgICAgICAgICByZXR1cm4gc2hhcGU7XG4gICAgICAgIH0sXG4gICAgfSk7XG4gICAgcmV0dXJuIGNsb25lKHNjaGVtYSwgZGVmKTtcbn1cbi8vIGludmFsaWRfdHlwZSB8IHRvb19iaWcgfCB0b29fc21hbGwgfCBpbnZhbGlkX2Zvcm1hdCB8IG5vdF9tdWx0aXBsZV9vZiB8IHVucmVjb2duaXplZF9rZXlzIHwgaW52YWxpZF91bmlvbiB8IGludmFsaWRfa2V5IHwgaW52YWxpZF9lbGVtZW50IHwgaW52YWxpZF92YWx1ZSB8IGN1c3RvbVxuZXhwb3J0IGZ1bmN0aW9uIGFib3J0ZWQoeCwgc3RhcnRJbmRleCA9IDApIHtcbiAgICBpZiAoeC5hYm9ydGVkID09PSB0cnVlKVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICBmb3IgKGxldCBpID0gc3RhcnRJbmRleDsgaSA8IHguaXNzdWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICh4Lmlzc3Vlc1tpXT8uY29udGludWUgIT09IHRydWUpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cbi8vIENoZWNrcyBmb3IgZXhwbGljaXQgYWJvcnQgKGNvbnRpbnVlID09PSBmYWxzZSksIGFzIG9wcG9zZWQgdG8gaW1wbGljaXQgYWJvcnQgKGNvbnRpbnVlID09PSB1bmRlZmluZWQpLlxuLy8gVXNlZCB0byByZXNwZWN0IGBhYm9ydDogdHJ1ZWAgaW4gLnJlZmluZSgpIGV2ZW4gZm9yIGNoZWNrcyB0aGF0IGhhdmUgYSBgd2hlbmAgZnVuY3Rpb24uXG5leHBvcnQgZnVuY3Rpb24gZXhwbGljaXRseUFib3J0ZWQoeCwgc3RhcnRJbmRleCA9IDApIHtcbiAgICBpZiAoeC5hYm9ydGVkID09PSB0cnVlKVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICBmb3IgKGxldCBpID0gc3RhcnRJbmRleDsgaSA8IHguaXNzdWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICh4Lmlzc3Vlc1tpXT8uY29udGludWUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5leHBvcnQgZnVuY3Rpb24gcHJlZml4SXNzdWVzKHBhdGgsIGlzc3Vlcykge1xuICAgIHJldHVybiBpc3N1ZXMubWFwKChpc3MpID0+IHtcbiAgICAgICAgdmFyIF9hO1xuICAgICAgICAoX2EgPSBpc3MpLnBhdGggPz8gKF9hLnBhdGggPSBbXSk7XG4gICAgICAgIGlzcy5wYXRoLnVuc2hpZnQocGF0aCk7XG4gICAgICAgIHJldHVybiBpc3M7XG4gICAgfSk7XG59XG5leHBvcnQgZnVuY3Rpb24gdW53cmFwTWVzc2FnZShtZXNzYWdlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBtZXNzYWdlID09PSBcInN0cmluZ1wiID8gbWVzc2FnZSA6IG1lc3NhZ2U/Lm1lc3NhZ2U7XG59XG5leHBvcnQgZnVuY3Rpb24gZmluYWxpemVJc3N1ZShpc3MsIGN0eCwgY29uZmlnKSB7XG4gICAgY29uc3QgbWVzc2FnZSA9IGlzcy5tZXNzYWdlXG4gICAgICAgID8gaXNzLm1lc3NhZ2VcbiAgICAgICAgOiAodW53cmFwTWVzc2FnZShpc3MuaW5zdD8uX3pvZC5kZWY/LmVycm9yPy4oaXNzKSkgPz9cbiAgICAgICAgICAgIHVud3JhcE1lc3NhZ2UoY3R4Py5lcnJvcj8uKGlzcykpID8/XG4gICAgICAgICAgICB1bndyYXBNZXNzYWdlKGNvbmZpZy5jdXN0b21FcnJvcj8uKGlzcykpID8/XG4gICAgICAgICAgICB1bndyYXBNZXNzYWdlKGNvbmZpZy5sb2NhbGVFcnJvcj8uKGlzcykpID8/XG4gICAgICAgICAgICBcIkludmFsaWQgaW5wdXRcIik7XG4gICAgY29uc3QgeyBpbnN0OiBfaW5zdCwgY29udGludWU6IF9jb250aW51ZSwgaW5wdXQ6IF9pbnB1dCwgLi4ucmVzdCB9ID0gaXNzO1xuICAgIHJlc3QucGF0aCA/PyAocmVzdC5wYXRoID0gW10pO1xuICAgIHJlc3QubWVzc2FnZSA9IG1lc3NhZ2U7XG4gICAgaWYgKGN0eD8ucmVwb3J0SW5wdXQpIHtcbiAgICAgICAgcmVzdC5pbnB1dCA9IF9pbnB1dDtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3Q7XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0U2l6YWJsZU9yaWdpbihpbnB1dCkge1xuICAgIGlmIChpbnB1dCBpbnN0YW5jZW9mIFNldClcbiAgICAgICAgcmV0dXJuIFwic2V0XCI7XG4gICAgaWYgKGlucHV0IGluc3RhbmNlb2YgTWFwKVxuICAgICAgICByZXR1cm4gXCJtYXBcIjtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgaWYgKGlucHV0IGluc3RhbmNlb2YgRmlsZSlcbiAgICAgICAgcmV0dXJuIFwiZmlsZVwiO1xuICAgIHJldHVybiBcInVua25vd25cIjtcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXRMZW5ndGhhYmxlT3JpZ2luKGlucHV0KSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoaW5wdXQpKVxuICAgICAgICByZXR1cm4gXCJhcnJheVwiO1xuICAgIGlmICh0eXBlb2YgaW5wdXQgPT09IFwic3RyaW5nXCIpXG4gICAgICAgIHJldHVybiBcInN0cmluZ1wiO1xuICAgIHJldHVybiBcInVua25vd25cIjtcbn1cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZWRUeXBlKGRhdGEpIHtcbiAgICBjb25zdCB0ID0gdHlwZW9mIGRhdGE7XG4gICAgc3dpdGNoICh0KSB7XG4gICAgICAgIGNhc2UgXCJudW1iZXJcIjoge1xuICAgICAgICAgICAgcmV0dXJuIE51bWJlci5pc05hTihkYXRhKSA/IFwibmFuXCIgOiBcIm51bWJlclwiO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgXCJvYmplY3RcIjoge1xuICAgICAgICAgICAgaWYgKGRhdGEgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJudWxsXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShkYXRhKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBcImFycmF5XCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBvYmogPSBkYXRhO1xuICAgICAgICAgICAgaWYgKG9iaiAmJiBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqKSAhPT0gT2JqZWN0LnByb3RvdHlwZSAmJiBcImNvbnN0cnVjdG9yXCIgaW4gb2JqICYmIG9iai5jb25zdHJ1Y3Rvcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBvYmouY29uc3RydWN0b3IubmFtZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdDtcbn1cbmV4cG9ydCBmdW5jdGlvbiBpc3N1ZSguLi5hcmdzKSB7XG4gICAgY29uc3QgW2lzcywgaW5wdXQsIGluc3RdID0gYXJncztcbiAgICBpZiAodHlwZW9mIGlzcyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbWVzc2FnZTogaXNzLFxuICAgICAgICAgICAgY29kZTogXCJjdXN0b21cIixcbiAgICAgICAgICAgIGlucHV0LFxuICAgICAgICAgICAgaW5zdCxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIHsgLi4uaXNzIH07XG59XG5leHBvcnQgZnVuY3Rpb24gY2xlYW5FbnVtKG9iaikge1xuICAgIHJldHVybiBPYmplY3QuZW50cmllcyhvYmopXG4gICAgICAgIC5maWx0ZXIoKFtrLCBfXSkgPT4ge1xuICAgICAgICAvLyByZXR1cm4gdHJ1ZSBpZiBOYU4sIG1lYW5pbmcgaXQncyBub3QgYSBudW1iZXIsIHRodXMgYSBzdHJpbmcga2V5XG4gICAgICAgIHJldHVybiBOdW1iZXIuaXNOYU4oTnVtYmVyLnBhcnNlSW50KGssIDEwKSk7XG4gICAgfSlcbiAgICAgICAgLm1hcCgoZWwpID0+IGVsWzFdKTtcbn1cbi8vIENvZGVjIHV0aWxpdHkgZnVuY3Rpb25zXG5leHBvcnQgZnVuY3Rpb24gYmFzZTY0VG9VaW50OEFycmF5KGJhc2U2NCkge1xuICAgIGNvbnN0IGJpbmFyeVN0cmluZyA9IGF0b2IoYmFzZTY0KTtcbiAgICBjb25zdCBieXRlcyA9IG5ldyBVaW50OEFycmF5KGJpbmFyeVN0cmluZy5sZW5ndGgpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYmluYXJ5U3RyaW5nLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGJ5dGVzW2ldID0gYmluYXJ5U3RyaW5nLmNoYXJDb2RlQXQoaSk7XG4gICAgfVxuICAgIHJldHVybiBieXRlcztcbn1cbmV4cG9ydCBmdW5jdGlvbiB1aW50OEFycmF5VG9CYXNlNjQoYnl0ZXMpIHtcbiAgICBsZXQgYmluYXJ5U3RyaW5nID0gXCJcIjtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGJpbmFyeVN0cmluZyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGVzW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIGJ0b2EoYmluYXJ5U3RyaW5nKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBiYXNlNjR1cmxUb1VpbnQ4QXJyYXkoYmFzZTY0dXJsKSB7XG4gICAgY29uc3QgYmFzZTY0ID0gYmFzZTY0dXJsLnJlcGxhY2UoLy0vZywgXCIrXCIpLnJlcGxhY2UoL18vZywgXCIvXCIpO1xuICAgIGNvbnN0IHBhZGRpbmcgPSBcIj1cIi5yZXBlYXQoKDQgLSAoYmFzZTY0Lmxlbmd0aCAlIDQpKSAlIDQpO1xuICAgIHJldHVybiBiYXNlNjRUb1VpbnQ4QXJyYXkoYmFzZTY0ICsgcGFkZGluZyk7XG59XG5leHBvcnQgZnVuY3Rpb24gdWludDhBcnJheVRvQmFzZTY0dXJsKGJ5dGVzKSB7XG4gICAgcmV0dXJuIHVpbnQ4QXJyYXlUb0Jhc2U2NChieXRlcykucmVwbGFjZSgvXFwrL2csIFwiLVwiKS5yZXBsYWNlKC9cXC8vZywgXCJfXCIpLnJlcGxhY2UoLz0vZywgXCJcIik7XG59XG5leHBvcnQgZnVuY3Rpb24gaGV4VG9VaW50OEFycmF5KGhleCkge1xuICAgIGNvbnN0IGNsZWFuSGV4ID0gaGV4LnJlcGxhY2UoL14weC8sIFwiXCIpO1xuICAgIGlmIChjbGVhbkhleC5sZW5ndGggJSAyICE9PSAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgaGV4IHN0cmluZyBsZW5ndGhcIik7XG4gICAgfVxuICAgIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoY2xlYW5IZXgubGVuZ3RoIC8gMik7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjbGVhbkhleC5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgICBieXRlc1tpIC8gMl0gPSBOdW1iZXIucGFyc2VJbnQoY2xlYW5IZXguc2xpY2UoaSwgaSArIDIpLCAxNik7XG4gICAgfVxuICAgIHJldHVybiBieXRlcztcbn1cbmV4cG9ydCBmdW5jdGlvbiB1aW50OEFycmF5VG9IZXgoYnl0ZXMpIHtcbiAgICByZXR1cm4gQXJyYXkuZnJvbShieXRlcylcbiAgICAgICAgLm1hcCgoYikgPT4gYi50b1N0cmluZygxNikucGFkU3RhcnQoMiwgXCIwXCIpKVxuICAgICAgICAuam9pbihcIlwiKTtcbn1cbi8vIGluc3RhbmNlb2ZcbmV4cG9ydCBjbGFzcyBDbGFzcyB7XG4gICAgY29uc3RydWN0b3IoLi4uX2FyZ3MpIHsgfVxufVxuIiwiLy8gaW1wb3J0IHsgJFpvZFR5cGUgfSBmcm9tIFwiLi9zY2hlbWFzLmpzXCI7XG5pbXBvcnQgKiBhcyBjb3JlIGZyb20gXCIuL2NvcmUuanNcIjtcbmltcG9ydCAqIGFzIHJlZ2V4ZXMgZnJvbSBcIi4vcmVnZXhlcy5qc1wiO1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tIFwiLi91dGlsLmpzXCI7XG5leHBvcnQgY29uc3QgJFpvZENoZWNrID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RDaGVja1wiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgdmFyIF9hO1xuICAgIGluc3QuX3pvZCA/PyAoaW5zdC5fem9kID0ge30pO1xuICAgIGluc3QuX3pvZC5kZWYgPSBkZWY7XG4gICAgKF9hID0gaW5zdC5fem9kKS5vbmF0dGFjaCA/PyAoX2Eub25hdHRhY2ggPSBbXSk7XG59KTtcbmNvbnN0IG51bWVyaWNPcmlnaW5NYXAgPSB7XG4gICAgbnVtYmVyOiBcIm51bWJlclwiLFxuICAgIGJpZ2ludDogXCJiaWdpbnRcIixcbiAgICBvYmplY3Q6IFwiZGF0ZVwiLFxufTtcbmV4cG9ydCBjb25zdCAkWm9kQ2hlY2tMZXNzVGhhbiA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kQ2hlY2tMZXNzVGhhblwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgJFpvZENoZWNrLmluaXQoaW5zdCwgZGVmKTtcbiAgICBjb25zdCBvcmlnaW4gPSBudW1lcmljT3JpZ2luTWFwW3R5cGVvZiBkZWYudmFsdWVdO1xuICAgIGluc3QuX3pvZC5vbmF0dGFjaC5wdXNoKChpbnN0KSA9PiB7XG4gICAgICAgIGNvbnN0IGJhZyA9IGluc3QuX3pvZC5iYWc7XG4gICAgICAgIGNvbnN0IGN1cnIgPSAoZGVmLmluY2x1c2l2ZSA/IGJhZy5tYXhpbXVtIDogYmFnLmV4Y2x1c2l2ZU1heGltdW0pID8/IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcbiAgICAgICAgaWYgKGRlZi52YWx1ZSA8IGN1cnIpIHtcbiAgICAgICAgICAgIGlmIChkZWYuaW5jbHVzaXZlKVxuICAgICAgICAgICAgICAgIGJhZy5tYXhpbXVtID0gZGVmLnZhbHVlO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGJhZy5leGNsdXNpdmVNYXhpbXVtID0gZGVmLnZhbHVlO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgaW5zdC5fem9kLmNoZWNrID0gKHBheWxvYWQpID0+IHtcbiAgICAgICAgaWYgKGRlZi5pbmNsdXNpdmUgPyBwYXlsb2FkLnZhbHVlIDw9IGRlZi52YWx1ZSA6IHBheWxvYWQudmFsdWUgPCBkZWYudmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcbiAgICAgICAgICAgIG9yaWdpbixcbiAgICAgICAgICAgIGNvZGU6IFwidG9vX2JpZ1wiLFxuICAgICAgICAgICAgbWF4aW11bTogdHlwZW9mIGRlZi52YWx1ZSA9PT0gXCJvYmplY3RcIiA/IGRlZi52YWx1ZS5nZXRUaW1lKCkgOiBkZWYudmFsdWUsXG4gICAgICAgICAgICBpbnB1dDogcGF5bG9hZC52YWx1ZSxcbiAgICAgICAgICAgIGluY2x1c2l2ZTogZGVmLmluY2x1c2l2ZSxcbiAgICAgICAgICAgIGluc3QsXG4gICAgICAgICAgICBjb250aW51ZTogIWRlZi5hYm9ydCxcbiAgICAgICAgfSk7XG4gICAgfTtcbn0pO1xuZXhwb3J0IGNvbnN0ICRab2RDaGVja0dyZWF0ZXJUaGFuID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RDaGVja0dyZWF0ZXJUaGFuXCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICAkWm9kQ2hlY2suaW5pdChpbnN0LCBkZWYpO1xuICAgIGNvbnN0IG9yaWdpbiA9IG51bWVyaWNPcmlnaW5NYXBbdHlwZW9mIGRlZi52YWx1ZV07XG4gICAgaW5zdC5fem9kLm9uYXR0YWNoLnB1c2goKGluc3QpID0+IHtcbiAgICAgICAgY29uc3QgYmFnID0gaW5zdC5fem9kLmJhZztcbiAgICAgICAgY29uc3QgY3VyciA9IChkZWYuaW5jbHVzaXZlID8gYmFnLm1pbmltdW0gOiBiYWcuZXhjbHVzaXZlTWluaW11bSkgPz8gTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZO1xuICAgICAgICBpZiAoZGVmLnZhbHVlID4gY3Vycikge1xuICAgICAgICAgICAgaWYgKGRlZi5pbmNsdXNpdmUpXG4gICAgICAgICAgICAgICAgYmFnLm1pbmltdW0gPSBkZWYudmFsdWU7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgYmFnLmV4Y2x1c2l2ZU1pbmltdW0gPSBkZWYudmFsdWU7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBpbnN0Ll96b2QuY2hlY2sgPSAocGF5bG9hZCkgPT4ge1xuICAgICAgICBpZiAoZGVmLmluY2x1c2l2ZSA/IHBheWxvYWQudmFsdWUgPj0gZGVmLnZhbHVlIDogcGF5bG9hZC52YWx1ZSA+IGRlZi52YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xuICAgICAgICAgICAgb3JpZ2luLFxuICAgICAgICAgICAgY29kZTogXCJ0b29fc21hbGxcIixcbiAgICAgICAgICAgIG1pbmltdW06IHR5cGVvZiBkZWYudmFsdWUgPT09IFwib2JqZWN0XCIgPyBkZWYudmFsdWUuZ2V0VGltZSgpIDogZGVmLnZhbHVlLFxuICAgICAgICAgICAgaW5wdXQ6IHBheWxvYWQudmFsdWUsXG4gICAgICAgICAgICBpbmNsdXNpdmU6IGRlZi5pbmNsdXNpdmUsXG4gICAgICAgICAgICBpbnN0LFxuICAgICAgICAgICAgY29udGludWU6ICFkZWYuYWJvcnQsXG4gICAgICAgIH0pO1xuICAgIH07XG59KTtcbmV4cG9ydCBjb25zdCAkWm9kQ2hlY2tNdWx0aXBsZU9mID0gXG4vKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZENoZWNrTXVsdGlwbGVPZlwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgJFpvZENoZWNrLmluaXQoaW5zdCwgZGVmKTtcbiAgICBpbnN0Ll96b2Qub25hdHRhY2gucHVzaCgoaW5zdCkgPT4ge1xuICAgICAgICB2YXIgX2E7XG4gICAgICAgIChfYSA9IGluc3QuX3pvZC5iYWcpLm11bHRpcGxlT2YgPz8gKF9hLm11bHRpcGxlT2YgPSBkZWYudmFsdWUpO1xuICAgIH0pO1xuICAgIGluc3QuX3pvZC5jaGVjayA9IChwYXlsb2FkKSA9PiB7XG4gICAgICAgIGlmICh0eXBlb2YgcGF5bG9hZC52YWx1ZSAhPT0gdHlwZW9mIGRlZi52YWx1ZSlcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBtaXggbnVtYmVyIGFuZCBiaWdpbnQgaW4gbXVsdGlwbGVfb2YgY2hlY2suXCIpO1xuICAgICAgICBjb25zdCBpc011bHRpcGxlID0gdHlwZW9mIHBheWxvYWQudmFsdWUgPT09IFwiYmlnaW50XCJcbiAgICAgICAgICAgID8gcGF5bG9hZC52YWx1ZSAlIGRlZi52YWx1ZSA9PT0gQmlnSW50KDApXG4gICAgICAgICAgICA6IHV0aWwuZmxvYXRTYWZlUmVtYWluZGVyKHBheWxvYWQudmFsdWUsIGRlZi52YWx1ZSkgPT09IDA7XG4gICAgICAgIGlmIChpc011bHRpcGxlKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcbiAgICAgICAgICAgIG9yaWdpbjogdHlwZW9mIHBheWxvYWQudmFsdWUsXG4gICAgICAgICAgICBjb2RlOiBcIm5vdF9tdWx0aXBsZV9vZlwiLFxuICAgICAgICAgICAgZGl2aXNvcjogZGVmLnZhbHVlLFxuICAgICAgICAgICAgaW5wdXQ6IHBheWxvYWQudmFsdWUsXG4gICAgICAgICAgICBpbnN0LFxuICAgICAgICAgICAgY29udGludWU6ICFkZWYuYWJvcnQsXG4gICAgICAgIH0pO1xuICAgIH07XG59KTtcbmV4cG9ydCBjb25zdCAkWm9kQ2hlY2tOdW1iZXJGb3JtYXQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZENoZWNrTnVtYmVyRm9ybWF0XCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICAkWm9kQ2hlY2suaW5pdChpbnN0LCBkZWYpOyAvLyBubyBmb3JtYXQgY2hlY2tzXG4gICAgZGVmLmZvcm1hdCA9IGRlZi5mb3JtYXQgfHwgXCJmbG9hdDY0XCI7XG4gICAgY29uc3QgaXNJbnQgPSBkZWYuZm9ybWF0Py5pbmNsdWRlcyhcImludFwiKTtcbiAgICBjb25zdCBvcmlnaW4gPSBpc0ludCA/IFwiaW50XCIgOiBcIm51bWJlclwiO1xuICAgIGNvbnN0IFttaW5pbXVtLCBtYXhpbXVtXSA9IHV0aWwuTlVNQkVSX0ZPUk1BVF9SQU5HRVNbZGVmLmZvcm1hdF07XG4gICAgaW5zdC5fem9kLm9uYXR0YWNoLnB1c2goKGluc3QpID0+IHtcbiAgICAgICAgY29uc3QgYmFnID0gaW5zdC5fem9kLmJhZztcbiAgICAgICAgYmFnLmZvcm1hdCA9IGRlZi5mb3JtYXQ7XG4gICAgICAgIGJhZy5taW5pbXVtID0gbWluaW11bTtcbiAgICAgICAgYmFnLm1heGltdW0gPSBtYXhpbXVtO1xuICAgICAgICBpZiAoaXNJbnQpXG4gICAgICAgICAgICBiYWcucGF0dGVybiA9IHJlZ2V4ZXMuaW50ZWdlcjtcbiAgICB9KTtcbiAgICBpbnN0Ll96b2QuY2hlY2sgPSAocGF5bG9hZCkgPT4ge1xuICAgICAgICBjb25zdCBpbnB1dCA9IHBheWxvYWQudmFsdWU7XG4gICAgICAgIGlmIChpc0ludCkge1xuICAgICAgICAgICAgaWYgKCFOdW1iZXIuaXNJbnRlZ2VyKGlucHV0KSkge1xuICAgICAgICAgICAgICAgIC8vIGludmFsaWRfZm9ybWF0IGlzc3VlXG4gICAgICAgICAgICAgICAgLy8gcGF5bG9hZC5pc3N1ZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgLy8gICBleHBlY3RlZDogZGVmLmZvcm1hdCxcbiAgICAgICAgICAgICAgICAvLyAgIGZvcm1hdDogZGVmLmZvcm1hdCxcbiAgICAgICAgICAgICAgICAvLyAgIGNvZGU6IFwiaW52YWxpZF9mb3JtYXRcIixcbiAgICAgICAgICAgICAgICAvLyAgIGlucHV0LFxuICAgICAgICAgICAgICAgIC8vICAgaW5zdCxcbiAgICAgICAgICAgICAgICAvLyB9KTtcbiAgICAgICAgICAgICAgICAvLyBpbnZhbGlkX3R5cGUgaXNzdWVcbiAgICAgICAgICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IG9yaWdpbixcbiAgICAgICAgICAgICAgICAgICAgZm9ybWF0OiBkZWYuZm9ybWF0LFxuICAgICAgICAgICAgICAgICAgICBjb2RlOiBcImludmFsaWRfdHlwZVwiLFxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGlucHV0LFxuICAgICAgICAgICAgICAgICAgICBpbnN0LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAvLyBub3RfbXVsdGlwbGVfb2YgaXNzdWVcbiAgICAgICAgICAgICAgICAvLyBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAvLyAgIGNvZGU6IFwibm90X211bHRpcGxlX29mXCIsXG4gICAgICAgICAgICAgICAgLy8gICBvcmlnaW46IFwibnVtYmVyXCIsXG4gICAgICAgICAgICAgICAgLy8gICBpbnB1dCxcbiAgICAgICAgICAgICAgICAvLyAgIGluc3QsXG4gICAgICAgICAgICAgICAgLy8gICBkaXZpc29yOiAxLFxuICAgICAgICAgICAgICAgIC8vIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFOdW1iZXIuaXNTYWZlSW50ZWdlcihpbnB1dCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5wdXQgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHRvb19iaWdcbiAgICAgICAgICAgICAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnB1dCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFwidG9vX2JpZ1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4aW11bTogTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIsXG4gICAgICAgICAgICAgICAgICAgICAgICBub3RlOiBcIkludGVnZXJzIG11c3QgYmUgd2l0aGluIHRoZSBzYWZlIGludGVnZXIgcmFuZ2UuXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnN0LFxuICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU6ICFkZWYuYWJvcnQsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gdG9vX3NtYWxsXG4gICAgICAgICAgICAgICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXQsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBcInRvb19zbWFsbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWluaW11bTogTnVtYmVyLk1JTl9TQUZFX0lOVEVHRVIsXG4gICAgICAgICAgICAgICAgICAgICAgICBub3RlOiBcIkludGVnZXJzIG11c3QgYmUgd2l0aGluIHRoZSBzYWZlIGludGVnZXIgcmFuZ2UuXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnN0LFxuICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU6ICFkZWYuYWJvcnQsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlucHV0IDwgbWluaW11bSkge1xuICAgICAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgb3JpZ2luOiBcIm51bWJlclwiLFxuICAgICAgICAgICAgICAgIGlucHV0LFxuICAgICAgICAgICAgICAgIGNvZGU6IFwidG9vX3NtYWxsXCIsXG4gICAgICAgICAgICAgICAgbWluaW11bSxcbiAgICAgICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgaW5zdCxcbiAgICAgICAgICAgICAgICBjb250aW51ZTogIWRlZi5hYm9ydCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpbnB1dCA+IG1heGltdW0pIHtcbiAgICAgICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xuICAgICAgICAgICAgICAgIG9yaWdpbjogXCJudW1iZXJcIixcbiAgICAgICAgICAgICAgICBpbnB1dCxcbiAgICAgICAgICAgICAgICBjb2RlOiBcInRvb19iaWdcIixcbiAgICAgICAgICAgICAgICBtYXhpbXVtLFxuICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBpbnN0LFxuICAgICAgICAgICAgICAgIGNvbnRpbnVlOiAhZGVmLmFib3J0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xufSk7XG5leHBvcnQgY29uc3QgJFpvZENoZWNrQmlnSW50Rm9ybWF0ID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RDaGVja0JpZ0ludEZvcm1hdFwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgJFpvZENoZWNrLmluaXQoaW5zdCwgZGVmKTsgLy8gbm8gZm9ybWF0IGNoZWNrc1xuICAgIGNvbnN0IFttaW5pbXVtLCBtYXhpbXVtXSA9IHV0aWwuQklHSU5UX0ZPUk1BVF9SQU5HRVNbZGVmLmZvcm1hdF07XG4gICAgaW5zdC5fem9kLm9uYXR0YWNoLnB1c2goKGluc3QpID0+IHtcbiAgICAgICAgY29uc3QgYmFnID0gaW5zdC5fem9kLmJhZztcbiAgICAgICAgYmFnLmZvcm1hdCA9IGRlZi5mb3JtYXQ7XG4gICAgICAgIGJhZy5taW5pbXVtID0gbWluaW11bTtcbiAgICAgICAgYmFnLm1heGltdW0gPSBtYXhpbXVtO1xuICAgIH0pO1xuICAgIGluc3QuX3pvZC5jaGVjayA9IChwYXlsb2FkKSA9PiB7XG4gICAgICAgIGNvbnN0IGlucHV0ID0gcGF5bG9hZC52YWx1ZTtcbiAgICAgICAgaWYgKGlucHV0IDwgbWluaW11bSkge1xuICAgICAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgb3JpZ2luOiBcImJpZ2ludFwiLFxuICAgICAgICAgICAgICAgIGlucHV0LFxuICAgICAgICAgICAgICAgIGNvZGU6IFwidG9vX3NtYWxsXCIsXG4gICAgICAgICAgICAgICAgbWluaW11bTogbWluaW11bSxcbiAgICAgICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgaW5zdCxcbiAgICAgICAgICAgICAgICBjb250aW51ZTogIWRlZi5hYm9ydCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpbnB1dCA+IG1heGltdW0pIHtcbiAgICAgICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xuICAgICAgICAgICAgICAgIG9yaWdpbjogXCJiaWdpbnRcIixcbiAgICAgICAgICAgICAgICBpbnB1dCxcbiAgICAgICAgICAgICAgICBjb2RlOiBcInRvb19iaWdcIixcbiAgICAgICAgICAgICAgICBtYXhpbXVtLFxuICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBpbnN0LFxuICAgICAgICAgICAgICAgIGNvbnRpbnVlOiAhZGVmLmFib3J0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xufSk7XG5leHBvcnQgY29uc3QgJFpvZENoZWNrTWF4U2l6ZSA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kQ2hlY2tNYXhTaXplXCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICB2YXIgX2E7XG4gICAgJFpvZENoZWNrLmluaXQoaW5zdCwgZGVmKTtcbiAgICAoX2EgPSBpbnN0Ll96b2QuZGVmKS53aGVuID8/IChfYS53aGVuID0gKHBheWxvYWQpID0+IHtcbiAgICAgICAgY29uc3QgdmFsID0gcGF5bG9hZC52YWx1ZTtcbiAgICAgICAgcmV0dXJuICF1dGlsLm51bGxpc2godmFsKSAmJiB2YWwuc2l6ZSAhPT0gdW5kZWZpbmVkO1xuICAgIH0pO1xuICAgIGluc3QuX3pvZC5vbmF0dGFjaC5wdXNoKChpbnN0KSA9PiB7XG4gICAgICAgIGNvbnN0IGN1cnIgPSAoaW5zdC5fem9kLmJhZy5tYXhpbXVtID8/IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSk7XG4gICAgICAgIGlmIChkZWYubWF4aW11bSA8IGN1cnIpXG4gICAgICAgICAgICBpbnN0Ll96b2QuYmFnLm1heGltdW0gPSBkZWYubWF4aW11bTtcbiAgICB9KTtcbiAgICBpbnN0Ll96b2QuY2hlY2sgPSAocGF5bG9hZCkgPT4ge1xuICAgICAgICBjb25zdCBpbnB1dCA9IHBheWxvYWQudmFsdWU7XG4gICAgICAgIGNvbnN0IHNpemUgPSBpbnB1dC5zaXplO1xuICAgICAgICBpZiAoc2l6ZSA8PSBkZWYubWF4aW11bSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XG4gICAgICAgICAgICBvcmlnaW46IHV0aWwuZ2V0U2l6YWJsZU9yaWdpbihpbnB1dCksXG4gICAgICAgICAgICBjb2RlOiBcInRvb19iaWdcIixcbiAgICAgICAgICAgIG1heGltdW06IGRlZi5tYXhpbXVtLFxuICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgaW5wdXQsXG4gICAgICAgICAgICBpbnN0LFxuICAgICAgICAgICAgY29udGludWU6ICFkZWYuYWJvcnQsXG4gICAgICAgIH0pO1xuICAgIH07XG59KTtcbmV4cG9ydCBjb25zdCAkWm9kQ2hlY2tNaW5TaXplID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RDaGVja01pblNpemVcIiwgKGluc3QsIGRlZikgPT4ge1xuICAgIHZhciBfYTtcbiAgICAkWm9kQ2hlY2suaW5pdChpbnN0LCBkZWYpO1xuICAgIChfYSA9IGluc3QuX3pvZC5kZWYpLndoZW4gPz8gKF9hLndoZW4gPSAocGF5bG9hZCkgPT4ge1xuICAgICAgICBjb25zdCB2YWwgPSBwYXlsb2FkLnZhbHVlO1xuICAgICAgICByZXR1cm4gIXV0aWwubnVsbGlzaCh2YWwpICYmIHZhbC5zaXplICE9PSB1bmRlZmluZWQ7XG4gICAgfSk7XG4gICAgaW5zdC5fem9kLm9uYXR0YWNoLnB1c2goKGluc3QpID0+IHtcbiAgICAgICAgY29uc3QgY3VyciA9IChpbnN0Ll96b2QuYmFnLm1pbmltdW0gPz8gTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZKTtcbiAgICAgICAgaWYgKGRlZi5taW5pbXVtID4gY3VycilcbiAgICAgICAgICAgIGluc3QuX3pvZC5iYWcubWluaW11bSA9IGRlZi5taW5pbXVtO1xuICAgIH0pO1xuICAgIGluc3QuX3pvZC5jaGVjayA9IChwYXlsb2FkKSA9PiB7XG4gICAgICAgIGNvbnN0IGlucHV0ID0gcGF5bG9hZC52YWx1ZTtcbiAgICAgICAgY29uc3Qgc2l6ZSA9IGlucHV0LnNpemU7XG4gICAgICAgIGlmIChzaXplID49IGRlZi5taW5pbXVtKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcbiAgICAgICAgICAgIG9yaWdpbjogdXRpbC5nZXRTaXphYmxlT3JpZ2luKGlucHV0KSxcbiAgICAgICAgICAgIGNvZGU6IFwidG9vX3NtYWxsXCIsXG4gICAgICAgICAgICBtaW5pbXVtOiBkZWYubWluaW11bSxcbiAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgIGlucHV0LFxuICAgICAgICAgICAgaW5zdCxcbiAgICAgICAgICAgIGNvbnRpbnVlOiAhZGVmLmFib3J0LFxuICAgICAgICB9KTtcbiAgICB9O1xufSk7XG5leHBvcnQgY29uc3QgJFpvZENoZWNrU2l6ZUVxdWFscyA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kQ2hlY2tTaXplRXF1YWxzXCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICB2YXIgX2E7XG4gICAgJFpvZENoZWNrLmluaXQoaW5zdCwgZGVmKTtcbiAgICAoX2EgPSBpbnN0Ll96b2QuZGVmKS53aGVuID8/IChfYS53aGVuID0gKHBheWxvYWQpID0+IHtcbiAgICAgICAgY29uc3QgdmFsID0gcGF5bG9hZC52YWx1ZTtcbiAgICAgICAgcmV0dXJuICF1dGlsLm51bGxpc2godmFsKSAmJiB2YWwuc2l6ZSAhPT0gdW5kZWZpbmVkO1xuICAgIH0pO1xuICAgIGluc3QuX3pvZC5vbmF0dGFjaC5wdXNoKChpbnN0KSA9PiB7XG4gICAgICAgIGNvbnN0IGJhZyA9IGluc3QuX3pvZC5iYWc7XG4gICAgICAgIGJhZy5taW5pbXVtID0gZGVmLnNpemU7XG4gICAgICAgIGJhZy5tYXhpbXVtID0gZGVmLnNpemU7XG4gICAgICAgIGJhZy5zaXplID0gZGVmLnNpemU7XG4gICAgfSk7XG4gICAgaW5zdC5fem9kLmNoZWNrID0gKHBheWxvYWQpID0+IHtcbiAgICAgICAgY29uc3QgaW5wdXQgPSBwYXlsb2FkLnZhbHVlO1xuICAgICAgICBjb25zdCBzaXplID0gaW5wdXQuc2l6ZTtcbiAgICAgICAgaWYgKHNpemUgPT09IGRlZi5zaXplKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBjb25zdCB0b29CaWcgPSBzaXplID4gZGVmLnNpemU7XG4gICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xuICAgICAgICAgICAgb3JpZ2luOiB1dGlsLmdldFNpemFibGVPcmlnaW4oaW5wdXQpLFxuICAgICAgICAgICAgLi4uKHRvb0JpZyA/IHsgY29kZTogXCJ0b29fYmlnXCIsIG1heGltdW06IGRlZi5zaXplIH0gOiB7IGNvZGU6IFwidG9vX3NtYWxsXCIsIG1pbmltdW06IGRlZi5zaXplIH0pLFxuICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgZXhhY3Q6IHRydWUsXG4gICAgICAgICAgICBpbnB1dDogcGF5bG9hZC52YWx1ZSxcbiAgICAgICAgICAgIGluc3QsXG4gICAgICAgICAgICBjb250aW51ZTogIWRlZi5hYm9ydCxcbiAgICAgICAgfSk7XG4gICAgfTtcbn0pO1xuZXhwb3J0IGNvbnN0ICRab2RDaGVja01heExlbmd0aCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kQ2hlY2tNYXhMZW5ndGhcIiwgKGluc3QsIGRlZikgPT4ge1xuICAgIHZhciBfYTtcbiAgICAkWm9kQ2hlY2suaW5pdChpbnN0LCBkZWYpO1xuICAgIChfYSA9IGluc3QuX3pvZC5kZWYpLndoZW4gPz8gKF9hLndoZW4gPSAocGF5bG9hZCkgPT4ge1xuICAgICAgICBjb25zdCB2YWwgPSBwYXlsb2FkLnZhbHVlO1xuICAgICAgICByZXR1cm4gIXV0aWwubnVsbGlzaCh2YWwpICYmIHZhbC5sZW5ndGggIT09IHVuZGVmaW5lZDtcbiAgICB9KTtcbiAgICBpbnN0Ll96b2Qub25hdHRhY2gucHVzaCgoaW5zdCkgPT4ge1xuICAgICAgICBjb25zdCBjdXJyID0gKGluc3QuX3pvZC5iYWcubWF4aW11bSA/PyBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkpO1xuICAgICAgICBpZiAoZGVmLm1heGltdW0gPCBjdXJyKVxuICAgICAgICAgICAgaW5zdC5fem9kLmJhZy5tYXhpbXVtID0gZGVmLm1heGltdW07XG4gICAgfSk7XG4gICAgaW5zdC5fem9kLmNoZWNrID0gKHBheWxvYWQpID0+IHtcbiAgICAgICAgY29uc3QgaW5wdXQgPSBwYXlsb2FkLnZhbHVlO1xuICAgICAgICBjb25zdCBsZW5ndGggPSBpbnB1dC5sZW5ndGg7XG4gICAgICAgIGlmIChsZW5ndGggPD0gZGVmLm1heGltdW0pXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNvbnN0IG9yaWdpbiA9IHV0aWwuZ2V0TGVuZ3RoYWJsZU9yaWdpbihpbnB1dCk7XG4gICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xuICAgICAgICAgICAgb3JpZ2luLFxuICAgICAgICAgICAgY29kZTogXCJ0b29fYmlnXCIsXG4gICAgICAgICAgICBtYXhpbXVtOiBkZWYubWF4aW11bSxcbiAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgIGlucHV0LFxuICAgICAgICAgICAgaW5zdCxcbiAgICAgICAgICAgIGNvbnRpbnVlOiAhZGVmLmFib3J0LFxuICAgICAgICB9KTtcbiAgICB9O1xufSk7XG5leHBvcnQgY29uc3QgJFpvZENoZWNrTWluTGVuZ3RoID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RDaGVja01pbkxlbmd0aFwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgdmFyIF9hO1xuICAgICRab2RDaGVjay5pbml0KGluc3QsIGRlZik7XG4gICAgKF9hID0gaW5zdC5fem9kLmRlZikud2hlbiA/PyAoX2Eud2hlbiA9IChwYXlsb2FkKSA9PiB7XG4gICAgICAgIGNvbnN0IHZhbCA9IHBheWxvYWQudmFsdWU7XG4gICAgICAgIHJldHVybiAhdXRpbC5udWxsaXNoKHZhbCkgJiYgdmFsLmxlbmd0aCAhPT0gdW5kZWZpbmVkO1xuICAgIH0pO1xuICAgIGluc3QuX3pvZC5vbmF0dGFjaC5wdXNoKChpbnN0KSA9PiB7XG4gICAgICAgIGNvbnN0IGN1cnIgPSAoaW5zdC5fem9kLmJhZy5taW5pbXVtID8/IE51bWJlci5ORUdBVElWRV9JTkZJTklUWSk7XG4gICAgICAgIGlmIChkZWYubWluaW11bSA+IGN1cnIpXG4gICAgICAgICAgICBpbnN0Ll96b2QuYmFnLm1pbmltdW0gPSBkZWYubWluaW11bTtcbiAgICB9KTtcbiAgICBpbnN0Ll96b2QuY2hlY2sgPSAocGF5bG9hZCkgPT4ge1xuICAgICAgICBjb25zdCBpbnB1dCA9IHBheWxvYWQudmFsdWU7XG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IGlucHV0Lmxlbmd0aDtcbiAgICAgICAgaWYgKGxlbmd0aCA+PSBkZWYubWluaW11bSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY29uc3Qgb3JpZ2luID0gdXRpbC5nZXRMZW5ndGhhYmxlT3JpZ2luKGlucHV0KTtcbiAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XG4gICAgICAgICAgICBvcmlnaW4sXG4gICAgICAgICAgICBjb2RlOiBcInRvb19zbWFsbFwiLFxuICAgICAgICAgICAgbWluaW11bTogZGVmLm1pbmltdW0sXG4gICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXG4gICAgICAgICAgICBpbnB1dCxcbiAgICAgICAgICAgIGluc3QsXG4gICAgICAgICAgICBjb250aW51ZTogIWRlZi5hYm9ydCxcbiAgICAgICAgfSk7XG4gICAgfTtcbn0pO1xuZXhwb3J0IGNvbnN0ICRab2RDaGVja0xlbmd0aEVxdWFscyA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kQ2hlY2tMZW5ndGhFcXVhbHNcIiwgKGluc3QsIGRlZikgPT4ge1xuICAgIHZhciBfYTtcbiAgICAkWm9kQ2hlY2suaW5pdChpbnN0LCBkZWYpO1xuICAgIChfYSA9IGluc3QuX3pvZC5kZWYpLndoZW4gPz8gKF9hLndoZW4gPSAocGF5bG9hZCkgPT4ge1xuICAgICAgICBjb25zdCB2YWwgPSBwYXlsb2FkLnZhbHVlO1xuICAgICAgICByZXR1cm4gIXV0aWwubnVsbGlzaCh2YWwpICYmIHZhbC5sZW5ndGggIT09IHVuZGVmaW5lZDtcbiAgICB9KTtcbiAgICBpbnN0Ll96b2Qub25hdHRhY2gucHVzaCgoaW5zdCkgPT4ge1xuICAgICAgICBjb25zdCBiYWcgPSBpbnN0Ll96b2QuYmFnO1xuICAgICAgICBiYWcubWluaW11bSA9IGRlZi5sZW5ndGg7XG4gICAgICAgIGJhZy5tYXhpbXVtID0gZGVmLmxlbmd0aDtcbiAgICAgICAgYmFnLmxlbmd0aCA9IGRlZi5sZW5ndGg7XG4gICAgfSk7XG4gICAgaW5zdC5fem9kLmNoZWNrID0gKHBheWxvYWQpID0+IHtcbiAgICAgICAgY29uc3QgaW5wdXQgPSBwYXlsb2FkLnZhbHVlO1xuICAgICAgICBjb25zdCBsZW5ndGggPSBpbnB1dC5sZW5ndGg7XG4gICAgICAgIGlmIChsZW5ndGggPT09IGRlZi5sZW5ndGgpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNvbnN0IG9yaWdpbiA9IHV0aWwuZ2V0TGVuZ3RoYWJsZU9yaWdpbihpbnB1dCk7XG4gICAgICAgIGNvbnN0IHRvb0JpZyA9IGxlbmd0aCA+IGRlZi5sZW5ndGg7XG4gICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xuICAgICAgICAgICAgb3JpZ2luLFxuICAgICAgICAgICAgLi4uKHRvb0JpZyA/IHsgY29kZTogXCJ0b29fYmlnXCIsIG1heGltdW06IGRlZi5sZW5ndGggfSA6IHsgY29kZTogXCJ0b29fc21hbGxcIiwgbWluaW11bTogZGVmLmxlbmd0aCB9KSxcbiAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgIGV4YWN0OiB0cnVlLFxuICAgICAgICAgICAgaW5wdXQ6IHBheWxvYWQudmFsdWUsXG4gICAgICAgICAgICBpbnN0LFxuICAgICAgICAgICAgY29udGludWU6ICFkZWYuYWJvcnQsXG4gICAgICAgIH0pO1xuICAgIH07XG59KTtcbmV4cG9ydCBjb25zdCAkWm9kQ2hlY2tTdHJpbmdGb3JtYXQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZENoZWNrU3RyaW5nRm9ybWF0XCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICB2YXIgX2EsIF9iO1xuICAgICRab2RDaGVjay5pbml0KGluc3QsIGRlZik7XG4gICAgaW5zdC5fem9kLm9uYXR0YWNoLnB1c2goKGluc3QpID0+IHtcbiAgICAgICAgY29uc3QgYmFnID0gaW5zdC5fem9kLmJhZztcbiAgICAgICAgYmFnLmZvcm1hdCA9IGRlZi5mb3JtYXQ7XG4gICAgICAgIGlmIChkZWYucGF0dGVybikge1xuICAgICAgICAgICAgYmFnLnBhdHRlcm5zID8/IChiYWcucGF0dGVybnMgPSBuZXcgU2V0KCkpO1xuICAgICAgICAgICAgYmFnLnBhdHRlcm5zLmFkZChkZWYucGF0dGVybik7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAoZGVmLnBhdHRlcm4pXG4gICAgICAgIChfYSA9IGluc3QuX3pvZCkuY2hlY2sgPz8gKF9hLmNoZWNrID0gKHBheWxvYWQpID0+IHtcbiAgICAgICAgICAgIGRlZi5wYXR0ZXJuLmxhc3RJbmRleCA9IDA7XG4gICAgICAgICAgICBpZiAoZGVmLnBhdHRlcm4udGVzdChwYXlsb2FkLnZhbHVlKSlcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBvcmlnaW46IFwic3RyaW5nXCIsXG4gICAgICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX2Zvcm1hdFwiLFxuICAgICAgICAgICAgICAgIGZvcm1hdDogZGVmLmZvcm1hdCxcbiAgICAgICAgICAgICAgICBpbnB1dDogcGF5bG9hZC52YWx1ZSxcbiAgICAgICAgICAgICAgICAuLi4oZGVmLnBhdHRlcm4gPyB7IHBhdHRlcm46IGRlZi5wYXR0ZXJuLnRvU3RyaW5nKCkgfSA6IHt9KSxcbiAgICAgICAgICAgICAgICBpbnN0LFxuICAgICAgICAgICAgICAgIGNvbnRpbnVlOiAhZGVmLmFib3J0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIGVsc2VcbiAgICAgICAgKF9iID0gaW5zdC5fem9kKS5jaGVjayA/PyAoX2IuY2hlY2sgPSAoKSA9PiB7IH0pO1xufSk7XG5leHBvcnQgY29uc3QgJFpvZENoZWNrUmVnZXggPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZENoZWNrUmVnZXhcIiwgKGluc3QsIGRlZikgPT4ge1xuICAgICRab2RDaGVja1N0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XG4gICAgaW5zdC5fem9kLmNoZWNrID0gKHBheWxvYWQpID0+IHtcbiAgICAgICAgZGVmLnBhdHRlcm4ubGFzdEluZGV4ID0gMDtcbiAgICAgICAgaWYgKGRlZi5wYXR0ZXJuLnRlc3QocGF5bG9hZC52YWx1ZSkpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xuICAgICAgICAgICAgb3JpZ2luOiBcInN0cmluZ1wiLFxuICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX2Zvcm1hdFwiLFxuICAgICAgICAgICAgZm9ybWF0OiBcInJlZ2V4XCIsXG4gICAgICAgICAgICBpbnB1dDogcGF5bG9hZC52YWx1ZSxcbiAgICAgICAgICAgIHBhdHRlcm46IGRlZi5wYXR0ZXJuLnRvU3RyaW5nKCksXG4gICAgICAgICAgICBpbnN0LFxuICAgICAgICAgICAgY29udGludWU6ICFkZWYuYWJvcnQsXG4gICAgICAgIH0pO1xuICAgIH07XG59KTtcbmV4cG9ydCBjb25zdCAkWm9kQ2hlY2tMb3dlckNhc2UgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZENoZWNrTG93ZXJDYXNlXCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICBkZWYucGF0dGVybiA/PyAoZGVmLnBhdHRlcm4gPSByZWdleGVzLmxvd2VyY2FzZSk7XG4gICAgJFpvZENoZWNrU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcbn0pO1xuZXhwb3J0IGNvbnN0ICRab2RDaGVja1VwcGVyQ2FzZSA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kQ2hlY2tVcHBlckNhc2VcIiwgKGluc3QsIGRlZikgPT4ge1xuICAgIGRlZi5wYXR0ZXJuID8/IChkZWYucGF0dGVybiA9IHJlZ2V4ZXMudXBwZXJjYXNlKTtcbiAgICAkWm9kQ2hlY2tTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xufSk7XG5leHBvcnQgY29uc3QgJFpvZENoZWNrSW5jbHVkZXMgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZENoZWNrSW5jbHVkZXNcIiwgKGluc3QsIGRlZikgPT4ge1xuICAgICRab2RDaGVjay5pbml0KGluc3QsIGRlZik7XG4gICAgY29uc3QgZXNjYXBlZFJlZ2V4ID0gdXRpbC5lc2NhcGVSZWdleChkZWYuaW5jbHVkZXMpO1xuICAgIGNvbnN0IHBhdHRlcm4gPSBuZXcgUmVnRXhwKHR5cGVvZiBkZWYucG9zaXRpb24gPT09IFwibnVtYmVyXCIgPyBgXi57JHtkZWYucG9zaXRpb259fSR7ZXNjYXBlZFJlZ2V4fWAgOiBlc2NhcGVkUmVnZXgpO1xuICAgIGRlZi5wYXR0ZXJuID0gcGF0dGVybjtcbiAgICBpbnN0Ll96b2Qub25hdHRhY2gucHVzaCgoaW5zdCkgPT4ge1xuICAgICAgICBjb25zdCBiYWcgPSBpbnN0Ll96b2QuYmFnO1xuICAgICAgICBiYWcucGF0dGVybnMgPz8gKGJhZy5wYXR0ZXJucyA9IG5ldyBTZXQoKSk7XG4gICAgICAgIGJhZy5wYXR0ZXJucy5hZGQocGF0dGVybik7XG4gICAgfSk7XG4gICAgaW5zdC5fem9kLmNoZWNrID0gKHBheWxvYWQpID0+IHtcbiAgICAgICAgaWYgKHBheWxvYWQudmFsdWUuaW5jbHVkZXMoZGVmLmluY2x1ZGVzLCBkZWYucG9zaXRpb24pKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcbiAgICAgICAgICAgIG9yaWdpbjogXCJzdHJpbmdcIixcbiAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF9mb3JtYXRcIixcbiAgICAgICAgICAgIGZvcm1hdDogXCJpbmNsdWRlc1wiLFxuICAgICAgICAgICAgaW5jbHVkZXM6IGRlZi5pbmNsdWRlcyxcbiAgICAgICAgICAgIGlucHV0OiBwYXlsb2FkLnZhbHVlLFxuICAgICAgICAgICAgaW5zdCxcbiAgICAgICAgICAgIGNvbnRpbnVlOiAhZGVmLmFib3J0LFxuICAgICAgICB9KTtcbiAgICB9O1xufSk7XG5leHBvcnQgY29uc3QgJFpvZENoZWNrU3RhcnRzV2l0aCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kQ2hlY2tTdGFydHNXaXRoXCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICAkWm9kQ2hlY2suaW5pdChpbnN0LCBkZWYpO1xuICAgIGNvbnN0IHBhdHRlcm4gPSBuZXcgUmVnRXhwKGBeJHt1dGlsLmVzY2FwZVJlZ2V4KGRlZi5wcmVmaXgpfS4qYCk7XG4gICAgZGVmLnBhdHRlcm4gPz8gKGRlZi5wYXR0ZXJuID0gcGF0dGVybik7XG4gICAgaW5zdC5fem9kLm9uYXR0YWNoLnB1c2goKGluc3QpID0+IHtcbiAgICAgICAgY29uc3QgYmFnID0gaW5zdC5fem9kLmJhZztcbiAgICAgICAgYmFnLnBhdHRlcm5zID8/IChiYWcucGF0dGVybnMgPSBuZXcgU2V0KCkpO1xuICAgICAgICBiYWcucGF0dGVybnMuYWRkKHBhdHRlcm4pO1xuICAgIH0pO1xuICAgIGluc3QuX3pvZC5jaGVjayA9IChwYXlsb2FkKSA9PiB7XG4gICAgICAgIGlmIChwYXlsb2FkLnZhbHVlLnN0YXJ0c1dpdGgoZGVmLnByZWZpeCkpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xuICAgICAgICAgICAgb3JpZ2luOiBcInN0cmluZ1wiLFxuICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX2Zvcm1hdFwiLFxuICAgICAgICAgICAgZm9ybWF0OiBcInN0YXJ0c193aXRoXCIsXG4gICAgICAgICAgICBwcmVmaXg6IGRlZi5wcmVmaXgsXG4gICAgICAgICAgICBpbnB1dDogcGF5bG9hZC52YWx1ZSxcbiAgICAgICAgICAgIGluc3QsXG4gICAgICAgICAgICBjb250aW51ZTogIWRlZi5hYm9ydCxcbiAgICAgICAgfSk7XG4gICAgfTtcbn0pO1xuZXhwb3J0IGNvbnN0ICRab2RDaGVja0VuZHNXaXRoID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RDaGVja0VuZHNXaXRoXCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICAkWm9kQ2hlY2suaW5pdChpbnN0LCBkZWYpO1xuICAgIGNvbnN0IHBhdHRlcm4gPSBuZXcgUmVnRXhwKGAuKiR7dXRpbC5lc2NhcGVSZWdleChkZWYuc3VmZml4KX0kYCk7XG4gICAgZGVmLnBhdHRlcm4gPz8gKGRlZi5wYXR0ZXJuID0gcGF0dGVybik7XG4gICAgaW5zdC5fem9kLm9uYXR0YWNoLnB1c2goKGluc3QpID0+IHtcbiAgICAgICAgY29uc3QgYmFnID0gaW5zdC5fem9kLmJhZztcbiAgICAgICAgYmFnLnBhdHRlcm5zID8/IChiYWcucGF0dGVybnMgPSBuZXcgU2V0KCkpO1xuICAgICAgICBiYWcucGF0dGVybnMuYWRkKHBhdHRlcm4pO1xuICAgIH0pO1xuICAgIGluc3QuX3pvZC5jaGVjayA9IChwYXlsb2FkKSA9PiB7XG4gICAgICAgIGlmIChwYXlsb2FkLnZhbHVlLmVuZHNXaXRoKGRlZi5zdWZmaXgpKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcbiAgICAgICAgICAgIG9yaWdpbjogXCJzdHJpbmdcIixcbiAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF9mb3JtYXRcIixcbiAgICAgICAgICAgIGZvcm1hdDogXCJlbmRzX3dpdGhcIixcbiAgICAgICAgICAgIHN1ZmZpeDogZGVmLnN1ZmZpeCxcbiAgICAgICAgICAgIGlucHV0OiBwYXlsb2FkLnZhbHVlLFxuICAgICAgICAgICAgaW5zdCxcbiAgICAgICAgICAgIGNvbnRpbnVlOiAhZGVmLmFib3J0LFxuICAgICAgICB9KTtcbiAgICB9O1xufSk7XG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8gICAgJFpvZENoZWNrUHJvcGVydHkgICAgLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5mdW5jdGlvbiBoYW5kbGVDaGVja1Byb3BlcnR5UmVzdWx0KHJlc3VsdCwgcGF5bG9hZCwgcHJvcGVydHkpIHtcbiAgICBpZiAocmVzdWx0Lmlzc3Vlcy5sZW5ndGgpIHtcbiAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCguLi51dGlsLnByZWZpeElzc3Vlcyhwcm9wZXJ0eSwgcmVzdWx0Lmlzc3VlcykpO1xuICAgIH1cbn1cbmV4cG9ydCBjb25zdCAkWm9kQ2hlY2tQcm9wZXJ0eSA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kQ2hlY2tQcm9wZXJ0eVwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgJFpvZENoZWNrLmluaXQoaW5zdCwgZGVmKTtcbiAgICBpbnN0Ll96b2QuY2hlY2sgPSAocGF5bG9hZCkgPT4ge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBkZWYuc2NoZW1hLl96b2QucnVuKHtcbiAgICAgICAgICAgIHZhbHVlOiBwYXlsb2FkLnZhbHVlW2RlZi5wcm9wZXJ0eV0sXG4gICAgICAgICAgICBpc3N1ZXM6IFtdLFxuICAgICAgICB9LCB7fSk7XG4gICAgICAgIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0LnRoZW4oKHJlc3VsdCkgPT4gaGFuZGxlQ2hlY2tQcm9wZXJ0eVJlc3VsdChyZXN1bHQsIHBheWxvYWQsIGRlZi5wcm9wZXJ0eSkpO1xuICAgICAgICB9XG4gICAgICAgIGhhbmRsZUNoZWNrUHJvcGVydHlSZXN1bHQocmVzdWx0LCBwYXlsb2FkLCBkZWYucHJvcGVydHkpO1xuICAgICAgICByZXR1cm47XG4gICAgfTtcbn0pO1xuZXhwb3J0IGNvbnN0ICRab2RDaGVja01pbWVUeXBlID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RDaGVja01pbWVUeXBlXCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICAkWm9kQ2hlY2suaW5pdChpbnN0LCBkZWYpO1xuICAgIGNvbnN0IG1pbWVTZXQgPSBuZXcgU2V0KGRlZi5taW1lKTtcbiAgICBpbnN0Ll96b2Qub25hdHRhY2gucHVzaCgoaW5zdCkgPT4ge1xuICAgICAgICBpbnN0Ll96b2QuYmFnLm1pbWUgPSBkZWYubWltZTtcbiAgICB9KTtcbiAgICBpbnN0Ll96b2QuY2hlY2sgPSAocGF5bG9hZCkgPT4ge1xuICAgICAgICBpZiAobWltZVNldC5oYXMocGF5bG9hZC52YWx1ZS50eXBlKSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XG4gICAgICAgICAgICBjb2RlOiBcImludmFsaWRfdmFsdWVcIixcbiAgICAgICAgICAgIHZhbHVlczogZGVmLm1pbWUsXG4gICAgICAgICAgICBpbnB1dDogcGF5bG9hZC52YWx1ZS50eXBlLFxuICAgICAgICAgICAgaW5zdCxcbiAgICAgICAgICAgIGNvbnRpbnVlOiAhZGVmLmFib3J0LFxuICAgICAgICB9KTtcbiAgICB9O1xufSk7XG5leHBvcnQgY29uc3QgJFpvZENoZWNrT3ZlcndyaXRlID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RDaGVja092ZXJ3cml0ZVwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgJFpvZENoZWNrLmluaXQoaW5zdCwgZGVmKTtcbiAgICBpbnN0Ll96b2QuY2hlY2sgPSAocGF5bG9hZCkgPT4ge1xuICAgICAgICBwYXlsb2FkLnZhbHVlID0gZGVmLnR4KHBheWxvYWQudmFsdWUpO1xuICAgIH07XG59KTtcbiIsImV4cG9ydCBjbGFzcyBEb2Mge1xuICAgIGNvbnN0cnVjdG9yKGFyZ3MgPSBbXSkge1xuICAgICAgICB0aGlzLmNvbnRlbnQgPSBbXTtcbiAgICAgICAgdGhpcy5pbmRlbnQgPSAwO1xuICAgICAgICBpZiAodGhpcylcbiAgICAgICAgICAgIHRoaXMuYXJncyA9IGFyZ3M7XG4gICAgfVxuICAgIGluZGVudGVkKGZuKSB7XG4gICAgICAgIHRoaXMuaW5kZW50ICs9IDE7XG4gICAgICAgIGZuKHRoaXMpO1xuICAgICAgICB0aGlzLmluZGVudCAtPSAxO1xuICAgIH1cbiAgICB3cml0ZShhcmcpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBhcmcgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgYXJnKHRoaXMsIHsgZXhlY3V0aW9uOiBcInN5bmNcIiB9KTtcbiAgICAgICAgICAgIGFyZyh0aGlzLCB7IGV4ZWN1dGlvbjogXCJhc3luY1wiIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBhcmc7XG4gICAgICAgIGNvbnN0IGxpbmVzID0gY29udGVudC5zcGxpdChcIlxcblwiKS5maWx0ZXIoKHgpID0+IHgpO1xuICAgICAgICBjb25zdCBtaW5JbmRlbnQgPSBNYXRoLm1pbiguLi5saW5lcy5tYXAoKHgpID0+IHgubGVuZ3RoIC0geC50cmltU3RhcnQoKS5sZW5ndGgpKTtcbiAgICAgICAgY29uc3QgZGVkZW50ZWQgPSBsaW5lcy5tYXAoKHgpID0+IHguc2xpY2UobWluSW5kZW50KSkubWFwKCh4KSA9PiBcIiBcIi5yZXBlYXQodGhpcy5pbmRlbnQgKiAyKSArIHgpO1xuICAgICAgICBmb3IgKGNvbnN0IGxpbmUgb2YgZGVkZW50ZWQpIHtcbiAgICAgICAgICAgIHRoaXMuY29udGVudC5wdXNoKGxpbmUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbXBpbGUoKSB7XG4gICAgICAgIGNvbnN0IEYgPSBGdW5jdGlvbjtcbiAgICAgICAgY29uc3QgYXJncyA9IHRoaXM/LmFyZ3M7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSB0aGlzPy5jb250ZW50ID8/IFtgYF07XG4gICAgICAgIGNvbnN0IGxpbmVzID0gWy4uLmNvbnRlbnQubWFwKCh4KSA9PiBgICAke3h9YCldO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhsaW5lcy5qb2luKFwiXFxuXCIpKTtcbiAgICAgICAgcmV0dXJuIG5ldyBGKC4uLmFyZ3MsIGxpbmVzLmpvaW4oXCJcXG5cIikpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7ICRjb25zdHJ1Y3RvciB9IGZyb20gXCIuL2NvcmUuanNcIjtcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSBcIi4vdXRpbC5qc1wiO1xuY29uc3QgaW5pdGlhbGl6ZXIgPSAoaW5zdCwgZGVmKSA9PiB7XG4gICAgaW5zdC5uYW1lID0gXCIkWm9kRXJyb3JcIjtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoaW5zdCwgXCJfem9kXCIsIHtcbiAgICAgICAgdmFsdWU6IGluc3QuX3pvZCxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGluc3QsIFwiaXNzdWVzXCIsIHtcbiAgICAgICAgdmFsdWU6IGRlZixcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgfSk7XG4gICAgaW5zdC5tZXNzYWdlID0gSlNPTi5zdHJpbmdpZnkoZGVmLCB1dGlsLmpzb25TdHJpbmdpZnlSZXBsYWNlciwgMik7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGluc3QsIFwidG9TdHJpbmdcIiwge1xuICAgICAgICB2YWx1ZTogKCkgPT4gaW5zdC5tZXNzYWdlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICB9KTtcbn07XG5leHBvcnQgY29uc3QgJFpvZEVycm9yID0gJGNvbnN0cnVjdG9yKFwiJFpvZEVycm9yXCIsIGluaXRpYWxpemVyKTtcbmV4cG9ydCBjb25zdCAkWm9kUmVhbEVycm9yID0gJGNvbnN0cnVjdG9yKFwiJFpvZEVycm9yXCIsIGluaXRpYWxpemVyLCB7IFBhcmVudDogRXJyb3IgfSk7XG5leHBvcnQgZnVuY3Rpb24gZmxhdHRlbkVycm9yKGVycm9yLCBtYXBwZXIgPSAoaXNzdWUpID0+IGlzc3VlLm1lc3NhZ2UpIHtcbiAgICBjb25zdCBmaWVsZEVycm9ycyA9IHt9O1xuICAgIGNvbnN0IGZvcm1FcnJvcnMgPSBbXTtcbiAgICBmb3IgKGNvbnN0IHN1YiBvZiBlcnJvci5pc3N1ZXMpIHtcbiAgICAgICAgaWYgKHN1Yi5wYXRoLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGZpZWxkRXJyb3JzW3N1Yi5wYXRoWzBdXSA9IGZpZWxkRXJyb3JzW3N1Yi5wYXRoWzBdXSB8fCBbXTtcbiAgICAgICAgICAgIGZpZWxkRXJyb3JzW3N1Yi5wYXRoWzBdXS5wdXNoKG1hcHBlcihzdWIpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGZvcm1FcnJvcnMucHVzaChtYXBwZXIoc3ViKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHsgZm9ybUVycm9ycywgZmllbGRFcnJvcnMgfTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRFcnJvcihlcnJvciwgbWFwcGVyID0gKGlzc3VlKSA9PiBpc3N1ZS5tZXNzYWdlKSB7XG4gICAgY29uc3QgZmllbGRFcnJvcnMgPSB7IF9lcnJvcnM6IFtdIH07XG4gICAgY29uc3QgcHJvY2Vzc0Vycm9yID0gKGVycm9yLCBwYXRoID0gW10pID0+IHtcbiAgICAgICAgZm9yIChjb25zdCBpc3N1ZSBvZiBlcnJvci5pc3N1ZXMpIHtcbiAgICAgICAgICAgIGlmIChpc3N1ZS5jb2RlID09PSBcImludmFsaWRfdW5pb25cIiAmJiBpc3N1ZS5lcnJvcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaXNzdWUuZXJyb3JzLm1hcCgoaXNzdWVzKSA9PiBwcm9jZXNzRXJyb3IoeyBpc3N1ZXMgfSwgWy4uLnBhdGgsIC4uLmlzc3VlLnBhdGhdKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpc3N1ZS5jb2RlID09PSBcImludmFsaWRfa2V5XCIpIHtcbiAgICAgICAgICAgICAgICBwcm9jZXNzRXJyb3IoeyBpc3N1ZXM6IGlzc3VlLmlzc3VlcyB9LCBbLi4ucGF0aCwgLi4uaXNzdWUucGF0aF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoaXNzdWUuY29kZSA9PT0gXCJpbnZhbGlkX2VsZW1lbnRcIikge1xuICAgICAgICAgICAgICAgIHByb2Nlc3NFcnJvcih7IGlzc3VlczogaXNzdWUuaXNzdWVzIH0sIFsuLi5wYXRoLCAuLi5pc3N1ZS5wYXRoXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBmdWxscGF0aCA9IFsuLi5wYXRoLCAuLi5pc3N1ZS5wYXRoXTtcbiAgICAgICAgICAgICAgICBpZiAoZnVsbHBhdGgubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpZWxkRXJyb3JzLl9lcnJvcnMucHVzaChtYXBwZXIoaXNzdWUpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjdXJyID0gZmllbGRFcnJvcnM7XG4gICAgICAgICAgICAgICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGkgPCBmdWxscGF0aC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVsID0gZnVsbHBhdGhbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0ZXJtaW5hbCA9IGkgPT09IGZ1bGxwYXRoLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXRlcm1pbmFsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycltlbF0gPSBjdXJyW2VsXSB8fCB7IF9lcnJvcnM6IFtdIH07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyW2VsXSA9IGN1cnJbZWxdIHx8IHsgX2Vycm9yczogW10gfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyW2VsXS5fZXJyb3JzLnB1c2gobWFwcGVyKGlzc3VlKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyID0gY3VycltlbF07XG4gICAgICAgICAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHByb2Nlc3NFcnJvcihlcnJvcik7XG4gICAgcmV0dXJuIGZpZWxkRXJyb3JzO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHRyZWVpZnlFcnJvcihlcnJvciwgbWFwcGVyID0gKGlzc3VlKSA9PiBpc3N1ZS5tZXNzYWdlKSB7XG4gICAgY29uc3QgcmVzdWx0ID0geyBlcnJvcnM6IFtdIH07XG4gICAgY29uc3QgcHJvY2Vzc0Vycm9yID0gKGVycm9yLCBwYXRoID0gW10pID0+IHtcbiAgICAgICAgdmFyIF9hLCBfYjtcbiAgICAgICAgZm9yIChjb25zdCBpc3N1ZSBvZiBlcnJvci5pc3N1ZXMpIHtcbiAgICAgICAgICAgIGlmIChpc3N1ZS5jb2RlID09PSBcImludmFsaWRfdW5pb25cIiAmJiBpc3N1ZS5lcnJvcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgLy8gcmVndWxhciB1bmlvbiBlcnJvclxuICAgICAgICAgICAgICAgIGlzc3VlLmVycm9ycy5tYXAoKGlzc3VlcykgPT4gcHJvY2Vzc0Vycm9yKHsgaXNzdWVzIH0sIFsuLi5wYXRoLCAuLi5pc3N1ZS5wYXRoXSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoaXNzdWUuY29kZSA9PT0gXCJpbnZhbGlkX2tleVwiKSB7XG4gICAgICAgICAgICAgICAgcHJvY2Vzc0Vycm9yKHsgaXNzdWVzOiBpc3N1ZS5pc3N1ZXMgfSwgWy4uLnBhdGgsIC4uLmlzc3VlLnBhdGhdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGlzc3VlLmNvZGUgPT09IFwiaW52YWxpZF9lbGVtZW50XCIpIHtcbiAgICAgICAgICAgICAgICBwcm9jZXNzRXJyb3IoeyBpc3N1ZXM6IGlzc3VlLmlzc3VlcyB9LCBbLi4ucGF0aCwgLi4uaXNzdWUucGF0aF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZnVsbHBhdGggPSBbLi4ucGF0aCwgLi4uaXNzdWUucGF0aF07XG4gICAgICAgICAgICAgICAgaWYgKGZ1bGxwYXRoLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQuZXJyb3JzLnB1c2gobWFwcGVyKGlzc3VlKSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgY3VyciA9IHJlc3VsdDtcbiAgICAgICAgICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgICAgICAgICAgd2hpbGUgKGkgPCBmdWxscGF0aC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZWwgPSBmdWxscGF0aFtpXTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdGVybWluYWwgPSBpID09PSBmdWxscGF0aC5sZW5ndGggLSAxO1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGVsID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyLnByb3BlcnRpZXMgPz8gKGN1cnIucHJvcGVydGllcyA9IHt9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIChfYSA9IGN1cnIucHJvcGVydGllcylbZWxdID8/IChfYVtlbF0gPSB7IGVycm9yczogW10gfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyID0gY3Vyci5wcm9wZXJ0aWVzW2VsXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnIuaXRlbXMgPz8gKGN1cnIuaXRlbXMgPSBbXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAoX2IgPSBjdXJyLml0ZW1zKVtlbF0gPz8gKF9iW2VsXSA9IHsgZXJyb3JzOiBbXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnIgPSBjdXJyLml0ZW1zW2VsXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodGVybWluYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnIuZXJyb3JzLnB1c2gobWFwcGVyKGlzc3VlKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgcHJvY2Vzc0Vycm9yKGVycm9yKTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuLyoqIEZvcm1hdCBhIFpvZEVycm9yIGFzIGEgaHVtYW4tcmVhZGFibGUgc3RyaW5nIGluIHRoZSBmb2xsb3dpbmcgZm9ybS5cbiAqXG4gKiBGcm9tXG4gKlxuICogYGBgdHNcbiAqIFpvZEVycm9yIHtcbiAqICAgaXNzdWVzOiBbXG4gKiAgICAge1xuICogICAgICAgZXhwZWN0ZWQ6ICdzdHJpbmcnLFxuICogICAgICAgY29kZTogJ2ludmFsaWRfdHlwZScsXG4gKiAgICAgICBwYXRoOiBbICd1c2VybmFtZScgXSxcbiAqICAgICAgIG1lc3NhZ2U6ICdJbnZhbGlkIGlucHV0OiBleHBlY3RlZCBzdHJpbmcnXG4gKiAgICAgfSxcbiAqICAgICB7XG4gKiAgICAgICBleHBlY3RlZDogJ251bWJlcicsXG4gKiAgICAgICBjb2RlOiAnaW52YWxpZF90eXBlJyxcbiAqICAgICAgIHBhdGg6IFsgJ2Zhdm9yaXRlTnVtYmVycycsIDEgXSxcbiAqICAgICAgIG1lc3NhZ2U6ICdJbnZhbGlkIGlucHV0OiBleHBlY3RlZCBudW1iZXInXG4gKiAgICAgfVxuICogICBdO1xuICogfVxuICogYGBgXG4gKlxuICogdG9cbiAqXG4gKiBgYGBcbiAqIHVzZXJuYW1lXG4gKiAgIOKcliBFeHBlY3RlZCBudW1iZXIsIHJlY2VpdmVkIHN0cmluZyBhdCBcInVzZXJuYW1lXG4gKiBmYXZvcml0ZU51bWJlcnNbMF1cbiAqICAg4pyWIEludmFsaWQgaW5wdXQ6IGV4cGVjdGVkIG51bWJlclxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b0RvdFBhdGgoX3BhdGgpIHtcbiAgICBjb25zdCBzZWdzID0gW107XG4gICAgY29uc3QgcGF0aCA9IF9wYXRoLm1hcCgoc2VnKSA9PiAodHlwZW9mIHNlZyA9PT0gXCJvYmplY3RcIiA/IHNlZy5rZXkgOiBzZWcpKTtcbiAgICBmb3IgKGNvbnN0IHNlZyBvZiBwYXRoKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2VnID09PSBcIm51bWJlclwiKVxuICAgICAgICAgICAgc2Vncy5wdXNoKGBbJHtzZWd9XWApO1xuICAgICAgICBlbHNlIGlmICh0eXBlb2Ygc2VnID09PSBcInN5bWJvbFwiKVxuICAgICAgICAgICAgc2Vncy5wdXNoKGBbJHtKU09OLnN0cmluZ2lmeShTdHJpbmcoc2VnKSl9XWApO1xuICAgICAgICBlbHNlIGlmICgvW15cXHckXS8udGVzdChzZWcpKVxuICAgICAgICAgICAgc2Vncy5wdXNoKGBbJHtKU09OLnN0cmluZ2lmeShzZWcpfV1gKTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoc2Vncy5sZW5ndGgpXG4gICAgICAgICAgICAgICAgc2Vncy5wdXNoKFwiLlwiKTtcbiAgICAgICAgICAgIHNlZ3MucHVzaChzZWcpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzZWdzLmpvaW4oXCJcIik7XG59XG5leHBvcnQgZnVuY3Rpb24gcHJldHRpZnlFcnJvcihlcnJvcikge1xuICAgIGNvbnN0IGxpbmVzID0gW107XG4gICAgLy8gc29ydCBieSBwYXRoIGxlbmd0aFxuICAgIGNvbnN0IGlzc3VlcyA9IFsuLi5lcnJvci5pc3N1ZXNdLnNvcnQoKGEsIGIpID0+IChhLnBhdGggPz8gW10pLmxlbmd0aCAtIChiLnBhdGggPz8gW10pLmxlbmd0aCk7XG4gICAgLy8gUHJvY2VzcyBlYWNoIGlzc3VlXG4gICAgZm9yIChjb25zdCBpc3N1ZSBvZiBpc3N1ZXMpIHtcbiAgICAgICAgbGluZXMucHVzaChg4pyWICR7aXNzdWUubWVzc2FnZX1gKTtcbiAgICAgICAgaWYgKGlzc3VlLnBhdGg/Lmxlbmd0aClcbiAgICAgICAgICAgIGxpbmVzLnB1c2goYCAg4oaSIGF0ICR7dG9Eb3RQYXRoKGlzc3VlLnBhdGgpfWApO1xuICAgIH1cbiAgICAvLyBDb252ZXJ0IE1hcCB0byBmb3JtYXR0ZWQgc3RyaW5nXG4gICAgcmV0dXJuIGxpbmVzLmpvaW4oXCJcXG5cIik7XG59XG4iLCJpbXBvcnQgKiBhcyBjb3JlIGZyb20gXCIuL2NvcmUuanNcIjtcbmltcG9ydCAqIGFzIGVycm9ycyBmcm9tIFwiLi9lcnJvcnMuanNcIjtcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSBcIi4vdXRpbC5qc1wiO1xuZXhwb3J0IGNvbnN0IF9wYXJzZSA9IChfRXJyKSA9PiAoc2NoZW1hLCB2YWx1ZSwgX2N0eCwgX3BhcmFtcykgPT4ge1xuICAgIGNvbnN0IGN0eCA9IF9jdHggPyB7IC4uLl9jdHgsIGFzeW5jOiBmYWxzZSB9IDogeyBhc3luYzogZmFsc2UgfTtcbiAgICBjb25zdCByZXN1bHQgPSBzY2hlbWEuX3pvZC5ydW4oeyB2YWx1ZSwgaXNzdWVzOiBbXSB9LCBjdHgpO1xuICAgIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgIHRocm93IG5ldyBjb3JlLiRab2RBc3luY0Vycm9yKCk7XG4gICAgfVxuICAgIGlmIChyZXN1bHQuaXNzdWVzLmxlbmd0aCkge1xuICAgICAgICBjb25zdCBlID0gbmV3IChfcGFyYW1zPy5FcnIgPz8gX0VycikocmVzdWx0Lmlzc3Vlcy5tYXAoKGlzcykgPT4gdXRpbC5maW5hbGl6ZUlzc3VlKGlzcywgY3R4LCBjb3JlLmNvbmZpZygpKSkpO1xuICAgICAgICB1dGlsLmNhcHR1cmVTdGFja1RyYWNlKGUsIF9wYXJhbXM/LmNhbGxlZSk7XG4gICAgICAgIHRocm93IGU7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQudmFsdWU7XG59O1xuZXhwb3J0IGNvbnN0IHBhcnNlID0gLyogQF9fUFVSRV9fKi8gX3BhcnNlKGVycm9ycy4kWm9kUmVhbEVycm9yKTtcbmV4cG9ydCBjb25zdCBfcGFyc2VBc3luYyA9IChfRXJyKSA9PiBhc3luYyAoc2NoZW1hLCB2YWx1ZSwgX2N0eCwgcGFyYW1zKSA9PiB7XG4gICAgY29uc3QgY3R4ID0gX2N0eCA/IHsgLi4uX2N0eCwgYXN5bmM6IHRydWUgfSA6IHsgYXN5bmM6IHRydWUgfTtcbiAgICBsZXQgcmVzdWx0ID0gc2NoZW1hLl96b2QucnVuKHsgdmFsdWUsIGlzc3VlczogW10gfSwgY3R4KTtcbiAgICBpZiAocmVzdWx0IGluc3RhbmNlb2YgUHJvbWlzZSlcbiAgICAgICAgcmVzdWx0ID0gYXdhaXQgcmVzdWx0O1xuICAgIGlmIChyZXN1bHQuaXNzdWVzLmxlbmd0aCkge1xuICAgICAgICBjb25zdCBlID0gbmV3IChwYXJhbXM/LkVyciA/PyBfRXJyKShyZXN1bHQuaXNzdWVzLm1hcCgoaXNzKSA9PiB1dGlsLmZpbmFsaXplSXNzdWUoaXNzLCBjdHgsIGNvcmUuY29uZmlnKCkpKSk7XG4gICAgICAgIHV0aWwuY2FwdHVyZVN0YWNrVHJhY2UoZSwgcGFyYW1zPy5jYWxsZWUpO1xuICAgICAgICB0aHJvdyBlO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0LnZhbHVlO1xufTtcbmV4cG9ydCBjb25zdCBwYXJzZUFzeW5jID0gLyogQF9fUFVSRV9fKi8gX3BhcnNlQXN5bmMoZXJyb3JzLiRab2RSZWFsRXJyb3IpO1xuZXhwb3J0IGNvbnN0IF9zYWZlUGFyc2UgPSAoX0VycikgPT4gKHNjaGVtYSwgdmFsdWUsIF9jdHgpID0+IHtcbiAgICBjb25zdCBjdHggPSBfY3R4ID8geyAuLi5fY3R4LCBhc3luYzogZmFsc2UgfSA6IHsgYXN5bmM6IGZhbHNlIH07XG4gICAgY29uc3QgcmVzdWx0ID0gc2NoZW1hLl96b2QucnVuKHsgdmFsdWUsIGlzc3VlczogW10gfSwgY3R4KTtcbiAgICBpZiAocmVzdWx0IGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgICB0aHJvdyBuZXcgY29yZS4kWm9kQXN5bmNFcnJvcigpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0Lmlzc3Vlcy5sZW5ndGhcbiAgICAgICAgPyB7XG4gICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgIGVycm9yOiBuZXcgKF9FcnIgPz8gZXJyb3JzLiRab2RFcnJvcikocmVzdWx0Lmlzc3Vlcy5tYXAoKGlzcykgPT4gdXRpbC5maW5hbGl6ZUlzc3VlKGlzcywgY3R4LCBjb3JlLmNvbmZpZygpKSkpLFxuICAgICAgICB9XG4gICAgICAgIDogeyBzdWNjZXNzOiB0cnVlLCBkYXRhOiByZXN1bHQudmFsdWUgfTtcbn07XG5leHBvcnQgY29uc3Qgc2FmZVBhcnNlID0gLyogQF9fUFVSRV9fKi8gX3NhZmVQYXJzZShlcnJvcnMuJFpvZFJlYWxFcnJvcik7XG5leHBvcnQgY29uc3QgX3NhZmVQYXJzZUFzeW5jID0gKF9FcnIpID0+IGFzeW5jIChzY2hlbWEsIHZhbHVlLCBfY3R4KSA9PiB7XG4gICAgY29uc3QgY3R4ID0gX2N0eCA/IHsgLi4uX2N0eCwgYXN5bmM6IHRydWUgfSA6IHsgYXN5bmM6IHRydWUgfTtcbiAgICBsZXQgcmVzdWx0ID0gc2NoZW1hLl96b2QucnVuKHsgdmFsdWUsIGlzc3VlczogW10gfSwgY3R4KTtcbiAgICBpZiAocmVzdWx0IGluc3RhbmNlb2YgUHJvbWlzZSlcbiAgICAgICAgcmVzdWx0ID0gYXdhaXQgcmVzdWx0O1xuICAgIHJldHVybiByZXN1bHQuaXNzdWVzLmxlbmd0aFxuICAgICAgICA/IHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgZXJyb3I6IG5ldyBfRXJyKHJlc3VsdC5pc3N1ZXMubWFwKChpc3MpID0+IHV0aWwuZmluYWxpemVJc3N1ZShpc3MsIGN0eCwgY29yZS5jb25maWcoKSkpKSxcbiAgICAgICAgfVxuICAgICAgICA6IHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogcmVzdWx0LnZhbHVlIH07XG59O1xuZXhwb3J0IGNvbnN0IHNhZmVQYXJzZUFzeW5jID0gLyogQF9fUFVSRV9fKi8gX3NhZmVQYXJzZUFzeW5jKGVycm9ycy4kWm9kUmVhbEVycm9yKTtcbmV4cG9ydCBjb25zdCBfZW5jb2RlID0gKF9FcnIpID0+IChzY2hlbWEsIHZhbHVlLCBfY3R4KSA9PiB7XG4gICAgY29uc3QgY3R4ID0gX2N0eCA/IHsgLi4uX2N0eCwgZGlyZWN0aW9uOiBcImJhY2t3YXJkXCIgfSA6IHsgZGlyZWN0aW9uOiBcImJhY2t3YXJkXCIgfTtcbiAgICByZXR1cm4gX3BhcnNlKF9FcnIpKHNjaGVtYSwgdmFsdWUsIGN0eCk7XG59O1xuZXhwb3J0IGNvbnN0IGVuY29kZSA9IC8qIEBfX1BVUkVfXyovIF9lbmNvZGUoZXJyb3JzLiRab2RSZWFsRXJyb3IpO1xuZXhwb3J0IGNvbnN0IF9kZWNvZGUgPSAoX0VycikgPT4gKHNjaGVtYSwgdmFsdWUsIF9jdHgpID0+IHtcbiAgICByZXR1cm4gX3BhcnNlKF9FcnIpKHNjaGVtYSwgdmFsdWUsIF9jdHgpO1xufTtcbmV4cG9ydCBjb25zdCBkZWNvZGUgPSAvKiBAX19QVVJFX18qLyBfZGVjb2RlKGVycm9ycy4kWm9kUmVhbEVycm9yKTtcbmV4cG9ydCBjb25zdCBfZW5jb2RlQXN5bmMgPSAoX0VycikgPT4gYXN5bmMgKHNjaGVtYSwgdmFsdWUsIF9jdHgpID0+IHtcbiAgICBjb25zdCBjdHggPSBfY3R4ID8geyAuLi5fY3R4LCBkaXJlY3Rpb246IFwiYmFja3dhcmRcIiB9IDogeyBkaXJlY3Rpb246IFwiYmFja3dhcmRcIiB9O1xuICAgIHJldHVybiBfcGFyc2VBc3luYyhfRXJyKShzY2hlbWEsIHZhbHVlLCBjdHgpO1xufTtcbmV4cG9ydCBjb25zdCBlbmNvZGVBc3luYyA9IC8qIEBfX1BVUkVfXyovIF9lbmNvZGVBc3luYyhlcnJvcnMuJFpvZFJlYWxFcnJvcik7XG5leHBvcnQgY29uc3QgX2RlY29kZUFzeW5jID0gKF9FcnIpID0+IGFzeW5jIChzY2hlbWEsIHZhbHVlLCBfY3R4KSA9PiB7XG4gICAgcmV0dXJuIF9wYXJzZUFzeW5jKF9FcnIpKHNjaGVtYSwgdmFsdWUsIF9jdHgpO1xufTtcbmV4cG9ydCBjb25zdCBkZWNvZGVBc3luYyA9IC8qIEBfX1BVUkVfXyovIF9kZWNvZGVBc3luYyhlcnJvcnMuJFpvZFJlYWxFcnJvcik7XG5leHBvcnQgY29uc3QgX3NhZmVFbmNvZGUgPSAoX0VycikgPT4gKHNjaGVtYSwgdmFsdWUsIF9jdHgpID0+IHtcbiAgICBjb25zdCBjdHggPSBfY3R4ID8geyAuLi5fY3R4LCBkaXJlY3Rpb246IFwiYmFja3dhcmRcIiB9IDogeyBkaXJlY3Rpb246IFwiYmFja3dhcmRcIiB9O1xuICAgIHJldHVybiBfc2FmZVBhcnNlKF9FcnIpKHNjaGVtYSwgdmFsdWUsIGN0eCk7XG59O1xuZXhwb3J0IGNvbnN0IHNhZmVFbmNvZGUgPSAvKiBAX19QVVJFX18qLyBfc2FmZUVuY29kZShlcnJvcnMuJFpvZFJlYWxFcnJvcik7XG5leHBvcnQgY29uc3QgX3NhZmVEZWNvZGUgPSAoX0VycikgPT4gKHNjaGVtYSwgdmFsdWUsIF9jdHgpID0+IHtcbiAgICByZXR1cm4gX3NhZmVQYXJzZShfRXJyKShzY2hlbWEsIHZhbHVlLCBfY3R4KTtcbn07XG5leHBvcnQgY29uc3Qgc2FmZURlY29kZSA9IC8qIEBfX1BVUkVfXyovIF9zYWZlRGVjb2RlKGVycm9ycy4kWm9kUmVhbEVycm9yKTtcbmV4cG9ydCBjb25zdCBfc2FmZUVuY29kZUFzeW5jID0gKF9FcnIpID0+IGFzeW5jIChzY2hlbWEsIHZhbHVlLCBfY3R4KSA9PiB7XG4gICAgY29uc3QgY3R4ID0gX2N0eCA/IHsgLi4uX2N0eCwgZGlyZWN0aW9uOiBcImJhY2t3YXJkXCIgfSA6IHsgZGlyZWN0aW9uOiBcImJhY2t3YXJkXCIgfTtcbiAgICByZXR1cm4gX3NhZmVQYXJzZUFzeW5jKF9FcnIpKHNjaGVtYSwgdmFsdWUsIGN0eCk7XG59O1xuZXhwb3J0IGNvbnN0IHNhZmVFbmNvZGVBc3luYyA9IC8qIEBfX1BVUkVfXyovIF9zYWZlRW5jb2RlQXN5bmMoZXJyb3JzLiRab2RSZWFsRXJyb3IpO1xuZXhwb3J0IGNvbnN0IF9zYWZlRGVjb2RlQXN5bmMgPSAoX0VycikgPT4gYXN5bmMgKHNjaGVtYSwgdmFsdWUsIF9jdHgpID0+IHtcbiAgICByZXR1cm4gX3NhZmVQYXJzZUFzeW5jKF9FcnIpKHNjaGVtYSwgdmFsdWUsIF9jdHgpO1xufTtcbmV4cG9ydCBjb25zdCBzYWZlRGVjb2RlQXN5bmMgPSAvKiBAX19QVVJFX18qLyBfc2FmZURlY29kZUFzeW5jKGVycm9ycy4kWm9kUmVhbEVycm9yKTtcbiIsImV4cG9ydCBjb25zdCB2ZXJzaW9uID0ge1xuICAgIG1ham9yOiA0LFxuICAgIG1pbm9yOiA0LFxuICAgIHBhdGNoOiAzLFxufTtcbiIsImltcG9ydCAqIGFzIGNoZWNrcyBmcm9tIFwiLi9jaGVja3MuanNcIjtcbmltcG9ydCAqIGFzIGNvcmUgZnJvbSBcIi4vY29yZS5qc1wiO1xuaW1wb3J0IHsgRG9jIH0gZnJvbSBcIi4vZG9jLmpzXCI7XG5pbXBvcnQgeyBwYXJzZSwgcGFyc2VBc3luYywgc2FmZVBhcnNlLCBzYWZlUGFyc2VBc3luYyB9IGZyb20gXCIuL3BhcnNlLmpzXCI7XG5pbXBvcnQgKiBhcyByZWdleGVzIGZyb20gXCIuL3JlZ2V4ZXMuanNcIjtcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSBcIi4vdXRpbC5qc1wiO1xuaW1wb3J0IHsgdmVyc2lvbiB9IGZyb20gXCIuL3ZlcnNpb25zLmpzXCI7XG5leHBvcnQgY29uc3QgJFpvZFR5cGUgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZFR5cGVcIiwgKGluc3QsIGRlZikgPT4ge1xuICAgIHZhciBfYTtcbiAgICBpbnN0ID8/IChpbnN0ID0ge30pO1xuICAgIGluc3QuX3pvZC5kZWYgPSBkZWY7IC8vIHNldCBfZGVmIHByb3BlcnR5XG4gICAgaW5zdC5fem9kLmJhZyA9IGluc3QuX3pvZC5iYWcgfHwge307IC8vIGluaXRpYWxpemUgX2JhZyBvYmplY3RcbiAgICBpbnN0Ll96b2QudmVyc2lvbiA9IHZlcnNpb247XG4gICAgY29uc3QgY2hlY2tzID0gWy4uLihpbnN0Ll96b2QuZGVmLmNoZWNrcyA/PyBbXSldO1xuICAgIC8vIGlmIGluc3QgaXMgaXRzZWxmIGEgY2hlY2tzLiRab2RDaGVjaywgcnVuIGl0IGFzIGEgY2hlY2tcbiAgICBpZiAoaW5zdC5fem9kLnRyYWl0cy5oYXMoXCIkWm9kQ2hlY2tcIikpIHtcbiAgICAgICAgY2hlY2tzLnVuc2hpZnQoaW5zdCk7XG4gICAgfVxuICAgIGZvciAoY29uc3QgY2ggb2YgY2hlY2tzKSB7XG4gICAgICAgIGZvciAoY29uc3QgZm4gb2YgY2guX3pvZC5vbmF0dGFjaCkge1xuICAgICAgICAgICAgZm4oaW5zdCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGNoZWNrcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgLy8gZGVmZXJyZWQgaW5pdGlhbGl6ZXJcbiAgICAgICAgLy8gaW5zdC5fem9kLnBhcnNlIGlzIG5vdCB5ZXQgZGVmaW5lZFxuICAgICAgICAoX2EgPSBpbnN0Ll96b2QpLmRlZmVycmVkID8/IChfYS5kZWZlcnJlZCA9IFtdKTtcbiAgICAgICAgaW5zdC5fem9kLmRlZmVycmVkPy5wdXNoKCgpID0+IHtcbiAgICAgICAgICAgIGluc3QuX3pvZC5ydW4gPSBpbnN0Ll96b2QucGFyc2U7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgY29uc3QgcnVuQ2hlY2tzID0gKHBheWxvYWQsIGNoZWNrcywgY3R4KSA9PiB7XG4gICAgICAgICAgICBsZXQgaXNBYm9ydGVkID0gdXRpbC5hYm9ydGVkKHBheWxvYWQpO1xuICAgICAgICAgICAgbGV0IGFzeW5jUmVzdWx0O1xuICAgICAgICAgICAgZm9yIChjb25zdCBjaCBvZiBjaGVja3MpIHtcbiAgICAgICAgICAgICAgICBpZiAoY2guX3pvZC5kZWYud2hlbikge1xuICAgICAgICAgICAgICAgICAgICBpZiAodXRpbC5leHBsaWNpdGx5QWJvcnRlZChwYXlsb2FkKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzaG91bGRSdW4gPSBjaC5fem9kLmRlZi53aGVuKHBheWxvYWQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXNob3VsZFJ1bilcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChpc0Fib3J0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJMZW4gPSBwYXlsb2FkLmlzc3Vlcy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgY29uc3QgXyA9IGNoLl96b2QuY2hlY2socGF5bG9hZCk7XG4gICAgICAgICAgICAgICAgaWYgKF8gaW5zdGFuY2VvZiBQcm9taXNlICYmIGN0eD8uYXN5bmMgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBjb3JlLiRab2RBc3luY0Vycm9yKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChhc3luY1Jlc3VsdCB8fCBfIGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgICAgICAgICAgICAgICBhc3luY1Jlc3VsdCA9IChhc3luY1Jlc3VsdCA/PyBQcm9taXNlLnJlc29sdmUoKSkudGhlbihhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBfO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV4dExlbiA9IHBheWxvYWQuaXNzdWVzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXh0TGVuID09PSBjdXJyTGVuKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXNBYm9ydGVkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzQWJvcnRlZCA9IHV0aWwuYWJvcnRlZChwYXlsb2FkLCBjdXJyTGVuKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXh0TGVuID0gcGF5bG9hZC5pc3N1ZXMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICBpZiAobmV4dExlbiA9PT0gY3VyckxlbilcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzQWJvcnRlZClcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzQWJvcnRlZCA9IHV0aWwuYWJvcnRlZChwYXlsb2FkLCBjdXJyTGVuKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYXN5bmNSZXN1bHQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYXN5bmNSZXN1bHQudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXlsb2FkO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHBheWxvYWQ7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGhhbmRsZUNhbmFyeVJlc3VsdCA9IChjYW5hcnksIHBheWxvYWQsIGN0eCkgPT4ge1xuICAgICAgICAgICAgLy8gYWJvcnQgaWYgdGhlIGNhbmFyeSBpcyBhYm9ydGVkXG4gICAgICAgICAgICBpZiAodXRpbC5hYm9ydGVkKGNhbmFyeSkpIHtcbiAgICAgICAgICAgICAgICBjYW5hcnkuYWJvcnRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbmFyeTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHJ1biBjaGVja3MgZmlyc3QsIHRoZW5cbiAgICAgICAgICAgIGNvbnN0IGNoZWNrUmVzdWx0ID0gcnVuQ2hlY2tzKHBheWxvYWQsIGNoZWNrcywgY3R4KTtcbiAgICAgICAgICAgIGlmIChjaGVja1Jlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgICAgICAgICBpZiAoY3R4LmFzeW5jID09PSBmYWxzZSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IGNvcmUuJFpvZEFzeW5jRXJyb3IoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2hlY2tSZXN1bHQudGhlbigoY2hlY2tSZXN1bHQpID0+IGluc3QuX3pvZC5wYXJzZShjaGVja1Jlc3VsdCwgY3R4KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gaW5zdC5fem9kLnBhcnNlKGNoZWNrUmVzdWx0LCBjdHgpO1xuICAgICAgICB9O1xuICAgICAgICBpbnN0Ll96b2QucnVuID0gKHBheWxvYWQsIGN0eCkgPT4ge1xuICAgICAgICAgICAgaWYgKGN0eC5za2lwQ2hlY2tzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGluc3QuX3pvZC5wYXJzZShwYXlsb2FkLCBjdHgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGN0eC5kaXJlY3Rpb24gPT09IFwiYmFja3dhcmRcIikge1xuICAgICAgICAgICAgICAgIC8vIHJ1biBjYW5hcnlcbiAgICAgICAgICAgICAgICAvLyBpbml0aWFsIHBhc3MgKG5vIGNoZWNrcylcbiAgICAgICAgICAgICAgICBjb25zdCBjYW5hcnkgPSBpbnN0Ll96b2QucGFyc2UoeyB2YWx1ZTogcGF5bG9hZC52YWx1ZSwgaXNzdWVzOiBbXSB9LCB7IC4uLmN0eCwgc2tpcENoZWNrczogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICBpZiAoY2FuYXJ5IGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FuYXJ5LnRoZW4oKGNhbmFyeSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZUNhbmFyeVJlc3VsdChjYW5hcnksIHBheWxvYWQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlQ2FuYXJ5UmVzdWx0KGNhbmFyeSwgcGF5bG9hZCwgY3R4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGZvcndhcmRcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGluc3QuX3pvZC5wYXJzZShwYXlsb2FkLCBjdHgpO1xuICAgICAgICAgICAgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgICAgICAgICBpZiAoY3R4LmFzeW5jID09PSBmYWxzZSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IGNvcmUuJFpvZEFzeW5jRXJyb3IoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0LnRoZW4oKHJlc3VsdCkgPT4gcnVuQ2hlY2tzKHJlc3VsdCwgY2hlY2tzLCBjdHgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBydW5DaGVja3MocmVzdWx0LCBjaGVja3MsIGN0eCk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIC8vIExhenkgaW5pdGlhbGl6ZSB+c3RhbmRhcmQgdG8gYXZvaWQgY3JlYXRpbmcgb2JqZWN0cyBmb3IgZXZlcnkgc2NoZW1hXG4gICAgdXRpbC5kZWZpbmVMYXp5KGluc3QsIFwifnN0YW5kYXJkXCIsICgpID0+ICh7XG4gICAgICAgIHZhbGlkYXRlOiAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgciA9IHNhZmVQYXJzZShpbnN0LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHIuc3VjY2VzcyA/IHsgdmFsdWU6IHIuZGF0YSB9IDogeyBpc3N1ZXM6IHIuZXJyb3I/Lmlzc3VlcyB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKF8pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2FmZVBhcnNlQXN5bmMoaW5zdCwgdmFsdWUpLnRoZW4oKHIpID0+IChyLnN1Y2Nlc3MgPyB7IHZhbHVlOiByLmRhdGEgfSA6IHsgaXNzdWVzOiByLmVycm9yPy5pc3N1ZXMgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB2ZW5kb3I6IFwiem9kXCIsXG4gICAgICAgIHZlcnNpb246IDEsXG4gICAgfSkpO1xufSk7XG5leHBvcnQgeyBjbG9uZSB9IGZyb20gXCIuL3V0aWwuanNcIjtcbmV4cG9ydCBjb25zdCAkWm9kU3RyaW5nID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RTdHJpbmdcIiwgKGluc3QsIGRlZikgPT4ge1xuICAgICRab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcbiAgICBpbnN0Ll96b2QucGF0dGVybiA9IFsuLi4oaW5zdD8uX3pvZC5iYWc/LnBhdHRlcm5zID8/IFtdKV0ucG9wKCkgPz8gcmVnZXhlcy5zdHJpbmcoaW5zdC5fem9kLmJhZyk7XG4gICAgaW5zdC5fem9kLnBhcnNlID0gKHBheWxvYWQsIF8pID0+IHtcbiAgICAgICAgaWYgKGRlZi5jb2VyY2UpXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHBheWxvYWQudmFsdWUgPSBTdHJpbmcocGF5bG9hZC52YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoXykgeyB9XG4gICAgICAgIGlmICh0eXBlb2YgcGF5bG9hZC52YWx1ZSA9PT0gXCJzdHJpbmdcIilcbiAgICAgICAgICAgIHJldHVybiBwYXlsb2FkO1xuICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcbiAgICAgICAgICAgIGV4cGVjdGVkOiBcInN0cmluZ1wiLFxuICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX3R5cGVcIixcbiAgICAgICAgICAgIGlucHV0OiBwYXlsb2FkLnZhbHVlLFxuICAgICAgICAgICAgaW5zdCxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBwYXlsb2FkO1xuICAgIH07XG59KTtcbmV4cG9ydCBjb25zdCAkWm9kU3RyaW5nRm9ybWF0ID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RTdHJpbmdGb3JtYXRcIiwgKGluc3QsIGRlZikgPT4ge1xuICAgIC8vIGNoZWNrIGluaXRpYWxpemF0aW9uIG11c3QgY29tZSBmaXJzdFxuICAgIGNoZWNrcy4kWm9kQ2hlY2tTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xuICAgICRab2RTdHJpbmcuaW5pdChpbnN0LCBkZWYpO1xufSk7XG5leHBvcnQgY29uc3QgJFpvZEdVSUQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZEdVSURcIiwgKGluc3QsIGRlZikgPT4ge1xuICAgIGRlZi5wYXR0ZXJuID8/IChkZWYucGF0dGVybiA9IHJlZ2V4ZXMuZ3VpZCk7XG4gICAgJFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XG59KTtcbmV4cG9ydCBjb25zdCAkWm9kVVVJRCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kVVVJRFwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgaWYgKGRlZi52ZXJzaW9uKSB7XG4gICAgICAgIGNvbnN0IHZlcnNpb25NYXAgPSB7XG4gICAgICAgICAgICB2MTogMSxcbiAgICAgICAgICAgIHYyOiAyLFxuICAgICAgICAgICAgdjM6IDMsXG4gICAgICAgICAgICB2NDogNCxcbiAgICAgICAgICAgIHY1OiA1LFxuICAgICAgICAgICAgdjY6IDYsXG4gICAgICAgICAgICB2NzogNyxcbiAgICAgICAgICAgIHY4OiA4LFxuICAgICAgICB9O1xuICAgICAgICBjb25zdCB2ID0gdmVyc2lvbk1hcFtkZWYudmVyc2lvbl07XG4gICAgICAgIGlmICh2ID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgVVVJRCB2ZXJzaW9uOiBcIiR7ZGVmLnZlcnNpb259XCJgKTtcbiAgICAgICAgZGVmLnBhdHRlcm4gPz8gKGRlZi5wYXR0ZXJuID0gcmVnZXhlcy51dWlkKHYpKTtcbiAgICB9XG4gICAgZWxzZVxuICAgICAgICBkZWYucGF0dGVybiA/PyAoZGVmLnBhdHRlcm4gPSByZWdleGVzLnV1aWQoKSk7XG4gICAgJFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XG59KTtcbmV4cG9ydCBjb25zdCAkWm9kRW1haWwgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZEVtYWlsXCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICBkZWYucGF0dGVybiA/PyAoZGVmLnBhdHRlcm4gPSByZWdleGVzLmVtYWlsKTtcbiAgICAkWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcbn0pO1xuZXhwb3J0IGNvbnN0ICRab2RVUkwgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZFVSTFwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgJFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XG4gICAgaW5zdC5fem9kLmNoZWNrID0gKHBheWxvYWQpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFRyaW0gd2hpdGVzcGFjZSBmcm9tIGlucHV0XG4gICAgICAgICAgICBjb25zdCB0cmltbWVkID0gcGF5bG9hZC52YWx1ZS50cmltKCk7XG4gICAgICAgICAgICAvLyBXaGVuIG5vcm1hbGl6ZSBpcyBvZmYsIHJlcXVpcmUgOi8vIGZvciBodHRwL2h0dHBzIFVSTHNcbiAgICAgICAgICAgIC8vIFRoaXMgcHJldmVudHMgc3RyaW5ncyBsaWtlIFwiaHR0cDpleGFtcGxlLmNvbVwiIG9yIFwiaHR0cHM6L3BhdGhcIiBmcm9tIGJlaW5nIHNpbGVudGx5IGFjY2VwdGVkXG4gICAgICAgICAgICBpZiAoIWRlZi5ub3JtYWxpemUgJiYgZGVmLnByb3RvY29sPy5zb3VyY2UgPT09IHJlZ2V4ZXMuaHR0cFByb3RvY29sLnNvdXJjZSkge1xuICAgICAgICAgICAgICAgIGlmICghL15odHRwcz86XFwvXFwvL2kudGVzdCh0cmltbWVkKSkge1xuICAgICAgICAgICAgICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF9mb3JtYXRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1hdDogXCJ1cmxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vdGU6IFwiSW52YWxpZCBVUkwgZm9ybWF0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnB1dDogcGF5bG9hZC52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGluc3QsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTogIWRlZi5hYm9ydCxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICBjb25zdCB1cmwgPSBuZXcgVVJMKHRyaW1tZWQpO1xuICAgICAgICAgICAgaWYgKGRlZi5ob3N0bmFtZSkge1xuICAgICAgICAgICAgICAgIGRlZi5ob3N0bmFtZS5sYXN0SW5kZXggPSAwO1xuICAgICAgICAgICAgICAgIGlmICghZGVmLmhvc3RuYW1lLnRlc3QodXJsLmhvc3RuYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF9mb3JtYXRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1hdDogXCJ1cmxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vdGU6IFwiSW52YWxpZCBob3N0bmFtZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0dGVybjogZGVmLmhvc3RuYW1lLnNvdXJjZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0OiBwYXlsb2FkLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5zdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlOiAhZGVmLmFib3J0LFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZGVmLnByb3RvY29sKSB7XG4gICAgICAgICAgICAgICAgZGVmLnByb3RvY29sLmxhc3RJbmRleCA9IDA7XG4gICAgICAgICAgICAgICAgaWYgKCFkZWYucHJvdG9jb2wudGVzdCh1cmwucHJvdG9jb2wuZW5kc1dpdGgoXCI6XCIpID8gdXJsLnByb3RvY29sLnNsaWNlKDAsIC0xKSA6IHVybC5wcm90b2NvbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBcImludmFsaWRfZm9ybWF0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JtYXQ6IFwidXJsXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBub3RlOiBcIkludmFsaWQgcHJvdG9jb2xcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdHRlcm46IGRlZi5wcm90b2NvbC5zb3VyY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnB1dDogcGF5bG9hZC52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGluc3QsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTogIWRlZi5hYm9ydCxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gU2V0IHRoZSBvdXRwdXQgdmFsdWUgYmFzZWQgb24gbm9ybWFsaXplIGZsYWdcbiAgICAgICAgICAgIGlmIChkZWYubm9ybWFsaXplKSB7XG4gICAgICAgICAgICAgICAgLy8gVXNlIG5vcm1hbGl6ZWQgVVJMXG4gICAgICAgICAgICAgICAgcGF5bG9hZC52YWx1ZSA9IHVybC5ocmVmO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gUHJlc2VydmUgdGhlIG9yaWdpbmFsIGlucHV0ICh0cmltbWVkKVxuICAgICAgICAgICAgICAgIHBheWxvYWQudmFsdWUgPSB0cmltbWVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChfKSB7XG4gICAgICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBjb2RlOiBcImludmFsaWRfZm9ybWF0XCIsXG4gICAgICAgICAgICAgICAgZm9ybWF0OiBcInVybFwiLFxuICAgICAgICAgICAgICAgIGlucHV0OiBwYXlsb2FkLnZhbHVlLFxuICAgICAgICAgICAgICAgIGluc3QsXG4gICAgICAgICAgICAgICAgY29udGludWU6ICFkZWYuYWJvcnQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG59KTtcbmV4cG9ydCBjb25zdCAkWm9kRW1vamkgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZEVtb2ppXCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICBkZWYucGF0dGVybiA/PyAoZGVmLnBhdHRlcm4gPSByZWdleGVzLmVtb2ppKCkpO1xuICAgICRab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xufSk7XG5leHBvcnQgY29uc3QgJFpvZE5hbm9JRCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kTmFub0lEXCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICBkZWYucGF0dGVybiA/PyAoZGVmLnBhdHRlcm4gPSByZWdleGVzLm5hbm9pZCk7XG4gICAgJFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XG59KTtcbi8qKlxuICogQGRlcHJlY2F0ZWQgQ1VJRCB2MSBpcyBkZXByZWNhdGVkIGJ5IGl0cyBhdXRob3JzIGR1ZSB0byBpbmZvcm1hdGlvbiBsZWFrYWdlXG4gKiAodGltZXN0YW1wcyBlbWJlZGRlZCBpbiB0aGUgaWQpLiBVc2Uge0BsaW5rICRab2RDVUlEMn0gaW5zdGVhZC5cbiAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGFyYWxsZWxkcml2ZS9jdWlkLlxuICovXG5leHBvcnQgY29uc3QgJFpvZENVSUQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZENVSURcIiwgKGluc3QsIGRlZikgPT4ge1xuICAgIGRlZi5wYXR0ZXJuID8/IChkZWYucGF0dGVybiA9IHJlZ2V4ZXMuY3VpZCk7XG4gICAgJFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XG59KTtcbmV4cG9ydCBjb25zdCAkWm9kQ1VJRDIgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZENVSUQyXCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICBkZWYucGF0dGVybiA/PyAoZGVmLnBhdHRlcm4gPSByZWdleGVzLmN1aWQyKTtcbiAgICAkWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcbn0pO1xuZXhwb3J0IGNvbnN0ICRab2RVTElEID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RVTElEXCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICBkZWYucGF0dGVybiA/PyAoZGVmLnBhdHRlcm4gPSByZWdleGVzLnVsaWQpO1xuICAgICRab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xufSk7XG5leHBvcnQgY29uc3QgJFpvZFhJRCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kWElEXCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICBkZWYucGF0dGVybiA/PyAoZGVmLnBhdHRlcm4gPSByZWdleGVzLnhpZCk7XG4gICAgJFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XG59KTtcbmV4cG9ydCBjb25zdCAkWm9kS1NVSUQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZEtTVUlEXCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICBkZWYucGF0dGVybiA/PyAoZGVmLnBhdHRlcm4gPSByZWdleGVzLmtzdWlkKTtcbiAgICAkWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcbn0pO1xuZXhwb3J0IGNvbnN0ICRab2RJU09EYXRlVGltZSA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kSVNPRGF0ZVRpbWVcIiwgKGluc3QsIGRlZikgPT4ge1xuICAgIGRlZi5wYXR0ZXJuID8/IChkZWYucGF0dGVybiA9IHJlZ2V4ZXMuZGF0ZXRpbWUoZGVmKSk7XG4gICAgJFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XG59KTtcbmV4cG9ydCBjb25zdCAkWm9kSVNPRGF0ZSA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kSVNPRGF0ZVwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgZGVmLnBhdHRlcm4gPz8gKGRlZi5wYXR0ZXJuID0gcmVnZXhlcy5kYXRlKTtcbiAgICAkWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcbn0pO1xuZXhwb3J0IGNvbnN0ICRab2RJU09UaW1lID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RJU09UaW1lXCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICBkZWYucGF0dGVybiA/PyAoZGVmLnBhdHRlcm4gPSByZWdleGVzLnRpbWUoZGVmKSk7XG4gICAgJFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XG59KTtcbmV4cG9ydCBjb25zdCAkWm9kSVNPRHVyYXRpb24gPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZElTT0R1cmF0aW9uXCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICBkZWYucGF0dGVybiA/PyAoZGVmLnBhdHRlcm4gPSByZWdleGVzLmR1cmF0aW9uKTtcbiAgICAkWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcbn0pO1xuZXhwb3J0IGNvbnN0ICRab2RJUHY0ID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RJUHY0XCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICBkZWYucGF0dGVybiA/PyAoZGVmLnBhdHRlcm4gPSByZWdleGVzLmlwdjQpO1xuICAgICRab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xuICAgIGluc3QuX3pvZC5iYWcuZm9ybWF0ID0gYGlwdjRgO1xufSk7XG5leHBvcnQgY29uc3QgJFpvZElQdjYgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZElQdjZcIiwgKGluc3QsIGRlZikgPT4ge1xuICAgIGRlZi5wYXR0ZXJuID8/IChkZWYucGF0dGVybiA9IHJlZ2V4ZXMuaXB2Nik7XG4gICAgJFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XG4gICAgaW5zdC5fem9kLmJhZy5mb3JtYXQgPSBgaXB2NmA7XG4gICAgaW5zdC5fem9kLmNoZWNrID0gKHBheWxvYWQpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIG5ldyBVUkwoYGh0dHA6Ly9bJHtwYXlsb2FkLnZhbHVlfV1gKTtcbiAgICAgICAgICAgIC8vIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCB7XG4gICAgICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBjb2RlOiBcImludmFsaWRfZm9ybWF0XCIsXG4gICAgICAgICAgICAgICAgZm9ybWF0OiBcImlwdjZcIixcbiAgICAgICAgICAgICAgICBpbnB1dDogcGF5bG9hZC52YWx1ZSxcbiAgICAgICAgICAgICAgICBpbnN0LFxuICAgICAgICAgICAgICAgIGNvbnRpbnVlOiAhZGVmLmFib3J0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xufSk7XG5leHBvcnQgY29uc3QgJFpvZE1BQyA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kTUFDXCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICBkZWYucGF0dGVybiA/PyAoZGVmLnBhdHRlcm4gPSByZWdleGVzLm1hYyhkZWYuZGVsaW1pdGVyKSk7XG4gICAgJFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XG4gICAgaW5zdC5fem9kLmJhZy5mb3JtYXQgPSBgbWFjYDtcbn0pO1xuZXhwb3J0IGNvbnN0ICRab2RDSURSdjQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZENJRFJ2NFwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgZGVmLnBhdHRlcm4gPz8gKGRlZi5wYXR0ZXJuID0gcmVnZXhlcy5jaWRydjQpO1xuICAgICRab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xufSk7XG5leHBvcnQgY29uc3QgJFpvZENJRFJ2NiA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kQ0lEUnY2XCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICBkZWYucGF0dGVybiA/PyAoZGVmLnBhdHRlcm4gPSByZWdleGVzLmNpZHJ2Nik7IC8vIG5vdCB1c2VkIGZvciB2YWxpZGF0aW9uXG4gICAgJFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XG4gICAgaW5zdC5fem9kLmNoZWNrID0gKHBheWxvYWQpID0+IHtcbiAgICAgICAgY29uc3QgcGFydHMgPSBwYXlsb2FkLnZhbHVlLnNwbGl0KFwiL1wiKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChwYXJ0cy5sZW5ndGggIT09IDIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICAgICAgICBjb25zdCBbYWRkcmVzcywgcHJlZml4XSA9IHBhcnRzO1xuICAgICAgICAgICAgaWYgKCFwcmVmaXgpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICAgICAgICBjb25zdCBwcmVmaXhOdW0gPSBOdW1iZXIocHJlZml4KTtcbiAgICAgICAgICAgIGlmIChgJHtwcmVmaXhOdW19YCAhPT0gcHJlZml4KVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgICAgICAgaWYgKHByZWZpeE51bSA8IDAgfHwgcHJlZml4TnVtID4gMTI4KVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgbmV3IFVSTChgaHR0cDovL1ske2FkZHJlc3N9XWApO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIHtcbiAgICAgICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xuICAgICAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF9mb3JtYXRcIixcbiAgICAgICAgICAgICAgICBmb3JtYXQ6IFwiY2lkcnY2XCIsXG4gICAgICAgICAgICAgICAgaW5wdXQ6IHBheWxvYWQudmFsdWUsXG4gICAgICAgICAgICAgICAgaW5zdCxcbiAgICAgICAgICAgICAgICBjb250aW51ZTogIWRlZi5hYm9ydCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcbn0pO1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vICAgWm9kQmFzZTY0ICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5leHBvcnQgZnVuY3Rpb24gaXNWYWxpZEJhc2U2NChkYXRhKSB7XG4gICAgaWYgKGRhdGEgPT09IFwiXCIpXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIC8vIGF0b2IgaWdub3JlcyB3aGl0ZXNwYWNlLCBzbyByZWplY3QgaXQgdXAgZnJvbnQuXG4gICAgaWYgKC9cXHMvLnRlc3QoZGF0YSkpXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICBpZiAoZGF0YS5sZW5ndGggJSA0ICE9PSAwKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICBhdG9iKGRhdGEpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgY2F0Y2gge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuZXhwb3J0IGNvbnN0ICRab2RCYXNlNjQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZEJhc2U2NFwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgZGVmLnBhdHRlcm4gPz8gKGRlZi5wYXR0ZXJuID0gcmVnZXhlcy5iYXNlNjQpO1xuICAgICRab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xuICAgIGluc3QuX3pvZC5iYWcuY29udGVudEVuY29kaW5nID0gXCJiYXNlNjRcIjtcbiAgICBpbnN0Ll96b2QuY2hlY2sgPSAocGF5bG9hZCkgPT4ge1xuICAgICAgICBpZiAoaXNWYWxpZEJhc2U2NChwYXlsb2FkLnZhbHVlKSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XG4gICAgICAgICAgICBjb2RlOiBcImludmFsaWRfZm9ybWF0XCIsXG4gICAgICAgICAgICBmb3JtYXQ6IFwiYmFzZTY0XCIsXG4gICAgICAgICAgICBpbnB1dDogcGF5bG9hZC52YWx1ZSxcbiAgICAgICAgICAgIGluc3QsXG4gICAgICAgICAgICBjb250aW51ZTogIWRlZi5hYm9ydCxcbiAgICAgICAgfSk7XG4gICAgfTtcbn0pO1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vICAgWm9kQmFzZTY0ICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5leHBvcnQgZnVuY3Rpb24gaXNWYWxpZEJhc2U2NFVSTChkYXRhKSB7XG4gICAgaWYgKCFyZWdleGVzLmJhc2U2NHVybC50ZXN0KGRhdGEpKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgY29uc3QgYmFzZTY0ID0gZGF0YS5yZXBsYWNlKC9bLV9dL2csIChjKSA9PiAoYyA9PT0gXCItXCIgPyBcIitcIiA6IFwiL1wiKSk7XG4gICAgY29uc3QgcGFkZGVkID0gYmFzZTY0LnBhZEVuZChNYXRoLmNlaWwoYmFzZTY0Lmxlbmd0aCAvIDQpICogNCwgXCI9XCIpO1xuICAgIHJldHVybiBpc1ZhbGlkQmFzZTY0KHBhZGRlZCk7XG59XG5leHBvcnQgY29uc3QgJFpvZEJhc2U2NFVSTCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kQmFzZTY0VVJMXCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICBkZWYucGF0dGVybiA/PyAoZGVmLnBhdHRlcm4gPSByZWdleGVzLmJhc2U2NHVybCk7XG4gICAgJFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XG4gICAgaW5zdC5fem9kLmJhZy5jb250ZW50RW5jb2RpbmcgPSBcImJhc2U2NHVybFwiO1xuICAgIGluc3QuX3pvZC5jaGVjayA9IChwYXlsb2FkKSA9PiB7XG4gICAgICAgIGlmIChpc1ZhbGlkQmFzZTY0VVJMKHBheWxvYWQudmFsdWUpKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcbiAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF9mb3JtYXRcIixcbiAgICAgICAgICAgIGZvcm1hdDogXCJiYXNlNjR1cmxcIixcbiAgICAgICAgICAgIGlucHV0OiBwYXlsb2FkLnZhbHVlLFxuICAgICAgICAgICAgaW5zdCxcbiAgICAgICAgICAgIGNvbnRpbnVlOiAhZGVmLmFib3J0LFxuICAgICAgICB9KTtcbiAgICB9O1xufSk7XG5leHBvcnQgY29uc3QgJFpvZEUxNjQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZEUxNjRcIiwgKGluc3QsIGRlZikgPT4ge1xuICAgIGRlZi5wYXR0ZXJuID8/IChkZWYucGF0dGVybiA9IHJlZ2V4ZXMuZTE2NCk7XG4gICAgJFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XG59KTtcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLyAgIFpvZEpXVCAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuZXhwb3J0IGZ1bmN0aW9uIGlzVmFsaWRKV1QodG9rZW4sIGFsZ29yaXRobSA9IG51bGwpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCB0b2tlbnNQYXJ0cyA9IHRva2VuLnNwbGl0KFwiLlwiKTtcbiAgICAgICAgaWYgKHRva2Vuc1BhcnRzLmxlbmd0aCAhPT0gMylcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgY29uc3QgW2hlYWRlcl0gPSB0b2tlbnNQYXJ0cztcbiAgICAgICAgaWYgKCFoZWFkZXIpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgY29uc3QgcGFyc2VkSGVhZGVyID0gSlNPTi5wYXJzZShhdG9iKGhlYWRlcikpO1xuICAgICAgICBpZiAoXCJ0eXBcIiBpbiBwYXJzZWRIZWFkZXIgJiYgcGFyc2VkSGVhZGVyPy50eXAgIT09IFwiSldUXCIpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmICghcGFyc2VkSGVhZGVyLmFsZylcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYgKGFsZ29yaXRobSAmJiAoIShcImFsZ1wiIGluIHBhcnNlZEhlYWRlcikgfHwgcGFyc2VkSGVhZGVyLmFsZyAhPT0gYWxnb3JpdGhtKSlcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cbmV4cG9ydCBjb25zdCAkWm9kSldUID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RKV1RcIiwgKGluc3QsIGRlZikgPT4ge1xuICAgICRab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xuICAgIGluc3QuX3pvZC5jaGVjayA9IChwYXlsb2FkKSA9PiB7XG4gICAgICAgIGlmIChpc1ZhbGlkSldUKHBheWxvYWQudmFsdWUsIGRlZi5hbGcpKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcbiAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF9mb3JtYXRcIixcbiAgICAgICAgICAgIGZvcm1hdDogXCJqd3RcIixcbiAgICAgICAgICAgIGlucHV0OiBwYXlsb2FkLnZhbHVlLFxuICAgICAgICAgICAgaW5zdCxcbiAgICAgICAgICAgIGNvbnRpbnVlOiAhZGVmLmFib3J0LFxuICAgICAgICB9KTtcbiAgICB9O1xufSk7XG5leHBvcnQgY29uc3QgJFpvZEN1c3RvbVN0cmluZ0Zvcm1hdCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kQ3VzdG9tU3RyaW5nRm9ybWF0XCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICAkWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcbiAgICBpbnN0Ll96b2QuY2hlY2sgPSAocGF5bG9hZCkgPT4ge1xuICAgICAgICBpZiAoZGVmLmZuKHBheWxvYWQudmFsdWUpKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcbiAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF9mb3JtYXRcIixcbiAgICAgICAgICAgIGZvcm1hdDogZGVmLmZvcm1hdCxcbiAgICAgICAgICAgIGlucHV0OiBwYXlsb2FkLnZhbHVlLFxuICAgICAgICAgICAgaW5zdCxcbiAgICAgICAgICAgIGNvbnRpbnVlOiAhZGVmLmFib3J0LFxuICAgICAgICB9KTtcbiAgICB9O1xufSk7XG5leHBvcnQgY29uc3QgJFpvZE51bWJlciA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kTnVtYmVyXCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICAkWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XG4gICAgaW5zdC5fem9kLnBhdHRlcm4gPSBpbnN0Ll96b2QuYmFnLnBhdHRlcm4gPz8gcmVnZXhlcy5udW1iZXI7XG4gICAgaW5zdC5fem9kLnBhcnNlID0gKHBheWxvYWQsIF9jdHgpID0+IHtcbiAgICAgICAgaWYgKGRlZi5jb2VyY2UpXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHBheWxvYWQudmFsdWUgPSBOdW1iZXIocGF5bG9hZC52YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoXykgeyB9XG4gICAgICAgIGNvbnN0IGlucHV0ID0gcGF5bG9hZC52YWx1ZTtcbiAgICAgICAgaWYgKHR5cGVvZiBpbnB1dCA9PT0gXCJudW1iZXJcIiAmJiAhTnVtYmVyLmlzTmFOKGlucHV0KSAmJiBOdW1iZXIuaXNGaW5pdGUoaW5wdXQpKSB7XG4gICAgICAgICAgICByZXR1cm4gcGF5bG9hZDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZWNlaXZlZCA9IHR5cGVvZiBpbnB1dCA9PT0gXCJudW1iZXJcIlxuICAgICAgICAgICAgPyBOdW1iZXIuaXNOYU4oaW5wdXQpXG4gICAgICAgICAgICAgICAgPyBcIk5hTlwiXG4gICAgICAgICAgICAgICAgOiAhTnVtYmVyLmlzRmluaXRlKGlucHV0KVxuICAgICAgICAgICAgICAgICAgICA/IFwiSW5maW5pdHlcIlxuICAgICAgICAgICAgICAgICAgICA6IHVuZGVmaW5lZFxuICAgICAgICAgICAgOiB1bmRlZmluZWQ7XG4gICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xuICAgICAgICAgICAgZXhwZWN0ZWQ6IFwibnVtYmVyXCIsXG4gICAgICAgICAgICBjb2RlOiBcImludmFsaWRfdHlwZVwiLFxuICAgICAgICAgICAgaW5wdXQsXG4gICAgICAgICAgICBpbnN0LFxuICAgICAgICAgICAgLi4uKHJlY2VpdmVkID8geyByZWNlaXZlZCB9IDoge30pLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHBheWxvYWQ7XG4gICAgfTtcbn0pO1xuZXhwb3J0IGNvbnN0ICRab2ROdW1iZXJGb3JtYXQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZE51bWJlckZvcm1hdFwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgY2hlY2tzLiRab2RDaGVja051bWJlckZvcm1hdC5pbml0KGluc3QsIGRlZik7XG4gICAgJFpvZE51bWJlci5pbml0KGluc3QsIGRlZik7IC8vIG5vIGZvcm1hdCBjaGVja3Ncbn0pO1xuZXhwb3J0IGNvbnN0ICRab2RCb29sZWFuID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RCb29sZWFuXCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICAkWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XG4gICAgaW5zdC5fem9kLnBhdHRlcm4gPSByZWdleGVzLmJvb2xlYW47XG4gICAgaW5zdC5fem9kLnBhcnNlID0gKHBheWxvYWQsIF9jdHgpID0+IHtcbiAgICAgICAgaWYgKGRlZi5jb2VyY2UpXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHBheWxvYWQudmFsdWUgPSBCb29sZWFuKHBheWxvYWQudmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKF8pIHsgfVxuICAgICAgICBjb25zdCBpbnB1dCA9IHBheWxvYWQudmFsdWU7XG4gICAgICAgIGlmICh0eXBlb2YgaW5wdXQgPT09IFwiYm9vbGVhblwiKVxuICAgICAgICAgICAgcmV0dXJuIHBheWxvYWQ7XG4gICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xuICAgICAgICAgICAgZXhwZWN0ZWQ6IFwiYm9vbGVhblwiLFxuICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX3R5cGVcIixcbiAgICAgICAgICAgIGlucHV0LFxuICAgICAgICAgICAgaW5zdCxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBwYXlsb2FkO1xuICAgIH07XG59KTtcbmV4cG9ydCBjb25zdCAkWm9kQmlnSW50ID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RCaWdJbnRcIiwgKGluc3QsIGRlZikgPT4ge1xuICAgICRab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcbiAgICBpbnN0Ll96b2QucGF0dGVybiA9IHJlZ2V4ZXMuYmlnaW50O1xuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBfY3R4KSA9PiB7XG4gICAgICAgIGlmIChkZWYuY29lcmNlKVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBwYXlsb2FkLnZhbHVlID0gQmlnSW50KHBheWxvYWQudmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKF8pIHsgfVxuICAgICAgICBpZiAodHlwZW9mIHBheWxvYWQudmFsdWUgPT09IFwiYmlnaW50XCIpXG4gICAgICAgICAgICByZXR1cm4gcGF5bG9hZDtcbiAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XG4gICAgICAgICAgICBleHBlY3RlZDogXCJiaWdpbnRcIixcbiAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF90eXBlXCIsXG4gICAgICAgICAgICBpbnB1dDogcGF5bG9hZC52YWx1ZSxcbiAgICAgICAgICAgIGluc3QsXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcGF5bG9hZDtcbiAgICB9O1xufSk7XG5leHBvcnQgY29uc3QgJFpvZEJpZ0ludEZvcm1hdCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kQmlnSW50Rm9ybWF0XCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICBjaGVja3MuJFpvZENoZWNrQmlnSW50Rm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcbiAgICAkWm9kQmlnSW50LmluaXQoaW5zdCwgZGVmKTsgLy8gbm8gZm9ybWF0IGNoZWNrc1xufSk7XG5leHBvcnQgY29uc3QgJFpvZFN5bWJvbCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kU3ltYm9sXCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICAkWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XG4gICAgaW5zdC5fem9kLnBhcnNlID0gKHBheWxvYWQsIF9jdHgpID0+IHtcbiAgICAgICAgY29uc3QgaW5wdXQgPSBwYXlsb2FkLnZhbHVlO1xuICAgICAgICBpZiAodHlwZW9mIGlucHV0ID09PSBcInN5bWJvbFwiKVxuICAgICAgICAgICAgcmV0dXJuIHBheWxvYWQ7XG4gICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xuICAgICAgICAgICAgZXhwZWN0ZWQ6IFwic3ltYm9sXCIsXG4gICAgICAgICAgICBjb2RlOiBcImludmFsaWRfdHlwZVwiLFxuICAgICAgICAgICAgaW5wdXQsXG4gICAgICAgICAgICBpbnN0LFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHBheWxvYWQ7XG4gICAgfTtcbn0pO1xuZXhwb3J0IGNvbnN0ICRab2RVbmRlZmluZWQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZFVuZGVmaW5lZFwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgJFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xuICAgIGluc3QuX3pvZC5wYXR0ZXJuID0gcmVnZXhlcy51bmRlZmluZWQ7XG4gICAgaW5zdC5fem9kLnZhbHVlcyA9IG5ldyBTZXQoW3VuZGVmaW5lZF0pO1xuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBfY3R4KSA9PiB7XG4gICAgICAgIGNvbnN0IGlucHV0ID0gcGF5bG9hZC52YWx1ZTtcbiAgICAgICAgaWYgKHR5cGVvZiBpbnB1dCA9PT0gXCJ1bmRlZmluZWRcIilcbiAgICAgICAgICAgIHJldHVybiBwYXlsb2FkO1xuICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcbiAgICAgICAgICAgIGV4cGVjdGVkOiBcInVuZGVmaW5lZFwiLFxuICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX3R5cGVcIixcbiAgICAgICAgICAgIGlucHV0LFxuICAgICAgICAgICAgaW5zdCxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBwYXlsb2FkO1xuICAgIH07XG59KTtcbmV4cG9ydCBjb25zdCAkWm9kTnVsbCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kTnVsbFwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgJFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xuICAgIGluc3QuX3pvZC5wYXR0ZXJuID0gcmVnZXhlcy5udWxsO1xuICAgIGluc3QuX3pvZC52YWx1ZXMgPSBuZXcgU2V0KFtudWxsXSk7XG4gICAgaW5zdC5fem9kLnBhcnNlID0gKHBheWxvYWQsIF9jdHgpID0+IHtcbiAgICAgICAgY29uc3QgaW5wdXQgPSBwYXlsb2FkLnZhbHVlO1xuICAgICAgICBpZiAoaW5wdXQgPT09IG51bGwpXG4gICAgICAgICAgICByZXR1cm4gcGF5bG9hZDtcbiAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XG4gICAgICAgICAgICBleHBlY3RlZDogXCJudWxsXCIsXG4gICAgICAgICAgICBjb2RlOiBcImludmFsaWRfdHlwZVwiLFxuICAgICAgICAgICAgaW5wdXQsXG4gICAgICAgICAgICBpbnN0LFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHBheWxvYWQ7XG4gICAgfTtcbn0pO1xuZXhwb3J0IGNvbnN0ICRab2RBbnkgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZEFueVwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgJFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkKSA9PiBwYXlsb2FkO1xufSk7XG5leHBvcnQgY29uc3QgJFpvZFVua25vd24gPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZFVua25vd25cIiwgKGluc3QsIGRlZikgPT4ge1xuICAgICRab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcbiAgICBpbnN0Ll96b2QucGFyc2UgPSAocGF5bG9hZCkgPT4gcGF5bG9hZDtcbn0pO1xuZXhwb3J0IGNvbnN0ICRab2ROZXZlciA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kTmV2ZXJcIiwgKGluc3QsIGRlZikgPT4ge1xuICAgICRab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcbiAgICBpbnN0Ll96b2QucGFyc2UgPSAocGF5bG9hZCwgX2N0eCkgPT4ge1xuICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcbiAgICAgICAgICAgIGV4cGVjdGVkOiBcIm5ldmVyXCIsXG4gICAgICAgICAgICBjb2RlOiBcImludmFsaWRfdHlwZVwiLFxuICAgICAgICAgICAgaW5wdXQ6IHBheWxvYWQudmFsdWUsXG4gICAgICAgICAgICBpbnN0LFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHBheWxvYWQ7XG4gICAgfTtcbn0pO1xuZXhwb3J0IGNvbnN0ICRab2RWb2lkID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RWb2lkXCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICAkWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XG4gICAgaW5zdC5fem9kLnBhcnNlID0gKHBheWxvYWQsIF9jdHgpID0+IHtcbiAgICAgICAgY29uc3QgaW5wdXQgPSBwYXlsb2FkLnZhbHVlO1xuICAgICAgICBpZiAodHlwZW9mIGlucHV0ID09PSBcInVuZGVmaW5lZFwiKVxuICAgICAgICAgICAgcmV0dXJuIHBheWxvYWQ7XG4gICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xuICAgICAgICAgICAgZXhwZWN0ZWQ6IFwidm9pZFwiLFxuICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX3R5cGVcIixcbiAgICAgICAgICAgIGlucHV0LFxuICAgICAgICAgICAgaW5zdCxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBwYXlsb2FkO1xuICAgIH07XG59KTtcbmV4cG9ydCBjb25zdCAkWm9kRGF0ZSA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kRGF0ZVwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgJFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBfY3R4KSA9PiB7XG4gICAgICAgIGlmIChkZWYuY29lcmNlKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHBheWxvYWQudmFsdWUgPSBuZXcgRGF0ZShwYXlsb2FkLnZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChfZXJyKSB7IH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpbnB1dCA9IHBheWxvYWQudmFsdWU7XG4gICAgICAgIGNvbnN0IGlzRGF0ZSA9IGlucHV0IGluc3RhbmNlb2YgRGF0ZTtcbiAgICAgICAgY29uc3QgaXNWYWxpZERhdGUgPSBpc0RhdGUgJiYgIU51bWJlci5pc05hTihpbnB1dC5nZXRUaW1lKCkpO1xuICAgICAgICBpZiAoaXNWYWxpZERhdGUpXG4gICAgICAgICAgICByZXR1cm4gcGF5bG9hZDtcbiAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XG4gICAgICAgICAgICBleHBlY3RlZDogXCJkYXRlXCIsXG4gICAgICAgICAgICBjb2RlOiBcImludmFsaWRfdHlwZVwiLFxuICAgICAgICAgICAgaW5wdXQsXG4gICAgICAgICAgICAuLi4oaXNEYXRlID8geyByZWNlaXZlZDogXCJJbnZhbGlkIERhdGVcIiB9IDoge30pLFxuICAgICAgICAgICAgaW5zdCxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBwYXlsb2FkO1xuICAgIH07XG59KTtcbmZ1bmN0aW9uIGhhbmRsZUFycmF5UmVzdWx0KHJlc3VsdCwgZmluYWwsIGluZGV4KSB7XG4gICAgaWYgKHJlc3VsdC5pc3N1ZXMubGVuZ3RoKSB7XG4gICAgICAgIGZpbmFsLmlzc3Vlcy5wdXNoKC4uLnV0aWwucHJlZml4SXNzdWVzKGluZGV4LCByZXN1bHQuaXNzdWVzKSk7XG4gICAgfVxuICAgIGZpbmFsLnZhbHVlW2luZGV4XSA9IHJlc3VsdC52YWx1ZTtcbn1cbmV4cG9ydCBjb25zdCAkWm9kQXJyYXkgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZEFycmF5XCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICAkWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XG4gICAgaW5zdC5fem9kLnBhcnNlID0gKHBheWxvYWQsIGN0eCkgPT4ge1xuICAgICAgICBjb25zdCBpbnB1dCA9IHBheWxvYWQudmFsdWU7XG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheShpbnB1dCkpIHtcbiAgICAgICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBcImFycmF5XCIsXG4gICAgICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX3R5cGVcIixcbiAgICAgICAgICAgICAgICBpbnB1dCxcbiAgICAgICAgICAgICAgICBpbnN0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gcGF5bG9hZDtcbiAgICAgICAgfVxuICAgICAgICBwYXlsb2FkLnZhbHVlID0gQXJyYXkoaW5wdXQubGVuZ3RoKTtcbiAgICAgICAgY29uc3QgcHJvbXMgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgaXRlbSA9IGlucHV0W2ldO1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gZGVmLmVsZW1lbnQuX3pvZC5ydW4oe1xuICAgICAgICAgICAgICAgIHZhbHVlOiBpdGVtLFxuICAgICAgICAgICAgICAgIGlzc3VlczogW10sXG4gICAgICAgICAgICB9LCBjdHgpO1xuICAgICAgICAgICAgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgICAgICAgICBwcm9tcy5wdXNoKHJlc3VsdC50aGVuKChyZXN1bHQpID0+IGhhbmRsZUFycmF5UmVzdWx0KHJlc3VsdCwgcGF5bG9hZCwgaSkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGhhbmRsZUFycmF5UmVzdWx0KHJlc3VsdCwgcGF5bG9hZCwgaSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHByb21zLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHByb21zKS50aGVuKCgpID0+IHBheWxvYWQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwYXlsb2FkOyAvL2hhbmRsZUFycmF5UmVzdWx0c0FzeW5jKHBhcnNlUmVzdWx0cywgZmluYWwpO1xuICAgIH07XG59KTtcbmZ1bmN0aW9uIGhhbmRsZVByb3BlcnR5UmVzdWx0KHJlc3VsdCwgZmluYWwsIGtleSwgaW5wdXQsIGlzT3B0aW9uYWxJbiwgaXNPcHRpb25hbE91dCkge1xuICAgIGNvbnN0IGlzUHJlc2VudCA9IGtleSBpbiBpbnB1dDtcbiAgICBpZiAocmVzdWx0Lmlzc3Vlcy5sZW5ndGgpIHtcbiAgICAgICAgLy8gRm9yIG9wdGlvbmFsLWluL291dCBzY2hlbWFzLCBpZ25vcmUgZXJyb3JzIG9uIGFic2VudCBrZXlzLlxuICAgICAgICBpZiAoaXNPcHRpb25hbEluICYmIGlzT3B0aW9uYWxPdXQgJiYgIWlzUHJlc2VudCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGZpbmFsLmlzc3Vlcy5wdXNoKC4uLnV0aWwucHJlZml4SXNzdWVzKGtleSwgcmVzdWx0Lmlzc3VlcykpO1xuICAgIH1cbiAgICBpZiAoIWlzUHJlc2VudCAmJiAhaXNPcHRpb25hbEluKSB7XG4gICAgICAgIGlmICghcmVzdWx0Lmlzc3Vlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGZpbmFsLmlzc3Vlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBjb2RlOiBcImludmFsaWRfdHlwZVwiLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBcIm5vbm9wdGlvbmFsXCIsXG4gICAgICAgICAgICAgICAgaW5wdXQ6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICBwYXRoOiBba2V5XSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHJlc3VsdC52YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlmIChpc1ByZXNlbnQpIHtcbiAgICAgICAgICAgIGZpbmFsLnZhbHVlW2tleV0gPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGZpbmFsLnZhbHVlW2tleV0gPSByZXN1bHQudmFsdWU7XG4gICAgfVxufVxuZnVuY3Rpb24gbm9ybWFsaXplRGVmKGRlZikge1xuICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyhkZWYuc2hhcGUpO1xuICAgIGZvciAoY29uc3QgayBvZiBrZXlzKSB7XG4gICAgICAgIGlmICghZGVmLnNoYXBlPy5ba10/Ll96b2Q/LnRyYWl0cz8uaGFzKFwiJFpvZFR5cGVcIikpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBlbGVtZW50IGF0IGtleSBcIiR7a31cIjogZXhwZWN0ZWQgYSBab2Qgc2NoZW1hYCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3Qgb2tleXMgPSB1dGlsLm9wdGlvbmFsS2V5cyhkZWYuc2hhcGUpO1xuICAgIHJldHVybiB7XG4gICAgICAgIC4uLmRlZixcbiAgICAgICAga2V5cyxcbiAgICAgICAga2V5U2V0OiBuZXcgU2V0KGtleXMpLFxuICAgICAgICBudW1LZXlzOiBrZXlzLmxlbmd0aCxcbiAgICAgICAgb3B0aW9uYWxLZXlzOiBuZXcgU2V0KG9rZXlzKSxcbiAgICB9O1xufVxuZnVuY3Rpb24gaGFuZGxlQ2F0Y2hhbGwocHJvbXMsIGlucHV0LCBwYXlsb2FkLCBjdHgsIGRlZiwgaW5zdCkge1xuICAgIGNvbnN0IHVucmVjb2duaXplZCA9IFtdO1xuICAgIGNvbnN0IGtleVNldCA9IGRlZi5rZXlTZXQ7XG4gICAgY29uc3QgX2NhdGNoYWxsID0gZGVmLmNhdGNoYWxsLl96b2Q7XG4gICAgY29uc3QgdCA9IF9jYXRjaGFsbC5kZWYudHlwZTtcbiAgICBjb25zdCBpc09wdGlvbmFsSW4gPSBfY2F0Y2hhbGwub3B0aW4gPT09IFwib3B0aW9uYWxcIjtcbiAgICBjb25zdCBpc09wdGlvbmFsT3V0ID0gX2NhdGNoYWxsLm9wdG91dCA9PT0gXCJvcHRpb25hbFwiO1xuICAgIGZvciAoY29uc3Qga2V5IGluIGlucHV0KSB7XG4gICAgICAgIC8vIHNraXAgX19wcm90b19fIHNvIGl0IGNhbid0IHJlcGxhY2UgdGhlIHJlc3VsdCBwcm90b3R5cGUgdmlhIHRoZVxuICAgICAgICAvLyBhc3NpZ25tZW50IHNldHRlciBvbiB0aGUgcGxhaW4ge30gd2UgYnVpbGQgaW50b1xuICAgICAgICBpZiAoa2V5ID09PSBcIl9fcHJvdG9fX1wiKVxuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIGlmIChrZXlTZXQuaGFzKGtleSkpXG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgaWYgKHQgPT09IFwibmV2ZXJcIikge1xuICAgICAgICAgICAgdW5yZWNvZ25pemVkLnB1c2goa2V5KTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHIgPSBfY2F0Y2hhbGwucnVuKHsgdmFsdWU6IGlucHV0W2tleV0sIGlzc3VlczogW10gfSwgY3R4KTtcbiAgICAgICAgaWYgKHIgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgICAgICBwcm9tcy5wdXNoKHIudGhlbigocikgPT4gaGFuZGxlUHJvcGVydHlSZXN1bHQociwgcGF5bG9hZCwga2V5LCBpbnB1dCwgaXNPcHRpb25hbEluLCBpc09wdGlvbmFsT3V0KSkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaGFuZGxlUHJvcGVydHlSZXN1bHQociwgcGF5bG9hZCwga2V5LCBpbnB1dCwgaXNPcHRpb25hbEluLCBpc09wdGlvbmFsT3V0KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAodW5yZWNvZ25pemVkLmxlbmd0aCkge1xuICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcbiAgICAgICAgICAgIGNvZGU6IFwidW5yZWNvZ25pemVkX2tleXNcIixcbiAgICAgICAgICAgIGtleXM6IHVucmVjb2duaXplZCxcbiAgICAgICAgICAgIGlucHV0LFxuICAgICAgICAgICAgaW5zdCxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGlmICghcHJvbXMubGVuZ3RoKVxuICAgICAgICByZXR1cm4gcGF5bG9hZDtcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbXMpLnRoZW4oKCkgPT4ge1xuICAgICAgICByZXR1cm4gcGF5bG9hZDtcbiAgICB9KTtcbn1cbmV4cG9ydCBjb25zdCAkWm9kT2JqZWN0ID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RPYmplY3RcIiwgKGluc3QsIGRlZikgPT4ge1xuICAgIC8vIHJlcXVpcmVzIGNhc3QgYmVjYXVzZSB0ZWNobmljYWxseSAkWm9kT2JqZWN0IGRvZXNuJ3QgZXh0ZW5kXG4gICAgJFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xuICAgIC8vIGNvbnN0IHNoID0gZGVmLnNoYXBlO1xuICAgIGNvbnN0IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGRlZiwgXCJzaGFwZVwiKTtcbiAgICBpZiAoIWRlc2M/LmdldCkge1xuICAgICAgICBjb25zdCBzaCA9IGRlZi5zaGFwZTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGRlZiwgXCJzaGFwZVwiLCB7XG4gICAgICAgICAgICBnZXQ6ICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdTaCA9IHsgLi4uc2ggfTtcbiAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZGVmLCBcInNoYXBlXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IG5ld1NoLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXdTaDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBjb25zdCBfbm9ybWFsaXplZCA9IHV0aWwuY2FjaGVkKCgpID0+IG5vcm1hbGl6ZURlZihkZWYpKTtcbiAgICB1dGlsLmRlZmluZUxhenkoaW5zdC5fem9kLCBcInByb3BWYWx1ZXNcIiwgKCkgPT4ge1xuICAgICAgICBjb25zdCBzaGFwZSA9IGRlZi5zaGFwZTtcbiAgICAgICAgY29uc3QgcHJvcFZhbHVlcyA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBzaGFwZSkge1xuICAgICAgICAgICAgY29uc3QgZmllbGQgPSBzaGFwZVtrZXldLl96b2Q7XG4gICAgICAgICAgICBpZiAoZmllbGQudmFsdWVzKSB7XG4gICAgICAgICAgICAgICAgcHJvcFZhbHVlc1trZXldID8/IChwcm9wVmFsdWVzW2tleV0gPSBuZXcgU2V0KCkpO1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdiBvZiBmaWVsZC52YWx1ZXMpXG4gICAgICAgICAgICAgICAgICAgIHByb3BWYWx1ZXNba2V5XS5hZGQodik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb3BWYWx1ZXM7XG4gICAgfSk7XG4gICAgY29uc3QgaXNPYmplY3QgPSB1dGlsLmlzT2JqZWN0O1xuICAgIGNvbnN0IGNhdGNoYWxsID0gZGVmLmNhdGNoYWxsO1xuICAgIGxldCB2YWx1ZTtcbiAgICBpbnN0Ll96b2QucGFyc2UgPSAocGF5bG9hZCwgY3R4KSA9PiB7XG4gICAgICAgIHZhbHVlID8/ICh2YWx1ZSA9IF9ub3JtYWxpemVkLnZhbHVlKTtcbiAgICAgICAgY29uc3QgaW5wdXQgPSBwYXlsb2FkLnZhbHVlO1xuICAgICAgICBpZiAoIWlzT2JqZWN0KGlucHV0KSkge1xuICAgICAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFwib2JqZWN0XCIsXG4gICAgICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX3R5cGVcIixcbiAgICAgICAgICAgICAgICBpbnB1dCxcbiAgICAgICAgICAgICAgICBpbnN0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gcGF5bG9hZDtcbiAgICAgICAgfVxuICAgICAgICBwYXlsb2FkLnZhbHVlID0ge307XG4gICAgICAgIGNvbnN0IHByb21zID0gW107XG4gICAgICAgIGNvbnN0IHNoYXBlID0gdmFsdWUuc2hhcGU7XG4gICAgICAgIGZvciAoY29uc3Qga2V5IG9mIHZhbHVlLmtleXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGVsID0gc2hhcGVba2V5XTtcbiAgICAgICAgICAgIGNvbnN0IGlzT3B0aW9uYWxJbiA9IGVsLl96b2Qub3B0aW4gPT09IFwib3B0aW9uYWxcIjtcbiAgICAgICAgICAgIGNvbnN0IGlzT3B0aW9uYWxPdXQgPSBlbC5fem9kLm9wdG91dCA9PT0gXCJvcHRpb25hbFwiO1xuICAgICAgICAgICAgY29uc3QgciA9IGVsLl96b2QucnVuKHsgdmFsdWU6IGlucHV0W2tleV0sIGlzc3VlczogW10gfSwgY3R4KTtcbiAgICAgICAgICAgIGlmIChyIGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgICAgICAgICAgIHByb21zLnB1c2goci50aGVuKChyKSA9PiBoYW5kbGVQcm9wZXJ0eVJlc3VsdChyLCBwYXlsb2FkLCBrZXksIGlucHV0LCBpc09wdGlvbmFsSW4sIGlzT3B0aW9uYWxPdXQpKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBoYW5kbGVQcm9wZXJ0eVJlc3VsdChyLCBwYXlsb2FkLCBrZXksIGlucHV0LCBpc09wdGlvbmFsSW4sIGlzT3B0aW9uYWxPdXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghY2F0Y2hhbGwpIHtcbiAgICAgICAgICAgIHJldHVybiBwcm9tcy5sZW5ndGggPyBQcm9taXNlLmFsbChwcm9tcykudGhlbigoKSA9PiBwYXlsb2FkKSA6IHBheWxvYWQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGhhbmRsZUNhdGNoYWxsKHByb21zLCBpbnB1dCwgcGF5bG9hZCwgY3R4LCBfbm9ybWFsaXplZC52YWx1ZSwgaW5zdCk7XG4gICAgfTtcbn0pO1xuZXhwb3J0IGNvbnN0ICRab2RPYmplY3RKSVQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZE9iamVjdEpJVFwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgLy8gcmVxdWlyZXMgY2FzdCBiZWNhdXNlIHRlY2huaWNhbGx5ICRab2RPYmplY3QgZG9lc24ndCBleHRlbmRcbiAgICAkWm9kT2JqZWN0LmluaXQoaW5zdCwgZGVmKTtcbiAgICBjb25zdCBzdXBlclBhcnNlID0gaW5zdC5fem9kLnBhcnNlO1xuICAgIGNvbnN0IF9ub3JtYWxpemVkID0gdXRpbC5jYWNoZWQoKCkgPT4gbm9ybWFsaXplRGVmKGRlZikpO1xuICAgIGNvbnN0IGdlbmVyYXRlRmFzdHBhc3MgPSAoc2hhcGUpID0+IHtcbiAgICAgICAgY29uc3QgZG9jID0gbmV3IERvYyhbXCJzaGFwZVwiLCBcInBheWxvYWRcIiwgXCJjdHhcIl0pO1xuICAgICAgICBjb25zdCBub3JtYWxpemVkID0gX25vcm1hbGl6ZWQudmFsdWU7XG4gICAgICAgIGNvbnN0IHBhcnNlU3RyID0gKGtleSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgayA9IHV0aWwuZXNjKGtleSk7XG4gICAgICAgICAgICByZXR1cm4gYHNoYXBlWyR7a31dLl96b2QucnVuKHsgdmFsdWU6IGlucHV0WyR7a31dLCBpc3N1ZXM6IFtdIH0sIGN0eClgO1xuICAgICAgICB9O1xuICAgICAgICBkb2Mud3JpdGUoYGNvbnN0IGlucHV0ID0gcGF5bG9hZC52YWx1ZTtgKTtcbiAgICAgICAgY29uc3QgaWRzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgICAgbGV0IGNvdW50ZXIgPSAwO1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBub3JtYWxpemVkLmtleXMpIHtcbiAgICAgICAgICAgIGlkc1trZXldID0gYGtleV8ke2NvdW50ZXIrK31gO1xuICAgICAgICB9XG4gICAgICAgIC8vIEE6IHByZXNlcnZlIGtleSBvcmRlciB7XG4gICAgICAgIGRvYy53cml0ZShgY29uc3QgbmV3UmVzdWx0ID0ge307YCk7XG4gICAgICAgIGZvciAoY29uc3Qga2V5IG9mIG5vcm1hbGl6ZWQua2V5cykge1xuICAgICAgICAgICAgY29uc3QgaWQgPSBpZHNba2V5XTtcbiAgICAgICAgICAgIGNvbnN0IGsgPSB1dGlsLmVzYyhrZXkpO1xuICAgICAgICAgICAgY29uc3Qgc2NoZW1hID0gc2hhcGVba2V5XTtcbiAgICAgICAgICAgIGNvbnN0IGlzT3B0aW9uYWxJbiA9IHNjaGVtYT8uX3pvZD8ub3B0aW4gPT09IFwib3B0aW9uYWxcIjtcbiAgICAgICAgICAgIGNvbnN0IGlzT3B0aW9uYWxPdXQgPSBzY2hlbWE/Ll96b2Q/Lm9wdG91dCA9PT0gXCJvcHRpb25hbFwiO1xuICAgICAgICAgICAgZG9jLndyaXRlKGBjb25zdCAke2lkfSA9ICR7cGFyc2VTdHIoa2V5KX07YCk7XG4gICAgICAgICAgICBpZiAoaXNPcHRpb25hbEluICYmIGlzT3B0aW9uYWxPdXQpIHtcbiAgICAgICAgICAgICAgICAvLyBGb3Igb3B0aW9uYWwtaW4vb3V0IHNjaGVtYXMsIGlnbm9yZSBlcnJvcnMgb24gYWJzZW50IGtleXNcbiAgICAgICAgICAgICAgICBkb2Mud3JpdGUoYFxuICAgICAgICBpZiAoJHtpZH0uaXNzdWVzLmxlbmd0aCkge1xuICAgICAgICAgIGlmICgke2t9IGluIGlucHV0KSB7XG4gICAgICAgICAgICBwYXlsb2FkLmlzc3VlcyA9IHBheWxvYWQuaXNzdWVzLmNvbmNhdCgke2lkfS5pc3N1ZXMubWFwKGlzcyA9PiAoe1xuICAgICAgICAgICAgICAuLi5pc3MsXG4gICAgICAgICAgICAgIHBhdGg6IGlzcy5wYXRoID8gWyR7a30sIC4uLmlzcy5wYXRoXSA6IFske2t9XVxuICAgICAgICAgICAgfSkpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmICgke2lkfS52YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgaWYgKCR7a30gaW4gaW5wdXQpIHtcbiAgICAgICAgICAgIG5ld1Jlc3VsdFske2t9XSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmV3UmVzdWx0WyR7a31dID0gJHtpZH0udmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICBgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKCFpc09wdGlvbmFsSW4pIHtcbiAgICAgICAgICAgICAgICBkb2Mud3JpdGUoYFxuICAgICAgICBjb25zdCAke2lkfV9wcmVzZW50ID0gJHtrfSBpbiBpbnB1dDtcbiAgICAgICAgaWYgKCR7aWR9Lmlzc3Vlcy5sZW5ndGgpIHtcbiAgICAgICAgICBwYXlsb2FkLmlzc3VlcyA9IHBheWxvYWQuaXNzdWVzLmNvbmNhdCgke2lkfS5pc3N1ZXMubWFwKGlzcyA9PiAoe1xuICAgICAgICAgICAgLi4uaXNzLFxuICAgICAgICAgICAgcGF0aDogaXNzLnBhdGggPyBbJHtrfSwgLi4uaXNzLnBhdGhdIDogWyR7a31dXG4gICAgICAgICAgfSkpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoISR7aWR9X3ByZXNlbnQgJiYgISR7aWR9Lmlzc3Vlcy5sZW5ndGgpIHtcbiAgICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcbiAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF90eXBlXCIsXG4gICAgICAgICAgICBleHBlY3RlZDogXCJub25vcHRpb25hbFwiLFxuICAgICAgICAgICAgaW5wdXQ6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHBhdGg6IFske2t9XVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCR7aWR9X3ByZXNlbnQpIHtcbiAgICAgICAgICBpZiAoJHtpZH0udmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgbmV3UmVzdWx0WyR7a31dID0gdW5kZWZpbmVkO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuZXdSZXN1bHRbJHtrfV0gPSAke2lkfS52YWx1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBkb2Mud3JpdGUoYFxuICAgICAgICBpZiAoJHtpZH0uaXNzdWVzLmxlbmd0aCkge1xuICAgICAgICAgIHBheWxvYWQuaXNzdWVzID0gcGF5bG9hZC5pc3N1ZXMuY29uY2F0KCR7aWR9Lmlzc3Vlcy5tYXAoaXNzID0+ICh7XG4gICAgICAgICAgICAuLi5pc3MsXG4gICAgICAgICAgICBwYXRoOiBpc3MucGF0aCA/IFske2t9LCAuLi5pc3MucGF0aF0gOiBbJHtrfV1cbiAgICAgICAgICB9KSkpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAoJHtpZH0udmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGlmICgke2t9IGluIGlucHV0KSB7XG4gICAgICAgICAgICBuZXdSZXN1bHRbJHtrfV0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5ld1Jlc3VsdFske2t9XSA9ICR7aWR9LnZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZG9jLndyaXRlKGBwYXlsb2FkLnZhbHVlID0gbmV3UmVzdWx0O2ApO1xuICAgICAgICBkb2Mud3JpdGUoYHJldHVybiBwYXlsb2FkO2ApO1xuICAgICAgICBjb25zdCBmbiA9IGRvYy5jb21waWxlKCk7XG4gICAgICAgIHJldHVybiAocGF5bG9hZCwgY3R4KSA9PiBmbihzaGFwZSwgcGF5bG9hZCwgY3R4KTtcbiAgICB9O1xuICAgIGxldCBmYXN0cGFzcztcbiAgICBjb25zdCBpc09iamVjdCA9IHV0aWwuaXNPYmplY3Q7XG4gICAgY29uc3Qgaml0ID0gIWNvcmUuZ2xvYmFsQ29uZmlnLmppdGxlc3M7XG4gICAgY29uc3QgYWxsb3dzRXZhbCA9IHV0aWwuYWxsb3dzRXZhbDtcbiAgICBjb25zdCBmYXN0RW5hYmxlZCA9IGppdCAmJiBhbGxvd3NFdmFsLnZhbHVlOyAvLyAmJiAhZGVmLmNhdGNoYWxsO1xuICAgIGNvbnN0IGNhdGNoYWxsID0gZGVmLmNhdGNoYWxsO1xuICAgIGxldCB2YWx1ZTtcbiAgICBpbnN0Ll96b2QucGFyc2UgPSAocGF5bG9hZCwgY3R4KSA9PiB7XG4gICAgICAgIHZhbHVlID8/ICh2YWx1ZSA9IF9ub3JtYWxpemVkLnZhbHVlKTtcbiAgICAgICAgY29uc3QgaW5wdXQgPSBwYXlsb2FkLnZhbHVlO1xuICAgICAgICBpZiAoIWlzT2JqZWN0KGlucHV0KSkge1xuICAgICAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFwib2JqZWN0XCIsXG4gICAgICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX3R5cGVcIixcbiAgICAgICAgICAgICAgICBpbnB1dCxcbiAgICAgICAgICAgICAgICBpbnN0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gcGF5bG9hZDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaml0ICYmIGZhc3RFbmFibGVkICYmIGN0eD8uYXN5bmMgPT09IGZhbHNlICYmIGN0eC5qaXRsZXNzICE9PSB0cnVlKSB7XG4gICAgICAgICAgICAvLyBhbHdheXMgc3luY2hyb25vdXNcbiAgICAgICAgICAgIGlmICghZmFzdHBhc3MpXG4gICAgICAgICAgICAgICAgZmFzdHBhc3MgPSBnZW5lcmF0ZUZhc3RwYXNzKGRlZi5zaGFwZSk7XG4gICAgICAgICAgICBwYXlsb2FkID0gZmFzdHBhc3MocGF5bG9hZCwgY3R4KTtcbiAgICAgICAgICAgIGlmICghY2F0Y2hhbGwpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHBheWxvYWQ7XG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlQ2F0Y2hhbGwoW10sIGlucHV0LCBwYXlsb2FkLCBjdHgsIHZhbHVlLCBpbnN0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3VwZXJQYXJzZShwYXlsb2FkLCBjdHgpO1xuICAgIH07XG59KTtcbmZ1bmN0aW9uIGhhbmRsZVVuaW9uUmVzdWx0cyhyZXN1bHRzLCBmaW5hbCwgaW5zdCwgY3R4KSB7XG4gICAgZm9yIChjb25zdCByZXN1bHQgb2YgcmVzdWx0cykge1xuICAgICAgICBpZiAocmVzdWx0Lmlzc3Vlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGZpbmFsLnZhbHVlID0gcmVzdWx0LnZhbHVlO1xuICAgICAgICAgICAgcmV0dXJuIGZpbmFsO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN0IG5vbmFib3J0ZWQgPSByZXN1bHRzLmZpbHRlcigocikgPT4gIXV0aWwuYWJvcnRlZChyKSk7XG4gICAgaWYgKG5vbmFib3J0ZWQubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIGZpbmFsLnZhbHVlID0gbm9uYWJvcnRlZFswXS52YWx1ZTtcbiAgICAgICAgcmV0dXJuIG5vbmFib3J0ZWRbMF07XG4gICAgfVxuICAgIGZpbmFsLmlzc3Vlcy5wdXNoKHtcbiAgICAgICAgY29kZTogXCJpbnZhbGlkX3VuaW9uXCIsXG4gICAgICAgIGlucHV0OiBmaW5hbC52YWx1ZSxcbiAgICAgICAgaW5zdCxcbiAgICAgICAgZXJyb3JzOiByZXN1bHRzLm1hcCgocmVzdWx0KSA9PiByZXN1bHQuaXNzdWVzLm1hcCgoaXNzKSA9PiB1dGlsLmZpbmFsaXplSXNzdWUoaXNzLCBjdHgsIGNvcmUuY29uZmlnKCkpKSksXG4gICAgfSk7XG4gICAgcmV0dXJuIGZpbmFsO1xufVxuZXhwb3J0IGNvbnN0ICRab2RVbmlvbiA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kVW5pb25cIiwgKGluc3QsIGRlZikgPT4ge1xuICAgICRab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcbiAgICB1dGlsLmRlZmluZUxhenkoaW5zdC5fem9kLCBcIm9wdGluXCIsICgpID0+IGRlZi5vcHRpb25zLnNvbWUoKG8pID0+IG8uX3pvZC5vcHRpbiA9PT0gXCJvcHRpb25hbFwiKSA/IFwib3B0aW9uYWxcIiA6IHVuZGVmaW5lZCk7XG4gICAgdXRpbC5kZWZpbmVMYXp5KGluc3QuX3pvZCwgXCJvcHRvdXRcIiwgKCkgPT4gZGVmLm9wdGlvbnMuc29tZSgobykgPT4gby5fem9kLm9wdG91dCA9PT0gXCJvcHRpb25hbFwiKSA/IFwib3B0aW9uYWxcIiA6IHVuZGVmaW5lZCk7XG4gICAgdXRpbC5kZWZpbmVMYXp5KGluc3QuX3pvZCwgXCJ2YWx1ZXNcIiwgKCkgPT4ge1xuICAgICAgICBpZiAoZGVmLm9wdGlvbnMuZXZlcnkoKG8pID0+IG8uX3pvZC52YWx1ZXMpKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFNldChkZWYub3B0aW9ucy5mbGF0TWFwKChvcHRpb24pID0+IEFycmF5LmZyb20ob3B0aW9uLl96b2QudmFsdWVzKSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfSk7XG4gICAgdXRpbC5kZWZpbmVMYXp5KGluc3QuX3pvZCwgXCJwYXR0ZXJuXCIsICgpID0+IHtcbiAgICAgICAgaWYgKGRlZi5vcHRpb25zLmV2ZXJ5KChvKSA9PiBvLl96b2QucGF0dGVybikpIHtcbiAgICAgICAgICAgIGNvbnN0IHBhdHRlcm5zID0gZGVmLm9wdGlvbnMubWFwKChvKSA9PiBvLl96b2QucGF0dGVybik7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFJlZ0V4cChgXigke3BhdHRlcm5zLm1hcCgocCkgPT4gdXRpbC5jbGVhblJlZ2V4KHAuc291cmNlKSkuam9pbihcInxcIil9KSRgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH0pO1xuICAgIGNvbnN0IGZpcnN0ID0gZGVmLm9wdGlvbnMubGVuZ3RoID09PSAxID8gZGVmLm9wdGlvbnNbMF0uX3pvZC5ydW4gOiBudWxsO1xuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBjdHgpID0+IHtcbiAgICAgICAgaWYgKGZpcnN0KSB7XG4gICAgICAgICAgICByZXR1cm4gZmlyc3QocGF5bG9hZCwgY3R4KTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgYXN5bmMgPSBmYWxzZTtcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IG9wdGlvbiBvZiBkZWYub3B0aW9ucykge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gb3B0aW9uLl96b2QucnVuKHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogcGF5bG9hZC52YWx1ZSxcbiAgICAgICAgICAgICAgICBpc3N1ZXM6IFtdLFxuICAgICAgICAgICAgfSwgY3R4KTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgYXN5bmMgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5pc3N1ZXMubGVuZ3RoID09PSAwKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChyZXN1bHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghYXN5bmMpXG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlVW5pb25SZXN1bHRzKHJlc3VsdHMsIHBheWxvYWQsIGluc3QsIGN0eCk7XG4gICAgICAgIHJldHVybiBQcm9taXNlLmFsbChyZXN1bHRzKS50aGVuKChyZXN1bHRzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlVW5pb25SZXN1bHRzKHJlc3VsdHMsIHBheWxvYWQsIGluc3QsIGN0eCk7XG4gICAgICAgIH0pO1xuICAgIH07XG59KTtcbmZ1bmN0aW9uIGhhbmRsZUV4Y2x1c2l2ZVVuaW9uUmVzdWx0cyhyZXN1bHRzLCBmaW5hbCwgaW5zdCwgY3R4KSB7XG4gICAgY29uc3Qgc3VjY2Vzc2VzID0gcmVzdWx0cy5maWx0ZXIoKHIpID0+IHIuaXNzdWVzLmxlbmd0aCA9PT0gMCk7XG4gICAgaWYgKHN1Y2Nlc3Nlcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgZmluYWwudmFsdWUgPSBzdWNjZXNzZXNbMF0udmFsdWU7XG4gICAgICAgIHJldHVybiBmaW5hbDtcbiAgICB9XG4gICAgaWYgKHN1Y2Nlc3Nlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgLy8gTm8gbWF0Y2hlcyAtIHNhbWUgYXMgcmVndWxhciB1bmlvblxuICAgICAgICBmaW5hbC5pc3N1ZXMucHVzaCh7XG4gICAgICAgICAgICBjb2RlOiBcImludmFsaWRfdW5pb25cIixcbiAgICAgICAgICAgIGlucHV0OiBmaW5hbC52YWx1ZSxcbiAgICAgICAgICAgIGluc3QsXG4gICAgICAgICAgICBlcnJvcnM6IHJlc3VsdHMubWFwKChyZXN1bHQpID0+IHJlc3VsdC5pc3N1ZXMubWFwKChpc3MpID0+IHV0aWwuZmluYWxpemVJc3N1ZShpc3MsIGN0eCwgY29yZS5jb25maWcoKSkpKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICAvLyBNdWx0aXBsZSBtYXRjaGVzIC0gZXhjbHVzaXZlIHVuaW9uIGZhaWx1cmVcbiAgICAgICAgZmluYWwuaXNzdWVzLnB1c2goe1xuICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX3VuaW9uXCIsXG4gICAgICAgICAgICBpbnB1dDogZmluYWwudmFsdWUsXG4gICAgICAgICAgICBpbnN0LFxuICAgICAgICAgICAgZXJyb3JzOiBbXSxcbiAgICAgICAgICAgIGluY2x1c2l2ZTogZmFsc2UsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gZmluYWw7XG59XG5leHBvcnQgY29uc3QgJFpvZFhvciA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kWG9yXCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICAkWm9kVW5pb24uaW5pdChpbnN0LCBkZWYpO1xuICAgIGRlZi5pbmNsdXNpdmUgPSBmYWxzZTtcbiAgICBjb25zdCBmaXJzdCA9IGRlZi5vcHRpb25zLmxlbmd0aCA9PT0gMSA/IGRlZi5vcHRpb25zWzBdLl96b2QucnVuIDogbnVsbDtcbiAgICBpbnN0Ll96b2QucGFyc2UgPSAocGF5bG9hZCwgY3R4KSA9PiB7XG4gICAgICAgIGlmIChmaXJzdCkge1xuICAgICAgICAgICAgcmV0dXJuIGZpcnN0KHBheWxvYWQsIGN0eCk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGFzeW5jID0gZmFsc2U7XG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBvcHRpb24gb2YgZGVmLm9wdGlvbnMpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IG9wdGlvbi5fem9kLnJ1bih7XG4gICAgICAgICAgICAgICAgdmFsdWU6IHBheWxvYWQudmFsdWUsXG4gICAgICAgICAgICAgICAgaXNzdWVzOiBbXSxcbiAgICAgICAgICAgIH0sIGN0eCk7XG4gICAgICAgICAgICBpZiAocmVzdWx0IGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChyZXN1bHQpO1xuICAgICAgICAgICAgICAgIGFzeW5jID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChyZXN1bHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghYXN5bmMpXG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlRXhjbHVzaXZlVW5pb25SZXN1bHRzKHJlc3VsdHMsIHBheWxvYWQsIGluc3QsIGN0eCk7XG4gICAgICAgIHJldHVybiBQcm9taXNlLmFsbChyZXN1bHRzKS50aGVuKChyZXN1bHRzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlRXhjbHVzaXZlVW5pb25SZXN1bHRzKHJlc3VsdHMsIHBheWxvYWQsIGluc3QsIGN0eCk7XG4gICAgICAgIH0pO1xuICAgIH07XG59KTtcbmV4cG9ydCBjb25zdCAkWm9kRGlzY3JpbWluYXRlZFVuaW9uID0gXG4vKkBfX1BVUkVfXyovXG5jb3JlLiRjb25zdHJ1Y3RvcihcIiRab2REaXNjcmltaW5hdGVkVW5pb25cIiwgKGluc3QsIGRlZikgPT4ge1xuICAgIGRlZi5pbmNsdXNpdmUgPSBmYWxzZTtcbiAgICAkWm9kVW5pb24uaW5pdChpbnN0LCBkZWYpO1xuICAgIGNvbnN0IF9zdXBlciA9IGluc3QuX3pvZC5wYXJzZTtcbiAgICB1dGlsLmRlZmluZUxhenkoaW5zdC5fem9kLCBcInByb3BWYWx1ZXNcIiwgKCkgPT4ge1xuICAgICAgICBjb25zdCBwcm9wVmFsdWVzID0ge307XG4gICAgICAgIGZvciAoY29uc3Qgb3B0aW9uIG9mIGRlZi5vcHRpb25zKSB7XG4gICAgICAgICAgICBjb25zdCBwdiA9IG9wdGlvbi5fem9kLnByb3BWYWx1ZXM7XG4gICAgICAgICAgICBpZiAoIXB2IHx8IE9iamVjdC5rZXlzKHB2KS5sZW5ndGggPT09IDApXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIGRpc2NyaW1pbmF0ZWQgdW5pb24gb3B0aW9uIGF0IGluZGV4IFwiJHtkZWYub3B0aW9ucy5pbmRleE9mKG9wdGlvbil9XCJgKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgW2ssIHZdIG9mIE9iamVjdC5lbnRyaWVzKHB2KSkge1xuICAgICAgICAgICAgICAgIGlmICghcHJvcFZhbHVlc1trXSlcbiAgICAgICAgICAgICAgICAgICAgcHJvcFZhbHVlc1trXSA9IG5ldyBTZXQoKTtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHZhbCBvZiB2KSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BWYWx1ZXNba10uYWRkKHZhbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9wVmFsdWVzO1xuICAgIH0pO1xuICAgIGNvbnN0IGRpc2MgPSB1dGlsLmNhY2hlZCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IG9wdHMgPSBkZWYub3B0aW9ucztcbiAgICAgICAgY29uc3QgbWFwID0gbmV3IE1hcCgpO1xuICAgICAgICBmb3IgKGNvbnN0IG8gb2Ygb3B0cykge1xuICAgICAgICAgICAgY29uc3QgdmFsdWVzID0gby5fem9kLnByb3BWYWx1ZXM/LltkZWYuZGlzY3JpbWluYXRvcl07XG4gICAgICAgICAgICBpZiAoIXZhbHVlcyB8fCB2YWx1ZXMuc2l6ZSA9PT0gMClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgZGlzY3JpbWluYXRlZCB1bmlvbiBvcHRpb24gYXQgaW5kZXggXCIke2RlZi5vcHRpb25zLmluZGV4T2Yobyl9XCJgKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgdiBvZiB2YWx1ZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAobWFwLmhhcyh2KSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYER1cGxpY2F0ZSBkaXNjcmltaW5hdG9yIHZhbHVlIFwiJHtTdHJpbmcodil9XCJgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbWFwLnNldCh2LCBvKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWFwO1xuICAgIH0pO1xuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBjdHgpID0+IHtcbiAgICAgICAgY29uc3QgaW5wdXQgPSBwYXlsb2FkLnZhbHVlO1xuICAgICAgICBpZiAoIXV0aWwuaXNPYmplY3QoaW5wdXQpKSB7XG4gICAgICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBjb2RlOiBcImludmFsaWRfdHlwZVwiLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBcIm9iamVjdFwiLFxuICAgICAgICAgICAgICAgIGlucHV0LFxuICAgICAgICAgICAgICAgIGluc3QsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBwYXlsb2FkO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG9wdCA9IGRpc2MudmFsdWUuZ2V0KGlucHV0Py5bZGVmLmRpc2NyaW1pbmF0b3JdKTtcbiAgICAgICAgaWYgKG9wdCkge1xuICAgICAgICAgICAgcmV0dXJuIG9wdC5fem9kLnJ1bihwYXlsb2FkLCBjdHgpO1xuICAgICAgICB9XG4gICAgICAgIC8vIEZhbGwgYmFjayB0byB1bmlvbiBtYXRjaGluZyB3aGVuIHRoZSBmYXN0IGRpc2NyaW1pbmF0b3IgcGF0aCBmYWlsczpcbiAgICAgICAgLy8gLSBleHBsaWNpdGx5IGVuYWJsZWQgdmlhIHVuaW9uRmFsbGJhY2ssIG9yXG4gICAgICAgIC8vIC0gZHVyaW5nIGJhY2t3YXJkIGRpcmVjdGlvbiAoZW5jb2RlKSwgc2luY2UgY29kZWMtYmFzZWQgZGlzY3JpbWluYXRvcnNcbiAgICAgICAgLy8gICBoYXZlIGRpZmZlcmVudCB2YWx1ZXMgaW4gZm9yd2FyZCB2cyBiYWNrd2FyZCBkaXJlY3Rpb25zXG4gICAgICAgIGlmIChkZWYudW5pb25GYWxsYmFjayB8fCBjdHguZGlyZWN0aW9uID09PSBcImJhY2t3YXJkXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBfc3VwZXIocGF5bG9hZCwgY3R4KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBubyBtYXRjaGluZyBkaXNjcmltaW5hdG9yXG4gICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xuICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX3VuaW9uXCIsXG4gICAgICAgICAgICBlcnJvcnM6IFtdLFxuICAgICAgICAgICAgbm90ZTogXCJObyBtYXRjaGluZyBkaXNjcmltaW5hdG9yXCIsXG4gICAgICAgICAgICBkaXNjcmltaW5hdG9yOiBkZWYuZGlzY3JpbWluYXRvcixcbiAgICAgICAgICAgIG9wdGlvbnM6IEFycmF5LmZyb20oZGlzYy52YWx1ZS5rZXlzKCkpLFxuICAgICAgICAgICAgaW5wdXQsXG4gICAgICAgICAgICBwYXRoOiBbZGVmLmRpc2NyaW1pbmF0b3JdLFxuICAgICAgICAgICAgaW5zdCxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBwYXlsb2FkO1xuICAgIH07XG59KTtcbmV4cG9ydCBjb25zdCAkWm9kSW50ZXJzZWN0aW9uID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RJbnRlcnNlY3Rpb25cIiwgKGluc3QsIGRlZikgPT4ge1xuICAgICRab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcbiAgICBpbnN0Ll96b2QucGFyc2UgPSAocGF5bG9hZCwgY3R4KSA9PiB7XG4gICAgICAgIGNvbnN0IGlucHV0ID0gcGF5bG9hZC52YWx1ZTtcbiAgICAgICAgY29uc3QgbGVmdCA9IGRlZi5sZWZ0Ll96b2QucnVuKHsgdmFsdWU6IGlucHV0LCBpc3N1ZXM6IFtdIH0sIGN0eCk7XG4gICAgICAgIGNvbnN0IHJpZ2h0ID0gZGVmLnJpZ2h0Ll96b2QucnVuKHsgdmFsdWU6IGlucHV0LCBpc3N1ZXM6IFtdIH0sIGN0eCk7XG4gICAgICAgIGNvbnN0IGFzeW5jID0gbGVmdCBpbnN0YW5jZW9mIFByb21pc2UgfHwgcmlnaHQgaW5zdGFuY2VvZiBQcm9taXNlO1xuICAgICAgICBpZiAoYXN5bmMpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChbbGVmdCwgcmlnaHRdKS50aGVuKChbbGVmdCwgcmlnaHRdKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZUludGVyc2VjdGlvblJlc3VsdHMocGF5bG9hZCwgbGVmdCwgcmlnaHQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGhhbmRsZUludGVyc2VjdGlvblJlc3VsdHMocGF5bG9hZCwgbGVmdCwgcmlnaHQpO1xuICAgIH07XG59KTtcbmZ1bmN0aW9uIG1lcmdlVmFsdWVzKGEsIGIpIHtcbiAgICAvLyBjb25zdCBhVHlwZSA9IHBhcnNlLnQoYSk7XG4gICAgLy8gY29uc3QgYlR5cGUgPSBwYXJzZS50KGIpO1xuICAgIGlmIChhID09PSBiKSB7XG4gICAgICAgIHJldHVybiB7IHZhbGlkOiB0cnVlLCBkYXRhOiBhIH07XG4gICAgfVxuICAgIGlmIChhIGluc3RhbmNlb2YgRGF0ZSAmJiBiIGluc3RhbmNlb2YgRGF0ZSAmJiArYSA9PT0gK2IpIHtcbiAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IHRydWUsIGRhdGE6IGEgfTtcbiAgICB9XG4gICAgaWYgKHV0aWwuaXNQbGFpbk9iamVjdChhKSAmJiB1dGlsLmlzUGxhaW5PYmplY3QoYikpIHtcbiAgICAgICAgY29uc3QgYktleXMgPSBPYmplY3Qua2V5cyhiKTtcbiAgICAgICAgY29uc3Qgc2hhcmVkS2V5cyA9IE9iamVjdC5rZXlzKGEpLmZpbHRlcigoa2V5KSA9PiBiS2V5cy5pbmRleE9mKGtleSkgIT09IC0xKTtcbiAgICAgICAgY29uc3QgbmV3T2JqID0geyAuLi5hLCAuLi5iIH07XG4gICAgICAgIGZvciAoY29uc3Qga2V5IG9mIHNoYXJlZEtleXMpIHtcbiAgICAgICAgICAgIGNvbnN0IHNoYXJlZFZhbHVlID0gbWVyZ2VWYWx1ZXMoYVtrZXldLCBiW2tleV0pO1xuICAgICAgICAgICAgaWYgKCFzaGFyZWRWYWx1ZS52YWxpZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHZhbGlkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgbWVyZ2VFcnJvclBhdGg6IFtrZXksIC4uLnNoYXJlZFZhbHVlLm1lcmdlRXJyb3JQYXRoXSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbmV3T2JqW2tleV0gPSBzaGFyZWRWYWx1ZS5kYXRhO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHZhbGlkOiB0cnVlLCBkYXRhOiBuZXdPYmogfTtcbiAgICB9XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoYSkgJiYgQXJyYXkuaXNBcnJheShiKSkge1xuICAgICAgICBpZiAoYS5sZW5ndGggIT09IGIubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIG1lcmdlRXJyb3JQYXRoOiBbXSB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5ld0FycmF5ID0gW107XG4gICAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBhLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgICAgY29uc3QgaXRlbUEgPSBhW2luZGV4XTtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW1CID0gYltpbmRleF07XG4gICAgICAgICAgICBjb25zdCBzaGFyZWRWYWx1ZSA9IG1lcmdlVmFsdWVzKGl0ZW1BLCBpdGVtQik7XG4gICAgICAgICAgICBpZiAoIXNoYXJlZFZhbHVlLnZhbGlkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsaWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBtZXJnZUVycm9yUGF0aDogW2luZGV4LCAuLi5zaGFyZWRWYWx1ZS5tZXJnZUVycm9yUGF0aF0sXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5ld0FycmF5LnB1c2goc2hhcmVkVmFsdWUuZGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IHRydWUsIGRhdGE6IG5ld0FycmF5IH07XG4gICAgfVxuICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgbWVyZ2VFcnJvclBhdGg6IFtdIH07XG59XG5mdW5jdGlvbiBoYW5kbGVJbnRlcnNlY3Rpb25SZXN1bHRzKHJlc3VsdCwgbGVmdCwgcmlnaHQpIHtcbiAgICAvLyBUcmFjayB3aGljaCBzaWRlKHMpIHJlcG9ydCBlYWNoIGtleSBhcyB1bnJlY29nbml6ZWRcbiAgICBjb25zdCB1bnJlY0tleXMgPSBuZXcgTWFwKCk7XG4gICAgbGV0IHVucmVjSXNzdWU7XG4gICAgZm9yIChjb25zdCBpc3Mgb2YgbGVmdC5pc3N1ZXMpIHtcbiAgICAgICAgaWYgKGlzcy5jb2RlID09PSBcInVucmVjb2duaXplZF9rZXlzXCIpIHtcbiAgICAgICAgICAgIHVucmVjSXNzdWUgPz8gKHVucmVjSXNzdWUgPSBpc3MpO1xuICAgICAgICAgICAgZm9yIChjb25zdCBrIG9mIGlzcy5rZXlzKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF1bnJlY0tleXMuaGFzKGspKVxuICAgICAgICAgICAgICAgICAgICB1bnJlY0tleXMuc2V0KGssIHt9KTtcbiAgICAgICAgICAgICAgICB1bnJlY0tleXMuZ2V0KGspLmwgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0Lmlzc3Vlcy5wdXNoKGlzcyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZm9yIChjb25zdCBpc3Mgb2YgcmlnaHQuaXNzdWVzKSB7XG4gICAgICAgIGlmIChpc3MuY29kZSA9PT0gXCJ1bnJlY29nbml6ZWRfa2V5c1wiKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGsgb2YgaXNzLmtleXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXVucmVjS2V5cy5oYXMoaykpXG4gICAgICAgICAgICAgICAgICAgIHVucmVjS2V5cy5zZXQoaywge30pO1xuICAgICAgICAgICAgICAgIHVucmVjS2V5cy5nZXQoaykuciA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQuaXNzdWVzLnB1c2goaXNzKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBSZXBvcnQgb25seSBrZXlzIHVucmVjb2duaXplZCBieSBCT1RIIHNpZGVzXG4gICAgY29uc3QgYm90aEtleXMgPSBbLi4udW5yZWNLZXlzXS5maWx0ZXIoKFssIGZdKSA9PiBmLmwgJiYgZi5yKS5tYXAoKFtrXSkgPT4gayk7XG4gICAgaWYgKGJvdGhLZXlzLmxlbmd0aCAmJiB1bnJlY0lzc3VlKSB7XG4gICAgICAgIHJlc3VsdC5pc3N1ZXMucHVzaCh7IC4uLnVucmVjSXNzdWUsIGtleXM6IGJvdGhLZXlzIH0pO1xuICAgIH1cbiAgICBpZiAodXRpbC5hYm9ydGVkKHJlc3VsdCkpXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgY29uc3QgbWVyZ2VkID0gbWVyZ2VWYWx1ZXMobGVmdC52YWx1ZSwgcmlnaHQudmFsdWUpO1xuICAgIGlmICghbWVyZ2VkLnZhbGlkKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5tZXJnYWJsZSBpbnRlcnNlY3Rpb24uIEVycm9yIHBhdGg6IGAgKyBgJHtKU09OLnN0cmluZ2lmeShtZXJnZWQubWVyZ2VFcnJvclBhdGgpfWApO1xuICAgIH1cbiAgICByZXN1bHQudmFsdWUgPSBtZXJnZWQuZGF0YTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuZXhwb3J0IGNvbnN0ICRab2RUdXBsZSA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kVHVwbGVcIiwgKGluc3QsIGRlZikgPT4ge1xuICAgICRab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcbiAgICBjb25zdCBpdGVtcyA9IGRlZi5pdGVtcztcbiAgICBpbnN0Ll96b2QucGFyc2UgPSAocGF5bG9hZCwgY3R4KSA9PiB7XG4gICAgICAgIGNvbnN0IGlucHV0ID0gcGF5bG9hZC52YWx1ZTtcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGlucHV0KSkge1xuICAgICAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgaW5wdXQsXG4gICAgICAgICAgICAgICAgaW5zdCxcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogXCJ0dXBsZVwiLFxuICAgICAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF90eXBlXCIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBwYXlsb2FkO1xuICAgICAgICB9XG4gICAgICAgIHBheWxvYWQudmFsdWUgPSBbXTtcbiAgICAgICAgY29uc3QgcHJvbXMgPSBbXTtcbiAgICAgICAgY29uc3Qgb3B0aW5TdGFydCA9IGdldFR1cGxlT3B0U3RhcnQoaXRlbXMsIFwib3B0aW5cIik7XG4gICAgICAgIGNvbnN0IG9wdG91dFN0YXJ0ID0gZ2V0VHVwbGVPcHRTdGFydChpdGVtcywgXCJvcHRvdXRcIik7XG4gICAgICAgIGlmICghZGVmLnJlc3QpIHtcbiAgICAgICAgICAgIGlmIChpbnB1dC5sZW5ndGggPCBvcHRpblN0YXJ0KSB7XG4gICAgICAgICAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGNvZGU6IFwidG9vX3NtYWxsXCIsXG4gICAgICAgICAgICAgICAgICAgIG1pbmltdW06IG9wdGluU3RhcnQsXG4gICAgICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgaW5wdXQsXG4gICAgICAgICAgICAgICAgICAgIGluc3QsXG4gICAgICAgICAgICAgICAgICAgIG9yaWdpbjogXCJhcnJheVwiLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBwYXlsb2FkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlucHV0Lmxlbmd0aCA+IGl0ZW1zLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBjb2RlOiBcInRvb19iaWdcIixcbiAgICAgICAgICAgICAgICAgICAgbWF4aW11bTogaXRlbXMubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGlucHV0LFxuICAgICAgICAgICAgICAgICAgICBpbnN0LFxuICAgICAgICAgICAgICAgICAgICBvcmlnaW46IFwiYXJyYXlcIixcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBSdW4gZXZlcnkgaXRlbSBpbiBwYXJhbGxlbCwgY29sbGVjdGluZyByZXN1bHRzIGludG8gYW4gaW5kZXhlZFxuICAgICAgICAvLyBhcnJheS4gVGhlIHBvc3QtcHJvY2Vzc2luZyBpbiBgaGFuZGxlVHVwbGVSZXN1bHRzYCB3YWxrcyB0aGVtIGluXG4gICAgICAgIC8vIG9yZGVyIHNvIGl0IGNhbiBkZWNpZGUgd2hldGhlciBhbiBhYnNlbnQgb3B0aW9uYWwtb3V0cHV0IGVycm9yIGNhblxuICAgICAgICAvLyB0cnVuY2F0ZSB0aGUgdGFpbCBvciBtdXN0IGJlIHJlcG9ydGVkIHRvIHByZXNlcnZlIHJlcXVpcmVkIG91dHB1dC5cbiAgICAgICAgY29uc3QgaXRlbVJlc3VsdHMgPSBuZXcgQXJyYXkoaXRlbXMubGVuZ3RoKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgciA9IGl0ZW1zW2ldLl96b2QucnVuKHsgdmFsdWU6IGlucHV0W2ldLCBpc3N1ZXM6IFtdIH0sIGN0eCk7XG4gICAgICAgICAgICBpZiAociBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgICAgICAgICBwcm9tcy5wdXNoKHIudGhlbigocnIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbVJlc3VsdHNbaV0gPSBycjtcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpdGVtUmVzdWx0c1tpXSA9IHI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRlZi5yZXN0KSB7XG4gICAgICAgICAgICBsZXQgaSA9IGl0ZW1zLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICBjb25zdCByZXN0ID0gaW5wdXQuc2xpY2UoaXRlbXMubGVuZ3RoKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgZWwgb2YgcmVzdCkge1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBkZWYucmVzdC5fem9kLnJ1bih7IHZhbHVlOiBlbCwgaXNzdWVzOiBbXSB9LCBjdHgpO1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb21zLnB1c2gocmVzdWx0LnRoZW4oKHIpID0+IGhhbmRsZVR1cGxlUmVzdWx0KHIsIHBheWxvYWQsIGkpKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBoYW5kbGVUdXBsZVJlc3VsdChyZXN1bHQsIHBheWxvYWQsIGkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAocHJvbXMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbXMpLnRoZW4oKCkgPT4gaGFuZGxlVHVwbGVSZXN1bHRzKGl0ZW1SZXN1bHRzLCBwYXlsb2FkLCBpdGVtcywgaW5wdXQsIG9wdG91dFN0YXJ0KSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGhhbmRsZVR1cGxlUmVzdWx0cyhpdGVtUmVzdWx0cywgcGF5bG9hZCwgaXRlbXMsIGlucHV0LCBvcHRvdXRTdGFydCk7XG4gICAgfTtcbn0pO1xuZnVuY3Rpb24gZ2V0VHVwbGVPcHRTdGFydChpdGVtcywga2V5KSB7XG4gICAgZm9yIChsZXQgaSA9IGl0ZW1zLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIGlmIChpdGVtc1tpXS5fem9kW2tleV0gIT09IFwib3B0aW9uYWxcIilcbiAgICAgICAgICAgIHJldHVybiBpICsgMTtcbiAgICB9XG4gICAgcmV0dXJuIDA7XG59XG5mdW5jdGlvbiBoYW5kbGVUdXBsZVJlc3VsdChyZXN1bHQsIGZpbmFsLCBpbmRleCkge1xuICAgIGlmIChyZXN1bHQuaXNzdWVzLmxlbmd0aCkge1xuICAgICAgICBmaW5hbC5pc3N1ZXMucHVzaCguLi51dGlsLnByZWZpeElzc3VlcyhpbmRleCwgcmVzdWx0Lmlzc3VlcykpO1xuICAgIH1cbiAgICBmaW5hbC52YWx1ZVtpbmRleF0gPSByZXN1bHQudmFsdWU7XG59XG5mdW5jdGlvbiBoYW5kbGVUdXBsZVJlc3VsdHMoaXRlbVJlc3VsdHMsIGZpbmFsLCBpdGVtcywgaW5wdXQsIG9wdG91dFN0YXJ0KSB7XG4gICAgLy8gV2FsayByZXN1bHRzIGluIG9yZGVyLiBNaXJyb3IgJFpvZE9iamVjdCdzIHN3YWxsb3ctb24tYWJzZW50LW9wdGlvbmFsXG4gICAgLy8gcnVsZSwgYnV0IG9ubHkgYWZ0ZXIgYG9wdG91dFN0YXJ0YDogdGhlIGZpcnN0IGluZGV4IHdoZXJlIHRoZSBvdXRwdXRcbiAgICAvLyB0dXBsZSB0YWlsIGNhbiBiZSBhYnNlbnQuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCByID0gaXRlbVJlc3VsdHNbaV07XG4gICAgICAgIGNvbnN0IGlzUHJlc2VudCA9IGkgPCBpbnB1dC5sZW5ndGg7XG4gICAgICAgIGlmIChyLmlzc3Vlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlmICghaXNQcmVzZW50ICYmIGkgPj0gb3B0b3V0U3RhcnQpIHtcbiAgICAgICAgICAgICAgICBmaW5hbC52YWx1ZS5sZW5ndGggPSBpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmluYWwuaXNzdWVzLnB1c2goLi4udXRpbC5wcmVmaXhJc3N1ZXMoaSwgci5pc3N1ZXMpKTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbC52YWx1ZVtpXSA9IHIudmFsdWU7XG4gICAgfVxuICAgIC8vIERyb3AgdHJhaWxpbmcgc2xvdHMgdGhhdCBwcm9kdWNlZCBgdW5kZWZpbmVkYCBmb3IgYWJzZW50IGlucHV0XG4gICAgLy8gKHRoZSBhcnJheSBhbmFsb2cgb2YgYW4gYWJzZW50IG9wdGlvbmFsIGtleSBvbiBhbiBvYmplY3QpLiBUaGVcbiAgICAvLyBgaSA+PSBpbnB1dC5sZW5ndGhgIGZsb29yIGlzIGNyaXRpY2FsOiBhbiBleHBsaWNpdCBgdW5kZWZpbmVkYFxuICAgIC8vICppbnNpZGUqIHRoZSBpbnB1dCBtdXN0IGJlIHByZXNlcnZlZCBldmVuIHdoZW4gdGhlIHNjaGVtYSBpc1xuICAgIC8vIG9wdGlvbmFsLW91dCAoZS5nLiBgei5zdHJpbmcoKS5vcih6LnVuZGVmaW5lZCgpKWAgYWNjZXB0aW5nIGFuXG4gICAgLy8gZXhwbGljaXQgdW5kZWZpbmVkIHZhbHVlKS5cbiAgICBmb3IgKGxldCBpID0gZmluYWwudmFsdWUubGVuZ3RoIC0gMTsgaSA+PSBpbnB1dC5sZW5ndGg7IGktLSkge1xuICAgICAgICBpZiAoaXRlbXNbaV0uX3pvZC5vcHRvdXQgPT09IFwib3B0aW9uYWxcIiAmJiBmaW5hbC52YWx1ZVtpXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBmaW5hbC52YWx1ZS5sZW5ndGggPSBpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZpbmFsO1xufVxuZXhwb3J0IGNvbnN0ICRab2RSZWNvcmQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZFJlY29yZFwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgJFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBjdHgpID0+IHtcbiAgICAgICAgY29uc3QgaW5wdXQgPSBwYXlsb2FkLnZhbHVlO1xuICAgICAgICBpZiAoIXV0aWwuaXNQbGFpbk9iamVjdChpbnB1dCkpIHtcbiAgICAgICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBcInJlY29yZFwiLFxuICAgICAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF90eXBlXCIsXG4gICAgICAgICAgICAgICAgaW5wdXQsXG4gICAgICAgICAgICAgICAgaW5zdCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHBheWxvYWQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcHJvbXMgPSBbXTtcbiAgICAgICAgY29uc3QgdmFsdWVzID0gZGVmLmtleVR5cGUuX3pvZC52YWx1ZXM7XG4gICAgICAgIGlmICh2YWx1ZXMpIHtcbiAgICAgICAgICAgIHBheWxvYWQudmFsdWUgPSB7fTtcbiAgICAgICAgICAgIGNvbnN0IHJlY29yZEtleXMgPSBuZXcgU2V0KCk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiB2YWx1ZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGtleSA9PT0gXCJzdHJpbmdcIiB8fCB0eXBlb2Yga2V5ID09PSBcIm51bWJlclwiIHx8IHR5cGVvZiBrZXkgPT09IFwic3ltYm9sXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVjb3JkS2V5cy5hZGQodHlwZW9mIGtleSA9PT0gXCJudW1iZXJcIiA/IGtleS50b1N0cmluZygpIDoga2V5KTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qga2V5UmVzdWx0ID0gZGVmLmtleVR5cGUuX3pvZC5ydW4oeyB2YWx1ZToga2V5LCBpc3N1ZXM6IFtdIH0sIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChrZXlSZXN1bHQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBc3luYyBzY2hlbWFzIG5vdCBzdXBwb3J0ZWQgaW4gb2JqZWN0IGtleXMgY3VycmVudGx5XCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChrZXlSZXN1bHQuaXNzdWVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX2tleVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbjogXCJyZWNvcmRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc3N1ZXM6IGtleVJlc3VsdC5pc3N1ZXMubWFwKChpc3MpID0+IHV0aWwuZmluYWxpemVJc3N1ZShpc3MsIGN0eCwgY29yZS5jb25maWcoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0OiBrZXksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogW2tleV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgb3V0S2V5ID0ga2V5UmVzdWx0LnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBkZWYudmFsdWVUeXBlLl96b2QucnVuKHsgdmFsdWU6IGlucHV0W2tleV0sIGlzc3VlczogW10gfSwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb21zLnB1c2gocmVzdWx0LnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuaXNzdWVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKC4uLnV0aWwucHJlZml4SXNzdWVzKGtleSwgcmVzdWx0Lmlzc3VlcykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXlsb2FkLnZhbHVlW291dEtleV0gPSByZXN1bHQudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0Lmlzc3Vlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKC4uLnV0aWwucHJlZml4SXNzdWVzKGtleSwgcmVzdWx0Lmlzc3VlcykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcGF5bG9hZC52YWx1ZVtvdXRLZXldID0gcmVzdWx0LnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IHVucmVjb2duaXplZDtcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIGlucHV0KSB7XG4gICAgICAgICAgICAgICAgaWYgKCFyZWNvcmRLZXlzLmhhcyhrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHVucmVjb2duaXplZCA9IHVucmVjb2duaXplZCA/PyBbXTtcbiAgICAgICAgICAgICAgICAgICAgdW5yZWNvZ25pemVkLnB1c2goa2V5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodW5yZWNvZ25pemVkICYmIHVucmVjb2duaXplZC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGNvZGU6IFwidW5yZWNvZ25pemVkX2tleXNcIixcbiAgICAgICAgICAgICAgICAgICAgaW5wdXQsXG4gICAgICAgICAgICAgICAgICAgIGluc3QsXG4gICAgICAgICAgICAgICAgICAgIGtleXM6IHVucmVjb2duaXplZCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHBheWxvYWQudmFsdWUgPSB7fTtcbiAgICAgICAgICAgIC8vIFJlZmxlY3Qub3duS2V5cyBmb3IgU3ltYm9sLWtleSBzdXBwb3J0OyBmaWx0ZXIgbm9uLWVudW1lcmFibGUgdG8gbWF0Y2ggei5vYmplY3QoKVxuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgUmVmbGVjdC5vd25LZXlzKGlucHV0KSkge1xuICAgICAgICAgICAgICAgIGlmIChrZXkgPT09IFwiX19wcm90b19fXCIpXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGlmICghT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKGlucHV0LCBrZXkpKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBsZXQga2V5UmVzdWx0ID0gZGVmLmtleVR5cGUuX3pvZC5ydW4oeyB2YWx1ZToga2V5LCBpc3N1ZXM6IFtdIH0sIGN0eCk7XG4gICAgICAgICAgICAgICAgaWYgKGtleVJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQXN5bmMgc2NoZW1hcyBub3Qgc3VwcG9ydGVkIGluIG9iamVjdCBrZXlzIGN1cnJlbnRseVwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gTnVtZXJpYyBzdHJpbmcgZmFsbGJhY2s6IGlmIGtleSBpcyBhIG51bWVyaWMgc3RyaW5nIGFuZCBmYWlsZWQsIHJldHJ5IHdpdGggTnVtYmVyKGtleSlcbiAgICAgICAgICAgICAgICAvLyBUaGlzIGhhbmRsZXMgei5udW1iZXIoKSwgei5saXRlcmFsKFsxLCAyLCAzXSksIGFuZCB1bmlvbnMgY29udGFpbmluZyBudW1lcmljIGxpdGVyYWxzXG4gICAgICAgICAgICAgICAgY29uc3QgY2hlY2tOdW1lcmljS2V5ID0gdHlwZW9mIGtleSA9PT0gXCJzdHJpbmdcIiAmJiByZWdleGVzLm51bWJlci50ZXN0KGtleSkgJiYga2V5UmVzdWx0Lmlzc3Vlcy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgaWYgKGNoZWNrTnVtZXJpY0tleSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXRyeVJlc3VsdCA9IGRlZi5rZXlUeXBlLl96b2QucnVuKHsgdmFsdWU6IE51bWJlcihrZXkpLCBpc3N1ZXM6IFtdIH0sIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXRyeVJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkFzeW5jIHNjaGVtYXMgbm90IHN1cHBvcnRlZCBpbiBvYmplY3Qga2V5cyBjdXJyZW50bHlcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJldHJ5UmVzdWx0Lmlzc3Vlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleVJlc3VsdCA9IHJldHJ5UmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChrZXlSZXN1bHQuaXNzdWVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGVmLm1vZGUgPT09IFwibG9vc2VcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gUGFzcyB0aHJvdWdoIHVuY2hhbmdlZFxuICAgICAgICAgICAgICAgICAgICAgICAgcGF5bG9hZC52YWx1ZVtrZXldID0gaW5wdXRba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIERlZmF1bHQgXCJzdHJpY3RcIiBiZWhhdmlvcjogZXJyb3Igb24gaW52YWxpZCBrZXlcbiAgICAgICAgICAgICAgICAgICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF9rZXlcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW46IFwicmVjb3JkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNzdWVzOiBrZXlSZXN1bHQuaXNzdWVzLm1hcCgoaXNzKSA9PiB1dGlsLmZpbmFsaXplSXNzdWUoaXNzLCBjdHgsIGNvcmUuY29uZmlnKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dDoga2V5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IFtrZXldLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc3QsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gZGVmLnZhbHVlVHlwZS5fem9kLnJ1bih7IHZhbHVlOiBpbnB1dFtrZXldLCBpc3N1ZXM6IFtdIH0sIGN0eCk7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvbXMucHVzaChyZXN1bHQudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0Lmlzc3Vlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKC4uLnV0aWwucHJlZml4SXNzdWVzKGtleSwgcmVzdWx0Lmlzc3VlcykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcGF5bG9hZC52YWx1ZVtrZXlSZXN1bHQudmFsdWVdID0gcmVzdWx0LnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0Lmlzc3Vlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goLi4udXRpbC5wcmVmaXhJc3N1ZXMoa2V5LCByZXN1bHQuaXNzdWVzKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcGF5bG9hZC52YWx1ZVtrZXlSZXN1bHQudmFsdWVdID0gcmVzdWx0LnZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAocHJvbXMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbXMpLnRoZW4oKCkgPT4gcGF5bG9hZCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBheWxvYWQ7XG4gICAgfTtcbn0pO1xuZXhwb3J0IGNvbnN0ICRab2RNYXAgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZE1hcFwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgJFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBjdHgpID0+IHtcbiAgICAgICAgY29uc3QgaW5wdXQgPSBwYXlsb2FkLnZhbHVlO1xuICAgICAgICBpZiAoIShpbnB1dCBpbnN0YW5jZW9mIE1hcCkpIHtcbiAgICAgICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBcIm1hcFwiLFxuICAgICAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF90eXBlXCIsXG4gICAgICAgICAgICAgICAgaW5wdXQsXG4gICAgICAgICAgICAgICAgaW5zdCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHBheWxvYWQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcHJvbXMgPSBbXTtcbiAgICAgICAgcGF5bG9hZC52YWx1ZSA9IG5ldyBNYXAoKTtcbiAgICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgaW5wdXQpIHtcbiAgICAgICAgICAgIGNvbnN0IGtleVJlc3VsdCA9IGRlZi5rZXlUeXBlLl96b2QucnVuKHsgdmFsdWU6IGtleSwgaXNzdWVzOiBbXSB9LCBjdHgpO1xuICAgICAgICAgICAgY29uc3QgdmFsdWVSZXN1bHQgPSBkZWYudmFsdWVUeXBlLl96b2QucnVuKHsgdmFsdWU6IHZhbHVlLCBpc3N1ZXM6IFtdIH0sIGN0eCk7XG4gICAgICAgICAgICBpZiAoa2V5UmVzdWx0IGluc3RhbmNlb2YgUHJvbWlzZSB8fCB2YWx1ZVJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgICAgICAgICBwcm9tcy5wdXNoKFByb21pc2UuYWxsKFtrZXlSZXN1bHQsIHZhbHVlUmVzdWx0XSkudGhlbigoW2tleVJlc3VsdCwgdmFsdWVSZXN1bHRdKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZU1hcFJlc3VsdChrZXlSZXN1bHQsIHZhbHVlUmVzdWx0LCBwYXlsb2FkLCBrZXksIGlucHV0LCBpbnN0LCBjdHgpO1xuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGhhbmRsZU1hcFJlc3VsdChrZXlSZXN1bHQsIHZhbHVlUmVzdWx0LCBwYXlsb2FkLCBrZXksIGlucHV0LCBpbnN0LCBjdHgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChwcm9tcy5sZW5ndGgpXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbXMpLnRoZW4oKCkgPT4gcGF5bG9hZCk7XG4gICAgICAgIHJldHVybiBwYXlsb2FkO1xuICAgIH07XG59KTtcbmZ1bmN0aW9uIGhhbmRsZU1hcFJlc3VsdChrZXlSZXN1bHQsIHZhbHVlUmVzdWx0LCBmaW5hbCwga2V5LCBpbnB1dCwgaW5zdCwgY3R4KSB7XG4gICAgaWYgKGtleVJlc3VsdC5pc3N1ZXMubGVuZ3RoKSB7XG4gICAgICAgIGlmICh1dGlsLnByb3BlcnR5S2V5VHlwZXMuaGFzKHR5cGVvZiBrZXkpKSB7XG4gICAgICAgICAgICBmaW5hbC5pc3N1ZXMucHVzaCguLi51dGlsLnByZWZpeElzc3VlcyhrZXksIGtleVJlc3VsdC5pc3N1ZXMpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGZpbmFsLmlzc3Vlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBjb2RlOiBcImludmFsaWRfa2V5XCIsXG4gICAgICAgICAgICAgICAgb3JpZ2luOiBcIm1hcFwiLFxuICAgICAgICAgICAgICAgIGlucHV0LFxuICAgICAgICAgICAgICAgIGluc3QsXG4gICAgICAgICAgICAgICAgaXNzdWVzOiBrZXlSZXN1bHQuaXNzdWVzLm1hcCgoaXNzKSA9PiB1dGlsLmZpbmFsaXplSXNzdWUoaXNzLCBjdHgsIGNvcmUuY29uZmlnKCkpKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmICh2YWx1ZVJlc3VsdC5pc3N1ZXMubGVuZ3RoKSB7XG4gICAgICAgIGlmICh1dGlsLnByb3BlcnR5S2V5VHlwZXMuaGFzKHR5cGVvZiBrZXkpKSB7XG4gICAgICAgICAgICBmaW5hbC5pc3N1ZXMucHVzaCguLi51dGlsLnByZWZpeElzc3VlcyhrZXksIHZhbHVlUmVzdWx0Lmlzc3VlcykpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZmluYWwuaXNzdWVzLnB1c2goe1xuICAgICAgICAgICAgICAgIG9yaWdpbjogXCJtYXBcIixcbiAgICAgICAgICAgICAgICBjb2RlOiBcImludmFsaWRfZWxlbWVudFwiLFxuICAgICAgICAgICAgICAgIGlucHV0LFxuICAgICAgICAgICAgICAgIGluc3QsXG4gICAgICAgICAgICAgICAga2V5OiBrZXksXG4gICAgICAgICAgICAgICAgaXNzdWVzOiB2YWx1ZVJlc3VsdC5pc3N1ZXMubWFwKChpc3MpID0+IHV0aWwuZmluYWxpemVJc3N1ZShpc3MsIGN0eCwgY29yZS5jb25maWcoKSkpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZmluYWwudmFsdWUuc2V0KGtleVJlc3VsdC52YWx1ZSwgdmFsdWVSZXN1bHQudmFsdWUpO1xufVxuZXhwb3J0IGNvbnN0ICRab2RTZXQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZFNldFwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgJFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBjdHgpID0+IHtcbiAgICAgICAgY29uc3QgaW5wdXQgPSBwYXlsb2FkLnZhbHVlO1xuICAgICAgICBpZiAoIShpbnB1dCBpbnN0YW5jZW9mIFNldCkpIHtcbiAgICAgICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xuICAgICAgICAgICAgICAgIGlucHV0LFxuICAgICAgICAgICAgICAgIGluc3QsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFwic2V0XCIsXG4gICAgICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX3R5cGVcIixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHBheWxvYWQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcHJvbXMgPSBbXTtcbiAgICAgICAgcGF5bG9hZC52YWx1ZSA9IG5ldyBTZXQoKTtcbiAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIGlucHV0KSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBkZWYudmFsdWVUeXBlLl96b2QucnVuKHsgdmFsdWU6IGl0ZW0sIGlzc3VlczogW10gfSwgY3R4KTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgICAgICAgICAgcHJvbXMucHVzaChyZXN1bHQudGhlbigocmVzdWx0KSA9PiBoYW5kbGVTZXRSZXN1bHQocmVzdWx0LCBwYXlsb2FkKSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGhhbmRsZVNldFJlc3VsdChyZXN1bHQsIHBheWxvYWQpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwcm9tcy5sZW5ndGgpXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbXMpLnRoZW4oKCkgPT4gcGF5bG9hZCk7XG4gICAgICAgIHJldHVybiBwYXlsb2FkO1xuICAgIH07XG59KTtcbmZ1bmN0aW9uIGhhbmRsZVNldFJlc3VsdChyZXN1bHQsIGZpbmFsKSB7XG4gICAgaWYgKHJlc3VsdC5pc3N1ZXMubGVuZ3RoKSB7XG4gICAgICAgIGZpbmFsLmlzc3Vlcy5wdXNoKC4uLnJlc3VsdC5pc3N1ZXMpO1xuICAgIH1cbiAgICBmaW5hbC52YWx1ZS5hZGQocmVzdWx0LnZhbHVlKTtcbn1cbmV4cG9ydCBjb25zdCAkWm9kRW51bSA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kRW51bVwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgJFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xuICAgIGNvbnN0IHZhbHVlcyA9IHV0aWwuZ2V0RW51bVZhbHVlcyhkZWYuZW50cmllcyk7XG4gICAgY29uc3QgdmFsdWVzU2V0ID0gbmV3IFNldCh2YWx1ZXMpO1xuICAgIGluc3QuX3pvZC52YWx1ZXMgPSB2YWx1ZXNTZXQ7XG4gICAgaW5zdC5fem9kLnBhdHRlcm4gPSBuZXcgUmVnRXhwKGBeKCR7dmFsdWVzXG4gICAgICAgIC5maWx0ZXIoKGspID0+IHV0aWwucHJvcGVydHlLZXlUeXBlcy5oYXModHlwZW9mIGspKVxuICAgICAgICAubWFwKChvKSA9PiAodHlwZW9mIG8gPT09IFwic3RyaW5nXCIgPyB1dGlsLmVzY2FwZVJlZ2V4KG8pIDogby50b1N0cmluZygpKSlcbiAgICAgICAgLmpvaW4oXCJ8XCIpfSkkYCk7XG4gICAgaW5zdC5fem9kLnBhcnNlID0gKHBheWxvYWQsIF9jdHgpID0+IHtcbiAgICAgICAgY29uc3QgaW5wdXQgPSBwYXlsb2FkLnZhbHVlO1xuICAgICAgICBpZiAodmFsdWVzU2V0LmhhcyhpbnB1dCkpIHtcbiAgICAgICAgICAgIHJldHVybiBwYXlsb2FkO1xuICAgICAgICB9XG4gICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xuICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX3ZhbHVlXCIsXG4gICAgICAgICAgICB2YWx1ZXMsXG4gICAgICAgICAgICBpbnB1dCxcbiAgICAgICAgICAgIGluc3QsXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcGF5bG9hZDtcbiAgICB9O1xufSk7XG5leHBvcnQgY29uc3QgJFpvZExpdGVyYWwgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZExpdGVyYWxcIiwgKGluc3QsIGRlZikgPT4ge1xuICAgICRab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcbiAgICBpZiAoZGVmLnZhbHVlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGNyZWF0ZSBsaXRlcmFsIHNjaGVtYSB3aXRoIG5vIHZhbGlkIHZhbHVlc1wiKTtcbiAgICB9XG4gICAgY29uc3QgdmFsdWVzID0gbmV3IFNldChkZWYudmFsdWVzKTtcbiAgICBpbnN0Ll96b2QudmFsdWVzID0gdmFsdWVzO1xuICAgIGluc3QuX3pvZC5wYXR0ZXJuID0gbmV3IFJlZ0V4cChgXigke2RlZi52YWx1ZXNcbiAgICAgICAgLm1hcCgobykgPT4gKHR5cGVvZiBvID09PSBcInN0cmluZ1wiID8gdXRpbC5lc2NhcGVSZWdleChvKSA6IG8gPyB1dGlsLmVzY2FwZVJlZ2V4KG8udG9TdHJpbmcoKSkgOiBTdHJpbmcobykpKVxuICAgICAgICAuam9pbihcInxcIil9KSRgKTtcbiAgICBpbnN0Ll96b2QucGFyc2UgPSAocGF5bG9hZCwgX2N0eCkgPT4ge1xuICAgICAgICBjb25zdCBpbnB1dCA9IHBheWxvYWQudmFsdWU7XG4gICAgICAgIGlmICh2YWx1ZXMuaGFzKGlucHV0KSkge1xuICAgICAgICAgICAgcmV0dXJuIHBheWxvYWQ7XG4gICAgICAgIH1cbiAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XG4gICAgICAgICAgICBjb2RlOiBcImludmFsaWRfdmFsdWVcIixcbiAgICAgICAgICAgIHZhbHVlczogZGVmLnZhbHVlcyxcbiAgICAgICAgICAgIGlucHV0LFxuICAgICAgICAgICAgaW5zdCxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBwYXlsb2FkO1xuICAgIH07XG59KTtcbmV4cG9ydCBjb25zdCAkWm9kRmlsZSA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kRmlsZVwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgJFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBfY3R4KSA9PiB7XG4gICAgICAgIGNvbnN0IGlucHV0ID0gcGF5bG9hZC52YWx1ZTtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBGaWxlKVxuICAgICAgICAgICAgcmV0dXJuIHBheWxvYWQ7XG4gICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xuICAgICAgICAgICAgZXhwZWN0ZWQ6IFwiZmlsZVwiLFxuICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX3R5cGVcIixcbiAgICAgICAgICAgIGlucHV0LFxuICAgICAgICAgICAgaW5zdCxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBwYXlsb2FkO1xuICAgIH07XG59KTtcbmV4cG9ydCBjb25zdCAkWm9kVHJhbnNmb3JtID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RUcmFuc2Zvcm1cIiwgKGluc3QsIGRlZikgPT4ge1xuICAgICRab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcbiAgICBpbnN0Ll96b2Qub3B0aW4gPSBcIm9wdGlvbmFsXCI7XG4gICAgaW5zdC5fem9kLnBhcnNlID0gKHBheWxvYWQsIGN0eCkgPT4ge1xuICAgICAgICBpZiAoY3R4LmRpcmVjdGlvbiA9PT0gXCJiYWNrd2FyZFwiKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgY29yZS4kWm9kRW5jb2RlRXJyb3IoaW5zdC5jb25zdHJ1Y3Rvci5uYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBfb3V0ID0gZGVmLnRyYW5zZm9ybShwYXlsb2FkLnZhbHVlLCBwYXlsb2FkKTtcbiAgICAgICAgaWYgKGN0eC5hc3luYykge1xuICAgICAgICAgICAgY29uc3Qgb3V0cHV0ID0gX291dCBpbnN0YW5jZW9mIFByb21pc2UgPyBfb3V0IDogUHJvbWlzZS5yZXNvbHZlKF9vdXQpO1xuICAgICAgICAgICAgcmV0dXJuIG91dHB1dC50aGVuKChvdXRwdXQpID0+IHtcbiAgICAgICAgICAgICAgICBwYXlsb2FkLnZhbHVlID0gb3V0cHV0O1xuICAgICAgICAgICAgICAgIHBheWxvYWQuZmFsbGJhY2sgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBwYXlsb2FkO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKF9vdXQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgY29yZS4kWm9kQXN5bmNFcnJvcigpO1xuICAgICAgICB9XG4gICAgICAgIHBheWxvYWQudmFsdWUgPSBfb3V0O1xuICAgICAgICBwYXlsb2FkLmZhbGxiYWNrID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHBheWxvYWQ7XG4gICAgfTtcbn0pO1xuZnVuY3Rpb24gaGFuZGxlT3B0aW9uYWxSZXN1bHQocmVzdWx0LCBpbnB1dCkge1xuICAgIGlmIChpbnB1dCA9PT0gdW5kZWZpbmVkICYmIChyZXN1bHQuaXNzdWVzLmxlbmd0aCB8fCByZXN1bHQuZmFsbGJhY2spKSB7XG4gICAgICAgIHJldHVybiB7IGlzc3VlczogW10sIHZhbHVlOiB1bmRlZmluZWQgfTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbmV4cG9ydCBjb25zdCAkWm9kT3B0aW9uYWwgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZE9wdGlvbmFsXCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICAkWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XG4gICAgaW5zdC5fem9kLm9wdGluID0gXCJvcHRpb25hbFwiO1xuICAgIGluc3QuX3pvZC5vcHRvdXQgPSBcIm9wdGlvbmFsXCI7XG4gICAgdXRpbC5kZWZpbmVMYXp5KGluc3QuX3pvZCwgXCJ2YWx1ZXNcIiwgKCkgPT4ge1xuICAgICAgICByZXR1cm4gZGVmLmlubmVyVHlwZS5fem9kLnZhbHVlcyA/IG5ldyBTZXQoWy4uLmRlZi5pbm5lclR5cGUuX3pvZC52YWx1ZXMsIHVuZGVmaW5lZF0pIDogdW5kZWZpbmVkO1xuICAgIH0pO1xuICAgIHV0aWwuZGVmaW5lTGF6eShpbnN0Ll96b2QsIFwicGF0dGVyblwiLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhdHRlcm4gPSBkZWYuaW5uZXJUeXBlLl96b2QucGF0dGVybjtcbiAgICAgICAgcmV0dXJuIHBhdHRlcm4gPyBuZXcgUmVnRXhwKGBeKCR7dXRpbC5jbGVhblJlZ2V4KHBhdHRlcm4uc291cmNlKX0pPyRgKSA6IHVuZGVmaW5lZDtcbiAgICB9KTtcbiAgICBpbnN0Ll96b2QucGFyc2UgPSAocGF5bG9hZCwgY3R4KSA9PiB7XG4gICAgICAgIGlmIChkZWYuaW5uZXJUeXBlLl96b2Qub3B0aW4gPT09IFwib3B0aW9uYWxcIikge1xuICAgICAgICAgICAgY29uc3QgaW5wdXQgPSBwYXlsb2FkLnZhbHVlO1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gZGVmLmlubmVyVHlwZS5fem9kLnJ1bihwYXlsb2FkLCBjdHgpO1xuICAgICAgICAgICAgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdC50aGVuKChyKSA9PiBoYW5kbGVPcHRpb25hbFJlc3VsdChyLCBpbnB1dCkpO1xuICAgICAgICAgICAgcmV0dXJuIGhhbmRsZU9wdGlvbmFsUmVzdWx0KHJlc3VsdCwgaW5wdXQpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwYXlsb2FkLnZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBwYXlsb2FkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZWYuaW5uZXJUeXBlLl96b2QucnVuKHBheWxvYWQsIGN0eCk7XG4gICAgfTtcbn0pO1xuZXhwb3J0IGNvbnN0ICRab2RFeGFjdE9wdGlvbmFsID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RFeGFjdE9wdGlvbmFsXCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICAvLyBDYWxsIHBhcmVudCBpbml0IC0gaW5oZXJpdHMgb3B0aW4vb3B0b3V0ID0gXCJvcHRpb25hbFwiXG4gICAgJFpvZE9wdGlvbmFsLmluaXQoaW5zdCwgZGVmKTtcbiAgICAvLyBPdmVycmlkZSB2YWx1ZXMvcGF0dGVybiB0byBOT1QgYWRkIHVuZGVmaW5lZFxuICAgIHV0aWwuZGVmaW5lTGF6eShpbnN0Ll96b2QsIFwidmFsdWVzXCIsICgpID0+IGRlZi5pbm5lclR5cGUuX3pvZC52YWx1ZXMpO1xuICAgIHV0aWwuZGVmaW5lTGF6eShpbnN0Ll96b2QsIFwicGF0dGVyblwiLCAoKSA9PiBkZWYuaW5uZXJUeXBlLl96b2QucGF0dGVybik7XG4gICAgLy8gT3ZlcnJpZGUgcGFyc2UgdG8ganVzdCBkZWxlZ2F0ZSAobm8gdW5kZWZpbmVkIGhhbmRsaW5nKVxuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBjdHgpID0+IHtcbiAgICAgICAgcmV0dXJuIGRlZi5pbm5lclR5cGUuX3pvZC5ydW4ocGF5bG9hZCwgY3R4KTtcbiAgICB9O1xufSk7XG5leHBvcnQgY29uc3QgJFpvZE51bGxhYmxlID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2ROdWxsYWJsZVwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgJFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xuICAgIHV0aWwuZGVmaW5lTGF6eShpbnN0Ll96b2QsIFwib3B0aW5cIiwgKCkgPT4gZGVmLmlubmVyVHlwZS5fem9kLm9wdGluKTtcbiAgICB1dGlsLmRlZmluZUxhenkoaW5zdC5fem9kLCBcIm9wdG91dFwiLCAoKSA9PiBkZWYuaW5uZXJUeXBlLl96b2Qub3B0b3V0KTtcbiAgICB1dGlsLmRlZmluZUxhenkoaW5zdC5fem9kLCBcInBhdHRlcm5cIiwgKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXR0ZXJuID0gZGVmLmlubmVyVHlwZS5fem9kLnBhdHRlcm47XG4gICAgICAgIHJldHVybiBwYXR0ZXJuID8gbmV3IFJlZ0V4cChgXigke3V0aWwuY2xlYW5SZWdleChwYXR0ZXJuLnNvdXJjZSl9fG51bGwpJGApIDogdW5kZWZpbmVkO1xuICAgIH0pO1xuICAgIHV0aWwuZGVmaW5lTGF6eShpbnN0Ll96b2QsIFwidmFsdWVzXCIsICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGRlZi5pbm5lclR5cGUuX3pvZC52YWx1ZXMgPyBuZXcgU2V0KFsuLi5kZWYuaW5uZXJUeXBlLl96b2QudmFsdWVzLCBudWxsXSkgOiB1bmRlZmluZWQ7XG4gICAgfSk7XG4gICAgaW5zdC5fem9kLnBhcnNlID0gKHBheWxvYWQsIGN0eCkgPT4ge1xuICAgICAgICAvLyBGb3J3YXJkIGRpcmVjdGlvbiAoZGVjb2RlKTogYWxsb3cgbnVsbCB0byBwYXNzIHRocm91Z2hcbiAgICAgICAgaWYgKHBheWxvYWQudmFsdWUgPT09IG51bGwpXG4gICAgICAgICAgICByZXR1cm4gcGF5bG9hZDtcbiAgICAgICAgcmV0dXJuIGRlZi5pbm5lclR5cGUuX3pvZC5ydW4ocGF5bG9hZCwgY3R4KTtcbiAgICB9O1xufSk7XG5leHBvcnQgY29uc3QgJFpvZERlZmF1bHQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZERlZmF1bHRcIiwgKGluc3QsIGRlZikgPT4ge1xuICAgICRab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcbiAgICAvLyBpbnN0Ll96b2QucWluID0gXCJ0cnVlXCI7XG4gICAgaW5zdC5fem9kLm9wdGluID0gXCJvcHRpb25hbFwiO1xuICAgIHV0aWwuZGVmaW5lTGF6eShpbnN0Ll96b2QsIFwidmFsdWVzXCIsICgpID0+IGRlZi5pbm5lclR5cGUuX3pvZC52YWx1ZXMpO1xuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBjdHgpID0+IHtcbiAgICAgICAgaWYgKGN0eC5kaXJlY3Rpb24gPT09IFwiYmFja3dhcmRcIikge1xuICAgICAgICAgICAgcmV0dXJuIGRlZi5pbm5lclR5cGUuX3pvZC5ydW4ocGF5bG9hZCwgY3R4KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBGb3J3YXJkIGRpcmVjdGlvbiAoZGVjb2RlKTogYXBwbHkgZGVmYXVsdHMgZm9yIHVuZGVmaW5lZCBpbnB1dFxuICAgICAgICBpZiAocGF5bG9hZC52YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBwYXlsb2FkLnZhbHVlID0gZGVmLmRlZmF1bHRWYWx1ZTtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogJFpvZERlZmF1bHQgcmV0dXJucyB0aGUgZGVmYXVsdCB2YWx1ZSBpbW1lZGlhdGVseSBpbiBmb3J3YXJkIGRpcmVjdGlvbi5cbiAgICAgICAgICAgICAqIEl0IGRvZXNuJ3QgcGFzcyB0aGUgZGVmYXVsdCB2YWx1ZSBpbnRvIHRoZSB2YWxpZGF0b3IgKFwicHJlZmF1bHRcIikuIFRoZXJlJ3Mgbm8gcmVhc29uIHRvIHBhc3MgdGhlIGRlZmF1bHQgdmFsdWUgdGhyb3VnaCB2YWxpZGF0aW9uLiBUaGUgdmFsaWRpdHkgb2YgdGhlIGRlZmF1bHQgaXMgZW5mb3JjZWQgYnkgVHlwZVNjcmlwdCBzdGF0aWNhbGx5LiBPdGhlcndpc2UsIGl0J3MgdGhlIHJlc3BvbnNpYmlsaXR5IG9mIHRoZSB1c2VyIHRvIGVuc3VyZSB0aGUgZGVmYXVsdCBpcyB2YWxpZC4gSW4gdGhlIGNhc2Ugb2YgcGlwZXMgd2l0aCBkaXZlcmdlbnQgaW4vb3V0IHR5cGVzLCB5b3UgY2FuIHNwZWNpZnkgdGhlIGRlZmF1bHQgb24gdGhlIGBpbmAgc2NoZW1hIG9mIHlvdXIgWm9kUGlwZSB0byBzZXQgYSBcInByZWZhdWx0XCIgZm9yIHRoZSBwaXBlLiAgICovXG4gICAgICAgICAgICByZXR1cm4gcGF5bG9hZDtcbiAgICAgICAgfVxuICAgICAgICAvLyBGb3J3YXJkIGRpcmVjdGlvbjogY29udGludWUgd2l0aCBkZWZhdWx0IGhhbmRsaW5nXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGRlZi5pbm5lclR5cGUuX3pvZC5ydW4ocGF5bG9hZCwgY3R4KTtcbiAgICAgICAgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQudGhlbigocmVzdWx0KSA9PiBoYW5kbGVEZWZhdWx0UmVzdWx0KHJlc3VsdCwgZGVmKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGhhbmRsZURlZmF1bHRSZXN1bHQocmVzdWx0LCBkZWYpO1xuICAgIH07XG59KTtcbmZ1bmN0aW9uIGhhbmRsZURlZmF1bHRSZXN1bHQocGF5bG9hZCwgZGVmKSB7XG4gICAgaWYgKHBheWxvYWQudmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBwYXlsb2FkLnZhbHVlID0gZGVmLmRlZmF1bHRWYWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHBheWxvYWQ7XG59XG5leHBvcnQgY29uc3QgJFpvZFByZWZhdWx0ID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RQcmVmYXVsdFwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgJFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xuICAgIGluc3QuX3pvZC5vcHRpbiA9IFwib3B0aW9uYWxcIjtcbiAgICB1dGlsLmRlZmluZUxhenkoaW5zdC5fem9kLCBcInZhbHVlc1wiLCAoKSA9PiBkZWYuaW5uZXJUeXBlLl96b2QudmFsdWVzKTtcbiAgICBpbnN0Ll96b2QucGFyc2UgPSAocGF5bG9hZCwgY3R4KSA9PiB7XG4gICAgICAgIGlmIChjdHguZGlyZWN0aW9uID09PSBcImJhY2t3YXJkXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBkZWYuaW5uZXJUeXBlLl96b2QucnVuKHBheWxvYWQsIGN0eCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gRm9yd2FyZCBkaXJlY3Rpb24gKGRlY29kZSk6IGFwcGx5IHByZWZhdWx0IGZvciB1bmRlZmluZWQgaW5wdXRcbiAgICAgICAgaWYgKHBheWxvYWQudmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcGF5bG9hZC52YWx1ZSA9IGRlZi5kZWZhdWx0VmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRlZi5pbm5lclR5cGUuX3pvZC5ydW4ocGF5bG9hZCwgY3R4KTtcbiAgICB9O1xufSk7XG5leHBvcnQgY29uc3QgJFpvZE5vbk9wdGlvbmFsID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2ROb25PcHRpb25hbFwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgJFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xuICAgIHV0aWwuZGVmaW5lTGF6eShpbnN0Ll96b2QsIFwidmFsdWVzXCIsICgpID0+IHtcbiAgICAgICAgY29uc3QgdiA9IGRlZi5pbm5lclR5cGUuX3pvZC52YWx1ZXM7XG4gICAgICAgIHJldHVybiB2ID8gbmV3IFNldChbLi4udl0uZmlsdGVyKCh4KSA9PiB4ICE9PSB1bmRlZmluZWQpKSA6IHVuZGVmaW5lZDtcbiAgICB9KTtcbiAgICBpbnN0Ll96b2QucGFyc2UgPSAocGF5bG9hZCwgY3R4KSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGRlZi5pbm5lclR5cGUuX3pvZC5ydW4ocGF5bG9hZCwgY3R4KTtcbiAgICAgICAgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQudGhlbigocmVzdWx0KSA9PiBoYW5kbGVOb25PcHRpb25hbFJlc3VsdChyZXN1bHQsIGluc3QpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaGFuZGxlTm9uT3B0aW9uYWxSZXN1bHQocmVzdWx0LCBpbnN0KTtcbiAgICB9O1xufSk7XG5mdW5jdGlvbiBoYW5kbGVOb25PcHRpb25hbFJlc3VsdChwYXlsb2FkLCBpbnN0KSB7XG4gICAgaWYgKCFwYXlsb2FkLmlzc3Vlcy5sZW5ndGggJiYgcGF5bG9hZC52YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xuICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX3R5cGVcIixcbiAgICAgICAgICAgIGV4cGVjdGVkOiBcIm5vbm9wdGlvbmFsXCIsXG4gICAgICAgICAgICBpbnB1dDogcGF5bG9hZC52YWx1ZSxcbiAgICAgICAgICAgIGluc3QsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcGF5bG9hZDtcbn1cbmV4cG9ydCBjb25zdCAkWm9kU3VjY2VzcyA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kU3VjY2Vzc1wiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgJFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBjdHgpID0+IHtcbiAgICAgICAgaWYgKGN0eC5kaXJlY3Rpb24gPT09IFwiYmFja3dhcmRcIikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IGNvcmUuJFpvZEVuY29kZUVycm9yKFwiWm9kU3VjY2Vzc1wiKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZXN1bHQgPSBkZWYuaW5uZXJUeXBlLl96b2QucnVuKHBheWxvYWQsIGN0eCk7XG4gICAgICAgIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0LnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgIHBheWxvYWQudmFsdWUgPSByZXN1bHQuaXNzdWVzLmxlbmd0aCA9PT0gMDtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGF5bG9hZDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHBheWxvYWQudmFsdWUgPSByZXN1bHQuaXNzdWVzLmxlbmd0aCA9PT0gMDtcbiAgICAgICAgcmV0dXJuIHBheWxvYWQ7XG4gICAgfTtcbn0pO1xuZXhwb3J0IGNvbnN0ICRab2RDYXRjaCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kQ2F0Y2hcIiwgKGluc3QsIGRlZikgPT4ge1xuICAgICRab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcbiAgICBpbnN0Ll96b2Qub3B0aW4gPSBcIm9wdGlvbmFsXCI7XG4gICAgdXRpbC5kZWZpbmVMYXp5KGluc3QuX3pvZCwgXCJvcHRvdXRcIiwgKCkgPT4gZGVmLmlubmVyVHlwZS5fem9kLm9wdG91dCk7XG4gICAgdXRpbC5kZWZpbmVMYXp5KGluc3QuX3pvZCwgXCJ2YWx1ZXNcIiwgKCkgPT4gZGVmLmlubmVyVHlwZS5fem9kLnZhbHVlcyk7XG4gICAgaW5zdC5fem9kLnBhcnNlID0gKHBheWxvYWQsIGN0eCkgPT4ge1xuICAgICAgICBpZiAoY3R4LmRpcmVjdGlvbiA9PT0gXCJiYWNrd2FyZFwiKSB7XG4gICAgICAgICAgICByZXR1cm4gZGVmLmlubmVyVHlwZS5fem9kLnJ1bihwYXlsb2FkLCBjdHgpO1xuICAgICAgICB9XG4gICAgICAgIC8vIEZvcndhcmQgZGlyZWN0aW9uIChkZWNvZGUpOiBhcHBseSBjYXRjaCBsb2dpY1xuICAgICAgICBjb25zdCByZXN1bHQgPSBkZWYuaW5uZXJUeXBlLl96b2QucnVuKHBheWxvYWQsIGN0eCk7XG4gICAgICAgIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0LnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgIHBheWxvYWQudmFsdWUgPSByZXN1bHQudmFsdWU7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5pc3N1ZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHBheWxvYWQudmFsdWUgPSBkZWYuY2F0Y2hWYWx1ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5wYXlsb2FkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc3N1ZXM6IHJlc3VsdC5pc3N1ZXMubWFwKChpc3MpID0+IHV0aWwuZmluYWxpemVJc3N1ZShpc3MsIGN0eCwgY29yZS5jb25maWcoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0OiBwYXlsb2FkLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcGF5bG9hZC5pc3N1ZXMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgcGF5bG9hZC5mYWxsYmFjayA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBwYXlsb2FkO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcGF5bG9hZC52YWx1ZSA9IHJlc3VsdC52YWx1ZTtcbiAgICAgICAgaWYgKHJlc3VsdC5pc3N1ZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBwYXlsb2FkLnZhbHVlID0gZGVmLmNhdGNoVmFsdWUoe1xuICAgICAgICAgICAgICAgIC4uLnBheWxvYWQsXG4gICAgICAgICAgICAgICAgZXJyb3I6IHtcbiAgICAgICAgICAgICAgICAgICAgaXNzdWVzOiByZXN1bHQuaXNzdWVzLm1hcCgoaXNzKSA9PiB1dGlsLmZpbmFsaXplSXNzdWUoaXNzLCBjdHgsIGNvcmUuY29uZmlnKCkpKSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGlucHV0OiBwYXlsb2FkLnZhbHVlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBwYXlsb2FkLmlzc3VlcyA9IFtdO1xuICAgICAgICAgICAgcGF5bG9hZC5mYWxsYmFjayA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBheWxvYWQ7XG4gICAgfTtcbn0pO1xuZXhwb3J0IGNvbnN0ICRab2ROYU4gPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZE5hTlwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgJFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBfY3R4KSA9PiB7XG4gICAgICAgIGlmICh0eXBlb2YgcGF5bG9hZC52YWx1ZSAhPT0gXCJudW1iZXJcIiB8fCAhTnVtYmVyLmlzTmFOKHBheWxvYWQudmFsdWUpKSB7XG4gICAgICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBpbnB1dDogcGF5bG9hZC52YWx1ZSxcbiAgICAgICAgICAgICAgICBpbnN0LFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBcIm5hblwiLFxuICAgICAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF90eXBlXCIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBwYXlsb2FkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwYXlsb2FkO1xuICAgIH07XG59KTtcbmV4cG9ydCBjb25zdCAkWm9kUGlwZSA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kUGlwZVwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgJFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xuICAgIHV0aWwuZGVmaW5lTGF6eShpbnN0Ll96b2QsIFwidmFsdWVzXCIsICgpID0+IGRlZi5pbi5fem9kLnZhbHVlcyk7XG4gICAgdXRpbC5kZWZpbmVMYXp5KGluc3QuX3pvZCwgXCJvcHRpblwiLCAoKSA9PiBkZWYuaW4uX3pvZC5vcHRpbik7XG4gICAgdXRpbC5kZWZpbmVMYXp5KGluc3QuX3pvZCwgXCJvcHRvdXRcIiwgKCkgPT4gZGVmLm91dC5fem9kLm9wdG91dCk7XG4gICAgdXRpbC5kZWZpbmVMYXp5KGluc3QuX3pvZCwgXCJwcm9wVmFsdWVzXCIsICgpID0+IGRlZi5pbi5fem9kLnByb3BWYWx1ZXMpO1xuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBjdHgpID0+IHtcbiAgICAgICAgaWYgKGN0eC5kaXJlY3Rpb24gPT09IFwiYmFja3dhcmRcIikge1xuICAgICAgICAgICAgY29uc3QgcmlnaHQgPSBkZWYub3V0Ll96b2QucnVuKHBheWxvYWQsIGN0eCk7XG4gICAgICAgICAgICBpZiAocmlnaHQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJpZ2h0LnRoZW4oKHJpZ2h0KSA9PiBoYW5kbGVQaXBlUmVzdWx0KHJpZ2h0LCBkZWYuaW4sIGN0eCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGhhbmRsZVBpcGVSZXN1bHQocmlnaHQsIGRlZi5pbiwgY3R4KTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBsZWZ0ID0gZGVmLmluLl96b2QucnVuKHBheWxvYWQsIGN0eCk7XG4gICAgICAgIGlmIChsZWZ0IGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgICAgICAgcmV0dXJuIGxlZnQudGhlbigobGVmdCkgPT4gaGFuZGxlUGlwZVJlc3VsdChsZWZ0LCBkZWYub3V0LCBjdHgpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaGFuZGxlUGlwZVJlc3VsdChsZWZ0LCBkZWYub3V0LCBjdHgpO1xuICAgIH07XG59KTtcbmZ1bmN0aW9uIGhhbmRsZVBpcGVSZXN1bHQobGVmdCwgbmV4dCwgY3R4KSB7XG4gICAgaWYgKGxlZnQuaXNzdWVzLmxlbmd0aCkge1xuICAgICAgICAvLyBwcmV2ZW50IGZ1cnRoZXIgY2hlY2tzXG4gICAgICAgIGxlZnQuYWJvcnRlZCA9IHRydWU7XG4gICAgICAgIHJldHVybiBsZWZ0O1xuICAgIH1cbiAgICByZXR1cm4gbmV4dC5fem9kLnJ1bih7IHZhbHVlOiBsZWZ0LnZhbHVlLCBpc3N1ZXM6IGxlZnQuaXNzdWVzLCBmYWxsYmFjazogbGVmdC5mYWxsYmFjayB9LCBjdHgpO1xufVxuZXhwb3J0IGNvbnN0ICRab2RDb2RlYyA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kQ29kZWNcIiwgKGluc3QsIGRlZikgPT4ge1xuICAgICRab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcbiAgICB1dGlsLmRlZmluZUxhenkoaW5zdC5fem9kLCBcInZhbHVlc1wiLCAoKSA9PiBkZWYuaW4uX3pvZC52YWx1ZXMpO1xuICAgIHV0aWwuZGVmaW5lTGF6eShpbnN0Ll96b2QsIFwib3B0aW5cIiwgKCkgPT4gZGVmLmluLl96b2Qub3B0aW4pO1xuICAgIHV0aWwuZGVmaW5lTGF6eShpbnN0Ll96b2QsIFwib3B0b3V0XCIsICgpID0+IGRlZi5vdXQuX3pvZC5vcHRvdXQpO1xuICAgIHV0aWwuZGVmaW5lTGF6eShpbnN0Ll96b2QsIFwicHJvcFZhbHVlc1wiLCAoKSA9PiBkZWYuaW4uX3pvZC5wcm9wVmFsdWVzKTtcbiAgICBpbnN0Ll96b2QucGFyc2UgPSAocGF5bG9hZCwgY3R4KSA9PiB7XG4gICAgICAgIGNvbnN0IGRpcmVjdGlvbiA9IGN0eC5kaXJlY3Rpb24gfHwgXCJmb3J3YXJkXCI7XG4gICAgICAgIGlmIChkaXJlY3Rpb24gPT09IFwiZm9yd2FyZFwiKSB7XG4gICAgICAgICAgICBjb25zdCBsZWZ0ID0gZGVmLmluLl96b2QucnVuKHBheWxvYWQsIGN0eCk7XG4gICAgICAgICAgICBpZiAobGVmdCBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGVmdC50aGVuKChsZWZ0KSA9PiBoYW5kbGVDb2RlY0FSZXN1bHQobGVmdCwgZGVmLCBjdHgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBoYW5kbGVDb2RlY0FSZXN1bHQobGVmdCwgZGVmLCBjdHgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgcmlnaHQgPSBkZWYub3V0Ll96b2QucnVuKHBheWxvYWQsIGN0eCk7XG4gICAgICAgICAgICBpZiAocmlnaHQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJpZ2h0LnRoZW4oKHJpZ2h0KSA9PiBoYW5kbGVDb2RlY0FSZXN1bHQocmlnaHQsIGRlZiwgY3R4KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlQ29kZWNBUmVzdWx0KHJpZ2h0LCBkZWYsIGN0eCk7XG4gICAgICAgIH1cbiAgICB9O1xufSk7XG5mdW5jdGlvbiBoYW5kbGVDb2RlY0FSZXN1bHQocmVzdWx0LCBkZWYsIGN0eCkge1xuICAgIGlmIChyZXN1bHQuaXNzdWVzLmxlbmd0aCkge1xuICAgICAgICAvLyBwcmV2ZW50IGZ1cnRoZXIgY2hlY2tzXG4gICAgICAgIHJlc3VsdC5hYm9ydGVkID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgY29uc3QgZGlyZWN0aW9uID0gY3R4LmRpcmVjdGlvbiB8fCBcImZvcndhcmRcIjtcbiAgICBpZiAoZGlyZWN0aW9uID09PSBcImZvcndhcmRcIikge1xuICAgICAgICBjb25zdCB0cmFuc2Zvcm1lZCA9IGRlZi50cmFuc2Zvcm0ocmVzdWx0LnZhbHVlLCByZXN1bHQpO1xuICAgICAgICBpZiAodHJhbnNmb3JtZWQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJhbnNmb3JtZWQudGhlbigodmFsdWUpID0+IGhhbmRsZUNvZGVjVHhSZXN1bHQocmVzdWx0LCB2YWx1ZSwgZGVmLm91dCwgY3R4KSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGhhbmRsZUNvZGVjVHhSZXN1bHQocmVzdWx0LCB0cmFuc2Zvcm1lZCwgZGVmLm91dCwgY3R4KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNvbnN0IHRyYW5zZm9ybWVkID0gZGVmLnJldmVyc2VUcmFuc2Zvcm0ocmVzdWx0LnZhbHVlLCByZXN1bHQpO1xuICAgICAgICBpZiAodHJhbnNmb3JtZWQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJhbnNmb3JtZWQudGhlbigodmFsdWUpID0+IGhhbmRsZUNvZGVjVHhSZXN1bHQocmVzdWx0LCB2YWx1ZSwgZGVmLmluLCBjdHgpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaGFuZGxlQ29kZWNUeFJlc3VsdChyZXN1bHQsIHRyYW5zZm9ybWVkLCBkZWYuaW4sIGN0eCk7XG4gICAgfVxufVxuZnVuY3Rpb24gaGFuZGxlQ29kZWNUeFJlc3VsdChsZWZ0LCB2YWx1ZSwgbmV4dFNjaGVtYSwgY3R4KSB7XG4gICAgLy8gQ2hlY2sgaWYgdHJhbnNmb3JtIGFkZGVkIGFueSBpc3N1ZXNcbiAgICBpZiAobGVmdC5pc3N1ZXMubGVuZ3RoKSB7XG4gICAgICAgIGxlZnQuYWJvcnRlZCA9IHRydWU7XG4gICAgICAgIHJldHVybiBsZWZ0O1xuICAgIH1cbiAgICByZXR1cm4gbmV4dFNjaGVtYS5fem9kLnJ1bih7IHZhbHVlLCBpc3N1ZXM6IGxlZnQuaXNzdWVzIH0sIGN0eCk7XG59XG5leHBvcnQgY29uc3QgJFpvZFByZXByb2Nlc3MgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZFByZXByb2Nlc3NcIiwgKGluc3QsIGRlZikgPT4ge1xuICAgICRab2RQaXBlLmluaXQoaW5zdCwgZGVmKTtcbn0pO1xuZXhwb3J0IGNvbnN0ICRab2RSZWFkb25seSA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kUmVhZG9ubHlcIiwgKGluc3QsIGRlZikgPT4ge1xuICAgICRab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcbiAgICB1dGlsLmRlZmluZUxhenkoaW5zdC5fem9kLCBcInByb3BWYWx1ZXNcIiwgKCkgPT4gZGVmLmlubmVyVHlwZS5fem9kLnByb3BWYWx1ZXMpO1xuICAgIHV0aWwuZGVmaW5lTGF6eShpbnN0Ll96b2QsIFwidmFsdWVzXCIsICgpID0+IGRlZi5pbm5lclR5cGUuX3pvZC52YWx1ZXMpO1xuICAgIHV0aWwuZGVmaW5lTGF6eShpbnN0Ll96b2QsIFwib3B0aW5cIiwgKCkgPT4gZGVmLmlubmVyVHlwZT8uX3pvZD8ub3B0aW4pO1xuICAgIHV0aWwuZGVmaW5lTGF6eShpbnN0Ll96b2QsIFwib3B0b3V0XCIsICgpID0+IGRlZi5pbm5lclR5cGU/Ll96b2Q/Lm9wdG91dCk7XG4gICAgaW5zdC5fem9kLnBhcnNlID0gKHBheWxvYWQsIGN0eCkgPT4ge1xuICAgICAgICBpZiAoY3R4LmRpcmVjdGlvbiA9PT0gXCJiYWNrd2FyZFwiKSB7XG4gICAgICAgICAgICByZXR1cm4gZGVmLmlubmVyVHlwZS5fem9kLnJ1bihwYXlsb2FkLCBjdHgpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGRlZi5pbm5lclR5cGUuX3pvZC5ydW4ocGF5bG9hZCwgY3R4KTtcbiAgICAgICAgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQudGhlbihoYW5kbGVSZWFkb25seVJlc3VsdCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGhhbmRsZVJlYWRvbmx5UmVzdWx0KHJlc3VsdCk7XG4gICAgfTtcbn0pO1xuZnVuY3Rpb24gaGFuZGxlUmVhZG9ubHlSZXN1bHQocGF5bG9hZCkge1xuICAgIHBheWxvYWQudmFsdWUgPSBPYmplY3QuZnJlZXplKHBheWxvYWQudmFsdWUpO1xuICAgIHJldHVybiBwYXlsb2FkO1xufVxuZXhwb3J0IGNvbnN0ICRab2RUZW1wbGF0ZUxpdGVyYWwgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZFRlbXBsYXRlTGl0ZXJhbFwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgJFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xuICAgIGNvbnN0IHJlZ2V4UGFydHMgPSBbXTtcbiAgICBmb3IgKGNvbnN0IHBhcnQgb2YgZGVmLnBhcnRzKSB7XG4gICAgICAgIGlmICh0eXBlb2YgcGFydCA9PT0gXCJvYmplY3RcIiAmJiBwYXJ0ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAvLyBpcyBab2Qgc2NoZW1hXG4gICAgICAgICAgICBpZiAoIXBhcnQuX3pvZC5wYXR0ZXJuKSB7XG4gICAgICAgICAgICAgICAgLy8gaWYgKCFzb3VyY2UpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHRlbXBsYXRlIGxpdGVyYWwgcGFydCwgbm8gcGF0dGVybiBmb3VuZDogJHtbLi4ucGFydC5fem9kLnRyYWl0c10uc2hpZnQoKX1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHNvdXJjZSA9IHBhcnQuX3pvZC5wYXR0ZXJuIGluc3RhbmNlb2YgUmVnRXhwID8gcGFydC5fem9kLnBhdHRlcm4uc291cmNlIDogcGFydC5fem9kLnBhdHRlcm47XG4gICAgICAgICAgICBpZiAoIXNvdXJjZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdGVtcGxhdGUgbGl0ZXJhbCBwYXJ0OiAke3BhcnQuX3pvZC50cmFpdHN9YCk7XG4gICAgICAgICAgICBjb25zdCBzdGFydCA9IHNvdXJjZS5zdGFydHNXaXRoKFwiXlwiKSA/IDEgOiAwO1xuICAgICAgICAgICAgY29uc3QgZW5kID0gc291cmNlLmVuZHNXaXRoKFwiJFwiKSA/IHNvdXJjZS5sZW5ndGggLSAxIDogc291cmNlLmxlbmd0aDtcbiAgICAgICAgICAgIHJlZ2V4UGFydHMucHVzaChzb3VyY2Uuc2xpY2Uoc3RhcnQsIGVuZCkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHBhcnQgPT09IG51bGwgfHwgdXRpbC5wcmltaXRpdmVUeXBlcy5oYXModHlwZW9mIHBhcnQpKSB7XG4gICAgICAgICAgICByZWdleFBhcnRzLnB1c2godXRpbC5lc2NhcGVSZWdleChgJHtwYXJ0fWApKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB0ZW1wbGF0ZSBsaXRlcmFsIHBhcnQ6ICR7cGFydH1gKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpbnN0Ll96b2QucGF0dGVybiA9IG5ldyBSZWdFeHAoYF4ke3JlZ2V4UGFydHMuam9pbihcIlwiKX0kYCk7XG4gICAgaW5zdC5fem9kLnBhcnNlID0gKHBheWxvYWQsIF9jdHgpID0+IHtcbiAgICAgICAgaWYgKHR5cGVvZiBwYXlsb2FkLnZhbHVlICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBpbnB1dDogcGF5bG9hZC52YWx1ZSxcbiAgICAgICAgICAgICAgICBpbnN0LFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBcInN0cmluZ1wiLFxuICAgICAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF90eXBlXCIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBwYXlsb2FkO1xuICAgICAgICB9XG4gICAgICAgIGluc3QuX3pvZC5wYXR0ZXJuLmxhc3RJbmRleCA9IDA7XG4gICAgICAgIGlmICghaW5zdC5fem9kLnBhdHRlcm4udGVzdChwYXlsb2FkLnZhbHVlKSkge1xuICAgICAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgaW5wdXQ6IHBheWxvYWQudmFsdWUsXG4gICAgICAgICAgICAgICAgaW5zdCxcbiAgICAgICAgICAgICAgICBjb2RlOiBcImludmFsaWRfZm9ybWF0XCIsXG4gICAgICAgICAgICAgICAgZm9ybWF0OiBkZWYuZm9ybWF0ID8/IFwidGVtcGxhdGVfbGl0ZXJhbFwiLFxuICAgICAgICAgICAgICAgIHBhdHRlcm46IGluc3QuX3pvZC5wYXR0ZXJuLnNvdXJjZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHBheWxvYWQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBheWxvYWQ7XG4gICAgfTtcbn0pO1xuZXhwb3J0IGNvbnN0ICRab2RGdW5jdGlvbiA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kRnVuY3Rpb25cIiwgKGluc3QsIGRlZikgPT4ge1xuICAgICRab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcbiAgICBpbnN0Ll9kZWYgPSBkZWY7XG4gICAgaW5zdC5fem9kLmRlZiA9IGRlZjtcbiAgICBpbnN0LmltcGxlbWVudCA9IChmdW5jKSA9PiB7XG4gICAgICAgIGlmICh0eXBlb2YgZnVuYyAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJpbXBsZW1lbnQoKSBtdXN0IGJlIGNhbGxlZCB3aXRoIGEgZnVuY3Rpb25cIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgICAgICAgICBjb25zdCBwYXJzZWRBcmdzID0gaW5zdC5fZGVmLmlucHV0ID8gcGFyc2UoaW5zdC5fZGVmLmlucHV0LCBhcmdzKSA6IGFyZ3M7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBSZWZsZWN0LmFwcGx5KGZ1bmMsIHRoaXMsIHBhcnNlZEFyZ3MpO1xuICAgICAgICAgICAgaWYgKGluc3QuX2RlZi5vdXRwdXQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2UoaW5zdC5fZGVmLm91dHB1dCwgcmVzdWx0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH07XG4gICAgfTtcbiAgICBpbnN0LmltcGxlbWVudEFzeW5jID0gKGZ1bmMpID0+IHtcbiAgICAgICAgaWYgKHR5cGVvZiBmdW5jICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImltcGxlbWVudEFzeW5jKCkgbXVzdCBiZSBjYWxsZWQgd2l0aCBhIGZ1bmN0aW9uXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhc3luYyBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICAgICAgY29uc3QgcGFyc2VkQXJncyA9IGluc3QuX2RlZi5pbnB1dCA/IGF3YWl0IHBhcnNlQXN5bmMoaW5zdC5fZGVmLmlucHV0LCBhcmdzKSA6IGFyZ3M7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBSZWZsZWN0LmFwcGx5KGZ1bmMsIHRoaXMsIHBhcnNlZEFyZ3MpO1xuICAgICAgICAgICAgaWYgKGluc3QuX2RlZi5vdXRwdXQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgcGFyc2VBc3luYyhpbnN0Ll9kZWYub3V0cHV0LCByZXN1bHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfTtcbiAgICB9O1xuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBfY3R4KSA9PiB7XG4gICAgICAgIGlmICh0eXBlb2YgcGF5bG9hZC52YWx1ZSAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBjb2RlOiBcImludmFsaWRfdHlwZVwiLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBcImZ1bmN0aW9uXCIsXG4gICAgICAgICAgICAgICAgaW5wdXQ6IHBheWxvYWQudmFsdWUsXG4gICAgICAgICAgICAgICAgaW5zdCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHBheWxvYWQ7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQ2hlY2sgaWYgb3V0cHV0IGlzIGEgcHJvbWlzZSB0eXBlIHRvIGRldGVybWluZSBpZiB3ZSBzaG91bGQgdXNlIGFzeW5jIGltcGxlbWVudGF0aW9uXG4gICAgICAgIGNvbnN0IGhhc1Byb21pc2VPdXRwdXQgPSBpbnN0Ll9kZWYub3V0cHV0ICYmIGluc3QuX2RlZi5vdXRwdXQuX3pvZC5kZWYudHlwZSA9PT0gXCJwcm9taXNlXCI7XG4gICAgICAgIGlmIChoYXNQcm9taXNlT3V0cHV0KSB7XG4gICAgICAgICAgICBwYXlsb2FkLnZhbHVlID0gaW5zdC5pbXBsZW1lbnRBc3luYyhwYXlsb2FkLnZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHBheWxvYWQudmFsdWUgPSBpbnN0LmltcGxlbWVudChwYXlsb2FkLnZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGF5bG9hZDtcbiAgICB9O1xuICAgIGluc3QuaW5wdXQgPSAoLi4uYXJncykgPT4ge1xuICAgICAgICBjb25zdCBGID0gaW5zdC5jb25zdHJ1Y3RvcjtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoYXJnc1swXSkpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgRih7XG4gICAgICAgICAgICAgICAgdHlwZTogXCJmdW5jdGlvblwiLFxuICAgICAgICAgICAgICAgIGlucHV0OiBuZXcgJFpvZFR1cGxlKHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJ0dXBsZVwiLFxuICAgICAgICAgICAgICAgICAgICBpdGVtczogYXJnc1swXSxcbiAgICAgICAgICAgICAgICAgICAgcmVzdDogYXJnc1sxXSxcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBvdXRwdXQ6IGluc3QuX2RlZi5vdXRwdXQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IEYoe1xuICAgICAgICAgICAgdHlwZTogXCJmdW5jdGlvblwiLFxuICAgICAgICAgICAgaW5wdXQ6IGFyZ3NbMF0sXG4gICAgICAgICAgICBvdXRwdXQ6IGluc3QuX2RlZi5vdXRwdXQsXG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgaW5zdC5vdXRwdXQgPSAob3V0cHV0KSA9PiB7XG4gICAgICAgIGNvbnN0IEYgPSBpbnN0LmNvbnN0cnVjdG9yO1xuICAgICAgICByZXR1cm4gbmV3IEYoe1xuICAgICAgICAgICAgdHlwZTogXCJmdW5jdGlvblwiLFxuICAgICAgICAgICAgaW5wdXQ6IGluc3QuX2RlZi5pbnB1dCxcbiAgICAgICAgICAgIG91dHB1dCxcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICByZXR1cm4gaW5zdDtcbn0pO1xuZXhwb3J0IGNvbnN0ICRab2RQcm9taXNlID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RQcm9taXNlXCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICAkWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XG4gICAgaW5zdC5fem9kLnBhcnNlID0gKHBheWxvYWQsIGN0eCkgPT4ge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHBheWxvYWQudmFsdWUpLnRoZW4oKGlubmVyKSA9PiBkZWYuaW5uZXJUeXBlLl96b2QucnVuKHsgdmFsdWU6IGlubmVyLCBpc3N1ZXM6IFtdIH0sIGN0eCkpO1xuICAgIH07XG59KTtcbmV4cG9ydCBjb25zdCAkWm9kTGF6eSA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kTGF6eVwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgJFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xuICAgIC8vIENhY2hlIHRoZSByZXNvbHZlZCBpbm5lciB0eXBlIG9uIHRoZSBzaGFyZWQgYGRlZmAgc28gYWxsIGNsb25lcyBvZiB0aGlzXG4gICAgLy8gbGF6eSAoZS5nLiB2aWEgYC5kZXNjcmliZSgpYC9gLm1ldGEoKWApIHNoYXJlIHRoZSBzYW1lIGlubmVyIGluc3RhbmNlLFxuICAgIC8vIHByZXNlcnZpbmcgaWRlbnRpdHkgZm9yIGN5Y2xlIGRldGVjdGlvbiBvbiByZWN1cnNpdmUgc2NoZW1hcy5cbiAgICB1dGlsLmRlZmluZUxhenkoaW5zdC5fem9kLCBcImlubmVyVHlwZVwiLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGQgPSBkZWY7XG4gICAgICAgIGlmICghZC5fY2FjaGVkSW5uZXIpXG4gICAgICAgICAgICBkLl9jYWNoZWRJbm5lciA9IGRlZi5nZXR0ZXIoKTtcbiAgICAgICAgcmV0dXJuIGQuX2NhY2hlZElubmVyO1xuICAgIH0pO1xuICAgIHV0aWwuZGVmaW5lTGF6eShpbnN0Ll96b2QsIFwicGF0dGVyblwiLCAoKSA9PiBpbnN0Ll96b2QuaW5uZXJUeXBlPy5fem9kPy5wYXR0ZXJuKTtcbiAgICB1dGlsLmRlZmluZUxhenkoaW5zdC5fem9kLCBcInByb3BWYWx1ZXNcIiwgKCkgPT4gaW5zdC5fem9kLmlubmVyVHlwZT8uX3pvZD8ucHJvcFZhbHVlcyk7XG4gICAgdXRpbC5kZWZpbmVMYXp5KGluc3QuX3pvZCwgXCJvcHRpblwiLCAoKSA9PiBpbnN0Ll96b2QuaW5uZXJUeXBlPy5fem9kPy5vcHRpbiA/PyB1bmRlZmluZWQpO1xuICAgIHV0aWwuZGVmaW5lTGF6eShpbnN0Ll96b2QsIFwib3B0b3V0XCIsICgpID0+IGluc3QuX3pvZC5pbm5lclR5cGU/Ll96b2Q/Lm9wdG91dCA/PyB1bmRlZmluZWQpO1xuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBjdHgpID0+IHtcbiAgICAgICAgY29uc3QgaW5uZXIgPSBpbnN0Ll96b2QuaW5uZXJUeXBlO1xuICAgICAgICByZXR1cm4gaW5uZXIuX3pvZC5ydW4ocGF5bG9hZCwgY3R4KTtcbiAgICB9O1xufSk7XG5leHBvcnQgY29uc3QgJFpvZEN1c3RvbSA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kQ3VzdG9tXCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICBjaGVja3MuJFpvZENoZWNrLmluaXQoaW5zdCwgZGVmKTtcbiAgICAkWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XG4gICAgaW5zdC5fem9kLnBhcnNlID0gKHBheWxvYWQsIF8pID0+IHtcbiAgICAgICAgcmV0dXJuIHBheWxvYWQ7XG4gICAgfTtcbiAgICBpbnN0Ll96b2QuY2hlY2sgPSAocGF5bG9hZCkgPT4ge1xuICAgICAgICBjb25zdCBpbnB1dCA9IHBheWxvYWQudmFsdWU7XG4gICAgICAgIGNvbnN0IHIgPSBkZWYuZm4oaW5wdXQpO1xuICAgICAgICBpZiAociBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgICAgIHJldHVybiByLnRoZW4oKHIpID0+IGhhbmRsZVJlZmluZVJlc3VsdChyLCBwYXlsb2FkLCBpbnB1dCwgaW5zdCkpO1xuICAgICAgICB9XG4gICAgICAgIGhhbmRsZVJlZmluZVJlc3VsdChyLCBwYXlsb2FkLCBpbnB1dCwgaW5zdCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9O1xufSk7XG5mdW5jdGlvbiBoYW5kbGVSZWZpbmVSZXN1bHQocmVzdWx0LCBwYXlsb2FkLCBpbnB1dCwgaW5zdCkge1xuICAgIGlmICghcmVzdWx0KSB7XG4gICAgICAgIGNvbnN0IF9pc3MgPSB7XG4gICAgICAgICAgICBjb2RlOiBcImN1c3RvbVwiLFxuICAgICAgICAgICAgaW5wdXQsXG4gICAgICAgICAgICBpbnN0LCAvLyBpbmNvcnBvcmF0ZXMgcGFyYW1zLmVycm9yIGludG8gaXNzdWUgcmVwb3J0aW5nXG4gICAgICAgICAgICBwYXRoOiBbLi4uKGluc3QuX3pvZC5kZWYucGF0aCA/PyBbXSldLCAvLyBpbmNvcnBvcmF0ZXMgcGFyYW1zLmVycm9yIGludG8gaXNzdWUgcmVwb3J0aW5nXG4gICAgICAgICAgICBjb250aW51ZTogIWluc3QuX3pvZC5kZWYuYWJvcnQsXG4gICAgICAgICAgICAvLyBwYXJhbXM6IGluc3QuX3pvZC5kZWYucGFyYW1zLFxuICAgICAgICB9O1xuICAgICAgICBpZiAoaW5zdC5fem9kLmRlZi5wYXJhbXMpXG4gICAgICAgICAgICBfaXNzLnBhcmFtcyA9IGluc3QuX3pvZC5kZWYucGFyYW1zO1xuICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHV0aWwuaXNzdWUoX2lzcykpO1xuICAgIH1cbn1cbiIsInZhciBfYTtcbmV4cG9ydCBjb25zdCAkb3V0cHV0ID0gU3ltYm9sKFwiWm9kT3V0cHV0XCIpO1xuZXhwb3J0IGNvbnN0ICRpbnB1dCA9IFN5bWJvbChcIlpvZElucHV0XCIpO1xuZXhwb3J0IGNsYXNzICRab2RSZWdpc3RyeSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuX21hcCA9IG5ldyBXZWFrTWFwKCk7XG4gICAgICAgIHRoaXMuX2lkbWFwID0gbmV3IE1hcCgpO1xuICAgIH1cbiAgICBhZGQoc2NoZW1hLCAuLi5fbWV0YSkge1xuICAgICAgICBjb25zdCBtZXRhID0gX21ldGFbMF07XG4gICAgICAgIHRoaXMuX21hcC5zZXQoc2NoZW1hLCBtZXRhKTtcbiAgICAgICAgaWYgKG1ldGEgJiYgdHlwZW9mIG1ldGEgPT09IFwib2JqZWN0XCIgJiYgXCJpZFwiIGluIG1ldGEpIHtcbiAgICAgICAgICAgIHRoaXMuX2lkbWFwLnNldChtZXRhLmlkLCBzY2hlbWEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBjbGVhcigpIHtcbiAgICAgICAgdGhpcy5fbWFwID0gbmV3IFdlYWtNYXAoKTtcbiAgICAgICAgdGhpcy5faWRtYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICByZW1vdmUoc2NoZW1hKSB7XG4gICAgICAgIGNvbnN0IG1ldGEgPSB0aGlzLl9tYXAuZ2V0KHNjaGVtYSk7XG4gICAgICAgIGlmIChtZXRhICYmIHR5cGVvZiBtZXRhID09PSBcIm9iamVjdFwiICYmIFwiaWRcIiBpbiBtZXRhKSB7XG4gICAgICAgICAgICB0aGlzLl9pZG1hcC5kZWxldGUobWV0YS5pZCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fbWFwLmRlbGV0ZShzY2hlbWEpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgZ2V0KHNjaGVtYSkge1xuICAgICAgICAvLyByZXR1cm4gdGhpcy5fbWFwLmdldChzY2hlbWEpIGFzIGFueTtcbiAgICAgICAgLy8gaW5oZXJpdCBtZXRhZGF0YVxuICAgICAgICBjb25zdCBwID0gc2NoZW1hLl96b2QucGFyZW50O1xuICAgICAgICBpZiAocCkge1xuICAgICAgICAgICAgY29uc3QgcG0gPSB7IC4uLih0aGlzLmdldChwKSA/PyB7fSkgfTtcbiAgICAgICAgICAgIGRlbGV0ZSBwbS5pZDsgLy8gZG8gbm90IGluaGVyaXQgaWRcbiAgICAgICAgICAgIGNvbnN0IGYgPSB7IC4uLnBtLCAuLi50aGlzLl9tYXAuZ2V0KHNjaGVtYSkgfTtcbiAgICAgICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhmKS5sZW5ndGggPyBmIDogdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9tYXAuZ2V0KHNjaGVtYSk7XG4gICAgfVxuICAgIGhhcyhzY2hlbWEpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21hcC5oYXMoc2NoZW1hKTtcbiAgICB9XG59XG4vLyByZWdpc3RyaWVzXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0cnkoKSB7XG4gICAgcmV0dXJuIG5ldyAkWm9kUmVnaXN0cnkoKTtcbn1cbihfYSA9IGdsb2JhbFRoaXMpLl9fem9kX2dsb2JhbFJlZ2lzdHJ5ID8/IChfYS5fX3pvZF9nbG9iYWxSZWdpc3RyeSA9IHJlZ2lzdHJ5KCkpO1xuZXhwb3J0IGNvbnN0IGdsb2JhbFJlZ2lzdHJ5ID0gZ2xvYmFsVGhpcy5fX3pvZF9nbG9iYWxSZWdpc3RyeTtcbiIsImltcG9ydCAqIGFzIGNoZWNrcyBmcm9tIFwiLi9jaGVja3MuanNcIjtcbmltcG9ydCAqIGFzIHJlZ2lzdHJpZXMgZnJvbSBcIi4vcmVnaXN0cmllcy5qc1wiO1xuaW1wb3J0ICogYXMgc2NoZW1hcyBmcm9tIFwiLi9zY2hlbWFzLmpzXCI7XG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gXCIuL3V0aWwuanNcIjtcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXG5leHBvcnQgZnVuY3Rpb24gX3N0cmluZyhDbGFzcywgcGFyYW1zKSB7XG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XG4gICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59XG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xuZXhwb3J0IGZ1bmN0aW9uIF9jb2VyY2VkU3RyaW5nKENsYXNzLCBwYXJhbXMpIHtcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcbiAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgICAgY29lcmNlOiB0cnVlLFxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufVxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cbmV4cG9ydCBmdW5jdGlvbiBfZW1haWwoQ2xhc3MsIHBhcmFtcykge1xuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xuICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICBmb3JtYXQ6IFwiZW1haWxcIixcbiAgICAgICAgY2hlY2s6IFwic3RyaW5nX2Zvcm1hdFwiLFxuICAgICAgICBhYm9ydDogZmFsc2UsXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59XG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xuZXhwb3J0IGZ1bmN0aW9uIF9ndWlkKENsYXNzLCBwYXJhbXMpIHtcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcbiAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgICAgZm9ybWF0OiBcImd1aWRcIixcbiAgICAgICAgY2hlY2s6IFwic3RyaW5nX2Zvcm1hdFwiLFxuICAgICAgICBhYm9ydDogZmFsc2UsXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59XG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xuZXhwb3J0IGZ1bmN0aW9uIF91dWlkKENsYXNzLCBwYXJhbXMpIHtcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcbiAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgICAgZm9ybWF0OiBcInV1aWRcIixcbiAgICAgICAgY2hlY2s6IFwic3RyaW5nX2Zvcm1hdFwiLFxuICAgICAgICBhYm9ydDogZmFsc2UsXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59XG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xuZXhwb3J0IGZ1bmN0aW9uIF91dWlkdjQoQ2xhc3MsIHBhcmFtcykge1xuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xuICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICBmb3JtYXQ6IFwidXVpZFwiLFxuICAgICAgICBjaGVjazogXCJzdHJpbmdfZm9ybWF0XCIsXG4gICAgICAgIGFib3J0OiBmYWxzZSxcbiAgICAgICAgdmVyc2lvbjogXCJ2NFwiLFxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufVxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cbmV4cG9ydCBmdW5jdGlvbiBfdXVpZHY2KENsYXNzLCBwYXJhbXMpIHtcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcbiAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgICAgZm9ybWF0OiBcInV1aWRcIixcbiAgICAgICAgY2hlY2s6IFwic3RyaW5nX2Zvcm1hdFwiLFxuICAgICAgICBhYm9ydDogZmFsc2UsXG4gICAgICAgIHZlcnNpb246IFwidjZcIixcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn1cbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXG5leHBvcnQgZnVuY3Rpb24gX3V1aWR2NyhDbGFzcywgcGFyYW1zKSB7XG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XG4gICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgIGZvcm1hdDogXCJ1dWlkXCIsXG4gICAgICAgIGNoZWNrOiBcInN0cmluZ19mb3JtYXRcIixcbiAgICAgICAgYWJvcnQ6IGZhbHNlLFxuICAgICAgICB2ZXJzaW9uOiBcInY3XCIsXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59XG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xuZXhwb3J0IGZ1bmN0aW9uIF91cmwoQ2xhc3MsIHBhcmFtcykge1xuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xuICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICBmb3JtYXQ6IFwidXJsXCIsXG4gICAgICAgIGNoZWNrOiBcInN0cmluZ19mb3JtYXRcIixcbiAgICAgICAgYWJvcnQ6IGZhbHNlLFxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufVxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cbmV4cG9ydCBmdW5jdGlvbiBfZW1vamkoQ2xhc3MsIHBhcmFtcykge1xuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xuICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICBmb3JtYXQ6IFwiZW1vamlcIixcbiAgICAgICAgY2hlY2s6IFwic3RyaW5nX2Zvcm1hdFwiLFxuICAgICAgICBhYm9ydDogZmFsc2UsXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59XG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xuZXhwb3J0IGZ1bmN0aW9uIF9uYW5vaWQoQ2xhc3MsIHBhcmFtcykge1xuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xuICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICBmb3JtYXQ6IFwibmFub2lkXCIsXG4gICAgICAgIGNoZWNrOiBcInN0cmluZ19mb3JtYXRcIixcbiAgICAgICAgYWJvcnQ6IGZhbHNlLFxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufVxuLyoqXG4gKiBAZGVwcmVjYXRlZCBDVUlEIHYxIGlzIGRlcHJlY2F0ZWQgYnkgaXRzIGF1dGhvcnMgZHVlIHRvIGluZm9ybWF0aW9uIGxlYWthZ2VcbiAqICh0aW1lc3RhbXBzIGVtYmVkZGVkIGluIHRoZSBpZCkuIFVzZSB7QGxpbmsgX2N1aWQyfSBpbnN0ZWFkLlxuICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9wYXJhbGxlbGRyaXZlL2N1aWQuXG4gKi9cbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXG5leHBvcnQgZnVuY3Rpb24gX2N1aWQoQ2xhc3MsIHBhcmFtcykge1xuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xuICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICBmb3JtYXQ6IFwiY3VpZFwiLFxuICAgICAgICBjaGVjazogXCJzdHJpbmdfZm9ybWF0XCIsXG4gICAgICAgIGFib3J0OiBmYWxzZSxcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn1cbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXG5leHBvcnQgZnVuY3Rpb24gX2N1aWQyKENsYXNzLCBwYXJhbXMpIHtcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcbiAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgICAgZm9ybWF0OiBcImN1aWQyXCIsXG4gICAgICAgIGNoZWNrOiBcInN0cmluZ19mb3JtYXRcIixcbiAgICAgICAgYWJvcnQ6IGZhbHNlLFxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufVxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cbmV4cG9ydCBmdW5jdGlvbiBfdWxpZChDbGFzcywgcGFyYW1zKSB7XG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XG4gICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgIGZvcm1hdDogXCJ1bGlkXCIsXG4gICAgICAgIGNoZWNrOiBcInN0cmluZ19mb3JtYXRcIixcbiAgICAgICAgYWJvcnQ6IGZhbHNlLFxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufVxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cbmV4cG9ydCBmdW5jdGlvbiBfeGlkKENsYXNzLCBwYXJhbXMpIHtcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcbiAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgICAgZm9ybWF0OiBcInhpZFwiLFxuICAgICAgICBjaGVjazogXCJzdHJpbmdfZm9ybWF0XCIsXG4gICAgICAgIGFib3J0OiBmYWxzZSxcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn1cbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXG5leHBvcnQgZnVuY3Rpb24gX2tzdWlkKENsYXNzLCBwYXJhbXMpIHtcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcbiAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgICAgZm9ybWF0OiBcImtzdWlkXCIsXG4gICAgICAgIGNoZWNrOiBcInN0cmluZ19mb3JtYXRcIixcbiAgICAgICAgYWJvcnQ6IGZhbHNlLFxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufVxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cbmV4cG9ydCBmdW5jdGlvbiBfaXB2NChDbGFzcywgcGFyYW1zKSB7XG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XG4gICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgIGZvcm1hdDogXCJpcHY0XCIsXG4gICAgICAgIGNoZWNrOiBcInN0cmluZ19mb3JtYXRcIixcbiAgICAgICAgYWJvcnQ6IGZhbHNlLFxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufVxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cbmV4cG9ydCBmdW5jdGlvbiBfaXB2NihDbGFzcywgcGFyYW1zKSB7XG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XG4gICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgIGZvcm1hdDogXCJpcHY2XCIsXG4gICAgICAgIGNoZWNrOiBcInN0cmluZ19mb3JtYXRcIixcbiAgICAgICAgYWJvcnQ6IGZhbHNlLFxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufVxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cbmV4cG9ydCBmdW5jdGlvbiBfbWFjKENsYXNzLCBwYXJhbXMpIHtcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcbiAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgICAgZm9ybWF0OiBcIm1hY1wiLFxuICAgICAgICBjaGVjazogXCJzdHJpbmdfZm9ybWF0XCIsXG4gICAgICAgIGFib3J0OiBmYWxzZSxcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn1cbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXG5leHBvcnQgZnVuY3Rpb24gX2NpZHJ2NChDbGFzcywgcGFyYW1zKSB7XG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XG4gICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgIGZvcm1hdDogXCJjaWRydjRcIixcbiAgICAgICAgY2hlY2s6IFwic3RyaW5nX2Zvcm1hdFwiLFxuICAgICAgICBhYm9ydDogZmFsc2UsXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59XG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xuZXhwb3J0IGZ1bmN0aW9uIF9jaWRydjYoQ2xhc3MsIHBhcmFtcykge1xuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xuICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICBmb3JtYXQ6IFwiY2lkcnY2XCIsXG4gICAgICAgIGNoZWNrOiBcInN0cmluZ19mb3JtYXRcIixcbiAgICAgICAgYWJvcnQ6IGZhbHNlLFxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufVxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cbmV4cG9ydCBmdW5jdGlvbiBfYmFzZTY0KENsYXNzLCBwYXJhbXMpIHtcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcbiAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgICAgZm9ybWF0OiBcImJhc2U2NFwiLFxuICAgICAgICBjaGVjazogXCJzdHJpbmdfZm9ybWF0XCIsXG4gICAgICAgIGFib3J0OiBmYWxzZSxcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn1cbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXG5leHBvcnQgZnVuY3Rpb24gX2Jhc2U2NHVybChDbGFzcywgcGFyYW1zKSB7XG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XG4gICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgIGZvcm1hdDogXCJiYXNlNjR1cmxcIixcbiAgICAgICAgY2hlY2s6IFwic3RyaW5nX2Zvcm1hdFwiLFxuICAgICAgICBhYm9ydDogZmFsc2UsXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59XG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xuZXhwb3J0IGZ1bmN0aW9uIF9lMTY0KENsYXNzLCBwYXJhbXMpIHtcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcbiAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgICAgZm9ybWF0OiBcImUxNjRcIixcbiAgICAgICAgY2hlY2s6IFwic3RyaW5nX2Zvcm1hdFwiLFxuICAgICAgICBhYm9ydDogZmFsc2UsXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59XG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xuZXhwb3J0IGZ1bmN0aW9uIF9qd3QoQ2xhc3MsIHBhcmFtcykge1xuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xuICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICBmb3JtYXQ6IFwiand0XCIsXG4gICAgICAgIGNoZWNrOiBcInN0cmluZ19mb3JtYXRcIixcbiAgICAgICAgYWJvcnQ6IGZhbHNlLFxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufVxuZXhwb3J0IGNvbnN0IFRpbWVQcmVjaXNpb24gPSB7XG4gICAgQW55OiBudWxsLFxuICAgIE1pbnV0ZTogLTEsXG4gICAgU2Vjb25kOiAwLFxuICAgIE1pbGxpc2Vjb25kOiAzLFxuICAgIE1pY3Jvc2Vjb25kOiA2LFxufTtcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXG5leHBvcnQgZnVuY3Rpb24gX2lzb0RhdGVUaW1lKENsYXNzLCBwYXJhbXMpIHtcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcbiAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgICAgZm9ybWF0OiBcImRhdGV0aW1lXCIsXG4gICAgICAgIGNoZWNrOiBcInN0cmluZ19mb3JtYXRcIixcbiAgICAgICAgb2Zmc2V0OiBmYWxzZSxcbiAgICAgICAgbG9jYWw6IGZhbHNlLFxuICAgICAgICBwcmVjaXNpb246IG51bGwsXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59XG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xuZXhwb3J0IGZ1bmN0aW9uIF9pc29EYXRlKENsYXNzLCBwYXJhbXMpIHtcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcbiAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgICAgZm9ybWF0OiBcImRhdGVcIixcbiAgICAgICAgY2hlY2s6IFwic3RyaW5nX2Zvcm1hdFwiLFxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufVxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cbmV4cG9ydCBmdW5jdGlvbiBfaXNvVGltZShDbGFzcywgcGFyYW1zKSB7XG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XG4gICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgIGZvcm1hdDogXCJ0aW1lXCIsXG4gICAgICAgIGNoZWNrOiBcInN0cmluZ19mb3JtYXRcIixcbiAgICAgICAgcHJlY2lzaW9uOiBudWxsLFxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufVxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cbmV4cG9ydCBmdW5jdGlvbiBfaXNvRHVyYXRpb24oQ2xhc3MsIHBhcmFtcykge1xuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xuICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICBmb3JtYXQ6IFwiZHVyYXRpb25cIixcbiAgICAgICAgY2hlY2s6IFwic3RyaW5nX2Zvcm1hdFwiLFxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufVxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cbmV4cG9ydCBmdW5jdGlvbiBfbnVtYmVyKENsYXNzLCBwYXJhbXMpIHtcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcbiAgICAgICAgdHlwZTogXCJudW1iZXJcIixcbiAgICAgICAgY2hlY2tzOiBbXSxcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn1cbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXG5leHBvcnQgZnVuY3Rpb24gX2NvZXJjZWROdW1iZXIoQ2xhc3MsIHBhcmFtcykge1xuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xuICAgICAgICB0eXBlOiBcIm51bWJlclwiLFxuICAgICAgICBjb2VyY2U6IHRydWUsXG4gICAgICAgIGNoZWNrczogW10sXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59XG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xuZXhwb3J0IGZ1bmN0aW9uIF9pbnQoQ2xhc3MsIHBhcmFtcykge1xuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xuICAgICAgICB0eXBlOiBcIm51bWJlclwiLFxuICAgICAgICBjaGVjazogXCJudW1iZXJfZm9ybWF0XCIsXG4gICAgICAgIGFib3J0OiBmYWxzZSxcbiAgICAgICAgZm9ybWF0OiBcInNhZmVpbnRcIixcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn1cbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXG5leHBvcnQgZnVuY3Rpb24gX2Zsb2F0MzIoQ2xhc3MsIHBhcmFtcykge1xuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xuICAgICAgICB0eXBlOiBcIm51bWJlclwiLFxuICAgICAgICBjaGVjazogXCJudW1iZXJfZm9ybWF0XCIsXG4gICAgICAgIGFib3J0OiBmYWxzZSxcbiAgICAgICAgZm9ybWF0OiBcImZsb2F0MzJcIixcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn1cbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXG5leHBvcnQgZnVuY3Rpb24gX2Zsb2F0NjQoQ2xhc3MsIHBhcmFtcykge1xuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xuICAgICAgICB0eXBlOiBcIm51bWJlclwiLFxuICAgICAgICBjaGVjazogXCJudW1iZXJfZm9ybWF0XCIsXG4gICAgICAgIGFib3J0OiBmYWxzZSxcbiAgICAgICAgZm9ybWF0OiBcImZsb2F0NjRcIixcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn1cbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXG5leHBvcnQgZnVuY3Rpb24gX2ludDMyKENsYXNzLCBwYXJhbXMpIHtcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcbiAgICAgICAgdHlwZTogXCJudW1iZXJcIixcbiAgICAgICAgY2hlY2s6IFwibnVtYmVyX2Zvcm1hdFwiLFxuICAgICAgICBhYm9ydDogZmFsc2UsXG4gICAgICAgIGZvcm1hdDogXCJpbnQzMlwiLFxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufVxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cbmV4cG9ydCBmdW5jdGlvbiBfdWludDMyKENsYXNzLCBwYXJhbXMpIHtcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcbiAgICAgICAgdHlwZTogXCJudW1iZXJcIixcbiAgICAgICAgY2hlY2s6IFwibnVtYmVyX2Zvcm1hdFwiLFxuICAgICAgICBhYm9ydDogZmFsc2UsXG4gICAgICAgIGZvcm1hdDogXCJ1aW50MzJcIixcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn1cbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXG5leHBvcnQgZnVuY3Rpb24gX2Jvb2xlYW4oQ2xhc3MsIHBhcmFtcykge1xuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xuICAgICAgICB0eXBlOiBcImJvb2xlYW5cIixcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn1cbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXG5leHBvcnQgZnVuY3Rpb24gX2NvZXJjZWRCb29sZWFuKENsYXNzLCBwYXJhbXMpIHtcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcbiAgICAgICAgdHlwZTogXCJib29sZWFuXCIsXG4gICAgICAgIGNvZXJjZTogdHJ1ZSxcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn1cbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXG5leHBvcnQgZnVuY3Rpb24gX2JpZ2ludChDbGFzcywgcGFyYW1zKSB7XG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XG4gICAgICAgIHR5cGU6IFwiYmlnaW50XCIsXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59XG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xuZXhwb3J0IGZ1bmN0aW9uIF9jb2VyY2VkQmlnaW50KENsYXNzLCBwYXJhbXMpIHtcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcbiAgICAgICAgdHlwZTogXCJiaWdpbnRcIixcbiAgICAgICAgY29lcmNlOiB0cnVlLFxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufVxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cbmV4cG9ydCBmdW5jdGlvbiBfaW50NjQoQ2xhc3MsIHBhcmFtcykge1xuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xuICAgICAgICB0eXBlOiBcImJpZ2ludFwiLFxuICAgICAgICBjaGVjazogXCJiaWdpbnRfZm9ybWF0XCIsXG4gICAgICAgIGFib3J0OiBmYWxzZSxcbiAgICAgICAgZm9ybWF0OiBcImludDY0XCIsXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59XG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xuZXhwb3J0IGZ1bmN0aW9uIF91aW50NjQoQ2xhc3MsIHBhcmFtcykge1xuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xuICAgICAgICB0eXBlOiBcImJpZ2ludFwiLFxuICAgICAgICBjaGVjazogXCJiaWdpbnRfZm9ybWF0XCIsXG4gICAgICAgIGFib3J0OiBmYWxzZSxcbiAgICAgICAgZm9ybWF0OiBcInVpbnQ2NFwiLFxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufVxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cbmV4cG9ydCBmdW5jdGlvbiBfc3ltYm9sKENsYXNzLCBwYXJhbXMpIHtcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcbiAgICAgICAgdHlwZTogXCJzeW1ib2xcIixcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn1cbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXG5leHBvcnQgZnVuY3Rpb24gX3VuZGVmaW5lZChDbGFzcywgcGFyYW1zKSB7XG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XG4gICAgICAgIHR5cGU6IFwidW5kZWZpbmVkXCIsXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59XG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xuZXhwb3J0IGZ1bmN0aW9uIF9udWxsKENsYXNzLCBwYXJhbXMpIHtcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcbiAgICAgICAgdHlwZTogXCJudWxsXCIsXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59XG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xuZXhwb3J0IGZ1bmN0aW9uIF9hbnkoQ2xhc3MpIHtcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcbiAgICAgICAgdHlwZTogXCJhbnlcIixcbiAgICB9KTtcbn1cbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXG5leHBvcnQgZnVuY3Rpb24gX3Vua25vd24oQ2xhc3MpIHtcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcbiAgICAgICAgdHlwZTogXCJ1bmtub3duXCIsXG4gICAgfSk7XG59XG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xuZXhwb3J0IGZ1bmN0aW9uIF9uZXZlcihDbGFzcywgcGFyYW1zKSB7XG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XG4gICAgICAgIHR5cGU6IFwibmV2ZXJcIixcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn1cbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXG5leHBvcnQgZnVuY3Rpb24gX3ZvaWQoQ2xhc3MsIHBhcmFtcykge1xuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xuICAgICAgICB0eXBlOiBcInZvaWRcIixcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn1cbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXG5leHBvcnQgZnVuY3Rpb24gX2RhdGUoQ2xhc3MsIHBhcmFtcykge1xuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xuICAgICAgICB0eXBlOiBcImRhdGVcIixcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn1cbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXG5leHBvcnQgZnVuY3Rpb24gX2NvZXJjZWREYXRlKENsYXNzLCBwYXJhbXMpIHtcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcbiAgICAgICAgdHlwZTogXCJkYXRlXCIsXG4gICAgICAgIGNvZXJjZTogdHJ1ZSxcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn1cbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXG5leHBvcnQgZnVuY3Rpb24gX25hbihDbGFzcywgcGFyYW1zKSB7XG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XG4gICAgICAgIHR5cGU6IFwibmFuXCIsXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59XG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xuZXhwb3J0IGZ1bmN0aW9uIF9sdCh2YWx1ZSwgcGFyYW1zKSB7XG4gICAgcmV0dXJuIG5ldyBjaGVja3MuJFpvZENoZWNrTGVzc1RoYW4oe1xuICAgICAgICBjaGVjazogXCJsZXNzX3RoYW5cIixcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcbiAgICAgICAgdmFsdWUsXG4gICAgICAgIGluY2x1c2l2ZTogZmFsc2UsXG4gICAgfSk7XG59XG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xuZXhwb3J0IGZ1bmN0aW9uIF9sdGUodmFsdWUsIHBhcmFtcykge1xuICAgIHJldHVybiBuZXcgY2hlY2tzLiRab2RDaGVja0xlc3NUaGFuKHtcbiAgICAgICAgY2hlY2s6IFwibGVzc190aGFuXCIsXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXG4gICAgICAgIHZhbHVlLFxuICAgICAgICBpbmNsdXNpdmU6IHRydWUsXG4gICAgfSk7XG59XG5leHBvcnQgeyBcbi8qKiBAZGVwcmVjYXRlZCBVc2UgYHoubHRlKClgIGluc3RlYWQuICovXG5fbHRlIGFzIF9tYXgsIH07XG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xuZXhwb3J0IGZ1bmN0aW9uIF9ndCh2YWx1ZSwgcGFyYW1zKSB7XG4gICAgcmV0dXJuIG5ldyBjaGVja3MuJFpvZENoZWNrR3JlYXRlclRoYW4oe1xuICAgICAgICBjaGVjazogXCJncmVhdGVyX3RoYW5cIixcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcbiAgICAgICAgdmFsdWUsXG4gICAgICAgIGluY2x1c2l2ZTogZmFsc2UsXG4gICAgfSk7XG59XG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xuZXhwb3J0IGZ1bmN0aW9uIF9ndGUodmFsdWUsIHBhcmFtcykge1xuICAgIHJldHVybiBuZXcgY2hlY2tzLiRab2RDaGVja0dyZWF0ZXJUaGFuKHtcbiAgICAgICAgY2hlY2s6IFwiZ3JlYXRlcl90aGFuXCIsXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXG4gICAgICAgIHZhbHVlLFxuICAgICAgICBpbmNsdXNpdmU6IHRydWUsXG4gICAgfSk7XG59XG5leHBvcnQgeyBcbi8qKiBAZGVwcmVjYXRlZCBVc2UgYHouZ3RlKClgIGluc3RlYWQuICovXG5fZ3RlIGFzIF9taW4sIH07XG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xuZXhwb3J0IGZ1bmN0aW9uIF9wb3NpdGl2ZShwYXJhbXMpIHtcbiAgICByZXR1cm4gX2d0KDAsIHBhcmFtcyk7XG59XG4vLyBuZWdhdGl2ZVxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cbmV4cG9ydCBmdW5jdGlvbiBfbmVnYXRpdmUocGFyYW1zKSB7XG4gICAgcmV0dXJuIF9sdCgwLCBwYXJhbXMpO1xufVxuLy8gbm9ucG9zaXRpdmVcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXG5leHBvcnQgZnVuY3Rpb24gX25vbnBvc2l0aXZlKHBhcmFtcykge1xuICAgIHJldHVybiBfbHRlKDAsIHBhcmFtcyk7XG59XG4vLyBub25uZWdhdGl2ZVxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cbmV4cG9ydCBmdW5jdGlvbiBfbm9ubmVnYXRpdmUocGFyYW1zKSB7XG4gICAgcmV0dXJuIF9ndGUoMCwgcGFyYW1zKTtcbn1cbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXG5leHBvcnQgZnVuY3Rpb24gX211bHRpcGxlT2YodmFsdWUsIHBhcmFtcykge1xuICAgIHJldHVybiBuZXcgY2hlY2tzLiRab2RDaGVja011bHRpcGxlT2Yoe1xuICAgICAgICBjaGVjazogXCJtdWx0aXBsZV9vZlwiLFxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxuICAgICAgICB2YWx1ZSxcbiAgICB9KTtcbn1cbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXG5leHBvcnQgZnVuY3Rpb24gX21heFNpemUobWF4aW11bSwgcGFyYW1zKSB7XG4gICAgcmV0dXJuIG5ldyBjaGVja3MuJFpvZENoZWNrTWF4U2l6ZSh7XG4gICAgICAgIGNoZWNrOiBcIm1heF9zaXplXCIsXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXG4gICAgICAgIG1heGltdW0sXG4gICAgfSk7XG59XG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xuZXhwb3J0IGZ1bmN0aW9uIF9taW5TaXplKG1pbmltdW0sIHBhcmFtcykge1xuICAgIHJldHVybiBuZXcgY2hlY2tzLiRab2RDaGVja01pblNpemUoe1xuICAgICAgICBjaGVjazogXCJtaW5fc2l6ZVwiLFxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxuICAgICAgICBtaW5pbXVtLFxuICAgIH0pO1xufVxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cbmV4cG9ydCBmdW5jdGlvbiBfc2l6ZShzaXplLCBwYXJhbXMpIHtcbiAgICByZXR1cm4gbmV3IGNoZWNrcy4kWm9kQ2hlY2tTaXplRXF1YWxzKHtcbiAgICAgICAgY2hlY2s6IFwic2l6ZV9lcXVhbHNcIixcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcbiAgICAgICAgc2l6ZSxcbiAgICB9KTtcbn1cbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXG5leHBvcnQgZnVuY3Rpb24gX21heExlbmd0aChtYXhpbXVtLCBwYXJhbXMpIHtcbiAgICBjb25zdCBjaCA9IG5ldyBjaGVja3MuJFpvZENoZWNrTWF4TGVuZ3RoKHtcbiAgICAgICAgY2hlY2s6IFwibWF4X2xlbmd0aFwiLFxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxuICAgICAgICBtYXhpbXVtLFxuICAgIH0pO1xuICAgIHJldHVybiBjaDtcbn1cbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXG5leHBvcnQgZnVuY3Rpb24gX21pbkxlbmd0aChtaW5pbXVtLCBwYXJhbXMpIHtcbiAgICByZXR1cm4gbmV3IGNoZWNrcy4kWm9kQ2hlY2tNaW5MZW5ndGgoe1xuICAgICAgICBjaGVjazogXCJtaW5fbGVuZ3RoXCIsXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXG4gICAgICAgIG1pbmltdW0sXG4gICAgfSk7XG59XG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xuZXhwb3J0IGZ1bmN0aW9uIF9sZW5ndGgobGVuZ3RoLCBwYXJhbXMpIHtcbiAgICByZXR1cm4gbmV3IGNoZWNrcy4kWm9kQ2hlY2tMZW5ndGhFcXVhbHMoe1xuICAgICAgICBjaGVjazogXCJsZW5ndGhfZXF1YWxzXCIsXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXG4gICAgICAgIGxlbmd0aCxcbiAgICB9KTtcbn1cbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXG5leHBvcnQgZnVuY3Rpb24gX3JlZ2V4KHBhdHRlcm4sIHBhcmFtcykge1xuICAgIHJldHVybiBuZXcgY2hlY2tzLiRab2RDaGVja1JlZ2V4KHtcbiAgICAgICAgY2hlY2s6IFwic3RyaW5nX2Zvcm1hdFwiLFxuICAgICAgICBmb3JtYXQ6IFwicmVnZXhcIixcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcbiAgICAgICAgcGF0dGVybixcbiAgICB9KTtcbn1cbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXG5leHBvcnQgZnVuY3Rpb24gX2xvd2VyY2FzZShwYXJhbXMpIHtcbiAgICByZXR1cm4gbmV3IGNoZWNrcy4kWm9kQ2hlY2tMb3dlckNhc2Uoe1xuICAgICAgICBjaGVjazogXCJzdHJpbmdfZm9ybWF0XCIsXG4gICAgICAgIGZvcm1hdDogXCJsb3dlcmNhc2VcIixcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn1cbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXG5leHBvcnQgZnVuY3Rpb24gX3VwcGVyY2FzZShwYXJhbXMpIHtcbiAgICByZXR1cm4gbmV3IGNoZWNrcy4kWm9kQ2hlY2tVcHBlckNhc2Uoe1xuICAgICAgICBjaGVjazogXCJzdHJpbmdfZm9ybWF0XCIsXG4gICAgICAgIGZvcm1hdDogXCJ1cHBlcmNhc2VcIixcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn1cbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXG5leHBvcnQgZnVuY3Rpb24gX2luY2x1ZGVzKGluY2x1ZGVzLCBwYXJhbXMpIHtcbiAgICByZXR1cm4gbmV3IGNoZWNrcy4kWm9kQ2hlY2tJbmNsdWRlcyh7XG4gICAgICAgIGNoZWNrOiBcInN0cmluZ19mb3JtYXRcIixcbiAgICAgICAgZm9ybWF0OiBcImluY2x1ZGVzXCIsXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXG4gICAgICAgIGluY2x1ZGVzLFxuICAgIH0pO1xufVxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cbmV4cG9ydCBmdW5jdGlvbiBfc3RhcnRzV2l0aChwcmVmaXgsIHBhcmFtcykge1xuICAgIHJldHVybiBuZXcgY2hlY2tzLiRab2RDaGVja1N0YXJ0c1dpdGgoe1xuICAgICAgICBjaGVjazogXCJzdHJpbmdfZm9ybWF0XCIsXG4gICAgICAgIGZvcm1hdDogXCJzdGFydHNfd2l0aFwiLFxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxuICAgICAgICBwcmVmaXgsXG4gICAgfSk7XG59XG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xuZXhwb3J0IGZ1bmN0aW9uIF9lbmRzV2l0aChzdWZmaXgsIHBhcmFtcykge1xuICAgIHJldHVybiBuZXcgY2hlY2tzLiRab2RDaGVja0VuZHNXaXRoKHtcbiAgICAgICAgY2hlY2s6IFwic3RyaW5nX2Zvcm1hdFwiLFxuICAgICAgICBmb3JtYXQ6IFwiZW5kc193aXRoXCIsXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXG4gICAgICAgIHN1ZmZpeCxcbiAgICB9KTtcbn1cbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXG5leHBvcnQgZnVuY3Rpb24gX3Byb3BlcnR5KHByb3BlcnR5LCBzY2hlbWEsIHBhcmFtcykge1xuICAgIHJldHVybiBuZXcgY2hlY2tzLiRab2RDaGVja1Byb3BlcnR5KHtcbiAgICAgICAgY2hlY2s6IFwicHJvcGVydHlcIixcbiAgICAgICAgcHJvcGVydHksXG4gICAgICAgIHNjaGVtYSxcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn1cbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXG5leHBvcnQgZnVuY3Rpb24gX21pbWUodHlwZXMsIHBhcmFtcykge1xuICAgIHJldHVybiBuZXcgY2hlY2tzLiRab2RDaGVja01pbWVUeXBlKHtcbiAgICAgICAgY2hlY2s6IFwibWltZV90eXBlXCIsXG4gICAgICAgIG1pbWU6IHR5cGVzLFxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufVxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cbmV4cG9ydCBmdW5jdGlvbiBfb3ZlcndyaXRlKHR4KSB7XG4gICAgcmV0dXJuIG5ldyBjaGVja3MuJFpvZENoZWNrT3ZlcndyaXRlKHtcbiAgICAgICAgY2hlY2s6IFwib3ZlcndyaXRlXCIsXG4gICAgICAgIHR4LFxuICAgIH0pO1xufVxuLy8gbm9ybWFsaXplXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xuZXhwb3J0IGZ1bmN0aW9uIF9ub3JtYWxpemUoZm9ybSkge1xuICAgIHJldHVybiBfb3ZlcndyaXRlKChpbnB1dCkgPT4gaW5wdXQubm9ybWFsaXplKGZvcm0pKTtcbn1cbi8vIHRyaW1cbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXG5leHBvcnQgZnVuY3Rpb24gX3RyaW0oKSB7XG4gICAgcmV0dXJuIF9vdmVyd3JpdGUoKGlucHV0KSA9PiBpbnB1dC50cmltKCkpO1xufVxuLy8gdG9Mb3dlckNhc2Vcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXG5leHBvcnQgZnVuY3Rpb24gX3RvTG93ZXJDYXNlKCkge1xuICAgIHJldHVybiBfb3ZlcndyaXRlKChpbnB1dCkgPT4gaW5wdXQudG9Mb3dlckNhc2UoKSk7XG59XG4vLyB0b1VwcGVyQ2FzZVxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cbmV4cG9ydCBmdW5jdGlvbiBfdG9VcHBlckNhc2UoKSB7XG4gICAgcmV0dXJuIF9vdmVyd3JpdGUoKGlucHV0KSA9PiBpbnB1dC50b1VwcGVyQ2FzZSgpKTtcbn1cbi8vIHNsdWdpZnlcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXG5leHBvcnQgZnVuY3Rpb24gX3NsdWdpZnkoKSB7XG4gICAgcmV0dXJuIF9vdmVyd3JpdGUoKGlucHV0KSA9PiB1dGlsLnNsdWdpZnkoaW5wdXQpKTtcbn1cbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXG5leHBvcnQgZnVuY3Rpb24gX2FycmF5KENsYXNzLCBlbGVtZW50LCBwYXJhbXMpIHtcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcbiAgICAgICAgdHlwZTogXCJhcnJheVwiLFxuICAgICAgICBlbGVtZW50LFxuICAgICAgICAvLyBnZXQgZWxlbWVudCgpIHtcbiAgICAgICAgLy8gICByZXR1cm4gZWxlbWVudDtcbiAgICAgICAgLy8gfSxcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn1cbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXG5leHBvcnQgZnVuY3Rpb24gX3VuaW9uKENsYXNzLCBvcHRpb25zLCBwYXJhbXMpIHtcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcbiAgICAgICAgdHlwZTogXCJ1bmlvblwiLFxuICAgICAgICBvcHRpb25zLFxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufVxuZXhwb3J0IGZ1bmN0aW9uIF94b3IoQ2xhc3MsIG9wdGlvbnMsIHBhcmFtcykge1xuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xuICAgICAgICB0eXBlOiBcInVuaW9uXCIsXG4gICAgICAgIG9wdGlvbnMsXG4gICAgICAgIGluY2x1c2l2ZTogZmFsc2UsXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59XG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xuZXhwb3J0IGZ1bmN0aW9uIF9kaXNjcmltaW5hdGVkVW5pb24oQ2xhc3MsIGRpc2NyaW1pbmF0b3IsIG9wdGlvbnMsIHBhcmFtcykge1xuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xuICAgICAgICB0eXBlOiBcInVuaW9uXCIsXG4gICAgICAgIG9wdGlvbnMsXG4gICAgICAgIGRpc2NyaW1pbmF0b3IsXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59XG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xuZXhwb3J0IGZ1bmN0aW9uIF9pbnRlcnNlY3Rpb24oQ2xhc3MsIGxlZnQsIHJpZ2h0KSB7XG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XG4gICAgICAgIHR5cGU6IFwiaW50ZXJzZWN0aW9uXCIsXG4gICAgICAgIGxlZnQsXG4gICAgICAgIHJpZ2h0LFxuICAgIH0pO1xufVxuLy8gZXhwb3J0IGZ1bmN0aW9uIF90dXBsZShcbi8vICAgQ2xhc3M6IHV0aWwuU2NoZW1hQ2xhc3M8c2NoZW1hcy4kWm9kVHVwbGU+LFxuLy8gICBpdGVtczogW10sXG4vLyAgIHBhcmFtcz86IHN0cmluZyB8ICRab2RUdXBsZVBhcmFtc1xuLy8gKTogc2NoZW1hcy4kWm9kVHVwbGU8W10sIG51bGw+O1xuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cbmV4cG9ydCBmdW5jdGlvbiBfdHVwbGUoQ2xhc3MsIGl0ZW1zLCBfcGFyYW1zT3JSZXN0LCBfcGFyYW1zKSB7XG4gICAgY29uc3QgaGFzUmVzdCA9IF9wYXJhbXNPclJlc3QgaW5zdGFuY2VvZiBzY2hlbWFzLiRab2RUeXBlO1xuICAgIGNvbnN0IHBhcmFtcyA9IGhhc1Jlc3QgPyBfcGFyYW1zIDogX3BhcmFtc09yUmVzdDtcbiAgICBjb25zdCByZXN0ID0gaGFzUmVzdCA/IF9wYXJhbXNPclJlc3QgOiBudWxsO1xuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xuICAgICAgICB0eXBlOiBcInR1cGxlXCIsXG4gICAgICAgIGl0ZW1zLFxuICAgICAgICByZXN0LFxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufVxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cbmV4cG9ydCBmdW5jdGlvbiBfcmVjb3JkKENsYXNzLCBrZXlUeXBlLCB2YWx1ZVR5cGUsIHBhcmFtcykge1xuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xuICAgICAgICB0eXBlOiBcInJlY29yZFwiLFxuICAgICAgICBrZXlUeXBlLFxuICAgICAgICB2YWx1ZVR5cGUsXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59XG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xuZXhwb3J0IGZ1bmN0aW9uIF9tYXAoQ2xhc3MsIGtleVR5cGUsIHZhbHVlVHlwZSwgcGFyYW1zKSB7XG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XG4gICAgICAgIHR5cGU6IFwibWFwXCIsXG4gICAgICAgIGtleVR5cGUsXG4gICAgICAgIHZhbHVlVHlwZSxcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn1cbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXG5leHBvcnQgZnVuY3Rpb24gX3NldChDbGFzcywgdmFsdWVUeXBlLCBwYXJhbXMpIHtcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcbiAgICAgICAgdHlwZTogXCJzZXRcIixcbiAgICAgICAgdmFsdWVUeXBlLFxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufVxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cbmV4cG9ydCBmdW5jdGlvbiBfZW51bShDbGFzcywgdmFsdWVzLCBwYXJhbXMpIHtcbiAgICBjb25zdCBlbnRyaWVzID0gQXJyYXkuaXNBcnJheSh2YWx1ZXMpID8gT2JqZWN0LmZyb21FbnRyaWVzKHZhbHVlcy5tYXAoKHYpID0+IFt2LCB2XSkpIDogdmFsdWVzO1xuICAgIC8vIGlmIChBcnJheS5pc0FycmF5KHZhbHVlcykpIHtcbiAgICAvLyAgIGZvciAoY29uc3QgdmFsdWUgb2YgdmFsdWVzKSB7XG4gICAgLy8gICAgIGVudHJpZXNbdmFsdWVdID0gdmFsdWU7XG4gICAgLy8gICB9XG4gICAgLy8gfSBlbHNlIHtcbiAgICAvLyAgIE9iamVjdC5hc3NpZ24oZW50cmllcywgdmFsdWVzKTtcbiAgICAvLyB9XG4gICAgLy8gY29uc3QgZW50cmllczogdXRpbC5FbnVtTGlrZSA9IHt9O1xuICAgIC8vIGZvciAoY29uc3QgdmFsIG9mIHZhbHVlcykge1xuICAgIC8vICAgZW50cmllc1t2YWxdID0gdmFsO1xuICAgIC8vIH1cbiAgICByZXR1cm4gbmV3IENsYXNzKHtcbiAgICAgICAgdHlwZTogXCJlbnVtXCIsXG4gICAgICAgIGVudHJpZXMsXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59XG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xuLyoqIEBkZXByZWNhdGVkIFRoaXMgQVBJIGhhcyBiZWVuIG1lcmdlZCBpbnRvIGB6LmVudW0oKWAuIFVzZSBgei5lbnVtKClgIGluc3RlYWQuXG4gKlxuICogYGBgdHNcbiAqIGVudW0gQ29sb3JzIHsgcmVkLCBncmVlbiwgYmx1ZSB9XG4gKiB6LmVudW0oQ29sb3JzKTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gX25hdGl2ZUVudW0oQ2xhc3MsIGVudHJpZXMsIHBhcmFtcykge1xuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xuICAgICAgICB0eXBlOiBcImVudW1cIixcbiAgICAgICAgZW50cmllcyxcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn1cbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXG5leHBvcnQgZnVuY3Rpb24gX2xpdGVyYWwoQ2xhc3MsIHZhbHVlLCBwYXJhbXMpIHtcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcbiAgICAgICAgdHlwZTogXCJsaXRlcmFsXCIsXG4gICAgICAgIHZhbHVlczogQXJyYXkuaXNBcnJheSh2YWx1ZSkgPyB2YWx1ZSA6IFt2YWx1ZV0sXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59XG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xuZXhwb3J0IGZ1bmN0aW9uIF9maWxlKENsYXNzLCBwYXJhbXMpIHtcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcbiAgICAgICAgdHlwZTogXCJmaWxlXCIsXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59XG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xuZXhwb3J0IGZ1bmN0aW9uIF90cmFuc2Zvcm0oQ2xhc3MsIGZuKSB7XG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XG4gICAgICAgIHR5cGU6IFwidHJhbnNmb3JtXCIsXG4gICAgICAgIHRyYW5zZm9ybTogZm4sXG4gICAgfSk7XG59XG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xuZXhwb3J0IGZ1bmN0aW9uIF9vcHRpb25hbChDbGFzcywgaW5uZXJUeXBlKSB7XG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XG4gICAgICAgIHR5cGU6IFwib3B0aW9uYWxcIixcbiAgICAgICAgaW5uZXJUeXBlLFxuICAgIH0pO1xufVxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cbmV4cG9ydCBmdW5jdGlvbiBfbnVsbGFibGUoQ2xhc3MsIGlubmVyVHlwZSkge1xuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xuICAgICAgICB0eXBlOiBcIm51bGxhYmxlXCIsXG4gICAgICAgIGlubmVyVHlwZSxcbiAgICB9KTtcbn1cbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXG5leHBvcnQgZnVuY3Rpb24gX2RlZmF1bHQoQ2xhc3MsIGlubmVyVHlwZSwgZGVmYXVsdFZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XG4gICAgICAgIHR5cGU6IFwiZGVmYXVsdFwiLFxuICAgICAgICBpbm5lclR5cGUsXG4gICAgICAgIGdldCBkZWZhdWx0VmFsdWUoKSB7XG4gICAgICAgICAgICByZXR1cm4gdHlwZW9mIGRlZmF1bHRWYWx1ZSA9PT0gXCJmdW5jdGlvblwiID8gZGVmYXVsdFZhbHVlKCkgOiB1dGlsLnNoYWxsb3dDbG9uZShkZWZhdWx0VmFsdWUpO1xuICAgICAgICB9LFxuICAgIH0pO1xufVxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cbmV4cG9ydCBmdW5jdGlvbiBfbm9ub3B0aW9uYWwoQ2xhc3MsIGlubmVyVHlwZSwgcGFyYW1zKSB7XG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XG4gICAgICAgIHR5cGU6IFwibm9ub3B0aW9uYWxcIixcbiAgICAgICAgaW5uZXJUeXBlLFxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufVxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cbmV4cG9ydCBmdW5jdGlvbiBfc3VjY2VzcyhDbGFzcywgaW5uZXJUeXBlKSB7XG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XG4gICAgICAgIHR5cGU6IFwic3VjY2Vzc1wiLFxuICAgICAgICBpbm5lclR5cGUsXG4gICAgfSk7XG59XG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xuZXhwb3J0IGZ1bmN0aW9uIF9jYXRjaChDbGFzcywgaW5uZXJUeXBlLCBjYXRjaFZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XG4gICAgICAgIHR5cGU6IFwiY2F0Y2hcIixcbiAgICAgICAgaW5uZXJUeXBlLFxuICAgICAgICBjYXRjaFZhbHVlOiAodHlwZW9mIGNhdGNoVmFsdWUgPT09IFwiZnVuY3Rpb25cIiA/IGNhdGNoVmFsdWUgOiAoKSA9PiBjYXRjaFZhbHVlKSxcbiAgICB9KTtcbn1cbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXG5leHBvcnQgZnVuY3Rpb24gX3BpcGUoQ2xhc3MsIGluXywgb3V0KSB7XG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XG4gICAgICAgIHR5cGU6IFwicGlwZVwiLFxuICAgICAgICBpbjogaW5fLFxuICAgICAgICBvdXQsXG4gICAgfSk7XG59XG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xuZXhwb3J0IGZ1bmN0aW9uIF9yZWFkb25seShDbGFzcywgaW5uZXJUeXBlKSB7XG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XG4gICAgICAgIHR5cGU6IFwicmVhZG9ubHlcIixcbiAgICAgICAgaW5uZXJUeXBlLFxuICAgIH0pO1xufVxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cbmV4cG9ydCBmdW5jdGlvbiBfdGVtcGxhdGVMaXRlcmFsKENsYXNzLCBwYXJ0cywgcGFyYW1zKSB7XG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XG4gICAgICAgIHR5cGU6IFwidGVtcGxhdGVfbGl0ZXJhbFwiLFxuICAgICAgICBwYXJ0cyxcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn1cbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXG5leHBvcnQgZnVuY3Rpb24gX2xhenkoQ2xhc3MsIGdldHRlcikge1xuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xuICAgICAgICB0eXBlOiBcImxhenlcIixcbiAgICAgICAgZ2V0dGVyLFxuICAgIH0pO1xufVxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cbmV4cG9ydCBmdW5jdGlvbiBfcHJvbWlzZShDbGFzcywgaW5uZXJUeXBlKSB7XG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XG4gICAgICAgIHR5cGU6IFwicHJvbWlzZVwiLFxuICAgICAgICBpbm5lclR5cGUsXG4gICAgfSk7XG59XG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xuZXhwb3J0IGZ1bmN0aW9uIF9jdXN0b20oQ2xhc3MsIGZuLCBfcGFyYW1zKSB7XG4gICAgY29uc3Qgbm9ybSA9IHV0aWwubm9ybWFsaXplUGFyYW1zKF9wYXJhbXMpO1xuICAgIG5vcm0uYWJvcnQgPz8gKG5vcm0uYWJvcnQgPSB0cnVlKTsgLy8gZGVmYXVsdCB0byBhYm9ydDpmYWxzZVxuICAgIGNvbnN0IHNjaGVtYSA9IG5ldyBDbGFzcyh7XG4gICAgICAgIHR5cGU6IFwiY3VzdG9tXCIsXG4gICAgICAgIGNoZWNrOiBcImN1c3RvbVwiLFxuICAgICAgICBmbjogZm4sXG4gICAgICAgIC4uLm5vcm0sXG4gICAgfSk7XG4gICAgcmV0dXJuIHNjaGVtYTtcbn1cbi8vIHNhbWUgYXMgX2N1c3RvbSBidXQgZGVmYXVsdHMgdG8gYWJvcnQ6ZmFsc2Vcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXG5leHBvcnQgZnVuY3Rpb24gX3JlZmluZShDbGFzcywgZm4sIF9wYXJhbXMpIHtcbiAgICBjb25zdCBzY2hlbWEgPSBuZXcgQ2xhc3Moe1xuICAgICAgICB0eXBlOiBcImN1c3RvbVwiLFxuICAgICAgICBjaGVjazogXCJjdXN0b21cIixcbiAgICAgICAgZm46IGZuLFxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhfcGFyYW1zKSxcbiAgICB9KTtcbiAgICByZXR1cm4gc2NoZW1hO1xufVxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cbmV4cG9ydCBmdW5jdGlvbiBfc3VwZXJSZWZpbmUoZm4sIHBhcmFtcykge1xuICAgIGNvbnN0IGNoID0gX2NoZWNrKChwYXlsb2FkKSA9PiB7XG4gICAgICAgIHBheWxvYWQuYWRkSXNzdWUgPSAoaXNzdWUpID0+IHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgaXNzdWUgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHV0aWwuaXNzdWUoaXNzdWUsIHBheWxvYWQudmFsdWUsIGNoLl96b2QuZGVmKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBmb3IgWm9kIDMgYmFja3dhcmRzIGNvbXBhdGliaWxpdHlcbiAgICAgICAgICAgICAgICBjb25zdCBfaXNzdWUgPSBpc3N1ZTtcbiAgICAgICAgICAgICAgICBpZiAoX2lzc3VlLmZhdGFsKVxuICAgICAgICAgICAgICAgICAgICBfaXNzdWUuY29udGludWUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBfaXNzdWUuY29kZSA/PyAoX2lzc3VlLmNvZGUgPSBcImN1c3RvbVwiKTtcbiAgICAgICAgICAgICAgICBfaXNzdWUuaW5wdXQgPz8gKF9pc3N1ZS5pbnB1dCA9IHBheWxvYWQudmFsdWUpO1xuICAgICAgICAgICAgICAgIF9pc3N1ZS5pbnN0ID8/IChfaXNzdWUuaW5zdCA9IGNoKTtcbiAgICAgICAgICAgICAgICBfaXNzdWUuY29udGludWUgPz8gKF9pc3N1ZS5jb250aW51ZSA9ICFjaC5fem9kLmRlZi5hYm9ydCk7IC8vIGFib3J0IGlzIGFsd2F5cyB1bmRlZmluZWQsIHNvIHRoaXMgaXMgYWx3YXlzIHRydWUuLi5cbiAgICAgICAgICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHV0aWwuaXNzdWUoX2lzc3VlKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBmbihwYXlsb2FkLnZhbHVlLCBwYXlsb2FkKTtcbiAgICB9LCBwYXJhbXMpO1xuICAgIHJldHVybiBjaDtcbn1cbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXG5leHBvcnQgZnVuY3Rpb24gX2NoZWNrKGZuLCBwYXJhbXMpIHtcbiAgICBjb25zdCBjaCA9IG5ldyBjaGVja3MuJFpvZENoZWNrKHtcbiAgICAgICAgY2hlY2s6IFwiY3VzdG9tXCIsXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG4gICAgY2guX3pvZC5jaGVjayA9IGZuO1xuICAgIHJldHVybiBjaDtcbn1cbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXG5leHBvcnQgZnVuY3Rpb24gZGVzY3JpYmUoZGVzY3JpcHRpb24pIHtcbiAgICBjb25zdCBjaCA9IG5ldyBjaGVja3MuJFpvZENoZWNrKHsgY2hlY2s6IFwiZGVzY3JpYmVcIiB9KTtcbiAgICBjaC5fem9kLm9uYXR0YWNoID0gW1xuICAgICAgICAoaW5zdCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZXhpc3RpbmcgPSByZWdpc3RyaWVzLmdsb2JhbFJlZ2lzdHJ5LmdldChpbnN0KSA/PyB7fTtcbiAgICAgICAgICAgIHJlZ2lzdHJpZXMuZ2xvYmFsUmVnaXN0cnkuYWRkKGluc3QsIHsgLi4uZXhpc3RpbmcsIGRlc2NyaXB0aW9uIH0pO1xuICAgICAgICB9LFxuICAgIF07XG4gICAgY2guX3pvZC5jaGVjayA9ICgpID0+IHsgfTsgLy8gbm8tb3AgY2hlY2tcbiAgICByZXR1cm4gY2g7XG59XG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xuZXhwb3J0IGZ1bmN0aW9uIG1ldGEobWV0YWRhdGEpIHtcbiAgICBjb25zdCBjaCA9IG5ldyBjaGVja3MuJFpvZENoZWNrKHsgY2hlY2s6IFwibWV0YVwiIH0pO1xuICAgIGNoLl96b2Qub25hdHRhY2ggPSBbXG4gICAgICAgIChpbnN0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBleGlzdGluZyA9IHJlZ2lzdHJpZXMuZ2xvYmFsUmVnaXN0cnkuZ2V0KGluc3QpID8/IHt9O1xuICAgICAgICAgICAgcmVnaXN0cmllcy5nbG9iYWxSZWdpc3RyeS5hZGQoaW5zdCwgeyAuLi5leGlzdGluZywgLi4ubWV0YWRhdGEgfSk7XG4gICAgICAgIH0sXG4gICAgXTtcbiAgICBjaC5fem9kLmNoZWNrID0gKCkgPT4geyB9OyAvLyBuby1vcCBjaGVja1xuICAgIHJldHVybiBjaDtcbn1cbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXG5leHBvcnQgZnVuY3Rpb24gX3N0cmluZ2Jvb2woQ2xhc3NlcywgX3BhcmFtcykge1xuICAgIGNvbnN0IHBhcmFtcyA9IHV0aWwubm9ybWFsaXplUGFyYW1zKF9wYXJhbXMpO1xuICAgIGxldCB0cnV0aHlBcnJheSA9IHBhcmFtcy50cnV0aHkgPz8gW1widHJ1ZVwiLCBcIjFcIiwgXCJ5ZXNcIiwgXCJvblwiLCBcInlcIiwgXCJlbmFibGVkXCJdO1xuICAgIGxldCBmYWxzeUFycmF5ID0gcGFyYW1zLmZhbHN5ID8/IFtcImZhbHNlXCIsIFwiMFwiLCBcIm5vXCIsIFwib2ZmXCIsIFwiblwiLCBcImRpc2FibGVkXCJdO1xuICAgIGlmIChwYXJhbXMuY2FzZSAhPT0gXCJzZW5zaXRpdmVcIikge1xuICAgICAgICB0cnV0aHlBcnJheSA9IHRydXRoeUFycmF5Lm1hcCgodikgPT4gKHR5cGVvZiB2ID09PSBcInN0cmluZ1wiID8gdi50b0xvd2VyQ2FzZSgpIDogdikpO1xuICAgICAgICBmYWxzeUFycmF5ID0gZmFsc3lBcnJheS5tYXAoKHYpID0+ICh0eXBlb2YgdiA9PT0gXCJzdHJpbmdcIiA/IHYudG9Mb3dlckNhc2UoKSA6IHYpKTtcbiAgICB9XG4gICAgY29uc3QgdHJ1dGh5U2V0ID0gbmV3IFNldCh0cnV0aHlBcnJheSk7XG4gICAgY29uc3QgZmFsc3lTZXQgPSBuZXcgU2V0KGZhbHN5QXJyYXkpO1xuICAgIGNvbnN0IF9Db2RlYyA9IENsYXNzZXMuQ29kZWMgPz8gc2NoZW1hcy4kWm9kQ29kZWM7XG4gICAgY29uc3QgX0Jvb2xlYW4gPSBDbGFzc2VzLkJvb2xlYW4gPz8gc2NoZW1hcy4kWm9kQm9vbGVhbjtcbiAgICBjb25zdCBfU3RyaW5nID0gQ2xhc3Nlcy5TdHJpbmcgPz8gc2NoZW1hcy4kWm9kU3RyaW5nO1xuICAgIGNvbnN0IHN0cmluZ1NjaGVtYSA9IG5ldyBfU3RyaW5nKHsgdHlwZTogXCJzdHJpbmdcIiwgZXJyb3I6IHBhcmFtcy5lcnJvciB9KTtcbiAgICBjb25zdCBib29sZWFuU2NoZW1hID0gbmV3IF9Cb29sZWFuKHsgdHlwZTogXCJib29sZWFuXCIsIGVycm9yOiBwYXJhbXMuZXJyb3IgfSk7XG4gICAgY29uc3QgY29kZWMgPSBuZXcgX0NvZGVjKHtcbiAgICAgICAgdHlwZTogXCJwaXBlXCIsXG4gICAgICAgIGluOiBzdHJpbmdTY2hlbWEsXG4gICAgICAgIG91dDogYm9vbGVhblNjaGVtYSxcbiAgICAgICAgdHJhbnNmb3JtOiAoKGlucHV0LCBwYXlsb2FkKSA9PiB7XG4gICAgICAgICAgICBsZXQgZGF0YSA9IGlucHV0O1xuICAgICAgICAgICAgaWYgKHBhcmFtcy5jYXNlICE9PSBcInNlbnNpdGl2ZVwiKVxuICAgICAgICAgICAgICAgIGRhdGEgPSBkYXRhLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICBpZiAodHJ1dGh5U2V0LmhhcyhkYXRhKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoZmFsc3lTZXQuaGFzKGRhdGEpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF92YWx1ZVwiLFxuICAgICAgICAgICAgICAgICAgICBleHBlY3RlZDogXCJzdHJpbmdib29sXCIsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlczogWy4uLnRydXRoeVNldCwgLi4uZmFsc3lTZXRdLFxuICAgICAgICAgICAgICAgICAgICBpbnB1dDogcGF5bG9hZC52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgaW5zdDogY29kZWMsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge307XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLFxuICAgICAgICByZXZlcnNlVHJhbnNmb3JtOiAoKGlucHV0LCBfcGF5bG9hZCkgPT4ge1xuICAgICAgICAgICAgaWYgKGlucHV0ID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydXRoeUFycmF5WzBdIHx8IFwidHJ1ZVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHN5QXJyYXlbMF0gfHwgXCJmYWxzZVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSxcbiAgICAgICAgZXJyb3I6IHBhcmFtcy5lcnJvcixcbiAgICB9KTtcbiAgICByZXR1cm4gY29kZWM7XG59XG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xuZXhwb3J0IGZ1bmN0aW9uIF9zdHJpbmdGb3JtYXQoQ2xhc3MsIGZvcm1hdCwgZm5PclJlZ2V4LCBfcGFyYW1zID0ge30pIHtcbiAgICBjb25zdCBwYXJhbXMgPSB1dGlsLm5vcm1hbGl6ZVBhcmFtcyhfcGFyYW1zKTtcbiAgICBjb25zdCBkZWYgPSB7XG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKF9wYXJhbXMpLFxuICAgICAgICBjaGVjazogXCJzdHJpbmdfZm9ybWF0XCIsXG4gICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgIGZvcm1hdCxcbiAgICAgICAgZm46IHR5cGVvZiBmbk9yUmVnZXggPT09IFwiZnVuY3Rpb25cIiA/IGZuT3JSZWdleCA6ICh2YWwpID0+IGZuT3JSZWdleC50ZXN0KHZhbCksXG4gICAgICAgIC4uLnBhcmFtcyxcbiAgICB9O1xuICAgIGlmIChmbk9yUmVnZXggaW5zdGFuY2VvZiBSZWdFeHApIHtcbiAgICAgICAgZGVmLnBhdHRlcm4gPSBmbk9yUmVnZXg7XG4gICAgfVxuICAgIGNvbnN0IGluc3QgPSBuZXcgQ2xhc3MoZGVmKTtcbiAgICByZXR1cm4gaW5zdDtcbn1cbiIsImltcG9ydCB7IGdsb2JhbFJlZ2lzdHJ5IH0gZnJvbSBcIi4vcmVnaXN0cmllcy5qc1wiO1xuLy8gZnVuY3Rpb24gaW5pdGlhbGl6ZUNvbnRleHQ8VCBleHRlbmRzIHNjaGVtYXMuJFpvZFR5cGU+KGlucHV0czogSlNPTlNjaGVtYUdlbmVyYXRvclBhcmFtczxUPik6IFRvSlNPTlNjaGVtYUNvbnRleHQ8VD4ge1xuLy8gICByZXR1cm4ge1xuLy8gICAgIHByb2Nlc3NvcjogaW5wdXRzLnByb2Nlc3Nvcixcbi8vICAgICBtZXRhZGF0YVJlZ2lzdHJ5OiBpbnB1dHMubWV0YWRhdGEgPz8gZ2xvYmFsUmVnaXN0cnksXG4vLyAgICAgdGFyZ2V0OiBpbnB1dHMudGFyZ2V0ID8/IFwiZHJhZnQtMjAyMC0xMlwiLFxuLy8gICAgIHVucmVwcmVzZW50YWJsZTogaW5wdXRzLnVucmVwcmVzZW50YWJsZSA/PyBcInRocm93XCIsXG4vLyAgIH07XG4vLyB9XG5leHBvcnQgZnVuY3Rpb24gaW5pdGlhbGl6ZUNvbnRleHQocGFyYW1zKSB7XG4gICAgLy8gTm9ybWFsaXplIHRhcmdldDogY29udmVydCBvbGQgbm9uLWh5cGhlbmF0ZWQgdmVyc2lvbnMgdG8gaHlwaGVuYXRlZCB2ZXJzaW9uc1xuICAgIGxldCB0YXJnZXQgPSBwYXJhbXM/LnRhcmdldCA/PyBcImRyYWZ0LTIwMjAtMTJcIjtcbiAgICBpZiAodGFyZ2V0ID09PSBcImRyYWZ0LTRcIilcbiAgICAgICAgdGFyZ2V0ID0gXCJkcmFmdC0wNFwiO1xuICAgIGlmICh0YXJnZXQgPT09IFwiZHJhZnQtN1wiKVxuICAgICAgICB0YXJnZXQgPSBcImRyYWZ0LTA3XCI7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcHJvY2Vzc29yczogcGFyYW1zLnByb2Nlc3NvcnMgPz8ge30sXG4gICAgICAgIG1ldGFkYXRhUmVnaXN0cnk6IHBhcmFtcz8ubWV0YWRhdGEgPz8gZ2xvYmFsUmVnaXN0cnksXG4gICAgICAgIHRhcmdldCxcbiAgICAgICAgdW5yZXByZXNlbnRhYmxlOiBwYXJhbXM/LnVucmVwcmVzZW50YWJsZSA/PyBcInRocm93XCIsXG4gICAgICAgIG92ZXJyaWRlOiBwYXJhbXM/Lm92ZXJyaWRlID8/ICgoKSA9PiB7IH0pLFxuICAgICAgICBpbzogcGFyYW1zPy5pbyA/PyBcIm91dHB1dFwiLFxuICAgICAgICBjb3VudGVyOiAwLFxuICAgICAgICBzZWVuOiBuZXcgTWFwKCksXG4gICAgICAgIGN5Y2xlczogcGFyYW1zPy5jeWNsZXMgPz8gXCJyZWZcIixcbiAgICAgICAgcmV1c2VkOiBwYXJhbXM/LnJldXNlZCA/PyBcImlubGluZVwiLFxuICAgICAgICBleHRlcm5hbDogcGFyYW1zPy5leHRlcm5hbCA/PyB1bmRlZmluZWQsXG4gICAgfTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBwcm9jZXNzKHNjaGVtYSwgY3R4LCBfcGFyYW1zID0geyBwYXRoOiBbXSwgc2NoZW1hUGF0aDogW10gfSkge1xuICAgIHZhciBfYTtcbiAgICBjb25zdCBkZWYgPSBzY2hlbWEuX3pvZC5kZWY7XG4gICAgLy8gY2hlY2sgZm9yIHNjaGVtYSBpbiBzZWVuc1xuICAgIGNvbnN0IHNlZW4gPSBjdHguc2Vlbi5nZXQoc2NoZW1hKTtcbiAgICBpZiAoc2Vlbikge1xuICAgICAgICBzZWVuLmNvdW50Kys7XG4gICAgICAgIC8vIGNoZWNrIGlmIGN5Y2xlXG4gICAgICAgIGNvbnN0IGlzQ3ljbGUgPSBfcGFyYW1zLnNjaGVtYVBhdGguaW5jbHVkZXMoc2NoZW1hKTtcbiAgICAgICAgaWYgKGlzQ3ljbGUpIHtcbiAgICAgICAgICAgIHNlZW4uY3ljbGUgPSBfcGFyYW1zLnBhdGg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNlZW4uc2NoZW1hO1xuICAgIH1cbiAgICAvLyBpbml0aWFsaXplXG4gICAgY29uc3QgcmVzdWx0ID0geyBzY2hlbWE6IHt9LCBjb3VudDogMSwgY3ljbGU6IHVuZGVmaW5lZCwgcGF0aDogX3BhcmFtcy5wYXRoIH07XG4gICAgY3R4LnNlZW4uc2V0KHNjaGVtYSwgcmVzdWx0KTtcbiAgICAvLyBjdXN0b20gbWV0aG9kIG92ZXJyaWRlcyBkZWZhdWx0IGJlaGF2aW9yXG4gICAgY29uc3Qgb3ZlcnJpZGVTY2hlbWEgPSBzY2hlbWEuX3pvZC50b0pTT05TY2hlbWE/LigpO1xuICAgIGlmIChvdmVycmlkZVNjaGVtYSkge1xuICAgICAgICByZXN1bHQuc2NoZW1hID0gb3ZlcnJpZGVTY2hlbWE7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjb25zdCBwYXJhbXMgPSB7XG4gICAgICAgICAgICAuLi5fcGFyYW1zLFxuICAgICAgICAgICAgc2NoZW1hUGF0aDogWy4uLl9wYXJhbXMuc2NoZW1hUGF0aCwgc2NoZW1hXSxcbiAgICAgICAgICAgIHBhdGg6IF9wYXJhbXMucGF0aCxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHNjaGVtYS5fem9kLnByb2Nlc3NKU09OU2NoZW1hKSB7XG4gICAgICAgICAgICBzY2hlbWEuX3pvZC5wcm9jZXNzSlNPTlNjaGVtYShjdHgsIHJlc3VsdC5zY2hlbWEsIHBhcmFtcyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBfanNvbiA9IHJlc3VsdC5zY2hlbWE7XG4gICAgICAgICAgICBjb25zdCBwcm9jZXNzb3IgPSBjdHgucHJvY2Vzc29yc1tkZWYudHlwZV07XG4gICAgICAgICAgICBpZiAoIXByb2Nlc3Nvcikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgW3RvSlNPTlNjaGVtYV06IE5vbi1yZXByZXNlbnRhYmxlIHR5cGUgZW5jb3VudGVyZWQ6ICR7ZGVmLnR5cGV9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwcm9jZXNzb3Ioc2NoZW1hLCBjdHgsIF9qc29uLCBwYXJhbXMpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBhcmVudCA9IHNjaGVtYS5fem9kLnBhcmVudDtcbiAgICAgICAgaWYgKHBhcmVudCkge1xuICAgICAgICAgICAgLy8gQWxzbyBzZXQgcmVmIGlmIHByb2Nlc3NvciBkaWRuJ3QgKGZvciBpbmhlcml0YW5jZSlcbiAgICAgICAgICAgIGlmICghcmVzdWx0LnJlZilcbiAgICAgICAgICAgICAgICByZXN1bHQucmVmID0gcGFyZW50O1xuICAgICAgICAgICAgcHJvY2VzcyhwYXJlbnQsIGN0eCwgcGFyYW1zKTtcbiAgICAgICAgICAgIGN0eC5zZWVuLmdldChwYXJlbnQpLmlzUGFyZW50ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBtZXRhZGF0YVxuICAgIGNvbnN0IG1ldGEgPSBjdHgubWV0YWRhdGFSZWdpc3RyeS5nZXQoc2NoZW1hKTtcbiAgICBpZiAobWV0YSlcbiAgICAgICAgT2JqZWN0LmFzc2lnbihyZXN1bHQuc2NoZW1hLCBtZXRhKTtcbiAgICBpZiAoY3R4LmlvID09PSBcImlucHV0XCIgJiYgaXNUcmFuc2Zvcm1pbmcoc2NoZW1hKSkge1xuICAgICAgICAvLyBleGFtcGxlcy9kZWZhdWx0cyBvbmx5IGFwcGx5IHRvIG91dHB1dCB0eXBlIG9mIHBpcGVcbiAgICAgICAgZGVsZXRlIHJlc3VsdC5zY2hlbWEuZXhhbXBsZXM7XG4gICAgICAgIGRlbGV0ZSByZXN1bHQuc2NoZW1hLmRlZmF1bHQ7XG4gICAgfVxuICAgIC8vIHNldCBwcmVmYXVsdCBhcyBkZWZhdWx0XG4gICAgaWYgKGN0eC5pbyA9PT0gXCJpbnB1dFwiICYmIFwiX3ByZWZhdWx0XCIgaW4gcmVzdWx0LnNjaGVtYSlcbiAgICAgICAgKF9hID0gcmVzdWx0LnNjaGVtYSkuZGVmYXVsdCA/PyAoX2EuZGVmYXVsdCA9IHJlc3VsdC5zY2hlbWEuX3ByZWZhdWx0KTtcbiAgICBkZWxldGUgcmVzdWx0LnNjaGVtYS5fcHJlZmF1bHQ7XG4gICAgLy8gcHVsbGluZyBmcmVzaCBmcm9tIGN0eC5zZWVuIGluIGNhc2UgaXQgd2FzIG92ZXJ3cml0dGVuXG4gICAgY29uc3QgX3Jlc3VsdCA9IGN0eC5zZWVuLmdldChzY2hlbWEpO1xuICAgIHJldHVybiBfcmVzdWx0LnNjaGVtYTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0RGVmcyhjdHgsIHNjaGVtYVxuLy8gcGFyYW1zOiBFbWl0UGFyYW1zXG4pIHtcbiAgICAvLyBpdGVyYXRlIG92ZXIgc2VlbiBtYXA7XG4gICAgY29uc3Qgcm9vdCA9IGN0eC5zZWVuLmdldChzY2hlbWEpO1xuICAgIGlmICghcm9vdClcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5wcm9jZXNzZWQgc2NoZW1hLiBUaGlzIGlzIGEgYnVnIGluIFpvZC5cIik7XG4gICAgLy8gVHJhY2sgaWRzIHRvIGRldGVjdCBkdXBsaWNhdGVzIGFjcm9zcyBkaWZmZXJlbnQgc2NoZW1hc1xuICAgIGNvbnN0IGlkVG9TY2hlbWEgPSBuZXcgTWFwKCk7XG4gICAgZm9yIChjb25zdCBlbnRyeSBvZiBjdHguc2Vlbi5lbnRyaWVzKCkpIHtcbiAgICAgICAgY29uc3QgaWQgPSBjdHgubWV0YWRhdGFSZWdpc3RyeS5nZXQoZW50cnlbMF0pPy5pZDtcbiAgICAgICAgaWYgKGlkKSB7XG4gICAgICAgICAgICBjb25zdCBleGlzdGluZyA9IGlkVG9TY2hlbWEuZ2V0KGlkKTtcbiAgICAgICAgICAgIGlmIChleGlzdGluZyAmJiBleGlzdGluZyAhPT0gZW50cnlbMF0pIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYER1cGxpY2F0ZSBzY2hlbWEgaWQgXCIke2lkfVwiIGRldGVjdGVkIGR1cmluZyBKU09OIFNjaGVtYSBjb252ZXJzaW9uLiBUd28gZGlmZmVyZW50IHNjaGVtYXMgY2Fubm90IHNoYXJlIHRoZSBzYW1lIGlkIHdoZW4gY29udmVydGVkIHRvZ2V0aGVyLmApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWRUb1NjaGVtYS5zZXQoaWQsIGVudHJ5WzBdKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyByZXR1cm5zIGEgcmVmIHRvIHRoZSBzY2hlbWFcbiAgICAvLyBkZWZJZCB3aWxsIGJlIGVtcHR5IGlmIHRoZSByZWYgcG9pbnRzIHRvIGFuIGV4dGVybmFsIHNjaGVtYSAob3IgIylcbiAgICBjb25zdCBtYWtlVVJJID0gKGVudHJ5KSA9PiB7XG4gICAgICAgIC8vIGNvbXBhcmluZyB0aGUgc2VlbiBvYmplY3RzIGJlY2F1c2Ugc29tZXRpbWVzXG4gICAgICAgIC8vIG11bHRpcGxlIHNjaGVtYXMgbWFwIHRvIHRoZSBzYW1lIHNlZW4gb2JqZWN0LlxuICAgICAgICAvLyBlLmcuIGxhenlcbiAgICAgICAgLy8gZXh0ZXJuYWwgaXMgY29uZmlndXJlZFxuICAgICAgICBjb25zdCBkZWZzU2VnbWVudCA9IGN0eC50YXJnZXQgPT09IFwiZHJhZnQtMjAyMC0xMlwiID8gXCIkZGVmc1wiIDogXCJkZWZpbml0aW9uc1wiO1xuICAgICAgICBpZiAoY3R4LmV4dGVybmFsKSB7XG4gICAgICAgICAgICBjb25zdCBleHRlcm5hbElkID0gY3R4LmV4dGVybmFsLnJlZ2lzdHJ5LmdldChlbnRyeVswXSk/LmlkOyAvLyA/PyBcIl9fc2hhcmVkXCI7Ly8gYF9fc2NoZW1hJHtjdHguY291bnRlcisrfWA7XG4gICAgICAgICAgICAvLyBjaGVjayBpZiBzY2hlbWEgaXMgaW4gdGhlIGV4dGVybmFsIHJlZ2lzdHJ5XG4gICAgICAgICAgICBjb25zdCB1cmlHZW5lcmF0b3IgPSBjdHguZXh0ZXJuYWwudXJpID8/ICgoaWQpID0+IGlkKTtcbiAgICAgICAgICAgIGlmIChleHRlcm5hbElkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgcmVmOiB1cmlHZW5lcmF0b3IoZXh0ZXJuYWxJZCkgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIG90aGVyd2lzZSwgYWRkIHRvIF9fc2hhcmVkXG4gICAgICAgICAgICBjb25zdCBpZCA9IGVudHJ5WzFdLmRlZklkID8/IGVudHJ5WzFdLnNjaGVtYS5pZCA/PyBgc2NoZW1hJHtjdHguY291bnRlcisrfWA7XG4gICAgICAgICAgICBlbnRyeVsxXS5kZWZJZCA9IGlkOyAvLyBzZXQgZGVmSWQgc28gaXQgd2lsbCBiZSByZXVzZWQgaWYgbmVlZGVkXG4gICAgICAgICAgICByZXR1cm4geyBkZWZJZDogaWQsIHJlZjogYCR7dXJpR2VuZXJhdG9yKFwiX19zaGFyZWRcIil9Iy8ke2RlZnNTZWdtZW50fS8ke2lkfWAgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZW50cnlbMV0gPT09IHJvb3QpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHJlZjogXCIjXCIgfTtcbiAgICAgICAgfVxuICAgICAgICAvLyBzZWxmLWNvbnRhaW5lZCBzY2hlbWFcbiAgICAgICAgY29uc3QgdXJpUHJlZml4ID0gYCNgO1xuICAgICAgICBjb25zdCBkZWZVcmlQcmVmaXggPSBgJHt1cmlQcmVmaXh9LyR7ZGVmc1NlZ21lbnR9L2A7XG4gICAgICAgIGNvbnN0IGRlZklkID0gZW50cnlbMV0uc2NoZW1hLmlkID8/IGBfX3NjaGVtYSR7Y3R4LmNvdW50ZXIrK31gO1xuICAgICAgICByZXR1cm4geyBkZWZJZCwgcmVmOiBkZWZVcmlQcmVmaXggKyBkZWZJZCB9O1xuICAgIH07XG4gICAgLy8gc3RvcmVkIGNhY2hlZCB2ZXJzaW9uIGluIGBkZWZgIHByb3BlcnR5XG4gICAgLy8gcmVtb3ZlIGFsbCBwcm9wZXJ0aWVzLCBzZXQgJHJlZlxuICAgIGNvbnN0IGV4dHJhY3RUb0RlZiA9IChlbnRyeSkgPT4ge1xuICAgICAgICAvLyBpZiB0aGUgc2NoZW1hIGlzIGFscmVhZHkgYSByZWZlcmVuY2UsIGRvIG5vdCBleHRyYWN0IGl0XG4gICAgICAgIGlmIChlbnRyeVsxXS5zY2hlbWEuJHJlZikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHNlZW4gPSBlbnRyeVsxXTtcbiAgICAgICAgY29uc3QgeyByZWYsIGRlZklkIH0gPSBtYWtlVVJJKGVudHJ5KTtcbiAgICAgICAgc2Vlbi5kZWYgPSB7IC4uLnNlZW4uc2NoZW1hIH07XG4gICAgICAgIC8vIGRlZklkIHdvbid0IGJlIHNldCBpZiB0aGUgc2NoZW1hIGlzIGEgcmVmZXJlbmNlIHRvIGFuIGV4dGVybmFsIHNjaGVtYVxuICAgICAgICAvLyBvciBpZiB0aGUgc2NoZW1hIGlzIHRoZSByb290IHNjaGVtYVxuICAgICAgICBpZiAoZGVmSWQpXG4gICAgICAgICAgICBzZWVuLmRlZklkID0gZGVmSWQ7XG4gICAgICAgIC8vIHdpcGUgYXdheSBhbGwgcHJvcGVydGllcyBleGNlcHQgJHJlZlxuICAgICAgICBjb25zdCBzY2hlbWEgPSBzZWVuLnNjaGVtYTtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gc2NoZW1hKSB7XG4gICAgICAgICAgICBkZWxldGUgc2NoZW1hW2tleV07XG4gICAgICAgIH1cbiAgICAgICAgc2NoZW1hLiRyZWYgPSByZWY7XG4gICAgfTtcbiAgICAvLyB0aHJvdyBvbiBjeWNsZXNcbiAgICAvLyBicmVhayBjeWNsZXNcbiAgICBpZiAoY3R4LmN5Y2xlcyA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgY3R4LnNlZW4uZW50cmllcygpKSB7XG4gICAgICAgICAgICBjb25zdCBzZWVuID0gZW50cnlbMV07XG4gICAgICAgICAgICBpZiAoc2Vlbi5jeWNsZSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkN5Y2xlIGRldGVjdGVkOiBcIiArXG4gICAgICAgICAgICAgICAgICAgIGAjLyR7c2Vlbi5jeWNsZT8uam9pbihcIi9cIil9Lzxyb290PmAgK1xuICAgICAgICAgICAgICAgICAgICAnXFxuXFxuU2V0IHRoZSBgY3ljbGVzYCBwYXJhbWV0ZXIgdG8gYFwicmVmXCJgIHRvIHJlc29sdmUgY3ljbGljYWwgc2NoZW1hcyB3aXRoIGRlZnMuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gZXh0cmFjdCBzY2hlbWFzIGludG8gJGRlZnNcbiAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGN0eC5zZWVuLmVudHJpZXMoKSkge1xuICAgICAgICBjb25zdCBzZWVuID0gZW50cnlbMV07XG4gICAgICAgIC8vIGNvbnZlcnQgcm9vdCBzY2hlbWEgdG8gIyAkcmVmXG4gICAgICAgIGlmIChzY2hlbWEgPT09IGVudHJ5WzBdKSB7XG4gICAgICAgICAgICBleHRyYWN0VG9EZWYoZW50cnkpOyAvLyB0aGlzIGhhcyBzcGVjaWFsIGhhbmRsaW5nIGZvciB0aGUgcm9vdCBzY2hlbWFcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIC8vIGV4dHJhY3Qgc2NoZW1hcyB0aGF0IGFyZSBpbiB0aGUgZXh0ZXJuYWwgcmVnaXN0cnlcbiAgICAgICAgaWYgKGN0eC5leHRlcm5hbCkge1xuICAgICAgICAgICAgY29uc3QgZXh0ID0gY3R4LmV4dGVybmFsLnJlZ2lzdHJ5LmdldChlbnRyeVswXSk/LmlkO1xuICAgICAgICAgICAgaWYgKHNjaGVtYSAhPT0gZW50cnlbMF0gJiYgZXh0KSB7XG4gICAgICAgICAgICAgICAgZXh0cmFjdFRvRGVmKGVudHJ5KTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBleHRyYWN0IHNjaGVtYXMgd2l0aCBgaWRgIG1ldGFcbiAgICAgICAgY29uc3QgaWQgPSBjdHgubWV0YWRhdGFSZWdpc3RyeS5nZXQoZW50cnlbMF0pPy5pZDtcbiAgICAgICAgaWYgKGlkKSB7XG4gICAgICAgICAgICBleHRyYWN0VG9EZWYoZW50cnkpO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gYnJlYWsgY3ljbGVzXG4gICAgICAgIGlmIChzZWVuLmN5Y2xlKSB7XG4gICAgICAgICAgICAvLyBhbnlcbiAgICAgICAgICAgIGV4dHJhY3RUb0RlZihlbnRyeSk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBleHRyYWN0IHJldXNlZCBzY2hlbWFzXG4gICAgICAgIGlmIChzZWVuLmNvdW50ID4gMSkge1xuICAgICAgICAgICAgaWYgKGN0eC5yZXVzZWQgPT09IFwicmVmXCIpIHtcbiAgICAgICAgICAgICAgICBleHRyYWN0VG9EZWYoZW50cnkpO1xuICAgICAgICAgICAgICAgIC8vIGJpb21lLWlnbm9yZSBsaW50OlxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIGZpbmFsaXplKGN0eCwgc2NoZW1hKSB7XG4gICAgY29uc3Qgcm9vdCA9IGN0eC5zZWVuLmdldChzY2hlbWEpO1xuICAgIGlmICghcm9vdClcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5wcm9jZXNzZWQgc2NoZW1hLiBUaGlzIGlzIGEgYnVnIGluIFpvZC5cIik7XG4gICAgLy8gZmxhdHRlbiByZWZzIC0gaW5oZXJpdCBwcm9wZXJ0aWVzIGZyb20gcGFyZW50IHNjaGVtYXNcbiAgICBjb25zdCBmbGF0dGVuUmVmID0gKHpvZFNjaGVtYSkgPT4ge1xuICAgICAgICBjb25zdCBzZWVuID0gY3R4LnNlZW4uZ2V0KHpvZFNjaGVtYSk7XG4gICAgICAgIC8vIGFscmVhZHkgcHJvY2Vzc2VkXG4gICAgICAgIGlmIChzZWVuLnJlZiA9PT0gbnVsbClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY29uc3Qgc2NoZW1hID0gc2Vlbi5kZWYgPz8gc2Vlbi5zY2hlbWE7XG4gICAgICAgIGNvbnN0IF9jYWNoZWQgPSB7IC4uLnNjaGVtYSB9O1xuICAgICAgICBjb25zdCByZWYgPSBzZWVuLnJlZjtcbiAgICAgICAgc2Vlbi5yZWYgPSBudWxsOyAvLyBwcmV2ZW50IGluZmluaXRlIHJlY3Vyc2lvblxuICAgICAgICBpZiAocmVmKSB7XG4gICAgICAgICAgICBmbGF0dGVuUmVmKHJlZik7XG4gICAgICAgICAgICBjb25zdCByZWZTZWVuID0gY3R4LnNlZW4uZ2V0KHJlZik7XG4gICAgICAgICAgICBjb25zdCByZWZTY2hlbWEgPSByZWZTZWVuLnNjaGVtYTtcbiAgICAgICAgICAgIC8vIG1lcmdlIHJlZmVyZW5jZWQgc2NoZW1hIGludG8gY3VycmVudFxuICAgICAgICAgICAgaWYgKHJlZlNjaGVtYS4kcmVmICYmIChjdHgudGFyZ2V0ID09PSBcImRyYWZ0LTA3XCIgfHwgY3R4LnRhcmdldCA9PT0gXCJkcmFmdC0wNFwiIHx8IGN0eC50YXJnZXQgPT09IFwib3BlbmFwaS0zLjBcIikpIHtcbiAgICAgICAgICAgICAgICAvLyBvbGRlciBkcmFmdHMgY2FuJ3QgY29tYmluZSAkcmVmIHdpdGggb3RoZXIgcHJvcGVydGllc1xuICAgICAgICAgICAgICAgIHNjaGVtYS5hbGxPZiA9IHNjaGVtYS5hbGxPZiA/PyBbXTtcbiAgICAgICAgICAgICAgICBzY2hlbWEuYWxsT2YucHVzaChyZWZTY2hlbWEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihzY2hlbWEsIHJlZlNjaGVtYSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyByZXN0b3JlIGNoaWxkJ3Mgb3duIHByb3BlcnRpZXMgKGNoaWxkIHdpbnMpXG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKHNjaGVtYSwgX2NhY2hlZCk7XG4gICAgICAgICAgICBjb25zdCBpc1BhcmVudFJlZiA9IHpvZFNjaGVtYS5fem9kLnBhcmVudCA9PT0gcmVmO1xuICAgICAgICAgICAgLy8gRm9yIHBhcmVudCBjaGFpbiwgY2hpbGQgaXMgYSByZWZpbmVtZW50IC0gcmVtb3ZlIHBhcmVudC1vbmx5IHByb3BlcnRpZXNcbiAgICAgICAgICAgIGlmIChpc1BhcmVudFJlZikge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIHNjaGVtYSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoa2V5ID09PSBcIiRyZWZcIiB8fCBrZXkgPT09IFwiYWxsT2ZcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIShrZXkgaW4gX2NhY2hlZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBzY2hlbWFba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFdoZW4gcmVmIHdhcyBleHRyYWN0ZWQgdG8gJGRlZnMsIHJlbW92ZSBwcm9wZXJ0aWVzIHRoYXQgbWF0Y2ggdGhlIGRlZmluaXRpb25cbiAgICAgICAgICAgIGlmIChyZWZTY2hlbWEuJHJlZiAmJiByZWZTZWVuLmRlZikge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIHNjaGVtYSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoa2V5ID09PSBcIiRyZWZcIiB8fCBrZXkgPT09IFwiYWxsT2ZcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoa2V5IGluIHJlZlNlZW4uZGVmICYmIEpTT04uc3RyaW5naWZ5KHNjaGVtYVtrZXldKSA9PT0gSlNPTi5zdHJpbmdpZnkocmVmU2Vlbi5kZWZba2V5XSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBzY2hlbWFba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBJZiBwYXJlbnQgd2FzIGV4dHJhY3RlZCAoaGFzICRyZWYpLCBwcm9wYWdhdGUgJHJlZiB0byB0aGlzIHNjaGVtYVxuICAgICAgICAvLyBUaGlzIGhhbmRsZXMgY2FzZXMgbGlrZTogcmVhZG9ubHkoKS5tZXRhKHtpZH0pLmRlc2NyaWJlKClcbiAgICAgICAgLy8gd2hlcmUgcHJvY2Vzc29yIHNldHMgcmVmIHRvIGlubmVyVHlwZSBidXQgcGFyZW50IHNob3VsZCBiZSByZWZlcmVuY2VkXG4gICAgICAgIGNvbnN0IHBhcmVudCA9IHpvZFNjaGVtYS5fem9kLnBhcmVudDtcbiAgICAgICAgaWYgKHBhcmVudCAmJiBwYXJlbnQgIT09IHJlZikge1xuICAgICAgICAgICAgLy8gRW5zdXJlIHBhcmVudCBpcyBwcm9jZXNzZWQgZmlyc3Qgc28gaXRzIGRlZiBoYXMgaW5oZXJpdGVkIHByb3BlcnRpZXNcbiAgICAgICAgICAgIGZsYXR0ZW5SZWYocGFyZW50KTtcbiAgICAgICAgICAgIGNvbnN0IHBhcmVudFNlZW4gPSBjdHguc2Vlbi5nZXQocGFyZW50KTtcbiAgICAgICAgICAgIGlmIChwYXJlbnRTZWVuPy5zY2hlbWEuJHJlZikge1xuICAgICAgICAgICAgICAgIHNjaGVtYS4kcmVmID0gcGFyZW50U2Vlbi5zY2hlbWEuJHJlZjtcbiAgICAgICAgICAgICAgICAvLyBEZS1kdXBsaWNhdGUgd2l0aCBwYXJlbnQncyBkZWZpbml0aW9uXG4gICAgICAgICAgICAgICAgaWYgKHBhcmVudFNlZW4uZGVmKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIHNjaGVtYSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGtleSA9PT0gXCIkcmVmXCIgfHwga2V5ID09PSBcImFsbE9mXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoa2V5IGluIHBhcmVudFNlZW4uZGVmICYmIEpTT04uc3RyaW5naWZ5KHNjaGVtYVtrZXldKSA9PT0gSlNPTi5zdHJpbmdpZnkocGFyZW50U2Vlbi5kZWZba2V5XSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgc2NoZW1hW2tleV07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gZXhlY3V0ZSBvdmVycmlkZXNcbiAgICAgICAgY3R4Lm92ZXJyaWRlKHtcbiAgICAgICAgICAgIHpvZFNjaGVtYTogem9kU2NoZW1hLFxuICAgICAgICAgICAganNvblNjaGVtYTogc2NoZW1hLFxuICAgICAgICAgICAgcGF0aDogc2Vlbi5wYXRoID8/IFtdLFxuICAgICAgICB9KTtcbiAgICB9O1xuICAgIGZvciAoY29uc3QgZW50cnkgb2YgWy4uLmN0eC5zZWVuLmVudHJpZXMoKV0ucmV2ZXJzZSgpKSB7XG4gICAgICAgIGZsYXR0ZW5SZWYoZW50cnlbMF0pO1xuICAgIH1cbiAgICBjb25zdCByZXN1bHQgPSB7fTtcbiAgICBpZiAoY3R4LnRhcmdldCA9PT0gXCJkcmFmdC0yMDIwLTEyXCIpIHtcbiAgICAgICAgcmVzdWx0LiRzY2hlbWEgPSBcImh0dHBzOi8vanNvbi1zY2hlbWEub3JnL2RyYWZ0LzIwMjAtMTIvc2NoZW1hXCI7XG4gICAgfVxuICAgIGVsc2UgaWYgKGN0eC50YXJnZXQgPT09IFwiZHJhZnQtMDdcIikge1xuICAgICAgICByZXN1bHQuJHNjaGVtYSA9IFwiaHR0cDovL2pzb24tc2NoZW1hLm9yZy9kcmFmdC0wNy9zY2hlbWEjXCI7XG4gICAgfVxuICAgIGVsc2UgaWYgKGN0eC50YXJnZXQgPT09IFwiZHJhZnQtMDRcIikge1xuICAgICAgICByZXN1bHQuJHNjaGVtYSA9IFwiaHR0cDovL2pzb24tc2NoZW1hLm9yZy9kcmFmdC0wNC9zY2hlbWEjXCI7XG4gICAgfVxuICAgIGVsc2UgaWYgKGN0eC50YXJnZXQgPT09IFwib3BlbmFwaS0zLjBcIikge1xuICAgICAgICAvLyBPcGVuQVBJIDMuMCBzY2hlbWEgb2JqZWN0cyBzaG91bGQgbm90IGluY2x1ZGUgYSAkc2NoZW1hIHByb3BlcnR5XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICAvLyBBcmJpdHJhcnkgc3RyaW5nIHZhbHVlcyBhcmUgYWxsb3dlZCBidXQgd29uJ3QgaGF2ZSBhICRzY2hlbWEgcHJvcGVydHkgc2V0XG4gICAgfVxuICAgIGlmIChjdHguZXh0ZXJuYWw/LnVyaSkge1xuICAgICAgICBjb25zdCBpZCA9IGN0eC5leHRlcm5hbC5yZWdpc3RyeS5nZXQoc2NoZW1hKT8uaWQ7XG4gICAgICAgIGlmICghaWQpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTY2hlbWEgaXMgbWlzc2luZyBhbiBgaWRgIHByb3BlcnR5XCIpO1xuICAgICAgICByZXN1bHQuJGlkID0gY3R4LmV4dGVybmFsLnVyaShpZCk7XG4gICAgfVxuICAgIE9iamVjdC5hc3NpZ24ocmVzdWx0LCByb290LmRlZiA/PyByb290LnNjaGVtYSk7XG4gICAgLy8gVGhlIGBpZGAgaW4gYC5tZXRhKClgIGlzIGEgWm9kLXNwZWNpZmljIHJlZ2lzdHJhdGlvbiB0YWcgdXNlZCB0byBleHRyYWN0XG4gICAgLy8gc2NoZW1hcyBpbnRvICRkZWZzIOKAlCBpdCBpcyBub3QgdXNlci1mYWNpbmcgSlNPTiBTY2hlbWEgbWV0YWRhdGEuIFN0cmlwIGl0XG4gICAgLy8gZnJvbSB0aGUgb3V0cHV0IGJvZHkgd2hlcmUgaXQgd291bGQgb3RoZXJ3aXNlIGxlYWsuIFRoZSBpZCBpcyBwcmVzZXJ2ZWRcbiAgICAvLyBpbXBsaWNpdGx5IHZpYSB0aGUgJGRlZnMga2V5IChhbmQgdmlhICRyZWYgcGF0aHMpLlxuICAgIGNvbnN0IHJvb3RNZXRhSWQgPSBjdHgubWV0YWRhdGFSZWdpc3RyeS5nZXQoc2NoZW1hKT8uaWQ7XG4gICAgaWYgKHJvb3RNZXRhSWQgIT09IHVuZGVmaW5lZCAmJiByZXN1bHQuaWQgPT09IHJvb3RNZXRhSWQpXG4gICAgICAgIGRlbGV0ZSByZXN1bHQuaWQ7XG4gICAgLy8gYnVpbGQgZGVmcyBvYmplY3RcbiAgICBjb25zdCBkZWZzID0gY3R4LmV4dGVybmFsPy5kZWZzID8/IHt9O1xuICAgIGZvciAoY29uc3QgZW50cnkgb2YgY3R4LnNlZW4uZW50cmllcygpKSB7XG4gICAgICAgIGNvbnN0IHNlZW4gPSBlbnRyeVsxXTtcbiAgICAgICAgaWYgKHNlZW4uZGVmICYmIHNlZW4uZGVmSWQpIHtcbiAgICAgICAgICAgIGlmIChzZWVuLmRlZi5pZCA9PT0gc2Vlbi5kZWZJZClcbiAgICAgICAgICAgICAgICBkZWxldGUgc2Vlbi5kZWYuaWQ7XG4gICAgICAgICAgICBkZWZzW3NlZW4uZGVmSWRdID0gc2Vlbi5kZWY7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gc2V0IGRlZmluaXRpb25zIGluIHJlc3VsdFxuICAgIGlmIChjdHguZXh0ZXJuYWwpIHtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGlmIChPYmplY3Qua2V5cyhkZWZzKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBpZiAoY3R4LnRhcmdldCA9PT0gXCJkcmFmdC0yMDIwLTEyXCIpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQuJGRlZnMgPSBkZWZzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LmRlZmluaXRpb25zID0gZGVmcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB0aGlzIFwiZmluYWxpemVzXCIgdGhpcyBzY2hlbWEgYW5kIGVuc3VyZXMgYWxsIGN5Y2xlcyBhcmUgcmVtb3ZlZFxuICAgICAgICAvLyBlYWNoIGNhbGwgdG8gZmluYWxpemUoKSBpcyBmdW5jdGlvbmFsbHkgaW5kZXBlbmRlbnRcbiAgICAgICAgLy8gdGhvdWdoIHRoZSBzZWVuIG1hcCBpcyBzaGFyZWRcbiAgICAgICAgY29uc3QgZmluYWxpemVkID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShyZXN1bHQpKTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGZpbmFsaXplZCwgXCJ+c3RhbmRhcmRcIiwge1xuICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgICAuLi5zY2hlbWFbXCJ+c3RhbmRhcmRcIl0sXG4gICAgICAgICAgICAgICAganNvblNjaGVtYToge1xuICAgICAgICAgICAgICAgICAgICBpbnB1dDogY3JlYXRlU3RhbmRhcmRKU09OU2NoZW1hTWV0aG9kKHNjaGVtYSwgXCJpbnB1dFwiLCBjdHgucHJvY2Vzc29ycyksXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dDogY3JlYXRlU3RhbmRhcmRKU09OU2NoZW1hTWV0aG9kKHNjaGVtYSwgXCJvdXRwdXRcIiwgY3R4LnByb2Nlc3NvcnMpLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICB3cml0YWJsZTogZmFsc2UsXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZmluYWxpemVkO1xuICAgIH1cbiAgICBjYXRjaCAoX2Vycikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFcnJvciBjb252ZXJ0aW5nIHNjaGVtYSB0byBKU09OLlwiKTtcbiAgICB9XG59XG5mdW5jdGlvbiBpc1RyYW5zZm9ybWluZyhfc2NoZW1hLCBfY3R4KSB7XG4gICAgY29uc3QgY3R4ID0gX2N0eCA/PyB7IHNlZW46IG5ldyBTZXQoKSB9O1xuICAgIGlmIChjdHguc2Vlbi5oYXMoX3NjaGVtYSkpXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICBjdHguc2Vlbi5hZGQoX3NjaGVtYSk7XG4gICAgY29uc3QgZGVmID0gX3NjaGVtYS5fem9kLmRlZjtcbiAgICBpZiAoZGVmLnR5cGUgPT09IFwidHJhbnNmb3JtXCIpXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIGlmIChkZWYudHlwZSA9PT0gXCJhcnJheVwiKVxuICAgICAgICByZXR1cm4gaXNUcmFuc2Zvcm1pbmcoZGVmLmVsZW1lbnQsIGN0eCk7XG4gICAgaWYgKGRlZi50eXBlID09PSBcInNldFwiKVxuICAgICAgICByZXR1cm4gaXNUcmFuc2Zvcm1pbmcoZGVmLnZhbHVlVHlwZSwgY3R4KTtcbiAgICBpZiAoZGVmLnR5cGUgPT09IFwibGF6eVwiKVxuICAgICAgICByZXR1cm4gaXNUcmFuc2Zvcm1pbmcoZGVmLmdldHRlcigpLCBjdHgpO1xuICAgIGlmIChkZWYudHlwZSA9PT0gXCJwcm9taXNlXCIgfHxcbiAgICAgICAgZGVmLnR5cGUgPT09IFwib3B0aW9uYWxcIiB8fFxuICAgICAgICBkZWYudHlwZSA9PT0gXCJub25vcHRpb25hbFwiIHx8XG4gICAgICAgIGRlZi50eXBlID09PSBcIm51bGxhYmxlXCIgfHxcbiAgICAgICAgZGVmLnR5cGUgPT09IFwicmVhZG9ubHlcIiB8fFxuICAgICAgICBkZWYudHlwZSA9PT0gXCJkZWZhdWx0XCIgfHxcbiAgICAgICAgZGVmLnR5cGUgPT09IFwicHJlZmF1bHRcIikge1xuICAgICAgICByZXR1cm4gaXNUcmFuc2Zvcm1pbmcoZGVmLmlubmVyVHlwZSwgY3R4KTtcbiAgICB9XG4gICAgaWYgKGRlZi50eXBlID09PSBcImludGVyc2VjdGlvblwiKSB7XG4gICAgICAgIHJldHVybiBpc1RyYW5zZm9ybWluZyhkZWYubGVmdCwgY3R4KSB8fCBpc1RyYW5zZm9ybWluZyhkZWYucmlnaHQsIGN0eCk7XG4gICAgfVxuICAgIGlmIChkZWYudHlwZSA9PT0gXCJyZWNvcmRcIiB8fCBkZWYudHlwZSA9PT0gXCJtYXBcIikge1xuICAgICAgICByZXR1cm4gaXNUcmFuc2Zvcm1pbmcoZGVmLmtleVR5cGUsIGN0eCkgfHwgaXNUcmFuc2Zvcm1pbmcoZGVmLnZhbHVlVHlwZSwgY3R4KTtcbiAgICB9XG4gICAgaWYgKGRlZi50eXBlID09PSBcInBpcGVcIikge1xuICAgICAgICBpZiAoX3NjaGVtYS5fem9kLnRyYWl0cy5oYXMoXCIkWm9kQ29kZWNcIikpXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIGlzVHJhbnNmb3JtaW5nKGRlZi5pbiwgY3R4KSB8fCBpc1RyYW5zZm9ybWluZyhkZWYub3V0LCBjdHgpO1xuICAgIH1cbiAgICBpZiAoZGVmLnR5cGUgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gZGVmLnNoYXBlKSB7XG4gICAgICAgICAgICBpZiAoaXNUcmFuc2Zvcm1pbmcoZGVmLnNoYXBlW2tleV0sIGN0eCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAoZGVmLnR5cGUgPT09IFwidW5pb25cIikge1xuICAgICAgICBmb3IgKGNvbnN0IG9wdGlvbiBvZiBkZWYub3B0aW9ucykge1xuICAgICAgICAgICAgaWYgKGlzVHJhbnNmb3JtaW5nKG9wdGlvbiwgY3R4KSlcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmIChkZWYudHlwZSA9PT0gXCJ0dXBsZVwiKSB7XG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBkZWYuaXRlbXMpIHtcbiAgICAgICAgICAgIGlmIChpc1RyYW5zZm9ybWluZyhpdGVtLCBjdHgpKVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkZWYucmVzdCAmJiBpc1RyYW5zZm9ybWluZyhkZWYucmVzdCwgY3R4KSlcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cbi8qKlxuICogQ3JlYXRlcyBhIHRvSlNPTlNjaGVtYSBtZXRob2QgZm9yIGEgc2NoZW1hIGluc3RhbmNlLlxuICogVGhpcyBlbmNhcHN1bGF0ZXMgdGhlIGxvZ2ljIG9mIGluaXRpYWxpemluZyBjb250ZXh0LCBwcm9jZXNzaW5nLCBleHRyYWN0aW5nIGRlZnMsIGFuZCBmaW5hbGl6aW5nLlxuICovXG5leHBvcnQgY29uc3QgY3JlYXRlVG9KU09OU2NoZW1hTWV0aG9kID0gKHNjaGVtYSwgcHJvY2Vzc29ycyA9IHt9KSA9PiAocGFyYW1zKSA9PiB7XG4gICAgY29uc3QgY3R4ID0gaW5pdGlhbGl6ZUNvbnRleHQoeyAuLi5wYXJhbXMsIHByb2Nlc3NvcnMgfSk7XG4gICAgcHJvY2VzcyhzY2hlbWEsIGN0eCk7XG4gICAgZXh0cmFjdERlZnMoY3R4LCBzY2hlbWEpO1xuICAgIHJldHVybiBmaW5hbGl6ZShjdHgsIHNjaGVtYSk7XG59O1xuZXhwb3J0IGNvbnN0IGNyZWF0ZVN0YW5kYXJkSlNPTlNjaGVtYU1ldGhvZCA9IChzY2hlbWEsIGlvLCBwcm9jZXNzb3JzID0ge30pID0+IChwYXJhbXMpID0+IHtcbiAgICBjb25zdCB7IGxpYnJhcnlPcHRpb25zLCB0YXJnZXQgfSA9IHBhcmFtcyA/PyB7fTtcbiAgICBjb25zdCBjdHggPSBpbml0aWFsaXplQ29udGV4dCh7IC4uLihsaWJyYXJ5T3B0aW9ucyA/PyB7fSksIHRhcmdldCwgaW8sIHByb2Nlc3NvcnMgfSk7XG4gICAgcHJvY2VzcyhzY2hlbWEsIGN0eCk7XG4gICAgZXh0cmFjdERlZnMoY3R4LCBzY2hlbWEpO1xuICAgIHJldHVybiBmaW5hbGl6ZShjdHgsIHNjaGVtYSk7XG59O1xuIiwiaW1wb3J0IHsgZXh0cmFjdERlZnMsIGZpbmFsaXplLCBpbml0aWFsaXplQ29udGV4dCwgcHJvY2VzcywgfSBmcm9tIFwiLi90by1qc29uLXNjaGVtYS5qc1wiO1xuaW1wb3J0IHsgZ2V0RW51bVZhbHVlcyB9IGZyb20gXCIuL3V0aWwuanNcIjtcbmNvbnN0IGZvcm1hdE1hcCA9IHtcbiAgICBndWlkOiBcInV1aWRcIixcbiAgICB1cmw6IFwidXJpXCIsXG4gICAgZGF0ZXRpbWU6IFwiZGF0ZS10aW1lXCIsXG4gICAganNvbl9zdHJpbmc6IFwianNvbi1zdHJpbmdcIixcbiAgICByZWdleDogXCJcIiwgLy8gZG8gbm90IHNldFxufTtcbi8vID09PT09PT09PT09PT09PT09PT09IFNJTVBMRSBUWVBFIFBST0NFU1NPUlMgPT09PT09PT09PT09PT09PT09PT1cbmV4cG9ydCBjb25zdCBzdHJpbmdQcm9jZXNzb3IgPSAoc2NoZW1hLCBjdHgsIF9qc29uLCBfcGFyYW1zKSA9PiB7XG4gICAgY29uc3QganNvbiA9IF9qc29uO1xuICAgIGpzb24udHlwZSA9IFwic3RyaW5nXCI7XG4gICAgY29uc3QgeyBtaW5pbXVtLCBtYXhpbXVtLCBmb3JtYXQsIHBhdHRlcm5zLCBjb250ZW50RW5jb2RpbmcgfSA9IHNjaGVtYS5fem9kXG4gICAgICAgIC5iYWc7XG4gICAgaWYgKHR5cGVvZiBtaW5pbXVtID09PSBcIm51bWJlclwiKVxuICAgICAgICBqc29uLm1pbkxlbmd0aCA9IG1pbmltdW07XG4gICAgaWYgKHR5cGVvZiBtYXhpbXVtID09PSBcIm51bWJlclwiKVxuICAgICAgICBqc29uLm1heExlbmd0aCA9IG1heGltdW07XG4gICAgLy8gY3VzdG9tIHBhdHRlcm4gb3ZlcnJpZGVzIGZvcm1hdFxuICAgIGlmIChmb3JtYXQpIHtcbiAgICAgICAganNvbi5mb3JtYXQgPSBmb3JtYXRNYXBbZm9ybWF0XSA/PyBmb3JtYXQ7XG4gICAgICAgIGlmIChqc29uLmZvcm1hdCA9PT0gXCJcIilcbiAgICAgICAgICAgIGRlbGV0ZSBqc29uLmZvcm1hdDsgLy8gZW1wdHkgZm9ybWF0IGlzIG5vdCB2YWxpZFxuICAgICAgICAvLyBKU09OIFNjaGVtYSBmb3JtYXQ6IFwidGltZVwiIHJlcXVpcmVzIGEgZnVsbCB0aW1lIHdpdGggb2Zmc2V0IG9yIFpcbiAgICAgICAgLy8gei5pc28udGltZSgpIGRvZXMgbm90IGluY2x1ZGUgdGltZXpvbmUgaW5mb3JtYXRpb24sIHNvIGZvcm1hdDogXCJ0aW1lXCIgc2hvdWxkIG5ldmVyIGJlIHVzZWRcbiAgICAgICAgaWYgKGZvcm1hdCA9PT0gXCJ0aW1lXCIpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBqc29uLmZvcm1hdDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoY29udGVudEVuY29kaW5nKVxuICAgICAgICBqc29uLmNvbnRlbnRFbmNvZGluZyA9IGNvbnRlbnRFbmNvZGluZztcbiAgICBpZiAocGF0dGVybnMgJiYgcGF0dGVybnMuc2l6ZSA+IDApIHtcbiAgICAgICAgY29uc3QgcmVnZXhlcyA9IFsuLi5wYXR0ZXJuc107XG4gICAgICAgIGlmIChyZWdleGVzLmxlbmd0aCA9PT0gMSlcbiAgICAgICAgICAgIGpzb24ucGF0dGVybiA9IHJlZ2V4ZXNbMF0uc291cmNlO1xuICAgICAgICBlbHNlIGlmIChyZWdleGVzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIGpzb24uYWxsT2YgPSBbXG4gICAgICAgICAgICAgICAgLi4ucmVnZXhlcy5tYXAoKHJlZ2V4KSA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAuLi4oY3R4LnRhcmdldCA9PT0gXCJkcmFmdC0wN1wiIHx8IGN0eC50YXJnZXQgPT09IFwiZHJhZnQtMDRcIiB8fCBjdHgudGFyZ2V0ID09PSBcIm9wZW5hcGktMy4wXCJcbiAgICAgICAgICAgICAgICAgICAgICAgID8geyB0eXBlOiBcInN0cmluZ1wiIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDoge30pLFxuICAgICAgICAgICAgICAgICAgICBwYXR0ZXJuOiByZWdleC5zb3VyY2UsXG4gICAgICAgICAgICAgICAgfSkpLFxuICAgICAgICAgICAgXTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5leHBvcnQgY29uc3QgbnVtYmVyUHJvY2Vzc29yID0gKHNjaGVtYSwgY3R4LCBfanNvbiwgX3BhcmFtcykgPT4ge1xuICAgIGNvbnN0IGpzb24gPSBfanNvbjtcbiAgICBjb25zdCB7IG1pbmltdW0sIG1heGltdW0sIGZvcm1hdCwgbXVsdGlwbGVPZiwgZXhjbHVzaXZlTWF4aW11bSwgZXhjbHVzaXZlTWluaW11bSB9ID0gc2NoZW1hLl96b2QuYmFnO1xuICAgIGlmICh0eXBlb2YgZm9ybWF0ID09PSBcInN0cmluZ1wiICYmIGZvcm1hdC5pbmNsdWRlcyhcImludFwiKSlcbiAgICAgICAganNvbi50eXBlID0gXCJpbnRlZ2VyXCI7XG4gICAgZWxzZVxuICAgICAgICBqc29uLnR5cGUgPSBcIm51bWJlclwiO1xuICAgIC8vIHdoZW4gYm90aCBtaW5pbXVtIGFuZCBleGNsdXNpdmVNaW5pbXVtIGV4aXN0LCBwaWNrIHRoZSBtb3JlIHJlc3RyaWN0aXZlIG9uZVxuICAgIGNvbnN0IGV4TWluID0gdHlwZW9mIGV4Y2x1c2l2ZU1pbmltdW0gPT09IFwibnVtYmVyXCIgJiYgZXhjbHVzaXZlTWluaW11bSA+PSAobWluaW11bSA/PyBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFkpO1xuICAgIGNvbnN0IGV4TWF4ID0gdHlwZW9mIGV4Y2x1c2l2ZU1heGltdW0gPT09IFwibnVtYmVyXCIgJiYgZXhjbHVzaXZlTWF4aW11bSA8PSAobWF4aW11bSA/PyBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkpO1xuICAgIGNvbnN0IGxlZ2FjeSA9IGN0eC50YXJnZXQgPT09IFwiZHJhZnQtMDRcIiB8fCBjdHgudGFyZ2V0ID09PSBcIm9wZW5hcGktMy4wXCI7XG4gICAgaWYgKGV4TWluKSB7XG4gICAgICAgIGlmIChsZWdhY3kpIHtcbiAgICAgICAgICAgIGpzb24ubWluaW11bSA9IGV4Y2x1c2l2ZU1pbmltdW07XG4gICAgICAgICAgICBqc29uLmV4Y2x1c2l2ZU1pbmltdW0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAganNvbi5leGNsdXNpdmVNaW5pbXVtID0gZXhjbHVzaXZlTWluaW11bTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgbWluaW11bSA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICBqc29uLm1pbmltdW0gPSBtaW5pbXVtO1xuICAgIH1cbiAgICBpZiAoZXhNYXgpIHtcbiAgICAgICAgaWYgKGxlZ2FjeSkge1xuICAgICAgICAgICAganNvbi5tYXhpbXVtID0gZXhjbHVzaXZlTWF4aW11bTtcbiAgICAgICAgICAgIGpzb24uZXhjbHVzaXZlTWF4aW11bSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBqc29uLmV4Y2x1c2l2ZU1heGltdW0gPSBleGNsdXNpdmVNYXhpbXVtO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBtYXhpbXVtID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgIGpzb24ubWF4aW11bSA9IG1heGltdW07XG4gICAgfVxuICAgIGlmICh0eXBlb2YgbXVsdGlwbGVPZiA9PT0gXCJudW1iZXJcIilcbiAgICAgICAganNvbi5tdWx0aXBsZU9mID0gbXVsdGlwbGVPZjtcbn07XG5leHBvcnQgY29uc3QgYm9vbGVhblByb2Nlc3NvciA9IChfc2NoZW1hLCBfY3R4LCBqc29uLCBfcGFyYW1zKSA9PiB7XG4gICAganNvbi50eXBlID0gXCJib29sZWFuXCI7XG59O1xuZXhwb3J0IGNvbnN0IGJpZ2ludFByb2Nlc3NvciA9IChfc2NoZW1hLCBjdHgsIF9qc29uLCBfcGFyYW1zKSA9PiB7XG4gICAgaWYgKGN0eC51bnJlcHJlc2VudGFibGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJCaWdJbnQgY2Fubm90IGJlIHJlcHJlc2VudGVkIGluIEpTT04gU2NoZW1hXCIpO1xuICAgIH1cbn07XG5leHBvcnQgY29uc3Qgc3ltYm9sUHJvY2Vzc29yID0gKF9zY2hlbWEsIGN0eCwgX2pzb24sIF9wYXJhbXMpID0+IHtcbiAgICBpZiAoY3R4LnVucmVwcmVzZW50YWJsZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlN5bWJvbHMgY2Fubm90IGJlIHJlcHJlc2VudGVkIGluIEpTT04gU2NoZW1hXCIpO1xuICAgIH1cbn07XG5leHBvcnQgY29uc3QgbnVsbFByb2Nlc3NvciA9IChfc2NoZW1hLCBjdHgsIGpzb24sIF9wYXJhbXMpID0+IHtcbiAgICBpZiAoY3R4LnRhcmdldCA9PT0gXCJvcGVuYXBpLTMuMFwiKSB7XG4gICAgICAgIGpzb24udHlwZSA9IFwic3RyaW5nXCI7XG4gICAgICAgIGpzb24ubnVsbGFibGUgPSB0cnVlO1xuICAgICAgICBqc29uLmVudW0gPSBbbnVsbF07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBqc29uLnR5cGUgPSBcIm51bGxcIjtcbiAgICB9XG59O1xuZXhwb3J0IGNvbnN0IHVuZGVmaW5lZFByb2Nlc3NvciA9IChfc2NoZW1hLCBjdHgsIF9qc29uLCBfcGFyYW1zKSA9PiB7XG4gICAgaWYgKGN0eC51bnJlcHJlc2VudGFibGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmRlZmluZWQgY2Fubm90IGJlIHJlcHJlc2VudGVkIGluIEpTT04gU2NoZW1hXCIpO1xuICAgIH1cbn07XG5leHBvcnQgY29uc3Qgdm9pZFByb2Nlc3NvciA9IChfc2NoZW1hLCBjdHgsIF9qc29uLCBfcGFyYW1zKSA9PiB7XG4gICAgaWYgKGN0eC51bnJlcHJlc2VudGFibGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJWb2lkIGNhbm5vdCBiZSByZXByZXNlbnRlZCBpbiBKU09OIFNjaGVtYVwiKTtcbiAgICB9XG59O1xuZXhwb3J0IGNvbnN0IG5ldmVyUHJvY2Vzc29yID0gKF9zY2hlbWEsIF9jdHgsIGpzb24sIF9wYXJhbXMpID0+IHtcbiAgICBqc29uLm5vdCA9IHt9O1xufTtcbmV4cG9ydCBjb25zdCBhbnlQcm9jZXNzb3IgPSAoX3NjaGVtYSwgX2N0eCwgX2pzb24sIF9wYXJhbXMpID0+IHtcbiAgICAvLyBlbXB0eSBzY2hlbWEgYWNjZXB0cyBhbnl0aGluZ1xufTtcbmV4cG9ydCBjb25zdCB1bmtub3duUHJvY2Vzc29yID0gKF9zY2hlbWEsIF9jdHgsIF9qc29uLCBfcGFyYW1zKSA9PiB7XG4gICAgLy8gZW1wdHkgc2NoZW1hIGFjY2VwdHMgYW55dGhpbmdcbn07XG5leHBvcnQgY29uc3QgZGF0ZVByb2Nlc3NvciA9IChfc2NoZW1hLCBjdHgsIF9qc29uLCBfcGFyYW1zKSA9PiB7XG4gICAgaWYgKGN0eC51bnJlcHJlc2VudGFibGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJEYXRlIGNhbm5vdCBiZSByZXByZXNlbnRlZCBpbiBKU09OIFNjaGVtYVwiKTtcbiAgICB9XG59O1xuZXhwb3J0IGNvbnN0IGVudW1Qcm9jZXNzb3IgPSAoc2NoZW1hLCBfY3R4LCBqc29uLCBfcGFyYW1zKSA9PiB7XG4gICAgY29uc3QgZGVmID0gc2NoZW1hLl96b2QuZGVmO1xuICAgIGNvbnN0IHZhbHVlcyA9IGdldEVudW1WYWx1ZXMoZGVmLmVudHJpZXMpO1xuICAgIC8vIE51bWJlciBlbnVtcyBjYW4gaGF2ZSBib3RoIHN0cmluZyBhbmQgbnVtYmVyIHZhbHVlc1xuICAgIGlmICh2YWx1ZXMuZXZlcnkoKHYpID0+IHR5cGVvZiB2ID09PSBcIm51bWJlclwiKSlcbiAgICAgICAganNvbi50eXBlID0gXCJudW1iZXJcIjtcbiAgICBpZiAodmFsdWVzLmV2ZXJ5KCh2KSA9PiB0eXBlb2YgdiA9PT0gXCJzdHJpbmdcIikpXG4gICAgICAgIGpzb24udHlwZSA9IFwic3RyaW5nXCI7XG4gICAganNvbi5lbnVtID0gdmFsdWVzO1xufTtcbmV4cG9ydCBjb25zdCBsaXRlcmFsUHJvY2Vzc29yID0gKHNjaGVtYSwgY3R4LCBqc29uLCBfcGFyYW1zKSA9PiB7XG4gICAgY29uc3QgZGVmID0gc2NoZW1hLl96b2QuZGVmO1xuICAgIGNvbnN0IHZhbHMgPSBbXTtcbiAgICBmb3IgKGNvbnN0IHZhbCBvZiBkZWYudmFsdWVzKSB7XG4gICAgICAgIGlmICh2YWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKGN0eC51bnJlcHJlc2VudGFibGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkxpdGVyYWwgYHVuZGVmaW5lZGAgY2Fubm90IGJlIHJlcHJlc2VudGVkIGluIEpTT04gU2NoZW1hXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gZG8gbm90IGFkZCB0byB2YWxzXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIHZhbCA9PT0gXCJiaWdpbnRcIikge1xuICAgICAgICAgICAgaWYgKGN0eC51bnJlcHJlc2VudGFibGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkJpZ0ludCBsaXRlcmFscyBjYW5ub3QgYmUgcmVwcmVzZW50ZWQgaW4gSlNPTiBTY2hlbWFcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YWxzLnB1c2goTnVtYmVyKHZhbCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFscy5wdXNoKHZhbCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHZhbHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIC8vIGRvIG5vdGhpbmcgKGFuIHVuZGVmaW5lZCBsaXRlcmFsIHdhcyBzdHJpcHBlZClcbiAgICB9XG4gICAgZWxzZSBpZiAodmFscy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgY29uc3QgdmFsID0gdmFsc1swXTtcbiAgICAgICAganNvbi50eXBlID0gdmFsID09PSBudWxsID8gXCJudWxsXCIgOiB0eXBlb2YgdmFsO1xuICAgICAgICBpZiAoY3R4LnRhcmdldCA9PT0gXCJkcmFmdC0wNFwiIHx8IGN0eC50YXJnZXQgPT09IFwib3BlbmFwaS0zLjBcIikge1xuICAgICAgICAgICAganNvbi5lbnVtID0gW3ZhbF07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBqc29uLmNvbnN0ID0gdmFsO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpZiAodmFscy5ldmVyeSgodikgPT4gdHlwZW9mIHYgPT09IFwibnVtYmVyXCIpKVxuICAgICAgICAgICAganNvbi50eXBlID0gXCJudW1iZXJcIjtcbiAgICAgICAgaWYgKHZhbHMuZXZlcnkoKHYpID0+IHR5cGVvZiB2ID09PSBcInN0cmluZ1wiKSlcbiAgICAgICAgICAgIGpzb24udHlwZSA9IFwic3RyaW5nXCI7XG4gICAgICAgIGlmICh2YWxzLmV2ZXJ5KCh2KSA9PiB0eXBlb2YgdiA9PT0gXCJib29sZWFuXCIpKVxuICAgICAgICAgICAganNvbi50eXBlID0gXCJib29sZWFuXCI7XG4gICAgICAgIGlmICh2YWxzLmV2ZXJ5KCh2KSA9PiB2ID09PSBudWxsKSlcbiAgICAgICAgICAgIGpzb24udHlwZSA9IFwibnVsbFwiO1xuICAgICAgICBqc29uLmVudW0gPSB2YWxzO1xuICAgIH1cbn07XG5leHBvcnQgY29uc3QgbmFuUHJvY2Vzc29yID0gKF9zY2hlbWEsIGN0eCwgX2pzb24sIF9wYXJhbXMpID0+IHtcbiAgICBpZiAoY3R4LnVucmVwcmVzZW50YWJsZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5hTiBjYW5ub3QgYmUgcmVwcmVzZW50ZWQgaW4gSlNPTiBTY2hlbWFcIik7XG4gICAgfVxufTtcbmV4cG9ydCBjb25zdCB0ZW1wbGF0ZUxpdGVyYWxQcm9jZXNzb3IgPSAoc2NoZW1hLCBfY3R4LCBqc29uLCBfcGFyYW1zKSA9PiB7XG4gICAgY29uc3QgX2pzb24gPSBqc29uO1xuICAgIGNvbnN0IHBhdHRlcm4gPSBzY2hlbWEuX3pvZC5wYXR0ZXJuO1xuICAgIGlmICghcGF0dGVybilcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUGF0dGVybiBub3QgZm91bmQgaW4gdGVtcGxhdGUgbGl0ZXJhbFwiKTtcbiAgICBfanNvbi50eXBlID0gXCJzdHJpbmdcIjtcbiAgICBfanNvbi5wYXR0ZXJuID0gcGF0dGVybi5zb3VyY2U7XG59O1xuZXhwb3J0IGNvbnN0IGZpbGVQcm9jZXNzb3IgPSAoc2NoZW1hLCBfY3R4LCBqc29uLCBfcGFyYW1zKSA9PiB7XG4gICAgY29uc3QgX2pzb24gPSBqc29uO1xuICAgIGNvbnN0IGZpbGUgPSB7XG4gICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgIGZvcm1hdDogXCJiaW5hcnlcIixcbiAgICAgICAgY29udGVudEVuY29kaW5nOiBcImJpbmFyeVwiLFxuICAgIH07XG4gICAgY29uc3QgeyBtaW5pbXVtLCBtYXhpbXVtLCBtaW1lIH0gPSBzY2hlbWEuX3pvZC5iYWc7XG4gICAgaWYgKG1pbmltdW0gIT09IHVuZGVmaW5lZClcbiAgICAgICAgZmlsZS5taW5MZW5ndGggPSBtaW5pbXVtO1xuICAgIGlmIChtYXhpbXVtICE9PSB1bmRlZmluZWQpXG4gICAgICAgIGZpbGUubWF4TGVuZ3RoID0gbWF4aW11bTtcbiAgICBpZiAobWltZSkge1xuICAgICAgICBpZiAobWltZS5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIGZpbGUuY29udGVudE1lZGlhVHlwZSA9IG1pbWVbMF07XG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKF9qc29uLCBmaWxlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oX2pzb24sIGZpbGUpOyAvLyBzaGFyZWQgcHJvcHMgYXQgcm9vdFxuICAgICAgICAgICAgX2pzb24uYW55T2YgPSBtaW1lLm1hcCgobSkgPT4gKHsgY29udGVudE1lZGlhVHlwZTogbSB9KSk7IC8vIG9ubHkgY29udGVudE1lZGlhVHlwZSBkaWZmZXJzXG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24oX2pzb24sIGZpbGUpO1xuICAgIH1cbn07XG5leHBvcnQgY29uc3Qgc3VjY2Vzc1Byb2Nlc3NvciA9IChfc2NoZW1hLCBfY3R4LCBqc29uLCBfcGFyYW1zKSA9PiB7XG4gICAganNvbi50eXBlID0gXCJib29sZWFuXCI7XG59O1xuZXhwb3J0IGNvbnN0IGN1c3RvbVByb2Nlc3NvciA9IChfc2NoZW1hLCBjdHgsIF9qc29uLCBfcGFyYW1zKSA9PiB7XG4gICAgaWYgKGN0eC51bnJlcHJlc2VudGFibGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDdXN0b20gdHlwZXMgY2Fubm90IGJlIHJlcHJlc2VudGVkIGluIEpTT04gU2NoZW1hXCIpO1xuICAgIH1cbn07XG5leHBvcnQgY29uc3QgZnVuY3Rpb25Qcm9jZXNzb3IgPSAoX3NjaGVtYSwgY3R4LCBfanNvbiwgX3BhcmFtcykgPT4ge1xuICAgIGlmIChjdHgudW5yZXByZXNlbnRhYmxlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRnVuY3Rpb24gdHlwZXMgY2Fubm90IGJlIHJlcHJlc2VudGVkIGluIEpTT04gU2NoZW1hXCIpO1xuICAgIH1cbn07XG5leHBvcnQgY29uc3QgdHJhbnNmb3JtUHJvY2Vzc29yID0gKF9zY2hlbWEsIGN0eCwgX2pzb24sIF9wYXJhbXMpID0+IHtcbiAgICBpZiAoY3R4LnVucmVwcmVzZW50YWJsZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRyYW5zZm9ybXMgY2Fubm90IGJlIHJlcHJlc2VudGVkIGluIEpTT04gU2NoZW1hXCIpO1xuICAgIH1cbn07XG5leHBvcnQgY29uc3QgbWFwUHJvY2Vzc29yID0gKF9zY2hlbWEsIGN0eCwgX2pzb24sIF9wYXJhbXMpID0+IHtcbiAgICBpZiAoY3R4LnVucmVwcmVzZW50YWJsZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk1hcCBjYW5ub3QgYmUgcmVwcmVzZW50ZWQgaW4gSlNPTiBTY2hlbWFcIik7XG4gICAgfVxufTtcbmV4cG9ydCBjb25zdCBzZXRQcm9jZXNzb3IgPSAoX3NjaGVtYSwgY3R4LCBfanNvbiwgX3BhcmFtcykgPT4ge1xuICAgIGlmIChjdHgudW5yZXByZXNlbnRhYmxlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2V0IGNhbm5vdCBiZSByZXByZXNlbnRlZCBpbiBKU09OIFNjaGVtYVwiKTtcbiAgICB9XG59O1xuLy8gPT09PT09PT09PT09PT09PT09PT0gQ09NUE9TSVRFIFRZUEUgUFJPQ0VTU09SUyA9PT09PT09PT09PT09PT09PT09PVxuZXhwb3J0IGNvbnN0IGFycmF5UHJvY2Vzc29yID0gKHNjaGVtYSwgY3R4LCBfanNvbiwgcGFyYW1zKSA9PiB7XG4gICAgY29uc3QganNvbiA9IF9qc29uO1xuICAgIGNvbnN0IGRlZiA9IHNjaGVtYS5fem9kLmRlZjtcbiAgICBjb25zdCB7IG1pbmltdW0sIG1heGltdW0gfSA9IHNjaGVtYS5fem9kLmJhZztcbiAgICBpZiAodHlwZW9mIG1pbmltdW0gPT09IFwibnVtYmVyXCIpXG4gICAgICAgIGpzb24ubWluSXRlbXMgPSBtaW5pbXVtO1xuICAgIGlmICh0eXBlb2YgbWF4aW11bSA9PT0gXCJudW1iZXJcIilcbiAgICAgICAganNvbi5tYXhJdGVtcyA9IG1heGltdW07XG4gICAganNvbi50eXBlID0gXCJhcnJheVwiO1xuICAgIGpzb24uaXRlbXMgPSBwcm9jZXNzKGRlZi5lbGVtZW50LCBjdHgsIHtcbiAgICAgICAgLi4ucGFyYW1zLFxuICAgICAgICBwYXRoOiBbLi4ucGFyYW1zLnBhdGgsIFwiaXRlbXNcIl0sXG4gICAgfSk7XG59O1xuZXhwb3J0IGNvbnN0IG9iamVjdFByb2Nlc3NvciA9IChzY2hlbWEsIGN0eCwgX2pzb24sIHBhcmFtcykgPT4ge1xuICAgIGNvbnN0IGpzb24gPSBfanNvbjtcbiAgICBjb25zdCBkZWYgPSBzY2hlbWEuX3pvZC5kZWY7XG4gICAganNvbi50eXBlID0gXCJvYmplY3RcIjtcbiAgICBqc29uLnByb3BlcnRpZXMgPSB7fTtcbiAgICBjb25zdCBzaGFwZSA9IGRlZi5zaGFwZTtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBzaGFwZSkge1xuICAgICAgICBqc29uLnByb3BlcnRpZXNba2V5XSA9IHByb2Nlc3Moc2hhcGVba2V5XSwgY3R4LCB7XG4gICAgICAgICAgICAuLi5wYXJhbXMsXG4gICAgICAgICAgICBwYXRoOiBbLi4ucGFyYW1zLnBhdGgsIFwicHJvcGVydGllc1wiLCBrZXldLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLy8gcmVxdWlyZWQga2V5c1xuICAgIGNvbnN0IGFsbEtleXMgPSBuZXcgU2V0KE9iamVjdC5rZXlzKHNoYXBlKSk7XG4gICAgY29uc3QgcmVxdWlyZWRLZXlzID0gbmV3IFNldChbLi4uYWxsS2V5c10uZmlsdGVyKChrZXkpID0+IHtcbiAgICAgICAgY29uc3QgdiA9IGRlZi5zaGFwZVtrZXldLl96b2Q7XG4gICAgICAgIGlmIChjdHguaW8gPT09IFwiaW5wdXRcIikge1xuICAgICAgICAgICAgcmV0dXJuIHYub3B0aW4gPT09IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB2Lm9wdG91dCA9PT0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfSkpO1xuICAgIGlmIChyZXF1aXJlZEtleXMuc2l6ZSA+IDApIHtcbiAgICAgICAganNvbi5yZXF1aXJlZCA9IEFycmF5LmZyb20ocmVxdWlyZWRLZXlzKTtcbiAgICB9XG4gICAgLy8gY2F0Y2hhbGxcbiAgICBpZiAoZGVmLmNhdGNoYWxsPy5fem9kLmRlZi50eXBlID09PSBcIm5ldmVyXCIpIHtcbiAgICAgICAgLy8gc3RyaWN0XG4gICAgICAgIGpzb24uYWRkaXRpb25hbFByb3BlcnRpZXMgPSBmYWxzZTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIWRlZi5jYXRjaGFsbCkge1xuICAgICAgICAvLyByZWd1bGFyXG4gICAgICAgIGlmIChjdHguaW8gPT09IFwib3V0cHV0XCIpXG4gICAgICAgICAgICBqc29uLmFkZGl0aW9uYWxQcm9wZXJ0aWVzID0gZmFsc2U7XG4gICAgfVxuICAgIGVsc2UgaWYgKGRlZi5jYXRjaGFsbCkge1xuICAgICAgICBqc29uLmFkZGl0aW9uYWxQcm9wZXJ0aWVzID0gcHJvY2VzcyhkZWYuY2F0Y2hhbGwsIGN0eCwge1xuICAgICAgICAgICAgLi4ucGFyYW1zLFxuICAgICAgICAgICAgcGF0aDogWy4uLnBhcmFtcy5wYXRoLCBcImFkZGl0aW9uYWxQcm9wZXJ0aWVzXCJdLFxuICAgICAgICB9KTtcbiAgICB9XG59O1xuZXhwb3J0IGNvbnN0IHVuaW9uUHJvY2Vzc29yID0gKHNjaGVtYSwgY3R4LCBqc29uLCBwYXJhbXMpID0+IHtcbiAgICBjb25zdCBkZWYgPSBzY2hlbWEuX3pvZC5kZWY7XG4gICAgLy8gRXhjbHVzaXZlIHVuaW9ucyAoaW5jbHVzaXZlID09PSBmYWxzZSkgdXNlIG9uZU9mIChleGFjdGx5IG9uZSBtYXRjaCkgaW5zdGVhZCBvZiBhbnlPZiAob25lIG9yIG1vcmUgbWF0Y2hlcylcbiAgICAvLyBUaGlzIGluY2x1ZGVzIGJvdGggei54b3IoKSBhbmQgZGlzY3JpbWluYXRlZCB1bmlvbnNcbiAgICBjb25zdCBpc0V4Y2x1c2l2ZSA9IGRlZi5pbmNsdXNpdmUgPT09IGZhbHNlO1xuICAgIGNvbnN0IG9wdGlvbnMgPSBkZWYub3B0aW9ucy5tYXAoKHgsIGkpID0+IHByb2Nlc3MoeCwgY3R4LCB7XG4gICAgICAgIC4uLnBhcmFtcyxcbiAgICAgICAgcGF0aDogWy4uLnBhcmFtcy5wYXRoLCBpc0V4Y2x1c2l2ZSA/IFwib25lT2ZcIiA6IFwiYW55T2ZcIiwgaV0sXG4gICAgfSkpO1xuICAgIGlmIChpc0V4Y2x1c2l2ZSkge1xuICAgICAgICBqc29uLm9uZU9mID0gb3B0aW9ucztcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGpzb24uYW55T2YgPSBvcHRpb25zO1xuICAgIH1cbn07XG5leHBvcnQgY29uc3QgaW50ZXJzZWN0aW9uUHJvY2Vzc29yID0gKHNjaGVtYSwgY3R4LCBqc29uLCBwYXJhbXMpID0+IHtcbiAgICBjb25zdCBkZWYgPSBzY2hlbWEuX3pvZC5kZWY7XG4gICAgY29uc3QgYSA9IHByb2Nlc3MoZGVmLmxlZnQsIGN0eCwge1xuICAgICAgICAuLi5wYXJhbXMsXG4gICAgICAgIHBhdGg6IFsuLi5wYXJhbXMucGF0aCwgXCJhbGxPZlwiLCAwXSxcbiAgICB9KTtcbiAgICBjb25zdCBiID0gcHJvY2VzcyhkZWYucmlnaHQsIGN0eCwge1xuICAgICAgICAuLi5wYXJhbXMsXG4gICAgICAgIHBhdGg6IFsuLi5wYXJhbXMucGF0aCwgXCJhbGxPZlwiLCAxXSxcbiAgICB9KTtcbiAgICBjb25zdCBpc1NpbXBsZUludGVyc2VjdGlvbiA9ICh2YWwpID0+IFwiYWxsT2ZcIiBpbiB2YWwgJiYgT2JqZWN0LmtleXModmFsKS5sZW5ndGggPT09IDE7XG4gICAgY29uc3QgYWxsT2YgPSBbXG4gICAgICAgIC4uLihpc1NpbXBsZUludGVyc2VjdGlvbihhKSA/IGEuYWxsT2YgOiBbYV0pLFxuICAgICAgICAuLi4oaXNTaW1wbGVJbnRlcnNlY3Rpb24oYikgPyBiLmFsbE9mIDogW2JdKSxcbiAgICBdO1xuICAgIGpzb24uYWxsT2YgPSBhbGxPZjtcbn07XG5leHBvcnQgY29uc3QgdHVwbGVQcm9jZXNzb3IgPSAoc2NoZW1hLCBjdHgsIF9qc29uLCBwYXJhbXMpID0+IHtcbiAgICBjb25zdCBqc29uID0gX2pzb247XG4gICAgY29uc3QgZGVmID0gc2NoZW1hLl96b2QuZGVmO1xuICAgIGpzb24udHlwZSA9IFwiYXJyYXlcIjtcbiAgICBjb25zdCBwcmVmaXhQYXRoID0gY3R4LnRhcmdldCA9PT0gXCJkcmFmdC0yMDIwLTEyXCIgPyBcInByZWZpeEl0ZW1zXCIgOiBcIml0ZW1zXCI7XG4gICAgY29uc3QgcmVzdFBhdGggPSBjdHgudGFyZ2V0ID09PSBcImRyYWZ0LTIwMjAtMTJcIiA/IFwiaXRlbXNcIiA6IGN0eC50YXJnZXQgPT09IFwib3BlbmFwaS0zLjBcIiA/IFwiaXRlbXNcIiA6IFwiYWRkaXRpb25hbEl0ZW1zXCI7XG4gICAgY29uc3QgcHJlZml4SXRlbXMgPSBkZWYuaXRlbXMubWFwKCh4LCBpKSA9PiBwcm9jZXNzKHgsIGN0eCwge1xuICAgICAgICAuLi5wYXJhbXMsXG4gICAgICAgIHBhdGg6IFsuLi5wYXJhbXMucGF0aCwgcHJlZml4UGF0aCwgaV0sXG4gICAgfSkpO1xuICAgIGNvbnN0IHJlc3QgPSBkZWYucmVzdFxuICAgICAgICA/IHByb2Nlc3MoZGVmLnJlc3QsIGN0eCwge1xuICAgICAgICAgICAgLi4ucGFyYW1zLFxuICAgICAgICAgICAgcGF0aDogWy4uLnBhcmFtcy5wYXRoLCByZXN0UGF0aCwgLi4uKGN0eC50YXJnZXQgPT09IFwib3BlbmFwaS0zLjBcIiA/IFtkZWYuaXRlbXMubGVuZ3RoXSA6IFtdKV0sXG4gICAgICAgIH0pXG4gICAgICAgIDogbnVsbDtcbiAgICBpZiAoY3R4LnRhcmdldCA9PT0gXCJkcmFmdC0yMDIwLTEyXCIpIHtcbiAgICAgICAganNvbi5wcmVmaXhJdGVtcyA9IHByZWZpeEl0ZW1zO1xuICAgICAgICBpZiAocmVzdCkge1xuICAgICAgICAgICAganNvbi5pdGVtcyA9IHJlc3Q7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoY3R4LnRhcmdldCA9PT0gXCJvcGVuYXBpLTMuMFwiKSB7XG4gICAgICAgIGpzb24uaXRlbXMgPSB7XG4gICAgICAgICAgICBhbnlPZjogcHJlZml4SXRlbXMsXG4gICAgICAgIH07XG4gICAgICAgIGlmIChyZXN0KSB7XG4gICAgICAgICAgICBqc29uLml0ZW1zLmFueU9mLnB1c2gocmVzdCk7XG4gICAgICAgIH1cbiAgICAgICAganNvbi5taW5JdGVtcyA9IHByZWZpeEl0ZW1zLmxlbmd0aDtcbiAgICAgICAgaWYgKCFyZXN0KSB7XG4gICAgICAgICAgICBqc29uLm1heEl0ZW1zID0gcHJlZml4SXRlbXMubGVuZ3RoO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBqc29uLml0ZW1zID0gcHJlZml4SXRlbXM7XG4gICAgICAgIGlmIChyZXN0KSB7XG4gICAgICAgICAgICBqc29uLmFkZGl0aW9uYWxJdGVtcyA9IHJlc3Q7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gbGVuZ3RoXG4gICAgY29uc3QgeyBtaW5pbXVtLCBtYXhpbXVtIH0gPSBzY2hlbWEuX3pvZC5iYWc7XG4gICAgaWYgKHR5cGVvZiBtaW5pbXVtID09PSBcIm51bWJlclwiKVxuICAgICAgICBqc29uLm1pbkl0ZW1zID0gbWluaW11bTtcbiAgICBpZiAodHlwZW9mIG1heGltdW0gPT09IFwibnVtYmVyXCIpXG4gICAgICAgIGpzb24ubWF4SXRlbXMgPSBtYXhpbXVtO1xufTtcbmV4cG9ydCBjb25zdCByZWNvcmRQcm9jZXNzb3IgPSAoc2NoZW1hLCBjdHgsIF9qc29uLCBwYXJhbXMpID0+IHtcbiAgICBjb25zdCBqc29uID0gX2pzb247XG4gICAgY29uc3QgZGVmID0gc2NoZW1hLl96b2QuZGVmO1xuICAgIGpzb24udHlwZSA9IFwib2JqZWN0XCI7XG4gICAgLy8gRm9yIGxvb3NlUmVjb3JkIHdpdGggcmVnZXggcGF0dGVybnMsIHVzZSBwYXR0ZXJuUHJvcGVydGllc1xuICAgIC8vIFRoaXMgY29ycmVjdGx5IHJlcHJlc2VudHMgXCJvbmx5IHZhbGlkYXRlIGtleXMgbWF0Y2hpbmcgdGhlIHBhdHRlcm5cIiBzZW1hbnRpY3NcbiAgICAvLyBhbmQgY29tcG9zZXMgd2VsbCB3aXRoIGFsbE9mIChpbnRlcnNlY3Rpb25zKVxuICAgIGNvbnN0IGtleVR5cGUgPSBkZWYua2V5VHlwZTtcbiAgICBjb25zdCBrZXlCYWcgPSBrZXlUeXBlLl96b2QuYmFnO1xuICAgIGNvbnN0IHBhdHRlcm5zID0ga2V5QmFnPy5wYXR0ZXJucztcbiAgICBpZiAoZGVmLm1vZGUgPT09IFwibG9vc2VcIiAmJiBwYXR0ZXJucyAmJiBwYXR0ZXJucy5zaXplID4gMCkge1xuICAgICAgICAvLyBVc2UgcGF0dGVyblByb3BlcnRpZXMgZm9yIGxvb3NlUmVjb3JkIHdpdGggcmVnZXggcGF0dGVybnNcbiAgICAgICAgY29uc3QgdmFsdWVTY2hlbWEgPSBwcm9jZXNzKGRlZi52YWx1ZVR5cGUsIGN0eCwge1xuICAgICAgICAgICAgLi4ucGFyYW1zLFxuICAgICAgICAgICAgcGF0aDogWy4uLnBhcmFtcy5wYXRoLCBcInBhdHRlcm5Qcm9wZXJ0aWVzXCIsIFwiKlwiXSxcbiAgICAgICAgfSk7XG4gICAgICAgIGpzb24ucGF0dGVyblByb3BlcnRpZXMgPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCBwYXR0ZXJuIG9mIHBhdHRlcm5zKSB7XG4gICAgICAgICAgICBqc29uLnBhdHRlcm5Qcm9wZXJ0aWVzW3BhdHRlcm4uc291cmNlXSA9IHZhbHVlU2NoZW1hO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICAvLyBEZWZhdWx0IGJlaGF2aW9yOiB1c2UgcHJvcGVydHlOYW1lcyArIGFkZGl0aW9uYWxQcm9wZXJ0aWVzXG4gICAgICAgIGlmIChjdHgudGFyZ2V0ID09PSBcImRyYWZ0LTA3XCIgfHwgY3R4LnRhcmdldCA9PT0gXCJkcmFmdC0yMDIwLTEyXCIpIHtcbiAgICAgICAgICAgIGpzb24ucHJvcGVydHlOYW1lcyA9IHByb2Nlc3MoZGVmLmtleVR5cGUsIGN0eCwge1xuICAgICAgICAgICAgICAgIC4uLnBhcmFtcyxcbiAgICAgICAgICAgICAgICBwYXRoOiBbLi4ucGFyYW1zLnBhdGgsIFwicHJvcGVydHlOYW1lc1wiXSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGpzb24uYWRkaXRpb25hbFByb3BlcnRpZXMgPSBwcm9jZXNzKGRlZi52YWx1ZVR5cGUsIGN0eCwge1xuICAgICAgICAgICAgLi4ucGFyYW1zLFxuICAgICAgICAgICAgcGF0aDogWy4uLnBhcmFtcy5wYXRoLCBcImFkZGl0aW9uYWxQcm9wZXJ0aWVzXCJdLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLy8gQWRkIHJlcXVpcmVkIGZvciBrZXlzIHdpdGggZGlzY3JldGUgdmFsdWVzIChlbnVtLCBsaXRlcmFsLCBldGMuKVxuICAgIGNvbnN0IGtleVZhbHVlcyA9IGtleVR5cGUuX3pvZC52YWx1ZXM7XG4gICAgaWYgKGtleVZhbHVlcykge1xuICAgICAgICBjb25zdCB2YWxpZEtleVZhbHVlcyA9IFsuLi5rZXlWYWx1ZXNdLmZpbHRlcigodikgPT4gdHlwZW9mIHYgPT09IFwic3RyaW5nXCIgfHwgdHlwZW9mIHYgPT09IFwibnVtYmVyXCIpO1xuICAgICAgICBpZiAodmFsaWRLZXlWYWx1ZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAganNvbi5yZXF1aXJlZCA9IHZhbGlkS2V5VmFsdWVzO1xuICAgICAgICB9XG4gICAgfVxufTtcbmV4cG9ydCBjb25zdCBudWxsYWJsZVByb2Nlc3NvciA9IChzY2hlbWEsIGN0eCwganNvbiwgcGFyYW1zKSA9PiB7XG4gICAgY29uc3QgZGVmID0gc2NoZW1hLl96b2QuZGVmO1xuICAgIGNvbnN0IGlubmVyID0gcHJvY2VzcyhkZWYuaW5uZXJUeXBlLCBjdHgsIHBhcmFtcyk7XG4gICAgY29uc3Qgc2VlbiA9IGN0eC5zZWVuLmdldChzY2hlbWEpO1xuICAgIGlmIChjdHgudGFyZ2V0ID09PSBcIm9wZW5hcGktMy4wXCIpIHtcbiAgICAgICAgc2Vlbi5yZWYgPSBkZWYuaW5uZXJUeXBlO1xuICAgICAgICBqc29uLm51bGxhYmxlID0gdHJ1ZTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGpzb24uYW55T2YgPSBbaW5uZXIsIHsgdHlwZTogXCJudWxsXCIgfV07XG4gICAgfVxufTtcbmV4cG9ydCBjb25zdCBub25vcHRpb25hbFByb2Nlc3NvciA9IChzY2hlbWEsIGN0eCwgX2pzb24sIHBhcmFtcykgPT4ge1xuICAgIGNvbnN0IGRlZiA9IHNjaGVtYS5fem9kLmRlZjtcbiAgICBwcm9jZXNzKGRlZi5pbm5lclR5cGUsIGN0eCwgcGFyYW1zKTtcbiAgICBjb25zdCBzZWVuID0gY3R4LnNlZW4uZ2V0KHNjaGVtYSk7XG4gICAgc2Vlbi5yZWYgPSBkZWYuaW5uZXJUeXBlO1xufTtcbmV4cG9ydCBjb25zdCBkZWZhdWx0UHJvY2Vzc29yID0gKHNjaGVtYSwgY3R4LCBqc29uLCBwYXJhbXMpID0+IHtcbiAgICBjb25zdCBkZWYgPSBzY2hlbWEuX3pvZC5kZWY7XG4gICAgcHJvY2VzcyhkZWYuaW5uZXJUeXBlLCBjdHgsIHBhcmFtcyk7XG4gICAgY29uc3Qgc2VlbiA9IGN0eC5zZWVuLmdldChzY2hlbWEpO1xuICAgIHNlZW4ucmVmID0gZGVmLmlubmVyVHlwZTtcbiAgICBqc29uLmRlZmF1bHQgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGRlZi5kZWZhdWx0VmFsdWUpKTtcbn07XG5leHBvcnQgY29uc3QgcHJlZmF1bHRQcm9jZXNzb3IgPSAoc2NoZW1hLCBjdHgsIGpzb24sIHBhcmFtcykgPT4ge1xuICAgIGNvbnN0IGRlZiA9IHNjaGVtYS5fem9kLmRlZjtcbiAgICBwcm9jZXNzKGRlZi5pbm5lclR5cGUsIGN0eCwgcGFyYW1zKTtcbiAgICBjb25zdCBzZWVuID0gY3R4LnNlZW4uZ2V0KHNjaGVtYSk7XG4gICAgc2Vlbi5yZWYgPSBkZWYuaW5uZXJUeXBlO1xuICAgIGlmIChjdHguaW8gPT09IFwiaW5wdXRcIilcbiAgICAgICAganNvbi5fcHJlZmF1bHQgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGRlZi5kZWZhdWx0VmFsdWUpKTtcbn07XG5leHBvcnQgY29uc3QgY2F0Y2hQcm9jZXNzb3IgPSAoc2NoZW1hLCBjdHgsIGpzb24sIHBhcmFtcykgPT4ge1xuICAgIGNvbnN0IGRlZiA9IHNjaGVtYS5fem9kLmRlZjtcbiAgICBwcm9jZXNzKGRlZi5pbm5lclR5cGUsIGN0eCwgcGFyYW1zKTtcbiAgICBjb25zdCBzZWVuID0gY3R4LnNlZW4uZ2V0KHNjaGVtYSk7XG4gICAgc2Vlbi5yZWYgPSBkZWYuaW5uZXJUeXBlO1xuICAgIGxldCBjYXRjaFZhbHVlO1xuICAgIHRyeSB7XG4gICAgICAgIGNhdGNoVmFsdWUgPSBkZWYuY2F0Y2hWYWx1ZSh1bmRlZmluZWQpO1xuICAgIH1cbiAgICBjYXRjaCB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkR5bmFtaWMgY2F0Y2ggdmFsdWVzIGFyZSBub3Qgc3VwcG9ydGVkIGluIEpTT04gU2NoZW1hXCIpO1xuICAgIH1cbiAgICBqc29uLmRlZmF1bHQgPSBjYXRjaFZhbHVlO1xufTtcbmV4cG9ydCBjb25zdCBwaXBlUHJvY2Vzc29yID0gKHNjaGVtYSwgY3R4LCBfanNvbiwgcGFyYW1zKSA9PiB7XG4gICAgY29uc3QgZGVmID0gc2NoZW1hLl96b2QuZGVmO1xuICAgIGNvbnN0IGluSXNUcmFuc2Zvcm0gPSBkZWYuaW4uX3pvZC50cmFpdHMuaGFzKFwiJFpvZFRyYW5zZm9ybVwiKTtcbiAgICBjb25zdCBpbm5lclR5cGUgPSBjdHguaW8gPT09IFwiaW5wdXRcIiA/IChpbklzVHJhbnNmb3JtID8gZGVmLm91dCA6IGRlZi5pbikgOiBkZWYub3V0O1xuICAgIHByb2Nlc3MoaW5uZXJUeXBlLCBjdHgsIHBhcmFtcyk7XG4gICAgY29uc3Qgc2VlbiA9IGN0eC5zZWVuLmdldChzY2hlbWEpO1xuICAgIHNlZW4ucmVmID0gaW5uZXJUeXBlO1xufTtcbmV4cG9ydCBjb25zdCByZWFkb25seVByb2Nlc3NvciA9IChzY2hlbWEsIGN0eCwganNvbiwgcGFyYW1zKSA9PiB7XG4gICAgY29uc3QgZGVmID0gc2NoZW1hLl96b2QuZGVmO1xuICAgIHByb2Nlc3MoZGVmLmlubmVyVHlwZSwgY3R4LCBwYXJhbXMpO1xuICAgIGNvbnN0IHNlZW4gPSBjdHguc2Vlbi5nZXQoc2NoZW1hKTtcbiAgICBzZWVuLnJlZiA9IGRlZi5pbm5lclR5cGU7XG4gICAganNvbi5yZWFkT25seSA9IHRydWU7XG59O1xuZXhwb3J0IGNvbnN0IHByb21pc2VQcm9jZXNzb3IgPSAoc2NoZW1hLCBjdHgsIF9qc29uLCBwYXJhbXMpID0+IHtcbiAgICBjb25zdCBkZWYgPSBzY2hlbWEuX3pvZC5kZWY7XG4gICAgcHJvY2VzcyhkZWYuaW5uZXJUeXBlLCBjdHgsIHBhcmFtcyk7XG4gICAgY29uc3Qgc2VlbiA9IGN0eC5zZWVuLmdldChzY2hlbWEpO1xuICAgIHNlZW4ucmVmID0gZGVmLmlubmVyVHlwZTtcbn07XG5leHBvcnQgY29uc3Qgb3B0aW9uYWxQcm9jZXNzb3IgPSAoc2NoZW1hLCBjdHgsIF9qc29uLCBwYXJhbXMpID0+IHtcbiAgICBjb25zdCBkZWYgPSBzY2hlbWEuX3pvZC5kZWY7XG4gICAgcHJvY2VzcyhkZWYuaW5uZXJUeXBlLCBjdHgsIHBhcmFtcyk7XG4gICAgY29uc3Qgc2VlbiA9IGN0eC5zZWVuLmdldChzY2hlbWEpO1xuICAgIHNlZW4ucmVmID0gZGVmLmlubmVyVHlwZTtcbn07XG5leHBvcnQgY29uc3QgbGF6eVByb2Nlc3NvciA9IChzY2hlbWEsIGN0eCwgX2pzb24sIHBhcmFtcykgPT4ge1xuICAgIGNvbnN0IGlubmVyVHlwZSA9IHNjaGVtYS5fem9kLmlubmVyVHlwZTtcbiAgICBwcm9jZXNzKGlubmVyVHlwZSwgY3R4LCBwYXJhbXMpO1xuICAgIGNvbnN0IHNlZW4gPSBjdHguc2Vlbi5nZXQoc2NoZW1hKTtcbiAgICBzZWVuLnJlZiA9IGlubmVyVHlwZTtcbn07XG4vLyA9PT09PT09PT09PT09PT09PT09PSBBTEwgUFJPQ0VTU09SUyA9PT09PT09PT09PT09PT09PT09PVxuZXhwb3J0IGNvbnN0IGFsbFByb2Nlc3NvcnMgPSB7XG4gICAgc3RyaW5nOiBzdHJpbmdQcm9jZXNzb3IsXG4gICAgbnVtYmVyOiBudW1iZXJQcm9jZXNzb3IsXG4gICAgYm9vbGVhbjogYm9vbGVhblByb2Nlc3NvcixcbiAgICBiaWdpbnQ6IGJpZ2ludFByb2Nlc3NvcixcbiAgICBzeW1ib2w6IHN5bWJvbFByb2Nlc3NvcixcbiAgICBudWxsOiBudWxsUHJvY2Vzc29yLFxuICAgIHVuZGVmaW5lZDogdW5kZWZpbmVkUHJvY2Vzc29yLFxuICAgIHZvaWQ6IHZvaWRQcm9jZXNzb3IsXG4gICAgbmV2ZXI6IG5ldmVyUHJvY2Vzc29yLFxuICAgIGFueTogYW55UHJvY2Vzc29yLFxuICAgIHVua25vd246IHVua25vd25Qcm9jZXNzb3IsXG4gICAgZGF0ZTogZGF0ZVByb2Nlc3NvcixcbiAgICBlbnVtOiBlbnVtUHJvY2Vzc29yLFxuICAgIGxpdGVyYWw6IGxpdGVyYWxQcm9jZXNzb3IsXG4gICAgbmFuOiBuYW5Qcm9jZXNzb3IsXG4gICAgdGVtcGxhdGVfbGl0ZXJhbDogdGVtcGxhdGVMaXRlcmFsUHJvY2Vzc29yLFxuICAgIGZpbGU6IGZpbGVQcm9jZXNzb3IsXG4gICAgc3VjY2Vzczogc3VjY2Vzc1Byb2Nlc3NvcixcbiAgICBjdXN0b206IGN1c3RvbVByb2Nlc3NvcixcbiAgICBmdW5jdGlvbjogZnVuY3Rpb25Qcm9jZXNzb3IsXG4gICAgdHJhbnNmb3JtOiB0cmFuc2Zvcm1Qcm9jZXNzb3IsXG4gICAgbWFwOiBtYXBQcm9jZXNzb3IsXG4gICAgc2V0OiBzZXRQcm9jZXNzb3IsXG4gICAgYXJyYXk6IGFycmF5UHJvY2Vzc29yLFxuICAgIG9iamVjdDogb2JqZWN0UHJvY2Vzc29yLFxuICAgIHVuaW9uOiB1bmlvblByb2Nlc3NvcixcbiAgICBpbnRlcnNlY3Rpb246IGludGVyc2VjdGlvblByb2Nlc3NvcixcbiAgICB0dXBsZTogdHVwbGVQcm9jZXNzb3IsXG4gICAgcmVjb3JkOiByZWNvcmRQcm9jZXNzb3IsXG4gICAgbnVsbGFibGU6IG51bGxhYmxlUHJvY2Vzc29yLFxuICAgIG5vbm9wdGlvbmFsOiBub25vcHRpb25hbFByb2Nlc3NvcixcbiAgICBkZWZhdWx0OiBkZWZhdWx0UHJvY2Vzc29yLFxuICAgIHByZWZhdWx0OiBwcmVmYXVsdFByb2Nlc3NvcixcbiAgICBjYXRjaDogY2F0Y2hQcm9jZXNzb3IsXG4gICAgcGlwZTogcGlwZVByb2Nlc3NvcixcbiAgICByZWFkb25seTogcmVhZG9ubHlQcm9jZXNzb3IsXG4gICAgcHJvbWlzZTogcHJvbWlzZVByb2Nlc3NvcixcbiAgICBvcHRpb25hbDogb3B0aW9uYWxQcm9jZXNzb3IsXG4gICAgbGF6eTogbGF6eVByb2Nlc3Nvcixcbn07XG5leHBvcnQgZnVuY3Rpb24gdG9KU09OU2NoZW1hKGlucHV0LCBwYXJhbXMpIHtcbiAgICBpZiAoXCJfaWRtYXBcIiBpbiBpbnB1dCkge1xuICAgICAgICAvLyBSZWdpc3RyeSBjYXNlXG4gICAgICAgIGNvbnN0IHJlZ2lzdHJ5ID0gaW5wdXQ7XG4gICAgICAgIGNvbnN0IGN0eCA9IGluaXRpYWxpemVDb250ZXh0KHsgLi4ucGFyYW1zLCBwcm9jZXNzb3JzOiBhbGxQcm9jZXNzb3JzIH0pO1xuICAgICAgICBjb25zdCBkZWZzID0ge307XG4gICAgICAgIC8vIEZpcnN0IHBhc3M6IHByb2Nlc3MgYWxsIHNjaGVtYXMgdG8gYnVpbGQgdGhlIHNlZW4gbWFwXG4gICAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgcmVnaXN0cnkuX2lkbWFwLmVudHJpZXMoKSkge1xuICAgICAgICAgICAgY29uc3QgW18sIHNjaGVtYV0gPSBlbnRyeTtcbiAgICAgICAgICAgIHByb2Nlc3Moc2NoZW1hLCBjdHgpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHNjaGVtYXMgPSB7fTtcbiAgICAgICAgY29uc3QgZXh0ZXJuYWwgPSB7XG4gICAgICAgICAgICByZWdpc3RyeSxcbiAgICAgICAgICAgIHVyaTogcGFyYW1zPy51cmksXG4gICAgICAgICAgICBkZWZzLFxuICAgICAgICB9O1xuICAgICAgICAvLyBVcGRhdGUgdGhlIGNvbnRleHQgd2l0aCBleHRlcm5hbCBjb25maWd1cmF0aW9uXG4gICAgICAgIGN0eC5leHRlcm5hbCA9IGV4dGVybmFsO1xuICAgICAgICAvLyBTZWNvbmQgcGFzczogZW1pdCBlYWNoIHNjaGVtYVxuICAgICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIHJlZ2lzdHJ5Ll9pZG1hcC5lbnRyaWVzKCkpIHtcbiAgICAgICAgICAgIGNvbnN0IFtrZXksIHNjaGVtYV0gPSBlbnRyeTtcbiAgICAgICAgICAgIGV4dHJhY3REZWZzKGN0eCwgc2NoZW1hKTtcbiAgICAgICAgICAgIHNjaGVtYXNba2V5XSA9IGZpbmFsaXplKGN0eCwgc2NoZW1hKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoT2JqZWN0LmtleXMoZGVmcykubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uc3QgZGVmc1NlZ21lbnQgPSBjdHgudGFyZ2V0ID09PSBcImRyYWZ0LTIwMjAtMTJcIiA/IFwiJGRlZnNcIiA6IFwiZGVmaW5pdGlvbnNcIjtcbiAgICAgICAgICAgIHNjaGVtYXMuX19zaGFyZWQgPSB7XG4gICAgICAgICAgICAgICAgW2RlZnNTZWdtZW50XTogZGVmcyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgc2NoZW1hcyB9O1xuICAgIH1cbiAgICAvLyBTaW5nbGUgc2NoZW1hIGNhc2VcbiAgICBjb25zdCBjdHggPSBpbml0aWFsaXplQ29udGV4dCh7IC4uLnBhcmFtcywgcHJvY2Vzc29yczogYWxsUHJvY2Vzc29ycyB9KTtcbiAgICBwcm9jZXNzKGlucHV0LCBjdHgpO1xuICAgIGV4dHJhY3REZWZzKGN0eCwgaW5wdXQpO1xuICAgIHJldHVybiBmaW5hbGl6ZShjdHgsIGlucHV0KTtcbn1cbiIsImltcG9ydCAqIGFzIGNvcmUgZnJvbSBcIi4uL2NvcmUvaW5kZXguanNcIjtcbmltcG9ydCAqIGFzIHNjaGVtYXMgZnJvbSBcIi4vc2NoZW1hcy5qc1wiO1xuZXhwb3J0IGNvbnN0IFpvZElTT0RhdGVUaW1lID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZElTT0RhdGVUaW1lXCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICBjb3JlLiRab2RJU09EYXRlVGltZS5pbml0KGluc3QsIGRlZik7XG4gICAgc2NoZW1hcy5ab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xufSk7XG5leHBvcnQgZnVuY3Rpb24gZGF0ZXRpbWUocGFyYW1zKSB7XG4gICAgcmV0dXJuIGNvcmUuX2lzb0RhdGVUaW1lKFpvZElTT0RhdGVUaW1lLCBwYXJhbXMpO1xufVxuZXhwb3J0IGNvbnN0IFpvZElTT0RhdGUgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kSVNPRGF0ZVwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgY29yZS4kWm9kSVNPRGF0ZS5pbml0KGluc3QsIGRlZik7XG4gICAgc2NoZW1hcy5ab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xufSk7XG5leHBvcnQgZnVuY3Rpb24gZGF0ZShwYXJhbXMpIHtcbiAgICByZXR1cm4gY29yZS5faXNvRGF0ZShab2RJU09EYXRlLCBwYXJhbXMpO1xufVxuZXhwb3J0IGNvbnN0IFpvZElTT1RpbWUgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kSVNPVGltZVwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgY29yZS4kWm9kSVNPVGltZS5pbml0KGluc3QsIGRlZik7XG4gICAgc2NoZW1hcy5ab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xufSk7XG5leHBvcnQgZnVuY3Rpb24gdGltZShwYXJhbXMpIHtcbiAgICByZXR1cm4gY29yZS5faXNvVGltZShab2RJU09UaW1lLCBwYXJhbXMpO1xufVxuZXhwb3J0IGNvbnN0IFpvZElTT0R1cmF0aW9uID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZElTT0R1cmF0aW9uXCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICBjb3JlLiRab2RJU09EdXJhdGlvbi5pbml0KGluc3QsIGRlZik7XG4gICAgc2NoZW1hcy5ab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xufSk7XG5leHBvcnQgZnVuY3Rpb24gZHVyYXRpb24ocGFyYW1zKSB7XG4gICAgcmV0dXJuIGNvcmUuX2lzb0R1cmF0aW9uKFpvZElTT0R1cmF0aW9uLCBwYXJhbXMpO1xufVxuIiwiaW1wb3J0ICogYXMgY29yZSBmcm9tIFwiLi4vY29yZS9pbmRleC5qc1wiO1xuaW1wb3J0IHsgJFpvZEVycm9yIH0gZnJvbSBcIi4uL2NvcmUvaW5kZXguanNcIjtcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSBcIi4uL2NvcmUvdXRpbC5qc1wiO1xuY29uc3QgaW5pdGlhbGl6ZXIgPSAoaW5zdCwgaXNzdWVzKSA9PiB7XG4gICAgJFpvZEVycm9yLmluaXQoaW5zdCwgaXNzdWVzKTtcbiAgICBpbnN0Lm5hbWUgPSBcIlpvZEVycm9yXCI7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoaW5zdCwge1xuICAgICAgICBmb3JtYXQ6IHtcbiAgICAgICAgICAgIHZhbHVlOiAobWFwcGVyKSA9PiBjb3JlLmZvcm1hdEVycm9yKGluc3QsIG1hcHBlciksXG4gICAgICAgICAgICAvLyBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgfSxcbiAgICAgICAgZmxhdHRlbjoge1xuICAgICAgICAgICAgdmFsdWU6IChtYXBwZXIpID0+IGNvcmUuZmxhdHRlbkVycm9yKGluc3QsIG1hcHBlciksXG4gICAgICAgICAgICAvLyBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgfSxcbiAgICAgICAgYWRkSXNzdWU6IHtcbiAgICAgICAgICAgIHZhbHVlOiAoaXNzdWUpID0+IHtcbiAgICAgICAgICAgICAgICBpbnN0Lmlzc3Vlcy5wdXNoKGlzc3VlKTtcbiAgICAgICAgICAgICAgICBpbnN0Lm1lc3NhZ2UgPSBKU09OLnN0cmluZ2lmeShpbnN0Lmlzc3VlcywgdXRpbC5qc29uU3RyaW5naWZ5UmVwbGFjZXIsIDIpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8vIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB9LFxuICAgICAgICBhZGRJc3N1ZXM6IHtcbiAgICAgICAgICAgIHZhbHVlOiAoaXNzdWVzKSA9PiB7XG4gICAgICAgICAgICAgICAgaW5zdC5pc3N1ZXMucHVzaCguLi5pc3N1ZXMpO1xuICAgICAgICAgICAgICAgIGluc3QubWVzc2FnZSA9IEpTT04uc3RyaW5naWZ5KGluc3QuaXNzdWVzLCB1dGlsLmpzb25TdHJpbmdpZnlSZXBsYWNlciwgMik7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLy8gZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIH0sXG4gICAgICAgIGlzRW1wdHk6IHtcbiAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaW5zdC5pc3N1ZXMubGVuZ3RoID09PSAwO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8vIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB9LFxuICAgIH0pO1xuICAgIC8vIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShpbnN0LCBcImlzRW1wdHlcIiwge1xuICAgIC8vICAgZ2V0KCkge1xuICAgIC8vICAgICByZXR1cm4gaW5zdC5pc3N1ZXMubGVuZ3RoID09PSAwO1xuICAgIC8vICAgfSxcbiAgICAvLyB9KTtcbn07XG5leHBvcnQgY29uc3QgWm9kRXJyb3IgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kRXJyb3JcIiwgaW5pdGlhbGl6ZXIpO1xuZXhwb3J0IGNvbnN0IFpvZFJlYWxFcnJvciA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RFcnJvclwiLCBpbml0aWFsaXplciwge1xuICAgIFBhcmVudDogRXJyb3IsXG59KTtcbi8vIC8qKiBAZGVwcmVjYXRlZCBVc2UgYHouY29yZS4kWm9kRXJyb3JNYXBDdHhgIGluc3RlYWQuICovXG4vLyBleHBvcnQgdHlwZSBFcnJvck1hcEN0eCA9IGNvcmUuJFpvZEVycm9yTWFwQ3R4O1xuIiwiaW1wb3J0ICogYXMgY29yZSBmcm9tIFwiLi4vY29yZS9pbmRleC5qc1wiO1xuaW1wb3J0IHsgWm9kUmVhbEVycm9yIH0gZnJvbSBcIi4vZXJyb3JzLmpzXCI7XG5leHBvcnQgY29uc3QgcGFyc2UgPSAvKiBAX19QVVJFX18gKi8gY29yZS5fcGFyc2UoWm9kUmVhbEVycm9yKTtcbmV4cG9ydCBjb25zdCBwYXJzZUFzeW5jID0gLyogQF9fUFVSRV9fICovIGNvcmUuX3BhcnNlQXN5bmMoWm9kUmVhbEVycm9yKTtcbmV4cG9ydCBjb25zdCBzYWZlUGFyc2UgPSAvKiBAX19QVVJFX18gKi8gY29yZS5fc2FmZVBhcnNlKFpvZFJlYWxFcnJvcik7XG5leHBvcnQgY29uc3Qgc2FmZVBhcnNlQXN5bmMgPSAvKiBAX19QVVJFX18gKi8gY29yZS5fc2FmZVBhcnNlQXN5bmMoWm9kUmVhbEVycm9yKTtcbi8vIENvZGVjIGZ1bmN0aW9uc1xuZXhwb3J0IGNvbnN0IGVuY29kZSA9IC8qIEBfX1BVUkVfXyAqLyBjb3JlLl9lbmNvZGUoWm9kUmVhbEVycm9yKTtcbmV4cG9ydCBjb25zdCBkZWNvZGUgPSAvKiBAX19QVVJFX18gKi8gY29yZS5fZGVjb2RlKFpvZFJlYWxFcnJvcik7XG5leHBvcnQgY29uc3QgZW5jb2RlQXN5bmMgPSAvKiBAX19QVVJFX18gKi8gY29yZS5fZW5jb2RlQXN5bmMoWm9kUmVhbEVycm9yKTtcbmV4cG9ydCBjb25zdCBkZWNvZGVBc3luYyA9IC8qIEBfX1BVUkVfXyAqLyBjb3JlLl9kZWNvZGVBc3luYyhab2RSZWFsRXJyb3IpO1xuZXhwb3J0IGNvbnN0IHNhZmVFbmNvZGUgPSAvKiBAX19QVVJFX18gKi8gY29yZS5fc2FmZUVuY29kZShab2RSZWFsRXJyb3IpO1xuZXhwb3J0IGNvbnN0IHNhZmVEZWNvZGUgPSAvKiBAX19QVVJFX18gKi8gY29yZS5fc2FmZURlY29kZShab2RSZWFsRXJyb3IpO1xuZXhwb3J0IGNvbnN0IHNhZmVFbmNvZGVBc3luYyA9IC8qIEBfX1BVUkVfXyAqLyBjb3JlLl9zYWZlRW5jb2RlQXN5bmMoWm9kUmVhbEVycm9yKTtcbmV4cG9ydCBjb25zdCBzYWZlRGVjb2RlQXN5bmMgPSAvKiBAX19QVVJFX18gKi8gY29yZS5fc2FmZURlY29kZUFzeW5jKFpvZFJlYWxFcnJvcik7XG4iLCJpbXBvcnQgKiBhcyBjb3JlIGZyb20gXCIuLi9jb3JlL2luZGV4LmpzXCI7XG5pbXBvcnQgeyB1dGlsIH0gZnJvbSBcIi4uL2NvcmUvaW5kZXguanNcIjtcbmltcG9ydCAqIGFzIHByb2Nlc3NvcnMgZnJvbSBcIi4uL2NvcmUvanNvbi1zY2hlbWEtcHJvY2Vzc29ycy5qc1wiO1xuaW1wb3J0IHsgY3JlYXRlU3RhbmRhcmRKU09OU2NoZW1hTWV0aG9kLCBjcmVhdGVUb0pTT05TY2hlbWFNZXRob2QgfSBmcm9tIFwiLi4vY29yZS90by1qc29uLXNjaGVtYS5qc1wiO1xuaW1wb3J0ICogYXMgY2hlY2tzIGZyb20gXCIuL2NoZWNrcy5qc1wiO1xuaW1wb3J0ICogYXMgaXNvIGZyb20gXCIuL2lzby5qc1wiO1xuaW1wb3J0ICogYXMgcGFyc2UgZnJvbSBcIi4vcGFyc2UuanNcIjtcbi8vIExhenktYmluZCBidWlsZGVyIG1ldGhvZHMuXG4vL1xuLy8gQnVpbGRlciBtZXRob2RzIChgLm9wdGlvbmFsYCwgYC5hcnJheWAsIGAucmVmaW5lYCwgLi4uKSBsaXZlIGFzXG4vLyBub24tZW51bWVyYWJsZSBnZXR0ZXJzIG9uIGVhY2ggY29uY3JldGUgc2NoZW1hIGNvbnN0cnVjdG9yJ3Ncbi8vIHByb3RvdHlwZS4gT24gZmlyc3QgYWNjZXNzIGZyb20gYW4gaW5zdGFuY2UgdGhlIGdldHRlciBhbGxvY2F0ZXNcbi8vIGBmbi5iaW5kKHRoaXMpYCBhbmQgY2FjaGVzIGl0IGFzIGFuIG93biBwcm9wZXJ0eSBvbiB0aGF0IGluc3RhbmNlLFxuLy8gc28gZGV0YWNoZWQgdXNhZ2UgKGBjb25zdCBtID0gc2NoZW1hLm9wdGlvbmFsOyBtKClgKSBzdGlsbCB3b3Jrc1xuLy8gYW5kIHRoZSBwZXItaW5zdGFuY2UgYWxsb2NhdGlvbiBvbmx5IGhhcHBlbnMgZm9yIG1ldGhvZHMgYWN0dWFsbHlcbi8vIHRvdWNoZWQuXG4vL1xuLy8gT25lIGluc3RhbGwgcGVyIChwcm90b3R5cGUsIGdyb3VwKSwgbWVtb2l6ZWQgYnkgYF9pbnN0YWxsZWRHcm91cHNgLlxuY29uc3QgX2luc3RhbGxlZEdyb3VwcyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgV2Vha01hcCgpO1xuZnVuY3Rpb24gX2luc3RhbGxMYXp5TWV0aG9kcyhpbnN0LCBncm91cCwgbWV0aG9kcykge1xuICAgIGNvbnN0IHByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKGluc3QpO1xuICAgIGxldCBpbnN0YWxsZWQgPSBfaW5zdGFsbGVkR3JvdXBzLmdldChwcm90byk7XG4gICAgaWYgKCFpbnN0YWxsZWQpIHtcbiAgICAgICAgaW5zdGFsbGVkID0gbmV3IFNldCgpO1xuICAgICAgICBfaW5zdGFsbGVkR3JvdXBzLnNldChwcm90bywgaW5zdGFsbGVkKTtcbiAgICB9XG4gICAgaWYgKGluc3RhbGxlZC5oYXMoZ3JvdXApKVxuICAgICAgICByZXR1cm47XG4gICAgaW5zdGFsbGVkLmFkZChncm91cCk7XG4gICAgZm9yIChjb25zdCBrZXkgaW4gbWV0aG9kcykge1xuICAgICAgICBjb25zdCBmbiA9IG1ldGhvZHNba2V5XTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHByb3RvLCBrZXksIHtcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGJvdW5kID0gZm4uYmluZCh0aGlzKTtcbiAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywga2V5LCB7XG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBib3VuZCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYm91bmQ7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0KHYpIHtcbiAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywga2V5LCB7XG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiB2LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuZXhwb3J0IGNvbnN0IFpvZFR5cGUgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kVHlwZVwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgY29yZS4kWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XG4gICAgT2JqZWN0LmFzc2lnbihpbnN0W1wifnN0YW5kYXJkXCJdLCB7XG4gICAgICAgIGpzb25TY2hlbWE6IHtcbiAgICAgICAgICAgIGlucHV0OiBjcmVhdGVTdGFuZGFyZEpTT05TY2hlbWFNZXRob2QoaW5zdCwgXCJpbnB1dFwiKSxcbiAgICAgICAgICAgIG91dHB1dDogY3JlYXRlU3RhbmRhcmRKU09OU2NoZW1hTWV0aG9kKGluc3QsIFwib3V0cHV0XCIpLFxuICAgICAgICB9LFxuICAgIH0pO1xuICAgIGluc3QudG9KU09OU2NoZW1hID0gY3JlYXRlVG9KU09OU2NoZW1hTWV0aG9kKGluc3QsIHt9KTtcbiAgICBpbnN0LmRlZiA9IGRlZjtcbiAgICBpbnN0LnR5cGUgPSBkZWYudHlwZTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoaW5zdCwgXCJfZGVmXCIsIHsgdmFsdWU6IGRlZiB9KTtcbiAgICAvLyBQYXJzZS1mYW1pbHkgaXMgaW50ZW50aW9uYWxseSBrZXB0IGFzIHBlci1pbnN0YW5jZSBjbG9zdXJlczogdGhlc2UgYXJlXG4gICAgLy8gdGhlIGhvdCBwYXRoIEFORCB0aGUgbW9zdC1kZXRhY2hlZCBtZXRob2RzIChgYXJyLm1hcChzY2hlbWEucGFyc2UpYCxcbiAgICAvLyBgY29uc3QgeyBwYXJzZSB9ID0gc2NoZW1hYCwgZXRjLikuIEVhZ2VyIGNsb3N1cmVzIGhlcmUgbWVhbiBjYWxsZXJzIHBheVxuICAgIC8vIH4xMiBjbG9zdXJlIGFsbG9jYXRpb25zIHBlciBzY2hlbWEgYnV0IGdldCBtb25vbW9ycGhpYyBjYWxsIHNpdGVzIGFuZFxuICAgIC8vIGRldGFjaGVkIHVzYWdlIHRoYXQgXCJqdXN0IHdvcmtzXCIuXG4gICAgaW5zdC5wYXJzZSA9IChkYXRhLCBwYXJhbXMpID0+IHBhcnNlLnBhcnNlKGluc3QsIGRhdGEsIHBhcmFtcywgeyBjYWxsZWU6IGluc3QucGFyc2UgfSk7XG4gICAgaW5zdC5zYWZlUGFyc2UgPSAoZGF0YSwgcGFyYW1zKSA9PiBwYXJzZS5zYWZlUGFyc2UoaW5zdCwgZGF0YSwgcGFyYW1zKTtcbiAgICBpbnN0LnBhcnNlQXN5bmMgPSBhc3luYyAoZGF0YSwgcGFyYW1zKSA9PiBwYXJzZS5wYXJzZUFzeW5jKGluc3QsIGRhdGEsIHBhcmFtcywgeyBjYWxsZWU6IGluc3QucGFyc2VBc3luYyB9KTtcbiAgICBpbnN0LnNhZmVQYXJzZUFzeW5jID0gYXN5bmMgKGRhdGEsIHBhcmFtcykgPT4gcGFyc2Uuc2FmZVBhcnNlQXN5bmMoaW5zdCwgZGF0YSwgcGFyYW1zKTtcbiAgICBpbnN0LnNwYSA9IGluc3Quc2FmZVBhcnNlQXN5bmM7XG4gICAgaW5zdC5lbmNvZGUgPSAoZGF0YSwgcGFyYW1zKSA9PiBwYXJzZS5lbmNvZGUoaW5zdCwgZGF0YSwgcGFyYW1zKTtcbiAgICBpbnN0LmRlY29kZSA9IChkYXRhLCBwYXJhbXMpID0+IHBhcnNlLmRlY29kZShpbnN0LCBkYXRhLCBwYXJhbXMpO1xuICAgIGluc3QuZW5jb2RlQXN5bmMgPSBhc3luYyAoZGF0YSwgcGFyYW1zKSA9PiBwYXJzZS5lbmNvZGVBc3luYyhpbnN0LCBkYXRhLCBwYXJhbXMpO1xuICAgIGluc3QuZGVjb2RlQXN5bmMgPSBhc3luYyAoZGF0YSwgcGFyYW1zKSA9PiBwYXJzZS5kZWNvZGVBc3luYyhpbnN0LCBkYXRhLCBwYXJhbXMpO1xuICAgIGluc3Quc2FmZUVuY29kZSA9IChkYXRhLCBwYXJhbXMpID0+IHBhcnNlLnNhZmVFbmNvZGUoaW5zdCwgZGF0YSwgcGFyYW1zKTtcbiAgICBpbnN0LnNhZmVEZWNvZGUgPSAoZGF0YSwgcGFyYW1zKSA9PiBwYXJzZS5zYWZlRGVjb2RlKGluc3QsIGRhdGEsIHBhcmFtcyk7XG4gICAgaW5zdC5zYWZlRW5jb2RlQXN5bmMgPSBhc3luYyAoZGF0YSwgcGFyYW1zKSA9PiBwYXJzZS5zYWZlRW5jb2RlQXN5bmMoaW5zdCwgZGF0YSwgcGFyYW1zKTtcbiAgICBpbnN0LnNhZmVEZWNvZGVBc3luYyA9IGFzeW5jIChkYXRhLCBwYXJhbXMpID0+IHBhcnNlLnNhZmVEZWNvZGVBc3luYyhpbnN0LCBkYXRhLCBwYXJhbXMpO1xuICAgIC8vIEFsbCBidWlsZGVyIG1ldGhvZHMgYXJlIHBsYWNlZCBvbiB0aGUgaW50ZXJuYWwgcHJvdG90eXBlIGFzIGxhenktYmluZFxuICAgIC8vIGdldHRlcnMuIE9uIGZpcnN0IGFjY2VzcyBwZXItaW5zdGFuY2UsIGEgYm91bmQgdGh1bmsgaXMgYWxsb2NhdGVkIGFuZFxuICAgIC8vIGNhY2hlZCBhcyBhbiBvd24gcHJvcGVydHk7IHN1YnNlcXVlbnQgYWNjZXNzZXMgc2tpcCB0aGUgZ2V0dGVyLiBUaGlzXG4gICAgLy8gbWVhbnM6IG5vIHBlci1pbnN0YW5jZSBhbGxvY2F0aW9uIGZvciB1bnVzZWQgbWV0aG9kcywgZnVsbFxuICAgIC8vIGRldGFjaGFiaWxpdHkgcHJlc2VydmVkIChgY29uc3QgbSA9IHNjaGVtYS5vcHRpb25hbDsgbSgpYCB3b3JrcyksIGFuZFxuICAgIC8vIHNoYXJlZCB1bmRlcmx5aW5nIGZ1bmN0aW9uIHJlZmVyZW5jZXMgYWNyb3NzIGFsbCBpbnN0YW5jZXMuXG4gICAgX2luc3RhbGxMYXp5TWV0aG9kcyhpbnN0LCBcIlpvZFR5cGVcIiwge1xuICAgICAgICBjaGVjayguLi5jaGtzKSB7XG4gICAgICAgICAgICBjb25zdCBkZWYgPSB0aGlzLmRlZjtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNsb25lKHV0aWwubWVyZ2VEZWZzKGRlZiwge1xuICAgICAgICAgICAgICAgIGNoZWNrczogW1xuICAgICAgICAgICAgICAgICAgICAuLi4oZGVmLmNoZWNrcyA/PyBbXSksXG4gICAgICAgICAgICAgICAgICAgIC4uLmNoa3MubWFwKChjaCkgPT4gdHlwZW9mIGNoID09PSBcImZ1bmN0aW9uXCIgPyB7IF96b2Q6IHsgY2hlY2s6IGNoLCBkZWY6IHsgY2hlY2s6IFwiY3VzdG9tXCIgfSwgb25hdHRhY2g6IFtdIH0gfSA6IGNoKSxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgfSksIHsgcGFyZW50OiB0cnVlIH0pO1xuICAgICAgICB9LFxuICAgICAgICB3aXRoKC4uLmNoa3MpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoZWNrKC4uLmNoa3MpO1xuICAgICAgICB9LFxuICAgICAgICBjbG9uZShkZWYsIHBhcmFtcykge1xuICAgICAgICAgICAgcmV0dXJuIGNvcmUuY2xvbmUodGhpcywgZGVmLCBwYXJhbXMpO1xuICAgICAgICB9LFxuICAgICAgICBicmFuZCgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuICAgICAgICByZWdpc3RlcihyZWcsIG1ldGEpIHtcbiAgICAgICAgICAgIHJlZy5hZGQodGhpcywgbWV0YSk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcbiAgICAgICAgcmVmaW5lKGNoZWNrLCBwYXJhbXMpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoZWNrKHJlZmluZShjaGVjaywgcGFyYW1zKSk7XG4gICAgICAgIH0sXG4gICAgICAgIHN1cGVyUmVmaW5lKHJlZmluZW1lbnQsIHBhcmFtcykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2soc3VwZXJSZWZpbmUocmVmaW5lbWVudCwgcGFyYW1zKSk7XG4gICAgICAgIH0sXG4gICAgICAgIG92ZXJ3cml0ZShmbikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2soY2hlY2tzLm92ZXJ3cml0ZShmbikpO1xuICAgICAgICB9LFxuICAgICAgICBvcHRpb25hbCgpIHtcbiAgICAgICAgICAgIHJldHVybiBvcHRpb25hbCh0aGlzKTtcbiAgICAgICAgfSxcbiAgICAgICAgZXhhY3RPcHRpb25hbCgpIHtcbiAgICAgICAgICAgIHJldHVybiBleGFjdE9wdGlvbmFsKHRoaXMpO1xuICAgICAgICB9LFxuICAgICAgICBudWxsYWJsZSgpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsYWJsZSh0aGlzKTtcbiAgICAgICAgfSxcbiAgICAgICAgbnVsbGlzaCgpIHtcbiAgICAgICAgICAgIHJldHVybiBvcHRpb25hbChudWxsYWJsZSh0aGlzKSk7XG4gICAgICAgIH0sXG4gICAgICAgIG5vbm9wdGlvbmFsKHBhcmFtcykge1xuICAgICAgICAgICAgcmV0dXJuIG5vbm9wdGlvbmFsKHRoaXMsIHBhcmFtcyk7XG4gICAgICAgIH0sXG4gICAgICAgIGFycmF5KCkge1xuICAgICAgICAgICAgcmV0dXJuIGFycmF5KHRoaXMpO1xuICAgICAgICB9LFxuICAgICAgICBvcihhcmcpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmlvbihbdGhpcywgYXJnXSk7XG4gICAgICAgIH0sXG4gICAgICAgIGFuZChhcmcpIHtcbiAgICAgICAgICAgIHJldHVybiBpbnRlcnNlY3Rpb24odGhpcywgYXJnKTtcbiAgICAgICAgfSxcbiAgICAgICAgdHJhbnNmb3JtKHR4KSB7XG4gICAgICAgICAgICByZXR1cm4gcGlwZSh0aGlzLCB0cmFuc2Zvcm0odHgpKTtcbiAgICAgICAgfSxcbiAgICAgICAgZGVmYXVsdChkKSB7XG4gICAgICAgICAgICByZXR1cm4gX2RlZmF1bHQodGhpcywgZCk7XG4gICAgICAgIH0sXG4gICAgICAgIHByZWZhdWx0KGQpIHtcbiAgICAgICAgICAgIHJldHVybiBwcmVmYXVsdCh0aGlzLCBkKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2F0Y2gocGFyYW1zKSB7XG4gICAgICAgICAgICByZXR1cm4gX2NhdGNoKHRoaXMsIHBhcmFtcyk7XG4gICAgICAgIH0sXG4gICAgICAgIHBpcGUodGFyZ2V0KSB7XG4gICAgICAgICAgICByZXR1cm4gcGlwZSh0aGlzLCB0YXJnZXQpO1xuICAgICAgICB9LFxuICAgICAgICByZWFkb25seSgpIHtcbiAgICAgICAgICAgIHJldHVybiByZWFkb25seSh0aGlzKTtcbiAgICAgICAgfSxcbiAgICAgICAgZGVzY3JpYmUoZGVzY3JpcHRpb24pIHtcbiAgICAgICAgICAgIGNvbnN0IGNsID0gdGhpcy5jbG9uZSgpO1xuICAgICAgICAgICAgY29yZS5nbG9iYWxSZWdpc3RyeS5hZGQoY2wsIHsgZGVzY3JpcHRpb24gfSk7XG4gICAgICAgICAgICByZXR1cm4gY2w7XG4gICAgICAgIH0sXG4gICAgICAgIG1ldGEoLi4uYXJncykge1xuICAgICAgICAgICAgLy8gb3ZlcmxvYWRlZDogbWV0YSgpIHJldHVybnMgdGhlIHJlZ2lzdGVyZWQgbWV0YWRhdGEsIG1ldGEoZGF0YSlcbiAgICAgICAgICAgIC8vIHJldHVybnMgYSBjbG9uZSB3aXRoIGBkYXRhYCByZWdpc3RlcmVkLiBUaGUgbWFwcGVkIHR5cGUgcGlja3NcbiAgICAgICAgICAgIC8vIHVwIHRoZSBzZWNvbmQgb3ZlcmxvYWQsIHNvIHdlIGFjY2VwdCB2YXJpYWRpYyBhbnktYXJncyBhbmRcbiAgICAgICAgICAgIC8vIHJldHVybiBgYW55YCB0byBzYXRpc2Z5IGJvdGggYXQgcnVudGltZS5cbiAgICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCA9PT0gMClcbiAgICAgICAgICAgICAgICByZXR1cm4gY29yZS5nbG9iYWxSZWdpc3RyeS5nZXQodGhpcyk7XG4gICAgICAgICAgICBjb25zdCBjbCA9IHRoaXMuY2xvbmUoKTtcbiAgICAgICAgICAgIGNvcmUuZ2xvYmFsUmVnaXN0cnkuYWRkKGNsLCBhcmdzWzBdKTtcbiAgICAgICAgICAgIHJldHVybiBjbDtcbiAgICAgICAgfSxcbiAgICAgICAgaXNPcHRpb25hbCgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNhZmVQYXJzZSh1bmRlZmluZWQpLnN1Y2Nlc3M7XG4gICAgICAgIH0sXG4gICAgICAgIGlzTnVsbGFibGUoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zYWZlUGFyc2UobnVsbCkuc3VjY2VzcztcbiAgICAgICAgfSxcbiAgICAgICAgYXBwbHkoZm4pIHtcbiAgICAgICAgICAgIHJldHVybiBmbih0aGlzKTtcbiAgICAgICAgfSxcbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoaW5zdCwgXCJkZXNjcmlwdGlvblwiLCB7XG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgIHJldHVybiBjb3JlLmdsb2JhbFJlZ2lzdHJ5LmdldChpbnN0KT8uZGVzY3JpcHRpb247XG4gICAgICAgIH0sXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICB9KTtcbiAgICByZXR1cm4gaW5zdDtcbn0pO1xuLyoqIEBpbnRlcm5hbCAqL1xuZXhwb3J0IGNvbnN0IF9ab2RTdHJpbmcgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiX1pvZFN0cmluZ1wiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgY29yZS4kWm9kU3RyaW5nLmluaXQoaW5zdCwgZGVmKTtcbiAgICBab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcbiAgICBpbnN0Ll96b2QucHJvY2Vzc0pTT05TY2hlbWEgPSAoY3R4LCBqc29uLCBwYXJhbXMpID0+IHByb2Nlc3NvcnMuc3RyaW5nUHJvY2Vzc29yKGluc3QsIGN0eCwganNvbiwgcGFyYW1zKTtcbiAgICBjb25zdCBiYWcgPSBpbnN0Ll96b2QuYmFnO1xuICAgIGluc3QuZm9ybWF0ID0gYmFnLmZvcm1hdCA/PyBudWxsO1xuICAgIGluc3QubWluTGVuZ3RoID0gYmFnLm1pbmltdW0gPz8gbnVsbDtcbiAgICBpbnN0Lm1heExlbmd0aCA9IGJhZy5tYXhpbXVtID8/IG51bGw7XG4gICAgX2luc3RhbGxMYXp5TWV0aG9kcyhpbnN0LCBcIl9ab2RTdHJpbmdcIiwge1xuICAgICAgICByZWdleCguLi5hcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGVjayhjaGVja3MucmVnZXgoLi4uYXJncykpO1xuICAgICAgICB9LFxuICAgICAgICBpbmNsdWRlcyguLi5hcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGVjayhjaGVja3MuaW5jbHVkZXMoLi4uYXJncykpO1xuICAgICAgICB9LFxuICAgICAgICBzdGFydHNXaXRoKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoZWNrKGNoZWNrcy5zdGFydHNXaXRoKC4uLmFyZ3MpKTtcbiAgICAgICAgfSxcbiAgICAgICAgZW5kc1dpdGgoLi4uYXJncykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2soY2hlY2tzLmVuZHNXaXRoKC4uLmFyZ3MpKTtcbiAgICAgICAgfSxcbiAgICAgICAgbWluKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoZWNrKGNoZWNrcy5taW5MZW5ndGgoLi4uYXJncykpO1xuICAgICAgICB9LFxuICAgICAgICBtYXgoLi4uYXJncykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2soY2hlY2tzLm1heExlbmd0aCguLi5hcmdzKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGxlbmd0aCguLi5hcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGVjayhjaGVja3MubGVuZ3RoKC4uLmFyZ3MpKTtcbiAgICAgICAgfSxcbiAgICAgICAgbm9uZW1wdHkoLi4uYXJncykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2soY2hlY2tzLm1pbkxlbmd0aCgxLCAuLi5hcmdzKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGxvd2VyY2FzZShwYXJhbXMpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoZWNrKGNoZWNrcy5sb3dlcmNhc2UocGFyYW1zKSk7XG4gICAgICAgIH0sXG4gICAgICAgIHVwcGVyY2FzZShwYXJhbXMpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoZWNrKGNoZWNrcy51cHBlcmNhc2UocGFyYW1zKSk7XG4gICAgICAgIH0sXG4gICAgICAgIHRyaW0oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGVjayhjaGVja3MudHJpbSgpKTtcbiAgICAgICAgfSxcbiAgICAgICAgbm9ybWFsaXplKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoZWNrKGNoZWNrcy5ub3JtYWxpemUoLi4uYXJncykpO1xuICAgICAgICB9LFxuICAgICAgICB0b0xvd2VyQ2FzZSgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoZWNrKGNoZWNrcy50b0xvd2VyQ2FzZSgpKTtcbiAgICAgICAgfSxcbiAgICAgICAgdG9VcHBlckNhc2UoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGVjayhjaGVja3MudG9VcHBlckNhc2UoKSk7XG4gICAgICAgIH0sXG4gICAgICAgIHNsdWdpZnkoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGVjayhjaGVja3Muc2x1Z2lmeSgpKTtcbiAgICAgICAgfSxcbiAgICB9KTtcbn0pO1xuZXhwb3J0IGNvbnN0IFpvZFN0cmluZyA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RTdHJpbmdcIiwgKGluc3QsIGRlZikgPT4ge1xuICAgIGNvcmUuJFpvZFN0cmluZy5pbml0KGluc3QsIGRlZik7XG4gICAgX1pvZFN0cmluZy5pbml0KGluc3QsIGRlZik7XG4gICAgaW5zdC5lbWFpbCA9IChwYXJhbXMpID0+IGluc3QuY2hlY2soY29yZS5fZW1haWwoWm9kRW1haWwsIHBhcmFtcykpO1xuICAgIGluc3QudXJsID0gKHBhcmFtcykgPT4gaW5zdC5jaGVjayhjb3JlLl91cmwoWm9kVVJMLCBwYXJhbXMpKTtcbiAgICBpbnN0Lmp3dCA9IChwYXJhbXMpID0+IGluc3QuY2hlY2soY29yZS5fand0KFpvZEpXVCwgcGFyYW1zKSk7XG4gICAgaW5zdC5lbW9qaSA9IChwYXJhbXMpID0+IGluc3QuY2hlY2soY29yZS5fZW1vamkoWm9kRW1vamksIHBhcmFtcykpO1xuICAgIGluc3QuZ3VpZCA9IChwYXJhbXMpID0+IGluc3QuY2hlY2soY29yZS5fZ3VpZChab2RHVUlELCBwYXJhbXMpKTtcbiAgICBpbnN0LnV1aWQgPSAocGFyYW1zKSA9PiBpbnN0LmNoZWNrKGNvcmUuX3V1aWQoWm9kVVVJRCwgcGFyYW1zKSk7XG4gICAgaW5zdC51dWlkdjQgPSAocGFyYW1zKSA9PiBpbnN0LmNoZWNrKGNvcmUuX3V1aWR2NChab2RVVUlELCBwYXJhbXMpKTtcbiAgICBpbnN0LnV1aWR2NiA9IChwYXJhbXMpID0+IGluc3QuY2hlY2soY29yZS5fdXVpZHY2KFpvZFVVSUQsIHBhcmFtcykpO1xuICAgIGluc3QudXVpZHY3ID0gKHBhcmFtcykgPT4gaW5zdC5jaGVjayhjb3JlLl91dWlkdjcoWm9kVVVJRCwgcGFyYW1zKSk7XG4gICAgaW5zdC5uYW5vaWQgPSAocGFyYW1zKSA9PiBpbnN0LmNoZWNrKGNvcmUuX25hbm9pZChab2ROYW5vSUQsIHBhcmFtcykpO1xuICAgIGluc3QuZ3VpZCA9IChwYXJhbXMpID0+IGluc3QuY2hlY2soY29yZS5fZ3VpZChab2RHVUlELCBwYXJhbXMpKTtcbiAgICBpbnN0LmN1aWQgPSAocGFyYW1zKSA9PiBpbnN0LmNoZWNrKGNvcmUuX2N1aWQoWm9kQ1VJRCwgcGFyYW1zKSk7XG4gICAgaW5zdC5jdWlkMiA9IChwYXJhbXMpID0+IGluc3QuY2hlY2soY29yZS5fY3VpZDIoWm9kQ1VJRDIsIHBhcmFtcykpO1xuICAgIGluc3QudWxpZCA9IChwYXJhbXMpID0+IGluc3QuY2hlY2soY29yZS5fdWxpZChab2RVTElELCBwYXJhbXMpKTtcbiAgICBpbnN0LmJhc2U2NCA9IChwYXJhbXMpID0+IGluc3QuY2hlY2soY29yZS5fYmFzZTY0KFpvZEJhc2U2NCwgcGFyYW1zKSk7XG4gICAgaW5zdC5iYXNlNjR1cmwgPSAocGFyYW1zKSA9PiBpbnN0LmNoZWNrKGNvcmUuX2Jhc2U2NHVybChab2RCYXNlNjRVUkwsIHBhcmFtcykpO1xuICAgIGluc3QueGlkID0gKHBhcmFtcykgPT4gaW5zdC5jaGVjayhjb3JlLl94aWQoWm9kWElELCBwYXJhbXMpKTtcbiAgICBpbnN0LmtzdWlkID0gKHBhcmFtcykgPT4gaW5zdC5jaGVjayhjb3JlLl9rc3VpZChab2RLU1VJRCwgcGFyYW1zKSk7XG4gICAgaW5zdC5pcHY0ID0gKHBhcmFtcykgPT4gaW5zdC5jaGVjayhjb3JlLl9pcHY0KFpvZElQdjQsIHBhcmFtcykpO1xuICAgIGluc3QuaXB2NiA9IChwYXJhbXMpID0+IGluc3QuY2hlY2soY29yZS5faXB2Nihab2RJUHY2LCBwYXJhbXMpKTtcbiAgICBpbnN0LmNpZHJ2NCA9IChwYXJhbXMpID0+IGluc3QuY2hlY2soY29yZS5fY2lkcnY0KFpvZENJRFJ2NCwgcGFyYW1zKSk7XG4gICAgaW5zdC5jaWRydjYgPSAocGFyYW1zKSA9PiBpbnN0LmNoZWNrKGNvcmUuX2NpZHJ2Nihab2RDSURSdjYsIHBhcmFtcykpO1xuICAgIGluc3QuZTE2NCA9IChwYXJhbXMpID0+IGluc3QuY2hlY2soY29yZS5fZTE2NChab2RFMTY0LCBwYXJhbXMpKTtcbiAgICAvLyBpc29cbiAgICBpbnN0LmRhdGV0aW1lID0gKHBhcmFtcykgPT4gaW5zdC5jaGVjayhpc28uZGF0ZXRpbWUocGFyYW1zKSk7XG4gICAgaW5zdC5kYXRlID0gKHBhcmFtcykgPT4gaW5zdC5jaGVjayhpc28uZGF0ZShwYXJhbXMpKTtcbiAgICBpbnN0LnRpbWUgPSAocGFyYW1zKSA9PiBpbnN0LmNoZWNrKGlzby50aW1lKHBhcmFtcykpO1xuICAgIGluc3QuZHVyYXRpb24gPSAocGFyYW1zKSA9PiBpbnN0LmNoZWNrKGlzby5kdXJhdGlvbihwYXJhbXMpKTtcbn0pO1xuZXhwb3J0IGZ1bmN0aW9uIHN0cmluZyhwYXJhbXMpIHtcbiAgICByZXR1cm4gY29yZS5fc3RyaW5nKFpvZFN0cmluZywgcGFyYW1zKTtcbn1cbmV4cG9ydCBjb25zdCBab2RTdHJpbmdGb3JtYXQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kU3RyaW5nRm9ybWF0XCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICBjb3JlLiRab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xuICAgIF9ab2RTdHJpbmcuaW5pdChpbnN0LCBkZWYpO1xufSk7XG5leHBvcnQgY29uc3QgWm9kRW1haWwgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kRW1haWxcIiwgKGluc3QsIGRlZikgPT4ge1xuICAgIC8vIFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XG4gICAgY29yZS4kWm9kRW1haWwuaW5pdChpbnN0LCBkZWYpO1xuICAgIFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XG59KTtcbmV4cG9ydCBmdW5jdGlvbiBlbWFpbChwYXJhbXMpIHtcbiAgICByZXR1cm4gY29yZS5fZW1haWwoWm9kRW1haWwsIHBhcmFtcyk7XG59XG5leHBvcnQgY29uc3QgWm9kR1VJRCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RHVUlEXCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICAvLyBab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xuICAgIGNvcmUuJFpvZEdVSUQuaW5pdChpbnN0LCBkZWYpO1xuICAgIFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XG59KTtcbmV4cG9ydCBmdW5jdGlvbiBndWlkKHBhcmFtcykge1xuICAgIHJldHVybiBjb3JlLl9ndWlkKFpvZEdVSUQsIHBhcmFtcyk7XG59XG5leHBvcnQgY29uc3QgWm9kVVVJRCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RVVUlEXCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICAvLyBab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xuICAgIGNvcmUuJFpvZFVVSUQuaW5pdChpbnN0LCBkZWYpO1xuICAgIFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XG59KTtcbmV4cG9ydCBmdW5jdGlvbiB1dWlkKHBhcmFtcykge1xuICAgIHJldHVybiBjb3JlLl91dWlkKFpvZFVVSUQsIHBhcmFtcyk7XG59XG5leHBvcnQgZnVuY3Rpb24gdXVpZHY0KHBhcmFtcykge1xuICAgIHJldHVybiBjb3JlLl91dWlkdjQoWm9kVVVJRCwgcGFyYW1zKTtcbn1cbi8vIFpvZFVVSUR2NlxuZXhwb3J0IGZ1bmN0aW9uIHV1aWR2NihwYXJhbXMpIHtcbiAgICByZXR1cm4gY29yZS5fdXVpZHY2KFpvZFVVSUQsIHBhcmFtcyk7XG59XG4vLyBab2RVVUlEdjdcbmV4cG9ydCBmdW5jdGlvbiB1dWlkdjcocGFyYW1zKSB7XG4gICAgcmV0dXJuIGNvcmUuX3V1aWR2Nyhab2RVVUlELCBwYXJhbXMpO1xufVxuZXhwb3J0IGNvbnN0IFpvZFVSTCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RVUkxcIiwgKGluc3QsIGRlZikgPT4ge1xuICAgIC8vIFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XG4gICAgY29yZS4kWm9kVVJMLmluaXQoaW5zdCwgZGVmKTtcbiAgICBab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xufSk7XG5leHBvcnQgZnVuY3Rpb24gdXJsKHBhcmFtcykge1xuICAgIHJldHVybiBjb3JlLl91cmwoWm9kVVJMLCBwYXJhbXMpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGh0dHBVcmwocGFyYW1zKSB7XG4gICAgcmV0dXJuIGNvcmUuX3VybChab2RVUkwsIHtcbiAgICAgICAgcHJvdG9jb2w6IGNvcmUucmVnZXhlcy5odHRwUHJvdG9jb2wsXG4gICAgICAgIGhvc3RuYW1lOiBjb3JlLnJlZ2V4ZXMuZG9tYWluLFxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufVxuZXhwb3J0IGNvbnN0IFpvZEVtb2ppID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZEVtb2ppXCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICAvLyBab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xuICAgIGNvcmUuJFpvZEVtb2ppLmluaXQoaW5zdCwgZGVmKTtcbiAgICBab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xufSk7XG5leHBvcnQgZnVuY3Rpb24gZW1vamkocGFyYW1zKSB7XG4gICAgcmV0dXJuIGNvcmUuX2Vtb2ppKFpvZEVtb2ppLCBwYXJhbXMpO1xufVxuZXhwb3J0IGNvbnN0IFpvZE5hbm9JRCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2ROYW5vSURcIiwgKGluc3QsIGRlZikgPT4ge1xuICAgIC8vIFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XG4gICAgY29yZS4kWm9kTmFub0lELmluaXQoaW5zdCwgZGVmKTtcbiAgICBab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xufSk7XG5leHBvcnQgZnVuY3Rpb24gbmFub2lkKHBhcmFtcykge1xuICAgIHJldHVybiBjb3JlLl9uYW5vaWQoWm9kTmFub0lELCBwYXJhbXMpO1xufVxuLyoqXG4gKiBAZGVwcmVjYXRlZCBDVUlEIHYxIGlzIGRlcHJlY2F0ZWQgYnkgaXRzIGF1dGhvcnMgZHVlIHRvIGluZm9ybWF0aW9uIGxlYWthZ2VcbiAqICh0aW1lc3RhbXBzIGVtYmVkZGVkIGluIHRoZSBpZCkuIFVzZSB7QGxpbmsgWm9kQ1VJRDJ9IGluc3RlYWQuXG4gKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BhcmFsbGVsZHJpdmUvY3VpZC5cbiAqL1xuZXhwb3J0IGNvbnN0IFpvZENVSUQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kQ1VJRFwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgLy8gWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcbiAgICBjb3JlLiRab2RDVUlELmluaXQoaW5zdCwgZGVmKTtcbiAgICBab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xufSk7XG4vKipcbiAqIFZhbGlkYXRlcyBhIENVSUQgdjEgc3RyaW5nLlxuICpcbiAqIEBkZXByZWNhdGVkIENVSUQgdjEgaXMgZGVwcmVjYXRlZCBieSBpdHMgYXV0aG9ycyBkdWUgdG8gaW5mb3JtYXRpb24gbGVha2FnZVxuICogKHRpbWVzdGFtcHMgZW1iZWRkZWQgaW4gdGhlIGlkKS4gVXNlIHtAbGluayBjdWlkMiB8IGB6LmN1aWQyKClgfSBpbnN0ZWFkLlxuICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9wYXJhbGxlbGRyaXZlL2N1aWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjdWlkKHBhcmFtcykge1xuICAgIHJldHVybiBjb3JlLl9jdWlkKFpvZENVSUQsIHBhcmFtcyk7XG59XG5leHBvcnQgY29uc3QgWm9kQ1VJRDIgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kQ1VJRDJcIiwgKGluc3QsIGRlZikgPT4ge1xuICAgIC8vIFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XG4gICAgY29yZS4kWm9kQ1VJRDIuaW5pdChpbnN0LCBkZWYpO1xuICAgIFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XG59KTtcbmV4cG9ydCBmdW5jdGlvbiBjdWlkMihwYXJhbXMpIHtcbiAgICByZXR1cm4gY29yZS5fY3VpZDIoWm9kQ1VJRDIsIHBhcmFtcyk7XG59XG5leHBvcnQgY29uc3QgWm9kVUxJRCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RVTElEXCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICAvLyBab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xuICAgIGNvcmUuJFpvZFVMSUQuaW5pdChpbnN0LCBkZWYpO1xuICAgIFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XG59KTtcbmV4cG9ydCBmdW5jdGlvbiB1bGlkKHBhcmFtcykge1xuICAgIHJldHVybiBjb3JlLl91bGlkKFpvZFVMSUQsIHBhcmFtcyk7XG59XG5leHBvcnQgY29uc3QgWm9kWElEID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZFhJRFwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgLy8gWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcbiAgICBjb3JlLiRab2RYSUQuaW5pdChpbnN0LCBkZWYpO1xuICAgIFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XG59KTtcbmV4cG9ydCBmdW5jdGlvbiB4aWQocGFyYW1zKSB7XG4gICAgcmV0dXJuIGNvcmUuX3hpZChab2RYSUQsIHBhcmFtcyk7XG59XG5leHBvcnQgY29uc3QgWm9kS1NVSUQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kS1NVSURcIiwgKGluc3QsIGRlZikgPT4ge1xuICAgIC8vIFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XG4gICAgY29yZS4kWm9kS1NVSUQuaW5pdChpbnN0LCBkZWYpO1xuICAgIFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XG59KTtcbmV4cG9ydCBmdW5jdGlvbiBrc3VpZChwYXJhbXMpIHtcbiAgICByZXR1cm4gY29yZS5fa3N1aWQoWm9kS1NVSUQsIHBhcmFtcyk7XG59XG5leHBvcnQgY29uc3QgWm9kSVB2NCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RJUHY0XCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICAvLyBab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xuICAgIGNvcmUuJFpvZElQdjQuaW5pdChpbnN0LCBkZWYpO1xuICAgIFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XG59KTtcbmV4cG9ydCBmdW5jdGlvbiBpcHY0KHBhcmFtcykge1xuICAgIHJldHVybiBjb3JlLl9pcHY0KFpvZElQdjQsIHBhcmFtcyk7XG59XG5leHBvcnQgY29uc3QgWm9kTUFDID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZE1BQ1wiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgLy8gWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcbiAgICBjb3JlLiRab2RNQUMuaW5pdChpbnN0LCBkZWYpO1xuICAgIFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XG59KTtcbmV4cG9ydCBmdW5jdGlvbiBtYWMocGFyYW1zKSB7XG4gICAgcmV0dXJuIGNvcmUuX21hYyhab2RNQUMsIHBhcmFtcyk7XG59XG5leHBvcnQgY29uc3QgWm9kSVB2NiA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RJUHY2XCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICAvLyBab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xuICAgIGNvcmUuJFpvZElQdjYuaW5pdChpbnN0LCBkZWYpO1xuICAgIFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XG59KTtcbmV4cG9ydCBmdW5jdGlvbiBpcHY2KHBhcmFtcykge1xuICAgIHJldHVybiBjb3JlLl9pcHY2KFpvZElQdjYsIHBhcmFtcyk7XG59XG5leHBvcnQgY29uc3QgWm9kQ0lEUnY0ID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZENJRFJ2NFwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgY29yZS4kWm9kQ0lEUnY0LmluaXQoaW5zdCwgZGVmKTtcbiAgICBab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xufSk7XG5leHBvcnQgZnVuY3Rpb24gY2lkcnY0KHBhcmFtcykge1xuICAgIHJldHVybiBjb3JlLl9jaWRydjQoWm9kQ0lEUnY0LCBwYXJhbXMpO1xufVxuZXhwb3J0IGNvbnN0IFpvZENJRFJ2NiA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RDSURSdjZcIiwgKGluc3QsIGRlZikgPT4ge1xuICAgIGNvcmUuJFpvZENJRFJ2Ni5pbml0KGluc3QsIGRlZik7XG4gICAgWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcbn0pO1xuZXhwb3J0IGZ1bmN0aW9uIGNpZHJ2NihwYXJhbXMpIHtcbiAgICByZXR1cm4gY29yZS5fY2lkcnY2KFpvZENJRFJ2NiwgcGFyYW1zKTtcbn1cbmV4cG9ydCBjb25zdCBab2RCYXNlNjQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kQmFzZTY0XCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICAvLyBab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xuICAgIGNvcmUuJFpvZEJhc2U2NC5pbml0KGluc3QsIGRlZik7XG4gICAgWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcbn0pO1xuZXhwb3J0IGZ1bmN0aW9uIGJhc2U2NChwYXJhbXMpIHtcbiAgICByZXR1cm4gY29yZS5fYmFzZTY0KFpvZEJhc2U2NCwgcGFyYW1zKTtcbn1cbmV4cG9ydCBjb25zdCBab2RCYXNlNjRVUkwgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kQmFzZTY0VVJMXCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICAvLyBab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xuICAgIGNvcmUuJFpvZEJhc2U2NFVSTC5pbml0KGluc3QsIGRlZik7XG4gICAgWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcbn0pO1xuZXhwb3J0IGZ1bmN0aW9uIGJhc2U2NHVybChwYXJhbXMpIHtcbiAgICByZXR1cm4gY29yZS5fYmFzZTY0dXJsKFpvZEJhc2U2NFVSTCwgcGFyYW1zKTtcbn1cbmV4cG9ydCBjb25zdCBab2RFMTY0ID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZEUxNjRcIiwgKGluc3QsIGRlZikgPT4ge1xuICAgIC8vIFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XG4gICAgY29yZS4kWm9kRTE2NC5pbml0KGluc3QsIGRlZik7XG4gICAgWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcbn0pO1xuZXhwb3J0IGZ1bmN0aW9uIGUxNjQocGFyYW1zKSB7XG4gICAgcmV0dXJuIGNvcmUuX2UxNjQoWm9kRTE2NCwgcGFyYW1zKTtcbn1cbmV4cG9ydCBjb25zdCBab2RKV1QgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kSldUXCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICAvLyBab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xuICAgIGNvcmUuJFpvZEpXVC5pbml0KGluc3QsIGRlZik7XG4gICAgWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcbn0pO1xuZXhwb3J0IGZ1bmN0aW9uIGp3dChwYXJhbXMpIHtcbiAgICByZXR1cm4gY29yZS5fand0KFpvZEpXVCwgcGFyYW1zKTtcbn1cbmV4cG9ydCBjb25zdCBab2RDdXN0b21TdHJpbmdGb3JtYXQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kQ3VzdG9tU3RyaW5nRm9ybWF0XCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICAvLyBab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xuICAgIGNvcmUuJFpvZEN1c3RvbVN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XG4gICAgWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcbn0pO1xuZXhwb3J0IGZ1bmN0aW9uIHN0cmluZ0Zvcm1hdChmb3JtYXQsIGZuT3JSZWdleCwgX3BhcmFtcyA9IHt9KSB7XG4gICAgcmV0dXJuIGNvcmUuX3N0cmluZ0Zvcm1hdChab2RDdXN0b21TdHJpbmdGb3JtYXQsIGZvcm1hdCwgZm5PclJlZ2V4LCBfcGFyYW1zKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBob3N0bmFtZShfcGFyYW1zKSB7XG4gICAgcmV0dXJuIGNvcmUuX3N0cmluZ0Zvcm1hdChab2RDdXN0b21TdHJpbmdGb3JtYXQsIFwiaG9zdG5hbWVcIiwgY29yZS5yZWdleGVzLmhvc3RuYW1lLCBfcGFyYW1zKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBoZXgoX3BhcmFtcykge1xuICAgIHJldHVybiBjb3JlLl9zdHJpbmdGb3JtYXQoWm9kQ3VzdG9tU3RyaW5nRm9ybWF0LCBcImhleFwiLCBjb3JlLnJlZ2V4ZXMuaGV4LCBfcGFyYW1zKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBoYXNoKGFsZywgcGFyYW1zKSB7XG4gICAgY29uc3QgZW5jID0gcGFyYW1zPy5lbmMgPz8gXCJoZXhcIjtcbiAgICBjb25zdCBmb3JtYXQgPSBgJHthbGd9XyR7ZW5jfWA7XG4gICAgY29uc3QgcmVnZXggPSBjb3JlLnJlZ2V4ZXNbZm9ybWF0XTtcbiAgICBpZiAoIXJlZ2V4KVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVucmVjb2duaXplZCBoYXNoIGZvcm1hdDogJHtmb3JtYXR9YCk7XG4gICAgcmV0dXJuIGNvcmUuX3N0cmluZ0Zvcm1hdChab2RDdXN0b21TdHJpbmdGb3JtYXQsIGZvcm1hdCwgcmVnZXgsIHBhcmFtcyk7XG59XG5leHBvcnQgY29uc3QgWm9kTnVtYmVyID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZE51bWJlclwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgY29yZS4kWm9kTnVtYmVyLmluaXQoaW5zdCwgZGVmKTtcbiAgICBab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcbiAgICBpbnN0Ll96b2QucHJvY2Vzc0pTT05TY2hlbWEgPSAoY3R4LCBqc29uLCBwYXJhbXMpID0+IHByb2Nlc3NvcnMubnVtYmVyUHJvY2Vzc29yKGluc3QsIGN0eCwganNvbiwgcGFyYW1zKTtcbiAgICBfaW5zdGFsbExhenlNZXRob2RzKGluc3QsIFwiWm9kTnVtYmVyXCIsIHtcbiAgICAgICAgZ3QodmFsdWUsIHBhcmFtcykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2soY2hlY2tzLmd0KHZhbHVlLCBwYXJhbXMpKTtcbiAgICAgICAgfSxcbiAgICAgICAgZ3RlKHZhbHVlLCBwYXJhbXMpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoZWNrKGNoZWNrcy5ndGUodmFsdWUsIHBhcmFtcykpO1xuICAgICAgICB9LFxuICAgICAgICBtaW4odmFsdWUsIHBhcmFtcykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2soY2hlY2tzLmd0ZSh2YWx1ZSwgcGFyYW1zKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGx0KHZhbHVlLCBwYXJhbXMpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoZWNrKGNoZWNrcy5sdCh2YWx1ZSwgcGFyYW1zKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGx0ZSh2YWx1ZSwgcGFyYW1zKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGVjayhjaGVja3MubHRlKHZhbHVlLCBwYXJhbXMpKTtcbiAgICAgICAgfSxcbiAgICAgICAgbWF4KHZhbHVlLCBwYXJhbXMpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoZWNrKGNoZWNrcy5sdGUodmFsdWUsIHBhcmFtcykpO1xuICAgICAgICB9LFxuICAgICAgICBpbnQocGFyYW1zKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGVjayhpbnQocGFyYW1zKSk7XG4gICAgICAgIH0sXG4gICAgICAgIHNhZmUocGFyYW1zKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGVjayhpbnQocGFyYW1zKSk7XG4gICAgICAgIH0sXG4gICAgICAgIHBvc2l0aXZlKHBhcmFtcykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2soY2hlY2tzLmd0KDAsIHBhcmFtcykpO1xuICAgICAgICB9LFxuICAgICAgICBub25uZWdhdGl2ZShwYXJhbXMpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoZWNrKGNoZWNrcy5ndGUoMCwgcGFyYW1zKSk7XG4gICAgICAgIH0sXG4gICAgICAgIG5lZ2F0aXZlKHBhcmFtcykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2soY2hlY2tzLmx0KDAsIHBhcmFtcykpO1xuICAgICAgICB9LFxuICAgICAgICBub25wb3NpdGl2ZShwYXJhbXMpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoZWNrKGNoZWNrcy5sdGUoMCwgcGFyYW1zKSk7XG4gICAgICAgIH0sXG4gICAgICAgIG11bHRpcGxlT2YodmFsdWUsIHBhcmFtcykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2soY2hlY2tzLm11bHRpcGxlT2YodmFsdWUsIHBhcmFtcykpO1xuICAgICAgICB9LFxuICAgICAgICBzdGVwKHZhbHVlLCBwYXJhbXMpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoZWNrKGNoZWNrcy5tdWx0aXBsZU9mKHZhbHVlLCBwYXJhbXMpKTtcbiAgICAgICAgfSxcbiAgICAgICAgZmluaXRlKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG4gICAgfSk7XG4gICAgY29uc3QgYmFnID0gaW5zdC5fem9kLmJhZztcbiAgICBpbnN0Lm1pblZhbHVlID1cbiAgICAgICAgTWF0aC5tYXgoYmFnLm1pbmltdW0gPz8gTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZLCBiYWcuZXhjbHVzaXZlTWluaW11bSA/PyBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFkpID8/IG51bGw7XG4gICAgaW5zdC5tYXhWYWx1ZSA9XG4gICAgICAgIE1hdGgubWluKGJhZy5tYXhpbXVtID8/IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSwgYmFnLmV4Y2x1c2l2ZU1heGltdW0gPz8gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZKSA/PyBudWxsO1xuICAgIGluc3QuaXNJbnQgPSAoYmFnLmZvcm1hdCA/PyBcIlwiKS5pbmNsdWRlcyhcImludFwiKSB8fCBOdW1iZXIuaXNTYWZlSW50ZWdlcihiYWcubXVsdGlwbGVPZiA/PyAwLjUpO1xuICAgIGluc3QuaXNGaW5pdGUgPSB0cnVlO1xuICAgIGluc3QuZm9ybWF0ID0gYmFnLmZvcm1hdCA/PyBudWxsO1xufSk7XG5leHBvcnQgZnVuY3Rpb24gbnVtYmVyKHBhcmFtcykge1xuICAgIHJldHVybiBjb3JlLl9udW1iZXIoWm9kTnVtYmVyLCBwYXJhbXMpO1xufVxuZXhwb3J0IGNvbnN0IFpvZE51bWJlckZvcm1hdCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2ROdW1iZXJGb3JtYXRcIiwgKGluc3QsIGRlZikgPT4ge1xuICAgIGNvcmUuJFpvZE51bWJlckZvcm1hdC5pbml0KGluc3QsIGRlZik7XG4gICAgWm9kTnVtYmVyLmluaXQoaW5zdCwgZGVmKTtcbn0pO1xuZXhwb3J0IGZ1bmN0aW9uIGludChwYXJhbXMpIHtcbiAgICByZXR1cm4gY29yZS5faW50KFpvZE51bWJlckZvcm1hdCwgcGFyYW1zKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBmbG9hdDMyKHBhcmFtcykge1xuICAgIHJldHVybiBjb3JlLl9mbG9hdDMyKFpvZE51bWJlckZvcm1hdCwgcGFyYW1zKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBmbG9hdDY0KHBhcmFtcykge1xuICAgIHJldHVybiBjb3JlLl9mbG9hdDY0KFpvZE51bWJlckZvcm1hdCwgcGFyYW1zKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBpbnQzMihwYXJhbXMpIHtcbiAgICByZXR1cm4gY29yZS5faW50MzIoWm9kTnVtYmVyRm9ybWF0LCBwYXJhbXMpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHVpbnQzMihwYXJhbXMpIHtcbiAgICByZXR1cm4gY29yZS5fdWludDMyKFpvZE51bWJlckZvcm1hdCwgcGFyYW1zKTtcbn1cbmV4cG9ydCBjb25zdCBab2RCb29sZWFuID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZEJvb2xlYW5cIiwgKGluc3QsIGRlZikgPT4ge1xuICAgIGNvcmUuJFpvZEJvb2xlYW4uaW5pdChpbnN0LCBkZWYpO1xuICAgIFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xuICAgIGluc3QuX3pvZC5wcm9jZXNzSlNPTlNjaGVtYSA9IChjdHgsIGpzb24sIHBhcmFtcykgPT4gcHJvY2Vzc29ycy5ib29sZWFuUHJvY2Vzc29yKGluc3QsIGN0eCwganNvbiwgcGFyYW1zKTtcbn0pO1xuZXhwb3J0IGZ1bmN0aW9uIGJvb2xlYW4ocGFyYW1zKSB7XG4gICAgcmV0dXJuIGNvcmUuX2Jvb2xlYW4oWm9kQm9vbGVhbiwgcGFyYW1zKTtcbn1cbmV4cG9ydCBjb25zdCBab2RCaWdJbnQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kQmlnSW50XCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICBjb3JlLiRab2RCaWdJbnQuaW5pdChpbnN0LCBkZWYpO1xuICAgIFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xuICAgIGluc3QuX3pvZC5wcm9jZXNzSlNPTlNjaGVtYSA9IChjdHgsIGpzb24sIHBhcmFtcykgPT4gcHJvY2Vzc29ycy5iaWdpbnRQcm9jZXNzb3IoaW5zdCwgY3R4LCBqc29uLCBwYXJhbXMpO1xuICAgIGluc3QuZ3RlID0gKHZhbHVlLCBwYXJhbXMpID0+IGluc3QuY2hlY2soY2hlY2tzLmd0ZSh2YWx1ZSwgcGFyYW1zKSk7XG4gICAgaW5zdC5taW4gPSAodmFsdWUsIHBhcmFtcykgPT4gaW5zdC5jaGVjayhjaGVja3MuZ3RlKHZhbHVlLCBwYXJhbXMpKTtcbiAgICBpbnN0Lmd0ID0gKHZhbHVlLCBwYXJhbXMpID0+IGluc3QuY2hlY2soY2hlY2tzLmd0KHZhbHVlLCBwYXJhbXMpKTtcbiAgICBpbnN0Lmd0ZSA9ICh2YWx1ZSwgcGFyYW1zKSA9PiBpbnN0LmNoZWNrKGNoZWNrcy5ndGUodmFsdWUsIHBhcmFtcykpO1xuICAgIGluc3QubWluID0gKHZhbHVlLCBwYXJhbXMpID0+IGluc3QuY2hlY2soY2hlY2tzLmd0ZSh2YWx1ZSwgcGFyYW1zKSk7XG4gICAgaW5zdC5sdCA9ICh2YWx1ZSwgcGFyYW1zKSA9PiBpbnN0LmNoZWNrKGNoZWNrcy5sdCh2YWx1ZSwgcGFyYW1zKSk7XG4gICAgaW5zdC5sdGUgPSAodmFsdWUsIHBhcmFtcykgPT4gaW5zdC5jaGVjayhjaGVja3MubHRlKHZhbHVlLCBwYXJhbXMpKTtcbiAgICBpbnN0Lm1heCA9ICh2YWx1ZSwgcGFyYW1zKSA9PiBpbnN0LmNoZWNrKGNoZWNrcy5sdGUodmFsdWUsIHBhcmFtcykpO1xuICAgIGluc3QucG9zaXRpdmUgPSAocGFyYW1zKSA9PiBpbnN0LmNoZWNrKGNoZWNrcy5ndChCaWdJbnQoMCksIHBhcmFtcykpO1xuICAgIGluc3QubmVnYXRpdmUgPSAocGFyYW1zKSA9PiBpbnN0LmNoZWNrKGNoZWNrcy5sdChCaWdJbnQoMCksIHBhcmFtcykpO1xuICAgIGluc3Qubm9ucG9zaXRpdmUgPSAocGFyYW1zKSA9PiBpbnN0LmNoZWNrKGNoZWNrcy5sdGUoQmlnSW50KDApLCBwYXJhbXMpKTtcbiAgICBpbnN0Lm5vbm5lZ2F0aXZlID0gKHBhcmFtcykgPT4gaW5zdC5jaGVjayhjaGVja3MuZ3RlKEJpZ0ludCgwKSwgcGFyYW1zKSk7XG4gICAgaW5zdC5tdWx0aXBsZU9mID0gKHZhbHVlLCBwYXJhbXMpID0+IGluc3QuY2hlY2soY2hlY2tzLm11bHRpcGxlT2YodmFsdWUsIHBhcmFtcykpO1xuICAgIGNvbnN0IGJhZyA9IGluc3QuX3pvZC5iYWc7XG4gICAgaW5zdC5taW5WYWx1ZSA9IGJhZy5taW5pbXVtID8/IG51bGw7XG4gICAgaW5zdC5tYXhWYWx1ZSA9IGJhZy5tYXhpbXVtID8/IG51bGw7XG4gICAgaW5zdC5mb3JtYXQgPSBiYWcuZm9ybWF0ID8/IG51bGw7XG59KTtcbmV4cG9ydCBmdW5jdGlvbiBiaWdpbnQocGFyYW1zKSB7XG4gICAgcmV0dXJuIGNvcmUuX2JpZ2ludChab2RCaWdJbnQsIHBhcmFtcyk7XG59XG5leHBvcnQgY29uc3QgWm9kQmlnSW50Rm9ybWF0ID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZEJpZ0ludEZvcm1hdFwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgY29yZS4kWm9kQmlnSW50Rm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcbiAgICBab2RCaWdJbnQuaW5pdChpbnN0LCBkZWYpO1xufSk7XG4vLyBpbnQ2NFxuZXhwb3J0IGZ1bmN0aW9uIGludDY0KHBhcmFtcykge1xuICAgIHJldHVybiBjb3JlLl9pbnQ2NChab2RCaWdJbnRGb3JtYXQsIHBhcmFtcyk7XG59XG4vLyB1aW50NjRcbmV4cG9ydCBmdW5jdGlvbiB1aW50NjQocGFyYW1zKSB7XG4gICAgcmV0dXJuIGNvcmUuX3VpbnQ2NChab2RCaWdJbnRGb3JtYXQsIHBhcmFtcyk7XG59XG5leHBvcnQgY29uc3QgWm9kU3ltYm9sID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZFN5bWJvbFwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgY29yZS4kWm9kU3ltYm9sLmluaXQoaW5zdCwgZGVmKTtcbiAgICBab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcbiAgICBpbnN0Ll96b2QucHJvY2Vzc0pTT05TY2hlbWEgPSAoY3R4LCBqc29uLCBwYXJhbXMpID0+IHByb2Nlc3NvcnMuc3ltYm9sUHJvY2Vzc29yKGluc3QsIGN0eCwganNvbiwgcGFyYW1zKTtcbn0pO1xuZXhwb3J0IGZ1bmN0aW9uIHN5bWJvbChwYXJhbXMpIHtcbiAgICByZXR1cm4gY29yZS5fc3ltYm9sKFpvZFN5bWJvbCwgcGFyYW1zKTtcbn1cbmV4cG9ydCBjb25zdCBab2RVbmRlZmluZWQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kVW5kZWZpbmVkXCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICBjb3JlLiRab2RVbmRlZmluZWQuaW5pdChpbnN0LCBkZWYpO1xuICAgIFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xuICAgIGluc3QuX3pvZC5wcm9jZXNzSlNPTlNjaGVtYSA9IChjdHgsIGpzb24sIHBhcmFtcykgPT4gcHJvY2Vzc29ycy51bmRlZmluZWRQcm9jZXNzb3IoaW5zdCwgY3R4LCBqc29uLCBwYXJhbXMpO1xufSk7XG5mdW5jdGlvbiBfdW5kZWZpbmVkKHBhcmFtcykge1xuICAgIHJldHVybiBjb3JlLl91bmRlZmluZWQoWm9kVW5kZWZpbmVkLCBwYXJhbXMpO1xufVxuZXhwb3J0IHsgX3VuZGVmaW5lZCBhcyB1bmRlZmluZWQgfTtcbmV4cG9ydCBjb25zdCBab2ROdWxsID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZE51bGxcIiwgKGluc3QsIGRlZikgPT4ge1xuICAgIGNvcmUuJFpvZE51bGwuaW5pdChpbnN0LCBkZWYpO1xuICAgIFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xuICAgIGluc3QuX3pvZC5wcm9jZXNzSlNPTlNjaGVtYSA9IChjdHgsIGpzb24sIHBhcmFtcykgPT4gcHJvY2Vzc29ycy5udWxsUHJvY2Vzc29yKGluc3QsIGN0eCwganNvbiwgcGFyYW1zKTtcbn0pO1xuZnVuY3Rpb24gX251bGwocGFyYW1zKSB7XG4gICAgcmV0dXJuIGNvcmUuX251bGwoWm9kTnVsbCwgcGFyYW1zKTtcbn1cbmV4cG9ydCB7IF9udWxsIGFzIG51bGwgfTtcbmV4cG9ydCBjb25zdCBab2RBbnkgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kQW55XCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICBjb3JlLiRab2RBbnkuaW5pdChpbnN0LCBkZWYpO1xuICAgIFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xuICAgIGluc3QuX3pvZC5wcm9jZXNzSlNPTlNjaGVtYSA9IChjdHgsIGpzb24sIHBhcmFtcykgPT4gcHJvY2Vzc29ycy5hbnlQcm9jZXNzb3IoaW5zdCwgY3R4LCBqc29uLCBwYXJhbXMpO1xufSk7XG5leHBvcnQgZnVuY3Rpb24gYW55KCkge1xuICAgIHJldHVybiBjb3JlLl9hbnkoWm9kQW55KTtcbn1cbmV4cG9ydCBjb25zdCBab2RVbmtub3duID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZFVua25vd25cIiwgKGluc3QsIGRlZikgPT4ge1xuICAgIGNvcmUuJFpvZFVua25vd24uaW5pdChpbnN0LCBkZWYpO1xuICAgIFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xuICAgIGluc3QuX3pvZC5wcm9jZXNzSlNPTlNjaGVtYSA9IChjdHgsIGpzb24sIHBhcmFtcykgPT4gcHJvY2Vzc29ycy51bmtub3duUHJvY2Vzc29yKGluc3QsIGN0eCwganNvbiwgcGFyYW1zKTtcbn0pO1xuZXhwb3J0IGZ1bmN0aW9uIHVua25vd24oKSB7XG4gICAgcmV0dXJuIGNvcmUuX3Vua25vd24oWm9kVW5rbm93bik7XG59XG5leHBvcnQgY29uc3QgWm9kTmV2ZXIgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kTmV2ZXJcIiwgKGluc3QsIGRlZikgPT4ge1xuICAgIGNvcmUuJFpvZE5ldmVyLmluaXQoaW5zdCwgZGVmKTtcbiAgICBab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcbiAgICBpbnN0Ll96b2QucHJvY2Vzc0pTT05TY2hlbWEgPSAoY3R4LCBqc29uLCBwYXJhbXMpID0+IHByb2Nlc3NvcnMubmV2ZXJQcm9jZXNzb3IoaW5zdCwgY3R4LCBqc29uLCBwYXJhbXMpO1xufSk7XG5leHBvcnQgZnVuY3Rpb24gbmV2ZXIocGFyYW1zKSB7XG4gICAgcmV0dXJuIGNvcmUuX25ldmVyKFpvZE5ldmVyLCBwYXJhbXMpO1xufVxuZXhwb3J0IGNvbnN0IFpvZFZvaWQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kVm9pZFwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgY29yZS4kWm9kVm9pZC5pbml0KGluc3QsIGRlZik7XG4gICAgWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XG4gICAgaW5zdC5fem9kLnByb2Nlc3NKU09OU2NoZW1hID0gKGN0eCwganNvbiwgcGFyYW1zKSA9PiBwcm9jZXNzb3JzLnZvaWRQcm9jZXNzb3IoaW5zdCwgY3R4LCBqc29uLCBwYXJhbXMpO1xufSk7XG5mdW5jdGlvbiBfdm9pZChwYXJhbXMpIHtcbiAgICByZXR1cm4gY29yZS5fdm9pZChab2RWb2lkLCBwYXJhbXMpO1xufVxuZXhwb3J0IHsgX3ZvaWQgYXMgdm9pZCB9O1xuZXhwb3J0IGNvbnN0IFpvZERhdGUgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kRGF0ZVwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgY29yZS4kWm9kRGF0ZS5pbml0KGluc3QsIGRlZik7XG4gICAgWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XG4gICAgaW5zdC5fem9kLnByb2Nlc3NKU09OU2NoZW1hID0gKGN0eCwganNvbiwgcGFyYW1zKSA9PiBwcm9jZXNzb3JzLmRhdGVQcm9jZXNzb3IoaW5zdCwgY3R4LCBqc29uLCBwYXJhbXMpO1xuICAgIGluc3QubWluID0gKHZhbHVlLCBwYXJhbXMpID0+IGluc3QuY2hlY2soY2hlY2tzLmd0ZSh2YWx1ZSwgcGFyYW1zKSk7XG4gICAgaW5zdC5tYXggPSAodmFsdWUsIHBhcmFtcykgPT4gaW5zdC5jaGVjayhjaGVja3MubHRlKHZhbHVlLCBwYXJhbXMpKTtcbiAgICBjb25zdCBjID0gaW5zdC5fem9kLmJhZztcbiAgICBpbnN0Lm1pbkRhdGUgPSBjLm1pbmltdW0gPyBuZXcgRGF0ZShjLm1pbmltdW0pIDogbnVsbDtcbiAgICBpbnN0Lm1heERhdGUgPSBjLm1heGltdW0gPyBuZXcgRGF0ZShjLm1heGltdW0pIDogbnVsbDtcbn0pO1xuZXhwb3J0IGZ1bmN0aW9uIGRhdGUocGFyYW1zKSB7XG4gICAgcmV0dXJuIGNvcmUuX2RhdGUoWm9kRGF0ZSwgcGFyYW1zKTtcbn1cbmV4cG9ydCBjb25zdCBab2RBcnJheSA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RBcnJheVwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgY29yZS4kWm9kQXJyYXkuaW5pdChpbnN0LCBkZWYpO1xuICAgIFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xuICAgIGluc3QuX3pvZC5wcm9jZXNzSlNPTlNjaGVtYSA9IChjdHgsIGpzb24sIHBhcmFtcykgPT4gcHJvY2Vzc29ycy5hcnJheVByb2Nlc3NvcihpbnN0LCBjdHgsIGpzb24sIHBhcmFtcyk7XG4gICAgaW5zdC5lbGVtZW50ID0gZGVmLmVsZW1lbnQ7XG4gICAgX2luc3RhbGxMYXp5TWV0aG9kcyhpbnN0LCBcIlpvZEFycmF5XCIsIHtcbiAgICAgICAgbWluKG4sIHBhcmFtcykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2soY2hlY2tzLm1pbkxlbmd0aChuLCBwYXJhbXMpKTtcbiAgICAgICAgfSxcbiAgICAgICAgbm9uZW1wdHkocGFyYW1zKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGVjayhjaGVja3MubWluTGVuZ3RoKDEsIHBhcmFtcykpO1xuICAgICAgICB9LFxuICAgICAgICBtYXgobiwgcGFyYW1zKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGVjayhjaGVja3MubWF4TGVuZ3RoKG4sIHBhcmFtcykpO1xuICAgICAgICB9LFxuICAgICAgICBsZW5ndGgobiwgcGFyYW1zKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGVjayhjaGVja3MubGVuZ3RoKG4sIHBhcmFtcykpO1xuICAgICAgICB9LFxuICAgICAgICB1bndyYXAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50O1xuICAgICAgICB9LFxuICAgIH0pO1xufSk7XG5leHBvcnQgZnVuY3Rpb24gYXJyYXkoZWxlbWVudCwgcGFyYW1zKSB7XG4gICAgcmV0dXJuIGNvcmUuX2FycmF5KFpvZEFycmF5LCBlbGVtZW50LCBwYXJhbXMpO1xufVxuLy8gLmtleW9mXG5leHBvcnQgZnVuY3Rpb24ga2V5b2Yoc2NoZW1hKSB7XG4gICAgY29uc3Qgc2hhcGUgPSBzY2hlbWEuX3pvZC5kZWYuc2hhcGU7XG4gICAgcmV0dXJuIF9lbnVtKE9iamVjdC5rZXlzKHNoYXBlKSk7XG59XG5leHBvcnQgY29uc3QgWm9kT2JqZWN0ID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZE9iamVjdFwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgY29yZS4kWm9kT2JqZWN0SklULmluaXQoaW5zdCwgZGVmKTtcbiAgICBab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcbiAgICBpbnN0Ll96b2QucHJvY2Vzc0pTT05TY2hlbWEgPSAoY3R4LCBqc29uLCBwYXJhbXMpID0+IHByb2Nlc3NvcnMub2JqZWN0UHJvY2Vzc29yKGluc3QsIGN0eCwganNvbiwgcGFyYW1zKTtcbiAgICB1dGlsLmRlZmluZUxhenkoaW5zdCwgXCJzaGFwZVwiLCAoKSA9PiB7XG4gICAgICAgIHJldHVybiBkZWYuc2hhcGU7XG4gICAgfSk7XG4gICAgX2luc3RhbGxMYXp5TWV0aG9kcyhpbnN0LCBcIlpvZE9iamVjdFwiLCB7XG4gICAgICAgIGtleW9mKCkge1xuICAgICAgICAgICAgcmV0dXJuIF9lbnVtKE9iamVjdC5rZXlzKHRoaXMuX3pvZC5kZWYuc2hhcGUpKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2F0Y2hhbGwoY2F0Y2hhbGwpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNsb25lKHsgLi4udGhpcy5fem9kLmRlZiwgY2F0Y2hhbGw6IGNhdGNoYWxsIH0pO1xuICAgICAgICB9LFxuICAgICAgICBwYXNzdGhyb3VnaCgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNsb25lKHsgLi4udGhpcy5fem9kLmRlZiwgY2F0Y2hhbGw6IHVua25vd24oKSB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgbG9vc2UoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jbG9uZSh7IC4uLnRoaXMuX3pvZC5kZWYsIGNhdGNoYWxsOiB1bmtub3duKCkgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIHN0cmljdCgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNsb25lKHsgLi4udGhpcy5fem9kLmRlZiwgY2F0Y2hhbGw6IG5ldmVyKCkgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIHN0cmlwKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2xvbmUoeyAuLi50aGlzLl96b2QuZGVmLCBjYXRjaGFsbDogdW5kZWZpbmVkIH0pO1xuICAgICAgICB9LFxuICAgICAgICBleHRlbmQoaW5jb21pbmcpIHtcbiAgICAgICAgICAgIHJldHVybiB1dGlsLmV4dGVuZCh0aGlzLCBpbmNvbWluZyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNhZmVFeHRlbmQoaW5jb21pbmcpIHtcbiAgICAgICAgICAgIHJldHVybiB1dGlsLnNhZmVFeHRlbmQodGhpcywgaW5jb21pbmcpO1xuICAgICAgICB9LFxuICAgICAgICBtZXJnZShvdGhlcikge1xuICAgICAgICAgICAgcmV0dXJuIHV0aWwubWVyZ2UodGhpcywgb3RoZXIpO1xuICAgICAgICB9LFxuICAgICAgICBwaWNrKG1hc2spIHtcbiAgICAgICAgICAgIHJldHVybiB1dGlsLnBpY2sodGhpcywgbWFzayk7XG4gICAgICAgIH0sXG4gICAgICAgIG9taXQobWFzaykge1xuICAgICAgICAgICAgcmV0dXJuIHV0aWwub21pdCh0aGlzLCBtYXNrKTtcbiAgICAgICAgfSxcbiAgICAgICAgcGFydGlhbCguLi5hcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gdXRpbC5wYXJ0aWFsKFpvZE9wdGlvbmFsLCB0aGlzLCBhcmdzWzBdKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVxdWlyZWQoLi4uYXJncykge1xuICAgICAgICAgICAgcmV0dXJuIHV0aWwucmVxdWlyZWQoWm9kTm9uT3B0aW9uYWwsIHRoaXMsIGFyZ3NbMF0pO1xuICAgICAgICB9LFxuICAgIH0pO1xufSk7XG5leHBvcnQgZnVuY3Rpb24gb2JqZWN0KHNoYXBlLCBwYXJhbXMpIHtcbiAgICBjb25zdCBkZWYgPSB7XG4gICAgICAgIHR5cGU6IFwib2JqZWN0XCIsXG4gICAgICAgIHNoYXBlOiBzaGFwZSA/PyB7fSxcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcbiAgICB9O1xuICAgIHJldHVybiBuZXcgWm9kT2JqZWN0KGRlZik7XG59XG4vLyBzdHJpY3RPYmplY3RcbmV4cG9ydCBmdW5jdGlvbiBzdHJpY3RPYmplY3Qoc2hhcGUsIHBhcmFtcykge1xuICAgIHJldHVybiBuZXcgWm9kT2JqZWN0KHtcbiAgICAgICAgdHlwZTogXCJvYmplY3RcIixcbiAgICAgICAgc2hhcGUsXG4gICAgICAgIGNhdGNoYWxsOiBuZXZlcigpLFxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufVxuLy8gbG9vc2VPYmplY3RcbmV4cG9ydCBmdW5jdGlvbiBsb29zZU9iamVjdChzaGFwZSwgcGFyYW1zKSB7XG4gICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgICAgICB0eXBlOiBcIm9iamVjdFwiLFxuICAgICAgICBzaGFwZSxcbiAgICAgICAgY2F0Y2hhbGw6IHVua25vd24oKSxcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn1cbmV4cG9ydCBjb25zdCBab2RVbmlvbiA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RVbmlvblwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgY29yZS4kWm9kVW5pb24uaW5pdChpbnN0LCBkZWYpO1xuICAgIFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xuICAgIGluc3QuX3pvZC5wcm9jZXNzSlNPTlNjaGVtYSA9IChjdHgsIGpzb24sIHBhcmFtcykgPT4gcHJvY2Vzc29ycy51bmlvblByb2Nlc3NvcihpbnN0LCBjdHgsIGpzb24sIHBhcmFtcyk7XG4gICAgaW5zdC5vcHRpb25zID0gZGVmLm9wdGlvbnM7XG59KTtcbmV4cG9ydCBmdW5jdGlvbiB1bmlvbihvcHRpb25zLCBwYXJhbXMpIHtcbiAgICByZXR1cm4gbmV3IFpvZFVuaW9uKHtcbiAgICAgICAgdHlwZTogXCJ1bmlvblwiLFxuICAgICAgICBvcHRpb25zOiBvcHRpb25zLFxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufVxuZXhwb3J0IGNvbnN0IFpvZFhvciA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RYb3JcIiwgKGluc3QsIGRlZikgPT4ge1xuICAgIFpvZFVuaW9uLmluaXQoaW5zdCwgZGVmKTtcbiAgICBjb3JlLiRab2RYb3IuaW5pdChpbnN0LCBkZWYpO1xuICAgIGluc3QuX3pvZC5wcm9jZXNzSlNPTlNjaGVtYSA9IChjdHgsIGpzb24sIHBhcmFtcykgPT4gcHJvY2Vzc29ycy51bmlvblByb2Nlc3NvcihpbnN0LCBjdHgsIGpzb24sIHBhcmFtcyk7XG4gICAgaW5zdC5vcHRpb25zID0gZGVmLm9wdGlvbnM7XG59KTtcbi8qKiBDcmVhdGVzIGFuIGV4Y2x1c2l2ZSB1bmlvbiAoWE9SKSB3aGVyZSBleGFjdGx5IG9uZSBvcHRpb24gbXVzdCBtYXRjaC5cbiAqIFVubGlrZSByZWd1bGFyIHVuaW9ucyB0aGF0IHN1Y2NlZWQgd2hlbiBhbnkgb3B0aW9uIG1hdGNoZXMsIHhvciBmYWlscyBpZlxuICogemVybyBvciBtb3JlIHRoYW4gb25lIG9wdGlvbiBtYXRjaGVzIHRoZSBpbnB1dC4gKi9cbmV4cG9ydCBmdW5jdGlvbiB4b3Iob3B0aW9ucywgcGFyYW1zKSB7XG4gICAgcmV0dXJuIG5ldyBab2RYb3Ioe1xuICAgICAgICB0eXBlOiBcInVuaW9uXCIsXG4gICAgICAgIG9wdGlvbnM6IG9wdGlvbnMsXG4gICAgICAgIGluY2x1c2l2ZTogZmFsc2UsXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59XG5leHBvcnQgY29uc3QgWm9kRGlzY3JpbWluYXRlZFVuaW9uID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZERpc2NyaW1pbmF0ZWRVbmlvblwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgWm9kVW5pb24uaW5pdChpbnN0LCBkZWYpO1xuICAgIGNvcmUuJFpvZERpc2NyaW1pbmF0ZWRVbmlvbi5pbml0KGluc3QsIGRlZik7XG59KTtcbmV4cG9ydCBmdW5jdGlvbiBkaXNjcmltaW5hdGVkVW5pb24oZGlzY3JpbWluYXRvciwgb3B0aW9ucywgcGFyYW1zKSB7XG4gICAgLy8gY29uc3QgW29wdGlvbnMsIHBhcmFtc10gPSBhcmdzO1xuICAgIHJldHVybiBuZXcgWm9kRGlzY3JpbWluYXRlZFVuaW9uKHtcbiAgICAgICAgdHlwZTogXCJ1bmlvblwiLFxuICAgICAgICBvcHRpb25zLFxuICAgICAgICBkaXNjcmltaW5hdG9yLFxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufVxuZXhwb3J0IGNvbnN0IFpvZEludGVyc2VjdGlvbiA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RJbnRlcnNlY3Rpb25cIiwgKGluc3QsIGRlZikgPT4ge1xuICAgIGNvcmUuJFpvZEludGVyc2VjdGlvbi5pbml0KGluc3QsIGRlZik7XG4gICAgWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XG4gICAgaW5zdC5fem9kLnByb2Nlc3NKU09OU2NoZW1hID0gKGN0eCwganNvbiwgcGFyYW1zKSA9PiBwcm9jZXNzb3JzLmludGVyc2VjdGlvblByb2Nlc3NvcihpbnN0LCBjdHgsIGpzb24sIHBhcmFtcyk7XG59KTtcbmV4cG9ydCBmdW5jdGlvbiBpbnRlcnNlY3Rpb24obGVmdCwgcmlnaHQpIHtcbiAgICByZXR1cm4gbmV3IFpvZEludGVyc2VjdGlvbih7XG4gICAgICAgIHR5cGU6IFwiaW50ZXJzZWN0aW9uXCIsXG4gICAgICAgIGxlZnQ6IGxlZnQsXG4gICAgICAgIHJpZ2h0OiByaWdodCxcbiAgICB9KTtcbn1cbmV4cG9ydCBjb25zdCBab2RUdXBsZSA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RUdXBsZVwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgY29yZS4kWm9kVHVwbGUuaW5pdChpbnN0LCBkZWYpO1xuICAgIFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xuICAgIGluc3QuX3pvZC5wcm9jZXNzSlNPTlNjaGVtYSA9IChjdHgsIGpzb24sIHBhcmFtcykgPT4gcHJvY2Vzc29ycy50dXBsZVByb2Nlc3NvcihpbnN0LCBjdHgsIGpzb24sIHBhcmFtcyk7XG4gICAgaW5zdC5yZXN0ID0gKHJlc3QpID0+IGluc3QuY2xvbmUoe1xuICAgICAgICAuLi5pbnN0Ll96b2QuZGVmLFxuICAgICAgICByZXN0OiByZXN0LFxuICAgIH0pO1xufSk7XG5leHBvcnQgZnVuY3Rpb24gdHVwbGUoaXRlbXMsIF9wYXJhbXNPclJlc3QsIF9wYXJhbXMpIHtcbiAgICBjb25zdCBoYXNSZXN0ID0gX3BhcmFtc09yUmVzdCBpbnN0YW5jZW9mIGNvcmUuJFpvZFR5cGU7XG4gICAgY29uc3QgcGFyYW1zID0gaGFzUmVzdCA/IF9wYXJhbXMgOiBfcGFyYW1zT3JSZXN0O1xuICAgIGNvbnN0IHJlc3QgPSBoYXNSZXN0ID8gX3BhcmFtc09yUmVzdCA6IG51bGw7XG4gICAgcmV0dXJuIG5ldyBab2RUdXBsZSh7XG4gICAgICAgIHR5cGU6IFwidHVwbGVcIixcbiAgICAgICAgaXRlbXM6IGl0ZW1zLFxuICAgICAgICByZXN0LFxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufVxuZXhwb3J0IGNvbnN0IFpvZFJlY29yZCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RSZWNvcmRcIiwgKGluc3QsIGRlZikgPT4ge1xuICAgIGNvcmUuJFpvZFJlY29yZC5pbml0KGluc3QsIGRlZik7XG4gICAgWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XG4gICAgaW5zdC5fem9kLnByb2Nlc3NKU09OU2NoZW1hID0gKGN0eCwganNvbiwgcGFyYW1zKSA9PiBwcm9jZXNzb3JzLnJlY29yZFByb2Nlc3NvcihpbnN0LCBjdHgsIGpzb24sIHBhcmFtcyk7XG4gICAgaW5zdC5rZXlUeXBlID0gZGVmLmtleVR5cGU7XG4gICAgaW5zdC52YWx1ZVR5cGUgPSBkZWYudmFsdWVUeXBlO1xufSk7XG5leHBvcnQgZnVuY3Rpb24gcmVjb3JkKGtleVR5cGUsIHZhbHVlVHlwZSwgcGFyYW1zKSB7XG4gICAgLy8gdjMtY29tcGF0OiB6LnJlY29yZCh2YWx1ZVR5cGUsIHBhcmFtcz8pIOKAlCBkZWZhdWx0cyBrZXlUeXBlIHRvIHouc3RyaW5nKClcbiAgICBpZiAoIXZhbHVlVHlwZSB8fCAhdmFsdWVUeXBlLl96b2QpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RSZWNvcmQoe1xuICAgICAgICAgICAgdHlwZTogXCJyZWNvcmRcIixcbiAgICAgICAgICAgIGtleVR5cGU6IHN0cmluZygpLFxuICAgICAgICAgICAgdmFsdWVUeXBlOiBrZXlUeXBlLFxuICAgICAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXModmFsdWVUeXBlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgWm9kUmVjb3JkKHtcbiAgICAgICAgdHlwZTogXCJyZWNvcmRcIixcbiAgICAgICAga2V5VHlwZSxcbiAgICAgICAgdmFsdWVUeXBlOiB2YWx1ZVR5cGUsXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59XG4vLyB0eXBlIGFsa3NqZiA9IGNvcmUub3V0cHV0PGNvcmUuJFpvZFJlY29yZEtleT47XG5leHBvcnQgZnVuY3Rpb24gcGFydGlhbFJlY29yZChrZXlUeXBlLCB2YWx1ZVR5cGUsIHBhcmFtcykge1xuICAgIGNvbnN0IGsgPSBjb3JlLmNsb25lKGtleVR5cGUpO1xuICAgIGsuX3pvZC52YWx1ZXMgPSB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIG5ldyBab2RSZWNvcmQoe1xuICAgICAgICB0eXBlOiBcInJlY29yZFwiLFxuICAgICAgICBrZXlUeXBlOiBrLFxuICAgICAgICB2YWx1ZVR5cGU6IHZhbHVlVHlwZSxcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBsb29zZVJlY29yZChrZXlUeXBlLCB2YWx1ZVR5cGUsIHBhcmFtcykge1xuICAgIHJldHVybiBuZXcgWm9kUmVjb3JkKHtcbiAgICAgICAgdHlwZTogXCJyZWNvcmRcIixcbiAgICAgICAga2V5VHlwZSxcbiAgICAgICAgdmFsdWVUeXBlOiB2YWx1ZVR5cGUsXG4gICAgICAgIG1vZGU6IFwibG9vc2VcIixcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn1cbmV4cG9ydCBjb25zdCBab2RNYXAgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kTWFwXCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICBjb3JlLiRab2RNYXAuaW5pdChpbnN0LCBkZWYpO1xuICAgIFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xuICAgIGluc3QuX3pvZC5wcm9jZXNzSlNPTlNjaGVtYSA9IChjdHgsIGpzb24sIHBhcmFtcykgPT4gcHJvY2Vzc29ycy5tYXBQcm9jZXNzb3IoaW5zdCwgY3R4LCBqc29uLCBwYXJhbXMpO1xuICAgIGluc3Qua2V5VHlwZSA9IGRlZi5rZXlUeXBlO1xuICAgIGluc3QudmFsdWVUeXBlID0gZGVmLnZhbHVlVHlwZTtcbiAgICBpbnN0Lm1pbiA9ICguLi5hcmdzKSA9PiBpbnN0LmNoZWNrKGNvcmUuX21pblNpemUoLi4uYXJncykpO1xuICAgIGluc3Qubm9uZW1wdHkgPSAocGFyYW1zKSA9PiBpbnN0LmNoZWNrKGNvcmUuX21pblNpemUoMSwgcGFyYW1zKSk7XG4gICAgaW5zdC5tYXggPSAoLi4uYXJncykgPT4gaW5zdC5jaGVjayhjb3JlLl9tYXhTaXplKC4uLmFyZ3MpKTtcbiAgICBpbnN0LnNpemUgPSAoLi4uYXJncykgPT4gaW5zdC5jaGVjayhjb3JlLl9zaXplKC4uLmFyZ3MpKTtcbn0pO1xuZXhwb3J0IGZ1bmN0aW9uIG1hcChrZXlUeXBlLCB2YWx1ZVR5cGUsIHBhcmFtcykge1xuICAgIHJldHVybiBuZXcgWm9kTWFwKHtcbiAgICAgICAgdHlwZTogXCJtYXBcIixcbiAgICAgICAga2V5VHlwZToga2V5VHlwZSxcbiAgICAgICAgdmFsdWVUeXBlOiB2YWx1ZVR5cGUsXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59XG5leHBvcnQgY29uc3QgWm9kU2V0ID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZFNldFwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgY29yZS4kWm9kU2V0LmluaXQoaW5zdCwgZGVmKTtcbiAgICBab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcbiAgICBpbnN0Ll96b2QucHJvY2Vzc0pTT05TY2hlbWEgPSAoY3R4LCBqc29uLCBwYXJhbXMpID0+IHByb2Nlc3NvcnMuc2V0UHJvY2Vzc29yKGluc3QsIGN0eCwganNvbiwgcGFyYW1zKTtcbiAgICBpbnN0Lm1pbiA9ICguLi5hcmdzKSA9PiBpbnN0LmNoZWNrKGNvcmUuX21pblNpemUoLi4uYXJncykpO1xuICAgIGluc3Qubm9uZW1wdHkgPSAocGFyYW1zKSA9PiBpbnN0LmNoZWNrKGNvcmUuX21pblNpemUoMSwgcGFyYW1zKSk7XG4gICAgaW5zdC5tYXggPSAoLi4uYXJncykgPT4gaW5zdC5jaGVjayhjb3JlLl9tYXhTaXplKC4uLmFyZ3MpKTtcbiAgICBpbnN0LnNpemUgPSAoLi4uYXJncykgPT4gaW5zdC5jaGVjayhjb3JlLl9zaXplKC4uLmFyZ3MpKTtcbn0pO1xuZXhwb3J0IGZ1bmN0aW9uIHNldCh2YWx1ZVR5cGUsIHBhcmFtcykge1xuICAgIHJldHVybiBuZXcgWm9kU2V0KHtcbiAgICAgICAgdHlwZTogXCJzZXRcIixcbiAgICAgICAgdmFsdWVUeXBlOiB2YWx1ZVR5cGUsXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59XG5leHBvcnQgY29uc3QgWm9kRW51bSA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RFbnVtXCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICBjb3JlLiRab2RFbnVtLmluaXQoaW5zdCwgZGVmKTtcbiAgICBab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcbiAgICBpbnN0Ll96b2QucHJvY2Vzc0pTT05TY2hlbWEgPSAoY3R4LCBqc29uLCBwYXJhbXMpID0+IHByb2Nlc3NvcnMuZW51bVByb2Nlc3NvcihpbnN0LCBjdHgsIGpzb24sIHBhcmFtcyk7XG4gICAgaW5zdC5lbnVtID0gZGVmLmVudHJpZXM7XG4gICAgaW5zdC5vcHRpb25zID0gT2JqZWN0LnZhbHVlcyhkZWYuZW50cmllcyk7XG4gICAgY29uc3Qga2V5cyA9IG5ldyBTZXQoT2JqZWN0LmtleXMoZGVmLmVudHJpZXMpKTtcbiAgICBpbnN0LmV4dHJhY3QgPSAodmFsdWVzLCBwYXJhbXMpID0+IHtcbiAgICAgICAgY29uc3QgbmV3RW50cmllcyA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IHZhbHVlIG9mIHZhbHVlcykge1xuICAgICAgICAgICAgaWYgKGtleXMuaGFzKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIG5ld0VudHJpZXNbdmFsdWVdID0gZGVmLmVudHJpZXNbdmFsdWVdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgS2V5ICR7dmFsdWV9IG5vdCBmb3VuZCBpbiBlbnVtYCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBab2RFbnVtKHtcbiAgICAgICAgICAgIC4uLmRlZixcbiAgICAgICAgICAgIGNoZWNrczogW10sXG4gICAgICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxuICAgICAgICAgICAgZW50cmllczogbmV3RW50cmllcyxcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBpbnN0LmV4Y2x1ZGUgPSAodmFsdWVzLCBwYXJhbXMpID0+IHtcbiAgICAgICAgY29uc3QgbmV3RW50cmllcyA9IHsgLi4uZGVmLmVudHJpZXMgfTtcbiAgICAgICAgZm9yIChjb25zdCB2YWx1ZSBvZiB2YWx1ZXMpIHtcbiAgICAgICAgICAgIGlmIChrZXlzLmhhcyh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgbmV3RW50cmllc1t2YWx1ZV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBLZXkgJHt2YWx1ZX0gbm90IGZvdW5kIGluIGVudW1gKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFpvZEVudW0oe1xuICAgICAgICAgICAgLi4uZGVmLFxuICAgICAgICAgICAgY2hlY2tzOiBbXSxcbiAgICAgICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXG4gICAgICAgICAgICBlbnRyaWVzOiBuZXdFbnRyaWVzLFxuICAgICAgICB9KTtcbiAgICB9O1xufSk7XG5mdW5jdGlvbiBfZW51bSh2YWx1ZXMsIHBhcmFtcykge1xuICAgIGNvbnN0IGVudHJpZXMgPSBBcnJheS5pc0FycmF5KHZhbHVlcykgPyBPYmplY3QuZnJvbUVudHJpZXModmFsdWVzLm1hcCgodikgPT4gW3YsIHZdKSkgOiB2YWx1ZXM7XG4gICAgcmV0dXJuIG5ldyBab2RFbnVtKHtcbiAgICAgICAgdHlwZTogXCJlbnVtXCIsXG4gICAgICAgIGVudHJpZXMsXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59XG5leHBvcnQgeyBfZW51bSBhcyBlbnVtIH07XG4vKiogQGRlcHJlY2F0ZWQgVGhpcyBBUEkgaGFzIGJlZW4gbWVyZ2VkIGludG8gYHouZW51bSgpYC4gVXNlIGB6LmVudW0oKWAgaW5zdGVhZC5cbiAqXG4gKiBgYGB0c1xuICogZW51bSBDb2xvcnMgeyByZWQsIGdyZWVuLCBibHVlIH1cbiAqIHouZW51bShDb2xvcnMpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBuYXRpdmVFbnVtKGVudHJpZXMsIHBhcmFtcykge1xuICAgIHJldHVybiBuZXcgWm9kRW51bSh7XG4gICAgICAgIHR5cGU6IFwiZW51bVwiLFxuICAgICAgICBlbnRyaWVzLFxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufVxuZXhwb3J0IGNvbnN0IFpvZExpdGVyYWwgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kTGl0ZXJhbFwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgY29yZS4kWm9kTGl0ZXJhbC5pbml0KGluc3QsIGRlZik7XG4gICAgWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XG4gICAgaW5zdC5fem9kLnByb2Nlc3NKU09OU2NoZW1hID0gKGN0eCwganNvbiwgcGFyYW1zKSA9PiBwcm9jZXNzb3JzLmxpdGVyYWxQcm9jZXNzb3IoaW5zdCwgY3R4LCBqc29uLCBwYXJhbXMpO1xuICAgIGluc3QudmFsdWVzID0gbmV3IFNldChkZWYudmFsdWVzKTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoaW5zdCwgXCJ2YWx1ZVwiLCB7XG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgIGlmIChkZWYudmFsdWVzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGlzIHNjaGVtYSBjb250YWlucyBtdWx0aXBsZSB2YWxpZCBsaXRlcmFsIHZhbHVlcy4gVXNlIGAudmFsdWVzYCBpbnN0ZWFkLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBkZWYudmFsdWVzWzBdO1xuICAgICAgICB9LFxuICAgIH0pO1xufSk7XG5leHBvcnQgZnVuY3Rpb24gbGl0ZXJhbCh2YWx1ZSwgcGFyYW1zKSB7XG4gICAgcmV0dXJuIG5ldyBab2RMaXRlcmFsKHtcbiAgICAgICAgdHlwZTogXCJsaXRlcmFsXCIsXG4gICAgICAgIHZhbHVlczogQXJyYXkuaXNBcnJheSh2YWx1ZSkgPyB2YWx1ZSA6IFt2YWx1ZV0sXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59XG5leHBvcnQgY29uc3QgWm9kRmlsZSA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RGaWxlXCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICBjb3JlLiRab2RGaWxlLmluaXQoaW5zdCwgZGVmKTtcbiAgICBab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcbiAgICBpbnN0Ll96b2QucHJvY2Vzc0pTT05TY2hlbWEgPSAoY3R4LCBqc29uLCBwYXJhbXMpID0+IHByb2Nlc3NvcnMuZmlsZVByb2Nlc3NvcihpbnN0LCBjdHgsIGpzb24sIHBhcmFtcyk7XG4gICAgaW5zdC5taW4gPSAoc2l6ZSwgcGFyYW1zKSA9PiBpbnN0LmNoZWNrKGNvcmUuX21pblNpemUoc2l6ZSwgcGFyYW1zKSk7XG4gICAgaW5zdC5tYXggPSAoc2l6ZSwgcGFyYW1zKSA9PiBpbnN0LmNoZWNrKGNvcmUuX21heFNpemUoc2l6ZSwgcGFyYW1zKSk7XG4gICAgaW5zdC5taW1lID0gKHR5cGVzLCBwYXJhbXMpID0+IGluc3QuY2hlY2soY29yZS5fbWltZShBcnJheS5pc0FycmF5KHR5cGVzKSA/IHR5cGVzIDogW3R5cGVzXSwgcGFyYW1zKSk7XG59KTtcbmV4cG9ydCBmdW5jdGlvbiBmaWxlKHBhcmFtcykge1xuICAgIHJldHVybiBjb3JlLl9maWxlKFpvZEZpbGUsIHBhcmFtcyk7XG59XG5leHBvcnQgY29uc3QgWm9kVHJhbnNmb3JtID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZFRyYW5zZm9ybVwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgY29yZS4kWm9kVHJhbnNmb3JtLmluaXQoaW5zdCwgZGVmKTtcbiAgICBab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcbiAgICBpbnN0Ll96b2QucHJvY2Vzc0pTT05TY2hlbWEgPSAoY3R4LCBqc29uLCBwYXJhbXMpID0+IHByb2Nlc3NvcnMudHJhbnNmb3JtUHJvY2Vzc29yKGluc3QsIGN0eCwganNvbiwgcGFyYW1zKTtcbiAgICBpbnN0Ll96b2QucGFyc2UgPSAocGF5bG9hZCwgX2N0eCkgPT4ge1xuICAgICAgICBpZiAoX2N0eC5kaXJlY3Rpb24gPT09IFwiYmFja3dhcmRcIikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IGNvcmUuJFpvZEVuY29kZUVycm9yKGluc3QuY29uc3RydWN0b3IubmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgcGF5bG9hZC5hZGRJc3N1ZSA9IChpc3N1ZSkgPT4ge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBpc3N1ZSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2godXRpbC5pc3N1ZShpc3N1ZSwgcGF5bG9hZC52YWx1ZSwgZGVmKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBmb3IgWm9kIDMgYmFja3dhcmRzIGNvbXBhdGliaWxpdHlcbiAgICAgICAgICAgICAgICBjb25zdCBfaXNzdWUgPSBpc3N1ZTtcbiAgICAgICAgICAgICAgICBpZiAoX2lzc3VlLmZhdGFsKVxuICAgICAgICAgICAgICAgICAgICBfaXNzdWUuY29udGludWUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBfaXNzdWUuY29kZSA/PyAoX2lzc3VlLmNvZGUgPSBcImN1c3RvbVwiKTtcbiAgICAgICAgICAgICAgICBfaXNzdWUuaW5wdXQgPz8gKF9pc3N1ZS5pbnB1dCA9IHBheWxvYWQudmFsdWUpO1xuICAgICAgICAgICAgICAgIF9pc3N1ZS5pbnN0ID8/IChfaXNzdWUuaW5zdCA9IGluc3QpO1xuICAgICAgICAgICAgICAgIC8vIF9pc3N1ZS5jb250aW51ZSA/Pz0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHV0aWwuaXNzdWUoX2lzc3VlKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IG91dHB1dCA9IGRlZi50cmFuc2Zvcm0ocGF5bG9hZC52YWx1ZSwgcGF5bG9hZCk7XG4gICAgICAgIGlmIChvdXRwdXQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgICAgICByZXR1cm4gb3V0cHV0LnRoZW4oKG91dHB1dCkgPT4ge1xuICAgICAgICAgICAgICAgIHBheWxvYWQudmFsdWUgPSBvdXRwdXQ7XG4gICAgICAgICAgICAgICAgcGF5bG9hZC5mYWxsYmFjayA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBheWxvYWQ7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBwYXlsb2FkLnZhbHVlID0gb3V0cHV0O1xuICAgICAgICBwYXlsb2FkLmZhbGxiYWNrID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHBheWxvYWQ7XG4gICAgfTtcbn0pO1xuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybShmbikge1xuICAgIHJldHVybiBuZXcgWm9kVHJhbnNmb3JtKHtcbiAgICAgICAgdHlwZTogXCJ0cmFuc2Zvcm1cIixcbiAgICAgICAgdHJhbnNmb3JtOiBmbixcbiAgICB9KTtcbn1cbmV4cG9ydCBjb25zdCBab2RPcHRpb25hbCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RPcHRpb25hbFwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgY29yZS4kWm9kT3B0aW9uYWwuaW5pdChpbnN0LCBkZWYpO1xuICAgIFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xuICAgIGluc3QuX3pvZC5wcm9jZXNzSlNPTlNjaGVtYSA9IChjdHgsIGpzb24sIHBhcmFtcykgPT4gcHJvY2Vzc29ycy5vcHRpb25hbFByb2Nlc3NvcihpbnN0LCBjdHgsIGpzb24sIHBhcmFtcyk7XG4gICAgaW5zdC51bndyYXAgPSAoKSA9PiBpbnN0Ll96b2QuZGVmLmlubmVyVHlwZTtcbn0pO1xuZXhwb3J0IGZ1bmN0aW9uIG9wdGlvbmFsKGlubmVyVHlwZSkge1xuICAgIHJldHVybiBuZXcgWm9kT3B0aW9uYWwoe1xuICAgICAgICB0eXBlOiBcIm9wdGlvbmFsXCIsXG4gICAgICAgIGlubmVyVHlwZTogaW5uZXJUeXBlLFxuICAgIH0pO1xufVxuZXhwb3J0IGNvbnN0IFpvZEV4YWN0T3B0aW9uYWwgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kRXhhY3RPcHRpb25hbFwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgY29yZS4kWm9kRXhhY3RPcHRpb25hbC5pbml0KGluc3QsIGRlZik7XG4gICAgWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XG4gICAgaW5zdC5fem9kLnByb2Nlc3NKU09OU2NoZW1hID0gKGN0eCwganNvbiwgcGFyYW1zKSA9PiBwcm9jZXNzb3JzLm9wdGlvbmFsUHJvY2Vzc29yKGluc3QsIGN0eCwganNvbiwgcGFyYW1zKTtcbiAgICBpbnN0LnVud3JhcCA9ICgpID0+IGluc3QuX3pvZC5kZWYuaW5uZXJUeXBlO1xufSk7XG5leHBvcnQgZnVuY3Rpb24gZXhhY3RPcHRpb25hbChpbm5lclR5cGUpIHtcbiAgICByZXR1cm4gbmV3IFpvZEV4YWN0T3B0aW9uYWwoe1xuICAgICAgICB0eXBlOiBcIm9wdGlvbmFsXCIsXG4gICAgICAgIGlubmVyVHlwZTogaW5uZXJUeXBlLFxuICAgIH0pO1xufVxuZXhwb3J0IGNvbnN0IFpvZE51bGxhYmxlID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZE51bGxhYmxlXCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICBjb3JlLiRab2ROdWxsYWJsZS5pbml0KGluc3QsIGRlZik7XG4gICAgWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XG4gICAgaW5zdC5fem9kLnByb2Nlc3NKU09OU2NoZW1hID0gKGN0eCwganNvbiwgcGFyYW1zKSA9PiBwcm9jZXNzb3JzLm51bGxhYmxlUHJvY2Vzc29yKGluc3QsIGN0eCwganNvbiwgcGFyYW1zKTtcbiAgICBpbnN0LnVud3JhcCA9ICgpID0+IGluc3QuX3pvZC5kZWYuaW5uZXJUeXBlO1xufSk7XG5leHBvcnQgZnVuY3Rpb24gbnVsbGFibGUoaW5uZXJUeXBlKSB7XG4gICAgcmV0dXJuIG5ldyBab2ROdWxsYWJsZSh7XG4gICAgICAgIHR5cGU6IFwibnVsbGFibGVcIixcbiAgICAgICAgaW5uZXJUeXBlOiBpbm5lclR5cGUsXG4gICAgfSk7XG59XG4vLyBudWxsaXNoXG5leHBvcnQgZnVuY3Rpb24gbnVsbGlzaChpbm5lclR5cGUpIHtcbiAgICByZXR1cm4gb3B0aW9uYWwobnVsbGFibGUoaW5uZXJUeXBlKSk7XG59XG5leHBvcnQgY29uc3QgWm9kRGVmYXVsdCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2REZWZhdWx0XCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICBjb3JlLiRab2REZWZhdWx0LmluaXQoaW5zdCwgZGVmKTtcbiAgICBab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcbiAgICBpbnN0Ll96b2QucHJvY2Vzc0pTT05TY2hlbWEgPSAoY3R4LCBqc29uLCBwYXJhbXMpID0+IHByb2Nlc3NvcnMuZGVmYXVsdFByb2Nlc3NvcihpbnN0LCBjdHgsIGpzb24sIHBhcmFtcyk7XG4gICAgaW5zdC51bndyYXAgPSAoKSA9PiBpbnN0Ll96b2QuZGVmLmlubmVyVHlwZTtcbiAgICBpbnN0LnJlbW92ZURlZmF1bHQgPSBpbnN0LnVud3JhcDtcbn0pO1xuZXhwb3J0IGZ1bmN0aW9uIF9kZWZhdWx0KGlubmVyVHlwZSwgZGVmYXVsdFZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBab2REZWZhdWx0KHtcbiAgICAgICAgdHlwZTogXCJkZWZhdWx0XCIsXG4gICAgICAgIGlubmVyVHlwZTogaW5uZXJUeXBlLFxuICAgICAgICBnZXQgZGVmYXVsdFZhbHVlKCkge1xuICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiBkZWZhdWx0VmFsdWUgPT09IFwiZnVuY3Rpb25cIiA/IGRlZmF1bHRWYWx1ZSgpIDogdXRpbC5zaGFsbG93Q2xvbmUoZGVmYXVsdFZhbHVlKTtcbiAgICAgICAgfSxcbiAgICB9KTtcbn1cbmV4cG9ydCBjb25zdCBab2RQcmVmYXVsdCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RQcmVmYXVsdFwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgY29yZS4kWm9kUHJlZmF1bHQuaW5pdChpbnN0LCBkZWYpO1xuICAgIFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xuICAgIGluc3QuX3pvZC5wcm9jZXNzSlNPTlNjaGVtYSA9IChjdHgsIGpzb24sIHBhcmFtcykgPT4gcHJvY2Vzc29ycy5wcmVmYXVsdFByb2Nlc3NvcihpbnN0LCBjdHgsIGpzb24sIHBhcmFtcyk7XG4gICAgaW5zdC51bndyYXAgPSAoKSA9PiBpbnN0Ll96b2QuZGVmLmlubmVyVHlwZTtcbn0pO1xuZXhwb3J0IGZ1bmN0aW9uIHByZWZhdWx0KGlubmVyVHlwZSwgZGVmYXVsdFZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBab2RQcmVmYXVsdCh7XG4gICAgICAgIHR5cGU6IFwicHJlZmF1bHRcIixcbiAgICAgICAgaW5uZXJUeXBlOiBpbm5lclR5cGUsXG4gICAgICAgIGdldCBkZWZhdWx0VmFsdWUoKSB7XG4gICAgICAgICAgICByZXR1cm4gdHlwZW9mIGRlZmF1bHRWYWx1ZSA9PT0gXCJmdW5jdGlvblwiID8gZGVmYXVsdFZhbHVlKCkgOiB1dGlsLnNoYWxsb3dDbG9uZShkZWZhdWx0VmFsdWUpO1xuICAgICAgICB9LFxuICAgIH0pO1xufVxuZXhwb3J0IGNvbnN0IFpvZE5vbk9wdGlvbmFsID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZE5vbk9wdGlvbmFsXCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICBjb3JlLiRab2ROb25PcHRpb25hbC5pbml0KGluc3QsIGRlZik7XG4gICAgWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XG4gICAgaW5zdC5fem9kLnByb2Nlc3NKU09OU2NoZW1hID0gKGN0eCwganNvbiwgcGFyYW1zKSA9PiBwcm9jZXNzb3JzLm5vbm9wdGlvbmFsUHJvY2Vzc29yKGluc3QsIGN0eCwganNvbiwgcGFyYW1zKTtcbiAgICBpbnN0LnVud3JhcCA9ICgpID0+IGluc3QuX3pvZC5kZWYuaW5uZXJUeXBlO1xufSk7XG5leHBvcnQgZnVuY3Rpb24gbm9ub3B0aW9uYWwoaW5uZXJUeXBlLCBwYXJhbXMpIHtcbiAgICByZXR1cm4gbmV3IFpvZE5vbk9wdGlvbmFsKHtcbiAgICAgICAgdHlwZTogXCJub25vcHRpb25hbFwiLFxuICAgICAgICBpbm5lclR5cGU6IGlubmVyVHlwZSxcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn1cbmV4cG9ydCBjb25zdCBab2RTdWNjZXNzID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZFN1Y2Nlc3NcIiwgKGluc3QsIGRlZikgPT4ge1xuICAgIGNvcmUuJFpvZFN1Y2Nlc3MuaW5pdChpbnN0LCBkZWYpO1xuICAgIFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xuICAgIGluc3QuX3pvZC5wcm9jZXNzSlNPTlNjaGVtYSA9IChjdHgsIGpzb24sIHBhcmFtcykgPT4gcHJvY2Vzc29ycy5zdWNjZXNzUHJvY2Vzc29yKGluc3QsIGN0eCwganNvbiwgcGFyYW1zKTtcbiAgICBpbnN0LnVud3JhcCA9ICgpID0+IGluc3QuX3pvZC5kZWYuaW5uZXJUeXBlO1xufSk7XG5leHBvcnQgZnVuY3Rpb24gc3VjY2Vzcyhpbm5lclR5cGUpIHtcbiAgICByZXR1cm4gbmV3IFpvZFN1Y2Nlc3Moe1xuICAgICAgICB0eXBlOiBcInN1Y2Nlc3NcIixcbiAgICAgICAgaW5uZXJUeXBlOiBpbm5lclR5cGUsXG4gICAgfSk7XG59XG5leHBvcnQgY29uc3QgWm9kQ2F0Y2ggPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kQ2F0Y2hcIiwgKGluc3QsIGRlZikgPT4ge1xuICAgIGNvcmUuJFpvZENhdGNoLmluaXQoaW5zdCwgZGVmKTtcbiAgICBab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcbiAgICBpbnN0Ll96b2QucHJvY2Vzc0pTT05TY2hlbWEgPSAoY3R4LCBqc29uLCBwYXJhbXMpID0+IHByb2Nlc3NvcnMuY2F0Y2hQcm9jZXNzb3IoaW5zdCwgY3R4LCBqc29uLCBwYXJhbXMpO1xuICAgIGluc3QudW53cmFwID0gKCkgPT4gaW5zdC5fem9kLmRlZi5pbm5lclR5cGU7XG4gICAgaW5zdC5yZW1vdmVDYXRjaCA9IGluc3QudW53cmFwO1xufSk7XG5mdW5jdGlvbiBfY2F0Y2goaW5uZXJUeXBlLCBjYXRjaFZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBab2RDYXRjaCh7XG4gICAgICAgIHR5cGU6IFwiY2F0Y2hcIixcbiAgICAgICAgaW5uZXJUeXBlOiBpbm5lclR5cGUsXG4gICAgICAgIGNhdGNoVmFsdWU6ICh0eXBlb2YgY2F0Y2hWYWx1ZSA9PT0gXCJmdW5jdGlvblwiID8gY2F0Y2hWYWx1ZSA6ICgpID0+IGNhdGNoVmFsdWUpLFxuICAgIH0pO1xufVxuZXhwb3J0IHsgX2NhdGNoIGFzIGNhdGNoIH07XG5leHBvcnQgY29uc3QgWm9kTmFOID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZE5hTlwiLCAoaW5zdCwgZGVmKSA9PiB7XG4gICAgY29yZS4kWm9kTmFOLmluaXQoaW5zdCwgZGVmKTtcbiAgICBab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcbiAgICBpbnN0Ll96b2QucHJvY2Vzc0pTT05TY2hlbWEgPSAoY3R4LCBqc29uLCBwYXJhbXMpID0+IHByb2Nlc3NvcnMubmFuUHJvY2Vzc29yKGluc3QsIGN0eCwganNvbiwgcGFyYW1zKTtcbn0pO1xuZXhwb3J0IGZ1bmN0aW9uIG5hbihwYXJhbXMpIHtcbiAgICByZXR1cm4gY29yZS5fbmFuKFpvZE5hTiwgcGFyYW1zKTtcbn1cbmV4cG9ydCBjb25zdCBab2RQaXBlID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZFBpcGVcIiwgKGluc3QsIGRlZikgPT4ge1xuICAgIGNvcmUuJFpvZFBpcGUuaW5pdChpbnN0LCBkZWYpO1xuICAgIFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xuICAgIGluc3QuX3pvZC5wcm9jZXNzSlNPTlNjaGVtYSA9IChjdHgsIGpzb24sIHBhcmFtcykgPT4gcHJvY2Vzc29ycy5waXBlUHJvY2Vzc29yKGluc3QsIGN0eCwganNvbiwgcGFyYW1zKTtcbiAgICBpbnN0LmluID0gZGVmLmluO1xuICAgIGluc3Qub3V0ID0gZGVmLm91dDtcbn0pO1xuZXhwb3J0IGZ1bmN0aW9uIHBpcGUoaW5fLCBvdXQpIHtcbiAgICByZXR1cm4gbmV3IFpvZFBpcGUoe1xuICAgICAgICB0eXBlOiBcInBpcGVcIixcbiAgICAgICAgaW46IGluXyxcbiAgICAgICAgb3V0OiBvdXQsXG4gICAgICAgIC8vIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59XG5leHBvcnQgY29uc3QgWm9kQ29kZWMgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kQ29kZWNcIiwgKGluc3QsIGRlZikgPT4ge1xuICAgIFpvZFBpcGUuaW5pdChpbnN0LCBkZWYpO1xuICAgIGNvcmUuJFpvZENvZGVjLmluaXQoaW5zdCwgZGVmKTtcbn0pO1xuZXhwb3J0IGZ1bmN0aW9uIGNvZGVjKGluXywgb3V0LCBwYXJhbXMpIHtcbiAgICByZXR1cm4gbmV3IFpvZENvZGVjKHtcbiAgICAgICAgdHlwZTogXCJwaXBlXCIsXG4gICAgICAgIGluOiBpbl8sXG4gICAgICAgIG91dDogb3V0LFxuICAgICAgICB0cmFuc2Zvcm06IHBhcmFtcy5kZWNvZGUsXG4gICAgICAgIHJldmVyc2VUcmFuc2Zvcm06IHBhcmFtcy5lbmNvZGUsXG4gICAgfSk7XG59XG5leHBvcnQgZnVuY3Rpb24gaW52ZXJ0Q29kZWMoY29kZWMpIHtcbiAgICBjb25zdCBkZWYgPSBjb2RlYy5fem9kLmRlZjtcbiAgICByZXR1cm4gbmV3IFpvZENvZGVjKHtcbiAgICAgICAgdHlwZTogXCJwaXBlXCIsXG4gICAgICAgIGluOiBkZWYub3V0LFxuICAgICAgICBvdXQ6IGRlZi5pbixcbiAgICAgICAgdHJhbnNmb3JtOiBkZWYucmV2ZXJzZVRyYW5zZm9ybSxcbiAgICAgICAgcmV2ZXJzZVRyYW5zZm9ybTogZGVmLnRyYW5zZm9ybSxcbiAgICB9KTtcbn1cbmV4cG9ydCBjb25zdCBab2RQcmVwcm9jZXNzID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZFByZXByb2Nlc3NcIiwgKGluc3QsIGRlZikgPT4ge1xuICAgIFpvZFBpcGUuaW5pdChpbnN0LCBkZWYpO1xuICAgIGNvcmUuJFpvZFByZXByb2Nlc3MuaW5pdChpbnN0LCBkZWYpO1xufSk7XG5leHBvcnQgY29uc3QgWm9kUmVhZG9ubHkgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kUmVhZG9ubHlcIiwgKGluc3QsIGRlZikgPT4ge1xuICAgIGNvcmUuJFpvZFJlYWRvbmx5LmluaXQoaW5zdCwgZGVmKTtcbiAgICBab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcbiAgICBpbnN0Ll96b2QucHJvY2Vzc0pTT05TY2hlbWEgPSAoY3R4LCBqc29uLCBwYXJhbXMpID0+IHByb2Nlc3NvcnMucmVhZG9ubHlQcm9jZXNzb3IoaW5zdCwgY3R4LCBqc29uLCBwYXJhbXMpO1xuICAgIGluc3QudW53cmFwID0gKCkgPT4gaW5zdC5fem9kLmRlZi5pbm5lclR5cGU7XG59KTtcbmV4cG9ydCBmdW5jdGlvbiByZWFkb25seShpbm5lclR5cGUpIHtcbiAgICByZXR1cm4gbmV3IFpvZFJlYWRvbmx5KHtcbiAgICAgICAgdHlwZTogXCJyZWFkb25seVwiLFxuICAgICAgICBpbm5lclR5cGU6IGlubmVyVHlwZSxcbiAgICB9KTtcbn1cbmV4cG9ydCBjb25zdCBab2RUZW1wbGF0ZUxpdGVyYWwgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kVGVtcGxhdGVMaXRlcmFsXCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICBjb3JlLiRab2RUZW1wbGF0ZUxpdGVyYWwuaW5pdChpbnN0LCBkZWYpO1xuICAgIFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xuICAgIGluc3QuX3pvZC5wcm9jZXNzSlNPTlNjaGVtYSA9IChjdHgsIGpzb24sIHBhcmFtcykgPT4gcHJvY2Vzc29ycy50ZW1wbGF0ZUxpdGVyYWxQcm9jZXNzb3IoaW5zdCwgY3R4LCBqc29uLCBwYXJhbXMpO1xufSk7XG5leHBvcnQgZnVuY3Rpb24gdGVtcGxhdGVMaXRlcmFsKHBhcnRzLCBwYXJhbXMpIHtcbiAgICByZXR1cm4gbmV3IFpvZFRlbXBsYXRlTGl0ZXJhbCh7XG4gICAgICAgIHR5cGU6IFwidGVtcGxhdGVfbGl0ZXJhbFwiLFxuICAgICAgICBwYXJ0cyxcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn1cbmV4cG9ydCBjb25zdCBab2RMYXp5ID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZExhenlcIiwgKGluc3QsIGRlZikgPT4ge1xuICAgIGNvcmUuJFpvZExhenkuaW5pdChpbnN0LCBkZWYpO1xuICAgIFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xuICAgIGluc3QuX3pvZC5wcm9jZXNzSlNPTlNjaGVtYSA9IChjdHgsIGpzb24sIHBhcmFtcykgPT4gcHJvY2Vzc29ycy5sYXp5UHJvY2Vzc29yKGluc3QsIGN0eCwganNvbiwgcGFyYW1zKTtcbiAgICBpbnN0LnVud3JhcCA9ICgpID0+IGluc3QuX3pvZC5kZWYuZ2V0dGVyKCk7XG59KTtcbmV4cG9ydCBmdW5jdGlvbiBsYXp5KGdldHRlcikge1xuICAgIHJldHVybiBuZXcgWm9kTGF6eSh7XG4gICAgICAgIHR5cGU6IFwibGF6eVwiLFxuICAgICAgICBnZXR0ZXI6IGdldHRlcixcbiAgICB9KTtcbn1cbmV4cG9ydCBjb25zdCBab2RQcm9taXNlID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZFByb21pc2VcIiwgKGluc3QsIGRlZikgPT4ge1xuICAgIGNvcmUuJFpvZFByb21pc2UuaW5pdChpbnN0LCBkZWYpO1xuICAgIFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xuICAgIGluc3QuX3pvZC5wcm9jZXNzSlNPTlNjaGVtYSA9IChjdHgsIGpzb24sIHBhcmFtcykgPT4gcHJvY2Vzc29ycy5wcm9taXNlUHJvY2Vzc29yKGluc3QsIGN0eCwganNvbiwgcGFyYW1zKTtcbiAgICBpbnN0LnVud3JhcCA9ICgpID0+IGluc3QuX3pvZC5kZWYuaW5uZXJUeXBlO1xufSk7XG5leHBvcnQgZnVuY3Rpb24gcHJvbWlzZShpbm5lclR5cGUpIHtcbiAgICByZXR1cm4gbmV3IFpvZFByb21pc2Uoe1xuICAgICAgICB0eXBlOiBcInByb21pc2VcIixcbiAgICAgICAgaW5uZXJUeXBlOiBpbm5lclR5cGUsXG4gICAgfSk7XG59XG5leHBvcnQgY29uc3QgWm9kRnVuY3Rpb24gPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kRnVuY3Rpb25cIiwgKGluc3QsIGRlZikgPT4ge1xuICAgIGNvcmUuJFpvZEZ1bmN0aW9uLmluaXQoaW5zdCwgZGVmKTtcbiAgICBab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcbiAgICBpbnN0Ll96b2QucHJvY2Vzc0pTT05TY2hlbWEgPSAoY3R4LCBqc29uLCBwYXJhbXMpID0+IHByb2Nlc3NvcnMuZnVuY3Rpb25Qcm9jZXNzb3IoaW5zdCwgY3R4LCBqc29uLCBwYXJhbXMpO1xufSk7XG5leHBvcnQgZnVuY3Rpb24gX2Z1bmN0aW9uKHBhcmFtcykge1xuICAgIHJldHVybiBuZXcgWm9kRnVuY3Rpb24oe1xuICAgICAgICB0eXBlOiBcImZ1bmN0aW9uXCIsXG4gICAgICAgIGlucHV0OiBBcnJheS5pc0FycmF5KHBhcmFtcz8uaW5wdXQpID8gdHVwbGUocGFyYW1zPy5pbnB1dCkgOiAocGFyYW1zPy5pbnB1dCA/PyBhcnJheSh1bmtub3duKCkpKSxcbiAgICAgICAgb3V0cHV0OiBwYXJhbXM/Lm91dHB1dCA/PyB1bmtub3duKCksXG4gICAgfSk7XG59XG5leHBvcnQgeyBfZnVuY3Rpb24gYXMgZnVuY3Rpb24gfTtcbmV4cG9ydCBjb25zdCBab2RDdXN0b20gPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kQ3VzdG9tXCIsIChpbnN0LCBkZWYpID0+IHtcbiAgICBjb3JlLiRab2RDdXN0b20uaW5pdChpbnN0LCBkZWYpO1xuICAgIFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xuICAgIGluc3QuX3pvZC5wcm9jZXNzSlNPTlNjaGVtYSA9IChjdHgsIGpzb24sIHBhcmFtcykgPT4gcHJvY2Vzc29ycy5jdXN0b21Qcm9jZXNzb3IoaW5zdCwgY3R4LCBqc29uLCBwYXJhbXMpO1xufSk7XG4vLyBjdXN0b20gY2hlY2tzXG5leHBvcnQgZnVuY3Rpb24gY2hlY2soZm4pIHtcbiAgICBjb25zdCBjaCA9IG5ldyBjb3JlLiRab2RDaGVjayh7XG4gICAgICAgIGNoZWNrOiBcImN1c3RvbVwiLFxuICAgICAgICAvLyAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xuICAgIGNoLl96b2QuY2hlY2sgPSBmbjtcbiAgICByZXR1cm4gY2g7XG59XG5leHBvcnQgZnVuY3Rpb24gY3VzdG9tKGZuLCBfcGFyYW1zKSB7XG4gICAgcmV0dXJuIGNvcmUuX2N1c3RvbShab2RDdXN0b20sIGZuID8/ICgoKSA9PiB0cnVlKSwgX3BhcmFtcyk7XG59XG5leHBvcnQgZnVuY3Rpb24gcmVmaW5lKGZuLCBfcGFyYW1zID0ge30pIHtcbiAgICByZXR1cm4gY29yZS5fcmVmaW5lKFpvZEN1c3RvbSwgZm4sIF9wYXJhbXMpO1xufVxuLy8gc3VwZXJSZWZpbmVcbmV4cG9ydCBmdW5jdGlvbiBzdXBlclJlZmluZShmbiwgcGFyYW1zKSB7XG4gICAgcmV0dXJuIGNvcmUuX3N1cGVyUmVmaW5lKGZuLCBwYXJhbXMpO1xufVxuLy8gUmUtZXhwb3J0IGRlc2NyaWJlIGFuZCBtZXRhIGZyb20gY29yZVxuZXhwb3J0IGNvbnN0IGRlc2NyaWJlID0gY29yZS5kZXNjcmliZTtcbmV4cG9ydCBjb25zdCBtZXRhID0gY29yZS5tZXRhO1xuZnVuY3Rpb24gX2luc3RhbmNlb2YoY2xzLCBwYXJhbXMgPSB7fSkge1xuICAgIGNvbnN0IGluc3QgPSBuZXcgWm9kQ3VzdG9tKHtcbiAgICAgICAgdHlwZTogXCJjdXN0b21cIixcbiAgICAgICAgY2hlY2s6IFwiY3VzdG9tXCIsXG4gICAgICAgIGZuOiAoZGF0YSkgPT4gZGF0YSBpbnN0YW5jZW9mIGNscyxcbiAgICAgICAgYWJvcnQ6IHRydWUsXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG4gICAgaW5zdC5fem9kLmJhZy5DbGFzcyA9IGNscztcbiAgICAvLyBPdmVycmlkZSBjaGVjayB0byBlbWl0IGludmFsaWRfdHlwZSBpbnN0ZWFkIG9mIGN1c3RvbVxuICAgIGluc3QuX3pvZC5jaGVjayA9IChwYXlsb2FkKSA9PiB7XG4gICAgICAgIGlmICghKHBheWxvYWQudmFsdWUgaW5zdGFuY2VvZiBjbHMpKSB7XG4gICAgICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBjb2RlOiBcImludmFsaWRfdHlwZVwiLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBjbHMubmFtZSxcbiAgICAgICAgICAgICAgICBpbnB1dDogcGF5bG9hZC52YWx1ZSxcbiAgICAgICAgICAgICAgICBpbnN0LFxuICAgICAgICAgICAgICAgIHBhdGg6IFsuLi4oaW5zdC5fem9kLmRlZi5wYXRoID8/IFtdKV0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIGluc3Q7XG59XG5leHBvcnQgeyBfaW5zdGFuY2VvZiBhcyBpbnN0YW5jZW9mIH07XG4vLyBzdHJpbmdib29sXG5leHBvcnQgY29uc3Qgc3RyaW5nYm9vbCA9ICguLi5hcmdzKSA9PiBjb3JlLl9zdHJpbmdib29sKHtcbiAgICBDb2RlYzogWm9kQ29kZWMsXG4gICAgQm9vbGVhbjogWm9kQm9vbGVhbixcbiAgICBTdHJpbmc6IFpvZFN0cmluZyxcbn0sIC4uLmFyZ3MpO1xuZXhwb3J0IGZ1bmN0aW9uIGpzb24ocGFyYW1zKSB7XG4gICAgY29uc3QganNvblNjaGVtYSA9IGxhenkoKCkgPT4ge1xuICAgICAgICByZXR1cm4gdW5pb24oW3N0cmluZyhwYXJhbXMpLCBudW1iZXIoKSwgYm9vbGVhbigpLCBfbnVsbCgpLCBhcnJheShqc29uU2NoZW1hKSwgcmVjb3JkKHN0cmluZygpLCBqc29uU2NoZW1hKV0pO1xuICAgIH0pO1xuICAgIHJldHVybiBqc29uU2NoZW1hO1xufVxuLy8gcHJlcHJvY2Vzc1xuZXhwb3J0IGZ1bmN0aW9uIHByZXByb2Nlc3MoZm4sIHNjaGVtYSkge1xuICAgIHJldHVybiBuZXcgWm9kUHJlcHJvY2Vzcyh7XG4gICAgICAgIHR5cGU6IFwicGlwZVwiLFxuICAgICAgICBpbjogdHJhbnNmb3JtKGZuKSxcbiAgICAgICAgb3V0OiBzY2hlbWEsXG4gICAgfSk7XG59XG4iLCJpbXBvcnQgeyB6IH0gZnJvbSBcInpvZFwiO1xuLy8gTGVnYWN5IGBqb2JTdGF0dXNTY2hlbWFgICsgYGNyZWF0ZUpvYlNjaGVtYWAgKyBgdXBkYXRlSm9iU2NoZW1hYCArXG4vLyBgam9iU3RhdHVzVXBkYXRlU2NoZW1hYCAocGx1cyB0aGVpciBgdmFsaWRhdGUqYCBoZWxwZXJzKSB1c2VkIHRvIGxpdmUgaGVyZVxuLy8gd2l0aCBhICpkaWZmZXJlbnQqIHZhbHVlIHNldCAoYG9mZmVyZWRgIGluc3RlYWQgb2YgYG9mZmVyYCwgbm8gYGV4cGlyZWRgIC9cbi8vIGBkaXNtaXNzZWRgIC8gYHBlbmRpbmdgKS4gVGhleSB3ZXJlIGRlbGV0ZWQgYXMgcGFydCBvZiBGMi4xIGNvbnNvbGlkYXRpb24g4oCUXG4vLyBub3RoaW5nIG91dHNpZGUgdGhlIHNoYXJlZCBwYWNrYWdlIGNvbnN1bWVkIHRoZW0sIGFuZCB0aGUgd2ViIGFwcCBhbHJlYWR5XG4vLyB2YWxpZGF0ZXMgb3Bwb3J0dW5pdHkgaW5wdXRzIHRocm91Z2ggYG9wcG9ydHVuaXR5U3RhdHVzU2NoZW1hYCBiZWxvdy4gVXNlXG4vLyBgb3Bwb3J0dW5pdHlTdGF0dXNTY2hlbWFgLCBgY3JlYXRlT3Bwb3J0dW5pdHlTY2hlbWFgLCBgdXBkYXRlT3Bwb3J0dW5pdHlTY2hlbWFgLFxuLy8gYW5kIGBvcHBvcnR1bml0eVN0YXR1c0NoYW5nZVNjaGVtYWAgaW5zdGVhZC5cbmV4cG9ydCBjb25zdCBPUFBPUlRVTklUWV9UWVBFUyA9IFtcImpvYlwiLCBcImhhY2thdGhvblwiXTtcbmV4cG9ydCBjb25zdCBPUFBPUlRVTklUWV9TT1VSQ0VTID0gW1xuICAgIFwid2F0ZXJsb293b3Jrc1wiLFxuICAgIFwibGlua2VkaW5cIixcbiAgICBcImluZGVlZFwiLFxuICAgIFwiZ3JlZW5ob3VzZVwiLFxuICAgIFwibGV2ZXJcIixcbiAgICBcImRldnBvc3RcIixcbiAgICBcIm1hbnVhbFwiLFxuICAgIFwidXJsXCIsXG5dO1xuZXhwb3J0IGNvbnN0IE9QUE9SVFVOSVRZX1JFTU9URV9UWVBFUyA9IFtcInJlbW90ZVwiLCBcImh5YnJpZFwiLCBcIm9uc2l0ZVwiXTtcbmV4cG9ydCBjb25zdCBPUFBPUlRVTklUWV9KT0JfVFlQRVMgPSBbXG4gICAgXCJjby1vcFwiLFxuICAgIFwiZnVsbC10aW1lXCIsXG4gICAgXCJwYXJ0LXRpbWVcIixcbiAgICBcImNvbnRyYWN0XCIsXG4gICAgXCJpbnRlcm5zaGlwXCIsXG5dO1xuZXhwb3J0IGNvbnN0IE9QUE9SVFVOSVRZX0xFVkVMUyA9IFtcbiAgICBcImp1bmlvclwiLFxuICAgIFwiaW50ZXJtZWRpYXRlXCIsXG4gICAgXCJzZW5pb3JcIixcbiAgICBcImxlYWRcIixcbiAgICBcInByaW5jaXBhbFwiLFxuICAgIFwib3RoZXJcIixcbiAgICBcInN0YWZmXCIsXG5dO1xuZXhwb3J0IGNvbnN0IE9QUE9SVFVOSVRZX1NUQVRVU0VTID0gW1xuICAgIFwicGVuZGluZ1wiLFxuICAgIFwic2F2ZWRcIixcbiAgICBcImFwcGxpZWRcIixcbiAgICBcImludGVydmlld2luZ1wiLFxuICAgIFwib2ZmZXJcIixcbiAgICBcInJlamVjdGVkXCIsXG4gICAgXCJleHBpcmVkXCIsXG4gICAgXCJkaXNtaXNzZWRcIixcbl07XG5leHBvcnQgY29uc3QgS0FOQkFOX0xBTkVfSURTID0gW1xuICAgIFwicGVuZGluZ1wiLFxuICAgIFwic2F2ZWRcIixcbiAgICBcImFwcGxpZWRcIixcbiAgICBcImludGVydmlld2luZ1wiLFxuICAgIFwib2ZmZXJcIixcbiAgICBcImNsb3NlZFwiLFxuXTtcbmV4cG9ydCBjb25zdCBDTE9TRURfU1VCX1NUQVRVU0VTID0gW1xuICAgIFwicmVqZWN0ZWRcIixcbiAgICBcImV4cGlyZWRcIixcbiAgICBcImRpc21pc3NlZFwiLFxuXTtcbmV4cG9ydCBjb25zdCBLQU5CQU5fTEFORV9HUk9VUFMgPSB7XG4gICAgcGVuZGluZzogW1wicGVuZGluZ1wiXSxcbiAgICBzYXZlZDogW1wic2F2ZWRcIl0sXG4gICAgYXBwbGllZDogW1wiYXBwbGllZFwiXSxcbiAgICBpbnRlcnZpZXdpbmc6IFtcImludGVydmlld2luZ1wiXSxcbiAgICBvZmZlcjogW1wib2ZmZXJcIl0sXG4gICAgY2xvc2VkOiBDTE9TRURfU1VCX1NUQVRVU0VTLFxufTtcbmV4cG9ydCBjb25zdCBERUZBVUxUX0tBTkJBTl9WSVNJQkxFX0xBTkVTID0gS0FOQkFOX0xBTkVfSURTO1xuY29uc3QgU1RBVFVTX1RPX0tBTkJBTl9MQU5FID0gT2JqZWN0LmZyb21FbnRyaWVzKEtBTkJBTl9MQU5FX0lEUy5mbGF0TWFwKChsYW5lKSA9PiBLQU5CQU5fTEFORV9HUk9VUFNbbGFuZV0ubWFwKChzdGF0dXMpID0+IFtzdGF0dXMsIGxhbmVdKSkpO1xuZXhwb3J0IGZ1bmN0aW9uIGluZmVyTGFuZUZyb21TdGF0dXMoc3RhdHVzKSB7XG4gICAgcmV0dXJuIFNUQVRVU19UT19LQU5CQU5fTEFORVtzdGF0dXNdO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzQ2xvc2VkU3ViU3RhdHVzKHN0YXR1cykge1xuICAgIHJldHVybiBDTE9TRURfU1VCX1NUQVRVU0VTLmluY2x1ZGVzKHN0YXR1cyk7XG59XG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplS2FuYmFuVmlzaWJsZUxhbmVzKGlucHV0KSB7XG4gICAgY29uc3QgcGFyc2VkSW5wdXQgPSB0eXBlb2YgaW5wdXQgPT09IFwic3RyaW5nXCIgPyBwYXJzZUpzb25TYWZlbHkoaW5wdXQpIDogaW5wdXQ7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHBhcnNlZElucHV0KSkge1xuICAgICAgICByZXR1cm4gWy4uLkRFRkFVTFRfS0FOQkFOX1ZJU0lCTEVfTEFORVNdO1xuICAgIH1cbiAgICBjb25zdCBzZWxlY3RlZCA9IEtBTkJBTl9MQU5FX0lEUy5maWx0ZXIoKGxhbmUpID0+IHBhcnNlZElucHV0LmluY2x1ZGVzKGxhbmUpKTtcbiAgICByZXR1cm4gc2VsZWN0ZWQubGVuZ3RoID4gMCA/IHNlbGVjdGVkIDogWy4uLkRFRkFVTFRfS0FOQkFOX1ZJU0lCTEVfTEFORVNdO1xufVxuZnVuY3Rpb24gcGFyc2VKc29uU2FmZWx5KHZhbHVlKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UodmFsdWUpO1xuICAgIH1cbiAgICBjYXRjaCB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cbmNvbnN0IHJlcXVpcmVkVGV4dCA9IChtYXgsIGZpZWxkKSA9PiB6LnN0cmluZygpLnRyaW0oKS5taW4oMSwgYCR7ZmllbGR9IGlzIHJlcXVpcmVkYCkubWF4KG1heCk7XG5jb25zdCBvcHRpb25hbFRleHQgPSAobWF4KSA9PiB6XG4gICAgLnN0cmluZygpXG4gICAgLnRyaW0oKVxuICAgIC5tYXgobWF4KVxuICAgIC5vcHRpb25hbCgpXG4gICAgLnRyYW5zZm9ybSgodmFsdWUpID0+ICh2YWx1ZSA9PT0gXCJcIiA/IHVuZGVmaW5lZCA6IHZhbHVlKSk7XG5jb25zdCBvcHRpb25hbFN0cmluZ0xpc3QgPSB6XG4gICAgLmFycmF5KHouc3RyaW5nKCkudHJpbSgpLm1pbigxKS5tYXgoMjAwKSlcbiAgICAub3B0aW9uYWwoKTtcbmNvbnN0IG9wdGlvbmFsVXJsID0gelxuICAgIC51bmlvbihbei5zdHJpbmcoKS50cmltKCkudXJsKCksIHoubGl0ZXJhbChcIlwiKV0pXG4gICAgLm9wdGlvbmFsKClcbiAgICAudHJhbnNmb3JtKCh2YWx1ZSkgPT4gKHZhbHVlID09PSBcIlwiID8gdW5kZWZpbmVkIDogdmFsdWUpKTtcbmV4cG9ydCBjb25zdCBvcHBvcnR1bml0eVR5cGVTY2hlbWEgPSB6LmVudW0oT1BQT1JUVU5JVFlfVFlQRVMpO1xuZXhwb3J0IGNvbnN0IG9wcG9ydHVuaXR5U291cmNlU2NoZW1hID0gei5lbnVtKE9QUE9SVFVOSVRZX1NPVVJDRVMpO1xuZXhwb3J0IGNvbnN0IG9wcG9ydHVuaXR5UmVtb3RlVHlwZVNjaGVtYSA9IHouZW51bShPUFBPUlRVTklUWV9SRU1PVEVfVFlQRVMpO1xuZXhwb3J0IGNvbnN0IG9wcG9ydHVuaXR5Sm9iVHlwZVNjaGVtYSA9IHouZW51bShPUFBPUlRVTklUWV9KT0JfVFlQRVMpO1xuZXhwb3J0IGNvbnN0IG9wcG9ydHVuaXR5TGV2ZWxTY2hlbWEgPSB6LmVudW0oT1BQT1JUVU5JVFlfTEVWRUxTKTtcbmV4cG9ydCBjb25zdCBvcHBvcnR1bml0eVN0YXR1c1NjaGVtYSA9IHouZW51bShPUFBPUlRVTklUWV9TVEFUVVNFUyk7XG5leHBvcnQgY29uc3Qga2FuYmFuTGFuZUlkU2NoZW1hID0gei5lbnVtKEtBTkJBTl9MQU5FX0lEUyk7XG5leHBvcnQgY29uc3Qga2FuYmFuVmlzaWJsZUxhbmVzU2NoZW1hID0gelxuICAgIC5hcnJheShrYW5iYW5MYW5lSWRTY2hlbWEpXG4gICAgLm1pbigxLCBcIkF0IGxlYXN0IG9uZSBrYW5iYW4gbGFuZSBtdXN0IHJlbWFpbiB2aXNpYmxlXCIpO1xuY29uc3Qgb3Bwb3J0dW5pdHlUZWFtU2l6ZVNjaGVtYSA9IHpcbiAgICAub2JqZWN0KHtcbiAgICBtaW46IHoubnVtYmVyKCkuaW50KCkucG9zaXRpdmUoKSxcbiAgICBtYXg6IHoubnVtYmVyKCkuaW50KCkucG9zaXRpdmUoKSxcbn0pXG4gICAgLnJlZmluZSgodmFsdWUpID0+IHZhbHVlLm1pbiA8PSB2YWx1ZS5tYXgsIHtcbiAgICBtZXNzYWdlOiBcIk1pbmltdW0gdGVhbSBzaXplIG11c3QgYmUgbGVzcyB0aGFuIG9yIGVxdWFsIHRvIG1heGltdW0gdGVhbSBzaXplXCIsXG4gICAgcGF0aDogW1wibWluXCJdLFxufSk7XG5jb25zdCBzYWxhcnlSYW5nZVJlZmluZW1lbnQgPSB7XG4gICAgbWVzc2FnZTogXCJNaW5pbXVtIHNhbGFyeSBtdXN0IGJlIGxlc3MgdGhhbiBvciBlcXVhbCB0byBtYXhpbXVtIHNhbGFyeVwiLFxuICAgIHBhdGg6IFtcInNhbGFyeU1pblwiXSxcbn07XG5jb25zdCBoYXNWYWxpZFNhbGFyeVJhbmdlID0gKHZhbHVlKSA9PiB2YWx1ZS5zYWxhcnlNaW4gPT09IHVuZGVmaW5lZCB8fFxuICAgIHZhbHVlLnNhbGFyeU1heCA9PT0gdW5kZWZpbmVkIHx8XG4gICAgdmFsdWUuc2FsYXJ5TWluIDw9IHZhbHVlLnNhbGFyeU1heDtcbmNvbnN0IG9wcG9ydHVuaXR5SW5wdXRGaWVsZHMgPSB7XG4gICAgdHlwZTogb3Bwb3J0dW5pdHlUeXBlU2NoZW1hLFxuICAgIHRpdGxlOiByZXF1aXJlZFRleHQoMjAwLCBcIlRpdGxlXCIpLFxuICAgIGNvbXBhbnk6IHJlcXVpcmVkVGV4dCgyMDAsIFwiQ29tcGFueVwiKSxcbiAgICBkaXZpc2lvbjogb3B0aW9uYWxUZXh0KDIwMCksXG4gICAgc291cmNlOiBvcHBvcnR1bml0eVNvdXJjZVNjaGVtYSxcbiAgICBzb3VyY2VVcmw6IG9wdGlvbmFsVXJsLFxuICAgIHNvdXJjZUlkOiBvcHRpb25hbFRleHQoMjAwKSxcbiAgICBjaXR5OiBvcHRpb25hbFRleHQoMTIwKSxcbiAgICBwcm92aW5jZTogb3B0aW9uYWxUZXh0KDEyMCksXG4gICAgY291bnRyeTogb3B0aW9uYWxUZXh0KDEyMCksXG4gICAgcG9zdGFsQ29kZTogb3B0aW9uYWxUZXh0KDQwKSxcbiAgICByZWdpb246IG9wdGlvbmFsVGV4dCgxMjApLFxuICAgIHJlbW90ZVR5cGU6IG9wcG9ydHVuaXR5UmVtb3RlVHlwZVNjaGVtYS5vcHRpb25hbCgpLFxuICAgIGFkZGl0aW9uYWxMb2NhdGlvbkluZm86IG9wdGlvbmFsVGV4dCg1MDApLFxuICAgIGpvYlR5cGU6IG9wcG9ydHVuaXR5Sm9iVHlwZVNjaGVtYS5vcHRpb25hbCgpLFxuICAgIGxldmVsOiBvcHBvcnR1bml0eUxldmVsU2NoZW1hLm9wdGlvbmFsKCksXG4gICAgb3BlbmluZ3M6IHoubnVtYmVyKCkuaW50KCkucG9zaXRpdmUoKS5vcHRpb25hbCgpLFxuICAgIHdvcmtUZXJtOiBvcHRpb25hbFRleHQoMTIwKSxcbiAgICBhcHBsaWNhdGlvbk1ldGhvZDogb3B0aW9uYWxUZXh0KDEyMCksXG4gICAgcmVxdWlyZWREb2N1bWVudHM6IG9wdGlvbmFsU3RyaW5nTGlzdCxcbiAgICB0YXJnZXRlZERlZ3JlZXM6IG9wdGlvbmFsU3RyaW5nTGlzdCxcbiAgICB0YXJnZXRlZENsdXN0ZXJzOiBvcHRpb25hbFN0cmluZ0xpc3QsXG4gICAgcHJpemVzOiBvcHRpb25hbFN0cmluZ0xpc3QsXG4gICAgdGVhbVNpemU6IG9wcG9ydHVuaXR5VGVhbVNpemVTY2hlbWEub3B0aW9uYWwoKSxcbiAgICB0cmFja3M6IG9wdGlvbmFsU3RyaW5nTGlzdCxcbiAgICBzdWJtaXNzaW9uVXJsOiBvcHRpb25hbFVybCxcbiAgICBzdW1tYXJ5OiByZXF1aXJlZFRleHQoNTAwMDAsIFwiU3VtbWFyeVwiKSxcbiAgICByZXNwb25zaWJpbGl0aWVzOiBvcHRpb25hbFN0cmluZ0xpc3QsXG4gICAgcmVxdWlyZWRTa2lsbHM6IG9wdGlvbmFsU3RyaW5nTGlzdCxcbiAgICBwcmVmZXJyZWRTa2lsbHM6IG9wdGlvbmFsU3RyaW5nTGlzdCxcbiAgICB0ZWNoU3RhY2s6IG9wdGlvbmFsU3RyaW5nTGlzdCxcbiAgICBzYWxhcnlNaW46IHoubnVtYmVyKCkubm9ubmVnYXRpdmUoKS5vcHRpb25hbCgpLFxuICAgIHNhbGFyeU1heDogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLm9wdGlvbmFsKCksXG4gICAgc2FsYXJ5Q3VycmVuY3k6IG9wdGlvbmFsVGV4dCgxMiksXG4gICAgYmVuZWZpdHM6IG9wdGlvbmFsU3RyaW5nTGlzdCxcbiAgICBkZWFkbGluZTogb3B0aW9uYWxUZXh0KDgwKSxcbiAgICBhZGRpdGlvbmFsSW5mbzogb3B0aW9uYWxUZXh0KDUwMDApLFxuICAgIHNjcmFwZWRBdDogb3B0aW9uYWxUZXh0KDgwKSxcbiAgICBzYXZlZEF0OiBvcHRpb25hbFRleHQoODApLFxuICAgIGFwcGxpZWRBdDogb3B0aW9uYWxUZXh0KDgwKSxcbiAgICBub3Rlczogb3B0aW9uYWxUZXh0KDUwMDApLFxuICAgIGxpbmtlZFJlc3VtZUlkOiBvcHRpb25hbFRleHQoMjAwKSxcbiAgICBsaW5rZWRDb3ZlckxldHRlcklkOiBvcHRpb25hbFRleHQoMjAwKSxcbn07XG5jb25zdCB1cGRhdGVPcHBvcnR1bml0eUlucHV0RmllbGRzID0gT2JqZWN0LmZyb21FbnRyaWVzKE9iamVjdC5lbnRyaWVzKG9wcG9ydHVuaXR5SW5wdXRGaWVsZHMpLm1hcCgoW2tleSwgc2NoZW1hXSkgPT4gW1xuICAgIGtleSxcbiAgICBzY2hlbWEub3B0aW9uYWwoKSxcbl0pKTtcbmV4cG9ydCBjb25zdCBjcmVhdGVPcHBvcnR1bml0eVNjaGVtYSA9IHpcbiAgICAub2JqZWN0KHtcbiAgICAuLi5vcHBvcnR1bml0eUlucHV0RmllbGRzLFxuICAgIHN0YXR1czogb3Bwb3J0dW5pdHlTdGF0dXNTY2hlbWEuZGVmYXVsdChcInBlbmRpbmdcIiksXG4gICAgdGFnczogei5hcnJheSh6LnN0cmluZygpLnRyaW0oKS5taW4oMSkubWF4KDgwKSkuZGVmYXVsdChbXSksXG59KVxuICAgIC5yZWZpbmUoaGFzVmFsaWRTYWxhcnlSYW5nZSwgc2FsYXJ5UmFuZ2VSZWZpbmVtZW50KTtcbmV4cG9ydCBjb25zdCB1cGRhdGVPcHBvcnR1bml0eVNjaGVtYSA9IHpcbiAgICAub2JqZWN0KHtcbiAgICAuLi51cGRhdGVPcHBvcnR1bml0eUlucHV0RmllbGRzLFxuICAgIHN0YXR1czogb3Bwb3J0dW5pdHlTdGF0dXNTY2hlbWEub3B0aW9uYWwoKSxcbiAgICB0YWdzOiB6LmFycmF5KHouc3RyaW5nKCkudHJpbSgpLm1pbigxKS5tYXgoODApKS5vcHRpb25hbCgpLFxufSlcbiAgICAucmVmaW5lKGhhc1ZhbGlkU2FsYXJ5UmFuZ2UsIHNhbGFyeVJhbmdlUmVmaW5lbWVudCk7XG5leHBvcnQgY29uc3Qgb3Bwb3J0dW5pdHlTY2hlbWEgPSB6XG4gICAgLm9iamVjdCh7XG4gICAgLi4ub3Bwb3J0dW5pdHlJbnB1dEZpZWxkcyxcbiAgICBpZDogcmVxdWlyZWRUZXh0KDIwMCwgXCJJRFwiKSxcbiAgICBzdGF0dXM6IG9wcG9ydHVuaXR5U3RhdHVzU2NoZW1hLFxuICAgIHRhZ3M6IHouYXJyYXkoei5zdHJpbmcoKS50cmltKCkubWluKDEpLm1heCg4MCkpLFxuICAgIGNyZWF0ZWRBdDogcmVxdWlyZWRUZXh0KDgwLCBcIkNyZWF0ZWQgYXRcIiksXG4gICAgdXBkYXRlZEF0OiByZXF1aXJlZFRleHQoODAsIFwiVXBkYXRlZCBhdFwiKSxcbn0pXG4gICAgLnJlZmluZShoYXNWYWxpZFNhbGFyeVJhbmdlLCBzYWxhcnlSYW5nZVJlZmluZW1lbnQpO1xuZXhwb3J0IGNvbnN0IG9wcG9ydHVuaXR5U3RhdHVzQ2hhbmdlU2NoZW1hID0gei5vYmplY3Qoe1xuICAgIHN0YXR1czogb3Bwb3J0dW5pdHlTdGF0dXNTY2hlbWEsXG59KTtcbmV4cG9ydCBjb25zdCBvcHBvcnR1bml0eUZpbHRlcnNTY2hlbWEgPSB6Lm9iamVjdCh7XG4gICAgdHlwZTogb3Bwb3J0dW5pdHlUeXBlU2NoZW1hLm9wdGlvbmFsKCksXG4gICAgc3RhdHVzOiBvcHBvcnR1bml0eVN0YXR1c1NjaGVtYS5vcHRpb25hbCgpLFxuICAgIHNvdXJjZTogb3Bwb3J0dW5pdHlTb3VyY2VTY2hlbWEub3B0aW9uYWwoKSxcbiAgICB0YWdzOiB6LmFycmF5KHouc3RyaW5nKCkudHJpbSgpLm1pbigxKSkub3B0aW9uYWwoKSxcbiAgICBzZWFyY2g6IHouc3RyaW5nKCkudHJpbSgpLm9wdGlvbmFsKCksXG59KTtcbi8vIExMTSBwcm92aWRlciBjb25maWd1cmF0aW9uLiBUaGUgcnVudGltZSB2YWxpZGF0aW9uIHNvdXJjZSBsaXZlcyBoZXJlIHNvIHRoZVxuLy8gYExMTUNvbmZpZ2AgdHlwZSBpbiBgLi90eXBlc2AgY2FuIGJlIGRlcml2ZWQgZnJvbSB0aGlzIHNjaGVtYSB2aWEgYHouaW5mZXJgXG4vLyAoa2VwdCBpbiBzeW5jIGF1dG9tYXRpY2FsbHkg4oCUIHNlZSBGNi4yIGluIGBkb2NzL2xlZ2FjeS1kdXBsaWNhdGlvbi1hdWRpdC5tZGApLlxuLy8gYGFwcHMvd2ViL3NyYy9saWIvY29uc3RhbnRzL2xsbS50c2AgcmUtZXhwb3J0cyB0aGlzIHNjaGVtYSBzbyBleGlzdGluZ1xuLy8gY2FsbGVycyB0aGF0IGltcG9ydCBmcm9tIGBAL2xpYi9jb25zdGFudHNgIGtlZXAgd29ya2luZy5cbmV4cG9ydCBjb25zdCBMTE1fUFJPVklERVJTID0gW1xuICAgIFwib3BlbmFpXCIsXG4gICAgXCJhbnRocm9waWNcIixcbiAgICBcIm9sbGFtYVwiLFxuICAgIFwib3BlbnJvdXRlclwiLFxuXTtcbmV4cG9ydCBjb25zdCBsbG1Qcm92aWRlclNjaGVtYSA9IHouZW51bShMTE1fUFJPVklERVJTKTtcbmV4cG9ydCBjb25zdCBsbG1Db25maWdTY2hlbWEgPSB6Lm9iamVjdCh7XG4gICAgcHJvdmlkZXI6IGxsbVByb3ZpZGVyU2NoZW1hLFxuICAgIGFwaUtleTogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxuICAgIGJhc2VVcmw6IHouc3RyaW5nKCkudXJsKCkub3B0aW9uYWwoKS5vcih6LmxpdGVyYWwoXCJcIikpLFxuICAgIG1vZGVsOiB6LnN0cmluZygpLm1pbigxLCBcIk1vZGVsIGlzIHJlcXVpcmVkXCIpLFxufSk7XG4iLCIvLyBFeHRlbnNpb24gc3RvcmFnZSB1dGlsaXRpZXNcbmltcG9ydCB7IERFRkFVTFRfU0VUVElOR1MsIERFRkFVTFRfQVBJX0JBU0VfVVJMLCBMRUdBQ1lfTE9DQUxfQVBJX0JBU0VfVVJMLCBTSE9VTERfUFJPTU9URV9MRUdBQ1lfTE9DQUxfQVBJX0JBU0VfVVJMLCB9IGZyb20gXCJAL3NoYXJlZC90eXBlc1wiO1xuY29uc3QgU1RPUkFHRV9LRVkgPSBcInNsb3RoaW5nX2V4dGVuc2lvblwiO1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFN0b3JhZ2UoKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChTVE9SQUdFX0tFWSwgKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc3RvcmVkID0gcmVzdWx0W1NUT1JBR0VfS0VZXTtcbiAgICAgICAgICAgIGNvbnN0IGFwaUJhc2VVcmwgPSBTSE9VTERfUFJPTU9URV9MRUdBQ1lfTE9DQUxfQVBJX0JBU0VfVVJMICYmXG4gICAgICAgICAgICAgICAgc3RvcmVkPy5hcGlCYXNlVXJsID09PSBMRUdBQ1lfTE9DQUxfQVBJX0JBU0VfVVJMICYmXG4gICAgICAgICAgICAgICAgIXN0b3JlZC5hdXRoVG9rZW5cbiAgICAgICAgICAgICAgICA/IERFRkFVTFRfQVBJX0JBU0VfVVJMXG4gICAgICAgICAgICAgICAgOiBzdG9yZWQ/LmFwaUJhc2VVcmwgfHwgREVGQVVMVF9BUElfQkFTRV9VUkw7XG4gICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAuLi5zdG9yZWQsXG4gICAgICAgICAgICAgICAgYXBpQmFzZVVybCxcbiAgICAgICAgICAgICAgICBzZXR0aW5nczogeyAuLi5ERUZBVUxUX1NFVFRJTkdTLCAuLi5zdG9yZWQ/LnNldHRpbmdzIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0U3RvcmFnZSh1cGRhdGVzKSB7XG4gICAgY29uc3QgY3VycmVudCA9IGF3YWl0IGdldFN0b3JhZ2UoKTtcbiAgICBjb25zdCB1cGRhdGVkID0geyAuLi5jdXJyZW50LCAuLi51cGRhdGVzIH07XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7IFtTVE9SQUdFX0tFWV06IHVwZGF0ZWQgfSwgcmVzb2x2ZSk7XG4gICAgfSk7XG59XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2xlYXJTdG9yYWdlKCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5yZW1vdmUoU1RPUkFHRV9LRVksIHJlc29sdmUpO1xuICAgIH0pO1xufVxuLy8gQXV0aCB0b2tlbiBoZWxwZXJzXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0QXV0aFRva2VuKHRva2VuLCBleHBpcmVzQXQsIGFwaUJhc2VVcmwpIHtcbiAgICBhd2FpdCBzZXRTdG9yYWdlKHtcbiAgICAgICAgYXV0aFRva2VuOiB0b2tlbixcbiAgICAgICAgdG9rZW5FeHBpcnk6IGV4cGlyZXNBdCxcbiAgICAgICAgLi4uKGFwaUJhc2VVcmwgPyB7IGFwaUJhc2VVcmwgfSA6IHt9KSxcbiAgICAgICAgbGFzdFNlZW5BdXRoQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICB9KTtcbiAgICBhd2FpdCBzZXRTZXNzaW9uQXV0aENhY2hlKHRydWUpO1xufVxuLyoqXG4gKiBSZWNvcmRzIHRoYXQgd2UganVzdCBvYnNlcnZlZCBhIHdvcmtpbmcgYXV0aGVudGljYXRlZCBzdGF0ZS4gQ2FsbGVkIGJ5IHRoZVxuICogQVBJIGNsaWVudCBhZnRlciBhIHN1Y2Nlc3NmdWwgYGlzQXV0aGVudGljYXRlZCgpYCBjaGVjayBzbyB0aGUgcG9wdXAgY2FuXG4gKiBkaXN0aW5ndWlzaCBhIHJlYWwgbG9nb3V0IGZyb20gYSBzZXJ2aWNlLXdvcmtlciBzdGF0ZS1sb3NzIGV2ZW50LlxuICpcbiAqIERpc3RpbmN0IGZyb20gYHNldEF1dGhUb2tlbmAgYmVjYXVzZSB3ZSBkb24ndCBhbHdheXMgaGF2ZSBhIGZyZXNoIHRva2VuIHRvXG4gKiB3cml0ZSDigJQgc29tZXRpbWVzIHdlIGp1c3QgdmVyaWZpZWQgdGhlIGV4aXN0aW5nIG9uZS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG1hcmtBdXRoU2VlbigpIHtcbiAgICBhd2FpdCBzZXRTdG9yYWdlKHsgbGFzdFNlZW5BdXRoQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSB9KTtcbn1cbi8qKlxuICogXCJTZXNzaW9uIGxvc3RcIiB2aWV3IChwb3B1cCwgIzI3KSBzaG93cyB3aGVuIHdlIGhhdmUgbm8gYGF1dGhUb2tlbmAgYnV0XG4gKiBgbGFzdFNlZW5BdXRoQXRgIGlzIHdpdGhpbiB0aGlzIHdpbmRvdy4gQmV5b25kIHRoZSB3aW5kb3cgd2UgdHJlYXQgdGhlXG4gKiBleHRlbnNpb24gYXMgYSBmcmVzaCBpbnN0YWxsIC8gdHJ1ZSBsb2dvdXQgYW5kIHNob3cgdGhlIG5vcm1hbCBoZXJvLlxuICovXG5leHBvcnQgY29uc3QgU0VTU0lPTl9MT1NUX1dJTkRPV19NUyA9IDI0ICogNjAgKiA2MCAqIDEwMDA7IC8vIDI0aFxuLyoqXG4gKiBSZXR1cm5zIHRydWUgd2hlbiB0aGUgcG9wdXAgc2hvdWxkIHJlbmRlciB0aGUgXCJTZXNzaW9uIGxvc3Qg4oCUIHJlY29ubmVjdFwiXG4gKiBicmFuY2ggaW5zdGVhZCBvZiB0aGUgdW5hdXRoZW50aWNhdGVkIGhlcm8uIFNlZSAjMjcuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1Nlc3Npb25Mb3N0KHN0b3JhZ2UsIG5vdyA9IERhdGUubm93KCkpIHtcbiAgICBpZiAoc3RvcmFnZS5hdXRoVG9rZW4pXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICBpZiAoIXN0b3JhZ2UubGFzdFNlZW5BdXRoQXQpXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICBjb25zdCBsYXN0U2VlbiA9IG5ldyBEYXRlKHN0b3JhZ2UubGFzdFNlZW5BdXRoQXQpLmdldFRpbWUoKTtcbiAgICBpZiAoIU51bWJlci5pc0Zpbml0ZShsYXN0U2VlbikpXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gbm93IC0gbGFzdFNlZW4gPD0gU0VTU0lPTl9MT1NUX1dJTkRPV19NUztcbn1cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbGVhckF1dGhUb2tlbigpIHtcbiAgICAvLyBOT1RFOiB3ZSBpbnRlbnRpb25hbGx5IGRvIE5PVCBjbGVhciBgbGFzdFNlZW5BdXRoQXRgIGhlcmUuIEEgdHJ1ZSBsb2dvdXRcbiAgICAvLyBwYXRoIChoYW5kbGVMb2dvdXQpIGNhbGxzIGBmb3JnZXRBdXRoSGlzdG9yeWAgYWZ0ZXJ3YXJkczsgdGhpcyBoZWxwZXIgaXNcbiAgICAvLyBhbHNvIHVzZWQgd2hlbiBhIHRva2VuIHF1aWV0bHkgZXhwaXJlcyBvciBhIDQwMSB0cmlwcyB0aGUgYXBpLWNsaWVudCxcbiAgICAvLyBhbmQgaW4gdGhvc2UgY2FzZXMgdGhlIHNlc3Npb24tbG9zdCBVSSBpcyBleGFjdGx5IHdoYXQgd2Ugd2FudCB0byBzaG93LlxuICAgIGF3YWl0IHNldFN0b3JhZ2Uoe1xuICAgICAgICBhdXRoVG9rZW46IHVuZGVmaW5lZCxcbiAgICAgICAgdG9rZW5FeHBpcnk6IHVuZGVmaW5lZCxcbiAgICAgICAgY2FjaGVkUHJvZmlsZTogdW5kZWZpbmVkLFxuICAgICAgICBwcm9maWxlQ2FjaGVkQXQ6IHVuZGVmaW5lZCxcbiAgICB9KTtcbn1cbi8qKlxuICogV2lwZXMgdGhlIFwid2UndmUgc2VlbiB5b3UgYmVmb3JlXCIgYnJlYWRjcnVtYiBzbyB0aGUgcG9wdXAgc2hvd3MgdGhlXG4gKiB1bmF1dGhlbnRpY2F0ZWQgaGVybyBvbiBuZXh0IG9wZW4uIENhbGwgdGhpcyBmcm9tIGV4cGxpY2l0LWxvZ291dCBmbG93cy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZvcmdldEF1dGhIaXN0b3J5KCkge1xuICAgIGF3YWl0IHNldFN0b3JhZ2UoeyBsYXN0U2VlbkF1dGhBdDogdW5kZWZpbmVkIH0pO1xufVxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEF1dGhUb2tlbigpIHtcbiAgICBjb25zdCBzdG9yYWdlID0gYXdhaXQgZ2V0U3RvcmFnZSgpO1xuICAgIGlmICghc3RvcmFnZS5hdXRoVG9rZW4pXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIC8vIENoZWNrIGV4cGlyeVxuICAgIGlmIChzdG9yYWdlLnRva2VuRXhwaXJ5KSB7XG4gICAgICAgIGNvbnN0IGV4cGlyeSA9IG5ldyBEYXRlKHN0b3JhZ2UudG9rZW5FeHBpcnkpO1xuICAgICAgICBpZiAoZXhwaXJ5IDwgbmV3IERhdGUoKSkge1xuICAgICAgICAgICAgYXdhaXQgY2xlYXJBdXRoVG9rZW4oKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzdG9yYWdlLmF1dGhUb2tlbjtcbn1cbi8vIFByb2ZpbGUgY2FjaGUgaGVscGVyc1xuY29uc3QgUFJPRklMRV9DQUNIRV9UVEwgPSA1ICogNjAgKiAxMDAwOyAvLyA1IG1pbnV0ZXNcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRDYWNoZWRQcm9maWxlKCkge1xuICAgIGNvbnN0IHN0b3JhZ2UgPSBhd2FpdCBnZXRTdG9yYWdlKCk7XG4gICAgaWYgKCFzdG9yYWdlLmNhY2hlZFByb2ZpbGUgfHwgIXN0b3JhZ2UucHJvZmlsZUNhY2hlZEF0KSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBjYWNoZWRBdCA9IG5ldyBEYXRlKHN0b3JhZ2UucHJvZmlsZUNhY2hlZEF0KTtcbiAgICBpZiAoRGF0ZS5ub3coKSAtIGNhY2hlZEF0LmdldFRpbWUoKSA+IFBST0ZJTEVfQ0FDSEVfVFRMKSB7XG4gICAgICAgIHJldHVybiBudWxsOyAvLyBDYWNoZSBleHBpcmVkXG4gICAgfVxuICAgIHJldHVybiBzdG9yYWdlLmNhY2hlZFByb2ZpbGU7XG59XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0Q2FjaGVkUHJvZmlsZShwcm9maWxlKSB7XG4gICAgYXdhaXQgc2V0U3RvcmFnZSh7XG4gICAgICAgIGNhY2hlZFByb2ZpbGU6IHByb2ZpbGUsXG4gICAgICAgIHByb2ZpbGVDYWNoZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgIH0pO1xufVxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsZWFyQ2FjaGVkUHJvZmlsZSgpIHtcbiAgICBhd2FpdCBzZXRTdG9yYWdlKHtcbiAgICAgICAgY2FjaGVkUHJvZmlsZTogdW5kZWZpbmVkLFxuICAgICAgICBwcm9maWxlQ2FjaGVkQXQ6IHVuZGVmaW5lZCxcbiAgICB9KTtcbn1cbi8vIFNldHRpbmdzIGhlbHBlcnNcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRTZXR0aW5ncygpIHtcbiAgICBjb25zdCBzdG9yYWdlID0gYXdhaXQgZ2V0U3RvcmFnZSgpO1xuICAgIHJldHVybiBzdG9yYWdlLnNldHRpbmdzO1xufVxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHVwZGF0ZVNldHRpbmdzKHVwZGF0ZXMpIHtcbiAgICBjb25zdCBzdG9yYWdlID0gYXdhaXQgZ2V0U3RvcmFnZSgpO1xuICAgIGNvbnN0IHVwZGF0ZWQgPSB7IC4uLnN0b3JhZ2Uuc2V0dGluZ3MsIC4uLnVwZGF0ZXMgfTtcbiAgICBhd2FpdCBzZXRTdG9yYWdlKHsgc2V0dGluZ3M6IHVwZGF0ZWQgfSk7XG4gICAgcmV0dXJuIHVwZGF0ZWQ7XG59XG4vLyBBUEkgVVJMIGhlbHBlclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldEFwaUJhc2VVcmwodXJsKSB7XG4gICAgYXdhaXQgc2V0U3RvcmFnZSh7IGFwaUJhc2VVcmw6IHVybCB9KTtcbn1cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRBcGlCYXNlVXJsKCkge1xuICAgIGNvbnN0IHN0b3JhZ2UgPSBhd2FpdCBnZXRTdG9yYWdlKCk7XG4gICAgcmV0dXJuIHN0b3JhZ2UuYXBpQmFzZVVybDtcbn1cbi8vIC0tLS0gU2Vzc2lvbi1zY29wZWQgYXV0aCBjYWNoZSAoIzMwKSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vXG4vLyBgY2hyb21lLnN0b3JhZ2Uuc2Vzc2lvbmAgaXMgaW4tbWVtb3J5IG9ubHkg4oCUIGl0IHN1cnZpdmVzIHN1c3BlbmRpbmcgdGhlXG4vLyBzZXJ2aWNlIHdvcmtlciBidXQgaXMgd2lwZWQgb24gYnJvd3NlciByZXN0YXJ0LCB3aGljaCBpcyBleGFjdGx5IHdoYXQgd2Vcbi8vIHdhbnQgZm9yIGEgc2hvcnQtbGl2ZWQgYXV0aCB2ZXJkaWN0IGNhY2hlLiBVc2luZyBzZXNzaW9uIChub3QgbG9jYWwpXG4vLyBhbHNvIG1lYW5zIHdlIG5ldmVyIHBlcnNpc3QgdGhlIHZlcmRpY3QgdG8gZGlzay5cbi8vXG4vLyBUaGUgY2FjaGUgc3RvcmVzIGB7IGF1dGhlbnRpY2F0ZWQ6IGJvb2xlYW4sIGF0OiBJU08gc3RyaW5nIH1gIHNvIHRoZVxuLy8gcG9wdXAgY2FuIHJldHVybiBhIHJlc3VsdCBpbiA8NTBtcyBvbiB0aGUgc2Vjb25kIG9wZW4gd2l0aGluIGEgbWludXRlLFxuLy8gd2hpbGUgdGhlIGJhY2tncm91bmQgc2NyaXB0IHJldmFsaWRhdGVzIGluIHRoZSBiYWNrZ3JvdW5kLlxuZXhwb3J0IGNvbnN0IEFVVEhfQ0FDSEVfVFRMX01TID0gNjAgKiAxMDAwO1xuY29uc3QgQVVUSF9DQUNIRV9LRVkgPSBcInNsb3RoaW5nX2F1dGhfY2FjaGVcIjtcbi8qKlxuICogUmVhZHMgdGhlIHNlc3Npb24tc2NvcGVkIGF1dGggdmVyZGljdCBjYWNoZS4gUmV0dXJucyBudWxsIHdoZW46XG4gKiAtIHRoZSBlbnRyeSBoYXMgbmV2ZXIgYmVlbiB3cml0dGVuLFxuICogLSB0aGUgZW50cnkgaXMgb2xkZXIgdGhhbiBBVVRIX0NBQ0hFX1RUTF9NUyxcbiAqIC0gdGhlIGVudHJ5J3MgdGltZXN0YW1wIGlzIHVucGFyc2VhYmxlLCBvclxuICogLSBjaHJvbWUuc3RvcmFnZS5zZXNzaW9uIGlzIHVuYXZhaWxhYmxlIChlLmcuIG9sZGVyIGJyb3dzZXJzKS5cbiAqXG4gKiBPcHRpb25hbCBgbm93YCBwYXJhbWV0ZXIgZXhpc3RzIGZvciB0ZXN0cy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFNlc3Npb25BdXRoQ2FjaGUobm93ID0gRGF0ZS5ub3coKSkge1xuICAgIGNvbnN0IHNlc3Npb25TdG9yZSA9IGNocm9tZS5zdG9yYWdlPy5zZXNzaW9uO1xuICAgIGlmICghc2Vzc2lvblN0b3JlKVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgc2Vzc2lvblN0b3JlLmdldChBVVRIX0NBQ0hFX0tFWSwgKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZW50cnkgPSByZXN1bHQ/LltBVVRIX0NBQ0hFX0tFWV07XG4gICAgICAgICAgICBpZiAoIWVudHJ5IHx8IHR5cGVvZiBlbnRyeS5hdCAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgIHJlc29sdmUobnVsbCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgYXQgPSBuZXcgRGF0ZShlbnRyeS5hdCkuZ2V0VGltZSgpO1xuICAgICAgICAgICAgaWYgKCFOdW1iZXIuaXNGaW5pdGUoYXQpKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShudWxsKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobm93IC0gYXQgPiBBVVRIX0NBQ0hFX1RUTF9NUykge1xuICAgICAgICAgICAgICAgIHJlc29sdmUobnVsbCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzb2x2ZSh7IGF1dGhlbnRpY2F0ZWQ6ICEhZW50cnkuYXV0aGVudGljYXRlZCwgYXQ6IGVudHJ5LmF0IH0pO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn1cbi8qKlxuICogV3JpdGVzIGEgZnJlc2ggdmVyZGljdCB0byB0aGUgc2Vzc2lvbi1zY29wZWQgY2FjaGUuIE5vLW9wcyB3aGVuXG4gKiBjaHJvbWUuc3RvcmFnZS5zZXNzaW9uIGlzIHVuYXZhaWxhYmxlIHNvIGNhbGxlcnMgZG9uJ3QgbmVlZCB0byBndWFyZC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldFNlc3Npb25BdXRoQ2FjaGUoYXV0aGVudGljYXRlZCkge1xuICAgIGNvbnN0IHNlc3Npb25TdG9yZSA9IGNocm9tZS5zdG9yYWdlPy5zZXNzaW9uO1xuICAgIGlmICghc2Vzc2lvblN0b3JlKVxuICAgICAgICByZXR1cm47XG4gICAgY29uc3QgZW50cnkgPSB7XG4gICAgICAgIGF1dGhlbnRpY2F0ZWQsXG4gICAgICAgIGF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgfTtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgc2Vzc2lvblN0b3JlLnNldCh7IFtBVVRIX0NBQ0hFX0tFWV06IGVudHJ5IH0sICgpID0+IHJlc29sdmUoKSk7XG4gICAgfSk7XG59XG4vKipcbiAqIERyb3BzIHRoZSBjYWNoZWQgdmVyZGljdC4gQ2FsbCB0aGlzIG9uIGFueSA0MDEgc28gdGhlIG5leHQgcG9wdXAgb3BlblxuICogZG9lc24ndCB0cnVzdCBhIHN0YWxlIFwiYXV0aGVudGljYXRlZFwiIGFuc3dlci5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsZWFyU2Vzc2lvbkF1dGhDYWNoZSgpIHtcbiAgICBjb25zdCBzZXNzaW9uU3RvcmUgPSBjaHJvbWUuc3RvcmFnZT8uc2Vzc2lvbjtcbiAgICBpZiAoIXNlc3Npb25TdG9yZSlcbiAgICAgICAgcmV0dXJuO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICBzZXNzaW9uU3RvcmUucmVtb3ZlKEFVVEhfQ0FDSEVfS0VZLCAoKSA9PiByZXNvbHZlKCkpO1xuICAgIH0pO1xufVxuIiwiLy8gU2xvdGhpbmcgQVBJIGNsaWVudCBmb3IgZXh0ZW5zaW9uXG5pbXBvcnQgeyBjcmVhdGVPcHBvcnR1bml0eVNjaGVtYSB9IGZyb20gXCJAc2xvdGhpbmcvc2hhcmVkL3NjaGVtYXNcIjtcbmltcG9ydCB7IGNsZWFyU2Vzc2lvbkF1dGhDYWNoZSwgZ2V0U3RvcmFnZSwgbWFya0F1dGhTZWVuLCBzZXRTdG9yYWdlLCB9IGZyb20gXCIuL3N0b3JhZ2VcIjtcbmNvbnN0IFRSQU5TSUVOVF9TVEFUVVNfQ09ERVMgPSBuZXcgU2V0KFs0MDgsIDQyOSwgNTAwLCA1MDIsIDUwMywgNTA0XSk7XG5jb25zdCBDSEFUX1JFVFJZX1NUQVRVU19DT0RFUyA9IG5ldyBTZXQoWzUwMCwgNTAyLCA1MDMsIDUwNF0pO1xuZXhwb3J0IGNsYXNzIFNsb3RoaW5nQVBJQ2xpZW50IHtcbiAgICBjb25zdHJ1Y3RvcihiYXNlVXJsKSB7XG4gICAgICAgIHRoaXMuYmFzZVVybCA9IGJhc2VVcmwucmVwbGFjZSgvXFwvJC8sIFwiXCIpO1xuICAgIH1cbiAgICBhc3luYyBnZXRBdXRoVG9rZW4oKSB7XG4gICAgICAgIGNvbnN0IHN0b3JhZ2UgPSBhd2FpdCBnZXRTdG9yYWdlKCk7XG4gICAgICAgIGlmICghc3RvcmFnZS5hdXRoVG9rZW4pXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgLy8gQ2hlY2sgZXhwaXJ5XG4gICAgICAgIGlmIChzdG9yYWdlLnRva2VuRXhwaXJ5KSB7XG4gICAgICAgICAgICBjb25zdCBleHBpcnkgPSBuZXcgRGF0ZShzdG9yYWdlLnRva2VuRXhwaXJ5KTtcbiAgICAgICAgICAgIGlmIChleHBpcnkgPCBuZXcgRGF0ZSgpKSB7XG4gICAgICAgICAgICAgICAgLy8gVG9rZW4gZXhwaXJlZCwgY2xlYXIgaXRcbiAgICAgICAgICAgICAgICBhd2FpdCBzZXRTdG9yYWdlKHsgYXV0aFRva2VuOiB1bmRlZmluZWQsIHRva2VuRXhwaXJ5OiB1bmRlZmluZWQgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0b3JhZ2UuYXV0aFRva2VuO1xuICAgIH1cbiAgICBhc3luYyBhdXRoZW50aWNhdGVkRmV0Y2gocGF0aCwgb3B0aW9ucyA9IHt9LCByZXRyeVBvbGljeSA9IGluZmVyUmV0cnlQb2xpY3kob3B0aW9ucykpIHtcbiAgICAgICAgY29uc3QgdG9rZW4gPSBhd2FpdCB0aGlzLmdldEF1dGhUb2tlbigpO1xuICAgICAgICBpZiAoIXRva2VuKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOb3QgYXV0aGVudGljYXRlZFwiKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtYXhBdHRlbXB0cyA9IHJldHJ5UG9saWN5ID09PSBcInNhZmVcIiA/IDMgOiByZXRyeVBvbGljeSA9PT0gXCJvbmNlXCIgPyAyIDogMTtcbiAgICAgICAgbGV0IGxhc3RSZXNwb25zZSA9IG51bGw7XG4gICAgICAgIGxldCBzYXdSZXRyeSA9IGZhbHNlO1xuICAgICAgICBmb3IgKGxldCBhdHRlbXB0ID0gMTsgYXR0ZW1wdCA8PSBtYXhBdHRlbXB0czsgYXR0ZW1wdCsrKSB7XG4gICAgICAgICAgICBsZXQgcmVzcG9uc2U7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYCR7dGhpcy5iYXNlVXJsfSR7cGF0aH1gLCB7XG4gICAgICAgICAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJYLUV4dGVuc2lvbi1Ub2tlblwiOiB0b2tlbixcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLm9wdGlvbnMuaGVhZGVycyxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGlmIChhdHRlbXB0IDwgbWF4QXR0ZW1wdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgc2F3UmV0cnkgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCB3YWl0Rm9yUmV0cnkocmV0cnlEZWxheU1zKGF0dGVtcHQpKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gNDAxKSB7XG4gICAgICAgICAgICAgICAgLy8gQ2xlYXIgaW52YWxpZCB0b2tlbiBBTkQgdGhlIGZhc3QtcGF0aCBzZXNzaW9uIGNhY2hlICgjMzApIHNvIHRoZVxuICAgICAgICAgICAgICAgIC8vIG5leHQgcG9wdXAgb3BlbiByZS12ZXJpZmllcyBpbnN0ZWFkIG9mIHRydXN0aW5nIGEgc3RhbGUgdmVyZGljdC5cbiAgICAgICAgICAgICAgICBhd2FpdCBzZXRTdG9yYWdlKHsgYXV0aFRva2VuOiB1bmRlZmluZWQsIHRva2VuRXhwaXJ5OiB1bmRlZmluZWQgfSk7XG4gICAgICAgICAgICAgICAgYXdhaXQgY2xlYXJTZXNzaW9uQXV0aENhY2hlKCk7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQXV0aGVudGljYXRpb24gZXhwaXJlZFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyZXNwb25zZS5vaykge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5qc29uKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsYXN0UmVzcG9uc2UgPSByZXNwb25zZTtcbiAgICAgICAgICAgIGlmIChhdHRlbXB0IDwgbWF4QXR0ZW1wdHMgJiZcbiAgICAgICAgICAgICAgICBUUkFOU0lFTlRfU1RBVFVTX0NPREVTLmhhcyhyZXNwb25zZS5zdGF0dXMpKSB7XG4gICAgICAgICAgICAgICAgc2F3UmV0cnkgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGF3YWl0IHdhaXRGb3JSZXRyeShyZXRyeURlbGF5TXMoYXR0ZW1wdCwgcmVzcG9uc2UpKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGVycm9yID0gYXdhaXQgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICAuanNvbigpXG4gICAgICAgICAgICAgICAgLmNhdGNoKCgpID0+ICh7IGVycm9yOiBcIlJlcXVlc3QgZmFpbGVkXCIgfSkpO1xuICAgICAgICAgICAgY29uc3QgZmFsbGJhY2sgPSBzYXdSZXRyeVxuICAgICAgICAgICAgICAgID8gYFJlcXVlc3Qgc3RpbGwgZmFpbGluZyBhZnRlciByZXRyeTogJHtyZXNwb25zZS5zdGF0dXN9YFxuICAgICAgICAgICAgICAgIDogYFJlcXVlc3QgZmFpbGVkOiAke3Jlc3BvbnNlLnN0YXR1c31gO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yLmVycm9yIHx8IGZhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3Ioc2F3UmV0cnkgJiYgbGFzdFJlc3BvbnNlXG4gICAgICAgICAgICA/IGBSZXF1ZXN0IHN0aWxsIGZhaWxpbmcgYWZ0ZXIgcmV0cnk6ICR7bGFzdFJlc3BvbnNlLnN0YXR1c31gXG4gICAgICAgICAgICA6IFwiUmVxdWVzdCBmYWlsZWRcIik7XG4gICAgfVxuICAgIGFzeW5jIGlzQXV0aGVudGljYXRlZCgpIHtcbiAgICAgICAgY29uc3QgdG9rZW4gPSBhd2FpdCB0aGlzLmdldEF1dGhUb2tlbigpO1xuICAgICAgICBpZiAoIXRva2VuKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5hdXRoZW50aWNhdGVkRmV0Y2goXCIvYXBpL2V4dGVuc2lvbi9hdXRoL3ZlcmlmeVwiLCB7fSwgXCJzYWZlXCIpO1xuICAgICAgICAgICAgLy8gUmVjb3JkIHRoZSB3b3JraW5nLWF1dGggYnJlYWRjcnVtYiBzbyB0aGUgcG9wdXAgY2FuIGRpc3Rpbmd1aXNoIGFcbiAgICAgICAgICAgIC8vIHRydWUgbG9nb3V0IGZyb20gYSBzZXJ2aWNlLXdvcmtlciBzdGF0ZS1sb3NzIGFmdGVyIHRoaXMgcG9pbnQuXG4gICAgICAgICAgICAvLyBTZWUgIzI3LlxuICAgICAgICAgICAgYXdhaXQgbWFya0F1dGhTZWVuKCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgYXN5bmMgZ2V0UHJvZmlsZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXV0aGVudGljYXRlZEZldGNoKFwiL2FwaS9leHRlbnNpb24vcHJvZmlsZVwiLCB7fSwgXCJzYWZlXCIpO1xuICAgIH1cbiAgICBhc3luYyBpbXBvcnRKb2Ioam9iKSB7XG4gICAgICAgIGNvbnN0IG9wcG9ydHVuaXR5ID0ge1xuICAgICAgICAgICAgdHlwZTogXCJqb2JcIixcbiAgICAgICAgICAgIHRpdGxlOiBqb2IudGl0bGUsXG4gICAgICAgICAgICBjb21wYW55OiBqb2IuY29tcGFueSxcbiAgICAgICAgICAgIHNvdXJjZTogbm9ybWFsaXplT3Bwb3J0dW5pdHlTb3VyY2Uoam9iLnNvdXJjZSksXG4gICAgICAgICAgICBzb3VyY2VVcmw6IGpvYi51cmwsXG4gICAgICAgICAgICBzb3VyY2VJZDogam9iLnNvdXJjZUpvYklkLFxuICAgICAgICAgICAgc3VtbWFyeTogam9iLmRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgcmVzcG9uc2liaWxpdGllczogam9iLnJlc3BvbnNpYmlsaXRpZXMgfHwgW10sXG4gICAgICAgICAgICByZXF1aXJlZFNraWxsczogam9iLnJlcXVpcmVtZW50cyB8fCBbXSxcbiAgICAgICAgICAgIHRlY2hTdGFjazogam9iLmtleXdvcmRzIHx8IFtdLFxuICAgICAgICAgICAgam9iVHlwZTogam9iLnR5cGUsXG4gICAgICAgICAgICByZW1vdGVUeXBlOiBqb2IucmVtb3RlID8gXCJyZW1vdGVcIiA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIGRlYWRsaW5lOiBqb2IuZGVhZGxpbmUsXG4gICAgICAgIH07XG4gICAgICAgIGNyZWF0ZU9wcG9ydHVuaXR5U2NoZW1hLnBhcnNlKG9wcG9ydHVuaXR5KTtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXV0aGVudGljYXRlZEZldGNoKFwiL2FwaS9vcHBvcnR1bml0aWVzL2Zyb20tZXh0ZW5zaW9uXCIsIHtcbiAgICAgICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgdGl0bGU6IGpvYi50aXRsZSxcbiAgICAgICAgICAgICAgICBjb21wYW55OiBqb2IuY29tcGFueSxcbiAgICAgICAgICAgICAgICBsb2NhdGlvbjogam9iLmxvY2F0aW9uLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBqb2IuZGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgcmVxdWlyZW1lbnRzOiBqb2IucmVxdWlyZW1lbnRzLFxuICAgICAgICAgICAgICAgIHJlc3BvbnNpYmlsaXRpZXM6IGpvYi5yZXNwb25zaWJpbGl0aWVzIHx8IFtdLFxuICAgICAgICAgICAgICAgIGtleXdvcmRzOiBqb2Iua2V5d29yZHMgfHwgW10sXG4gICAgICAgICAgICAgICAgdHlwZTogam9iLnR5cGUsXG4gICAgICAgICAgICAgICAgcmVtb3RlOiBqb2IucmVtb3RlLFxuICAgICAgICAgICAgICAgIHNhbGFyeTogam9iLnNhbGFyeSxcbiAgICAgICAgICAgICAgICB1cmw6IGpvYi51cmwsXG4gICAgICAgICAgICAgICAgc291cmNlOiBqb2Iuc291cmNlLFxuICAgICAgICAgICAgICAgIHNvdXJjZUpvYklkOiBqb2Iuc291cmNlSm9iSWQsXG4gICAgICAgICAgICAgICAgcG9zdGVkQXQ6IGpvYi5wb3N0ZWRBdCxcbiAgICAgICAgICAgICAgICBkZWFkbGluZTogam9iLmRlYWRsaW5lLFxuICAgICAgICAgICAgfSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBhc3luYyBpbXBvcnRKb2JzQmF0Y2goam9icykge1xuICAgICAgICByZXR1cm4gdGhpcy5hdXRoZW50aWNhdGVkRmV0Y2goXCIvYXBpL29wcG9ydHVuaXRpZXMvZnJvbS1leHRlbnNpb25cIiwge1xuICAgICAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgam9icyB9KSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGFzeW5jIHRyYWNrQXBwbGllZChwYXlsb2FkKSB7XG4gICAgICAgIGNvbnN0IHNjcmFwZWRKb2IgPSBwYXlsb2FkLnNjcmFwZWRKb2IgfHwgdW5kZWZpbmVkO1xuICAgICAgICBjb25zdCB0aXRsZSA9IHNjcmFwZWRKb2I/LnRpdGxlIHx8IHBheWxvYWQuaGVhZGxpbmUgfHwgcGF5bG9hZC50aXRsZTtcbiAgICAgICAgY29uc3QgY29tcGFueSA9IHNjcmFwZWRKb2I/LmNvbXBhbnkgfHwgcGF5bG9hZC5ob3N0LnJlcGxhY2UoL153d3dcXC4vLCBcIlwiKTtcbiAgICAgICAgY29uc3Qgbm90ZXMgPSBbXG4gICAgICAgICAgICBwYXlsb2FkLmhlYWRsaW5lID8gYEhlYWRsaW5lOiAke3BheWxvYWQuaGVhZGxpbmV9YCA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHBheWxvYWQudGh1bWJuYWlsRGF0YVVybFxuICAgICAgICAgICAgICAgID8gXCJTY3JlZW5zaG90IGNhcHR1cmVkIGJ5IGV4dGVuc2lvbi5cIlxuICAgICAgICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgICBdXG4gICAgICAgICAgICAuZmlsdGVyKEJvb2xlYW4pXG4gICAgICAgICAgICAuam9pbihcIlxcblwiKTtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmF1dGhlbnRpY2F0ZWRGZXRjaChcIi9hcGkvb3Bwb3J0dW5pdGllcy9mcm9tLWV4dGVuc2lvblwiLCB7XG4gICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgICAgICAgIGNvbXBhbnksXG4gICAgICAgICAgICAgICAgbG9jYXRpb246IHNjcmFwZWRKb2I/LmxvY2F0aW9uLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBzY3JhcGVkSm9iPy5kZXNjcmlwdGlvbiB8fFxuICAgICAgICAgICAgICAgICAgICBwYXlsb2FkLmhlYWRsaW5lIHx8XG4gICAgICAgICAgICAgICAgICAgIFwiQXBwbGljYXRpb24gc3VibWl0dGVkIHZpYSBleHRlbnNpb24uXCIsXG4gICAgICAgICAgICAgICAgcmVxdWlyZW1lbnRzOiBzY3JhcGVkSm9iPy5yZXF1aXJlbWVudHMgfHwgW10sXG4gICAgICAgICAgICAgICAgcmVzcG9uc2liaWxpdGllczogc2NyYXBlZEpvYj8ucmVzcG9uc2liaWxpdGllcyB8fCBbXSxcbiAgICAgICAgICAgICAgICBrZXl3b3Jkczogc2NyYXBlZEpvYj8ua2V5d29yZHMgfHwgW10sXG4gICAgICAgICAgICAgICAgdHlwZTogc2NyYXBlZEpvYj8udHlwZSxcbiAgICAgICAgICAgICAgICByZW1vdGU6IHNjcmFwZWRKb2I/LnJlbW90ZSxcbiAgICAgICAgICAgICAgICBzYWxhcnk6IHNjcmFwZWRKb2I/LnNhbGFyeSxcbiAgICAgICAgICAgICAgICB1cmw6IHNjcmFwZWRKb2I/LnVybCB8fCBwYXlsb2FkLnVybCxcbiAgICAgICAgICAgICAgICBzb3VyY2U6IHNjcmFwZWRKb2I/LnNvdXJjZSB8fCBwYXlsb2FkLmhvc3QsXG4gICAgICAgICAgICAgICAgc291cmNlSm9iSWQ6IHNjcmFwZWRKb2I/LnNvdXJjZUpvYklkLFxuICAgICAgICAgICAgICAgIHBvc3RlZEF0OiBzY3JhcGVkSm9iPy5wb3N0ZWRBdCxcbiAgICAgICAgICAgICAgICBkZWFkbGluZTogc2NyYXBlZEpvYj8uZGVhZGxpbmUsXG4gICAgICAgICAgICAgICAgc3RhdHVzOiBcImFwcGxpZWRcIixcbiAgICAgICAgICAgICAgICBhcHBsaWVkQXQ6IHBheWxvYWQuc3VibWl0dGVkQXQsXG4gICAgICAgICAgICAgICAgbm90ZXMsXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IG9wcG9ydHVuaXR5SWQgPSByZXNwb25zZS5vcHBvcnR1bml0eUlkc1swXTtcbiAgICAgICAgaWYgKCFvcHBvcnR1bml0eUlkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBcHBsaWNhdGlvbiB3YXMgbm90IHRyYWNrZWRcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG9wcG9ydHVuaXR5SWQsXG4gICAgICAgICAgICBkZWR1cGVkOiBCb29sZWFuKHJlc3BvbnNlLmRlZHVwZWRJZHM/LmluY2x1ZGVzKG9wcG9ydHVuaXR5SWQpKSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgYXN5bmMgdGFpbG9yRnJvbUpvYihqb2IsIGJhc2VSZXN1bWVJZCkge1xuICAgICAgICBjb25zdCBqb2JEZXNjcmlwdGlvbiA9IGdldFJlYWRhYmxlSm9iRGVzY3JpcHRpb24oam9iKTtcbiAgICAgICAgY29uc3QgaW1wb3J0ZWQgPSBhd2FpdCB0aGlzLmltcG9ydEpvYihqb2IpO1xuICAgICAgICBjb25zdCBvcHBvcnR1bml0eUlkID0gZ2V0SW1wb3J0ZWRPcHBvcnR1bml0eUlkKGltcG9ydGVkLm9wcG9ydHVuaXR5SWRzKTtcbiAgICAgICAgY29uc3QgcmVxdWVzdEJvZHkgPSB7XG4gICAgICAgICAgICBhY3Rpb246IFwiZ2VuZXJhdGVcIixcbiAgICAgICAgICAgIGpvYkRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgam9iVGl0bGU6IGpvYi50aXRsZSxcbiAgICAgICAgICAgIGNvbXBhbnk6IGpvYi5jb21wYW55LFxuICAgICAgICAgICAgb3Bwb3J0dW5pdHlJZCxcbiAgICAgICAgfTtcbiAgICAgICAgLy8gT25seSB0aHJlYWQgdGhlIGlkIHRocm91Z2ggd2hlbiB0aGUgcG9wdXAgcGlja2VkIGEgbm9uLWRlZmF1bHQgcmVzdW1lIOKAlFxuICAgICAgICAvLyBvbWl0dGluZyB0aGUgZmllbGQga2VlcHMgdGhlIHJlcXVlc3QgYm9keSBieXRlLWlkZW50aWNhbCB0byB0aGUgbGVnYWN5XG4gICAgICAgIC8vIHNoYXBlLCBzbyBleGlzdGluZyB0ZXN0cyArIHRlbGVtZXRyeSBkb24ndCBjaHVybiBmb3IgdGhlIG1hc3RlciBjYXNlLlxuICAgICAgICBpZiAoYmFzZVJlc3VtZUlkKSB7XG4gICAgICAgICAgICByZXF1ZXN0Qm9keS5iYXNlUmVzdW1lSWQgPSBiYXNlUmVzdW1lSWQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmF1dGhlbnRpY2F0ZWRGZXRjaChcIi9hcGkvdGFpbG9yXCIsIHtcbiAgICAgICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShyZXF1ZXN0Qm9keSksXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIXJlc3BvbnNlLnNhdmVkUmVzdW1lPy5pZCB8fCAhcmVzcG9uc2Uuam9iSWQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRhaWxvcmVkIHJlc3VtZSB3YXMgZ2VuZXJhdGVkIHdpdGhvdXQgYSBzYXZlZCByZXN1bWUuXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBvcHBvcnR1bml0eUlkLFxuICAgICAgICAgICAgc2F2ZWRSZXN1bWU6IHsgaWQ6IHJlc3BvbnNlLnNhdmVkUmVzdW1lLmlkIH0sXG4gICAgICAgICAgICBqb2JJZDogcmVzcG9uc2Uuam9iSWQsXG4gICAgICAgIH07XG4gICAgfVxuICAgIGFzeW5jIGxpc3RSZXN1bWVzKCkge1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuYXV0aGVudGljYXRlZEZldGNoKFwiL2FwaS9leHRlbnNpb24vcmVzdW1lc1wiLCB7fSwgXCJzYWZlXCIpO1xuICAgICAgICByZXR1cm4gcmVzcG9uc2UucmVzdW1lcyA/PyBbXTtcbiAgICB9XG4gICAgYXN5bmMgZ2VuZXJhdGVDb3ZlckxldHRlckZyb21Kb2Ioam9iKSB7XG4gICAgICAgIGNvbnN0IGpvYkRlc2NyaXB0aW9uID0gZ2V0UmVhZGFibGVKb2JEZXNjcmlwdGlvbihqb2IpO1xuICAgICAgICBjb25zdCBpbXBvcnRlZCA9IGF3YWl0IHRoaXMuaW1wb3J0Sm9iKGpvYik7XG4gICAgICAgIGNvbnN0IG9wcG9ydHVuaXR5SWQgPSBnZXRJbXBvcnRlZE9wcG9ydHVuaXR5SWQoaW1wb3J0ZWQub3Bwb3J0dW5pdHlJZHMpO1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuYXV0aGVudGljYXRlZEZldGNoKFwiL2FwaS9jb3Zlci1sZXR0ZXIvZ2VuZXJhdGVcIiwge1xuICAgICAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICBhY3Rpb246IFwiZ2VuZXJhdGVcIixcbiAgICAgICAgICAgICAgICBqb2JEZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICBqb2JUaXRsZTogam9iLnRpdGxlLFxuICAgICAgICAgICAgICAgIGNvbXBhbnk6IGpvYi5jb21wYW55LFxuICAgICAgICAgICAgICAgIG9wcG9ydHVuaXR5SWQsXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICghcmVzcG9uc2Uuc2F2ZWRDb3ZlckxldHRlcj8uaWQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvdmVyIGxldHRlciB3YXMgZ2VuZXJhdGVkIHdpdGhvdXQgYSBzYXZlZCBkb2N1bWVudC5cIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG9wcG9ydHVuaXR5SWQsXG4gICAgICAgICAgICBzYXZlZENvdmVyTGV0dGVyOiB7IGlkOiByZXNwb25zZS5zYXZlZENvdmVyTGV0dGVyLmlkIH0sXG4gICAgICAgIH07XG4gICAgfVxuICAgIGFzeW5jIHNhdmVMZWFybmVkQW5zd2VyKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXV0aGVudGljYXRlZEZldGNoKFwiL2FwaS9leHRlbnNpb24vbGVhcm5lZC1hbnN3ZXJzXCIsIHtcbiAgICAgICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShkYXRhKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGFzeW5jIHNlYXJjaFNpbWlsYXJBbnN3ZXJzKHF1ZXN0aW9uKSB7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5hdXRoZW50aWNhdGVkRmV0Y2goXCIvYXBpL2V4dGVuc2lvbi9sZWFybmVkLWFuc3dlcnMvc2VhcmNoXCIsIHtcbiAgICAgICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IHF1ZXN0aW9uIH0pLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLnJlc3VsdHM7XG4gICAgfVxuICAgIC8vIFAyLyMzNSDigJQgaW5saW5lIGFuc3dlci1iYW5rIHNlYXJjaCBvbiBsb25nIHRleHRhcmVhcy5cbiAgICAvLyBDYWxscyAvYXBpL2Fuc3dlci1iYW5rL21hdGNoIHdpdGggYHFgIGFuZCBvcHRpb25hbCBgbGltaXRgIChkZWZhdWx0cyB0byA1XG4gICAgLy8gc2VydmVyLXNpZGUsIGNhcHBlZCkuIFVzZWQgYnkgdGhlIGZsb2F0aW5nIGJ1bGIgcG9wb3ZlciBkZWNvcmF0b3IuXG4gICAgYXN5bmMgbWF0Y2hBbnN3ZXJCYW5rKHEsIGxpbWl0KSB7XG4gICAgICAgIGNvbnN0IHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoeyBxIH0pO1xuICAgICAgICBpZiAodHlwZW9mIGxpbWl0ID09PSBcIm51bWJlclwiICYmIE51bWJlci5pc0Zpbml0ZShsaW1pdCkpIHtcbiAgICAgICAgICAgIHBhcmFtcy5zZXQoXCJsaW1pdFwiLCBTdHJpbmcobGltaXQpKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuYXV0aGVudGljYXRlZEZldGNoKGAvYXBpL2Fuc3dlci1iYW5rL21hdGNoPyR7cGFyYW1zLnRvU3RyaW5nKCl9YCk7XG4gICAgICAgIHJldHVybiByZXNwb25zZS5yZXN1bHRzO1xuICAgIH1cbiAgICBhc3luYyBnZXRMZWFybmVkQW5zd2VycygpIHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmF1dGhlbnRpY2F0ZWRGZXRjaChcIi9hcGkvZXh0ZW5zaW9uL2xlYXJuZWQtYW5zd2Vyc1wiKTtcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmFuc3dlcnM7XG4gICAgfVxuICAgIGFzeW5jIGRlbGV0ZUxlYXJuZWRBbnN3ZXIoaWQpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5hdXRoZW50aWNhdGVkRmV0Y2goYC9hcGkvZXh0ZW5zaW9uL2xlYXJuZWQtYW5zd2Vycy8ke2lkfWAsIHtcbiAgICAgICAgICAgIG1ldGhvZDogXCJERUxFVEVcIixcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGFzeW5jIHVwZGF0ZUxlYXJuZWRBbnN3ZXIoaWQsIGFuc3dlcikge1xuICAgICAgICByZXR1cm4gdGhpcy5hdXRoZW50aWNhdGVkRmV0Y2goYC9hcGkvZXh0ZW5zaW9uL2xlYXJuZWQtYW5zd2Vycy8ke2lkfWAsIHtcbiAgICAgICAgICAgIG1ldGhvZDogXCJQQVRDSFwiLFxuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBhbnN3ZXIgfSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQNC8jNDAg4oCUIElubGluZSBBSSBhc3Npc3RhbnQgc3RyZWFtaW5nIGNvbnN1bWVyLlxuICAgICAqXG4gICAgICogT3BlbnMgYW4gU1NFIHJlcXVlc3QgdG8gL2FwaS9leHRlbnNpb24vY2hhdCBhbmQgeWllbGRzIHRva2VucyBhcyB0aGV5XG4gICAgICogYXJyaXZlLiBTZXJ2aWNlIHdvcmtlcnMgRE8gaGF2ZSBgZmV0Y2hgICsgYGJvZHkuZ2V0UmVhZGVyKClgICh2ZXJpZmllZCBvblxuICAgICAqIENocm9tZSBNVjMgKyBGaXJlZm94IE1WMiksIHNvIHdlIGRvbid0IG5lZWQgYEV2ZW50U291cmNlYCBoZXJlIOKAlCB3aGljaFxuICAgICAqIG1hdHRlcnMgYmVjYXVzZSBFdmVudFNvdXJjZSBjYW4ndCBhdHRhY2ggdGhlIFgtRXh0ZW5zaW9uLVRva2VuIGhlYWRlci5cbiAgICAgKlxuICAgICAqIFRoZSBzZXJ2ZXIgZW1pdHMgdGhyZWUgU1NFIGZyYW1lIHNoYXBlczpcbiAgICAgKiAgIGRhdGE6IHtcInRva2VuXCI6IFwiLi4uXCJ9ICAgICAvLyBwZXIgdG9rZW4gY2h1bmtcbiAgICAgKiAgIGRhdGE6IHtcImRvbmVcIjogdHJ1ZX0gICAgICAgIC8vIGVuZCBvZiBzdHJlYW1cbiAgICAgKiAgIGRhdGE6IHtcImVycm9yXCI6IFwiLi4uXCJ9ICAgICAgLy8gbWlkLXN0cmVhbSBmYWlsdXJlIChmb2xsb3dlZCBieSBkb25lOnRydWUpXG4gICAgICpcbiAgICAgKiBXZSB5aWVsZCBzdHJpbmcgdG9rZW5zIHRvIHRoZSBjYWxsZXIgYW5kIHRocm93IG9uIGB7ZXJyb3J9YCBmcmFtZXMgc28gdGhlXG4gICAgICogYmFja2dyb3VuZCdzIHBvcnQgaGFuZGxlciBjYW4gZm9yd2FyZCBhIENIQVRfU1RSRUFNX0VSUk9SIHRvIHRoZSBVSS5cbiAgICAgKi9cbiAgICBhc3luYyAqY2hhdChwcm9tcHQsIGpvYkNvbnRleHQpIHtcbiAgICAgICAgY29uc3QgdG9rZW4gPSBhd2FpdCB0aGlzLmdldEF1dGhUb2tlbigpO1xuICAgICAgICBpZiAoIXRva2VuKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOb3QgYXV0aGVudGljYXRlZFwiKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGAke3RoaXMuYmFzZVVybH0vYXBpL2V4dGVuc2lvbi9jaGF0YCwge1xuICAgICAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICBcIlgtRXh0ZW5zaW9uLVRva2VuXCI6IHRva2VuLFxuICAgICAgICAgICAgICAgIEFjY2VwdDogXCJ0ZXh0L2V2ZW50LXN0cmVhbVwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgcHJvbXB0LCBqb2JDb250ZXh0IH0pLFxuICAgICAgICB9KS5jYXRjaChhc3luYyAoZXJyb3IpID0+IHtcbiAgICAgICAgICAgIGF3YWl0IHdhaXRGb3JSZXRyeShyZXRyeURlbGF5TXMoMSkpO1xuICAgICAgICAgICAgY29uc3QgcmV0cmllZCA9IGF3YWl0IGZldGNoKGAke3RoaXMuYmFzZVVybH0vYXBpL2V4dGVuc2lvbi9jaGF0YCwge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJYLUV4dGVuc2lvbi1Ub2tlblwiOiB0b2tlbixcbiAgICAgICAgICAgICAgICAgICAgQWNjZXB0OiBcInRleHQvZXZlbnQtc3RyZWFtXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IHByb21wdCwgam9iQ29udGV4dCB9KSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKCFyZXRyaWVkLm9rICYmIENIQVRfUkVUUllfU1RBVFVTX0NPREVTLmhhcyhyZXRyaWVkLnN0YXR1cykpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXRyaWVkO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCFyZXNwb25zZS5vayAmJiBDSEFUX1JFVFJZX1NUQVRVU19DT0RFUy5oYXMocmVzcG9uc2Uuc3RhdHVzKSkge1xuICAgICAgICAgICAgYXdhaXQgd2FpdEZvclJldHJ5KHJldHJ5RGVsYXlNcygxLCByZXNwb25zZSkpO1xuICAgICAgICAgICAgY29uc3QgcmV0cnlSZXNwb25zZSA9IGF3YWl0IGZldGNoKGAke3RoaXMuYmFzZVVybH0vYXBpL2V4dGVuc2lvbi9jaGF0YCwge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJYLUV4dGVuc2lvbi1Ub2tlblwiOiB0b2tlbixcbiAgICAgICAgICAgICAgICAgICAgQWNjZXB0OiBcInRleHQvZXZlbnQtc3RyZWFtXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IHByb21wdCwgam9iQ29udGV4dCB9KSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHJldHJ5UmVzcG9uc2Uub2spIHtcbiAgICAgICAgICAgICAgICB5aWVsZCogcmVhZENoYXRTdHJlYW0ocmV0cnlSZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgICAgIC8vIDQwMTogaW52YWxpZGF0ZSB0aGUgdG9rZW4sIG1pcnJvciBhdXRoZW50aWNhdGVkRmV0Y2goKSBzbyB0aGUgcG9wdXBcbiAgICAgICAgICAgIC8vIG5vdGljZXMgdGhlIHNlc3Npb24gbG9zdCBzdGF0ZSBvbiB0aGUgbmV4dCBvcGVuLlxuICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gNDAxKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgc2V0U3RvcmFnZSh7IGF1dGhUb2tlbjogdW5kZWZpbmVkLCB0b2tlbkV4cGlyeTogdW5kZWZpbmVkIH0pO1xuICAgICAgICAgICAgICAgIGF3YWl0IGNsZWFyU2Vzc2lvbkF1dGhDYWNoZSgpO1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkF1dGhlbnRpY2F0aW9uIGV4cGlyZWRcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgZXJyTWVzc2FnZSA9IGBSZXF1ZXN0IGZhaWxlZDogJHtyZXNwb25zZS5zdGF0dXN9YDtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYm9keSA9IChhd2FpdCByZXNwb25zZS5qc29uKCkpO1xuICAgICAgICAgICAgICAgIGlmIChib2R5Py5lcnJvcilcbiAgICAgICAgICAgICAgICAgICAgZXJyTWVzc2FnZSA9IGJvZHkuZXJyb3I7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCB7XG4gICAgICAgICAgICAgICAgLy8gQm9keSB3YXNuJ3QgSlNPTjsga2VlcCB0aGUgZ2VuZXJpYyBtZXNzYWdlLlxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVyck1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICAgIHlpZWxkKiByZWFkQ2hhdFN0cmVhbShyZXNwb25zZSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFBlcnNpc3QgYSB1c2VyIGNvcnJlY3Rpb24gc28gdGhlIHBlci1kb21haW4gZmllbGQgbWFwcGluZyBncm93cyBzdHJvbmdlclxuICAgICAqIG92ZXIgdGltZS4gU2VlIHRhc2sgIzMzIGluIGRvY3MvZXh0ZW5zaW9uLXJvYWRtYXAtMjAyNi0wNS5tZC4gVGhlIHNlcnZlclxuICAgICAqIHVwc2VydHMgaW50byBgZmllbGRfbWFwcGluZ3NgLCBidW1waW5nIGBoaXRfY291bnRgIG9uIGV4aXN0aW5nIHJvd3MgYW5kXG4gICAgICogaW5zZXJ0aW5nIGZyZXNoIHJvd3Mgb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIGFzeW5jIHNhdmVDb3JyZWN0aW9uKHBheWxvYWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXV0aGVudGljYXRlZEZldGNoKFwiL2FwaS9leHRlbnNpb24vZmllbGQtbWFwcGluZ3MvY29ycmVjdFwiLCB7XG4gICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkocGF5bG9hZCksXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmFzeW5jIGZ1bmN0aW9uKiByZWFkQ2hhdFN0cmVhbShyZXNwb25zZSkge1xuICAgIGNvbnN0IHJlYWRlciA9IHJlc3BvbnNlLmJvZHk/LmdldFJlYWRlcigpO1xuICAgIGlmICghcmVhZGVyKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIHJlc3BvbnNlIGJvZHlcIik7XG4gICAgfVxuICAgIGNvbnN0IGRlY29kZXIgPSBuZXcgVGV4dERlY29kZXIoKTtcbiAgICBsZXQgYnVmZmVyID0gXCJcIjtcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICBjb25zdCB7IGRvbmUsIHZhbHVlIH0gPSBhd2FpdCByZWFkZXIucmVhZCgpO1xuICAgICAgICBpZiAoZG9uZSlcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBidWZmZXIgKz0gZGVjb2Rlci5kZWNvZGUodmFsdWUsIHsgc3RyZWFtOiB0cnVlIH0pO1xuICAgICAgICAvLyBTU0UgZnJhbWVzIGFyZSBzZXBhcmF0ZWQgYnkgYSBibGFuayBsaW5lIChcXG5cXG4pLiBXZSBzcGxpdCBvbiBpdCBhbmRcbiAgICAgICAgLy8gaG9sZCB0aGUgdHJhaWxpbmcgcGFydGlhbCBpbiBgYnVmZmVyYC5cbiAgICAgICAgY29uc3QgZnJhbWVzID0gYnVmZmVyLnNwbGl0KFwiXFxuXFxuXCIpO1xuICAgICAgICBidWZmZXIgPSBmcmFtZXMucG9wKCkgPz8gXCJcIjtcbiAgICAgICAgZm9yIChjb25zdCBmcmFtZSBvZiBmcmFtZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGxpbmUgPSBmcmFtZS5zcGxpdChcIlxcblwiKS5maW5kKChsKSA9PiBsLnN0YXJ0c1dpdGgoXCJkYXRhOiBcIikpO1xuICAgICAgICAgICAgaWYgKCFsaW5lKVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgY29uc3QgZGF0YVN0ciA9IGxpbmUuc2xpY2UoNikudHJpbSgpO1xuICAgICAgICAgICAgaWYgKCFkYXRhU3RyKVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgbGV0IHBhcnNlZDtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcGFyc2VkID0gSlNPTi5wYXJzZShkYXRhU3RyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwYXJzZWQuZXJyb3IpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IocGFyc2VkLmVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwYXJzZWQudG9rZW4pIHtcbiAgICAgICAgICAgICAgICB5aWVsZCBwYXJzZWQudG9rZW47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocGFyc2VkLmRvbmUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiBpbmZlclJldHJ5UG9saWN5KG9wdGlvbnMpIHtcbiAgICBjb25zdCBtZXRob2QgPSAob3B0aW9ucy5tZXRob2QgfHwgXCJHRVRcIikudG9VcHBlckNhc2UoKTtcbiAgICByZXR1cm4gbWV0aG9kID09PSBcIkdFVFwiID8gXCJzYWZlXCIgOiBcIm5vbmVcIjtcbn1cbmZ1bmN0aW9uIHJldHJ5RGVsYXlNcyhhdHRlbXB0LCByZXNwb25zZSkge1xuICAgIGNvbnN0IHJldHJ5QWZ0ZXIgPSByZXNwb25zZT8uaGVhZGVycy5nZXQoXCJSZXRyeS1BZnRlclwiKTtcbiAgICBpZiAocmV0cnlBZnRlcikge1xuICAgICAgICBjb25zdCBzZWNvbmRzID0gTnVtYmVyKHJldHJ5QWZ0ZXIpO1xuICAgICAgICBpZiAoTnVtYmVyLmlzRmluaXRlKHNlY29uZHMpICYmIHNlY29uZHMgPj0gMCAmJiBzZWNvbmRzIDwgNSkge1xuICAgICAgICAgICAgcmV0dXJuIHNlY29uZHMgKiAxMDAwO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGJhc2UgPSBhdHRlbXB0ID09PSAxID8gMjUwIDogNzUwO1xuICAgIGNvbnN0IGppdHRlciA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDc1KTtcbiAgICByZXR1cm4gYmFzZSArIGppdHRlcjtcbn1cbmFzeW5jIGZ1bmN0aW9uIHdhaXRGb3JSZXRyeShkZWxheU1zKSB7XG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSBcInRlc3RcIilcbiAgICAgICAgcmV0dXJuO1xuICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIGRlbGF5TXMpKTtcbn1cbmZ1bmN0aW9uIGdldFJlYWRhYmxlSm9iRGVzY3JpcHRpb24oam9iKSB7XG4gICAgY29uc3QgZGVzY3JpcHRpb24gPSBqb2IuZGVzY3JpcHRpb24/LnRyaW0oKSA/PyBcIlwiO1xuICAgIGlmIChkZXNjcmlwdGlvbi5sZW5ndGggPCAyMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZG4ndCByZWFkIHRoZSBmdWxsIGpvYiBkZXNjcmlwdGlvbiBmcm9tIHRoaXMgcGFnZS5cIik7XG4gICAgfVxuICAgIHJldHVybiBkZXNjcmlwdGlvbjtcbn1cbmZ1bmN0aW9uIGdldEltcG9ydGVkT3Bwb3J0dW5pdHlJZChvcHBvcnR1bml0eUlkcykge1xuICAgIGNvbnN0IG9wcG9ydHVuaXR5SWQgPSBvcHBvcnR1bml0eUlkc1swXTtcbiAgICBpZiAoIW9wcG9ydHVuaXR5SWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSm9iIGltcG9ydCBkaWQgbm90IHJldHVybiBhbiBvcHBvcnR1bml0eSBpZC5cIik7XG4gICAgfVxuICAgIHJldHVybiBvcHBvcnR1bml0eUlkO1xufVxuZnVuY3Rpb24gbm9ybWFsaXplT3Bwb3J0dW5pdHlTb3VyY2Uoc291cmNlKSB7XG4gICAgY29uc3Qgbm9ybWFsaXplZCA9IHNvdXJjZS50b0xvd2VyQ2FzZSgpO1xuICAgIGlmIChub3JtYWxpemVkLmluY2x1ZGVzKFwibGlua2VkaW5cIikpXG4gICAgICAgIHJldHVybiBcImxpbmtlZGluXCI7XG4gICAgaWYgKG5vcm1hbGl6ZWQuaW5jbHVkZXMoXCJpbmRlZWRcIikpXG4gICAgICAgIHJldHVybiBcImluZGVlZFwiO1xuICAgIGlmIChub3JtYWxpemVkLmluY2x1ZGVzKFwiZ3JlZW5ob3VzZVwiKSlcbiAgICAgICAgcmV0dXJuIFwiZ3JlZW5ob3VzZVwiO1xuICAgIGlmIChub3JtYWxpemVkLmluY2x1ZGVzKFwibGV2ZXJcIikpXG4gICAgICAgIHJldHVybiBcImxldmVyXCI7XG4gICAgaWYgKG5vcm1hbGl6ZWQuaW5jbHVkZXMoXCJ3YXRlcmxvb1wiKSlcbiAgICAgICAgcmV0dXJuIFwid2F0ZXJsb293b3Jrc1wiO1xuICAgIGlmIChub3JtYWxpemVkLmluY2x1ZGVzKFwiZGV2cG9zdFwiKSlcbiAgICAgICAgcmV0dXJuIFwiZGV2cG9zdFwiO1xuICAgIHJldHVybiBcInVybFwiO1xufVxuLy8gU2luZ2xldG9uIGluc3RhbmNlXG5sZXQgY2xpZW50ID0gbnVsbDtcbmxldCBjbGllbnRCYXNlVXJsID0gbnVsbDtcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRBUElDbGllbnQoKSB7XG4gICAgY29uc3Qgc3RvcmFnZSA9IGF3YWl0IGdldFN0b3JhZ2UoKTtcbiAgICBpZiAoIWNsaWVudCB8fCBjbGllbnRCYXNlVXJsICE9PSBzdG9yYWdlLmFwaUJhc2VVcmwpIHtcbiAgICAgICAgY2xpZW50ID0gbmV3IFNsb3RoaW5nQVBJQ2xpZW50KHN0b3JhZ2UuYXBpQmFzZVVybCk7XG4gICAgICAgIGNsaWVudEJhc2VVcmwgPSBzdG9yYWdlLmFwaUJhc2VVcmw7XG4gICAgfVxuICAgIHJldHVybiBjbGllbnQ7XG59XG5leHBvcnQgZnVuY3Rpb24gcmVzZXRBUElDbGllbnQoKSB7XG4gICAgY2xpZW50ID0gbnVsbDtcbiAgICBjbGllbnRCYXNlVXJsID0gbnVsbDtcbn1cbiIsImltcG9ydCB7IGdldFNldHRpbmdzIH0gZnJvbSBcIi4vc3RvcmFnZVwiO1xuZXhwb3J0IGNvbnN0IEJBREdFX1RFWFQgPSBcIiFcIjtcbmV4cG9ydCBjb25zdCBCQURHRV9DT0xPUiA9IFwiI2I4NzA0YVwiO1xuZXhwb3J0IGNvbnN0IEJBREdFX1RJVExFID0gXCJKb2IgZGV0ZWN0ZWQg4oCUIHByZXNzIENtZCtTaGlmdCtJIHRvIGltcG9ydFwiO1xuZnVuY3Rpb24gZ2V0QmFkZ2VBcGkoKSB7XG4gICAgY29uc3QgcnVudGltZSA9IGNocm9tZTtcbiAgICByZXR1cm4gcnVudGltZS5hY3Rpb24gPz8gcnVudGltZS5icm93c2VyQWN0aW9uID8/IG51bGw7XG59XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0QmFkZ2VGb3JUYWIodGFiSWQpIHtcbiAgICBjb25zdCBzZXR0aW5ncyA9IGF3YWl0IGdldFNldHRpbmdzKCk7XG4gICAgaWYgKCFzZXR0aW5ncy5ub3RpZnlPbkpvYkRldGVjdGVkKVxuICAgICAgICByZXR1cm47XG4gICAgY29uc3QgYmFkZ2VBcGkgPSBnZXRCYWRnZUFwaSgpO1xuICAgIGlmICghYmFkZ2VBcGkpXG4gICAgICAgIHJldHVybjtcbiAgICBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgIGJhZGdlQXBpLnNldEJhZGdlVGV4dCh7IHRleHQ6IEJBREdFX1RFWFQsIHRhYklkIH0pLFxuICAgICAgICBiYWRnZUFwaS5zZXRCYWRnZUJhY2tncm91bmRDb2xvcih7IGNvbG9yOiBCQURHRV9DT0xPUiwgdGFiSWQgfSksXG4gICAgICAgIGJhZGdlQXBpLnNldFRpdGxlKHsgdGl0bGU6IEJBREdFX1RJVExFLCB0YWJJZCB9KSxcbiAgICBdKTtcbn1cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbGVhckJhZGdlRm9yVGFiKHRhYklkKSB7XG4gICAgY29uc3QgYmFkZ2VBcGkgPSBnZXRCYWRnZUFwaSgpO1xuICAgIGlmICghYmFkZ2VBcGkpXG4gICAgICAgIHJldHVybjtcbiAgICBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgIGJhZGdlQXBpLnNldEJhZGdlVGV4dCh7IHRleHQ6IFwiXCIsIHRhYklkIH0pLFxuICAgICAgICBiYWRnZUFwaS5zZXRUaXRsZSh7IHRpdGxlOiBcIlwiLCB0YWJJZCB9KSxcbiAgICBdKTtcbn1cbiIsIi8vIE11bHRpLXN0ZXAgc2Vzc2lvbiBzdGF0ZSAoUDMgLyAjMzYgLyAjMzcpLlxuLy9cbi8vIFdoZW4gdGhlIHVzZXIgY29uZmlybXMgXCJBdXRvLWZpbGwgdGhpcyBhcHBsaWNhdGlvblwiIG9uIGEgbXVsdGktc3RlcCBBVFNcbi8vIGZsb3cgKFdvcmtkYXksIEdyZWVuaG91c2UpLCB3ZSBjYXB0dXJlIGEgc25hcHNob3Qgb2YgdGhlIHByb2ZpbGUgKyBiYXNlXG4vLyByZXN1bWUgKyBqb2IgVVJMIGFuZCBwZXJzaXN0IGl0IHVuZGVyIGBjaHJvbWUuc3RvcmFnZS5zZXNzaW9uYCBrZXllZCBieVxuLy8gdGhlIGN1cnJlbnQgdGFiSWQuIEVhY2ggc3Vic2VxdWVudCBzdGVwIHRyYW5zaXRpb24g4oCUIGVpdGhlciB2aWEgdGhlXG4vLyB3ZWJOYXZpZ2F0aW9uIGxpc3RlbmVyIChwcmVmZXJyZWQpIG9yIHZpYSB0aGUgcHJvbXB0ZWQgZmFsbGJhY2sgdG9hc3Qg4oCUXG4vLyBsb29rcyB1cCB0aGlzIHNuYXBzaG90IHRvIGZpbGwgdGhlIG5leHQgcGFnZSB3aXRob3V0IHJlLWFza2luZyB0aGUgdXNlci5cbi8vXG4vLyBUaGUgc2Vzc2lvbiBuYXR1cmFsbHkgY2xlYXJzIG9uOlxuLy8gLSBleHBsaWNpdCBgY2xlYXJTZXNzaW9uYCAoc3VibWl0IGNsaWNrLCBcIk5vXCIgb24gdGhlIGZhbGxiYWNrIHRvYXN0KVxuLy8gLSB0YWIgY2xvc2UgKGNocm9tZSB3aXBlcyBzZXNzaW9uIHN0b3JhZ2Ugd2hlbiB0aGUgdGFiIGlzIGdvbmUg4oCUIHdlIGFsc29cbi8vICAgY2xlYXIgb24gYHBhZ2VoaWRlYCBhcyBhIGJlbHQtYW5kLXN1c3BlbmRlcnMgZm9yIGJmY2FjaGUgcmVzdG9yZXMpXG4vLyAtIDMwIG1pbnV0ZXMgb2YgaW5hY3Rpdml0eSAoYGNvbmZpcm1lZEF0YCBUVEwpXG4vL1xuLy8gV2UgZGVsaWJlcmF0ZWx5IHVzZSBgY2hyb21lLnN0b3JhZ2Uuc2Vzc2lvbmAgaW5zdGVhZCBvZiBpbi1tZW1vcnkgc3RhdGUgc29cbi8vIHRoZSBzZXNzaW9uIHN1cnZpdmVzIGNvbnRlbnQtc2NyaXB0IHJlLWluamVjdGlvbiB3aGVuIFdvcmtkYXkvR3JlZW5ob3VzZVxuLy8gYmxvdyBhd2F5IHRoZSBET00gYmV0d2VlbiBzdGVwcy4gVGhlIFRUTCBpcyBlbmZvcmNlZCBvbiByZWFkLCBub3Qgb24gd3JpdGUsXG4vLyBiZWNhdXNlIHNlc3Npb24gc3RvcmFnZSBkb2Vzbid0IGV4cG9zZSBUVExzIG5hdGl2ZWx5LlxuLyoqIFRUTCBhZnRlciB3aGljaCBhIGNhcHR1cmVkIHNlc3Npb24gaXMgY29uc2lkZXJlZCBzdGFsZSBhbmQgaWdub3JlZC4gKi9cbmV4cG9ydCBjb25zdCBNVUxUSVNURVBfU0VTU0lPTl9UVExfTVMgPSAzMCAqIDYwICogMTAwMDtcbi8qKiBTdG9yYWdlIGtleSB1bmRlciBjaHJvbWUuc3RvcmFnZS5zZXNzaW9uLiBLZXllZCBieSB0YWJJZC4gKi9cbmNvbnN0IE1VTFRJU1RFUF9TRVNTSU9OX0tFWSA9IFwic2xvdGhpbmdfbXVsdGlzdGVwX3Nlc3Npb25zXCI7XG4vKipcbiAqIGNocm9tZS5zdG9yYWdlLnNlc3Npb24gaXMgTVYzLW9ubHkuIEluIE1WMiAoRmlyZWZveCkgd2UgZmFsbCBiYWNrIHRvXG4gKiBgY2hyb21lLnN0b3JhZ2UubG9jYWxgIHdpdGggdGhlIHNhbWUgVFRMIGdhdGluZyDigJQgdGhlIGRhdGEgaXMgd2lwZWQgb25cbiAqIGBjaHJvbWUucnVudGltZS5vbkluc3RhbGxlZGAgLyBmaXJzdCByZWFkIGFmdGVyIHRoZSBUVEwgcGFzc2VzLCBzbyB0aGVcbiAqIFwic2Vzc2lvblwiIHNlbWFudGljcyBhcmUgcHJlc2VydmVkIGF0IHRoZSBjb3N0IG9mIG9uZSBleHRyYSBkaXNrIGhpdC5cbiAqL1xuZnVuY3Rpb24gZ2V0U2Vzc2lvbkFyZWEoKSB7XG4gICAgLy8gVGhlIGBzZXNzaW9uYCBBUEkgaXMgb25seSBwcmVzZW50IGluIE1WMy4gd2ViZXh0ZW5zaW9uLXBvbHlmaWxsIGV4cG9zZXNcbiAgICAvLyBgbG9jYWxgIGluIGJvdGggbWFuaWZlc3QgdmVyc2lvbnMsIHNvIGl0J3MgYSBzYWZlIGxhc3QgcmVzb3J0LlxuICAgIGNvbnN0IGFyZWEgPSBjaHJvbWUuc3RvcmFnZS5zZXNzaW9uO1xuICAgIHJldHVybiBhcmVhID8/IGNocm9tZS5zdG9yYWdlLmxvY2FsO1xufVxuYXN5bmMgZnVuY3Rpb24gcmVhZE1hcCgpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgZ2V0U2Vzc2lvbkFyZWEoKS5nZXQoTVVMVElTVEVQX1NFU1NJT05fS0VZLCAocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCByYXcgPSByZXN1bHQ/LltNVUxUSVNURVBfU0VTU0lPTl9LRVldID8/IHt9O1xuICAgICAgICAgICAgcmVzb2x2ZShyYXcpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn1cbmFzeW5jIGZ1bmN0aW9uIHdyaXRlTWFwKG1hcCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICBnZXRTZXNzaW9uQXJlYSgpLnNldCh7IFtNVUxUSVNURVBfU0VTU0lPTl9LRVldOiBtYXAgfSwgKCkgPT4gcmVzb2x2ZSgpKTtcbiAgICB9KTtcbn1cbmZ1bmN0aW9uIGlzRXhwaXJlZChzZXNzaW9uLCBub3cgPSBEYXRlLm5vdygpKSB7XG4gICAgY29uc3QgY29uZmlybWVkID0gRGF0ZS5wYXJzZShzZXNzaW9uLmNvbmZpcm1lZEF0KTtcbiAgICBpZiAoIU51bWJlci5pc0Zpbml0ZShjb25maXJtZWQpKVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICByZXR1cm4gbm93IC0gY29uZmlybWVkID4gTVVMVElTVEVQX1NFU1NJT05fVFRMX01TO1xufVxuLyoqXG4gKiBQZXJzaXN0IGEgbmV3IChvciByZWZyZXNoZWQpIHNlc3Npb24gc25hcHNob3QuXG4gKlxuICogQ2FsbGluZyB0aGlzIGFnYWluIHdpdGggdGhlIHNhbWUgdGFiSWQgb3ZlcndyaXRlcyB0aGUgZXhpc3Rpbmcgc25hcHNob3Qg4oCUXG4gKiBpbnRlbnRpb25hbGx5IOKAlCBiZWNhdXNlIHRoZSB1c2VyIGhhcyBqdXN0IHJlLWNvbmZpcm1lZC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldFNlc3Npb24oc2Vzc2lvbikge1xuICAgIGNvbnN0IG1hcCA9IGF3YWl0IHJlYWRNYXAoKTtcbiAgICBtYXBbU3RyaW5nKHNlc3Npb24udGFiSWQpXSA9IHNlc3Npb247XG4gICAgYXdhaXQgd3JpdGVNYXAobWFwKTtcbn1cbi8qKlxuICogTG9vayB1cCB0aGUgbGl2ZSBzZXNzaW9uIGZvciBhIHRhYiwgcmV0dXJuaW5nIGBudWxsYCBpZiBhYnNlbnQsIGV4cGlyZWQsXG4gKiBvciBwb2ludGluZyBhdCBhIGRpZmZlcmVudCBBVFMgcHJvdmlkZXIgdGhhbiB0aGUgY2FsbGVyIGV4cGVjdHMuXG4gKlxuICogRXhwaXJlZCBlbnRyaWVzIGFyZSBldmljdGVkIG9wcG9ydHVuaXN0aWNhbGx5IG9uIHJlYWQgc28gd2UgZG9uJ3QgbGVha1xuICogc3RhbGUgc25hcHNob3RzIGludG8gbG9uZy1saXZlZCBzdG9yYWdlLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0U2Vzc2lvbih0YWJJZCwgcHJvdmlkZXIpIHtcbiAgICBjb25zdCBtYXAgPSBhd2FpdCByZWFkTWFwKCk7XG4gICAgY29uc3QgZW50cnkgPSBtYXBbU3RyaW5nKHRhYklkKV07XG4gICAgaWYgKCFlbnRyeSlcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgaWYgKGlzRXhwaXJlZChlbnRyeSkpIHtcbiAgICAgICAgZGVsZXRlIG1hcFtTdHJpbmcodGFiSWQpXTtcbiAgICAgICAgYXdhaXQgd3JpdGVNYXAobWFwKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGlmIChwcm92aWRlciAmJiBlbnRyeS5wcm92aWRlciAhPT0gcHJvdmlkZXIpXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIHJldHVybiBlbnRyeTtcbn1cbi8qKlxuICogRHJvcCB0aGUgc2Vzc2lvbiBmb3IgYSB0YWIuIENhbGxlZCBvbiBzdWJtaXQgY2xpY2ssIG9uIHRhYiBjbG9zZSwgYW5kIHdoZW5cbiAqIHRoZSB1c2VyIHNheXMgXCJOb1wiIHRvIHRoZSBwcm9tcHRlZCBmYWxsYmFjayB0b2FzdC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsZWFyU2Vzc2lvbih0YWJJZCkge1xuICAgIGNvbnN0IG1hcCA9IGF3YWl0IHJlYWRNYXAoKTtcbiAgICBpZiAoIShTdHJpbmcodGFiSWQpIGluIG1hcCkpXG4gICAgICAgIHJldHVybjtcbiAgICBkZWxldGUgbWFwW1N0cmluZyh0YWJJZCldO1xuICAgIGF3YWl0IHdyaXRlTWFwKG1hcCk7XG59XG4vKipcbiAqIFN3ZWVwIGV2ZXJ5IGV4cGlyZWQgZW50cnkuIENhbGxlZCBmcm9tIHRoZSBiYWNrZ3JvdW5kIG9uIHN0YXJ0dXAgdG8ga2VlcFxuICogdGhlIHNlc3Npb24tYXJlYSBzbWFsbCBpZiB0aGUgYnJvd3NlciBjcmFzaGVkIG1pZC1mbG93LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHVyZ2VFeHBpcmVkU2Vzc2lvbnMobm93ID0gRGF0ZS5ub3coKSkge1xuICAgIGNvbnN0IG1hcCA9IGF3YWl0IHJlYWRNYXAoKTtcbiAgICBsZXQgY2hhbmdlZCA9IGZhbHNlO1xuICAgIGZvciAoY29uc3QgW2tleSwgZW50cnldIG9mIE9iamVjdC5lbnRyaWVzKG1hcCkpIHtcbiAgICAgICAgaWYgKGlzRXhwaXJlZChlbnRyeSwgbm93KSkge1xuICAgICAgICAgICAgZGVsZXRlIG1hcFtrZXldO1xuICAgICAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGNoYW5nZWQpXG4gICAgICAgIGF3YWl0IHdyaXRlTWFwKG1hcCk7XG59XG4vKipcbiAqIFJlYWQgZXZlcnkgbGl2ZSBzZXNzaW9uIOKAlCB1c2VkIGJ5IHRoZSBiYWNrZ3JvdW5kIHdlYk5hdmlnYXRpb24gbGlzdGVuZXJcbiAqIHRvIGRlY2lkZSB3aGV0aGVyIHRoZSB0YWIgaXQganVzdCBzYXcgYSBoaXN0b3J5LXVwZGF0ZSBvbiBpcyBvbmUgd2Ugb3duLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbGlzdFNlc3Npb25zKCkge1xuICAgIGNvbnN0IG1hcCA9IGF3YWl0IHJlYWRNYXAoKTtcbiAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuICAgIHJldHVybiBPYmplY3QudmFsdWVzKG1hcCkuZmlsdGVyKChlbnRyeSkgPT4gIWlzRXhwaXJlZChlbnRyeSwgbm93KSk7XG59XG4iLCIvLyBCYWNrZ3JvdW5kIHNlcnZpY2Ugd29ya2VyIGZvciBTbG90aGluZyBleHRlbnNpb25cbmltcG9ydCB7IENIQVRfUE9SVF9OQU1FIH0gZnJvbSBcIkAvc2hhcmVkL3R5cGVzXCI7XG5pbXBvcnQgeyBtZXNzYWdlRm9yRXJyb3IgfSBmcm9tIFwiQC9zaGFyZWQvZXJyb3ItbWVzc2FnZXNcIjtcbmltcG9ydCB7IGdldEFQSUNsaWVudCwgcmVzZXRBUElDbGllbnQgfSBmcm9tIFwiLi9hcGktY2xpZW50XCI7XG5pbXBvcnQgeyBnZXRTdG9yYWdlLCBzZXRBdXRoVG9rZW4sIGNsZWFyQXV0aFRva2VuLCBmb3JnZXRBdXRoSGlzdG9yeSwgZ2V0Q2FjaGVkUHJvZmlsZSwgc2V0Q2FjaGVkUHJvZmlsZSwgZ2V0QXBpQmFzZVVybCwgZ2V0U2V0dGluZ3MsIGlzU2Vzc2lvbkxvc3QsIGdldFNlc3Npb25BdXRoQ2FjaGUsIHNldFNlc3Npb25BdXRoQ2FjaGUsIGNsZWFyU2Vzc2lvbkF1dGhDYWNoZSwgfSBmcm9tIFwiLi9zdG9yYWdlXCI7XG5pbXBvcnQgeyBzZXRCYWRnZUZvclRhYiwgY2xlYXJCYWRnZUZvclRhYiB9IGZyb20gXCIuL2JhZGdlXCI7XG5pbXBvcnQgeyBjbGVhclNlc3Npb24sIGxpc3RTZXNzaW9ucywgcHVyZ2VFeHBpcmVkU2Vzc2lvbnMsIH0gZnJvbSBcIkAvY29udGVudC9tdWx0aXN0ZXAvc2Vzc2lvblwiO1xuLy8gSGFuZGxlIG1lc3NhZ2VzIGZyb20gY29udGVudCBzY3JpcHRzIGFuZCBwb3B1cFxuY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChtZXNzYWdlLCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xuICAgIGhhbmRsZU1lc3NhZ2UobWVzc2FnZSwgc2VuZGVyKVxuICAgICAgICAudGhlbihzZW5kUmVzcG9uc2UpXG4gICAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgY29uc29sZS5lcnJvcihcIltTbG90aGluZ10gTWVzc2FnZSBoYW5kbGVyIGVycm9yOlwiLCBlcnJvcik7XG4gICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9KTtcbiAgICB9KTtcbiAgICAvLyBSZXR1cm4gdHJ1ZSB0byBpbmRpY2F0ZSBhc3luYyByZXNwb25zZVxuICAgIHJldHVybiB0cnVlO1xufSk7XG5hc3luYyBmdW5jdGlvbiBoYW5kbGVNZXNzYWdlKG1lc3NhZ2UsIHNlbmRlcikge1xuICAgIHN3aXRjaCAobWVzc2FnZS50eXBlKSB7XG4gICAgICAgIGNhc2UgXCJHRVRfQVVUSF9TVEFUVVNcIjpcbiAgICAgICAgICAgIHJldHVybiBoYW5kbGVHZXRBdXRoU3RhdHVzKCk7XG4gICAgICAgIGNhc2UgXCJPUEVOX0FVVEhcIjpcbiAgICAgICAgICAgIHJldHVybiBoYW5kbGVPcGVuQXV0aCgpO1xuICAgICAgICBjYXNlIFwiTE9HT1VUXCI6XG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlTG9nb3V0KCk7XG4gICAgICAgIGNhc2UgXCJHRVRfUFJPRklMRVwiOlxuICAgICAgICAgICAgcmV0dXJuIGhhbmRsZUdldFByb2ZpbGUoKTtcbiAgICAgICAgY2FzZSBcIkdFVF9TRVRUSU5HU1wiOlxuICAgICAgICAgICAgcmV0dXJuIGhhbmRsZUdldFNldHRpbmdzKCk7XG4gICAgICAgIGNhc2UgXCJJTVBPUlRfSk9CXCI6XG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlSW1wb3J0Sm9iKG1lc3NhZ2UucGF5bG9hZCk7XG4gICAgICAgIGNhc2UgXCJJTVBPUlRfSk9CU19CQVRDSFwiOlxuICAgICAgICAgICAgcmV0dXJuIGhhbmRsZUltcG9ydEpvYnNCYXRjaChtZXNzYWdlLnBheWxvYWQpO1xuICAgICAgICBjYXNlIFwiVFJBQ0tfQVBQTElFRFwiOlxuICAgICAgICAgICAgcmV0dXJuIGhhbmRsZVRyYWNrQXBwbGllZChtZXNzYWdlLnBheWxvYWQpO1xuICAgICAgICBjYXNlIFwiT1BFTl9EQVNIQk9BUkRcIjpcbiAgICAgICAgICAgIHJldHVybiBoYW5kbGVPcGVuRGFzaGJvYXJkKCk7XG4gICAgICAgIGNhc2UgXCJDQVBUVVJFX1ZJU0lCTEVfVEFCXCI6XG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlQ2FwdHVyZVZpc2libGVUYWIoKTtcbiAgICAgICAgY2FzZSBcIlRBSUxPUl9GUk9NX1BBR0VcIjpcbiAgICAgICAgICAgIHJldHVybiBoYW5kbGVUYWlsb3JGcm9tUGFnZShtZXNzYWdlLnBheWxvYWQpO1xuICAgICAgICBjYXNlIFwiR0VORVJBVEVfQ09WRVJfTEVUVEVSX0ZST01fUEFHRVwiOlxuICAgICAgICAgICAgcmV0dXJuIGhhbmRsZUdlbmVyYXRlQ292ZXJMZXR0ZXJGcm9tUGFnZShtZXNzYWdlLnBheWxvYWQpO1xuICAgICAgICBjYXNlIFwiTElTVF9SRVNVTUVTXCI6XG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlTGlzdFJlc3VtZXMoKTtcbiAgICAgICAgY2FzZSBcIlNBVkVfQU5TV0VSXCI6XG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlU2F2ZUFuc3dlcihtZXNzYWdlLnBheWxvYWQpO1xuICAgICAgICBjYXNlIFwiU0VBUkNIX0FOU1dFUlNcIjpcbiAgICAgICAgICAgIHJldHVybiBoYW5kbGVTZWFyY2hBbnN3ZXJzKG1lc3NhZ2UucGF5bG9hZCk7XG4gICAgICAgIGNhc2UgXCJNQVRDSF9BTlNXRVJfQkFOS1wiOlxuICAgICAgICAgICAgcmV0dXJuIGhhbmRsZU1hdGNoQW5zd2VyQmFuayhtZXNzYWdlLnBheWxvYWQpO1xuICAgICAgICBjYXNlIFwiR0VUX0xFQVJORURfQU5TV0VSU1wiOlxuICAgICAgICAgICAgcmV0dXJuIGhhbmRsZUdldExlYXJuZWRBbnN3ZXJzKCk7XG4gICAgICAgIGNhc2UgXCJERUxFVEVfQU5TV0VSXCI6XG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlRGVsZXRlQW5zd2VyKG1lc3NhZ2UucGF5bG9hZCk7XG4gICAgICAgIGNhc2UgXCJTQVZFX0NPUlJFQ1RJT05cIjpcbiAgICAgICAgICAgIHJldHVybiBoYW5kbGVTYXZlQ29ycmVjdGlvbihtZXNzYWdlLnBheWxvYWQpO1xuICAgICAgICAvLyBQMyAvICMzNiAjMzcg4oCUIG11bHRpLXN0ZXAgc3VwcG9ydC5cbiAgICAgICAgY2FzZSBcIkdFVF9UQUJfSURcIjpcbiAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgdGFiSWQ6IHNlbmRlci50YWI/LmlkID8/IG51bGwgfSB9O1xuICAgICAgICBjYXNlIFwiSEFTX1dFQk5BVklHQVRJT05fUEVSTUlTU0lPTlwiOlxuICAgICAgICAgICAgcmV0dXJuIGhhbmRsZUhhc1dlYk5hdmlnYXRpb25QZXJtaXNzaW9uKCk7XG4gICAgICAgIGNhc2UgXCJSRVFVRVNUX1dFQk5BVklHQVRJT05fUEVSTUlTU0lPTlwiOlxuICAgICAgICAgICAgcmV0dXJuIGhhbmRsZVJlcXVlc3RXZWJOYXZpZ2F0aW9uUGVybWlzc2lvbigpO1xuICAgICAgICBjYXNlIFwiSk9CX0RFVEVDVEVEXCI6IHtcbiAgICAgICAgICAgIGNvbnN0IHRhYklkID0gc2VuZGVyLnRhYj8uaWQ7XG4gICAgICAgICAgICBpZiAoIXRhYklkKVxuICAgICAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogXCJObyB0YWIgSUQgaW4gc2VuZGVyXCIgfTtcbiAgICAgICAgICAgIGF3YWl0IHNldEJhZGdlRm9yVGFiKHRhYklkKTtcbiAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfTtcbiAgICAgICAgfVxuICAgICAgICBjYXNlIFwiQVVUSF9DQUxMQkFDS1wiOiB7XG4gICAgICAgICAgICAvLyBTZW50IGJ5IHRoZSBjb250ZW50IHNjcmlwdCB3aGVuIGl0IHBpY2tzIHVwIGEgbG9jYWxTdG9yYWdlLXRyYW5zcG9ydGVkXG4gICAgICAgICAgICAvLyB0b2tlbiBmcm9tIHRoZSBTbG90aGluZyBjb25uZWN0IHBhZ2UgKHRoZSBsb2NhbFN0b3JhZ2UgcGF0aCBpcyB1c2VkIG9uXG4gICAgICAgICAgICAvLyBicm93c2VycyB3aXRob3V0IGV4dGVybmFsbHlfY29ubmVjdGFibGUg4oCUIEZpcmVmb3ggaW4gcGFydGljdWxhcikuXG4gICAgICAgICAgICBjb25zdCBwYXlsb2FkID0gbWVzc2FnZTtcbiAgICAgICAgICAgIGlmICghcGF5bG9hZC50b2tlbiB8fCAhcGF5bG9hZC5leHBpcmVzQXQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IFwiTWlzc2luZyB0b2tlbiBvciBleHBpcmVzQXRcIiB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBhd2FpdCBzZXRBdXRoVG9rZW4ocGF5bG9hZC50b2tlbiwgcGF5bG9hZC5leHBpcmVzQXQsIGF1dGhDYWxsYmFja0Jhc2VVcmwocGF5bG9hZC5hcGlCYXNlVXJsLCBzZW5kZXIudXJsKSk7XG4gICAgICAgICAgICAgICAgcmVzZXRBUElDbGllbnQoKTtcbiAgICAgICAgICAgICAgICBub3RpZnlBdXRoU3RhdHVzQ2hhbmdlZCgpO1xuICAgICAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3IubWVzc2FnZSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBVbmtub3duIG1lc3NhZ2UgdHlwZTogJHttZXNzYWdlLnR5cGV9YCB9O1xuICAgIH1cbn1cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVRhaWxvckZyb21QYWdlKHBheWxvYWQpIHtcbiAgICAvLyBTdXBwb3J0IGJvdGggdGhlIG5ldyB3cmFwcGVkIHBheWxvYWQgKHtqb2IsIGJhc2VSZXN1bWVJZH0pIHVzZWQgYnkgdGhlXG4gICAgLy8gcG9wdXAgcGlja2VyICgjMzQpIGFuZCB0aGUgbGVnYWN5IGJhcmUgU2NyYXBlZEpvYiBzdGlsbCBzZW50IGJ5IHRoZVxuICAgIC8vIGNvbnRlbnQtc2NyaXB0IFRhaWxvciBhY3Rpb24uIFRoZSBcInVybFwiIHByZXNlbmNlIG9uIHRoZSBpbm5lciBvYmplY3QgaXNcbiAgICAvLyB0aGUgY2hlYXBlc3QgZGlzY3JpbWluYXRvciAoU2NyYXBlZEpvYiBoYXMgaXQsIFRhaWxvckZyb21QYWdlUGF5bG9hZFxuICAgIC8vIGRvZXNuJ3QpLlxuICAgIGNvbnN0IGlzTGVnYWN5ID0gXCJ1cmxcIiBpbiBwYXlsb2FkICYmICEoXCJqb2JcIiBpbiBwYXlsb2FkKTtcbiAgICBjb25zdCBqb2IgPSBpc0xlZ2FjeVxuICAgICAgICA/IHBheWxvYWRcbiAgICAgICAgOiBwYXlsb2FkLmpvYjtcbiAgICBjb25zdCBiYXNlUmVzdW1lSWQgPSBpc0xlZ2FjeVxuICAgICAgICA/IHVuZGVmaW5lZFxuICAgICAgICA6IHBheWxvYWQuYmFzZVJlc3VtZUlkO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IGF3YWl0IGdldEFQSUNsaWVudCgpO1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBjbGllbnQudGFpbG9yRnJvbUpvYihqb2IsIGJhc2VSZXN1bWVJZCk7XG4gICAgICAgIGNvbnN0IGFwaUJhc2VVcmwgPSBhd2FpdCBnZXRBcGlCYXNlVXJsKCk7XG4gICAgICAgIGNvbnN0IHJlc3VtZUlkID0gcmVzdWx0LnNhdmVkUmVzdW1lLmlkO1xuICAgICAgICBjb25zdCBzdHVkaW9QYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHtcbiAgICAgICAgICAgIGZyb206IFwiZXh0ZW5zaW9uXCIsXG4gICAgICAgICAgICB0YWlsb3JJZDogcmVzdW1lSWQsXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoYmFzZVJlc3VtZUlkKSB7XG4gICAgICAgICAgICBzdHVkaW9QYXJhbXMuc2V0KFwiYmFzZVJlc3VtZUlkXCIsIGJhc2VSZXN1bWVJZCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgdXJsOiBgJHthcGlCYXNlVXJsfS9zdHVkaW8/JHtzdHVkaW9QYXJhbXMudG9TdHJpbmcoKX1gLFxuICAgICAgICAgICAgICAgIG9wcG9ydHVuaXR5SWQ6IHJlc3VsdC5vcHBvcnR1bml0eUlkLFxuICAgICAgICAgICAgICAgIHJlc3VtZUlkLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9O1xuICAgIH1cbn1cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUxpc3RSZXN1bWVzKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IGF3YWl0IGdldEFQSUNsaWVudCgpO1xuICAgICAgICBjb25zdCByZXN1bWVzID0gYXdhaXQgY2xpZW50Lmxpc3RSZXN1bWVzKCk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHsgcmVzdW1lcyB9IH07XG4gICAgfVxuICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfTtcbiAgICB9XG59XG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHZW5lcmF0ZUNvdmVyTGV0dGVyRnJvbVBhZ2Uoam9iKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY2xpZW50ID0gYXdhaXQgZ2V0QVBJQ2xpZW50KCk7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGNsaWVudC5nZW5lcmF0ZUNvdmVyTGV0dGVyRnJvbUpvYihqb2IpO1xuICAgICAgICBjb25zdCBhcGlCYXNlVXJsID0gYXdhaXQgZ2V0QXBpQmFzZVVybCgpO1xuICAgICAgICBjb25zdCBjb3ZlckxldHRlcklkID0gcmVzdWx0LnNhdmVkQ292ZXJMZXR0ZXIuaWQ7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIHVybDogYCR7YXBpQmFzZVVybH0vY292ZXItbGV0dGVyP2Zyb209ZXh0ZW5zaW9uJmlkPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGNvdmVyTGV0dGVySWQpfWAsXG4gICAgICAgICAgICAgICAgb3Bwb3J0dW5pdHlJZDogcmVzdWx0Lm9wcG9ydHVuaXR5SWQsXG4gICAgICAgICAgICAgICAgY292ZXJMZXR0ZXJJZCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgfVxuICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfTtcbiAgICB9XG59XG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRBdXRoU3RhdHVzKCkge1xuICAgIC8vIEZhc3QtcGF0aCAoIzMwKTogcmV0dXJuIGEgY2FjaGVkIHZlcmRpY3QgaWYgaXQncyA8NjBzIG9sZCwgdGhlblxuICAgIC8vIHJldmFsaWRhdGUgaW4gdGhlIGJhY2tncm91bmQgc28gYSBmbGlwcGVkIHNlcnZlciBzdGF0ZSBzdGlsbFxuICAgIC8vIHNlbGYtY29ycmVjdHMgb24gdGhlICpuZXh0KiBwb3B1cCBvcGVuLlxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGNhY2hlZCA9IGF3YWl0IGdldFNlc3Npb25BdXRoQ2FjaGUoKTtcbiAgICAgICAgaWYgKGNhY2hlZCkge1xuICAgICAgICAgICAgY29uc3QgYXBpQmFzZVVybCA9IGF3YWl0IGdldEFwaUJhc2VVcmwoKTtcbiAgICAgICAgICAgIGNvbnN0IHN0b3JhZ2UgPSBhd2FpdCBnZXRTdG9yYWdlKCk7XG4gICAgICAgICAgICBjb25zdCBzZXNzaW9uTG9zdCA9ICFjYWNoZWQuYXV0aGVudGljYXRlZCAmJiBpc1Nlc3Npb25Mb3N0KHN0b3JhZ2UpO1xuICAgICAgICAgICAgLy8gRmlyZS1hbmQtZm9yZ2V0IHJldmFsaWRhdGlvbi4gV2UgZGVsaWJlcmF0ZWx5IGRvbid0IGF3YWl0IGl0IHNvXG4gICAgICAgICAgICAvLyB0aGUgcG9wdXAgZ2V0cyBpdHMgcmVzcG9uc2UgaW1tZWRpYXRlbHkuXG4gICAgICAgICAgICB2b2lkIHJldmFsaWRhdGVBdXRoSW5CYWNrZ3JvdW5kKCk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICBpc0F1dGhlbnRpY2F0ZWQ6IGNhY2hlZC5hdXRoZW50aWNhdGVkLFxuICAgICAgICAgICAgICAgICAgICBhcGlCYXNlVXJsLFxuICAgICAgICAgICAgICAgICAgICBzZXNzaW9uTG9zdCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjYXRjaCB7XG4gICAgICAgIC8vIENhY2hlIGxvb2t1cCBmYWlsdXJlIGlzIG5vbi1mYXRhbDsgZmFsbCB0aHJvdWdoIHRvIHRoZSB2ZXJpZnkgcGF0aC5cbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY2xpZW50ID0gYXdhaXQgZ2V0QVBJQ2xpZW50KCk7XG4gICAgICAgIGNvbnN0IGlzQXV0aGVudGljYXRlZCA9IGF3YWl0IGNsaWVudC5pc0F1dGhlbnRpY2F0ZWQoKTtcbiAgICAgICAgY29uc3QgYXBpQmFzZVVybCA9IGF3YWl0IGdldEFwaUJhc2VVcmwoKTtcbiAgICAgICAgY29uc3Qgc3RvcmFnZSA9IGF3YWl0IGdldFN0b3JhZ2UoKTtcbiAgICAgICAgY29uc3Qgc2Vzc2lvbkxvc3QgPSAhaXNBdXRoZW50aWNhdGVkICYmIGlzU2Vzc2lvbkxvc3Qoc3RvcmFnZSk7XG4gICAgICAgIGF3YWl0IHNldFNlc3Npb25BdXRoQ2FjaGUoaXNBdXRoZW50aWNhdGVkKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICBkYXRhOiB7IGlzQXV0aGVudGljYXRlZCwgYXBpQmFzZVVybCwgc2Vzc2lvbkxvc3QgfSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IGFwaUJhc2VVcmwgPSBhd2FpdCBnZXRBcGlCYXNlVXJsKCk7XG4gICAgICAgIGNvbnN0IHN0b3JhZ2UgPSBhd2FpdCBnZXRTdG9yYWdlKCkuY2F0Y2goKCkgPT4gbnVsbCk7XG4gICAgICAgIGNvbnN0IHNlc3Npb25Mb3N0ID0gc3RvcmFnZSA/IGlzU2Vzc2lvbkxvc3Qoc3RvcmFnZSkgOiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICBkYXRhOiB7IGlzQXV0aGVudGljYXRlZDogZmFsc2UsIGFwaUJhc2VVcmwsIHNlc3Npb25Mb3N0IH0sXG4gICAgICAgIH07XG4gICAgfVxufVxuLyoqXG4gKiBCYWNrZ3JvdW5kIHJldmFsaWRhdGlvbiB0aGF0IHJ1bnMgYWZ0ZXIgd2UgcmV0dXJuIGEgY2FjaGVkIHZlcmRpY3QuXG4gKiBSZWZyZXNoZXMgdGhlIHNlc3Npb24gY2FjaGUgc28gc3Vic2VxdWVudCByZWFkcyBzdGF5IGZyZXNoOyBvbiBhIDQwMVxuICogdGhlIGFwaS1jbGllbnQncyBhdXRoZW50aWNhdGVkRmV0Y2ggY2xlYXJzIGBhdXRoVG9rZW5gICsgdGhlIGNhY2hlXG4gKiBhbHJlYWR5LlxuICovXG5hc3luYyBmdW5jdGlvbiByZXZhbGlkYXRlQXV0aEluQmFja2dyb3VuZCgpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBjbGllbnQgPSBhd2FpdCBnZXRBUElDbGllbnQoKTtcbiAgICAgICAgY29uc3QgdmVyZGljdCA9IGF3YWl0IGNsaWVudC5pc0F1dGhlbnRpY2F0ZWQoKTtcbiAgICAgICAgYXdhaXQgc2V0U2Vzc2lvbkF1dGhDYWNoZSh2ZXJkaWN0KTtcbiAgICB9XG4gICAgY2F0Y2gge1xuICAgICAgICAvLyBOZXR3b3JrIGJsaXAg4oCUIGxlYXZlIHRoZSBjYWNoZSBhbG9uZTsgbmV4dCBtaXNzIHdpbGwgcmV2YWxpZGF0ZS5cbiAgICB9XG59XG5hc3luYyBmdW5jdGlvbiBoYW5kbGVPcGVuQXV0aCgpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBhcGlCYXNlVXJsID0gYXdhaXQgZ2V0QXBpQmFzZVVybCgpO1xuICAgICAgICAvLyBQYXNzIGV4dGVuc2lvbiBJRCBzbyB0aGUgY29ubmVjdCBwYWdlIGNhbiBkZWxpdmVyIHRoZSB0b2tlbiBiYWNrIHZpYVxuICAgICAgICAvLyBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZShleHRlbnNpb25JZCwgLi4uKS4gVGhlIHBhZ2UgaXMgYSByZWd1bGFyIHdlYlxuICAgICAgICAvLyBwYWdlIGFuZCBjYW5ub3QgcmVzb2x2ZSB0aGUgY2FsbGluZyBleHRlbnNpb24gYnkgcGFzc2luZyB1bmRlZmluZWQuXG4gICAgICAgIGNvbnN0IGF1dGhVcmwgPSBgJHthcGlCYXNlVXJsfS9leHRlbnNpb24vY29ubmVjdD9leHRlbnNpb25JZD0ke2Nocm9tZS5ydW50aW1lLmlkfWA7XG4gICAgICAgIGF3YWl0IGNocm9tZS50YWJzLmNyZWF0ZSh7IHVybDogYXV0aFVybCB9KTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9O1xuICAgIH1cbiAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH07XG4gICAgfVxufVxuZnVuY3Rpb24gYXV0aENhbGxiYWNrQmFzZVVybChleHBsaWNpdFVybCwgc2VuZGVyVXJsKSB7XG4gICAgY29uc3QgY2FuZGlkYXRlID0gZXhwbGljaXRVcmwgfHwgc2VuZGVyVXJsO1xuICAgIGlmICghY2FuZGlkYXRlKVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHVybCA9IG5ldyBVUkwoY2FuZGlkYXRlKTtcbiAgICAgICAgaWYgKHVybC5wcm90b2NvbCAhPT0gXCJodHRwOlwiICYmIHVybC5wcm90b2NvbCAhPT0gXCJodHRwczpcIikge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdXJsLm9yaWdpbjtcbiAgICB9XG4gICAgY2F0Y2gge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbn1cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUxvZ291dCgpIHtcbiAgICB0cnkge1xuICAgICAgICBhd2FpdCBjbGVhckF1dGhUb2tlbigpO1xuICAgICAgICAvLyBFeHBsaWNpdCBsb2dvdXQg4oCUIGFsc28gZHJvcCB0aGUgXCJ3ZSd2ZSBzZWVuIHlvdSBiZWZvcmVcIiBicmVhZGNydW1iIHNvXG4gICAgICAgIC8vIHRoZSBwb3B1cCBkb2Vzbid0IGZhbGwgaW50byB0aGUgIzI3IFwic2Vzc2lvbiBsb3N0XCIgYnJhbmNoLlxuICAgICAgICBhd2FpdCBmb3JnZXRBdXRoSGlzdG9yeSgpO1xuICAgICAgICAvLyBBbmQgdGhlIGZhc3QtcGF0aCBjYWNoZSAoIzMwKSBzbyB0aGUgbmV4dCBwb3B1cCBvcGVuIHJlLXZlcmlmaWVzLlxuICAgICAgICBhd2FpdCBjbGVhclNlc3Npb25BdXRoQ2FjaGUoKTtcbiAgICAgICAgcmVzZXRBUElDbGllbnQoKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9O1xuICAgIH1cbiAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH07XG4gICAgfVxufVxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlR2V0UHJvZmlsZSgpIHtcbiAgICB0cnkge1xuICAgICAgICAvLyBDaGVjayBjYWNoZSBmaXJzdFxuICAgICAgICBjb25zdCBjYWNoZWQgPSBhd2FpdCBnZXRDYWNoZWRQcm9maWxlKCk7XG4gICAgICAgIGlmIChjYWNoZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IGNhY2hlZCB9O1xuICAgICAgICB9XG4gICAgICAgIC8vIEZldGNoIGZyb20gQVBJXG4gICAgICAgIGNvbnN0IGNsaWVudCA9IGF3YWl0IGdldEFQSUNsaWVudCgpO1xuICAgICAgICBjb25zdCBwcm9maWxlID0gYXdhaXQgY2xpZW50LmdldFByb2ZpbGUoKTtcbiAgICAgICAgLy8gQ2FjaGUgdGhlIHByb2ZpbGVcbiAgICAgICAgYXdhaXQgc2V0Q2FjaGVkUHJvZmlsZShwcm9maWxlKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogcHJvZmlsZSB9O1xuICAgIH1cbiAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH07XG4gICAgfVxufVxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlR2V0U2V0dGluZ3MoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogYXdhaXQgZ2V0U2V0dGluZ3MoKSB9O1xuICAgIH1cbiAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH07XG4gICAgfVxufVxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlSW1wb3J0Sm9iKGpvYikge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IGF3YWl0IGdldEFQSUNsaWVudCgpO1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBjbGllbnQuaW1wb3J0Sm9iKGpvYik7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHJlc3VsdCB9O1xuICAgIH1cbiAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH07XG4gICAgfVxufVxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlSW1wb3J0Sm9ic0JhdGNoKGpvYnMpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBjbGllbnQgPSBhd2FpdCBnZXRBUElDbGllbnQoKTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY2xpZW50LmltcG9ydEpvYnNCYXRjaChqb2JzKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogcmVzdWx0IH07XG4gICAgfVxuICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfTtcbiAgICB9XG59XG5hc3luYyBmdW5jdGlvbiBoYW5kbGVUcmFja0FwcGxpZWQocGF5bG9hZCkge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IGF3YWl0IGdldEFQSUNsaWVudCgpO1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBjbGllbnQudHJhY2tBcHBsaWVkKHBheWxvYWQpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiByZXN1bHQgfTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9O1xuICAgIH1cbn1cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZU9wZW5EYXNoYm9hcmQoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgYXBpQmFzZVVybCA9IGF3YWl0IGdldEFwaUJhc2VVcmwoKTtcbiAgICAgICAgYXdhaXQgY2hyb21lLnRhYnMuY3JlYXRlKHsgdXJsOiBgJHthcGlCYXNlVXJsfS9kYXNoYm9hcmRgIH0pO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH07XG4gICAgfVxuICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfTtcbiAgICB9XG59XG5hc3luYyBmdW5jdGlvbiBoYW5kbGVDYXB0dXJlVmlzaWJsZVRhYigpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBkYXRhVXJsID0gYXdhaXQgY2hyb21lLnRhYnMuY2FwdHVyZVZpc2libGVUYWIodW5kZWZpbmVkLCB7XG4gICAgICAgICAgICBmb3JtYXQ6IFwianBlZ1wiLFxuICAgICAgICAgICAgcXVhbGl0eTogMzUsXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGRhdGFVcmwgfSB9O1xuICAgIH1cbiAgICBjYXRjaCB7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlIH07XG4gICAgfVxufVxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU2F2ZUFuc3dlcihkYXRhKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY2xpZW50ID0gYXdhaXQgZ2V0QVBJQ2xpZW50KCk7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGNsaWVudC5zYXZlTGVhcm5lZEFuc3dlcih7XG4gICAgICAgICAgICBxdWVzdGlvbjogZGF0YS5xdWVzdGlvbixcbiAgICAgICAgICAgIGFuc3dlcjogZGF0YS5hbnN3ZXIsXG4gICAgICAgICAgICBzb3VyY2VVcmw6IGRhdGEudXJsLFxuICAgICAgICAgICAgc291cmNlQ29tcGFueTogZGF0YS5jb21wYW55LFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogcmVzdWx0IH07XG4gICAgfVxuICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfTtcbiAgICB9XG59XG5hc3luYyBmdW5jdGlvbiBoYW5kbGVTZWFyY2hBbnN3ZXJzKHF1ZXN0aW9uKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY2xpZW50ID0gYXdhaXQgZ2V0QVBJQ2xpZW50KCk7XG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCBjbGllbnQuc2VhcmNoU2ltaWxhckFuc3dlcnMocXVlc3Rpb24pO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiByZXN1bHRzIH07XG4gICAgfVxuICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfTtcbiAgICB9XG59XG5hc3luYyBmdW5jdGlvbiBoYW5kbGVNYXRjaEFuc3dlckJhbmsocGF5bG9hZCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICghcGF5bG9hZD8ucT8udHJpbSgpKSB7XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IFwiUXVlc3Rpb24gaXMgcmVxdWlyZWRcIiB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IGF3YWl0IGdldEFQSUNsaWVudCgpO1xuICAgICAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgY2xpZW50Lm1hdGNoQW5zd2VyQmFuayhwYXlsb2FkLnEsIHBheWxvYWQubGltaXQpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiByZXN1bHRzIH07XG4gICAgfVxuICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfTtcbiAgICB9XG59XG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRMZWFybmVkQW5zd2VycygpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBjbGllbnQgPSBhd2FpdCBnZXRBUElDbGllbnQoKTtcbiAgICAgICAgY29uc3QgYW5zd2VycyA9IGF3YWl0IGNsaWVudC5nZXRMZWFybmVkQW5zd2VycygpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiBhbnN3ZXJzIH07XG4gICAgfVxuICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfTtcbiAgICB9XG59XG5hc3luYyBmdW5jdGlvbiBoYW5kbGVEZWxldGVBbnN3ZXIoaWQpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBjbGllbnQgPSBhd2FpdCBnZXRBUElDbGllbnQoKTtcbiAgICAgICAgYXdhaXQgY2xpZW50LmRlbGV0ZUxlYXJuZWRBbnN3ZXIoaWQpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH07XG4gICAgfVxuICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfTtcbiAgICB9XG59XG5hc3luYyBmdW5jdGlvbiBoYW5kbGVTYXZlQ29ycmVjdGlvbihwYXlsb2FkKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY2xpZW50ID0gYXdhaXQgZ2V0QVBJQ2xpZW50KCk7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGNsaWVudC5zYXZlQ29ycmVjdGlvbihwYXlsb2FkKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogcmVzdWx0IH07XG4gICAgfVxuICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfTtcbiAgICB9XG59XG4vLyAtLS0tLSBNdWx0aS1zdGVwIChQMyAvICMzNiAjMzcpIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgdGhlIGB3ZWJOYXZpZ2F0aW9uYCBwZXJtaXNzaW9uIGlzIGdyYW50ZWQgcmlnaHQgbm93LlxuICogSW4gQ2hyb21lIE1WMyB0aGlzIGlzIGFsd2F5cyB0cnVlIGJlY2F1c2UgdGhlIHBlcm1pc3Npb24gaXMgaW4gdGhlXG4gKiByZXF1aXJlZCBgcGVybWlzc2lvbnNgIGFycmF5LiBJbiBGaXJlZm94IE1WMiBpdCdzIGluIGBvcHRpb25hbF9wZXJtaXNzaW9uc2BcbiAqIGFuZCB0aGUgdXNlciBtYXkgbm90IGhhdmUgYXBwcm92ZWQgaXQgeWV0LlxuICovXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVIYXNXZWJOYXZpZ2F0aW9uUGVybWlzc2lvbigpIHtcbiAgICB0cnkge1xuICAgICAgICAvLyBjaHJvbWUucGVybWlzc2lvbnMgZXhpc3RzIGluIGJvdGggTVYyICh2aWEgdGhlIHBvbHlmaWxsKSBhbmQgTVYzLlxuICAgICAgICBjb25zdCBncmFudGVkID0gYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY2hyb21lLnBlcm1pc3Npb25zLmNvbnRhaW5zKHsgcGVybWlzc2lvbnM6IFtcIndlYk5hdmlnYXRpb25cIl0gfSwgKGhhcykgPT4gcmVzb2x2ZSghIWhhcykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2gge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogeyBncmFudGVkIH0gfTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9O1xuICAgIH1cbn1cbi8qKlxuICogQXNrIHRoZSBicm93c2VyIHRvIHJlcXVlc3QgYHdlYk5hdmlnYXRpb25gLiBJbiBDaHJvbWUgTVYzIHRoZSBwZXJtaXNzaW9uXG4gKiBpcyByZXF1aXJlZCBhdCBpbnN0YWxsIHRpbWUgc28gdGhpcyByZXNvbHZlcyBpbnN0YW50bHkgd2l0aCB0cnVlLiBJblxuICogRmlyZWZveCBNVjIgdGhlIGJyb3dzZXIgc2hvd3MgYSBwZXJtaXNzaW9uIHByb21wdCBhbmQgdGhlIHJlc29sdmVkIHZhbHVlXG4gKiByZWZsZWN0cyB0aGUgdXNlcidzIHZlcmRpY3Qg4oCUIGEgXCJOb1wiIGxlYXZlcyB1cyBvbiB0aGUgcHJvbXB0ZWQtdG9hc3RcbiAqIGZhbGxiYWNrIHBhdGgsIHdoaWNoIGlzIGV4YWN0bHkgd2hhdCB3ZSB3YW50LlxuICpcbiAqIEltcG9ydGFudDogYGNocm9tZS5wZXJtaXNzaW9ucy5yZXF1ZXN0YCBtdXN0IGJlIGNhbGxlZCBmcm9tIGEgdXNlci1nZXN0dXJlXG4gKiBjb250ZXh0LiBUaGUgRmlyZWZveCBiYWNrZ3JvdW5kIGNhbiBkbyB0aGlzIGlmIGludm9rZWQgZnJvbSBhIGNvbnRlbnQtXG4gKiBzY3JpcHQgbWVzc2FnZSBoYW5kbGVyIHRoYXQgZmlyZWQgaW5zaWRlIGEgYnV0dG9uIGNsaWNrOyBpZiBGaXJlZm94XG4gKiByZWplY3RzIHdpdGggXCJtYXkgb25seSBiZSBjYWxsZWQgZnJvbSBhIHVzZXIgaW5wdXQgaGFuZGxlclwiIHRoZVxuICogY29udHJvbGxlciBjYXRjaGVzIHRoZSBmYWlsdXJlIGFuZCBjb250aW51ZXMgd2l0aCB0aGUgZmFsbGJhY2sgcGF0aC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gaGFuZGxlUmVxdWVzdFdlYk5hdmlnYXRpb25QZXJtaXNzaW9uKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGdyYW50ZWQgPSBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjaHJvbWUucGVybWlzc2lvbnMucmVxdWVzdCh7IHBlcm1pc3Npb25zOiBbXCJ3ZWJOYXZpZ2F0aW9uXCJdIH0sIChoYXMpID0+IHJlc29sdmUoISFoYXMpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChncmFudGVkKSB7XG4gICAgICAgICAgICBhdHRhY2hXZWJOYXZpZ2F0aW9uTGlzdGVuZXIoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB7IGdyYW50ZWQgfSB9O1xuICAgIH1cbiAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH07XG4gICAgfVxufVxubGV0IHdlYk5hdmlnYXRpb25MaXN0ZW5lckF0dGFjaGVkID0gZmFsc2U7XG4vKipcbiAqIFN1YnNjcmliZSB0byBgd2ViTmF2aWdhdGlvbi5vbkhpc3RvcnlTdGF0ZVVwZGF0ZWRgLiBNdWx0aS1zdGVwIEFUU2VzIGRyaXZlXG4gKiBzdGVwIHRyYW5zaXRpb25zIHZpYSBgaGlzdG9yeS5wdXNoU3RhdGVgLCBzbyB0aGlzIGlzIHRoZSByaWdodCBldmVudCB0b1xuICogd2F0Y2gg4oCUIGBvbkNvbXBsZXRlZGAgb25seSBmaXJlcyBmb3IgZnVsbCBkb2N1bWVudCBsb2Fkcy5cbiAqXG4gKiBJZGVtcG90ZW50OiBzYWZlIHRvIGNhbGwgYWZ0ZXIgZXZlcnkgaW5zdGFsbC91cGRhdGUgYW5kIGFmdGVyIGV2ZXJ5XG4gKiBwZXJtaXNzaW9uIGdyYW50LiBXcmFwcGVkIGluIHRyeS9jYXRjaCBiZWNhdXNlIHRoZSBBUEkgbWF5IG5vdCBiZVxuICogYXZhaWxhYmxlIGluIE1WMiB1bnRpbCB0aGUgdXNlciBncmFudHMgdGhlIG9wdGlvbmFsIHBlcm1pc3Npb24uXG4gKi9cbmZ1bmN0aW9uIGF0dGFjaFdlYk5hdmlnYXRpb25MaXN0ZW5lcigpIHtcbiAgICBpZiAod2ViTmF2aWdhdGlvbkxpc3RlbmVyQXR0YWNoZWQpXG4gICAgICAgIHJldHVybjtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGNocm9tZS53ZWJOYXZpZ2F0aW9uID09PSBcInVuZGVmaW5lZFwiIHx8XG4gICAgICAgICAgICAhY2hyb21lLndlYk5hdmlnYXRpb24ub25IaXN0b3J5U3RhdGVVcGRhdGVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY2hyb21lLndlYk5hdmlnYXRpb24ub25IaXN0b3J5U3RhdGVVcGRhdGVkLmFkZExpc3RlbmVyKChkZXRhaWxzKSA9PiB7XG4gICAgICAgICAgICBpZiAoZGV0YWlscy5mcmFtZUlkICE9PSAwICYmIGRldGFpbHMuZnJhbWVJZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgLy8gV2Ugb25seSBjYXJlIGFib3V0IHRoZSB0b3AgZnJhbWUgaGVyZS4gSWZyYW1lZCBHcmVlbmhvdXNlIGlzXG4gICAgICAgICAgICAgICAgLy8gaGFuZGxlZCBieSB0aGUgcGVyLXByb3ZpZGVyIE11dGF0aW9uT2JzZXJ2ZXIgaW5zaWRlIHRoZSBjb250ZW50XG4gICAgICAgICAgICAgICAgLy8gc2NyaXB0LlxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZvaWQgbm90aWZ5VGFiT2ZTdGVwVHJhbnNpdGlvbihkZXRhaWxzLnRhYklkLCBkZXRhaWxzLnVybCk7XG4gICAgICAgIH0pO1xuICAgICAgICB3ZWJOYXZpZ2F0aW9uTGlzdGVuZXJBdHRhY2hlZCA9IHRydWU7XG4gICAgfVxuICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc29sZS53YXJuKFwiW1Nsb3RoaW5nXSB3ZWJOYXZpZ2F0aW9uIGxpc3RlbmVyIGF0dGFjaCBmYWlsZWQ6XCIsIGVycik7XG4gICAgfVxufVxuYXN5bmMgZnVuY3Rpb24gbm90aWZ5VGFiT2ZTdGVwVHJhbnNpdGlvbih0YWJJZCwgdXJsKSB7XG4gICAgLy8gT25seSBmaXJlIHdoZW4gdGhlIHRhYiBoYXMgYW4gaW4tcHJvZ3Jlc3MgbXVsdGktc3RlcCBzZXNzaW9uIOKAlCBrZWVwc1xuICAgIC8vIHVzIGZyb20gc3BhbW1pbmcgZXZlcnkgdGFiIG9uIGV2ZXJ5IGhpc3RvcnkgZXZlbnQuXG4gICAgY29uc3Qgc2Vzc2lvbnMgPSBhd2FpdCBsaXN0U2Vzc2lvbnMoKTtcbiAgICBpZiAoIXNlc3Npb25zLnNvbWUoKHMpID0+IHMudGFiSWQgPT09IHRhYklkKSlcbiAgICAgICAgcmV0dXJuO1xuICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYklkLCB7XG4gICAgICAgICAgICB0eXBlOiBcIk1VTFRJU1RFUF9TVEVQX1RSQU5TSVRJT05cIixcbiAgICAgICAgICAgIHBheWxvYWQ6IHsgdXJsLCB0cmFuc2l0aW9uVHlwZTogXCJ3ZWJOYXZpZ2F0aW9uXCIgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGNhdGNoIHtcbiAgICAgICAgLy8gVGFiIG1pZ2h0IGJlIGNsb3NlZCBvciB0aGUgY29udGVudCBzY3JpcHQgbWlnaHQgbm90IGJlIGxvYWRlZCB5ZXQg4oCUXG4gICAgICAgIC8vIGJvdGggYXJlIG5vbi1mYXRhbC5cbiAgICB9XG59XG4vLyBUcnkgdG8gYXR0YWNoIG9uIHN0YXJ0dXAuIElmIHRoZSBwZXJtaXNzaW9uIGlzbid0IGdyYW50ZWQgeWV0IChGaXJlZm94XG4vLyBmaXJzdCBydW4pIHRoaXMgaXMgYSBuby1vcDsgdGhlIGxpc3RlbmVyIGF0dGFjaGVzIGxhemlseSB3aGVuIHRoZSB1c2VyXG4vLyBhcHByb3ZlcyB2aWEgYGhhbmRsZVJlcXVlc3RXZWJOYXZpZ2F0aW9uUGVybWlzc2lvbmAuXG5hdHRhY2hXZWJOYXZpZ2F0aW9uTGlzdGVuZXIoKTtcbi8vIENsZWFyIHRoZSBpbi1mbGlnaHQgc2Vzc2lvbiB3aGVuIGl0cyB0YWIgY2xvc2VzLiB3ZWJOYXZpZ2F0aW9uJ3Ncbi8vIGBvbkhpc3RvcnlTdGF0ZVVwZGF0ZWRgIGFsc28gZmlyZXMgZm9yIGJhY2svZm9yd2FyZCBpbnNpZGUgdGhlIHNhbWUgdGFiO1xuLy8gd2UgZGVsaWJlcmF0ZWx5IGtlZXAgdGhlIHNlc3Npb24gaW4gdGhhdCBjYXNlIHNvIHRoZSB1c2VyIGRvZXNuJ3QgbG9zZVxuLy8gc3RhdGUgYnkgYWNjaWRlbnRhbGx5IGhpdHRpbmcgQmFjay5cbmNocm9tZS50YWJzLm9uUmVtb3ZlZC5hZGRMaXN0ZW5lcigodGFiSWQpID0+IHtcbiAgICB2b2lkIGNsZWFyU2Vzc2lvbih0YWJJZCk7XG59KTtcbi8vIFN3ZWVwIHN0YWxlIHNlc3Npb25zIG9uIHNlcnZpY2Utd29ya2VyIHN0YXJ0dXAuIE5vdCBzdHJpY3RseSBuZWNlc3Nhcnkg4oCUXG4vLyBgZ2V0U2Vzc2lvbmAgYWxyZWFkeSBldmljdHMgZXhwaXJlZCBlbnRyaWVzIG9uIHJlYWQg4oCUIGJ1dCBpdCBrZWVwcyB0aGVcbi8vIHN0b3JhZ2UgYXJlYSBzbWFsbCBhZnRlciBhIGNyYXNoLlxudm9pZCBwdXJnZUV4cGlyZWRTZXNzaW9ucygpO1xuLyoqXG4gKiBQNC8jNDAg4oCUIExvbmctbGl2ZWQgcG9ydCBoYW5kbGVyIGZvciB0aGUgaW5saW5lIEFJIGFzc2lzdGFudC5cbiAqXG4gKiBUaGUgY29udGVudC1zY3JpcHQgc2lkZWJhciBvcGVucyBgY2hyb21lLnJ1bnRpbWUuY29ubmVjdCh7bmFtZTpcbiAqIENIQVRfUE9SVF9OQU1FfSlgIGFuZCBwb3N0cyBhIENIQVRfU1RSRUFNX1NUQVJUIGZyYW1lLiBXZSB0cmFuc2xhdGUgdGhhdFxuICogaW50byBhbiBTU0UgY2FsbCB2aWEgYXBpLWNsaWVudC5jaGF0KCkgYW5kIHN0cmVhbSB0b2tlbnMgYmFjayBvbiB0aGUgc2FtZVxuICogcG9ydCB1bnRpbCB0aGUgZ2VuZXJhdG9yIGNvbXBsZXRlcyAoQ0hBVF9TVFJFQU1fRU5EKSBvciB0aHJvd3NcbiAqIChDSEFUX1NUUkVBTV9FUlJPUikuIElmIHRoZSBjb250ZW50LXNjcmlwdCBkaXNjb25uZWN0cyBtaWQtc3RyZWFtIHdlIHNldCBhXG4gKiBjYW5jZWxsZWQgZmxhZyBzbyB0aGUgaXRlcmF0b3Igc3RvcHMgZW5xdWV1ZWluZy5cbiAqL1xuY2hyb21lLnJ1bnRpbWUub25Db25uZWN0LmFkZExpc3RlbmVyKChwb3J0KSA9PiB7XG4gICAgaWYgKHBvcnQubmFtZSAhPT0gQ0hBVF9QT1JUX05BTUUpXG4gICAgICAgIHJldHVybjtcbiAgICBsZXQgY2FuY2VsbGVkID0gZmFsc2U7XG4gICAgcG9ydC5vbkRpc2Nvbm5lY3QuYWRkTGlzdGVuZXIoKCkgPT4ge1xuICAgICAgICBjYW5jZWxsZWQgPSB0cnVlO1xuICAgIH0pO1xuICAgIHBvcnQub25NZXNzYWdlLmFkZExpc3RlbmVyKChtZXNzYWdlKSA9PiB7XG4gICAgICAgIGlmIChtZXNzYWdlLnR5cGUgIT09IFwiQ0hBVF9TVFJFQU1fU1RBUlRcIilcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgdm9pZCBydW5DaGF0U3RyZWFtKHBvcnQsIG1lc3NhZ2UsICgpID0+IGNhbmNlbGxlZCkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiW1Nsb3RoaW5nXSBjaGF0IHN0cmVhbSBmYWlsdXJlOlwiLCBlcnJvcik7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufSk7XG5hc3luYyBmdW5jdGlvbiBydW5DaGF0U3RyZWFtKHBvcnQsIG1lc3NhZ2UsIGlzQ2FuY2VsbGVkKSB7XG4gICAgY29uc3Qgc2FmZVBvc3QgPSAoZnJhbWUpID0+IHtcbiAgICAgICAgaWYgKGlzQ2FuY2VsbGVkKCkpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBwb3J0LnBvc3RNZXNzYWdlKGZyYW1lKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIHtcbiAgICAgICAgICAgIC8vIFBvcnQgY2xvc2VkIGJldHdlZW4gY2FuY2VsbGF0aW9uIGNoZWNrcyDigJQgYmFpbCBvdXQgcXVpZXRseS5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY2xpZW50ID0gYXdhaXQgZ2V0QVBJQ2xpZW50KCk7XG4gICAgICAgIGNvbnN0IGl0ZXJhdG9yID0gY2xpZW50LmNoYXQobWVzc2FnZS5wcm9tcHQsIG1lc3NhZ2Uuam9iQ29udGV4dCk7XG4gICAgICAgIGZvciBhd2FpdCAoY29uc3QgdG9rZW4gb2YgaXRlcmF0b3IpIHtcbiAgICAgICAgICAgIGlmIChpc0NhbmNlbGxlZCgpKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIGlmICghc2FmZVBvc3QoeyB0eXBlOiBcIkNIQVRfU1RSRUFNX1RPS0VOXCIsIHRva2VuIH0pKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBzYWZlUG9zdCh7IHR5cGU6IFwiQ0hBVF9TVFJFQU1fRU5EXCIgfSk7XG4gICAgfVxuICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICBzYWZlUG9zdCh7XG4gICAgICAgICAgICB0eXBlOiBcIkNIQVRfU1RSRUFNX0VSUk9SXCIsXG4gICAgICAgICAgICBlcnJvcjogbWVzc2FnZUZvckVycm9yKGVycm9yKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGZpbmFsbHkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcG9ydC5kaXNjb25uZWN0KCk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2gge1xuICAgICAgICAgICAgLy8gQWxyZWFkeSBkaXNjb25uZWN0ZWQg4oCUIG5vdGhpbmcgdG8gZG8uXG4gICAgICAgIH1cbiAgICB9XG59XG4vLyBIYW5kbGUgYXV0aCBjYWxsYmFjayBmcm9tIFNsb3RoaW5nIHdlYiBhcHBcbmNocm9tZS5ydW50aW1lLm9uTWVzc2FnZUV4dGVybmFsLmFkZExpc3RlbmVyKChtZXNzYWdlLCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xuICAgIGlmIChtZXNzYWdlLnR5cGUgPT09IFwiQVVUSF9DQUxMQkFDS1wiICYmXG4gICAgICAgIG1lc3NhZ2UudG9rZW4gJiZcbiAgICAgICAgbWVzc2FnZS5leHBpcmVzQXQpIHtcbiAgICAgICAgc2V0QXV0aFRva2VuKG1lc3NhZ2UudG9rZW4sIG1lc3NhZ2UuZXhwaXJlc0F0LCBhdXRoQ2FsbGJhY2tCYXNlVXJsKG1lc3NhZ2UuYXBpQmFzZVVybCwgc2VuZGVyLnVybCkpXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICByZXNldEFQSUNsaWVudCgpO1xuICAgICAgICAgICAgbm90aWZ5QXV0aFN0YXR1c0NoYW5nZWQoKTtcbiAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUgfSk7XG4gICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG59KTtcbmZ1bmN0aW9uIG5vdGlmeUF1dGhTdGF0dXNDaGFuZ2VkKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHsgdHlwZTogXCJBVVRIX1NUQVRVU19DSEFOR0VEXCIgfSwgKCkgPT4ge1xuICAgICAgICAgICAgLy8gTm8gcG9wdXAgbWF5IGJlIG9wZW47IGNvbnN1bWUgbGFzdEVycm9yIHNvIENocm9tZSBkb2VzIG5vdCBsb2cgbm9pc2UuXG4gICAgICAgICAgICB2b2lkIGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcjtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGNhdGNoIHtcbiAgICAgICAgLy8gTm8gYWN0aXZlIGV4dGVuc2lvbiBwYWdlIGxpc3RlbmVycy5cbiAgICB9XG59XG4vLyBIYW5kbGUga2V5Ym9hcmQgc2hvcnRjdXRzXG5jaHJvbWUuY29tbWFuZHMub25Db21tYW5kLmFkZExpc3RlbmVyKGFzeW5jIChjb21tYW5kKSA9PiB7XG4gICAgY29uc3QgW3RhYl0gPSBhd2FpdCBjaHJvbWUudGFicy5xdWVyeSh7IGFjdGl2ZTogdHJ1ZSwgY3VycmVudFdpbmRvdzogdHJ1ZSB9KTtcbiAgICBpZiAoIXRhYj8uaWQpXG4gICAgICAgIHJldHVybjtcbiAgICBzd2l0Y2ggKGNvbW1hbmQpIHtcbiAgICAgICAgY2FzZSBcImZpbGwtZm9ybVwiOlxuICAgICAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UodGFiLmlkLCB7IHR5cGU6IFwiVFJJR0dFUl9GSUxMXCIgfSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcImltcG9ydC1qb2JcIjpcbiAgICAgICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYi5pZCwgeyB0eXBlOiBcIlRSSUdHRVJfSU1QT1JUXCIgfSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG59KTtcbi8vIENsZWFyIGJhZGdlIHdoZW4gYSB0YWIgbmF2aWdhdGVzIHRvIGEgbmV3IFVSTFxuY2hyb21lLnRhYnMub25VcGRhdGVkLmFkZExpc3RlbmVyKCh0YWJJZCwgY2hhbmdlSW5mbykgPT4ge1xuICAgIGlmIChjaGFuZ2VJbmZvLnN0YXR1cyA9PT0gXCJsb2FkaW5nXCIgJiYgY2hhbmdlSW5mby51cmwpIHtcbiAgICAgICAgY2xlYXJCYWRnZUZvclRhYih0YWJJZCkuY2F0Y2goKCkgPT4geyB9KTtcbiAgICB9XG59KTtcbi8vIEhhbmRsZSBleHRlbnNpb24gaW5zdGFsbC91cGRhdGVcbmNocm9tZS5ydW50aW1lLm9uSW5zdGFsbGVkLmFkZExpc3RlbmVyKChkZXRhaWxzKSA9PiB7XG4gICAgaWYgKGRldGFpbHMucmVhc29uID09PSBcImluc3RhbGxcIikge1xuICAgICAgICBjb25zb2xlLmxvZyhcIltTbG90aGluZ10gRXh0ZW5zaW9uIGluc3RhbGxlZFwiKTtcbiAgICAgICAgLy8gQ291bGQgb3BlbiBvbmJvYXJkaW5nIHBhZ2UgaGVyZVxuICAgIH1cbiAgICBlbHNlIGlmIChkZXRhaWxzLnJlYXNvbiA9PT0gXCJ1cGRhdGVcIikge1xuICAgICAgICBjb25zb2xlLmxvZyhcIltTbG90aGluZ10gRXh0ZW5zaW9uIHVwZGF0ZWQgdG9cIiwgY2hyb21lLnJ1bnRpbWUuZ2V0TWFuaWZlc3QoKS52ZXJzaW9uKTtcbiAgICB9XG59KTtcbmNvbnNvbGUubG9nKFwiW1Nsb3RoaW5nXSBCYWNrZ3JvdW5kIHNlcnZpY2Ugd29ya2VyIHN0YXJ0ZWRcIik7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=