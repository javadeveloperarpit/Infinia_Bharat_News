import fs from "fs/promises";
import path from "path";

// ============================================================
// PUBLIC BREAKING NEWS SERVICE
// ============================================================
//
// Public website Firebase se breaking news READ nahi karti.
//
// Source:
// GitHub -> public/data/breakingNews.json
//
// Firebase:
// ONLY admin/master database
//
// Flow:
//
// Firebase
//    ↓
// GitHub Sync
//    ↓
// breakingNews.json
//    ↓
// Public Website
//
// ============================================================

// ============================================================
// TYPES
// ============================================================

export interface PublicBreakingNews {
  id: string;

  text: string;

  active: boolean;

  expiry: string;

  createdAt?: string;

  updatedAt?: string;
}

// ============================================================
// PATH
// ============================================================

const BREAKING_NEWS_PATH =
  path.join(
    process.cwd(),
    "public",
    "data",
    "breakingNews.json"
  );

// ============================================================
// FORMAT TIMESTAMP
// ============================================================

function formatTimestamp(
  value: unknown
): string | undefined {

  if (!value) {
    return undefined;
  }

  // --------------------------------------------
  // Firestore Timestamp-like object
  // --------------------------------------------

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
    try {
      return (
        value as {
          toDate: () => Date;
        }
      )
        .toDate()
        .toISOString();

    } catch {
      return undefined;
    }
  }

  // --------------------------------------------
  // Serialized Firestore Timestamp
  // --------------------------------------------

  if (
    typeof value === "object" &&
    value !== null &&
    "seconds" in value &&
    typeof (
      value as {
        seconds?: unknown;
      }
    ).seconds === "number"
  ) {
    const seconds =
      (
        value as {
          seconds: number;
        }
      ).seconds;

    const date =
      new Date(
        seconds * 1000
      );

    if (
      !isNaN(
        date.getTime()
      )
    ) {
      return date.toISOString();
    }

    return undefined;
  }

  // --------------------------------------------
  // Normal date/string
  // --------------------------------------------

  const date =
    new Date(
      value as string
    );

  if (
    isNaN(
      date.getTime()
    )
  ) {
    return undefined;
  }

  return date.toISOString();
}

// ============================================================
// LOAD BREAKING NEWS
// ============================================================
//
// IMPORTANT:
//
// Empty JSON
// Invalid JSON
// Missing file
// Incomplete JSON
//
// = NO BREAKING NEWS
//
// No error should reach the public website.
//
// ============================================================

async function loadBreakingNews(): Promise<any[]> {

  try {

    const file =
      await fs.readFile(
        BREAKING_NEWS_PATH,
        "utf-8"
      );

    // --------------------------------------------
    // EMPTY FILE
    // --------------------------------------------

    if (!file.trim()) {
      return [];
    }

    // --------------------------------------------
    // SAFE JSON PARSE
    // --------------------------------------------

    let data: unknown;

    try {

      data =
        JSON.parse(file);

    } catch {

      // Invalid / incomplete JSON
      // Treat as no breaking news.

      return [];
    }

    // --------------------------------------------
    // EXPECTED FORMAT
    //
    // [
    //   {...},
    //   {...}
    // ]
    // --------------------------------------------

    if (
      Array.isArray(data)
    ) {
      return data;
    }

    // --------------------------------------------
    // INVALID STRUCTURE
    // --------------------------------------------

    return [];

  } catch {

    // --------------------------------------------
    // FILE DOES NOT EXIST
    // OR READ ERROR
    //
    // Treat as no breaking news.
    // --------------------------------------------

    return [];
  }
}

// ============================================================
// FORMAT BREAKING NEWS
// ============================================================

function formatBreakingNews(
  data: any
): PublicBreakingNews {

  return {

    id:
      String(
        data?.id || ""
      ),

    text:
      data?.text || "",

    active:
      Boolean(
        data?.active
      ),

    expiry:
      data?.expiry || "24h",

    createdAt:
      formatTimestamp(
        data?.createdAt
      ),

    updatedAt:
      formatTimestamp(
        data?.updatedAt
      ),

  };
}

// ============================================================
// SORT
// ============================================================
//
// Newest breaking news first.
//

function sortBreakingNews(
  news: PublicBreakingNews[]
): PublicBreakingNews[] {

  return [
    ...news,
  ].sort(
    (a, b) => {

      const dateA =
        new Date(
          a.createdAt || 0
        ).getTime();

      const dateB =
        new Date(
          b.createdAt || 0
        ).getTime();

      return (
        dateB -
        dateA
      );
    }
  );
}

// ============================================================
// GET ALL BREAKING NEWS
// ============================================================

export async function getBreakingNews(): Promise<
  PublicBreakingNews[]
> {

  const rawNews =
    await loadBreakingNews();

  const news =
    rawNews.map(
      (item) =>
        formatBreakingNews(
          item
        )
    );

  return sortBreakingNews(
    news
  );
}

// ============================================================
// GET ACTIVE BREAKING NEWS
// ============================================================
//
// Used by public BreakingStrip.
//
// Only active news will be returned.
//

export async function getActiveBreakingNews(): Promise<
  PublicBreakingNews[]
> {

  const rawNews =
    await loadBreakingNews();

  const news =
    rawNews
      .filter(
        (item) =>
          item?.active === true
      )
      .map(
        (item) =>
          formatBreakingNews(
            item
          )
      );

  return sortBreakingNews(
    news
  );
}

// ============================================================
// GET LATEST ACTIVE BREAKING NEWS
// ============================================================
//
// Useful when BreakingStrip only needs one headline.
//

export async function getLatestActiveBreakingNews(): Promise<
  PublicBreakingNews | null
> {

  const news =
    await getActiveBreakingNews();

  return (
    news[0] ||
    null
  );
}