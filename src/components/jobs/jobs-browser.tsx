"use client";

import { useMemo, useState } from "react";
import type {
  Job,
  JobRegion,
  JobType,
  JobsCollectionStats,
} from "@/services/public/jobs.public.service";
import JobCard from "./job-card";

type SortMode = "recommended" | "latest" | "deadline";

type Filters = {
  region: "all" | JobRegion;
  type: "all" | JobType;
  field: string;
  company: string;
  location: string;
  experience: string;
  workMode: string;
};

const DEFAULT_FILTERS: Filters = {
  region: "india",
  type: "all",
  field: "all",
  company: "all",
  location: "all",
  experience: "all",
  workMode: "all",
};

function unique(values: Array<string | undefined>) {
  return Array.from(
    new Set(values.filter(Boolean) as string[])
  ).sort((a, b) => a.localeCompare(b));
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[.08em] text-[#5f6368]">
        {label}
      </span>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full min-w-0 max-w-full rounded-lg border border-[#dadce0] bg-white px-3 text-[13px] font-medium text-[#202124] outline-none transition focus:border-[#C8102E] focus:ring-2 focus:ring-[#FFE0E5]"
      >
        <option value="all">All {label.toLowerCase()}</option>

        {options.map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function JobsBrowser({
  jobs,
  stats,
  collectedAt,
}: {
  jobs: Job[];
  stats: JobsCollectionStats;
  collectedAt: string;
}) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortMode>("recommended");
  const [mobileFilters, setMobileFilters] = useState(false);

  const set = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const fields = useMemo(
    () => unique(jobs.map((j) => j.field)),
    [jobs]
  );

  const companies = useMemo(
    () => unique(jobs.map((j) => j.company)),
    [jobs]
  );

  const locations = useMemo(
    () =>
      unique(
        jobs
          .filter(
            (j) =>
              filters.region === "all" ||
              j.region === filters.region
          )
          .map((j) => j.location)
      ).slice(0, 250),
    [jobs, filters.region]
  );

  const experiences = useMemo(
    () => unique(jobs.map((j) => j.experienceLevel)),
    [jobs]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const list = jobs.filter((job) => {
      if (
        filters.region !== "all" &&
        job.region !== filters.region
      ) {
        return false;
      }

      if (
        filters.type !== "all" &&
        job.type !== filters.type
      ) {
        return false;
      }

      if (
        filters.field !== "all" &&
        job.field !== filters.field
      ) {
        return false;
      }

      if (
        filters.company !== "all" &&
        job.company !== filters.company
      ) {
        return false;
      }

      if (
        filters.location !== "all" &&
        job.location !== filters.location
      ) {
        return false;
      }

      if (
        filters.experience !== "all" &&
        job.experienceLevel !== filters.experience
      ) {
        return false;
      }

      if (
        filters.workMode !== "all" &&
        job.workMode !== filters.workMode
      ) {
        return false;
      }

      if (!q) return true;

      return [
        job.title,
        job.company,
        job.location,
        job.field,
        job.category,
        job.qualification,
        job.skills?.join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    });

    return [...list].sort((a, b) => {
      if (sort === "latest") {
        return (
          (b.applicationStart
            ? new Date(b.applicationStart).getTime()
            : 0) -
          (a.applicationStart
            ? new Date(a.applicationStart).getTime()
            : 0)
        );
      }

      if (sort === "deadline") {
        return (
          (a.applicationEnd
            ? new Date(a.applicationEnd).getTime()
            : Infinity) -
          (b.applicationEnd
            ? new Date(b.applicationEnd).getTime()
            : Infinity)
        );
      }

      return (
        Number(Boolean(b.featuredCompany)) -
        Number(Boolean(a.featuredCompany))
      );
    });
  }, [jobs, query, filters, sort]);

  const counts = useMemo(
    () => ({
      all: jobs.filter(
        (j) =>
          filters.region === "all" ||
          j.region === filters.region
      ).length,

      private: jobs.filter(
        (j) =>
          (filters.region === "all" ||
            j.region === filters.region) &&
          j.type === "private"
      ).length,

      remote: jobs.filter(
        (j) =>
          (filters.region === "all" ||
            j.region === filters.region) &&
          j.type === "remote"
      ).length,

      government: jobs.filter(
        (j) =>
          (filters.region === "all" ||
            j.region === filters.region) &&
          j.type === "government"
      ).length,
    }),
    [jobs, filters.region]
  );

  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) =>
      key === "region"
        ? value !== "india"
        : value !== "all"
  ).length;

  const filtersPanel = (
    <div className="min-w-0 space-y-4">
      <FilterSelect
        label="Field"
        value={filters.field}
        onChange={(v) => set("field", v)}
        options={fields}
      />

      <FilterSelect
        label="Company"
        value={filters.company}
        onChange={(v) => set("company", v)}
        options={companies}
      />

      <FilterSelect
        label="Location"
        value={filters.location}
        onChange={(v) => set("location", v)}
        options={locations}
      />

      <FilterSelect
        label="Experience"
        value={filters.experience}
        onChange={(v) => set("experience", v)}
        options={experiences}
      />

      <FilterSelect
        label="Work mode"
        value={filters.workMode}
        onChange={(v) => set("workMode", v)}
        options={["onsite", "hybrid", "remote"]}
      />

      <button
        onClick={() => setFilters(DEFAULT_FILTERS)}
        className="w-full rounded-lg border border-[#dadce0] px-3 py-2 text-sm font-semibold text-[#C8102E] hover:bg-[#f8fafd]"
      >
        Reset filters
      </button>
    </div>
  );

  return (
    <main className="min-h-screen w-full min-w-0 overflow-x-clip bg-[#f8f9fa] text-[#202124]">
      {/* HERO */}
      <section className="w-full min-w-0 border-b border-[#e3e6e8] bg-white">
        <div className="mx-auto w-full max-w-[1280px] min-w-0 px-4 py-7 sm:px-6 lg:px-8 md:py-10">
          <div className="mx-auto w-full max-w-5xl min-w-0 text-center">
            <h1 className="mt-4 break-words text-3xl font-semibold tracking-[-.035em] text-[#202124] sm:text-4xl md:text-5xl">
              Find the right job, faster.
            </h1>

            <p className="mx-auto mt-3 w-full max-w-2xl break-words text-sm leading-6 text-[#5f6368] md:text-base">
              India-first private, government and remote jobs collected
              from trusted sources. Search by role, company, field,
              location and more.
            </p>

            <div className="mx-auto mt-6 flex w-full max-w-3xl min-w-0 items-center rounded-2xl border border-[#dadce0] bg-white p-1.5 shadow-[0_2px_12px_rgba(60,64,67,.12)] focus-within:border-[#C8102E]">
              <svg
                className="ml-3 h-5 w-5 shrink-0 text-[#5f6368]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.6-3.6" />
              </svg>

              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search job title, company, skill or location"
                className="h-12 min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-[#80868b] md:text-base"
              />

              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="mr-1 shrink-0 rounded-full px-3 py-2 text-xs font-semibold text-[#5f6368] hover:bg-[#f1f3f4]"
                >
                  Clear
                </button>
              )}
            </div>

           <div className="mt-5 w-full min-w-0 overflow-hidden">
  <div className="flex w-full min-w-0 justify-start gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] sm:justify-center">
    {(["india", "outside", "all"] as const).map((r) => (
      <button
        key={r}
        onClick={() => set("region", r)}
        className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
          filters.region === r
            ? "bg-[#202124] text-white"
            : "border border-[#dadce0] bg-white text-[#3c4043] hover:bg-[#f8f9fa]"
        }`}
      >
        {r === "india"
          ? `🇮🇳 India (${stats.india})`
          : r === "outside"
            ? `🌍 Outside India (${stats.outside})`
            : `All locations (${stats.active})`}
      </button>
    ))}
  </div>
</div>
          </div>
        </div>
      </section>

      {/* CATEGORY BAR */}
      <div className="sticky top-0 z-20 w-full min-w-0 overflow-hidden border-b border-[#e3e6e8] bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1280px] min-w-0 gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8 [scrollbar-width:none]">
          {(
            [
              ["all", "All jobs", counts.all],
              ["private", "Private", counts.private],
              ["government", "Government", counts.government],
              ["remote", "Remote", counts.remote],
            ] as const
          ).map(([value, label, count]) => (
            <button
              key={value}
              onClick={() => set("type", value)}
              className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold ${
                filters.type === value
                  ? "bg-[#FFF1F3] text-[#C8102E] ring-1 ring-[#d2e3fc]"
                  : "bg-[#f1f3f4] text-[#3c4043] hover:bg-[#e8eaed]"
              }`}
            >
              {label}
              <span className="ml-1 opacity-70">{count}</span>
            </button>
          ))}

          <button
            onClick={() => setMobileFilters(true)}
            className="ml-auto shrink-0 rounded-full border border-[#dadce0] bg-white px-4 py-2 text-[13px] font-semibold text-[#3c4043] lg:hidden"
          >
            Filters {activeFilterCount ? `(${activeFilterCount})` : ""}
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="mx-auto w-full max-w-[1280px] min-w-0 px-4 py-6 sm:px-6 md:py-8 lg:px-8">
        <div className="grid w-full min-w-0 gap-6 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_230px]">
          {/* DESKTOP FILTERS */}
          <aside className="hidden min-w-0 self-start rounded-2xl border border-[#e3e6e8] bg-white p-4 lg:sticky lg:top-20 lg:block">
            <div className="mb-4 flex min-w-0 items-center justify-between gap-2">
              <h2 className="text-sm font-bold">Filters</h2>
              <span className="shrink-0 text-xs text-[#5f6368]">
                {activeFilterCount} active
              </span>
            </div>

            {filtersPanel}
          </aside>

          {/* JOB RESULTS */}
          <section className="min-w-0 w-full">
            <div className="mb-4 flex min-w-0 flex-wrap items-end justify-between gap-3">
              <div className="min-w-0">
                <h2 className="break-words text-xl font-semibold tracking-[-.02em]">
                  {filters.region === "india"
                    ? "Jobs in India"
                    : filters.region === "outside"
                      ? "Jobs outside India"
                      : "All jobs"}
                </h2>

                <p className="mt-1 text-sm text-[#5f6368]">
                  {filtered.length.toLocaleString("en-IN")} matching
                  opportunities
                </p>
              </div>

              <select
                value={sort}
                onChange={(e) =>
                  setSort(e.target.value as SortMode)
                }
                className="h-10 max-w-full shrink-0 rounded-lg border border-[#dadce0] bg-white px-3 text-sm font-medium outline-none"
              >
                <option value="recommended">Recommended</option>
                <option value="latest">Newest first</option>
                <option value="deadline">Deadline soon</option>
              </select>
            </div>

            {filtered.length ? (
              <div className="grid w-full min-w-0 grid-cols-1 gap-3 xl:grid-cols-2">
                {filtered.map((job) => (
                  <div
                    key={job.id}
                    className="w-full min-w-0 max-w-full"
                  >
                    <JobCard job={job} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full min-w-0 rounded-2xl border border-dashed border-[#bdc1c6] bg-white px-6 py-16 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f1f3f4] text-2xl">
                  ⌕
                </div>

                <h3 className="mt-4 text-lg font-semibold">
                  No matching jobs
                </h3>

                <p className="mt-1 text-sm text-[#5f6368]">
                  Try changing your search or filters.
                </p>

                <button
                  onClick={() => {
                    setQuery("");
                    setFilters(DEFAULT_FILTERS);
                  }}
                  className="mt-4 rounded-full bg-[#C8102E] px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Clear all
                </button>
              </div>
            )}
          </section>

          {/* RIGHT INFO */}
          <aside className="hidden min-w-0 self-start space-y-4 xl:sticky xl:top-20 xl:block">
            <div className="rounded-2xl border border-[#e3e6e8] bg-white p-4">
              <h3 className="text-sm font-bold">
                Live job coverage
              </h3>

              <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                <div className="rounded-xl bg-[#f8f9fa] p-3">
                  <div className="text-lg font-bold">
                    {stats.india}
                  </div>
                  <div className="text-[11px] text-[#5f6368]">
                    India
                  </div>
                </div>

                <div className="rounded-xl bg-[#f8f9fa] p-3">
                  <div className="text-lg font-bold">
                    {stats.government}
                  </div>
                  <div className="text-[11px] text-[#5f6368]">
                    Govt.
                  </div>
                </div>

                <div className="rounded-xl bg-[#f8f9fa] p-3">
                  <div className="text-lg font-bold">
                    {stats.private}
                  </div>
                  <div className="text-[11px] text-[#5f6368]">
                    Private
                  </div>
                </div>

                <div className="rounded-xl bg-[#f8f9fa] p-3">
                  <div className="text-lg font-bold">
                    {stats.remote}
                  </div>
                  <div className="text-[11px] text-[#5f6368]">
                    Remote
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#e3e6e8] bg-white p-4">
              <h3 className="text-sm font-bold">
                Trust & safety
              </h3>

              <p className="mt-2 text-xs leading-5 text-[#5f6368]">
                Always verify eligibility, fees and dates on the
                original employer or government source before
                applying. Infinia Bharat News does not charge job
                application fees.
              </p>

              <p className="mt-3 text-[10px] text-[#80868b]">
                Updated{" "}
                {new Date(collectedAt).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* MOBILE FILTER DRAWER */}
      {mobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close filters"
            onClick={() => setMobileFilters(false)}
            className="absolute inset-0 bg-black/40"
          />

          <div className="absolute inset-x-0 bottom-0 max-h-[88vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-lg font-bold">
                  Filter jobs
                </h2>

                <p className="text-xs text-[#5f6368]">
                  Narrow down your results
                </p>
              </div>

              <button
                onClick={() => setMobileFilters(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f1f3f4] text-xl"
              >
                ×
              </button>
            </div>

            {filtersPanel}

            <button
              onClick={() => setMobileFilters(false)}
              className="mt-4 w-full rounded-xl bg-[#C8102E] py-3 text-sm font-bold text-white"
            >
              Show {filtered.length} jobs
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

