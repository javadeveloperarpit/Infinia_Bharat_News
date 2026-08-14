"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock3, Eye, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

// ======================================================
// TYPES
// ======================================================

interface HeroArticle {
  id: string;
  slug?: string;
  title: string;
  thumbnail: string;
  shortDescription?: string;
  category?: string;
  views?: number;
  createdAt?: string;
}

interface HeroProps {
  featured: HeroArticle[];
}

// ======================================================
// GENERATE VIEWS
// ======================================================

function generateViews(id: string) {
  let hash = 0;

  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }

  const views = Math.abs(hash) % 50000 + 500;

  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  }

  return String(views);
}

// ======================================================
// LIMIT TEXT
// ======================================================

function limitText(
  text: string | undefined,
  maxLength: number
) {
  if (!text) return "";

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trimEnd()}...`;
}

// ======================================================
// FORMAT TIME
// ======================================================

function formatTime(createdAt?: string) {
  if (!createdAt) {
    return "Today";
  }

  const createdTime = new Date(createdAt).getTime();

  if (isNaN(createdTime)) {
    return "Today";
  }

  const difference = Math.max(
    0,
    Date.now() - createdTime
  );

  const seconds = Math.floor(difference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return `${seconds} sec ago`;
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  if (hours < 24) {
    return `${hours} hours ago`;
  }

  if (days < 7) {
    return `${days} days ago`;
  }

  return new Date(createdTime).toLocaleDateString(
    "hi-IN",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );
}

// ======================================================
// COMPONENT
// ======================================================

export default function HeroSection({
  featured,
}: HeroProps) {
  const hero = featured?.[0];

  const sideStories =
    featured?.slice(1, 5) || [];

  const [, setTime] =
    useState(Date.now());

  // ====================================================
  // LIVE TIME
  // ====================================================

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!hero) {
    return null;
  }

  return (
    <section
      className="
        relative
        w-full
        mb-8
      "
    >

      {/* ==================================================
          DESKTOP + MOBILE MAIN LAYOUT
      ================================================== */}

      <div
        className="
          flex
          w-full
          flex-col
          gap-4
          lg:flex-row
          lg:items-start
        "
      >

{/* ==================================================
    MAIN HERO
================================================== */}

<div
  className="
    relative
    w-full
    lg:w-[70%]
    lg:shrink-0
  "
>
  <Link
    href={`/news/${hero.slug }`}
    className="group block w-full"
  >

    {/* ==================================================
        IMAGE
    ================================================== */}

    <div
  className="
    relative
    aspect-[16/9]
    w-full
    overflow-hidden
    rounded-t-2xl
    bg-black
    sm:aspect-auto
    sm:h-[400px]
    lg:h-[560px]
  "
>

      <Image
        src={hero.thumbnail}
        alt={hero.title}
        fill
        priority
        sizes="
          (max-width: 1023px) 100vw,
          70vw
        "
        className="
          object-cover
          transition-transform
          duration-700
          ease-out
          group-hover:scale-[1.035]
        "
      />

      {/* ==================================================
          VERY SOFT IMAGE BOTTOM GRADIENT

          Almost invisible initially.
          Slowly becomes darker towards the bottom.
      ================================================== */}

      <div 
  className="
    pointer-events-none
    absolute
    inset-x-0
    bottom-0
    z-10
    h-[150px]
    bg-gradient-to-b
    from-transparent
    via-zinc-100/20
    via-50%
    to-white/70
    sm:h-[165px]
    lg:h-[180px]
  " 
/>

    </div>


    {/* ==================================================
        FULL WIDTH TEXT BOX

        EXACTLY IMAGE WIDTH
    ================================================== */}

    <div
      className="
        relative
        z-20
        w-full
        rounded-b-2xl
        border-x
        border-b
        border-zinc-200
        bg-white
        shadow-[0_12px_35px_rgba(0,0,0,0.14)]
      "
    >

      {/* ==================================================
          SOFT CONTINUOUS GRADIENT BRIDGE

          Image bottom
                 ↓
          subtle dark
                 ↓
          soft grey
                 ↓
          almost white
                 ↓
          pure white card

          Gradient starts ABOVE the card and
          slowly disappears inside it.
      ================================================== */}

      <div 
  className="
    pointer-events-none
    absolute
    left-0
    right-0
    -top-[5px]
    z-0
    h-[10px]
    bg-gradient-to-b
    from-zinc-200/20
    via-zinc-100/40
    via-45%
    via-white/80
    to-white
    sm:-top-[5px]
    sm:h-[5px]
    lg:-top-[5px]
    lg:h-[5px]
  " 
/>


      {/* ==================================================
          TEXT CONTENT
      ================================================== */}

      <div
        className="
          relative
          z-10
          px-4
          pb-5
          pt-5
          sm:px-5
          sm:pb-6
          sm:pt-6
          lg:px-7
          lg:pb-7
          lg:pt-7
          xl:px-8
          xl:pb-8
          xl:pt-8
        "
      >

        {/* CATEGORY */}

        <div
          className="
            mb-2.5
            flex
            items-center
            gap-2
          "
        >

          <span
            className="
              rounded-md
              bg-[#AD0000]
              px-2.5
              py-1
              text-[9px]
              font-black
              uppercase
              tracking-wide
              text-white
              shadow-sm
            "
          >
            {hero.category || "NEWS"}
          </span>

          <span
            className="
              h-1
              w-1
              rounded-full
              bg-zinc-300
            "
          />

          <span
            className="
              text-[9px]
              font-bold
              uppercase
              tracking-wider
              text-zinc-400
            "
          >
            TOP STORY
          </span>

        </div>


        {/* TITLE */}

        <h1
          className="
            max-w-6xl
            text-[21px]
            font-black
            leading-[1.25]
            tracking-[-0.02em]
            text-zinc-950
            transition-colors
            group-hover:text-[#AD0000]
            sm:text-[28px]
            lg:text-[34px]
            xl:text-[42px]
          "
        >
          {limitText(
            hero.title,
            150
          )}
        </h1>


        {/* DESCRIPTION */}

        {hero.shortDescription && (
          <p
            className="
              mt-2.5
              max-w-5xl
              text-[11px]
              leading-[1.5]
              text-zinc-600
              sm:text-[12px]
              lg:text-[13px]
              xl:text-sm
            "
          >
            {limitText(
              hero.shortDescription,
              220
            )}
          </p>
        )}


        {/* META */}

        <div
          className="
            mt-4
            flex
            flex-wrap
            items-center
            gap-3
            text-[10px]
            text-zinc-500
            lg:text-xs
            xl:gap-4
          "
        >

          <span
            className="
              flex
              items-center
              gap-1.5
            "
          >
            <Clock3 size={13} />

            {formatTime(
              hero.createdAt
            )}
          </span>


          <span
            className="
              flex
              items-center
              gap-1.5
            "
          >
            <Eye size={13} />

            {hero.views ??
              generateViews(
                hero.id
              )}

            {" "}views
          </span>


          <span
            className="
              inline-flex
              items-center
              gap-1.5
              rounded-full
              bg-[#AD0000]
              px-3.5
              py-1.5
              text-[9px]
              font-black
              text-white
              shadow-md
              transition-all
              duration-300
              group-hover:gap-2.5
              group-hover:bg-black
              lg:text-[10px]
            "
          >
            Read Full Story

            <ArrowRight
              size={13}
              className="
                transition-transform
                duration-300
                group-hover:translate-x-1
              "
            />
          </span>

        </div>

      </div>

    </div>

  </Link>
</div>




        {/* ==================================================
            DESKTOP SIDEBAR
            RIGHT SIDE — VERTICAL
        ================================================== */}

        <div
          className="
            hidden
            lg:flex
            lg:w-[30%]
            lg:h-[750px]
            lg:flex-col
            lg:gap-3
          "
        >

          {sideStories.map(
            (story) => (
              <Link
                key={story.id}
                href={`/news/${story.slug || story.id}`}
                className="
                  group
                  block
                  min-h-0
                  flex-1
                "
              >

                <article
                  className="
                    flex
                    h-full
                    w-full
                    overflow-hidden
                    rounded-xl
                    border
                    border-zinc-200
                    bg-white
                    transition-all
                    duration-300
                    hover:border-[#AD0000]
                    hover:shadow-lg
                  "
                >

                  {/* IMAGE */}

                  <div
                    className="
                      relative
                      w-[60%]
                      shrink-0
                      overflow-hidden
                      bg-zinc-200
                    "
                  >

                    <Image
                      src={story.thumbnail}
                      alt={story.title}
                      fill
                      sizes="240px"
                      className="
                        object-cover
                        transition-transform
                        duration-500
                        group-hover:scale-110
                      "
                    />

                  </div>


                  {/* CONTENT */}

                  <div
                    className="
                      flex
                      min-w-0
                      flex-1
                      flex-col
                      p-3
                    "
                  >

                    <span
                      className="
                        self-start
                        max-w-full
                        truncate
                        rounded
                        bg-[#AD0000]
                        px-2
                        py-1
                        text-[9px]
                        font-black
                        uppercase
                        text-white
                      "
                    >
                      {story.category || "NEWS"}
                    </span>

                    <h2
                      className="
                        mt-2
                        text-[13px]
                        font-extrabold
                        leading-[1.42]
                        text-zinc-900
                        transition-colors
                        group-hover:text-[#AD0000]
                        xl:text-[14px]
                      "
                    >
                      {limitText(
                        story.title,
                        100
                      )}
                    </h2>

                    <div
                      className="
                        mt-auto
                        flex
                        items-center
                        gap-3
                        pt-2
                        text-[9px]
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
                        <Clock3
                          size={10}
                        />

                        {formatTime(
                          story.createdAt
                        )}
                      </span>

                      <span
                        className="
                          flex
                          items-center
                          gap-1
                        "
                      >
                        <Eye
                          size={10}
                        />

                        {story.views ??
                          generateViews(
                            story.id
                          )}
                      </span>

                    </div>

                  </div>

                </article>

              </Link>
            )
          )}

        </div>

      </div>


      {/* ==================================================
          MOBILE SIDE STORIES
          VERTICAL
      ================================================== */}

      {sideStories.length > 0 && (
        <div
          className="
            mt-4
            flex
            w-full
            flex-col
            gap-3
            lg:hidden
          "
        >

          {sideStories.map(
            (story) => (
              <Link
                key={story.id}
                href={`/news/${story.slug || story.id}`}
                className="
                  block
                  w-full
                "
              >

                <article
                  className="
                    flex
                    h-[125px]
                    w-full
                    overflow-hidden
                    rounded-xl
                    border
                    border-zinc-200
                    bg-white
                    shadow-sm
                  "
                >

                  {/* IMAGE */}

                  <div
                    className="
                      relative
                      w-[42%]
                      shrink-0
                      overflow-hidden
                      bg-zinc-200
                    "
                  >

                    <Image
                      src={story.thumbnail}
                      alt={story.title}
                      fill
                      sizes="180px"
                      className="object-cover"
                    />

                  </div>


                  {/* CONTENT */}

                  <div
                    className="
                      flex
                      min-w-0
                      flex-1
                      flex-col
                      p-3
                    "
                  >

                    <span
                      className="
                        self-start
                        max-w-full
                        truncate
                        rounded
                        bg-[#AD0000]
                        px-2
                        py-1
                        text-[8px]
                        font-black
                        uppercase
                        text-white
                      "
                    >
                      {story.category || "NEWS"}
                    </span>

                    <h2
                      className="
                        mt-2
                        line-clamp-3
                        text-[13px]
                        font-extrabold
                        leading-[1.35]
                        text-zinc-900
                      "
                    >
                      {story.title}
                    </h2>

                    <div
                      className="
                        mt-auto
                        flex
                        items-center
                        gap-3
                        text-[9px]
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
                        <Clock3
                          size={10}
                        />

                        {formatTime(
                          story.createdAt
                        )}
                      </span>

                      <span
                        className="
                          flex
                          items-center
                          gap-1
                        "
                      >
                        <Eye
                          size={10}
                        />

                        {story.views ??
                          generateViews(
                            story.id
                          )}
                      </span>

                    </div>

                  </div>

                </article>

              </Link>
            )
          )}

        </div>
      )}

    </section>
  );
}