import fs from "fs/promises";
import path from "path";

// ======================================================
// TYPES
// ======================================================

export interface LiveTvChannel {
  id: string;
  title: string;
  youtubeUrl: string;
  enabled: boolean;
  order: number;
  logo?: string;
}

// ======================================================
// YOUTUBE DATE
// ======================================================

/**
 * Extract the publicly available publish/upload date
 * directly from the YouTube page.
 *
 * NO YouTube Data API
 * NO API KEY
 *
 * If YouTube does not expose a usable date, the current
 * date/time is returned as the final fallback.
 */
export async function getYoutubeDate(
  youtubeUrl: string
): Promise<string> {
  // ----------------------------------------------------
  // FINAL FALLBACK
  // ----------------------------------------------------

  const fallback = new Date().toISOString();

  try {
    if (!youtubeUrl) {
      return fallback;
    }

    const response = await fetch(youtubeUrl, {
      cache: "no-store",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language":
          "en-US,en;q=0.9",
      },
    });

    if (!response.ok) {
      console.warn(
        "YouTube page request failed:",
        response.status
      );

      return fallback;
    }

    const html = await response.text();

    if (!html) {
      return fallback;
    }

    // --------------------------------------------------
    // 1. YouTube page metadata
    // --------------------------------------------------

    const patterns = [
      /"uploadDate"\s*:\s*"([^"]+)"/i,
      /"datePublished"\s*:\s*"([^"]+)"/i,
      /"publishDate"\s*:\s*"([^"]+)"/i,
      /<meta[^>]+itemprop=["']uploadDate["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+property=["']article:published_time["'][^>]+content=["']([^"']+)["']/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);

      if (!match?.[1]) {
        continue;
      }

      const rawDate = match[1].trim();

      const parsedDate = new Date(rawDate);

      if (!Number.isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString();
      }
    }

    // --------------------------------------------------
    // 2. YouTube initial player response
    // --------------------------------------------------
    //
    // Some YouTube pages expose:
    //
    // "microformat": {
    //   "microformatDataRenderer": {
    //      ...
    //   }
    // }
    //
    // We search additional date-like fields without
    // depending on YouTube's undocumented structure.
    // --------------------------------------------------

    const additionalPatterns = [
      /"publishDate"\s*:\s*"(\d{4}-\d{2}-\d{2})"/i,
      /"uploadDate"\s*:\s*"(\d{4}-\d{2}-\d{2})"/i,
      /"datePublished"\s*:\s*"(\d{4}-\d{2}-\d{2})"/i,
    ];

    for (const pattern of additionalPatterns) {
      const match = html.match(pattern);

      if (!match?.[1]) {
        continue;
      }

      const parsedDate = new Date(
        `${match[1]}T00:00:00.000Z`
      );

      if (!Number.isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString();
      }
    }

    // --------------------------------------------------
    // NOTHING FOUND
    // --------------------------------------------------

    console.warn(
      "YouTube date not found. Using current date/time:",
      youtubeUrl
    );

    return fallback;
  } catch (error) {
    console.error(
      "YouTube date extraction failed:",
      error
    );

    // --------------------------------------------------
    // FINAL FALLBACK
    // --------------------------------------------------

    return fallback;
  }
}

// ======================================================
// SERVER LIVE TV
// ======================================================

export async function getServerLiveTv(): Promise<
  LiveTvChannel[]
> {
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "data",
      "live-tv.json"
    );

    const file = await fs.readFile(
      filePath,
      "utf-8"
    );

    const data: unknown = JSON.parse(file);

    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .filter(
        (channel): channel is LiveTvChannel =>
          !!channel &&
          typeof channel === "object" &&
          typeof (channel as LiveTvChannel).id ===
            "string" &&
          typeof (channel as LiveTvChannel).title ===
            "string" &&
          typeof (channel as LiveTvChannel).youtubeUrl ===
            "string" &&
          (channel as LiveTvChannel).enabled === true
      )
      .sort(
        (a, b) =>
          Number(a.order ?? 0) -
          Number(b.order ?? 0)
      );
  } catch (error) {
    console.error(
      "Server Live TV Error:",
      error
    );

    return [];
  }
}