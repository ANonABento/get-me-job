/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// ./src/shared/field-patterns.ts
// Field detection patterns for auto-fill
const FIELD_PATTERNS = [
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
};
function detectJobSite(url) {
    for (const [site, patterns] of Object.entries(JOB_SITE_PATTERNS)) {
        if (patterns.some(p => p.test(url))) {
            return site;
        }
    }
    return 'unknown';
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
        const inputs = form.querySelectorAll('input, textarea, select');
        for (const input of inputs) {
            const element = input;
            // Skip hidden, disabled, or submit inputs
            if (this.shouldSkipElement(element))
                continue;
            const detection = this.detectFieldType(element);
            if (detection.fieldType !== 'unknown' || detection.confidence > 0.1) {
                fields.push(detection);
            }
        }
        return fields;
    }
    shouldSkipElement(element) {
        const input = element;
        // Check computed style for visibility
        const style = window.getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden') {
            return true;
        }
        // Check disabled state
        if (input.disabled)
            return true;
        // Check input type
        const skipTypes = ['hidden', 'submit', 'button', 'reset', 'image', 'file'];
        if (skipTypes.includes(input.type))
            return true;
        // Check if it's a CSRF/token field
        if (input.name?.includes('csrf') || input.name?.includes('token')) {
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
        let fieldType = best?.fieldType || 'unknown';
        let confidence = best?.confidence || 0;
        if (confidence < 0.3) {
            // Check if it looks like a custom question
            if (this.looksLikeCustomQuestion(signals)) {
                fieldType = 'customQuestion';
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
            name: element.name?.toLowerCase() || '',
            id: element.id?.toLowerCase() || '',
            type: element.type || 'text',
            placeholder: element.placeholder?.toLowerCase() || '',
            autocomplete: element.autocomplete || '',
            label: this.findLabel(element)?.toLowerCase() || '',
            ariaLabel: element.getAttribute('aria-label')?.toLowerCase() || '',
            nearbyText: this.getNearbyText(element)?.toLowerCase() || '',
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
        if (signals.autocomplete && pattern.autocompleteValues?.includes(signals.autocomplete)) {
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
        const parentLabel = element.closest('label');
        if (parentLabel?.textContent) {
            // Remove the input's value from label text
            const text = parentLabel.textContent.trim();
            const inputValue = element.value || '';
            return text.replace(inputValue, '').trim();
        }
        // Method 3: aria-labelledby
        const labelledBy = element.getAttribute('aria-labelledby');
        if (labelledBy) {
            const labelEl = document.getElementById(labelledBy);
            if (labelEl?.textContent)
                return labelEl.textContent.trim();
        }
        // Method 4: Previous sibling label
        let sibling = element.previousElementSibling;
        while (sibling) {
            if (sibling.tagName === 'LABEL') {
                return sibling.textContent?.trim() || null;
            }
            sibling = sibling.previousElementSibling;
        }
        // Method 5: Parent's previous sibling label
        const parent = element.parentElement;
        if (parent) {
            let parentSibling = parent.previousElementSibling;
            if (parentSibling?.tagName === 'LABEL') {
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
                classes.push(...current.className.split(' ').filter(Boolean));
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
        const parts = location.split(',').map((p) => p.trim());
        return parts[0] || null;
    }
    extractState(location) {
        if (!location)
            return null;
        const parts = location.split(',').map((p) => p.trim());
        if (parts.length >= 2) {
            // Handle "CA" or "California" or "CA 94105"
            const state = parts[1].split(' ')[0];
            return state || null;
        }
        return null;
    }
    extractCountry(location) {
        if (!location)
            return null;
        const parts = location.split(',').map((p) => p.trim());
        if (parts.length >= 3) {
            return parts[parts.length - 1];
        }
        // Default to USA if only city/state
        if (parts.length === 2) {
            return 'United States';
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
            .join('\n');
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

;// ./src/content/auto-fill/engine.ts
// Auto-fill engine orchestrator
class AutoFillEngine {
    constructor(detector, mapper) {
        this.detector = detector;
        this.mapper = mapper;
    }
    async fillForm(fields) {
        const result = {
            filled: 0,
            skipped: 0,
            errors: 0,
            details: [],
        };
        for (const field of fields) {
            try {
                const value = this.mapper.mapFieldToValue(field);
                if (!value) {
                    result.skipped++;
                    result.details.push({
                        fieldType: field.fieldType,
                        filled: false,
                    });
                    continue;
                }
                const filled = await this.fillField(field.element, value);
                if (filled) {
                    result.filled++;
                    result.details.push({
                        fieldType: field.fieldType,
                        filled: true,
                    });
                }
                else {
                    result.skipped++;
                    result.details.push({
                        fieldType: field.fieldType,
                        filled: false,
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
    async fillField(element, value) {
        const tagName = element.tagName.toLowerCase();
        const inputType = element.type?.toLowerCase() || 'text';
        // Handle different input types
        if (tagName === 'select') {
            return this.fillSelect(element, value);
        }
        if (tagName === 'textarea') {
            return this.fillTextInput(element, value);
        }
        if (tagName === 'input') {
            switch (inputType) {
                case 'text':
                case 'email':
                case 'tel':
                case 'url':
                case 'number':
                    return this.fillTextInput(element, value);
                case 'checkbox':
                    return this.fillCheckbox(element, value);
                case 'radio':
                    return this.fillRadio(element, value);
                case 'date':
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
        element.value = '';
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
        let matchingOption = options.find((opt) => opt.value.toLowerCase() === normalizedValue || opt.text.toLowerCase() === normalizedValue);
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
        const shouldCheck = ['true', 'yes', '1', 'on'].includes(value.toLowerCase());
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
            const radioLabel = this.getRadioLabel(radioInput)?.toLowerCase() || '';
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
        const formatted = date.toISOString().split('T')[0];
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
        const parent = radio.closest('label');
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
        element.dispatchEvent(new Event('focus', { bubbles: true }));
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        element.dispatchEvent(new Event('blur', { bubbles: true }));
        // For React controlled components
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
        if (nativeInputValueSetter && element instanceof HTMLInputElement) {
            const value = element.value;
            nativeInputValueSetter.call(element, value);
            element.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }
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
        if (lower.includes('intern') || lower.includes('internship') || lower.includes('co-op')) {
            return 'internship';
        }
        if (lower.includes('contract') || lower.includes('contractor')) {
            return 'contract';
        }
        if (lower.includes('part-time') || lower.includes('part time')) {
            return 'part-time';
        }
        if (lower.includes('full-time') || lower.includes('full time')) {
            return 'full-time';
        }
        return undefined;
    }
    detectRemote(text) {
        const lower = text.toLowerCase();
        return (lower.includes('remote') ||
            lower.includes('work from home') ||
            lower.includes('wfh') ||
            lower.includes('fully distributed') ||
            lower.includes('anywhere'));
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
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/p>/gi, '\n\n')
            .replace(/<\/div>/gi, '\n')
            .replace(/<\/li>/gi, '\n')
            .replace(/<[^>]+>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }
}

;// ./src/content/scrapers/linkedin-scraper.ts
// LinkedIn job scraper

class LinkedInScraper extends BaseScraper {
    constructor() {
        super(...arguments);
        this.source = 'linkedin';
        this.urlPatterns = [
            /linkedin\.com\/jobs\/view\/(\d+)/,
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
            await this.waitForElement('.job-details-jobs-unified-top-card__job-title, .jobs-unified-top-card__job-title', 3000);
        }
        catch {
            // Try alternative selectors
        }
        // Try multiple selector strategies (LinkedIn changes DOM frequently)
        const title = this.extractJobTitle();
        const company = this.extractCompany();
        const location = this.extractLocation();
        const description = this.extractDescription();
        if (!title || !company || !description) {
            console.log('[Columbus] LinkedIn scraper: Missing required fields', { title, company, description: !!description });
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
            remote: this.detectRemote(location || '') || this.detectRemote(description),
            url: window.location.href,
            source: this.source,
            sourceJobId: this.extractJobId(),
            postedAt: structuredData?.postedAt,
        };
    }
    async scrapeJobList() {
        const jobs = [];
        // Job cards in search results
        const jobCards = document.querySelectorAll('.job-card-container, .jobs-search-results__list-item, .scaffold-layout__list-item');
        for (const card of jobCards) {
            try {
                const titleEl = card.querySelector('.job-card-list__title, .job-card-container__link, a[data-control-name="job_card_title"]');
                const companyEl = card.querySelector('.job-card-container__company-name, .job-card-container__primary-description');
                const locationEl = card.querySelector('.job-card-container__metadata-item');
                const title = titleEl?.textContent?.trim();
                const company = companyEl?.textContent?.trim();
                const location = locationEl?.textContent?.trim();
                const url = titleEl?.href;
                if (title && company && url) {
                    jobs.push({
                        title,
                        company,
                        location,
                        description: '', // Would need to navigate to get full description
                        requirements: [],
                        url,
                        source: this.source,
                    });
                }
            }
            catch (err) {
                console.error('[Columbus] Error scraping job card:', err);
            }
        }
        return jobs;
    }
    extractJobTitle() {
        const selectors = [
            '.job-details-jobs-unified-top-card__job-title',
            '.jobs-unified-top-card__job-title',
            '.t-24.job-details-jobs-unified-top-card__job-title',
            'h1.t-24',
            '.jobs-top-card__job-title',
            'h1[class*="job-title"]',
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
            '.job-details-jobs-unified-top-card__company-name',
            '.jobs-unified-top-card__company-name',
            '.jobs-top-card__company-url',
            'a[data-tracking-control-name="public_jobs_topcard-org-name"]',
            '.job-details-jobs-unified-top-card__primary-description-container a',
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
            '.job-details-jobs-unified-top-card__bullet',
            '.jobs-unified-top-card__bullet',
            '.jobs-top-card__bullet',
            '.job-details-jobs-unified-top-card__primary-description-container .t-black--light',
        ];
        for (const selector of selectors) {
            const text = this.extractTextContent(selector);
            if (text && !text.includes('applicant') && !text.includes('ago')) {
                return text;
            }
        }
        return null;
    }
    extractDescription() {
        const selectors = [
            '.jobs-description__content',
            '.jobs-description-content__text',
            '.jobs-box__html-content',
            '#job-details',
            '.jobs-description',
        ];
        for (const selector of selectors) {
            const html = this.extractHtmlContent(selector);
            if (html) {
                return this.cleanDescription(html);
            }
        }
        return null;
    }
    extractJobId() {
        const match = window.location.href.match(/\/view\/(\d+)/);
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
                    ? `$${data.baseSalary.value.minValue || ''}-${data.baseSalary.value.maxValue || ''}`
                    : undefined,
                postedAt: data.datePosted,
            };
        }
        catch {
            return null;
        }
    }
}

;// ./src/content/scrapers/waterloo-works-scraper.ts
// Waterloo Works job scraper (University of Waterloo co-op portal)

class WaterlooWorksScraper extends BaseScraper {
    constructor() {
        super(...arguments);
        this.source = 'waterlooworks';
        this.urlPatterns = [/waterlooworks\.uwaterloo\.ca/];
    }
    canHandle(url) {
        return this.urlPatterns.some((p) => p.test(url));
    }
    async scrapeJobListing() {
        // Check if user is logged in
        if (this.isLoginPage()) {
            console.log('[Columbus] Waterloo Works: Please log in first');
            return null;
        }
        // Wait for job details to load
        try {
            await this.waitForElement('.posting-details, .job-posting-details, #postingDiv', 3000);
        }
        catch {
            console.log('[Columbus] Waterloo Works: Could not find job details');
            return null;
        }
        const title = this.extractJobTitle();
        const company = this.extractCompany();
        const description = this.extractDescription();
        if (!title || !company || !description) {
            console.log('[Columbus] Waterloo Works scraper: Missing required fields');
            return null;
        }
        const location = this.extractLocation();
        const deadline = this.extractDeadline();
        const details = this.extractDetailsTable();
        return {
            title,
            company,
            location: location || details.location,
            description,
            requirements: this.extractRequirements(description),
            keywords: this.extractKeywords(description),
            salary: details.salary,
            type: 'internship', // Waterloo Works is for co-op/internships
            remote: this.detectRemote(location || '') || this.detectRemote(description),
            url: window.location.href,
            source: this.source,
            sourceJobId: details.jobId,
            deadline,
        };
    }
    async scrapeJobList() {
        const jobs = [];
        // Check if logged in
        if (this.isLoginPage()) {
            console.log('[Columbus] Waterloo Works: Please log in to scrape job list');
            return jobs;
        }
        // Job listings are typically in a table
        const rows = document.querySelectorAll('.job-listing-table tbody tr, #postingsTable tbody tr, .orbisModuleBody table tbody tr');
        for (const row of rows) {
            try {
                const cells = row.querySelectorAll('td');
                if (cells.length < 3)
                    continue;
                // Typical structure: Job Title | Company | Location | Deadline | ...
                const titleCell = cells[0];
                const titleLink = titleCell.querySelector('a');
                const title = titleLink?.textContent?.trim() || titleCell.textContent?.trim();
                const url = titleLink?.href;
                const company = cells[1]?.textContent?.trim();
                const location = cells[2]?.textContent?.trim();
                const deadline = cells[3]?.textContent?.trim();
                if (title && company && url) {
                    jobs.push({
                        title,
                        company,
                        location,
                        description: '', // Need to navigate for full description
                        requirements: [],
                        url,
                        source: this.source,
                        type: 'internship',
                        deadline,
                    });
                }
            }
            catch (err) {
                console.error('[Columbus] Error scraping Waterloo Works row:', err);
            }
        }
        // Also try card-based layouts (newer UI)
        const cards = document.querySelectorAll('.job-card, .posting-card, [class*="posting-item"]');
        for (const card of cards) {
            try {
                const titleEl = card.querySelector('.job-title, .posting-title, h3, h4');
                const companyEl = card.querySelector('.employer-name, .company-name, [class*="employer"]');
                const locationEl = card.querySelector('.job-location, .location, [class*="location"]');
                const linkEl = card.querySelector('a[href*="posting"]');
                const title = titleEl?.textContent?.trim();
                const company = companyEl?.textContent?.trim();
                const location = locationEl?.textContent?.trim();
                const url = linkEl?.href;
                if (title && company && url) {
                    jobs.push({
                        title,
                        company,
                        location,
                        description: '',
                        requirements: [],
                        url,
                        source: this.source,
                        type: 'internship',
                    });
                }
            }
            catch (err) {
                console.error('[Columbus] Error scraping Waterloo Works card:', err);
            }
        }
        return jobs;
    }
    isLoginPage() {
        const url = window.location.href.toLowerCase();
        return (url.includes('login') ||
            url.includes('signin') ||
            url.includes('cas/') ||
            document.querySelector('input[type="password"]') !== null);
    }
    extractJobTitle() {
        const selectors = [
            '.posting-title',
            '.job-title',
            '#postingDiv h1',
            '.job-posting-details h1',
            '[class*="posting"] h1',
            'h1',
        ];
        for (const selector of selectors) {
            const text = this.extractTextContent(selector);
            if (text && text.length > 3 && text.length < 200) {
                return text;
            }
        }
        return null;
    }
    extractCompany() {
        const selectors = [
            '.employer-name',
            '.company-name',
            '.organization-name',
            '[class*="employer"]',
            'td:contains("Organization") + td',
            'th:contains("Organization") + td',
        ];
        for (const selector of selectors) {
            try {
                const text = this.extractTextContent(selector);
                if (text && text.length > 1)
                    return text;
            }
            catch {
                // Selector might be invalid
            }
        }
        // Try table-based extraction
        const rows = document.querySelectorAll('tr, .detail-row');
        for (const row of rows) {
            const text = row.textContent?.toLowerCase() || '';
            if (text.includes('organization') || text.includes('employer') || text.includes('company')) {
                const cells = row.querySelectorAll('td, .value, dd');
                if (cells.length > 0) {
                    const value = cells[cells.length - 1].textContent?.trim();
                    if (value && value.length > 1)
                        return value;
                }
            }
        }
        return null;
    }
    extractLocation() {
        const selectors = [
            '.job-location',
            '.location',
            '[class*="location"]',
        ];
        for (const selector of selectors) {
            const text = this.extractTextContent(selector);
            if (text)
                return text;
        }
        // Try table-based extraction
        const rows = document.querySelectorAll('tr, .detail-row');
        for (const row of rows) {
            const text = row.textContent?.toLowerCase() || '';
            if (text.includes('location') || text.includes('city') || text.includes('region')) {
                const cells = row.querySelectorAll('td, .value, dd');
                if (cells.length > 0) {
                    const value = cells[cells.length - 1].textContent?.trim();
                    if (value)
                        return value;
                }
            }
        }
        return null;
    }
    extractDescription() {
        const selectors = [
            '.job-description',
            '.posting-description',
            '#postingDiv .description',
            '.job-posting-details .description',
            '[class*="description"]',
        ];
        for (const selector of selectors) {
            const html = this.extractHtmlContent(selector);
            if (html && html.length > 50) {
                return this.cleanDescription(html);
            }
        }
        // Try to find the main content area
        const mainContent = document.querySelector('.posting-details, #postingDiv, .job-posting-details');
        if (mainContent) {
            const html = mainContent.innerHTML;
            return this.cleanDescription(html);
        }
        return null;
    }
    extractDeadline() {
        const selectors = [
            '.application-deadline',
            '.deadline',
            '[class*="deadline"]',
        ];
        for (const selector of selectors) {
            const text = this.extractTextContent(selector);
            if (text)
                return text;
        }
        // Try table-based extraction
        const rows = document.querySelectorAll('tr, .detail-row');
        for (const row of rows) {
            const text = row.textContent?.toLowerCase() || '';
            if (text.includes('deadline') || text.includes('apply by') || text.includes('due')) {
                const cells = row.querySelectorAll('td, .value, dd');
                if (cells.length > 0) {
                    const value = cells[cells.length - 1].textContent?.trim();
                    if (value)
                        return value;
                }
            }
        }
        return undefined;
    }
    extractDetailsTable() {
        const details = {};
        const rows = document.querySelectorAll('tr, .detail-row, dt');
        for (const row of rows) {
            const text = row.textContent?.toLowerCase() || '';
            let label = null;
            let value = null;
            // Handle dt/dd pairs
            if (row.tagName === 'DT') {
                label = row.textContent?.trim() || null;
                const dd = row.nextElementSibling;
                if (dd?.tagName === 'DD') {
                    value = dd.textContent?.trim() || null;
                }
            }
            else {
                // Handle table rows
                const cells = row.querySelectorAll('td, th');
                if (cells.length >= 2) {
                    label = cells[0].textContent?.trim()?.toLowerCase() || null;
                    value = cells[1].textContent?.trim() || null;
                }
            }
            if (label && value) {
                if (label.includes('job id') || label.includes('posting id')) {
                    details.jobId = value;
                }
                if (label.includes('location') || label.includes('city')) {
                    details.location = value;
                }
                if (label.includes('salary') || label.includes('compensation') || label.includes('pay')) {
                    details.salary = value;
                }
            }
        }
        return details;
    }
}

;// ./src/content/scrapers/indeed-scraper.ts
// Indeed job scraper

class IndeedScraper extends BaseScraper {
    constructor() {
        super(...arguments);
        this.source = 'indeed';
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
            console.log('[Columbus] Indeed scraper: Missing required fields', { title, company, description: !!description });
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
            salary: this.extractSalaryFromPage() || this.extractSalary(description) || structuredData?.salary,
            type: this.detectJobType(description),
            remote: this.detectRemote(location || '') || this.detectRemote(description),
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
                    const jobKey = card.getAttribute('data-jk');
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
                        description: '',
                        requirements: [],
                        url,
                        source: this.source,
                        sourceJobId: this.extractJobIdFromUrl(url),
                    });
                }
            }
            catch (err) {
                console.error('[Columbus] Error scraping Indeed job card:', err);
            }
        }
        return jobs;
    }
    extractJobTitle() {
        const selectors = [
            '.jobsearch-JobInfoHeader-title',
            '[data-testid="jobsearch-JobInfoHeader-title"]',
            'h1.jobsearch-JobInfoHeader-title',
            '.icl-u-xs-mb--xs h1',
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
            '.jobsearch-InlineCompanyRating-companyHeader a',
            '.jobsearch-InlineCompanyRating a',
            '.icl-u-lg-mr--sm a',
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
            '.jobsearch-JobInfoHeader-subtitle > div:nth-child(2)',
            '.jobsearch-InlineCompanyRating + div',
            '.icl-u-xs-mt--xs .icl-u-textColor--secondary',
        ];
        for (const selector of selectors) {
            const text = this.extractTextContent(selector);
            if (text && !text.includes('reviews') && !text.includes('rating')) {
                return text;
            }
        }
        return null;
    }
    extractDescription() {
        const selectors = [
            '#jobDescriptionText',
            '[data-testid="jobDescriptionText"]',
            '.jobsearch-jobDescriptionText',
            '.jobsearch-JobComponent-description',
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
            '.jobsearch-JobMetadataHeader-salaryInfo',
            '#salaryInfoAndJobType .attribute_snippet',
            '.jobsearch-JobInfoHeader-salary',
        ];
        for (const selector of selectors) {
            const text = this.extractTextContent(selector);
            if (text && text.includes('$')) {
                return text;
            }
        }
        return undefined;
    }
    extractJobId() {
        // From URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const jk = urlParams.get('jk');
        if (jk)
            return jk;
        // From URL path
        const match = window.location.href.match(/\/job\/([a-f0-9]+)/i);
        return match?.[1];
    }
    extractJobIdFromUrl(url) {
        try {
            const urlObj = new URL(url);
            const jk = urlObj.searchParams.get('jk');
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
            const jobData = Array.isArray(data) ? data.find((d) => d['@type'] === 'JobPosting') : data;
            if (!jobData || jobData['@type'] !== 'JobPosting')
                return null;
            return {
                location: jobData.jobLocation?.address?.addressLocality ||
                    jobData.jobLocation?.address?.name,
                salary: jobData.baseSalary?.value
                    ? `$${jobData.baseSalary.value.minValue || ''}-${jobData.baseSalary.value.maxValue || ''} ${jobData.baseSalary.value.unitText || ''}`
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
        this.source = 'greenhouse';
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
            await this.waitForElement('.app-title, #header .company-name, .job-title', 3000);
        }
        catch {
            // Continue with available data
        }
        const title = this.extractJobTitle();
        const company = this.extractCompany();
        const location = this.extractLocation();
        const description = this.extractDescription();
        if (!title || !company || !description) {
            console.log('[Columbus] Greenhouse scraper: Missing required fields', { title, company, description: !!description });
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
            remote: this.detectRemote(location || '') || this.detectRemote(description),
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
                const titleEl = card.querySelector('a, .opening-title, .job-title');
                const locationEl = card.querySelector('.location, .job-location, span:last-child');
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
                        description: '',
                        requirements: [],
                        url,
                        source: this.source,
                        sourceJobId: this.extractJobIdFromUrl(url),
                    });
                }
            }
            catch (err) {
                console.error('[Columbus] Error scraping Greenhouse job card:', err);
            }
        }
        return jobs;
    }
    extractJobTitle() {
        const selectors = [
            '.app-title',
            '.job-title',
            'h1.heading',
            '.job-info h1',
            '#header h1',
            'h1[class*="job"]',
            '.hero h1',
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
            '.company-name',
            '#header .company-name',
            '.logo-wrapper img[alt]',
            '.company-header .name',
            'meta[property="og:site_name"]',
        ];
        for (const selector of selectors) {
            if (selector.includes('meta')) {
                const meta = document.querySelector(selector);
                const content = meta?.getAttribute('content');
                if (content)
                    return content;
            }
            else if (selector.includes('img[alt]')) {
                const img = document.querySelector(selector);
                const alt = img?.getAttribute('alt');
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
        if (match && match[1] !== 'jobs') {
            return match[1].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        }
        return null;
    }
    extractLocation() {
        const selectors = [
            '.location',
            '.job-location',
            '.company-location',
            '.job-info .location',
            '#header .location',
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
            '#content',
            '.job-description',
            '.content-wrapper .content',
            '#job_description',
            '.job-content',
            '.job-info .content',
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
                const jobData = Array.isArray(data) ? data.find((d) => d['@type'] === 'JobPosting') : data;
                if (!jobData || jobData['@type'] !== 'JobPosting')
                    continue;
                const employmentType = jobData.employmentType?.toLowerCase();
                let type;
                if (employmentType?.includes('full'))
                    type = 'full-time';
                else if (employmentType?.includes('part'))
                    type = 'part-time';
                else if (employmentType?.includes('contract'))
                    type = 'contract';
                else if (employmentType?.includes('intern'))
                    type = 'internship';
                return {
                    title: jobData.title,
                    location: typeof jobData.jobLocation === 'string'
                        ? jobData.jobLocation
                        : jobData.jobLocation?.address?.addressLocality ||
                            jobData.jobLocation?.address?.name ||
                            jobData.jobLocation?.name,
                    salary: jobData.baseSalary?.value
                        ? `$${jobData.baseSalary.value.minValue || ''}-${jobData.baseSalary.value.maxValue || ''}`
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
        this.source = 'lever';
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
            await this.waitForElement('.posting-headline h2, .posting-headline h1, .section-wrapper', 3000);
        }
        catch {
            // Continue with available data
        }
        const title = this.extractJobTitle();
        const company = this.extractCompany();
        const location = this.extractLocation();
        const description = this.extractDescription();
        if (!title || !company || !description) {
            console.log('[Columbus] Lever scraper: Missing required fields', { title, company, description: !!description });
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
            type: this.detectJobTypeFromCommitment(commitment) || this.detectJobType(description),
            remote: this.detectRemote(location || '') || this.detectRemote(description),
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
                const locationEl = card.querySelector('.location, .posting-categories .sort-by-location, .workplaceTypes');
                const commitmentEl = card.querySelector('.commitment, .posting-categories .sort-by-commitment');
                const title = titleEl?.textContent?.trim();
                const location = locationEl?.textContent?.trim();
                const commitment = commitmentEl?.textContent?.trim();
                const url = card.querySelector('a.posting-title, a[data-qa="posting-name"]')?.href ||
                    card.href;
                const company = this.extractCompany();
                if (title && url && company) {
                    jobs.push({
                        title,
                        company,
                        location,
                        description: '',
                        requirements: [],
                        url,
                        source: this.source,
                        sourceJobId: this.extractJobIdFromUrl(url),
                        type: this.detectJobTypeFromCommitment(commitment ?? null),
                    });
                }
            }
            catch (err) {
                console.error('[Columbus] Error scraping Lever job card:', err);
            }
        }
        return jobs;
    }
    extractJobTitle() {
        const selectors = [
            '.posting-headline h2',
            '.posting-headline h1',
            '[data-qa="posting-name"]',
            '.posting-header h2',
            '.section.page-centered.posting-header h1',
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
        const logo = document.querySelector('.main-header-logo img, .posting-header .logo img, header img');
        if (logo) {
            const alt = logo.getAttribute('alt');
            if (alt && alt !== 'Company Logo')
                return alt;
        }
        // Try page title
        const pageTitle = document.title;
        if (pageTitle) {
            // Format: "Job Title - Company Name"
            const parts = pageTitle.split(' - ');
            if (parts.length >= 2) {
                return parts[parts.length - 1].replace(' Jobs', '').trim();
            }
        }
        // Extract from URL
        const match = window.location.href.match(/lever\.co\/([^/]+)/);
        if (match) {
            return match[1].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        }
        return null;
    }
    extractLocation() {
        const selectors = [
            '.posting-categories .location',
            '.posting-headline .location',
            '.sort-by-location',
            '.workplaceTypes',
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
            '.posting-categories .commitment',
            '.sort-by-commitment',
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
            '.posting-page .content',
            '.section-wrapper.page-full-width',
            '.section.page-centered',
            '[data-qa="job-description"]',
            '.posting-description',
        ];
        for (const selector of selectors) {
            // For Lever, we want to get all content sections
            const sections = document.querySelectorAll(selector);
            if (sections.length > 0) {
                const html = Array.from(sections)
                    .map((s) => s.innerHTML)
                    .join('\n\n');
                if (html.length > 100) {
                    return this.cleanDescription(html);
                }
            }
        }
        // Try getting the main content area
        const mainContent = document.querySelector('.content-wrapper .content, main .content');
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
        if (lower.includes('full-time') || lower.includes('full time'))
            return 'full-time';
        if (lower.includes('part-time') || lower.includes('part time'))
            return 'part-time';
        if (lower.includes('contract') || lower.includes('contractor'))
            return 'contract';
        if (lower.includes('intern'))
            return 'internship';
        return undefined;
    }
    extractStructuredData() {
        try {
            const ldJsonElements = document.querySelectorAll('script[type="application/ld+json"]');
            for (const el of ldJsonElements) {
                if (!el.textContent)
                    continue;
                const data = JSON.parse(el.textContent);
                const jobData = Array.isArray(data) ? data.find((d) => d['@type'] === 'JobPosting') : data;
                if (!jobData || jobData['@type'] !== 'JobPosting')
                    continue;
                return {
                    location: typeof jobData.jobLocation === 'string'
                        ? jobData.jobLocation
                        : jobData.jobLocation?.address?.addressLocality ||
                            jobData.jobLocation?.name,
                    salary: jobData.baseSalary?.value
                        ? `$${jobData.baseSalary.value.minValue || ''}-${jobData.baseSalary.value.maxValue || ''}`
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
        this.source = 'unknown';
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
            console.log('[Columbus] Generic scraper: Could not find required fields');
            return null;
        }
        const location = this.findLocation();
        return {
            title,
            company: company || 'Unknown Company',
            location: location || undefined,
            description,
            requirements: this.extractRequirements(description),
            keywords: this.extractKeywords(description),
            salary: this.extractSalary(description),
            type: this.detectJobType(description),
            remote: this.detectRemote(location || '') || this.detectRemote(description),
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
                const data = JSON.parse(script.textContent || '');
                // Handle single job posting
                if (data['@type'] === 'JobPosting') {
                    return this.parseJobPostingSchema(data);
                }
                // Handle array of items
                if (Array.isArray(data)) {
                    const jobPosting = data.find((item) => item['@type'] === 'JobPosting');
                    if (jobPosting) {
                        return this.parseJobPostingSchema(jobPosting);
                    }
                }
                // Handle @graph
                if (data['@graph']) {
                    const jobPosting = data['@graph'].find((item) => item['@type'] === 'JobPosting');
                    if (jobPosting) {
                        return this.parseJobPostingSchema(jobPosting);
                    }
                }
            }
        }
        catch (err) {
            console.log('[Columbus] Could not parse structured data:', err);
        }
        return null;
    }
    parseJobPostingSchema(data) {
        const title = data.title || '';
        const company = data.hiringOrganization?.name || '';
        const description = data.description || '';
        // Extract location
        let location;
        const jobLocation = data.jobLocation;
        if (jobLocation) {
            const address = jobLocation.address;
            if (address) {
                location = [address.addressLocality, address.addressRegion, address.addressCountry]
                    .filter(Boolean)
                    .join(', ');
            }
        }
        // Extract salary
        let salary;
        const baseSalary = data.baseSalary;
        if (baseSalary) {
            const value = baseSalary.value;
            if (value) {
                const currency = baseSalary.currency || 'USD';
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
        if (lower.includes('full'))
            return 'full-time';
        if (lower.includes('part'))
            return 'part-time';
        if (lower.includes('contract') || lower.includes('temporary'))
            return 'contract';
        if (lower.includes('intern'))
            return 'internship';
        return undefined;
    }
    findTitle() {
        // Common title selectors
        const selectors = [
            'h1[class*="title"]',
            'h1[class*="job"]',
            '.job-title',
            '.posting-title',
            '[class*="job-title"]',
            '[class*="posting-title"]',
            'h1',
        ];
        for (const selector of selectors) {
            const text = this.extractTextContent(selector);
            if (text && text.length > 3 && text.length < 200) {
                // Filter out common non-title content
                if (!text.toLowerCase().includes('sign in') && !text.toLowerCase().includes('log in')) {
                    return text;
                }
            }
        }
        // Try document title
        const docTitle = document.title;
        if (docTitle && docTitle.length > 5) {
            // Remove common suffixes
            const cleaned = docTitle
                .replace(/\s*[-|]\s*.+$/, '')
                .replace(/\s*at\s+.+$/i, '')
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
            '.company',
            '.employer',
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
            const content = ogSiteName.getAttribute('content');
            if (content)
                return content;
        }
        return null;
    }
    findDescription() {
        const selectors = [
            '.job-description',
            '.posting-description',
            '[class*="job-description"]',
            '[class*="posting-description"]',
            '[class*="description"]',
            'article',
            '.content',
            'main',
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
            '.location',
            '.job-location',
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
            .replace(/^www\./, '')
            .replace(/^jobs\./, '')
            .replace(/^careers\./, '');
        // Extract main domain
        const parts = cleaned.split('.');
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

;// ./src/shared/messages.ts
// Message passing utilities for extension communication
// Type-safe message creators
const Messages = {
    // Auth messages
    getAuthStatus: () => ({ type: 'GET_AUTH_STATUS' }),
    openAuth: () => ({ type: 'OPEN_AUTH' }),
    logout: () => ({ type: 'LOGOUT' }),
    // Profile messages
    getProfile: () => ({ type: 'GET_PROFILE' }),
    // Form filling messages
    fillForm: (fields) => ({
        type: 'FILL_FORM',
        payload: fields,
    }),
    // Scraping messages
    scrapeJob: () => ({ type: 'SCRAPE_JOB' }),
    scrapeJobList: () => ({ type: 'SCRAPE_JOB_LIST' }),
    importJob: (job) => ({
        type: 'IMPORT_JOB',
        payload: job,
    }),
    importJobsBatch: (jobs) => ({
        type: 'IMPORT_JOBS_BATCH',
        payload: jobs,
    }),
    // Learning messages
    saveAnswer: (data) => ({
        type: 'SAVE_ANSWER',
        payload: data,
    }),
    searchAnswers: (question) => ({
        type: 'SEARCH_ANSWERS',
        payload: question,
    }),
    jobDetected: (meta) => ({
        type: 'JOB_DETECTED',
        payload: meta,
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
                resolve(response || { success: false, error: 'No response received' });
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
                resolve(response || { success: false, error: 'No response received' });
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

;// ./src/content/index.ts
// Content script entry point for Columbus extension
// Import styles for content script






// Initialize components
const fieldDetector = new FieldDetector();
let autoFillEngine = null;
let cachedProfile = null;
let detectedFields = [];
let scrapedJob = null;
let jobDetectedForUrl = null;
// Scan page on load
scanPage();
// Re-scan on dynamic content changes
const observer = new MutationObserver(debounce(scanPage, 500));
observer.observe(document.body, { childList: true, subtree: true });
async function scanPage() {
    // Detect forms
    const forms = document.querySelectorAll('form');
    for (const form of forms) {
        const fields = fieldDetector.detectFields(form);
        if (fields.length > 0) {
            detectedFields = fields;
            console.log('[Columbus] Detected fields:', fields.length);
        }
    }
    // Check for job listing
    const scraper = getScraperForUrl(window.location.href);
    if (scraper.canHandle(window.location.href)) {
        try {
            scrapedJob = await scraper.scrapeJobListing();
            if (scrapedJob) {
                console.log('[Columbus] Scraped job:', scrapedJob.title);
                if (jobDetectedForUrl !== window.location.href) {
                    jobDetectedForUrl = window.location.href;
                    sendMessage(Messages.jobDetected({
                        title: scrapedJob.title,
                        company: scrapedJob.company,
                        url: scrapedJob.url,
                    })).catch((err) => console.error('[Columbus] Failed to notify job detected:', err));
                }
            }
        }
        catch (err) {
            console.error('[Columbus] Scrape error:', err);
        }
    }
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
        case 'GET_PAGE_STATUS':
            return {
                hasForm: detectedFields.length > 0,
                hasJobListing: scrapedJob !== null,
                detectedFields: detectedFields.length,
                scrapedJob,
            };
        case 'TRIGGER_FILL':
            return handleFillForm();
        case 'TRIGGER_IMPORT':
            if (scrapedJob) {
                return sendMessage(Messages.importJob(scrapedJob));
            }
            return { success: false, error: 'No job detected' };
        case 'SCRAPE_JOB':
            const scraper = getScraperForUrl(window.location.href);
            if (scraper.canHandle(window.location.href)) {
                scrapedJob = await scraper.scrapeJobListing();
                return { success: true, data: scrapedJob };
            }
            return { success: false, error: 'No scraper available for this site' };
        case 'SCRAPE_JOB_LIST':
            const listScraper = getScraperForUrl(window.location.href);
            if (listScraper.canHandle(window.location.href)) {
                const jobs = await listScraper.scrapeJobList();
                return { success: true, data: jobs };
            }
            return { success: false, error: 'No scraper available for this site' };
        default:
            return { success: false, error: `Unknown message type: ${message.type}` };
    }
}
async function handleFillForm() {
    if (detectedFields.length === 0) {
        return { success: false, error: 'No fields detected' };
    }
    // Get profile if not cached
    if (!cachedProfile) {
        const response = await sendMessage(Messages.getProfile());
        if (!response.success || !response.data) {
            return { success: false, error: 'Failed to load profile' };
        }
        cachedProfile = response.data;
    }
    // Create mapper and engine
    const mapper = new FieldMapper(cachedProfile);
    autoFillEngine = new AutoFillEngine(fieldDetector, mapper);
    // Fill the form
    const result = await autoFillEngine.fillForm(detectedFields);
    return { success: true, data: result };
}
// Utility: debounce function
function debounce(fn, delay) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
}
console.log('[Columbus] Content script loaded');

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudC5qcyIsIm1hcHBpbmdzIjoiOzs7O0FBQUE7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3JRQTtBQUNxRjtBQUM5RTtBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxjQUFjO0FBQzdCO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwrREFBK0QsV0FBVztBQUMxRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLGVBQWUsRUFBRSxxQkFBcUIsRUFBRSxtQkFBbUI7QUFDbkYsZUFBZSwwQkFBMEI7QUFDekM7QUFDQTs7O0FDbk1BO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0IsWUFBWSxLQUFLLFdBQVcsT0FBTyxnQkFBZ0I7QUFDckU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCLGVBQWU7QUFDcEMscUJBQXFCLGVBQWUsSUFBSSxZQUFZO0FBQ3BELHNCQUFzQixXQUFXLEtBQUssYUFBYSxHQUFHLE9BQU87QUFDN0QsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3RJQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhFQUE4RSxLQUFLO0FBQ25GO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0RBQStELFNBQVM7QUFDeEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1EQUFtRCxlQUFlO0FBQ2xFLG1EQUFtRCxlQUFlO0FBQ2xFLG9EQUFvRCxlQUFlO0FBQ25FLGtEQUFrRCxlQUFlO0FBQ2pFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1REFBdUQsZUFBZTtBQUN0RTtBQUNBO0FBQ0E7OztBQ3RMQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLDhDQUE4QyxnQ0FBZ0M7QUFDOUU7QUFDQTtBQUNBLDRDQUE0QyxVQUFVLGtCQUFrQixRQUFRO0FBQ2hGLGFBQWE7QUFDYixTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBNEI7QUFDNUIsMkJBQTJCO0FBQzNCLDBCQUEwQjtBQUMxQiwwQkFBMEI7QUFDMUIseUJBQXlCLEdBQUc7QUFDNUI7QUFDQTtBQUNBOzs7QUM3SEE7QUFDNkM7QUFDdEMsOEJBQThCLFdBQVc7QUFDaEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtGQUFrRiw0Q0FBNEM7QUFDOUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQkFBMEIscUNBQXFDLEdBQUcscUNBQXFDO0FBQ3ZHO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDcktBO0FBQzZDO0FBQ3RDLG1DQUFtQyxXQUFXO0FBQ3JEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDblNBO0FBQzZDO0FBQ3RDLDRCQUE0QixXQUFXO0FBQzlDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnRkFBZ0YsNENBQTRDO0FBQzVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtRUFBbUUsT0FBTztBQUMxRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMEJBQTBCLHdDQUF3QyxHQUFHLHlDQUF5QyxFQUFFLHdDQUF3QztBQUN4SjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3ROQTtBQUM2QztBQUN0QyxnQ0FBZ0MsV0FBVztBQUNsRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9GQUFvRiw0Q0FBNEM7QUFDaEk7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhCQUE4Qix3Q0FBd0MsR0FBRyx3Q0FBd0M7QUFDakg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN4TkE7QUFDNkM7QUFDdEMsMkJBQTJCLFdBQVc7QUFDN0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0VBQStFLDRDQUE0QztBQUMzSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4QkFBOEIsd0NBQXdDLEdBQUcsd0NBQXdDO0FBQ2pIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ25PQTtBQUM2QztBQUN0Qyw2QkFBNkIsV0FBVztBQUMvQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdDQUFnQyxVQUFVLEVBQUUsc0JBQXNCLElBQUkscUJBQXFCO0FBQzNGO0FBQ0E7QUFDQSxnQ0FBZ0MsVUFBVSxFQUFFLHVCQUF1QjtBQUNuRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDclBBO0FBQ3FEO0FBQ1c7QUFDZjtBQUNRO0FBQ1Y7QUFDSTtBQUNuRDtBQUNBO0FBQ0EsUUFBUSxlQUFlO0FBQ3ZCLFFBQVEsb0JBQW9CO0FBQzVCLFFBQVEsYUFBYTtBQUNyQixRQUFRLGlCQUFpQjtBQUN6QixRQUFRLFlBQVk7QUFDcEI7QUFDQSwyQkFBMkIsY0FBYztBQUN6QztBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTs7O0FDbENBO0FBQ0E7QUFDTztBQUNQO0FBQ0EsNEJBQTRCLHlCQUF5QjtBQUNyRCx1QkFBdUIsbUJBQW1CO0FBQzFDLHFCQUFxQixnQkFBZ0I7QUFDckM7QUFDQSx5QkFBeUIscUJBQXFCO0FBQzlDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0Esd0JBQXdCLG9CQUFvQjtBQUM1Qyw0QkFBNEIseUJBQXlCO0FBQ3JEO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQSwwQkFBMEIseURBQXlEO0FBQ25GO0FBQ0E7QUFDQSxzQ0FBc0MsK0NBQStDO0FBQ3JGO0FBQ0EsU0FBUztBQUNULEtBQUs7QUFDTDtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQSwwQkFBMEIseURBQXlEO0FBQ25GO0FBQ0E7QUFDQSxzQ0FBc0MsK0NBQStDO0FBQ3JGO0FBQ0EsU0FBUztBQUNULEtBQUs7QUFDTDtBQUNBO0FBQ087QUFDUCwyQ0FBMkM7QUFDM0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDOUVBO0FBQ0E7QUFDeUI7QUFDa0M7QUFDSjtBQUNIO0FBQ1c7QUFDTDtBQUMxRDtBQUNBLDBCQUEwQixhQUFhO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtDQUFrQyxnQ0FBZ0M7QUFDbEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixnQkFBZ0I7QUFDcEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsV0FBVyxDQUFDLFFBQVE7QUFDeEM7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVDQUF1QyxvQ0FBb0M7QUFDM0UsaUJBQWlCO0FBQ2pCLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVCQUF1QixXQUFXLENBQUMsUUFBUTtBQUMzQztBQUNBLHFCQUFxQjtBQUNyQjtBQUNBLDRCQUE0QixnQkFBZ0I7QUFDNUM7QUFDQTtBQUNBLHlCQUF5QjtBQUN6QjtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBLGdDQUFnQyxnQkFBZ0I7QUFDaEQ7QUFDQTtBQUNBLHlCQUF5QjtBQUN6QjtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBLHFCQUFxQixnREFBZ0QsYUFBYTtBQUNsRjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQSwrQkFBK0IsV0FBVyxDQUFDLFFBQVE7QUFDbkQ7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsV0FBVztBQUNsQyx5QkFBeUIsY0FBYztBQUN2QztBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vY29sdW1idXMtZXh0ZW5zaW9uLy4vc3JjL3NoYXJlZC9maWVsZC1wYXR0ZXJucy50cyIsIndlYnBhY2s6Ly9jb2x1bWJ1cy1leHRlbnNpb24vLi9zcmMvY29udGVudC9hdXRvLWZpbGwvZmllbGQtZGV0ZWN0b3IudHMiLCJ3ZWJwYWNrOi8vY29sdW1idXMtZXh0ZW5zaW9uLy4vc3JjL2NvbnRlbnQvYXV0by1maWxsL2ZpZWxkLW1hcHBlci50cyIsIndlYnBhY2s6Ly9jb2x1bWJ1cy1leHRlbnNpb24vLi9zcmMvY29udGVudC9hdXRvLWZpbGwvZW5naW5lLnRzIiwid2VicGFjazovL2NvbHVtYnVzLWV4dGVuc2lvbi8uL3NyYy9jb250ZW50L3NjcmFwZXJzL2Jhc2Utc2NyYXBlci50cyIsIndlYnBhY2s6Ly9jb2x1bWJ1cy1leHRlbnNpb24vLi9zcmMvY29udGVudC9zY3JhcGVycy9saW5rZWRpbi1zY3JhcGVyLnRzIiwid2VicGFjazovL2NvbHVtYnVzLWV4dGVuc2lvbi8uL3NyYy9jb250ZW50L3NjcmFwZXJzL3dhdGVybG9vLXdvcmtzLXNjcmFwZXIudHMiLCJ3ZWJwYWNrOi8vY29sdW1idXMtZXh0ZW5zaW9uLy4vc3JjL2NvbnRlbnQvc2NyYXBlcnMvaW5kZWVkLXNjcmFwZXIudHMiLCJ3ZWJwYWNrOi8vY29sdW1idXMtZXh0ZW5zaW9uLy4vc3JjL2NvbnRlbnQvc2NyYXBlcnMvZ3JlZW5ob3VzZS1zY3JhcGVyLnRzIiwid2VicGFjazovL2NvbHVtYnVzLWV4dGVuc2lvbi8uL3NyYy9jb250ZW50L3NjcmFwZXJzL2xldmVyLXNjcmFwZXIudHMiLCJ3ZWJwYWNrOi8vY29sdW1idXMtZXh0ZW5zaW9uLy4vc3JjL2NvbnRlbnQvc2NyYXBlcnMvZ2VuZXJpYy1zY3JhcGVyLnRzIiwid2VicGFjazovL2NvbHVtYnVzLWV4dGVuc2lvbi8uL3NyYy9jb250ZW50L3NjcmFwZXJzL3NjcmFwZXItcmVnaXN0cnkudHMiLCJ3ZWJwYWNrOi8vY29sdW1idXMtZXh0ZW5zaW9uLy4vc3JjL3NoYXJlZC9tZXNzYWdlcy50cyIsIndlYnBhY2s6Ly9jb2x1bWJ1cy1leHRlbnNpb24vLi9zcmMvY29udGVudC9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBGaWVsZCBkZXRlY3Rpb24gcGF0dGVybnMgZm9yIGF1dG8tZmlsbFxuZXhwb3J0IGNvbnN0IEZJRUxEX1BBVFRFUk5TID0gW1xuICAgIC8vIE5hbWUgZmllbGRzXG4gICAge1xuICAgICAgICB0eXBlOiAnZmlyc3ROYW1lJyxcbiAgICAgICAgYXV0b2NvbXBsZXRlVmFsdWVzOiBbJ2dpdmVuLW5hbWUnLCAnZmlyc3QtbmFtZSddLFxuICAgICAgICBuYW1lUGF0dGVybnM6IFsvZmlyc3QuP25hbWUvaSwgL2ZuYW1lL2ksIC9naXZlbi4/bmFtZS9pLCAvZm9yZW5hbWUvaV0sXG4gICAgICAgIGlkUGF0dGVybnM6IFsvZmlyc3QuP25hbWUvaSwgL2ZuYW1lL2ldLFxuICAgICAgICBsYWJlbFBhdHRlcm5zOiBbL2ZpcnN0XFxzKm5hbWUvaSwgL2dpdmVuXFxzKm5hbWUvaSwgL2ZvcmVuYW1lL2ldLFxuICAgICAgICBwbGFjZWhvbGRlclBhdHRlcm5zOiBbL2ZpcnN0XFxzKm5hbWUvaV0sXG4gICAgICAgIG5lZ2F0aXZlUGF0dGVybnM6IFsvbGFzdC9pLCAvY29tcGFueS9pLCAvbWlkZGxlL2ksIC9idXNpbmVzcy9pXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgdHlwZTogJ2xhc3ROYW1lJyxcbiAgICAgICAgYXV0b2NvbXBsZXRlVmFsdWVzOiBbJ2ZhbWlseS1uYW1lJywgJ2xhc3QtbmFtZSddLFxuICAgICAgICBuYW1lUGF0dGVybnM6IFsvbGFzdC4/bmFtZS9pLCAvbG5hbWUvaSwgL3N1cm5hbWUvaSwgL2ZhbWlseS4/bmFtZS9pXSxcbiAgICAgICAgaWRQYXR0ZXJuczogWy9sYXN0Lj9uYW1lL2ksIC9sbmFtZS9pLCAvc3VybmFtZS9pXSxcbiAgICAgICAgbGFiZWxQYXR0ZXJuczogWy9sYXN0XFxzKm5hbWUvaSwgL3N1cm5hbWUvaSwgL2ZhbWlseVxccypuYW1lL2ldLFxuICAgICAgICBuZWdhdGl2ZVBhdHRlcm5zOiBbL2ZpcnN0L2ksIC9jb21wYW55L2ksIC9idXNpbmVzcy9pXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgdHlwZTogJ2Z1bGxOYW1lJyxcbiAgICAgICAgYXV0b2NvbXBsZXRlVmFsdWVzOiBbJ25hbWUnXSxcbiAgICAgICAgbmFtZVBhdHRlcm5zOiBbL15uYW1lJC9pLCAvZnVsbC4/bmFtZS9pLCAveW91ci4/bmFtZS9pLCAvY2FuZGlkYXRlLj9uYW1lL2ldLFxuICAgICAgICBsYWJlbFBhdHRlcm5zOiBbL15uYW1lJC9pLCAvZnVsbFxccypuYW1lL2ksIC95b3VyXFxzKm5hbWUvaSwgL15uYW1lXFxzKlxcKi9pXSxcbiAgICAgICAgbmVnYXRpdmVQYXR0ZXJuczogWy9jb21wYW55L2ksIC9maXJzdC9pLCAvbGFzdC9pLCAvdXNlci9pLCAvYnVzaW5lc3MvaSwgL2pvYi9pXSxcbiAgICB9LFxuICAgIC8vIENvbnRhY3QgZmllbGRzXG4gICAge1xuICAgICAgICB0eXBlOiAnZW1haWwnLFxuICAgICAgICBhdXRvY29tcGxldGVWYWx1ZXM6IFsnZW1haWwnXSxcbiAgICAgICAgbmFtZVBhdHRlcm5zOiBbL2U/LT9tYWlsL2ksIC9lbWFpbC4/YWRkcmVzcy9pXSxcbiAgICAgICAgaWRQYXR0ZXJuczogWy9lPy0/bWFpbC9pXSxcbiAgICAgICAgbGFiZWxQYXR0ZXJuczogWy9lLT9tYWlsL2ksIC9lbWFpbFxccyphZGRyZXNzL2ldLFxuICAgICAgICBwbGFjZWhvbGRlclBhdHRlcm5zOiBbL2UtP21haWwvaSwgL0AvXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgdHlwZTogJ3Bob25lJyxcbiAgICAgICAgYXV0b2NvbXBsZXRlVmFsdWVzOiBbJ3RlbCcsICd0ZWwtbmF0aW9uYWwnLCAndGVsLWxvY2FsJ10sXG4gICAgICAgIG5hbWVQYXR0ZXJuczogWy9waG9uZS9pLCAvbW9iaWxlL2ksIC9jZWxsL2ksIC90ZWwoPzplcGhvbmUpPy9pXSxcbiAgICAgICAgbGFiZWxQYXR0ZXJuczogWy9waG9uZS9pLCAvbW9iaWxlL2ksIC9jZWxsL2ksIC90ZWxlcGhvbmUvaSwgL2NvbnRhY3RcXHMqbnVtYmVyL2ldLFxuICAgIH0sXG4gICAge1xuICAgICAgICB0eXBlOiAnYWRkcmVzcycsXG4gICAgICAgIGF1dG9jb21wbGV0ZVZhbHVlczogWydzdHJlZXQtYWRkcmVzcycsICdhZGRyZXNzLWxpbmUxJ10sXG4gICAgICAgIG5hbWVQYXR0ZXJuczogWy9hZGRyZXNzL2ksIC9zdHJlZXQvaV0sXG4gICAgICAgIGxhYmVsUGF0dGVybnM6IFsvYWRkcmVzcy9pLCAvc3RyZWV0L2ldLFxuICAgICAgICBuZWdhdGl2ZVBhdHRlcm5zOiBbL2VtYWlsL2ksIC93ZWIvaSwgL3VybC9pXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgdHlwZTogJ2NpdHknLFxuICAgICAgICBhdXRvY29tcGxldGVWYWx1ZXM6IFsnYWRkcmVzcy1sZXZlbDInXSxcbiAgICAgICAgbmFtZVBhdHRlcm5zOiBbL2NpdHkvaSwgL3Rvd24vaV0sXG4gICAgICAgIGxhYmVsUGF0dGVybnM6IFsvY2l0eS9pLCAvdG93bi9pXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgdHlwZTogJ3N0YXRlJyxcbiAgICAgICAgYXV0b2NvbXBsZXRlVmFsdWVzOiBbJ2FkZHJlc3MtbGV2ZWwxJ10sXG4gICAgICAgIG5hbWVQYXR0ZXJuczogWy9zdGF0ZS9pLCAvcHJvdmluY2UvaSwgL3JlZ2lvbi9pXSxcbiAgICAgICAgbGFiZWxQYXR0ZXJuczogWy9zdGF0ZS9pLCAvcHJvdmluY2UvaSwgL3JlZ2lvbi9pXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgdHlwZTogJ3ppcENvZGUnLFxuICAgICAgICBhdXRvY29tcGxldGVWYWx1ZXM6IFsncG9zdGFsLWNvZGUnXSxcbiAgICAgICAgbmFtZVBhdHRlcm5zOiBbL3ppcC9pLCAvcG9zdGFsL2ksIC9wb3N0Y29kZS9pXSxcbiAgICAgICAgbGFiZWxQYXR0ZXJuczogWy96aXAvaSwgL3Bvc3RhbC9pLCAvcG9zdFxccypjb2RlL2ldLFxuICAgIH0sXG4gICAge1xuICAgICAgICB0eXBlOiAnY291bnRyeScsXG4gICAgICAgIGF1dG9jb21wbGV0ZVZhbHVlczogWydjb3VudHJ5JywgJ2NvdW50cnktbmFtZSddLFxuICAgICAgICBuYW1lUGF0dGVybnM6IFsvY291bnRyeS9pXSxcbiAgICAgICAgbGFiZWxQYXR0ZXJuczogWy9jb3VudHJ5L2ldLFxuICAgIH0sXG4gICAgLy8gU29jaWFsL1Byb2Zlc3Npb25hbCBsaW5rc1xuICAgIHtcbiAgICAgICAgdHlwZTogJ2xpbmtlZGluJyxcbiAgICAgICAgbmFtZVBhdHRlcm5zOiBbL2xpbmtlZGluL2ldLFxuICAgICAgICBsYWJlbFBhdHRlcm5zOiBbL2xpbmtlZGluL2ldLFxuICAgICAgICBwbGFjZWhvbGRlclBhdHRlcm5zOiBbL2xpbmtlZGluXFwuY29tL2ksIC9saW5rZWRpbi9pXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgdHlwZTogJ2dpdGh1YicsXG4gICAgICAgIG5hbWVQYXR0ZXJuczogWy9naXRodWIvaV0sXG4gICAgICAgIGxhYmVsUGF0dGVybnM6IFsvZ2l0aHViL2ldLFxuICAgICAgICBwbGFjZWhvbGRlclBhdHRlcm5zOiBbL2dpdGh1YlxcLmNvbS9pLCAvZ2l0aHViL2ldLFxuICAgIH0sXG4gICAge1xuICAgICAgICB0eXBlOiAnd2Vic2l0ZScsXG4gICAgICAgIGF1dG9jb21wbGV0ZVZhbHVlczogWyd1cmwnXSxcbiAgICAgICAgbmFtZVBhdHRlcm5zOiBbL3dlYnNpdGUvaSwgL3BvcnRmb2xpby9pLCAvcGVyc29uYWwuP3NpdGUvaSwgL2Jsb2cvaV0sXG4gICAgICAgIGxhYmVsUGF0dGVybnM6IFsvd2Vic2l0ZS9pLCAvcG9ydGZvbGlvL2ksIC9wZXJzb25hbFxccyooc2l0ZXx1cmwpL2ldLFxuICAgICAgICBuZWdhdGl2ZVBhdHRlcm5zOiBbL2xpbmtlZGluL2ksIC9naXRodWIvaSwgL2NvbXBhbnkvaV0sXG4gICAgfSxcbiAgICAvLyBFbXBsb3ltZW50IGZpZWxkc1xuICAgIHtcbiAgICAgICAgdHlwZTogJ2N1cnJlbnRDb21wYW55JyxcbiAgICAgICAgYXV0b2NvbXBsZXRlVmFsdWVzOiBbJ29yZ2FuaXphdGlvbiddLFxuICAgICAgICBuYW1lUGF0dGVybnM6IFsvY3VycmVudC4/Y29tcGFueS9pLCAvZW1wbG95ZXIvaSwgL2NvbXBhbnkuP25hbWUvaSwgL29yZ2FuaXphdGlvbi9pXSxcbiAgICAgICAgbGFiZWxQYXR0ZXJuczogWy9jdXJyZW50XFxzKihjb21wYW55fGVtcGxveWVyKS9pLCAvY29tcGFueVxccypuYW1lL2ksIC9lbXBsb3llci9pXSxcbiAgICAgICAgbmVnYXRpdmVQYXR0ZXJuczogWy9wcmV2aW91cy9pLCAvcGFzdC9pLCAvZm9ybWVyL2ldLFxuICAgIH0sXG4gICAge1xuICAgICAgICB0eXBlOiAnY3VycmVudFRpdGxlJyxcbiAgICAgICAgYXV0b2NvbXBsZXRlVmFsdWVzOiBbJ29yZ2FuaXphdGlvbi10aXRsZSddLFxuICAgICAgICBuYW1lUGF0dGVybnM6IFsvY3VycmVudC4/dGl0bGUvaSwgL2pvYi4/dGl0bGUvaSwgL3Bvc2l0aW9uL2ksIC9yb2xlL2ldLFxuICAgICAgICBsYWJlbFBhdHRlcm5zOiBbL2N1cnJlbnRcXHMqKHRpdGxlfHBvc2l0aW9ufHJvbGUpL2ksIC9qb2JcXHMqdGl0bGUvaV0sXG4gICAgICAgIG5lZ2F0aXZlUGF0dGVybnM6IFsvcHJldmlvdXMvaSwgL3Bhc3QvaSwgL2Rlc2lyZWQvaSwgL2FwcGx5aW5nL2ldLFxuICAgIH0sXG4gICAge1xuICAgICAgICB0eXBlOiAneWVhcnNFeHBlcmllbmNlJyxcbiAgICAgICAgbmFtZVBhdHRlcm5zOiBbL3llYXJzPy4/KG9mKT8uP2V4cGVyaWVuY2UvaSwgL2V4cGVyaWVuY2UuP3llYXJzL2ksIC95b2UvaV0sXG4gICAgICAgIGxhYmVsUGF0dGVybnM6IFsveWVhcnM/XFxzKihvZlxccyopP2V4cGVyaWVuY2UvaSwgL3RvdGFsXFxzKmV4cGVyaWVuY2UvaSwgL2hvd1xccyptYW55XFxzKnllYXJzL2ldLFxuICAgIH0sXG4gICAgLy8gRWR1Y2F0aW9uIGZpZWxkc1xuICAgIHtcbiAgICAgICAgdHlwZTogJ3NjaG9vbCcsXG4gICAgICAgIG5hbWVQYXR0ZXJuczogWy9zY2hvb2wvaSwgL3VuaXZlcnNpdHkvaSwgL2NvbGxlZ2UvaSwgL2luc3RpdHV0aW9uL2ksIC9hbG1hLj9tYXRlci9pXSxcbiAgICAgICAgbGFiZWxQYXR0ZXJuczogWy9zY2hvb2wvaSwgL3VuaXZlcnNpdHkvaSwgL2NvbGxlZ2UvaSwgL2luc3RpdHV0aW9uL2ldLFxuICAgICAgICBuZWdhdGl2ZVBhdHRlcm5zOiBbL2hpZ2hcXHMqc2Nob29sL2ldLFxuICAgIH0sXG4gICAge1xuICAgICAgICB0eXBlOiAnZGVncmVlJyxcbiAgICAgICAgbmFtZVBhdHRlcm5zOiBbL2RlZ3JlZS9pLCAvcXVhbGlmaWNhdGlvbi9pXSxcbiAgICAgICAgbGFiZWxQYXR0ZXJuczogWy9kZWdyZWUvaSwgL3F1YWxpZmljYXRpb24vaSwgL2xldmVsXFxzKm9mXFxzKmVkdWNhdGlvbi9pXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgdHlwZTogJ2ZpZWxkT2ZTdHVkeScsXG4gICAgICAgIG5hbWVQYXR0ZXJuczogWy9maWVsZC4/b2YuP3N0dWR5L2ksIC9tYWpvci9pLCAvY29uY2VudHJhdGlvbi9pLCAvc3BlY2lhbGl6YXRpb24vaV0sXG4gICAgICAgIGxhYmVsUGF0dGVybnM6IFsvZmllbGRcXHMqb2ZcXHMqc3R1ZHkvaSwgL21ham9yL2ksIC9hcmVhXFxzKm9mXFxzKnN0dWR5L2ldLFxuICAgIH0sXG4gICAge1xuICAgICAgICB0eXBlOiAnZ3JhZHVhdGlvblllYXInLFxuICAgICAgICBuYW1lUGF0dGVybnM6IFsvZ3JhZHVhdGlvbi4/KHllYXJ8ZGF0ZSkvaSwgL2dyYWQuP3llYXIvaV0sXG4gICAgICAgIGxhYmVsUGF0dGVybnM6IFsvZ3JhZHVhdGlvblxccyooeWVhcnxkYXRlKS9pLCAveWVhclxccypvZlxccypncmFkdWF0aW9uL2ksIC93aGVuXFxzKmRpZFxccyp5b3VcXHMqZ3JhZHVhdGUvaV0sXG4gICAgfSxcbiAgICB7XG4gICAgICAgIHR5cGU6ICdncGEnLFxuICAgICAgICBuYW1lUGF0dGVybnM6IFsvZ3BhL2ksIC9ncmFkZS4/cG9pbnQvaSwgL2NncGEvaV0sXG4gICAgICAgIGxhYmVsUGF0dGVybnM6IFsvZ3BhL2ksIC9ncmFkZVxccypwb2ludC9pLCAvY3VtdWxhdGl2ZVxccypncGEvaV0sXG4gICAgfSxcbiAgICAvLyBEb2N1bWVudHNcbiAgICB7XG4gICAgICAgIHR5cGU6ICdyZXN1bWUnLFxuICAgICAgICBuYW1lUGF0dGVybnM6IFsvcmVzdW1lL2ksIC9jdi9pLCAvY3VycmljdWx1bS4/dml0YWUvaV0sXG4gICAgICAgIGxhYmVsUGF0dGVybnM6IFsvcmVzdW1lL2ksIC9jdi9pLCAvY3VycmljdWx1bVxccyp2aXRhZS9pLCAvdXBsb2FkXFxzKih5b3VyXFxzKik/cmVzdW1lL2ldLFxuICAgIH0sXG4gICAge1xuICAgICAgICB0eXBlOiAnY292ZXJMZXR0ZXInLFxuICAgICAgICBuYW1lUGF0dGVybnM6IFsvY292ZXIuP2xldHRlci9pLCAvbW90aXZhdGlvbi4/bGV0dGVyL2ldLFxuICAgICAgICBsYWJlbFBhdHRlcm5zOiBbL2NvdmVyXFxzKmxldHRlci9pLCAvbW90aXZhdGlvblxccypsZXR0ZXIvaV0sXG4gICAgfSxcbiAgICAvLyBDb21wZW5zYXRpb25cbiAgICB7XG4gICAgICAgIHR5cGU6ICdzYWxhcnknLFxuICAgICAgICBuYW1lUGF0dGVybnM6IFsvc2FsYXJ5L2ksIC9jb21wZW5zYXRpb24vaSwgL3BheS9pLCAvd2FnZS9pXSxcbiAgICAgICAgbGFiZWxQYXR0ZXJuczogWy9zYWxhcnkvaSwgL2NvbXBlbnNhdGlvbi9pLCAvZXhwZWN0ZWRcXHMqKHNhbGFyeXxwYXkpL2ksIC9kZXNpcmVkXFxzKnNhbGFyeS9pXSxcbiAgICB9LFxuICAgIC8vIEF2YWlsYWJpbGl0eVxuICAgIHtcbiAgICAgICAgdHlwZTogJ3N0YXJ0RGF0ZScsXG4gICAgICAgIG5hbWVQYXR0ZXJuczogWy9zdGFydC4/ZGF0ZS9pLCAvYXZhaWxhYmxlLj9kYXRlL2ksIC9lYXJsaWVzdC4/c3RhcnQvaV0sXG4gICAgICAgIGxhYmVsUGF0dGVybnM6IFsvc3RhcnRcXHMqZGF0ZS9pLCAvd2hlblxccypjYW5cXHMqeW91XFxzKnN0YXJ0L2ksIC9lYXJsaWVzdFxccypzdGFydC9pLCAvYXZhaWxhYmlsaXR5L2ldLFxuICAgICAgICBuZWdhdGl2ZVBhdHRlcm5zOiBbL2VuZC9pLCAvZmluaXNoL2ldLFxuICAgIH0sXG4gICAgLy8gTGVnYWwvQ29tcGxpYW5jZVxuICAgIHtcbiAgICAgICAgdHlwZTogJ3dvcmtBdXRob3JpemF0aW9uJyxcbiAgICAgICAgbmFtZVBhdHRlcm5zOiBbL3dvcmsuP2F1dGgvaSwgL2F1dGhvcml6ZWQuP3RvLj93b3JrL2ksIC9sZWdhbGx5Lj93b3JrL2ksIC93b3JrLj9wZXJtaXQvaSwgL3Zpc2EuP3N0YXR1cy9pXSxcbiAgICAgICAgbGFiZWxQYXR0ZXJuczogWy9hdXRob3JpemVkXFxzKnRvXFxzKndvcmsvaSwgL2xlZ2FsbHlcXHMqKGF1dGhvcml6ZWR8cGVybWl0dGVkKS9pLCAvd29ya1xccyphdXRob3JpemF0aW9uL2ksIC9yaWdodFxccyp0b1xccyp3b3JrL2ldLFxuICAgIH0sXG4gICAge1xuICAgICAgICB0eXBlOiAnc3BvbnNvcnNoaXAnLFxuICAgICAgICBuYW1lUGF0dGVybnM6IFsvc3BvbnNvci9pLCAvdmlzYS4/c3BvbnNvci9pXSxcbiAgICAgICAgbGFiZWxQYXR0ZXJuczogWy9zcG9uc29yL2ksIC92aXNhXFxzKnNwb25zb3IvaSwgL3JlcXVpcmVcXHMqc3BvbnNvcnNoaXAvaSwgL25lZWRcXHMqc3BvbnNvcnNoaXAvaV0sXG4gICAgfSxcbiAgICAvLyBFRU8gZmllbGRzXG4gICAge1xuICAgICAgICB0eXBlOiAndmV0ZXJhblN0YXR1cycsXG4gICAgICAgIG5hbWVQYXR0ZXJuczogWy92ZXRlcmFuL2ksIC9taWxpdGFyeS9pXSxcbiAgICAgICAgbGFiZWxQYXR0ZXJuczogWy92ZXRlcmFuL2ksIC9taWxpdGFyeVxccypzdGF0dXMvaSwgL3NlcnZlZFxccyppbi9pXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgdHlwZTogJ2Rpc2FiaWxpdHknLFxuICAgICAgICBuYW1lUGF0dGVybnM6IFsvZGlzYWJpbGl0eS9pLCAvZGlzYWJsZWQvaV0sXG4gICAgICAgIGxhYmVsUGF0dGVybnM6IFsvZGlzYWJpbGl0eS9pLCAvZGlzYWJsZWQvaSwgL2FjY29tbW9kYXRpb24vaV0sXG4gICAgfSxcbiAgICB7XG4gICAgICAgIHR5cGU6ICdnZW5kZXInLFxuICAgICAgICBuYW1lUGF0dGVybnM6IFsvZ2VuZGVyL2ksIC9zZXgvaV0sXG4gICAgICAgIGxhYmVsUGF0dGVybnM6IFsvZ2VuZGVyL2ksIC9zZXgvaV0sXG4gICAgICAgIG5lZ2F0aXZlUGF0dGVybnM6IFsvaWRlbnRpdHkvaV0sXG4gICAgfSxcbiAgICB7XG4gICAgICAgIHR5cGU6ICdldGhuaWNpdHknLFxuICAgICAgICBuYW1lUGF0dGVybnM6IFsvZXRobmljaXR5L2ksIC9yYWNlL2ksIC9ldGhuaWMvaV0sXG4gICAgICAgIGxhYmVsUGF0dGVybnM6IFsvZXRobmljaXR5L2ksIC9yYWNlL2ksIC9ldGhuaWNcXHMqYmFja2dyb3VuZC9pXSxcbiAgICB9LFxuICAgIC8vIFNraWxsc1xuICAgIHtcbiAgICAgICAgdHlwZTogJ3NraWxscycsXG4gICAgICAgIG5hbWVQYXR0ZXJuczogWy9za2lsbHM/L2ksIC9leHBlcnRpc2UvaSwgL2NvbXBldGVuYy9pXSxcbiAgICAgICAgbGFiZWxQYXR0ZXJuczogWy9za2lsbHM/L2ksIC90ZWNobmljYWxcXHMqc2tpbGxzL2ksIC9rZXlcXHMqc2tpbGxzL2ldLFxuICAgIH0sXG4gICAgLy8gU3VtbWFyeS9CaW9cbiAgICB7XG4gICAgICAgIHR5cGU6ICdzdW1tYXJ5JyxcbiAgICAgICAgbmFtZVBhdHRlcm5zOiBbL3N1bW1hcnkvaSwgL2Jpby9pLCAvYWJvdXQuP3lvdS9pLCAvcHJvZmlsZS9pLCAvaW50cm9kdWN0aW9uL2ldLFxuICAgICAgICBsYWJlbFBhdHRlcm5zOiBbL3N1bW1hcnkvaSwgL3Byb2Zlc3Npb25hbFxccypzdW1tYXJ5L2ksIC9hYm91dFxccyp5b3UvaSwgL3RlbGxcXHMqdXNcXHMqYWJvdXQvaSwgL2Jpby9pXSxcbiAgICAgICAgbmVnYXRpdmVQYXR0ZXJuczogWy9qb2IvaSwgL3Bvc2l0aW9uL2ldLFxuICAgIH0sXG5dO1xuLy8gSm9iIHNpdGUgVVJMIHBhdHRlcm5zIGZvciBzY3JhcGVyIGRldGVjdGlvblxuZXhwb3J0IGNvbnN0IEpPQl9TSVRFX1BBVFRFUk5TID0ge1xuICAgIGxpbmtlZGluOiBbXG4gICAgICAgIC9saW5rZWRpblxcLmNvbVxcL2pvYnNcXC92aWV3XFwvLyxcbiAgICAgICAgL2xpbmtlZGluXFwuY29tXFwvam9ic1xcL3NlYXJjaC8sXG4gICAgICAgIC9saW5rZWRpblxcLmNvbVxcL2pvYnNcXC9jb2xsZWN0aW9ucy8sXG4gICAgXSxcbiAgICBpbmRlZWQ6IFtcbiAgICAgICAgL2luZGVlZFxcLmNvbVxcL3ZpZXdqb2IvLFxuICAgICAgICAvaW5kZWVkXFwuY29tXFwvam9icy8sXG4gICAgICAgIC9pbmRlZWRcXC5jb21cXC9jbXBcXC8uK1xcL2pvYnMvLFxuICAgIF0sXG4gICAgZ3JlZW5ob3VzZTogW1xuICAgICAgICAvYm9hcmRzXFwuZ3JlZW5ob3VzZVxcLmlvXFwvLyxcbiAgICAgICAgL2dyZWVuaG91c2VcXC5pb1xcLy4qXFwvam9ic1xcLy8sXG4gICAgXSxcbiAgICBsZXZlcjogW1xuICAgICAgICAvam9ic1xcLmxldmVyXFwuY29cXC8vLFxuICAgICAgICAvbGV2ZXJcXC5jb1xcLy4qXFwvam9ic1xcLy8sXG4gICAgXSxcbiAgICB3YXRlcmxvb1dvcmtzOiBbXG4gICAgICAgIC93YXRlcmxvb3dvcmtzXFwudXdhdGVybG9vXFwuY2EvLFxuICAgIF0sXG4gICAgd29ya2RheTogW1xuICAgICAgICAvbXl3b3JrZGF5am9ic1xcLmNvbS8sXG4gICAgICAgIC93b3JrZGF5am9ic1xcLmNvbS8sXG4gICAgXSxcbn07XG5leHBvcnQgZnVuY3Rpb24gZGV0ZWN0Sm9iU2l0ZSh1cmwpIHtcbiAgICBmb3IgKGNvbnN0IFtzaXRlLCBwYXR0ZXJuc10gb2YgT2JqZWN0LmVudHJpZXMoSk9CX1NJVEVfUEFUVEVSTlMpKSB7XG4gICAgICAgIGlmIChwYXR0ZXJucy5zb21lKHAgPT4gcC50ZXN0KHVybCkpKSB7XG4gICAgICAgICAgICByZXR1cm4gc2l0ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gJ3Vua25vd24nO1xufVxuLy8gQ29tbW9uIHF1ZXN0aW9uIHBhdHRlcm5zIGZvciBsZWFybmluZyBzeXN0ZW1cbmV4cG9ydCBjb25zdCBDVVNUT01fUVVFU1RJT05fSU5ESUNBVE9SUyA9IFtcbiAgICAvd2h5Liood2FudHxpbnRlcmVzdGVkfGFwcGx5fGpvaW4pL2ksXG4gICAgL3doYXQuKihtYWtlc3xhdHRyYWN0ZWR8ZXhjaXRlcykvaSxcbiAgICAvdGVsbC4qYWJvdXQuKnlvdXJzZWxmL2ksXG4gICAgL2Rlc2NyaWJlLiooc2l0dWF0aW9ufHRpbWV8ZXhwZXJpZW5jZSkvaSxcbiAgICAvaG93LipoYW5kbGUvaSxcbiAgICAvZ3JlYXRlc3QuKihzdHJlbmd0aHx3ZWFrbmVzc3xhY2hpZXZlbWVudCkvaSxcbiAgICAvd2hlcmUuKnNlZS4qeW91cnNlbGYvaSxcbiAgICAvd2h5LipzaG91bGQuKmhpcmUvaSxcbiAgICAvd2hhdC4qY29udHJpYnV0ZS9pLFxuICAgIC9zYWxhcnkuKmV4cGVjdGF0aW9uL2ksXG4gICAgL2FkZGl0aW9uYWwuKmluZm9ybWF0aW9uL2ksXG4gICAgL2FueXRoaW5nLiplbHNlL2ksXG5dO1xuIiwiLy8gRmllbGQgZGV0ZWN0aW9uIGZvciBhdXRvLWZpbGxcbmltcG9ydCB7IEZJRUxEX1BBVFRFUk5TLCBDVVNUT01fUVVFU1RJT05fSU5ESUNBVE9SUyB9IGZyb20gJ0Avc2hhcmVkL2ZpZWxkLXBhdHRlcm5zJztcbmV4cG9ydCBjbGFzcyBGaWVsZERldGVjdG9yIHtcbiAgICBkZXRlY3RGaWVsZHMoZm9ybSkge1xuICAgICAgICBjb25zdCBmaWVsZHMgPSBbXTtcbiAgICAgICAgY29uc3QgaW5wdXRzID0gZm9ybS5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dCwgdGV4dGFyZWEsIHNlbGVjdCcpO1xuICAgICAgICBmb3IgKGNvbnN0IGlucHV0IG9mIGlucHV0cykge1xuICAgICAgICAgICAgY29uc3QgZWxlbWVudCA9IGlucHV0O1xuICAgICAgICAgICAgLy8gU2tpcCBoaWRkZW4sIGRpc2FibGVkLCBvciBzdWJtaXQgaW5wdXRzXG4gICAgICAgICAgICBpZiAodGhpcy5zaG91bGRTa2lwRWxlbWVudChlbGVtZW50KSlcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIGNvbnN0IGRldGVjdGlvbiA9IHRoaXMuZGV0ZWN0RmllbGRUeXBlKGVsZW1lbnQpO1xuICAgICAgICAgICAgaWYgKGRldGVjdGlvbi5maWVsZFR5cGUgIT09ICd1bmtub3duJyB8fCBkZXRlY3Rpb24uY29uZmlkZW5jZSA+IDAuMSkge1xuICAgICAgICAgICAgICAgIGZpZWxkcy5wdXNoKGRldGVjdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZpZWxkcztcbiAgICB9XG4gICAgc2hvdWxkU2tpcEVsZW1lbnQoZWxlbWVudCkge1xuICAgICAgICBjb25zdCBpbnB1dCA9IGVsZW1lbnQ7XG4gICAgICAgIC8vIENoZWNrIGNvbXB1dGVkIHN0eWxlIGZvciB2aXNpYmlsaXR5XG4gICAgICAgIGNvbnN0IHN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWxlbWVudCk7XG4gICAgICAgIGlmIChzdHlsZS5kaXNwbGF5ID09PSAnbm9uZScgfHwgc3R5bGUudmlzaWJpbGl0eSA9PT0gJ2hpZGRlbicpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIC8vIENoZWNrIGRpc2FibGVkIHN0YXRlXG4gICAgICAgIGlmIChpbnB1dC5kaXNhYmxlZClcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAvLyBDaGVjayBpbnB1dCB0eXBlXG4gICAgICAgIGNvbnN0IHNraXBUeXBlcyA9IFsnaGlkZGVuJywgJ3N1Ym1pdCcsICdidXR0b24nLCAncmVzZXQnLCAnaW1hZ2UnLCAnZmlsZSddO1xuICAgICAgICBpZiAoc2tpcFR5cGVzLmluY2x1ZGVzKGlucHV0LnR5cGUpKVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIC8vIENoZWNrIGlmIGl0J3MgYSBDU1JGL3Rva2VuIGZpZWxkXG4gICAgICAgIGlmIChpbnB1dC5uYW1lPy5pbmNsdWRlcygnY3NyZicpIHx8IGlucHV0Lm5hbWU/LmluY2x1ZGVzKCd0b2tlbicpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGRldGVjdEZpZWxkVHlwZShlbGVtZW50KSB7XG4gICAgICAgIGNvbnN0IHNpZ25hbHMgPSB0aGlzLmdhdGhlclNpZ25hbHMoZWxlbWVudCk7XG4gICAgICAgIGNvbnN0IHNjb3JlcyA9IHRoaXMuc2NvcmVBbGxQYXR0ZXJucyhzaWduYWxzKTtcbiAgICAgICAgLy8gR2V0IGJlc3QgbWF0Y2hcbiAgICAgICAgc2NvcmVzLnNvcnQoKGEsIGIpID0+IGIuY29uZmlkZW5jZSAtIGEuY29uZmlkZW5jZSk7XG4gICAgICAgIGNvbnN0IGJlc3QgPSBzY29yZXNbMF07XG4gICAgICAgIC8vIERldGVybWluZSBpZiB0aGlzIGlzIGEgY3VzdG9tIHF1ZXN0aW9uXG4gICAgICAgIGxldCBmaWVsZFR5cGUgPSBiZXN0Py5maWVsZFR5cGUgfHwgJ3Vua25vd24nO1xuICAgICAgICBsZXQgY29uZmlkZW5jZSA9IGJlc3Q/LmNvbmZpZGVuY2UgfHwgMDtcbiAgICAgICAgaWYgKGNvbmZpZGVuY2UgPCAwLjMpIHtcbiAgICAgICAgICAgIC8vIENoZWNrIGlmIGl0IGxvb2tzIGxpa2UgYSBjdXN0b20gcXVlc3Rpb25cbiAgICAgICAgICAgIGlmICh0aGlzLmxvb2tzTGlrZUN1c3RvbVF1ZXN0aW9uKHNpZ25hbHMpKSB7XG4gICAgICAgICAgICAgICAgZmllbGRUeXBlID0gJ2N1c3RvbVF1ZXN0aW9uJztcbiAgICAgICAgICAgICAgICBjb25maWRlbmNlID0gMC41O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlbGVtZW50LFxuICAgICAgICAgICAgZmllbGRUeXBlLFxuICAgICAgICAgICAgY29uZmlkZW5jZSxcbiAgICAgICAgICAgIGxhYmVsOiBzaWduYWxzLmxhYmVsIHx8IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHBsYWNlaG9sZGVyOiBzaWduYWxzLnBsYWNlaG9sZGVyIHx8IHVuZGVmaW5lZCxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgZ2F0aGVyU2lnbmFscyhlbGVtZW50KSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBuYW1lOiBlbGVtZW50Lm5hbWU/LnRvTG93ZXJDYXNlKCkgfHwgJycsXG4gICAgICAgICAgICBpZDogZWxlbWVudC5pZD8udG9Mb3dlckNhc2UoKSB8fCAnJyxcbiAgICAgICAgICAgIHR5cGU6IGVsZW1lbnQudHlwZSB8fCAndGV4dCcsXG4gICAgICAgICAgICBwbGFjZWhvbGRlcjogZWxlbWVudC5wbGFjZWhvbGRlcj8udG9Mb3dlckNhc2UoKSB8fCAnJyxcbiAgICAgICAgICAgIGF1dG9jb21wbGV0ZTogZWxlbWVudC5hdXRvY29tcGxldGUgfHwgJycsXG4gICAgICAgICAgICBsYWJlbDogdGhpcy5maW5kTGFiZWwoZWxlbWVudCk/LnRvTG93ZXJDYXNlKCkgfHwgJycsXG4gICAgICAgICAgICBhcmlhTGFiZWw6IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJyk/LnRvTG93ZXJDYXNlKCkgfHwgJycsXG4gICAgICAgICAgICBuZWFyYnlUZXh0OiB0aGlzLmdldE5lYXJieVRleHQoZWxlbWVudCk/LnRvTG93ZXJDYXNlKCkgfHwgJycsXG4gICAgICAgICAgICBwYXJlbnRDbGFzc2VzOiB0aGlzLmdldFBhcmVudENsYXNzZXMoZWxlbWVudCksXG4gICAgICAgIH07XG4gICAgfVxuICAgIHNjb3JlQWxsUGF0dGVybnMoc2lnbmFscykge1xuICAgICAgICByZXR1cm4gRklFTERfUEFUVEVSTlMubWFwKChwYXR0ZXJuKSA9PiAoe1xuICAgICAgICAgICAgZmllbGRUeXBlOiBwYXR0ZXJuLnR5cGUsXG4gICAgICAgICAgICBjb25maWRlbmNlOiB0aGlzLmNhbGN1bGF0ZUNvbmZpZGVuY2Uoc2lnbmFscywgcGF0dGVybiksXG4gICAgICAgIH0pKTtcbiAgICB9XG4gICAgY2FsY3VsYXRlQ29uZmlkZW5jZShzaWduYWxzLCBwYXR0ZXJuKSB7XG4gICAgICAgIGxldCBzY29yZSA9IDA7XG4gICAgICAgIGxldCBtYXhTY29yZSA9IDA7XG4gICAgICAgIC8vIFdlaWdodCBkaWZmZXJlbnQgc2lnbmFsc1xuICAgICAgICBjb25zdCB3ZWlnaHRzID0ge1xuICAgICAgICAgICAgYXV0b2NvbXBsZXRlOiAwLjQsXG4gICAgICAgICAgICBuYW1lOiAwLjIsXG4gICAgICAgICAgICBpZDogMC4xNSxcbiAgICAgICAgICAgIGxhYmVsOiAwLjE1LFxuICAgICAgICAgICAgcGxhY2Vob2xkZXI6IDAuMSxcbiAgICAgICAgICAgIGFyaWFMYWJlbDogMC4xLFxuICAgICAgICB9O1xuICAgICAgICAvLyBDaGVjayBhdXRvY29tcGxldGUgYXR0cmlidXRlIChtb3N0IHJlbGlhYmxlKVxuICAgICAgICBpZiAoc2lnbmFscy5hdXRvY29tcGxldGUgJiYgcGF0dGVybi5hdXRvY29tcGxldGVWYWx1ZXM/LmluY2x1ZGVzKHNpZ25hbHMuYXV0b2NvbXBsZXRlKSkge1xuICAgICAgICAgICAgc2NvcmUgKz0gd2VpZ2h0cy5hdXRvY29tcGxldGU7XG4gICAgICAgIH1cbiAgICAgICAgbWF4U2NvcmUgKz0gd2VpZ2h0cy5hdXRvY29tcGxldGU7XG4gICAgICAgIC8vIENoZWNrIG5hbWUgYXR0cmlidXRlXG4gICAgICAgIGlmIChwYXR0ZXJuLm5hbWVQYXR0ZXJucz8uc29tZSgocCkgPT4gcC50ZXN0KHNpZ25hbHMubmFtZSkpKSB7XG4gICAgICAgICAgICBzY29yZSArPSB3ZWlnaHRzLm5hbWU7XG4gICAgICAgIH1cbiAgICAgICAgbWF4U2NvcmUgKz0gd2VpZ2h0cy5uYW1lO1xuICAgICAgICAvLyBDaGVjayBJRFxuICAgICAgICBpZiAocGF0dGVybi5pZFBhdHRlcm5zPy5zb21lKChwKSA9PiBwLnRlc3Qoc2lnbmFscy5pZCkpKSB7XG4gICAgICAgICAgICBzY29yZSArPSB3ZWlnaHRzLmlkO1xuICAgICAgICB9XG4gICAgICAgIG1heFNjb3JlICs9IHdlaWdodHMuaWQ7XG4gICAgICAgIC8vIENoZWNrIGxhYmVsXG4gICAgICAgIGlmIChwYXR0ZXJuLmxhYmVsUGF0dGVybnM/LnNvbWUoKHApID0+IHAudGVzdChzaWduYWxzLmxhYmVsKSkpIHtcbiAgICAgICAgICAgIHNjb3JlICs9IHdlaWdodHMubGFiZWw7XG4gICAgICAgIH1cbiAgICAgICAgbWF4U2NvcmUgKz0gd2VpZ2h0cy5sYWJlbDtcbiAgICAgICAgLy8gQ2hlY2sgcGxhY2Vob2xkZXJcbiAgICAgICAgaWYgKHBhdHRlcm4ucGxhY2Vob2xkZXJQYXR0ZXJucz8uc29tZSgocCkgPT4gcC50ZXN0KHNpZ25hbHMucGxhY2Vob2xkZXIpKSkge1xuICAgICAgICAgICAgc2NvcmUgKz0gd2VpZ2h0cy5wbGFjZWhvbGRlcjtcbiAgICAgICAgfVxuICAgICAgICBtYXhTY29yZSArPSB3ZWlnaHRzLnBsYWNlaG9sZGVyO1xuICAgICAgICAvLyBDaGVjayBhcmlhLWxhYmVsXG4gICAgICAgIGlmIChwYXR0ZXJuLmxhYmVsUGF0dGVybnM/LnNvbWUoKHApID0+IHAudGVzdChzaWduYWxzLmFyaWFMYWJlbCkpKSB7XG4gICAgICAgICAgICBzY29yZSArPSB3ZWlnaHRzLmFyaWFMYWJlbDtcbiAgICAgICAgfVxuICAgICAgICBtYXhTY29yZSArPSB3ZWlnaHRzLmFyaWFMYWJlbDtcbiAgICAgICAgLy8gTmVnYXRpdmUgc2lnbmFscyAocmVkdWNlIGNvbmZpZGVuY2UgaWYgZm91bmQpXG4gICAgICAgIGlmIChwYXR0ZXJuLm5lZ2F0aXZlUGF0dGVybnM/LnNvbWUoKHApID0+IHAudGVzdChzaWduYWxzLm5hbWUpIHx8IHAudGVzdChzaWduYWxzLmxhYmVsKSB8fCBwLnRlc3Qoc2lnbmFscy5pZCkpKSB7XG4gICAgICAgICAgICBzY29yZSAtPSAwLjM7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KDAsIG1heFNjb3JlID4gMCA/IHNjb3JlIC8gbWF4U2NvcmUgOiAwKTtcbiAgICB9XG4gICAgZmluZExhYmVsKGVsZW1lbnQpIHtcbiAgICAgICAgLy8gTWV0aG9kIDE6IEV4cGxpY2l0IGxhYmVsIHZpYSBmb3IgYXR0cmlidXRlXG4gICAgICAgIGlmIChlbGVtZW50LmlkKSB7XG4gICAgICAgICAgICBjb25zdCBsYWJlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYGxhYmVsW2Zvcj1cIiR7ZWxlbWVudC5pZH1cIl1gKTtcbiAgICAgICAgICAgIGlmIChsYWJlbD8udGV4dENvbnRlbnQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGxhYmVsLnRleHRDb250ZW50LnRyaW0oKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBNZXRob2QgMjogV3JhcHBpbmcgbGFiZWxcbiAgICAgICAgY29uc3QgcGFyZW50TGFiZWwgPSBlbGVtZW50LmNsb3Nlc3QoJ2xhYmVsJyk7XG4gICAgICAgIGlmIChwYXJlbnRMYWJlbD8udGV4dENvbnRlbnQpIHtcbiAgICAgICAgICAgIC8vIFJlbW92ZSB0aGUgaW5wdXQncyB2YWx1ZSBmcm9tIGxhYmVsIHRleHRcbiAgICAgICAgICAgIGNvbnN0IHRleHQgPSBwYXJlbnRMYWJlbC50ZXh0Q29udGVudC50cmltKCk7XG4gICAgICAgICAgICBjb25zdCBpbnB1dFZhbHVlID0gZWxlbWVudC52YWx1ZSB8fCAnJztcbiAgICAgICAgICAgIHJldHVybiB0ZXh0LnJlcGxhY2UoaW5wdXRWYWx1ZSwgJycpLnRyaW0oKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBNZXRob2QgMzogYXJpYS1sYWJlbGxlZGJ5XG4gICAgICAgIGNvbnN0IGxhYmVsbGVkQnkgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbGxlZGJ5Jyk7XG4gICAgICAgIGlmIChsYWJlbGxlZEJ5KSB7XG4gICAgICAgICAgICBjb25zdCBsYWJlbEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQobGFiZWxsZWRCeSk7XG4gICAgICAgICAgICBpZiAobGFiZWxFbD8udGV4dENvbnRlbnQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGxhYmVsRWwudGV4dENvbnRlbnQudHJpbSgpO1xuICAgICAgICB9XG4gICAgICAgIC8vIE1ldGhvZCA0OiBQcmV2aW91cyBzaWJsaW5nIGxhYmVsXG4gICAgICAgIGxldCBzaWJsaW5nID0gZWxlbWVudC5wcmV2aW91c0VsZW1lbnRTaWJsaW5nO1xuICAgICAgICB3aGlsZSAoc2libGluZykge1xuICAgICAgICAgICAgaWYgKHNpYmxpbmcudGFnTmFtZSA9PT0gJ0xBQkVMJykge1xuICAgICAgICAgICAgICAgIHJldHVybiBzaWJsaW5nLnRleHRDb250ZW50Py50cmltKCkgfHwgbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNpYmxpbmcgPSBzaWJsaW5nLnByZXZpb3VzRWxlbWVudFNpYmxpbmc7XG4gICAgICAgIH1cbiAgICAgICAgLy8gTWV0aG9kIDU6IFBhcmVudCdzIHByZXZpb3VzIHNpYmxpbmcgbGFiZWxcbiAgICAgICAgY29uc3QgcGFyZW50ID0gZWxlbWVudC5wYXJlbnRFbGVtZW50O1xuICAgICAgICBpZiAocGFyZW50KSB7XG4gICAgICAgICAgICBsZXQgcGFyZW50U2libGluZyA9IHBhcmVudC5wcmV2aW91c0VsZW1lbnRTaWJsaW5nO1xuICAgICAgICAgICAgaWYgKHBhcmVudFNpYmxpbmc/LnRhZ05hbWUgPT09ICdMQUJFTCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFyZW50U2libGluZy50ZXh0Q29udGVudD8udHJpbSgpIHx8IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGdldE5lYXJieVRleHQoZWxlbWVudCkge1xuICAgICAgICBjb25zdCBwYXJlbnQgPSBlbGVtZW50LmNsb3Nlc3QoJy5mb3JtLWdyb3VwLCAuZmllbGQsIC5pbnB1dC13cmFwcGVyLCBbY2xhc3MqPVwiZmllbGRcIl0sIFtjbGFzcyo9XCJpbnB1dFwiXScpO1xuICAgICAgICBpZiAocGFyZW50KSB7XG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0gcGFyZW50LnRleHRDb250ZW50Py50cmltKCk7XG4gICAgICAgICAgICBpZiAodGV4dCAmJiB0ZXh0Lmxlbmd0aCA8IDIwMClcbiAgICAgICAgICAgICAgICByZXR1cm4gdGV4dDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZ2V0UGFyZW50Q2xhc3NlcyhlbGVtZW50KSB7XG4gICAgICAgIGNvbnN0IGNsYXNzZXMgPSBbXTtcbiAgICAgICAgbGV0IGN1cnJlbnQgPSBlbGVtZW50LnBhcmVudEVsZW1lbnQ7XG4gICAgICAgIGxldCBkZXB0aCA9IDA7XG4gICAgICAgIHdoaWxlIChjdXJyZW50ICYmIGRlcHRoIDwgMykge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnQuY2xhc3NOYW1lKSB7XG4gICAgICAgICAgICAgICAgY2xhc3Nlcy5wdXNoKC4uLmN1cnJlbnQuY2xhc3NOYW1lLnNwbGl0KCcgJykuZmlsdGVyKEJvb2xlYW4pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGN1cnJlbnQgPSBjdXJyZW50LnBhcmVudEVsZW1lbnQ7XG4gICAgICAgICAgICBkZXB0aCsrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjbGFzc2VzO1xuICAgIH1cbiAgICBsb29rc0xpa2VDdXN0b21RdWVzdGlvbihzaWduYWxzKSB7XG4gICAgICAgIGNvbnN0IHRleHQgPSBgJHtzaWduYWxzLmxhYmVsfSAke3NpZ25hbHMucGxhY2Vob2xkZXJ9ICR7c2lnbmFscy5uZWFyYnlUZXh0fWA7XG4gICAgICAgIHJldHVybiBDVVNUT01fUVVFU1RJT05fSU5ESUNBVE9SUy5zb21lKChwYXR0ZXJuKSA9PiBwYXR0ZXJuLnRlc3QodGV4dCkpO1xuICAgIH1cbn1cbiIsIi8vIEZpZWxkLXRvLXByb2ZpbGUgdmFsdWUgbWFwcGluZ1xuZXhwb3J0IGNsYXNzIEZpZWxkTWFwcGVyIHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9maWxlKSB7XG4gICAgICAgIHRoaXMucHJvZmlsZSA9IHByb2ZpbGU7XG4gICAgfVxuICAgIG1hcEZpZWxkVG9WYWx1ZShmaWVsZCkge1xuICAgICAgICBjb25zdCBmaWVsZFR5cGUgPSBmaWVsZC5maWVsZFR5cGU7XG4gICAgICAgIGNvbnN0IG1hcHBpbmcgPSB0aGlzLmdldE1hcHBpbmdzKCk7XG4gICAgICAgIGNvbnN0IG1hcHBlciA9IG1hcHBpbmdbZmllbGRUeXBlXTtcbiAgICAgICAgaWYgKG1hcHBlcikge1xuICAgICAgICAgICAgcmV0dXJuIG1hcHBlcigpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBnZXRNYXBwaW5ncygpIHtcbiAgICAgICAgY29uc3QgcCA9IHRoaXMucHJvZmlsZTtcbiAgICAgICAgY29uc3QgYyA9IHAuY29tcHV0ZWQ7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAvLyBOYW1lIGZpZWxkc1xuICAgICAgICAgICAgZmlyc3ROYW1lOiAoKSA9PiBjPy5maXJzdE5hbWUgfHwgbnVsbCxcbiAgICAgICAgICAgIGxhc3ROYW1lOiAoKSA9PiBjPy5sYXN0TmFtZSB8fCBudWxsLFxuICAgICAgICAgICAgZnVsbE5hbWU6ICgpID0+IHAuY29udGFjdD8ubmFtZSB8fCBudWxsLFxuICAgICAgICAgICAgLy8gQ29udGFjdCBmaWVsZHNcbiAgICAgICAgICAgIGVtYWlsOiAoKSA9PiBwLmNvbnRhY3Q/LmVtYWlsIHx8IG51bGwsXG4gICAgICAgICAgICBwaG9uZTogKCkgPT4gcC5jb250YWN0Py5waG9uZSB8fCBudWxsLFxuICAgICAgICAgICAgYWRkcmVzczogKCkgPT4gcC5jb250YWN0Py5sb2NhdGlvbiB8fCBudWxsLFxuICAgICAgICAgICAgY2l0eTogKCkgPT4gdGhpcy5leHRyYWN0Q2l0eShwLmNvbnRhY3Q/LmxvY2F0aW9uKSxcbiAgICAgICAgICAgIHN0YXRlOiAoKSA9PiB0aGlzLmV4dHJhY3RTdGF0ZShwLmNvbnRhY3Q/LmxvY2F0aW9uKSxcbiAgICAgICAgICAgIHppcENvZGU6ICgpID0+IG51bGwsIC8vIE5vdCB0eXBpY2FsbHkgc3RvcmVkXG4gICAgICAgICAgICBjb3VudHJ5OiAoKSA9PiB0aGlzLmV4dHJhY3RDb3VudHJ5KHAuY29udGFjdD8ubG9jYXRpb24pLFxuICAgICAgICAgICAgLy8gU29jaWFsL1Byb2Zlc3Npb25hbFxuICAgICAgICAgICAgbGlua2VkaW46ICgpID0+IHAuY29udGFjdD8ubGlua2VkaW4gfHwgbnVsbCxcbiAgICAgICAgICAgIGdpdGh1YjogKCkgPT4gcC5jb250YWN0Py5naXRodWIgfHwgbnVsbCxcbiAgICAgICAgICAgIHdlYnNpdGU6ICgpID0+IHAuY29udGFjdD8ud2Vic2l0ZSB8fCBudWxsLFxuICAgICAgICAgICAgcG9ydGZvbGlvOiAoKSA9PiBwLmNvbnRhY3Q/LndlYnNpdGUgfHwgbnVsbCxcbiAgICAgICAgICAgIC8vIEVtcGxveW1lbnRcbiAgICAgICAgICAgIGN1cnJlbnRDb21wYW55OiAoKSA9PiBjPy5jdXJyZW50Q29tcGFueSB8fCBudWxsLFxuICAgICAgICAgICAgY3VycmVudFRpdGxlOiAoKSA9PiBjPy5jdXJyZW50VGl0bGUgfHwgbnVsbCxcbiAgICAgICAgICAgIHllYXJzRXhwZXJpZW5jZTogKCkgPT4gYz8ueWVhcnNFeHBlcmllbmNlPy50b1N0cmluZygpIHx8IG51bGwsXG4gICAgICAgICAgICAvLyBFZHVjYXRpb25cbiAgICAgICAgICAgIHNjaG9vbDogKCkgPT4gYz8ubW9zdFJlY2VudFNjaG9vbCB8fCBudWxsLFxuICAgICAgICAgICAgZWR1Y2F0aW9uOiAoKSA9PiB0aGlzLmZvcm1hdEVkdWNhdGlvbigpLFxuICAgICAgICAgICAgZGVncmVlOiAoKSA9PiBjPy5tb3N0UmVjZW50RGVncmVlIHx8IG51bGwsXG4gICAgICAgICAgICBmaWVsZE9mU3R1ZHk6ICgpID0+IGM/Lm1vc3RSZWNlbnRGaWVsZCB8fCBudWxsLFxuICAgICAgICAgICAgZ3JhZHVhdGlvblllYXI6ICgpID0+IGM/LmdyYWR1YXRpb25ZZWFyIHx8IG51bGwsXG4gICAgICAgICAgICBncGE6ICgpID0+IHAuZWR1Y2F0aW9uPy5bMF0/LmdwYSB8fCBudWxsLFxuICAgICAgICAgICAgLy8gRG9jdW1lbnRzIChyZXR1cm4gbnVsbCwgaGFuZGxlZCBzZXBhcmF0ZWx5KVxuICAgICAgICAgICAgcmVzdW1lOiAoKSA9PiBudWxsLFxuICAgICAgICAgICAgY292ZXJMZXR0ZXI6ICgpID0+IG51bGwsXG4gICAgICAgICAgICAvLyBDb21wZW5zYXRpb25cbiAgICAgICAgICAgIHNhbGFyeTogKCkgPT4gbnVsbCwgLy8gVXNlci1zcGVjaWZpYywgZG9uJ3QgYXV0by1maWxsXG4gICAgICAgICAgICBzYWxhcnlFeHBlY3RhdGlvbjogKCkgPT4gbnVsbCxcbiAgICAgICAgICAgIC8vIEF2YWlsYWJpbGl0eVxuICAgICAgICAgICAgc3RhcnREYXRlOiAoKSA9PiBudWxsLCAvLyBVc2VyLXNwZWNpZmljXG4gICAgICAgICAgICBhdmFpbGFiaWxpdHk6ICgpID0+IG51bGwsXG4gICAgICAgICAgICAvLyBXb3JrIGF1dGhvcml6YXRpb24gKHNlbnNpdGl2ZSwgZG9uJ3QgYXV0by1maWxsKVxuICAgICAgICAgICAgd29ya0F1dGhvcml6YXRpb246ICgpID0+IG51bGwsXG4gICAgICAgICAgICBzcG9uc29yc2hpcDogKCkgPT4gbnVsbCxcbiAgICAgICAgICAgIC8vIEVFTyBmaWVsZHMgKHNlbnNpdGl2ZSwgZG9uJ3QgYXV0by1maWxsKVxuICAgICAgICAgICAgdmV0ZXJhblN0YXR1czogKCkgPT4gbnVsbCxcbiAgICAgICAgICAgIGRpc2FiaWxpdHk6ICgpID0+IG51bGwsXG4gICAgICAgICAgICBnZW5kZXI6ICgpID0+IG51bGwsXG4gICAgICAgICAgICBldGhuaWNpdHk6ICgpID0+IG51bGwsXG4gICAgICAgICAgICAvLyBTa2lsbHMvU3VtbWFyeVxuICAgICAgICAgICAgc2tpbGxzOiAoKSA9PiBjPy5za2lsbHNMaXN0IHx8IG51bGwsXG4gICAgICAgICAgICBzdW1tYXJ5OiAoKSA9PiBwLnN1bW1hcnkgfHwgbnVsbCxcbiAgICAgICAgICAgIGV4cGVyaWVuY2U6ICgpID0+IHRoaXMuZm9ybWF0RXhwZXJpZW5jZSgpLFxuICAgICAgICAgICAgLy8gQ3VzdG9tL1Vua25vd24gKGhhbmRsZWQgYnkgbGVhcm5pbmcgc3lzdGVtKVxuICAgICAgICAgICAgY3VzdG9tUXVlc3Rpb246ICgpID0+IG51bGwsXG4gICAgICAgICAgICB1bmtub3duOiAoKSA9PiBudWxsLFxuICAgICAgICB9O1xuICAgIH1cbiAgICBleHRyYWN0Q2l0eShsb2NhdGlvbikge1xuICAgICAgICBpZiAoIWxvY2F0aW9uKVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIC8vIENvbW1vbiBwYXR0ZXJuOiBcIkNpdHksIFN0YXRlXCIgb3IgXCJDaXR5LCBTdGF0ZSwgQ291bnRyeVwiXG4gICAgICAgIGNvbnN0IHBhcnRzID0gbG9jYXRpb24uc3BsaXQoJywnKS5tYXAoKHApID0+IHAudHJpbSgpKTtcbiAgICAgICAgcmV0dXJuIHBhcnRzWzBdIHx8IG51bGw7XG4gICAgfVxuICAgIGV4dHJhY3RTdGF0ZShsb2NhdGlvbikge1xuICAgICAgICBpZiAoIWxvY2F0aW9uKVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIGNvbnN0IHBhcnRzID0gbG9jYXRpb24uc3BsaXQoJywnKS5tYXAoKHApID0+IHAudHJpbSgpKTtcbiAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA+PSAyKSB7XG4gICAgICAgICAgICAvLyBIYW5kbGUgXCJDQVwiIG9yIFwiQ2FsaWZvcm5pYVwiIG9yIFwiQ0EgOTQxMDVcIlxuICAgICAgICAgICAgY29uc3Qgc3RhdGUgPSBwYXJ0c1sxXS5zcGxpdCgnICcpWzBdO1xuICAgICAgICAgICAgcmV0dXJuIHN0YXRlIHx8IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGV4dHJhY3RDb3VudHJ5KGxvY2F0aW9uKSB7XG4gICAgICAgIGlmICghbG9jYXRpb24pXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgY29uc3QgcGFydHMgPSBsb2NhdGlvbi5zcGxpdCgnLCcpLm1hcCgocCkgPT4gcC50cmltKCkpO1xuICAgICAgICBpZiAocGFydHMubGVuZ3RoID49IDMpIHtcbiAgICAgICAgICAgIHJldHVybiBwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXTtcbiAgICAgICAgfVxuICAgICAgICAvLyBEZWZhdWx0IHRvIFVTQSBpZiBvbmx5IGNpdHkvc3RhdGVcbiAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgICAgICAgcmV0dXJuICdVbml0ZWQgU3RhdGVzJztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZm9ybWF0RWR1Y2F0aW9uKCkge1xuICAgICAgICBjb25zdCBlZHUgPSB0aGlzLnByb2ZpbGUuZWR1Y2F0aW9uPy5bMF07XG4gICAgICAgIGlmICghZWR1KVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIHJldHVybiBgJHtlZHUuZGVncmVlfSBpbiAke2VkdS5maWVsZH0gZnJvbSAke2VkdS5pbnN0aXR1dGlvbn1gO1xuICAgIH1cbiAgICBmb3JtYXRFeHBlcmllbmNlKCkge1xuICAgICAgICBjb25zdCBleHBzID0gdGhpcy5wcm9maWxlLmV4cGVyaWVuY2VzO1xuICAgICAgICBpZiAoIWV4cHMgfHwgZXhwcy5sZW5ndGggPT09IDApXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgcmV0dXJuIGV4cHNcbiAgICAgICAgICAgIC5zbGljZSgwLCAzKVxuICAgICAgICAgICAgLm1hcCgoZXhwKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwZXJpb2QgPSBleHAuY3VycmVudFxuICAgICAgICAgICAgICAgID8gYCR7ZXhwLnN0YXJ0RGF0ZX0gLSBQcmVzZW50YFxuICAgICAgICAgICAgICAgIDogYCR7ZXhwLnN0YXJ0RGF0ZX0gLSAke2V4cC5lbmREYXRlfWA7XG4gICAgICAgICAgICByZXR1cm4gYCR7ZXhwLnRpdGxlfSBhdCAke2V4cC5jb21wYW55fSAoJHtwZXJpb2R9KWA7XG4gICAgICAgIH0pXG4gICAgICAgICAgICAuam9pbignXFxuJyk7XG4gICAgfVxuICAgIC8vIEdldCBhbGwgbWFwcGVkIHZhbHVlcyBmb3IgYSBmb3JtXG4gICAgZ2V0QWxsTWFwcGVkVmFsdWVzKGZpZWxkcykge1xuICAgICAgICBjb25zdCB2YWx1ZXMgPSBuZXcgTWFwKCk7XG4gICAgICAgIGZvciAoY29uc3QgZmllbGQgb2YgZmllbGRzKSB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMubWFwRmllbGRUb1ZhbHVlKGZpZWxkKTtcbiAgICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHZhbHVlcy5zZXQoZmllbGQuZWxlbWVudCwgdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWx1ZXM7XG4gICAgfVxufVxuIiwiLy8gQXV0by1maWxsIGVuZ2luZSBvcmNoZXN0cmF0b3JcbmV4cG9ydCBjbGFzcyBBdXRvRmlsbEVuZ2luZSB7XG4gICAgY29uc3RydWN0b3IoZGV0ZWN0b3IsIG1hcHBlcikge1xuICAgICAgICB0aGlzLmRldGVjdG9yID0gZGV0ZWN0b3I7XG4gICAgICAgIHRoaXMubWFwcGVyID0gbWFwcGVyO1xuICAgIH1cbiAgICBhc3luYyBmaWxsRm9ybShmaWVsZHMpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0ge1xuICAgICAgICAgICAgZmlsbGVkOiAwLFxuICAgICAgICAgICAgc2tpcHBlZDogMCxcbiAgICAgICAgICAgIGVycm9yczogMCxcbiAgICAgICAgICAgIGRldGFpbHM6IFtdLFxuICAgICAgICB9O1xuICAgICAgICBmb3IgKGNvbnN0IGZpZWxkIG9mIGZpZWxkcykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMubWFwcGVyLm1hcEZpZWxkVG9WYWx1ZShmaWVsZCk7XG4gICAgICAgICAgICAgICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQuc2tpcHBlZCsrO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQuZGV0YWlscy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpZWxkVHlwZTogZmllbGQuZmllbGRUeXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsbGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBmaWxsZWQgPSBhd2FpdCB0aGlzLmZpbGxGaWVsZChmaWVsZC5lbGVtZW50LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgaWYgKGZpbGxlZCkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQuZmlsbGVkKys7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5kZXRhaWxzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgZmllbGRUeXBlOiBmaWVsZC5maWVsZFR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxsZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnNraXBwZWQrKztcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LmRldGFpbHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWVsZFR5cGU6IGZpZWxkLmZpZWxkVHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGxlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQuZXJyb3JzKys7XG4gICAgICAgICAgICAgICAgcmVzdWx0LmRldGFpbHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGZpZWxkVHlwZTogZmllbGQuZmllbGRUeXBlLFxuICAgICAgICAgICAgICAgICAgICBmaWxsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogZXJyLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgYXN5bmMgZmlsbEZpZWxkKGVsZW1lbnQsIHZhbHVlKSB7XG4gICAgICAgIGNvbnN0IHRhZ05hbWUgPSBlbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgY29uc3QgaW5wdXRUeXBlID0gZWxlbWVudC50eXBlPy50b0xvd2VyQ2FzZSgpIHx8ICd0ZXh0JztcbiAgICAgICAgLy8gSGFuZGxlIGRpZmZlcmVudCBpbnB1dCB0eXBlc1xuICAgICAgICBpZiAodGFnTmFtZSA9PT0gJ3NlbGVjdCcpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbGxTZWxlY3QoZWxlbWVudCwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0YWdOYW1lID09PSAndGV4dGFyZWEnKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5maWxsVGV4dElucHV0KGVsZW1lbnQsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGFnTmFtZSA9PT0gJ2lucHV0Jykge1xuICAgICAgICAgICAgc3dpdGNoIChpbnB1dFR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICd0ZXh0JzpcbiAgICAgICAgICAgICAgICBjYXNlICdlbWFpbCc6XG4gICAgICAgICAgICAgICAgY2FzZSAndGVsJzpcbiAgICAgICAgICAgICAgICBjYXNlICd1cmwnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ251bWJlcic6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbGxUZXh0SW5wdXQoZWxlbWVudCwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2NoZWNrYm94JzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmlsbENoZWNrYm94KGVsZW1lbnQsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICBjYXNlICdyYWRpbyc6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbGxSYWRpbyhlbGVtZW50LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgY2FzZSAnZGF0ZSc6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbGxEYXRlSW5wdXQoZWxlbWVudCwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbGxUZXh0SW5wdXQoZWxlbWVudCwgdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgZmlsbFRleHRJbnB1dChlbGVtZW50LCB2YWx1ZSkge1xuICAgICAgICAvLyBGb2N1cyB0aGUgZWxlbWVudFxuICAgICAgICBlbGVtZW50LmZvY3VzKCk7XG4gICAgICAgIC8vIENsZWFyIGV4aXN0aW5nIHZhbHVlXG4gICAgICAgIGVsZW1lbnQudmFsdWUgPSAnJztcbiAgICAgICAgLy8gU2V0IG5ldyB2YWx1ZVxuICAgICAgICBlbGVtZW50LnZhbHVlID0gdmFsdWU7XG4gICAgICAgIC8vIERpc3BhdGNoIGV2ZW50cyB0byB0cmlnZ2VyIHZhbGlkYXRpb24gYW5kIGZyYW1ld29ya3NcbiAgICAgICAgdGhpcy5kaXNwYXRjaElucHV0RXZlbnRzKGVsZW1lbnQpO1xuICAgICAgICByZXR1cm4gZWxlbWVudC52YWx1ZSA9PT0gdmFsdWU7XG4gICAgfVxuICAgIGZpbGxTZWxlY3QoZWxlbWVudCwgdmFsdWUpIHtcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IEFycmF5LmZyb20oZWxlbWVudC5vcHRpb25zKTtcbiAgICAgICAgY29uc3Qgbm9ybWFsaXplZFZhbHVlID0gdmFsdWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgLy8gVHJ5IGV4YWN0IG1hdGNoIGZpcnN0XG4gICAgICAgIGxldCBtYXRjaGluZ09wdGlvbiA9IG9wdGlvbnMuZmluZCgob3B0KSA9PiBvcHQudmFsdWUudG9Mb3dlckNhc2UoKSA9PT0gbm9ybWFsaXplZFZhbHVlIHx8IG9wdC50ZXh0LnRvTG93ZXJDYXNlKCkgPT09IG5vcm1hbGl6ZWRWYWx1ZSk7XG4gICAgICAgIC8vIFRyeSBwYXJ0aWFsIG1hdGNoXG4gICAgICAgIGlmICghbWF0Y2hpbmdPcHRpb24pIHtcbiAgICAgICAgICAgIG1hdGNoaW5nT3B0aW9uID0gb3B0aW9ucy5maW5kKChvcHQpID0+IG9wdC52YWx1ZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKG5vcm1hbGl6ZWRWYWx1ZSkgfHxcbiAgICAgICAgICAgICAgICBvcHQudGV4dC50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKG5vcm1hbGl6ZWRWYWx1ZSkgfHxcbiAgICAgICAgICAgICAgICBub3JtYWxpemVkVmFsdWUuaW5jbHVkZXMob3B0LnZhbHVlLnRvTG93ZXJDYXNlKCkpIHx8XG4gICAgICAgICAgICAgICAgbm9ybWFsaXplZFZhbHVlLmluY2x1ZGVzKG9wdC50ZXh0LnRvTG93ZXJDYXNlKCkpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobWF0Y2hpbmdPcHRpb24pIHtcbiAgICAgICAgICAgIGVsZW1lbnQudmFsdWUgPSBtYXRjaGluZ09wdGlvbi52YWx1ZTtcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hJbnB1dEV2ZW50cyhlbGVtZW50KTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgZmlsbENoZWNrYm94KGVsZW1lbnQsIHZhbHVlKSB7XG4gICAgICAgIGNvbnN0IHNob3VsZENoZWNrID0gWyd0cnVlJywgJ3llcycsICcxJywgJ29uJ10uaW5jbHVkZXModmFsdWUudG9Mb3dlckNhc2UoKSk7XG4gICAgICAgIGVsZW1lbnQuY2hlY2tlZCA9IHNob3VsZENoZWNrO1xuICAgICAgICB0aGlzLmRpc3BhdGNoSW5wdXRFdmVudHMoZWxlbWVudCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBmaWxsUmFkaW8oZWxlbWVudCwgdmFsdWUpIHtcbiAgICAgICAgY29uc3Qgbm9ybWFsaXplZFZhbHVlID0gdmFsdWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgLy8gRmluZCB0aGUgcmFkaW8gZ3JvdXBcbiAgICAgICAgY29uc3QgbmFtZSA9IGVsZW1lbnQubmFtZTtcbiAgICAgICAgaWYgKCFuYW1lKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICBjb25zdCByYWRpb3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGBpbnB1dFt0eXBlPVwicmFkaW9cIl1bbmFtZT1cIiR7bmFtZX1cIl1gKTtcbiAgICAgICAgZm9yIChjb25zdCByYWRpbyBvZiByYWRpb3MpIHtcbiAgICAgICAgICAgIGNvbnN0IHJhZGlvSW5wdXQgPSByYWRpbztcbiAgICAgICAgICAgIGNvbnN0IHJhZGlvVmFsdWUgPSByYWRpb0lucHV0LnZhbHVlLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICBjb25zdCByYWRpb0xhYmVsID0gdGhpcy5nZXRSYWRpb0xhYmVsKHJhZGlvSW5wdXQpPy50b0xvd2VyQ2FzZSgpIHx8ICcnO1xuICAgICAgICAgICAgaWYgKHJhZGlvVmFsdWUgPT09IG5vcm1hbGl6ZWRWYWx1ZSB8fFxuICAgICAgICAgICAgICAgIHJhZGlvTGFiZWwuaW5jbHVkZXMobm9ybWFsaXplZFZhbHVlKSB8fFxuICAgICAgICAgICAgICAgIG5vcm1hbGl6ZWRWYWx1ZS5pbmNsdWRlcyhyYWRpb1ZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHJhZGlvSW5wdXQuY2hlY2tlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaElucHV0RXZlbnRzKHJhZGlvSW5wdXQpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgZmlsbERhdGVJbnB1dChlbGVtZW50LCB2YWx1ZSkge1xuICAgICAgICAvLyBUcnkgdG8gcGFyc2UgYW5kIGZvcm1hdCB0aGUgZGF0ZVxuICAgICAgICBjb25zdCBkYXRlID0gbmV3IERhdGUodmFsdWUpO1xuICAgICAgICBpZiAoaXNOYU4oZGF0ZS5nZXRUaW1lKCkpKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAvLyBGb3JtYXQgYXMgWVlZWS1NTS1ERCBmb3IgZGF0ZSBpbnB1dFxuICAgICAgICBjb25zdCBmb3JtYXR0ZWQgPSBkYXRlLnRvSVNPU3RyaW5nKCkuc3BsaXQoJ1QnKVswXTtcbiAgICAgICAgZWxlbWVudC52YWx1ZSA9IGZvcm1hdHRlZDtcbiAgICAgICAgdGhpcy5kaXNwYXRjaElucHV0RXZlbnRzKGVsZW1lbnQpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgZ2V0UmFkaW9MYWJlbChyYWRpbykge1xuICAgICAgICAvLyBDaGVjayBmb3IgYXNzb2NpYXRlZCBsYWJlbFxuICAgICAgICBpZiAocmFkaW8uaWQpIHtcbiAgICAgICAgICAgIGNvbnN0IGxhYmVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgbGFiZWxbZm9yPVwiJHtyYWRpby5pZH1cIl1gKTtcbiAgICAgICAgICAgIGlmIChsYWJlbClcbiAgICAgICAgICAgICAgICByZXR1cm4gbGFiZWwudGV4dENvbnRlbnQ/LnRyaW0oKSB8fCBudWxsO1xuICAgICAgICB9XG4gICAgICAgIC8vIENoZWNrIGZvciB3cmFwcGluZyBsYWJlbFxuICAgICAgICBjb25zdCBwYXJlbnQgPSByYWRpby5jbG9zZXN0KCdsYWJlbCcpO1xuICAgICAgICBpZiAocGFyZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gcGFyZW50LnRleHRDb250ZW50Py50cmltKCkgfHwgbnVsbDtcbiAgICAgICAgfVxuICAgICAgICAvLyBDaGVjayBmb3IgbmV4dCBzaWJsaW5nIHRleHRcbiAgICAgICAgY29uc3QgbmV4dCA9IHJhZGlvLm5leHRTaWJsaW5nO1xuICAgICAgICBpZiAobmV4dD8ubm9kZVR5cGUgPT09IE5vZGUuVEVYVF9OT0RFKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV4dC50ZXh0Q29udGVudD8udHJpbSgpIHx8IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGRpc3BhdGNoSW5wdXRFdmVudHMoZWxlbWVudCkge1xuICAgICAgICAvLyBEaXNwYXRjaCBldmVudHMgaW4gb3JkZXIgdGhhdCBtb3N0IGZyYW1ld29ya3MgZXhwZWN0XG4gICAgICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2ZvY3VzJywgeyBidWJibGVzOiB0cnVlIH0pKTtcbiAgICAgICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnaW5wdXQnLCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xuICAgICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdjaGFuZ2UnLCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xuICAgICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdibHVyJywgeyBidWJibGVzOiB0cnVlIH0pKTtcbiAgICAgICAgLy8gRm9yIFJlYWN0IGNvbnRyb2xsZWQgY29tcG9uZW50c1xuICAgICAgICBjb25zdCBuYXRpdmVJbnB1dFZhbHVlU2V0dGVyID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih3aW5kb3cuSFRNTElucHV0RWxlbWVudC5wcm90b3R5cGUsICd2YWx1ZScpPy5zZXQ7XG4gICAgICAgIGlmIChuYXRpdmVJbnB1dFZhbHVlU2V0dGVyICYmIGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGVsZW1lbnQudmFsdWU7XG4gICAgICAgICAgICBuYXRpdmVJbnB1dFZhbHVlU2V0dGVyLmNhbGwoZWxlbWVudCwgdmFsdWUpO1xuICAgICAgICAgICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnaW5wdXQnLCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8gQmFzZSBzY3JhcGVyIGludGVyZmFjZSBhbmQgdXRpbGl0aWVzXG5leHBvcnQgY2xhc3MgQmFzZVNjcmFwZXIge1xuICAgIC8vIFNoYXJlZCB1dGlsaXRpZXNcbiAgICBleHRyYWN0VGV4dENvbnRlbnQoc2VsZWN0b3IpIHtcbiAgICAgICAgY29uc3QgZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgICAgcmV0dXJuIGVsPy50ZXh0Q29udGVudD8udHJpbSgpIHx8IG51bGw7XG4gICAgfVxuICAgIGV4dHJhY3RIdG1sQ29udGVudChzZWxlY3Rvcikge1xuICAgICAgICBjb25zdCBlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICAgICByZXR1cm4gZWw/LmlubmVySFRNTD8udHJpbSgpIHx8IG51bGw7XG4gICAgfVxuICAgIGV4dHJhY3RBdHRyaWJ1dGUoc2VsZWN0b3IsIGF0dHIpIHtcbiAgICAgICAgY29uc3QgZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgICAgcmV0dXJuIGVsPy5nZXRBdHRyaWJ1dGUoYXR0cikgfHwgbnVsbDtcbiAgICB9XG4gICAgZXh0cmFjdEFsbFRleHQoc2VsZWN0b3IpIHtcbiAgICAgICAgY29uc3QgZWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20oZWxlbWVudHMpXG4gICAgICAgICAgICAubWFwKChlbCkgPT4gZWwudGV4dENvbnRlbnQ/LnRyaW0oKSlcbiAgICAgICAgICAgIC5maWx0ZXIoKHRleHQpID0+ICEhdGV4dCk7XG4gICAgfVxuICAgIHdhaXRGb3JFbGVtZW50KHNlbGVjdG9yLCB0aW1lb3V0ID0gNTAwMCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgICAgICAgIGlmIChlbClcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZShlbCk7XG4gICAgICAgICAgICBjb25zdCBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKChfLCBvYnMpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICAgICAgICAgICAgIGlmIChlbCkge1xuICAgICAgICAgICAgICAgICAgICBvYnMuZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGVsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIG9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQuYm9keSwgeyBjaGlsZExpc3Q6IHRydWUsIHN1YnRyZWU6IHRydWUgfSk7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgRWxlbWVudCAke3NlbGVjdG9yfSBub3QgZm91bmQgYWZ0ZXIgJHt0aW1lb3V0fW1zYCkpO1xuICAgICAgICAgICAgfSwgdGltZW91dCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBleHRyYWN0UmVxdWlyZW1lbnRzKHRleHQpIHtcbiAgICAgICAgY29uc3QgcmVxdWlyZW1lbnRzID0gW107XG4gICAgICAgIC8vIFNwbGl0IGJ5IGNvbW1vbiBidWxsZXQgcGF0dGVybnNcbiAgICAgICAgY29uc3QgbGluZXMgPSB0ZXh0LnNwbGl0KC9cXG584oCifOKXpnzil4Z84paqfOKXj3wtXFxzfFxcKlxccy8pO1xuICAgICAgICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGNsZWFuZWQgPSBsaW5lLnRyaW0oKTtcbiAgICAgICAgICAgIGlmIChjbGVhbmVkLmxlbmd0aCA+IDIwICYmIGNsZWFuZWQubGVuZ3RoIDwgNTAwKSB7XG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgaWYgaXQgbG9va3MgbGlrZSBhIHJlcXVpcmVtZW50XG4gICAgICAgICAgICAgICAgaWYgKGNsZWFuZWQubWF0Y2goL14oeW91fHdlfHRoZXxtdXN0fHNob3VsZHx3aWxsfGV4cGVyaWVuY2V8cHJvZmljaWVuY3l8a25vd2xlZGdlfGFiaWxpdHl8c3Ryb25nfGV4Y2VsbGVudCkvaSkgfHxcbiAgICAgICAgICAgICAgICAgICAgY2xlYW5lZC5tYXRjaCgvcmVxdWlyZWR8cHJlZmVycmVkfGJvbnVzfHBsdXMvaSkgfHxcbiAgICAgICAgICAgICAgICAgICAgY2xlYW5lZC5tYXRjaCgvXlxcZCtcXCs/XFxzKnllYXJzPy9pKSkge1xuICAgICAgICAgICAgICAgICAgICByZXF1aXJlbWVudHMucHVzaChjbGVhbmVkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlcXVpcmVtZW50cy5zbGljZSgwLCAxNSk7XG4gICAgfVxuICAgIGV4dHJhY3RLZXl3b3Jkcyh0ZXh0KSB7XG4gICAgICAgIGNvbnN0IGtleXdvcmRzID0gbmV3IFNldCgpO1xuICAgICAgICAvLyBDb21tb24gdGVjaCBza2lsbHMgcGF0dGVybnNcbiAgICAgICAgY29uc3QgdGVjaFBhdHRlcm5zID0gW1xuICAgICAgICAgICAgL1xcYihyZWFjdHxhbmd1bGFyfHZ1ZXxzdmVsdGV8bmV4dFxcLj9qc3xudXh0KVxcYi9naSxcbiAgICAgICAgICAgIC9cXGIobm9kZVxcLj9qc3xleHByZXNzfGZhc3RpZnl8bmVzdFxcLj9qcylcXGIvZ2ksXG4gICAgICAgICAgICAvXFxiKHB5dGhvbnxkamFuZ298Zmxhc2t8ZmFzdGFwaSlcXGIvZ2ksXG4gICAgICAgICAgICAvXFxiKGphdmF8c3ByaW5nfGtvdGxpbilcXGIvZ2ksXG4gICAgICAgICAgICAvXFxiKGdvfGdvbGFuZ3xydXN0fGNcXCtcXCt8YyN8XFwubmV0KVxcYi9naSxcbiAgICAgICAgICAgIC9cXGIodHlwZXNjcmlwdHxqYXZhc2NyaXB0fGVzNilcXGIvZ2ksXG4gICAgICAgICAgICAvXFxiKHNxbHxteXNxbHxwb3N0Z3Jlc3FsfG1vbmdvZGJ8cmVkaXN8ZWxhc3RpY3NlYXJjaClcXGIvZ2ksXG4gICAgICAgICAgICAvXFxiKGF3c3xnY3B8YXp1cmV8ZG9ja2VyfGt1YmVybmV0ZXN8azhzKVxcYi9naSxcbiAgICAgICAgICAgIC9cXGIoZ2l0fGNpXFwvY2R8amVua2luc3xnaXRodWJcXHMqYWN0aW9ucylcXGIvZ2ksXG4gICAgICAgICAgICAvXFxiKGdyYXBocWx8cmVzdHxhcGl8bWljcm9zZXJ2aWNlcylcXGIvZ2ksXG4gICAgICAgIF07XG4gICAgICAgIGZvciAoY29uc3QgcGF0dGVybiBvZiB0ZWNoUGF0dGVybnMpIHtcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoZXMgPSB0ZXh0Lm1hdGNoKHBhdHRlcm4pO1xuICAgICAgICAgICAgaWYgKG1hdGNoZXMpIHtcbiAgICAgICAgICAgICAgICBtYXRjaGVzLmZvckVhY2goKG0pID0+IGtleXdvcmRzLmFkZChtLnRvTG93ZXJDYXNlKCkudHJpbSgpKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20oa2V5d29yZHMpO1xuICAgIH1cbiAgICBkZXRlY3RKb2JUeXBlKHRleHQpIHtcbiAgICAgICAgY29uc3QgbG93ZXIgPSB0ZXh0LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGlmIChsb3dlci5pbmNsdWRlcygnaW50ZXJuJykgfHwgbG93ZXIuaW5jbHVkZXMoJ2ludGVybnNoaXAnKSB8fCBsb3dlci5pbmNsdWRlcygnY28tb3AnKSkge1xuICAgICAgICAgICAgcmV0dXJuICdpbnRlcm5zaGlwJztcbiAgICAgICAgfVxuICAgICAgICBpZiAobG93ZXIuaW5jbHVkZXMoJ2NvbnRyYWN0JykgfHwgbG93ZXIuaW5jbHVkZXMoJ2NvbnRyYWN0b3InKSkge1xuICAgICAgICAgICAgcmV0dXJuICdjb250cmFjdCc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxvd2VyLmluY2x1ZGVzKCdwYXJ0LXRpbWUnKSB8fCBsb3dlci5pbmNsdWRlcygncGFydCB0aW1lJykpIHtcbiAgICAgICAgICAgIHJldHVybiAncGFydC10aW1lJztcbiAgICAgICAgfVxuICAgICAgICBpZiAobG93ZXIuaW5jbHVkZXMoJ2Z1bGwtdGltZScpIHx8IGxvd2VyLmluY2x1ZGVzKCdmdWxsIHRpbWUnKSkge1xuICAgICAgICAgICAgcmV0dXJuICdmdWxsLXRpbWUnO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGRldGVjdFJlbW90ZSh0ZXh0KSB7XG4gICAgICAgIGNvbnN0IGxvd2VyID0gdGV4dC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICByZXR1cm4gKGxvd2VyLmluY2x1ZGVzKCdyZW1vdGUnKSB8fFxuICAgICAgICAgICAgbG93ZXIuaW5jbHVkZXMoJ3dvcmsgZnJvbSBob21lJykgfHxcbiAgICAgICAgICAgIGxvd2VyLmluY2x1ZGVzKCd3ZmgnKSB8fFxuICAgICAgICAgICAgbG93ZXIuaW5jbHVkZXMoJ2Z1bGx5IGRpc3RyaWJ1dGVkJykgfHxcbiAgICAgICAgICAgIGxvd2VyLmluY2x1ZGVzKCdhbnl3aGVyZScpKTtcbiAgICB9XG4gICAgZXh0cmFjdFNhbGFyeSh0ZXh0KSB7XG4gICAgICAgIC8vIE1hdGNoIHNhbGFyeSBwYXR0ZXJucyBsaWtlICQxMDAsMDAwIC0gJDE1MCwwMDAgb3IgJDEwMGsgLSAkMTUwa1xuICAgICAgICBjb25zdCBwYXR0ZXJuID0gL1xcJFtcXGQsXSsoPzprKT8oPzpcXHMqWy3igJNdXFxzKlxcJFtcXGQsXSsoPzprKT8pPyg/OlxccyooPzpwZXJ8XFwvKVxccyooPzp5ZWFyfHlyfGFubnVtfGFubnVhbHxob3VyfGhyKSk/L2dpO1xuICAgICAgICBjb25zdCBtYXRjaCA9IHBhdHRlcm4uZXhlYyh0ZXh0KTtcbiAgICAgICAgcmV0dXJuIG1hdGNoID8gbWF0Y2hbMF0gOiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGNsZWFuRGVzY3JpcHRpb24oaHRtbCkge1xuICAgICAgICAvLyBSZW1vdmUgSFRNTCB0YWdzIGJ1dCBwcmVzZXJ2ZSBsaW5lIGJyZWFrc1xuICAgICAgICByZXR1cm4gaHRtbFxuICAgICAgICAgICAgLnJlcGxhY2UoLzxiclxccypcXC8/Pi9naSwgJ1xcbicpXG4gICAgICAgICAgICAucmVwbGFjZSgvPFxcL3A+L2dpLCAnXFxuXFxuJylcbiAgICAgICAgICAgIC5yZXBsYWNlKC88XFwvZGl2Pi9naSwgJ1xcbicpXG4gICAgICAgICAgICAucmVwbGFjZSgvPFxcL2xpPi9naSwgJ1xcbicpXG4gICAgICAgICAgICAucmVwbGFjZSgvPFtePl0rPi9nLCAnJylcbiAgICAgICAgICAgIC5yZXBsYWNlKC8mbmJzcDsvZywgJyAnKVxuICAgICAgICAgICAgLnJlcGxhY2UoLyZhbXA7L2csICcmJylcbiAgICAgICAgICAgIC5yZXBsYWNlKC8mbHQ7L2csICc8JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC8mZ3Q7L2csICc+JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cXG57Myx9L2csICdcXG5cXG4nKVxuICAgICAgICAgICAgLnRyaW0oKTtcbiAgICB9XG59XG4iLCIvLyBMaW5rZWRJbiBqb2Igc2NyYXBlclxuaW1wb3J0IHsgQmFzZVNjcmFwZXIgfSBmcm9tICcuL2Jhc2Utc2NyYXBlcic7XG5leHBvcnQgY2xhc3MgTGlua2VkSW5TY3JhcGVyIGV4dGVuZHMgQmFzZVNjcmFwZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlciguLi5hcmd1bWVudHMpO1xuICAgICAgICB0aGlzLnNvdXJjZSA9ICdsaW5rZWRpbic7XG4gICAgICAgIHRoaXMudXJsUGF0dGVybnMgPSBbXG4gICAgICAgICAgICAvbGlua2VkaW5cXC5jb21cXC9qb2JzXFwvdmlld1xcLyhcXGQrKS8sXG4gICAgICAgICAgICAvbGlua2VkaW5cXC5jb21cXC9qb2JzXFwvc2VhcmNoLyxcbiAgICAgICAgICAgIC9saW5rZWRpblxcLmNvbVxcL2pvYnNcXC9jb2xsZWN0aW9ucy8sXG4gICAgICAgIF07XG4gICAgfVxuICAgIGNhbkhhbmRsZSh1cmwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudXJsUGF0dGVybnMuc29tZSgocCkgPT4gcC50ZXN0KHVybCkpO1xuICAgIH1cbiAgICBhc3luYyBzY3JhcGVKb2JMaXN0aW5nKCkge1xuICAgICAgICAvLyBXYWl0IGZvciBqb2IgZGV0YWlscyB0byBsb2FkXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLndhaXRGb3JFbGVtZW50KCcuam9iLWRldGFpbHMtam9icy11bmlmaWVkLXRvcC1jYXJkX19qb2ItdGl0bGUsIC5qb2JzLXVuaWZpZWQtdG9wLWNhcmRfX2pvYi10aXRsZScsIDMwMDApO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIHtcbiAgICAgICAgICAgIC8vIFRyeSBhbHRlcm5hdGl2ZSBzZWxlY3RvcnNcbiAgICAgICAgfVxuICAgICAgICAvLyBUcnkgbXVsdGlwbGUgc2VsZWN0b3Igc3RyYXRlZ2llcyAoTGlua2VkSW4gY2hhbmdlcyBET00gZnJlcXVlbnRseSlcbiAgICAgICAgY29uc3QgdGl0bGUgPSB0aGlzLmV4dHJhY3RKb2JUaXRsZSgpO1xuICAgICAgICBjb25zdCBjb21wYW55ID0gdGhpcy5leHRyYWN0Q29tcGFueSgpO1xuICAgICAgICBjb25zdCBsb2NhdGlvbiA9IHRoaXMuZXh0cmFjdExvY2F0aW9uKCk7XG4gICAgICAgIGNvbnN0IGRlc2NyaXB0aW9uID0gdGhpcy5leHRyYWN0RGVzY3JpcHRpb24oKTtcbiAgICAgICAgaWYgKCF0aXRsZSB8fCAhY29tcGFueSB8fCAhZGVzY3JpcHRpb24pIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbQ29sdW1idXNdIExpbmtlZEluIHNjcmFwZXI6IE1pc3NpbmcgcmVxdWlyZWQgZmllbGRzJywgeyB0aXRsZSwgY29tcGFueSwgZGVzY3JpcHRpb246ICEhZGVzY3JpcHRpb24gfSk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICAvLyBUcnkgdG8gZXh0cmFjdCBmcm9tIHN0cnVjdHVyZWQgZGF0YVxuICAgICAgICBjb25zdCBzdHJ1Y3R1cmVkRGF0YSA9IHRoaXMuZXh0cmFjdFN0cnVjdHVyZWREYXRhKCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICAgIGNvbXBhbnksXG4gICAgICAgICAgICBsb2NhdGlvbjogbG9jYXRpb24gfHwgc3RydWN0dXJlZERhdGE/LmxvY2F0aW9uLFxuICAgICAgICAgICAgZGVzY3JpcHRpb24sXG4gICAgICAgICAgICByZXF1aXJlbWVudHM6IHRoaXMuZXh0cmFjdFJlcXVpcmVtZW50cyhkZXNjcmlwdGlvbiksXG4gICAgICAgICAgICBrZXl3b3JkczogdGhpcy5leHRyYWN0S2V5d29yZHMoZGVzY3JpcHRpb24pLFxuICAgICAgICAgICAgc2FsYXJ5OiB0aGlzLmV4dHJhY3RTYWxhcnkoZGVzY3JpcHRpb24pIHx8IHN0cnVjdHVyZWREYXRhPy5zYWxhcnksXG4gICAgICAgICAgICB0eXBlOiB0aGlzLmRldGVjdEpvYlR5cGUoZGVzY3JpcHRpb24pLFxuICAgICAgICAgICAgcmVtb3RlOiB0aGlzLmRldGVjdFJlbW90ZShsb2NhdGlvbiB8fCAnJykgfHwgdGhpcy5kZXRlY3RSZW1vdGUoZGVzY3JpcHRpb24pLFxuICAgICAgICAgICAgdXJsOiB3aW5kb3cubG9jYXRpb24uaHJlZixcbiAgICAgICAgICAgIHNvdXJjZTogdGhpcy5zb3VyY2UsXG4gICAgICAgICAgICBzb3VyY2VKb2JJZDogdGhpcy5leHRyYWN0Sm9iSWQoKSxcbiAgICAgICAgICAgIHBvc3RlZEF0OiBzdHJ1Y3R1cmVkRGF0YT8ucG9zdGVkQXQsXG4gICAgICAgIH07XG4gICAgfVxuICAgIGFzeW5jIHNjcmFwZUpvYkxpc3QoKSB7XG4gICAgICAgIGNvbnN0IGpvYnMgPSBbXTtcbiAgICAgICAgLy8gSm9iIGNhcmRzIGluIHNlYXJjaCByZXN1bHRzXG4gICAgICAgIGNvbnN0IGpvYkNhcmRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpvYi1jYXJkLWNvbnRhaW5lciwgLmpvYnMtc2VhcmNoLXJlc3VsdHNfX2xpc3QtaXRlbSwgLnNjYWZmb2xkLWxheW91dF9fbGlzdC1pdGVtJyk7XG4gICAgICAgIGZvciAoY29uc3QgY2FyZCBvZiBqb2JDYXJkcykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCB0aXRsZUVsID0gY2FyZC5xdWVyeVNlbGVjdG9yKCcuam9iLWNhcmQtbGlzdF9fdGl0bGUsIC5qb2ItY2FyZC1jb250YWluZXJfX2xpbmssIGFbZGF0YS1jb250cm9sLW5hbWU9XCJqb2JfY2FyZF90aXRsZVwiXScpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbXBhbnlFbCA9IGNhcmQucXVlcnlTZWxlY3RvcignLmpvYi1jYXJkLWNvbnRhaW5lcl9fY29tcGFueS1uYW1lLCAuam9iLWNhcmQtY29udGFpbmVyX19wcmltYXJ5LWRlc2NyaXB0aW9uJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgbG9jYXRpb25FbCA9IGNhcmQucXVlcnlTZWxlY3RvcignLmpvYi1jYXJkLWNvbnRhaW5lcl9fbWV0YWRhdGEtaXRlbScpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRpdGxlID0gdGl0bGVFbD8udGV4dENvbnRlbnQ/LnRyaW0oKTtcbiAgICAgICAgICAgICAgICBjb25zdCBjb21wYW55ID0gY29tcGFueUVsPy50ZXh0Q29udGVudD8udHJpbSgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2F0aW9uID0gbG9jYXRpb25FbD8udGV4dENvbnRlbnQ/LnRyaW0oKTtcbiAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSB0aXRsZUVsPy5ocmVmO1xuICAgICAgICAgICAgICAgIGlmICh0aXRsZSAmJiBjb21wYW55ICYmIHVybCkge1xuICAgICAgICAgICAgICAgICAgICBqb2JzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wYW55LFxuICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJycsIC8vIFdvdWxkIG5lZWQgdG8gbmF2aWdhdGUgdG8gZ2V0IGZ1bGwgZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmVtZW50czogW10sXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmwsXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IHRoaXMuc291cmNlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignW0NvbHVtYnVzXSBFcnJvciBzY3JhcGluZyBqb2IgY2FyZDonLCBlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBqb2JzO1xuICAgIH1cbiAgICBleHRyYWN0Sm9iVGl0bGUoKSB7XG4gICAgICAgIGNvbnN0IHNlbGVjdG9ycyA9IFtcbiAgICAgICAgICAgICcuam9iLWRldGFpbHMtam9icy11bmlmaWVkLXRvcC1jYXJkX19qb2ItdGl0bGUnLFxuICAgICAgICAgICAgJy5qb2JzLXVuaWZpZWQtdG9wLWNhcmRfX2pvYi10aXRsZScsXG4gICAgICAgICAgICAnLnQtMjQuam9iLWRldGFpbHMtam9icy11bmlmaWVkLXRvcC1jYXJkX19qb2ItdGl0bGUnLFxuICAgICAgICAgICAgJ2gxLnQtMjQnLFxuICAgICAgICAgICAgJy5qb2JzLXRvcC1jYXJkX19qb2ItdGl0bGUnLFxuICAgICAgICAgICAgJ2gxW2NsYXNzKj1cImpvYi10aXRsZVwiXScsXG4gICAgICAgIF07XG4gICAgICAgIGZvciAoY29uc3Qgc2VsZWN0b3Igb2Ygc2VsZWN0b3JzKSB7XG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0gdGhpcy5leHRyYWN0VGV4dENvbnRlbnQoc2VsZWN0b3IpO1xuICAgICAgICAgICAgaWYgKHRleHQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGV4dHJhY3RDb21wYW55KCkge1xuICAgICAgICBjb25zdCBzZWxlY3RvcnMgPSBbXG4gICAgICAgICAgICAnLmpvYi1kZXRhaWxzLWpvYnMtdW5pZmllZC10b3AtY2FyZF9fY29tcGFueS1uYW1lJyxcbiAgICAgICAgICAgICcuam9icy11bmlmaWVkLXRvcC1jYXJkX19jb21wYW55LW5hbWUnLFxuICAgICAgICAgICAgJy5qb2JzLXRvcC1jYXJkX19jb21wYW55LXVybCcsXG4gICAgICAgICAgICAnYVtkYXRhLXRyYWNraW5nLWNvbnRyb2wtbmFtZT1cInB1YmxpY19qb2JzX3RvcGNhcmQtb3JnLW5hbWVcIl0nLFxuICAgICAgICAgICAgJy5qb2ItZGV0YWlscy1qb2JzLXVuaWZpZWQtdG9wLWNhcmRfX3ByaW1hcnktZGVzY3JpcHRpb24tY29udGFpbmVyIGEnLFxuICAgICAgICBdO1xuICAgICAgICBmb3IgKGNvbnN0IHNlbGVjdG9yIG9mIHNlbGVjdG9ycykge1xuICAgICAgICAgICAgY29uc3QgdGV4dCA9IHRoaXMuZXh0cmFjdFRleHRDb250ZW50KHNlbGVjdG9yKTtcbiAgICAgICAgICAgIGlmICh0ZXh0KVxuICAgICAgICAgICAgICAgIHJldHVybiB0ZXh0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBleHRyYWN0TG9jYXRpb24oKSB7XG4gICAgICAgIGNvbnN0IHNlbGVjdG9ycyA9IFtcbiAgICAgICAgICAgICcuam9iLWRldGFpbHMtam9icy11bmlmaWVkLXRvcC1jYXJkX19idWxsZXQnLFxuICAgICAgICAgICAgJy5qb2JzLXVuaWZpZWQtdG9wLWNhcmRfX2J1bGxldCcsXG4gICAgICAgICAgICAnLmpvYnMtdG9wLWNhcmRfX2J1bGxldCcsXG4gICAgICAgICAgICAnLmpvYi1kZXRhaWxzLWpvYnMtdW5pZmllZC10b3AtY2FyZF9fcHJpbWFyeS1kZXNjcmlwdGlvbi1jb250YWluZXIgLnQtYmxhY2stLWxpZ2h0JyxcbiAgICAgICAgXTtcbiAgICAgICAgZm9yIChjb25zdCBzZWxlY3RvciBvZiBzZWxlY3RvcnMpIHtcbiAgICAgICAgICAgIGNvbnN0IHRleHQgPSB0aGlzLmV4dHJhY3RUZXh0Q29udGVudChzZWxlY3Rvcik7XG4gICAgICAgICAgICBpZiAodGV4dCAmJiAhdGV4dC5pbmNsdWRlcygnYXBwbGljYW50JykgJiYgIXRleHQuaW5jbHVkZXMoJ2FnbycpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGV4dHJhY3REZXNjcmlwdGlvbigpIHtcbiAgICAgICAgY29uc3Qgc2VsZWN0b3JzID0gW1xuICAgICAgICAgICAgJy5qb2JzLWRlc2NyaXB0aW9uX19jb250ZW50JyxcbiAgICAgICAgICAgICcuam9icy1kZXNjcmlwdGlvbi1jb250ZW50X190ZXh0JyxcbiAgICAgICAgICAgICcuam9icy1ib3hfX2h0bWwtY29udGVudCcsXG4gICAgICAgICAgICAnI2pvYi1kZXRhaWxzJyxcbiAgICAgICAgICAgICcuam9icy1kZXNjcmlwdGlvbicsXG4gICAgICAgIF07XG4gICAgICAgIGZvciAoY29uc3Qgc2VsZWN0b3Igb2Ygc2VsZWN0b3JzKSB7XG4gICAgICAgICAgICBjb25zdCBodG1sID0gdGhpcy5leHRyYWN0SHRtbENvbnRlbnQoc2VsZWN0b3IpO1xuICAgICAgICAgICAgaWYgKGh0bWwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jbGVhbkRlc2NyaXB0aW9uKGh0bWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBleHRyYWN0Sm9iSWQoKSB7XG4gICAgICAgIGNvbnN0IG1hdGNoID0gd2luZG93LmxvY2F0aW9uLmhyZWYubWF0Y2goL1xcL3ZpZXdcXC8oXFxkKykvKTtcbiAgICAgICAgcmV0dXJuIG1hdGNoPy5bMV07XG4gICAgfVxuICAgIGV4dHJhY3RTdHJ1Y3R1cmVkRGF0YSgpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGxkSnNvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3NjcmlwdFt0eXBlPVwiYXBwbGljYXRpb24vbGQranNvblwiXScpO1xuICAgICAgICAgICAgaWYgKCFsZEpzb24/LnRleHRDb250ZW50KVxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgY29uc3QgZGF0YSA9IEpTT04ucGFyc2UobGRKc29uLnRleHRDb250ZW50KTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgbG9jYXRpb246IGRhdGEuam9iTG9jYXRpb24/LmFkZHJlc3M/LmFkZHJlc3NMb2NhbGl0eSxcbiAgICAgICAgICAgICAgICBzYWxhcnk6IGRhdGEuYmFzZVNhbGFyeT8udmFsdWVcbiAgICAgICAgICAgICAgICAgICAgPyBgJCR7ZGF0YS5iYXNlU2FsYXJ5LnZhbHVlLm1pblZhbHVlIHx8ICcnfS0ke2RhdGEuYmFzZVNhbGFyeS52YWx1ZS5tYXhWYWx1ZSB8fCAnJ31gXG4gICAgICAgICAgICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIHBvc3RlZEF0OiBkYXRhLmRhdGVQb3N0ZWQsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8gV2F0ZXJsb28gV29ya3Mgam9iIHNjcmFwZXIgKFVuaXZlcnNpdHkgb2YgV2F0ZXJsb28gY28tb3AgcG9ydGFsKVxuaW1wb3J0IHsgQmFzZVNjcmFwZXIgfSBmcm9tICcuL2Jhc2Utc2NyYXBlcic7XG5leHBvcnQgY2xhc3MgV2F0ZXJsb29Xb3Jrc1NjcmFwZXIgZXh0ZW5kcyBCYXNlU2NyYXBlciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKC4uLmFyZ3VtZW50cyk7XG4gICAgICAgIHRoaXMuc291cmNlID0gJ3dhdGVybG9vd29ya3MnO1xuICAgICAgICB0aGlzLnVybFBhdHRlcm5zID0gWy93YXRlcmxvb3dvcmtzXFwudXdhdGVybG9vXFwuY2EvXTtcbiAgICB9XG4gICAgY2FuSGFuZGxlKHVybCkge1xuICAgICAgICByZXR1cm4gdGhpcy51cmxQYXR0ZXJucy5zb21lKChwKSA9PiBwLnRlc3QodXJsKSk7XG4gICAgfVxuICAgIGFzeW5jIHNjcmFwZUpvYkxpc3RpbmcoKSB7XG4gICAgICAgIC8vIENoZWNrIGlmIHVzZXIgaXMgbG9nZ2VkIGluXG4gICAgICAgIGlmICh0aGlzLmlzTG9naW5QYWdlKCkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbQ29sdW1idXNdIFdhdGVybG9vIFdvcmtzOiBQbGVhc2UgbG9nIGluIGZpcnN0Jyk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICAvLyBXYWl0IGZvciBqb2IgZGV0YWlscyB0byBsb2FkXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLndhaXRGb3JFbGVtZW50KCcucG9zdGluZy1kZXRhaWxzLCAuam9iLXBvc3RpbmctZGV0YWlscywgI3Bvc3RpbmdEaXYnLCAzMDAwKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW0NvbHVtYnVzXSBXYXRlcmxvbyBXb3JrczogQ291bGQgbm90IGZpbmQgam9iIGRldGFpbHMnKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRpdGxlID0gdGhpcy5leHRyYWN0Sm9iVGl0bGUoKTtcbiAgICAgICAgY29uc3QgY29tcGFueSA9IHRoaXMuZXh0cmFjdENvbXBhbnkoKTtcbiAgICAgICAgY29uc3QgZGVzY3JpcHRpb24gPSB0aGlzLmV4dHJhY3REZXNjcmlwdGlvbigpO1xuICAgICAgICBpZiAoIXRpdGxlIHx8ICFjb21wYW55IHx8ICFkZXNjcmlwdGlvbikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tDb2x1bWJ1c10gV2F0ZXJsb28gV29ya3Mgc2NyYXBlcjogTWlzc2luZyByZXF1aXJlZCBmaWVsZHMnKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGxvY2F0aW9uID0gdGhpcy5leHRyYWN0TG9jYXRpb24oKTtcbiAgICAgICAgY29uc3QgZGVhZGxpbmUgPSB0aGlzLmV4dHJhY3REZWFkbGluZSgpO1xuICAgICAgICBjb25zdCBkZXRhaWxzID0gdGhpcy5leHRyYWN0RGV0YWlsc1RhYmxlKCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICAgIGNvbXBhbnksXG4gICAgICAgICAgICBsb2NhdGlvbjogbG9jYXRpb24gfHwgZGV0YWlscy5sb2NhdGlvbixcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgcmVxdWlyZW1lbnRzOiB0aGlzLmV4dHJhY3RSZXF1aXJlbWVudHMoZGVzY3JpcHRpb24pLFxuICAgICAgICAgICAga2V5d29yZHM6IHRoaXMuZXh0cmFjdEtleXdvcmRzKGRlc2NyaXB0aW9uKSxcbiAgICAgICAgICAgIHNhbGFyeTogZGV0YWlscy5zYWxhcnksXG4gICAgICAgICAgICB0eXBlOiAnaW50ZXJuc2hpcCcsIC8vIFdhdGVybG9vIFdvcmtzIGlzIGZvciBjby1vcC9pbnRlcm5zaGlwc1xuICAgICAgICAgICAgcmVtb3RlOiB0aGlzLmRldGVjdFJlbW90ZShsb2NhdGlvbiB8fCAnJykgfHwgdGhpcy5kZXRlY3RSZW1vdGUoZGVzY3JpcHRpb24pLFxuICAgICAgICAgICAgdXJsOiB3aW5kb3cubG9jYXRpb24uaHJlZixcbiAgICAgICAgICAgIHNvdXJjZTogdGhpcy5zb3VyY2UsXG4gICAgICAgICAgICBzb3VyY2VKb2JJZDogZGV0YWlscy5qb2JJZCxcbiAgICAgICAgICAgIGRlYWRsaW5lLFxuICAgICAgICB9O1xuICAgIH1cbiAgICBhc3luYyBzY3JhcGVKb2JMaXN0KCkge1xuICAgICAgICBjb25zdCBqb2JzID0gW107XG4gICAgICAgIC8vIENoZWNrIGlmIGxvZ2dlZCBpblxuICAgICAgICBpZiAodGhpcy5pc0xvZ2luUGFnZSgpKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW0NvbHVtYnVzXSBXYXRlcmxvbyBXb3JrczogUGxlYXNlIGxvZyBpbiB0byBzY3JhcGUgam9iIGxpc3QnKTtcbiAgICAgICAgICAgIHJldHVybiBqb2JzO1xuICAgICAgICB9XG4gICAgICAgIC8vIEpvYiBsaXN0aW5ncyBhcmUgdHlwaWNhbGx5IGluIGEgdGFibGVcbiAgICAgICAgY29uc3Qgcm93cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qb2ItbGlzdGluZy10YWJsZSB0Ym9keSB0ciwgI3Bvc3RpbmdzVGFibGUgdGJvZHkgdHIsIC5vcmJpc01vZHVsZUJvZHkgdGFibGUgdGJvZHkgdHInKTtcbiAgICAgICAgZm9yIChjb25zdCByb3cgb2Ygcm93cykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjZWxscyA9IHJvdy5xdWVyeVNlbGVjdG9yQWxsKCd0ZCcpO1xuICAgICAgICAgICAgICAgIGlmIChjZWxscy5sZW5ndGggPCAzKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAvLyBUeXBpY2FsIHN0cnVjdHVyZTogSm9iIFRpdGxlIHwgQ29tcGFueSB8IExvY2F0aW9uIHwgRGVhZGxpbmUgfCAuLi5cbiAgICAgICAgICAgICAgICBjb25zdCB0aXRsZUNlbGwgPSBjZWxsc1swXTtcbiAgICAgICAgICAgICAgICBjb25zdCB0aXRsZUxpbmsgPSB0aXRsZUNlbGwucXVlcnlTZWxlY3RvcignYScpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRpdGxlID0gdGl0bGVMaW5rPy50ZXh0Q29udGVudD8udHJpbSgpIHx8IHRpdGxlQ2VsbC50ZXh0Q29udGVudD8udHJpbSgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IHRpdGxlTGluaz8uaHJlZjtcbiAgICAgICAgICAgICAgICBjb25zdCBjb21wYW55ID0gY2VsbHNbMV0/LnRleHRDb250ZW50Py50cmltKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgbG9jYXRpb24gPSBjZWxsc1syXT8udGV4dENvbnRlbnQ/LnRyaW0oKTtcbiAgICAgICAgICAgICAgICBjb25zdCBkZWFkbGluZSA9IGNlbGxzWzNdPy50ZXh0Q29udGVudD8udHJpbSgpO1xuICAgICAgICAgICAgICAgIGlmICh0aXRsZSAmJiBjb21wYW55ICYmIHVybCkge1xuICAgICAgICAgICAgICAgICAgICBqb2JzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wYW55LFxuICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJycsIC8vIE5lZWQgdG8gbmF2aWdhdGUgZm9yIGZ1bGwgZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmVtZW50czogW10sXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmwsXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IHRoaXMuc291cmNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2ludGVybnNoaXAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVhZGxpbmUsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbQ29sdW1idXNdIEVycm9yIHNjcmFwaW5nIFdhdGVybG9vIFdvcmtzIHJvdzonLCBlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIEFsc28gdHJ5IGNhcmQtYmFzZWQgbGF5b3V0cyAobmV3ZXIgVUkpXG4gICAgICAgIGNvbnN0IGNhcmRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpvYi1jYXJkLCAucG9zdGluZy1jYXJkLCBbY2xhc3MqPVwicG9zdGluZy1pdGVtXCJdJyk7XG4gICAgICAgIGZvciAoY29uc3QgY2FyZCBvZiBjYXJkcykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCB0aXRsZUVsID0gY2FyZC5xdWVyeVNlbGVjdG9yKCcuam9iLXRpdGxlLCAucG9zdGluZy10aXRsZSwgaDMsIGg0Jyk7XG4gICAgICAgICAgICAgICAgY29uc3QgY29tcGFueUVsID0gY2FyZC5xdWVyeVNlbGVjdG9yKCcuZW1wbG95ZXItbmFtZSwgLmNvbXBhbnktbmFtZSwgW2NsYXNzKj1cImVtcGxveWVyXCJdJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgbG9jYXRpb25FbCA9IGNhcmQucXVlcnlTZWxlY3RvcignLmpvYi1sb2NhdGlvbiwgLmxvY2F0aW9uLCBbY2xhc3MqPVwibG9jYXRpb25cIl0nKTtcbiAgICAgICAgICAgICAgICBjb25zdCBsaW5rRWwgPSBjYXJkLnF1ZXJ5U2VsZWN0b3IoJ2FbaHJlZio9XCJwb3N0aW5nXCJdJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgdGl0bGUgPSB0aXRsZUVsPy50ZXh0Q29udGVudD8udHJpbSgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbXBhbnkgPSBjb21wYW55RWw/LnRleHRDb250ZW50Py50cmltKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgbG9jYXRpb24gPSBsb2NhdGlvbkVsPy50ZXh0Q29udGVudD8udHJpbSgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IGxpbmtFbD8uaHJlZjtcbiAgICAgICAgICAgICAgICBpZiAodGl0bGUgJiYgY29tcGFueSAmJiB1cmwpIHtcbiAgICAgICAgICAgICAgICAgICAgam9icy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGFueSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWlyZW1lbnRzOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogdGhpcy5zb3VyY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnaW50ZXJuc2hpcCcsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbQ29sdW1idXNdIEVycm9yIHNjcmFwaW5nIFdhdGVybG9vIFdvcmtzIGNhcmQ6JywgZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gam9icztcbiAgICB9XG4gICAgaXNMb2dpblBhZ2UoKSB7XG4gICAgICAgIGNvbnN0IHVybCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIHJldHVybiAodXJsLmluY2x1ZGVzKCdsb2dpbicpIHx8XG4gICAgICAgICAgICB1cmwuaW5jbHVkZXMoJ3NpZ25pbicpIHx8XG4gICAgICAgICAgICB1cmwuaW5jbHVkZXMoJ2Nhcy8nKSB8fFxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbdHlwZT1cInBhc3N3b3JkXCJdJykgIT09IG51bGwpO1xuICAgIH1cbiAgICBleHRyYWN0Sm9iVGl0bGUoKSB7XG4gICAgICAgIGNvbnN0IHNlbGVjdG9ycyA9IFtcbiAgICAgICAgICAgICcucG9zdGluZy10aXRsZScsXG4gICAgICAgICAgICAnLmpvYi10aXRsZScsXG4gICAgICAgICAgICAnI3Bvc3RpbmdEaXYgaDEnLFxuICAgICAgICAgICAgJy5qb2ItcG9zdGluZy1kZXRhaWxzIGgxJyxcbiAgICAgICAgICAgICdbY2xhc3MqPVwicG9zdGluZ1wiXSBoMScsXG4gICAgICAgICAgICAnaDEnLFxuICAgICAgICBdO1xuICAgICAgICBmb3IgKGNvbnN0IHNlbGVjdG9yIG9mIHNlbGVjdG9ycykge1xuICAgICAgICAgICAgY29uc3QgdGV4dCA9IHRoaXMuZXh0cmFjdFRleHRDb250ZW50KHNlbGVjdG9yKTtcbiAgICAgICAgICAgIGlmICh0ZXh0ICYmIHRleHQubGVuZ3RoID4gMyAmJiB0ZXh0Lmxlbmd0aCA8IDIwMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0ZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBleHRyYWN0Q29tcGFueSgpIHtcbiAgICAgICAgY29uc3Qgc2VsZWN0b3JzID0gW1xuICAgICAgICAgICAgJy5lbXBsb3llci1uYW1lJyxcbiAgICAgICAgICAgICcuY29tcGFueS1uYW1lJyxcbiAgICAgICAgICAgICcub3JnYW5pemF0aW9uLW5hbWUnLFxuICAgICAgICAgICAgJ1tjbGFzcyo9XCJlbXBsb3llclwiXScsXG4gICAgICAgICAgICAndGQ6Y29udGFpbnMoXCJPcmdhbml6YXRpb25cIikgKyB0ZCcsXG4gICAgICAgICAgICAndGg6Y29udGFpbnMoXCJPcmdhbml6YXRpb25cIikgKyB0ZCcsXG4gICAgICAgIF07XG4gICAgICAgIGZvciAoY29uc3Qgc2VsZWN0b3Igb2Ygc2VsZWN0b3JzKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRleHQgPSB0aGlzLmV4dHJhY3RUZXh0Q29udGVudChzZWxlY3Rvcik7XG4gICAgICAgICAgICAgICAgaWYgKHRleHQgJiYgdGV4dC5sZW5ndGggPiAxKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIHtcbiAgICAgICAgICAgICAgICAvLyBTZWxlY3RvciBtaWdodCBiZSBpbnZhbGlkXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gVHJ5IHRhYmxlLWJhc2VkIGV4dHJhY3Rpb25cbiAgICAgICAgY29uc3Qgcm93cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ3RyLCAuZGV0YWlsLXJvdycpO1xuICAgICAgICBmb3IgKGNvbnN0IHJvdyBvZiByb3dzKSB7XG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0gcm93LnRleHRDb250ZW50Py50b0xvd2VyQ2FzZSgpIHx8ICcnO1xuICAgICAgICAgICAgaWYgKHRleHQuaW5jbHVkZXMoJ29yZ2FuaXphdGlvbicpIHx8IHRleHQuaW5jbHVkZXMoJ2VtcGxveWVyJykgfHwgdGV4dC5pbmNsdWRlcygnY29tcGFueScpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2VsbHMgPSByb3cucXVlcnlTZWxlY3RvckFsbCgndGQsIC52YWx1ZSwgZGQnKTtcbiAgICAgICAgICAgICAgICBpZiAoY2VsbHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGNlbGxzW2NlbGxzLmxlbmd0aCAtIDFdLnRleHRDb250ZW50Py50cmltKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAmJiB2YWx1ZS5sZW5ndGggPiAxKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZXh0cmFjdExvY2F0aW9uKCkge1xuICAgICAgICBjb25zdCBzZWxlY3RvcnMgPSBbXG4gICAgICAgICAgICAnLmpvYi1sb2NhdGlvbicsXG4gICAgICAgICAgICAnLmxvY2F0aW9uJyxcbiAgICAgICAgICAgICdbY2xhc3MqPVwibG9jYXRpb25cIl0nLFxuICAgICAgICBdO1xuICAgICAgICBmb3IgKGNvbnN0IHNlbGVjdG9yIG9mIHNlbGVjdG9ycykge1xuICAgICAgICAgICAgY29uc3QgdGV4dCA9IHRoaXMuZXh0cmFjdFRleHRDb250ZW50KHNlbGVjdG9yKTtcbiAgICAgICAgICAgIGlmICh0ZXh0KVxuICAgICAgICAgICAgICAgIHJldHVybiB0ZXh0O1xuICAgICAgICB9XG4gICAgICAgIC8vIFRyeSB0YWJsZS1iYXNlZCBleHRyYWN0aW9uXG4gICAgICAgIGNvbnN0IHJvd3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCd0ciwgLmRldGFpbC1yb3cnKTtcbiAgICAgICAgZm9yIChjb25zdCByb3cgb2Ygcm93cykge1xuICAgICAgICAgICAgY29uc3QgdGV4dCA9IHJvdy50ZXh0Q29udGVudD8udG9Mb3dlckNhc2UoKSB8fCAnJztcbiAgICAgICAgICAgIGlmICh0ZXh0LmluY2x1ZGVzKCdsb2NhdGlvbicpIHx8IHRleHQuaW5jbHVkZXMoJ2NpdHknKSB8fCB0ZXh0LmluY2x1ZGVzKCdyZWdpb24nKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNlbGxzID0gcm93LnF1ZXJ5U2VsZWN0b3JBbGwoJ3RkLCAudmFsdWUsIGRkJyk7XG4gICAgICAgICAgICAgICAgaWYgKGNlbGxzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBjZWxsc1tjZWxscy5sZW5ndGggLSAxXS50ZXh0Q29udGVudD8udHJpbSgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBleHRyYWN0RGVzY3JpcHRpb24oKSB7XG4gICAgICAgIGNvbnN0IHNlbGVjdG9ycyA9IFtcbiAgICAgICAgICAgICcuam9iLWRlc2NyaXB0aW9uJyxcbiAgICAgICAgICAgICcucG9zdGluZy1kZXNjcmlwdGlvbicsXG4gICAgICAgICAgICAnI3Bvc3RpbmdEaXYgLmRlc2NyaXB0aW9uJyxcbiAgICAgICAgICAgICcuam9iLXBvc3RpbmctZGV0YWlscyAuZGVzY3JpcHRpb24nLFxuICAgICAgICAgICAgJ1tjbGFzcyo9XCJkZXNjcmlwdGlvblwiXScsXG4gICAgICAgIF07XG4gICAgICAgIGZvciAoY29uc3Qgc2VsZWN0b3Igb2Ygc2VsZWN0b3JzKSB7XG4gICAgICAgICAgICBjb25zdCBodG1sID0gdGhpcy5leHRyYWN0SHRtbENvbnRlbnQoc2VsZWN0b3IpO1xuICAgICAgICAgICAgaWYgKGh0bWwgJiYgaHRtbC5sZW5ndGggPiA1MCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNsZWFuRGVzY3JpcHRpb24oaHRtbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gVHJ5IHRvIGZpbmQgdGhlIG1haW4gY29udGVudCBhcmVhXG4gICAgICAgIGNvbnN0IG1haW5Db250ZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnBvc3RpbmctZGV0YWlscywgI3Bvc3RpbmdEaXYsIC5qb2ItcG9zdGluZy1kZXRhaWxzJyk7XG4gICAgICAgIGlmIChtYWluQ29udGVudCkge1xuICAgICAgICAgICAgY29uc3QgaHRtbCA9IG1haW5Db250ZW50LmlubmVySFRNTDtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNsZWFuRGVzY3JpcHRpb24oaHRtbCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGV4dHJhY3REZWFkbGluZSgpIHtcbiAgICAgICAgY29uc3Qgc2VsZWN0b3JzID0gW1xuICAgICAgICAgICAgJy5hcHBsaWNhdGlvbi1kZWFkbGluZScsXG4gICAgICAgICAgICAnLmRlYWRsaW5lJyxcbiAgICAgICAgICAgICdbY2xhc3MqPVwiZGVhZGxpbmVcIl0nLFxuICAgICAgICBdO1xuICAgICAgICBmb3IgKGNvbnN0IHNlbGVjdG9yIG9mIHNlbGVjdG9ycykge1xuICAgICAgICAgICAgY29uc3QgdGV4dCA9IHRoaXMuZXh0cmFjdFRleHRDb250ZW50KHNlbGVjdG9yKTtcbiAgICAgICAgICAgIGlmICh0ZXh0KVxuICAgICAgICAgICAgICAgIHJldHVybiB0ZXh0O1xuICAgICAgICB9XG4gICAgICAgIC8vIFRyeSB0YWJsZS1iYXNlZCBleHRyYWN0aW9uXG4gICAgICAgIGNvbnN0IHJvd3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCd0ciwgLmRldGFpbC1yb3cnKTtcbiAgICAgICAgZm9yIChjb25zdCByb3cgb2Ygcm93cykge1xuICAgICAgICAgICAgY29uc3QgdGV4dCA9IHJvdy50ZXh0Q29udGVudD8udG9Mb3dlckNhc2UoKSB8fCAnJztcbiAgICAgICAgICAgIGlmICh0ZXh0LmluY2x1ZGVzKCdkZWFkbGluZScpIHx8IHRleHQuaW5jbHVkZXMoJ2FwcGx5IGJ5JykgfHwgdGV4dC5pbmNsdWRlcygnZHVlJykpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjZWxscyA9IHJvdy5xdWVyeVNlbGVjdG9yQWxsKCd0ZCwgLnZhbHVlLCBkZCcpO1xuICAgICAgICAgICAgICAgIGlmIChjZWxscy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gY2VsbHNbY2VsbHMubGVuZ3RoIC0gMV0udGV4dENvbnRlbnQ/LnRyaW0oKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBleHRyYWN0RGV0YWlsc1RhYmxlKCkge1xuICAgICAgICBjb25zdCBkZXRhaWxzID0ge307XG4gICAgICAgIGNvbnN0IHJvd3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCd0ciwgLmRldGFpbC1yb3csIGR0Jyk7XG4gICAgICAgIGZvciAoY29uc3Qgcm93IG9mIHJvd3MpIHtcbiAgICAgICAgICAgIGNvbnN0IHRleHQgPSByb3cudGV4dENvbnRlbnQ/LnRvTG93ZXJDYXNlKCkgfHwgJyc7XG4gICAgICAgICAgICBsZXQgbGFiZWwgPSBudWxsO1xuICAgICAgICAgICAgbGV0IHZhbHVlID0gbnVsbDtcbiAgICAgICAgICAgIC8vIEhhbmRsZSBkdC9kZCBwYWlyc1xuICAgICAgICAgICAgaWYgKHJvdy50YWdOYW1lID09PSAnRFQnKSB7XG4gICAgICAgICAgICAgICAgbGFiZWwgPSByb3cudGV4dENvbnRlbnQ/LnRyaW0oKSB8fCBudWxsO1xuICAgICAgICAgICAgICAgIGNvbnN0IGRkID0gcm93Lm5leHRFbGVtZW50U2libGluZztcbiAgICAgICAgICAgICAgICBpZiAoZGQ/LnRhZ05hbWUgPT09ICdERCcpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBkZC50ZXh0Q29udGVudD8udHJpbSgpIHx8IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gSGFuZGxlIHRhYmxlIHJvd3NcbiAgICAgICAgICAgICAgICBjb25zdCBjZWxscyA9IHJvdy5xdWVyeVNlbGVjdG9yQWxsKCd0ZCwgdGgnKTtcbiAgICAgICAgICAgICAgICBpZiAoY2VsbHMubGVuZ3RoID49IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWwgPSBjZWxsc1swXS50ZXh0Q29udGVudD8udHJpbSgpPy50b0xvd2VyQ2FzZSgpIHx8IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gY2VsbHNbMV0udGV4dENvbnRlbnQ/LnRyaW0oKSB8fCBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChsYWJlbCAmJiB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmIChsYWJlbC5pbmNsdWRlcygnam9iIGlkJykgfHwgbGFiZWwuaW5jbHVkZXMoJ3Bvc3RpbmcgaWQnKSkge1xuICAgICAgICAgICAgICAgICAgICBkZXRhaWxzLmpvYklkID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChsYWJlbC5pbmNsdWRlcygnbG9jYXRpb24nKSB8fCBsYWJlbC5pbmNsdWRlcygnY2l0eScpKSB7XG4gICAgICAgICAgICAgICAgICAgIGRldGFpbHMubG9jYXRpb24gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGxhYmVsLmluY2x1ZGVzKCdzYWxhcnknKSB8fCBsYWJlbC5pbmNsdWRlcygnY29tcGVuc2F0aW9uJykgfHwgbGFiZWwuaW5jbHVkZXMoJ3BheScpKSB7XG4gICAgICAgICAgICAgICAgICAgIGRldGFpbHMuc2FsYXJ5ID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZXRhaWxzO1xuICAgIH1cbn1cbiIsIi8vIEluZGVlZCBqb2Igc2NyYXBlclxuaW1wb3J0IHsgQmFzZVNjcmFwZXIgfSBmcm9tICcuL2Jhc2Utc2NyYXBlcic7XG5leHBvcnQgY2xhc3MgSW5kZWVkU2NyYXBlciBleHRlbmRzIEJhc2VTY3JhcGVyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcbiAgICAgICAgdGhpcy5zb3VyY2UgPSAnaW5kZWVkJztcbiAgICAgICAgdGhpcy51cmxQYXR0ZXJucyA9IFtcbiAgICAgICAgICAgIC9pbmRlZWRcXC5jb21cXC92aWV3am9iLyxcbiAgICAgICAgICAgIC9pbmRlZWRcXC5jb21cXC9qb2JzXFwvLyxcbiAgICAgICAgICAgIC9pbmRlZWRcXC5jb21cXC9qb2JcXC8vLFxuICAgICAgICAgICAgL2luZGVlZFxcLmNvbVxcL3JjXFwvY2xrLyxcbiAgICAgICAgXTtcbiAgICB9XG4gICAgY2FuSGFuZGxlKHVybCkge1xuICAgICAgICByZXR1cm4gdGhpcy51cmxQYXR0ZXJucy5zb21lKChwKSA9PiBwLnRlc3QodXJsKSk7XG4gICAgfVxuICAgIGFzeW5jIHNjcmFwZUpvYkxpc3RpbmcoKSB7XG4gICAgICAgIC8vIFdhaXQgZm9yIGpvYiBkZXRhaWxzIHRvIGxvYWRcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMud2FpdEZvckVsZW1lbnQoJy5qb2JzZWFyY2gtSm9iSW5mb0hlYWRlci10aXRsZSwgW2RhdGEtdGVzdGlkPVwiam9ic2VhcmNoLUpvYkluZm9IZWFkZXItdGl0bGVcIl0nLCAzMDAwKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCB7XG4gICAgICAgICAgICAvLyBDb250aW51ZSB3aXRoIGF2YWlsYWJsZSBkYXRhXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdGl0bGUgPSB0aGlzLmV4dHJhY3RKb2JUaXRsZSgpO1xuICAgICAgICBjb25zdCBjb21wYW55ID0gdGhpcy5leHRyYWN0Q29tcGFueSgpO1xuICAgICAgICBjb25zdCBsb2NhdGlvbiA9IHRoaXMuZXh0cmFjdExvY2F0aW9uKCk7XG4gICAgICAgIGNvbnN0IGRlc2NyaXB0aW9uID0gdGhpcy5leHRyYWN0RGVzY3JpcHRpb24oKTtcbiAgICAgICAgaWYgKCF0aXRsZSB8fCAhY29tcGFueSB8fCAhZGVzY3JpcHRpb24pIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbQ29sdW1idXNdIEluZGVlZCBzY3JhcGVyOiBNaXNzaW5nIHJlcXVpcmVkIGZpZWxkcycsIHsgdGl0bGUsIGNvbXBhbnksIGRlc2NyaXB0aW9uOiAhIWRlc2NyaXB0aW9uIH0pO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgc3RydWN0dXJlZERhdGEgPSB0aGlzLmV4dHJhY3RTdHJ1Y3R1cmVkRGF0YSgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgICBjb21wYW55LFxuICAgICAgICAgICAgbG9jYXRpb246IGxvY2F0aW9uIHx8IHN0cnVjdHVyZWREYXRhPy5sb2NhdGlvbixcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgcmVxdWlyZW1lbnRzOiB0aGlzLmV4dHJhY3RSZXF1aXJlbWVudHMoZGVzY3JpcHRpb24pLFxuICAgICAgICAgICAga2V5d29yZHM6IHRoaXMuZXh0cmFjdEtleXdvcmRzKGRlc2NyaXB0aW9uKSxcbiAgICAgICAgICAgIHNhbGFyeTogdGhpcy5leHRyYWN0U2FsYXJ5RnJvbVBhZ2UoKSB8fCB0aGlzLmV4dHJhY3RTYWxhcnkoZGVzY3JpcHRpb24pIHx8IHN0cnVjdHVyZWREYXRhPy5zYWxhcnksXG4gICAgICAgICAgICB0eXBlOiB0aGlzLmRldGVjdEpvYlR5cGUoZGVzY3JpcHRpb24pLFxuICAgICAgICAgICAgcmVtb3RlOiB0aGlzLmRldGVjdFJlbW90ZShsb2NhdGlvbiB8fCAnJykgfHwgdGhpcy5kZXRlY3RSZW1vdGUoZGVzY3JpcHRpb24pLFxuICAgICAgICAgICAgdXJsOiB3aW5kb3cubG9jYXRpb24uaHJlZixcbiAgICAgICAgICAgIHNvdXJjZTogdGhpcy5zb3VyY2UsXG4gICAgICAgICAgICBzb3VyY2VKb2JJZDogdGhpcy5leHRyYWN0Sm9iSWQoKSxcbiAgICAgICAgICAgIHBvc3RlZEF0OiBzdHJ1Y3R1cmVkRGF0YT8ucG9zdGVkQXQsXG4gICAgICAgIH07XG4gICAgfVxuICAgIGFzeW5jIHNjcmFwZUpvYkxpc3QoKSB7XG4gICAgICAgIGNvbnN0IGpvYnMgPSBbXTtcbiAgICAgICAgLy8gSm9iIGNhcmRzIGluIHNlYXJjaCByZXN1bHRzXG4gICAgICAgIGNvbnN0IGpvYkNhcmRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpvYl9zZWVuX2JlYWNvbiwgLmpvYnNlYXJjaC1SZXN1bHRzTGlzdCA+IGxpLCBbZGF0YS10ZXN0aWQ9XCJqb2ItY2FyZFwiXScpO1xuICAgICAgICBmb3IgKGNvbnN0IGNhcmQgb2Ygam9iQ2FyZHMpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdGl0bGVFbCA9IGNhcmQucXVlcnlTZWxlY3RvcignLmpvYlRpdGxlLCBbZGF0YS10ZXN0aWQ9XCJqb2JUaXRsZVwiXSwgaDIuam9iVGl0bGUgYSwgLmpjcy1Kb2JUaXRsZScpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbXBhbnlFbCA9IGNhcmQucXVlcnlTZWxlY3RvcignLmNvbXBhbnlOYW1lLCBbZGF0YS10ZXN0aWQ9XCJjb21wYW55LW5hbWVcIl0sIC5jb21wYW55X2xvY2F0aW9uIC5jb21wYW55TmFtZScpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2F0aW9uRWwgPSBjYXJkLnF1ZXJ5U2VsZWN0b3IoJy5jb21wYW55TG9jYXRpb24sIFtkYXRhLXRlc3RpZD1cInRleHQtbG9jYXRpb25cIl0sIC5jb21wYW55X2xvY2F0aW9uIC5jb21wYW55TG9jYXRpb24nKTtcbiAgICAgICAgICAgICAgICBjb25zdCBzYWxhcnlFbCA9IGNhcmQucXVlcnlTZWxlY3RvcignLnNhbGFyeS1zbmlwcGV0LWNvbnRhaW5lciwgW2RhdGEtdGVzdGlkPVwiYXR0cmlidXRlX3NuaXBwZXRfdGVzdGlkXCJdLCAuZXN0aW1hdGVkLXNhbGFyeScpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRpdGxlID0gdGl0bGVFbD8udGV4dENvbnRlbnQ/LnRyaW0oKTtcbiAgICAgICAgICAgICAgICBjb25zdCBjb21wYW55ID0gY29tcGFueUVsPy50ZXh0Q29udGVudD8udHJpbSgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2F0aW9uID0gbG9jYXRpb25FbD8udGV4dENvbnRlbnQ/LnRyaW0oKTtcbiAgICAgICAgICAgICAgICBjb25zdCBzYWxhcnkgPSBzYWxhcnlFbD8udGV4dENvbnRlbnQ/LnRyaW0oKTtcbiAgICAgICAgICAgICAgICAvLyBHZXQgVVJMIGZyb20gdGl0bGUgbGluayBvciBkYXRhIGF0dHJpYnV0ZVxuICAgICAgICAgICAgICAgIGxldCB1cmwgPSB0aXRsZUVsPy5ocmVmO1xuICAgICAgICAgICAgICAgIGlmICghdXJsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGpvYktleSA9IGNhcmQuZ2V0QXR0cmlidXRlKCdkYXRhLWprJyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChqb2JLZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybCA9IGBodHRwczovL3d3dy5pbmRlZWQuY29tL3ZpZXdqb2I/ams9JHtqb2JLZXl9YDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGl0bGUgJiYgY29tcGFueSAmJiB1cmwpIHtcbiAgICAgICAgICAgICAgICAgICAgam9icy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGFueSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2FsYXJ5LFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWlyZW1lbnRzOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogdGhpcy5zb3VyY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VKb2JJZDogdGhpcy5leHRyYWN0Sm9iSWRGcm9tVXJsKHVybCksXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbQ29sdW1idXNdIEVycm9yIHNjcmFwaW5nIEluZGVlZCBqb2IgY2FyZDonLCBlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBqb2JzO1xuICAgIH1cbiAgICBleHRyYWN0Sm9iVGl0bGUoKSB7XG4gICAgICAgIGNvbnN0IHNlbGVjdG9ycyA9IFtcbiAgICAgICAgICAgICcuam9ic2VhcmNoLUpvYkluZm9IZWFkZXItdGl0bGUnLFxuICAgICAgICAgICAgJ1tkYXRhLXRlc3RpZD1cImpvYnNlYXJjaC1Kb2JJbmZvSGVhZGVyLXRpdGxlXCJdJyxcbiAgICAgICAgICAgICdoMS5qb2JzZWFyY2gtSm9iSW5mb0hlYWRlci10aXRsZScsXG4gICAgICAgICAgICAnLmljbC11LXhzLW1iLS14cyBoMScsXG4gICAgICAgICAgICAnaDFbY2xhc3MqPVwiSm9iSW5mb0hlYWRlclwiXScsXG4gICAgICAgIF07XG4gICAgICAgIGZvciAoY29uc3Qgc2VsZWN0b3Igb2Ygc2VsZWN0b3JzKSB7XG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0gdGhpcy5leHRyYWN0VGV4dENvbnRlbnQoc2VsZWN0b3IpO1xuICAgICAgICAgICAgaWYgKHRleHQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGV4dHJhY3RDb21wYW55KCkge1xuICAgICAgICBjb25zdCBzZWxlY3RvcnMgPSBbXG4gICAgICAgICAgICAnW2RhdGEtdGVzdGlkPVwiaW5saW5lSGVhZGVyLWNvbXBhbnlOYW1lXCJdIGEnLFxuICAgICAgICAgICAgJ1tkYXRhLXRlc3RpZD1cImlubGluZUhlYWRlci1jb21wYW55TmFtZVwiXScsXG4gICAgICAgICAgICAnLmpvYnNlYXJjaC1JbmxpbmVDb21wYW55UmF0aW5nLWNvbXBhbnlIZWFkZXIgYScsXG4gICAgICAgICAgICAnLmpvYnNlYXJjaC1JbmxpbmVDb21wYW55UmF0aW5nIGEnLFxuICAgICAgICAgICAgJy5pY2wtdS1sZy1tci0tc20gYScsXG4gICAgICAgICAgICAnW2RhdGEtY29tcGFueS1uYW1lPVwidHJ1ZVwiXScsXG4gICAgICAgIF07XG4gICAgICAgIGZvciAoY29uc3Qgc2VsZWN0b3Igb2Ygc2VsZWN0b3JzKSB7XG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0gdGhpcy5leHRyYWN0VGV4dENvbnRlbnQoc2VsZWN0b3IpO1xuICAgICAgICAgICAgaWYgKHRleHQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGV4dHJhY3RMb2NhdGlvbigpIHtcbiAgICAgICAgY29uc3Qgc2VsZWN0b3JzID0gW1xuICAgICAgICAgICAgJ1tkYXRhLXRlc3RpZD1cImlubGluZUhlYWRlci1jb21wYW55TG9jYXRpb25cIl0nLFxuICAgICAgICAgICAgJ1tkYXRhLXRlc3RpZD1cImpvYi1sb2NhdGlvblwiXScsXG4gICAgICAgICAgICAnLmpvYnNlYXJjaC1Kb2JJbmZvSGVhZGVyLXN1YnRpdGxlID4gZGl2Om50aC1jaGlsZCgyKScsXG4gICAgICAgICAgICAnLmpvYnNlYXJjaC1JbmxpbmVDb21wYW55UmF0aW5nICsgZGl2JyxcbiAgICAgICAgICAgICcuaWNsLXUteHMtbXQtLXhzIC5pY2wtdS10ZXh0Q29sb3ItLXNlY29uZGFyeScsXG4gICAgICAgIF07XG4gICAgICAgIGZvciAoY29uc3Qgc2VsZWN0b3Igb2Ygc2VsZWN0b3JzKSB7XG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0gdGhpcy5leHRyYWN0VGV4dENvbnRlbnQoc2VsZWN0b3IpO1xuICAgICAgICAgICAgaWYgKHRleHQgJiYgIXRleHQuaW5jbHVkZXMoJ3Jldmlld3MnKSAmJiAhdGV4dC5pbmNsdWRlcygncmF0aW5nJykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZXh0cmFjdERlc2NyaXB0aW9uKCkge1xuICAgICAgICBjb25zdCBzZWxlY3RvcnMgPSBbXG4gICAgICAgICAgICAnI2pvYkRlc2NyaXB0aW9uVGV4dCcsXG4gICAgICAgICAgICAnW2RhdGEtdGVzdGlkPVwiam9iRGVzY3JpcHRpb25UZXh0XCJdJyxcbiAgICAgICAgICAgICcuam9ic2VhcmNoLWpvYkRlc2NyaXB0aW9uVGV4dCcsXG4gICAgICAgICAgICAnLmpvYnNlYXJjaC1Kb2JDb21wb25lbnQtZGVzY3JpcHRpb24nLFxuICAgICAgICBdO1xuICAgICAgICBmb3IgKGNvbnN0IHNlbGVjdG9yIG9mIHNlbGVjdG9ycykge1xuICAgICAgICAgICAgY29uc3QgaHRtbCA9IHRoaXMuZXh0cmFjdEh0bWxDb250ZW50KHNlbGVjdG9yKTtcbiAgICAgICAgICAgIGlmIChodG1sKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2xlYW5EZXNjcmlwdGlvbihodG1sKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZXh0cmFjdFNhbGFyeUZyb21QYWdlKCkge1xuICAgICAgICBjb25zdCBzZWxlY3RvcnMgPSBbXG4gICAgICAgICAgICAnW2RhdGEtdGVzdGlkPVwiam9ic2VhcmNoLUpvYk1ldGFkYXRhSGVhZGVyLXNhbGFyeUluZm9cIl0nLFxuICAgICAgICAgICAgJy5qb2JzZWFyY2gtSm9iTWV0YWRhdGFIZWFkZXItc2FsYXJ5SW5mbycsXG4gICAgICAgICAgICAnI3NhbGFyeUluZm9BbmRKb2JUeXBlIC5hdHRyaWJ1dGVfc25pcHBldCcsXG4gICAgICAgICAgICAnLmpvYnNlYXJjaC1Kb2JJbmZvSGVhZGVyLXNhbGFyeScsXG4gICAgICAgIF07XG4gICAgICAgIGZvciAoY29uc3Qgc2VsZWN0b3Igb2Ygc2VsZWN0b3JzKSB7XG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0gdGhpcy5leHRyYWN0VGV4dENvbnRlbnQoc2VsZWN0b3IpO1xuICAgICAgICAgICAgaWYgKHRleHQgJiYgdGV4dC5pbmNsdWRlcygnJCcpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgZXh0cmFjdEpvYklkKCkge1xuICAgICAgICAvLyBGcm9tIFVSTCBwYXJhbWV0ZXJcbiAgICAgICAgY29uc3QgdXJsUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcbiAgICAgICAgY29uc3QgamsgPSB1cmxQYXJhbXMuZ2V0KCdqaycpO1xuICAgICAgICBpZiAoamspXG4gICAgICAgICAgICByZXR1cm4gams7XG4gICAgICAgIC8vIEZyb20gVVJMIHBhdGhcbiAgICAgICAgY29uc3QgbWF0Y2ggPSB3aW5kb3cubG9jYXRpb24uaHJlZi5tYXRjaCgvXFwvam9iXFwvKFthLWYwLTldKykvaSk7XG4gICAgICAgIHJldHVybiBtYXRjaD8uWzFdO1xuICAgIH1cbiAgICBleHRyYWN0Sm9iSWRGcm9tVXJsKHVybCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgdXJsT2JqID0gbmV3IFVSTCh1cmwpO1xuICAgICAgICAgICAgY29uc3QgamsgPSB1cmxPYmouc2VhcmNoUGFyYW1zLmdldCgnamsnKTtcbiAgICAgICAgICAgIGlmIChqaylcbiAgICAgICAgICAgICAgICByZXR1cm4gams7XG4gICAgICAgICAgICBjb25zdCBtYXRjaCA9IHVybC5tYXRjaCgvXFwvam9iXFwvKFthLWYwLTldKykvaSk7XG4gICAgICAgICAgICByZXR1cm4gbWF0Y2g/LlsxXTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCB7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfVxuICAgIGV4dHJhY3RTdHJ1Y3R1cmVkRGF0YSgpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGxkSnNvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3NjcmlwdFt0eXBlPVwiYXBwbGljYXRpb24vbGQranNvblwiXScpO1xuICAgICAgICAgICAgaWYgKCFsZEpzb24/LnRleHRDb250ZW50KVxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgY29uc3QgZGF0YSA9IEpTT04ucGFyc2UobGRKc29uLnRleHRDb250ZW50KTtcbiAgICAgICAgICAgIC8vIEluZGVlZCBtYXkgaGF2ZSBhbiBhcnJheSBvZiBzdHJ1Y3R1cmVkIGRhdGFcbiAgICAgICAgICAgIGNvbnN0IGpvYkRhdGEgPSBBcnJheS5pc0FycmF5KGRhdGEpID8gZGF0YS5maW5kKChkKSA9PiBkWydAdHlwZSddID09PSAnSm9iUG9zdGluZycpIDogZGF0YTtcbiAgICAgICAgICAgIGlmICgham9iRGF0YSB8fCBqb2JEYXRhWydAdHlwZSddICE9PSAnSm9iUG9zdGluZycpXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGxvY2F0aW9uOiBqb2JEYXRhLmpvYkxvY2F0aW9uPy5hZGRyZXNzPy5hZGRyZXNzTG9jYWxpdHkgfHxcbiAgICAgICAgICAgICAgICAgICAgam9iRGF0YS5qb2JMb2NhdGlvbj8uYWRkcmVzcz8ubmFtZSxcbiAgICAgICAgICAgICAgICBzYWxhcnk6IGpvYkRhdGEuYmFzZVNhbGFyeT8udmFsdWVcbiAgICAgICAgICAgICAgICAgICAgPyBgJCR7am9iRGF0YS5iYXNlU2FsYXJ5LnZhbHVlLm1pblZhbHVlIHx8ICcnfS0ke2pvYkRhdGEuYmFzZVNhbGFyeS52YWx1ZS5tYXhWYWx1ZSB8fCAnJ30gJHtqb2JEYXRhLmJhc2VTYWxhcnkudmFsdWUudW5pdFRleHQgfHwgJyd9YFxuICAgICAgICAgICAgICAgICAgICA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICBwb3N0ZWRBdDogam9iRGF0YS5kYXRlUG9zdGVkLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vIEdyZWVuaG91c2Ugam9iIGJvYXJkIHNjcmFwZXJcbmltcG9ydCB7IEJhc2VTY3JhcGVyIH0gZnJvbSAnLi9iYXNlLXNjcmFwZXInO1xuZXhwb3J0IGNsYXNzIEdyZWVuaG91c2VTY3JhcGVyIGV4dGVuZHMgQmFzZVNjcmFwZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlciguLi5hcmd1bWVudHMpO1xuICAgICAgICB0aGlzLnNvdXJjZSA9ICdncmVlbmhvdXNlJztcbiAgICAgICAgdGhpcy51cmxQYXR0ZXJucyA9IFtcbiAgICAgICAgICAgIC9ib2FyZHNcXC5ncmVlbmhvdXNlXFwuaW9cXC9bXFx3LV0rXFwvam9ic1xcL1xcZCsvLFxuICAgICAgICAgICAgL1tcXHctXStcXC5ncmVlbmhvdXNlXFwuaW9cXC9qb2JzXFwvXFxkKy8sXG4gICAgICAgICAgICAvZ3JlZW5ob3VzZVxcLmlvXFwvZW1iZWRcXC9qb2JfYXBwLyxcbiAgICAgICAgXTtcbiAgICB9XG4gICAgY2FuSGFuZGxlKHVybCkge1xuICAgICAgICByZXR1cm4gdGhpcy51cmxQYXR0ZXJucy5zb21lKChwKSA9PiBwLnRlc3QodXJsKSk7XG4gICAgfVxuICAgIGFzeW5jIHNjcmFwZUpvYkxpc3RpbmcoKSB7XG4gICAgICAgIC8vIFdhaXQgZm9yIGpvYiBjb250ZW50IHRvIGxvYWRcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMud2FpdEZvckVsZW1lbnQoJy5hcHAtdGl0bGUsICNoZWFkZXIgLmNvbXBhbnktbmFtZSwgLmpvYi10aXRsZScsIDMwMDApO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIHtcbiAgICAgICAgICAgIC8vIENvbnRpbnVlIHdpdGggYXZhaWxhYmxlIGRhdGFcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0aXRsZSA9IHRoaXMuZXh0cmFjdEpvYlRpdGxlKCk7XG4gICAgICAgIGNvbnN0IGNvbXBhbnkgPSB0aGlzLmV4dHJhY3RDb21wYW55KCk7XG4gICAgICAgIGNvbnN0IGxvY2F0aW9uID0gdGhpcy5leHRyYWN0TG9jYXRpb24oKTtcbiAgICAgICAgY29uc3QgZGVzY3JpcHRpb24gPSB0aGlzLmV4dHJhY3REZXNjcmlwdGlvbigpO1xuICAgICAgICBpZiAoIXRpdGxlIHx8ICFjb21wYW55IHx8ICFkZXNjcmlwdGlvbikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tDb2x1bWJ1c10gR3JlZW5ob3VzZSBzY3JhcGVyOiBNaXNzaW5nIHJlcXVpcmVkIGZpZWxkcycsIHsgdGl0bGUsIGNvbXBhbnksIGRlc2NyaXB0aW9uOiAhIWRlc2NyaXB0aW9uIH0pO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgc3RydWN0dXJlZERhdGEgPSB0aGlzLmV4dHJhY3RTdHJ1Y3R1cmVkRGF0YSgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgICBjb21wYW55LFxuICAgICAgICAgICAgbG9jYXRpb246IGxvY2F0aW9uIHx8IHN0cnVjdHVyZWREYXRhPy5sb2NhdGlvbixcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgcmVxdWlyZW1lbnRzOiB0aGlzLmV4dHJhY3RSZXF1aXJlbWVudHMoZGVzY3JpcHRpb24pLFxuICAgICAgICAgICAga2V5d29yZHM6IHRoaXMuZXh0cmFjdEtleXdvcmRzKGRlc2NyaXB0aW9uKSxcbiAgICAgICAgICAgIHNhbGFyeTogdGhpcy5leHRyYWN0U2FsYXJ5KGRlc2NyaXB0aW9uKSB8fCBzdHJ1Y3R1cmVkRGF0YT8uc2FsYXJ5LFxuICAgICAgICAgICAgdHlwZTogdGhpcy5kZXRlY3RKb2JUeXBlKGRlc2NyaXB0aW9uKSB8fCBzdHJ1Y3R1cmVkRGF0YT8udHlwZSxcbiAgICAgICAgICAgIHJlbW90ZTogdGhpcy5kZXRlY3RSZW1vdGUobG9jYXRpb24gfHwgJycpIHx8IHRoaXMuZGV0ZWN0UmVtb3RlKGRlc2NyaXB0aW9uKSxcbiAgICAgICAgICAgIHVybDogd2luZG93LmxvY2F0aW9uLmhyZWYsXG4gICAgICAgICAgICBzb3VyY2U6IHRoaXMuc291cmNlLFxuICAgICAgICAgICAgc291cmNlSm9iSWQ6IHRoaXMuZXh0cmFjdEpvYklkKCksXG4gICAgICAgICAgICBwb3N0ZWRBdDogc3RydWN0dXJlZERhdGE/LnBvc3RlZEF0LFxuICAgICAgICB9O1xuICAgIH1cbiAgICBhc3luYyBzY3JhcGVKb2JMaXN0KCkge1xuICAgICAgICBjb25zdCBqb2JzID0gW107XG4gICAgICAgIC8vIEpvYiBjYXJkcyBvbiBkZXBhcnRtZW50L2xpc3RpbmcgcGFnZXNcbiAgICAgICAgY29uc3Qgam9iQ2FyZHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcub3BlbmluZywgLmpvYi1wb3N0LCBbZGF0YS1tYXBwZWQ9XCJ0cnVlXCJdLCBzZWN0aW9uLmxldmVsLTAgPiBkaXYnKTtcbiAgICAgICAgZm9yIChjb25zdCBjYXJkIG9mIGpvYkNhcmRzKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRpdGxlRWwgPSBjYXJkLnF1ZXJ5U2VsZWN0b3IoJ2EsIC5vcGVuaW5nLXRpdGxlLCAuam9iLXRpdGxlJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgbG9jYXRpb25FbCA9IGNhcmQucXVlcnlTZWxlY3RvcignLmxvY2F0aW9uLCAuam9iLWxvY2F0aW9uLCBzcGFuOmxhc3QtY2hpbGQnKTtcbiAgICAgICAgICAgICAgICBjb25zdCB0aXRsZSA9IHRpdGxlRWw/LnRleHRDb250ZW50Py50cmltKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgbG9jYXRpb24gPSBsb2NhdGlvbkVsPy50ZXh0Q29udGVudD8udHJpbSgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IHRpdGxlRWw/LmhyZWY7XG4gICAgICAgICAgICAgICAgLy8gQ29tcGFueSBpcyB1c3VhbGx5IGluIGhlYWRlclxuICAgICAgICAgICAgICAgIGNvbnN0IGNvbXBhbnkgPSB0aGlzLmV4dHJhY3RDb21wYW55KCk7XG4gICAgICAgICAgICAgICAgaWYgKHRpdGxlICYmIHVybCAmJiBjb21wYW55KSB7XG4gICAgICAgICAgICAgICAgICAgIGpvYnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBhbnksXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmVtZW50czogW10sXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmwsXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IHRoaXMuc291cmNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlSm9iSWQ6IHRoaXMuZXh0cmFjdEpvYklkRnJvbVVybCh1cmwpLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignW0NvbHVtYnVzXSBFcnJvciBzY3JhcGluZyBHcmVlbmhvdXNlIGpvYiBjYXJkOicsIGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGpvYnM7XG4gICAgfVxuICAgIGV4dHJhY3RKb2JUaXRsZSgpIHtcbiAgICAgICAgY29uc3Qgc2VsZWN0b3JzID0gW1xuICAgICAgICAgICAgJy5hcHAtdGl0bGUnLFxuICAgICAgICAgICAgJy5qb2ItdGl0bGUnLFxuICAgICAgICAgICAgJ2gxLmhlYWRpbmcnLFxuICAgICAgICAgICAgJy5qb2ItaW5mbyBoMScsXG4gICAgICAgICAgICAnI2hlYWRlciBoMScsXG4gICAgICAgICAgICAnaDFbY2xhc3MqPVwiam9iXCJdJyxcbiAgICAgICAgICAgICcuaGVybyBoMScsXG4gICAgICAgIF07XG4gICAgICAgIGZvciAoY29uc3Qgc2VsZWN0b3Igb2Ygc2VsZWN0b3JzKSB7XG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0gdGhpcy5leHRyYWN0VGV4dENvbnRlbnQoc2VsZWN0b3IpO1xuICAgICAgICAgICAgaWYgKHRleHQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVHJ5IHN0cnVjdHVyZWQgZGF0YVxuICAgICAgICBjb25zdCBsZEpzb24gPSB0aGlzLmV4dHJhY3RTdHJ1Y3R1cmVkRGF0YSgpO1xuICAgICAgICBpZiAobGRKc29uPy50aXRsZSlcbiAgICAgICAgICAgIHJldHVybiBsZEpzb24udGl0bGU7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBleHRyYWN0Q29tcGFueSgpIHtcbiAgICAgICAgY29uc3Qgc2VsZWN0b3JzID0gW1xuICAgICAgICAgICAgJy5jb21wYW55LW5hbWUnLFxuICAgICAgICAgICAgJyNoZWFkZXIgLmNvbXBhbnktbmFtZScsXG4gICAgICAgICAgICAnLmxvZ28td3JhcHBlciBpbWdbYWx0XScsXG4gICAgICAgICAgICAnLmNvbXBhbnktaGVhZGVyIC5uYW1lJyxcbiAgICAgICAgICAgICdtZXRhW3Byb3BlcnR5PVwib2c6c2l0ZV9uYW1lXCJdJyxcbiAgICAgICAgXTtcbiAgICAgICAgZm9yIChjb25zdCBzZWxlY3RvciBvZiBzZWxlY3RvcnMpIHtcbiAgICAgICAgICAgIGlmIChzZWxlY3Rvci5pbmNsdWRlcygnbWV0YScpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWV0YSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBtZXRhPy5nZXRBdHRyaWJ1dGUoJ2NvbnRlbnQnKTtcbiAgICAgICAgICAgICAgICBpZiAoY29udGVudClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbnRlbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChzZWxlY3Rvci5pbmNsdWRlcygnaW1nW2FsdF0nKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGltZyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGFsdCA9IGltZz8uZ2V0QXR0cmlidXRlKCdhbHQnKTtcbiAgICAgICAgICAgICAgICBpZiAoYWx0KVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdGV4dCA9IHRoaXMuZXh0cmFjdFRleHRDb250ZW50KHNlbGVjdG9yKTtcbiAgICAgICAgICAgICAgICBpZiAodGV4dClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gRXh0cmFjdCBmcm9tIFVSTCAoYm9hcmRzLmdyZWVuaG91c2UuaW8vQ09NUEFOWS9qb2JzLy4uLilcbiAgICAgICAgY29uc3QgbWF0Y2ggPSB3aW5kb3cubG9jYXRpb24uaHJlZi5tYXRjaCgvZ3JlZW5ob3VzZVxcLmlvXFwvKFteL10rKS8pO1xuICAgICAgICBpZiAobWF0Y2ggJiYgbWF0Y2hbMV0gIT09ICdqb2JzJykge1xuICAgICAgICAgICAgcmV0dXJuIG1hdGNoWzFdLnJlcGxhY2UoLy0vZywgJyAnKS5yZXBsYWNlKC9cXGJcXHcvZywgKGMpID0+IGMudG9VcHBlckNhc2UoKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGV4dHJhY3RMb2NhdGlvbigpIHtcbiAgICAgICAgY29uc3Qgc2VsZWN0b3JzID0gW1xuICAgICAgICAgICAgJy5sb2NhdGlvbicsXG4gICAgICAgICAgICAnLmpvYi1sb2NhdGlvbicsXG4gICAgICAgICAgICAnLmNvbXBhbnktbG9jYXRpb24nLFxuICAgICAgICAgICAgJy5qb2ItaW5mbyAubG9jYXRpb24nLFxuICAgICAgICAgICAgJyNoZWFkZXIgLmxvY2F0aW9uJyxcbiAgICAgICAgXTtcbiAgICAgICAgZm9yIChjb25zdCBzZWxlY3RvciBvZiBzZWxlY3RvcnMpIHtcbiAgICAgICAgICAgIGNvbnN0IHRleHQgPSB0aGlzLmV4dHJhY3RUZXh0Q29udGVudChzZWxlY3Rvcik7XG4gICAgICAgICAgICBpZiAodGV4dClcbiAgICAgICAgICAgICAgICByZXR1cm4gdGV4dDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZXh0cmFjdERlc2NyaXB0aW9uKCkge1xuICAgICAgICBjb25zdCBzZWxlY3RvcnMgPSBbXG4gICAgICAgICAgICAnI2NvbnRlbnQnLFxuICAgICAgICAgICAgJy5qb2ItZGVzY3JpcHRpb24nLFxuICAgICAgICAgICAgJy5jb250ZW50LXdyYXBwZXIgLmNvbnRlbnQnLFxuICAgICAgICAgICAgJyNqb2JfZGVzY3JpcHRpb24nLFxuICAgICAgICAgICAgJy5qb2ItY29udGVudCcsXG4gICAgICAgICAgICAnLmpvYi1pbmZvIC5jb250ZW50JyxcbiAgICAgICAgXTtcbiAgICAgICAgZm9yIChjb25zdCBzZWxlY3RvciBvZiBzZWxlY3RvcnMpIHtcbiAgICAgICAgICAgIGNvbnN0IGh0bWwgPSB0aGlzLmV4dHJhY3RIdG1sQ29udGVudChzZWxlY3Rvcik7XG4gICAgICAgICAgICBpZiAoaHRtbCAmJiBodG1sLmxlbmd0aCA+IDEwMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNsZWFuRGVzY3JpcHRpb24oaHRtbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGV4dHJhY3RKb2JJZCgpIHtcbiAgICAgICAgLy8gRnJvbSBVUkw6IGJvYXJkcy5ncmVlbmhvdXNlLmlvL2NvbXBhbnkvam9icy8xMjM0NVxuICAgICAgICBjb25zdCBtYXRjaCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLm1hdGNoKC9cXC9qb2JzXFwvKFxcZCspLyk7XG4gICAgICAgIHJldHVybiBtYXRjaD8uWzFdO1xuICAgIH1cbiAgICBleHRyYWN0Sm9iSWRGcm9tVXJsKHVybCkge1xuICAgICAgICBjb25zdCBtYXRjaCA9IHVybC5tYXRjaCgvXFwvam9ic1xcLyhcXGQrKS8pO1xuICAgICAgICByZXR1cm4gbWF0Y2g/LlsxXTtcbiAgICB9XG4gICAgZXh0cmFjdFN0cnVjdHVyZWREYXRhKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgbGRKc29uRWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdzY3JpcHRbdHlwZT1cImFwcGxpY2F0aW9uL2xkK2pzb25cIl0nKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgZWwgb2YgbGRKc29uRWxlbWVudHMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWVsLnRleHRDb250ZW50KVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0gSlNPTi5wYXJzZShlbC50ZXh0Q29udGVudCk7XG4gICAgICAgICAgICAgICAgY29uc3Qgam9iRGF0YSA9IEFycmF5LmlzQXJyYXkoZGF0YSkgPyBkYXRhLmZpbmQoKGQpID0+IGRbJ0B0eXBlJ10gPT09ICdKb2JQb3N0aW5nJykgOiBkYXRhO1xuICAgICAgICAgICAgICAgIGlmICgham9iRGF0YSB8fCBqb2JEYXRhWydAdHlwZSddICE9PSAnSm9iUG9zdGluZycpXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGNvbnN0IGVtcGxveW1lbnRUeXBlID0gam9iRGF0YS5lbXBsb3ltZW50VHlwZT8udG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgICAgICBsZXQgdHlwZTtcbiAgICAgICAgICAgICAgICBpZiAoZW1wbG95bWVudFR5cGU/LmluY2x1ZGVzKCdmdWxsJykpXG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPSAnZnVsbC10aW1lJztcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChlbXBsb3ltZW50VHlwZT8uaW5jbHVkZXMoJ3BhcnQnKSlcbiAgICAgICAgICAgICAgICAgICAgdHlwZSA9ICdwYXJ0LXRpbWUnO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGVtcGxveW1lbnRUeXBlPy5pbmNsdWRlcygnY29udHJhY3QnKSlcbiAgICAgICAgICAgICAgICAgICAgdHlwZSA9ICdjb250cmFjdCc7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZW1wbG95bWVudFR5cGU/LmluY2x1ZGVzKCdpbnRlcm4nKSlcbiAgICAgICAgICAgICAgICAgICAgdHlwZSA9ICdpbnRlcm5zaGlwJztcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZTogam9iRGF0YS50aXRsZSxcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb246IHR5cGVvZiBqb2JEYXRhLmpvYkxvY2F0aW9uID09PSAnc3RyaW5nJ1xuICAgICAgICAgICAgICAgICAgICAgICAgPyBqb2JEYXRhLmpvYkxvY2F0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICA6IGpvYkRhdGEuam9iTG9jYXRpb24/LmFkZHJlc3M/LmFkZHJlc3NMb2NhbGl0eSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGpvYkRhdGEuam9iTG9jYXRpb24/LmFkZHJlc3M/Lm5hbWUgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqb2JEYXRhLmpvYkxvY2F0aW9uPy5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBzYWxhcnk6IGpvYkRhdGEuYmFzZVNhbGFyeT8udmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgID8gYCQke2pvYkRhdGEuYmFzZVNhbGFyeS52YWx1ZS5taW5WYWx1ZSB8fCAnJ30tJHtqb2JEYXRhLmJhc2VTYWxhcnkudmFsdWUubWF4VmFsdWUgfHwgJyd9YFxuICAgICAgICAgICAgICAgICAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgIHBvc3RlZEF0OiBqb2JEYXRhLmRhdGVQb3N0ZWQsXG4gICAgICAgICAgICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8gTGV2ZXIgam9iIGJvYXJkIHNjcmFwZXJcbmltcG9ydCB7IEJhc2VTY3JhcGVyIH0gZnJvbSAnLi9iYXNlLXNjcmFwZXInO1xuZXhwb3J0IGNsYXNzIExldmVyU2NyYXBlciBleHRlbmRzIEJhc2VTY3JhcGVyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcbiAgICAgICAgdGhpcy5zb3VyY2UgPSAnbGV2ZXInO1xuICAgICAgICB0aGlzLnVybFBhdHRlcm5zID0gW1xuICAgICAgICAgICAgL2pvYnNcXC5sZXZlclxcLmNvXFwvW1xcdy1dK1xcL1tcXHctXSsvLFxuICAgICAgICAgICAgL1tcXHctXStcXC5sZXZlclxcLmNvXFwvW1xcdy1dKy8sXG4gICAgICAgIF07XG4gICAgfVxuICAgIGNhbkhhbmRsZSh1cmwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudXJsUGF0dGVybnMuc29tZSgocCkgPT4gcC50ZXN0KHVybCkpO1xuICAgIH1cbiAgICBhc3luYyBzY3JhcGVKb2JMaXN0aW5nKCkge1xuICAgICAgICAvLyBXYWl0IGZvciBqb2IgY29udGVudCB0byBsb2FkXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLndhaXRGb3JFbGVtZW50KCcucG9zdGluZy1oZWFkbGluZSBoMiwgLnBvc3RpbmctaGVhZGxpbmUgaDEsIC5zZWN0aW9uLXdyYXBwZXInLCAzMDAwKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCB7XG4gICAgICAgICAgICAvLyBDb250aW51ZSB3aXRoIGF2YWlsYWJsZSBkYXRhXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdGl0bGUgPSB0aGlzLmV4dHJhY3RKb2JUaXRsZSgpO1xuICAgICAgICBjb25zdCBjb21wYW55ID0gdGhpcy5leHRyYWN0Q29tcGFueSgpO1xuICAgICAgICBjb25zdCBsb2NhdGlvbiA9IHRoaXMuZXh0cmFjdExvY2F0aW9uKCk7XG4gICAgICAgIGNvbnN0IGRlc2NyaXB0aW9uID0gdGhpcy5leHRyYWN0RGVzY3JpcHRpb24oKTtcbiAgICAgICAgaWYgKCF0aXRsZSB8fCAhY29tcGFueSB8fCAhZGVzY3JpcHRpb24pIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbQ29sdW1idXNdIExldmVyIHNjcmFwZXI6IE1pc3NpbmcgcmVxdWlyZWQgZmllbGRzJywgeyB0aXRsZSwgY29tcGFueSwgZGVzY3JpcHRpb246ICEhZGVzY3JpcHRpb24gfSk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzdHJ1Y3R1cmVkRGF0YSA9IHRoaXMuZXh0cmFjdFN0cnVjdHVyZWREYXRhKCk7XG4gICAgICAgIGNvbnN0IGNvbW1pdG1lbnQgPSB0aGlzLmV4dHJhY3RDb21taXRtZW50KCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICAgIGNvbXBhbnksXG4gICAgICAgICAgICBsb2NhdGlvbjogbG9jYXRpb24gfHwgc3RydWN0dXJlZERhdGE/LmxvY2F0aW9uLFxuICAgICAgICAgICAgZGVzY3JpcHRpb24sXG4gICAgICAgICAgICByZXF1aXJlbWVudHM6IHRoaXMuZXh0cmFjdFJlcXVpcmVtZW50cyhkZXNjcmlwdGlvbiksXG4gICAgICAgICAgICBrZXl3b3JkczogdGhpcy5leHRyYWN0S2V5d29yZHMoZGVzY3JpcHRpb24pLFxuICAgICAgICAgICAgc2FsYXJ5OiB0aGlzLmV4dHJhY3RTYWxhcnkoZGVzY3JpcHRpb24pIHx8IHN0cnVjdHVyZWREYXRhPy5zYWxhcnksXG4gICAgICAgICAgICB0eXBlOiB0aGlzLmRldGVjdEpvYlR5cGVGcm9tQ29tbWl0bWVudChjb21taXRtZW50KSB8fCB0aGlzLmRldGVjdEpvYlR5cGUoZGVzY3JpcHRpb24pLFxuICAgICAgICAgICAgcmVtb3RlOiB0aGlzLmRldGVjdFJlbW90ZShsb2NhdGlvbiB8fCAnJykgfHwgdGhpcy5kZXRlY3RSZW1vdGUoZGVzY3JpcHRpb24pLFxuICAgICAgICAgICAgdXJsOiB3aW5kb3cubG9jYXRpb24uaHJlZixcbiAgICAgICAgICAgIHNvdXJjZTogdGhpcy5zb3VyY2UsXG4gICAgICAgICAgICBzb3VyY2VKb2JJZDogdGhpcy5leHRyYWN0Sm9iSWQoKSxcbiAgICAgICAgICAgIHBvc3RlZEF0OiBzdHJ1Y3R1cmVkRGF0YT8ucG9zdGVkQXQsXG4gICAgICAgIH07XG4gICAgfVxuICAgIGFzeW5jIHNjcmFwZUpvYkxpc3QoKSB7XG4gICAgICAgIGNvbnN0IGpvYnMgPSBbXTtcbiAgICAgICAgLy8gSm9iIHBvc3RpbmdzIG9uIGNvbXBhbnkgcGFnZVxuICAgICAgICBjb25zdCBqb2JDYXJkcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5wb3N0aW5nLCBbZGF0YS1xYT1cInBvc3RpbmctbmFtZVwiXScpO1xuICAgICAgICBmb3IgKGNvbnN0IGNhcmQgb2Ygam9iQ2FyZHMpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdGl0bGVFbCA9IGNhcmQucXVlcnlTZWxlY3RvcignLnBvc3RpbmctdGl0bGUgaDUsIC5wb3N0aW5nLW5hbWUsIGFbZGF0YS1xYT1cInBvc3RpbmctbmFtZVwiXScpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2F0aW9uRWwgPSBjYXJkLnF1ZXJ5U2VsZWN0b3IoJy5sb2NhdGlvbiwgLnBvc3RpbmctY2F0ZWdvcmllcyAuc29ydC1ieS1sb2NhdGlvbiwgLndvcmtwbGFjZVR5cGVzJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgY29tbWl0bWVudEVsID0gY2FyZC5xdWVyeVNlbGVjdG9yKCcuY29tbWl0bWVudCwgLnBvc3RpbmctY2F0ZWdvcmllcyAuc29ydC1ieS1jb21taXRtZW50Jyk7XG4gICAgICAgICAgICAgICAgY29uc3QgdGl0bGUgPSB0aXRsZUVsPy50ZXh0Q29udGVudD8udHJpbSgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2F0aW9uID0gbG9jYXRpb25FbD8udGV4dENvbnRlbnQ/LnRyaW0oKTtcbiAgICAgICAgICAgICAgICBjb25zdCBjb21taXRtZW50ID0gY29tbWl0bWVudEVsPy50ZXh0Q29udGVudD8udHJpbSgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IGNhcmQucXVlcnlTZWxlY3RvcignYS5wb3N0aW5nLXRpdGxlLCBhW2RhdGEtcWE9XCJwb3N0aW5nLW5hbWVcIl0nKT8uaHJlZiB8fFxuICAgICAgICAgICAgICAgICAgICBjYXJkLmhyZWY7XG4gICAgICAgICAgICAgICAgY29uc3QgY29tcGFueSA9IHRoaXMuZXh0cmFjdENvbXBhbnkoKTtcbiAgICAgICAgICAgICAgICBpZiAodGl0bGUgJiYgdXJsICYmIGNvbXBhbnkpIHtcbiAgICAgICAgICAgICAgICAgICAgam9icy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGFueSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWlyZW1lbnRzOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogdGhpcy5zb3VyY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VKb2JJZDogdGhpcy5leHRyYWN0Sm9iSWRGcm9tVXJsKHVybCksXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiB0aGlzLmRldGVjdEpvYlR5cGVGcm9tQ29tbWl0bWVudChjb21taXRtZW50ID8/IG51bGwpLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignW0NvbHVtYnVzXSBFcnJvciBzY3JhcGluZyBMZXZlciBqb2IgY2FyZDonLCBlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBqb2JzO1xuICAgIH1cbiAgICBleHRyYWN0Sm9iVGl0bGUoKSB7XG4gICAgICAgIGNvbnN0IHNlbGVjdG9ycyA9IFtcbiAgICAgICAgICAgICcucG9zdGluZy1oZWFkbGluZSBoMicsXG4gICAgICAgICAgICAnLnBvc3RpbmctaGVhZGxpbmUgaDEnLFxuICAgICAgICAgICAgJ1tkYXRhLXFhPVwicG9zdGluZy1uYW1lXCJdJyxcbiAgICAgICAgICAgICcucG9zdGluZy1oZWFkZXIgaDInLFxuICAgICAgICAgICAgJy5zZWN0aW9uLnBhZ2UtY2VudGVyZWQucG9zdGluZy1oZWFkZXIgaDEnLFxuICAgICAgICBdO1xuICAgICAgICBmb3IgKGNvbnN0IHNlbGVjdG9yIG9mIHNlbGVjdG9ycykge1xuICAgICAgICAgICAgY29uc3QgdGV4dCA9IHRoaXMuZXh0cmFjdFRleHRDb250ZW50KHNlbGVjdG9yKTtcbiAgICAgICAgICAgIGlmICh0ZXh0KVxuICAgICAgICAgICAgICAgIHJldHVybiB0ZXh0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBleHRyYWN0Q29tcGFueSgpIHtcbiAgICAgICAgLy8gVHJ5IGxvZ28gYWx0IHRleHRcbiAgICAgICAgY29uc3QgbG9nbyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tYWluLWhlYWRlci1sb2dvIGltZywgLnBvc3RpbmctaGVhZGVyIC5sb2dvIGltZywgaGVhZGVyIGltZycpO1xuICAgICAgICBpZiAobG9nbykge1xuICAgICAgICAgICAgY29uc3QgYWx0ID0gbG9nby5nZXRBdHRyaWJ1dGUoJ2FsdCcpO1xuICAgICAgICAgICAgaWYgKGFsdCAmJiBhbHQgIT09ICdDb21wYW55IExvZ28nKVxuICAgICAgICAgICAgICAgIHJldHVybiBhbHQ7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVHJ5IHBhZ2UgdGl0bGVcbiAgICAgICAgY29uc3QgcGFnZVRpdGxlID0gZG9jdW1lbnQudGl0bGU7XG4gICAgICAgIGlmIChwYWdlVGl0bGUpIHtcbiAgICAgICAgICAgIC8vIEZvcm1hdDogXCJKb2IgVGl0bGUgLSBDb21wYW55IE5hbWVcIlxuICAgICAgICAgICAgY29uc3QgcGFydHMgPSBwYWdlVGl0bGUuc3BsaXQoJyAtICcpO1xuICAgICAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA+PSAyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdLnJlcGxhY2UoJyBKb2JzJywgJycpLnRyaW0oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBFeHRyYWN0IGZyb20gVVJMXG4gICAgICAgIGNvbnN0IG1hdGNoID0gd2luZG93LmxvY2F0aW9uLmhyZWYubWF0Y2goL2xldmVyXFwuY29cXC8oW14vXSspLyk7XG4gICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgICAgcmV0dXJuIG1hdGNoWzFdLnJlcGxhY2UoLy0vZywgJyAnKS5yZXBsYWNlKC9cXGJcXHcvZywgKGMpID0+IGMudG9VcHBlckNhc2UoKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGV4dHJhY3RMb2NhdGlvbigpIHtcbiAgICAgICAgY29uc3Qgc2VsZWN0b3JzID0gW1xuICAgICAgICAgICAgJy5wb3N0aW5nLWNhdGVnb3JpZXMgLmxvY2F0aW9uJyxcbiAgICAgICAgICAgICcucG9zdGluZy1oZWFkbGluZSAubG9jYXRpb24nLFxuICAgICAgICAgICAgJy5zb3J0LWJ5LWxvY2F0aW9uJyxcbiAgICAgICAgICAgICcud29ya3BsYWNlVHlwZXMnLFxuICAgICAgICAgICAgJ1tkYXRhLXFhPVwicG9zdGluZy1sb2NhdGlvblwiXScsXG4gICAgICAgIF07XG4gICAgICAgIGZvciAoY29uc3Qgc2VsZWN0b3Igb2Ygc2VsZWN0b3JzKSB7XG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0gdGhpcy5leHRyYWN0VGV4dENvbnRlbnQoc2VsZWN0b3IpO1xuICAgICAgICAgICAgaWYgKHRleHQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGV4dHJhY3RDb21taXRtZW50KCkge1xuICAgICAgICBjb25zdCBzZWxlY3RvcnMgPSBbXG4gICAgICAgICAgICAnLnBvc3RpbmctY2F0ZWdvcmllcyAuY29tbWl0bWVudCcsXG4gICAgICAgICAgICAnLnNvcnQtYnktY29tbWl0bWVudCcsXG4gICAgICAgICAgICAnW2RhdGEtcWE9XCJwb3N0aW5nLWNvbW1pdG1lbnRcIl0nLFxuICAgICAgICBdO1xuICAgICAgICBmb3IgKGNvbnN0IHNlbGVjdG9yIG9mIHNlbGVjdG9ycykge1xuICAgICAgICAgICAgY29uc3QgdGV4dCA9IHRoaXMuZXh0cmFjdFRleHRDb250ZW50KHNlbGVjdG9yKTtcbiAgICAgICAgICAgIGlmICh0ZXh0KVxuICAgICAgICAgICAgICAgIHJldHVybiB0ZXh0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBleHRyYWN0RGVzY3JpcHRpb24oKSB7XG4gICAgICAgIGNvbnN0IHNlbGVjdG9ycyA9IFtcbiAgICAgICAgICAgICcucG9zdGluZy1wYWdlIC5jb250ZW50JyxcbiAgICAgICAgICAgICcuc2VjdGlvbi13cmFwcGVyLnBhZ2UtZnVsbC13aWR0aCcsXG4gICAgICAgICAgICAnLnNlY3Rpb24ucGFnZS1jZW50ZXJlZCcsXG4gICAgICAgICAgICAnW2RhdGEtcWE9XCJqb2ItZGVzY3JpcHRpb25cIl0nLFxuICAgICAgICAgICAgJy5wb3N0aW5nLWRlc2NyaXB0aW9uJyxcbiAgICAgICAgXTtcbiAgICAgICAgZm9yIChjb25zdCBzZWxlY3RvciBvZiBzZWxlY3RvcnMpIHtcbiAgICAgICAgICAgIC8vIEZvciBMZXZlciwgd2Ugd2FudCB0byBnZXQgYWxsIGNvbnRlbnQgc2VjdGlvbnNcbiAgICAgICAgICAgIGNvbnN0IHNlY3Rpb25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gICAgICAgICAgICBpZiAoc2VjdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGh0bWwgPSBBcnJheS5mcm9tKHNlY3Rpb25zKVxuICAgICAgICAgICAgICAgICAgICAubWFwKChzKSA9PiBzLmlubmVySFRNTClcbiAgICAgICAgICAgICAgICAgICAgLmpvaW4oJ1xcblxcbicpO1xuICAgICAgICAgICAgICAgIGlmIChodG1sLmxlbmd0aCA+IDEwMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jbGVhbkRlc2NyaXB0aW9uKGh0bWwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBUcnkgZ2V0dGluZyB0aGUgbWFpbiBjb250ZW50IGFyZWFcbiAgICAgICAgY29uc3QgbWFpbkNvbnRlbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY29udGVudC13cmFwcGVyIC5jb250ZW50LCBtYWluIC5jb250ZW50Jyk7XG4gICAgICAgIGlmIChtYWluQ29udGVudCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2xlYW5EZXNjcmlwdGlvbihtYWluQ29udGVudC5pbm5lckhUTUwpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBleHRyYWN0Sm9iSWQoKSB7XG4gICAgICAgIC8vIEZyb20gVVJMOiBqb2JzLmxldmVyLmNvL2NvbXBhbnkvam9iLWlkLXV1aWRcbiAgICAgICAgY29uc3QgbWF0Y2ggPSB3aW5kb3cubG9jYXRpb24uaHJlZi5tYXRjaCgvbGV2ZXJcXC5jb1xcL1teL10rXFwvKFthLWYwLTktXSspL2kpO1xuICAgICAgICByZXR1cm4gbWF0Y2g/LlsxXTtcbiAgICB9XG4gICAgZXh0cmFjdEpvYklkRnJvbVVybCh1cmwpIHtcbiAgICAgICAgY29uc3QgbWF0Y2ggPSB1cmwubWF0Y2goL2xldmVyXFwuY29cXC9bXi9dK1xcLyhbYS1mMC05LV0rKS9pKTtcbiAgICAgICAgcmV0dXJuIG1hdGNoPy5bMV07XG4gICAgfVxuICAgIGRldGVjdEpvYlR5cGVGcm9tQ29tbWl0bWVudChjb21taXRtZW50KSB7XG4gICAgICAgIGlmICghY29tbWl0bWVudClcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIGNvbnN0IGxvd2VyID0gY29tbWl0bWVudC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBpZiAobG93ZXIuaW5jbHVkZXMoJ2Z1bGwtdGltZScpIHx8IGxvd2VyLmluY2x1ZGVzKCdmdWxsIHRpbWUnKSlcbiAgICAgICAgICAgIHJldHVybiAnZnVsbC10aW1lJztcbiAgICAgICAgaWYgKGxvd2VyLmluY2x1ZGVzKCdwYXJ0LXRpbWUnKSB8fCBsb3dlci5pbmNsdWRlcygncGFydCB0aW1lJykpXG4gICAgICAgICAgICByZXR1cm4gJ3BhcnQtdGltZSc7XG4gICAgICAgIGlmIChsb3dlci5pbmNsdWRlcygnY29udHJhY3QnKSB8fCBsb3dlci5pbmNsdWRlcygnY29udHJhY3RvcicpKVxuICAgICAgICAgICAgcmV0dXJuICdjb250cmFjdCc7XG4gICAgICAgIGlmIChsb3dlci5pbmNsdWRlcygnaW50ZXJuJykpXG4gICAgICAgICAgICByZXR1cm4gJ2ludGVybnNoaXAnO1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBleHRyYWN0U3RydWN0dXJlZERhdGEoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBsZEpzb25FbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ3NjcmlwdFt0eXBlPVwiYXBwbGljYXRpb24vbGQranNvblwiXScpO1xuICAgICAgICAgICAgZm9yIChjb25zdCBlbCBvZiBsZEpzb25FbGVtZW50cykge1xuICAgICAgICAgICAgICAgIGlmICghZWwudGV4dENvbnRlbnQpXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKGVsLnRleHRDb250ZW50KTtcbiAgICAgICAgICAgICAgICBjb25zdCBqb2JEYXRhID0gQXJyYXkuaXNBcnJheShkYXRhKSA/IGRhdGEuZmluZCgoZCkgPT4gZFsnQHR5cGUnXSA9PT0gJ0pvYlBvc3RpbmcnKSA6IGRhdGE7XG4gICAgICAgICAgICAgICAgaWYgKCFqb2JEYXRhIHx8IGpvYkRhdGFbJ0B0eXBlJ10gIT09ICdKb2JQb3N0aW5nJylcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb246IHR5cGVvZiBqb2JEYXRhLmpvYkxvY2F0aW9uID09PSAnc3RyaW5nJ1xuICAgICAgICAgICAgICAgICAgICAgICAgPyBqb2JEYXRhLmpvYkxvY2F0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICA6IGpvYkRhdGEuam9iTG9jYXRpb24/LmFkZHJlc3M/LmFkZHJlc3NMb2NhbGl0eSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGpvYkRhdGEuam9iTG9jYXRpb24/Lm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIHNhbGFyeTogam9iRGF0YS5iYXNlU2FsYXJ5Py52YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgPyBgJCR7am9iRGF0YS5iYXNlU2FsYXJ5LnZhbHVlLm1pblZhbHVlIHx8ICcnfS0ke2pvYkRhdGEuYmFzZVNhbGFyeS52YWx1ZS5tYXhWYWx1ZSB8fCAnJ31gXG4gICAgICAgICAgICAgICAgICAgICAgICA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgcG9zdGVkQXQ6IGpvYkRhdGEuZGF0ZVBvc3RlZCxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2gge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLyBHZW5lcmljIGpvYiBzY3JhcGVyIGZvciB1bmtub3duIHNpdGVzXG5pbXBvcnQgeyBCYXNlU2NyYXBlciB9IGZyb20gJy4vYmFzZS1zY3JhcGVyJztcbmV4cG9ydCBjbGFzcyBHZW5lcmljU2NyYXBlciBleHRlbmRzIEJhc2VTY3JhcGVyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcbiAgICAgICAgdGhpcy5zb3VyY2UgPSAndW5rbm93bic7XG4gICAgICAgIHRoaXMudXJsUGF0dGVybnMgPSBbXTtcbiAgICB9XG4gICAgY2FuSGFuZGxlKF91cmwpIHtcbiAgICAgICAgLy8gR2VuZXJpYyBzY3JhcGVyIGFsd2F5cyByZXR1cm5zIHRydWUgYXMgZmFsbGJhY2tcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGFzeW5jIHNjcmFwZUpvYkxpc3RpbmcoKSB7XG4gICAgICAgIC8vIFRyeSB0byBleHRyYWN0IGpvYiBpbmZvcm1hdGlvbiB1c2luZyBjb21tb24gcGF0dGVybnNcbiAgICAgICAgLy8gQ2hlY2sgZm9yIHN0cnVjdHVyZWQgZGF0YSBmaXJzdFxuICAgICAgICBjb25zdCBzdHJ1Y3R1cmVkRGF0YSA9IHRoaXMuZXh0cmFjdFN0cnVjdHVyZWREYXRhKCk7XG4gICAgICAgIGlmIChzdHJ1Y3R1cmVkRGF0YSkge1xuICAgICAgICAgICAgcmV0dXJuIHN0cnVjdHVyZWREYXRhO1xuICAgICAgICB9XG4gICAgICAgIC8vIFRyeSBjb21tb24gc2VsZWN0b3JzXG4gICAgICAgIGNvbnN0IHRpdGxlID0gdGhpcy5maW5kVGl0bGUoKTtcbiAgICAgICAgY29uc3QgY29tcGFueSA9IHRoaXMuZmluZENvbXBhbnkoKTtcbiAgICAgICAgY29uc3QgZGVzY3JpcHRpb24gPSB0aGlzLmZpbmREZXNjcmlwdGlvbigpO1xuICAgICAgICBpZiAoIXRpdGxlIHx8ICFkZXNjcmlwdGlvbikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tDb2x1bWJ1c10gR2VuZXJpYyBzY3JhcGVyOiBDb3VsZCBub3QgZmluZCByZXF1aXJlZCBmaWVsZHMnKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGxvY2F0aW9uID0gdGhpcy5maW5kTG9jYXRpb24oKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgICAgY29tcGFueTogY29tcGFueSB8fCAnVW5rbm93biBDb21wYW55JyxcbiAgICAgICAgICAgIGxvY2F0aW9uOiBsb2NhdGlvbiB8fCB1bmRlZmluZWQsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbixcbiAgICAgICAgICAgIHJlcXVpcmVtZW50czogdGhpcy5leHRyYWN0UmVxdWlyZW1lbnRzKGRlc2NyaXB0aW9uKSxcbiAgICAgICAgICAgIGtleXdvcmRzOiB0aGlzLmV4dHJhY3RLZXl3b3JkcyhkZXNjcmlwdGlvbiksXG4gICAgICAgICAgICBzYWxhcnk6IHRoaXMuZXh0cmFjdFNhbGFyeShkZXNjcmlwdGlvbiksXG4gICAgICAgICAgICB0eXBlOiB0aGlzLmRldGVjdEpvYlR5cGUoZGVzY3JpcHRpb24pLFxuICAgICAgICAgICAgcmVtb3RlOiB0aGlzLmRldGVjdFJlbW90ZShsb2NhdGlvbiB8fCAnJykgfHwgdGhpcy5kZXRlY3RSZW1vdGUoZGVzY3JpcHRpb24pLFxuICAgICAgICAgICAgdXJsOiB3aW5kb3cubG9jYXRpb24uaHJlZixcbiAgICAgICAgICAgIHNvdXJjZTogdGhpcy5kZXRlY3RTb3VyY2UoKSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgYXN5bmMgc2NyYXBlSm9iTGlzdCgpIHtcbiAgICAgICAgLy8gR2VuZXJpYyBzY3JhcGluZyBvZiBqb2IgbGlzdHMgaXMgdW5yZWxpYWJsZVxuICAgICAgICAvLyBSZXR1cm4gZW1wdHkgYXJyYXkgZm9yIHVua25vd24gc2l0ZXNcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBleHRyYWN0U3RydWN0dXJlZERhdGEoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBMb29rIGZvciBKU09OLUxEIGpvYiBwb3N0aW5nIHNjaGVtYVxuICAgICAgICAgICAgY29uc3Qgc2NyaXB0cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ3NjcmlwdFt0eXBlPVwiYXBwbGljYXRpb24vbGQranNvblwiXScpO1xuICAgICAgICAgICAgZm9yIChjb25zdCBzY3JpcHQgb2Ygc2NyaXB0cykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKHNjcmlwdC50ZXh0Q29udGVudCB8fCAnJyk7XG4gICAgICAgICAgICAgICAgLy8gSGFuZGxlIHNpbmdsZSBqb2IgcG9zdGluZ1xuICAgICAgICAgICAgICAgIGlmIChkYXRhWydAdHlwZSddID09PSAnSm9iUG9zdGluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VKb2JQb3N0aW5nU2NoZW1hKGRhdGEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBIYW5kbGUgYXJyYXkgb2YgaXRlbXNcbiAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShkYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBqb2JQb3N0aW5nID0gZGF0YS5maW5kKChpdGVtKSA9PiBpdGVtWydAdHlwZSddID09PSAnSm9iUG9zdGluZycpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoam9iUG9zdGluZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VKb2JQb3N0aW5nU2NoZW1hKGpvYlBvc3RpbmcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIEhhbmRsZSBAZ3JhcGhcbiAgICAgICAgICAgICAgICBpZiAoZGF0YVsnQGdyYXBoJ10pIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgam9iUG9zdGluZyA9IGRhdGFbJ0BncmFwaCddLmZpbmQoKGl0ZW0pID0+IGl0ZW1bJ0B0eXBlJ10gPT09ICdKb2JQb3N0aW5nJyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChqb2JQb3N0aW5nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5wYXJzZUpvYlBvc3RpbmdTY2hlbWEoam9iUG9zdGluZyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tDb2x1bWJ1c10gQ291bGQgbm90IHBhcnNlIHN0cnVjdHVyZWQgZGF0YTonLCBlcnIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBwYXJzZUpvYlBvc3RpbmdTY2hlbWEoZGF0YSkge1xuICAgICAgICBjb25zdCB0aXRsZSA9IGRhdGEudGl0bGUgfHwgJyc7XG4gICAgICAgIGNvbnN0IGNvbXBhbnkgPSBkYXRhLmhpcmluZ09yZ2FuaXphdGlvbj8ubmFtZSB8fCAnJztcbiAgICAgICAgY29uc3QgZGVzY3JpcHRpb24gPSBkYXRhLmRlc2NyaXB0aW9uIHx8ICcnO1xuICAgICAgICAvLyBFeHRyYWN0IGxvY2F0aW9uXG4gICAgICAgIGxldCBsb2NhdGlvbjtcbiAgICAgICAgY29uc3Qgam9iTG9jYXRpb24gPSBkYXRhLmpvYkxvY2F0aW9uO1xuICAgICAgICBpZiAoam9iTG9jYXRpb24pIHtcbiAgICAgICAgICAgIGNvbnN0IGFkZHJlc3MgPSBqb2JMb2NhdGlvbi5hZGRyZXNzO1xuICAgICAgICAgICAgaWYgKGFkZHJlc3MpIHtcbiAgICAgICAgICAgICAgICBsb2NhdGlvbiA9IFthZGRyZXNzLmFkZHJlc3NMb2NhbGl0eSwgYWRkcmVzcy5hZGRyZXNzUmVnaW9uLCBhZGRyZXNzLmFkZHJlc3NDb3VudHJ5XVxuICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKEJvb2xlYW4pXG4gICAgICAgICAgICAgICAgICAgIC5qb2luKCcsICcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIEV4dHJhY3Qgc2FsYXJ5XG4gICAgICAgIGxldCBzYWxhcnk7XG4gICAgICAgIGNvbnN0IGJhc2VTYWxhcnkgPSBkYXRhLmJhc2VTYWxhcnk7XG4gICAgICAgIGlmIChiYXNlU2FsYXJ5KSB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGJhc2VTYWxhcnkudmFsdWU7XG4gICAgICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW5jeSA9IGJhc2VTYWxhcnkuY3VycmVuY3kgfHwgJ1VTRCc7XG4gICAgICAgICAgICAgICAgY29uc3QgbWluID0gdmFsdWUubWluVmFsdWU7XG4gICAgICAgICAgICAgICAgY29uc3QgbWF4ID0gdmFsdWUubWF4VmFsdWU7XG4gICAgICAgICAgICAgICAgaWYgKG1pbiAmJiBtYXgpIHtcbiAgICAgICAgICAgICAgICAgICAgc2FsYXJ5ID0gYCR7Y3VycmVuY3l9ICR7bWluLnRvTG9jYWxlU3RyaW5nKCl9IC0gJHttYXgudG9Mb2NhbGVTdHJpbmcoKX1gO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBzYWxhcnkgPSBgJHtjdXJyZW5jeX0gJHt2YWx1ZS50b0xvY2FsZVN0cmluZygpfWA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICAgIGNvbXBhbnksXG4gICAgICAgICAgICBsb2NhdGlvbixcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB0aGlzLmNsZWFuRGVzY3JpcHRpb24oZGVzY3JpcHRpb24pLFxuICAgICAgICAgICAgcmVxdWlyZW1lbnRzOiB0aGlzLmV4dHJhY3RSZXF1aXJlbWVudHMoZGVzY3JpcHRpb24pLFxuICAgICAgICAgICAga2V5d29yZHM6IHRoaXMuZXh0cmFjdEtleXdvcmRzKGRlc2NyaXB0aW9uKSxcbiAgICAgICAgICAgIHNhbGFyeSxcbiAgICAgICAgICAgIHR5cGU6IHRoaXMucGFyc2VFbXBsb3ltZW50VHlwZShkYXRhLmVtcGxveW1lbnRUeXBlKSxcbiAgICAgICAgICAgIHJlbW90ZTogdGhpcy5kZXRlY3RSZW1vdGUoZGVzY3JpcHRpb24pLFxuICAgICAgICAgICAgdXJsOiB3aW5kb3cubG9jYXRpb24uaHJlZixcbiAgICAgICAgICAgIHNvdXJjZTogdGhpcy5kZXRlY3RTb3VyY2UoKSxcbiAgICAgICAgICAgIHBvc3RlZEF0OiBkYXRhLmRhdGVQb3N0ZWQsXG4gICAgICAgIH07XG4gICAgfVxuICAgIHBhcnNlRW1wbG95bWVudFR5cGUodHlwZSkge1xuICAgICAgICBpZiAoIXR5cGUpXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICBjb25zdCBsb3dlciA9IHR5cGUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgaWYgKGxvd2VyLmluY2x1ZGVzKCdmdWxsJykpXG4gICAgICAgICAgICByZXR1cm4gJ2Z1bGwtdGltZSc7XG4gICAgICAgIGlmIChsb3dlci5pbmNsdWRlcygncGFydCcpKVxuICAgICAgICAgICAgcmV0dXJuICdwYXJ0LXRpbWUnO1xuICAgICAgICBpZiAobG93ZXIuaW5jbHVkZXMoJ2NvbnRyYWN0JykgfHwgbG93ZXIuaW5jbHVkZXMoJ3RlbXBvcmFyeScpKVxuICAgICAgICAgICAgcmV0dXJuICdjb250cmFjdCc7XG4gICAgICAgIGlmIChsb3dlci5pbmNsdWRlcygnaW50ZXJuJykpXG4gICAgICAgICAgICByZXR1cm4gJ2ludGVybnNoaXAnO1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBmaW5kVGl0bGUoKSB7XG4gICAgICAgIC8vIENvbW1vbiB0aXRsZSBzZWxlY3RvcnNcbiAgICAgICAgY29uc3Qgc2VsZWN0b3JzID0gW1xuICAgICAgICAgICAgJ2gxW2NsYXNzKj1cInRpdGxlXCJdJyxcbiAgICAgICAgICAgICdoMVtjbGFzcyo9XCJqb2JcIl0nLFxuICAgICAgICAgICAgJy5qb2ItdGl0bGUnLFxuICAgICAgICAgICAgJy5wb3N0aW5nLXRpdGxlJyxcbiAgICAgICAgICAgICdbY2xhc3MqPVwiam9iLXRpdGxlXCJdJyxcbiAgICAgICAgICAgICdbY2xhc3MqPVwicG9zdGluZy10aXRsZVwiXScsXG4gICAgICAgICAgICAnaDEnLFxuICAgICAgICBdO1xuICAgICAgICBmb3IgKGNvbnN0IHNlbGVjdG9yIG9mIHNlbGVjdG9ycykge1xuICAgICAgICAgICAgY29uc3QgdGV4dCA9IHRoaXMuZXh0cmFjdFRleHRDb250ZW50KHNlbGVjdG9yKTtcbiAgICAgICAgICAgIGlmICh0ZXh0ICYmIHRleHQubGVuZ3RoID4gMyAmJiB0ZXh0Lmxlbmd0aCA8IDIwMCkge1xuICAgICAgICAgICAgICAgIC8vIEZpbHRlciBvdXQgY29tbW9uIG5vbi10aXRsZSBjb250ZW50XG4gICAgICAgICAgICAgICAgaWYgKCF0ZXh0LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoJ3NpZ24gaW4nKSAmJiAhdGV4dC50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKCdsb2cgaW4nKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGV4dDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gVHJ5IGRvY3VtZW50IHRpdGxlXG4gICAgICAgIGNvbnN0IGRvY1RpdGxlID0gZG9jdW1lbnQudGl0bGU7XG4gICAgICAgIGlmIChkb2NUaXRsZSAmJiBkb2NUaXRsZS5sZW5ndGggPiA1KSB7XG4gICAgICAgICAgICAvLyBSZW1vdmUgY29tbW9uIHN1ZmZpeGVzXG4gICAgICAgICAgICBjb25zdCBjbGVhbmVkID0gZG9jVGl0bGVcbiAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxzKlstfF1cXHMqLiskLywgJycpXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xccyphdFxccysuKyQvaSwgJycpXG4gICAgICAgICAgICAgICAgLnRyaW0oKTtcbiAgICAgICAgICAgIGlmIChjbGVhbmVkLmxlbmd0aCA+IDMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2xlYW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZmluZENvbXBhbnkoKSB7XG4gICAgICAgIGNvbnN0IHNlbGVjdG9ycyA9IFtcbiAgICAgICAgICAgICdbY2xhc3MqPVwiY29tcGFueS1uYW1lXCJdJyxcbiAgICAgICAgICAgICdbY2xhc3MqPVwiZW1wbG95ZXJcIl0nLFxuICAgICAgICAgICAgJ1tjbGFzcyo9XCJvcmdhbml6YXRpb25cIl0nLFxuICAgICAgICAgICAgJy5jb21wYW55JyxcbiAgICAgICAgICAgICcuZW1wbG95ZXInLFxuICAgICAgICAgICAgJ2FbaHJlZio9XCJjb21wYW55XCJdJyxcbiAgICAgICAgXTtcbiAgICAgICAgZm9yIChjb25zdCBzZWxlY3RvciBvZiBzZWxlY3RvcnMpIHtcbiAgICAgICAgICAgIGNvbnN0IHRleHQgPSB0aGlzLmV4dHJhY3RUZXh0Q29udGVudChzZWxlY3Rvcik7XG4gICAgICAgICAgICBpZiAodGV4dCAmJiB0ZXh0Lmxlbmd0aCA+IDEgJiYgdGV4dC5sZW5ndGggPCAxMDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBUcnkgbWV0YSB0YWdzXG4gICAgICAgIGNvbnN0IG9nU2l0ZU5hbWUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdtZXRhW3Byb3BlcnR5PVwib2c6c2l0ZV9uYW1lXCJdJyk7XG4gICAgICAgIGlmIChvZ1NpdGVOYW1lKSB7XG4gICAgICAgICAgICBjb25zdCBjb250ZW50ID0gb2dTaXRlTmFtZS5nZXRBdHRyaWJ1dGUoJ2NvbnRlbnQnKTtcbiAgICAgICAgICAgIGlmIChjb250ZW50KVxuICAgICAgICAgICAgICAgIHJldHVybiBjb250ZW50O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBmaW5kRGVzY3JpcHRpb24oKSB7XG4gICAgICAgIGNvbnN0IHNlbGVjdG9ycyA9IFtcbiAgICAgICAgICAgICcuam9iLWRlc2NyaXB0aW9uJyxcbiAgICAgICAgICAgICcucG9zdGluZy1kZXNjcmlwdGlvbicsXG4gICAgICAgICAgICAnW2NsYXNzKj1cImpvYi1kZXNjcmlwdGlvblwiXScsXG4gICAgICAgICAgICAnW2NsYXNzKj1cInBvc3RpbmctZGVzY3JpcHRpb25cIl0nLFxuICAgICAgICAgICAgJ1tjbGFzcyo9XCJkZXNjcmlwdGlvblwiXScsXG4gICAgICAgICAgICAnYXJ0aWNsZScsXG4gICAgICAgICAgICAnLmNvbnRlbnQnLFxuICAgICAgICAgICAgJ21haW4nLFxuICAgICAgICBdO1xuICAgICAgICBmb3IgKGNvbnN0IHNlbGVjdG9yIG9mIHNlbGVjdG9ycykge1xuICAgICAgICAgICAgY29uc3QgaHRtbCA9IHRoaXMuZXh0cmFjdEh0bWxDb250ZW50KHNlbGVjdG9yKTtcbiAgICAgICAgICAgIGlmIChodG1sICYmIGh0bWwubGVuZ3RoID4gMTAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2xlYW5EZXNjcmlwdGlvbihodG1sKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZmluZExvY2F0aW9uKCkge1xuICAgICAgICBjb25zdCBzZWxlY3RvcnMgPSBbXG4gICAgICAgICAgICAnW2NsYXNzKj1cImxvY2F0aW9uXCJdJyxcbiAgICAgICAgICAgICdbY2xhc3MqPVwiYWRkcmVzc1wiXScsXG4gICAgICAgICAgICAnLmxvY2F0aW9uJyxcbiAgICAgICAgICAgICcuam9iLWxvY2F0aW9uJyxcbiAgICAgICAgXTtcbiAgICAgICAgZm9yIChjb25zdCBzZWxlY3RvciBvZiBzZWxlY3RvcnMpIHtcbiAgICAgICAgICAgIGNvbnN0IHRleHQgPSB0aGlzLmV4dHJhY3RUZXh0Q29udGVudChzZWxlY3Rvcik7XG4gICAgICAgICAgICBpZiAodGV4dCAmJiB0ZXh0Lmxlbmd0aCA+IDIgJiYgdGV4dC5sZW5ndGggPCAxMDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZGV0ZWN0U291cmNlKCkge1xuICAgICAgICBjb25zdCBob3N0bmFtZSA9IHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAvLyBSZW1vdmUgY29tbW9uIHByZWZpeGVzXG4gICAgICAgIGNvbnN0IGNsZWFuZWQgPSBob3N0bmFtZVxuICAgICAgICAgICAgLnJlcGxhY2UoL153d3dcXC4vLCAnJylcbiAgICAgICAgICAgIC5yZXBsYWNlKC9eam9ic1xcLi8sICcnKVxuICAgICAgICAgICAgLnJlcGxhY2UoL15jYXJlZXJzXFwuLywgJycpO1xuICAgICAgICAvLyBFeHRyYWN0IG1haW4gZG9tYWluXG4gICAgICAgIGNvbnN0IHBhcnRzID0gY2xlYW5lZC5zcGxpdCgnLicpO1xuICAgICAgICBpZiAocGFydHMubGVuZ3RoID49IDIpIHtcbiAgICAgICAgICAgIHJldHVybiBwYXJ0c1twYXJ0cy5sZW5ndGggLSAyXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2xlYW5lZDtcbiAgICB9XG59XG4iLCIvLyBTY3JhcGVyIHJlZ2lzdHJ5IC0gbWFwcyBVUkxzIHRvIGFwcHJvcHJpYXRlIHNjcmFwZXJzXG5pbXBvcnQgeyBMaW5rZWRJblNjcmFwZXIgfSBmcm9tICcuL2xpbmtlZGluLXNjcmFwZXInO1xuaW1wb3J0IHsgV2F0ZXJsb29Xb3Jrc1NjcmFwZXIgfSBmcm9tICcuL3dhdGVybG9vLXdvcmtzLXNjcmFwZXInO1xuaW1wb3J0IHsgSW5kZWVkU2NyYXBlciB9IGZyb20gJy4vaW5kZWVkLXNjcmFwZXInO1xuaW1wb3J0IHsgR3JlZW5ob3VzZVNjcmFwZXIgfSBmcm9tICcuL2dyZWVuaG91c2Utc2NyYXBlcic7XG5pbXBvcnQgeyBMZXZlclNjcmFwZXIgfSBmcm9tICcuL2xldmVyLXNjcmFwZXInO1xuaW1wb3J0IHsgR2VuZXJpY1NjcmFwZXIgfSBmcm9tICcuL2dlbmVyaWMtc2NyYXBlcic7XG4vLyBJbml0aWFsaXplIGFsbCBzY3JhcGVyc1xuY29uc3Qgc2NyYXBlcnMgPSBbXG4gICAgbmV3IExpbmtlZEluU2NyYXBlcigpLFxuICAgIG5ldyBXYXRlcmxvb1dvcmtzU2NyYXBlcigpLFxuICAgIG5ldyBJbmRlZWRTY3JhcGVyKCksXG4gICAgbmV3IEdyZWVuaG91c2VTY3JhcGVyKCksXG4gICAgbmV3IExldmVyU2NyYXBlcigpLFxuXTtcbmNvbnN0IGdlbmVyaWNTY3JhcGVyID0gbmV3IEdlbmVyaWNTY3JhcGVyKCk7XG4vKipcbiAqIEdldCB0aGUgYXBwcm9wcmlhdGUgc2NyYXBlciBmb3IgYSBVUkxcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFNjcmFwZXJGb3JVcmwodXJsKSB7XG4gICAgY29uc3Qgc2NyYXBlciA9IHNjcmFwZXJzLmZpbmQoKHMpID0+IHMuY2FuSGFuZGxlKHVybCkpO1xuICAgIHJldHVybiBzY3JhcGVyIHx8IGdlbmVyaWNTY3JhcGVyO1xufVxuLyoqXG4gKiBDaGVjayBpZiB3ZSBoYXZlIGEgc3BlY2lhbGl6ZWQgc2NyYXBlciBmb3IgdGhpcyBVUkxcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhhc1NwZWNpYWxpemVkU2NyYXBlcih1cmwpIHtcbiAgICByZXR1cm4gc2NyYXBlcnMuc29tZSgocykgPT4gcy5jYW5IYW5kbGUodXJsKSk7XG59XG4vKipcbiAqIEdldCBhbGwgYXZhaWxhYmxlIHNjcmFwZXIgc291cmNlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXZhaWxhYmxlU291cmNlcygpIHtcbiAgICByZXR1cm4gc2NyYXBlcnMubWFwKChzKSA9PiBzLnNvdXJjZSk7XG59XG4iLCIvLyBNZXNzYWdlIHBhc3NpbmcgdXRpbGl0aWVzIGZvciBleHRlbnNpb24gY29tbXVuaWNhdGlvblxuLy8gVHlwZS1zYWZlIG1lc3NhZ2UgY3JlYXRvcnNcbmV4cG9ydCBjb25zdCBNZXNzYWdlcyA9IHtcbiAgICAvLyBBdXRoIG1lc3NhZ2VzXG4gICAgZ2V0QXV0aFN0YXR1czogKCkgPT4gKHsgdHlwZTogJ0dFVF9BVVRIX1NUQVRVUycgfSksXG4gICAgb3BlbkF1dGg6ICgpID0+ICh7IHR5cGU6ICdPUEVOX0FVVEgnIH0pLFxuICAgIGxvZ291dDogKCkgPT4gKHsgdHlwZTogJ0xPR09VVCcgfSksXG4gICAgLy8gUHJvZmlsZSBtZXNzYWdlc1xuICAgIGdldFByb2ZpbGU6ICgpID0+ICh7IHR5cGU6ICdHRVRfUFJPRklMRScgfSksXG4gICAgLy8gRm9ybSBmaWxsaW5nIG1lc3NhZ2VzXG4gICAgZmlsbEZvcm06IChmaWVsZHMpID0+ICh7XG4gICAgICAgIHR5cGU6ICdGSUxMX0ZPUk0nLFxuICAgICAgICBwYXlsb2FkOiBmaWVsZHMsXG4gICAgfSksXG4gICAgLy8gU2NyYXBpbmcgbWVzc2FnZXNcbiAgICBzY3JhcGVKb2I6ICgpID0+ICh7IHR5cGU6ICdTQ1JBUEVfSk9CJyB9KSxcbiAgICBzY3JhcGVKb2JMaXN0OiAoKSA9PiAoeyB0eXBlOiAnU0NSQVBFX0pPQl9MSVNUJyB9KSxcbiAgICBpbXBvcnRKb2I6IChqb2IpID0+ICh7XG4gICAgICAgIHR5cGU6ICdJTVBPUlRfSk9CJyxcbiAgICAgICAgcGF5bG9hZDogam9iLFxuICAgIH0pLFxuICAgIGltcG9ydEpvYnNCYXRjaDogKGpvYnMpID0+ICh7XG4gICAgICAgIHR5cGU6ICdJTVBPUlRfSk9CU19CQVRDSCcsXG4gICAgICAgIHBheWxvYWQ6IGpvYnMsXG4gICAgfSksXG4gICAgLy8gTGVhcm5pbmcgbWVzc2FnZXNcbiAgICBzYXZlQW5zd2VyOiAoZGF0YSkgPT4gKHtcbiAgICAgICAgdHlwZTogJ1NBVkVfQU5TV0VSJyxcbiAgICAgICAgcGF5bG9hZDogZGF0YSxcbiAgICB9KSxcbiAgICBzZWFyY2hBbnN3ZXJzOiAocXVlc3Rpb24pID0+ICh7XG4gICAgICAgIHR5cGU6ICdTRUFSQ0hfQU5TV0VSUycsXG4gICAgICAgIHBheWxvYWQ6IHF1ZXN0aW9uLFxuICAgIH0pLFxuICAgIGpvYkRldGVjdGVkOiAobWV0YSkgPT4gKHtcbiAgICAgICAgdHlwZTogJ0pPQl9ERVRFQ1RFRCcsXG4gICAgICAgIHBheWxvYWQ6IG1ldGEsXG4gICAgfSksXG59O1xuLy8gU2VuZCBtZXNzYWdlIHRvIGJhY2tncm91bmQgc2NyaXB0XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2VuZE1lc3NhZ2UobWVzc2FnZSkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZShtZXNzYWdlLCAocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgIGlmIChjaHJvbWUucnVudGltZS5sYXN0RXJyb3IpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBjaHJvbWUucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzcG9uc2UgfHwgeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdObyByZXNwb25zZSByZWNlaXZlZCcgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuLy8gU2VuZCBtZXNzYWdlIHRvIGNvbnRlbnQgc2NyaXB0IGluIHNwZWNpZmljIHRhYlxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNlbmRUb1RhYih0YWJJZCwgbWVzc2FnZSkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWJJZCwgbWVzc2FnZSwgKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICBpZiAoY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2UgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlIHx8IHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnTm8gcmVzcG9uc2UgcmVjZWl2ZWQnIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcbn1cbi8vIFNlbmQgbWVzc2FnZSB0byBhbGwgY29udGVudCBzY3JpcHRzXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYnJvYWRjYXN0TWVzc2FnZShtZXNzYWdlKSB7XG4gICAgY29uc3QgdGFicyA9IGF3YWl0IGNocm9tZS50YWJzLnF1ZXJ5KHt9KTtcbiAgICBmb3IgKGNvbnN0IHRhYiBvZiB0YWJzKSB7XG4gICAgICAgIGlmICh0YWIuaWQpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UodGFiLmlkLCBtZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIHtcbiAgICAgICAgICAgICAgICAvLyBUYWIgbWlnaHQgbm90IGhhdmUgY29udGVudCBzY3JpcHQgbG9hZGVkXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLyBDb250ZW50IHNjcmlwdCBlbnRyeSBwb2ludCBmb3IgQ29sdW1idXMgZXh0ZW5zaW9uXG4vLyBJbXBvcnQgc3R5bGVzIGZvciBjb250ZW50IHNjcmlwdFxuaW1wb3J0ICcuL3VpL3N0eWxlcy5jc3MnO1xuaW1wb3J0IHsgRmllbGREZXRlY3RvciB9IGZyb20gJy4vYXV0by1maWxsL2ZpZWxkLWRldGVjdG9yJztcbmltcG9ydCB7IEZpZWxkTWFwcGVyIH0gZnJvbSAnLi9hdXRvLWZpbGwvZmllbGQtbWFwcGVyJztcbmltcG9ydCB7IEF1dG9GaWxsRW5naW5lIH0gZnJvbSAnLi9hdXRvLWZpbGwvZW5naW5lJztcbmltcG9ydCB7IGdldFNjcmFwZXJGb3JVcmwgfSBmcm9tICcuL3NjcmFwZXJzL3NjcmFwZXItcmVnaXN0cnknO1xuaW1wb3J0IHsgc2VuZE1lc3NhZ2UsIE1lc3NhZ2VzIH0gZnJvbSAnQC9zaGFyZWQvbWVzc2FnZXMnO1xuLy8gSW5pdGlhbGl6ZSBjb21wb25lbnRzXG5jb25zdCBmaWVsZERldGVjdG9yID0gbmV3IEZpZWxkRGV0ZWN0b3IoKTtcbmxldCBhdXRvRmlsbEVuZ2luZSA9IG51bGw7XG5sZXQgY2FjaGVkUHJvZmlsZSA9IG51bGw7XG5sZXQgZGV0ZWN0ZWRGaWVsZHMgPSBbXTtcbmxldCBzY3JhcGVkSm9iID0gbnVsbDtcbmxldCBqb2JEZXRlY3RlZEZvclVybCA9IG51bGw7XG4vLyBTY2FuIHBhZ2Ugb24gbG9hZFxuc2NhblBhZ2UoKTtcbi8vIFJlLXNjYW4gb24gZHluYW1pYyBjb250ZW50IGNoYW5nZXNcbmNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoZGVib3VuY2Uoc2NhblBhZ2UsIDUwMCkpO1xub2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7IGNoaWxkTGlzdDogdHJ1ZSwgc3VidHJlZTogdHJ1ZSB9KTtcbmFzeW5jIGZ1bmN0aW9uIHNjYW5QYWdlKCkge1xuICAgIC8vIERldGVjdCBmb3Jtc1xuICAgIGNvbnN0IGZvcm1zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnZm9ybScpO1xuICAgIGZvciAoY29uc3QgZm9ybSBvZiBmb3Jtcykge1xuICAgICAgICBjb25zdCBmaWVsZHMgPSBmaWVsZERldGVjdG9yLmRldGVjdEZpZWxkcyhmb3JtKTtcbiAgICAgICAgaWYgKGZpZWxkcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBkZXRlY3RlZEZpZWxkcyA9IGZpZWxkcztcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbQ29sdW1idXNdIERldGVjdGVkIGZpZWxkczonLCBmaWVsZHMubGVuZ3RoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBDaGVjayBmb3Igam9iIGxpc3RpbmdcbiAgICBjb25zdCBzY3JhcGVyID0gZ2V0U2NyYXBlckZvclVybCh3aW5kb3cubG9jYXRpb24uaHJlZik7XG4gICAgaWYgKHNjcmFwZXIuY2FuSGFuZGxlKHdpbmRvdy5sb2NhdGlvbi5ocmVmKSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgc2NyYXBlZEpvYiA9IGF3YWl0IHNjcmFwZXIuc2NyYXBlSm9iTGlzdGluZygpO1xuICAgICAgICAgICAgaWYgKHNjcmFwZWRKb2IpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW0NvbHVtYnVzXSBTY3JhcGVkIGpvYjonLCBzY3JhcGVkSm9iLnRpdGxlKTtcbiAgICAgICAgICAgICAgICBpZiAoam9iRGV0ZWN0ZWRGb3JVcmwgIT09IHdpbmRvdy5sb2NhdGlvbi5ocmVmKSB7XG4gICAgICAgICAgICAgICAgICAgIGpvYkRldGVjdGVkRm9yVXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWY7XG4gICAgICAgICAgICAgICAgICAgIHNlbmRNZXNzYWdlKE1lc3NhZ2VzLmpvYkRldGVjdGVkKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBzY3JhcGVkSm9iLnRpdGxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGFueTogc2NyYXBlZEpvYi5jb21wYW55LFxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBzY3JhcGVkSm9iLnVybCxcbiAgICAgICAgICAgICAgICAgICAgfSkpLmNhdGNoKChlcnIpID0+IGNvbnNvbGUuZXJyb3IoJ1tDb2x1bWJ1c10gRmFpbGVkIHRvIG5vdGlmeSBqb2IgZGV0ZWN0ZWQ6JywgZXJyKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tDb2x1bWJ1c10gU2NyYXBlIGVycm9yOicsIGVycik7XG4gICAgICAgIH1cbiAgICB9XG59XG4vLyBIYW5kbGUgbWVzc2FnZXMgZnJvbSBwb3B1cCBhbmQgYmFja2dyb3VuZFxuY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChtZXNzYWdlLCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xuICAgIGhhbmRsZU1lc3NhZ2UobWVzc2FnZSlcbiAgICAgICAgLnRoZW4oc2VuZFJlc3BvbnNlKVxuICAgICAgICAuY2F0Y2goKGVycikgPT4gc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnIubWVzc2FnZSB9KSk7XG4gICAgcmV0dXJuIHRydWU7IC8vIEFzeW5jIHJlc3BvbnNlXG59KTtcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZU1lc3NhZ2UobWVzc2FnZSkge1xuICAgIHN3aXRjaCAobWVzc2FnZS50eXBlKSB7XG4gICAgICAgIGNhc2UgJ0dFVF9QQUdFX1NUQVRVUyc6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGhhc0Zvcm06IGRldGVjdGVkRmllbGRzLmxlbmd0aCA+IDAsXG4gICAgICAgICAgICAgICAgaGFzSm9iTGlzdGluZzogc2NyYXBlZEpvYiAhPT0gbnVsbCxcbiAgICAgICAgICAgICAgICBkZXRlY3RlZEZpZWxkczogZGV0ZWN0ZWRGaWVsZHMubGVuZ3RoLFxuICAgICAgICAgICAgICAgIHNjcmFwZWRKb2IsXG4gICAgICAgICAgICB9O1xuICAgICAgICBjYXNlICdUUklHR0VSX0ZJTEwnOlxuICAgICAgICAgICAgcmV0dXJuIGhhbmRsZUZpbGxGb3JtKCk7XG4gICAgICAgIGNhc2UgJ1RSSUdHRVJfSU1QT1JUJzpcbiAgICAgICAgICAgIGlmIChzY3JhcGVkSm9iKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbmRNZXNzYWdlKE1lc3NhZ2VzLmltcG9ydEpvYihzY3JhcGVkSm9iKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdObyBqb2IgZGV0ZWN0ZWQnIH07XG4gICAgICAgIGNhc2UgJ1NDUkFQRV9KT0InOlxuICAgICAgICAgICAgY29uc3Qgc2NyYXBlciA9IGdldFNjcmFwZXJGb3JVcmwod2luZG93LmxvY2F0aW9uLmhyZWYpO1xuICAgICAgICAgICAgaWYgKHNjcmFwZXIuY2FuSGFuZGxlKHdpbmRvdy5sb2NhdGlvbi5ocmVmKSkge1xuICAgICAgICAgICAgICAgIHNjcmFwZWRKb2IgPSBhd2FpdCBzY3JhcGVyLnNjcmFwZUpvYkxpc3RpbmcoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiBzY3JhcGVkSm9iIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdObyBzY3JhcGVyIGF2YWlsYWJsZSBmb3IgdGhpcyBzaXRlJyB9O1xuICAgICAgICBjYXNlICdTQ1JBUEVfSk9CX0xJU1QnOlxuICAgICAgICAgICAgY29uc3QgbGlzdFNjcmFwZXIgPSBnZXRTY3JhcGVyRm9yVXJsKHdpbmRvdy5sb2NhdGlvbi5ocmVmKTtcbiAgICAgICAgICAgIGlmIChsaXN0U2NyYXBlci5jYW5IYW5kbGUod2luZG93LmxvY2F0aW9uLmhyZWYpKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgam9icyA9IGF3YWl0IGxpc3RTY3JhcGVyLnNjcmFwZUpvYkxpc3QoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiBqb2JzIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdObyBzY3JhcGVyIGF2YWlsYWJsZSBmb3IgdGhpcyBzaXRlJyB9O1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgVW5rbm93biBtZXNzYWdlIHR5cGU6ICR7bWVzc2FnZS50eXBlfWAgfTtcbiAgICB9XG59XG5hc3luYyBmdW5jdGlvbiBoYW5kbGVGaWxsRm9ybSgpIHtcbiAgICBpZiAoZGV0ZWN0ZWRGaWVsZHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ05vIGZpZWxkcyBkZXRlY3RlZCcgfTtcbiAgICB9XG4gICAgLy8gR2V0IHByb2ZpbGUgaWYgbm90IGNhY2hlZFxuICAgIGlmICghY2FjaGVkUHJvZmlsZSkge1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHNlbmRNZXNzYWdlKE1lc3NhZ2VzLmdldFByb2ZpbGUoKSk7XG4gICAgICAgIGlmICghcmVzcG9uc2Uuc3VjY2VzcyB8fCAhcmVzcG9uc2UuZGF0YSkge1xuICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnRmFpbGVkIHRvIGxvYWQgcHJvZmlsZScgfTtcbiAgICAgICAgfVxuICAgICAgICBjYWNoZWRQcm9maWxlID0gcmVzcG9uc2UuZGF0YTtcbiAgICB9XG4gICAgLy8gQ3JlYXRlIG1hcHBlciBhbmQgZW5naW5lXG4gICAgY29uc3QgbWFwcGVyID0gbmV3IEZpZWxkTWFwcGVyKGNhY2hlZFByb2ZpbGUpO1xuICAgIGF1dG9GaWxsRW5naW5lID0gbmV3IEF1dG9GaWxsRW5naW5lKGZpZWxkRGV0ZWN0b3IsIG1hcHBlcik7XG4gICAgLy8gRmlsbCB0aGUgZm9ybVxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGF1dG9GaWxsRW5naW5lLmZpbGxGb3JtKGRldGVjdGVkRmllbGRzKTtcbiAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiByZXN1bHQgfTtcbn1cbi8vIFV0aWxpdHk6IGRlYm91bmNlIGZ1bmN0aW9uXG5mdW5jdGlvbiBkZWJvdW5jZShmbiwgZGVsYXkpIHtcbiAgICBsZXQgdGltZW91dElkO1xuICAgIHJldHVybiAoLi4uYXJncykgPT4ge1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICAgICAgdGltZW91dElkID0gc2V0VGltZW91dCgoKSA9PiBmbiguLi5hcmdzKSwgZGVsYXkpO1xuICAgIH07XG59XG5jb25zb2xlLmxvZygnW0NvbHVtYnVzXSBDb250ZW50IHNjcmlwdCBsb2FkZWQnKTtcbiJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=