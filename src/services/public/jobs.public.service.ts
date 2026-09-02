export type JobType = "private" | "remote" | "government";
export type JobRegion = "india" | "outside";

export interface Job {
  id: string;
  slug: string;
  title: string;
  company: string;
  companyLogo?: string;
  type: JobType;
  region: JobRegion;
  source: string;
  sourceUrl: string;
  applyUrl: string;
  location?: string;
  country?: string;
  employmentType?: string;
  workMode?: "onsite" | "hybrid" | "remote";
  field?: string;
  category?: string;
  experienceLevel?: string;
  qualification?: string;
  salary?: string;
  description?: string;
  responsibilities?: string[];
  eligibility?: string[];
  skills?: string[];
  applicationStart?: string;
  applicationEnd?: string;
  verified: boolean;
  published?: boolean;
  updatedAt?: string;
  featuredCompany?: boolean;
}

export interface JobsCollectionStats {
  fetched: number;
  active: number;
  india: number;
  outside: number;
  government: number;
  private: number;
  remote: number;
  expired: number;
  missingDates: number;
  duplicatesRemoved: number;
  sourceErrors: string[];
  sourceCounts: Record<string, number>;
}

export interface JobsCollectionResult {
  jobs: Job[];
  stats: JobsCollectionStats;
  collectedAt: string;
}

const SOURCE_TIMEOUT_MS = 12_000;
const EMPLOYMENT_NEWS_URL = "https://employmentnews.gov.in/newemp/AllJobs.aspx?k=All";
const HIMALAYAS_API = "https://himalayas.app/jobs/api";
const JOBICY_API = "https://jobicy.com/api/v2/remote-jobs?count=200";
const REMOTIVE_API = "https://remotive.com/api/remote-jobs";
const JOB_OPPORTUNITIES_API = "https://api.jobopportunitiesapi.org/public/jobs?country=IN&limit=50";
const ARBEITNOW_API = "https://www.arbeitnow.com/api/job-board-api";

const GOOGLE_CAREERS_INDIA = "https://www.google.com/about/careers/applications/jobs/results/?location=India";
const TATA_CAREERS_JOBS = "https://www.tata.com/careers/jobs/joblisting";
const DELOITTE_INDIA_JOBS = "https://southasiacareers.deloitte.com/go/Deloitte-India/718244/";
const SARKARI_RESULT_LATEST = "https://www.sarkariresult.com/latestjob/";

// ============================================================
// MAJOR COMPANY DIRECT SOURCES
// ============================================================

const MICROSOFT_INDIA_URL =
  "https://careers.microsoft.com/v2/global/en/locations/india.html";

const AMAZON_INDIA_URL =
  "https://www.amazon.jobs/en/search?country=IND&loc_query=India";

const RELIANCE_CAREERS_URL =
  "https://careers.ril.com/rilcareers/frmJobSearch.aspx";

const JIO_CAREERS_URL =
  "https://careers.jio.com/frmJobCategories.aspx";

const ADANI_CAREERS_URL =
  "https://www.adani.com/careers";

const INFOSYS_CAREERS_URL =
  "https://www.infosys.com/careers.html";


// ------------------------------------------------------------
// Generic helper
// ------------------------------------------------------------

function makeDirectCompanyJob(params: {
  id: string;
  title: string;
  company: string;
  source: string;
  sourceUrl: string;
  applyUrl: string;
  location?: string;
  country?: string;
  description?: string;
  applicationStart?: string;
  employmentType?: string;
  workMode?: Job["workMode"];
  category?: string;
  companyLogo?: string;
}): Job {
  const location = text(params.location || "India");

  return makeJob({
    id: params.id,
    slug: `${slugify(params.title)}-${hashId(params.id)}`,
    title: params.title,
    company: params.company,
    companyLogo: params.companyLogo,
    type: params.workMode === "remote" ? "remote" : "private",
    region: detectRegion(location, params.country || "India"),
    source: params.source,
    sourceUrl: params.sourceUrl,
    applyUrl: params.applyUrl,
    location,
    country: params.country || "India",
    employmentType: params.employmentType || "Full time",
    workMode: params.workMode || "onsite",
    category: params.category,
    description:
      params.description ||
      `Live opening listed on the official ${params.company} careers portal. Open the original job page for complete responsibilities, qualifications and application details.`,
    applicationStart: params.applicationStart,
    verified: true,
    published: true,
    featuredCompany: true,
  });
}


// ============================================================
// MICROSOFT INDIA
// ============================================================

async function collectMicrosoftIndia(): Promise<Job[]> {
  const html = await fetchText(MICROSOFT_INDIA_URL);

  const jobs: Job[] = [];

  /*
   * Microsoft India page exposes individual job cards and
   * official /jobs/ URLs in the rendered HTML.
   */
  const linkRegex =
    /<a[^>]+href=["']([^"']*\/jobs\/[^"'#?]+)["'][^>]*>([\s\S]*?)<\/a>/gi;

  const seen = new Set<string>();

  for (const match of html.matchAll(linkRegex)) {
    const href = absoluteUrl(MICROSOFT_INDIA_URL, match[1]);
    const title = cleanHtml(match[2]);

    if (!title || title.length < 4) continue;
    if (seen.has(href)) continue;

    if (
      /search|similar jobs|learn more|locations|accessibility|privacy/i.test(
        title
      )
    ) {
      continue;
    }

    seen.add(href);

    const position = match.index ?? 0;

    const nearby = cleanHtml(
      html.slice(Math.max(0, position - 300), position + 5000)
    );

    const locationMatch = nearby.match(
      /India\s*,\s*([A-Za-z .&'-]+)(?:\s*,\s*India)?/i
    );

    const workSiteMatch = nearby.match(
      /Work site\s*([^<]{0,120})/i
    );

    const postedMatch = nearby.match(
      /(?:Update time|Posted)\s*(\d{4}-\d{2}-\d{2})/i
    );

    const location = locationMatch
      ? `India, ${text(locationMatch[1])}`
      : "India";

    const workModeText = text(workSiteMatch?.[1]);

    let workMode: Job["workMode"] = "onsite";

    if (/remote/i.test(workModeText)) {
      workMode = "remote";
    } else if (/hybrid|days?\s*\/\s*week/i.test(workModeText)) {
      workMode = "hybrid";
    }

    jobs.push(
      makeDirectCompanyJob({
        id: `microsoft-${hashId(href)}`,
        title,
        company: "Microsoft",
        source: "Microsoft Careers",
        sourceUrl: MICROSOFT_INDIA_URL,
        applyUrl: href,
        location,
        country: "India",
        workMode,
        applicationStart: postedMatch
          ? iso(postedMatch[1])
          : undefined,
        category: detectField(title, "", nearby),
        description:
          cleanHtml(nearby).slice(0, 12000) ||
          undefined,
      })
    );
  }

  return jobs.slice(0, 500);
}


// ============================================================
// AMAZON INDIA
// ============================================================

async function collectAmazonIndia(): Promise<Job[]> {
  const html = await fetchText(AMAZON_INDIA_URL);

  const jobs: Job[] = [];

  /*
   * Amazon job cards use job-detail URLs and expose Job ID,
   * location and posted date in the page.
   */
  const links = Array.from(
    html.matchAll(
      /<a[^>]+href=["']([^"']*\/en\/jobs\/[^"'#?]+)["'][^>]*>([\s\S]*?)<\/a>/gi
    )
  );

  const seen = new Set<string>();

  for (const match of links) {
    const href = absoluteUrl(AMAZON_INDIA_URL, match[1]);
    const title = cleanHtml(match[2]);

    if (!title || title.length < 4) continue;
    if (seen.has(href)) continue;

    if (
      /search|filter|reset|learn more|sign in|teams|locations/i.test(
        title
      )
    ) {
      continue;
    }

    seen.add(href);

    const position = match.index ?? 0;

    const nearby = cleanHtml(
      html.slice(Math.max(0, position - 500), position + 4500)
    );

    const locationMatch = nearby.match(
      /([A-Za-z .'-]+),\s*(?:[A-Z]{2}),\s*IND\b/i
    );

    const jobIdMatch = nearby.match(
      /Job ID:\s*([A-Z0-9-]+)/i
    );

    const postedMatch = nearby.match(
      /Posted\s+([A-Za-z]+\s+\d{1,2},\s+\d{4})/i
    );

    const location = locationMatch
      ? text(locationMatch[1])
      : "India";

    const id = `amazon-${jobIdMatch?.[1] || hashId(href)}`;

    jobs.push(
      makeDirectCompanyJob({
        id,
        title,
        company: "Amazon",
        source: "Amazon Jobs",
        sourceUrl: AMAZON_INDIA_URL,
        applyUrl: href,
        location,
        country: "India",
        applicationStart: postedMatch
          ? iso(postedMatch[1])
          : undefined,
        category: detectField(title, "", nearby),
        description: cleanHtml(nearby).slice(0, 12000),
      })
    );
  }

  return jobs.slice(0, 500);
}


// ============================================================
// RELIANCE
// ============================================================

async function collectReliance(): Promise<Job[]> {
  const html = await fetchText(RELIANCE_CAREERS_URL);

  const jobs: Job[] = [];

  /*
   * Reliance official listing page exposes:
   * Job Title | Functional Area | Location | Posted On
   */
  const rowRegex =
    /<tr[^>]*>([\s\S]*?)<\/tr>/gi;

  for (const row of html.matchAll(rowRegex)) {
    const rowHtml = row[1];

    const cells = Array.from(
      rowHtml.matchAll(
        /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi
      )
    ).map((m) => cleanHtml(m[1]));

    if (cells.length < 3) continue;

    const title = text(cells[0]);
    const functionArea = text(cells[1]);
    const location = text(cells[2]);
    const posted = text(cells[3] || "");

    if (
      !title ||
      !location ||
      /job title|functional area|search for/i.test(title)
    ) {
      continue;
    }

    const linkMatch = rowHtml.match(
      /href=["']([^"']+)["']/i
    );

    const applyUrl = linkMatch
      ? absoluteUrl(RELIANCE_CAREERS_URL, linkMatch[1])
      : RELIANCE_CAREERS_URL;

    jobs.push(
      makeDirectCompanyJob({
        id: `reliance-${hashId(
          `${title}|${location}|${posted}`
        )}`,
        title,
        company: "Reliance Industries",
        source: "Reliance Careers",
        sourceUrl: RELIANCE_CAREERS_URL,
        applyUrl,
        location,
        country: "India",
        applicationStart: iso(posted),
        category: functionArea,
        description:
          `Live opportunity listed on the official Reliance Careers portal. Functional area: ${functionArea}.`,
      })
    );
  }

  return jobs;
}


// ============================================================
// JIO
// ============================================================

async function collectJio(): Promise<Job[]> {
  const html = await fetchText(JIO_CAREERS_URL);

  const jobs: Job[] = [];

  const links = Array.from(
    html.matchAll(
      /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
    )
  );

  const seen = new Set<string>();

  for (const match of links) {
    const href = absoluteUrl(JIO_CAREERS_URL, match[1]);
    const title = cleanHtml(match[2]);

    if (!title || title.length < 4) continue;

    if (
      /home|clear all|search|filter|view all|privacy|legal|copyright/i.test(
        title
      )
    ) {
      continue;
    }

    if (seen.has(href)) continue;

    const position = match.index ?? 0;

    const nearby = cleanHtml(
      html.slice(Math.max(0, position - 500), position + 2500)
    );

    /*
     * Do not treat category counters like
     * "Engineering & Technology 239 jobs" as job titles.
     */
    if (
      /\d+\s+jobs?$/i.test(title) ||
      /featured categories|our featured categories/i.test(nearby)
    ) {
      continue;
    }

    if (
      !/software|engineer|developer|manager|executive|analyst|associate|sales|technology|finance|hr|operations|apprentice|technician|security|product/i.test(
        title
      )
    ) {
      continue;
    }

    seen.add(href);

    const locationMatch = nearby.match(
      /(?:Location|Mumbai|Navi Mumbai|Bengaluru|Bangalore|Hyderabad|Delhi|Pune|Chennai|India)[^<]{0,100}/i
    );

    jobs.push(
      makeDirectCompanyJob({
        id: `jio-${hashId(href + title)}`,
        title,
        company: "Reliance Jio",
        source: "Jio Careers",
        sourceUrl: JIO_CAREERS_URL,
        applyUrl: href,
        location: locationMatch
          ? text(locationMatch[0]).replace(/^Location\s*:?\s*/i, "")
          : "India",
        country: "India",
        category: detectField(title, "", nearby),
        description:
          "Live opportunity listed on the official Reliance Jio Careers portal.",
      })
    );
  }

  return jobs.slice(0, 500);
}


// ============================================================
// ADANI
// ============================================================

async function collectAdani(): Promise<Job[]> {
  const html = await fetchText(ADANI_CAREERS_URL);

  const jobs: Job[] = [];

  const links = Array.from(
    html.matchAll(
      /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
    )
  );

  const seen = new Set<string>();

  for (const match of links) {
    const href = absoluteUrl(ADANI_CAREERS_URL, match[1]);
    const title = cleanHtml(match[2]);

    if (!title || title.length < 5) continue;
    if (seen.has(href)) continue;

    if (
      /home|about|contact|read more|learn more|careers|search|privacy|terms/i.test(
        title
      )
    ) {
      continue;
    }

    const position = match.index ?? 0;

    const nearby = cleanHtml(
      html.slice(Math.max(0, position - 500), position + 2500)
    );

    if (
      !/job|career|opening|vacancy|engineer|manager|executive|analyst|officer|technician/i.test(
        `${title} ${nearby}`
      )
    ) {
      continue;
    }

    seen.add(href);

    jobs.push(
      makeDirectCompanyJob({
        id: `adani-${hashId(href + title)}`,
        title,
        company: "Adani Group",
        source: "Adani Careers",
        sourceUrl: ADANI_CAREERS_URL,
        applyUrl: href,
        location: "India",
        country: "India",
        category: detectField(title, "", nearby),
        description:
          "Live opportunity surfaced from the official Adani careers portal.",
      })
    );
  }

  return jobs.slice(0, 500);
}


// ============================================================
// INFOSYS
// ============================================================

async function collectInfosysIndia(): Promise<Job[]> {
  const html = await fetchText(INFOSYS_CAREERS_URL);

  const jobs: Job[] = [];

  const links = Array.from(
    html.matchAll(
      /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
    )
  );

  const seen = new Set<string>();

  for (const match of links) {
    const href = absoluteUrl(INFOSYS_CAREERS_URL, match[1]);
    const title = cleanHtml(match[2]);

    if (!title || title.length < 5) continue;
    if (seen.has(href)) continue;

    if (
      /graduates|experienced professionals|students|internships|explore opportunities|learn more|home/i.test(
        title
      )
    ) {
      continue;
    }

    const position = match.index ?? 0;

    const nearby = cleanHtml(
      html.slice(Math.max(0, position - 500), position + 3000)
    );

    if (
      !/job|career|opening|software|developer|engineer|analyst|consultant|technology|intern/i.test(
        `${title} ${nearby}`
      )
    ) {
      continue;
    }

    seen.add(href);

    jobs.push(
      makeDirectCompanyJob({
        id: `infosys-${hashId(href + title)}`,
        title,
        company: "Infosys",
        source: "Infosys Careers",
        sourceUrl: INFOSYS_CAREERS_URL,
        applyUrl: href,
        location: "India",
        country: "India",
        category: detectField(title, "", nearby),
        description:
          "Live opportunity surfaced from the official Infosys Careers portal.",
      })
    );
  }

  return jobs.slice(0, 500);
}

function absoluteUrl(base: string, href: string): string {
  try { return new URL(href, base).toString(); } catch { return base; }
}

async function collectGoogleIndia(): Promise<Job[]> {
  const html = await fetchText(GOOGLE_CAREERS_INDIA);
  const links = Array.from(html.matchAll(/<a[^>]+href=["']([^"']*\/about\/careers\/applications\/jobs\/results\/[^"'#?]+[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi));
  const seen = new Set<string>();
  const jobs: Job[] = [];
  for (const match of links) {
    const href = absoluteUrl(GOOGLE_CAREERS_INDIA, match[1]);
    const title = cleanHtml(match[2]);
    if (!title || title.length < 4 || /learn more|share|search jobs/i.test(title) || seen.has(href)) continue;
    seen.add(href);
    const pos = match.index ?? 0;
    const nearby = cleanHtml(html.slice(pos, pos + 1800));
    const locMatch = nearby.match(/(?:Bengaluru|Hyderabad|Gurugram|Gurgaon|Mumbai|Pune|Chennai|Delhi|Noida|Kolkata)[^|<]{0,100}India/i);
    const location = locMatch ? text(locMatch[0]) : "India";
    const id = `google-${hashId(href)}`;
    jobs.push(makeJob({
      id, slug: `${slugify(title)}-${hashId(id)}`, title, company: "Google", type: "private", region: "india",
      source: "Google Careers", sourceUrl: GOOGLE_CAREERS_INDIA, applyUrl: href, location, country: "India",
      workMode: /remote/i.test(nearby) ? "remote" : "onsite", category: "Technology",
      applicationStart: undefined, verified: true, published: true, featuredCompany: true,
      description: "Live opening listed on Google Careers. Open the official role page for complete qualifications, responsibilities and application details.",
    }));
  }
  return jobs.slice(0, 300);
}

async function collectTataCareers(): Promise<Job[]> {
  const html = await fetchText(TATA_CAREERS_JOBS);
  const anchors = Array.from(html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi));
  const jobs: Job[] = []; const seen = new Set<string>();
  for (const a of anchors) {
    const label = cleanHtml(a[2]);
    const href = absoluteUrl(TATA_CAREERS_JOBS, a[1]);
    if (!label || label.length < 5 || seen.has(href)) continue;
    const pos = a.index ?? 0; const nearby = cleanHtml(html.slice(Math.max(0, pos - 500), pos + 1500));
    if (!/apply|job|career|opening/i.test(`${href} ${nearby}`) || !/tata|air india|titan|croma|jlr|ihcl/i.test(nearby)) continue;
    const companyMatch = nearby.match(/(Tata Consultancy Services|TCS|Tata Motors|Tata Steel|Tata Communications|Tata Technologies|Tata Consumer|Tata Projects|Tata Digital|Tata Capital|Tata 1mg|Air India|Titan|IHCL|JLR|Croma)/i);
    if (!companyMatch) continue;
    const company = companyMatch[1]; seen.add(href);
    const locationMatch = nearby.match(/(Bengaluru|Bangalore|Hyderabad|Mumbai|Pune|Chennai|Gurugram|Gurgaon|Delhi|Noida|Kolkata|Ahmedabad|Flexible)(?:,?\s*(?:IN|India))?/i);
    const title = label.replace(/Apply.*$/i, "").trim();
    if (/search|filter|read more|view/i.test(title)) continue;
    const id = `tata-${hashId(href + title)}`;
    jobs.push(makeJob({ id, slug: `${slugify(title)}-${hashId(id)}`, title, company, type: "private", region: "india", source: "Tata Group Careers", sourceUrl: TATA_CAREERS_JOBS, applyUrl: href, location: locationMatch?.[0] || "India", country: "India", workMode: /flexible|remote/i.test(nearby) ? "remote" : "onsite", applicationStart: undefined, verified: true, published: true, featuredCompany: true, description: `Live opportunity surfaced by the official Tata Group careers portal for ${company}. Use the official application page for complete details.` }));
  }
  return jobs.slice(0, 300);
}

async function collectDeloitteIndia(): Promise<Job[]> {
  const html = await fetchText(DELOITTE_INDIA_JOBS);
  const rows = Array.from(html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi));
  const jobs: Job[] = [];
  for (const row of rows) {
    const hrefMatch = row[1].match(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i);
    if (!hrefMatch) continue;
    const title = cleanHtml(hrefMatch[2]);
    const rowText = cleanHtml(row[1]);
    if (!title || /title|reset|page/i.test(title)) continue;
    const locationMatch = rowText.match(/([A-Za-z .&-]+),\s*IN\b/i);
    const dateMatch = rowText.match(/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}/i);
    if (!locationMatch) continue;
    const href = absoluteUrl(DELOITTE_INDIA_JOBS, hrefMatch[1]);
    const id = `deloitte-${hashId(href + title)}`;
    jobs.push(makeJob({ id, slug: `${slugify(title)}-${hashId(id)}`, title, company: "Deloitte India", type: "private", region: "india", source: "Deloitte India Careers", sourceUrl: DELOITTE_INDIA_JOBS, applyUrl: href, location: `${text(locationMatch[1])}, India`, country: "India", workMode: "onsite", category: "Consulting", applicationStart: dateMatch ? iso(dateMatch[0]) : undefined, verified: true, published: true, featuredCompany: true, description: "Live role listed on Deloitte South Asia Careers. Open the official role page for complete responsibilities, qualifications and application details." }));
  }
  return jobs;
}

const INDIA_WORDS = [
  "india", "bengaluru", "bangalore", "hyderabad", "pune", "mumbai", "delhi", "gurugram",
  "gurgaon", "noida", "chennai", "kolkata", "ahmedabad", "jaipur", "lucknow", "kochi",
  "cochin", "trivandrum", "thiruvananthapuram", "bhubaneswar", "chandigarh", "indore", "nagpur",
];

const FEATURED_COMPANIES = [
  "google", "alphabet", "oracle", "kpmg", "tata", "tcs", "tata consultancy", "adani", "microsoft",
  "amazon", "deloitte", "ey", "ernst & young", "pwc", "accenture", "infosys", "wipro", "hcl",
  "ibm", "jpmorgan", "jp morgan", "goldman sachs", "morgan stanley", "flipkart", "reliance",
  "airtel", "paytm", "phonepe", "razorpay", "swiggy", "zomato", "meesho", "uber", "adobe",
  "salesforce", "sap", "intel", "nvidia", "qualcomm", "samsung",
];

const SMARTRECRUITERS_COMPANIES = [
  { id: "BoschGroup", name: "Bosch" },
  { id: "BoschRexroth", name: "Bosch Rexroth" },
  { id: "Visa", name: "Visa" },
  { id: "Sutherland", name: "Sutherland" },
];

function text(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function slugify(value: string): string {
  return text(value).toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 105);
}

function hashId(value: string): string {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function cleanHtml(value: unknown): string {
  return text(String(value ?? "").replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&quot;/gi, '"').replace(/&#39;/gi, "'"));
}

function iso(value: unknown): string {
  const raw = text(value);
  if (!raw) return "";
  const parsed = new Date(raw);
  return Number.isFinite(parsed.getTime()) ? parsed.toISOString() : "";
}

function indiaDate(value: string, endOfDay = false): string {
  const raw = text(value);
  const match = raw.match(/(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})/);
  if (!match) return "";
  const [, d, m, y] = match;
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}T${endOfDay ? "23:59:59" : "00:00:00"}+05:30`;
}


function extractDateByLabel(html: string, labels: string[]): string {
  const source = cleanHtml(html);
  const label = labels
    .map((value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");

  // Numeric date:
  // 01/09/2026
  // 01-09-2026
  // 01.09.2026
  // 01/09/26
  const numeric = source.match(
    new RegExp(
      `(?:${label})[^\\d]{0,160}(\\d{1,2}[/.-]\\d{1,2}[/.-]\\d{2,4})`,
      "i"
    )
  );

  if (numeric) {
    const parsed = indiaDate(numeric[1], false);
    if (parsed) return parsed;
  }

  // Text date:
  // 01 September 2026
  // September 01, 2026
  // 01 Sep 2026
  const textDate = source.match(
    new RegExp(
      `(?:${label})[^\\dA-Za-z]{0,160}` +
      `(?:` +
        `(\\d{1,2}\\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\\s+\\d{4})` +
        `|` +
        `((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\\s+\\d{1,2},?\\s+\\d{4})` +
      `)`,
      "i"
    )
  );

  if (textDate) {
    const parsed = new Date(textDate[1] || textDate[2]);
    if (Number.isFinite(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  return "";
}

function extractLastDateFromTitle(title: string): string {
  const raw = text(title);

  const match = raw.match(
    /\bLast(?:\s+Date)?\s*:?\s*(\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4})\b/i
  );

  if (!match) return "";

  return indiaDate(match[1], true);
}

function extractOfficialLink(html: string): string {
  const links = Array.from(html.matchAll(/<a[^>]+href=["'](https?:\/\/[^"']+)["'][^>]*>/gi)).map((m) => m[1]);
  const usable = links.find((href) => {
    try {
      const host = new URL(href).hostname.toLowerCase();
      return !host.includes("sarkariresult.com") && !host.includes("facebook.com") && !host.includes("twitter.com") && !host.includes("instagram.com") && !host.includes("youtube.com");
    } catch { return false; }
  });
  return usable || "";
}

function extractOrganisationFromSarkariResult(
  detailText: string,
  title: string
): string {
  const textValue = text(detailText);

  const patterns = [
    /(?:Organisation|Organization|Department|Department Name|Recruiting Authority)\s*:?\s*([A-Za-z0-9&.,()'\/ -]{3,100})/i,
    /(?:Name of Organization|Name of Organisation)\s*:?\s*([A-Za-z0-9&.,()'\/ -]{3,100})/i,
  ];

  for (const pattern of patterns) {
    const match = textValue.match(pattern);

    if (match?.[1]) {
      const value = text(match[1]);

      if (
        value &&
        !/online form|apply online|last date|important date/i.test(value)
      ) {
        return value;
      }
    }
  }

  /*
   * Fallback: try to identify the organisation from the title.
   */
  const knownOrganizations = [
    "UPSC",
    "SSC",
    "UPSSSC",
    "RRB",
    "RRC",
    "SBI",
    "IBPS",
    "PNB",
    "Bank of Baroda",
    "Indian Army",
    "Indian Navy",
    "Indian Air Force",
    "ISRO",
    "DRDO",
    "AIIMS",
    "JNU",
    "IIT",
    "AAI",
    "IOCL",
    "NTPC",
    "SAIL",
    "BSNL",
    "LIC",
    "NICL",
    "RPSC",
    "RSSB",
    "MPPSC",
    "MPESB",
    "BPSC",
    "JSSC",
    "HSSC",
    "HPPSC",
    "UPPSC",
  ];

  const matched = knownOrganizations.find((name) =>
    new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(
      title
    )
  );

  return matched || "Government Recruitment";
}


function extractGovernmentLocation(detailText: string): string {
  const match = detailText.match(
    /(?:Job Location|Posting Location|Place of Posting|Location)\s*:?\s*([A-Za-z0-9,./()& -]{2,120})/i
  );

  if (!match?.[1]) return "";

  const location = text(match[1]);

  if (
    /application|qualification|eligibility|salary|age limit|vacancy|notification/i.test(
      location
    )
  ) {
    return "";
  }

  return location;
}

async function collectSarkariResult(): Promise<Job[]> {
  const html = await fetchText(SARKARI_RESULT_LATEST);

  const anchors = Array.from(
    html.matchAll(
      /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
    )
  );

  type Candidate = {
    title: string;
    url: string;
    titleEnd?: string;
  };

  const candidates: Candidate[] = [];
  const seen = new Set<string>();

  const BLOCKED_TITLE_PATTERNS = [
    /admit\s*card/i,
    /\bresult\b/i,
    /answer\s*key/i,
    /syllabus/i,
    /correction\s*(?:form|window)?/i,
    /counselling/i,
    /certificate/i,
    /document\s*(?:upload|verification)/i,
    /option\s*(?:form|preference)/i,
    /fee\s*refund/i,
    /exam\s*date/i,
    /exam\s*city/i,
    /cut\s*off/i,
    /vacancy\s*increase/i,
    /final\s*answer/i,
    /response\s*sheet/i,
  ];

  const JOB_PATTERNS = [
    /online\s*form/i,
    /recruitment/i,
    /vacancy/i,
    /bharti/i,
    /apprentice/i,
    /apprenticeship/i,
    /staff\s*nurse/i,
    /scientist/i,
    /engineer/i,
    /officer/i,
    /assistant/i,
    /clerk/i,
    /teacher/i,
    /professor/i,
    /lecturer/i,
    /constable/i,
    /sub\s*inspector/i,
    /\bsi\b/i,
    /junior\s*engineer/i,
    /\bje\b/i,
    /technician/i,
    /manager/i,
    /executive/i,
    /operator/i,
    /conductor/i,
    /group\s*[abcde]/i,
    /various\s*post/i,
    /various\s*posts/i,
    /mts/i,
    /jrf/i,
    /trainee/i,
    /research/i,
  ];

  for (const anchor of anchors) {
    const title = cleanHtml(anchor[2]);
    const url = absoluteUrl(SARKARI_RESULT_LATEST, anchor[1]);

    if (!title) continue;
    if (!url.includes("sarkariresult.com/")) continue;
    if (url === SARKARI_RESULT_LATEST) continue;

    // Ignore navigation/category links.
    if (
      /^(home|latest job|admit card|result|syllabus|admission|contact|about)$/i.test(
        title
      )
    ) {
      continue;
    }

    // Ignore clearly non-recruitment pages.
    if (BLOCKED_TITLE_PATTERNS.some((pattern) => pattern.test(title))) {
      continue;
    }

    // Keep job-looking titles.
    if (!JOB_PATTERNS.some((pattern) => pattern.test(title))) {
      continue;
    }

    if (seen.has(url)) continue;
    seen.add(url);

    const titleEnd = extractLastDateFromTitle(title);

    // IMPORTANT:
    // Do NOT reject here when title has no last date.
    // We will inspect the actual detail page.
    candidates.push({
      title,
      url,
      titleEnd: titleEnd || undefined,
    });

    // Sarkari Result currently has a long Latest Jobs list.
    // Keep a large discovery window instead of stopping at 120.
    if (candidates.length >= 350) break;
  }

  const jobs: Job[] = [];

  /*
   * Detail pages are fetched in batches.
   * 10 concurrent requests gives much better coverage
   * without creating hundreds of simultaneous requests.
   */
  const concurrency = 10;

  for (let i = 0; i < candidates.length; i += concurrency) {
    const batch = candidates.slice(i, i + concurrency);

    const settled = await Promise.allSettled(
      batch.map(async (candidate) => {
        try {
          const detail = await fetchText(candidate.url);

          const start = extractDateByLabel(detail, [
            "Application Begin",
            "Application Start",
            "Application Starting Date",
            "Apply Start Date",
            "Apply Online Start Date",
            "Online Application Begin",
            "Online Application Start",
            "Registration Begin",
            "Registration Start",
            "Registration Starting Date",
            "Form Start Date",
            "Start Date",
          ]);

          const detailEnd = extractDateByLabel(detail, [
            "Last Date",
            "Application End",
            "Application Last Date",
            "Application Closing Date",
            "Apply Last Date",
            "Apply Online Last Date",
            "Online Application Last Date",
            "Registration Last Date",
            "Registration End",
            "Registration Closing Date",
            "Form Last Date",
            "Closing Date",
            "End Date",
          ]);

          const end = detailEnd || candidate.titleEnd || "";

          /*
           * Government jobs must have BOTH dates.
           * We deliberately do not invent a start date.
           */
          if (!start || !end) {
            return null;
          }

          const startTime = new Date(start).getTime();
          const endTime = new Date(end).getTime();
          const now = Date.now();

          if (
            !Number.isFinite(startTime) ||
            !Number.isFinite(endTime) ||
            startTime > endTime ||
            now < startTime ||
            now > endTime
          ) {
            return null;
          }

          /*
           * Try to identify the organisation from the page.
           */
          const detailText = cleanHtml(detail);

          const company =
            extractOrganisationFromSarkariResult(
              detailText,
              candidate.title
            ) || "Government Recruitment";

          /*
           * Prefer an external official application URL.
           */
          const official = extractOfficialLink(detail);

          /*
           * Try to extract location from the detail page.
           */
          const location =
            extractGovernmentLocation(detailText) || "India";

          const id = `sarkariresult-${hashId(candidate.url)}`;

          return makeJob({
            id,
            slug: `${slugify(candidate.title)}-${hashId(id)}`,
            title: candidate.title,
            company,
            type: "government",
            region: "india",
            source: "Sarkari Result (government-job discovery)",
            sourceUrl: candidate.url,
            applyUrl: official || candidate.url,
            location,
            country: "India",
            employmentType: "Government Recruitment",
            workMode: "onsite",
            category: "Government",
            applicationStart: start,
            applicationEnd: end,
            verified: true,
            published: true,
            updatedAt: start,
            description:
              `Government recruitment discovered through Sarkari Result. ` +
              `Open the original application/notification link before applying ` +
              `and verify the final dates, eligibility, vacancies, age limit and fee.`,
          });
        } catch {
          return null;
        }
      })
    );

    for (const result of settled) {
      if (result.status === "fulfilled" && result.value) {
        jobs.push(result.value);
      }
    }
  }

  return jobs;
}

function detectRegion(location: string, country = ""): JobRegion {
  const hay = `${location} ${country}`.toLowerCase();
  if (!hay.trim()) return "outside";
  return INDIA_WORDS.some((word) => hay.includes(word)) || /\bin\b/.test(hay) ? "india" : "outside";
}

function detectField(title: string, category = "", description = ""): string {
  const hay = `${title} ${category} ${description}`.toLowerCase();
  const map: Array<[string, string[]]> = [
    ["Software & IT", ["software", "developer", "engineer", "frontend", "backend", "full stack", "cloud", "devops", "sre", "cyber", "security", "network", "it support", "data engineer"]],
    ["Data & AI", ["data scientist", "data analyst", "machine learning", "artificial intelligence", " ai ", "analytics", "business intelligence", "nlp", "computer vision"]],
    ["Finance & Accounting", ["finance", "account", "audit", "tax", "chartered", "banking", "investment", "treasury", "actuarial"]],
    ["Consulting & Strategy", ["consultant", "consulting", "strategy", "advisory", "business analyst", "management consulting"]],
    ["Sales & Marketing", ["sales", "marketing", "growth", "brand", "seo", "social media", "business development", "account executive"]],
    ["Operations & Supply Chain", ["operations", "supply chain", "procurement", "logistics", "warehouse", "production", "quality"]],
    ["HR & People", ["human resource", " hr ", "talent", "recruiter", "people operations"]],
    ["Healthcare", ["doctor", "nurse", "medical", "health", "pharma", "pharmacist", "clinical", "hospital"]],
    ["Education & Research", ["teacher", "professor", "faculty", "research", "scientist", "academic", "laboratory"]],
    ["Engineering", ["mechanical", "electrical", "civil", "electronics", "chemical", "automobile", "manufacturing engineer"]],
    ["Design & Creative", ["designer", "ux", "ui", "creative", "content", "writer", "video", "graphic"]],
    ["Legal & Compliance", ["legal", "lawyer", "counsel", "compliance", "company secretary"]],
    ["Government & Public Sector", ["officer", "assistant", "inspector", "constable", "clerk", "government", "ministry", "commission"]],
  ];
  for (const [field, words] of map) if (words.some((word) => hay.includes(word))) return field;
  return "Other";
}

function detectExperience(title: string, description = ""): string {
  const hay = `${title} ${description}`.toLowerCase();
  if (/intern|internship|trainee|graduate|fresher|entry level|0[-– ]?1 year/.test(hay)) return "Fresher / Entry Level";
  if (/senior|lead|principal|staff engineer|manager|director|head|vp|vice president/.test(hay)) return "Experienced";
  return "Open / Not specified";
}

function isFeatured(company: string): boolean {
  const c = company.toLowerCase();
  return FEATURED_COMPANIES.some((name) => c.includes(name));
}

function active(job: Job, now = new Date()): boolean {
  if (!job.title || !job.company || !job.applyUrl) return false;
  const current = now.getTime();
  const start = job.applicationStart ? new Date(job.applicationStart).getTime() : Number.NaN;
  if (job.applicationStart && (!Number.isFinite(start) || current < start)) return false;
  if (job.verified === false || job.published === false) return false;
  if (job.type === "government") {
    if (!job.applicationEnd) return false;
    const end = new Date(job.applicationEnd).getTime();
    return Number.isFinite(end) && Number.isFinite(start) && start <= end && current <= end;
  }
  if (!job.applicationEnd) return true;
  const end = new Date(job.applicationEnd).getTime();
  return Number.isFinite(end) && current <= end;
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SOURCE_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      ...init,
      headers: { Accept: "application/json", "User-Agent": "INFINIA-BHARAT-NEWS-Jobs/3.0", ...(init?.headers || {}) },
      signal: controller.signal,
      next: { revalidate: 900 },
    });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return (await response.json()) as T;
  } finally { clearTimeout(timer); }
}

async function fetchText(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SOURCE_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: { Accept: "text/html,application/xhtml+xml", "User-Agent": "INFINIA-BHARAT-NEWS-Jobs/3.0" },
      signal: controller.signal,
      next: { revalidate: 900 },
    });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return await response.text();
  } finally { clearTimeout(timer); }
}

function makeJob(input: Omit<Job, "field" | "experienceLevel" | "featuredCompany"> & Partial<Pick<Job, "field" | "experienceLevel" | "featuredCompany">>): Job {
  const description = input.description || "";
  return {
    ...input,
    field: input.field || detectField(input.title, input.category, description),
    experienceLevel: input.experienceLevel || detectExperience(input.title, description),
    featuredCompany: input.featuredCompany ?? isFeatured(input.company),
  };
}

async function collectEmploymentNews(): Promise<Job[]> {
  const html = await fetchText(EMPLOYMENT_NEWS_URL);
  const rows = Array.from(html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi));
  const jobs: Job[] = [];
  for (const row of rows) {
    const cells = Array.from(row[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)).map((m) => cleanHtml(m[1]));
    if (cells.length < 5) continue;
    const [issued, organisation, post, method, lastDate] = cells;
    const start = indiaDate(issued, false);
    const end = indiaDate(lastDate, true);
    if (!start || !end || !organisation || !post || /issued date/i.test(issued)) continue;
    const id = `employment-news-${hashId(`${issued}|${organisation}|${post}|${lastDate}`)}`;
    jobs.push(makeJob({
      id, slug: `${slugify(post)}-${hashId(id)}`, title: post, company: organisation,
      type: "government", region: "india", source: "Employment News (Govt. of India)",
      sourceUrl: EMPLOYMENT_NEWS_URL, applyUrl: EMPLOYMENT_NEWS_URL, location: "India", country: "India",
      employmentType: method || "Government Recruitment", workMode: "onsite", category: "Government",
      applicationStart: start, applicationEnd: end, verified: true, published: true, updatedAt: start,
      description: `${post} recruitment published by ${organisation} in Employment News. Verify eligibility, fee, age limit and application instructions on the official notification before applying.`,
    }));
  }
  return jobs;
}

async function collectJobOpportunitiesIndia(): Promise<Job[]> {
  const data = await fetchJson<any>(JOB_OPPORTUNITIES_API);
  const rows = Array.isArray(data?.data) ? data.data : Array.isArray(data?.jobs) ? data.jobs : [];
  return rows.map((row: any) => {
    const title = text(row.title);
    const company = text(row.company?.name || row.company_name || row.company);
    const location = text(row.location?.display_name || row.location || row.city || "India");
    const remote = Boolean(row.remote || row.is_remote || /remote/i.test(location));
    const id = `joapi-${text(row.id || hashId(`${company}|${title}|${row.apply_url}`))}`;
    const start = iso(row.posted_at || row.first_seen_at || row.created_at);
    return makeJob({
      id, slug: `${slugify(title)}-${hashId(id)}`, title, company,
      companyLogo: text(row.company?.logo || row.company_logo), type: remote ? "remote" : "private",
      region: "india", source: "Job Opportunities API", sourceUrl: "https://jobopportunitiesapi.org",
      applyUrl: text(row.apply_url || row.url), location, country: "India",
      employmentType: text(row.employment_type || row.type), workMode: remote ? "remote" : "onsite",
      category: text(row.category || row.department), salary: text(row.salary),
      description: cleanHtml(row.description || row.summary), applicationStart: start,
      verified: text(row.status || "live").toLowerCase() !== "closed", published: true,
      updatedAt: iso(row.last_verified_at || row.updated_at || row.posted_at) || start,
    });
  }).filter((job: Job) => job.title && job.company && job.applyUrl && job.applicationStart);
}

async function collectHimalayas(): Promise<Job[]> {
  const jobs: Job[] = [];
  let cursor = "";
  for (let page = 0; page < 40; page += 1) {
    const url = cursor ? `${HIMALAYAS_API}?limit=20&cursor=${encodeURIComponent(cursor)}` : `${HIMALAYAS_API}?limit=20`;
    const data = await fetchJson<any>(url);
    const rows = Array.isArray(data?.jobs) ? data.jobs : [];
    for (const row of rows) {
      const title = text(row.title);
      const company = text(row.companyName);
      const loc = Array.isArray(row.locationRestrictions) && row.locationRestrictions.length ? row.locationRestrictions.join(", ") : "Worldwide / Remote";
      const country = text(row.locationRestrictions?.[0]);
      const id = `himalayas-${text(row.guid || row.id || hashId(text(row.applicationLink)))}`;
      jobs.push(makeJob({
        id, slug: `${slugify(title)}-${hashId(id)}`, title, company, companyLogo: text(row.companyLogo),
        type: "remote", region: detectRegion(loc, country), source: "Himalayas", sourceUrl: "https://himalayas.app",
        applyUrl: text(row.applicationLink), location: loc, country, employmentType: text(row.employmentType),
        workMode: "remote", category: Array.isArray(row.parentCategories) ? row.parentCategories.join(", ") : text(row.parentCategories),
        salary: row.minSalary || row.maxSalary ? `${text(row.currency)} ${row.minSalary ?? ""}${row.maxSalary ? `–${row.maxSalary}` : ""}`.trim() : "",
        description: cleanHtml(row.description || row.excerpt), applicationStart: iso(row.pubDate), applicationEnd: iso(row.expiryDate) || undefined,
        verified: true, published: true, updatedAt: iso(row.pubDate),
      }));
    }
    cursor = text(data?.nextCursor);
    if (!cursor || rows.length === 0) break;
  }
  return jobs;
}

async function collectJobicy(): Promise<Job[]> {
  const data = await fetchJson<any>(JOBICY_API);
  const rows = Array.isArray(data?.jobs) ? data.jobs : [];
  return rows.map((row: any) => {
    const title = text(row.jobTitle); const company = text(row.companyName); const loc = text(row.jobGeo) || "Remote";
    const id = `jobicy-${text(row.id || row.jobSlug || hashId(text(row.url)))}`;
    return makeJob({
      id, slug: `${slugify(title)}-${hashId(id)}`, title, company, companyLogo: text(row.companyLogo), type: "remote",
      region: detectRegion(loc), source: "Jobicy", sourceUrl: "https://jobicy.com", applyUrl: text(row.url), location: loc,
      employmentType: Array.isArray(row.jobType) ? row.jobType.join(", ") : text(row.jobType), workMode: "remote",
      category: Array.isArray(row.jobIndustry) ? row.jobIndustry.join(", ") : text(row.jobIndustry),
      salary: row.salaryMin || row.salaryMax ? `${text(row.salaryCurrency)} ${row.salaryMin ?? ""}${row.salaryMax ? `–${row.salaryMax}` : ""}`.trim() : "",
      description: cleanHtml(row.jobDescription || row.jobExcerpt), applicationStart: iso(row.pubDate), verified: true, published: true, updatedAt: iso(row.pubDate),
    });
  }).filter((job: Job) => job.title && job.company && job.applyUrl && job.applicationStart);
}

async function collectRemotive(): Promise<Job[]> {
  const data = await fetchJson<any>(REMOTIVE_API);
  const rows = Array.isArray(data?.jobs) ? data.jobs : [];
  return rows.map((row: any) => {
    const title = text(row.title); const company = text(row.company_name); const loc = text(row.candidate_required_location) || "Remote";
    const id = `remotive-${text(row.id || hashId(text(row.url)))}`;
    return makeJob({
      id, slug: `${slugify(title)}-${hashId(id)}`, title, company, companyLogo: text(row.company_logo), type: "remote",
      region: detectRegion(loc), source: "Remotive", sourceUrl: "https://remotive.com", applyUrl: text(row.url), location: loc,
      employmentType: text(row.job_type), workMode: "remote", category: text(row.category), salary: text(row.salary),
      description: cleanHtml(row.description), applicationStart: iso(row.publication_date), verified: true, published: true, updatedAt: iso(row.publication_date),
    });
  }).filter((job: Job) => job.title && job.company && job.applyUrl && job.applicationStart);
}

async function collectArbeitnow(): Promise<Job[]> {
  const jobs: Job[] = [];
  for (let page = 1; page <= 8; page += 1) {
    const data = await fetchJson<any>(`${ARBEITNOW_API}?page=${page}`);
    const rows = Array.isArray(data?.data) ? data.data : [];
    for (const row of rows) {
      const title = text(row.title); const company = text(row.company_name); const loc = text(row.location) || (row.remote ? "Remote" : "Europe");
      const id = `arbeitnow-${text(row.slug || hashId(text(row.url)))}`;
      jobs.push(makeJob({
        id, slug: `${slugify(title)}-${hashId(id)}`, title, company, type: row.remote ? "remote" : "private",
        region: detectRegion(loc), source: "Arbeitnow", sourceUrl: "https://www.arbeitnow.com", applyUrl: text(row.url), location: loc,
        employmentType: Array.isArray(row.job_types) ? row.job_types.join(", ") : text(row.job_types), workMode: row.remote ? "remote" : "onsite",
        category: Array.isArray(row.tags) ? row.tags.join(", ") : text(row.tags), description: cleanHtml(row.description),
        applicationStart: iso(row.created_at ? Number(row.created_at) * 1000 : row.created_at), verified: true, published: true,
      }));
    }
    if (!rows.length) break;
  }
  return jobs;
}

async function collectSmartRecruitersCompany(companyId: string, fallbackName: string): Promise<Job[]> {
  const jobs: Job[] = [];
  let offset = 0;
  for (let page = 0; page < 12; page += 1) {
    const url = `https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(companyId)}/postings?limit=100&offset=${offset}`;
    const data = await fetchJson<any>(url);
    const rows = Array.isArray(data?.content) ? data.content : [];
    for (const row of rows) {
      const title = text(row.name || row.title);
      const company = text(row.company?.name || fallbackName);
      const location = text(row.location?.city || row.location?.region || row.location?.country) || "Not specified";
      const country = text(row.location?.country);
      const id = `smart-${companyId}-${text(row.id || row.uuid || hashId(title + location))}`;
      jobs.push(makeJob({
        id, slug: `${slugify(title)}-${hashId(id)}`, title, company, type: /remote/i.test(location) ? "remote" : "private",
        region: detectRegion(location, country), source: `${company} Careers`, sourceUrl: `https://careers.smartrecruiters.com/${companyId}`,
        applyUrl: text(row.ref || row.jobAd?.sections?.companyDescription) || `https://careers.smartrecruiters.com/${companyId}`,
        location, country, employmentType: text(row.typeOfEmployment?.label || row.typeOfEmployment),
        workMode: /remote/i.test(location) ? "remote" : "onsite", category: text(row.department?.label || row.function?.label),
        description: cleanHtml(row.jobAd?.sections?.jobDescription?.text || row.jobAd?.sections?.qualifications?.text),
        applicationStart: iso(row.releasedDate || row.createdOn || new Date().toISOString()), verified: true, published: true,
      }));
    }
    offset += rows.length;
    if (!rows.length || offset >= Number(data?.totalFound || 0)) break;
  }
  return jobs;
}

async function collectSmartRecruiters(): Promise<Job[]> {
  const settled = await Promise.allSettled(SMARTRECRUITERS_COMPANIES.map((c) => collectSmartRecruitersCompany(c.id, c.name)));
  return settled.flatMap((result) => result.status === "fulfilled" ? result.value : []);
}

function dedupeJobs(jobs: Job[]): { jobs: Job[]; removed: number } {
  const map = new Map<string, Job>();
  let removed = 0;
  for (const job of jobs) {
    const key = `${job.company}|${job.title}|${job.location || ""}`.toLowerCase().replace(/[^a-z0-9|]+/g, " ").trim();
    const existing = map.get(key);
    if (!existing) { map.set(key, job); continue; }
    removed += 1;
    const existingScore =
  Number(existing.region === "india") * 4 +
  Number(Boolean(existing.featuredCompany)) * 3 +
  Number(Boolean(existing.applicationEnd)) * 2 +
  Number(existing.source.includes("Careers"));

const nextScore =
  Number(job.region === "india") * 4 +
  Number(Boolean(job.featuredCompany)) * 3 +
  Number(Boolean(job.applicationEnd)) * 2 +
  Number(job.source.includes("Careers"));
    if (nextScore > existingScore) map.set(key, job);
  }
  return { jobs: Array.from(map.values()), removed };
}

function sortJobs(jobs: Job[]): Job[] {
  return [...jobs].sort((a, b) => {
    const india = Number(b.region === "india") - Number(a.region === "india");
    if (india) return india;
    const featured = Number(Boolean(b.featuredCompany)) - Number(Boolean(a.featuredCompany));
    if (featured) return featured;
    const gov = Number(b.type === "government") - Number(a.type === "government");
    if (gov) return gov;
    const ad = a.applicationEnd ? new Date(a.applicationEnd).getTime() : Number.MAX_SAFE_INTEGER;
    const bd = b.applicationEnd ? new Date(b.applicationEnd).getTime() : Number.MAX_SAFE_INTEGER;
    if (ad !== bd) return ad - bd;
    return (b.applicationStart ? new Date(b.applicationStart).getTime() : 0) - (a.applicationStart ? new Date(a.applicationStart).getTime() : 0);
  });
}

export async function collectAllLiveJobs(): Promise<JobsCollectionResult> {
  const collectors: Array<[string, () => Promise<Job[]>]> = [
    // ========================================================
    // MAJOR COMPANY DIRECT SOURCES
    // ========================================================

    ["Google Careers", collectGoogleIndia],
    ["Microsoft Careers", collectMicrosoftIndia],
    ["Amazon Jobs", collectAmazonIndia],

    ["Tata Group Careers", collectTataCareers],

    ["Reliance Careers", collectReliance],
    ["Jio Careers", collectJio],

    ["Adani Careers", collectAdani],

    ["Infosys Careers", collectInfosysIndia],

    ["Deloitte India Careers", collectDeloitteIndia],

    // ========================================================
    // GOVERNMENT
    // ========================================================

    ["Employment News", collectEmploymentNews],
    ["Sarkari Result government discovery", collectSarkariResult],

    // ========================================================
    // INDIA / ATS
    // ========================================================

    ["India employer/ATS feed", collectJobOpportunitiesIndia],
    ["SmartRecruiters companies", collectSmartRecruiters],

    // ========================================================
    // REMOTE / INTERNATIONAL
    // ========================================================

    ["Himalayas", collectHimalayas],
    ["Jobicy", collectJobicy],
    ["Remotive", collectRemotive],
    ["Arbeitnow", collectArbeitnow],
  ];

  const settled = await Promise.allSettled(
    collectors.map(([, fn]) => fn())
  );

  const all: Job[] = [];
  const sourceErrors: string[] = [];
  const sourceCounts: Record<string, number> = {};

  settled.forEach((result, index) => {
    const name = collectors[index][0];

    if (result.status === "fulfilled") {
      sourceCounts[name] = result.value.length;
      all.push(...result.value);
    } else {
      sourceCounts[name] = 0;

      sourceErrors.push(
        `${name}: ${
          result.reason instanceof Error
            ? result.reason.message
            : String(result.reason)
        }`
      );
    }
  });

  const now = new Date();

  let expired = 0;
  let missingDates = 0;

  const current = all.filter((job) => {
    if (
      !job.applicationStart ||
      (job.type === "government" && !job.applicationEnd)
    ) {
      missingDates += 1;
    }

    const ok = active(job, now);

    if (!ok) {
      expired += 1;
    }

    return ok;
  });

  const deduped = dedupeJobs(current);
  const jobs = sortJobs(deduped.jobs);

  return {
    jobs,
    collectedAt: now.toISOString(),

    stats: {
      fetched: all.length,
      active: jobs.length,

      india: jobs.filter(
        (job) => job.region === "india"
      ).length,

      outside: jobs.filter(
        (job) => job.region === "outside"
      ).length,

      government: jobs.filter(
        (job) => job.type === "government"
      ).length,

      private: jobs.filter(
        (job) => job.type === "private"
      ).length,

      remote: jobs.filter(
        (job) => job.type === "remote"
      ).length,

      expired,
      missingDates,

      duplicatesRemoved: deduped.removed,

      sourceErrors,
      sourceCounts,
    },
  };
}

export async function getLiveJobBySlug(slug: string): Promise<Job | null> {
  const { jobs } = await collectAllLiveJobs();
  return jobs.find((job) => job.slug === slug) ?? null;
}
