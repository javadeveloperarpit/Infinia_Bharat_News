"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Volume2,
  VolumeX,
  Maximize,
  ChevronRight,
  Radio,
} from "lucide-react";

import { getLiveTv } from "@/services/live-tv.service";

// ======================================================
// TYPES
// ======================================================

interface LiveTvChannel {
  id: string;
  title: string;
  youtubeUrl: string;
  enabled: boolean;
  order: number;
  logo?: string;
}

// ======================================================
// YOUTUBE ID
// ======================================================

function getYoutubeId(url: string) {
  if (!url) return "";

  try {
    const parsed = new URL(url);

    const hostname = parsed.hostname
      .replace("www.", "")
      .toLowerCase();

    if (
      hostname === "youtube.com" ||
      hostname === "m.youtube.com"
    ) {
      const videoId = parsed.searchParams.get("v");

      if (videoId) return videoId;

      const liveMatch = parsed.pathname.match(
        /\/live\/([^/?]+)/
      );

      if (liveMatch?.[1]) {
        return liveMatch[1];
      }

      const embedMatch = parsed.pathname.match(
        /\/embed\/([^/?]+)/
      );

      if (embedMatch?.[1]) {
        return embedMatch[1];
      }
    }

    if (hostname === "youtu.be") {
      return (
        parsed.pathname
          .split("/")
          .filter(Boolean)[0] || ""
      );
    }
  } catch {
    return "";
  }

  return "";
}

// ======================================================
// PAGE
// ======================================================

export default function LiveTvPage() {
  const [channels, setChannels] =
    useState<LiveTvChannel[]>([]);

  const [activeId, setActiveId] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  // ====================================================
  // SOUND DEFAULT = ON
  // ====================================================

  const [muted, setMuted] =
    useState(false);

  // ====================================================
  // LOAD CHANNELS
  // ====================================================

  useEffect(() => {
    async function loadChannels() {
      try {
        const data = await getLiveTv();

        const activeChannels =
          (data as LiveTvChannel[])
            .filter(
              (channel) =>
                channel.enabled === true
            )
            .sort(
              (a, b) =>
                Number(a.order ?? 0) -
                Number(b.order ?? 0)
            );

        setChannels(activeChannels);

        if (activeChannels.length) {
          setActiveId(
            activeChannels[0].id
          );
        }
      } catch (error) {
        console.error(
          "Live TV Error:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadChannels();
  }, []);

  // ====================================================
  // ACTIVE CHANNEL
  // ====================================================

  const activeChannel = useMemo(
    () =>
      channels.find(
        (channel) =>
          channel.id === activeId
      ) || null,
    [channels, activeId]
  );

  const youtubeId = activeChannel
    ? getYoutubeId(
        activeChannel.youtubeUrl
      )
    : "";

  // ====================================================
  // PLAYER URL
  // ====================================================

  const playerUrl = youtubeId
    ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=${muted ? 1 : 0}&controls=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&disablekb=1&fs=0`
    : "";

  // ====================================================
  // CHANGE CHANNEL
  // ====================================================

  function changeChannel(id: string) {
    setActiveId(id);

    // Keep user's current sound preference.
    // Default preference is ON.
  }

  // ====================================================
  // TOGGLE SOUND
  // ====================================================

  function toggleSound() {
    setMuted((value) => !value);
  }

  // ====================================================
  // FULLSCREEN
  // ====================================================

  function handleFullscreen() {
    const player =
      document.getElementById(
        "live-tv-player"
      );

    if (!player) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      player.requestFullscreen?.();
    }
  }

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f4f4f5]">
        <header className="border-b border-zinc-200 bg-white">
          <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
            <div className="h-10 w-10 animate-pulse bg-zinc-200" />

            <div className="ml-3">
              <div className="h-2.5 w-28 animate-pulse bg-zinc-200" />
              <div className="mt-2 h-5 w-40 animate-pulse bg-zinc-200" />
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="aspect-video w-full animate-pulse bg-zinc-900" />

          <div className="mt-4 h-20 animate-pulse bg-zinc-200" />
        </div>
      </main>
    );
  }

  // ====================================================
  // NO CHANNEL
  // ====================================================

  if (!activeChannel || !youtubeId) {
    return (
      <main className="min-h-screen bg-[#f4f4f5]">
        <header className="border-b border-zinc-200 bg-white">
          <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex h-10 w-10 items-center justify-center border border-zinc-200 bg-white p-1.5">
              <img
                src="/icons/favicon-512x512.png"
                alt="Infinia Bharat News"
                className="h-full w-full object-contain"
              />
            </div>

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-red-600">
                Infinia Bharat News
              </p>

              <h1 className="text-lg font-black leading-none text-zinc-950">
                LIVE TELEVISION
              </h1>
            </div>
          </div>
        </header>

        <div className="flex min-h-[65vh] flex-col items-center justify-center px-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center border border-zinc-200 bg-white shadow-sm">
            <Radio
              size={34}
              className="text-zinc-300"
            />
          </div>

          <div className="mt-5 flex items-center gap-2">
            <span className="h-2 w-2 bg-zinc-400" />

            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
              Broadcast Offline
            </span>
          </div>

          <h2 className="mt-3 text-2xl font-black tracking-tight text-zinc-900">
            Live TV is currently unavailable
          </h2>

          <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
            There is no live broadcast available
            right now. Please check again shortly.
          </p>
        </div>
      </main>
    );
  }

  // ====================================================
  // MAIN
  // ====================================================

  return (
    <main className="min-h-screen bg-[#f4f4f5] text-zinc-900">

      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-[66px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* BRAND */}

          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-zinc-200 bg-white p-1.5">
              <img
                src="/icons/favicon-512x512.png"
                alt="Infinia Bharat News"
                className="h-full w-full object-contain"
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-[9px] font-black uppercase tracking-[0.22em] text-red-600">
                Infinia Bharat News
              </p>

              <h1 className="text-lg font-black leading-tight tracking-tight text-zinc-950 sm:text-xl">
                LIVE TELEVISION
              </h1>
            </div>
          </div>

          {/* ON AIR STATUS */}

          <div className="flex items-center gap-2 border border-red-200 bg-red-50 px-3 py-2 sm:px-4">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping bg-red-500 opacity-60" />
              <span className="relative inline-flex h-2 w-2 bg-red-600" />
            </span>

            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-red-600 sm:text-[10px]">
              ON AIR
            </span>
          </div>
        </div>
      </header>

      {/* ==================================================
          CONTENT
      ================================================== */}

      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_290px]">

          {/* =================================================
              PLAYER
          ================================================= */}

          <section className="min-w-0">

            <div className="overflow-hidden border border-zinc-300 bg-black shadow-[0_8px_30px_rgba(0,0,0,0.14)]">

              <div
                id="live-tv-player"
                className="relative aspect-video w-full overflow-hidden bg-black"
              >

                {/* YOUTUBE */}

                <iframe
                  key={`${activeChannel.id}-${muted}`}
                  src={playerUrl}
                  title={`${activeChannel.title} - Infinia Bharat News Live`}
                  className="absolute inset-0 h-full w-full border-0"
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                />

                {/* =================================================
                    TOP BRAND
                ================================================= */}

                <div className="pointer-events-none absolute left-0 top-0 z-20 flex items-center gap-2 border-b border-r border-white/15 bg-black/90 px-3 py-2.5 sm:px-4">

                  <div className="flex h-7 w-7 shrink-0 items-center justify-center bg-white p-1 sm:h-8 sm:w-8">
                    <img
                      src="/icons/favicon-512x512.png"
                      alt=""
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <div>
                    <p className="text-[12px] font-black leading-none text-white sm:text-[14px]">
                      INFINIA
                    </p>

                    <p className="mt-0.5 text-[9px] font-bold uppercase leading-none tracking-[0.12em] text-white/70 sm:text-[10px]">
                      BHARAT NEWS
                    </p>
                  </div>
                </div>

                {/* =================================================
                    ON AIR BADGE
                ================================================= */}

                <div className="pointer-events-none absolute right-3 top-3 z-20 flex items-center gap-2 bg-red-600 px-3 py-1.5 shadow-lg sm:right-4 sm:top-4">

                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping bg-white opacity-70" />
                    <span className="relative inline-flex h-1.5 w-1.5 bg-white" />
                  </span>

                  <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white sm:text-[10px]">
                    ON AIR
                  </span>
                </div>

                {/* =================================================
                    FRAME
                ================================================= */}

                <div className="pointer-events-none absolute inset-0 z-10 border border-white/10" />

                {/* =================================================
                    BOTTOM CONTROL BAR
                ================================================= */}

                <div className="absolute bottom-0 left-0 right-0 z-30 flex items-end justify-between bg-gradient-to-t from-black/95 via-black/55 to-transparent px-3 pb-3 pt-14 sm:px-4">

                  

                  {/* CONTROLS */}

                  <div className="flex shrink-0 items-center gap-1.5">

                    {/* SOUND */}

                    <button
                      type="button"
                      onClick={toggleSound}
                      className="flex h-9 w-9 items-center justify-center border border-white/20 bg-black/80 text-white transition-all duration-200 hover:border-red-500 hover:bg-red-600"
                      aria-label={
                        muted
                          ? "Turn sound on"
                          : "Mute live TV"
                      }
                      title={
                        muted
                          ? "Turn Sound On"
                          : "Mute"
                      }
                    >
                      {muted ? (
                        <VolumeX size={17} />
                      ) : (
                        <Volume2 size={17} />
                      )}
                    </button>

                    {/* FULLSCREEN */}

                    <button
                      type="button"
                      onClick={handleFullscreen}
                      className="flex h-9 w-9 items-center justify-center border border-white/20 bg-black/80 text-white transition-all duration-200 hover:border-red-500 hover:bg-red-600"
                      aria-label="Enter fullscreen"
                      title="Fullscreen"
                    >
                      <Maximize size={17} />
                    </button>
                  </div>
                </div>
              </div>

              {/* =================================================
                  BROADCAST INFO
              ================================================= */}

              <div className="flex min-h-[72px] items-center justify-between gap-4 border-t border-zinc-800 bg-[#111111] px-4 py-3 sm:px-5">

                <div className="min-w-0">

                  <div className="flex items-center gap-2">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping bg-red-500 opacity-50" />
                      <span className="relative inline-flex h-1.5 w-1.5 bg-red-500" />
                    </span>

                    <span className="text-[9px] font-black uppercase tracking-[0.17em] text-red-500">
                      Live Broadcast
                    </span>
                  </div>

                  <h2 className="mt-1 truncate text-base font-bold text-white sm:text-lg">
                    {activeChannel.title}
                  </h2>
                </div>

                <div className="hidden shrink-0 text-right sm:block">
                  <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-zinc-600">
                    Available Channels
                  </p>

                  <p className="mt-0.5 text-sm font-bold text-zinc-400">
                    {channels.length}
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                MOBILE CHANNELS
            ================================================= */}

            <div className="mt-5 lg:hidden">

              <div className="mb-3 flex items-end justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-red-600">
                    Live Network
                  </p>

                  <h3 className="mt-0.5 text-sm font-black text-zinc-950">
                    Live Channels
                  </h3>
                </div>

                <span className="text-[10px] font-semibold text-zinc-400">
                  {channels.length} available
                </span>
              </div>

              <div className="overflow-hidden border border-zinc-200 bg-white">

                {channels.map(
                  (channel, index) => {
                    const active =
                      channel.id === activeId;

                    return (
                      <button
                        key={channel.id}
                        type="button"
                        onClick={() =>
                          changeChannel(
                            channel.id
                          )
                        }
                        className={`flex w-full items-center gap-3 border-b border-zinc-100 border-l-4 px-4 py-3.5 text-left transition-all duration-200 last:border-b-0 ${
                          active
                            ? "border-l-red-600 bg-red-50"
                            : "border-l-transparent hover:bg-zinc-50"
                        }`}
                      >
                        <span
                          className={`w-5 shrink-0 text-[10px] font-black ${
                            active
                              ? "text-red-600"
                              : "text-zinc-400"
                          }`}
                        >
                          {String(index + 1).padStart(
                            2,
                            "0"
                          )}
                        </span>

                        <span
                          className={`h-1.5 w-1.5 shrink-0 ${
                            active
                              ? "bg-red-600"
                              : "bg-zinc-300"
                          }`}
                        />

                        <span
                          className={`min-w-0 flex-1 truncate text-sm font-bold ${
                            active
                              ? "text-red-700"
                              : "text-zinc-800"
                          }`}
                        >
                          {channel.title}
                        </span>

                        <ChevronRight
                          size={16}
                          className={
                            active
                              ? "text-red-600"
                              : "text-zinc-300"
                          }
                        />
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          </section>

          {/* =================================================
              DESKTOP SIDEBAR
          ================================================= */}

          <aside className="hidden lg:block">

            <div className="sticky top-[86px] overflow-hidden border border-zinc-200 bg-white">

              {/* HEADER */}

              <div className="border-b border-zinc-200 px-4 py-4">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-red-600">
                      Live Network
                    </p>

                    <h3 className="mt-0.5 text-sm font-black text-zinc-950">
                      Live Channels
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 bg-red-50 px-2.5 py-1.5">
                    <span className="h-1.5 w-1.5 bg-red-600" />

                    <span className="text-[9px] font-black text-red-600">
                      {channels.length}
                    </span>
                  </div>
                </div>

                <p className="mt-2 text-[10px] text-zinc-400">
                  Select a channel to start watching
                </p>
              </div>

              {/* CHANNELS */}

              <div className="max-h-[540px] overflow-y-auto">

                {channels.map(
                  (channel, index) => {
                    const active =
                      channel.id === activeId;

                    return (
                      <button
                        key={channel.id}
                        type="button"
                        onClick={() =>
                          changeChannel(
                            channel.id
                          )
                        }
                        className={`group flex w-full items-center gap-3 border-b border-zinc-100 border-l-4 px-4 py-4 text-left transition-all duration-200 last:border-b-0 ${
                          active
                            ? "border-l-red-600 bg-red-50"
                            : "border-l-transparent hover:bg-zinc-50"
                        }`}
                      >

                        {/* NUMBER */}

                        <span
                          className={`w-5 shrink-0 text-[10px] font-black ${
                            active
                              ? "text-red-600"
                              : "text-zinc-400"
                          }`}
                        >
                          {String(index + 1).padStart(
                            2,
                            "0"
                          )}
                        </span>

                        {/* STATUS */}

                        <span className="relative flex h-2 w-2 shrink-0">

                          {active && (
                            <span className="absolute inline-flex h-full w-full animate-ping bg-red-500 opacity-50" />
                          )}

                          <span
                            className={`relative inline-flex h-2 w-2 ${
                              active
                                ? "bg-red-600"
                                : "bg-zinc-300"
                            }`}
                          />
                        </span>

                        {/* TITLE */}

                        <span
                          className={`min-w-0 flex-1 text-sm font-bold leading-5 ${
                            active
                              ? "text-red-700"
                              : "text-zinc-800"
                          }`}
                        >
                          {channel.title}
                        </span>

                        {/* ACTIVE LABEL */}

                        {active && (
                          <span className="hidden shrink-0 bg-red-600 px-1.5 py-1 text-[7px] font-black uppercase tracking-[0.1em] text-white xl:block">
                            ON AIR
                          </span>
                        )}

                        <ChevronRight
                          size={15}
                          className={`shrink-0 transition-all duration-200 ${
                            active
                              ? "text-red-600"
                              : "text-zinc-300 group-hover:translate-x-0.5 group-hover:text-zinc-500"
                          }`}
                        />
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

