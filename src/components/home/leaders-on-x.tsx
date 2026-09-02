import LeadersXCarousel, {
  JobOpportunity,
} from "./leaders-x-carousel";

import jobsHome from "@/../public/data/jobs-home.json";

interface JobsHomeItem {
  id: string;
  slug?: string;
  title: string;
  company: string;
  companyLogo?: string;
  location?: string;
  type?: string;
  region?: string;
  employmentType?: string;
  workMode?: string;
  field?: string;
  category?: string;
  link?: string;
  applicationEnd?: string;
  published?: boolean;
  verified?: boolean;
  homepage?: boolean;
}

function getOpportunityType(
  title: string,
  category?: string
): JobOpportunity["type"] {
  const text =
    `${title} ${category || ""}`.toLowerCase();

  if (/\bintern(ship)?\b/.test(text)) {
    return "internship";
  }

  if (
    /\bgraduate\b/.test(text) ||
    /\bcampus\b/.test(text) ||
    /\btrainee\b/.test(text) ||
    /\bgraduate program\b/.test(text)
  ) {
    return "program";
  }

  if (/\bprogram\b/.test(text)) {
    return "program";
  }

  return "job";
}

function getInitialCompanyLogo(
  company: string,
  existingLogo?: string
): string | undefined {
  if (existingLogo) {
    return existingLogo;
  }

  const domains: Record<string, string> = {
    google: "google.com",
    microsoft: "microsoft.com",
    amazon: "amazon.com",
    "tata group": "tata.com",
    reliance: "ril.com",
    jio: "jio.com",
    infosys: "infosys.com",
    deloitte: "deloitte.com",
    adani: "adani.com",
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
    cognizant: "cognizant.com",
    "tech mahindra": "techmahindra.com",
    ltimindtree: "ltimindtree.com",
    mphasis: "mphasis.com",
    oracle: "oracle.com",
    sap: "sap.com",
    cisco: "cisco.com",
    intel: "intel.com",
    nvidia: "nvidia.com",
    qualcomm: "qualcomm.com",
    dell: "dell.com",
    hp: "hp.com",
    jpmorganchase: "jpmorganchase.com",
    "goldman sachs": "goldmansachs.com",
    "morgan stanley": "morganstanley.com",
    bcg: "bcg.com",
    mckinsey: "mckinsey.com",
    bain: "bain.com",
  };

  const normalized = company
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[.,()[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const domainKey = Object.keys(domains).find(
    (key) =>
      normalized === key ||
      normalized.includes(key) ||
      key.includes(normalized)
  );

  if (!domainKey) {
    return undefined;
  }

  return `https://www.google.com/s2/favicons?domain=${domains[domainKey]}&sz=128`;
}

export default function LeadersOnX() {
  /*
   * Explicitly tell TypeScript what the imported
   * jobs-home.json contains.
   */
  const allJobs: JobsHomeItem[] =
    Array.isArray(jobsHome)
      ? (jobsHome as JobsHomeItem[])
      : [];

  /*
   * Homepage JSON already contains only selected
   * homepage jobs. Keep the hard safety limit of 20.
   */
  const selectedJobs: JobsHomeItem[] =
    allJobs.slice(0, 20);

  if (selectedJobs.length === 0) {
    return null;
  }

  const opportunities: JobOpportunity[] =
    selectedJobs
      .filter(
        (
          job: JobsHomeItem
        ): job is JobsHomeItem =>
          Boolean(
            job &&
              job.id &&
              job.title &&
              job.company &&
              job.link
          )
      )
      .map(
        (
          job: JobsHomeItem
        ): JobOpportunity => ({
          id: job.id,
          title: job.title,
          company: job.company,

          companyLogo:
            getInitialCompanyLogo(
              job.company,
              job.companyLogo
            ),

          location: job.location,

          type: getOpportunityType(
            job.title,
            job.category
          ),

          employmentType:
            job.employmentType,

          workMode: job.workMode,

          field: job.field,

          link: job.link as string,

          applicationEnd:
            job.applicationEnd,
        })
      );

  if (opportunities.length === 0) {
    return null;
  }

  return (
    <LeadersXCarousel
      opportunities={opportunities}
    />
  );
}