import {
  commentsAdminDb,
} from "@/lib/firebase/firebase-comments-admin";

import {
  serializeValue,
  writeGitHubJson,
} from "./github-utils";

const JOBS_CONFIG_COLLECTION = "jobs";
const JOBS_CONFIG_DOCUMENT = "config";

const JOBS_HOME_PATH =
  "public/data/jobs-home.json";

const MAX_HOMEPAGE_JOBS = 20;

interface HomepageJob {
  id: string;
  slug: string;
  title: string;
  company: string;
  companyLogo?: string;
  location?: string;
  type?:
    | "job"
    | "internship"
    | "program"
    | "opportunity";
  employmentType?: string;
  workMode?: string;
  field?: string;
  category?: string;
  link: string;
  applicationEnd?: string;
}

function cleanString(
  value: unknown
): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const cleaned = value.trim();

  return cleaned || undefined;
}

function getHomepageJob(
  input: unknown
): HomepageJob | null {
  if (
    !input ||
    typeof input !== "object"
  ) {
    return null;
  }

  const item =
    input as Record<string, unknown>;

  const id = cleanString(item.id);
  const slug = cleanString(item.slug);
  const title = cleanString(item.title);
  const company = cleanString(
    item.company
  );

  if (
    !id ||
    !slug ||
    !title ||
    !company
  ) {
    return null;
  }

  const type =
    item.type === "job" ||
    item.type === "internship" ||
    item.type === "program" ||
    item.type === "opportunity"
      ? item.type
      : undefined;

  const homepageJob: HomepageJob = {
    id,
    slug,
    title,
    company,

    ...(cleanString(item.companyLogo)
      ? {
          companyLogo:
            cleanString(
              item.companyLogo
            ),
        }
      : {}),

    ...(cleanString(item.location)
      ? {
          location:
            cleanString(item.location),
        }
      : {}),

    ...(type ? { type } : {}),

    ...(cleanString(
      item.employmentType
    )
      ? {
          employmentType:
            cleanString(
              item.employmentType
            ),
        }
      : {}),

    ...(cleanString(item.workMode)
      ? {
          workMode:
            cleanString(item.workMode),
        }
      : {}),

    ...(cleanString(item.field)
      ? {
          field:
            cleanString(item.field),
        }
      : {}),

    ...(cleanString(item.category)
      ? {
          category:
            cleanString(item.category),
        }
      : {}),

    link: `/jobs/${slug}`,

    ...(cleanString(
      item.applicationEnd
    )
      ? {
          applicationEnd:
            cleanString(
              item.applicationEnd
            ),
        }
      : {}),
  };

  return homepageJob;
}

async function getFirebaseHomepageJobs(): Promise<
  HomepageJob[]
> {
  const snapshot =
    await commentsAdminDb
      .collection(
        JOBS_CONFIG_COLLECTION
      )
      .doc(JOBS_CONFIG_DOCUMENT)
      .get();

  if (!snapshot.exists) {
    return [];
  }

  const data =
    snapshot.data() || {};

  const homepageJobs =
    Array.isArray(data.homepageJobs)
      ? data.homepageJobs
      : [];

  const seen = new Set<string>();

  const cleaned =
    homepageJobs
      .map((job: unknown) =>
        getHomepageJob(job)
      )
      .filter(
        (
          job: HomepageJob | null
        ): job is HomepageJob =>
          Boolean(job)
      )
      .filter((job) => {
        if (seen.has(job.id)) {
          return false;
        }

        seen.add(job.id);

        return true;
      })
      .slice(0, MAX_HOMEPAGE_JOBS);

  return serializeValue(
    cleaned
  ) as HomepageJob[];
}

export async function syncJobsHomeFromFirebase() {
  const homepageJobs =
    await getFirebaseHomepageJobs();

  await writeGitHubJson(
    JOBS_HOME_PATH,
    homepageJobs,
    "Sync jobs-home.json from Firebase"
  );

  return {
    success: true,
    count: homepageJobs.length,
  };
}

/*
 * These aliases keep the sync API consistent
 * with the existing Shorts sync pattern.
 */

export async function syncJobsCreate() {
  return syncJobsHomeFromFirebase();
}

export async function syncJobsUpdate() {
  return syncJobsHomeFromFirebase();
}

export async function syncJobsDelete() {
  return syncJobsHomeFromFirebase();
}