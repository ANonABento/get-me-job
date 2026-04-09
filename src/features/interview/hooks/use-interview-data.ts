"use client";

import { useEffect, useState } from "react";
import {
  deleteInterviewSessionById,
  fetchInterviewJobs,
  fetchPastInterviewSessions,
} from "@/features/interview/api";
import type { PastInterviewSession } from "@/features/interview/client-types";
import type { JobDescription } from "@/types";

export function useInterviewData() {
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [pastSessions, setPastSessions] = useState<PastInterviewSession[]>([]);

  useEffect(() => {
    void loadPageData();
  }, []);

  async function loadPageData() {
    try {
      const [jobsData, pastSessionData] = await Promise.all([
        fetchInterviewJobs(),
        fetchPastInterviewSessions(),
      ]);
      setJobs(jobsData);
      setPastSessions(pastSessionData);
    } catch (error) {
      console.error("Failed to load interview page data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function refreshPastSessions() {
    try {
      setPastSessions(await fetchPastInterviewSessions());
    } catch (error) {
      console.error("Failed to refresh interview sessions:", error);
    }
  }

  async function deleteSession(sessionId: string) {
    try {
      await deleteInterviewSessionById(sessionId);
      await refreshPastSessions();
    } catch (error) {
      console.error("Failed to delete session:", error);
    }
  }

  return {
    deleteSession,
    jobs,
    loading,
    pastSessions,
    refreshPastSessions,
  };
}
