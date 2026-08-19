"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import Image from "next/image";

import {
  ChevronLeft,
  ChevronRight,
  Play,
  Loader2,
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
// GET YOUTUBE ID
// ==========================================

function getYoutubeId(short: Short): string | null {
  if (short.id) {
    return short.id;
  }

  try {
    const url = new URL(short.url);

    if (url.hostname.includes("youtube.com")) {
      if (url.pathname.startsWith("/shorts/")) {
        return url.pathname.split("/")[2] || null;
      }

      return url.searchParams.get("v") || null;
    }

    if (url.hostname === "youtu.be") {
      return url.pathname.replace("/", "") || null;
    }
  } catch {
    // Ignore invalid URL
  }

  return null;
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

  const [playingIndex, setPlayingIndex] =
    useState<number | null>(null);

  const [loadingIndex, setLoadingIndex] =
    useState<number | null>(null);

  const timersRef =
    useRef<
      Record<
        number,
        ReturnType<typeof setTimeout>
      >
    >({});

  // ==========================================
  // CLEAR TIMER
  // ==========================================

  const clearPlayTimer = useCallback(
    (index: number) => {
      const timer = timersRef.current[index];

      if (timer) {
        clearTimeout(timer);
        delete timersRef.current[index];
      }
    },
    []
  );

  // ==========================================
  // STOP ALL PREVIEWS
  // ==========================================

  const stopAll = useCallback(() => {
    Object.keys(timersRef.current).forEach(
      (key) => {
        clearPlayTimer(Number(key));
      }
    );

    setPlayingIndex(null);
    setLoadingIndex(null);
  }, [clearPlayTimer]);

  // ==========================================
  // DELAYED AUTOPLAY
  // ==========================================

  const startDelayedPlay = useCallback(
    (index: number) => {
      clearPlayTimer(index);

      // Already playing
      if (playingIndex === index) {
        return;
      }

      setLoadingIndex(index);

      timersRef.current[index] = setTimeout(() => {
        setPlayingIndex(index);
        setLoadingIndex(null);

        delete timersRef.current[index];
      }, 1200);
    },
    [clearPlayTimer, playingIndex]
  );

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

    stopAll();

    router.push(
      `/reel/${encodeURIComponent(short.id)}`
    );
  }

  // ==========================================
  // GET CARD WIDTH
  // ==========================================

  function getScrollAmount() {
    const container = carouselRef.current;

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
      window.getComputedStyle(container);

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
    const container = carouselRef.current;

    if (!container) {
      return;
    }

    stopAll();

    const amount = getScrollAmount();

    const maxScroll =
      container.scrollWidth -
      container.clientWidth;

    if (container.scrollLeft >= maxScroll - 10) {
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
    const container = carouselRef.current;

    if (!container) {
      return;
    }

    stopAll();

    const amount = getScrollAmount();

    if (container.scrollLeft <= 10) {
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
  // VISIBILITY AUTOPLAY
  // ==========================================

  useEffect(() => {
    const container = carouselRef.current;

    if (!container) {
      return;
    }

    const cards = Array.from(
      container.querySelectorAll(
        "[data-reel-card]"
      )
    );

    const observer = new IntersectionObserver(
      (entries) => {
        let bestVisibleIndex: number | null =
          null;

        let bestRatio = 0;

        entries.forEach((entry) => {
          if (
            entry.isIntersecting &&
            entry.intersectionRatio >= 0.75 &&
            entry.intersectionRatio > bestRatio
          ) {
            const element =
              entry.target as HTMLElement;

            bestVisibleIndex = Number(
              element.dataset.index
            );

            bestRatio =
              entry.intersectionRatio;
          }
        });

        if (bestVisibleIndex !== null) {
          startDelayedPlay(bestVisibleIndex);
        }

        entries.forEach((entry) => {
          const element =
            entry.target as HTMLElement;

          const index = Number(
            element.dataset.index
          );

          if (
            !entry.isIntersecting ||
            entry.intersectionRatio < 0.75
          ) {
            clearPlayTimer(index);

            setLoadingIndex((current) =>
              current === index
                ? null
                : current
            );

            setPlayingIndex((current) =>
              current === index
                ? null
                : current
            );
          }
        });
      },
      {
        root: container,
        threshold: [
          0,
          0.25,
          0.5,
          0.75,
          1,
        ],
      }
    );

    cards.forEach((card) => {
      observer.observe(card);
    });

    return () => {
      observer.disconnect();

      Object.keys(timersRef.current).forEach(
        (key) => {
          clearPlayTimer(Number(key));
        }
      );
    };
  }, [
    shorts,
    startDelayedPlay,
    clearPlayTimer,
  ]);

  // ==========================================
  // CLEANUP
  // ==========================================

  useEffect(() => {
    return () => {
      Object.values(
        timersRef.current
      ).forEach((timer) => {
        clearTimeout(timer);
      });
    };
  }, []);

  // ==========================================
  // EMPTY
  // ==========================================

  if (!shorts || shorts.length === 0) {
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

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {/* DESKTOP ARROWS */}

          {shorts.length > 7 && (
            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                onClick={handlePrevious}
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

              <button
                type="button"
                onClick={handleNext}
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
              stopAll();
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
          {shorts.map((short, index) => {
            const youtubeId =
              getYoutubeId(short);

            const isPlaying =
              playingIndex === index;

            const isLoading =
              loadingIndex === index;

            return (
              <article
                key={`${short.id}-${index}`}
                data-reel-card
                data-index={index}
                onClick={(event) =>
                  openReel(event, short)
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" ||
                    event.key === " "
                  ) {
                    openReel(event, short);
                  }
                }}
                tabIndex={0}
      
                aria-label={`Open ${
                  short.title || "reel"
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
                {/* VIDEO AREA */}

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
                    src={short.thumbnail}
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
                      transition-opacity
                      duration-500
                    "
                    priority={index === 0}
                  />

                  {/* VIDEO PREVIEW */}

                  {isPlaying &&
                    youtubeId && (
                      <iframe
                        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&playsinline=1&rel=0&modestbranding=1&loop=1&playlist=${youtubeId}`}
                        title={
                          short.title ||
                          "News reel preview"
                        }
                        className="
                          pointer-events-none
                          absolute
                          inset-0
                          z-[1]
                          h-full
                          w-full
                          border-0
                        "
                        allow="
                          autoplay;
                          encrypted-media;
                          picture-in-picture
                        "
                      />
                    )}

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

                  {/* LOADER */}

                  {isLoading &&
                    !isPlaying && (
                      <div
                        className="
                          absolute
                          left-1/2
                          top-1/2
                          z-[3]
                          -translate-x-1/2
                          -translate-y-1/2
                        "
                      >
                        <div
                          className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-full
                            bg-black/55
                            backdrop-blur-md
                          "
                        >
                          <Loader2
                            size={20}
                            className="
                              animate-spin
                              text-white
                            "
                          />
                        </div>
                      </div>
                    )}

                  {/* PLAY BUTTON */}

                  {!isPlaying &&
                    !isLoading && (
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
                    )}

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

                {/* TITLE */}

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

                {/* ACTIVE BORDER */}

                {isPlaying && (
                  <div
                    className="
                      pointer-events-none
                      absolute
                      inset-0
                      z-[5]
                      rounded-xl
                      border-2
                      border-red-500
                      shadow-[0_0_22px_rgba(239,68,68,0.25)]
                    "
                  />
                )}

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
            );
          })}
        </div>
      </div>
    </section>
  );
}