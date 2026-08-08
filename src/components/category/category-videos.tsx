"use client";

import { useState } from "react";

import VideoCard from "@/components/home/video-card";

export default function CategoryVideos({
  videos,
}: {
  videos: any[];
}) {
  const [visible, setVisible] =
    useState(6);

  if (
    !videos ||
    videos.length === 0
  ) {
    return null;
  }

  const videoList =
    videos.slice(0, visible);

  return (
    <div className="w-full min-w-0">

      {/* VIDEO CARDS */}
      <div
        className="
          grid
          grid-cols-1
          gap-4
          w-full
          min-w-0

          md:grid-cols-2
          md:gap-5

          xl:grid-cols-3
        "
      >
        {videoList.map(
          (item: any) => (
            <div
              key={item.id}
              className="
                w-full
                min-w-0
                overflow-hidden
              "
            >
              <VideoCard
                {...item}
              />
            </div>
          )
        )}
      </div>


      {/* LOAD MORE */}
      {visible < videos.length && (
        <div
          className="
            flex
            justify-center
            mt-8
          "
        >
          <button
            onClick={() =>
              setVisible(
                (prev) => prev + 6
              )
            }
            className="
              px-8
              py-3
              rounded-full
              bg-red-600
              text-white
              font-bold
              hover:bg-red-700
              transition
            "
          >
            Load More
          </button>
        </div>
      )}

    </div>
  );
}

