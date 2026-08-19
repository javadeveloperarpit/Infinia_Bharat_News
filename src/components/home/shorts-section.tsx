"use client";

import {
  useRef,
} from "react";

import Image from "next/image";

import {
  ChevronLeft,
  ChevronRight,
  Play,
} from "lucide-react";

import { useRouter } from "next/navigation";

// ==========================================
// TYPES
// ==========================================

interface Short {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  publishedAt?: string;
}

interface ShortsSectionProps {
  shorts: Short[];
}

// ==========================================
// COMPONENT
// ==========================================

export default function ShortsSection({
  shorts,
}: ShortsSectionProps) {
  const router = useRouter();

  const carouselRef =
    useRef<HTMLDivElement | null>(null);

  // ==========================================
  // OPEN REEL PAGE
  // ==========================================

  function openReel(
    event:
      | React.MouseEvent
      | React.KeyboardEvent,
    short: Short
  ) {
    event.preventDefault();
    event.stopPropagation();

    router.push(
      `/reel/${encodeURIComponent(short.id)}`
    );
  }

  // ==========================================
  // GET CARD WIDTH
  // ==========================================

  function getScrollAmount() {
    const container =
      carouselRef.current;

    if (!container) {
      return 0;
    }

    const firstCard =
      container.querySelector(
        "[data-reel-card]"
      ) as HTMLElement | null;

    if (!firstCard) {
      return container.clientWidth;
    }

    const styles =
      window.getComputedStyle(
        container
      );

    const gap = parseFloat(
      styles.columnGap ||
        styles.gap ||
        "0"
    );

    return firstCard.offsetWidth + gap;
  }

  // ==========================================
  // NEXT
  // ==========================================

  function handleNext() {
    const container =
      carouselRef.current;

    if (!container) {
      return;
    }

    const amount =
      getScrollAmount();

    const maxScroll =
      container.scrollWidth -
      container.clientWidth;

    if (
      container.scrollLeft >=
      maxScroll - 10
    ) {
      container.scrollTo({
        left: 0,
        behavior: "smooth",
      });

      return;
    }

    container.scrollBy({
      left: amount * 7,
      behavior: "smooth",
    });
  }

  // ==========================================
  // PREVIOUS
  // ==========================================

  function handlePrevious() {
    const container =
      carouselRef.current;

    if (!container) {
      return;
    }

    const amount =
      getScrollAmount();

    if (
      container.scrollLeft <= 10
    ) {
      container.scrollTo({
        left:
          container.scrollWidth -
          container.clientWidth,
        behavior: "smooth",
      });

      return;
    }

    container.scrollBy({
      left: -(amount * 7),
      behavior: "smooth",
    });
  }

  // ==========================================
  // EMPTY
  // ==========================================

  if (
    !shorts ||
    shorts.length === 0
  ) {
    return null;
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <section className="w-full">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="mb-5 flex items-center justify-between gap-3">

        <div className="flex min-w-0 items-center gap-3">

          {/* ICON */}

          <div
            className="
              relative
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-red-600
              text-white
              shadow-lg
              shadow-red-600/20
            "
          >
            <Play
              size={17}
              fill="currentColor"
              strokeWidth={0}
            />

            <span
              className="
                absolute
                -right-1
                -top-1
                h-2.5
                w-2.5
                rounded-full
                bg-yellow-400
                ring-2
                ring-white
              "
            />
          </div>

          {/* TITLE */}

          <div className="min-w-0">

            <h2
              className="
                text-lg
                font-black
                tracking-tight
                text-zinc-950
                sm:text-2xl
              "
            >
              शॉर्ट्स वीडियो
            </h2>

            <p
              className="
                mt-0.5
                hidden
                text-xs
                font-medium
                text-zinc-500
                sm:block
                sm:text-sm
              "
            >
              देश की बड़ी खबरें, अब रील्स में
            </p>

          </div>

        </div>

        {/* ==================================
            ACTIONS
        ================================== */}

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">

          {/* DESKTOP ARROWS */}

          {shorts.length > 7 && (
            <div className="hidden items-center gap-2 sm:flex">

              {/* PREVIOUS */}

              <button
                type="button"
                onClick={
                  handlePrevious
                }
                aria-label="Previous reels"
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-zinc-200
                  bg-white
                  text-zinc-700
                  shadow-sm
                  transition-all
                  hover:border-red-300
                  hover:bg-red-50
                  hover:text-red-600
                  active:scale-95
                "
              >
                <ChevronLeft
                  size={18}
                  strokeWidth={2.5}
                />
              </button>

              {/* NEXT */}

              <button
                type="button"
                onClick={
                  handleNext
                }
                aria-label="Next reels"
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-zinc-200
                  bg-white
                  text-zinc-700
                  shadow-sm
                  transition-all
                  hover:border-red-300
                  hover:bg-red-50
                  hover:text-red-600
                  active:scale-95
                "
              >
                <ChevronRight
                  size={18}
                  strokeWidth={2.5}
                />
              </button>

            </div>
          )}

          {/* ALL REELS */}

          <button
            type="button"
            onClick={() => {
              router.push("/reels");
            }}
            className="
              flex
              items-center
              gap-1
              whitespace-nowrap
              rounded-full
              px-2
              py-2
              text-xs
              font-bold
              text-red-600
              transition-all
              hover:bg-red-50
              active:scale-95
              sm:px-4
              sm:text-sm
            "
          >
            सभी देखें

            <ChevronRight
              size={16}
              strokeWidth={2.5}
            />
          </button>

        </div>

      </div>

      {/* ======================================
          REELS CAROUSEL
      ====================================== */}

      <div
        className="
          relative
          w-full
          overflow-hidden
        "
      >

        <div
          ref={carouselRef}
          className="
            flex
            w-full
            gap-[10px]
            overflow-x-auto
            overflow-y-hidden
            scroll-smooth
            snap-x
            snap-mandatory
            scrollbar-none
            [-ms-overflow-style:none]
            [scrollbar-width:none]
            sm:gap-3
          "
          style={{
            scrollbarWidth: "none",
          }}
        >

          {shorts.map(
            (
              short,
              index
            ) => (

              <article
                key={`${short.id}-${index}`}
                data-reel-card
                onClick={(event) =>
                  openReel(
                    event,
                    short
                  )
                }
                onKeyDown={(
                  event
                ) => {

                  if (
                    event.key ===
                      "Enter" ||
                    event.key ===
                      " "
                  ) {
                    openReel(
                      event,
                      short
                    );
                  }

                }}
                tabIndex={0}
                aria-label={`Open ${
                  short.title ||
                  "reel"
                }`}
                className="
                  group
                  relative
                  shrink-0
                  cursor-pointer
                  snap-start
                  overflow-hidden
                  rounded-xl
                  bg-zinc-950
                  outline-none

                  basis-[calc((100%-10px)/2.15)]

                  sm:basis-[calc((100%-72px)/7)]

                  focus:ring-2
                  focus:ring-red-500
                "
              >

                {/* ==================================
                    VIDEO / THUMBNAIL AREA
                ================================== */}

                <div
                  className="
                    relative
                    aspect-[9/16]
                    w-full
                    overflow-hidden
                    bg-zinc-950
                  "
                >

                  {/* THUMBNAIL */}

                  <Image
                    src={
                      short.thumbnail
                    }
                    alt={
                      short.title ||
                      "News reel"
                    }
                    fill
                    sizes="
                      (min-width: 640px)
                      calc((100vw - 72px) / 7),
                      calc((100vw - 10px) / 2.15)
                    "
                    className="
                      object-cover
                      transition-transform
                      duration-500
                      group-hover:scale-105
                    "
                    priority={
                      index === 0
                    }
                  />

                  {/* TOP GRADIENT */}

                  <div
                    className="
                      pointer-events-none
                      absolute
                      inset-x-0
                      top-0
                      z-[2]
                      h-24
                      bg-gradient-to-b
                      from-black/70
                      to-transparent
                    "
                  />

                  {/* BOTTOM GRADIENT */}

                  <div
                    className="
                      pointer-events-none
                      absolute
                      inset-x-0
                      bottom-0
                      z-[2]
                      h-28
                      bg-gradient-to-t
                      from-black/80
                      to-transparent
                    "
                  />

                  {/* PLAY BUTTON */}

                  <div
                    className="
                      pointer-events-none
                      absolute
                      left-1/2
                      top-1/2
                      z-[3]
                      flex
                      h-10
                      w-10
                      -translate-x-1/2
                      -translate-y-1/2
                      items-center
                      justify-center
                      rounded-full
                      bg-white/90
                      text-red-600
                      shadow-xl
                      transition-all
                      duration-300
                      group-hover:scale-110
                    "
                  >
                    <Play
                      size={16}
                      fill="currentColor"
                      strokeWidth={0}
                      className="ml-0.5"
                    />
                  </div>

                  {/* LOGO WATERMARK */}

                  <div
                    className="
                      pointer-events-none
                      absolute
                      bottom-2
                      right-2
                      z-[3]
                      h-7
                      w-7
                      opacity-45
                      sm:h-8
                      sm:w-8
                    "
                  >
                    <Image
                      src="/logo.webp"
                      alt=""
                      fill
                      sizes="32px"
                      className="object-contain"
                    />
                  </div>

                </div>

                {/* ==================================
                    TITLE
                ================================== */}

                <div
                  className="
                    bg-zinc-950
                    px-2
                    py-2.5
                  "
                >
                  <h3
                    className="
                      line-clamp-2
                      min-h-[34px]
                      text-[10px]
                      font-bold
                      leading-4
                      text-white
                      sm:text-xs
                      sm:leading-4
                    "
                  >
                    {short.title ||
                      "Latest News Reel"}
                  </h3>
                </div>

                {/* HOVER BORDER */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    inset-0
                    z-[4]
                    rounded-xl
                    border
                    border-transparent
                    transition-all
                    duration-300
                    group-hover:border-red-500/60
                  "
                />

              </article>

            )
          )}

        </div>

      </div>

    </section>
  );
}