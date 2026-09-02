"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BriefcaseBusiness,
  Building2,
  Check,
  ChevronDown,
  Clock3,
  ExternalLink,
  Globe2,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";

import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  type User,
} from "firebase/auth";

import {
  commentsAuth,
} from "@/lib/firebase/firebase-comments";

import {
  fetchLatestJobs,
  getJobsConfig,
  updateJobsConfig,
  type AdminJob,
} from "@/services/admin/jobs.admin.service";

const MAX_HOMEPAGE_JOBS = 20;
const JOBS_PER_PAGE = 20;

type CategoryFilter =
  | "all"
  | "private"
  | "remote"
  | "government";

/* =========================================================
   JOB TYPE
========================================================= */

function getJobTypeLabel(
  type?: AdminJob["type"]
) {
  switch (type) {
    case "private":
      return "Private";

    case "remote":
      return "Remote";

    case "government":
      return "Government";

    default:
      return "Job";
  }
}

function getJobTypeClass(
  type?: AdminJob["type"]
) {
  switch (type) {
    case "government":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "remote":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "private":
      return "bg-red-50 text-red-700 border-red-200";

    default:
      return "bg-zinc-50 text-zinc-700 border-zinc-200";
  }
}

/* =========================================================
   DATE
========================================================= */

function formatDate(
  value?: string
) {
  if (!value) {
    return "No deadline";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

/* =========================================================
   COMPANY INITIALS
========================================================= */

function getCompanyInitials(
  company: string
) {
  return company
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(
      (word) =>
        word[0]?.toUpperCase() || ""
    )
    .join("");
}

/* =========================================================
   JOB ID
========================================================= */

function normalizeJobId(
  job: AdminJob
) {
  return job.id || job.slug;
}

/* =========================================================
   MERGE JOBS
========================================================= */

function mergeJobs(
  current: AdminJob[],
  incoming: AdminJob[]
) {
  const map =
    new Map<string, AdminJob>();

  for (const job of current) {
    map.set(
      normalizeJobId(job),
      job
    );
  }

  for (const job of incoming) {
    const id =
      normalizeJobId(job);

    if (!map.has(id)) {
      map.set(id, job);
    }
  }

  return Array.from(
    map.values()
  );
}

/* =========================================================
   HOMEPAGE COMPANY PRIORITY
========================================================= */

const REPUTED_COMPANIES = [
  "google",
  "microsoft",
  "amazon",
  "adobe",
  "oracle",
  "ibm",
  "intel",
  "nvidia",
  "cisco",
  "qualcomm",
  "dell",
  "hp",
  "sap",
  "tata",
  "tcs",
  "infosys",
  "wipro",
  "hcl",
  "accenture",
  "deloitte",
  "pwc",
  "ey",
  "kpmg",
  "cognizant",
  "capgemini",
  "ltimindtree",
  "tech mahindra",
  "jpmorgan",
  "goldman sachs",
  "morgan stanley",
  "flipkart",
  "reliance",
  "jio",
  "adani",
];

/* =========================================================
   HOMEPAGE SCORE
========================================================= */

function getHomepageScore(
  job: AdminJob
) {
  let score = 0;

  const company =
    job.company
      ?.toLowerCase()
      .trim() || "";

  /*
   * Featured companies get
   * the highest priority.
   */
  if (job.featuredCompany) {
    score += 100;
  }

  /*
   * Verified jobs are preferred.
   */
  if (job.verified) {
    score += 50;
  }

  /*
   * Known/reputed companies.
   */
  if (
    REPUTED_COMPANIES.some(
      (name) =>
        company.includes(name)
    )
  ) {
    score += 40;
  }

  /*
   * Private jobs are ideal for
   * "Top Companies Hiring".
   */
  if (
    job.type === "private"
  ) {
    score += 20;
  }

  /*
   * Remote jobs are also useful.
   */
  if (
    job.type === "remote"
  ) {
    score += 18;
  }

  /*
   * Jobs with logos look better
   * on the homepage carousel.
   */
  if (job.companyLogo) {
    score += 5;
  }

  if (job.location) {
    score += 3;
  }

  /*
   * Active application deadline.
   */
  if (job.applicationEnd) {
    const deadline =
      new Date(
        job.applicationEnd
      ).getTime();

    if (
      !Number.isNaN(deadline) &&
      deadline > Date.now()
    ) {
      score += 10;
    }
  }

  /*
   * Prefer recently updated jobs.
   */
  if (job.updatedAt) {
    const updated =
      new Date(
        job.updatedAt
      ).getTime();

    if (
      !Number.isNaN(updated)
    ) {
      const ageInDays =
        (
          Date.now() -
          updated
        ) /
        86_400_000;

      if (
        ageInDays <= 7
      ) {
        score += 15;
      } else if (
        ageInDays <= 30
      ) {
        score += 8;
      }
    }
  }

  return score;
}

/* =========================================================
   AUTOMATIC HOMEPAGE SELECTION
========================================================= */

function getAutomaticHomepageJobs(
  jobs: AdminJob[]
) {
  return [...jobs]
    .filter(
      (job) =>
        Boolean(
          normalizeJobId(job) &&
          job.title &&
          job.company &&
          job.slug
        )
    )
    .sort(
      (a, b) =>
        getHomepageScore(b) -
        getHomepageScore(a)
    )
    .slice(
      0,
      MAX_HOMEPAGE_JOBS
    );
}

/* =========================================================
   MAIN
========================================================= */

export default function JobsManager() {
  const [user, setUser] =
    useState<User | null>(null);

  const [authReady, setAuthReady] =
    useState(false);

  const [jobs, setJobs] =
    useState<AdminJob[]>([]);

  const [homepageIds, setHomepageIds] =
    useState<Set<string>>(
      new Set()
    );

  const [loading, setLoading] =
    useState(true);

  const [generating, setGenerating] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState<CategoryFilter>(
      "all"
    );

  const [visibleCount, setVisibleCount] =
    useState(
      JOBS_PER_PAGE
    );

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [lastGenerated, setLastGenerated] =
    useState<string | null>(null);

  /* =========================================================
     AUTH
  ========================================================= */

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        commentsAuth,
        (currentUser) => {
          setUser(currentUser);
          setAuthReady(true);
        }
      );

    return () =>
      unsubscribe();
  }, []);

  /* =========================================================
     LOAD SAVED CONFIG
  ========================================================= */

  useEffect(() => {
    if (!authReady) {
      return;
    }

    if (!user) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const config =
          await getJobsConfig();

        if (cancelled) {
          return;
        }

        const savedJobs =
          Array.isArray(
            config.jobs
          )
            ? config.jobs
            : [];

        const savedHomepageJobs =
          Array.isArray(
            config.homepageJobs
          )
            ? config.homepageJobs
            : [];

        setJobs(savedJobs);

        setHomepageIds(
          new Set(
            savedHomepageJobs.map(
              (job) =>
                normalizeJobId(job)
            )
          )
        );

        setVisibleCount(
          JOBS_PER_PAGE
        );
      } catch (err) {
        if (cancelled) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load jobs."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [
    authReady,
    user,
  ]);

  /* =========================================================
     STATS
  ========================================================= */

  const stats =
    useMemo(() => {
      return {
        total: jobs.length,

        private:
          jobs.filter(
            (job) =>
              job.type ===
              "private"
          ).length,

        remote:
          jobs.filter(
            (job) =>
              job.type ===
              "remote"
          ).length,

        government:
          jobs.filter(
            (job) =>
              job.type ===
              "government"
          ).length,

        homepage:
          homepageIds.size,
      };
    }, [
      jobs,
      homepageIds,
    ]);

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredJobs =
  useMemo(() => {
    const query =
      search
        .trim()
        .toLowerCase();

    const filtered = jobs.filter(
      (job) => {
        const matchesCategory =
          category === "all" ||
          job.type === category;

        if (!matchesCategory) {
          return false;
        }

        if (!query) {
          return true;
        }

        const searchable = [
          job.title,
          job.company,
          job.location,
          job.country,
          job.category,
          job.field,
          job.employmentType,
          job.experienceLevel,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchable.includes(query);
      }
    );

    /*
     * IMPORTANT:
     * Homepage-selected jobs always appear first.
     *
     * Selected jobs keep their existing order.
     * Non-selected jobs come after them.
     */
    return filtered.sort((a, b) => {
      const aSelected =
        homepageIds.has(
          normalizeJobId(a)
        );

      const bSelected =
        homepageIds.has(
          normalizeJobId(b)
        );

      if (aSelected && !bSelected) {
        return -1;
      }

      if (!aSelected && bSelected) {
        return 1;
      }

      return 0;
    });
  }, [
    jobs,
    search,
    category,
    homepageIds,
  ]);

  /* =========================================================
     VISIBLE JOBS
  ========================================================= */

  const visibleJobs =
    useMemo(() => {
      return filteredJobs.slice(
        0,
        visibleCount
      );
    }, [
      filteredJobs,
      visibleCount,
    ]);

  const hasMoreJobs =
    visibleCount <
    filteredJobs.length;

  /* =========================================================
     RESET PAGINATION
  ========================================================= */

  useEffect(() => {
    setVisibleCount(
      JOBS_PER_PAGE
    );
  }, [
    search,
    category,
  ]);

  /* =========================================================
     SIGN IN
  ========================================================= */

  async function handleSignIn() {
    try {
      setError("");
      setSuccess("");

      const provider =
        new GoogleAuthProvider();

      await signInWithPopup(
        commentsAuth,
        provider
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Google sign-in failed."
      );
    }
  }

  /* =========================================================
     GENERATE
  ========================================================= */

  async function handleGenerate() {
    try {
      setGenerating(true);
      setError("");
      setSuccess("");

      const result =
        await fetchLatestJobs();

      const incomingJobs =
        Array.isArray(
          result.jobs
        )
          ? result.jobs
          : [];

      /*
       * Keep existing manually managed
       * jobs and add only new jobs.
       */
      const mergedJobs =
        mergeJobs(
          jobs,
          incomingJobs
        );

      setJobs(mergedJobs);

      /*
       * Automatically choose the best
       * 20 jobs for homepage.
       */
      const automaticHomepageJobs =
        getAutomaticHomepageJobs(
          mergedJobs
        );

      setHomepageIds(
        new Set(
          automaticHomepageJobs.map(
            (job) =>
              normalizeJobId(job)
          )
        )
      );

      /*
       * Start the admin list from
       * the first 20 cards.
       */
      setVisibleCount(
        JOBS_PER_PAGE
      );

      setLastGenerated(
        new Date().toISOString()
      );

      setSuccess(
        `${incomingJobs.length} latest jobs fetched • ${automaticHomepageJobs.length} best jobs automatically selected for homepage.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate jobs."
      );
    } finally {
      setGenerating(false);
    }
  }

  /* =========================================================
     HOMEPAGE TOGGLE
  ========================================================= */

  function toggleHomepage(
    job: AdminJob
  ) {
    const id =
      normalizeJobId(job);

    setError("");
    setSuccess("");

    setHomepageIds(
      (current) => {
        const next =
          new Set(current);

        if (
          next.has(id)
        ) {
          next.delete(id);
          return next;
        }

        if (
          next.size >=
          MAX_HOMEPAGE_JOBS
        ) {
          setError(
            `Homepage par maximum ${MAX_HOMEPAGE_JOBS} jobs allowed.`
          );

          return next;
        }

        next.add(id);

        return next;
      }
    );
  }

  /* =========================================================
     DELETE
  ========================================================= */

  function deleteJob(
    job: AdminJob
  ) {
    const id =
      normalizeJobId(job);

    setJobs(
      (current) =>
        current.filter(
          (item) =>
            normalizeJobId(
              item
            ) !== id
        )
    );

    setHomepageIds(
      (current) => {
        const next =
          new Set(current);

        next.delete(id);

        return next;
      }
    );

    setSuccess(
      `"${job.title}" removed from the current editor. Click Update to permanently save this change.`
    );
  }

  /* =========================================================
     UPDATE
  ========================================================= */

  async function handleUpdate() {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const homepageJobs =
        jobs.filter(
          (job) =>
            homepageIds.has(
              normalizeJobId(job)
            )
        );

      if (
        homepageJobs.length >
        MAX_HOMEPAGE_JOBS
      ) {
        setError(
          `Homepage can contain a maximum of ${MAX_HOMEPAGE_JOBS} jobs.`
        );

        return;
      }

      const result =
        await updateJobsConfig(
          jobs,
          homepageJobs
        );

      if (
        result.githubSynced
      ) {
        setSuccess(
          `${result.count} jobs saved to Firebase • ${result.homepageCount} homepage jobs • GitHub sync successful.`
        );
      } else {
        setSuccess(
          `${result.count} jobs saved to Firebase • ${result.homepageCount} homepage jobs • GitHub sync failed.`
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save jobs."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================================================
     AUTH LOADING
  ========================================================= */

  if (!authReady) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <Loader2
          className="animate-spin text-red-600"
          size={30}
        />
      </div>
    );
  }

  /* =========================================================
     LOGIN
  ========================================================= */

  if (!user) {
    return (
      <div className="flex min-h-[600px] items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
            <BriefcaseBusiness
              size={30}
              className="text-red-600"
            />
          </div>

          <h1 className="text-2xl font-bold text-zinc-900">
            Jobs Manager
          </h1>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Sign in with your admin Google account
            to manage jobs and homepage hiring
            opportunities.
          </p>

          <button
            type="button"
            onClick={
              handleSignIn
            }
            className="mt-7 flex w-full items-center justify-center gap-3 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Continue with Google
          </button>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="min-h-screen bg-zinc-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">

        {/* HEADER */}

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
                <BriefcaseBusiness
                  size={22}
                  className="text-red-600"
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                  Jobs Manager
                </h1>

                <p className="mt-0.5 text-sm text-zinc-500">
                  Generate, review and select jobs
                  for the homepage.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={
                handleGenerate
              }
              disabled={
                generating ||
                saving ||
                loading
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {generating ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <RefreshCw
                  size={17}
                />
              )}

              {generating
                ? "Generating..."
                : "Generate Latest Jobs"}
            </button>

            <button
              type="button"
              onClick={
                handleUpdate
              }
              disabled={
                saving ||
                generating ||
                loading
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Check
                  size={17}
                />
              )}

              {saving
                ? "Updating..."
                : "Update"}
            </button>
          </div>
        </div>

        {/* ALERTS */}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <X
              size={18}
              className="mt-0.5 shrink-0"
            />

            <span>
              {error}
            </span>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <Check
              size={18}
              className="mt-0.5 shrink-0"
            />

            <span>
              {success}
            </span>
          </div>
        )}

        {/* STATS */}

        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
          <StatCard
            label="Total Jobs"
            value={stats.total}
            icon={BriefcaseBusiness}
          />

          <StatCard
            label="Private"
            value={stats.private}
            icon={Building2}
          />

          <StatCard
            label="Remote"
            value={stats.remote}
            icon={Globe2}
          />

          <StatCard
            label="Government"
            value={stats.government}
            icon={Users}
          />

          <StatCard
            label="Homepage"
            value={`${stats.homepage}/${MAX_HOMEPAGE_JOBS}`}
            icon={Check}
            highlight
          />
        </div>

        {/* TOOLBAR */}

        <div className="mb-5 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">

            {/* SEARCH */}

            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search by job title, company, location..."
                className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-100"
              />
            </div>

            {/* FILTER */}

            <div className="relative lg:w-56">
              <select
                value={
                  category
                }
                onChange={(event) =>
                  setCategory(
                    event.target
                      .value as CategoryFilter
                  )
                }
                className="h-11 w-full appearance-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 pr-10 text-sm font-medium text-zinc-700 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
              >
                <option value="all">
                  All Jobs
                </option>

                <option value="private">
                  Private Jobs
                </option>

                <option value="remote">
                  Remote Jobs
                </option>

                <option value="government">
                  Government Jobs
                </option>
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
            <span>
              Showing{" "}
              <strong className="text-zinc-700">
                {Math.min(
                  visibleCount,
                  filteredJobs.length
                )}
              </strong>{" "}
              of{" "}
              <strong className="text-zinc-700">
                {filteredJobs.length}
              </strong>{" "}
              matching jobs
            </span>

            {lastGenerated && (
              <span>
                Last generated:{" "}
                {formatDate(
                  lastGenerated
                )}
              </span>
            )}
          </div>
        </div>

        {/* LOADING */}

        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-zinc-200 bg-white">
            <div className="text-center">
              <Loader2
                size={30}
                className="mx-auto animate-spin text-red-600"
              />

              <p className="mt-3 text-sm text-zinc-500">
                Loading jobs...
              </p>
            </div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
            <BriefcaseBusiness
              size={34}
              className="mx-auto text-zinc-300"
            />

            <h2 className="mt-4 text-lg font-semibold text-zinc-800">
              No jobs found
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Try another search/filter or
              generate the latest jobs.
            </p>
          </div>
        ) : (
          <>
            {/* JOB GRID */}

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {visibleJobs.map(
                (job) => {
                  const id =
                    normalizeJobId(
                      job
                    );

                  const selected =
                    homepageIds.has(
                      id
                    );

                  return (
                    <JobCard
                      key={id}
                      job={job}
                      selected={
                        selected
                      }
                      onToggleHomepage={() =>
                        toggleHomepage(
                          job
                        )
                      }
                      onDelete={() =>
                        deleteJob(
                          job
                        )
                      }
                    />
                  );
                }
              )}
            </div>

            {/* LOAD MORE */}

            {hasMoreJobs && (
              <div className="mt-7 flex justify-center">
                <button
                  type="button"
                  onClick={() =>
                    setVisibleCount(
                      (current) =>
                        current +
                        JOBS_PER_PAGE
                    )
                  }
                  className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                >
                  <ChevronDown
                    size={17}
                  />

                  Load More

                  <span className="text-xs font-normal opacity-70">
                    (
                    {Math.min(
                      JOBS_PER_PAGE,
                      filteredJobs.length -
                        visibleCount
                    )}
                    )
                  </span>
                </button>
              </div>
            )}

            {/* ALL LOADED */}

            {!hasMoreJobs &&
              filteredJobs.length >
                JOBS_PER_PAGE && (
                <p className="mt-6 text-center text-xs text-zinc-400">
                  All{" "}
                  {
                    filteredJobs.length
                  }{" "}
                  matching jobs loaded.
                </p>
              )}
          </>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  label,
  value,
  icon: Icon,
  highlight = false,
}: {
  label: string;
  value: string | number;
  icon: typeof BriefcaseBusiness;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border bg-white p-4 shadow-sm ${
        highlight
          ? "border-red-200"
          : "border-zinc-200"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-zinc-500">
            {label}
          </p>

          <p className="mt-1 text-2xl font-bold text-zinc-900">
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            highlight
              ? "bg-red-50 text-red-600"
              : "bg-zinc-100 text-zinc-600"
          }`}
        >
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   JOB CARD
========================================================= */

function JobCard({
  job,
  selected,
  onToggleHomepage,
  onDelete,
}: {
  job: AdminJob;
  selected: boolean;
  onToggleHomepage: () => void;
  onDelete: () => void;
}) {
  return (
    <article
      className={`group overflow-hidden rounded-2xl border bg-white shadow-sm transition ${
        selected
          ? "border-red-300 ring-1 ring-red-100"
          : "border-zinc-200 hover:border-zinc-300"
      }`}
    >
      <div className="p-5">

        {/* TOP */}

        <div className="flex items-start gap-4">

          {/* LOGO */}

          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
            {job.companyLogo ? (
              <img
                src={
                  job.companyLogo
                }
                alt=""
                className="h-full w-full object-contain"
                loading="lazy"
              />
            ) : (
              <span className="text-sm font-bold text-zinc-500">
                {getCompanyInitials(
                  job.company
                )}
              </span>
            )}
          </div>

          {/* TITLE */}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${getJobTypeClass(
                  job.type
                )}`}
              >
                {getJobTypeLabel(
                  job.type
                )}
              </span>

              {job.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  <Check
                    size={11}
                  />
                  Verified
                </span>
              )}
            </div>

            <h2 className="mt-2 line-clamp-2 text-base font-bold leading-6 text-zinc-900">
              {job.title}
            </h2>

            <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-zinc-600">
              <Building2
                size={14}
              />
              {job.company}
            </p>
          </div>
        </div>

        {/* META */}

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-zinc-500">
          {job.location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin
                size={13}
              />
              {job.location}
            </span>
          )}

          {job.workMode && (
            <span className="inline-flex items-center gap-1.5">
              <Globe2
                size={13}
              />
              {job.workMode}
            </span>
          )}

          {job.employmentType && (
            <span className="inline-flex items-center gap-1.5">
              <Clock3
                size={13}
              />
              {job.employmentType}
            </span>
          )}

          {job.field && (
            <span className="inline-flex items-center gap-1.5">
              <BriefcaseBusiness
                size={13}
              />
              {job.field}
            </span>
          )}
        </div>

        {/* DEADLINE */}

        {job.applicationEnd && (
          <div className="mt-4 rounded-xl bg-zinc-50 px-3 py-2.5 text-xs">
            <span className="text-zinc-500">
              Application deadline
            </span>

            <span className="ml-2 font-semibold text-zinc-800">
              {formatDate(
                job.applicationEnd
              )}
            </span>
          </div>
        )}

        {/* ACTIONS */}

        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-4">

          {/* HOMEPAGE */}

          <button
            type="button"
            onClick={
              onToggleHomepage
            }
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${
              selected
                ? "bg-red-600 text-white hover:bg-red-700"
                : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            {selected ? (
              <Check
                size={15}
              />
            ) : (
              <span className="h-3.5 w-3.5 rounded border border-current" />
            )}

            {selected
              ? "Homepage Selected"
              : "Add to Homepage"}
          </button>

          {/* VIEW */}

          {job.slug && (
            <Link
              href={`/jobs/${job.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50"
            >
              View
              <ExternalLink
                size={13}
              />
            </Link>
          )}

          {/* APPLY */}

          {job.applyUrl && (
            <a
              href={
                job.applyUrl
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50"
            >
              Apply
              <ExternalLink
                size={13}
              />
            </a>
          )}

          {/* DELETE */}

          <button
            type="button"
            onClick={
              onDelete
            }
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
          >
            <Trash2
              size={14}
            />
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}