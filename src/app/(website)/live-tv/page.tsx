import LiveTvPlayer from "./LiveTvPlayer";

import {
  getServerLiveTv,
  getYoutubeDate,
} from "@/services/public/live-tv.server.service";

// ======================================================
// YOUTUBE ID
// ======================================================

function getYoutubeId(url: string) {
  if (!url) return "";

  try {
    const parsed = new URL(url);

    const hostname = parsed.hostname
      .replace("www.", "")
      .toLowerCase();

    // youtube.com
    if (
      hostname === "youtube.com" ||
      hostname === "m.youtube.com"
    ) {
      // /watch?v=VIDEO_ID
      const videoId =
        parsed.searchParams.get("v");

      if (videoId) {
        return videoId;
      }

      // /live/VIDEO_ID
      const liveMatch =
        parsed.pathname.match(
          /\/live\/([^/?]+)/
        );

      if (liveMatch?.[1]) {
        return liveMatch[1];
      }

      // /embed/VIDEO_ID
      const embedMatch =
        parsed.pathname.match(
          /\/embed\/([^/?]+)/
        );

      if (embedMatch?.[1]) {
        return embedMatch[1];
      }
    }

    // youtu.be/VIDEO_ID
    if (hostname === "youtu.be") {
      return (
        parsed.pathname
          .split("/")
          .filter(Boolean)[0] || ""
      );
    }
  } catch {
    return "";
  }

  return "";
}

// ======================================================
// PAGE
// ======================================================

export default async function LiveTvPage() {
  // ====================================================
  // SERVER LOAD
  // ====================================================

  const channels = await getServerLiveTv();

  const initialChannel =
    channels[0] ?? null;

  const initialYoutubeId =
    initialChannel
      ? getYoutubeId(
          initialChannel.youtubeUrl
        )
      : "";

  // ====================================================
  // YOUTUBE DATE
  // ====================================================

  let youtubeDate: string | null = null;

  if (
    initialChannel &&
    initialYoutubeId
  ) {
    youtubeDate = await getYoutubeDate(
      initialChannel.youtubeUrl
    );
  }

  // ====================================================
  // VIDEO STRUCTURED DATA
  // ====================================================

  const videoStructuredData =
    initialChannel &&
    initialYoutubeId
      ? {
          "@context":
            "https://schema.org",

          "@type": "VideoObject",

          name: `${initialChannel.title} - Infinia Bharat News Live`,

          description:
            `Live TV news broadcast from ${initialChannel.title} on Infinia Bharat News.`,

          thumbnailUrl:
            `https://i.ytimg.com/vi/${initialYoutubeId}/hqdefault.jpg`,

          embedUrl:
            `https://www.youtube.com/embed/${initialYoutubeId}`,

          isLiveBroadcast: true,

          ...(youtubeDate
            ? {
                uploadDate: youtubeDate,
              }
            : {}),

          publication: {
            "@type": "BroadcastEvent",

            isLiveBroadcast: true,

            ...(youtubeDate
              ? {
                  startDate: youtubeDate,
                }
              : {}),
          },

          publisher: {
            "@type": "Organization",

            name: "Infinia Bharat News",

            logo: {
              "@type": "ImageObject",

              url:
                "https://infiniabharatnews.vercel.app/icons/favicon-512x512.webp",
            },
          },
        }
      : null;

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <>
      {/* ==================================================
          VIDEO STRUCTURED DATA
      ================================================== */}

      {videoStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html:
              JSON.stringify(
                videoStructuredData
              ),
          }}
        />
      )}

      {/* ==================================================
          CLIENT PLAYER
      ================================================== */}

      <LiveTvPlayer
        channels={channels}
        initialActiveId={
          initialChannel?.id ?? ""
        }
      />
    </>
  );
}