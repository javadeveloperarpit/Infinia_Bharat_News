import Link from "next/link";
import { notFound } from "next/navigation";
import { getLiveJobBySlug } from "@/services/public/jobs.public.service";

export const dynamic = "force-dynamic";

function formatDate(value?: string) {
  if (!value) return "Not specified";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

function initials(company: string) {
  return company
    .split(/\s+/)
    .slice(0, 2)
    .map((v) => v[0])
    .join("")
    .toUpperCase();
}
function getCompanyDomain(company: string) {
  const name = company.toLowerCase().trim();

  const domains: Record<string, string> = {
    google: "google.com",
    "google india": "google.com",
    microsoft: "microsoft.com",
    "microsoft india": "microsoft.com",
    amazon: "amazon.jobs",
    "amazon india": "amazon.jobs",
    tata: "tata.com",
    "tata consultancy services": "tcs.com",
    tcs: "tcs.com",
    infosys: "infosys.com",
    "infosys limited": "infosys.com",
    reliance: "ril.com",
    "reliance industries": "ril.com",
    "reliance industries limited": "ril.com",
    jio: "jio.com",
    "reliance jio": "jio.com",
    adani: "adani.com",
    "adani group": "adani.com",
    deloitte: "deloitte.com",
    "deloitte india": "deloitte.com",
    accenture: "accenture.com",
    ibm: "ibm.com",
    adobe: "adobe.com",
    flipkart: "flipkart.com",
    wipro: "wipro.com",
    hcltech: "hcltech.com",
    capgemini: "capgemini.com",
    ey: "ey.com",
    kpmg: "kpmg.com",
    pwc: "pwc.com",
    oracle: "oracle.com",
    sap: "sap.com",
    cisco: "cisco.com",
    salesforce: "salesforce.com",
    nvidia: "nvidia.com",
    intel: "intel.com",
    samsung: "samsung.com",
    walmart: "walmart.com",
    paypal: "paypal.com",
    uber: "uber.com",
    swiggy: "swiggy.com",
    zomato: "zomato.com",
    meesho: "meesho.io",
    phonepe: "phonepe.com",
    razorpay: "razorpay.com",

    upsc: "upsc.gov.in",
    ssc: "ssc.gov.in",
    "staff selection commission": "ssc.gov.in",
    "india post": "indiapost.gov.in",
    "indian post": "indiapost.gov.in",
    rrb: "indianrailways.gov.in",
    "railway recruitment board": "indianrailways.gov.in",
    aai: "aai.aero",
    "airports authority of india": "aai.aero",
    drdo: "drdo.gov.in",
    isro: "isro.gov.in",
    rbi: "rbi.org.in",
    sbi: "sbi.co.in",
    "state bank of india": "sbi.co.in",
    "bank of baroda": "bankofbaroda.in",
    lic: "licindia.in",
    uppsc: "uppsc.up.nic.in",
    upsssc: "upsssc.gov.in",
    aiims: "aiims.edu",
    "department of posts": "indiapost.gov.in",
  };

  return domains[name];
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = await getLiveJobBySlug(slug);

  if (!job) notFound();
  const companyDomain = getCompanyDomain(job.company);

const resolvedLogo =
  job.companyLogo ||
  (companyDomain
    ? `https://www.google.com/s2/favicons?domain=${companyDomain}&sz=128`
    : undefined);

  return (
    <main className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#f8f9fa] text-[#202124]">
      <div className="mx-auto w-full max-w-[1180px] px-4 py-5 sm:px-6 md:py-8 lg:px-8">

        {/* Back */}
        <Link
          href="/jobs"
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[#C8102E] hover:underline"
        >
          ← Back to jobs
        </Link>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">

          {/* Main content */}
          <div className="space-y-4">

            {/* Job Hero */}
            <section className="overflow-hidden rounded-2xl border border-[#e3e6e8] bg-white shadow-sm">

              {/* INFINIA branded banner */}
              <div className="h-24 bg-gradient-to-r from-[#fff1f3] via-[#fff7f8] to-[#ffe5e9] md:h-32" />

              <div className="px-5 pb-5 md:px-7 md:pb-7">

                {/* Company logo */}
                <div className="-mt-9 flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-xl border-4 border-white bg-white text-xl font-bold text-[#C8102E] shadow-sm md:-mt-11 md:h-[88px] md:w-[88px]">
                  {resolvedLogo ? (
  <img
    src={resolvedLogo}
    alt={`${job.company} logo`}
    className="h-full w-full object-contain p-2"
    loading="eager"
    decoding="async"
  />
) : (
  <span className="flex h-full w-full items-center justify-center">
    {initials(job.company)}
  </span>
)}
                </div>

                <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-start">

                  <div className="min-w-0">
                    <h1 className="break-words text-2xl font-semibold leading-tight tracking-[-.025em] md:text-[30px]">
                      {job.title}
                    </h1>

                    <p className="mt-2 break-words text-[15px]">
                      <span className="font-semibold text-[#C8102E]">
                        {job.company}
                      </span>{" "}
                      · {job.location || "Location not specified"}
                    </p>

                    <p className="mt-1 text-sm text-[#5f6368]">
                      {job.applicationStart
                        ? `Posted ${formatDate(job.applicationStart)}`
                        : "Live listing · Posting date not specified"}
                    </p>
                  </div>

                  {/* Apply button */}
                  <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-[#C8102E] px-6 text-sm font-bold text-white transition hover:bg-[#A50D26] focus:outline-none focus:ring-2 focus:ring-[#FFD9DF] focus:ring-offset-2"
                  >
                    Apply now
                  </a>
                </div>

                {/* Tags */}
                <div className="mt-5 flex flex-wrap gap-2">
                  {[
                    job.employmentType,
                    job.workMode,
                    job.field,
                    job.experienceLevel,
                    job.region === "india" ? "India" : "Outside India",
                  ]
                    .filter(Boolean)
                    .map((v) => (
                      <span
                        key={String(v)}
                        className="rounded-md bg-[#fff1f3] px-3 py-1.5 text-xs font-semibold capitalize text-[#8f1026]"
                      >
                        {v}
                      </span>
                    ))}
                </div>
              </div>
            </section>

            {/* About */}
            <section className="rounded-2xl border border-[#e3e6e8] bg-white p-5 shadow-sm md:p-7">
              <h2 className="text-xl font-semibold">
                About the job
              </h2>

              <div className="mt-4 whitespace-pre-line text-[14px] leading-7 text-[#3c4043]">
                {job.description ||
                  "The original source has not provided a full description in its public feed. Use the official application link for complete responsibilities, eligibility and role information."}
              </div>
            </section>

            {/* Responsibilities / Eligibility / Skills */}
            {(job.responsibilities?.length ||
              job.eligibility?.length ||
              job.skills?.length) && (
              <section className="rounded-2xl border border-[#e3e6e8] bg-white p-5 shadow-sm md:p-7">

                {job.responsibilities?.length ? (
                  <div>
                    <h2 className="text-lg font-semibold">
                      Responsibilities
                    </h2>

                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[#3c4043]">
                      {job.responsibilities.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {job.eligibility?.length ? (
                  <div className="mt-6">
                    <h2 className="text-lg font-semibold">
                      Eligibility
                    </h2>

                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[#3c4043]">
                      {job.eligibility.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {job.skills?.length ? (
                  <div className="mt-6">
                    <h2 className="text-lg font-semibold">
                      Skills
                    </h2>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {job.skills.map((x) => (
                        <span
                          key={x}
                          className="rounded-full bg-[#f1f3f4] px-3 py-1.5 text-xs font-semibold text-[#3c4043]"
                        >
                          {x}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-5 lg:self-start">

            <section className="rounded-2xl border border-[#e3e6e8] bg-white p-5 shadow-sm">

              <h2 className="text-base font-semibold">
                Job overview
              </h2>

              <dl className="mt-4 space-y-4 text-sm">

                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-[#5f6368]">
                    Company / Organisation
                  </dt>
                  <dd className="mt-1 break-words font-medium">
                    {job.company}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-[#5f6368]">
                    Field
                  </dt>
                  <dd className="mt-1 font-medium">
                    {job.field}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-[#5f6368]">
                    Location
                  </dt>
                  <dd className="mt-1 break-words font-medium">
                    {job.location || "Not specified"}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-[#5f6368]">
                    Application opens
                  </dt>
                  <dd className="mt-1 font-medium">
                    {formatDate(job.applicationStart)}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-[#5f6368]">
                    Application deadline
                  </dt>

                  <dd
                    className={`mt-1 font-semibold ${
                      job.applicationEnd
                        ? "text-[#B3261E]"
                        : "text-[#3c4043]"
                    }`}
                  >
                    {job.applicationEnd
                      ? formatDate(job.applicationEnd)
                      : "Not specified by source"}
                  </dd>
                </div>

                {job.salary && (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-[#5f6368]">
                      Salary
                    </dt>

                    <dd className="mt-1 font-medium">
                      {job.salary}
                    </dd>
                  </div>
                )}
              </dl>

              {/* Sidebar apply */}
              <a
                href={job.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 flex h-11 w-full items-center justify-center rounded-full bg-[#C8102E] text-sm font-bold text-white transition hover:bg-[#A50D26] focus:outline-none focus:ring-2 focus:ring-[#FFD9DF] focus:ring-offset-2"
              >
                Apply on original website ↗
              </a>
            </section>

          </aside>
        </div>
      </div>
    </main>
  );
}