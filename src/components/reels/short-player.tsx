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

import templateImage from "./template.png";
import {
  ThumbsUp,
  Share2,
  Volume2,
  VolumeX,
  Bookmark,
  BookmarkCheck,
  Play,
  Pause,
} from "lucide-react";

interface ShortPlayerProps {
  short: PublicShort;
  active: boolean;
}

export default function ShortPlayer({
  short,
  active,
}: ShortPlayerProps) {
  const [muted, setMuted] =
    useState(false);
    

  const [loaded, setLoaded] =
    useState(false);

  const iframeRef =
  useRef<HTMLIFrameElement | null>(null);
  const [iframeReady, setIframeReady] =
  useState(false);

const pendingCommandRef =
  useRef<"playVideo" | "pauseVideo" | null>(null);

  const [isPlaying, setIsPlaying] =
  useState(active);

const [showPlayButton, setShowPlayButton] =
  useState(false);

const hideTimerRef =
  useRef<ReturnType<typeof setTimeout> | null>(null);
const [bookmarked, setBookmarked] = useState(false);

useEffect(() => {
  if (typeof window === "undefined") return;

  const saved = JSON.parse(
    window.localStorage.getItem("saved-reels") || "[]"
  ) as string[];

  setBookmarked(saved.includes(short.id));
}, [short.id]);

function handleBookmarkToggle() {
  const saved = JSON.parse(
    window.localStorage.getItem("saved-reels") || "[]"
  ) as string[];

  let updated: string[];

  if (saved.includes(short.id)) {
    updated = saved.filter((id) => id !== short.id);
    setBookmarked(false);
  } else {
    updated = [...saved, short.id];
    setBookmarked(true);
  }

  window.localStorage.setItem(
    "saved-reels",
    JSON.stringify(updated)
  );
}

  useEffect(() => {
  if (hideTimerRef.current) {
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = null;
  }

  if (active) {
    setLoaded(true);
    setIsPlaying(true);

    // Active reel start hote hi button dikhao
    setShowPlayButton(true);

    // 10 sec baad hide
    hideTimerRef.current = setTimeout(() => {
      setShowPlayButton(false);
      hideTimerRef.current = null;
    }, 10000);
  } else {
    setIsPlaying(false);
    setShowPlayButton(false);
  }

  return () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };
}, [active]);
function getSavedMuteState() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.localStorage.getItem("reels-muted") === "true"
  );
}
function sendYouTubeCommand(
  command: "playVideo" | "pauseVideo"
) {
  const iframe =
    iframeRef.current;

  if (!iframe) {
    pendingCommandRef.current = command;
    return;
  }

  if (!iframeReady) {
    pendingCommandRef.current = command;
    return;
  }

  iframe.contentWindow?.postMessage(
    JSON.stringify({
      event: "command",
      func: command,
      args: [],
    }),
    "*"
  );
}
useEffect(() => {
  const savedMuted = getSavedMuteState();

  setMuted(savedMuted);

  // iframe ready ho to actual YouTube player ko bhi sync karo
  if (iframeReady) {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({
        event: "command",
        func: savedMuted ? "mute" : "unMute",
        args: [],
      }),
      "*"
    );
  }
}, [short.id, iframeReady]);
function handleMuteToggle() {
  const newMuted = !muted;

  setMuted(newMuted);

  window.localStorage.setItem(
    "reels-muted",
    String(newMuted)
  );

  iframeRef.current?.contentWindow?.postMessage(
    JSON.stringify({
      event: "command",
      func: newMuted
        ? "mute"
        : "unMute",
      args: [],
    }),
    "*"
  );
}

function handlePlayPause() {
  if (!iframeRef.current) {
    return;
  }
  

  // ==========================================
  // PAUSE
  // ==========================================

  if (isPlaying) {
    setIsPlaying(false);

    sendYouTubeCommand(
      "pauseVideo"
    );

    // Pause hone ke baad button hamesha visible
    setShowPlayButton(true);

    // 10 sec wala timer cancel
    if (hideTimerRef.current) {
      clearTimeout(
        hideTimerRef.current
      );

      hideTimerRef.current = null;
    }

    return;
  }

  // ==========================================
  // PLAY
  // ==========================================

  setIsPlaying(true);

  sendYouTubeCommand(
    "playVideo"
  );

  // Play karte hi button visible rakho
  setShowPlayButton(true);

  // Purana timer clear
  if (hideTimerRef.current) {
    clearTimeout(
      hideTimerRef.current
    );

    hideTimerRef.current = null;
  }

  // Dobara 10 sec ka timer
  hideTimerRef.current = setTimeout(() => {
    setShowPlayButton(false);
    hideTimerRef.current = null;
  }, 10000);
}
function handleScreenClick() {
  if (!active) {
    return;
  }

  // Agar pause hai to button already visible rahega
  if (!isPlaying) {
    setShowPlayButton(true);
    return;
  }

  // Playing hai → click karne par button dikhao
  setShowPlayButton(true);

  // Purana timer clear
  if (hideTimerRef.current) {
    clearTimeout(
      hideTimerRef.current
    );

    hideTimerRef.current = null;
  }

  // 10 sec baad dobara hide
  hideTimerRef.current = setTimeout(() => {
    setShowPlayButton(false);
    hideTimerRef.current = null;
  }, 10000);
}

  // ==========================================
  // SHARE
  // ==========================================

  async function handleShare() {
    const shareUrl =
      `${window.location.origin}/reel/${short.id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: short.title,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(
          shareUrl
        );
      }
    } catch {
      // User cancelled
    }
  }

  // ==========================================
  // VIDEO URL
  // ==========================================

  const videoUrl =
  `https://www.youtube.com/embed/${short.id}` +
  `?autoplay=${active ? 1 : 0}` +
  `&mute=0` +
  `&controls=0` +
  `&playsinline=1` +
  `&rel=0` +
  `&modestbranding=1` +
  `&iv_load_policy=3` +
  `&disablekb=1` +
  `&fs=0` +
  `&loop=1` +
  `&playlist=${short.id}` +
  `&enablejsapi=1` +
`&origin=${encodeURIComponent(
  typeof window !== "undefined"
    ? window.location.origin
    : ""
)}`;

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

      {/* ======================================
          EXACT 9:16 SHORTS FRAME
      ====================================== */}

      <div
  onClick={handleScreenClick}
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

        {/* ====================================
            VIDEO
        ==================================== */}

        <div
          className="
            absolute
            inset-0
            z-0
            bg-black
          "
        >
          {loaded ? (
            <iframe
  ref={iframeRef}
  key={short.id}
  src={videoUrl}
  title=""
  aria-label="Video player"

  onLoad={() => {
  setIframeReady(true);

  const savedMuted =
    window.localStorage.getItem("reels-muted") === "true";

  setMuted(savedMuted);

  setTimeout(() => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({
        event: "command",
        func: savedMuted
          ? "mute"
          : "unMute",
        args: [],
      }),
      "*"
    );
  }, 150);

  
}}
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
          ) : (
            <img
              src={short.thumbnail}
              alt=""
              className="
                absolute
                inset-0
                h-full
                w-full
                object-cover
                select-none
              "
            />
          )}
        </div>


       {/* ====================================
    PNG TEMPLATE OVERLAY
==================================== */}

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
    priority
    sizes="(max-width: 768px) 100vw, 50vw"
    draggable={false}
    onContextMenu={(e) => e.preventDefault()}
    className="
      pointer-events-none
      select-none
      object-contain
      object-top
    "
  />
</div>
{/* ====================================
    CENTER PLAY / PAUSE
==================================== */}

{showPlayButton && (
  <button
    type="button"
    onClick={(event) => {
      event.stopPropagation();
      handlePlayPause();
    }}
    aria-label={
      isPlaying
        ? "Pause"
        : "Play"
    }
    className="
      absolute
      left-1/2
      top-1/2
      z-30

      flex
      h-16
      w-16

      -translate-x-1/2
      -translate-y-1/2

      items-center
      justify-center

      rounded-full

      bg-black/50
      text-white

      backdrop-blur-sm

      transition-all
      duration-200

      hover:scale-110
      hover:bg-black/60

      active:scale-95

      sm:h-[68px]
      sm:w-[68px]
    "
  >
    <span
  className="
    flex
    items-center
    justify-center
  "
>
  {isPlaying ? (
    <Pause
      size={30}
      strokeWidth={3}
      className="text-white"
    />
  ) : (
    <Play
      size={30}
      strokeWidth={3}
      fill="currentColor"
      className="ml-0.5 text-white"
    />
  )}
</span>
  </button>
)}

        {/* ====================================
            RIGHT ACTIONS
        ==================================== */}

        <div
          className="
            absolute
            bottom-28
            right-2
            z-30

            flex
            flex-col
            items-center
            gap-4

            text-white

            sm:right-3
            sm:gap-5
          "
        >

          {/* LIKE */}

          <button
  type="button"
  onClick={(event) => {
    event.stopPropagation();
  }}
  aria-label="Like"
  className="
    group
    flex
    flex-col
    items-center
    gap-1

    text-white

    transition-all
    duration-200

    hover:scale-110
    active:scale-90
  "
>
  <span
    className="
      flex
      h-11
      w-11
      items-center
      justify-center

      rounded-full
      bg-black/35
      backdrop-blur-md

      transition-all
      duration-200

      group-hover:bg-white/15
    "
  >
    <ThumbsUp
      size={25}
      strokeWidth={2.2}
      className="
        transition-transform
        duration-200
        group-active:scale-75
      "
    />
  </span>

  <span
    className="
      text-[11px]
      font-semibold
      leading-4
    "
  >
    Like
  </span>
</button>

  {/* SHARE */}
          <button
  type="button"
  onClick={(event) => {
    event.stopPropagation();
    handleShare();
  }}
  aria-label="Share"
  className="
    group
    flex
    flex-col
    items-center
    gap-1

    text-white

    transition-all
    duration-200

    hover:scale-110
    active:scale-90
  "
>
  <span
    className="
      flex
      h-11
      w-11
      items-center
      justify-center

      rounded-full
      bg-black/35
      backdrop-blur-md

      transition-all
      duration-200

      group-hover:bg-white/15
    "
  >
    <Share2
      size={25}
      strokeWidth={2.2}
      className="
        transition-transform
        duration-200
        group-active:scale-75
      "
    />
  </span>

  <span
    className="
      text-[11px]
      font-semibold
      leading-4
    "
  >
    Share
  </span>
</button>

          {/* MUTE */}

          <button
  type="button"
  onClick={(event) => {
    event.stopPropagation();
    handleMuteToggle();
  }}
  aria-label={muted ? "Unmute" : "Mute"}
  className="
    group
    flex
    flex-col
    items-center
    gap-1
    text-white
    transition
    duration-200
    hover:scale-110
    active:scale-95
  "
>
  <span
    className="
      flex
      h-11
      w-11
      items-center
      justify-center
      rounded-full
      bg-black/35
      backdrop-blur-md
      transition-all
      duration-200
      group-hover:bg-white/15
    "
  >
    {muted ? (
      <VolumeX
        size={25}
        strokeWidth={2.2}
      />
    ) : (
      <Volume2
        size={25}
        strokeWidth={2.2}
      />
    )}
  </span>

  <span
    className="
      text-[11px]
      font-semibold
    "
  >
    {muted ? "Unmute" : "Mute"}
  </span>
</button>


          {/* BOOKMARK */}

<button
  type="button"
  onClick={(event) => {
    event.stopPropagation();
    handleBookmarkToggle();
  }}
  aria-label={
    bookmarked
      ? "Remove bookmark"
      : "Bookmark"
  }
  className="
    group
    flex
    flex-col
    items-center
    gap-1

    text-white

    transition-all
    duration-200

    hover:scale-110
    active:scale-90
  "
>
  <span
    className="
      flex
      h-11
      w-11
      items-center
      justify-center

      rounded-full
      bg-black/35
      backdrop-blur-md

      transition-all
      duration-200

      group-hover:bg-white/15
    "
  >
    {bookmarked ? (
      <BookmarkCheck
        size={25}
        strokeWidth={2.2}
        className="
          transition-transform
          duration-200
          group-active:scale-75
        "
      />
    ) : (
      <Bookmark
        size={25}
        strokeWidth={2.2}
        className="
          transition-transform
          duration-200
          group-active:scale-75
        "
      />
    )}
  </span>

  <span
    className="
      text-[11px]
      font-semibold
      leading-4
    "
  >
    {bookmarked ? "Saved" : "Save"}
  </span>
</button>
        </div>


        {/* ====================================
            BOTTOM INFORMATION
        ==================================== */}

        <div
          className="
            absolute
            bottom-5
            left-4
            right-20
            z-30

            text-white

            sm:left-5
            sm:right-24
          "
        >

          {/* CHANNEL */}

          <div
            className="
              mb-3
              flex
              min-w-0
              items-center
              gap-2.5
            "
          >

            {/* LOGO */}

            <a
  href="https://www.instagram.com/infiniabharatnews?igsh=eHptM29kbGV3ZXlw"
  target="_blank"
  rel="noopener noreferrer"
  onClick={(event) => {
    event.stopPropagation();
  }}
  aria-label="Visit Infinia Bharat News on Instagram"
  className="
    flex
    h-9
    w-9
    shrink-0
    items-center
    justify-center
    overflow-hidden
    rounded-full
    border
    border-white/30
    bg-red-600
    transition
    hover:scale-105
    active:scale-95
  "
>
  <img
    src="/logos/logo-light.png"
    alt="Infinia Bharat News"
    className="h-full w-full object-cover"
  />
</a>


            {/* CHANNEL */}

            <div
              className="
                min-w-0
                flex-1
              "
            >
              <p
                className="
                  truncate
                  text-[13px]
                  font-bold
                  leading-4
                "
              >
                Infinia Bharat News
              </p>

              <p
                className="
                  truncate
                  text-[10px]
                  leading-4
                  text-white/60
                "
              >
                @Infinia_Bharat_News
              </p>
            </div>


            {/* FOLLOW */}

            <a
  href="https://www.instagram.com/infiniabharatnews?igsh=eHptM29kbGV3ZXlw"
  target="_blank"
  rel="noopener noreferrer"
  onClick={(event) => {
    event.stopPropagation();
  }}
  className="
    shrink-0
    rounded-full
    bg-white
    px-3
    py-1.5
    text-[11px]
    font-bold
    text-black

    transition
    hover:bg-zinc-200
    active:scale-95
  "
>
  Follow
</a>

          </div>


          {/* TITLE */}

          <h2
            className="
              line-clamp-2
              max-w-[90%]

              text-[14px]
              font-semibold
              leading-[20px]

              sm:text-[15px]
              sm:leading-[21px]
            "
          >
            {short.title}
          </h2>

        </div>


        {/* ====================================
            SUBTLE FRAME
        ==================================== */}

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