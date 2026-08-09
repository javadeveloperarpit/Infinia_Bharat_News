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
// FETCH REAL YOUTUBE TITLE
// ==========================================

async function getYoutubeTitle(
  id: string
): Promise<string> {
  try {
    const videoUrl =
      createShortUrl(id);

    const response =
      await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(
          videoUrl
        )}&format=json`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0",
          },

          cache: "no-store",
        }
      );

    if (!response.ok) {
      return "";
    }

    const data =
      await response.json();

    if (
      typeof data.title ===
      "string"
    ) {
      return data.title.trim();
    }

    return "";
  } catch (error) {
    console.error(
      `YOUTUBE TITLE ERROR ${id}:`,
      error
    );

    return "";
  }
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

    if (ids.length === 0) {
      return NextResponse.json({
        success: true,
        channel:
          "Infinia Bharat News",
        count: 0,
        shorts: [],
      });
    }

    // ======================================
    // FETCH TITLES
    // ======================================

    const shorts =
      await Promise.all(
        ids.map(
          async (id) => {
            const title =
              await getYoutubeTitle(
                id
              );

            return {
              id,

              title:
                title ||
                "Infinia Bharat News",

              url:
                createShortUrl(id),

              thumbnail:
                createThumbnail(id),
            };
          }
        )
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