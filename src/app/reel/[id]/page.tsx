import type { Metadata } from "next";

import ReelsFeed from "@/components/reels/reels-feed";

import {
  getPublishedShorts,
} from "@/services/public/shorts.public.service";

interface ReelPageProps {
  params: Promise<{
    id: string;
  }>;
}


// ======================================================
// SITE URL
// ======================================================

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://infiniabharatnews.vercel.app";


// ======================================================
// GET REEL
// ======================================================

async function getReelById(id: string) {
  const shorts =
    await getPublishedShorts();

  const cleanId =
    decodeURIComponent(id).trim();

  return shorts.find(
    (item) =>
      item.id.trim() === cleanId
  );
}


// ======================================================
// METADATA
// ======================================================

export async function generateMetadata({
  params,
}: ReelPageProps): Promise<Metadata> {

  const { id } = await params;

  const reel =
    await getReelById(id);


  // ====================================================
  // REEL NOT FOUND
  // ====================================================

  if (!reel) {
    return {
      title:
        "Reel Not Found | INFINIA BHARAT NEWS",

      description:
        "यह reel उपलब्ध नहीं है।",

      robots: {
        index: false,
        follow: false,
      },
    };
  }


  // ====================================================
  // REEL SEO DATA
  // ====================================================

  const title =
    reel.title?.trim()
      ? `${reel.title.trim()} | INFINIA BHARAT NEWS`
      : "Latest Reel | INFINIA BHARAT NEWS";


  const description =
    reel.title?.trim()
      ? `${reel.title.trim()} — INFINIA BHARAT NEWS की latest Hindi news reel देखें।`
      : "INFINIA BHARAT NEWS की latest Hindi news reel देखें।";


  const reelUrl =
    `${SITE_URL}/reel/${encodeURIComponent(reel.id)}`;


  const image =
    reel.thumbnail ||
    `${SITE_URL}/logos/logo-light.webp`;


  return {

    // ==================================================
    // BASIC SEO
    // ==================================================

    title,

    description,

    keywords: [
      reel.title || "",
      "INFINIA BHARAT NEWS",
      "Hindi News",
      "Hindi News Reel",
      "Latest News",
      "Breaking News",
      "News Shorts",
      "भारत समाचार",
      "ताजा खबर",
      "ब्रेकिंग न्यूज़",
    ].filter(Boolean),


    // ==================================================
    // CANONICAL
    // ==================================================

    alternates: {
      canonical: reelUrl,
    },


    // ==================================================
    // ROBOTS
    // ==================================================

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


    // ==================================================
    // OPEN GRAPH
    // ==================================================

    openGraph: {

      type: "video.other",

      locale: "hi_IN",

      url: reelUrl,

      siteName:
        "INFINIA BHARAT NEWS",

      title,

      description,

      images: [
        {
          url: image,
          alt:
            reel.title ||
            "INFINIA BHARAT NEWS Reel",

          width: 1200,
          height: 675,
        },
      ],

      videos: [
        {
          url: reel.url,
        },
      ],
    },


    // ==================================================
    // TWITTER
    // ==================================================

    twitter: {

      card:
        "summary_large_image",

      title,

      description,

      images: [
        image,
      ],
    },


    // ==================================================
    // AUTHOR / CREATOR
    // ==================================================

    authors: [
      {
        name:
          "INFINIA BHARAT NEWS",
      },
    ],

    creator:
      "INFINIA BHARAT NEWS",

    publisher:
      "INFINIA BHARAT NEWS",
  };
}


// ======================================================
// PAGE
// ======================================================

export default async function ReelPage({
  params,
}: ReelPageProps) {

  const { id } = await params;


  // ====================================================
  // GET ALL SHORTS
  // ====================================================

  const shorts =
    await getPublishedShorts();


  // ====================================================
  // CLEAN URL ID
  // ====================================================

  const cleanId =
    decodeURIComponent(id).trim();


  // ====================================================
  // FIND REEL
  // ====================================================

  const startIndex =
    shorts.findIndex(
      (item) =>
        item.id.trim() === cleanId
    );


  // ====================================================
  // NOT FOUND
  // ====================================================

  if (startIndex < 0) {

    return (
      <main
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-black
          px-6
          text-white
        "
      >

        <div
          className="
            max-w-md
            text-center
          "
        >

          <h1
            className="
              text-2xl
              font-bold
            "
          >
            Reel not found
          </h1>

          <p
            className="
              mt-2
              text-sm
              text-white/60
            "
          >
            यह reel उपलब्ध नहीं है या
            publish नहीं की गई है।
          </p>

        </div>

      </main>
    );
  }


  // ====================================================
  // ACTIVE REEL
  // ====================================================

  const reel =
    shorts[startIndex];


  // ====================================================
  // VIDEO OBJECT SCHEMA
  // ====================================================

  const reelUrl =
    `${SITE_URL}/reel/${encodeURIComponent(reel.id)}`;


  const reelImage =
    reel.thumbnail ||
    `${SITE_URL}/logos/logo-light.webp`;


  const videoSchema = {

    "@context":
      "https://schema.org",

    "@type":
      "VideoObject",

    "@id":
      `${reelUrl}#video`,

    name:
      reel.title ||
      "INFINIA BHARAT NEWS Reel",

    description:
      reel.title
        ? `${reel.title} — INFINIA BHARAT NEWS की latest Hindi news reel।`
        : "INFINIA BHARAT NEWS की latest Hindi news reel।",

    thumbnailUrl: [
      reelImage,
    ],

    contentUrl:
      reel.url,

    embedUrl:
      `https://www.youtube.com/embed/${reel.id}`,

    url:
      reelUrl,

    publisher: {

      "@type":
        "Organization",

      name:
        "INFINIA BHARAT NEWS",

      url:
        SITE_URL,

      logo: {

        "@type":
          "ImageObject",

        url:
          `${SITE_URL}/logos/logo-light.webp`,
      },
    },

    uploadDate:
      reel.publishedAt ||
      undefined,

    inLanguage:
      "hi-IN",

    isAccessibleForFree:
      true,
  };


  // ====================================================
  // PAGE
  // ====================================================

  return (

    <main
      className="
        h-screen
        w-full
        overflow-hidden
        bg-black
      "
    >

      {/* ================================================
          VIDEO SEO SCHEMA
      ================================================ */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              videoSchema
            ),
        }}
      />


      {/* ================================================
          REELS FEED
      ================================================ */}

      <ReelsFeed
        shorts={shorts}
        initialIndex={startIndex}
      />

    </main>
  );
}