"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Plus,
  Trash2,
  Save,
  RefreshCw,
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  FileText,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  MapPin,
  Link as LinkIcon,
  Github,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { Profile, Experience, Education, Skill } from "@/types";
import { generateId } from "@/lib/utils";

type Section = "contact" | "summary" | "experience" | "education" | "skills";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<Section>>(
    new Set<Section>(["contact", "summary", "experience", "education", "skills"])
  );
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      setProfile(data.profile);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    setSaveStatus("idle");
    try {
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      setHasChanges(false);
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      console.error("Failed to save profile:", error);
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

  const updateField = <K extends keyof Profile>(field: K, value: Profile[K]) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
    setHasChanges(true);
  };

  const toggleSection = (section: Section) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const addExperience = () => {
    if (!profile) return;
    const newExp: Experience = {
      id: generateId(),
      company: "",
      title: "",
      startDate: "",
      current: false,
      description: "",
      highlights: [],
      skills: [],
    };
    updateField("experiences", [...profile.experiences, newExp]);
  };

  const updateExperience = (index: number, exp: Experience) => {
    if (!profile) return;
    const updated = [...profile.experiences];
    updated[index] = exp;
    updateField("experiences", updated);
  };

  const removeExperience = (index: number) => {
    if (!profile) return;
    updateField("experiences", profile.experiences.filter((_, i) => i !== index));
  };

  const addEducation = () => {
    if (!profile) return;
    const newEdu: Education = {
      id: generateId(),
      institution: "",
      degree: "",
      field: "",
      highlights: [],
    };
    updateField("education", [...profile.education, newEdu]);
  };

  const updateEducation = (index: number, edu: Education) => {
    if (!profile) return;
    const updated = [...profile.education];
    updated[index] = edu;
    updateField("education", updated);
  };

  const removeEducation = (index: number) => {
    if (!profile) return;
    updateField("education", profile.education.filter((_, i) => i !== index));
  };

  const addSkill = () => {
    if (!profile) return;
    const newSkill: Skill = {
      id: generateId(),
      name: "",
      category: "technical",
    };
    updateField("skills", [...profile.skills, newSkill]);
  };

  const updateSkill = (index: number, skill: Skill) => {
    if (!profile) return;
    const updated = [...profile.skills];
    updated[index] = skill;
    updateField("skills", updated);
  };

  const removeSkill = (index: number) => {
    if (!profile) return;
    updateField("skills", profile.skills.filter((_, i) => i !== index));
  };

  const getProfileCompleteness = () => {
    if (!profile) return 0;
    let score = 0;
    if (profile.contact?.name) score += 15;
    if (profile.contact?.email) score += 15;
    if (profile.summary && profile.summary.length > 50) score += 20;
    if (profile.experiences.length > 0) score += 25;
    if (profile.education.length > 0) score += 10;
    if (profile.skills.length >= 3) score += 15;
    return Math.min(score, 100);
  };

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
    return (
      <div className="min-h-screen">
        <div className="hero-gradient border-b">
          <div className="max-w-4xl mx-auto px-6 py-12">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold">My Profile</h1>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="rounded-2xl border bg-card p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted text-muted-foreground mb-6">
              <User className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold">No Profile Yet</h2>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              Upload your resume to automatically extract your professional information, or start building your profile from scratch.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
              <Link
                href="/upload"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl gradient-bg text-white font-medium hover:opacity-90 transition-opacity"
              >
                <Upload className="h-5 w-5" />
                Upload Resume
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const completeness = getProfileCompleteness();

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Section */}
      <div className="hero-gradient border-b">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="space-y-4 animate-in">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                Your Professional Profile
              </div>
              <h1 className="text-4xl font-bold tracking-tight">
                {profile.contact?.name || "My Profile"}
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                Keep your profile up to date for the best job matching results.
              </p>
            </div>

            {/* Completeness Score */}
            <div className="rounded-2xl border bg-card p-5 lg:w-64">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${
                    completeness >= 80
                      ? "bg-success/20 text-success"
                      : completeness >= 50
                      ? "bg-warning/20 text-warning"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {completeness}%
                </div>
                <div>
                  <p className="font-medium">Profile Complete</p>
                  <p className="text-sm text-muted-foreground">
                    {completeness >= 80 ? "Excellent!" : completeness >= 50 ? "Almost there" : "Getting started"}
                  </p>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    completeness >= 80
                      ? "bg-success"
                      : completeness >= 50
                      ? "bg-warning"
                      : "bg-primary"
                  }`}
                  style={{ width: `${completeness}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-4">
          {/* Contact Information */}
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
              <EmptyState
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
              <EmptyState
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
              <EmptyState
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

      {/* Floating Save Bar */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {saveStatus === "success" ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span className="text-success font-medium">Changes saved!</span>
                </>
              ) : saveStatus === "error" ? (
                <>
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <span className="text-destructive font-medium">Failed to save</span>
                </>
              ) : (
                <span className="text-muted-foreground">You have unsaved changes</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={fetchProfile} disabled={saving}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Discard
              </Button>
              <Button onClick={saveProfile} disabled={saving} className="gradient-bg text-white hover:opacity-90">
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileSection({
  title,
  icon: Icon,
  itemCount,
  expanded,
  onToggle,
  onAdd,
  addLabel,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  itemCount: string;
  expanded: boolean;
  onToggle: () => void;
  onAdd?: () => void;
  addLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{itemCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onAdd && expanded && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onAdd();
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              {addLabel}
            </Button>
          )}
          {expanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </button>
      {expanded && <div className="p-5 pt-0 border-t">{children}</div>}
    </div>
  );
}

function FormField({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-sm">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {label}
      </Label>
      {children}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  message,
  actionLabel,
  onAction,
}: {
  icon: React.ComponentType<{ className?: string }>;
  message: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="py-8 text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-muted text-muted-foreground mb-3">
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-muted-foreground mb-4">{message}</p>
      <Button variant="outline" onClick={onAction}>
        <Plus className="h-4 w-4 mr-1" />
        {actionLabel}
      </Button>
    </div>
  );
}

function ExperienceCard({
  experience,
  onChange,
  onRemove,
}: {
  experience: Experience;
  onChange: (exp: Experience) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-xl border p-4 space-y-4 bg-muted/30">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm">Company</Label>
            <Input
              value={experience.company}
              onChange={(e) => onChange({ ...experience, company: e.target.value })}
              placeholder="Company name"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Job Title</Label>
            <Input
              value={experience.title}
              onChange={(e) => onChange({ ...experience, title: e.target.value })}
              placeholder="Your role"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Start Date</Label>
            <Input
              value={experience.startDate}
              onChange={(e) => onChange({ ...experience, startDate: e.target.value })}
              placeholder="Jan 2020"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">End Date</Label>
            <Input
              value={experience.endDate || ""}
              onChange={(e) => onChange({ ...experience, endDate: e.target.value })}
              placeholder="Present"
              disabled={experience.current}
            />
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onRemove} className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-2">
        <Label className="text-sm">Description</Label>
        <Textarea
          rows={3}
          value={experience.description}
          onChange={(e) => onChange({ ...experience, description: e.target.value })}
          placeholder="Describe your responsibilities and achievements..."
          className="resize-none"
        />
      </div>
    </div>
  );
}

function EducationCard({
  education,
  onChange,
  onRemove,
}: {
  education: Education;
  onChange: (edu: Education) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-xl border p-4 bg-muted/30">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm">Institution</Label>
            <Input
              value={education.institution}
              onChange={(e) => onChange({ ...education, institution: e.target.value })}
              placeholder="University name"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Degree</Label>
            <Input
              value={education.degree}
              onChange={(e) => onChange({ ...education, degree: e.target.value })}
              placeholder="Bachelor's, Master's, etc."
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Field of Study</Label>
            <Input
              value={education.field}
              onChange={(e) => onChange({ ...education, field: e.target.value })}
              placeholder="Computer Science"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Graduation Year</Label>
            <Input
              value={education.endDate || ""}
              onChange={(e) => onChange({ ...education, endDate: e.target.value })}
              placeholder="2020"
            />
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onRemove} className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function SkillTag({
  skill,
  onChange,
  onRemove,
}: {
  skill: Skill;
  onChange: (skill: Skill) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(!skill.name);

  if (editing) {
    return (
      <div className="inline-flex items-center gap-1 rounded-lg border bg-card p-1">
        <Input
          autoFocus
          className="h-8 w-32 text-sm"
          value={skill.name}
          onChange={(e) => onChange({ ...skill, name: e.target.value })}
          onBlur={() => skill.name && setEditing(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && skill.name) setEditing(false);
            if (e.key === "Escape") setEditing(false);
          }}
          placeholder="Skill name"
        />
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRemove}>
          <Trash2 className="h-3 w-3 text-destructive" />
        </Button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
    >
      <span className="text-sm font-medium">{skill.name}</span>
      <Trash2
        className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      />
    </button>
  );
}
