"use client";

import { useState } from "react";

import VideoShareButtons from "@/components/video/video-share-buttons";

interface Props {
  video: any;
}

export default function VideoInfo({ video }: Props) {
  const [expanded, setExpanded] = useState(false);

  function formatDate(date?: string) {
    if (!date) return "";

    return new Date(date).toLocaleDateString("hi-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  return (
    <div className="w-full min-w-0 max-w-full mt-5">
      {/* =========================
          TITLE
      ========================= */}

      <h1 className="
        text-xl
        sm:text-2xl
        md:text-3xl
        font-extrabold
        text-zinc-900
        leading-tight
        break-words
      ">
        {video.title}
      </h1>


      {/* =========================
          DATE + SHARE
      ========================= */}

      <div className="
        mt-4
        flex
        flex-col
        sm:flex-row
        sm:items-center
        sm:justify-between
        gap-4
        min-w-0
      ">

        {video.createdAt && (
          <span className="text-sm text-zinc-500">
            {formatDate(video.createdAt)}
          </span>
        )}

        <div className="shrink-0">
          <VideoShareButtons
            title={video.title}
            url={`https://infiniabharatnews.vercel.app/video/${video.id}`}
          />
        </div>

      </div>


      {/* =========================
          DESCRIPTION
      ========================= */}

      {video.description && (
        <div className="mt-5 w-full min-w-0 max-w-full">

          <div
            className={`
              text-zinc-700
              leading-relaxed
              whitespace-pre-line
              text-sm
              md:text-base
              break-words
              transition-all
              duration-300

              ${
                expanded
                  ? ""
                  : "line-clamp-3"
              }
            `}
          >
            {video.description}
          </div>


          {/* =========================
              SHOW MORE / LESS
          ========================= */}

          {video.description.length > 150 && (
<button
  type="button"
  onClick={() => setExpanded(!expanded)}
  className="
    mt-2
    inline-flex
    items-center
    gap-1.5
    text-blue-600
    hover:text-blue-700
    font-semibold
    text-sm
    transition-colors
    cursor-pointer
  "
>
  <span>
    {expanded ? "Show less" : "Show more"}
  </span>

  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`
      transition-transform
      duration-300
      ${expanded ? "rotate-180" : ""}
    `}
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
</button>

          )}

        </div>
      )}

    </div>
  );
}

