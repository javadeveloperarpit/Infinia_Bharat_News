"use client";

import Image from "next/image";
import Link from "next/link";

import {
  Play,
  Eye,
} from "lucide-react";

interface Props {
  id: string;
  title: string;
  youtubeUrl: string;
  category?: string;
  views?: number;
}

function generateViews(id: string) {
  let hash = 0;

  for (let i = 0; i < id.length; i++) {
    hash =
      id.charCodeAt(i) +
      ((hash << 5) - hash);
  }

  const views =
    Math.abs(hash) % 50000 + 500;

  if (views >= 1000) {
    return (
      (views / 1000).toFixed(1) + "K"
    );
  }

  return String(views);
}

export default function VideoCard({
  id,
  title,
  youtubeUrl,
  category,
  views,
}: Props) {

  const youtubeId =
    youtubeUrl
      ?.split("v=")[1]
      ?.split("&")[0] ||
    youtubeUrl
      ?.split("/")
      .pop();

  const thumbnail =
    youtubeId
      ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
      : "/placeholder.jpg";

  return (
    <Link
      href={`/video/${id}`}
      className="
        group
        block
        h-full
      "
    >

      {/* OUTER CARD */}

      <div
        className="
          flex
          gap-3
          sm:gap-4
          rounded-xl
          overflow-hidden
          bg-white
          border
          border-zinc-200
          p-3
          hover:border-red-600
          hover:shadow-lg
          transition-all
          duration-300
          h-full
        "
      >

        {/* THUMBNAIL */}

        <div
          className="
            relative
            w-[180px]
            sm:w-[200px]
            md:w-[220px]
            aspect-[16/9]
            shrink-0
            overflow-hidden
            rounded-lg
            bg-zinc-200
          "
        >

          <Image
            src={thumbnail}
            alt={title}
            fill
            sizes="
              (max-width:640px) 180px,
              (max-width:1024px) 200px,
              220px
            "
            className="
              object-cover
              transition-transform
              duration-500
              group-hover:scale-110
            "
          />

          {/* OVERLAY */}

          <div
            className="
              absolute
              inset-0
              bg-black/20
              group-hover:bg-black/40
              transition
            "
          />

          {/* PLAY */}

          <div
            className="
              absolute
              inset-0
              flex
              items-center
              justify-center
            "
          >

            <div
              className="
                w-10
                h-10
                sm:w-12
                sm:h-12
                rounded-full
                bg-red-600
                text-white
                flex
                items-center
                justify-center
                shadow-xl
                group-hover:scale-110
                transition
              "
            >
              <Play
                size={20}
                fill="white"
              />
            </div>

          </div>

          {/* VIDEO TAG */}

          <span
            className="
              absolute
              top-2
              left-2
              bg-red-600
              text-white
              text-[9px]
              font-black
              px-2
              py-1
              rounded
            "
          >
            VIDEO
          </span>

        </div>


        {/* CONTENT */}

        <div
          className="
            flex
            flex-col
            justify-between
            min-w-0
            flex-1
          "
        >

          {/* CATEGORY */}

          <span
          className="
            inline-flex
            self-start
            max-w-full
            truncate
            bg-red-600
            text-white
            px-2
            py-1
            rounded
            text-[10px]
            font-black
            uppercase
          "
        >
            {category || "VIDEO"}
          </span>


          {/* TITLE */}

          <h3
            className="
              mt-2
              text-[14px]
              sm:text-[15px]
              md:text-base
              font-extrabold
              leading-5
              line-clamp-3
              text-zinc-900
              group-hover:text-red-600
              transition
            "
          >
            {title}
          </h3>


          {/* META */}

          <div
            className="
              mt-3
              flex
              items-center
              justify-end
              text-[11px]
              text-zinc-600
            "
          >

            <span
              className="
                flex
                items-center
                gap-1
              "
            >
              <Eye size={13} />

              {views || generateViews(id)}
            </span>

          </div>

        </div>

      </div>

    </Link>
  );
}

