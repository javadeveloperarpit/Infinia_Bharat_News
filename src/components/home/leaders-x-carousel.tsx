"use client";

import {
  BriefcaseBusiness,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export interface JobOpportunity {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location?: string;
  type?: "job" | "internship" | "program" | "opportunity";
  employmentType?: string;
  workMode?: string;
  field?: string;
  link: string;
  applicationEnd?: string;
}

interface Props {
  opportunities: JobOpportunity[];
}

/* =========================================================
   DATE
========================================================= */

function formatDate(date?: string) {
  if (!date) return "";

  const d = new Date(date);

  if (isNaN(d.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(d);
}

/* =========================================================
   COMPANY INITIALS
========================================================= */

function getInitials(company: string) {
  return company
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

/* =========================================================
   OPPORTUNITY TYPE
========================================================= */

function getTypeLabel(
  type?: JobOpportunity["type"]
) {
  switch (type) {
    case "internship":
      return "Internship";

    case "program":
      return "Program";

    case "opportunity":
      return "Opportunity";

    default:
      return "Job";
  }
}

/* =========================================================
   COMPONENT
========================================================= */

export default function LeadersXCarousel({
  opportunities,
}: Props) {
  const trackRef =
    useRef<HTMLDivElement>(null);

  const carouselRef =
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

    let frameId: number | null = null;

    const measure = () => {
      const firstSet =
        track.querySelector(
          "[data-jobs-set='first']"
        ) as HTMLElement | null;

      if (!firstSet) {
        return;
      }

      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }

      frameId = requestAnimationFrame(() => {
        const width =
          firstSet.getBoundingClientRect().width;

        setLoopWidth((previousWidth) =>
          Math.round(previousWidth) ===
          Math.round(width)
            ? previousWidth
            : width
        );

        frameId = null;
      });
    };

    measure();

    const observer =
      new ResizeObserver(measure);

    observer.observe(track);

    return () => {
      observer.disconnect();

      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [opportunities]);

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

    const gap = 8;

    const isDesktop =
      window.matchMedia(
        "(min-width: 640px)"
      ).matches;

    const cardWidth =
      isDesktop
        ? 315
        : 205;

    const amount =
      cardWidth + gap;

    if (direction === "right") {
      positionRef.current += amount;

      while (
        positionRef.current >=
        loopWidth
      ) {
        positionRef.current -=
          loopWidth;
      }
    } else {
      positionRef.current -= amount;

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

  isDraggingRef.current = true;
  hasDraggedRef.current = false;

  dragStartXRef.current = event.clientX;
  dragStartPositionRef.current =
    positionRef.current;

  pausedRef.current = true;

  try {
    event.currentTarget.setPointerCapture(
      event.pointerId
    );
  } catch {}
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
    event.clientX - dragStartXRef.current;

  if (Math.abs(delta) > 5) {
    hasDraggedRef.current = true;
  }

  let nextPosition =
    dragStartPositionRef.current - delta;

  while (nextPosition < 0) {
    nextPosition += loopWidth;
  }

  while (nextPosition >= loopWidth) {
    nextPosition -= loopWidth;
  }

  positionRef.current = nextPosition;

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

    setTimeout(() => {
      hasDraggedRef.current =
        false;
    }, 50);
  }

  /* =========================================================
     HORIZONTAL WHEEL
  ========================================================= */

function handleWheel(event: WheelEvent) {
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

  pausedRef.current = true;

  let nextPosition =
    positionRef.current + delta;

  while (nextPosition < 0) {
    nextPosition += loopWidth;
  }

  while (nextPosition >= loopWidth) {
    nextPosition -= loopWidth;
  }

  positionRef.current = nextPosition;

  if (trackRef.current) {
    trackRef.current.style.transform =
      `translate3d(${-nextPosition}px, 0, 0)`;
  }

  scheduleResume(1000);
}
/* =========================================================
   NON-PASSIVE WHEEL LISTENER
========================================================= */

useEffect(() => {
  const element = carouselRef.current;

  if (!element) {
    return;
  }

  const wheelHandler = (event: WheelEvent) => {
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

    handleWheel(event);
  };

  element.addEventListener(
    "wheel",
    wheelHandler,
    {
      passive: false,
    }
  );

  return () => {
    element.removeEventListener(
      "wheel",
      wheelHandler
    );
  };
}, [loopWidth]);

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

  if (!opportunities.length) {
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
      {/* HEADER */}

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
                  bg-[#C8102E]
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
                <BriefcaseBusiness
                  size={20}
                  strokeWidth={2.4}
                  className="text-[#C8102E]"
                />

                <h2
                  className="
                    text-base
                    font-black
                    tracking-tight
                    text-zinc-900
                    sm:text-xl
                  "
                >
                  Top Companies Hiring
                </h2>
              </div>
            </div>

            <div
              className="
                mt-0.5
                flex
                items-center
                gap-1.5
                text-[10px]
                font-medium
                text-zinc-600
                sm:mt-1
                sm:text-xs
              "
            >
              <span
                className="
                  h-1.5
                  w-1.5
                  rounded-full
                  bg-[#C8102E]
                "
              />

              <span>
                Latest jobs, internships &
                career opportunities
              </span>
            </div>
          </div>

          {/* DESKTOP CONTROLS */}

{/* SEE ALL + DESKTOP CONTROLS */}

<div
  className="
    flex
    items-center
    gap-1.5
  "
>
  {/* SEE ALL JOBS */}

  <a
    href="/jobs"
    className="
      group
      flex
      items-center
      gap-1
      rounded-full
      border
      border-[#C8102E]/20
      bg-[#fff1f3]
      px-2.5
      py-1.5
      text-[10px]
      font-bold
      text-[#C8102E]
      transition
      duration-200
      hover:border-[#C8102E]
      hover:bg-[#C8102E]
      hover:text-white
      sm:px-3
      sm:text-[11px]
    "
  >
    <span>See all jobs</span>

    <ChevronRight
      size={13}
      strokeWidth={2.5}
      className="
        transition-transform
        duration-200
        group-hover:translate-x-0.5
      "
    />
  </a>

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
      aria-label="Previous opportunities"
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
        hover:bg-[#fff1f3]
        hover:text-[#C8102E]
        active:scale-95
      "
    >
      <ChevronLeft size={15} />
    </button>

    <button
      type="button"
      onClick={() =>
        move("right")
      }
      aria-label="Next opportunities"
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
        hover:bg-[#fff1f3]
        hover:text-[#C8102E]
        active:scale-95
      "
    >
      <ChevronRight size={15} />
    </button>
  </div>
</div>
        </div>
      </div>

      {/* CAROUSEL VIEWPORT */}

      <div
  ref={carouselRef}
  className="
    relative
    cursor-grab
    select-none
    overflow-hidden
    active:cursor-grabbing
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
      >
        {/* MOVING TRACK */}

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
            data-jobs-set="first"
            className="
              flex
              shrink-0
              gap-2
              px-3
            "
          >
            {opportunities.map(
              (
                opportunity,
                index
              ) => (
                <JobOpportunityCard
                  key={`first-${opportunity.id}-${index}`}
                  opportunity={opportunity}
                  isDragging={
                    hasDraggedRef
                  }
                />
              )
            )}
          </div>

          {/* SECOND SET */}

          <div
            data-jobs-set="second"
            className="
              flex
              shrink-0
              gap-2
              pr-3
            "
          >
            {opportunities.map(
              (
                opportunity,
                index
              ) => (
                <JobOpportunityCard
                  key={`second-${opportunity.id}-${index}`}
                  opportunity={opportunity}
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
   JOB OPPORTUNITY CARD
========================================================= */

function JobOpportunityCard({
  opportunity,
  isDragging,
}: {
  opportunity: JobOpportunity;
  isDragging: React.MutableRefObject<boolean>;
}) {
  const typeLabel =
    getTypeLabel(
      opportunity.type
    );

  const isInternship =
    opportunity.type ===
    "internship";

  return (
   <a
  data-job-opportunity-card
  href={opportunity.link}
  target="_blank"
  rel="noopener noreferrer"
  draggable={false}
  onClick={(event) => {
    if (isDragging.current) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    // Genuine click — allow normal external navigation
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
        hover:border-[#f0b8c2]
        hover:shadow-md

        sm:h-[205px]
        sm:w-[315px]
        sm:min-w-[315px]
        sm:p-3
      "
    >
      {/* COMPANY */}

      <div
        className="
          flex
          items-center
          gap-1.5
        "
      >
        <div
          className="
            flex
            h-7
            w-7
            shrink-0
            items-center
            justify-center
            overflow-hidden
            rounded-full
            border
            border-zinc-200
            bg-zinc-50
            text-[9px]
            font-black
            text-[#C8102E]
            sm:h-9
            sm:w-9
            sm:text-[10px]
          "
        >
          {opportunity.companyLogo ? (
            <Image
              src={
                opportunity.companyLogo
              }
              alt=""
              width={64}
              height={64}
              sizes="(max-width: 640px) 28px, 36px"
              className="
                h-full
                w-full
                object-contain
                p-1
              "
            />
          ) : (
            getInitials(
              opportunity.company
            )
          )}
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
              gap-1
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
              {opportunity.company}
            </span>
          </div>

          <div
            className="
              truncate
              text-[10px]
              font-medium
              text-zinc-500
              sm:text-[11px]
            "
          >
            Official career opportunity
          </div>
        </div>

        <span
          className="
            flex
            h-6
            shrink-0
            items-center
            gap-1
            rounded-full
            bg-[#fff1f3]
            px-2
            text-[9px]
            font-bold
            text-[#C8102E]
            sm:h-7
            sm:px-2.5
            sm:text-[10px]
          "
        >
          {isInternship ? (
            <GraduationCap
              size={11}
            />
          ) : (
            <BriefcaseBusiness
              size={11}
            />
          )}

          {typeLabel}
        </span>
      </div>

      {/* TITLE */}

      <div
        className="
          mt-1.5
          line-clamp-2
          break-words
          text-[11px]
          font-semibold
          leading-[1.35]
          text-zinc-900
          transition-colors
          group-hover:text-[#C8102E]
          sm:mt-2
          sm:text-[13px]
          sm:leading-[1.4]
        "
      >
        {opportunity.title}
      </div>

      {/* DETAILS */}

      <div
        className="
          mt-1
          flex
          min-w-0
          flex-wrap
          items-center
          gap-x-1.5
          gap-y-0.5
          text-[9px]
          font-medium
          text-zinc-500
          sm:mt-1.5
          sm:text-[10px]
        "
      >
        {opportunity.location && (
          <span className="truncate">
            📍 {opportunity.location}
          </span>
        )}

        {opportunity.employmentType && (
          <span>
            · {opportunity.employmentType}
          </span>
        )}
      </div>

      {/* OPTIONAL WORK MODE */}

      {opportunity.workMode && (
        <div
          className="
            mt-1
            truncate
            text-[9px]
            font-semibold
            text-zinc-500
            sm:text-[10px]
          "
        >
          {opportunity.workMode}
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
            min-w-0
            items-center
            gap-1
          "
        >
          <span
            className="
              h-1.5
              w-1.5
              shrink-0
              rounded-full
              bg-[#188038]
            "
          />

          <div
            className="
              truncate
              text-[9px]
              font-bold
              uppercase
              tracking-wide
              text-zinc-600
              sm:text-[10px]
            "
          >
            {opportunity.applicationEnd
              ? `Apply by ${formatDate(
                  opportunity.applicationEnd
                )}`
              : "Currently open"}
          </div>
        </div>

        <div
          className="
            flex
            shrink-0
            items-center
            gap-1
            text-[10px]
            font-bold
            text-[#C8102E]
            transition-colors
            sm:text-[11px]
          "
        >
          View
          <ExternalLink size={11} />
        </div>
      </div>
    </a>
  );
}