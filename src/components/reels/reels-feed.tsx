"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import Image from "next/image";

import type {
  PublicShort,
} from "@/services/public/shorts.public.service";

import ShortPlayer from "./short-player";
import templateImage from "./template.png";

interface ReelsFeedProps {
  shorts: PublicShort[];
  initialIndex?: number;
}

interface ShortsVideoAd {
  id: string;
  title?: string;

  type: "shorts_video";

  active: boolean;

  mobileEnabled?: boolean;
  desktopEnabled?: boolean;

  videoUrl?: string;
  videoType?: "youtube" | "mp4";
  videoOrientation?:
    | "vertical"
    | "horizontal"
    | "auto";

  duration?: number;
  autoplay?: boolean;
  muted?: boolean;

  videoPoster?: string;
}

type FeedItem =
  | {
      kind: "reel";
      data: PublicShort;
      reelIndex: number;
    }
  | {
      kind: "ad";
      data: ShortsVideoAd;
      adIndex: number;
    };

const GITHUB_ADS_URL =
  "https://raw.githubusercontent.com/javadeveloperarpit/Infinia_Bharat_News/main/public/data/ads.json";


// ======================================================
// RANDOM INTERVAL
// 2 → 10 REELS
// ======================================================

function getRandomInterval() {
  return Math.floor(Math.random() * 9) + 2;
}


// ======================================================
// YOUTUBE ID
// ======================================================

function getYouTubeId(url: string) {
  try {
    const parsed = new URL(url);

    // youtube.com/shorts/VIDEO_ID
    if (
      parsed.hostname.includes("youtube.com") &&
      parsed.pathname.startsWith("/shorts/")
    ) {
      return parsed.pathname
        .split("/shorts/")[1]
        ?.split("/")[0] || null;
    }

    // youtube.com/watch?v=VIDEO_ID
    if (
      parsed.hostname.includes("youtube.com") &&
      parsed.pathname === "/watch"
    ) {
      return parsed.searchParams.get("v");
    }

    // youtube.com/embed/VIDEO_ID
    if (
      parsed.hostname.includes("youtube.com") &&
      parsed.pathname.startsWith("/embed/")
    ) {
      return parsed.pathname
        .split("/embed/")[1]
        ?.split("/")[0] || null;
    }

    // youtu.be/VIDEO_ID
    if (
      parsed.hostname.includes("youtu.be")
    ) {
      return parsed.pathname
        .slice(1)
        .split("/")[0] || null;
    }

    return null;
  } catch {
    return null;
  }
}


// ======================================================
// SHORTS AD PLAYER
// EXACT SAME FRAME AS SHORTPLAYER
// ======================================================

function ShortsAdPlayer({
  ad,
  active,
}: {
  ad: ShortsVideoAd;
  active: boolean;
}) {
  const youtubeId =
    ad.videoUrl
      ? getYouTubeId(ad.videoUrl)
      : null;

  const [isPlaying, setIsPlaying] =
    useState(
      ad.autoplay !== false
    );

  useEffect(() => {
    if (!active) {
      setIsPlaying(false);
      return;
    }

    setIsPlaying(
      ad.autoplay !== false
    );
  }, [
    active,
    ad.autoplay,
  ]);


  // ====================================================
  // COMMON AD CONTENT
  // ====================================================

  let videoContent: React.ReactNode;


  // ====================================================
  // YOUTUBE AD
  // ====================================================

  if (
    ad.videoType === "youtube" &&
    youtubeId
  ) {
    const params =
      new URLSearchParams({
        autoplay:
          active && isPlaying
            ? "1"
            : "0",

        mute:
          ad.muted !== false
            ? "1"
            : "0",

        controls: "0",
        playsinline: "1",
        rel: "0",
        modestbranding: "1",
        iv_load_policy: "3",
        disablekb: "1",
        fs: "0",
        loop: "1",
        playlist: youtubeId,
        enablejsapi: "1",

        origin:
          typeof window !== "undefined"
            ? window.location.origin
            : "",
      });


    videoContent = (
      <iframe
        key={`${ad.id}-${active}-${isPlaying}`}
        src={`https://www.youtube.com/embed/${youtubeId}?${params.toString()}`}
        title={
          ad.title ||
          "Advertisement"
        }
        aria-label="Advertisement video"
        className="
          pointer-events-none
          absolute
          inset-0
          h-full
          w-full
          border-0
          bg-black
          select-none
        "
        allow="
          autoplay;
          encrypted-media;
          picture-in-picture;
        "
        allowFullScreen={false}
      />
    );
  }


  // ====================================================
  // MP4 AD
  // ====================================================

  else if (
    ad.videoType === "mp4" &&
    ad.videoUrl
  ) {
    videoContent = (
      <video
        key={`${ad.id}-${active}`}
        src={ad.videoUrl}
        poster={ad.videoPoster}
        autoPlay={
          active &&
          ad.autoplay !== false
        }
        muted={
          ad.muted !== false
        }
        playsInline
        loop
        controls={false}
        className="
          absolute
          inset-0
          h-full
          w-full
          object-cover
          select-none
        "
      />
    );
  }


  // ====================================================
  // INVALID VIDEO
  // ====================================================

  else {
    videoContent = (
      <div className="
        absolute
        inset-0
        flex
        items-center
        justify-center
        bg-black
        text-white
      ">
        <span className="
          text-sm
          font-bold
        ">
          Advertisement
        </span>
      </div>
    );
  }


  // ====================================================
  // FINAL SHORTS AD FRAME
  // ====================================================

  return (
    <div
      className="
        relative
        flex
        h-full
        w-full
        items-center
        justify-center
        overflow-hidden
        bg-black
      "
    >

      {/* ==========================================
          EXACT 9:16 FRAME
      ========================================== */}

      <div
        className="
          relative
          aspect-[9/16]
          h-full
          max-h-full
          w-auto
          max-w-full
          overflow-hidden
          bg-black

          lg:h-[92vh]
          lg:max-h-[889px]
          lg:w-auto

          lg:translate-y-[2vh]

          lg:rounded-xl
        "
      >

        {/* ========================================
            VIDEO
        ======================================== */}

        <div
          className="
            absolute
            inset-0
            z-0
            bg-black
          "
        >
          {videoContent}
        </div>


        {/* ========================================
            TEMPLATE OVERLAY
        ======================================== */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            z-20
            overflow-hidden
            select-none
          "
        >
          <Image
            src={templateImage}
            alt=""
            fill
            sizes="
              (max-width: 768px) 100vw,
              420px
            "
            draggable={false}
            className="
              pointer-events-none
              select-none
              object-contain
              object-top
            "
          />
        </div>


        {/* ========================================
            ADVERTISEMENT BADGE
        ======================================== */}

        <div
          className="
            pointer-events-none
            absolute
            left-3
            top-3
            z-30

            rounded-md
            bg-black/70

            px-2.5
            py-1

            text-[9px]
            font-bold
            uppercase
            tracking-wider
            text-white

            backdrop-blur-sm
          "
        >
          Advertisement
        </div>


        {/* ========================================
            AD TITLE
        ======================================== */}

        {ad.title && (
          <div
            className="
              pointer-events-none
              absolute
              bottom-5
              left-4
              right-4
              z-30
              text-white
            "
          >
            <div
              className="
                inline-block
                max-w-[90%]
                rounded-lg
                bg-black/50
                px-3
                py-2
                backdrop-blur-sm
              "
            >
              <p
                className="
                  line-clamp-2
                  text-[13px]
                  font-semibold
                  leading-[18px]
                "
              >
                {ad.title}
              </p>
            </div>
          </div>
        )}


        {/* ========================================
            AD FRAME
        ======================================== */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            z-40
            rounded-xl
            ring-1
            ring-white/5
          "
        />

      </div>
    </div>
  );
}


// ======================================================
// BUILD FEED
// ======================================================

function buildFeed(
  shorts: PublicShort[],
  ads: ShortsVideoAd[]
): FeedItem[] {

  if (!shorts.length) {
    return [];
  }

  // No ads
  if (!ads.length) {
    return shorts.map(
      (short, index) => ({
        kind: "reel",
        data: short,
        reelIndex: index,
      })
    );
  }


  const result: FeedItem[] = [];

  let reelsSinceLastAd = 0;

  let nextAdAfter =
    getRandomInterval();

  let adCounter = 0;


  for (
    let reelIndex = 0;
    reelIndex < shorts.length;
    reelIndex++
  ) {

    const short =
      shorts[reelIndex];


    // Add reel
    result.push({
      kind: "reel",
      data: short,
      reelIndex,
    });


    reelsSinceLastAd++;


    // Add ad after random number of reels
    const shouldInsertAd =
      reelsSinceLastAd >=
        nextAdAfter &&
      reelIndex <
        shorts.length - 1;


    if (shouldInsertAd) {

      const ad =
        ads[
          adCounter %
            ads.length
        ];


      result.push({
        kind: "ad",
        data: ad,
        adIndex: adCounter,
      });


      adCounter++;

      reelsSinceLastAd = 0;

      nextAdAfter =
        getRandomInterval();
    }
  }


  return result;
}


// ======================================================
// MAIN REELS FEED
// ======================================================

export default function ReelsFeed({
  shorts,
  initialIndex = 0,
}: ReelsFeedProps) {

  const containerRef =
    useRef<HTMLDivElement | null>(
      null
    );


  const [ads, setAds] =
    useState<ShortsVideoAd[]>(
      []
    );


  const [feed, setFeed] =
    useState<FeedItem[]>(
      []
    );


  const [activeIndex, setActiveIndex] =
    useState(0);


  // ====================================================
  // LOAD GITHUB ADS
  // ====================================================

  useEffect(() => {

    let mounted = true;


    async function loadAds() {

      try {

        const response =
          await fetch(
            GITHUB_ADS_URL,
            {
              cache: "no-store",
            }
          );


        if (!response.ok) {
          throw new Error(
            `GitHub ads request failed: ${response.status}`
          );
        }


        const data =
          await response.json();


        /*
         * IMPORTANT:
         *
         * Tumhare ads.json me:
         *
         * type = shorts_video
         * active = true
         *
         * bas isi basis par ad lenge.
         *
         * position par dependency nahi hai.
         */

        const shortsAds =
          Array.isArray(data?.ads)
            ? data.ads.filter(
                (
                  ad: ShortsVideoAd
                ) =>
                  ad?.type ===
                    "shorts_video" &&
                  ad?.active === true &&
                  !!ad?.videoUrl
              )
            : [];


        console.log(
          "SHORTS ADS FROM GITHUB:",
          shortsAds
        );


        if (mounted) {
          setAds(
            shortsAds
          );
        }

      } catch (error) {

        console.error(
          "Failed to load Shorts advertisements:",
          error
        );


        if (mounted) {
          setAds([]);
        }
      }
    }


    loadAds();


    return () => {
      mounted = false;
    };

  }, []);


  // ====================================================
  // BUILD FEED
  // ====================================================

  useEffect(() => {

    const newFeed =
      buildFeed(
        shorts,
        ads
      );


    setFeed(
      newFeed
    );

  }, [
    shorts,
    ads,
  ]);


  // ====================================================
  // FIND INITIAL REEL
  // ====================================================

  useEffect(() => {

    if (!feed.length) {
      return;
    }


    const container =
      containerRef.current;


    if (!container) {
      return;
    }


    const targetIndex =
      feed.findIndex(
        (item) =>
          item.kind === "reel" &&
          item.reelIndex ===
            initialIndex
      );


    if (
      targetIndex < 0
    ) {
      return;
    }


    const item =
      container.querySelector(
        `[data-feed-index="${targetIndex}"]`
      ) as HTMLElement | null;


    if (!item) {
      return;
    }


    setActiveIndex(
      targetIndex
    );


    requestAnimationFrame(
      () => {

        container.scrollTo({
          top:
            item.offsetTop,
          behavior:
            "auto",
        });

      }
    );

  }, [
    feed,
    initialIndex,
  ]);


  // ====================================================
  // OBSERVE ACTIVE ITEM
  // ====================================================

  useEffect(() => {

    const container =
      containerRef.current;


    if (!container) {
      return;
    }


    const items =
      Array.from(
        container.querySelectorAll(
          "[data-feed-index]"
        )
      );


    if (!items.length) {
      return;
    }


    const observer =
      new IntersectionObserver(
        (entries) => {

          entries.forEach(
            (entry) => {

              if (
                entry.isIntersecting &&
                entry.intersectionRatio >
                  0.65
              ) {

                const index =
                  Number(
                    (
                      entry.target as HTMLElement
                    ).dataset.feedIndex
                  );


                if (
                  Number.isInteger(
                    index
                  )
                ) {

                  setActiveIndex(
                    index
                  );

                }
              }
            }
          );

        },
        {
          root:
            container,

          threshold:
            [0.65],
        }
      );


    items.forEach(
      (item) =>
        observer.observe(item)
    );


    return () => {
      observer.disconnect();
    };

  }, [
    feed,
  ]);


  // ====================================================
// UPDATE URL + DOCUMENT TITLE FOR ACTIVE REEL
// ====================================================

useEffect(() => {

  if (!feed.length) {
    return;
  }


  const activeItem =
    feed[activeIndex];


  if (
    !activeItem ||
    activeItem.kind !== "reel"
  ) {
    return;
  }


  const reel =
    activeItem.data;


  const newUrl =
    `/reel/${encodeURIComponent(
      reel.id
    )}`;


  // ==================================================
  // UPDATE URL
  // ==================================================

  if (
    window.location.pathname !==
    newUrl
  ) {

    window.history.replaceState(
      null,
      "",
      newUrl
    );

  }


  // ==================================================
  // UPDATE BROWSER TAB TITLE
  // ==================================================

  const title =
    reel.title?.trim()
      ? `${reel.title.trim()} | INFINIA BHARAT NEWS`
      : "INFINIA BHARAT NEWS";


  document.title = title;


}, [
  activeIndex,
  feed,
]);

  // ====================================================
  // EMPTY
  // ====================================================

  if (!shorts.length) {

    return (
      <div
        className="
          flex
          h-full
          w-full
          items-center
          justify-center
          bg-black
          text-white
        "
      >
        No Shorts available.
      </div>
    );
  }


  // ====================================================
  // FEED
  // ====================================================

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

      {feed.map(
        (
          item,
          index
        ) => (

          <div
            key={
              item.kind === "reel"
                ? `reel-${item.data.id}`
                : `ad-${item.data.id}-${item.adIndex}`
            }
            data-feed-index={
              index
            }
            className="
              h-full
              w-full
              shrink-0
              snap-start
            "
          >

            {item.kind ===
            "reel" ? (

              <div
                data-short={
                  item.reelIndex
                }
                className="
                  h-full
                  w-full
                "
              >

                <ShortPlayer
                  short={
                    item.data
                  }
                  active={
                    index ===
                    activeIndex
                  }
                />

              </div>

            ) : (

              <ShortsAdPlayer
                ad={
                  item.data
                }
                active={
                  index ===
                  activeIndex
                }
              />

            )}

          </div>

        )
      )}

    </div>
  );
}