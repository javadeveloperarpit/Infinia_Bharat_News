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
    `INFINIA BHARAT NEWS पर देखें: ${title}`;

  const url =
  `${siteConfig.url}/video/${video.id}`;
  return {
    title,

    description,

    keywords: [
      title,
      "Hindi News Video",
      "Latest News Video",
      "Breaking News Video",
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
      url:
        video.thumbnail ||
        `${siteConfig.url}${siteConfig.logo}`,

      width: 1200,

      height: 675,

      alt: title,
    },
  ],
},

twitter: {
  card: "summary_large_image",

  title,

  description,

  images: [
    video.thumbnail ||
    `${siteConfig.url}${siteConfig.logo}`,
  ],
},
  };
}

export default async function VideoPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  const video = await getVideoById(id);

  if (!video) {
    notFound();
  }

  const related = await getRelatedVideos(
    video.categoryId,
    video.id
  );
  function getYouTubeVideoId(url: string) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.slice(1);
    }

    if (
      parsed.hostname.includes("youtube.com")
    ) {
      return parsed.searchParams.get("v");
    }

    return null;
  } catch {
    return null;
  }
}
const youtubeId =
  getYouTubeVideoId(video.youtubeUrl);

const url =
  `${siteConfig.url}/video/${video.id}`;

  

const videoSchema = {
  "@context": "https://schema.org",

  "@type": "VideoObject",

  "@id": `${url}#video`,

  name: video.title,

  description:
    video.description ||
    `INFINIA BHARAT NEWS पर देखें: ${video.title}`,

  thumbnailUrl: [
    youtubeId
      ? `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`
      : `${siteConfig.url}${siteConfig.logo}`,
  ],

  uploadDate:
    video.createdAt,

  embedUrl:
    youtubeId
      ? `https://www.youtube.com/embed/${youtubeId}`
      : undefined,

  publisher: {
    "@type": "Organization",

    name:
      siteConfig.name,

    url:
      siteConfig.url,

    logo: {
      "@type": "ImageObject",

      url:
        `${siteConfig.url}${siteConfig.logo}`,
    },
  },

  inLanguage:
    siteConfig.language,

  isFamilyFriendly: true,
};

  return (
  <main className="w-full min-w-0">
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(videoSchema),
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

      {/* =====================================================
          VIDEO + DESKTOP RELATED
      ===================================================== */}

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
              youtubeUrl={video.youtubeUrl}
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

              Desktop par hidden
              Mobile par visible
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