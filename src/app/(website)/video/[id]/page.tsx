import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { siteConfig } from "@/config/site";

import {
  getVideoById,
  getRelatedVideos,
} from "@/services/public/video.public.service";

import VideoPlayer from "@/components/video/video-player";
import VideoInfo from "@/components/video/video-info";
import RelatedVideos from "@/components/video/related-videos";

// ==========================================================
// YOUTUBE VIDEO ID
// ==========================================================

function getYouTubeVideoId(youtubeUrl: string) {
  try {
    const parsed = new URL(youtubeUrl);

    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname
        .replace("/", "")
        .split("?")[0];
    }

    if (parsed.hostname.includes("youtube.com")) {
      return parsed.searchParams.get("v");
    }

    return null;
  } catch {
    return null;
  }
}

// ==========================================================
// METADATA
// ==========================================================

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}): Promise<Metadata> {
  const { id } = await params;

  const video = await getVideoById(id);

  if (!video) {
    return {
      title: "Video Not Found",
      description: "यह वीडियो उपलब्ध नहीं है।",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title =
    video.title ||
    "Latest News Video";

  const description =
    video.description?.trim() ||
    `INFINIA BHARAT NEWS पर देखें: ${title}`;

  const url =
    `${siteConfig.url}/video/${video.id}`;

  const youtubeId =
    getYouTubeVideoId(video.youtubeUrl);

  // YouTube thumbnail क्योंकि database में thumbnail नहीं है
  const thumbnail =
    youtubeId
      ? `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`
      : `${siteConfig.url}${siteConfig.logo}`;

  return {
    title,

    description,

    keywords: [
      title,
      "Hindi News Video",
      "Latest News Video",
      "Breaking News Video",
      "हिंदी न्यूज़ वीडियो",
      "ब्रेकिंग न्यूज़ वीडियो",
      "INFINIA BHARAT NEWS",
    ],

    alternates: {
      canonical: url,
    },

    robots: {
      index: true,
      follow: true,

      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-video-preview": -1,
        "max-snippet": -1,
      },
    },

    openGraph: {
      type: "video.other",

      title,

      description,

      url,

      siteName:
        siteConfig.name,

      locale:
        siteConfig.locale,

      images: [
        {
          url: thumbnail,

          width: 1280,

          height: 720,

          alt: title,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",

      title,

      description,

      images: [thumbnail],
    },
  };
}

// ==========================================================
// VIDEO PAGE
// ==========================================================

export default async function VideoPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  // ========================================================
  // VIDEO
  // ========================================================

  const video =
    await getVideoById(id);

  if (!video) {
    notFound();
  }

  // ========================================================
  // RELATED VIDEOS
  // ========================================================

  const related =
    await getRelatedVideos(
      video.categoryId,
      video.id
    );

  // ========================================================
  // URL
  // ========================================================

  const url =
    `${siteConfig.url}/video/${video.id}`;

  // ========================================================
  // YOUTUBE ID
  // ========================================================

  const youtubeId =
    getYouTubeVideoId(
      video.youtubeUrl
    );

  // ========================================================
  // YOUTUBE THUMBNAIL
  // ========================================================

  const thumbnail =
    youtubeId
      ? `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`
      : `${siteConfig.url}${siteConfig.logo}`;

  // ========================================================
  // YOUTUBE EMBED
  // ========================================================

  const embedUrl =
    youtubeId
      ? `https://www.youtube.com/embed/${youtubeId}`
      : undefined;

  // ========================================================
  // BREADCRUMB SCHEMA
  // ========================================================

  const breadcrumbSchema = {
    "@context": "https://schema.org",

    "@type": "BreadcrumbList",

    itemListElement: [
      {
        "@type": "ListItem",

        position: 1,

        name: "होम",

        item: siteConfig.url,
      },

      {
        "@type": "ListItem",

        position: 2,

        name: "वीडियो",

        item:
          `${siteConfig.url}/video`,
      },

      {
        "@type": "ListItem",

        position: 3,

        name: video.title,

        item: url,
      },
    ],
  };

  // ========================================================
  // VIDEO SCHEMA
  // ========================================================

  const videoSchema = {
    "@context": "https://schema.org",

    "@type": "VideoObject",

    "@id":
      `${url}#video`,

    name:
      video.title,

    description:
      video.description?.trim() ||
      `INFINIA BHARAT NEWS पर देखें: ${video.title}`,

    url,

    mainEntityOfPage: {
      "@type": "WebPage",

      "@id": url,
    },

    thumbnailUrl: [
      thumbnail,
    ],

    uploadDate:
      video.createdAt,

    ...(embedUrl
      ? {
          embedUrl,
        }
      : {}),

    publisher: {
      "@type":
        "NewsMediaOrganization",

      "@id":
        `${siteConfig.url}/#organization`,

      name:
        siteConfig.name,

      url:
        siteConfig.url,

      logo: {
        "@type":
          "ImageObject",

        url:
          `${siteConfig.url}/logos/logo-light.png`,

        width: 1200,

        height: 630,
      },
    },

    inLanguage:
      siteConfig.language,

    isFamilyFriendly:
      true,
  };

  // ========================================================
  // PAGE
  // ========================================================

  return (
    <main
      className="
        w-full
        min-w-0
      "
    >
      {/* ==================================================
          VIDEO STRUCTURED DATA
      ================================================== */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              videoSchema
            ),
        }}
      />

      {/* ==================================================
          BREADCRUMB STRUCTURED DATA
      ================================================== */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              breadcrumbSchema
            ),
        }}
      />

      <div
        className="
          max-w-7xl
          mx-auto
          px-3
          sm:px-4
          py-5
          sm:py-8
        "
      >
        {/* ==================================================
            VISIBLE BREADCRUMB
        ================================================== */}

        <nav
          aria-label="Breadcrumb"
          className="
            mb-5
            text-sm
            text-zinc-500
          "
        >
          <ol
            className="
              flex
              flex-wrap
              items-center
              gap-2
            "
          >
            <li>
              <a
                href="/"
                className="
                  hover:text-red-600
                  transition-colors
                "
              >
                होम
              </a>
            </li>

            <li
              aria-hidden="true"
            >
              /
            </li>

            <li>
              <a
                href="/video"
                className="
                  hover:text-red-600
                  transition-colors
                "
              >
                वीडियो
              </a>
            </li>

            <li
              aria-hidden="true"
            >
              /
            </li>

            <li
              aria-current="page"
              className="
                font-semibold
                text-zinc-800
                truncate
                max-w-[250px]
                sm:max-w-none
              "
            >
              {video.title}
            </li>
          </ol>
        </nav>

        {/* ==================================================
            VIDEO + RELATED
        ================================================== */}

        <div
          className="
            grid
            w-full
            min-w-0
            grid-cols-1
            lg:grid-cols-12
            gap-6
            lg:gap-8
          "
        >
          {/* =================================================
              MAIN VIDEO
          ================================================= */}

          <main
            className="
              min-w-0
              w-full
              lg:col-span-8
            "
          >
            {/* VIDEO */}

            <div
              className="
                w-full
                min-w-0
                overflow-hidden
                rounded-xl
                bg-black
              "
            >
              <VideoPlayer
                youtubeUrl={
                  video.youtubeUrl
                }
              />
            </div>

            {/* VIDEO INFO */}

            <div
              className="
                w-full
                min-w-0
                mt-4
              "
            >
              <VideoInfo
                video={video}
              />
            </div>

            {/* =================================================
                MOBILE RELATED VIDEOS
            ================================================= */}

            <section
              className="
                mt-8
                lg:hidden
              "
            >
              <RelatedVideos
                videos={related}
              />
            </section>
          </main>

          {/* =================================================
              DESKTOP RELATED VIDEOS
          ================================================= */}

          <aside
            className="
              hidden
              lg:block
              min-w-0
              w-full
              lg:col-span-4
            "
          >
            <div
              className="
                sticky
                top-24
                w-full
                min-w-0
              "
            >
              <RelatedVideos
                videos={related}
              />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}