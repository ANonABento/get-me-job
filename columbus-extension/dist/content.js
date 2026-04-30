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

;// ./src/shared/types.ts
// Shared types for Columbus extension
const DEFAULT_SETTINGS = {
    autoFillEnabled: true,
    showConfidenceIndicators: true,
    minimumConfidence: 0.5,
    learnFromAnswers: true,
    autoDetectPrompts: true,
    notifyOnJobDetected: true,
    showSalaryOverlay: true,
    enableJobScraping: true,
    enabledScraperSources: ['linkedin', 'indeed', 'greenhouse', 'lever', 'waterlooworks', 'unknown'],
};
const DEFAULT_API_BASE_URL = 'http://localhost:3000';

;// ./src/background/storage.ts
// Extension storage utilities

const STORAGE_KEY = 'columbus_extension';
function mergeSettingsWithDefaults(settings) {
    return {
        ...DEFAULT_SETTINGS,
        ...settings,
    };
}
async function getStorage() {
    return new Promise((resolve) => {
        chrome.storage.local.get(STORAGE_KEY, (result) => {
            const stored = result[STORAGE_KEY];
            resolve({
                apiBaseUrl: DEFAULT_API_BASE_URL,
                ...stored,
                settings: mergeSettingsWithDefaults(stored?.settings),
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
async function setAuthToken(token, expiresAt) {
    await setStorage({
        authToken: token,
        tokenExpiry: expiresAt,
    });
}
async function clearAuthToken() {
    await setStorage({
        authToken: undefined,
        tokenExpiry: undefined,
        cachedProfile: undefined,
        profileCachedAt: undefined,
    });
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
const PROFILE_CACHE_TTL = (/* unused pure expression or super */ null && (5 * 60 * 1000)); // 5 minutes
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
    const updated = mergeSettingsWithDefaults({ ...storage.settings, ...updates });
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

;// ./src/content/index.ts
// Content script entry point for Columbus extension
// Import styles for content script







// Initialize components
const fieldDetector = new FieldDetector();
let autoFillEngine = null;
let cachedProfile = null;
let detectedFields = [];
let scrapedJob = null;
// Scan page on load
scanPage();
// Re-scan on dynamic content changes
const observer = new MutationObserver(debounce(scanPage, 500));
observer.observe(document.body, { childList: true, subtree: true });
async function scanPage() {
    const settings = await getSettings();
    // Detect forms
    if (settings.autoFillEnabled) {
        const forms = document.querySelectorAll('form');
        for (const form of forms) {
            const fields = fieldDetector
                .detectFields(form)
                .filter((field) => field.confidence >= settings.minimumConfidence)
                .filter((field) => settings.autoDetectPrompts || field.fieldType !== 'customQuestion');
            if (fields.length > 0) {
                detectedFields = fields;
                console.log('[Columbus] Detected fields:', fields.length);
            }
        }
    }
    else {
        detectedFields = [];
    }
    // Check for job listing
    const scraper = getScraperForUrl(window.location.href);
    if (settings.enableJobScraping &&
        settings.enabledScraperSources.includes(scraper.source) &&
        scraper.canHandle(window.location.href)) {
        try {
            scrapedJob = await scraper.scrapeJobListing();
            if (scrapedJob) {
                console.log('[Columbus] Scraped job:', scrapedJob.title);
                syncSalaryOverlay(scrapedJob, settings.showSalaryOverlay);
            }
        }
        catch (err) {
            console.error('[Columbus] Scrape error:', err);
        }
    }
    else {
        scrapedJob = null;
        syncSalaryOverlay(null, false);
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
    const settings = await getSettings();
    if (!settings.autoFillEnabled) {
        return { success: false, error: 'Auto-fill is disabled' };
    }
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
function syncSalaryOverlay(job, enabled) {
    const existing = document.getElementById('columbus-salary-overlay');
    if (!enabled || !job?.salary) {
        existing?.remove();
        return;
    }
    const overlay = existing || document.createElement('div');
    overlay.id = 'columbus-salary-overlay';
    overlay.textContent = `Salary: ${job.salary}`;
    overlay.setAttribute('role', 'status');
    overlay.style.cssText = `
    position: fixed;
    right: 20px;
    bottom: 20px;
    z-index: 999999;
    padding: 10px 14px;
    border-radius: 8px;
    background: linear-gradient(135deg, #14b8a6, #0ea5e9);
    color: white;
    font: 500 13px -apple-system, BlinkMacSystemFont, sans-serif;
    box-shadow: 0 4px 16px rgba(0,0,0,0.16);
  `;
    if (!existing) {
        document.body.appendChild(overlay);
    }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudC5qcyIsIm1hcHBpbmdzIjoiOzs7O0FBQUE7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3JRQTtBQUNxRjtBQUM5RTtBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxjQUFjO0FBQzdCO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwrREFBK0QsV0FBVztBQUMxRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLGVBQWUsRUFBRSxxQkFBcUIsRUFBRSxtQkFBbUI7QUFDbkYsZUFBZSwwQkFBMEI7QUFDekM7QUFDQTs7O0FDbk1BO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0IsWUFBWSxLQUFLLFdBQVcsT0FBTyxnQkFBZ0I7QUFDckU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCLGVBQWU7QUFDcEMscUJBQXFCLGVBQWUsSUFBSSxZQUFZO0FBQ3BELHNCQUFzQixXQUFXLEtBQUssYUFBYSxHQUFHLE9BQU87QUFDN0QsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3RJQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhFQUE4RSxLQUFLO0FBQ25GO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0RBQStELFNBQVM7QUFDeEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1EQUFtRCxlQUFlO0FBQ2xFLG1EQUFtRCxlQUFlO0FBQ2xFLG9EQUFvRCxlQUFlO0FBQ25FLGtEQUFrRCxlQUFlO0FBQ2pFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1REFBdUQsZUFBZTtBQUN0RTtBQUNBO0FBQ0E7OztBQ3RMQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLDhDQUE4QyxnQ0FBZ0M7QUFDOUU7QUFDQTtBQUNBLDRDQUE0QyxVQUFVLGtCQUFrQixRQUFRO0FBQ2hGLGFBQWE7QUFDYixTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBNEI7QUFDNUIsMkJBQTJCO0FBQzNCLDBCQUEwQjtBQUMxQiwwQkFBMEI7QUFDMUIseUJBQXlCLEdBQUc7QUFDNUI7QUFDQTtBQUNBOzs7QUM3SEE7QUFDNkM7QUFDdEMsOEJBQThCLFdBQVc7QUFDaEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtGQUFrRiw0Q0FBNEM7QUFDOUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQkFBMEIscUNBQXFDLEdBQUcscUNBQXFDO0FBQ3ZHO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDcktBO0FBQzZDO0FBQ3RDLG1DQUFtQyxXQUFXO0FBQ3JEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDblNBO0FBQzZDO0FBQ3RDLDRCQUE0QixXQUFXO0FBQzlDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnRkFBZ0YsNENBQTRDO0FBQzVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtRUFBbUUsT0FBTztBQUMxRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMEJBQTBCLHdDQUF3QyxHQUFHLHlDQUF5QyxFQUFFLHdDQUF3QztBQUN4SjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3ROQTtBQUM2QztBQUN0QyxnQ0FBZ0MsV0FBVztBQUNsRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9GQUFvRiw0Q0FBNEM7QUFDaEk7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhCQUE4Qix3Q0FBd0MsR0FBRyx3Q0FBd0M7QUFDakg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN4TkE7QUFDNkM7QUFDdEMsMkJBQTJCLFdBQVc7QUFDN0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0VBQStFLDRDQUE0QztBQUMzSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4QkFBOEIsd0NBQXdDLEdBQUcsd0NBQXdDO0FBQ2pIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ25PQTtBQUM2QztBQUN0Qyw2QkFBNkIsV0FBVztBQUMvQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdDQUFnQyxVQUFVLEVBQUUsc0JBQXNCLElBQUkscUJBQXFCO0FBQzNGO0FBQ0E7QUFDQSxnQ0FBZ0MsVUFBVSxFQUFFLHVCQUF1QjtBQUNuRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDclBBO0FBQ3FEO0FBQ1c7QUFDZjtBQUNRO0FBQ1Y7QUFDSTtBQUNuRDtBQUNBO0FBQ0EsUUFBUSxlQUFlO0FBQ3ZCLFFBQVEsb0JBQW9CO0FBQzVCLFFBQVEsYUFBYTtBQUNyQixRQUFRLGlCQUFpQjtBQUN6QixRQUFRLFlBQVk7QUFDcEI7QUFDQSwyQkFBMkIsY0FBYztBQUN6QztBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTs7O0FDbENBO0FBQ0E7QUFDTztBQUNQO0FBQ0EsNEJBQTRCLHlCQUF5QjtBQUNyRCx1QkFBdUIsbUJBQW1CO0FBQzFDLHFCQUFxQixnQkFBZ0I7QUFDckM7QUFDQSx5QkFBeUIscUJBQXFCO0FBQzlDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0Esd0JBQXdCLG9CQUFvQjtBQUM1Qyw0QkFBNEIseUJBQXlCO0FBQ3JEO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBLDBCQUEwQix5REFBeUQ7QUFDbkY7QUFDQTtBQUNBLHNDQUFzQywrQ0FBK0M7QUFDckY7QUFDQSxTQUFTO0FBQ1QsS0FBSztBQUNMO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBLDBCQUEwQix5REFBeUQ7QUFDbkY7QUFDQTtBQUNBLHNDQUFzQywrQ0FBK0M7QUFDckY7QUFDQSxTQUFTO0FBQ1QsS0FBSztBQUNMO0FBQ0E7QUFDTztBQUNQLDJDQUEyQztBQUMzQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUMxRUE7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087OztBQ1pQO0FBQ3dFO0FBQ3hFO0FBQ087QUFDUDtBQUNBLFdBQVcsZ0JBQWdCO0FBQzNCO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBNEIsb0JBQW9CO0FBQ2hEO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNULEtBQUs7QUFDTDtBQUNPO0FBQ1A7QUFDQSxzQkFBc0I7QUFDdEI7QUFDQSxtQ0FBbUMsd0JBQXdCO0FBQzNELEtBQUs7QUFDTDtBQUNPO0FBQ1A7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQkFBMEIsNkRBQWEsSUFBRTtBQUNsQztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQSxnREFBZ0QsaUNBQWlDO0FBQ2pGLHVCQUF1QixtQkFBbUI7QUFDMUM7QUFDQTtBQUNBO0FBQ087QUFDUCx1QkFBdUIsaUJBQWlCO0FBQ3hDO0FBQ087QUFDUDtBQUNBO0FBQ0E7OztBQ3pHQTtBQUNBO0FBQ3lCO0FBQ2tDO0FBQ0o7QUFDSDtBQUNXO0FBQ0w7QUFDUDtBQUNuRDtBQUNBLDBCQUEwQixhQUFhO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQ0FBa0MsZ0NBQWdDO0FBQ2xFO0FBQ0EsMkJBQTJCLFdBQVc7QUFDdEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLGdCQUFnQjtBQUNwQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUNBQXVDLG9DQUFvQztBQUMzRSxpQkFBaUI7QUFDakIsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLFdBQVcsQ0FBQyxRQUFRO0FBQzNDO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0EsNEJBQTRCLGdCQUFnQjtBQUM1QztBQUNBO0FBQ0EseUJBQXlCO0FBQ3pCO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0EsZ0NBQWdDLGdCQUFnQjtBQUNoRDtBQUNBO0FBQ0EseUJBQXlCO0FBQ3pCO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0EscUJBQXFCLGdEQUFnRCxhQUFhO0FBQ2xGO0FBQ0E7QUFDQTtBQUNBLDJCQUEyQixXQUFXO0FBQ3RDO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0EsK0JBQStCLFdBQVcsQ0FBQyxRQUFRO0FBQ25EO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLFdBQVc7QUFDbEMseUJBQXlCLGNBQWM7QUFDdkM7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQ0FBcUMsV0FBVztBQUNoRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vY29sdW1idXMtZXh0ZW5zaW9uLy4vc3JjL3NoYXJlZC9maWVsZC1wYXR0ZXJucy50cyIsIndlYnBhY2s6Ly9jb2x1bWJ1cy1leHRlbnNpb24vLi9zcmMvY29udGVudC9hdXRvLWZpbGwvZmllbGQtZGV0ZWN0b3IudHMiLCJ3ZWJwYWNrOi8vY29sdW1idXMtZXh0ZW5zaW9uLy4vc3JjL2NvbnRlbnQvYXV0by1maWxsL2ZpZWxkLW1hcHBlci50cyIsIndlYnBhY2s6Ly9jb2x1bWJ1cy1leHRlbnNpb24vLi9zcmMvY29udGVudC9hdXRvLWZpbGwvZW5naW5lLnRzIiwid2VicGFjazovL2NvbHVtYnVzLWV4dGVuc2lvbi8uL3NyYy9jb250ZW50L3NjcmFwZXJzL2Jhc2Utc2NyYXBlci50cyIsIndlYnBhY2s6Ly9jb2x1bWJ1cy1leHRlbnNpb24vLi9zcmMvY29udGVudC9zY3JhcGVycy9saW5rZWRpbi1zY3JhcGVyLnRzIiwid2VicGFjazovL2NvbHVtYnVzLWV4dGVuc2lvbi8uL3NyYy9jb250ZW50L3NjcmFwZXJzL3dhdGVybG9vLXdvcmtzLXNjcmFwZXIudHMiLCJ3ZWJwYWNrOi8vY29sdW1idXMtZXh0ZW5zaW9uLy4vc3JjL2NvbnRlbnQvc2NyYXBlcnMvaW5kZWVkLXNjcmFwZXIudHMiLCJ3ZWJwYWNrOi8vY29sdW1idXMtZXh0ZW5zaW9uLy4vc3JjL2NvbnRlbnQvc2NyYXBlcnMvZ3JlZW5ob3VzZS1zY3JhcGVyLnRzIiwid2VicGFjazovL2NvbHVtYnVzLWV4dGVuc2lvbi8uL3NyYy9jb250ZW50L3NjcmFwZXJzL2xldmVyLXNjcmFwZXIudHMiLCJ3ZWJwYWNrOi8vY29sdW1idXMtZXh0ZW5zaW9uLy4vc3JjL2NvbnRlbnQvc2NyYXBlcnMvZ2VuZXJpYy1zY3JhcGVyLnRzIiwid2VicGFjazovL2NvbHVtYnVzLWV4dGVuc2lvbi8uL3NyYy9jb250ZW50L3NjcmFwZXJzL3NjcmFwZXItcmVnaXN0cnkudHMiLCJ3ZWJwYWNrOi8vY29sdW1idXMtZXh0ZW5zaW9uLy4vc3JjL3NoYXJlZC9tZXNzYWdlcy50cyIsIndlYnBhY2s6Ly9jb2x1bWJ1cy1leHRlbnNpb24vLi9zcmMvc2hhcmVkL3R5cGVzLnRzIiwid2VicGFjazovL2NvbHVtYnVzLWV4dGVuc2lvbi8uL3NyYy9iYWNrZ3JvdW5kL3N0b3JhZ2UudHMiLCJ3ZWJwYWNrOi8vY29sdW1idXMtZXh0ZW5zaW9uLy4vc3JjL2NvbnRlbnQvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gRmllbGQgZGV0ZWN0aW9uIHBhdHRlcm5zIGZvciBhdXRvLWZpbGxcbmV4cG9ydCBjb25zdCBGSUVMRF9QQVRURVJOUyA9IFtcbiAgICAvLyBOYW1lIGZpZWxkc1xuICAgIHtcbiAgICAgICAgdHlwZTogJ2ZpcnN0TmFtZScsXG4gICAgICAgIGF1dG9jb21wbGV0ZVZhbHVlczogWydnaXZlbi1uYW1lJywgJ2ZpcnN0LW5hbWUnXSxcbiAgICAgICAgbmFtZVBhdHRlcm5zOiBbL2ZpcnN0Lj9uYW1lL2ksIC9mbmFtZS9pLCAvZ2l2ZW4uP25hbWUvaSwgL2ZvcmVuYW1lL2ldLFxuICAgICAgICBpZFBhdHRlcm5zOiBbL2ZpcnN0Lj9uYW1lL2ksIC9mbmFtZS9pXSxcbiAgICAgICAgbGFiZWxQYXR0ZXJuczogWy9maXJzdFxccypuYW1lL2ksIC9naXZlblxccypuYW1lL2ksIC9mb3JlbmFtZS9pXSxcbiAgICAgICAgcGxhY2Vob2xkZXJQYXR0ZXJuczogWy9maXJzdFxccypuYW1lL2ldLFxuICAgICAgICBuZWdhdGl2ZVBhdHRlcm5zOiBbL2xhc3QvaSwgL2NvbXBhbnkvaSwgL21pZGRsZS9pLCAvYnVzaW5lc3MvaV0sXG4gICAgfSxcbiAgICB7XG4gICAgICAgIHR5cGU6ICdsYXN0TmFtZScsXG4gICAgICAgIGF1dG9jb21wbGV0ZVZhbHVlczogWydmYW1pbHktbmFtZScsICdsYXN0LW5hbWUnXSxcbiAgICAgICAgbmFtZVBhdHRlcm5zOiBbL2xhc3QuP25hbWUvaSwgL2xuYW1lL2ksIC9zdXJuYW1lL2ksIC9mYW1pbHkuP25hbWUvaV0sXG4gICAgICAgIGlkUGF0dGVybnM6IFsvbGFzdC4/bmFtZS9pLCAvbG5hbWUvaSwgL3N1cm5hbWUvaV0sXG4gICAgICAgIGxhYmVsUGF0dGVybnM6IFsvbGFzdFxccypuYW1lL2ksIC9zdXJuYW1lL2ksIC9mYW1pbHlcXHMqbmFtZS9pXSxcbiAgICAgICAgbmVnYXRpdmVQYXR0ZXJuczogWy9maXJzdC9pLCAvY29tcGFueS9pLCAvYnVzaW5lc3MvaV0sXG4gICAgfSxcbiAgICB7XG4gICAgICAgIHR5cGU6ICdmdWxsTmFtZScsXG4gICAgICAgIGF1dG9jb21wbGV0ZVZhbHVlczogWyduYW1lJ10sXG4gICAgICAgIG5hbWVQYXR0ZXJuczogWy9ebmFtZSQvaSwgL2Z1bGwuP25hbWUvaSwgL3lvdXIuP25hbWUvaSwgL2NhbmRpZGF0ZS4/bmFtZS9pXSxcbiAgICAgICAgbGFiZWxQYXR0ZXJuczogWy9ebmFtZSQvaSwgL2Z1bGxcXHMqbmFtZS9pLCAveW91clxccypuYW1lL2ksIC9ebmFtZVxccypcXCovaV0sXG4gICAgICAgIG5lZ2F0aXZlUGF0dGVybnM6IFsvY29tcGFueS9pLCAvZmlyc3QvaSwgL2xhc3QvaSwgL3VzZXIvaSwgL2J1c2luZXNzL2ksIC9qb2IvaV0sXG4gICAgfSxcbiAgICAvLyBDb250YWN0IGZpZWxkc1xuICAgIHtcbiAgICAgICAgdHlwZTogJ2VtYWlsJyxcbiAgICAgICAgYXV0b2NvbXBsZXRlVmFsdWVzOiBbJ2VtYWlsJ10sXG4gICAgICAgIG5hbWVQYXR0ZXJuczogWy9lPy0/bWFpbC9pLCAvZW1haWwuP2FkZHJlc3MvaV0sXG4gICAgICAgIGlkUGF0dGVybnM6IFsvZT8tP21haWwvaV0sXG4gICAgICAgIGxhYmVsUGF0dGVybnM6IFsvZS0/bWFpbC9pLCAvZW1haWxcXHMqYWRkcmVzcy9pXSxcbiAgICAgICAgcGxhY2Vob2xkZXJQYXR0ZXJuczogWy9lLT9tYWlsL2ksIC9AL10sXG4gICAgfSxcbiAgICB7XG4gICAgICAgIHR5cGU6ICdwaG9uZScsXG4gICAgICAgIGF1dG9jb21wbGV0ZVZhbHVlczogWyd0ZWwnLCAndGVsLW5hdGlvbmFsJywgJ3RlbC1sb2NhbCddLFxuICAgICAgICBuYW1lUGF0dGVybnM6IFsvcGhvbmUvaSwgL21vYmlsZS9pLCAvY2VsbC9pLCAvdGVsKD86ZXBob25lKT8vaV0sXG4gICAgICAgIGxhYmVsUGF0dGVybnM6IFsvcGhvbmUvaSwgL21vYmlsZS9pLCAvY2VsbC9pLCAvdGVsZXBob25lL2ksIC9jb250YWN0XFxzKm51bWJlci9pXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgdHlwZTogJ2FkZHJlc3MnLFxuICAgICAgICBhdXRvY29tcGxldGVWYWx1ZXM6IFsnc3RyZWV0LWFkZHJlc3MnLCAnYWRkcmVzcy1saW5lMSddLFxuICAgICAgICBuYW1lUGF0dGVybnM6IFsvYWRkcmVzcy9pLCAvc3RyZWV0L2ldLFxuICAgICAgICBsYWJlbFBhdHRlcm5zOiBbL2FkZHJlc3MvaSwgL3N0cmVldC9pXSxcbiAgICAgICAgbmVnYXRpdmVQYXR0ZXJuczogWy9lbWFpbC9pLCAvd2ViL2ksIC91cmwvaV0sXG4gICAgfSxcbiAgICB7XG4gICAgICAgIHR5cGU6ICdjaXR5JyxcbiAgICAgICAgYXV0b2NvbXBsZXRlVmFsdWVzOiBbJ2FkZHJlc3MtbGV2ZWwyJ10sXG4gICAgICAgIG5hbWVQYXR0ZXJuczogWy9jaXR5L2ksIC90b3duL2ldLFxuICAgICAgICBsYWJlbFBhdHRlcm5zOiBbL2NpdHkvaSwgL3Rvd24vaV0sXG4gICAgfSxcbiAgICB7XG4gICAgICAgIHR5cGU6ICdzdGF0ZScsXG4gICAgICAgIGF1dG9jb21wbGV0ZVZhbHVlczogWydhZGRyZXNzLWxldmVsMSddLFxuICAgICAgICBuYW1lUGF0dGVybnM6IFsvc3RhdGUvaSwgL3Byb3ZpbmNlL2ksIC9yZWdpb24vaV0sXG4gICAgICAgIGxhYmVsUGF0dGVybnM6IFsvc3RhdGUvaSwgL3Byb3ZpbmNlL2ksIC9yZWdpb24vaV0sXG4gICAgfSxcbiAgICB7XG4gICAgICAgIHR5cGU6ICd6aXBDb2RlJyxcbiAgICAgICAgYXV0b2NvbXBsZXRlVmFsdWVzOiBbJ3Bvc3RhbC1jb2RlJ10sXG4gICAgICAgIG5hbWVQYXR0ZXJuczogWy96aXAvaSwgL3Bvc3RhbC9pLCAvcG9zdGNvZGUvaV0sXG4gICAgICAgIGxhYmVsUGF0dGVybnM6IFsvemlwL2ksIC9wb3N0YWwvaSwgL3Bvc3RcXHMqY29kZS9pXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgdHlwZTogJ2NvdW50cnknLFxuICAgICAgICBhdXRvY29tcGxldGVWYWx1ZXM6IFsnY291bnRyeScsICdjb3VudHJ5LW5hbWUnXSxcbiAgICAgICAgbmFtZVBhdHRlcm5zOiBbL2NvdW50cnkvaV0sXG4gICAgICAgIGxhYmVsUGF0dGVybnM6IFsvY291bnRyeS9pXSxcbiAgICB9LFxuICAgIC8vIFNvY2lhbC9Qcm9mZXNzaW9uYWwgbGlua3NcbiAgICB7XG4gICAgICAgIHR5cGU6ICdsaW5rZWRpbicsXG4gICAgICAgIG5hbWVQYXR0ZXJuczogWy9saW5rZWRpbi9pXSxcbiAgICAgICAgbGFiZWxQYXR0ZXJuczogWy9saW5rZWRpbi9pXSxcbiAgICAgICAgcGxhY2Vob2xkZXJQYXR0ZXJuczogWy9saW5rZWRpblxcLmNvbS9pLCAvbGlua2VkaW4vaV0sXG4gICAgfSxcbiAgICB7XG4gICAgICAgIHR5cGU6ICdnaXRodWInLFxuICAgICAgICBuYW1lUGF0dGVybnM6IFsvZ2l0aHViL2ldLFxuICAgICAgICBsYWJlbFBhdHRlcm5zOiBbL2dpdGh1Yi9pXSxcbiAgICAgICAgcGxhY2Vob2xkZXJQYXR0ZXJuczogWy9naXRodWJcXC5jb20vaSwgL2dpdGh1Yi9pXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgdHlwZTogJ3dlYnNpdGUnLFxuICAgICAgICBhdXRvY29tcGxldGVWYWx1ZXM6IFsndXJsJ10sXG4gICAgICAgIG5hbWVQYXR0ZXJuczogWy93ZWJzaXRlL2ksIC9wb3J0Zm9saW8vaSwgL3BlcnNvbmFsLj9zaXRlL2ksIC9ibG9nL2ldLFxuICAgICAgICBsYWJlbFBhdHRlcm5zOiBbL3dlYnNpdGUvaSwgL3BvcnRmb2xpby9pLCAvcGVyc29uYWxcXHMqKHNpdGV8dXJsKS9pXSxcbiAgICAgICAgbmVnYXRpdmVQYXR0ZXJuczogWy9saW5rZWRpbi9pLCAvZ2l0aHViL2ksIC9jb21wYW55L2ldLFxuICAgIH0sXG4gICAgLy8gRW1wbG95bWVudCBmaWVsZHNcbiAgICB7XG4gICAgICAgIHR5cGU6ICdjdXJyZW50Q29tcGFueScsXG4gICAgICAgIGF1dG9jb21wbGV0ZVZhbHVlczogWydvcmdhbml6YXRpb24nXSxcbiAgICAgICAgbmFtZVBhdHRlcm5zOiBbL2N1cnJlbnQuP2NvbXBhbnkvaSwgL2VtcGxveWVyL2ksIC9jb21wYW55Lj9uYW1lL2ksIC9vcmdhbml6YXRpb24vaV0sXG4gICAgICAgIGxhYmVsUGF0dGVybnM6IFsvY3VycmVudFxccyooY29tcGFueXxlbXBsb3llcikvaSwgL2NvbXBhbnlcXHMqbmFtZS9pLCAvZW1wbG95ZXIvaV0sXG4gICAgICAgIG5lZ2F0aXZlUGF0dGVybnM6IFsvcHJldmlvdXMvaSwgL3Bhc3QvaSwgL2Zvcm1lci9pXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgdHlwZTogJ2N1cnJlbnRUaXRsZScsXG4gICAgICAgIGF1dG9jb21wbGV0ZVZhbHVlczogWydvcmdhbml6YXRpb24tdGl0bGUnXSxcbiAgICAgICAgbmFtZVBhdHRlcm5zOiBbL2N1cnJlbnQuP3RpdGxlL2ksIC9qb2IuP3RpdGxlL2ksIC9wb3NpdGlvbi9pLCAvcm9sZS9pXSxcbiAgICAgICAgbGFiZWxQYXR0ZXJuczogWy9jdXJyZW50XFxzKih0aXRsZXxwb3NpdGlvbnxyb2xlKS9pLCAvam9iXFxzKnRpdGxlL2ldLFxuICAgICAgICBuZWdhdGl2ZVBhdHRlcm5zOiBbL3ByZXZpb3VzL2ksIC9wYXN0L2ksIC9kZXNpcmVkL2ksIC9hcHBseWluZy9pXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgdHlwZTogJ3llYXJzRXhwZXJpZW5jZScsXG4gICAgICAgIG5hbWVQYXR0ZXJuczogWy95ZWFycz8uPyhvZik/Lj9leHBlcmllbmNlL2ksIC9leHBlcmllbmNlLj95ZWFycy9pLCAveW9lL2ldLFxuICAgICAgICBsYWJlbFBhdHRlcm5zOiBbL3llYXJzP1xccyoob2ZcXHMqKT9leHBlcmllbmNlL2ksIC90b3RhbFxccypleHBlcmllbmNlL2ksIC9ob3dcXHMqbWFueVxccyp5ZWFycy9pXSxcbiAgICB9LFxuICAgIC8vIEVkdWNhdGlvbiBmaWVsZHNcbiAgICB7XG4gICAgICAgIHR5cGU6ICdzY2hvb2wnLFxuICAgICAgICBuYW1lUGF0dGVybnM6IFsvc2Nob29sL2ksIC91bml2ZXJzaXR5L2ksIC9jb2xsZWdlL2ksIC9pbnN0aXR1dGlvbi9pLCAvYWxtYS4/bWF0ZXIvaV0sXG4gICAgICAgIGxhYmVsUGF0dGVybnM6IFsvc2Nob29sL2ksIC91bml2ZXJzaXR5L2ksIC9jb2xsZWdlL2ksIC9pbnN0aXR1dGlvbi9pXSxcbiAgICAgICAgbmVnYXRpdmVQYXR0ZXJuczogWy9oaWdoXFxzKnNjaG9vbC9pXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgdHlwZTogJ2RlZ3JlZScsXG4gICAgICAgIG5hbWVQYXR0ZXJuczogWy9kZWdyZWUvaSwgL3F1YWxpZmljYXRpb24vaV0sXG4gICAgICAgIGxhYmVsUGF0dGVybnM6IFsvZGVncmVlL2ksIC9xdWFsaWZpY2F0aW9uL2ksIC9sZXZlbFxccypvZlxccyplZHVjYXRpb24vaV0sXG4gICAgfSxcbiAgICB7XG4gICAgICAgIHR5cGU6ICdmaWVsZE9mU3R1ZHknLFxuICAgICAgICBuYW1lUGF0dGVybnM6IFsvZmllbGQuP29mLj9zdHVkeS9pLCAvbWFqb3IvaSwgL2NvbmNlbnRyYXRpb24vaSwgL3NwZWNpYWxpemF0aW9uL2ldLFxuICAgICAgICBsYWJlbFBhdHRlcm5zOiBbL2ZpZWxkXFxzKm9mXFxzKnN0dWR5L2ksIC9tYWpvci9pLCAvYXJlYVxccypvZlxccypzdHVkeS9pXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgdHlwZTogJ2dyYWR1YXRpb25ZZWFyJyxcbiAgICAgICAgbmFtZVBhdHRlcm5zOiBbL2dyYWR1YXRpb24uPyh5ZWFyfGRhdGUpL2ksIC9ncmFkLj95ZWFyL2ldLFxuICAgICAgICBsYWJlbFBhdHRlcm5zOiBbL2dyYWR1YXRpb25cXHMqKHllYXJ8ZGF0ZSkvaSwgL3llYXJcXHMqb2ZcXHMqZ3JhZHVhdGlvbi9pLCAvd2hlblxccypkaWRcXHMqeW91XFxzKmdyYWR1YXRlL2ldLFxuICAgIH0sXG4gICAge1xuICAgICAgICB0eXBlOiAnZ3BhJyxcbiAgICAgICAgbmFtZVBhdHRlcm5zOiBbL2dwYS9pLCAvZ3JhZGUuP3BvaW50L2ksIC9jZ3BhL2ldLFxuICAgICAgICBsYWJlbFBhdHRlcm5zOiBbL2dwYS9pLCAvZ3JhZGVcXHMqcG9pbnQvaSwgL2N1bXVsYXRpdmVcXHMqZ3BhL2ldLFxuICAgIH0sXG4gICAgLy8gRG9jdW1lbnRzXG4gICAge1xuICAgICAgICB0eXBlOiAncmVzdW1lJyxcbiAgICAgICAgbmFtZVBhdHRlcm5zOiBbL3Jlc3VtZS9pLCAvY3YvaSwgL2N1cnJpY3VsdW0uP3ZpdGFlL2ldLFxuICAgICAgICBsYWJlbFBhdHRlcm5zOiBbL3Jlc3VtZS9pLCAvY3YvaSwgL2N1cnJpY3VsdW1cXHMqdml0YWUvaSwgL3VwbG9hZFxccyooeW91clxccyopP3Jlc3VtZS9pXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgdHlwZTogJ2NvdmVyTGV0dGVyJyxcbiAgICAgICAgbmFtZVBhdHRlcm5zOiBbL2NvdmVyLj9sZXR0ZXIvaSwgL21vdGl2YXRpb24uP2xldHRlci9pXSxcbiAgICAgICAgbGFiZWxQYXR0ZXJuczogWy9jb3ZlclxccypsZXR0ZXIvaSwgL21vdGl2YXRpb25cXHMqbGV0dGVyL2ldLFxuICAgIH0sXG4gICAgLy8gQ29tcGVuc2F0aW9uXG4gICAge1xuICAgICAgICB0eXBlOiAnc2FsYXJ5JyxcbiAgICAgICAgbmFtZVBhdHRlcm5zOiBbL3NhbGFyeS9pLCAvY29tcGVuc2F0aW9uL2ksIC9wYXkvaSwgL3dhZ2UvaV0sXG4gICAgICAgIGxhYmVsUGF0dGVybnM6IFsvc2FsYXJ5L2ksIC9jb21wZW5zYXRpb24vaSwgL2V4cGVjdGVkXFxzKihzYWxhcnl8cGF5KS9pLCAvZGVzaXJlZFxccypzYWxhcnkvaV0sXG4gICAgfSxcbiAgICAvLyBBdmFpbGFiaWxpdHlcbiAgICB7XG4gICAgICAgIHR5cGU6ICdzdGFydERhdGUnLFxuICAgICAgICBuYW1lUGF0dGVybnM6IFsvc3RhcnQuP2RhdGUvaSwgL2F2YWlsYWJsZS4/ZGF0ZS9pLCAvZWFybGllc3QuP3N0YXJ0L2ldLFxuICAgICAgICBsYWJlbFBhdHRlcm5zOiBbL3N0YXJ0XFxzKmRhdGUvaSwgL3doZW5cXHMqY2FuXFxzKnlvdVxccypzdGFydC9pLCAvZWFybGllc3RcXHMqc3RhcnQvaSwgL2F2YWlsYWJpbGl0eS9pXSxcbiAgICAgICAgbmVnYXRpdmVQYXR0ZXJuczogWy9lbmQvaSwgL2ZpbmlzaC9pXSxcbiAgICB9LFxuICAgIC8vIExlZ2FsL0NvbXBsaWFuY2VcbiAgICB7XG4gICAgICAgIHR5cGU6ICd3b3JrQXV0aG9yaXphdGlvbicsXG4gICAgICAgIG5hbWVQYXR0ZXJuczogWy93b3JrLj9hdXRoL2ksIC9hdXRob3JpemVkLj90by4/d29yay9pLCAvbGVnYWxseS4/d29yay9pLCAvd29yay4/cGVybWl0L2ksIC92aXNhLj9zdGF0dXMvaV0sXG4gICAgICAgIGxhYmVsUGF0dGVybnM6IFsvYXV0aG9yaXplZFxccyp0b1xccyp3b3JrL2ksIC9sZWdhbGx5XFxzKihhdXRob3JpemVkfHBlcm1pdHRlZCkvaSwgL3dvcmtcXHMqYXV0aG9yaXphdGlvbi9pLCAvcmlnaHRcXHMqdG9cXHMqd29yay9pXSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgdHlwZTogJ3Nwb25zb3JzaGlwJyxcbiAgICAgICAgbmFtZVBhdHRlcm5zOiBbL3Nwb25zb3IvaSwgL3Zpc2EuP3Nwb25zb3IvaV0sXG4gICAgICAgIGxhYmVsUGF0dGVybnM6IFsvc3BvbnNvci9pLCAvdmlzYVxccypzcG9uc29yL2ksIC9yZXF1aXJlXFxzKnNwb25zb3JzaGlwL2ksIC9uZWVkXFxzKnNwb25zb3JzaGlwL2ldLFxuICAgIH0sXG4gICAgLy8gRUVPIGZpZWxkc1xuICAgIHtcbiAgICAgICAgdHlwZTogJ3ZldGVyYW5TdGF0dXMnLFxuICAgICAgICBuYW1lUGF0dGVybnM6IFsvdmV0ZXJhbi9pLCAvbWlsaXRhcnkvaV0sXG4gICAgICAgIGxhYmVsUGF0dGVybnM6IFsvdmV0ZXJhbi9pLCAvbWlsaXRhcnlcXHMqc3RhdHVzL2ksIC9zZXJ2ZWRcXHMqaW4vaV0sXG4gICAgfSxcbiAgICB7XG4gICAgICAgIHR5cGU6ICdkaXNhYmlsaXR5JyxcbiAgICAgICAgbmFtZVBhdHRlcm5zOiBbL2Rpc2FiaWxpdHkvaSwgL2Rpc2FibGVkL2ldLFxuICAgICAgICBsYWJlbFBhdHRlcm5zOiBbL2Rpc2FiaWxpdHkvaSwgL2Rpc2FibGVkL2ksIC9hY2NvbW1vZGF0aW9uL2ldLFxuICAgIH0sXG4gICAge1xuICAgICAgICB0eXBlOiAnZ2VuZGVyJyxcbiAgICAgICAgbmFtZVBhdHRlcm5zOiBbL2dlbmRlci9pLCAvc2V4L2ldLFxuICAgICAgICBsYWJlbFBhdHRlcm5zOiBbL2dlbmRlci9pLCAvc2V4L2ldLFxuICAgICAgICBuZWdhdGl2ZVBhdHRlcm5zOiBbL2lkZW50aXR5L2ldLFxuICAgIH0sXG4gICAge1xuICAgICAgICB0eXBlOiAnZXRobmljaXR5JyxcbiAgICAgICAgbmFtZVBhdHRlcm5zOiBbL2V0aG5pY2l0eS9pLCAvcmFjZS9pLCAvZXRobmljL2ldLFxuICAgICAgICBsYWJlbFBhdHRlcm5zOiBbL2V0aG5pY2l0eS9pLCAvcmFjZS9pLCAvZXRobmljXFxzKmJhY2tncm91bmQvaV0sXG4gICAgfSxcbiAgICAvLyBTa2lsbHNcbiAgICB7XG4gICAgICAgIHR5cGU6ICdza2lsbHMnLFxuICAgICAgICBuYW1lUGF0dGVybnM6IFsvc2tpbGxzPy9pLCAvZXhwZXJ0aXNlL2ksIC9jb21wZXRlbmMvaV0sXG4gICAgICAgIGxhYmVsUGF0dGVybnM6IFsvc2tpbGxzPy9pLCAvdGVjaG5pY2FsXFxzKnNraWxscy9pLCAva2V5XFxzKnNraWxscy9pXSxcbiAgICB9LFxuICAgIC8vIFN1bW1hcnkvQmlvXG4gICAge1xuICAgICAgICB0eXBlOiAnc3VtbWFyeScsXG4gICAgICAgIG5hbWVQYXR0ZXJuczogWy9zdW1tYXJ5L2ksIC9iaW8vaSwgL2Fib3V0Lj95b3UvaSwgL3Byb2ZpbGUvaSwgL2ludHJvZHVjdGlvbi9pXSxcbiAgICAgICAgbGFiZWxQYXR0ZXJuczogWy9zdW1tYXJ5L2ksIC9wcm9mZXNzaW9uYWxcXHMqc3VtbWFyeS9pLCAvYWJvdXRcXHMqeW91L2ksIC90ZWxsXFxzKnVzXFxzKmFib3V0L2ksIC9iaW8vaV0sXG4gICAgICAgIG5lZ2F0aXZlUGF0dGVybnM6IFsvam9iL2ksIC9wb3NpdGlvbi9pXSxcbiAgICB9LFxuXTtcbi8vIEpvYiBzaXRlIFVSTCBwYXR0ZXJucyBmb3Igc2NyYXBlciBkZXRlY3Rpb25cbmV4cG9ydCBjb25zdCBKT0JfU0lURV9QQVRURVJOUyA9IHtcbiAgICBsaW5rZWRpbjogW1xuICAgICAgICAvbGlua2VkaW5cXC5jb21cXC9qb2JzXFwvdmlld1xcLy8sXG4gICAgICAgIC9saW5rZWRpblxcLmNvbVxcL2pvYnNcXC9zZWFyY2gvLFxuICAgICAgICAvbGlua2VkaW5cXC5jb21cXC9qb2JzXFwvY29sbGVjdGlvbnMvLFxuICAgIF0sXG4gICAgaW5kZWVkOiBbXG4gICAgICAgIC9pbmRlZWRcXC5jb21cXC92aWV3am9iLyxcbiAgICAgICAgL2luZGVlZFxcLmNvbVxcL2pvYnMvLFxuICAgICAgICAvaW5kZWVkXFwuY29tXFwvY21wXFwvLitcXC9qb2JzLyxcbiAgICBdLFxuICAgIGdyZWVuaG91c2U6IFtcbiAgICAgICAgL2JvYXJkc1xcLmdyZWVuaG91c2VcXC5pb1xcLy8sXG4gICAgICAgIC9ncmVlbmhvdXNlXFwuaW9cXC8uKlxcL2pvYnNcXC8vLFxuICAgIF0sXG4gICAgbGV2ZXI6IFtcbiAgICAgICAgL2pvYnNcXC5sZXZlclxcLmNvXFwvLyxcbiAgICAgICAgL2xldmVyXFwuY29cXC8uKlxcL2pvYnNcXC8vLFxuICAgIF0sXG4gICAgd2F0ZXJsb29Xb3JrczogW1xuICAgICAgICAvd2F0ZXJsb293b3Jrc1xcLnV3YXRlcmxvb1xcLmNhLyxcbiAgICBdLFxuICAgIHdvcmtkYXk6IFtcbiAgICAgICAgL215d29ya2RheWpvYnNcXC5jb20vLFxuICAgICAgICAvd29ya2RheWpvYnNcXC5jb20vLFxuICAgIF0sXG59O1xuZXhwb3J0IGZ1bmN0aW9uIGRldGVjdEpvYlNpdGUodXJsKSB7XG4gICAgZm9yIChjb25zdCBbc2l0ZSwgcGF0dGVybnNdIG9mIE9iamVjdC5lbnRyaWVzKEpPQl9TSVRFX1BBVFRFUk5TKSkge1xuICAgICAgICBpZiAocGF0dGVybnMuc29tZShwID0+IHAudGVzdCh1cmwpKSkge1xuICAgICAgICAgICAgcmV0dXJuIHNpdGU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuICd1bmtub3duJztcbn1cbi8vIENvbW1vbiBxdWVzdGlvbiBwYXR0ZXJucyBmb3IgbGVhcm5pbmcgc3lzdGVtXG5leHBvcnQgY29uc3QgQ1VTVE9NX1FVRVNUSU9OX0lORElDQVRPUlMgPSBbXG4gICAgL3doeS4qKHdhbnR8aW50ZXJlc3RlZHxhcHBseXxqb2luKS9pLFxuICAgIC93aGF0LioobWFrZXN8YXR0cmFjdGVkfGV4Y2l0ZXMpL2ksXG4gICAgL3RlbGwuKmFib3V0Lip5b3Vyc2VsZi9pLFxuICAgIC9kZXNjcmliZS4qKHNpdHVhdGlvbnx0aW1lfGV4cGVyaWVuY2UpL2ksXG4gICAgL2hvdy4qaGFuZGxlL2ksXG4gICAgL2dyZWF0ZXN0Liooc3RyZW5ndGh8d2Vha25lc3N8YWNoaWV2ZW1lbnQpL2ksXG4gICAgL3doZXJlLipzZWUuKnlvdXJzZWxmL2ksXG4gICAgL3doeS4qc2hvdWxkLipoaXJlL2ksXG4gICAgL3doYXQuKmNvbnRyaWJ1dGUvaSxcbiAgICAvc2FsYXJ5LipleHBlY3RhdGlvbi9pLFxuICAgIC9hZGRpdGlvbmFsLippbmZvcm1hdGlvbi9pLFxuICAgIC9hbnl0aGluZy4qZWxzZS9pLFxuXTtcbiIsIi8vIEZpZWxkIGRldGVjdGlvbiBmb3IgYXV0by1maWxsXG5pbXBvcnQgeyBGSUVMRF9QQVRURVJOUywgQ1VTVE9NX1FVRVNUSU9OX0lORElDQVRPUlMgfSBmcm9tICdAL3NoYXJlZC9maWVsZC1wYXR0ZXJucyc7XG5leHBvcnQgY2xhc3MgRmllbGREZXRlY3RvciB7XG4gICAgZGV0ZWN0RmllbGRzKGZvcm0pIHtcbiAgICAgICAgY29uc3QgZmllbGRzID0gW107XG4gICAgICAgIGNvbnN0IGlucHV0cyA9IGZvcm0ucXVlcnlTZWxlY3RvckFsbCgnaW5wdXQsIHRleHRhcmVhLCBzZWxlY3QnKTtcbiAgICAgICAgZm9yIChjb25zdCBpbnB1dCBvZiBpbnB1dHMpIHtcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSBpbnB1dDtcbiAgICAgICAgICAgIC8vIFNraXAgaGlkZGVuLCBkaXNhYmxlZCwgb3Igc3VibWl0IGlucHV0c1xuICAgICAgICAgICAgaWYgKHRoaXMuc2hvdWxkU2tpcEVsZW1lbnQoZWxlbWVudCkpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICBjb25zdCBkZXRlY3Rpb24gPSB0aGlzLmRldGVjdEZpZWxkVHlwZShlbGVtZW50KTtcbiAgICAgICAgICAgIGlmIChkZXRlY3Rpb24uZmllbGRUeXBlICE9PSAndW5rbm93bicgfHwgZGV0ZWN0aW9uLmNvbmZpZGVuY2UgPiAwLjEpIHtcbiAgICAgICAgICAgICAgICBmaWVsZHMucHVzaChkZXRlY3Rpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmaWVsZHM7XG4gICAgfVxuICAgIHNob3VsZFNraXBFbGVtZW50KGVsZW1lbnQpIHtcbiAgICAgICAgY29uc3QgaW5wdXQgPSBlbGVtZW50O1xuICAgICAgICAvLyBDaGVjayBjb21wdXRlZCBzdHlsZSBmb3IgdmlzaWJpbGl0eVxuICAgICAgICBjb25zdCBzdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpO1xuICAgICAgICBpZiAoc3R5bGUuZGlzcGxheSA9PT0gJ25vbmUnIHx8IHN0eWxlLnZpc2liaWxpdHkgPT09ICdoaWRkZW4nKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBDaGVjayBkaXNhYmxlZCBzdGF0ZVxuICAgICAgICBpZiAoaW5wdXQuZGlzYWJsZWQpXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgLy8gQ2hlY2sgaW5wdXQgdHlwZVxuICAgICAgICBjb25zdCBza2lwVHlwZXMgPSBbJ2hpZGRlbicsICdzdWJtaXQnLCAnYnV0dG9uJywgJ3Jlc2V0JywgJ2ltYWdlJywgJ2ZpbGUnXTtcbiAgICAgICAgaWYgKHNraXBUeXBlcy5pbmNsdWRlcyhpbnB1dC50eXBlKSlcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAvLyBDaGVjayBpZiBpdCdzIGEgQ1NSRi90b2tlbiBmaWVsZFxuICAgICAgICBpZiAoaW5wdXQubmFtZT8uaW5jbHVkZXMoJ2NzcmYnKSB8fCBpbnB1dC5uYW1lPy5pbmNsdWRlcygndG9rZW4nKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBkZXRlY3RGaWVsZFR5cGUoZWxlbWVudCkge1xuICAgICAgICBjb25zdCBzaWduYWxzID0gdGhpcy5nYXRoZXJTaWduYWxzKGVsZW1lbnQpO1xuICAgICAgICBjb25zdCBzY29yZXMgPSB0aGlzLnNjb3JlQWxsUGF0dGVybnMoc2lnbmFscyk7XG4gICAgICAgIC8vIEdldCBiZXN0IG1hdGNoXG4gICAgICAgIHNjb3Jlcy5zb3J0KChhLCBiKSA9PiBiLmNvbmZpZGVuY2UgLSBhLmNvbmZpZGVuY2UpO1xuICAgICAgICBjb25zdCBiZXN0ID0gc2NvcmVzWzBdO1xuICAgICAgICAvLyBEZXRlcm1pbmUgaWYgdGhpcyBpcyBhIGN1c3RvbSBxdWVzdGlvblxuICAgICAgICBsZXQgZmllbGRUeXBlID0gYmVzdD8uZmllbGRUeXBlIHx8ICd1bmtub3duJztcbiAgICAgICAgbGV0IGNvbmZpZGVuY2UgPSBiZXN0Py5jb25maWRlbmNlIHx8IDA7XG4gICAgICAgIGlmIChjb25maWRlbmNlIDwgMC4zKSB7XG4gICAgICAgICAgICAvLyBDaGVjayBpZiBpdCBsb29rcyBsaWtlIGEgY3VzdG9tIHF1ZXN0aW9uXG4gICAgICAgICAgICBpZiAodGhpcy5sb29rc0xpa2VDdXN0b21RdWVzdGlvbihzaWduYWxzKSkge1xuICAgICAgICAgICAgICAgIGZpZWxkVHlwZSA9ICdjdXN0b21RdWVzdGlvbic7XG4gICAgICAgICAgICAgICAgY29uZmlkZW5jZSA9IDAuNTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZWxlbWVudCxcbiAgICAgICAgICAgIGZpZWxkVHlwZSxcbiAgICAgICAgICAgIGNvbmZpZGVuY2UsXG4gICAgICAgICAgICBsYWJlbDogc2lnbmFscy5sYWJlbCB8fCB1bmRlZmluZWQsXG4gICAgICAgICAgICBwbGFjZWhvbGRlcjogc2lnbmFscy5wbGFjZWhvbGRlciB8fCB1bmRlZmluZWQsXG4gICAgICAgIH07XG4gICAgfVxuICAgIGdhdGhlclNpZ25hbHMoZWxlbWVudCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbmFtZTogZWxlbWVudC5uYW1lPy50b0xvd2VyQ2FzZSgpIHx8ICcnLFxuICAgICAgICAgICAgaWQ6IGVsZW1lbnQuaWQ/LnRvTG93ZXJDYXNlKCkgfHwgJycsXG4gICAgICAgICAgICB0eXBlOiBlbGVtZW50LnR5cGUgfHwgJ3RleHQnLFxuICAgICAgICAgICAgcGxhY2Vob2xkZXI6IGVsZW1lbnQucGxhY2Vob2xkZXI/LnRvTG93ZXJDYXNlKCkgfHwgJycsXG4gICAgICAgICAgICBhdXRvY29tcGxldGU6IGVsZW1lbnQuYXV0b2NvbXBsZXRlIHx8ICcnLFxuICAgICAgICAgICAgbGFiZWw6IHRoaXMuZmluZExhYmVsKGVsZW1lbnQpPy50b0xvd2VyQ2FzZSgpIHx8ICcnLFxuICAgICAgICAgICAgYXJpYUxhYmVsOiBlbGVtZW50LmdldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcpPy50b0xvd2VyQ2FzZSgpIHx8ICcnLFxuICAgICAgICAgICAgbmVhcmJ5VGV4dDogdGhpcy5nZXROZWFyYnlUZXh0KGVsZW1lbnQpPy50b0xvd2VyQ2FzZSgpIHx8ICcnLFxuICAgICAgICAgICAgcGFyZW50Q2xhc3NlczogdGhpcy5nZXRQYXJlbnRDbGFzc2VzKGVsZW1lbnQpLFxuICAgICAgICB9O1xuICAgIH1cbiAgICBzY29yZUFsbFBhdHRlcm5zKHNpZ25hbHMpIHtcbiAgICAgICAgcmV0dXJuIEZJRUxEX1BBVFRFUk5TLm1hcCgocGF0dGVybikgPT4gKHtcbiAgICAgICAgICAgIGZpZWxkVHlwZTogcGF0dGVybi50eXBlLFxuICAgICAgICAgICAgY29uZmlkZW5jZTogdGhpcy5jYWxjdWxhdGVDb25maWRlbmNlKHNpZ25hbHMsIHBhdHRlcm4pLFxuICAgICAgICB9KSk7XG4gICAgfVxuICAgIGNhbGN1bGF0ZUNvbmZpZGVuY2Uoc2lnbmFscywgcGF0dGVybikge1xuICAgICAgICBsZXQgc2NvcmUgPSAwO1xuICAgICAgICBsZXQgbWF4U2NvcmUgPSAwO1xuICAgICAgICAvLyBXZWlnaHQgZGlmZmVyZW50IHNpZ25hbHNcbiAgICAgICAgY29uc3Qgd2VpZ2h0cyA9IHtcbiAgICAgICAgICAgIGF1dG9jb21wbGV0ZTogMC40LFxuICAgICAgICAgICAgbmFtZTogMC4yLFxuICAgICAgICAgICAgaWQ6IDAuMTUsXG4gICAgICAgICAgICBsYWJlbDogMC4xNSxcbiAgICAgICAgICAgIHBsYWNlaG9sZGVyOiAwLjEsXG4gICAgICAgICAgICBhcmlhTGFiZWw6IDAuMSxcbiAgICAgICAgfTtcbiAgICAgICAgLy8gQ2hlY2sgYXV0b2NvbXBsZXRlIGF0dHJpYnV0ZSAobW9zdCByZWxpYWJsZSlcbiAgICAgICAgaWYgKHNpZ25hbHMuYXV0b2NvbXBsZXRlICYmIHBhdHRlcm4uYXV0b2NvbXBsZXRlVmFsdWVzPy5pbmNsdWRlcyhzaWduYWxzLmF1dG9jb21wbGV0ZSkpIHtcbiAgICAgICAgICAgIHNjb3JlICs9IHdlaWdodHMuYXV0b2NvbXBsZXRlO1xuICAgICAgICB9XG4gICAgICAgIG1heFNjb3JlICs9IHdlaWdodHMuYXV0b2NvbXBsZXRlO1xuICAgICAgICAvLyBDaGVjayBuYW1lIGF0dHJpYnV0ZVxuICAgICAgICBpZiAocGF0dGVybi5uYW1lUGF0dGVybnM/LnNvbWUoKHApID0+IHAudGVzdChzaWduYWxzLm5hbWUpKSkge1xuICAgICAgICAgICAgc2NvcmUgKz0gd2VpZ2h0cy5uYW1lO1xuICAgICAgICB9XG4gICAgICAgIG1heFNjb3JlICs9IHdlaWdodHMubmFtZTtcbiAgICAgICAgLy8gQ2hlY2sgSURcbiAgICAgICAgaWYgKHBhdHRlcm4uaWRQYXR0ZXJucz8uc29tZSgocCkgPT4gcC50ZXN0KHNpZ25hbHMuaWQpKSkge1xuICAgICAgICAgICAgc2NvcmUgKz0gd2VpZ2h0cy5pZDtcbiAgICAgICAgfVxuICAgICAgICBtYXhTY29yZSArPSB3ZWlnaHRzLmlkO1xuICAgICAgICAvLyBDaGVjayBsYWJlbFxuICAgICAgICBpZiAocGF0dGVybi5sYWJlbFBhdHRlcm5zPy5zb21lKChwKSA9PiBwLnRlc3Qoc2lnbmFscy5sYWJlbCkpKSB7XG4gICAgICAgICAgICBzY29yZSArPSB3ZWlnaHRzLmxhYmVsO1xuICAgICAgICB9XG4gICAgICAgIG1heFNjb3JlICs9IHdlaWdodHMubGFiZWw7XG4gICAgICAgIC8vIENoZWNrIHBsYWNlaG9sZGVyXG4gICAgICAgIGlmIChwYXR0ZXJuLnBsYWNlaG9sZGVyUGF0dGVybnM/LnNvbWUoKHApID0+IHAudGVzdChzaWduYWxzLnBsYWNlaG9sZGVyKSkpIHtcbiAgICAgICAgICAgIHNjb3JlICs9IHdlaWdodHMucGxhY2Vob2xkZXI7XG4gICAgICAgIH1cbiAgICAgICAgbWF4U2NvcmUgKz0gd2VpZ2h0cy5wbGFjZWhvbGRlcjtcbiAgICAgICAgLy8gQ2hlY2sgYXJpYS1sYWJlbFxuICAgICAgICBpZiAocGF0dGVybi5sYWJlbFBhdHRlcm5zPy5zb21lKChwKSA9PiBwLnRlc3Qoc2lnbmFscy5hcmlhTGFiZWwpKSkge1xuICAgICAgICAgICAgc2NvcmUgKz0gd2VpZ2h0cy5hcmlhTGFiZWw7XG4gICAgICAgIH1cbiAgICAgICAgbWF4U2NvcmUgKz0gd2VpZ2h0cy5hcmlhTGFiZWw7XG4gICAgICAgIC8vIE5lZ2F0aXZlIHNpZ25hbHMgKHJlZHVjZSBjb25maWRlbmNlIGlmIGZvdW5kKVxuICAgICAgICBpZiAocGF0dGVybi5uZWdhdGl2ZVBhdHRlcm5zPy5zb21lKChwKSA9PiBwLnRlc3Qoc2lnbmFscy5uYW1lKSB8fCBwLnRlc3Qoc2lnbmFscy5sYWJlbCkgfHwgcC50ZXN0KHNpZ25hbHMuaWQpKSkge1xuICAgICAgICAgICAgc2NvcmUgLT0gMC4zO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBNYXRoLm1heCgwLCBtYXhTY29yZSA+IDAgPyBzY29yZSAvIG1heFNjb3JlIDogMCk7XG4gICAgfVxuICAgIGZpbmRMYWJlbChlbGVtZW50KSB7XG4gICAgICAgIC8vIE1ldGhvZCAxOiBFeHBsaWNpdCBsYWJlbCB2aWEgZm9yIGF0dHJpYnV0ZVxuICAgICAgICBpZiAoZWxlbWVudC5pZCkge1xuICAgICAgICAgICAgY29uc3QgbGFiZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBsYWJlbFtmb3I9XCIke2VsZW1lbnQuaWR9XCJdYCk7XG4gICAgICAgICAgICBpZiAobGFiZWw/LnRleHRDb250ZW50KVxuICAgICAgICAgICAgICAgIHJldHVybiBsYWJlbC50ZXh0Q29udGVudC50cmltKCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gTWV0aG9kIDI6IFdyYXBwaW5nIGxhYmVsXG4gICAgICAgIGNvbnN0IHBhcmVudExhYmVsID0gZWxlbWVudC5jbG9zZXN0KCdsYWJlbCcpO1xuICAgICAgICBpZiAocGFyZW50TGFiZWw/LnRleHRDb250ZW50KSB7XG4gICAgICAgICAgICAvLyBSZW1vdmUgdGhlIGlucHV0J3MgdmFsdWUgZnJvbSBsYWJlbCB0ZXh0XG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0gcGFyZW50TGFiZWwudGV4dENvbnRlbnQudHJpbSgpO1xuICAgICAgICAgICAgY29uc3QgaW5wdXRWYWx1ZSA9IGVsZW1lbnQudmFsdWUgfHwgJyc7XG4gICAgICAgICAgICByZXR1cm4gdGV4dC5yZXBsYWNlKGlucHV0VmFsdWUsICcnKS50cmltKCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gTWV0aG9kIDM6IGFyaWEtbGFiZWxsZWRieVxuICAgICAgICBjb25zdCBsYWJlbGxlZEJ5ID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWxsZWRieScpO1xuICAgICAgICBpZiAobGFiZWxsZWRCeSkge1xuICAgICAgICAgICAgY29uc3QgbGFiZWxFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGxhYmVsbGVkQnkpO1xuICAgICAgICAgICAgaWYgKGxhYmVsRWw/LnRleHRDb250ZW50KVxuICAgICAgICAgICAgICAgIHJldHVybiBsYWJlbEVsLnRleHRDb250ZW50LnRyaW0oKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBNZXRob2QgNDogUHJldmlvdXMgc2libGluZyBsYWJlbFxuICAgICAgICBsZXQgc2libGluZyA9IGVsZW1lbnQucHJldmlvdXNFbGVtZW50U2libGluZztcbiAgICAgICAgd2hpbGUgKHNpYmxpbmcpIHtcbiAgICAgICAgICAgIGlmIChzaWJsaW5nLnRhZ05hbWUgPT09ICdMQUJFTCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2libGluZy50ZXh0Q29udGVudD8udHJpbSgpIHx8IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzaWJsaW5nID0gc2libGluZy5wcmV2aW91c0VsZW1lbnRTaWJsaW5nO1xuICAgICAgICB9XG4gICAgICAgIC8vIE1ldGhvZCA1OiBQYXJlbnQncyBwcmV2aW91cyBzaWJsaW5nIGxhYmVsXG4gICAgICAgIGNvbnN0IHBhcmVudCA9IGVsZW1lbnQucGFyZW50RWxlbWVudDtcbiAgICAgICAgaWYgKHBhcmVudCkge1xuICAgICAgICAgICAgbGV0IHBhcmVudFNpYmxpbmcgPSBwYXJlbnQucHJldmlvdXNFbGVtZW50U2libGluZztcbiAgICAgICAgICAgIGlmIChwYXJlbnRTaWJsaW5nPy50YWdOYW1lID09PSAnTEFCRUwnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcmVudFNpYmxpbmcudGV4dENvbnRlbnQ/LnRyaW0oKSB8fCBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBnZXROZWFyYnlUZXh0KGVsZW1lbnQpIHtcbiAgICAgICAgY29uc3QgcGFyZW50ID0gZWxlbWVudC5jbG9zZXN0KCcuZm9ybS1ncm91cCwgLmZpZWxkLCAuaW5wdXQtd3JhcHBlciwgW2NsYXNzKj1cImZpZWxkXCJdLCBbY2xhc3MqPVwiaW5wdXRcIl0nKTtcbiAgICAgICAgaWYgKHBhcmVudCkge1xuICAgICAgICAgICAgY29uc3QgdGV4dCA9IHBhcmVudC50ZXh0Q29udGVudD8udHJpbSgpO1xuICAgICAgICAgICAgaWYgKHRleHQgJiYgdGV4dC5sZW5ndGggPCAyMDApXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGdldFBhcmVudENsYXNzZXMoZWxlbWVudCkge1xuICAgICAgICBjb25zdCBjbGFzc2VzID0gW107XG4gICAgICAgIGxldCBjdXJyZW50ID0gZWxlbWVudC5wYXJlbnRFbGVtZW50O1xuICAgICAgICBsZXQgZGVwdGggPSAwO1xuICAgICAgICB3aGlsZSAoY3VycmVudCAmJiBkZXB0aCA8IDMpIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50LmNsYXNzTmFtZSkge1xuICAgICAgICAgICAgICAgIGNsYXNzZXMucHVzaCguLi5jdXJyZW50LmNsYXNzTmFtZS5zcGxpdCgnICcpLmZpbHRlcihCb29sZWFuKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjdXJyZW50ID0gY3VycmVudC5wYXJlbnRFbGVtZW50O1xuICAgICAgICAgICAgZGVwdGgrKztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2xhc3NlcztcbiAgICB9XG4gICAgbG9va3NMaWtlQ3VzdG9tUXVlc3Rpb24oc2lnbmFscykge1xuICAgICAgICBjb25zdCB0ZXh0ID0gYCR7c2lnbmFscy5sYWJlbH0gJHtzaWduYWxzLnBsYWNlaG9sZGVyfSAke3NpZ25hbHMubmVhcmJ5VGV4dH1gO1xuICAgICAgICByZXR1cm4gQ1VTVE9NX1FVRVNUSU9OX0lORElDQVRPUlMuc29tZSgocGF0dGVybikgPT4gcGF0dGVybi50ZXN0KHRleHQpKTtcbiAgICB9XG59XG4iLCIvLyBGaWVsZC10by1wcm9maWxlIHZhbHVlIG1hcHBpbmdcbmV4cG9ydCBjbGFzcyBGaWVsZE1hcHBlciB7XG4gICAgY29uc3RydWN0b3IocHJvZmlsZSkge1xuICAgICAgICB0aGlzLnByb2ZpbGUgPSBwcm9maWxlO1xuICAgIH1cbiAgICBtYXBGaWVsZFRvVmFsdWUoZmllbGQpIHtcbiAgICAgICAgY29uc3QgZmllbGRUeXBlID0gZmllbGQuZmllbGRUeXBlO1xuICAgICAgICBjb25zdCBtYXBwaW5nID0gdGhpcy5nZXRNYXBwaW5ncygpO1xuICAgICAgICBjb25zdCBtYXBwZXIgPSBtYXBwaW5nW2ZpZWxkVHlwZV07XG4gICAgICAgIGlmIChtYXBwZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBtYXBwZXIoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZ2V0TWFwcGluZ3MoKSB7XG4gICAgICAgIGNvbnN0IHAgPSB0aGlzLnByb2ZpbGU7XG4gICAgICAgIGNvbnN0IGMgPSBwLmNvbXB1dGVkO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgLy8gTmFtZSBmaWVsZHNcbiAgICAgICAgICAgIGZpcnN0TmFtZTogKCkgPT4gYz8uZmlyc3ROYW1lIHx8IG51bGwsXG4gICAgICAgICAgICBsYXN0TmFtZTogKCkgPT4gYz8ubGFzdE5hbWUgfHwgbnVsbCxcbiAgICAgICAgICAgIGZ1bGxOYW1lOiAoKSA9PiBwLmNvbnRhY3Q/Lm5hbWUgfHwgbnVsbCxcbiAgICAgICAgICAgIC8vIENvbnRhY3QgZmllbGRzXG4gICAgICAgICAgICBlbWFpbDogKCkgPT4gcC5jb250YWN0Py5lbWFpbCB8fCBudWxsLFxuICAgICAgICAgICAgcGhvbmU6ICgpID0+IHAuY29udGFjdD8ucGhvbmUgfHwgbnVsbCxcbiAgICAgICAgICAgIGFkZHJlc3M6ICgpID0+IHAuY29udGFjdD8ubG9jYXRpb24gfHwgbnVsbCxcbiAgICAgICAgICAgIGNpdHk6ICgpID0+IHRoaXMuZXh0cmFjdENpdHkocC5jb250YWN0Py5sb2NhdGlvbiksXG4gICAgICAgICAgICBzdGF0ZTogKCkgPT4gdGhpcy5leHRyYWN0U3RhdGUocC5jb250YWN0Py5sb2NhdGlvbiksXG4gICAgICAgICAgICB6aXBDb2RlOiAoKSA9PiBudWxsLCAvLyBOb3QgdHlwaWNhbGx5IHN0b3JlZFxuICAgICAgICAgICAgY291bnRyeTogKCkgPT4gdGhpcy5leHRyYWN0Q291bnRyeShwLmNvbnRhY3Q/LmxvY2F0aW9uKSxcbiAgICAgICAgICAgIC8vIFNvY2lhbC9Qcm9mZXNzaW9uYWxcbiAgICAgICAgICAgIGxpbmtlZGluOiAoKSA9PiBwLmNvbnRhY3Q/LmxpbmtlZGluIHx8IG51bGwsXG4gICAgICAgICAgICBnaXRodWI6ICgpID0+IHAuY29udGFjdD8uZ2l0aHViIHx8IG51bGwsXG4gICAgICAgICAgICB3ZWJzaXRlOiAoKSA9PiBwLmNvbnRhY3Q/LndlYnNpdGUgfHwgbnVsbCxcbiAgICAgICAgICAgIHBvcnRmb2xpbzogKCkgPT4gcC5jb250YWN0Py53ZWJzaXRlIHx8IG51bGwsXG4gICAgICAgICAgICAvLyBFbXBsb3ltZW50XG4gICAgICAgICAgICBjdXJyZW50Q29tcGFueTogKCkgPT4gYz8uY3VycmVudENvbXBhbnkgfHwgbnVsbCxcbiAgICAgICAgICAgIGN1cnJlbnRUaXRsZTogKCkgPT4gYz8uY3VycmVudFRpdGxlIHx8IG51bGwsXG4gICAgICAgICAgICB5ZWFyc0V4cGVyaWVuY2U6ICgpID0+IGM/LnllYXJzRXhwZXJpZW5jZT8udG9TdHJpbmcoKSB8fCBudWxsLFxuICAgICAgICAgICAgLy8gRWR1Y2F0aW9uXG4gICAgICAgICAgICBzY2hvb2w6ICgpID0+IGM/Lm1vc3RSZWNlbnRTY2hvb2wgfHwgbnVsbCxcbiAgICAgICAgICAgIGVkdWNhdGlvbjogKCkgPT4gdGhpcy5mb3JtYXRFZHVjYXRpb24oKSxcbiAgICAgICAgICAgIGRlZ3JlZTogKCkgPT4gYz8ubW9zdFJlY2VudERlZ3JlZSB8fCBudWxsLFxuICAgICAgICAgICAgZmllbGRPZlN0dWR5OiAoKSA9PiBjPy5tb3N0UmVjZW50RmllbGQgfHwgbnVsbCxcbiAgICAgICAgICAgIGdyYWR1YXRpb25ZZWFyOiAoKSA9PiBjPy5ncmFkdWF0aW9uWWVhciB8fCBudWxsLFxuICAgICAgICAgICAgZ3BhOiAoKSA9PiBwLmVkdWNhdGlvbj8uWzBdPy5ncGEgfHwgbnVsbCxcbiAgICAgICAgICAgIC8vIERvY3VtZW50cyAocmV0dXJuIG51bGwsIGhhbmRsZWQgc2VwYXJhdGVseSlcbiAgICAgICAgICAgIHJlc3VtZTogKCkgPT4gbnVsbCxcbiAgICAgICAgICAgIGNvdmVyTGV0dGVyOiAoKSA9PiBudWxsLFxuICAgICAgICAgICAgLy8gQ29tcGVuc2F0aW9uXG4gICAgICAgICAgICBzYWxhcnk6ICgpID0+IG51bGwsIC8vIFVzZXItc3BlY2lmaWMsIGRvbid0IGF1dG8tZmlsbFxuICAgICAgICAgICAgc2FsYXJ5RXhwZWN0YXRpb246ICgpID0+IG51bGwsXG4gICAgICAgICAgICAvLyBBdmFpbGFiaWxpdHlcbiAgICAgICAgICAgIHN0YXJ0RGF0ZTogKCkgPT4gbnVsbCwgLy8gVXNlci1zcGVjaWZpY1xuICAgICAgICAgICAgYXZhaWxhYmlsaXR5OiAoKSA9PiBudWxsLFxuICAgICAgICAgICAgLy8gV29yayBhdXRob3JpemF0aW9uIChzZW5zaXRpdmUsIGRvbid0IGF1dG8tZmlsbClcbiAgICAgICAgICAgIHdvcmtBdXRob3JpemF0aW9uOiAoKSA9PiBudWxsLFxuICAgICAgICAgICAgc3BvbnNvcnNoaXA6ICgpID0+IG51bGwsXG4gICAgICAgICAgICAvLyBFRU8gZmllbGRzIChzZW5zaXRpdmUsIGRvbid0IGF1dG8tZmlsbClcbiAgICAgICAgICAgIHZldGVyYW5TdGF0dXM6ICgpID0+IG51bGwsXG4gICAgICAgICAgICBkaXNhYmlsaXR5OiAoKSA9PiBudWxsLFxuICAgICAgICAgICAgZ2VuZGVyOiAoKSA9PiBudWxsLFxuICAgICAgICAgICAgZXRobmljaXR5OiAoKSA9PiBudWxsLFxuICAgICAgICAgICAgLy8gU2tpbGxzL1N1bW1hcnlcbiAgICAgICAgICAgIHNraWxsczogKCkgPT4gYz8uc2tpbGxzTGlzdCB8fCBudWxsLFxuICAgICAgICAgICAgc3VtbWFyeTogKCkgPT4gcC5zdW1tYXJ5IHx8IG51bGwsXG4gICAgICAgICAgICBleHBlcmllbmNlOiAoKSA9PiB0aGlzLmZvcm1hdEV4cGVyaWVuY2UoKSxcbiAgICAgICAgICAgIC8vIEN1c3RvbS9Vbmtub3duIChoYW5kbGVkIGJ5IGxlYXJuaW5nIHN5c3RlbSlcbiAgICAgICAgICAgIGN1c3RvbVF1ZXN0aW9uOiAoKSA9PiBudWxsLFxuICAgICAgICAgICAgdW5rbm93bjogKCkgPT4gbnVsbCxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgZXh0cmFjdENpdHkobG9jYXRpb24pIHtcbiAgICAgICAgaWYgKCFsb2NhdGlvbilcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAvLyBDb21tb24gcGF0dGVybjogXCJDaXR5LCBTdGF0ZVwiIG9yIFwiQ2l0eSwgU3RhdGUsIENvdW50cnlcIlxuICAgICAgICBjb25zdCBwYXJ0cyA9IGxvY2F0aW9uLnNwbGl0KCcsJykubWFwKChwKSA9PiBwLnRyaW0oKSk7XG4gICAgICAgIHJldHVybiBwYXJ0c1swXSB8fCBudWxsO1xuICAgIH1cbiAgICBleHRyYWN0U3RhdGUobG9jYXRpb24pIHtcbiAgICAgICAgaWYgKCFsb2NhdGlvbilcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICBjb25zdCBwYXJ0cyA9IGxvY2F0aW9uLnNwbGl0KCcsJykubWFwKChwKSA9PiBwLnRyaW0oKSk7XG4gICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPj0gMikge1xuICAgICAgICAgICAgLy8gSGFuZGxlIFwiQ0FcIiBvciBcIkNhbGlmb3JuaWFcIiBvciBcIkNBIDk0MTA1XCJcbiAgICAgICAgICAgIGNvbnN0IHN0YXRlID0gcGFydHNbMV0uc3BsaXQoJyAnKVswXTtcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZSB8fCBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBleHRyYWN0Q291bnRyeShsb2NhdGlvbikge1xuICAgICAgICBpZiAoIWxvY2F0aW9uKVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIGNvbnN0IHBhcnRzID0gbG9jYXRpb24uc3BsaXQoJywnKS5tYXAoKHApID0+IHAudHJpbSgpKTtcbiAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA+PSAzKSB7XG4gICAgICAgICAgICByZXR1cm4gcGFydHNbcGFydHMubGVuZ3RoIC0gMV07XG4gICAgICAgIH1cbiAgICAgICAgLy8gRGVmYXVsdCB0byBVU0EgaWYgb25seSBjaXR5L3N0YXRlXG4gICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAgIHJldHVybiAnVW5pdGVkIFN0YXRlcyc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGZvcm1hdEVkdWNhdGlvbigpIHtcbiAgICAgICAgY29uc3QgZWR1ID0gdGhpcy5wcm9maWxlLmVkdWNhdGlvbj8uWzBdO1xuICAgICAgICBpZiAoIWVkdSlcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICByZXR1cm4gYCR7ZWR1LmRlZ3JlZX0gaW4gJHtlZHUuZmllbGR9IGZyb20gJHtlZHUuaW5zdGl0dXRpb259YDtcbiAgICB9XG4gICAgZm9ybWF0RXhwZXJpZW5jZSgpIHtcbiAgICAgICAgY29uc3QgZXhwcyA9IHRoaXMucHJvZmlsZS5leHBlcmllbmNlcztcbiAgICAgICAgaWYgKCFleHBzIHx8IGV4cHMubGVuZ3RoID09PSAwKVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIHJldHVybiBleHBzXG4gICAgICAgICAgICAuc2xpY2UoMCwgMylcbiAgICAgICAgICAgIC5tYXAoKGV4cCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcGVyaW9kID0gZXhwLmN1cnJlbnRcbiAgICAgICAgICAgICAgICA/IGAke2V4cC5zdGFydERhdGV9IC0gUHJlc2VudGBcbiAgICAgICAgICAgICAgICA6IGAke2V4cC5zdGFydERhdGV9IC0gJHtleHAuZW5kRGF0ZX1gO1xuICAgICAgICAgICAgcmV0dXJuIGAke2V4cC50aXRsZX0gYXQgJHtleHAuY29tcGFueX0gKCR7cGVyaW9kfSlgO1xuICAgICAgICB9KVxuICAgICAgICAgICAgLmpvaW4oJ1xcbicpO1xuICAgIH1cbiAgICAvLyBHZXQgYWxsIG1hcHBlZCB2YWx1ZXMgZm9yIGEgZm9ybVxuICAgIGdldEFsbE1hcHBlZFZhbHVlcyhmaWVsZHMpIHtcbiAgICAgICAgY29uc3QgdmFsdWVzID0gbmV3IE1hcCgpO1xuICAgICAgICBmb3IgKGNvbnN0IGZpZWxkIG9mIGZpZWxkcykge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLm1hcEZpZWxkVG9WYWx1ZShmaWVsZCk7XG4gICAgICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZXMuc2V0KGZpZWxkLmVsZW1lbnQsIHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWVzO1xuICAgIH1cbn1cbiIsIi8vIEF1dG8tZmlsbCBlbmdpbmUgb3JjaGVzdHJhdG9yXG5leHBvcnQgY2xhc3MgQXV0b0ZpbGxFbmdpbmUge1xuICAgIGNvbnN0cnVjdG9yKGRldGVjdG9yLCBtYXBwZXIpIHtcbiAgICAgICAgdGhpcy5kZXRlY3RvciA9IGRldGVjdG9yO1xuICAgICAgICB0aGlzLm1hcHBlciA9IG1hcHBlcjtcbiAgICB9XG4gICAgYXN5bmMgZmlsbEZvcm0oZmllbGRzKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgIGZpbGxlZDogMCxcbiAgICAgICAgICAgIHNraXBwZWQ6IDAsXG4gICAgICAgICAgICBlcnJvcnM6IDAsXG4gICAgICAgICAgICBkZXRhaWxzOiBbXSxcbiAgICAgICAgfTtcbiAgICAgICAgZm9yIChjb25zdCBmaWVsZCBvZiBmaWVsZHMpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLm1hcHBlci5tYXBGaWVsZFRvVmFsdWUoZmllbGQpO1xuICAgICAgICAgICAgICAgIGlmICghdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnNraXBwZWQrKztcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LmRldGFpbHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWVsZFR5cGU6IGZpZWxkLmZpZWxkVHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGxlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgZmlsbGVkID0gYXdhaXQgdGhpcy5maWxsRmllbGQoZmllbGQuZWxlbWVudCwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIGlmIChmaWxsZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LmZpbGxlZCsrO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQuZGV0YWlscy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpZWxkVHlwZTogZmllbGQuZmllbGRUeXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsbGVkOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5za2lwcGVkKys7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5kZXRhaWxzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgZmllbGRUeXBlOiBmaWVsZC5maWVsZFR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LmVycm9ycysrO1xuICAgICAgICAgICAgICAgIHJlc3VsdC5kZXRhaWxzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBmaWVsZFR5cGU6IGZpZWxkLmZpZWxkVHlwZSxcbiAgICAgICAgICAgICAgICAgICAgZmlsbGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGVyci5tZXNzYWdlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIGFzeW5jIGZpbGxGaWVsZChlbGVtZW50LCB2YWx1ZSkge1xuICAgICAgICBjb25zdCB0YWdOYW1lID0gZWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGNvbnN0IGlucHV0VHlwZSA9IGVsZW1lbnQudHlwZT8udG9Mb3dlckNhc2UoKSB8fCAndGV4dCc7XG4gICAgICAgIC8vIEhhbmRsZSBkaWZmZXJlbnQgaW5wdXQgdHlwZXNcbiAgICAgICAgaWYgKHRhZ05hbWUgPT09ICdzZWxlY3QnKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5maWxsU2VsZWN0KGVsZW1lbnQsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGFnTmFtZSA9PT0gJ3RleHRhcmVhJykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmlsbFRleHRJbnB1dChlbGVtZW50LCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRhZ05hbWUgPT09ICdpbnB1dCcpIHtcbiAgICAgICAgICAgIHN3aXRjaCAoaW5wdXRUeXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAndGV4dCc6XG4gICAgICAgICAgICAgICAgY2FzZSAnZW1haWwnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ3RlbCc6XG4gICAgICAgICAgICAgICAgY2FzZSAndXJsJzpcbiAgICAgICAgICAgICAgICBjYXNlICdudW1iZXInOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5maWxsVGV4dElucHV0KGVsZW1lbnQsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICBjYXNlICdjaGVja2JveCc6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbGxDaGVja2JveChlbGVtZW50LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgY2FzZSAncmFkaW8nOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5maWxsUmFkaW8oZWxlbWVudCwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2RhdGUnOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5maWxsRGF0ZUlucHV0KGVsZW1lbnQsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5maWxsVGV4dElucHV0KGVsZW1lbnQsIHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGZpbGxUZXh0SW5wdXQoZWxlbWVudCwgdmFsdWUpIHtcbiAgICAgICAgLy8gRm9jdXMgdGhlIGVsZW1lbnRcbiAgICAgICAgZWxlbWVudC5mb2N1cygpO1xuICAgICAgICAvLyBDbGVhciBleGlzdGluZyB2YWx1ZVxuICAgICAgICBlbGVtZW50LnZhbHVlID0gJyc7XG4gICAgICAgIC8vIFNldCBuZXcgdmFsdWVcbiAgICAgICAgZWxlbWVudC52YWx1ZSA9IHZhbHVlO1xuICAgICAgICAvLyBEaXNwYXRjaCBldmVudHMgdG8gdHJpZ2dlciB2YWxpZGF0aW9uIGFuZCBmcmFtZXdvcmtzXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hJbnB1dEV2ZW50cyhlbGVtZW50KTtcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQudmFsdWUgPT09IHZhbHVlO1xuICAgIH1cbiAgICBmaWxsU2VsZWN0KGVsZW1lbnQsIHZhbHVlKSB7XG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSBBcnJheS5mcm9tKGVsZW1lbnQub3B0aW9ucyk7XG4gICAgICAgIGNvbnN0IG5vcm1hbGl6ZWRWYWx1ZSA9IHZhbHVlLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIC8vIFRyeSBleGFjdCBtYXRjaCBmaXJzdFxuICAgICAgICBsZXQgbWF0Y2hpbmdPcHRpb24gPSBvcHRpb25zLmZpbmQoKG9wdCkgPT4gb3B0LnZhbHVlLnRvTG93ZXJDYXNlKCkgPT09IG5vcm1hbGl6ZWRWYWx1ZSB8fCBvcHQudGV4dC50b0xvd2VyQ2FzZSgpID09PSBub3JtYWxpemVkVmFsdWUpO1xuICAgICAgICAvLyBUcnkgcGFydGlhbCBtYXRjaFxuICAgICAgICBpZiAoIW1hdGNoaW5nT3B0aW9uKSB7XG4gICAgICAgICAgICBtYXRjaGluZ09wdGlvbiA9IG9wdGlvbnMuZmluZCgob3B0KSA9PiBvcHQudmFsdWUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhub3JtYWxpemVkVmFsdWUpIHx8XG4gICAgICAgICAgICAgICAgb3B0LnRleHQudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhub3JtYWxpemVkVmFsdWUpIHx8XG4gICAgICAgICAgICAgICAgbm9ybWFsaXplZFZhbHVlLmluY2x1ZGVzKG9wdC52YWx1ZS50b0xvd2VyQ2FzZSgpKSB8fFxuICAgICAgICAgICAgICAgIG5vcm1hbGl6ZWRWYWx1ZS5pbmNsdWRlcyhvcHQudGV4dC50b0xvd2VyQ2FzZSgpKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1hdGNoaW5nT3B0aW9uKSB7XG4gICAgICAgICAgICBlbGVtZW50LnZhbHVlID0gbWF0Y2hpbmdPcHRpb24udmFsdWU7XG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoSW5wdXRFdmVudHMoZWxlbWVudCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGZpbGxDaGVja2JveChlbGVtZW50LCB2YWx1ZSkge1xuICAgICAgICBjb25zdCBzaG91bGRDaGVjayA9IFsndHJ1ZScsICd5ZXMnLCAnMScsICdvbiddLmluY2x1ZGVzKHZhbHVlLnRvTG93ZXJDYXNlKCkpO1xuICAgICAgICBlbGVtZW50LmNoZWNrZWQgPSBzaG91bGRDaGVjaztcbiAgICAgICAgdGhpcy5kaXNwYXRjaElucHV0RXZlbnRzKGVsZW1lbnQpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgZmlsbFJhZGlvKGVsZW1lbnQsIHZhbHVlKSB7XG4gICAgICAgIGNvbnN0IG5vcm1hbGl6ZWRWYWx1ZSA9IHZhbHVlLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIC8vIEZpbmQgdGhlIHJhZGlvIGdyb3VwXG4gICAgICAgIGNvbnN0IG5hbWUgPSBlbGVtZW50Lm5hbWU7XG4gICAgICAgIGlmICghbmFtZSlcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgY29uc3QgcmFkaW9zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChgaW5wdXRbdHlwZT1cInJhZGlvXCJdW25hbWU9XCIke25hbWV9XCJdYCk7XG4gICAgICAgIGZvciAoY29uc3QgcmFkaW8gb2YgcmFkaW9zKSB7XG4gICAgICAgICAgICBjb25zdCByYWRpb0lucHV0ID0gcmFkaW87XG4gICAgICAgICAgICBjb25zdCByYWRpb1ZhbHVlID0gcmFkaW9JbnB1dC52YWx1ZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgY29uc3QgcmFkaW9MYWJlbCA9IHRoaXMuZ2V0UmFkaW9MYWJlbChyYWRpb0lucHV0KT8udG9Mb3dlckNhc2UoKSB8fCAnJztcbiAgICAgICAgICAgIGlmIChyYWRpb1ZhbHVlID09PSBub3JtYWxpemVkVmFsdWUgfHxcbiAgICAgICAgICAgICAgICByYWRpb0xhYmVsLmluY2x1ZGVzKG5vcm1hbGl6ZWRWYWx1ZSkgfHxcbiAgICAgICAgICAgICAgICBub3JtYWxpemVkVmFsdWUuaW5jbHVkZXMocmFkaW9WYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICByYWRpb0lucHV0LmNoZWNrZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hJbnB1dEV2ZW50cyhyYWRpb0lucHV0KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGZpbGxEYXRlSW5wdXQoZWxlbWVudCwgdmFsdWUpIHtcbiAgICAgICAgLy8gVHJ5IHRvIHBhcnNlIGFuZCBmb3JtYXQgdGhlIGRhdGVcbiAgICAgICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKHZhbHVlKTtcbiAgICAgICAgaWYgKGlzTmFOKGRhdGUuZ2V0VGltZSgpKSlcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgLy8gRm9ybWF0IGFzIFlZWVktTU0tREQgZm9yIGRhdGUgaW5wdXRcbiAgICAgICAgY29uc3QgZm9ybWF0dGVkID0gZGF0ZS50b0lTT1N0cmluZygpLnNwbGl0KCdUJylbMF07XG4gICAgICAgIGVsZW1lbnQudmFsdWUgPSBmb3JtYXR0ZWQ7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hJbnB1dEV2ZW50cyhlbGVtZW50KTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGdldFJhZGlvTGFiZWwocmFkaW8pIHtcbiAgICAgICAgLy8gQ2hlY2sgZm9yIGFzc29jaWF0ZWQgbGFiZWxcbiAgICAgICAgaWYgKHJhZGlvLmlkKSB7XG4gICAgICAgICAgICBjb25zdCBsYWJlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYGxhYmVsW2Zvcj1cIiR7cmFkaW8uaWR9XCJdYCk7XG4gICAgICAgICAgICBpZiAobGFiZWwpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGxhYmVsLnRleHRDb250ZW50Py50cmltKCkgfHwgbnVsbDtcbiAgICAgICAgfVxuICAgICAgICAvLyBDaGVjayBmb3Igd3JhcHBpbmcgbGFiZWxcbiAgICAgICAgY29uc3QgcGFyZW50ID0gcmFkaW8uY2xvc2VzdCgnbGFiZWwnKTtcbiAgICAgICAgaWYgKHBhcmVudCkge1xuICAgICAgICAgICAgcmV0dXJuIHBhcmVudC50ZXh0Q29udGVudD8udHJpbSgpIHx8IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQ2hlY2sgZm9yIG5leHQgc2libGluZyB0ZXh0XG4gICAgICAgIGNvbnN0IG5leHQgPSByYWRpby5uZXh0U2libGluZztcbiAgICAgICAgaWYgKG5leHQ/Lm5vZGVUeXBlID09PSBOb2RlLlRFWFRfTk9ERSkge1xuICAgICAgICAgICAgcmV0dXJuIG5leHQudGV4dENvbnRlbnQ/LnRyaW0oKSB8fCBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBkaXNwYXRjaElucHV0RXZlbnRzKGVsZW1lbnQpIHtcbiAgICAgICAgLy8gRGlzcGF0Y2ggZXZlbnRzIGluIG9yZGVyIHRoYXQgbW9zdCBmcmFtZXdvcmtzIGV4cGVjdFxuICAgICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdmb2N1cycsIHsgYnViYmxlczogdHJ1ZSB9KSk7XG4gICAgICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2lucHV0JywgeyBidWJibGVzOiB0cnVlIH0pKTtcbiAgICAgICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnY2hhbmdlJywgeyBidWJibGVzOiB0cnVlIH0pKTtcbiAgICAgICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnYmx1cicsIHsgYnViYmxlczogdHJ1ZSB9KSk7XG4gICAgICAgIC8vIEZvciBSZWFjdCBjb250cm9sbGVkIGNvbXBvbmVudHNcbiAgICAgICAgY29uc3QgbmF0aXZlSW5wdXRWYWx1ZVNldHRlciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iod2luZG93LkhUTUxJbnB1dEVsZW1lbnQucHJvdG90eXBlLCAndmFsdWUnKT8uc2V0O1xuICAgICAgICBpZiAobmF0aXZlSW5wdXRWYWx1ZVNldHRlciAmJiBlbGVtZW50IGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBlbGVtZW50LnZhbHVlO1xuICAgICAgICAgICAgbmF0aXZlSW5wdXRWYWx1ZVNldHRlci5jYWxsKGVsZW1lbnQsIHZhbHVlKTtcbiAgICAgICAgICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2lucHV0JywgeyBidWJibGVzOiB0cnVlIH0pKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vIEJhc2Ugc2NyYXBlciBpbnRlcmZhY2UgYW5kIHV0aWxpdGllc1xuZXhwb3J0IGNsYXNzIEJhc2VTY3JhcGVyIHtcbiAgICAvLyBTaGFyZWQgdXRpbGl0aWVzXG4gICAgZXh0cmFjdFRleHRDb250ZW50KHNlbGVjdG9yKSB7XG4gICAgICAgIGNvbnN0IGVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgICAgIHJldHVybiBlbD8udGV4dENvbnRlbnQ/LnRyaW0oKSB8fCBudWxsO1xuICAgIH1cbiAgICBleHRyYWN0SHRtbENvbnRlbnQoc2VsZWN0b3IpIHtcbiAgICAgICAgY29uc3QgZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgICAgcmV0dXJuIGVsPy5pbm5lckhUTUw/LnRyaW0oKSB8fCBudWxsO1xuICAgIH1cbiAgICBleHRyYWN0QXR0cmlidXRlKHNlbGVjdG9yLCBhdHRyKSB7XG4gICAgICAgIGNvbnN0IGVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgICAgIHJldHVybiBlbD8uZ2V0QXR0cmlidXRlKGF0dHIpIHx8IG51bGw7XG4gICAgfVxuICAgIGV4dHJhY3RBbGxUZXh0KHNlbGVjdG9yKSB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKGVsZW1lbnRzKVxuICAgICAgICAgICAgLm1hcCgoZWwpID0+IGVsLnRleHRDb250ZW50Py50cmltKCkpXG4gICAgICAgICAgICAuZmlsdGVyKCh0ZXh0KSA9PiAhIXRleHQpO1xuICAgIH1cbiAgICB3YWl0Rm9yRWxlbWVudChzZWxlY3RvciwgdGltZW91dCA9IDUwMDApIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgICAgICAgICBpZiAoZWwpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoZWwpO1xuICAgICAgICAgICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigoXywgb2JzKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgICAgICAgICAgICBpZiAoZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgb2JzLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShlbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmJvZHksIHsgY2hpbGRMaXN0OiB0cnVlLCBzdWJ0cmVlOiB0cnVlIH0pO1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoYEVsZW1lbnQgJHtzZWxlY3Rvcn0gbm90IGZvdW5kIGFmdGVyICR7dGltZW91dH1tc2ApKTtcbiAgICAgICAgICAgIH0sIHRpbWVvdXQpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgZXh0cmFjdFJlcXVpcmVtZW50cyh0ZXh0KSB7XG4gICAgICAgIGNvbnN0IHJlcXVpcmVtZW50cyA9IFtdO1xuICAgICAgICAvLyBTcGxpdCBieSBjb21tb24gYnVsbGV0IHBhdHRlcm5zXG4gICAgICAgIGNvbnN0IGxpbmVzID0gdGV4dC5zcGxpdCgvXFxufOKAonzil6Z84peGfOKWqnzil498LVxcc3xcXCpcXHMvKTtcbiAgICAgICAgZm9yIChjb25zdCBsaW5lIG9mIGxpbmVzKSB7XG4gICAgICAgICAgICBjb25zdCBjbGVhbmVkID0gbGluZS50cmltKCk7XG4gICAgICAgICAgICBpZiAoY2xlYW5lZC5sZW5ndGggPiAyMCAmJiBjbGVhbmVkLmxlbmd0aCA8IDUwMCkge1xuICAgICAgICAgICAgICAgIC8vIENoZWNrIGlmIGl0IGxvb2tzIGxpa2UgYSByZXF1aXJlbWVudFxuICAgICAgICAgICAgICAgIGlmIChjbGVhbmVkLm1hdGNoKC9eKHlvdXx3ZXx0aGV8bXVzdHxzaG91bGR8d2lsbHxleHBlcmllbmNlfHByb2ZpY2llbmN5fGtub3dsZWRnZXxhYmlsaXR5fHN0cm9uZ3xleGNlbGxlbnQpL2kpIHx8XG4gICAgICAgICAgICAgICAgICAgIGNsZWFuZWQubWF0Y2goL3JlcXVpcmVkfHByZWZlcnJlZHxib251c3xwbHVzL2kpIHx8XG4gICAgICAgICAgICAgICAgICAgIGNsZWFuZWQubWF0Y2goL15cXGQrXFwrP1xccyp5ZWFycz8vaSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVxdWlyZW1lbnRzLnB1c2goY2xlYW5lZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXF1aXJlbWVudHMuc2xpY2UoMCwgMTUpO1xuICAgIH1cbiAgICBleHRyYWN0S2V5d29yZHModGV4dCkge1xuICAgICAgICBjb25zdCBrZXl3b3JkcyA9IG5ldyBTZXQoKTtcbiAgICAgICAgLy8gQ29tbW9uIHRlY2ggc2tpbGxzIHBhdHRlcm5zXG4gICAgICAgIGNvbnN0IHRlY2hQYXR0ZXJucyA9IFtcbiAgICAgICAgICAgIC9cXGIocmVhY3R8YW5ndWxhcnx2dWV8c3ZlbHRlfG5leHRcXC4/anN8bnV4dClcXGIvZ2ksXG4gICAgICAgICAgICAvXFxiKG5vZGVcXC4/anN8ZXhwcmVzc3xmYXN0aWZ5fG5lc3RcXC4/anMpXFxiL2dpLFxuICAgICAgICAgICAgL1xcYihweXRob258ZGphbmdvfGZsYXNrfGZhc3RhcGkpXFxiL2dpLFxuICAgICAgICAgICAgL1xcYihqYXZhfHNwcmluZ3xrb3RsaW4pXFxiL2dpLFxuICAgICAgICAgICAgL1xcYihnb3xnb2xhbmd8cnVzdHxjXFwrXFwrfGMjfFxcLm5ldClcXGIvZ2ksXG4gICAgICAgICAgICAvXFxiKHR5cGVzY3JpcHR8amF2YXNjcmlwdHxlczYpXFxiL2dpLFxuICAgICAgICAgICAgL1xcYihzcWx8bXlzcWx8cG9zdGdyZXNxbHxtb25nb2RifHJlZGlzfGVsYXN0aWNzZWFyY2gpXFxiL2dpLFxuICAgICAgICAgICAgL1xcYihhd3N8Z2NwfGF6dXJlfGRvY2tlcnxrdWJlcm5ldGVzfGs4cylcXGIvZ2ksXG4gICAgICAgICAgICAvXFxiKGdpdHxjaVxcL2NkfGplbmtpbnN8Z2l0aHViXFxzKmFjdGlvbnMpXFxiL2dpLFxuICAgICAgICAgICAgL1xcYihncmFwaHFsfHJlc3R8YXBpfG1pY3Jvc2VydmljZXMpXFxiL2dpLFxuICAgICAgICBdO1xuICAgICAgICBmb3IgKGNvbnN0IHBhdHRlcm4gb2YgdGVjaFBhdHRlcm5zKSB7XG4gICAgICAgICAgICBjb25zdCBtYXRjaGVzID0gdGV4dC5tYXRjaChwYXR0ZXJuKTtcbiAgICAgICAgICAgIGlmIChtYXRjaGVzKSB7XG4gICAgICAgICAgICAgICAgbWF0Y2hlcy5mb3JFYWNoKChtKSA9PiBrZXl3b3Jkcy5hZGQobS50b0xvd2VyQ2FzZSgpLnRyaW0oKSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKGtleXdvcmRzKTtcbiAgICB9XG4gICAgZGV0ZWN0Sm9iVHlwZSh0ZXh0KSB7XG4gICAgICAgIGNvbnN0IGxvd2VyID0gdGV4dC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBpZiAobG93ZXIuaW5jbHVkZXMoJ2ludGVybicpIHx8IGxvd2VyLmluY2x1ZGVzKCdpbnRlcm5zaGlwJykgfHwgbG93ZXIuaW5jbHVkZXMoJ2NvLW9wJykpIHtcbiAgICAgICAgICAgIHJldHVybiAnaW50ZXJuc2hpcCc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxvd2VyLmluY2x1ZGVzKCdjb250cmFjdCcpIHx8IGxvd2VyLmluY2x1ZGVzKCdjb250cmFjdG9yJykpIHtcbiAgICAgICAgICAgIHJldHVybiAnY29udHJhY3QnO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsb3dlci5pbmNsdWRlcygncGFydC10aW1lJykgfHwgbG93ZXIuaW5jbHVkZXMoJ3BhcnQgdGltZScpKSB7XG4gICAgICAgICAgICByZXR1cm4gJ3BhcnQtdGltZSc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxvd2VyLmluY2x1ZGVzKCdmdWxsLXRpbWUnKSB8fCBsb3dlci5pbmNsdWRlcygnZnVsbCB0aW1lJykpIHtcbiAgICAgICAgICAgIHJldHVybiAnZnVsbC10aW1lJztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBkZXRlY3RSZW1vdGUodGV4dCkge1xuICAgICAgICBjb25zdCBsb3dlciA9IHRleHQudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgcmV0dXJuIChsb3dlci5pbmNsdWRlcygncmVtb3RlJykgfHxcbiAgICAgICAgICAgIGxvd2VyLmluY2x1ZGVzKCd3b3JrIGZyb20gaG9tZScpIHx8XG4gICAgICAgICAgICBsb3dlci5pbmNsdWRlcygnd2ZoJykgfHxcbiAgICAgICAgICAgIGxvd2VyLmluY2x1ZGVzKCdmdWxseSBkaXN0cmlidXRlZCcpIHx8XG4gICAgICAgICAgICBsb3dlci5pbmNsdWRlcygnYW55d2hlcmUnKSk7XG4gICAgfVxuICAgIGV4dHJhY3RTYWxhcnkodGV4dCkge1xuICAgICAgICAvLyBNYXRjaCBzYWxhcnkgcGF0dGVybnMgbGlrZSAkMTAwLDAwMCAtICQxNTAsMDAwIG9yICQxMDBrIC0gJDE1MGtcbiAgICAgICAgY29uc3QgcGF0dGVybiA9IC9cXCRbXFxkLF0rKD86ayk/KD86XFxzKlst4oCTXVxccypcXCRbXFxkLF0rKD86ayk/KT8oPzpcXHMqKD86cGVyfFxcLylcXHMqKD86eWVhcnx5cnxhbm51bXxhbm51YWx8aG91cnxocikpPy9naTtcbiAgICAgICAgY29uc3QgbWF0Y2ggPSBwYXR0ZXJuLmV4ZWModGV4dCk7XG4gICAgICAgIHJldHVybiBtYXRjaCA/IG1hdGNoWzBdIDogdW5kZWZpbmVkO1xuICAgIH1cbiAgICBjbGVhbkRlc2NyaXB0aW9uKGh0bWwpIHtcbiAgICAgICAgLy8gUmVtb3ZlIEhUTUwgdGFncyBidXQgcHJlc2VydmUgbGluZSBicmVha3NcbiAgICAgICAgcmV0dXJuIGh0bWxcbiAgICAgICAgICAgIC5yZXBsYWNlKC88YnJcXHMqXFwvPz4vZ2ksICdcXG4nKVxuICAgICAgICAgICAgLnJlcGxhY2UoLzxcXC9wPi9naSwgJ1xcblxcbicpXG4gICAgICAgICAgICAucmVwbGFjZSgvPFxcL2Rpdj4vZ2ksICdcXG4nKVxuICAgICAgICAgICAgLnJlcGxhY2UoLzxcXC9saT4vZ2ksICdcXG4nKVxuICAgICAgICAgICAgLnJlcGxhY2UoLzxbXj5dKz4vZywgJycpXG4gICAgICAgICAgICAucmVwbGFjZSgvJm5ic3A7L2csICcgJylcbiAgICAgICAgICAgIC5yZXBsYWNlKC8mYW1wOy9nLCAnJicpXG4gICAgICAgICAgICAucmVwbGFjZSgvJmx0Oy9nLCAnPCcpXG4gICAgICAgICAgICAucmVwbGFjZSgvJmd0Oy9nLCAnPicpXG4gICAgICAgICAgICAucmVwbGFjZSgvXFxuezMsfS9nLCAnXFxuXFxuJylcbiAgICAgICAgICAgIC50cmltKCk7XG4gICAgfVxufVxuIiwiLy8gTGlua2VkSW4gam9iIHNjcmFwZXJcbmltcG9ydCB7IEJhc2VTY3JhcGVyIH0gZnJvbSAnLi9iYXNlLXNjcmFwZXInO1xuZXhwb3J0IGNsYXNzIExpbmtlZEluU2NyYXBlciBleHRlbmRzIEJhc2VTY3JhcGVyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcbiAgICAgICAgdGhpcy5zb3VyY2UgPSAnbGlua2VkaW4nO1xuICAgICAgICB0aGlzLnVybFBhdHRlcm5zID0gW1xuICAgICAgICAgICAgL2xpbmtlZGluXFwuY29tXFwvam9ic1xcL3ZpZXdcXC8oXFxkKykvLFxuICAgICAgICAgICAgL2xpbmtlZGluXFwuY29tXFwvam9ic1xcL3NlYXJjaC8sXG4gICAgICAgICAgICAvbGlua2VkaW5cXC5jb21cXC9qb2JzXFwvY29sbGVjdGlvbnMvLFxuICAgICAgICBdO1xuICAgIH1cbiAgICBjYW5IYW5kbGUodXJsKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnVybFBhdHRlcm5zLnNvbWUoKHApID0+IHAudGVzdCh1cmwpKTtcbiAgICB9XG4gICAgYXN5bmMgc2NyYXBlSm9iTGlzdGluZygpIHtcbiAgICAgICAgLy8gV2FpdCBmb3Igam9iIGRldGFpbHMgdG8gbG9hZFxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy53YWl0Rm9yRWxlbWVudCgnLmpvYi1kZXRhaWxzLWpvYnMtdW5pZmllZC10b3AtY2FyZF9fam9iLXRpdGxlLCAuam9icy11bmlmaWVkLXRvcC1jYXJkX19qb2ItdGl0bGUnLCAzMDAwKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCB7XG4gICAgICAgICAgICAvLyBUcnkgYWx0ZXJuYXRpdmUgc2VsZWN0b3JzXG4gICAgICAgIH1cbiAgICAgICAgLy8gVHJ5IG11bHRpcGxlIHNlbGVjdG9yIHN0cmF0ZWdpZXMgKExpbmtlZEluIGNoYW5nZXMgRE9NIGZyZXF1ZW50bHkpXG4gICAgICAgIGNvbnN0IHRpdGxlID0gdGhpcy5leHRyYWN0Sm9iVGl0bGUoKTtcbiAgICAgICAgY29uc3QgY29tcGFueSA9IHRoaXMuZXh0cmFjdENvbXBhbnkoKTtcbiAgICAgICAgY29uc3QgbG9jYXRpb24gPSB0aGlzLmV4dHJhY3RMb2NhdGlvbigpO1xuICAgICAgICBjb25zdCBkZXNjcmlwdGlvbiA9IHRoaXMuZXh0cmFjdERlc2NyaXB0aW9uKCk7XG4gICAgICAgIGlmICghdGl0bGUgfHwgIWNvbXBhbnkgfHwgIWRlc2NyaXB0aW9uKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW0NvbHVtYnVzXSBMaW5rZWRJbiBzY3JhcGVyOiBNaXNzaW5nIHJlcXVpcmVkIGZpZWxkcycsIHsgdGl0bGUsIGNvbXBhbnksIGRlc2NyaXB0aW9uOiAhIWRlc2NyaXB0aW9uIH0pO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVHJ5IHRvIGV4dHJhY3QgZnJvbSBzdHJ1Y3R1cmVkIGRhdGFcbiAgICAgICAgY29uc3Qgc3RydWN0dXJlZERhdGEgPSB0aGlzLmV4dHJhY3RTdHJ1Y3R1cmVkRGF0YSgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgICBjb21wYW55LFxuICAgICAgICAgICAgbG9jYXRpb246IGxvY2F0aW9uIHx8IHN0cnVjdHVyZWREYXRhPy5sb2NhdGlvbixcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgcmVxdWlyZW1lbnRzOiB0aGlzLmV4dHJhY3RSZXF1aXJlbWVudHMoZGVzY3JpcHRpb24pLFxuICAgICAgICAgICAga2V5d29yZHM6IHRoaXMuZXh0cmFjdEtleXdvcmRzKGRlc2NyaXB0aW9uKSxcbiAgICAgICAgICAgIHNhbGFyeTogdGhpcy5leHRyYWN0U2FsYXJ5KGRlc2NyaXB0aW9uKSB8fCBzdHJ1Y3R1cmVkRGF0YT8uc2FsYXJ5LFxuICAgICAgICAgICAgdHlwZTogdGhpcy5kZXRlY3RKb2JUeXBlKGRlc2NyaXB0aW9uKSxcbiAgICAgICAgICAgIHJlbW90ZTogdGhpcy5kZXRlY3RSZW1vdGUobG9jYXRpb24gfHwgJycpIHx8IHRoaXMuZGV0ZWN0UmVtb3RlKGRlc2NyaXB0aW9uKSxcbiAgICAgICAgICAgIHVybDogd2luZG93LmxvY2F0aW9uLmhyZWYsXG4gICAgICAgICAgICBzb3VyY2U6IHRoaXMuc291cmNlLFxuICAgICAgICAgICAgc291cmNlSm9iSWQ6IHRoaXMuZXh0cmFjdEpvYklkKCksXG4gICAgICAgICAgICBwb3N0ZWRBdDogc3RydWN0dXJlZERhdGE/LnBvc3RlZEF0LFxuICAgICAgICB9O1xuICAgIH1cbiAgICBhc3luYyBzY3JhcGVKb2JMaXN0KCkge1xuICAgICAgICBjb25zdCBqb2JzID0gW107XG4gICAgICAgIC8vIEpvYiBjYXJkcyBpbiBzZWFyY2ggcmVzdWx0c1xuICAgICAgICBjb25zdCBqb2JDYXJkcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qb2ItY2FyZC1jb250YWluZXIsIC5qb2JzLXNlYXJjaC1yZXN1bHRzX19saXN0LWl0ZW0sIC5zY2FmZm9sZC1sYXlvdXRfX2xpc3QtaXRlbScpO1xuICAgICAgICBmb3IgKGNvbnN0IGNhcmQgb2Ygam9iQ2FyZHMpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdGl0bGVFbCA9IGNhcmQucXVlcnlTZWxlY3RvcignLmpvYi1jYXJkLWxpc3RfX3RpdGxlLCAuam9iLWNhcmQtY29udGFpbmVyX19saW5rLCBhW2RhdGEtY29udHJvbC1uYW1lPVwiam9iX2NhcmRfdGl0bGVcIl0nKTtcbiAgICAgICAgICAgICAgICBjb25zdCBjb21wYW55RWwgPSBjYXJkLnF1ZXJ5U2VsZWN0b3IoJy5qb2ItY2FyZC1jb250YWluZXJfX2NvbXBhbnktbmFtZSwgLmpvYi1jYXJkLWNvbnRhaW5lcl9fcHJpbWFyeS1kZXNjcmlwdGlvbicpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2F0aW9uRWwgPSBjYXJkLnF1ZXJ5U2VsZWN0b3IoJy5qb2ItY2FyZC1jb250YWluZXJfX21ldGFkYXRhLWl0ZW0nKTtcbiAgICAgICAgICAgICAgICBjb25zdCB0aXRsZSA9IHRpdGxlRWw/LnRleHRDb250ZW50Py50cmltKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgY29tcGFueSA9IGNvbXBhbnlFbD8udGV4dENvbnRlbnQ/LnRyaW0oKTtcbiAgICAgICAgICAgICAgICBjb25zdCBsb2NhdGlvbiA9IGxvY2F0aW9uRWw/LnRleHRDb250ZW50Py50cmltKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgdXJsID0gdGl0bGVFbD8uaHJlZjtcbiAgICAgICAgICAgICAgICBpZiAodGl0bGUgJiYgY29tcGFueSAmJiB1cmwpIHtcbiAgICAgICAgICAgICAgICAgICAgam9icy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGFueSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICcnLCAvLyBXb3VsZCBuZWVkIHRvIG5hdmlnYXRlIHRvIGdldCBmdWxsIGRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICByZXF1aXJlbWVudHM6IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsLFxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiB0aGlzLnNvdXJjZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tDb2x1bWJ1c10gRXJyb3Igc2NyYXBpbmcgam9iIGNhcmQ6JywgZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gam9icztcbiAgICB9XG4gICAgZXh0cmFjdEpvYlRpdGxlKCkge1xuICAgICAgICBjb25zdCBzZWxlY3RvcnMgPSBbXG4gICAgICAgICAgICAnLmpvYi1kZXRhaWxzLWpvYnMtdW5pZmllZC10b3AtY2FyZF9fam9iLXRpdGxlJyxcbiAgICAgICAgICAgICcuam9icy11bmlmaWVkLXRvcC1jYXJkX19qb2ItdGl0bGUnLFxuICAgICAgICAgICAgJy50LTI0LmpvYi1kZXRhaWxzLWpvYnMtdW5pZmllZC10b3AtY2FyZF9fam9iLXRpdGxlJyxcbiAgICAgICAgICAgICdoMS50LTI0JyxcbiAgICAgICAgICAgICcuam9icy10b3AtY2FyZF9fam9iLXRpdGxlJyxcbiAgICAgICAgICAgICdoMVtjbGFzcyo9XCJqb2ItdGl0bGVcIl0nLFxuICAgICAgICBdO1xuICAgICAgICBmb3IgKGNvbnN0IHNlbGVjdG9yIG9mIHNlbGVjdG9ycykge1xuICAgICAgICAgICAgY29uc3QgdGV4dCA9IHRoaXMuZXh0cmFjdFRleHRDb250ZW50KHNlbGVjdG9yKTtcbiAgICAgICAgICAgIGlmICh0ZXh0KVxuICAgICAgICAgICAgICAgIHJldHVybiB0ZXh0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBleHRyYWN0Q29tcGFueSgpIHtcbiAgICAgICAgY29uc3Qgc2VsZWN0b3JzID0gW1xuICAgICAgICAgICAgJy5qb2ItZGV0YWlscy1qb2JzLXVuaWZpZWQtdG9wLWNhcmRfX2NvbXBhbnktbmFtZScsXG4gICAgICAgICAgICAnLmpvYnMtdW5pZmllZC10b3AtY2FyZF9fY29tcGFueS1uYW1lJyxcbiAgICAgICAgICAgICcuam9icy10b3AtY2FyZF9fY29tcGFueS11cmwnLFxuICAgICAgICAgICAgJ2FbZGF0YS10cmFja2luZy1jb250cm9sLW5hbWU9XCJwdWJsaWNfam9ic190b3BjYXJkLW9yZy1uYW1lXCJdJyxcbiAgICAgICAgICAgICcuam9iLWRldGFpbHMtam9icy11bmlmaWVkLXRvcC1jYXJkX19wcmltYXJ5LWRlc2NyaXB0aW9uLWNvbnRhaW5lciBhJyxcbiAgICAgICAgXTtcbiAgICAgICAgZm9yIChjb25zdCBzZWxlY3RvciBvZiBzZWxlY3RvcnMpIHtcbiAgICAgICAgICAgIGNvbnN0IHRleHQgPSB0aGlzLmV4dHJhY3RUZXh0Q29udGVudChzZWxlY3Rvcik7XG4gICAgICAgICAgICBpZiAodGV4dClcbiAgICAgICAgICAgICAgICByZXR1cm4gdGV4dDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZXh0cmFjdExvY2F0aW9uKCkge1xuICAgICAgICBjb25zdCBzZWxlY3RvcnMgPSBbXG4gICAgICAgICAgICAnLmpvYi1kZXRhaWxzLWpvYnMtdW5pZmllZC10b3AtY2FyZF9fYnVsbGV0JyxcbiAgICAgICAgICAgICcuam9icy11bmlmaWVkLXRvcC1jYXJkX19idWxsZXQnLFxuICAgICAgICAgICAgJy5qb2JzLXRvcC1jYXJkX19idWxsZXQnLFxuICAgICAgICAgICAgJy5qb2ItZGV0YWlscy1qb2JzLXVuaWZpZWQtdG9wLWNhcmRfX3ByaW1hcnktZGVzY3JpcHRpb24tY29udGFpbmVyIC50LWJsYWNrLS1saWdodCcsXG4gICAgICAgIF07XG4gICAgICAgIGZvciAoY29uc3Qgc2VsZWN0b3Igb2Ygc2VsZWN0b3JzKSB7XG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0gdGhpcy5leHRyYWN0VGV4dENvbnRlbnQoc2VsZWN0b3IpO1xuICAgICAgICAgICAgaWYgKHRleHQgJiYgIXRleHQuaW5jbHVkZXMoJ2FwcGxpY2FudCcpICYmICF0ZXh0LmluY2x1ZGVzKCdhZ28nKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0ZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBleHRyYWN0RGVzY3JpcHRpb24oKSB7XG4gICAgICAgIGNvbnN0IHNlbGVjdG9ycyA9IFtcbiAgICAgICAgICAgICcuam9icy1kZXNjcmlwdGlvbl9fY29udGVudCcsXG4gICAgICAgICAgICAnLmpvYnMtZGVzY3JpcHRpb24tY29udGVudF9fdGV4dCcsXG4gICAgICAgICAgICAnLmpvYnMtYm94X19odG1sLWNvbnRlbnQnLFxuICAgICAgICAgICAgJyNqb2ItZGV0YWlscycsXG4gICAgICAgICAgICAnLmpvYnMtZGVzY3JpcHRpb24nLFxuICAgICAgICBdO1xuICAgICAgICBmb3IgKGNvbnN0IHNlbGVjdG9yIG9mIHNlbGVjdG9ycykge1xuICAgICAgICAgICAgY29uc3QgaHRtbCA9IHRoaXMuZXh0cmFjdEh0bWxDb250ZW50KHNlbGVjdG9yKTtcbiAgICAgICAgICAgIGlmIChodG1sKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2xlYW5EZXNjcmlwdGlvbihodG1sKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZXh0cmFjdEpvYklkKCkge1xuICAgICAgICBjb25zdCBtYXRjaCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLm1hdGNoKC9cXC92aWV3XFwvKFxcZCspLyk7XG4gICAgICAgIHJldHVybiBtYXRjaD8uWzFdO1xuICAgIH1cbiAgICBleHRyYWN0U3RydWN0dXJlZERhdGEoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBsZEpzb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdzY3JpcHRbdHlwZT1cImFwcGxpY2F0aW9uL2xkK2pzb25cIl0nKTtcbiAgICAgICAgICAgIGlmICghbGRKc29uPy50ZXh0Q29udGVudClcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKGxkSnNvbi50ZXh0Q29udGVudCk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGxvY2F0aW9uOiBkYXRhLmpvYkxvY2F0aW9uPy5hZGRyZXNzPy5hZGRyZXNzTG9jYWxpdHksXG4gICAgICAgICAgICAgICAgc2FsYXJ5OiBkYXRhLmJhc2VTYWxhcnk/LnZhbHVlXG4gICAgICAgICAgICAgICAgICAgID8gYCQke2RhdGEuYmFzZVNhbGFyeS52YWx1ZS5taW5WYWx1ZSB8fCAnJ30tJHtkYXRhLmJhc2VTYWxhcnkudmFsdWUubWF4VmFsdWUgfHwgJyd9YFxuICAgICAgICAgICAgICAgICAgICA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICBwb3N0ZWRBdDogZGF0YS5kYXRlUG9zdGVkLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vIFdhdGVybG9vIFdvcmtzIGpvYiBzY3JhcGVyIChVbml2ZXJzaXR5IG9mIFdhdGVybG9vIGNvLW9wIHBvcnRhbClcbmltcG9ydCB7IEJhc2VTY3JhcGVyIH0gZnJvbSAnLi9iYXNlLXNjcmFwZXInO1xuZXhwb3J0IGNsYXNzIFdhdGVybG9vV29ya3NTY3JhcGVyIGV4dGVuZHMgQmFzZVNjcmFwZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlciguLi5hcmd1bWVudHMpO1xuICAgICAgICB0aGlzLnNvdXJjZSA9ICd3YXRlcmxvb3dvcmtzJztcbiAgICAgICAgdGhpcy51cmxQYXR0ZXJucyA9IFsvd2F0ZXJsb293b3Jrc1xcLnV3YXRlcmxvb1xcLmNhL107XG4gICAgfVxuICAgIGNhbkhhbmRsZSh1cmwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudXJsUGF0dGVybnMuc29tZSgocCkgPT4gcC50ZXN0KHVybCkpO1xuICAgIH1cbiAgICBhc3luYyBzY3JhcGVKb2JMaXN0aW5nKCkge1xuICAgICAgICAvLyBDaGVjayBpZiB1c2VyIGlzIGxvZ2dlZCBpblxuICAgICAgICBpZiAodGhpcy5pc0xvZ2luUGFnZSgpKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW0NvbHVtYnVzXSBXYXRlcmxvbyBXb3JrczogUGxlYXNlIGxvZyBpbiBmaXJzdCcpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgLy8gV2FpdCBmb3Igam9iIGRldGFpbHMgdG8gbG9hZFxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy53YWl0Rm9yRWxlbWVudCgnLnBvc3RpbmctZGV0YWlscywgLmpvYi1wb3N0aW5nLWRldGFpbHMsICNwb3N0aW5nRGl2JywgMzAwMCk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2gge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tDb2x1bWJ1c10gV2F0ZXJsb28gV29ya3M6IENvdWxkIG5vdCBmaW5kIGpvYiBkZXRhaWxzJyk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0aXRsZSA9IHRoaXMuZXh0cmFjdEpvYlRpdGxlKCk7XG4gICAgICAgIGNvbnN0IGNvbXBhbnkgPSB0aGlzLmV4dHJhY3RDb21wYW55KCk7XG4gICAgICAgIGNvbnN0IGRlc2NyaXB0aW9uID0gdGhpcy5leHRyYWN0RGVzY3JpcHRpb24oKTtcbiAgICAgICAgaWYgKCF0aXRsZSB8fCAhY29tcGFueSB8fCAhZGVzY3JpcHRpb24pIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbQ29sdW1idXNdIFdhdGVybG9vIFdvcmtzIHNjcmFwZXI6IE1pc3NpbmcgcmVxdWlyZWQgZmllbGRzJyk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBsb2NhdGlvbiA9IHRoaXMuZXh0cmFjdExvY2F0aW9uKCk7XG4gICAgICAgIGNvbnN0IGRlYWRsaW5lID0gdGhpcy5leHRyYWN0RGVhZGxpbmUoKTtcbiAgICAgICAgY29uc3QgZGV0YWlscyA9IHRoaXMuZXh0cmFjdERldGFpbHNUYWJsZSgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgICBjb21wYW55LFxuICAgICAgICAgICAgbG9jYXRpb246IGxvY2F0aW9uIHx8IGRldGFpbHMubG9jYXRpb24sXG4gICAgICAgICAgICBkZXNjcmlwdGlvbixcbiAgICAgICAgICAgIHJlcXVpcmVtZW50czogdGhpcy5leHRyYWN0UmVxdWlyZW1lbnRzKGRlc2NyaXB0aW9uKSxcbiAgICAgICAgICAgIGtleXdvcmRzOiB0aGlzLmV4dHJhY3RLZXl3b3JkcyhkZXNjcmlwdGlvbiksXG4gICAgICAgICAgICBzYWxhcnk6IGRldGFpbHMuc2FsYXJ5LFxuICAgICAgICAgICAgdHlwZTogJ2ludGVybnNoaXAnLCAvLyBXYXRlcmxvbyBXb3JrcyBpcyBmb3IgY28tb3AvaW50ZXJuc2hpcHNcbiAgICAgICAgICAgIHJlbW90ZTogdGhpcy5kZXRlY3RSZW1vdGUobG9jYXRpb24gfHwgJycpIHx8IHRoaXMuZGV0ZWN0UmVtb3RlKGRlc2NyaXB0aW9uKSxcbiAgICAgICAgICAgIHVybDogd2luZG93LmxvY2F0aW9uLmhyZWYsXG4gICAgICAgICAgICBzb3VyY2U6IHRoaXMuc291cmNlLFxuICAgICAgICAgICAgc291cmNlSm9iSWQ6IGRldGFpbHMuam9iSWQsXG4gICAgICAgICAgICBkZWFkbGluZSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgYXN5bmMgc2NyYXBlSm9iTGlzdCgpIHtcbiAgICAgICAgY29uc3Qgam9icyA9IFtdO1xuICAgICAgICAvLyBDaGVjayBpZiBsb2dnZWQgaW5cbiAgICAgICAgaWYgKHRoaXMuaXNMb2dpblBhZ2UoKSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tDb2x1bWJ1c10gV2F0ZXJsb28gV29ya3M6IFBsZWFzZSBsb2cgaW4gdG8gc2NyYXBlIGpvYiBsaXN0Jyk7XG4gICAgICAgICAgICByZXR1cm4gam9icztcbiAgICAgICAgfVxuICAgICAgICAvLyBKb2IgbGlzdGluZ3MgYXJlIHR5cGljYWxseSBpbiBhIHRhYmxlXG4gICAgICAgIGNvbnN0IHJvd3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuam9iLWxpc3RpbmctdGFibGUgdGJvZHkgdHIsICNwb3N0aW5nc1RhYmxlIHRib2R5IHRyLCAub3JiaXNNb2R1bGVCb2R5IHRhYmxlIHRib2R5IHRyJyk7XG4gICAgICAgIGZvciAoY29uc3Qgcm93IG9mIHJvd3MpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2VsbHMgPSByb3cucXVlcnlTZWxlY3RvckFsbCgndGQnKTtcbiAgICAgICAgICAgICAgICBpZiAoY2VsbHMubGVuZ3RoIDwgMylcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgLy8gVHlwaWNhbCBzdHJ1Y3R1cmU6IEpvYiBUaXRsZSB8IENvbXBhbnkgfCBMb2NhdGlvbiB8IERlYWRsaW5lIHwgLi4uXG4gICAgICAgICAgICAgICAgY29uc3QgdGl0bGVDZWxsID0gY2VsbHNbMF07XG4gICAgICAgICAgICAgICAgY29uc3QgdGl0bGVMaW5rID0gdGl0bGVDZWxsLnF1ZXJ5U2VsZWN0b3IoJ2EnKTtcbiAgICAgICAgICAgICAgICBjb25zdCB0aXRsZSA9IHRpdGxlTGluaz8udGV4dENvbnRlbnQ/LnRyaW0oKSB8fCB0aXRsZUNlbGwudGV4dENvbnRlbnQ/LnRyaW0oKTtcbiAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSB0aXRsZUxpbms/LmhyZWY7XG4gICAgICAgICAgICAgICAgY29uc3QgY29tcGFueSA9IGNlbGxzWzFdPy50ZXh0Q29udGVudD8udHJpbSgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2F0aW9uID0gY2VsbHNbMl0/LnRleHRDb250ZW50Py50cmltKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgZGVhZGxpbmUgPSBjZWxsc1szXT8udGV4dENvbnRlbnQ/LnRyaW0oKTtcbiAgICAgICAgICAgICAgICBpZiAodGl0bGUgJiYgY29tcGFueSAmJiB1cmwpIHtcbiAgICAgICAgICAgICAgICAgICAgam9icy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGFueSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICcnLCAvLyBOZWVkIHRvIG5hdmlnYXRlIGZvciBmdWxsIGRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICByZXF1aXJlbWVudHM6IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsLFxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiB0aGlzLnNvdXJjZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdpbnRlcm5zaGlwJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlYWRsaW5lLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignW0NvbHVtYnVzXSBFcnJvciBzY3JhcGluZyBXYXRlcmxvbyBXb3JrcyByb3c6JywgZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBBbHNvIHRyeSBjYXJkLWJhc2VkIGxheW91dHMgKG5ld2VyIFVJKVxuICAgICAgICBjb25zdCBjYXJkcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qb2ItY2FyZCwgLnBvc3RpbmctY2FyZCwgW2NsYXNzKj1cInBvc3RpbmctaXRlbVwiXScpO1xuICAgICAgICBmb3IgKGNvbnN0IGNhcmQgb2YgY2FyZHMpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdGl0bGVFbCA9IGNhcmQucXVlcnlTZWxlY3RvcignLmpvYi10aXRsZSwgLnBvc3RpbmctdGl0bGUsIGgzLCBoNCcpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbXBhbnlFbCA9IGNhcmQucXVlcnlTZWxlY3RvcignLmVtcGxveWVyLW5hbWUsIC5jb21wYW55LW5hbWUsIFtjbGFzcyo9XCJlbXBsb3llclwiXScpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2F0aW9uRWwgPSBjYXJkLnF1ZXJ5U2VsZWN0b3IoJy5qb2ItbG9jYXRpb24sIC5sb2NhdGlvbiwgW2NsYXNzKj1cImxvY2F0aW9uXCJdJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgbGlua0VsID0gY2FyZC5xdWVyeVNlbGVjdG9yKCdhW2hyZWYqPVwicG9zdGluZ1wiXScpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRpdGxlID0gdGl0bGVFbD8udGV4dENvbnRlbnQ/LnRyaW0oKTtcbiAgICAgICAgICAgICAgICBjb25zdCBjb21wYW55ID0gY29tcGFueUVsPy50ZXh0Q29udGVudD8udHJpbSgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2F0aW9uID0gbG9jYXRpb25FbD8udGV4dENvbnRlbnQ/LnRyaW0oKTtcbiAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSBsaW5rRWw/LmhyZWY7XG4gICAgICAgICAgICAgICAgaWYgKHRpdGxlICYmIGNvbXBhbnkgJiYgdXJsKSB7XG4gICAgICAgICAgICAgICAgICAgIGpvYnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBhbnksXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmVtZW50czogW10sXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmwsXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IHRoaXMuc291cmNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2ludGVybnNoaXAnLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignW0NvbHVtYnVzXSBFcnJvciBzY3JhcGluZyBXYXRlcmxvbyBXb3JrcyBjYXJkOicsIGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGpvYnM7XG4gICAgfVxuICAgIGlzTG9naW5QYWdlKCkge1xuICAgICAgICBjb25zdCB1cmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZi50b0xvd2VyQ2FzZSgpO1xuICAgICAgICByZXR1cm4gKHVybC5pbmNsdWRlcygnbG9naW4nKSB8fFxuICAgICAgICAgICAgdXJsLmluY2x1ZGVzKCdzaWduaW4nKSB8fFxuICAgICAgICAgICAgdXJsLmluY2x1ZGVzKCdjYXMvJykgfHxcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W3R5cGU9XCJwYXNzd29yZFwiXScpICE9PSBudWxsKTtcbiAgICB9XG4gICAgZXh0cmFjdEpvYlRpdGxlKCkge1xuICAgICAgICBjb25zdCBzZWxlY3RvcnMgPSBbXG4gICAgICAgICAgICAnLnBvc3RpbmctdGl0bGUnLFxuICAgICAgICAgICAgJy5qb2ItdGl0bGUnLFxuICAgICAgICAgICAgJyNwb3N0aW5nRGl2IGgxJyxcbiAgICAgICAgICAgICcuam9iLXBvc3RpbmctZGV0YWlscyBoMScsXG4gICAgICAgICAgICAnW2NsYXNzKj1cInBvc3RpbmdcIl0gaDEnLFxuICAgICAgICAgICAgJ2gxJyxcbiAgICAgICAgXTtcbiAgICAgICAgZm9yIChjb25zdCBzZWxlY3RvciBvZiBzZWxlY3RvcnMpIHtcbiAgICAgICAgICAgIGNvbnN0IHRleHQgPSB0aGlzLmV4dHJhY3RUZXh0Q29udGVudChzZWxlY3Rvcik7XG4gICAgICAgICAgICBpZiAodGV4dCAmJiB0ZXh0Lmxlbmd0aCA+IDMgJiYgdGV4dC5sZW5ndGggPCAyMDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZXh0cmFjdENvbXBhbnkoKSB7XG4gICAgICAgIGNvbnN0IHNlbGVjdG9ycyA9IFtcbiAgICAgICAgICAgICcuZW1wbG95ZXItbmFtZScsXG4gICAgICAgICAgICAnLmNvbXBhbnktbmFtZScsXG4gICAgICAgICAgICAnLm9yZ2FuaXphdGlvbi1uYW1lJyxcbiAgICAgICAgICAgICdbY2xhc3MqPVwiZW1wbG95ZXJcIl0nLFxuICAgICAgICAgICAgJ3RkOmNvbnRhaW5zKFwiT3JnYW5pemF0aW9uXCIpICsgdGQnLFxuICAgICAgICAgICAgJ3RoOmNvbnRhaW5zKFwiT3JnYW5pemF0aW9uXCIpICsgdGQnLFxuICAgICAgICBdO1xuICAgICAgICBmb3IgKGNvbnN0IHNlbGVjdG9yIG9mIHNlbGVjdG9ycykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCB0ZXh0ID0gdGhpcy5leHRyYWN0VGV4dENvbnRlbnQoc2VsZWN0b3IpO1xuICAgICAgICAgICAgICAgIGlmICh0ZXh0ICYmIHRleHQubGVuZ3RoID4gMSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCB7XG4gICAgICAgICAgICAgICAgLy8gU2VsZWN0b3IgbWlnaHQgYmUgaW52YWxpZFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIFRyeSB0YWJsZS1iYXNlZCBleHRyYWN0aW9uXG4gICAgICAgIGNvbnN0IHJvd3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCd0ciwgLmRldGFpbC1yb3cnKTtcbiAgICAgICAgZm9yIChjb25zdCByb3cgb2Ygcm93cykge1xuICAgICAgICAgICAgY29uc3QgdGV4dCA9IHJvdy50ZXh0Q29udGVudD8udG9Mb3dlckNhc2UoKSB8fCAnJztcbiAgICAgICAgICAgIGlmICh0ZXh0LmluY2x1ZGVzKCdvcmdhbml6YXRpb24nKSB8fCB0ZXh0LmluY2x1ZGVzKCdlbXBsb3llcicpIHx8IHRleHQuaW5jbHVkZXMoJ2NvbXBhbnknKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNlbGxzID0gcm93LnF1ZXJ5U2VsZWN0b3JBbGwoJ3RkLCAudmFsdWUsIGRkJyk7XG4gICAgICAgICAgICAgICAgaWYgKGNlbGxzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBjZWxsc1tjZWxscy5sZW5ndGggLSAxXS50ZXh0Q29udGVudD8udHJpbSgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUgJiYgdmFsdWUubGVuZ3RoID4gMSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGV4dHJhY3RMb2NhdGlvbigpIHtcbiAgICAgICAgY29uc3Qgc2VsZWN0b3JzID0gW1xuICAgICAgICAgICAgJy5qb2ItbG9jYXRpb24nLFxuICAgICAgICAgICAgJy5sb2NhdGlvbicsXG4gICAgICAgICAgICAnW2NsYXNzKj1cImxvY2F0aW9uXCJdJyxcbiAgICAgICAgXTtcbiAgICAgICAgZm9yIChjb25zdCBzZWxlY3RvciBvZiBzZWxlY3RvcnMpIHtcbiAgICAgICAgICAgIGNvbnN0IHRleHQgPSB0aGlzLmV4dHJhY3RUZXh0Q29udGVudChzZWxlY3Rvcik7XG4gICAgICAgICAgICBpZiAodGV4dClcbiAgICAgICAgICAgICAgICByZXR1cm4gdGV4dDtcbiAgICAgICAgfVxuICAgICAgICAvLyBUcnkgdGFibGUtYmFzZWQgZXh0cmFjdGlvblxuICAgICAgICBjb25zdCByb3dzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgndHIsIC5kZXRhaWwtcm93Jyk7XG4gICAgICAgIGZvciAoY29uc3Qgcm93IG9mIHJvd3MpIHtcbiAgICAgICAgICAgIGNvbnN0IHRleHQgPSByb3cudGV4dENvbnRlbnQ/LnRvTG93ZXJDYXNlKCkgfHwgJyc7XG4gICAgICAgICAgICBpZiAodGV4dC5pbmNsdWRlcygnbG9jYXRpb24nKSB8fCB0ZXh0LmluY2x1ZGVzKCdjaXR5JykgfHwgdGV4dC5pbmNsdWRlcygncmVnaW9uJykpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjZWxscyA9IHJvdy5xdWVyeVNlbGVjdG9yQWxsKCd0ZCwgLnZhbHVlLCBkZCcpO1xuICAgICAgICAgICAgICAgIGlmIChjZWxscy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gY2VsbHNbY2VsbHMubGVuZ3RoIC0gMV0udGV4dENvbnRlbnQ/LnRyaW0oKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZXh0cmFjdERlc2NyaXB0aW9uKCkge1xuICAgICAgICBjb25zdCBzZWxlY3RvcnMgPSBbXG4gICAgICAgICAgICAnLmpvYi1kZXNjcmlwdGlvbicsXG4gICAgICAgICAgICAnLnBvc3RpbmctZGVzY3JpcHRpb24nLFxuICAgICAgICAgICAgJyNwb3N0aW5nRGl2IC5kZXNjcmlwdGlvbicsXG4gICAgICAgICAgICAnLmpvYi1wb3N0aW5nLWRldGFpbHMgLmRlc2NyaXB0aW9uJyxcbiAgICAgICAgICAgICdbY2xhc3MqPVwiZGVzY3JpcHRpb25cIl0nLFxuICAgICAgICBdO1xuICAgICAgICBmb3IgKGNvbnN0IHNlbGVjdG9yIG9mIHNlbGVjdG9ycykge1xuICAgICAgICAgICAgY29uc3QgaHRtbCA9IHRoaXMuZXh0cmFjdEh0bWxDb250ZW50KHNlbGVjdG9yKTtcbiAgICAgICAgICAgIGlmIChodG1sICYmIGh0bWwubGVuZ3RoID4gNTApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jbGVhbkRlc2NyaXB0aW9uKGh0bWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIFRyeSB0byBmaW5kIHRoZSBtYWluIGNvbnRlbnQgYXJlYVxuICAgICAgICBjb25zdCBtYWluQ29udGVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wb3N0aW5nLWRldGFpbHMsICNwb3N0aW5nRGl2LCAuam9iLXBvc3RpbmctZGV0YWlscycpO1xuICAgICAgICBpZiAobWFpbkNvbnRlbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IGh0bWwgPSBtYWluQ29udGVudC5pbm5lckhUTUw7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jbGVhbkRlc2NyaXB0aW9uKGh0bWwpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBleHRyYWN0RGVhZGxpbmUoKSB7XG4gICAgICAgIGNvbnN0IHNlbGVjdG9ycyA9IFtcbiAgICAgICAgICAgICcuYXBwbGljYXRpb24tZGVhZGxpbmUnLFxuICAgICAgICAgICAgJy5kZWFkbGluZScsXG4gICAgICAgICAgICAnW2NsYXNzKj1cImRlYWRsaW5lXCJdJyxcbiAgICAgICAgXTtcbiAgICAgICAgZm9yIChjb25zdCBzZWxlY3RvciBvZiBzZWxlY3RvcnMpIHtcbiAgICAgICAgICAgIGNvbnN0IHRleHQgPSB0aGlzLmV4dHJhY3RUZXh0Q29udGVudChzZWxlY3Rvcik7XG4gICAgICAgICAgICBpZiAodGV4dClcbiAgICAgICAgICAgICAgICByZXR1cm4gdGV4dDtcbiAgICAgICAgfVxuICAgICAgICAvLyBUcnkgdGFibGUtYmFzZWQgZXh0cmFjdGlvblxuICAgICAgICBjb25zdCByb3dzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgndHIsIC5kZXRhaWwtcm93Jyk7XG4gICAgICAgIGZvciAoY29uc3Qgcm93IG9mIHJvd3MpIHtcbiAgICAgICAgICAgIGNvbnN0IHRleHQgPSByb3cudGV4dENvbnRlbnQ/LnRvTG93ZXJDYXNlKCkgfHwgJyc7XG4gICAgICAgICAgICBpZiAodGV4dC5pbmNsdWRlcygnZGVhZGxpbmUnKSB8fCB0ZXh0LmluY2x1ZGVzKCdhcHBseSBieScpIHx8IHRleHQuaW5jbHVkZXMoJ2R1ZScpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2VsbHMgPSByb3cucXVlcnlTZWxlY3RvckFsbCgndGQsIC52YWx1ZSwgZGQnKTtcbiAgICAgICAgICAgICAgICBpZiAoY2VsbHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGNlbGxzW2NlbGxzLmxlbmd0aCAtIDFdLnRleHRDb250ZW50Py50cmltKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgZXh0cmFjdERldGFpbHNUYWJsZSgpIHtcbiAgICAgICAgY29uc3QgZGV0YWlscyA9IHt9O1xuICAgICAgICBjb25zdCByb3dzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgndHIsIC5kZXRhaWwtcm93LCBkdCcpO1xuICAgICAgICBmb3IgKGNvbnN0IHJvdyBvZiByb3dzKSB7XG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0gcm93LnRleHRDb250ZW50Py50b0xvd2VyQ2FzZSgpIHx8ICcnO1xuICAgICAgICAgICAgbGV0IGxhYmVsID0gbnVsbDtcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IG51bGw7XG4gICAgICAgICAgICAvLyBIYW5kbGUgZHQvZGQgcGFpcnNcbiAgICAgICAgICAgIGlmIChyb3cudGFnTmFtZSA9PT0gJ0RUJykge1xuICAgICAgICAgICAgICAgIGxhYmVsID0gcm93LnRleHRDb250ZW50Py50cmltKCkgfHwgbnVsbDtcbiAgICAgICAgICAgICAgICBjb25zdCBkZCA9IHJvdy5uZXh0RWxlbWVudFNpYmxpbmc7XG4gICAgICAgICAgICAgICAgaWYgKGRkPy50YWdOYW1lID09PSAnREQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gZGQudGV4dENvbnRlbnQ/LnRyaW0oKSB8fCBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIEhhbmRsZSB0YWJsZSByb3dzXG4gICAgICAgICAgICAgICAgY29uc3QgY2VsbHMgPSByb3cucXVlcnlTZWxlY3RvckFsbCgndGQsIHRoJyk7XG4gICAgICAgICAgICAgICAgaWYgKGNlbGxzLmxlbmd0aCA+PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsID0gY2VsbHNbMF0udGV4dENvbnRlbnQ/LnRyaW0oKT8udG9Mb3dlckNhc2UoKSB8fCBudWxsO1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IGNlbGxzWzFdLnRleHRDb250ZW50Py50cmltKCkgfHwgbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobGFiZWwgJiYgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZiAobGFiZWwuaW5jbHVkZXMoJ2pvYiBpZCcpIHx8IGxhYmVsLmluY2x1ZGVzKCdwb3N0aW5nIGlkJykpIHtcbiAgICAgICAgICAgICAgICAgICAgZGV0YWlscy5qb2JJZCA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobGFiZWwuaW5jbHVkZXMoJ2xvY2F0aW9uJykgfHwgbGFiZWwuaW5jbHVkZXMoJ2NpdHknKSkge1xuICAgICAgICAgICAgICAgICAgICBkZXRhaWxzLmxvY2F0aW9uID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChsYWJlbC5pbmNsdWRlcygnc2FsYXJ5JykgfHwgbGFiZWwuaW5jbHVkZXMoJ2NvbXBlbnNhdGlvbicpIHx8IGxhYmVsLmluY2x1ZGVzKCdwYXknKSkge1xuICAgICAgICAgICAgICAgICAgICBkZXRhaWxzLnNhbGFyeSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGV0YWlscztcbiAgICB9XG59XG4iLCIvLyBJbmRlZWQgam9iIHNjcmFwZXJcbmltcG9ydCB7IEJhc2VTY3JhcGVyIH0gZnJvbSAnLi9iYXNlLXNjcmFwZXInO1xuZXhwb3J0IGNsYXNzIEluZGVlZFNjcmFwZXIgZXh0ZW5kcyBCYXNlU2NyYXBlciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKC4uLmFyZ3VtZW50cyk7XG4gICAgICAgIHRoaXMuc291cmNlID0gJ2luZGVlZCc7XG4gICAgICAgIHRoaXMudXJsUGF0dGVybnMgPSBbXG4gICAgICAgICAgICAvaW5kZWVkXFwuY29tXFwvdmlld2pvYi8sXG4gICAgICAgICAgICAvaW5kZWVkXFwuY29tXFwvam9ic1xcLy8sXG4gICAgICAgICAgICAvaW5kZWVkXFwuY29tXFwvam9iXFwvLyxcbiAgICAgICAgICAgIC9pbmRlZWRcXC5jb21cXC9yY1xcL2Nsay8sXG4gICAgICAgIF07XG4gICAgfVxuICAgIGNhbkhhbmRsZSh1cmwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudXJsUGF0dGVybnMuc29tZSgocCkgPT4gcC50ZXN0KHVybCkpO1xuICAgIH1cbiAgICBhc3luYyBzY3JhcGVKb2JMaXN0aW5nKCkge1xuICAgICAgICAvLyBXYWl0IGZvciBqb2IgZGV0YWlscyB0byBsb2FkXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLndhaXRGb3JFbGVtZW50KCcuam9ic2VhcmNoLUpvYkluZm9IZWFkZXItdGl0bGUsIFtkYXRhLXRlc3RpZD1cImpvYnNlYXJjaC1Kb2JJbmZvSGVhZGVyLXRpdGxlXCJdJywgMzAwMCk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2gge1xuICAgICAgICAgICAgLy8gQ29udGludWUgd2l0aCBhdmFpbGFibGUgZGF0YVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRpdGxlID0gdGhpcy5leHRyYWN0Sm9iVGl0bGUoKTtcbiAgICAgICAgY29uc3QgY29tcGFueSA9IHRoaXMuZXh0cmFjdENvbXBhbnkoKTtcbiAgICAgICAgY29uc3QgbG9jYXRpb24gPSB0aGlzLmV4dHJhY3RMb2NhdGlvbigpO1xuICAgICAgICBjb25zdCBkZXNjcmlwdGlvbiA9IHRoaXMuZXh0cmFjdERlc2NyaXB0aW9uKCk7XG4gICAgICAgIGlmICghdGl0bGUgfHwgIWNvbXBhbnkgfHwgIWRlc2NyaXB0aW9uKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW0NvbHVtYnVzXSBJbmRlZWQgc2NyYXBlcjogTWlzc2luZyByZXF1aXJlZCBmaWVsZHMnLCB7IHRpdGxlLCBjb21wYW55LCBkZXNjcmlwdGlvbjogISFkZXNjcmlwdGlvbiB9KTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHN0cnVjdHVyZWREYXRhID0gdGhpcy5leHRyYWN0U3RydWN0dXJlZERhdGEoKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgICAgY29tcGFueSxcbiAgICAgICAgICAgIGxvY2F0aW9uOiBsb2NhdGlvbiB8fCBzdHJ1Y3R1cmVkRGF0YT8ubG9jYXRpb24sXG4gICAgICAgICAgICBkZXNjcmlwdGlvbixcbiAgICAgICAgICAgIHJlcXVpcmVtZW50czogdGhpcy5leHRyYWN0UmVxdWlyZW1lbnRzKGRlc2NyaXB0aW9uKSxcbiAgICAgICAgICAgIGtleXdvcmRzOiB0aGlzLmV4dHJhY3RLZXl3b3JkcyhkZXNjcmlwdGlvbiksXG4gICAgICAgICAgICBzYWxhcnk6IHRoaXMuZXh0cmFjdFNhbGFyeUZyb21QYWdlKCkgfHwgdGhpcy5leHRyYWN0U2FsYXJ5KGRlc2NyaXB0aW9uKSB8fCBzdHJ1Y3R1cmVkRGF0YT8uc2FsYXJ5LFxuICAgICAgICAgICAgdHlwZTogdGhpcy5kZXRlY3RKb2JUeXBlKGRlc2NyaXB0aW9uKSxcbiAgICAgICAgICAgIHJlbW90ZTogdGhpcy5kZXRlY3RSZW1vdGUobG9jYXRpb24gfHwgJycpIHx8IHRoaXMuZGV0ZWN0UmVtb3RlKGRlc2NyaXB0aW9uKSxcbiAgICAgICAgICAgIHVybDogd2luZG93LmxvY2F0aW9uLmhyZWYsXG4gICAgICAgICAgICBzb3VyY2U6IHRoaXMuc291cmNlLFxuICAgICAgICAgICAgc291cmNlSm9iSWQ6IHRoaXMuZXh0cmFjdEpvYklkKCksXG4gICAgICAgICAgICBwb3N0ZWRBdDogc3RydWN0dXJlZERhdGE/LnBvc3RlZEF0LFxuICAgICAgICB9O1xuICAgIH1cbiAgICBhc3luYyBzY3JhcGVKb2JMaXN0KCkge1xuICAgICAgICBjb25zdCBqb2JzID0gW107XG4gICAgICAgIC8vIEpvYiBjYXJkcyBpbiBzZWFyY2ggcmVzdWx0c1xuICAgICAgICBjb25zdCBqb2JDYXJkcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qb2Jfc2Vlbl9iZWFjb24sIC5qb2JzZWFyY2gtUmVzdWx0c0xpc3QgPiBsaSwgW2RhdGEtdGVzdGlkPVwiam9iLWNhcmRcIl0nKTtcbiAgICAgICAgZm9yIChjb25zdCBjYXJkIG9mIGpvYkNhcmRzKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRpdGxlRWwgPSBjYXJkLnF1ZXJ5U2VsZWN0b3IoJy5qb2JUaXRsZSwgW2RhdGEtdGVzdGlkPVwiam9iVGl0bGVcIl0sIGgyLmpvYlRpdGxlIGEsIC5qY3MtSm9iVGl0bGUnKTtcbiAgICAgICAgICAgICAgICBjb25zdCBjb21wYW55RWwgPSBjYXJkLnF1ZXJ5U2VsZWN0b3IoJy5jb21wYW55TmFtZSwgW2RhdGEtdGVzdGlkPVwiY29tcGFueS1uYW1lXCJdLCAuY29tcGFueV9sb2NhdGlvbiAuY29tcGFueU5hbWUnKTtcbiAgICAgICAgICAgICAgICBjb25zdCBsb2NhdGlvbkVsID0gY2FyZC5xdWVyeVNlbGVjdG9yKCcuY29tcGFueUxvY2F0aW9uLCBbZGF0YS10ZXN0aWQ9XCJ0ZXh0LWxvY2F0aW9uXCJdLCAuY29tcGFueV9sb2NhdGlvbiAuY29tcGFueUxvY2F0aW9uJyk7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2FsYXJ5RWwgPSBjYXJkLnF1ZXJ5U2VsZWN0b3IoJy5zYWxhcnktc25pcHBldC1jb250YWluZXIsIFtkYXRhLXRlc3RpZD1cImF0dHJpYnV0ZV9zbmlwcGV0X3Rlc3RpZFwiXSwgLmVzdGltYXRlZC1zYWxhcnknKTtcbiAgICAgICAgICAgICAgICBjb25zdCB0aXRsZSA9IHRpdGxlRWw/LnRleHRDb250ZW50Py50cmltKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgY29tcGFueSA9IGNvbXBhbnlFbD8udGV4dENvbnRlbnQ/LnRyaW0oKTtcbiAgICAgICAgICAgICAgICBjb25zdCBsb2NhdGlvbiA9IGxvY2F0aW9uRWw/LnRleHRDb250ZW50Py50cmltKCk7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2FsYXJ5ID0gc2FsYXJ5RWw/LnRleHRDb250ZW50Py50cmltKCk7XG4gICAgICAgICAgICAgICAgLy8gR2V0IFVSTCBmcm9tIHRpdGxlIGxpbmsgb3IgZGF0YSBhdHRyaWJ1dGVcbiAgICAgICAgICAgICAgICBsZXQgdXJsID0gdGl0bGVFbD8uaHJlZjtcbiAgICAgICAgICAgICAgICBpZiAoIXVybCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBqb2JLZXkgPSBjYXJkLmdldEF0dHJpYnV0ZSgnZGF0YS1qaycpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoam9iS2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cmwgPSBgaHR0cHM6Ly93d3cuaW5kZWVkLmNvbS92aWV3am9iP2prPSR7am9iS2V5fWA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRpdGxlICYmIGNvbXBhbnkgJiYgdXJsKSB7XG4gICAgICAgICAgICAgICAgICAgIGpvYnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBhbnksXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhbGFyeSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmVtZW50czogW10sXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmwsXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IHRoaXMuc291cmNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlSm9iSWQ6IHRoaXMuZXh0cmFjdEpvYklkRnJvbVVybCh1cmwpLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignW0NvbHVtYnVzXSBFcnJvciBzY3JhcGluZyBJbmRlZWQgam9iIGNhcmQ6JywgZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gam9icztcbiAgICB9XG4gICAgZXh0cmFjdEpvYlRpdGxlKCkge1xuICAgICAgICBjb25zdCBzZWxlY3RvcnMgPSBbXG4gICAgICAgICAgICAnLmpvYnNlYXJjaC1Kb2JJbmZvSGVhZGVyLXRpdGxlJyxcbiAgICAgICAgICAgICdbZGF0YS10ZXN0aWQ9XCJqb2JzZWFyY2gtSm9iSW5mb0hlYWRlci10aXRsZVwiXScsXG4gICAgICAgICAgICAnaDEuam9ic2VhcmNoLUpvYkluZm9IZWFkZXItdGl0bGUnLFxuICAgICAgICAgICAgJy5pY2wtdS14cy1tYi0teHMgaDEnLFxuICAgICAgICAgICAgJ2gxW2NsYXNzKj1cIkpvYkluZm9IZWFkZXJcIl0nLFxuICAgICAgICBdO1xuICAgICAgICBmb3IgKGNvbnN0IHNlbGVjdG9yIG9mIHNlbGVjdG9ycykge1xuICAgICAgICAgICAgY29uc3QgdGV4dCA9IHRoaXMuZXh0cmFjdFRleHRDb250ZW50KHNlbGVjdG9yKTtcbiAgICAgICAgICAgIGlmICh0ZXh0KVxuICAgICAgICAgICAgICAgIHJldHVybiB0ZXh0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBleHRyYWN0Q29tcGFueSgpIHtcbiAgICAgICAgY29uc3Qgc2VsZWN0b3JzID0gW1xuICAgICAgICAgICAgJ1tkYXRhLXRlc3RpZD1cImlubGluZUhlYWRlci1jb21wYW55TmFtZVwiXSBhJyxcbiAgICAgICAgICAgICdbZGF0YS10ZXN0aWQ9XCJpbmxpbmVIZWFkZXItY29tcGFueU5hbWVcIl0nLFxuICAgICAgICAgICAgJy5qb2JzZWFyY2gtSW5saW5lQ29tcGFueVJhdGluZy1jb21wYW55SGVhZGVyIGEnLFxuICAgICAgICAgICAgJy5qb2JzZWFyY2gtSW5saW5lQ29tcGFueVJhdGluZyBhJyxcbiAgICAgICAgICAgICcuaWNsLXUtbGctbXItLXNtIGEnLFxuICAgICAgICAgICAgJ1tkYXRhLWNvbXBhbnktbmFtZT1cInRydWVcIl0nLFxuICAgICAgICBdO1xuICAgICAgICBmb3IgKGNvbnN0IHNlbGVjdG9yIG9mIHNlbGVjdG9ycykge1xuICAgICAgICAgICAgY29uc3QgdGV4dCA9IHRoaXMuZXh0cmFjdFRleHRDb250ZW50KHNlbGVjdG9yKTtcbiAgICAgICAgICAgIGlmICh0ZXh0KVxuICAgICAgICAgICAgICAgIHJldHVybiB0ZXh0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBleHRyYWN0TG9jYXRpb24oKSB7XG4gICAgICAgIGNvbnN0IHNlbGVjdG9ycyA9IFtcbiAgICAgICAgICAgICdbZGF0YS10ZXN0aWQ9XCJpbmxpbmVIZWFkZXItY29tcGFueUxvY2F0aW9uXCJdJyxcbiAgICAgICAgICAgICdbZGF0YS10ZXN0aWQ9XCJqb2ItbG9jYXRpb25cIl0nLFxuICAgICAgICAgICAgJy5qb2JzZWFyY2gtSm9iSW5mb0hlYWRlci1zdWJ0aXRsZSA+IGRpdjpudGgtY2hpbGQoMiknLFxuICAgICAgICAgICAgJy5qb2JzZWFyY2gtSW5saW5lQ29tcGFueVJhdGluZyArIGRpdicsXG4gICAgICAgICAgICAnLmljbC11LXhzLW10LS14cyAuaWNsLXUtdGV4dENvbG9yLS1zZWNvbmRhcnknLFxuICAgICAgICBdO1xuICAgICAgICBmb3IgKGNvbnN0IHNlbGVjdG9yIG9mIHNlbGVjdG9ycykge1xuICAgICAgICAgICAgY29uc3QgdGV4dCA9IHRoaXMuZXh0cmFjdFRleHRDb250ZW50KHNlbGVjdG9yKTtcbiAgICAgICAgICAgIGlmICh0ZXh0ICYmICF0ZXh0LmluY2x1ZGVzKCdyZXZpZXdzJykgJiYgIXRleHQuaW5jbHVkZXMoJ3JhdGluZycpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGV4dHJhY3REZXNjcmlwdGlvbigpIHtcbiAgICAgICAgY29uc3Qgc2VsZWN0b3JzID0gW1xuICAgICAgICAgICAgJyNqb2JEZXNjcmlwdGlvblRleHQnLFxuICAgICAgICAgICAgJ1tkYXRhLXRlc3RpZD1cImpvYkRlc2NyaXB0aW9uVGV4dFwiXScsXG4gICAgICAgICAgICAnLmpvYnNlYXJjaC1qb2JEZXNjcmlwdGlvblRleHQnLFxuICAgICAgICAgICAgJy5qb2JzZWFyY2gtSm9iQ29tcG9uZW50LWRlc2NyaXB0aW9uJyxcbiAgICAgICAgXTtcbiAgICAgICAgZm9yIChjb25zdCBzZWxlY3RvciBvZiBzZWxlY3RvcnMpIHtcbiAgICAgICAgICAgIGNvbnN0IGh0bWwgPSB0aGlzLmV4dHJhY3RIdG1sQ29udGVudChzZWxlY3Rvcik7XG4gICAgICAgICAgICBpZiAoaHRtbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNsZWFuRGVzY3JpcHRpb24oaHRtbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGV4dHJhY3RTYWxhcnlGcm9tUGFnZSgpIHtcbiAgICAgICAgY29uc3Qgc2VsZWN0b3JzID0gW1xuICAgICAgICAgICAgJ1tkYXRhLXRlc3RpZD1cImpvYnNlYXJjaC1Kb2JNZXRhZGF0YUhlYWRlci1zYWxhcnlJbmZvXCJdJyxcbiAgICAgICAgICAgICcuam9ic2VhcmNoLUpvYk1ldGFkYXRhSGVhZGVyLXNhbGFyeUluZm8nLFxuICAgICAgICAgICAgJyNzYWxhcnlJbmZvQW5kSm9iVHlwZSAuYXR0cmlidXRlX3NuaXBwZXQnLFxuICAgICAgICAgICAgJy5qb2JzZWFyY2gtSm9iSW5mb0hlYWRlci1zYWxhcnknLFxuICAgICAgICBdO1xuICAgICAgICBmb3IgKGNvbnN0IHNlbGVjdG9yIG9mIHNlbGVjdG9ycykge1xuICAgICAgICAgICAgY29uc3QgdGV4dCA9IHRoaXMuZXh0cmFjdFRleHRDb250ZW50KHNlbGVjdG9yKTtcbiAgICAgICAgICAgIGlmICh0ZXh0ICYmIHRleHQuaW5jbHVkZXMoJyQnKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0ZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGV4dHJhY3RKb2JJZCgpIHtcbiAgICAgICAgLy8gRnJvbSBVUkwgcGFyYW1ldGVyXG4gICAgICAgIGNvbnN0IHVybFBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaCk7XG4gICAgICAgIGNvbnN0IGprID0gdXJsUGFyYW1zLmdldCgnamsnKTtcbiAgICAgICAgaWYgKGprKVxuICAgICAgICAgICAgcmV0dXJuIGprO1xuICAgICAgICAvLyBGcm9tIFVSTCBwYXRoXG4gICAgICAgIGNvbnN0IG1hdGNoID0gd2luZG93LmxvY2F0aW9uLmhyZWYubWF0Y2goL1xcL2pvYlxcLyhbYS1mMC05XSspL2kpO1xuICAgICAgICByZXR1cm4gbWF0Y2g/LlsxXTtcbiAgICB9XG4gICAgZXh0cmFjdEpvYklkRnJvbVVybCh1cmwpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHVybE9iaiA9IG5ldyBVUkwodXJsKTtcbiAgICAgICAgICAgIGNvbnN0IGprID0gdXJsT2JqLnNlYXJjaFBhcmFtcy5nZXQoJ2prJyk7XG4gICAgICAgICAgICBpZiAoamspXG4gICAgICAgICAgICAgICAgcmV0dXJuIGprO1xuICAgICAgICAgICAgY29uc3QgbWF0Y2ggPSB1cmwubWF0Y2goL1xcL2pvYlxcLyhbYS1mMC05XSspL2kpO1xuICAgICAgICAgICAgcmV0dXJuIG1hdGNoPy5bMV07XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2gge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBleHRyYWN0U3RydWN0dXJlZERhdGEoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBsZEpzb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdzY3JpcHRbdHlwZT1cImFwcGxpY2F0aW9uL2xkK2pzb25cIl0nKTtcbiAgICAgICAgICAgIGlmICghbGRKc29uPy50ZXh0Q29udGVudClcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKGxkSnNvbi50ZXh0Q29udGVudCk7XG4gICAgICAgICAgICAvLyBJbmRlZWQgbWF5IGhhdmUgYW4gYXJyYXkgb2Ygc3RydWN0dXJlZCBkYXRhXG4gICAgICAgICAgICBjb25zdCBqb2JEYXRhID0gQXJyYXkuaXNBcnJheShkYXRhKSA/IGRhdGEuZmluZCgoZCkgPT4gZFsnQHR5cGUnXSA9PT0gJ0pvYlBvc3RpbmcnKSA6IGRhdGE7XG4gICAgICAgICAgICBpZiAoIWpvYkRhdGEgfHwgam9iRGF0YVsnQHR5cGUnXSAhPT0gJ0pvYlBvc3RpbmcnKVxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBsb2NhdGlvbjogam9iRGF0YS5qb2JMb2NhdGlvbj8uYWRkcmVzcz8uYWRkcmVzc0xvY2FsaXR5IHx8XG4gICAgICAgICAgICAgICAgICAgIGpvYkRhdGEuam9iTG9jYXRpb24/LmFkZHJlc3M/Lm5hbWUsXG4gICAgICAgICAgICAgICAgc2FsYXJ5OiBqb2JEYXRhLmJhc2VTYWxhcnk/LnZhbHVlXG4gICAgICAgICAgICAgICAgICAgID8gYCQke2pvYkRhdGEuYmFzZVNhbGFyeS52YWx1ZS5taW5WYWx1ZSB8fCAnJ30tJHtqb2JEYXRhLmJhc2VTYWxhcnkudmFsdWUubWF4VmFsdWUgfHwgJyd9ICR7am9iRGF0YS5iYXNlU2FsYXJ5LnZhbHVlLnVuaXRUZXh0IHx8ICcnfWBcbiAgICAgICAgICAgICAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgcG9zdGVkQXQ6IGpvYkRhdGEuZGF0ZVBvc3RlZCxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2gge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLyBHcmVlbmhvdXNlIGpvYiBib2FyZCBzY3JhcGVyXG5pbXBvcnQgeyBCYXNlU2NyYXBlciB9IGZyb20gJy4vYmFzZS1zY3JhcGVyJztcbmV4cG9ydCBjbGFzcyBHcmVlbmhvdXNlU2NyYXBlciBleHRlbmRzIEJhc2VTY3JhcGVyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcbiAgICAgICAgdGhpcy5zb3VyY2UgPSAnZ3JlZW5ob3VzZSc7XG4gICAgICAgIHRoaXMudXJsUGF0dGVybnMgPSBbXG4gICAgICAgICAgICAvYm9hcmRzXFwuZ3JlZW5ob3VzZVxcLmlvXFwvW1xcdy1dK1xcL2pvYnNcXC9cXGQrLyxcbiAgICAgICAgICAgIC9bXFx3LV0rXFwuZ3JlZW5ob3VzZVxcLmlvXFwvam9ic1xcL1xcZCsvLFxuICAgICAgICAgICAgL2dyZWVuaG91c2VcXC5pb1xcL2VtYmVkXFwvam9iX2FwcC8sXG4gICAgICAgIF07XG4gICAgfVxuICAgIGNhbkhhbmRsZSh1cmwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudXJsUGF0dGVybnMuc29tZSgocCkgPT4gcC50ZXN0KHVybCkpO1xuICAgIH1cbiAgICBhc3luYyBzY3JhcGVKb2JMaXN0aW5nKCkge1xuICAgICAgICAvLyBXYWl0IGZvciBqb2IgY29udGVudCB0byBsb2FkXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLndhaXRGb3JFbGVtZW50KCcuYXBwLXRpdGxlLCAjaGVhZGVyIC5jb21wYW55LW5hbWUsIC5qb2ItdGl0bGUnLCAzMDAwKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCB7XG4gICAgICAgICAgICAvLyBDb250aW51ZSB3aXRoIGF2YWlsYWJsZSBkYXRhXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdGl0bGUgPSB0aGlzLmV4dHJhY3RKb2JUaXRsZSgpO1xuICAgICAgICBjb25zdCBjb21wYW55ID0gdGhpcy5leHRyYWN0Q29tcGFueSgpO1xuICAgICAgICBjb25zdCBsb2NhdGlvbiA9IHRoaXMuZXh0cmFjdExvY2F0aW9uKCk7XG4gICAgICAgIGNvbnN0IGRlc2NyaXB0aW9uID0gdGhpcy5leHRyYWN0RGVzY3JpcHRpb24oKTtcbiAgICAgICAgaWYgKCF0aXRsZSB8fCAhY29tcGFueSB8fCAhZGVzY3JpcHRpb24pIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbQ29sdW1idXNdIEdyZWVuaG91c2Ugc2NyYXBlcjogTWlzc2luZyByZXF1aXJlZCBmaWVsZHMnLCB7IHRpdGxlLCBjb21wYW55LCBkZXNjcmlwdGlvbjogISFkZXNjcmlwdGlvbiB9KTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHN0cnVjdHVyZWREYXRhID0gdGhpcy5leHRyYWN0U3RydWN0dXJlZERhdGEoKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgICAgY29tcGFueSxcbiAgICAgICAgICAgIGxvY2F0aW9uOiBsb2NhdGlvbiB8fCBzdHJ1Y3R1cmVkRGF0YT8ubG9jYXRpb24sXG4gICAgICAgICAgICBkZXNjcmlwdGlvbixcbiAgICAgICAgICAgIHJlcXVpcmVtZW50czogdGhpcy5leHRyYWN0UmVxdWlyZW1lbnRzKGRlc2NyaXB0aW9uKSxcbiAgICAgICAgICAgIGtleXdvcmRzOiB0aGlzLmV4dHJhY3RLZXl3b3JkcyhkZXNjcmlwdGlvbiksXG4gICAgICAgICAgICBzYWxhcnk6IHRoaXMuZXh0cmFjdFNhbGFyeShkZXNjcmlwdGlvbikgfHwgc3RydWN0dXJlZERhdGE/LnNhbGFyeSxcbiAgICAgICAgICAgIHR5cGU6IHRoaXMuZGV0ZWN0Sm9iVHlwZShkZXNjcmlwdGlvbikgfHwgc3RydWN0dXJlZERhdGE/LnR5cGUsXG4gICAgICAgICAgICByZW1vdGU6IHRoaXMuZGV0ZWN0UmVtb3RlKGxvY2F0aW9uIHx8ICcnKSB8fCB0aGlzLmRldGVjdFJlbW90ZShkZXNjcmlwdGlvbiksXG4gICAgICAgICAgICB1cmw6IHdpbmRvdy5sb2NhdGlvbi5ocmVmLFxuICAgICAgICAgICAgc291cmNlOiB0aGlzLnNvdXJjZSxcbiAgICAgICAgICAgIHNvdXJjZUpvYklkOiB0aGlzLmV4dHJhY3RKb2JJZCgpLFxuICAgICAgICAgICAgcG9zdGVkQXQ6IHN0cnVjdHVyZWREYXRhPy5wb3N0ZWRBdCxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgYXN5bmMgc2NyYXBlSm9iTGlzdCgpIHtcbiAgICAgICAgY29uc3Qgam9icyA9IFtdO1xuICAgICAgICAvLyBKb2IgY2FyZHMgb24gZGVwYXJ0bWVudC9saXN0aW5nIHBhZ2VzXG4gICAgICAgIGNvbnN0IGpvYkNhcmRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLm9wZW5pbmcsIC5qb2ItcG9zdCwgW2RhdGEtbWFwcGVkPVwidHJ1ZVwiXSwgc2VjdGlvbi5sZXZlbC0wID4gZGl2Jyk7XG4gICAgICAgIGZvciAoY29uc3QgY2FyZCBvZiBqb2JDYXJkcykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCB0aXRsZUVsID0gY2FyZC5xdWVyeVNlbGVjdG9yKCdhLCAub3BlbmluZy10aXRsZSwgLmpvYi10aXRsZScpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2F0aW9uRWwgPSBjYXJkLnF1ZXJ5U2VsZWN0b3IoJy5sb2NhdGlvbiwgLmpvYi1sb2NhdGlvbiwgc3BhbjpsYXN0LWNoaWxkJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgdGl0bGUgPSB0aXRsZUVsPy50ZXh0Q29udGVudD8udHJpbSgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2F0aW9uID0gbG9jYXRpb25FbD8udGV4dENvbnRlbnQ/LnRyaW0oKTtcbiAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSB0aXRsZUVsPy5ocmVmO1xuICAgICAgICAgICAgICAgIC8vIENvbXBhbnkgaXMgdXN1YWxseSBpbiBoZWFkZXJcbiAgICAgICAgICAgICAgICBjb25zdCBjb21wYW55ID0gdGhpcy5leHRyYWN0Q29tcGFueSgpO1xuICAgICAgICAgICAgICAgIGlmICh0aXRsZSAmJiB1cmwgJiYgY29tcGFueSkge1xuICAgICAgICAgICAgICAgICAgICBqb2JzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wYW55LFxuICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXF1aXJlbWVudHM6IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsLFxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiB0aGlzLnNvdXJjZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZUpvYklkOiB0aGlzLmV4dHJhY3RKb2JJZEZyb21VcmwodXJsKSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tDb2x1bWJ1c10gRXJyb3Igc2NyYXBpbmcgR3JlZW5ob3VzZSBqb2IgY2FyZDonLCBlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBqb2JzO1xuICAgIH1cbiAgICBleHRyYWN0Sm9iVGl0bGUoKSB7XG4gICAgICAgIGNvbnN0IHNlbGVjdG9ycyA9IFtcbiAgICAgICAgICAgICcuYXBwLXRpdGxlJyxcbiAgICAgICAgICAgICcuam9iLXRpdGxlJyxcbiAgICAgICAgICAgICdoMS5oZWFkaW5nJyxcbiAgICAgICAgICAgICcuam9iLWluZm8gaDEnLFxuICAgICAgICAgICAgJyNoZWFkZXIgaDEnLFxuICAgICAgICAgICAgJ2gxW2NsYXNzKj1cImpvYlwiXScsXG4gICAgICAgICAgICAnLmhlcm8gaDEnLFxuICAgICAgICBdO1xuICAgICAgICBmb3IgKGNvbnN0IHNlbGVjdG9yIG9mIHNlbGVjdG9ycykge1xuICAgICAgICAgICAgY29uc3QgdGV4dCA9IHRoaXMuZXh0cmFjdFRleHRDb250ZW50KHNlbGVjdG9yKTtcbiAgICAgICAgICAgIGlmICh0ZXh0KVxuICAgICAgICAgICAgICAgIHJldHVybiB0ZXh0O1xuICAgICAgICB9XG4gICAgICAgIC8vIFRyeSBzdHJ1Y3R1cmVkIGRhdGFcbiAgICAgICAgY29uc3QgbGRKc29uID0gdGhpcy5leHRyYWN0U3RydWN0dXJlZERhdGEoKTtcbiAgICAgICAgaWYgKGxkSnNvbj8udGl0bGUpXG4gICAgICAgICAgICByZXR1cm4gbGRKc29uLnRpdGxlO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZXh0cmFjdENvbXBhbnkoKSB7XG4gICAgICAgIGNvbnN0IHNlbGVjdG9ycyA9IFtcbiAgICAgICAgICAgICcuY29tcGFueS1uYW1lJyxcbiAgICAgICAgICAgICcjaGVhZGVyIC5jb21wYW55LW5hbWUnLFxuICAgICAgICAgICAgJy5sb2dvLXdyYXBwZXIgaW1nW2FsdF0nLFxuICAgICAgICAgICAgJy5jb21wYW55LWhlYWRlciAubmFtZScsXG4gICAgICAgICAgICAnbWV0YVtwcm9wZXJ0eT1cIm9nOnNpdGVfbmFtZVwiXScsXG4gICAgICAgIF07XG4gICAgICAgIGZvciAoY29uc3Qgc2VsZWN0b3Igb2Ygc2VsZWN0b3JzKSB7XG4gICAgICAgICAgICBpZiAoc2VsZWN0b3IuaW5jbHVkZXMoJ21ldGEnKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1ldGEgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgICAgICAgICAgICBjb25zdCBjb250ZW50ID0gbWV0YT8uZ2V0QXR0cmlidXRlKCdjb250ZW50Jyk7XG4gICAgICAgICAgICAgICAgaWYgKGNvbnRlbnQpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb250ZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoc2VsZWN0b3IuaW5jbHVkZXMoJ2ltZ1thbHRdJykpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpbWcgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgICAgICAgICAgICBjb25zdCBhbHQgPSBpbWc/LmdldEF0dHJpYnV0ZSgnYWx0Jyk7XG4gICAgICAgICAgICAgICAgaWYgKGFsdClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRleHQgPSB0aGlzLmV4dHJhY3RUZXh0Q29udGVudChzZWxlY3Rvcik7XG4gICAgICAgICAgICAgICAgaWYgKHRleHQpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0ZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIEV4dHJhY3QgZnJvbSBVUkwgKGJvYXJkcy5ncmVlbmhvdXNlLmlvL0NPTVBBTlkvam9icy8uLi4pXG4gICAgICAgIGNvbnN0IG1hdGNoID0gd2luZG93LmxvY2F0aW9uLmhyZWYubWF0Y2goL2dyZWVuaG91c2VcXC5pb1xcLyhbXi9dKykvKTtcbiAgICAgICAgaWYgKG1hdGNoICYmIG1hdGNoWzFdICE9PSAnam9icycpIHtcbiAgICAgICAgICAgIHJldHVybiBtYXRjaFsxXS5yZXBsYWNlKC8tL2csICcgJykucmVwbGFjZSgvXFxiXFx3L2csIChjKSA9PiBjLnRvVXBwZXJDYXNlKCkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBleHRyYWN0TG9jYXRpb24oKSB7XG4gICAgICAgIGNvbnN0IHNlbGVjdG9ycyA9IFtcbiAgICAgICAgICAgICcubG9jYXRpb24nLFxuICAgICAgICAgICAgJy5qb2ItbG9jYXRpb24nLFxuICAgICAgICAgICAgJy5jb21wYW55LWxvY2F0aW9uJyxcbiAgICAgICAgICAgICcuam9iLWluZm8gLmxvY2F0aW9uJyxcbiAgICAgICAgICAgICcjaGVhZGVyIC5sb2NhdGlvbicsXG4gICAgICAgIF07XG4gICAgICAgIGZvciAoY29uc3Qgc2VsZWN0b3Igb2Ygc2VsZWN0b3JzKSB7XG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0gdGhpcy5leHRyYWN0VGV4dENvbnRlbnQoc2VsZWN0b3IpO1xuICAgICAgICAgICAgaWYgKHRleHQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGV4dHJhY3REZXNjcmlwdGlvbigpIHtcbiAgICAgICAgY29uc3Qgc2VsZWN0b3JzID0gW1xuICAgICAgICAgICAgJyNjb250ZW50JyxcbiAgICAgICAgICAgICcuam9iLWRlc2NyaXB0aW9uJyxcbiAgICAgICAgICAgICcuY29udGVudC13cmFwcGVyIC5jb250ZW50JyxcbiAgICAgICAgICAgICcjam9iX2Rlc2NyaXB0aW9uJyxcbiAgICAgICAgICAgICcuam9iLWNvbnRlbnQnLFxuICAgICAgICAgICAgJy5qb2ItaW5mbyAuY29udGVudCcsXG4gICAgICAgIF07XG4gICAgICAgIGZvciAoY29uc3Qgc2VsZWN0b3Igb2Ygc2VsZWN0b3JzKSB7XG4gICAgICAgICAgICBjb25zdCBodG1sID0gdGhpcy5leHRyYWN0SHRtbENvbnRlbnQoc2VsZWN0b3IpO1xuICAgICAgICAgICAgaWYgKGh0bWwgJiYgaHRtbC5sZW5ndGggPiAxMDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jbGVhbkRlc2NyaXB0aW9uKGh0bWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBleHRyYWN0Sm9iSWQoKSB7XG4gICAgICAgIC8vIEZyb20gVVJMOiBib2FyZHMuZ3JlZW5ob3VzZS5pby9jb21wYW55L2pvYnMvMTIzNDVcbiAgICAgICAgY29uc3QgbWF0Y2ggPSB3aW5kb3cubG9jYXRpb24uaHJlZi5tYXRjaCgvXFwvam9ic1xcLyhcXGQrKS8pO1xuICAgICAgICByZXR1cm4gbWF0Y2g/LlsxXTtcbiAgICB9XG4gICAgZXh0cmFjdEpvYklkRnJvbVVybCh1cmwpIHtcbiAgICAgICAgY29uc3QgbWF0Y2ggPSB1cmwubWF0Y2goL1xcL2pvYnNcXC8oXFxkKykvKTtcbiAgICAgICAgcmV0dXJuIG1hdGNoPy5bMV07XG4gICAgfVxuICAgIGV4dHJhY3RTdHJ1Y3R1cmVkRGF0YSgpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGxkSnNvbkVsZW1lbnRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnc2NyaXB0W3R5cGU9XCJhcHBsaWNhdGlvbi9sZCtqc29uXCJdJyk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGVsIG9mIGxkSnNvbkVsZW1lbnRzKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFlbC50ZXh0Q29udGVudClcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IEpTT04ucGFyc2UoZWwudGV4dENvbnRlbnQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGpvYkRhdGEgPSBBcnJheS5pc0FycmF5KGRhdGEpID8gZGF0YS5maW5kKChkKSA9PiBkWydAdHlwZSddID09PSAnSm9iUG9zdGluZycpIDogZGF0YTtcbiAgICAgICAgICAgICAgICBpZiAoIWpvYkRhdGEgfHwgam9iRGF0YVsnQHR5cGUnXSAhPT0gJ0pvYlBvc3RpbmcnKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBjb25zdCBlbXBsb3ltZW50VHlwZSA9IGpvYkRhdGEuZW1wbG95bWVudFR5cGU/LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICAgICAgbGV0IHR5cGU7XG4gICAgICAgICAgICAgICAgaWYgKGVtcGxveW1lbnRUeXBlPy5pbmNsdWRlcygnZnVsbCcpKVxuICAgICAgICAgICAgICAgICAgICB0eXBlID0gJ2Z1bGwtdGltZSc7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZW1wbG95bWVudFR5cGU/LmluY2x1ZGVzKCdwYXJ0JykpXG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPSAncGFydC10aW1lJztcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChlbXBsb3ltZW50VHlwZT8uaW5jbHVkZXMoJ2NvbnRyYWN0JykpXG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPSAnY29udHJhY3QnO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGVtcGxveW1lbnRUeXBlPy5pbmNsdWRlcygnaW50ZXJuJykpXG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPSAnaW50ZXJuc2hpcCc7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGpvYkRhdGEudGl0bGUsXG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uOiB0eXBlb2Ygam9iRGF0YS5qb2JMb2NhdGlvbiA9PT0gJ3N0cmluZydcbiAgICAgICAgICAgICAgICAgICAgICAgID8gam9iRGF0YS5qb2JMb2NhdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgOiBqb2JEYXRhLmpvYkxvY2F0aW9uPy5hZGRyZXNzPy5hZGRyZXNzTG9jYWxpdHkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqb2JEYXRhLmpvYkxvY2F0aW9uPy5hZGRyZXNzPy5uYW1lIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgam9iRGF0YS5qb2JMb2NhdGlvbj8ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgc2FsYXJ5OiBqb2JEYXRhLmJhc2VTYWxhcnk/LnZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICA/IGAkJHtqb2JEYXRhLmJhc2VTYWxhcnkudmFsdWUubWluVmFsdWUgfHwgJyd9LSR7am9iRGF0YS5iYXNlU2FsYXJ5LnZhbHVlLm1heFZhbHVlIHx8ICcnfWBcbiAgICAgICAgICAgICAgICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICBwb3N0ZWRBdDogam9iRGF0YS5kYXRlUG9zdGVkLFxuICAgICAgICAgICAgICAgICAgICB0eXBlLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vIExldmVyIGpvYiBib2FyZCBzY3JhcGVyXG5pbXBvcnQgeyBCYXNlU2NyYXBlciB9IGZyb20gJy4vYmFzZS1zY3JhcGVyJztcbmV4cG9ydCBjbGFzcyBMZXZlclNjcmFwZXIgZXh0ZW5kcyBCYXNlU2NyYXBlciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKC4uLmFyZ3VtZW50cyk7XG4gICAgICAgIHRoaXMuc291cmNlID0gJ2xldmVyJztcbiAgICAgICAgdGhpcy51cmxQYXR0ZXJucyA9IFtcbiAgICAgICAgICAgIC9qb2JzXFwubGV2ZXJcXC5jb1xcL1tcXHctXStcXC9bXFx3LV0rLyxcbiAgICAgICAgICAgIC9bXFx3LV0rXFwubGV2ZXJcXC5jb1xcL1tcXHctXSsvLFxuICAgICAgICBdO1xuICAgIH1cbiAgICBjYW5IYW5kbGUodXJsKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnVybFBhdHRlcm5zLnNvbWUoKHApID0+IHAudGVzdCh1cmwpKTtcbiAgICB9XG4gICAgYXN5bmMgc2NyYXBlSm9iTGlzdGluZygpIHtcbiAgICAgICAgLy8gV2FpdCBmb3Igam9iIGNvbnRlbnQgdG8gbG9hZFxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy53YWl0Rm9yRWxlbWVudCgnLnBvc3RpbmctaGVhZGxpbmUgaDIsIC5wb3N0aW5nLWhlYWRsaW5lIGgxLCAuc2VjdGlvbi13cmFwcGVyJywgMzAwMCk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2gge1xuICAgICAgICAgICAgLy8gQ29udGludWUgd2l0aCBhdmFpbGFibGUgZGF0YVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRpdGxlID0gdGhpcy5leHRyYWN0Sm9iVGl0bGUoKTtcbiAgICAgICAgY29uc3QgY29tcGFueSA9IHRoaXMuZXh0cmFjdENvbXBhbnkoKTtcbiAgICAgICAgY29uc3QgbG9jYXRpb24gPSB0aGlzLmV4dHJhY3RMb2NhdGlvbigpO1xuICAgICAgICBjb25zdCBkZXNjcmlwdGlvbiA9IHRoaXMuZXh0cmFjdERlc2NyaXB0aW9uKCk7XG4gICAgICAgIGlmICghdGl0bGUgfHwgIWNvbXBhbnkgfHwgIWRlc2NyaXB0aW9uKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW0NvbHVtYnVzXSBMZXZlciBzY3JhcGVyOiBNaXNzaW5nIHJlcXVpcmVkIGZpZWxkcycsIHsgdGl0bGUsIGNvbXBhbnksIGRlc2NyaXB0aW9uOiAhIWRlc2NyaXB0aW9uIH0pO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgc3RydWN0dXJlZERhdGEgPSB0aGlzLmV4dHJhY3RTdHJ1Y3R1cmVkRGF0YSgpO1xuICAgICAgICBjb25zdCBjb21taXRtZW50ID0gdGhpcy5leHRyYWN0Q29tbWl0bWVudCgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgICBjb21wYW55LFxuICAgICAgICAgICAgbG9jYXRpb246IGxvY2F0aW9uIHx8IHN0cnVjdHVyZWREYXRhPy5sb2NhdGlvbixcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgcmVxdWlyZW1lbnRzOiB0aGlzLmV4dHJhY3RSZXF1aXJlbWVudHMoZGVzY3JpcHRpb24pLFxuICAgICAgICAgICAga2V5d29yZHM6IHRoaXMuZXh0cmFjdEtleXdvcmRzKGRlc2NyaXB0aW9uKSxcbiAgICAgICAgICAgIHNhbGFyeTogdGhpcy5leHRyYWN0U2FsYXJ5KGRlc2NyaXB0aW9uKSB8fCBzdHJ1Y3R1cmVkRGF0YT8uc2FsYXJ5LFxuICAgICAgICAgICAgdHlwZTogdGhpcy5kZXRlY3RKb2JUeXBlRnJvbUNvbW1pdG1lbnQoY29tbWl0bWVudCkgfHwgdGhpcy5kZXRlY3RKb2JUeXBlKGRlc2NyaXB0aW9uKSxcbiAgICAgICAgICAgIHJlbW90ZTogdGhpcy5kZXRlY3RSZW1vdGUobG9jYXRpb24gfHwgJycpIHx8IHRoaXMuZGV0ZWN0UmVtb3RlKGRlc2NyaXB0aW9uKSxcbiAgICAgICAgICAgIHVybDogd2luZG93LmxvY2F0aW9uLmhyZWYsXG4gICAgICAgICAgICBzb3VyY2U6IHRoaXMuc291cmNlLFxuICAgICAgICAgICAgc291cmNlSm9iSWQ6IHRoaXMuZXh0cmFjdEpvYklkKCksXG4gICAgICAgICAgICBwb3N0ZWRBdDogc3RydWN0dXJlZERhdGE/LnBvc3RlZEF0LFxuICAgICAgICB9O1xuICAgIH1cbiAgICBhc3luYyBzY3JhcGVKb2JMaXN0KCkge1xuICAgICAgICBjb25zdCBqb2JzID0gW107XG4gICAgICAgIC8vIEpvYiBwb3N0aW5ncyBvbiBjb21wYW55IHBhZ2VcbiAgICAgICAgY29uc3Qgam9iQ2FyZHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcucG9zdGluZywgW2RhdGEtcWE9XCJwb3N0aW5nLW5hbWVcIl0nKTtcbiAgICAgICAgZm9yIChjb25zdCBjYXJkIG9mIGpvYkNhcmRzKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRpdGxlRWwgPSBjYXJkLnF1ZXJ5U2VsZWN0b3IoJy5wb3N0aW5nLXRpdGxlIGg1LCAucG9zdGluZy1uYW1lLCBhW2RhdGEtcWE9XCJwb3N0aW5nLW5hbWVcIl0nKTtcbiAgICAgICAgICAgICAgICBjb25zdCBsb2NhdGlvbkVsID0gY2FyZC5xdWVyeVNlbGVjdG9yKCcubG9jYXRpb24sIC5wb3N0aW5nLWNhdGVnb3JpZXMgLnNvcnQtYnktbG9jYXRpb24sIC53b3JrcGxhY2VUeXBlcycpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbW1pdG1lbnRFbCA9IGNhcmQucXVlcnlTZWxlY3RvcignLmNvbW1pdG1lbnQsIC5wb3N0aW5nLWNhdGVnb3JpZXMgLnNvcnQtYnktY29tbWl0bWVudCcpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRpdGxlID0gdGl0bGVFbD8udGV4dENvbnRlbnQ/LnRyaW0oKTtcbiAgICAgICAgICAgICAgICBjb25zdCBsb2NhdGlvbiA9IGxvY2F0aW9uRWw/LnRleHRDb250ZW50Py50cmltKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgY29tbWl0bWVudCA9IGNvbW1pdG1lbnRFbD8udGV4dENvbnRlbnQ/LnRyaW0oKTtcbiAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSBjYXJkLnF1ZXJ5U2VsZWN0b3IoJ2EucG9zdGluZy10aXRsZSwgYVtkYXRhLXFhPVwicG9zdGluZy1uYW1lXCJdJyk/LmhyZWYgfHxcbiAgICAgICAgICAgICAgICAgICAgY2FyZC5ocmVmO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbXBhbnkgPSB0aGlzLmV4dHJhY3RDb21wYW55KCk7XG4gICAgICAgICAgICAgICAgaWYgKHRpdGxlICYmIHVybCAmJiBjb21wYW55KSB7XG4gICAgICAgICAgICAgICAgICAgIGpvYnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBhbnksXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmVtZW50czogW10sXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmwsXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IHRoaXMuc291cmNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlSm9iSWQ6IHRoaXMuZXh0cmFjdEpvYklkRnJvbVVybCh1cmwpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogdGhpcy5kZXRlY3RKb2JUeXBlRnJvbUNvbW1pdG1lbnQoY29tbWl0bWVudCA/PyBudWxsKSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tDb2x1bWJ1c10gRXJyb3Igc2NyYXBpbmcgTGV2ZXIgam9iIGNhcmQ6JywgZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gam9icztcbiAgICB9XG4gICAgZXh0cmFjdEpvYlRpdGxlKCkge1xuICAgICAgICBjb25zdCBzZWxlY3RvcnMgPSBbXG4gICAgICAgICAgICAnLnBvc3RpbmctaGVhZGxpbmUgaDInLFxuICAgICAgICAgICAgJy5wb3N0aW5nLWhlYWRsaW5lIGgxJyxcbiAgICAgICAgICAgICdbZGF0YS1xYT1cInBvc3RpbmctbmFtZVwiXScsXG4gICAgICAgICAgICAnLnBvc3RpbmctaGVhZGVyIGgyJyxcbiAgICAgICAgICAgICcuc2VjdGlvbi5wYWdlLWNlbnRlcmVkLnBvc3RpbmctaGVhZGVyIGgxJyxcbiAgICAgICAgXTtcbiAgICAgICAgZm9yIChjb25zdCBzZWxlY3RvciBvZiBzZWxlY3RvcnMpIHtcbiAgICAgICAgICAgIGNvbnN0IHRleHQgPSB0aGlzLmV4dHJhY3RUZXh0Q29udGVudChzZWxlY3Rvcik7XG4gICAgICAgICAgICBpZiAodGV4dClcbiAgICAgICAgICAgICAgICByZXR1cm4gdGV4dDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZXh0cmFjdENvbXBhbnkoKSB7XG4gICAgICAgIC8vIFRyeSBsb2dvIGFsdCB0ZXh0XG4gICAgICAgIGNvbnN0IGxvZ28gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubWFpbi1oZWFkZXItbG9nbyBpbWcsIC5wb3N0aW5nLWhlYWRlciAubG9nbyBpbWcsIGhlYWRlciBpbWcnKTtcbiAgICAgICAgaWYgKGxvZ28pIHtcbiAgICAgICAgICAgIGNvbnN0IGFsdCA9IGxvZ28uZ2V0QXR0cmlidXRlKCdhbHQnKTtcbiAgICAgICAgICAgIGlmIChhbHQgJiYgYWx0ICE9PSAnQ29tcGFueSBMb2dvJylcbiAgICAgICAgICAgICAgICByZXR1cm4gYWx0O1xuICAgICAgICB9XG4gICAgICAgIC8vIFRyeSBwYWdlIHRpdGxlXG4gICAgICAgIGNvbnN0IHBhZ2VUaXRsZSA9IGRvY3VtZW50LnRpdGxlO1xuICAgICAgICBpZiAocGFnZVRpdGxlKSB7XG4gICAgICAgICAgICAvLyBGb3JtYXQ6IFwiSm9iIFRpdGxlIC0gQ29tcGFueSBOYW1lXCJcbiAgICAgICAgICAgIGNvbnN0IHBhcnRzID0gcGFnZVRpdGxlLnNwbGl0KCcgLSAnKTtcbiAgICAgICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPj0gMikge1xuICAgICAgICAgICAgICAgIHJldHVybiBwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXS5yZXBsYWNlKCcgSm9icycsICcnKS50cmltKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gRXh0cmFjdCBmcm9tIFVSTFxuICAgICAgICBjb25zdCBtYXRjaCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLm1hdGNoKC9sZXZlclxcLmNvXFwvKFteL10rKS8pO1xuICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICAgIHJldHVybiBtYXRjaFsxXS5yZXBsYWNlKC8tL2csICcgJykucmVwbGFjZSgvXFxiXFx3L2csIChjKSA9PiBjLnRvVXBwZXJDYXNlKCkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBleHRyYWN0TG9jYXRpb24oKSB7XG4gICAgICAgIGNvbnN0IHNlbGVjdG9ycyA9IFtcbiAgICAgICAgICAgICcucG9zdGluZy1jYXRlZ29yaWVzIC5sb2NhdGlvbicsXG4gICAgICAgICAgICAnLnBvc3RpbmctaGVhZGxpbmUgLmxvY2F0aW9uJyxcbiAgICAgICAgICAgICcuc29ydC1ieS1sb2NhdGlvbicsXG4gICAgICAgICAgICAnLndvcmtwbGFjZVR5cGVzJyxcbiAgICAgICAgICAgICdbZGF0YS1xYT1cInBvc3RpbmctbG9jYXRpb25cIl0nLFxuICAgICAgICBdO1xuICAgICAgICBmb3IgKGNvbnN0IHNlbGVjdG9yIG9mIHNlbGVjdG9ycykge1xuICAgICAgICAgICAgY29uc3QgdGV4dCA9IHRoaXMuZXh0cmFjdFRleHRDb250ZW50KHNlbGVjdG9yKTtcbiAgICAgICAgICAgIGlmICh0ZXh0KVxuICAgICAgICAgICAgICAgIHJldHVybiB0ZXh0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBleHRyYWN0Q29tbWl0bWVudCgpIHtcbiAgICAgICAgY29uc3Qgc2VsZWN0b3JzID0gW1xuICAgICAgICAgICAgJy5wb3N0aW5nLWNhdGVnb3JpZXMgLmNvbW1pdG1lbnQnLFxuICAgICAgICAgICAgJy5zb3J0LWJ5LWNvbW1pdG1lbnQnLFxuICAgICAgICAgICAgJ1tkYXRhLXFhPVwicG9zdGluZy1jb21taXRtZW50XCJdJyxcbiAgICAgICAgXTtcbiAgICAgICAgZm9yIChjb25zdCBzZWxlY3RvciBvZiBzZWxlY3RvcnMpIHtcbiAgICAgICAgICAgIGNvbnN0IHRleHQgPSB0aGlzLmV4dHJhY3RUZXh0Q29udGVudChzZWxlY3Rvcik7XG4gICAgICAgICAgICBpZiAodGV4dClcbiAgICAgICAgICAgICAgICByZXR1cm4gdGV4dDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZXh0cmFjdERlc2NyaXB0aW9uKCkge1xuICAgICAgICBjb25zdCBzZWxlY3RvcnMgPSBbXG4gICAgICAgICAgICAnLnBvc3RpbmctcGFnZSAuY29udGVudCcsXG4gICAgICAgICAgICAnLnNlY3Rpb24td3JhcHBlci5wYWdlLWZ1bGwtd2lkdGgnLFxuICAgICAgICAgICAgJy5zZWN0aW9uLnBhZ2UtY2VudGVyZWQnLFxuICAgICAgICAgICAgJ1tkYXRhLXFhPVwiam9iLWRlc2NyaXB0aW9uXCJdJyxcbiAgICAgICAgICAgICcucG9zdGluZy1kZXNjcmlwdGlvbicsXG4gICAgICAgIF07XG4gICAgICAgIGZvciAoY29uc3Qgc2VsZWN0b3Igb2Ygc2VsZWN0b3JzKSB7XG4gICAgICAgICAgICAvLyBGb3IgTGV2ZXIsIHdlIHdhbnQgdG8gZ2V0IGFsbCBjb250ZW50IHNlY3Rpb25zXG4gICAgICAgICAgICBjb25zdCBzZWN0aW9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICAgICAgICAgICAgaWYgKHNlY3Rpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBodG1sID0gQXJyYXkuZnJvbShzZWN0aW9ucylcbiAgICAgICAgICAgICAgICAgICAgLm1hcCgocykgPT4gcy5pbm5lckhUTUwpXG4gICAgICAgICAgICAgICAgICAgIC5qb2luKCdcXG5cXG4nKTtcbiAgICAgICAgICAgICAgICBpZiAoaHRtbC5sZW5ndGggPiAxMDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2xlYW5EZXNjcmlwdGlvbihodG1sKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gVHJ5IGdldHRpbmcgdGhlIG1haW4gY29udGVudCBhcmVhXG4gICAgICAgIGNvbnN0IG1haW5Db250ZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNvbnRlbnQtd3JhcHBlciAuY29udGVudCwgbWFpbiAuY29udGVudCcpO1xuICAgICAgICBpZiAobWFpbkNvbnRlbnQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNsZWFuRGVzY3JpcHRpb24obWFpbkNvbnRlbnQuaW5uZXJIVE1MKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZXh0cmFjdEpvYklkKCkge1xuICAgICAgICAvLyBGcm9tIFVSTDogam9icy5sZXZlci5jby9jb21wYW55L2pvYi1pZC11dWlkXG4gICAgICAgIGNvbnN0IG1hdGNoID0gd2luZG93LmxvY2F0aW9uLmhyZWYubWF0Y2goL2xldmVyXFwuY29cXC9bXi9dK1xcLyhbYS1mMC05LV0rKS9pKTtcbiAgICAgICAgcmV0dXJuIG1hdGNoPy5bMV07XG4gICAgfVxuICAgIGV4dHJhY3RKb2JJZEZyb21VcmwodXJsKSB7XG4gICAgICAgIGNvbnN0IG1hdGNoID0gdXJsLm1hdGNoKC9sZXZlclxcLmNvXFwvW14vXStcXC8oW2EtZjAtOS1dKykvaSk7XG4gICAgICAgIHJldHVybiBtYXRjaD8uWzFdO1xuICAgIH1cbiAgICBkZXRlY3RKb2JUeXBlRnJvbUNvbW1pdG1lbnQoY29tbWl0bWVudCkge1xuICAgICAgICBpZiAoIWNvbW1pdG1lbnQpXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICBjb25zdCBsb3dlciA9IGNvbW1pdG1lbnQudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgaWYgKGxvd2VyLmluY2x1ZGVzKCdmdWxsLXRpbWUnKSB8fCBsb3dlci5pbmNsdWRlcygnZnVsbCB0aW1lJykpXG4gICAgICAgICAgICByZXR1cm4gJ2Z1bGwtdGltZSc7XG4gICAgICAgIGlmIChsb3dlci5pbmNsdWRlcygncGFydC10aW1lJykgfHwgbG93ZXIuaW5jbHVkZXMoJ3BhcnQgdGltZScpKVxuICAgICAgICAgICAgcmV0dXJuICdwYXJ0LXRpbWUnO1xuICAgICAgICBpZiAobG93ZXIuaW5jbHVkZXMoJ2NvbnRyYWN0JykgfHwgbG93ZXIuaW5jbHVkZXMoJ2NvbnRyYWN0b3InKSlcbiAgICAgICAgICAgIHJldHVybiAnY29udHJhY3QnO1xuICAgICAgICBpZiAobG93ZXIuaW5jbHVkZXMoJ2ludGVybicpKVxuICAgICAgICAgICAgcmV0dXJuICdpbnRlcm5zaGlwJztcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgZXh0cmFjdFN0cnVjdHVyZWREYXRhKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgbGRKc29uRWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdzY3JpcHRbdHlwZT1cImFwcGxpY2F0aW9uL2xkK2pzb25cIl0nKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgZWwgb2YgbGRKc29uRWxlbWVudHMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWVsLnRleHRDb250ZW50KVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0gSlNPTi5wYXJzZShlbC50ZXh0Q29udGVudCk7XG4gICAgICAgICAgICAgICAgY29uc3Qgam9iRGF0YSA9IEFycmF5LmlzQXJyYXkoZGF0YSkgPyBkYXRhLmZpbmQoKGQpID0+IGRbJ0B0eXBlJ10gPT09ICdKb2JQb3N0aW5nJykgOiBkYXRhO1xuICAgICAgICAgICAgICAgIGlmICgham9iRGF0YSB8fCBqb2JEYXRhWydAdHlwZSddICE9PSAnSm9iUG9zdGluZycpXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uOiB0eXBlb2Ygam9iRGF0YS5qb2JMb2NhdGlvbiA9PT0gJ3N0cmluZydcbiAgICAgICAgICAgICAgICAgICAgICAgID8gam9iRGF0YS5qb2JMb2NhdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgOiBqb2JEYXRhLmpvYkxvY2F0aW9uPy5hZGRyZXNzPy5hZGRyZXNzTG9jYWxpdHkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqb2JEYXRhLmpvYkxvY2F0aW9uPy5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBzYWxhcnk6IGpvYkRhdGEuYmFzZVNhbGFyeT8udmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgID8gYCQke2pvYkRhdGEuYmFzZVNhbGFyeS52YWx1ZS5taW5WYWx1ZSB8fCAnJ30tJHtqb2JEYXRhLmJhc2VTYWxhcnkudmFsdWUubWF4VmFsdWUgfHwgJyd9YFxuICAgICAgICAgICAgICAgICAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgIHBvc3RlZEF0OiBqb2JEYXRhLmRhdGVQb3N0ZWQsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8gR2VuZXJpYyBqb2Igc2NyYXBlciBmb3IgdW5rbm93biBzaXRlc1xuaW1wb3J0IHsgQmFzZVNjcmFwZXIgfSBmcm9tICcuL2Jhc2Utc2NyYXBlcic7XG5leHBvcnQgY2xhc3MgR2VuZXJpY1NjcmFwZXIgZXh0ZW5kcyBCYXNlU2NyYXBlciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKC4uLmFyZ3VtZW50cyk7XG4gICAgICAgIHRoaXMuc291cmNlID0gJ3Vua25vd24nO1xuICAgICAgICB0aGlzLnVybFBhdHRlcm5zID0gW107XG4gICAgfVxuICAgIGNhbkhhbmRsZShfdXJsKSB7XG4gICAgICAgIC8vIEdlbmVyaWMgc2NyYXBlciBhbHdheXMgcmV0dXJucyB0cnVlIGFzIGZhbGxiYWNrXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBhc3luYyBzY3JhcGVKb2JMaXN0aW5nKCkge1xuICAgICAgICAvLyBUcnkgdG8gZXh0cmFjdCBqb2IgaW5mb3JtYXRpb24gdXNpbmcgY29tbW9uIHBhdHRlcm5zXG4gICAgICAgIC8vIENoZWNrIGZvciBzdHJ1Y3R1cmVkIGRhdGEgZmlyc3RcbiAgICAgICAgY29uc3Qgc3RydWN0dXJlZERhdGEgPSB0aGlzLmV4dHJhY3RTdHJ1Y3R1cmVkRGF0YSgpO1xuICAgICAgICBpZiAoc3RydWN0dXJlZERhdGEpIHtcbiAgICAgICAgICAgIHJldHVybiBzdHJ1Y3R1cmVkRGF0YTtcbiAgICAgICAgfVxuICAgICAgICAvLyBUcnkgY29tbW9uIHNlbGVjdG9yc1xuICAgICAgICBjb25zdCB0aXRsZSA9IHRoaXMuZmluZFRpdGxlKCk7XG4gICAgICAgIGNvbnN0IGNvbXBhbnkgPSB0aGlzLmZpbmRDb21wYW55KCk7XG4gICAgICAgIGNvbnN0IGRlc2NyaXB0aW9uID0gdGhpcy5maW5kRGVzY3JpcHRpb24oKTtcbiAgICAgICAgaWYgKCF0aXRsZSB8fCAhZGVzY3JpcHRpb24pIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbQ29sdW1idXNdIEdlbmVyaWMgc2NyYXBlcjogQ291bGQgbm90IGZpbmQgcmVxdWlyZWQgZmllbGRzJyk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBsb2NhdGlvbiA9IHRoaXMuZmluZExvY2F0aW9uKCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICAgIGNvbXBhbnk6IGNvbXBhbnkgfHwgJ1Vua25vd24gQ29tcGFueScsXG4gICAgICAgICAgICBsb2NhdGlvbjogbG9jYXRpb24gfHwgdW5kZWZpbmVkLFxuICAgICAgICAgICAgZGVzY3JpcHRpb24sXG4gICAgICAgICAgICByZXF1aXJlbWVudHM6IHRoaXMuZXh0cmFjdFJlcXVpcmVtZW50cyhkZXNjcmlwdGlvbiksXG4gICAgICAgICAgICBrZXl3b3JkczogdGhpcy5leHRyYWN0S2V5d29yZHMoZGVzY3JpcHRpb24pLFxuICAgICAgICAgICAgc2FsYXJ5OiB0aGlzLmV4dHJhY3RTYWxhcnkoZGVzY3JpcHRpb24pLFxuICAgICAgICAgICAgdHlwZTogdGhpcy5kZXRlY3RKb2JUeXBlKGRlc2NyaXB0aW9uKSxcbiAgICAgICAgICAgIHJlbW90ZTogdGhpcy5kZXRlY3RSZW1vdGUobG9jYXRpb24gfHwgJycpIHx8IHRoaXMuZGV0ZWN0UmVtb3RlKGRlc2NyaXB0aW9uKSxcbiAgICAgICAgICAgIHVybDogd2luZG93LmxvY2F0aW9uLmhyZWYsXG4gICAgICAgICAgICBzb3VyY2U6IHRoaXMuZGV0ZWN0U291cmNlKCksXG4gICAgICAgIH07XG4gICAgfVxuICAgIGFzeW5jIHNjcmFwZUpvYkxpc3QoKSB7XG4gICAgICAgIC8vIEdlbmVyaWMgc2NyYXBpbmcgb2Ygam9iIGxpc3RzIGlzIHVucmVsaWFibGVcbiAgICAgICAgLy8gUmV0dXJuIGVtcHR5IGFycmF5IGZvciB1bmtub3duIHNpdGVzXG4gICAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgZXh0cmFjdFN0cnVjdHVyZWREYXRhKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gTG9vayBmb3IgSlNPTi1MRCBqb2IgcG9zdGluZyBzY2hlbWFcbiAgICAgICAgICAgIGNvbnN0IHNjcmlwdHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdzY3JpcHRbdHlwZT1cImFwcGxpY2F0aW9uL2xkK2pzb25cIl0nKTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgc2NyaXB0IG9mIHNjcmlwdHMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0gSlNPTi5wYXJzZShzY3JpcHQudGV4dENvbnRlbnQgfHwgJycpO1xuICAgICAgICAgICAgICAgIC8vIEhhbmRsZSBzaW5nbGUgam9iIHBvc3RpbmdcbiAgICAgICAgICAgICAgICBpZiAoZGF0YVsnQHR5cGUnXSA9PT0gJ0pvYlBvc3RpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlSm9iUG9zdGluZ1NjaGVtYShkYXRhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gSGFuZGxlIGFycmF5IG9mIGl0ZW1zXG4gICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgam9iUG9zdGluZyA9IGRhdGEuZmluZCgoaXRlbSkgPT4gaXRlbVsnQHR5cGUnXSA9PT0gJ0pvYlBvc3RpbmcnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGpvYlBvc3RpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlSm9iUG9zdGluZ1NjaGVtYShqb2JQb3N0aW5nKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBIYW5kbGUgQGdyYXBoXG4gICAgICAgICAgICAgICAgaWYgKGRhdGFbJ0BncmFwaCddKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGpvYlBvc3RpbmcgPSBkYXRhWydAZ3JhcGgnXS5maW5kKChpdGVtKSA9PiBpdGVtWydAdHlwZSddID09PSAnSm9iUG9zdGluZycpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoam9iUG9zdGluZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VKb2JQb3N0aW5nU2NoZW1hKGpvYlBvc3RpbmcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbQ29sdW1idXNdIENvdWxkIG5vdCBwYXJzZSBzdHJ1Y3R1cmVkIGRhdGE6JywgZXJyKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcGFyc2VKb2JQb3N0aW5nU2NoZW1hKGRhdGEpIHtcbiAgICAgICAgY29uc3QgdGl0bGUgPSBkYXRhLnRpdGxlIHx8ICcnO1xuICAgICAgICBjb25zdCBjb21wYW55ID0gZGF0YS5oaXJpbmdPcmdhbml6YXRpb24/Lm5hbWUgfHwgJyc7XG4gICAgICAgIGNvbnN0IGRlc2NyaXB0aW9uID0gZGF0YS5kZXNjcmlwdGlvbiB8fCAnJztcbiAgICAgICAgLy8gRXh0cmFjdCBsb2NhdGlvblxuICAgICAgICBsZXQgbG9jYXRpb247XG4gICAgICAgIGNvbnN0IGpvYkxvY2F0aW9uID0gZGF0YS5qb2JMb2NhdGlvbjtcbiAgICAgICAgaWYgKGpvYkxvY2F0aW9uKSB7XG4gICAgICAgICAgICBjb25zdCBhZGRyZXNzID0gam9iTG9jYXRpb24uYWRkcmVzcztcbiAgICAgICAgICAgIGlmIChhZGRyZXNzKSB7XG4gICAgICAgICAgICAgICAgbG9jYXRpb24gPSBbYWRkcmVzcy5hZGRyZXNzTG9jYWxpdHksIGFkZHJlc3MuYWRkcmVzc1JlZ2lvbiwgYWRkcmVzcy5hZGRyZXNzQ291bnRyeV1cbiAgICAgICAgICAgICAgICAgICAgLmZpbHRlcihCb29sZWFuKVxuICAgICAgICAgICAgICAgICAgICAuam9pbignLCAnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBFeHRyYWN0IHNhbGFyeVxuICAgICAgICBsZXQgc2FsYXJ5O1xuICAgICAgICBjb25zdCBiYXNlU2FsYXJ5ID0gZGF0YS5iYXNlU2FsYXJ5O1xuICAgICAgICBpZiAoYmFzZVNhbGFyeSkge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBiYXNlU2FsYXJ5LnZhbHVlO1xuICAgICAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY3VycmVuY3kgPSBiYXNlU2FsYXJ5LmN1cnJlbmN5IHx8ICdVU0QnO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1pbiA9IHZhbHVlLm1pblZhbHVlO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1heCA9IHZhbHVlLm1heFZhbHVlO1xuICAgICAgICAgICAgICAgIGlmIChtaW4gJiYgbWF4KSB7XG4gICAgICAgICAgICAgICAgICAgIHNhbGFyeSA9IGAke2N1cnJlbmN5fSAke21pbi50b0xvY2FsZVN0cmluZygpfSAtICR7bWF4LnRvTG9jYWxlU3RyaW5nKCl9YDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgc2FsYXJ5ID0gYCR7Y3VycmVuY3l9ICR7dmFsdWUudG9Mb2NhbGVTdHJpbmcoKX1gO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgICBjb21wYW55LFxuICAgICAgICAgICAgbG9jYXRpb24sXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogdGhpcy5jbGVhbkRlc2NyaXB0aW9uKGRlc2NyaXB0aW9uKSxcbiAgICAgICAgICAgIHJlcXVpcmVtZW50czogdGhpcy5leHRyYWN0UmVxdWlyZW1lbnRzKGRlc2NyaXB0aW9uKSxcbiAgICAgICAgICAgIGtleXdvcmRzOiB0aGlzLmV4dHJhY3RLZXl3b3JkcyhkZXNjcmlwdGlvbiksXG4gICAgICAgICAgICBzYWxhcnksXG4gICAgICAgICAgICB0eXBlOiB0aGlzLnBhcnNlRW1wbG95bWVudFR5cGUoZGF0YS5lbXBsb3ltZW50VHlwZSksXG4gICAgICAgICAgICByZW1vdGU6IHRoaXMuZGV0ZWN0UmVtb3RlKGRlc2NyaXB0aW9uKSxcbiAgICAgICAgICAgIHVybDogd2luZG93LmxvY2F0aW9uLmhyZWYsXG4gICAgICAgICAgICBzb3VyY2U6IHRoaXMuZGV0ZWN0U291cmNlKCksXG4gICAgICAgICAgICBwb3N0ZWRBdDogZGF0YS5kYXRlUG9zdGVkLFxuICAgICAgICB9O1xuICAgIH1cbiAgICBwYXJzZUVtcGxveW1lbnRUeXBlKHR5cGUpIHtcbiAgICAgICAgaWYgKCF0eXBlKVxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgY29uc3QgbG93ZXIgPSB0eXBlLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGlmIChsb3dlci5pbmNsdWRlcygnZnVsbCcpKVxuICAgICAgICAgICAgcmV0dXJuICdmdWxsLXRpbWUnO1xuICAgICAgICBpZiAobG93ZXIuaW5jbHVkZXMoJ3BhcnQnKSlcbiAgICAgICAgICAgIHJldHVybiAncGFydC10aW1lJztcbiAgICAgICAgaWYgKGxvd2VyLmluY2x1ZGVzKCdjb250cmFjdCcpIHx8IGxvd2VyLmluY2x1ZGVzKCd0ZW1wb3JhcnknKSlcbiAgICAgICAgICAgIHJldHVybiAnY29udHJhY3QnO1xuICAgICAgICBpZiAobG93ZXIuaW5jbHVkZXMoJ2ludGVybicpKVxuICAgICAgICAgICAgcmV0dXJuICdpbnRlcm5zaGlwJztcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgZmluZFRpdGxlKCkge1xuICAgICAgICAvLyBDb21tb24gdGl0bGUgc2VsZWN0b3JzXG4gICAgICAgIGNvbnN0IHNlbGVjdG9ycyA9IFtcbiAgICAgICAgICAgICdoMVtjbGFzcyo9XCJ0aXRsZVwiXScsXG4gICAgICAgICAgICAnaDFbY2xhc3MqPVwiam9iXCJdJyxcbiAgICAgICAgICAgICcuam9iLXRpdGxlJyxcbiAgICAgICAgICAgICcucG9zdGluZy10aXRsZScsXG4gICAgICAgICAgICAnW2NsYXNzKj1cImpvYi10aXRsZVwiXScsXG4gICAgICAgICAgICAnW2NsYXNzKj1cInBvc3RpbmctdGl0bGVcIl0nLFxuICAgICAgICAgICAgJ2gxJyxcbiAgICAgICAgXTtcbiAgICAgICAgZm9yIChjb25zdCBzZWxlY3RvciBvZiBzZWxlY3RvcnMpIHtcbiAgICAgICAgICAgIGNvbnN0IHRleHQgPSB0aGlzLmV4dHJhY3RUZXh0Q29udGVudChzZWxlY3Rvcik7XG4gICAgICAgICAgICBpZiAodGV4dCAmJiB0ZXh0Lmxlbmd0aCA+IDMgJiYgdGV4dC5sZW5ndGggPCAyMDApIHtcbiAgICAgICAgICAgICAgICAvLyBGaWx0ZXIgb3V0IGNvbW1vbiBub24tdGl0bGUgY29udGVudFxuICAgICAgICAgICAgICAgIGlmICghdGV4dC50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKCdzaWduIGluJykgJiYgIXRleHQudG9Mb3dlckNhc2UoKS5pbmNsdWRlcygnbG9nIGluJykpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIFRyeSBkb2N1bWVudCB0aXRsZVxuICAgICAgICBjb25zdCBkb2NUaXRsZSA9IGRvY3VtZW50LnRpdGxlO1xuICAgICAgICBpZiAoZG9jVGl0bGUgJiYgZG9jVGl0bGUubGVuZ3RoID4gNSkge1xuICAgICAgICAgICAgLy8gUmVtb3ZlIGNvbW1vbiBzdWZmaXhlc1xuICAgICAgICAgICAgY29uc3QgY2xlYW5lZCA9IGRvY1RpdGxlXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xccypbLXxdXFxzKi4rJC8sICcnKVxuICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXHMqYXRcXHMrLiskL2ksICcnKVxuICAgICAgICAgICAgICAgIC50cmltKCk7XG4gICAgICAgICAgICBpZiAoY2xlYW5lZC5sZW5ndGggPiAzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNsZWFuZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGZpbmRDb21wYW55KCkge1xuICAgICAgICBjb25zdCBzZWxlY3RvcnMgPSBbXG4gICAgICAgICAgICAnW2NsYXNzKj1cImNvbXBhbnktbmFtZVwiXScsXG4gICAgICAgICAgICAnW2NsYXNzKj1cImVtcGxveWVyXCJdJyxcbiAgICAgICAgICAgICdbY2xhc3MqPVwib3JnYW5pemF0aW9uXCJdJyxcbiAgICAgICAgICAgICcuY29tcGFueScsXG4gICAgICAgICAgICAnLmVtcGxveWVyJyxcbiAgICAgICAgICAgICdhW2hyZWYqPVwiY29tcGFueVwiXScsXG4gICAgICAgIF07XG4gICAgICAgIGZvciAoY29uc3Qgc2VsZWN0b3Igb2Ygc2VsZWN0b3JzKSB7XG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0gdGhpcy5leHRyYWN0VGV4dENvbnRlbnQoc2VsZWN0b3IpO1xuICAgICAgICAgICAgaWYgKHRleHQgJiYgdGV4dC5sZW5ndGggPiAxICYmIHRleHQubGVuZ3RoIDwgMTAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gVHJ5IG1ldGEgdGFnc1xuICAgICAgICBjb25zdCBvZ1NpdGVOYW1lID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbWV0YVtwcm9wZXJ0eT1cIm9nOnNpdGVfbmFtZVwiXScpO1xuICAgICAgICBpZiAob2dTaXRlTmFtZSkge1xuICAgICAgICAgICAgY29uc3QgY29udGVudCA9IG9nU2l0ZU5hbWUuZ2V0QXR0cmlidXRlKCdjb250ZW50Jyk7XG4gICAgICAgICAgICBpZiAoY29udGVudClcbiAgICAgICAgICAgICAgICByZXR1cm4gY29udGVudDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZmluZERlc2NyaXB0aW9uKCkge1xuICAgICAgICBjb25zdCBzZWxlY3RvcnMgPSBbXG4gICAgICAgICAgICAnLmpvYi1kZXNjcmlwdGlvbicsXG4gICAgICAgICAgICAnLnBvc3RpbmctZGVzY3JpcHRpb24nLFxuICAgICAgICAgICAgJ1tjbGFzcyo9XCJqb2ItZGVzY3JpcHRpb25cIl0nLFxuICAgICAgICAgICAgJ1tjbGFzcyo9XCJwb3N0aW5nLWRlc2NyaXB0aW9uXCJdJyxcbiAgICAgICAgICAgICdbY2xhc3MqPVwiZGVzY3JpcHRpb25cIl0nLFxuICAgICAgICAgICAgJ2FydGljbGUnLFxuICAgICAgICAgICAgJy5jb250ZW50JyxcbiAgICAgICAgICAgICdtYWluJyxcbiAgICAgICAgXTtcbiAgICAgICAgZm9yIChjb25zdCBzZWxlY3RvciBvZiBzZWxlY3RvcnMpIHtcbiAgICAgICAgICAgIGNvbnN0IGh0bWwgPSB0aGlzLmV4dHJhY3RIdG1sQ29udGVudChzZWxlY3Rvcik7XG4gICAgICAgICAgICBpZiAoaHRtbCAmJiBodG1sLmxlbmd0aCA+IDEwMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNsZWFuRGVzY3JpcHRpb24oaHRtbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGZpbmRMb2NhdGlvbigpIHtcbiAgICAgICAgY29uc3Qgc2VsZWN0b3JzID0gW1xuICAgICAgICAgICAgJ1tjbGFzcyo9XCJsb2NhdGlvblwiXScsXG4gICAgICAgICAgICAnW2NsYXNzKj1cImFkZHJlc3NcIl0nLFxuICAgICAgICAgICAgJy5sb2NhdGlvbicsXG4gICAgICAgICAgICAnLmpvYi1sb2NhdGlvbicsXG4gICAgICAgIF07XG4gICAgICAgIGZvciAoY29uc3Qgc2VsZWN0b3Igb2Ygc2VsZWN0b3JzKSB7XG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0gdGhpcy5leHRyYWN0VGV4dENvbnRlbnQoc2VsZWN0b3IpO1xuICAgICAgICAgICAgaWYgKHRleHQgJiYgdGV4dC5sZW5ndGggPiAyICYmIHRleHQubGVuZ3RoIDwgMTAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGRldGVjdFNvdXJjZSgpIHtcbiAgICAgICAgY29uc3QgaG9zdG5hbWUgPSB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgLy8gUmVtb3ZlIGNvbW1vbiBwcmVmaXhlc1xuICAgICAgICBjb25zdCBjbGVhbmVkID0gaG9zdG5hbWVcbiAgICAgICAgICAgIC5yZXBsYWNlKC9ed3d3XFwuLywgJycpXG4gICAgICAgICAgICAucmVwbGFjZSgvXmpvYnNcXC4vLCAnJylcbiAgICAgICAgICAgIC5yZXBsYWNlKC9eY2FyZWVyc1xcLi8sICcnKTtcbiAgICAgICAgLy8gRXh0cmFjdCBtYWluIGRvbWFpblxuICAgICAgICBjb25zdCBwYXJ0cyA9IGNsZWFuZWQuc3BsaXQoJy4nKTtcbiAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA+PSAyKSB7XG4gICAgICAgICAgICByZXR1cm4gcGFydHNbcGFydHMubGVuZ3RoIC0gMl07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNsZWFuZWQ7XG4gICAgfVxufVxuIiwiLy8gU2NyYXBlciByZWdpc3RyeSAtIG1hcHMgVVJMcyB0byBhcHByb3ByaWF0ZSBzY3JhcGVyc1xuaW1wb3J0IHsgTGlua2VkSW5TY3JhcGVyIH0gZnJvbSAnLi9saW5rZWRpbi1zY3JhcGVyJztcbmltcG9ydCB7IFdhdGVybG9vV29ya3NTY3JhcGVyIH0gZnJvbSAnLi93YXRlcmxvby13b3Jrcy1zY3JhcGVyJztcbmltcG9ydCB7IEluZGVlZFNjcmFwZXIgfSBmcm9tICcuL2luZGVlZC1zY3JhcGVyJztcbmltcG9ydCB7IEdyZWVuaG91c2VTY3JhcGVyIH0gZnJvbSAnLi9ncmVlbmhvdXNlLXNjcmFwZXInO1xuaW1wb3J0IHsgTGV2ZXJTY3JhcGVyIH0gZnJvbSAnLi9sZXZlci1zY3JhcGVyJztcbmltcG9ydCB7IEdlbmVyaWNTY3JhcGVyIH0gZnJvbSAnLi9nZW5lcmljLXNjcmFwZXInO1xuLy8gSW5pdGlhbGl6ZSBhbGwgc2NyYXBlcnNcbmNvbnN0IHNjcmFwZXJzID0gW1xuICAgIG5ldyBMaW5rZWRJblNjcmFwZXIoKSxcbiAgICBuZXcgV2F0ZXJsb29Xb3Jrc1NjcmFwZXIoKSxcbiAgICBuZXcgSW5kZWVkU2NyYXBlcigpLFxuICAgIG5ldyBHcmVlbmhvdXNlU2NyYXBlcigpLFxuICAgIG5ldyBMZXZlclNjcmFwZXIoKSxcbl07XG5jb25zdCBnZW5lcmljU2NyYXBlciA9IG5ldyBHZW5lcmljU2NyYXBlcigpO1xuLyoqXG4gKiBHZXQgdGhlIGFwcHJvcHJpYXRlIHNjcmFwZXIgZm9yIGEgVVJMXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRTY3JhcGVyRm9yVXJsKHVybCkge1xuICAgIGNvbnN0IHNjcmFwZXIgPSBzY3JhcGVycy5maW5kKChzKSA9PiBzLmNhbkhhbmRsZSh1cmwpKTtcbiAgICByZXR1cm4gc2NyYXBlciB8fCBnZW5lcmljU2NyYXBlcjtcbn1cbi8qKlxuICogQ2hlY2sgaWYgd2UgaGF2ZSBhIHNwZWNpYWxpemVkIHNjcmFwZXIgZm9yIHRoaXMgVVJMXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBoYXNTcGVjaWFsaXplZFNjcmFwZXIodXJsKSB7XG4gICAgcmV0dXJuIHNjcmFwZXJzLnNvbWUoKHMpID0+IHMuY2FuSGFuZGxlKHVybCkpO1xufVxuLyoqXG4gKiBHZXQgYWxsIGF2YWlsYWJsZSBzY3JhcGVyIHNvdXJjZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEF2YWlsYWJsZVNvdXJjZXMoKSB7XG4gICAgcmV0dXJuIHNjcmFwZXJzLm1hcCgocykgPT4gcy5zb3VyY2UpO1xufVxuIiwiLy8gTWVzc2FnZSBwYXNzaW5nIHV0aWxpdGllcyBmb3IgZXh0ZW5zaW9uIGNvbW11bmljYXRpb25cbi8vIFR5cGUtc2FmZSBtZXNzYWdlIGNyZWF0b3JzXG5leHBvcnQgY29uc3QgTWVzc2FnZXMgPSB7XG4gICAgLy8gQXV0aCBtZXNzYWdlc1xuICAgIGdldEF1dGhTdGF0dXM6ICgpID0+ICh7IHR5cGU6ICdHRVRfQVVUSF9TVEFUVVMnIH0pLFxuICAgIG9wZW5BdXRoOiAoKSA9PiAoeyB0eXBlOiAnT1BFTl9BVVRIJyB9KSxcbiAgICBsb2dvdXQ6ICgpID0+ICh7IHR5cGU6ICdMT0dPVVQnIH0pLFxuICAgIC8vIFByb2ZpbGUgbWVzc2FnZXNcbiAgICBnZXRQcm9maWxlOiAoKSA9PiAoeyB0eXBlOiAnR0VUX1BST0ZJTEUnIH0pLFxuICAgIC8vIEZvcm0gZmlsbGluZyBtZXNzYWdlc1xuICAgIGZpbGxGb3JtOiAoZmllbGRzKSA9PiAoe1xuICAgICAgICB0eXBlOiAnRklMTF9GT1JNJyxcbiAgICAgICAgcGF5bG9hZDogZmllbGRzLFxuICAgIH0pLFxuICAgIC8vIFNjcmFwaW5nIG1lc3NhZ2VzXG4gICAgc2NyYXBlSm9iOiAoKSA9PiAoeyB0eXBlOiAnU0NSQVBFX0pPQicgfSksXG4gICAgc2NyYXBlSm9iTGlzdDogKCkgPT4gKHsgdHlwZTogJ1NDUkFQRV9KT0JfTElTVCcgfSksXG4gICAgaW1wb3J0Sm9iOiAoam9iKSA9PiAoe1xuICAgICAgICB0eXBlOiAnSU1QT1JUX0pPQicsXG4gICAgICAgIHBheWxvYWQ6IGpvYixcbiAgICB9KSxcbiAgICBpbXBvcnRKb2JzQmF0Y2g6IChqb2JzKSA9PiAoe1xuICAgICAgICB0eXBlOiAnSU1QT1JUX0pPQlNfQkFUQ0gnLFxuICAgICAgICBwYXlsb2FkOiBqb2JzLFxuICAgIH0pLFxuICAgIC8vIExlYXJuaW5nIG1lc3NhZ2VzXG4gICAgc2F2ZUFuc3dlcjogKGRhdGEpID0+ICh7XG4gICAgICAgIHR5cGU6ICdTQVZFX0FOU1dFUicsXG4gICAgICAgIHBheWxvYWQ6IGRhdGEsXG4gICAgfSksXG4gICAgc2VhcmNoQW5zd2VyczogKHF1ZXN0aW9uKSA9PiAoe1xuICAgICAgICB0eXBlOiAnU0VBUkNIX0FOU1dFUlMnLFxuICAgICAgICBwYXlsb2FkOiBxdWVzdGlvbixcbiAgICB9KSxcbn07XG4vLyBTZW5kIG1lc3NhZ2UgdG8gYmFja2dyb3VuZCBzY3JpcHRcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZW5kTWVzc2FnZShtZXNzYWdlKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKG1lc3NhZ2UsIChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcikge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGNocm9tZS5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXNwb25zZSB8fCB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ05vIHJlc3BvbnNlIHJlY2VpdmVkJyB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG4vLyBTZW5kIG1lc3NhZ2UgdG8gY29udGVudCBzY3JpcHQgaW4gc3BlY2lmaWMgdGFiXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2VuZFRvVGFiKHRhYklkLCBtZXNzYWdlKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYklkLCBtZXNzYWdlLCAocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgIGlmIChjaHJvbWUucnVudGltZS5sYXN0RXJyb3IpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBjaHJvbWUucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzcG9uc2UgfHwgeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdObyByZXNwb25zZSByZWNlaXZlZCcgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuLy8gU2VuZCBtZXNzYWdlIHRvIGFsbCBjb250ZW50IHNjcmlwdHNcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBicm9hZGNhc3RNZXNzYWdlKG1lc3NhZ2UpIHtcbiAgICBjb25zdCB0YWJzID0gYXdhaXQgY2hyb21lLnRhYnMucXVlcnkoe30pO1xuICAgIGZvciAoY29uc3QgdGFiIG9mIHRhYnMpIHtcbiAgICAgICAgaWYgKHRhYi5pZCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBhd2FpdCBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWIuaWQsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2gge1xuICAgICAgICAgICAgICAgIC8vIFRhYiBtaWdodCBub3QgaGF2ZSBjb250ZW50IHNjcmlwdCBsb2FkZWRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vIFNoYXJlZCB0eXBlcyBmb3IgQ29sdW1idXMgZXh0ZW5zaW9uXG5leHBvcnQgY29uc3QgREVGQVVMVF9TRVRUSU5HUyA9IHtcbiAgICBhdXRvRmlsbEVuYWJsZWQ6IHRydWUsXG4gICAgc2hvd0NvbmZpZGVuY2VJbmRpY2F0b3JzOiB0cnVlLFxuICAgIG1pbmltdW1Db25maWRlbmNlOiAwLjUsXG4gICAgbGVhcm5Gcm9tQW5zd2VyczogdHJ1ZSxcbiAgICBhdXRvRGV0ZWN0UHJvbXB0czogdHJ1ZSxcbiAgICBub3RpZnlPbkpvYkRldGVjdGVkOiB0cnVlLFxuICAgIHNob3dTYWxhcnlPdmVybGF5OiB0cnVlLFxuICAgIGVuYWJsZUpvYlNjcmFwaW5nOiB0cnVlLFxuICAgIGVuYWJsZWRTY3JhcGVyU291cmNlczogWydsaW5rZWRpbicsICdpbmRlZWQnLCAnZ3JlZW5ob3VzZScsICdsZXZlcicsICd3YXRlcmxvb3dvcmtzJywgJ3Vua25vd24nXSxcbn07XG5leHBvcnQgY29uc3QgREVGQVVMVF9BUElfQkFTRV9VUkwgPSAnaHR0cDovL2xvY2FsaG9zdDozMDAwJztcbiIsIi8vIEV4dGVuc2lvbiBzdG9yYWdlIHV0aWxpdGllc1xuaW1wb3J0IHsgREVGQVVMVF9TRVRUSU5HUywgREVGQVVMVF9BUElfQkFTRV9VUkwgfSBmcm9tICdAL3NoYXJlZC90eXBlcyc7XG5jb25zdCBTVE9SQUdFX0tFWSA9ICdjb2x1bWJ1c19leHRlbnNpb24nO1xuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlU2V0dGluZ3NXaXRoRGVmYXVsdHMoc2V0dGluZ3MpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICAuLi5ERUZBVUxUX1NFVFRJTkdTLFxuICAgICAgICAuLi5zZXR0aW5ncyxcbiAgICB9O1xufVxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFN0b3JhZ2UoKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChTVE9SQUdFX0tFWSwgKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc3RvcmVkID0gcmVzdWx0W1NUT1JBR0VfS0VZXTtcbiAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgIGFwaUJhc2VVcmw6IERFRkFVTFRfQVBJX0JBU0VfVVJMLFxuICAgICAgICAgICAgICAgIC4uLnN0b3JlZCxcbiAgICAgICAgICAgICAgICBzZXR0aW5nczogbWVyZ2VTZXR0aW5nc1dpdGhEZWZhdWx0cyhzdG9yZWQ/LnNldHRpbmdzKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn1cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRTdG9yYWdlKHVwZGF0ZXMpIHtcbiAgICBjb25zdCBjdXJyZW50ID0gYXdhaXQgZ2V0U3RvcmFnZSgpO1xuICAgIGNvbnN0IHVwZGF0ZWQgPSB7IC4uLmN1cnJlbnQsIC4uLnVwZGF0ZXMgfTtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHsgW1NUT1JBR0VfS0VZXTogdXBkYXRlZCB9LCByZXNvbHZlKTtcbiAgICB9KTtcbn1cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbGVhclN0b3JhZ2UoKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnJlbW92ZShTVE9SQUdFX0tFWSwgcmVzb2x2ZSk7XG4gICAgfSk7XG59XG4vLyBBdXRoIHRva2VuIGhlbHBlcnNcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRBdXRoVG9rZW4odG9rZW4sIGV4cGlyZXNBdCkge1xuICAgIGF3YWl0IHNldFN0b3JhZ2Uoe1xuICAgICAgICBhdXRoVG9rZW46IHRva2VuLFxuICAgICAgICB0b2tlbkV4cGlyeTogZXhwaXJlc0F0LFxuICAgIH0pO1xufVxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsZWFyQXV0aFRva2VuKCkge1xuICAgIGF3YWl0IHNldFN0b3JhZ2Uoe1xuICAgICAgICBhdXRoVG9rZW46IHVuZGVmaW5lZCxcbiAgICAgICAgdG9rZW5FeHBpcnk6IHVuZGVmaW5lZCxcbiAgICAgICAgY2FjaGVkUHJvZmlsZTogdW5kZWZpbmVkLFxuICAgICAgICBwcm9maWxlQ2FjaGVkQXQ6IHVuZGVmaW5lZCxcbiAgICB9KTtcbn1cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRBdXRoVG9rZW4oKSB7XG4gICAgY29uc3Qgc3RvcmFnZSA9IGF3YWl0IGdldFN0b3JhZ2UoKTtcbiAgICBpZiAoIXN0b3JhZ2UuYXV0aFRva2VuKVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAvLyBDaGVjayBleHBpcnlcbiAgICBpZiAoc3RvcmFnZS50b2tlbkV4cGlyeSkge1xuICAgICAgICBjb25zdCBleHBpcnkgPSBuZXcgRGF0ZShzdG9yYWdlLnRva2VuRXhwaXJ5KTtcbiAgICAgICAgaWYgKGV4cGlyeSA8IG5ldyBEYXRlKCkpIHtcbiAgICAgICAgICAgIGF3YWl0IGNsZWFyQXV0aFRva2VuKCk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc3RvcmFnZS5hdXRoVG9rZW47XG59XG4vLyBQcm9maWxlIGNhY2hlIGhlbHBlcnNcbmNvbnN0IFBST0ZJTEVfQ0FDSEVfVFRMID0gNSAqIDYwICogMTAwMDsgLy8gNSBtaW51dGVzXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0Q2FjaGVkUHJvZmlsZSgpIHtcbiAgICBjb25zdCBzdG9yYWdlID0gYXdhaXQgZ2V0U3RvcmFnZSgpO1xuICAgIGlmICghc3RvcmFnZS5jYWNoZWRQcm9maWxlIHx8ICFzdG9yYWdlLnByb2ZpbGVDYWNoZWRBdCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgY2FjaGVkQXQgPSBuZXcgRGF0ZShzdG9yYWdlLnByb2ZpbGVDYWNoZWRBdCk7XG4gICAgaWYgKERhdGUubm93KCkgLSBjYWNoZWRBdC5nZXRUaW1lKCkgPiBQUk9GSUxFX0NBQ0hFX1RUTCkge1xuICAgICAgICByZXR1cm4gbnVsbDsgLy8gQ2FjaGUgZXhwaXJlZFxuICAgIH1cbiAgICByZXR1cm4gc3RvcmFnZS5jYWNoZWRQcm9maWxlO1xufVxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldENhY2hlZFByb2ZpbGUocHJvZmlsZSkge1xuICAgIGF3YWl0IHNldFN0b3JhZ2Uoe1xuICAgICAgICBjYWNoZWRQcm9maWxlOiBwcm9maWxlLFxuICAgICAgICBwcm9maWxlQ2FjaGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICB9KTtcbn1cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbGVhckNhY2hlZFByb2ZpbGUoKSB7XG4gICAgYXdhaXQgc2V0U3RvcmFnZSh7XG4gICAgICAgIGNhY2hlZFByb2ZpbGU6IHVuZGVmaW5lZCxcbiAgICAgICAgcHJvZmlsZUNhY2hlZEF0OiB1bmRlZmluZWQsXG4gICAgfSk7XG59XG4vLyBTZXR0aW5ncyBoZWxwZXJzXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0U2V0dGluZ3MoKSB7XG4gICAgY29uc3Qgc3RvcmFnZSA9IGF3YWl0IGdldFN0b3JhZ2UoKTtcbiAgICByZXR1cm4gc3RvcmFnZS5zZXR0aW5ncztcbn1cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB1cGRhdGVTZXR0aW5ncyh1cGRhdGVzKSB7XG4gICAgY29uc3Qgc3RvcmFnZSA9IGF3YWl0IGdldFN0b3JhZ2UoKTtcbiAgICBjb25zdCB1cGRhdGVkID0gbWVyZ2VTZXR0aW5nc1dpdGhEZWZhdWx0cyh7IC4uLnN0b3JhZ2Uuc2V0dGluZ3MsIC4uLnVwZGF0ZXMgfSk7XG4gICAgYXdhaXQgc2V0U3RvcmFnZSh7IHNldHRpbmdzOiB1cGRhdGVkIH0pO1xuICAgIHJldHVybiB1cGRhdGVkO1xufVxuLy8gQVBJIFVSTCBoZWxwZXJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRBcGlCYXNlVXJsKHVybCkge1xuICAgIGF3YWl0IHNldFN0b3JhZ2UoeyBhcGlCYXNlVXJsOiB1cmwgfSk7XG59XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QXBpQmFzZVVybCgpIHtcbiAgICBjb25zdCBzdG9yYWdlID0gYXdhaXQgZ2V0U3RvcmFnZSgpO1xuICAgIHJldHVybiBzdG9yYWdlLmFwaUJhc2VVcmw7XG59XG4iLCIvLyBDb250ZW50IHNjcmlwdCBlbnRyeSBwb2ludCBmb3IgQ29sdW1idXMgZXh0ZW5zaW9uXG4vLyBJbXBvcnQgc3R5bGVzIGZvciBjb250ZW50IHNjcmlwdFxuaW1wb3J0ICcuL3VpL3N0eWxlcy5jc3MnO1xuaW1wb3J0IHsgRmllbGREZXRlY3RvciB9IGZyb20gJy4vYXV0by1maWxsL2ZpZWxkLWRldGVjdG9yJztcbmltcG9ydCB7IEZpZWxkTWFwcGVyIH0gZnJvbSAnLi9hdXRvLWZpbGwvZmllbGQtbWFwcGVyJztcbmltcG9ydCB7IEF1dG9GaWxsRW5naW5lIH0gZnJvbSAnLi9hdXRvLWZpbGwvZW5naW5lJztcbmltcG9ydCB7IGdldFNjcmFwZXJGb3JVcmwgfSBmcm9tICcuL3NjcmFwZXJzL3NjcmFwZXItcmVnaXN0cnknO1xuaW1wb3J0IHsgc2VuZE1lc3NhZ2UsIE1lc3NhZ2VzIH0gZnJvbSAnQC9zaGFyZWQvbWVzc2FnZXMnO1xuaW1wb3J0IHsgZ2V0U2V0dGluZ3MgfSBmcm9tICdAL2JhY2tncm91bmQvc3RvcmFnZSc7XG4vLyBJbml0aWFsaXplIGNvbXBvbmVudHNcbmNvbnN0IGZpZWxkRGV0ZWN0b3IgPSBuZXcgRmllbGREZXRlY3RvcigpO1xubGV0IGF1dG9GaWxsRW5naW5lID0gbnVsbDtcbmxldCBjYWNoZWRQcm9maWxlID0gbnVsbDtcbmxldCBkZXRlY3RlZEZpZWxkcyA9IFtdO1xubGV0IHNjcmFwZWRKb2IgPSBudWxsO1xuLy8gU2NhbiBwYWdlIG9uIGxvYWRcbnNjYW5QYWdlKCk7XG4vLyBSZS1zY2FuIG9uIGR5bmFtaWMgY29udGVudCBjaGFuZ2VzXG5jb25zdCBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGRlYm91bmNlKHNjYW5QYWdlLCA1MDApKTtcbm9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQuYm9keSwgeyBjaGlsZExpc3Q6IHRydWUsIHN1YnRyZWU6IHRydWUgfSk7XG5hc3luYyBmdW5jdGlvbiBzY2FuUGFnZSgpIHtcbiAgICBjb25zdCBzZXR0aW5ncyA9IGF3YWl0IGdldFNldHRpbmdzKCk7XG4gICAgLy8gRGV0ZWN0IGZvcm1zXG4gICAgaWYgKHNldHRpbmdzLmF1dG9GaWxsRW5hYmxlZCkge1xuICAgICAgICBjb25zdCBmb3JtcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2Zvcm0nKTtcbiAgICAgICAgZm9yIChjb25zdCBmb3JtIG9mIGZvcm1zKSB7XG4gICAgICAgICAgICBjb25zdCBmaWVsZHMgPSBmaWVsZERldGVjdG9yXG4gICAgICAgICAgICAgICAgLmRldGVjdEZpZWxkcyhmb3JtKVxuICAgICAgICAgICAgICAgIC5maWx0ZXIoKGZpZWxkKSA9PiBmaWVsZC5jb25maWRlbmNlID49IHNldHRpbmdzLm1pbmltdW1Db25maWRlbmNlKVxuICAgICAgICAgICAgICAgIC5maWx0ZXIoKGZpZWxkKSA9PiBzZXR0aW5ncy5hdXRvRGV0ZWN0UHJvbXB0cyB8fCBmaWVsZC5maWVsZFR5cGUgIT09ICdjdXN0b21RdWVzdGlvbicpO1xuICAgICAgICAgICAgaWYgKGZpZWxkcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgZGV0ZWN0ZWRGaWVsZHMgPSBmaWVsZHM7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tDb2x1bWJ1c10gRGV0ZWN0ZWQgZmllbGRzOicsIGZpZWxkcy5sZW5ndGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBkZXRlY3RlZEZpZWxkcyA9IFtdO1xuICAgIH1cbiAgICAvLyBDaGVjayBmb3Igam9iIGxpc3RpbmdcbiAgICBjb25zdCBzY3JhcGVyID0gZ2V0U2NyYXBlckZvclVybCh3aW5kb3cubG9jYXRpb24uaHJlZik7XG4gICAgaWYgKHNldHRpbmdzLmVuYWJsZUpvYlNjcmFwaW5nICYmXG4gICAgICAgIHNldHRpbmdzLmVuYWJsZWRTY3JhcGVyU291cmNlcy5pbmNsdWRlcyhzY3JhcGVyLnNvdXJjZSkgJiZcbiAgICAgICAgc2NyYXBlci5jYW5IYW5kbGUod2luZG93LmxvY2F0aW9uLmhyZWYpKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBzY3JhcGVkSm9iID0gYXdhaXQgc2NyYXBlci5zY3JhcGVKb2JMaXN0aW5nKCk7XG4gICAgICAgICAgICBpZiAoc2NyYXBlZEpvYikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbQ29sdW1idXNdIFNjcmFwZWQgam9iOicsIHNjcmFwZWRKb2IudGl0bGUpO1xuICAgICAgICAgICAgICAgIHN5bmNTYWxhcnlPdmVybGF5KHNjcmFwZWRKb2IsIHNldHRpbmdzLnNob3dTYWxhcnlPdmVybGF5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbQ29sdW1idXNdIFNjcmFwZSBlcnJvcjonLCBlcnIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBzY3JhcGVkSm9iID0gbnVsbDtcbiAgICAgICAgc3luY1NhbGFyeU92ZXJsYXkobnVsbCwgZmFsc2UpO1xuICAgIH1cbn1cbi8vIEhhbmRsZSBtZXNzYWdlcyBmcm9tIHBvcHVwIGFuZCBiYWNrZ3JvdW5kXG5jaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoKG1lc3NhZ2UsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XG4gICAgaGFuZGxlTWVzc2FnZShtZXNzYWdlKVxuICAgICAgICAudGhlbihzZW5kUmVzcG9uc2UpXG4gICAgICAgIC5jYXRjaCgoZXJyKSA9PiBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVyci5tZXNzYWdlIH0pKTtcbiAgICByZXR1cm4gdHJ1ZTsgLy8gQXN5bmMgcmVzcG9uc2Vcbn0pO1xuYXN5bmMgZnVuY3Rpb24gaGFuZGxlTWVzc2FnZShtZXNzYWdlKSB7XG4gICAgc3dpdGNoIChtZXNzYWdlLnR5cGUpIHtcbiAgICAgICAgY2FzZSAnR0VUX1BBR0VfU1RBVFVTJzpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgaGFzRm9ybTogZGV0ZWN0ZWRGaWVsZHMubGVuZ3RoID4gMCxcbiAgICAgICAgICAgICAgICBoYXNKb2JMaXN0aW5nOiBzY3JhcGVkSm9iICE9PSBudWxsLFxuICAgICAgICAgICAgICAgIGRldGVjdGVkRmllbGRzOiBkZXRlY3RlZEZpZWxkcy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgc2NyYXBlZEpvYixcbiAgICAgICAgICAgIH07XG4gICAgICAgIGNhc2UgJ1RSSUdHRVJfRklMTCc6XG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlRmlsbEZvcm0oKTtcbiAgICAgICAgY2FzZSAnVFJJR0dFUl9JTVBPUlQnOlxuICAgICAgICAgICAgaWYgKHNjcmFwZWRKb2IpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VuZE1lc3NhZ2UoTWVzc2FnZXMuaW1wb3J0Sm9iKHNjcmFwZWRKb2IpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ05vIGpvYiBkZXRlY3RlZCcgfTtcbiAgICAgICAgY2FzZSAnU0NSQVBFX0pPQic6XG4gICAgICAgICAgICBjb25zdCBzY3JhcGVyID0gZ2V0U2NyYXBlckZvclVybCh3aW5kb3cubG9jYXRpb24uaHJlZik7XG4gICAgICAgICAgICBpZiAoc2NyYXBlci5jYW5IYW5kbGUod2luZG93LmxvY2F0aW9uLmhyZWYpKSB7XG4gICAgICAgICAgICAgICAgc2NyYXBlZEpvYiA9IGF3YWl0IHNjcmFwZXIuc2NyYXBlSm9iTGlzdGluZygpO1xuICAgICAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHNjcmFwZWRKb2IgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ05vIHNjcmFwZXIgYXZhaWxhYmxlIGZvciB0aGlzIHNpdGUnIH07XG4gICAgICAgIGNhc2UgJ1NDUkFQRV9KT0JfTElTVCc6XG4gICAgICAgICAgICBjb25zdCBsaXN0U2NyYXBlciA9IGdldFNjcmFwZXJGb3JVcmwod2luZG93LmxvY2F0aW9uLmhyZWYpO1xuICAgICAgICAgICAgaWYgKGxpc3RTY3JhcGVyLmNhbkhhbmRsZSh3aW5kb3cubG9jYXRpb24uaHJlZikpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBqb2JzID0gYXdhaXQgbGlzdFNjcmFwZXIuc2NyYXBlSm9iTGlzdCgpO1xuICAgICAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IGpvYnMgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ05vIHNjcmFwZXIgYXZhaWxhYmxlIGZvciB0aGlzIHNpdGUnIH07XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBVbmtub3duIG1lc3NhZ2UgdHlwZTogJHttZXNzYWdlLnR5cGV9YCB9O1xuICAgIH1cbn1cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUZpbGxGb3JtKCkge1xuICAgIGNvbnN0IHNldHRpbmdzID0gYXdhaXQgZ2V0U2V0dGluZ3MoKTtcbiAgICBpZiAoIXNldHRpbmdzLmF1dG9GaWxsRW5hYmxlZCkge1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdBdXRvLWZpbGwgaXMgZGlzYWJsZWQnIH07XG4gICAgfVxuICAgIGlmIChkZXRlY3RlZEZpZWxkcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnTm8gZmllbGRzIGRldGVjdGVkJyB9O1xuICAgIH1cbiAgICAvLyBHZXQgcHJvZmlsZSBpZiBub3QgY2FjaGVkXG4gICAgaWYgKCFjYWNoZWRQcm9maWxlKSB7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgc2VuZE1lc3NhZ2UoTWVzc2FnZXMuZ2V0UHJvZmlsZSgpKTtcbiAgICAgICAgaWYgKCFyZXNwb25zZS5zdWNjZXNzIHx8ICFyZXNwb25zZS5kYXRhKSB7XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdGYWlsZWQgdG8gbG9hZCBwcm9maWxlJyB9O1xuICAgICAgICB9XG4gICAgICAgIGNhY2hlZFByb2ZpbGUgPSByZXNwb25zZS5kYXRhO1xuICAgIH1cbiAgICAvLyBDcmVhdGUgbWFwcGVyIGFuZCBlbmdpbmVcbiAgICBjb25zdCBtYXBwZXIgPSBuZXcgRmllbGRNYXBwZXIoY2FjaGVkUHJvZmlsZSk7XG4gICAgYXV0b0ZpbGxFbmdpbmUgPSBuZXcgQXV0b0ZpbGxFbmdpbmUoZmllbGREZXRlY3RvciwgbWFwcGVyKTtcbiAgICAvLyBGaWxsIHRoZSBmb3JtXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXV0b0ZpbGxFbmdpbmUuZmlsbEZvcm0oZGV0ZWN0ZWRGaWVsZHMpO1xuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHJlc3VsdCB9O1xufVxuZnVuY3Rpb24gc3luY1NhbGFyeU92ZXJsYXkoam9iLCBlbmFibGVkKSB7XG4gICAgY29uc3QgZXhpc3RpbmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29sdW1idXMtc2FsYXJ5LW92ZXJsYXknKTtcbiAgICBpZiAoIWVuYWJsZWQgfHwgIWpvYj8uc2FsYXJ5KSB7XG4gICAgICAgIGV4aXN0aW5nPy5yZW1vdmUoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBvdmVybGF5ID0gZXhpc3RpbmcgfHwgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgb3ZlcmxheS5pZCA9ICdjb2x1bWJ1cy1zYWxhcnktb3ZlcmxheSc7XG4gICAgb3ZlcmxheS50ZXh0Q29udGVudCA9IGBTYWxhcnk6ICR7am9iLnNhbGFyeX1gO1xuICAgIG92ZXJsYXkuc2V0QXR0cmlidXRlKCdyb2xlJywgJ3N0YXR1cycpO1xuICAgIG92ZXJsYXkuc3R5bGUuY3NzVGV4dCA9IGBcbiAgICBwb3NpdGlvbjogZml4ZWQ7XG4gICAgcmlnaHQ6IDIwcHg7XG4gICAgYm90dG9tOiAyMHB4O1xuICAgIHotaW5kZXg6IDk5OTk5OTtcbiAgICBwYWRkaW5nOiAxMHB4IDE0cHg7XG4gICAgYm9yZGVyLXJhZGl1czogOHB4O1xuICAgIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCgxMzVkZWcsICMxNGI4YTYsICMwZWE1ZTkpO1xuICAgIGNvbG9yOiB3aGl0ZTtcbiAgICBmb250OiA1MDAgMTNweCAtYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsIHNhbnMtc2VyaWY7XG4gICAgYm94LXNoYWRvdzogMCA0cHggMTZweCByZ2JhKDAsMCwwLDAuMTYpO1xuICBgO1xuICAgIGlmICghZXhpc3RpbmcpIHtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChvdmVybGF5KTtcbiAgICB9XG59XG4vLyBVdGlsaXR5OiBkZWJvdW5jZSBmdW5jdGlvblxuZnVuY3Rpb24gZGVib3VuY2UoZm4sIGRlbGF5KSB7XG4gICAgbGV0IHRpbWVvdXRJZDtcbiAgICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgICAgIHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoKCkgPT4gZm4oLi4uYXJncyksIGRlbGF5KTtcbiAgICB9O1xufVxuY29uc29sZS5sb2coJ1tDb2x1bWJ1c10gQ29udGVudCBzY3JpcHQgbG9hZGVkJyk7XG4iXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9