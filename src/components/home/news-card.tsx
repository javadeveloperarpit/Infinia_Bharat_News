"use client";

import Image from "next/image";
import Link from "next/link";

import {
  Clock3,
  Eye,
} from "lucide-react";

interface BaseCardData {
  id: string;
  title: string;
  thumbnail: string;

  category?: string;
  createdAt?: any;
  views?: number;

  slug?: string;

  // Native Ad
  isNativeAd?: boolean;
  adLink?: string;
  openInNewTab?: boolean;
}

interface Props {
  article: BaseCardData;
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
      (views / 1000).toFixed(1) +
      "K"
    );
  }

  return String(views);
}

function formatArticleDate(value: any) {
  if (!value) {
    return "Today";
  }

  try {
    let date: Date;

    if (
      value &&
      typeof value.toDate === "function"
    ) {
      date = value.toDate();
    } else if (
      typeof value === "object" &&
      typeof value.seconds === "number"
    ) {
      date = new Date(
        value.seconds * 1000
      );
    } else {
      date = new Date(value);
    }

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "Today";
    }

    return date.toLocaleDateString(
      "hi-IN"
    );
  } catch {
    return "Today";
  }
}

export default function NewsCard({
  article,
}: Props) {

  const {
    id,
    title,
    thumbnail,
    category,
    createdAt,
    views,
    slug,

    isNativeAd = false,
    adLink,
    openInNewTab,
  } = article;


  // ==================================================
  // SAME CARD FOR ARTICLE + NATIVE AD
  // ==================================================

  const card = (
    <article
      className="
        group
        flex
        w-full
        min-w-0
        h-full
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
      "
    >

      {/* IMAGE */}

      <div
  className="
    relative
    w-[60%]
    basis-[60%]
    flex-[0_0_60%]
    min-w-0
    overflow-hidden
    rounded-lg
    bg-zinc-200
    aspect-video
  "
>

        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={
    isNativeAd
      ? "Advertisement"
      : title
  }
            fill
            sizes="
              (max-width:639px) 42vw,
              (max-width:1023px) 35vw,
              220px
            "
            className="
              object-cover
              transition-transform
              duration-500
              group-hover:scale-105
            "
          />
        ) : (
          <div
            className="
              absolute
              inset-0
              bg-zinc-200
            "
          />
        )}

        {/* AD LABEL */}

        {isNativeAd && (
          <span
            className="
              absolute
              top-2
              left-2
              z-10
              rounded
              bg-black/75
              px-2
              py-1
              text-[8px]
              sm:text-[9px]
              font-bold
              uppercase
              tracking-wide
              text-white
              backdrop-blur-sm
            "
          >
            Advertisement
          </span>
        )}

      </div>


      {/* CONTENT */}

      <div
        className="
          flex
          min-w-0
          flex-1
          flex-col
          h-full
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
          {isNativeAd
            ? "Sponsored"
            : category || "NEWS"}
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
            mt-auto
            pt-3
            flex
            items-center
            gap-3
            text-[10px]
            sm:text-xs
            text-zinc-500
          "
        >

          {isNativeAd ? (

            <span>
              Advertisement
            </span>

          ) : (

            <>

              <span
                className="
                  flex
                  items-center
                  gap-1
                "
              >
                <Clock3 size={12} />

                {formatArticleDate(
                  createdAt
                )}
              </span>

              <span
                className="
                  flex
                  items-center
                  gap-1
                "
              >
                <Eye size={12} />

                {views ||
                  generateViews(id)}
              </span>

            </>

          )}

        </div>

      </div>

    </article>
  );


  // ==================================================
  // NATIVE AD
  // ==================================================

  if (isNativeAd) {

    if (!adLink) {
      return (
        <div
          className="
            block
            w-full
            h-full
            min-w-0
          "
        >
          {card}
        </div>
      );
    }

    return (
      <a
        href={adLink}
        target={
          openInNewTab !== false
            ? "_blank"
            : "_self"
        }
        rel={
          openInNewTab !== false
            ? "noopener noreferrer"
            : undefined
        }
        className="
          block
          w-full
          h-full
          min-w-0
        "
      >
        {card}
      </a>
    );
  }


  // ==================================================
  // NORMAL ARTICLE
  // ==================================================

  return (
    <Link
      href={`/news/${slug}`}
      className="
        block
        w-full
        h-full
        min-w-0
      "
    >
      {card}
    </Link>
  );
}