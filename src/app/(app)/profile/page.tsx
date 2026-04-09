"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Briefcase,
  FileText,
  Github,
  GraduationCap,
  Link as LinkIcon,
  Loader2,
  Mail,
  MapPin,
  Phone,
  User,
  Wrench,
} from "lucide-react";
import { EducationCard } from "@/features/profile/components/education-card";
import { EmptyProfileState } from "@/features/profile/components/empty-profile-state";
import { ExperienceCard } from "@/features/profile/components/experience-card";
import { FormField } from "@/features/profile/components/form-field";
import { ProfileEmptySectionState } from "@/features/profile/components/profile-empty-section-state";
import { ProfileHeader } from "@/features/profile/components/profile-header";
import { ProfileSaveBar } from "@/features/profile/components/profile-save-bar";
import { ProfileSection } from "@/features/profile/components/profile-section";
import { SkillTag } from "@/features/profile/components/skill-tag";
import { useProfileEditor } from "@/features/profile/hooks/use-profile-editor";

export default function ProfilePage() {
  const {
    addEducation,
    addExperience,
    addSkill,
    completeness,
    expandedSections,
    fetchProfile,
    hasChanges,
    loading,
    profile,
    removeEducation,
    removeExperience,
    removeSkill,
    saveProfile,
    saveStatus,
    saving,
    toggleSection,
    updateEducation,
    updateExperience,
    updateField,
    updateSkill,
  } = useProfileEditor();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <EmptyProfileState />;
  }

  return (
    <div className="min-h-screen pb-24">
      <ProfileHeader
        completeness={completeness}
        name={profile.contact?.name || "My Profile"}
      />

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-4">
          <ProfileSection
            title="Contact Information"
            icon={User}
            itemCount={`${[profile.contact?.name, profile.contact?.email, profile.contact?.phone].filter(Boolean).length}/6 fields`}
            expanded={expandedSections.has("contact")}
            onToggle={() => toggleSection("contact")}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Full Name" icon={User}>
                <Input
                  value={profile.contact?.name || ""}
                  onChange={(e) =>
                    updateField("contact", { ...profile.contact, name: e.target.value })
                  }
                  placeholder="John Doe"
                />
              </FormField>
              <FormField label="Email Address" icon={Mail}>
                <Input
                  type="email"
                  value={profile.contact?.email || ""}
                  onChange={(e) =>
                    updateField("contact", { ...profile.contact, email: e.target.value })
                  }
                  placeholder="john@example.com"
                />
              </FormField>
              <FormField label="Phone Number" icon={Phone}>
                <Input
                  value={profile.contact?.phone || ""}
                  onChange={(e) =>
                    updateField("contact", { ...profile.contact, phone: e.target.value })
                  }
                  placeholder="+1 (555) 000-0000"
                />
              </FormField>
              <FormField label="Location" icon={MapPin}>
                <Input
                  value={profile.contact?.location || ""}
                  onChange={(e) =>
                    updateField("contact", { ...profile.contact, location: e.target.value })
                  }
                  placeholder="San Francisco, CA"
                />
              </FormField>
              <FormField label="LinkedIn" icon={LinkIcon}>
                <Input
                  value={profile.contact?.linkedin || ""}
                  onChange={(e) =>
                    updateField("contact", { ...profile.contact, linkedin: e.target.value })
                  }
                  placeholder="linkedin.com/in/johndoe"
                />
              </FormField>
              <FormField label="GitHub" icon={Github}>
                <Input
                  value={profile.contact?.github || ""}
                  onChange={(e) =>
                    updateField("contact", { ...profile.contact, github: e.target.value })
                  }
                  placeholder="github.com/johndoe"
                />
              </FormField>
            </div>
          </ProfileSection>

          {/* Professional Summary */}
          <ProfileSection
            title="Professional Summary"
            icon={FileText}
            itemCount={profile.summary ? `${profile.summary.length} chars` : "Empty"}
            expanded={expandedSections.has("summary")}
            onToggle={() => toggleSection("summary")}
          >
            <div className="space-y-2">
              <Textarea
                rows={5}
                value={profile.summary || ""}
                onChange={(e) => updateField("summary", e.target.value)}
                placeholder="Write a compelling summary of your professional background, key achievements, and career objectives..."
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Tip: A good summary is 2-4 sentences highlighting your key strengths and experience.
              </p>
            </div>
          </ProfileSection>

          {/* Experience */}
          <ProfileSection
            title="Work Experience"
            icon={Briefcase}
            itemCount={`${profile.experiences.length} positions`}
            expanded={expandedSections.has("experience")}
            onToggle={() => toggleSection("experience")}
            onAdd={addExperience}
            addLabel="Add Position"
          >
            {profile.experiences.length === 0 ? (
              <ProfileEmptySectionState
                icon={Briefcase}
                message="No work experience added yet"
                actionLabel="Add Experience"
                onAction={addExperience}
              />
            ) : (
              <div className="space-y-4">
                {profile.experiences.map((exp, index) => (
                  <ExperienceCard
                    key={exp.id}
                    experience={exp}
                    onChange={(updated) => updateExperience(index, updated)}
                    onRemove={() => removeExperience(index)}
                  />
                ))}
              </div>
            )}
          </ProfileSection>

          {/* Education */}
          <ProfileSection
            title="Education"
            icon={GraduationCap}
            itemCount={`${profile.education.length} entries`}
            expanded={expandedSections.has("education")}
            onToggle={() => toggleSection("education")}
            onAdd={addEducation}
            addLabel="Add Education"
          >
            {profile.education.length === 0 ? (
              <ProfileEmptySectionState
                icon={GraduationCap}
                message="No education added yet"
                actionLabel="Add Education"
                onAction={addEducation}
              />
            ) : (
              <div className="space-y-4">
                {profile.education.map((edu, index) => (
                  <EducationCard
                    key={edu.id}
                    education={edu}
                    onChange={(updated) => updateEducation(index, updated)}
                    onRemove={() => removeEducation(index)}
                  />
                ))}
              </div>
            )}
          </ProfileSection>

          {/* Skills */}
          <ProfileSection
            title="Skills"
            icon={Wrench}
            itemCount={`${profile.skills.length} skills`}
            expanded={expandedSections.has("skills")}
            onToggle={() => toggleSection("skills")}
            onAdd={addSkill}
            addLabel="Add Skill"
          >
            {profile.skills.length === 0 ? (
              <ProfileEmptySectionState
                icon={Wrench}
                message="No skills added yet"
                actionLabel="Add Skill"
                onAction={addSkill}
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <SkillTag
                    key={skill.id}
                    skill={skill}
                    onChange={(updated) => updateSkill(index, updated)}
                    onRemove={() => removeSkill(index)}
                  />
                ))}
              </div>
            )}
          </ProfileSection>
        </div>
      </div>

      <ProfileSaveBar
        hasChanges={hasChanges}
        onDiscard={fetchProfile}
        onSave={saveProfile}
        saveStatus={saveStatus}
        saving={saving}
      />
    </div>
  );
}
