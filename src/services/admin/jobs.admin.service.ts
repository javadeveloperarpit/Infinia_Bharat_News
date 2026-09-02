import {
  commentsAuth,
} from "@/lib/firebase/firebase-comments";

import type { Job } from "@/services/public/jobs.public.service";

export type AdminJob = Job;

export interface JobsConfigResponse {
  success: boolean;
  jobs: AdminJob[];
  homepageJobs: AdminJob[];
  updatedAt?: string | null;
}

export interface FetchJobsResponse {
  success: boolean;
  jobs: AdminJob[];
  stats?: {
    total: number;
    private: number;
    remote: number;
    government: number;
  };
  collectedAt?: string;
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const user = commentsAuth.currentUser;

  if (!user) {
    throw new Error("You must be signed in to manage jobs.");
  }

  const token = await user.getIdToken();

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

/**
 * Get the currently saved Jobs configuration from Firebase.
 */
export async function getJobsConfig(): Promise<JobsConfigResponse> {
  const headers = await getAuthHeaders();

  const response = await fetch("/api/admin/jobs", {
    method: "GET",
    headers,
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.success) {
    throw new Error(
      data?.error || "Failed to load jobs configuration."
    );
  }

  return {
    success: true,
    jobs: Array.isArray(data.jobs) ? data.jobs : [],
    homepageJobs: Array.isArray(data.homepageJobs)
      ? data.homepageJobs
      : [],
    updatedAt: data.updatedAt ?? null,
  };
}

/**
 * Generate/fetch the latest jobs from the existing public Jobs source system.
 */
export async function fetchLatestJobs(): Promise<FetchJobsResponse> {
  const headers = await getAuthHeaders();

  const response = await fetch("/api/admin/jobs/fetch", {
    method: "GET",
    headers,
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.success) {
    throw new Error(
      data?.error || "Failed to generate latest jobs."
    );
  }

  return {
    success: true,
    jobs: Array.isArray(data.jobs) ? data.jobs : [],
    stats: data.stats,
    collectedAt: data.collectedAt,
  };
}

/**
 * Save the complete editable Jobs list and homepage selection.
 */
export async function updateJobsConfig(
  jobs: AdminJob[],
  homepageJobs: AdminJob[]
): Promise<{
  success: boolean;
  count: number;
  homepageCount: number;
  githubSynced: boolean;
}> {
  const headers = await getAuthHeaders();

  const response = await fetch("/api/admin/jobs", {
    method: "PUT",
    headers,
    body: JSON.stringify({
      jobs,
      homepageJobs,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.success) {
    throw new Error(
      data?.error || "Failed to save jobs configuration."
    );
  }

  return {
    success: true,
    count: Number(data.count ?? jobs.length),
    homepageCount: Number(
      data.homepageCount ?? homepageJobs.length
    ),
    githubSynced: Boolean(data.githubSynced),
  };
}