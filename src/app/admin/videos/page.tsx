"use client";

import {
useEffect,
useState,
} from "react";

import Link from "next/link";

import Image from "next/image";

import {
getVideos,
deleteVideo,
} from "@/services/video.service";

import {
getYoutubeThumbnail,
} from "@/utils/youtube";

export default function Videos() {

const [videos, setVideos] =
useState<any[]>([]);

const [loading, setLoading] =
useState(true);

async function load() {

try {

  setLoading(true);

  const data =
    await getVideos();

  setVideos(data);

}
catch (error) {

  console.error(
    "Videos Load Error:",
    error
  );

  setVideos([]);

}
finally {

  setLoading(false);

}

}

useEffect(() => {


load();

}, []);

async function handleDelete(
id: string
) {


const confirmed =
  confirm(
    "Delete this video?"
  );


if (!confirmed)
  return;


try {

  await deleteVideo(id);

  await load();

}
catch (error) {

  console.error(
    "Video Delete Error:",
    error
  );

  alert(
    "Failed to delete video"
  );

}

}

return (

<div className="
  w-full
  min-w-0
  space-y-6
">


  {/* HEADER */}

  <div className="
    flex
    flex-col
    gap-4
    sm:flex-row
    sm:items-center
    sm:justify-between
  ">

    <div>

      <h1 className="
        text-2xl
        sm:text-3xl
        font-bold
        text-zinc-900
      ">

        Videos

      </h1>

      <p className="
        mt-1
        text-sm
        text-zinc-500
      ">

        Manage your YouTube videos

      </p>

    </div>


    <Link
      href="/admin/videos/create"
      className="
        inline-flex
        w-full
        sm:w-auto
        items-center
        justify-center
        rounded-lg
        bg-red-600
        px-5
        py-3
        text-sm
        font-semibold
        text-white
        transition
        hover:bg-red-700
        active:scale-[0.98]
      "
    >

      + Add Video

    </Link>

  </div>


  {/* CONTENT */}

  <div className="
    w-full
    min-w-0
    overflow-hidden
    rounded-xl
    border
    border-zinc-200
    bg-white
    shadow-sm
  ">


    {loading ? (

      <div className="
        flex
        min-h-[220px]
        items-center
        justify-center
        text-sm
        text-zinc-500
      ">

        Loading videos...

      </div>

    ) : videos.length === 0 ? (

      <div className="
        flex
        min-h-[220px]
        flex-col
        items-center
        justify-center
        px-4
        text-center
      ">

        <p className="
          font-semibold
          text-zinc-800
        ">

          No videos found

        </p>

        <p className="
          mt-1
          text-sm
          text-zinc-500
        ">

          Add your first YouTube video.

        </p>

      </div>

    ) : (

      <div className="
        divide-y
        divide-zinc-100
      ">

        {videos.map(
          (video) => {

            const thumbnail =
              video.thumbnail ||
              getYoutubeThumbnail(
                video.youtubeUrl
              );


            return (

              <div
                key={video.id}
                className="
                  flex
                  min-w-0
                  flex-col
                  gap-4
                  p-4
                  transition
                  hover:bg-zinc-50
                  sm:p-5
                  md:flex-row
                  md:items-center
                "
              >


                {/* THUMBNAIL */}

                <div className="
                  relative
                  aspect-video
                  w-full
                  shrink-0
                  overflow-hidden
                  rounded-lg
                  bg-zinc-100
                  md:w-44
                ">

                  {thumbnail ? (

                    <Image
                      src={thumbnail}
                      alt={
                        video.title ||
                        "Video thumbnail"
                      }
                      fill
                      sizes="
                        (max-width: 768px) 100vw,
                        176px
                      "
                      className="
                        object-cover
                      "
                    />

                  ) : (

                    <div className="
                      flex
                      h-full
                      items-center
                      justify-center
                      text-xs
                      text-zinc-400
                    ">

                      No Thumbnail

                    </div>

                  )}

                </div>


                {/* INFO */}

                <div className="
                  min-w-0
                  flex-1
                ">

                  <h2 className="
                    line-clamp-2
                    text-base
                    font-semibold
                    leading-6
                    text-zinc-900
                    sm:text-lg
                  ">

                    {video.title}

                  </h2>


                  <div className="
                    mt-3
                    flex
                    flex-wrap
                    items-center
                    gap-2
                  ">

                    <span
                      className={`
                        inline-flex
                        rounded-full
                        px-3
                        py-1
                        text-xs
                        font-semibold
                        ${
                          video.status ===
                          "published"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }
                      `}
                    >

                      {video.status}

                    </span>


                    {video.categoryId && (

                      <span className="
                        rounded-full
                        bg-zinc-100
                        px-3
                        py-1
                        text-xs
                        font-medium
                        text-zinc-600
                      ">

                        Video

                      </span>

                    )}

                  </div>

                </div>


                {/* ACTIONS */}

                <div className="
                  flex
                  w-full
                  flex-wrap
                  items-center
                  gap-3
                  border-t
                  border-zinc-100
                  pt-3
                  md:w-auto
                  md:flex-col
                  md:items-stretch
                  md:border-0
                  md:pt-0
                ">

                  <a
                    href={
                      video.youtubeUrl
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      inline-flex
                      flex-1
                      items-center
                      justify-center
                      rounded-lg
                      border
                      border-zinc-200
                      px-4
                      py-2
                      text-sm
                      font-semibold
                      text-blue-600
                      transition
                      hover:bg-blue-50
                      md:flex-none
                    "
                  >

                    Open Video

                  </a>


                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(
                        video.id
                      )
                    }
                    className="
                      inline-flex
                      flex-1
                      items-center
                      justify-center
                      rounded-lg
                      border
                      border-red-100
                      px-4
                      py-2
                      text-sm
                      font-semibold
                      text-red-600
                      transition
                      hover:bg-red-50
                      md:flex-none
                    "
                  >

                    Delete

                  </button>

                </div>

              </div>

            );

          }
        )}

      </div>

    )}

  </div>

</div>

);

}
