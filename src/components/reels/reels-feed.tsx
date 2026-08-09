"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  PublicShort,
} from "@/services/public/shorts.public.service";

import ShortPlayer from "./short-player";

interface ReelsFeedProps {
  shorts: PublicShort[];
  initialIndex?: number;
}


export default function ReelsFeed({
  shorts,
  initialIndex = 0,
}: ReelsFeedProps) {
  const containerRef =
    useRef<HTMLDivElement | null>(null);

  const [activeIndex, setActiveIndex] =
  useState(initialIndex);

  // ==========================================
  // FIND STARTING INDEX FROM URL
  // ==========================================

  useEffect(() => {
  if (!shorts.length) return;

  const container =
    containerRef.current;

  if (!container) return;

  const item =
    container.querySelector(
      `[data-short="${initialIndex}"]`
    ) as HTMLElement | null;

  if (!item) return;

  setActiveIndex(initialIndex);

  requestAnimationFrame(() => {
    container.scrollTo({
      top: item.offsetTop,
      behavior: "auto",
    });
  });
}, [
  shorts,
  initialIndex,
]);

  // ==========================================
  // OBSERVE ACTIVE SHORT
  // ==========================================

  useEffect(() => {
    const container =
      containerRef.current;

    if (!container) return;

    const items =
      Array.from(
        container.querySelectorAll(
          "[data-short]"
        )
      );

    if (!items.length) return;

    const observer =
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (
              entry.isIntersecting &&
              entry.intersectionRatio > 0.65
            ) {
              const index =
                Number(
                  (
                    entry.target as HTMLElement
                  ).dataset.short
                );

              if (
                Number.isInteger(index)
              ) {
                setActiveIndex(index);
              }
            }
          });
        },
        {
          root: container,
          threshold: [0.65],
        }
      );

    items.forEach((item) => {
      observer.observe(item);
    });

    return () => {
      observer.disconnect();
    };
  }, [shorts]);

  // ==========================================
  // CHANGE URL WHEN ACTIVE REEL CHANGES
  // ==========================================

  useEffect(() => {
    if (!shorts.length) return;

    const activeShort =
      shorts[activeIndex];

    if (!activeShort) return;

    const newUrl =
      `/reel/${encodeURIComponent(
        activeShort.id
      )}`;

    if (
      window.location.pathname === newUrl
    ) {
      return;
    }

    window.history.replaceState(
      null,
      "",
      newUrl
    );
  }, [
    activeIndex,
    shorts,
  ]);

  // ==========================================
  // EMPTY
  // ==========================================

  if (!shorts.length) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black text-white">
        No Shorts available.
      </div>
    );
  }

  // ==========================================
  // FEED
  // ==========================================

  return (
    <div
      ref={containerRef}
      className="
        h-screen
        w-full
        overflow-y-auto
        overflow-x-hidden
        snap-y
        snap-mandatory
        scrollbar-none
      "
    >
      {shorts.map(
        (short, index) => (
          <div
            key={short.id}
            data-short={index}
            className="
              h-full
              w-full
              shrink-0
              snap-start
            "
          >
            <ShortPlayer
              short={short}
              active={
                index === activeIndex
              }
            />
          </div>
        )
      )}
    </div>
  );
}