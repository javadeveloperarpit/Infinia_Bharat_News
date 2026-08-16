"use client";

import {
  BadgeCheck,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

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

/* =========================================================
   OFFICIAL X MARK
========================================================= */

function XLogo({
  size = 14,
}: {
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817-5.964 6.817H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

/* =========================================================
   BLACK CIRCULAR X LOGO
========================================================= */

function XCircle({
  size = 26,
  iconSize = 13,
}: {
  size?: number;
  iconSize?: number;
}) {
  return (
    <span
      className="
        flex
        shrink-0
        items-center
        justify-center
        rounded-full
        bg-black
        text-white
      "
      style={{
        width: size,
        height: size,
      }}
    >
      <XLogo size={iconSize} />
    </span>
  );
}

/* =========================================================
   DATE
========================================================= */

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

/* =========================================================
   PROFILE IMAGE
========================================================= */

function getProfileImage(handle: string) {
  return `https://unavatar.io/x/${handle}`;
}

/* =========================================================
   COMPONENT
========================================================= */

export default function LeadersXCarousel({
  posts,
}: Props) {
  const trackRef =
    useRef<HTMLDivElement>(null);

  const animationRef =
    useRef<number | null>(null);

  const lastTimeRef =
    useRef<number>(0);

  const positionRef =
    useRef<number>(0);

  const pausedRef =
    useRef(false);

  const resumeTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  /* =======================================================
     DRAG
  ======================================================= */

  const isDraggingRef =
    useRef(false);

  const dragStartXRef =
    useRef(0);

  const dragStartPositionRef =
    useRef(0);

  const hasDraggedRef =
    useRef(false);

  const [loopWidth, setLoopWidth] =
    useState(0);

  /* =========================================================
     SPEED
  ========================================================= */

  const SPEED = 120;

  /* =========================================================
     MEASURE FIRST SET
  ========================================================= */

  useEffect(() => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const measure = () => {
      const firstSet =
        track.querySelector(
          "[data-x-set='first']"
        ) as HTMLElement | null;

      if (!firstSet) {
        return;
      }

      setLoopWidth(
        firstSet.offsetWidth
      );
    };

    measure();

    const observer =
      new ResizeObserver(measure);

    observer.observe(track);

    return () => {
      observer.disconnect();
    };
  }, [posts]);

  /* =========================================================
     CONTINUOUS AUTO MOVEMENT
  ========================================================= */

  useEffect(() => {
    if (!loopWidth) {
      return;
    }

    lastTimeRef.current =
      performance.now();

    const animate = (
      currentTime: number
    ) => {
      const delta =
        currentTime -
        lastTimeRef.current;

      lastTimeRef.current =
        currentTime;

      if (!pausedRef.current) {
        positionRef.current +=
          (SPEED * delta) / 1000;

        if (
          positionRef.current >=
          loopWidth
        ) {
          positionRef.current -=
            loopWidth;
        }

        if (trackRef.current) {
          trackRef.current.style.transform =
            `translate3d(${-positionRef.current}px, 0, 0)`;
        }
      }

      animationRef.current =
        requestAnimationFrame(
          animate
        );
    };

    animationRef.current =
      requestAnimationFrame(
        animate
      );

    return () => {
      if (
        animationRef.current !== null
      ) {
        cancelAnimationFrame(
          animationRef.current
        );
      }
    };
  }, [loopWidth]);

  /* =========================================================
     RESUME AUTO SCROLL
  ========================================================= */

  function scheduleResume(
    delay = 1000
  ) {
    if (resumeTimerRef.current) {
      clearTimeout(
        resumeTimerRef.current
      );
    }

    resumeTimerRef.current =
      setTimeout(() => {
        pausedRef.current =
          false;

        lastTimeRef.current =
          performance.now();
      }, delay);
  }

  /* =========================================================
     MANUAL BUTTON MOVE
  ========================================================= */

  function move(
    direction: "left" | "right"
  ) {
    if (!loopWidth) {
      return;
    }

    pausedRef.current = true;

    const card =
      trackRef.current?.querySelector(
        "[data-x-card]"
      ) as HTMLElement | null;

    if (!card) {
      return;
    }

    const gap = 8;

    const amount =
      card.offsetWidth + gap;

    if (
      direction === "right"
    ) {
      positionRef.current +=
        amount;

      while (
        positionRef.current >=
        loopWidth
      ) {
        positionRef.current -=
          loopWidth;
      }
    } else {
      positionRef.current -=
        amount;

      while (
        positionRef.current < 0
      ) {
        positionRef.current +=
          loopWidth;
      }
    }

    if (trackRef.current) {
      trackRef.current.style.transform =
        `translate3d(${-positionRef.current}px, 0, 0)`;
    }

    scheduleResume(1200);
  }

  /* =========================================================
     POINTER DOWN
  ========================================================= */

  function handlePointerDown(
    event: React.PointerEvent<HTMLDivElement>
  ) {
    if (!loopWidth) {
      return;
    }

    isDraggingRef.current =
      true;

    hasDraggedRef.current =
      false;

    dragStartXRef.current =
      event.clientX;

    dragStartPositionRef.current =
      positionRef.current;

    pausedRef.current =
      true;

    event.currentTarget.setPointerCapture(
      event.pointerId
    );
  }

  /* =========================================================
     POINTER MOVE
  ========================================================= */

  function handlePointerMove(
    event: React.PointerEvent<HTMLDivElement>
  ) {
    if (
      !isDraggingRef.current ||
      !loopWidth
    ) {
      return;
    }

    const delta =
      event.clientX -
      dragStartXRef.current;

    if (
      Math.abs(delta) > 5
    ) {
      hasDraggedRef.current =
        true;
    }

    let nextPosition =
      dragStartPositionRef.current -
      delta;

    while (
      nextPosition < 0
    ) {
      nextPosition +=
        loopWidth;
    }

    while (
      nextPosition >=
      loopWidth
    ) {
      nextPosition -=
        loopWidth;
    }

    positionRef.current =
      nextPosition;

    if (trackRef.current) {
      trackRef.current.style.transform =
        `translate3d(${-nextPosition}px, 0, 0)`;
    }
  }

  /* =========================================================
     POINTER UP
  ========================================================= */

  function handlePointerUp(
    event: React.PointerEvent<HTMLDivElement>
  ) {
    if (
      !isDraggingRef.current
    ) {
      return;
    }

    isDraggingRef.current =
      false;

    try {
      event.currentTarget.releasePointerCapture(
        event.pointerId
      );
    } catch {}

    scheduleResume(1000);

    /*
     * Reset after click handling has finished.
     */
    setTimeout(() => {
      hasDraggedRef.current =
        false;
    }, 50);
  }

  /* =========================================================
     HORIZONTAL WHEEL
  ========================================================= */

  function handleWheel(
    event: React.WheelEvent<HTMLDivElement>
  ) {
    if (!loopWidth) {
      return;
    }

    const delta =
      Math.abs(event.deltaX) >
      Math.abs(event.deltaY)
        ? event.deltaX
        : event.shiftKey
          ? event.deltaY
          : 0;

    if (!delta) {
      return;
    }

    event.preventDefault();

    pausedRef.current =
      true;

    let nextPosition =
      positionRef.current +
      delta;

    while (
      nextPosition < 0
    ) {
      nextPosition +=
        loopWidth;
    }

    while (
      nextPosition >=
      loopWidth
    ) {
      nextPosition -=
        loopWidth;
    }

    positionRef.current =
      nextPosition;

    if (trackRef.current) {
      trackRef.current.style.transform =
        `translate3d(${-nextPosition}px, 0, 0)`;
    }

    scheduleResume(1000);
  }

  /* =========================================================
     CLEANUP
  ========================================================= */

  useEffect(() => {
    return () => {
      if (
        resumeTimerRef.current
      ) {
        clearTimeout(
          resumeTimerRef.current
        );
      }

      if (
        animationRef.current
      ) {
        cancelAnimationFrame(
          animationRef.current
        );
      }
    };
  }, []);

  /* =========================================================
     EMPTY
  ========================================================= */

  if (!posts.length) {
    return null;
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <section
      className="
        relative
        overflow-hidden
        bg-white
        py-3
        sm:py-4
      "
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="
          mx-auto
          mb-2
          max-w-[1400px]
          px-3
          sm:mb-3
          sm:px-4
        "
      >
        <div
          className="
            flex
            items-center
            justify-between
          "
        >
          {/* TITLE */}

          <div className="min-w-0">
            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <span
                className="
                  relative
                  h-6
                  w-1
                  overflow-hidden
                  rounded-full
                  bg-red-600
                  sm:h-7
                "
              >
                <span
                  className="
                    absolute
                    left-1/2
                    top-1/2
                    h-1.5
                    w-1.5
                    -translate-x-1/2
                    -translate-y-1/2
                    rounded-full
                    bg-white
                    animate-pulse
                  "
                />
              </span>

              <div
                className="
                  flex
                  items-center
                  gap-1.5
                "
              >
                <h2
                  className="
                    text-base
                    font-black
                    tracking-tight
                    text-zinc-900
                    sm:text-xl
                  "
                >
                  Leaders on
                </h2>

                <XCircle
                  size={22}
                  iconSize={18}
                />
              </div>
            </div>

            <div
              className="
                mt-0.5
                flex
                items-center
                gap-1.5
                text-[9px]
                text-zinc-500
                sm:mt-1
                sm:text-xs
              "
            >
              <span
                className="
                  h-1.5
                  w-1.5
                  rounded-full
                  bg-red-500
                "
              />

              <span>
                Latest posts from India's
                public figures
              </span>
            </div>
          </div>

          {/* DESKTOP CONTROLS */}

          <div
            className="
              hidden
              gap-1.5
              sm:flex
            "
          >
            <button
              type="button"
              onClick={() =>
                move("left")
              }
              aria-label="Previous posts"
              className="
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-full
                border
                border-zinc-200
                bg-white
                text-zinc-700
                shadow-sm
                transition
                hover:bg-zinc-100
                active:scale-95
              "
            >
              <ChevronLeft
                size={15}
              />
            </button>

            <button
              type="button"
              onClick={() =>
                move("right")
              }
              aria-label="Next posts"
              className="
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-full
                border
                border-zinc-200
                bg-white
                text-zinc-700
                shadow-sm
                transition
                hover:bg-zinc-100
                active:scale-95
              "
            >
              <ChevronRight
                size={15}
              />
            </button>
          </div>
        </div>
      </div>

      {/* =================================================
          CAROUSEL VIEWPORT
      ================================================= */}

      <div
        className="
          relative
          overflow-hidden
          cursor-grab
          active:cursor-grabbing
          select-none
          touch-pan-y
        "
        onMouseEnter={() => {
          if (
            !isDraggingRef.current
          ) {
            pausedRef.current =
              true;
          }
        }}
        onMouseLeave={() => {
          if (
            isDraggingRef.current
          ) {
            return;
          }

          pausedRef.current =
            false;

          lastTimeRef.current =
            performance.now();
        }}
        onPointerDown={
          handlePointerDown
        }
        onPointerMove={
          handlePointerMove
        }
        onPointerUp={
          handlePointerUp
        }
        onPointerCancel={
          handlePointerUp
        }
        onWheel={handleWheel}
      >
        {/* =================================================
            MOVING TRACK
        ================================================= */}

        <div
          ref={trackRef}
          className="
            flex
            w-max
            gap-2
            will-change-transform
          "
          style={{
            touchAction: "pan-y",
          }}
        >
          {/* FIRST SET */}

          <div
            data-x-set="first"
            className="
              flex
              shrink-0
              gap-2
              px-3
            "
          >
            {posts.map(
              (
                post,
                index
              ) => (
                <XCard
                  key={`first-${post.handle}-${post.pubDate}-${index}`}
                  post={post}
                  profileImage={getProfileImage(
                    post.handle
                  )}
                  isDragging={
                    hasDraggedRef
                  }
                />
              )
            )}
          </div>

          {/* SECOND SET */}

          <div
            data-x-set="second"
            className="
              flex
              shrink-0
              gap-2
              pr-3
            "
          >
            {posts.map(
              (
                post,
                index
              ) => (
                <XCard
                  key={`second-${post.handle}-${post.pubDate}-${index}`}
                  post={post}
                  profileImage={getProfileImage(
                    post.handle
                  )}
                  isDragging={
                    hasDraggedRef
                  }
                />
              )
            )}
          </div>
        </div>

        {/* MOBILE FADE */}

        <div
          className="
            pointer-events-none
            absolute
            right-0
            top-0
            h-full
            w-8
            bg-gradient-to-l
            from-white
            to-transparent
            sm:hidden
          "
        />
      </div>
    </section>
  );
}

/* =========================================================
   X CARD
========================================================= */

function XCard({
  post,
  profileImage,
  isDragging,
}: {
  post: XPost;
  profileImage: string;
  isDragging: React.MutableRefObject<boolean>;
}) {
  return (
    <a
      data-x-card
      href={post.link}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(event) => {
        /*
         * Prevent accidental opening when
         * the user dragged/swiped the carousel.
         */
        if (isDragging.current) {
          event.preventDefault();
        }
      }}
      className="
        group
        flex
        h-[138px]
        w-[205px]
        min-w-[205px]
        flex-col
        overflow-hidden
        rounded-xl
        border
        border-zinc-200
        bg-white
        p-2
        shadow-[0_2px_7px_rgba(0,0,0,0.045)]
        transition
        duration-300
        hover:-translate-y-0.5
        hover:shadow-md

        sm:h-[205px]
        sm:w-[315px]
        sm:min-w-[315px]
        sm:p-3
      "
    >
      {/* USER */}

      <div
        className="
          flex
          items-center
          gap-1.5
        "
      >
        <div
          className="
            h-7
            w-7
            shrink-0
            overflow-hidden
            rounded-full
            bg-zinc-200
            sm:h-9
            sm:w-9
          "
        >
          <img
            src={profileImage}
            alt={post.person}
            loading="lazy"
            className="
              h-full
              w-full
              object-cover
            "
          />
        </div>

        <div
          className="
            min-w-0
            flex-1
          "
        >
          <div
            className="
              flex
              items-center
              gap-0.5
            "
          >
            <span
              className="
                truncate
                text-[11px]
                font-bold
                text-zinc-900
                sm:text-xs
              "
            >
              {post.person}
            </span>

            <BadgeCheck
              size={12}
              strokeWidth={2.5}
              fill="#1d9bf0"
              color="white"
              className="shrink-0"
            />
          </div>

          <div
            className="
              truncate
              text-[9px]
              text-zinc-500
              sm:text-[10px]
            "
          >
            @{post.handle}
          </div>
        </div>

        <XCircle
          size={21}
          iconSize={15}
        />
      </div>

      {/* POST */}

      <div
        className="
          mt-1.5
          line-clamp-2
          break-words
          text-[11px]
          leading-[1.35]
          text-zinc-800
          sm:mt-2
          sm:line-clamp-3
          sm:text-[13px]
          sm:leading-[1.4]
        "
      >
        {post.title}

        <span
          className="
            ml-1
            font-semibold
            text-zinc-400
          "
        >
          ...
        </span>
      </div>

      {/* IMAGE */}

      {post.image && (
        <div
          className="
            mt-1.5
            overflow-hidden
            rounded-lg
            border
            border-zinc-200
            bg-zinc-100
            sm:mt-2
          "
        >
          <img
            src={post.image}
            alt=""
            loading="lazy"
            className="
              h-[42px]
              w-full
              object-cover
              transition-transform
              duration-500
              group-hover:scale-[1.03]
              sm:h-[78px]
            "
          />
        </div>
      )}

      {/* FOOTER */}

      <div
        className="
          mt-auto
          flex
          items-center
          justify-between
          gap-2
          border-t
          border-zinc-100
          pt-1.5
          sm:pt-2
        "
      >
        <div
          className="
            flex
            items-center
            gap-1
          "
        >
          <XCircle
            size={18}
            iconSize={12}
          />

          <div
            className="
              flex
              flex-col
              leading-tight
            "
          >
            <span
              className="
                text-[7px]
                font-bold
                uppercase
                tracking-wide
                text-zinc-600
                sm:text-[8px]
              "
            >
              Posted on X
            </span>

            <span
              className="
                text-[7px]
                text-zinc-400
                sm:text-[8px]
              "
            >
              {formatPostDate(
                post.pubDate
              )}
            </span>
          </div>
        </div>

        <div
          className="
            flex
            items-center
            gap-0.5
            text-[8px]
            font-semibold
            text-zinc-400
            transition-colors
            group-hover:text-[#1d9bf0]
            sm:text-[9px]
          "
        >
          View
          <ExternalLink
            size={9}
          />
        </div>
      </div>
    </a>
  );
}