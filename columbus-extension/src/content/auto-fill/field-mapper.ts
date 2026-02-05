// Field-to-profile value mapping

import type { ExtensionProfile, FieldType, DetectedField } from '@/shared/types';

export class FieldMapper {
  private profile: ExtensionProfile;

  constructor(profile: ExtensionProfile) {
    this.profile = profile;
  }

  mapFieldToValue(field: DetectedField): string | null {
    const fieldType = field.fieldType;
    const mapping = this.getMappings();
    const mapper = mapping[fieldType];

    if (mapper) {
      return mapper();
    }

    return null;
  }

  private getMappings(): Record<FieldType, () => string | null> {
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

  private extractCity(location?: string): string | null {
    if (!location) return null;
    // Common pattern: "City, State" or "City, State, Country"
    const parts = location.split(',').map((p) => p.trim());
    return parts[0] || null;
  }

  private extractState(location?: string): string | null {
    if (!location) return null;
    const parts = location.split(',').map((p) => p.trim());
    if (parts.length >= 2) {
      // Handle "CA" or "California" or "CA 94105"
      const state = parts[1].split(' ')[0];
      return state || null;
    }
    return null;
  }

  private extractCountry(location?: string): string | null {
    if (!location) return null;
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

  private formatEducation(): string | null {
    const edu = this.profile.education?.[0];
    if (!edu) return null;
    return `${edu.degree} in ${edu.field} from ${edu.institution}`;
  }

  private formatExperience(): string | null {
    const exps = this.profile.experiences;
    if (!exps || exps.length === 0) return null;

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
  getAllMappedValues(fields: DetectedField[]): Map<HTMLElement, string> {
    const values = new Map<HTMLElement, string>();

    for (const field of fields) {
      const value = this.mapFieldToValue(field);
      if (value) {
        values.set(field.element, value);
      }
    }

    return values;
  }
}
