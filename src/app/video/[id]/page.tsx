import { notFound } from "next/navigation";

import {
  getVideoById,
  getRelatedVideos,
} from "@/services/public/video.public.service";

import VideoPlayer from "@/components/video/video-player";
import VideoInfo from "@/components/video/video-info";
import RelatedVideos from "@/components/video/related-videos";

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