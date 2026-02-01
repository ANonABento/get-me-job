"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash2, Save, RefreshCw } from "lucide-react";
import type { Profile, Experience, Education, Skill } from "@/types";
import { generateId } from "@/lib/utils";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

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
    try {
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      setHasChanges(false);
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const updateField = <K extends keyof Profile>(field: K, value: Profile[K]) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
    setHasChanges(true);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No profile data yet.</p>
            <Button className="mt-4" onClick={() => window.location.href = "/upload"}>
              Upload Resume
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">
            Review and edit your professional information
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchProfile}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={saveProfile} disabled={saving || !hasChanges}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Name</Label>
              <Input
                value={profile.contact?.name || ""}
                onChange={(e) =>
                  updateField("contact", { ...profile.contact, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={profile.contact?.email || ""}
                onChange={(e) =>
                  updateField("contact", { ...profile.contact, email: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={profile.contact?.phone || ""}
                onChange={(e) =>
                  updateField("contact", { ...profile.contact, phone: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input
                value={profile.contact?.location || ""}
                onChange={(e) =>
                  updateField("contact", { ...profile.contact, location: e.target.value })
                }
              />
            </div>
            <div>
              <Label>LinkedIn</Label>
              <Input
                value={profile.contact?.linkedin || ""}
                onChange={(e) =>
                  updateField("contact", { ...profile.contact, linkedin: e.target.value })
                }
              />
            </div>
            <div>
              <Label>GitHub</Label>
              <Input
                value={profile.contact?.github || ""}
                onChange={(e) =>
                  updateField("contact", { ...profile.contact, github: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              rows={4}
              value={profile.summary || ""}
              onChange={(e) => updateField("summary", e.target.value)}
              placeholder="A brief professional summary..."
            />
          </CardContent>
        </Card>

        {/* Experience */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Experience</CardTitle>
              <CardDescription>{profile.experiences.length} positions</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={addExperience}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.experiences.map((exp, index) => (
              <div key={exp.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <div className="grid gap-3 md:grid-cols-2 flex-1">
                    <div>
                      <Label>Company</Label>
                      <Input
                        value={exp.company}
                        onChange={(e) =>
                          updateExperience(index, { ...exp, company: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={exp.title}
                        onChange={(e) =>
                          updateExperience(index, { ...exp, title: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Start Date</Label>
                      <Input
                        value={exp.startDate}
                        onChange={(e) =>
                          updateExperience(index, { ...exp, startDate: e.target.value })
                        }
                        placeholder="Jan 2020"
                      />
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <Input
                        value={exp.endDate || ""}
                        onChange={(e) =>
                          updateExperience(index, { ...exp, endDate: e.target.value })
                        }
                        placeholder="Present"
                        disabled={exp.current}
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-2"
                    onClick={() => removeExperience(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    rows={3}
                    value={exp.description}
                    onChange={(e) =>
                      updateExperience(index, { ...exp, description: e.target.value })
                    }
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Education */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Education</CardTitle>
              <CardDescription>{profile.education.length} entries</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={addEducation}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.education.map((edu, index) => (
              <div key={edu.id} className="border rounded-lg p-4">
                <div className="flex justify-between">
                  <div className="grid gap-3 md:grid-cols-2 flex-1">
                    <div>
                      <Label>Institution</Label>
                      <Input
                        value={edu.institution}
                        onChange={(e) =>
                          updateEducation(index, { ...edu, institution: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Degree</Label>
                      <Input
                        value={edu.degree}
                        onChange={(e) =>
                          updateEducation(index, { ...edu, degree: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Field</Label>
                      <Input
                        value={edu.field}
                        onChange={(e) =>
                          updateEducation(index, { ...edu, field: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <Input
                        value={edu.endDate || ""}
                        onChange={(e) =>
                          updateEducation(index, { ...edu, endDate: e.target.value })
                        }
                        placeholder="2020"
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-2"
                    onClick={() => removeEducation(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Skills</CardTitle>
              <CardDescription>{profile.skills.length} skills</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={addSkill}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
                <div key={skill.id} className="flex items-center gap-1">
                  <Input
                    className="w-32"
                    value={skill.name}
                    onChange={(e) =>
                      updateSkill(index, { ...skill, name: e.target.value })
                    }
                    placeholder="Skill name"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removeSkill(index)}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
