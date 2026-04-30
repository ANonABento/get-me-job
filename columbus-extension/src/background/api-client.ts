// Columbus API client for extension

import type {
  ApplicationSubmission,
  ExtensionProfile,
  ScrapedJob,
  LearnedAnswer,
  SimilarAnswer,
} from '@/shared/types';
import { getStorage, setStorage } from './storage';

export class ColumbusAPIClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private async getAuthToken(): Promise<string | null> {
    const storage = await getStorage();
    if (!storage.authToken) return null;

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

  private async authenticatedFetch<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Extension-Token': token,
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Clear invalid token
        await setStorage({ authToken: undefined, tokenExpiry: undefined });
        throw new Error('Authentication expired');
      }
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `Request failed: ${response.status}`);
    }

    return response.json();
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAuthToken();
    if (!token) return false;

    try {
      await this.authenticatedFetch('/api/extension/auth/verify');
      return true;
    } catch {
      return false;
    }
  }

  async getProfile(): Promise<ExtensionProfile> {
    return this.authenticatedFetch<ExtensionProfile>('/api/extension/profile');
  }

  async importJob(job: ScrapedJob): Promise<{ imported: number; opportunityIds: string[]; pendingCount: number }> {
    return this.authenticatedFetch('/api/opportunities/from-extension', {
      method: 'POST',
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

  async importJobsBatch(jobs: ScrapedJob[]): Promise<{ imported: number; opportunityIds: string[]; pendingCount: number }> {
    return this.authenticatedFetch('/api/opportunities/from-extension', {
      method: 'POST',
      body: JSON.stringify({ jobs }),
    });
  }

  async logApplication(application: ApplicationSubmission): Promise<{ applicationId: string; status: 'applied'; appliedAt?: string }> {
    return this.authenticatedFetch('/api/extension/applications', {
      method: 'POST',
      body: JSON.stringify(application),
    });
  }

  async saveLearnedAnswer(data: {
    question: string;
    answer: string;
    sourceUrl?: string;
    sourceCompany?: string;
  }): Promise<LearnedAnswer> {
    return this.authenticatedFetch('/api/extension/learned-answers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async searchSimilarAnswers(question: string): Promise<SimilarAnswer[]> {
    const response = await this.authenticatedFetch<{ results: SimilarAnswer[] }>(
      '/api/extension/learned-answers/search',
      {
        method: 'POST',
        body: JSON.stringify({ question }),
      }
    );
    return response.results;
  }

  async getLearnedAnswers(): Promise<LearnedAnswer[]> {
    const response = await this.authenticatedFetch<{ answers: LearnedAnswer[] }>(
      '/api/extension/learned-answers'
    );
    return response.answers;
  }

  async deleteLearnedAnswer(id: string): Promise<void> {
    await this.authenticatedFetch(`/api/extension/learned-answers/${id}`, {
      method: 'DELETE',
    });
  }

  async updateLearnedAnswer(id: string, answer: string): Promise<LearnedAnswer> {
    return this.authenticatedFetch(`/api/extension/learned-answers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ answer }),
    });
  }
}

// Singleton instance
let client: ColumbusAPIClient | null = null;

export async function getAPIClient(): Promise<ColumbusAPIClient> {
  if (!client) {
    const storage = await getStorage();
    client = new ColumbusAPIClient(storage.apiBaseUrl);
  }
  return client;
}

export function resetAPIClient(): void {
  client = null;
}
