"use client";

import Image from "next/image";
import Link from "next/link";

import {
  Clock3,
  Eye,
} from "lucide-react";

interface Props {
  article: {
    id: string;
    slug: string;
    title: string;
    thumbnail: string;
    category?: string;
    createdAt?: string;
    views?: number;
  };
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
      (views / 1000)
        .toFixed(1) + "K"
    );
  }

  return String(views);
}

export default function NewsCard({
  article,
}: Props) {
  const {
    id,
    slug,
    title,
    thumbnail,
    category,
    createdAt,
    views,
  } = article;

  return (
    <Link
      href={`/news/${slug}`}
      className="
        group
        block
        h-full
      "
    >
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

        {/* IMAGE */}

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

          {thumbnail ? (
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
          ) : (
            <div
              className="
                absolute
                inset-0
                bg-gradient-to-br
                from-zinc-300
                via-zinc-200
                to-zinc-100
              "
            />
          )}

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
            {category || "NEWS"}
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
              gap-3
              text-[10px]
              sm:text-xs
              text-zinc-500
            "
          >

            <span
              className="
                flex
                items-center
                gap-1
              "
            >
              <Clock3 size={12} />

              {createdAt
                ? new Date(createdAt)
                    .toLocaleDateString("hi-IN")
                : "Today"}
            </span>


            <span
              className="
                flex
                items-center
                gap-1
              "
            >
              <Eye size={12} />

              {views || generateViews(id)}
            </span>

          </div>

        </div>

      </div>
    </Link>
  );
}

