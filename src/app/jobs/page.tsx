"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { JobDescription, JobMatch } from "@/types";
import { Loader2, Plus, FileText, Trash2, Download, Sparkles, ChevronDown } from "lucide-react";

interface Template {
  id: string;
  name: string;
  description: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newJob, setNewJob] = useState({ title: "", company: "", description: "", url: "" });
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<Record<string, JobMatch>>({});
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchJobs();
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/jobs/templates");
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch {
      // Default templates if fetch fails
      setTemplates([
        { id: "classic", name: "Classic", description: "Traditional professional format" },
        { id: "modern", name: "Modern", description: "Contemporary design" },
        { id: "minimal", name: "Minimal", description: "Clean and simple" },
      ]);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/jobs");
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const addJob = async () => {
    if (!newJob.title || !newJob.company || !newJob.description) return;

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newJob),
      });
      const data = await res.json();
      if (data.job) {
        setJobs([data.job, ...jobs]);
        setNewJob({ title: "", company: "", description: "", url: "" });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error("Failed to add job:", error);
    }
  };

  const deleteJob = async (id: string) => {
    try {
      await fetch(`/api/jobs/${id}`, { method: "DELETE" });
      setJobs(jobs.filter((j) => j.id !== id));
    } catch (error) {
      console.error("Failed to delete job:", error);
    }
  };

  const analyzeJob = async (jobId: string) => {
    setAnalyzing(jobId);
    try {
      const res = await fetch(`/api/jobs/${jobId}/analyze`, { method: "POST" });
      const data = await res.json();
      if (data.analysis) {
        setAnalyses({ ...analyses, [jobId]: data.analysis });
      }
    } catch (error) {
      console.error("Failed to analyze job:", error);
    } finally {
      setAnalyzing(null);
    }
  };

  const generateResume = async (jobId: string) => {
    setGenerating(jobId);
    try {
      const templateId = selectedTemplate[jobId] || "classic";
      const res = await fetch(`/api/jobs/${jobId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      });
      const data = await res.json();
      if (data.pdfUrl) {
        window.open(data.pdfUrl, "_blank");
      }
    } catch (error) {
      console.error("Failed to generate resume:", error);
    } finally {
      setGenerating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Job Applications</h1>
          <p className="text-muted-foreground">
            Add job descriptions to get tailored resumes
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Job
        </Button>
      </div>

      {/* Add Job Form */}
      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Job</CardTitle>
            <CardDescription>
              Paste the job description to analyze and generate a tailored resume
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Job Title</Label>
                <Input
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  placeholder="Software Engineer"
                />
              </div>
              <div>
                <Label>Company</Label>
                <Input
                  value={newJob.company}
                  onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                  placeholder="Acme Corp"
                />
              </div>
            </div>
            <div>
              <Label>Job URL (optional)</Label>
              <Input
                value={newJob.url}
                onChange={(e) => setNewJob({ ...newJob, url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>Job Description</Label>
              <Textarea
                rows={10}
                value={newJob.description}
                onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                placeholder="Paste the full job description here..."
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={addJob}>Add Job</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No jobs yet</h3>
            <p className="text-muted-foreground mb-4">
              Add a job description to get started with tailored resume generation
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Your First Job
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{job.title}</CardTitle>
                    <CardDescription>{job.company}</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteJob(job.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {job.description}
                </p>

                {/* Keywords */}
                {job.keywords && job.keywords.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Key Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {job.keywords.slice(0, 10).map((kw, i) => (
                        <Badge key={i} variant="secondary">{kw}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Analysis */}
                {analyses[job.id] && (
                  <div className="mb-4 p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">Match Score:</span>
                      <Badge
                        variant={analyses[job.id].overallScore >= 70 ? "default" : "secondary"}
                      >
                        {analyses[job.id].overallScore}%
                      </Badge>
                    </div>
                    {analyses[job.id].gaps.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-1">Gaps to address:</p>
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                          {analyses[job.id].gaps.slice(0, 3).map((gap, i) => (
                            <li key={i}>{gap}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 items-center">
                  <Button
                    variant="outline"
                    onClick={() => analyzeJob(job.id)}
                    disabled={analyzing === job.id}
                  >
                    {analyzing === job.id ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    Analyze Match
                  </Button>

                  {/* Template selector */}
                  <select
                    value={selectedTemplate[job.id] || "classic"}
                    onChange={(e) => setSelectedTemplate({ ...selectedTemplate, [job.id]: e.target.value })}
                    className="h-10 rounded-md border px-3 text-sm"
                  >
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>

                  <Button
                    onClick={() => generateResume(job.id)}
                    disabled={generating === job.id}
                  >
                    {generating === job.id ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Generate Resume
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
