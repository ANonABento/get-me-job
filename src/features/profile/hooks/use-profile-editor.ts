"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_EXPANDED_PROFILE_SECTIONS,
  type ProfileEditorSection,
} from "@/features/profile/editor-types";
import { getProfileCompleteness } from "@/features/profile/utils";
import { generateId } from "@/lib/utils";
import type { Education, Experience, Profile, Skill } from "@/types";

export function useProfileEditor() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [expandedSections, setExpandedSections] = useState(
    new Set<ProfileEditorSection>(DEFAULT_EXPANDED_PROFILE_SECTIONS)
  );
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    void fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoading(true);
    try {
      const response = await fetch("/api/profile");
      const data = (await response.json()) as { profile: Profile | null };
      setProfile(data.profile);
      setHasChanges(false);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    if (!profile) {
      return;
    }

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
  }

  function updateField<K extends keyof Profile>(field: K, value: Profile[K]) {
    if (!profile) {
      return;
    }

    setProfile({ ...profile, [field]: value });
    setHasChanges(true);
  }

  function toggleSection(section: ProfileEditorSection) {
    const nextExpandedSections = new Set(expandedSections);

    if (nextExpandedSections.has(section)) {
      nextExpandedSections.delete(section);
    } else {
      nextExpandedSections.add(section);
    }

    setExpandedSections(nextExpandedSections);
  }

  function addExperience() {
    if (!profile) {
      return;
    }

    const experience: Experience = {
      id: generateId(),
      company: "",
      title: "",
      startDate: "",
      current: false,
      description: "",
      highlights: [],
      skills: [],
    };

    updateField("experiences", [...profile.experiences, experience]);
  }

  function updateExperience(index: number, experience: Experience) {
    if (!profile) {
      return;
    }

    const nextExperiences = [...profile.experiences];
    nextExperiences[index] = experience;
    updateField("experiences", nextExperiences);
  }

  function removeExperience(index: number) {
    if (!profile) {
      return;
    }

    updateField(
      "experiences",
      profile.experiences.filter((_, currentIndex) => currentIndex !== index)
    );
  }

  function addEducation() {
    if (!profile) {
      return;
    }

    const education: Education = {
      id: generateId(),
      institution: "",
      degree: "",
      field: "",
      highlights: [],
    };

    updateField("education", [...profile.education, education]);
  }

  function updateEducation(index: number, education: Education) {
    if (!profile) {
      return;
    }

    const nextEducation = [...profile.education];
    nextEducation[index] = education;
    updateField("education", nextEducation);
  }

  function removeEducation(index: number) {
    if (!profile) {
      return;
    }

    updateField(
      "education",
      profile.education.filter((_, currentIndex) => currentIndex !== index)
    );
  }

  function addSkill() {
    if (!profile) {
      return;
    }

    const skill: Skill = {
      id: generateId(),
      name: "",
      category: "technical",
    };

    updateField("skills", [...profile.skills, skill]);
  }

  function updateSkill(index: number, skill: Skill) {
    if (!profile) {
      return;
    }

    const nextSkills = [...profile.skills];
    nextSkills[index] = skill;
    updateField("skills", nextSkills);
  }

  function removeSkill(index: number) {
    if (!profile) {
      return;
    }

    updateField(
      "skills",
      profile.skills.filter((_, currentIndex) => currentIndex !== index)
    );
  }

  return {
    addEducation,
    addExperience,
    addSkill,
    completeness: getProfileCompleteness(profile),
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
  };
}
