"use client";

import Link from "next/link";
import { useState } from "react";
import type { Job } from "@/services/public/jobs.public.service";

function formatDate(value?: string) {
  if (!value) return "Deadline not specified";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Deadline not specified";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

function initials(company: string) {
  const result = company
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((v) => v[0])
    .join("")
    .toUpperCase();

  return result || "JB";
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
    "pwc": "pwc.com",
    oracle: "oracle.com",
    sap: "sap.com",
    cisco: "cisco.com",
    salesforce: "salesforce.com",
    nvidia: "nvidia.com",
    intel: "intel.com",
    dell: "dell.com",
    hp: "hp.com",
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
"sbi": "sbi.co.in",
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
export default function JobCard({
  job,
  compact = false,
}: {
  job: Job;
  compact?: boolean;
}) {
  const [logoFailed, setLogoFailed] = useState(false);

 

  const companyDomain = getCompanyDomain(job.company);

const resolvedLogo =
  job.companyLogo ||
  (companyDomain
    ? `https://www.google.com/s2/favicons?domain=${companyDomain}&sz=128`
    : undefined);
const showLogo = Boolean(resolvedLogo) && !logoFailed;

  return (
    <Link
      href={`/jobs/${job.slug}`}
      className="group block w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-[#e3e6e8] bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#c6cacf] hover:shadow-[0_8px_28px_rgba(0,0,0,.08)] md:p-5"
    >
      <div className="flex w-full min-w-0 max-w-full gap-3.5">

        {/* COMPANY LOGO */}
        <div
          className="
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            overflow-hidden
            rounded-xl
            border
            border-[#e6e8eb]
            bg-white
            text-sm
            font-bold
            text-[#C8102E]
          "
        >
          {showLogo ? (
            <img
              src={resolvedLogo}
              alt={`${job.company} logo`}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-contain p-1.5"
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <span
              aria-hidden="true"
              className="flex h-full w-full items-center justify-center bg-[#fff1f3]"
            >
              {initials(job.company)}
            </span>
          )}
        </div>

        {/* CONTENT */}
        <div className="min-w-0 flex-1">

          {/* TITLE + COMPANY */}
          <div className="flex min-w-0 items-start gap-2 sm:justify-between">
            <div className="min-w-0 flex-1">

              <h3 className="break-words text-[15px] font-semibold leading-5 text-[#202124] transition group-hover:text-[#C8102E] md:text-base">
                {job.title}
              </h3>

              <p className="mt-1 break-words text-sm font-medium leading-5 text-[#3c4043]">
                {job.company}
              </p>
            </div>

            {job.featuredCompany && (
              <span className="hidden shrink-0 rounded-full bg-[#fff1f3] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#C8102E] sm:inline">
                Top company
              </span>
            )}
          </div>

          {/* LOCATION */}
          <p className="mt-1.5 break-words text-[13px] leading-5 text-[#5f6368]">
            {job.location || "Location not specified"}
            {" · "}
            {job.employmentType ||
              (job.type === "government"
                ? "Government"
                : "Full time")}
          </p>

          {/* TAGS */}
          {!compact && (
            <div className="mt-3 flex min-w-0 flex-wrap gap-1.5">

              {job.field && (
                <span className="max-w-full break-words rounded-md bg-[#f1f3f4] px-2 py-1 text-[11px] font-medium text-[#3c4043]">
                  {job.field}
                </span>
              )}

              <span className="max-w-full break-words rounded-md bg-[#f1f3f4] px-2 py-1 text-[11px] font-medium text-[#3c4043]">
                {job.region === "india"
                  ? "India"
                  : "Outside India"}
              </span>

              {job.workMode && (
                <span className="max-w-full break-words rounded-md bg-[#f1f3f4] px-2 py-1 text-[11px] font-medium capitalize text-[#3c4043]">
                  {job.workMode}
                </span>
              )}
            </div>
          )}

          {/* FOOTER */}
          <div className="mt-3 flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#f1f3f4] pt-3">

            <span className="flex min-w-0 items-center gap-1.5 text-[11px] font-medium text-[#188038]">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#188038]" />

              <span className="truncate">
                Verified source
              </span>
            </span>

            <span
              className={`ml-auto max-w-full break-words text-right text-[11px] font-semibold ${
                job.applicationEnd
                  ? "text-[#b3261e]"
                  : "text-[#5f6368]"
              }`}
            >
              {job.applicationEnd
                ? `Apply by ${formatDate(job.applicationEnd)}`
                : "Open listing"}
            </span>

          </div>
        </div>
      </div>
    </Link>
  );
}

