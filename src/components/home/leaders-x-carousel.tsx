"use client";

import {
  BadgeCheck,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useEffect, useRef } from "react";

interface XPost {
  person: string;
  handle: string;
  title: string;
  link: string;
  pubDate: string;
  image?: string;
}

interface Props {
  posts: XPost[];
}

function formatPostDate(date: string) {
  const d = new Date(date);

  if (isNaN(d.getTime())) {
    return "";
  }

  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getProfileImage(handle: string) {
  return `https://unavatar.io/x/${handle}`;
}

export default function LeadersXCarousel({
  posts,
}: Props) {
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const slider = sliderRef.current;

    if (!slider) return;

    const interval = setInterval(() => {
      const maxScroll =
        slider.scrollWidth - slider.clientWidth;

      if (slider.scrollLeft >= maxScroll - 10) {
        slider.scrollTo({
          left: 0,
          behavior: "smooth",
        });
      } else {
        slider.scrollBy({
          left: 380,
          behavior: "smooth",
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  function move(direction: "left" | "right") {
    sliderRef.current?.scrollBy({
      left: direction === "right" ? 380 : -380,
      behavior: "smooth",
    });
  }

  return (
    <section className="relative bg-white py-5">

      {/* SECTION HEADER */}

      <div className="mx-auto mb-4 max-w-[1400px] px-4">

        <div className="flex items-center justify-between">

          <div>
            <div className="flex items-center gap-2">

              <span className="h-7 w-1 rounded-full bg-red-600" />

              <h2 className="text-xl font-black tracking-tight text-zinc-900 sm:text-2xl">
                Leaders on X
              </h2>

              <span className="rounded-full bg-black px-2 py-0.5 text-xs font-bold text-white">
                𝕏
              </span>

            </div>

            <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
              Latest posts from India's public figures
            </p>
          </div>

          {/* CONTROLS */}

          <div className="hidden gap-2 sm:flex">

            <button
              type="button"
              onClick={() => move("left")}
              aria-label="Previous posts"
              className="
                flex h-9 w-9 items-center justify-center
                rounded-full border border-zinc-200
                bg-white text-zinc-700
                shadow-sm transition
                hover:bg-zinc-100
              "
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              onClick={() => move("right")}
              aria-label="Next posts"
              className="
                flex h-9 w-9 items-center justify-center
                rounded-full border border-zinc-200
                bg-white text-zinc-700
                shadow-sm transition
                hover:bg-zinc-100
              "
            >
              <ChevronRight size={18} />
            </button>

          </div>

        </div>

      </div>


      {/* CAROUSEL */}

      <div className="relative">

        <div
          ref={sliderRef}
          className="
            flex
            gap-4
            overflow-x-auto
            scroll-smooth
            px-4
            pb-3
            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden
          "
        >

          {posts.map((post, index) => {

            const profileImage =
              getProfileImage(post.handle);

            return (
              <a
                key={`${post.handle}-${post.pubDate}-${index}`}
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  group
                  w-[320px]
                  min-w-[320px]
                  overflow-hidden
                  rounded-2xl
                  border
                  border-zinc-200
                  bg-white
                  p-4
                  shadow-sm
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:shadow-lg
                  sm:w-[390px]
                  sm:min-w-[390px]
                "
              >

                {/* USER */}

                <div className="flex items-center gap-3">

                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-zinc-200">

                    <img
                      src={profileImage}
                      alt={post.person}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />

                  </div>

                  <div className="min-w-0 flex-1">

                    <div className="flex items-center gap-1">

                      <span className="truncate text-sm font-bold text-zinc-900">
                        {post.person}
                      </span>

                      <BadgeCheck
                        size={16}
                        strokeWidth={2.5}
                        fill="#1d9bf0"
                        color="white"
                        className="shrink-0"
                      />

                    </div>

                    <div className="text-xs text-zinc-500">
                      @{post.handle}
                    </div>

                  </div>

                  <span className="text-lg font-black">
                    𝕏
                  </span>

                </div>


                {/* POST */}

                <div
                  className="
                    mt-4
                    break-words
                    whitespace-pre-wrap
                    text-[14px]
                    leading-[1.55]
                    text-zinc-800
                    sm:text-[15px]
                  "
                >
                  {post.title}
                  <span className="ml-1 font-medium text-zinc-400">
                    ...
                  </span>
                </div>


                {/* IMAGE */}

                {post.image && (
                  <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">

                    <img
                      src={post.image}
                      alt=""
                      loading="lazy"
                      className="
                        h-44
                        w-full
                        object-cover
                        transition-transform
                        duration-500
                        group-hover:scale-[1.03]
                      "
                    />

                  </div>
                )}


                {/* FOOTER */}

                <div className="mt-4 flex items-center justify-between">

                  <div>

                    <div className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                      Posted on X
                    </div>

                    <div className="mt-0.5 text-[10px] text-zinc-400">
                      {formatPostDate(post.pubDate)}
                    </div>

                  </div>

                  <div className="flex items-center gap-1 text-xs font-semibold text-zinc-400 transition group-hover:text-[#1d9bf0]">

                    View post

                    <ExternalLink size={13} />

                  </div>

                </div>

              </a>
            );
          })}

        </div>

      </div>

    </section>
  );
}