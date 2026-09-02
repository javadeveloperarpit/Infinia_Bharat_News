import { NextRequest, NextResponse } from "next/server";
import {
  FieldValue,
  type WriteBatch,
} from "firebase-admin/firestore";

import {
  commentsAdminAuth,
  commentsAdminDb,
} from "@/lib/firebase/firebase-comments-admin";

import {
  syncJobsHomeFromFirebase,
} from "@/lib/github/jobs-home-sync";

import type {
  Job,
} from "@/services/public/jobs.public.service";

const JOBS_COLLECTION = "jobs";
const JOBS_DOCUMENT = "config";
const JOBS_ITEMS_COLLECTION = "items";

const MAX_HOMEPAGE_JOBS = 20;
const FIRESTORE_BATCH_SIZE = 450;

/* =========================================================
   TYPES
========================================================= */

interface JobsConfigDocument {
  jobs?: unknown;
  homepageJobs?: unknown;
  updatedAt?: unknown;
}

/* =========================================================
   RESPONSE HELPERS
========================================================= */

function jsonError(
  message: string,
  status = 400,
  extra: Record<string, unknown> = {}
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...extra,
    },
    { status }
  );
}

/* =========================================================
   AUTH
========================================================= */

async function verifyAdmin(
  request: NextRequest
) {
  const authorization =
    request.headers.get("authorization");

  if (
    !authorization ||
    !authorization.startsWith("Bearer ")
  ) {
    throw new Error("Unauthorized");
  }

  const token =
    authorization
      .slice("Bearer ".length)
      .trim();

  if (!token) {
    throw new Error("Unauthorized");
  }

  return commentsAdminAuth.verifyIdToken(
    token
  );
}

/* =========================================================
   CLEAN STRING
========================================================= */

function cleanString(
  value: unknown
): string | undefined {
  if (
    typeof value !== "string"
  ) {
    return undefined;
  }

  const valueTrimmed =
    value.trim();

  return valueTrimmed || undefined;
}

/* =========================================================
   CLEAN STRING ARRAY
========================================================= */

function cleanStringArray(
  value: unknown
): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const result =
    value
      .filter(
        (
          item
        ): item is string =>
          typeof item === "string"
      )
      .map(
        (item) =>
          item.trim()
      )
      .filter(Boolean);

  return result.length > 0
    ? result
    : undefined;
}

/* =========================================================
   SANITIZE JOB
========================================================= */

function sanitizeJob(
  input: unknown
): Job | null {
  if (
    !input ||
    typeof input !== "object"
  ) {
    return null;
  }

  const item =
    input as Record<
      string,
      unknown
    >;

  const id =
    cleanString(item.id);

  const slug =
    cleanString(item.slug);

  const title =
    cleanString(item.title);

  const company =
    cleanString(item.company);

  const source =
    cleanString(item.source);

  const sourceUrl =
    cleanString(item.sourceUrl);

  const applyUrl =
    cleanString(item.applyUrl);

  if (
    !id ||
    !slug ||
    !title ||
    !company ||
    !source ||
    !sourceUrl ||
    !applyUrl
  ) {
    return null;
  }

  const type =
    item.type === "private" ||
    item.type === "remote" ||
    item.type === "government"
      ? item.type
      : null;

  const region =
    item.region === "india" ||
    item.region === "outside"
      ? item.region
      : null;

  if (!type || !region) {
    return null;
  }

  const workMode =
    item.workMode === "onsite" ||
    item.workMode === "hybrid" ||
    item.workMode === "remote"
      ? item.workMode
      : undefined;

  const companyLogo =
    cleanString(
      item.companyLogo
    );

  const location =
    cleanString(
      item.location
    );

  const country =
    cleanString(
      item.country
    );

  const employmentType =
    cleanString(
      item.employmentType
    );

  const field =
    cleanString(
      item.field
    );

  const category =
    cleanString(
      item.category
    );

  const experienceLevel =
    cleanString(
      item.experienceLevel
    );

  const qualification =
    cleanString(
      item.qualification
    );

  const salary =
    cleanString(
      item.salary
    );

  const description =
    cleanString(
      item.description
    );

  const responsibilities =
    cleanStringArray(
      item.responsibilities
    );

  const eligibility =
    cleanStringArray(
      item.eligibility
    );

  const skills =
    cleanStringArray(
      item.skills
    );

  const applicationStart =
    cleanString(
      item.applicationStart
    );

  const applicationEnd =
    cleanString(
      item.applicationEnd
    );

  const updatedAt =
    cleanString(
      item.updatedAt
    );

  const job: Job = {
    id,
    slug,
    title,
    company,

    type,
    region,

    source,
    sourceUrl,
    applyUrl,

    verified:
      Boolean(
        item.verified
      ),
  };

  if (companyLogo) {
    job.companyLogo =
      companyLogo;
  }

  if (location) {
    job.location =
      location;
  }

  if (country) {
    job.country =
      country;
  }

  if (employmentType) {
    job.employmentType =
      employmentType;
  }

  if (workMode) {
    job.workMode =
      workMode;
  }

  if (field) {
    job.field =
      field;
  }

  if (category) {
    job.category =
      category;
  }

  if (experienceLevel) {
    job.experienceLevel =
      experienceLevel;
  }

  if (qualification) {
    job.qualification =
      qualification;
  }

  if (salary) {
    job.salary =
      salary;
  }

  if (description) {
    job.description =
      description;
  }

  if (responsibilities) {
    job.responsibilities =
      responsibilities;
  }

  if (eligibility) {
    job.eligibility =
      eligibility;
  }

  if (skills) {
    job.skills =
      skills;
  }

  if (applicationStart) {
    job.applicationStart =
      applicationStart;
  }

  if (applicationEnd) {
    job.applicationEnd =
      applicationEnd;
  }

  if (updatedAt) {
    job.updatedAt =
      updatedAt;
  }

  if (
    typeof item.published ===
    "boolean"
  ) {
    job.published =
      item.published;
  }

  if (
    typeof item.featuredCompany ===
    "boolean"
  ) {
    job.featuredCompany =
      item.featuredCompany;
  }

  return job;
}

/* =========================================================
   DEDUPE
========================================================= */

function dedupeJobs(
  jobs: Job[]
): Job[] {
  const map =
    new Map<string, Job>();

  for (const job of jobs) {
    const id =
      job.id ||
      `${job.company}-${job.slug}`;

    if (!map.has(id)) {
      map.set(
        id,
        job
      );
    }
  }

  return Array.from(
    map.values()
  );
}

/* =========================================================
   FIRESTORE REFS
========================================================= */

function getJobsConfigRef() {
  return commentsAdminDb
    .collection(
      JOBS_COLLECTION
    )
    .doc(
      JOBS_DOCUMENT
    );
}

function getJobsItemsCollection() {
  return getJobsConfigRef()
    .collection(
      JOBS_ITEMS_COLLECTION
    );
}

/* =========================================================
   WRITE JOBS
========================================================= */

async function writeJobs(
  jobs: Job[]
) {
  const collection =
    getJobsItemsCollection();

  for (
    let start = 0;
    start < jobs.length;
    start +=
      FIRESTORE_BATCH_SIZE
  ) {
    const chunk =
      jobs.slice(
        start,
        start +
          FIRESTORE_BATCH_SIZE
      );

    const batch: WriteBatch =
      commentsAdminDb.batch();

    for (const job of chunk) {
      const ref =
        collection.doc(
          job.id
        );

      /*
       * All values have already
       * been sanitized.
       */
      batch.set(
        ref,
        job,
        {
          merge: true,
        }
      );
    }

    await batch.commit();
  }
}

/* =========================================================
   DELETE REMOVED JOBS
========================================================= */

async function deleteRemovedJobs(
  jobs: Job[]
) {
  const collection =
    getJobsItemsCollection();

  const snapshot =
    await collection.get();

  const validIds =
    new Set(
      jobs.map(
        (job) =>
          job.id
      )
    );

  const removed =
    snapshot.docs.filter(
      (doc) =>
        !validIds.has(
          doc.id
        )
    );

  if (
    removed.length === 0
  ) {
    return;
  }

  for (
    let start = 0;
    start < removed.length;
    start +=
      FIRESTORE_BATCH_SIZE
  ) {
    const chunk =
      removed.slice(
        start,
        start +
          FIRESTORE_BATCH_SIZE
      );

    const batch: WriteBatch =
      commentsAdminDb.batch();

    for (const doc of chunk) {
      batch.delete(
        doc.ref
      );
    }

    await batch.commit();
  }
}

/* =========================================================
   READ ALL JOBS
========================================================= */

async function readAllJobs(): Promise<Job[]> {
  const snapshot =
    await getJobsItemsCollection().get();

  return snapshot.docs
    .map(
      (doc) =>
        doc.data() as Job
    );
}

/* =========================================================
   DATE SERIALIZER
========================================================= */

function getUpdatedAt(
  value: unknown
): string | null {
  if (!value) {
    return null;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (
      value as {
        toDate?: unknown;
      }
    ).toDate === "function"
  ) {
    return (
      value as {
        toDate: () => Date;
      }
    )
      .toDate()
      .toISOString();
  }

  if (
    value instanceof Date
  ) {
    return value.toISOString();
  }

  if (
    typeof value === "string"
  ) {
    return value;
  }

  return null;
}

/* =========================================================
   GET
========================================================= */

export async function GET(
  request: NextRequest
) {
  try {
    await verifyAdmin(
      request
    );

    const configRef =
      getJobsConfigRef();

    const snapshot =
      await configRef.get();

    let homepageJobs: Job[] =
      [];

    let updatedAt:
      | string
      | null = null;

    if (snapshot.exists) {
      const data =
        (snapshot.data() ||
          {}) as JobsConfigDocument;

      if (
        Array.isArray(
          data.homepageJobs
        )
      ) {
        homepageJobs =
          data.homepageJobs
            .map(
              (job) =>
                sanitizeJob(job)
            )
            .filter(
              (
                job
              ): job is Job =>
                job !== null
            )
            .slice(
              0,
              MAX_HOMEPAGE_JOBS
            );
      }

      updatedAt =
        getUpdatedAt(
          data.updatedAt
        );
    }

    let jobs =
      await readAllJobs();

    /*
     * Backward compatibility with
     * the old jobs array.
     */
    if (
      jobs.length === 0 &&
      snapshot.exists
    ) {
      const data =
        (snapshot.data() ||
          {}) as JobsConfigDocument;

      if (
        Array.isArray(
          data.jobs
        )
      ) {
        jobs =
          data.jobs
            .map(
              (job) =>
                sanitizeJob(job)
            )
            .filter(
              (
                job
              ): job is Job =>
                job !== null
            );
      }
    }

    jobs =
      dedupeJobs(jobs);

    return NextResponse.json({
      success: true,
      jobs,
      homepageJobs,
      updatedAt,
    });
  } catch (error) {
    console.error(
      "[ADMIN JOBS GET ERROR]",
      error
    );

    if (
      error instanceof Error &&
      error.message ===
        "Unauthorized"
    ) {
      return jsonError(
        "Unauthorized",
        401
      );
    }

    const message =
      error instanceof Error
        ? error.message
        : String(error);

    return jsonError(
      `Failed to load jobs configuration: ${message}`,
      500
    );
  }
}

/* =========================================================
   PUT
========================================================= */

export async function PUT(
  request: NextRequest
) {
  try {
    await verifyAdmin(
      request
    );

    const body =
      await request.json();

    if (
      !body ||
      typeof body !== "object"
    ) {
      return jsonError(
        "Invalid request body."
      );
    }

    if (
      !Array.isArray(
        body.jobs
      )
    ) {
      return jsonError(
        "jobs must be an array."
      );
    }

    if (
      !Array.isArray(
        body.homepageJobs
      )
    ) {
      return jsonError(
        "homepageJobs must be an array."
      );
    }

    if (
      body.homepageJobs.length >
      MAX_HOMEPAGE_JOBS
    ) {
      return jsonError(
        `Homepage can contain a maximum of ${MAX_HOMEPAGE_JOBS} jobs.`
      );
    }

    /* =====================================================
       SANITIZE JOBS
    ===================================================== */

    const sanitizedJobs =
      body.jobs
        .map(
          (job: unknown) =>
            sanitizeJob(job)
        )
        .filter(
          (
            job: Job | null
          ): job is Job =>
            job !== null
        );

    const cleanedJobs =
      dedupeJobs(
        sanitizedJobs
      );

    /* =====================================================
       SANITIZE HOMEPAGE JOBS
    ===================================================== */

    const jobsById =
      new Map<string, Job>();

    for (const job of cleanedJobs) {
      jobsById.set(
        job.id,
        job
      );
    }

    const homepageIds =
      new Set<string>();

    const cleanedHomepageJobs: Job[] =
      [];

    for (
      const rawJob of body.homepageJobs
    ) {
      if (
        cleanedHomepageJobs.length >=
        MAX_HOMEPAGE_JOBS
      ) {
        break;
      }

      const job =
        sanitizeJob(
          rawJob
        );

      if (!job) {
        continue;
      }

      if (
        homepageIds.has(
          job.id
        )
      ) {
        continue;
      }

      /*
       * Homepage job must exist
       * in the main jobs collection.
       */
      const existing =
        jobsById.get(
          job.id
        );

      if (!existing) {
        continue;
      }

      homepageIds.add(
        job.id
      );

      cleanedHomepageJobs.push(
        existing
      );
    }

    /* =====================================================
       FIRESTORE WRITE
    ===================================================== */

    await writeJobs(
      cleanedJobs
    );

    /* =====================================================
       DELETE REMOVED
    ===================================================== */

    await deleteRemovedJobs(
      cleanedJobs
    );

    /* =====================================================
       SAVE CONFIG
    ===================================================== */

    await getJobsConfigRef().set(
      {
        homepageJobs:
          cleanedHomepageJobs,

        updatedAt:
          FieldValue.serverTimestamp(),
      },
      {
        merge: true,
      }
    );

    /* =====================================================
       GITHUB SYNC
    ===================================================== */

    let githubSynced =
      false;

    let githubErrorMessage:
      | string
      | null = null;

    try {
      await syncJobsHomeFromFirebase();

      githubSynced = true;
    } catch (error) {
      console.error(
        "[ADMIN JOBS GITHUB SYNC ERROR]",
        error
      );

      githubErrorMessage =
        error instanceof Error
          ? error.message
          : String(error);
    }

    /* =====================================================
       RESPONSE
    ===================================================== */

    return NextResponse.json({
      success: true,

      count:
        cleanedJobs.length,

      homepageCount:
        cleanedHomepageJobs.length,

      githubSynced,

      ...(githubErrorMessage
        ? {
            githubError:
              githubErrorMessage,
          }
        : {}),
    });
  } catch (error) {
    console.error(
      "[ADMIN JOBS PUT ERROR]",
      error
    );

    if (
      error instanceof Error &&
      error.message ===
        "Unauthorized"
    ) {
      return jsonError(
        "Unauthorized",
        401
      );
    }

    const message =
      error instanceof Error
        ? error.message
        : String(error);

    return jsonError(
      `Failed to save jobs configuration: ${message}`,
      500,
      {
        details:
          error instanceof Error
            ? {
                name:
                  error.name,
                stack:
                  process.env.NODE_ENV ===
                  "development"
                    ? error.stack
                    : undefined,
              }
            : undefined,
      }
    );
  }
}