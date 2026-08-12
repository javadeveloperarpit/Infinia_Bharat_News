import { notFound } from "next/navigation";
import type { Metadata } from "next";

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
    `/video/${video.id}`;

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
      siteName: "INFINIA BHARAT NEWS",
      locale: "hi_IN",
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
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

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-5 sm:py-8 overflow-hidden">
      
      <div className="grid w-full min-w-0 grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

        {/* =========================
            MAIN VIDEO
        ========================= */}

        <main className="min-w-0 w-full max-w-full lg:col-span-8">
          
          <div className="w-full max-w-full min-w-0 overflow-hidden rounded-xl">
            <VideoPlayer
              youtubeUrl={video.youtubeUrl}
            />
          </div>

          <div className="w-full min-w-0 max-w-full">
            <VideoInfo
              video={video}
            />
          </div>

        </main>


        {/* =========================
            RELATED VIDEOS
        ========================= */}

        <aside className="hidden lg:block min-w-0 w-full max-w-full lg:col-span-4">

          <div className="sticky top-24 w-full min-w-0 max-w-full">
            
            <RelatedVideos
              videos={related}
            />

          </div>

        </aside>

      </div>
    </div>
  );
}