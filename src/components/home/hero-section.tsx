"use client";

import Link from "next/link";
import Image from "next/image";

import {
  Clock3,
  Eye,
  ArrowRight,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";


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
// SAME LOGIC AS NEWS CARD
// ======================================================

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


// ======================================================
// LIMIT TEXT BY CHARACTERS
// ======================================================

function limitText(
  text: string | undefined,
  maxLength: number
) {

  if (!text) {
    return "";
  }

  if (text.length <= maxLength) {
    return text;
  }

  return (
    text
      .slice(0, maxLength)
      .trimEnd() +
    "..."
  );
}


// ======================================================
// FORMAT TIME
// ======================================================

function formatTime(createdAt?: string) {

  if (!createdAt) {
    return "Today";
  }

  const createdTime =
    new Date(createdAt).getTime();

  if (isNaN(createdTime)) {
    return "Today";
  }

  const difference =
    Math.max(
      0,
      Date.now() - createdTime
    );

  const seconds =
    Math.floor(
      difference / 1000
    );

  const minutes =
    Math.floor(
      seconds / 60
    );

  const hours =
    Math.floor(
      minutes / 60
    );

  const days =
    Math.floor(
      hours / 24
    );


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

  return new Date(
    createdTime
  ).toLocaleDateString(
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

  const hero =
    featured?.[0];

  const sideStories =
    featured?.slice(1, 5) || [];


  const [, setTime] =
    useState(Date.now());


  // ====================================================
  // LIVE TIME UPDATE
  // ====================================================

  useEffect(() => {

    const timer =
      setInterval(() => {

        setTime(
          Date.now()
        );

      }, 1000);

    return () =>
      clearInterval(timer);

  }, []);


  if (!hero) {
    return null;
  }


  return (

    <section
      className="
        w-full
        mb-4
        sm:mb-8
      "
    >

      <div
        className="
          flex
          flex-col
          lg:flex-row
          gap-4
          w-full
        "
      >


        {/* ==================================================
            MAIN HERO
            MOBILE = FULL WIDTH
            DESKTOP = 70%
        ================================================== */}

        <div
          className="
            w-screen
            relative
            left-1/2
            -translate-x-1/2

            lg:relative
            lg:left-0
            lg:translate-x-0
            lg:w-[70%]
            lg:shrink-0
          "
        >

          <Link
            href={`/news/${hero.slug || hero.id}`}
            className="
              group
              block
            "
          >

            {/* ==================================================
                HERO IMAGE
            ================================================== */}

            <div
              className="
                relative
                w-full
                h-[270px]
                sm:h-[360px]
                overflow-hidden

                lg:h-[560px]
                lg:rounded-2xl
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
                  group-hover:scale-105
                "
              />


              {/* ==================================================
                  DESKTOP OVERLAY
              ================================================== */}

              <div
                className="
                  hidden
                  lg:block
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-black/95
                  via-black/40
                  to-transparent
                "
              />


              {/* ==================================================
                  DESKTOP TOP BADGES
              ================================================== */}

              <div
                className="
                  hidden
                  lg:flex
                  absolute
                  top-5
                  left-5
                  right-5
                  items-center
                  justify-between
                "
              >

                <span
                  className="
                    rounded-md
                    bg-[#AD0000]
                    px-3
                    py-1.5
                    text-xs
                    font-black
                    uppercase
                    tracking-wide
                    text-white
                    shadow-lg
                  "
                >
                  {hero.category || "NEWS"}
                </span>


                <span
                  className="
                    flex
                    items-center
                    gap-1.5
                    rounded-full
                    bg-black/60
                    px-3
                    py-1.5
                    text-xs
                    font-bold
                    text-white
                    backdrop-blur-md
                  "
                >

                  <span
                    className="
                      h-1.5
                      w-1.5
                      rounded-full
                      bg-red-500
                      animate-pulse
                    "
                  />

                  TOP STORY

                </span>

              </div>


              {/* ==================================================
                  DESKTOP TEXT
              ================================================== */}

              <div
                className="
                  hidden
                  lg:block
                  absolute
                  inset-x-0
                  bottom-0
                  p-8
                  xl:p-10
                  text-white
                "
              >

                <h1
                  className="
                    max-w-6xl
                    text-4xl
                    xl:text-[52px]
                    font-black
                    leading-[1.50]
                    tracking-[-0.02em]
                    drop-shadow-lg
                  "
                >
                  {limitText(
                    hero.title,
                    150
                  )}
                </h1>


                {hero.shortDescription && (

                  <p
                    className="
                      mt-4
                      max-w-4xl
                      text-[15px]
                      xl:text-base
                      leading-[1.65]
                      text-zinc-200
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
                    mt-5
                    flex
                    items-center
                    gap-5
                    text-sm
                    text-zinc-200
                  "
                >

                  <span
                    className="
                      flex
                      items-center
                      gap-1.5
                    "
                  >
                    <Clock3 size={15} />

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
                    <Eye size={15} />

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
    gap-2
    rounded-full
    bg-white
    px-4
    py-2
    text-xs
    font-black
    text-[#AD0000]
    shadow-lg
    transition-all
    duration-300
    group-hover:bg-[#AD0000]
    group-hover:text-white
    group-hover:gap-3
  "
>
  Read Full Story

  <ArrowRight
    size={15}
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


            {/* ==================================================
                MOBILE TEXT
                OUTSIDE IMAGE
            ================================================== */}

            <div
              className="
                block
                bg-white
                px-4
                pt-4
                pb-5
                lg:hidden
              "
            >

              {/* CATEGORY */}

              <span
                className="
                  inline-flex
                  rounded
                  bg-[#AD0000]
                  px-2.5
                  py-1
                  text-[10px]
                  font-black
                  uppercase
                  tracking-wide
                  text-white
                "
              >
                {hero.category || "NEWS"}
              </span>


              {/* TITLE */}

              <h1
                className="
                  mt-3
                  text-[30px]
                  sm:text-[38px]
                  font-black
                  leading-[1.35]
                  tracking-[-0.015em]
                  text-black
                "
              >
                {limitText(
                  hero.title,
                  140
                )}
              </h1>


              {/* DESCRIPTION */}

              {hero.shortDescription && (

                <p
                  className="
                    mt-3
                    text-sm
                    sm:text-base
                    leading-[1.66]
                    text-zinc-800
                  "
                >
                  {limitText(
                    hero.shortDescription,
                    200
                  )}
                </p>

              )}


              {/* META */}

              <div
                className="
                  mt-4
                  flex
                  items-center
                  justify-between
                  gap-3
                  border-t
                  border-zinc-100
                  pt-3
                  text-[11px]
                  sm:text-xs
                  text-zinc-500
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-4
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

                </div>


                <span
  className="
    inline-flex
    items-center
    gap-2
    rounded-full
    bg-[#AD0000]
    px-4
    py-2
    text-[11px]
    sm:text-xs
    font-black
    text-white
    shadow-sm
    transition-all
    duration-300
    group-hover:bg-[#8f0000]
    group-hover:gap-3
    group-hover:shadow-md
  "
>
  पूरी खबर पढ़ें

  <ArrowRight
    size={14}
    className="
      transition-transform
      duration-300
      group-hover:translate-x-1
    "
  />
</span>
              </div>

            </div>

          </Link>

        </div>


        {/* ==================================================
            RIGHT STORIES
            DESKTOP = 30%
        ================================================== */}

        <div
          className="
            w-full
            lg:w-[30%]
            flex
            flex-col
            gap-3
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
                  w-full
                "
              >

                <article
                  className="
                    flex
                    w-full
                    min-h-[125px]
                    sm:min-h-[135px]
                    gap-3
                    overflow-hidden
                    rounded-xl
                    border
                    border-zinc-200
                    bg-white
                    p-3
                    transition-all
                    duration-300
                    hover:border-[#AD0000]
                    hover:shadow-md
                  "
                >

                  {/* IMAGE = 50% */}

                  <div
                    className="
                      relative
                      w-[50%]
                      shrink-0
                      overflow-hidden
                      rounded-lg
                      bg-zinc-200
                    "
                  >

                    <Image
                      src={story.thumbnail}
                      alt={story.title}
                      fill
                      sizes="
                        (max-width: 1023px) 60vw,
                        240px
                      "
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
                        sm:text-[10px]
                        font-black
                        uppercase
                        text-white
                      "
                    >
                      {story.category ||
                        "NEWS"}
                    </span>


                    <h2
                      className="
                        mt-2
                        text-[13px]
                        sm:text-[15px]
                        font-extrabold
                        leading-[1.45]
                        text-zinc-900
                        transition-colors
                        group-hover:text-[#AD0000]
                      "
                    >
                      {limitText(
                        story.title,
                        95
                      )}
                    </h2>


                    <div
                      className="
                        mt-auto
                        pt-2
                        flex
                        items-center
                        gap-3
                        text-[9px]
                        sm:text-[11px]
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
                          size={11}
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
                          size={11}
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

    </section>

  );
}