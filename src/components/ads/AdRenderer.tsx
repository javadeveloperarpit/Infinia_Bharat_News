"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getAds,
  type BusinessAd,
  type AdsData,
  type AdPosition,
} from "@/services/ads.service";

// ======================================================
// TYPES
// ======================================================

interface AdRendererProps {
  position: AdPosition;
  className?: string;
}

type Device = "desktop" | "mobile";

// ======================================================
// HELPERS
// ======================================================

function isVideoAd(type: AdsData["type"]) {
  return (
    type === "shorts_video" ||
    type === "floating_tv"
  );
}

function isDesktop() {
  if (typeof window === "undefined") {
    return true;
  }

  return window.innerWidth >= 768;
}

// ======================================================
// YOUTUBE URL
// ======================================================

function getYouTubeEmbedUrl(url: string) {
  if (!url?.trim()) return null;

  try {
    const parsed = new URL(url.trim());

    const hostname = parsed.hostname
      .toLowerCase()
      .replace(/^www\./, "");

    let videoId = "";

    if (
      hostname === "youtube.com" ||
      hostname === "m.youtube.com"
    ) {
      videoId =
        parsed.searchParams.get("v") || "";

      if (!videoId) {
        const shorts =
          parsed.pathname.match(
            /^\/shorts\/([^/?]+)/
          );

        if (shorts) {
          videoId = shorts[1];
        }
      }

      if (!videoId) {
        const embed =
          parsed.pathname.match(
            /^\/embed\/([^/?]+)/
          );

        if (embed) {
          videoId = embed[1];
        }
      }
    }

    if (hostname === "youtu.be") {
      videoId =
        parsed.pathname
          .split("/")
          .filter(Boolean)[0] || "";
    }

    if (!videoId) {
      return null;
    }

    return (
      `https://www.youtube.com/embed/${videoId}` +
      `?autoplay=1` +
      `&mute=1` +
      `&controls=1` +
      `&rel=0` +
      `&playsinline=1`
    );
  } catch {
    return null;
  }
}

// ======================================================
// MAIN COMPONENT
// ======================================================

export default function AdRenderer({
  position,
  className = "",
}: AdRendererProps) {
  const [ads, setAds] = useState<BusinessAd[]>([]);
  const [device, setDevice] =
    useState<Device>("desktop");

  const [loading, setLoading] =
    useState(true);

  // ====================================================
  // DEVICE
  // ====================================================

  useEffect(() => {
    function updateDevice() {
      setDevice(
        isDesktop()
          ? "desktop"
          : "mobile"
      );
    }

    updateDevice();

    window.addEventListener(
      "resize",
      updateDevice
    );

    return () => {
      window.removeEventListener(
        "resize",
        updateDevice
      );
    };
  }, []);

  // ====================================================
  // LOAD ADS
  // ====================================================

  useEffect(() => {
    let mounted = true;

    async function loadAds() {
      try {
        setLoading(true);

        const data = await getAds();

        if (!mounted) return;

        setAds(data || []);
      } catch (error) {
        console.error(
          "AD RENDERER LOAD ERROR:",
          error
        );

        if (mounted) {
          setAds([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadAds();

    return () => {
      mounted = false;
    };
  }, []);

  // ====================================================
  // SELECT AD
  // ====================================================

  const selectedAd = useMemo(() => {
    const compatible = ads
      .filter((ad) => {
        // ACTIVE
        if (!ad.active) {
          return false;
        }

        // POSITION
        if (ad.position !== position) {
          return false;
        }

        // MOBILE
        if (
          device === "mobile" &&
          ad.mobileEnabled === false
        ) {
          return false;
        }

        // DESKTOP
        if (
          device === "desktop" &&
          ad.desktopEnabled === false
        ) {
          return false;
        }

        return true;
      })
      .sort(
        (a, b) =>
          (b.priority ?? 1) -
          (a.priority ?? 1)
      );

    return compatible[0] || null;
  }, [
    ads,
    position,
    device,
  ]);

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return null;
  }

  // ====================================================
  // NO AD
  // ====================================================

  if (!selectedAd) {
    return null;
  }

  // ====================================================
  // LAYOUT
  // ====================================================

  const layout =
    selectedAd.layout?.[device] || {
      width:
        device === "desktop"
          ? 160
          : 140,

      height:
        device === "desktop"
          ? 160
          : 140,

      x: 0,
      y: 0,
      scale: 1,
    };

  // ====================================================
  // FLOATING TYPES
  // ====================================================

  const isFloating =
  selectedAd.type === "cube" ||
  selectedAd.type === "floating_tv";

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div
      className={
        isFloating
          ? `pointer-events-none fixed inset-0 z-[99999] ${className}`
          : `relative ${className}`
      }
      data-ad-position={position}
      data-ad-type={selectedAd.type}
    >
      <div
        className={
          isFloating
            ? "pointer-events-none absolute inset-0"
            : "relative"
        }
      >
        <div
          className={
            isFloating
              ? "pointer-events-auto absolute left-1/2 top-1/2"
              : "relative"
          }
          style={{
            width:
              isFloating
                ? layout.width
                : undefined,

            minHeight:
              isFloating
                ? layout.height
                : undefined,

            transform:
              isFloating
                ? `translate(-50%, -50%) ` +
                  `translate(${layout.x || 0}px, ${layout.y || 0}px) ` +
                  `scale(${layout.scale || 1})`
                : undefined,

            transformOrigin:
              "center center",

            zIndex:
              isFloating
                ? 99999
                : undefined,
          }}
        >
          <AdCreative
            ad={selectedAd}
          />
        </div>
      </div>
    </div>
  );
}

// ======================================================
// AD CREATIVE
// ======================================================

function AdCreative({
  ad,
}: {
  ad: AdsData;
}) {
  // ====================================================
  // BANNER
  // ====================================================

  if (ad.type === "banner") {
    return (
      <a
        href={ad.link || "#"}
        target={
          ad.openInNewTab
            ? "_blank"
            : undefined
        }
        rel={
          ad.openInNewTab
            ? "noopener noreferrer"
            : undefined
        }
        className="block overflow-hidden rounded-xl"
      >
        {ad.image ? (
          <img
            src={ad.image}
            alt={
              ad.title ||
              "Advertisement"
            }
            className="block h-auto w-auto max-w-none object-contain"
          />
        ) : (
          <div className="flex h-24 w-72 items-center justify-center bg-zinc-900 text-xs font-bold text-white">
            Advertisement
          </div>
        )}
      </a>
    );
  }

  // ====================================================
  // NATIVE
  // ====================================================

  if (ad.type === "native") {
    return (
      <a
        href={ad.link || "#"}
        target={
          ad.openInNewTab
            ? "_blank"
            : undefined
        }
        rel={
          ad.openInNewTab
            ? "noopener noreferrer"
            : undefined
        }
        className="block w-[360px] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl"
      >
        {ad.image && (
          <img
            src={ad.image}
            alt={
              ad.title ||
              "Sponsored"
            }
            className="h-48 w-full object-cover"
          />
        )}

        <div className="p-4">
          <div className="text-[9px] font-black uppercase tracking-widest text-red-600">
            Sponsored
          </div>

          <div className="mt-1 text-base font-black text-zinc-950">
            {ad.title ||
              "Sponsored Story"}
          </div>
        </div>
      </a>
    );
  }

  // ====================================================
  // POPUP
  // ====================================================

  if (ad.type === "popup") {
    return (
      <div className="relative w-[360px] overflow-hidden rounded-2xl bg-white shadow-2xl">
        {ad.image && (
          <img
            src={ad.image}
            alt={
              ad.title ||
              "Advertisement"
            }
            className="h-56 w-full object-cover"
          />
        )}

        <div className="p-5">
          <div className="text-xl font-black text-zinc-950">
            {ad.title ||
              "Premium Promotion"}
          </div>

          {ad.link && (
            <a
              href={ad.link}
              target={
                ad.openInNewTab
                  ? "_blank"
                  : undefined
              }
              rel="noopener noreferrer"
              className="mt-4 inline-flex rounded-xl bg-red-600 px-5 py-3 text-xs font-black text-white"
            >
              Learn More
            </a>
          )}
        </div>
      </div>
    );
  }

  // ====================================================
  // PAGE TRANSITION
  // ====================================================

  if (
    ad.type ===
    "page_transition"
  ) {
    return (
      <div className="relative flex min-h-[300px] w-[500px] items-center justify-center overflow-hidden rounded-2xl bg-zinc-950 p-8">
        {ad.image && (
          <img
            src={ad.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
        )}

        <div className="relative z-10">
          <div className="text-[10px] font-black uppercase tracking-[0.25em] text-red-500">
            Advertisement
          </div>

          <div className="mt-3 text-xl font-black text-white">
            {ad.title ||
              "Opening promotion"}
          </div>

          <div className="mt-2 text-xs text-zinc-400">
            Preparing destination
          </div>
        </div>
      </div>
    );
  }

  // ====================================================
  // STICKY BOTTOM
  // ====================================================

  if (
    ad.type ===
    "sticky_bottom"
  ) {
    return (
      <div className="flex w-full max-w-2xl items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-3 shadow-2xl">
        {ad.image && (
          <img
            src={ad.image}
            alt=""
            className="h-16 w-20 shrink-0 rounded-xl object-cover"
          />
        )}

        <div className="min-w-0 flex-1">
          <div className="text-[9px] font-black uppercase tracking-widest text-red-600">
            Featured
          </div>

          <div className="mt-1 truncate text-sm font-black text-zinc-950">
            {ad.title ||
              "Featured promotion"}
          </div>
        </div>

        {ad.link && (
          <a
            href={ad.link}
            target={
              ad.openInNewTab
                ? "_blank"
                : undefined
            }
            rel="noopener noreferrer"
            className="shrink-0 rounded-xl bg-red-600 px-4 py-2.5 text-[10px] font-black text-white"
          >
            Open
          </a>
        )}
      </div>
    );
  }

  // ====================================================
  // CUBE
  // ====================================================

  if (ad.type === "cube") {
    const faces =
      ad.cubeFaces || [];

    const transforms = [
      "rotateY(0deg) translateZ(80px)",
      "rotateY(90deg) translateZ(80px)",
      "rotateY(180deg) translateZ(80px)",
      "rotateY(-90deg) translateZ(80px)",
    ];

    return (
      <div
        className="relative"
        style={{
          width:
            ad.width || 160,

          height:
            ad.width || 160,

          perspective:
            "800px",
        }}
      >
        <div
          className="relative h-full w-full"
          style={{
            transformStyle:
              "preserve-3d",

            animation:
              `adCubeSpin ${
                ad.rotationSpeed || 4
              }s linear infinite`,
          }}
        >
          {faces
            .slice(0, 4)
            .map(
              (
                face,
                index
              ) => {
                const size =
                  (ad.width ||
                    160) / 2;

                const transform =
                  transforms[
                    index
                  ].replace(
                    "80px",
                    `${size}px`
                  );

                return (
                  <a
                    key={index}
                    href={
                      face.link ||
                      "#"
                    }
                    target={
                      ad.openInNewTab
                        ? "_blank"
                        : undefined
                    }
                    rel="noopener noreferrer"
                    className="absolute inset-0 overflow-hidden rounded-lg bg-zinc-900 shadow-2xl"
                    style={{
                      transform,
                      backfaceVisibility:
                        "hidden",
                    }}
                  >
                    {face.image && (
                      <img
                        src={
                          face.image
                        }
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                  </a>
                );
              }
            )}
        </div>

        <style jsx>{`
          @keyframes adCubeSpin {
            from {
              transform: rotateY(0deg);
            }

            to {
              transform: rotateY(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  // ====================================================
  // VIDEO ADS
  // ====================================================

  if (isVideoAd(ad.type)) {
    const youtube =
      getYouTubeEmbedUrl(
        ad.videoUrl || ""
      );

    const width =
      ad.type === "floating_tv"
        ? ad.width || 320
        : 360;

    return (
      <div
        className="relative overflow-hidden rounded-2xl bg-black shadow-2xl"
        style={{
          width,
        }}
      >
        {youtube ? (
          <div className="relative aspect-video">
            <iframe
              src={youtube}
              title={
                ad.title ||
                "Advertisement"
              }
              className="absolute inset-0 h-full w-full border-0"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : ad.videoUrl ? (
          <div className="relative aspect-video">
            <video
              src={ad.videoUrl}
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay={
                ad.autoplay ??
                true
              }
              muted={
                ad.muted ??
                true
              }
              loop
              playsInline
              controls
              preload="metadata"
            />
          </div>
        ) : ad.image ? (
          <img
            src={ad.image}
            alt={
              ad.title ||
              "Advertisement"
            }
            className="block h-auto w-full object-contain"
          />
        ) : (
          <div className="flex aspect-video items-center justify-center text-xs font-bold text-zinc-500">
            Advertisement
          </div>
        )}

        <div className="pointer-events-none absolute left-3 top-3 z-20 rounded-md bg-red-600 px-2 py-1 text-[8px] font-black text-white">
          SPONSORED
        </div>
      </div>
    );
  }

  return null;
}

