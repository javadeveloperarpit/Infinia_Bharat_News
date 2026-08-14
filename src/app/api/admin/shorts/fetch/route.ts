import { NextResponse } from "next/server";

const YOUTUBE_SHORTS_URL =
  "https://www.youtube.com/@Infinia_Bharat_News/shorts";

// ==========================================
// EXTRACT SHORT IDs
// ==========================================

function extractShortIds(html: string): string[] {
  const ids = new Set<string>();

  const regex =
    /\/shorts\/([a-zA-Z0-9_-]{11})/g;

  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    ids.add(match[1]);
  }

  return Array.from(ids);
}

// ==========================================
// SHORT URL
// ==========================================

function createShortUrl(id: string): string {
  return `https://www.youtube.com/shorts/${id}`;
}

// ==========================================
// THUMBNAIL
// ==========================================

function createThumbnail(id: string): string {
  return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
}

// ==========================================
// FETCH YOUTUBE TITLE + DATE/TIME
// ==========================================

async function getYoutubeData(
  id: string
): Promise<{
  title: string;
  publishedAt?: string;
}> {
  let title = "";
  let publishedAt: string | undefined;

  try {
    const videoUrl =
      createShortUrl(id);

    // ======================================
    // FETCH YOUTUBE VIDEO PAGE
    // ======================================

    const response =
      await fetch(
        videoUrl,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36",

            Accept:
              "text/html,application/xhtml+xml",

            "Accept-Language":
              "en-US,en;q=0.9",
          },

          cache: "no-store",
        }
      );

    if (response.ok) {
      const html =
        await response.text();

      // ====================================
      // TITLE - og:title
      // ====================================

      const ogTitleMatch =
        html.match(
          /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i
        );

      if (ogTitleMatch?.[1]) {
        title =
          ogTitleMatch[1].trim();
      }

      // ====================================
      // TITLE - <title>
      // ====================================

      if (!title) {
        const titleMatch =
          html.match(
            /<title[^>]*>([\s\S]*?)<\/title>/i
          );

        if (titleMatch?.[1]) {
          title =
            titleMatch[1]
              .replace(
                /\s*-\s*YouTube\s*$/i,
                ""
              )
              .trim();
        }
      }

      // ====================================
      // PUBLISHED DATE + TIME
      // ====================================

      const uploadDateMatch =
        html.match(
          /"uploadDate":"([^"]+)"/
        );

      if (
        uploadDateMatch?.[1]
      ) {
        const parsedDate =
          new Date(
            uploadDateMatch[1]
          );

        if (
          !isNaN(
            parsedDate.getTime()
          )
        ) {
          publishedAt =
            parsedDate.toISOString();
        }
      }

      // ====================================
      // FALLBACK DATE
      // ====================================

      if (!publishedAt) {
        const publishDateMatch =
          html.match(
            /"publishDate":"([^"]+)"/
          );

        if (
          publishDateMatch?.[1]
        ) {
          const parsedDate =
            new Date(
              publishDateMatch[1]
            );

          if (
            !isNaN(
              parsedDate.getTime()
            )
          ) {
            publishedAt =
              parsedDate.toISOString();
          }
        }
      }
    }

  } catch (error) {
    console.error(
      `YOUTUBE PAGE ERROR ${id}:`,
      error
    );
  }

  // ======================================
  // FALLBACK: YOUTUBE OEMBED TITLE
  // ======================================

  if (!title) {
    try {
      const oembedResponse =
        await fetch(
          `https://www.youtube.com/oembed?url=${encodeURIComponent(
            createShortUrl(id)
          )}&format=json`,
          {
            headers: {
              "User-Agent":
                "Mozilla/5.0",
            },

            cache: "no-store",
          }
        );

      if (
        oembedResponse.ok
      ) {
        const oembedData =
          await oembedResponse.json();

        if (
          typeof oembedData.title ===
          "string"
        ) {
          title =
            oembedData.title.trim();
        }
      }
    } catch (error) {
      console.error(
        `YOUTUBE OEMBED ERROR ${id}:`,
        error
      );
    }
  }

  return {
    title,
    publishedAt,
  };
}

// ==========================================
// GET
// ==========================================

export async function GET() {
  try {

    // ======================================
    // FETCH YOUTUBE SHORTS PAGE
    // ======================================

    const response =
      await fetch(
        YOUTUBE_SHORTS_URL,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36",

            Accept:
              "text/html,application/xhtml+xml",

            "Accept-Language":
              "en-US,en;q=0.9",
          },

          cache: "no-store",
        }
      );

    if (!response.ok) {
      throw new Error(
        `YouTube returned ${response.status}`
      );
    }

    const html =
      await response.text();

    // ======================================
    // EXTRACT IDS
    // ======================================

    const ids =
      extractShortIds(html);

    if (
      ids.length === 0
    ) {
      return NextResponse.json({
        success: true,

        channel:
          "Infinia Bharat News",

        count: 0,

        shorts: [],
      });
    }

    // ======================================
    // FETCH TITLE + DATE/TIME
    // ======================================

    const shorts =
      await Promise.all(
        ids.map(
          async (id) => {

            const youtubeData =
              await getYoutubeData(
                id
              );

            return {
              id,

              title:
  youtubeData.title ||
  "",
              url:
                createShortUrl(id),

              thumbnail:
                createThumbnail(id),

              publishedAt:
                youtubeData.publishedAt,
            };
          }
        )
      );

    // ======================================
    // SORT
    // LATEST → OLDEST
    // ======================================

    shorts.sort(
      (a, b) => {

        const dateA =
          a.publishedAt
            ? new Date(
                a.publishedAt
              ).getTime()
            : 0;

        const dateB =
          b.publishedAt
            ? new Date(
                b.publishedAt
              ).getTime()
            : 0;

        return dateB - dateA;
      }
    );

    // ======================================
    // RESPONSE
    // ======================================

    return NextResponse.json({
      success: true,

      channel:
        "Infinia Bharat News",

      count:
        shorts.length,

      shorts,
    });

  } catch (error) {

    console.error(
      "FETCH YOUTUBE SHORTS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "YouTube Shorts fetch nahi ho paaye.",

        shorts: [],
      },
      {
        status: 500,
      }
    );
  }
}